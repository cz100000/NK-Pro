"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const childProcess=require("node:child_process");
const root=path.resolve(__dirname,"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const exists=relative=>fs.existsSync(path.join(root,relative));
const assert=(condition,message)=>{if(!condition) throw new Error(message);};
const sha256=buffer=>crypto.createHash("sha256").update(buffer).digest("hex");

const ignoredChecksumPath=relative=>
  relative==="SHA256SUMS.txt" || relative.startsWith("node_modules/") ||
  relative.startsWith("test-results/") || relative.startsWith("playwright-report/");

function listReleaseFiles(directory=root,prefix=""){
  const files=[];
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    const relative=prefix ? `${prefix}/${entry.name}` : entry.name;
    if(ignoredChecksumPath(relative)) continue;
    const absolute=path.join(directory,entry.name);
    if(entry.isDirectory()) files.push(...listReleaseFiles(absolute,relative));
    else if(entry.isFile()) files.push(relative);
  }
  return files.sort();
}

function verifyChecksums(){
  assert(exists("SHA256SUMS.txt"),"SHA256SUMS.txt fehlt.");
  const rows=read("SHA256SUMS.txt").split(/\r?\n/).filter(Boolean);
  assert(rows.length>0,"SHA256SUMS.txt ist leer.");
  const listed=[];
  for(const row of rows){
    const match=row.match(/^([0-9a-f]{64})  \.\/(.+)$/);
    assert(match,`Ungültiger Prüfsummeneintrag: ${row}`);
    const relative=match[2];
    assert(!ignoredChecksumPath(relative),`Nicht freizugebende Datei ist gelistet: ${relative}`);
    const file=path.join(root,relative);
    assert(fs.existsSync(file)&&fs.statSync(file).isFile(),`Prüfsummendatei fehlt: ${relative}`);
    assert(sha256(fs.readFileSync(file))===match[1],`Prüfsumme ist inkonsistent: ${relative}`);
    listed.push(relative);
  }
  const expected=listReleaseFiles();
  assert(JSON.stringify([...new Set(listed)].sort())===JSON.stringify(expected),"SHA256SUMS.txt deckt den Release-Dateibestand nicht exakt ab.");
}

function main(){
  const packageJson=JSON.parse(read("package.json"));
  const lockJson=JSON.parse(read("package-lock.json"));
  const manifest=JSON.parse(read("manifest.webmanifest"));
  const project=JSON.parse(read("nk-pro-project.json"));
  const baseline=JSON.parse(read("AP12_BASELINE_INVENTORY.json"));
  const navInventory=JSON.parse(read("AP11_NAVIGATION_INVENTORY.json"));
  const testResults=JSON.parse(read("AP12_TEST_RESULTS.json"));
  const html=read("index.html");
  const css=read("assets/app.css");
  const app=read("js/app.js");
  const runtimeConfig=read("js/app-runtime-config.js");
  const stateOwner=read("js/app-state-persistence.js");
  const diagnostics=read("js/runtime-diagnostics.js");
  const navigation=read("js/navigation.js");
  const worker=read("service-worker.js");
  const metrics=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/analyze-app-js.cjs")],{encoding:"utf8"}));
  const architecture=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/analyze-ap12-architecture.cjs")],{encoding:"utf8"}));

  assert(packageJson.name==="nk-pro-v99-4-13"&&packageJson.version==="99.4.13","Paketversion ist inkonsistent.");
  assert(lockJson.name==="nk-pro-v99-4-13"&&lockJson.version==="99.4.13","Package-Lock-Version ist inkonsistent.");
  assert(lockJson.packages?.[""]?.name==="nk-pro-v99-4-13"&&lockJson.packages?.[""]?.version==="99.4.13","Package-Lock-Root ist inkonsistent.");
  assert(manifest.version==="99.4.13"&&manifest.name.includes("V99.4.13"),"Manifestversion ist inkonsistent.");
  assert(project.appVersion==="99.4.13"&&project.displayVersion==="V99.4.13"&&project.basedOn==="99.4.12","Projektversionsmetadaten sind inkonsistent.");
  assert(project.versionName==="Restentkopplung und globale Zustandsbereinigung","Versionsname ist inkonsistent.");
  assert(project.schemaVersion===5&&project.dataLayerContractVersion===1,"Datenschema oder Datenebenenvertrag wurde verändert.");
  assert(project.objectStandardVersion===1&&project.billingSnapshotVersion===2,"Objektstandard oder Snapshotversion wurde verändert.");
  for(const key of ["meterMasterStandardVersion","meterReadingStandardVersion","meterPeriodStandardVersion","meterAssignmentStandardVersion","meterReplacementStandardVersion"]){
    assert(project[key]===1,`${key} ist inkonsistent.`);
  }
  assert(runtimeConfig.includes('const APP_VERSION = "V99.4.13";')&&runtimeConfig.includes('const APP_VERSION_NAME = "Restentkopplung und globale Zustandsbereinigung";'),"Laufzeitversion ist inkonsistent.");
  assert(html.includes("<title>NK-Pro V99.4.13 – Restentkopplung und globale Zustandsbereinigung</title>"),"HTML-Titel ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-13";'),"Service-Worker-Cache ist inkonsistent.");

  assert(metrics.lines===225&&metrics.bytes===15599,`app.js-Metrik ist unerwartet: ${metrics.bytes} Byte/${metrics.lines} Zeilen.`);
  assert(metrics.lines<300&&metrics.bytes<20000,"app.js überschreitet die AP12-Zielgrenze.");
  assert(metrics.topLevelFunctionDeclarations===8&&metrics.topLevelBindings===2,"app.js-Top-Level-Inventar ist inkonsistent.");
  assert(metrics.directStatePathReferences===0&&metrics.directStateWriteSites===0,"app.js greift weiterhin direkt auf Fachzustand zu.");
  assert(metrics.globalAssignments===0&&metrics.dynamicGlobalAccesses===0,"app.js erzeugt unkontrollierte globale Zugriffe.");
  assert(!/^function\s+(?:render|open|close|download|print|setNested|ensureYearData)\w*\s*\(/m.test(app),"app.js enthält UI-, Dialog-, Browser- oder Fachimplementierung.");
  assert(!/\b(?:localStorage|sessionStorage|FileReader|Blob|URL\.createObjectURL|navigator\.serviceWorker)\b/.test(app),"app.js enthält Browseradapter-Implementierung.");
  assert(!/addEventListener\s*\(/.test(app),"app.js registriert DOM-Ereignisse direkt.");

  assert(runtimeConfig.includes("let state = null;"),"Kontrollierte Zustandsinitialisierung fehlt.");
  assert(stateOwner.includes("function initializeApplicationState()")&&stateOwner.includes("function replaceApplicationState(nextState)"),"Zustandseigentümer ist unvollständig.");
  assert(architecture.totals.stateRootAssignments===1,"Es existiert nicht genau eine Root-State-Ersetzung.");
  assert(architecture.stateRootAssignments[0]?.file==="js/app-state-persistence.js"&&architecture.stateRootAssignments[0]?.function==="replaceApplicationState","Root-State-Ersetzung liegt nicht im Eigentümer.");
  assert(architecture.renderers.length===46,"Rendererinventar ist unvollständig.");
  assert(architecture.renderers.every(item=>!item.mutatesState&&!item.persists&&!item.navigates&&!item.opensDialog),"Ein Renderer besitzt fachliche Seiteneffekte.");
  assert(architecture.totals.globalAssignments===0,"Unkontrollierte globale Eigenschaftszuweisungen verbleiben.");
  for(const name of ["__V992_AUDIT__","__NKPRO_UI_ARCHITECTURE__","__NKPRO_STARTUP__","__NKPRO_COMPATIBILITY__"]){
    assert(!Object.keys(architecture.files).map(read).join("\n").includes(name),`Alte globale Bindung verbleibt: ${name}`);
  }
  assert(diagnostics.includes("global.NKProRuntimeDiagnostics = Object.freeze"),"Gekapselte Laufzeitdiagnose fehlt.");

  const compatibilityBlock=app.slice(app.indexOf("const COMPATIBILITY_WRAPPERS"),app.indexOf("function configureCompatibilityRegistry"));
  assert(compatibilityBlock.length>0,"Explizite Kompatibilitätsregistry fehlt.");
  assert([...compatibilityBlock.matchAll(/"([A-Za-z_$][\w$]*)"/g)].length===75,"Explizite Wrapperliste enthält nicht genau 75 Namen.");
  assert(baseline.legacyCompatibilityWrappersBefore===112&&baseline.legacyCompatibilityWrappersAfter===75&&baseline.legacyCompatibilityWrappersRemoved===37,"AP12-Kompatibilitätsinventar ist inkonsistent.");
  assert(baseline.rootStateReplacementSitesBefore===10&&baseline.rootStateReplacementSitesAfterProjectWide===1,"AP12-Zustandsinventar ist inkonsistent.");

  assert((html.match(/class="tabs workflow-nav"/g)||[]).length===1,"Es existiert nicht genau eine produktive Navigation.");
  assert(/<nav\s+aria-label="Hauptnavigation"\s+class="tabs workflow-nav"/.test(html),"Produktive Navigation ist nicht semantisch ausgezeichnet.");
  const groups=[...html.matchAll(/<section class="nav-group" data-nav-group-section="([^"]+)">/g)].map(match=>match[1]);
  assert(JSON.stringify(groups)===JSON.stringify(["object","billing","archive","extras"]),`Navigationsgruppen sind inkonsistent: ${groups.join(", ")}`);
  const tabs=[...html.matchAll(/class="tab-btn nav-group-item[^"]*"[^>]*data-tab="([^"]+)"/g)].map(match=>match[1]);
  const expectedTabs=["objekt","wohnungsverwaltung","wasser","mieterverwaltung","start","mieter","einnahmen","einstellungen","manuellewerte","umlage","qualitaet","vorauszahlungsanpassung","briefe","export","archiv","sicherung"];
  assert(JSON.stringify(tabs)===JSON.stringify(expectedTabs),`Navigationsreihenfolge ist inkonsistent: ${tabs.join(", ")}`);
  assert(!html.includes("Weitere Abrechnungsschritte")&&!html.includes("nav-group-item--secondary"),"Entfernte Abrechnungsuntergruppe ist noch vorhanden.");
  const billingInventory=navInventory.groups.find(group=>group.key==="billing")?.items||[];
  assert(billingInventory.length===10&&billingInventory.every(item=>item.secondary===false),"AP11-Inventar enthält noch eine sekundäre Abrechnungsuntergruppe.");
  assert(navInventory.groups.length===4&&navInventory.iconSystem.count===22,"AP11-Navigationsinventar ist inkonsistent.");
  assert((html.match(/class="nav-icon-svg"/g)||[]).length===22,"Iconinventar ist inkonsistent.");
  const settings=html.match(/<button[^>]*class="sidebar-settings-dummy"[^>]*>/)?.[0]||"";
  assert(settings.includes('aria-disabled="true"')&&settings.includes('data-nav-hint="Noch nicht verfügbar"')&&!settings.includes("data-ui-action"),"Einstellungen-Dummy ist inkonsistent.");
  assert(css.includes("V99.4.12 – AP11: Navigationsstruktur und visuelles Grundsystem"),"Historische AP11-CSS-Grenze fehlt.");
  assert(!/\b(localStorage|indexedDB|caches)\b/.test(navigation)&&!/\bstate\s*[.[]/.test(navigation),"Navigation greift direkt auf Fachzustand oder Browserspeicher zu.");
  assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html),"Inline-Handler sind vorhanden.");

  const actualScripts=[...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match=>match[1]);
  assert(JSON.stringify(actualScripts)===JSON.stringify(architecture.scriptOrder),"Skriptreihenfolge weicht vom AP12-Inventar ab.");
  assert(actualScripts.length===50&&actualScripts.at(-2)==="./js/app.js"&&actualScripts.at(-1)==="./js/service-worker-register.js","Skriptanzahl oder Startreihenfolge ist inkonsistent.");
  for(const resource of ["./","./index.html","./manifest.webmanifest","./assets/app.css",...actualScripts,"./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png"]){
    assert(worker.includes(`"${resource}"`),`PWA-App-Shell enthält ${resource} nicht.`);
  }

  assert(read("js/meter-master.js").includes('billingRole:"excluded"')&&read("js/meter-master.js").includes("abrechnungsrelevant:false"),"Stromzähler-Dummy ist nicht ausgeschlossen.");
  assert(read("js/billing-snapshot.js").includes("const BILLING_SNAPSHOT_VERSION = 2;"),"Snapshotversion 2 fehlt.");
  assert(testResults.status==="passed"&&testResults.notExecuted.length===0,"AP12-Testbericht ist nicht vollständig bestanden.");
  assert(testResults.unchangedStandards.uiControllers===13&&testResults.unchangedStandards.uiActions===99,"UI-Controller-/Aktionsstand ist inkonsistent.");

  const required=[
    "README.md","ARCHITECTURE.md","MODULE_UEBERSICHT.md","UI_ARCHITEKTUR_AKTUELL.md","ABHAENGIGKEITSUEBERSICHT.md","ANWENDUNGSSTART.md",
    "GLOBALE_SCHNITTSTELLEN_INVENTAR.md","KOMPATIBILITAETSSCHICHT.md","ZUSTANDSZUGRIFFE.md","VERANTWORTLICHKEITSMATRIX.md",
    "ROADMAP.md","TECH_DEBT.md","CHANGELOG.md","TESTING.md","NK-PRO-PROJEKTSTAND.md","SHA256SUMS.txt",
    "AP12_RESTENTKOPPLUNG_UND_ZUSTANDSBEREINIGUNG.md","AP12_APP_JS_BESTANDSANALYSE.md","AP12_ZUSTANDSINVENTAR.md",
    "AP12_MUTATIONSINVENTAR.md","AP12_WINDOW_BINDUNGEN.md","AP12_RENDERER_DIALOG_NAVIGATION.md","AP12_ABHAENGIGKEITEN_UND_START.md",
    "AP12_LEGACY_KOMPATIBILITAET.md","AP12_PRUEFBERICHT.md","AP12_BASELINE_INVENTORY.json","AP12_APP_JS_INVENTORY_BEFORE.json",
    "AP12_APP_JS_INVENTORY_AFTER.json","AP12_ARCHITECTURE_INVENTORY.json","AP12_FUNKTIONSINVENTAR.json","AP12_MUTATIONSINVENTAR.json",
    "AP12_RENDERER_INVENTAR.json","AP12_ZUSTANDSINVENTAR.json","AP12_TEST_RESULTS.json","AP12_FINAL_RELEASE_VERIFICATION.json","AP12_DATEIAENDERUNGEN.md","AP12_DATEIAENDERUNGEN.json"
  ];
  for(const file of required) assert(exists(file),`${file} fehlt.`);
  for(const moduleName of baseline.newModules) assert(exists(`js/${moduleName}`),`AP12-Modul fehlt: js/${moduleName}`);
  assert(!exists("js/app.v99.4.12.baseline.js"),"Temporäre AP12-Baseline ist im Release enthalten.");
  verifyChecksums();
  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.13, app.js 225 Zeilen, 1 Root-State-Ersetzung, 46 seiteneffektfreie Renderer, 75 explizite Wrapper, AP11-Navigation, 13 Controller, 99 Aktionen und vollständige PWA-App-Shell sind konsistent.\n");
}
try{main();}catch(error){process.stderr.write(`FEHLER: ${error.message}\n`);process.exit(1);}
