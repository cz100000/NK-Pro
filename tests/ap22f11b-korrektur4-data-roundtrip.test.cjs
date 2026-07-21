"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "nk-pro-gesamtbestand-2025-V99.4.66-2026-07-21-Wohnflaechen-korrigiert.json");
const OUTPUT_DIR = "/mnt/data/AP22F11B_K4_Ergebnis";
const OUTPUT = path.join(OUTPUT_DIR, "nk-pro-gesamtbestand-2025-V99.4.66-AP22F11B-Korrektur4-getestet.json");
const ORIGIN = "http://nkpro-v99-4-66-roundtrip.test";
const source = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const EXPECTED_METER_VALUES = source.zaehlerDaten.messwerte.length;
const hash = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const meteringSnapshot = value => {
  const data = value && typeof value === "object" ? value : {};
  const { updatedAt, updatedWithAppVersion, ...business } = data;
  return business;
};
const protectedSnapshot = data => ({
  wohnungen:data.wohnungen,
  mieter:data.mieter,
  kostenarten:data.kostenarten,
  vorauszahlungen:data.vorauszahlungen,
  waterMeters:data.waterMeters,
  umlageInputs:data.umlageInputs,
  jahresArchiv:data.jahresArchiv,
  waterMeterHistory:data.waterMeterHistory,
  kostenartenMieterUmlage:data.kostenartenMieterUmlage,
  abrechnungsEinzelwerte:data.abrechnungsEinzelwerte,
  zaehlerDaten:meteringSnapshot(data.zaehlerDaten)
});

async function mount(browser) {
  const context = await browser.newContext({ viewport:{ width:1440, height:1000 }, acceptDownloads:true });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors=[];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.route(`${ORIGIN}/**`, async route => {
    const url = new URL(route.request().url());
    const rel = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "").split("?")[0];
    const file = path.resolve(ROOT, rel);
    const types={ ".css":"text/css", ".js":"text/javascript", ".json":"application/json", ".webmanifest":"application/manifest+json", ".png":"image/png", ".svg":"image/svg+xml" };
    if (!file.startsWith(ROOT+path.sep) || !fs.existsSync(file)) return route.fulfill({status:404,body:"not found"});
    return route.fulfill({status:200,contentType:types[path.extname(file).toLowerCase()]||"text/html",body:fs.readFileSync(file)});
  });
  await page.evaluate(() => {
    const store=new Map();
    const mock={get length(){return store.size;},key(i){return [...store.keys()][i]??null;},getItem(k){return store.get(String(k))??null;},setItem(k,v){store.set(String(k),String(v));},removeItem(k){store.delete(String(k));},clear(){store.clear();}};
    Object.defineProperty(window,"localStorage",{value:mock,configurable:true});
    window.alert=()=>{}; window.confirm=()=>true;
  });
  const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8").replace(/<head>/i,`<head><base href="${ORIGIN}/">`);
  await page.setContent(html,{waitUntil:"load"});
  await page.waitForFunction(() => globalThis.NKProExportService && globalThis.NKProBillingCalculation && typeof state !== "undefined");
  return {context,page,errors};
}

async function importFile(page,file) {
  await page.setInputFiles("#jsonImport",file);
  await page.waitForFunction(expected => state?.meta?.abrechnungsjahr === "2025" && state?.zaehlerDaten?.messwerte?.length === expected && state?.wohnungen?.reduce((sum,row)=>sum+Number(row.wohnflaeche||0),0) === 391.5, EXPECTED_METER_VALUES);
  await page.waitForTimeout(500);
}

(async()=>{
  fs.mkdirSync(OUTPUT_DIR,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
  let first,second;
  try {
    first=await mount(browser);
    await importFile(first.page,INPUT);
    await first.page.evaluate(() => { openCurrentBillingForEdit(); switchToTab("vorauszahlungsanpassung"); });
    await first.page.waitForSelector("#vorauszahlungAdjustCostTable tbody tr");
    const defaults=await first.page.evaluate(() => JSON.parse(JSON.stringify(state.prepaymentAdjustmentSettings)));
    assert.strictEqual(defaults.priceForecastEnabled,"Nein");
    assert.strictEqual(Number(defaults.generalPriceChangePercent),0);
    assert.deepStrictEqual(defaults.priceForecastByCost,{});

    const downloadPromise=first.page.waitForEvent("download");
    await first.page.evaluate(() => NKProExportService.downloadFullJson());
    const download=await downloadPromise;
    await download.saveAs(OUTPUT);
    const exported=JSON.parse(fs.readFileSync(OUTPUT,"utf8"));
    assert.strictEqual(exported.meta.dataSchemaVersion,5);
    assert.strictEqual(exported.meta.exportedWithAppVersion,"V99.4.66");
    assert.strictEqual(hash(protectedSnapshot(exported)),hash(protectedSnapshot(source)),"protected business data changed during export");
    assert.strictEqual(exported.zaehlerDaten.messwerte.length,EXPECTED_METER_VALUES);
    assert.strictEqual(exported.jahresArchiv.length,4);
    assert.strictEqual(Object.keys(exported.abrechnungsPruefungen?.records||{}).length,Object.keys(source.abrechnungsPruefungen?.records||{}).length);
    assert.strictEqual(exported.prepaymentAdjustmentSettings.priceForecastEnabled,"Nein");

    second=await mount(browser);
    await importFile(second.page,OUTPUT);
    const reimport=await second.page.evaluate(() => ({
      schema:state.meta.dataSchemaVersion,
      meters:state.zaehlerDaten.messwerte.length,
      archives:state.jahresArchiv.length,
      settings:JSON.parse(JSON.stringify(state.prepaymentAdjustmentSettings)),
      snapshot:{wohnungen:state.wohnungen,mieter:state.mieter,kostenarten:state.kostenarten,vorauszahlungen:state.vorauszahlungen,waterMeters:state.waterMeters,umlageInputs:state.umlageInputs,jahresArchiv:state.jahresArchiv,waterMeterHistory:state.waterMeterHistory,kostenartenMieterUmlage:state.kostenartenMieterUmlage,abrechnungsEinzelwerte:state.abrechnungsEinzelwerte,zaehlerDaten:(() => { const {updatedAt,updatedWithAppVersion,...business}=state.zaehlerDaten||{}; return business; })()}
    }));
    assert.strictEqual(reimport.schema,5);
    assert.strictEqual(reimport.meters,EXPECTED_METER_VALUES);
    assert.strictEqual(reimport.archives,4);
    assert.strictEqual(reimport.settings.priceForecastEnabled,"Nein");
    assert.strictEqual(hash(reimport.snapshot),hash(protectedSnapshot(source)),"protected data changed after clean reimport");
    assert.deepStrictEqual(first.errors,[]);
    assert.deepStrictEqual(second.errors,[]);
    console.log("AP22F11B Korrektur 4 data roundtrip passed");
  } finally {
    if(first) await first.context.close();
    if(second) await second.context.close();
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
