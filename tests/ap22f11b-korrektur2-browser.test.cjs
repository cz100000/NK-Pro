"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { chromium } = require("/mnt/data/ap22f11b_workspace/source/node_modules/playwright");

const ROOT = path.resolve(__dirname, "..");
const DATA = "/mnt/data/nk-pro-gesamtbestand-2025-V99.4.62-AP22F11B-Korrektur1-getestet.json";
const ORIGIN = "http://nkpro-ap22f11b-k2.test";
const SHOT_DIR = path.join(ROOT, "AP22F11B_Korrektur2_Screenshots");
fs.mkdirSync(SHOT_DIR, { recursive:true });

async function mount(browser, viewport = { width:1440, height:1000 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", error => errors.push(`PAGE: ${error.stack || error.message}`));
  page.on("console", message => { if (message.type() === "error") errors.push(`CONSOLE: ${message.text()}`); });
  await page.route(`${ORIGIN}/**`, async route => {
    const url = new URL(route.request().url());
    const rel = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "").split("?")[0];
    const file = path.resolve(ROOT, rel);
    const types = { ".css":"text/css", ".js":"text/javascript", ".json":"application/json", ".webmanifest":"application/manifest+json", ".png":"image/png", ".svg":"image/svg+xml" };
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) return route.fulfill({ status:404, body:"not found" });
    return route.fulfill({ status:200, contentType:types[path.extname(file).toLowerCase()] || "text/html", body:fs.readFileSync(file) });
  });
  await page.evaluate(() => {
    const store = new Map();
    let failWrites = false;
    const mock = {
      get length(){ return store.size; },
      key(index){ return [...store.keys()][index] ?? null; },
      getItem(key){ return store.get(String(key)) ?? null; },
      setItem(key,value){ if (failWrites) throw new Error("Simulierter Speicherfehler"); store.set(String(key),String(value)); },
      removeItem(key){ store.delete(String(key)); },
      clear(){ store.clear(); },
      __entries(){ return Object.fromEntries(store); },
      __setFail(value){ failWrites = !!value; }
    };
    Object.defineProperty(window, "localStorage", { value:mock, configurable:true });
    window.alert = () => {};
    window.confirm = () => true;
  });
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").replace(/<head>/i, `<head><base href="${ORIGIN}/">`);
  await page.setContent(html, { waitUntil:"load" });
  await page.waitForFunction(() => globalThis.NKProBillingCalculation && globalThis.NKProBillingWorkflow && typeof state !== "undefined" && typeof switchToTab === "function");
  return { context, page, errors };
}

async function importData(page) {
  await page.setInputFiles("#jsonImport", DATA);
  await page.waitForFunction(() => state && state.meta && state.meta.abrechnungsjahr === "2025" && Array.isArray(state.kostenarten) && state.kostenarten.some(row => row && row.id === "K006"));
  await page.waitForTimeout(600);
}

async function openPage(page, tab) {
  let result = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    result = await page.evaluate(tabId => {
      try {
        openCurrentBillingForEdit();
        switchToTab(tabId);
        return { ok:true, active:document.querySelector("section.tab.active")?.id || "", open:globalThis.NKProBillingContext?.isOpen?.() };
      } catch (error) {
        return { ok:false, error:error.stack || error.message, active:document.querySelector("section.tab.active")?.id || "" };
      }
    }, tab);
    await page.waitForTimeout(180);
    const active = await page.evaluate(() => document.querySelector("section.tab.active")?.id || "");
    if (result.ok && active === tab) return;
  }
  throw new Error(`Tabwechsel ${tab} fehlgeschlagen: ${JSON.stringify(result)}`);
}

(async () => {
  const browser = await chromium.launch({ headless:true, executablePath:"/usr/bin/chromium", args:["--no-sandbox","--disable-dev-shm-usage"] });
  let session;
  try {
    session = await mount(browser);
    const { page, errors } = session;
    await importData(page);
    await openPage(page, "vorauszahlungsanpassung");
    await page.waitForSelector("#vorauszahlungAdjustCostTable tbody tr");

    const navigation = await page.evaluate(() => [...document.querySelectorAll(".nav-group")].map(group => ({
      heading:group.querySelector(".nav-group-label")?.textContent.trim(),
      items:[...group.querySelectorAll(".nav-item-label")].map(node => node.textContent.trim())
    })));
    const billing = navigation.find(group => group.heading === "Nebenkosten abrechnen");
    const analysis = navigation.find(group => group.heading === "Analyse");
    const archive = navigation.find(group => group.heading === "Archiv");
    assert.ok(billing && analysis && archive, "billing, analysis and archive groups visible");
    assert.ok(billing.items.includes("Vorauszahlungen anpassen"), "prepayment adjustment restored to navigation");
    assert.ok(billing.items.indexOf("Abrechnungsergebnis") < billing.items.indexOf("Vorauszahlungen anpassen"), "prepayment adjustment after result");
    assert.ok(billing.items.indexOf("Vorauszahlungen anpassen") < billing.items.indexOf("Prüfung & Freigabe"), "prepayment adjustment before quality");
    assert.deepStrictEqual(analysis.items, ["Auswertungen"]);
    assert.ok(navigation.indexOf(analysis) < navigation.indexOf(archive), "analysis before archive");

    assert.strictEqual(await page.locator("#prepaymentRulesSection details").getAttribute("open"), "", "calculation rules open");
    assert.strictEqual(await page.locator("#vorauszahlungAdjustKpis article").count(), 4, "four KPI cards");
    assert.strictEqual(await page.locator("#vorauszahlungAdjustCostTable tbody tr").count(), 3, "three active prepayment cost rows");
    assert.strictEqual(await page.locator("#vorauszahlungAdjustSummaryTable tbody tr").count(), 4, "four tenant recommendation rows");

    const rulesText = await page.locator("#vorauszahlungAdjustSettings").innerText();
    assert.match(rulesText, /A\.\s*Basisanpassung/);
    assert.match(rulesText, /B\.\s*Preisprognose/);
    assert.match(rulesText, /C\.\s*Ausgabe im Brief/);
    assert.match(await page.locator("#vorauszahlungAdjustCalculationNote").innerText(), /Berechnungsreihenfolge/);

    const alignment = await page.evaluate(() => [...document.querySelectorAll("#vorauszahlungAdjustCostTable .money, #vorauszahlungAdjustCostTable .numeric, #vorauszahlungAdjustSummaryTable .money, #vorauszahlungAdjustSummaryTable .numeric")].map(node => getComputedStyle(node).textAlign));
    assert.ok(alignment.length > 20, "numeric cells found");
    assert.ok(alignment.every(value => value === "right"), `numeric alignment: ${alignment.filter(value => value !== "right").slice(0,5)}`);

    const desktopLayout = await page.evaluate(() => ({
      overflow:Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      wraps:[...document.querySelectorAll("#vorauszahlungsanpassung .prepayment-adjustment-table-wrap")].map(node => ({ scrollWidth:node.scrollWidth, clientWidth:node.clientWidth })),
      headerBackground:getComputedStyle(document.querySelector("#vorauszahlungAdjustCostTable thead th")).backgroundColor
    }));
    assert.strictEqual(desktopLayout.overflow, 0, "no document horizontal overflow at desktop");
    assert.ok(desktopLayout.wraps.every(row => row.scrollWidth <= row.clientWidth + 1), JSON.stringify(desktopLayout.wraps));
    assert.ok(desktopLayout.headerBackground.includes("242") || desktopLayout.headerBackground.includes("245") || desktopLayout.headerBackground.includes("247"), desktopLayout.headerBackground);

    await page.setViewportSize({ width:1640, height:1000 });
    await page.waitForTimeout(180);
    const desktop1640 = await page.evaluate(() => ({ overflow:Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth), wraps:[...document.querySelectorAll("#vorauszahlungsanpassung .prepayment-adjustment-table-wrap")].map(node => ({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth})) }));
    assert.strictEqual(desktop1640.overflow, 0, "no document horizontal overflow at 1640");
    assert.ok(desktop1640.wraps.every(row => row.scrollWidth <= row.clientWidth + 1), JSON.stringify(desktop1640.wraps));
    await page.setViewportSize({ width:1152, height:1000 });
    await page.waitForTimeout(180);
    const zoom125 = await page.evaluate(() => ({ overflow:Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth) }));
    assert.strictEqual(zoom125.overflow, 0, "no document horizontal overflow at 125 percent equivalent");
    await page.setViewportSize({ width:1440, height:1000 });
    await page.waitForTimeout(180);

    const before = await page.evaluate(() => ({
      recommended:NKProBillingCalculation.prepaymentAdjustmentData().totals.recommendedMonthly,
      state:JSON.parse(JSON.stringify(state.prepaymentAdjustmentSettings || {}))
    }));
    const forecastEnable = page.locator("#vorauszahlungAdjustSettings label").filter({ hasText:"Preisprognose aktivieren" }).locator("select");
    await forecastEnable.selectOption("Ja");
    const generalForecast = page.locator("#vorauszahlungAdjustSettings label").filter({ hasText:"Allgemeine Preisänderung in %" }).locator("input");
    await generalForecast.fill("10");
    await generalForecast.dispatchEvent("change");
    await page.waitForFunction(value => NKProBillingCalculation.prepaymentAdjustmentData().totals.recommendedMonthly > value, before.recommended);
    const afterGeneral = await page.evaluate(() => ({
      recommended:NKProBillingCalculation.prepaymentAdjustmentData().totals.recommendedMonthly,
      settings:JSON.parse(JSON.stringify(state.prepaymentAdjustmentSettings))
    }));
    assert.strictEqual(afterGeneral.settings.priceForecastEnabled, "Ja");
    assert.strictEqual(Number(afterGeneral.settings.generalPriceChangePercent), 10);
    assert.ok(afterGeneral.recommended > before.recommended, "price forecast raises recommendation");

    const k006Row = page.locator(".prepayment-forecast-table tbody tr").filter({ hasText:"Heiz- und Warmwasserkosten" });
    const percent = k006Row.locator("input[aria-label^='Preisänderung']");
    const source = k006Row.locator("input[aria-label^='Begründung']");
    await percent.fill("5");
    await percent.dispatchEvent("change");
    await source.fill("Versorgerprognose AP22F11B K2");
    await source.dispatchEvent("change");
    await page.waitForFunction(() => Number(state.prepaymentAdjustmentSettings?.priceForecastByCost?.K006?.percent) === 5 && state.prepaymentAdjustmentSettings?.priceForecastByCost?.K006?.source === "Versorgerprognose AP22F11B K2");

    await page.evaluate(() => switchToTab("umlage"));
    await page.waitForSelector("#umlage.active");
    await page.evaluate(() => switchToTab("vorauszahlungsanpassung"));
    await page.waitForSelector("#vorauszahlungsanpassung.active");
    await page.waitForFunction(() => document.querySelector(".prepayment-forecast-table tbody tr"));
    const persisted = await page.evaluate(() => ({
      enabled:state.prepaymentAdjustmentSettings.priceForecastEnabled,
      general:state.prepaymentAdjustmentSettings.generalPriceChangePercent,
      row:state.prepaymentAdjustmentSettings.priceForecastByCost.K006,
      localStorage:Object.keys(localStorage.__entries()).length
    }));
    assert.strictEqual(persisted.enabled, "Ja");
    assert.strictEqual(Number(persisted.general), 10);
    assert.strictEqual(Number(persisted.row.percent), 5);
    assert.strictEqual(persisted.row.source, "Versorgerprognose AP22F11B K2");
    assert.ok(persisted.localStorage > 0, "settings persisted to storage");

    await page.screenshot({ path:path.join(SHOT_DIR, "01_vorauszahlungen_anpassen_desktop_1440.png"), fullPage:true });

    await openPage(page, "auswertungen");
    await page.waitForSelector("#analyticsTenantTable tbody tr");
    assert.strictEqual(await page.locator("#analyticsOverviewKpis article").count(), 4, "four analytics KPIs");
    assert.strictEqual(await page.locator("#analyticsTenantTable tbody tr").count(), 4, "four analytics tenant rows");
    const analyticsText = await page.locator("#auswertungen").innerText();
    assert.match(analyticsText, /13\.111,28\s*€/);
    assert.match(analyticsText, /4\.734,53\s*€/);
    assert.match(analyticsText, /Auswertungen/);
    assert.match(analyticsText, /rein lesend/);
    const analyticsAlignment = await page.evaluate(() => [...document.querySelectorAll("#analyticsTenantTable .money")].map(node => getComputedStyle(node).textAlign));
    assert.ok(analyticsAlignment.length > 10 && analyticsAlignment.every(value => value === "right"));
    await page.screenshot({ path:path.join(SHOT_DIR, "02_auswertungen_desktop_1440.png"), fullPage:true });

    await openPage(page, "vorauszahlungsanpassung");
    await page.setViewportSize({ width:760, height:980 });
    await page.waitForTimeout(220);
    const narrow = await page.evaluate(() => ({
      overflow:Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      wraps:[...document.querySelectorAll("#vorauszahlungsanpassung .prepayment-adjustment-table-wrap")].map(node => ({ scrollWidth:node.scrollWidth, clientWidth:node.clientWidth }))
    }));
    assert.strictEqual(narrow.overflow, 0, "no document horizontal overflow at narrow width");
    assert.ok(narrow.wraps.some(row => row.scrollWidth > row.clientWidth + 20), JSON.stringify(narrow.wraps));
    await page.screenshot({ path:path.join(SHOT_DIR, "03_vorauszahlungen_anpassen_schmal_760.png"), fullPage:true });

    assert.deepStrictEqual(errors, []);
    console.log("AP22F11B Korrektur 2 browser checks passed");
  } finally {
    if (session) await session.context.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
