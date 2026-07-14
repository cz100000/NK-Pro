"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { root, attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

async function createActiveBilling(page) {
  await page.evaluate(() => {
    state.meta = state.meta || {};
    state.meta.currentBillingCreatedByUser = true;
    state.meta.currentBillingCreatedAt = state.meta.currentBillingCreatedAt || new Date().toISOString();
    renderAll({ forceAll: true, reason: "playwright-active-billing" });
    switchToTab("start");
  });
}

test("Start, Version, Seitenstruktur und interne Audits sind fehlerfrei", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  await expect(page).toHaveTitle("NK-Pro V99.4.22 – AP19-Produktive Bereichsübersichten und kontrollierter Abrechnungskontext");
  const result = await page.evaluate(() => {
    const release = window.NKProDiagnostics.releaseAuditReport();
    const selfReport = window.NKProDiagnostics.appSelfTestReport();
    const selfRows = selfReport.rows;
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
      renderErrors: JSON.parse(JSON.stringify(renderErrors || [])),
      landingChoices: document.querySelectorAll("#landing .landing-choice").length,
      contextHidden: document.querySelector("[data-global-billing-context]")?.hidden,
      navCount:document.querySelectorAll(".tab-btn.nav-group-item[data-tab]").length
    };
  });

  expect(result.version).toBe("V99.4.22");
  expect(result.versionName).toBe("AP19-Produktive Bereichsübersichten und kontrollierter Abrechnungskontext");
  expect(result.schema).toBe(5);
  expect(result.activeTab).toBe("landing");
  expect(result.structure.allPassed).toBe(true);
  expect(result.navCount).toBe(18);
  expect(result.release.errors).toBe(0);
  expect(result.release.warnings).toBe(0);
  expect(result.release.ok).toBeGreaterThanOrEqual(28);
  expect(result.self.errors).toBe(0);
  expect(result.self.ok).toBeGreaterThanOrEqual(30);
  expect(result.renderErrors).toEqual([]);
  expect(result.landingChoices).toBe(2);
  expect(result.contextHidden).toBe(true);
  runtime.assertClean();
});

test("Landingpage besitzt genau zwei Arbeitswege", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const choices = page.locator("#landing .landing-choice");
  await expect(choices).toHaveCount(2);
  await expect(choices.nth(0)).toContainText("Objekt vorbereiten");
  await expect(choices.nth(1)).toContainText("Nebenkosten abrechnen");

  await choices.nth(0).click();
  await expect(page.locator("#objektuebersicht")).toHaveClass(/active/);
  await page.locator(".sidebar-brand-home").click();
  await expect(page.locator("#landing")).toHaveClass(/active/);
  await choices.nth(1).click();
  await expect(page.locator("#start")).toHaveClass(/active/);
  await expect(page.locator('[data-nav-toggle="group-billing"]')).toHaveAttribute("aria-expanded", "true");
  runtime.assertClean();
});

test("Accordion-Navigation ist logisch gruppiert und per Tastatur bedienbar", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const groupLabels = await page.locator(".workflow-nav > .nav-group .nav-group-label").allTextContents();
  expect(groupLabels.map(label => label.trim())).toEqual(["Objekt vorbereiten", "Nebenkosten abrechnen", "Archiv", "Extras"]);

  const toggles = page.locator(".nav-group-toggle[data-nav-toggle]");
  await expect(toggles).toHaveCount(4);
  await expect(toggles.nth(0)).toHaveAttribute("aria-expanded", "true");
  await expect(toggles.nth(1)).toHaveAttribute("aria-expanded", "false");

  await toggles.nth(2).focus();
  await page.keyboard.press("Enter");
  await expect(toggles.nth(2)).toHaveAttribute("aria-expanded", "true");
  await expect(toggles.nth(0)).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#nav-group-archive")).toBeVisible();
  await expect(page.locator("#nav-group-object")).toBeVisible();

  const expandedCount = await toggles.evaluateAll(nodes => nodes.filter(node => node.getAttribute("aria-expanded") === "true").length);
  expect(expandedCount).toBe(2);
  runtime.assertClean();
});

test("Jeder Navigationspunkt öffnet genau seinen Tab", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const nonBillingTabs = ["objektuebersicht","objekt", "wohnungsverwaltung", "wasser", "mieterverwaltung", "start", "archiv", "sicherung"];
  for (const tabId of nonBillingTabs) {
    await page.evaluate(id => switchToTab(id), tabId);
    await expect(page.locator(`#${tabId}`)).toHaveClass(/active/);
    await expect(page.locator(`.tab-btn[data-tab="${tabId}"]`)).toHaveClass(/active/);
    expect(await page.locator("section.tab.active").count()).toBe(1);
  }

  await createActiveBilling(page);
  const billingTabs = ["mieter", "einstellungen", "einnahmen", "manuellewerte", "verbraeuche", "umlage", "vorauszahlungsanpassung", "qualitaet", "briefe", "export"];
  for (const tabId of billingTabs) {
    await page.evaluate(id => switchToTab(id), tabId);
    await expect(page.locator(`#${tabId}`)).toHaveClass(/active/);
    await expect(page.locator(`.tab-btn[data-tab="${tabId}"]`)).toHaveClass(/active/);
    expect(await page.locator("section.tab.active").count()).toBe(1);
  }

  runtime.assertClean();
});

test("Aktive Abrechnung erscheint nur im geöffneten Arbeitskontext", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const panel = page.locator("[data-global-billing-context]");
  await expect(panel).toBeHidden();

  await createActiveBilling(page);
  await expect(panel).toBeHidden();
  await page.evaluate(() => openCurrentBilling());
  await expect(panel).toBeVisible();
  await expect(page.locator("[data-global-billing-status]")).toHaveText("In Bearbeitung");
  await expect(page.locator("[data-global-billing-object]")).not.toHaveText("");
  await expect(page.locator("[data-global-billing-year]")).not.toHaveText("");

  await page.evaluate(() => {
    state.meta.currentBillingFinalized = true;
    state.meta.currentBillingFinalizationKey = window.NKProBillingWorkflow.currentBillingFinalizationKey();
    NKProNavigation.updateWorkflowNavigationContext();
  });
  await expect(page.locator("[data-global-billing-status]")).toHaveText("Finalisiert");

  await page.evaluate(() => {
    state.meta.archiveViewer = true;
    setBillingContextOpen(true);
    NKProNavigation.updateWorkflowNavigationContext();
  });
  await expect(page.locator("[data-global-billing-status]")).toHaveText("Nur Ansicht");

  await page.evaluate(() => {
    state.meta.archiveViewer = false;
    switchToTab("start");
  });
  await expect(panel).toBeHidden();
  runtime.assertClean();
});

test("Archiv ist eigenständig erreichbar und öffnet die Nur-Ansicht", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await page.evaluate(() => switchToTab("archiv"));
  await expect(page.locator("#archiv")).toHaveClass(/active/);
  expect(await page.locator("#archiveRecordsTable tbody .archive-record-row").count()).toBeGreaterThan(0);

  await page.evaluate(() => openArchiveYear(0));
  await expect(page.locator("#mieter")).toHaveClass(/active/);
  await expect(page.locator("[data-global-billing-context]")).toBeVisible();
  await expect(page.locator("[data-global-billing-status]")).toHaveText("Nur Ansicht");
  expect(await page.evaluate(() => isArchiveViewer())).toBe(true);

  await page.evaluate(() => closeArchiveViewer());
  await expect(page.locator("#archiv")).toHaveClass(/active/);
  await expect(page.locator("[data-global-billing-context]")).toBeHidden();
  runtime.assertClean();
});

test("Manifest und PWA-Version stimmen mit der Anwendung überein", async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
  const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
  expect(manifest.version).toBe("99.4.22");
  expect(manifest.name).toContain("V99.4.22");
  expect(worker).toContain('const CACHE_NAME = "nk-pro-v99-4-22-ap19";');
  expect(worker).toContain('"./index.html"');
  expect(worker).toContain('"./manifest.webmanifest"');
});

test("V99.4.22 lädt produktive Styles und Skripte ausschließlich aus separaten Dateien", async ({ page, request }) => {
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
  for (const expected of ["js/ui-preferences.js", "js/navigation.js", "js/modal-events.js", "js/persistence.js", "js/migration.js", "js/backup-recovery.js", "js/meter-master.js", "js/meter-readings.js", "js/meter-periods.js", "js/meter-validation.js", "js/object-standard.js", "js/billing-snapshot.js", "js/archive.js", "js/archive-actions.js", "js/year-transition-actions.js", "js/quality-assurance.js", "js/diagnostics.js", "js/billing-calculation.js", "js/document-data.js", "js/document-renderer.js", "js/export-service.js", "js/ui-table-tools.js", "js/app-bootstrap.js", "js/compatibility.js", "js/default-seed.js", "js/runtime-diagnostics.js", "js/app-runtime-config.js", "js/app-state-persistence.js", "js/ui-master-data.js", "js/ui-quality.js", "js/ui-costs.js", "js/ui-navigation-pages.js", "js/ui-archive-pages.js", "js/browser-io.js", "js/ui-metering.js", "js/ui-billing-allocation.js", "js/ui-documents.js", "js/ui-table-actions.js", "js/ui-diagnostics.js", "js/ui-page-controller.js", "js/app.js", "js/service-worker-register.js"]) {
    expect(loaded.scripts.some(resource => resource.includes(expected))).toBeTruthy();
  }
});

test("Navigation ist entschlackt und K002 bleibt ausschließlich bei den Zählerständen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  expect(await page.locator('[data-tab="dashboard"]').count()).toBe(0);
  expect(await page.locator("#dashboard").count()).toBe(0);
  const groupOrder = await page.locator(".workflow-nav > section").evaluateAll(nodes => nodes.map(node => node.dataset.navGroupSection));
  expect(groupOrder).toEqual(["object", "billing", "archive", "extras"]);
  await createActiveBilling(page);
  await page.evaluate(() => enterBillingMode("manuellewerte"));
  await expect(page.locator("#manualExternalValuesTable tbody")).not.toContainText("K002");
  await page.evaluate(() => switchToTab("verbraeuche"));
  await expect(page.locator("#verbraeuche")).toHaveClass(/active/);
  const mode = await page.evaluate(() => manualInputModeForCost(state.kostenarten.find(k => k.id === "K002")));
  expect(mode).toBe("Zählerstände");
  runtime.assertClean();
});
