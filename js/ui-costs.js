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
    el.innerHTML = '<thead><tr><th>Hinweis</th></tr></thead><tbody><tr><td class="cost-empty-cell"><strong>Keine Umlagezuordnung verfügbar.</strong><span>Keine aktive Kostenart oder kein Mietverhältnis in dieser Abrechnungsperiode vorhanden.</span></td></tr></tbody>';
    return;
  }

  const rows = costs.map(k => {
    const tenantCells = tenants.map(t => {
      const tenantId = tenantIdForUmlage(t);
      return '<td class="toggle-cell-wrap">' + costTenantToggleHtml(k.id, tenantId, isCostAllowedForTenant(k.id, t)) + '</td>';
    }).join("");
    const status = NK_PRO_MODULES.costActions.kostenStatus(k);
    return '<tr><td>' + escapeHtml(k.id) + '</td><td><strong>' + escapeHtml(k.kostenart) + '</strong></td><td><span class="cost-row-status ' + (status === "Vollständig" ? "ok" : "warn") + '">' + escapeHtml(status) + '</span></td><td>' + escapeHtml(costExclusionHandling(k)) + '</td>' + tenantCells + '</tr>';
  }).join("");

  el.innerHTML = '<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Status</th><th>Ausschluss-Behandlung</th>' + tenantHeads + '</tr></thead><tbody>' + rows + '</tbody>';
}


let costPageSize = 25;
let costShowAllRows = false;
let costSearchQuery = "";
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
      ? "Kostenart deaktivieren"
      : selectedCostRows.size + " Kostenarten deaktivieren";
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

function setCostSearch(value) {
  costSearchQuery = String(value || "");
  costShowAllRows = false;
  renderEinstellungen();
}

function clearCostSearch() {
  costSearchQuery = "";
  costShowAllRows = false;
  renderEinstellungen();
  const search = document.getElementById("costTableSearch");
  if (search) search.focus();
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
  costSearchQuery = "";
  selectedCostRows = new Set();
  const search = document.getElementById("costSelectionSearch");
  if (search) search.value = "";
  const tableSearch = document.getElementById("costTableSearch");
  if (tableSearch) tableSearch.value = "";
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
  const openCosts = costs.filter(cost => !costIsComplete(cost));
  const complete = costs.length - openCosts.length;
  const open = openCosts.length;

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("einstellungen");

  const editBadge = document.getElementById("costEditBadge");
  const specialBadge = document.getElementById("costSpecialBadge");
  const controlBadge = document.getElementById("costControlBadge");
  if (editBadge) editBadge.textContent = costs.length + " aktive Kostenarten";
  if (specialBadge) specialBadge.textContent = "Einzelwerte";
  if (controlBadge) controlBadge.textContent = open === 1 ? "1 Hinweis" : open + " Hinweise";

  const totalTile = document.getElementById("costTileTotalValue");
  const activeTile = document.getElementById("costTileActiveValue");
  const completeTile = document.getElementById("costTileCompleteValue");
  const openTile = document.getElementById("costTileOpenValue");
  const openTileDetail = document.getElementById("costTileOpenDetail");
  const openTileCard = document.getElementById("costTileOpenCard");
  if (totalTile) totalTile.textContent = fmtMoney(total);
  if (activeTile) activeTile.textContent = String(costs.length);
  if (completeTile) completeTile.textContent = complete + " von " + costs.length;
  if (openTile) openTile.textContent = String(open);
  if (openTileDetail) openTileDetail.textContent = openCosts.length ? String(openCosts[0].kostenart || "Kostenart") + " prüfen" : "Keine offenen Hinweise";
  if (openTileCard) openTileCard.classList.toggle("has-warning", open > 0);

  const control = document.getElementById("costPilotControl");
  if (control) {
    const warningItems = openCosts.map(cost =>
      '<div class="cost-check-item is-warning"><span class="cost-row-status warn">Hinweis</span><span><strong>' + escapeHtml(cost.kostenart || cost.id || "Kostenart") + ' prüfen</strong><small>Der bestehende Kostenstatus ist noch nicht vollständig.</small></span><button type="button"' + uiActionAttributes("cost.openTenantDetails") + '>Details anzeigen</button></div>'
    ).join("");
    const completeItem = '<div class="cost-check-item is-complete"><span class="cost-row-status ok">Vollständig</span><span><strong>Übrige Kostenarten vollständig</strong><small>' + complete + ' von ' + costs.length + ' aktiven Kostenarten sind vollständig erfasst.</small></span></div>';
    control.innerHTML = warningItems + completeItem;
  }

  const bottom = document.getElementById("costBottomSummary");
  if (bottom) bottom.innerHTML = "";
}

function costPeriodLabel() {
  return String(periodLabelShort()).replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g, (_match, day, month, year) =>
    String(day).padStart(2, "0") + "." + String(month).padStart(2, "0") + "." + year
  );
}

function renderEinstellungen() {
  const allActiveCosts = state.kostenarten
    .map((k,i) => ({ k, i }))
    .filter(item => item.k && item.k.id && item.k.kostenart && item.k.inNK === "Ja");
  const query = costSearchQuery.trim().toLocaleLowerCase("de-DE");
  const filteredActiveCosts = allActiveCosts.filter(({k}) => !query || [k.kostenart,k.id,costGroupLabel(k),k.bereich].some(value => String(value || "").toLocaleLowerCase("de-DE").includes(query)));
  const visibleCount = costShowAllRows ? filteredActiveCosts.length : Math.min(costPageSize, filteredActiveCosts.length);
  const activeCosts = filteredActiveCosts.slice(0, visibleCount);
  const keyOptions = ["Verbrauch","Wohnfläche","Personen","Verteilung auf alle Wohneinheiten","Verteilung nur auf aktive Wohneinheiten","Miettage",UMLAGE_MANUAL,"Entfällt"];
  const total = allActiveCosts.reduce((sum, item) => sum + num(item.k.gesamtbetrag), 0);

  const rows = activeCosts.length ? activeCosts.map(({k,i}, rowIndex) => {
    const status = NK_PRO_MODULES.costActions.kostenStatus(k);
    const statusClassName = status === "Vollständig" ? "ok" : "warn";
    const price = k.umlageschluessel === "Verbrauch" ? priceCellHtml(k, i) : '<span class="cost-disabled-value">–</span>';
    return '<tr class="' + (selectedCostRows.has(i) ? 'is-selected' : '') + '">' +
      '<td class="cost-select-col"><input type="checkbox" class="cost-row-checkbox" data-cost-index="' + i + '" ' + (selectedCostRows.has(i) ? 'checked' : '') + uiActionAttributes("cost.toggleRowSelection", [i,"$checked"], "change") + ' aria-label="' + escapeHtml(k.kostenart) + ' auswählen"></td>' +
      '<td>' + (rowIndex + 1) + '</td>' +
      '<td><span class="cost-readonly-identity">' + escapeHtml(k.kostenart) + '<small>' + escapeHtml(k.id) + '</small></span></td>' +
      '<td><span class="cost-readonly-group">' + escapeHtml(costGroupLabel(k)) + '</span></td>' +
      '<td class="editable">' + inputHtml(k.gesamtbetrag, "setCostSetting(" + i + ",\'gesamtbetrag\',this.value)", "money").replace("<input ", "<input class=\"cost-money-input\" ") + '</td>' +
      '<td class="editable">' + selectHtml(k.vorauszahlung, ["Ja","Nein"], "setCostSetting(" + i + ",\'vorauszahlung\',this.value)") + '</td>' +
      '<td class="editable">' + selectHtml(k.berechnungsart, ["Automatisch","Manuell je Mieter","Entfällt"], "setNested(\'kostenarten\'," + i + ",\'berechnungsart\',this.value)") + '</td>' +
      '<td class="editable">' + selectHtml(k.umlageschluessel, keyOptions, "setNested(\'kostenarten\'," + i + ",\'umlageschluessel\',this.value)") + '</td>' +
      '<td class="editable">' + selectHtml(costExclusionHandling(k), COST_EXCLUSION_OPTIONS, "setCostSetting(" + i + ",\'ausschlussBehandlung\',this.value)") + '</td>' +
      '<td>' + escapeHtml(costUnitLabel(k)) + '</td>' +
      '<td class="editable">' + inputHtml(k.gesamtverbrauch, "setCostSetting(" + i + ",\'gesamtverbrauch\',this.value)", "number") + '</td>' +
      '<td class="editable">' + price + '</td>' +
      '<td>' + escapeHtml(costPeriodLabel()) + '</td>' +
      '<td class="editable">' + inputHtml(k.bemerkung, "setNested(\'kostenarten\'," + i + ",\'bemerkung\',this.value)") + '</td>' +
      '<td><span class="cost-row-status ' + statusClassName + '">' + escapeHtml(status) + '</span></td>' +
    '</tr>';
  }).join("") : '<tr><td class="cost-empty-cell" colspan="15"><strong>' + (allActiveCosts.length ? 'Keine Kostenart entspricht der Suche.' : 'Noch keine Kostenart aktiviert.') + '</strong><span>' + (allActiveCosts.length ? 'Suchbegriff ändern oder zurücksetzen.' : 'Über „Kostenart hinzufügen“ kann eine vorhandene oder freie Kostenart ausgewählt werden.') + '</span></td></tr>';

  const table = document.getElementById("settingsTable");
  if (table) {
    table.innerHTML =
      '<thead><tr>' +
        '<th class="cost-select-col"><input id="costSelectAll" class="cost-select-all-checkbox" type="checkbox"' + uiActionAttributes("cost.toggleAllVisibleRows", ["$checked"], "change") + ' title="Alle sichtbaren Kostenarten auswählen" aria-label="Alle sichtbaren Kostenarten auswählen"></th>' +
        '<th>Nr.</th>' +
        '<th>Kostenart</th>' +
        '<th>Gruppe</th>' +
        '<th class="money">Gesamtkosten<br>(Euro)</th>' +
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
    const remaining = Math.max(0, filteredActiveCosts.length - visibleCount);
    showMoreButton.hidden = filteredActiveCosts.length <= costPageSize && !costShowAllRows;
    if (!showMoreButton.hidden) showMoreButton.textContent = costShowAllRows ? "Weniger Kostenarten anzeigen ︿" : remaining + " weitere Kostenarten anzeigen ﹀";
  }
  const results = document.getElementById("costTableResults");
  if (results) results.textContent = filteredActiveCosts.length + " von " + allActiveCosts.length + " Kostenarten";
  const totalResult = document.getElementById("costTableTotal");
  if (totalResult) totalResult.textContent = fmtMoney(total);
  const search = document.getElementById("costTableSearch");
  if (search && search.value !== costSearchQuery) search.value = costSearchQuery;
  const pageSize = document.getElementById("costPageSize");
  if (pageSize && pageSize.value !== String(costPageSize)) pageSize.value = String(costPageSize);

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
    const tenantValue=(m,key)=>key==="unit"?billingTenantUnitName(m.wohnung):key==="period"?billingTenantPeriodSortValue(m):key==="status"?tenantOpenStatus(m):key==="people"?num(m.personen):key==="days"?num(m.aktiveTage):m[key];
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
function billingTenantDate(value) {
  const text=billingTenantText(value);
  if (!text) return "offen";
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  return match ? match[3]+"."+match[2]+"."+match[1] : text;
}
function billingTenantPeriod(m) { return billingTenantDate(m && m.einzug) + " – " + billingTenantDate(m && m.auszug); }
function billingTenantPeriodSortValue(m) { return billingTenantText(m && m.einzug) + "|" + billingTenantText(m && m.auszug); }
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
  return '<tr class="billing-tenant-detail-row"><td colspan="8"><div class="billing-tenant-detail"><div class="billing-tenant-detail__heading"><div><strong>'+escapeHtml(m.name || tenantDisplayId(m))+'</strong><small>'+escapeHtml(tenantDisplayId(m))+' · Abrechnungskopie · nur abrechnungsbezogene Prüfung</small></div><button class="secondary" type="button" data-ui-action="billingTenant.toggleDetail" data-ui-args="['+m.originalIndex+']">Detail schließen</button></div><div class="billing-tenant-detail__grid"><section><h3>Zuordnung und Zeitraum</h3><dl><dt>Wohnung</dt><dd>'+escapeHtml(m.wohnung || "—")+' · '+escapeHtml(unit ? (unit.bezeichnung || unit.lage || "") : "nicht im Bestand")+'</dd><dt>Einzug</dt><dd>'+escapeHtml(billingTenantDate(m.einzug))+'</dd><dt>Auszug</dt><dd>'+escapeHtml(billingTenantDate(m.auszug))+'</dd><dt>Aktive Tage</dt><dd>'+escapeHtml(normalizeActiveDayValue(m.aktiveTage).toLocaleString("de-DE"))+'</dd></dl></section><section><h3>Adresse und Kontakt</h3><dl><dt>Anschrift</dt><dd>'+escapeHtml(address)+'</dd><dt>Telefon</dt><dd>'+escapeHtml(m.telefon || "—")+'</dd><dt>E-Mail</dt><dd>'+escapeHtml(m.email || "—")+'</dd></dl></section><section><h3>Brief und Sonderfall</h3><dl><dt>Rolle</dt><dd>'+escapeHtml(m.abrechnungRolle || "—")+'</dd><dt>Anrede</dt><dd>'+escapeHtml(m.standardanrede || "—")+'</dd><dt>Geschlecht</dt><dd>'+escapeHtml(m.geschlecht || "—")+'</dd><dt>Hinweis</dt><dd>'+special+'</dd></dl></section></div></div></td></tr>';
}
const prepaymentUiState = {
  costs:{ search:"", sortKey:"kostenart", sortDirection:"asc" },
  rents:{ search:"", status:"all", sortKey:"unit", sortDirection:"asc" },
  corrections:{ search:"", status:"all", sortKey:"unit", sortDirection:"asc" }
};

function prepaymentText(value) { return String(value ?? "").trim(); }
function prepaymentSearchText(values) { return values.map(prepaymentText).join(" ").toLocaleLowerCase("de-DE"); }
function prepaymentCompare(a,b) { return String(a ?? "").localeCompare(String(b ?? ""),"de-DE",{numeric:true,sensitivity:"base"}); }
function prepaymentUnitLabel(unit) { return unit ? (unit.bezeichnung || unit.lage || unit.id || "—") : "Ohne Wohnungszuordnung"; }
function prepaymentCaseStatus(row) {
  if (row.billable) return "Abrechenbar";
  if (row.kind === "private") return "Eigentümer/Privat";
  if (row.kind === "vacancy") return "Leerstand";
  return "Nicht abrechenbar";
}
function prepaymentCaseStatusClass(row) { return row.billable ? "ok" : (row.kind === "vacancy" ? "neutral" : "warn"); }
function prepaymentDisplayCases() {
  const units=(Array.isArray(state.wohnungen)?state.wohnungen:[]).map((unit,unitIndex)=>({...unit,unitIndex})).filter(unit=>unit.id);
  const tenants=visibleTenantRows().slice().sort((a,b)=>prepaymentCompare(a.wohnung,b.wohnung)||prepaymentCompare(a.einzug,b.einzug)||prepaymentCompare(a.id,b.id));
  const tenantsByUnit=new Map();
  tenants.forEach(tenant=>{
    const key=String(tenant.wohnung||"");
    if(!tenantsByUnit.has(key))tenantsByUnit.set(key,[]);
    tenantsByUnit.get(key).push(tenant);
  });
  const rows=[];
  units.forEach(unit=>{
    const matches=tenantsByUnit.get(String(unit.id))||[];
    if(matches.length){
      matches.forEach(tenant=>rows.push({
        key:"tenant:"+tenant.originalIndex,
        kind:isPrivateTenant(tenant)?"private":"tenant",
        billable:isBillableTenant(tenant),
        tenant,
        unit,
        originalIndex:tenant.originalIndex
      }));
    } else {
      rows.push({key:"vacancy:"+unit.unitIndex,kind:"vacancy",billable:false,tenant:null,unit,originalIndex:null});
    }
  });
  tenants.filter(tenant=>!units.some(unit=>String(unit.id)===String(tenant.wohnung||""))).forEach(tenant=>rows.push({
    key:"tenant:"+tenant.originalIndex,
    kind:isPrivateTenant(tenant)?"private":"tenant",
    billable:isBillableTenant(tenant),
    tenant,
    unit:null,
    originalIndex:tenant.originalIndex
  }));
  return rows;
}
function prepaymentCaseName(row) { return row.tenant ? (row.tenant.name || tenantDisplayId(row.tenant) || "—") : "Leerstand"; }
function prepaymentCaseUnit(row) { return row.unit ? (row.unit.id || "—") : (row.tenant && row.tenant.wohnung ? row.tenant.wohnung : "—"); }
function prepaymentCaseSortValue(row,key) {
  if(key==="tenant")return prepaymentCaseName(row);
  if(key==="unit")return prepaymentCaseUnit(row)+"|"+prepaymentCaseName(row);
  if(key==="status")return prepaymentCaseStatus(row);
  const tenant=row.tenant||{};
  return tenant[key] ?? "";
}
function prepaymentCaseSearchValue(row) {
  return prepaymentSearchText([
    prepaymentCaseName(row),
    row.tenant && tenantDisplayId(row.tenant),
    prepaymentCaseUnit(row),
    prepaymentUnitLabel(row.unit),
    row.tenant && row.tenant.abrechnungRolle,
    prepaymentCaseStatus(row)
  ]);
}
function prepaymentSetSelectOptions(select,values,current,allLabel) {
  if(!select)return;
  select.innerHTML='<option value="all">'+escapeHtml(allLabel)+'</option>'+values.map(value=>'<option value="'+escapeHtml(value)+'"'+(value===current?' selected':'')+'>'+escapeHtml(value)+'</option>').join("");
}
function prepaymentSetSearch(kind,value) {
  const target=prepaymentUiState[kind];
  if(!target)return;
  target.search=String(value||"");
  renderEinnahmen();
}
function prepaymentSetFilter(kind,key,value) {
  const target=prepaymentUiState[kind];
  if(!target||!Object.prototype.hasOwnProperty.call(target,key))return;
  target[key]=String(value||"all");
  renderEinnahmen();
}
function prepaymentReset(kind) {
  if(kind==="costs")Object.assign(prepaymentUiState.costs,{search:"",sortKey:"kostenart",sortDirection:"asc"});
  if(kind==="rents")Object.assign(prepaymentUiState.rents,{search:"",status:"all",sortKey:"unit",sortDirection:"asc"});
  if(kind==="corrections")Object.assign(prepaymentUiState.corrections,{search:"",status:"all",sortKey:"unit",sortDirection:"asc"});
  renderEinnahmen();
}
function prepaymentSort(kind,key) {
  const target=prepaymentUiState[kind];
  if(!target)return;
  if(target.sortKey===key)target.sortDirection=target.sortDirection==="asc"?"desc":"asc";
  else {target.sortKey=key;target.sortDirection="asc";}
  renderEinnahmen();
}
function prepaymentSortButton(kind,key,label) {
  const target=prepaymentUiState[kind];
  const active=target&&target.sortKey===key;
  const arrow=active?(target.sortDirection==="asc"?"↑":"↓"):"↕";
  return '<button class="prepayment-sort" type="button" data-ui-action="cost.prepaymentSort" data-ui-args=\'["'+kind+'","'+key+'"]\' aria-label="Nach '+escapeHtml(label)+' sortieren">'+escapeHtml(label)+' <span aria-hidden="true">'+arrow+'</span></button>';
}
function prepaymentScheduleHeaderCleanup() {
  const cleanup=()=>{
    ["vorauszahlungenTable","einnahmenTable","incomeCorrectionsTable"].forEach(id=>{
      const table=document.getElementById(id);
      if(!table)return;
      table.querySelectorAll("thead th").forEach(cell=>{
        cell.classList.remove("sortable","sort-asc","sort-desc");
        cell.onclick=null;
      });
    });
  };
  if(typeof queueMicrotask==="function")queueMicrotask(cleanup); else setTimeout(cleanup,0);
}
function prepaymentCaseHeaderHtml(row) {
  const status=prepaymentCaseStatus(row);
  const primary=row.tenant ? (tenantDisplayId(row.tenant)||row.tenant.id||prepaymentCaseUnit(row)) : prepaymentCaseUnit(row);
  const secondary=row.tenant ? (row.tenant.name||prepaymentUnitLabel(row.unit)) : prepaymentUnitLabel(row.unit);
  return '<th class="prepayment-case-head"><span class="prepayment-case-head__id">'+escapeHtml(primary)+'</span><span class="prepayment-case-head__name">'+escapeHtml(secondary)+'</span><span class="prepayment-case-head__status">'+escapeHtml(status)+'</span></th>';
}
function prepaymentIdentityCell(row) {
  return '<strong>'+escapeHtml(prepaymentCaseName(row))+'</strong><small>'+escapeHtml(row.tenant?(tenantDisplayId(row.tenant)||"—"):prepaymentCaseStatus(row))+'</small>';
}
function prepaymentUnitCell(row) {
  return '<strong>'+escapeHtml(prepaymentCaseUnit(row))+'</strong><small>'+escapeHtml(prepaymentUnitLabel(row.unit))+'</small>';
}
function prepaymentStatusCell(row) {
  return '<span class="status '+prepaymentCaseStatusClass(row)+'">'+escapeHtml(prepaymentCaseStatus(row))+'</span>';
}
function prepaymentReadonlyMoney(value,reason) {
  return '<span class="prepayment-readonly-value">'+escapeHtml(value===null||value===undefined?"—":fmtMoney(value))+'</span>'+(reason?'<small>'+escapeHtml(reason)+'</small>':'');
}
function prepaymentFilteredCases(kind,cases) {
  const target=prepaymentUiState[kind];
  const query=target.search.trim().toLocaleLowerCase("de-DE");
  let rows=cases.filter(row=>(target.status==="all"||prepaymentCaseStatus(row)===target.status)&&(!query||prepaymentCaseSearchValue(row).includes(query)));
  rows.sort((a,b)=>{
    const cmp=prepaymentCompare(prepaymentCaseSortValue(a,target.sortKey),prepaymentCaseSortValue(b,target.sortKey));
    return target.sortDirection==="asc"?cmp:-cmp;
  });
  return rows;
}
function prepaymentUpdateText(id,text) { const el=document.getElementById(id); if(el)el.textContent=text; }
function prepaymentNkCorrection(tenant) { return num(tenant && tenant.vorjahresKorrektur); }
function prepaymentRentCorrection(tenant) { return num(tenant && tenant.kaltmietKorrektur); }
function prepaymentNkAfterCorrection(tenant) { return num(tenant && tenant.nkVoraus) + prepaymentNkCorrection(tenant); }
function prepaymentRentAfterCorrection(tenant) { return num(tenant && tenant.kaltErhalten) - prepaymentRentCorrection(tenant); }
function prepaymentFinancialInput(value,index,key) {
  return '<input class="money" inputmode="decimal" value="'+escapeHtml(value ?? '')+'"'+uiActionAttributes('cost.prepaymentSetTenantValue',[Number(index),String(key),'$value'],'input')+editDisabledAttr()+'>';
}
function prepaymentFinancialTotals(cases) {
  return (Array.isArray(cases)?cases:prepaymentDisplayCases()).filter(row=>row.billable&&row.tenant).reduce((totals,row)=>{
    const tenant=row.tenant;
    totals.kaltSoll+=num(tenant.kaltSoll);
    totals.kaltErhalten+=num(tenant.kaltErhalten);
    totals.nkVoraus+=num(tenant.nkVoraus);
    totals.nkKorrektur+=prepaymentNkCorrection(tenant);
    totals.kaltKorrektur+=prepaymentRentCorrection(tenant);
    totals.nkNachKorrektur+=prepaymentNkAfterCorrection(tenant);
    totals.kaltNachKorrektur+=prepaymentRentAfterCorrection(tenant);
    if(Math.abs(prepaymentNkCorrection(tenant))>.004||Math.abs(prepaymentRentCorrection(tenant))>.004)totals.affected+=1;
    return totals;
  },{kaltSoll:0,kaltErhalten:0,nkVoraus:0,nkKorrektur:0,kaltKorrektur:0,nkNachKorrektur:0,kaltNachKorrektur:0,affected:0});
}
function prepaymentRefreshFinancialDisplays(cases) {
  const allCases=Array.isArray(cases)?cases:prepaymentDisplayCases();
  const billable=allCases.filter(row=>row.billable&&row.tenant);
  const totals=prepaymentFinancialTotals(allCases);
  prepaymentUpdateText('prepaymentTileCasesValue',String(allCases.length));
  prepaymentUpdateText('prepaymentTileCasesDetail',billable.length+' abrechenbar · '+(allCases.length-billable.length)+' nicht abrechenbar');
  prepaymentUpdateText('prepaymentTileNkValue',fmtMoney(totals.nkNachKorrektur));
  prepaymentUpdateText('prepaymentTileNkDetail','Vor Korrektur '+fmtMoney(totals.nkVoraus));
  prepaymentUpdateText('prepaymentTileRentValue',fmtMoney(totals.kaltNachKorrektur));
  prepaymentUpdateText('prepaymentTileRentDetail','Soll '+fmtMoney(totals.kaltSoll)+' · erhalten '+fmtMoney(totals.kaltErhalten)+' · Korrektur '+fmtMoney(totals.kaltKorrektur));
  prepaymentUpdateText('prepaymentTileCorrectionValue',totals.affected+' '+(totals.affected===1?'Fall':'Fälle'));
  prepaymentUpdateText('prepaymentTileCorrectionDetail','NK '+fmtMoney(totals.nkKorrektur)+' · Kaltmiete '+fmtMoney(totals.kaltKorrektur));
  document.querySelectorAll('[data-prepayment-nk-after]').forEach(node=>{const tenant=state.mieter[Number(node.getAttribute('data-prepayment-nk-after'))];node.textContent=fmtMoney(prepaymentNkAfterCorrection(tenant));});
  document.querySelectorAll('[data-prepayment-rent-after]').forEach(node=>{const tenant=state.mieter[Number(node.getAttribute('data-prepayment-rent-after'))];node.textContent=fmtMoney(prepaymentRentAfterCorrection(tenant));});
  prepaymentUpdateText('prepaymentRentTotalAfter',fmtMoney(totals.kaltNachKorrektur));
  prepaymentUpdateText('prepaymentNkCorrectionTotal',fmtMoney(totals.nkKorrektur));
  prepaymentUpdateText('prepaymentNkAfterTotal',fmtMoney(totals.nkNachKorrektur));
  prepaymentUpdateText('prepaymentRentCorrectionTotal',fmtMoney(totals.kaltKorrektur));
  prepaymentUpdateText('prepaymentCorrectionRentAfterTotal',fmtMoney(totals.kaltNachKorrektur));
  return totals;
}
function prepaymentSetTenantValue(index,key,value) {
  const allowed=new Set(['kaltSoll','kaltErhalten','vorjahresKorrektur','kaltmietKorrektur']);
  const numericIndex=Number(index);
  if(!allowed.has(String(key))||!state.mieter||!state.mieter[numericIndex])return;
  const tenant=state.mieter[numericIndex];
  tenant[key]=num(value);
  tenant.kaltmietKorrektur=num(tenant.kaltmietKorrektur);
  tenant.vorjahresKorrektur=num(tenant.vorjahresKorrektur);
  tenant.einnahmen=num(tenant.kaltErhalten)+num(tenant.nkVoraus);
  ensureTenantIdentityFields(tenant);
  commitStateChange({reason:'Benutzereingabe',render:false,tabId:'einnahmen'});
  prepaymentRefreshFinancialDisplays();
  renderPrepaymentQualitySummary();
}
function prepaymentQualityClass(status) {
  if(status==='Blockiert')return 'err';
  if(status==='Zu prüfen')return 'warn';
  if(status==='Hinweis')return 'info';
  return 'ok';
}
function renderPrepaymentQualitySummary() {
  const body=document.querySelector('#incomeValidationSection .prepayment-quality__body');
  if(!body)return;
  let rows=[];
  try { const report=typeof qualityReport==='function'?qualityReport(true):null; rows=report&&Array.isArray(report.results)?report.results.filter(row=>row.targetTab==='einnahmen'):[]; } catch(_){ rows=[]; }
  const cases=prepaymentDisplayCases();
  const totals=prepaymentFinancialTotals(cases);
  const separationOk=Object.values(totals).every(value=>Number.isFinite(Number(value)));
  const central=rows.length?rows.map(row=>'<li><span class="status '+prepaymentQualityClass(row.status)+'">'+escapeHtml(row.status)+'</span><span><strong>'+escapeHtml(row.title)+'</strong><small>'+escapeHtml(row.details||row.resultText||'Zentrale Prüfung ausgeführt.')+'</small></span></li>').join(''):'<li><span class="status ok">Erledigt</span><span><strong>Zentrale Vorauszahlungsprüfungen</strong><small>Keine offenen Prüfpunkte für diese Seite.</small></span></li>';
  const local='<li><span class="status '+(separationOk?'ok':'err')+'">'+(separationOk?'Erledigt':'Blockiert')+'</span><span><strong>NK- und Kaltmietkorrekturen sind getrennt</strong><small>NK '+fmtMoney(totals.nkKorrektur)+' · Kaltmiete '+fmtMoney(totals.kaltKorrektur)+' · nicht abrechenbare Fälle bleiben ausgeschlossen.</small></span></li>';
  body.innerHTML='<div class="prepayment-quality-summary"><div><strong>Prüfstatus dieser Seite</strong><p>Vorauszahlungsmatrix, fehlende Vorauszahlungen und die getrennten Korrektursummen werden kontrolliert.</p></div><button type="button" class="secondary" data-ui-action="quality.openPageIssues" data-ui-args=\'["einnahmen"]\'>Details anzeigen</button></div><ul class="prepayment-quality-list">'+central+local+'</ul>';
}

function renderEinnahmen() {
  const rentTable=document.getElementById('einnahmenTable');
  const correctionTable=document.getElementById('incomeCorrectionsTable');
  const prepaymentTable=document.getElementById('vorauszahlungenTable');
  if(!rentTable||!correctionTable||!prepaymentTable)return;
  try {
    const cases=prepaymentDisplayCases();
    const billableCases=cases.filter(row=>row.billable&&row.tenant);
    const statusOptions=Array.from(new Set(cases.map(prepaymentCaseStatus))).sort(prepaymentCompare);
    prepaymentSetSelectOptions(document.getElementById('prepaymentRentStatusFilter'),statusOptions,prepaymentUiState.rents.status,'Alle Fälle');
    prepaymentSetSelectOptions(document.getElementById('prepaymentCorrectionStatusFilter'),statusOptions,prepaymentUiState.corrections.status,'Alle Fälle');

    renderPrepaymentCarryForwardNotice();
    const activeIds=new Set(activePrepaymentCostIds());
    const allCostRows=(Array.isArray(state.vorauszahlungen)?state.vorauszahlungen:[]).map((row,originalIndex)=>({...row,originalIndex})).filter(row=>activeIds.has(row.kostenId));
    const costState=prepaymentUiState.costs;
    const costQuery=costState.search.trim().toLocaleLowerCase('de-DE');
    let filteredCosts=allCostRows.filter(row=>!costQuery||prepaymentSearchText([row.kostenId,row.kostenart]).includes(costQuery));
    filteredCosts.sort((a,b)=>{
      const av=costState.sortKey==='sum'?billableCases.reduce((sum,item)=>sum+(isCostAllowedForTenant(a.kostenId,item.tenant)?num(a.werte[item.originalIndex]):0),0):a[costState.sortKey];
      const bv=costState.sortKey==='sum'?billableCases.reduce((sum,item)=>sum+(isCostAllowedForTenant(b.kostenId,item.tenant)?num(b.werte[item.originalIndex]):0),0):b[costState.sortKey];
      const cmp=typeof av==='number'&&typeof bv==='number'?av-bv:prepaymentCompare(av,bv);
      return costState.sortDirection==='asc'?cmp:-cmp;
    });
    const allColumnTotals=cases.map(item=>item.billable&&item.tenant?allCostRows.reduce((sum,row)=>sum+(isCostAllowedForTenant(row.kostenId,item.tenant)?num(row.werte[item.originalIndex]):0),0):null);
    const grandPrepaymentTotal=allColumnTotals.reduce((sum,value)=>sum+num(value),0);
    const caseHeads=cases.map(prepaymentCaseHeaderHtml).join('');
    const caseCols=cases.map(()=>'<col class="prepayment-case-col">').join('');
    prepaymentTable.style.minWidth=(370+cases.length*150)+'px';
    const matrixRows=filteredCosts.length?filteredCosts.map(row=>{
      const allowedSum=billableCases.reduce((sum,item)=>sum+(isCostAllowedForTenant(row.kostenId,item.tenant)?num(row.werte[item.originalIndex]):0),0);
      const cells=cases.map(item=>{
        if(!item.billable||!item.tenant)return '<td class="prepayment-case-cell prepayment-nonbillable">'+prepaymentReadonlyMoney(null,prepaymentCaseStatus(item))+'</td>';
        const current=num(row.werte[item.originalIndex]);
        if(!isCostAllowedForTenant(row.kostenId,item.tenant))return '<td class="prepayment-case-cell prepayment-nonbillable">'+prepaymentReadonlyMoney(Math.abs(current)>0.01?current:null,'nicht umlagefähig')+'</td>';
        return '<td class="prepayment-case-cell editable">'+inputHtml(row.werte[item.originalIndex],'setPrepaymentValue('+row.originalIndex+','+item.originalIndex+',this.value)','money')+'</td>';
      }).join('');
      return '<tr><td><strong>'+escapeHtml(row.kostenart||'—')+'</strong><small>'+escapeHtml(row.kostenId||'—')+'</small></td><td class="money readonly-cell">'+fmtMoney(allowedSum)+'</td>'+cells+'</tr>';
    }).join(''):'<tr><td colspan="'+(2+cases.length)+'" class="prepayment-empty">'+(allCostRows.length?'Keine Kostenarten entsprechen der Suche.':'Keine Kostenart für NK-Vorauszahlungen aktiviert.')+'</td></tr>';
    const matrixTotal=allCostRows.length?'<tr class="total-row prepayment-total-row"><td>Gesamtsumme aller aktivierten Kostenarten<small>'+billableCases.length+' abrechenbare Mietverhältnisse</small></td><td class="money">'+fmtMoney(grandPrepaymentTotal)+'</td>'+allColumnTotals.map(value=>'<td class="money prepayment-case-cell">'+(value===null?'—':fmtMoney(value))+'</td>').join('')+'</tr>':'';
    prepaymentTable.innerHTML='<colgroup><col class="prepayment-cost-col"><col class="prepayment-sum-col">'+caseCols+'</colgroup><thead><tr><th scope="col">'+prepaymentSortButton('costs','kostenart','Kostenart')+'</th><th scope="col" class="money">'+prepaymentSortButton('costs','sum','Summe')+'</th>'+caseHeads+'</tr></thead><tbody>'+matrixRows+matrixTotal+'</tbody>';

    const totals=prepaymentFinancialTotals(cases);
    const filteredRents=prepaymentFilteredCases('rents',cases);
    const rentRows=filteredRents.length?filteredRents.map(row=>{
      const tenant=row.tenant; const editable=row.billable&&tenant;
      return '<tr class="'+(editable?'':'prepayment-nonbillable-row')+'"><td>'+prepaymentIdentityCell(row)+'</td><td>'+prepaymentUnitCell(row)+'</td><td class="'+(editable?'editable':'prepayment-nonbillable')+'">'+(editable?prepaymentFinancialInput(tenant.kaltSoll,row.originalIndex,'kaltSoll'):prepaymentReadonlyMoney(tenant?tenant.kaltSoll:null,prepaymentCaseStatus(row)))+'</td><td class="'+(editable?'editable':'prepayment-nonbillable')+'">'+(editable?prepaymentFinancialInput(tenant.kaltErhalten,row.originalIndex,'kaltErhalten'):prepaymentReadonlyMoney(tenant?tenant.kaltErhalten:null,prepaymentCaseStatus(row)))+'</td><td class="money readonly-cell">'+(editable?'<span data-prepayment-rent-after="'+row.originalIndex+'">'+fmtMoney(prepaymentRentAfterCorrection(tenant))+'</span><small>inkl. Kaltmietkorrektur</small>':'—<small>'+escapeHtml(prepaymentCaseStatus(row))+'</small>')+'</td><td>'+prepaymentStatusCell(row)+'</td></tr>';
    }).join(''):'<tr><td colspan="6" class="prepayment-empty">Keine Fälle entsprechen der Suche oder dem Filter.</td></tr>';
    const rentTotal='<tr class="total-row prepayment-total-row"><td colspan="2">Gesamtsumme abrechenbare Fälle<small>'+billableCases.length+' von '+cases.length+' Fällen</small></td><td class="money">'+fmtMoney(totals.kaltSoll)+'</td><td class="money">'+fmtMoney(totals.kaltErhalten)+'</td><td class="money" id="prepaymentRentTotalAfter">'+fmtMoney(totals.kaltNachKorrektur)+'</td><td></td></tr>';
    rentTable.innerHTML='<thead><tr><th scope="col">'+prepaymentSortButton('rents','tenant','Mieter / Fall')+'</th><th scope="col">'+prepaymentSortButton('rents','unit','Wohnung')+'</th><th scope="col" class="money">'+prepaymentSortButton('rents','kaltSoll','Kaltmiete Soll / Jahr')+'</th><th scope="col" class="money">'+prepaymentSortButton('rents','kaltErhalten','Kaltmiete erhalten')+'</th><th scope="col" class="money">Kaltmieteinnahmen nach Korrektur</th><th scope="col">'+prepaymentSortButton('rents','status','Status')+'</th></tr></thead><tbody>'+rentRows+rentTotal+'</tbody>';

    const filteredCorrections=prepaymentFilteredCases('corrections',cases);
    const correctionRows=filteredCorrections.length?filteredCorrections.map(row=>{
      const tenant=row.tenant; const editable=row.billable&&tenant;
      const nkInput=editable?prepaymentFinancialInput(tenant.vorjahresKorrektur,row.originalIndex,'vorjahresKorrektur'):prepaymentReadonlyMoney(tenant?tenant.vorjahresKorrektur:null,prepaymentCaseStatus(row));
      const rentInput=editable?prepaymentFinancialInput(tenant.kaltmietKorrektur,row.originalIndex,'kaltmietKorrektur'):prepaymentReadonlyMoney(tenant?tenant.kaltmietKorrektur:null,prepaymentCaseStatus(row));
      return '<tr class="'+(editable?'':'prepayment-nonbillable-row')+'"><td>'+prepaymentIdentityCell(row)+'</td><td>'+prepaymentUnitCell(row)+'</td><td class="'+(editable?'editable':'prepayment-nonbillable')+'">'+nkInput+'</td><td class="money readonly-cell">'+(editable?'<span data-prepayment-nk-after="'+row.originalIndex+'">'+fmtMoney(prepaymentNkAfterCorrection(tenant))+'</span>':'—')+'</td><td class="'+(editable?'editable':'prepayment-nonbillable')+'">'+rentInput+'</td><td class="money readonly-cell">'+(editable?'<span data-prepayment-rent-after="'+row.originalIndex+'">'+fmtMoney(prepaymentRentAfterCorrection(tenant))+'</span>':'—')+'</td><td>'+prepaymentStatusCell(row)+'</td></tr>';
    }).join(''):'<tr><td colspan="7" class="prepayment-empty">Keine Fälle entsprechen der Suche oder dem Filter.</td></tr>';
    const correctionTotal='<tr class="total-row prepayment-total-row"><td colspan="2">Gesamtsummen abrechenbare Fälle<small>'+billableCases.length+' von '+cases.length+' Fällen</small></td><td class="money" id="prepaymentNkCorrectionTotal">'+fmtMoney(totals.nkKorrektur)+'</td><td class="money" id="prepaymentNkAfterTotal">'+fmtMoney(totals.nkNachKorrektur)+'</td><td class="money" id="prepaymentRentCorrectionTotal">'+fmtMoney(totals.kaltKorrektur)+'</td><td class="money" id="prepaymentCorrectionRentAfterTotal">'+fmtMoney(totals.kaltNachKorrektur)+'</td><td></td></tr>';
    correctionTable.innerHTML='<thead><tr><th scope="col">'+prepaymentSortButton('corrections','tenant','Mieter / Fall')+'</th><th scope="col">'+prepaymentSortButton('corrections','unit','Wohnung')+'</th><th scope="col" class="money">'+prepaymentSortButton('corrections','vorjahresKorrektur','NK-Korrektur / Gutschrift')+'</th><th scope="col" class="money">NK nach Korrektur</th><th scope="col" class="money">'+prepaymentSortButton('corrections','kaltmietKorrektur','Kaltmiet-Korrektur / Gutschrift')+'</th><th scope="col" class="money">Kaltmieteinnahmen nach Korrektur</th><th scope="col">'+prepaymentSortButton('corrections','status','Status')+'</th></tr></thead><tbody>'+correctionRows+correctionTotal+'</tbody>';

    const costResult=filteredCosts.length+' von '+allCostRows.length+' Kostenarten';
    const rentResult=filteredRents.length+' von '+cases.length+' Fällen';
    const correctionResult=filteredCorrections.length+' von '+cases.length+' Fällen';
    ['prepaymentCostResults','prepaymentCostFooterResults'].forEach(id=>prepaymentUpdateText(id,costResult));
    ['prepaymentRentResults','prepaymentRentFooterResults'].forEach(id=>prepaymentUpdateText(id,rentResult));
    ['prepaymentCorrectionResults','prepaymentCorrectionFooterResults'].forEach(id=>prepaymentUpdateText(id,correctionResult));
    prepaymentUpdateText('prepaymentCostHeadingCount','('+allCostRows.length+')');
    prepaymentUpdateText('prepaymentRentHeadingCount','('+cases.length+')');
    prepaymentUpdateText('prepaymentCorrectionHeadingCount','('+cases.length+')');
    const inputValues={prepaymentCostSearch:prepaymentUiState.costs.search,prepaymentRentSearch:prepaymentUiState.rents.search,prepaymentCorrectionSearch:prepaymentUiState.corrections.search};
    Object.entries(inputValues).forEach(([id,value])=>{const input=document.getElementById(id);if(input&&input.value!==value)input.value=value;});
    prepaymentRefreshFinancialDisplays(cases);
    renderPrepaymentQualitySummary();
    const error=document.getElementById('prepaymentPageError');if(error)error.hidden=true;
    prepaymentScheduleHeaderCleanup();
  } catch(error) {
    const errorBox=document.getElementById('prepaymentPageError');if(errorBox)errorBox.hidden=false;
    if(typeof console!=='undefined'&&console.error)console.error('Vorauszahlungen konnten nicht dargestellt werden',error);
  }
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

