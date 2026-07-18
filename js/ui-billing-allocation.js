"use strict";

// AP12: Manuelle Werte, Umlageberechnung und Ergebnisdarstellung.
function inferManualInputMode(...args) { return NK_PRO_MODULES.billingCalculation.inferManualInputMode(...args); }
function defaultManualInputMode(...args) { return NK_PRO_MODULES.billingCalculation.defaultManualInputMode(...args); }
function manualInputModeForCost(...args) { return NK_PRO_MODULES.billingCalculation.manualInputModeForCost(...args); }
function syncUmlageInputs() { return NK_PRO_MODULES.billingWorkflow.syncUmlageInputs(); }








function rawVorauszahlungByCostAndTenant(...args) { return NK_PRO_MODULES.billingCalculation.rawVorauszahlungByCostAndTenant(...args); }

function vorauszahlungByCostAndTenant(...args) { return NK_PRO_MODULES.billingCalculation.vorauszahlungByCostAndTenant(...args); }

function totalVorauszahlungForTenant(...args) { return NK_PRO_MODULES.billingCalculation.totalVorauszahlungForTenant(...args); }





function renderManualExternalValues() {
  syncUmlageInputs(); applyWaterMetersToUmlage();
  const table=document.getElementById("manualExternalValuesTable"); const control=document.getElementById("manualExternalControlTable"); const validation=document.getElementById("manualExternalValidation");
  if (!table || !control || !validation) return;
  const calcTenants=tenantRowsWithIndex();
  const costs=state.kostenarten.filter(k=>k && k.id && k.id!=="K002" && k.inNK==="Ja" && state.umlageInputs && state.umlageInputs[k.id]);
  const heads=calcTenants.map(t=>tenantHeaderHtml(t)).join("");
  const rows=costs.length?costs.map(k=>{
    const input=state.umlageInputs[k.id]; const mode=manualInputModeForCost(k); const readonly=mode==="Zählerstände";
    const cells=calcTenants.map(t=>{ const v=num(input.values[t.originalIndex]); return readonly?'<td class="readonly-cell">'+v.toLocaleString("de-DE",{maximumFractionDigits:3})+'</td>':'<td class="editable">'+inputHtml(v,"setManualExternalValue('"+k.id+"',"+t.originalIndex+",this.value)",mode.includes("Euro")||mode.includes("Einzel")?"money":"number")+'</td>'; }).join("");
    const modeSelect=selectHtml(mode,MANUAL_INPUT_MODES,"setManualInputMode('"+k.id+"',this.value)").replace('<select ','<select class="manual-mode-select" ');
    return '<tr><td>'+escapeHtml(k.id)+'</td><td>'+escapeHtml(k.kostenart)+'</td><td class="editable">'+modeSelect+'</td><td>'+escapeHtml(mode==="Zählerstände"?"automatisch":(mode==="Verbrauchsmenge"?costUnitLabel(k):"Euro"))+'</td>'+cells+'</tr>';
  }).join(""):'<tr><td colspan="'+(4+calcTenants.length)+'">Keine Kostenart benötigt manuelle oder externe Einzelwerte.</td></tr>';
  table.innerHTML='<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Quelle / Eingabeart</th><th>Einheit</th>'+heads+'</tr></thead><tbody>'+rows+'</tbody>';
  const controlRows=costs.map(k=>{ const input=state.umlageInputs[k.id]; const mode=manualInputModeForCost(k); const sum=input.values.reduce((a,b)=>a+num(b),0); const expected=(mode==="Direkter Eurobetrag"||mode==="Externe Einzelabrechnung")?num(k.gesamtbetrag):num(k.gesamtverbrauch); const diff=expected-sum; const ok=Math.abs(diff)<0.01 || mode==="Zählerstände" || (mode==="Verbrauchsmenge" && expected<=0); return '<tr><td>'+escapeHtml(k.id)+'</td><td>'+escapeHtml(k.kostenart)+'</td><td>'+escapeHtml(mode)+'</td><td>'+formatPlainNumber(sum,3)+'</td><td>'+formatPlainNumber(expected,3)+'</td><td class="'+(ok?'manual-summary-ok':'manual-summary-warn')+'">'+formatPlainNumber(diff,3)+'</td><td><span class="status '+(ok?'ok':'warn')+'">'+(ok?'OK':'Prüfen')+'</span></td></tr>'; }).join("");
  control.innerHTML='<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Quelle</th><th>Summe Einzelwerte</th><th>Referenz/Gesamt</th><th>Differenz</th><th>Status</th></tr></thead><tbody>'+(controlRows||'<tr><td colspan="7">Keine Eingabewerte zu prüfen.</td></tr>')+'</tbody>';
  const conflicts=costs.filter(k=>manualInputModeForCost(k)==="Zählerstände" && (state.umlageInputs[k.id].values||[]).every(v=>Math.abs(num(v))<0.000001));
  validation.innerHTML='<div class="water-validation-list">'+waterValidationItemHtml(conflicts.length?{key:"warn",icon:"⚠"}:{key:"ok",icon:"✓"},conflicts.length?"Zählerquellen ohne Verbrauch":"Eingabequellen eindeutig",conflicts.length?conflicts.map(k=>k.id+" · "+k.kostenart).join(", "):"Je Kostenart ist genau eine Eingabeart aktiv.")+'</div>';
}

function calculateUmlage(...args) { return NK_PRO_MODULES.billingCalculation.calculateUmlage(...args); }

function umlageTotals(...args) { return NK_PRO_MODULES.billingCalculation.umlageTotals(...args); }
function renderUmlage() {
  const calc = calculateUmlage();
  const totals = umlageTotals(calc);
  const totalCosts = totals.totalCosts;
  const tenantShares = totals.billableShare;
  const prepayments = totals.prepayments;
  const corrections = totals.corrections;
  const balance = totals.balance;
  const privateShares = totals.privateShare;
  const ownerShare = totals.ownerShare;
  const unitTotal = totals.unitTotal;

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("umlage");

  const summaryRows = calc.tenantResults.map(r => {
    const saldoText = r.balance >= 0 ? "Nachzahlung" : "Guthaben";
    return '<tr><td>' + tenantIdCellHtml(r.tenant) + '</td><td>' + unitRefCellHtml(r.tenant.wohnung) + '</td><td>' + escapeHtml(r.tenant.name) + '</td><td>' + fmtMoney(r.costShare) + '</td><td>' + fmtMoney(r.prepayments) + '</td><td>' + fmtMoney(r.correction || 0) + '</td><td>' + fmtMoney(Math.abs(r.balance)) + '</td><td><span class="status ' + (r.balance > 0.01 ? "warn" : "ok") + '">' + saldoText + '</span></td></tr>';
  }).join("") + calc.privateResults.map(r => '<tr class="owner-private-row"><td>'+tenantIdCellHtml(r.tenant)+'</td><td>'+unitRefCellHtml(r.tenant.wohnung)+'</td><td>'+escapeHtml(r.tenant.name)+'</td><td>'+fmtMoney(r.costShare)+'</td><td>–</td><td>–</td><td>'+fmtMoney(r.costShare)+'</td><td><span class="status warn">Eigentümer/Privat · Kostenanteil</span></td></tr>').join("");
  document.getElementById("umlageSummaryTable").innerHTML =
    '<thead><tr><th>ID</th><th>Wohnungs-ID</th><th>Name / Rolle</th><th>Kostenanteil</th><th>Vorauszahlungen</th><th>NK-Korrektur / Gutschrift</th><th>Saldo / Anteil</th><th>Ergebnis</th></tr></thead><tbody>' + summaryRows + '</tbody>';

  const unitColumns = allWohnungen();
  const tenantsByUnit = {};
  calc.tenants.forEach(t => {
    if (!t.wohnung) return;
    if (!tenantsByUnit[t.wohnung]) tenantsByUnit[t.wohnung] = [];
    tenantsByUnit[t.wohnung].push(t);
  });
  const unitHeads = unitColumns.map(w => {
    const occupants = tenantsByUnit[w.id] || [];
    const names = occupants.map(t => t.name || t.id).filter(Boolean).join(" / ");
    const status = names || (w.status === "aktiv" ? "ohne Mieter" : "inaktiv");
    return '<th class="unit-head"><span class="unit-id">' + escapeHtml(w.id) + '</span><span class="unit-name">' + escapeHtml(w.bezeichnung || w.lage || "") + '</span><span class="unit-status">' + escapeHtml(status) + '</span></th>';
  }).join("");
  const costRows = calc.costResults.map(row => {
    const basis = umlageBasisInfo(row.cost, row);
    const isUnitDistribution = row.cost.umlageschluessel === "Verteilung auf alle Wohneinheiten" || row.cost.umlageschluessel === "Verteilung nur auf aktive Wohneinheiten";
    const unitCells = unitColumns.map(w => {
      const occupants = tenantsByUnit[w.id] || [];
      let included = true;
      let value = 0;
      if (isUnitDistribution) {
        included = row.cost.umlageschluessel === "Verteilung auf alle Wohneinheiten" || w.status === "aktiv";
        value = row.unitAllocations && row.unitAllocations[w.id] ? num(row.unitAllocations[w.id]) : 0;
      } else {
        value = occupants.reduce((sum,t) => sum + num(row.allocations[t.originalIndex]), 0);
        included = occupants.length > 0 || Math.abs(value) > 0.005;
      }
      return '<td>' + (included ? fmtMoney(value) : "–") + '</td>';
    }).join("");
    const distributedCheck = num(row.allTenantSum) + num(row.ownerShare);
    const delta = num(row.cost.gesamtbetrag) - distributedCheck;
    const deltaCls = Math.abs(delta) > 0.02 ? "warn" : "ok";
    const unitTotalText = row.unitTotal ? fmtMoney(row.unitTotal) : "–";
    return '<tr><td>' + escapeHtml(row.cost.id) + '</td><td>' + escapeHtml(row.cost.kostenart) + '</td><td>' + escapeHtml(row.cost.berechnungsart || "") + '</td><td>' + escapeHtml(row.cost.umlageschluessel) + '</td><td>' + fmtMoney(row.cost.gesamtbetrag) + '</td><td>' + escapeHtml(basis.basis) + '</td><td>' + escapeHtml(basis.unit) + '</td><td>' + unitTotalText + '</td><td>' + fmtMoney(row.allTenantSum) + '</td><td>' + fmtMoney(row.tenantSum) + '</td><td>' + fmtMoney(row.privateShare) + '</td><td>' + fmtMoney(row.ownerShare) + '</td><td><span class="status ' + deltaCls + '">' + fmtMoney(delta) + '</span></td><td><span class="status ' + statusClass(row.status) + '">' + escapeHtml(row.status) + '</span></td>' + unitCells + '</tr>';
  }).join("");
  const costsTable = document.getElementById("umlageCostsTable");
  if (costsTable) {
    costsTable.innerHTML =
      '<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Berechnungsart</th><th>Umlageschlüssel</th><th>Gesamtbetrag</th><th>Umlagebasis</th><th>Betrag je Einheit / WE</th><th>Summe Wohneinheiten</th><th>Summe alle Mietparteien</th><th>Summe echte Mieter</th><th>Eigentümer/Privat</th><th>Nicht auf Mieter umgelegt</th><th>Differenz</th><th>Status</th>' + unitHeads + '</tr></thead><tbody>' + costRows + '</tbody>';
  }

  const proofTable=document.getElementById("umlageUnitProofTable");
  if (proofTable) {
    const costHeads=calc.activeCosts.map(k=>'<th>'+escapeHtml(k.id)+'<br><span class="small">'+escapeHtml(k.kostenart)+'</span></th>').join("");
    const proofRows=unitColumns.map(unit=>{
      const tenantRows=calc.tenants.filter(t=>String(t.wohnung||"")===String(unit.id||""));
      const cells=calc.costResults.map(row=>'<td class="readonly-cell">'+fmtMoney(tenantRows.reduce((sum,t)=>sum+num(row.allocations[t.originalIndex]),0))+'</td>').join("");
      const total=calc.costResults.reduce((sum,row)=>sum+tenantRows.reduce((a,t)=>a+num(row.allocations[t.originalIndex]),0),0);
      const roles=tenantRows.map(t=>isPrivateTenant(t)?"Eigentümer/Privat":(t.name||t.id)).join(", ") || "keine Zuordnung";
      return '<tr class="'+(tenantRows.some(isPrivateTenant)?'owner-private-row':'')+'"><td>'+unitIdCellHtml(unit)+'</td><td>'+escapeHtml(unit.bezeichnung||unit.lage||"")+'</td><td>'+escapeHtml(roles)+'</td>'+cells+'<td class="readonly-cell"><strong>'+fmtMoney(total)+'</strong></td></tr>';
    }).join("");
    proofTable.innerHTML='<thead><tr><th>Wohnungs-ID</th><th>Wohnung</th><th>Zuordnung</th>'+costHeads+'<th>Summe</th></tr></thead><tbody>'+proofRows+'</tbody>';
  }
}


function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
}

function addDaysIso(iso, days) {
  const d = iso ? new Date(iso + "T00:00:00") : new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
}

function dateDe(value) {
  if (!value) return "";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return escapeHtml(value);
  return d.toLocaleDateString("de-DE");
}


