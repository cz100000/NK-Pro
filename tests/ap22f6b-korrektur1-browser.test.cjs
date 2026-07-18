"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards}=require("./test-helpers.cjs");
const shots=process.env.AP22F6B_K1_SCREENSHOT_DIR||path.join(os.tmpdir(),"NK-Pro_AP22F6B_Korrektur1");
fs.rmSync(shots,{recursive:true,force:true});fs.mkdirSync(shots,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"]});
 const context=await browser.newContext({viewport:{width:1440,height:1000},locale:"de-DE",timezoneId:"Europe/Berlin",serviceWorkers:"block"});
 const page=await context.newPage();const runtime=attachRuntimeGuards(page);
 try{
  await openFreshApp(page);await loadFixture(page,"standardfall.json");
  await page.evaluate(()=>{switchToTab("start");renderAll({tabIds:["start"],reason:"ap22f6b-k1"});});await page.waitForSelector("#start.active");
  const layout=await page.evaluate(()=>{const d=document.querySelector("#start .page-header__description").getBoundingClientRect(),c=document.querySelector("#start .billing-overview-card").getBoundingClientRect(),m=document.querySelector("#start .billing-overview-messages");return {gap:c.top-d.bottom,display:getComputedStyle(m).display,height:m.getBoundingClientRect().height};});
  assert.ok(layout.gap<=36,JSON.stringify(layout));assert.equal(layout.display,"none");assert.equal(layout.height,0);
  assert.equal(await page.locator("#start details#billingPeriodSection").count(),0);assert.equal(await page.locator("#billingPeriodSettings").isVisible(),false);
  await page.locator('#startArchiveTable .current-record-row [aria-label="Bearbeiten"]').click();await page.evaluate(()=>{switchToTab("start");renderAll({tabIds:["start"],reason:"period-editor"});});
  const trigger=page.locator("#billingPeriodSettings");assert.equal(await trigger.isVisible(),true);assert.equal(await trigger.textContent(),"Abrechnungszeitraum bearbeiten");await trigger.click();
  assert.equal(await page.locator("#billingPeriodSection").evaluate(n=>n.classList.contains("show")),true);assert.equal(await page.locator("#billingPeriodStartValue").isEnabled(),true);assert.equal(/Bearbeitbar|Nur ansehen/.test(await page.locator("#billingPeriodEditorStatus").innerText()),false);
  const original=await page.evaluate(()=>periodStart());await page.locator("#billingPeriodStartValue").fill("2025-01-02");await page.locator("#billingPeriodStartValue").blur();await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>state.meta.abrechnungsbeginn),"2025-01-02");
  await page.locator("#billingPeriodStartValue").fill(original);await page.locator("#billingPeriodStartValue").blur();await page.waitForTimeout(80);
  await page.screenshot({path:path.join(shots,"10_zeitraum_dialog_bearbeiten.png"),fullPage:true});await page.locator("#billingPeriodClose").click();
  await page.evaluate(()=>closeBillingContext());await page.evaluate(()=>{switchToTab("start");renderAll({tabIds:["start"],reason:"view-period"});});await page.locator('#startArchiveTable .current-record-row [aria-label="Ansehen"]').click();await page.evaluate(()=>{switchToTab("start");renderAll({tabIds:["start"],reason:"view-period-start"});});
  assert.equal(await trigger.textContent(),"Abrechnungszeitraum anzeigen");await trigger.click();assert.equal(await page.locator("#billingPeriodStartValue").isDisabled(),true);assert.equal(await page.locator("#billingPeriodEndValue").isDisabled(),true);await page.locator("#billingPeriodClose").click();
  await page.evaluate(()=>closeBillingContext());await page.evaluate(()=>{switchToTab("start");renderAll({tabIds:["start"],reason:"archive-nav"});});await page.locator('#startArchiveTable .archive-record-row').first().locator('[aria-label="Ansehen"]').click();
  const objectGroup=page.locator('[data-nav-group-section="object"]');assert.equal(await objectGroup.isVisible(),true);assert.equal(await objectGroup.locator('[data-tab="objekt"]').isVisible(),true);await page.screenshot({path:path.join(shots,"11_archiv_navigation_vollstaendig.png"),fullPage:true});
  await page.evaluate(()=>closeBillingContext());await page.evaluate(()=>{switchToTab("wasser");renderAll({tabIds:["wasser"],reason:"adjacent-meter"});});assert.equal(await page.locator("#wasser .meter-inventory-card").count(),5);
  await page.evaluate(()=>{switchToTab("mieterverwaltung");renderAll({tabIds:["mieterverwaltung"],reason:"adjacent-tenants"});});assert.ok(await page.locator("#startTenantTable tbody tr[data-tenant-row]").count()>=1);
  runtime.assertClean();console.log(`AP22F6B Korrektur 1 browser: PASS (${shots})`);
 }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
