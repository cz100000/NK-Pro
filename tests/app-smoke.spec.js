"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { root, attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("Start, Version, Seitenstruktur und interne Audits sind fehlerfrei", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  await expect(page).toHaveTitle("NK-Pro V99.3.0 – Navigation und Qualitätsprüfung");
  const result = await page.evaluate(() => {
    const release = releaseAuditReport();
    const selfRows = appSelfTestReport();
    const selfSummary = selfRows.reduce((summary, row) => {
      const key = row.severity === "OK" ? "ok" : (row.severity === "Fehler" ? "errors" : "warnings");
      summary[key] += 1;
      return summary;
    }, { ok: 0, warnings: 0, errors: 0 });
    return {
      version: APP_VERSION,
      versionName: APP_VERSION_NAME,
      schema: DATA_SCHEMA_VERSION,
      activeTab: document.querySelector("section.tab.active")?.id,
      structure: auditV992Structure(),
      release: release.summary,
      self: selfSummary,
      renderErrors: JSON.parse(JSON.stringify(renderErrors || []))
    };
  });

  expect(result.version).toBe("V99.3.0");
  expect(result.versionName).toBe("Navigation und vollständige Qualitätsprüfung");
  expect(result.schema).toBe(5);
  expect(result.activeTab).toBe("start");
  expect(result.structure.allPassed).toBe(true);
  expect(result.structure.tabCount).toBe(14);
  expect(result.release).toMatchObject({ errors: 0, warnings: 0, ok: 28 });
  expect(result.self.errors).toBe(0);
  expect(result.self.ok).toBeGreaterThanOrEqual(30);
  expect(result.renderErrors).toEqual([]);
  runtime.assertClean();
});

test("Jeder Navigationspunkt öffnet genau seinen Tab", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const startTabs = ["start", "mieterverwaltung", "wohnungsverwaltung", "sicherung"];
  for (const tabId of startTabs) {
    await page.locator(`.tab-btn[data-tab="${tabId}"]`).click();
    await expect(page.locator(`#${tabId}`)).toHaveClass(/active/);
    await expect(page.locator(`.tab-btn[data-tab="${tabId}"]`)).toHaveClass(/active/);
  }

  const billingTabs = ["mieter", "einstellungen", "einnahmen", "wasser", "manuellewerte", "umlage", "vorauszahlungsanpassung", "qualitaet", "briefe", "export"];
  await page.evaluate(() => enterBillingMode("mieter"));
  for (const tabId of billingTabs) {
    await page.evaluate(id => switchToTab(id), tabId);
    await expect(page.locator(`#${tabId}`)).toHaveClass(/active/);
    await expect(page.locator(`.tab-btn[data-tab="${tabId}"]`)).toHaveClass(/active/);
    const activeCount = await page.locator("section.tab.active").count();
    expect(activeCount).toBe(1);
  }

  runtime.assertClean();
});

test("Manifest und PWA-Version stimmen mit der Anwendung überein", async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
  const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  expect(manifest.version).toBe("99.3.0");
  expect(manifest.name).toContain("V99.3.0");
  expect(worker).toContain('const CACHE_NAME = "nk-pro-v99-3-0";');
  expect(worker).toContain('"./index.html"');
  expect(worker).toContain('"./manifest.webmanifest"');
});

test("V99.3.0 lädt produktive Styles und Skripte ausschließlich aus separaten Dateien", async ({ page, request }) => {
  const response = await request.get("/index.html");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('<link href="./assets/app.css" rel="stylesheet"/>');
  expect(html).toMatch(/<script\s+defer(?:=\"\")?\s+src=\"\.\/js\/app\.js\"><\/script>/);
  expect(html).not.toMatch(/<style\b/i);
  expect(html).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/i);

  await openFreshApp(page);
  const loaded = await page.evaluate(() => ({
    styles: [...document.styleSheets].map(sheet => sheet.href || ""),
    scripts: [...document.scripts].map(script => script.src || "")
  }));
  expect(loaded.styles.some(resource => resource.includes("assets/app.css"))).toBeTruthy();
  for (const expected of ["js/navigation.js", "js/modal-events.js", "js/app.js", "js/service-worker-register.js"]) {
    expect(loaded.scripts.some(resource => resource.includes(expected))).toBeTruthy();
  }
});


test("Navigation ist entschlackt und K002 bleibt ausschließlich bei den Zählerständen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  expect(await page.locator('[data-tab="dashboard"]').count()).toBe(0);
  expect(await page.locator('#dashboard').count()).toBe(0);
  const order = await page.locator('.workflow-nav > section').evaluateAll(nodes => nodes.map(n => n.className));
  expect(order[0]).toContain('nav-static-master');
  expect(order[1]).toContain('nav-static-overview');
  await page.evaluate(() => enterBillingMode("manuellewerte"));
  await expect(page.locator('#manualExternalValuesTable tbody')).not.toContainText('K002');
  await page.evaluate(() => switchToTab("wasser"));
  await expect(page.locator('#wasser')).toHaveClass(/active/);
  const mode = await page.evaluate(() => manualInputModeForCost(state.kostenarten.find(k => k.id === "K002")));
  expect(mode).toBe("Zählerstände");
  runtime.assertClean();
});
