"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
function extractSection(source,id){
  const start=new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`,"i").exec(source); assert.ok(start,`section#${id} fehlt`);
  const tags=/<\/?section\b[^>]*>/ig; tags.lastIndex=start.index+start[0].length; let depth=1,match;
  while((match=tags.exec(source))){depth+=match[0][1]==="/"?-1:1;if(depth===0)return source.slice(start.index,tags.lastIndex);} throw new Error(`section#${id} unvollständig`);
}
function extractFunctionRange(source,startName,endName){const a=source.indexOf(`function ${startName}(`);const b=source.indexOf(`function ${endName}(`,a);assert.ok(a>=0&&b>a);return source.slice(a,b);}
const html=read("index.html"),controller=read("js/ui-page-controller.js"),css=read("assets/app.css"),reference=read("ui-reference/index.html"),referenceCss=read("ui-reference/reference.css");
const section=extractSection(html,"objekt");
assert.equal((html.match(/<section\b[^>]*\bid="objekt"/g)||[]).length,1,"#objekt ist nicht eindeutig");
assert.equal((section.match(/data-page-shell=/g)||[]).length,1,"Seitenschale fehlt oder ist doppelt");
assert.equal((section.match(/data-page-header=/g)||[]).length,1,"Seitenkopf fehlt oder ist doppelt");
assert.equal((section.match(/<h1\b/g)||[]).length,1,"Objektseite braucht genau ein h1");
assert.ok(section.includes('data-object-data-view=""'),"Render-Host fehlt");
for(const forbidden of ["data-page-save","Speichern","objectPreparationSection","objectValidationSection",'data-section-role="validation"',"<input","<select","<textarea"])assert.ok(!section.includes(forbidden),`Verbotene Alt-/Schreibstruktur: ${forbidden}`);
assert.ok(controller.includes('objekt:{title:"Objektdaten",kicker:"Objekt vorbereiten",firstSection:null,nextTab:"wohnungsverwaltung",renderContent:()=>renderObjectDataPage()}'),"Renderer ist nicht zentral angebunden");
const renderer=extractFunctionRange(controller,"objectDataText","objectOverviewModel");
assert.ok(renderer.includes("validateObjectStandard(state)"),"Bestehende Objektstandardprüfung wird nicht verwendet");
assert.ok(renderer.includes("state.objektStandard"),"Bestehende Objektstandarddaten werden nicht gelesen");
assert.ok(!/\bstate(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\])?\s*(?:=(?!=)|\+\+|--|\+=|-=|\*=|\/=)/.test(renderer),"Renderer mutiert state");
for(const forbidden of ["saveState","persist","migration","importData","exportData","applicationActions","masterDataActions","costActions","billingWorkflow","normalizeObjectStandard"])assert.ok(!renderer.includes(forbidden),`Verbotener Schreib-/Fachpfad im Renderer: ${forbidden}`);
for(const mapping of [
  ['UNIT_BUILDING_UNKNOWN','wohnungsverwaltung'],['UNIT_','wohnungsverwaltung'],['CONTRACT_','mieterverwaltung'],['PARTNER_','mieterverwaltung'],['METER_','wasser'],['ELECTRICITY_DUMMY_','wasser'],['sicherung','Systemdiagnose öffnen']
])assert.ok(renderer.includes(mapping[0])&&renderer.includes(mapping[1]),`Aktionsmatrix unvollständig: ${mapping.join(" -> ")}`);
for(const term of ["Kostenarten","Umlageschlüssel","Vorauszahlungen","Abrechnungsprüfung","Gesamtkosten"])assert.ok(!section.includes(term)&&!renderer.includes(term),`Fachfremder Begriff auf objekt: ${term}`);
assert.ok(css.includes("/* V99.4.38 – AP22F3B")&&css.includes("var(--nk-ui-")&&css.includes(".object-data-main-grid"),"AP22F3B-CSS fehlt");
const cssBlock=css.slice(css.indexOf("/* V99.4.38 – AP22F3B"));
assert.ok(!/#[0-9a-f]{3,8}\b/i.test(cssBlock),"Lokale Farbwerte statt zentraler Tokens");
assert.ok(!/style\s*=/.test(section),"Inline-Stile in der Objektseite");
assert.ok(reference.includes('id="object-data"')&&reference.includes("Keine Aktion erforderlich")&&referenceCss.includes("AP22F3B"),"UI-Referenz fehlt");
assert.ok(html.includes('<strong data-app-version="">V99.4.38</strong>')&&read("js/app-runtime-config.js").includes('const APP_VERSION = "V99.4.38";'),"Releaseversion inkonsistent");
console.log("AP22F3B object data static test: PASS");
