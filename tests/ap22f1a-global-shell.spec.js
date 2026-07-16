"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { openFreshApp } = require("./test-helpers.cjs");
const root = path.resolve(__dirname, "..");

function inlineReferenceHtml() {
  const html = fs.readFileSync(path.join(root, "ui-reference", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "ui-reference", "reference.css"), "utf8");
  return html
    .replace(/<link[^>]+href="reference\.css"[^>]*>/i, `<style>${css}</style>`)
    .replace(/<script[^>]+src="reference\.js"[^>]*><\/script>/i, "");
}

const viewports = [
  { width:1440, height:1000, padding:32 },
  { width:1280, height:900, padding:24 },
  { width:1024, height:800, padding:24 },
  { width:900, height:620, padding:24 },
  { width:620, height:800, padding:16 },
  { width:390, height:844, padding:16 }
];
const visiblePages = ["landing","objektuebersicht","objekt","archiv","start","mieterverwaltung","wohnungsverwaltung","sicherung","qualitaet","einstellungen","mieter","einnahmen","wasser","manuellewerte","umlage","vorauszahlungsanpassung","briefe","export"];

async function openOverview(page) {
  await page.evaluate(() => switchToTab("start"));
  await expect(page.locator("#start")).toHaveClass(/active/);
}
async function assertContextWithoutMode(page) {
  const context = page.locator("[data-global-billing-context]");
  await expect(context).toBeVisible();
  await expect(context.locator("[data-global-billing-object]")).toHaveCount(1);
  await expect(context.locator("[data-global-billing-period]")).toHaveCount(1);
  await expect(context.locator("[data-global-billing-status]")).toHaveCount(1);
  await expect(context.locator("[data-global-billing-mode],[data-global-billing-year]")).toHaveCount(0);
  await expect(context).not.toContainText(/Modus\s*:/i);
  const order = await context.evaluate(node => {
    const all = [...node.querySelectorAll("*")];
    return ["[data-global-billing-object]","[data-global-billing-period]","[data-global-billing-status]"].map(selector => all.indexOf(node.querySelector(selector)));
  });
  expect(order[0]).toBeLessThan(order[1]);
  expect(order[1]).toBeLessThan(order[2]);
}

for (const viewport of viewports) {
  test(`Schale und Responsive-Verhalten ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openFreshApp(page);
    await expect(page.locator("#landing h1:visible")).toHaveCount(1);
    await expect(page.locator("#landing [data-page-shell]")).toHaveCount(1);
    await openOverview(page);
    await assertContextWithoutMode(page);
    const layout = await page.evaluate(() => {
      const shell = document.querySelector("section.tab.active [data-page-shell]");
      const style = getComputedStyle(shell);
      return {
        paddingLeft:parseFloat(style.paddingLeft),
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
        shellCount:document.querySelectorAll("section.tab.active [data-page-shell]").length,
        headerCount:document.querySelectorAll("section.tab.active [data-page-header]").length,
        h1Count:[...document.querySelectorAll("section.tab.active h1")].filter(el => getComputedStyle(el).display !== "none").length
      };
    });
    expect(layout.paddingLeft).toBe(viewport.padding);
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout).toMatchObject({ shellCount:1, headerCount:1, h1Count:1 });
  });
}

test("alle sichtbaren Ansichten besitzen genau eine Schale, einen Seitenkopf und ein H1", async ({ page }) => {
  await openFreshApp(page);
  await page.evaluate(() => openCurrentBillingForEdit());
  for (const id of visiblePages) {
    await page.evaluate(tab => switchToTab(tab), id);
    const active = page.locator(`#${id}`);
    await expect(active).toHaveClass(/active/);
    await expect(active.locator(":scope > [data-page-shell]")).toHaveCount(1);
    await expect(active.locator("[data-page-header]")).toHaveCount(1);
    await expect(active.locator("h1:visible")).toHaveCount(1);
  }
  await expect(page.locator(".workspace-header h1,.workspace-header h2")).toHaveCount(0);
});

test("Bearbeiten, Nur ansehen, Archiv und kein Kontext bleiben ohne Modusfeld", async ({ page }) => {
  await openFreshApp(page);
  await openOverview(page);
  await assertContextWithoutMode(page);
  await expect(page.locator("[data-global-billing-period]")).toHaveText("–");

  await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentEdit"]').click();
  await assertContextWithoutMode(page);
  await expect(page.locator("[data-global-billing-period]")).toHaveText(/^\d{2}\.\d{2}\.\d{4} – \d{2}\.\d{2}\.\d{4}$/);
  await page.locator("[data-global-billing-close]").click();

  await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentView"]').click();
  await assertContextWithoutMode(page);
  const notice = page.locator("section.tab.active .billing-readonly-notice");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("Diese Abrechnung ist schreibgeschützt.");
  await expect(notice.locator('[data-ui-action="billing.switchToEdit"]')).toHaveText("Zur Bearbeitung öffnen");
  await expect(page.locator("section.tab.active [data-page-header]")).not.toContainText(/^Schreibgeschützt$/);
  await page.locator("[data-global-billing-close]").click();

  await page.locator('#startArchiveTable .archive-record-row').first().locator('[data-ui-action="archive.openYear"]').click();
  await assertContextWithoutMode(page);
  await expect(page.locator("[data-global-billing-status]")).toHaveText("Archiviert");
});

test("Seitenkopfaktionen stapeln unter 620 px und Fokus bleibt sichtbar", async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await openFreshApp(page);
  await page.evaluate(() => switchToTab("objekt"));
  const actions = page.locator("#objekt [data-page-header] .page-header__actions");
  await expect(actions).toBeVisible();
  const layout = await actions.evaluate(node => ({ direction:getComputedStyle(node).flexDirection, width:node.getBoundingClientRect().width }));
  expect(layout.direction).toBe("column");
  expect(layout.width).toBeGreaterThan(200);
  const button = actions.locator("button").first();
  await button.focus();
  await expect(button).toBeFocused();
  const focus = await button.evaluate(node => {
    const r=node.getBoundingClientRect(), s=getComputedStyle(node);
    return { left:r.left, right:r.right, vw:innerWidth, outline:s.outlineStyle, boxShadow:s.boxShadow };
  });
  expect(focus.left).toBeGreaterThanOrEqual(0);
  expect(focus.right).toBeLessThanOrEqual(focus.vw);
  expect(focus.outline !== "none" || focus.boxShadow !== "none").toBeTruthy();
});

test("aktualisierte Referenzbibliothek zeigt die Kontextleiste ohne Modusangabe", async ({ page }) => {
  await page.setContent(inlineReferenceHtml(), { waitUntil:"load" });
  await expect(page).toHaveTitle(/AP22F1A/);
  await expect(page.locator("#shell .billing-context")).toHaveCount(5);
  await expect(page.locator("#shell")).not.toContainText(/Modus:\s*(?:Nur ansehen|Bearbeiten|Korrektur)/i);
  await expect(page.locator("#shell .notice--readonly")).toContainText("Zur Bearbeitung öffnen");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
