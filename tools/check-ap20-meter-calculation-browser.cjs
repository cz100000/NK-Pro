"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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

async function installStorage(page, initialRaw = null) {
  await page.evaluate(({ key, raw }) => {
    const map = new Map(raw === null ? [] : [[key, raw]]);
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
  }, { key:storageKey, raw:initialRaw });
}

async function loadApplication(page, initialRaw = null) {
  await page.setContent(applicationHtml(), { waitUntil:"domcontentloaded" });
  await installStorage(page, initialRaw);
  for (const relative of scriptSources) {
    const source = fs.readFileSync(path.join(root, relative.replace(/^\.\//, "")), "utf8");
    await page.addScriptTag({ content:`//# sourceURL=${relative}\n${source}` });
  }
  await page.waitForTimeout(160);
}

async function openMeterTable(page) {
  await page.evaluate(() => switchToTab("start"));
  await page.waitForTimeout(30);
  await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentEdit"]').evaluate(node => node.click());
  await page.waitForTimeout(60);
  await page.evaluate(() => switchToTab("verbraeuche"));
  await page.waitForTimeout(60);
  await page.evaluate(() => { const section = document.querySelector("#meterEntrySection"); if (section) section.open = true; });
  await page.waitForTimeout(20);
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
    const page = await browser.newPage({ viewport:{ width:1480, height:980 }, locale:"de-DE", timezoneId:"Europe/Berlin" });
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    page.on("console", message => { if (message.type() === "error") pageErrors.push(message.text()); });
    await loadApplication(page);
    await openMeterTable(page);

    let row = page.locator("#waterMeterTable tbody tr").first();
    const kwEnd = row.locator('input[data-water-meter-field="kwEnd"]');
    const initialFooter = await page.locator('[data-meter-footer="kw"]').innerText();
    await kwEnd.fill("297,24");
    assert.equal((await row.locator('[data-meter-result="kw"]').innerText()).trim(), "31,24", "Live-Verbrauch wird vor Fokuswechsel nicht aktualisiert.");
    assert.notEqual((await page.locator('[data-meter-footer="kw"]').innerText()).trim(), initialFooter.trim(), "Live-Summe wird nicht aktualisiert.");
    assert.equal(await page.evaluate(() => state.waterMeters.readings[0].kwEnd), "", "Live-Vorschau darf den gespeicherten Zustand vor Commit nicht verändern.");

    await kwEnd.press("Enter");
    await page.waitForTimeout(160);
    assert.equal(await page.evaluate(() => state.waterMeters.readings[0].kwEnd), 297.24, "Enter speichert Dezimalkomma nicht korrekt.");
    row = page.locator("#waterMeterTable tbody tr").first();
    assert.equal((await row.locator('[data-meter-result="kw"]').innerText()).trim(), "31,24", "Verbrauch nach Enter-Commit ist falsch.");

    const secondRow = page.locator("#waterMeterTable tbody tr").nth(1);
    const secondEnd = secondRow.locator('input[data-water-meter-field="kwEnd"]');
    await secondEnd.fill("128.06");
    assert.equal((await secondRow.locator('[data-meter-result="kw"]').innerText()).trim(), "11,06", "Live-Verbrauch mit Dezimalpunkt ist falsch.");
    await secondEnd.press("Enter");
    await page.waitForTimeout(160);
    assert.equal(await page.evaluate(() => state.waterMeters.readings[1].kwEnd), 128.06, "Dezimalpunkt wird beim Commit falsch gespeichert.");

    const storedRaw = await page.evaluate(key => localStorage.getItem(key), storageKey);
    assert.ok(storedRaw && storedRaw.includes("297.24") && storedRaw.includes("128.06"), "Gespeicherter Datensatz enthält die bestätigten Werte nicht.");
    assert.equal(pageErrors.length, 0, pageErrors.join(" | "));
    await page.close();

    const reloadPage = await browser.newPage({ viewport:{ width:1480, height:980 }, locale:"de-DE", timezoneId:"Europe/Berlin" });
    const reloadErrors = [];
    reloadPage.on("pageerror", error => reloadErrors.push(error.message));
    reloadPage.on("console", message => { if (message.type() === "error") reloadErrors.push(message.text()); });
    await loadApplication(reloadPage, storedRaw);
    await openMeterTable(reloadPage);
    const reloadedRows = reloadPage.locator("#waterMeterTable tbody tr");
    assert.equal(await reloadPage.evaluate(() => state.waterMeters.readings[0].kwEnd), 297.24, "Wert mit Dezimalkomma geht beim Neustart verloren.");
    assert.equal(await reloadPage.evaluate(() => state.waterMeters.readings[1].kwEnd), 128.06, "Wert mit Dezimalpunkt geht beim Neustart verloren.");
    assert.equal((await reloadedRows.nth(0).locator('[data-meter-result="kw"]').innerText()).trim(), "31,24", "Neustart-Verbrauch der ersten Zeile ist falsch.");
    assert.equal((await reloadedRows.nth(1).locator('[data-meter-result="kw"]').innerText()).trim(), "11,06", "Neustart-Verbrauch der zweiten Zeile ist falsch.");
    assert.equal(reloadErrors.length, 0, reloadErrors.join(" | "));

    process.stdout.write(JSON.stringify({
      status:"passed",
      livePreview:true,
      enterCommit:true,
      decimalComma:true,
      decimalPoint:true,
      persistedReload:true,
      firstConsumption:31.24,
      secondConsumption:11.06,
      chromium:executablePath
    }, null, 2) + "\n");
    await reloadPage.close();
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  process.stderr.write(`FEHLER: ${error.stack || error.message}\n`);
  process.exit(1);
});
