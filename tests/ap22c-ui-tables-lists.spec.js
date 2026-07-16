"use strict";
const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("Tabellen, Listen und Tabellenwerkzeuge werden zentral migriert", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  await expect(page.locator("html")).toHaveAttribute("data-nk-ui-ready", "1.2.0");
  const state = await page.evaluate(() => ({
    version:window.NKProUIDesignSystem?.version,
    package:window.NKProUIDesignSystem?.migration?.package,
    tables:document.querySelectorAll(".app-page .nk-ui-table[data-nk-ui-component='table']").length,
    wraps:document.querySelectorAll(".app-page .nk-ui-table-wrap[data-nk-ui-component='table-wrap']").length,
    toolbars:document.querySelectorAll(".app-page .nk-ui-toolbar[data-nk-ui-component='toolbar']").length,
    lists:document.querySelectorAll(".nk-ui-list[data-nk-ui-component='list']").length,
    navigation:document.querySelectorAll(".workflow-nav .tab-btn").length
  }));
  expect(state.version).toBe("1.2.0");
  expect(state.package).toBe("AP22C");
  expect(state.tables).toBeGreaterThanOrEqual(20);
  expect(state.wraps).toBeGreaterThanOrEqual(20);
  expect(state.toolbars).toBeGreaterThanOrEqual(7);
  expect(state.lists).toBeGreaterThanOrEqual(1);
  expect(state.navigation).toBeGreaterThanOrEqual(13);

  await page.locator("#landing .landing-choice").first().click();
  await page.evaluate(() => switchToTab("wohnungsverwaltung"));
  await expect(page.locator("#wohnungsverwaltung")).toHaveClass(/active/);
  const unitSection = page.locator("#masterUnitSection");
  await unitSection.locator(":scope > summary").click();
  await expect(unitSection).toHaveAttribute("open", "");
  await expect(page.locator("#startUnitTable")).toHaveClass(/nk-ui-table/);
  await expect(page.locator("#startUnitTable").locator("xpath=ancestor::div[contains(@class,'table-wrap')][1]" )).toHaveClass(/nk-ui-table-wrap/);
  await expect(page.locator("#startUnitTable thead th").first()).toHaveAttribute("scope", "col");
  await expect(page.locator("#startUnitTable thead th").first()).toHaveCSS("color", "rgb(255, 255, 255)");

  await page.evaluate(() => {
    const host = document.querySelector("#wohnungsverwaltung .page-section__body") || document.querySelector("#wohnungsverwaltung");
    const harness = document.createElement("div");
    harness.id = "ap22cDynamicHarness";
    harness.innerHTML = `
      <div class="table-tools"><input type="search" placeholder="Dynamische Tabelle filtern"><button type="button">Leeren</button></div>
      <div class="table-wrap dashboard-table"><table id="ap22cDynamicTable"><thead><tr><th>Name</th><th>Wert</th></tr></thead><tbody><tr><td>A</td><td>1</td></tr></tbody></table></div>
      <ul class="context-quality-list"><li>Erster Punkt</li><li>Zweiter Punkt</li></ul>`;
    host.appendChild(harness);

    const preview = document.querySelector("#briefPreview") || document.body;
    const excluded = document.createElement("div");
    excluded.id = "ap22cExcludedHarness";
    excluded.className = "brief-preview-host";
    excluded.innerHTML = '<table id="ap22cDocumentTable"><thead><tr><th>Dokument</th></tr></thead><tbody><tr><td>Unverändert</td></tr></tbody></table>';
    preview.appendChild(excluded);
  });

  await expect(page.locator("#ap22cDynamicHarness .table-tools")).toHaveClass(/nk-ui-toolbar--compact/);
  await expect(page.locator("#ap22cDynamicHarness input[type='search']")).toHaveClass(/nk-ui-toolbar__search/);
  await expect(page.locator("#ap22cDynamicHarness .table-wrap")).toHaveClass(/nk-ui-table-wrap/);
  await expect(page.locator("#ap22cDynamicTable")).toHaveClass(/nk-ui-table--compact/);
  await expect(page.locator("#ap22cDynamicTable th").first()).toHaveAttribute("scope", "col");
  await expect(page.locator("#ap22cDynamicTable th").first()).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page.locator("#ap22cDynamicHarness .context-quality-list")).toHaveClass(/nk-ui-list--divided/);
  await expect(page.locator("#ap22cDocumentTable")).not.toHaveClass(/nk-ui-table/);

  await page.locator("#wohnungsverwaltung .app-page").screenshot({ path:"test-results/artifacts/ap22c-ui-tables-lists.png" });
  runtime.assertClean();
});
