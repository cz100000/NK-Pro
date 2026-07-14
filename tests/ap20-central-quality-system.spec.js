"use strict";
const {test,expect}=require("@playwright/test");

async function openBilling(page,mode="edit"){
  await page.locator('[data-nav-toggle="group-billing"]').click();
  await page.locator('.tab-btn[data-tab="start"]').click();
  const action=mode==="view"?'billing.openCurrentView':'billing.openCurrentEdit';
  await page.locator(`#startArchiveTable .current-record-row [data-ui-action="${action}"]`).click();
}

test.beforeEach(async({page})=>{
  await page.goto("/");
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
});

test("AP20 lädt zentrale Registry und zeigt acht Prüfbereiche",async({page})=>{
  const errors=[]; page.on("pageerror",error=>errors.push(error.message));
  await openBilling(page,"edit");
  await page.locator('.tab-btn[data-tab="qualitaet"]').click();
  await expect(page.locator('#qualitaet')).toHaveClass(/active/);
  await expect(page.locator('#qualityStatusCards .quality-status-card')).toHaveCount(4);
  await expect(page.locator('#qualityGroupedChecks .quality-area-card')).toHaveCount(8);
  const description=await page.evaluate(()=>window.NKProQualityRules.describe());
  expect(description.ruleCount).toBe(42);
  expect(description.groupCount).toBe(8);
  expect(description.categories).toHaveLength(4);
  expect(description.statuses).toHaveLength(6);
  const report=await page.evaluate(()=>window.NKProQualityAssurance.inspect({scope:"currentBilling",includeTechnical:true}));
  expect(report.registry).toHaveLength(42);
  expect(report.technicalResults).toHaveLength(6);
  expect(report.results.length).toBeGreaterThanOrEqual(36);
  expect(report.groups.reduce((sum,group)=>sum+group.results.length,0)).toBe(report.results.length);
  expect(errors).toEqual([]);
});

test("Prüfdetail und Direkteinstieg stammen aus dem zentralen Ergebnis",async({page})=>{
  await openBilling(page,"edit");
  await page.locator('.tab-btn[data-tab="qualitaet"]').click();
  await page.locator('#qualityGroupedChecks .quality-area-card').first().click();
  const details=page.locator('#qualityGroupedChecks [data-ui-action="quality.openDetail"]').first();
  await expect(details).toBeVisible();
  await details.click();
  await expect(page.locator('#qualityDetailDialog')).toBeVisible();
  await expect(page.locator('#qualityDetailContent')).toContainText("Regel-ID");
  await expect(page.locator('#qualityDetailContent')).toContainText("Datenquelle");
  await expect(page.locator('#qualityDetailContent')).toContainText("Handlungsempfehlung");
});

test("Ansichtsmodus sperrt AP20-Bestätigungen technisch und visuell",async({page})=>{
  await openBilling(page,"view");
  await page.locator('.tab-btn[data-tab="qualitaet"]').click();
  await expect(page.locator('[data-global-billing-mode]')).toContainText("Nur ansehen");
  const writeButtons=page.locator('[data-ui-action="quality.confirmIssue"],[data-ui-action="quality.markNotApplicable"],[data-ui-action="quality.reopenIssue"]');
  const count=await writeButtons.count();
  for(let i=0;i<count;i++) await expect(writeButtons.nth(i)).toBeDisabled();
  const protectedResult=await page.evaluate(()=>{
    try{window.NKProBillingContext.assertWritable("Prüfbestätigung");return {blocked:false};}
    catch(error){return {blocked:error.code==="NKPRO_BILLING_READONLY",message:error.message};}
  });
  expect(protectedResult.blocked).toBe(true);
  expect(protectedResult.message).toContain("Ansichtsmodus");
});

test("Systemdiagnose ist vom fachlichen Cockpit getrennt",async({page})=>{
  await openBilling(page,"edit");
  await page.locator('.tab-btn[data-tab="qualitaet"]').click();
  await expect(page.locator('#qualityGroupedChecks')).not.toContainText("Datensatz ist serialisierbar");
  await page.locator('.tab-btn[data-tab="sicherung"]').click();
  await expect(page.locator('#systemDiagnosticsSummary .system-diagnostic-card')).toHaveCount(6);
  await expect(page.locator('#systemDiagnosticsSummary')).toContainText("Datenschema und Datenebenenvertrag");
  await expect(page.locator('#systemDiagnosticsSummary')).toContainText("Release-Audit und App-Selbsttest");
});

test("Responsive Cockpit bleibt bei Tablet- und Schmalbreite nutzbar",async({page})=>{
  await page.setViewportSize({width:720,height:700});
  await openBilling(page,"edit");
  await page.locator('.tab-btn[data-tab="qualitaet"]').click();
  await expect(page.locator('#qualityStatusCards')).toBeVisible();
  const columns=await page.locator('#qualityStatusCards').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
  expect(columns).toBeLessThanOrEqual(2);
  await page.setViewportSize({width:480,height:620});
  await expect(page.locator('#qualityStatusCards .quality-status-card').first()).toBeVisible();
  const narrowColumns=await page.locator('#qualityStatusCards').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
  expect(narrowColumns).toBe(1);
});
