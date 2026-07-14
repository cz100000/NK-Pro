"use strict";
const { test, expect }=require("@playwright/test");

async function openBillingOverview(page){
  await page.locator('[data-nav-toggle="group-billing"]').click();
  await page.locator('.tab-btn[data-tab="start"]').click();
  await expect(page.locator('#start')).toHaveClass(/active/);
}

test.beforeEach(async({page})=>{
  await page.goto("/");
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await expect(page.locator('#landing')).toHaveClass(/active/);
});

test("AP19 startet geschlossen und zeigt produktive zentrale Abrechnungsübersicht",async({page})=>{
  const initial=await page.evaluate(()=>window.NKProBillingContext.describe());
  expect(initial.stateCount).toBe(3);
  expect(initial.context.mode).toBe("closed");
  await openBillingOverview(page);
  await expect(page.locator('[data-global-billing-context]')).toBeVisible();
  await expect(page.locator('[data-global-billing-object]')).toHaveText("Keine Abrechnung geöffnet");
  await expect(page.locator('[data-global-billing-mode]')).toContainText("Keine Abrechnung geöffnet");
  await expect(page.locator('[data-requires-billing="true"]').first()).toHaveAttribute("aria-disabled","true");
  await expect(page.locator('[data-area-dashboard="billing"]')).toContainText("Öffnen Sie zuerst eine Abrechnung zur Bearbeitung oder Ansicht.");
  await expect(page.locator('[data-area-dashboard="billing"]')).not.toContainText("Vorschau");
  await expect(page.locator('#startArchiveTable thead th')).toHaveCount(9);
  await expect(page.locator('#startArchiveTable tbody tr')).toHaveCount(5);
  await expect(page.locator('#startArchiveTable')).toContainText("Zur Korrektur öffnen");
});

test("Ansehen sperrt UI und programmgesteuerte Schreibzugriffe",async({page})=>{
  await openBillingOverview(page);
  await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentView"]').click();
  await expect(page.locator('#mieter')).toHaveClass(/active/);
  await expect(page.locator('[data-global-billing-mode]')).toContainText("Nur ansehen");
  await expect(page.locator('#mieter .billing-readonly-notice')).toContainText("Schreibgeschützte Ansicht");
  await expect(page.locator('#mieter [data-page-save]')).toBeHidden();
  const protectedResult=await page.evaluate(()=>{
    const before=window.state.meta.abrechnungsjahr;
    try{window.NKProApplicationActions.execute("billing","setYear",["2030"]);return {blocked:false,before,after:window.state.meta.abrechnungsjahr};}
    catch(error){return {blocked:error&&error.code==="NKPRO_BILLING_READONLY",message:error.message,before,after:window.state.meta.abrechnungsjahr};}
  });
  expect(protectedResult.blocked).toBe(true);
  expect(protectedResult.after).toBe(protectedResult.before);
  expect(protectedResult.message).toBe("Diese Abrechnung ist im Ansichtsmodus geöffnet und kann nicht geändert werden.");
  await expect(page.locator('#mieter input:not([type="search"])').first()).toHaveAttribute("readonly","");
});

test("Schließen, Dirty-State und Reload behalten keinen offenen Kontext",async({page})=>{
  await openBillingOverview(page);
  await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentEdit"]').click();
  await expect(page.locator('[data-global-billing-mode]')).toContainText("Bearbeiten");
  await page.evaluate(()=>window.NKProBillingContext.markDirty(true));
  page.once("dialog",async dialog=>{expect(dialog.message()).toContain("ungespeicherte Änderungen");await dialog.dismiss();});
  await page.locator('[data-global-billing-close]').click();
  await expect(page.locator('[data-global-billing-mode]')).toContainText("Bearbeiten");
  page.once("dialog",async dialog=>{await dialog.accept();});
  await page.locator('[data-global-billing-close]').click();
  await expect(page.locator('#start')).toHaveClass(/active/);
  await expect(page.locator('[data-global-billing-object]')).toHaveText("Keine Abrechnung geöffnet");
  await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentEdit"]').click();
  await page.reload();
  await expect(page.locator('#landing')).toHaveClass(/active/);
  const context=await page.evaluate(()=>window.NKProBillingContext.snapshot());
  expect(context.mode).toBe("closed");
});

test("Archiv wird nur angesehen und kehrt beim Schließen zur Übersicht zurück",async({page})=>{
  await openBillingOverview(page);
  await page.locator('#startArchiveTable .archive-record-row').first().locator('[data-ui-action="archive.openYear"]').click();
  await expect(page.locator('[data-global-billing-status]')).toHaveText("Archiviert");
  await expect(page.locator('[data-global-billing-mode]')).toContainText("Nur ansehen");
  await expect(page.locator('.billing-readonly-notice')).toBeVisible();
  await page.locator('[data-global-billing-close]').click();
  await expect(page.locator('#start')).toHaveClass(/active/);
  await expect(page.locator('#startArchiveTable tbody tr')).toHaveCount(5);
});

test("Responsive Abrechnungsliste bleibt in schmaler Ansicht bedienbar",async({page})=>{
  await page.setViewportSize({width:640,height:760});
  await openBillingOverview(page);
  await expect(page.locator('#startArchiveTable .current-record-row')).toBeVisible();
  const layout=await page.locator('#startArchiveTable .current-record-row td').first().evaluate(node=>({display:getComputedStyle(node).display,before:getComputedStyle(node,'::before').content}));
  expect(layout.display).toBe("grid");
  expect(layout.before).toContain("Objekt");
  await expect(page.locator('[data-global-billing-context]')).toBeVisible();
});
