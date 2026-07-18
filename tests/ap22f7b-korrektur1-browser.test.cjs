"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards}=require("./test-helpers.cjs");
const shots=process.env.AP22F7B_K1_SCREENSHOT_DIR||path.join(process.cwd(),"AP22F7B_Korrektur1_Screenshots");
fs.rmSync(shots,{recursive:true,force:true});fs.mkdirSync(shots,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
 const context=await browser.newContext({viewport:{width:1440,height:1000},locale:"de-DE",timezoneId:"Europe/Berlin",serviceWorkers:"block"});
 const page=await context.newPage();const runtime=attachRuntimeGuards(page);
 try{
  await openFreshApp(page);await loadFixture(page,"standardfall.json");
  await page.evaluate(()=>{NK_PRO_MODULES.billingContext.open({recordKey:"current",recordType:"current",label:"2025"},NK_PRO_MODULES.billingContext.MODES.EDIT);document.documentElement.dataset.billingExplicitlyOpened="true";switchToTab("mieter");renderAll({forceAll:true,reason:"ap22f7b-k1"});});
  await page.waitForSelector("#mieter.active #mieterTable thead th");
  await page.waitForTimeout(30);
  const style=await page.evaluate(()=>{
    const th=document.querySelector("#mieterTable thead th");
    const button=th.querySelector(".billing-tenant-sort");
    const probe=document.createElement("div");
    probe.style.background="var(--nk-ui-color-surface-muted)";
    probe.style.color="var(--nk-ui-color-text)";
    document.body.appendChild(probe);
    const expected=getComputedStyle(probe);
    const actualTh=getComputedStyle(th);
    const actualButton=getComputedStyle(button);
    const result={
      thBackground:actualTh.backgroundColor,
      expectedBackground:expected.backgroundColor,
      thColor:actualTh.color,
      expectedColor:expected.color,
      buttonBackground:actualButton.backgroundColor,
      buttonBorder:[actualButton.borderTopWidth,actualButton.borderRightWidth,actualButton.borderBottomWidth,actualButton.borderLeftWidth],
      pseudo:getComputedStyle(th,"::after").content,
      sortable:th.classList.contains("sortable"),
      onclick:th.onclick,
      headerRows:document.querySelectorAll("#mieterTable thead tr").length,
      thHeight:th.getBoundingClientRect().height,
      buttonHeight:button.getBoundingClientRect().height
    };
    probe.remove();return result;
  });
  assert.equal(style.thBackground,style.expectedBackground,JSON.stringify(style));
  assert.equal(style.thColor,style.expectedColor,JSON.stringify(style));
  assert.ok(style.buttonBackground==="rgba(0, 0, 0, 0)"||style.buttonBackground==="transparent",JSON.stringify(style));
  assert.deepEqual(style.buttonBorder,["0px","0px","0px","0px"]);
  assert.ok(style.pseudo==="none"||style.pseudo==='""',JSON.stringify(style));
  assert.equal(style.sortable,false,JSON.stringify(style));
  assert.equal(style.onclick,null,JSON.stringify(style));
  assert.equal(style.headerRows,1);
  assert.ok(Math.abs(style.thHeight-style.buttonHeight)<=3,JSON.stringify(style));
  const before=await page.locator("#mieterTable tbody tr").first().locator("td").first().innerText();
  await page.locator("#mieterTable .billing-tenant-sort").first().click();await page.waitForTimeout(30);
  const arrow1=await page.locator("#mieterTable .billing-tenant-sort").first().locator("span").innerText();
  await page.locator("#mieterTable .billing-tenant-sort").first().click();await page.waitForTimeout(30);
  const after=await page.locator("#mieterTable tbody tr").first().locator("td").first().innerText();
  const arrow2=await page.locator("#mieterTable .billing-tenant-sort").first().locator("span").innerText();
  assert.equal(arrow1,"↑");assert.equal(arrow2,"↓");assert.notEqual(before,after);
  await page.keyboard.press("Tab");
  const focusedSort=page.locator("#mieterTable .billing-tenant-sort:focus-visible");
  assert.equal(await focusedSort.count(),1);
  assert.notEqual(await focusedSort.evaluate(el=>getComputedStyle(el).outlineStyle),"none");
  await page.evaluate(()=>{billingTenantUiState.tenants.sortKey="";billingTenantUiState.tenants.sortDirection="asc";renderWohnungen();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();});
  await page.waitForTimeout(30);
  await page.screenshot({path:path.join(shots,"01_desktop_tabellenkoepfe_standard.png"),fullPage:true});
  await page.setViewportSize({width:620,height:900});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1);
  await page.screenshot({path:path.join(shots,"02_schmal_620_tabellenkoepfe_standard.png"),fullPage:true});
  runtime.assertClean();console.log("AP22F7B Korrektur 1 browser: PASS");
 }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
