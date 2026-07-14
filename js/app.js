"use strict";

// AP12: Anwendungsstart, Modulverdrahtung und zentrale Orchestrierung.
function configureCoreOrchestrationModules() {
  NK_PRO_MODULES.masterDataActions.configure({
    stateAccess:NK_PRO_MODULES.stateAccess,
    clone, num, ensureUnitIdentityFields, generatedUnitIdForLabel, hasTenantData, ensureTenantContactFields,
    ensureTenantIdentityFields, canonicalUnitIdFor, isArchivedTenant, tenantActiveDaysInCurrentPeriod,
    tenantOpenStatus, normalizeActiveDayValue, periodDaysExact, tenantRelevantForCurrentBilling,
    syncVorauszahlungen:NK_PRO_MODULES.costActions.syncVorauszahlungen, syncUmlageInputs:NK_PRO_MODULES.billingWorkflow.syncUmlageInputs, ensureWaterMeterData, syncKostenartenMieterUmlage:NK_PRO_MODULES.costActions.syncKostenartenMieterUmlage,
    applyWaterMetersToUmlage, updateTenantPrepaymentTotals:NK_PRO_MODULES.costActions.updateTenantPrepaymentTotals, isoDateSerial, hasEnteredMeterValue,
    todayIso, currentYear:() => currentAbrechnungsjahr(), isArchiveViewer
  });
  NK_PRO_MODULES.costActions.configure({
    stateAccess:NK_PRO_MODULES.stateAccess,
    num, normalizeManualUmlageValue, tenantRowsWithIndex, tenantIdForUmlage, activeCostRowsForMatrix,
    totalVorauszahlungForTenant, getCostGroupOptions:() => COST_GROUP_OPTIONS,
    costExclusionOptions:COST_EXCLUSION_OPTIONS, costExclusionFull:COST_EXCLUSION_FULL,
    umlageManual:UMLAGE_MANUAL
  });
  NK_PRO_MODULES.archiveActions.configure({
    stateAccess:NK_PRO_MODULES.stateAccess, archive:NK_PRO_MODULES.archive,
    billingSnapshot:NK_PRO_MODULES.billingSnapshot, masterDataActions:NK_PRO_MODULES.masterDataActions,
    clone, num, todayIso, nowIso:() => new Date().toISOString(), archiveOptions:archiveModuleOptions,
    validateBillingSnapshot, canonicalUnitIdFor, hasTenantData, dateDe, archiveDataSource,
    normalizeLegacyData, ensureWaterMeterHistory, defaultWaterMeterHistory:() => DEFAULT_WATER_METER_HISTORY,
    errorMessage, createSnapshot:() => NK_PRO_MODULES.billingWorkflow.createSnapshot(),
    currentYear:() => currentAbrechnungsjahr(), isArchiveViewer, seed:() => SEED,
    generatedUnitIdForLabel, appVersion:APP_VERSION, dataSchemaVersion:DATA_SCHEMA_VERSION,
    dataLayerContractVersion:DATA_LAYER_CONTRACT_VERSION, snapshotScope:ARCHIVE_SNAPSHOT_SCOPE,
    umlageManual:UMLAGE_MANUAL, copyWorkingOperationalMeta,
    clearFinalization:data => NK_PRO_MODULES.billingWorkflow.clearCurrentBillingFinalization(data)
  });
  NK_PRO_MODULES.qualityAssurance.configure({
    stateAccess:NK_PRO_MODULES.stateAccess, clone, withIsolatedState,
    archiveActions:NK_PRO_MODULES.archiveActions, documentData:NK_PRO_MODULES.documentData
  });
  NK_PRO_MODULES.billingWorkflow.configure({
    stateAccess:NK_PRO_MODULES.stateAccess,
    appVersion:APP_VERSION, umlageManual:UMLAGE_MANUAL, num,
    currentYear:() => currentAbrechnungsjahr(), periodLabelShort, periodYearFromDate,
    collectQualityChecks:NK_PRO_MODULES.qualityAssurance.inspect,
    finalBillingReadiness:NK_PRO_MODULES.qualityAssurance.finalBillingReadiness,
    isArchiveViewer, hasActiveCurrentBilling:NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling,
    getManualInputModes:() => MANUAL_INPUT_MODES, getDefaultUmlageInputs:() => DEFAULT_UMLAGE_INPUTS,
    inferManualInputMode, defaultManualInputMode, applyWaterMetersToUmlage,
    updateTenantPrepaymentTotals:NK_PRO_MODULES.costActions.updateTenantPrepaymentTotals, defaultBriefSettings,
    ensureYearData, syncVorauszahlungen:NK_PRO_MODULES.costActions.syncVorauszahlungen,
    synchronizeMeteringData, normalizeObjectStandard, calculateUmlage:NK_PRO_MODULES.billingCalculation.calculateUmlage, visibleTenantRows,
    isBillableTenant:NK_PRO_MODULES.billingCalculation.isBillableTenant, isPrivateTenant:NK_PRO_MODULES.billingCalculation.isPrivateTenant, validateBillingReadiness, periodStart, periodEnd,
    billingSnapshot:NK_PRO_MODULES.billingSnapshot, billingSnapshotModuleOptions, snapshotMetaFrom,
    archiveSnapshotScope:ARCHIVE_SNAPSHOT_SCOPE, dataLayerContractVersion:DATA_LAYER_CONTRACT_VERSION,
    dataSchemaVersion:DATA_SCHEMA_VERSION
  });
  NK_PRO_MODULES.yearTransitionActions.configure({
    stateAccess:NK_PRO_MODULES.stateAccess, archiveActions:NK_PRO_MODULES.archiveActions,
    masterDataActions:NK_PRO_MODULES.masterDataActions, costActions:NK_PRO_MODULES.costActions,
    billingWorkflow:NK_PRO_MODULES.billingWorkflow, num, todayIso, nowIso:() => new Date().toISOString(), addDaysIso,
    currentYear:() => currentAbrechnungsjahr(), periodDaysExact, periodStart, periodEnd,
    hasTenantData, isArchivedTenant, tenantActiveDaysInCurrentPeriod, hasWaterSettingValue,
    ensureWaterMeterData, applyWaterMetersToUmlage, billableTenantRows, activePrepaymentCostIds,
    adjustmentGroupForCost, tenantDisplayId, hasEnteredMeterValue, isArchiveViewer,
    createSnapshot:() => NK_PRO_MODULES.billingWorkflow.createSnapshot(), appVersion:APP_VERSION
  });
  NK_PRO_MODULES.diagnostics.configure({
    stateAccess:NK_PRO_MODULES.stateAccess, clone, withIsolatedState, archiveActions:NK_PRO_MODULES.archiveActions,
    yearTransitionActions:NK_PRO_MODULES.yearTransitionActions, qualityAssurance:NK_PRO_MODULES.qualityAssurance
  });
  return Object.freeze({
    masterData:NK_PRO_MODULES.masterDataActions.describe(), cost:NK_PRO_MODULES.costActions.describe(),
    billing:NK_PRO_MODULES.billingWorkflow.describe(), archive:NK_PRO_MODULES.archiveActions.describe(),
    yearTransition:NK_PRO_MODULES.yearTransitionActions.describe(), quality:NK_PRO_MODULES.qualityAssurance.describe(),
    diagnostics:NK_PRO_MODULES.diagnostics.describe()
  });
}

function configureBillingContextModule() {
  return NK_PRO_MODULES.billingContext.configure({
    onChange:() => {
      billingContextOpen = NK_PRO_MODULES.billingContext.isOpen();
      if (NK_PRO_MODULES.navigation && typeof NK_PRO_MODULES.navigation.updateWorkflowNavigationContext === "function") NK_PRO_MODULES.navigation.updateWorkflowNavigationContext();
      if (typeof applyBillingContextToDom === "function") applyBillingContextToDom();
    }
  });
}

function configureStateAccess() {
  return NK_PRO_MODULES.stateAccess.configure({
    getState:() => state,
    replaceState:nextState => replaceApplicationState(nextState),
    commit:options => {
      if (NK_PRO_MODULES.billingContext.isReadOnly() && !options.allowReadOnlyWrite) NK_PRO_MODULES.billingContext.assertWritable(options.reason || "Schreibaktion");
      const commitOptions = { ...options, reason:options.reason || "UI-Controller" };
      return options.allowFinalizationWrite
        ? withFinalizationWriteBypass(() => commitStateChange(commitOptions))
        : commitStateChange(commitOptions);
    }
  });
}
function configureApplicationActions() {
  return NK_PRO_MODULES.applicationActions.configure({
    application:{ save:saveData, reset:resetData },
    state:{ setNested },
    object:{
      addMasterTenancy:NK_PRO_MODULES.masterDataActions.addMasterTenancy,
      applyMasterDataToBilling:NK_PRO_MODULES.masterDataActions.applyMasterDataToBilling,
      archiveMasterTenancy:NK_PRO_MODULES.masterDataActions.archiveMasterTenancy,
      restoreMasterTenancy:NK_PRO_MODULES.masterDataActions.restoreMasterTenancy,
      setBillingUnitStatus:NK_PRO_MODULES.masterDataActions.setBillingUnitStatus,
      setMasterNested:NK_PRO_MODULES.masterDataActions.setMasterNested
    },
    cost:{
      setSetting:NK_PRO_MODULES.costActions.setSetting,
      configureFree:NK_PRO_MODULES.costActions.configureFree,
      setTenantAllowed:NK_PRO_MODULES.costActions.setTenantAllowed,
      activateDefaultPrepayments:NK_PRO_MODULES.costActions.activateDefaultPrepayments,
      deactivateAllPrepayments:NK_PRO_MODULES.costActions.deactivateAllPrepayments
    },
    billing:{
      finalize:NK_PRO_MODULES.billingWorkflow.finalize,
      unlock:NK_PRO_MODULES.billingWorkflow.unlock,
      setYear:NK_PRO_MODULES.billingWorkflow.setYear,
      setPeriod:NK_PRO_MODULES.billingWorkflow.setPeriod,
      resetAllocationInputs:NK_PRO_MODULES.billingWorkflow.resetAllocationInputs,
      setManualInputMode:NK_PRO_MODULES.billingWorkflow.setManualInputMode,
      setManualExternalValue:NK_PRO_MODULES.billingWorkflow.setManualExternalValue,
      setPrepaymentValue:NK_PRO_MODULES.billingWorkflow.setPrepaymentValue,
      setPrepaymentAdjustmentSetting:NK_PRO_MODULES.billingWorkflow.setPrepaymentAdjustmentSetting
    },
    archive:{
      currentYear:NK_PRO_MODULES.archiveActions.archiveCurrent,
      reopenForRework:NK_PRO_MODULES.archiveActions.reopenForRework,
      deleteAt:NK_PRO_MODULES.archiveActions.deleteAt,
      importItems:NK_PRO_MODULES.archiveActions.importItems
    },
    yearTransition:{
      createBilling:NK_PRO_MODULES.yearTransitionActions.createBilling,
      prepareNextYear:NK_PRO_MODULES.yearTransitionActions.prepareNextYear
    },
    quality:{
      inspect:NK_PRO_MODULES.qualityAssurance.inspect,
      specialCases:NK_PRO_MODULES.qualityAssurance.specialCases,
      finalBillingReadiness:NK_PRO_MODULES.qualityAssurance.finalBillingReadiness
    },
    meter:{ setWaterValue:setWaterMeterValue, setGenericValue:setGenericMeterValue, setWaterSetting:setWaterMeterSetting }
  });
}
function configureNavigationModule() {
  return NK_PRO_MODULES.navigation.configure({ currentYear:() => currentAbrechnungsjahr(), objectLabel:() => currentObjectLabel(), isArchiveViewer:() => isArchiveViewer(), hasActiveBilling:() => NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling(), isFinalized:() => NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized(), isContextOpen:() => isBillingContextOpen(), tabTitle:tabId => TAB_DEFINITIONS[tabId] ? TAB_DEFINITIONS[tabId].title : "NK-Pro", updatePageHeaders:() => updateAllPageHeaders(), renderOverview:tabId => renderOverviewForTab(tabId) });
}
function registerUiControllers() { return NK_PRO_MODULES.uiBindings.register({ modules:{ exportService:NK_PRO_MODULES.exportService, applicationActions:NK_PRO_MODULES.applicationActions } }); }
function startUiEvents() {
  return NK_PRO_MODULES.uiEvents.start({ root:document, onError(error, context) { setActionMessage("UI-Aktion fehlgeschlagen: " + errorMessage(error), "err"); renderActionFeedback(); if (typeof console !== "undefined" && console.error) console.error("NK-Pro UI-Controllerfehler", context, error); } });
}
function updateUiArchitectureAudit() {
  const report = Object.freeze({ controllers:NK_PRO_MODULES.uiController.describe(), events:NK_PRO_MODULES.uiEvents.describe(), stateAccess:NK_PRO_MODULES.stateAccess.describe(), applicationActions:NK_PRO_MODULES.applicationActions.describe(), masterDataActions:NK_PRO_MODULES.masterDataActions.describe(), costActions:NK_PRO_MODULES.costActions.describe(), billingWorkflow:NK_PRO_MODULES.billingWorkflow.describe(), archiveActions:NK_PRO_MODULES.archiveActions.describe(), yearTransitionActions:NK_PRO_MODULES.yearTransitionActions.describe(), qualityAssurance:NK_PRO_MODULES.qualityAssurance.describe(), diagnostics:NK_PRO_MODULES.diagnostics.describe(), navigation:NK_PRO_MODULES.navigation.describe(), compatibility:NK_PRO_MODULES.compatibility.describe() });
  NK_PRO_MODULES.runtimeDiagnostics.setUiArchitecture(report); return report;
}

const COMPATIBILITY_WRAPPERS = Object.freeze({
  billingCalculation:Object.freeze([
    "costExclusionHandling", "normalizeManualUmlageValue", "isPrivateTenant", "isBillableTenant",
    "billableTenantRows", "privateTenantRows", "prepaymentMatrixSumForCost", "activePrepaymentCostIds",
    "tenantIdForUmlage", "isCostAllowedForTenant", "tenantRowsWithIndex", "normalizeActiveDayValue",
    "tenantDays", "allWohnungen", "activeWohnungen", "formatPlainNumber", "waterConsumption",
    "genericMeterConsumption", "meterTotalForCostAndTenant", "inferManualInputMode", "defaultManualInputMode",
    "manualInputModeForCost", "rawVorauszahlungByCostAndTenant", "vorauszahlungByCostAndTenant",
    "totalVorauszahlungForTenant", "calculateUmlage", "umlageTotals", "adjustmentGroupForCost",
    "prepaymentAdjustmentData", "calculatedMonthlyPrepaymentRowsForTenant"
  ]),
  documentData:Object.freeze([
    "settlementInfoForResult", "acceptanceProtocolData", "acceptanceLevel", "acceptanceLabel",
    "validateBriefResult", "compactTextLength", "briefPreflightReport", "allLettersPrintReadiness",
    "currentBriefPreflightReport", "briefResultRows", "selectedBriefTenant", "isBriefCostRowRelevant",
    "briefCostRows", "dateDeShortYear", "fmtMoneySigned", "fmtUnits", "isManualExternalCostDefinition",
    "letterCostGroup", "letterPeriod", "manualExternalLetterLineLabel", "monthlyPrepaymentRows", "settlementLabel"
  ]),
  documentRenderer:Object.freeze([
    "briefSettlementSummaryHtml", "briefPrintStyles", "briefPreflightBoxHtml", "printHardeningBoxHtml",
    "printReportText", "printWindowHtml", "plainLetterTextFromHtml", "costSectionRows", "buildBriefHtml"
  ]),
  exportService:Object.freeze([
    "download", "safeFilePart", "downloadJsonFile", "downloadFullJson", "downloadCurrentBillingJson",
    "downloadKostenCsv", "downloadMieterCsv", "txtFileName", "downloadUmlageCsv",
    "downloadFinalBillingReport", "downloadExportPackage", "downloadFullExportPackage"
  ]),
  uiTableTools:Object.freeze(["enhanceTables"]),
  archiveActions:Object.freeze(["isViewingOlderArchiveYear"])
});

function configureCompatibilityRegistry() {
  NK_PRO_MODULES.compatibility.registerModule(
    "billingCalculation", NK_PRO_MODULES.billingCalculation, COMPATIBILITY_WRAPPERS.billingCalculation
  );
  NK_PRO_MODULES.compatibility.registerModule(
    "documentData", NK_PRO_MODULES.documentData, COMPATIBILITY_WRAPPERS.documentData
  );
  NK_PRO_MODULES.compatibility.registerModule(
    "documentRenderer", NK_PRO_MODULES.documentRenderer, COMPATIBILITY_WRAPPERS.documentRenderer
  );
  NK_PRO_MODULES.compatibility.registerModule(
    "exportService", NK_PRO_MODULES.exportService, COMPATIBILITY_WRAPPERS.exportService
  );
  NK_PRO_MODULES.compatibility.registerModule(
    "uiTableTools", NK_PRO_MODULES.uiTableTools, COMPATIBILITY_WRAPPERS.uiTableTools
  );
  NK_PRO_MODULES.compatibility.registerModule(
    "archiveActions", Object.freeze({ isViewingOlderArchiveYear:NK_PRO_MODULES.archiveActions.yearNumber }),
    COMPATIBILITY_WRAPPERS.archiveActions
  );
  return NK_PRO_MODULES.compatibility.describe();
}

const STARTUP_RESULT = NK_PRO_MODULES.appBootstrap.start([
  { name:"Kernmodule konfigurieren", run:() => configureCoreOrchestrationModules() },
  { name:"Arbeitszustand laden", run:() => initializeApplicationState() },
  { name:"Abrechnungskontext konfigurieren", run:() => configureBillingContextModule() },
  { name:"Zustandszugriff konfigurieren", run:() => configureStateAccess() },
  { name:"Anwendungsaktionen konfigurieren", run:() => configureApplicationActions() },
  { name:"Navigation konfigurieren", run:() => configureNavigationModule() },
  { name:"UI-Controller registrieren", run:() => registerUiControllers() },
  { name:"UI-Ereignisse registrieren", run:() => startUiEvents() },
  { name:"Kompatibilität registrieren", run:() => configureCompatibilityRegistry() },
  { name:"Arbeitsstand vorbereiten", run:() => prepareStateForPersistence("startup") },
  { name:"Erste Darstellung", run:() => renderAll() },
  { name:"Navigation initialisieren", run:() => initializeNavigationMode() },
  { name:"Arbeitsbereiche schließen", run:() => document.querySelectorAll('.tab details').forEach(d => d.open = false) },
  { name:"Seitenköpfe aktualisieren", run:() => updateAllPageHeaders() },
  { name:"Übersichtskarten aktualisieren", run:() => renderAllOverviewCards() },
  { name:"Strukturprüfung", run:() => auditV992Structure() },
  { name:"UI-Architekturprüfung", run:() => updateUiArchitectureAudit() }
], {
  onError(error) { renderErrors = [{ area:"App-Start", message:errorMessage(error) }]; if (typeof console !== "undefined" && console.error) console.error("NK-Pro Startabbruch", error); },
  onFallback() { renderSystemMessages(); },
  onFallbackError(statusError) { if (typeof console !== "undefined" && console.error) console.error("NK-Pro Statusanzeige fehlgeschlagen", statusError); }
});
NK_PRO_MODULES.runtimeDiagnostics.setStartup(STARTUP_RESULT);
NK_PRO_MODULES.runtimeDiagnostics.setCompatibility(NK_PRO_MODULES.compatibility.describe());
