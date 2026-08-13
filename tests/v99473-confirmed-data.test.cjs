const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
function loadSeed(){
  const ctx = {globalThis:{}}; ctx.globalThis = ctx; vm.createContext(ctx);
  const src = fs.readFileSync(path.join(ROOT,'js/default-seed.js'),'utf8') + '\n;globalThis.__SEED=SEED;';
  vm.runInContext(src,ctx,{filename:'default-seed.js'});
  return JSON.parse(JSON.stringify(ctx.__SEED));
}
function loadMigration(){
  const ctx={globalThis:{}}; ctx.globalThis=ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'js/v99473-confirmed-2025-data.js'),'utf8'),ctx,{filename:'v99473-confirmed-2025-data.js'});
  return ctx.NKProConfirmed2025Data;
}
function cost(data,id){ return data.kostenarten.find(x=>x.id===id); }

const seed = loadSeed();
const migration = loadMigration();
assert.strictEqual(seed.meta.abrechnungsjahr,'2025');
assert(seed.meta.standardMigrations.some(m=>m.id===migration.MIGRATION_ID),'default seed contains V99.4.73 migration marker');

// Waterworks / waste confirmed values.
assert.strictEqual(cost(seed,'K002').gesamtbetrag,1642.31);
assert.strictEqual(cost(seed,'K002').gesamtverbrauch,275);
assert.strictEqual(cost(seed,'K002').preisProEinheit,5.972);
assert.strictEqual(seed.waterMeters.settings.houseMeterStart,911);
assert.strictEqual(seed.waterMeters.settings.houseMeterEnd,1186);
assert.strictEqual(seed.waterMeters.settings.houseWaterTotal,275);
assert.strictEqual(seed.waterMeterHistory.houseConnection.zaehlernummer,'22-32-74-51');
assert.strictEqual(seed.waterMeterHistory.houseConnection.jahresgebuehren2025,1642.31);
assert.strictEqual(cost(seed,'K009').gesamtbetrag,1503);

const expectedWater={
  'W000.UG':[564.40,312.42], 'W001.EG-L':[297.74,119.28], 'W002.EG-R':[128.06,29.66],
  'W003.1OG-L':[178.34,63.32], 'W004.1OG-R':[231.28,282.68], 'W005.DG-L':[123.55,143.58], 'W006.DG-R':[137.01,110.99]
};
for(const [unit,[kw,ww]] of Object.entries(expectedWater)){
  const row=seed.waterMeterHistory.units.find(x=>x.wohnung===unit).readings.find(x=>Number(x.jahr)===2025);
  assert(row,`2025 water history exists for ${unit}`);
  assert.strictEqual(row.kw,kw); assert.strictEqual(row.ww,ww); assert.strictEqual(row.datum,'2025-12-30');
}

// Techem totals, participant/vacancy allocation, owner-only common line and CO2 evidence.
const k006=cost(seed,'K006'), input=seed.umlageInputs.K006;
assert.strictEqual(k006.gesamtbetrag,9965.97);
assert.strictEqual(input.mode,'Externe Einzelabrechnung');
assert.strictEqual(input.externalBilling.totalCost,9965.97);
assert.strictEqual(input.externalBilling.heatingCost,8106.24);
assert.strictEqual(input.externalBilling.warmWaterCost,1859.73);
assert.strictEqual(input.externalBilling.hkvUnits,43957);
assert.strictEqual(input.externalBilling.includedOwnerShare,3.88);
assert.strictEqual(input.externalBilling.co2OwnerShare,356.49);
const caseSum=Object.values(input.caseValues).filter(x=>x && x.source==='Techem Gesamtabrechnung 2025').reduce((s,x)=>s+Number(x.amount||0),0);
assert(Math.abs(caseSum-9962.09)<0.001,`case sum ${caseSum}`);
assert(Math.abs(caseSum+input.externalBilling.includedOwnerShare-k006.gesamtbetrag)<0.001,'Techem total reconciles only after 3.88 owner common position');
assert.strictEqual(input.caseValues['tenant:M001:W001.EG-L:2025-01-01:2025-12-31'].amount,2252.81);
assert.strictEqual(input.caseValues['private:M000:W000.UG:2025-01-01:2025-12-31'].amount,2732.43);
assert.strictEqual(input.caseValues['vacancy:W005.DG-L:2025-01-01:2025-12-31'].amount,575.49);
assert.strictEqual(input.caseValues['vacancy:W006.DG-R:2025-01-01:2025-12-31'].amount,488.08);


// The confirmed 3.88 EUR common Techem position is a documented owner share, separate from vacancy.
const billingCalcSrc=fs.readFileSync(path.join(ROOT,'js/billing-calculation.js'),'utf8');
assert(billingCalcSrc.includes('externalOwnerShare'));
assert(billingCalcSrc.includes('documentedOwnerShare:vacancyShare + externalOwnerShare'));
const analyticsSrc=fs.readFileSync(path.join(ROOT,'js/analytics-engine.js'),'utf8');
assert(analyticsSrc.includes('ownerShare-documentedOwnerShare'));
const allocationUi=fs.readFileSync(path.join(ROOT,'js/ui-billing-allocation.js'),'utf8');
assert(allocationUi.includes('LANDLORD-EXTERNAL-'));
assert(allocationUi.includes('manualCostSummary(state,k.id)'));

// Techem external prepayment is evidence only; actual NK-Pro prepayments remain untouched by migration.
const fresh=loadSeed();
fresh.meta.standardMigrations=fresh.meta.standardMigrations.filter(m=>m.id!==migration.MIGRATION_ID);
fresh.vorauszahlungen=[{kostenId:'K006',summe:999,werte:[111,222]}];
const before=JSON.stringify(fresh.vorauszahlungen);
const r=migration.apply(fresh,{force:true});
assert.strictEqual(r.changed,true);
assert.strictEqual(JSON.stringify(fresh.vorauszahlungen),before,'Vorauszahlungen may not be overwritten by Techem evidence');

// Idempotency.
const afterFirst=JSON.stringify(fresh);
const second=migration.apply(fresh);
assert.strictEqual(second.changed,false); assert.strictEqual(second.reason,'already-applied');
assert.strictEqual(JSON.stringify(fresh),afterFirst);

// Archive / non-2025 protection.
const archive=loadSeed(); archive.meta.archiveViewer=true; archive.meta.standardMigrations=archive.meta.standardMigrations.filter(m=>m.id!==migration.MIGRATION_ID);
const archiveBefore=JSON.stringify(archive);
{ const x=migration.apply(archive,{force:true}); assert.strictEqual(x.changed,false); assert.strictEqual(x.reason,'not-2025-working-state'); }
assert.strictEqual(JSON.stringify(archive),archiveBefore);
const old=loadSeed(); old.meta.abrechnungsjahr='2024'; old.meta.standardMigrations=old.meta.standardMigrations.filter(m=>m.id!==migration.MIGRATION_ID);
{ const x=migration.apply(old,{force:true}); assert.strictEqual(x.changed,false); assert.strictEqual(x.reason,'not-2025-working-state'); }

// Legacy value array follows actual tenant IDs, not fixed positions.
const shuffled=loadSeed(); shuffled.meta.standardMigrations=shuffled.meta.standardMigrations.filter(m=>m.id!==migration.MIGRATION_ID);
shuffled.mieter=[...shuffled.mieter].sort((a,b)=>String(b.id).localeCompare(String(a.id)));
shuffled.umlageInputs.K006={kostenId:'K006',kostenart:'Heiz- und Warmwasserkosten',values:[],caseValues:{}};
migration.apply(shuffled,{force:true});
for(const tenant of shuffled.mieter){
  const ix=shuffled.mieter.indexOf(tenant);
  const expected={M001:2252.81,M002:962.56,M003:1651,M004:1299.72,M000:2732.43}[tenant.id];
  if(expected!==undefined) assert.strictEqual(shuffled.umlageInputs.K006.values[ix],expected,`legacy array index for ${tenant.id}`);
}

// Manual field UI and service worker must include the new structure/module.
const ui=fs.readFileSync(path.join(ROOT,'js/ui-individual-values.js'),'utf8');
for(const field of ['externalUserId','hkvUnits','includedOwnerShare']) assert(ui.includes(field),`UI logic field ${field}`);
const index=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
for(const field of ['externalUserId','heatingCost','heatingBaseCost','heatingConsumptionCost','warmWaterCost','hkvUnits','co2TenantShare','co2OwnerShare','externalPrepayment']) assert(index.includes('data-individual-external-case-field=\"'+field+'\"') || index.includes('data-individual-external-case-field="'+field+'"'),`dialog field ${field}`);
assert(index.includes('v99473-confirmed-2025-data.js'));
const sw=fs.readFileSync(path.join(ROOT,'service-worker.js'),'utf8');
assert(sw.includes('./js/v99473-confirmed-2025-data.js'));

console.log('V99.4.73 confirmed 2025 data tests passed.');
