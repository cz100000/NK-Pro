(function(global) {
  "use strict";

  let deps = null;

  function configure(options = {}) {
    if (deps) return describe();
    if (!options.stateAccess || typeof options.stateAccess.current !== "function" || typeof options.stateAccess.transact !== "function") {
      throw new Error("Kostenaktionen benötigen NKProStateAccess.");
    }
    const required = [
      "num", "normalizeManualUmlageValue", "tenantRowsWithIndex", "tenantIdForUmlage",
      "activeCostRowsForMatrix", "totalVorauszahlungForTenant", "getCostGroupOptions"
    ];
    required.forEach(name => {
      if (typeof options[name] !== "function") throw new Error("Kostenabhängigkeit fehlt: " + name);
    });
    deps = Object.freeze({
      ...options,
      costExclusionOptions:Object.freeze(Array.from(options.costExclusionOptions || [])),
      costExclusionFull:String(options.costExclusionFull || "Vollständig umlegen"),
      umlageManual:String(options.umlageManual || "Manuelle Eingabe je Mieter/Wohneinheit")
    });
    return describe();
  }

  function requireDeps() {
    if (!deps) throw new Error("Kostenaktionen wurden noch nicht konfiguriert.");
    return deps;
  }

  function current() {
    return requireDeps().stateAccess.current();
  }

  function autoPriceForCost(row) {
    const d = requireDeps();
    const total = d.num(row && row.gesamtbetrag);
    const consumption = d.num(row && row.gesamtverbrauch);
    if (total > 0 && consumption > 0) return Math.round((total / consumption) * 10000) / 10000;
    return "";
  }

  function isManualPriceOverride(row) {
    return !!(row && row.preisProEinheitManuell === true);
  }

  function applyAutoPriceIfNeeded(row, force = false) {
    if (!row) return row;
    const autoPrice = autoPriceForCost(row);
    if (force) row.preisProEinheitManuell = false;
    if (!isManualPriceOverride(row) && autoPrice !== "") row.preisProEinheit = autoPrice;
    return row;
  }

  function normalizeCostSettings(row) {
    const d = requireDeps();
    if (!row) return row;
    if (!d.costExclusionOptions.includes(row.ausschlussBehandlung)) row.ausschlussBehandlung = d.costExclusionFull;
    row.umlageschluessel = d.normalizeManualUmlageValue(row.umlageschluessel);
    const hadNoConsumptionField = row.gesamtverbrauch === undefined || row.gesamtverbrauch === null;
    if (hadNoConsumptionField) row.gesamtverbrauch = "";
    row.preisProEinheitManuell = row.preisProEinheitManuell === true || (hadNoConsumptionField && d.num(row.preisProEinheit) > 0);
    if (row.umlageschluessel === "Verbrauch") applyAutoPriceIfNeeded(row, false);
    return row;
  }

  function kostenStatus(row) {
    const d = requireDeps();
    normalizeCostSettings(row);
    if (!row || !row.kostenart) return "";
    if (!row.inNK || !row.vorauszahlung) return "Eingabe fehlt";
    if (row.inNK === "Nein" && row.vorauszahlung === "Ja") return "Vorauszahlung ohne NK-Zuordnung";
    if (row.inNK === "Nein") return "Nicht Bestandteil der NK-Abrechnung";
    if (d.num(row.gesamtbetrag) <= 0) return "Gesamtbetrag fehlt";
    if (row.berechnungsart === "Automatisch") {
      if (!row.umlageschluessel || row.umlageschluessel === "Entfällt" || row.umlageschluessel === d.umlageManual) return "Umlageschlüssel fehlt";
      if (row.umlageschluessel === "Verbrauch" && d.num(row.preisProEinheit) <= 0) return "Preis je Verbrauchseinheit fehlt";
      return "Vollständig";
    }
    if (row.berechnungsart === "Manuell je Mieter") return row.umlageschluessel === d.umlageManual ? "Vollständig" : "Manuelle Eingabe auswählen";
    return "Berechnungsart fehlt";
  }

  function syncVorauszahlungen(data = current()) {
    const d = requireDeps();
    if (!Array.isArray(data.vorauszahlungen)) data.vorauszahlungen = [];
    const tenantCount = Math.max(20, Array.isArray(data.mieter) ? data.mieter.length : 0);
    (Array.isArray(data.kostenarten) ? data.kostenarten : []).forEach(cost => {
      if (!cost || !cost.id || !cost.kostenart) return;
      let row = data.vorauszahlungen.find(entry => entry.kostenId === cost.id);
      if (!row) {
        row = { kostenId:cost.id, kostenart:cost.kostenart, aktiv:cost.vorauszahlung || "Nein", summe:0, werte:Array(tenantCount).fill(0) };
        data.vorauszahlungen.push(row);
      }
      row.kostenart = cost.kostenart;
      row.aktiv = cost.vorauszahlung === "Ja" ? "Ja" : "Nein";
      if (!Array.isArray(row.werte)) row.werte = [];
      while (row.werte.length < tenantCount) row.werte.push(0);
      row.summe = row.werte.reduce((sum, entry) => sum + d.num(entry), 0);
    });
    return data.vorauszahlungen;
  }

  function syncKostenartenMieterUmlage(data = current()) {
    const d = requireDeps();
    if (!data.kostenartenMieterUmlage || typeof data.kostenartenMieterUmlage !== "object" || Array.isArray(data.kostenartenMieterUmlage)) {
      data.kostenartenMieterUmlage = {};
    }
    const tenants = d.tenantRowsWithIndex();
    const tenantIds = tenants.map(d.tenantIdForUmlage).filter(Boolean);
    const tenantIdSet = new Set(tenantIds);
    const activeCosts = d.activeCostRowsForMatrix();
    const activeCostIds = new Set(activeCosts.map(cost => String(cost.id || "")));

    Object.keys(data.kostenartenMieterUmlage).forEach(costId => {
      if (!activeCostIds.has(costId)) delete data.kostenartenMieterUmlage[costId];
    });

    activeCosts.forEach(cost => {
      const costId = String(cost.id || "");
      if (!data.kostenartenMieterUmlage[costId] || typeof data.kostenartenMieterUmlage[costId] !== "object" || Array.isArray(data.kostenartenMieterUmlage[costId])) {
        data.kostenartenMieterUmlage[costId] = {};
      }
      const row = data.kostenartenMieterUmlage[costId];
      Object.keys(row).forEach(tenantId => {
        if (!tenantIdSet.has(tenantId)) delete row[tenantId];
      });
      tenantIds.forEach(tenantId => {
        if (row[tenantId] === undefined || row[tenantId] === null) row[tenantId] = true;
        else row[tenantId] = row[tenantId] !== false && row[tenantId] !== "Nein";
      });
    });
    return data.kostenartenMieterUmlage;
  }

  function updateTenantPrepaymentTotals(data = current()) {
    const d = requireDeps();
    syncVorauszahlungen(data);
    syncKostenartenMieterUmlage(data);
    (Array.isArray(data.mieter) ? data.mieter : []).forEach((tenant, index) => {
      tenant.nkVoraus = d.totalVorauszahlungForTenant(index);
      tenant.vorjahresKorrektur = d.num(tenant.vorjahresKorrektur);
      tenant.kaltmietKorrektur = d.num(tenant.kaltmietKorrektur);
      tenant.einnahmen = d.num(tenant.kaltErhalten) + d.num(tenant.nkVoraus);
    });
    return data.mieter;
  }

  function configureFree(index, name, group) {
    const d = requireDeps();
    const numericIndex = Number(index);
    const data = current();
    const row = Array.isArray(data.kostenarten) ? data.kostenarten[numericIndex] : null;
    if (!row) return Object.freeze({ changed:false, reason:"missing-cost" });
    const clean = String(name || "").trim();
    if (!clean) {
      return Object.freeze({
        changed:false,
        reason:"missing-name",
        message:"Bitte eine Bezeichnung für die eigene Kostenart eingeben."
      });
    }
    return d.stateAccess.transact(next => {
      const target = next.kostenarten[numericIndex];
      const groups = d.getCostGroupOptions();
      target.kostenart = clean;
      target.fachgruppe = groups.includes(group) ? group : "Sonstige / freie Kostenarten";
      target.bereich = target.fachgruppe;
      target.inNK = "Ja";
      target.status = kostenStatus(target);
      syncVorauszahlungen(next);
      syncKostenartenMieterUmlage(next);
      return Object.freeze({ changed:true, id:target.id || "" });
    }, { reason:"Benutzereingabe", tabId:"einstellungen" });
  }

  function setSetting(index, key, value) {
    const d = requireDeps();
    const numericIndex = Number(index);
    const data = current();
    if (!Array.isArray(data.kostenarten) || !data.kostenarten[numericIndex]) return Object.freeze({ changed:false, reason:"missing-cost" });
    return d.stateAccess.transact(next => {
      const row = next.kostenarten[numericIndex];
      let normalizedValue = value;
      if (key === "gesamtbetrag" || key === "gesamtverbrauch" || key === "preisProEinheit") normalizedValue = value === "" ? "" : d.num(value);
      if (key === "preisProEinheit") row.preisProEinheitManuell = true;
      row[key] = normalizedValue;
      normalizeCostSettings(row);
      if (key === "gesamtbetrag" || key === "gesamtverbrauch") applyAutoPriceIfNeeded(row, false);

      if (key === "inNK" && normalizedValue === "Nein") {
        row.vorauszahlung = "Nein";
        row.berechnungsart = "Entfällt";
        row.umlageschluessel = "Entfällt";
      }
      if (key === "inNK" && normalizedValue === "Ja" && row.berechnungsart === "Entfällt") {
        row.berechnungsart = "Automatisch";
        row.umlageschluessel = row.umlageschluessel && row.umlageschluessel !== "Entfällt" ? row.umlageschluessel : "Wohnfläche";
      }
      if (key === "vorauszahlung" && normalizedValue === "Ja" && row.inNK !== "Ja") {
        row.inNK = "Ja";
        if (row.berechnungsart === "Entfällt") row.berechnungsart = "Automatisch";
        if (row.umlageschluessel === "Entfällt") row.umlageschluessel = "Wohnfläche";
      }

      row.status = kostenStatus(row);
      syncVorauszahlungen(next);
      syncKostenartenMieterUmlage(next);
      return Object.freeze({ changed:true, id:row.id || "", key });
    }, { reason:"Benutzereingabe", tabId:"einstellungen" });
  }

  function activateDefaultPrepayments() {
    const d = requireDeps();
    return d.stateAccess.transact(data => {
      const defaults = new Set(["K002", "K006", "K009"]);
      (Array.isArray(data.kostenarten) ? data.kostenarten : []).forEach(cost => {
        if (!defaults.has(cost.id)) return;
        cost.inNK = "Ja";
        cost.vorauszahlung = "Ja";
        if (cost.id === "K006") {
          cost.berechnungsart = "Manuell je Mieter";
          cost.umlageschluessel = d.umlageManual;
        } else {
          cost.berechnungsart = "Automatisch";
          if (!cost.umlageschluessel || cost.umlageschluessel === "Entfällt" || cost.umlageschluessel === d.umlageManual) cost.umlageschluessel = "Wohnfläche";
        }
        cost.status = kostenStatus(cost);
      });
      syncVorauszahlungen(data);
      syncKostenartenMieterUmlage(data);
      updateTenantPrepaymentTotals(data);
      return Object.freeze({ changed:true, ids:Object.freeze(Array.from(defaults)) });
    }, { reason:"Benutzereingabe", tabId:"einstellungen" });
  }

  function deactivateAllPrepayments() {
    const d = requireDeps();
    return d.stateAccess.transact(data => {
      (Array.isArray(data.kostenarten) ? data.kostenarten : []).forEach(cost => {
        cost.vorauszahlung = "Nein";
        cost.status = kostenStatus(cost);
      });
      syncVorauszahlungen(data);
      updateTenantPrepaymentTotals(data);
      return Object.freeze({ changed:true });
    }, { reason:"Benutzereingabe", tabId:"einstellungen" });
  }

  function setTenantAllowed(costId, tenantId, value) {
    const d = requireDeps();
    const normalizedCostId = String(costId || "");
    const normalizedTenantId = String(tenantId || "");
    if (!normalizedCostId || !normalizedTenantId) return Object.freeze({ changed:false, reason:"missing-reference" });
    return d.stateAccess.transact(data => {
      syncKostenartenMieterUmlage(data);
      if (!data.kostenartenMieterUmlage[normalizedCostId]) data.kostenartenMieterUmlage[normalizedCostId] = {};
      data.kostenartenMieterUmlage[normalizedCostId][normalizedTenantId] = value === true || value === "true" || value === "Ja";
      updateTenantPrepaymentTotals(data);
      return Object.freeze({ changed:true, costId:normalizedCostId, tenantId:normalizedTenantId });
    }, { reason:"Benutzereingabe", tabId:"einstellungen" });
  }

  function describe() {
    return Object.freeze({
      configured:!!deps,
      responsibility:"Kostenarten-, Vorauszahlungs- und Mieterfreigabe-Orchestrierung",
      actionCount:5,
      actions:Object.freeze(["configureFree", "setSetting", "activateDefaultPrepayments", "deactivateAllPrepayments", "setTenantAllowed"])
    });
  }

  global.NKProCostActions = Object.freeze({
    configure,
    describe,
    normalizeCostSettings,
    autoPriceForCost,
    isManualPriceOverride,
    applyAutoPriceIfNeeded,
    kostenStatus,
    syncVorauszahlungen,
    syncKostenartenMieterUmlage,
    updateTenantPrepaymentTotals,
    configureFree,
    setSetting,
    activateDefaultPrepayments,
    deactivateAllPrepayments,
    setTenantAllowed
  });
})(globalThis);
