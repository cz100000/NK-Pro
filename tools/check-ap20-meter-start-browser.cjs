"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { chromium } = require("@playwright/test");

const root = path.resolve(__dirname, "..");
const storageKey = "nkpro_browser_v85_qualitaets_cockpit_data";
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scriptSources = [...indexSource.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)]
  .map(match => match[1])
  .filter(source => !source.includes("service-worker-register"));

function applicationHtml() {
  const css = fs.readFileSync(path.join(root, "assets/app.css"), "utf8").replace(/<\/style/gi, "<\\/style");
  return indexSource
    .replace(/<link[^>]+href="\.\/assets\/app\.css"[^>]*>/, `<style>${css}</style>`)
    .replace(/<link[^>]+rel="preload"[^>]*>/g, "")
    .replace(/<script\s+defer(?:="")?\s+src="[^"]+"><\/script>/g, "");
}

function reversedSeed() {
  const context = vm.createContext({ globalThis:null });
  context.globalThis = context;
  const source = fs.readFileSync(path.join(root, "js/default-seed.js"), "utf8");
  vm.runInContext(`${source}\nglobalThis.__seed = SEED;`, context, { filename:"js/default-seed.js" });
  const data = JSON.parse(JSON.stringify(context.__seed));
  assert.ok(Array.isArray(data.waterMeters && data.waterMeters.readings) && data.waterMeters.readings.length, "Seed enthält keine Wasserzählerdaten.");
  const row = data.waterMeters.readings[0];
  row.kwStart = 100;
  row.kwEnd = 90;
  row.kwStartDate = "2025-01-01";
  row.kwEndDate = "2025-12-31";
  row.wwStart = 0;
  row.wwEnd = "";
  return data;
}

async function main() {
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium";
  assert.ok(fs.existsSync(executablePath), `Chromium fehlt: ${executablePath}`);
  const browser = await chromium.launch({
    headless:true,
    executablePath,
    args:["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
  });
  try {
    const page = await browser.newPage({ viewport:{ width:1440, height:1000 }, locale:"de-DE", timezoneId:"Europe/Berlin" });
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    page.on("console", message => { if (message.type() === "error") pageErrors.push(message.text()); });
    await page.setContent(applicationHtml(), { waitUntil:"domcontentloaded" });
    const storedData = reversedSeed();
    await page.evaluate(({ key, raw }) => {
      const map = new Map([[key, raw]]);
      const storage = {
        getItem:itemKey => map.has(String(itemKey)) ? map.get(String(itemKey)) : null,
        setItem:(itemKey, value) => map.set(String(itemKey), String(value)),
        removeItem:itemKey => map.delete(String(itemKey)),
        clear:() => map.clear(),
        key:index => [...map.keys()][index] ?? null,
        get length() { return map.size; }
      };
      Object.defineProperty(window, "localStorage", { value:storage, configurable:true });
      Object.defineProperty(window, "sessionStorage", { value:storage, configurable:true });
      window.__alerts = [];
      window.alert = message => window.__alerts.push(String(message));
      window.confirm = () => true;
      window.prompt = (_message, defaultValue="") => defaultValue || "fachlich geprüft";
      if (!navigator.clipboard) Object.defineProperty(navigator, "clipboard", { value:{ writeText:async () => {} }, configurable:true });
    }, { key:storageKey, raw:JSON.stringify(storedData) });

    for (const relative of scriptSources) {
      const source = fs.readFileSync(path.join(root, relative.split("?")[0].replace(/^\.\//, "")), "utf8");
      await page.addScriptTag({ content:`//# sourceURL=${relative}\n${source}` });
    }
    await page.waitForTimeout(180);

    const startup = await page.evaluate(() => ({
      fallback:!!(state && state.meta && state.meta.startupFallback),
      startupErrors:Array.isArray(startupErrors) ? startupErrors.slice() : [],
      alertCount:Array.isArray(window.__alerts) ? window.__alerts.length : 0,
      tenantCount:Array.isArray(state && state.mieter) ? state.mieter.length : 0,
      periodCount:state && state.zaehlerDaten && Array.isArray(state.zaehlerDaten.messperioden) ? state.zaehlerDaten.messperioden.length : 0,
      reversedPeriods:state && state.zaehlerDaten && Array.isArray(state.zaehlerDaten.messperioden)
        ? state.zaehlerDaten.messperioden.filter(row => Number(row.verbrauch) < 0 || row.status === "invalid").length
        : 0
    }));
    assert.equal(startup.fallback, false, "Die Anwendung hat fälschlich den leeren Fallback-Datensatz geladen.");
    assert.equal(startup.startupErrors.length, 0, JSON.stringify(startup.startupErrors));
    assert.equal(startup.alertCount, 0, "Beim Datenstart wurde unerwartet ein Fehlerdialog angezeigt.");
    assert.ok(startup.tenantCount > 0, "Der gespeicherte Datensatz wurde nicht geladen.");
    assert.ok(startup.periodCount > 0, "Die Zählermessperioden wurden nicht normalisiert.");
    assert.ok(startup.reversedPeriods > 0, "Die fachliche Auffälligkeit wurde beim Laden unerwartet entfernt.");

    await page.evaluate(() => switchToTab("start"));
    await page.waitForTimeout(40);
    await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentEdit"]').evaluate(node => node.click());
    await page.waitForTimeout(80);
    const finding = await page.evaluate(() => {
      const report = NKProQualityAssurance.inspect({ scope:"currentBilling", includeTechnical:false });
      const row = report.results.find(item => item.ruleId === "NKP-PLAU-005" && !item.passed);
      return row ? { status:row.status, blocking:row.blocking, confirmAllowed:row.confirmAllowed, details:row.details, values:row.values } : null;
    });
    assert.ok(finding, "NKP-PLAU-005 wurde nach dem erfolgreichen Datenstart nicht erzeugt.");
    assert.equal(finding.status, "Zu prüfen");
    assert.equal(finding.blocking, false);
    assert.equal(finding.confirmAllowed, true);
    assert.match(finding.details, /Endstand 90/);
    assert.match(finding.details, /Anfangsstand 100/);
    assert.equal(pageErrors.length, 0, pageErrors.join(" | "));

    process.stdout.write(JSON.stringify({
      status:"passed",
      startupFallback:false,
      startupErrors:0,
      reversedPeriods:startup.reversedPeriods,
      centralRule:"NKP-PLAU-005",
      centralStatus:finding.status,
      chromium:executablePath
    }, null, 2) + "\n");
    await page.close();
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  process.stderr.write(`FEHLER: ${error.stack || error.message}\n`);
  process.exit(1);
});
