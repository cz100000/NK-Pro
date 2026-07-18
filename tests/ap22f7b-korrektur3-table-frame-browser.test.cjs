"use strict";
const assert=require("node:assert/strict");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards}=require("./test-helpers.cjs");
const groups={
 archiv:["archiveRecordsTable"],start:["startArchiveTable"],mieterverwaltung:["startTenantTable"],wohnungsverwaltung:["startUnitTable"],
 qualitaet:["qualityAcknowledgedTable","qualitySumsTable","qualityRuleRegistryTable"],einstellungen:["settingsTable","kostenMieterUmlageTable"],
 mieter:["mieterTable","wohnungenTable"],einnahmen:["einnahmenTable","vorauszahlungenTable"],wasser:["meterInventoryDummyTable"],
 umlage:["umlageSummaryTable","umlageCostsTable","umlageUnitProofTable"],vorauszahlungsanpassung:["vorauszahlungAdjustSummaryTable","vorauszahlungAdjustDetailTable"]
};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
 const context=await browser.newContext({viewport:{width:1720,height:1100},locale:"de-DE",timezoneId:"Europe/Berlin",serviceWorkers:"block"});
 const page=await context.newPage(); const runtime=attachRuntimeGuards(page);
 await openFreshApp(page); await loadFixture(page,"standardfall.json");
 await page.evaluate(()=>{NK_PRO_MODULES.billingContext.open({recordKey:"current",recordType:"current",label:"2025"},NK_PRO_MODULES.billingContext.MODES.EDIT);document.documentElement.dataset.billingExplicitlyOpened="true";renderAll({forceAll:true,reason:"korr3-table-frame"});});
 let checks=0;
 for(const viewport of [{width:1720,height:1100},{width:620,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  for(const [tab,ids] of Object.entries(groups)){
   await page.evaluate(tab=>{switchToTab(tab);document.querySelectorAll(`#${CSS.escape(tab)} details`).forEach(d=>d.open=true);renderAll({forceAll:true,reason:"korr3-table-frame-tab"});},tab);
   await page.waitForTimeout(40);
   const docOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(docOverflow<=1,`${viewport.width}/${tab}: Dokument-Overflow ${docOverflow}`);
   for(const id of ids){
    const result=await page.evaluate(id=>{
     const table=document.getElementById(id); const wrap=table&&table.closest(".nk-ui-table-wrap");
     if(!table||!wrap)return {missing:true};
     const head=table.querySelector("thead tr:first-child > th:last-child");
     const body=table.querySelector("tbody tr:last-child > :last-child")||table.querySelector("tbody tr > :last-child");
     const border=e=>{if(!e)return null;const cs=getComputedStyle(e);return {width:parseFloat(cs.borderRightWidth)||0,style:cs.borderRightStyle,topRadius:parseFloat(cs.borderTopRightRadius)||0,bottomRadius:parseFloat(cs.borderBottomRightRadius)||0};};
     const cs=getComputedStyle(wrap),tr=table.getBoundingClientRect();
     const contentWidth=wrap.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
     return {head:border(head),body:border(body),rightGap:Math.max(0,contentWidth-tr.width)};
    },id);
    assert.ok(!result.missing,`${viewport.width}/${tab}/${id}: Tabelle fehlt`);
    assert.ok(result.rightGap<=1,`${viewport.width}/${tab}/${id}: Restfläche ${result.rightGap}`);
    assert.ok(result.head&&result.head.width>=1&&result.head.style==="solid",`${viewport.width}/${tab}/${id}: rechter Kopfrahmen fehlt`);
    assert.ok(result.body&&result.body.width>=1&&result.body.style==="solid",`${viewport.width}/${tab}/${id}: rechter Datenrahmen fehlt`);
    assert.ok(result.head.topRadius>0,`${viewport.width}/${tab}/${id}: rechter Kopfradius fehlt`);
    checks++;
   }
  }
 }
 await page.setViewportSize({width:1720,height:1100});
 await page.evaluate(()=>{switchToTab("mieter");renderAll({forceAll:true,reason:"korr3-date-format"});});
 const periods=(await page.locator("#mieterTable tbody tr:not(.billing-tenant-detail-row) td:nth-child(3)").allTextContents()).map(v=>v.trim());
 assert.ok(periods.length>0,"Keine Mietzeiträume dargestellt");
 assert.ok(periods.every(value=>/^(?:\d{2}\.\d{2}\.\d{4}|offen) – (?:\d{2}\.\d{2}\.\d{4}|offen)$/.test(value)),`Nicht deutsches Datumsformat: ${periods.join(" | ")}`);
 runtime.assertClean(); await browser.close();
 console.log(`AP22F7B Korrektur 3 Browser: PASS (${checks} Tabellen-/Viewport-Prüfungen, deutsches Mietzeitraumformat)`);
})().catch(error=>{console.error(error);process.exit(1);});
