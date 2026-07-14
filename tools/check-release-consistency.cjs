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
  const html=read("index.html"),css=read("assets/app.css"),runtime=read("js/app-runtime-config.js"),worker=read("service-worker.js");
  const rules=read("js/quality-rules.js"),assurance=read("js/quality-assurance.js"),qualityUi=read("js/ui-quality.js"),workflow=read("js/billing-workflow.js"),documentData=read("js/document-data.js"),context=read("js/billing-context.js");
  const inventory=json("AP20_PRUEFINVENTAR.json"),overview=json("AP20_REGELUEBERSICHT.json"),results=json("AP20_TEST_RESULTS.json");
  const architecture=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/analyze-ap12-architecture.cjs")],{encoding:"utf8"}));
  const appMetrics=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/analyze-app-js.cjs")],{encoding:"utf8"}));

  assert(pkg.name==="nk-pro-v99-4-23"&&pkg.version==="99.4.23","Paketversion ist inkonsistent.");
  assert(lock.name===pkg.name&&lock.version===pkg.version&&lock.packages?.[""]?.name===pkg.name&&lock.packages?.[""]?.version===pkg.version,"Package-Lock ist inkonsistent.");
  assert(manifest.version==="99.4.23"&&manifest.name.includes("V99.4.23"),"Manifestversion ist inkonsistent.");
  assert(project.appVersion==="99.4.23"&&project.displayVersion==="V99.4.23"&&project.basedOn==="99.4.22-AP19","Projektversion ist inkonsistent.");
  assert(project.schemaVersion===5&&project.dataLayerContractVersion===1,"Datenverträge wurden verändert.");
  assert(project.documentLayoutVersion===4&&project.controlledBillingContextVersion===1&&project.billingReadOnlyModeVersion===1,"AP13-/AP19-Stand ist inkonsistent.");
  assert(project.centralQualityRuleRegistryVersion===1&&project.centralQualityResultModelVersion===1&&project.qualityConfirmationFingerprintVersion===1&&project.systemDiagnosticsSeparationVersion===1&&project.priorYearPlausibilityVersion===1,"AP20-Metadaten fehlen.");
  assert(project.pwaCacheName==="nk-pro-v99-4-23-ap20","PWA-Cachekennung ist inkonsistent.");
  assert(runtime.includes('const APP_VERSION = "V99.4.23";')&&runtime.includes('const APP_VERSION_NAME = "AP20-Zentrales Prüf-, Plausibilitäts- und Freigabesystem";'),"Laufzeitmetadaten sind inkonsistent.");
  assert(html.includes("NK-Pro V99.4.23")&&html.includes("AP20-Zentrales Prüf-, Plausibilitäts- und Freigabesystem"),"HTML-Version ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-23-ap20";'),"Service-Worker-Cache ist inkonsistent.");

  const scripts=[...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match=>match[1]);
  assert(scripts.length===52&&scripts.at(-2)==="./js/app.js"&&scripts.at(-1)==="./js/service-worker-register.js","Produktive Skriptreihenfolge ist inkonsistent.");
  assert(scripts.indexOf("./js/quality-rules.js")>=0&&scripts.indexOf("./js/quality-rules.js")<scripts.indexOf("./js/quality-assurance.js"),"Zentrale Registry wird nicht vor dem Adapter geladen.");
  for(const resource of ["./","./index.html","./manifest.webmanifest","./assets/app.css",...scripts,"./icons/icon-16.png","./icons/icon-32.png","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-192.png","./icons/icon-maskable-512.png"]){
    assert(worker.includes(`"${resource}"`),`PWA-App-Shell enthält ${resource} nicht.`);if(resource.startsWith("./")&&resource!=="./")assert(exists(resource.slice(2)),`Produktive Ressource fehlt: ${resource}`);
  }
  assert(worker.includes('key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME')&&worker.includes('requestUrl.origin !== self.location.origin')&&worker.includes('if (response && response.ok)')&&worker.includes('event.request.mode === "navigate"'),"PWA-Härtung ist inkonsistent.");

  assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html),"Inline-Handler sind vorhanden.");
  assert((html.match(/data-section-role="validation"/g)||[]).length===15,"Anzahl produktiv angebundener Fachseitenbereiche ist inkonsistent.");
  assert(html.includes('id="qualityStatusCards"')&&html.includes('id="qualityGroupedChecks"')&&html.includes('id="qualityDetailDialog"')&&html.includes('id="systemDiagnosticsSummary"'),"AP20-Oberflächen sind unvollständig.");
  assert(css.includes(".quality-status-cards")&&css.includes(".quality-detail-dialog")&&css.includes(".context-quality-summary")&&css.includes("@media (max-width:620px)"),"AP20-Stile oder Responsive-Regeln fehlen.");

  assert(rules.includes("qualityRuleConfirmationsV2")&&rules.includes("function consumptionThreshold")&&rules.includes("function saveConfirmation"),"Registry, Schwellen oder Fingerprint-Bestätigungen fehlen.");
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

  assert(architecture.totals.stateRootAssignments===1&&architecture.renderers.length===51&&architecture.renderers.every(item=>!item.mutatesState&&!item.persists&&!item.navigates&&!item.opensDialog),"Renderer-/State-Architektur ist inkonsistent.");
  assert(appMetrics.lines<=250&&appMetrics.directStateWriteSites===0&&appMetrics.globalAssignments===0,"app.js-Orchestrierungsgrenze ist verletzt.");

  for(const file of [
    "AP20_ZENTRALES_PRUEF_PLAUSIBILITAETS_UND_FREIGABESYSTEM.md","AP20_PRUEFINVENTAR.md","AP20_PRUEFINVENTAR.json","AP20_REGELUEBERSICHT.md","AP20_REGELUEBERSICHT.json","AP20_PRUEFBERICHT.md","AP20_TEST_RESULTS.json","AP20_DATEIAENDERUNGEN.md","AP20_DATEIAENDERUNGEN.json","AP20_RELEASE_CONTENT_POLICY.json",
    "tests/ap20-central-quality-system.test.cjs","tests/ap20-central-quality-system.spec.js","tools/check-ap20-browser-harness.cjs","js/quality-rules.js"
  ])assert(exists(file),`${file} fehlt.`);
  for(const previous of [["AP15_TEST_RESULTS.json","99.4.18"],["AP17_TEST_RESULTS.json","99.4.20"],["AP18_TEST_RESULTS.json","99.4.21"],["AP19_TEST_RESULTS.json","99.4.22"]])assert(json(previous[0]).version===previous[1],`${previous[0]} wurde historisch verändert.`);

  const contentReport=JSON.parse(childProcess.execFileSync(process.execPath,[path.join(root,"tools/check-release-contents.cjs"),"--ignore-node-modules","--strict","--json"],{encoding:"utf8"}));
  assert(contentReport.status==="passed",`Release-Inhaltsprüfung ist nicht bestanden: ${JSON.stringify(contentReport.findings)}`);
  verifyChecksums();
  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.23 mit 176 inventarisierten Prüfstellen, 42 zentralen Regeln, unveränderten Datenverträgen, AP19-Schreibschutz, getrennter Systemdiagnose und AP13-Ausgaberegression ist konsistent.\n");
}
try{main();}catch(error){process.stderr.write(`FEHLER: ${error.message}\n`);process.exit(1);}
