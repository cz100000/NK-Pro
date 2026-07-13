"use strict";

// AP12: Zählerdatenaufbereitung und Zähleransichten.
// ===== Bereich: Berechnung, Tabellen und Fachlogik =====
const DEFAULT_UMLAGE_INPUTS = {
  K002: [48,16,22,98,104],
  K006: [2082.65,975.92,1524.97,1761.65]
};

function tenantRowsWithIndex(...args) { return NK_PRO_MODULES.billingCalculation.tenantRowsWithIndex(...args); }



function normalizeActiveDayValue(...args) { return NK_PRO_MODULES.billingCalculation.normalizeActiveDayValue(...args); }

function normalizeTenantActiveDays() {
  state.mieter.forEach(m => {
    const days = normalizeActiveDayValue(m.aktiveTage);
    if (days && typeof m.aktiveTage === "string" && /^\d{4}-\d{2}-\d{2}/.test(m.aktiveTage)) {
      m.aktiveTage = days;
    }
  });
}

function tenantDays(...args) { return NK_PRO_MODULES.billingCalculation.tenantDays(...args); }


function allWohnungen(...args) { return NK_PRO_MODULES.billingCalculation.allWohnungen(...args); }

function activeWohnungen(...args) { return NK_PRO_MODULES.billingCalculation.activeWohnungen(...args); }





function formatPlainNumber(...args) { return NK_PRO_MODULES.billingCalculation.formatPlainNumber(...args); }

function umlageBasisInfo(k, row) {
  const inputMode = manualInputModeForCost(k);
  if (k.umlageschluessel === "Verteilung auf alle Wohneinheiten") {
    const count = num(row.basisTotal) || allWohnungen().length;
    return { basis: count + " Wohneinheiten gesamt", unit: count ? fmtMoney(num(k.gesamtbetrag) / count) : "–" };
  }

  if (k.umlageschluessel === "Verteilung nur auf aktive Wohneinheiten") {
    const count = num(row.basisTotal) || activeWohnungen().length;
    return { basis: count + " aktive Wohneinheiten", unit: count ? fmtMoney(num(k.gesamtbetrag) / count) : "–" };
  }

  if (inputMode === "Verbrauchsmenge" || inputMode === "Zählerstände" || k.umlageschluessel === "Verbrauch") {
    const unitText = num(k.preisProEinheit) > 0 ? fmtMoney(k.preisProEinheit) : "Preis fehlt";
    return { basis: formatPlainNumber(row.inputSum, 3) + " Einheiten", unit: unitText };
  }

  if (k.umlageschluessel === "Wohnfläche") {
    return { basis: formatPlainNumber(row.basisTotal, 0) + " m²-Tage", unit: "–" };
  }

  if (k.umlageschluessel === "Personen") {
    return { basis: formatPlainNumber(row.basisTotal, 0) + " Personentage", unit: "–" };
  }

  if (k.umlageschluessel === "Miettage") {
    return { basis: formatPlainNumber(row.basisTotal, 0) + " Miettage", unit: "–" };
  }

  if (k.umlageschluessel === UMLAGE_MANUAL || k.berechnungsart === "Manuell je Mieter") {
    return { basis: "Einzelbeträge", unit: "–" };
  }

  return { basis: "–", unit: "–" };
}


function defaultWaterMeterSettings() {
  return {
    enabled:"Ja",
    houseWaterTotal:0,
    houseMeterStart:"",
    houseMeterStartDate:"",
    houseMeterEnd:"",
    houseMeterEndDate:"",
    houseInvoiceNote:""
  };
}

function consumptionCosts() {
  return state.kostenarten.filter(k => k.id && k.kostenart && k.umlageschluessel === "Verbrauch");
}

function isWaterCost(costId) {
  return String(costId || "") === "K002";
}

function ensureWaterMeterData() {
  if (!state.waterMeters) state.waterMeters = {};
  if (!state.waterMeters.settings) state.waterMeters.settings = defaultWaterMeterSettings();
  const defaults = defaultWaterMeterSettings();
  Object.keys(defaults).forEach(key => {
    if (state.waterMeters.settings[key] === undefined || state.waterMeters.settings[key] === null) state.waterMeters.settings[key] = defaults[key];
  });
  state.waterMeters.settings.enabled = "Ja";
  if (!state.waterMeters.settings.houseMeterStartDate) state.waterMeters.settings.houseMeterStartDate = periodStart();
  if (!state.waterMeters.settings.houseMeterEndDate) state.waterMeters.settings.houseMeterEndDate = periodEnd();
  if (!state.meterReadings) state.meterReadings = {};
  if (!state.meterReadings.readings) state.meterReadings.readings = {};

  const tenantCount = Math.max(20, state.mieter.length);
  const defaultStartDate = periodStart() || (String(currentAbrechnungsjahr()) + "-01-01");
  const defaultEndDate = periodEnd() || (String(currentAbrechnungsjahr()) + "-12-31");

  consumptionCosts().forEach(cost => {
    const defaultValues = (state.umlageInputs && state.umlageInputs[cost.id] && Array.isArray(state.umlageInputs[cost.id].values))
      ? state.umlageInputs[cost.id].values
      : (DEFAULT_UMLAGE_INPUTS[cost.id] || []);

    if (isWaterCost(cost.id)) {
      if (!Array.isArray(state.waterMeters.readings)) state.waterMeters.readings = [];
      while (state.waterMeters.readings.length < tenantCount) {
        const idx = state.waterMeters.readings.length;
        const defaultConsumption = num(defaultValues[idx]);
        state.waterMeters.readings.push({
          kwStart:0,
          kwStartDate:defaultStartDate,
          kwEnd:"",
          kwEndDate:defaultEndDate,
          wwStart:0,
          wwStartDate:defaultStartDate,
          wwEnd:"",
          wwEndDate:defaultEndDate,
          bemerkung:""
        });
      }
      state.waterMeters.readings.forEach((r, idx) => {
        if (r.kwStart === undefined) r.kwStart = 0;
        if (r.kwStartDate === undefined || r.kwStartDate === "") r.kwStartDate = defaultStartDate;
        if (r.kwEnd === undefined) r.kwEnd = "";
        if (r.kwEndDate === undefined || r.kwEndDate === "") r.kwEndDate = defaultEndDate;
        if (r.wwStart === undefined) r.wwStart = 0;
        if (r.wwStartDate === undefined || r.wwStartDate === "") r.wwStartDate = defaultStartDate;
        if (r.wwEnd === undefined) r.wwEnd = "";
        if (r.wwEndDate === undefined || r.wwEndDate === "") r.wwEndDate = defaultEndDate;
        if (r.bemerkung === undefined) r.bemerkung = "";
      });
    } else {
      if (!Array.isArray(state.meterReadings.readings[cost.id])) state.meterReadings.readings[cost.id] = [];
      const rows = state.meterReadings.readings[cost.id];
      while (rows.length < tenantCount) {
        const idx = rows.length;
        const defaultConsumption = num(defaultValues[idx]);
        rows.push({
          start:0,
          startDate:defaultStartDate,
          end:"",
          endDate:defaultEndDate,
          bemerkung:""
        });
      }
      rows.forEach((r, idx) => {
        if (r.start === undefined) r.start = 0;
        if (r.startDate === undefined || r.startDate === "") r.startDate = defaultStartDate;
        if (r.end === undefined) r.end = "";
        if (r.endDate === undefined || r.endDate === "") r.endDate = defaultEndDate;
        if (r.bemerkung === undefined) r.bemerkung = "";
      });
    }
  });
}

function waterConsumption(...args) { return NK_PRO_MODULES.billingCalculation.waterConsumption(...args); }

function genericMeterConsumption(...args) { return NK_PRO_MODULES.billingCalculation.genericMeterConsumption(...args); }


function meterTotalForCostAndTenant(...args) { return NK_PRO_MODULES.billingCalculation.meterTotalForCostAndTenant(...args); }

function waterMeterRowStatus(row) {
  const kwHasEnd = hasEnteredMeterValue(row.kwEnd);
  const wwHasEnd = hasEnteredMeterValue(row.wwEnd);
  const kwInvalid = kwHasEnd && num(row.kwEnd) < num(row.kwStart);
  const wwInvalid = wwHasEnd && num(row.wwEnd) < num(row.wwStart);
  if (kwInvalid || wwInvalid) return "Zählerstand prüfen";
  if (!kwHasEnd && !wwHasEnd) return "Endstand fehlt";
  return "OK";
}

function genericMeterRowStatus(row) {
  if (hasEnteredMeterValue(row.end) && num(row.end) < num(row.start)) return "Zählerstand prüfen";
  if (!hasEnteredMeterValue(row.end)) return "Endstand fehlt";
  return "OK";
}



function applyWaterMetersToUmlage() {
  ensureWaterMeterData();
  synchronizeMeteringData(state);
  state.waterMeters.settings.enabled = "Ja";
  const tenantCount = Math.max(20, state.mieter.length);

  consumptionCosts().forEach(cost => {
    if (!state.umlageInputs || !state.umlageInputs[cost.id]) return;
    if (manualInputModeForCost(cost) !== "Zählerstände") return;
    while (state.umlageInputs[cost.id].values.length < tenantCount) state.umlageInputs[cost.id].values.push(0);
    for (let i = 0; i < tenantCount; i++) state.umlageInputs[cost.id].values[i] = 0;
    visibleTenantRows().forEach(t => { state.umlageInputs[cost.id].values[t.originalIndex] = meterTotalForCostAndTenant(cost.id, t.originalIndex); });
  });
}

function setWaterMeterSetting(key, value) {
  ensureWaterMeterData();
  const numericKeys = ["houseWaterTotal","houseMeterStart","houseMeterEnd"];
  state.waterMeters.settings[key] = numericKeys.includes(key) ? (String(value || "").trim() === "" ? "" : num(value)) : value;
  state.waterMeters.settings.enabled = "Ja";
  syncUmlageInputs();
  applyWaterMetersToUmlage();
  commitStateChange({ reason:"Benutzereingabe" });
}

function setWaterMeterValue(index, key, value, type="text") {
  ensureWaterMeterData();
  if (!state.waterMeters.readings[index]) state.waterMeters.readings[index] = {};
  state.waterMeters.readings[index][key] = type === "number" ? (String(value || "").trim() === "" ? "" : num(value)) : value;
  if (["kwEnd","wwEnd"].includes(key)) {
    if (!state.meta) state.meta = {};
    state.meta.meterNumericEndValuesTouchedForYear = currentAbrechnungsjahr();
  } else if (["kwEndDate","wwEndDate"].includes(key)) {
    if (!state.meta) state.meta = {};
    state.meta.meterEndDateFieldsTouchedForYear = currentAbrechnungsjahr();
  }
  syncUmlageInputs();
  applyWaterMetersToUmlage();
  commitStateChange({ reason:"Benutzereingabe" });
}

function setGenericMeterValue(costId, index, key, value, type="text") {
  ensureWaterMeterData();
  if (!state.meterReadings.readings[costId]) state.meterReadings.readings[costId] = [];
  if (!state.meterReadings.readings[costId][index]) state.meterReadings.readings[costId][index] = {};
  state.meterReadings.readings[costId][index][key] = type === "number" ? (String(value || "").trim() === "" ? "" : num(value)) : value;
  if (key === "end") {
    if (!state.meta) state.meta = {};
    state.meta.meterNumericEndValuesTouchedForYear = currentAbrechnungsjahr();
  } else if (key === "endDate") {
    if (!state.meta) state.meta = {};
    state.meta.meterEndDateFieldsTouchedForYear = currentAbrechnungsjahr();
  }
  syncUmlageInputs();
  applyWaterMetersToUmlage();
  commitStateChange({ reason:"Benutzereingabe" });
}

function meterInput(value, index, key, type="number") {
  const cls = type === "number" ? "number" : "";
  const htmlType = type === "date" ? "date" : "text";
  return '<input type="' + htmlType + '" class="' + cls + '" value="' + escapeHtml(value ?? "") + '"' + uiActionAttributes("meter.setWaterValue", [index,key,"$value",type], "change") + '>';
}

function genericMeterInput(costId, value, index, key, type="number") {
  const cls = type === "number" ? "number" : "";
  const htmlType = type === "date" ? "date" : "text";
  return '<input type="' + htmlType + '" class="' + cls + '" value="' + escapeHtml(value ?? "") + '"' + uiActionAttributes("meter.setGenericValue", [costId,index,key,"$value",type], "change") + '>';
}

function renderWaterCostSection(cost, visibleRows) {
  const totals = visibleRows.reduce((acc,t) => {
    const row = state.waterMeters.readings[t.originalIndex] || {};
    acc.kw += waterConsumption(row, "kw");
    acc.ww += waterConsumption(row, "ww");
    return acc;
  }, { kw:0, ww:0 });

  const rows = visibleRows.length ? visibleRows.map(t => {
    const i = t.originalIndex;
    const r = state.waterMeters.readings[i] || {};
    const kw = waterConsumption(r, "kw");
    const ww = waterConsumption(r, "ww");
    const total = kw + ww;
    const status = waterMeterRowStatus(r);
    return '<tr>' +
      '<td>' + tenantIdCellHtml(t) + '</td>' +
      '<td>' + unitRefCellHtml(t.wohnung) + '</td>' +
      '<td>' + escapeHtml(t.name || "") + '</td>' +
      '<td class="editable">' + meterInput(r.kwStart, i, "kwStart", "number") + '</td>' +
      '<td class="editable">' + meterInput(r.kwStartDate, i, "kwStartDate", "date") + '</td>' +
      '<td class="editable">' + meterInput(r.kwEnd, i, "kwEnd", "number") + '</td>' +
      '<td class="editable">' + meterInput(r.kwEndDate, i, "kwEndDate", "date") + '</td>' +
      '<td class="readonly-cell">' + kw.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>' +
      '<td class="editable">' + meterInput(r.wwStart, i, "wwStart", "number") + '</td>' +
      '<td class="editable">' + meterInput(r.wwStartDate, i, "wwStartDate", "date") + '</td>' +
      '<td class="editable">' + meterInput(r.wwEnd, i, "wwEnd", "number") + '</td>' +
      '<td class="editable">' + meterInput(r.wwEndDate, i, "wwEndDate", "date") + '</td>' +
      '<td class="readonly-cell">' + ww.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>' +
      '<td class="readonly-cell">' + total.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>' +
      '<td><span class="status ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>' +
      '<td class="editable">' + inputHtml(r.bemerkung || "", "setWaterMeterValue(" + i + ",'bemerkung',this.value)") + '</td>' +
    '</tr>';
  }).join("") : '<tr><td colspan="17">Keine aktuellen oder NK-offenen Mietverhältnisse vorhanden.</td></tr>';

  const total = totals.kw + totals.ww;
  const footer = '<tfoot><tr class="total-row"><td colspan="7"><strong>Summe Verbrauch</strong></td>' +
    '<td class="readonly-cell"><strong>' + totals.kw.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td>' +
    '<td colspan="4">–</td>' +
    '<td class="readonly-cell"><strong>' + totals.ww.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td>' +
    '<td class="readonly-cell"><strong>' + total.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td>' +
    '<td colspan="2">–</td></tr></tfoot>';

  return '<h3>' + escapeHtml(cost.id + " · " + cost.kostenart) + '</h3>' +
    '<p class="small">Kaltwasser + Warmwasser werden getrennt erfasst.</p>' +
    '<div class="table-wrap"><table id="waterMeterTable">' +
    '<thead><tr>' +
    '<th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mieter</th>' +
    '<th>KW Anfang</th><th>KW Datum Anfang</th><th>KW Ende</th><th>KW Datum Ende</th><th>KW Verbrauch m³</th>' +
    '<th>WW Anfang</th><th>WW Datum Anfang</th><th>WW Ende</th><th>WW Datum Ende</th><th>WW Verbrauch m³</th>' +
    '<th>Gesamt m³</th><th>Status</th><th>Bemerkung</th>' +
    '</tr></thead><tbody>' + rows + '</tbody>' + footer + '</table></div>';
}

function renderGenericMeterSection(cost, visibleRows) {
  const readings = state.meterReadings.readings[cost.id] || [];
  const totalConsumption = visibleRows.reduce((sum,t) => sum + genericMeterConsumption(readings[t.originalIndex] || {}), 0);

  const rows = visibleRows.length ? visibleRows.map(t => {
    const i = t.originalIndex;
    const r = readings[i] || {};
    const consumption = genericMeterConsumption(r);
    const status = genericMeterRowStatus(r);
    return '<tr>' +
      '<td>' + tenantIdCellHtml(t) + '</td>' +
      '<td>' + unitRefCellHtml(t.wohnung) + '</td>' +
      '<td>' + escapeHtml(t.name || "") + '</td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.start, i, "start", "number") + '</td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.startDate, i, "startDate", "date") + '</td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.end, i, "end", "number") + '</td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.endDate, i, "endDate", "date") + '</td>' +
      '<td class="readonly-cell">' + consumption.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>' +
      '<td><span class="status ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.bemerkung || "", i, "bemerkung", "text") + '</td>' +
    '</tr>';
  }).join("") : '<tr><td colspan="10">Keine aktuellen oder NK-offenen Mietverhältnisse vorhanden.</td></tr>';

  return '<h3>' + escapeHtml(cost.id + " · " + cost.kostenart) + '</h3>' +
    '<p class="small">Allgemeine Zählerstand-Erfassung. Summe Verbrauch: <strong>' +
    totalConsumption.toLocaleString("de-DE", { maximumFractionDigits:3 }) + ' Einheiten</strong></p>' +
    '<div class="table-wrap"><table id="meterTable_' + escapeHtml(cost.id) + '">' +
    '<thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mieter</th><th>Anfangsstand</th><th>Datum Anfang</th><th>Endstand</th><th>Datum Ende</th><th>Verbrauch</th><th>Status</th><th>Bemerkung</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}


function meterHistoryValue(value) {
  if (value === null || value === undefined || value === "") return "–";
  const n = num(value);
  return n.toLocaleString("de-DE", { maximumFractionDigits:3 });
}

function meterHistoryDeltaFor(unit, year) {
  const rows = Array.isArray(unit.deltas) ? unit.deltas : [];
  return rows.find(d => String(d.jahr) === String(year)) || {};
}

function meterHistoryReadingFor(unit, year) {
  const rows = Array.isArray(unit.readings) ? unit.readings : [];
  return rows.find(r => String(r.jahr) === String(year)) || {};
}

function currentMeterEndBlankStatus() {
  const readings = state.waterMeters && Array.isArray(state.waterMeters.readings) ? state.waterMeters.readings : [];
  const generic = state.meterReadings && state.meterReadings.readings && typeof state.meterReadings.readings === "object" ? state.meterReadings.readings : {};
  const visibleIndices = new Set(visibleTenantRows().map(row => row.originalIndex));
  let checked = 0;
  let filled = 0;
  readings.forEach((r,index) => {
    if (!r || !visibleIndices.has(index)) return;
    checked += 2;
    if (hasEnteredMeterValue(r.kwEnd)) filled++;
    if (hasEnteredMeterValue(r.wwEnd)) filled++;
  });
  Object.keys(generic).forEach(costId => {
    const rows = Array.isArray(generic[costId]) ? generic[costId] : [];
    rows.forEach((r,index) => {
      if (!visibleIndices.has(index)) return;
      checked++;
      if (r && hasEnteredMeterValue(r.end)) filled++;
    });
  });
  return { checked, filled, empty: checked > 0 && filled === 0 };
}

function renderWaterMeterCarryForwardNotice() {
  const status=currentMeterEndBlankStatus(); const year=currentAbrechnungsjahr(); const warnings=state.meta&&Array.isArray(state.meta.meterCarryForwardWarnings)?state.meta.meterCarryForwardWarnings:[];
  if (warnings.length) return '<div class="hint feedback-box warn"><strong>⚠ Vorjahresübernahme prüfen:</strong><ul>'+warnings.slice(0,8).map(w=>'<li>'+escapeHtml(w)+'</li>').join('')+(warnings.length>8?'<li>Weitere Hinweise vorhanden.</li>':'')+'</ul></div>';
  if (state.meta && state.meta.meterCarryForwardAppliedForYear===year) return '<div class="hint feedback-box"><strong>✓ Vorjahresübernahme:</strong> Die Endstände des Vorjahres wurden als Anfangsstände für '+escapeHtml(year)+' übernommen; neue Endstände bleiben leer.</div>';
  if (status.empty || status.filled===0 || NK_PRO_MODULES.yearTransitionActions.numericEndValuesWereManuallyTouchedForYear(state,year)) return "";
  return '<div class="hint feedback-box warn"><strong>⚠ Zählerstände prüfen:</strong> Beim Anlegen der Abrechnung waren bereits '+escapeHtml(status.filled)+' Endwerte vorhanden. Bitte kontrollieren, ob diese Werte für die aktuelle Periode korrekt sind.</div>';
}

function archivedWaterHistoryByUnit() {
  const map = {};
  (state.jahresArchiv || []).forEach(item => {
    const data = item && item.data;
    if (!data) return;
    const year = String(item.year || (data.meta && data.meta.abrechnungsjahr) || "");
    if (!year) return;
    const snapshot = NK_PRO_MODULES.masterDataActions.captureMeterReadingsSnapshot(data);
    Object.keys(snapshot.water.byUnit || {}).forEach(unitId => {
      const r = snapshot.water.byUnit[unitId] || {};
      if (!map[unitId]) map[unitId] = {};
      map[unitId][year] = {
        kw:r.kwEnd,
        ww:r.wwEnd,
        gesamt:(hasEnteredMeterValue(r.kwEnd) ? num(r.kwEnd) : 0) + (hasEnteredMeterValue(r.wwEnd) ? num(r.wwEnd) : 0),
        verbrauch:waterConsumption(r,"kw") + waterConsumption(r,"ww"),
        source:"NK-Pro-Archiv"
      };
    });
  });
  return map;
}
function renderWaterMeterHistory() {
  const hist=state.waterMeterHistory||{}; const legacyUnits=Array.isArray(hist.units)?hist.units:[]; const archived=archivedWaterHistoryByUnit();
  const unitMap=new Map(); legacyUnits.forEach(u=>unitMap.set(String(u.wohnung||""),u)); allWohnungen().forEach(w=>{ if(!unitMap.has(String(w.id||""))) unitMap.set(String(w.id||""),{wohnung:w.id,bezeichnung:w.bezeichnung||w.lage||"",readings:[],deltas:[]}); });
  const years=new Set([2021,2022,2023,2024]); Object.values(archived).forEach(byYear=>Object.keys(byYear).forEach(y=>years.add(Number(y)))); const sorted=Array.from(years).filter(Number.isFinite).sort((a,b)=>a-b);
  const header='<thead><tr><th>Wohnung</th><th>Bezeichnung</th><th>Quelle</th>'+sorted.map(y=>'<th>Ende '+y+' KW</th><th>Ende '+y+' WW</th><th>Verbrauch '+y+'</th>').join('')+'</tr></thead>';
  const body=Array.from(unitMap.values()).map(unit=>{ const id=String(unit.wohnung||""); const cells=sorted.map(y=>{ const a=archived[id]&&archived[id][String(y)]; const legacy=meterHistoryReadingFor(unit,y); const delta=meterHistoryDeltaFor(unit,y); const r=a||legacy||{}; const consumption=a?a.verbrauch:delta.gesamt; return '<td class="readonly-cell">'+meterHistoryValue(r.kw)+'</td><td class="readonly-cell">'+meterHistoryValue(r.ww)+'</td><td class="readonly-cell">'+meterHistoryValue(consumption)+'</td>'; }).join(''); const sources=(archived[id]?"NK-Pro-Archiv ":"")+(legacyUnits.includes(unit)?"Excel-Altdaten":""); return '<tr><td>'+escapeHtml(id)+'</td><td>'+escapeHtml(unit.bezeichnung||"")+'</td><td>'+escapeHtml(sources.trim()||"–")+'</td>'+cells+'</tr>'; }).join('');
  return '<div class="table-wrap"><table id="waterMeterHistoryTable">'+header+'<tbody>'+body+'</tbody></table></div><div class="meter-history-source-note"><strong>Historie:</strong> Excel-Altdaten bleiben unverändert; jedes archivierte NK-Pro-Jahr wird automatisch über Wohnungs-ID und Abrechnungsjahr ergänzt.</div>';
}

function hasWaterSettingValue(value) {
  return value !== "" && value !== null && value !== undefined;
}

function houseMeterConsumption(settings) {
  const complete = hasWaterSettingValue(settings.houseMeterStart) && hasWaterSettingValue(settings.houseMeterEnd);
  if (!complete) return { complete:false, invalid:false, value:null };
  const value = num(settings.houseMeterEnd) - num(settings.houseMeterStart);
  return { complete:true, invalid:value < 0, value };
}

function waterDifferenceState(left, right, options = {}) {
  if (options.invalid) return { key:"error", icon:"✕", label:"Zählerstand prüfen", diff:null, percent:null };
  if (left === null || right === null || left === undefined || right === undefined || !Number.isFinite(num(left)) || !Number.isFinite(num(right)) || num(right) <= 0) {
    return { key:"neutral", icon:"•", label:"Noch nicht prüfbar", diff:null, percent:null };
  }
  const diff = num(left) - num(right);
  const percentBase = options.percentBase === "left" ? num(left) : num(right);
  const percent = Math.abs(diff) / Math.abs(percentBase) * 100;
  return percent <= 5
    ? { key:"ok", icon:"✓", label:"Plausibel", diff, percent }
    : { key:"warn", icon:"⚠", label:"Abweichung prüfen", diff, percent };
}

function houseMeterMetricHtml(label, value, state, detail) {
  const key = state && state.key ? state.key : "neutral";
  const icon = state && state.icon ? state.icon + " " : "";
  return '<div class="house-meter-metric is-' + key + '"><span>' + escapeHtml(label) + '</span><strong>' +
    escapeHtml(icon + value) + '</strong>' + (detail ? '<small>' + escapeHtml(detail) + '</small>' : '') + '</div>';
}

function waterValidationItemHtml(state, title, detail) {
  const key = state && state.key ? state.key : "neutral";
  const icon = state && state.icon ? state.icon : "•";
  return '<div class="water-validation-item is-' + key + '"><span class="validation-icon">' + escapeHtml(icon) + '</span><div><strong>' +
    escapeHtml(title) + '</strong>' + (detail ? '<div class="small">' + escapeHtml(detail) + '</div>' : '') + '</div></div>';
}

function renderWaterMeters() {
  const legacySectionsEl = document.getElementById("meterSections");
  const currentSectionsEl = document.getElementById("meterCurrentSections");
  const historyEl = document.getElementById("meterHistory");
  const carryForwardEl = document.getElementById("meterCarryForward");
  const consumptionControlEl = document.getElementById("meterConsumptionControl");
  const controlSummaryEl = document.getElementById("meterControlSummary");
  const settingsEl = document.getElementById("waterMeterSettings");
  const houseComparisonEl = document.getElementById("meterHouseComparison");
  const houseHistoryNoteEl = document.getElementById("meterHouseHistoryNote");
  if (!settingsEl || !houseComparisonEl || !houseHistoryNoteEl || !currentSectionsEl || !historyEl || !carryForwardEl || !consumptionControlEl || !controlSummaryEl) return;

  const visibleRows = visibleTenantRows();
  const settings = state.waterMeters.settings;
  settings.enabled = "Ja";
  const costs = consumptionCosts();
  const waterCosts = costs.filter(cost => isWaterCost(cost.id));
  const tenantWaterTotal = waterCosts.reduce((sum,cost) => {
    visibleRows.forEach(t => sum += meterTotalForCostAndTenant(cost.id, t.originalIndex));
    return sum;
  }, 0);
  const invoiceWaterTotal = num(settings.houseWaterTotal);
  const houseResult = houseMeterConsumption(settings);
  const houseWaterTotal = houseResult.complete && !houseResult.invalid ? houseResult.value : null;
  const invoiceVsHouse = waterDifferenceState(invoiceWaterTotal > 0 ? invoiceWaterTotal : null, houseWaterTotal, { invalid:houseResult.invalid });
  const houseVsTenant = waterDifferenceState(houseWaterTotal, tenantWaterTotal > 0 ? tenantWaterTotal : null, { invalid:houseResult.invalid, percentBase:"left" });
  const meterStatus = currentMeterEndBlankStatus();

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("wasser");

  settingsEl.innerHTML =
    '<label class="house-meter-field"><span>Hauszählerstand Beginn</span><input class="number" value="' + escapeHtml(settings.houseMeterStart ?? "") + '" ' + uiActionAttributes("meter.setWaterSetting", ["houseMeterStart","$value"], "change") + '></label>' +
    '<label class="house-meter-field"><span>Ablesedatum Beginn</span><input type="date" value="' + escapeHtml(settings.houseMeterStartDate || "") + '" ' + uiActionAttributes("meter.setWaterSetting", ["houseMeterStartDate","$value"], "change") + '></label>' +
    '<label class="house-meter-field"><span>Hauszählerstand Ende</span><input class="number" value="' + escapeHtml(settings.houseMeterEnd ?? "") + '" ' + uiActionAttributes("meter.setWaterSetting", ["houseMeterEnd","$value"], "change") + '></label>' +
    '<label class="house-meter-field"><span>Ablesedatum Ende</span><input type="date" value="' + escapeHtml(settings.houseMeterEndDate || "") + '" ' + uiActionAttributes("meter.setWaterSetting", ["houseMeterEndDate","$value"], "change") + '></label>' +
    '<label class="house-meter-field"><span>Verbrauch laut Hauszähler</span><div class="house-meter-readonly">' +
      (houseResult.complete ? (houseResult.invalid ? 'Endstand kleiner als Anfangsstand' : houseResult.value.toLocaleString("de-DE", { maximumFractionDigits:3 }) + ' m³') : 'Wird automatisch berechnet') + '</div></label>' +
    '<label class="house-meter-field"><span>Verbrauch laut Wasserwerksrechnung (m³)</span><input class="number" value="' + escapeHtml(settings.houseWaterTotal ?? "") + '" ' + uiActionAttributes("meter.setWaterSetting", ["houseWaterTotal","$value"], "change") + '></label>' +
    '<label class="house-meter-field house-meter-field--wide"><span>Rechnungsnummer / Bemerkung (optional)</span><input value="' + escapeHtml(settings.houseInvoiceNote || "") + '" ' + uiActionAttributes("meter.setWaterSetting", ["houseInvoiceNote","$value"], "change") + '></label>';

  const houseMetricState = houseResult.invalid ? {key:"error",icon:"✕"} : (houseResult.complete ? {key:"ok",icon:"✓"} : {key:"neutral",icon:"•"});
  const invoiceMetricState = invoiceWaterTotal > 0 ? {key:"ok",icon:"✓"} : {key:"neutral",icon:"•"};
  const tenantMetricState = tenantWaterTotal > 0 ? {key:"ok",icon:"✓"} : {key:"neutral",icon:"•"};
  const invoiceDiffText = invoiceVsHouse.diff === null ? "–" : invoiceVsHouse.diff.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³";
  const tenantDiffText = houseVsTenant.diff === null ? "–" : houseVsTenant.diff.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³";
  houseComparisonEl.innerHTML = '<div class="house-meter-comparison">' +
    houseMeterMetricHtml("Hauszählerverbrauch", houseWaterTotal === null ? "–" : houseWaterTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³", houseMetricState, houseResult.complete ? "Endstand minus Anfangsstand" : "Anfangs- und Endstand erfassen") +
    houseMeterMetricHtml("Wasserwerksrechnung", invoiceWaterTotal > 0 ? invoiceWaterTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³" : "–", invoiceMetricState, "Verbrauch laut Rechnung") +
    houseMeterMetricHtml("Wohnungszähler gesamt", tenantWaterTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³", tenantMetricState, "Summe K002") +
    houseMeterMetricHtml("Differenz Rechnung ↔ Haus", invoiceDiffText, invoiceVsHouse, invoiceVsHouse.percent === null ? invoiceVsHouse.label : invoiceVsHouse.label + " · " + invoiceVsHouse.percent.toLocaleString("de-DE", { maximumFractionDigits:1 }) + " %") +
    houseMeterMetricHtml("Differenz Haus ↔ Wohnungen", tenantDiffText, houseVsTenant, houseVsTenant.percent === null ? houseVsTenant.label : houseVsTenant.label + " · " + houseVsTenant.percent.toLocaleString("de-DE", { maximumFractionDigits:1 }) + " %") +
    '</div>';

  houseHistoryNoteEl.innerHTML = '<p class="meter-house-history-note"><strong>Hausanschluss:</strong> Wasseruhrenwechsel Hausanschluss am 13.04.2022 · Wert bei Wechsel: 1.893 · Ende 2022: 301 · Ende 2023: 615 · Ende 2024: 911</p>';

  carryForwardEl.innerHTML = renderWaterMeterCarryForwardNotice();
  historyEl.innerHTML = renderWaterMeterHistory();

  currentSectionsEl.innerHTML = costs.length ? costs.map(cost =>
    isWaterCost(cost.id) ? renderWaterCostSection(cost, visibleRows) : renderGenericMeterSection(cost, visibleRows)
  ).join("") : '<div class="hint">Aktuell gibt es keine Kostenart mit Umlageschlüssel „Verbrauch“. Stelle im Tab „Kostenarten & Einstellungen“ mindestens eine Kostenart auf Verbrauch.</div>';

  const rows = visibleRows.map(t => {
    const perCost = costs.map(cost => {
      const value = meterTotalForCostAndTenant(cost.id, t.originalIndex);
      return '<td class="readonly-cell">' + value.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>';
    }).join("");
    const total = costs.reduce((sum,cost) => sum + meterTotalForCostAndTenant(cost.id, t.originalIndex), 0);
    return '<tr><td>' + tenantIdCellHtml(t) + '</td><td>' + unitRefCellHtml(t.wohnung) + '</td><td>' + escapeHtml(t.name || "") + '</td>' +
      perCost + '<td class="readonly-cell"><strong>' + total.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td></tr>';
  }).join("");

  const controlTotals = costs.map(cost => visibleRows.reduce((sum,t) => sum + meterTotalForCostAndTenant(cost.id, t.originalIndex), 0));
  const allConsumptionTotal = controlTotals.reduce((sum,value) => sum + value, 0);
  const controlFooter = '<tfoot><tr class="total-row"><td colspan="3"><strong>Summe</strong></td>' +
    controlTotals.map(value => '<td class="readonly-cell"><strong>' + value.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td>').join("") +
    '<td class="readonly-cell"><strong>' + allConsumptionTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td></tr></tfoot>';
  consumptionControlEl.innerHTML =
    '<div class="table-wrap"><table id="meterConsumptionControlTable"><thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mieter</th>' +
    costs.map(cost => '<th>' + escapeHtml(cost.kostenart) + '</th>').join("") +
    '<th>Verbrauch gesamt</th></tr></thead><tbody>' +
    (rows || '<tr><td colspan="' + (4 + costs.length) + '">Keine aktuellen oder NK-offenen Mietverhältnisse vorhanden.</td></tr>') +
    '</tbody>' + controlFooter + '</table></div>';

  const meterEntryState = meterStatus.filled > 0 ? {key:"ok",icon:"✓"} : {key:"warn",icon:"⚠"};
  controlSummaryEl.innerHTML = '<div class="water-validation-list">' +
    waterValidationItemHtml(houseResult.invalid ? {key:"error",icon:"✕"} : (houseResult.complete ? {key:"ok",icon:"✓"} : {key:"warn",icon:"⚠"}),
      houseResult.invalid ? "Hauszählerstand ist unplausibel" : (houseResult.complete ? "Hauszählerverbrauch berechnet" : "Hauszählerstände noch unvollständig"),
      houseResult.invalid ? "Der Endstand liegt unter dem Anfangsstand." : (houseResult.complete ? houseResult.value.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³" : "Anfangs- und Endstand ergänzen.")) +
    waterValidationItemHtml(invoiceWaterTotal > 0 ? {key:"ok",icon:"✓"} : {key:"warn",icon:"⚠"}, invoiceWaterTotal > 0 ? "Wasserwerksverbrauch erfasst" : "Wasserwerksverbrauch fehlt", invoiceWaterTotal > 0 ? invoiceWaterTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³" : "Verbrauch laut Rechnung eintragen.") +
    waterValidationItemHtml(meterEntryState, meterStatus.filled > 0 ? "Wohnungszähler enthalten Endwerte" : "Wohnungszähler-Endwerte fehlen", meterStatus.filled + " von " + meterStatus.checked + " Endwertfeldern befüllt") +
    waterValidationItemHtml(invoiceVsHouse, "Abgleich Wasserwerksrechnung mit Hauszähler", invoiceVsHouse.diff === null ? "Noch nicht vollständig prüfbar." : invoiceDiffText + (invoiceVsHouse.percent === null ? "" : " · " + invoiceVsHouse.percent.toLocaleString("de-DE", { maximumFractionDigits:1 }) + " %")) +
    waterValidationItemHtml(houseVsTenant, "Abgleich Hauszähler mit Wohnungszählern", houseVsTenant.diff === null ? "Noch nicht vollständig prüfbar." : tenantDiffText + (houseVsTenant.percent === null ? "" : " · " + houseVsTenant.percent.toLocaleString("de-DE", { maximumFractionDigits:1 }) + " %")) +
    '</div>';

  if (legacySectionsEl) legacySectionsEl.innerHTML = "";
}


const MANUAL_INPUT_MODES = ["Zählerstände","Verbrauchsmenge","Direkter Eurobetrag","Externe Einzelabrechnung"];
