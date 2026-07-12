"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixtureData } = require("./test-helpers.cjs");

const STORAGE_KEY = "nkpro_browser_v85_qualitaets_cockpit_data";
const PRE_MIGRATION_KEY = STORAGE_KEY + "_pre_migration_backup";

function makeSnapshotReadyInPage() {
  return `(() => {
    state.kostenarten.forEach(cost => {
      if (cost.umlageschluessel === "Verbrauch") {
        cost.gesamtbetrag = 0;
        cost.inNK = "Nein";
      }
    });
    normalizeObjectStandard(state);
  })()`;
}

test("bestehender V99.4.4-Bestand wird verlustfrei in Objektstandard 1 projiziert", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    const before = {
      units:JSON.stringify(state.wohnungen),
      tenants:JSON.stringify(state.mieter),
      costs:JSON.stringify(state.kostenarten),
      unknown:{ marker:"erhalten" }
    };
    state.unbekanntesAltFeld = before.unknown;
    normalizeObjectStandard(state);
    const validation = validateObjectStandard(state);
    return {
      version:state.objektStandard.version,
      objectId:state.objektStandard.objekt.id,
      buildings:state.objektStandard.gebaeude.length,
      units:state.objektStandard.einheiten.length,
      partners:state.objektStandard.partner.length,
      contracts:state.objektStandard.vertraege.length,
      costs:state.objektStandard.kostenarten.length,
      valid:validation.valid,
      legacyUnchanged:before.units === JSON.stringify(state.wohnungen) && before.tenants === JSON.stringify(state.mieter) && before.costs === JSON.stringify(state.kostenarten),
      unknownPreserved:state.unbekanntesAltFeld.marker === "erhalten"
    };
  });
  expect(result).toMatchObject({ version:1, objectId:"OBJ-001", buildings:1, units:7, valid:true, legacyUnchanged:true, unknownPreserved:true });
  expect(result.partners).toBeGreaterThan(0);
  expect(result.contracts).toBeGreaterThan(0);
  expect(result.costs).toBeGreaterThan(0);
  runtime.assertClean();
});

test("Objektstandard-Migration erzeugt vor Änderung eine validierte Sicherung", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  const legacy = loadFixtureData("standardfall.json");
  delete legacy.objektStandard;
  if (!legacy.meta) legacy.meta = {};
  legacy.meta.dataSchemaVersion = 5;
  await openFreshApp(page, { [STORAGE_KEY]:JSON.stringify(legacy) });
  const result = await page.evaluate(preMigrationKey => {
    const raw = localStorage.getItem(preMigrationKey);
    const envelope = raw ? JSON.parse(raw) : null;
    const validation = envelope ? NKProBackupRecovery.validateBackupEnvelope(envelope, backupRecoveryModuleOptions()) : { valid:false };
    return {
      standardVersion:state.objektStandard && state.objektStandard.version,
      backupValid:validation.valid,
      sourceSchema:envelope && envelope.metadata.sourceSchemaVersion,
      targetSchema:envelope && envelope.metadata.targetSchemaVersion,
      path:envelope && envelope.metadata.migrationPath,
      sourceHadStandard:!!(envelope && envelope.data && envelope.data.objektStandard)
    };
  }, PRE_MIGRATION_KEY);
  expect(result.standardVersion).toBe(1);
  expect(result.backupValid).toBe(true);
  expect(result.sourceSchema).toBe(5);
  expect(result.targetSchema).toBe(5);
  expect(result.path.join(" ")).toContain("object-standard-v1");
  expect(result.sourceHadStandard).toBe(false);
  runtime.assertClean();
});

test("Stromzähler-Dummy bleibt gespeichert und vollständig aus der Abrechnung ausgeschlossen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    const meter = addElectricityDummyMeter({
      bezeichnung:"Allgemeinstrom Kontrollzähler",
      zaehlernummer:"EL-DUMMY-001",
      einheit:"kWh",
      standortbeschreibung:"Keller Hausanschluss",
      einheitId:"W000.UG"
    });
    const validation = validateObjectStandard(state);
    const billingMeters = NKProObjectStandard.billingRelevantMeters(state.objektStandard);
    const before = JSON.stringify(state.objektStandard.zaehler.find(row => row.meterId === meter.meterId));
    const restored = JSON.parse(JSON.stringify(state));
    normalizeObjectStandard(restored);
    const after = JSON.stringify(restored.objektStandard.zaehler.find(row => row.meterId === meter.meterId));
    return {
      meter,
      valid:validation.valid,
      excluded:!billingMeters.some(row => row.meterId === meter.meterId),
      preserved:before === after
    };
  });
  expect(result.meter).toMatchObject({ meterType:"electricity-dummy", abrechnungsrelevant:false, billingRole:"excluded", einheit:"kWh" });
  expect(result.valid).toBe(true);
  expect(result.excluded).toBe(true);
  expect(result.preserved).toBe(true);
  runtime.assertClean();
});

test("gültiger Snapshot ist eindeutig, unveränderlich, reproduzierbar und gegen Stammdatenänderung isoliert", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    state.kostenarten.forEach(cost => {
      if (cost.umlageschluessel === "Verbrauch") { cost.gesamtbetrag = 0; cost.inNK = "Nein"; }
    });
    normalizeObjectStandard(state);
    const first = createYearSnapshot();
    const firstValidation = validateBillingSnapshot(first);
    const capturedName = first.data.mieter[0].name;
    state.mieter[0].name = "Nachträglich geändert";
    state.stammdaten.mieter[0].name = "Nachträglich geändert";
    normalizeObjectStandard(state);
    const second = createYearSnapshot();
    return {
      firstValid:firstValidation.valid,
      frozen:Object.isFrozen(first) && Object.isFrozen(first.data) && Object.isFrozen(first.data.objektStandard),
      unique:first.snapshotId !== second.snapshotId,
      oldName:first.data.mieter[0].name,
      capturedName,
      currentName:state.mieter[0].name,
      checksum:first.integrity.checksum,
      objectVersion:first.objectStandardVersion,
      schema:first.dataSchemaVersion,
      contract:first.dataLayerContractVersion
    };
  });
  expect(result.firstValid).toBe(true);
  expect(result.frozen).toBe(true);
  expect(result.unique).toBe(true);
  expect(result.oldName).toBe(result.capturedName);
  expect(result.currentName).toBe("Nachträglich geändert");
  expect(result.checksum).toMatch(/^[0-9a-f]{8}$/);
  expect(result).toMatchObject({ objectVersion:1, schema:5, contract:1 });
  runtime.assertClean();
});

test("kritische Fehler verhindern Snapshot-Erstellung strukturiert", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    normalizeObjectStandard(state);
    state.meta.abrechnungsbeginn = "2025-12-31";
    state.meta.abrechnungsende = "2025-01-01";
    const validation = validateBillingReadiness(state);
    let message = "";
    let codes = [];
    try { createYearSnapshot(); } catch (error) {
      message = error.message;
      codes = error.validation ? error.validation.errors.map(item => item.code) : [];
    }
    return { valid:validation.valid, validationCodes:validation.errors.map(item => item.code), message, codes };
  });
  expect(result.valid).toBe(false);
  expect(result.validationCodes).toContain("BILLING_PERIOD_REVERSED");
  expect(result.message).toContain("kritischer Validierungsfehler");
  expect(result.codes).toContain("BILLING_PERIOD_REVERSED");
  runtime.assertClean();
});

test("Snapshot-Integrität erkennt Manipulation und Dummy taucht nie in der Zählerauswahl auf", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    state.kostenarten.forEach(cost => {
      if (cost.umlageschluessel === "Verbrauch") { cost.gesamtbetrag = 0; cost.inNK = "Nein"; }
    });
    const dummy = addElectricityDummyMeter({ bezeichnung:"Dummy", zaehlernummer:"D-1" });
    const snapshot = createYearSnapshot();
    const valid = validateBillingSnapshot(snapshot);
    const tampered = clone(snapshot);
    tampered.summary.saldo = num(tampered.summary.saldo) + 1;
    const tamperedValidation = validateBillingSnapshot(tampered);
    return {
      valid:valid.valid,
      dummyExcluded:snapshot.meterSelection.excluded.includes(dummy.meterId),
      dummyIncluded:snapshot.meterSelection.included.includes(dummy.meterId),
      tamperedValid:tamperedValidation.valid,
      tamperedCodes:tamperedValidation.errors.map(item => item.code)
    };
  });
  expect(result.valid).toBe(true);
  expect(result.dummyExcluded).toBe(true);
  expect(result.dummyIncluded).toBe(false);
  expect(result.tamperedValid).toBe(false);
  expect(result.tamperedCodes).toContain("SNAPSHOT_CHECKSUM_INVALID");
  runtime.assertClean();
});

test("historische Archive werden ohne fachliche Umschreibung als Legacy-Teilstand markiert", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    const original = clone(SEED.jahresArchiv[0]);
    delete original.snapshotFormat;
    delete original.snapshotStatus;
    const originalData = JSON.stringify(original.data);
    const prepared = prepareArchiveItemForUse(original);
    return {
      status:prepared.snapshotStatus,
      completeness:prepared.snapshotCompleteness,
      hasNotice:!!prepared.legacySnapshotNotice,
      corePreserved:JSON.stringify(prepared.data.wohnungen) === JSON.stringify(original.data.wohnungen) && JSON.stringify(prepared.data.mieter) === JSON.stringify(original.data.mieter),
      noNestedArchive:!Object.prototype.hasOwnProperty.call(prepared.data, "jahresArchiv")
    };
  });
  expect(result).toMatchObject({ status:"legacy-partial", completeness:"historical-not-fully-reconstructable", hasNotice:true, corePreserved:true, noNestedArchive:true });
  runtime.assertClean();
});

test("Abrechnungssnapshot und Stromzähler-Dummy bleiben über Sicherung und Restore vollständig erhalten", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    state.kostenarten.forEach(cost => {
      if (cost.umlageschluessel === "Verbrauch") { cost.gesamtbetrag = 0; cost.inNK = "Nein"; }
    });
    const dummy = addElectricityDummyMeter({
      bezeichnung:"Restore-Dummy",
      zaehlernummer:"RESTORE-EL-1",
      einheit:"kWh",
      standortbeschreibung:"Technikraum"
    });
    const snapshot = createYearSnapshot();
    state.jahresArchiv = [snapshot];
    const envelope = NKProBackupRecovery.createBackupEnvelope(state, backupRecoveryModuleOptions({
      backupType:"fullBackup",
      sourceSchemaVersion:currentDataSchemaVersion(state),
      targetSchemaVersion:DATA_SCHEMA_VERSION,
      sourceStorageKey:STORAGE_KEY,
      reason:"Snapshot-Restore-Regression"
    }));
    const envelopeValidation = NKProBackupRecovery.validateBackupEnvelope(envelope, backupRecoveryModuleOptions());
    const restored = NKProBackupRecovery.restoreBackupEnvelope(envelope, backupRecoveryModuleOptions({
      validateData:data => validateMigrationData(data, { phase:"restoreCurrent" })
    }));
    const restoredSnapshot = restored.jahresArchiv[0];
    const snapshotValidation = validateBillingSnapshot(restoredSnapshot);
    const restoredDummy = restoredSnapshot.data.objektStandard.zaehler.find(row => row.meterId === dummy.meterId);
    return {
      envelopeValid:envelopeValidation.valid,
      snapshotValid:snapshotValidation.valid,
      snapshotIdPreserved:restoredSnapshot.snapshotId === snapshot.snapshotId,
      checksumPreserved:restoredSnapshot.integrity.checksum === snapshot.integrity.checksum,
      dummyPreserved:!!restoredDummy,
      dummyExcluded:restoredSnapshot.meterSelection.excluded.includes(dummy.meterId) && !restoredSnapshot.meterSelection.included.includes(dummy.meterId),
      dummyRole:restoredDummy && restoredDummy.billingRole,
      dummyRelevant:restoredDummy && restoredDummy.abrechnungsrelevant
    };
  });
  expect(result).toEqual({
    envelopeValid:true,
    snapshotValid:true,
    snapshotIdPreserved:true,
    checksumPreserved:true,
    dummyPreserved:true,
    dummyExcluded:true,
    dummyRole:"excluded",
    dummyRelevant:false
  });
  runtime.assertClean();
});
