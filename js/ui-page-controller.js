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
  start:{title:"Nebenkosten abrechnen – Übersicht",kicker:"Nebenkosten abrechnen",firstSection:"startRecordsSection",nextTab:"mieter",renderContent:()=>renderStart()},
  archiv:{title:"Abrechnungsarchiv",kicker:"Archiv",firstSection:"archiveRecordsSection",nextTab:"start",renderContent:()=>renderArchive()},
  mieterverwaltung:{title:"Mieterverwaltung",kicker:"Objekt vorbereiten",firstSection:"masterTenantSection",nextTab:"wohnungsverwaltung",renderContent:()=>renderStartTenantManagement()},
  wohnungsverwaltung:{title:"Wohnungsverwaltung",kicker:"Objekt vorbereiten",firstSection:"masterUnitSection",nextTab:"mieterverwaltung",renderContent:()=>renderStartUnitManagement()},
  sicherung:{title:"Datensicherung & System",kicker:"Extras",firstSection:"backupMainSection",nextTab:"landing",renderContent:()=>renderSicherung()},
  mieter:{title:"Mieter & Wohnungen",kicker:"Abrechnungsstammdaten",firstSection:"tenantUnitsSection",nextTab:"einstellungen",renderContent:()=>renderWohnungen()},
  einstellungen:{title:"Kostenarten & Einstellungen",kicker:"Abrechnungseinstellungen",firstSection:"costEditSection",nextTab:"einnahmen",renderContent:()=>renderEinstellungen()},
  einnahmen:{title:"Kaltmiete & NK-Vorauszahlungen",kicker:"Einnahmen",firstSection:"incomeRentSection",nextTab:"manuellewerte",renderContent:()=>renderEinnahmen()},
  wasser:{title:"Zähler",kicker:"Objekt vorbereiten",firstSection:"meterInventoryDummyValidationSection",nextTab:"mieterverwaltung",renderContent:null},
  manuellewerte:{title:"Manuelle & externe Werte",kicker:"Eingaben",firstSection:"manualValuesSection",nextTab:"verbraeuche",renderContent:()=>renderManualExternalValues()},
  verbraeuche:{title:"Verbräuche erfassen",kicker:"Verbrauchserfassung",firstSection:"meterHouseSection",nextTab:"umlage",renderContent:()=>renderWaterMeters()},
  umlage:{title:"Nebenkostenumlage",kicker:"Berechnung",firstSection:"allocationTenantResultSection",nextTab:"vorauszahlungsanpassung",renderContent:()=>renderUmlage()},
  vorauszahlungsanpassung:{title:"Vorauszahlungsanpassung",kicker:"Planung",firstSection:"prepaymentRulesSection",nextTab:"qualitaet",renderContent:()=>renderPrepaymentAdjustment()},
  qualitaet:{title:"Qualitätsprüfung",kicker:"Kontrolle",firstSection:"qualityOverviewSection",nextTab:"briefe",renderContent:()=>renderQuality()},
  briefe:{title:"Abrechnungsbriefe",kicker:"Ausgabe",firstSection:"lettersEditorSection",nextTab:"export",renderContent:()=>renderBrief()},
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
function dashboardStats() {
  const units=Array.isArray(state && state.wohnungen) ? state.wohnungen.filter(w=>w && w.id) : [];
  const tenants=safeOverviewCall(()=>billableTenantRows(), Array.isArray(state && state.mieter) ? state.mieter.filter(m=>m && (m.name || m.wohnung)) : []);
  const costs=Array.isArray(state && state.kostenarten) ? state.kostenarten.filter(k=>k && k.kostenart && k.inNK === "Ja") : [];
  const prepayments=tenants.reduce((sum,tenant)=>sum+num(tenant.nkVoraus),0);
  const objectValidation=safeOverviewCall(()=>validateObjectStandard(state),{valid:false,errors:[],warnings:[],infos:[]});
  const quality=safeOverviewCall(()=>NK_PRO_MODULES.qualityAssurance.inspect({scope:"currentBilling"}),null);
  const qualityIssues=quality && Array.isArray(quality.issues) ? quality.issues.filter(issue=>issue && issue.severity !== "OK") : [];
  const activeBilling=safeOverviewCall(()=>NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling(),false);
  const finalized=safeOverviewCall(()=>NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized(),false);
  return {
    units, tenants, costs, prepayments, objectValidation, qualityIssues, activeBilling, finalized,
    objectLabel:safeOverviewCall(()=>currentObjectLabel(),"Objekt"), year:safeOverviewCall(()=>currentAbrechnungsjahr(),"–")
  };
}
function valueKindBadge(kind) { return '<span class="dashboard-value-badge dashboard-value-badge--'+kind+'">'+(kind === "dummy" ? "Vorschau" : "Echtwert")+'</span>'; }
function dashboardValue(label,value,kind="real",hint="",tone="blue") {
  return '<article class="dashboard-value-card dashboard-value-card--'+tone+'" data-value-kind="'+kind+'"><div class="dashboard-value-card__top"><span>'+escapeHtml(label)+'</span>'+valueKindBadge(kind)+'</div><strong>'+escapeHtml(String(value))+'</strong>'+(hint?'<small>'+escapeHtml(hint)+'</small>':'')+'</article>';
}
function dashboardAction(label,target,icon,meta="") {
  return '<button class="dashboard-entry" type="button" data-ui-action="navigation.switchTab" data-ui-args="[&quot;'+escapeHtml(target)+'&quot;]"><span class="dashboard-entry__icon">'+ap17Icon(icon)+'</span><span class="dashboard-entry__copy"><strong>'+escapeHtml(label)+'</strong>'+(meta?'<small>'+escapeHtml(meta)+'</small>':'')+'</span><span class="dashboard-entry__arrow" aria-hidden="true">→</span></button>';
}
function renderObjectDashboard(root, stats) {
  const validation=stats.objectValidation || {errors:[],warnings:[]};
  const errors=Array.isArray(validation.errors)?validation.errors.length:0;
  const warnings=Array.isArray(validation.warnings)?validation.warnings.length:0;
  const openCount=errors+warnings;
  const status=errors ? "Prüfung erforderlich" : (warnings ? "Mit Hinweisen" : "Vorbereitet");
  const statusTone=errors ? "red" : (warnings ? "orange" : "green");
  root.innerHTML = '<div class="dashboard-preview-notice"><strong>Hinweis zu Vorschauwerten</strong><span>Mit „Vorschau“ gekennzeichnete Werte sind fiktiv. Die fachliche Logik für Vollständigkeit und Empfehlungen wird in einem späteren Arbeitspaket entwickelt.</span></div>'+
    '<div class="dashboard-value-grid">'+
      dashboardValue("Aktuelles Objekt",stats.objectLabel,"real","Ein Gebäude im vereinfachten Objektmodell","blue")+
      dashboardValue("Gebäudekurzcode","ARB5","real","Verbindlicher Projektkontext","petrol")+
      dashboardValue("Wohnungen",stats.units.length,"real","Vorhandene Wohnungsdatensätze","blue")+
      dashboardValue("Mietverhältnisse",stats.tenants.length,"real","Abrechnungsrelevante Datensätze","violet")+
    '</div>'+
    '<div class="dashboard-summary-grid">'+
      '<article class="dashboard-status-panel dashboard-status-panel--'+statusTone+'"><div class="dashboard-panel-heading"><span>'+ap17Icon("shield")+'</span><div><h3>Objektstatus</h3>'+valueKindBadge("real")+'</div></div><strong data-value-kind="real">'+escapeHtml(status)+'</strong><p><span data-value-kind="real">'+escapeHtml(String(openCount))+'</span> offene oder unvollständige Angaben aus der vorhandenen Objektprüfung.</p></article>'+
      '<article class="dashboard-status-panel dashboard-status-panel--blue" data-value-kind="dummy"><div class="dashboard-panel-heading"><span>'+ap17Icon("dashboard")+'</span><div><h3>Stammdatenvollständigkeit</h3>'+valueKindBadge("dummy")+'</div></div><strong>82 %</strong><p>Fiktiver Orientierungswert; Berechnungsregeln sind noch festzulegen.</p></article>'+
      '<article class="dashboard-next-step" data-value-kind="dummy"><div><span class="dashboard-next-step__label">Nächster sinnvoller Vorbereitungsschritt</span>'+valueKindBadge("dummy")+'<h3>Wohnungsflächen und Zuordnungen prüfen</h3><p>Diese Empfehlung ist eine Vorschau und noch nicht fachlich berechnet.</p></div><button class="primary" data-ui-action="navigation.switchTab" data-ui-args="[&quot;wohnungsverwaltung&quot;]" type="button">Wohnungen öffnen</button></article>'+
    '</div>'+
    '<section class="dashboard-entry-section"><div class="dashboard-section-heading"><div><p class="page-header__kicker">Direkteinstiege</p><h3>Objekt vorbereiten</h3></div><span>4 Arbeitsbereiche</span></div><div class="dashboard-entry-grid dashboard-entry-grid--four">'+
      dashboardAction("Objektdaten","objekt","building","Objektstandard und Zuordnungen")+
      dashboardAction("Wohnungen","wohnungsverwaltung","home","Bestand und Flächen")+
      dashboardAction("Mieter","mieterverwaltung","users","Verträge und Kontakte")+
      dashboardAction("Zähler-DUMMY","wasser","meter","Reiner Clickdummy")+
    '</div></section>';
}
function workflowStage(label,target,icon,status,statusClass) {
  return '<button class="workflow-stage workflow-stage--'+statusClass+'" type="button" data-value-kind="dummy" data-ui-action="navigation.switchTab" data-ui-args="[&quot;'+escapeHtml(target)+'&quot;]"><span class="workflow-stage__icon">'+ap17Icon(icon)+'</span><span class="workflow-stage__copy"><strong>'+escapeHtml(label)+'</strong><small>Vorschau-Status</small></span><span class="workflow-stage__status">'+escapeHtml(status)+'</span></button>';
}
function renderBillingDashboard(root, stats) {
  const status=stats.finalized ? "Finalisiert" : (stats.activeBilling ? "In Bearbeitung" : "Noch nicht angelegt");
  const statusTone=stats.finalized ? "petrol" : (stats.activeBilling ? "green" : "orange");
  const openIssues=stats.qualityIssues.length;
  root.innerHTML = '<div class="dashboard-preview-notice"><strong>Hinweis zu Vorschauwerten</strong><span>Fortschritt, empfohlener nächster Schritt und Workflowstatus sind fiktive Vorschauwerte. Produktive Fachlogik wird dadurch nicht vorgetäuscht.</span></div>'+
    '<div class="dashboard-value-grid dashboard-value-grid--five">'+
      dashboardValue("Aktuelles Objekt",stats.objectLabel,"real","Aktiver Projektkontext","blue")+
      dashboardValue("Gebäudekurzcode","ARB5","real","Verbindlicher Objektkurzcode","blue")+
      dashboardValue("Abrechnungsjahr",stats.year,"real","Aktueller lokaler Arbeitsstand","petrol")+
      dashboardValue("Bearbeitungsstatus",status,"real",stats.activeBilling?"Abrechnung vorhanden":"Über „Neue Abrechnung“ anlegen",statusTone)+
      dashboardValue("Abrechnungsfortschritt","64 %","dummy","Fiktiver Orientierungswert","violet")+
    '</div>'+
    '<div class="billing-fact-strip">'+
      '<div data-value-kind="real"><span>Wohnungen</span><strong>'+stats.units.length+'</strong>'+valueKindBadge("real")+'</div>'+
      '<div data-value-kind="real"><span>Mietverhältnisse</span><strong>'+stats.tenants.length+'</strong>'+valueKindBadge("real")+'</div>'+
      '<div data-value-kind="real"><span>Aktive Kostenarten</span><strong>'+stats.costs.length+'</strong>'+valueKindBadge("real")+'</div>'+
      '<div data-value-kind="real"><span>NK-Vorauszahlungen</span><strong>'+escapeHtml(overviewMoney(stats.prepayments))+'</strong>'+valueKindBadge("real")+'</div>'+
      '<div data-value-kind="real"><span>Offene Prüfhinweise</span><strong>'+openIssues+'</strong>'+valueKindBadge("real")+'</div>'+
    '</div>'+
    '<article class="dashboard-next-step dashboard-next-step--billing" data-value-kind="dummy"><div><span class="dashboard-next-step__label">Nächster sinnvoller Arbeitsschritt</span>'+valueKindBadge("dummy")+'<h3>Kostenarten und Rechnungsbeträge vervollständigen</h3><p>Fiktive Empfehlung; die spätere Logik muss Abhängigkeiten und Blockaden belastbar auswerten.</p></div><button class="primary" data-ui-action="navigation.switchTab" data-ui-args="[&quot;einstellungen&quot;]" type="button">Kosten erfassen</button></article>'+
    '<section class="dashboard-entry-section"><div class="dashboard-section-heading"><div><p class="page-header__kicker">Abrechnungsprozess</p><h3>Arbeitsschritte und Direkteinstiege</h3></div><span>Vorschau-Workflow</span></div><div class="workflow-stage-grid">'+
      workflowStage("Mieter & Wohnungen","mieter","users","Erledigt","done")+
      workflowStage("Miete & Vorauszahlungen","einnahmen","wallet","Erledigt","done")+
      workflowStage("Kosten erfassen","einstellungen","receipt","Warnung","warning")+
      workflowStage("Manuelle & externe Werte","manuellewerte","input","Offen","open")+
      workflowStage("Verbräuche erfassen","verbraeuche","droplet","Blockiert","blocked")+
      workflowStage("Verteilung","umlage","distribution","Blockiert","blocked")+
      workflowStage("Prüfung","qualitaet","shield","Warnung","warning")+
      workflowStage("Neue Vorauszahlungen","vorauszahlungsanpassung","calculator","Offen","open")+
      workflowStage("Briefe","briefe","mail","Blockiert","blocked")+
      workflowStage("Export","export","download","Blockiert","blocked")+
      workflowStage("Archiv","archiv","archive","Offen","open")+
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
  const archived=safeOverviewCall(()=>isArchiveViewer(),false);
  const finalized=safeOverviewCall(()=>NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized(),false);
  const hasBilling=safeOverviewCall(()=>archived||NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling(),archived);
  const period=hasBilling?safeOverviewCall(()=>pageHeaderPeriodLabel(),"–"):"–";
  Object.entries(TAB_DEFINITIONS).forEach(([tabId,def])=>{
    const page=document.querySelector('[data-page-tab="'+tabId+'"]'); if (!page) return;
    const billingPage=BILLING_NAV_TABS.includes(tabId) || tabId === "start";
    const value=page.querySelector('[data-page-period]'); if (value && billingPage) value.textContent=period||"–";
    const badge=page.querySelector('[data-page-readonly]');
    if (badge) {
      badge.hidden=!billingPage;
      if (!billingPage) return;
      badge.hidden=false;
      badge.classList.add("billing-status-badge");
      badge.classList.remove("is-working","is-finalized","is-archived","is-none");
      if (archived) { badge.textContent="Archiviert · schreibgeschützt"; badge.classList.add("is-archived"); }
      else if (finalized) { badge.textContent="Finalisiert · schreibgeschützt"; badge.classList.add("is-finalized"); }
      else if (hasBilling) { badge.textContent="In Bearbeitung · bearbeitbar"; badge.classList.add("is-working"); }
      else { badge.textContent="Keine Abrechnung geöffnet"; badge.classList.add("is-none"); }
    }
    const status=page.querySelector('[data-page-save-status]'); if (status) status.textContent=archived?"Archiviert":(finalized?"Finalisiert":"Gespeichert");
    const saveButton=page.querySelector('[data-page-save]'); if (saveButton) saveButton.disabled=archived||finalized;
  });
  const activeSection=document.querySelector('section.tab.active');
  const globalTitle=document.getElementById('workspaceTitle');
  if (globalTitle) { globalTitle.textContent=''; globalTitle.hidden=true; }
}

function auditV992Structure() {
  const objectDashboard=document.querySelector('[data-area-dashboard="object"]');
  const billingDashboard=document.querySelector('[data-area-dashboard="billing"]');
  const workingPages=Array.from(document.querySelectorAll('section.tab')).filter(tab=>!["landing","objektuebersicht","start"].includes(tab.id));
  const checks={
    objectDashboard:!!objectDashboard,
    billingDashboard:!!billingDashboard,
    objectDirectEntries:!!objectDashboard && objectDashboard.querySelectorAll('.dashboard-entry').length===4,
    billingWorkflowEntries:!!billingDashboard && billingDashboard.querySelectorAll('.workflow-stage').length===11,
    previewNotices:document.querySelectorAll('.dashboard-preview-notice').length===2,
    realValues:document.querySelectorAll('[data-value-kind="real"]').length===15,
    dummyValues:document.querySelectorAll('[data-value-kind="dummy"]').length===15,
    noGenericOverviewGrids:document.querySelectorAll('.overview-grid').length===0,
    workingPagesWithoutDashboards:workingPages.every(page=>!page.querySelector('.area-dashboard,.overview-grid')),
    contextBar:!!document.querySelector('[data-global-billing-context]'),
    svgSectionChevrons:Array.from(document.querySelectorAll('.page-section__chevron')).every(node=>!!node.querySelector('svg')),
    compactHeaders:Array.from(document.querySelectorAll('.app-page')).every(page=>page.querySelectorAll(':scope > .page-header').length===1)
  };
  const report={version:APP_VERSION,workPackage:"AP17",generatedAt:new Date().toISOString(),allPassed:Object.values(checks).every(Boolean),checks};
  NK_PRO_MODULES.runtimeDiagnostics.setStructureAudit(report);
  document.documentElement.dataset.v992Audit=report.allPassed?'passed':'failed';
  document.documentElement.dataset.ap17Audit=report.allPassed?'passed':'failed';
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
