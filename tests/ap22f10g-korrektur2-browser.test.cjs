"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const root = path.resolve(__dirname,"..");
const origin = "http://nkpro-k2.test";
const sourcePath = process.env.AP22F10G_REAL_JSON || path.join(root,"testdaten","basis","standardfall.json");
const referenceData = JSON.parse(fs.readFileSync(sourcePath,"utf8"));
const screenshotDir = path.join(root,"AP22F10G_B_Korrektur2_Screenshots");
const reportFile = path.join(root,"AP22F10G_B_Korrektur2_Dokumentation","browser-test-results.json");
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
async function openApp(browser,viewport={width:1440,height:1000}){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push({type:"pageerror",text:error.message}));
  page.on("console",message=>{if(message.type()==="error")errors.push({type:"console.error",text:message.text()});});
  await installStorage(page,{});await installRoutes(page);
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8").replace(/<head>/i,`<head><base href="${origin}/">`);
  await page.setContent(html,{waitUntil:"load"});
  await page.waitForFunction(()=>globalThis.NKProRuntimeDiagnostics&&NKProRuntimeDiagnostics.snapshot().startup&&NKProRuntimeDiagnostics.snapshot().startup.ok===true,{timeout:30000});
  return {context,page,errors};
}
async function loadReference(page){
  await page.evaluate(raw=>{replaceApplicationState(normalizeLoadedData(JSON.parse(JSON.stringify(raw))));prepareStateForPersistence("AP22F10G-B Korrektur 2 Browserreferenz");renderAll({forceAll:true,reason:"ap22f10g-k2-reference"});switchToTab("start");openCurrentBillingForEdit();switchToTab("manuellewerte");},referenceData);
  await page.waitForTimeout(200);
}
function clean(text){return String(text||"").replace(/\s+/g," ").trim();}

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
  const {context,page,errors}=await openApp(browser);
  const checks=[];
  async function check(number,name,fn){const start=Date.now();try{await fn();checks.push({number,name,status:"PASS",durationMs:Date.now()-start});}catch(error){checks.push({number,name,status:"FAIL",durationMs:Date.now()-start,error:String(error&&error.stack||error)});throw error;}}
  try{
    await loadReference(page);
    await check(1,"Individuelle Werte verwendet dieselbe breite Seitenschale wie Gesamtkosten",async()=>{
      const individual=await page.locator('#manuellewerte .individual-values-page').evaluate(node=>({width:node.getBoundingClientRect().width,left:node.getBoundingClientRect().left,max:getComputedStyle(node).maxWidth}));
      await page.evaluate(()=>switchToTab("einstellungen"));await page.waitForTimeout(80);
      const costs=await page.locator('#einstellungen .nk-ui-page-shell--wide').evaluate(node=>({width:node.getBoundingClientRect().width,left:node.getBoundingClientRect().left,max:getComputedStyle(node).maxWidth}));
      assert.ok(Math.abs(individual.width-costs.width)<=1.5,{individual,costs});
      assert.ok(Math.abs(individual.left-costs.left)<=1.5,{individual,costs});
      assert.equal(individual.max,"1440px");
      await page.evaluate(()=>switchToTab("manuellewerte"));await page.waitForTimeout(80);
    });
    await check(2,"Verbrauchstabelle benötigt auf 1440-Pixel-Desktop keinen Horizontal-Scroll",async()=>{
      const m=await page.locator('[data-individual-section="consumption"] .individual-values-table-wrap').first().evaluate(node=>({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,overflow:getComputedStyle(node).overflowX}));
      assert.ok(m.scrollWidth<=m.clientWidth+1,m);
    });
    await check(3,"Manuelle Tabelle benötigt auf 1440-Pixel-Desktop keinen Horizontal-Scroll",async()=>{
      const m=await page.locator('[data-individual-section="manual"] .individual-values-table-wrap').first().evaluate(node=>({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth}));
      assert.ok(m.scrollWidth<=m.clientWidth+1,m);
    });
    await check(4,"Tabellen behalten links und rechts den freigegebenen Innenabstand",async()=>{
      const results=await page.locator('#manuellewerte [data-individual-section] .individual-values-table-wrap').evaluateAll(nodes=>nodes.map(node=>{const card=node.closest('.individual-values-card').getBoundingClientRect(),box=node.getBoundingClientRect();return {left:box.left-card.left,right:card.right-box.right};}));
      assert.ok(results.length>=2,results);
      for(const row of results){assert.ok(row.left>=15&&row.right>=15,row);}
    });
    await check(5,"Zählerfarbmarkierungen bleiben erhalten",async()=>{
      const cold=page.locator('.individual-values-meter-dot.is-cold-water').first();
      const hot=page.locator('.individual-values-meter-dot.is-hot-water').first();
      assert.equal(await cold.evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(25, 118, 200)');
      assert.equal(await hot.evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(213, 40, 47)');
      assert.match(clean(await cold.locator('xpath=..').textContent()),/Kaltwasserzähler/);
      assert.match(clean(await hot.locator('xpath=..').textContent()),/Warmwasserzähler/);
    });
    await check(6,"Übernommene Anfangsstände bleiben gesperrt",async()=>{
      const field=page.locator('[data-meter-id="Z-WASSER-KW-W000.UG"][data-field="start"]');
      assert.equal(await field.isDisabled(),true);
      assert.equal(await field.getAttribute('data-individual-transferred-start'),'true');
    });
    await check(7,"Realer Datenbestand bleibt vollständig erhalten",async()=>{
      assert.equal(await page.locator('[data-cost-id="K006"][data-case-key="vacancy:W006.DG-R:2025-01-01:2025-12-31"][data-field="amount"]').inputValue(),'488,08');
      const result=await page.evaluate(()=>({year:state.meta.abrechnungsjahr,schema:state.meta.dataSchemaVersion,archives:(state.jahresArchiv||[]).length}));
      assert.equal(result.year,'2025');assert.equal(result.schema,5);assert.ok(result.archives>=1);
    });
    await page.screenshot({path:path.join(screenshotDir,'01_desktop_breite_wie_gesamtkosten_ohne_tabellenscroll.png'),fullPage:true});
    await check(8,"Breiter Desktop bleibt ebenfalls ohne Horizontal-Scroll",async()=>{
      await page.setViewportSize({width:1640,height:1000});await page.waitForTimeout(100);
      const values=await page.locator('#manuellewerte .individual-values-table-wrap').evaluateAll(nodes=>nodes.map(node=>({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth})));
      for(const value of values) assert.ok(value.scrollWidth<=value.clientWidth+1,value);
    });
    await check(9,"Schmale Ansicht verwendet weiterhin nur internen Tabellen-Scroll",async()=>{
      await page.setViewportSize({width:760,height:900});await page.waitForTimeout(100);
      const m=await page.locator('[data-individual-section="consumption"] .individual-values-table-wrap').first().evaluate(node=>({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,global:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
      assert.ok(m.scrollWidth>m.clientWidth,m);assert.ok(m.global<=2,m);
      await page.screenshot({path:path.join(screenshotDir,'02_schmale_ansicht_nur_interner_tabellenscroll.png'),fullPage:true});
    });
    assert.deepEqual(errors,[]);
  } finally {
    const report={generatedAt:new Date().toISOString(),appVersion:'V99.4.60',sourceFile:path.basename(sourcePath),summary:{passed:checks.filter(row=>row.status==='PASS').length,failed:checks.filter(row=>row.status==='FAIL').length,total:checks.length},checks,runtimeErrors:errors};
    fs.writeFileSync(reportFile,JSON.stringify(report,null,2));
    await context.close().catch(()=>{});await browser.close();
  }
  console.log(`AP22F10G-B Korrektur 2 browser checks: ${checks.length}/${checks.length} PASS`);
})().catch(error=>{console.error(error);process.exitCode=1;});
