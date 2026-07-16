"use strict";
const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("produktive Grundkomponenten werden zentral migriert", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  await expect(page.locator("html")).toHaveAttribute("data-nk-ui-ready", "1.1.0");
  const foundation = await page.evaluate(() => ({
    version:window.NKProUIDesignSystem?.version,
    package:window.NKProUIDesignSystem?.migration?.package,
    navItems:document.querySelectorAll(".workflow-nav .tab-btn").length,
    buttons:document.querySelectorAll(".nk-ui-button[data-nk-ui-component='button']").length,
    fields:document.querySelectorAll(".nk-ui-field[data-nk-ui-component='field']").length,
    cards:document.querySelectorAll(".nk-ui-card[data-nk-ui-component='card']").length,
    accordions:document.querySelectorAll(".nk-ui-accordion[data-nk-ui-component='accordion']").length,
    statuses:document.querySelectorAll(".nk-ui-status[data-nk-ui-component='status']").length,
    notices:document.querySelectorAll(".nk-ui-notice[data-nk-ui-component='notice']").length
  }));
  expect(foundation.version).toBe("1.1.0");
  expect(foundation.package).toBe("AP22B");
  expect(foundation.navItems).toBeGreaterThanOrEqual(13);
  expect(foundation.buttons).toBeGreaterThan(20);
  expect(foundation.fields).toBeGreaterThan(2);
  expect(foundation.cards).toBeGreaterThan(5);
  expect(foundation.accordions).toBeGreaterThan(40);
  expect(foundation.statuses).toBeGreaterThan(40);
  expect(foundation.notices).toBeGreaterThan(5);

  await page.locator("#landing .landing-choice").first().click();
  await expect(page.locator("#objektuebersicht")).toHaveClass(/active/);
  await page.evaluate(() => switchToTab("objekt"));
  await expect(page.locator("#objekt")).toHaveClass(/active/);
  const firstAccordion = page.locator("#objekt .page-section.nk-ui-accordion").first();
  await expect(firstAccordion).toBeVisible();
  await expect(firstAccordion.locator(":scope > summary")).toHaveCSS("display", "grid");
  await expect(firstAccordion).toHaveCSS("border-radius", "14px");
  await firstAccordion.locator(":scope > summary").click();
  await expect(firstAccordion).toHaveAttribute("open", "");

  await page.evaluate(() => {
    const host = document.querySelector("#objekt .page-section__body") || document.querySelector("#objekt");
    const wrapper = document.createElement("div");
    wrapper.id = "ap22bDynamicHarness";
    wrapper.innerHTML = '<button class="primary">Dynamische Aktion</button><label><span>Beispielwert</span><input value="42"></label><div class="hint warn">Dynamischer Warnhinweis</div><div class="overview-card">Dynamische Karte</div>';
    host.appendChild(wrapper);
  });
  await expect(page.locator("#ap22bDynamicHarness button")).toHaveClass(/nk-ui-button--primary/);
  await expect(page.locator("#ap22bDynamicHarness label")).toHaveClass(/nk-ui-field/);
  await expect(page.locator("#ap22bDynamicHarness .hint")).toHaveClass(/nk-ui-notice--warning/);
  await expect(page.locator("#ap22bDynamicHarness .overview-card")).toHaveClass(/nk-ui-card/);

  await page.locator("#objekt .app-page").screenshot({ path:"test-results/artifacts/ap22b-ui-base-components.png" });
  runtime.assertClean();
});
