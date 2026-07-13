"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixture, stableStateSnapshot } = require("./test-helpers.cjs");

test.describe.configure({ mode:"serial" });

async function activateCurrentBilling(page) {
  await openFreshApp(page);
  await loadFixture(page, "standardfall.json");
  await page.evaluate(() => {
    if (!state.meta) state.meta = {};
    state.meta.currentBillingCreatedByUser = true;
    state.meta.currentBillingCreatedAt = state.meta.currentBillingCreatedAt || new Date().toISOString();
    renderAll({ forceAll:true, reason:"ap15-active-billing" });
    switchToTab("start");
  });
}

test("Startseite, Objektvorbereitung und Abrechnungsübersicht bilden einen geschlossenen Bedienfluss", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await expect(page.locator("#landing")).toHaveClass(/active/);
  await page.locator('[data-ui-action="navigation.enterObjectPreparation"]').click();
  await expect(page.locator("#objektuebersicht")).toHaveClass(/active/);
  await page.locator('.nav-start-link[data-tab="landing"]').click();
  await expect(page.locator("#landing")).toHaveClass(/active/);
  await page.locator('[data-ui-action="navigation.enterBillingOverview"]').click();
  await expect(page.locator("#start")).toHaveClass(/active/);
  runtime.assertClean();
});

test("Kontextwechsel schließen Dialoge, Kopfmenüs und nichtfachliche Auswahlzustände", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await activateCurrentBilling(page);
  await page.evaluate(() => {
    switchToTab("einstellungen");
    selectedCostRows.add(0);
    costShowAllRows = true;
    openCostSelectionDialog();
    const help = document.getElementById("workspaceHelpPanel");
    const trigger = document.getElementById("workspaceHelpButton");
    help.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  });
  await page.evaluate(() => switchToTab("landing"));
  const stateAfter = await page.evaluate(() => ({
    active:document.querySelector("section.tab.active")?.id,
    costDialogHidden:document.getElementById("costSelectionModal").hidden,
    helpHidden:document.getElementById("workspaceHelpPanel").hidden,
    helpExpanded:document.getElementById("workspaceHelpButton").getAttribute("aria-expanded"),
    selectedCount:selectedCostRows.size,
    showAll:costShowAllRows,
    costDialogClass:document.body.classList.contains("cost-dialog-open")
  }));
  expect(stateAfter).toEqual({
    active:"landing",
    costDialogHidden:true,
    helpHidden:true,
    helpExpanded:"false",
    selectedCount:0,
    showAll:false,
    costDialogClass:false
  });
  runtime.assertClean();
});

test("Aktive Abrechnung bleibt über sämtliche produktiven Arbeitsschritte erreichbar und kehrt sauber zurück", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await activateCurrentBilling(page);
  await page.locator("#startRecordsSection > summary").click();
  await page.getByRole("button", { name:"Bearbeiten", exact:true }).click();
  const tabs = ["mieter","einnahmen","einstellungen","manuellewerte","verbraeuche","umlage","qualitaet","vorauszahlungsanpassung","briefe","export"];
  for (const tab of tabs) {
    await page.locator(`.tab-btn[data-tab="${tab}"]`).click();
    await expect(page.locator(`#${tab}`)).toHaveClass(/active/);
    await expect(page.locator(`#${tab} .page-header__title`)).not.toHaveText("");
  }
  await page.locator('.nav-start-link[data-tab="landing"]').click();
  await expect(page.locator("#landing")).toHaveClass(/active/);
  await page.locator('[data-ui-action="navigation.enterBillingOverview"]').click();
  await expect(page.locator("#start")).toHaveClass(/active/);
  await page.locator("#startRecordsSection > summary").click();
  await expect(page.getByRole("button", { name:"Bearbeiten", exact:true })).toBeVisible();
  runtime.assertClean();
});

test("Neue Abrechnung archiviert den vorherigen Stand ohne Dialog- oder Auswahlreste", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await activateCurrentBilling(page);
  const result = await page.evaluate(() => {
    selectedCostRows.add(0);
    costShowAllRows = true;
    openCreateBillingModal();
    const currentYear = Number(state.meta.abrechnungsjahr);
    const targetYear = String(currentYear + 1);
    const execution = NK_PRO_MODULES.applicationActions.execute("yearTransition", "createBilling", [targetYear, targetYear + "-01-01", targetYear + "-12-31", { confirmed:true }]);
    renderAll({ forceAll:true, reason:"ap15-new-billing" });
    switchToTab("start");
    return {
      changed:execution.value.changed,
      targetYear,
      current:String(state.meta.abrechnungsjahr),
      archiveCount:state.jahresArchiv.length,
      createModalVisible:document.getElementById("billingCreateModal").classList.contains("show"),
      selectedCount:selectedCostRows.size,
      showAll:costShowAllRows,
      active:document.querySelector("section.tab.active")?.id,
      contextOpen:isBillingContextOpen()
    };
  });
  expect(result.changed).toBe(true);
  expect(result.current).toBe(result.targetYear);
  expect(result.archiveCount).toBeGreaterThan(0);
  expect(result.createModalVisible).toBe(false);
  expect(result.selectedCount).toBe(0);
  expect(result.showAll).toBe(false);
  expect(result.active).toBe("start");
  expect(result.contextOpen).toBe(false);
  runtime.assertClean();
});

test("Zähler-DUMMY bleibt bei Gesamtintegration zustandsneutral und Verbrauchserfassung produktiv", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await activateCurrentBilling(page);
  const before = await stableStateSnapshot(page);
  const beforeStorage = await page.evaluate(() => JSON.stringify(localStorage.__entries()));
  await page.evaluate(() => switchToTab("wasser"));
  await expect(page.locator("#wasser")).toContainText("DUMMY");
  const afterDummy = await stableStateSnapshot(page);
  const afterStorage = await page.evaluate(() => JSON.stringify(localStorage.__entries()));
  const withoutRuntimeTimestamps = value => JSON.parse(JSON.stringify(value, (key, item) => ["updatedAt", "updatedWithAppVersion"].includes(key) ? undefined : item));
  expect(withoutRuntimeTimestamps(afterDummy)).toEqual(withoutRuntimeTimestamps(before));
  const withoutNavigationPreference = value => {
    const entries = JSON.parse(value);
    delete entries["nkpro.workflowNavigation.v3"];
    delete entries["nkpro.workflowNavigation.v4"];
    return entries;
  };
  expect(withoutNavigationPreference(afterStorage)).toEqual(withoutNavigationPreference(beforeStorage));
  await page.evaluate(() => switchToTab("verbraeuche"));
  await expect(page.locator("#verbraeuche #waterMeterSettings")).toHaveCount(1);
  await expect(page.locator("#verbraeuche #meterCurrentSections")).toHaveCount(1);
  await expect(page.locator("#verbraeuche #meterConsumptionControl")).toHaveCount(1);
  await expect(page.locator("#verbraeuche .dummy-badge")).toHaveCount(0);
  runtime.assertClean();
});

test("App-Shell wird durch den realen Service Worker kontrolliert und startet offline", async ({ page, context }) => {
  test.skip(process.env.NKPRO_RUN_REAL_PWA_TEST !== "1", "Optionaler Loopback-/Gerätetest; Service-Worker-Semantik wird im regulären Service-Worker-Projekt vollständig geprüft.");
  const runtime = attachRuntimeGuards(page);
  await page.goto("/");
  await page.waitForFunction(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  await page.reload({ waitUntil:"domcontentloaded" });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload({ waitUntil:"domcontentloaded" });
  await expect(page).toHaveTitle(/NK-Pro V99\.4\.20/);
  await expect(page.locator("#landing")).toHaveClass(/active/);
  await context.setOffline(false);
  runtime.assertClean();
});
