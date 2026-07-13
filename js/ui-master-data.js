"use strict";

// AP12: Stammdaten-, Kostenbasis- und Mieterhilfen der Benutzeroberfläche.
// ===== Bereich: Archivmodell und Archivansicht =====
function archiveDataSource(item) {
  const meta = NK_PRO_MODULES.archiveActions.meta(item);
  if (meta.datenquelle) return meta.datenquelle;
  if (meta.legacyQuelle) return "Importiert / übernommen";
  if (meta.legacyArchivHinweis) return "Übernommen";
  return "Tool";
}

function wohnungLabelForTenant(tenant) {
  if (!tenant) return "";
  const w = Array.isArray(state.wohnungen) ? state.wohnungen.find(x => x.id === tenant.wohnung) : null;
  return (w && (w.bezeichnung || w.lage || w.id)) || tenant.wohnung || "";
}

function billingEntryForTenant(tenant) {
  const entries = legacyArchiveEntries();
  if (!tenant || !entries.length) return null;
  const tn = normalizedTextKey(tenant.name);
  const tw = normalizedTextKey(wohnungLabelForTenant(tenant));
  return entries.find(e => normalizedTextKey(e.mieter) === tn) ||
         entries.find(e => normalizedTextKey(e.wohnung) === tw && normalizedTextKey(e.mieter).includes(tn.split(" ").slice(-1)[0] || tn)) ||
         null;
}

function knownArchiveCostContext(entry, costId, amount) {
  const y = String((entry && entry.jahr) || currentAbrechnungsjahr());
  const ctx = { gesamtbetrag:0, basisTotal:0, preis:0, einheiten:0 };
  if (y.includes("2021/2022")) {
    if (costId === "K006") { ctx.gesamtbetrag = 7930.61; }
    if (costId === "K002") { ctx.gesamtbetrag = 2441.50; ctx.basisTotal = 383; ctx.preis = 6.37; ctx.einheiten = ctx.preis ? num(amount) / ctx.preis : 0; }
    if (costId === "K009") { ctx.gesamtbetrag = 1503.00; ctx.basisTotal = 7; ctx.preis = 214.71; ctx.einheiten = ctx.preis ? num(amount) / ctx.preis : 0; }
  } else if (y.includes("2022")) {
    if (costId === "K006") { ctx.gesamtbetrag = 3979.60; }
    if (costId === "K002") { ctx.gesamtbetrag = 2386.87; ctx.basisTotal = 438; ctx.preis = 5.45; ctx.einheiten = ctx.preis ? num(amount) / ctx.preis : 0; }
    if (costId === "K009") { ctx.gesamtbetrag = 1503.00; ctx.basisTotal = 7; ctx.preis = 214.71; ctx.einheiten = ctx.preis ? num(amount) / ctx.preis : 0; }
  }
  return ctx;
}

function importedEntryPeriodForCost(entry, costId) {
  if (!entry) return "";
  if (costId === "K006") return entry.heizPeriode || isoPeriodToShortRange(entry.periode);
  if (costId === "K002") return entry.wasserPeriode || isoPeriodToShortRange(entry.periode);
  if (costId === "K009") return entry.abfallPeriode || isoPeriodToShortRange(entry.periode);
  return isoPeriodToShortRange(entry.periode);
}

function entryBriefValidationStatus(e) {
  if (!e) return "";
  const expected = Math.round((num(e.kostenanteil) - num(e.vorauszahlung)) * 100) / 100;
  const actual = Math.round(num(e.saldo) * 100) / 100;
  return Math.abs(expected - actual) <= 0.01 ? "Briefdaten geprüft" : "Prüfen";
}

function applyExcelWaterReadings2024ToData(data) {
  if (!data) return;
  if (!data.meta) data.meta = {};
  if (data.meta.waterReadingsImportedFromExcel2024 === true) return;

  // Diese Migration ist ausschließlich für die importierten 2024-Testdaten gedacht.
  // Sie darf spätere Jahre oder fremde Datenstände nicht unbeabsichtigt überschreiben.
  if (String(data.meta.abrechnungsjahr || "") !== "2024") return;

  const excelReadings = {
    W00:{kwStart:420,kwEnd:490,wwStart:246,wwEnd:280},
    W01:{kwStart:228,kwEnd:266,wwStart:98,wwEnd:108},
    W02:{kwStart:105,kwEnd:117,wwStart:24,wwEnd:28},
    W03:{kwStart:153,kwEnd:168,wwStart:52,wwEnd:59},
    W04:{kwStart:152,kwEnd:195,wwStart:186,wwEnd:241},
    W05:{kwStart:123.08,kwEnd:124,wwStart:143,wwEnd:144},
    W06:{kwStart:136.98,kwEnd:137,wwStart:110.99,wwEnd:111}
  };

  if (!data.waterMeters) data.waterMeters = {};
  if (!data.waterMeters.settings) data.waterMeters.settings = {};
  data.waterMeters.settings.enabled = "Ja";
  if (!num(data.waterMeters.settings.houseWaterTotal)) data.waterMeters.settings.houseWaterTotal = 295;
  if (!Array.isArray(data.waterMeters.readings)) data.waterMeters.readings = [];

  const tenantCount = Math.max(20, Array.isArray(data.mieter) ? data.mieter.length : 0);
  while (data.waterMeters.readings.length < tenantCount) {
    data.waterMeters.readings.push({kwStart:0,kwStartDate:"",kwEnd:0,kwEndDate:"",wwStart:0,wwStartDate:"",wwEnd:0,wwEndDate:"",bemerkung:""});
  }

  if (!data.umlageInputs) data.umlageInputs = {};
  if (!data.umlageInputs.K002) data.umlageInputs.K002 = {kostenId:"K002", kostenart:"Wasserversorgung", art:"Verbrauch", values:[]};
  if (!Array.isArray(data.umlageInputs.K002.values)) data.umlageInputs.K002.values = [];
  while (data.umlageInputs.K002.values.length < tenantCount) data.umlageInputs.K002.values.push(0);

  if (Array.isArray(data.mieter)) {
    data.mieter.forEach((m, idx) => {
      const unit = String(m.wohnung || "").trim().toUpperCase();
      const d = excelReadings[unit];
      if (!d) return;
      data.waterMeters.readings[idx] = {
        kwStart:d.kwStart,
        kwStartDate:"2023-12-31",
        kwEnd:d.kwEnd,
        kwEndDate:"2024-12-31",
        wwStart:d.wwStart,
        wwStartDate:"2023-12-31",
        wwEnd:d.wwEnd,
        wwEndDate:"2024-12-31",
        bemerkung:"aus Excel-Tab Wasserverbrauch: Ende 2023 / Ende 2024"
      };
      data.umlageInputs.K002.values[idx] = (num(d.kwEnd) - num(d.kwStart)) + (num(d.wwEnd) - num(d.wwStart));
    });
  }

  data.meta.waterReadingsImportedFromExcel2024 = true;
  data.meta.waterReadingsSource = "Nebenkostenberechnung 2024(1).xlsx / Tab Wasserverbrauch / Ende 2023 und Ende 2024";
  data.meta.excelWaterDelta24AllUnits = 289.95;
}

function saveData(options = {}) {
  if (!options.skipPrepare && typeof prepareStateForPersistence === "function") prepareStateForPersistence("save");
  if (typeof isArchiveViewer === "function" && isArchiveViewer()) {
    setActionMessage("Archivansicht ist schreibgeschützt. Änderungen werden nicht gespeichert.", "warn");
    renderActionFeedback();
    return false;
  }
  if (NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized() && !finalizationWriteBypass) {
    setActionMessage("Abrechnung ist finalisiert. Änderungen wurden nicht gespeichert. Zum Bearbeiten zuerst Finalisierung aufheben.", "warn");
    renderActionFeedback();
    return false;
  }
  try {
    if (!state.meta) state.meta = {};
    enforceWorkingStateDataContract(state);
    state.meta.lastSavedAt = new Date().toISOString();
    state.meta.lastSavedWithAppVersion = APP_VERSION;
    delete state.meta.lastSaveError;
    const previous = readStoredDataResult(STORAGE_KEY);
    if (previous.valid) {
      const recoveryState = normalizeLegacyData(clone(previous.data));
      enforceWorkingStateDataContract(recoveryState, { storageRole:"recovery" });
      recoveryState.meta.recoveryCreatedAt = new Date().toISOString();
      recoveryState.meta.recoveryCreatedWithAppVersion = APP_VERSION;
      recoveryState.meta.recoverySourceStorageKey = STORAGE_KEY;
      writeProtectedStorage(STORAGE_RECOVERY_KEY, recoveryState);
    }
    state.meta.storageRole = "working";
    const protectedState = writeProtectedStorage(STORAGE_KEY, state);
    state.meta.storageIntegrityAlgorithm = protectedState.meta.storageIntegrityAlgorithm;
    state.meta.storageIntegrityChecksum = protectedState.meta.storageIntegrityChecksum;
    state.meta.storageIntegrityProtectedAt = protectedState.meta.storageIntegrityProtectedAt;
    state.meta.storageIntegrityProtectedWithAppVersion = protectedState.meta.storageIntegrityProtectedWithAppVersion;
    pendingStorageWarning = "";
    setActionMessage("Gespeichert " + new Date(state.meta.lastSavedAt).toLocaleString("de-DE"));
    renderSystemMessages();
    renderActionFeedback();
    return true;
  } catch(e) {
    notifyStorageProblem("Daten konnten nicht im lokalen Browser-Speicher gespeichert werden. Bitte lade eine JSON-Sicherung herunter und pruefe freien Browser-Speicher.", e);
    if (!state.meta) state.meta = {};
    state.meta.lastSaveError = String(e && (e.message || e.name) || e);
    setActionMessage("Speichern fehlgeschlagen. Bitte JSON-Sicherung herunterladen.", "err");
    renderSystemMessages();
    renderActionFeedback();
    return false;
  }
}

function commitStateChange(options = {}) {
  const reason = String(options.reason || "Änderung");
  const render = options.render !== false;
  const forceAll = options.forceAll === true;
  const tabIds = Array.isArray(options.tabIds) ? options.tabIds.filter(Boolean) : (options.tabId ? [options.tabId] : null);
  const includeCommon = options.includeCommon !== false;
  const includeNavigation = options.includeNavigation !== false;
  const includeTableTools = options.includeTableTools !== false;
  prepareStateForPersistence(reason);
  const saveFn = options.finalizationBypass ? () => withFinalizationWriteBypass(() => saveData({ skipPrepare:true })) : () => saveData({ skipPrepare:true });
  const saved = saveFn();
  if (render) renderAll({ forceAll, tabIds, includeCommon, includeNavigation, includeTableTools, reason });
  return saved;
}

function fmtMoney(value) { const n = Number(value || 0); return n.toLocaleString("de-DE", { style:"currency", currency:"EUR" }); }
function num(value) { if (value === null || value === undefined || value === "") return 0; if (typeof value === "number") return value; return Number(String(value).replace(/\./g, "").replace(",", ".")) || 0; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s])); }
function escapeJsString(value) { return String(value ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\'").replace(/\r/g, "\\r").replace(/\n/g, "\\n"); }
function statusClass(status) {
  if (status === "Vollständig" || status === "OK") return "ok";
  if (status === "Nicht Bestandteil der NK-Abrechnung") return "neutral";
  if (status === "Nicht auf Mieter umgelegt") return "warn";
  if (!status) return "neutral";
  if (status.includes("fehlt") || status.includes("prüfen") || status.includes("auswählen") || status.includes("Zuordnung") || status.includes("Überverteilung") || status.includes("berechtigte")) return "warn";
  return "err";
}

function ensureCostSettings(data = state) {
  if (!data || !Array.isArray(data.kostenarten)) return;
  data.kostenarten.forEach(k => NK_PRO_MODULES.costActions.normalizeCostSettings(k));
}

function costExclusionHandling(...args) { return NK_PRO_MODULES.billingCalculation.costExclusionHandling(...args); }


function normalizeManualUmlageValue(...args) { return NK_PRO_MODULES.billingCalculation.normalizeManualUmlageValue(...args); }

function resetCostUnitPriceToAuto(index) {
  const row = state.kostenarten[index];
  if (!row) return;
  row.preisProEinheitManuell = false;
  NK_PRO_MODULES.costActions.applyAutoPriceIfNeeded(row, true);
  row.status = NK_PRO_MODULES.costActions.kostenStatus(row);
  commitStateChange({ reason:"Benutzereingabe" });
}

const COST_GROUP_OPTIONS = ["Betriebskosten","Wasser","Heizung / Warmwasser","Abfall","Eigentümerkosten / nicht umlagefähig","Sonstige / freie Kostenarten"];
const STANDARD_COST_GROUP_BY_ID = {K002:"Wasser",K006:"Heizung / Warmwasser",K009:"Abfall",K017:"Betriebskosten",K040:"Archiv / Hinweise"};
function isFreeCostSlot(k) { return !!(k && (/^K03[1-9]$/.test(String(k.id || "")) || String(k.bereich || "").toLowerCase() === "noch festlegen" || /^Weitere Kosten/i.test(String(k.kostenart || "")))); }
function costGroupLabel(k) {
  if (!k) return "Sonstige / freie Kostenarten";
  if (STANDARD_COST_GROUP_BY_ID[k.id]) return STANDARD_COST_GROUP_BY_ID[k.id];
  if (COST_GROUP_OPTIONS.includes(k.fachgruppe)) return k.fachgruppe;
  const area = String(k.bereich || "").trim();
  if (COST_GROUP_OPTIONS.includes(area)) return area;
  if (/eigentümer|eigentuemer|nicht|verwaltung|finanzierung|instand|modernisierung|anschaffung|bank|rechts|steuer|leerstand/i.test(area)) return "Eigentümerkosten / nicht umlagefähig";
  if (/wasser/i.test(area)) return "Wasser";
  if (/heiz|wärme|waerme/i.test(area)) return "Heizung / Warmwasser";
  if (/abfall|müll|muell/i.test(area)) return "Abfall";
  if (/betrieb/i.test(area)) return "Betriebskosten";
  return "Sonstige / freie Kostenarten";
}



function renderCostSelectionPanel() {
  const el = document.getElementById("costSelectionPanel");
  if (!el) return;
  const costs = (Array.isArray(state.kostenarten) ? state.kostenarten : []).filter(k => k && k.id && k.kostenart);
  const groups = {};
  costs.forEach((k, i) => {
    const group = costGroupLabel(k);
    if (!groups[group]) groups[group] = [];
    groups[group].push({ k, i });
  });
  const order = ["Betriebskosten", "Wasser", "Heizung / Warmwasser", "Abfall", "Eigentümerkosten / nicht umlagefähig", "Sonstige / freie Kostenarten", "Archiv / Hinweise"];
  const names = Object.keys(groups).sort((a,b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.localeCompare(b, "de");
  });
  const activeCount = costs.filter(k => k.inNK === "Ja").length;
  const grid = names.map(group => {
    const items = groups[group].map(({k,i}) => {
      if (isFreeCostSlot(k)) {
        const opts=COST_GROUP_OPTIONS.map(g=>'<option value="'+escapeHtml(g)+'" '+(costGroupLabel(k)===g?'selected':'')+'>'+escapeHtml(g)+'</option>').join('');
        return '<div class="cost-picker-item free-cost-editor"><input id="freeCostName_'+i+'" value="'+escapeHtml(/^Weitere Kosten/i.test(k.kostenart||'')?'':(k.kostenart||''))+'" placeholder="Eigene Kostenart"><select id="freeCostGroup_'+i+'">'+opts+'</select><button type="button"' + uiActionAttributes("cost.configureFree", [i,{fromElementId:"freeCostName_"+i},{fromElementId:"freeCostGroup_"+i}]) + '>Anlegen</button></div>';
      }
      return '<label class="cost-picker-item"><input type="checkbox" ' + (k.inNK === "Ja" ? 'checked ' : '') + uiActionAttributes("cost.setSetting", [i,"inNK",{checkedValues:["Ja","Nein"]}], "change") + editDisabledAttr() + '><span><span class="cost-picker-id">' + escapeHtml(k.id) + '</span> · ' + escapeHtml(k.kostenart) + '</span></label>';
    }).join("");
    return '<div class="cost-picker-group"><h4>' + escapeHtml(group) + '</h4>' + items + '</div>';
  }).join("");
  el.innerHTML = '<div class="inline-titlebar"><div><h3>Kostenarten auswählen</h3><p class="small">Aktiviert: ' + activeCount + ' von ' + costs.length + '. Deaktivierte Kostenarten bleiben gespeichert, erscheinen aber nicht in der Bearbeitungstabelle.</p></div></div><div class="cost-picker-grid">' + grid + '</div>';
}

let activeCostPriceEditorIndex = null;

function priceCellHtml(k, index) {
  const autoPrice = NK_PRO_MODULES.costActions.autoPriceForCost(k);
  const price = num(k.preisProEinheit);
  const unit = costUnitLabel(k) || "Einheit";
  const mode = NK_PRO_MODULES.costActions.isManualPriceOverride(k) ? "manuell" : "automatisch";
  const value = price > 0 ? fmtMoney(price) + " / " + escapeHtml(unit) : "–";
  const title = autoPrice !== ""
    ? "Automatischer Preis: " + fmtMoney(autoPrice) + " · aktuell " + mode
    : "Automatischer Preis nicht möglich: Gesamtverbrauch fehlt";
  return '<button type="button" class="compact-price-button"' + uiActionAttributes("cost.openPriceEditor", [index]) + ' title="' + escapeHtml(title) + '"' + editDisabledAttr() + '>' +
    '<span class="compact-price-value">' + value + '</span><span class="compact-price-edit" aria-hidden="true">✎</span></button>';
}

function openCostPriceEditor(index) {
  if (isArchiveViewer()) return;
  const row = state.kostenarten[index];
  const modal = document.getElementById("costPriceModal");
  if (!row || !modal) return;
  activeCostPriceEditorIndex = index;
  const autoPrice = NK_PRO_MODULES.costActions.autoPriceForCost(row);
  document.getElementById("costPriceDialogTitle").textContent = "Einheitspreis bearbeiten";
  document.getElementById("costPriceDialogCostName").textContent = row.kostenart || row.id || "Kostenart";
  document.getElementById("costPriceDialogInput").value = row.preisProEinheit ?? "";
  document.getElementById("costPriceDialogUnit").textContent = "Einheit: " + (costUnitLabel(row) || "Einheit");
  document.getElementById("costPriceDialogAutoNote").textContent = autoPrice !== ""
    ? "Automatisch berechnet: " + fmtMoney(autoPrice) + " je " + (costUnitLabel(row) || "Einheit")
    : "Automatischer Preis ist erst möglich, wenn ein Gesamtverbrauch vorhanden ist.";
  modal.hidden = false;
  requestAnimationFrame(() => document.getElementById("costPriceDialogInput").focus());
}

function closeCostPriceEditor() {
  const modal = document.getElementById("costPriceModal");
  if (modal) modal.hidden = true;
  activeCostPriceEditorIndex = null;
}

function saveCostPriceFromDialog() {
  if (activeCostPriceEditorIndex === null) return;
  const input = document.getElementById("costPriceDialogInput");
  NK_PRO_MODULES.costActions.setSetting(activeCostPriceEditorIndex, "preisProEinheit", input ? input.value : "");
  closeCostPriceEditor();
}

function resetCostPriceFromDialog() {
  if (activeCostPriceEditorIndex === null) return;
  resetCostUnitPriceToAuto(activeCostPriceEditorIndex);
  closeCostPriceEditor();
}

function recalculateAll() {
  state.kostenarten.forEach(row => row.status = NK_PRO_MODULES.costActions.kostenStatus(row));
  state.mieter.forEach(row => { row.kaltSoll = num(row.kaltSoll); row.kaltErhalten = num(row.kaltErhalten); row.nkVoraus = num(row.nkVoraus); row.einnahmen = num(row.kaltErhalten) + num(row.nkVoraus); });
  commitStateChange({ reason:"Benutzereingabe" });
}

function setNested(collection, index, key, value, type="text") {
  if (collection === "kostenarten" && ["inNK","vorauszahlung","gesamtbetrag","gesamtverbrauch","preisProEinheit","ausschlussBehandlung"].includes(key)) {
    NK_PRO_MODULES.costActions.setSetting(index, key, value);
    return;
  }
  if (type === "number") value = num(value);
  state[collection][index][key] = value;
  if (collection === "kostenarten" && key !== "status") {
    NK_PRO_MODULES.costActions.normalizeCostSettings(state[collection][index]);
    state[collection][index].status = NK_PRO_MODULES.costActions.kostenStatus(state[collection][index]);
    NK_PRO_MODULES.costActions.syncKostenartenMieterUmlage();
  }
  if (collection === "wohnungen") ensureUnitIdentityFields(state[collection][index]);
  if (collection === "mieter") { const row = state[collection][index]; row.einnahmen = num(row.kaltErhalten) + num(row.nkVoraus); ensureTenantIdentityFields(row); }
  commitStateChange({ reason:"Benutzereingabe" });
}

function editDisabledAttr() { return (NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized()) ? ' disabled title="Finalisierte Abrechnung: zuerst Finalisierung aufheben"' : ''; }

function uiActionAttributes(action, args = [], eventType = "click", options = {}) { return NK_PRO_MODULES.uiEvents.attributes(action, args, eventType, options); }
function legacyUiActionAttributes(expression, eventType = "change") { return NK_PRO_MODULES.uiEvents.legacyAttributes(expression, eventType); }

function selectHtml(value, options, onChange) {
  return '<select' + legacyUiActionAttributes(onChange, "change") + editDisabledAttr() + '>' + options.map(o => '<option value="' + escapeHtml(o) + '" ' + (o===value ? 'selected' : '') + '>' + escapeHtml(o) + '</option>').join("") + '</select>';
}
function inputHtml(value, onChange, cls="") { return '<input class="' + cls + '" value="' + escapeHtml(value ?? "") + '"' + legacyUiActionAttributes(onChange, "change") + editDisabledAttr() + '>'; }
function dateInputHtml(value, onChange, cls="") { return '<input type="date" class="' + cls + '" value="' + escapeHtml(value ?? "") + '"' + legacyUiActionAttributes(onChange, "change") + editDisabledAttr() + '>'; }

function hasTenantData(m) {
  return !!(m && (m.name || m.wohnung || m.einzug || m.auszug || num(m.kaltSoll) || num(m.kaltErhalten) || num(m.nkVoraus) || num(m.aktiveTage) || num(m.personen)));
}

function ensureTenantContactFields(m) {
  if (!m) return;
  if (m.geschlecht === undefined || m.geschlecht === null || m.geschlecht === "") m.geschlecht = "Frau/Herr";
  if (m.standardanrede === undefined || m.standardanrede === null || m.standardanrede === "") m.standardanrede = "Automatisch";
  if (m.strasse === undefined || m.strasse === null || m.strasse === "") m.strasse = "Am Rauhen Biehl 5";
  if (m.plz === undefined || m.plz === null || m.plz === "") m.plz = "55774";
  if (m.ort === undefined || m.ort === null || m.ort === "") m.ort = "Baumholder";
  if (m.telefon === undefined || m.telefon === null) m.telefon = "";
  if (m.email === undefined || m.email === null) m.email = "";
  if (m.abrechnungRolle === undefined || m.abrechnungRolle === null || m.abrechnungRolle === "") m.abrechnungRolle = (m.id === "M000" || String(m.name || "").includes("Zimmermann")) ? "Eigentümer/Privat" : "Mieter";
  if (m.wasserWeitereVorauszahlung === undefined || m.wasserWeitereVorauszahlung === null || m.wasserWeitereVorauszahlung === "") m.wasserWeitereVorauszahlung = 0;
  if (m.vorjahresKorrektur === undefined || m.vorjahresKorrektur === null || m.vorjahresKorrektur === "") m.vorjahresKorrektur = 0;
  if (m.vzChangeHeizung === undefined || m.vzChangeHeizung === null || m.vzChangeHeizung === "") m.vzChangeHeizung = "";
  if (m.vzChangeWasser === undefined || m.vzChangeWasser === null || m.vzChangeWasser === "") m.vzChangeWasser = "";
  if (m.vzChangeAbfall === undefined || m.vzChangeAbfall === null || m.vzChangeAbfall === "") m.vzChangeAbfall = "";
  if (m.vzChangeAntenne === undefined || m.vzChangeAntenne === null || m.vzChangeAntenne === "") m.vzChangeAntenne = "";
}

function normalizeUnitIdentityText(value) {
  let text = String(value || "").trim().toLowerCase().replace(/\u00df/g, "ss");
  if (text.normalize) text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return text.replace(/[^a-z0-9]+/g, " ").trim();
}



function canonicalUnitIdFor(value) {
  const candidates = [];
  if (value && typeof value === "object") candidates.push(value.id, value.wohnung, value.bezeichnung, value.lage, value.excelKennung, value.zaehlerKennung);
  else candidates.push(value);
  for (const item of candidates) {
    if (item === undefined || item === null || item === "") continue;
    const raw = String(item).trim();
    if (/^W\d{3}\.[A-Z0-9.-]+$/i.test(raw)) return raw.toUpperCase();
    const key = normalizeUnitIdentityText(raw);
    const compact = key.replace(/\s+/g, "");
    if (UNIT_ID_ALIASES[key]) return UNIT_ID_ALIASES[key];
    if (UNIT_ID_ALIASES[compact]) return UNIT_ID_ALIASES[compact];
  }
  return "";
}

function generatedUnitIdForLabel(label, index) {
  const code = normalizeUnitIdentityText(label).toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9-]+/g, "").replace(/^-+|-+$/g, "").slice(0, 12) || "IMPORT";
  return "W9" + String(index + 1).padStart(2, "0") + "." + code;
}

function migrateUnitIdsInData(data) {
  if (!data || typeof data !== "object") return data;
  const idMap = {};
  if (Array.isArray(data.wohnungen)) {
    data.wohnungen.forEach((w, i) => {
      if (!w) return;
      const oldId = String(w.id || "");
      const newId = canonicalUnitIdFor(w) || oldId || generatedUnitIdForLabel(w.bezeichnung || w.lage || "Wohnung", i);
      if (oldId && oldId !== newId) idMap[oldId] = newId;
      w.id = newId;
      delete w.unitId;
    });
    const seen = new Map();
    data.wohnungen = data.wohnungen.filter(w => {
      if (!w || !w.id) return true;
      if (!seen.has(w.id)) { seen.set(w.id, w); return true; }
      const target = seen.get(w.id);
      ["bezeichnung","lage","wohnflaeche","zimmer","status","bemerkung"].forEach(key => {
        if ((target[key] === undefined || target[key] === "" || target[key] === 0) && w[key] !== undefined && w[key] !== "") target[key] = w[key];
      });
      return false;
    });
    data.wohnungen.sort((a,b) => String(a.id || "").localeCompare(String(b.id || ""), "de"));
  }
  if (Array.isArray(data.mieter)) {
    data.mieter.forEach(m => {
      if (!m) return;
      delete m.personId;
      if (m.wohnung) m.wohnung = idMap[m.wohnung] || canonicalUnitIdFor(m.wohnung) || m.wohnung;
    });
  }
  if (data.waterMeterHistory && Array.isArray(data.waterMeterHistory.units)) {
    data.waterMeterHistory.units.forEach((unit, index) => {
      if (!unit) return;
      unit.wohnung = canonicalUnitIdFor(unit) || canonicalUnitIdFor(unit.wohnung) || unit.wohnung || generatedUnitIdForLabel(unit.bezeichnung || "Wasser", index);
    });
    data.waterMeterHistory.units.sort((a,b) => String(a.wohnung || "").localeCompare(String(b.wohnung || ""), "de"));
  }
  if (Array.isArray(data.jahresArchiv)) {
    data.jahresArchiv.forEach(item => {
      if (item && item.data && item.data !== data) migrateUnitIdsInData(item.data);
    });
  }
  return data;
}

function ensureTenantIdentityFields(m) {
  if (!m) return;
  delete m.personId;
}

function ensureTenantIdentityData(data) {
  if (!data || !Array.isArray(data.mieter)) return;
  data.mieter.forEach(m => ensureTenantIdentityFields(m));
  if (Array.isArray(data.jahresArchiv)) {
    data.jahresArchiv.forEach(item => {
      if (item && item.data && item.data !== data) ensureTenantIdentityData(item.data);
    });
  }
}

function tenantDisplayId(m) {
  return String((m && m.id) || "");
}

function tenantIdCellHtml(m) {
  return escapeHtml(tenantDisplayId(m));
}

function ensureUnitIdentityFields(w) {
  if (!w) return;
  delete w.unitId;
  w.id = canonicalUnitIdFor(w) || w.id || "";
}

function ensureUnitIdentityData(data) {
  return migrateUnitIdsInData(data);
}

function unitDisplayId(w) {
  return String((w && w.id) || "");
}

function unitByInternalId(id) {
  if (!Array.isArray(state.wohnungen)) return null;
  return state.wohnungen.find(w => String(w.id || "") === String(id || "")) || null;
}

function unitDisplayIdByInternalId(id) {
  return String(id || "");
}

function unitIdCellHtml(w) {
  return escapeHtml(unitDisplayId(w));
}

function unitRefCellHtml(id) {
  return escapeHtml(unitDisplayIdByInternalId(id));
}

function unitSelectHtmlFromRows(value, rows, onChange) {
  const current = String(value || "");
  const known = Array.isArray(rows) ? rows.filter(w => w && w.id) : [];
  let options = "";
  if (current && !known.some(w => String(w.id) === current)) {
    options += '<option value="' + escapeHtml(current) + '" selected>' + escapeHtml(current + " - nicht in Stammdaten") + '</option>';
  }
  options += known.map(w => {
    const id = String(w.id || "");
    const label = id + " - " + (w.bezeichnung || w.lage || id);
    return '<option value="' + escapeHtml(id) + '" ' + (id === current ? 'selected' : '') + '>' + escapeHtml(label) + '</option>';
  }).join("");
  return '<select' + legacyUiActionAttributes(onChange, "change") + '><option value="">Bitte waehlen</option>' + options + '</select>';
}

function unitSelectHtml(value, onChange) {
  return unitSelectHtmlFromRows(value, state.wohnungen, onChange);
}

function masterUnitSelectHtml(value, onChange) {
  return unitSelectHtmlFromRows(value, NK_PRO_MODULES.masterDataActions.masterUnits(), onChange);
}

function ensureTenantContactData() {
  if (!Array.isArray(state.mieter)) return;
  state.mieter.forEach(m => { ensureTenantContactFields(m); ensureTenantIdentityFields(m); });
}

function comparableTenantName(value) {
  return String(value || "")
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function applyKnownMasterTenantEntryDates(data, options = {}) {
  if (!data || !data.meta || (data.meta && data.meta.archiveViewer)) return false;
  if (data.meta.masterTenantEntryDateFix === MASTER_TENANT_ENTRY_DATE_FIX_ID) return false;
  NK_PRO_MODULES.masterDataActions.ensureStammdatenData(data);
  let changed = false;
  const targets = MASTER_TENANT_ENTRY_DATES.map(item => ({
    ...item,
    normalizedName: comparableTenantName(item.name)
  }));

  data.stammdaten.mieter.forEach(m => {
    const name = comparableTenantName(m && m.name);
    const target = targets.find(item => name.includes(item.normalizedName));
    if (!target) return;
    if (m.einzug !== target.date) {
      m.einzug = target.date;
      changed = true;
    }
  });

  data.meta.masterTenantEntryDateFix = MASTER_TENANT_ENTRY_DATE_FIX_ID;
  if (options.save && data === state) saveData();
  return changed;
}

function renderBillingStammdatenStatus() {
  const el = document.getElementById("billingStammdatenStatus");
  if (!el) return;
  if (isArchiveViewer()) {
    el.innerHTML = '<strong>Archivansicht:</strong> Diese Abrechnung bleibt ein eingefrorener Stand. Der zentrale Bestand wird hier nicht in alte Abrechnungen übernommen.';
    return;
  }
  const diff = NK_PRO_MODULES.masterDataActions.stammdatenBillingDiff();
  const applied = state.meta && state.meta.stammdatenAppliedAt ? " Letzte Übernahme: " + dateDe(state.meta.stammdatenAppliedAt) + "." : "";
  el.innerHTML = diff.same
    ? '<strong>Synchron:</strong> Die Abrechnungskopie entspricht dem zentralen Mieter- und Wohnungsbestand.' + applied
    : '<strong>Nicht synchron:</strong> Zentraler Bestand ' + diff.masterTenants + ' Mietverhältnisse / ' + diff.masterUnits + ' Wohnungen, Abrechnungskopie ' + diff.billingTenants + ' Mietverhältnisse / ' + diff.billingUnits + ' Wohnungen. Nutze den Button, wenn dieser Bestand die aktuelle Abrechnung überschreiben soll.' + applied;
}





function ensureZimmermannTenantForLegacyData(data) {
  if (!data) return;
  if (!Array.isArray(data.wohnungen)) data.wohnungen = [];
  let w00 = data.wohnungen.find(w => w.id === "W000.UG");
  if (!w00) {
    w00 = {id:"W000.UG", bezeichnung:"UG", lage:"UG", wohnflaeche:55, zimmer:2, status:"aktiv", bemerkung:""};
    data.wohnungen.push(w00);
  }

  if (!Array.isArray(data.mieter)) data.mieter = [];
  let m000 = data.mieter.find(m => m.id === "M000");
  const shouldFill = !m000 || !hasTenantData(m000) || !m000.name;

  if (!m000) {
    m000 = {id:"M000"};
    data.mieter.push(m000);
  }

  if (shouldFill) {
    w00.status = "aktiv";
    Object.assign(m000, {
      id:"M000",
      wohnung:"W000.UG",
      name:"Erik Zimmermann",
      einzug:"2024-01-01",
      auszug:"",
      kaltSoll:0,
      kaltErhalten:0,
      nkVoraus:0,
      einnahmen:0,
      aktiveTage:365,
      wohnflaeche:55,
      bemerkung:"kein Abrechnungsbrief 2024 vorhanden; ab V28 normal abrechnungsrelevant",
      status:"Aktiv",
      personen:1,
      personentage:365,
      geschlecht:"Herr",
      standardanrede:"Sehr geehrte(r) Mieter/in,",
      abrechnungRolle:"Eigentümer/Privat",
      strasse:"Am Rauhen Biehl 5",
      plz:"55774",
      ort:"Baumholder",
      telefon:"",
      email:"",
      wasserWeitereVorauszahlung:0,
      vorjahresKorrektur:0,
      archivedAt:"",
      vzChangeHeizung:"",
      vzChangeWasser:"",
      vzChangeAbfall:"",
      vzChangeAntenne:""
    });
  }
  ensureTenantContactFields(m000);
}

function tenantLastName(tenant) {
  const name = String((tenant && tenant.name) || "").trim();
  if (!name) return "";
  if (name.includes(",")) return name.split(",")[0].trim();
  return name.split(/\s+/).slice(-1)[0] || name;
}

function tenantAddressPrefix(tenant) {
  const g = tenant && tenant.geschlecht ? tenant.geschlecht : "Frau/Herr";
  if (g === "Frau") return "Frau";
  if (g === "Herr") return "Herr";
  if (g === "Firma/Divers") return "";
  return "Frau/Herr";
}

function tenantMailingAddress(tenant) {
  ensureTenantContactFields(tenant);
  const prefix = tenantAddressPrefix(tenant);
  const place = [tenant.plz || "", tenant.ort || ""].filter(Boolean).join(" ");
  return [prefix, tenant.name || "", tenant.strasse || "", place].filter(Boolean).join("\n");
}

function tenantSalutationFromTemplate(tenant, template) {
  const lastName = tenantLastName(tenant);
  if (template === "Sehr geehrte Frau [Nachname],") return "Sehr geehrte Frau " + (lastName || "") + ",";
  if (template === "Sehr geehrter Herr [Nachname],") return "Sehr geehrter Herr " + (lastName || "") + ",";
  return template;
}

function isArchivedTenant(m) {
  return m && m.status === "Archiviert";
}

function isoDateSerial(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const serial = Date.UTC(year, month - 1, day);
  const check = new Date(serial);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return serial;
}

function billingPeriodSerials(startIso = periodStart(), endIso = periodEnd()) {
  const start = isoDateSerial(startIso);
  const end = isoDateSerial(endIso);
  if (start === null || end === null) return null;
  return {
    start: Math.min(start, end),
    end: Math.max(start, end)
  };
}

function tenantOverlapsPeriod(m, startIso = periodStart(), endIso = periodEnd()) {
  if (!hasTenantData(m) || isArchivedTenant(m)) return false;
  const period = billingPeriodSerials(startIso, endIso);
  if (!period) return true;
  const leaseStart = isoDateSerial(m.einzug) ?? period.start;
  const leaseEnd = isoDateSerial(m.auszug) ?? period.end;
  return leaseStart <= period.end && leaseEnd >= period.start;
}

function tenantOverlapsCurrentPeriod(m) {
  return tenantOverlapsPeriod(m, periodStart(), periodEnd());
}

function tenantRelevantForCurrentBilling(m) {
  return hasTenantData(m) && !isArchivedTenant(m) && tenantOverlapsCurrentPeriod(m);
}

function tenantActiveDaysInCurrentPeriod(m) {
  const period = billingPeriodSerials(periodStart(), periodEnd());
  if (!period) return periodDaysExact();
  if (!tenantOverlapsCurrentPeriod(m)) return 0;
  const leaseStart = isoDateSerial(m.einzug) ?? period.start;
  const leaseEnd = isoDateSerial(m.auszug) ?? period.end;
  const clippedStart = Math.max(leaseStart, period.start);
  const clippedEnd = Math.min(leaseEnd, period.end);
  return Math.max(0, Math.round((clippedEnd - clippedStart) / 86400000) + 1);
}

function tenantOpenStatus(m) {
  if (isArchivedTenant(m)) return "Archiviert";
  if (!hasTenantData(m)) return "";
  if (!tenantOverlapsCurrentPeriod(m)) return "Außerhalb Zeitraum";
  if (m.auszug) return "NK offen";
  return "Aktiv";
}

function visibleTenantRows() {
  return state.mieter
    .map((m,i) => ({...m, originalIndex:i}))
    .filter(m => tenantRelevantForCurrentBilling(m));
}

function archivedTenantRows() {
  return state.mieter
    .map((m,i) => ({...m, originalIndex:i}))
    .filter(m => hasTenantData(m) && isArchivedTenant(m));
}

function isPrivateTenant(...args) { return NK_PRO_MODULES.billingCalculation.isPrivateTenant(...args); }

function isBillableTenant(...args) { return NK_PRO_MODULES.billingCalculation.isBillableTenant(...args); }

function billableTenantRows(...args) { return NK_PRO_MODULES.billingCalculation.billableTenantRows(...args); }

function privateTenantRows(...args) { return NK_PRO_MODULES.billingCalculation.privateTenantRows(...args); }

function nextMietId() {
  const maxNum = state.mieter.reduce((max,m) => {
    const match = String(m.id || "").match(/^M(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return "M" + String(maxNum + 1).padStart(3, "0");
}

function addMietverhaeltnis() {
  const blankIndex = state.mieter.findIndex(m => !hasTenantData(m) && !isArchivedTenant(m));
  const newRow = {
    id: blankIndex >= 0 && state.mieter[blankIndex].id ? state.mieter[blankIndex].id : nextMietId(),

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
  if (blankIndex >= 0) state.mieter[blankIndex] = newRow;
  else state.mieter.push(newRow);
  NK_PRO_MODULES.costActions.syncVorauszahlungen();
  commitStateChange({ reason:"Benutzereingabe" });
}

function archiveMietverhaeltnis(index) {
  const row = state.mieter[index];
  if (!row || !hasTenantData(row)) return;
  if (!confirm("Dieses Mietverhältnis archivieren? Es wird danach nicht mehr in aktueller Kaltmiete, NK-Vorauszahlungen, Umlage und Briefauswahl berücksichtigt.")) return;
  row.status = "Archiviert";
  row.archivedAt = todayIso();
  commitStateChange({ reason:"Benutzereingabe" });
}

function restoreMietverhaeltnis(index) {
  const row = state.mieter[index];
  if (!row) return;
  row.status = row.auszug ? "NK offen" : "Aktiv";
  row.archivedAt = "";
  commitStateChange({ reason:"Benutzereingabe" });
}

function tenantHeaderHtml(t) {
  const id = escapeHtml(tenantDisplayId(t) || t.id || "");
  const name = escapeHtml(t.name || "");
  return '<th class="tenant-head"><span class="tenant-id">' + id + '</span><span class="tenant-name">' + name + '</span></th>';
}

function unitHeaderHtml(w) {
  const id = escapeHtml(unitDisplayId(w) || w.id || "");
  const name = escapeHtml(w.bezeichnung || w.lage || "");
  const status = escapeHtml(w.status || "");
  return '<th class="unit-head"><span class="unit-id">' + id + '</span><span class="unit-name">' + name + '</span><span class="unit-status">' + status + '</span></th>';
}

function renderVersionInfo() {
  const el = document.getElementById("versionInfo");
  if (!el) return;
  el.innerHTML =
    '<div class="inline-titlebar"><div><h3>Version ' + escapeHtml(APP_VERSION) + ' · ' + escapeHtml(APP_VERSION_NAME) + '</h3>' +
    '<p class="small">Stand: ' + escapeHtml(dateDe(APP_RELEASE_DATE)) + ' · Datenschema: v' + escapeHtml(DATA_SCHEMA_VERSION) + ' · Speicherbereich: ' + escapeHtml(STORAGE_KEY) + '</p></div>' +
    '<div class="start-action-stack"><span class="period-badge">Aktueller Bearbeitungsstand</span></div></div>' +
    '<ul class="small">' + APP_CHANGELOG.map(item => '<li>' + escapeHtml(item) + '</li>').join("") + '</ul>';
}

function qualitySeverityClass(severity) {
  if (severity === "OK") return "ok";
  if (severity === "Hinweis") return "neutral";
  if (severity === "Prüfen") return "warn";
  return "err";
}



function storageWritable() {
  return NK_PRO_MODULES.persistence.storageWritable(STORAGE_KEY + "_write_test", persistenceModuleOptions());
}



function hasCompleteMailingAddress(tenant) {
  return !!(tenant && tenant.name && tenant.strasse && tenant.plz && tenant.ort);
}

function costPrepaymentRow(costId) {
  return Array.isArray(state.vorauszahlungen) ? state.vorauszahlungen.find(v => v && v.kostenId === costId) : null;
}

function prepaymentMatrixSumForCost(...args) { return NK_PRO_MODULES.billingCalculation.prepaymentMatrixSumForCost(...args); }





