(function(global) {
  "use strict";

  let registered = false;

  function requireHandler(handlers, name) {
    const handler = handlers && handlers[name];
    if (typeof handler !== "function") throw new Error("UI-Binding fehlt: " + name);
    return handler;
  }

  function call(handlers, name) {
    const handler = requireHandler(handlers, name);
    return context => handler(...context.args);
  }

  function appCall(applicationActions, domain, action) {
    if (!applicationActions || typeof applicationActions.execute !== "function") throw new Error("Anwendungsschicht fehlt.");
    return context => applicationActions.execute(domain, action, context.args);
  }

  function registerController(controller, responsibility, actions) {
    return global.NKProUiController.registerController(controller, { responsibility, actions });
  }

  function register(options = {}) {
    if (registered) return describe();
    if (!global.NKProUiController) throw new Error("UI-Controller-Modul fehlt.");
    const handlers = options.handlers || global;
    const modules = options.modules || {};
    const applicationActions = modules.applicationActions;

    registerController("application", "Anwendungsweite Speicher- und Reset-Aktionen", {
      "application.save":appCall(applicationActions, "application", "save"), "application.reset":appCall(applicationActions, "application", "reset")
    });
    registerController("navigation", "Arbeitskontext und Tabwechsel ohne Fachlogik", {
      "navigation.switchTab":call(handlers, "switchToTab"), "navigation.openSection":call(handlers, "overviewOpenSection"), "navigation.showLanding":call(handlers, "showLandingPage"),
      "navigation.enterObjectPreparation":context => requireHandler(handlers, "switchToTab")("objekt"),
      "navigation.enterBillingOverview":context => requireHandler(handlers, "switchToTab")("start"),
      "navigation.returnStart":call(handlers, "returnToStartPage")
    });
    registerController("state", "Kontrollierte generische Schreibaktionen auf dem bestehenden Einzelzustand", {
      "state.setNested":appCall(applicationActions, "state", "setNested")
    });
    registerController("object", "Objekt-, Wohnungs- und Mieterstammdaten", {
      "object.addMasterTenancy":appCall(applicationActions, "object", "addMasterTenancy"), "object.applyMasterDataToBilling":appCall(applicationActions, "object", "applyMasterDataToBilling"),
      "object.archiveMasterTenancy":appCall(applicationActions, "object", "archiveMasterTenancy"), "object.restoreMasterTenancy":appCall(applicationActions, "object", "restoreMasterTenancy"),
      "object.setBillingUnitStatus":appCall(applicationActions, "object", "setBillingUnitStatus"), "object.setMasterNested":appCall(applicationActions, "object", "setMasterNested")
    });
    registerController("cost", "Kostenerfassung, Auswahl, Detailzuordnung und Preisdialog", {
      "cost.configureFree":call(handlers, "configureFreeCost"), "cost.setSetting":call(handlers, "setCostSetting"),
      "cost.openPriceEditor":call(handlers, "openCostPriceEditor"), "cost.closePriceEditor":call(handlers, "closeCostPriceEditor"),
      "cost.savePriceFromDialog":call(handlers, "saveCostPriceFromDialog"), "cost.resetPriceFromDialog":call(handlers, "resetCostPriceFromDialog"),
      "cost.openSelectionDialog":call(handlers, "openCostSelectionDialog"), "cost.closeSelectionDialog":call(handlers, "closeCostSelectionDialog"),
      "cost.renderSelectionDialog":call(handlers, "renderCostSelectionDialog"), "cost.createFreeRow":call(handlers, "createFreeCostRow"),
      "cost.deactivateSelected":call(handlers, "deactivateSelectedCosts"), "cost.openColumnInfo":call(handlers, "openCostColumnInfo"),
      "cost.setPageSize":call(handlers, "setCostPageSize"), "cost.toggleAllRows":call(handlers, "toggleAllCostRows"),
      "cost.activateDefaultPrepayments":call(handlers, "activateDefaultPrepayments"), "cost.deactivateAllPrepayments":call(handlers, "deactivateAllPrepayments"),
      "cost.setTenantAllowed":call(handlers, "setCostTenantAllowed"), "cost.activateFromDialog":call(handlers, "activateCostFromDialog"),
      "cost.openTenantDetails":call(handlers, "openCostTenantDetails"), "cost.toggleRowSelection":call(handlers, "toggleCostRowSelection"),
      "cost.toggleAllVisibleRows":call(handlers, "toggleAllVisibleCostRows")
    });
    registerController("billing", "Abrechnungslebenszyklus, Erfassungsaktionen und zentrale Ergebnisdarstellung", {
      "billing.openCurrent":call(handlers, "openCurrentBilling"), "billing.openCreateModal":call(handlers, "openCreateBillingModal"),
      "billing.closeCreateModal":call(handlers, "closeCreateBillingModal"), "billing.createFromModal":call(handlers, "createNewBillingFromModal"),
      "billing.openDeleteModal":call(handlers, "openDeleteBillingModal"), "billing.closeDeleteModal":call(handlers, "closeDeleteBillingModal"),
      "billing.confirmDelete":call(handlers, "confirmDeleteBilling"), "billing.handleDeleteKey":context => requireHandler(handlers, "handleDeleteBillingKey")(context.key),
      "billing.finalize":appCall(applicationActions, "billing", "finalize"), "billing.unlock":appCall(applicationActions, "billing", "unlock"),
      "billing.openLatestYear":call(handlers, "openLatestKnownYear"), "billing.setYear":appCall(applicationActions, "billing", "setYear"),
      "billing.setPeriod":appCall(applicationActions, "billing", "setPeriod"), "billing.resetAllocationInputs":appCall(applicationActions, "billing", "resetAllocationInputs"),
      "billing.setManualInputMode":appCall(applicationActions, "billing", "setManualInputMode"), "billing.setManualExternalValue":appCall(applicationActions, "billing", "setManualExternalValue"),
      "billing.setPrepaymentValue":appCall(applicationActions, "billing", "setPrepaymentValue"), "billing.setPrepaymentAdjustmentSetting":appCall(applicationActions, "billing", "setPrepaymentAdjustmentSetting"),
      "billing.showFinalReport":call(handlers, "showFinalBillingReport"), "billing.showAcceptanceProtocol":call(handlers, "showAcceptanceProtocol")
    });
    registerController("quality", "Prüfinteraktion ohne eigene Abrechnungsberechnung", {
      "quality.jumpToIssue":call(handlers, "jumpToQualityIssue"), "quality.reopenIssue":call(handlers, "reopenQualityIssue"),
      "quality.acknowledgeIssue":call(handlers, "acknowledgeQualityIssue"), "quality.jumpFirstOpen":call(handlers, "jumpToFirstOpenQualityIssue"),
      "quality.showOnlyErrors":call(handlers, "showOnlyQualityErrors"), "quality.render":call(handlers, "renderQuality")
    });
    registerController("meter", "UI-Adapter auf Zählerstammdaten, Messwerte und Messperioden aus AP5", {
      "meter.setWaterValue":appCall(applicationActions, "meter", "setWaterValue"), "meter.setGenericValue":appCall(applicationActions, "meter", "setGenericValue"),
      "meter.setWaterSetting":appCall(applicationActions, "meter", "setWaterSetting")
    });
    registerController("document", "Briefdaten, Dokumentrendering und Druckaktionen aus AP6", {
      "document.setBriefSetting":call(handlers, "setBriefSetting"), "document.printCurrentBrief":call(handlers, "printCurrentBrief"),
      "document.showPrintModeCheck":call(handlers, "showPrintModeCheck"), "document.showAllPrintReady":call(handlers, "showAllLettersPrintReady"),
      "document.copyCurrentBriefText":call(handlers, "copyCurrentBriefText")
    });
    const exportService = modules.exportService;
    if (!exportService) throw new Error("Exportdienst fehlt für UI-Bindings.");
    registerController("export", "Native Anbindung an den Exportdienst aus AP6", {
      "export.downloadCurrentJson":() => exportService.downloadCurrentBillingJson(), "export.downloadFullJson":() => exportService.downloadFullJson(),
      "export.downloadCostsCsv":() => exportService.downloadKostenCsv(), "export.downloadTenantsCsv":() => exportService.downloadMieterCsv(),
      "export.downloadAllocationCsv":() => exportService.downloadUmlageCsv(), "export.downloadFinalReport":() => exportService.downloadFinalBillingReport(),
      "export.downloadBillingPackage":() => exportService.downloadExportPackage(), "export.downloadFullPackage":() => exportService.downloadFullExportPackage(),
      "export.downloadAcceptanceHtml":call(handlers, "downloadAcceptanceProtocolHtml")
    });
    registerController("archive", "Archivansicht, Wiederbearbeitung und archivspezifische Downloads", {
      "archive.openYear":call(handlers, "openArchiveYear"), "archive.showValidation":call(handlers, "showArchiveValidation"),
      "archive.downloadYear":call(handlers, "downloadArchiveYear"), "archive.reopenForRework":call(handlers, "reopenArchiveYearForRework"),
      "archive.currentYear":call(handlers, "archiveCurrentYearOnly"), "archive.downloadFull":call(handlers, "downloadFullArchive"),
      "archive.closeViewer":call(handlers, "closeArchiveViewer")
    });
    registerController("recovery", "Import, Vor-Migrationssicherung, Restore und Rollback", {
      "recovery.importLegacy":context => requireHandler(handlers, "importLegacyBillingFiles")(context.event),
      "recovery.importJson":context => requireHandler(handlers, "importJsonFile")(context.event),
      "recovery.downloadPreMigration":call(handlers, "downloadPreMigrationBackup"), "recovery.restorePreMigration":call(handlers, "restorePreMigrationBackup"),
      "recovery.rollbackLastRestore":call(handlers, "rollbackLastRestore")
    });
    registerController("system", "Diagnose, Release-Audit und rein technische Browseraktionen", {
      "system.runSelfTest":call(handlers, "runAppSelfTest"), "system.renderDiagnostics":call(handlers, "renderDeveloperDiagnostics"),
      "system.downloadDiagnostics":call(handlers, "downloadDeveloperDiagnostics"), "system.checkUpdate":call(handlers, "checkForAppUpdate"),
      "system.showReleaseAudit":call(handlers, "showReleaseAuditReport"), "system.downloadReleaseAudit":call(handlers, "downloadReleaseAuditReport"),
      "system.reload":() => global.location.reload(), "system.print":() => global.print()
    });

    registered = true;
    return describe();
  }

  function describe() {
    return Object.freeze({ registered, controllers:global.NKProUiController ? global.NKProUiController.describe() : Object.freeze([]) });
  }

  global.NKProUiBindings = Object.freeze({ register, describe });
})(globalThis);
