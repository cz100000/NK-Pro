"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("@playwright/test");

const root = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scriptSources = [...indexSource.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)]
  .map(match => match[1])
  .filter(relative => !relative.includes("service-worker-register"));

function applicationHtml() {
  const css = fs.readFileSync(path.join(root, "assets/app.css"), "utf8").replace(/<\/style/gi, "<\\/style");
  return indexSource
    .replace(/<link[^>]+href="\.\/assets\/app\.css"[^>]*>/, `<style>${css}</style>`)
    .replace(/<link[^>]+rel="preload"[^>]*>/g, "")
    .replace(/<script\s+defer(?:="")?\s+src="[^"]+"><\/script>/g, "");
}

function storageSeedFrom(entries) {
  return Object.fromEntries(entries || []);
}

async function bootPage(browser, options = {}) {
  const viewport = options.viewport || { width:1440, height:1000 };
  const page = await browser.newPage({ viewport, locale:"de-DE", timezoneId:"Europe/Berlin" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.setContent(applicationHtml(), { waitUntil:"domcontentloaded" });
  await page.evaluate(seed => {
    function createStore(initial) {
      const map = new Map(Object.entries(initial || {}));
      return {
        getItem(key) { key=String(key); return map.has(key) ? map.get(key) : null; },
        setItem(key, value) { map.set(String(key), String(value)); },
        removeItem(key) { map.delete(String(key)); },
        clear() { map.clear(); },
        key(index) { return [...map.keys()][index] ?? null; },
        get length() { return map.size; },
        __entries() { return [...map.entries()]; }
      };
    }
    Object.defineProperty(window, "localStorage", { value:createStore(seed.local), configurable:true });
    Object.defineProperty(window, "sessionStorage", { value:createStore(seed.session), configurable:true });
    window.__nkConfirmQueue = [];
    window.__nkAlerts = [];
    window.alert = message => window.__nkAlerts.push(String(message));
    window.confirm = () => window.__nkConfirmQueue.length ? Boolean(window.__nkConfirmQueue.shift()) : true;
    window.prompt = (_message, defaultValue="") => defaultValue;
    if (!navigator.clipboard) Object.defineProperty(navigator, "clipboard", { value:{ writeText:async()=>{} }, configurable:true });
  }, { local:storageSeedFrom(options.localEntries), session:storageSeedFrom(options.sessionEntries) });

  for (const relative of scriptSources) {
    const source = fs.readFileSync(path.join(root, relative.replace(/^\.\//, "")), "utf8");
    await page.addScriptTag({ content:`//# sourceURL=${relative}\n${source}` });
  }
  await page.waitForTimeout(80);
  return { page, errors };
}

async function openOverview(page) {
  await page.evaluate(() => switchToTab("start"));
  await page.waitForTimeout(30);
}

async function storageEntries(page, name) {
  return page.evaluate(storageName => window[storageName].__entries(), name);
}

async function main() {
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium";
  assert(fs.existsSync(executablePath), `Chromium fehlt: ${executablePath}`);
  const browser = await chromium.launch({
    headless:true,
    executablePath,
    args:["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
  });
  const summary = { scenarios:0, checks:0, status:"passed", chromium:executablePath };
  try {
    // 1: Start, produktive Übersicht und Statuszählung.
    let boot = await bootPage(browser);
    let { page, errors } = boot;
    let context = await page.evaluate(() => NKProBillingContext.describe());
    assert.equal(context.stateCount, 3); summary.checks++;
    assert.equal(context.context.mode, "closed"); summary.checks++;
    assert(/active/.test(await page.locator("#landing").getAttribute("class"))); summary.checks++;
    await openOverview(page);
    assert.equal(await page.locator("#startArchiveTable thead th").count(), 9); summary.checks++;
    assert.equal(await page.locator("#startArchiveTable tbody tr").count(), 5); summary.checks++;
    assert.equal(await page.locator("#startArchiveTable .current-record-row").count(), 1); summary.checks++;
    assert.equal(await page.locator("#startArchiveTable .archive-record-row").count(), 4); summary.checks++;
    assert.match(await page.locator("#startArchiveTable").textContent(), /Zur Korrektur öffnen/); summary.checks++;
    assert.equal(await page.locator('[data-requires-billing="true"][aria-disabled="true"]').count(), 10); summary.checks++;
    assert.match(await page.locator('[data-area-dashboard="billing"]').textContent(), /Öffnen Sie zuerst eine Abrechnung zur Bearbeitung oder Ansicht/); summary.checks++;
    const audit = await page.evaluate(() => auditV992Structure());
    assert.equal(audit.allPassed, true); summary.checks++;
    assert.deepEqual(audit.checks.productiveDashboardValues, true); summary.checks++;
    assert.equal(errors.length, 0, `Browserfehler im Start-Szenario: ${errors.join(" | ")}`); summary.checks++;
    summary.scenarios++;

    // 2: Ansehen und technische Schreibsperre.
    await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentView"]').evaluate(node => node.click());
    await page.waitForTimeout(30);
    assert.equal((await page.evaluate(() => NKProBillingContext.snapshot())).mode, "view"); summary.checks++;
    assert(/active/.test(await page.locator("#mieter").getAttribute("class"))); summary.checks++;
    assert.match(await page.locator("#mieter .billing-readonly-notice").textContent(), /Schreibgeschützte Ansicht/); summary.checks++;
    assert.equal(await page.locator("#mieter [data-page-save]").isHidden(), true); summary.checks++;
    const protectedResult = await page.evaluate(() => {
      const before=state.meta.abrechnungsjahr;
      try { NKProApplicationActions.execute("billing", "setYear", ["2030"]); return { blocked:false, before, after:state.meta.abrechnungsjahr }; }
      catch (error) { return { blocked:error && error.code === "NKPRO_BILLING_READONLY", message:error.message, before, after:state.meta.abrechnungsjahr }; }
    });
    assert.equal(protectedResult.blocked, true); summary.checks++;
    assert.equal(protectedResult.after, protectedResult.before); summary.checks++;
    assert.equal(protectedResult.message, "Diese Abrechnung ist im Ansichtsmodus geöffnet und kann nicht geändert werden."); summary.checks++;
    await page.evaluate(() => switchToTab("einnahmen"));
    await page.waitForTimeout(20);
    assert((await page.locator('#einnahmen input[readonly]:not([type="search"])').count()) > 0); summary.checks++;
    await page.keyboard.press("Control+s");
    assert((await page.evaluate(() => window.__nkAlerts)).some(message => message.includes("Ansichtsmodus"))); summary.checks++;
    assert.equal(errors.length, 0, `Browserfehler im Ansichts-Szenario: ${errors.join(" | ")}`); summary.checks++;
    summary.scenarios++;

    // 3: Dirty-State, Schließen und vollständiger Neustart ohne offenen Kontext.
    await page.evaluate(() => { window.__nkConfirmQueue=[true]; closeBillingContext(); });
    await openOverview(page);
    await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentEdit"]').evaluate(node => node.click());
    await page.waitForTimeout(30);
    assert.equal((await page.evaluate(() => NKProBillingContext.snapshot())).mode, "edit"); summary.checks++;
    await page.evaluate(() => { NKProBillingContext.markDirty(true); window.__nkConfirmQueue=[false]; closeBillingContext(); });
    assert.equal((await page.evaluate(() => NKProBillingContext.snapshot())).mode, "edit"); summary.checks++;
    await page.evaluate(() => { window.__nkConfirmQueue=[true]; closeBillingContext(); });
    assert.equal((await page.evaluate(() => NKProBillingContext.snapshot())).mode, "closed"); summary.checks++;
    assert(/active/.test(await page.locator("#start").getAttribute("class"))); summary.checks++;
    await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentEdit"]').evaluate(node => node.click());
    const localEntries = await storageEntries(page, "localStorage");
    const sessionEntries = await storageEntries(page, "sessionStorage");
    await page.close();
    boot = await bootPage(browser, { localEntries, sessionEntries });
    page=boot.page; errors=boot.errors;
    assert.equal((await page.evaluate(() => NKProBillingContext.snapshot())).mode, "closed"); summary.checks++;
    assert(/active/.test(await page.locator("#landing").getAttribute("class"))); summary.checks++;
    assert.equal(errors.length, 0, `Browserfehler im Neustart-Szenario: ${errors.join(" | ")}`); summary.checks++;
    summary.scenarios++;

    // 4: Archivansicht und kontrollierte Rückkehr.
    await openOverview(page);
    await page.locator('#startArchiveTable .archive-record-row').first().locator('[data-ui-action="archive.openYear"]').evaluate(node => node.click());
    await page.waitForTimeout(30);
    const archiveContext = await page.evaluate(() => NKProBillingContext.snapshot());
    assert.equal(archiveContext.mode, "view"); summary.checks++;
    assert.equal(archiveContext.recordType, "archive"); summary.checks++;
    assert.equal((await page.locator('[data-global-billing-status]').textContent()).trim(), "Archiviert"); summary.checks++;
    assert.match(await page.locator('[data-global-billing-mode]').textContent(), /Nur ansehen/); summary.checks++;
    await page.locator('[data-global-billing-close]').click();
    await page.waitForTimeout(30);
    assert(/active/.test(await page.locator("#start").getAttribute("class"))); summary.checks++;
    assert.equal(await page.locator("#startArchiveTable tbody tr").count(), 5); summary.checks++;
    assert.equal(errors.length, 0, `Browserfehler im Archiv-Szenario: ${errors.join(" | ")}`); summary.checks++;
    summary.scenarios++;
    await page.close();

    // 5: Schmale Ansicht, Fokus und Tabellenkarten.
    boot = await bootPage(browser, { viewport:{ width:640, height:760 } });
    page=boot.page; errors=boot.errors;
    await openOverview(page);
    const cellLayout = await page.locator("#startArchiveTable .current-record-row td").first().evaluate(node => ({
      display:getComputedStyle(node).display,
      before:getComputedStyle(node, "::before").content
    }));
    assert.equal(cellLayout.display, "grid"); summary.checks++;
    assert.match(cellLayout.before, /Objekt/); summary.checks++;
    const widths = await page.evaluate(() => ({ scroll:document.documentElement.scrollWidth, client:document.documentElement.clientWidth }));
    assert(widths.scroll <= widths.client + 1, `Horizontales Überlaufen: ${widths.scroll}/${widths.client}`); summary.checks++;
    const firstEnabled = page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentEdit"]');
    await firstEnabled.focus();
    assert.equal(await firstEnabled.evaluate(node => document.activeElement === node), true); summary.checks++;
    assert.equal(errors.length, 0, `Browserfehler im Responsive-Szenario: ${errors.join(" | ")}`); summary.checks++;
    summary.scenarios++;
    await page.close();

    process.stdout.write(`AP19-Browser-Harness bestanden: ${summary.scenarios} Szenarien, ${summary.checks} Prüfungen mit ${executablePath}.\n`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  process.stderr.write(`FEHLER: ${error.stack || error.message}\n`);
  process.exit(1);
});
