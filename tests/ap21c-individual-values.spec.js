"use strict";
const fs=require("node:fs");
const path=require("node:path");
const { test, expect }=require("@playwright/test");
const { root, appHtml, attachRuntimeGuards, loadFixture }=require("./test-helpers.cjs");
function inlineApplicationHtml(){
 let html=appHtml;
 const css=fs.readFileSync(path.join(root,"assets","app.css"),"utf8");
 html=html.replace(/<link[^>]+href=["']\.\/assets\/app\.css[^"']*["'][^>]*>/i,`<style>${css}</style>`);
 html=html.replace(/<link[^>]+rel=["'](?:preload|manifest|icon|apple-touch-icon)["'][^>]*>/gi,"");
 html=html.replace(/\s(?:src|href)=["']\.\/assets\/brand\/[^"']+["']/gi,"");
 html=html.replace(/<script([^>]*?)src=["']\.\/js\/([^"'?]+)(?:\?[^"']*)?["']([^>]*)><\/script>/gi,(_m,b,f,a)=>f==="service-worker-register.js"?"":`<script${b}${a}>${fs.readFileSync(path.join(root,"js",f),"utf8")}</script>`);
 const storage=`<script>(()=>{const store=new Map();const mock={get length(){return store.size},key(i){return [...store.keys()][Number(i)]??null},getItem(k){k=String(k);return store.has(k)?store.get(k):null},setItem(k,v){store.set(String(k),String(v))},removeItem(k){store.delete(String(k))},clear(){store.clear()}};Object.defineProperty(window,"localStorage",{value:mock,configurable:true});window.alert=()=>{};window.confirm=()=>true;window.prompt=()=>"";})();</script>`;
 return html.replace(/<head>/i,`<head>${storage}`);
}
async function openPage(page){
 await page.setContent(inlineApplicationHtml(),{waitUntil:"load",timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.v992Audit==="passed");
 await loadFixture(page,"alle-eingabequellen.json");
 await page.evaluate(()=>{state.meta=state.meta||{};state.meta.currentBillingCreatedByUser=true;renderAll({forceAll:true,reason:"ap21c"});switchToTab("start");openCurrentBillingForEdit();switchToTab("manuellewerte");});
}
test("AP21C gliedert Status, Filter und Kostenarten als klare Arbeitsbereiche",async({page})=>{
 const runtime=attachRuntimeGuards(page); await openPage(page);
 await expect(page.locator("#individualValuesStatusHeading")).toHaveText("Status der aktiven Kostenarten");
 await expect(page.locator("#individualValuesListHeading")).toHaveText("Individuelle Werte bearbeiten und prüfen");
 const cards=page.locator("#individualValuesList .individual-cost-card");
 const count=await cards.count(); expect(count).toBeGreaterThan(0);
 await expect(page.locator("[data-individual-result-count]")).toHaveText(`${count} Kostenarten`);
 await page.locator('[data-individual-filter="open"]').click();
 await expect(page.locator('[data-individual-filter="open"]')).toHaveAttribute("aria-pressed","true");
 await expect(page.locator("[data-individual-result-count]")).toContainText("im Filter");
 runtime.assertClean();
});
test("AP21C erhält Klappboxen, zentrale Zählerquelle und sichtbaren Tastaturfokus",async({page})=>{
 const runtime=attachRuntimeGuards(page); await openPage(page);
 await page.locator('[data-individual-filter="all"]').click();
 const summary=page.locator("#individualValuesList .individual-cost-card summary").first();
 await summary.focus(); await expect(summary).toBeFocused();
 await summary.press("Enter"); await expect(summary.locator("xpath=..")).toHaveAttribute("open","");
 const source=page.locator("#individualValuesMeterSource > summary"); await source.click();
 await expect(page.locator("#individualValuesMeterSource")).toHaveAttribute("open","");
 runtime.assertClean();
});
