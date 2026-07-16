"use strict";
const {test,expect}=require("@playwright/test");
const { openFreshApp }=require("./test-helpers.cjs");

async function openBilling(page,mode="edit"){
  await page.evaluate(requestedMode=>{
    switchToTab("start");
    if(requestedMode==="view") openCurrentBillingForView();
    else openCurrentBillingForEdit();
  },mode);
}
async function openQualityPage(page){
  await page.evaluate(()=>{
    switchToTab("qualitaet");
    ["qualityOverviewSection","qualityOpenIssuesSection"].forEach(id=>{
      const node=document.getElementById(id);
      if(node && !node.open) node.querySelector(":scope > summary")?.click();
    });
  });
}


test.beforeEach(async({page})=>{
  await openFreshApp(page);
});

test("AP20 lädt zentrale Registry und zeigt acht Prüfbereiche",async({page})=>{
  const errors=[]; page.on("pageerror",error=>errors.push(error.message));
  await openBilling(page,"edit");
  await openQualityPage(page);
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
  await openQualityPage(page);
  await page.evaluate(()=>{
    const button=document.querySelector('#qualityGroupedChecks [data-ui-action="quality.openDetail"]');
    if(!button) throw new Error("Kein zentraler Prüfdetail-Direkteinstieg vorhanden.");
    const args=JSON.parse(button.dataset.uiArgs||"[]");
    openQualityDetail(args[0]);
  });
  await expect(page.locator('#qualityDetailDialog')).toBeVisible();
  await expect(page.locator('#qualityDetailContent')).toContainText("Regel-ID");
  await expect(page.locator('#qualityDetailContent')).toContainText("Datenquelle");
  await expect(page.locator('#qualityDetailContent')).toContainText("Handlungsempfehlung");
});

test("Ansichtsmodus sperrt AP20-Bestätigungen technisch und visuell",async({page})=>{
  await openBilling(page,"view");
  await openQualityPage(page);
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
  await openQualityPage(page);
  await expect(page.locator('#qualityGroupedChecks')).not.toContainText("Datensatz ist serialisierbar");
  await page.evaluate(()=>switchToTab("sicherung"));
  await expect(page.locator('#systemDiagnosticsSummary .system-diagnostic-card')).toHaveCount(6);
  await expect(page.locator('#systemDiagnosticsSummary')).toContainText("Datenschema und Datenebenenvertrag");
  await expect(page.locator('#systemDiagnosticsSummary')).toContainText("Release-Audit und App-Selbsttest");
});

test("Responsive Cockpit bleibt bei Tablet- und Schmalbreite nutzbar",async({page})=>{
  await page.setViewportSize({width:720,height:700});
  await openBilling(page,"edit");
  await openQualityPage(page);
  await page.locator('#qualityOverviewSection').evaluate(node=>{ node.open=true; });
  await expect(page.locator('#qualityStatusCards')).toBeVisible();
  const columns=await page.locator('#qualityStatusCards').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
  expect(columns).toBeLessThanOrEqual(2);
  await page.setViewportSize({width:480,height:620});
  await expect(page.locator('#qualityStatusCards .quality-status-card').first()).toBeVisible();
  const narrowColumns=await page.locator('#qualityStatusCards').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
  expect(narrowColumns).toBe(1);
});
