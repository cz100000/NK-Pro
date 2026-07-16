"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."); const read=f=>fs.readFileSync(path.join(root,f),"utf8"); const json=f=>JSON.parse(read(f)); const assert=(v,m)=>{if(!v)throw new Error(m);};
function main(){
 const pkg=json("package.json"),project=json("nk-pro-project.json"),manifest=json("manifest.webmanifest"),html=read("index.html"),runtime=read("js/app-runtime-config.js"),contextSource=read("js/billing-context.js"),navigation=read("js/navigation.js"),pages=read("js/ui-navigation-pages.js"),dashboards=read("js/ui-page-controller.js"),css=read("assets/app.css"),worker=read("service-worker.js");
 assert(pkg.name==="nk-pro-v99-4-24"&&pkg.version==="99.4.24","Paketversion ist inkonsistent.");
 assert(project.appVersion==="99.4.24"&&project.displayVersion==="V99.4.24"&&project.basedOn==="99.4.23-AP21-NKP-FACH-001","Projektmetadaten sind inkonsistent.");
 assert(project.schemaVersion===5&&project.dataLayerContractVersion===1,"Datenverträge wurden verändert.");
 assert(project.controlledBillingContextVersion===1&&project.billingReadOnlyModeVersion===1&&project.productiveDashboardVersion===1,"Kontextmetadaten fehlen.");
 assert(manifest.version==="99.4.24"&&manifest.name.includes("V99.4.24"),"Manifestversion ist inkonsistent.");
 assert(runtime.includes('const APP_VERSION = "V99.4.24";')&&runtime.includes('billingContext:globalThis.NKProBillingContext'),"Laufzeitkonfiguration fehlt.");
 assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-24-ap21a";')&&worker.includes('"./js/billing-context.js"'),"PWA-App-Shell ist inkonsistent.");
 assert(html.includes('data-global-billing-mode')&&html.includes('data-global-billing-close')&&html.includes('Abrechnung schließen'),"Kontextleiste ist unvollständig.");
 assert((html.match(/data-requires-billing="true"/g)||[]).length===9,"Abrechnungsnavigation ist nicht vollständig kontextgebunden.");
 const sections=["mieter","einnahmen","einstellungen","manuellewerte","umlage","qualitaet","vorauszahlungsanpassung","briefe","export"];
 for(const id of sections){const match=html.match(new RegExp('<section class="tab[^>]*" id="'+id+'"[\\s\\S]*?<\\/section>')); assert(match&&!match[0].includes('data-page-period'),"Redundanter Seitenkopfblock ist vorhanden: "+id);}
 assert(pages.includes('buildBillingRecordsTableHtml()')&&pages.includes('<th>Objekt</th><th>Kurzcode</th><th>Jahr</th>'),"Gemeinsame Abrechnungsliste fehlt.");
 assert(pages.includes('data-ui-action="billing.openCurrentEdit"')&&pages.includes('data-ui-action="billing.openCurrentView"')&&pages.includes('Zur Korrektur öffnen'),"Abrechnungsaktionen fehlen.");
 assert(pages.includes('Diese Abrechnung ist schreibgeschützt.')&&pages.includes('Änderungen sind erst nach dem Öffnen zur Bearbeitung möglich.')&&pages.includes('Zur Bearbeitung öffnen'),"Einheitlicher Schreibschutzhinweis fehlt.");
 assert(!html.includes('data-page-readonly'),"Zusätzliche Schreibschutz-Badges sind noch vorhanden.");
 assert(pages.includes('Es gibt ungespeicherte Änderungen. Abrechnung trotzdem schließen?'),"Dirty-State-Schutz fehlt.");
 assert(navigation.includes('aria-disabled')&&navigation.includes('Öffnen Sie zuerst eine Abrechnung zur Bearbeitung oder Ansicht.'),"Kontextabhängige Navigation fehlt.");
 assert(contextSource.includes('NKPRO_BILLING_READONLY')&&contextSource.includes('allowApplicationAction')&&contextSource.includes('beforeunload'),"Technische Schreibsperre ist unvollständig.");
 assert(dashboards.includes('completeUnits.length')&&dashboards.includes('completeCosts.length')&&dashboards.includes('completeConsumption.length')&&dashboards.includes('lettersGenerated'),"Produktive Dashboarddaten sind unvollständig.");
 assert(css.includes('.billing-readonly-notice')&&css.includes('body.billing-readonly-mode')&&css.includes('.records-table td::before'),"Schreibschutz- oder Responsive-Stile fehlen.");
 const store=new Map(); const sandbox={console,alert:()=>{},addEventListener:()=>{},document:null,NKProUiPreferences:{get:key=>store.get(key)||"",set:(key,value)=>store.set(key,String(value))}}; sandbox.globalThis=sandbox; vm.createContext(sandbox); vm.runInContext(contextSource,sandbox,{filename:"js/billing-context.js"});
 const description=sandbox.NKProBillingContext.describe(); assert(description.stateCount===3&&description.writeActionCount>=52,"Kontextzustände oder Schreibaktionen sind unvollständig.");
 sandbox.NKProBillingContext.open({recordKey:"current:2025"},sandbox.NKProBillingContext.MODES.VIEW); let blocked=false; try{sandbox.NKProBillingContext.allowApplicationAction("billing","setYear");}catch(error){blocked=error.code==="NKPRO_BILLING_READONLY";} assert(blocked,"Schreibzugriff wird im Ansichtsmodus nicht blockiert.");
 sandbox.NKProBillingContext.rememberStep("verbraeuche"); sandbox.NKProBillingContext.close(); assert(sandbox.NKProBillingContext.lastStep("current:2025")==="manuellewerte","Legacy-Seitenschlüssel wird nicht migriert.");
 process.stdout.write(`AP19-/AP21A-Kontextprüfung abgeschlossen: 3 Zustände, ${description.writeActionCount} gesicherte Schreibaktionen und einheitlicher Ansichtsmodus sind konsistent.\n`);
}
try{main();}catch(error){process.stderr.write("FEHLER: "+error.message+"\n");process.exit(1);}
