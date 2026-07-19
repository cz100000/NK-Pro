"use strict";
const assert=require("node:assert/strict");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards}=require("./test-helpers.cjs");
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu","--disable-software-rasterizer","--single-process"]});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},locale:"de-DE"});const runtime=attachRuntimeGuards(page);await openFreshApp(page);await loadFixture(page,"standardfall.json");await page.evaluate(()=>{switchToTab("start");renderAll({tabIds:["start"],reason:"ap22f10d-k2"});});
 const labels=await page.locator('#startArchiveTable .current-record-row .billing-overview-action').evaluateAll(bs=>bs.map(b=>b.getAttribute('aria-label')));
 assert.deepEqual(labels,["Abrechnung bearbeiten","Abrechnungszeitraum ändern","Abrechnung ansehen","Abschließen","Archivieren","Abrechnung löschen"]);
 await page.locator('[aria-label="Abrechnung bearbeiten"]').click();assert.equal(await page.evaluate(()=>NK_PRO_MODULES.billingContext.snapshot().mode),"edit");await page.evaluate(()=>{closeBillingContext();switchToTab('start');renderStart();});
 await page.locator('[aria-label="Abrechnungszeitraum ändern"]').click();assert.equal(await page.locator('#billingPeriodSection').evaluate(n=>n.classList.contains('show')),true);await page.locator('#billingPeriodClose').click();
 await page.locator('[aria-label="Abrechnung ansehen"]').click();assert.equal(await page.evaluate(()=>NK_PRO_MODULES.billingContext.snapshot().mode),"view");
 await page.evaluate(()=>{pendingStorageWarning='';notifyStorageProblem('Testfehler',new DOMException('Quota exceeded','QuotaExceededError'));renderSystemMessages();});
 assert.ok((await page.locator('#appStatusBox').innerText()).includes('Browserspeicher voll'));assert.equal(await page.locator('#appStatusBox [data-ui-action="export.downloadFullJson"]').count(),1);
 const overflow=await page.locator('.billing-overview-table-shell').evaluate(n=>({sw:n.scrollWidth,cw:n.clientWidth}));assert.ok(overflow.sw<=overflow.cw+1,JSON.stringify(overflow));runtime.assertClean();await page.close();console.log('AP22F10D Korrektur 2 browser: PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
