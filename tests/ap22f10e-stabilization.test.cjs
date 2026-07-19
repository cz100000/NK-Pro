"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Date, JSON, Math, Number, String, Array, Object, Set, Map, globalThis:null });
context.globalThis = context;
for (const file of ["meter-master.js", "meter-readings.js", "meter-periods.js", "meter-validation.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "js", file), "utf8"), context, { filename:file });
}
const master=context.NKProMeterMaster, readings=context.NKProMeterReadings, periods=context.NKProMeterPeriods, validation=context.NKProMeterValidation;
const options={ clone:v=>JSON.parse(JSON.stringify(v)), now:()=>"2026-07-19T12:00:00.000Z", appVersion:"V99.4.51", master, readings, periods };
const data={
  meta:{dataSchemaVersion:5,abrechnungsjahr:"2025",abrechnungsbeginn:"2025-01-01",abrechnungsende:"2025-12-31"},
  wohnungen:[{id:"W1",bezeichnung:"Wohnung 1",status:"aktiv"}], mieter:[], kostenarten:[],
  objektStandard:{version:1,objekt:{id:"O1"},gebaeude:[],einheiten:[{einheitId:"W1"}],partner:[],vertraege:[],zaehler:[]},
  zaehlerDaten:{version:1,meteringDataVersion:1,zaehler:[{meterId:"Z1",id:"Z1",meterType:"cold-water",bezeichnung:"Kaltwasser",einheit:"m³",status:"active",einheitId:"",abrechnungsrelevant:true}],messwerte:[
    {messwertId:"A",zaehlerId:"Z1",ablesedatum:"2025-01-01",wert:10,status:"valid"},
    {messwertId:"E",zaehlerId:"Z1",ablesedatum:"2025-12-31",wert:20,status:"valid"}
  ],messperioden:[],zuordnungen:[],zaehlerwechsel:[]}
};
const result=validation.migrateMeteringData(data, options);
assert.notEqual(result.status,"failed","fehlende Zuordnung darf den App-Start nicht blockieren");
const broken=JSON.parse(JSON.stringify(result.data));
broken.zaehlerDaten.messperioden=[{messperiodeId:"P1",zaehlerId:"Z1",beginn:"2025-01-01",ende:"2025-12-31",verbrauch:10,abrechnungsrelevant:true,zuordnungsanteile:[]}];
const finding=validation.validateMeteringData(broken,{...options,billingReadiness:false});
assert.ok(finding.errors.some(x=>x.code==="MEASUREMENT_PERIOD_ASSIGNMENT_MISSING"),"Befund bleibt diagnostizierbar");
const validationSource=fs.readFileSync(path.join(root,"js/meter-validation.js"),"utf8");
assert.ok(validationSource.includes('"MEASUREMENT_PERIOD_ASSIGNMENT_MISSING"'),"Zuordnungsbefund ist als startverträglich klassifiziert");
const ui=fs.readFileSync(path.join(root,"js/ui-navigation-pages.js"),"utf8");
for (const expected of [
  'billingOverviewActionButton("Abrechnung bearbeiten", "edit", "billing.openCurrentEdit")',
  'billingOverviewActionButton("Abrechnungszeitraum ändern", "calendar", "billing.openPeriodEditor")',
  'billingOverviewActionButton("Abrechnung ansehen", "view", "billing.openCurrentView")',
  'billingOverviewActionButton("Abschließen", "finalize", "billing.finalize")',
  'billingOverviewActionButton("Archivieren", "archive", "archive.currentYear")',
  'billingOverviewActionButton("Abrechnung löschen", "delete", "billing.openDeleteModal"',
  'billingOverviewActionButton("Korrektur der archivierten Abrechnung starten", "refresh", "archive.reopenForRework"'
]) assert.ok(ui.includes(expected), expected);
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert.ok(html.includes('content="99.4.51-ap22f10e" name="nk-pro-build"'));
assert.ok(html.includes('<strong data-app-version="">V99.4.51</strong>'));
assert.ok(!html.includes('v=99.4.41-ap22f6b-k1'));
console.log("AP22F10E Stabilisierung: PASS");
