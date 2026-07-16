"use strict";

const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const childProcess=require("node:child_process");
const root=path.resolve(__dirname,"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const json=relative=>JSON.parse(read(relative));
const exists=relative=>fs.existsSync(path.join(root,relative));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const hash=relative=>crypto.createHash("sha256").update(fs.readFileSync(path.join(root,relative))).digest("hex");

function releaseFiles(){
  const result=[];const ignored=new Set(["node_modules","test-results","playwright-report",".git"]);
  function walk(dir,prefix=""){
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      if(ignored.has(entry.name))continue;
      const relative=prefix?path.posix.join(prefix,entry.name):entry.name;
      if(entry.isDirectory())walk(path.join(dir,entry.name),relative);
      else if(entry.isFile()&&relative!=="SHA256SUMS.txt")result.push(relative);
    }
  }
  walk(root);return result.sort();
}
function verifyChecksums(){
  assert(exists("SHA256SUMS.txt"),"SHA256SUMS.txt fehlt.");
  const rows=read("SHA256SUMS.txt").trim().split(/\r?\n/).filter(Boolean);const entries=new Map();
  for(const row of rows){const match=row.match(/^([a-f0-9]{64})\s{2}(.+)$/);assert(match,`Ungültige Prüfsummenzeile: ${row}`);entries.set(match[2],match[1]);}
  const files=releaseFiles();assert(entries.size===files.length,`Prüfsummenbestand ist unvollständig: ${entries.size} statt ${files.length}.`);
  for(const file of files){assert(entries.has(file),`Prüfsumme fehlt: ${file}`);assert(entries.get(file)===hash(file),`Prüfsumme weicht ab: ${file}`);}
}
function main(){
  const pkg=json("package.json"),lock=json("package-lock.json"),manifest=json("manifest.webmanifest"),project=json("nk-pro-project.json");
  const html=read("index.html"),css=read("assets/app.css"),runtime=read("js/app-runtime-config.js"),worker=read("service-worker.js"),navigation=read("js/navigation.js"),diagnostics=read("js/diagnostics.js"),uiDesignSystem=read("js/ui-design-system.js");
  const rules=read("js/quality-rules.js"),assurance=read("js/quality-assurance.js"),qualityUi=read("js/ui-quality.js"),workflow=read("js/billing-workflow.js"),documentData=read("js/document-data.js"),context=read("js/billing-context.js"),meteringUi=read("js/ui-metering.js"),uiBindings=read("js/ui-bindings.js");
  const inventory=json("AP20_PRUEFINVENTAR.json"),overview=json("AP20_REGELUEBERSICHT.json"),results=json("AP20_TEST_RESULTS.json");
  const architecture=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/analyze-ap12-architecture.cjs")],{encoding:"utf8"}));
  const appMetrics=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/analyze-app-js.cjs")],{encoding:"utf8"}));

  assert(pkg.name==="nk-pro-v99-4-29"&&pkg.version==="99.4.29","Paketversion ist inkonsistent.");
  assert(lock.name===pkg.name&&lock.version===pkg.version&&lock.packages?.[""]?.name===pkg.name&&lock.packages?.[""]?.version===pkg.version,"Package-Lock ist inkonsistent.");
  assert(manifest.version==="99.4.29"&&manifest.name.includes("V99.4.29"),"Manifestversion ist inkonsistent.");
  assert(project.appVersion==="99.4.29"&&project.displayVersion==="V99.4.29"&&project.versionName==="AP22A – UI-Bibliothek: Inventar, Architektur und Fundament"&&project.basedOn==="99.4.28-AP21C-Individuelle-Werte","Projektversion ist inkonsistent.");
  assert(project.schemaVersion===5&&project.dataLayerContractVersion===1,"Datenverträge wurden verändert.");
  assert(project.documentLayoutVersion===4&&project.controlledBillingContextVersion===1&&project.billingReadOnlyModeVersion===1,"AP13-/AP19-Stand ist inkonsistent.");
  assert(project.centralQualityRuleRegistryVersion===1&&project.centralQualityResultModelVersion===1&&project.qualityConfirmationFingerprintVersion===1&&project.systemDiagnosticsSeparationVersion===1&&project.priorYearPlausibilityVersion===1,"AP20-Metadaten fehlen.");
  assert(project.pwaCacheName==="nk-pro-v99-4-29-ap22a","PWA-Cachekennung ist inkonsistent.");
  assert(project.meterInputLiveCalculationVersion===1&&project.meterInputLocaleNumberVersion===1&&project.assetCacheBustVersion===1&&project.serviceWorkerForcedUpdateVersion===1&&project.runtimeBuildId==="99.4.29-ap22a"&&project.uiConsolidationVersion===1&&project.individualValuesPageVersion===2&&project.navigationTerminologyVersion===1&&project.globalSpacingGridVersion===1,"Korrekturstände 2 und 3 sind nicht vollständig dokumentiert.");
  assert(runtime.includes('const APP_VERSION = "V99.4.29";')&&runtime.includes('const APP_VERSION_NAME = "AP22A-UI-Bibliothek-Fundament";'),"Laufzeitmetadaten sind inkonsistent.");
  assert(html.includes("NK-Pro V99.4.29")&&html.includes("AP22A UI-Bibliothek")&&html.includes('content="99.4.29-ap22a" name="nk-pro-build"'),"HTML-Version ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-29-ap22a";')&&worker.includes('const BUILD_ID = "99.4.29-ap22a";'),"Service-Worker-Cache ist inkonsistent.");

  const scripts=[...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match=>match[1].split("?")[0]);
  assert(scripts.length===54&&scripts.at(-2)==="./js/app.js"&&scripts.at(-1)==="./js/service-worker-register.js","Produktive Skriptreihenfolge ist inkonsistent.");
  assert(scripts.indexOf("./js/quality-rules.js")>=0&&scripts.indexOf("./js/quality-rules.js")<scripts.indexOf("./js/quality-assurance.js"),"Zentrale Registry wird nicht vor dem Adapter geladen.");
  for(const resource of ["./","./index.html","./manifest.webmanifest","./assets/app.css",...scripts,"./icons/icon-16.png","./icons/icon-32.png","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-192.png","./icons/icon-maskable-512.png"]){
    assert(worker.includes(`"${resource}"`),`PWA-App-Shell enthält ${resource} nicht.`);if(resource.startsWith("./")&&resource!=="./")assert(exists(resource.slice(2)),`Produktive Ressource fehlt: ${resource}`);
  }
  assert(worker.includes('key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME')&&worker.includes('requestUrl.origin !== self.location.origin')&&worker.includes('if (response && response.ok)')&&worker.includes('event.request.mode === "navigate"'),"PWA-Härtung ist inkonsistent.");

  assert(html.includes('data-navigation-render-root=""')&&html.includes('data-workflow-navigation=""'),"AP21B2-Render-Ziel fehlt.");
  assert(!html.includes('data-nav-group-section="object"')&&!html.includes('class="tab-btn nav-group-item"'),"Statische Navigationsduplikation ist noch vorhanden.");
  assert(navigation.includes("const NAVIGATION_GROUPS = Object.freeze([")&&navigation.includes("function renderNavigationMarkup()")&&navigation.includes("function navigationDefinition()")&&navigation.includes("function visibleTabIds()"),"AP21B2-zentrale Navigationsdefinition fehlt.");
  assert(navigation.includes('const GROUP_KEYS = Object.freeze(NAVIGATION_GROUPS.map')&&navigation.includes('NAVIGATION_GROUPS.reduce(function (paths, group)'),"Gruppen und Seitenschlüssel werden nicht aus der zentralen Definition abgeleitet.");
  assert(diagnostics.includes('navigation.navigationDefinition()')&&diagnostics.includes('navigation.visibleTabIds()'),"Diagnose verwendet nicht die zentrale Navigationsdefinition.");
  assert(project.navigationStructureVersion===2,"AP21B2-Navigationsstrukturversion fehlt.");
  assert(!html.includes('class="tab-btn nav-start-link"')&&html.includes('data-ui-action="navigation.showLanding" id="sidebarCollapseTop"'),"Start-/Zurück-Funktion ist inkonsistent.");
  assert(css.includes('/* V99.4.26 – AP21B1: linke Navigation nach verbindlicher Referenz */')&&css.includes('--sidebar-width:256px'),"Freigegebenes AP21B1-Navigationsdesign fehlt.");

  assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html),"Inline-Handler sind vorhanden.");
  assert((html.match(/data-section-role="validation"/g)||[]).length===14,"Anzahl produktiv angebundener Fachseitenbereiche ist inkonsistent.");
  assert(html.includes('id="qualityStatusCards"')&&html.includes('id="qualityGroupedChecks"')&&html.includes('id="qualityDetailDialog"')&&html.includes('id="systemDiagnosticsSummary"'),"AP20-Oberflächen sind unvollständig.");
  assert(css.includes(".quality-status-cards")&&css.includes(".quality-detail-dialog")&&css.includes(".context-quality-summary")&&css.includes("@media (max-width:620px)"),"AP20-Stile oder Responsive-Regeln fehlen.");

  assert(rules.includes("qualityRuleConfirmationsV2")&&rules.includes("function consumptionThreshold")&&rules.includes("function saveConfirmation"),"Registry, Schwellen oder Fingerprint-Bestätigungen fehlen.");
  assert(rules.includes("reversedMeterFindings")&&rules.includes("zaehlerDaten.messperioden und waterMeters.readings"),"NKP-PLAU-005 nutzt die zentrale Messperiodenstruktur nicht.");
  assert(read("js/meter-validation.js").includes("STARTUP_SAFE_VALIDATION_CODES")&&read("js/meter-validation.js").includes("METER_READING_REVERSED"),"Die Zählerstartkorrektur fehlt.");
  assert(meteringUi.includes("function parseMeterNumberInput")&&meteringUi.includes("meter.previewWaterValue")&&meteringUi.includes("data-meter-footer=\"total\"")&&meteringUi.includes("key:\"Enter\""),"Die Live-Zählerberechnung oder robuste Dezimaleingabe fehlt.");
  assert(uiBindings.includes("meter.previewWaterValue")&&uiBindings.includes("updateWaterMeterPreview")&&uiBindings.includes("meter.previewGenericValue"),"UI-Bindings der Live-Zählerberechnung fehlen.");
  assert(assurance.includes("qualityRules.evaluate")&&assurance.includes("centralReport"),"Qualitätsadapter delegiert nicht zentral.");
  assert(qualityUi.includes("renderContextualQualitySummaries")&&qualityUi.includes("renderSystemDiagnostics")&&qualityUi.includes("highlightQualityTarget"),"Fachseitenintegration oder Systemdiagnose fehlt.");
  assert(context.includes('"quality.confirmIssue"')&&context.includes('"quality.markNotApplicable"'),"AP20-Schreibaktionen sind nicht zentral geschützt.");
  assert(workflow.includes('reason:"open-plausibility"')&&documentData.includes('row.status === "Blockiert"')&&documentData.includes('row.status === "Zu prüfen"'),"Abschluss- oder Abnahmeprotokoll verwendet nicht das zentrale Modell.");

  assert(inventory.metadata.totalExistingChecks===176,"Prüfinventar muss 176 bestehende Prüfstellen enthalten.");
  const expectedDecisions={"1":0,"2":8,"3":26,"4":8,"5":6,"6":80,"7":47,"8":1};
  for(const [key,value] of Object.entries(expectedDecisions))assert(inventory.metadata.decisionCounts[key]===value,`Inventarentscheidung ${key} ist inkonsistent.`);
  assert(overview.metadata.ruleCount===42&&overview.rules.length===42,"Regelübersicht muss 42 Regeln enthalten.");
  assert(new Set(overview.rules.map(rule=>rule.ruleId)).size===42,"Regel-IDs sind nicht eindeutig.");
  const categories=overview.rules.reduce((map,row)=>(map[row.category]=(map[row.category]||0)+1,map),{});
  assert(categories["Fachliche Pflicht- und Konsistenzprüfung"]===19&&categories["Plausibilitätsprüfung"]===11&&categories["Fachlicher Hinweis oder Sonderfall"]===6&&categories["Technische Systemprüfung"]===6,"Regelkategorien sind inkonsistent.");
  assert(overview.rules.filter(row=>row.blocking).length===19&&overview.rules.filter(row=>row.confirmationAllowed).length===17,"Blockier- oder Bestätigungszählung ist inkonsistent.");
  assert(results.version==="99.4.23"&&results.workPackage==="AP20"&&String(results.status).startsWith("passed"),"AP20-Testbericht ist nicht freigegeben.");
  assert(results.browserHarnessScenarios===5&&results.browserHarnessChecks===48&&results.existingChecksFound===176,"AP20-Testzählung ist inkonsistent.");
  assert(results.correctionBuild===3&&results.correctionRegression&&results.correctionRegression.browserReloadWithStoredData==="passed"&&results.correctionRegression.startupFallback===false&&results.correctionRegression.liveConsumptionPreview==="passed"&&results.correctionRegression.enterCommit==="passed"&&results.correctionRegression.decimalComma==="passed"&&results.correctionRegression.decimalPoint==="passed"&&results.correctionRegression.meterValueReload==="passed"&&results.correctionRegression.versionedMeterAssets==="passed"&&results.correctionRegression.serviceWorkerUpdateViaCache==="none"&&results.correctionRegression.singleReloadAfterControllerChange==="passed"&&results.correctionRegression.historicalMalformedValueCorrection==="passed","AP20-Korrekturregression ist nicht freigegeben.");

  assert(architecture.totals.stateRootAssignments===1&&architecture.renderers.length===53&&architecture.renderers.every(item=>!item.mutatesState&&!item.persists&&!item.navigates&&!item.opensDialog),"Renderer-/State-Architektur ist inkonsistent.");
  assert(appMetrics.lines<=250&&appMetrics.directStateWriteSites===0&&appMetrics.globalAssignments===0,"app.js-Orchestrierungsgrenze ist verletzt.");

  for(const file of [
    "AP20_ZENTRALES_PRUEF_PLAUSIBILITAETS_UND_FREIGABESYSTEM.md","AP20_PRUEFINVENTAR.md","AP20_PRUEFINVENTAR.json","AP20_REGELUEBERSICHT.md","AP20_REGELUEBERSICHT.json","AP20_PRUEFBERICHT.md","AP20_TEST_RESULTS.json","AP20_DATEIAENDERUNGEN.md","AP20_DATEIAENDERUNGEN.json","AP20_RELEASE_CONTENT_POLICY.json",
    "tests/ap20-central-quality-system.test.cjs","tests/ap20-central-quality-system.spec.js","tests/ap20-meter-start-regression.test.cjs","tests/ap20-meter-calculation-regression.test.cjs","tools/check-ap20-browser-harness.cjs","tools/check-ap20-meter-start-browser.cjs","tools/check-ap20-meter-calculation-browser.cjs","AP20_KORREKTUR_1_ZAEHLERSTART.md","AP20_KORREKTUR_1_DATEIAENDERUNGEN.md","AP20_KORREKTUR_1_DATEIAENDERUNGEN.json","AP20_KORREKTUR_2_ZAEHLERBERECHNUNG.md","AP20_KORREKTUR_2_DATEIAENDERUNGEN.md","AP20_KORREKTUR_2_DATEIAENDERUNGEN.json","AP20_KORREKTUR_3_ASSETAKTUALISIERUNG.md","AP20_KORREKTUR_3_DATEIAENDERUNGEN.md","AP20_KORREKTUR_3_DATEIAENDERUNGEN.json","tests/ap20-asset-refresh-regression.test.cjs","js/quality-rules.js",
    "AP21_PRUEFPLAN.md","AP21_REGELPRUEFUNG.md","AP21_REGELPRUEFUNG.json","AP21_REGEL_001_NKP_FACH_001.md","AP21_REGEL_002_NKP_FACH_002.md","AP21_UMSETZUNG_001_NKP_FACH_001.md","AP21_TEST_RESULTS.json","tests/ap21-rule-audit.test.cjs"
  ])assert(exists(file),`${file} fehlt.`);
  for(const previous of [["AP15_TEST_RESULTS.json","99.4.18"],["AP17_TEST_RESULTS.json","99.4.20"],["AP18_TEST_RESULTS.json","99.4.21"],["AP19_TEST_RESULTS.json","99.4.22"]])assert(json(previous[0]).version===previous[1],`${previous[0]} wurde historisch verändert.`);
  const ap21aResults=json("AP21A_TEST_RESULTS.json");
  assert(ap21aResults.version==="99.4.24"&&ap21aResults.workPackage==="AP21A"&&ap21aResults.status==="passed","AP21A-Testbericht ist nicht freigegeben.");
  assert(ap21aResults.browser.total===102&&ap21aResults.browser.passed===99&&ap21aResults.browser.skipped===3&&ap21aResults.browser.failed===0&&ap21aResults.browser.ap21aPassed===5,"AP21A-Browserzählung ist inkonsistent.");
  for(const file of ["AP21A_UI_KONSOLIDIERUNG_NAVIGATION_INDIVIDUELLE_WERTE.md","AP21A_UMSETZUNGSPLAN.md","AP21A_DATEIAENDERUNGEN.md","AP21A_DATEIAENDERUNGEN.json","AP21A_PRUEFBERICHT.md","AP21A_TEST_RESULTS.json","AP21A_RELEASE_CONTENT_POLICY.json","AP21A_ABSCHLUSS.md","js/ui-individual-values.js","tests/ap21a-ui-consolidation.test.cjs","tests/ap21a-ui-consolidation.spec.js"])assert(exists(file),`${file} fehlt.`);
  for(const file of ["tests/ap21b1-navigation.test.cjs","tests/ap21b1-navigation.spec.js","tests/ap21b2-navigation-centralization.test.cjs","tests/ap21b2-navigation-centralization.spec.js","AP21B2_NAVIGATIONSZENTRALISIERUNG.md","AP21B2_DATEIAENDERUNGEN.md","AP21B2_DATEIAENDERUNGEN.json","AP21B2_PRUEFBERICHT.md","AP21B2_ABSCHLUSS.md"])assert(exists(file),`${file} fehlt.`);

  assert(project.individualValuesPageVersion===2,"AP21C-Seitenstrukturversion fehlt.");
  assert(html.includes('id="individualValuesStatusHeading"')&&html.includes('id="individualValuesListHeading"')&&html.includes('data-individual-result-count'),"AP21C-Seitenstruktur fehlt.");
  assert(css.includes('AP21C – klare Arbeitsstruktur')&&css.includes('.individual-values-overview')&&css.includes('.individual-cost-card__summary:focus-visible'),"AP21C-Stile fehlen.");
  assert(read("js/ui-individual-values.js").includes('data-individual-result-count')&&read("js/ui-individual-values.js").includes('NKProBillingWorkflow.setIndividualValuesImport'),"AP21C-UI-Integration fehlt.");
  for(const file of ["tests/ap21c-individual-values.test.cjs","tests/ap21c-individual-values.spec.js","AP21C_INDIVIDUELLE_WERTE.md","AP21C_DATEIAENDERUNGEN.md","AP21C_DATEIAENDERUNGEN.json","AP21C_PRUEFBERICHT.md","AP21C_TEST_RESULTS.json","AP21C_RELEASE_CONTENT_POLICY.json","AP21C_ABSCHLUSS.md"])assert(exists(file),`${file} fehlt.`);


  assert(project.uiDesignSystemVersion===1&&project.uiComponentCatalogVersion===1&&project.uiMigrationMatrixVersion===1,"AP22A-Metadaten fehlen.");
  assert(html.includes('./js/ui-design-system.js?v=99.4.29-ap22a'),"AP22A-UI-Bibliothek wird nicht geladen.");
  assert(css.includes('AP22A: zentrale UI-Bibliothek')&&css.includes('--nk-ui-color-accent')&&css.includes('.nk-ui-button')&&css.includes('.nk-ui-dialog'),"AP22A-Token- oder Komponentenfundament fehlt.");
  assert(uiDesignSystem.includes('global.NKProUIDesignSystem')&&uiDesignSystem.includes('const COMPONENTS = Object.freeze')&&uiDesignSystem.includes('function statusVariant'),"AP22A-UI-Bibliotheks-API fehlt.");
  for(const file of ["tests/ap22a-ui-library-foundation.test.cjs","tests/ap22a-ui-library-foundation.spec.js","AP22A_UI_BIBLIOTHEK_FUNDAMENT.md","UI_KOMPONENTENKATALOG.md","UI_MIGRATIONSMATRIX.md","UI_DESIGN_TOKENS.md","AP22A_DATEIAENDERUNGEN.md","AP22A_DATEIAENDERUNGEN.json","AP22A_PRUEFBERICHT.md","AP22A_TEST_RESULTS.json","AP22A_RELEASE_CONTENT_POLICY.json","AP22A_ABSCHLUSS.md"])assert(exists(file),`${file} fehlt.`);

  const contentReport=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/check-release-contents.cjs"),"--ignore-node-modules","--strict","--json"],{encoding:"utf8"}));
  assert(contentReport.status==="passed",`Release-Inhaltsprüfung ist nicht bestanden: ${JSON.stringify(contentReport.findings)}`);
  verifyChecksums();
  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.29/AP22A mit zentralem UI-Bibliotheksfundament, unveränderten Fachbereichen, 42 unveränderten zentralen Regeln und unveränderten Datenverträgen ist konsistent.\n");
}
try{main();}catch(error){process.stderr.write(`FEHLER: ${error.message}\n`);process.exit(1);}
