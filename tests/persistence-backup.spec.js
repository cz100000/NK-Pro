"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, stableStateSnapshot } = require("./test-helpers.cjs");

test("Speichern und erneutes Laden erhalten den Datenstand samt Prüfsumme", async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  const runtime1 = attachRuntimeGuards(page1);
  await openFreshApp(page1);

  const saved = await page1.evaluate(() => {
    const tenant = state.mieter.find(item => item.id === "M001");
    tenant.bemerkung = "Playwright-Persistenztest V99.4.6";
    const ok = saveData();
    const stored = readStoredDataResult(STORAGE_KEY);
    return {
      ok,
      key: STORAGE_KEY,
      integrityValid: stored.valid,
      protected: stored.integrity && stored.integrity.protected,
      entries: localStorage.__entries()
    };
  });
  expect(saved.ok).toBe(true);
  expect(saved.integrityValid).toBe(true);
  expect(saved.protected).toBe(true);
  runtime1.assertClean();
  await context1.close();

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  const runtime2 = attachRuntimeGuards(page2);
  await openFreshApp(page2, saved.entries);
  const note = await page2.evaluate(() => state.mieter.find(item => item.id === "M001")?.bemerkung);
  expect(note).toBe("Playwright-Persistenztest V99.4.6");
  runtime2.assertClean();
  await context2.close();
});

test("Beschädigte Hauptdaten werden aus dem letzten gültigen Rückfallstand geladen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const recovery = await page.evaluate(() => {
    state.mieter.find(item => item.id === "M001").bemerkung = "gültiger Rückfallstand";
    saveData();
    state.mieter.find(item => item.id === "M001").bemerkung = "neuer Hauptstand";
    saveData();
    localStorage.setItem(STORAGE_KEY, "{beschädigt");
    const loaded = loadData();
    return {
      note: loaded.mieter.find(item => item.id === "M001")?.bemerkung,
      recovered: !!(loaded.meta && loaded.meta.loadedFromIntegrityRecovery),
      hasRecovery: !!localStorage.getItem(STORAGE_RECOVERY_KEY),
      recoveryRole: loaded.meta && loaded.meta.storageRole,
      recoveryProtected: readStoredDataResult(STORAGE_RECOVERY_KEY).valid
    };
  });

  expect(recovery.note).toBe("gültiger Rückfallstand");
  expect(recovery.recovered).toBe(true);
  expect(recovery.hasRecovery).toBe(true);
  expect(recovery.recoveryRole).toBe("recovery");
  expect(recovery.recoveryProtected).toBe(true);
  runtime.assertClean();
});

test("Archiv-Snapshots besitzen feste Grenzen und bleiben idempotent", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const fresh = createYearSnapshot();
    const legacy = clone(fresh);
    legacy.data.jahresArchiv = [clone(fresh)];
    legacy.data.stammdaten = clone(state.stammdaten || {});
    legacy.data.waterMeterHistory = clone(state.waterMeterHistory || {});
    legacy.data.meta.backupEvents = [{ type:"full-json", filename:"alt.json" }];
    legacy.data.meta.storageIntegrityChecksum = "ungueltig";
    delete legacy.snapshotFormat;
    delete legacy.snapshotVersion;
    delete legacy.snapshotStatus;
    delete legacy.snapshotCompleteness;
    delete legacy.integrity;

    const once = prepareArchiveItemForUse(legacy);
    const twice = prepareArchiveItemForUse(once);
    const fullBackup = exportSnapshot();
    const bounded = item => !!item && !!item.data &&
      !Object.prototype.hasOwnProperty.call(item.data, "jahresArchiv") &&
      !Object.prototype.hasOwnProperty.call(item.data, "stammdaten") &&
      !Object.prototype.hasOwnProperty.call(item.data, "waterMeterHistory");

    return {
      freshBounded: bounded(fresh),
      migratedBounded: bounded(once),
      noBackupMeta: !Object.prototype.hasOwnProperty.call(once.data.meta, "backupEvents"),
      noStorageMeta: !Object.keys(once.data.meta).some(key => key.startsWith("storageIntegrity")),
      scope: once.snapshotScope,
      boundaryVersion: once.snapshotBoundaryVersion,
      idempotent: JSON.stringify(once) === JSON.stringify(twice),
      fullBackupHasMaster: !!fullBackup.stammdaten,
      fullBackupHasHistory: !!fullBackup.waterMeterHistory,
      fullBackupHasArchive: Array.isArray(fullBackup.jahresArchiv) && fullBackup.jahresArchiv.length > 0,
      fullBackupArchivesBounded: (fullBackup.jahresArchiv || []).every(bounded),
      fullBackupExcludesRecovery: Array.isArray(fullBackup.meta.exportExcludes) && fullBackup.meta.exportExcludes.includes("recovery")
    };
  });

  expect(result).toMatchObject({
    freshBounded: true,
    migratedBounded: true,
    noBackupMeta: true,
    noStorageMeta: true,
    scope: "billingSnapshot",
    boundaryVersion: 1,
    idempotent: true,
    fullBackupHasMaster: true,
    fullBackupHasHistory: true,
    fullBackupHasArchive: true,
    fullBackupArchivesBounded: true,
    fullBackupExcludesRecovery: true
  });
  runtime.assertClean();
});

test("Wiederbearbeitung übernimmt die Abrechnung und behält aktuelle Stammdaten", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    state.stammdaten.snapshotBoundaryTest = "aktueller Objektstandard";
    state.waterMeterHistory.snapshotBoundaryTest = "aktuelle Historie";
    const archiveCount = state.jahresArchiv.length;
    const expectedYear = String(state.jahresArchiv[0].year);
    window.prompt = () => "WIEDERBEARBEITEN";
    reopenArchiveYearForRework(0);
    return {
      masterMarker: state.stammdaten && state.stammdaten.snapshotBoundaryTest,
      historyMarker: state.waterMeterHistory && state.waterMeterHistory.snapshotBoundaryTest,
      archiveCount: state.jahresArchiv.length,
      year: String(state.meta.abrechnungsjahr),
      reopened: !!state.meta.reopenedFromArchiveAt,
      role: state.meta.dataLayerRole
    };
  });

  expect(result.masterMarker).toBe("aktueller Objektstandard");
  expect(result.historyMarker).toBe("aktuelle Historie");
  expect(result.archiveCount).toBeGreaterThan(0);
  expect(result.year).toBeTruthy();
  expect(result.reopened).toBe(true);
  expect(result.role).toBe("workingState");
  runtime.assertClean();
});

test("Aktuelle Abrechnung übersteht JSON-Export-, Validierungs- und Import-Rundlauf", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const before = await stableStateSnapshot(page);

  const roundtrip = await page.evaluate(() => {
    const exported = exportCurrentBillingSnapshot();
    const json = JSON.stringify(exported);
    const parsed = JSON.parse(json);
    const report = importValidationReport(parsed);
    const normalized = normalizeLoadedData(parsed);
    return {
      bytes: new Blob([json]).size,
      report,
      schema: currentDataSchemaVersion(normalized),
      counts: {
        wohnungen: normalized.wohnungen.length,
        mieter: normalized.mieter.length,
        kostenarten: normalized.kostenarten.length,
        archive: normalized.jahresArchiv.length
      },
      exportScope: normalized.meta.exportScope,
      rawHasArchive: Object.prototype.hasOwnProperty.call(exported, "jahresArchiv"),
      rawHasMaster: Object.prototype.hasOwnProperty.call(exported, "stammdaten"),
      rawHasHistory: Object.prototype.hasOwnProperty.call(exported, "waterMeterHistory"),
      snapshotScope: exported.meta.snapshotScope,
      integrity: validateStoredDataIntegrity(protectDataForStorage(normalized)).valid
    };
  });

  expect(roundtrip.bytes).toBeGreaterThan(30_000);
  expect(roundtrip.report.errors || []).toHaveLength(0);
  expect(roundtrip.schema).toBe(5);
  expect(roundtrip.counts).toMatchObject({
    wohnungen: before.wohnungen.length,
    mieter: before.mieter.length,
    kostenarten: before.kostenarten.length,
    archive: 0
  });
  expect(roundtrip.exportScope).toBe("currentBillingOnly");
  expect(roundtrip.rawHasArchive).toBe(false);
  expect(roundtrip.rawHasMaster).toBe(false);
  expect(roundtrip.rawHasHistory).toBe(false);
  expect(roundtrip.snapshotScope).toBe("billingSnapshot");
  expect(roundtrip.integrity).toBe(true);
  runtime.assertClean();
});
