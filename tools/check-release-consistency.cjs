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
  const ap13Results=JSON.parse(read("AP13_TEST_RESULTS.json"));
  const ap14Results=JSON.parse(read("AP14_TEST_RESULTS.json"));
  const html=read("index.html");
  const css=read("assets/app.css");
  const app=read("js/app.js");
  const runtimeConfig=read("js/app-runtime-config.js");
  const stateOwner=read("js/app-state-persistence.js");
  const diagnostics=read("js/runtime-diagnostics.js");
  const navigation=read("js/navigation.js");
  const documentRenderer=read("js/document-renderer.js");
  const documentUi=read("js/ui-documents.js");
  const worker=read("service-worker.js");
  const metrics=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/analyze-app-js.cjs")],{encoding:"utf8"}));
  const architecture=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/analyze-ap12-architecture.cjs")],{encoding:"utf8"}));

  assert(packageJson.name==="nk-pro-v99-4-17"&&packageJson.version==="99.4.17","Paketversion ist inkonsistent.");
  assert(lockJson.name==="nk-pro-v99-4-17"&&lockJson.version==="99.4.17","Package-Lock-Version ist inkonsistent.");
  assert(lockJson.packages?.[""]?.name==="nk-pro-v99-4-17"&&lockJson.packages?.[""]?.version==="99.4.17","Package-Lock-Root ist inkonsistent.");
  assert(manifest.version==="99.4.17"&&manifest.name.includes("V99.4.17"),"Manifestversion ist inkonsistent.");
  assert(project.appVersion==="99.4.17"&&project.displayVersion==="V99.4.17"&&project.basedOn==="99.4.17-AP13","Projektversionsmetadaten sind inkonsistent.");
  assert(project.versionName==="AP14-Navigationsbereinigung und visuelles UI-System","Versionsname ist inkonsistent.");
  assert(project.schemaVersion===5&&project.dataLayerContractVersion===1,"Datenschema oder Datenebenenvertrag wurde verändert.");
  assert(project.objectStandardVersion===1&&project.billingSnapshotVersion===2,"Objektstandard oder Snapshotversion wurde verändert.");
  for(const key of ["meterMasterStandardVersion","meterReadingStandardVersion","meterPeriodStandardVersion","meterAssignmentStandardVersion","meterReplacementStandardVersion"]){
    assert(project[key]===1,`${key} ist inkonsistent.`);
  }
  assert(runtimeConfig.includes('const APP_VERSION = "V99.4.17";')&&runtimeConfig.includes('const APP_VERSION_NAME = "AP14-Navigationsbereinigung und visuelles UI-System";'),"Laufzeitversion ist inkonsistent.");
  assert(html.includes("<title>NK-Pro V99.4.17 – AP14-Navigationsbereinigung und visuelles UI-System</title>"),"HTML-Titel ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-17-ap14";'),"Service-Worker-Cache ist inkonsistent.");

  assert(project.documentLayoutVersion===4,"AP13-Dokumentlayoutversion 4 fehlt.");
  assert(documentRenderer.includes("data-nk-letter-styles")&&documentRenderer.includes("data-document-pages"),"Gemeinsames AP13-Dokumentmodell fehlt.");
  assert(documentRenderer.includes("Ihre<br>Vorauszahlung")&&documentRenderer.includes("<col class=\"col-balance\">"),"AP13-Haupttabelle ist unvollständig.");
  assert(documentRenderer.includes("const hasSupplement = !!additionalText || prepaymentAdjustmentRequired"),"AP13-Seitenlogik ist inkonsistent.");
  assert(documentUi.includes("Zahlungstext bei Guthaben")&&documentUi.includes("Hinweis zum Dauerauftrag")&&documentUi.includes("Optionaler Abschlusstext vor der Grußformel"),"AP13-Texteditoren sind unvollständig.");
  assert(documentRenderer.includes("AP13_RESULT_GREEN_BG")&&documentRenderer.includes("result-cell--final.is-credit"),"Grüne Guthabenkennzeichnung fehlt.");
  assert(documentRenderer.includes("margin-bottom:6mm")&&documentRenderer.includes("top:49mm"),"AP13-Abstands- oder Seite-2-Korrektur fehlt.");
  assert(documentRenderer.includes("Anpassung der Nebenkostenvorauszahlung")&&!documentRenderer.includes("Diese Folgeseite enthält ausschließlich"),"Seite-2-Textkorrektur ist unvollständig.");
  assert(documentRenderer.includes("payment-notice{padding:3mm;border-left:.6mm solid"),"Blauer Akzentstrich am Zahlungshinweis fehlt.");
  assert(documentUi.includes("mit offenen Abrechnungen verrechnet")&&documentUi.includes("Auf Basis Ihres individuellen Verbrauchs"),"AP13-Standardtextkorrekturen fehlen.");
  assert(css.includes("V99.4.17 - AP13: Briefsteuerung, Schwarzweißdruck, Sticky-Vorschau und Startnavigation")&&documentUi.includes('attachShadow({ mode:"open" })'),"AP13-Vorschau-Skalierung fehlt.");
  assert(documentRenderer.includes('if (!prepaymentAdjustmentRequired(costRows, tenant)) return "";'),"Vorauszahlungsschalter wird vom Renderer nicht beachtet.");
  assert(documentRenderer.includes('class="continuation-hint">Weiter auf Seite 2'),"Fortsetzungshinweis fehlt.");
  assert(documentRenderer.includes('data-print-mode="')&&documentRenderer.includes('is-monochrome'),"Schwarzweiß-Dokumentmodus fehlt.");
  assert(documentUi.includes("Für Schwarzweißdruck optimieren")&&documentUi.includes("schwarzweissOptimiert"),"Schwarzweißschalter fehlt.");
  assert(css.includes("position:sticky")&&css.includes("max-width:1100px"),"Responsive Sticky-Vorschau fehlt.");

  assert(project.navigationDesignSystemVersion===3&&project.uiVisualSystemVersion===1&&project.meterInventoryDummyVersion===1&&project.pwaCacheName==="nk-pro-v99-4-17-ap14","AP14-UI-/PWA-Metadaten fehlen.");
  assert(css.includes('--font-ui:"Segoe UI",Arial,sans-serif;')&&css.includes("V99.4.17 – AP14: Navigationsbereinigung und visuelles UI-System"),"AP14-Typografie oder UI-System fehlt.");
  assert(css.includes(".letter-page")&&css.includes("font-family:Arial, sans-serif"),"Briefdarstellung ist nicht vom App-Schriftsystem abgegrenzt.");
  assert(html.includes('id="workspaceHelpButton"')&&html.includes('id="workspaceMenuButton"'),"Hilfe oder Menü fehlt im Kopfbereich.");
  assert(html.includes('<section class="tab meter-inventory-page" id="wasser">')&&html.includes('<section class="tab meter-pilot-page" id="verbraeuche">'),"AP14-Seitentrennung fehlt.");
  assert(html.includes('data-tab="manuellewerte"')&&html.indexOf('data-tab="manuellewerte"')<html.indexOf('data-tab="verbraeuche"')&&html.indexOf('data-tab="verbraeuche"')<html.indexOf('data-tab="umlage"'),"Verbräuche erfassen ist falsch einsortiert.");
  assert(runtimeConfig.includes('const START_NAV_TABS = ["landing","objekt","mieterverwaltung","wohnungsverwaltung","wasser","start","archiv","sicherung"];'),"AP14-Startnavigation ist inkonsistent.");
  assert(runtimeConfig.includes('const BILLING_NAV_TABS = ["qualitaet","mieter","einstellungen","einnahmen","manuellewerte","verbraeuche","umlage","vorauszahlungsanpassung","briefe","export"];'),"AP14-Abrechnungsnavigation ist inkonsistent.");

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
  const expectedTabs=["objekt","wohnungsverwaltung","wasser","mieterverwaltung","start","mieter","einnahmen","einstellungen","manuellewerte","verbraeuche","umlage","qualitaet","vorauszahlungsanpassung","briefe","export","archiv","sicherung"];
  assert(JSON.stringify(tabs)===JSON.stringify(expectedTabs),`Navigationsreihenfolge ist inkonsistent: ${tabs.join(", ")}`);
  assert(!html.includes("Weitere Abrechnungsschritte")&&!html.includes("nav-group-item--secondary"),"Entfernte Abrechnungsuntergruppe ist noch vorhanden.");
  const billingInventory=navInventory.groups.find(group=>group.key==="billing")?.items||[];
  assert(billingInventory.length===10&&billingInventory.every(item=>item.secondary===false),"AP11-Inventar enthält noch eine sekundäre Abrechnungsuntergruppe.");
  assert(navInventory.groups.length===4&&navInventory.iconSystem.count===22,"Historisches AP11-Navigationsinventar ist inkonsistent.");
  assert((html.match(/class="nav-icon-svg"/g)||[]).length===26,"Aktuelles Iconinventar einschließlich Start ist inkonsistent.");
  assert(html.includes('class="tab-btn nav-start-link"')&&html.includes('data-tab="landing"')&&html.includes('class="nav-item-label">Start</span>'),"Startnavigation fehlt.");
  assert(css.includes(".nav-start-entry")&&css.includes("border-bottom:1px solid var(--sidebar-line)"),"Trennlinie unter Start fehlt.");
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
  assert(ap13Results.status==="passed"&&ap13Results.browserTests===8&&ap13Results.controlPdfs.standardPages===1&&ap13Results.controlPdfs.extendedPages===2&&ap13Results.controlPdfs.monochromePages===2,"AP13-Testbericht ist nicht vollständig bestanden.");
  assert(ap13Results.sharedDocumentModel===true&&ap13Results.previewPrintParity===true,"AP13-Dokumentparität ist nicht bestätigt.");
  assert(ap14Results.status==="passed"&&ap14Results.staticTests>=1&&ap14Results.browserTests>=6&&ap14Results.releaseConsistency===true,"AP14-Testbericht ist nicht vollständig bestanden.");
  assert(ap14Results.meterInventoryDummyStateNeutral===true&&ap14Results.consumptionCaptureMoved===true&&ap14Results.letterTypographyUnchanged===true,"AP14-Abgrenzungsprüfungen sind nicht bestätigt.");

  const required=[
    "README.md","ARCHITECTURE.md","MODULE_UEBERSICHT.md","UI_ARCHITEKTUR_AKTUELL.md","ABHAENGIGKEITSUEBERSICHT.md","ANWENDUNGSSTART.md",
    "GLOBALE_SCHNITTSTELLEN_INVENTAR.md","KOMPATIBILITAETSSCHICHT.md","ZUSTANDSZUGRIFFE.md","VERANTWORTLICHKEITSMATRIX.md",
    "ROADMAP.md","TECH_DEBT.md","CHANGELOG.md","TESTING.md","NK-PRO-PROJEKTSTAND.md","SHA256SUMS.txt",
    "AP12_RESTENTKOPPLUNG_UND_ZUSTANDSBEREINIGUNG.md","AP12_APP_JS_BESTANDSANALYSE.md","AP12_ZUSTANDSINVENTAR.md",
    "AP12_MUTATIONSINVENTAR.md","AP12_WINDOW_BINDUNGEN.md","AP12_RENDERER_DIALOG_NAVIGATION.md","AP12_ABHAENGIGKEITEN_UND_START.md",
    "AP12_LEGACY_KOMPATIBILITAET.md","AP12_PRUEFBERICHT.md","AP12_BASELINE_INVENTORY.json","AP12_APP_JS_INVENTORY_BEFORE.json",
    "AP12_APP_JS_INVENTORY_AFTER.json","AP12_ARCHITECTURE_INVENTORY.json","AP12_FUNKTIONSINVENTAR.json","AP12_MUTATIONSINVENTAR.json",
    "AP12_RENDERER_INVENTAR.json","AP12_ZUSTANDSINVENTAR.json","AP12_TEST_RESULTS.json","AP12_FINAL_RELEASE_VERIFICATION.json","AP12_DATEIAENDERUNGEN.md","AP12_DATEIAENDERUNGEN.json",
    "AP13_BRIEFLAYOUT_DRUCKBILD_VORSCHAUKONSISTENZ.md","AP13_KORREKTUREN_V99.4.17.md","AP13_PRUEFBERICHT.md","AP13_TEST_RESULTS.json","AP13_CONTROL_OUTPUT_METRICS.json",
    "AP13_Kontrollausgabe_Standard_1_Seite.pdf","AP13_Kontrollausgabe_Erweitert_2_Seiten.pdf","AP13_Kontrollausgabe_Schwarzweiss_2_Seiten.pdf","tests/ap13-letter-layout.test.cjs","tests/ap13-letter-layout.spec.js","tools/generate-ap13-controls.cjs",
    "AP14_NAVIGATIONSBEREINIGUNG_UND_VISUELLES_UI_SYSTEM.md","AP14_PRUEFBERICHT.md","AP14_TEST_RESULTS.json","AP14_DATEIAENDERUNGEN.md","AP14_DATEIAENDERUNGEN.json","tests/ap14-ui-navigation.test.cjs","tests/ap14-ui-navigation.spec.js"
  ];
  for(const file of required) assert(exists(file),`${file} fehlt.`);
  for(const moduleName of baseline.newModules) assert(exists(`js/${moduleName}`),`AP12-Modul fehlt: js/${moduleName}`);
  assert(!exists("js/app.v99.4.12.baseline.js"),"Temporäre AP12-Baseline ist im Release enthalten.");
  verifyChecksums();
  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.17 mit AP13-Dokumentmodell, AP14-UI-System, 17 Navigationszielen, getrenntem Zählerinventar/Verbrauchsbereich, app.js 225 Zeilen, 46 seiteneffektfreien Renderern und vollständiger PWA-App-Shell ist konsistent.\n");
}
try{main();}catch(error){process.stderr.write(`FEHLER: ${error.message}\n`);process.exit(1);}
