"use strict";

const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { openFreshApp, attachRuntimeGuards, root } = require("./test-helpers.cjs");

const screenshotDir = path.join(root, "test-results", "ap21b-screenshots");

async function openCurrentAndReturnToOverview(page, mode = "edit") {
  await page.evaluate(() => switchToTab("start"));
  const action = mode === "view" ? "billing.openCurrentView" : "billing.openCurrentEdit";
  await page.locator(`[data-ui-action="${action}"]`).first().click();
  await page.evaluate(() => switchToTab("start"));
  await expect(page.locator("#start")).toHaveClass(/active/);
}

test("AP21B: Navigation und dynamische Abrechnungsübersicht", async ({ page }) => {
  const guard = attachRuntimeGuards(page);
  await page.setViewportSize({ width:1120, height:1350 });
  await openFreshApp(page);
  await page.evaluate(() => switchToTab("start"));

  await expect(page.locator("#billingPeriodSection,#billingPeriodSettings")).toHaveCount(0);
  await expect(page.locator(".billing-overview-panel--work")).toHaveCount(0);
  await expect(page.locator(".billing-records-table tbody tr")).toHaveCount(5);
  await expect(page.locator(".billing-filter")).toHaveCount(4);
  await expect(page.locator('[data-ui-action="billing.openCurrentEdit"]')).toBeVisible();
  await expect(page.locator('[data-ui-action="archive.openYear"]')).toHaveCount(4);
  await expect(page.locator('[data-ui-action="archive.reopenForRework"]')).toHaveCount(4);

  await openCurrentAndReturnToOverview(page, "edit");
  await expect(page.locator("[data-global-billing-context]")).toBeVisible();
  await expect(page.locator("[data-global-billing-year]")).toContainText("2025");
  await expect(page.locator("[data-global-billing-mode]")).toHaveText("Bearbeiten");
  await expect(page.locator(".billing-overview-panel--work")).toBeVisible();
  await expect(page.locator(".billing-work-table tbody tr")).toHaveCount(6);
  await expect(page.locator('[data-workflow-step="mieter"]')).toContainText("Mietverhältnisse");
  await expect(page.locator('[data-workflow-step="einnahmen"]')).toContainText("Vorauszahlungen");
  await expect(page.locator('[data-workflow-step="einstellungen"]')).toContainText("Gesamtkosten");
  await expect(page.locator('[data-workflow-step="manuellewerte"]')).toContainText("Individuelle Werte");
  await expect(page.locator('[data-workflow-step="umlage"]')).toContainText("Abrechnungsergebnis");
  await expect(page.locator('[data-workflow-step="qualitaet"]')).toContainText("Prüfung");
  await expect(page.locator(".billing-next-box")).toContainText("Als Nächstes:");

  await page.locator('[data-billing-overview-filter="archived"]').click();
  await expect(page.locator('.billing-records-table tbody tr[data-billing-record-status="archived"]')).toHaveCount(4);
  await page.locator('[data-billing-overview-filter="all"]').click();
  await page.locator('[data-billing-overview-page-size]').selectOption("5");
  await expect(page.locator(".billing-records-table tbody tr")).toHaveCount(5);

  const sidebarWidth = await page.locator("#appSidebar").evaluate(node => Math.round(node.getBoundingClientRect().width));
  expect(sidebarWidth).toBe(256);
  await expect(page.locator('.nav-group-item[data-tab="objektuebersicht"]')).toHaveCount(0);
  await expect(page.locator(".nav-start-entry")).toHaveCount(0);
  await expect(page.locator('.nav-group-item[data-tab="start"]')).toHaveClass(/active/);
  const archiveBorder = await page.locator('.nav-group-item[data-tab="archiv"]').evaluate(node => getComputedStyle(node).borderTopWidth);
  expect(archiveBorder).toBe("0px");

  await page.locator('[data-nav-group-section="object"] .nav-group-toggle').click();
  await expect(page.locator("#nav-group-object")).toBeHidden();
  await page.locator('[data-nav-group-section="object"] .nav-group-toggle').click();
  await expect(page.locator("#nav-group-object")).toBeVisible();

  await page.locator("#appSidebar").screenshot({ path:path.join(screenshotDir, "AP21B_Navigation.png") });
  await page.screenshot({ path:path.join(screenshotDir, "AP21B_Abrechnungsuebersicht.png"), fullPage:true });
  guard.assertClean();
});

test("AP21B: alle Zähler-Unterklappboxen rendern bei manuellem Öffnen und Direkteinstieg", async ({ page }) => {
  const guard = attachRuntimeGuards(page);
  await openFreshApp(page);
  await openCurrentAndReturnToOverview(page, "edit");
  await page.evaluate(() => switchToTab("manuellewerte"));
  await expect(page.locator("#manuellewerte")).toHaveClass(/active/);

  const outer = page.locator("#individualValuesMeterSource");
  await outer.locator(":scope > summary").click();
  await expect(outer).toHaveAttribute("open", "");

  const checks = [
    ["#meterHouseSection", "#waterMeterSettings"],
    ["#meterEntrySection", "#meterCurrentSections"],
    ["#meterTenantSection", "#meterConsumptionControl"],
    ["#meterHistorySection", "#meterHistory"],
    ["#meterControlSection", "#meterControlSummary"]
  ];
  for (const [detailsSelector, contentSelector] of checks) {
    const details = page.locator(detailsSelector);
    if (await details.getAttribute("open") !== null) await details.locator(":scope > summary").click();
    await details.locator(":scope > summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(page.locator(contentSelector)).not.toBeEmpty();
    await expect(page.locator(contentSelector)).toBeVisible();
  }

  await page.evaluate(() => {
    NKProStateAccess.transact(next => {
      const antenna = next.kostenarten.find(row => row && row.id === "K017");
      if (antenna) {
        antenna.inNK = "Ja";
        antenna.umlageschluessel = "Wohnfläche";
        antenna.berechnungsart = "Automatisch";
      }
    }, { commit:false, render:false });
    renderIndividualValues();
  });
  const heatCard = page.locator('[data-individual-cost="K006"] .individual-cost-icon--heat');
  const satelliteCard = page.locator('[data-individual-cost="K017"] .individual-cost-icon--satellite');
  await expect(heatCard).toBeVisible();
  await expect(satelliteCard).toBeVisible();
  expect(await heatCard.locator("svg").count()).toBe(1);
  expect(await satelliteCard.locator("svg").count()).toBe(1);

  await page.evaluate(() => {
    const panel = document.getElementById("individualValuesMeterSource");
    panel.open = false;
    globalThis.NKProIndividualValues.requestFocus({ source:"automatic" });
    renderIndividualValues();
    const button = document.querySelector("[data-individual-open-meter-source]");
    if (button) button.click();
    else { renderWaterMeters(); panel.open = true; }
  });
  await expect(outer).toHaveAttribute("open", "");
  await expect(page.locator("#meterCurrentSections")).not.toBeEmpty();
  guard.assertClean();
});

test("AP21B: Ansichtsmodus bleibt schreibgeschützt", async ({ page }) => {
  const guard = attachRuntimeGuards(page);
  await openFreshApp(page);
  await openCurrentAndReturnToOverview(page, "view");
  await expect(page.locator("[data-global-billing-mode]")).toHaveText("Nur ansehen");
  await page.evaluate(() => switchToTab("manuellewerte"));
  await expect(page.locator("#manuellewerte .billing-readonly-notice:visible")).toBeVisible();
  const saveAction = page.locator('#manuellewerte [data-ui-action="application.save"]');
  await expect(saveAction).toHaveCount(1);
  await expect(saveAction).toBeDisabled();
  const enabledWriteActions = await page.locator('[data-ui-action="billing.setManualExternalValue"]:not(:disabled)').count();
  expect(enabledWriteActions).toBe(0);
  guard.assertClean();
});
