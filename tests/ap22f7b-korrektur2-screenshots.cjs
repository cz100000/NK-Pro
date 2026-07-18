"use strict";
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards}=require("./test-helpers.cjs");
const out=process.env.AP22F7B_K2_SCREENSHOT_DIR||path.join(process.cwd(),"screenshots","AP22F7B_Korrektur2");
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
 const context=await browser.newContext({viewport:{width:1440,height:1000},locale:"de-DE",timezoneId:"Europe/Berlin",serviceWorkers:"block"});
 const page=await context.newPage();const runtime=attachRuntimeGuards(page);
 await openFreshApp(page);await loadFixture(page,"standardfall.json");
 await page.evaluate(()=>{NK_PRO_MODULES.billingContext.open({recordKey:"current",recordType:"current",label:"2025"},NK_PRO_MODULES.billingContext.MODES.EDIT);document.documentElement.dataset.billingExplicitlyOpened="true";renderAll({forceAll:true,reason:"ap22f7b-k2-screenshots"});});
 async function tab(name){await page.evaluate(name=>{switchToTab(name);document.querySelectorAll(`#${CSS.escape(name)} details`).forEach(d=>d.open=true);renderAll({forceAll:true,reason:"ap22f7b-k2-screenshot-tab"});},name);await page.waitForTimeout(100);}
 await tab("mieter");await page.screenshot({path:path.join(out,"01_abrechnung_mietverhaeltnisse_desktop.png"),fullPage:true});
 await tab("start");await page.screenshot({path:path.join(out,"02_abrechnungsuebersicht_desktop.png"),fullPage:true});
 await tab("mieterverwaltung");await page.screenshot({path:path.join(out,"03_objekt_mietverhaeltnisse_desktop.png"),fullPage:true});
 await tab("wohnungsverwaltung");await page.screenshot({path:path.join(out,"04_wohnungen_desktop.png"),fullPage:true});
 await tab("wasser");await page.screenshot({path:path.join(out,"05_zaehler_desktop.png"),fullPage:true});
 await tab("qualitaet");await page.locator("#qualitySumsTable").scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,"06_pruefung_tabellen_desktop.png"),fullPage:true});
 await tab("einnahmen");await page.screenshot({path:path.join(out,"07_vorauszahlungen_desktop.png"),fullPage:true});
 await tab("umlage");await page.screenshot({path:path.join(out,"08_abrechnungsergebnis_desktop.png"),fullPage:true});
 await page.setViewportSize({width:620,height:900});await tab("mieter");await page.screenshot({path:path.join(out,"09_abrechnung_mietverhaeltnisse_620.png"),fullPage:true});
 await page.setViewportSize({width:390,height:844});await tab("mieter");await page.screenshot({path:path.join(out,"10_abrechnung_mietverhaeltnisse_390.png"),fullPage:true});
 runtime.assertClean();console.log(`AP22F7B Korrektur 2 Screenshots: PASS (${fs.readdirSync(out).length})`);
 await context.close();await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
