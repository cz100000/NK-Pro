"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture}=require("./test-helpers.cjs");
const root=path.resolve(__dirname,"..");
const screenshotDir=process.env.AP22F5B_SCREENSHOT_DIR||path.join(root,"AP22F5B_Screenshots");
fs.mkdirSync(screenshotDir,{recursive:true});
function guards(page){const errors=[];page.on("console",m=>{if(m.type()==="error")errors.push(`console: ${m.text()}`)});page.on("pageerror",e=>errors.push(`pageerror: ${e.message}`));page.on("requestfailed",r=>errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText||""}`));return()=>assert.deepEqual(errors,[]);}
async function newApp(browser,tab,viewport={width:1648,height:1000}){const page=await browser.newPage({viewport,locale:"de-DE",timezoneId:"Europe/Berlin"});const clean=guards(page);await openFreshApp(page);await loadFixture(page,"standardfall.json");await page.evaluate(tabId=>{switchToTab(tabId);renderAll({tabIds:[tabId],reason:"ap22f5b-browser"});},tab);await page.waitForSelector(`#${tab}.active`);return{page,clean};}
async function whiteInset(page,wrapSelector,tableSelector,expectOverflow=false){const layout=await page.evaluate(({wrapSelector,tableSelector})=>{const wrap=document.querySelector(wrapSelector),table=document.querySelector(tableSelector);wrap.scrollLeft=0;const ws=getComputedStyle(wrap),wr=wrap.getBoundingClientRect(),tr=table.getBoundingClientRect();return{padding:[ws.paddingTop,ws.paddingRight,ws.paddingBottom,ws.paddingLeft].map(parseFloat),background:ws.backgroundColor,wrap:{left:wr.left,right:wr.right,client:wrap.clientWidth,scroll:wrap.scrollWidth},table:{left:tr.left,right:tr.right,width:tr.width}};},{wrapSelector,tableSelector});layout.padding.forEach(value=>assert.ok(value>=7,JSON.stringify(layout)));assert.match(layout.background,/rgb\(255, 255, 255\)/);assert.ok(layout.table.left>=layout.wrap.left+layout.padding[3]-1,JSON.stringify(layout));if(expectOverflow)assert.ok(layout.wrap.scroll>layout.wrap.client,JSON.stringify(layout));else assert.ok(layout.table.width>=layout.wrap.client-layout.padding[1]-layout.padding[3]-2,JSON.stringify(layout));}
async function noPageOverflow(page){const value=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(value.scroll<=value.client,JSON.stringify(value));}
async function prepareScreenshot(page){await page.mouse.move(1,1);await page.evaluate(()=>{if(document.activeElement&&typeof document.activeElement.blur==="function")document.activeElement.blur();window.scrollTo(0,0);});await page.waitForTimeout(20);}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"]});
 try{
  {
   const {page,clean}=await newApp(browser,"wasser");
   assert.equal(await page.locator("#wasser h1").textContent(),"Zähler");
   assert.equal(await page.locator("#wasser .meter-inventory-card").count(),5);
   assert.equal(await page.locator("#meterInventoryDummyTable tbody tr").count(),7);
   assert.equal(await page.locator("#wasser [data-ui-action]").count(),0,"DUMMY-Seite enthält produktive Aktion");
   const iconData=await page.locator("#wasser .meter-inventory-card__icon").evaluateAll(nodes=>nodes.map(node=>({color:getComputedStyle(node).color,fill:node.querySelector("svg")?.getAttribute("fill"),stroke:node.querySelector("svg")?.getAttribute("stroke")})));
   assert.equal(new Set(iconData.map(item=>item.color)).size,5,"Iconfarben sind nicht je Zählerart unterscheidbar");iconData.forEach(item=>{assert.equal(item.fill,"none");assert.equal(item.stroke,"currentColor")});
   const before=await page.evaluate(()=>JSON.stringify(state));
   await page.locator("#meterInventorySearch").fill("PV-Erzeugung");assert.equal(await page.locator("#meterInventoryDummyTable tbody tr:visible").count(),1);assert.equal(await page.locator("[data-meter-inventory-results]").textContent(),"1 von 7 Beispielzeilen");
   await page.locator("#meterInventorySearch").fill("");await page.locator("#meterInventoryTypeFilter").selectOption("wasser");assert.equal(await page.locator("#meterInventoryDummyTable tbody tr:visible").count(),2);
   await page.locator("#meterInventoryReset").click();assert.equal(await page.locator("#meterInventoryDummyTable tbody tr:visible").count(),7);assert.equal(await page.evaluate(()=>JSON.stringify(state)),before,"DUMMY-Suche/Filter mutierten Anwendungsdaten");
   const flow=await page.evaluate(()=>{const cards=document.querySelector("#wasser .meter-inventory-cards").getBoundingClientRect(),table=document.querySelector("#wasser .meter-inventory-table-block").getBoundingClientRect(),note=document.querySelector("#wasser .meter-inventory-system-note").getBoundingClientRect();return{cardsBottom:cards.bottom,tableTop:table.top,tableBottom:table.bottom,noteTop:note.top,noteHeight:note.height,noteScroll:document.querySelector("#wasser .meter-inventory-system-note").scrollHeight}});assert.ok(flow.tableTop>=flow.cardsBottom,JSON.stringify(flow));assert.ok(flow.noteTop>=flow.tableBottom,JSON.stringify(flow));assert.ok(flow.noteHeight>=flow.noteScroll-1,JSON.stringify(flow));
   await whiteInset(page,"#wasser .meter-inventory-table-wrap","#meterInventoryDummyTable",false);await noPageOverflow(page);
   await prepareScreenshot(page);await page.screenshot({path:path.join(screenshotDir,"01_zaehler_desktop.png"),fullPage:true});clean();await page.close();
  }
  {
   const {page,clean}=await newApp(browser,"mieterverwaltung");
   assert.equal(await page.locator("#mieterverwaltung h1").textContent(),"Mietverhältnisse");
   assert.equal(await page.locator("#mieterverwaltung .tenant-summary-card").count(),4);
   assert.deepEqual(await page.locator('[data-tenant-summary-total],[data-tenant-summary-active],[data-tenant-summary-ended],[data-tenant-summary-archived]').allTextContents(),["5","5","0","0"]);
   assert.equal(await page.locator("#startTenantTable thead th").count(),9);
   assert.equal(await page.locator("#startTenantTable tbody tr[data-tenant-row]").count(),5);
   assert.equal(await page.locator("#startTenantTable tbody tr[data-tenant-row]").first().locator("input,select").count(),12,"bestehende zwölf Pflegefelder fehlen");
   assert.equal(await page.locator('.table-tools[data-table="startTenantTable"]:visible').count(),0,"doppelter Tabellenfilter sichtbar");
   const beforeFilters=await page.evaluate(()=>JSON.stringify(state.stammdaten.mieter));
   await page.locator("#tenantManagementSearch").fill("Gärtner");assert.equal(await page.locator("#startTenantTable tbody tr[data-tenant-row]:visible").count(),1);assert.equal(await page.locator("[data-tenant-results]").textContent(),"1 von 5 Mietverhältnissen");
   await page.locator("#tenantManagementReset").click();assert.equal(await page.locator("#startTenantTable tbody tr[data-tenant-row]:visible").count(),5);
   const firstUnit=await page.locator("#tenantManagementUnitFilter option").nth(1).getAttribute("value");await page.locator("#tenantManagementUnitFilter").selectOption(firstUnit);assert.equal(await page.locator("#startTenantTable tbody tr[data-tenant-row]:visible").count(),1);await page.locator("#tenantManagementReset").click();
   assert.equal(await page.evaluate(()=>JSON.stringify(state.stammdaten.mieter)),beforeFilters,"Suche/Filter mutierten Mietverhältnisse");
   let row=page.locator("#startTenantTable tbody tr[data-tenant-row]").first();
   const name=row.locator(".tenant-management-name-cell input");await name.fill("Cynthia Melzig geprüft");await name.blur();await page.waitForTimeout(30);
   row=page.locator("#startTenantTable tbody tr[data-tenant-row]").first();const street=row.locator(".tenant-management-address-fields>input");await street.fill("Teststraße 1");await street.blur();await page.waitForTimeout(30);
   row=page.locator("#startTenantTable tbody tr[data-tenant-row]").first();await row.locator(".tenant-management-letter-fields select").first().selectOption("Eigentümer/Privat");await page.waitForTimeout(30);
   const edited=await page.evaluate(()=>state.stammdaten.mieter[0]);assert.equal(edited.name,"Cynthia Melzig geprüft");assert.equal(edited.strasse,"Teststraße 1");assert.equal(edited.abrechnungRolle,"Eigentümer/Privat");
   await page.locator("#mieterverwaltung [data-page-save]").click();await page.waitForFunction(()=>state.meta&&state.meta.lastSavedWithAppVersion==="V99.4.40");
   row=page.locator("#startTenantTable tbody tr[data-tenant-row]").first();await row.locator(".tenant-management-row-action--archive").click();await page.waitForTimeout(50);assert.equal(await page.locator("#startTenantTable tbody tr[data-tenant-row]").count(),4);assert.equal(await page.locator("[data-tenant-summary-archived]").textContent(),"1");
   await page.locator("#masterTenantArchiveSection").evaluate(el=>el.open=true);await page.locator("#startTenantArchiveTable .tenant-management-row-action").click();await page.waitForTimeout(50);assert.equal(await page.locator("#startTenantTable tbody tr[data-tenant-row]").count(),5);assert.equal(await page.locator("[data-tenant-summary-archived]").textContent(),"0");
   await whiteInset(page,"#mieterverwaltung .tenant-management-table-wrap","#startTenantTable",true);await noPageOverflow(page);
   const flow=await page.evaluate(()=>{const card=document.querySelector("#mieterverwaltung .tenant-management-card").getBoundingClientRect(),archive=document.querySelector("#mieterverwaltung .tenant-archive-card").getBoundingClientRect(),note=document.querySelector("#mieterverwaltung .tenant-management-system-note").getBoundingClientRect();return{cardBottom:card.bottom,archiveTop:archive.top,archiveBottom:archive.bottom,noteTop:note.top}});assert.ok(flow.archiveTop>=flow.cardBottom,JSON.stringify(flow));assert.ok(flow.noteTop>=flow.archiveBottom,JSON.stringify(flow));
   await prepareScreenshot(page);await page.screenshot({path:path.join(screenshotDir,"03_mietverhaeltnisse_desktop.png"),fullPage:true});clean();await page.close();
  }
  {
   const {page,clean}=await newApp(browser,"mieterverwaltung");
   await page.evaluate(()=>switchToTab("start"));
   await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentView"]').click();
   await page.evaluate(()=>{switchToTab("mieterverwaltung");renderAll({tabIds:["mieterverwaltung"],reason:"ap22f5b-readonly"});});
   assert.equal(await page.evaluate(()=>NK_PRO_MODULES.billingContext.isReadOnly()),true);
   assert.equal(await page.locator("[data-tenant-readonly-notice]").isVisible(),true);
   assert.equal(await page.locator("#mieterverwaltung [data-page-save]").isDisabled(),true);
   assert.equal(await page.locator('#mieterverwaltung [data-ui-action="object.addMasterTenancy"]').isDisabled(),true);
   assert.equal(await page.locator("#startTenantTable input:not(:disabled),#startTenantTable select:not(:disabled)").count(),0);
   assert.equal(await page.locator("#startTenantTable .tenant-management-row-action:not(:disabled)").count(),0);
   assert.equal(await page.locator("#tenantManagementSearch").isDisabled(),false);
   assert.equal(await page.locator("#tenantManagementUnitFilter").isDisabled(),false);
   const digest=await page.evaluate(()=>JSON.stringify(state.stammdaten.mieter));
   await page.locator("#tenantManagementSearch").fill("Gärtner");
   assert.equal(await page.locator("#startTenantTable tbody tr[data-tenant-row]:visible").count(),1);
   assert.equal(await page.evaluate(()=>JSON.stringify(state.stammdaten.mieter)),digest,"Nur-Ansehen-Filter mutierte Mietverhältnisse");
   const flow=await page.evaluate(()=>{const notice=document.querySelector('[data-tenant-readonly-notice]').getBoundingClientRect(),summary=document.querySelector('.tenant-summary-grid').getBoundingClientRect();return{noticeBottom:notice.bottom,summaryTop:summary.top,height:notice.height,scrollHeight:document.querySelector('[data-tenant-readonly-notice]').scrollHeight}});
   assert.ok(flow.summaryTop>=flow.noticeBottom,JSON.stringify(flow));assert.ok(flow.height>=flow.scrollHeight-1,JSON.stringify(flow));
   await prepareScreenshot(page);await page.screenshot({path:path.join(screenshotDir,"05_mietverhaeltnisse_nur_ansehen.png"),fullPage:true});clean();await page.close();
  }
  for(const [tab,file] of [["wasser","02_zaehler_schmal.png"],["mieterverwaltung","04_mietverhaeltnisse_schmal.png"]]){
   const {page,clean}=await newApp(browser,tab,{width:390,height:844});await noPageOverflow(page);
   if(tab==="wasser")await whiteInset(page,"#wasser .meter-inventory-table-wrap","#meterInventoryDummyTable",true);else await whiteInset(page,"#mieterverwaltung .tenant-management-table-wrap","#startTenantTable",true);
   await prepareScreenshot(page);await page.screenshot({path:path.join(screenshotDir,file),fullPage:true});clean();await page.close();
  }
  console.log("AP22F5B browser test: PASS (Zähler-DUMMY, Mietverhältnisse, Pflegewege, Nur ansehen, Filter, Archiv, Desktop und 390 px)");
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
