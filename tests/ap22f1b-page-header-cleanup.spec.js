"use strict";

const { test, expect } = require("@playwright/test");
const { openFreshApp } = require("./test-helpers.cjs");

const viewports = [
  { width:1440, height:1000 },
  { width:1280, height:900 },
  { width:1024, height:800 },
  { width:900, height:620 },
  { width:620, height:800 },
  { width:390, height:844 }
];
const savePages = ["objekt", "mieterverwaltung", "wohnungsverwaltung", "qualitaet", "einstellungen", "mieter", "einnahmen", "manuellewerte", "umlage", "vorauszahlungsanpassung", "briefe"];
const noSavePages = ["landing", "objektuebersicht", "archiv", "start", "sicherung", "wasser", "export"];
const metaRemovedPages = ["objekt", "archiv", "mieterverwaltung", "wohnungsverwaltung", "sicherung", "wasser"];

async function openForEdit(page) {
  await page.evaluate(() => openCurrentBillingForEdit());
  await expect(page.locator("body")).toHaveClass(/billing-context-open/);
}
async function switchTo(page, id) {
  await page.evaluate(tab => switchToTab(tab), id);
  await expect(page.locator(`#${id}`)).toHaveClass(/active/);
}
async function assertNoDocumentOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

for (const viewport of viewports) {
  test(`AP22F1B Zielzustände ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openFreshApp(page);
    await openForEdit(page);

    await switchTo(page, "objekt");
    await expect(page.locator("#objekt [data-page-header] [data-page-save]")).toBeVisible();
    await expect(page.locator("#objekt [data-page-header] .page-header__period,[data-page-save-status]")).toHaveCount(0);

    await switchTo(page, "archiv");
    await expect(page.locator("#archiv [data-page-header] [data-page-save],#archiv [data-page-header] .page-header__period")).toHaveCount(0);

    await switchTo(page, "mieterverwaltung");
    await expect(page.locator("#mieterverwaltung [data-page-header] [data-page-save]")).toBeVisible();
    await expect(page.locator("#mieterverwaltung [data-page-header] .page-header__period")).toHaveCount(0);

    await switchTo(page, "wohnungsverwaltung");
    await expect(page.locator("#wohnungsverwaltung [data-page-header] [data-page-save]")).toBeVisible();
    await expect(page.locator("#wohnungsverwaltung [data-page-header] .page-header__period")).toHaveCount(0);

    await switchTo(page, "sicherung");
    await expect(page.locator("#sicherung [data-page-header] [data-page-save],#sicherung [data-page-header] .page-header__period")).toHaveCount(0);
    expect(await page.locator('#sicherung [data-ui-action="export.downloadFullJson"]').count()).toBeGreaterThan(0);
    expect(await page.locator('#sicherung [data-ui-action="export.downloadFullPackage"]').count()).toBeGreaterThan(0);

    await switchTo(page, "wasser");
    await expect(page.locator("#wasser [data-page-header] .page-header__period")).toHaveCount(0);
    await expect(page.locator("#wasser")).toContainText(/DUMMY|Keine Fachfunktion/);

    await switchTo(page, "manuellewerte");
    await expect(page.locator('#manuellewerte [data-ui-action="application.save"]:visible')).toHaveCount(1);
    expect(await page.locator('#manuellewerte [data-individual-reset]').count()).toBeGreaterThan(0);

    await switchTo(page, "export");
    await expect(page.locator("#export [data-page-header] [data-page-save]")).toHaveCount(0);
    expect(await page.locator('#export [data-ui-action="export.downloadCurrentJson"]').count()).toBeGreaterThan(0);
    expect(await page.locator('#export [data-ui-action="system.print"]').count()).toBeGreaterThan(0);

    await expect(page.locator("section.tab [data-page-save-status]")).toHaveCount(0);
    await assertNoDocumentOverflow(page);
  });
}

test("exakte Kopfaktionsmatrix und AP22F1A-Struktur bleiben erhalten", async ({ page }) => {
  await openFreshApp(page);
  await openForEdit(page);
  for (const id of savePages) {
    await switchTo(page, id);
    await expect(page.locator(`#${id} [data-page-header] [data-page-save]:visible`)).toHaveCount(1);
  }
  for (const id of noSavePages) {
    await switchTo(page, id);
    await expect(page.locator(`#${id} [data-page-header] [data-page-save]`)).toHaveCount(0);
  }
  for (const id of metaRemovedPages) await expect(page.locator(`#${id} [data-page-header] .page-header__period`)).toHaveCount(0);
  for (const id of [...savePages, ...noSavePages]) {
    const active = page.locator(`#${id}`);
    await expect(active.locator(":scope > [data-page-shell]")).toHaveCount(1);
    await expect(active.locator("[data-page-header]")).toHaveCount(1);
    await expect(active.locator(":scope > [data-page-shell] > [data-page-header] h1")).toHaveCount(1);
  }
});

test("Nur ansehen blendet verbleibende Speicheraktionen aus und erhält Notice sowie Bearbeitungsöffnung", async ({ page }) => {
  await openFreshApp(page);
  await switchTo(page, "start");
  await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentView"]').click();
  await switchTo(page, "manuellewerte");
  await expect(page.locator('#manuellewerte [data-page-save]')).toBeHidden();
  await expect(page.locator('#manuellewerte [data-ui-action="application.save"]:visible')).toHaveCount(0);
  const notice = page.locator("#manuellewerte .billing-readonly-notice");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("Diese Abrechnung ist schreibgeschützt.");
  await expect(notice.locator('[data-ui-action="billing.switchToEdit"]')).toHaveText("Zur Bearbeitung öffnen");
  await expect(page.locator("[data-global-billing-context]")).not.toContainText(/Modus\s*:/i);
  await assertNoDocumentOverflow(page);
});

test("schmale Ansicht stapelt die verbleibende Kopfaktion und erhält sichtbaren Fokus", async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await openFreshApp(page);
  await openForEdit(page);
  await switchTo(page, "manuellewerte");
  const actions = page.locator("#manuellewerte [data-page-header] .page-header__actions");
  await expect(actions).toBeVisible();
  expect(await actions.evaluate(node => getComputedStyle(node).flexDirection)).toBe("column");
  const button = actions.locator("button");
  await button.focus();
  await expect(button).toBeFocused();
  const focus = await button.evaluate(node => {
    const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
    return { outline:style.outlineStyle, shadow:style.boxShadow, left:rect.left, right:rect.right, width:innerWidth };
  });
  expect(focus.outline !== "none" || focus.shadow !== "none").toBeTruthy();
  expect(focus.left).toBeGreaterThanOrEqual(0);
  expect(focus.right).toBeLessThanOrEqual(focus.width);
  await assertNoDocumentOverflow(page);
});
