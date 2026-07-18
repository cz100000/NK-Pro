"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const { chromium }=require("@playwright/test");
const { openFreshApp,loadFixture }=require("./test-helpers.cjs");
const root=path.resolve(__dirname,"..");
const screenshotDir=process.env.AP22F4B_SCREENSHOT_DIR||path.join(root,"screenshots","AP22F4B");
fs.mkdirSync(screenshotDir,{recursive:true});
function guards(page){const errors=[];page.on("console",m=>{if(m.type()==="error")errors.push(`console: ${m.text()}`)});page.on("pageerror",e=>errors.push(`pageerror: ${e.message}`));page.on("requestfailed",r=>errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText||""}`));return()=>assert.deepEqual(errors,[]);}
async function newApp(browser,viewport={width:1440,height:1000}){const page=await browser.newPage({viewport,locale:"de-DE",timezoneId:"Europe/Berlin"});const clean=guards(page);await openFreshApp(page);await loadFixture(page,"standardfall.json");await page.evaluate(()=>{switchToTab("wohnungsverwaltung");renderAll({tabIds:["wohnungsverwaltung"],reason:"ap22f4b-browser"});});await page.waitForSelector("#wohnungsverwaltung.active #startUnitTable tbody tr");return{page,clean};}
async function editField(page,selector,value){const field=page.locator(selector);await field.fill(String(value));await field.blur();await page.waitForTimeout(20);}
async function assertDocumentFlow(page){const boxes=await page.evaluate(()=>{const card=document.querySelector("#wohnungsverwaltung .unit-management-card");const issue=document.querySelector("#wohnungsverwaltung [data-unit-issues]");const note=document.querySelector("#wohnungsverwaltung .unit-management-system-note");const rect=n=>n&& !n.hidden?n.getBoundingClientRect():null;return{card:rect(card),issue:rect(issue),note:rect(note)};});if(boxes.issue){assert.ok(boxes.issue.top>=boxes.card.bottom,JSON.stringify(boxes));assert.ok(boxes.note.top>=boxes.issue.bottom,JSON.stringify(boxes));}else assert.ok(boxes.note.top>=boxes.card.bottom,JSON.stringify(boxes));}
async function assertWhiteTableInset(page,requireFill=false){const layout=await page.evaluate(()=>{const wrap=document.querySelector("#wohnungsverwaltung .unit-management-table-wrap"),table=document.querySelector("#wohnungsverwaltung .unit-management-table"),style=getComputedStyle(wrap),wr=wrap.getBoundingClientRect(),tr=table.getBoundingClientRect();return{paddingLeft:parseFloat(style.paddingLeft),paddingRight:parseFloat(style.paddingRight),paddingTop:parseFloat(style.paddingTop),paddingBottom:parseFloat(style.paddingBottom),background:style.backgroundColor,wrapLeft:wr.left,wrapRight:wr.right,tableLeft:tr.left,tableRight:tr.right,tableWidth:tr.width,contentWidth:wrap.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),scrollWidth:wrap.scrollWidth,clientWidth:wrap.clientWidth};});assert.ok(layout.paddingLeft>=7&&layout.paddingRight>=7&&layout.paddingTop>=7&&layout.paddingBottom>=7,JSON.stringify(layout));assert.ok(layout.tableLeft>=layout.wrapLeft+layout.paddingLeft-1,JSON.stringify(layout));assert.ok(layout.tableWidth>=layout.contentWidth-1,JSON.stringify(layout));assert.match(layout.background,/rgb\(255, 255, 255\)/);if(requireFill){assert.ok(layout.scrollWidth<=layout.clientWidth+2,JSON.stringify(layout));assert.ok(Math.abs(layout.tableWidth-layout.contentWidth)<=2,JSON.stringify(layout));}}
(async()=>{
 const executablePath=process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium";
 const browser=await chromium.launch({headless:true,executablePath,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"]});
 try{
  {
   const {page,clean}=await newApp(browser);
   assert.equal(await page.locator("#wohnungsverwaltung h1").textContent(),"Wohnungen");
   assert.equal(await page.locator("#startUnitTable thead th").count(),7);
   assert.equal(await page.locator("#startUnitTable tbody tr").count(),7);
   assert.equal(await page.locator("#startUnitTable tbody td:first-child input").count(),0,"Wohnungs-ID darf nicht editierbar sein");
   assert.equal(await page.locator("#wohnungsverwaltung .unit-management-row-action").count(),7);
   assert.equal(await page.locator("[data-unit-issues]").isHidden(),true);
   assert.equal(await page.locator("[data-unit-results]").textContent(),"7 von 7 Wohnungen");
   assert.equal(await page.locator("#wohnungsverwaltung .unit-management-card nav").count(),0,"keine künstliche Pagination");
   assert.doesNotMatch(await page.locator("#wohnungsverwaltung").textContent(),/Kostenarten|Umlageschlüssel|Vorauszahlungen|Abrechnungsprüfung/);
   await assertDocumentFlow(page);
   await assertWhiteTableInset(page);
   await page.screenshot({path:path.join(screenshotDir,"01_desktop_vollstaendig.png"),fullPage:true});

   await editField(page,"#unit-bezeichnung-0","UG geprüft");
   await editField(page,"#unit-lage-0","Untergeschoss");
   await editField(page,"#unit-wohnflaeche-0","56,5");
   await editField(page,"#unit-zimmer-0","2,5");
   await editField(page,"#unit-bemerkung-0","Technisch geprüft");
   const edited=await page.evaluate(()=>state.stammdaten.wohnungen[0]);
   assert.equal(edited.bezeichnung,"UG geprüft");assert.equal(edited.lage,"Untergeschoss");assert.equal(edited.wohnflaeche,56.5);assert.equal(edited.zimmer,"2,5");assert.equal(edited.bemerkung,"Technisch geprüft");
   await page.locator("#wohnungsverwaltung [data-page-save]").click();
   await page.waitForFunction(()=>state.meta&&state.meta.lastSavedWithAppVersion==="V99.4.39");
   assert.ok(Object.keys(await page.evaluate(()=>localStorage.__entries())).length>0,"globales Speichern schrieb nicht in den bestehenden Speicher");

   const digestBeforeFilters=await page.evaluate(()=>JSON.stringify(state.stammdaten.wohnungen));
   const search=page.locator('.unit-management-toolbar input[type="search"]');
   await search.fill("DG-Rechts");assert.equal(await page.locator("#startUnitTable tbody tr:visible").count(),1);assert.equal(await page.locator("[data-unit-results]").textContent(),"1 von 7 Wohnungen");
   await page.locator("[data-unit-status-filter]").selectOption("issues");assert.equal(await page.locator("#startUnitTable tbody tr:visible").count(),0);
   await page.locator(".unit-management-toolbar button").click();await page.locator("[data-unit-status-filter]").selectOption("all");assert.equal(await page.locator("#startUnitTable tbody tr:visible").count(),7);
   assert.equal(await page.evaluate(()=>JSON.stringify(state.stammdaten.wohnungen)),digestBeforeFilters,"Suche/Filter mutierten Daten");

   await search.focus();const searchFocus=await search.evaluate(n=>({outline:getComputedStyle(n).outlineStyle,shadow:getComputedStyle(n).boxShadow}));assert.ok(searchFocus.outline!=="none"||searchFocus.shadow!=="none");
   await page.locator("#unit-bemerkung-0").focus();await page.keyboard.press("Tab");const action=page.locator("#startUnitTable tbody tr").first().locator(".unit-management-row-action");assert.equal(await action.evaluate(n=>document.activeElement===n),true);const actionFocus=await action.evaluate(n=>({outline:getComputedStyle(n).outlineStyle,shadow:getComputedStyle(n).boxShadow}));assert.ok(actionFocus.outline!=="none"||actionFocus.shadow!=="none");
   await page.evaluate(()=>switchToTab("objektuebersicht"));assert.equal(await page.locator("#objektuebersicht").getAttribute("class").then(v=>/active/.test(v)),true);
   await page.evaluate(()=>switchToTab("objekt"));assert.equal(await page.locator("#objekt h1").textContent(),"Objektdaten");
   await page.evaluate(()=>switchToTab("wohnungsverwaltung"));
   const layout=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(layout.doc<=layout.client,JSON.stringify(layout));
   clean();await page.close();
  }
  {
   const {page,clean}=await newApp(browser);
   await page.evaluate(()=>{state.objektStandard.einheiten[1].gebaeudeId="GEB-UNBEKANNT-1";state.objektStandard.einheiten[2].gebaeudeId="GEB-UNBEKANNT-2";renderAll({tabIds:["wohnungsverwaltung"],reason:"ap22f4b-issue"});});
   assert.equal(await page.locator("[data-unit-issues]").isVisible(),true);assert.match(await page.locator("[data-unit-issues]").textContent(),/Einheit verweist auf ein unbekanntes Gebäude/);
   assert.equal(await page.locator("#startUnitTable tbody tr.unit-management-row--issue").count(),2);
   assert.equal(await page.locator("[data-unit-issues]").textContent().then(t=>(t.match(/unbekanntes Gebäude/g)||[]).length),2);
   await page.locator("[data-unit-status-filter]").selectOption("issues");assert.equal(await page.locator("#startUnitTable tbody tr:visible").count(),2);assert.equal(await page.locator("[data-unit-results]").textContent(),"2 von 7 Wohnungen");
   await assertDocumentFlow(page);
   await page.screenshot({path:path.join(screenshotDir,"02_desktop_handlungsbedarf.png"),fullPage:true});clean();await page.close();
  }
  {
   const {page,clean}=await newApp(browser);
   await page.evaluate(()=>switchToTab("start"));await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentView"]').click();
   await page.evaluate(()=>{switchToTab("wohnungsverwaltung");renderAll({tabIds:["wohnungsverwaltung"],reason:"ap22f4b-readonly"});});
   assert.equal(await page.locator("[data-unit-readonly-notice]").isVisible(),true);assert.equal(await page.locator("#wohnungsverwaltung [data-page-save]").isDisabled(),true);
   assert.equal(await page.locator("#startUnitTable tbody input:not([readonly])").count(),0);assert.equal(await page.locator("#startUnitTable tbody .unit-management-row-action:not(:disabled)").count(),0);
   const digest=await page.evaluate(()=>JSON.stringify(state.stammdaten.wohnungen));await page.locator('.unit-management-toolbar input[type="search"]').fill("DG");await page.locator("[data-unit-status-filter]").selectOption("all");assert.equal(await page.evaluate(()=>JSON.stringify(state.stammdaten.wohnungen)),digest);
   assert.doesNotMatch(await page.locator("[data-global-billing-context]").textContent(),/Modus\s*:/i);
   const flow=await page.evaluate(()=>{const context=document.querySelector('[data-global-billing-context]').getBoundingClientRect();const notice=document.querySelector('[data-unit-readonly-notice]').getBoundingClientRect();const header=document.querySelector('#wohnungsverwaltung .page-header').getBoundingClientRect();return{contextBottom:context.bottom,noticeTop:notice.top,noticeBottom:notice.bottom,headerTop:header.top};});assert.ok(flow.noticeTop>=flow.contextBottom-1,JSON.stringify(flow));assert.ok(flow.headerTop>=flow.noticeBottom,JSON.stringify(flow));
   await page.screenshot({path:path.join(screenshotDir,"03_nur_ansehen.png"),fullPage:true});clean();await page.close();
  }
  for(const viewport of [{width:620,height:800},{width:390,height:844}]){
   const {page,clean}=await newApp(browser,viewport);
   const layout=await page.evaluate(()=>{const wrap=document.querySelector("#wohnungsverwaltung .unit-management-table-wrap");const note=document.querySelector("#wohnungsverwaltung .unit-management-system-note");return{doc:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,wrapClient:wrap.clientWidth,wrapScroll:wrap.scrollWidth,noteTop:note.getBoundingClientRect().top,tableBottom:wrap.getBoundingClientRect().bottom,noteHeight:note.getBoundingClientRect().height,scrollHeight:note.scrollHeight};});
   assert.ok(layout.doc<=layout.client,JSON.stringify(layout));assert.ok(layout.wrapScroll>layout.wrapClient,JSON.stringify(layout));assert.ok(layout.noteTop>=layout.tableBottom,JSON.stringify(layout));assert.ok(layout.noteHeight>=layout.scrollHeight-1,JSON.stringify(layout));
   if(viewport.width===390)await page.screenshot({path:path.join(screenshotDir,"04_schmale_ansicht.png"),fullPage:true});clean();await page.close();
  }
  {
   const {page,clean}=await newApp(browser,{width:1648,height:894});
   await assertWhiteTableInset(page,true);
   const pageLayout=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(pageLayout.doc<=pageLayout.client,JSON.stringify(pageLayout));
   await page.screenshot({path:path.join(screenshotDir,"05_desktop_weisser_innenrand.png"),fullPage:true});clean();await page.close();
  }
  {
   const {page,clean}=await newApp(browser,{width:720,height:900});
   await page.evaluate(()=>{state.objektStandard.einheiten[0].gebaeudeId="GEB-UNBEKANNT";renderAll({tabIds:["wohnungsverwaltung"],reason:"ap22f4b-zoom"});document.documentElement.style.fontSize="200%";});await page.waitForTimeout(50);
   const flow=await page.evaluate(()=>{const issue=document.querySelector('[data-unit-issues]'),note=document.querySelector('.unit-management-system-note');return{doc:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,issueHeight:issue.getBoundingClientRect().height,issueScroll:issue.scrollHeight,noteTop:note.getBoundingClientRect().top,issueBottom:issue.getBoundingClientRect().bottom};});assert.ok(flow.doc<=flow.client,JSON.stringify(flow));assert.ok(flow.issueHeight>=flow.issueScroll-1,JSON.stringify(flow));assert.ok(flow.noteTop>=flow.issueBottom,JSON.stringify(flow));clean();await page.close();
  }
  console.log("AP22F4B housing management browser test: PASS (Desktop, weißer Tabelleninnenrand, Handlungsbedarf, Nur ansehen, 620 px, 390 px, 200-%-Äquivalent)");
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
