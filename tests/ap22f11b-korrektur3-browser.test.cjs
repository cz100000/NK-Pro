"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { chromium } = require("/mnt/data/ap22f11b_workspace/source/node_modules/playwright");

const ROOT = path.resolve(__dirname, "..");
const DATA = "/mnt/data/nk-pro-gesamtbestand-2025-V99.4.63-AP22F11B-Korrektur2-getestet.json";
const ORIGIN = "http://nkpro-ap22f11b-k3.test";
const SHOT_DIR = path.join(ROOT, "AP22F11B_Korrektur3_Screenshots");
fs.mkdirSync(SHOT_DIR, { recursive:true });

async function mount(browser, viewport={width:1440,height:1000}) {
  const context = await browser.newContext({viewport});
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors=[];
  page.on("pageerror", error=>errors.push(`PAGE: ${error.stack||error.message}`));
  page.on("console", message=>{ if(message.type()==="error") errors.push(`CONSOLE: ${message.text()}`); });
  await page.route(`${ORIGIN}/**`, async route=>{
    const url=new URL(route.request().url());
    const rel=url.pathname==="/"?"index.html":url.pathname.replace(/^\/+/,"").split("?")[0];
    const file=path.resolve(ROOT,rel);
    const types={".css":"text/css",".js":"text/javascript",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml"};
    if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)) return route.fulfill({status:404,body:"not found"});
    return route.fulfill({status:200,contentType:types[path.extname(file).toLowerCase()]||"text/html",body:fs.readFileSync(file)});
  });
  await page.evaluate(()=>{
    const store=new Map();
    const mock={get length(){return store.size;},key(i){return [...store.keys()][i]??null;},getItem(k){return store.get(String(k))??null;},setItem(k,v){store.set(String(k),String(v));},removeItem(k){store.delete(String(k));},clear(){store.clear();}};
    Object.defineProperty(window,"localStorage",{value:mock,configurable:true});
    window.alert=()=>{}; window.confirm=()=>true;
  });
  const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8").replace(/<head>/i,`<head><base href="${ORIGIN}/">`);
  await page.setContent(html,{waitUntil:"load"});
  await page.waitForFunction(()=>globalThis.NKProQualityRules&&globalThis.NKProBillingWorkflow&&typeof state!=="undefined"&&typeof switchToTab==="function");
  return {context,page,errors};
}

async function importData(page){
  await page.setInputFiles("#jsonImport",DATA);
  await page.waitForFunction(()=>state?.meta?.abrechnungsjahr==="2025"&&state?.kostenarten?.some(row=>row?.id==="K006"));
  await page.waitForTimeout(500);
}
async function openPage(page,tab){
  await page.evaluate(tabId=>{openCurrentBillingForEdit();switchToTab(tabId);},tab);
  await page.waitForSelector(`#${tab}.active`);
  await page.waitForTimeout(180);
}

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
  let session;
  try{
    session=await mount(browser);
    const {page,errors}=session;
    await importData(page);
    await openPage(page,"qualitaet");
    await page.waitForSelector("#qualityOpenTasksTable tbody tr");

    const nav=await page.evaluate(()=>[...document.querySelectorAll(".nav-group")].map(group=>({heading:group.querySelector(".nav-group-label")?.textContent.trim(),items:[...group.querySelectorAll(".nav-item-label")].map(n=>n.textContent.trim())})));
    const billing=nav.find(g=>g.heading==="Nebenkosten abrechnen");
    const analysis=nav.find(g=>g.heading==="Analyse");
    assert.ok(billing.items.includes("Prüfen und abschließen"));
    assert.deepStrictEqual(analysis.items,["Auswertungen","Regelinventar"]);
    assert.ok(billing.items.indexOf("Vorauszahlungen anpassen")<billing.items.indexOf("Prüfen und abschließen"));

    assert.strictEqual(await page.locator("#qualityStatusCards .quality-finalization-kpi").count(),4);
    assert.match(await page.locator("#qualitaet .page-header__title").innerText(),/Prüfen und abschließen/);
    assert.strictEqual(await page.locator("#qualitaet").getByText("Regelübersicht",{exact:true}).count(),0);
    assert.ok(await page.locator("#qualityOpenTasksTable tbody tr").count()>=1);
    assert.ok(await page.locator("#qualityAcknowledgedTable tbody tr").count()>=1);
    assert.strictEqual(await page.locator("#qualityCompletionCard").count(),1);
    const completionButton=page.locator("#qualityCompletionCard .quality-completion-action");
    if(await completionButton.isDisabled()){
      const bg=await completionButton.evaluate(el=>getComputedStyle(el).backgroundColor);
      assert.notStrictEqual(bg,"rgb(15, 108, 189)","disabled completion action must not look active");
    }

    const firstTitle=page.locator("#qualityOpenTasksTable .quality-task-title").first();
    if(await firstTitle.count()){
      await firstTitle.click();
      await page.waitForSelector("#qualityDetailDialog[open]");
      assert.match(await page.locator("#qualityDetailContent").innerText(),/Regel-ID/i);
      await page.locator("#qualityDetailDialog button[value='cancel']").click();
    }

    const beforeCount=await page.locator("#qualityOpenTasksTable tbody tr").count();
    await page.locator("#qualityOpenOnlyToggle").click();
    await page.waitForTimeout(100);
    const afterCount=await page.locator("#qualityOpenTasksTable tbody tr").count();
    assert.ok(afterCount>=beforeCount,"showing hints must not reduce rows");
    await page.locator("#qualityOpenOnlyToggle").click();
    await page.waitForTimeout(100);

    const desktop=await page.evaluate(()=>({overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),shell:document.querySelector("#qualitaet .app-page")?.clientWidth}));
    assert.strictEqual(desktop.overflow,0);
    assert.ok(desktop.shell>900);
    await page.screenshot({path:path.join(SHOT_DIR,"01_pruefen_und_abschliessen_desktop_1440.png"),fullPage:true});

    await openPage(page,"regelinventar");
    await page.waitForSelector("#qualityRuleRegistryTable tbody tr");
    assert.strictEqual(await page.locator("#ruleInventoryKpis .rule-inventory-kpi").count(),4);
    const allCount=await page.locator("#qualityRuleRegistryTable tbody tr").count();
    assert.ok(allCount>=40,`registry rows ${allCount}`);
    await page.locator("#ruleInventorySearch").fill("Wasser");
    await page.waitForTimeout(120);
    const filtered=await page.locator("#qualityRuleRegistryTable tbody tr").count();
    assert.ok(filtered>0&&filtered<allCount,`filtered ${filtered}/${allCount}`);
    assert.match(await page.locator("#ruleInventoryResultCount").innerText(),/von/);
    const info=page.locator("#qualityRuleRegistryTable [data-ui-action='quality.openDetail']").first();
    if(await info.count()){
      await info.click();
      await page.waitForSelector("#qualityDetailDialog[open]");
      await page.locator("#qualityDetailDialog button[value='cancel']").click();
    }
    await page.locator("#ruleInventorySearch").fill("");
    await page.waitForTimeout(120);
    await page.screenshot({path:path.join(SHOT_DIR,"02_regelinventar_desktop_1440.png"),fullPage:true});

    await openPage(page,"qualitaet");
    await page.setViewportSize({width:760,height:980});
    await page.waitForTimeout(180);
    const narrow=await page.evaluate(()=>({overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),table:document.querySelector("#qualityOpenTasksTable")?.scrollWidth,wrap:document.querySelector("#qualityOpenTasksTable")?.closest(".nk-ui-table-wrap")?.clientWidth}));
    assert.strictEqual(narrow.overflow,0);
    assert.ok(narrow.table>narrow.wrap,"table scroll stays internal on narrow view");
    await page.screenshot({path:path.join(SHOT_DIR,"03_pruefen_und_abschliessen_schmal_760.png"),fullPage:true});

    assert.deepStrictEqual(errors,[]);
    console.log("AP22F11B Korrektur 3 browser checks passed");
  } finally {
    if(session) await session.context.close();
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
