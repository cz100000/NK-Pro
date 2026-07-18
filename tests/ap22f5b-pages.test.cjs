"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const sha=file=>crypto.createHash("sha256").update(fs.readFileSync(path.join(root,file))).digest("hex");
function extractSection(source,id){
  const start=new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`,"i").exec(source);assert.ok(start,`section#${id} fehlt`);
  const tags=/<\/?section\b[^>]*>/ig;tags.lastIndex=start.index+start[0].length;let depth=1,match;
  while((match=tags.exec(source))){depth+=match[0][1]==="/"?-1:1;if(depth===0)return source.slice(start.index,tags.lastIndex);}throw new Error(`section#${id} unvollständig`);
}
function extractFunction(source,name,next){const a=source.indexOf(`function ${name}(`);assert.ok(a>=0,`${name} fehlt`);const b=next?source.indexOf(`function ${next}(`,a):source.length;assert.ok(b>a);return source.slice(a,b);}
const html=read("index.html");
const rendererSource=read("js/ui-navigation-pages.js");
const controller=read("js/ui-page-controller.js");
const css=read("assets/app.css");
const reference=read("ui-reference/index.html");
const referenceCss=read("ui-reference/reference.css");

const meter=extractSection(html,"wasser");
assert.equal((meter.match(/class="meter-inventory-card /g)||[]).length,5,"genau fünf Zählerkarten erforderlich");
for(const type of ["water","heat","hkv","gas","electric"])assert.ok(meter.includes(`meter-inventory-card--${type}`),`Zählerkarte ${type} fehlt`);
assert.equal((meter.match(/<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"/g)||[]).length>=7,true,"zentrale Linienicon-Ausführung fehlt");
assert.ok(meter.includes('id="meterInventorySearch"')&&meter.includes('id="meterInventoryTypeFilter"')&&meter.includes('id="meterInventoryReset"'),"DUMMY-Suche/Filter fehlen");
assert.ok(meter.includes('id="meterInventoryDummyTable"'),"DUMMY-Tabelle fehlt");
assert.ok(meter.includes("Diese Seite enthält ausschließlich fiktive Beispieldaten"),"DUMMY-Kennzeichnung fehlt");
assert.ok(meter.includes("Es findet keine Speicherung statt"),"Speicherausschluss fehlt");
assert.equal((meter.match(/data-ui-action=/g)||[]).length,0,"DUMMY-Seite darf keine produktiven Aktionen erhalten");
for(const forbidden of ["Speichern","Neu anlegen","Bearbeiten","Löschen"])assert.ok(!meter.includes(forbidden),`produktive DUMMY-Aktion verblieben: ${forbidden}`);

const tenant=extractSection(html,"mieterverwaltung");
assert.ok(tenant.includes(">Mietverhältnisse</h1>"),"Seitentitel Mietverhältnisse fehlt");
assert.equal((tenant.match(/tenant-summary-card /g)||[]).length,4,"vier Kennzahlenkarten erforderlich");
for(const key of ["total","active","ended","archived"])assert.ok(tenant.includes(`data-tenant-summary-${key}`),`Kennzahl ${key} fehlt`);
for(const id of ["tenantManagementSearch","tenantManagementUnitFilter","tenantManagementStatusFilter","tenantManagementReset","startTenantTable","startTenantArchiveTable"])assert.ok(tenant.includes(`id="${id}"`),`${id} fehlt`);
assert.ok(tenant.includes('data-ui-action="object.addMasterTenancy"'),"bestehende Neuanlage fehlt");
assert.ok(!tenant.includes("masterTenantValidationSection")&&!tenant.includes("validation-placeholder"),"alter leerer Prüfplatzhalter verblieben");
assert.ok(tenant.includes("data-tenant-readonly-notice")&&tenant.includes("data-tenant-editability-note"),"Schreibschutzdarstellung fehlt");

const tenantRenderer=extractFunction(rendererSource,"renderStartTenantManagement","renderMeterInventoryDummyPage");
assert.equal((tenantRenderer.match(/setMasterNested\('mieter'/g)||[]).length,12,"alle zwölf vorhandenen Felder müssen erhalten bleiben");
for(const field of ["wohnung","name","einzug","auszug","abrechnungRolle","geschlecht","standardanrede","strasse","plz","ort","telefon","email"])assert.ok(tenantRenderer.includes(`'${field}'`),`bestehendes Feld fehlt: ${field}`);
assert.ok(tenantRenderer.includes('object.archiveMasterTenancy')&&tenantRenderer.includes('object.restoreMasterTenancy'),"Archivierungswege fehlen");
assert.ok(tenantRenderer.includes("billingContext.isReadOnly()")&&tenantRenderer.includes("tenant-management-readonly-notice")&&tenantRenderer.includes("billing.switchToEdit"),"bestehender Nur-Ansehen-Modus ist nicht abgebildet");
assert.ok(tenantRenderer.includes("masterVisibleTenantRows")&&tenantRenderer.includes("masterArchivedTenantRows")&&tenantRenderer.includes("tenantOpenStatus"),"Kennzahlen/Filter nutzen nicht den vorhandenen Bestand");
for(const forbidden of ["saveState(","localStorage","migration","kostenarten","vorauszahlungen","zaehlerDaten"])assert.ok(!tenantRenderer.toLowerCase().includes(forbidden.toLowerCase()),`unerlaubter Fach-/Persistenzbezug: ${forbidden}`);
const meterRenderer=extractFunction(rendererSource,"renderMeterInventoryDummyPage","renderStartUnitManagement");
assert.ok(meterRenderer.includes("row.hidden")&&meterRenderer.includes("dataset.meterType"),"DUMMY-Filter ist nicht rein visuell");
for(const forbidden of ["state.","commitStateChange","saveState","localStorage","setMasterNested"])assert.ok(!meterRenderer.includes(forbidden),`DUMMY-Renderer mutiert Daten: ${forbidden}`);

assert.ok(controller.includes('mieterverwaltung:{title:"Mietverhältnisse",kicker:"Objekt vorbereiten",firstSection:null,nextTab:"wohnungsverwaltung",disableSaveInReadOnly:true'),"Seitenkonfiguration oder Schreibschutz Mietverhältnisse fehlt");
assert.ok(controller.includes('wasser:{title:"Zähler",kicker:"Objekt vorbereiten",firstSection:null')&&controller.includes('renderContent:()=>renderMeterInventoryDummyPage()'),"Zähler-Renderer nicht eingebunden");
assert.ok(css.includes("/* AP22F5B – UI-Migration Zähler-DUMMY und Mietverhältnisse */"),"AP22F5B-CSS fehlt");
assert.ok(/#wasser #meterInventoryDummyTable\{width:100%!important;min-width:880px!important/.test(css),"Zählertabelle füllt die Karte nicht");
assert.ok(/#mieterverwaltung \.tenant-management-table\{width:100%!important;min-width:1580px!important/.test(css),"Mietverhältnistabelle besitzt keinen internen Breitenvertrag");
assert.ok(css.includes("overflow-x:auto")&&css.includes("tenant-management-table-wrap")&&css.includes("meter-inventory-table-wrap"),"interner Tabellenlauf fehlt");
assert.ok(css.includes("position:static")&&css.includes("meter-inventory-system-note")&&css.includes("tenant-management-system-note"),"Hinweise sind nicht im Dokumentfluss abgesichert");
for(const token of ["--nk-ui-color-meter-water","--nk-ui-color-meter-heat","--nk-ui-color-meter-hkv","--nk-ui-color-meter-gas","--nk-ui-color-meter-electric"])assert.ok(css.includes(token),`zentraler Zählerfarbtoken fehlt: ${token}`);
const ap22f5Css=css.slice(css.indexOf("/* AP22F5B – UI-Migration Zähler-DUMMY und Mietverhältnisse */"));
assert.ok(!/#[0-9a-f]{3,8}\b/i.test(ap22f5Css),"AP22F5B verwendet lokale Farbwerte statt zentraler Tokens");

assert.ok(reference.includes('id="meters-page"')&&reference.includes('id="tenancies-page"'),"aktualisierte UI-Referenz fehlt");
assert.ok(reference.includes("AP22F5B · verbindliche Zielkomponente"),"AP22F5B-Referenzkennzeichnung fehlt");
assert.ok(referenceCss.includes("AP22F5B – verbindliche Referenzen für Zähler-DUMMY und Mietverhältnisse"),"AP22F5B-Referenz-CSS fehlt");
assert.ok(html.includes('<strong data-app-version="">V99.4.40</strong>'),"statische Releasekennung fehlt");
assert.ok(read("js/app-runtime-config.js").includes('const APP_VERSION = "V99.4.40";'),"zentrale Releasekennung fehlt");
assert.equal(JSON.parse(read("manifest.webmanifest")).version,"99.4.40");
const project=JSON.parse(read("nk-pro-project.json"));
assert.equal(project.meterInventoryDummyVersion,2);assert.equal(project.tenantManagementMigrationVersion,1);

const protectedHashes=JSON.parse(read("AP22F5B_PROTECTED_HASHES.json"));
for(const [file,expected] of Object.entries(protectedHashes))assert.equal(sha(file),expected,`geschützte Datei verändert: ${file}`);
console.log(`AP22F5B static test: PASS (${Object.keys(protectedHashes).length} Schutz-Hashes)`);
