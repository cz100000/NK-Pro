"use strict";

// AP12: Kostenarten, Auswahl, Umlagematrix und Kostenansichten.
function activePrepaymentCostIds(...args) { return NK_PRO_MODULES.billingCalculation.activePrepaymentCostIds(...args); }

function activeCostRowsForMatrix() {
  return (Array.isArray(state.kostenarten) ? state.kostenarten : []).filter(k => k && k.id && k.kostenart && k.inNK === "Ja");
}

function tenantIdForUmlage(...args) { return NK_PRO_MODULES.billingCalculation.tenantIdForUmlage(...args); }

function isCostAllowedForTenant(...args) { return NK_PRO_MODULES.billingCalculation.isCostAllowedForTenant(...args); }




function costTenantToggleHtml(costId, tenantId, allowed) {
  return '<label class="tenant-toggle"><input type="checkbox" ' + (allowed ? "checked" : "") +
    uiActionAttributes("cost.setTenantAllowed", [costId,tenantId,"$checked"], "change") + '><span>' +
    (allowed ? "ja" : "nein") + '</span></label>';
}

function renderKostenMieterUmlageMatrix() {
  const el = document.getElementById("kostenMieterUmlageTable");
  if (!el) return;
  NK_PRO_MODULES.costActions.syncKostenartenMieterUmlage();
  const tenants = tenantRowsWithIndex();
  const costs = activeCostRowsForMatrix();
  const tenantHeads = tenants.map(t => tenantHeaderHtml(t)).join("");

  if (!costs.length || !tenants.length) {
    el.innerHTML = '<thead><tr><th>Hinweis</th></tr></thead><tbody><tr><td>Keine aktive Kostenart oder kein Mietverhältnis in dieser Abrechnungsperiode vorhanden.</td></tr></tbody>';
    return;
  }

  const rows = costs.map(k => {
    const tenantCells = tenants.map(t => {
      const tenantId = tenantIdForUmlage(t);
      return '<td class="toggle-cell-wrap">' + costTenantToggleHtml(k.id, tenantId, isCostAllowedForTenant(k.id, t)) + '</td>';
    }).join("");
    return '<tr><td>' + escapeHtml(k.id) + '</td><td>' + escapeHtml(k.kostenart) + '</td><td>' + escapeHtml(NK_PRO_MODULES.costActions.kostenStatus(k)) + '</td><td>' + escapeHtml(costExclusionHandling(k)) + '</td>' + tenantCells + '</tr>';
  }).join("");

  el.innerHTML = '<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Status</th><th>Ausschluss-Behandlung</th>' + tenantHeads + '</tr></thead><tbody>' + rows + '</tbody>';
}


let costPageSize = 25;
let costShowAllRows = false;
let selectedCostRows = new Set();

function toggleCostRowSelection(index, checked) {
  const numericIndex = Number(index);
  if (checked) selectedCostRows.add(numericIndex);
  else selectedCostRows.delete(numericIndex);
  updateCostSelectionUi();
}

function toggleAllVisibleCostRows(checked) {
  document.querySelectorAll(".cost-row-checkbox").forEach(box => {
    box.checked = !!checked;
    const index = Number(box.dataset.costIndex);
    if (checked) selectedCostRows.add(index);
    else selectedCostRows.delete(index);
  });
  updateCostSelectionUi();
}

function updateCostSelectionUi() {
  Array.from(selectedCostRows).forEach(index => {
    const cost = state.kostenarten[index];
    if (!cost || cost.inNK !== "Ja") selectedCostRows.delete(index);
  });
  const button = document.getElementById("costDeactivateSelectedBtn");
  if (button) {
    button.disabled = selectedCostRows.size === 0 || isArchiveViewer();
    button.textContent = selectedCostRows.size <= 1
      ? "⊘ Ausgewählte Kostenart deaktivieren"
      : "⊘ " + selectedCostRows.size + " Kostenarten deaktivieren";
  }

  const boxes = Array.from(document.querySelectorAll(".cost-row-checkbox"));
  boxes.forEach(box => {
    const selected = selectedCostRows.has(Number(box.dataset.costIndex));
    box.checked = selected;
    const row = box.closest("tr");
    if (row) row.classList.toggle("is-selected", selected);
  });

  const selectAll = document.getElementById("costSelectAll");
  if (selectAll) {
    const checkedCount = boxes.filter(box => box.checked).length;
    selectAll.checked = boxes.length > 0 && checkedCount === boxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < boxes.length;
  }
}

function deactivateSelectedCosts() {
  if (!selectedCostRows.size || isArchiveViewer()) return;
  const validIndexes = Array.from(selectedCostRows).filter(index => {
    const cost = state.kostenarten[index];
    return cost && cost.inNK === "Ja";
  });
  if (!validIndexes.length) {
    selectedCostRows.clear();
    updateCostSelectionUi();
    return;
  }
  const labels = validIndexes.slice(0, 4).map(index => state.kostenarten[index].kostenart).filter(Boolean);
  const more = validIndexes.length > labels.length ? " und " + (validIndexes.length - labels.length) + " weitere" : "";
  const message = validIndexes.length === 1
    ? "Kostenart „" + labels[0] + "“ deaktivieren?\n\nDie bisherigen Eingaben bleiben gespeichert und können später wieder aktiviert werden."
    : validIndexes.length + " Kostenarten deaktivieren?\n\n" + labels.join(", ") + more + "\n\nDie bisherigen Eingaben bleiben gespeichert und können später wieder aktiviert werden.";
  if (!window.confirm(message)) return;

  validIndexes.forEach(index => {
    state.kostenarten[index].inNK = "Nein";
  });
  selectedCostRows.clear();
  commitStateChange({ reason:"Kostenarten deaktiviert" });
}


function setCostPageSize(value) {
  const parsed = Number(value);
  costPageSize = Number.isFinite(parsed) && parsed > 0 ? parsed : 25;
  costShowAllRows = costPageSize >= 9999;
  renderEinstellungen();
}

function toggleAllCostRows() {
  costShowAllRows = !costShowAllRows;
  renderEinstellungen();
}

function openCostColumnInfo() {
  setActionMessage("Alle verfügbaren Kostenarten-Spalten sind bereits sichtbar.");
  renderActionFeedback();
}

function openCostSelectionDialog() {
  if (isArchiveViewer()) return;
  const modal = document.getElementById("costSelectionModal");
  const search = document.getElementById("costSelectionSearch");
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("cost-dialog-open");
  if (search) {
    search.value = "";
    window.setTimeout(() => search.focus(), 0);
  }
  renderCostSelectionDialog();
}

function closeCostSelectionDialog() {
  const modal = document.getElementById("costSelectionModal");
  if (modal) modal.hidden = true;
  document.body.classList.remove("cost-dialog-open");
}

function resetCostUiState() {
  costPageSize = 25;
  costShowAllRows = false;
  selectedCostRows = new Set();
  const search = document.getElementById("costSelectionSearch");
  if (search) search.value = "";
  closeCostSelectionDialog();
  updateCostSelectionUi();
}

function activateCostFromDialog(index) {
  const cost = state.kostenarten[index];
  if (!cost || cost.inNK === "Ja") return;
  NK_PRO_MODULES.costActions.setSetting(index, "inNK", "Ja");
  closeCostSelectionDialog();
  window.setTimeout(() => {
    const editSection = document.getElementById("costEditSection");
    if (editSection) {
      editSection.open = true;
      editSection.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  }, 0);
}

function renderCostSelectionDialog() {
  const container = document.getElementById("costSelectionDialogContent");
  if (!container) return;
  const query = String(document.getElementById("costSelectionSearch")?.value || "").trim().toLowerCase();
  const costs = (Array.isArray(state.kostenarten) ? state.kostenarten : [])
    .map((cost, index) => ({ cost, index }))
    .filter(item => item.cost && item.cost.id && item.cost.kostenart);

  const groups = {};
  costs.forEach(item => {
    const group = costGroupLabel(item.cost);
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });

  const order = ["Betriebskosten", "Wasser", "Heizung / Warmwasser", "Abfall",
    "Eigentümerkosten / nicht umlagefähig", "Sonstige / freie Kostenarten", "Archiv / Hinweise"];
  const groupNames = Object.keys(groups).sort((a,b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.localeCompare(b, "de");
  });

  const htmlGroups = groupNames.map(group => {
    const items = groups[group].filter(({cost}) => {
      if (!query) return true;
      return [cost.kostenart, group, cost.id, cost.bereich].some(value =>
        String(value || "").toLowerCase().includes(query)
      );
    });
    if (!items.length) return "";
    const buttons = items.map(({cost,index}) => {
      const active = cost.inNK === "Ja";
      return '<button type="button" class="cost-choice-item ' + (active ? 'is-active' : '') + '" ' +
        (active ? 'disabled' : uiActionAttributes("cost.activateFromDialog", [index])) + '>' +
        '<span class="cost-choice-main"><strong>' + escapeHtml(cost.kostenart) + '</strong>' +
        '<small>' + escapeHtml(cost.id) + ' · ' + escapeHtml(cost.umlageschluessel || "noch festlegen") + '</small></span>' +
        '<span class="cost-choice-state">' + (active ? 'Bereits hinzugefügt' : 'Hinzufügen') + '</span>' +
      '</button>';
    }).join("");
    return '<section class="cost-choice-group"><h4>' + escapeHtml(group) + '</h4><div class="cost-choice-grid">' + buttons + '</div></section>';
  }).join("");

  container.innerHTML = htmlGroups || '<div class="cost-dialog-empty">Keine passende Kostenart gefunden.</div>';
}

function createFreeCostRow() {
  openCostSelectionDialog();
  const available = state.kostenarten.findIndex(k => isFreeCostSlot(k) && k.inNK !== "Ja");
  if (available < 0) {
    alert("Alle vorgesehenen freien Kostenarten-IDs sind bereits verwendet. Bitte eine bestehende eigene Kostenart bearbeiten oder deaktivieren.");
    return;
  }
  renderCostSelectionPanel();
  requestAnimationFrame(() => {
    const input = document.getElementById("freeCostName_" + available);
    if (input) { input.scrollIntoView({ behavior:"smooth", block:"center" }); input.focus(); }
  });
}

function costUnitLabel(cost) {
  const key = String(cost && cost.umlageschluessel || "");
  if (key === "Wohnfläche") return "m²";
  if (key === "Personen") return "Person";
  if (key === "Verbrauch") return "Einheit";
  if (key === "Miettage") return "Tag";
  if (key.indexOf("Wohneinheiten") >= 0) return "Wohneinheit";
  if (key === UMLAGE_MANUAL) return "individuell";
  return "–";
}

function costDisplayGroup(cost) {
  const group = String(cost && cost.bereich || "").trim();
  if (group) return group;
  return cost && cost.umlageschluessel === "Verbrauch" ? "Verbrauchskosten" : "Grundkosten";
}

function costIsComplete(cost) {
  return NK_PRO_MODULES.costActions.kostenStatus(cost) === "Vollständig";
}

function renderCostMockupOverview(activeCosts) {
  const costs = activeCosts.map(item => item.k);
  const total = costs.reduce((sum, cost) => sum + num(cost.gesamtbetrag), 0);
  const complete = costs.filter(costIsComplete).length;
  const open = Math.max(0, costs.length - complete);
  const umlagefaehig = total;
  const nonUmlage = 0;
  const qualityTarget = open ? "Prüfen Sie die Hinweise in der Qualitätsprüfung." : "Alle aktiven Kostenarten sind vollständig.";
  const period = escapeHtml(periodLabelShort());

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("einstellungen");

  const editBadge = document.getElementById("costEditBadge");
  const specialBadge = document.getElementById("costSpecialBadge");
  const controlBadge = document.getElementById("costControlBadge");
  if (editBadge) editBadge.textContent = costs.length + " aktive Kostenarten";
  if (specialBadge) specialBadge.textContent = costs.filter(c => costExclusionHandling(c) !== COST_EXCLUSION_OPTIONS[0]).length + " aktiv";
  if (controlBadge) controlBadge.textContent = open ? open + " prüfen" : "OK";

  const floorArea = (state.wohnungen || []).filter(w => w && w.status === "aktiv").reduce((sum,w) => sum + num(w.wohnflaeche), 0);
  const people = (state.mieter || []).filter(m => m && m.status === "Aktiv").reduce((sum,m) => sum + num(m.personen), 0);
  const perSqm = floorArea > 0 ? umlagefaehig / floorArea : 0;
  const perPerson = people > 0 ? umlagefaehig / people : 0;

  const control = document.getElementById("costPilotControl");
  if (control) {
    control.innerHTML =
      '<div class="cost-control-metric"><span>Summe Gesamtkosten</span><strong>' + fmtMoney(total) + '</strong></div>' +
      '<div class="cost-control-metric"><span>Summe umlagefähige Kosten</span><strong>' + fmtMoney(umlagefaehig) + '</strong></div>' +
      '<div class="cost-control-metric"><span>Nicht umlagefähig</span><strong>' + fmtMoney(nonUmlage) + '</strong></div>' +
      '<div class="cost-control-metric"><span>Umlagebare Kosten je m²</span><strong>' + fmtMoney(perSqm) + '</strong></div>' +
      '<div class="cost-control-metric"><span>Umlagebare Kosten je Person</span><strong>' + fmtMoney(perPerson) + '</strong></div>' +
      '<div class="cost-control-action"><button type="button"' + uiActionAttributes("cost.openTenantDetails") + '>Detail-Kontrollansicht öffnen<br><span class="small">(Sonderfälle &amp; Details)&nbsp; ›</span></button></div>';
  }

}

function renderEinstellungen() {

  const allActiveCosts = state.kostenarten
    .map((k,i) => ({ k, i }))
    .filter(item => item.k && item.k.id && item.k.kostenart && item.k.inNK === "Ja");

  const visibleCount = costShowAllRows ? allActiveCosts.length : Math.min(costPageSize, allActiveCosts.length);
  const activeCosts = allActiveCosts.slice(0, visibleCount);
  const keyOptions = ["Verbrauch","Wohnfläche","Personen","Verteilung auf alle Wohneinheiten","Verteilung nur auf aktive Wohneinheiten","Miettage",UMLAGE_MANUAL,"Entfällt"];

  const rows = activeCosts.length ? activeCosts.map(({k,i}, rowIndex) => {
    const status = costIsComplete(k) ? "OK" : "Hinweis";
    const statusClassName = costIsComplete(k) ? "ok" : "warn";
    const price = k.umlageschluessel === "Verbrauch" ? priceCellHtml(k, i) : '<span class="cost-disabled-value">–</span>';
    return '<tr class="' + (selectedCostRows.has(i) ? 'is-selected' : '') + '">' +
      '<td class="cost-select-col"><input type="checkbox" class="cost-row-checkbox" data-cost-index="' + i + '" ' + (selectedCostRows.has(i) ? 'checked' : '') + uiActionAttributes("cost.toggleRowSelection", [i,"$checked"], "change") + '></td>' +
      '<td>' + (rowIndex + 1) + '</td>' +
      '<td><span class="cost-readonly-identity">' + escapeHtml(k.kostenart) + '</span></td>' +
      '<td><span class="cost-readonly-group">' + escapeHtml(costGroupLabel(k)) + '</span></td>' +
      '<td>' + inputHtml(k.gesamtbetrag, "setCostSetting(" + i + ",\'gesamtbetrag\',this.value)", "money").replace("<input ", "<input class=\\\"cost-money-input\\\" ") + '</td>' +
      '<td>' + selectHtml(k.vorauszahlung, ["Ja","Nein"], "setCostSetting(" + i + ",\'vorauszahlung\',this.value)") + '</td>' +
      '<td>' + selectHtml(k.berechnungsart, ["Automatisch","Manuell je Mieter","Entfällt"], "setNested(\'kostenarten\'," + i + ",\'berechnungsart\',this.value)") + '</td>' +
      '<td>' + selectHtml(k.umlageschluessel, keyOptions, "setNested(\'kostenarten\'," + i + ",\'umlageschluessel\',this.value)") + '</td>' +
      '<td>' + selectHtml(costExclusionHandling(k), COST_EXCLUSION_OPTIONS, "setCostSetting(" + i + ",\'ausschlussBehandlung\',this.value)") + '</td>' +
      '<td>' + escapeHtml(costUnitLabel(k)) + '</td>' +
      '<td>' + inputHtml(k.gesamtverbrauch, "setCostSetting(" + i + ",\'gesamtverbrauch\',this.value)", "number") + '</td>' +
      '<td>' + price + '</td>' +
      '<td>' + escapeHtml(periodLabelShort()) + '</td>' +
      '<td>' + inputHtml(k.bemerkung, "setNested(\'kostenarten\'," + i + ",\'bemerkung\',this.value)") + '</td>' +
      '<td><span class="cost-row-status ' + statusClassName + '">' + status + '</span></td>' +
    '</tr>';
  }).join("") : '<tr><td colspan="15">Noch keine Kostenart aktiviert. Über „Kostenart hinzufügen“ kann eine vorhandene oder freie Kostenart ausgewählt werden.</td></tr>';

  const table = document.getElementById("settingsTable");
  if (table) {
    table.innerHTML =
      '<thead><tr>' +
        '<th class="cost-select-col"><input id="costSelectAll" class="cost-select-all-checkbox" type="checkbox"' + uiActionAttributes("cost.toggleAllVisibleRows", ["$checked"], "change") + ' title="Alle sichtbaren Kostenarten auswählen"></th>' +
        '<th>Nr.</th>' +
        '<th>Kostenart</th>' +
        '<th>Gruppe</th>' +
        '<th>Gesamtkosten<br>(Euro)</th>' +
        '<th>Vorauszahlung?</th>' +
        '<th>Berechnungsart</th>' +
        '<th>Umlageschlüssel</th>' +
        '<th>Ausschluss-<br>Behandlung</th>' +
        '<th>Einheit /<br>Basis</th>' +
        '<th>Gesamt-<br>verbrauch</th>' +
        '<th>Preis je Einheit<br>(Euro)</th>' +
        '<th>Abrechnungs-<br>zeitraum</th>' +
        '<th>Bemerkung</th>' +
        '<th>Status</th>' +
      '</tr></thead><tbody>' + rows + '</tbody>';
  }

  const showMoreButton = document.getElementById("costShowMoreButton");
  if (showMoreButton) {
    const remaining = Math.max(0, allActiveCosts.length - visibleCount);
    showMoreButton.hidden = allActiveCosts.length <= costPageSize && !costShowAllRows;
    if (!showMoreButton.hidden) {
      showMoreButton.textContent = costShowAllRows
        ? "Weniger Kostenarten anzeigen ︿"
        : remaining + " weitere Kostenarten anzeigen ﹀";
    }
  }

  renderKostenMieterUmlageMatrix();
  renderCostMockupOverview(allActiveCosts);
  updateCostSelectionUi();
}

function renderWohnungen() {
  renderBillingStammdatenStatus();
  renderSpecialCaseWatch();
  try {
    const error=document.getElementById("billingTenantError"); if (error) error.hidden=true;
    const units=Array.isArray(state.wohnungen)?state.wohnungen.filter(w=>w&&w.id):[];
    const visibleRows=visibleTenantRows();
    const activeUnits=units.filter(w=>w.status==="aktiv");
    const totals=visibleRows.reduce((t,m)=>{t.aktiveTage+=num(m.aktiveTage);t.personen+=num(m.personen);return t;},{aktiveTage:0,personen:0});
    const summary=document.getElementById("tenantControlSummary");
    if (summary) summary.innerHTML='<span><strong>'+units.length+'</strong> Wohnungen</span><span><strong>'+visibleRows.length+'</strong> Mietverhältnisse</span><span><strong>'+activeUnits.reduce((sum,w)=>sum+num(w.wohnflaeche),0).toLocaleString("de-DE")+' m²</strong> aktiv</span><span><strong>'+totals.personen.toLocaleString("de-DE")+'</strong> Personen</span>';
    const tenantState=billingTenantUiState.tenants;
    billingTenantSetSelectOptions(document.getElementById("billingTenantUnitFilter"),Array.from(new Set(visibleRows.map(m=>m.wohnung).filter(Boolean))).sort(billingTenantCompare),tenantState.unit,"Alle Wohnungen");
    billingTenantSetSelectOptions(document.getElementById("billingTenantStatusFilter"),Array.from(new Set(visibleRows.map(tenantOpenStatus).filter(Boolean))).sort(billingTenantCompare),tenantState.status,"Alle Status");
    const tenantSearch=tenantState.search.trim().toLocaleLowerCase("de-DE");
    let filteredTenants=visibleRows.filter(m=>(tenantState.unit==="all"||String(m.wohnung)===tenantState.unit)&&(tenantState.status==="all"||tenantOpenStatus(m)===tenantState.status)&&(!tenantSearch||billingTenantSearchText([m.id,m.name,m.wohnung,billingTenantUnitName(m.wohnung),m.abrechnungRolle,m.strasse,m.plz,m.ort,m.telefon,m.email]).includes(tenantSearch)));
    const tenantValue=(m,key)=>key==="unit"?billingTenantUnitName(m.wohnung):key==="period"?billingTenantPeriod(m):key==="status"?tenantOpenStatus(m):key==="people"?num(m.personen):key==="days"?num(m.aktiveTage):m[key];
    if (tenantState.sortKey) filteredTenants.sort((x,y)=>{const cmp=billingTenantCompare(tenantValue(x,tenantState.sortKey),tenantValue(y,tenantState.sortKey));return tenantState.sortDirection==="asc"?cmp:-cmp;});
    const eye=typeof ap22f5ActionIcon==="function"?ap22f5ActionIcon("view"):"&#128065;";
    const tenantRows=filteredTenants.map(m=>{const expanded=billingTenantUiState.expandedTenant===m.originalIndex; const unit=billingTenantUnit(m.wohnung); return '<tr><td><strong>'+escapeHtml(m.name||"—")+'</strong><small>'+escapeHtml(tenantDisplayId(m))+'</small></td><td><strong>'+escapeHtml(m.wohnung||"—")+'</strong><small>'+escapeHtml(unit?(unit.bezeichnung||unit.lage||""):"")+'</small></td><td>'+escapeHtml(billingTenantPeriod(m))+'</td><td>'+escapeHtml(m.abrechnungRolle||"—")+'</td><td>'+escapeHtml(num(m.personen).toLocaleString("de-DE"))+'</td><td>'+escapeHtml(normalizeActiveDayValue(m.aktiveTage).toLocaleString("de-DE"))+'</td><td><span class="status '+(tenantOpenStatus(m)==="Aktiv"?"ok":"warn")+'">'+escapeHtml(tenantOpenStatus(m))+'</span></td><td><button class="billing-tenant-detail-button'+(expanded?' is-active':'')+'" type="button" title="'+(expanded?'Details schließen':'Details anzeigen')+'" aria-label="'+escapeHtml((m.name||tenantDisplayId(m))+' – '+(expanded?'Details schließen':'Details anzeigen'))+'" aria-expanded="'+(expanded?'true':'false')+'" data-ui-action="billingTenant.toggleDetail" data-ui-args="['+m.originalIndex+']">'+eye+'</button></td></tr>'+(expanded?billingTenantDetailHtml(m):'');}).join("");
    const tenantTable=document.getElementById("mieterTable");
    if (tenantTable) tenantTable.innerHTML='<thead><tr><th scope="col">'+billingTenantSortButton("tenants","name","Mieter")+'</th><th scope="col">'+billingTenantSortButton("tenants","unit","Wohnung")+'</th><th scope="col">'+billingTenantSortButton("tenants","period","Mietzeitraum")+'</th><th scope="col">'+billingTenantSortButton("tenants","abrechnungRolle","Rolle")+'</th><th scope="col">'+billingTenantSortButton("tenants","people","Personen")+'</th><th scope="col">'+billingTenantSortButton("tenants","days","Aktive Tage")+'</th><th scope="col">'+billingTenantSortButton("tenants","status","Status")+'</th><th scope="col">Details</th></tr></thead><tbody>'+(tenantRows||'<tr><td colspan="8" class="billing-tenant-empty">'+(visibleRows.length?'Keine Mietverhältnisse entsprechen der Suche oder den Filtern.':'Keine Mietverhältnisse für diese Abrechnungsperiode übernommen.')+'</td></tr>')+'</tbody>';
    const tenantResult=filteredTenants.length+' von '+visibleRows.length+' Mietverhältnissen';
    ["billingTenantResults","billingTenantFooterResults"].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=tenantResult;});
    const tenantHeading=document.getElementById("tenantRelationsHeadingCount"); if(tenantHeading)tenantHeading.textContent='('+visibleRows.length+')';
    const tenantSearchInput=document.getElementById("billingTenantSearch"); if(tenantSearchInput&&tenantSearchInput.value!==tenantState.search)tenantSearchInput.value=tenantState.search;

    const unitState=billingTenantUiState.units;
    billingTenantSetSelectOptions(document.getElementById("billingUnitStatusFilter"),Array.from(new Set(units.map(w=>w.status||"aktiv"))).sort(billingTenantCompare),unitState.status,"Alle Status");
    const unitSearch=unitState.search.trim().toLocaleLowerCase("de-DE");
    let filteredUnits=units.filter(w=>(unitState.status==="all"||(w.status||"aktiv")===unitState.status)&&(!unitSearch||billingTenantSearchText([w.id,w.bezeichnung,w.lage,w.bemerkung]).includes(unitSearch)));
    if (unitState.sortKey) filteredUnits.sort((x,y)=>{const cmp=billingTenantCompare(x[unitState.sortKey],y[unitState.sortKey]);return unitState.sortDirection==="asc"?cmp:-cmp;});
    const unitRows=filteredUnits.map(w=>'<tr class="'+(w.status==="aktiv"?'':'inactive-row')+'"><td><strong>'+escapeHtml(w.bezeichnung||w.lage||w.id)+'</strong><small>'+escapeHtml(unitDisplayId(w))+'</small></td><td>'+escapeHtml(w.lage||"—")+'</td><td>'+escapeHtml(num(w.wohnflaeche).toLocaleString("de-DE"))+' m²</td><td>'+escapeHtml(w.zimmer||"—")+'</td><td>'+selectHtml(w.status||"aktiv",["aktiv","inaktiv"],"setBillingUnitStatus("+units.indexOf(w)+",this.value)")+'</td><td>'+escapeHtml(w.bemerkung||"")+'</td></tr>').join("");
    const unitTable=document.getElementById("wohnungenTable");
    if(unitTable)unitTable.innerHTML='<thead><tr><th scope="col">'+billingTenantSortButton("units","bezeichnung","Wohnung")+'</th><th scope="col">'+billingTenantSortButton("units","lage","Etage / Lage")+'</th><th scope="col">'+billingTenantSortButton("units","wohnflaeche","Wohnfläche")+'</th><th scope="col">'+billingTenantSortButton("units","zimmer","Zimmer")+'</th><th scope="col">'+billingTenantSortButton("units","status","Status")+'</th><th scope="col">'+billingTenantSortButton("units","bemerkung","Bemerkung")+'</th></tr></thead><tbody>'+(unitRows||'<tr><td colspan="6" class="billing-tenant-empty">'+(units.length?'Keine Wohnungen entsprechen der Suche oder den Filtern.':'Keine Wohnungen vorhanden.')+'</td></tr>')+'</tbody>';
    const unitResult=filteredUnits.length+' von '+units.length+' Wohnungen';
    ["billingUnitResults","billingUnitFooterResults"].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=unitResult;});
    const unitHeading=document.getElementById("tenantUnitsHeadingCount"); if(unitHeading)unitHeading.textContent='('+units.length+')';
    const unitSearchInput=document.getElementById("billingUnitSearch"); if(unitSearchInput&&unitSearchInput.value!==unitState.search)unitSearchInput.value=unitState.search;
    if(typeof renderOverviewForTab==="function")renderOverviewForTab("mieter");
    billingTenantScheduleHeaderCleanup();
  } catch(error) {
    const errorBox=document.getElementById("billingTenantError"); if(errorBox)errorBox.hidden=false;
    if(typeof console!=="undefined"&&console.error)console.error("Mietverhältnisse konnten nicht dargestellt werden",error);
  }
}


const billingTenantUiState = {
  tenants:{ search:"", unit:"all", status:"all", sortKey:"", sortDirection:"asc" },
  units:{ search:"", status:"all", sortKey:"", sortDirection:"asc" },
  expandedTenant:null
};

function billingTenantText(value) { return String(value ?? "").trim(); }
function billingTenantSearchText(values) { return values.map(billingTenantText).join(" ").toLocaleLowerCase("de-DE"); }
function billingTenantCompare(a,b) { return String(a ?? "").localeCompare(String(b ?? ""),"de-DE",{numeric:true,sensitivity:"base"}); }
function billingTenantUnit(id) { return (Array.isArray(state.wohnungen) ? state.wohnungen : []).find(w => String(w && w.id || "") === String(id || "")) || null; }
function billingTenantUnitName(id) { const unit=billingTenantUnit(id); return unit ? (unit.bezeichnung || unit.lage || unit.id) : String(id || ""); }
function billingTenantPeriod(m) { return billingTenantText(m.einzug || "offen") + " – " + billingTenantText(m.auszug || "offen"); }
function billingTenantScheduleHeaderCleanup() {
  const cleanup=()=>{
    ["mieterTable","wohnungenTable"].forEach(id=>{
      const table=document.getElementById(id);
      if(!table)return;
      table.querySelectorAll("thead th").forEach(cell=>{
        cell.classList.remove("sortable","sort-asc","sort-desc");
        cell.onclick=null;
      });
    });
  };
  if(typeof queueMicrotask==="function")queueMicrotask(cleanup);
  else setTimeout(cleanup,0);
}
function billingTenantSortButton(kind,key,label) {
  const statePart=billingTenantUiState[kind];
  const active=statePart.sortKey===key;
  const arrow=active ? (statePart.sortDirection==="asc" ? "↑" : "↓") : "↕";
  return '<button class="billing-tenant-sort" type="button" data-ui-action="billingTenant.sort" data-ui-args=\'["'+kind+'","'+key+'"]\' aria-label="Nach '+escapeHtml(label)+' sortieren">'+escapeHtml(label)+' <span aria-hidden="true">'+arrow+'</span></button>';
}
function billingTenantSetSearch(kind,value) { if (!billingTenantUiState[kind]) return; billingTenantUiState[kind].search=String(value || ""); renderWohnungen(); }
function billingTenantSetFilter(kind,key,value) { if (!billingTenantUiState[kind] || !Object.prototype.hasOwnProperty.call(billingTenantUiState[kind],key)) return; billingTenantUiState[kind][key]=String(value || "all"); renderWohnungen(); }
function billingTenantReset(kind) { if (kind==="tenants") Object.assign(billingTenantUiState.tenants,{search:"",unit:"all",status:"all"}); if (kind==="units") Object.assign(billingTenantUiState.units,{search:"",status:"all"}); renderWohnungen(); }
function billingTenantToggleDetail(index) { billingTenantUiState.expandedTenant=billingTenantUiState.expandedTenant===Number(index)?null:Number(index); renderWohnungen(); }
function billingTenantSort(kind,key) { const part=billingTenantUiState[kind]; if (!part) return; if (part.sortKey===key) part.sortDirection=part.sortDirection==="asc"?"desc":"asc"; else { part.sortKey=key; part.sortDirection="asc"; } renderWohnungen(); }
function billingTenantSetSelectOptions(select,options,current,allLabel) {
  if (!select) return;
  select.innerHTML='<option value="all">'+escapeHtml(allLabel)+'</option>'+options.map(value=>'<option value="'+escapeHtml(value)+'"'+(value===current?' selected':'')+'>'+escapeHtml(value)+'</option>').join("");
}
function billingTenantDetailHtml(m) {
  const unit=billingTenantUnit(m.wohnung);
  const address=[m.strasse,[m.plz,m.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "—";
  const special=specialCaseBadgesForTenant(m);
  return '<tr class="billing-tenant-detail-row"><td colspan="8"><div class="billing-tenant-detail"><div class="billing-tenant-detail__heading"><div><strong>'+escapeHtml(m.name || tenantDisplayId(m))+'</strong><small>'+escapeHtml(tenantDisplayId(m))+' · Abrechnungskopie · nur abrechnungsbezogene Prüfung</small></div><button class="secondary" type="button" data-ui-action="billingTenant.toggleDetail" data-ui-args="['+m.originalIndex+']">Detail schließen</button></div><div class="billing-tenant-detail__grid"><section><h3>Zuordnung und Zeitraum</h3><dl><dt>Wohnung</dt><dd>'+escapeHtml(m.wohnung || "—")+' · '+escapeHtml(unit ? (unit.bezeichnung || unit.lage || "") : "nicht im Bestand")+'</dd><dt>Einzug</dt><dd>'+escapeHtml(m.einzug || "offen")+'</dd><dt>Auszug</dt><dd>'+escapeHtml(m.auszug || "offen")+'</dd><dt>Aktive Tage</dt><dd>'+escapeHtml(normalizeActiveDayValue(m.aktiveTage).toLocaleString("de-DE"))+'</dd></dl></section><section><h3>Adresse und Kontakt</h3><dl><dt>Anschrift</dt><dd>'+escapeHtml(address)+'</dd><dt>Telefon</dt><dd>'+escapeHtml(m.telefon || "—")+'</dd><dt>E-Mail</dt><dd>'+escapeHtml(m.email || "—")+'</dd></dl></section><section><h3>Brief und Sonderfall</h3><dl><dt>Rolle</dt><dd>'+escapeHtml(m.abrechnungRolle || "—")+'</dd><dt>Anrede</dt><dd>'+escapeHtml(m.standardanrede || "—")+'</dd><dt>Geschlecht</dt><dd>'+escapeHtml(m.geschlecht || "—")+'</dd><dt>Hinweis</dt><dd>'+special+'</dd></dl></section></div></div></td></tr>';
}
function renderEinnahmen() {
  const einnahmenEl = document.getElementById("einnahmenTable");
  const vorausEl = document.getElementById("vorauszahlungenTable");
  if (!einnahmenEl || !vorausEl) return;

  const visibleRows = billableTenantRows();
  const incomeTotals = visibleRows.reduce((totals,m) => {
    totals.kaltSoll += num(m.kaltSoll);
    totals.kaltErhalten += num(m.kaltErhalten);
    totals.nkVoraus += num(m.nkVoraus);
    totals.korrektur += num(m.vorjahresKorrektur);
    totals.einnahmen += num(m.einnahmen);
    return totals;
  }, { kaltSoll:0, kaltErhalten:0, nkVoraus:0, korrektur:0, einnahmen:0 });

  const incomeRows = visibleRows.length ? visibleRows.map((m) =>
    '<tr><td>' + tenantIdCellHtml(m) + '</td>' +
    '<td>' + unitRefCellHtml(m.wohnung) + '</td>' +
    '<td>' + escapeHtml(m.name || "") + '</td>' +
    '<td class="editable">' + inputHtml(m.kaltSoll, "setNested('mieter'," + m.originalIndex + ",'kaltSoll',this.value,'number')", "money") + '</td>' +
    '<td class="editable">' + inputHtml(m.kaltErhalten, "setNested('mieter'," + m.originalIndex + ",'kaltErhalten',this.value,'number')", "money") + '</td>' +
    '<td class="readonly-cell">' + fmtMoney(m.nkVoraus) + '</td>' +
    '<td class="editable">' + inputHtml(m.vorjahresKorrektur, "setNested('mieter'," + m.originalIndex + ",'vorjahresKorrektur',this.value,'number')", "money") + '</td>' +
    '<td>' + fmtMoney(m.einnahmen) + '</td>' +
    '<td><span class="status ' + (tenantOpenStatus(m) === "Aktiv" ? "ok" : "warn") + '">' + escapeHtml(tenantOpenStatus(m)) + '</span></td></tr>').join("") +
    '<tr class="total-row"><td colspan="3">Summe</td><td>' + fmtMoney(incomeTotals.kaltSoll) + '</td><td>' + fmtMoney(incomeTotals.kaltErhalten) + '</td><td>' + fmtMoney(incomeTotals.nkVoraus) + '</td><td>' + fmtMoney(incomeTotals.korrektur) + '</td><td>' + fmtMoney(incomeTotals.einnahmen) + '</td><td></td></tr>'
    : '<tr><td colspan="9">Keine aktuellen oder NK-offenen Mietverhältnisse vorhanden.</td></tr>';
  einnahmenEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mietername</th><th>Kaltmiete Soll/Jahr</th><th>Kaltmiete erhalten</th><th>NK-Vorauszahlungen automatisch</th><th>Einmalige Korrektur / Gutschrift</th><th>Einnahmen gesamt</th><th>Abrechnungsstatus</th></tr></thead><tbody>' + incomeRows + '</tbody>';

  renderPrepaymentCarryForwardNotice();
  const activeIds = new Set(activePrepaymentCostIds());
  const tenantHeads = visibleRows.map(m => tenantHeaderHtml(m)).join("");
  const visibleVorausRows = state.vorauszahlungen
    .map((v,i) => ({...v, originalIndex:i}))
    .filter(v => activeIds.has(v.kostenId));
  const columnTotals = visibleRows.map(m =>
    visibleVorausRows.reduce((sum,v) => sum + (isCostAllowedForTenant(v.kostenId, m) ? num(v.werte[m.originalIndex]) : 0), 0)
  );
  const grandTotal = columnTotals.reduce((a,b) => a + num(b), 0);

  const vrows = visibleVorausRows.length && visibleRows.length ? visibleVorausRows.map((v) => {
    const allowedSum = visibleRows.reduce((sum,m) => sum + (isCostAllowedForTenant(v.kostenId, m) ? num(v.werte[m.originalIndex]) : 0), 0);
    const cells = visibleRows.map(m => {
      const current = num(v.werte[m.originalIndex]);
      if (!isCostAllowedForTenant(v.kostenId, m)) {
        return '<td class="readonly-cell">' + (Math.abs(current) > 0.01 ? fmtMoney(current) : "–") + '<div class="small">nicht umlagefähig</div></td>';
      }
      return '<td class="editable">' + inputHtml(v.werte[m.originalIndex], "setPrepaymentValue(" + v.originalIndex + "," + m.originalIndex + ",this.value)", "money") + '</td>';
    }).join("");
    return '<tr><td>' + escapeHtml(v.kostenId) + '</td><td>' + escapeHtml(v.kostenart) + '</td><td>' + escapeHtml(v.aktiv) + '</td><td>' + fmtMoney(allowedSum) + '</td>' + cells + '</tr>';
  }).join("") +
    '<tr class="total-row"><td colspan="3">Summe je Mieter</td><td>' + fmtMoney(grandTotal) + '</td>' +
    columnTotals.map(total => '<td>' + fmtMoney(total) + '</td>').join("") + '</tr>'
    : '<tr><td colspan="' + (4 + visibleRows.length) + '">Keine Kostenart für NK-Vorauszahlungen aktiviert oder kein aktuelles/NK-offenes Mietverhältnis vorhanden.</td></tr>';
  vorausEl.innerHTML = '<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Als VZ?</th><th>Summe</th>' + tenantHeads + '</tr></thead><tbody>' + vrows + '</tbody>';
}

function renderKosten() {
  const rows = state.kostenarten.map((k,i) =>
    '<tr><td>' + escapeHtml(k.id) + '</td>' +
    '<td class="editable">' + inputHtml(k.kostenart, "setNested('kostenarten'," + i + ",'kostenart',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(k.bereich, "setNested('kostenarten'," + i + ",'bereich',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(k.inNK, ["Ja","Nein"], "setNested('kostenarten'," + i + ",'inNK',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(k.vorauszahlung, ["Ja","Nein"], "setNested('kostenarten'," + i + ",'vorauszahlung',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(k.berechnungsart, ["Automatisch","Manuell je Mieter","Entfällt"], "setNested('kostenarten'," + i + ",'berechnungsart',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(k.umlageschluessel, ["Verbrauch","Wohnfläche","Personen","Verteilung auf alle Wohneinheiten","Verteilung nur auf aktive Wohneinheiten","Miettage",UMLAGE_MANUAL,"Entfällt"], "setNested('kostenarten'," + i + ",'umlageschluessel',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(costExclusionHandling(k), COST_EXCLUSION_OPTIONS, "setNested('kostenarten'," + i + ",'ausschlussBehandlung',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(k.gesamtbetrag, "setNested('kostenarten'," + i + ",'gesamtbetrag',this.value,'number')", "money") + '</td>' +
    '<td class="editable">' + inputHtml(k.gesamtverbrauch, "setNested('kostenarten'," + i + ",'gesamtverbrauch',this.value,'number')", "number") + '</td>' +
    '<td class="editable">' + inputHtml(k.preisProEinheit, "setNested('kostenarten'," + i + ",'preisProEinheit',this.value,'number')", "money") + '</td>' +
    '<td class="editable">' + inputHtml(k.bemerkung, "setNested('kostenarten'," + i + ",'bemerkung',this.value)") + '</td>' +
    '<td><span class="status ' + statusClass(NK_PRO_MODULES.costActions.kostenStatus(k)) + '">' + escapeHtml(NK_PRO_MODULES.costActions.kostenStatus(k)) + '</span></td></tr>').join("");
  document.getElementById("kostenTable").innerHTML = '<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Kostenbereich</th><th>In NK?</th><th>Als Vorauszahlung?</th><th>Berechnungsart</th><th>Umlageschlüssel</th><th>Ausschluss-Behandlung</th><th>Gesamtbetrag</th><th>Gesamtverbrauch</th><th>Preis pro Verbrauchseinheit</th><th>Bemerkung</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody>';
}

function addCostRow() {
  openCostSelectionDialog();
}

