"use strict";
const {test,expect}=require("@playwright/test");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");

function file(rel){return fs.readFileSync(path.join(ROOT,rel));}
function text(rel){return file(rel).toString("utf8");}
function mime(ext){return ({png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",svg:"image/svg+xml",webp:"image/webp"})[ext.toLowerCase()]||"application/octet-stream";}
function inlineDocument(htmlRel,cssRel){
  const baseDir=path.dirname(htmlRel);
  let html=text(htmlRel);
  const scripts=[];
  html=html.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi,(_all,src)=>{
    const clean=src.replace(/^\.\//,"").split("?")[0];
    const rel=path.posix.normalize(path.posix.join(baseDir,clean));
    scripts.push(text(rel));
    return "";
  });
  html=html.replace(/<link\b[^>]*>/gi,"");
  html=html.replace(/\bsrc=["']([^"']+\.(png|jpe?g|svg|webp)(?:\?[^"']*)?)["']/gi,(_all,src,ext)=>{
    const clean=src.replace(/^\.\//,"").split("?")[0];
    const rel=path.posix.normalize(path.posix.join(baseDir,clean));
    const abs=path.join(ROOT,rel);
    if(!fs.existsSync(abs)) return 'src=""';
    return `src="data:${mime(ext)};base64,${fs.readFileSync(abs).toString("base64")}"`;
  });
  const css=text(cssRel);
  html=html.replace("</head>",`<style>${css}</style></head>`);
  const inlineScripts=scripts.map(code=>`<script>${code.replace(/<\/script/gi,"<\\/script")}</script>`).join("\n");
  return html.replace("</body>",`${inlineScripts}</body>`);
}
const referenceDocument=inlineDocument("ui-reference/index.html","ui-reference/reference.css");
const storageShim=`<script>(()=>{const makeStore=()=>{const data=new Map();return Object.freeze({get length(){return data.size},key(index){return Array.from(data.keys())[index]??null},getItem(key){key=String(key);return data.has(key)?data.get(key):null},setItem(key,value){data.set(String(key),String(value))},removeItem(key){data.delete(String(key))},clear(){data.clear()}})};Object.defineProperty(window,"localStorage",{configurable:true,value:makeStore()});Object.defineProperty(window,"sessionStorage",{configurable:true,value:makeStore()});})();<\/script>`;
const productDocument=inlineDocument("index.html","assets/app.css").replace("<head>",`<head>${storageShim}`);
async function load(page,document){await page.setContent(document,{waitUntil:"load"});}

test("AP22E Referenzbibliothek startet isoliert, vollständig und responsiv",async({page})=>{
  const errors=[];
  page.on("console",msg=>{if(msg.type()==="error") errors.push("console: "+msg.text());});
  page.on("pageerror",error=>errors.push("page: "+error.message));
  await load(page,referenceDocument);
  await expect(page).toHaveTitle(/UI-\/UX-Referenzbibliothek/);
  await expect(page.locator("[data-reference-group]")).toHaveCount(12);
  await expect(page.locator("[data-state]")).toHaveCount(9);
  await expect(page.getByRole("heading",{name:"UI-/UX-Referenzbibliothek"})).toBeVisible();
  await expect(page.getByText("Produktbasis V99.4.32 unverändert")).toBeVisible();
  await expect(page.locator("img[alt*='UI-UX-Styleguide']")).toBeVisible();
  await expect(page.locator("img[alt*='Navigation aus NK-Pro V99.4.32']")).toBeVisible();

  const opener=page.getByRole("button",{name:"Hinweis öffnen"});
  await opener.focus();
  await opener.click();
  const info=page.locator("#info-dialog");
  await expect(info).toHaveJSProperty("open",true);
  await expect(page.locator("#info-dialog button").first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#info-dialog button").last()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(info).not.toHaveJSProperty("open",true);
  await expect(opener).toBeFocused();

  const dangerOpen=page.getByRole("button",{name:"Destruktiven Dialog öffnen"});
  await dangerOpen.click();
  const danger=page.locator("#danger-dialog");
  await expect(danger).toHaveJSProperty("open",true);
  await page.keyboard.press("Escape");
  await expect(danger).toHaveJSProperty("open",true);
  await page.getByRole("button",{name:"Abbrechen"}).last().click();
  await expect(danger).not.toHaveJSProperty("open",true);

  for(const viewport of [{width:1440,height:1000},{width:1024,height:800},{width:390,height:844},{width:900,height:620}]){
    await page.setViewportSize(viewport);
    await load(page,referenceDocument);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`Horizontale Gesamtseiten-Scrollleiste bei ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(1);
    await expect(page.locator("#responsive")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("Produktive Anwendung startet unverändert ohne neue Referenzkopplung",async({page})=>{
  const errors=[];
  page.on("console",msg=>{if(msg.type()==="error") errors.push("console: "+msg.text());});
  page.on("pageerror",error=>errors.push("page: "+error.message));
  await load(page,productDocument);
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator("#appSidebar")).toBeVisible();
  await expect(page.locator("meta[name='nk-pro-build']")).toHaveAttribute("content","99.4.32-ap22d");
  await expect(page.locator("a[href*='ui-reference'],script[src*='ui-reference'],link[href*='ui-reference']")).toHaveCount(0);
  await page.waitForTimeout(800);
  expect(errors).toEqual([]);
});
