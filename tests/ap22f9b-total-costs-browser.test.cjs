"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards,stableStateSnapshot}=require("./test-helpers.cjs");
const shots=process.env.AP22F9B_SCREENSHOT_DIR||path.join(process.cwd(),"AP22F9B_Screenshots");
fs.rmSync(shots,{recursive:true,force:true});fs.mkdirSync(shots,{recursive:true});
const moneyNumber=text=>Number(String(text).replace(/[^0-9,.-]/g,"").replace(/\./g,"").replace(",","."));

async function openCosts(page,mode="edit"){
  await page.evaluate(mode=>{
    NK_PRO_MODULES.billingContext.close();
    NK_PRO_MODULES.billingContext.open({recordKey:"current",recordType:"current",label:"2025"},mode==="view"?NK_PRO_MODULES.billingContext.MODES.VIEW:NK_PRO_MODULES.billingContext.MODES.EDIT);
    document.documentElement.dataset.billingExplicitlyOpened="true";
    switchToTab("einstellungen");
    renderAll({forceAll:true,reason:"ap22f9b-browser"});
  },mode);
  await page.waitForSelector("#einstellungen.active");await page.waitForTimeout(120);
}


async function resetScreenshotPosition(page){
  await page.evaluate(()=>{
    window.scrollTo(0,0);
    document.querySelectorAll("#einstellungen .nk-ui-table-wrap").forEach(el=>{el.scrollLeft=0;});
  });
  await page.waitForTimeout(60);
}

async function prepareReferenceCosts(page){
  await page.evaluate(()=>{
    const active=new Set(["K001","K002","K003","K006","K009"]);
    const values={
      K001:{gesamtbetrag:2840,umlageschluessel:"Wohnfläche",berechnungsart:"Automatisch",vorauszahlung:"Nein"},
      K002:{gesamtbetrag:1965.42,gesamtverbrauch:1000,umlageschluessel:"Verbrauch",berechnungsart:"Automatisch",vorauszahlung:"Ja"},
      K003:{gesamtbetrag:1446.18,umlageschluessel:"Wohnfläche",berechnungsart:"Automatisch",vorauszahlung:"Nein"},
      K006:{gesamtbetrag:8780.55,umlageschluessel:"Verbrauch",berechnungsart:"Manuell je Mieter",vorauszahlung:"Ja"},
      K009:{gesamtbetrag:1120,umlageschluessel:"Verteilung nur auf aktive Wohneinheiten",berechnungsart:"Automatisch",vorauszahlung:"Ja"}
    };
    state.kostenarten.forEach(cost=>{
      cost.inNK=active.has(cost.id)?"Ja":"Nein";
      if(values[cost.id])Object.assign(cost,values[cost.id],{ausschlussBehandlung:COST_EXCLUSION_FULL,bemerkung:""});
    });
    NK_PRO_MODULES.costActions.syncVorauszahlungen(state);
    NK_PRO_MODULES.costActions.syncKostenartenMieterUmlage(state);
    renderEinstellungen();
  });
  await page.waitForTimeout(100);
}

async function assertFrame(page,selector,{requireOverflow=true}={}){
  const result=await page.locator(selector).evaluate(wrap=>{
    const table=wrap.querySelector("table");wrap.scrollLeft=wrap.scrollWidth;
    const lastHead=table.querySelector("thead th:last-child");
    const lastRow=table.querySelector("tbody tr:not([hidden]) td:last-child");
    const wr=wrap.getBoundingClientRect(),tr=table.getBoundingClientRect();
    return {overflow:wrap.scrollWidth-wrap.clientWidth,gap:Math.abs(wr.right-tr.right),headBorder:parseFloat(getComputedStyle(lastHead).borderRightWidth),rowBorder:lastRow?parseFloat(getComputedStyle(lastRow).borderRightWidth):1,radius:getComputedStyle(lastHead).borderTopRightRadius};
  });
  if(requireOverflow) assert.ok(result.overflow>0,`${selector}: interner Tabellen-Scroll fehlt`);
  assert.ok(result.gap<=2.5,`${selector}: rechter Tabellenabschluss offen ${JSON.stringify(result)}`);
  assert.ok(result.headBorder>=1&&result.rowBorder>=1,`${selector}: rechter Zellenrahmen fehlt ${JSON.stringify(result)}`);
  return result;
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"]});
 const context=await browser.newContext({viewport:{width:1720,height:1100},locale:"de-DE",timezoneId:"Europe/Berlin",serviceWorkers:"block"});
 const page=await context.newPage();const runtime=attachRuntimeGuards(page);
 try{
  await openFreshApp(page);await loadFixture(page,"standardfall.json");await openCosts(page,"edit");await prepareReferenceCosts(page);
  assert.equal(await page.locator("#einstellungen details").count(),0);
  assert.equal(await page.locator("#einstellungen .cost-card").count(),3);
  assert.equal(await page.locator("#einstellungen .cost-summary-card").count(),4);
  assert.equal(await page.locator("#einstellungen .cost-summary-card__icon svg").count(),4,"Kennzahlen müssen die freigegebenen Linien-SVG-Symbole verwenden");
  assert.equal(await page.locator("#einstellungen .cost-summary-card__icon").evaluateAll(nodes=>nodes.every(node=>node.textContent.trim()==="")),true,"Textglyphen sind in den Kennzahlen nicht zulässig");
  assert.equal(await page.locator("#settingsTable thead th").count(),15);
  await page.waitForTimeout(20);
  const tableHeadDesign=await page.evaluate(()=>{
    const main=document.querySelector("#settingsTable thead th");
    const allocation=document.querySelector("#kostenMieterUmlageTable thead th");
    const style=getComputedStyle(main),allocationStyle=getComputedStyle(allocation);
    return {mainBackground:style.backgroundColor,mainColor:style.color,allocationBackground:allocationStyle.backgroundColor,allocationColor:allocationStyle.color,sortable:document.querySelectorAll("#settingsTable thead th.sortable,#kostenMieterUmlageTable thead th.sortable").length};
  });
  assert.deepEqual(tableHeadDesign,{mainBackground:"rgb(247, 249, 252)",mainColor:"rgb(23, 59, 90)",allocationBackground:"rgb(247, 249, 252)",allocationColor:"rgb(23, 59, 90)",sortable:0},"Tabellenköpfe entsprechen nicht dem neutralen NK-Pro-Standard");
  assert.equal(await page.locator("#settingsTable tbody tr").count(),5);
  assert.equal(await page.locator(".table-tools[data-table='settingsTable'], .table-tools[data-table='kostenMieterUmlageTable']").count(),0,"Nicht freigegebene Filter-/Sortierwerkzeuge dürfen nicht erscheinen");
  assert.equal(moneyNumber(await page.locator("#costTileTotalValue").innerText()),16152.15);
  assert.equal(await page.locator("#costTileActiveValue").innerText(),"5");
  assert.equal(await page.locator("#costTileCompleteValue").innerText(),"4 von 5");
  assert.equal(await page.locator("#costTileOpenValue").innerText(),"1");
  assert.equal(moneyNumber(await page.locator("#costTableTotal").innerText()),16152.15);
  assert.match(await page.locator("#costPilotControl").innerText(),/Heiz- und Warmwasserkosten prüfen/);
  assert.match(await page.locator("#settingsTable tbody tr").nth(0).innerText(),/01\.01\.2025\s*[–-]\s*31\.12\.2025/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1);
  await assertFrame(page,"#einstellungen .cost-mockup-table-wrap");
  await assertFrame(page,"#einstellungen .cost-tenant-table-wrap",{requireOverflow:false});
  await page.locator("#einstellungen .cost-mockup-table-wrap").evaluate(el=>el.scrollLeft=0);
  await page.locator("#einstellungen .cost-tenant-table-wrap").evaluate(el=>el.scrollLeft=0);

  const beforeSearch=await stableStateSnapshot(page);
  await page.locator("#costTableSearch").fill("K002");await page.waitForTimeout(80);
  assert.equal(await page.locator("#settingsTable tbody tr").count(),1);
  assert.match(await page.locator("#settingsTable tbody").innerText(),/Wasserversorgung/);
  assert.deepEqual(await stableStateSnapshot(page),beforeSearch,"Suche darf Fachdaten nicht verändern");
  await page.locator("[data-ui-action='cost.clearSearch']").click();await page.waitForTimeout(60);
  assert.equal(await page.locator("#settingsTable tbody tr").count(),5);

  const firstAmount=page.locator("#settingsTable tbody tr").first().locator("td:nth-child(5) input");
  await firstAmount.fill("3000,00");await firstAmount.blur();await page.waitForTimeout(100);
  assert.equal(moneyNumber(await page.locator("#costTileTotalValue").innerText()),16312.15,"Kachel muss sofort aus bestehender Summe aktualisieren");
  assert.equal(moneyNumber(await page.locator("#costTableTotal").innerText()),16312.15);
  await page.locator("#einstellungen [data-ui-action='application.save']").click();await page.waitForTimeout(100);
  const savedEntries=await page.evaluate(()=>localStorage.__entries());
  assert.ok(Object.keys(savedEntries).length>0,"Speicherweg hat keinen lokalen Stand erzeugt");
  const pageReload=await context.newPage();const reloadRuntime=attachRuntimeGuards(pageReload);
  await openFreshApp(pageReload,savedEntries);await openCosts(pageReload,"edit");
  assert.equal(await pageReload.evaluate(()=>state.kostenarten.find(k=>k.id==="K001").gesamtbetrag),3000,"Gespeicherter Betrag fehlt nach Browser-Neustart");
  reloadRuntime.assertClean();await pageReload.close();
  await firstAmount.fill("2840,00");await firstAmount.blur();await page.waitForTimeout(80);

  const addTrigger=page.locator("[data-ui-action='cost.openSelectionDialog']");
  await addTrigger.focus();await addTrigger.click();await page.waitForTimeout(80);
  assert.equal(await page.locator("#costSelectionModal").isVisible(),true);
  assert.equal(await page.locator("#costSelectionModal").evaluate(modal=>modal.contains(document.activeElement)),true,"Dialogfokus fehlt");
  await resetScreenshotPosition(page);
  await page.screenshot({path:path.join(shots,"03_dialog_kostenart_hinzufuegen.png"),fullPage:true});
  await page.keyboard.press("Escape");await page.waitForTimeout(60);
  assert.equal(await page.locator("#costSelectionModal").isHidden(),true);
  assert.equal(await addTrigger.evaluate(el=>document.activeElement===el),true,"Fokus kehrt nicht zum Auslöser zurück");

  const priceButton=page.locator("#settingsTable [data-ui-action='cost.openPriceEditor']").first();
  await priceButton.click();await page.waitForTimeout(60);
  assert.equal(await page.locator("#costPriceModal").isVisible(),true);
  await page.locator("#costPriceDialogInput").fill("2,5");
  await page.locator("#costPriceModal [data-ui-action='cost.savePriceFromDialog']").click();await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>state.kostenarten.find(k=>k.id==="K002").preisProEinheit),2.5);
  await priceButton.click();await page.locator("#costPriceModal [data-ui-action='cost.resetPriceFromDialog']").click();await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>Math.round(state.kostenarten.find(k=>k.id==="K002").preisProEinheit*100000)/100000),1.9654);

  const tenantToggle=page.locator("#kostenMieterUmlageTable tbody input[type=checkbox]").first();
  const tenantBefore=await tenantToggle.isChecked();await tenantToggle.click();await page.waitForTimeout(80);assert.notEqual(await tenantToggle.isChecked(),tenantBefore);await tenantToggle.click();
  const prepBefore=await page.evaluate(()=>state.vorauszahlungen.filter(v=>v.aktiv==="Ja").length);
  await page.locator("[data-ui-action='cost.deactivateAllPrepayments']").click();await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>state.vorauszahlungen.filter(v=>v.aktiv==="Ja").length),0);
  await page.locator("[data-ui-action='cost.activateDefaultPrepayments']").click();await page.waitForTimeout(80);
  assert.ok(await page.evaluate(()=>state.vorauszahlungen.filter(v=>v.aktiv==="Ja").length)>=Math.min(3,prepBefore||3));

  await prepareReferenceCosts(page);
  await resetScreenshotPosition(page);
  await page.screenshot({path:path.join(shots,"01_desktop_bearbeiten.png"),fullPage:true});
  await page.screenshot({path:path.join(shots,"05_hinweiszustand.png"),fullPage:true});

  await page.setViewportSize({width:620,height:900});await page.waitForTimeout(100);
  let responsive=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,columns:getComputedStyle(document.querySelector("#einstellungen .cost-summary-grid")).gridTemplateColumns.split(" ").length,table:document.querySelector("#einstellungen .cost-mockup-table-wrap").scrollWidth-document.querySelector("#einstellungen .cost-mockup-table-wrap").clientWidth,tenant:document.querySelector("#einstellungen .cost-tenant-table-wrap").scrollWidth-document.querySelector("#einstellungen .cost-tenant-table-wrap").clientWidth,searchHeight:document.querySelector("#costTableSearch").getBoundingClientRect().height,toolbarHeight:document.querySelector("#einstellungen .cost-table-toolbar").getBoundingClientRect().height}));
  assert.ok(responsive.doc<=1);assert.equal(responsive.columns,2);assert.ok(responsive.table>0);assert.ok(responsive.tenant>0);assert.ok(responsive.searchHeight<=48);assert.ok(responsive.toolbarHeight<=210);
  await resetScreenshotPosition(page);
  await page.screenshot({path:path.join(shots,"06_ansicht_620px.png"),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
  responsive=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,columns:getComputedStyle(document.querySelector("#einstellungen .cost-summary-grid")).gridTemplateColumns.split(" ").length,table:document.querySelector("#einstellungen .cost-mockup-table-wrap").scrollWidth-document.querySelector("#einstellungen .cost-mockup-table-wrap").clientWidth,tenant:document.querySelector("#einstellungen .cost-tenant-table-wrap").scrollWidth-document.querySelector("#einstellungen .cost-tenant-table-wrap").clientWidth,searchHeight:document.querySelector("#costTableSearch").getBoundingClientRect().height,toolbarHeight:document.querySelector("#einstellungen .cost-table-toolbar").getBoundingClientRect().height}));
  assert.ok(responsive.doc<=1);assert.equal(responsive.columns,2);assert.ok(responsive.table>0);assert.ok(responsive.tenant>0);assert.ok(responsive.searchHeight<=48);assert.ok(responsive.toolbarHeight<=210);
  await resetScreenshotPosition(page);
  await page.screenshot({path:path.join(shots,"07_ansicht_390px.png"),fullPage:true});

  await page.setViewportSize({width:1720,height:1100});await openCosts(page,"view");
  assert.equal(await page.locator("#einstellungen .billing-readonly-notice").count(),1);
  assert.equal(await page.locator("#einstellungen .billing-readonly-notice").isVisible(),true);
  assert.equal(await page.locator("#settingsTable input:not([readonly]):not(:disabled),#settingsTable select:not(:disabled)").count(),0);
  assert.equal(await page.locator("#costTableSearch").isEditable(),true);
  assert.equal(await page.locator("#costTileActiveValue").innerText(),"5");
  await resetScreenshotPosition(page);
  await page.screenshot({path:path.join(shots,"02_desktop_nur_ansehen.png"),fullPage:true});

  await openCosts(page,"edit");
  await page.evaluate(()=>{state.kostenarten.forEach(k=>k.inNK="Nein");NK_PRO_MODULES.costActions.syncKostenartenMieterUmlage(state);renderEinstellungen();});await page.waitForTimeout(80);
  assert.equal(await page.locator("#costTileTotalValue").innerText().then(moneyNumber),0);
  assert.equal(await page.locator("#costTileActiveValue").innerText(),"0");
  assert.equal(await page.locator("#costTileCompleteValue").innerText(),"0 von 0");
  assert.equal(await page.locator("#costTileOpenValue").innerText(),"0");
  assert.match(await page.locator("#settingsTable").innerText(),/Noch keine Kostenart aktiviert/);
  assert.match(await page.locator("#kostenMieterUmlageTable").innerText(),/Keine Umlagezuordnung verfügbar/);
  await resetScreenshotPosition(page);
  await page.screenshot({path:path.join(shots,"04_leerzustand.png"),fullPage:true});

  assert.equal(fs.readdirSync(shots).filter(name=>name.endsWith(".png")).length,7);
  runtime.assertClean();console.log("AP22F9B Gesamtkosten browser: PASS");
 }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
