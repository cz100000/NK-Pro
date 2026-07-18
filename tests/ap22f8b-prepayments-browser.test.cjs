"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards}=require("./test-helpers.cjs");
const shots=process.env.AP22F8B_SCREENSHOT_DIR||path.join(process.cwd(),"AP22F8B_Screenshots");
fs.rmSync(shots,{recursive:true,force:true});fs.mkdirSync(shots,{recursive:true});

async function openPage(page,mode="edit"){
  await page.evaluate(mode=>{
    NK_PRO_MODULES.billingContext.close();
    NK_PRO_MODULES.billingContext.open({recordKey:"current",recordType:"current",label:"2025"},mode==="view"?NK_PRO_MODULES.billingContext.MODES.VIEW:NK_PRO_MODULES.billingContext.MODES.EDIT);
    document.documentElement.dataset.billingExplicitlyOpened="true";
    switchToTab("einnahmen");
    renderAll({forceAll:true,reason:"ap22f8b-browser"});
  },mode);
  await page.waitForSelector("#einnahmen.active");
  await page.waitForTimeout(80);
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
 const context=await browser.newContext({viewport:{width:1720,height:1100},locale:"de-DE",timezoneId:"Europe/Berlin",serviceWorkers:"block"});
 const page=await context.newPage();const runtime=attachRuntimeGuards(page);
 try{
  await openFreshApp(page);await loadFixture(page,"standardfall.json");await openPage(page,"edit");
  assert.equal(await page.locator("#einnahmen h1").innerText(),"Vorauszahlungen");
  assert.equal(await page.locator("#einnahmen details").count(),0);
  assert.equal(await page.locator("#einnahmen .prepayment-card").count(),4);
  assert.equal(await page.locator("#einnahmen table").count(),3);
  assert.match(await page.locator("#prepaymentCaseSummary").innerText(),/7 Fälle insgesamt/);
  assert.match(await page.locator("#prepaymentCaseSummary").innerText(),/4 abrechenbar/);
  assert.match(await page.locator("#prepaymentCaseSummary").innerText(),/3 nicht abrechenbar/);
  assert.equal(await page.locator("#vorauszahlungenTable thead th").count(),9);
  assert.equal(await page.locator("#einnahmenTable tbody tr").count(),8);
  assert.equal(await page.locator("#incomeCorrectionsTable tbody tr").count(),8);
  assert.equal(await page.locator("#einnahmenTable tbody tr:has-text('Leerstand')").count(),2);
  assert.equal(await page.locator("#einnahmenTable tbody tr:has-text('Eigentümer/Privat')").count(),1);
  assert.equal(await page.locator("#einnahmenTable tr.total-row").count(),1);
  assert.equal(await page.locator("#incomeCorrectionsTable tr.total-row").count(),1);
  assert.equal(await page.locator("#vorauszahlungenTable tr.total-row").count(),1);
  const colors=await page.evaluate(()=>({
    editable:getComputedStyle(document.querySelector("#einnahmen td.editable")).backgroundColor,
    total:getComputedStyle(document.querySelector("#einnahmen tr.total-row td")).backgroundColor
  }));
  assert.notEqual(colors.editable,"rgb(255, 242, 204)",JSON.stringify(colors));
  assert.notEqual(colors.total,"rgb(226, 240, 217)",JSON.stringify(colors));
  const nonbillableInputs=await page.locator("#einnahmenTable tbody tr:has-text('Leerstand') input, #einnahmenTable tbody tr:has-text('Eigentümer/Privat') input").count();
  assert.equal(nonbillableInputs,0);
  const cynthia=page.locator("#einnahmenTable tbody tr:has-text('Cynthia Melzig') input").first();
  await cynthia.fill("3500");await cynthia.press("Tab");await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>state.mieter.find(row=>row.id==="M001").kaltSoll),3500);
  await page.locator("#prepaymentRentSearch").fill("DG-Links");await page.waitForTimeout(80);
  assert.match(await page.locator("#prepaymentRentResults").innerText(),/^1 von 7 Fällen$/);
  await page.locator("#prepaymentRentStatusFilter").selectOption({label:"Leerstand"});await page.waitForTimeout(80);
  assert.match(await page.locator("#prepaymentRentResults").innerText(),/^1 von 7 Fällen$/);
  await page.evaluate(()=>prepaymentReset("rents"));await page.waitForTimeout(60);
  await page.locator("#prepaymentCostSearch").fill("Wasserversorgung");await page.waitForTimeout(80);
  assert.match(await page.locator("#prepaymentCostResults").innerText(),/^1 von 3 Kostenarten$/);
  await page.evaluate(()=>prepaymentReset("costs"));await page.waitForTimeout(60);
  const firstCostBefore=await page.locator("#vorauszahlungenTable tbody tr:not(.total-row) td:first-child strong").first().innerText();
  await page.locator("#vorauszahlungenTable .prepayment-sort").first().click();await page.waitForTimeout(60);
  const firstCostAfter=await page.locator("#vorauszahlungenTable tbody tr:not(.total-row) td:first-child strong").first().innerText();
  assert.notEqual(firstCostBefore,firstCostAfter);
  const desktop=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,wraps:Array.from(document.querySelectorAll("#einnahmen .prepayment-table-shell")).map(w=>({overflow:w.scrollWidth-w.clientWidth}))}));
  assert.ok(desktop.doc<=1,JSON.stringify(desktop));
  for(const tableId of ["vorauszahlungenTable","einnahmenTable","incomeCorrectionsTable"]){
    const frame=await page.evaluate(id=>{const table=document.getElementById(id),wrap=table.closest(".nk-ui-table-wrap"),last=table.querySelector("tbody tr:last-child > :last-child"),head=table.querySelector("thead tr:first-child > th:last-child"),tr=table.getBoundingClientRect();return{gap:Math.max(0,wrap.clientWidth-tr.width),headBorder:parseFloat(getComputedStyle(head).borderRightWidth)||0,lastBorder:parseFloat(getComputedStyle(last).borderRightWidth)||0};},tableId);
    assert.ok(frame.gap<=1,`${tableId}: ${JSON.stringify(frame)}`);assert.ok(frame.headBorder>=1&&frame.lastBorder>=1,`${tableId}: ${JSON.stringify(frame)}`);
  }
  await page.screenshot({path:path.join(shots,"01_desktop_bearbeiten.png"),fullPage:true});
  await page.setViewportSize({width:720,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1);await page.screenshot({path:path.join(shots,"04_zoom_200_prozent_aequivalent.png"),fullPage:true});
  await page.setViewportSize({width:620,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1);assert.ok(await page.evaluate(()=>document.querySelector("#einnahmen .prepayment-table-shell").scrollWidth>document.querySelector("#einnahmen .prepayment-table-shell").clientWidth));await page.screenshot({path:path.join(shots,"02_schmal_620.png"),fullPage:true});
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1);await page.screenshot({path:path.join(shots,"03_schmal_390.png"),fullPage:true});
  await page.setViewportSize({width:1720,height:1100});await openPage(page,"view");
  assert.equal(await page.locator("#einnahmen .billing-readonly-notice").count(),1);
  assert.equal(await page.locator("#prepaymentRentSearch").isEditable(),true);
  assert.equal(await page.locator("#einnahmenTable input").first().isEditable(),false);
  await page.screenshot({path:path.join(shots,"05_desktop_nur_ansehen.png"),fullPage:true});
  await page.evaluate(()=>{window.__ap22f8b={wohnungen:JSON.parse(JSON.stringify(state.wohnungen)),mieter:JSON.parse(JSON.stringify(state.mieter)),vorauszahlungen:JSON.parse(JSON.stringify(state.vorauszahlungen))};state.wohnungen=[];state.mieter=[];state.vorauszahlungen=[];renderEinnahmen();});
  assert.match(await page.locator("#prepaymentCaseSummary").innerText(),/0 Fälle insgesamt/);
  assert.match(await page.locator("#einnahmenTable").innerText(),/Keine Fälle/);
  await page.screenshot({path:path.join(shots,"06_leerzustand.png"),fullPage:true});
  await page.evaluate(()=>{state.wohnungen=window.__ap22f8b.wohnungen;state.mieter=window.__ap22f8b.mieter;state.vorauszahlungen=window.__ap22f8b.vorauszahlungen;delete window.__ap22f8b;renderEinnahmen();document.getElementById("prepaymentPageError").hidden=false;document.getElementById("prepaymentPageError").scrollIntoView({block:"center"});});
  assert.equal(await page.locator("#prepaymentPageError").isVisible(),true);
  await page.screenshot({path:path.join(shots,"07_fehlerzustand.png"),fullPage:true});
  runtime.assertClean();console.log("AP22F8B browser: PASS");
 }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
