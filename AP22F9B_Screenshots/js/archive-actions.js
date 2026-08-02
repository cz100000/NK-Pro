(function(global) {
  "use strict";

  let deps = null;

  function configure(options = {}) {
    if (deps) return describe();
    const required = [
      "stateAccess", "archive", "billingSnapshot", "masterDataActions", "clone", "num", "todayIso", "nowIso",
      "archiveOptions", "validateBillingSnapshot", "canonicalUnitIdFor", "hasTenantData", "dateDe", "archiveDataSource",
      "normalizeLegacyData", "ensureWaterMeterHistory", "defaultWaterMeterHistory", "errorMessage", "createSnapshot",
      "currentYear", "isArchiveViewer", "seed", "generatedUnitIdForLabel", "appVersion", "dataSchemaVersion", "dataLayerContractVersion", "snapshotScope", "umlageManual"
    ];
    required.forEach(name => {
      const value = options[name];
      if (name === "appVersion" || name === "dataSchemaVersion" || name === "dataLayerContractVersion" || name === "snapshotScope" || name === "umlageManual") {
        if (value === undefined || value === null || value === "") throw new Error("Archivaktionsabhängigkeit fehlt: " + name);
      } else if (name === "stateAccess" || name === "archive" || name === "billingSnapshot" || name === "masterDataActions") {
        if (!value) throw new Error("Archivaktionsabhängigkeit fehlt: " + name);
      } else if (typeof value !== "function") {
        throw new Error("Archivaktionsabhängigkeit fehlt: " + name);
      }
    });
    deps = Object.freeze({ ...options });
    return describe();
  }

  function requireDeps() {
    if (!deps) throw new Error("Archivaktionen wurden noch nicht konfiguriert.");
    return deps;
  }

  function current() { return requireDeps().stateAccess.current(); }
  function normalizeItem(item) { const d = requireDeps(); return d.archive.normalizeArchiveItem(item, d.archiveOptions()); }
  function prepareItem(item) { const d = requireDeps(); return d.archive.prepareArchiveItemForUse(item, d.archiveOptions()); }

  function yearNumber(value) {
    const match = String(value || "").match(/\d{4}/);
    const number = match ? parseInt(match[0], 10) : NaN;
    return Number.isFinite(number) ? number : new Date().getFullYear();
  }

  function recordType() { return "Abrechnung"; }

  function meta(item) {
    return item && (item.meta || (item.data && item.data.meta)) || {};
  }

  function periodId(item) {
    if (!item) return "";
    const d = requireDeps();
    const itemMeta = meta(item);
    if (item.periodId) return String(item.periodId);
    if (itemMeta.periodId) return String(itemMeta.periodId);
    if (itemMeta.abrechnungsbeginn && itemMeta.abrechnungsende) {
      return String(item.year || itemMeta.abrechnungsjahr || "") + "|" + itemMeta.abrechnungsbeginn + "|" + itemMeta.abrechnungsende + "|" + d.archiveDataSource(item);
    }
    return "year|" + String(item.year || "");
  }

  function sortKey(item) {
    const itemMeta = meta(item);
    const end = itemMeta.abrechnungsende || (String(item && item.year || "") + "-12-31");
    const year = yearNumber(item && item.year);
    return String(end || "") + "|" + String(year).padStart(4, "0");
  }

  function periodLabel(item) {
    const d = requireDeps();
    const itemMeta = meta(item);
    const period = itemMeta.abrechnungsbeginn && itemMeta.abrechnungsende
      ? d.dateDe(itemMeta.abrechnungsbeginn) + " – " + d.dateDe(itemMeta.abrechnungsende)
      : String((item && item.year) || "");
    return itemMeta.legacyTeilperioden ? period + " (Einzelperioden)" : period;
  }

  function itemLabel(item, index) {
    const itemMeta = meta(item);
    const year = item && (item.year || itemMeta.abrechnungsjahr);
    const period = item ? periodLabel(item) : "";
    return [year || ("#" + (Number(index || 0) + 1)), period].filter(Boolean).join(" · ");
  }

  function recordCorrections(item) {
    const d = requireDeps();
    if (!item) return 0;
    if (item.summary && item.summary.korrekturen !== undefined) return d.num(item.summary.korrekturen);
    const rows = item.data && Array.isArray(item.data.mieter) ? item.data.mieter : [];
    return rows.reduce((sum, tenant) => {
      if (!tenant || !tenant.id || !tenant.name) return sum;
      if (tenant.status === "Archiviert" || tenant.status === "archiviert" || tenant.status === "Archiv") return sum;
      if (tenant.abrechnungRolle === "Eigentümer/Privat") return sum;
      return sum + d.num(tenant.vorjahresKorrektur);
    }, 0);
  }

  function recordSaldo(item) {
    const d = requireDeps();
    if (!item || !item.summary) return 0;
    const shares = item.summary.mieterKostenanteile !== undefined ? d.num(item.summary.mieterKostenanteile) : 0;
    const prepayments = item.summary.vorauszahlungen !== undefined ? d.num(item.summary.vorauszahlungen) : 0;
    if (item.summary.mieterKostenanteile !== undefined && item.summary.vorauszahlungen !== undefined) {
      return shares - prepayments - recordCorrections(item);
    }
    return d.num(item.summary.saldo);
  }

  function collectIdMigrationWarnings(data) {
    const d = requireDeps();
    const warnings = [];
    if (!data || typeof data !== "object") return warnings;
    const conversions = [];
    if (Array.isArray(data.wohnungen)) {
      data.wohnungen.forEach(unit => {
        if (!unit) return;
        const oldId = String(unit.id || "").trim();
        const nextId = d.canonicalUnitIdFor(unit);
        if (oldId && nextId && oldId !== nextId) conversions.push(oldId + " -> " + nextId);
        if (oldId && !nextId) warnings.push("Wohnungs-ID kann nicht automatisch normalisiert werden: " + oldId);
      });
    }
    if (Array.isArray(data.mieter)) {
      data.mieter.filter(d.hasTenantData).forEach(tenant => {
        if (!tenant || !tenant.wohnung) return;
        const nextId = d.canonicalUnitIdFor(tenant.wohnung);
        if (!nextId && String(tenant.wohnung || "").trim()) warnings.push("Mieter " + (tenant.id || tenant.name || "ohne ID") + " verweist auf nicht normalisierbare Wohnung: " + tenant.wohnung);
      });
    }
    if (conversions.length) warnings.push("Alte Wohnungs-IDs werden beim Laden migriert: " + conversions.slice(0, 6).join(", ") + (conversions.length > 6 ? " ..." : ""));
    return warnings;
  }

  function validateItem(item) {
    const d = requireDeps();
    const errors = [];
    const warnings = [];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push("Archivdatensatz ist leer oder beschädigt.");
      return Object.freeze({ errors:Object.freeze(errors), warnings:Object.freeze(warnings), valid:false });
    }

    const sourceMeta = meta(item);
    const sourceData = item.data && typeof item.data === "object" && !Array.isArray(item.data) ? item.data : null;
    if (item.snapshotStatus === d.billingSnapshot.BILLING_SNAPSHOT_STATUS_COMPLETE) {
      const validation = d.validateBillingSnapshot(item);
      (validation.errors || []).forEach(entry => errors.push(entry.message || String(entry)));
      (validation.warnings || []).forEach(entry => warnings.push(entry.message || String(entry)));
    } else if (item.snapshotStatus === d.billingSnapshot.BILLING_SNAPSHOT_STATUS_LEGACY_PARTIAL) {
      warnings.push(item.legacySnapshotNotice || "Historischer Abrechnungsstand ist nur teilweise als neuer Snapshot rekonstruierbar.");
    }
    const sourceSchema = item.schemaVersion || (sourceData && sourceData.meta && sourceData.meta.dataSchemaVersion) || (sourceMeta && sourceMeta.dataSchemaVersion) || "";
    collectIdMigrationWarnings(sourceData).forEach(message => warnings.push(message));

    let prepared = null;
    try {
      prepared = prepareItem(item);
    } catch(error) {
      errors.push("Archivdaten konnten nicht normalisiert werden: " + d.errorMessage(error));
      prepared = normalizeItem(d.clone(item));
    }

    const preparedMeta = meta(prepared || item);
    const data = prepared && prepared.data;
    const year = String((prepared && prepared.year) || preparedMeta.abrechnungsjahr || "").trim();
    if (!year) warnings.push("Abrechnungsjahr fehlt.");
    else if (!/\d{4}/.test(year)) warnings.push("Abrechnungsjahr ist ungewöhnlich: " + year);
    if (!prepared.archivedAt) warnings.push("Archivdatum fehlt.");

    if (!sourceSchema) warnings.push("Datenschema-Version fehlt im Archiv; der Datensatz wird beim Laden auf v" + d.dataSchemaVersion + " normalisiert.");
    else if (Number(sourceSchema) < Number(d.dataSchemaVersion)) warnings.push("Archivdatensatz nutzt altes Datenschema v" + sourceSchema + " und wird beim Laden auf v" + d.dataSchemaVersion + " migriert.");

    if (sourceData) {
      if (Array.isArray(sourceData.wohnungen) && !sourceData.wohnungen.length) errors.push("Keine Wohnungen im ursprünglichen Archivdatensatz vorhanden.");
      if (Array.isArray(sourceData.mieter) && !sourceData.mieter.filter(d.hasTenantData).length) errors.push("Keine befüllten Mietverhältnisse im ursprünglichen Archivdatensatz vorhanden.");
      if (Array.isArray(sourceData.kostenarten) && !sourceData.kostenarten.length) errors.push("Keine Kostenarten im ursprünglichen Archivdatensatz vorhanden.");
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      errors.push("Archivdaten fehlen.");
      return Object.freeze({ errors:Object.freeze(errors), warnings:Object.freeze(warnings), valid:false });
    }

    if (!Array.isArray(data.wohnungen)) errors.push("Wohnungen fehlen im Archivdatensatz.");
    else if (!data.wohnungen.length) errors.push("Keine Wohnungen im Archivdatensatz vorhanden.");
    if (!Array.isArray(data.mieter)) errors.push("Mietverhältnisse fehlen im Archivdatensatz.");
    else if (!data.mieter.filter(d.hasTenantData).length) warnings.push("Keine befüllten Mietverhältnisse im Archivdatensatz gefunden.");
    if (!Array.isArray(data.kostenarten)) errors.push("Kostenarten fehlen im Archivdatensatz.");
    else if (!data.kostenarten.length) errors.push("Keine Kostenarten im Archivdatensatz vorhanden.");
    if (!data.meta || typeof data.meta !== "object") warnings.push("Periodendaten fehlen im Archivdatensatz.");

    const dataMeta = data.meta || {};
    const start = preparedMeta.abrechnungsbeginn || dataMeta.abrechnungsbeginn || "";
    const end = preparedMeta.abrechnungsende || dataMeta.abrechnungsende || "";
    if (!start || !end) warnings.push("Abrechnungszeitraum fehlt oder ist unvollständig.");
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) warnings.push("Abrechnungszeitraum hat kein erwartetes Datumsformat.");
    else if (start > end) errors.push("Abrechnungszeitraum im Archiv ist ungültig.");

    if (Array.isArray(data.wohnungen) && Array.isArray(data.mieter)) {
      const unitIds = new Set(data.wohnungen.map(unit => unit && unit.id).filter(Boolean));
      data.mieter.filter(d.hasTenantData).forEach(tenant => {
        const unitId = d.canonicalUnitIdFor(tenant.wohnung) || tenant.wohnung || "";
        if (unitId && !unitIds.has(unitId)) warnings.push("Mieter " + (tenant.id || tenant.name || "ohne ID") + " verweist auf unbekannte Wohnung " + unitId + ".");
      });
    }

    const summary = prepared.summary || item.summary || null;
    if (!summary || typeof summary !== "object") warnings.push("Archiv-Zusammenfassung fehlt; Saldo kann nur eingeschränkt geprüft werden.");
    else if (!["saldo", "mieterKostenanteile", "vorauszahlungen", "kostenNK"].some(key => summary[key] !== undefined && summary[key] !== null && summary[key] !== "")) {
      warnings.push("Archiv-Summenfelder fehlen; Saldo ist nicht nachvollziehbar berechenbar.");
    }

    return Object.freeze({ errors:Object.freeze(errors), warnings:Object.freeze(warnings), valid:errors.length === 0 });
  }

  function recordStatus(item) {
    const validation = validateItem(item);
    if (validation.errors.length) return "Fehler";
    if (validation.warnings.length) return "Prüfen";
    return "Archiviert";
  }

  function recordStatusClass(item) {
    const validation = validateItem(item);
    if (validation.errors.length) return "err";
    if (validation.warnings.length) return "warn";
    return "ok";
  }

  function recordHealth(item) {
    const validation = validateItem(item);
    return Object.freeze({ validation, status:recordStatus(item), className:recordStatusClass(item) });
  }

  function validationMessage(validation) {
    const messages = [];
    if (validation && validation.errors) messages.push(...validation.errors);
    if (validation && validation.warnings) messages.push(...validation.warnings);
    return messages.map(message => "- " + message).join("\n");
  }

  function recordStatusLite(item) {
    if (!item || typeof item !== "object" || !item.data || typeof item.data !== "object") return Object.freeze({ label:"Prüfen", className:"warn" });
    return Object.freeze({ label:"Archiviert", className:"ok" });
  }

  function hasNonEmptyAnnualData(data = current()) {
    const d = requireDeps();
    if (!data || typeof data !== "object") return false;
    const costs = Array.isArray(data.kostenarten) ? data.kostenarten : [];
    if (costs.some(cost => cost && String(cost.inNK || "") === "Ja" && Math.abs(d.num(cost.gesamtbetrag)) > 0.004)) return true;
    const prepayments = Array.isArray(data.vorauszahlungen) ? data.vorauszahlungen : [];
    if (prepayments.some(row => row && (Math.abs(d.num(row.summe)) > 0.004 || (Array.isArray(row.werte) && row.werte.some(value => Math.abs(d.num(value)) > 0.004))))) return true;
    const tenants = Array.isArray(data.mieter) ? data.mieter : [];
    if (tenants.some(tenant => tenant && tenant.id && tenant.name && (Math.abs(d.num(tenant.kaltErhalten)) > 0.004 || Math.abs(d.num(tenant.nkVoraus)) > 0.004 || Math.abs(d.num(tenant.einnahmen)) > 0.004 || Math.abs(d.num(tenant.vorjahresKorrektur)) > 0.004 || Math.abs(d.num(tenant.kaltmietKorrektur)) > 0.004))) return true;
    const inputs = data.umlageInputs && typeof data.umlageInputs === "object" ? data.umlageInputs : {};
    if (Object.values(inputs).some(row => row && Array.isArray(row.values) && row.values.some(value => Math.abs(d.num(value)) > 0.004))) return true;
    const water = data.waterMeters || {};
    if (water.settings && Math.abs(d.num(water.settings.houseWaterTotal)) > 0.004) return true;
    if (Array.isArray(water.readings) && water.readings.some(row => row && (Math.abs(d.num(row.kwEnd) - d.num(row.kwStart)) > 0.004 || Math.abs(d.num(row.wwEnd) - d.num(row.wwStart)) > 0.004 || row.kwEndDate || row.wwEndDate))) return true;
    return false;
  }

  function isClosedAfterArchive(data = current()) {
    const itemMeta = data && data.meta ? data.meta : {};
    return !!(itemMeta.currentBillingArchivedOnly || itemMeta.currentBillingClosedAfterArchive);
  }

  function clearClosure(data) {
    if (!data.meta) data.meta = {};
    delete data.meta.currentBillingArchivedOnly;
    delete data.meta.currentBillingClosedAfterArchive;
    delete data.meta.currentBillingArchivedAt;
    delete data.meta.currentBillingArchivedWithAppVersion;
    delete data.meta.currentBillingArchivedPeriodId;
    delete data.meta.currentBillingArchivedHinweis;
    return data;
  }

  function closeAfterArchive(data, snapshot) {
    const d = requireDeps();
    if (!data.meta) data.meta = {};
    data.meta.currentBillingArchivedOnly = true;
    data.meta.currentBillingClosedAfterArchive = true;
    data.meta.currentBillingArchivedAt = d.nowIso();
    data.meta.currentBillingArchivedWithAppVersion = d.appVersion;
    data.meta.currentBillingArchivedPeriodId = snapshot && snapshot.periodId ? snapshot.periodId : periodId(snapshot || {});
    data.meta.currentBillingArchivedHinweis = "Diese Abrechnung wurde über die Startseite archiviert. Es wurde keine Folgeabrechnung automatisch angelegt.";
    delete data.meta.currentBillingCreatedByUser;
    delete data.meta.currentBillingExplicitlyCreated;
    delete data.meta.preparedFromPreviousYear;
    return data;
  }

  function hasActiveCurrentBilling(data = current()) {
    const d = requireDeps();
    const itemMeta = data && data.meta ? data.meta : {};
    if (d.isArchiveViewer()) return true;
    if (isClosedAfterArchive(data)) return false;
    if (itemMeta.currentBillingCreatedByUser || itemMeta.currentBillingExplicitlyCreated || itemMeta.preparedFromPreviousYear || itemMeta.currentBillingFinalized || itemMeta.currentBillingFinalizedAt) return true;
    return hasNonEmptyAnnualData(data);
  }

  function upsertInto(data, snapshot) {
    if (!data || typeof data !== "object") return Object.freeze({ ok:false, error:"Arbeitszustand fehlt.", validation:null });
    if (!Array.isArray(data.jahresArchiv)) data.jahresArchiv = [];
    let item;
    try {
      item = prepareItem(snapshot);
    } catch(error) {
      return Object.freeze({ ok:false, error:"Archivdatensatz konnte nicht vorbereitet werden: " + requireDeps().errorMessage(error), validation:null });
    }
    const validation = validateItem(item);
    if (validation.errors.length) return Object.freeze({ ok:false, error:"Archivdatensatz ist ungültig.", validation, item });
    if (!item.periodId) item.periodId = periodId(item);
    const id = periodId(item);
    const index = data.jahresArchiv.findIndex(entry => periodId(entry) === id);
    if (index >= 0) data.jahresArchiv[index] = item;
    else data.jahresArchiv.push(item);
    data.jahresArchiv.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
    return Object.freeze({ ok:true, item, id, replaced:index >= 0, validation });
  }

  function archiveCurrent(options = {}) {
    const d = requireDeps();
    const data = current();
    if (!hasActiveCurrentBilling(data)) return Object.freeze({ changed:false, reason:"missing-current-billing", message:"Es ist noch keine aktuelle Abrechnung angelegt. Bitte zuerst über „+ Neue Abrechnung“ starten." });
    if (d.isArchiveViewer()) return Object.freeze({ changed:false, reason:"archive-viewer", message:"Dieses Fenster zeigt eine archivierte Abrechnung. Archivieren ist nur im ursprünglichen Arbeitsfenster möglich." });
    const year = d.currentYear();
    if (options.confirmed !== true) {
      return Object.freeze({
        changed:false,
        requiresConfirmation:true,
        confirmationMessage:"Abrechnungsjahr " + year + " jetzt im Archiv speichern? Ein vorhandener Archivstand für dieses Jahr wird ersetzt. Es wird keine neue Folgeabrechnung angelegt."
      });
    }
    return d.stateAccess.transact(next => {
      const snapshot = d.createSnapshot();
      const result = upsertInto(next, snapshot);
      if (!result.ok) throw new Error(result.error + (result.validation ? " " + validationMessage(result.validation) : ""));
      closeAfterArchive(next, result.item);
      return Object.freeze({
        changed:true,
        year:String(year),
        archiveId:result.id,
        targetTab:"archiv",
        message:"Abrechnungsjahr " + year + " wurde archiviert. Es wurde keine neue Abrechnung angelegt; der Archivdatensatz ist jetzt im Archiv sichtbar."
      });
    }, { reason:"Archivierung", render:false, allowFinalizationWrite:true });
  }

  function deleteAt(index, options = {}) {
    const d = requireDeps();
    if (d.isArchiveViewer()) return Object.freeze({ changed:false, reason:"archive-viewer", message:"Archivdatensätze können nur im ursprünglichen Arbeitsfenster gelöscht werden." });
    const numericIndex = Number(index);
    const item = Array.isArray(current().jahresArchiv) ? current().jahresArchiv[numericIndex] : null;
    if (!item) return Object.freeze({ changed:false, reason:"missing-archive", message:"Diese archivierte Abrechnung wurde nicht gefunden." });
    const label = itemLabel(item, numericIndex);
    if (options.confirmed !== true) return Object.freeze({ changed:false, requiresConfirmation:true, confirmationMessage:"Archivdatensatz endgültig löschen: " + label + "?" });
    return d.stateAccess.transact(data => {
      if (!Array.isArray(data.jahresArchiv) || numericIndex < 0 || numericIndex >= data.jahresArchiv.length) throw new Error("Archivdatensatz wurde zwischenzeitlich verändert.");
      data.jahresArchiv.splice(numericIndex, 1);
      return Object.freeze({ changed:true, label, targetTab:"archiv", message:"Archivdatensatz wurde gelöscht: " + label });
    }, { reason:"Archiv löschen", render:false, allowFinalizationWrite:true });
  }

  function importItems(items) {
    const d = requireDeps();
    const source = Array.isArray(items) ? items : [];
    if (!source.length) return Object.freeze({ changed:false, imported:0, reason:"empty-import" });
    return d.stateAccess.transact(data => {
      const imported = [];
      source.forEach(item => {
        const result = upsertInto(data, item);
        if (!result.ok) throw new Error(result.error + (result.validation ? " " + validationMessage(result.validation) : ""));
        imported.push(result.id);
      });
      return Object.freeze({ changed:true, imported:imported.length, archiveIds:Object.freeze(imported.slice()), targetTab:"archiv", message:imported.length + " Archivdatensatz/Archivdatensätze wurden importiert." });
    }, { reason:"Archivimport", render:false, allowFinalizationWrite:true });
  }

  function viewerStateFromItem(item) {
    const d = requireDeps();
    const archiveItem = prepareItem(item);
    const validation = validateItem(archiveItem);
    if (validation.errors.length) throw new Error("Archivdatensatz ist unvollständig: " + validation.errors.join(" "));
    const viewerState = d.normalizeLegacyData(d.clone(archiveItem.data || {}), { scope:d.snapshotScope });
    if (!viewerState.meta) viewerState.meta = {};
    viewerState.meta.archiveViewer = true;
    viewerState.meta.archivedAt = archiveItem.archivedAt || "";
    viewerState.meta.archivedYear = archiveItem.year || "";
    viewerState.meta.dataSchemaVersion = d.dataSchemaVersion;
    viewerState.meta.dataLayerRole = "archiveViewerRuntime";
    viewerState.jahresArchiv = [];
    const working = current();
    viewerState.waterMeterHistory = d.clone((working && working.waterMeterHistory) || d.defaultWaterMeterHistory());
    d.ensureWaterMeterHistory(viewerState);
    d.masterDataActions.ensureStammdatenData(viewerState);
    return viewerState;
  }

  function reopenForRework(index, options = {}) {
    const d = requireDeps();
    if (d.isArchiveViewer()) return Object.freeze({ changed:false, reason:"archive-viewer", message:"Dieses Fenster zeigt eine archivierte Abrechnung. Eine Korrektur kann nur über die Abrechnungsübersicht des ursprünglichen Arbeitsfensters geöffnet werden." });
    const numericIndex = Number(index);
    const item = Array.isArray(current().jahresArchiv) ? current().jahresArchiv[numericIndex] : null;
    if (!item) return Object.freeze({ changed:false, reason:"missing-archive", message:"Diese archivierte Abrechnung wurde nicht gefunden." });
    const label = itemLabel(item, numericIndex);
    if (options.confirmed !== true) {
      return Object.freeze({
        changed:false,
        requiresConfirmation:true,
        confirmationMessage:"Der aktuelle Arbeitsstand wird durch den Archivstand ersetzt: " + label + ". Der Archivdatensatz bleibt im Jahresarchiv erhalten. Vorher sollte eine Gesamt-JSON-Sicherung vorhanden sein."
      });
    }
    if (String(options.confirmationCode || "").trim().toUpperCase() !== "KORREKTUR") {
      return Object.freeze({ changed:false, requiresPrompt:true, promptMessage:"Gib zur Bestätigung KORREKTUR ein. Der aktuelle Arbeitsstand wird ersetzt, der Archivdatensatz bleibt erhalten." });
    }
    return d.stateAccess.transact(data => {
      const prepared = prepareItem(item);
      const restored = d.normalizeLegacyData(d.clone(prepared.data || {}), { scope:d.snapshotScope });
      const preservedArchive = d.clone(data.jahresArchiv || []);
      const preservedMasterData = d.clone(data.stammdaten || {});
      const preservedHistory = d.clone(data.waterMeterHistory || restored.waterMeterHistory || {});
      const preservedOperationalMeta = d.clone(data.meta || {});
      if (!restored.meta) restored.meta = {};
      if (typeof d.copyWorkingOperationalMeta === "function") d.copyWorkingOperationalMeta(restored.meta, preservedOperationalMeta);
      restored.meta.archiveViewer = false;
      delete restored.meta.archiveReturnUrl;
      delete restored.meta.archivedAt;
      delete restored.meta.archivedYear;
      restored.meta.reopenedFromArchiveAt = d.nowIso();
      restored.meta.reopenedFromArchiveWithAppVersion = d.appVersion;
      restored.meta.reopenedFromArchiveLabel = label;
      restored.meta.currentBillingCreatedByUser = true;
      restored.meta.currentBillingCreatedAt = restored.meta.currentBillingCreatedAt || d.nowIso();
      restored.meta.currentBillingCreatedWithAppVersion = d.appVersion;
      restored.meta.dataLayerContractVersion = d.dataLayerContractVersion;
      restored.meta.dataLayerRole = "workingState";
      restored.meta.storageRole = "working";
      clearClosure(restored);
      restored.stammdaten = preservedMasterData;
      restored.waterMeterHistory = preservedHistory;
      restored.jahresArchiv = preservedArchive;
      d.masterDataActions.ensureStammdatenData(restored);
      d.ensureWaterMeterHistory(restored);
      if (typeof d.clearFinalization === "function") d.clearFinalization(restored);
      Object.keys(data).forEach(key => delete data[key]);
      Object.assign(data, restored);
      return Object.freeze({ changed:true, label, targetTab:"mieter", message:"Archivierte Abrechnung wurde zur Korrektur geöffnet: " + label });
    }, { reason:"Archivkorrektur", render:false, allowFinalizationWrite:true });
  }

  function buildLegacyArchiveState(entries) {
    const d = requireDeps();
    const rows = Array.isArray(entries) ? entries : [];
    const year = rows.map(entry => entry.jahr).filter(Boolean)[0] || String(new Date().getFullYear());
    const starts = rows.map(entry => String(entry.periode || "").split(" bis ")[0]).filter(Boolean).sort();
    const ends = rows.map(entry => String(entry.periode || "").split(" bis ")[1]).filter(Boolean).sort();
    const start = starts[0] || (year + "-01-01");
    const end = ends[ends.length - 1] || (year + "-12-31");
    const period = "legacy-" + year + "-" + start + "_" + end + "-" + Date.now();
    const base = d.clone(d.seed());
    base.jahresArchiv = [];
    base.meta = { abrechnungsjahr:year, abrechnungsbeginn:start, abrechnungsende:end, periodId:period, legacySammelArchiv:true, legacyTeilperioden:true, legacyArchivHinweis:"Reine Archivierung: importierte Einzelabrechnungen je Mieter/Wohnung.", legacyQuelle:"Lokaler Mehrfachupload im Browser" };
    const units = [];
    rows.forEach(entry => { if (entry.wohnung && !units.includes(entry.wohnung)) units.push(entry.wohnung); });
    if (!units.length) units.push("Import");
    base.wohnungen = units.map((label, index) => ({ id:d.canonicalUnitIdFor({ bezeichnung:label, lage:label }) || d.generatedUnitIdForLabel(label, index), bezeichnung:label, lage:label, wohnflaeche:55, zimmer:"", status:"aktiv", bemerkung:"Import" }));
    const unitId = {};
    base.wohnungen.forEach(unit => { unitId[unit.bezeichnung] = unit.id; });
    base.mieter = rows.map((entry, index) => ({ id:"M" + String(index + 1).padStart(3, "0"), wohnung:unitId[entry.wohnung] || base.wohnungen[0].id, name:entry.mieter, einzug:(entry.periode || "").split(" bis ")[0] || start, auszug:(entry.periode || "").split(" bis ")[1] || end, kaltSoll:0, kaltErhalten:0, nkVoraus:entry.vorauszahlung, einnahmen:entry.vorauszahlung, aktiveTage:365, wohnflaeche:55, bemerkung:"Import: Heizung " + (entry.heizPeriode || "") + ", Wasser " + (entry.wasserPeriode || "") + ", Abfall " + (entry.abfallPeriode || ""), status:"Aktiv", personen:1, personentage:365, geschlecht:"Frau/Herr", standardanrede:"Sehr geehrte(r) Mieter/in,", strasse:"Am Rauhen Biehl 5", plz:"55774", ort:"Baumholder", telefon:"", email:"", wasserWeitereVorauszahlung:0, vorjahresKorrektur:0, kaltmietKorrektur:0, abrechnungRolle:"Mieter", archivedAt:"" }));

    const costIds = ["K006", "K002", "K009", "K040"];
    const sums = { K006:0, K002:0, K009:0, K040:0 };
    rows.forEach(entry => { sums.K006 += d.num(entry.heizkosten); sums.K002 += d.num(entry.wasserkosten); sums.K009 += d.num(entry.abfallkosten); sums.K040 += d.num(entry.rundung); });
    base.kostenarten.forEach(cost => {
      if (costIds.includes(cost.id)) {
        if (cost.id === "K040") cost.kostenart = "Rundung";
        cost.inNK = "Ja"; cost.vorauszahlung = cost.id === "K040" ? "Nein" : "Ja"; cost.berechnungsart = "Manuell je Mieter"; cost.umlageschluessel = d.umlageManual; cost.gesamtbetrag = Math.round(sums[cost.id] * 100) / 100; cost.preisProEinheit = ""; cost.status = "Vollständig"; cost.bemerkung = "Import je Einzelabrechnung";
      } else if (cost.kostenart) {
        cost.inNK = "Nein"; cost.vorauszahlung = "Nein"; cost.berechnungsart = "Entfällt"; cost.umlageschluessel = "Entfällt"; cost.gesamtbetrag = 0; cost.preisProEinheit = ""; cost.status = "Nicht Bestandteil der NK-Abrechnung";
      }
    });
    const length = Math.max(20, rows.length);
    const fill = values => { const output = values.slice(); while (output.length < length) output.push(0); return output; };
    const values = { K006:fill(rows.map(entry => d.num(entry.heizkosten))), K002:fill(rows.map(entry => d.num(entry.wasserkosten))), K009:fill(rows.map(entry => d.num(entry.abfallkosten))), K040:fill(rows.map(entry => d.num(entry.rundung))) };
    base.umlageInputs = {
      K006:{ kostenId:"K006", kostenart:"Heiz- und Warmwasserkosten", art:d.umlageManual, values:values.K006 },
      K002:{ kostenId:"K002", kostenart:"Wasserversorgung", art:d.umlageManual, values:values.K002 },
      K009:{ kostenId:"K009", kostenart:"Müllbeseitigung", art:d.umlageManual, values:values.K009 },
      K040:{ kostenId:"K040", kostenart:"Rundung", art:d.umlageManual, values:values.K040 }
    };
    const heating = rows.map(entry => d.num(entry.vHeiz));
    const water = rows.map(entry => d.num(entry.vWasser));
    const waste = rows.map(entry => d.num(entry.vAbfall));
    const known = heating.reduce((sum, value) => sum + value, 0) + water.reduce((sum, value) => sum + value, 0) + waste.reduce((sum, value) => sum + value, 0);
    if (!known) rows.forEach((entry, index) => { heating[index] = d.num(entry.vorauszahlung); });
    base.vorauszahlungen = [
      { kostenId:"K006", kostenart:"Heiz- und Warmwasserkosten", aktiv:"Ja", summe:Math.round(heating.reduce((sum, value) => sum + value, 0) * 100) / 100, werte:fill(heating) },
      { kostenId:"K002", kostenart:"Wasserversorgung", aktiv:"Ja", summe:Math.round(water.reduce((sum, value) => sum + value, 0) * 100) / 100, werte:fill(water) },
      { kostenId:"K009", kostenart:"Müllbeseitigung", aktiv:"Ja", summe:Math.round(waste.reduce((sum, value) => sum + value, 0) * 100) / 100, werte:fill(waste) }
    ];
    base.legacyEinzelabrechnungen = rows;
    base.waterMeters = { settings:{ enabled:"Nein", houseWaterTotal:0 }, readings:[] };
    base.meterReadings = { readings:{} };
    if (base.briefSettings) base.briefSettings.abrechnungsjahr = year;
    return Object.freeze({ base, periodId:period, year, start, end });
  }

  function createLegacyArchiveItem(entries) {
    const d = requireDeps();
    const rows = Array.isArray(entries) ? entries : [];
    const built = buildLegacyArchiveState(rows);
    const costs = rows.reduce((sum, entry) => sum + d.num(entry.kostenanteil), 0);
    const prepays = rows.reduce((sum, entry) => sum + d.num(entry.vorauszahlung), 0);
    return {
      year:built.year,
      periodId:built.periodId,
      archivedAt:d.todayIso(),
      meta:d.clone(built.base.meta),
      summary:{ mietverhaeltnisse:rows.length, datensaetzeUmlagebasis:rows.length, eigentuemerPrivatDatensaetze:0, kostenNK:Math.round(costs * 100) / 100, vorauszahlungen:Math.round(prepays * 100) / 100, mieterKostenanteile:Math.round(costs * 100) / 100, korrekturen:0, saldo:Math.round((costs - prepays) * 100) / 100, legacyEinzelabrechnungen:rows.length },
      data:built.base
    };
  }

  function describe() {
    return Object.freeze({
      configured:!!deps,
      actions:Object.freeze(["archiveCurrent", "reopenForRework", "deleteAt", "importItems"]),
      readers:Object.freeze(["validateItem", "viewerStateFromItem", "recordHealth"]),
      mutators:Object.freeze(["upsertInto", "clearClosure", "closeAfterArchive"])
    });
  }

  global.NKProArchiveActions = Object.freeze({
    configure, describe, yearNumber, recordType, meta, periodId, sortKey, periodLabel, itemLabel,
    recordCorrections, recordSaldo, normalizeItem, prepareItem, collectIdMigrationWarnings, validateItem,
    recordStatus, recordStatusClass, recordHealth, validationMessage, recordStatusLite,
    hasNonEmptyAnnualData, isClosedAfterArchive, clearClosure, closeAfterArchive, hasActiveCurrentBilling,
    upsertInto, archiveCurrent, deleteAt, importItems, viewerStateFromItem, reopenForRework,
    buildLegacyArchiveState, createLegacyArchiveItem
  });
})(globalThis);
