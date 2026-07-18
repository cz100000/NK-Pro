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

  function applicationValue(execution) {
    return execution && Object.prototype.hasOwnProperty.call(execution, "value") ? execution.value : execution;
  }

  function presentApplicationResult(handlers, result) {
    if (!result || typeof result !== "object") return result;
    if (result.message) requireHandler(handlers, "alert")(result.message);
    if (result.targetTab) requireHandler(handlers, "switchToTab")(result.targetTab);
    return result;
  }

  function presentingAppCall(applicationActions, domain, action, handlers) {
    if (!applicationActions || typeof applicationActions.execute !== "function") throw new Error("Anwendungsschicht fehlt.");
    return context => {
      const execution = applicationActions.execute(domain, action, context.args);
      presentApplicationResult(handlers, applicationValue(execution));
      return execution;
    };
  }

  function interactiveAppCall(applicationActions, domain, action, handlers) {
    if (!applicationActions || typeof applicationActions.execute !== "function") throw new Error("Anwendungsschicht fehlt.");
    return context => {
      const baseArgs = Array.isArray(context.args) ? context.args.slice() : [];
      const interaction = {};
      let execution = applicationActions.execute(domain, action, baseArgs);
      let result = applicationValue(execution);
      let guard = 0;
      while (result && guard < 4 && (result.requiresConfirmation || result.requiresPrompt)) {
        guard += 1;
        if (result.requiresConfirmation) {
          if (!requireHandler(handlers, "confirm")(result.confirmationMessage || "Aktion ausführen?")) return execution;
          interaction.confirmed = true;
        } else if (result.requiresPrompt) {
          const entered = requireHandler(handlers, "prompt")(result.promptMessage || "Bestätigung eingeben:");
          if (entered === null) return execution;
          interaction.confirmationCode = entered;
        }
        execution = applicationActions.execute(domain, action, baseArgs.concat([Object.assign({}, interaction)]));
        result = applicationValue(execution);
      }
      presentApplicationResult(handlers, result);
      return execution;
    };
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
      "navigation.enterObjectPreparation":context => requireHandler(handlers, "switchToTab")("objektuebersicht"),
      "navigation.enterBillingOverview":context => requireHandler(handlers, "switchToTab")("start"),
      "navigation.returnStart":call(handlers, "returnToStartPage")
    });
    registerController("state", "Kontrollierte generische Schreibaktionen auf dem bestehenden Einzelzustand", {
      "state.setNested":appCall(applicationActions, "state", "setNested")
    });
    registerController("object", "Objekt-, Wohnungs- und Mieterstammdaten", {
      "object.addMasterTenancy":appCall(applicationActions, "object", "addMasterTenancy"), "object.applyMasterDataToBilling":interactiveAppCall(applicationActions, "object", "applyMasterDataToBilling", handlers),
      "object.archiveMasterTenancy":interactiveAppCall(applicationActions, "object", "archiveMasterTenancy", handlers), "object.restoreMasterTenancy":appCall(applicationActions, "object", "restoreMasterTenancy"),
      "object.setBillingUnitStatus":appCall(applicationActions, "object", "setBillingUnitStatus"), "object.setMasterNested":appCall(applicationActions, "object", "setMasterNested")
    });
    registerController("billingTenant", "Reine Suche, Filterung, Sortierung und Lesedetails der Abrechnungs-Mietverhältnisse", {
      "billingTenant.setSearch":call(handlers, "billingTenantSetSearch"), "billingTenant.setFilter":call(handlers, "billingTenantSetFilter"),
      "billingTenant.reset":call(handlers, "billingTenantReset"), "billingTenant.toggleDetail":call(handlers, "billingTenantToggleDetail"),
      "billingTenant.sort":call(handlers, "billingTenantSort")
    });
    registerController("cost", "Kostenerfassung, Auswahl, Detailzuordnung und Preisdialog", {
      "cost.configureFree":presentingAppCall(applicationActions, "cost", "configureFree", handlers), "cost.setSetting":appCall(applicationActions, "cost", "setSetting"),
      "cost.openPriceEditor":call(handlers, "openCostPriceEditor"), "cost.closePriceEditor":call(handlers, "closeCostPriceEditor"),
      "cost.savePriceFromDialog":call(handlers, "saveCostPriceFromDialog"), "cost.resetPriceFromDialog":call(handlers, "resetCostPriceFromDialog"),
      "cost.openSelectionDialog":call(handlers, "openCostSelectionDialog"), "cost.closeSelectionDialog":call(handlers, "closeCostSelectionDialog"),
      "cost.renderSelectionDialog":call(handlers, "renderCostSelectionDialog"), "cost.createFreeRow":call(handlers, "createFreeCostRow"),
      "cost.deactivateSelected":call(handlers, "deactivateSelectedCosts"), "cost.openColumnInfo":call(handlers, "openCostColumnInfo"),
      "cost.setPageSize":call(handlers, "setCostPageSize"), "cost.toggleAllRows":call(handlers, "toggleAllCostRows"),
      "cost.activateDefaultPrepayments":appCall(applicationActions, "cost", "activateDefaultPrepayments"), "cost.deactivateAllPrepayments":appCall(applicationActions, "cost", "deactivateAllPrepayments"),
      "cost.setTenantAllowed":appCall(applicationActions, "cost", "setTenantAllowed"), "cost.activateFromDialog":call(handlers, "activateCostFromDialog"),
      "cost.openTenantDetails":call(handlers, "openCostTenantDetails"), "cost.toggleRowSelection":call(handlers, "toggleCostRowSelection"),
      "cost.toggleAllVisibleRows":call(handlers, "toggleAllVisibleCostRows"),
      "cost.prepaymentSetSearch":call(handlers, "prepaymentSetSearch"), "cost.prepaymentSetFilter":call(handlers, "prepaymentSetFilter"),
      "cost.prepaymentReset":call(handlers, "prepaymentReset"), "cost.prepaymentSort":call(handlers, "prepaymentSort"),
      "cost.prepaymentSetTenantValue":call(handlers, "prepaymentSetTenantValue")
    });
    registerController("billing", "Abrechnungslebenszyklus, Erfassungsaktionen und zentrale Ergebnisdarstellung", {
      "billing.openCurrent":call(handlers, "openCurrentBilling"), "billing.openCurrentEdit":call(handlers, "openCurrentBillingForEdit"), "billing.openCurrentView":call(handlers, "openCurrentBillingForView"),
      "billing.switchToEdit":call(handlers, "switchCurrentBillingToEdit"), "billing.closeContext":call(handlers, "closeBillingContext"), "billing.openCreateModal":call(handlers, "openCreateBillingModal"),
      "billing.closeCreateModal":call(handlers, "closeCreateBillingModal"), "billing.createFromModal":call(handlers, "createNewBillingFromModal"),
      "billing.openDeleteModal":call(handlers, "openDeleteBillingModal"), "billing.closeDeleteModal":call(handlers, "closeDeleteBillingModal"),
      "billing.confirmDelete":call(handlers, "confirmDeleteBilling"), "billing.handleDeleteKey":context => requireHandler(handlers, "handleDeleteBillingKey")(context.key),
      "billing.finalize":interactiveAppCall(applicationActions, "billing", "finalize", handlers), "billing.unlock":interactiveAppCall(applicationActions, "billing", "unlock", handlers),
      "billing.openLatestYear":call(handlers, "openLatestKnownYear"), "billing.setYear":appCall(applicationActions, "billing", "setYear"),
      "billing.setPeriod":appCall(applicationActions, "billing", "setPeriod"), "billing.syncPeriodYear":appCall(applicationActions, "billing", "syncPeriodYear"), "billing.resetAllocationInputs":interactiveAppCall(applicationActions, "billing", "resetAllocationInputs", handlers),
      "billing.setManualInputMode":interactiveAppCall(applicationActions, "billing", "setManualInputMode", handlers), "billing.setManualExternalValue":appCall(applicationActions, "billing", "setManualExternalValue"),
      "billing.setPrepaymentValue":appCall(applicationActions, "billing", "setPrepaymentValue"), "billing.setPrepaymentAdjustmentSetting":appCall(applicationActions, "billing", "setPrepaymentAdjustmentSetting"),
      "billing.showFinalReport":call(handlers, "showFinalBillingReport"), "billing.showAcceptanceProtocol":call(handlers, "showAcceptanceProtocol")
    });
    registerController("quality", "Zentrale Prüfinteraktion ohne parallele Abrechnungsberechnung", {
      "quality.jumpToIssue":call(handlers, "jumpToQualityIssue"), "quality.reopenIssue":call(handlers, "reopenQualityIssue"),
      "quality.acknowledgeIssue":call(handlers, "acknowledgeQualityIssue"), "quality.jumpFirstOpen":call(handlers, "jumpToFirstOpenQualityIssue"),
      "quality.showOnlyErrors":call(handlers, "showOnlyQualityErrors"), "quality.render":call(handlers, "renderQuality"),
      "quality.setFilter":call(handlers, "qualitySetFilter"), "quality.openDetail":call(handlers, "openQualityDetail"),
      "quality.confirmIssue":call(handlers, "saveQualityConfirmation"), "quality.markNotApplicable":call(handlers, "markQualityNotApplicable"),
      "quality.openPageIssues":call(handlers, "openPageQualityIssues")
    });
    registerController("meter", "UI-Adapter auf Zählerstammdaten, Messwerte und Messperioden aus AP5", {
      "meter.previewWaterValue":context => requireHandler(handlers, "updateWaterMeterPreview")(context.element),
      "meter.previewGenericValue":context => requireHandler(handlers, "updateGenericMeterPreview")(context.element),
      "meter.setWaterValue":appCall(applicationActions, "meter", "setWaterValue"), "meter.setGenericValue":appCall(applicationActions, "meter", "setGenericValue"),
      "meter.setWaterSetting":appCall(applicationActions, "meter", "setWaterSetting")
    });
    registerController("document", "Briefdaten, Dokumentrendering und Druckaktionen aus AP6", {
      "document.setBriefSetting":call(handlers, "setBriefSetting"), "document.printCurrentBrief":call(handlers, "printCurrentBrief"),
      "document.showPrintModeCheck":call(handlers, "showPrintModeCheck"), "document.showAllPrintReady":call(handlers, "showAllLettersPrintReady"),
      "document.copyCurrentBriefText":call(handlers, "copyCurrentBriefText"), "document.previewZoomIn":call(handlers, "previewZoomIn"),
      "document.previewZoomOut":call(handlers, "previewZoomOut"), "document.previewFitPage":call(handlers, "previewFitPage"),
      "document.previewFitWidth":call(handlers, "previewFitWidth"), "document.refreshBrief":call(handlers, "refreshBrief")
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
      "archive.downloadYear":call(handlers, "downloadArchiveYear"), "archive.reopenForRework":call(handlers, "openArchiveForCorrection"),
      "archive.currentYear":interactiveAppCall(applicationActions, "archive", "currentYear", handlers), "archive.downloadFull":call(handlers, "downloadFullArchive"),
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
