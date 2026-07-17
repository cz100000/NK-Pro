"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

async function dialogState(page) {
  return page.locator("#qualityDetailDialog").evaluate(node => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      open:node.hasAttribute("open"),
      display:style.display,
      visible:!!(rect.width || rect.height),
      bodyOpen:document.body.classList.contains("nk-ui-dialog-open")
    };
  });
}

for (const viewport of [
  { width:1440, height:1000 },
  { width:900, height:620 },
  { width:390, height:844 }
]) {
  test(`geschlossener Prüfpunktdialog bleibt unsichtbar ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const runtime = attachRuntimeGuards(page);
    await page.setViewportSize(viewport);
    await openFreshApp(page);

    const state = await dialogState(page);
    expect(state.open).toBeFalsy();
    expect(state.display).toBe("none");
    expect(state.visible).toBeFalsy();
    expect(state.bodyOpen).toBeFalsy();
    await expect(page.locator("#qualityDetailDialog")).toBeHidden();

    const pageBottom = await page.evaluate(() => ({
      viewport:innerHeight,
      bodyHeight:document.body.scrollHeight,
      dialogTop:document.getElementById("qualityDetailDialog").getBoundingClientRect().top
    }));
    expect(pageBottom.dialogTop).toBe(0);
    expect(runtime.errors).toEqual([]);
  });
}

test("Prüfpunktdialog öffnet und schließt weiterhin mit Fokus-Rückgabe", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  await page.evaluate(() => {
    const trigger = document.createElement("button");
    trigger.id = "ap22f1cQualityTrigger";
    trigger.type = "button";
    trigger.textContent = "Prüfpunktdetails öffnen";
    document.body.appendChild(trigger);
    trigger.focus();
    window.NKProUIDesignSystem.dialog.open("qualityDetailDialog", { trigger });
  });

  const dialog = page.locator("#qualityDetailDialog");
  await expect(dialog).toHaveAttribute("open", "");
  await expect(dialog).toBeVisible();
  const closeButton = dialog.locator('[aria-label="Detailansicht schließen"]');
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();
  expect((await dialogState(page)).display).toBe("flex");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(dialog).toBeHidden();
  await expect(page.locator("#ap22f1cQualityTrigger")).toBeFocused();
  expect((await dialogState(page)).display).toBe("none");

  await page.evaluate(() => {
    const trigger = document.getElementById("ap22f1cQualityTrigger");
    trigger.focus();
    window.NKProUIDesignSystem.dialog.open("qualityDetailDialog", { trigger });
  });
  await expect(dialog).toBeVisible();
  await dialog.click({ position:{ x:2, y:2 } });
  await expect(dialog).toBeHidden();
  await expect(page.locator("#ap22f1cQualityTrigger")).toBeFocused();
  expect(runtime.errors).toEqual([]);
});

test("nicht-native zentrale Dialoglayer bleiben unverändert bedienbar", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await page.locator("#landing .landing-choice").nth(1).click();

  const createTrigger = page.locator('[data-ui-action="billing.openCreateModal"]');
  await createTrigger.focus();
  await createTrigger.click();
  const createDialog = page.locator("#billingCreateModal");
  await expect(createDialog).toHaveClass(/show/);
  await expect(page.locator("#newBillingYear")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(createDialog).not.toHaveClass(/show/);
  await expect(createTrigger).toBeFocused();

  await page.evaluate(() => {
    const trigger = document.createElement("button");
    trigger.id = "ap22f1cDeleteTrigger";
    trigger.type = "button";
    trigger.textContent = "Löschen testen";
    document.body.appendChild(trigger);
    trigger.focus();
    window.NKProUIDesignSystem.dialog.open("billingDeleteModal", { trigger });
  });
  const deleteDialog = page.locator("#billingDeleteModal");
  await expect(deleteDialog).toHaveClass(/show/);
  await page.keyboard.press("Escape");
  await expect(deleteDialog).toHaveClass(/show/);
  await deleteDialog.locator('[data-ui-action="billing.closeDeleteModal"]').click();
  await expect(deleteDialog).not.toHaveClass(/show/);
  await expect(page.locator("#ap22f1cDeleteTrigger")).toBeFocused();
  expect(runtime.errors).toEqual([]);
});

test("Navigationsversion entspricht APP_VERSION und wird zentral nachgeführt", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const version = page.locator("[data-app-version]");
  await expect(version).toHaveCount(1);
  await expect(version).toHaveText("V99.4.36");
  const values = await page.evaluate(() => ({
    runtime:APP_VERSION,
    label:document.querySelector("[data-app-version]")?.textContent,
    build:document.querySelector('meta[name="nk-pro-build"]')?.content
  }));
  expect(values).toEqual({ runtime:"V99.4.36", label:"V99.4.36", build:"99.4.36-ap22f1c" });

  await version.evaluate(node => { node.textContent = "V0.0.0"; });
  await page.evaluate(() => updateAllPageHeaders());
  await expect(version).toHaveText("V99.4.36");
  expect(runtime.errors).toEqual([]);
});
