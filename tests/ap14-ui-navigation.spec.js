"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { root, attachRuntimeGuards, openFreshApp, loadFixture, stableStateSnapshot } = require("./test-helpers.cjs");

test.describe.configure({ mode: "serial" });

async function createActiveBilling(page, target = "start") {
  await page.evaluate(tabId => {
    state.meta = state.meta || {};
    state.meta.currentBillingCreatedByUser = true;
    state.meta.currentBillingCreatedAt = state.meta.currentBillingCreatedAt || new Date().toISOString();
    renderAll({ forceAll:true, reason:"ap14-active-billing" });
    switchToTab(tabId);
  }, target);
}

test("Zähler öffnet ausschließlich den zustandsneutralen DUMMY", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const beforeState = await stableStateSnapshot(page);
  const beforeStorage = await page.evaluate(() => JSON.stringify(localStorage.__entries()));

  await page.locator('.tab-btn[data-tab="wasser"]').click();
  await expect(page.locator("#wasser")).toHaveClass(/active/);
  await expect(page.locator('.tab-btn[data-tab="wasser"]')).toHaveClass(/active/);
  await expect(page.locator('.tab-btn[data-tab="wasser"]')).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#wasser .dummy-badge").first()).toContainText("DUMMY");
  await expect(page.locator("#wasser .meter-inventory-card")).toHaveCount(5);
  await expect(page.locator("#meterInventoryDummyTable tbody tr")).toHaveCount(7);
  await expect(page.locator("#wasser")).toContainText("ohne dauerhafte Speicherung");
  await expect(page.locator("#wasser select, #wasser textarea, #wasser [data-page-save]")).toHaveCount(0);
  await expect(page.locator("#wasser input")).toHaveCount(1);
  await expect(page.locator("#wasser input")).toHaveAttribute("placeholder", /Filter/i);
  await expect(page.locator("#wasser #meterCurrentSections, #wasser #waterMeterSettings")).toHaveCount(0);

  const afterState = await stableStateSnapshot(page);
  const afterStorage = await page.evaluate(() => JSON.stringify(localStorage.__entries()));
  const withoutRuntimeTimestamps = value => JSON.parse(JSON.stringify(value, (key, item) => ["updatedAt", "updatedWithAppVersion"].includes(key) ? undefined : item));
  expect(withoutRuntimeTimestamps(afterState)).toEqual(withoutRuntimeTimestamps(beforeState));
  expect(afterStorage).toBe(beforeStorage);
  runtime.assertClean();
});

test("Verbräuche erfassen enthält vollständig die bestehende produktive Verbrauchserfassung", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await createActiveBilling(page, "verbraeuche");

  await expect(page.locator("#verbraeuche")).toHaveClass(/active/);
  await expect(page.locator('.tab-btn[data-tab="verbraeuche"]')).toHaveClass(/active/);
  await expect(page.locator('.tab-btn[data-tab="verbraeuche"]')).toHaveAttribute("aria-current", "page");
  await expect(page.locator('[data-nav-toggle="group-billing"]')).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#verbraeuche .page-header__title")).toHaveText("Verbräuche erfassen");
  await expect(page.locator("#verbraeuche #waterMeterSettings")).toHaveCount(1);
  await expect(page.locator("#verbraeuche #meterCurrentSections")).toHaveCount(1);
  await expect(page.locator("#verbraeuche #meterConsumptionControl")).toHaveCount(1);
  await expect(page.locator("#verbraeuche #meterControlSummary")).toHaveCount(1);
  await expect(page.locator("#verbraeuche .dummy-badge")).toHaveCount(0);
  await expect(page.locator('#nav-group-billing > .nav-group-item .nav-item-label')).toHaveText([
    "Abrechnungsübersicht", "Mieter & Wohnungen", "Miete & Vorauszahlungen", "Kosten erfassen", "Manuelle & externe Werte",
    "Verbräuche erfassen", "Verteilung", "Prüfung", "Neue Vorauszahlungen", "Briefe", "Export"
  ]);
  runtime.assertClean();
});

test("App-Typografie und AP13-Brieftypografie bleiben sauber getrennt", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const appFonts = await page.evaluate(() => ({
    body:getComputedStyle(document.body).fontFamily,
    button:getComputedStyle(document.getElementById("workspaceHelpButton")).fontFamily,
    input:getComputedStyle(document.querySelector("input") || document.body).fontFamily
  }));
  expect(appFonts.body).toContain("Segoe UI");
  expect(appFonts.button).toContain("Segoe UI");

  await loadFixture(page, "standardfall.json");
  await page.evaluate(() => switchToTab("briefe"));
  const letterFont = await page.locator("#briefPreview").evaluate(node => {
    const rootNode = node.shadowRoot || node;
    return getComputedStyle(rootNode.querySelector(".nk-letter-document")).fontFamily;
  });
  expect(letterFont).toContain("Arial");
  expect(letterFont).not.toContain("Segoe UI");
  runtime.assertClean();
});

test("Hilfe und Menü sind im bestehenden Kopfbereich sichtbar und bedienbar", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  await expect(page.locator(".workspace-header")).toHaveCount(1);
  await expect(page.locator("#workspaceHelpButton")).toBeVisible();
  await expect(page.locator("#workspaceHelpButton")).toContainText("Hilfe");
  await expect(page.locator("#workspaceMenuButton")).toBeVisible();
  await expect(page.locator("#workspaceMenuButton")).toContainText("Menü");
  await expect(page.locator(".workspace-header [role=tablist], .workspace-header [role=tab]")).toHaveCount(0);

  await page.locator("#workspaceHelpButton").click();
  await expect(page.locator("#workspaceHelpPanel")).toBeVisible();
  await expect(page.locator("#workspaceHelpButton")).toHaveAttribute("aria-expanded", "true");
  await page.locator("#workspaceMenuButton").click();
  await expect(page.locator("#workspaceHelpPanel")).toBeHidden();
  await expect(page.locator("#workspaceMenuPanel")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#workspaceMenuPanel")).toBeHidden();
  runtime.assertClean();
});

test("Startseitenkacheln verwenden exakt die Icons ihrer Navigationsgruppen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const icons = await page.evaluate(() => {
    const canonical = node => node.outerHTML.replace(/\s+/g, " ").trim();
    return {
      objectNav:canonical(document.querySelector('[data-nav-toggle="group-object"] .nav-icon-svg')),
      objectTile:canonical(document.querySelector('[data-ui-action="navigation.enterObjectPreparation"] .nav-icon-svg')),
      billingNav:canonical(document.querySelector('[data-nav-toggle="group-billing"] .nav-icon-svg')),
      billingTile:canonical(document.querySelector('[data-ui-action="navigation.enterBillingOverview"] .nav-icon-svg'))
    };
  });
  expect(icons.objectTile).toBe(icons.objectNav);
  expect(icons.billingTile).toBe(icons.billingNav);
  runtime.assertClean();
});

test("Kopf, Navigation und Inhalt überlagern sich auch bei kleineren Fenstern nicht", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await page.setViewportSize({ width:900, height:720 });
  await openFreshApp(page);
  await page.locator("#sidebarToggle").click();
  await expect(page.locator("#appSidebar")).toBeInViewport();
  const narrow = await page.evaluate(() => {
    const sidebar = document.getElementById("appSidebar").getBoundingClientRect();
    const header = document.querySelector(".workspace-header").getBoundingClientRect();
    const main = document.querySelector(".app-main").getBoundingClientRect();
    const help = document.getElementById("workspaceHelpButton").getBoundingClientRect();
    const menu = document.getElementById("workspaceMenuButton").getBoundingClientRect();
    return {
      bodyWidth:document.documentElement.scrollWidth,
      viewport:innerWidth,
      sidebarRight:sidebar.right,
      headerLeft:header.left,
      mainLeft:main.left,
      actionsSeparate:help.right <= menu.left + 1,
      headerContained:menu.right <= innerWidth + 1
    };
  });
  expect(narrow.bodyWidth).toBeLessThanOrEqual(narrow.viewport + 1);
  expect(narrow.sidebarRight).toBeLessThanOrEqual(narrow.viewport + 1);
  expect(narrow.headerLeft).toBeGreaterThanOrEqual(0);
  expect(narrow.mainLeft).toBeGreaterThanOrEqual(0);
  expect(narrow.actionsSeparate).toBeTruthy();
  expect(narrow.headerContained).toBeTruthy();
  runtime.assertClean();
});

test("AP14-Referenzbilder werden bei angeforderter Erfassung erzeugt", async ({ page }) => {
  test.skip(process.env.NKPRO_CAPTURE_AP14_VISUALS !== "1", "Nur für die Release-Referenzerfassung.");
  const runtime = attachRuntimeGuards(page);
  const output = path.join(root, "AP14_VISUAL_REFERENCES");
  fs.mkdirSync(output, { recursive:true });
  await page.setViewportSize({ width:1366, height:768 });
  await openFreshApp(page);

  await page.locator('.tab-btn[data-tab="wasser"]').click();
  await page.screenshot({ path:path.join(output, "zaehler-dummy-1366x768.png"), fullPage:false });
  await createActiveBilling(page, "verbraeuche");
  await page.screenshot({ path:path.join(output, "verbraeuche-erfassen-1366x768.png"), fullPage:false });
  await page.evaluate(() => switchToTab("landing"));
  await page.locator("#workspaceHelpButton").click();
  await page.screenshot({ path:path.join(output, "start-und-hilfe-1366x768.png"), fullPage:false });
  runtime.assertClean();
});
