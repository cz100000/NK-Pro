"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixture } = require("./test-helpers.cjs");

test.describe.configure({ mode:"serial" });

async function openObjectOverview(page, mutate) {
  await openFreshApp(page);
  await loadFixture(page, "standardfall.json");
  await page.evaluate(source => {
    if (source) (0, eval)(`(${source})`)();
    renderOverviewForTab("objektuebersicht");
    switchToTab("objektuebersicht");
  }, mutate ? mutate.toString() : "");
  await expect(page.locator("#objektuebersicht")).toHaveClass(/active/);
  await expect(page.locator('[data-object-overview-task]')).toHaveCount(4);
}

async function expectPrimaryTarget(page, target, title) {
  const primary = page.locator('[data-object-overview-primary]');
  await expect(primary).toHaveAttribute("data-target", target);
  await expect(page.locator(".object-overview-summary__next h2")).toHaveText(title);
  await primary.click();
  await expect(page.locator(`#${target}`)).toHaveClass(/active/);
}

test("Objektvalidierung hat erste Priorität", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openObjectOverview(page, () => { state.objektStandard.objekt.id = ""; state.objektStandard.objekt.objektId = ""; });
  await expect(page.locator('[data-object-overview-task="object"] .nk-ui-status')).toHaveText("Blockiert");
  await expectPrimaryTarget(page, "objekt", "Objektdaten prüfen");
  runtime.assertClean();
});

test("unvollständige Wohnungen bestimmen die nächste Aktion", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openObjectOverview(page, () => { state.wohnungen[0].wohnflaeche = 0; });
  await expect(page.locator('[data-object-overview-task="units"] .nk-ui-status')).toContainText("4 von 5 vollständig");
  await expectPrimaryTarget(page, "wohnungsverwaltung", "Wohnungen vervollständigen");
  runtime.assertClean();
});

test("unvollständige Mietverhältnisse folgen nach vollständigen Wohnungen", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openObjectOverview(page, () => {
    const tenant = state.mieter.find(row => row && row.name && !String(row.abrechnungRolle || "").toLowerCase().includes("eigent"));
    tenant.einzug = "";
  });
  await expect(page.locator('[data-object-overview-task="tenancies"] .nk-ui-status')).toContainText("3 von 4 vollständig");
  await expectPrimaryTarget(page, "mieterverwaltung", "Mietverhältnisse vervollständigen");
  runtime.assertClean();
});

test("vollständige Vorbereitung führt zur Abrechnungsübersicht", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openObjectOverview(page);
  await expect(page.locator(".object-overview-summary__status")).toContainText("Vorbereitung vollständig");
  await expect(page.locator(".object-overview-summary__status")).toContainText("3 von 3 Bereichen vollständig");
  await expectPrimaryTarget(page, "start", "Nebenkostenabrechnung beginnen");
  runtime.assertClean();
});

test("vier Aufgabenkarten öffnen ausschließlich ihre bestehenden Zielseiten", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openObjectOverview(page);
  const targets = [
    ["object", "objekt"],
    ["units", "wohnungsverwaltung"],
    ["tenancies", "mieterverwaltung"],
    ["meter", "wasser"]
  ];
  for (const [key, target] of targets) {
    await page.locator(`[data-object-overview-task="${key}"]`).click();
    await expect(page.locator(`#${target}`)).toHaveClass(/active/);
    await page.evaluate(() => switchToTab("objektuebersicht"));
  }
  const meter = page.locator('[data-object-overview-task="meter"]');
  await expect(meter).toContainText("DUMMY");
  await expect(meter).toContainText("Clickdummy ohne Fachlogik");
  runtime.assertClean();
});

test("Tastaturreihenfolge und sichtbarer Fokus folgen der fachlichen Reihenfolge", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openObjectOverview(page);
  const primary = page.locator('[data-object-overview-primary]');
  await primary.focus();
  await expect(primary).toBeFocused();
  const focusStyle = await primary.evaluate(node => ({ outline:getComputedStyle(node).outlineStyle, shadow:getComputedStyle(node).boxShadow }));
  expect(focusStyle.outline !== "none" || focusStyle.shadow !== "none").toBe(true);
  for (const key of ["object", "units", "tenancies", "meter"]) {
    await page.keyboard.press("Tab");
    await expect(page.locator(`[data-object-overview-task="${key}"]`)).toBeFocused();
  }
  runtime.assertClean();
});

for (const viewport of [
  { width:1440, height:1000 },
  { width:1280, height:900 },
  { width:1024, height:800 },
  { width:900, height:620 },
  { width:620, height:800 },
  { width:390, height:844 }
]) {
  test(`Objektübersicht bleibt ohne Dokument-Overflow bei ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const runtime = attachRuntimeGuards(page);
    await page.setViewportSize(viewport);
    await openObjectOverview(page, () => { state.wohnungen[0].wohnflaeche = 0; });
    const dimensions = await page.evaluate(() => ({
      documentWidth:document.documentElement.scrollWidth,
      viewportWidth:document.documentElement.clientWidth,
      bodyWidth:document.body.scrollWidth,
      primaryVisible:!!document.querySelector('[data-object-overview-primary]')?.getClientRects().length
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
    expect(dimensions.primaryVisible).toBe(true);
    await expect(page.locator('[data-object-overview-primary]')).toBeVisible();
    runtime.assertClean();
  });
}

test("390 CSS-Pixel bilden die 200-Prozent-Zoomprüfung ohne Informationsverlust ab", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await page.setViewportSize({ width:390, height:844 });
  await openObjectOverview(page, () => { state.wohnungen[0].wohnflaeche = 0; });
  await expect(page.locator('[data-object-overview-task]')).toHaveCount(4);
  await expect(page.locator('[data-object-overview-primary]')).toBeVisible();
  await expect(page.locator('[data-object-overview-task="meter"]')).toContainText("Clickdummy ohne Fachlogik");
  runtime.assertClean();
});


test("übernommene Dialogausblendung bleibt im aktuellen Release wirksam", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const dialog = page.locator("#qualityDetailDialog");
  await expect(dialog).not.toBeVisible();
  const display = await dialog.evaluate(node => getComputedStyle(node).display);
  expect(display).toBe("none");
  runtime.assertClean();
});

test("zentrale Versionsanzeige entspricht V99.4.37 und wird wiederhergestellt", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const version = page.locator("[data-app-version]");
  await expect(version).toHaveText("V99.4.37");
  const values = await page.evaluate(() => ({
    runtime:APP_VERSION,
    build:document.querySelector('meta[name="nk-pro-build"]')?.content
  }));
  expect(values).toEqual({ runtime:"V99.4.37", build:"99.4.37-ap22f2b" });
  await version.evaluate(node => { node.textContent = "V0.0.0"; });
  await page.evaluate(() => updateAllPageHeaders());
  await expect(version).toHaveText("V99.4.37");
  runtime.assertClean();
});
