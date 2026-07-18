"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
const fs=require("node:fs");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture}=require("./test-helpers.cjs");
const root=path.resolve(__dirname,"..");
const screenshots=path.join(root,"AP22F5B_Korrektur1_Screenshots");
fs.rmSync(screenshots,{recursive:true,force:true});fs.mkdirSync(screenshots,{recursive:true});
async function app(browser,opts={}){
 const page=await browser.newPage({viewport:opts.viewport||{width:1648,height:894},locale:"de-DE",timezoneId:"Europe/Berlin"});
 await openFreshApp(page);
 await loadFixture(page,"standardfall.json");
 await page.evaluate(()=>{switchToTab("mieterverwaltung");renderAll({tabIds:["mieterverwaltung"],reason:"ap22f5b-korrektur1"});});
 await page.waitForSelector("#mieterverwaltung.active");
 await page.waitForTimeout(100);
 return {page,close:()=>page.close()};
}
async function noPageOverflow(page){const v=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));assert.ok(v.sw<=v.cw+1,JSON.stringify(v));}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"]});try{
 {
  const page=await browser.newPage({viewport:{width:1648,height:894},locale:"de-DE",timezoneId:"Europe/Berlin"});
  await openFreshApp(page);await loadFixture(page,"standardfall.json");
  await page.evaluate(()=>{switchToTab("wasser");renderAll({tabIds:["wasser"],reason:"meter-regression"});});
  assert.equal(await page.locator("#wasser .meter-inventory-card").count(),5);
  assert.equal(await page.locator("#wasser [data-ui-action]").count(),0);
  const digest=await page.evaluate(()=>JSON.stringify(state));
  await page.locator("#meterInventorySearch").fill("PV-Erzeugung");assert.equal(await page.locator("#meterInventoryDummyTable tbody tr:visible").count(),1);
  await page.locator("#meterInventoryReset").click();assert.equal(await page.evaluate(()=>JSON.stringify(state)),digest);
  await page.close();
 }

 {
  const {page,close}=await app(browser);
  assert.equal(await page.locator('[data-tenant-view-button]').count(),2);
  assert.equal(await page.locator('#startTenantTable thead th').count(),6);
  assert.equal(await page.locator('#startTenantTable tbody tr[data-tenant-row]').count(),5);
  assert.equal(await page.locator('#startTenantTable tbody tr[data-tenant-row] input,#startTenantTable tbody tr[data-tenant-row] select').count(),0,"Kompaktzeilen enthalten Eingabefelder");
  await page.locator('#startTenantTable [data-tenant-toggle]').first().click();
  assert.equal(await page.locator('#startTenantTable .tenant-management-detail-row').count(),1);
  assert.equal(await page.locator('#startTenantTable .tenant-management-detail-row input,#startTenantTable .tenant-management-detail-row select').count(),12,"Detailbereich enthält nicht alle 12 Pflegefelder");
  const name=page.locator('#startTenantTable .tenant-management-detail-row input').first();await name.fill('Cynthia Melzig geprüft');await name.blur();await page.waitForTimeout(60);
  assert.equal(await page.evaluate(()=>state.stammdaten.mieter[0].name),'Cynthia Melzig geprüft');
  await page.screenshot({path:path.join(screenshots,'01_aktive_kompakt_mit_detail.png'),fullPage:true});
  await page.locator('[data-tenant-toggle]').first().click();
  const archiveButton=page.locator('#startTenantTable .tenant-management-row-action--archive').first();await archiveButton.click();await page.waitForTimeout(100);
  assert.equal(await page.locator('[data-tenant-summary-archived]').textContent(),'1');
  await page.locator('[data-tenant-view-button="archive"]').click();
  assert.equal(await page.locator('#tenantManagementStatusFilter').isHidden(),true);
  assert.equal(await page.locator('#mieterverwaltung [data-ui-action="object.addMasterTenancy"]').isHidden(),true);
  assert.equal(await page.locator('#startTenantTable thead th').count(),7);
  assert.equal(await page.locator('#startTenantTable tbody tr[data-tenant-row]').count(),1);
  assert.equal(await page.locator('#startTenantTable input,#startTenantTable select').count(),0,"Archivansicht enthält Eingabefelder");
  await page.locator('#startTenantTable [data-tenant-toggle]').click();
  assert.equal(await page.locator('.tenant-detail-panel--readonly').count(),1);
  assert.equal(await page.locator('.tenant-detail-panel--readonly input,.tenant-detail-panel--readonly select').count(),0);
  await page.screenshot({path:path.join(screenshots,'02_archiv_mit_details.png'),fullPage:true});
  await page.locator('#startTenantTable .tenant-management-row-action--restore').click();await page.waitForTimeout(100);
  assert.equal(await page.locator('[data-tenant-summary-archived]').textContent(),'0');
  await noPageOverflow(page);await close();
 }
 {
  const {page,close}=await app(browser,{viewport:{width:390,height:844}});
  await page.locator('#startTenantTable [data-tenant-toggle]').first().click();await noPageOverflow(page);
  await page.screenshot({path:path.join(screenshots,'03_schmal_mit_detail.png'),fullPage:true});await close();
 }
 {
  const {page,close}=await app(browser);
  await page.evaluate(()=>switchToTab("start"));
  await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentView"]').click();
  await page.evaluate(()=>{switchToTab("mieterverwaltung");renderAll({tabIds:["mieterverwaltung"],reason:"readonly"});});
  assert.equal(await page.evaluate(()=>NK_PRO_MODULES.billingContext.isReadOnly()),true);
  await page.locator('#startTenantTable [data-tenant-toggle]').first().click();
  assert.equal(await page.locator('.tenant-management-detail-row input:not(:disabled),.tenant-management-detail-row select:not(:disabled)').count(),0);
  assert.equal(await page.locator('.tenant-management-row-action--archive:not(:disabled)').count(),0);
  assert.ok(await page.locator('[data-tenant-toggle]').first().isEnabled(),"Details müssen im Nur-Ansehen-Modus aufklappbar bleiben");
  await page.locator('[data-tenant-view-button="archive"]').click();
  assert.equal(await page.locator('#startTenantTable input,#startTenantTable select').count(),0);
  await page.screenshot({path:path.join(screenshots,'04_nur_ansehen.png'),fullPage:true});await close();
 }
 console.log('AP22F5B Korrektur 1 browser: PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
