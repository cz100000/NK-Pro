"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("UI-Controller und zentrale Ereignisdelegation sind vollständig und einmalig aktiv", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const result = await page.evaluate(() => {
    const before = NKProUiEvents.describe();
    NKProUiEvents.start({ root:document });
    const after = NKProUiEvents.describe();
    const controllers = NKProUiController.describe();
    return {
      before, after,
      controllerCount:controllers.length,
      actionCount:controllers.reduce((sum, item) => sum + item.actionCount, 0),
      duplicateCount:controllers.flatMap(item => item.actionNames).length - new Set(controllers.flatMap(item => item.actionNames)).size,
      inlineCount:document.querySelectorAll("[onclick],[onchange],[oninput],[onsubmit],[onkeydown]").length,
      legacyActionCount:document.querySelectorAll("[data-app-action]").length,
      removedGlobals:["ensureNavigationPath","refreshWorkspaceChrome","updateWorkflowNavigationContext","applyNavTreeState","setOpenNavigationGroup"].filter(name => typeof window[name] !== "undefined"),
      frozen:[NKProStateAccess,NKProUiController,NKProUiBindings,NKProUiEvents,NKProNavigation,NKProModalEvents].every(Object.isFrozen)
    };
  });
  expect(result.before).toMatchObject({ started:true, listenerCount:5 });
  expect(result.after).toMatchObject({ started:true, listenerCount:5 });
  expect(result.controllerCount).toBe(13);
  expect(result.actionCount).toBe(99);
  expect(result.duplicateCount).toBe(0);
  expect(result.inlineCount).toBe(0);
  expect(result.legacyActionCount).toBe(0);
  expect(result.removedGlobals).toEqual([]);
  expect(result.frozen).toBe(true);
  runtime.assertClean();
});

test("Deklarative UI-Aktionen aktualisieren Navigation und AP5-Zählerdaten", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await page.locator('#landing [data-ui-action="navigation.enterObjectPreparation"]').click();
  await expect(page.locator("#objekt")).toHaveClass(/active/);

  const result = await page.evaluate(() => {
    const before = JSON.stringify(state.zaehlerDaten || null);
    NKProUiController.dispatch("meter.setWaterValue", { args:[0, "kwEnd", "321", "number"] });
    return {
      value:state.waterMeters.readings[0].kwEnd,
      meteringChanged:before !== JSON.stringify(state.zaehlerDaten || null),
      dummyExcluded:(state.zaehlerDaten?.zaehler || []).filter(row => row.typ === "electricity-dummy").every(row => row.abrechnungsrelevant === false)
    };
  });
  expect(result.value).toBe(321);
  expect(result.meteringChanged).toBe(true);
  expect(result.dummyExcluded).toBe(true);
  runtime.assertClean();
});
