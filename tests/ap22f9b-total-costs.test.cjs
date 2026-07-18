"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html");
const css=read("assets/app.css");
const costs=read("js/ui-costs.js");
const bindings=read("js/ui-bindings.js");
const runtime=read("js/app-runtime-config.js");
const serviceWorker=read("service-worker.js");
const serviceWorkerRegister=read("js/service-worker-register.js");
const manifest=JSON.parse(read("manifest.webmanifest"));
const project=JSON.parse(read("nk-pro-project.json"));
const packageJson=JSON.parse(read("package.json"));

function section(source,id,nextId){
  const start=source.indexOf(`<section class="tab`,source.indexOf(`id="${id}"`)-100);
  const end=source.indexOf(`<section class="tab`,source.indexOf(`id="${nextId}"`)-100);
  assert.ok(start>=0&&end>start,`Seitenbereich ${id} fehlt`);
  return source.slice(start,end);
}
const page=section(html,"einstellungen","mieter");
assert.match(page,/class="tab cost-mockup-page cost-view-standard" id="einstellungen"/);
assert.equal((page.match(/<article class="cost-summary-card/g)||[]).length,4,"Vier Kennzahlenkacheln erforderlich");
for(const id of ["costTileTotalValue","costTileActiveValue","costTileCompleteValue","costTileOpenValue"]){
  assert.match(page,new RegExp(`id="${id}"`),`Kachelwert ${id} fehlt`);
}
assert.equal((page.match(/class="cost-card nk-ui-card"/g)||[]).length,3,"Drei flache Arbeitsbereiche erforderlich");
assert.equal((page.match(/<details\b/g)||[]).length,0,"Gesamtkosten darf keine Klappbereiche enthalten");
assert.match(page,/data-ui-input="cost\.setSearch"[^>]*id="costTableSearch"/);
assert.match(page,/data-ui-action="cost\.clearSearch"/);
assert.doesNotMatch(page,/Alle Spalten sichtbar/);
assert.doesNotMatch(page,/>Filter</);
assert.doesNotMatch(page,/class="table-wrap cost-mockup-table-wrap/);
assert.doesNotMatch(page,/class="table-wrap cost-tenant-table-wrap/);
assert.match(page,/id="costTableTotal"/);
assert.match(page,/data-nk-ui-dialog-size="compact"[^>]*id="costPriceModal"/);
assert.match(page,/data-nk-ui-dialog-size="wide"[^>]*id="costSelectionModal"/);

for(const heading of ["Auswahl","Nr.","Kostenart","Gruppe","Gesamtkosten","Vorauszahlung?","Berechnungsart","Umlageschlüssel","Ausschluss-","Einheit /","Gesamt-","Preis je Einheit","Abrechnungs-","Bemerkung","Status"]){
  assert.ok(costs.includes(heading),`Spalte fehlt: ${heading}`);
}
assert.match(costs,/let costSearchQuery = "";/);
assert.match(costs,/function setCostSearch\(value\)/);
assert.match(costs,/function clearCostSearch\(\)/);
assert.match(costs,/NK_PRO_MODULES\.costActions\.kostenStatus\(k\)/);
assert.match(costs,/allActiveCosts\.reduce\(\(sum, item\) => sum \+ num\(item\.k\.gesamtbetrag\), 0\)/);
assert.match(costs,/complete \+ " von " \+ costs\.length/);
assert.match(costs,/openCosts\.length/);
assert.doesNotMatch(costs.slice(costs.indexOf("function renderCostMockupOverview"),costs.indexOf("function renderWohnungen")),/localStorage|commitStateChange\(/,"Kacheln/Suche dürfen nicht separat persistieren");
assert.match(bindings,/"cost\.setSearch":call\(handlers, "setCostSearch"\)/);
assert.match(bindings,/"cost\.clearSearch":call\(handlers, "clearCostSearch"\)/);

const scoped=css.slice(css.lastIndexOf("/* AP22F9B"));
assert.ok(scoped.length>1000,"AP22F9B-CSS-Block fehlt");
for(const line of scoped.split(/\r?\n/)){if(!line.includes("{")||line.startsWith("/*")||line.startsWith("@media"))continue;assert.ok(line.includes("#einstellungen"),`Nicht seitenbezogener AP22F9B-Selektor: ${line}`);}
assert.match(scoped,/#einstellungen \.cost-summary-grid\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
assert.match(scoped,/@media\(max-width:1100px\)\{#einstellungen \.cost-summary-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(scoped,/#einstellungen \.cost-mockup-table-wrap,#einstellungen \.cost-tenant-table-wrap\{[^}]*overflow-x:auto!important/);
assert.match(scoped,/#einstellungen \.cost-mockup-table\{[^}]*min-width:1900px!important/);
assert.match(scoped,/#einstellungen \.cost-table-footer\{[^}]*border-top:2px solid/);
assert.doesNotMatch(scoped,/background:\s*(?:#fff2cc|#e2f0d9|var\(--yellow\))/i);
assert.match(runtime,/const DATA_SCHEMA_VERSION = 5;/);
assert.match(runtime,/const APP_VERSION = "V99\.4\.44";/);
assert.match(runtime,/const APP_VERSION_NAME = "AP22F9B-Gesamtkosten";/);
assert.match(serviceWorker,/const CACHE_NAME = "nk-pro-v99-4-44-ap22f9b";/);
assert.match(serviceWorker,/const BUILD_ID = "99\.4\.44-ap22f9b";/);
assert.match(serviceWorkerRegister,/const BUILD_ID = "99\.4\.44-ap22f9b";/);
assert.equal(manifest.version,"99.4.44");
assert.equal(manifest.buildId,"99.4.44-ap22f9b");
assert.equal(project.schemaVersion,5);
assert.equal(project.appVersion,"99.4.44");
assert.equal(project.runtimeBuildId,"99.4.44-ap22f9b");
assert.equal(packageJson.version,"99.4.44");
assert.ok(packageJson.scripts["test:ap22f9b"],"AP22F9B-Testskript fehlt");
console.log("AP22F9B Gesamtkosten static: PASS");
