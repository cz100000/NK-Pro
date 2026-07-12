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
    tenant.bemerkung = "Playwright-Persistenztest V99.4.1";
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
  expect(note).toBe("Playwright-Persistenztest V99.4.1");
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
      hasRecovery: !!localStorage.getItem(STORAGE_RECOVERY_KEY)
    };
  });

  expect(recovery.note).toBe("gültiger Rückfallstand");
  expect(recovery.recovered).toBe(true);
  expect(recovery.hasRecovery).toBe(true);
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
  expect(roundtrip.integrity).toBe(true);
  runtime.assertClean();
});
