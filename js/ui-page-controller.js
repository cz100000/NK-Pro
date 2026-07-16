"use strict";

// AP12: Seitenrenderer-Orchestrierung, Übersichten und Seitenköpfe.
// ===== Bereich: Tabellenwerkzeuge und App-Start =====
function activeTabId() {
  const active = document.querySelector("section.tab.active");
  return active && active.id ? active.id : (currentAppMode() === "billing" ? "mieter" : "landing");
}

function prepareStateForPersistence(reason = "manual") {
  if (statePreparationInProgress) return false;
  statePreparationInProgress = true;
  statePreparationCount += 1;
  try {
    const steps = [
      ["Jahresdaten", () => ensureYearData()],
      ["ID-Migration", () => ensureUnitIdentityData(state)],
      ["Mieterkontakte", () => ensureTenantContactData()],
      ["Kostenarten-Voreinstellungen", () => ensureCostSettings()],
      ["Briefeinstellungen", () => ensureBriefSettings()],
      ["Briefadressen", () => ensureBriefAddresses()],
      ["Einzugsdaten Stammdaten", () => applyKnownMasterTenantEntryDates(state, {save:false})],
      ["Miettage", () => normalizeTenantActiveDays()],
      ["Vorauszahlungen", () => NK_PRO_MODULES.costActions.syncVorauszahlungen()],
      ["Vorauszahlungsübernahme", () => NK_PRO_MODULES.yearTransitionActions.ensurePrepaymentCarryForward(state)],
      ["Kosten-Mieter-Umlage", () => NK_PRO_MODULES.costActions.syncKostenartenMieterUmlage()],
      ["Mieter-Vorauszahlungen", () => NK_PRO_MODULES.costActions.updateTenantPrepaymentTotals()],
      ["Umlage-Eingaben", () => syncUmlageInputs()],
      ["Zählerstammdaten und Messperioden", () => synchronizeMeteringData(state)],
      ["Wasserzähler", () => applyWaterMetersToUmlage()],
      ["Kostenstatus", () => state.kostenarten.forEach(k => k.status = NK_PRO_MODULES.costActions.kostenStatus(k))],
      ["Datenebenen und Snapshot-Grenzen", () => enforceWorkingStateDataContract(state)]
    ];
    steps.forEach(step => runRenderStep("Datenaufbereitung: " + step[0], step[1]));
    return true;
  } finally {
    statePreparationInProgress = false;
  }
}

function renderStepsForTab(tabId) {
  const definition = (typeof TAB_DEFINITIONS !== "undefined") ? TAB_DEFINITIONS[tabId] : null;
  return definition && typeof definition.renderContent === "function" ? [[definition.title, definition.renderContent]] : [];
}

function renderCurrentView(options = {}) {
  const startedAt = Date.now();
  const allTabs = START_NAV_TABS.concat(BILLING_NAV_TABS);
  const active = activeTabId();
  const requestedTabs = Array.isArray(options.tabIds) && options.tabIds.length ? options.tabIds : null;
  const tabs = options.forceAll ? allTabs : (requestedTabs || [active]);
  const includeCommon = options.includeCommon !== false;
  const includeNavigation = options.includeNavigation !== false;
  const includeTableTools = options.includeTableTools !== false;

  renderLastActiveTab = active;
  if (includeCommon) {
    runRenderStep("Periodeninfo", () => renderPeriodInfo());
    runRenderStep("Finalisierung", () => renderFinalizationStatus());
  }

  tabs.forEach(tabId => {
    if (!options.forceAll && !tabVisibleInMode(tabId)) return;
    renderStepsForTab(tabId).forEach(step => runRenderStep(step[0], step[1]));
  });

  if (includeCommon && isArchiveViewer()) runRenderStep("Archivdetails", () => renderLegacyArchiveDetails());
  if (includeTableTools) runRenderStep("Tabellenwerkzeuge", () => enhanceTables());
  if (includeNavigation) runRenderStep("Navigation", () => updateTopNavigationVisibility());
  renderLastDurationMs = Date.now() - startedAt;
}

function renderStatusAndFeedbackSafely() {
  try { renderSystemMessages(); } catch(error) {
    renderErrors.push({ area:"Systemhinweise", message:errorMessage(error) });
    if (typeof console !== "undefined" && console.error) console.error("NK-Pro Systemhinweise fehlgeschlagen", error);
  }
  try { renderActionFeedback(); } catch(error) {
    renderErrors.push({ area:"Statusanzeige", message:errorMessage(error) });
    if (typeof console !== "undefined" && console.error) console.error("NK-Pro Statusanzeige fehlgeschlagen", error);
  }
}



const AP17_DASHBOARD_TABS = Object.freeze(["objektuebersicht", "start"]);
const AP17_ICON_PATHS = Object.freeze({
  dashboard:'<path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"/>',
  building:'<path d="M5 21V5l7-2v18M12 8h7v13M8 8h1M8 12h1M8 16h1M15 11h1M15 15h1M3 21h18"/>',
  home:'<path d="M3 11.5 12 4l9 7.5M5 10v11h14V10M9 21v-7h6v7"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  meter:'<path d="M5 20a8 8 0 1 1 14 0M12 12l4-4M8 20h8"/>',
  wallet:'<path d="M4 6.5h14a2 2 0 0 1 2 2V19H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12v3.5M15 11h5v4h-5a2 2 0 0 1 0-4z"/>',
  receipt:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2M9 7h6M9 11h6M9 15h4"/>',
  input:'<path d="M4 4h10v16H4zM8 8h2M8 12h2M8 16h2M14 12h7M18 9l3 3-3 3"/>',
  droplet:'<path d="M12 2s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12zM9 15a3 3 0 0 0 3 3"/>',
  distribution:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10M8.5 12l2.2 2.2 4.8-5.4"/>',
  calculator:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  download:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  archive:'<path d="M3 6h18M5 6v15h14V6M8 3h8l2 3H6l2-3M9 11h6"/>'
});

const TAB_DEFINITIONS = {
  objektuebersicht:{title:"Objekt vorbereiten – Übersicht",kicker:"Objekt vorbereiten",firstSection:null,nextTab:"objekt",renderContent:null},
  objekt:{title:"Objektdaten",kicker:"Objekt vorbereiten",firstSection:"objectPreparationSection",nextTab:"wohnungsverwaltung",renderContent:null},
  start:{title:"Nebenkostenabrechnung – Übersicht",kicker:"Nebenkosten abrechnen",firstSection:null,nextTab:"mieter",renderContent:()=>renderStart()},
  archiv:{title:"Abrechnungsarchiv",kicker:"Archiv",firstSection:"archiveRecordsSection",nextTab:"start",renderContent:()=>renderArchive()},
  mieterverwaltung:{title:"Mieterverwaltung",kicker:"Objekt vorbereiten",firstSection:"masterTenantSection",nextTab:"wohnungsverwaltung",renderContent:()=>renderStartTenantManagement()},
  wohnungsverwaltung:{title:"Wohnungsverwaltung",kicker:"Objekt vorbereiten",firstSection:"masterUnitSection",nextTab:"mieterverwaltung",renderContent:()=>renderStartUnitManagement()},
  sicherung:{title:"Datensicherung & System",kicker:"Extras",firstSection:"backupMainSection",nextTab:"landing",renderContent:()=>renderSicherung()},
  mieter:{title:"Mietverhältnisse prüfen und bearbeiten",kicker:"Nebenkosten abrechnen",firstSection:"tenantUnitsSection",nextTab:"einnahmen",renderContent:()=>renderWohnungen()},
  einstellungen:{title:"Gesamtkosten erfassen",kicker:"Nebenkosten abrechnen",firstSection:"costEditSection",nextTab:"manuellewerte",renderContent:()=>renderEinstellungen()},
  einnahmen:{title:"Vorauszahlungen erfassen",kicker:"Nebenkosten abrechnen",firstSection:"incomePrepaymentSection",nextTab:"einstellungen",renderContent:()=>renderEinnahmen()},
  wasser:{title:"Zähler",kicker:"Objekt vorbereiten",firstSection:"meterInventoryDummyValidationSection",nextTab:"mieterverwaltung",renderContent:null},
  manuellewerte:{title:"Individuelle Werte und Verbräuche erfassen",kicker:"Nebenkosten abrechnen",firstSection:null,nextTab:"umlage",renderContent:()=>renderIndividualValues()},
  verbraeuche:{title:"Individuelle Werte und Verbräuche erfassen",kicker:"Nebenkosten abrechnen",firstSection:null,nextTab:"umlage",renderContent:()=>renderIndividualValues()},
  umlage:{title:"Ergebnis der Abrechnung",kicker:"Nebenkosten abrechnen",firstSection:"allocationTenantResultSection",nextTab:"qualitaet",renderContent:()=>renderUmlage()},
  vorauszahlungsanpassung:{title:"Vorauszahlungen für das Folgejahr anpassen",kicker:"Nebenkosten abrechnen",firstSection:"prepaymentRulesSection",nextTab:"briefe",renderContent:()=>renderPrepaymentAdjustment()},
  qualitaet:{title:"Abrechnung prüfen und freigeben",kicker:"Nebenkosten abrechnen",firstSection:"qualityOverviewSection",nextTab:"vorauszahlungsanpassung",renderContent:()=>renderQuality()},
  briefe:{title:"Abrechnungsbriefe erstellen",kicker:"Nebenkosten abrechnen",firstSection:"lettersEditorSection",nextTab:"export",renderContent:()=>renderBrief()},
  export:{title:"Abrechnung exportieren",kicker:"Sicherung",firstSection:"exportActionsSection",nextTab:"qualitaet",renderContent:null}
};

function closeAllTabAccordions(tab) {
  if (!tab) return;
  tab.querySelectorAll('details').forEach(details => { details.open = false; });
}
function safeOverviewCall(fn, fallback) {
  try { const value=fn(); return value === undefined || value === null ? fallback : value; }
  catch (_) { return fallback; }
}
function overviewMoney(value) { return typeof fmtMoney === "function" ? fmtMoney(value || 0) : Number(value || 0).toLocaleString("de-DE",{style:"currency",currency:"EUR"}); }
function overviewOpenSection(id) {
  const section=document.getElementById(id);
  if (!section) return;
  section.open=true;
  section.scrollIntoView({behavior:"smooth",block:"start"});
}
function ap17Icon(name, className="area-dashboard__icon-svg") {
  return '<svg class="'+className+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(AP17_ICON_PATHS[name]||AP17_ICON_PATHS.dashboard)+'</svg>';
}
function dashboardCostStatus(cost) {
  if (!cost || !cost.kostenart || cost.inNK !== "Ja") return "Nicht verfügbar";
  if (num(cost.gesamtbetrag) <= 0) return "Offen";
  if (!cost.berechnungsart || cost.berechnungsart === "Entfällt") return "Blockiert";
  if (!cost.umlageschluessel || cost.umlageschluessel === "Entfällt") return "Blockiert";
  if (cost.umlageschluessel === "Verbrauch" && num(cost.preisProEinheit) <= 0 && num(cost.gesamtverbrauch) <= 0) return "Blockiert";
  if (cost.berechnungsart === "Manuell je Mieter" && cost.umlageschluessel !== UMLAGE_MANUAL) return "Warnung";
  return "Vollständig";
}
function dashboardStats() {
  const units=Array.isArray(state && state.wohnungen) ? state.wohnungen.filter(w=>w && w.id) : [];
  const activeUnits=units.filter(w=>String(w.status||"aktiv").toLowerCase() !== "inaktiv");
  const tenants=safeOverviewCall(()=>billableTenantRows(), Array.isArray(state && state.mieter) ? state.mieter.filter(m=>m && (m.name || m.wohnung)) : []);
  const costs=Array.isArray(state && state.kostenarten) ? state.kostenarten.filter(k=>k && k.kostenart && k.inNK === "Ja") : [];
  const costRows=costs.map(cost=>({cost,status:dashboardCostStatus(cost)}));
  const completeCosts=costRows.filter(row=>row.status === "Vollständig");
  const blockedCosts=costRows.filter(row=>row.status === "Blockiert");
  const openCosts=costRows.filter(row=>row.status === "Offen" || row.status === "Warnung");
  const consumptionCosts=costRows.filter(row=>row.cost.umlageschluessel === "Verbrauch");
  const completeConsumption=consumptionCosts.filter(row=>row.status === "Vollständig");
  const completeUnits=activeUnits.filter(unit=>String(unit.bezeichnung||unit.lage||"").trim() && num(unit.wohnflaeche)>0 && String(unit.status||"").trim());
  const completeTenants=tenants.filter(tenant=>String(tenant.name||"").trim() && String(tenant.wohnung||"").trim() && String(tenant.einzug||"").trim());
  const billableUnitIds=new Set(tenants.map(tenant=>String(tenant.wohnung||"")).filter(Boolean));
  const billableUnits=activeUnits.filter(unit=>billableUnitIds.has(String(unit.id||"")));
  const blockedUnits=activeUnits.filter(unit=>!billableUnitIds.has(String(unit.id||"")));
  const prepayments=tenants.reduce((sum,tenant)=>sum+num(tenant.nkVoraus),0);
  const tenantsWithPrepayment=tenants.filter(tenant=>num(tenant.nkVoraus)>0).length;
  const objectValidation=safeOverviewCall(()=>validateObjectStandard(state),{valid:false,errors:[],warnings:[],infos:[]});
  const quality=safeOverviewCall(()=>NK_PRO_MODULES.qualityAssurance.inspect({scope:"currentBilling"}),null);
  const centralResults=quality && Array.isArray(quality.results) ? quality.results : [];
  const qualityIssues=centralResults.filter(row=>["Blockiert","Zu prüfen","Hinweis"].includes(row.status));
  const qualityErrors=centralResults.filter(row=>row.status === "Blockiert");
  const qualityWarnings=centralResults.filter(row=>row.status === "Zu prüfen" || row.status === "Hinweis");
  const centralGroup=id=>quality && Array.isArray(quality.groups) ? quality.groups.find(group=>group.id===id) : null;
  const groupRule=(key,label,id,target)=>{const group=centralGroup(id)||{counts:{blocked:0,review:0,hints:0},results:[]};const counts=group.counts||{};return {key,label,complete:!counts.blocked&&!counts.review,blocked:counts.blocked>0,target,groupId:id};};
  const activeBilling=safeOverviewCall(()=>NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling(),false);
  const finalized=safeOverviewCall(()=>NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized(),false);
  const archives=Array.isArray(state && state.jahresArchiv) ? state.jahresArchiv : [];
  const lettersGenerated=activeBilling ? safeOverviewCall(()=>briefResultRows().length,0) : 0;
  const periodValid=/^\d{4}-\d{2}-\d{2}$/.test(String(periodStart())) && /^\d{4}-\d{2}-\d{2}$/.test(String(periodEnd())) && String(periodStart()) <= String(periodEnd());
  const rules=[
    groupRule("units","Objekt und Zeitraum","object-period","einstellungen"),
    groupRule("tenants","Wohnungen und Mietverhältnisse","units-tenancies","mieterverwaltung"),
    groupRule("period","Vorauszahlungen und Korrekturen","prepayments","einnahmen"),
    groupRule("costs","Kosten und Kostenarten","costs","einstellungen"),
    groupRule("consumption","Individuelle Werte und Verbräuche","consumption","manuellewerte"),
    groupRule("allocation","Umlage und Summen","allocation","umlage"),
    groupRule("quality","Abschluss","completion","qualitaet"),
    groupRule("letters","Briefe und Ausgabe","letters","briefe")
  ];
  return {
    units,activeUnits,completeUnits,tenants,completeTenants,costs,costRows,completeCosts,blockedCosts,openCosts,consumptionCosts,completeConsumption,
    billableUnits,blockedUnits,prepayments,tenantsWithPrepayment,objectValidation,qualityIssues,qualityErrors,qualityWarnings,
    activeBilling,finalized,archives,lettersGenerated,periodValid,rules,
    objectLabel:safeOverviewCall(()=>currentObjectLabel(),"Objekt"), objectCode:safeOverviewCall(()=>currentObjectShortCode(),"OBJ"), year:safeOverviewCall(()=>currentAbrechnungsjahr(),"–")
  };
}
function valueKindBadge(kind) {
  const labels={data:"Datenwert",complete:"Vollständig",open:"Offen",warning:"Warnung",blocked:"Blockiert",dummy:"DUMMY"};
  return '<span class="dashboard-value-badge dashboard-value-badge--'+escapeHtml(kind)+'">'+escapeHtml(labels[kind]||"Datenwert")+'</span>';
}
function dashboardValue(label,value,kind="data",hint="",tone="blue") {
  return '<article class="dashboard-value-card dashboard-value-card--'+tone+'" data-value-kind="'+kind+'"><div class="dashboard-value-card__top"><span>'+escapeHtml(label)+'</span>'+valueKindBadge(kind)+'</div><strong>'+escapeHtml(String(value))+'</strong>'+(hint?'<small>'+escapeHtml(hint)+'</small>':'')+'</article>';
}
function dashboardAction(label,target,icon,meta="",kind="data") {
  return '<button class="dashboard-entry" type="button" data-value-kind="'+kind+'" data-ui-action="navigation.switchTab" data-ui-args="[&quot;'+escapeHtml(target)+'&quot;]"><span class="dashboard-entry__icon">'+ap17Icon(icon)+'</span><span class="dashboard-entry__copy"><strong>'+escapeHtml(label)+'</strong>'+(meta?'<small>'+escapeHtml(meta)+'</small>':'')+'</span><span class="dashboard-entry__arrow" aria-hidden="true">→</span></button>';
}
function statusTone(status) {
  return status === "Vollständig" || status === "Abgeschlossen" || status === "Archiviert" ? "done" : (status === "Blockiert" ? "blocked" : (status === "Warnung" ? "warning" : "open"));
}
function renderObjectDashboard(root, stats) {
  const validation=stats.objectValidation || {errors:[],warnings:[]};
  const errors=Array.isArray(validation.errors)?validation.errors.length:0;
  const warnings=Array.isArray(validation.warnings)?validation.warnings.length:0;
  const objectStatus=errors ? "Blockiert" : (warnings ? "Warnung" : "Vollständig");
  const nextRule=stats.rules.find(rule=>!rule.complete) || {label:"Objektvorbereitung",target:"objekt",blocked:false};
  const nextText=nextRule.blocked ? "Blockierende Angaben prüfen" : "Offene Angaben vervollständigen";
  root.innerHTML =
    '<div class="dashboard-value-grid">'+
      dashboardValue("Aktuelles Objekt",stats.objectLabel,"data","Aus vorhandenen Objekt- und Mieterdaten","blue")+
      dashboardValue("Gebäudekurzcode",stats.objectCode,"data","Aus Stammdaten abgeleitet","petrol")+
      dashboardValue("Einheiten vollständig",stats.completeUnits.length+' von '+stats.activeUnits.length,stats.completeUnits.length===stats.activeUnits.length&&stats.activeUnits.length?"complete":"open",stats.activeUnits.length-stats.completeUnits.length+' offene Einheiten',"blue")+
      dashboardValue("Mieter vollständig",stats.completeTenants.length+' von '+stats.tenants.length,stats.completeTenants.length===stats.tenants.length&&stats.tenants.length?"complete":"open",stats.tenants.length-stats.completeTenants.length+' offene Mietverhältnisse',"violet")+
    '</div>'+
    '<div class="dashboard-summary-grid">'+
      '<article class="dashboard-status-panel dashboard-status-panel--'+(objectStatus==="Vollständig"?'green':(objectStatus==="Warnung"?'orange':'red'))+'"><div class="dashboard-panel-heading"><span>'+ap17Icon("shield")+'</span><div><h3>Objektstandard</h3>'+valueKindBadge(statusTone(objectStatus)==="done"?"complete":statusTone(objectStatus))+'</div></div><strong>'+escapeHtml(objectStatus)+'</strong><p>'+errors+' blockierende und '+warnings+' warnende Angaben aus der vorhandenen Objektprüfung.</p></article>'+
      '<article class="dashboard-status-panel dashboard-status-panel--blue"><div class="dashboard-panel-heading"><span>'+ap17Icon("receipt")+'</span><div><h3>Kostenarten und Schlüssel</h3>'+valueKindBadge(stats.completeCosts.length===stats.costs.length&&stats.costs.length?"complete":(stats.blockedCosts.length?"blocked":"open"))+'</div></div><strong>'+stats.completeCosts.length+' von '+stats.costs.length+' vollständig</strong><p>'+stats.blockedCosts.length+' blockiert, '+stats.openCosts.length+' offen oder mit Warnung.</p></article>'+
      '<article class="dashboard-next-step"><div><span class="dashboard-next-step__label">Nächster nachvollziehbarer Vorbereitungsschritt</span><h3>'+escapeHtml(nextRule.label)+': '+escapeHtml(nextText)+'</h3><p>Der Direkteinstieg basiert auf der ersten noch nicht erfüllten Prüfregel.</p></div><button class="primary" data-ui-action="navigation.switchTab" data-ui-args="[&quot;'+escapeHtml(nextRule.target)+'&quot;]" type="button">Arbeitsbereich öffnen</button></article>'+
    '</div>'+
    '<section class="dashboard-entry-section"><div class="dashboard-section-heading"><div><p class="page-header__kicker">Direkteinstiege</p><h3>Objekt vorbereiten</h3></div><span>4 Arbeitsbereiche</span></div><div class="dashboard-entry-grid dashboard-entry-grid--four">'+
      dashboardAction("Objektdaten","objekt","building","Objektstandard und Zuordnungen")+
      dashboardAction("Wohnungen","wohnungsverwaltung","home",stats.completeUnits.length+' von '+stats.activeUnits.length+' vollständig')+
      dashboardAction("Mieter","mieterverwaltung","users",stats.completeTenants.length+' von '+stats.tenants.length+' vollständig')+
      dashboardAction("Zähler-DUMMY","wasser","meter","Reiner Clickdummy ohne Fachlogik","dummy")+
    '</div></section>';
}
function workflowStage(label,target,icon,status,detail) {
  const tone=statusTone(status);
  return '<button class="workflow-stage workflow-stage--'+tone+'" type="button" data-value-kind="data" data-ui-action="navigation.switchTab" data-ui-args="[&quot;'+escapeHtml(target)+'&quot;]"><span class="workflow-stage__icon">'+ap17Icon(icon)+'</span><span class="workflow-stage__copy"><strong>'+escapeHtml(label)+'</strong><small>'+escapeHtml(detail||"Aus vorhandenen Daten abgeleitet")+'</small></span><span class="workflow-stage__status">'+escapeHtml(status)+'</span></button>';
}
function workflowStatus(rule) {
  if (!rule) return "Nicht verfügbar";
  if (rule.complete) return "Vollständig";
  if (rule.blocked) return "Blockiert";
  return "Offen";
}
function renderBillingDashboard(root, stats) {
  const currentStatus=stats.finalized ? "Abgeschlossen" : (stats.activeBilling ? "In Bearbeitung" : "Nicht verfügbar");
  const completedRules=stats.rules.filter(rule=>rule.complete).length;
  const blockedRules=stats.rules.filter(rule=>rule.blocked&&!rule.complete).length;
  const ruleMap=Object.fromEntries(stats.rules.map(rule=>[rule.key,rule]));
  const contextNotice=!NK_PRO_MODULES.billingContext.isOpen() ? '<div class="billing-context-guidance" role="status"><strong>Keine Abrechnung geöffnet</strong><span>Öffnen Sie zuerst eine Abrechnung zur Bearbeitung oder Ansicht.</span></div>' : '';
  root.innerHTML = contextNotice+
    '<div class="billing-fact-strip billing-fact-strip--compact" aria-label="Produktiver Arbeitsstand">'+
      '<div data-value-kind="data"><span>Kosten vollständig</span><strong>'+stats.completeCosts.length+' / '+stats.costs.length+'</strong>'+valueKindBadge(stats.completeCosts.length===stats.costs.length&&stats.costs.length?"complete":"open")+'</div>'+
      '<div data-value-kind="data"><span>Verbrauch vollständig</span><strong>'+stats.completeConsumption.length+' / '+stats.consumptionCosts.length+'</strong>'+valueKindBadge(stats.completeConsumption.length===stats.consumptionCosts.length?"complete":"blocked")+'</div>'+
      '<div data-value-kind="data"><span>Berechenbare Einheiten</span><strong>'+stats.billableUnits.length+' / '+stats.activeUnits.length+'</strong>'+valueKindBadge(stats.blockedUnits.length?"blocked":"complete")+'</div>'+
      '<div data-value-kind="data"><span>NK-Vorauszahlungen</span><strong>'+escapeHtml(overviewMoney(stats.prepayments))+'</strong>'+valueKindBadge(stats.tenantsWithPrepayment===stats.tenants.length&&stats.tenants.length?"complete":"open")+'</div>'+
      '<div data-value-kind="data"><span>Offene Prüfhinweise</span><strong>'+stats.qualityIssues.length+'</strong>'+valueKindBadge(stats.qualityErrors.length?"blocked":(stats.qualityWarnings.length?"warning":"complete"))+'</div>'+
    '</div>'+
    '<section class="dashboard-entry-section"><div class="dashboard-section-heading"><div><p class="page-header__kicker">Abrechnungsprozess</p><h3>Produktiver Arbeitsstand und Direkteinstiege</h3></div><span>'+completedRules+' von '+stats.rules.length+' Prüfbereichen vollständig</span></div><div class="workflow-stage-grid">'+
      workflowStage("Mietverhältnisse","mieter","users",workflowStatus(ruleMap.tenants),stats.completeTenants.length+' von '+stats.tenants.length+' Mietverhältnissen vollständig')+
      workflowStage("Vorauszahlungen","einnahmen","wallet",stats.tenantsWithPrepayment===stats.tenants.length&&stats.tenants.length?"Vollständig":"Offen",stats.tenantsWithPrepayment+' von '+stats.tenants.length+' mit Vorauszahlung')+
      workflowStage("Gesamtkosten","einstellungen","receipt",workflowStatus(ruleMap.costs),stats.completeCosts.length+' von '+stats.costs.length+' Kostenarten vollständig')+
      workflowStage("Individuelle Werte","manuellewerte","input",workflowStatus(ruleMap.consumption),stats.completeConsumption.length+' von '+stats.consumptionCosts.length+' Verbrauchskosten vollständig')+
      workflowStage("Abrechnungsergebnis","umlage","distribution",workflowStatus(ruleMap.allocation),stats.billableUnits.length+' von '+stats.activeUnits.length+' Einheiten berechenbar')+
      workflowStage("Prüfung","qualitaet","shield",workflowStatus(ruleMap.quality),stats.qualityErrors.length+' Fehler, '+stats.qualityWarnings.length+' weitere Hinweise')+
      workflowStage("Vorauszahlungsanpassung","vorauszahlungsanpassung","calculator",stats.tenants.length?"Offen":"Nicht verfügbar",stats.tenants.length+' Mietverhältnisse als Grundlage')+
      workflowStage("Briefe","briefe","mail",workflowStatus(ruleMap.letters),stats.lettersGenerated+' von '+stats.tenants.length+' Briefen erzeugt')+
      workflowStage("Export","export","download",stats.qualityErrors.length?"Blockiert":"Offen",stats.qualityErrors.length?'Blockierende Qualitätsfehler vorhanden':'Export verändert keine Daten')+
      workflowStage("Archiv","archiv","archive",stats.archives.length?"Archiviert":"Offen",stats.archives.length+' archivierte Abrechnungen')+
    '</div></section>';
}

function renderOverviewForTab(tabId) {
  if (!AP17_DASHBOARD_TABS.includes(tabId)) return;
  const root=document.querySelector('[data-area-dashboard="'+(tabId === "start" ? "billing" : "object")+'"]');
  if (!root) return;
  const stats=dashboardStats();
  if (tabId === "start") renderBillingDashboard(root,stats);
  else renderObjectDashboard(root,stats);
}
function renderAllOverviewCards() { AP17_DASHBOARD_TABS.forEach(renderOverviewForTab); }

function pageHeaderPeriodLabel() {
  const format = value => {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? match[3] + "." + match[2] + "." + match[1] : dateDe(value);
  };
  return format(periodStart()) + " – " + format(periodEnd());
}
function updateAllPageHeaders() {
  const context=NK_PRO_MODULES.billingContext.snapshot();
  const open=NK_PRO_MODULES.billingContext.isOpen();
  const readOnly=NK_PRO_MODULES.billingContext.isReadOnly();
  Object.keys(TAB_DEFINITIONS).forEach(tabId=>{
    const page=document.querySelector('[data-page-tab="'+tabId+'"]');
    if (!page) return;
    const billingPage=BILLING_NAV_TABS.includes(tabId);
    const status=page.querySelector('[data-page-save-status]');
    if (status) status.textContent=billingPage?(open?"Gespeichert":"Keine Abrechnung geöffnet"):"Gespeichert";
    const saveButton=page.querySelector('[data-page-save]');
    if (saveButton&&billingPage) {
      saveButton.hidden=readOnly||!open;
      saveButton.disabled=readOnly||!open;
      saveButton.setAttribute("aria-hidden",saveButton.hidden?"true":"false");
    }
  });
  const globalTitle=document.getElementById('workspaceTitle');
  if (globalTitle) { globalTitle.textContent=''; globalTitle.hidden=true; }
  if (typeof applyBillingContextToDom==="function") applyBillingContextToDom();
}

function auditV992Structure() {
  const objectDashboard=document.querySelector('[data-area-dashboard="object"]');
  const billingDashboard=document.querySelector('#billingOverviewRoot');
  const billingPages=BILLING_NAV_TABS.map(tab=>document.querySelector('[data-page-tab="'+tab+'"]')).filter(Boolean);
  const checks={
    objectDashboard:!!objectDashboard,
    billingDashboard:!!billingDashboard,
    objectDirectEntries:!!objectDashboard&&objectDashboard.querySelectorAll('.dashboard-entry').length===4,
    billingWorkflowEntries:!!billingDashboard&&!!globalThis.NKProBillingOverview&&globalThis.NKProBillingOverview.describe().workflowSteps===6,
    productiveDashboardValues:document.querySelectorAll('.dashboard-preview-notice').length===0,
    controlledContext:NK_PRO_MODULES.billingContext.describe().stateCount===3,
    contextClosedAfterStart:!NK_PRO_MODULES.billingContext.isOpen()||document.documentElement.dataset.billingExplicitlyOpened==="true",
    billingHeadersWithoutRedundantPeriod:billingPages.every(page=>!page.querySelector('[data-page-period]')),
    centralBillingTable:!!document.querySelector('#billingOverviewRoot')&&!!globalThis.NKProBillingOverview,
    contextBar:!!document.querySelector('[data-global-billing-context]'),
    svgSectionChevrons:Array.from(document.querySelectorAll('.page-section__chevron')).every(node=>!!node.querySelector('svg')),
    compactHeaders:Array.from(document.querySelectorAll('.app-page')).every(page=>page.querySelectorAll(':scope > .page-header').length===1)
  };
  const report={version:APP_VERSION,workPackage:"AP21B",generatedAt:new Date().toISOString(),allPassed:Object.values(checks).every(Boolean),checks};
  NK_PRO_MODULES.runtimeDiagnostics.setStructureAudit(report);
  document.documentElement.dataset.v992Audit=report.allPassed?'passed':'failed';
  document.documentElement.dataset.ap17Audit=report.allPassed?'passed':'failed';
  document.documentElement.dataset.ap19Audit=report.allPassed?'passed':'failed';
  return report;
}


function renderAll(options = {}) {
  if (renderInProgress) {
    renderQueued = true;
    return;
  }
  renderInProgress = true;
  renderQueued = false;
  renderErrors = [];
  renderCount += 1;
  const startedAt = Date.now();
  try {
    renderCurrentView(options);
  } catch(error) {
    renderErrors.push({ area:"Render-Gesamtlauf", message:errorMessage(error) });
    if (typeof console !== "undefined" && console.error) console.error("NK-Pro Render-Gesamtlauf fehlgeschlagen", error);
  } finally {
    renderLastDurationMs = Math.max(renderLastDurationMs, Date.now() - startedAt);
    renderInProgress = false;
    renderStatusAndFeedbackSafely();
    try {
      updateAllPageHeaders();
      renderAllOverviewCards();
      const centralQuality = safeOverviewCall(()=>NK_PRO_MODULES.qualityAssurance.inspect({scope:"currentBilling",includeTechnical:true}), null);
      if (centralQuality && NK_PRO_MODULES.billingContext.isOpen() && typeof renderContextualQualitySummaries === "function") renderContextualQualitySummaries(centralQuality);
      if (centralQuality && typeof renderSystemDiagnostics === "function") renderSystemDiagnostics(centralQuality);
      auditV992Structure();
    } catch(uiError) {
      if (typeof console !== "undefined" && console.error) console.error(APP_VERSION + "-Darstellung konnte nicht aktualisiert werden", uiError);
    }
    if (renderQueued) {
      renderQueued = false;
      setTimeout(() => renderAll(options), 0);
    }
  }
}

function showLandingPage() { billingContextOpen = false; return switchToTab("landing"); }
function openCostTenantDetails() { const section = document.getElementById("costTenantSection"); if (!section) return; section.open = true; try { section.scrollIntoView({ behavior:"smooth" }); } catch(error) { section.scrollIntoView(); } }
