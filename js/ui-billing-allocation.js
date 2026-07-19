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
  model.calculation.costResults.forEach(allocation => {
    const cost=allocation.cost || {};
    const costId=String(cost.id || "");
    const costName=cost.kostenart || "Kostenart";
    if (Math.abs(num(allocation.privateShare)) > 0.005) rows.push({
      id:"LANDLORD-PRIVATE-"+costId, kind:"private", area:"Privatanteil", description:costName+" · Eigentümer-/Privatfall",
      source:"Abrechnungsrolle Eigentümer/Privat", amount:num(allocation.privateShare), treatment:"Vermieter trägt – Privatanteil",
      status:"Geprüft", statusClass:"ok", targetTab:"mieterverwaltung", costId
    });
    if (Math.abs(num(allocation.vacancyShare)) > 0.005) rows.push({
      id:"LANDLORD-VACANCY-"+costId, kind:"vacancy", area:"Leerstandskosten", description:costName+" · leerstehende Wohnungen",
      source:"Abrechnungsfälle mit Rolle Leerstand", amount:num(allocation.vacancyShare), treatment:"Vermieter trägt – Leerstand",
      status:"Geprüft", statusClass:"ok", targetTab:"manuellewerte", costId
    });
    const intentional=billingResultCostTreatmentIsLandlord(cost) ? Math.max(0,num(allocation.ownerShare)-num(allocation.documentedOwnerShare)) : 0;
    if (intentional > 0.005) rows.push({
      id:"LANDLORD-NONALLOCABLE-"+costId, kind:"nonallocable", area:"Nicht umlagefähige Kosten", description:costName,
      source:"Behandlung der Kostenart unter Gesamtkosten", amount:intentional, treatment:"Vermieter trägt – nicht umlagefähig",
      status:"Geprüft", statusClass:"ok", targetTab:"einstellungen", costId
    });
  });
  const treatmentKinds={
    "landlord-private":"private",
    "landlord-vacancy":"vacancy",
    "landlord-non-allocable":"nonallocable",
    "landlord-other":"other"
  };
  model.differences.filter(row => row.status === NK_PRO_MODULES.billingReview.STATUS.LANDLORD).forEach(row => rows.push({
    id:"LANDLORD-DECISION-"+row.id, kind:treatmentKinds[row.record && row.record.treatment] || "other", area:row.area,
    description:row.description, source:row.source, amount:row.monetaryAmount,
    treatment:row.record && row.record.treatmentLabel || "Vermieter trägt – sonstiger Anteil",
    status:"Vermieter trägt", statusClass:"ok", differenceId:row.id, decisionRow:row, record:row.record
  }));
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
function billingResultDifferenceActions(row, readOnly) {
  const historyRow=row.isHistory===true;
  if (readOnly) return '<span class="billing-review-readonly">Nur ansehen</span>';
  if (historyRow || row.isResolved) return '<div class="billing-review-actions"><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openDetail",[row.id])+'>Details</button></div>';
  if ([NK_PRO_MODULES.billingReview.STATUS.OPEN,NK_PRO_MODULES.billingReview.STATUS.INVALID,NK_PRO_MODULES.billingReview.STATUS.IN_CORRECTION].includes(row.status)) {
    return '<div class="billing-review-actions"><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.markCorrection",[row.id])+'><span aria-hidden="true">✎</span> Korrigieren</button><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openAccept",[row.id])+'><span aria-hidden="true">✓</span> Akzeptieren</button></div>';
  }
  return '<div class="billing-review-actions"><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openDetail",[row.id])+'>Details</button><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openAccept",[row.id])+'>Ändern</button></div>';
}
function billingResultDifferenceTreatment(row) {
  if (row.status === NK_PRO_MODULES.billingReview.STATUS.IN_CORRECTION) return "Korrektur auf Ursprungsseite begonnen";
  if (row.status === NK_PRO_MODULES.billingReview.STATUS.INVALID) return (row.record && row.record.treatmentLabel ? row.record.treatmentLabel+" – ungültig" : "Erneute Prüfung erforderlich");
  if (row.status === NK_PRO_MODULES.billingReview.STATUS.RESOLVED) return "Durch Korrektur erledigt";
  return row.record && row.record.treatmentLabel || "Noch keine Entscheidung";
}
function billingResultDifferenceRow(row, readOnly) {
  const statusClass=billingReviewStatusClass(row.status);
  const historyRow=row.isHistory===true;
  const actions=billingResultDifferenceActions(row,readOnly);
  return '<tr data-review-id="'+escapeHtml(row.id)+'"'+(historyRow?' data-review-history="true"':'')+'><td><strong>'+escapeHtml(row.area)+'</strong>'+(historyRow?'<span class="billing-review-history-label">Prüfverlauf</span>':'')+'</td><td class="billing-review-description">'+escapeHtml(row.description)+'<span>'+escapeHtml(row.source || "–")+'</span></td><td class="billing-result-number">'+billingReviewFormat(row.calculatedValue,row.unit)+'</td><td class="billing-result-number">'+billingReviewFormat(row.controlValue,row.unit)+'</td><td class="billing-result-number"><strong>'+billingReviewFormat(row.difference,row.unit,true)+'</strong></td><td>'+escapeHtml(billingResultDifferenceTreatment(row))+'</td><td><span class="status '+statusClass+'">'+escapeHtml(row.label)+'</span></td><td>'+actions+'</td></tr>';
}
function billingResultLandlordRow(row, readOnly) {
  let action='<span class="billing-review-readonly">Nur ansehen</span>';
  if (row.differenceId) action='<div class="billing-review-actions"><button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openDetail",[row.differenceId])+'>Details</button>'+(readOnly?'':'<button class="secondary" type="button"'+billingReviewActionAttributes("billingReview.openAccept",[row.differenceId])+'>Ändern</button>')+'</div>';
  else if (!readOnly || row.targetTab) action='<button class="ui-button--icon" aria-label="Ursprungsseite öffnen" title="Ursprungsseite öffnen" type="button"'+billingReviewActionAttributes("navigation.switchTab",[row.targetTab || "umlage"])+'>↗</button>';
  return '<tr data-landlord-row="'+escapeHtml(row.id)+'"'+(row.differenceId?' data-review-id="'+escapeHtml(row.differenceId)+'"':'')+'><td><strong>'+escapeHtml(row.area)+'</strong></td><td class="billing-review-description">'+escapeHtml(row.description)+'<span>'+escapeHtml(row.source || "–")+'</span></td><td class="billing-result-number">'+fmtMoney(row.amount)+'</td><td class="billing-result-number">'+fmtMoney(row.amount)+'</td><td class="billing-result-number"><strong>'+fmtMoney(0)+'</strong></td><td>'+escapeHtml(row.treatment)+'</td><td><span class="status '+escapeHtml(row.statusClass || "ok")+'">'+escapeHtml(row.status)+'</span></td><td>'+action+'</td></tr>';
}
function billingResultResolvedRows(model) {
  const currentIds=new Set(model.differences.map(row => row.id));
  return Object.values(model.records || {}).filter(record => record && record.status === NK_PRO_MODULES.billingReview.STATUS.RESOLVED && !currentIds.has(record.differenceId)).map(record => ({
    id:record.differenceId || record.recordId || "", area:record.area || "Prüfbereich",
    description:"Ursprüngliche Differenz wurde durch eine Korrektur der Ursprungsdaten beseitigt.", source:"Korrektur auf der verursachenden Eingabeseite",
    calculatedValue:0, controlValue:0, difference:0, unit:record.unit || "€", status:NK_PRO_MODULES.billingReview.STATUS.RESOLVED,
    label:record.statusLabel || NK_PRO_MODULES.billingReview.statusLabel(NK_PRO_MODULES.billingReview.STATUS.RESOLVED), record, isResolved:true
  }));
}
function billingResultHistoryRows(model) {
  if (!billingResultUiState.showHistory) return [];
  return (model.history || []).slice(-30).reverse().map((record,index) => ({
    id:"HIST-"+(record.recordId || record.differenceId || index)+"-"+index, originalDifferenceId:record.differenceId || "",
    area:record.area || "Prüfverlauf", description:record.historyNote || record.treatmentLabel || "Dokumentierte Prüfentscheidung", source:"Historie",
    calculatedValue:record.originalDifference || 0, controlValue:0, difference:record.originalDifference || 0, unit:record.unit || "€",
    status:record.status || NK_PRO_MODULES.billingReview.STATUS.RESOLVED, label:record.statusLabel || NK_PRO_MODULES.billingReview.statusLabel(record.status), record, isHistory:true
  }));
}
function billingResultReviewGroup(title, tone, rows, readOnly, rowRenderer) {
  if (!rows.length) return "";
  return '<tr class="billing-review-group billing-review-group--'+tone+'"><th colspan="8">'+escapeHtml(title)+' <span>'+rows.length+'</span></th></tr>'+rows.map(row => rowRenderer(row,readOnly)).join("");
}
function billingResultLandlordBreakdown(model, landlordRows) {
  const totals={ private:0, vacancy:0, nonallocable:0, other:0 };
  landlordRows.forEach(row => { totals[row.kind] = num(totals[row.kind]) + num(row.amount); });
  const categorized=totals.private+totals.vacancy+totals.nonallocable+totals.other;
  const residual=num(model.summary.landlordTotal)-categorized;
  if (Math.abs(residual) > 0.005) totals.other += residual;
  totals.total=totals.private+totals.vacancy+totals.nonallocable+totals.other;
  return totals;
}
function billingResultLandlordSummaryHtml(model, landlordRows) {
  const totals=billingResultLandlordBreakdown(model,landlordRows);
  const open=model.summary.openCount>0;
  const term=(label,value,emphasis=false) => '<div class="billing-landlord-summary__term'+(emphasis?' is-total':'')+'"><span>'+escapeHtml(label)+'</span><strong>'+fmtMoney(value)+'</strong></div>';
  return '<section class="billing-landlord-summary__frame" aria-labelledby="billingLandlordVerifiedTitle"><header><h3 id="billingLandlordVerifiedTitle">Vom Vermieter nach Prüfung tatsächlich zu tragen</h3></header><div class="billing-landlord-summary__equation">'+
    term("Privatanteil",totals.private)+'<b>+</b>'+term("Leerstand",totals.vacancy)+'<b>+</b>'+term("Nicht umlagefähig",totals.nonallocable)+'<b>+</b>'+term("Sonstige bestätigte Anteile",totals.other)+'<b>=</b>'+term("Vom Vermieter tatsächlich zu tragen",totals.total,true)+
    '</div><footer class="billing-landlord-summary__status '+(open?'is-preliminary':'is-final')+'"><span aria-hidden="true">'+(open?'!':'✓')+'</span><strong>'+(open?'Vorläufiger Betrag – noch nicht alle Differenzen sind geprüft.':'Endgültiger Vermieteranteil nach vollständiger Prüfung.')+'</strong></footer></section>';
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
      return '<tr class="billing-result-vacancy-row"><td>'+String(row.index).padStart(2,"0")+'</td><td><strong>'+escapeHtml(item.caseRow.unitLabel || item.caseRow.unitId)+'</strong><span class="billing-result-subline">Leerstand</span></td><td>Leerstand</td><td class="billing-result-number">'+fmtMoney(item.costShare)+'</td><td class="billing-result-number">0,00 €</td><td class="billing-result-number">0,00 €</td><td class="billing-result-number">–</td><td><span class="status neutral">Leerstand</span></td><td><button class="ui-button--icon" aria-label="Mietverhältnisse öffnen" type="button"'+billingReviewActionAttributes("navigation.switchTab",["mieter"])+'>↗</button></td></tr>';
    }
    const result=row.result;
    const isPayment=result.balance>=0;
    return '<tr><td>'+String(row.index).padStart(2,"0")+'</td><td><strong>'+escapeHtml(result.tenant.wohnung || "–")+'</strong><span class="billing-result-subline">'+escapeHtml(result.tenant.name || result.tenant.id)+'</span></td><td>Wohnung</td><td class="billing-result-number">'+fmtMoney(result.costShare)+'</td><td class="billing-result-number">'+fmtMoney(result.prepayments)+'</td><td class="billing-result-number">'+fmtMoney(result.correction || 0)+'</td><td class="billing-result-number billing-result-balance '+(isPayment?'is-payment':'is-credit')+'"><strong>'+fmtMoney(Math.abs(result.balance))+'</strong><span>'+(isPayment?'Nachzahlung':'Guthaben')+'</span></td><td><span class="status ok">Abgerechnet</span></td><td><button class="ui-button--icon" aria-label="Mietverhältnis öffnen" type="button"'+billingReviewActionAttributes("navigation.switchTab",["mieter"])+'>↗</button></td></tr>';
  }).join("");
  const summaryTable=document.getElementById("umlageSummaryTable");
  if (summaryTable) summaryTable.innerHTML='<thead><tr><th>Nr.</th><th>Wohnung / Mieter</th><th>Nutzungsart</th><th class="billing-result-number">Kostenanteil</th><th class="billing-result-number">Vorauszahlungen</th><th class="billing-result-number">Korrekturen / Gutschriften</th><th class="billing-result-number">Ergebnis</th><th>Status</th><th>Aktionen</th></tr></thead><tbody>'+(tenantHtml || '<tr><td colspan="9">Keine passenden Abrechnungsfälle.</td></tr>')+'</tbody><tfoot><tr><td colspan="3">Summe Mieter</td><td class="billing-result-number">'+fmtMoney(summary.tenantShare)+'</td><td class="billing-result-number">'+fmtMoney(model.totals.prepayments)+'</td><td class="billing-result-number">'+fmtMoney(model.totals.corrections)+'</td><td class="billing-result-number">'+fmtMoney(Math.abs(model.totals.balance))+'</td><td colspan="2"></td></tr></tfoot>';
  const tenantFooter=document.getElementById("billingResultTenantFooter"); if (tenantFooter) tenantFooter.textContent=allResultRows.length+" von "+(tenantRows.length+vacancyRows.length)+" Einträgen";
  const searchInput=document.getElementById("billingResultSearch"); if (searchInput && searchInput.value!==billingResultUiState.tenantSearch) searchInput.value=billingResultUiState.tenantSearch;
  const tenantFilter=document.getElementById("billingResultStatusFilter"); if (tenantFilter) tenantFilter.value=billingResultUiState.tenantStatus;

  const landlordRows=billingResultLandlordRows(model);
  const currentDifferences=model.differences.slice();
  const resolvedRows=billingResultResolvedRows(model);
  const historyRows=billingResultHistoryRows(model);
  const filter=billingResultUiState.differenceStatus;
  const openRows=currentDifferences.filter(row => [NK_PRO_MODULES.billingReview.STATUS.OPEN,NK_PRO_MODULES.billingReview.STATUS.IN_CORRECTION].includes(row.status) && (filter!=="correction" || row.status===NK_PRO_MODULES.billingReview.STATUS.IN_CORRECTION));
  const acceptedRows=currentDifferences.filter(row => row.status===NK_PRO_MODULES.billingReview.STATUS.ACCEPTED);
  const invalidRows=currentDifferences.filter(row => row.status===NK_PRO_MODULES.billingReview.STATUS.INVALID);
  const visibleOpen=(filter==="all" || filter==="open" || filter==="correction") ? openRows : [];
  const visibleLandlord=(filter==="all" || filter==="landlord") ? landlordRows : [];
  const visibleAccepted=(filter==="all" || filter==="accepted") ? acceptedRows : [];
  const visibleResolved=(filter==="all" || filter==="resolved") ? resolvedRows : [];
  const visibleInvalid=(filter==="all" || filter==="invalid") ? invalidRows : [];
  const visibleHistory=filter==="all" ? historyRows : historyRows.filter(row => {
    if (filter==="accepted") return row.status===NK_PRO_MODULES.billingReview.STATUS.ACCEPTED;
    if (filter==="landlord") return row.status===NK_PRO_MODULES.billingReview.STATUS.LANDLORD;
    if (filter==="correction") return row.status===NK_PRO_MODULES.billingReview.STATUS.IN_CORRECTION;
    if (filter==="resolved") return row.status===NK_PRO_MODULES.billingReview.STATUS.RESOLVED;
    if (filter==="invalid") return row.status===NK_PRO_MODULES.billingReview.STATUS.INVALID;
    if (filter==="open") return [NK_PRO_MODULES.billingReview.STATUS.OPEN,NK_PRO_MODULES.billingReview.STATUS.IN_CORRECTION,NK_PRO_MODULES.billingReview.STATUS.INVALID].includes(row.status);
    return false;
  });
  const groupedRows=
    billingResultReviewGroup("Noch zu prüfen","open",visibleOpen,readOnly,billingResultDifferenceRow)+
    billingResultReviewGroup("Geprüft und dem Vermieter zugeordnet","landlord",visibleLandlord,readOnly,billingResultLandlordRow)+
    billingResultReviewGroup("Sonstige fachlich akzeptierte Differenzen","accepted",visibleAccepted,readOnly,billingResultDifferenceRow)+
    billingResultReviewGroup("Erledigt","resolved",visibleResolved,readOnly,billingResultDifferenceRow)+
    billingResultReviewGroup("Ungültig gewordene Entscheidungen","invalid",visibleInvalid,readOnly,billingResultDifferenceRow)+
    billingResultReviewGroup("Prüfverlauf","history",visibleHistory,readOnly,billingResultDifferenceRow);
  const reviewTable=document.getElementById("billingReviewTable");
  if (reviewTable) reviewTable.innerHTML='<thead><tr><th>Prüfbereich / Kostenart</th><th>Ursache / Datenquelle</th><th class="billing-result-number">Berechnet</th><th class="billing-result-number">Kontrollwert</th><th class="billing-result-number">Differenz</th><th>Behandlung / Vermieteranteil</th><th>Status</th><th>Aktionen</th></tr></thead><tbody>'+(groupedRows || '<tr><td colspan="8">Keine Einträge für diesen Filter.</td></tr>')+'</tbody>';
  const landlordSummary=document.getElementById("billingLandlordVerifiedSummary");
  if (landlordSummary) landlordSummary.innerHTML=billingResultLandlordSummaryHtml(model,landlordRows);
  const badge=document.getElementById("billingReviewOpenBadge"); if (badge) { badge.textContent=summary.openCount+" offen"; badge.className="billing-review-count "+(summary.openCount?"is-open":"is-complete"); }
  const reviewFilter=document.getElementById("billingReviewStatusFilter"); if (reviewFilter) reviewFilter.value=billingResultUiState.differenceStatus;
  const historyToggle=document.getElementById("billingReviewHistoryToggle"); if (historyToggle) historyToggle.textContent=billingResultUiState.showHistory?"Verlauf ausblenden":"Verlauf anzeigen";

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
  billingReviewCloseDetail();
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
function billingReviewOpenDetail(id) {
  const model=NK_PRO_MODULES.billingReview.currentModel(state);
  const currentRow=model.differences.find(item => item.id===id);
  const resolvedRow=billingResultResolvedRows(model).find(item => item.id===id);
  const historyRow=billingResultHistoryRows(model).find(item => item.id===id);
  const row=currentRow || resolvedRow || historyRow;
  const decisionId=row && row.originalDifferenceId || id;
  const record=row && row.record || (model.records && model.records[decisionId]);
  if (!record) throw new Error("Für diese Prüfentscheidung sind keine Details vorhanden.");
  billingResultUiState.selectedDifferenceId=decisionId;
  const dialog=document.getElementById("billingReviewDetailDialog");
  const body=document.getElementById("billingReviewDetailBody");
  const editButton=document.getElementById("billingReviewDetailEditButton");
  const canChange=!!currentRow && !((typeof isArchiveViewer === "function" && isArchiveViewer()) || (NK_PRO_MODULES.billingContext && NK_PRO_MODULES.billingContext.isReadOnly()));
  const rowStatus=row && row.status || record.status;
  const status=record.statusLabel || row && row.label || NK_PRO_MODULES.billingReview.statusLabel(rowStatus);
  const acceptedAt=record.acceptedAt ? new Date(record.acceptedAt).toLocaleString("de-DE") : "–";
  const invalidatedAt=(record.invalidatedAt || record.invalidatedAcceptanceAt) ? new Date(record.invalidatedAt || record.invalidatedAcceptanceAt).toLocaleString("de-DE") : "–";
  const source=row && row.source || record.source || "–";
  const description=row && row.description || record.description || "–";
  const unit=row && row.unit || record.currentUnit || record.unit || "€";
  const calculatedValue=row ? row.calculatedValue : num(record.currentDifference || record.originalDifference);
  const controlValue=row ? row.controlValue : 0;
  const differenceValue=row ? row.difference : num(record.currentDifference !== undefined ? record.currentDifference : record.originalDifference);
  const treatmentLabel=record.treatmentLabel || (rowStatus===NK_PRO_MODULES.billingReview.STATUS.RESOLVED ? "Durch Korrektur erledigt" : "–");
  const invalidationHint=record.invalidationReason || (rowStatus===NK_PRO_MODULES.billingReview.STATUS.INVALID ? "Zugrunde liegende Daten oder Berechnung haben sich geändert; eine erneute bewusste Prüfung ist erforderlich." : "–");
  body.innerHTML='<div class="billing-review-detail-summary"><strong>'+escapeHtml(record.area || row && row.area || "Differenz")+'</strong><span>'+escapeHtml(description)+'</span><span>'+escapeHtml(source)+'</span><b class="status '+billingReviewStatusClass(rowStatus)+'">'+escapeHtml(status || "–")+'</b></div><dl class="billing-review-detail-grid">'+
    '<div><dt>Berechneter Wert</dt><dd class="billing-result-number">'+billingReviewFormat(calculatedValue,unit)+'</dd></div><div><dt>Kontrollwert</dt><dd class="billing-result-number">'+billingReviewFormat(controlValue,unit)+'</dd></div>'+
    '<div><dt>Differenz</dt><dd class="billing-result-number">'+billingReviewFormat(differenceValue,unit,true)+'</dd></div><div><dt>Einheit</dt><dd>'+escapeHtml(unit || "–")+'</dd></div>'+
    '<div><dt>Aktueller Prüfstatus</dt><dd>'+escapeHtml(status || "–")+'</dd></div><div><dt>Behandlung</dt><dd>'+escapeHtml(treatmentLabel)+'</dd></div>'+
    '<div class="billing-review-detail-grid__wide"><dt>Begründung</dt><dd>'+escapeHtml(record.reason || "–")+'</dd></div>'+
    '<div><dt>Bestätigt von</dt><dd>'+escapeHtml(record.acceptedBy || "–")+'</dd></div><div><dt>Bestätigt am</dt><dd>'+escapeHtml(acceptedAt)+'</dd></div>'+
    '<div><dt>Ungültig seit</dt><dd>'+escapeHtml(invalidatedAt)+'</dd></div><div><dt>App-Version</dt><dd>'+escapeHtml(record.appVersion || "–")+'</dd></div>'+
    '<div class="billing-review-detail-grid__wide"><dt>Hinweis</dt><dd>'+escapeHtml(invalidationHint)+'</dd></div>'+
    '<div class="billing-review-detail-grid__wide"><dt>Prüfkennung</dt><dd>'+escapeHtml(record.differenceId || decisionId)+'</dd></div></dl>';
  if (editButton) {
    editButton.hidden=!canChange;
    editButton.onclick=canChange ? () => billingReviewOpenAccept(decisionId) : null;
  }
  if (dialog && typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  setTimeout(() => { const close=dialog && dialog.querySelector('[data-ui-action="billingReview.closeDetail"]'); if (close) close.focus(); },0);
}
function billingReviewCloseDetail() { const dialog=document.getElementById("billingReviewDetailDialog"); if (dialog && dialog.open) dialog.close(); }
function billingReviewReopen(id) { billingReviewCloseDetail(); NK_PRO_MODULES.applicationActions.execute("review","reopen",[id]); billingResultUiState.selectedDifferenceId=""; renderUmlage(); }


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


