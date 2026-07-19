"use strict";

// AP22F10B: operative Arbeitsoberfläche für Wasserzähler und externe Einzelwerte.
(function (global) {
  const WATER_TOLERANCE = 0.01;
  const COST_TOLERANCE = 0.01;
  let activeFilter = "all";
  let selectedWaterMeter = null;
  let selectedExternal = null;
  let selectedImportCost = null;
  let importPreview = null;
  let returnFocus = null;
  let returnFocusSelector = "";
  let bound = false;
  let requestedFocus = null;
  const pendingWater = new Map();
  const pendingExternal = new Map();

  function esc(value) {
    if (typeof global.escapeHtml === "function") return global.escapeHtml(String(value == null ? "" : value));
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[character]));
  }
  function number(value) { return typeof global.num === "function" ? global.num(value) : Number(value || 0); }
  function formatNumber(value, digits = 2) { return Number(value || 0).toLocaleString("de-DE", { minimumFractionDigits:digits, maximumFractionDigits:digits }); }
  function formatMeter(value) { return value === "" || value === null || value === undefined ? "–" : Number(value).toLocaleString("de-DE", { minimumFractionDigits:2, maximumFractionDigits:3 }); }
  function formatMoney(value) { return Number(value || 0).toLocaleString("de-DE", { style:"currency", currency:"EUR" }); }
  function formatDate(value) {
    const source = String(value || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source)) return source || "–";
    return source.slice(8,10) + "." + source.slice(5,7) + "." + source.slice(0,4);
  }
  function todayIso() { return new Date().toISOString().slice(0,10); }
  function isReadOnly() { return !!(global.NKProBillingContext && global.NKProBillingContext.isReadOnly()); }
  function calculation() { return global.NKProBillingCalculation; }
  function cases() { return calculation().individualValueCases(state); }
  function costs() { return calculation().individualValueCosts(state); }
  function inputFor(costId) { return state.umlageInputs && state.umlageInputs[costId] || { values:[], caseValues:{} }; }
  function costFor(costId) { return (state.kostenarten || []).find(row => row && row.id === costId) || null; }
  function caseEntry(costId, caseKey) {
    const input = inputFor(costId);
    const raw = input.caseValues && input.caseValues[caseKey];
    if (raw && typeof raw === "object") return raw;
    const row = cases().find(item => item.caseKey === caseKey);
    return { amount:row && row.originalIndex >= 0 ? number(input.values && input.values[row.originalIndex]) : number(raw), consumption:0, provider:"", recordedAt:"", source:raw === undefined ? "" : "legacy" };
  }
  function statusText(key) { return key === "complete" ? "Vollständig" : (key === "error" ? "Fehlerhaft" : "Offen"); }
  function statusIcon(key) { return key === "complete" ? "✓" : (key === "error" ? "!" : "○"); }
  function statusHtml(key, label) { return '<span class="individual-values-row-status is-' + key + '"><span aria-hidden="true">' + statusIcon(key) + '</span>' + esc(label || statusText(key)) + '</span>'; }
  function caseRoleLabel(role) { return role === "private" ? "Privatanteil" : (role === "vacancy" ? "Leerstand" : "Mietverhältnis"); }
  function caseBadge(role) { return '<span class="individual-values-case-badge is-' + esc(role) + '">' + esc(caseRoleLabel(role)) + '</span>'; }
  function execute(domain, action, args) { return global.NKProApplicationActions.execute(domain, action, args || []); }

  function synchronizeForView() {
    if (typeof global.ensureWaterMeterData === "function") global.ensureWaterMeterData();
    if (typeof global.synchronizeMeteringData === "function") global.synchronizeMeteringData(state);
    if (typeof global.syncUmlageInputs === "function") global.syncUmlageInputs();
    if (typeof global.applyWaterMetersToUmlage === "function") global.applyWaterMetersToUmlage();
  }

  function waterStatus(summary) {
    if (summary.invalid > 0 || summary.status === "error") return "error";
    if (summary.totalMeters > 0 && summary.captured === summary.totalMeters && summary.status === "complete") return "complete";
    return "open";
  }

  function priorLabel(row) {
    if (row.priorStatus === "replacement") return "Wechsel bestätigt";
    if (row.priorStatus === "transferred") return "Bestätigt übernommen";
    if (row.priorStatus === "missing") return "Fehlt";
    return "Vorhanden";
  }

  function waterRowHtml(row, caseRow, firstInGroup) {
    const readOnly = isReadOnly();
    const caseCell = firstInGroup
      ? '<td class="individual-values-case-cell" rowspan="' + String(caseRow.rowSpan) + '"><strong>' + esc(caseRow.unitId || "Ohne Wohnung") + '</strong><span>' + esc(caseRow.label) + '</span>' + caseBadge(caseRow.role) + '<small>' + esc(formatDate(caseRow.start) + " – " + formatDate(caseRow.end)) + '</small></td>'
      : "";
    const typeClass = row.meterType === "hot-water" ? "hot" : "cold";
    const endValue = row.endValue === "" || row.endValue === null || row.endValue === undefined ? "" : String(row.endValue).replace(".",",");
    const endField = readOnly
      ? '<strong>' + formatMeter(row.endValue) + '</strong>'
      : '<input class="individual-values-inline-input number" inputmode="decimal" data-individual-water-end="' + esc(row.meterId) + '" value="' + esc(endValue) + '" aria-label="Endstand ' + esc(row.meterNumber) + '">';
    const special = readOnly ? '<span class="individual-values-no-action">–</span>' : '<button type="button" class="individual-values-icon-button" data-individual-water-edit="' + esc(row.meterId) + '" aria-label="Sonderfall für ' + esc(row.meterNumber) + ' bearbeiten" title="Sonderfall / Anfangsstand bearbeiten"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"></path><path d="m14 7 3 3"></path></svg></button>';
    return '<tr data-individual-water-row="' + esc(row.meterId) + '" data-individual-status="' + esc(row.status) + '">' + caseCell +
      '<td><span class="individual-values-meter-type is-' + typeClass + '"><span aria-hidden="true"></span>' + esc(row.typeLabel) + '</span></td>' +
      '<td><span class="individual-values-meter-number">' + esc(row.meterNumber) + '</span></td>' +
      '<td class="number-cell individual-values-readonly-value">' + formatMeter(row.startValue) + '</td><td class="number-cell individual-values-editable-cell">' + endField + '</td><td class="number-cell"><strong data-individual-water-consumption="' + esc(row.meterId) + '">' + formatMeter(row.consumption) + '</strong></td>' +
      '<td><span class="individual-values-prior is-' + esc(row.priorStatus) + '">' + esc(priorLabel(row)) + '</span></td>' +
      '<td>' + statusHtml(row.status, row.status === "error" ? "Zählerstand prüfen" : statusText(row.status)) + '</td><td class="individual-values-actions-cell">' + special + '</td></tr>';
  }

  function renderWater(summary, available = true) {
    const section = document.getElementById("individualWaterSection");
    const tableBody = document.querySelector("#individualWaterTable tbody");
    const comparison = document.getElementById("individualWaterComparison");
    if (!section || !tableBody || !comparison) return;
    section.dataset.individualAvailable = available ? "true" : "false";
    const caseMap = new Map(summary.cases.map(entry => [entry.caseRow.caseKey, entry]));
    const grouped = new Map();
    summary.rows.forEach(row => {
      const key = row.caseKey || ("unassigned:" + row.unitId);
      if (!grouped.has(key)) {
        const total = caseMap.get(key);
        grouped.set(key, { caseRow:total ? total.caseRow : { caseKey:key, unitId:row.unitId, label:row.caseLabel, role:row.caseRole || "tenant", start:row.startDate, end:row.endDate }, total:total || { cold:0, hot:0, total:row.consumption }, rows:[] });
      }
      grouped.get(key).rows.push(row);
    });
    let body = "";
    [...grouped.values()].forEach(group => {
      group.caseRow.rowSpan = Math.max(1, group.rows.length);
      group.rows.forEach((row,index) => { body += waterRowHtml(row, group.caseRow, index === 0); });
      body += '<tr class="individual-values-subtotal"><th colspan="5" scope="row">Summe ' + esc(group.caseRow.unitId + " · " + group.caseRow.label) + '</th><td class="number-cell"><strong>' + formatMeter(group.total.total) + '</strong></td><td colspan="3">Wohnungsbezogener Gesamtverbrauch</td></tr>';
    });
    if (!body) body = '<tr><td colspan="9"><div class="individual-values-table-empty"><strong>Keine abrechnungsrelevanten Wasserzähler vorhanden</strong><span>Zählerstammdaten werden unter „Objekt vorbereiten → Zähler“ gepflegt.</span></div></td></tr>';
    tableBody.innerHTML = body;

    const sectionStatus = waterStatus(summary);
    section.dataset.individualStatus = sectionStatus;
    const status = section.querySelector("[data-individual-water-status]");
    if (status) { status.className = "individual-values-status is-" + sectionStatus; status.textContent = statusText(sectionStatus); }
    const count = section.querySelector("[data-individual-water-count]");
    if (count) count.textContent = summary.totalMeters + " Zähler · " + grouped.size + " Abrechnungsfälle";
    const start = calculation().periodForData(state).start;
    const end = calculation().periodForData(state).end;
    document.querySelectorAll("[data-individual-period-start]").forEach(node => node.textContent = formatDate(start));
    document.querySelectorAll("[data-individual-period-end]").forEach(node => node.textContent = formatDate(end));
    const priorButton = section.querySelector("[data-individual-prior-open]");
    if (priorButton) priorButton.hidden = isReadOnly() || summary.totalMeters === 0;
    let actionBar = section.querySelector("[data-individual-water-batch-actions]");
    if (!actionBar) {
      actionBar = document.createElement("div");
      actionBar.className = "individual-values-batch-actions";
      actionBar.dataset.individualWaterBatchActions = "";
      comparison.before(actionBar);
    }
    actionBar.hidden = isReadOnly();
    actionBar.innerHTML = '<button type="button" class="primary" data-individual-water-batch-save>Änderungen speichern</button><button type="button" class="secondary" data-individual-water-batch-discard>Verwerfen</button><button type="button" class="secondary" data-individual-prior-open>Fehlende Vorwerte übernehmen</button><span class="individual-values-batch-state" data-individual-water-batch-state>Keine ungespeicherten Änderungen</span>';

    comparison.className = "individual-values-comparison is-" + summary.status;
    comparison.innerHTML = comparisonMetrics([
      ["Individuell erfasst", formatNumber(summary.actual,2) + " m³"],
      ["Gesamtverbrauch · Gesamtkosten", summary.expected > 0 ? formatNumber(summary.expected,2) + " m³" : "Nicht erfasst"],
      ["Differenz", (summary.difference >= 0 ? "" : "−") + formatNumber(Math.abs(summary.difference),2) + " m³", summary.status],
      ["Abgleichsstatus", summary.expected <= 0 ? "Gesamtverbrauch fehlt" : statusText(summary.status), summary.status]
    ]);
  }

  function comparisonMetrics(rows) {
    return rows.map(item => '<div class="individual-values-comparison__metric' + (item[2] ? ' is-' + item[2] : '') + '"><span>' + esc(item[0]) + '</span><strong>' + esc(item[1]) + '</strong></div>').join("");
  }

  function externalAssessment(cost) {
    const input = inputFor(cost.id);
    const rows = cases().map(caseRow => {
      const entry = caseEntry(cost.id, caseRow.caseKey);
      const amount = calculation().individualCaseValue(input, caseRow, "amount");
      const consumption = entry && entry.consumption !== undefined ? number(entry.consumption) : 0;
      return { caseRow, entry, amount, consumption, status:Math.abs(amount) > 0.000001 ? "complete" : "open" };
    });
    const actual = rows.reduce((sum,row) => sum + number(row.amount), 0);
    const expected = number(cost.gesamtbetrag);
    const difference = actual - expected;
    const invalid = rows.some(row => !Number.isFinite(row.amount));
    const status = invalid || (expected > 0 && Math.abs(difference) > COST_TOLERANCE) ? "error" : (expected > 0 && rows.every(row => row.status === "complete") && Math.abs(difference) <= COST_TOLERANCE ? "complete" : "open");
    return { cost, input, rows, actual, expected, difference, status, tolerance:COST_TOLERANCE };
  }

  function externalSectionHtml(assessments) {
    const readOnly = isReadOnly();
    if (!assessments.length) return "";
    const costA = assessments[0];
    const costB = assessments[1] || null;
    const byCase = new Map();
    assessments.forEach(a => a.rows.forEach(row => {
      if (!byCase.has(row.caseRow.caseKey)) byCase.set(row.caseRow.caseKey, { caseRow:row.caseRow, values:{} });
      byCase.get(row.caseRow.caseKey).values[a.cost.id] = row;
    }));
    const rows = [...byCase.values()].map(group => {
      const c = group.caseRow;
      const cells = [costA, costB].filter(Boolean).map(a => {
        const row = group.values[a.cost.id] || { amount:0, status:"open" };
        const value = Math.abs(number(row.amount)) > 0.000001 ? String(number(row.amount)).replace(".",",") : "";
        return '<td class="number-cell individual-values-editable-cell">' + (readOnly ? '<strong>' + formatMoney(row.amount) + '</strong>' : '<input class="individual-values-inline-input money" inputmode="decimal" data-individual-external-inline="' + esc(a.cost.id) + '" data-individual-case-key="' + esc(c.caseKey) + '" value="' + esc(value) + '" aria-label="' + esc(a.cost.kostenart + ' für ' + c.unitId) + '">') + '</td>';
      }).join("");
      const sum = [costA,costB].filter(Boolean).reduce((total,a)=>total+number((group.values[a.cost.id]||{}).amount),0);
      const complete = [costA,costB].filter(Boolean).every(a=>Math.abs(number((group.values[a.cost.id]||{}).amount))>0.000001);
      const special = readOnly ? '<span class="individual-values-no-action">–</span>' : '<button type="button" class="individual-values-icon-button" data-individual-external-edit="' + esc(costA.cost.id) + '" data-individual-case-key="' + esc(c.caseKey) + '" title="Details / Sonderfall bearbeiten" aria-label="Details für ' + esc(c.unitId) + ' bearbeiten"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"></path><path d="m14 7 3 3"></path></svg></button>';
      return '<tr data-individual-external-row="' + esc(c.caseKey) + '" data-individual-status="' + (complete?'complete':'open') + '"><td class="individual-values-case-cell"><strong>' + esc(c.unitId) + '</strong><span>' + esc(c.label) + '</span>' + caseBadge(c.role) + '<small>' + esc(formatDate(c.start) + " – " + formatDate(c.end)) + '</small></td><td>' + esc(c.tenantName || c.label || "–") + '</td>' + cells + '<td class="number-cell"><strong data-individual-external-sum="' + esc(c.caseKey) + '">' + formatMoney(sum) + '</strong></td><td>' + statusHtml(complete?'complete':'open', complete?'Vollständig':'Betrag fehlt') + '</td><td class="individual-values-actions-cell">' + special + '</td></tr>';
    }).join("");
    const actualA = costA.actual, actualB = costB ? costB.actual : 0;
    const expected = assessments.reduce((sum,a)=>sum+a.expected,0);
    const actual = actualA + actualB;
    const status = assessments.some(a=>a.status==='error')?'error':(assessments.every(a=>a.status==='complete')?'complete':'open');
    const secondHead = costB ? '<th scope="col">' + esc(costB.cost.kostenart) + '</th>' : '';
    const secondTotal = costB ? '<td class="number-cell"><strong>' + formatMoney(actualB) + '</strong></td>' : '';
    return '<section class="individual-values-card individual-values-external-card" data-individual-section="external" data-individual-status="' + status + '"><header class="individual-values-card__header"><div class="individual-values-card__title"><span class="individual-values-section-icon individual-values-section-icon--heat" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13.2 2.5c.6 3.1-.7 4.7-2.1 6.2-1.5 1.6-3 3.2-3 6a4.1 4.1 0 0 0 8.2 0c0-1.5-.6-2.8-1.5-4 2.6 1.3 4.2 3.8 4.2 6.5A7 7 0 0 1 5 17.2c0-3.9 2.3-6.2 4.4-8.4 1.8-1.9 3.5-3.6 3.8-6.3Z"></path></svg></span><h2>Heiz- und Warmwasserzubereitungskosten erfassen</h2><span class="individual-values-status is-' + status + '">' + statusText(status) + '</span></div><span class="individual-values-count">' + byCase.size + ' Abrechnungsfälle</span></header><p class="individual-values-card__intro">Heiz- und Warmwasserzubereitungskosten werden direkt je Wohnung, Leerstand und Privatanteil erfasst. Der Stift bleibt Sonderfällen vorbehalten.</p><div class="individual-values-table-wrap"><table class="individual-values-table individual-values-external-table"><thead><tr><th scope="col">Wohnung / Bereich</th><th scope="col">Empfänger</th><th scope="col">' + esc(costA.cost.kostenart) + '</th>' + secondHead + '<th scope="col">Summe</th><th scope="col">Status</th><th scope="col">Aktionen</th></tr></thead><tbody>' + rows + '<tr class="individual-values-subtotal"><th colspan="2" scope="row">Summe</th><td class="number-cell"><strong>' + formatMoney(actualA) + '</strong></td>' + secondTotal + '<td class="number-cell"><strong>' + formatMoney(actual) + '</strong></td><td colspan="2"></td></tr></tbody></table></div>' + (readOnly?'':'<div class="individual-values-batch-actions"><button type="button" class="primary" data-individual-external-batch-save>Änderungen speichern</button><button type="button" class="secondary" data-individual-external-batch-discard>Verwerfen</button><span class="individual-values-batch-state" data-individual-external-batch-state>Keine ungespeicherten Änderungen</span></div>') + '<div class="individual-values-comparison is-' + status + '">' + comparisonMetrics([[costA.cost.kostenart,formatMoney(actualA)],[costB?costB.cost.kostenart:"Weitere Kosten",costB?formatMoney(actualB):"–"],["Zugeordnet gesamt",formatMoney(actual)],["Vorgabe aus Gesamtkosten",formatMoney(expected)],["Differenz",(actual-expected>=0?"":"−")+formatMoney(Math.abs(actual-expected)),status]]) + '</div></section>';
  }

  function updateKpis(water, externalAssessments) {
    const externalActual = externalAssessments.reduce((sum,row) => sum + row.actual, 0);
    const externalExpected = externalAssessments.reduce((sum,row) => sum + row.expected, 0);
    const externalDifference = externalActual - externalExpected;
    const values = {
      "water-total":formatNumber(water.actual,2) + " m³",
      "water-meters":water.captured + " von " + water.totalMeters,
      "external-total":formatMoney(externalActual),
      "cost-match":formatMoney(externalActual) + " / " + formatMoney(externalExpected)
    };
    const details = {
      "water-total":water.expected > 0 ? "Differenz " + (water.difference >= 0 ? "" : "−") + formatNumber(Math.abs(water.difference),2) + " m³" : "Gesamtverbrauch in Gesamtkosten fehlt",
      "water-meters":water.invalid ? water.invalid + " Zähler fehlerhaft" : (water.open ? water.open + " Zähler offen" : "Kalt- und Warmwasser vollständig"),
      "external-total":"Individuell zugeordnet, inkl. Leerstand und Privatanteil",
      "cost-match":externalExpected > 0 ? "Verbleibende Differenz: " + (externalDifference >= 0 ? "" : "−") + formatMoney(Math.abs(externalDifference)) : "Gesamtkosten fehlen"
    };
    Object.entries(values).forEach(([key,value]) => { const node=document.querySelector('[data-individual-kpi-value="'+key+'"]'); if(node) node.textContent=value; });
    Object.entries(details).forEach(([key,value]) => { const node=document.querySelector('[data-individual-kpi-detail="'+key+'"]'); if(node) node.textContent=value; });
    const statuses = {
      "water-total":water.status,
      "water-meters":water.invalid ? "error" : (water.totalMeters && water.captured === water.totalMeters ? "complete" : "open"),
      "external-total":externalAssessments.length && externalAssessments.every(row=>row.rows.every(item=>item.status==="complete")) ? "complete" : "open",
      "cost-match":externalAssessments.length && externalAssessments.every(row=>row.status==="complete") ? "complete" : (externalAssessments.some(row=>row.status==="error") ? "error" : "open")
    };
    Object.entries(statuses).forEach(([key,value]) => { const card=document.querySelector('[data-individual-kpi="'+key+'"]'); if(card) card.dataset.status=value; });
  }

  function checkCard(key, title, detail) {
    return '<article class="individual-values-check is-' + key + '"><span aria-hidden="true">' + statusIcon(key) + '</span><div><strong>' + esc(title) + '</strong><small>' + esc(detail) + '</small></div></article>';
  }

  function renderChecks(water, externalAssessments) {
    const root = document.querySelector("[data-individual-check-list]");
    if (!root) return;
    const meterKey = water.invalid ? "error" : (water.totalMeters && water.captured === water.totalMeters ? "complete" : "open");
    const comparisonKey = water.status;
    const externalKey = !externalAssessments.length ? "open" : (externalAssessments.some(row=>row.status==="error") ? "error" : (externalAssessments.every(row=>row.status==="complete") ? "complete" : "open"));
    const transfers = state.meta && Array.isArray(state.meta.individualValuesPriorTransfers) ? state.meta.individualValuesPriorTransfers : [];
    const priorKey = water.rows.some(row=>row.priorStatus==="missing" || row.priorStatus==="replacement") ? "open" : "complete";
    root.innerHTML = [
      checkCard(meterKey,"Wasserzähler vollständig",meterKey==="complete" ? "Alle erforderlichen Kalt- und Warmwasserzähler besitzen Anfangs- und Endstände." : water.open + " offen, " + water.invalid + " fehlerhaft."),
      checkCard(comparisonKey,"Wasserverbrauch abgeglichen",water.expected > 0 ? "Individuelle Summe und Gesamtverbrauch unter „Gesamtkosten“ werden mit 0,01 m³ Toleranz verglichen." : "Gesamtverbrauch der Wasserkostenart fehlt."),
      checkCard(externalKey,"Externe Kosten abgeglichen",externalKey==="complete" ? "Alle Beträge einschließlich Leerstand und Privatanteil sind vollständig zugeordnet." : "Einzelwerte oder Gesamtkosten weisen noch offene Differenzen auf."),
      checkCard(priorKey,"Vorjahresbezug dokumentiert",transfers.length ? transfers.length + " Wert(e) wurden bestätigt übernommen; Wechsel und unklare Identitäten bleiben gesperrt." : "Noch keine bestätigte Vorjahresübernahme dokumentiert.")
    ].join("");
  }

  function removeWaterTableSorting() {
    const table = document.getElementById("individualWaterTable");
    if (!table) return;
    table.querySelectorAll("thead th").forEach(cell => {
      cell.classList.remove("sortable", "sort-asc", "sort-desc");
      cell.removeAttribute("aria-sort");
      cell.onclick = null;
    });
  }

  function applyFilter() {
    const sections = [...document.querySelectorAll("#individualValuesWorkspace [data-individual-section='water'], #individualValuesWorkspace [data-individual-section='external']")];
    let visible = 0;
    sections.forEach(section => {
      const available = section.dataset.individualAvailable !== "false";
      const show = available && (activeFilter === "all" || section.dataset.individualStatus === activeFilter);
      section.hidden = !show;
      if (show) visible += 1;
    });
    const checks = document.getElementById("individualValuesChecks");
    if (checks) checks.hidden = visible === 0 && activeFilter !== "all";
    const empty = document.getElementById("individualValuesEmpty");
    if (empty) empty.hidden = visible > 0;
    document.querySelectorAll("[data-individual-filter]").forEach(button => {
      const selected = button.dataset.individualFilter === activeFilter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function render() {
    if (typeof state === "undefined" || !state || !document.getElementById("individualValuesWorkspace")) return;
    synchronizeForView();
    const individualCosts = costs();
    const water = calculation().waterConsumptionSummary(state);
    renderWater(water, individualCosts.some(cost => cost.id === "K002"));
    const externalAssessments = individualCosts.filter(cost => cost.id !== "K002").map(externalAssessment);
    const externalRoot = document.getElementById("individualExternalSections");
    if (externalRoot) externalRoot.innerHTML = externalSectionHtml(externalAssessments);
    updateKpis(water, externalAssessments);
    renderChecks(water, externalAssessments);
    applyFilter();
    removeWaterTableSorting();
    requestAnimationFrame(removeWaterTableSorting);
    connect();
    if (requestedFocus) {
      const selector = requestedFocus.source === "automatic" ? "#individualWaterSection" : (requestedFocus.costId ? '[data-individual-cost="' + CSS.escape(requestedFocus.costId) + '"]' : "#individualValuesWorkspace");
      const target = document.querySelector(selector);
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block:"start" }));
      requestedFocus = null;
    }
  }

  function setFilter(filter) {
    activeFilter = ["all","open","error","complete"].includes(filter) ? filter : "all";
    applyFilter();
  }

  function triggerFocusSelector(trigger) {
    if (!trigger || !trigger.dataset) return trigger && trigger.id ? "#" + CSS.escape(trigger.id) : "";
    if (trigger.dataset.individualWaterEdit) return '[data-individual-water-edit="' + CSS.escape(trigger.dataset.individualWaterEdit) + '"]';
    if (trigger.dataset.individualExternalEdit) return '[data-individual-external-edit="' + CSS.escape(trigger.dataset.individualExternalEdit) + '"][data-individual-case-key="' + CSS.escape(trigger.dataset.individualCaseKey || "") + '"]';
    if (trigger.dataset.individualImportOpen) return '[data-individual-import-open="' + CSS.escape(trigger.dataset.individualImportOpen) + '"]';
    if (trigger.dataset.individualPriorOpen !== undefined) return "[data-individual-prior-open]";
    return trigger.id ? "#" + CSS.escape(trigger.id) : "";
  }

  function focusReturnedTarget(target, selector) {
    const focusTarget = target && target.isConnected ? target : (selector ? document.querySelector(selector) : null);
    if (focusTarget && typeof focusTarget.focus === "function") focusTarget.focus();
  }

  function openDialog(dialog, trigger, focusSelector) {
    if (!dialog || isReadOnly()) return;
    returnFocus = trigger || document.activeElement;
    returnFocusSelector = triggerFocusSelector(returnFocus);
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    requestAnimationFrame(() => { const target = dialog.querySelector(focusSelector || "input,button,select,textarea"); if (target) target.focus(); });
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (dialog.open && typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
  }

  function restoreDialogFocus() {
    const target = returnFocus;
    const selector = returnFocusSelector;
    returnFocus = null;
    returnFocusSelector = "";
    focusReturnedTarget(target, selector);
  }

  function closeDialogAndRender(dialog) {
    const target = returnFocus;
    const selector = returnFocusSelector;
    returnFocus = null;
    returnFocusSelector = "";
    closeDialog(dialog);
    render();
    requestAnimationFrame(() => focusReturnedTarget(target, selector));
  }

  function updateWaterPreview() {
    const start = number(document.getElementById("individualWaterStart") && document.getElementById("individualWaterStart").value.replace(",","."));
    const endInput = document.getElementById("individualWaterEnd");
    const endText = endInput ? endInput.value.trim() : "";
    const preview = document.querySelector("[data-individual-water-preview]");
    if (!preview) return;
    if (!endText) { preview.className="individual-values-inline-result is-open"; preview.textContent="Der Endstand fehlt; der Verbrauch ist noch offen."; return; }
    const end = number(endText.replace(",","."));
    const invalid = end < start;
    preview.className="individual-values-inline-result " + (invalid ? "is-error" : "is-complete");
    preview.textContent = invalid ? "Endstand liegt unter dem Anfangsstand. Zählerwechsel oder Eingabe prüfen." : "Verbrauch: " + formatNumber(end-start,3) + " m³";
  }

  function openWaterEditor(meterId, trigger) {
    const row = calculation().waterMeterRows(state).find(item => item.meterId === meterId);
    if (!row) return;
    selectedWaterMeter = row;
    const dialog = document.getElementById("individualWaterEditDialog");
    const title = document.getElementById("individualWaterDialogTitle");
    if (title) title.textContent = row.replacement ? "Zählerwechsel prüfen" : "Zählerstand bearbeiten";
    const context = dialog && dialog.querySelector("[data-individual-water-dialog-context]");
    if (context) context.innerHTML = '<strong>' + esc(row.unitId + " · " + row.caseLabel) + '</strong><span>' + esc(row.typeLabel + " · " + row.meterNumber) + '</span>' + (row.replacement ? '<label class="individual-values-replacement-confirm"><input type="checkbox" data-individual-replacement-confirm> Zählerwechsel und getrennte Teilperiode wurden geprüft.</label>' : '');
    document.getElementById("individualWaterStart").value = row.startValue === "" ? "" : String(row.startValue).replace(".",",");
    document.getElementById("individualWaterEnd").value = row.endValue === "" ? "" : String(row.endValue).replace(".",",");
    document.getElementById("individualWaterStartDate").value = row.startDate || calculation().periodForData(state).start;
    document.getElementById("individualWaterEndDate").value = row.endDate || calculation().periodForData(state).end;
    updateWaterPreview();
    openDialog(dialog, trigger, "#individualWaterStart");
  }

  function saveWaterEditor() {
    if (!selectedWaterMeter || isReadOnly()) return;
    const dialog = document.getElementById("individualWaterEditDialog");
    if (selectedWaterMeter.replacement) {
      const checkbox = dialog.querySelector("[data-individual-replacement-confirm]");
      if (!checkbox || !checkbox.checked) { checkbox && checkbox.focus(); return; }
    }
    const meterId = selectedWaterMeter.meterId;
    const values = [
      ["start", document.getElementById("individualWaterStart").value, "number"],
      ["startDate", document.getElementById("individualWaterStartDate").value, "date"],
      ["end", document.getElementById("individualWaterEnd").value, "number"],
      ["endDate", document.getElementById("individualWaterEndDate").value, "date"]
    ];
    values.forEach(item => execute("meter","setWaterValue",[meterId,item[0],item[1],item[2]]));
    selectedWaterMeter = null;
    closeDialogAndRender(dialog);
  }

  function openExternalEditor(costId, caseKey, trigger) {
    const cost = costFor(costId);
    const caseRow = cases().find(row => row.caseKey === caseKey);
    if (!cost || !caseRow) return;
    selectedExternal = { costId, caseKey, caseRow };
    const entry = caseEntry(costId, caseKey);
    const dialog = document.getElementById("individualExternalEditDialog");
    const context = dialog.querySelector("[data-individual-external-dialog-context]");
    context.innerHTML = '<strong>' + esc(cost.kostenart) + '</strong><span>' + esc(caseRow.unitId + " · " + caseRow.label + " · " + caseRoleLabel(caseRow.role)) + '</span>';
    document.getElementById("individualExternalProvider").value = entry.provider || inputFor(costId).importSource || "";
    document.getElementById("individualExternalAmount").value = entry.amount === undefined ? "" : String(number(entry.amount)).replace(".",",");
    document.getElementById("individualExternalConsumption").value = entry.consumption ? String(number(entry.consumption)).replace(".",",") : "";
    document.getElementById("individualExternalDate").value = String(entry.recordedAt || entry.updatedAt || todayIso()).slice(0,10);
    openDialog(dialog, trigger, "#individualExternalAmount");
  }

  function saveExternalEditor() {
    if (!selectedExternal || isReadOnly()) return;
    const { costId, caseKey } = selectedExternal;
    execute("billing","setManualExternalValue",[costId,caseKey,document.getElementById("individualExternalAmount").value,"amount"]);
    execute("billing","setManualExternalValue",[costId,caseKey,document.getElementById("individualExternalConsumption").value,"consumption"]);
    execute("billing","setManualExternalValue",[costId,caseKey,document.getElementById("individualExternalProvider").value,"provider"]);
    execute("billing","setManualExternalValue",[costId,caseKey,document.getElementById("individualExternalDate").value,"recordedAt"]);
    selectedExternal = null;
    closeDialogAndRender(document.getElementById("individualExternalEditDialog"));
  }

  function parseImportText(text) {
    const sourceCases = cases();
    const rows = String(text || "").split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map((line,index) => {
      const separator = line.includes("\t") ? "\t" : ";";
      const parts = line.split(separator).map(value=>value.trim().replace(/^"|"$/g,""));
      const key = parts[0] || "";
      const normalizedKey = key.toLocaleLowerCase("de-DE");
      let matches = sourceCases.filter(row => [row.caseKey,row.unitId,row.tenantId,row.tenantName].some(value => String(value||"").toLocaleLowerCase("de-DE") === normalizedKey));
      if (/leerstand/.test(normalizedKey)) matches = sourceCases.filter(row => row.role === "vacancy" && normalizedKey.includes(row.unitId.toLocaleLowerCase("de-DE")));
      if (/privat|eigent/.test(normalizedKey)) matches = sourceCases.filter(row => row.role === "private" && (!row.unitId || normalizedKey.includes(row.unitId.toLocaleLowerCase("de-DE"))));
      const amountText = String(parts[1] || "").replace(/\s/g,"").replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",",".");
      const consumptionText = String(parts[2] || "").replace(/\s/g,"").replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",",".");
      const amount = Number(amountText);
      const consumption = consumptionText ? Number(consumptionText) : 0;
      let error = "";
      if (matches.length !== 1) error = matches.length ? "Zuordnung nicht eindeutig" : "Abrechnungsfall nicht gefunden";
      else if (!Number.isFinite(amount)) error = "Betrag ist ungültig";
      else if (consumptionText && !Number.isFinite(consumption)) error = "Verbrauch ist ungültig";
      return { line:index+1, key, caseRow:matches[0] || null, amount:Number.isFinite(amount)?amount:0, consumption:Number.isFinite(consumption)?consumption:0, provider:parts[3] || "", recordedAt:parts[4] && /^\d{4}-\d{2}-\d{2}$/.test(parts[4]) ? parts[4] : todayIso(), error };
    });
    const validCounts = new Map();
    rows.filter(row=>!row.error&&row.caseRow).forEach(row=>validCounts.set(row.caseRow.caseKey,(validCounts.get(row.caseRow.caseKey)||0)+1));
    rows.forEach(row=>{if(!row.error&&row.caseRow&&validCounts.get(row.caseRow.caseKey)>1)row.error="Abrechnungsfall mehrfach enthalten";});
    return rows;
  }

  function renderImportPreview() {
    const root = document.querySelector("[data-individual-import-preview-result]");
    const confirm = document.querySelector("[data-individual-import-confirm]");
    if (!root) return;
    const rows = importPreview || [];
    if (!rows.length) { root.innerHTML='<div class="individual-values-import-empty">Noch keine Vorschau erstellt.</div>'; if(confirm) confirm.disabled=true; return; }
    root.innerHTML='<div class="individual-values-table-wrap"><table class="individual-values-table"><thead><tr><th>Zeile</th><th>Zuordnung</th><th>Betrag</th><th>Verbrauch</th><th>Ergebnis</th></tr></thead><tbody>' + rows.map(row=>'<tr class="' + (row.error?'is-error':'is-valid') + '"><td>'+row.line+'</td><td>'+esc(row.caseRow ? row.caseRow.unitId+' · '+row.caseRow.label : row.key)+'</td><td class="number-cell">'+formatMoney(row.amount)+'</td><td class="number-cell">'+formatNumber(row.consumption,0)+'</td><td>'+(row.error?esc(row.error):statusHtml('complete','Zugeordnet'))+'</td></tr>').join('') + '</tbody></table></div>';
    if (confirm) confirm.disabled = rows.every(row=>row.error);
  }

  function openImportDialog(costId, trigger) {
    selectedImportCost = costId;
    importPreview = null;
    const dialog = document.getElementById("individualExternalImportDialog");
    const cost = costFor(costId);
    dialog.querySelector("[data-individual-import-context]").innerHTML='<strong>'+esc(cost&&cost.kostenart||costId)+'</strong><span>Format: Abrechnungsfall; Betrag; Verbrauch; Dienstleister; Erfasst am</span>';
    dialog.querySelector("[data-individual-import-text]").value="";
    dialog.querySelector("[data-individual-import-file]").value="";
    renderImportPreview();
    openDialog(dialog, trigger, "[data-individual-import-file]");
  }

  function createImportPreview() {
    const text = document.querySelector("[data-individual-import-text]").value;
    importPreview = parseImportText(text);
    renderImportPreview();
  }

  function confirmImport() {
    if (!selectedImportCost || !importPreview || isReadOnly()) return;
    const valid = importPreview.filter(row=>!row.error);
    const caseValues = {};
    valid.forEach(row => { caseValues[row.caseRow.caseKey] = { amount:row.amount, consumption:row.consumption, provider:row.provider, recordedAt:row.recordedAt, source:"import" }; });
    const errors = importPreview.filter(row=>row.error).map(row=>"Zeile "+row.line+": "+row.error);
    global.NKProBillingWorkflow.setIndividualValuesImport(selectedImportCost,[],{ source:"Datei / eingefügte Werte", importedAt:new Date().toISOString(), format:"Abrechnungsfall; Betrag; Verbrauch; Dienstleister; Datum", errors, mode:"Externe Einzelabrechnung", caseValues });
    selectedImportCost=null; importPreview=null;
    closeDialogAndRender(document.getElementById("individualExternalImportDialog"));
  }

  function openPriorDialog(trigger) {
    const plan = global.NKProYearTransitionActions.prepareIndividualPriorReadingTransfer(state);
    const dialog = document.getElementById("individualPriorTransferDialog");
    dialog.dataset.sourceYear = plan.sourceYear || "";
    const body = dialog.querySelector("[data-individual-prior-list]");
    body.innerHTML = plan.candidates.map((row,index) => '<tr data-prior-index="'+index+'"><td><input type="checkbox" data-prior-select="'+esc(row.meterId)+'" '+(row.selected?'checked':'')+' '+(!row.eligible?'disabled':'')+' aria-label="Vorjahreswert für '+esc(row.meterNumber)+' übernehmen"></td><td><strong>'+esc(row.meterNumber)+'</strong><small>'+esc(row.meterId)+'</small></td><td>'+esc(row.caseLabel)+'</td><td class="number-cell">'+(row.previousEnd===""?'–':formatMeter(row.previousEnd)+' m³')+'</td><td>'+statusHtml(row.eligible?'complete':(row.status==='already-set'?'complete':'open'),row.reason)+'</td></tr>').join("");
    dialog._priorPlan = plan;
    openDialog(dialog, trigger, "input:not([disabled])");
  }

  function confirmPriorTransfer() {
    const dialog = document.getElementById("individualPriorTransferDialog");
    const plan = dialog._priorPlan;
    if (!plan || isReadOnly()) return;
    const selected = plan.candidates.filter(row => row.eligible && dialog.querySelector('[data-prior-select="'+CSS.escape(row.meterId)+'"]')?.checked);
    const currentStart = calculation().periodForData(state).start;
    selected.forEach(row => {
      execute("meter","setWaterValue",[row.meterId,"start",row.previousEnd,"number"]);
      execute("meter","setWaterValue",[row.meterId,"startDate",currentStart,"date"]);
    });
    if (selected.length) global.NKProYearTransitionActions.recordIndividualPriorReadingTransfer(selected,plan.sourceYear);
    closeDialogAndRender(dialog);
  }

  function resetExternal(costId, trigger) {
    if (isReadOnly()) return;
    const cost = costFor(costId);
    if (!global.confirm("Alle individuellen Werte für „" + (cost&&cost.kostenart||costId) + "“ zurücksetzen? Zentrale Wasserzähler bleiben unverändert.")) return;
    global.NKProBillingWorkflow.resetIndividualValues(costId,{confirmed:true});
    returnFocus=trigger; render(); requestAnimationFrame(restoreDialogFocus);
  }

  function updateBatchState(kind) {
    const map = kind === "water" ? pendingWater : pendingExternal;
    const node = document.querySelector(kind === "water" ? "[data-individual-water-batch-state]" : "[data-individual-external-batch-state]");
    if (node) node.textContent = map.size ? map.size + " ungespeicherte Änderung(en)" : "Keine ungespeicherten Änderungen";
  }
  function saveWaterBatch() {
    if (isReadOnly() || !pendingWater.size) return;
    const changes = [...pendingWater.entries()];
    pendingWater.clear();
    changes.forEach(([meterId,value]) => execute("meter","setWaterValue",[meterId,"end",value,"number"]));
    render();
  }
  function saveExternalBatch() {
    if (isReadOnly() || !pendingExternal.size) return;
    const changes = [...pendingExternal.values()];
    pendingExternal.clear();
    changes.forEach(change => execute("billing","setManualExternalValue",[change.costId,change.caseKey,change.value,"amount"]));
    render();
  }
  function discardBatch(kind) {
    if (kind === "water") pendingWater.clear(); else pendingExternal.clear();
    render();
  }

  function connect() {
    if (bound) return;
    bound = true;
    document.addEventListener("click", event => {
      const filter = event.target.closest("#manuellewerte [data-individual-filter]"); if (filter) { setFilter(filter.dataset.individualFilter); return; }
      const refresh = event.target.closest("#manuellewerte [data-individual-refresh]"); if (refresh) { render(); refresh.focus(); return; }
      if (event.target.closest("#manuellewerte [data-individual-water-batch-save]")) { saveWaterBatch(); return; }
      if (event.target.closest("#manuellewerte [data-individual-water-batch-discard]")) { discardBatch("water"); return; }
      if (event.target.closest("#manuellewerte [data-individual-external-batch-save]")) { saveExternalBatch(); return; }
      if (event.target.closest("#manuellewerte [data-individual-external-batch-discard]")) { discardBatch("external"); return; }
      const waterEdit = event.target.closest("#manuellewerte [data-individual-water-edit]"); if (waterEdit) { openWaterEditor(waterEdit.dataset.individualWaterEdit,waterEdit); return; }
      const externalEdit = event.target.closest("#manuellewerte [data-individual-external-edit]"); if (externalEdit) { openExternalEditor(externalEdit.dataset.individualExternalEdit,externalEdit.dataset.individualCaseKey,externalEdit); return; }
      const importOpen = event.target.closest("#manuellewerte [data-individual-import-open]"); if (importOpen) { openImportDialog(importOpen.dataset.individualImportOpen,importOpen); return; }
      const reset = event.target.closest("#manuellewerte [data-individual-reset]"); if (reset) { resetExternal(reset.dataset.individualReset,reset); return; }
      const priorOpen = event.target.closest("#manuellewerte [data-individual-prior-open]"); if (priorOpen) { openPriorDialog(priorOpen); return; }
      const close = event.target.closest("#manuellewerte [data-individual-dialog-close]"); if (close) { closeDialog(close.closest("dialog")); return; }
      if (event.target.closest("#manuellewerte [data-individual-water-save]")) { saveWaterEditor(); return; }
      if (event.target.closest("#manuellewerte [data-individual-external-save]")) { saveExternalEditor(); return; }
      if (event.target.closest("#manuellewerte [data-individual-import-preview]")) { createImportPreview(); return; }
      if (event.target.closest("#manuellewerte [data-individual-import-confirm]")) { confirmImport(); return; }
      if (event.target.closest("#manuellewerte [data-individual-prior-confirm]")) { confirmPriorTransfer(); }
    });
    document.addEventListener("input", event => {
      if (["individualWaterStart","individualWaterEnd"].includes(event.target.id)) updateWaterPreview();
      const water = event.target.closest("#manuellewerte [data-individual-water-end]");
      if (water) {
        pendingWater.set(water.dataset.individualWaterEnd, water.value);
        const row = calculation().waterMeterRows(state).find(item => item.meterId === water.dataset.individualWaterEnd);
        const parsed = number(String(water.value || "").replace(",","."));
        const consumption = row && water.value !== "" ? parsed - number(row.startValue) : 0;
        const output = document.querySelector('[data-individual-water-consumption="' + CSS.escape(water.dataset.individualWaterEnd) + '"]');
        if (output) { output.textContent = water.value === "" ? "–" : formatMeter(consumption); output.classList.toggle("is-error", consumption < 0); }
        updateBatchState("water");
      }
      const external = event.target.closest("#manuellewerte [data-individual-external-inline]");
      if (external) {
        const key = external.dataset.individualExternalInline + "::" + external.dataset.individualCaseKey;
        pendingExternal.set(key,{ costId:external.dataset.individualExternalInline, caseKey:external.dataset.individualCaseKey, value:external.value });
        updateBatchState("external");
      }
    });
    document.addEventListener("change", event => {
      const file = event.target.closest("#manuellewerte [data-individual-import-file]");
      if (file && file.files && file.files[0]) {
        const reader = new FileReader();
        reader.onload = () => { document.querySelector("[data-individual-import-text]").value=String(reader.result||""); createImportPreview(); };
        reader.readAsText(file.files[0]);
      }
    });
    document.querySelectorAll("#manuellewerte dialog").forEach(dialog => dialog.addEventListener("close", restoreDialogFocus));
  }

  function requestFocus(options = {}) { requestedFocus = options || {}; }
  function sourceType(cost) { return cost && cost.id === "K002" ? "automatic" : (calculation().isIndividualValueCost(cost,state) ? "external" : "none"); }
  function assessment(cost) { return cost && cost.id === "K002" ? calculation().waterConsumptionSummary(state) : externalAssessment(cost); }
  function describe() { return Object.freeze({ filter:activeFilter, costs:costs().length, cases:cases().length, waterTolerance:WATER_TOLERANCE, costTolerance:COST_TOLERANCE }); }

  global.NKProIndividualValues = Object.freeze({ render, setFilter, requestFocus, assessment, sourceType, describe });
})(globalThis);

function renderIndividualValues() { return globalThis.NKProIndividualValues.render(); }
