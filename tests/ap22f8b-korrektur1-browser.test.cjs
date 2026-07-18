"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards}=require("./test-helpers.cjs");
const shots=process.env.AP22F8B_K1_SCREENSHOT_DIR||path.join(process.cwd(),"AP22F8B_Korrektur1_Screenshots");
fs.rmSync(shots,{recursive:true,force:true});fs.mkdirSync(shots,{recursive:true});
const moneyNumber=text=>Number(String(text).replace(/[^0-9,.-]/g,"").replace(/\./g,"").replace(",","."));
async function openPage(page,mode="edit"){
  await page.evaluate(mode=>{
    NK_PRO_MODULES.billingContext.close();
    NK_PRO_MODULES.billingContext.open({recordKey:"current",recordType:"current",label:"2025"},mode==="view"?NK_PRO_MODULES.billingContext.MODES.VIEW:NK_PRO_MODULES.billingContext.MODES.EDIT);
    document.documentElement.dataset.billingExplicitlyOpened="true";
    switchToTab("einnahmen");renderAll({forceAll:true,reason:"ap22f8b-k1"});
  },mode);
  await page.waitForSelector("#einnahmen.active");await page.waitForTimeout(100);
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
 const context=await browser.newContext({viewport:{width:1720,height:1100},locale:"de-DE",timezoneId:"Europe/Berlin",serviceWorkers:"block"});
 const page=await context.newPage();const runtime=attachRuntimeGuards(page);
 try{
  await openFreshApp(page);await loadFixture(page,"standardfall.json");await openPage(page,"edit");
  assert.equal(await page.locator("#einnahmen .prepayment-summary-card").count(),4);
  assert.equal(await page.locator("#prepaymentTileCasesValue").innerText(),"7");
  assert.match(await page.locator("#prepaymentTileCasesDetail").innerText(),/4 abrechenbar · 3 nicht abrechenbar/);
  assert.match(await page.locator("#prepaymentTileRentValue").locator("xpath=..").innerText(),/KALTMieteinnahmen/i);

  const widths=await page.locator("#vorauszahlungenTable thead th").evaluateAll(nodes=>nodes.slice(2).map(node=>Math.round(node.getBoundingClientRect().width*10)/10));
  assert.ok(widths.length>=7,JSON.stringify(widths));
  assert.ok(Math.max(...widths)-Math.min(...widths)<=1,`Fallspalten nicht gleich breit: ${JSON.stringify(widths)}`);

  const corrHead=await page.locator("#incomeCorrectionsTable thead").innerText();
  assert.match(corrHead,/NK-Korrektur \/ Gutschrift/);
  assert.match(corrHead,/Kaltmiet-Korrektur \/ Gutschrift/);
  assert.match(corrHead,/Kaltmieteinnahmen nach Korrektur/);
  assert.equal(await page.locator("#prepaymentNkCorrectionTotal").count(),1);
  assert.equal(await page.locator("#prepaymentRentCorrectionTotal").count(),1);
  assert.equal(await page.locator("#einnahmenTable tbody tr:has-text('Leerstand') [data-prepayment-rent-after]").count(),0);
  assert.equal(await page.locator("#incomeCorrectionsTable tbody tr:has-text('Leerstand') [data-prepayment-nk-after], #incomeCorrectionsTable tbody tr:has-text('Leerstand') [data-prepayment-rent-after]").count(),0);

  const row=page.locator("#incomeCorrectionsTable tbody tr:has-text('Cynthia Melzig')");
  const inputs=row.locator("input");assert.equal(await inputs.count(),2);
  const before=await page.evaluate(()=>{const t=state.mieter.find(x=>x.id==="M001");const c=calculateUmlage().tenantResults.find(x=>x.tenant.id==="M001");return{nk:t.nkVoraus,rent:t.kaltErhalten,balance:c.balance};});
  await inputs.nth(0).fill("125");await page.waitForTimeout(100);
  const nkAfter=moneyNumber(await row.locator("[data-prepayment-nk-after]").innerText());
  assert.equal(nkAfter,Math.round((before.nk+125)*100)/100);
  assert.equal(moneyNumber(await page.locator("#prepaymentNkCorrectionTotal").innerText()),125);
  assert.match(await page.locator("#prepaymentTileCorrectionDetail").innerText(),/NK 125,00/);

  const rentRow=page.locator("#einnahmenTable tbody tr:has-text('Cynthia Melzig')");
  const rentInputs=rentRow.locator("input");
  await rentInputs.nth(1).fill("1000");await page.waitForTimeout(100);
  await inputs.nth(1).fill("100");await page.waitForTimeout(100);
  assert.equal(moneyNumber(await rentRow.locator("[data-prepayment-rent-after]").innerText()),900);
  assert.equal(moneyNumber(await page.locator("#prepaymentRentTotalAfter").innerText()),900);
  assert.equal(moneyNumber(await page.locator("#prepaymentRentCorrectionTotal").innerText()),100);
  assert.equal(moneyNumber(await page.locator("#prepaymentCorrectionRentAfterTotal").innerText()),900);
  assert.match(await page.locator("#prepaymentTileCorrectionDetail").innerText(),/Kaltmiete 100,00/);

  const stateResult=await page.evaluate(()=>{const t=state.mieter.find(x=>x.id==="M001");const calc=calculateUmlage();const result=calc.tenantResults.find(x=>x.tenant.id==="M001");const html=buildBriefHtml(calc,briefResultRows(calc).find(x=>x.tenant.id==="M001"));return{nk:t.vorjahresKorrektur,rent:t.kaltmietKorrektur,received:t.kaltErhalten,balance:result.balance,html};});
  assert.equal(stateResult.nk,125);assert.equal(stateResult.rent,100);assert.equal(stateResult.received,1000);
  assert.equal(Math.round(stateResult.balance*100)/100,Math.round((before.balance-125)*100)/100,"Nur NK-Korrektur darf den NK-Saldo beeinflussen");
  assert.match(stateResult.html,/Korrektur\/Gutschrift NK-Vorauszahlung/);
  assert.match(stateResult.html,/Kaltmietkorrektur \/ Gutschrift/);
  assert.match(stateResult.html,/verändert das Ergebnis der Nebenkostenabrechnung nicht/);

  await page.evaluate(()=>renderAll({forceAll:true,reason:"persist-check"}));await page.waitForTimeout(100);
  const persisted=await page.evaluate(()=>{const t=state.mieter.find(x=>x.id==="M001");return{nk:t.vorjahresKorrektur,rent:t.kaltmietKorrektur};});
  assert.deepEqual(persisted,{nk:125,rent:100});

  const qualityText=await page.locator("#incomeValidationSection .prepayment-quality__body").innerText();
  assert.match(qualityText,/Vorauszahlungsmatrix und Mieterwerte stimmen überein/);
  assert.match(qualityText,/Erwartete Vorauszahlung fehlt/);
  assert.match(qualityText,/NK- und Kaltmietkorrekturen sind getrennt/);

  const layout=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,tiles:getComputedStyle(document.querySelector('.prepayment-summary-grid')).gridTemplateColumns.split(' ').length}));
  assert.ok(layout.doc<=1,JSON.stringify(layout));assert.equal(layout.tiles,4);
  await page.screenshot({path:path.join(shots,"01_desktop_korrekturen_und_kacheln.png"),fullPage:true});

  await page.setViewportSize({width:620,height:900});await page.waitForTimeout(80);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1);
  assert.ok(await page.evaluate(()=>document.querySelector('#vorauszahlungenTable').closest('.nk-ui-table-wrap').scrollWidth>document.querySelector('#vorauszahlungenTable').closest('.nk-ui-table-wrap').clientWidth));
  await page.screenshot({path:path.join(shots,"02_schmal_620.png"),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(80);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1);
  await page.screenshot({path:path.join(shots,"03_schmal_390.png"),fullPage:true});

  await page.setViewportSize({width:1720,height:1100});await openPage(page,"view");
  assert.equal(await page.locator("#incomeCorrectionsTable input").first().isEditable(),false);
  assert.equal(await page.locator("#einnahmen .billing-readonly-notice").count(),1);
  await page.screenshot({path:path.join(shots,"04_nur_ansehen.png"),fullPage:true});
  runtime.assertClean();console.log("AP22F8B Korrektur 1 browser: PASS");
 }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
