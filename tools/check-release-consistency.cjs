"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const childProcess=require("node:child_process");
const root=path.resolve(__dirname,"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const assert=(condition,message)=>{if(!condition) throw new Error(message);};
const sha256=buffer=>crypto.createHash("sha256").update(buffer).digest("hex");

function verifyChecksums(){
  const checksumFile=path.join(root,"SHA256SUMS.txt");
  assert(fs.existsSync(checksumFile),"SHA256SUMS.txt fehlt.");
  const rows=fs.readFileSync(checksumFile,"utf8").split(/\r?\n/).filter(Boolean);
  assert(rows.length>0,"SHA256SUMS.txt ist leer.");
  for(const row of rows){
    const match=row.match(/^([0-9a-f]{64})  \.\/(.+)$/);
    assert(match,`Ungültiger Prüfsummeneintrag: ${row}`);
    const file=path.join(root,match[2]);
    assert(fs.existsSync(file)&&fs.statSync(file).isFile(),`Prüfsummendatei fehlt: ${match[2]}`);
    assert(sha256(fs.readFileSync(file))===match[1],`Prüfsumme ist inkonsistent: ${match[2]}`);
  }
}

function main(){
  const packageJson=JSON.parse(read("package.json"));
  const manifest=JSON.parse(read("manifest.webmanifest"));
  const project=JSON.parse(read("nk-pro-project.json"));
  const inventory=JSON.parse(read("AP10_BASELINE_INVENTORY.json"));
  const html=read("index.html");
  const app=read("js/app.js");
  const worker=read("service-worker.js");
  const metrics=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/analyze-app-js.cjs")],{encoding:"utf8"}));
  const moduleNames=[
    "ui-preferences","state-access","application-actions","master-data-actions","cost-actions","billing-workflow",
    "ui-controller","ui-bindings","ui-events","navigation","modal-events","persistence","migration","backup-recovery",
    "meter-master","meter-readings","meter-periods","meter-validation","object-standard","billing-snapshot","archive",
    "archive-actions","year-transition-actions","quality-assurance","diagnostics","billing-calculation","document-data",
    "document-renderer","export-service","ui-table-tools","app-bootstrap","compatibility","default-seed","app","service-worker-register"
  ];
  const sources=Object.fromEntries(moduleNames.map(name=>[name,read(`js/${name}.js`)]));

  assert(packageJson.name==="nk-pro-v99-4-11"&&packageJson.version==="99.4.11","Paketversion ist inkonsistent.");
  assert(manifest.version==="99.4.11"&&manifest.name.includes("V99.4.11"),"Manifestversion ist inkonsistent.");
  assert(project.appVersion==="99.4.11"&&project.displayVersion==="V99.4.11"&&project.basedOn==="99.4.10","Projektversionsmetadaten sind inkonsistent.");
  assert(project.versionName==="Physisch extrahierte Archiv-, Jahreswechsel-, Qualitäts- und Diagnoseorchestrierung","Versionsname ist inkonsistent.");
  assert(project.schemaVersion===5&&project.dataLayerContractVersion===1,"Datenschema oder Datenebenenvertrag wurde verändert.");
  assert(project.objectStandardVersion===1&&project.billingSnapshotVersion===2,"Objektstandard oder Snapshotversion wurde verändert.");
  for(const key of ["meterMasterStandardVersion","meterReadingStandardVersion","meterPeriodStandardVersion","meterAssignmentStandardVersion","meterReplacementStandardVersion"]) assert(project[key]===1,`${key} ist inkonsistent.`);
  assert(app.includes('const APP_VERSION = "V99.4.11";')&&app.includes('const APP_VERSION_NAME = "Physisch extrahierte Archiv-, Jahreswechsel-, Qualitäts- und Diagnoseorchestrierung";'),"Laufzeitversion ist inkonsistent.");
  assert(metrics.bytes===382309&&metrics.lines===6292,`app.js-Metrik ist unerwartet: ${metrics.bytes} Byte/${metrics.lines} Zeilen.`);
  assert(metrics.topLevelFunctionDeclarations===518&&metrics.topLevelBindings===67,"Top-Level-Inventar ist inkonsistent.");
  assert(metrics.directStatePathReferences===306&&metrics.directStateWriteSites===96,"Zustandszugriffsinventar ist inkonsistent.");
  assert(metrics.dynamicGlobalAccesses===0,"Dynamischer Globalzugriff verbleibt.");
  assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html+"\n"+app),"Inline-Handler sind noch vorhanden.");
  assert(!/addEventListener\s*\(/.test(app),"app.js registriert weiterhin DOM-Ereignisse.");

  for(const name of moduleNames.filter(name=>!["app","service-worker-register","default-seed"].includes(name))) assert(sources[name].includes("Object.freeze"),`${name}.js exportiert keine feste Schnittstelle.`);
  for(const name of ["master-data-actions","cost-actions","billing-workflow","archive-actions","year-transition-actions","quality-assurance"]){
    assert(!/\b(localStorage|indexedDB|caches)\b/.test(sources[name]),`${name}.js enthält Browser-Speicherzugriffe.`);
    assert(!/\b(alert|confirm|prompt|switchToTab)\s*\(/.test(sources[name]),`${name}.js enthält UI-Dialog- oder Navigationslogik.`);
  }
  for(const name of ["archive-actions","year-transition-actions","quality-assurance","diagnostics"]) assert(!/\b(saveData|commitStateChange|renderAll|renderCurrentView)\s*\(/.test(sources[name]),`${name}.js persistiert oder rendert direkt.`);
  assert(sources["archive-actions"].includes("stateAccess.transact")&&sources["year-transition-actions"].includes("stateAccess.transact"),"AP10-Transaktionsgrenze fehlt.");
  assert(sources["quality-assurance"].includes("withIsolatedState")&&sources["diagnostics"].includes("withIsolatedState"),"AP10-Leseisolierung fehlt.");
  assert(!/storageWritable\s*\(\s*\)/.test(sources["diagnostics"]),"Diagnose schreibt testweise in Browser-Speicher.");

  for(const name of inventory.removedFunctions) assert(!new RegExp(`^function\\s+${name}\\s*\\(`,"m").test(app),`Entfernte AP10-Implementierung ist wieder in app.js vorhanden: ${name}`);
  assert(inventory.physicallyExtractedImplementations===79&&inventory.netTopLevelFunctionReduction===78,"AP10-Extraktionsinventar ist inkonsistent.");
  assert(inventory.ap6CompatibilityWrappersAfter===112&&inventory.ap10CompatibilityWrappersAdded===0,"Kompatibilitätsstand ist inkonsistent.");
  for(const binding of [
    "currentYear:NK_PRO_MODULES.archiveActions.archiveCurrent","reopenForRework:NK_PRO_MODULES.archiveActions.reopenForRework",
    "deleteAt:NK_PRO_MODULES.archiveActions.deleteAt","importItems:NK_PRO_MODULES.archiveActions.importItems",
    "createBilling:NK_PRO_MODULES.yearTransitionActions.createBilling","prepareNextYear:NK_PRO_MODULES.yearTransitionActions.prepareNextYear",
    "inspect:NK_PRO_MODULES.qualityAssurance.inspect"
  ]) assert(app.includes(binding),`Direkte AP10-Aktionsbindung fehlt: ${binding}`);

  const storageUsers=moduleNames.filter(name=>/\blocalStorage\b/.test(sources[name])).sort();
  assert(JSON.stringify(storageUsers)===JSON.stringify(["persistence","ui-preferences"]),`Direkte Speicherzugriffe außerhalb der Adapter: ${storageUsers.join(", ")}`);
  assert(sources["meter-master"].includes('billingRole:"excluded"')&&sources["meter-master"].includes("abrechnungsrelevant:false"),"Stromzähler-Dummy ist nicht zentral ausgeschlossen.");
  assert(sources["billing-snapshot"].includes("const BILLING_SNAPSHOT_VERSION = 2;"),"Snapshotversion 2 fehlt.");

  const expectedScripts=moduleNames.map(name=>`./js/${name}.js`);
  const actualScripts=[...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match=>match[1]);
  assert(JSON.stringify(actualScripts)===JSON.stringify(expectedScripts),`Skriptreihenfolge ist inkonsistent: ${JSON.stringify(actualScripts)}`);
  assert(html.includes("<title>NK-Pro V99.4.11 – Physisch extrahierte Archiv-, Jahreswechsel-, Qualitäts- und Diagnoseorchestrierung</title>"),"HTML-Titel ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-11";'),"Service-Worker-Cache ist inkonsistent.");
  for(const resource of expectedScripts) assert(worker.includes(`"${resource}"`),`PWA-App-Shell enthält ${resource} nicht.`);

  for(const required of [
    "README.md","ARCHITECTURE.md","MODULE_UEBERSICHT.md","VERANTWORTLICHKEITSMATRIX.md","ROADMAP.md","CHANGELOG.md","TESTING.md",
    "AP10_PHYSISCHE_ARCHIV_JAHRESWECHSEL_QUALITAET_DIAGNOSEORCHESTRIERUNG.md","AP10_PRUEFBERICHT.md","AP10_EXTRAKTIONSINVENTAR.md",
    "AP10_VORHER_NACHHER_INVENTAR.md","AP10_ARCHIVDATENFLUSS.md","AP10_JAHRESWECHSELDATENFLUSS.md","AP10_QUALITAET_UND_DIAGNOSE.md",
    "AP10_FUNKTIONSINVENTAR.md","AP10_FUNKTIONSINVENTAR.json","AP10_BASELINE_INVENTORY.json","AP10_APP_JS_INVENTORY_BEFORE.json",
    "AP10_APP_JS_INVENTORY_AFTER.json","AP10_ZUSTANDSZUGRIFFE.json","AP10_TEST_RESULTS.json","ANWENDUNGSAKTIONSUEBERSICHT.md",
    "UI_CONTROLLER_UEBERSICHT.md","ZUSTANDSZUGRIFFE.md","KOMPATIBILITAETSSCHICHT.md","SHA256SUMS.txt"
  ]) assert(fs.existsSync(path.join(root,required)),`${required} fehlt.`);
  verifyChecksums();
  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.11, 79 physisch extrahierte Implementierungen, 518 Top-Level-Funktionen, 13 UI-Controller, 99 Aktionen, Datenschema 5, Snapshot 2 und vollständige PWA-App-Shell sind konsistent.\n");
}
try{main();}catch(error){process.stderr.write(`FEHLER: ${error.message}\n`);process.exit(1);}
