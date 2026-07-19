"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const root = path.resolve(__dirname,"..");
const origin = "http://nkpro.test";
const screenshotDir = path.join(root,"AP22F10G_B_Screenshots");
const reportFile = path.join(root,"AP22F10G_B_Dokumentation","browser-test-results.json");
const realJsonPath = process.env.AP22F10G_REAL_JSON || "";
const fallbackPath = path.join(root,"testdaten","basis","standardfall.json");
const sourcePath = realJsonPath && fs.existsSync(realJsonPath) ? realJsonPath : fallbackPath;
const sourceMode = sourcePath === realJsonPath ? "realer Gesamtbestand" : "Fallback-Testbestand";
const referenceData = JSON.parse(fs.readFileSync(sourcePath,"utf8"));
fs.mkdirSync(screenshotDir,{recursive:true});
fs.mkdirSync(path.dirname(reportFile),{recursive:true});

function contentType(filePath) {
  return ({ ".css":"text/css", ".js":"text/javascript", ".json":"application/json", ".webmanifest":"application/manifest+json", ".png":"image/png", ".svg":"image/svg+xml" })[path.extname(filePath).toLowerCase()] || "text/plain";
}
async function installRoutes(page) {
  await page.route(`${origin}/**`,async route => {
    const url = new URL(route.request().url());
    const relative = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/,"");
    const filePath = path.resolve(root,relative);
    if (!filePath.startsWith(root + path.sep) || !fs.existsSync(filePath)) return route.fulfill({status:404,body:"Not found"});
    return route.fulfill({status:200,contentType:contentType(filePath),body:fs.readFileSync(filePath)});
  });
}
async function installStorage(page,entries={}) {
  await page.evaluate(initial => {
    const store = new Map(Object.entries(initial || {}).map(([key,value]) => [String(key),String(value)]));
    const mock = {
      get length(){return store.size;},
      key(index){return [...store.keys()][Number(index)] ?? null;},
      getItem(key){key=String(key);return store.has(key)?store.get(key):null;},
      setItem(key,value){store.set(String(key),String(value));},
      removeItem(key){store.delete(String(key));},
      clear(){store.clear();},
      __entries(){return Object.fromEntries(store.entries());}
    };
    Object.defineProperty(window,"localStorage",{value:mock,configurable:true});
    window.alert=()=>{};
    window.confirm=()=>true;
  },entries);
}
async function openApp(browser,entries={}) {
  const context = await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const page = await context.newPage();
  const runtimeErrors=[];
  page.on("pageerror",error=>runtimeErrors.push({type:"pageerror",text:error.message}));
  page.on("console",message=>{if(message.type()==="error")runtimeErrors.push({type:"console.error",text:message.text()});});
  await installStorage(page,entries);
  await installRoutes(page);
  const html = fs.readFileSync(path.join(root,"index.html"),"utf8").replace(/<head>/i,`<head><base href="${origin}/">`);
  await page.setContent(html,{waitUntil:"load"});
  await page.waitForFunction(()=>globalThis.NKProRuntimeDiagnostics && NKProRuntimeDiagnostics.snapshot().startup && NKProRuntimeDiagnostics.snapshot().startup.ok===true,{timeout:30000});
  return {context,page,runtimeErrors};
}
async function loadReference(page,data=referenceData) {
  await page.evaluate(raw=>{
    replaceApplicationState(normalizeLoadedData(JSON.parse(JSON.stringify(raw))));
    prepareStateForPersistence("AP22F10G-B Browserreferenz");
    renderAll({forceAll:true,reason:"ap22f10g-browser-reference"});
    switchToTab("start");
    openCurrentBillingForEdit();
    switchToTab("manuellewerte");
  },data);
  await page.waitForSelector('#manuellewerte.active, #manuellewerte[style*="display"]',{timeout:10000}).catch(()=>{});
  await page.waitForTimeout(150);
}
async function fillChange(page,selector,value) {
  const locator=page.locator(selector).first();
  await locator.waitFor({state:"visible"});
  await locator.fill(String(value));
  await locator.evaluate(element=>element.dispatchEvent(new Event("change",{bubbles:true})));
  await page.waitForTimeout(80);
}
function normalizeText(text){return String(text||"").replace(/\s+/g," ").trim();}

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || "/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
  let app=await openApp(browser);
  let {page,context,runtimeErrors}=app;
  const checks=[];
  async function check(number,name,fn){
    const started=Date.now();
    try{await fn();checks.push({number,name,status:"PASS",durationMs:Date.now()-started});}
    catch(error){checks.push({number,name,status:"FAIL",durationMs:Date.now()-started,error:String(error&&error.stack||error)});throw error;}
  }
  try{
    await loadReference(page);
    await check(1,"Kostenart in Gesamtkosten deaktivieren",async()=>{
      await page.evaluate(()=>{const cost=state.kostenarten.find(row=>row.id==="K002");cost.inNK="Nein";renderIndividualValues();});
      assert.equal(await page.locator('[data-individual-section][data-cost-id="K002"]').count(),0);
      await loadReference(page);
    });
    await check(2,"Automatischer Umlageschlüssel erzeugt keinen Bereich",async()=>{
      assert.equal(await page.locator('[data-individual-section][data-cost-id="K009"]').count(),0);
    });
    await check(3,"Beliebige Kostenart auf Verbrauch stellen",async()=>{
      const result=await page.evaluate(()=>{
        const cost=state.kostenarten.find(row=>row.id==="K031");
        Object.assign(cost,{kostenart:"Prüfverbrauch ohne Sonder-ID",inNK:"Ja",status:"Vollständig",berechnungsart:"Automatisch",umlageschluessel:"Verbrauch",gesamtbetrag:100,gesamtverbrauch:10});
        state.zaehlerDaten.zaehler.push({id:"Z-PRUEF-031",meterId:"Z-PRUEF-031",zaehlerId:"Z-PRUEF-031",zaehlernummer:"TEST-031",meterType:"electric",zaehlerTyp:"electric",bezeichnung:"Prüfzähler",einheit:"kWh",einheitId:"W001.EG-L",nutzerId:"M001",kostenId:"K031",status:"aktiv",billingRole:"billing",abrechnungsrelevant:true,einbaudatum:"2025-01-01",legacyBindings:[]});
        state.zaehlerDaten.messperioden.push({id:"MP-PRUEF-031",messperiodeId:"MP-PRUEF-031",meterId:"Z-PRUEF-031",zaehlerId:"Z-PRUEF-031",beginn:"2025-01-01",ende:"2025-12-31",anfangsstand:10,endstand:20,verbrauch:10,status:"valid",abrechnungsrelevant:true,zuordnungsanteile:[{einheitId:"W001.EG-L",nutzerId:"M001",beginn:"2025-01-01",ende:"2025-12-31"}]});
        renderIndividualValues();
        return NKProIndividualValues.describe();
      });
      assert.ok(result.consumptionAreas>=2);
      assert.equal(await page.locator('[data-individual-section="consumption"][data-cost-id="K031"]').count(),1);
    });
    await check(4,"Kostenart auf manuellen Umlageschlüssel stellen",async()=>{
      await page.evaluate(()=>{const cost=state.kostenarten.find(row=>row.id==="K031");cost.umlageschluessel="Manuelle Eingabe je Mieter/Wohneinheit";cost.berechnungsart="Manuell je Mieter";renderIndividualValues();});
      assert.equal(await page.locator('[data-individual-section="consumption"][data-cost-id="K031"]').count(),0);
      assert.equal(await page.locator('[data-individual-section="manual"][data-cost-id="K031"]').count(),1);
    });
    await check(5,"Umlageschlüssel nachträglich ändern",async()=>{
      await page.evaluate(()=>{const cost=state.kostenarten.find(row=>row.id==="K031");cost.umlageschluessel="Wohnfläche";cost.berechnungsart="Automatisch";renderIndividualValues();});
      assert.equal(await page.locator('[data-individual-section][data-cost-id="K031"]').count(),0);
      await loadReference(page);
    });
    await check(6,"Keine K002-Sonderlogik erforderlich",async()=>{
      const result=await page.evaluate(()=>{
        const original=state.kostenarten.find(row=>row.id==="K002");
        original.inNK="Nein";
        const generic=state.kostenarten.find(row=>row.id==="K032");
        Object.assign(generic,{kostenart:"Allgemeine Messkosten",inNK:"Ja",status:"Vollständig",berechnungsart:"Automatisch",umlageschluessel:"Verbrauch",gesamtbetrag:50,gesamtverbrauch:5});
        state.zaehlerDaten.zaehler.push({id:"Z-GENERISCH",meterId:"Z-GENERISCH",zaehlerId:"Z-GENERISCH",zaehlernummer:"GEN-1",meterType:"generic",zaehlerTyp:"generic",bezeichnung:"Allgemeiner Zähler",einheit:"Einheit",einheitId:"W001.EG-L",nutzerId:"M001",kostenId:"K032",status:"aktiv",billingRole:"billing",abrechnungsrelevant:true,einbaudatum:"2025-01-01",legacyBindings:[]});
        state.zaehlerDaten.messperioden.push({id:"MP-GENERISCH",messperiodeId:"MP-GENERISCH",meterId:"Z-GENERISCH",zaehlerId:"Z-GENERISCH",beginn:"2025-01-01",ende:"2025-12-31",anfangsstand:3,endstand:8,verbrauch:5,status:"valid",abrechnungsrelevant:true,zuordnungsanteile:[{einheitId:"W001.EG-L",nutzerId:"M001",beginn:"2025-01-01",ende:"2025-12-31"}]});
        renderIndividualValues();
        return {generic:document.querySelectorAll('[data-individual-section="consumption"][data-cost-id="K032"]').length,legacy:document.querySelectorAll('[data-individual-section][data-cost-id="K002"]').length};
      });
      assert.deepEqual(result,{generic:1,legacy:0});
      await loadReference(page);
    });
    await check(7,"Reale Kalt- und Warmwasserzähler geladen",async()=>{
      assert.ok((await page.locator('[data-meter-row^="Z-WASSER-KW-"]').count())>=5);
      assert.ok((await page.locator('[data-meter-row^="Z-WASSER-WW-"]').count())>=5);
    });
    await check(8,"490,00 → 564,00 = 74,00",async()=>{
      await fillChange(page,'[data-meter-id="Z-WASSER-KW-W000.UG"][data-field="end"]',"564,00");
      assert.match(normalizeText(await page.locator('[data-meter-row="Z-WASSER-KW-W000.UG"] [data-meter-consumption] strong').textContent()),/74,00/);
    });
    await check(9,"280,00 → 312,42 = 32,42",async()=>{
      await fillChange(page,'[data-meter-id="Z-WASSER-WW-W000.UG"][data-field="end"]',"312,42");
      assert.match(normalizeText(await page.locator('[data-meter-row="Z-WASSER-WW-W000.UG"] [data-meter-consumption] strong').textContent()),/32,42/);
    });
    await check(10,"Gesamtverbrauch UG = 106,42",async()=>{
      assert.match(normalizeText(await page.locator('[data-meter-row="Z-WASSER-KW-W000.UG"] [data-case-total] strong').textContent()),/106,42/);
    });
    await check(11,"266,00 → 297,74 = 31,74",async()=>{
      await fillChange(page,'[data-meter-id="Z-WASSER-KW-W001.EG-L"][data-field="end"]',"297,74");
      assert.match(normalizeText(await page.locator('[data-meter-row="Z-WASSER-KW-W001.EG-L"] [data-meter-consumption] strong').textContent()),/31,74/);
    });
    await check(12,"108,00 → 119,28 = 11,28",async()=>{
      await fillChange(page,'[data-meter-id="Z-WASSER-WW-W001.EG-L"][data-field="end"]',"119.28");
      assert.match(normalizeText(await page.locator('[data-meter-row="Z-WASSER-WW-W001.EG-L"] [data-meter-consumption] strong').textContent()),/11,28/);
    });
    await check(13,"Gesamtverbrauch EG-Links = 43,02",async()=>{
      assert.match(normalizeText(await page.locator('[data-meter-row="Z-WASSER-KW-W001.EG-L"] [data-case-total] strong').textContent()),/43,02/);
    });
    await check(14,"Fehlender Teilwert zeigt keine falsche Wohnungssumme",async()=>{
      const originalEnd=await page.evaluate(()=>{
        const row=NKProBillingCalculation.meterRowsForCost(state,"K002").find(item=>item.meterId==="Z-WASSER-WW-W002.EG-R");
        const value=row&&row.endValue;
        NKProMeteringDraft.setValue("Z-WASSER-WW-W002.EG-R","end","","number");
        renderIndividualValues();
        return value;
      });
      const total=normalizeText(await page.locator('[data-meter-row="Z-WASSER-KW-W002.EG-R"] [data-case-total]').textContent());
      assert.match(total,/–/);assert.match(total,/Unvollständig/);
      await page.evaluate(value=>{NKProMeteringDraft.setValue("Z-WASSER-WW-W002.EG-R","end",value,"number");renderIndividualValues();},originalEnd);
    });
    await check(15,"Komma- und Punkteingabe",async()=>{
      const values=await page.evaluate(()=>({comma:NKProIndividualValues.parseLocaleNumber("1.234,56"),dot:NKProIndividualValues.parseLocaleNumber("1234.56")}));
      assert.equal(values.comma.value,1234.56);assert.equal(values.dot.value,1234.56);
    });
    await check(16,"Neu-Rendern erhält Werte",async()=>{
      await page.evaluate(()=>renderIndividualValues());
      assert.equal(await page.locator('[data-meter-id="Z-WASSER-WW-W000.UG"][data-field="end"]').inputValue(),"312,42");
    });
    await check(17,"Dialog öffnen und schließen ohne Wertverlust",async()=>{
      await page.locator('[data-meter-row="Z-WASSER-KW-W000.UG"] [data-individual-special]').click();
      assert.equal(await page.locator('#individualSpecialDialog').evaluate(node=>node.open),true);
      await page.locator('#individualSpecialDialog [data-individual-dialog-close]').first().click();
      assert.equal(await page.locator('[data-meter-id="Z-WASSER-WW-W000.UG"][data-field="end"]').inputValue(),"312,42");
    });
    await check(18,"Filterwechsel erhält Werte",async()=>{
      await page.locator('[data-individual-section="consumption"] [data-individual-filter]').selectOption("complete");
      await page.locator('[data-individual-section="consumption"] [data-individual-filter]').selectOption("all");
      assert.equal(await page.locator('[data-meter-id="Z-WASSER-WW-W000.UG"][data-field="end"]').inputValue(),"312,42");
    });
    await check(19,"Seitenwechsel erhält Werte",async()=>{
      await page.evaluate(()=>switchToTab("einstellungen"));
      await page.evaluate(()=>switchToTab("manuellewerte"));
      assert.equal(await page.locator('[data-meter-id="Z-WASSER-WW-W000.UG"][data-field="end"]').inputValue(),"312,42");
    });
    let persistedEntries={};
    await check(20,"Browser-Neuladen nach Speicherung",async()=>{
      await page.locator('[data-individual-save-section="consumption"]').first().click();
      await page.waitForTimeout(150);
      assert.match(normalizeText(await page.locator('#individualSaveNotice').textContent()),/erfolgreich gespeichert.*zurückgelesen/i);
      persistedEntries=await page.evaluate(()=>localStorage.__entries());
      await context.close();
      app=await openApp(browser,persistedEntries);page=app.page;context=app.context;runtimeErrors=app.runtimeErrors;
      await page.evaluate(()=>{switchToTab("start");openCurrentBillingForEdit();switchToTab("manuellewerte");});
      await page.waitForTimeout(120);
      assert.equal(await page.locator('[data-meter-id="Z-WASSER-WW-W000.UG"][data-field="end"]').inputValue(),"312,42");
    });
    await check(21,"Simulierter Speicherfehler lässt Wert sichtbar",async()=>{
      await fillChange(page,'[data-meter-id="Z-WASSER-KW-W000.UG"][data-field="end"]',"565,00");
      await page.evaluate(()=>{window.__ivOriginalSetItem=localStorage.setItem.bind(localStorage);localStorage.setItem=()=>{throw new Error("simulierter Speicherfehler");};});
      await page.locator('[data-individual-save-section="consumption"]').first().click();
      assert.match(normalizeText(await page.locator('#individualSaveNotice').textContent()),/Speichern fehlgeschlagen/);
      assert.equal(await page.locator('[data-meter-id="Z-WASSER-KW-W000.UG"][data-field="end"]').inputValue(),"565,00");
      await page.screenshot({path:path.join(screenshotDir,"05_speicherfehler_wert_bleibt_sichtbar.png"),fullPage:true});
      await page.evaluate(()=>{localStorage.setItem=window.__ivOriginalSetItem;});
      await fillChange(page,'[data-meter-id="Z-WASSER-KW-W000.UG"][data-field="end"]',"564,00");
    });
    await check(22,"Vorjahresübernahme",async()=>{
      await page.evaluate(()=>{
        state.meta.individualValuesPriorTransfers=(state.meta.individualValuesPriorTransfers||[]).filter(row=>row.meterId!=="Z-WASSER-KW-W002.EG-R");
        NKProMeteringDraft.setValue("Z-WASSER-KW-W002.EG-R","start","","number");
        renderIndividualValues();
      });
      await page.locator('[data-individual-prior-open]').first().click();
      const dialog=page.locator('#individualPriorTransferDialog');
      const candidate=dialog.locator('tr').filter({hasText:"Z-WASSER-KW-W002.EG-R"});
      assert.equal(await candidate.locator('input[type="checkbox"]').isEnabled(),true);
      await dialog.locator('[data-individual-prior-confirm]').click();
      await page.waitForTimeout(180);
      assert.equal(await page.locator('[data-meter-id="Z-WASSER-KW-W002.EG-R"][data-field="start"]').inputValue(),"117");
    });
    await check(23,"Wiederholte Vorjahresübernahme ohne Dubletten",async()=>{
      const before=await page.evaluate(()=>(state.meta.individualValuesPriorTransfers||[]).filter(row=>row.meterId==="Z-WASSER-KW-W002.EG-R").length);
      await page.locator('[data-individual-prior-open]').first().click();
      const candidate=page.locator('#individualPriorTransferDialog tr').filter({hasText:"Z-WASSER-KW-W002.EG-R"});
      assert.equal(await candidate.locator('input[type="checkbox"]').isDisabled(),true);
      await page.locator('#individualPriorTransferDialog [data-individual-dialog-close]').first().click();
      const after=await page.evaluate(()=>(state.meta.individualValuesPriorTransfers||[]).filter(row=>row.meterId==="Z-WASSER-KW-W002.EG-R").length);
      assert.equal(after,before);assert.equal(after,1);
    });
    await check(24,"Summenkontrolle manueller Kostenarten",async()=>{
      await page.evaluate(()=>{
        const cost=state.kostenarten.find(row=>row.id==="K006");
        if(cost) cost.gesamtbetrag=9965.97;
        renderIndividualValues();
      });
      const cases=await page.evaluate(()=>NKProBillingCalculation.individualValueCases(state).map(row=>row.caseKey));
      const values=[2082.65,975.92,1524.97,1761.65,1339.31,1140,1141.47];
      assert.equal(cases.length,values.length);
      for(let i=0;i<cases.length;i++) await fillChange(page,`[data-cost-id="K006"][data-case-key="${cases[i]}"][data-field="amount"]`,i===0?String(values[i]).replace(".",","):String(values[i]));
      const control=normalizeText(await page.locator('[data-individual-section="manual"][data-cost-id="K006"] .individual-values-control').textContent());
      assert.match(control,/9\.965,97/);assert.match(control,/Stimmt überein/);
      await page.locator('[data-individual-save-section="manual"][data-cost-id="K006"]').click();
      assert.match(normalizeText(await page.locator('#individualSaveNotice').textContent()),/erfolgreich gespeichert/);
    });
    await check(25,"Leerstand und Privatanteil als reguläre Fälle",async()=>{
      assert.ok((await page.locator('[data-individual-section="manual"] .individual-values-case-badge.is-private').count())>=1);
      assert.ok((await page.locator('[data-individual-section="manual"] .individual-values-case-badge.is-vacancy').count())>=1);
    });
    await check(26,"Desktop-Sichtprüfung",async()=>{
      await page.setViewportSize({width:1440,height:1000});
      await page.screenshot({path:path.join(screenshotDir,"01_desktop_realer_gesamtbestand.png"),fullPage:true});
      const box=await page.locator('#manuellewerte .individual-values-page').boundingBox();assert.ok(box&&box.width>900);
    });
    await check(27,"Schmale Ansicht mit internem Tabellen-Scroll",async()=>{
      await page.setViewportSize({width:620,height:900});await page.waitForTimeout(100);
      const metrics=await page.locator('[data-individual-section="consumption"] .individual-values-table-wrap').first().evaluate(node=>({client:node.clientWidth,scroll:node.scrollWidth,body:document.body.scrollWidth,viewport:document.documentElement.clientWidth}));
      assert.ok(metrics.scroll>metrics.client);assert.ok(metrics.body<=metrics.viewport+3);
      await page.screenshot({path:path.join(screenshotDir,"02_schmale_ansicht_tabellenscroll.png"),fullPage:true});
    });
    await check(28,"Browserzoom 125 Prozent",async()=>{
      await page.setViewportSize({width:1440,height:1000});
      const session=await context.newCDPSession(page);await session.send("Emulation.setPageScaleFactor",{pageScaleFactor:1.25});await page.waitForTimeout(120);
      await page.screenshot({path:path.join(screenshotDir,"03_browserzoom_125_prozent.png"),fullPage:false});
      const visible=await page.locator('#manuellewerte .individual-values-page').isVisible();assert.equal(visible,true);
      await session.send("Emulation.setPageScaleFactor",{pageScaleFactor:1});
    });
    await page.locator('[data-individual-prior-open]').first().click();
    await page.screenshot({path:path.join(screenshotDir,"04_vorjahresuebernahme_dialog.png"),fullPage:true});
    await page.locator('#individualPriorTransferDialog [data-individual-dialog-close]').first().click();
    assert.deepEqual(runtimeErrors,[]);
    const report={workPackage:"AP22F10G-B",appVersion:"V99.4.60",referenceMode:sourceMode,referenceFile:path.basename(sourcePath),chromiumPath:process.env.CHROMIUM_PATH||"/usr/bin/chromium",generatedAt:new Date().toISOString(),summary:{passed:checks.filter(row=>row.status==="PASS").length,failed:checks.filter(row=>row.status==="FAIL").length,total:checks.length},checks,runtimeErrors,screenshots:fs.readdirSync(screenshotDir).sort()};
    fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+"\n");
    console.log(`AP22F10G-B browser checks: PASS (${report.summary.passed}/${report.summary.total}, ${sourceMode})`);
  } catch(error) {
    const report={workPackage:"AP22F10G-B",appVersion:"V99.4.60",referenceMode:sourceMode,referenceFile:path.basename(sourcePath),generatedAt:new Date().toISOString(),summary:{passed:checks.filter(row=>row.status==="PASS").length,failed:checks.filter(row=>row.status==="FAIL").length,total:checks.length},checks,runtimeErrors};
    fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+"\n");
    try{await page.screenshot({path:path.join(screenshotDir,"99_fehlerzustand.png"),fullPage:true});}catch(_){ }
    throw error;
  } finally {
    try{await context.close();}catch(_){ }
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exit(1);});
