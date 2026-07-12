"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixtureData } = require("./test-helpers.cjs");

const STORAGE_KEY = "nkpro_browser_v85_qualitaets_cockpit_data";
const PRE_MIGRATION_KEY = STORAGE_KEY + "_pre_migration_backup";

test("Migrationsregistry liefert den vollständigen Pfad und migriert atomar", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const source = clone(state);
    source.meta.dataSchemaVersion = 1;
    delete source.stammdaten;
    const sourceBefore = JSON.stringify(source);
    let backupObservedBeforeMutation = false;
    const transaction = NKProMigration.executeMigrationTransaction(source, migrationModuleOptions({
      beforeMigration:(original, plan) => {
        backupObservedBeforeMutation = currentDataSchemaVersion(original) === 1 && !original.stammdaten && plan.path[0] === "schema-1-to-2";
        return NKProBackupRecovery.createBackupEnvelope(original, backupRecoveryModuleOptions({
          backupType:"preMigrationBackup",
          sourceSchemaVersion:1,
          targetSchemaVersion:5,
          migrationPath:plan.path,
          backupId:"test-registry-backup",
          now:() => "2026-07-12T12:00:00.000Z"
        }));
      }
    }));
    return {
      registryFrozen:Object.isFrozen(NKProMigration.MIGRATION_REGISTRY) && NKProMigration.MIGRATION_REGISTRY.every(Object.isFrozen),
      path:NKProMigration.findMigrationPath(1, 5).map(step => step.id),
      status:transaction.status,
      schema:currentDataSchemaVersion(transaction.data),
      sourceUnchanged:JSON.stringify(source) === sourceBefore,
      backupObservedBeforeMutation,
      backupId:transaction.backup && transaction.backup.metadata.backupId,
      history:(transaction.data.meta.migrationHistory || []).map(item => item.migrationId),
      transactionStatus:transaction.data.meta.lastMigrationTransaction && transaction.data.meta.lastMigrationTransaction.status
    };
  });

  expect(result.registryFrozen).toBe(true);
  expect(result.path).toEqual(["schema-1-to-2", "schema-2-to-4", "schema-4-to-5"]);
  expect(result.status).toBe("migrated");
  expect(result.schema).toBe(5);
  expect(result.sourceUnchanged).toBe(true);
  expect(result.backupObservedBeforeMutation).toBe(true);
  expect(result.backupId).toBe("test-registry-backup");
  expect(result.history).toEqual(expect.arrayContaining(result.path));
  expect(result.transactionStatus).toBe("completed");
  runtime.assertClean();
});

test("Fehlgeschlagene Migration bricht ohne Teiländerung ab", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const source = clone(state);
    source.meta.dataSchemaVersion = 4;
    delete source.meta.partialWrite;
    const before = JSON.stringify(source);
    const failingRegistry = [{
      id:"schema-4-to-5-failing-test",
      from:4,
      to:5,
      description:"Absichtlich fehlerhafter Testschritt",
      migrate(data) {
        data.meta.partialWrite = true;
        throw new Error("Testabbruch");
      }
    }];
    const transaction = NKProMigration.executeMigrationTransaction(source, migrationModuleOptions({ registry:failingRegistry }));
    return {
      status:transaction.status,
      message:transaction.error && transaction.error.message,
      sourceUnchanged:JSON.stringify(source) === before,
      returnedUnchanged:JSON.stringify(transaction.data) === before,
      partialWrite:transaction.data.meta.partialWrite || false,
      schema:currentDataSchemaVersion(transaction.data)
    };
  });

  expect(result.status).toBe("failed");
  expect(result.message).toContain("Testabbruch");
  expect(result.sourceUnchanged).toBe(true);
  expect(result.returnedUnchanged).toBe(true);
  expect(result.partialWrite).toBe(false);
  expect(result.schema).toBe(4);
  runtime.assertClean();
});

test("Vor-Migrationssicherung besitzt unveränderliche Metadaten und erkennt Manipulation", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const source = clone(state);
    source.meta.dataSchemaVersion = 4;
    const envelope = NKProBackupRecovery.createBackupEnvelope(source, backupRecoveryModuleOptions({
      backupType:"preMigrationBackup",
      sourceSchemaVersion:4,
      targetSchemaVersion:5,
      sourceStorageKey:STORAGE_KEY,
      migrationPath:["schema-4-to-5"],
      backupId:"immutable-test-backup",
      now:() => "2026-07-12T13:00:00.000Z"
    }));
    const valid = NKProBackupRecovery.validateBackupEnvelope(envelope, backupRecoveryModuleOptions());
    const restored = NKProBackupRecovery.restoreBackupEnvelope(envelope, backupRecoveryModuleOptions());
    const tampered = clone(envelope);
    tampered.metadata.reason = "nachträglich verändert";
    const tamperedValidation = NKProBackupRecovery.validateBackupEnvelope(tampered, backupRecoveryModuleOptions());
    return {
      frozen:Object.isFrozen(envelope) && Object.isFrozen(envelope.metadata) && Object.isFrozen(envelope.data),
      valid:valid.valid,
      backupId:envelope.metadata.backupId,
      payloadIdentical:JSON.stringify(restored) === JSON.stringify(source),
      tamperedValid:tamperedValidation.valid,
      tamperedErrors:tamperedValidation.errors
    };
  });

  expect(result.frozen).toBe(true);
  expect(result.valid).toBe(true);
  expect(result.backupId).toBe("immutable-test-backup");
  expect(result.payloadIdentical).toBe(true);
  expect(result.tamperedValid).toBe(false);
  expect(result.tamperedErrors.join(" ")).toContain("Metadaten-Prüfsumme");
  runtime.assertClean();
});

test("Anwendungsstart sichert Altdaten vor der Migration extern exportierbar", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  const legacy = loadFixtureData("altdaten-migration.json");
  expect(legacy.meta.dataSchemaVersion).toBe(4);
  await openFreshApp(page, { [STORAGE_KEY]:JSON.stringify(legacy) });

  const result = await page.evaluate(({ preMigrationKey }) => {
    switchToTab("sicherung");
    const raw = localStorage.getItem(preMigrationKey);
    const envelope = raw ? JSON.parse(raw) : null;
    const validation = envelope ? NKProBackupRecovery.validateBackupEnvelope(envelope, backupRecoveryModuleOptions()) : { valid:false };
    return {
      currentSchema:currentDataSchemaVersion(state),
      backupPresent:!!raw,
      backupValid:validation.valid,
      sourceSchema:envelope && envelope.metadata.sourceSchemaVersion,
      targetSchema:envelope && envelope.metadata.targetSchemaVersion,
      backupType:envelope && envelope.metadata.backupType,
      rawSourceSchema:envelope && currentDataSchemaVersion(envelope.data),
      downloadActionVisible:document.querySelectorAll('[data-app-action="download-pre-migration-backup"]').length > 0
    };
  }, { preMigrationKey:PRE_MIGRATION_KEY });

  expect(result).toMatchObject({
    currentSchema:5,
    backupPresent:true,
    backupValid:true,
    sourceSchema:4,
    targetSchema:5,
    backupType:"preMigrationBackup",
    rawSourceSchema:4,
    downloadActionVisible:true
  });
  runtime.assertClean();
});


test("Archivmigration bleibt bei bereits aktuellem Arbeitsstand atomar", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const source = clone(state);
    source.meta.dataSchemaVersion = 5;
    const archiveData = clone(state);
    archiveData.meta.dataSchemaVersion = 4;
    archiveData.jahresArchiv = [];
    delete archiveData.stammdaten;
    source.jahresArchiv = [{ year:"2024", data:archiveData }];
    const before = JSON.stringify(source);
    const transaction = NKProMigration.executeMigrationTransaction(source, migrationModuleOptions({ includeArchives:true }));
    return {
      status:transaction.status,
      rootSchema:currentDataSchemaVersion(transaction.data),
      archiveSchema:currentDataSchemaVersion(transaction.data.jahresArchiv[0].data),
      archiveMigrations:transaction.archiveMigrations,
      sourceUnchanged:JSON.stringify(source) === before,
      archiveHasStammdaten:!!transaction.data.jahresArchiv[0].data.stammdaten
    };
  });

  expect(result.status).toBe("migrated");
  expect(result.rootSchema).toBe(5);
  expect(result.archiveSchema).toBe(5);
  expect(result.archiveMigrations).toHaveLength(1);
  expect(result.sourceUnchanged).toBe(true);
  expect(result.archiveHasStammdaten).toBe(true);
  runtime.assertClean();
});

test("Extern heruntergeladene Sicherung ist über den JSON-Import restorable und rollbackfähig", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const prepared = await page.evaluate(() => {
    const source = clone(state);
    source.meta.dataSchemaVersion = 4;
    source.meta.restoreProbe = "aus-externer-sicherung";
    delete source.stammdaten;
    const envelope = NKProBackupRecovery.createBackupEnvelope(source, backupRecoveryModuleOptions({
      backupType:"preMigrationBackup",
      sourceSchemaVersion:4,
      targetSchemaVersion:5,
      sourceStorageKey:"external-file",
      migrationPath:["schema-4-to-5"],
      backupId:"external-restore-test",
      now:() => "2026-07-12T14:00:00.000Z"
    }));
    return JSON.stringify(envelope);
  });

  page.on("dialog", async dialog => { await dialog.accept(); });
  await page.setInputFiles("#jsonImport", {
    name:"external-restore-test.json",
    mimeType:"application/json",
    buffer:Buffer.from(prepared, "utf8")
  });
  await page.waitForFunction(() => state && state.meta && state.meta.restoreProbe === "aus-externer-sicherung");

  const result = await page.evaluate(() => {
    const checkpoint = readRestoreCheckpointResult();
    return {
      schema:currentDataSchemaVersion(state),
      marker:state.meta.restoreProbe,
      checkpointValid:checkpoint.valid,
      checkpointType:checkpoint.envelope && checkpoint.envelope.metadata.backupType,
      checkpointSchema:checkpoint.envelope && currentDataSchemaVersion(checkpoint.envelope.data)
    };
  });

  expect(result).toMatchObject({
    schema:5,
    marker:"aus-externer-sicherung",
    checkpointValid:true,
    checkpointType:"restoreCheckpoint",
    checkpointSchema:5
  });
  runtime.assertClean();
});
