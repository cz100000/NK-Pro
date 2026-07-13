"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const childProcess=require("node:child_process");
const root=path.resolve(__dirname,"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const assert=(condition,message)=>{if(!condition) throw new Error(message);};
const sha256=buffer=>crypto.createHash("sha256").update(buffer).digest("hex");

const ignoredChecksumPath=relative=>
  relative==="SHA256SUMS.txt" || relative.startsWith("node_modules/") || relative.startsWith("test-results/") || relative.startsWith("playwright-report/");

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
  const checksumFile=path.join(root,"SHA256SUMS.txt");
  assert(fs.existsSync(checksumFile),"SHA256SUMS.txt fehlt.");
  const rows=fs.readFileSync(checksumFile,"utf8").split(/\r?\n/).filter(Boolean);
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
  const manifest=JSON.parse(read("manifest.webmanifest"));
  const project=JSON.parse(read("nk-pro-project.json"));
  const inventory=JSON.parse(read("AP10_BASELINE_INVENTORY.json"));
  const navInventory=JSON.parse(read("AP11_NAVIGATION_INVENTORY.json"));
  const html=read("index.html");
  const css=read("assets/app.css");
  const app=read("js/app.js");
  const navigation=read("js/navigation.js");
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

  assert(packageJson.name==="nk-pro-v99-4-12"&&packageJson.version==="99.4.12","Paketversion ist inkonsistent.");
  assert(manifest.version==="99.4.12"&&manifest.name.includes("V99.4.12"),"Manifestversion ist inkonsistent.");
  assert(project.appVersion==="99.4.12"&&project.displayVersion==="V99.4.12"&&project.basedOn==="99.4.11","Projektversionsmetadaten sind inkonsistent.");
  assert(project.versionName==="Navigationsstruktur und visuelles Grundsystem"&&project.navigationDesignSystemVersion===1,"Versionsname oder Navigationsdesignsystem ist inkonsistent.");
  assert(project.schemaVersion===5&&project.dataLayerContractVersion===1,"Datenschema oder Datenebenenvertrag wurde verändert.");
  assert(project.objectStandardVersion===1&&project.billingSnapshotVersion===2,"Objektstandard oder Snapshotversion wurde verändert.");
  for(const key of ["meterMasterStandardVersion","meterReadingStandardVersion","meterPeriodStandardVersion","meterAssignmentStandardVersion","meterReplacementStandardVersion"]) assert(project[key]===1,`${key} ist inkonsistent.`);
  assert(app.includes('const APP_VERSION = "V99.4.12";')&&app.includes('const APP_VERSION_NAME = "Navigationsstruktur und visuelles Grundsystem";'),"Laufzeitversion ist inkonsistent.");
  assert(metrics.bytes===382650&&metrics.lines===6294,`app.js-Metrik ist unerwartet: ${metrics.bytes} Byte/${metrics.lines} Zeilen.`);
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
  for(const name of inventory.removedFunctions) assert(!new RegExp(`^function\\s+${name}\\s*\\(`,"m").test(app),`Entfernte AP10-Implementierung ist wieder in app.js vorhanden: ${name}`);
  assert(inventory.physicallyExtractedImplementations===79&&inventory.netTopLevelFunctionReduction===78,"AP10-Extraktionsinventar ist inkonsistent.");
  assert(inventory.ap6CompatibilityWrappersAfter===112&&inventory.ap10CompatibilityWrappersAdded===0,"Kompatibilitätsstand ist inkonsistent.");

  const storageUsers=moduleNames.filter(name=>/\blocalStorage\b/.test(sources[name])).sort();
  assert(JSON.stringify(storageUsers)===JSON.stringify(["persistence","ui-preferences"]),`Direkte Speicherzugriffe außerhalb der Adapter: ${storageUsers.join(", ")}`);
  assert(sources["meter-master"].includes('billingRole:"excluded"')&&sources["meter-master"].includes("abrechnungsrelevant:false"),"Stromzähler-Dummy ist nicht zentral ausgeschlossen.");
  assert(sources["billing-snapshot"].includes("const BILLING_SNAPSHOT_VERSION = 2;"),"Snapshotversion 2 fehlt.");

  assert((html.match(/class="tabs workflow-nav"/g)||[]).length===1,"Es existiert nicht genau eine produktive Navigation.");
  assert(/<nav\s+aria-label="Hauptnavigation"\s+class="tabs workflow-nav"/.test(html),"Produktive Navigation ist nicht semantisch ausgezeichnet.");
  const groups=[...html.matchAll(/<section class="nav-group" data-nav-group-section="([^"]+)">/g)].map(match=>match[1]);
  assert(JSON.stringify(groups)===JSON.stringify(["object","billing","archive","extras"]),`Navigationsgruppen sind inkonsistent: ${groups.join(", ")}`);
  const tabs=[...html.matchAll(/class="tab-btn nav-group-item[^"]*"[^>]*data-tab="([^"]+)"/g)].map(match=>match[1]);
  const expectedTabs=["objekt","wohnungsverwaltung","wasser","mieterverwaltung","einstellungen","umlage","qualitaet","briefe","export","start","mieter","einnahmen","manuellewerte","vorauszahlungsanpassung","archiv","sicherung"];
  assert(JSON.stringify(tabs)===JSON.stringify(expectedTabs),`Navigationsziele sind inkonsistent: ${tabs.join(", ")}`);
  assert(navInventory.version==="99.4.12"&&navInventory.groups.length===4&&navInventory.iconSystem.count===22,"AP11-Navigationsinventar ist inkonsistent.");
  assert((html.match(/class="nav-icon-svg"/g)||[]).length===22,"Iconinventar ist inkonsistent.");
  assert(!/<link[^>]+(?:fontawesome|material-icons|bootstrap-icons)|https?:\/\/[^"']+\.(?:svg|woff2?)/i.test(html),"Externe Icon- oder Schriftabhängigkeit ist vorhanden.");
  const settings=html.match(/<button[^>]*class="sidebar-settings-dummy"[^>]*>/)?.[0]||"";
  assert(settings.includes('aria-disabled="true"')&&settings.includes('data-nav-hint="Noch nicht verfügbar"')&&!settings.includes("data-ui-action"),"Einstellungen-Dummy ist inkonsistent.");
  for(const token of ["--font-ui","--color-primary","--focus-ring","--sidebar-width","--sidebar-shell","--sidebar-surface","--sidebar-text","--sidebar-icon","--sidebar-active","--sidebar-hover","--sidebar-disabled","--workspace-bg"]) assert(css.includes(token+":"),`Design-Token ${token} fehlt.`);
  assert(css.includes("V99.4.12 – AP11: Navigationsstruktur und visuelles Grundsystem")&&!css.includes("V99.2.6 – freigegebenes Mock-up der linken Navigation"),"AP11-CSS-Struktur ist inkonsistent.");
  assert(css.includes("@media (max-width:980px)")&&css.includes("@media (max-height:720px)"),"Responsive Navigationsregeln fehlen.");
  assert(navigation.includes('wasser:"group-object"')&&navigation.includes('node.setAttribute("aria-current", "page")'),"Aktiver Navigationspfad ist inkonsistent.");
  assert(!/\b(localStorage|indexedDB|caches)\b/.test(navigation)&&!/\bstate\s*[.[]/.test(navigation),"Navigation greift direkt auf Fachzustand oder Browserspeicher zu.");

  const expectedScripts=moduleNames.map(name=>`./js/${name}.js`);
  const actualScripts=[...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match=>match[1]);
  assert(JSON.stringify(actualScripts)===JSON.stringify(expectedScripts),`Skriptreihenfolge ist inkonsistent: ${JSON.stringify(actualScripts)}`);
  assert(html.includes("<title>NK-Pro V99.4.12 – Navigationsstruktur und visuelles Grundsystem</title>"),"HTML-Titel ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-12";'),"Service-Worker-Cache ist inkonsistent.");
  for(const resource of ["./","./index.html","./manifest.webmanifest","./assets/app.css",...expectedScripts,"./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png"]) assert(worker.includes(`"${resource}"`),`PWA-App-Shell enthält ${resource} nicht.`);

  for(const required of [
    "README.md","ARCHITECTURE.md","MODULE_UEBERSICHT.md","UI_ARCHITEKTUR_AKTUELL.md","DEVELOPMENT_GUIDE.md","VERANTWORTLICHKEITSMATRIX.md","ROADMAP.md","TECH_DEBT.md","CHANGELOG.md","TESTING.md","NK-PRO-PROJEKTSTAND.md",
    "AP11_NAVIGATIONSSTRUKTUR_UND_VISUELLES_GRUNDSYSTEM.md","AP11_REFERENZBILDANALYSE.md","AP11_NAVIGATIONSINVENTAR.md","AP11_DESIGN_TOKENS.md","AP11_ICONUEBERSICHT.md","AP11_RESPONSIVE_BARRIEREFREIHEIT.md","AP11_VORHER_NACHHER.md","AP11_PRUEFBERICHT.md","AP11_NAVIGATION_INVENTORY.json","AP11_TEST_RESULTS.json",
    "AP11_VISUAL_REFERENCES/navigation-1920x1080.png","AP11_VISUAL_REFERENCES/navigation-1600x900.png","AP11_VISUAL_REFERENCES/navigation-1366x768.png","AP11_VISUAL_REFERENCES/navigation-1280x720.png","AP11_VISUAL_REFERENCES/navigation-schmal-900x720.png","AP11_VISUAL_REFERENCES/navigation-zoom-150.png",
    "AP10_PHYSISCHE_ARCHIV_JAHRESWECHSEL_QUALITAET_DIAGNOSEORCHESTRIERUNG.md","AP10_PRUEFBERICHT.md","AP10_BASELINE_INVENTORY.json","ANWENDUNGSAKTIONSUEBERSICHT.md","UI_CONTROLLER_UEBERSICHT.md","ZUSTANDSZUGRIFFE.md","KOMPATIBILITAETSSCHICHT.md","SHA256SUMS.txt"
  ]) assert(fs.existsSync(path.join(root,required)),`${required} fehlt.`);
  verifyChecksums();
  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.12, eine semantische Navigation, 4 Gruppen, 16 Ziele, 22 lokale SVG-Icons, 13 UI-Controller, 99 Aktionen, Datenschema 5, Snapshot 2 und vollständige PWA-App-Shell sind konsistent.\n");
}
try{main();}catch(error){process.stderr.write(`FEHLER: ${error.message}\n`);process.exit(1);}
