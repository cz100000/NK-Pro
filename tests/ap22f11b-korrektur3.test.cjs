"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
const read=rel=>fs.readFileSync(path.join(root,rel),"utf8");
const html=read("index.html");
const css=read("assets/app.css");
const nav=read("js/navigation.js");
const controller=read("js/ui-page-controller.js");
const bindings=read("js/ui-bindings.js");
const quality=read("js/ui-quality.js");
const runtime=read("js/app-runtime-config.js");
const billingContext=read("js/billing-context.js");
const pkg=JSON.parse(read("package.json"));
const project=JSON.parse(read("nk-pro-project.json"));
const manifest=JSON.parse(read("manifest.webmanifest"));

assert.strictEqual(pkg.version,"99.4.64");
assert.strictEqual(project.appVersion,"99.4.64");
assert.strictEqual(project.schemaVersion,5);
assert.match(manifest.name,/V99\.4\.64/);
assert.strictEqual(manifest.buildId,"99.4.64-ap22f11b-k3");
assert.match(runtime,/APP_VERSION\s*=\s*"V99\.4\.64"/);
assert.match(runtime,/AP22F11B-Korrektur3-Pruefen-Abschliessen-Regelinventar/);

assert.match(nav,/"tab": "qualitaet"[\s\S]*"label": "Prüfen und abschließen"/);
assert.match(nav,/"key": "analysis"[\s\S]*"tab": "auswertungen"[\s\S]*"tab": "regelinventar"/);
assert.ok(nav.indexOf('"tab": "regelinventar"')<nav.indexOf('"key": "archive"'),"Regelinventar steht vor Archiv");
assert.match(controller,/qualitaet:\{title:"Prüfen und abschließen"/);
assert.match(controller,/regelinventar:\{title:"Regelinventar",kicker:"Analyse"/);
assert.match(billingContext,/"regelinventar"/);

["qualityStatusCards","qualityOpenTasksTable","qualityAcknowledgedTable","qualityCompletionCard","qualityLastRunNote","ruleInventoryKpis","ruleInventorySearch","ruleInventoryGroupFilter","ruleInventoryStatusFilter","qualityRuleRegistryTable","ruleInventoryResultCount"]
  .forEach(id=>assert.match(html,new RegExp(`id="${id}"`),`missing ${id}`));

const sectionById=id=>{
  const start=html.search(new RegExp(`<section[^>]*id="${id}"[^>]*>`));
  assert.ok(start>=0,`missing section ${id}`);
  const next=html.indexOf('<section class="tab',start+10);
  return html.slice(start,next<0?html.length:next);
};
const qualitySection=sectionById("qualitaet");
const ruleSection=sectionById("regelinventar");
assert.ok(!qualitySection.includes('id="qualityRuleRegistryTable"'),"Regelinventar darf nicht auf der Abschlussseite stehen");
assert.ok(ruleSection.includes('id="qualityRuleRegistryTable"'),"Regelinventar muss unter Analyse stehen");

assert.match(bindings,/quality\.toggleOpenOnly/);
assert.match(bindings,/quality\.toggleCompleted/);
assert.match(bindings,/quality\.filterRegistry/);
assert.match(quality,/function renderQualityStatusCards/);
assert.match(quality,/function renderQualityCompletionCard/);
assert.match(quality,/function renderRuleInventory/);
assert.match(quality,/function filterQualityRegistry/);
assert.match(html,/Die Bearbeitung erfolgt stets auf der verursachenden Seite|verursachenden Seite/);
assert.match(quality,/billing\.finalize/);

assert.match(css,/quality-finalization-kpis/);
assert.match(css,/quality-finalization-lower-grid/);
assert.match(css,/rule-inventory-toolbar/);
assert.match(css,/quality-completion-action\.nk-ui-button:disabled/);
assert.match(css,/table#qualityOpenTasksTable\.nk-ui-table thead th/);
assert.match(css,/@media \(max-width:760px\)[\s\S]*quality-finalization-table/);

console.log("AP22F11B Korrektur 3 static checks passed");
