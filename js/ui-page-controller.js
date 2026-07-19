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
      ["Differenzentscheidungen", () => NK_PRO_MODULES.billingReview.reconcile(state)],
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



const AP17_DASHBOARD_TABS = Object.freeze(["objektuebersicht"]);
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
  objekt:{title:"Objektdaten",kicker:"Objekt vorbereiten",firstSection:null,nextTab:"wohnungsverwaltung",renderContent:()=>renderObjectDataPage()},
  start:{title:"Nebenkostenabrechnung – Übersicht",kicker:"Nebenkosten abrechnen",firstSection:"startRecordsSection",nextTab:"mieter",renderContent:()=>renderStart()},
  archiv:{title:"Abrechnungsarchiv",kicker:"Archiv",firstSection:"archiveRecordsSection",nextTab:"start",renderContent:()=>renderArchive()},
  mieterverwaltung:{title:"Mietverhältnisse",kicker:"Objekt vorbereiten",firstSection:null,nextTab:"wohnungsverwaltung",disableSaveInReadOnly:true,renderContent:()=>renderStartTenantManagement()},
  wohnungsverwaltung:{title:"Wohnungen",kicker:"Objekt vorbereiten",firstSection:null,nextTab:"mieterverwaltung",disableSaveInReadOnly:true,renderContent:()=>renderStartUnitManagement()},
  sicherung:{title:"Datensicherung & System",kicker:"Extras",firstSection:"backupMainSection",nextTab:"landing",renderContent:()=>renderSicherung()},
  mieter:{title:"Mietverhältnisse",kicker:"Nebenkosten abrechnen",firstSection:null,nextTab:"einnahmen",renderContent:()=>renderWohnungen()},
  einstellungen:{title:"Gesamtkosten erfassen",kicker:"Nebenkosten abrechnen",firstSection:"costEditSection",nextTab:"manuellewerte",renderContent:()=>renderEinstellungen()},
  einnahmen:{title:"Vorauszahlungen",kicker:"Nebenkosten abrechnen",firstSection:null,nextTab:"einstellungen",renderContent:()=>renderEinnahmen()},
  wasser:{title:"Zähler",kicker:"Objekt vorbereiten",firstSection:null,nextTab:"mieterverwaltung",renderContent:()=>renderMeterInventoryDummyPage()},
  manuellewerte:{title:"Individuelle Werte und Verbräuche erfassen",kicker:"Nebenkosten abrechnen",firstSection:null,nextTab:"umlage",renderContent:()=>renderIndividualValues()},
  verbraeuche:{title:"Individuelle Werte und Verbräuche erfassen",kicker:"Nebenkosten abrechnen",firstSection:null,nextTab:"umlage",renderContent:()=>renderIndividualValues()},
  umlage:{title:"Ergebnis der Abrechnung",kicker:"Nebenkosten abrechnen",firstSection:"allocationTenantResultSection",nextTab:"vorauszahlungsanpassung",renderContent:()=>renderUmlage()},
  vorauszahlungsanpassung:{title:"Vorauszahlungen anpassen",kicker:"Nebenkosten abrechnen",firstSection:"prepaymentRulesSection",nextTab:"qualitaet",renderContent:()=>renderPrepaymentAdjustment()},
  qualitaet:{title:"Abrechnung prüfen und freigeben",kicker:"Nebenkosten abrechnen",firstSection:"qualityOverviewSection",nextTab:"briefe",renderContent:()=>renderQuality()},
  briefe:{title:"Abrechnungsbriefe erstellen",kicker:"Nebenkosten abrechnen",firstSection:"lettersEditorSection",nextTab:"export",renderContent:()=>renderBrief()},
  auswertungen:{title:"Auswertungen",kicker:"Analyse",firstSection:null,nextTab:"archiv",renderContent:()=>renderAnalyticsOverview()},
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
function objectDataText(value, fallback="Nicht hinterlegt") {
  const normalized=String(value === undefined || value === null ? "" : value).trim();
  return normalized || fallback;
}
function objectDataIssueRoute(code) {
  const normalized=String(code || "").toUpperCase();
  if (normalized === "UNIT_BUILDING_UNKNOWN" || normalized.startsWith("UNIT_")) return {target:"wohnungsverwaltung",label:"Wohnungen öffnen",icon:"home"};
  if (normalized.startsWith("CONTRACT_") || normalized.startsWith("PARTNER_")) return {target:"mieterverwaltung",label:"Mietverhältnisse öffnen",icon:"users"};
  if (normalized.startsWith("METER_") || normalized.startsWith("ELECTRICITY_DUMMY_")) return {target:"wasser",label:"Zähler öffnen",icon:"meter"};
  return {target:"sicherung",label:"Systemdiagnose öffnen",icon:"shield"};
}
function objectDataPrimaryRoute(issues) {
  const rows=Array.isArray(issues) ? issues : [];
  const priorities=["wohnungsverwaltung","mieterverwaltung","wasser","sicherung"];
  for (const target of priorities) {
    const issue=rows.find(row=>objectDataIssueRoute(row && row.code).target===target);
    if (issue) return {...objectDataIssueRoute(issue.code),issue};
  }
  return null;
}
function objectDataModel() {
  const standard=state && state.objektStandard && typeof state.objektStandard === "object" && !Array.isArray(state.objektStandard) ? state.objektStandard : null;
  const object=standard && standard.objekt && typeof standard.objekt === "object" ? standard.objekt : {};
  const buildings=standard && Array.isArray(standard.gebaeude) ? standard.gebaeude : [];
  const building=buildings[0] && typeof buildings[0] === "object" ? buildings[0] : {};
  const validation=safeOverviewCall(()=>validateObjectStandard(state),{valid:false,errors:[{code:"OBJECT_STANDARD_MISSING",severity:"error",message:"Objektstandard fehlt."}],warnings:[],infos:[]});
  const errors=Array.isArray(validation.errors) ? validation.errors : [];
  const warnings=Array.isArray(validation.warnings) ? validation.warnings : [];
  const infos=Array.isArray(validation.infos) ? validation.infos : [];
  const actionable=errors.length ? errors : warnings;
  const primary=objectDataPrimaryRoute(actionable);
  const objectId=objectDataText(object.id || object.objektId,"Nicht vorhanden");
  const buildingId=objectDataText(building.id || building.gebaeudeId,"Nicht vorhanden");
  const objectLabel=objectDataText(object.bezeichnung,safeOverviewCall(()=>currentObjectLabel(),"Objekt"));
  const buildingLabel=objectDataText(building.bezeichnung,"Nicht hinterlegt");
  const addressParts=[objectDataText(building.strasse,""),[objectDataText(building.plz,""),objectDataText(building.ort,"")].filter(Boolean).join(" ")].filter(Boolean);
  const version=standard ? Number(standard.version || standard.objectStandardVersion) : 0;
  const standardStatus=objectDataText(object.status,"Status nicht hinterlegt");
  const tone=errors.length ? "danger" : (warnings.length ? "warning" : "success");
  const title=errors.length ? "Objektstandard benötigt Korrekturen" : (warnings.length ? "Objektstandard sollte geprüft werden" : "Objektstandard ist konsistent");
  const statusText=errors.length
    ? errors.length+" "+(errors.length===1?"technischer Befund muss":"technische Befunde müssen")+" korrigiert werden"
    : (warnings.length ? warnings.length+" "+(warnings.length===1?"Hinweis muss":"Hinweise müssen")+" geprüft werden" : "Keine Aktion erforderlich");
  const description=errors.length || warnings.length
    ? "Die bestehenden Prüfbefunde werden vollständig angezeigt und in den fachlich verantwortlichen Bereichen korrigiert."
    : "Objekt, Gebäude, Einheiten, Verträge und Zähler sind technisch eindeutig zugeordnet.";
  return {standard,object,building,validation,errors,warnings,infos,primary,objectId,buildingId,objectLabel,buildingLabel,addressParts,version,standardStatus,tone,title,statusText,description};
}
function objectDataAction(label,target,icon,description,extra="") {
  return '<button class="nk-ui-button nk-ui-button--secondary object-data-route" type="button" data-object-data-route="'+escapeHtml(target)+'" data-ui-action="navigation.switchTab" data-ui-args="[&quot;'+escapeHtml(target)+'&quot;]">'+
    '<span class="object-data-route__icon">'+ap17Icon(icon,"object-data-icon")+'</span><span class="object-data-route__copy"><strong>'+escapeHtml(label)+'</strong><small>'+escapeHtml(description)+'</small></span>'+extra+'<span class="object-data-route__arrow" aria-hidden="true">→</span></button>';
}
function renderObjectDataPage() {
  const root=document.querySelector('[data-object-data-view]');
  if (!root) return;
  const model=objectDataModel();
  const issueRows=model.errors.concat(model.warnings);
  const issues=issueRows.length
    ? '<ul class="object-data-issues nk-ui-list nk-ui-list--plain" data-object-data-issues="">'+issueRows.map(row=>'<li class="nk-ui-notice nk-ui-notice--'+(row.severity==="warning"?"warning":"danger")+'"><span class="object-data-issue__symbol" aria-hidden="true">!</span><span><strong>'+escapeHtml(objectDataText(row.message,"Technischer Prüfbefund"))+'</strong><small>Bestehender Prüfbefund · '+escapeHtml(objectDataText(row.code,"TECHNICAL_ISSUE"))+'</small></span></li>').join('')+'</ul>'
    : '';
  const infoRows=model.infos.length
    ? '<div class="object-data-infos" data-object-data-info=""><strong>Technischer Hinweis</strong><ul class="nk-ui-list">'+model.infos.map(row=>'<li>'+escapeHtml(objectDataText(row.message,"Information zur technischen Integrität"))+' <small>('+escapeHtml(objectDataText(row.code,"INFO"))+')</small></li>').join('')+'</ul></div>'
    : '';
  const primary=model.primary
    ? '<button class="primary nk-ui-button nk-ui-button--primary object-data-primary" data-object-data-primary="" data-target="'+escapeHtml(model.primary.target)+'" data-ui-action="navigation.switchTab" data-ui-args="[&quot;'+escapeHtml(model.primary.target)+'&quot;]" type="button">'+ap17Icon(model.primary.icon,"object-data-icon")+escapeHtml(model.primary.label)+'</button>'
    : '';
  const address=model.addressParts.length ? model.addressParts.map(part=>escapeHtml(part)).join('<br>') : 'Nicht hinterlegt';
  const versionLabel=model.version ? 'Version '+escapeHtml(String(model.version))+' · '+escapeHtml(model.standardStatus) : 'Nicht vorhanden · '+escapeHtml(model.standardStatus);
  root.innerHTML=
    '<div class="object-data-main-grid">'+
      '<section class="nk-ui-card object-data-card" data-object-data-identity="" aria-labelledby="objectDataIdentityTitle"><div class="object-data-card__heading"><span class="object-data-card__icon">'+ap17Icon("building","object-data-icon")+'</span><div><p class="object-data-eyebrow">Identität</p><h2 id="objectDataIdentityTitle">Objekt und Gebäude</h2></div></div><dl class="nk-ui-list nk-ui-list--definition object-data-meta"><div><dt>Objekt</dt><dd>'+escapeHtml(model.objectLabel)+'</dd></div><div><dt>Anschrift</dt><dd>'+address+'</dd></div><div><dt>Objekt-ID</dt><dd><code>'+escapeHtml(model.objectId)+'</code></dd></div><div><dt>Gebäude</dt><dd>'+escapeHtml(model.buildingLabel)+'</dd></div><div><dt>Gebäude-ID</dt><dd><code>'+escapeHtml(model.buildingId)+'</code></dd></div><div><dt>Objektstandard</dt><dd>'+versionLabel+'</dd></div></dl></section>'+
      '<section class="nk-ui-card object-data-card object-data-integrity object-data-integrity--'+model.tone+'" data-object-data-integrity="" aria-labelledby="objectDataIntegrityTitle"><div class="object-data-card__heading"><span class="object-data-card__icon object-data-card__icon--'+model.tone+'">'+ap17Icon("shield","object-data-icon")+'</span><div><p class="object-data-eyebrow">Technische Integrität</p><h2 id="objectDataIntegrityTitle">'+escapeHtml(model.title)+'</h2></div></div><div class="nk-ui-notice nk-ui-notice--'+model.tone+' object-data-status" data-object-data-status="" role="status"><span class="object-data-status__dot" aria-hidden="true"></span><strong>'+escapeHtml(model.statusText)+'</strong></div><p class="object-data-status__description">'+escapeHtml(model.description)+'</p>'+issues+infoRows+primary+'</section>'+
    '</div>'+
    '<section class="nk-ui-card object-data-card object-data-routes" data-object-data-routes="" aria-labelledby="objectDataRoutesTitle"><div class="object-data-routes__header"><div><p class="object-data-eyebrow">Änderungswege</p><h2 id="objectDataRoutesTitle">Wo werden Daten geändert?</h2><p>Die führenden Daten bleiben in ihren bestehenden Pflegebereichen.</p></div><button class="nk-ui-button nk-ui-button--secondary object-data-overview-link" data-object-data-overview="" data-ui-action="navigation.switchTab" data-ui-args="[&quot;objektuebersicht&quot;]" type="button">Zur Objektübersicht</button></div><div class="object-data-route-list">'+
      objectDataAction("Wohnungen","wohnungsverwaltung","home","Bezeichnung, Status, Fläche und Einheitenzuordnung")+
      objectDataAction("Mietverhältnisse","mieterverwaltung","users","Partner, Vertragszeiträume und Kontaktdaten")+
      objectDataAction("Zähler","wasser","meter","Bestehender Inventar-DUMMY; keine neue Fachfunktion",'<span class="nk-ui-status object-data-route__badge">DUMMY</span>')+
      objectDataAction("Datensicherung & System","sicherung","shield","Technische Diagnose bei nicht direkt pflegbaren Standardfehlern")+
    '</div></section>';
}

function objectOverviewModel(stats) {
  const validation=stats.objectValidation || {errors:[],warnings:[]};
  const errors=Array.isArray(validation.errors) ? validation.errors.length : 0;
  const warnings=Array.isArray(validation.warnings) ? validation.warnings.length : 0;
  const unitsTotal=stats.activeUnits.length;
  const unitsCompleteCount=stats.completeUnits.length;
  const tenantsTotal=stats.tenants.length;
  const tenantsCompleteCount=stats.completeTenants.length;
  const objectComplete=errors===0 && warnings===0;
  const unitsComplete=unitsTotal>0 && unitsCompleteCount===unitsTotal;
  const tenantsComplete=tenantsTotal>0 && tenantsCompleteCount===tenantsTotal;
  const completedCount=[objectComplete,unitsComplete,tenantsComplete].filter(Boolean).length;
  const missingUnits=Math.max(0,unitsTotal-unitsCompleteCount);
  const missingTenants=Math.max(0,tenantsTotal-tenantsCompleteCount);
  let next={target:"start",title:"Nebenkostenabrechnung beginnen",description:"Die produktiven Grundlagen der Objektvorbereitung sind vollständig.",button:"Zur Abrechnungsübersicht"};
  if (!objectComplete) {
    const issueParts=[];
    if (errors) issueParts.push(errors+' blockierende '+(errors===1?'Angabe':'Angaben'));
    if (warnings) issueParts.push(warnings+' warnende '+(warnings===1?'Angabe':'Angaben'));
    next={target:"objekt",title:"Objektdaten prüfen",description:(issueParts.join(' und ') || 'Offene Objektangaben')+' benötigen Prüfung.',button:"Objektdaten öffnen"};
  } else if (!unitsComplete) {
    next={target:"wohnungsverwaltung",title:"Wohnungen vervollständigen",description:missingUnits===1?'Eine Wohneinheit benötigt noch vollständige Stammdaten.':missingUnits+' Wohneinheiten benötigen noch vollständige Stammdaten.',button:"Wohnungen öffnen"};
  } else if (!tenantsComplete) {
    next={target:"mieterverwaltung",title:"Mietverhältnisse vervollständigen",description:missingTenants===1?'Ein Mietverhältnis benötigt noch vollständige Stammdaten.':missingTenants+' Mietverhältnisse benötigen noch vollständige Stammdaten.',button:"Mietverhältnisse öffnen"};
  }
  return {errors,warnings,unitsTotal,unitsCompleteCount,tenantsTotal,tenantsCompleteCount,objectComplete,unitsComplete,tenantsComplete,completedCount,next};
}
function renderObjectDashboard(root, stats) {
  const model=objectOverviewModel(stats);
  const overallComplete=model.completedCount===3;
  const statusMarkup=(label,tone="")=>'<span class="nk-ui-status'+(tone?' nk-ui-status--'+tone:'')+'">'+escapeHtml(label)+'</span>';
  const task=(key,label,target,icon,statusLabel,statusToneName,description,muted=false)=>
    '<button class="dashboard-entry nk-ui-card nk-ui-card--interactive object-overview-task'+(muted?' nk-ui-card--muted object-overview-task--dummy':'')+'" data-value-kind="'+(muted?'dummy':'data')+'" data-object-overview-task="'+escapeHtml(key)+'" data-target="'+escapeHtml(target)+'" data-ui-action="navigation.switchTab" data-ui-args="[&quot;'+escapeHtml(target)+'&quot;]" type="button">'+
      '<span class="object-overview-task__icon">'+ap17Icon(icon)+'</span><span class="object-overview-task__copy"><span class="object-overview-task__title">'+escapeHtml(label)+'</span>'+statusMarkup(statusLabel,statusToneName)+'<span class="object-overview-task__description">'+escapeHtml(description)+'</span></span><span class="object-overview-task__arrow" aria-hidden="true">→</span></button>';
  const objectStatus=model.errors ? "Blockiert" : (model.warnings ? "Warnung" : "Vollständig");
  const objectTone=model.errors ? "danger" : (model.warnings ? "warning" : "success");
  const objectDescription=model.objectComplete
    ? "Objektstandard und grundlegende Zuordnungen sind vollständig."
    : model.errors+' blockierende und '+model.warnings+' warnende Angaben prüfen.';
  const unitsStatus=model.unitsComplete ? "Vollständig" : model.unitsCompleteCount+' von '+model.unitsTotal+' vollständig';
  const tenantsStatus=model.tenantsComplete ? "Vollständig" : model.tenantsCompleteCount+' von '+model.tenantsTotal+' vollständig';
  root.innerHTML =
    '<article class="nk-ui-card object-overview-summary" data-object-overview-summary="">'+
      '<div class="object-overview-summary__identity"><span class="object-overview-summary__icon">'+ap17Icon(overallComplete?"shield":"building")+'</span><div class="object-overview-summary__copy"><h2>'+escapeHtml(stats.objectLabel)+'</h2><p>Gebäudekurzcode '+escapeHtml(stats.objectCode)+'</p></div><div class="object-overview-summary__status">'+statusMarkup(overallComplete?"Vorbereitung vollständig":"Handlungsbedarf",overallComplete?"success":"warning")+'<span>'+model.completedCount+' von 3 Bereichen vollständig</span></div></div>'+
      '<div class="object-overview-summary__next"><p class="object-overview-label">Nächster Schritt</p><h2>'+escapeHtml(model.next.title)+'</h2><p>'+escapeHtml(model.next.description)+'</p><button class="primary nk-ui-button nk-ui-button--primary" data-object-overview-primary="" data-target="'+escapeHtml(model.next.target)+'" data-ui-action="navigation.switchTab" data-ui-args="[&quot;'+escapeHtml(model.next.target)+'&quot;]" type="button">'+escapeHtml(model.next.button)+'</button></div>'+
    '</article>'+
    '<section class="object-overview-tasks" aria-labelledby="objectOverviewTasksTitle"><div class="object-overview-tasks__heading"><div><p class="object-overview-label">Arbeitsbereiche</p><h2 id="objectOverviewTasksTitle">Objektvorbereitung</h2></div><span>3 produktive Bereiche · 1 DUMMY</span></div><div class="object-overview-task-grid">'+
      task("object","Objektdaten","objekt","building",objectStatus,objectTone,objectDescription)+
      task("units","Wohnungen","wohnungsverwaltung","home",unitsStatus,model.unitsComplete?"success":"warning",model.unitsComplete?'Alle aktiven Wohneinheiten besitzen vollständige Stammdaten.':Math.max(0,model.unitsTotal-model.unitsCompleteCount)+' aktive Wohneinheiten benötigen noch Angaben.')+
      task("tenancies","Mietverhältnisse","mieterverwaltung","users",tenantsStatus,model.tenantsComplete?"success":"warning",model.tenantsComplete?'Alle relevanten Mietverhältnisse sind zugeordnet.':Math.max(0,model.tenantsTotal-model.tenantsCompleteCount)+' relevante Mietverhältnisse benötigen noch Angaben.')+
      task("meter","Zähler","wasser","meter","DUMMY","","Clickdummy ohne Fachlogik",true)+
    '</div></section>'+
    '<p class="object-overview-boundary">Kostenarten, Umlageschlüssel und Abrechnungsprüfungen erscheinen ausschließlich im Bereich „Nebenkosten abrechnen“.</p>';
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

const AP22F1A_PAGE_SHELL_VARIANTS = Object.freeze({
  objektuebersicht:"default", objekt:"default", wasser:"default",
  archiv:"wide", start:"wide", mieterverwaltung:"wide", wohnungsverwaltung:"wide", sicherung:"wide",
  qualitaet:"wide", einstellungen:"wide", mieter:"wide", einnahmen:"wide", manuellewerte:"wide",
  umlage:"wide", vorauszahlungsanpassung:"wide", briefe:"wide", export:"wide", auswertungen:"wide"
});
function ensureGlobalPageShellsAndHeaders() {
  const landing=document.querySelector("#landing > .landing-page");
  if (landing) {
    landing.classList.add("nk-ui-page-shell","nk-ui-page-shell--default");
    landing.dataset.pageShell="default";
    const landingHeader=landing.querySelector(":scope > .landing-page__intro");
    if (landingHeader) landingHeader.classList.add("nk-ui-page-header");
  }
  Object.entries(AP22F1A_PAGE_SHELL_VARIANTS).forEach(([tabId,variant])=>{
    const page=document.querySelector('[data-page-tab="'+tabId+'"]');
    if (!page) return;
    page.classList.remove("nk-ui-page-shell--default","nk-ui-page-shell--narrow","nk-ui-page-shell--wide");
    page.classList.add("nk-ui-page-shell","nk-ui-page-shell--"+variant);
    page.dataset.pageShell=variant;
    const header=page.querySelector(":scope > .page-header");
    if (!header) return;
    header.classList.add("nk-ui-page-header");
    const title=header.querySelector(":scope .page-header__title");
    if (title && title.tagName !== "H1") {
      const h1=document.createElement("h1");
      Array.from(title.attributes).forEach(attribute=>h1.setAttribute(attribute.name,attribute.value));
      h1.innerHTML=title.innerHTML;
      title.replaceWith(h1);
    }
  });
}

function pageHeaderPeriodLabel() {
  const format = value => {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? match[3] + "." + match[2] + "." + match[1] : dateDe(value);
  };
  return format(periodStart()) + " – " + format(periodEnd());
}
function updateAllPageHeaders() {
  document.querySelectorAll("[data-app-version]").forEach(label=>{ label.textContent=APP_VERSION; });
  ensureGlobalPageShellsAndHeaders();
  const context=NK_PRO_MODULES.billingContext.snapshot();
  const open=NK_PRO_MODULES.billingContext.isOpen();
  const readOnly=NK_PRO_MODULES.billingContext.isReadOnly();
  Object.keys(TAB_DEFINITIONS).forEach(tabId=>{
    const page=document.querySelector('[data-page-tab="'+tabId+'"]');
    if (!page) return;
    const billingPage=BILLING_NAV_TABS.includes(tabId);
    const pageDefinition=TAB_DEFINITIONS[tabId] || {};
    const saveButton=page.querySelector('[data-page-save]');
    if (saveButton&&billingPage) {
      saveButton.hidden=readOnly||!open;
      saveButton.disabled=readOnly||!open;
      saveButton.setAttribute("aria-hidden",saveButton.hidden?"true":"false");
    } else if (saveButton&&pageDefinition.disableSaveInReadOnly) {
      saveButton.hidden=false;
      saveButton.disabled=readOnly;
      saveButton.setAttribute("aria-hidden","false");
      saveButton.setAttribute("aria-disabled",readOnly?"true":"false");
    }
  });
  const globalTitle=document.getElementById('workspaceTitle');
  if (globalTitle) { globalTitle.textContent=''; globalTitle.hidden=true; }
  if (typeof applyBillingContextToDom==="function") applyBillingContextToDom();
}

function auditV992Structure() {
  const objectDashboard=document.querySelector('[data-area-dashboard="object"]');
  const billingPages=BILLING_NAV_TABS.map(tab=>document.querySelector('[data-page-tab="'+tab+'"]')).filter(Boolean);
  const checks={
    objectDashboard:!!objectDashboard,
    objectDirectEntries:!!objectDashboard&&objectDashboard.querySelectorAll('.dashboard-entry').length===4,
    billingDashboardRemoved:!document.querySelector('[data-area-dashboard="billing"]'),
    productiveDashboardValues:document.querySelectorAll('.dashboard-preview-notice').length===0&&document.querySelectorAll('[data-value-kind="dummy"]').length===1,
    controlledContext:NK_PRO_MODULES.billingContext.describe().stateCount===3,
    contextClosedAfterStart:!NK_PRO_MODULES.billingContext.isOpen()||document.documentElement.dataset.billingExplicitlyOpened==="true",
    billingHeadersWithoutRedundantPeriod:billingPages.every(page=>!page.querySelector('[data-page-period]')),
    centralBillingTable:typeof buildBillingRecordsTableHtml==='function'&&((buildBillingRecordsTableHtml().split('<tbody',1)[0].match(/<th(?:\s|>)/g)||[]).length===7),
    contextBar:!!document.querySelector('[data-global-billing-context]'),
    svgSectionChevrons:Array.from(document.querySelectorAll('.page-section__chevron')).every(node=>!!node.querySelector('svg')),
    compactHeaders:Array.from(document.querySelectorAll('.app-page')).every(page=>page.querySelectorAll(':scope > .page-header').length===1)
  };
  const report={version:APP_VERSION,workPackage:"AP22F6B",generatedAt:new Date().toISOString(),allPassed:Object.values(checks).every(Boolean),checks};
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
