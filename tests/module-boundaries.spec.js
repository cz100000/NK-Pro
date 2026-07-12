"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("Fach-, Technik-, Start- und Kompatibilitätsmodule sind vor app.js geladen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const scripts = [...document.scripts].map(script => new URL(script.src).pathname.split("/").pop());
    const names = [
      "ui-preferences.js", "state-access.js", "ui-controller.js", "ui-bindings.js", "ui-events.js", "navigation.js", "modal-events.js", "persistence.js", "migration.js", "backup-recovery.js",
      "meter-master.js", "meter-readings.js", "meter-periods.js", "meter-validation.js", "object-standard.js",
      "billing-snapshot.js", "archive.js", "billing-calculation.js", "document-data.js", "document-renderer.js",
      "export-service.js", "ui-table-tools.js", "app-bootstrap.js", "compatibility.js", "default-seed.js", "app.js"
    ];
    const order = names.map(name => scripts.indexOf(name));
    const snapshot = createYearSnapshot();
    const protectedState = protectDataForStorage(clone(state));
    const moduleEntries = {
      persistence:window.NKProPersistence,
      migration:window.NKProMigration,
      archive:window.NKProArchive,
      backupRecovery:window.NKProBackupRecovery,
      meterMaster:window.NKProMeterMaster,
      meterReadings:window.NKProMeterReadings,
      meterPeriods:window.NKProMeterPeriods,
      meterValidation:window.NKProMeterValidation,
      objectStandard:window.NKProObjectStandard,
      billingSnapshot:window.NKProBillingSnapshot,
      billingCalculation:window.NKProBillingCalculation,
      documentData:window.NKProDocumentData,
      documentRenderer:window.NKProDocumentRenderer,
      exportService:window.NKProExportService,
      uiTableTools:window.NKProUiTableTools,
      appBootstrap:window.NKProAppBootstrap,
      compatibilityRegistry:window.NKProCompatibility,
      uiPreferences:window.NKProUiPreferences,
      stateAccess:window.NKProStateAccess,
      uiController:window.NKProUiController,
      uiBindings:window.NKProUiBindings,
      uiEvents:window.NKProUiEvents,
      navigation:window.NKProNavigation,
      modalEvents:window.NKProModalEvents
    };
    return {
      order,
      modules:Object.fromEntries(Object.entries(moduleEntries).map(([key, value]) => [key, !!value])),
      frozen:Object.fromEntries(Object.entries(moduleEntries).map(([key, value]) => [key, Object.isFrozen(value)])),
      startup:{ ok:window.__NKPRO_STARTUP__ && window.__NKPRO_STARTUP__.ok, completed:window.__NKPRO_STARTUP__ && window.__NKPRO_STARTUP__.completed.length },
      registered:(window.__NKPRO_COMPATIBILITY__ || []).map(entry => [entry.moduleName, entry.wrapperCount]),
      wrappers:{
        calculateUmlage:calculateUmlage === window.calculateUmlage && typeof calculateUmlage === "function",
        buildBriefHtml:buildBriefHtml === window.buildBriefHtml && typeof buildBriefHtml === "function",
        downloadFullExportPackage:downloadFullExportPackage === window.downloadFullExportPackage && typeof downloadFullExportPackage === "function"
      },
      compatibility:{
        integrity:validateStoredDataIntegrity(protectedState).valid,
        schema:currentDataSchemaVersion(state),
        bounded:!Object.prototype.hasOwnProperty.call(snapshot.data, "jahresArchiv") &&
          !Object.prototype.hasOwnProperty.call(snapshot.data, "stammdaten") &&
          !Object.prototype.hasOwnProperty.call(snapshot.data, "waterMeterHistory")
      }
    };
  });

  expect(Object.values(result.modules).every(Boolean)).toBe(true);
  expect(Object.values(result.frozen).every(Boolean)).toBe(true);
  expect(result.order.every(index => index >= 0)).toBe(true);
  expect(result.order).toEqual([...result.order].sort((a, b) => a - b));
  expect(result.startup).toEqual({ ok:true, completed:12 });
  expect(result.registered).toEqual([
    ["billingCalculation", 48],
    ["documentData", 26],
    ["documentRenderer", 14],
    ["exportService", 18],
    ["uiTableTools", 6]
  ]);
  expect(result.wrappers).toEqual({ calculateUmlage:true, buildBriefHtml:true, downloadFullExportPackage:true });
  expect(result.compatibility).toEqual({ integrity:true, schema:5, bounded:true });
  runtime.assertClean();
});
