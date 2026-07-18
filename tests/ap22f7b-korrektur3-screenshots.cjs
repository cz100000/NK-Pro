"use strict";
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards}=require("./test-helpers.cjs");
(async()=>{
 const out=path.resolve(__dirname,"../screenshots/AP22F7B_Korrektur3");fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"]});
 const context=await browser.newContext({viewport:{width:1720,height:1100},locale:"de-DE",timezoneId:"Europe/Berlin",serviceWorkers:"block"});
 const page=await context.newPage();const runtime=attachRuntimeGuards(page);
 await openFreshApp(page);await loadFixture(page,"standardfall.json");
 await page.evaluate(()=>{NK_PRO_MODULES.billingContext.open({recordKey:"current",recordType:"current",label:"2025"},NK_PRO_MODULES.billingContext.MODES.EDIT);document.documentElement.dataset.billingExplicitlyOpened="true";renderAll({forceAll:true,reason:"korr3-screenshots"});});
 async function shot(tab,name,viewport={width:1720,height:1100}){await page.setViewportSize(viewport);await page.evaluate(tab=>{switchToTab(tab);document.querySelectorAll(`#${CSS.escape(tab)} details`).forEach(d=>d.open=true);renderAll({forceAll:true,reason:"korr3-screenshot-tab"});},tab);await page.waitForTimeout(100);await page.screenshot({path:path.join(out,name),fullPage:true});}
 await shot("mieter","01_abrechnung_mietverhaeltnisse_deutsches_datum.png");
 await shot("wohnungsverwaltung","02_wohnungen_rechter_rahmen.png");
 await shot("wasser","03_zaehler_rechter_rahmen.png");
 await shot("mieterverwaltung","04_objekt_mietverhaeltnisse_rechter_rahmen.png");
 await shot("start","05_abrechnungsuebersicht_rechter_rahmen.png");
 await shot("mieter","06_abrechnung_mietverhaeltnisse_620.png",{width:620,height:900});
 runtime.assertClean();await browser.close();console.log(`AP22F7B Korrektur 3 Screenshots: PASS (${fs.readdirSync(out).length})`);
})().catch(error=>{console.error(error);process.exit(1);});
