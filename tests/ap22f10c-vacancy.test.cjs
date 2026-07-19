"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const calc=fs.readFileSync(path.join(root,"js/billing-calculation.js"),"utf8");
assert.match(calc,/AP22F10C: Auch vollständig leer stehende Wohnungen/);
assert.doesNotMatch(calc,/if \(!unitActive && !rows\.length\) return/);
assert.match(calc,/caseKey:\["vacancy", unitId, cursor, period\.end\]\.join\(":"\)/);
assert.match(calc,/Leerstand wird ausdrücklich nicht als künstlicher Mieter angelegt/);
console.log("AP22F10C Leerstandserfassung static: PASS");

const vm=require("node:vm");
const meterMasterSource=fs.readFileSync(path.join(root,"js/meter-master.js"),"utf8");
const context={globalThis:{}};
context.globalThis=context;
vm.runInNewContext(meterMasterSource,context,{filename:"meter-master.js"});
const sample={
  meta:{abrechnungsjahr:"2025",abrechnungsbeginn:"2025-01-01",abrechnungsende:"2025-12-31"},
  wohnungen:[{id:"W-LEER",bezeichnung:"Leerwohnung",status:"inaktiv"}],
  mieter:[],
  kostenarten:[{id:"K002",kostenart:"Wasser",inNK:"Ja"}],
  waterMeters:{readings:[]},
  zaehlerDaten:{zaehler:[],messwerte:[],messperioden:[]}
};
const meters=context.NKProMeterMaster.normalizeMeterMasters(sample);
assert.equal(meters.filter(row=>row.einheitId==="W-LEER"&&row.meterType==="cold-water").length,1);
assert.equal(meters.filter(row=>row.einheitId==="W-LEER"&&row.meterType==="hot-water").length,1);
console.log("AP22F10C Korrektur 1 Wasserzähler für Vollleerstand: PASS");
