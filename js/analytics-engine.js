(function(global){
  "use strict";

  const VERSION = 1;
  const CACHE_LIMIT = 8;
  let deps = null;
  const cache = new Map();

  function configure(options={}){
    if (deps) return describe();
    if (!options.stateAccess || typeof options.stateAccess.current !== "function") throw new Error("Analyseengine benötigt NKProStateAccess.");
    if (typeof options.calculateDataset !== "function") throw new Error("Analyseengine benötigt die bestehende Abrechnungsberechnung für isolierte Datensätze.");
    deps = Object.freeze({
      stateAccess:options.stateAccess,
      calculateDataset:options.calculateDataset,
      inspectDataset:typeof options.inspectDataset === "function" ? options.inspectDataset : null,
      isPrivateUse:typeof options.isPrivateUse === "function" ? options.isPrivateUse : (()=>false),
      isSettlementParticipant:typeof options.isSettlementParticipant === "function" ? options.isSettlementParticipant : (record=>!!record),
      reconciliation:options.reconciliation || null,
      appVersion:String(options.appVersion||"")
    });
    return describe();
  }
  function requireDeps(){ if(!deps) throw new Error("Analyseengine wurde noch nicht konfiguriert."); return deps; }
  function text(v){ return String(v===undefined||v===null?"":v).trim(); }
  function number(v){
    if(v===null||v===undefined||v==="") return 0;
    if(typeof v==="number") return Number.isFinite(v)?v:0;
    const n=Number(String(v).trim().replace(/\s/g,"").replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",","."));
    return Number.isFinite(n)?n:0;
  }
  function hasNumber(v){ return v!==null&&v!==undefined&&v!==""&&Number.isFinite(number(v)); }
  function round(v,digits=2){ const f=10**digits; return Math.round((number(v)+Number.EPSILON)*f)/f; }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function array(v){ return Array.isArray(v)?v:[]; }
  function sum(rows,fn){ return array(rows).reduce((s,row)=>s+number(fn?fn(row):row),0); }
  function unique(values){ return Array.from(new Set(array(values).filter(v=>v!==""&&v!==null&&v!==undefined))); }
  function isoDate(value){ return /^\d{4}-\d{2}-\d{2}$/.test(text(value)) ? text(value) : ""; }
  function daysBetween(start,end){
    if(!isoDate(start)||!isoDate(end)) return 0;
    const a=Date.parse(start+"T00:00:00Z"), b=Date.parse(end+"T00:00:00Z");
    return Number.isFinite(a)&&Number.isFinite(b)&&b>=a ? Math.floor((b-a)/86400000)+1 : 0;
  }
  function isCalendarPeriod(start,end,label){
    if(!isoDate(start)||!isoDate(end)) return false;
    const y=start.slice(0,4);
    return start===y+"-01-01" && end===y+"-12-31" && (!label || /^\d{4}$/.test(text(label)) || text(label)===y);
  }
  function periodDisplayLabel(meta={},fallback=""){
    const label=text(meta.abrechnungsjahr||fallback);
    if(label) return label;
    const start=isoDate(meta.abrechnungsbeginn), end=isoDate(meta.abrechnungsende);
    return start&&end ? start+" – "+end : "Unbenannte Periode";
  }
  function periodKey(meta={},fallback="",index=0){
    return text(meta.periodId) || [periodDisplayLabel(meta,fallback),isoDate(meta.abrechnungsbeginn),isoDate(meta.abrechnungsende),index].join("|");
  }
  function sourceLabel(meta={},archiveItem=null,isCurrent=false){
    if(isCurrent) return text(meta.datenquelle||"Aktueller Arbeitsstand") || "Aktueller Arbeitsstand";
    return text(meta.datenquelle||meta.legacyQuelle||(archiveItem&&archiveItem.source)||"Archiv") || "Archiv";
  }
  function periodSortValue(period){
    const start=Date.parse((period.start||"0000-01-01")+"T00:00:00Z");
    const end=Date.parse((period.end||"0000-01-01")+"T00:00:00Z");
    return (Number.isFinite(start)?start:0)+(Number.isFinite(end)?end:0)/1e6;
  }
  function basePeriodQuality(dataset,meta,origin){
    const issues=[];
    // Archivstatus und Legacy-Status sind getrennte Dimensionen. Ein normaler finalisierter
    // Snapshot wird nicht allein deshalb zum Legacy-Datenstand.
    const legacy=!!text(meta.legacyArchivHinweis)||!!text(meta.legacyQuelle)||/^legacy/i.test(text(meta.periodId))||/übernommen|importiert/i.test(text(meta.datenquelle));
    const start=isoDate(meta.abrechnungsbeginn), end=isoDate(meta.abrechnungsende);
    const calendar=isCalendarPeriod(start,end,meta.abrechnungsjahr);
    if(!start||!end) issues.push("Periodengrenzen fehlen oder sind ungültig.");
    if(!array(dataset&&dataset.kostenarten).some(k=>k&&k.kostenart)) issues.push("Keine Kostenarten vorhanden.");
    if(!array(dataset&&dataset.mieter).some(m=>m&&m.id&&m.name&&m.wohnung)) issues.push("Keine vollständigen Teilnehmerdaten vorhanden.");
    if(legacy) issues.push("Historischer/übernommener Datenstand: Vergleichbarkeit kann eingeschränkt sein.");
    if(!calendar) issues.push("Periode ist kein eindeutiges Kalenderjahr; Vorjahresvergleiche werden nur periodenbezogen durchgeführt.");
    const meterRoot=dataset&&dataset.zaehlerDaten;
    if(!meterRoot||!array(meterRoot.zaehler).length) issues.push("Vollständige Zählerstammdaten sind in diesem Snapshot nicht vorhanden.");
    const score=Math.max(0,100-issues.length*14-(legacy?5:0)-(!calendar?8:0));
    return {legacy,calendar,issues,score,status:issues.length===0?"vollständig":(score>=70?"eingeschränkt":"unvollständig")};
  }
  function listPeriods(data=requireDeps().stateAccess.current()){
    const candidates=[];
    const currentMeta=data&&data.meta||{};
    if(data&&typeof data==="object"){
      candidates.push({
        periodId:periodKey(currentMeta,currentMeta.abrechnungsjahr,0),
        label:periodDisplayLabel(currentMeta,currentMeta.abrechnungsjahr),
        yearLabel:text(currentMeta.abrechnungsjahr),
        start:isoDate(currentMeta.abrechnungsbeginn), end:isoDate(currentMeta.abrechnungsende),
        source:sourceLabel(currentMeta,null,true), origin:"current", archiveStatus:currentMeta.archiveViewer?"Archivansicht":"Arbeitsstand",
        snapshotStatus:text(currentMeta.snapshotScope||currentMeta.dataLayerRole||"working"),
        finalized:!!currentMeta.currentBillingFinalized,
        dataset:data, meta:currentMeta,
        quality:basePeriodQuality(data,currentMeta,"current"), alternatives:[]
      });
    }
    array(data&&data.jahresArchiv).forEach((item,index)=>{
      const dataset=item&&item.data;
      if(!dataset||typeof dataset!=="object") return;
      const meta=dataset.meta||item.meta||{};
      candidates.push({
        periodId:periodKey(meta,item.year,index+1),
        label:periodDisplayLabel(meta,item.year), yearLabel:text(meta.abrechnungsjahr||item.year),
        start:isoDate(meta.abrechnungsbeginn), end:isoDate(meta.abrechnungsende),
        source:sourceLabel(meta,item,false), origin:"archive", archiveStatus:"Archiv",
        snapshotStatus:text(meta.snapshotScope||meta.dataLayerRole||"billingSnapshot"), finalized:true,
        archivedAt:text(item.archivedAt), dataset, meta,
        quality:basePeriodQuality(dataset,meta,"archive"), alternatives:[]
      });
    });
    // Gleiche periodId wird für Zeitreihen nur einmal gezählt. Ein aktiver Arbeitsstand hat Vorrang;
    // die alternative Archivquelle bleibt als Herkunftsnachweis sichtbar.
    const byId=new Map();
    candidates.forEach(period=>{
      const existing=byId.get(period.periodId);
      if(!existing){ byId.set(period.periodId,period); return; }
      if(existing.origin==="archive"&&period.origin==="current"){
        period.alternatives=[...(existing.alternatives||[]),{origin:existing.origin,source:existing.source,archivedAt:existing.archivedAt||""}];
        byId.set(period.periodId,period);
      } else {
        existing.alternatives.push({origin:period.origin,source:period.source,archivedAt:period.archivedAt||""});
      }
    });
    return Array.from(byId.values()).sort((a,b)=>periodSortValue(a)-periodSortValue(b));
  }
  function stateSignature(data){
    const m=data&&data.meta||{};
    const costs=array(data&&data.kostenarten).map(k=>[k.id,k.gesamtbetrag,k.inNK,k.umlageschluessel,k.ausschlussBehandlung].join(":"));
    const tenants=array(data&&data.mieter).filter(r=>r&&r.id&&r.name).map(t=>[t.id,t.wohnung,t.kaltSoll,t.kaltErhalten,t.nkVoraus,t.vorjahresKorrektur,t.kaltmietKorrektur,t.abrechnungRolle].join(":"));
    const archives=array(data&&data.jahresArchiv).map(a=>[a&&a.year,a&&a.archivedAt,a&&a.meta&&a.meta.periodId,a&&a.data&&a.data.meta&&a.data.meta.periodId,sum(a&&a.data&&a.data.kostenarten,k=>k&&k.gesamtbetrag)].join(":"));
    const rec=data&&data.kostenUmlagenAbgleich||{};
    return [text(m.lastSavedAt),text(m.exportedAt),text(m.migratedWithAppVersion),text(data&&data.zaehlerDaten&&data.zaehlerDaten.updatedAt),text(data&&data.abrechnungsPruefungen&&data.abrechnungsPruefungen.updatedAt),text(rec.updatedAt),costs.join("|"),tenants.join("|"),archives.join("|")].join("#");
  }
  function safeCalculate(dataset){
    try { return requireDeps().calculateDataset(dataset)||{calculation:{costResults:[],tenantResults:[]},totals:{}}; }
    catch(error){ return {calculation:{costResults:[],tenantResults:[],privateResults:[]},totals:{},error:text(error&&error.message||error)}; }
  }
  function safeQuality(dataset){
    const inspect=requireDeps().inspectDataset;
    if(!inspect) return {results:[],summary:{errors:0,warnings:0,hints:0,open:0}};
    try {
      const report=inspect(dataset)||{};
      const results=array(report.results||report.checks||report.issues);
      let errors=0,warnings=0,hints=0,open=0;
      results.forEach(row=>{
        const status=text(row.status||row.level||row.severity).toLocaleLowerCase("de-DE");
        if(status.includes("error")||status.includes("fehler")||status.includes("krit")) errors++;
        else if(status.includes("warn")||status.includes("prüf")||status.includes("decision")||status.includes("offen")) warnings++;
        else if(status.includes("hint")||status.includes("hinweis")) hints++;
        if(!status.includes("done")&&!status.includes("passed")&&!status.includes("bestanden")&&!status.includes("ok")&&!status.includes("confirmed")&&!status.includes("akzept")) open++;
      });
      return {results,summary:{errors,warnings,hints,open}};
    } catch(error){ return {results:[],summary:{errors:0,warnings:0,hints:0,open:0},error:text(error&&error.message||error)}; }
  }
  function reconciliationForPeriod(rootData,period){
    const module=requireDeps().reconciliation;
    if(!module||typeof module.model!=="function"||!/^[0-9]{4}$/.test(period.yearLabel)) return null;
    try {
      const year=Number(period.yearLabel);
      const model=module.model(rootData,{fromYear:year,toYear:year});
      return model&&array(model.years).includes(year)?model:null;
    } catch(error){ return {error:text(error&&error.message||error)}; }
  }
  function tenantUsage(tenant){ return requireDeps().isPrivateUse(tenant)?"private":"rented"; }
  function analysisUnits(dataset){
    const standardized=array(dataset&&dataset.objektStandard&&dataset.objektStandard.einheiten).filter(u=>u&&text(u.id||u.einheitId));
    return standardized.length ? standardized : array(dataset&&dataset.wohnungen).filter(Boolean);
  }
  function unitMap(dataset){ return new Map(analysisUnits(dataset).map(u=>[text(u.id||u.einheitId),u])); }
  function totalArea(dataset){ return sum(analysisUnits(dataset).filter(u=>u&&number(u.wohnflaeche)>0),u=>u.wohnflaeche); }
  function allocationCostRows(period,calcResult){
    const dataset=period.dataset;
    const calc=calcResult.calculation||{};
    const resultById=new Map(array(calc.costResults).map(row=>[text(row&&row.cost&&row.cost.id),row]));
    return array(dataset&&dataset.kostenarten).filter(cost=>cost&&cost.kostenart).map(cost=>{
      const result=resultById.get(text(cost.id))||null;
      const total=number(cost.gesamtbetrag);
      const tenantShare=result?number(result.tenantSum):0;
      const privateShare=result?number(result.privateShare):0;
      const vacancyShare=result?number(result.vacancyShare):0;
      const documentedOwnerShare=result?number(result.documentedOwnerShare):0;
      const ownerShare=result?number(result.ownerShare):0;
      const rentedShare=Math.max(0,tenantShare-privateShare);
      const exclusionHandling=text(cost.ausschlussBehandlung);
      const intentionallyNonAllocable=exclusionHandling==="Nicht umlagefähig / Eigentümeranteil";
      const trueNonAllocable=intentionallyNonAllocable?Math.max(0,ownerShare-vacancyShare):0;
      const actualUnallocated=intentionallyNonAllocable?0:Math.max(0,ownerShare-vacancyShare);
      const active=cost.inNK==="Ja";
      return {
        periodId:period.periodId,periodLabel:period.label,costId:text(cost.id),costName:text(cost.kostenart),area:text(cost.bereich),
        active,allocationKey:text(cost.umlageschluessel),calculationType:text(cost.berechnungsart),status:text(cost.status),
        total,tenantShare,rentedShare,privateShare,vacancyShare,documentedOwnerShare,ownerShare,trueNonAllocable,actualUnallocated,
        pricePerUnit:hasNumber(cost.preisProEinheit)?number(cost.preisProEinheit):null,
        consumptionTotal:hasNumber(cost.gesamtverbrauch)?number(cost.gesamtverbrauch):null,
        source:text(cost.bemerkung),exclusionHandling,
        // Schlanke READ-ONLY-Klassifikation für die drei Analyseperspektiven. Sie ersetzt
        // keine produktiven Kostenfelder und trifft bewusst keine Steuer-/Cashflowannahmen.
        classification:{objectCost:true,nkRelevant:active,taxRelevant:null,cashRelevant:false,costCategory:text(cost.bereich)||"Nicht klassifiziert",paymentDate:null,servicePeriod:period.periodId},
        calculationStatus:result?text(result.status):"Nicht berechnet", result
      };
    });
  }
  function tenantRows(period,calcResult){
    const units=unitMap(period.dataset);
    const results=array(calcResult&&calcResult.calculation&&calcResult.calculation.tenantResults);
    return results.map(row=>{
      const t=row.tenant||{}; const unit=units.get(text(t.wohnung))||{};
      return {
        periodId:period.periodId,periodLabel:period.label,tenantId:text(t.id),name:text(t.name),unitId:text(t.wohnung),unitName:text(unit.bezeichnung||unit.lage||t.wohnung),
        usage:tenantUsage(t),usageLabel:requireDeps().isPrivateUse(t)?text(t.abrechnungRolle||"Privatanteil"):text(t.abrechnungRolle||"Mieter"),
        start:text(t.einzug),end:text(t.auszug),activeDays:number(t.aktiveTage),area:number(t.wohnflaeche||unit.wohnflaeche),persons:number(t.personen),
        costShare:number(row.costShare),prepayments:number(row.prepayments),correction:number(row.correction),rentCorrection:number(row.rentCorrection),balance:number(row.balance),
        coldRentTarget:number(t.kaltSoll),coldRentReceived:number(t.kaltErhalten),declaredIncome:number(t.einnahmen),note:text(t.bemerkung)
      };
    });
  }
  function waterHistoryForPeriod(rootData,period){
    const history=(period.dataset&&period.dataset.waterMeterHistory)||rootData&&rootData.waterMeterHistory;
    if(!history||!period.quality.calendar||!/^[0-9]{4}$/.test(period.yearLabel)) return {available:false,total:null,cold:null,warm:null,units:[],source:text(history&&history.source),reason:"Für diese Periode ist aus der historischen Wasserreihe keine fachlich eindeutige Jahreszuordnung ableitbar."};
    const year=Number(period.yearLabel);
    const units=array(history.units).map(unit=>{
      const delta=array(unit.deltas).find(row=>Number(row&&row.jahr)===year);
      return delta?{unitId:text(unit.wohnung),unitName:text(unit.bezeichnung||unit.wohnung),cold:number(delta.kw),warm:number(delta.ww),total:number(delta.gesamt),year}:null;
    }).filter(Boolean);
    const total=sum(units,u=>u.total),cold=sum(units,u=>u.cold),warm=sum(units,u=>u.warm);
    const houseSetting=period.dataset&&period.dataset.waterMeters&&period.dataset.waterMeters.settings;
    const houseTotal=hasNumber(houseSetting&&houseSetting.houseWaterTotal)&&number(houseSetting.houseWaterTotal)>0?number(houseSetting.houseWaterTotal):null;
    const houseDifference=houseTotal!==null&&units.length?houseTotal-total:null;
    return {available:units.length>0,total:units.length?round(total,3):null,cold:units.length?round(cold,3):null,warm:units.length?round(warm,3):null,units,source:text(history.source),reason:units.length?"":"Keine Jahreswerte vorhanden.",houseTotal,houseDifference,houseDifferencePercent:houseDifference!==null&&houseTotal?houseDifference/houseTotal*100:null};
  }
  function unitRows(period,tenants,water){
    const periodDays=daysBetween(period.start,period.end);
    const waterByUnit=new Map(array(water&&water.units).map(row=>[text(row.unitId),row]));
    const vacancyEvidence=new Set();
    Object.values(period.dataset&&period.dataset.umlageInputs||{}).forEach(input=>Object.keys(input&&input.caseValues||{}).forEach(key=>{const m=/^vacancy:([^:]+):/.exec(key);if(m)vacancyEvidence.add(m[1]);}));
    const overlapDays=row=>{
      if(!periodDays||!isoDate(row.start))return null;
      const start=row.start>period.start?row.start:period.start;const rawEnd=isoDate(row.end)?row.end:period.end;const end=rawEnd<period.end?rawEnd:period.end;
      return daysBetween(start,end);
    };
    return analysisUnits(period.dataset).map(unit=>{
      const unitId=text(unit.id||unit.einheitId); const unitTenants=array(tenants).filter(row=>row.unitId===unitId);
      const dateDays=unitTenants.map(overlapDays).filter(v=>v!==null);
      const occupiedDays=periodDays&&unitTenants.length&&dateDays.length===unitTenants.length?Math.min(periodDays,sum(dateDays)):null;
      // Vollperioden-Leerstand wird nur bei vorhandener Leerstandsbelegposition angenommen;
      // sonst bleibt die Tageskennzahl offen statt aus einem fehlenden Teilnehmer erfunden zu werden.
      const vacancyDays=occupiedDays!==null?Math.max(0,periodDays-occupiedDays):(!unitTenants.length&&periodDays&&vacancyEvidence.has(unitId)?periodDays:null);
      const w=waterByUnit.get(unitId)||null;
      const costShare=sum(unitTenants,row=>row.costShare),prepayments=sum(unitTenants,row=>row.prepayments),balance=sum(unitTenants,row=>row.balance);
      const area=number(unit.wohnflaeche||unit.verteilungsgrundlagen&&unit.verteilungsgrundlagen.wohnflaeche);
      return {periodId:period.periodId,periodLabel:period.label,unitId,unitName:text(unit.bezeichnung||unit.lage||unitId),area,status:text(unit.status),
        participants:unitTenants.map(row=>({tenantId:row.tenantId,name:row.name,usage:row.usage,usageLabel:row.usageLabel,start:row.start,end:row.end})),
        participantCost:costShare,prepayments,balance,costPerSqm:area?costShare/area:null,periodDays,occupiedDays,vacancyDays,
        waterAvailable:!!w,coldWater:w?w.cold:null,warmWater:w?w.warm:null,water:w?w.total:null,
        occupancyStatus:vacancyDays===null?"Datenbasis für Leerstandstage unvollständig":(vacancyDays>0?"Leerstand ableitbar":"voll belegt laut Teilnehmerzeiten")};
    });
  }
  function meterQuality(period){
    const root=period.dataset&&period.dataset.zaehlerDaten;
    const meters=array(root&&root.zaehler), readings=array(root&&root.messwerte), periods=array(root&&root.messperioden), replacements=array(root&&root.zaehlerwechsel), assignments=array(root&&root.zuordnungen);
    const invalidPeriods=periods.filter(row=>text(row&&row.status).toLocaleLowerCase("de-DE").includes("invalid")||text(row&&row.status).toLocaleLowerCase("de-DE").includes("fehler"));
    const missingValues=readings.filter(row=>!hasNumber(row&&row.wert));
    return {available:meters.length>0,meters:meters.length,readings:readings.length,measurementPeriods:periods.length,assignments:assignments.length,replacements:replacements.length,missingValues:missingValues.length,invalidPeriods:invalidPeriods.length};
  }
  function financialRows(period,costRows,tenants,rootData){
    const dataset=period.dataset;
    const rentTarget=sum(tenants,t=>t.coldRentTarget);
    const rentReceived=sum(tenants,t=>t.coldRentReceived);
    const nkPrepayments=sum(tenants,t=>t.prepayments);
    const declaredIncome=sum(tenants,t=>t.declaredIncome);
    const actualCosts=sum(costRows.filter(r=>r.active),r=>r.total) + sum(costRows.filter(r=>!r.active && Math.abs(r.total)>0),r=>r.total);
    const objectIncome=rentReceived+nkPrepayments;
    const operatingResult=objectIncome-actualCosts;
    const rec=rootData&&rootData.kostenUmlagenAbgleich||{};
    const paymentRows=array(rec.payments).filter(row=>/^[0-9]{4}$/.test(period.yearLabel)&&Number(row.paymentYear)===Number(period.yearLabel)&&isoDate(row.paymentDate));
    const datedIncome=sum(paymentRows,row=>row.amount);
    const datedExpenseRows=[]; // Das bestehende Modell besitzt keine vollständige, datierte Ausgabenseite.
    const cashflowComplete=paymentRows.length>0&&datedExpenseRows.length>0;
    return {
      rentTarget, rentReceived, nkPrepayments, declaredIncome, objectIncome, actualCosts, operatingResult,
      rentShortfall:Math.max(0,rentTarget-rentReceived),
      datedPayments:paymentRows,datedIncome,cashflowComplete,cashflow:cashflowComplete?datedIncome-sum(datedExpenseRows,r=>r.amount):null,
      cashflowReason:cashflowComplete?"":"Cashflow nicht berechenbar: Es fehlen vollständig datierte Ein- und Auszahlungen. Sollwerte werden nicht als Zahlungsfluss interpretiert."
    };
  }
  function taxRows(period,costRows){
    return costRows.filter(r=>Math.abs(r.total)>0||r.active).map(row=>{
      const knownSplit=!!row.result;
      const other=knownSplit?Math.max(0,row.total-row.rentedShare-row.privateShare-row.vacancyShare):row.total;
      return {
        periodId:period.periodId,periodLabel:period.label,costId:row.costId,costName:row.costName,total:row.total,
        rented:knownSplit?row.rentedShare:null,private:knownSplit?row.privateShare:null,vacancy:knownSplit?row.vacancyShare:null,other,
        allocationKey:row.allocationKey,usageRule:knownSplit?"Abgeleitet aus regulärer Abrechnungsteilnehmer-/Leerstandsverteilung":"Keine belastbare Aufteilung vorhanden",
        taxValue:null,taxStatus:"noch nicht steuerlich klassifiziert",source:row.source||row.calculationStatus
      };
    });
  }
  function periodModel(rootData,period){
    const calculation=safeCalculate(period.dataset);
    const totals=calculation.totals||{};
    const costs=allocationCostRows(period,calculation);
    const tenants=tenantRows(period,calculation);
    const water=waterHistoryForPeriod(rootData,period);
    const quality=safeQuality(period.dataset);
    const meter=meterQuality(period);
    const rec=reconciliationForPeriod(rootData,period);
    const totalCosts=hasNumber(totals.totalCosts)?number(totals.totalCosts):sum(costs.filter(c=>c.active),c=>c.total);
    const participantShare=hasNumber(totals.billableShare)?number(totals.billableShare):sum(tenants,t=>t.costShare);
    const privateShare=hasNumber(totals.privateShare)?number(totals.privateShare):sum(tenants.filter(t=>t.usage==="private"),t=>t.costShare);
    const vacancyShare=hasNumber(totals.vacancyShare)?number(totals.vacancyShare):sum(costs,c=>c.vacancyShare);
    const ownerShare=hasNumber(totals.ownerShare)?number(totals.ownerShare):sum(costs,c=>c.ownerShare);
    const documentedOwnerShare=hasNumber(totals.documentedOwnerShare)?number(totals.documentedOwnerShare):sum(costs,c=>c.documentedOwnerShare);
    const trueNonAllocable=sum(costs,c=>c.trueNonAllocable);
    const unallocatedAllocable=sum(costs,c=>c.actualUnallocated);
    const prepayments=hasNumber(totals.prepayments)?number(totals.prepayments):sum(tenants,t=>t.prepayments);
    const positiveBalance=sum(tenants.filter(t=>t.balance>0),t=>t.balance);
    const negativeBalance=Math.abs(sum(tenants.filter(t=>t.balance<0),t=>t.balance));
    const totalAreaValue=totalArea(period.dataset);
    const waterCost=costs.find(c=>c.costId==="K002"||/wasser/i.test(c.costName)&&/versorgung|wasser/i.test(c.costName));
    const waterPrice=waterCost && waterCost.pricePerUnit!==null ? waterCost.pricePerUnit : (water.available&&water.total>0&&waterCost?waterCost.total/water.total:null);
    const units=unitRows(period,tenants,water);
    const vacancyDays=sum(units.filter(u=>u.vacancyDays!==null),u=>u.vacancyDays);
    const vacancyDaysComplete=units.length>0&&units.every(u=>u.vacancyDays!==null);
    const financial=financialRows(period,costs,tenants,rootData);
    const tax=taxRows(period,costs);
    const model={
      period:Object.assign({},period,{dataset:undefined,meta:undefined}),calculationError:calculation.error||"",qualityError:quality.error||"",
      totals:{totalCosts,participantShare,privateShare,vacancyShare,ownerShare,documentedOwnerShare,trueNonAllocable,unallocatedAllocable,prepayments,positiveBalance,negativeBalance,costPerSqm:totalAreaValue?totalCosts/totalAreaValue:null,totalArea:totalAreaValue,allocationDelta:number(totals.allocationDelta),vacancyDays:vacancyDaysComplete?vacancyDays:null,vacancyCostPerDay:vacancyDaysComplete&&vacancyDays>0?vacancyShare/vacancyDays:null},
      costs,tenants,units,water,waterPrice,meter,quality,financial,tax,reconciliation:rec
    };
    return model;
  }
  function compareCosts(a,b){
    const am=new Map(array(a&&a.costs).map(r=>[r.costId,r])); const bm=new Map(array(b&&b.costs).map(r=>[r.costId,r]));
    const keys=unique([...am.keys(),...bm.keys()]);
    return keys.map(key=>{
      const before=am.get(key),after=bm.get(key); const av=before?before.total:0,bv=after?after.total:0; const delta=bv-av;
      return {costId:key,costName:text((after||before||{}).costName),before:av,after:bv,delta,percent:Math.abs(av)>0.000001?delta/Math.abs(av)*100:null,newCost:!before&&!!after,removedCost:!!before&&!after,allocationChanged:!!(before&&after&&before.allocationKey!==after.allocationKey),beforeAllocation:before&&before.allocationKey||"",afterAllocation:after&&after.allocationKey||""};
    });
  }
  function comparison(a,b){
    if(!a||!b) return null;
    const costs=compareCosts(a,b);
    const beforeTenant=new Map(array(a.tenants).map(t=>[t.tenantId,t])); const afterTenant=new Map(array(b.tenants).map(t=>[t.tenantId,t]));
    const tenantChanges=unique([...beforeTenant.keys(),...afterTenant.keys()]).map(id=>{
      const before=beforeTenant.get(id),after=afterTenant.get(id);
      return {tenantId:id,name:text((after||before||{}).name),unitId:text((after||before||{}).unitId),newParticipant:!before&&!!after,removedParticipant:!!before&&!after,balanceDelta:number(after&&after.balance)-number(before&&before.balance),prepaymentDelta:number(after&&after.prepayments)-number(before&&before.prepayments)};
    });
    const waterDelta=a.water.available&&b.water.available?number(b.water.total)-number(a.water.total):null;
    const waterPercent=waterDelta!==null&&number(a.water.total)?waterDelta/number(a.water.total)*100:null;
    const waterBefore=a.costs.find(r=>r.costId==="K002"||/wasserversorgung/i.test(r.costName));
    const waterAfter=b.costs.find(r=>r.costId==="K002"||/wasserversorgung/i.test(r.costName));
    let waterEffects=null;
    if(a.water.available&&b.water.available&&a.waterPrice!==null&&b.waterPrice!==null&&waterBefore&&waterAfter){
      const consumptionEffect=(number(b.water.total)-number(a.water.total))*number(a.waterPrice);
      const priceEffect=number(b.water.total)*(number(b.waterPrice)-number(a.waterPrice));
      const costDelta=number(waterAfter.total)-number(waterBefore.total);
      waterEffects={costDelta,consumptionEffect,priceEffect,otherEffect:costDelta-consumptionEffect-priceEffect,method:"Preis-/Verbrauchszerlegung aus vorhandenen Gesamtverbräuchen und Preisen; Rest als sonstiger Verteil-/Struktureffekt."};
    }
    return {
      from:a.period,to:b.period,costs,tenantChanges,
      totalCostDelta:b.totals.totalCosts-a.totals.totalCosts,totalCostPercent:a.totals.totalCosts?((b.totals.totalCosts-a.totals.totalCosts)/Math.abs(a.totals.totalCosts))*100:null,
      waterDelta,waterPercent,waterPriceDelta:(a.waterPrice!==null&&b.waterPrice!==null)?b.waterPrice-a.waterPrice:null,waterEffects,
      largestIncreases:costs.filter(r=>r.delta>0).sort((x,y)=>y.delta-x.delta).slice(0,5),
      largestDecreases:costs.filter(r=>r.delta<0).sort((x,y)=>x.delta-y.delta).slice(0,5),
      newCosts:costs.filter(r=>r.newCost),removedCosts:costs.filter(r=>r.removedCost),allocationChanges:costs.filter(r=>r.allocationChanged)
    };
  }
  function anomalies(models){
    const out=[];
    for(let i=1;i<models.length;i++){
      const prev=models[i-1],cur=models[i],cmp=comparison(prev,cur);
      cmp.costs.forEach(row=>{
        if(row.newCost&&Math.abs(row.after)>0.01) out.push({type:"new-cost",severity:"info",periodId:cur.period.periodId,label:"Neue Kostenart: "+row.costName,value:row.after,detail:"In der Vergleichsperiode war diese Kostenart nicht vorhanden.",key:row.costId});
        if(row.removedCost&&Math.abs(row.before)>0.01) out.push({type:"removed-cost",severity:"info",periodId:cur.period.periodId,label:"Weggefallene Kostenart: "+row.costName,value:row.before,detail:"In der aktuellen Periode ist diese Kostenart nicht mehr vorhanden.",key:row.costId});
        if(row.percent!==null&&Math.abs(row.percent)>=20&&Math.abs(row.delta)>=50) out.push({type:"cost-change",severity:"notice",periodId:cur.period.periodId,label:row.costName+" "+(row.percent>=0?"+":"")+round(row.percent,1)+" %",value:row.delta,detail:"Auffällige Kostenveränderung gegenüber "+prev.period.label+". Auffälligkeit ist nicht automatisch ein Fehler.",key:row.costId});
        if(row.allocationChanged) out.push({type:"allocation-change",severity:"notice",periodId:cur.period.periodId,label:"Geänderter Umlageschlüssel: "+row.costName,value:null,detail:row.beforeAllocation+" → "+row.afterAllocation,key:row.costId});
      });
      if(cmp.waterPercent!==null&&Math.abs(cmp.waterPercent)>=20) out.push({type:"water-change",severity:"notice",periodId:cur.period.periodId,label:"Wasserverbrauch "+(cmp.waterPercent>=0?"+":"")+round(cmp.waterPercent,1)+" %",value:cmp.waterDelta,detail:"Gesamtverbrauch gegenüber "+prev.period.label+" verändert.",key:"water"});
      if(prev.waterPrice!==null&&cur.waterPrice!==null&&prev.waterPrice&&Math.abs((cur.waterPrice-prev.waterPrice)/prev.waterPrice*100)>=15){
        const pct=(cur.waterPrice-prev.waterPrice)/prev.waterPrice*100;
        out.push({type:"price-change",severity:"notice",periodId:cur.period.periodId,label:"Wasserpreis "+(pct>=0?"+":"")+round(pct,1)+" %",value:cur.waterPrice-prev.waterPrice,detail:"Preis je Verbrauchseinheit gegenüber "+prev.period.label+" verändert.",key:"water-price"});
      }
    }
    models.forEach(model=>{
      if(model.period.quality.legacy) out.push({type:"legacy",severity:"data",periodId:model.period.periodId,label:"Historischer Legacy-Stand",value:null,detail:"Vergleichbarkeit dieser Periode ist als eingeschränkt gekennzeichnet.",key:model.period.periodId});
      if(model.meter.available&&(model.meter.missingValues||model.meter.invalidPeriods)) out.push({type:"meter-quality",severity:"notice",periodId:model.period.periodId,label:"Zählerdaten prüfen",value:model.meter.missingValues+model.meter.invalidPeriods,detail:"Fehlende Messwerte oder problematische Messperioden vorhanden.",key:"meters"});
    });
    return out;
  }
  function build(data=requireDeps().stateAccess.current(),options={}){
    const signature=stateSignature(data);
    const cacheKey=signature+"|"+JSON.stringify({periodIds:options.periodIds||[]});
    if(cache.has(cacheKey)) return cache.get(cacheKey);
    const periods=listPeriods(data);
    const selectedIds=array(options.periodIds).map(text).filter(Boolean);
    const selected=selectedIds.length?periods.filter(p=>selectedIds.includes(p.periodId)):periods;
    const models=selected.map(period=>periodModel(data,period));
    const comps=[]; for(let i=1;i<models.length;i++) comps.push(comparison(models[i-1],models[i]));
    const result=Object.freeze({
      version:VERSION,appVersion:requireDeps().appVersion,periods:Object.freeze(periods.map(p=>Object.assign({},p,{dataset:undefined,meta:undefined}))),
      models:Object.freeze(models),comparisons:Object.freeze(comps),anomalies:Object.freeze(anomalies(models)),signature
    });
    cache.set(cacheKey,result); while(cache.size>CACHE_LIMIT) cache.delete(cache.keys().next().value);
    return result;
  }
  function invalidate(){ cache.clear(); }
  function describe(){ return Object.freeze({configured:!!deps,version:VERSION,cacheEntries:cache.size,readOnly:true}); }

  global.NKProAnalyticsEngine=Object.freeze({VERSION,configure,describe,listPeriods,build,comparison,compareCosts,invalidate});
})(globalThis);
