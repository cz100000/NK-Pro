"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {chromium}=require("@playwright/test");
const {openFreshApp,loadFixture,attachRuntimeGuards}=require("./test-helpers.cjs");

const shots=process.env.AP22F10B_SCREENSHOT_DIR||path.join(process.cwd(),"AP22F10B_Screenshots");
fs.rmSync(shots,{recursive:true,force:true});fs.mkdirSync(shots,{recursive:true});
const moneyNumber=text=>Number(String(text).replace(/[^0-9,.-]/g,"").replace(/\./g,"").replace(",","."));

async function openPage(page,mode="edit"){
  await page.evaluate(mode=>{
    NK_PRO_MODULES.billingContext.close();
    NK_PRO_MODULES.billingContext.open({recordKey:"current",recordType:"current",label:"2025"},mode==="view"?NK_PRO_MODULES.billingContext.MODES.VIEW:NK_PRO_MODULES.billingContext.MODES.EDIT);
    document.documentElement.dataset.billingExplicitlyOpened="true";
    switchToTab("manuellewerte");
    renderAll({forceAll:true,reason:"ap22f10b-browser"});
  },mode);
  await page.waitForSelector("#manuellewerte.active");
  await page.waitForTimeout(120);
}

async function resetPosition(page){
  await page.evaluate(()=>{
    window.scrollTo(0,0);
    document.querySelectorAll("#manuellewerte .individual-values-table-wrap").forEach(node=>node.scrollLeft=0);
  });
  await page.waitForTimeout(60);
}

async function screenshot(page,name,locator){
  await page.waitForTimeout(60);
  const target=locator?page.locator(locator).first():null;
  if(target){await target.scrollIntoViewIfNeeded();await target.screenshot({path:path.join(shots,name)});}
  else {await resetPosition(page);await page.screenshot({path:path.join(shots,name),fullPage:true});}
}

async function prepareCompleteScenario(page){
  return page.evaluate(()=>{
    const active=new Set(["K002","K006","K009"]);
    state.kostenarten.forEach(cost=>{
      cost.inNK=active.has(cost.id)?"Ja":"Nein";
      if(cost.id==="K002")Object.assign(cost,{gesamtbetrag:1965.42,gesamtverbrauch:0,umlageschluessel:"Verbrauch",berechnungsart:"Automatisch"});
      if(cost.id==="K006")Object.assign(cost,{gesamtbetrag:0,umlageschluessel:"Manuelle Eingabe je Mieter/Wohneinheit",berechnungsart:"Manuell je Mieter"});
      if(cost.id==="K009")Object.assign(cost,{gesamtbetrag:1120,umlageschluessel:"Verteilung nur auf aktive Wohneinheiten",berechnungsart:"Automatisch"});
    });
    synchronizeMeteringData(state);syncUmlageInputs();
    const rows=NKProBillingCalculation.waterMeterRows(state);
    const prior=NKProYearTransitionActions.prepareIndividualPriorReadingTransfer(state);
    const previous=new Map(prior.candidates.map(row=>[row.meterId,row.previousEnd]));
    const consumptions=[34,16,41,19,37,13,29,11,43,17,21,9];
    const byId=new Map(state.zaehlerDaten.zaehler.map(meter=>[String(meter.meterId||meter.zaehlerId||meter.id||""),meter]));
    state.zaehlerDaten.messwerte=(state.zaehlerDaten.messwerte||[]).filter(row=>!String(row&&row.herkunft||"").startsWith("ap22f10b-test"));
    rows.forEach((row,index)=>{
      const meter=byId.get(row.meterId);
      const start=previous.get(row.meterId)!==""&&previous.get(row.meterId)!==undefined?Number(previous.get(row.meterId)):1000+index*25;
      const end=start+consumptions[index];
      const binding=Array.isArray(meter&&meter.legacyBindings)?meter.legacyBindings.find(item=>item&&["water-cold","water-hot"].includes(String(item.channel||""))):null;
      if(binding){
        const target=state.waterMeters.readings[Number(binding.index)]||(state.waterMeters.readings[Number(binding.index)]={});
        const prefix=binding.channel==="water-hot"?"ww":"kw";
        target[prefix+"Start"]=start;target[prefix+"StartDate"]="2025-01-01";target[prefix+"End"]=end;target[prefix+"EndDate"]="2025-12-31";
      }else{
        for(const [role,date,value] of [["start","2025-01-01",start],["end","2025-12-31",end]]){
          const id="MW-AP22F10B-TEST-"+index+"-"+role;
          state.zaehlerDaten.messwerte.push({messwertId:id,measurementId:id,id,zaehlerId:row.meterId,meterId:row.meterId,ablesedatum:date,messzeitraumVon:"2025-01-01",messzeitraumBis:"2025-12-31",wert:value,einheit:"m³",ableseart:role==="start"?"Anfangsablesung":"Endablesung",herkunft:"ap22f10b-test",rolle:role,status:"active",erfasstAm:"2026-02-15T12:00:00.000Z",plausibilitaetsstatus:"geprüft"});
        }
      }
    });
    synchronizeMeteringData(state);
    const water=NKProBillingCalculation.waterConsumptionSummary(state);
    state.kostenarten.find(cost=>cost.id==="K002").gesamtverbrauch=water.actual;
    const amounts=[700,1200,1100,1000,900,1445.19];
    const consumptionsExternal=[4100,6800,6200,5700,5100,7600];
    const individualCases=NKProBillingCalculation.individualValueCases(state);
    const input=state.umlageInputs.K006||(state.umlageInputs.K006={values:[],caseValues:{}});
    input.mode="Externe Einzelabrechnung";input.caseValues={};
    individualCases.forEach((caseRow,index)=>{
      input.caseValues[caseRow.caseKey]={amount:amounts[index],consumption:consumptionsExternal[index],provider:"ABC Abrechnungsservice",recordedAt:"2026-02-15",source:"test"};
      if(caseRow.originalIndex>=0)input.values[caseRow.originalIndex]=amounts[index];
    });
    const externalTotal=amounts.reduce((sum,value)=>sum+value,0);
    state.kostenarten.find(cost=>cost.id==="K006").gesamtbetrag=externalTotal;
    syncUmlageInputs();applyWaterMetersToUmlage();renderAll({forceAll:true,reason:"ap22f10b-reference"});
    return {waterTotal:water.actual,externalTotal,cases:individualCases.length,meters:rows.length};
  });
}
async function assertTableFrame(page,selector){
  const result=await page.locator(selector).evaluate(wrap=>{
    const table=wrap.querySelector("table");
    wrap.scrollLeft=wrap.scrollWidth;
    const wr=wrap.getBoundingClientRect(),tr=table.getBoundingClientRect();
    return {overflow:wrap.scrollWidth-wrap.clientWidth,gap:Math.abs(wr.right-tr.right),documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  assert.ok(result.overflow>0,`${selector}: interner Tabellen-Scroll fehlt ${JSON.stringify(result)}`);
  assert.ok(result.gap<=3,`${selector}: rechter Tabellenabschluss offen ${JSON.stringify(result)}`);
  assert.ok(result.documentOverflow<=1,`${selector}: horizontaler Seitenüberlauf ${JSON.stringify(result)}`);
}

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"]});
  const context=await browser.newContext({viewport:{width:1720,height:1100},locale:"de-DE",timezoneId:"Europe/Berlin",serviceWorkers:"block"});
  const page=await context.newPage();const runtime=attachRuntimeGuards(page);
  try{
    await openFreshApp(page);await loadFixture(page,"leerstand.json");await openPage(page,"edit");

    // F5: kontrollierter Dialog, eindeutige Werte vorausgewählt, Leerstand gesperrt.
    const priorTrigger=page.locator("[data-individual-prior-open]");
    await priorTrigger.click();await page.waitForTimeout(80);
    assert.equal(await page.locator("#individualPriorTransferDialog").isVisible(),true);
    assert.equal(await page.locator("#individualPriorTransferDialog").evaluate(dialog=>dialog.contains(document.activeElement)),true,"Dialogfokus fehlt");
    assert.equal(await page.locator("[data-individual-prior-list] input:not(:disabled)").count(),10);
    assert.equal(await page.locator("[data-individual-prior-list] input:disabled").count(),2);
    assert.match(await page.locator("[data-individual-prior-list]").innerText(),/Kein eindeutiger Vorjahreswert gefunden/);
    await screenshot(page,"14_vorjahresuebernahmedialog.png","#individualPriorTransferDialog");
    await page.locator("[data-individual-prior-confirm]").click();await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>state.meta.individualValuesPriorTransfers.length),10);

    const reference=await prepareCompleteScenario(page);await page.waitForTimeout(150);
    assert.equal(reference.waterTotal,290);assert.ok(Math.abs(reference.externalTotal-6345.19)<0.0001);assert.equal(reference.cases,6);assert.equal(reference.meters,12);

    // Grundstruktur, Filter und Design.
    assert.equal(await page.locator("#manuellewerte [data-individual-kpi]").count(),4);
    assert.equal(await page.locator("#manuellewerte [data-individual-kpi] svg").count(),4);
    assert.equal(await page.locator("#manuellewerte [data-individual-kpi='external-total'] .individual-values-kpi__icon").evaluate(node=>node.textContent.trim()),"");
    assert.equal(await page.locator("#manuellewerte [data-individual-kpi='external-total'] .individual-values-kpi__icon").evaluate(node=>getComputedStyle(node).color),"rgb(213, 40, 47)");
    assert.equal(await page.locator("#individualWaterTable tbody tr[data-individual-water-row]").count(),12);
    assert.equal(await page.locator("#individualWaterTable tbody tr.individual-values-subtotal").count(),6);
    assert.equal(await page.locator("#individualExternalSections [data-individual-cost]").count(),1,"Automatische Müllkosten dürfen nicht erscheinen");
    assert.equal(await page.locator("#individualExternalSections").innerText().then(text=>/Müllbeseitigung/.test(text)),false);
    assert.match(await page.locator("#individualWaterTable").innerText(),/Kaltwasser/);
    assert.match(await page.locator("#individualWaterTable").innerText(),/Warmwasser/);
    assert.match(await page.locator("#individualWaterTable").innerText(),/Leerstand/);
    assert.match(await page.locator("#individualWaterTable").innerText(),/Privatanteil/);
    assert.equal(await page.locator("[data-individual-kpi-value='water-total']").innerText(),"290,00 m³");
    assert.equal(moneyNumber(await page.locator("[data-individual-kpi-value='external-total']").innerText()),6345.19);
    assert.equal(await page.locator("#individualWaterComparison").getAttribute("class"),"individual-values-comparison is-complete");
    assert.equal(await page.locator("[data-individual-cost='K006']").getAttribute("data-individual-status"),"complete");
    const head=await page.locator("#individualWaterTable thead th").first().evaluate(node=>({background:getComputedStyle(node).backgroundColor,color:getComputedStyle(node).color}));
    assert.deepEqual(head,{background:"rgb(247, 249, 252)",color:"rgb(23, 59, 90)"});
    assert.equal(await page.locator("#manuellewerte thead .sortable,#manuellewerte thead [aria-sort]").count(),0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1);

    await screenshot(page,"01_desktop_bearbeitungsmodus.png");
    await screenshot(page,"03_wasser_kalt_und_warmwasserzaehler.png","#individualWaterSection");
    await screenshot(page,"04_wohnungsbezogene_gesamtverbrauchsdarstellung.png","#individualWaterTable tbody tr.individual-values-subtotal:nth-of-type(3)");
    await screenshot(page,"05_leerstand.png","#individualWaterTable tbody tr:has-text('Leerstand')");
    await screenshot(page,"06_privatanteil.png","#individualWaterTable tbody tr:has-text('Privatanteil')");
    await screenshot(page,"07_externe_heiz_und_warmwasserkosten.png","[data-individual-cost='K006']");
    await screenshot(page,"08_vollstaendiger_wasserabgleich.png","#individualWaterComparison");
    await screenshot(page,"10_vollstaendiger_kostenabgleich.png","[data-individual-cost='K006'] .individual-values-comparison");

    // Toleranzen 0,01 und getrennte Prüfung NKP-PLAU-006 / NKP-PLAU-012.
    const tolerance=await page.evaluate(()=>{
      const water=NKProBillingCalculation.waterConsumptionSummary(state);
      const waterCost=state.kostenarten.find(cost=>cost.id==="K002");
      waterCost.gesamtverbrauch=water.actual+0.009;renderIndividualValues();const waterInside=NKProBillingCalculation.waterConsumptionSummary(state).status;
      waterCost.gesamtverbrauch=water.actual+0.011;renderIndividualValues();const waterOutside=NKProBillingCalculation.waterConsumptionSummary(state).status;
      const heat=state.kostenarten.find(cost=>cost.id==="K006");const expected=heat.gesamtbetrag;
      heat.gesamtbetrag=expected+0.009;renderIndividualValues();const costInside=NKProIndividualValues.assessment(heat).status;
      heat.gesamtbetrag=expected+0.011;renderIndividualValues();const costOutside=NKProIndividualValues.assessment(heat).status;
      waterCost.gesamtverbrauch=water.actual;heat.gesamtbetrag=expected;renderIndividualValues();
      const report=NKProQualityRules.evaluate(state,{includeTechnical:false});
      return {waterInside,waterOutside,costInside,costOutside,rules:report.results.filter(row=>["NKP-PLAU-006","NKP-PLAU-012"].includes(row.ruleId)).map(row=>row.ruleId)};
    });
    assert.equal(tolerance.waterInside,"complete");assert.equal(tolerance.waterOutside,"error");
    assert.equal(tolerance.costInside,"complete");assert.equal(tolerance.costOutside,"error");
    assert.deepEqual([...new Set(tolerance.rules)].sort(),["NKP-PLAU-006","NKP-PLAU-012"]);

    // Reale Abweichungsansichten.
    await page.evaluate(()=>{state.kostenarten.find(cost=>cost.id==="K002").gesamtverbrauch=302;renderIndividualValues();});
    assert.equal(await page.locator("#individualWaterComparison").getAttribute("class"),"individual-values-comparison is-error");
    await screenshot(page,"09_wasserabweichung.png","#individualWaterComparison");
    await page.evaluate(()=>{state.kostenarten.find(cost=>cost.id==="K002").gesamtverbrauch=290;const k=state.kostenarten.find(cost=>cost.id==="K006");k.gesamtbetrag=6355.19;renderIndividualValues();});
    assert.equal(await page.locator("[data-individual-cost='K006']").getAttribute("data-individual-status"),"error");
    await screenshot(page,"11_kostendifferenz.png","[data-individual-cost='K006'] .individual-values-comparison");
    await page.evaluate(()=>{state.kostenarten.find(cost=>cost.id==="K006").gesamtbetrag=6345.19;renderIndividualValues();});

    // UI-Bearbeitung, Fehlerzustand, Fokus und Rückkehr.
    const firstEdit=page.locator("[data-individual-water-edit]").first();await firstEdit.focus();await firstEdit.click();await page.waitForTimeout(70);
    assert.equal(await page.locator("#individualWaterEditDialog").isVisible(),true);
    assert.equal(await page.locator("#individualWaterEditDialog").evaluate(dialog=>dialog.contains(document.activeElement)),true);
    await page.locator("#individualWaterStart").fill("600");await page.locator("#individualWaterEnd").fill("599");
    assert.match(await page.locator("[data-individual-water-preview]").innerText(),/Endstand liegt unter/);
    await page.locator("#individualWaterEnd").fill("634");await page.locator("[data-individual-water-save]").click();await page.waitForTimeout(120);
    assert.equal(await page.locator("#individualWaterEditDialog").isHidden(),true);
    assert.equal(await firstEdit.evaluate(node=>document.activeElement===node),true,"Fokus kehrt nicht zum Auslöser zurück");
    const changed=await page.evaluate(()=>NKProBillingCalculation.waterMeterRows(state)[0]);
    assert.equal(changed.startValue,600);assert.equal(changed.endValue,634);assert.equal(changed.consumption,34);

    // Import/Übernahmeweg: unbekannte, mehrdeutige und doppelte Zuordnung werden blockiert.
    await page.locator("[data-individual-import-open='K006']").click();await page.waitForTimeout(70);
    const originalNames=await page.evaluate(()=>{
      const rows=state.mieter.filter(row=>row&&row.id&&!String(row.abrechnungRolle||"").toLocaleLowerCase("de-DE").includes("eigent")).slice(0,2);
      const result=rows.map(row=>({id:row.id,name:row.name}));rows.forEach(row=>row.name="Mehrdeutig");return result;
    });
    await page.locator("[data-individual-import-text]").fill("Mehrdeutig;100,00\nUnbekannt;50,00");
    await page.locator("[data-individual-import-preview]").click();await page.waitForTimeout(60);
    assert.match(await page.locator("[data-individual-import-preview-result]").innerText(),/Zuordnung nicht eindeutig/);
    assert.match(await page.locator("[data-individual-import-preview-result]").innerText(),/Abrechnungsfall nicht gefunden/);
    await page.evaluate(rows=>rows.forEach(saved=>{const row=state.mieter.find(item=>item.id===saved.id);if(row)row.name=saved.name;}),originalNames);
    await page.locator("[data-individual-import-text]").fill("W001.EG-L;100,00\nW001.EG-L;200,00");
    await page.locator("[data-individual-import-preview]").click();await page.waitForTimeout(60);
    assert.equal(await page.locator("[data-individual-import-preview-result] tr.is-error").count(),2);
    assert.match(await page.locator("[data-individual-import-preview-result]").innerText(),/mehrfach enthalten/);
    const importText=[
      "W000.UG;700,00;4100;ABC Abrechnungsservice;2026-02-15",
      "W001.EG-L;1200,00;6800;ABC Abrechnungsservice;2026-02-15",
      "W002.EG-R;1100,00;6200;ABC Abrechnungsservice;2026-02-15",
      "W003.1OG-L;1000,00;5700;ABC Abrechnungsservice;2026-02-15",
      "W004.1OG-R;900,00;5100;ABC Abrechnungsservice;2026-02-15",
      "W005.DG-L;1445,19;7600;ABC Abrechnungsservice;2026-02-15"
    ].join("\n");
    await page.locator("[data-individual-import-text]").fill(importText);await page.locator("[data-individual-import-preview]").click();await page.waitForTimeout(80);
    assert.equal(await page.locator("[data-individual-import-preview-result] tr.is-valid").count(),6);
    assert.equal(await page.locator("[data-individual-import-confirm]").isEnabled(),true);
    await page.locator("[data-individual-import-confirm]").click();await page.waitForTimeout(130);
    assert.equal(await page.evaluate(()=>Object.keys(state.umlageInputs.K006.caseValues).length),6);
    assert.equal(await page.evaluate(()=>state.umlageInputs.K006.caseValues[Object.keys(state.umlageInputs.K006.caseValues).find(key=>key.startsWith("vacancy:"))].amount),1445.19);

    // Nachgelagerte Verteilung dokumentiert Leerstand separat.
    const downstream=await page.evaluate(()=>{const c=calculateUmlage();const totals=umlageTotals(c);return{owner:totals.ownerShare,documented:totals.documentedOwnerShare,vacancy:totals.vacancyShare,tenantCount:c.tenantResults.length};});
    assert.ok(downstream.documented>=1445.19,JSON.stringify(downstream));assert.ok(downstream.vacancy>=1445.19,JSON.stringify(downstream));

    // Persistenz und Neustart.
    await page.locator("#manuellewerte [data-ui-action='application.save']").click();await page.waitForTimeout(130);
    const saved=await page.evaluate(()=>localStorage.__entries());assert.ok(Object.keys(saved).length>0);
    const reload=await context.newPage();const reloadRuntime=attachRuntimeGuards(reload);
    await openFreshApp(reload,saved);await openPage(reload,"edit");
    const persisted=await reload.evaluate(()=>({water:NKProBillingCalculation.waterConsumptionSummary(state).actual,vacancy:Object.entries(state.umlageInputs.K006.caseValues).find(([key])=>key.startsWith("vacancy:"))[1].amount}));
    assert.equal(persisted.water,290);assert.equal(persisted.vacancy,1445.19);reloadRuntime.assertClean();await reload.close();

    // Nur-Ansehen-Modus.
    await openPage(page,"view");
    assert.equal(await page.locator("#manuellewerte .billing-readonly-notice").count(),1);
    assert.equal(await page.locator("#manuellewerte .billing-readonly-notice").isVisible(),true);
    assert.equal(await page.locator("#manuellewerte [data-individual-water-edit],#manuellewerte [data-individual-external-edit],#manuellewerte [data-individual-import-open]").count(),0);
    await screenshot(page,"02_desktop_nur_ansehen.png");
    await openPage(page,"edit");

    // Fehlender Vorjahresstand.
    await page.evaluate(()=>{
      const row=NKProBillingCalculation.waterMeterRows(state).find(item=>item.caseRole==="vacancy"&&item.meterType==="cold-water");
      const meterId=row.meterId;
      state.zaehlerDaten.messwerte=(state.zaehlerDaten.messwerte||[]).filter(item=>String(item&&(item.zaehlerId||item.meterId)||"")!==meterId||String(item&&item.rolle||"")!=="start");
      state.zaehlerDaten.messperioden=(state.zaehlerDaten.messperioden||[]).filter(item=>String(item&&(item.zaehlerId||item.meterId)||"")!==meterId);
      synchronizeMeteringData(state);renderIndividualValues();
    });await page.waitForTimeout(90);
    const missingRow=page.locator("#individualWaterTable tbody tr:has-text('Leerstand')").first();
    assert.match(await missingRow.innerText(),/Fehlt/);
    await screenshot(page,"12_fehlender_vorjahresstand.png","#individualWaterTable tbody tr:has-text('Leerstand')");

    // Zählerwechsel mit Bestätigung im realen Bearbeitungsdialog.
    await page.evaluate(()=>{
      const row=NKProBillingCalculation.waterMeterRows(state).find(item=>item.caseRole==="tenant"&&item.meterType==="cold-water");
      const meter=state.zaehlerDaten.zaehler.find(item=>(item.meterId||item.zaehlerId||item.id)===row.meterId);meter.vorgaengerZaehlerId="Z-ALT-001";renderIndividualValues();
    });
    const replacementButton=page.locator("#individualWaterTable tbody tr:has-text('Wechsel bestätigt') [data-individual-water-edit]").first();
    await replacementButton.click();await page.waitForTimeout(70);
    assert.equal(await page.locator("[data-individual-replacement-confirm]").count(),1);
    await screenshot(page,"13_zaehlerwechsel.png","#individualWaterEditDialog");
    await page.keyboard.press("Escape");await page.waitForTimeout(60);

    // Responsives Raster und ausschließlich interner Scroll.
    await page.setViewportSize({width:620,height:900});await page.waitForTimeout(120);
    const grid620=await page.locator(".individual-values-kpis").evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(" ").length);
    assert.equal(grid620,2);await assertTableFrame(page,"#individualWaterTableWrap");
    await screenshot(page,"16_ansicht_620px.png");
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(120);
    const grid390=await page.locator(".individual-values-kpis").evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(" ").length);
    assert.equal(grid390,2);await assertTableFrame(page,"#individualWaterTableWrap");
    await screenshot(page,"17_ansicht_390px.png");

    // Echter Leerzustand bei deaktivierten individuellen Kostenarten.
    await page.setViewportSize({width:1720,height:1100});await page.evaluate(()=>{state.kostenarten.forEach(cost=>cost.inNK="Nein");syncUmlageInputs();renderIndividualValues();});await page.waitForTimeout(100);
    assert.equal(await page.locator("#individualValuesEmpty").isVisible(),true);
    assert.equal(await page.locator("#individualWaterSection").isHidden(),true);
    assert.equal(await page.locator("#individualExternalSections [data-individual-cost]").count(),0);
    await screenshot(page,"15_leerzustand.png");

    const files=fs.readdirSync(shots).filter(name=>name.endsWith(".png")).sort();
    assert.equal(files.length,17,JSON.stringify(files));
    runtime.assertClean();
    console.log("AP22F10B Individuelle Werte browser: PASS (17 Screenshots)");
  }finally{
    try{await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,2500))]);}catch(_error){}
  }
})().then(()=>process.exit(0)).catch(error=>{console.error(error);process.exit(1);});
