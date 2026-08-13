"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=rel=>fs.readFileSync(path.join(root,rel),"utf8");

const navigation=read("js/navigation.js");
const billingContext=read("js/billing-context.js");
const runtime=read("js/app-runtime-config.js");
const uiNavigation=read("js/ui-navigation-pages.js");
const analyticsText=read("js/analytics-engine.js");
const app=read("js/app.js");
const kuaDomain=read("js/cost-reconciliation.js");
const kuaUi=read("js/ui-cost-reconciliation.js");
const analyticsUi=read("js/ui-analytics.js");

for(const id of ["auswertungen","kostenumlagenabgleich","regelinventar"]){
  const re=new RegExp(`"tab":\\s*"${id}"[\\s\\S]{0,350}?"requiresBilling":\\s*false`);
  assert.match(navigation,re,`${id} muss global ohne geöffnete Abrechnung erreichbar sein`);
}
assert.match(runtime,/GLOBAL_NAV_TABS[^\n]*"auswertungen"[^\n]*"kostenumlagenabgleich"[^\n]*"regelinventar"/,
  "Globale Analyse-Seiten müssen zentral als globale Navigation klassifiziert sein");
assert.doesNotMatch(runtime,/BILLING_NAV_TABS[^\n]*"auswertungen"|BILLING_NAV_TABS[^\n]*"kostenumlagenabgleich"|BILLING_NAV_TABS[^\n]*"regelinventar"/,
  "Globale Analyse-Seiten dürfen nicht in BILLING_NAV_TABS stehen");
assert.doesNotMatch(billingContext,/VALID_STEPS[^\n]*(auswertungen|kostenumlagenabgleich|regelinventar)/,
  "Globale Analyse-Seiten dürfen nicht als gespeicherter Abrechnungs-Workflow-Schritt geführt werden");
assert.match(uiNavigation,/if \(GLOBAL_NAV_TABS\.includes\(tabId\)\) return true;/,
  "Globale Seiten müssen in allen App-Modi sichtbar bleiben");
assert.match(uiNavigation,/BILLING_NAV_TABS\.includes\(tabId\) && !NK_PRO_MODULES\.billingContext\.isOpen\(\)/,
  "Echte Abrechnungsseiten müssen weiterhin geschützt sein");

assert.match(runtime,/function canonicalAnalysisState\(\)/,
  "Es muss eine kanonische Read-only-Quelle für globale Analysen geben");
assert.match(runtime,/archiveReturnState && typeof archiveReturnState === "object"/,
  "Eine in-app geöffnete Archivansicht muss für globale Analysen auf den vollständigen Rückkehrzustand zugreifen können");
assert.match(app,/rootState:\(\) => canonicalAnalysisState\(\)/,
  "Analyseengine muss mit der kanonischen Datenquelle verdrahtet sein");
assert.match(analyticsUi,/function analyticsSourceState\(\)/);
assert.match(analyticsUi,/analyticsEngine\.build\(analyticsSourceState\(\)/,
  "Analyse-UI darf den isolierten Archiv-Viewer-State nicht direkt als Mehrjahresquelle verwenden");
assert.match(kuaUi,/function kuaAnalysisState\(\)/);
assert.match(kuaUi,/kuaDomain\(\)\.model\(kuaAnalysisState\(\)/,
  "Kosten-/Umlagenabgleich muss denselben vollständigen kanonischen Bestand verwenden");
assert.match(kuaDomain,/currentBillingClosedAfterArchive/,
  "Kosten-/Umlagenabgleich muss geschlossene Arbeitsstände als nicht aktiv behandeln");
assert.match(analyticsText,/function currentPeriodAvailable\(meta=\{\}\)/,
  "Analyseengine muss aktive und geschlossene Arbeitsstände unterscheiden");

const sandbox={console,Date,JSON,Math,Number,String,Array,Object,Set,Map,globalThis:null};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(analyticsText,sandbox,{filename:"analytics-engine.js"});
const engine=sandbox.NKProAnalyticsEngine;
assert.ok(engine,"Analyseengine fehlt");
engine.configure({
  stateAccess:{current:()=>closedRoot},
  rootState:()=>closedRoot,
  calculateDataset:()=>({calculation:{tenantResults:[],costResults:[]},totals:{}}),
  inspectDataset:()=>({results:[]}),
  isPrivateUse:()=>false,
  isSettlementParticipant:()=>false,
  appVersion:"V99.4.70"
});
const snapshot={
  year:"2023",
  archivedAt:"2026-08-13T18:00:00+02:00",
  meta:{abrechnungsjahr:"2023",abrechnungsbeginn:"2023-01-01",abrechnungsende:"2023-12-31",periodId:"P-2023",datenquelle:"Archiv"},
  data:{meta:{abrechnungsjahr:"2023",abrechnungsbeginn:"2023-01-01",abrechnungsende:"2023-12-31",periodId:"P-2023",datenquelle:"Archiv"},wohnungen:[],mieter:[],kostenarten:[],vorauszahlungen:[],umlageInputs:{}}
};
const closedRoot={
  meta:{abrechnungsjahr:"2023",abrechnungsbeginn:"2023-01-01",abrechnungsende:"2023-12-31",periodId:"P-2023",currentBillingArchivedOnly:true,currentBillingClosedAfterArchive:true},
  wohnungen:[],mieter:[],kostenarten:[],vorauszahlungen:[],umlageInputs:{},
  jahresArchiv:[snapshot]
};
const periods=engine.listPeriods(closedRoot);
assert.equal(periods.length,1,"Geschlossener Top-Level-Stand und Archiv dürfen nicht doppelt erscheinen");
assert.equal(periods[0].origin,"archive","Nach Archivierung muss der Archiv-Snapshot die maßgebliche Analysequelle sein");
assert.equal(periods[0].periodId,"P-2023");

console.log("V99.4.70 Korrektur 2: globale Analysezugriffe, Billing-Guards, kanonische Archivquelle und Closed-State-Priorität bestätigt.");
