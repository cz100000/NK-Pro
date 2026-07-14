"use strict";
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const json=file=>JSON.parse(read(file));
const assert=(value,message)=>{if(!value)throw new Error(message);};

function main(){
  const pkg=json("package.json");
  const project=json("nk-pro-project.json");
  const manifest=json("manifest.webmanifest");
  const html=read("index.html");
  const runtime=read("js/app-runtime-config.js");
  const contextSource=read("js/billing-context.js");
  const navigation=read("js/navigation.js");
  const pages=read("js/ui-navigation-pages.js");
  const dashboards=read("js/ui-page-controller.js");
  const css=read("assets/app.css");
  const worker=read("service-worker.js");

  assert(pkg.name==="nk-pro-v99-4-23"&&pkg.version==="99.4.23","AP19-Paketversion ist inkonsistent.");
  assert(project.appVersion==="99.4.23"&&project.displayVersion==="V99.4.23"&&project.basedOn==="99.4.22-AP19","AP19-Projektmetadaten sind inkonsistent.");
  assert(project.schemaVersion===5&&project.dataLayerContractVersion===1,"Datenverträge wurden verändert.");
  assert(project.controlledBillingContextVersion===1&&project.billingReadOnlyModeVersion===1&&project.productiveDashboardVersion===1,"AP19-Funktionsmetadaten fehlen.");
  assert(manifest.version==="99.4.23"&&manifest.name.includes("V99.4.23"),"Manifestversion ist inkonsistent.");
  assert(runtime.includes('const APP_VERSION = "V99.4.23";')&&runtime.includes('billingContext:globalThis.NKProBillingContext'),"AP19-Laufzeitkonfiguration fehlt.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-23-ap20-corr3";')&&worker.includes('"./js/billing-context.js"'),"AP19-PWA-App-Shell ist inkonsistent.");

  assert(html.includes('data-global-billing-mode')&&html.includes('data-global-billing-close')&&html.includes('Abrechnung schließen'),"Kontextleiste ist unvollständig.");
  assert((html.match(/data-requires-billing="true"/g)||[]).length===10,"Abrechnungsnavigation ist nicht vollständig kontextgebunden.");
  const billingSections=["mieter","einstellungen","einnahmen","manuellewerte","verbraeuche","umlage","vorauszahlungsanpassung","qualitaet","briefe","export"];
  for(const id of billingSections){
    const match=html.match(new RegExp('<section class="tab[^>]*" id="'+id+'"[\\s\\S]*?<\\/section>'));
    assert(match&&!match[0].includes('data-page-period'),"Redundanter Seitenkopfblock ist noch vorhanden: "+id);
  }
  assert(pages.includes('buildBillingRecordsTableHtml()')&&pages.includes('<th>Objekt</th><th>Kurzcode</th><th>Jahr</th>'),"Gemeinsame Abrechnungsliste fehlt.");
  assert(pages.includes('data-ui-action="billing.openCurrentEdit"')&&pages.includes('data-ui-action="billing.openCurrentView"')&&pages.includes('Zur Korrektur öffnen'),"Abrechnungsaktionen fehlen.");
  assert(pages.includes('Schreibgeschützte Ansicht')&&pages.includes('Diese Abrechnung wurde nur zur Ansicht geöffnet. Änderungen sind nicht möglich.'),"Schreibschutzkennzeichnung fehlt.");
  assert(pages.includes('Es gibt ungespeicherte Änderungen. Abrechnung trotzdem schließen?'),"Dirty-State-Schutz beim Schließen fehlt.");
  assert(navigation.includes('aria-disabled')&&navigation.includes('Öffnen Sie zuerst eine Abrechnung zur Bearbeitung oder Ansicht.'),"Kontextabhängige Navigation fehlt.");
  assert(contextSource.includes('NKPRO_BILLING_READONLY')&&contextSource.includes('allowApplicationAction')&&contextSource.includes('beforeunload'),"Zentrale technische Schreibsperre ist unvollständig.");

  assert(!dashboards.includes('Hinweis zu Vorschauwerten')&&!dashboards.includes('Fiktiver Orientierungswert')&&!dashboards.includes('64 %')&&!dashboards.includes('82 %'),"AP17-Vorschauwerte sind noch produktiv enthalten.");
  assert(dashboards.includes('completeUnits.length')&&dashboards.includes('completeCosts.length')&&dashboards.includes('completeConsumption.length')&&dashboards.includes('lettersGenerated'),"Produktive Dashboarddaten sind unvollständig.");
  assert(dashboards.includes('rules=[')&&dashboards.includes('groupRule("quality"')&&dashboards.includes('groupRule("letters"')&&dashboards.includes('centralGroup'),"Zentrale Prüfregeln fehlen.");
  assert(css.includes('.billing-readonly-notice')&&css.includes('body.billing-readonly-mode')&&css.includes('.records-table td::before'),"Schreibschutz- oder Responsive-Stile fehlen.");
  assert(css.includes('.nav-group-children .tab-btn:last-child { border-bottom:0; }'),"Navigationstrennlinien wurden nicht bereinigt.");

  const store=new Map();
  const sandbox={console,alert:()=>{},addEventListener:()=>{},document:null,NKProUiPreferences:{get:key=>store.get(key)||"",set:(key,value)=>store.set(key,String(value))}};
  sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(contextSource,sandbox,{filename:"js/billing-context.js"});
  const description=sandbox.NKProBillingContext.describe();
  assert(description.stateCount===3,"Es existieren nicht genau drei Kontextzustände.");
  assert(description.writeActionCount>=50,"Zu wenige Schreibaktionen sind technisch abgesichert.");
  assert(!sandbox.NKProBillingContext.isOpen(),"Abrechnungskontext startet nicht geschlossen.");
  sandbox.NKProBillingContext.open({recordKey:"current:2025"},sandbox.NKProBillingContext.MODES.VIEW);
  let blocked=false;
  try{sandbox.NKProBillingContext.allowApplicationAction("billing","setYear");}catch(error){blocked=error.code==="NKPRO_BILLING_READONLY";}
  assert(blocked,"Programmgesteuerter Schreibzugriff wird im Ansichtsmodus nicht blockiert.");
  sandbox.NKProBillingContext.rememberStep("qualitaet");
  sandbox.NKProBillingContext.close();
  assert(!sandbox.NKProBillingContext.isOpen()&&sandbox.NKProBillingContext.lastStep("current:2025")==="qualitaet","Schließen oder letzter Arbeitsschritt ist inkonsistent.");

  process.stdout.write(`AP19-Strukturprüfung abgeschlossen: 3 Kontextzustände, ${description.writeActionCount} technisch abgesicherte Schreibaktionen, 10 kontextgebundene Navigationspunkte, produktive Dashboards und unveränderte Datenverträge sind konsistent.\n`);
}
try{main();}catch(error){process.stderr.write("FEHLER: "+error.message+"\n");process.exit(1);}
