"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const {chromium}=require(path.resolve(__dirname,"../node_modules/playwright"));
const {spawnSync}=require("child_process");

if(!process.env.NKPRO_K4_BROWSER_ATTEMPT){
  for(let attempt=1;attempt<=3;attempt+=1){
    const run=spawnSync(process.execPath,[__filename],{stdio:"inherit",timeout:60000,killSignal:"SIGKILL",env:{...process.env,NKPRO_K4_BROWSER_ATTEMPT:String(attempt)}});
    if(run.status===0)process.exit(0);
    if(attempt<3){
      console.error(`Browsertest-Versuch ${attempt} wurde durch Chromium beendet; Wiederholung folgt.`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,2000);
    }
  }
  process.exit(1);
}

const ROOT=path.resolve(__dirname,"..");
const DATA=path.join(ROOT,"nk-pro-gesamtbestand-2025-V99.4.66-2026-07-21-Wohnflaechen-korrigiert.json");
const DATA_SOURCE=JSON.parse(fs.readFileSync(DATA,"utf8"));
const EXPECTED_METER_VALUES=DATA_SOURCE.zaehlerDaten.messwerte.length;
const ORIGIN="http://nkpro-v99-4-66.test";
const SHOTS=path.join(ROOT,"AP22F11B_Korrektur4_Screenshots");
const DOCS=path.join(ROOT,"AP22F11B_Korrektur4_Dokumentation");
const REPORT=path.join(DOCS,"browser-test-result.json");
const CAPTURE_SCREENSHOTS=process.env.NKPRO_CAPTURE_SCREENSHOTS==="1";
fs.mkdirSync(SHOTS,{recursive:true});
fs.mkdirSync(DOCS,{recursive:true});

async function mount(browser,viewport={width:1440,height:1000}){
  const context=await browser.newContext({viewport,acceptDownloads:true});
  const page=await context.newPage();
  page.setDefaultTimeout(18000);
  const errors=[];
  page.on("pageerror",error=>errors.push(`PAGE: ${error.stack||error.message}`));
  page.on("console",message=>{if(message.type()==="error")errors.push(`CONSOLE: ${message.text()}`);});
  await page.route(`${ORIGIN}/**`,async route=>{
    const url=new URL(route.request().url());
    const rel=url.pathname==="/"?"index.html":url.pathname.replace(/^\/+/,"").split("?")[0];
    const file=path.resolve(ROOT,rel);
    const types={".css":"text/css",".js":"text/javascript",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".svg":"image/svg+xml"};
    if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:"not found"});
    return route.fulfill({status:200,contentType:types[path.extname(file).toLowerCase()]||"text/html",body:fs.readFileSync(file)});
  });
  await page.evaluate(()=>{
    const store=new Map();
    const mock={get length(){return store.size;},key(i){return [...store.keys()][i]??null;},getItem(k){return store.get(String(k))??null;},setItem(k,v){store.set(String(k),String(v));},removeItem(k){store.delete(String(k));},clear(){store.clear();},__entries(){return Object.fromEntries(store);}};
    Object.defineProperty(window,"localStorage",{value:mock,configurable:true});
    window.alert=()=>{};window.confirm=()=>true;window.prompt=()=>"Fachlich geprüft und nachvollziehbar entschieden.";
  });
  const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8").replace(/<head>/i,`<head><base href="${ORIGIN}/">`);
  await page.setContent(html,{waitUntil:"load"});
  await page.waitForFunction(()=>globalThis.NKProQualityRules&&globalThis.NKProBillingReview&&globalThis.NKProNavigation&&typeof state!=="undefined"&&typeof switchToTab==="function");
  return {context,page,errors};
}

async function importData(page){
  await page.setInputFiles("#jsonImport",DATA);
  await page.waitForFunction(expected=>state?.meta?.abrechnungsjahr==="2025"&&state?.zaehlerDaten?.messwerte?.length===expected&&state?.wohnungen?.reduce((sum,row)=>sum+Number(row.wohnflaeche||0),0)===391.5,EXPECTED_METER_VALUES);
  await page.waitForTimeout(450);
}

async function openTab(page,tab){
  await page.evaluate(tabId=>{openCurrentBillingForEdit();switchToTab(tabId);},tab);
  await page.waitForSelector(`#${tab}.active`);
  await page.waitForTimeout(180);
}

async function qualityModel(page){
  return page.evaluate(()=>{
    const report=NKProQualityRules.evaluate(state,{scope:"currentBilling",includeTechnical:false});
    return {
      counts:report.counts,
      readiness:report.readiness,
      groups:report.groups.map(group=>({area:group.areaLabel,page:group.label,tab:group.targetTab,count:group.results.length})),
      results:report.results.map(row=>({instanceId:row.instanceId,ruleId:row.ruleId,title:row.title,status:row.status,targetTab:row.targetTab,targetSelector:row.targetSelector,confirmAllowed:row.confirmAllowed,decisionSource:row.decisionSource||"",decisionId:row.decisionId||"",decision:row.decision||null,blocking:!!row.blocking,criticalSubtype:row.criticalSubtype||"",details:row.details||""}))
    };
  });
}

async function acceptBillingDecisionFromQuality(page,instanceId,reason){
  const row=page.locator(`tr[data-quality-instance="${instanceId}"]`);
  await row.getByRole("button",{name:"Entscheiden",exact:true}).click();
  await page.waitForFunction(()=>document.getElementById("billingReviewAcceptDialog")?.open===true);
  await page.selectOption("#billingReviewTreatment","accepted-other");
  await page.fill("#billingReviewReason",reason);
  await page.fill("#billingReviewAcceptedBy","AP22F11B K4 Browsertest");
  await page.check("#billingReviewConfirmed");
  await page.getByRole("button",{name:"Prüfentscheidung speichern",exact:true}).click();
  await page.waitForFunction(id=>{
    const report=NKProQualityRules.evaluate(state,{scope:"currentBilling"});
    const current=report.results.find(row=>row.instanceId===id);
    return current&&current.status==="Bestanden";
  },instanceId);
  await page.waitForTimeout(120);
}

async function layout(page,tab){
  return page.evaluate(tabId=>{
    const selector=tabId==="qualitaet"?"#qualitaet .quality-results-table-wrap":"#regelinventar .rule-inventory-table-wrap";
    const wrap=document.querySelector(selector);
    const table=wrap&&wrap.querySelector("table");
    return {
      documentOverflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),
      wrapClient:wrap?.clientWidth||0,
      wrapScroll:wrap?.scrollWidth||0,
      tableScroll:table?.scrollWidth||0,
      headerBackground:table?.querySelector("thead th")?getComputedStyle(table.querySelector("thead th")).backgroundColor:"",minWidth:table?getComputedStyle(table).minWidth:"",width:table?getComputedStyle(table).width:"",media:matchMedia("(max-width:980px)").matches
    };
  },tab);
}

(async()=>{
  const startedAt=new Date().toISOString();
  const checks=[];
  const runtimeErrors=[];
  let registry=[];
  let activeBrowser=null;
  let activeSession=null;
  const launchBrowser=()=>chromium.launch({headless:true,executablePath:"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
  const safeCloseSession=async session=>{
    if(!session)return;
    await Promise.race([session.context.close().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,3000))]);
  };
  const safeCloseBrowser=async browser=>{
    if(!browser)return;
    await Promise.race([browser.close().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,3000))]);
  };
  const closePhase=async()=>{
    await safeCloseSession(activeSession);
    activeSession=null;
    await safeCloseBrowser(activeBrowser);
    activeBrowser=null;
  };
  try{
    // Phase 1: Kritische Abschlusswirkung vor den speicherintensiven Vollseiten-Screenshots prüfen.
    activeBrowser=await launchBrowser();
    activeSession=await mount(activeBrowser,{width:1440,height:900});
    await importData(activeSession.page);
    await activeSession.page.evaluate(()=>{openCurrentBillingForEdit();state.wohnungen=[];renderAll({forceAll:true,reason:"K4 Kritischtest"});switchToTab("qualitaet");});
    await activeSession.page.waitForSelector('#qualityResultsTable tr[data-quality-instance] .status.err');
    const critical=await activeSession.page.evaluate(()=>NKProQualityRules.evaluate(state).results.find(row=>row.status==="Kritischer Abrechnungsmangel"&&row.ruleId!=="NKP-FACH-019"));
    assert.ok(critical);
    assert.ok(["Berechnung nicht möglich","Abrechnung unvollständig"].includes(critical.criticalSubtype));
    assert.strictEqual(critical.confirmAllowed,false);
    const criticalActions=activeSession.page.locator(`tr[data-quality-instance="${critical.instanceId}"] .quality-row-actions`);
    assert.strictEqual(await criticalActions.getByRole("button",{name:"Entscheiden",exact:true}).count(),0);
    assert.strictEqual(await activeSession.page.locator("#qualityCompletionCard .quality-completion-action").isDisabled(),true);
    runtimeErrors.push(...activeSession.errors);
    checks.push("Kritischer Abrechnungsmangel kann nicht akzeptiert werden und verhindert den Abschluss");
    await safeCloseSession(activeSession);
    activeSession=null;

    // Phase 2: Entscheidungsquelle, Signaturinvalidierung und Finalisierung in frischem Kontext prüfen.
    activeSession=await mount(activeBrowser,{width:1440,height:1000});
    let page=activeSession.page;
    await importData(page);
    await openTab(page,"qualitaet");
    let model=await qualityModel(page);
    let manual=model.results.find(row=>row.decisionSource==="billing-review"&&row.ruleId==="NKP-FACH-013");
    assert.ok(manual,"manuelle finanzielle Differenz fehlt");
    let manualRow=page.locator(`tr[data-quality-instance="${manual.instanceId}"]`);
    await manualRow.getByRole("button",{name:"Korrigieren",exact:true}).click();
    await page.waitForFunction(()=>document.getElementById("manuellewerte")?.classList.contains("active"));
    assert.strictEqual(await page.locator('#manuellewerte [data-individual-section="manual"].billing-review-target-flash').count(),1);
    checks.push("Korrigieren führt zur verursachenden Eingabeseite und fokussiert den Bereich");

    await openTab(page,"qualitaet");
    model=await qualityModel(page);
    manual=model.results.find(row=>row.decisionSource==="billing-review"&&row.ruleId==="NKP-FACH-013");
    await acceptBillingDecisionFromQuality(page,manual.instanceId,"Manuelle Kostendifferenz fachlich geprüft und akzeptiert.");
    const consistency=await page.evaluate(id=>{
      const review=NKProBillingReview.currentModel(state).differences.find(row=>row.id===id);
      const quality=NKProQualityRules.evaluate(state).results.find(row=>row.decisionId===id);
      return {reviewStatus:review?.status,reviewReason:review?.record?.reason,qualityStatus:quality?.status,qualityReason:quality?.decision?.reason,recordCount:Object.keys(state.abrechnungsPruefungen?.records||{}).length,legacyCount:Object.keys(state.meta?.qualityRuleConfirmationsV2?.records||{}).length};
    },manual.decisionId);
    assert.strictEqual(consistency.reviewStatus,"accepted");
    assert.strictEqual(consistency.qualityStatus,"Bestanden");
    assert.strictEqual(consistency.reviewReason,consistency.qualityReason);
    assert.ok(consistency.recordCount>=1);
    assert.strictEqual(consistency.legacyCount,0,"finanzielle Entscheidung darf nicht im allgemeinen Bestätigungsspeicher landen");
    checks.push("Dieselbe finanzielle Entscheidung ist auf Abrechnungsergebnis und Prüfen/Abschließen konsistent");

    const costId=await page.evaluate(id=>NKProBillingReview.currentModel(state).differences.find(row=>row.id===id)?.costId,manual.decisionId);
    const source=await page.evaluate(cost=>{const values=state.umlageInputs?.[cost]?.caseValues||{};const caseKey=Object.keys(values)[0];return {caseKey,value:Number(values[caseKey]?.amount||0)};},costId);
    await page.evaluate(({costId,caseKey,value})=>{NKProBillingWorkflow.setManualExternalValue(costId,caseKey,value+1,"amount");if(!saveData())throw new Error("Speichern fehlgeschlagen");renderAll({forceAll:true,reason:"K4 Signaturinvalidierung"});},{costId,caseKey:source.caseKey,value:source.value});
    await openTab(page,"qualitaet");
    const invalid=await page.evaluate(id=>{const review=NKProBillingReview.currentModel(state).differences.find(row=>row.id===id);const quality=NKProQualityRules.evaluate(state).results.find(row=>row.decisionId===id);return {review:review?.status,quality:quality?.status,label:quality?.processingState};},manual.decisionId);
    assert.strictEqual(invalid.review,"acceptance-invalid");
    assert.strictEqual(invalid.quality,"Entscheidung erforderlich");
    assert.match(invalid.label,/ungültig/i);
    checks.push("Änderung der Ursprungsdaten invalidiert die Entscheidung über die bestehende Signatur");

    model=await qualityModel(page);
    for(const row of model.results.filter(item=>item.decisionSource==="billing-review"&&item.status==="Entscheidung erforderlich")){
      await acceptBillingDecisionFromQuality(page,row.instanceId,"Nach aktuellem Datenstand fachlich geprüft und zulässig akzeptiert.");
    }
    model=await qualityModel(page);
    for(const row of model.results.filter(item=>item.status==="Entscheidung erforderlich"&&item.confirmAllowed&&!item.decisionSource)){
      const tr=page.locator(`tr[data-quality-instance="${row.instanceId}"]`);
      await tr.getByRole("button",{name:"Entscheiden",exact:true}).click();
      await page.waitForFunction(id=>NKProQualityRules.evaluate(state).results.find(row=>row.instanceId===id)?.status==="Bestanden",row.instanceId);
    }
    model=await qualityModel(page);
    assert.strictEqual(model.counts.blocked,0);
    assert.strictEqual(model.counts.review,0);
    assert.strictEqual(model.counts.notExecuted,0);
    assert.strictEqual(model.readiness.level,"ok");
    const completionButton=page.locator("#qualityCompletionCard .quality-completion-action");
    assert.strictEqual(await completionButton.isDisabled(),false);
    assert.strictEqual(await page.evaluate(()=>!!state.meta.currentBillingFinalized),false);
    await completionButton.click();
    await page.waitForFunction(()=>state.meta.currentBillingFinalized===true);
    const finalized=await page.evaluate(()=>({finalized:state.meta.currentBillingFinalized,at:state.meta.currentBillingFinalizedAt,version:state.meta.currentBillingFinalizedWithAppVersion,readOnly:NKProBillingWorkflow.isCurrentBillingFinalized(),letterCount:(calculateUmlage().tenantResults||[]).filter(row=>row?.tenant&&isBillableTenant(row.tenant)&&tenantRelevantForCurrentBilling(row.tenant)).length}));
    assert.strictEqual(finalized.finalized,true);
    assert.strictEqual(finalized.version,"V99.4.66");
    assert.ok(finalized.at);
    assert.strictEqual(finalized.readOnly,true);
    assert.ok(finalized.letterCount>0);
    runtimeErrors.push(...activeSession.errors);
    checks.push("Fachlicher Abschluss erst nach erledigten Prüfungen; geprüfter Stand wird eingefroren");
    await safeCloseSession(activeSession);
    activeSession=null;

    // Phase 3: Vollständige sichtbare Ergebnisse, Inventar, Filter und responsive Zielansichten.
    activeSession=await mount(activeBrowser,{width:1440,height:1000});
    page=activeSession.page;
    await importData(page);
    await openTab(page,"qualitaet");
    await page.waitForSelector("#qualityResultsTable tbody tr[data-quality-instance]");
    model=await qualityModel(page);
    assert.strictEqual(model.counts.blocked,0);
    assert.ok(model.counts.review>=3);
    assert.ok(model.counts.done>=20);
    assert.ok(model.counts.notApplicable>=1);
    assert.ok(model.results.some(row=>row.status==="Hinweis"));
    assert.ok(model.results.some(row=>row.status==="Bestanden"));
    assert.ok(model.results.some(row=>row.status==="Nicht anwendbar"));
    assert.ok(model.results.some(row=>row.status==="Entscheidung erforderlich"));
    assert.strictEqual(await page.locator("#qualityStatusCards .quality-k4-kpi").count(),4);
    assert.strictEqual(await page.locator("#qualityResultsTable tbody tr[data-quality-instance]").count(),model.results.filter(row=>row.ruleId!=="NKP-FACH-019").length);
    assert.deepStrictEqual(await page.locator("#qualityResultsTable thead th").allTextContents(),["Prüfung","Konkretes aktuelles Ergebnis","Status","Vorhandene Entscheidung","Konsequenz","Aktionen"]);
    assert.strictEqual((await page.locator("#qualitaet").innerText()).includes("Blockierender Fehler"),false);
    checks.push("Alle fallbezogenen Ergebnisse einschließlich Bestanden, Nicht anwendbar und Entscheidungen sichtbar");

    const centralOrder=await page.evaluate(()=>NKProNavigation.navigationDefinition().filter(group=>["object","billing"].includes(group.key)).flatMap(group=>(group.items||[]).map(item=>({area:group.label,page:item.label,tab:item.tab}))));
    let last=-1;
    for(const group of model.groups){
      const idx=centralOrder.findIndex(item=>item.area===group.area&&item.page===group.page&&item.tab===group.tab);
      assert.ok(idx>=0,`Gruppe nicht in zentraler Navigation: ${group.area}/${group.page}`);
      assert.ok(idx>=last,`falsche Navigationsreihenfolge bei ${group.page}`);
      last=idx;
    }
    assert.strictEqual(model.groups[0].area,"Objekt vorbereiten");
    assert.ok(model.groups.some(group=>group.area==="Nebenkosten abrechnen"));
    checks.push("Gruppierung folgt exakt der zentralen Navigationsdefinition");

    const initialVisible=await page.locator("#qualityResultsTable tbody tr[data-quality-instance]").count();
    await page.getByRole("button",{name:/Entscheidung erforderlich/}).first().click();
    await page.waitForTimeout(80);
    assert.strictEqual(await page.locator("#qualityResultsTable tbody tr[data-quality-instance]").count(),model.counts.review);
    assert.strictEqual(await page.locator("#qualityStatusCards .quality-k4-kpi.is-active").count(),1);
    await page.locator('[data-quality-k4-filter="all"]').click();
    await page.waitForTimeout(80);
    assert.strictEqual(await page.locator("#qualityResultsTable tbody tr[data-quality-instance]").count(),initialVisible);
    await page.locator('[data-quality-k4-filter="notApplicable"]').click();
    await page.waitForTimeout(80);
    assert.strictEqual(await page.locator("#qualityResultsTable tbody tr[data-quality-instance]").count(),model.counts.notApplicable);
    await page.locator('[data-quality-k4-filter="all"]').click();
    checks.push("Kennzahlenkarten und Statuschips filtern dezent und konsistent");

    const firstRow=page.locator("#qualityResultsTable tbody tr[data-quality-instance]").first();
    await firstRow.getByRole("button",{name:"Details",exact:true}).click();
    await page.waitForSelector("#qualityDetailDialog[open]");
    assert.match(await page.locator("#qualityDetailContent").innerText(),/Regel-ID/i);
    await page.locator("#qualityDetailDialog button[type='submit']").click();
    await firstRow.getByRole("button",{name:"Regeldetails",exact:true}).click();
    await page.waitForSelector("#qualityDetailDialog[open]");
    const ruleDetailText=await page.locator("#qualityDetailContent").innerText();
    for(const pattern of [/Prüfungsort/i,/Fachlicher Zweck/i,/Datenquellen/i,/Berechnungslogik/i,/Formel/i,/Toleranz/i,/Rundung/i,/Vorzeichenlogik/i,/Sonderfälle/i,/Abschlusswirkung/i,/Akzeptanz zulässig/i,/Korrekturziel/i])assert.match(ruleDetailText,pattern,`Regeldetail fehlt: ${pattern}`);
    await page.locator("#qualityDetailDialog button[type='submit']").click();
    checks.push("Ergebnis- und Regeldetails enthalten die geforderten fachlichen Angaben");

    let l=await layout(page,"qualitaet");
    assert.strictEqual(l.documentOverflow,0);
    assert.ok(l.tableScroll<=l.wrapClient+2,`1440 Desktopscroll ${l.tableScroll}/${l.wrapClient}`);
    assert.ok(/rgb\((237|242|245|246)/.test(l.headerBackground),`Tabellenkopf ${l.headerBackground}`);
    if(CAPTURE_SCREENSHOTS)await page.screenshot({path:path.join(SHOTS,"01_pruefen_und_abschliessen_desktop_1440.png"),fullPage:true});
    await page.setViewportSize({width:1640,height:1000});await page.waitForTimeout(120);
    l=await layout(page,"qualitaet");assert.strictEqual(l.documentOverflow,0);assert.ok(l.tableScroll<=l.wrapClient+2);
    if(CAPTURE_SCREENSHOTS)await page.screenshot({path:path.join(SHOTS,"02_pruefen_und_abschliessen_desktop_1640.png"),fullPage:true});
    await page.setViewportSize({width:1152,height:1000});await page.waitForTimeout(120);
    l=await layout(page,"qualitaet");assert.strictEqual(l.documentOverflow,0);
    if(CAPTURE_SCREENSHOTS)await page.screenshot({path:path.join(SHOTS,"03_pruefen_und_abschliessen_125_prozent.png"),fullPage:true});
    checks.push("Qualitätsseite bei 1440, 1640 und 125-%-Äquivalent ohne Dokumentüberlauf");

    await page.setViewportSize({width:1440,height:1000});
    await openTab(page,"regelinventar");
    await page.waitForSelector("#qualityRuleRegistryTable tbody tr[data-rule-id]");
    assert.strictEqual(await page.locator("#ruleInventoryKpis .rule-k4-kpi").count(),4);
    registry=await page.evaluate(()=>NKProQualityRules.REGISTRY.map(rule=>JSON.parse(JSON.stringify(rule))));
    assert.ok(registry.length>=80,`Regelinventar nur ${registry.length}`);
    const required=["id","version","navigationArea","navigationPage","actualCheckLocation","executionTrigger","purpose","dataSource","logic","formula","tolerance","rounding","signLogic","specialCases","possibleResults","consequences","completionEffect","allowedActions","acceptanceAllowed","correctionTarget"];
    for(const rule of registry){
      assert.strictEqual(rule.productive,true,`${rule.id} nicht produktiv markiert`);
      assert.ok(!String(rule.id).startsWith("NKP-TECH"),`technische Testregel im Inventar ${rule.id}`);
      assert.ok(!/Playwright|Fixture|Regressionstest|Syntaxprüfung/i.test([rule.title,rule.purpose,rule.actualCheckLocation].join(" ")),`Testfall im Inventar ${rule.id}`);
      for(const field of required){
        assert.ok(Object.prototype.hasOwnProperty.call(rule,field),`${rule.id}: Feld ${field} fehlt`);
        if(field!=="acceptanceAllowed")assert.ok(Array.isArray(rule[field])?rule[field].length>0:String(rule[field]).trim().length>0,`${rule.id}: Feld ${field} leer`);
      }
    }
    assert.ok(registry.some(rule=>rule.sourceCode==="MEASUREMENT_PERIOD_ALLOCATION_ESTIMATED"));
    assert.ok(registry.some(rule=>rule.actualCheckLocation.includes("billing-review.js")));
    fs.writeFileSync(path.join(DOCS,"REGEL_UND_PRUEFINVENTAR.json"),JSON.stringify({generatedAt:new Date().toISOString(),schemaVersion:5,count:registry.length,rules:registry},null,2));
    assert.strictEqual(await page.locator("#qualityRuleRegistryTable tbody tr[data-rule-id]").count(),registry.length);
    await page.locator("#ruleInventorySearch").fill("Wasser");await page.waitForTimeout(100);
    const filtered=await page.locator("#qualityRuleRegistryTable tbody tr[data-rule-id]").count();
    assert.ok(filtered>0&&filtered<registry.length);
    await page.selectOption("#ruleInventoryAcceptanceFilter","true");await page.waitForTimeout(100);
    assert.ok(await page.locator("#qualityRuleRegistryTable tbody tr[data-rule-id]").count()>0);
    await page.getByRole("button",{name:"Zurücksetzen",exact:true}).click();await page.waitForTimeout(100);
    assert.strictEqual(await page.locator("#qualityRuleRegistryTable tbody tr[data-rule-id]").count(),registry.length);
    if(CAPTURE_SCREENSHOTS)await page.screenshot({path:path.join(SHOTS,"04_regelinventar_desktop_1440.png"),fullPage:true});
    await page.setViewportSize({width:1640,height:1000});await page.waitForTimeout(120);
    l=await layout(page,"regelinventar");assert.strictEqual(l.documentOverflow,0);assert.ok(l.tableScroll<=l.wrapClient+2);
    if(CAPTURE_SCREENSHOTS)await page.screenshot({path:path.join(SHOTS,"05_regelinventar_desktop_1640.png"),fullPage:true});
    checks.push(`Regelinventar mit ${registry.length} ausschließlich produktiven Regeln und vollständigen Metadaten geprüft`);

    await page.setViewportSize({width:760,height:980});
    await openTab(page,"qualitaet");
    l=await layout(page,"qualitaet");assert.strictEqual(l.documentOverflow,0);assert.ok(l.tableScroll>l.wrapClient+10,"Qualitätstabelle muss schmal intern scrollen");
    if(CAPTURE_SCREENSHOTS)await page.screenshot({path:path.join(SHOTS,"06_pruefen_und_abschliessen_schmal_760.png"),fullPage:true});
    await openTab(page,"regelinventar");
    l=await layout(page,"regelinventar");assert.strictEqual(l.documentOverflow,0);assert.ok(l.tableScroll>l.wrapClient+10,"Regelinventar muss schmal intern scrollen");
    if(CAPTURE_SCREENSHOTS)await page.screenshot({path:path.join(SHOTS,"07_regelinventar_schmal_760.png"),fullPage:true});
    checks.push("Beide Seiten schmal ohne Dokumentüberlauf und mit internem Tabellen-Scroll");
    runtimeErrors.push(...activeSession.errors);

    assert.deepStrictEqual(runtimeErrors,[],`Laufzeitfehler:\n${runtimeErrors.join("\n")}`);
    const result={ok:true,startedAt,finishedAt:new Date().toISOString(),checks,screenshots:fs.readdirSync(SHOTS).sort(),runtimeErrors,registryCount:registry.length,schemaVersion:5};
    fs.writeFileSync(REPORT,JSON.stringify(result,null,2));
    console.log(`AP22F11B Korrektur 4 browser checks passed (${checks.length} Prüfgruppen)`);
  }catch(error){
    fs.writeFileSync(REPORT,JSON.stringify({ok:false,startedAt,finishedAt:new Date().toISOString(),checks,error:error.stack||String(error),runtimeErrors:[...runtimeErrors,...(activeSession?.errors||[])]},null,2));
    throw error;
  }
})().then(()=>process.exit(0)).catch(error=>{console.error(error);process.exit(1);});
