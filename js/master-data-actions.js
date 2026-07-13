(function(global) {
  "use strict";

  let deps = null;

  function configure(options = {}) {
    if (deps) return describe();
    if (!options.stateAccess || typeof options.stateAccess.current !== "function" || typeof options.stateAccess.transact !== "function") {
      throw new Error("Stammdatenaktionen benötigen NKProStateAccess.");
    }
    const required = [
      "clone", "num", "ensureUnitIdentityFields", "generatedUnitIdForLabel", "hasTenantData",
      "ensureTenantContactFields", "ensureTenantIdentityFields", "canonicalUnitIdFor", "isArchivedTenant",
      "tenantActiveDaysInCurrentPeriod", "tenantOpenStatus", "normalizeActiveDayValue", "periodDaysExact",
      "tenantRelevantForCurrentBilling", "syncVorauszahlungen", "syncUmlageInputs", "ensureWaterMeterData",
      "syncKostenartenMieterUmlage", "applyWaterMetersToUmlage", "updateTenantPrepaymentTotals",
      "isoDateSerial", "hasEnteredMeterValue", "todayIso", "currentYear", "isArchiveViewer"
    ];
    required.forEach(name => {
      if (typeof options[name] !== "function") throw new Error("Stammdatenabhängigkeit fehlt: " + name);
    });
    deps = Object.freeze({ ...options });
    return describe();
  }

  function requireDeps() {
    if (!deps) throw new Error("Stammdatenaktionen wurden noch nicht konfiguriert.");
    return deps;
  }

  function current() {
    return requireDeps().stateAccess.current();
  }

  function normalizeMasterUnitRows(rows) {
    const d = requireDeps();
    const source = Array.isArray(rows) ? rows : [];
    const seen = new Set();
    return source.map((unit, index) => {
      const row = d.clone(unit || {});
      d.ensureUnitIdentityFields(row);
      if (!row.id) row.id = d.generatedUnitIdForLabel(row.bezeichnung || row.lage || "Wohnung", index);
      delete row.status;
      if (row.bemerkung === undefined || row.bemerkung === null) row.bemerkung = "";
      return row;
    }).filter(row => {
      const id = String(row.id || "");
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).sort((a, b) => String(a.id || "").localeCompare(String(b.id || ""), "de"));
  }

  function normalizeBillingUnitRows(masterRows, existingRows) {
    const statusById = new Map((Array.isArray(existingRows) ? existingRows : []).map(unit => [
      String(unit && unit.id || ""),
      String(unit && unit.status || "aktiv")
    ]));
    return normalizeMasterUnitRows(masterRows).map(unit => ({
      ...unit,
      status:statusById.get(String(unit.id || "")) || "aktiv"
    }));
  }

  function normalizeMasterTenantRows(rows) {
    const d = requireDeps();
    const source = Array.isArray(rows) ? rows : [];
    return source.filter(tenant => d.hasTenantData(tenant)).map(tenant => {
      const row = d.clone(tenant || {});
      if (row.status === "archiviert" || row.status === "Archiv") row.status = "Archiviert";
      if (row.status === "OK") row.status = row.auszug ? "NK offen" : "Aktiv";
      if (row.archivedAt === undefined || row.archivedAt === null) row.archivedAt = "";
      d.ensureTenantContactFields(row);
      d.ensureTenantIdentityFields(row);
      if (row.wohnung) row.wohnung = d.canonicalUnitIdFor(row.wohnung) || row.wohnung;
      return row;
    });
  }

  function ensureStammdatenData(data) {
    const d = requireDeps();
    if (!data || typeof data !== "object") return data;
    if (!data.stammdaten || typeof data.stammdaten !== "object" || Array.isArray(data.stammdaten)) data.stammdaten = {};
    if (!Array.isArray(data.stammdaten.wohnungen) || !data.stammdaten.wohnungen.length) {
      data.stammdaten.wohnungen = d.clone(Array.isArray(data.wohnungen) ? data.wohnungen : []);
    }
    if (!Array.isArray(data.stammdaten.mieter) || !data.stammdaten.mieter.length) {
      data.stammdaten.mieter = d.clone(Array.isArray(data.mieter) ? data.mieter.filter(tenant => d.hasTenantData(tenant)) : []);
    }
    data.stammdaten.wohnungen = normalizeMasterUnitRows(data.stammdaten.wohnungen);
    data.stammdaten.mieter = normalizeMasterTenantRows(data.stammdaten.mieter);
    return data;
  }

  function masterData(data = current()) {
    ensureStammdatenData(data);
    return data.stammdaten;
  }

  function masterUnits(data = current()) {
    return masterData(data).wohnungen;
  }

  function masterTenants(data = current()) {
    return masterData(data).mieter;
  }

  function masterTenantCount(data = current()) {
    const d = requireDeps();
    return masterTenants(data).filter(tenant => tenant && tenant.name && !d.isArchivedTenant(tenant)).length;
  }

  function masterVisibleTenantRows(data = current()) {
    const d = requireDeps();
    return masterTenants(data)
      .map((tenant, index) => ({ ...tenant, originalIndex:index }))
      .filter(tenant => d.hasTenantData(tenant) && !d.isArchivedTenant(tenant));
  }

  function masterArchivedTenantRows(data = current()) {
    const d = requireDeps();
    return masterTenants(data)
      .map((tenant, index) => ({ ...tenant, originalIndex:index }))
      .filter(tenant => d.hasTenantData(tenant) && d.isArchivedTenant(tenant));
  }

  function nextMasterMietId(data = current()) {
    const maxNum = masterTenants(data).reduce((max, tenant) => {
      const match = String(tenant.id || "").match(/^M(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    return "M" + String(maxNum + 1).padStart(3, "0");
  }

  function createMasterTenancyRow(data = current()) {
    return {
      id:nextMasterMietId(data),
      wohnung:"",
      name:"",
      einzug:"",
      auszug:"",
      kaltSoll:0,
      kaltErhalten:0,
      nkVoraus:0,
      einnahmen:0,
      aktiveTage:365,
      wohnflaeche:0,
      bemerkung:"",
      status:"Aktiv",
      personen:1,
      personentage:365,
      geschlecht:"Frau/Herr",
      standardanrede:"Automatisch",
      strasse:"Am Rauhen Biehl 5",
      plz:"55774",
      ort:"Baumholder",
      telefon:"",
      email:"",
      abrechnungRolle:"Mieter",
      wasserWeitereVorauszahlung:0,
      vorjahresKorrektur:0,
      archivedAt:""
    };
  }

  function setBillingUnitStatus(index, value) {
    const data = current();
    if (!Array.isArray(data.wohnungen) || !data.wohnungen[Number(index)]) return Object.freeze({ changed:false, reason:"missing-unit" });
    return requireDeps().stateAccess.transact(next => {
      next.wohnungen[Number(index)].status = value === "inaktiv" ? "inaktiv" : "aktiv";
      return Object.freeze({ changed:true, index:Number(index) });
    }, { reason:"Benutzereingabe", tabId:"mieter" });
  }

  function setMasterNested(collection, index, key, value, type = "text") {
    const data = current();
    const master = masterData(data);
    const numericIndex = Number(index);
    if (!Array.isArray(master[collection]) || !master[collection][numericIndex]) return Object.freeze({ changed:false, reason:"missing-row" });
    return requireDeps().stateAccess.transact(next => {
      const d = requireDeps();
      const target = masterData(next);
      const normalizedValue = type === "number" ? d.num(value) : value;
      target[collection][numericIndex][key] = normalizedValue;
      if (collection === "wohnungen") target[collection] = normalizeMasterUnitRows(target[collection]);
      if (collection === "mieter") target[collection] = normalizeMasterTenantRows(target[collection]);
      return Object.freeze({ changed:true, collection, index:numericIndex, key });
    }, { reason:"Benutzereingabe" });
  }

  function addMasterTenancy() {
    return requireDeps().stateAccess.transact(data => {
      const row = createMasterTenancyRow(data);
      masterData(data).mieter.push(row);
      return Object.freeze({ changed:true, id:row.id });
    }, { reason:"Benutzereingabe" });
  }

  function archiveMasterTenancy(index, options = {}) {
    const d = requireDeps();
    const numericIndex = Number(index);
    const row = masterTenants()[numericIndex];
    if (!row || !d.hasTenantData(row)) return Object.freeze({ changed:false, reason:"missing-row" });
    if (options.confirmed !== true) {
      return Object.freeze({
        changed:false,
        requiresConfirmation:true,
        confirmationMessage:"Dieses Mietverhältnis im zentralen Bestand archivieren? Es wird dann nicht mehr automatisch in neue Abrechnungen übernommen."
      });
    }
    return d.stateAccess.transact(data => {
      const target = masterTenants(data)[numericIndex];
      target.status = "Archiviert";
      target.archivedAt = d.todayIso();
      return Object.freeze({ changed:true, id:target.id || "" });
    }, { reason:"Benutzereingabe" });
  }

  function restoreMasterTenancy(index) {
    const numericIndex = Number(index);
    const row = masterTenants()[numericIndex];
    if (!row) return Object.freeze({ changed:false, reason:"missing-row" });
    return requireDeps().stateAccess.transact(data => {
      const target = masterTenants(data)[numericIndex];
      target.status = target.auszug ? "NK offen" : "Aktiv";
      target.archivedAt = "";
      return Object.freeze({ changed:true, id:target.id || "" });
    }, { reason:"Benutzereingabe" });
  }

  function tenantBillingCopyFromMaster(masterTenant, periodDays) {
    const d = requireDeps();
    const row = d.clone(masterTenant || {});
    d.ensureTenantContactFields(row);
    d.ensureTenantIdentityFields(row);
    const activeDays = d.tenantActiveDaysInCurrentPeriod(row) || periodDays;
    row.kaltSoll = d.num(row.kaltSoll);
    row.kaltErhalten = 0;
    row.nkVoraus = 0;
    row.vorjahresKorrektur = 0;
    row.wasserWeitereVorauszahlung = 0;
    row.einnahmen = 0;
    row.aktiveTage = activeDays;
    row.personen = d.num(row.personen) || 1;
    row.personentage = d.num(row.personen) * activeDays;
    row.archivedAt = row.archivedAt || "";
    row.status = d.tenantOpenStatus(row) || row.status || "";
    return row;
  }

  function applyStammdatenToCurrentBilling(data = current()) {
    const d = requireDeps();
    const periodDays = d.periodDaysExact();
    data.wohnungen = normalizeBillingUnitRows(masterUnits(data), data.wohnungen);
    data.mieter = masterTenants(data)
      .filter(tenant => d.tenantRelevantForCurrentBilling(tenant))
      .map(tenant => tenantBillingCopyFromMaster(tenant, periodDays));
    return data;
  }

  const BILLING_VALUE_FIELDS_TO_KEEP = Object.freeze([
    "kaltSoll", "kaltErhalten", "nkVoraus", "einnahmen", "wasserWeitereVorauszahlung",
    "vorjahresKorrektur", "vzChangeHeizung", "vzChangeWasser", "vzChangeAbfall", "vzChangeAntenne"
  ]);

  function tenantBillingCopyFromMasterKeepValues(masterTenant, existingTenant, periodDays) {
    const d = requireDeps();
    const row = d.clone(masterTenant || {});
    d.ensureTenantContactFields(row);
    d.ensureTenantIdentityFields(row);
    if (existingTenant) {
      BILLING_VALUE_FIELDS_TO_KEEP.forEach(key => {
        if (existingTenant[key] !== undefined) row[key] = existingTenant[key];
      });
    }
    row.kaltSoll = d.num(row.kaltSoll);
    row.kaltErhalten = d.num(row.kaltErhalten);
    row.nkVoraus = d.num(row.nkVoraus);
    row.vorjahresKorrektur = d.num(row.vorjahresKorrektur);
    row.wasserWeitereVorauszahlung = d.num(row.wasserWeitereVorauszahlung);
    row.einnahmen = d.num(row.kaltErhalten) + d.num(row.nkVoraus);
    row.aktiveTage = d.tenantActiveDaysInCurrentPeriod(row) || (existingTenant ? d.normalizeActiveDayValue(existingTenant.aktiveTage) : 0) || periodDays;
    row.personen = d.num(row.personen) || (existingTenant ? d.num(existingTenant.personen) : 0) || 1;
    row.personentage = d.num(row.personen) * d.normalizeActiveDayValue(row.aktiveTage);
    row.archivedAt = row.archivedAt || "";
    row.status = d.tenantOpenStatus(row) || row.status || "";
    return row;
  }

  function captureTenantIndexedValuesById(data, rows, valuesKey) {
    const d = requireDeps();
    const tenantIds = (Array.isArray(data.mieter) ? data.mieter : []).map(tenant => String(tenant && tenant.id || ""));
    const captured = {};
    (Array.isArray(rows) ? rows : []).forEach(row => {
      const rowId = String(row && (row.kostenId || row.id) || "");
      if (!rowId || !Array.isArray(row[valuesKey])) return;
      captured[rowId] = {};
      tenantIds.forEach((tenantId, index) => {
        if (tenantId) captured[rowId][tenantId] = d.num(row[valuesKey][index]);
      });
    });
    return captured;
  }

  function restoreTenantIndexedValuesById(data, rows, valuesKey, captured) {
    const d = requireDeps();
    const tenantIds = (Array.isArray(data.mieter) ? data.mieter : []).map(tenant => String(tenant && tenant.id || ""));
    (Array.isArray(rows) ? rows : []).forEach(row => {
      const rowId = String(row && (row.kostenId || row.id) || "");
      const byTenant = rowId ? captured[rowId] : null;
      if (!byTenant || !Array.isArray(row[valuesKey])) return;
      tenantIds.forEach((tenantId, index) => {
        if (tenantId && Object.prototype.hasOwnProperty.call(byTenant, tenantId)) row[valuesKey][index] = byTenant[tenantId];
      });
      if (valuesKey === "werte") row.summe = row[valuesKey].reduce((sum, entry) => sum + d.num(entry), 0);
    });
  }

  function captureUmlageInputsByTenantId(data) {
    const d = requireDeps();
    const tenantIds = (Array.isArray(data.mieter) ? data.mieter : []).map(tenant => String(tenant && tenant.id || ""));
    const captured = {};
    Object.keys(data.umlageInputs || {}).forEach(costId => {
      const input = data.umlageInputs[costId];
      if (!input || !Array.isArray(input.values)) return;
      captured[costId] = {};
      tenantIds.forEach((tenantId, index) => {
        if (tenantId) captured[costId][tenantId] = d.num(input.values[index]);
      });
    });
    return captured;
  }

  function restoreUmlageInputsByTenantId(data, captured) {
    const tenantIds = (Array.isArray(data.mieter) ? data.mieter : []).map(tenant => String(tenant && tenant.id || ""));
    Object.keys(data.umlageInputs || {}).forEach(costId => {
      const input = data.umlageInputs[costId];
      const byTenant = captured[costId];
      if (!input || !Array.isArray(input.values) || !byTenant) return;
      tenantIds.forEach((tenantId, index) => {
        if (tenantId && Object.prototype.hasOwnProperty.call(byTenant, tenantId)) input.values[index] = byTenant[tenantId];
      });
    });
  }

  function meterSnapshotRowScore(row, generic = false) {
    const d = requireDeps();
    if (!row) return -1;
    const endDate = String(generic ? row.endDate : (row.kwEndDate || row.wwEndDate || ""));
    const startDate = String(generic ? row.startDate : (row.kwStartDate || row.wwStartDate || ""));
    const serial = d.isoDateSerial(endDate || startDate);
    const hasEnd = generic ? d.hasEnteredMeterValue(row.end) : (d.hasEnteredMeterValue(row.kwEnd) || d.hasEnteredMeterValue(row.wwEnd));
    return (hasEnd ? 100000000 : 0) + (serial === null ? 0 : serial);
  }

  function captureMeterReadingsSnapshot(data = current()) {
    const d = requireDeps();
    const tenants = Array.isArray(data && data.mieter) ? data.mieter : [];
    const snapshot = { water:{ byTenant:{}, byUnit:{}, unitScores:{} }, generic:{} };
    const waterRows = data && data.waterMeters && Array.isArray(data.waterMeters.readings) ? data.waterMeters.readings : [];
    tenants.forEach((tenant, index) => {
      const row = waterRows[index];
      if (!row) return;
      const tenantId = String(tenant && tenant.id || "");
      const unitId = String(tenant && tenant.wohnung || "");
      if (tenantId) snapshot.water.byTenant[tenantId] = d.clone(row);
      if (unitId) {
        const score = meterSnapshotRowScore(row, false);
        if (snapshot.water.unitScores[unitId] === undefined || score >= snapshot.water.unitScores[unitId]) {
          snapshot.water.byUnit[unitId] = d.clone(row);
          snapshot.water.unitScores[unitId] = score;
        }
      }
    });
    const genericSource = data && data.meterReadings && data.meterReadings.readings && typeof data.meterReadings.readings === "object" ? data.meterReadings.readings : {};
    Object.keys(genericSource).forEach(costId => {
      const snap = snapshot.generic[costId] = { byTenant:{}, byUnit:{}, unitScores:{} };
      const rows = Array.isArray(genericSource[costId]) ? genericSource[costId] : [];
      tenants.forEach((tenant, index) => {
        const row = rows[index];
        if (!row) return;
        const tenantId = String(tenant && tenant.id || "");
        const unitId = String(tenant && tenant.wohnung || "");
        if (tenantId) snap.byTenant[tenantId] = d.clone(row);
        if (unitId) {
          const score = meterSnapshotRowScore(row, true);
          if (snap.unitScores[unitId] === undefined || score >= snap.unitScores[unitId]) {
            snap.byUnit[unitId] = d.clone(row);
            snap.unitScores[unitId] = score;
          }
        }
      });
    });
    return snapshot;
  }

  function meterSnapshotRowForTenant(snapshot, tenant) {
    if (!snapshot || !tenant) return null;
    const tenantId = String(tenant.id || "");
    const unitId = String(tenant.wohnung || "");
    return (tenantId && snapshot.byTenant && snapshot.byTenant[tenantId]) || (unitId && snapshot.byUnit && snapshot.byUnit[unitId]) || null;
  }

  function restoreMeterReadingsAfterTenantSync(data, snapshot) {
    const d = requireDeps();
    d.ensureWaterMeterData();
    const count = Math.max(20, data.mieter.length);
    const waterRows = Array(count).fill(null).map(() => ({}));
    data.mieter.forEach((tenant, index) => {
      const source = meterSnapshotRowForTenant(snapshot && snapshot.water, tenant);
      if (source) waterRows[index] = d.clone(source);
    });
    data.waterMeters.readings = waterRows;
    if (!data.meterReadings) data.meterReadings = { readings:{} };
    if (!data.meterReadings.readings) data.meterReadings.readings = {};
    const costIds = new Set(Object.keys((snapshot && snapshot.generic) || {}).concat(Object.keys(data.meterReadings.readings || {})));
    costIds.forEach(costId => {
      const rows = Array(count).fill(null).map(() => ({}));
      data.mieter.forEach((tenant, index) => {
        const source = meterSnapshotRowForTenant(snapshot && snapshot.generic && snapshot.generic[costId], tenant);
        if (source) rows[index] = d.clone(source);
      });
      data.meterReadings.readings[costId] = rows;
    });
  }

  function mergeStammdatenIntoCurrentBilling(data = current()) {
    const d = requireDeps();
    const periodDays = d.periodDaysExact();
    const existingById = new Map((Array.isArray(data.mieter) ? data.mieter : []).map(tenant => [String(tenant.id || ""), tenant]));
    const prepaymentsByTenant = captureTenantIndexedValuesById(data, data.vorauszahlungen, "werte");
    const allocationInputsByTenant = captureUmlageInputsByTenantId(data);
    const meterSnapshot = captureMeterReadingsSnapshot(data);
    data.wohnungen = normalizeBillingUnitRows(masterUnits(data), data.wohnungen);
    data.mieter = masterTenants(data)
      .filter(tenant => d.tenantRelevantForCurrentBilling(tenant))
      .map(tenant => tenantBillingCopyFromMasterKeepValues(tenant, existingById.get(String(tenant.id || "")), periodDays));
    d.syncVorauszahlungen();
    restoreTenantIndexedValuesById(data, data.vorauszahlungen, "werte", prepaymentsByTenant);
    d.syncUmlageInputs();
    restoreUmlageInputsByTenantId(data, allocationInputsByTenant);
    restoreMeterReadingsAfterTenantSync(data, meterSnapshot);
    d.syncKostenartenMieterUmlage();
    d.applyWaterMetersToUmlage();
    d.updateTenantPrepaymentTotals();
    return data;
  }

  function stammdatenComparableUnit(unit) {
    const d = requireDeps();
    return {
      id:String(unit && unit.id || ""),
      bezeichnung:String(unit && unit.bezeichnung || ""),
      lage:String(unit && unit.lage || ""),
      wohnflaeche:d.num(unit && unit.wohnflaeche),
      zimmer:String(unit && unit.zimmer || ""),
      bemerkung:String(unit && unit.bemerkung || "")
    };
  }

  function stammdatenComparableTenant(tenant) {
    const d = requireDeps();
    return {
      id:String(tenant && tenant.id || ""),
      wohnung:String(tenant && tenant.wohnung || ""),
      name:String(tenant && tenant.name || ""),
      rolle:String(tenant && tenant.abrechnungRolle || ""),
      geschlecht:String(tenant && tenant.geschlecht || ""),
      standardanrede:String(tenant && tenant.standardanrede || ""),
      strasse:String(tenant && tenant.strasse || ""),
      plz:String(tenant && tenant.plz || ""),
      ort:String(tenant && tenant.ort || ""),
      telefon:String(tenant && tenant.telefon || ""),
      email:String(tenant && tenant.email || ""),
      einzug:String(tenant && tenant.einzug || ""),
      auszug:String(tenant && tenant.auszug || ""),
      aktiveTage:d.tenantActiveDaysInCurrentPeriod(tenant) || d.normalizeActiveDayValue(tenant && tenant.aktiveTage),
      personen:d.num(tenant && tenant.personen),
      status:d.tenantOpenStatus(tenant) || String(tenant && tenant.status || "")
    };
  }

  function stammdatenBillingDiff(data = current()) {
    const d = requireDeps();
    const masterUnitData = masterUnits(data).map(stammdatenComparableUnit);
    const billingUnitData = (Array.isArray(data.wohnungen) ? data.wohnungen : []).map(stammdatenComparableUnit);
    const masterTenantData = masterTenants(data).filter(tenant => d.tenantRelevantForCurrentBilling(tenant)).map(stammdatenComparableTenant);
    const billingTenantData = (Array.isArray(data.mieter) ? data.mieter : []).filter(tenant => d.tenantRelevantForCurrentBilling(tenant)).map(stammdatenComparableTenant);
    const sameUnits = JSON.stringify(masterUnitData) === JSON.stringify(billingUnitData);
    const sameTenants = JSON.stringify(masterTenantData) === JSON.stringify(billingTenantData);
    return Object.freeze({
      same:sameUnits && sameTenants,
      sameUnits,
      sameTenants,
      masterUnits:masterUnitData.length,
      billingUnits:billingUnitData.length,
      masterTenants:masterTenantData.length,
      billingTenants:billingTenantData.length
    });
  }

  function applyMasterDataToBilling(options = {}) {
    const d = requireDeps();
    if (d.isArchiveViewer()) {
      return Object.freeze({
        changed:false,
        reason:"archive-readonly",
        message:"Diese Archivansicht ist schreibgeschützt. Alte Abrechnungen werden nicht aus dem zentralen Bestand aktualisiert."
      });
    }
    const year = d.currentYear();
    const question = "Den zentralen Mieter- und Wohnungsbestand jetzt in die aktuelle Abrechnung " + year + " übernehmen?\n\nWohnungen und Mietverhältnisse werden anhand der Stammdaten aktualisiert. Bereits erfasste Kaltmieten, erhaltene Zahlungen und Vorauszahlungs-/Korrekturwerte bleiben bei gleicher Mieter-ID erhalten.";
    if (options.confirmed !== true) {
      return Object.freeze({ changed:false, requiresConfirmation:true, confirmationMessage:question });
    }
    return d.stateAccess.transact(data => {
      mergeStammdatenIntoCurrentBilling(data);
      if (!data.meta) data.meta = {};
      data.meta.stammdatenAppliedAt = d.todayIso();
      data.meta.stammdatenAppliedForYear = d.currentYear();
      return Object.freeze({
        changed:true,
        year:data.meta.stammdatenAppliedForYear,
        message:"Der zentrale Bestand wurde in die aktuelle Abrechnung übernommen."
      });
    }, { reason:"Benutzereingabe", forceAll:true });
  }

  function describe() {
    return Object.freeze({
      configured:!!deps,
      responsibility:"Stammdaten- und Abrechnungskopien-Orchestrierung",
      actionCount:6,
      actions:Object.freeze([
        "addMasterTenancy", "applyMasterDataToBilling", "archiveMasterTenancy",
        "restoreMasterTenancy", "setBillingUnitStatus", "setMasterNested"
      ])
    });
  }

  global.NKProMasterDataActions = Object.freeze({
    configure,
    describe,
    normalizeMasterUnitRows,
    normalizeBillingUnitRows,
    normalizeMasterTenantRows,
    ensureStammdatenData,
    masterData,
    masterUnits,
    masterTenants,
    masterTenantCount,
    masterVisibleTenantRows,
    masterArchivedTenantRows,
    nextMasterMietId,
    setBillingUnitStatus,
    setMasterNested,
    addMasterTenancy,
    archiveMasterTenancy,
    restoreMasterTenancy,
    applyStammdatenToCurrentBilling,
    captureMeterReadingsSnapshot,
    meterSnapshotRowForTenant,
    stammdatenBillingDiff,
    applyMasterDataToBilling
  });
})(globalThis);
