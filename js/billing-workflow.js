(function(global) {
  "use strict";

  let deps = null;

  function configure(options = {}) {
    if (deps) return describe();
    if (!options.stateAccess || typeof options.stateAccess.current !== "function" || typeof options.stateAccess.transact !== "function") {
      throw new Error("Abrechnungsworkflow benötigt NKProStateAccess.");
    }
    const required = [
      "num", "currentYear", "periodLabelShort", "periodYearFromDate", "collectQualityChecks",
      "finalBillingReadiness", "isArchiveViewer", "hasActiveCurrentBilling", "getManualInputModes",
      "getDefaultUmlageInputs", "inferManualInputMode", "defaultManualInputMode", "applyWaterMetersToUmlage",
      "updateTenantPrepaymentTotals", "defaultBriefSettings", "ensureYearData", "syncVorauszahlungen",
      "synchronizeMeteringData", "normalizeObjectStandard", "calculateUmlage", "visibleTenantRows",
      "isBillableTenant", "isPrivateTenant", "validateBillingReadiness", "periodStart", "periodEnd",
      "billingSnapshotModuleOptions", "snapshotMetaFrom"
    ];
    required.forEach(name => {
      if (typeof options[name] !== "function") throw new Error("Workflowabhängigkeit fehlt: " + name);
    });
    if (!options.billingSnapshot || typeof options.billingSnapshot.createBillingSnapshot !== "function") {
      throw new Error("Abrechnungsworkflow benötigt NKProBillingSnapshot.");
    }
    deps = Object.freeze({
      ...options,
      appVersion:String(options.appVersion || ""),
      umlageManual:String(options.umlageManual || "Manuelle Eingabe je Mieter/Wohneinheit"),
      archiveSnapshotScope:String(options.archiveSnapshotScope || "billingSnapshot"),
      dataLayerContractVersion:Number(options.dataLayerContractVersion || 1),
      dataSchemaVersion:Number(options.dataSchemaVersion || 1)
    });
    return describe();
  }

  function requireDeps() {
    if (!deps) throw new Error("Abrechnungsworkflow wurde noch nicht konfiguriert.");
    return deps;
  }

  function current() {
    return requireDeps().stateAccess.current();
  }

  function currentBillingFinalizationKey(data = current()) {
    const d = requireDeps();
    const meta = data && data.meta || {};
    return String(meta.abrechnungsjahr || d.currentYear() || "") + "|" + String(meta.abrechnungsbeginn || "") + "|" + String(meta.abrechnungsende || "");
  }

  function isCurrentBillingFinalized(data = current()) {
    const meta = data && data.meta || {};
    return !!(meta.currentBillingFinalized && meta.currentBillingFinalizationKey === currentBillingFinalizationKey(data));
  }

  function currentBillingFinalizationReport(data = current()) {
    const d = requireDeps();
    const finalized = isCurrentBillingFinalized(data);
    const meta = data && data.meta || {};
    const report = d.collectQualityChecks({ scope:"currentBilling" });
    const readiness = d.finalBillingReadiness(report);
    return Object.freeze({ finalized, meta, report, readiness });
  }

  function createSnapshot() {
    const d = requireDeps();
    const data = current();
    d.ensureYearData();
    d.syncVorauszahlungen(data);
    syncUmlageInputs(data);
    d.applyWaterMetersToUmlage();
    d.updateTenantPrepaymentTotals(data);
    d.synchronizeMeteringData(data);
    d.normalizeObjectStandard(data);

    const calculation = d.calculateUmlage();
    const year = d.currentYear();
    const visibleRows = d.visibleTenantRows();
    const billableRows = visibleRows.filter(row => d.isBillableTenant(row));
    const privateRows = visibleRows.filter(row => d.isPrivateTenant(row));
    const prepayments = calculation.tenantResults.reduce((sum, row) => sum + d.num(row.prepayments), 0);
    const tenantShares = calculation.tenantResults.reduce((sum, row) => sum + d.num(row.costShare), 0);
    const corrections = calculation.tenantResults.reduce((sum, row) => sum + d.num(row.correction), 0);
    const rentCorrections = calculation.tenantResults.reduce((sum, row) => sum + d.num(row.rentCorrection), 0);
    const costs = (Array.isArray(data.kostenarten) ? data.kostenarten : [])
      .filter(row => row && row.kostenart && row.inNK === "Ja")
      .reduce((sum, row) => sum + d.num(row.gesamtbetrag), 0);
    const summary = {
      mietverhaeltnisse:billableRows.length,
      datensaetzeUmlagebasis:visibleRows.length,
      eigentuemerPrivatDatensaetze:privateRows.length,
      kostenNK:costs,
      vorauszahlungen:prepayments,
      mieterKostenanteile:tenantShares,
      korrekturen:corrections,
      kaltmietKorrekturen:rentCorrections,
      saldo:tenantShares - prepayments - corrections
    };
    const readiness = d.validateBillingReadiness(data);
    const periodId = String(year) + "|" + d.periodStart() + "|" + d.periodEnd() + "|Tool-Abrechnung";
    return d.billingSnapshot.createBillingSnapshot(data, d.billingSnapshotModuleOptions({
      validation:readiness,
      calculation,
      summary,
      envelopeFields:{
        year,
        periodId,
        archivedAt:new Date().toISOString(),
        meta:Object.assign(d.snapshotMetaFrom(data.meta || {}), {
          exportScope:"currentBillingOnly",
          exportScopeLabel:"Unveränderlicher Abrechnungssnapshot der aktuellen Abrechnung",
          exportedAt:new Date().toISOString(),
          exportedWithAppVersion:d.appVersion
        }),
        snapshotScope:d.archiveSnapshotScope,
        snapshotBoundaryVersion:d.dataLayerContractVersion,
        schemaVersion:d.dataSchemaVersion
      }
    }));
  }

  function finalize(options = {}) {
    const d = requireDeps();
    if (d.isArchiveViewer()) {
      return Object.freeze({ changed:false, reason:"archive-readonly", message:"Archivansichten sind bereits schreibgeschützt." });
    }
    if (!d.hasActiveCurrentBilling()) {
      return Object.freeze({
        changed:false,
        reason:"no-current-billing",
        message:"Es ist keine aktuelle Abrechnung in Bearbeitung. Neue Abrechnungen werden ausschließlich über „+ Neue Abrechnung“ angelegt."
      });
    }
    if (isCurrentBillingFinalized()) {
      return Object.freeze({ changed:false, reason:"already-finalized", message:"Diese Abrechnung ist bereits finalisiert." });
    }
    const info = currentBillingFinalizationReport();
    if (info.readiness.errors.length) {
      return Object.freeze({
        changed:false,
        reason:"validation-errors",
        errorCount:info.readiness.errors.length,
        targetTab:"qualitaet",
        message:"Finalisierung nicht möglich. Es gibt noch blockierende Fehler im finalen Abrechnungscheck."
      });
    }
    if (info.readiness.warnings.length) {
      return Object.freeze({
        changed:false,
        reason:"open-plausibility",
        warningCount:info.readiness.warnings.length,
        targetTab:"qualitaet",
        message:"Keine blockierenden Fehler. Es bestehen noch unbestätigte Plausibilitätsauffälligkeiten. Bitte bearbeiten oder fachlich bestätigen."
      });
    }
    const year = d.currentYear();
    if (options.confirmed !== true) {
      return Object.freeze({
        changed:false,
        requiresConfirmation:true,
        confirmationMessage:"Abrechnung " + year + " finalisieren?\n\nAlle zentralen Pflichtprüfungen sind bestanden und alle relevanten Auffälligkeiten wurden bearbeitet. Danach werden Eingaben geschützt, bis die Finalisierung bewusst aufgehoben wird."
      });
    }
    return d.stateAccess.transact(data => {
      if (!data.meta) data.meta = {};
      data.meta.currentBillingFinalized = true;
      data.meta.currentBillingFinalizationKey = currentBillingFinalizationKey(data);
      data.meta.currentBillingFinalizedAt = new Date().toISOString();
      data.meta.currentBillingFinalizedWithAppVersion = d.appVersion;
      data.meta.currentBillingFinalizationSummary = {
        year:d.currentYear(),
        period:d.periodLabelShort(),
        errors:info.readiness.errors.length,
        warnings:info.readiness.warnings.length,
        hints:info.readiness.hints.length
      };
      return Object.freeze({
        changed:true,
        key:data.meta.currentBillingFinalizationKey,
        message:"Abrechnung wurde finalisiert. Eingaben sind jetzt geschützt."
      });
    }, { reason:"Finalisierung", forceAll:true, allowFinalizationWrite:true });
  }

  function unlock(options = {}) {
    const d = requireDeps();
    if (d.isArchiveViewer()) {
      return Object.freeze({ changed:false, reason:"archive-readonly", message:"Archivansichten können nicht entsperrt werden." });
    }
    if (!d.hasActiveCurrentBilling()) {
      return Object.freeze({
        changed:false,
        reason:"no-current-billing",
        message:"Es ist keine aktuelle Abrechnung in Bearbeitung. Zur Korrektur öffnen Sie einen Archivdatensatz über die Abrechnungsübersicht."
      });
    }
    if (!isCurrentBillingFinalized()) {
      return Object.freeze({ changed:false, reason:"not-finalized", message:"Diese Abrechnung ist nicht finalisiert." });
    }
    const code = "ENTSPERREN";
    if (!Object.prototype.hasOwnProperty.call(options, "confirmationCode")) {
      return Object.freeze({
        changed:false,
        requiresPrompt:true,
        promptMessage:"Finalisierung aufheben?\n\nGib zur Bestätigung " + code + " ein. Danach können Daten wieder verändert werden."
      });
    }
    if (String(options.confirmationCode || "").trim().toUpperCase() !== code) {
      return Object.freeze({ changed:false, reason:"confirmation-failed", message:"Finalisierung wurde nicht aufgehoben." });
    }
    return d.stateAccess.transact(data => {
      if (!data.meta) data.meta = {};
      data.meta.currentBillingFinalized = false;
      data.meta.currentBillingUnlockedAt = new Date().toISOString();
      data.meta.currentBillingUnlockedWithAppVersion = d.appVersion;
      return Object.freeze({ changed:true, message:"Finalisierung wurde aufgehoben. Die Abrechnung ist wieder bearbeitbar." });
    }, { reason:"Bearbeitungsmodus öffnen", forceAll:true, allowFinalizationWrite:true });
  }

  function clearCurrentBillingFinalization(data = current()) {
    if (!data.meta) data.meta = {};
    data.meta.currentBillingFinalized = false;
    delete data.meta.currentBillingFinalizationKey;
    delete data.meta.currentBillingFinalizedAt;
    delete data.meta.currentBillingFinalizedWithAppVersion;
    delete data.meta.currentBillingFinalizationSummary;
    return data;
  }

  function setYear(value) {
    const d = requireDeps();
    const year = String(value || "").trim() || d.currentYear();
    return d.stateAccess.transact(data => {
      if (!data.meta) data.meta = {};
      data.meta.abrechnungsjahr = year;
      data.meta.abrechnungsbeginn = year + "-01-01";
      data.meta.abrechnungsende = year + "-12-31";
      if (data.briefSettings) data.briefSettings.abrechnungsjahr = year;
      return Object.freeze({ changed:true, year });
    }, { reason:"Benutzereingabe", forceAll:true });
  }

  function setPeriod(key, value) {
    const d = requireDeps();
    return d.stateAccess.transact(data => {
      if (!data.meta) data.meta = {};
      data.meta[key] = value;
      const startYear = d.periodYearFromDate(data.meta.abrechnungsbeginn);
      const endYear = d.periodYearFromDate(data.meta.abrechnungsende);
      if (startYear && startYear === endYear) data.meta.abrechnungsjahr = startYear;
      else if (endYear) data.meta.abrechnungsjahr = endYear;
      if (data.briefSettings) data.briefSettings.abrechnungsjahr = data.meta.abrechnungsjahr;
      return Object.freeze({ changed:true, key, value, year:data.meta.abrechnungsjahr || "" });
    }, { reason:"Benutzereingabe", forceAll:true });
  }

  function syncPeriodYear() {
    const d = requireDeps();
    return d.stateAccess.transact(data => {
      if (!data.meta) data.meta = {};
      const endYear = d.periodYearFromDate(data.meta.abrechnungsende);
      if (!endYear) return Object.freeze({ changed:false, message:"Das Enddatum enthält kein verwendbares Jahr." });
      const previousYear = String(data.meta.abrechnungsjahr || "");
      data.meta.abrechnungsjahr = endYear;
      if (data.briefSettings) data.briefSettings.abrechnungsjahr = endYear;
      return Object.freeze({ changed:previousYear !== endYear, year:endYear, message:"Abrechnungsjahr wurde aus dem Enddatum übernommen." });
    }, { reason:"Abrechnungsjahr mit Enddatum abgeglichen", forceAll:true });
  }

  function syncUmlageInputs(data = current()) {
    const d = requireDeps();
    if (!data.umlageInputs) data.umlageInputs = {};
    const tenantCount = Math.max(20, Array.isArray(data.mieter) ? data.mieter.length : 0);
    const defaultsByCost = d.getDefaultUmlageInputs() || {};
    const modes = d.getManualInputModes();
    (Array.isArray(data.kostenarten) ? data.kostenarten : []).forEach(cost => {
      if (!cost || !cost.id) return;
      const needsInput = cost.inNK === "Ja" && (
        cost.umlageschluessel === "Verbrauch" ||
        cost.umlageschluessel === d.umlageManual ||
        cost.berechnungsart === "Manuell je Mieter" ||
        !!data.umlageInputs[cost.id]
      );
      if (needsInput && !data.umlageInputs[cost.id]) {
        const defaults = defaultsByCost[cost.id] || [];
        const values = Array(tenantCount).fill(0);
        defaults.forEach((entry, index) => { if (index < values.length) values[index] = entry; });
        data.umlageInputs[cost.id] = {
          kostenId:cost.id,
          kostenart:cost.kostenart,
          art:cost.umlageschluessel,
          mode:d.defaultManualInputMode(cost),
          values
        };
      }
      if (data.umlageInputs[cost.id]) {
        const input = data.umlageInputs[cost.id];
        input.kostenart = cost.kostenart;
        if (!modes.includes(input.mode)) input.mode = d.inferManualInputMode(cost, input, data);
        input.art = input.mode;
        if (!Array.isArray(input.values)) input.values = [];
        while (input.values.length < tenantCount) input.values.push(0);
        if (!input.caseValues || typeof input.caseValues !== "object" || Array.isArray(input.caseValues)) input.caseValues = {};
      }
    });
    return data.umlageInputs;
  }

  function setManualInputMode(costId, mode, options = {}) {
    const d = requireDeps();
    const data = current();
    const modes = d.getManualInputModes();
    const currentInput = data.umlageInputs && data.umlageInputs[costId];
    const currentCost = Array.isArray(data.kostenarten) ? data.kostenarten.find(row => row.id === costId) : null;
    if (!currentCost || !modes.includes(mode)) return Object.freeze({ changed:false, reason:"invalid-input" });
    const hasLegacyValues = currentInput && Array.isArray(currentInput.values) && currentInput.values.some(value => Math.abs(d.num(value)) > 0.000001);
    const hasCaseValues = currentInput && currentInput.caseValues && Object.values(currentInput.caseValues).some(value => Math.abs(d.num(value && typeof value === "object" ? (value.amount !== undefined ? value.amount : value.value) : value)) > 0.000001);
    const hasValues = hasLegacyValues || hasCaseValues;
    if (hasValues && currentInput.mode !== mode && options.confirmed !== true) {
      return Object.freeze({
        changed:false,
        requiresConfirmation:true,
        confirmationMessage:"Für diese Kostenart sind bereits Werte vorhanden. Die Werte bleiben erhalten, werden aber künftig als „" + mode + "“ interpretiert. Fortfahren?"
      });
    }
    return d.stateAccess.transact(next => {
      syncUmlageInputs(next);
      const cost = next.kostenarten.find(row => row.id === costId);
      const input = next.umlageInputs[costId];
      if (!cost || !input) return Object.freeze({ changed:false, reason:"missing-input" });
      input.mode = mode;
      input.art = mode;
      if (mode === "Zählerstände" || mode === "Verbrauchsmenge") {
        cost.umlageschluessel = "Verbrauch";
        cost.berechnungsart = "Automatisch";
      } else {
        cost.umlageschluessel = d.umlageManual;
        cost.berechnungsart = "Manuell je Mieter";
      }
      d.applyWaterMetersToUmlage();
      return Object.freeze({ changed:true, costId, mode });
    }, { reason:"Benutzereingabe", tabId:"manuellewerte" });
  }

  function setManualExternalValue(costId, indexOrCaseKey, value, field = "amount") {
    const d = requireDeps();
    const caseKey = typeof indexOrCaseKey === "string" && !/^\d+$/.test(indexOrCaseKey.trim()) ? String(indexOrCaseKey) : "";
    const numericIndex = caseKey ? -1 : Number(indexOrCaseKey);
    const allowedFields = ["amount", "consumption", "provider", "recordedAt", "note"];
    const normalizedField = allowedFields.includes(String(field || "")) ? String(field) : "amount";
    return d.stateAccess.transact(data => {
      syncUmlageInputs(data);
      const input = data.umlageInputs[costId];
      if (!input) return Object.freeze({ changed:false, reason:"missing-input" });
      const storedValue = ["amount", "consumption"].includes(normalizedField) ? d.num(value) : String(value || "");
      if (caseKey) {
        if (!input.caseValues || typeof input.caseValues !== "object" || Array.isArray(input.caseValues)) input.caseValues = {};
        const previous = input.caseValues[caseKey] && typeof input.caseValues[caseKey] === "object" ? input.caseValues[caseKey] : {};
        input.caseValues[caseKey] = Object.assign({}, previous, {
          [normalizedField]:storedValue,
          source:String(previous.source || "manual"),
          updatedAt:new Date().toISOString()
        });
        const calculation = global.NKProBillingCalculation;
        const cases = calculation && typeof calculation.individualValueCases === "function" ? calculation.individualValueCases(data) : [];
        const target = cases.find(row => row.caseKey === caseKey);
        if (target && target.originalIndex >= 0 && normalizedField === "amount") input.values[target.originalIndex] = d.num(storedValue);
      } else if (Number.isInteger(numericIndex) && numericIndex >= 0) {
        input.values[numericIndex] = d.num(storedValue);
        const calculation = global.NKProBillingCalculation;
        const cases = calculation && typeof calculation.individualValueCases === "function" ? calculation.individualValueCases(data).filter(row => row.originalIndex === numericIndex) : [];
        if (cases.length === 1) input.caseValues[cases[0].caseKey] = { amount:d.num(storedValue), source:"legacy-projection", updatedAt:new Date().toISOString() };
      } else return Object.freeze({ changed:false, reason:"invalid-case" });
      return Object.freeze({ changed:true, costId, index:numericIndex, caseKey, field:normalizedField });
    }, { reason:"Benutzereingabe", tabId:"manuellewerte" });
  }

  function setIndividualValuesImport(costId, values, metadata = {}) {
    const d = requireDeps();
    const normalizedValues = Array.isArray(values) ? values.map(value => d.num(value)) : [];
    const importedCaseValues = metadata.caseValues && typeof metadata.caseValues === "object" && !Array.isArray(metadata.caseValues) ? metadata.caseValues : {};
    return d.stateAccess.transact(data => {
      syncUmlageInputs(data);
      const input = data.umlageInputs && data.umlageInputs[costId];
      if (!input) return Object.freeze({ changed:false, reason:"missing-input" });
      while (input.values.length < normalizedValues.length) input.values.push(0);
      normalizedValues.forEach((value,index) => { input.values[index] = value; });
      if (!input.caseValues || typeof input.caseValues !== "object" || Array.isArray(input.caseValues)) input.caseValues = {};
      Object.entries(importedCaseValues).forEach(([caseKey, raw]) => {
        const amount = d.num(raw && typeof raw === "object" ? (raw.amount !== undefined ? raw.amount : raw.value) : raw);
        input.caseValues[caseKey] = {
          amount,
          consumption:d.num(raw && typeof raw === "object" ? raw.consumption : 0),
          provider:String(raw && typeof raw === "object" && raw.provider || ""),
          recordedAt:String(raw && typeof raw === "object" && raw.recordedAt || metadata.importedAt || new Date().toISOString()).slice(0,10),
          source:String(metadata.source || raw && raw.source || "import"),
          updatedAt:String(metadata.importedAt || new Date().toISOString()),
          note:String(raw && typeof raw === "object" && raw.note || "")
        };
      });
      const calculation = global.NKProBillingCalculation;
      const cases = calculation && typeof calculation.individualValueCases === "function" ? calculation.individualValueCases(data) : [];
      cases.forEach(row => {
        if (row.originalIndex >= 0 && input.caseValues[row.caseKey]) input.values[row.originalIndex] = d.num(input.caseValues[row.caseKey].amount);
      });
      input.importSource = String(metadata.source || input.importSource || "");
      input.importedAt = String(metadata.importedAt || new Date().toISOString());
      input.importFormat = String(metadata.format || "Zuordnung nach Abrechnungsfall/Wohnung");
      input.importErrors = Array.isArray(metadata.errors) ? metadata.errors.slice(0,100) : [];
      input.mode = metadata.mode === "Externe Einzelabrechnung" ? "Externe Einzelabrechnung" : (input.mode || "Externe Einzelabrechnung");
      input.art = input.mode;
      const cost = Array.isArray(data.kostenarten) ? data.kostenarten.find(row => row && row.id === costId) : null;
      if (cost && input.mode === "Externe Einzelabrechnung") {
        cost.umlageschluessel = d.umlageManual;
        cost.berechnungsart = "Manuell je Mieter";
      }
      return Object.freeze({ changed:true, costId, imported:normalizedValues.length + Object.keys(importedCaseValues).length, errorCount:input.importErrors.length });
    }, { reason:"Externe Einzelwerte importiert", tabId:"manuellewerte" });
  }

  function resetIndividualValues(costId, options = {}) {
    const d = requireDeps();
    if (options.confirmed !== true) {
      return Object.freeze({ changed:false, requiresConfirmation:true, confirmationMessage:"Individuelle Werte dieser Kostenart wirklich zurücksetzen? Zentrale Zählerdaten werden nicht gelöscht." });
    }
    return d.stateAccess.transact(data => {
      syncUmlageInputs(data);
      const input = data.umlageInputs && data.umlageInputs[costId];
      if (!input) return Object.freeze({ changed:false, reason:"missing-input" });
      if (input.mode === "Zählerstände") return Object.freeze({ changed:false, reason:"central-meter-source", message:"Automatische Zählerwerte werden an der zentralen Zählerquelle korrigiert." });
      input.values = input.values.map(() => 0);
      input.caseValues = {};
      input.importSource = "";
      input.importedAt = "";
      input.importFormat = "";
      input.importErrors = [];
      return Object.freeze({ changed:true, costId });
    }, { reason:"Individuelle Werte zurückgesetzt", tabId:"manuellewerte" });
  }

  function resetAllocationInputs(options = {}) {
    const d = requireDeps();
    if (options.confirmed !== true) {
      return Object.freeze({
        changed:false,
        requiresConfirmation:true,
        confirmationMessage:"Manuelle Verbrauchsmengen und externe Einzelbeträge wirklich zurücksetzen? Zählerstände bleiben erhalten."
      });
    }
    return d.stateAccess.transact(data => {
      syncUmlageInputs(data);
      Object.keys(data.umlageInputs || {}).forEach(costId => {
        const input = data.umlageInputs[costId];
        if (input && input.mode !== "Zählerstände") input.values = input.values.map(() => 0);
      });
      d.applyWaterMetersToUmlage();
      return Object.freeze({ changed:true });
    }, { reason:"Benutzereingabe", tabId:"manuellewerte" });
  }

  function setPrepaymentValue(rowIndex, tenantIndex, value) {
    const d = requireDeps();
    const rowNumber = Number(rowIndex);
    const tenantNumber = Number(tenantIndex);
    const data = current();
    const row = data.vorauszahlungen && data.vorauszahlungen[rowNumber];
    if (!row || !Array.isArray(row.werte)) return Object.freeze({ changed:false, reason:"missing-row" });
    return d.stateAccess.transact(next => {
      const target = next.vorauszahlungen[rowNumber];
      target.werte[tenantNumber] = d.num(value);
      target.summe = target.werte.reduce((sum, entry) => sum + d.num(entry), 0);
      d.updateTenantPrepaymentTotals();
      return Object.freeze({ changed:true, rowIndex:rowNumber, tenantIndex:tenantNumber });
    }, { reason:"Benutzereingabe", tabId:"einnahmen" });
  }

  function defaultPrepaymentAdjustmentSettings() {
    const d = requireDeps();
    const nextYear = String(Number(d.currentYear()) + 1);
    return {
      effectiveFrom:"01.01." + nextYear,
      safetyBufferPercent:0,
      roundingMode:"Auf 5 € runden",
      minimumMonthlyChange:1,
      annualizePartialTenants:"Ja",
      changePolicy:"Erhöhungen und Senkungen",
      letterPrintMode:"Nicht drucken"
    };
  }

  function ensureBriefSettingsForAdjustment(data) {
    const d = requireDeps();
    const defaults = d.defaultBriefSettings();
    if (!data.briefSettings || typeof data.briefSettings !== "object" || Array.isArray(data.briefSettings)) data.briefSettings = {};
    Object.keys(defaults).forEach(key => {
      if (data.briefSettings[key] === undefined || data.briefSettings[key] === null) data.briefSettings[key] = defaults[key];
    });
    return data.briefSettings;
  }

  function ensurePrepaymentAdjustmentSettings(data = current()) {
    if (!data.prepaymentAdjustmentSettings || typeof data.prepaymentAdjustmentSettings !== "object" || Array.isArray(data.prepaymentAdjustmentSettings)) {
      data.prepaymentAdjustmentSettings = {};
    }
    const defaults = defaultPrepaymentAdjustmentSettings();
    Object.keys(defaults).forEach(key => {
      if (data.prepaymentAdjustmentSettings[key] === undefined || data.prepaymentAdjustmentSettings[key] === null || data.prepaymentAdjustmentSettings[key] === "") {
        data.prepaymentAdjustmentSettings[key] = defaults[key];
      }
    });
    const briefSettings = ensureBriefSettingsForAdjustment(data);
    if (briefSettings.vorauszahlungPrintMode) data.prepaymentAdjustmentSettings.letterPrintMode = briefSettings.vorauszahlungPrintMode;
    if (briefSettings.vorauszahlungAb) data.prepaymentAdjustmentSettings.effectiveFrom = briefSettings.vorauszahlungAb;
    return data.prepaymentAdjustmentSettings;
  }

  function setPrepaymentAdjustmentSetting(key, value) {
    const d = requireDeps();
    return d.stateAccess.transact(data => {
      const settings = ensurePrepaymentAdjustmentSettings(data);
      let normalizedValue = value;
      if (["safetyBufferPercent", "minimumMonthlyChange"].includes(key)) normalizedValue = d.num(value);
      settings[key] = normalizedValue;
      const briefSettings = ensureBriefSettingsForAdjustment(data);
      if (key === "effectiveFrom") briefSettings.vorauszahlungAb = normalizedValue;
      if (key === "letterPrintMode") {
        briefSettings.vorauszahlungPrintMode = normalizedValue;
        briefSettings.showVorauszahlungPage = normalizedValue === "Nicht drucken" ? "Nein" : "Ja";
        briefSettings.useCalculatedPrepaymentAdjustments = normalizedValue === "Berechnete Werte drucken" ? "Ja" : "Nein";
      }
      return Object.freeze({ changed:true, key, value:normalizedValue });
    }, { reason:"Vorauszahlungsanpassung", tabId:"vorauszahlungsanpassung", includeCommon:false, includeNavigation:false });
  }

  function describe() {
    return Object.freeze({
      configured:!!deps,
      responsibility:"Laufender Abrechnungsstatus, Periode, manuelle Werte und Vorauszahlungen",
      actionCount:13,
      actions:Object.freeze([
        "createSnapshot", "finalize", "unlock", "setYear", "setPeriod", "syncPeriodYear", "resetAllocationInputs",
        "setManualInputMode", "setManualExternalValue", "setIndividualValuesImport", "resetIndividualValues",
        "setPrepaymentValue", "setPrepaymentAdjustmentSetting"
      ])
    });
  }

  global.NKProBillingWorkflow = Object.freeze({
    configure,
    describe,
    currentBillingFinalizationKey,
    isCurrentBillingFinalized,
    currentBillingFinalizationReport,
    createSnapshot,
    finalize,
    unlock,
    clearCurrentBillingFinalization,
    setYear,
    setPeriod,
    syncPeriodYear,
    syncUmlageInputs,
    setManualInputMode,
    setManualExternalValue,
    setIndividualValuesImport,
    resetIndividualValues,
    resetAllocationInputs,
    setPrepaymentValue,
    defaultPrepaymentAdjustmentSettings,
    ensurePrepaymentAdjustmentSettings,
    setPrepaymentAdjustmentSetting
  });
})(globalThis);
