"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
const read=rel=>fs.readFileSync(path.join(root,rel),"utf8");
const html=read("index.html");
const css=read("assets/app.css");
const qualityCore=read("js/quality-rules.js");
const qualityK4=read("js/quality-system-k4.js");
const uiK4=read("js/ui-quality-k4.js");
const bindings=read("js/ui-bindings.js");
const navigation=read("js/navigation.js");
const billingReview=read("js/billing-review.js");
const workflow=read("js/billing-workflow.js");
const documentData=read("js/document-data.js");
const runtime=read("js/app-runtime-config.js");
const serviceWorker=read("service-worker.js");
const pkg=JSON.parse(read("package.json"));
const project=JSON.parse(read("nk-pro-project.json"));
const manifest=JSON.parse(read("manifest.webmanifest"));

assert.strictEqual(pkg.version,"99.4.66");
assert.strictEqual(project.appVersion,"99.4.66");
assert.strictEqual(project.schemaVersion,5,"Datenschema muss 5 bleiben");
assert.strictEqual(project.basedOn,"99.4.65-AP22F11B-Korrektur4");
assert.match(manifest.name,/V99\.4\.66/);
assert.strictEqual(manifest.buildId,"99.4.66-wohnflaechen");
assert.match(runtime,/APP_VERSION\s*=\s*"V99\.4\.66"/);
assert.match(serviceWorker,/99\.4\.66-wohnflaechen/);
assert.match(serviceWorker,/quality-system-k4\.js/);
assert.match(serviceWorker,/ui-quality-k4\.js/);

assert.match(qualityCore,/BLOCKED:"Kritischer Abrechnungsmangel"/);
assert.match(qualityCore,/REVIEW:"Entscheidung erforderlich"/);
assert.match(qualityCore,/DONE:"Bestanden"/);
assert.match(qualityK4,/NOT_APPLICABLE:"Nicht anwendbar"/);
assert.match(qualityK4,/NOT_EXECUTED:"Noch nicht ausgeführt"/);
assert.match(qualityK4,/criticalSubtype/);
assert.match(qualityK4,/Berechnung nicht möglich/);
assert.match(qualityK4,/Abrechnung unvollständig/);

assert.match(qualityK4,/navigationDefinition\(\)/,"Sortierung muss aus zentraler Navigation stammen");
assert.match(qualityK4,/global\.NKProNavigation\.navigationDefinition/);
assert.ok(!qualityK4.includes("const PAGE_ORDER"),"keine parallele manuelle Seitenreihenfolge");
assert.match(navigation,/"tab": "qualitaet"[\s\S]*"label": "Prüfen und abschließen"/);
assert.match(navigation,/"key": "analysis"[\s\S]*"tab": "regelinventar"/);

["qualityStatusCards","qualityResultsTable","qualityCompletionCard","qualityResultCount","ruleInventoryKpis","ruleInventorySearch","ruleInventoryAreaFilter","ruleInventoryPageFilter","ruleInventoryTypeFilter","ruleInventoryAcceptanceFilter","qualityRuleRegistryTable","ruleInventoryResultCount"]
  .forEach(id=>assert.match(html,new RegExp(`id="${id}"`),`missing ${id}`));
["Prüfung","Konkretes aktuelles Ergebnis","Status","Vorhandene Entscheidung","Konsequenz","Aktionen"]
  .forEach(label=>assert.ok(html.includes(label)||uiK4.includes(label),`missing quality column ${label}`));
["Kritische Mängel","Entscheidung erforderlich","Hinweise","Bestanden"]
  .forEach(label=>assert.ok(uiK4.includes(label),`missing KPI ${label}`));
assert.match(html,/data-quality-k4-filter="notApplicable"/);
assert.match(html,/data-quality-k4-filter="notExecuted"/);

["actualCheckLocation","executionTrigger","purpose","dataSource","logic","formula","tolerance","rounding","signLogic","specialCases","possibleResults","consequences","completionEffect","allowedActions","acceptanceAllowed","correctionTarget"]
  .forEach(field=>assert.ok(qualityK4.includes(field),`Inventarfeld fehlt: ${field}`));
assert.match(qualityK4,/const METER_RULES/);
assert.match(qualityK4,/inventoryOnly:true/);
assert.match(qualityK4,/productive:true/);
assert.match(qualityK4,/legacy\.REGISTRY\.filter\(rule => rule\.category !== CATEGORY\.TECHNICAL\)/);

assert.match(qualityK4,/abrechnungsPruefungen/);
assert.match(qualityK4,/decisionSource:"billing-review"/);
assert.match(qualityK4,/DIFFERENCE_RULE_MAP/);
assert.match(qualityK4,/dataSignature/);
assert.match(qualityK4,/calculationSignature/);
assert.match(uiK4,/billingReview\.openAccept/);
assert.match(uiK4,/billingReview\.openDetail/);
assert.match(uiK4,/billingReview\.markCorrection/);
assert.match(uiK4,/Ein kritischer Abrechnungsmangel kann nicht akzeptiert werden/);
assert.match(uiK4,/mindestens 5 Zeichen/);
assert.match(billingReview,/dataSignature/);
assert.match(billingReview,/calculationSignature/);

assert.match(workflow,/kritische Abrechnungsmängel/);
assert.match(documentData,/Kritischer Abrechnungsmangel/);
assert.match(documentData,/Entscheidung erforderlich/);
assert.match(bindings,/quality\.resetRegistry/);

assert.match(css,/quality-k4-kpi/);
assert.match(css,/rule-k4-kpi/);
assert.doesNotMatch(css,/quality-k4-kpi[^}]*gradient/i);
assert.match(css,/quality-k4-kpi[^}]*background:\s*(?:var\([^)]*\)|#fff|white)/i);
assert.match(css,/quality-results-table-wrap/);
assert.match(css,/@media \(max-width:\s*980px\)/);
assert.match(css,/font-variant-numeric:\s*tabular-nums/);

const activeQualityVocabulary=[qualityCore,qualityK4,uiK4,workflow,documentData].join("\n");
assert.doesNotMatch(activeQualityVocabulary,/Blockierender Fehler|Blockierende Fehler|blockierender Fehler|blockierende Fehler/);

console.log("AP22F11B Korrektur 4 static checks passed");
