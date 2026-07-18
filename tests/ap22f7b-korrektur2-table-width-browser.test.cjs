"use strict";
const assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const {openFreshApp,loadFixture,attachRuntimeGuards}=require('./test-helpers.cjs');
const groups={
 archiv:['archiveRecordsTable'],start:['startArchiveTable'],mieterverwaltung:['startTenantTable'],wohnungsverwaltung:['startUnitTable'],
 qualitaet:['qualityAcknowledgedTable','qualitySumsTable','qualityRuleRegistryTable'],einstellungen:['settingsTable','kostenMieterUmlageTable'],
 mieter:['mieterTable','wohnungenTable'],einnahmen:['einnahmenTable','vorauszahlungenTable'],wasser:['meterInventoryDummyTable'],
 umlage:['umlageSummaryTable','umlageCostsTable','umlageUnitProofTable'],vorauszahlungsanpassung:['vorauszahlungAdjustSummaryTable','vorauszahlungAdjustDetailTable']
};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1720,height:1100},locale:'de-DE',timezoneId:'Europe/Berlin',serviceWorkers:'block'});
 const page=await context.newPage(); const runtime=attachRuntimeGuards(page);
 await openFreshApp(page); await loadFixture(page,'standardfall.json');
 await page.evaluate(()=>{NK_PRO_MODULES.billingContext.open({recordKey:'current',recordType:'current',label:'2025'},NK_PRO_MODULES.billingContext.MODES.EDIT);document.documentElement.dataset.billingExplicitlyOpened='true';renderAll({forceAll:true,reason:'project-table-width-audit'});});
 const all=[];
 for(const viewport of [{width:1720,height:1100},{width:620,height:900},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   for(const [tab,ids] of Object.entries(groups)){
     await page.evaluate(tab=>{switchToTab(tab);document.querySelectorAll(`#${CSS.escape(tab)} details`).forEach(d=>d.open=true);renderAll({forceAll:true,reason:'project-table-width-audit-tab'});},tab);
     await page.waitForTimeout(40);
     const measurements=await page.evaluate(ids=>ids.map(id=>{
       const table=document.getElementById(id); if(!table)return {id,missing:true};
       const wrap=table.closest('.nk-ui-table-wrap'); if(!wrap)return {id,missingWrap:true};
       const cs=getComputedStyle(wrap), tr=table.getBoundingClientRect();
       const contentWidth=wrap.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
       return {id,tableWidth:+tr.width.toFixed(2),contentWidth:+contentWidth.toFixed(2),rightGap:+Math.max(0,contentWidth-tr.width).toFixed(2),internalOverflow:wrap.scrollWidth-wrap.clientWidth};
     }),ids);
     const docOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
     all.push({viewport:viewport.width,tab,docOverflow,measurements});
     assert.ok(docOverflow<=1,`${viewport.width}/${tab}: page overflow ${docOverflow}`);
     for(const m of measurements){assert.ok(!m.missing&&!m.missingWrap,`${viewport.width}/${tab}/${m.id}: missing`); assert.ok(m.rightGap<=1,`${viewport.width}/${tab}/${m.id}: right gap ${m.rightGap}`);}
   }
 }
 runtime.assertClean();console.log(`AP22F7B Korrektur 2 Tabellenbreite Browser: PASS (${all.reduce((sum,entry)=>sum+entry.measurements.length,0)} Messungen)`); await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
