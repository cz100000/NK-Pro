"use strict";
const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test("Zentrale Dialoge und Inhaltszustände sind barrierefrei und geschützt", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  await expect(page.locator("html")).toHaveAttribute("data-nk-ui-ready", "1.3.0");
  const api = await page.evaluate(() => ({
    version:window.NKProUIDesignSystem?.version,
    package:window.NKProUIDesignSystem?.migration?.package,
    components:Array.from(window.NKProUIDesignSystem?.migration?.components || []),
    stateTypes:Array.from(window.NKProUIDesignSystem?.states?.types || []),
    dialogs:document.querySelectorAll(".nk-ui-dialog[data-nk-ui-component='dialog']").length
  }));
  expect(api.version).toBe("1.3.0");
  expect(api.package).toBe("AP22D");
  expect(api.components).toEqual(["dialog", "emptyState"]);
  expect(api.stateTypes).toEqual(["no-data", "not-created", "filtered", "loading", "error", "not-applicable", "unavailable"]);
  expect(api.dialogs).toBeGreaterThanOrEqual(5);

  await page.locator("#landing .landing-choice").nth(1).click();
  const createTrigger = page.locator('[data-ui-action="billing.openCreateModal"]');
  await expect(createTrigger).toBeVisible();
  await createTrigger.focus();
  await createTrigger.click();
  const createDialog = page.locator("#billingCreateModal");
  await expect(createDialog).toHaveClass(/show/);
  await expect(createDialog.locator(".nk-ui-dialog")).toHaveAttribute("role", "dialog");
  await expect(createDialog.locator(".nk-ui-dialog")).toHaveAttribute("aria-modal", "true");
  await expect(page.locator("#newBillingYear")).toBeFocused();
  await expect(createDialog.locator('[data-ui-action="billing.createFromModal"]')).toHaveClass(/nk-ui-button--primary/);
  await expect(createDialog.locator('[data-ui-action="billing.closeCreateModal"]')).toHaveClass(/nk-ui-button--secondary/);
  await page.keyboard.press("Escape");
  await expect(createDialog).not.toHaveClass(/show/);
  await expect(createTrigger).toBeFocused();
  await createTrigger.click();
  await expect(createDialog).toHaveClass(/show/);
  await createDialog.click({ position:{ x:4, y:4 } });
  await expect(createDialog).not.toHaveClass(/show/);
  await expect(createTrigger).toBeFocused();

  await page.evaluate(() => {
    const trigger = document.createElement("button");
    trigger.id = "ap22dDeleteTrigger";
    trigger.type = "button";
    trigger.textContent = "Löschdialog testen";
    document.body.appendChild(trigger);
    trigger.focus();
    window.NKProUIDesignSystem.dialog.open("billingDeleteModal");
  });
  const deleteDialog = page.locator("#billingDeleteModal");
  await expect(deleteDialog).toHaveClass(/show/);
  await expect(page.locator("#deleteBillingCodeInput")).toBeFocused();
  await expect(deleteDialog.locator('[data-ui-action="billing.confirmDelete"]')).toHaveClass(/nk-ui-button--danger/);
  await page.keyboard.press("Escape");
  await expect(deleteDialog).toHaveClass(/show/);
  await deleteDialog.click({ position:{ x:4, y:4 } });
  await expect(deleteDialog).toHaveClass(/show/);
  await deleteDialog.locator('[data-ui-action="billing.closeDeleteModal"]').click();
  await expect(deleteDialog).not.toHaveClass(/show/);
  await expect(page.locator("#ap22dDeleteTrigger")).toBeFocused();

  await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "ap22dDialogHarness";
    host.innerHTML = `
      <button id="ap22dHarnessTrigger" type="button">Dialog öffnen</button>
      <div class="modal-backdrop" data-nk-ui-backdrop-close="true" data-nk-ui-escape="true" id="ap22dHarnessLayer">
        <div aria-labelledby="ap22dHarnessTitle" class="modal-card" role="dialog">
          <div class="nk-ui-dialog__header"><h3 id="ap22dHarnessTitle">Tastaturdialog</h3></div>
          <div class="nk-ui-dialog__body"><button id="ap22dFirst" type="button">Erste Aktion</button><button id="ap22dLast" type="button">Letzte Aktion</button></div>
        </div>
      </div>`;
    document.body.appendChild(host);
    const trigger = document.getElementById("ap22dHarnessTrigger");
    trigger.focus();
    window.NKProUIDesignSystem.upgrade(host);
    window.NKProUIDesignSystem.dialog.open("ap22dHarnessLayer");
  });
  const harnessLayer = page.locator("#ap22dHarnessLayer");
  await expect(harnessLayer).toHaveClass(/show/);
  await expect(page.locator("#ap22dFirst")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#ap22dLast")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#ap22dFirst")).toBeFocused();
  await page.locator("#ap22dFirst").press("Enter");
  await page.locator("#ap22dLast").press("Space");
  await page.keyboard.press("Escape");
  await expect(harnessLayer).not.toHaveClass(/show/);
  await expect(page.locator("#ap22dHarnessTrigger")).toBeFocused();

  await page.evaluate(() => {
    const trigger = document.createElement("button");
    trigger.id = "ap22dQualityTrigger";
    trigger.type = "button";
    trigger.textContent = "Prüfpunktdetails testen";
    document.body.appendChild(trigger);
    trigger.focus();
    window.NKProUIDesignSystem.dialog.open("qualityDetailDialog");
  });
  await expect(page.locator("#qualityDetailDialog")).toHaveAttribute("open", "");
  await expect(page.locator("#qualityDetailDialog")).toHaveClass(/nk-ui-dialog--wide/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#qualityDetailDialog")).not.toHaveAttribute("open", "");
  await expect(page.locator("#ap22dQualityTrigger")).toBeFocused();

  await page.evaluate(() => {
    document.querySelectorAll(".tab.active").forEach(tab => tab.classList.remove("active"));
    document.getElementById("einstellungen").classList.add("active");
    window.openCostSelectionDialog();
  });
  await expect(page.locator("#costSelectionModal")).not.toHaveAttribute("hidden", "");
  await expect(page.locator("#costSelectionSearch")).toBeFocused();
  await page.locator("#costSelectionSearch").fill("kein-treffer-ap22d");
  await expect(page.locator("#costSelectionDialogContent .cost-dialog-empty")).toHaveClass(/nk-ui-empty-state--filtered/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#costSelectionModal")).toHaveAttribute("hidden", "");

  await page.evaluate(() => {
    const host = document.createElement("section");
    host.id = "ap22dStatesHarness";
    document.body.appendChild(host);
    const types = ["no-data", "not-created", "filtered", "loading", "error", "not-applicable", "unavailable"];
    types.forEach(type => {
      const slot = document.createElement("div");
      slot.id = "ap22dState-" + type;
      host.appendChild(slot);
      window.NKProUIDesignSystem.states.render(slot, { type });
    });
    const dynamic = document.createElement("div");
    dynamic.id = "ap22dDynamicState";
    dynamic.dataset.nkUiState = "filtered";
    dynamic.textContent = "Dynamisch nachgeladener Leerzustand";
    host.appendChild(dynamic);

    const protectedArea = document.createElement("div");
    protectedArea.id = "ap22dProtectedArea";
    protectedArea.className = "brief-preview-host";
    protectedArea.innerHTML = '<div data-nk-ui-state="error" id="ap22dProtectedState">Dokumentzustand</div><div class="modal-backdrop" id="ap22dProtectedDialog"><div class="modal-card" role="dialog">Dokumentdialog</div></div>';
    host.appendChild(protectedArea);
    window.NKProUIDesignSystem.upgrade(protectedArea);
  });

  for (const type of ["no-data", "not-created", "filtered", "loading", "error", "not-applicable", "unavailable"]) {
    const state = page.locator(`#ap22dState-${type} > .nk-ui-empty-state`);
    await expect(state).toHaveClass(new RegExp(`nk-ui-empty-state--${type}`));
    await expect(state.locator(".nk-ui-empty-state__title")).not.toHaveText("");
  }
  await expect(page.locator("#ap22dState-loading > .nk-ui-empty-state")).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#ap22dState-error > .nk-ui-empty-state")).toHaveAttribute("role", "alert");
  await expect(page.locator("#ap22dDynamicState")).toHaveClass(/nk-ui-empty-state--filtered/);
  await expect(page.locator("#ap22dDynamicState .nk-ui-empty-state__description")).toContainText("Dynamisch nachgeladener Leerzustand");
  await expect(page.locator("#individualValuesEmpty")).toHaveClass(/nk-ui-empty-state--filtered/);
  await expect(page.locator("#ap22dProtectedState")).not.toHaveClass(/nk-ui-empty-state/);
  await expect(page.locator("#ap22dProtectedDialog .modal-card")).not.toHaveClass(/nk-ui-dialog/);
  await expect(page.locator(".brief-preview-host .nk-ui-dialog")).toHaveCount(0);

  await page.setViewportSize({ width:520, height:760 });
  await page.evaluate(() => {
    switchToTab("start");
    window.NKProUIDesignSystem.dialog.open("billingCreateModal");
  });
  await expect(createDialog).toHaveClass(/show/);
  const responsiveBox = await createDialog.locator(".nk-ui-dialog").boundingBox();
  const responsiveButtonBox = await createDialog.locator(".nk-ui-dialog__footer .nk-ui-button").first().boundingBox();
  expect(responsiveBox).not.toBeNull();
  expect(responsiveButtonBox).not.toBeNull();
  expect(responsiveBox.width).toBeLessThanOrEqual(504);
  expect(responsiveButtonBox.width).toBeGreaterThanOrEqual(responsiveBox.width - 40);
  await page.keyboard.press("Escape");

  await page.locator("#ap22dStatesHarness").screenshot({ path:"test-results/artifacts/ap22d-ui-dialogs-states.png" });
  runtime.assertClean();
});
