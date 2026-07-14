"use strict";
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const json=file=>JSON.parse(read(file));
const assert=(value,message)=>{if(!value)throw new Error(message);};

function main(){
  const project=json("nk-pro-project.json");
  const pkg=json("package.json");
  const manifest=json("manifest.webmanifest");
  const html=read("index.html");
  const rulesSource=read("js/quality-rules.js");
  const assurance=read("js/quality-assurance.js");
  const qualityUi=read("js/ui-quality.js");
  const bindings=read("js/ui-bindings.js");
  const context=read("js/billing-context.js");
  const workflow=read("js/billing-workflow.js");
  const documentData=read("js/document-data.js");
  const css=read("assets/app.css");
  const worker=read("service-worker.js");

  assert(pkg.name==="nk-pro-v99-4-23"&&pkg.version==="99.4.23","AP20-Paketversion ist inkonsistent.");
  assert(project.appVersion==="99.4.23"&&project.displayVersion==="V99.4.23"&&project.basedOn==="99.4.22-AP19","AP20-Projektmetadaten sind inkonsistent.");
  assert(project.schemaVersion===5&&project.dataLayerContractVersion===1,"Datenschema oder Datenebenenvertrag wurden verändert.");
  assert(project.centralQualityRuleRegistryVersion===1&&project.qualityConfirmationFingerprintVersion===1&&project.systemDiagnosticsSeparationVersion===1,"AP20-Metadaten fehlen.");
  assert(manifest.version==="99.4.23"&&worker.includes('const CACHE_NAME = "nk-pro-v99-4-23-ap20-corr3";'),"Manifest oder PWA-Cache ist inkonsistent.");
  assert(worker.includes('"./js/quality-rules.js"'),"Zentrale Regelregistry fehlt im Offline-App-Shell.");

  const sandbox={console}; sandbox.globalThis=sandbox; vm.createContext(sandbox); vm.runInContext(rulesSource,sandbox,{filename:"js/quality-rules.js"});
  const api=sandbox.NKProQualityRules;
  const registry=api.REGISTRY;
  assert(api&&registry.length===42,"Zentrale Registry muss 42 Regeln enthalten.");
  assert(new Set(registry.map(rule=>rule.id)).size===registry.length,"Regel-IDs sind nicht eindeutig.");
  assert(api.GROUPS.length===8,"Es müssen genau acht fachliche Prüfbereiche existieren.");
  const categoryCounts=registry.reduce((map,rule)=>(map[rule.category]=(map[rule.category]||0)+1,map),{});
  assert(categoryCounts[api.CATEGORY.MANDATORY]===19,"Anzahl fachlicher Pflichtregeln ist inkonsistent.");
  assert(categoryCounts[api.CATEGORY.PLAUSIBILITY]===11,"Anzahl Plausibilitätsregeln ist inkonsistent.");
  assert(categoryCounts[api.CATEGORY.HINT]===6,"Anzahl Hinweis-/Sonderfallregeln ist inkonsistent.");
  assert(categoryCounts[api.CATEGORY.TECHNICAL]===6,"Anzahl technischer Systemregeln ist inkonsistent.");
  assert(registry.every(rule=>rule.id&&rule.title&&rule.category&&rule.group&&rule.dataSource&&rule.prerequisites&&rule.notApplicable&&rule.trigger&&rule.solution&&rule.version),"Mindestens eine Regel ist unvollständig beschrieben.");

  assert(html.includes('id="qualityStatusCards"')&&html.includes('id="qualityGroupedChecks"')&&html.includes('id="qualityRuleRegistryTable"'),"Zentrales Prüfungscockpit ist unvollständig.");
  assert(html.includes('id="systemDiagnosticsSummary"')&&html.includes('id="qualityDetailDialog"'),"Systemdiagnose oder Prüfdetailansicht fehlt.");
  assert(html.indexOf('./js/quality-rules.js')<html.indexOf('./js/quality-assurance.js'),"Registry wird nicht vor dem Prüfadapter geladen.");
  assert(assurance.includes('qualityRules.evaluate')&&assurance.includes('centralReport'),"Qualitätssicherung delegiert nicht an die zentrale Registry.");
  for(const action of ['quality.setFilter','quality.openDetail','quality.confirmIssue','quality.markNotApplicable','quality.openPageIssues']) assert(bindings.includes(action),`UI-Aktion fehlt: ${action}`);
  assert(context.includes('"quality.confirmIssue"')&&context.includes('"quality.markNotApplicable"'),"Bestätigungsaktionen sind nicht in der zentralen Schreibsperre registriert.");
  assert(workflow.includes('reason:"open-plausibility"')&&!workflow.includes('Finalisiere nur, wenn du diese bewusst geprüft hast.'),"Offene Plausibilitäten werden beim Abschluss nicht strikt behandelt.");
  assert(documentData.includes('row.status === "Blockiert"')&&documentData.includes('row.status === "Zu prüfen"')&&documentData.includes('return data.readiness.level'),"Abnahmeprotokoll nutzt nicht ausschließlich das zentrale Statusmodell.");
  assert(qualityUi.includes('qualityRuleConfirmationsV2')||rulesSource.includes('qualityRuleConfirmationsV2'),"Fingerabdruckgebundene Bestätigungen fehlen.");
  assert(rulesSource.includes('zaehlerDaten.messperioden und waterMeters.readings')&&rulesSource.includes('reversedMeterFindings'),"NKP-PLAU-005 wertet die zentrale Messperiodenstruktur nicht aus.");
  const meterValidation=read("js/meter-validation.js");
  assert(meterValidation.includes('STARTUP_SAFE_VALIDATION_CODES')&&meterValidation.includes('METER_READING_REVERSED'),"Rückläufige Zählerstände sind beim Datenstart nicht als fachliche Auffälligkeit freigegeben.");
  assert(qualityUi.includes('renderContextualQualitySummaries')&&qualityUi.includes('renderSystemDiagnostics')&&qualityUi.includes('highlightQualityTarget'),"Fachseitenintegration, Systemdiagnose oder Direkteinstieg fehlt.");
  assert(css.includes('.quality-status-cards')&&css.includes('.quality-detail-dialog')&&css.includes('.context-quality-summary')&&css.includes('@media (max-width:620px)'),"AP20-Responsive-/Detailstile fehlen.");
  assert(!qualityUi.includes('const offeneMieter =')&&!qualityUi.includes('offeneKosten.forEach'),"Parallele Dashboard-Prüfberechnung wurde nicht entfernt.");

  process.stdout.write(`AP20-Strukturprüfung bestanden: ${registry.length} zentrale Regeln, ${api.GROUPS.length} Bereiche, 4 Kategorien, 6 Status sowie unveränderte Datenverträge.\n`);
}
try{main();}catch(error){process.stderr.write("FEHLER: "+error.message+"\n");process.exit(1);}
