(function(global){
  "use strict";

  const VERSION=2;
  const CACHE_LIMIT=8;
  let deps=null;
  const cache=new Map();

  function configure(options={}){
    if(deps)return describe();
    if(!options.stateAccess||typeof options.stateAccess.current!=="function")throw new Error("Analyseengine benötigt NKProStateAccess.");
    if(typeof options.calculateDataset!=="function")throw new Error("Analyseengine benötigt die bestehende Abrechnungsberechnung für isolierte Datensätze.");
    deps=Object.freeze({
      stateAccess:options.stateAccess,
      rootState:typeof options.rootState==="function"?options.rootState:null,
      calculateDataset:options.calculateDataset,
      inspectDataset:typeof options.inspectDataset==="function"?options.inspectDataset:null,
      isPrivateUse:typeof options.isPrivateUse==="function"?options.isPrivateUse:(()=>false),
      isSettlementParticipant:typeof options.isSettlementParticipant==="function"?options.isSettlementParticipant:(record=>!!record),
      reconciliation:options.reconciliation||null,
      appVersion:String(options.appVersion||"")
    });
    return describe();
  }
  function requireDeps(){if(!deps)throw new Error("Analyseengine wurde noch nicht konfiguriert.");return deps;}
  function canonicalRoot(){const d=requireDeps();return d.rootState?d.rootState():d.stateAccess.current();}
  function currentPeriodAvailable(meta={}){return !(meta.archiveViewer||meta.currentBillingArchivedOnly||meta.currentBillingClosedAfterArchive);}
  function text(v){return String(v===undefined||v===null?"":v).trim();}
  function array(v){return Array.isArray(v)?v:[];}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function parseNumber(v){
    if(v===null||v===undefined||v==="")return null;
    if(typeof v==="number")return Number.isFinite(v)?v:null;
    const raw=String(v).trim();if(!raw)return null;
    const n=Number(raw.replace(/\s/g,"").replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",","."));
    return Number.isFinite(n)?n:null;
  }
  function number(v){const n=parseNumber(v);return n===null?0:n;}
  function hasNumber(v){return parseNumber(v)!==null;}
  function numberState(v){const n=parseNumber(v);return n===null?{state:"missing",value:null}:{state:"available",value:n};}
  function round(v,digits=2){const n=parseNumber(v);if(n===null)return null;const f=10**digits;return Math.round((n+Number.EPSILON)*f)/f;}
  function sum(rows,fn){return array(rows).reduce((s,row)=>s+number(fn?fn(row):row),0);}
  function unique(values){return Array.from(new Set(array(values).filter(v=>v!==""&&v!==null&&v!==undefined)));}
  function isoDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(text(value))?text(value):"";}
  function daysBetween(start,end){if(!isoDate(start)||!isoDate(end))return 0;const a=Date.parse(start+"T00:00:00Z"),b=Date.parse(end+"T00:00:00Z");return Number.isFinite(a)&&Number.isFinite(b)&&b>=a?Math.floor((b-a)/86400000)+1:0;}
  function isCalendarPeriod(start,end,label){if(!isoDate(start)||!isoDate(end))return false;const y=start.slice(0,4);return start===y+"-01-01"&&end===y+"-12-31"&&(!label||/^\d{4}$/.test(text(label))||text(label)===y);}
  function periodDisplayLabel(meta={},fallback=""){const label=text(meta.abrechnungsjahr||fallback);if(label)return label;const start=isoDate(meta.abrechnungsbeginn),end=isoDate(meta.abrechnungsende);return start&&end?start+" – "+end:"Unbenannte Periode";}
  function periodKey(meta={},fallback="",index=0){return text(meta.periodId)||[periodDisplayLabel(meta,fallback),isoDate(meta.abrechnungsbeginn),isoDate(meta.abrechnungsende),index].join("|");}
  function sourceLabel(meta={},archiveItem=null,isCurrent=false){if(isCurrent)return text(meta.datenquelle||"Aktueller Arbeitsstand")||"Aktueller Arbeitsstand";return text(meta.datenquelle||meta.legacyQuelle||(archiveItem&&archiveItem.source)||"Archiv")||"Archiv";}
  function periodSortValue(period){const start=Date.parse((period.start||"0000-01-01")+"T00:00:00Z"),end=Date.parse((period.end||"0000-01-01")+"T00:00:00Z");return (Number.isFinite(start)?start:0)+(Number.isFinite(end)?end:0)/1e6;}

  function basePeriodQuality(dataset,meta,origin){
    const issues=[];
    const legacy=!!text(meta.legacyArchivHinweis)||!!text(meta.legacyQuelle)||/^legacy/i.test(text(meta.periodId))||/übernommen|importiert/i.test(text(meta.datenquelle));
    const start=isoDate(meta.abrechnungsbeginn),end=isoDate(meta.abrechnungsende),calendar=isCalendarPeriod(start,end,meta.abrechnungsjahr),lengthDays=daysBetween(start,end);
    const costRows=array(dataset&&dataset.kostenarten).filter(k=>k&&k.kostenart),participantRows=array(dataset&&dataset.mieter).filter(m=>m&&m.id&&m.name&&m.wohnung);
    const costValues=costRows.filter(k=>k.inNK==="Ja").map(k=>numberState(k.gesamtbetrag));
    const missingCostValues=costValues.filter(v=>v.state!=="available").length;
    if(!start||!end)issues.push("Periodengrenzen fehlen oder sind ungültig.");
    if(!costRows.length)issues.push("Keine Kostenarten vorhanden.");
    if(!participantRows.length)issues.push("Keine vollständigen Teilnehmerdaten vorhanden.");
    if(missingCostValues)issues.push(missingCostValues+" aktive Kostenposition(en) ohne numerischen Wert.");
    if(legacy)issues.push("Historischer/übernommener Datenstand: Vergleichbarkeit kann eingeschränkt sein.");
    if(!calendar)issues.push("Periode ist kein eindeutiges Kalenderjahr; Vergleiche werden periodenbezogen bewertet.");
    const working=origin==="current"&&!meta.currentBillingFinalized;
    const reopened=origin==="current"&&!!meta.reopenedFromArchiveAt;
    if(working)issues.push("Aktueller Arbeitsstand ist nicht als finalisierte Abrechnung gekennzeichnet.");
    const complete=!!(start&&end&&costRows.length&&participantRows.length&&!missingCostValues);
    let comparability="vergleichbar";
    if(!complete)comparability="nicht vergleichbar";
    else if(legacy||!calendar||working||reopened)comparability="eingeschränkt vergleichbar";
    const completion={state:complete?(working?"working":"complete"):"incomplete",label:complete?(working?"laufende/nicht finalisierte Periode":"vollständige Datenbasis"):"unvollständige Datenbasis"};
    return {legacy,calendar,lengthDays,issues,missingCostValues,complete,working,reopened,completion,comparability,status:comparability,coverage:complete?"vollständig":"unvollständig"};
  }
  function listPeriods(data=canonicalRoot()){
    const candidates=[],currentMeta=data&&data.meta||{};
    if(data&&typeof data==="object"&&currentPeriodAvailable(currentMeta)){
      candidates.push({periodId:periodKey(currentMeta,currentMeta.abrechnungsjahr,0),label:periodDisplayLabel(currentMeta,currentMeta.abrechnungsjahr),yearLabel:text(currentMeta.abrechnungsjahr),start:isoDate(currentMeta.abrechnungsbeginn),end:isoDate(currentMeta.abrechnungsende),source:sourceLabel(currentMeta,null,true),origin:"current",archiveStatus:currentMeta.archiveViewer?"Archivansicht":"Arbeitsstand",snapshotStatus:text(currentMeta.snapshotScope||currentMeta.dataLayerRole||"working"),finalized:!!currentMeta.currentBillingFinalized,dataset:data,meta:currentMeta,quality:basePeriodQuality(data,currentMeta,"current"),alternatives:[]});
    }
    array(data&&data.jahresArchiv).forEach((item,index)=>{
      const dataset=item&&item.data;if(!dataset||typeof dataset!=="object")return;const meta=dataset.meta||item.meta||{};
      candidates.push({periodId:periodKey(meta,item.year,index+1),label:periodDisplayLabel(meta,item.year),yearLabel:text(meta.abrechnungsjahr||item.year),start:isoDate(meta.abrechnungsbeginn),end:isoDate(meta.abrechnungsende),source:sourceLabel(meta,item,false),origin:"archive",archiveStatus:"Archiv",snapshotStatus:text(meta.snapshotScope||meta.dataLayerRole||"billingSnapshot"),finalized:true,archivedAt:text(item.archivedAt),dataset,meta,quality:basePeriodQuality(dataset,meta,"archive"),alternatives:[]});
    });
    const byId=new Map();
    candidates.forEach(period=>{const existing=byId.get(period.periodId);if(!existing){byId.set(period.periodId,period);return;}if(existing.origin==="archive"&&period.origin==="current"){period.alternatives=[...(existing.alternatives||[]),{origin:existing.origin,source:existing.source,archivedAt:existing.archivedAt||""}];byId.set(period.periodId,period);}else existing.alternatives.push({origin:period.origin,source:period.source,archivedAt:period.archivedAt||""});});
    return Array.from(byId.values()).sort((a,b)=>periodSortValue(a)-periodSortValue(b));
  }
  function stateSignature(data){
    const m=data&&data.meta||{},costs=array(data&&data.kostenarten).map(k=>[k.id,k.gesamtbetrag,k.inNK,k.umlageschluessel,k.ausschlussBehandlung].join(":")),tenants=array(data&&data.mieter).filter(r=>r&&r.id&&r.name).map(t=>[t.id,t.wohnung,t.kaltSoll,t.kaltErhalten,t.nkVoraus,t.vorjahresKorrektur,t.kaltmietKorrektur,t.abrechnungRolle].join(":")),archives=array(data&&data.jahresArchiv).map(a=>[a&&a.year,a&&a.archivedAt,a&&a.meta&&a.meta.periodId,a&&a.data&&a.data.meta&&a.data.meta.periodId,sum(a&&a.data&&a.data.kostenarten,k=>k&&k.gesamtbetrag)].join(":")),rec=data&&data.kostenUmlagenAbgleich||{};
    return [text(m.lastSavedAt),text(m.exportedAt),text(m.migratedWithAppVersion),text(data&&data.zaehlerDaten&&data.zaehlerDaten.updatedAt),text(data&&data.abrechnungsPruefungen&&data.abrechnungsPruefungen.updatedAt),text(rec.updatedAt),costs.join("|"),tenants.join("|"),archives.join("|")].join("#");
  }
  function safeCalculate(dataset){try{return requireDeps().calculateDataset(dataset)||{calculation:{costResults:[],tenantResults:[]},totals:{}};}catch(error){return {calculation:{costResults:[],tenantResults:[],privateResults:[]},totals:{},error:text(error&&error.message||error)};}}
  function safeQuality(dataset){const inspect=requireDeps().inspectDataset;if(!inspect)return {results:[],summary:{errors:0,warnings:0,hints:0,open:0}};try{const report=inspect(dataset)||{},results=array(report.results||report.checks||report.issues);let errors=0,warnings=0,hints=0,open=0;results.forEach(row=>{const status=text(row&&row.status).toLowerCase(),severity=text(row&&row.severity||row&&row.type).toLowerCase();if(/error|kritisch|blocked/.test(severity))errors++;else if(/warn|entscheidung|review/.test(severity))warnings++;else hints++;if(!/done|bestanden|confirmed|erledigt|not applicable|nicht anwendbar/.test(status))open++;});return {results,summary:{errors,warnings,hints,open}};}catch(error){return {results:[],summary:{errors:0,warnings:0,hints:0,open:0},error:text(error&&error.message||error)};}}
  function reconciliationForPeriod(rootData,period){const module=requireDeps().reconciliation;if(!module||typeof module.model!=="function"||!/^[0-9]{4}$/.test(period.yearLabel))return null;try{const year=Number(period.yearLabel),model=module.model(rootData,{fromYear:year,toYear:year});return model&&array(model.years).includes(year)?model:null;}catch(error){return {error:text(error&&error.message||error)};}}
  function tenantUsage(tenant){return requireDeps().isPrivateUse(tenant)?"private":"rented";}

  function masterUnits(rootData){return array(rootData&&rootData.objektStandard&&rootData.objektStandard.einheiten).filter(u=>u&&text(u.id||u.einheitId));}
  function analysisUnits(dataset,rootData){
    const localStandard=array(dataset&&dataset.objektStandard&&dataset.objektStandard.einheiten).filter(u=>u&&text(u.id||u.einheitId));
    const historical=localStandard.length?localStandard:array(dataset&&dataset.wohnungen).filter(u=>u&&text(u.id||u.einheitId));
    const master=masterUnits(rootData);if(!master.length)return historical.map(u=>Object.assign({},u,{historicalWohnflaeche:parseNumber(u.wohnflaeche),areaSource:localStandard.length?"period-standard":"period-legacy"}));
    const hist=new Map(historical.map(u=>[text(u.id||u.einheitId),u]));
    return master.map(m=>{const id=text(m.id||m.einheitId),h=hist.get(id)||{};return Object.assign({},h,m,{id,einheitId:id,historicalWohnflaeche:parseNumber(h.wohnflaeche),areaSource:"current-object-master"});});
  }
  function unitMap(dataset,rootData){return new Map(analysisUnits(dataset,rootData).map(u=>[text(u.id||u.einheitId),u]));}
  function totalArea(dataset,rootData){return sum(analysisUnits(dataset,rootData).filter(u=>number(u.wohnflaeche||u.verteilungsgrundlagen&&u.verteilungsgrundlagen.wohnflaeche)>0),u=>u.wohnflaeche||u.verteilungsgrundlagen&&u.verteilungsgrundlagen.wohnflaeche);}

  function allocationCostRows(period,calcResult){
    const dataset=period.dataset,calc=calcResult.calculation||{},resultById=new Map(array(calc.costResults).map(row=>[text(row&&row.cost&&row.cost.id),row]));
    return array(dataset&&dataset.kostenarten).filter(cost=>cost&&cost.kostenart).map(cost=>{
      const result=resultById.get(text(cost.id))||null,totalState=numberState(cost.gesamtbetrag),total=totalState.value;
      const tenantShare=result?number(result.tenantSum):0,privateShare=result?number(result.privateShare):0,vacancyShare=result?number(result.vacancyShare):0,documentedOwnerShare=result?number(result.documentedOwnerShare):0,ownerShare=result?number(result.ownerShare):0,rentedShare=Math.max(0,tenantShare-privateShare),exclusionHandling=text(cost.ausschlussBehandlung),intentionallyNonAllocable=exclusionHandling==="Nicht umlagefähig / Eigentümeranteil",trueNonAllocable=intentionallyNonAllocable?Math.max(0,ownerShare-vacancyShare):0,actualUnallocated=intentionallyNonAllocable?0:Math.max(0,ownerShare-vacancyShare),active=cost.inNK==="Ja";
      return {periodId:period.periodId,periodLabel:period.label,costId:text(cost.id),costName:text(cost.kostenart),area:text(cost.bereich),active,allocationKey:text(cost.umlageschluessel),calculationType:text(cost.berechnungsart),status:text(cost.status),total,totalState:totalState.state,tenantShare,rentedShare,privateShare,vacancyShare,documentedOwnerShare,ownerShare,trueNonAllocable,actualUnallocated,pricePerUnit:parseNumber(cost.preisProEinheit),consumptionTotal:parseNumber(cost.gesamtverbrauch),source:text(cost.bemerkung),exclusionHandling,classification:{objectCost:true,nkRelevant:active,taxRelevant:null,cashRelevant:false,costCategory:text(cost.bereich)||"Nicht klassifiziert",paymentDate:null,servicePeriod:period.periodId},calculationStatus:result?text(result.status):"Nicht berechnet",result};
    });
  }
  function tenantRows(period,calcResult,rootData){
    const units=unitMap(period.dataset,rootData),results=array(calcResult&&calcResult.calculation&&calcResult.calculation.tenantResults);
    // Die zentrale isolierte Abrechnungsberechnung hat isSettlementParticipant bereits angewandt.
    // Hier wird die Teilnehmerentscheidung nicht erneut gegen einen anderen UI-/Arbeitskontext geprüft.
    return results.map(row=>{const t=row.tenant||{},unit=units.get(text(t.wohnung))||{},usage=tenantUsage(t),area=parseNumber(unit.wohnflaeche||unit.verteilungsgrundlagen&&unit.verteilungsgrundlagen.wohnflaeche||t.wohnflaeche);return {periodId:period.periodId,periodLabel:period.label,tenantId:text(t.id),name:text(t.name),unitId:text(t.wohnung),unitName:text(unit.bezeichnung||unit.lage||t.wohnung),usage,usageLabel:usage==="private"?text(t.abrechnungRolle||"Privatanteil"):text(t.abrechnungRolle||"Mieter"),start:text(t.einzug),end:text(t.auszug),activeDays:number(t.aktiveTage),area,persons:number(t.personen),personDays:number(t.personentage),costShare:number(row.costShare),prepayments:number(row.prepayments),correction:number(row.correction),rentCorrection:number(row.rentCorrection),balance:number(row.balance),coldRentTarget:number(t.kaltSoll),coldRentReceived:number(t.kaltErhalten),declaredIncome:number(t.einnahmen),note:text(t.bemerkung)};});
  }
  function waterHistoryForPeriod(rootData,period){
    const history=(period.dataset&&period.dataset.waterMeterHistory)||rootData&&rootData.waterMeterHistory;
    if(!history||!period.quality.calendar||!/^[0-9]{4}$/.test(period.yearLabel))return {available:false,total:null,cold:null,warm:null,units:[],source:text(history&&history.source),reason:"Für diese Periode ist aus der historischen Wasserreihe keine fachlich eindeutige Jahreszuordnung ableitbar.",coverage:"nicht verfügbar",personDays:null,litersPerPersonDay:null};
    const year=Number(period.yearLabel),units=array(history.units).map(unit=>{const delta=array(unit.deltas).find(row=>Number(row&&row.jahr)===year);return delta?{unitId:text(unit.wohnung),unitName:text(unit.bezeichnung||unit.wohnung),cold:number(delta.kw),warm:number(delta.ww),total:number(delta.gesamt),year}:null;}).filter(Boolean),total=sum(units,u=>u.total),cold=sum(units,u=>u.cold),warm=sum(units,u=>u.warm);
    const houseSetting=period.dataset&&period.dataset.waterMeters&&period.dataset.waterMeters.settings;
    let houseTotal=hasNumber(houseSetting&&houseSetting.houseWaterTotal)&&number(houseSetting.houseWaterTotal)>0?number(houseSetting.houseWaterTotal):null;
    if(houseTotal===null&&history.houseConnection){const d=array(history.houseConnection.deltas).find(row=>Number(row&&row.jahr)===year);if(d&&hasNumber(d.gesamt))houseTotal=number(d.gesamt);}
    const houseDifference=houseTotal!==null&&units.length?houseTotal-total:null;
    const personDays=sum(array(period.dataset&&period.dataset.mieter).filter(t=>t&&t.name&&t.wohnung),t=>t.personentage);
    return {available:units.length>0,total:units.length?round(total,3):null,cold:units.length?round(cold,3):null,warm:units.length?round(warm,3):null,units,source:text(history.source),reason:units.length?"":"Keine Jahreswerte vorhanden.",coverage:units.length?"Jahreswerte aus Wasserhistorie":"nicht verfügbar",houseTotal,houseDifference,houseDifferencePercent:houseDifference!==null&&houseTotal?houseDifference/houseTotal*100:null,personDays:personDays||null,litersPerPersonDay:personDays&&units.length?total*1000/personDays:null};
  }
  function unitRows(period,tenants,water,rootData){
    const periodDays=daysBetween(period.start,period.end),waterByUnit=new Map(array(water&&water.units).map(row=>[text(row.unitId),row])),vacancyEvidence=new Set();
    Object.values(period.dataset&&period.dataset.umlageInputs||{}).forEach(input=>Object.keys(input&&input.caseValues||{}).forEach(key=>{const m=/^vacancy:([^:]+):/.exec(key);if(m)vacancyEvidence.add(m[1]);}));
    const overlapDays=row=>{if(!periodDays||!isoDate(row.start))return null;const start=row.start>period.start?row.start:period.start,rawEnd=isoDate(row.end)?row.end:period.end,end=rawEnd<period.end?rawEnd:period.end;return daysBetween(start,end);};
    return analysisUnits(period.dataset,rootData).map(unit=>{const unitId=text(unit.id||unit.einheitId),unitTenants=array(tenants).filter(row=>row.unitId===unitId),dateDays=unitTenants.map(overlapDays).filter(v=>v!==null),occupiedDays=periodDays&&unitTenants.length&&dateDays.length===unitTenants.length?Math.min(periodDays,sum(dateDays)):null,vacancyDays=occupiedDays!==null?Math.max(0,periodDays-occupiedDays):(!unitTenants.length&&periodDays&&vacancyEvidence.has(unitId)?periodDays:null),w=waterByUnit.get(unitId)||null,costShare=sum(unitTenants,row=>row.costShare),prepayments=sum(unitTenants,row=>row.prepayments),balance=sum(unitTenants,row=>row.balance),area=number(unit.wohnflaeche||unit.verteilungsgrundlagen&&unit.verteilungsgrundlagen.wohnflaeche),historicalArea=parseNumber(unit.historicalWohnflaeche);return {periodId:period.periodId,periodLabel:period.label,unitId,unitName:text(unit.bezeichnung||unit.lage||unitId),area,historicalArea,areaSource:text(unit.areaSource||"period"),status:text(unit.status),participants:unitTenants.map(row=>({tenantId:row.tenantId,name:row.name,usage:row.usage,usageLabel:row.usageLabel,start:row.start,end:row.end})),participantCost:costShare,prepayments,balance,costPerSqm:area?costShare/area:null,periodDays,occupiedDays,vacancyDays,waterAvailable:!!w,coldWater:w?w.cold:null,warmWater:w?w.warm:null,water:w?w.total:null,waterPerSqm:area&&w?w.total/area:null,occupancyStatus:vacancyDays===null?"Datenbasis für Leerstandstage unvollständig":(vacancyDays>0?"Leerstand ableitbar":"voll belegt laut Teilnehmerzeiten")};});
  }
  function meterQuality(period,rootData){
    const root=(period.dataset&&period.dataset.zaehlerDaten)||(rootData&&rootData.zaehlerDaten),meters=array(root&&root.zaehler),allReadings=array(root&&root.messwerte),allPeriods=array(root&&root.messperioden),assignments=array(root&&root.zuordnungen),replacements=array(root&&root.zaehlerwechsel);
    const overlaps=row=>{const s=isoDate(row&&row.von||row&&row.startDatum||row&&row.start),e=isoDate(row&&row.bis||row&&row.endDatum||row&&row.end);if(!period.start||!period.end||(!s&&!e))return true;return (!s||s<=period.end)&&(!e||e>=period.start);};
    const periods=allPeriods.filter(overlaps),meterIds=new Set(periods.map(p=>text(p.zaehlerId||p.meterId)).filter(Boolean)),readings=allReadings.filter(r=>!meterIds.size||meterIds.has(text(r.zaehlerId||r.meterId))),invalidPeriods=periods.filter(row=>/invalid|fehler/i.test(text(row&&row.status))),missingValues=readings.filter(row=>!hasNumber(row&&row.wert));
    return {available:meters.length>0,meters:meters.length,readings:readings.length,measurementPeriods:periods.length,assignments:assignments.length,replacements:replacements.length,missingValues:missingValues.length,invalidPeriods:invalidPeriods.length,source:period.dataset&&period.dataset.zaehlerDaten?"Perioden-Snapshot":"kanonischer Zählerbestand"};
  }
  function financialRows(period,costRows,tenants,rootData){
    const rented=tenants.filter(t=>t.usage==="rented"),rentTarget=sum(rented,t=>t.coldRentTarget),rentReceived=sum(rented,t=>t.coldRentReceived),nkPrepayments=sum(rented,t=>t.prepayments),declaredIncome=sum(rented,t=>t.declaredIncome);
    const operatingRows=costRows.filter(r=>r.total!==null&&!/finanzierung|zinsen|modernisierung|anschaffung|ersatzbeschaffung/i.test((r.area||"")+" "+(r.costName||""))),financingRows=costRows.filter(r=>r.total!==null&&/finanzierung|zinsen/i.test((r.area||"")+" "+r.costName)),investmentRows=costRows.filter(r=>r.total!==null&&/modernisierung|anschaffung|ersatzbeschaffung/i.test((r.area||"")+" "+r.costName));
    const operatingCosts=sum(operatingRows,r=>r.total),financing=sum(financingRows,r=>r.total),investments=sum(investmentRows,r=>r.total),otherIncome=Math.max(0,declaredIncome-rentReceived-nkPrepayments),objectIncome=rentReceived+nkPrepayments+otherIncome,operatingResult=objectIncome-operatingCosts;
    const rec=rootData&&rootData.kostenUmlagenAbgleich||{},allPayments=array(rec.payments),paymentRows=allPayments.filter(row=>/^[0-9]{4}$/.test(period.yearLabel)&&Number(row.paymentYear)===Number(period.yearLabel)&&isoDate(row.paymentDate)&&hasNumber(row.amount)),incomeRows=paymentRows.filter(r=>!/ausgabe|expense|lieferant|reparatur|zins|kosten/i.test(text(r.paymentType))),expenseRows=paymentRows.filter(r=>/ausgabe|expense|lieferant|reparatur|zins|kosten/i.test(text(r.paymentType))),cashflowComplete=incomeRows.length>0&&expenseRows.length>0&&paymentRows.every(r=>isoDate(r.paymentDate)&&hasNumber(r.amount)),cashflow=cashflowComplete?sum(incomeRows,r=>r.amount)-sum(expenseRows,r=>r.amount):null;
    const costCoverage={total:sum(costRows.filter(r=>r.active&&r.total!==null),r=>r.total),rentedCovered:sum(costRows,r=>r.rentedShare),privateShare:sum(costRows,r=>r.privateShare),vacancyShare:sum(costRows,r=>r.vacancyShare),unallocatedAllocable:sum(costRows,r=>r.actualUnallocated),trueNonAllocable:sum(costRows,r=>r.trueNonAllocable),otherOwnerOperational:sum(costRows,r=>Math.max(0,r.ownerShare-r.vacancyShare-r.trueNonAllocable-r.actualUnallocated))};
    return {rentTarget,rentReceived,rentRealization:rentTarget?rentReceived/rentTarget*100:null,nkPrepayments,declaredIncome,otherIncome,objectIncome,operatingCosts,actualCosts:operatingCosts+financing+investments,operatingResult,financing,investments,rentShortfall:Math.max(0,rentTarget-rentReceived),datedPayments:paymentRows,cashflowComplete,cashflow,cashflowReason:cashflowComplete?"":"Für eine zeitbezogene Cashflowanalyse fehlen vollständige, tatsächlich datierte Ein- und Auszahlungen.",costCoverage};
  }
  function taxRows(period,costRows){return costRows.filter(r=>r.active||r.total!==null&&Math.abs(r.total)>.000001).map(row=>{const knownSplit=!!row.result,other=knownSplit&&row.total!==null?Math.max(0,row.total-row.rentedShare-row.privateShare-row.vacancyShare):row.total;return {periodId:period.periodId,periodLabel:period.label,costId:row.costId,costName:row.costName,total:row.total,rented:knownSplit?row.rentedShare:null,private:knownSplit?row.privateShare:null,vacancy:knownSplit?row.vacancyShare:null,other,allocationKey:row.allocationKey,usageRule:knownSplit?"Abgeleitet aus regulärer Abrechnungsteilnehmer-/Leerstandsverteilung":"Keine belastbare Aufteilung vorhanden",taxValue:null,taxCategory:null,taxYear:null,taxYearStatus:"offen – keine automatische Gleichsetzung mit Abrechnungsperiode",taxStatus:"noch nicht steuerlich klassifiziert",source:row.source||row.calculationStatus};});}

  function metric(id,label,perspective,value,unit,period,options={}){
    const v=value===null||value===undefined||!Number.isFinite(Number(value))?null:Number(value),status=v===null?(options.status||"nicht berechenbar"):(options.status||"berechenbar");
    return {id,label,perspective,value:v,unit,period:{periodId:period.periodId,label:period.label,start:period.start,end:period.end},comparisonPeriod:null,comparisonValue:null,absoluteChange:null,percentChange:null,comparability:{status:"nicht bewertet",reason:"Kein Vergleich berechnet."},dataCoverage:options.dataCoverage||period.quality.coverage,dataQuality:options.dataQuality||period.quality.comparability,sources:array(options.sources&&options.sources.length?options.sources:[period.source]),calculation:options.calculation||"Zentral aus kanonischem Periodenmodell abgeleitet.",interpretation:options.interpretation||"",anomalies:[],drilldownTargets:array(options.drilldownTargets),displayHints:options.displayHints||{},status,dataGap:v===null?(options.dataGap||"Wert ist aus den vorhandenen Daten nicht berechenbar."):null};
  }
  function periodModel(rootData,period){
    const calculation=safeCalculate(period.dataset),totals=calculation.totals||{},costs=allocationCostRows(period,calculation),tenants=tenantRows(period,calculation,rootData),water=waterHistoryForPeriod(rootData,period),quality=safeQuality(period.dataset),meter=meterQuality(period,rootData),rec=reconciliationForPeriod(rootData,period);
    const activeKnown=costs.filter(c=>c.active&&c.total!==null),activeMissing=costs.filter(c=>c.active&&c.total===null),totalCosts=activeMissing.length?null:(hasNumber(totals.totalCosts)?number(totals.totalCosts):sum(activeKnown,c=>c.total)),participantShare=hasNumber(totals.billableShare)?number(totals.billableShare):sum(tenants,t=>t.costShare),privateShare=hasNumber(totals.privateShare)?number(totals.privateShare):sum(tenants.filter(t=>t.usage==="private"),t=>t.costShare),vacancyShare=hasNumber(totals.vacancyShare)?number(totals.vacancyShare):sum(costs,c=>c.vacancyShare),ownerShare=hasNumber(totals.ownerShare)?number(totals.ownerShare):sum(costs,c=>c.ownerShare),documentedOwnerShare=hasNumber(totals.documentedOwnerShare)?number(totals.documentedOwnerShare):sum(costs,c=>c.documentedOwnerShare),trueNonAllocable=sum(costs,c=>c.trueNonAllocable),unallocatedAllocable=sum(costs,c=>c.actualUnallocated),prepayments=hasNumber(totals.prepayments)?number(totals.prepayments):sum(tenants,t=>t.prepayments),positiveBalance=sum(tenants.filter(t=>t.balance>0),t=>t.balance),negativeBalance=Math.abs(sum(tenants.filter(t=>t.balance<0),t=>t.balance)),settlementBalance=sum(tenants,t=>t.balance),totalAreaValue=totalArea(period.dataset,rootData),waterCost=costs.find(c=>c.costId&&/wasser/i.test(c.costName)&&c.active)||costs.find(c=>/wasserversorgung/i.test(c.costName)),waterPrice=waterCost&&waterCost.pricePerUnit!==null?waterCost.pricePerUnit:(water.available&&water.total>0&&waterCost&&waterCost.total!==null?waterCost.total/water.total:null),units=unitRows(period,tenants,water,rootData),vacancyDays=sum(units.filter(u=>u.vacancyDays!==null),u=>u.vacancyDays),vacancyDaysComplete=units.length>0&&units.every(u=>u.vacancyDays!==null),financial=financialRows(period,costs,tenants,rootData),tax=taxRows(period,costs);
    const model={period:Object.assign({},period,{dataset:undefined,meta:undefined}),calculationError:calculation.error||"",qualityError:quality.error||"",totals:{totalCosts,participantShare,privateShare,vacancyShare,ownerShare,documentedOwnerShare,trueNonAllocable,unallocatedAllocable,prepayments,positiveBalance,negativeBalance,settlementBalance,costPerSqm:totalAreaValue&&totalCosts!==null?totalCosts/totalAreaValue:null,totalArea:totalAreaValue,allocationDelta:hasNumber(totals.allocationDelta)?number(totals.allocationDelta):null,vacancyDays:vacancyDaysComplete?vacancyDays:null,vacancyCostPerDay:vacancyDaysComplete&&vacancyDays>0?vacancyShare/vacancyDays:null},costs,tenants,units,water,waterPrice,meter,quality,financial,tax,reconciliation:rec};
    const taxClassified=sum(tax.filter(r=>r.taxValue!==null),r=>r.taxValue),taxUnclassified=sum(tax.filter(r=>r.taxValue===null&&r.total!==null),r=>r.total);
    model.metrics={
      totalCosts:metric("nk.totalCosts","Abrechnungskosten","nk",totalCosts,"EUR",period,{calculation:"Summe der aktiven NK-Kostenarten; fehlt eine aktive Kostenposition, bleibt der Gesamtwert offen.",drilldownTargets:["costs"],dataGap:activeMissing.length?activeMissing.length+" aktive Kostenposition(en) ohne Wert.":"Keine berechenbaren Abrechnungskosten."}),
      participantShare:metric("nk.participantShare","Auf reguläre Abrechnungsteilnehmer verteilt","nk",participantShare,"EUR",period,{calculation:"Summe der zentral berechneten Teilnehmer-Kostenanteile.",drilldownTargets:["participants"]}),
      prepayments:metric("nk.prepayments","Vorauszahlungen","nk",prepayments,"EUR",period,{calculation:"Summe der zentralen Vorauszahlungswerte.",drilldownTargets:["balances"]}),
      settlementBalance:metric("nk.balance","Abrechnungssaldo","nk",settlementBalance,"EUR",period,{calculation:"Summe der Abrechnungssalden aller regulären Teilnehmer.",drilldownTargets:["balances"]}),
      waterConsumption:metric("nk.waterConsumption","Wasserverbrauch","nk",water.available?water.total:null,"m³",period,{sources:[water.source||period.source],calculation:"Summe der vorhandenen Kalt-/Warmwasser-Jahresdeltas.",drilldownTargets:["water"],dataGap:water.reason}),
      waterPrice:metric("nk.waterPrice","Wasserpreis","nk",waterPrice,"EUR/m³",period,{calculation:"Vorhandener Preis je Einheit; sonst Kosten geteilt durch belastbaren Gesamtverbrauch.",drilldownTargets:["water"]}),
      rentReceived:metric("finance.rentReceived","Mieteinnahmen","finance",financial.rentReceived,"EUR",period,{calculation:"Erhaltene Kaltmiete regulär vermieteter Teilnehmer; Privatnutzung erzeugt keine fiktive Miete.",drilldownTargets:["income"]}),
      operatingCosts:metric("finance.operatingCosts","Laufende Objektkosten","finance",financial.operatingCosts,"EUR",period,{calculation:"Vorhandene Objektkosten ohne Finanzierung und Investitionen.",drilldownTargets:["expenses"]}),
      operatingResult:metric("finance.operatingResult","Objektbetriebsergebnis","finance",financial.operatingResult,"EUR",period,{calculation:"Kaltmiete + vorhandene sonstige echte Einnahmen + NK-Vorauszahlungen minus laufende Objektkosten; vor Finanzierung und Investitionen.",drilldownTargets:["economics"]}),
      cashflow:metric("finance.cashflow","Cashflow","finance",financial.cashflowComplete?financial.cashflow:null,"EUR",period,{calculation:"Nur aus tatsächlich datierten Ein- und Auszahlungen.",drilldownTargets:["payments"],dataGap:financial.cashflowReason}),
      taxRent:metric("tax.rent","Mieteinnahmen ohne Umlagen","tax",financial.rentReceived,"EUR",period,{calculation:"Vorhandene erhaltene Kaltmieten vermieteter Teilnehmer.",drilldownTargets:["tax-income"]}),
      taxPrepayments:metric("tax.prepayments","Vereinnahmte Umlagen","tax",financial.nkPrepayments,"EUR",period,{calculation:"Vorhandene NK-Vorauszahlungen; steuerliche zeitliche Einordnung bleibt ohne Regel offen.",drilldownTargets:["tax-income"]}),
      taxClassified:metric("tax.classified","Steuerlich klassifizierte Aufwendungen","tax",taxClassified,"EUR",period,{calculation:"Nur explizit steuerlich klassifizierte Kostenpositionen.",drilldownTargets:["tax-transition"]}),
      taxUnclassified:metric("tax.unclassified","Steuerlich noch ungeklärte Beträge","tax",taxUnclassified,"EUR",period,{calculation:"Summe vorhandener Kosten ohne explizite steuerliche Zuordnung.",drilldownTargets:["tax-transition"]})
    };
    return model;
  }

  function assessComparability(a,b,context={}){
    const reasons=[];
    if(!a||!b)return {status:"nicht vergleichbar",reason:"Eine Vergleichsperiode fehlt."};
    if(context.beforeValue===null||context.afterValue===null)reasons.push("Mindestens einer der beiden Werte fehlt oder ist nicht berechenbar.");
    const qa=a.period.quality||{},qb=b.period.quality||{};
    if(qa.comparability==="nicht vergleichbar"||qb.comparability==="nicht vergleichbar")reasons.push("Mindestens eine Periode besitzt keine vollständige Datenbasis.");
    if(a.period.start&&a.period.end&&b.period.start&&b.period.end&&daysBetween(a.period.start,a.period.end)!==daysBetween(b.period.start,b.period.end))reasons.push("Die Periodenlängen unterscheiden sich.");
    if(!qa.calendar||!qb.calendar)reasons.push("Mindestens eine Periode ist kein eindeutiges Kalenderjahr.");
    if(qa.legacy||qb.legacy)reasons.push("Mindestens eine Periode ist ein historischer/übernommener Datenstand.");
    if(qa.working||qb.working||qa.reopened||qb.reopened)reasons.push("Mindestens eine Periode ist ein laufender oder erneut geöffneter Arbeitsstand.");
    if(context.participantStructureChanged)reasons.push("Die Teilnehmer-/Belegungsstruktur hat sich geändert.");
    if(context.allocationChanged)reasons.push("Der Umlageschlüssel hat sich geändert.");
    if(context.sourceChanged)reasons.push("Die Datenquelle unterscheidet sich.");
    if(reasons.some(r=>/fehlt|keine vollständige Datenbasis/.test(r)))return {status:"nicht vergleichbar",reason:reasons.join(" ")};
    if(reasons.length)return {status:"eingeschränkt vergleichbar",reason:reasons.join(" ")};
    return {status:"vergleichbar",reason:"Beide Werte besitzen eine belastbare, gleichartige Periodenbasis."};
  }
  function compareMetric(beforeMetric,afterMetric,a,b,context={}){
    const before=beforeMetric&&beforeMetric.value!==undefined?beforeMetric.value:null,after=afterMetric&&afterMetric.value!==undefined?afterMetric.value:null,comparability=assessComparability(a,b,Object.assign({beforeValue:before,afterValue:after},context)),out=clone(afterMetric||{});
    out.comparisonPeriod=beforeMetric&&beforeMetric.period||null;out.comparisonValue=before;
    if(comparability.status==="vergleichbar"||comparability.status==="eingeschränkt vergleichbar"){
      if(before!==null&&after!==null){out.absoluteChange=after-before;out.percentChange=Math.abs(before)>.0000001?(after-before)/Math.abs(before)*100:(after===0?0:null);}
    }else{out.absoluteChange=null;out.percentChange=null;}
    out.comparability=comparability;return out;
  }
  function compareCosts(a,b){
    const am=new Map(array(a&&a.costs).map(r=>[r.costId,r])),bm=new Map(array(b&&b.costs).map(r=>[r.costId,r])),keys=unique([...am.keys(),...bm.keys()]);
    return keys.map(key=>{const before=am.get(key),after=bm.get(key),beforeValue=before?before.total:null,afterValue=after?after.total:null,newCost=!!after&&after.active&&afterValue!==null&&(!before||!before.active||beforeValue===null),removedCost=!!before&&before.active&&beforeValue!==null&&!!after&&!after.active,allocationChanged=!!(before&&after&&before.allocationKey!==after.allocationKey),sourceChanged=!!(before&&after&&before.source&&after.source&&before.source!==after.source),comparability=newCost?{status:"eingeschränkt vergleichbar",reason:"Neu in dieser Periode."}:removedCost?{status:"eingeschränkt vergleichbar",reason:"In der aktuellen Periode fachlich nicht mehr aktiv."}:assessComparability(a,b,{beforeValue,afterValue,allocationChanged,sourceChanged}),absoluteChange=null,percentChange=null;
      let delta=null,pct=null;if(beforeValue!==null&&afterValue!==null&&(comparability.status==="vergleichbar"||comparability.status==="eingeschränkt vergleichbar")){delta=afterValue-beforeValue;if(!newCost&&Math.abs(beforeValue)>.0000001)pct=delta/Math.abs(beforeValue)*100;else if(!newCost&&beforeValue===0&&afterValue===0)pct=0;}
      return {costId:key,costName:text((after||before||{}).costName),before:beforeValue,after:afterValue,delta,absoluteChange:delta,percent:pct,percentChange:pct,newCost,removedCost,allocationChanged,beforeAllocation:before&&before.allocationKey||"",afterAllocation:after&&after.allocationKey||"",comparability};});
  }
  function comparison(a,b){
    if(!a||!b)return null;
    const costs=compareCosts(a,b),beforeTenant=new Map(array(a.tenants).map(t=>[t.tenantId,t])),afterTenant=new Map(array(b.tenants).map(t=>[t.tenantId,t])),tenantIds=unique([...beforeTenant.keys(),...afterTenant.keys()]),tenantChanges=tenantIds.map(id=>{const before=beforeTenant.get(id),after=afterTenant.get(id);return {tenantId:id,name:text((after||before||{}).name),unitId:text((after||before||{}).unitId),newParticipant:!before&&!!after,removedParticipant:!!before&&!after,balanceDelta:number(after&&after.balance)-number(before&&before.balance),prepaymentDelta:number(after&&after.prepayments)-number(before&&before.prepayments)};}),participantStructureChanged=tenantChanges.some(r=>r.newParticipant||r.removedParticipant);
    const metrics={};Object.keys(b.metrics||{}).forEach(k=>{metrics[k]=compareMetric(a.metrics&&a.metrics[k],b.metrics[k],a,b,{participantStructureChanged});});
    const waterBefore=a.water.available?a.water.total:null,waterAfter=b.water.available?b.water.total:null,waterComp=assessComparability(a,b,{beforeValue:waterBefore,afterValue:waterAfter,participantStructureChanged}),waterDelta=(waterBefore!==null&&waterAfter!==null&&(waterComp.status==="vergleichbar"||waterComp.status==="eingeschränkt vergleichbar"))?waterAfter-waterBefore:null,waterPercent=waterDelta!==null&&Math.abs(waterBefore)>.000001?waterDelta/Math.abs(waterBefore)*100:null,waterCostBefore=a.costs.find(r=>/wasserversorgung/i.test(r.costName)),waterCostAfter=b.costs.find(r=>/wasserversorgung/i.test(r.costName));
    let waterEffects=null;
    if(waterBefore!==null&&waterAfter!==null&&a.waterPrice!==null&&b.waterPrice!==null&&waterCostBefore&&waterCostAfter&&waterCostBefore.total!==null&&waterCostAfter.total!==null&&(waterComp.status==="vergleichbar"||waterComp.status==="eingeschränkt vergleichbar")){
      const quantityEffect=(waterAfter-waterBefore)*(a.waterPrice+b.waterPrice)/2,priceEffect=(b.waterPrice-a.waterPrice)*(waterBefore+waterAfter)/2,costDelta=waterCostAfter.total-waterCostBefore.total;
      waterEffects={costDelta,consumptionEffect:quantityEffect,quantityEffect,priceEffect,otherEffect:costDelta-quantityEffect-priceEffect,method:"Symmetrische Mengen-/Preiszerlegung (Mittelwertmethode); Rest als sonstiger Struktur-/Rundungseffekt.",comparability:waterComp};
    }
    const totalMetric=metrics.totalCosts||null;
    return {from:a.period,to:b.period,costs,tenantChanges,metrics,totalCostDelta:totalMetric?totalMetric.absoluteChange:null,totalCostPercent:totalMetric?totalMetric.percentChange:null,waterDelta,waterPercent,waterPriceDelta:(a.waterPrice!==null&&b.waterPrice!==null)?b.waterPrice-a.waterPrice:null,waterEffects,comparability:totalMetric&&totalMetric.comparability||assessComparability(a,b),largestIncreases:costs.filter(r=>r.delta!==null&&r.delta>0&&!r.newCost).sort((x,y)=>y.delta-x.delta).slice(0,5),largestDecreases:costs.filter(r=>r.delta!==null&&r.delta<0).sort((x,y)=>x.delta-y.delta).slice(0,5),newCosts:costs.filter(r=>r.newCost),removedCosts:costs.filter(r=>r.removedCost),allocationChanges:costs.filter(r=>r.allocationChanged)};
  }
  function insights(models){
    const out=[];
    for(let i=1;i<models.length;i++){
      const prev=models[i-1],cur=models[i],cmp=comparison(prev,cur);
      cmp.costs.forEach(row=>{
        if(row.newCost)out.push({type:"new-cost",category:"Kosten",severity:"info",periodId:cur.period.periodId,label:"Neu in dieser Periode: "+row.costName,value:row.after,detail:"Für diese Kostenart wird keine künstliche Prozentänderung ausgewiesen.",key:row.costId});
        if(row.removedCost)out.push({type:"removed-cost",category:"Kosten",severity:"info",periodId:cur.period.periodId,label:"Kostenart nicht mehr aktiv: "+row.costName,value:row.before,detail:"Wegfall wird nur aus einer vorhandenen, explizit inaktiven Folgeposition abgeleitet.",key:row.costId});
        if(row.percent!==null&&Math.abs(row.percent)>=20&&Math.abs(row.delta)>=50)out.push({type:"cost-change",category:"Kosten",severity:"notice",periodId:cur.period.periodId,label:row.costName+" "+(row.percent>=0?"+":"")+round(row.percent,1)+" %",value:row.delta,detail:"Auffällige Kostenveränderung gegenüber "+prev.period.label+". Auffälligkeit ist nicht automatisch ein Fehler.",key:row.costId});
        if(row.allocationChanged)out.push({type:"allocation-change",category:"Struktur",severity:"notice",periodId:cur.period.periodId,label:"Geänderter Umlageschlüssel: "+row.costName,value:null,detail:row.beforeAllocation+" → "+row.afterAllocation,key:row.costId});
      });
      if(cmp.waterPercent!==null&&Math.abs(cmp.waterPercent)>=20)out.push({type:"water-change",category:"Verbrauch",severity:"notice",periodId:cur.period.periodId,label:"Wasserverbrauch "+(cmp.waterPercent>=0?"+":"")+round(cmp.waterPercent,1)+" %",value:cmp.waterDelta,detail:"Gesamtverbrauch gegenüber "+prev.period.label+" verändert.",key:"water"});
      if(aFinite(prev.waterPrice)&&aFinite(cur.waterPrice)&&Math.abs(prev.waterPrice)>.000001){const pct=(cur.waterPrice-prev.waterPrice)/prev.waterPrice*100;if(Math.abs(pct)>=15)out.push({type:"price-change",category:"Verbrauch",severity:"notice",periodId:cur.period.periodId,label:"Wasserpreis "+(pct>=0?"+":"")+round(pct,1)+" %",value:cur.waterPrice-prev.waterPrice,detail:"Preis je Verbrauchseinheit gegenüber "+prev.period.label+" verändert.",key:"water-price"});}
      if(cmp.comparability&&cmp.comparability.status!=="vergleichbar")out.push({type:"comparison-limited",category:"Daten",severity:"data",periodId:cur.period.periodId,label:"Vergleich eingeschränkt",value:null,detail:cmp.comparability.reason,key:cur.period.periodId});
    }
    models.forEach(model=>{if(model.period.quality.legacy)out.push({type:"legacy",category:"Daten",severity:"data",periodId:model.period.periodId,label:"Historische Periode eingeschränkt vergleichbar",value:null,detail:"Der historische/übernommene Datenstand bleibt erhalten; Aussagen werden kennzahlenbezogen bewertet.",key:model.period.periodId});if(model.meter.available&&(model.meter.missingValues||model.meter.invalidPeriods))out.push({type:"meter-quality",category:"Daten",severity:"notice",periodId:model.period.periodId,label:"Zählerdaten prüfen",value:model.meter.missingValues+model.meter.invalidPeriods,detail:"Fehlende Messwerte oder problematische Messperioden vorhanden.",key:"meters"});});
    return out;
  }
  function aFinite(v){return v!==null&&v!==undefined&&Number.isFinite(Number(v));}
  function build(data=canonicalRoot(),options={}){
    const signature=stateSignature(data),cacheKey=signature+"|"+JSON.stringify({periodIds:options.periodIds||[]});if(cache.has(cacheKey))return cache.get(cacheKey);
    const periods=listPeriods(data),selectedIds=array(options.periodIds).map(text).filter(Boolean),selected=selectedIds.length?periods.filter(p=>selectedIds.includes(p.periodId)):periods,models=selected.map(period=>periodModel(data,period)),comparisons=[];for(let i=1;i<models.length;i++)comparisons.push(comparison(models[i-1],models[i]));const foundInsights=insights(models);
    const result=Object.freeze({version:VERSION,appVersion:requireDeps().appVersion,periods:Object.freeze(periods.map(p=>Object.assign({},p,{dataset:undefined,meta:undefined}))),models:Object.freeze(models),comparisons:Object.freeze(comparisons),insights:Object.freeze(foundInsights),anomalies:Object.freeze(foundInsights),signature});cache.set(cacheKey,result);while(cache.size>CACHE_LIMIT)cache.delete(cache.keys().next().value);return result;
  }
  function invalidate(){cache.clear();}
  function describe(){return Object.freeze({configured:!!deps,version:VERSION,cacheEntries:cache.size,readOnly:true,comparisonModel:"metric-aware-v2"});}

  global.NKProAnalyticsEngine=Object.freeze({VERSION,configure,describe,listPeriods,build,comparison,compareCosts,assessComparability,compareMetric,invalidate});
})(globalThis);
