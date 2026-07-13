"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("Fach-, Technik-, Start- und Kompatibilitätsmodule sind vor app.js geladen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const scripts = [...document.scripts].map(script => new URL(script.src).pathname.split("/").pop());
    const names = [
      "ui-preferences.js", "state-access.js", "application-actions.js", "master-data-actions.js", "cost-actions.js", "billing-workflow.js",
      "ui-controller.js", "ui-bindings.js", "ui-events.js", "navigation.js", "modal-events.js", "persistence.js", "migration.js", "backup-recovery.js",
      "meter-master.js", "meter-readings.js", "meter-periods.js", "meter-validation.js", "object-standard.js",
      "billing-snapshot.js", "archive.js", "archive-actions.js", "year-transition-actions.js", "quality-assurance.js", "diagnostics.js", "billing-calculation.js", "document-data.js", "document-renderer.js",
      "export-service.js", "ui-table-tools.js", "app-bootstrap.js", "compatibility.js", "default-seed.js",
      "runtime-diagnostics.js", "app-runtime-config.js", "app-state-persistence.js", "ui-master-data.js",
      "ui-quality.js", "ui-costs.js", "ui-navigation-pages.js", "ui-archive-pages.js", "browser-io.js",
      "ui-metering.js", "ui-billing-allocation.js", "ui-documents.js", "ui-table-actions.js",
      "ui-diagnostics.js", "ui-page-controller.js", "app.js"
    ];
    const order = names.map(name => scripts.indexOf(name));
    const snapshot = window.NKProBillingWorkflow.createSnapshot();
    const protectedState = protectDataForStorage(clone(state));
    const moduleEntries = {
      persistence:window.NKProPersistence,
      migration:window.NKProMigration,
      archive:window.NKProArchive,
      archiveActions:window.NKProArchiveActions,
      yearTransitionActions:window.NKProYearTransitionActions,
      qualityAssurance:window.NKProQualityAssurance,
      diagnostics:window.NKProDiagnostics,
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
      runtimeDiagnostics:window.NKProRuntimeDiagnostics,
      uiPreferences:window.NKProUiPreferences,
      stateAccess:window.NKProStateAccess,
      applicationActions:window.NKProApplicationActions,
      masterDataActions:window.NKProMasterDataActions,
      costActions:window.NKProCostActions,
      billingWorkflow:window.NKProBillingWorkflow,
      uiController:window.NKProUiController,
      uiBindings:window.NKProUiBindings,
      uiEvents:window.NKProUiEvents,
      navigation:window.NKProNavigation,
      modalEvents:window.NKProModalEvents
    };
    const runtimeDiagnostics = window.NKProRuntimeDiagnostics.snapshot();
    return {
      order,
      modules:Object.fromEntries(Object.entries(moduleEntries).map(([key, value]) => [key, !!value])),
      frozen:Object.fromEntries(Object.entries(moduleEntries).map(([key, value]) => [key, Object.isFrozen(value)])),
      startup:{ ok:runtimeDiagnostics.startup && runtimeDiagnostics.startup.ok, completed:runtimeDiagnostics.startup && runtimeDiagnostics.startup.completed.length },
      registered:(runtimeDiagnostics.compatibility || []).map(entry => [entry.moduleName, entry.wrapperCount]),
      removedGlobals:["__V992_AUDIT__", "__NKPRO_UI_ARCHITECTURE__", "__NKPRO_STARTUP__", "__NKPRO_COMPATIBILITY__"].every(name => !(name in window)),
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
  expect(result.startup).toEqual({ ok:true, completed:16 });
  expect(result.removedGlobals).toBe(true);
  expect(result.registered).toEqual([
    ["billingCalculation", 30],
    ["documentData", 22],
    ["documentRenderer", 9],
    ["exportService", 12],
    ["uiTableTools", 1],
    ["archiveActions", 1]
  ]);
  expect(result.wrappers).toEqual({ calculateUmlage:true, buildBriefHtml:true, downloadFullExportPackage:true });
  expect(result.compatibility).toEqual({ integrity:true, schema:5, bounded:true });
  runtime.assertClean();
});
