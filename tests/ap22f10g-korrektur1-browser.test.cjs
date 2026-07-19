"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const root = path.resolve(__dirname,"..");
const origin = "http://nkpro-k1.test";
const sourcePath = process.env.AP22F10G_REAL_JSON || path.join(root,"testdaten","basis","standardfall.json");
const referenceData = JSON.parse(fs.readFileSync(sourcePath,"utf8"));
const screenshotDir = path.join(root,"AP22F10G_B_Korrektur1_Screenshots");
const reportFile = path.join(root,"AP22F10G_B_Korrektur1_Dokumentation","browser-test-results.json");
fs.mkdirSync(screenshotDir,{recursive:true});
fs.mkdirSync(path.dirname(reportFile),{recursive:true});

function contentType(filePath){return ({".css":"text/css",".js":"text/javascript",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml"})[path.extname(filePath).toLowerCase()]||"text/plain";}
async function installRoutes(page){
  await page.route(`${origin}/**`,async route=>{
    const url=new URL(route.request().url());
    const relative=url.pathname==="/"?"index.html":url.pathname.replace(/^\/+/,"");
    const filePath=path.resolve(root,relative);
    if(!filePath.startsWith(root+path.sep)||!fs.existsSync(filePath))return route.fulfill({status:404,body:"Not found"});
    return route.fulfill({status:200,contentType:contentType(filePath),body:fs.readFileSync(filePath)});
  });
}
async function installStorage(page,entries={}){
  await page.evaluate(initial=>{
    const store=new Map(Object.entries(initial||{}).map(([key,value])=>[String(key),String(value)]));
    const mock={get length(){return store.size;},key(index){return [...store.keys()][Number(index)]??null;},getItem(key){key=String(key);return store.has(key)?store.get(key):null;},setItem(key,value){store.set(String(key),String(value));},removeItem(key){store.delete(String(key));},clear(){store.clear();},__entries(){return Object.fromEntries(store.entries());}};
    Object.defineProperty(window,"localStorage",{value:mock,configurable:true});window.alert=()=>{};window.confirm=()=>true;
  },entries);
}
async function openApp(browser,entries={},viewport={width:1440,height:1000}){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});const page=await context.newPage();const errors=[];
  page.on("pageerror",error=>errors.push({type:"pageerror",text:error.message}));page.on("console",message=>{if(message.type()==="error")errors.push({type:"console.error",text:message.text()});});
  await installStorage(page,entries);await installRoutes(page);
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8").replace(/<head>/i,`<head><base href="${origin}/">`);
  await page.setContent(html,{waitUntil:"load"});
  await page.waitForFunction(()=>globalThis.NKProRuntimeDiagnostics&&NKProRuntimeDiagnostics.snapshot().startup&&NKProRuntimeDiagnostics.snapshot().startup.ok===true,{timeout:30000});
  return {context,page,errors};
}
async function loadReference(page){
  await page.evaluate(raw=>{replaceApplicationState(normalizeLoadedData(JSON.parse(JSON.stringify(raw))));prepareStateForPersistence("AP22F10G-B Korrektur 1 Browserreferenz");renderAll({forceAll:true,reason:"ap22f10g-k1-reference"});switchToTab("start");openCurrentBillingForEdit();switchToTab("manuellewerte");},referenceData);
  await page.waitForTimeout(180);
}
async function fillChange(page,selector,value){const field=page.locator(selector).first();await field.fill(String(value));await field.evaluate(node=>node.dispatchEvent(new Event("change",{bubbles:true})));await page.waitForTimeout(100);}
function clean(text){return String(text||"").replace(/\s+/g," ").trim();}

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
  let app=await openApp(browser);let {page,context,errors}=app;const checks=[];
  async function check(number,name,fn){const start=Date.now();try{await fn();checks.push({number,name,status:"PASS",durationMs:Date.now()-start});}catch(error){checks.push({number,name,status:"FAIL",durationMs:Date.now()-start,error:String(error&&error.stack||error)});throw error;}}
  try{
    await loadReference(page);
    await check(1,"Breite Standard-Seitenschale",async()=>{const size=await page.locator('#manuellewerte .individual-values-page').evaluate(node=>({width:node.getBoundingClientRect().width,max:getComputedStyle(node).maxWidth,left:node.getBoundingClientRect().left,right:innerWidth-node.getBoundingClientRect().right}));assert.ok(size.width<=1440.5,JSON.stringify(size));assert.equal(size.max,"1440px");});
    await check(2,"Tabellen besitzen linken und rechten Innenabstand",async()=>{const m=await page.locator('[data-individual-section="consumption"] .individual-values-table-wrap').evaluate(node=>{const card=node.closest('.individual-values-card').getBoundingClientRect(),box=node.getBoundingClientRect();return {left:box.left-card.left,right:card.right-box.right};});assert.ok(m.left>=15&&m.right>=15,JSON.stringify(m));});
    await check(3,"Kaltwasserzähler mit blauem Punkt",async()=>{const marker=page.locator('[data-meter-row^="Z-WASSER-KW-"] .individual-values-meter-dot.is-cold-water').first();assert.equal(await marker.count(),1);assert.match(clean(await marker.locator('xpath=..').textContent()),/Kaltwasserzähler/);assert.equal(await marker.evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(25, 118, 200)');});
    await check(4,"Warmwasserzähler mit rotem Punkt",async()=>{const marker=page.locator('[data-meter-row^="Z-WASSER-WW-"] .individual-values-meter-dot.is-hot-water').first();assert.equal(await marker.count(),1);assert.match(clean(await marker.locator('xpath=..').textContent()),/Warmwasserzähler/);assert.equal(await marker.evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(213, 40, 47)');});
    const meterId='Z-WASSER-KW-W000.UG';
    const startSelector=`[data-meter-id="${meterId}"][data-field="start"]`;
    await check(5,"Übernommener Anfangsstand ist gesperrt und ausgegraut",async()=>{const field=page.locator(startSelector);assert.equal(await field.isDisabled(),true);assert.equal(await field.getAttribute('data-individual-transferred-start'),'true');const bg=await field.evaluate(node=>getComputedStyle(node).backgroundColor);assert.equal(bg,'rgb(238, 241, 244)');assert.match(clean(await field.locator('xpath=..').textContent()),/Aus Vorjahr übernommen/);});
    await check(6,"Endstand bleibt regulär bearbeitbar",async()=>{assert.equal(await page.locator(`[data-meter-id="${meterId}"][data-field="end"]`).isEnabled(),true);});
    await page.screenshot({path:path.join(screenshotDir,'01_desktop_kompakte_breite_und_zaehlermarker.png'),fullPage:true});
    await check(7,"Sonderfallaktion verlangt bewusste Freigabe",async()=>{await page.locator(`[data-meter-row="${meterId}"] [data-individual-special]`).click();const dialog=page.locator('#individualSpecialDialog');assert.equal(await dialog.evaluate(node=>node.open),true);const checkbox=dialog.locator('[data-individual-start-override]');assert.equal(await checkbox.isEnabled(),true);assert.equal(await checkbox.isChecked(),false);assert.match(clean(await dialog.textContent()),/Übernommenen Anfangsstand als Sonderfall/);await dialog.screenshot({path:path.join(screenshotDir,'02_sonderfall_freigabe_anfangsstand.png')});});
    await check(8,"Sonderfallfreigabe entsperrt ausschließlich den gewählten Anfangsstand",async()=>{const dialog=page.locator('#individualSpecialDialog');await dialog.locator('[data-individual-start-override]').check();await dialog.locator('[data-individual-special-note]').fill('Prüfung Korrektur 1');await dialog.locator('[data-individual-special-save]').click();assert.equal(await page.locator(startSelector).isEnabled(),true);assert.equal(await page.locator('[data-meter-id="Z-WASSER-WW-W000.UG"][data-field="start"]').isDisabled(),true);const count=await page.evaluate(id=>(state.meta.individualValuesStartOverrides||[]).filter(row=>row.meterId===id).length,meterId);assert.equal(count,1);});
    await check(9,"Freigegebener Sonderfall kann geändert und gespeichert werden",async()=>{await fillChange(page,startSelector,'489,50');assert.match(clean(await page.locator(`[data-meter-row="${meterId}"] [data-meter-consumption] strong`).textContent()),/74,90/);await page.locator('[data-individual-save-section="consumption"]').first().click();await page.waitForTimeout(180);assert.match(clean(await page.locator('#individualSaveNotice').textContent()),/erfolgreich gespeichert.*zurückgelesen/i);});
    let stored={};
    await check(10,"Freigabe und Wert bestehen nach Browser-Neuladen fort",async()=>{stored=await page.evaluate(()=>localStorage.__entries());await context.close();app=await openApp(browser,stored);page=app.page;context=app.context;errors=errors.concat(app.errors);await page.evaluate(()=>{switchToTab("start");openCurrentBillingForEdit();switchToTab("manuellewerte");});await page.waitForTimeout(180);assert.equal(await page.locator(startSelector).isEnabled(),true);assert.equal(await page.locator(startSelector).inputValue(),'489,5');assert.equal(await page.evaluate(id=>(state.meta.individualValuesStartOverrides||[]).filter(row=>row.meterId===id).length,meterId),1);});
    await check(11,"Wiederholte Sonderfallaktion erzeugt keine Dublette",async()=>{await page.locator(`[data-meter-row="${meterId}"] [data-individual-special]`).click();const checkbox=page.locator('#individualSpecialDialog [data-individual-start-override]');assert.equal(await checkbox.isChecked(),true);assert.equal(await checkbox.isDisabled(),true);await page.locator('#individualSpecialDialog [data-individual-special-save]').click();assert.equal(await page.evaluate(id=>(state.meta.individualValuesStartOverrides||[]).filter(row=>row.meterId===id).length,meterId),1);});
    await check(12,"Reale manuelle Einzelwerte bleiben erhalten",async()=>{assert.equal(await page.locator('[data-cost-id="K006"][data-case-key="vacancy:W006.DG-R:2025-01-01:2025-12-31"][data-field="amount"]').inputValue(),'488,08');assert.equal(await page.locator('[data-cost-id="K006"][data-case-key="private:M000:W000.UG:2025-01-01:2025-12-31"][data-field="amount"]').inputValue(),'2732,43');});
    await check(13,"Gesamtbestand und Jahresarchiv bleiben vorhanden",async()=>{const result=await page.evaluate(()=>({year:state.meta.abrechnungsjahr,schema:state.meta.dataSchemaVersion,archives:(state.jahresArchiv||[]).length,scope:state.meta.exportScope}));assert.equal(result.year,'2025');assert.equal(result.schema,5);assert.ok(result.archives>=1);assert.equal(result.scope,'fullArchiveAndCurrentBilling');});
    await check(14,"Schmale Ansicht scrollt nur innerhalb der Tabelle horizontal",async()=>{await page.setViewportSize({width:760,height:900});await page.waitForTimeout(100);const result=await page.locator('[data-individual-section="consumption"] .individual-values-table-wrap').evaluate(node=>({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,bodyOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}));assert.ok(result.scrollWidth>result.clientWidth,result);assert.ok(result.bodyOverflow<=2,result);await page.screenshot({path:path.join(screenshotDir,'03_schmale_ansicht_interner_tabellenscroll.png'),fullPage:true});});
    await check(15,"Browserzoom 125 Prozent bleibt ohne globalen Horizontalversatz",async()=>{await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.body.style.zoom='1.25');await page.waitForTimeout(100);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert.ok(overflow<=2,{overflow});await page.screenshot({path:path.join(screenshotDir,'04_browserzoom_125_prozent.png'),fullPage:true});});
    assert.deepEqual(errors,[]);
  } finally {
    const report={generatedAt:new Date().toISOString(),appVersion:'V99.4.60',sourceFile:path.basename(sourcePath),summary:{passed:checks.filter(row=>row.status==='PASS').length,failed:checks.filter(row=>row.status==='FAIL').length,total:checks.length},checks,runtimeErrors:errors};
    fs.writeFileSync(reportFile,JSON.stringify(report,null,2));
    await context.close().catch(()=>{});await browser.close();
  }
  console.log(`AP22F10G-B Korrektur 1 browser checks: ${checks.length}/${checks.length} PASS`);
})().catch(error=>{console.error(error);process.exitCode=1;});
