"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixture } = require("./test-helpers.cjs");

test.describe.configure({ mode:"serial" });

async function activateBillingContext(page) {
  await openFreshApp(page);
  await loadFixture(page, "standardfall.json");
  await page.evaluate(() => {
    state.meta = state.meta || {};
    state.meta.currentBillingCreatedByUser = true;
    state.meta.currentBillingCreatedAt = state.meta.currentBillingCreatedAt || new Date().toISOString();
    renderAll({ forceAll:true, reason:"ap17-active-billing" });
    openCurrentBillingForEdit();
    switchToTab("mieter");
  });
}

test("Arbeitsweiche bleibt unverändert und öffnet beide neuen Bereichsübersichten", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await expect(page.locator("#landing .landing-choice")).toHaveCount(2);
  await expect(page.locator("#landing")).toHaveClass(/active/);

  await page.locator('[data-ui-action="navigation.enterObjectPreparation"]').click();
  await expect(page.locator("#objektuebersicht")).toHaveClass(/active/);
  await expect(page.locator('[data-area-dashboard="object"] .dashboard-entry')).toHaveCount(4);
  await expect(page.locator('[data-area-dashboard="object"] .dashboard-preview-notice')).toHaveCount(0);
  await expect(page.locator('[data-area-dashboard="object"] [data-value-kind="dummy"]')).toHaveCount(1);

  await page.locator('.nav-start-link[data-tab="landing"]').click();
  await page.locator('[data-ui-action="navigation.enterBillingOverview"]').click();
  await expect(page.locator("#start")).toHaveClass(/active/);
  await expect(page.locator('[data-area-dashboard="billing"] .workflow-stage')).toHaveCount(10);
  await expect(page.locator('[data-area-dashboard="billing"] .dashboard-preview-notice')).toHaveCount(0);
  await expect(page.locator('[data-area-dashboard="billing"] [data-value-kind="dummy"]')).toHaveCount(0);

  const audit = await page.evaluate(() => auditV992Structure());
  expect(audit.allPassed).toBe(true);
  expect(audit.checks.productiveDashboardValues).toBe(true);
  expect(audit.checks.controlledContext).toBe(true);
  runtime.assertClean();
});

test("Bearbeitungsseiten starten ohne generische Kachelraster", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const pages = ["objekt","wohnungsverwaltung","wasser","mieterverwaltung","archiv","sicherung"];
  for (const tab of pages) {
    await page.evaluate(id => switchToTab(id), tab);
    await expect(page.locator(`#${tab}`)).toHaveClass(/active/);
    await expect(page.locator(`#${tab} .overview-grid`)).toHaveCount(0);
    await expect(page.locator(`#${tab} .area-dashboard`)).toHaveCount(0);
  }
  runtime.assertClean();
});

test("Navigationsgruppen bleiben unabhängig geöffnet und speichern ihren Zustand", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const objectToggle = page.locator('[data-nav-toggle="group-object"]');
  const billingToggle = page.locator('[data-nav-toggle="group-billing"]');
  const extrasToggle = page.locator('[data-nav-toggle="group-extras"]');

  await expect(objectToggle).toHaveAttribute("aria-expanded", "true");
  await billingToggle.focus();
  await page.keyboard.press("Enter");
  await expect(billingToggle).toHaveAttribute("aria-expanded", "true");
  await expect(objectToggle).toHaveAttribute("aria-expanded", "true");

  await extrasToggle.click();
  await expect(extrasToggle).toHaveAttribute("aria-expanded", "true");
  await expect(billingToggle).toHaveAttribute("aria-expanded", "true");
  await expect(objectToggle).toHaveAttribute("aria-expanded", "true");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nkpro.workflowNavigation.v4")));
  expect(saved).toEqual(expect.arrayContaining(["group-object","group-billing","group-extras"]));

  await objectToggle.click();
  await expect(objectToggle).toHaveAttribute("aria-expanded", "false");
  await page.evaluate(() => switchToTab("objekt"));
  await expect(objectToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator('.tab-btn[data-tab="objekt"]')).toHaveAttribute("aria-current", "page");
  runtime.assertClean();
});

test("Globale Kontextleiste ersetzt den alten Sidebar-Kontext und schließt zur Übersicht", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await activateBillingContext(page);
  await expect(page.locator("[data-nav-billing-context-panel]")).toHaveCount(0);
  const bar = page.locator("[data-global-billing-context]");
  await expect(bar).toBeVisible();
  await expect(bar.locator("[data-global-billing-object]")).not.toHaveText("");
  const billingCode = await page.evaluate(() => String(currentObjectShortCode()));
  await expect(bar.locator("[data-global-billing-code]")).toHaveText(billingCode);
  await expect(bar.locator("[data-global-billing-year]")).not.toHaveText("–");
  await expect(bar.locator("[data-global-billing-status]")).toHaveText(/In Bearbeitung|Abgeschlossen|Archiviert/);

  await bar.locator("[data-global-billing-close]").click();
  await expect(page.locator("#start")).toHaveClass(/active/);
  await expect(bar).toBeVisible();
  await expect(bar.locator("[data-global-billing-object]")).toHaveText("Keine Abrechnung geöffnet");
  await expect(bar.locator("[data-global-billing-mode]")).toHaveText("Keine Abrechnung geöffnet");
  runtime.assertClean();
});

test("Klappboxen verwenden lokale SVG-Chevrons und bleiben per Tastatur bedienbar", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await page.evaluate(() => switchToTab("objekt"));
  const details = page.locator("#objekt details.page-section").first();
  const summary = details.locator("summary");
  await expect(summary.locator(".page-section__chevron svg")).toHaveCount(1);
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(details).not.toHaveAttribute("open", "");
  runtime.assertClean();
});

test("Dashboards und Kontextleiste bleiben bei schmalen und niedrigen Fenstern ohne horizontale Überlagerung", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await page.setViewportSize({ width:760, height:620 });
  await openFreshApp(page);
  await page.locator('[data-ui-action="navigation.enterObjectPreparation"]').click();
  const objectMetrics = await page.evaluate(() => ({ scrollWidth:document.documentElement.scrollWidth, clientWidth:document.documentElement.clientWidth, height:document.querySelector("#objektuebersicht .page-header").getBoundingClientRect().height }));
  expect(objectMetrics.scrollWidth).toBeLessThanOrEqual(objectMetrics.clientWidth + 1);
  expect(objectMetrics.height).toBeLessThan(150);

  await loadFixture(page, "standardfall.json");
  await page.evaluate(() => {
    state.meta = state.meta || {};
    state.meta.currentBillingCreatedByUser = true;
    state.meta.currentBillingCreatedAt = state.meta.currentBillingCreatedAt || new Date().toISOString();
    renderAll({ forceAll:true, reason:"ap17-responsive-context" });
    openCurrentBillingForEdit();
    switchToTab("mieter");
  });
  const contextMetrics = await page.evaluate(() => {
    const bar=document.querySelector("[data-global-billing-context]");
    const rect=bar.getBoundingClientRect();
    return { scrollWidth:document.documentElement.scrollWidth, clientWidth:document.documentElement.clientWidth, top:rect.top, bottom:rect.bottom, viewport:window.innerHeight };
  });
  expect(contextMetrics.scrollWidth).toBeLessThanOrEqual(contextMetrics.clientWidth + 1);
  expect(contextMetrics.top).toBeGreaterThanOrEqual(0);
  expect(contextMetrics.bottom).toBeLessThanOrEqual(contextMetrics.viewport);
  runtime.assertClean();
});
