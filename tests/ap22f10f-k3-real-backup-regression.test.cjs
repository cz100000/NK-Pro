const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname,'..');
const backupPath = process.env.NKPRO_REAL_BACKUP || '/mnt/data/nk-pro-gesamtbestand-2025-V99.4.55-2026-07-19-13-20-22.json';
const data = JSON.parse(fs.readFileSync(backupPath,'utf8'));
const context = {
  console,
  globalThis:null,
  state:data,
  COST_EXCLUSION_FULL:'Vollständig umlegen', COST_EXCLUSION_OWNER:'Eigentümer', UMLAGE_MANUAL_LEGACY:'Manuell', UMLAGE_MANUAL:'Manuell',
  tenantRelevantForCurrentBilling:()=>true,
  visibleTenantRows:()=>data.mieter,
  num:v=>Number.isFinite(Number(v))?Number(v):0,
  NKProCostActions:{normalizeCostSettings:()=>{}},
};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'js/billing-calculation.js'),'utf8'),context,{filename:'billing-calculation.js'});
const rows = context.NKProBillingCalculation.waterMeterRows(data);
const expected = new Map([
 ['Z-WASSER-KW-W001.EG-L',266],['Z-WASSER-WW-W001.EG-L',108],
 ['Z-WASSER-KW-W002.EG-R',117],['Z-WASSER-WW-W002.EG-R',28],
 ['Z-WASSER-KW-W003.1OG-L',168],['Z-WASSER-WW-W003.1OG-L',59],
 ['Z-WASSER-KW-W004.1OG-R',195],['Z-WASSER-WW-W004.1OG-R',241],
 ['Z-WASSER-KW-W000.UG',490],['Z-WASSER-WW-W000.UG',280]
]);
for (const [meterId,value] of expected) {
  const row=rows.find(r=>r.meterId===meterId);
  assert.ok(row,`row missing: ${meterId}`);
  assert.strictEqual(Number(row.startValue),value,`wrong start for ${meterId}`);
}
assert.strictEqual(rows.find(r=>r.meterId==='Z-WASSER-KW-W001.EG-L').status,'open');
assert.strictEqual(rows.find(r=>r.meterId==='Z-WASSER-KW-W000.UG').endValue,564);
assert.strictEqual(rows.find(r=>r.meterId==='Z-WASSER-KW-W000.UG').consumption,74);
console.log('AP22F10F K3 real backup regression: PASS');
