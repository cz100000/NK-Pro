"use strict";

// AP22F10G-B: vollständig dynamische Arbeitsseite für individuelle Werte.
// Sichtbarkeit und Art jedes Bereichs werden ausschließlich durch aktive
// Kostenarten und deren Umlageschlüssel in „Gesamtkosten“ bestimmt.
(function (global) {
  const draftText = new Map();
  const fieldErrors = new Map();
  const filters = new Map();
  let selectedSpecial = null;
  let returnFocus = null;
  let bound = false;

  function esc(value) {
    if (typeof global.escapeHtml === "function") return global.escapeHtml(String(value == null ? "" : value));
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[character]));
  }
  function calc() { return global.NKProBillingCalculation; }
  function model() { return calc().individualValuePageModel(state); }
  function isReadOnly() { return !!(global.NKProBillingContext && global.NKProBillingContext.isReadOnly()); }
  function markDirty() { if (global.NKProBillingContext) global.NKProBillingContext.markDirty(true); }
  function num(value) { return typeof global.num === "function" ? global.num(value) : Number(value || 0); }
  function formatNumber(value, digits = 2) {
    if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "–";
    return Number(value).toLocaleString("de-DE", { minimumFractionDigits:digits, maximumFractionDigits:digits });
  }
  function formatMoney(value) { return Number(value || 0).toLocaleString("de-DE", { style:"currency", currency:"EUR" }); }
  function formatDate(value) {
    const source = String(value || "");
    return /^\d{4}-\d{2}-\d{2}$/.test(source) ? source.slice(8,10) + "." + source.slice(5,7) + "." + source.slice(0,4) : (source || "–");
  }
  function displayInput(value) {
    if (value === "" || value === null || value === undefined) return "";
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("de-DE", { useGrouping:false, maximumFractionDigits:6 }) : String(value);
  }
  function parseLocaleNumber(value) {
    if (value === null || value === undefined || String(value).trim() === "") return { ok:true, empty:true, value:"" };
    let source = String(value).trim().replace(/\s+/g, "");
    const comma = source.lastIndexOf(",");
    const dot = source.lastIndexOf(".");
    if (comma >= 0 && dot >= 0) {
      source = comma > dot ? source.replace(/\./g, "").replace(",", ".") : source.replace(/,/g, "");
    } else if (comma >= 0) {
      const parts = source.split(",");
      source = parts.length > 2 ? parts.slice(0,-1).join("") + "." + parts.at(-1) : source.replace(",", ".");
    } else if (dot >= 0) {
      const parts = source.split(".");
      if (parts.length > 2) source = parts.slice(0,-1).join("") + "." + parts.at(-1);
    }
    const parsed = Number(source);
    return Number.isFinite(parsed) ? { ok:true, empty:false, value:parsed } : { ok:false, empty:false, value:null };
  }
  function fieldKey(kind, costId, rowId, field) { return [kind, costId, rowId, field].join("|"); }
  function priorTransferForMeter(meterId) {
    const rows = state && state.meta && Array.isArray(state.meta.individualValuesPriorTransfers) ? state.meta.individualValuesPriorTransfers : [];
    return rows.slice().reverse().find(row => String(row && row.meterId || "") === String(meterId || "")) || null;
  }
  function startOverrideForMeter(meterId) {
    const rows = state && state.meta && Array.isArray(state.meta.individualValuesStartOverrides) ? state.meta.individualValuesStartOverrides : [];
    return rows.slice().reverse().find(row => String(row && row.meterId || "") === String(meterId || "")) || null;
  }
  function hasStartOverride(meterId) { return !!startOverrideForMeter(meterId); }
  function authorizeStartOverride(meterId, note) {
    const transfer = priorTransferForMeter(meterId);
    if (!transfer || hasStartOverride(meterId)) return false;
    if (!state.meta || typeof state.meta !== "object") state.meta = {};
    if (!Array.isArray(state.meta.individualValuesStartOverrides)) state.meta.individualValuesStartOverrides = [];
    state.meta.individualValuesStartOverrides.push({
      meterId:String(meterId || ""),
      sourceYear:String(transfer.sourceYear || ""),
      transferredValue:transfer.previousEnd,
      authorizedAt:new Date().toISOString(),
      authorization:"Benutzerbestätigter Sonderfall",
      note:String(note || "")
    });
    markDirty();
    return true;
  }
  function draftValue(key, fallback) { return draftText.has(key) ? draftText.get(key) : displayInput(fallback); }
  function statusText(status) {
    if (status === "complete") return "Stimmt überein";
    if (status === "error") return "Abweichung";
    return "Unvollständig";
  }
  function rowStatusText(status) { return status === "complete" ? "Vollständig" : (status === "error" ? "Prüfen" : "Offen"); }
  function statusPill(status, text) {
    return '<span class="individual-values-row-status is-' + esc(status) + '"><span aria-hidden="true">' + (status === "complete" ? "✓" : (status === "error" ? "!" : "○")) + '</span>' + esc(text || rowStatusText(status)) + '</span>';
  }
  function roleLabel(role) { return role === "private" ? "Eigentümer/Privat" : (role === "vacancy" ? "Leerstand" : "Mieter"); }
  function roleBadge(role) { return '<span class="individual-values-case-badge is-' + esc(role) + '">' + esc(roleLabel(role)) + '</span>'; }
  function caseCell(caseRow, rowspan) {
    const unit = caseRow.unitLabel || caseRow.unitId || "Ohne Wohnung";
    const name = caseRow.label || caseRow.tenantName || roleLabel(caseRow.role);
    return '<td class="individual-values-case-cell" rowspan="' + rowspan + '"><strong>' + esc(unit) + '</strong><span>' + esc(name) + '</span>' + roleBadge(caseRow.role) + '<small>' + esc(formatDate(caseRow.start) + " – " + formatDate(caseRow.end)) + '</small></td>';
  }
  function iconSvg(kind) {
    if (kind === "consumption") return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5s6.5 6.8 6.5 11.2a6.5 6.5 0 1 1-13 0C5.5 9.3 12 2.5 12 2.5Z"></path><path d="M9 15a3.4 3.4 0 0 0 3 2"></path></svg>';
    if (kind === "manual") return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13.2 2.5c.6 3.1-.7 4.7-2.1 6.2-1.5 1.6-3 3.2-3 6a4.1 4.1 0 0 0 8.2 0c0-1.5-.6-2.8-1.5-4 2.6 1.3 4.2 3.8 4.2 6.5A7 7 0 0 1 5 17.2c0-3.9 2.3-6.2 4.4-8.4 1.8-1.9 3.5-3.6 3.8-6.3Z"></path><path d="M12.1 12.2c1.4 1.2 2.2 2.5 2.2 4a2.3 2.3 0 1 1-4.6 0c0-1.4.9-2.7 2.4-4Z"></path></svg>';
    if (kind === "check") return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"></path><circle cx="12" cy="12" r="9"></circle></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4z"></path><path d="M8 9h8M8 13h5"></path></svg>';
  }

  function synchronizeForView() {
    if (typeof global.ensureWaterMeterData === "function") global.ensureWaterMeterData();
    if (typeof global.synchronizeMeteringData === "function") global.synchronizeMeteringData(state);
    if (typeof global.syncUmlageInputs === "function") global.syncUmlageInputs();
    if (typeof global.applyWaterMetersToUmlage === "function") global.applyWaterMetersToUmlage();
  }

  function filterControl(costId) {
    const selected = filters.get(costId) || "all";
    return '<label class="individual-values-filter"><span>Status</span><select data-individual-filter="' + esc(costId) + '"><option value="all"' + (selected === "all" ? " selected" : "") + '>Alle</option><option value="open"' + (selected === "open" ? " selected" : "") + '>Offen</option><option value="complete"' + (selected === "complete" ? " selected" : "") + '>Vollständig</option><option value="error"' + (selected === "error" ? " selected" : "") + '>Prüfen</option></select></label>';
  }

  function consumptionGroups(summary) {
    const groupMap = new Map(summary.cases.map(group => [group.caseRow.caseKey, group]));
    const loose = new Map();
    summary.rows.forEach(row => {
      const key = row.caseKey || ("unassigned:" + row.unitId + ":" + row.meterId);
      if (!loose.has(key)) loose.set(key, { caseRow:{ caseKey:key, role:row.caseRole, unitId:row.unitId, unitLabel:row.unitId, label:row.caseLabel, start:row.startDate, end:row.endDate }, rows:[], complete:false, invalid:false, total:null, status:row.status });
      loose.get(key).rows.push(row);
    });
    loose.forEach((value,key) => { if (!groupMap.has(key)) groupMap.set(key,value); });
    return [...groupMap.values()];
  }

  function meterTypeBadge(row) {
    const type = String(row && row.meterType || "");
    const markerClass = type === "cold-water" ? " is-cold-water" : (type === "hot-water" ? " is-hot-water" : "");
    const marker = markerClass ? '<span class="individual-values-meter-dot' + markerClass + '" aria-hidden="true"></span>' : "";
    return '<span class="individual-values-meter-type' + markerClass + '">' + marker + esc(row.typeLabel) + '</span>';
  }

  function meterInput(summary, row, field) {
    const key = fieldKey("meter", summary.cost.id, row.meterId, field);
    const error = fieldErrors.get(key);
    const value = draftValue(key, field === "start" ? row.startValue : row.endValue);
    const transferred = field === "start" && !!priorTransferForMeter(row.meterId);
    const overridden = transferred && hasStartOverride(row.meterId);
    const locked = transferred && !overridden;
    const disabled = isReadOnly() || locked;
    const stateClass = locked ? " is-transferred" : (overridden ? " is-start-override" : "");
    const hint = locked ? '<small class="individual-values-carried-forward">Aus Vorjahr übernommen</small>' : (overridden ? '<small class="individual-values-start-override-note">Sonderfall freigegeben</small>' : "");
    const title = locked ? ' title="Aus dem Vorjahr übernommen. Änderung nur über die Sonderfallaktion."' : "";
    return '<div class="individual-values-input-wrap' + stateClass + (error ? ' is-error' : '') + '"><input class="individual-values-number-input" inputmode="decimal" autocomplete="off" value="' + esc(value) + '" data-individual-meter-input data-cost-id="' + esc(summary.cost.id) + '" data-meter-id="' + esc(row.meterId) + '" data-field="' + field + '" aria-label="' + esc((field === "start" ? "Anfangsstand" : "Endstand") + " " + row.meterNumber) + '"' + (locked ? ' aria-readonly="true" data-individual-transferred-start="true"' : "") + title + (disabled ? " disabled" : "") + '>' + hint + (error ? '<small class="individual-values-field-error">' + esc(error) + '</small>' : '') + '</div>';
  }

  function consumptionSection(summary) {
    const selected = filters.get(summary.cost.id) || "all";
    const groups = consumptionGroups(summary).filter(group => selected === "all" || group.status === selected);
    let body = "";
    groups.forEach(group => {
      const rows = group.rows || [];
      rows.forEach((row,index) => {
        const total = group.complete ? formatNumber(group.total,2) : "–";
        const totalDetail = group.complete ? row.unit : "Unvollständig";
        body += '<tr data-individual-row-status="' + esc(row.status) + '" data-meter-row="' + esc(row.meterId) + '">' +
          (index === 0 ? caseCell(group.caseRow, Math.max(1,rows.length)) : "") +
          '<td>' + meterTypeBadge(row) + '</td>' +
          '<td><strong class="individual-values-meter-number">' + esc(row.meterNumber || row.meterId) + '</strong><small>' + esc(row.meterId) + '</small></td>' +
          '<td>' + meterInput(summary,row,"start") + '</td><td>' + meterInput(summary,row,"end") + '</td>' +
          '<td class="number-cell" data-meter-consumption="' + esc(row.meterId) + '"><strong>' + (row.status === "complete" ? formatNumber(row.consumption,2) : "–") + '</strong><small>' + esc(row.unit) + '</small></td>' +
          (index === 0 ? '<td class="number-cell individual-values-total-cell" rowspan="' + Math.max(1,rows.length) + '" data-case-total="' + esc(group.caseRow.caseKey) + '"><strong>' + total + '</strong><small>' + esc(totalDetail) + '</small></td>' : "") +
          '<td>' + statusPill(row.status, row.status === "error" ? "Zählerstand prüfen" : rowStatusText(row.status)) + '</td>' +
          '<td class="individual-values-actions-cell"><button type="button" class="individual-values-icon-button" data-individual-special data-kind="meter" data-cost-id="' + esc(summary.cost.id) + '" data-row-id="' + esc(row.meterId) + '" aria-label="Sonderfall für Zähler bearbeiten" title="Sonderfall bearbeiten"' + (isReadOnly() ? " disabled" : "") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 17h.01"></path><path d="M10.3 3.7 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"></path></svg></button></td></tr>';
      });
    });
    if (!body) body = '<tr><td colspan="9"><div class="individual-values-table-empty"><strong>Keine passenden Zählerzeilen</strong><span>Prüfe Filter, Zählerzuordnung und Kostenartsteuerung.</span></div></td></tr>';
    const countText = summary.totalMeters + " Zähler · " + summary.cases.length + " Abrechnungsfälle";
    return '<section class="individual-values-card" data-individual-section="consumption" data-cost-id="' + esc(summary.cost.id) + '"><header class="individual-values-card__header"><div class="individual-values-card__title"><span class="individual-values-section-icon is-consumption" aria-hidden="true">' + iconSvg("consumption") + '</span><div><p class="individual-values-card__eyebrow">Verbrauchskostenart</p><h2>' + esc(summary.cost.kostenart) + '</h2><p>Umlageschlüssel: ' + esc(summary.cost.umlageschluessel) + '</p></div></div><div class="individual-values-card__tools">' + filterControl(summary.cost.id) + '<span class="individual-values-status is-' + esc(summary.status) + '">' + esc(statusText(summary.status)) + '</span></div></header>' +
      '<div class="individual-values-table-wrap" tabindex="0" aria-label="Verbrauchstabelle horizontal verschiebbar"><table class="individual-values-table individual-values-consumption-table"><thead><tr><th>Wohnung / Abrechnungsfall</th><th>Zählerart</th><th>Zählernummer</th><th>Anfangsstand</th><th>Endstand</th><th>Verbrauch</th><th>Gesamtverbrauch Wohnung</th><th>Status</th><th>Sonderfallaktion</th></tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<div class="individual-values-control is-' + esc(summary.status) + '"><div><span>Gesamtverbrauch laut „Gesamtkosten“</span><strong>' + (summary.expectedPresent ? formatNumber(summary.expected,2) + " " + esc(summary.unit) : "Nicht erfasst") + '</strong></div><div><span>Summe vollständiger Einzelverbräuche</span><strong>' + formatNumber(summary.actual,2) + " " + esc(summary.unit) + '</strong></div><div><span>Differenz</span><strong>' + formatNumber(summary.difference,2) + " " + esc(summary.unit) + '</strong></div><div><span>Status</span><strong>' + esc(statusText(summary.status)) + '</strong></div></div>' +
      '<footer class="individual-values-card__footer"><span>' + esc(countText) + '</span><button type="button" class="primary" data-individual-save-section="consumption" data-cost-id="' + esc(summary.cost.id) + '"' + (isReadOnly() ? " disabled" : "") + '>Bereich speichern</button></footer></section>';
  }

  function manualRecord(costId, caseKey) {
    const input = state.umlageInputs && state.umlageInputs[costId];
    const raw = input && input.caseValues && input.caseValues[caseKey];
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  }
  function manualInput(summary, row, field) {
    const key = fieldKey("manual", summary.cost.id, row.caseKey, field);
    const error = fieldErrors.get(key);
    const fallback = field === "amount" ? (row.hasValue ? row.amount : "") : (manualRecord(summary.cost.id,row.caseKey).note || row.note || "");
    const value = draftValue(key, fallback);
    if (field === "amount") return '<div class="individual-values-input-wrap' + (error ? ' is-error' : '') + '"><input class="individual-values-number-input" inputmode="decimal" autocomplete="off" value="' + esc(value) + '" data-individual-manual-input data-cost-id="' + esc(summary.cost.id) + '" data-case-key="' + esc(row.caseKey) + '" data-field="amount" aria-label="Einzelbetrag ' + esc(row.caseRow.unitLabel || row.caseRow.unitId) + '"' + (isReadOnly() ? " disabled" : "") + '>' + (error ? '<small class="individual-values-field-error">' + esc(error) + '</small>' : '') + '</div>';
    return '<input class="individual-values-note-input" value="' + esc(value) + '" data-individual-manual-input data-cost-id="' + esc(summary.cost.id) + '" data-case-key="' + esc(row.caseKey) + '" data-field="note" aria-label="Quelle oder Bemerkung ' + esc(row.caseRow.unitLabel || row.caseRow.unitId) + '"' + (isReadOnly() ? " disabled" : "") + '>';
  }

  function manualSection(summary) {
    const selected = filters.get(summary.cost.id) || "all";
    const visibleRows = summary.rows.filter(row => selected === "all" || row.status === selected);
    const body = visibleRows.map(row => {
      const c = row.caseRow;
      return '<tr data-individual-row-status="' + esc(row.status) + '" data-manual-row="' + esc(row.caseKey) + '"><td class="individual-values-case-cell"><strong>' + esc(c.unitLabel || c.unitId) + '</strong><span>' + esc(c.label) + '</span>' + roleBadge(c.role) + '<small>' + esc(formatDate(c.start) + " – " + formatDate(c.end)) + '</small></td><td><strong>' + esc(roleLabel(c.role)) + '</strong><small>' + esc(c.tenantName || c.label) + '</small></td><td>' + manualInput(summary,row,"amount") + '</td><td>' + manualInput(summary,row,"note") + '</td><td>' + statusPill(row.status) + '</td><td class="individual-values-actions-cell"><button type="button" class="individual-values-icon-button" data-individual-special data-kind="manual" data-cost-id="' + esc(summary.cost.id) + '" data-row-id="' + esc(row.caseKey) + '" aria-label="Sonderfall für Abrechnungsfall bearbeiten" title="Sonderfall bearbeiten"' + (isReadOnly() ? " disabled" : "") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 17h.01"></path><path d="M10.3 3.7 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"></path></svg></button></td></tr>';
    }).join("") || '<tr><td colspan="6"><div class="individual-values-table-empty"><strong>Keine passenden Abrechnungsfälle</strong><span>Prüfe den Statusfilter.</span></div></td></tr>';
    return '<section class="individual-values-card" data-individual-section="manual" data-cost-id="' + esc(summary.cost.id) + '"><header class="individual-values-card__header"><div class="individual-values-card__title"><span class="individual-values-section-icon is-manual" aria-hidden="true">' + iconSvg("manual") + '</span><div><p class="individual-values-card__eyebrow">Manuell zuzuordnende Kostenart</p><h2>' + esc(summary.cost.kostenart) + '</h2><p>Umlageschlüssel: ' + esc(summary.cost.umlageschluessel) + '</p></div></div><div class="individual-values-card__tools">' + filterControl(summary.cost.id) + '<span class="individual-values-status is-' + esc(summary.status) + '">' + esc(statusText(summary.status)) + '</span></div></header>' +
      '<div class="individual-values-table-wrap" tabindex="0" aria-label="Tabelle manueller Einzelwerte horizontal verschiebbar"><table class="individual-values-table individual-values-manual-table"><thead><tr><th>Wohnung / Abrechnungsfall</th><th>Rolle / Empfänger</th><th>Einzelbetrag / individueller Wert</th><th>Quelle / Bemerkung</th><th>Status</th><th>Sonderfallaktion</th></tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<div class="individual-values-control is-' + esc(summary.status) + '"><div><span>Gesamtkosten laut „Gesamtkosten“</span><strong>' + formatMoney(summary.expected) + '</strong></div><div><span>Summe der erfassten Einzelwerte</span><strong>' + formatMoney(summary.actual) + '</strong></div><div><span>Differenz</span><strong>' + formatMoney(summary.difference) + '</strong></div><div><span>Status</span><strong>' + esc(statusText(summary.status)) + '</strong></div></div>' +
      '<footer class="individual-values-card__footer"><span>' + summary.rows.length + ' reguläre Abrechnungsfälle</span><button type="button" class="primary" data-individual-save-section="manual" data-cost-id="' + esc(summary.cost.id) + '"' + (isReadOnly() ? " disabled" : "") + '>Bereich speichern</button></footer></section>';
  }

  function renderKpis(pageModel) {
    const root = document.getElementById("individualKpis");
    if (!root) return;
    const consumptionAreas = pageModel.consumptionCosts.length;
    const meterTotal = pageModel.consumptionCosts.reduce((sum,row) => sum + row.totalMeters,0);
    const meterComplete = pageModel.consumptionCosts.reduce((sum,row) => sum + row.captured,0);
    const manualAreas = pageModel.manualCosts.length;
    const assignedTotal = pageModel.manualCosts.reduce((sum,row) => sum + row.actual,0);
    const completeAreas = [...pageModel.consumptionCosts,...pageModel.manualCosts].filter(row => row.status === "complete").length;
    const allAreas = consumptionAreas + manualAreas;
    const cards = [
      ["consumption","Verbrauchsbereiche",String(consumptionAreas),meterTotal + " zugeordnete Zähler"],
      ["document","Erfasste Zähler",meterComplete + " von " + meterTotal,meterTotal && meterComplete === meterTotal ? "Alle Endstände vollständig" : "Offene Endstände vorhanden"],
      ["manual","Manuelle Kostenarten",String(manualAreas),formatMoney(assignedTotal) + " zugeordnet"],
      ["check","Gesamtstatus",completeAreas + " von " + allAreas,allAreas && completeAreas === allAreas ? "Alle Bereiche stimmen überein" : "Prüfung noch nicht abgeschlossen"]
    ];
    root.innerHTML = cards.map(card => '<article class="individual-values-kpi"><span class="individual-values-kpi__icon is-' + card[0] + '" aria-hidden="true">' + iconSvg(card[0]) + '</span><div><span>' + esc(card[1]) + '</span><strong>' + esc(card[2]) + '</strong><small>' + esc(card[3]) + '</small></div></article>').join("");
  }

  function renderBottom(pageModel) {
    const plan = global.NKProYearTransitionActions && global.NKProYearTransitionActions.prepareIndividualPriorReadingTransfer ? global.NKProYearTransitionActions.prepareIndividualPriorReadingTransfer(state) : { sourceYear:"", candidates:[] };
    const ready = plan.candidates.filter(row => row.eligible).length;
    const already = plan.candidates.filter(row => row.status === "already-transferred" || row.status === "already-set").length;
    const history = document.getElementById("individualHistorySummary");
    if (history) history.innerHTML = '<div><span>Vorjahr</span><strong>' + esc(plan.sourceYear || "Nicht vorhanden") + '</strong></div><div><span>Übernahmefähig</span><strong>' + ready + '</strong></div><div><span>Bereits vorhanden / übernommen</span><strong>' + already + '</strong></div>';
    const all = [...pageModel.consumptionCosts,...pageModel.manualCosts];
    const complete = all.filter(row => row.status === "complete").length;
    const errors = all.filter(row => row.status === "error").length;
    const open = all.length - complete - errors;
    const summary = document.getElementById("individualSummary");
    if (summary) summary.innerHTML = '<div><span>Dynamische Bereiche</span><strong>' + all.length + '</strong></div><div><span>Stimmt überein</span><strong>' + complete + '</strong></div><div><span>Offen</span><strong>' + open + '</strong></div><div><span>Abweichung / Fehler</span><strong>' + errors + '</strong></div>';
    const status = document.querySelector("[data-individual-summary-status]");
    const key = all.length && complete === all.length ? "complete" : (errors ? "error" : "open");
    if (status) { status.className = "individual-values-status is-" + key; status.textContent = statusText(key); }
    const historyStatus = document.querySelector("[data-individual-history-status]");
    if (historyStatus) { historyStatus.className = "individual-values-status " + (ready ? "is-open" : "is-neutral"); historyStatus.textContent = ready ? ready + " verfügbar" : "Keine offenen Übernahmen"; }
  }

  function render() {
    const root = document.getElementById("individualDynamicSections");
    if (!root || !state || !calc()) return;
    synchronizeForView();
    const pageModel = model();
    renderKpis(pageModel);
    let html = pageModel.consumptionCosts.map(consumptionSection).join("") + pageModel.manualCosts.map(manualSection).join("");
    if (!html) html = '<section class="individual-values-card individual-values-empty"><span class="individual-values-section-icon">' + iconSvg("document") + '</span><div><h2>Keine individuellen Eingaben erforderlich</h2><p>Aktive Kostenarten verwenden derzeit ausschließlich automatische Umlageschlüssel oder sind nicht abrechnungsrelevant.</p></div></section>';
    root.innerHTML = html;
    renderBottom(pageModel);
  }

  function ensureManualInput(costId) {
    if (!state.umlageInputs) state.umlageInputs = {};
    if (!state.umlageInputs[costId]) {
      const cost = (state.kostenarten || []).find(row => row && row.id === costId) || {};
      state.umlageInputs[costId] = { kostenId:costId, kostenart:String(cost.kostenart || ""), art:"Direkter Eurobetrag", mode:"Direkter Eurobetrag", values:[], caseValues:{} };
    }
    const input = state.umlageInputs[costId];
    if (!Array.isArray(input.values)) input.values = [];
    if (!input.caseValues || typeof input.caseValues !== "object" || Array.isArray(input.caseValues)) input.caseValues = {};
    return input;
  }

  function applyMeterInput(element) {
    const key = fieldKey("meter", element.dataset.costId, element.dataset.meterId, element.dataset.field);
    draftText.set(key, element.value);
    const parsed = parseLocaleNumber(element.value);
    if (!parsed.ok) { fieldErrors.set(key,"Ungültige Zahl"); return false; }
    fieldErrors.delete(key);
    const result = global.NKProMeteringDraft && global.NKProMeteringDraft.setValue(element.dataset.meterId, element.dataset.field, parsed.empty ? "" : parsed.value, "number");
    if (!result || !result.changed) { fieldErrors.set(key,"Zählerwert konnte nicht übernommen werden"); return false; }
    markDirty();
    return true;
  }

  function applyManualInput(element) {
    const costId = element.dataset.costId;
    const caseKey = element.dataset.caseKey;
    const field = element.dataset.field;
    const key = fieldKey("manual",costId,caseKey,field);
    draftText.set(key,element.value);
    const input = ensureManualInput(costId);
    const existing = input.caseValues[caseKey] && typeof input.caseValues[caseKey] === "object" ? input.caseValues[caseKey] : {};
    if (field === "amount") {
      const parsed = parseLocaleNumber(element.value);
      if (!parsed.ok) { fieldErrors.set(key,"Ungültige Zahl"); return false; }
      fieldErrors.delete(key);
      if (parsed.empty) {
        if (existing.note) input.caseValues[caseKey] = { ...existing, amount:"", value:"", source:existing.source || "manual", updatedAt:new Date().toISOString() };
        else delete input.caseValues[caseKey];
      } else {
        input.caseValues[caseKey] = { ...existing, amount:parsed.value, value:parsed.value, source:existing.source || "manual", updatedAt:new Date().toISOString() };
        const caseRow = calc().individualValueCases(state).find(row => row.caseKey === caseKey);
        if (caseRow && caseRow.originalIndex >= 0) {
          while (input.values.length <= caseRow.originalIndex) input.values.push(0);
          input.values[caseRow.originalIndex] = parsed.value;
        }
      }
    } else {
      fieldErrors.delete(key);
      const amountValue = Object.prototype.hasOwnProperty.call(existing,"amount") ? existing.amount : "";
      if (!element.value && (amountValue === "" || amountValue === null || amountValue === undefined)) delete input.caseValues[caseKey];
      else input.caseValues[caseKey] = { ...existing, amount:amountValue, value:amountValue, note:element.value, source:existing.source || "manual", updatedAt:new Date().toISOString() };
    }
    markDirty();
    return true;
  }

  function applyElement(element) {
    if (element.matches("[data-individual-meter-input]")) return applyMeterInput(element);
    if (element.matches("[data-individual-manual-input]")) return applyManualInput(element);
    return true;
  }

  function showNotice(text, kind = "ok") {
    const node = document.getElementById("individualSaveNotice");
    if (!node) return;
    node.hidden = false;
    node.className = "individual-values-save-notice is-" + kind;
    node.textContent = text;
  }

  function clearSectionDrafts(kind,costId) {
    [...draftText.keys()].filter(key => key.startsWith(kind + "|" + costId + "|")).forEach(key => draftText.delete(key));
    [...fieldErrors.keys()].filter(key => key.startsWith(kind + "|" + costId + "|")).forEach(key => fieldErrors.delete(key));
  }

  function persistedSectionMatches(kind,costId) {
    if (typeof readStoredDataResult !== "function" || typeof STORAGE_KEY === "undefined") return false;
    const stored = readStoredDataResult(STORAGE_KEY);
    if (!stored || !stored.valid || !stored.data) return false;
    if (kind === "consumption") {
      const currentRows = calc().meterRowsForCost(state,costId);
      const storedRows = calc().meterRowsForCost(stored.data,costId);
      return currentRows.length === storedRows.length && currentRows.every(row => {
        const found = storedRows.find(item => item.meterId === row.meterId);
        return found && String(found.startValue) === String(row.startValue) && String(found.endValue) === String(row.endValue);
      });
    }
    const current = state.umlageInputs && state.umlageInputs[costId] || {};
    const saved = stored.data.umlageInputs && stored.data.umlageInputs[costId] || {};
    return JSON.stringify(current.caseValues || {}) === JSON.stringify(saved.caseValues || {}) && JSON.stringify(current.values || []) === JSON.stringify(saved.values || []);
  }

  function saveSection(kind,costId,button) {
    if (isReadOnly()) return false;
    const section = button && button.closest("[data-individual-section]") || document.querySelector('[data-individual-section="' + CSS.escape(kind) + '"][data-cost-id="' + CSS.escape(costId) + '"]');
    let valid = true;
    (section ? [...section.querySelectorAll("[data-individual-meter-input],[data-individual-manual-input]")] : []).forEach(element => { if (!applyElement(element)) valid = false; });
    if (!valid || [...fieldErrors.keys()].some(key => key.startsWith(kind + "|" + costId + "|"))) {
      showNotice("Der Bereich enthält ungültige Eingaben. Die sichtbaren Werte bleiben erhalten.","error");
      render();
      return false;
    }
    const saved = typeof global.saveData === "function" ? global.saveData() : (typeof saveData === "function" ? saveData() : false);
    if (!saved || !persistedSectionMatches(kind,costId)) {
      showNotice("Speichern fehlgeschlagen. Die eingegebenen Werte bleiben sichtbar und können erneut gespeichert werden.","error");
      return false;
    }
    clearSectionDrafts(kind,costId);
    showNotice("Bereich erfolgreich gespeichert und aus dem Browser-Speicher zurückgelesen.","ok");
    render();
    return true;
  }

  function openDialog(dialog,trigger,focusSelector) {
    if (!dialog) return;
    returnFocus = trigger || document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open","");
    requestAnimationFrame(() => { const target = focusSelector ? dialog.querySelector(focusSelector) : null; if (target) target.focus(); });
  }
  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close(); else dialog.removeAttribute("open");
    if (returnFocus && typeof returnFocus.focus === "function") requestAnimationFrame(() => returnFocus.focus());
  }

  function findMeter(meterId) {
    return state.zaehlerDaten && Array.isArray(state.zaehlerDaten.zaehler) ? state.zaehlerDaten.zaehler.find(row => String(row && (row.meterId || row.zaehlerId || row.id) || "") === String(meterId || "")) : null;
  }
  function openSpecial(trigger) {
    if (isReadOnly()) return;
    selectedSpecial = { kind:trigger.dataset.kind, costId:trigger.dataset.costId, rowId:trigger.dataset.rowId };
    const dialog = document.getElementById("individualSpecialDialog");
    const title = dialog.querySelector("[data-individual-special-title]");
    const context = dialog.querySelector("[data-individual-special-context]");
    const note = dialog.querySelector("[data-individual-special-note]");
    const overridePanel = dialog.querySelector("[data-individual-start-override-panel]");
    const overrideCheckbox = dialog.querySelector("[data-individual-start-override]");
    const overrideHelp = dialog.querySelector("[data-individual-start-override-help]");
    if (selectedSpecial.kind === "meter") {
      const meter = findMeter(selectedSpecial.rowId) || {};
      const transfer = priorTransferForMeter(selectedSpecial.rowId);
      const overridden = hasStartOverride(selectedSpecial.rowId);
      title.textContent = "Zähler-Sonderfall";
      context.textContent = [meter.zaehlernummer || selectedSpecial.rowId, meter.einheitId || ""].filter(Boolean).join(" · ");
      note.value = String(meter.bemerkung || "");
      if (overridePanel) overridePanel.hidden = !transfer;
      if (overrideCheckbox) { overrideCheckbox.checked = overridden; overrideCheckbox.disabled = overridden; }
      if (overrideHelp) overrideHelp.textContent = overridden
        ? "Der übernommene Anfangsstand ist bereits als Sonderfall zur Bearbeitung freigegeben."
        : "Die Freigabe ist bewusst zu bestätigen. Danach kann der Anfangsstand geändert und mit dem Bereich gespeichert werden.";
    } else {
      const caseRow = calc().individualValueCases(state).find(row => row.caseKey === selectedSpecial.rowId) || {};
      title.textContent = "Abrechnungsfall-Sonderfall";
      context.textContent = [caseRow.unitLabel || caseRow.unitId,caseRow.label].filter(Boolean).join(" · ");
      note.value = String(manualRecord(selectedSpecial.costId,selectedSpecial.rowId).note || "");
      if (overridePanel) overridePanel.hidden = true;
      if (overrideCheckbox) { overrideCheckbox.checked = false; overrideCheckbox.disabled = false; }
    }
    openDialog(dialog,trigger,"[data-individual-special-note]");
  }
  function saveSpecial() {
    if (!selectedSpecial || isReadOnly()) return;
    const note = document.querySelector("[data-individual-special-note]").value;
    if (selectedSpecial.kind === "meter") {
      global.NKProMeteringDraft.setValue(selectedSpecial.rowId,"note",note,"text");
      const overrideCheckbox = document.querySelector("[data-individual-start-override]");
      if (overrideCheckbox && overrideCheckbox.checked) authorizeStartOverride(selectedSpecial.rowId,note);
    } else {
      const input = ensureManualInput(selectedSpecial.costId);
      const existing = input.caseValues[selectedSpecial.rowId] && typeof input.caseValues[selectedSpecial.rowId] === "object" ? input.caseValues[selectedSpecial.rowId] : {};
      input.caseValues[selectedSpecial.rowId] = { ...existing, amount:Object.prototype.hasOwnProperty.call(existing,"amount") ? existing.amount : "", value:Object.prototype.hasOwnProperty.call(existing,"value") ? existing.value : "", note, source:existing.source || "manual", updatedAt:new Date().toISOString() };
      draftText.set(fieldKey("manual",selectedSpecial.costId,selectedSpecial.rowId,"note"),note);
      markDirty();
    }
    selectedSpecial = null;
    closeDialog(document.getElementById("individualSpecialDialog"));
    render();
  }

  function openPriorDialog(trigger) {
    const dialog = document.getElementById("individualPriorTransferDialog");
    const plan = global.NKProYearTransitionActions.prepareIndividualPriorReadingTransfer(state);
    dialog._priorPlan = plan;
    dialog.querySelector("[data-individual-prior-list]").innerHTML = plan.candidates.map((row,index) => '<tr><td><input type="checkbox" data-prior-select="' + index + '"' + (row.selected ? " checked" : "") + (!row.eligible ? " disabled" : "") + ' aria-label="Vorjahreswert auswählen"></td><td><strong>' + esc(row.costName || row.costId || "Verbrauchskostenart") + '</strong><span>' + esc(row.meterNumber || row.meterId) + '</span><small>' + esc(row.meterId) + '</small></td><td>' + esc(row.caseLabel) + '</td><td class="number-cell">' + (row.previousEnd === "" ? "–" : formatNumber(row.previousEnd,2)) + '</td><td>' + statusPill(row.eligible ? "complete" : "open",row.reason) + '</td></tr>').join("") || '<tr><td colspan="5">Keine Vorjahresdaten vorhanden.</td></tr>';
    openDialog(dialog,trigger,"input:not([disabled])");
  }

  function confirmPriorTransfer() {
    const dialog = document.getElementById("individualPriorTransferDialog");
    const plan = dialog._priorPlan;
    if (!plan || isReadOnly()) return;
    const selected = plan.candidates.filter((row,index) => row.eligible && dialog.querySelector('[data-prior-select="' + index + '"]')?.checked);
    const period = calc().periodForData(state);
    try {
      selected.forEach(row => {
        const resultValue = global.NKProMeteringDraft.setValue(row.meterId,"start",row.previousEnd,"number");
        const resultDate = global.NKProMeteringDraft.setValue(row.meterId,"startDate",period.start,"text");
        if (!resultValue.changed || !resultDate.changed) throw new Error("Zählerwert konnte nicht übernommen werden.");
      });
      const result = selected.length ? global.NKProYearTransitionActions.recordIndividualPriorReadingTransfer(selected,plan.sourceYear) : { recorded:0, skipped:0 };
      if (selected.length && (!result || result.recorded + result.skipped !== selected.length)) throw new Error("Übernahme konnte nicht vollständig dokumentiert werden.");
      if (selected.length && typeof readStoredDataResult === "function" && typeof STORAGE_KEY !== "undefined") {
        const readBack = readStoredDataResult(STORAGE_KEY);
        if (!readBack.valid) throw new Error("Rückleseprüfung nach Vorjahresübernahme fehlgeschlagen.");
      }
      closeDialog(dialog);
      showNotice(selected.length ? (result.recorded + " Vorjahreswerte übernommen; " + result.skipped + " bereits vorhanden.") : "Keine Werte ausgewählt.","ok");
      render();
    } catch(error) {
      showNotice("Vorjahresübernahme fehlgeschlagen: " + String(error && error.message || error),"error");
    }
  }

  function connect() {
    if (bound) return;
    bound = true;
    document.addEventListener("input", event => {
      const element = event.target.closest && event.target.closest("#manuellewerte [data-individual-meter-input], #manuellewerte [data-individual-manual-input]");
      if (!element) return;
      const kind = element.matches("[data-individual-meter-input]") ? "meter" : "manual";
      const key = kind === "meter" ? fieldKey("meter",element.dataset.costId,element.dataset.meterId,element.dataset.field) : fieldKey("manual",element.dataset.costId,element.dataset.caseKey,element.dataset.field);
      draftText.set(key,element.value);
      markDirty();
    });
    document.addEventListener("change", event => {
      const element = event.target.closest && event.target.closest("#manuellewerte [data-individual-meter-input], #manuellewerte [data-individual-manual-input]");
      if (element) { applyElement(element); render(); return; }
      const filter = event.target.closest && event.target.closest("#manuellewerte [data-individual-filter]");
      if (filter) { filters.set(filter.dataset.individualFilter,filter.value); render(); }
    });
    document.addEventListener("click", event => {
      const save = event.target.closest("#manuellewerte [data-individual-save-section]");
      if (save) { saveSection(save.dataset.individualSaveSection,save.dataset.costId,save); return; }
      const special = event.target.closest("#manuellewerte [data-individual-special]");
      if (special) { openSpecial(special); return; }
      if (event.target.closest("#manuellewerte [data-individual-special-save]")) { saveSpecial(); return; }
      const prior = event.target.closest("#manuellewerte [data-individual-prior-open]");
      if (prior) { openPriorDialog(prior); return; }
      if (event.target.closest("#manuellewerte [data-individual-prior-confirm]")) { confirmPriorTransfer(); return; }
      const close = event.target.closest("#manuellewerte [data-individual-dialog-close]");
      if (close) closeDialog(close.closest("dialog"));
    });
  }

  function requestFocus() { requestAnimationFrame(() => document.querySelector("#manuellewerte input:not([disabled])")?.focus()); }
  function sourceType(cost) { return calc().individualValueCostKind(cost); }
  function assessment(cost) {
    const kind = sourceType(cost);
    return kind === "consumption" ? calc().consumptionSummaryForCost(state,cost.id) : (kind === "manual" ? calc().manualCostSummary(state,cost.id) : null);
  }
  function describe() {
    const pageModel = state && calc() ? model() : { cases:[],consumptionCosts:[],manualCosts:[] };
    return Object.freeze({ cases:pageModel.cases.length, consumptionAreas:pageModel.consumptionCosts.length, manualAreas:pageModel.manualCosts.length, drafts:draftText.size, errors:fieldErrors.size, startOverrides:state && state.meta && Array.isArray(state.meta.individualValuesStartOverrides) ? state.meta.individualValuesStartOverrides.length : 0, dynamic:true });
  }

  connect();
  global.NKProIndividualValues = Object.freeze({ render, requestFocus, sourceType, assessment, describe, parseLocaleNumber, saveSection });
})(globalThis);

function renderIndividualValues() { return globalThis.NKProIndividualValues.render(); }
