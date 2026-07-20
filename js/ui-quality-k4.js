"use strict";

// AP22F11B Korrektur 4: konsolidierte fallbezogene Prüfung und vollständiges produktives Regelinventar.

function qualityStatusClass(status) {
  if (status === "Kritischer Abrechnungsmangel" || status === "Technischer Fehler") return "err";
  if (status === "Entscheidung erforderlich" || status === "Noch nicht ausgeführt") return "warn";
  if (status === "Hinweis") return "info";
  if (status === "Bestanden") return "ok";
  return "neutral";
}

function qualityK4Icon(kind) {
  const paths = {
    critical:'<path d="M12 3 2.8 19h18.4L12 3Z"></path><path d="M12 9v4M12 16h.01"></path>',
    decision:'<circle cx="12" cy="12" r="9"></circle><path d="M9.5 9a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1.9-1.1 1.6M12 17h.01"></path>',
    hint:'<circle cx="12" cy="12" r="9"></circle><path d="M12 10v6M12 7h.01"></path>',
    passed:'<circle cx="12" cy="12" r="9"></circle><path d="m8.5 12 2.2 2.2 4.8-5.4"></path>',
    rules:'<path d="M5 4h14v16H5z"></path><path d="M8 8h8M8 12h8M8 16h5"></path>',
    checks:'<path d="M5 4h14v16H5z"></path><path d="m8 9 1.5 1.5L12 8M13.5 10H16M8 15l1.5 1.5L12 14M13.5 16H16"></path>',
    validation:'<path d="M12 3 4 6v6c0 5 3.3 8 8 10 4.7-2 8-5 8-10V6l-8-3Z"></path><path d="M9 12h6M12 9v6"></path>',
    completion:'<path d="M6 3h9l3 3v15H6z"></path><path d="M15 3v4h4M9 12l2 2 4-5"></path>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[kind]||paths.rules)+'</svg>';
}

function qualityK4Report() {
  qualityLastReport = null;
  return qualityReport(true);
}

function qualityK4FilterRows(rows, filter) {
  const mode = filter === "open" ? "all" : (filter || "all");
  if (mode === "blocked") return rows.filter(row => row.status === "Kritischer Abrechnungsmangel");
  if (mode === "review") return rows.filter(row => row.status === "Entscheidung erforderlich");
  if (mode === "hints") return rows.filter(row => row.status === "Hinweis");
  if (mode === "done") return rows.filter(row => row.status === "Bestanden");
  if (mode === "notApplicable") return rows.filter(row => row.status === "Nicht anwendbar");
  if (mode === "notExecuted") return rows.filter(row => row.status === "Noch nicht ausgeführt");
  return rows;
}

function qualityK4DecisionText(row) {
  if (row.decisionSource === "billing-review") {
    if (!row.decision) return '<span class="quality-decision-empty">Noch keine Entscheidung</span>';
    const label = row.decision.treatmentLabel || row.decision.label || "Noch keine Entscheidung";
    const reason = row.decision.reason ? '<small>'+escapeHtml(row.decision.reason)+'</small>' : '';
    return '<span class="quality-decision-record"><strong>'+escapeHtml(label)+'</strong>'+reason+'</span>';
  }
  if (row.confirmation || row.decision) {
    const decision = row.decision || {};
    const mode = decision.mode || row.confirmation && row.confirmation.mode || "confirmed";
    const label = mode === "not-applicable" ? "Nicht anwendbar entschieden" : (mode === "read" ? "Zur Kenntnis genommen" : "Fachlich bestätigt");
    const reason = decision.reason || row.confirmation && row.confirmation.reason || "";
    return '<span class="quality-decision-record"><strong>'+escapeHtml(label)+'</strong>'+(reason?'<small>'+escapeHtml(reason)+'</small>':'')+'</span>';
  }
  return '<span class="quality-decision-empty">–</span>';
}

function qualityK4Button(label, action, args, cls, title) {
  return '<button type="button" class="ui-button nk-ui-button '+(cls||'ui-button--quiet ui-button--compact')+'"'+uiActionAttributes(action,args||[])+(title?' title="'+escapeHtml(title)+'"':'')+'>'+escapeHtml(label)+'</button>';
}

function qualityK4Actions(row) {
  const buttons=[];
  const encoded=qualityEncoded(row.instanceId);
  const ruleEncoded=qualityEncoded("RULE:"+row.ruleId);
  const writable=!qualityIsReadOnly();
  if (["Kritischer Abrechnungsmangel","Entscheidung erforderlich"].includes(row.status) && row.targetTab && row.targetTab !== "qualitaet") {
    if (row.decisionSource === "billing-review" && writable) buttons.push(qualityK4Button("Korrigieren","billingReview.markCorrection",[row.decisionId],"ui-button--secondary ui-button--compact"));
    else buttons.push(qualityK4Button("Korrigieren","quality.jumpToIssue",[row.targetTab,encoded],"ui-button--secondary ui-button--compact"));
  }
  if (row.status === "Entscheidung erforderlich" && writable) {
    if (row.decisionSource === "billing-review") buttons.push(qualityK4Button("Entscheiden","billingReview.openAccept",[row.decisionId],"ui-button--primary ui-button--compact"));
    else if (row.confirmAllowed) buttons.push(qualityK4Button("Entscheiden","quality.confirmIssue",[encoded,"confirmed"],"ui-button--primary ui-button--compact"));
  }
  if (row.status === "Bestanden" && row.decisionSource === "billing-review" && row.decision && row.decision.recordId) {
    buttons.push(qualityK4Button("Entscheidung ansehen/ändern","billingReview.openDetail",[row.decisionId],"ui-button--secondary ui-button--compact"));
  } else if (row.status === "Bestanden" && row.confirmation) {
    buttons.push(qualityK4Button("Entscheidung ansehen/ändern","quality.openDetail",[encoded],"ui-button--secondary ui-button--compact"));
  }
  buttons.push(qualityK4Button("Details","quality.openDetail",[encoded],"ui-button--quiet ui-button--compact"));
  buttons.push(qualityK4Button("Regeldetails","quality.openDetail",[ruleEncoded],"ui-button--quiet ui-button--compact"));
  return '<div class="quality-row-actions">'+buttons.join('')+'</div>';
}

function qualityK4ResultRow(row) {
  const subtype = row.status === "Kritischer Abrechnungsmangel" && row.criticalSubtype ? '<small class="quality-critical-subtype">'+escapeHtml(row.criticalSubtype)+'</small>' : '';
  return '<tr data-quality-instance="'+escapeHtml(row.instanceId)+'" data-quality-rule="'+escapeHtml(row.ruleId)+'">'+
    '<td class="quality-check-cell"><strong>'+escapeHtml(row.title)+'</strong><span>'+escapeHtml(row.entityLabel||"Aktuelle Abrechnung")+'</span><code>'+escapeHtml(row.ruleId)+'</code></td>'+
    '<td class="quality-current-result">'+escapeHtml(row.details||row.resultText||row.notApplicableReason||"Kein zusätzlicher Detailtext.")+'</td>'+
    '<td><span class="status '+qualityStatusClass(row.status)+'">'+escapeHtml(row.status)+'</span>'+subtype+'</td>'+
    '<td>'+qualityK4DecisionText(row)+'</td>'+
    '<td class="quality-consequence">'+escapeHtml(row.consequence||"Keine offene Abschlusswirkung.")+'</td>'+
    '<td class="actions-cell">'+qualityK4Actions(row)+'</td></tr>';
}

function qualityK4GroupedBody(report, filter) {
  const sections=[];
  (report.groups||[]).forEach(group=>{
    const rows=qualityK4FilterRows(group.results||[],filter);
    if (!rows.length) return;
    sections.push('<tr class="quality-nav-group-row"><th colspan="6"><span>'+escapeHtml(group.areaLabel||"")+'</span><strong>'+escapeHtml(group.label)+'</strong><small>'+rows.length+' Prüfergebnis'+(rows.length===1?'':'se')+'</small></th></tr>');
    rows.forEach(row=>sections.push(qualityK4ResultRow(row)));
  });
  return sections.length?sections.join(''):'<tr><td colspan="6"><div class="quality-empty-state"><strong>Keine Ergebnisse für diesen Filter.</strong><span>Eine andere Kennzahlenkarte oder einen Filterchip wählen.</span></div></td></tr>';
}

function renderQualityStatusCards(report) {
  const el=document.getElementById("qualityStatusCards");
  if(!el)return;
  const cards=[
    {label:"Kritische Mängel",value:report.counts.blocked,filter:"blocked",kind:"critical",hint:report.counts.blocked?"Müssen korrigiert werden":"Keine kritischen Mängel"},
    {label:"Entscheidung erforderlich",value:report.counts.review,filter:"review",kind:"decision",hint:report.counts.review?"Korrigieren oder zulässig entscheiden":"Keine offenen Entscheidungen"},
    {label:"Hinweise",value:report.counts.hints,filter:"hints",kind:"hint",hint:"Ohne verpflichtende Abschlusswirkung"},
    {label:"Bestanden",value:report.counts.done,filter:"done",kind:"passed",hint:"Erfolgreich ausgeführte Prüfungen"}
  ];
  el.innerHTML=cards.map(card=>'<button type="button" class="quality-k4-kpi is-'+card.kind+(qualityCurrentFilter===card.filter?' is-active':'')+'" aria-pressed="'+(qualityCurrentFilter===card.filter?'true':'false')+'"'+uiActionAttributes("quality.setFilter",[card.filter])+'><span class="quality-k4-kpi__icon">'+qualityK4Icon(card.kind)+'</span><span class="quality-k4-kpi__body"><span>'+escapeHtml(card.label)+'</span><strong>'+escapeHtml(String(card.value))+'</strong><small>'+escapeHtml(card.hint)+'</small></span></button>').join('');
}

function qualityK4CompletionItem(ok,label,detail){return '<li class="'+(ok?'is-done':'is-open')+'"><span class="quality-completion-check" aria-hidden="true">'+(ok?qualityK4Icon('passed'):qualityK4Icon('decision'))+'</span><span><strong>'+escapeHtml(label)+'</strong><small>'+escapeHtml(detail)+'</small></span></li>';}

function renderQualityCompletionCard(report) {
  const el=document.getElementById("qualityCompletionCard");
  if(!el)return;
  const finalized=!!(NK_PRO_MODULES.billingWorkflow&&NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized&&NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized());
  const readOnly=qualityIsReadOnly();
  const ready=report.readiness.level==="ok";
  const letterRows=(report.results||[]).filter(row=>["NKP-FACH-017","NKP-FACH-018"].includes(row.ruleId));
  const lettersReady=letterRows.length>0&&letterRows.every(row=>["Bestanden","Nicht anwendbar"].includes(row.status));
  const pending=report.counts.notExecuted||0;
  const action=finalized
    ? '<button class="secondary quality-completion-action" data-ui-action="billing.unlock" type="button"'+(isArchiveViewer()?' disabled aria-disabled="true"':'')+'>Zur Korrektur öffnen</button>'
    : '<button class="primary quality-completion-action" data-ui-action="billing.finalize" type="button"'+(!ready||readOnly?' disabled aria-disabled="true"':'')+'>Abrechnung abschließen</button>';
  const briefState=finalized?"Finale Briefe freigegeben":"Briefe können vor dem Abschluss als Entwurf geprüft werden";
  const message=finalized?"Der geprüfte Abrechnungsstand ist eingefroren. Der tatsächliche Versand gehört nicht zum fachlichen Abschluss.":ready?"Alle relevanten Prüfungen sind erledigt. Mit dem Abschluss wird der geprüfte Stand eingefroren und die finale Briefausgabe freigegeben.":"Kritische Mängel und offene Entscheidungen müssen vor dem fachlichen Abschluss bearbeitet werden.";
  el.innerHTML='<header><span class="quality-completion-icon" aria-hidden="true">'+qualityK4Icon('completion')+'</span><div><p class="quality-completion-eyebrow">Fachlicher Abschluss</p><h2 id="qualityCompletionTitle">Prüfstand einfrieren und Briefe freigeben</h2></div></header><p>'+escapeHtml(message)+'</p><ul>'+
    qualityK4CompletionItem(!report.counts.blocked,"Keine kritischen Abrechnungsmängel",report.counts.blocked?report.counts.blocked+" müssen korrigiert werden":"Berechnung vollständig und möglich")+
    qualityK4CompletionItem(!report.counts.review,"Alle Entscheidungen bearbeitet",report.counts.review?report.counts.review+" Abweichungen sind offen":"Keine entscheidungspflichtige Abweichung offen")+
    qualityK4CompletionItem(!pending,"Alle relevanten Prüfungen ausgeführt",pending?pending+" Prüfungen stehen noch aus":"Keine abschlussrelevante Prüfung ausstehend")+
    qualityK4CompletionItem(lettersReady,"Mieterbriefe vollständig und korrekt",briefState)+
    '</ul>'+action+(finalized?'<div class="quality-completion-finalized"><strong>Abgeschlossen</strong><span>Schreibschutz aktiv · finale Briefe freigegeben</span></div>':'');
}

function qualitySetFilter(mode) {
  qualityCurrentFilter=(mode&&mode!=="open")?mode:"all";
  renderQuality(qualityCurrentFilter);
  const table=document.getElementById("qualityResultsTable");
  if(table)try{table.scrollIntoView({behavior:"smooth",block:"start"});}catch(_){table.scrollIntoView();}
}

function renderQuality(filterMode) {
  qualityCurrentFilter=(filterMode&&filterMode!=="open")?filterMode:(qualityCurrentFilter&&qualityCurrentFilter!=="open"?qualityCurrentFilter:"all");
  const report=qualityK4Report();
  renderQualityStatusCards(report);
  const table=document.getElementById("qualityResultsTable")||document.getElementById("qualityOpenTasksTable");
  if(table)table.innerHTML='<thead><tr><th>Prüfung</th><th>Konkretes aktuelles Ergebnis</th><th>Status</th><th>Vorhandene Entscheidung</th><th>Konsequenz</th><th>Aktionen</th></tr></thead><tbody>'+qualityK4GroupedBody(report,qualityCurrentFilter)+'</tbody>';
  const chips=document.querySelectorAll('[data-quality-k4-filter]');
  chips.forEach(chip=>{const active=chip.getAttribute('data-quality-k4-filter')===qualityCurrentFilter;chip.classList.toggle('is-active',active);chip.setAttribute('aria-pressed',active?'true':'false');});
  const count=document.getElementById("qualityResultCount");
  const tableResults=(report.results||[]).filter(row=>row.ruleId!=="NKP-FACH-019");
  const visible=qualityK4FilterRows(tableResults,qualityCurrentFilter).length;
  if(count)count.textContent=visible+" von "+tableResults.length+" Prüfergebnissen";
  const summary=document.getElementById("qualityRunSummary");
  if(summary)summary.innerHTML='<strong>'+escapeHtml(report.readiness.label)+'</strong><span>'+escapeHtml(report.readiness.message)+'</span>';
  renderQualityCompletionCard(report);
  const note=document.getElementById("qualityLastRunNote");
  if(note){let when="gerade eben";try{when=new Date(report.generatedAt).toLocaleString("de-DE");}catch(_){}note.innerHTML='<strong>Automatische Prüfung</strong><span>Alle fallbezogenen Prüfungen wurden aus dem aktuellen Abrechnungsstand abgeleitet. Stand: '+escapeHtml(when)+'.</span>';}
  if(typeof renderContextualQualitySummaries==="function")renderContextualQualitySummaries(report);
  if(typeof renderSystemDiagnostics==="function")renderSystemDiagnostics(report);
  if(typeof renderOverviewForTab==="function")renderOverviewForTab("qualitaet");
}

function saveQualityConfirmation(encodedId, mode) {
  assertQualityWritable();
  const id=decodeURIComponent(encodedId||"");
  const row=qualityResultById(id,true);
  if(!row)return alert("Der Prüfpunkt ist nicht mehr vorhanden.");
  if(row.status==="Kritischer Abrechnungsmangel"||row.blocking)return alert("Ein kritischer Abrechnungsmangel kann nicht akzeptiert werden und muss korrigiert werden.");
  if(row.decisionSource==="billing-review")return billingReviewOpenAccept(row.decisionId);
  const actualMode=mode||"confirmed";
  let reason="";
  if(actualMode==="confirmed"){
    const entered=prompt("Fachliche Begründung für die Entscheidung zu „"+row.title+"“:",row.confirmation&&row.confirmation.reason||"");
    if(entered===null)return;
    reason=String(entered).trim();
    if(reason.length<5)return alert("Bitte eine nachvollziehbare Begründung mit mindestens 5 Zeichen eingeben.");
  }
  NKProQualityRules.saveConfirmation(state,row,actualMode,reason);
  commitStateChange({reason:"Prüfentscheidung gespeichert",tabId:"qualitaet",includeCommon:false,includeNavigation:false,finalizationBypass:true});
  qualityLastReport=null;
  renderQuality(qualityCurrentFilter);
}

function reopenQualityIssue(encodedId) {
  assertQualityWritable();
  const row=qualityResultById(decodeURIComponent(encodedId||""),true);
  if(!row)return;
  if(row.decisionSource==="billing-review")return billingReviewReopen(row.decisionId);
  if(!confirm("Die vorhandene Entscheidung zu „"+row.title+"“ zurücknehmen und erneut öffnen?"))return;
  NKProQualityRules.removeConfirmation(state,row);
  commitStateChange({reason:"Prüfentscheidung zurückgenommen",tabId:"qualitaet",includeCommon:false,includeNavigation:false,finalizationBypass:true});
  qualityLastReport=null;
  renderQuality(qualityCurrentFilter);
}

function jumpToFirstOpenQualityIssue() {
  const report=qualityK4Report();
  const first=report.results.find(row=>row.status==="Kritischer Abrechnungsmangel"&&row.ruleId!=="NKP-FACH-019")||report.results.find(row=>row.status==="Entscheidung erforderlich")||report.results.find(row=>row.status==="Noch nicht ausgeführt");
  if(!first)return alert("Keine abschlussrelevanten offenen Prüfpunkte vorhanden.");
  jumpToQualityIssue(first.targetTab,qualityEncoded(first.instanceId));
}

function showOnlyQualityErrors(){switchToTab("qualitaet");renderQuality("blocked");}

function contextualRowsForTab(report,tabId){
  const aliases={mieter:["mieter","mieterverwaltung","wohnungsverwaltung"],einstellungen:["einstellungen"],einnahmen:["einnahmen","vorauszahlungsanpassung"],verbraeuche:["manuellewerte","wasser"],wasser:["manuellewerte","wasser"],manuellewerte:["manuellewerte","wasser"],umlage:["umlage"],briefe:["briefe"],export:["briefe","export"],objekt:["objekt","wohnungsverwaltung","mieterverwaltung"]};
  const targets=aliases[tabId]||[tabId];
  return (report.results||[]).filter(row=>targets.includes(row.targetTab)&&["Kritischer Abrechnungsmangel","Entscheidung erforderlich","Hinweis","Noch nicht ausgeführt"].includes(row.status));
}

function renderContextualQualitySummaries(existingReport){
  const report=existingReport||qualityK4Report();
  document.querySelectorAll('[data-section-role="validation"]').forEach(section=>{
    const tab=section.closest('section.tab');if(!tab||tab.id==="qualitaet")return;
    const body=section.querySelector('.page-section__body');if(!body)return;
    if(tab.id==="einnahmen"&&typeof renderPrepaymentQualitySummary==="function"){renderPrepaymentQualitySummary();return;}
    const rows=contextualRowsForTab(report,tab.id),critical=rows.filter(r=>r.status==="Kritischer Abrechnungsmangel").length,review=rows.filter(r=>r.status==="Entscheidung erforderlich").length,hints=rows.filter(r=>r.status==="Hinweis").length;
    body.innerHTML='<div class="context-quality-summary '+(critical?'err':review?'warn':hints?'info':'ok')+'"><div><strong>Auf dieser Seite: '+critical+' kritisch · '+review+' Entscheidungen · '+hints+' Hinweise</strong><p class="small">Fallbezogene Ergebnisse aus dem zentralen Prüf- und Regelsystem.</p></div><button type="button" class="secondary"'+uiActionAttributes("quality.openPageIssues",[tab.id])+'>Details anzeigen</button></div>'+(rows.length?'<ul class="context-quality-list">'+rows.slice(0,4).map(row=>'<li><span class="status '+qualityStatusClass(row.status)+'">'+escapeHtml(row.status)+'</span><button type="button" class="link-button"'+uiActionAttributes("quality.openDetail",[qualityEncoded(row.instanceId)])+'>'+escapeHtml(row.title)+'</button></li>').join('')+'</ul>':'');
  });
}

function openPageQualityIssues(tabId){switchToTab("qualitaet");qualityCurrentFilter="all";renderQuality("all");setTimeout(()=>{const report=qualityK4Report();const ids=new Set(contextualRowsForTab(report,tabId).map(r=>r.instanceId));const first=Array.from(document.querySelectorAll('[data-quality-instance]')).find(node=>ids.has(node.getAttribute('data-quality-instance')));if(first)first.scrollIntoView({behavior:"smooth",block:"center"});},100);}

function qualityK4RuleDetailHtml(rule) {
  const list=value=>Array.isArray(value)?value.join(", "):String(value||"–");
  return '<div class="quality-rule-detail-head"><span class="quality-rule-type">'+escapeHtml(rule.type||rule.category||"Produktive Regel")+'</span><code>'+escapeHtml(rule.id)+'</code><span>Version '+escapeHtml(String(rule.version||1))+'</span></div>'+
    '<dl class="quality-detail-grid quality-rule-detail-grid">'+
    '<div><dt>Navigationsbereich</dt><dd>'+escapeHtml(rule.navigationArea||"–")+'</dd></div><div><dt>Seite</dt><dd>'+escapeHtml(rule.navigationPage||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Tatsächlicher Prüfungsort</dt><dd>'+escapeHtml(rule.actualCheckLocation||rule.module||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Ausführungszeitpunkt und Auslöser</dt><dd>'+escapeHtml(rule.executionTrigger||rule.trigger||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Fachlicher Zweck</dt><dd>'+escapeHtml(rule.purpose||rule.description||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Datenquellen und Felder</dt><dd>'+escapeHtml(rule.dataSource||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Prüf- / Berechnungslogik</dt><dd>'+escapeHtml(rule.logic||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Formel</dt><dd><code>'+escapeHtml(rule.formula||"–")+'</code></dd></div>'+
    '<div><dt>Toleranz</dt><dd>'+escapeHtml(rule.tolerance||"–")+'</dd></div><div><dt>Rundung</dt><dd>'+escapeHtml(rule.rounding||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Vorzeichenlogik</dt><dd>'+escapeHtml(rule.signLogic||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Sonderfälle und Ausschlüsse</dt><dd>'+escapeHtml(rule.specialCases||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Mögliche Ergebnisse</dt><dd>'+escapeHtml(list(rule.possibleResults))+'</dd></div>'+
    '<div class="is-wide"><dt>Konsequenz jedes Ergebnisses</dt><dd>'+escapeHtml(rule.consequences||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Abschlusswirkung</dt><dd>'+escapeHtml(rule.completionEffect||"–")+'</dd></div>'+
    '<div><dt>Akzeptanz zulässig</dt><dd>'+escapeHtml(rule.acceptanceAllowed?"Ja":"Nein")+'</dd></div><div><dt>Korrekturziel</dt><dd>'+escapeHtml(rule.correctionTarget||"–")+'</dd></div>'+
    '<div class="is-wide"><dt>Zulässige Aktionen</dt><dd>'+escapeHtml(list(rule.allowedActions))+'</dd></div></dl>';
}

function openQualityDetail(encodedId) {
  const decoded=decodeURIComponent(encodedId||"");
  const dialog=document.getElementById("qualityDetailDialog"),title=document.getElementById("qualityDetailTitle"),content=document.getElementById("qualityDetailContent"),actions=document.getElementById("qualityDetailActions");
  if(!dialog||!title||!content||!actions)return;
  if(decoded.startsWith("RULE:")){
    const id=decoded.slice(5),rule=NKProQualityRules.REGISTRY.find(item=>item.id===id);
    if(!rule)return alert("Die Regel ist nicht mehr im produktiven Inventar vorhanden.");
    title.textContent=rule.title;
    content.innerHTML=qualityK4RuleDetailHtml(rule);
    actions.innerHTML='<button type="submit" class="ui-button nk-ui-button ui-button--secondary">Schließen</button>';
  } else {
    const row=qualityResultById(decoded,true);
    if(!row)return alert("Der Prüfpunkt ist nicht mehr vorhanden. Die Prüfung wurde aktualisiert.");
    const rule=row.ruleDefinition||NKProQualityRules.REGISTRY.find(item=>item.id===row.ruleId)||{};
    title.textContent=row.title;
    const decision=row.decisionSource==="billing-review"?qualityK4DecisionText(row):(row.confirmation?qualityK4DecisionText(row):'<span class="quality-decision-empty">Keine Entscheidung vorhanden</span>');
    content.innerHTML='<div class="quality-detail-status"><span class="status '+qualityStatusClass(row.status)+'">'+escapeHtml(row.status)+'</span>'+(row.criticalSubtype?'<span>'+escapeHtml(row.criticalSubtype)+'</span>':'')+'</div>'+
      '<dl class="quality-detail-grid"><div><dt>Regel-ID</dt><dd>'+escapeHtml(row.ruleId)+'</dd></div><div><dt>Bereich / Seite</dt><dd>'+escapeHtml((row.navigationArea||"")+" → "+(row.navigationPage||row.groupLabel||""))+'</dd></div><div><dt>Betroffene Entität</dt><dd>'+escapeHtml(row.entityLabel||"Aktuelle Abrechnung")+'</dd></div><div><dt>Ausführungszeitpunkt</dt><dd>'+escapeHtml(row.executionTime||"–")+'</dd></div><div class="is-wide"><dt>Datenquelle</dt><dd>'+escapeHtml(row.dataSource||"–")+'</dd></div><div class="is-wide"><dt>Konsequenz</dt><dd>'+escapeHtml(row.consequence||"–")+'</dd></div></dl>'+
      '<section><h3>Konkretes aktuelles Ergebnis</h3><p>'+escapeHtml(row.details||row.resultText||"–")+'</p></section>'+
      '<section><h3>Vorhandene Entscheidung</h3>'+decision+'</section>'+
      '<section><h3>Korrekturziel</h3><p>'+escapeHtml(rule.correctionTarget||row.solution||"–")+'</p></section>';
    const buttons=[];
    if(row.status==="Kritischer Abrechnungsmangel"&&row.targetTab!=="qualitaet")buttons.push(qualityK4Button("Korrigieren","quality.jumpToIssue",[row.targetTab,qualityEncoded(row.instanceId)],"ui-button--secondary"));
    if(row.status==="Entscheidung erforderlich"){
      if(row.decisionSource==="billing-review")buttons.push(qualityK4Button("Entscheiden","billingReview.openAccept",[row.decisionId],"ui-button--primary"));
      else if(row.confirmAllowed)buttons.push(qualityK4Button("Entscheiden","quality.confirmIssue",[qualityEncoded(row.instanceId),"confirmed"],"ui-button--primary"));
    }
    if(row.confirmation&&!qualityIsReadOnly())buttons.push(qualityK4Button("Entscheidung zurücknehmen","quality.reopenIssue",[qualityEncoded(row.instanceId)],"ui-button--secondary"));
    buttons.push(qualityK4Button("Regeldetails","quality.openDetail",[qualityEncoded("RULE:"+row.ruleId)],"ui-button--quiet"));
    actions.innerHTML=buttons.join('')+'<button type="submit" class="ui-button nk-ui-button ui-button--secondary">Schließen</button>';
  }
  if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();else dialog.setAttribute("open","");
}

function qualityK4InventoryRows(report) {
  const resultByRule=new Map();
  (report.results||[]).forEach(row=>{const current=resultByRule.get(row.ruleId);if(!current||({"Kritischer Abrechnungsmangel":6,"Entscheidung erforderlich":5,"Noch nicht ausgeführt":4,"Hinweis":3,"Nicht anwendbar":2,"Bestanden":1}[row.status]||0)>({"Kritischer Abrechnungsmangel":6,"Entscheidung erforderlich":5,"Noch nicht ausgeführt":4,"Hinweis":3,"Nicht anwendbar":2,"Bestanden":1}[current.status]||0))resultByRule.set(row.ruleId,row);});
  return NKProQualityRules.REGISTRY.map(rule=>({rule,result:resultByRule.get(rule.id)||null}));
}

function renderRuleInventoryKpis(rows) {
  const el=document.getElementById("ruleInventoryKpis");if(!el)return;
  const rules=rows.map(row=>row.rule);
  const cards=[
    {label:"Produktive Regeln insgesamt",value:rules.length,kind:"rules",hint:"Ohne Playwright-, Fixture- oder Regressionstests"},
    {label:"Fachliche Prüfungen",value:rules.filter(rule=>rule.type==="Fachliche Prüfung"||rule.type==="Plausibilitätsprüfung"||rule.type==="Fachlicher Hinweis").length,kind:"checks",hint:"Fallbezogene Pflicht-, Plausibilitäts- und Hinweisregeln"},
    {label:"Eingabevalidierungen",value:rules.filter(rule=>rule.type==="Eingabevalidierung").length,kind:"validation",hint:"Produktive Schutz- und Datenkonsistenzprüfungen"},
    {label:"Abschlussrelevante Regeln",value:rules.filter(rule=>rule.completionRelevant).length,kind:"completion",hint:"Wirken direkt oder mittelbar auf die Abschlussbereitschaft"}
  ];
  el.innerHTML=cards.map(card=>'<article class="rule-k4-kpi"><span class="rule-k4-kpi__icon">'+qualityK4Icon(card.kind)+'</span><span><small>'+escapeHtml(card.label)+'</small><strong>'+escapeHtml(String(card.value))+'</strong><em>'+escapeHtml(card.hint)+'</em></span></article>').join('');
}

function qualityK4PopulateSelect(id,items,placeholder) {
  const select=document.getElementById(id);if(!select)return;
  const previous=select.value||"all";
  const unique=[];items.forEach(item=>{if(item&&!unique.includes(item))unique.push(item);});
  select.innerHTML='<option value="all">'+escapeHtml(placeholder)+'</option>'+unique.map(item=>'<option value="'+escapeHtml(item)+'">'+escapeHtml(item)+'</option>').join('');
  if(Array.from(select.options).some(option=>option.value===previous))select.value=previous;
}

function renderRuleInventory(existingReport) {
  const report=existingReport||qualityK4Report();
  const allRows=qualityK4InventoryRows(report);
  renderRuleInventoryKpis(allRows);
  qualityK4PopulateSelect("ruleInventoryAreaFilter",allRows.map(row=>row.rule.navigationArea),"Alle Navigationsbereiche");
  qualityK4PopulateSelect("ruleInventoryPageFilter",allRows.map(row=>row.rule.navigationPage),"Alle Seiten");
  qualityK4PopulateSelect("ruleInventoryTypeFilter",allRows.map(row=>row.rule.type),"Alle Regelarten");
  const search=String((document.getElementById("ruleInventorySearch")||{}).value||"").trim().toLocaleLowerCase("de-DE");
  const area=String((document.getElementById("ruleInventoryAreaFilter")||{}).value||"all");
  const page=String((document.getElementById("ruleInventoryPageFilter")||{}).value||"all");
  const type=String((document.getElementById("ruleInventoryTypeFilter")||{}).value||"all");
  const acceptance=String((document.getElementById("ruleInventoryAcceptanceFilter")||{}).value||"all");
  const filtered=allRows.filter(item=>{
    const rule=item.rule;
    if(area!=="all"&&rule.navigationArea!==area)return false;
    if(page!=="all"&&rule.navigationPage!==page)return false;
    if(type!=="all"&&rule.type!==type)return false;
    if(acceptance!=="all"&&String(!!rule.acceptanceAllowed)!==acceptance)return false;
    if(!search)return true;
    return [rule.id,rule.sourceCode,rule.title,rule.type,rule.navigationArea,rule.navigationPage,rule.actualCheckLocation,rule.purpose,rule.dataSource,rule.logic,rule.formula,rule.correctionTarget].join(" ").toLocaleLowerCase("de-DE").includes(search);
  });
  const table=document.getElementById("qualityRuleRegistryTable");
  if(table){
    const body=[];let groupKey="";
    filtered.forEach(item=>{const rule=item.rule,key=(rule.navigationArea||"")+"|"+(rule.navigationPage||"");if(key!==groupKey){groupKey=key;body.push('<tr class="quality-nav-group-row"><th colspan="6"><span>'+escapeHtml(rule.navigationArea||"Produktiver Systembereich")+'</span><strong>'+escapeHtml(rule.navigationPage||"Übergreifend")+'</strong></th></tr>');}
      body.push('<tr data-rule-id="'+escapeHtml(rule.id)+'"><td><strong>'+escapeHtml(rule.title)+'</strong><div class="rule-id-line"><code>'+escapeHtml(rule.id)+'</code><span>Version '+escapeHtml(String(rule.version||1))+'</span>'+(rule.sourceCode?'<span>'+escapeHtml(rule.sourceCode)+'</span>':'')+'</div></td><td>'+escapeHtml(rule.type||rule.category||"–")+'</td><td><strong>'+escapeHtml(rule.actualCheckLocation||"–")+'</strong><small>'+escapeHtml(rule.executionTrigger||"–")+'</small></td><td><strong>'+escapeHtml(rule.purpose||"–")+'</strong><small>'+escapeHtml(rule.logic||"–")+'</small></td><td><span class="rule-completion-effect">'+escapeHtml(rule.completionEffect||"–")+'</span><small>Akzeptanz: '+(rule.acceptanceAllowed?'Ja':'Nein')+'</small></td><td class="actions-cell">'+qualityK4Button("Regeldetails","quality.openDetail",[qualityEncoded("RULE:"+rule.id)],"ui-button--quiet ui-button--compact")+'</td></tr>');
    });
    table.innerHTML='<thead><tr><th>Prüfung / Regel-ID</th><th>Regelart</th><th>Prüfungsort / Auslöser</th><th>Zweck / Logik</th><th>Abschluss / Akzeptanz</th><th>Details</th></tr></thead><tbody>'+(body.length?body.join(''):'<tr><td colspan="6"><div class="quality-empty-state"><strong>Keine passenden produktiven Regeln gefunden.</strong><span>Suchbegriff oder Filter anpassen.</span></div></td></tr>')+'</tbody>';
  }
  const count=document.getElementById("ruleInventoryResultCount");if(count)count.textContent=filtered.length+" von "+allRows.length+" produktiven Regeln";
  const requested=globalThis.NKProQualityK4RequestedRuleId;if(requested){globalThis.NKProQualityK4RequestedRuleId="";setTimeout(()=>{const row=document.querySelector('[data-rule-id="'+CSS.escape(requested)+'"]');if(row){row.classList.add('quality-target-highlight');row.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>row.classList.remove('quality-target-highlight'),3500);}},80);}
  if(typeof renderOverviewForTab==="function")renderOverviewForTab("regelinventar");
}

function filterQualityRegistry(){renderRuleInventory();}
function resetQualityRegistryFilters(){["ruleInventorySearch","ruleInventoryAreaFilter","ruleInventoryPageFilter","ruleInventoryTypeFilter","ruleInventoryAcceptanceFilter"].forEach(id=>{const el=document.getElementById(id);if(el)el.value=id==="ruleInventorySearch"?"":"all";});renderRuleInventory();}

function jumpToQualityIssue(tab,encodedId){
  const row=qualityResultById(decodeURIComponent(encodedId||""),true);
  const targetTab=tab||row&&row.targetTab||"qualitaet";
  switchToTab(targetTab);
  setTimeout(()=>highlightQualityTarget(targetTab,row),140);
}

function openRuleInventoryForResult(ruleId){globalThis.NKProQualityK4RequestedRuleId=ruleId;switchToTab("regelinventar");setTimeout(()=>renderRuleInventory(),80);}
