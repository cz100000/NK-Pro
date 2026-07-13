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



const OVERVIEW_TITLES = ["Sammelinfo", "Prüfung", "Empfohlener nächster Schritt", "Schnellaktionen"];

const TAB_DEFINITIONS = {
  objekt:{title:"Objekt",kicker:"Objekt vorbereiten",firstSection:"objectPreparationSection",nextTab:"wohnungsverwaltung",renderContent:null},
  start:{title:"Abrechnungsübersicht",kicker:"Nebenkosten abrechnen",firstSection:"startRecordsSection",nextTab:"mieter",renderContent:()=>renderStart()},
  archiv:{title:"Abrechnungsarchiv",kicker:"Archiv",firstSection:"archiveRecordsSection",nextTab:"start",renderContent:()=>renderArchive()},
  mieterverwaltung:{title:"Mieterverwaltung",kicker:"Objekt vorbereiten",firstSection:"masterTenantSection",nextTab:"wohnungsverwaltung",renderContent:()=>renderStartTenantManagement()},
  wohnungsverwaltung:{title:"Wohnungsverwaltung",kicker:"Objekt vorbereiten",firstSection:"masterUnitSection",nextTab:"mieterverwaltung",renderContent:()=>renderStartUnitManagement()},
  sicherung:{title:"Datensicherung & System",kicker:"Extras",firstSection:"backupMainSection",nextTab:"landing",renderContent:()=>renderSicherung()},
  mieter:{title:"Mieter & Wohnungen",kicker:"Abrechnungsstammdaten",firstSection:"tenantUnitsSection",nextTab:"einstellungen",renderContent:()=>renderWohnungen()},
  einstellungen:{title:"Kostenarten & Einstellungen",kicker:"Abrechnungseinstellungen",firstSection:"costEditSection",nextTab:"einnahmen",renderContent:()=>renderEinstellungen()},
  einnahmen:{title:"Kaltmiete & NK-Vorauszahlungen",kicker:"Einnahmen",firstSection:"incomeRentSection",nextTab:"wasser",renderContent:()=>renderEinnahmen()},
  wasser:{title:"Zählerstände",kicker:"Verbrauch",firstSection:"meterHouseSection",nextTab:"manuellewerte",renderContent:()=>renderWaterMeters()},
  manuellewerte:{title:"Manuelle & externe Werte",kicker:"Eingaben",firstSection:"manualValuesSection",nextTab:"umlage",renderContent:()=>renderManualExternalValues()},
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
function overviewCoreStats() {
  const units=Array.isArray(state && state.wohnungen) ? state.wohnungen.filter(w=>w && w.id) : [];
  const activeUnits=units.filter(w=>w.status === "aktiv");
  const tenants=safeOverviewCall(()=>billableTenantRows(), Array.isArray(state && state.mieter) ? state.mieter.filter(m=>m && (m.name || m.wohnung)) : []);
  const archivedTenants=safeOverviewCall(()=>archivedTenantRows(), []);
  const costs=Array.isArray(state && state.kostenarten) ? state.kostenarten.filter(k=>k && k.kostenart) : [];
  const activeCosts=costs.filter(k=>k.inNK === "Ja");
  const completeCosts=activeCosts.filter(k=>safeOverviewCall(()=>NK_PRO_MODULES.costActions.kostenStatus(k),"") === "Vollständig");
  const income=tenants.reduce((a,m)=>{a.rent+=num(m.kaltErhalten);a.prepayments+=num(m.nkVoraus);a.corrections+=num(m.vorjahresKorrektur);return a;},{rent:0,prepayments:0,corrections:0});
  const calc=safeOverviewCall(()=>calculateUmlage(),null);
  const totals=calc ? safeOverviewCall(()=>umlageTotals(calc),null) : null;
  const quality=safeOverviewCall(()=>NK_PRO_MODULES.qualityAssurance.inspect({scope:"currentBilling"}),null);
  const issues=quality && Array.isArray(quality.issues) ? quality.issues.filter(i=>i.severity !== "OK") : [];
  const errors=issues.filter(i=>i.severity === "Fehler");
  const checks=issues.filter(i=>i.severity === "Prüfen");
  const objectStandard=safeOverviewCall(()=>state && state.objektStandard ? state.objektStandard : null,null);
  const objectValidation=safeOverviewCall(()=>validateObjectStandard(state),{valid:false,errors:[],warnings:[],infos:[]});
  const billingReadiness=safeOverviewCall(()=>validateBillingReadiness(state),{valid:false,errors:[],warnings:[],infos:[],meterSelection:{included:[],excluded:[]}});
  const meters=safeOverviewCall(()=>{
    if (objectStandard && Array.isArray(objectStandard.zaehler)) return objectStandard.zaehler;
    if (state && state.waterMeters && Array.isArray(state.waterMeters.rows)) return state.waterMeters.rows;
    if (state && Array.isArray(state.wasserzaehler)) return state.wasserzaehler;
    if (state && Array.isArray(state.zaehler)) return state.zaehler;
    return [];
  },[]);
  const electricityDummyMeters=meters.filter(meter=>safeOverviewCall(()=>NK_PRO_MODULES.objectStandard.isElectricityDummyMeter(meter),false));
  const archives=safeOverviewCall(()=>{
    const values=[];
    if (state && Array.isArray(state.jahresArchiv)) values.push(...state.jahresArchiv);
    if (state && Array.isArray(state.yearArchive)) values.push(...state.yearArchive);
    if (state && state.meta && Array.isArray(state.meta.yearArchive)) values.push(...state.meta.yearArchive);
    return values.length;
  },0);
  return {units,activeUnits,tenants,archivedTenants,costs,activeCosts,completeCosts,income,calc,totals,quality,issues,errors,checks,meters,electricityDummyMeters,objectStandard,objectValidation,billingReadiness,archives,
    year:safeOverviewCall(()=>currentAbrechnungsjahr(),"–"), finalized:safeOverviewCall(()=>NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized(),false)};
}
function overviewStatus(stats) {
  if (stats.errors.length) return {status:"error",headline:stats.errors.length+" Fehler",items:[{text:"Fehler vor der Ausgabe beheben",status:"error"},{text:stats.checks.length+" zusätzliche Prüfpunkte",status:stats.checks.length?"warn":"ok"}]};
  if (stats.checks.length) return {status:"warn",headline:stats.checks.length+" Prüfpunkte",items:[{text:"Fachliche Kontrolle erforderlich",status:"warn"},{text:"Keine blockierenden technischen Fehler erkannt",status:"ok"}]};
  return {status:"ok",headline:"Plausibel",items:[{text:"Keine offenen Fehler",status:"ok"},{text:"Datenstand weiter fachlich kontrollieren",status:"ok"}]};
}
function overviewStructuredValidation(result, successText) {
  const errors=Array.isArray(result && result.errors)?result.errors:[];
  const warnings=Array.isArray(result && result.warnings)?result.warnings:[];
  if (errors.length) return {status:"error",headline:errors.length+" blockierende Fehler",items:[{text:errors[0].message||String(errors[0]),status:"error"},{text:warnings.length+" zusätzliche Hinweise",status:warnings.length?"warn":"ok"}]};
  if (warnings.length) return {status:"warn",headline:warnings.length+" Hinweise",items:[{text:warnings[0].message||String(warnings[0]),status:"warn"},{text:"Snapshot wird nur bei kritischen Fehlern blockiert",status:"ok"}]};
  return {status:"ok",headline:successText||"Plausibel",items:[{text:"Objektstandard 1 gültig",status:"ok"},{text:"Keine blockierenden Objektfehler",status:"ok"}]};
}

function buildOverviewData(tabId) {
  const s=overviewCoreStats();
  const commonValidation=overviewStatus(s);
  const next=(text,target,label="Bereich öffnen")=>({text,action:{label,action:"navigation.openSection",args:[target],primary:true}});
  const go=(label,target,primary=false)=>({label,action:"navigation.switchTab",args:[target],primary});
  const open=(label,target,primary=false)=>({label,action:"navigation.openSection",args:[target],primary});
  const save={label:"Speichern",action:"application.save",args:[],primary:true};
  const data={
    objekt:{summary:[["Objekt-ID",s.objectStandard&&s.objectStandard.objekt?(s.objectStandard.objekt.id||"–"):"–"],["Gebäude",s.objectStandard&&Array.isArray(s.objectStandard.gebaeude)?s.objectStandard.gebaeude.length:0],["Einheiten / Verträge",(s.objectStandard&&Array.isArray(s.objectStandard.einheiten)?s.objectStandard.einheiten.length:0)+" / "+(s.objectStandard&&Array.isArray(s.objectStandard.vertraege)?s.objectStandard.vertraege.length:0)],["Zähler / Strom-Dummys",s.meters.length+" / "+s.electricityDummyMeters.length]],validation:overviewStructuredValidation(s.objectValidation,"Objektstandard 1 gültig"),next:next("Objektstandard und abrechnungsrelevante Zuordnungen prüfen.","objectValidationSection"),actions:[go("Wohnungen öffnen","wohnungsverwaltung",true),go("Mieter öffnen","mieterverwaltung"),go("Datensicherung","sicherung")]},
    start:{summary:[["Arbeitsjahr",s.year],["Abrechnungen im Archiv",s.archives],["Mietverhältnisse",s.tenants.length],["Wohnungen",s.units.length]],validation:commonValidation,next:next("Aktuellen Arbeitsstand öffnen oder eine neue Abrechnung anlegen.","startRecordsSection"),actions:[open("Abrechnungen öffnen","startRecordsSection",true),go("Datensicherung & System","sicherung"),save]},
    archiv:{summary:[["Archivierte Abrechnungen",s.archives],["Aktuelle Abrechnung",NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling()?s.year:"Keine"],["Datenbestand","Lokal"],["Schema",DATA_SCHEMA_VERSION]],validation:{status:"ok",headline:"Archiv getrennt erreichbar",items:[{text:"Historische Datensätze bleiben unverändert",status:"ok"},{text:"Öffnen erfolgt schreibgeschützt",status:"ok"}]},next:next("Archivierte Abrechnung auswählen und in der Nur-Ansicht prüfen.","archiveRecordsSection"),actions:[open("Archiv öffnen","archiveRecordsSection",true),{label:"Archiv herunterladen",action:"archive.downloadFull",args:[]},go("Abrechnungsübersicht","start")]},
    mieterverwaltung:{summary:[["Mietverhältnisse",s.tenants.length],["Archiviert",s.archivedTenants.length],["Wohnungen",s.units.length],["Abrechnungsjahr",s.year]],validation:commonValidation,next:next("Mieterstammdaten und archivierte Mietverhältnisse vollständig prüfen.","masterTenantSection"),actions:[open("Mietverhältnisse öffnen","masterTenantSection",true),open("Archiv öffnen","masterTenantArchiveSection"),save]},
    wohnungsverwaltung:{summary:[["Wohnungen gesamt",s.units.length],["Aktiv",s.activeUnits.length],["Inaktiv",Math.max(0,s.units.length-s.activeUnits.length)],["Wohnfläche aktiv",s.activeUnits.reduce((a,w)=>a+num(w.wohnflaeche),0).toLocaleString("de-DE")+" m²"]],validation:commonValidation,next:next("Wohnungsbestand und Flächenangaben kontrollieren.","masterUnitSection"),actions:[open("Wohnungsbestand öffnen","masterUnitSection",true),go("Mieterverwaltung","mieterverwaltung"),save]},
    sicherung:{summary:[["Version",APP_VERSION],["Archivstände",s.archives],["Betriebsart","Offline · lokal"],["Abrechnungsjahr",s.year]],validation:{status:"ok",headline:"Sicherung verfügbar",items:[{text:"Lokale Gesamtsicherung vorhanden",status:"ok"},{text:"Neuer PWA-Cache für V99.4.17",status:"ok"}]},next:next("Vollständige JSON-Sicherung erstellen und Versionsinformationen prüfen.","backupMainSection"),actions:[open("Gesamtsicherung öffnen","backupMainSection",true),open("Version anzeigen","backupVersionSection"),save]},
    mieter:{summary:[["Wohnungen gesamt",s.units.length],["Wohnungen aktiv",s.activeUnits.length],["Mietverhältnisse",s.tenants.length],["Archivierte Mieter",s.archivedTenants.length]],validation:commonValidation,next:next("Bestand und Abrechnung in der Prüfbox abgleichen; danach Kostenarten bearbeiten.","tenantControlSection"),actions:[open("Prüfung öffnen","tenantControlSection",true),open("Mietverhältnisse öffnen","tenantRelationsSection"),go("Kostenarten öffnen","einstellungen")]},
    einstellungen:{summary:[["Kostenarten",s.costs.length],["Aktiv in NK",s.activeCosts.length],["Vollständig",s.completeCosts.length],["Gesamtkosten",overviewMoney(s.activeCosts.reduce((a,k)=>a+num(k.gesamtbetrag),0))]],validation:{status:s.completeCosts.length===s.activeCosts.length?"ok":"warn",headline:s.completeCosts.length+" von "+s.activeCosts.length+" vollständig",items:[{text:"Umlageschlüssel und Beträge prüfen",status:s.completeCosts.length===s.activeCosts.length?"ok":"warn"},{text:"Umlage wird automatisch berechnet",status:"ok"}]},next:next("Fehlende Beträge und Umlageschlüssel vervollständigen.","costEditSection"),actions:[open("Kostenarten bearbeiten","costEditSection",true),()=>{}].filter(Boolean)},
    einnahmen:{summary:[["Kaltmiete erhalten",overviewMoney(s.income.rent)],["NK-Vorauszahlungen",overviewMoney(s.income.prepayments)],["Korrekturen",overviewMoney(s.income.corrections)],["Mietverhältnisse",s.tenants.length]],validation:commonValidation,next:next("Kaltmieten und Vorauszahlungen vollständig prüfen; danach Zählerstände erfassen.","incomeRentSection"),actions:[open("Kaltmiete öffnen","incomeRentSection",true),open("Vorauszahlungen öffnen","incomePrepaymentSection"),go("Zählerstände","wasser")]},
    wasser:{summary:[["Zähler-/Messdatensätze",s.meters.length],["Aktive Wohnungen",s.activeUnits.length],["Verbrauchskosten",s.activeCosts.filter(k=>String(k.umlageschluessel||"").toLowerCase().includes("verbrauch")).length],["Abrechnungsjahr",s.year]],validation:commonValidation,next:next("Zählerstände erfassen und Verbrauchskontrolle durchführen.","meterEntrySection"),actions:[open("Zähler erfassen","meterEntrySection",true),open("Kontrolle öffnen","meterControlSection"),go("Manuelle Werte","manuellewerte")]},
    manuellewerte:{summary:[["Eingabequellen",Object.keys(state.umlageInputs||{}).length],["Miet-/Nutzungseinheiten",s.tenants.length],["Aktive Kostenarten",s.activeCosts.length],["Abrechnungsjahr",s.year]],validation:commonValidation,next:next("Eingabeart je Kostenart festlegen und Summen abgleichen.","manualValuesSection"),actions:[open("Werte öffnen","manualValuesSection",true),open("Summenkontrolle","manualExternalControlSection"),go("Umlage berechnen","umlage")]},
    umlage:{summary:[["Gesamtkosten",s.totals?overviewMoney(s.totals.totalCosts):"–"],["Vorauszahlungen",s.totals?overviewMoney(s.totals.prepayments):"–"],["Mietersaldo",s.totals?overviewMoney(s.totals.balance):"–"],["Kostenarten",s.activeCosts.length]],validation:commonValidation,next:next("Umlageergebnis je Mieter und Kostenart kontrollieren.","allocationTenantResultSection"),actions:[open("Ergebnisse öffnen","allocationTenantResultSection",true),open("Wohnungsnachweis","allocationUnitProofSection"),go("Qualitätsprüfung","qualitaet")]},
    vorauszahlungsanpassung:{summary:[["Mietverhältnisse",s.tenants.length],["NK-Vorauszahlungen",overviewMoney(s.income.prepayments)],["Kostenarten",s.activeCosts.length],["Abrechnungsjahr",s.year]],validation:commonValidation,next:next("Berechnungsregeln und Empfehlungen je Mieter fachlich prüfen.","prepaymentRulesSection"),actions:[open("Regeln öffnen","prepaymentRulesSection",true),open("Empfehlungen öffnen","prepaymentRecommendationSection"),go("Briefe öffnen","briefe")]},
    qualitaet:{summary:[["Offene Fehler",s.errors.length],["Prüfpunkte",s.checks.length],["Hinweise",Math.max(0,s.issues.length-s.errors.length-s.checks.length)],["Finalisierung",s.finalized?"Finalisiert":"Bearbeitbar"]],validation:commonValidation,next:next(s.issues.length?"Offene Aufgaben nach Priorität bearbeiten.":"Keine offenen Prüfpunkte; Briefausgabe vorbereiten.","qualityOpenIssuesSection"),actions:[open("Prüfstatus öffnen","qualityOverviewSection",true),open("Offene Aufgaben","qualityOpenIssuesSection"),go("Briefe öffnen","briefe")]},
    briefe:{summary:[["Empfänger",s.tenants.length],["Abrechnungsjahr",s.year],["Umlage",s.totals?"Berechnet":"Prüfen"],["Status",s.finalized?"Finalisiert":"Entwurf"]],validation:commonValidation,next:next("Brief auswählen, Vorschau prüfen und erst danach drucken oder als PDF sichern.","lettersEditorSection"),actions:[open("Briefbereich öffnen","lettersEditorSection",true),go("Qualitätsprüfung","qualitaet"),go("Export öffnen","export")]},
    export:{summary:[["Abrechnungsjahr",s.year],["Kostenarten",s.costs.length],["Mietverhältnisse",s.tenants.length],["Archivstände",s.archives]],validation:commonValidation,next:next("Aktuelle Abrechnung als JSON sichern; Gesamtsicherung zusätzlich im Verwaltungsbereich erstellen.","exportActionsSection"),actions:[open("Exportaktionen öffnen","exportActionsSection",true),go("Gesamtsicherung","sicherung"),save]}
  };
  // Kostenarten-Schnellaktionen bewusst ohne „Neu berechnen“.
  data.einstellungen.actions=[open("Kostenarten bearbeiten","costEditSection",true),{label:"Kostenart hinzufügen",action:"cost.openSelectionDialog",args:[]},{label:"Qualitätsprüfung",action:"navigation.switchTab",args:["qualitaet"]}];
  return data[tabId] || data.start;
}
Object.entries(TAB_DEFINITIONS).forEach(([tabId, definition]) => {
  definition.getOverview = () => buildOverviewData(tabId);
});

function renderOverviewCards(tabId, config) {
  const grid=document.getElementById("overview-"+tabId);
  if (!grid || !config) return;
  grid.replaceChildren();
  const specs=[
    {role:"summary",title:OVERVIEW_TITLES[0],status:"info"},
    {role:"validation",title:OVERVIEW_TITLES[1],status:(config.validation&&config.validation.status)||"info"},
    {role:"next-step",title:OVERVIEW_TITLES[2],status:"info"},
    {role:"quick-actions",title:OVERVIEW_TITLES[3],status:"info"}
  ];
  specs.forEach((spec,index)=>{
    const card=document.createElement("article");
    card.className="overview-card";
    card.dataset.overviewRole=spec.role;
    card.dataset.status=spec.status;
    const title=document.createElement("h3"); title.className="overview-card__title"; title.textContent=spec.title; card.appendChild(title);
    const content=document.createElement("div"); content.className="overview-card__content";
    const actions=document.createElement("div"); actions.className="overview-card__actions"+(index===3?" quick-actions":"");
    if (index===0) {
      const dl=document.createElement("dl"); dl.className="overview-card__metrics";
      (config.summary||[]).forEach(pair=>{ const dt=document.createElement("dt");dt.textContent=pair[0];const dd=document.createElement("dd");dd.textContent=String(pair[1]);dl.append(dt,dd); });
      content.appendChild(dl);
    } else if (index===1) {
      const p=document.createElement("p"); p.innerHTML="<strong>"+escapeHtml((config.validation&&config.validation.headline)||"Prüfen")+"</strong>"; content.appendChild(p);
      const ul=document.createElement("ul"); ul.className="overview-card__checklist";
      ((config.validation&&config.validation.items)||[]).forEach(item=>{
        const normalized=typeof item==="string"?{text:item,status:spec.status==="error"?"error":(spec.status==="warn"?"warn":"ok")}:item;
        const itemStatus=["ok","warn","error","info"].includes(normalized.status)?normalized.status:"info";
        const li=document.createElement("li");li.className="overview-check-item is-"+itemStatus;
        const icon=document.createElement("span");icon.className="overview-check-icon";icon.setAttribute("aria-hidden","true");icon.textContent=itemStatus==="ok"?"✓":(itemStatus==="warn"?"⚠":(itemStatus==="error"?"✕":"i"));
        const label=document.createElement("span");label.textContent=normalized.text||"";li.append(icon,label);ul.appendChild(li);
      }); content.appendChild(ul);
    } else if (index===2) {
      const p=document.createElement("p");p.textContent=(config.next&&config.next.text)||"Nächsten Arbeitsschritt öffnen.";content.appendChild(p);
      if (config.next&&config.next.action) actions.appendChild(overviewActionButton(config.next.action));
    } else {
      (config.actions||[]).forEach(action=>actions.appendChild(overviewActionButton(action)));
    }
    card.append(content,actions); grid.appendChild(card);
  });
}
function overviewActionButton(action) {
  const button=document.createElement("button"); button.type="button"; button.textContent=action.label||"Aktion";
  if (action.primary) button.classList.add("primary");
  if (action.action) { button.setAttribute("data-ui-action", action.action); button.setAttribute("data-ui-args", JSON.stringify(action.args || [])); }
  return button;
}
function renderOverviewForTab(tabId) { const definition=TAB_DEFINITIONS[tabId]; if (definition) renderOverviewCards(tabId,definition.getOverview()); }
function renderAllOverviewCards() { Object.keys(TAB_DEFINITIONS).forEach(renderOverviewForTab); }
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
  if (globalTitle&&activeSection) globalTitle.textContent=activeSection.id === 'landing' ? 'Arbeitsweiche' : ((TAB_DEFINITIONS[activeSection.id]||{}).title||'NK-Pro');
}

function auditV992Structure() {
  const expected=OVERVIEW_TITLES;
  const results=Object.entries(TAB_DEFINITIONS).map(([tabId,def])=>{
    const tab=document.getElementById(tabId);
    const page=tab&&tab.querySelector(':scope > .app-page');
    const header=page&&page.querySelector(':scope > .page-header');
    const grids=page?Array.from(page.querySelectorAll(':scope > .overview-grid')):[];
    const cards=grids[0]?Array.from(grids[0].children).filter(x=>x.classList.contains('overview-card')):[];
    const titles=cards.map(c=>(c.querySelector('.overview-card__title')||{}).textContent||'');
    const sections=page?Array.from(page.querySelectorAll(':scope > .page-sections > .page-section')):[];
    const validation=sections.length?sections[sections.length-1]:null;
    const footnote=page&&page.querySelector(':scope > .page-footnote');
    const checks={page:!!page,headerCount:page?page.querySelectorAll(':scope > .page-header').length===1:false,overviewGridCount:grids.length===1,directCardCount:cards.length===4,cardTitles:expected.every((t,i)=>titles[i]===t),noNestedCardGrid:!(grids[0]&&grids[0].querySelector('.overview-grid')),quickActionsAreButtons:cards[3]?Array.from(cards[3].querySelectorAll('.overview-card__actions > *')).every(x=>x.tagName==='BUTTON'):false,validationSectionIsLast:!!(validation&&validation.dataset.sectionRole==='validation'),allInitiallyClosed:sections.every(d=>!d.open),footnoteAfterValidation:!footnote||footnote.previousElementSibling===page.querySelector(':scope > .page-sections')};
    return {tab:tabId,title:def.title,headerCount:page?page.querySelectorAll(':scope > .page-header').length:0,overviewGridCount:grids.length,directCardCount:cards.length,cardTitles:titles,legacyCardsFound:!!(page&&page.querySelector('.cards,.workspace-overview-grid,.cost-overview-grid,.tenant-overview-grid,.meter-overview-grid')),nestedCardGridFound:!checks.noNestedCardGrid,quickActionsAreButtons:checks.quickActionsAreButtons,validationSectionIsLast:checks.validationSectionIsLast,footnoteAfterValidation:checks.footnoteAfterValidation,result:Object.values(checks).every(Boolean)?'ok':'fehler',checks};
  });
  const report={version:APP_VERSION,generatedAt:new Date().toISOString(),tabCount:results.length,allPassed:results.every(r=>r.result==='ok'),results};
  NK_PRO_MODULES.runtimeDiagnostics.setStructureAudit(report);
  document.documentElement.dataset.v992Audit=report.allPassed?'passed':'failed';
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
