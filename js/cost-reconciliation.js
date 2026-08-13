(function (global) {
  "use strict";

  const VERSION = 1;
  const ROOT_KEY = "kostenUmlagenAbgleich";
  const SCOPE = "cost-reconciliation";
  const TOLERANCE = 0.01;
  const PAYMENT_TYPES = Object.freeze([
    Object.freeze({ value:"prepayment", label:"Nebenkostenvorauszahlung", sign:1 }),
    Object.freeze({ value:"additional-payment", label:"Vereinnahmte Nachzahlung", sign:1 }),
    Object.freeze({ value:"refund", label:"Ausgezahlte Erstattung", sign:-1 }),
    Object.freeze({ value:"correction", label:"Weitere Korrektur / Gutschrift", sign:0 })
  ]);
  const CATEGORIES = Object.freeze([
    Object.freeze({ value:"vacancy", label:"Leerstandsanteil" }),
    Object.freeze({ value:"non-allocated", label:"Nicht auf Mieter umgelegte Kosten" }),
    Object.freeze({ value:"temporal-accrual", label:"Zeitliche Abgrenzungen" }),
    Object.freeze({ value:"uncollected", label:"Nicht vereinnahmte Forderungen" }),
    Object.freeze({ value:"accepted-other", label:"Akzeptierte sonstige Differenzen" }),
    Object.freeze({ value:"open", label:"Offene Differenz" })
  ]);
  const ALLOCATION_KEYS = Object.freeze(["Verbrauch", "Wohnfläche", "Einheiten", "Personenzahl", "Zeitanteil", "Direkter Betrag", "Manuelle Zuordnung"]);
  let deps = null;

  function configure(options = {}) {
    if (deps) return describe();
    if (!options.stateAccess || typeof options.stateAccess.current !== "function" || typeof options.stateAccess.transact !== "function") throw new Error("Kosten- und Umlagenabgleich benötigt NKProStateAccess.");
    if (!options.billingReview || typeof options.billingReview.ensureContainer !== "function") throw new Error("Kosten- und Umlagenabgleich benötigt die bestehende Prüfentscheidungsspeicherung.");
    deps = Object.freeze({
      stateAccess:options.stateAccess,
      billingReview:options.billingReview,
      calculateDataset:typeof options.calculateDataset === "function" ? options.calculateDataset : null,
      appVersion:String(options.appVersion || ""),
      now:typeof options.now === "function" ? options.now : () => new Date().toISOString()
    });
    return describe();
  }
  function requireDeps() { if (!deps) throw new Error("Kosten- und Umlagenabgleich wurde noch nicht konfiguriert."); return deps; }
  function text(value) { return String(value === undefined || value === null ? "" : value).trim(); }
  function number(value) {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const normalized = String(value).trim().replace(/\s/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function hasNumber(value) { return value !== null && value !== undefined && value !== "" && Number.isFinite(number(value)); }
  function round(value) { return Math.round(number(value) * 100) / 100; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function id(prefix) { return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,8).toUpperCase(); }
  function yearOf(data) { return Number(data && data.meta && data.meta.abrechnungsjahr) || 0; }
  function paymentType(value) { return PAYMENT_TYPES.find(row => row.value === value) || null; }
  function category(value) { return CATEGORIES.find(row => row.value === value) || null; }
  function normalizedPaymentAmount(type, amount) {
    const row = paymentType(type);
    const raw = number(amount);
    if (!row) return raw;
    if (row.sign < 0) return -Math.abs(raw);
    if (row.sign > 0) return Math.abs(raw);
    return raw;
  }

  function neutralContainer() {
    return { version:VERSION, payments:[], costOverrides:[], allocations:[], release:{ status:"draft", checkedAt:"", checkedBy:"", releasedAt:"", releasedBy:"", note:"" }, updatedAt:"", updatedWithAppVersion:"" };
  }
  function ensureData(data) {
    if (!data || typeof data !== "object") return neutralContainer();
    if (!data[ROOT_KEY] || typeof data[ROOT_KEY] !== "object" || Array.isArray(data[ROOT_KEY])) data[ROOT_KEY] = neutralContainer();
    const container = data[ROOT_KEY];
    container.version = VERSION;
    if (!Array.isArray(container.payments)) container.payments = [];
    if (!Array.isArray(container.costOverrides)) container.costOverrides = [];
    if (!Array.isArray(container.allocations)) container.allocations = [];
    if (!container.release || typeof container.release !== "object" || Array.isArray(container.release)) container.release = neutralContainer().release;
    container.payments = container.payments.filter(row => row && typeof row === "object").map(row => Object.assign({
      id:id("PAY"), paymentType:"prepayment", amount:0, paymentDate:"", paymentYear:0, billingYear:0,
      tenantId:"", unitId:"", source:"Manuelle Erfassung", origin:"NK-Pro", status:"booked", note:"", createdAt:"", updatedAt:"", updatedBy:""
    }, row));
    container.costOverrides = container.costOverrides.filter(row => row && typeof row === "object").map(row => Object.assign({
      id:id("CST"), year:0, costId:"", actualTotal:"", billingAmount:"", analysisAmount:"", analysisCategory:"", source:"Gesamtkosten", evidenceStatus:"not-linked", note:"", updatedAt:"", updatedBy:""
    }, row));
    container.allocations = container.allocations.filter(row => row && typeof row === "object").map(row => {
      const normalized = Object.assign({
        id:id("ALC"), category:"open", year:0, amount:0, costId:"", tenantId:"", unitId:"", allocationKey:"Manuelle Zuordnung",
        source:"Manuelle Zuordnung", evidenceStatus:"not-linked", evidenceReference:"", reason:"", status:"open", decisionId:"", createdAt:"", updatedAt:"", updatedBy:""
      }, row);
      if (normalized.category === "private") normalized.category = "non-allocated";
      return normalized;
    });
    return container;
  }
  function readData(data) {
    const source = data && data[ROOT_KEY];
    if (!source || typeof source !== "object" || Array.isArray(source)) return neutralContainer();
    return Object.assign(neutralContainer(), clone(source), {
      payments:Array.isArray(source.payments) ? clone(source.payments) : [],
      costOverrides:Array.isArray(source.costOverrides) ? clone(source.costOverrides) : [],
      allocations:Array.isArray(source.allocations) ? clone(source.allocations) : [],
      release:Object.assign(neutralContainer().release, clone(source.release || {}))
    });
  }
  function touch(container) { const d=requireDeps(); container.updatedAt=d.now(); container.updatedWithAppVersion=d.appVersion; }
  function invalidateRelease(container) {
    if (!container || !container.release || container.release.status === "draft") return;
    container.release = Object.assign({}, container.release, { status:"draft", checkedAt:"", checkedBy:"", releasedAt:"", releasedBy:"" });
  }

  function savePayment(input = {}) {
    const d=requireDeps();
    const type=text(input.paymentType);
    if (!paymentType(type)) throw new Error("Bitte eine gültige Zahlungsart auswählen.");
    const paymentDate=text(input.paymentDate);
    const paymentYear=Number(input.paymentYear) || Number(paymentDate.slice(0,4)) || 0;
    const billingYear=Number(input.billingYear) || 0;
    if (!paymentYear) throw new Error("Bitte das Zahlungsjahr angeben.");
    if (!billingYear) throw new Error("Bitte das zugehörige Abrechnungsjahr angeben.");
    if (!hasNumber(input.amount)) throw new Error("Bitte einen Betrag angeben.");
    return d.stateAccess.transact(data => {
      const container=ensureData(data); const now=d.now();
      const existing=container.payments.find(row => row.id===text(input.id));
      const record=Object.assign(existing || { id:id("PAY"), createdAt:now }, {
        paymentType:type, amount:round(normalizedPaymentAmount(type,input.amount)), paymentDate, paymentYear, billingYear,
        tenantId:text(input.tenantId), unitId:text(input.unitId), source:text(input.source || "Manuelle Erfassung"),
        origin:text(input.origin || "NK-Pro"), status:text(input.status || "booked"), note:text(input.note), updatedAt:now, updatedBy:text(input.updatedBy)
      });
      if (!existing) container.payments.push(record);
      invalidateRelease(container); touch(container); return clone(record);
    }, { reason:"Tatsächlichen Zahlungsfluss speichern", tabId:"kostenumlagenabgleich", requireCommitSuccess:true });
  }
  function removePayment(paymentId) {
    const d=requireDeps(); const target=text(paymentId);
    return d.stateAccess.transact(data => { const c=ensureData(data); const before=c.payments.length; c.payments=c.payments.filter(row=>row.id!==target); invalidateRelease(c); touch(c); return {changed:c.payments.length!==before,id:target}; }, { reason:"Zahlungsfluss löschen", tabId:"kostenumlagenabgleich", requireCommitSuccess:true });
  }
  function saveCostOverride(input = {}) {
    const d=requireDeps(); const year=Number(input.year)||0; const costId=text(input.costId);
    if (!year || !costId) throw new Error("Jahr und Kostenart sind erforderlich.");
    return d.stateAccess.transact(data => { const c=ensureData(data); const now=d.now(); let row=c.costOverrides.find(item=>item.id===text(input.id)) || c.costOverrides.find(item=>Number(item.year)===year && item.costId===costId); if(!row){row={id:id("CST")};c.costOverrides.push(row);} Object.assign(row,{year,costId,actualTotal:input.actualTotal, billingAmount:input.billingAmount, analysisAmount:input.analysisAmount, analysisCategory:text(input.analysisCategory), source:text(input.source||"Gesamtkosten"), evidenceStatus:text(input.evidenceStatus||"not-linked"), note:text(input.note), updatedAt:now, updatedBy:text(input.updatedBy)}); invalidateRelease(c); touch(c); return clone(row); }, {reason:"Analyserelevanten Kostenbetrag speichern",tabId:"kostenumlagenabgleich",requireCommitSuccess:true});
  }
  function removeCostOverride(overrideId) { const d=requireDeps(); const target=text(overrideId); return d.stateAccess.transact(data=>{const c=ensureData(data);const before=c.costOverrides.length;c.costOverrides=c.costOverrides.filter(row=>row.id!==target);invalidateRelease(c);touch(c);return {changed:before!==c.costOverrides.length};},{reason:"Kostenanalyse-Zuordnung löschen",tabId:"kostenumlagenabgleich",requireCommitSuccess:true}); }

  function decisionRecordFor(allocation, input, now) {
    return {
      recordId:"KUA-REV-" + allocation.id,
      differenceId:"KUA-" + allocation.id,
      decisionScope:SCOPE,
      type:"cost-reconciliation-allocation",
      area:category(allocation.category) ? category(allocation.category).label : allocation.category,
      originalDifference:number(allocation.amount), unit:"€", originalMonetaryAmount:Math.abs(number(allocation.amount)),
      treatment:allocation.category, treatmentLabel:"Geprüfte Zuordnung: " + (category(allocation.category) ? category(allocation.category).label : allocation.category),
      reason:text(allocation.reason), status:"accepted", statusLabel:"Geprüft", acceptedBy:text(input.updatedBy), acceptedAt:now,
      confirmed:true, appVersion:requireDeps().appVersion, source:text(allocation.source), year:Number(allocation.year)||0,
      costId:text(allocation.costId), tenantId:text(allocation.tenantId), unitId:text(allocation.unitId), evidenceReference:text(allocation.evidenceReference)
    };
  }
  function syncAllocationDecision(data, allocation, checked, input, now) {
    const review=requireDeps().billingReview.ensureContainer(data); const decisionId="KUA-"+allocation.id;
    allocation.decisionId=checked ? decisionId : "";
    if (checked) review.records[decisionId]=decisionRecordFor(allocation,input,now); else if (review.records[decisionId] && review.records[decisionId].decisionScope===SCOPE) delete review.records[decisionId];
  }
  function saveAllocation(input = {}) {
    const d=requireDeps(); const cat=text(input.category); const year=Number(input.year)||0;
    if (!category(cat)) throw new Error("Bitte eine gültige Erklärungskategorie auswählen.");
    if (!year) throw new Error("Bitte ein Jahr auswählen.");
    if (!hasNumber(input.amount)) throw new Error("Bitte einen Betrag angeben.");
    if (cat!=="open" && text(input.reason).length<5) throw new Error("Bitte eine nachvollziehbare Begründung mit mindestens 5 Zeichen eingeben.");
    if (input.checked===true && !text(input.updatedBy)) throw new Error("Bitte den Bearbeiter der Prüfentscheidung angeben.");
    return d.stateAccess.transact(data=>{
      const c=ensureData(data); const now=d.now(); let row=c.allocations.find(item=>item.id===text(input.id));
      if(!row){row={id:id("ALC"),createdAt:now};c.allocations.push(row);} Object.assign(row,{category:cat,year,amount:round(input.amount),costId:text(input.costId),tenantId:text(input.tenantId),unitId:text(input.unitId),allocationKey:text(input.allocationKey||"Manuelle Zuordnung"),source:text(input.source||"Manuelle Zuordnung"),evidenceStatus:text(input.evidenceStatus||"not-linked"),evidenceReference:text(input.evidenceReference),reason:text(input.reason),status:input.checked===true?"checked":"open",updatedAt:now,updatedBy:text(input.updatedBy)});
      syncAllocationDecision(data,row,input.checked===true,input,now); invalidateRelease(c); touch(c); return clone(row);
    },{reason:"Differenzerklärung speichern",tabId:"kostenumlagenabgleich",requireCommitSuccess:true});
  }
  function removeAllocation(allocationId) { const d=requireDeps(); const target=text(allocationId); return d.stateAccess.transact(data=>{const c=ensureData(data);const row=c.allocations.find(item=>item.id===target);if(row)syncAllocationDecision(data,row,false,{},d.now());c.allocations=c.allocations.filter(item=>item.id!==target);invalidateRelease(c);touch(c);return {changed:!!row};},{reason:"Differenzerklärung löschen",tabId:"kostenumlagenabgleich",requireCommitSuccess:true}); }
  function setRelease(input={}) { const d=requireDeps(); const status=["draft","checked","released"].includes(text(input.status))?text(input.status):"draft"; return d.stateAccess.transact(data=>{const c=ensureData(data);const now=d.now();c.release=Object.assign(c.release||{}, {status,note:text(input.note)});if(status==="checked"){c.release.checkedAt=now;c.release.checkedBy=text(input.updatedBy);}if(status==="released"){c.release.checkedAt=c.release.checkedAt||now;c.release.checkedBy=c.release.checkedBy||text(input.updatedBy);c.release.releasedAt=now;c.release.releasedBy=text(input.updatedBy);}if(status==="draft"){c.release.checkedAt="";c.release.checkedBy="";c.release.releasedAt="";c.release.releasedBy="";}touch(c);return clone(c.release);},{reason:"Prüfstatus des Kosten- und Umlagenabgleichs ändern",tabId:"kostenumlagenabgleich",requireCommitSuccess:true}); }

  function datasetsFor(data) {
    const map=new Map();
    (Array.isArray(data && data.jahresArchiv)?data.jahresArchiv:[]).forEach(item=>{const dataset=item&&item.data;const year=Number(item&&item.year)||yearOf(dataset);if(year&&dataset&&!map.has(year))map.set(year,dataset);});
    const meta=data&&data.meta||{};
    const currentAvailable=!(meta.archiveViewer||meta.currentBillingArchivedOnly||meta.currentBillingClosedAfterArchive);
    const currentYear=yearOf(data); if(currentAvailable&&currentYear) map.set(currentYear,data);
    return map;
  }
  function safeCalculation(dataset) {
    const d=requireDeps();
    if (!d.calculateDataset) return { calculation:{costResults:[],tenantResults:[],privateResults:[]}, totals:{} };
    try { return d.calculateDataset(dataset) || {calculation:{costResults:[]},totals:{}}; } catch(error) { return { calculation:{costResults:[],tenantResults:[],privateResults:[]}, totals:{}, error:String(error&&error.message||error) }; }
  }
  function costOverrideMap(container,year){return new Map(container.costOverrides.filter(row=>Number(row.year)===Number(year)).map(row=>[String(row.costId),row]));}
  function costYearModel(dataset,year,container) {
    const result=safeCalculation(dataset); const calculation=result.calculation||{}; const calcRows=new Map((calculation.costResults||[]).map(row=>[String(row.cost&&row.cost.id||""),row])); const overrides=costOverrideMap(container,year);
    const costs=(Array.isArray(dataset&&dataset.kostenarten)?dataset.kostenarten:[]).filter(cost=>cost&&cost.kostenart&&cost.inNK==="Ja").map(cost=>{
      const override=overrides.get(String(cost.id||""))||null; const base=number(cost.gesamtbetrag); const analysis=override&&hasNumber(override.analysisAmount)?number(override.analysisAmount):base; const row=calcRows.get(String(cost.id||""))||{}; const scale=base?analysis/base:0;
      const privateShare=number(row.privateShare)*scale; const vacancyShare=number(row.vacancyShare)*scale; const tenantShare=number(row.tenantSum)*scale;
      const intentional=text(cost.ausschlussBehandlung)==="Nicht umlagefähig / Eigentümeranteil";
      const nonAllocated=intentional?Math.max(0,analysis-tenantShare-vacancyShare):0;
      // privateShare ist nur noch eine Informations-Teilmenge von tenantShare und darf nicht doppelt addiert werden.
      const assigned=tenantShare+vacancyShare+nonAllocated; const open=round(analysis-assigned);
      const analysisCategory=override&&text(override.analysisCategory) ? text(override.analysisCategory) : (intentional?"non-allocated":"allocable");
      return { year,costId:text(cost.id),costName:text(cost.kostenart),total:base,actualTotal:override&&hasNumber(override.actualTotal)?number(override.actualTotal):base,billingAmount:override&&hasNumber(override.billingAmount)?number(override.billingAmount):base,analysisAmount:analysis,tenantShare,privateShare,vacancyShare,nonAllocated,otherOwnerShare:0,open,allocationKey:text(cost.umlageschluessel),source:override?text(override.source):"Gesamtkosten",evidenceStatus:override?text(override.evidenceStatus):"from-source",analysisCategory,overrideId:override&&override.id||"",calculationStatus:text(row.status),calculationError:result.error||""};
    });
    return {year,costs};
  }
  function selectedYears(data,fromYear,toYear) { const years=[...datasetsFor(data).keys()].sort((a,b)=>a-b); if(!years.length){const y=yearOf(data);return y?[y]:[];} const from=Number(fromYear)||years[0],to=Number(toYear)||years.at(-1);return years.filter(year=>year>=Math.min(from,to)&&year<=Math.max(from,to)); }
  function sumRows(rows,key){return round(rows.reduce((sum,row)=>sum+number(row[key]),0));}
  function groupByYear(years, rows, valueFn) { const result={}; years.forEach(y=>result[y]=0); rows.forEach(row=>{const y=Number(row.year||row.paymentYear);if(Object.prototype.hasOwnProperty.call(result,y))result[y]=round(result[y]+number(valueFn(row)));}); return result; }
  function totalMap(map){return round(Object.values(map).reduce((sum,value)=>sum+number(value),0));}

  function model(data=requireDeps().stateAccess.current(), options={}) {
    const container=readData(data); const years=selectedYears(data,options.fromYear,options.toYear); const datasets=datasetsFor(data);
    const costYears=years.map(year=>costYearModel(datasets.get(year)||data,year,container)); const costRows=costYears.flatMap(row=>row.costs);
    const payments=container.payments.filter(row=>years.includes(Number(row.paymentYear)));
    const allocations=container.allocations.filter(row=>years.includes(Number(row.year)));
    const incomeMaps={
      prepayment:groupByYear(years,payments.filter(r=>r.paymentType==="prepayment"),r=>r.amount),
      additionalPayment:groupByYear(years,payments.filter(r=>r.paymentType==="additional-payment"),r=>r.amount),
      refund:groupByYear(years,payments.filter(r=>r.paymentType==="refund"),r=>r.amount),
      correction:groupByYear(years,payments.filter(r=>r.paymentType==="correction"),r=>r.amount)
    };
    const incomeByYear={}; years.forEach(y=>incomeByYear[y]=round(incomeMaps.prepayment[y]+incomeMaps.additionalPayment[y]+incomeMaps.refund[y]+incomeMaps.correction[y]));
    const costsByCategory={
      allocable:groupByYear(years,costRows.filter(r=>r.analysisCategory==="allocable"),r=>r.analysisAmount),
      nonAllocated:groupByYear(years,costRows.filter(r=>r.analysisCategory==="non-allocated"),r=>r.analysisAmount),
      other:groupByYear(years,costRows.filter(r=>!["allocable","non-allocated"].includes(r.analysisCategory)),r=>r.analysisAmount)
    };
    const costsByYear={}; years.forEach(y=>costsByYear[y]=round(costsByCategory.allocable[y]+costsByCategory.nonAllocated[y]+costsByCategory.other[y]));
    const automatic={
      vacancy:groupByYear(years,costRows,r=>r.vacancyShare),
      "non-allocated":groupByYear(years,costRows,r=>r.nonAllocated)
    };
    const categories={}; CATEGORIES.forEach(cat=>{const manual=groupByYear(years,allocations.filter(r=>r.category===cat.value),r=>r.amount); const values={}; years.forEach(y=>values[y]=round((automatic[cat.value]?automatic[cat.value][y]:0)+manual[y])); categories[cat.value]={key:cat.value,label:cat.label,byYear:values,total:totalMap(values),automaticTotal:automatic[cat.value]?totalMap(automatic[cat.value]):0,manualTotal:totalMap(manual),records:allocations.filter(r=>r.category===cat.value)};});
    const differenceByYear={}; const explanationByYear={}; const controlByYear={}; years.forEach(y=>{differenceByYear[y]=round(costsByYear[y]-incomeByYear[y]); explanationByYear[y]=round(CATEGORIES.reduce((sum,cat)=>sum+categories[cat.value].byYear[y],0)); controlByYear[y]=round(differenceByYear[y]-explanationByYear[y]);});
    const difference=totalMap(differenceByYear), explanation=totalMap(explanationByYear), control=round(difference-explanation), open=categories.open.total;
    const unchecked=allocations.filter(row=>row.status!=="checked").length; const unbooked=payments.filter(row=>row.status!=="booked").length;
    let status="Nicht begonnen"; let statusCode="not-started";
    if (costRows.length||payments.length||allocations.length) { status="In Bearbeitung";statusCode="working"; }
    if (Math.abs(control)<=TOLERANCE && (costRows.length||payments.length||allocations.length)) {status="Rechnerisch vollständig";statusCode="balanced";}
    if (Math.abs(control)<=TOLERANCE && Math.abs(open)>TOLERANCE) {status="Offene Differenz vorhanden";statusCode="open-difference";}
    else if (Math.abs(control)<=TOLERANCE && Math.abs(open)<=TOLERANCE && (unchecked||unbooked)) {status="Prüfentscheidung erforderlich";statusCode="review-required";}
    else if (Math.abs(control)<=TOLERANCE && Math.abs(open)<=TOLERANCE && container.release.status==="checked") {status="Vollständig geprüft";statusCode="checked";}
    else if (Math.abs(control)<=TOLERANCE && Math.abs(open)<=TOLERANCE && container.release.status==="released") {status="Für Abschluss freigegeben";statusCode="released";}
    return Object.freeze({
      version:VERSION,years:Object.freeze(years),fromYear:years[0]||0,toYear:years.at(-1)||0,container:Object.freeze(container),payments:Object.freeze(payments),allocations:Object.freeze(allocations),costRows:Object.freeze(costRows),
      income:Object.freeze({maps:incomeMaps,byYear:incomeByYear,total:totalMap(incomeByYear)}), costs:Object.freeze({maps:costsByCategory,byYear:costsByYear,total:totalMap(costsByYear)}),
      differenceByYear:Object.freeze(differenceByYear),difference,categories:Object.freeze(categories),explanationByYear:Object.freeze(explanationByYear),explanation,controlByYear:Object.freeze(controlByYear),control,open,
      status,statusCode,uncheckedDecisions:unchecked,unbookedPayments:unbooked,allChecked:Math.abs(control)<=TOLERANCE&&Math.abs(open)<=TOLERANCE&&!unchecked&&!unbooked,release:Object.freeze(container.release),
      warnings:Object.freeze([payments.length?"":"Keine tatsächlichen Zahlungsflüsse erfasst; Soll-Vorauszahlungen werden nicht als Einnahmen verwendet.",Math.abs(control)>TOLERANCE?"Die Differenz ist rechnerisch noch nicht vollständig Kategorien zugeordnet.":"",Math.abs(open)>TOLERANCE?"Eine offene Differenz bleibt fachlich zu prüfen.":""].filter(Boolean))
    });
  }
  function assignRemainingToOpen(options={}) { const current=model(requireDeps().stateAccess.current(),options); if(Math.abs(current.control)<=TOLERANCE)return {changed:false,message:"Keine rechnerische Restdifferenz vorhanden."}; const year=Number(options.year)||current.toYear||current.fromYear; return saveAllocation({category:"open",year,amount:current.control,allocationKey:"Manuelle Zuordnung",source:"Kontrollrechnung",reason:"Noch ungeklärter Restbetrag aus der Kontrollrechnung",checked:false,updatedBy:text(options.updatedBy)}); }

  function describe(){return Object.freeze({configured:!!deps,version:VERSION,rootKey:ROOT_KEY,paymentTypes:PAYMENT_TYPES.length,categories:CATEGORIES.length});}
  global.NKProCostReconciliation=Object.freeze({VERSION,ROOT_KEY,SCOPE,TOLERANCE,PAYMENT_TYPES,CATEGORIES,ALLOCATION_KEYS,configure,describe,ensureData,readData,model,savePayment,removePayment,saveCostOverride,removeCostOverride,saveAllocation,removeAllocation,setRelease,assignRemainingToOpen,normalizedPaymentAmount});
})(globalThis);
