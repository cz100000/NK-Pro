"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "nk-pro-gesamtbestand-2025-V99.4.66-2026-07-21-Wohnflaechen-korrigiert.json");
const ORIGIN = "http://nkpro-v99-4-66-area.test";
const STORAGE_KEY = "nkpro_browser_v85_qualitaets_cockpit_data";
const EXPECTED = {
  "W000.UG":65,
  "W001.EG-L":62.5,
  "W002.EG-R":52.5,
  "W003.1OG-L":62.5,
  "W004.1OG-R":52.5,
  "W005.DG-L":52,
  "W006.DG-R":44.5
};
const hash = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

function legacyWorkingCopy() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  delete data.meta.apartmentAreaCorrection20260721;
  delete data.meta.wohnflaechenKorrekturHinweis;
  const setUnits = rows => (rows || []).forEach(row => {
    const id = String(row.id || row.einheitId || row.abrechnungseinheitId || "");
    if (Object.prototype.hasOwnProperty.call(EXPECTED, id)) {
      row.wohnflaeche = 55;
      if (row.verteilungsgrundlagen) row.verteilungsgrundlagen.wohnflaeche = 55;
    }
  });
  const setTenants = rows => (rows || []).forEach(row => {
    const id = String(row.wohnung || row.einheitId || row.abrechnungseinheitId || "");
    if (Object.prototype.hasOwnProperty.call(EXPECTED, id)) row.wohnflaeche = 55;
  });
  setUnits(data.wohnungen);
  setTenants(data.mieter);
  setUnits(data.stammdaten && data.stammdaten.wohnungen);
  setTenants(data.stammdaten && data.stammdaten.mieter);
  setUnits(data.objektStandard && data.objektStandard.einheiten);
  setTenants(data.objektStandard && data.objektStandard.partner);
  setTenants(data.objektStandard && data.objektStandard.vertraege);
  return data;
}

(async () => {
  const legacy = legacyWorkingCopy();
  const archiveHashBefore = hash(legacy.jahresArchiv);
  const systemChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  const browser = await chromium.launch({ headless:true, ...(systemChromium ? { executablePath:systemChromium } : {}) });
  const context = await browser.newContext({ viewport:{ width:1440, height:1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(String(error.stack || error.message)));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.route(`${ORIGIN}/**`, async route => {
    const url = new URL(route.request().url());
    const rel = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "").split("?")[0];
    const file = path.resolve(ROOT, rel);
    const types = { ".css":"text/css", ".js":"text/javascript", ".json":"application/json", ".webmanifest":"application/manifest+json", ".png":"image/png", ".svg":"image/svg+xml" };
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) return route.fulfill({ status:404, body:"not found" });
    return route.fulfill({ status:200, contentType:types[path.extname(file).toLowerCase()] || "text/html", body:fs.readFileSync(file) });
  });
  await page.evaluate(({ key, value }) => {
    const store = new Map([[key, JSON.stringify(value)]]);
    const mock = {
      get length(){ return store.size; },
      key(i){ return [...store.keys()][i] ?? null; },
      getItem(k){ return store.get(String(k)) ?? null; },
      setItem(k,v){ store.set(String(k),String(v)); },
      removeItem(k){ store.delete(String(k)); },
      clear(){ store.clear(); },
      __entries(){ return Object.fromEntries(store); }
    };
    Object.defineProperty(window, "localStorage", { value:mock, configurable:true });
    window.alert = () => {};
    window.confirm = () => true;
    window.prompt = () => "Bestätigt";
  }, { key:STORAGE_KEY, value:legacy });
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").replace(/<head>/i, `<head><base href="${ORIGIN}/">`);
  await page.setContent(html, { waitUntil:"load" });
  await page.waitForFunction(() => typeof state !== "undefined" && typeof switchToTab === "function" && globalThis.NKProApartmentAreaCorrection);
  await page.waitForFunction(() => state?.meta?.apartmentAreaCorrection20260721?.pendingPersistence === false);

  const result = await page.evaluate(({ expected, key }) => {
    const mapRows = rows => Object.fromEntries((rows || []).map(row => [String(row.id || row.einheitId || ""), Number(row.wohnflaeche)]));
    const tenantRows = rows => Object.fromEntries((rows || []).filter(row => expected[row.wohnung] !== undefined).map(row => [String(row.wohnung), Number(row.wohnflaeche)]));
    const stored = JSON.parse(localStorage.getItem(key));
    return {
      version:APP_VERSION,
      currentUnits:mapRows(state.wohnungen),
      masterUnits:mapRows(state.stammdaten.wohnungen),
      objectUnits:mapRows(state.objektStandard.einheiten),
      currentTenants:tenantRows(state.mieter),
      masterTenants:tenantRows(state.stammdaten.mieter),
      total:state.wohnungen.reduce((sum,row) => sum + Number(row.wohnflaeche || 0), 0),
      marker:state.meta.apartmentAreaCorrection20260721,
      storedUnits:mapRows(stored.wohnungen),
      storedMarker:stored.meta.apartmentAreaCorrection20260721,
      archives:state.jahresArchiv
    };
  }, { expected:EXPECTED, key:STORAGE_KEY });

  assert.strictEqual(result.version, "V99.4.66");
  for (const [id, area] of Object.entries(EXPECTED)) {
    assert.strictEqual(result.currentUnits[id], area, `aktuelle Wohnung ${id}`);
    assert.strictEqual(result.masterUnits[id], area, `Stammdaten ${id}`);
    assert.strictEqual(result.objectUnits[id], area, `Objektstandard ${id}`);
    assert.strictEqual(result.storedUnits[id], area, `persistierte Wohnung ${id}`);
  }
  for (const [id, area] of Object.entries(result.currentTenants)) assert.strictEqual(area, EXPECTED[id], `aktuelles Mietverhältnis ${id}`);
  for (const [id, area] of Object.entries(result.masterTenants)) assert.strictEqual(area, EXPECTED[id], `Stammdaten-Mietverhältnis ${id}`);
  assert.strictEqual(result.total, 391.5);
  assert.strictEqual(result.marker.archiveSnapshotsChanged, false);
  assert.strictEqual(result.marker.pendingPersistence, false);
  assert.ok(result.marker.persistedAt);
  assert.strictEqual(result.storedMarker.pendingPersistence, false);
  assert.strictEqual(hash(result.archives), archiveHashBefore, "Jahresarchive wurden verändert");
  assert.strictEqual(result.archives[0].data.wohnungen[0].wohnflaeche, 55);

  await page.evaluate(() => { switchToTab("wohnungsverwaltung"); });
  await page.waitForSelector("#wohnungsverwaltung.active #startUnitTable");
  const displayed = await page.locator('#startUnitTable input[id^="unit-wohnflaeche-"]').evaluateAll(inputs => inputs.map(input => Number(input.value)));
  assert.deepStrictEqual(displayed, [65,62.5,52.5,62.5,52.5,52,44.5]);
  assert.deepStrictEqual(errors, []);

  await browser.close();
  console.log("Wohnflächenkorrektur V99.4.66 im Browser geprüft");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
