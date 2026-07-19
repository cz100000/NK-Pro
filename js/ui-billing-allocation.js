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
const billingResultUiState = { tenantSearch:"", tenantStatus:"all", differenceStatus:"all", showHistory:false, selectedDifferenceId:"" };

function billingReviewActionAttributes(action, args = []) {
  return NK_PRO_MODULES.uiEvents.attributes(action, args);
}
function billingReviewStatusClass(status) {
  const reviewStatus = NK_PRO_MODULES.billingReview.STATUS;
  if (status === reviewStatus.ACCEPTED || status === reviewStatus.LANDLORD || status === reviewStatus.RESOLVED) return "ok";
  if (status === reviewStatus.IN_CORRECTION) return "neutral";
  return "warn";
}
function billingReviewFormat(value, unit, absolute = false) {
  const amount = absolute ? Math.abs(num(value)) : num(value);
  if (unit === "€") return fmtMoney(amount);
  return amount.toLocaleString("de-DE", { minimumFractionDigits:2, maximumFractionDigits:3 }) + " " + escapeHtml(unit || "");
}
function billingResultIcon(name) {
  const paths = {
    costs:'<path d="M7 3h10v3H7zM6 6h12v15H6zM9 10h6M9 14h6M9 18h4"/>',
    tenants:'<path d="M16 20v-2.1a4.1 4.1 0 0 0-4.1-4.1H6.1A4.1 4.1 0 0 0 2 17.9V20M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2a4 4 0 0 0-3-3.8M16.5 2.2a4 4 0 0 1 0 7.6"/>',
    landlord:'<path d="M3 11.5 12 4l9 7.5M5 10v11h14V10M9 21v-7h6v7"/>',
    review:'<path d="M12 3v18M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7Z"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name] || paths.costs)+'</svg>';
}
function billingResultCostTreatmentIsLandlord(cost) {
  return String(cost && cost.ausschlussBehandlung || "") === "Nicht umlagefähig / Eigentümeranteil";
}
function billingResultLandlordRows(model) {
  const rows=[];
  model.calculation.costResults.forEach(row => {
    const cost=row.cost || {};
    if (Math.abs(num(row.privateShare)) > 0.005) rows.push({ category:"Privatanteil", description:(cost.kostenart || "Kostenart")+" · Eigentümer-/Privatfall", amount:num(row.privateShare), treatment:"Vermieter trägt – Privatanteil", status:"Geprüft", costId:cost.id || "" });
    if (Math.abs(num(row.vacancyShare)) > 0.005) rows.push({ category:"Leerstandskosten", description:(cost.kostenart || "Kostenart")+" · leerstehende Wohnungen", amount:num(row.vacancyShare), treatment:"Vermieter trägt – Leerstand", status:"Geprüft", costId:cost.id || "" });
    const intentional = billingResultCostTreatmentIsLandlord(cost) ? Math.max(0, num(row.ownerShare)-num(row.documentedOwnerShare)) : 0;
    if (intentional > 0.005) rows.push({ category:"Nicht umlagefähige Kosten", description:cost.kostenart || "Kostenart", amount:intentional, treatment:"Vermieter trägt – nicht umlagefähig", status:"Geprüft", costId:cost.id || "" });
  });
  model.differences.filter(row => row.status === NK_PRO_MODULES.billingReview.STATUS.LANDLORD).forEach(row => rows.push({ category:"Bestätigter Vermieteranteil", description:row.area+" · "+row.description, amount:row.monetaryAmount, treatment:row.record && row.record.treatmentLabel || "Vermieter trägt", status:"Vermieter trägt", differenceId:row.id }));
  return rows;
}
function billingResultVacancyRows(model) {
  const individual=NK_PRO_MODULES.billingCalculation.individualValuePageModel(state);
  const vacancyCases=(individual.cases || []).filter(row => row.role === "vacancy");
  return vacancyCases.map(caseRow => {
    const costShare=(individual.manualCosts || []).reduce((sum,summary) => {
      const item=(summary.rows || []).find(row => row.caseKey === caseRow.caseKey);
      return sum + num(item && item.amount);
    },0);
    return { caseRow, costShare };
  }).filter(row => Math.abs(row.costShare) > 0.005 || String(row.caseRow.unitStatus || "") === "inaktiv");
}
function billingResultKpiHtml(label, value, icon, tone, detail) {
  return '<article class="billing-result-kpi billing-result-kpi--'+tone+'"><span class="billing-result-kpi__icon">'+billingResultIcon(icon)+'</span><div><span class="billing-result-kpi__label">'+escapeHtml(label)+'</span><strong>'+escapeHtml(value)+'</strong>'+(detail?'<span class="billing-result-kpi__detail">'+escapeHtml(detail)+'</span>':'')+'</div></article>';
}
function billingResultDifferenceRow(row, readOnly) {
  const statusClass=billingReviewStatusClass(row.status);
  const historyRow=row.isHistory===true;
  let actions='';
  if (readOnly) actions='<span class="billing-review-readonly">Nur ansehen</span>';
  else if (historyRow) actions='<div class="billing-review-actions"><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openDetail",[row.id])+'>Details</button></div>';
  else if ([NK_PRO_MODULES.billingReview.STATUS.OPEN,NK_PRO_MODULES.billingReview.STATUS.INVALID,NK_PRO_MODULES.billingReview.STATUS.IN_CORRECTION].includes(row.status)) {
    actions='<div class="billing-review-actions"><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.markCorrection",[row.id])+'><span aria-hidden="true">✎</span> Korrigieren</button><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openAccept",[row.id])+'><span aria-hidden="true">✓</span> Akzeptieren</button></div>';
  } else {
    actions='<div class="billing-review-actions"><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openDetail",[row.id])+'>Details</button><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openAccept",[row.id])+'>Ändern</button></div>';
  }
  return '<tr data-review-id="'+escapeHtml(row.id)+'"'+(historyRow?' data-review-history="true"':'')+'><td>'+escapeHtml(row.area)+(historyRow?'<span class="billing-review-history-label">Prüfverlauf</span>':'')+'</td><td class="billing-review-description">'+escapeHtml(row.description)+'<span>'+escapeHtml(row.source)+'</span></td><td>'+billingReviewFormat(row.calculatedValue,row.unit)+'</td><td>'+billingReviewFormat(row.controlValue,row.unit)+'</td><td><strong>'+billingReviewFormat(row.difference,row.unit,true)+'</strong></td><td>'+escapeHtml(row.unit || "–")+'</td><td><span class="status '+statusClass+'">'+escapeHtml(row.label)+'</span></td><td>'+escapeHtml(row.record && row.record.reason || "–")+'</td><td>'+actions+'</td></tr>';
}
function billingResultHistoryRows(model) {
  if (!billingResultUiState.showHistory) return [];
  const currentIds=new Set(model.differences.map(row => row.id));
  return Object.values(model.records || {}).filter(record => record && !currentIds.has(record.differenceId)).concat(model.history || []).slice(-30).reverse().map(record => ({
    id:record.differenceId || record.recordId || "", area:record.area || "Prüfverlauf", description:record.historyNote || record.treatmentLabel || "Dokumentierte Prüfentscheidung", source:"Historie", calculatedValue:record.originalDifference || 0, controlValue:0, difference:record.originalDifference || 0, unit:record.unit || "€", status:record.status || NK_PRO_MODULES.billingReview.STATUS.RESOLVED, label:record.statusLabel || NK_PRO_MODULES.billingReview.statusLabel(record.status), record, isHistory:true
  }));
}
function renderUmlage() {
  const model=NK_PRO_MODULES.billingReview.currentModel(state);
  const calc=model.calculation;
  const summary=model.summary;
  const readOnly=(typeof isArchiveViewer === "function" && isArchiveViewer()) || (NK_PRO_MODULES.billingContext && NK_PRO_MODULES.billingContext.isReadOnly());
  if (typeof renderOverviewForTab === "function") renderOverviewForTab("umlage");

  const kpis=document.getElementById("billingResultKpis");
  if (kpis) kpis.innerHTML=
    billingResultKpiHtml("Gesamtkosten",fmtMoney(summary.totalCosts),"costs","blue","Alle aktiven Kostenarten")+
    billingResultKpiHtml("Auf Mieter umgelegt",fmtMoney(summary.tenantShare),"tenants","green",calc.tenantResults.length+" Mieterabrechnungen")+
    billingResultKpiHtml("Vom Vermieter zu tragen",fmtMoney(summary.landlordTotal),"landlord","orange","Privat, Leerstand und bestätigte Anteile")+
    billingResultKpiHtml("Noch zu klären",fmtMoney(summary.openAmount),"review","purple",summary.openCount+" Differenz"+(summary.openCount===1?"":"en")+" offen");

  const search=billingResultUiState.tenantSearch.toLocaleLowerCase("de");
  const tenantRows=calc.tenantResults.map((result,index) => ({ type:result.balance>=0?"nachzahlung":"guthaben", index:index+1, result, search:[result.tenant.id,result.tenant.wohnung,result.tenant.name].join(" ").toLocaleLowerCase("de") }));
  const vacancyRows=billingResultVacancyRows(model).map((entry,index) => ({ type:"leerstand", index:tenantRows.length+index+1, entry, search:[entry.caseRow.unitId,entry.caseRow.label,"Leerstand"].join(" ").toLocaleLowerCase("de") }));
  const allResultRows=tenantRows.concat(vacancyRows).filter(row => (!search || row.search.includes(search)) && (billingResultUiState.tenantStatus==="all" || row.type===billingResultUiState.tenantStatus));
  const tenantHtml=allResultRows.map(row => {
    if (row.type === "leerstand") {
      const item=row.entry;
      return '<tr class="billing-result-vacancy-row"><td>'+String(row.index).padStart(2,"0")+'</td><td><strong>'+escapeHtml(item.caseRow.unitLabel || item.caseRow.unitId)+'</strong><span class="billing-result-subline">Leerstand</span></td><td>Leerstand</td><td>'+fmtMoney(item.costShare)+'</td><td>0,00 €</td><td>0,00 €</td><td>–</td><td><span class="status neutral">Leerstand</span></td><td><button class="ui-button--icon" aria-label="Mietverhältnisse öffnen" type="button"'+billingReviewActionAttributes("navigation.switchTab",["mieter"])+'>↗</button></td></tr>';
    }
    const result=row.result;
    const isPayment=result.balance>=0;
    return '<tr><td>'+String(row.index).padStart(2,"0")+'</td><td><strong>'+escapeHtml(result.tenant.wohnung || "–")+'</strong><span class="billing-result-subline">'+escapeHtml(result.tenant.name || result.tenant.id)+'</span></td><td>Wohnung</td><td>'+fmtMoney(result.costShare)+'</td><td>'+fmtMoney(result.prepayments)+'</td><td>'+fmtMoney(result.correction || 0)+'</td><td class="billing-result-balance '+(isPayment?'is-payment':'is-credit')+'"><strong>'+fmtMoney(Math.abs(result.balance))+'</strong><span>'+(isPayment?'Nachzahlung':'Guthaben')+'</span></td><td><span class="status ok">Abgerechnet</span></td><td><button class="ui-button--icon" aria-label="Mietverhältnis öffnen" type="button"'+billingReviewActionAttributes("navigation.switchTab",["mieter"])+'>↗</button></td></tr>';
  }).join("");
  const summaryTable=document.getElementById("umlageSummaryTable");
  if (summaryTable) summaryTable.innerHTML='<thead><tr><th>Nr.</th><th>Wohnung / Mieter</th><th>Nutzungsart</th><th>Kostenanteil</th><th>Vorauszahlungen</th><th>Korrekturen / Gutschriften</th><th>Ergebnis</th><th>Status</th><th>Aktionen</th></tr></thead><tbody>'+(tenantHtml || '<tr><td colspan="9">Keine passenden Abrechnungsfälle.</td></tr>')+'</tbody><tfoot><tr><td colspan="3">Summe Mieter</td><td>'+fmtMoney(summary.tenantShare)+'</td><td>'+fmtMoney(model.totals.prepayments)+'</td><td>'+fmtMoney(model.totals.corrections)+'</td><td>'+fmtMoney(Math.abs(model.totals.balance))+'</td><td colspan="2"></td></tr></tfoot>';
  const tenantFooter=document.getElementById("billingResultTenantFooter"); if (tenantFooter) tenantFooter.textContent=allResultRows.length+" von "+(tenantRows.length+vacancyRows.length)+" Einträgen";
  const searchInput=document.getElementById("billingResultSearch"); if (searchInput && searchInput.value!==billingResultUiState.tenantSearch) searchInput.value=billingResultUiState.tenantSearch;
  const tenantFilter=document.getElementById("billingResultStatusFilter"); if (tenantFilter) tenantFilter.value=billingResultUiState.tenantStatus;

  const landlordRows=billingResultLandlordRows(model);
  const landlordTable=document.getElementById("billingResultLandlordTable");
  if (landlordTable) landlordTable.innerHTML='<thead><tr><th>Kategorie</th><th>Beschreibung</th><th>Betrag</th><th>Behandlung</th><th>Status</th><th>Aktionen</th></tr></thead><tbody>'+(landlordRows.map(row => '<tr><td><strong>'+escapeHtml(row.category)+'</strong></td><td>'+escapeHtml(row.description)+'</td><td>'+fmtMoney(row.amount)+'</td><td><span class="billing-result-treatment">'+escapeHtml(row.treatment)+'</span></td><td><span class="status ok">'+escapeHtml(row.status)+'</span></td><td>'+(row.differenceId?'<button class="ui-button--icon" aria-label="Prüfdetails öffnen" type="button"'+billingReviewActionAttributes("billingReview.openDetail",[row.differenceId])+'>◉</button>':'<button class="ui-button--icon" aria-label="Individuelle Werte öffnen" type="button"'+billingReviewActionAttributes("navigation.switchTab",["manuellewerte"])+'>◉</button>')+'</td></tr>').join("") || '<tr><td colspan="6">Keine Vermieteranteile vorhanden.</td></tr>')+'</tbody><tfoot><tr><td colspan="2">Summe vom Vermieter zu tragen</td><td>'+fmtMoney(summary.landlordTotal)+'</td><td colspan="3"></td></tr></tfoot>';
  const landlordFooter=document.getElementById("billingResultLandlordFooter"); if (landlordFooter) landlordFooter.textContent=landlordRows.length+" Einträge · alle Beträge mit Ursache und Behandlung";

  const allDifferences=model.differences.concat(billingResultHistoryRows(model));
  const filteredDifferences=allDifferences.filter(row => {
    const status=row.status;
    if (billingResultUiState.differenceStatus==="all") return true;
    if (billingResultUiState.differenceStatus==="open") return [NK_PRO_MODULES.billingReview.STATUS.OPEN,NK_PRO_MODULES.billingReview.STATUS.INVALID].includes(status);
    if (billingResultUiState.differenceStatus==="accepted") return status===NK_PRO_MODULES.billingReview.STATUS.ACCEPTED;
    if (billingResultUiState.differenceStatus==="landlord") return status===NK_PRO_MODULES.billingReview.STATUS.LANDLORD;
    if (billingResultUiState.differenceStatus==="correction") return status===NK_PRO_MODULES.billingReview.STATUS.IN_CORRECTION;
    return true;
  });
  const reviewTable=document.getElementById("billingReviewTable");
  if (reviewTable) reviewTable.innerHTML='<thead><tr><th>Bereich / Kostenart</th><th>Beschreibung / Datenquelle</th><th>Berechneter Wert</th><th>Kontrollwert</th><th>Differenz</th><th>Einheit</th><th>Status</th><th>Begründung</th><th>Aktionen</th></tr></thead><tbody>'+(filteredDifferences.map(row => billingResultDifferenceRow(row,readOnly)).join("") || '<tr><td colspan="9">Keine Differenzen für diesen Filter.</td></tr>')+'</tbody>';
  const badge=document.getElementById("billingReviewOpenBadge"); if (badge) { badge.textContent=summary.openCount+" offen"; badge.className="billing-review-count "+(summary.openCount?"is-open":"is-complete"); }
  const reviewFilter=document.getElementById("billingReviewStatusFilter"); if (reviewFilter) reviewFilter.value=billingResultUiState.differenceStatus;
  const historyToggle=document.getElementById("billingReviewHistoryToggle"); if (historyToggle) historyToggle.textContent=billingResultUiState.showHistory?"Verlauf ausblenden":"Verlauf anzeigen";
  renderBillingReviewDetail(model);

  const equation=document.getElementById("billingControlEquation");
  if (equation) equation.innerHTML=
    '<div class="billing-control-term is-total"><span>Gesamtkosten</span><strong>'+fmtMoney(summary.totalCosts)+'</strong></div><b>=</b>'+
    '<div class="billing-control-term is-tenants"><span>Auf Mieter umgelegt</span><strong>'+fmtMoney(summary.tenantShare)+'</strong></div><b>+</b>'+
    '<div class="billing-control-term is-landlord"><span>Vom Vermieter zu tragen</span><strong>'+fmtMoney(summary.landlordTotal)+'</strong></div><b>+</b>'+
    '<div class="billing-control-term"><span>Akzeptierte Differenzen</span><strong>'+fmtMoney(summary.acceptedOther)+'</strong></div><b>+</b>'+
    '<div class="billing-control-term is-open"><span>Noch zu klären</span><strong>'+fmtMoney(summary.openAmount)+'</strong></div><b>=</b>'+
    '<div class="billing-control-term is-balance"><span>Abgleich-Saldo</span><strong>'+fmtMoney(summary.balance)+'</strong><em>'+(Math.abs(summary.balance)<=0.01?'Abgleich stimmt':'Abgleich prüfen')+'</em></div>';

  const overall=document.getElementById("billingResultOverallStatus");
  if (overall) overall.innerHTML=summary.openCount?'<div class="billing-overall-status is-open"><strong>Die Abrechnung ist noch nicht vollständig geprüft.</strong><p>Es bestehen '+summary.openCount+' offene Differenz'+(summary.openCount===1?'':'en')+' in Höhe von '+fmtMoney(summary.openAmount)+'.</p><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.focusOpen")+'>Zu den offenen Differenzen</button></div>':'<div class="billing-overall-status is-complete"><strong>Alle Differenzen geprüft.</strong><p>Alle Abweichungen wurden korrigiert oder bewusst und nachvollziehbar akzeptiert.</p></div>';
  const next=document.getElementById("billingResultNextSteps");
  if (next) next.innerHTML='<ol class="billing-result-next-list"><li class="'+(summary.openCount?'is-current':'is-done')+'">Offene Differenzen prüfen und korrigieren oder akzeptieren.</li><li class="'+(!summary.openCount?'is-current':'')+'">Ergebnis prüfen und Abrechnung abschließen.</li><li>Abrechnungsschreiben erstellen und versenden.</li></ol>';
}

function billingReviewSetSearch(value) { billingResultUiState.tenantSearch=String(value || ""); renderUmlage(); }
function billingReviewSetTenantStatus(value) { billingResultUiState.tenantStatus=String(value || "all"); renderUmlage(); }
function billingReviewSetDifferenceStatus(value) { billingResultUiState.differenceStatus=String(value || "all"); renderUmlage(); }
function billingReviewToggleHistory() { billingResultUiState.showHistory=!billingResultUiState.showHistory; renderUmlage(); }
function billingReviewFocusOpen() { billingResultUiState.differenceStatus="open"; renderUmlage(); const target=document.getElementById("billingReviewTitle"); if (target) target.scrollIntoView({behavior:"smooth",block:"start"}); }
function billingReviewMarkCorrection(id) {
  const execution=NK_PRO_MODULES.applicationActions.execute("review","markCorrection",[id]);
  const result=execution && Object.prototype.hasOwnProperty.call(execution,"value") ? execution.value : execution;
  if (!result || !result.targetTab) return;
  switchToTab(result.targetTab);
  setTimeout(() => {
    const target=result.targetSelector ? document.querySelector('#'+CSS.escape(result.targetTab)+' '+result.targetSelector) : document.getElementById(result.targetTab);
    if (!target) return;
    target.classList.add("billing-review-target-flash");
    target.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(() => target.classList.remove("billing-review-target-flash"),2400);
  },80);
}
function billingReviewOpenAccept(id) {
  const model=NK_PRO_MODULES.billingReview.currentModel(state);
  const row=model.differences.find(item => item.id===id);
  if (!row) throw new Error("Die Differenz ist nicht mehr vorhanden.");
  const dialog=document.getElementById("billingReviewAcceptDialog");
  const select=document.getElementById("billingReviewTreatment");
  const record=row.record || {};
  select.innerHTML='<option value="">Bitte auswählen …</option>'+NK_PRO_MODULES.billingReview.TREATMENTS.map(item => '<option value="'+escapeHtml(item.value)+'">'+escapeHtml(item.label)+'</option>').join("");
  select.value=record.treatment || "";
  document.getElementById("billingReviewAcceptId").value=id;
  document.getElementById("billingReviewAcceptSummary").innerHTML='<strong>'+escapeHtml(row.area)+'</strong><span>'+escapeHtml(row.description)+'</span><b>'+billingReviewFormat(row.difference,row.unit,true)+' Differenz</b>';
  document.getElementById("billingReviewReason").value=record.reason || "";
  document.getElementById("billingReviewAcceptedBy").value=record.acceptedBy || (state.meta && state.meta.lastReviewUser) || "";
  document.getElementById("billingReviewConfirmed").checked=false;
  const error=document.getElementById("billingReviewDialogError"); error.hidden=true; error.textContent="";
  if (dialog && typeof dialog.showModal === "function") dialog.showModal();
  setTimeout(() => select.focus(),0);
}
function billingReviewCloseAccept() { const dialog=document.getElementById("billingReviewAcceptDialog"); if (dialog && dialog.open) dialog.close(); }
function billingReviewSaveAcceptance() {
  const id=document.getElementById("billingReviewAcceptId").value;
  const payload={ treatment:document.getElementById("billingReviewTreatment").value, reason:document.getElementById("billingReviewReason").value, acceptedBy:document.getElementById("billingReviewAcceptedBy").value, confirmed:document.getElementById("billingReviewConfirmed").checked };
  const error=document.getElementById("billingReviewDialogError");
  try {
    NK_PRO_MODULES.applicationActions.execute("review","accept",[id,payload]);
    billingResultUiState.selectedDifferenceId=id;
    billingReviewCloseAccept();
    renderUmlage();
  } catch (failure) {
    error.textContent=errorMessage(failure); error.hidden=false; document.getElementById("billingReviewReason").focus();
  }
}
function billingReviewOpenDetail(id) { billingResultUiState.selectedDifferenceId=id; renderUmlage(); const detail=document.getElementById("billingReviewDetail"); if (detail) detail.scrollIntoView({behavior:"smooth",block:"nearest"}); }
function billingReviewReopen(id) { NK_PRO_MODULES.applicationActions.execute("review","reopen",[id]); billingResultUiState.selectedDifferenceId=""; renderUmlage(); }
function renderBillingReviewDetail(model) {
  const detail=document.getElementById("billingReviewDetail"); if (!detail) return;
  const id=billingResultUiState.selectedDifferenceId;
  const row=model.differences.find(item => item.id===id);
  const record=row && row.record || (model.records && model.records[id]);
  if (!record) { detail.hidden=true; detail.innerHTML=""; return; }
  detail.hidden=false;
  const canChange=!!row && !((typeof isArchiveViewer === "function" && isArchiveViewer()) || (NK_PRO_MODULES.billingContext && NK_PRO_MODULES.billingContext.isReadOnly()));
  detail.innerHTML='<header><div><strong>Prüfentscheidung – Details</strong><span>'+escapeHtml(record.area || row && row.area || "Differenz")+'</span></div>'+(canChange?'<button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openAccept",[id])+'>Ändern</button>':'')+'</header><dl><div><dt>Differenz</dt><dd>'+billingReviewFormat(record.originalDifference,record.unit,true)+'</dd></div><div><dt>Behandlung</dt><dd>'+escapeHtml(record.treatmentLabel || "–")+'</dd></div><div><dt>Begründung</dt><dd>'+escapeHtml(record.reason || "–")+'</dd></div><div><dt>Akzeptiert von</dt><dd>'+escapeHtml(record.acceptedBy || "–")+'</dd></div><div><dt>Akzeptiert am</dt><dd>'+escapeHtml(record.acceptedAt ? new Date(record.acceptedAt).toLocaleString("de-DE") : "–")+'</dd></div><div><dt>App-Version</dt><dd>'+escapeHtml(record.appVersion || "–")+'</dd></div></dl>';
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


