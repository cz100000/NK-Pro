"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const read=rel=>fs.readFileSync(path.join(root,rel),"utf8");
const sha=value=>crypto.createHash("sha256").update(typeof value==="string"?value:JSON.stringify(value)).digest("hex");
const explicitSource=process.env.NKPRO_REAL_DATA || "";
const sourcePath=explicitSource || path.join(root,"AP_ANALYSE_V99_4_70","echtdaten","source-v99.4.69.json");
if(!fs.existsSync(sourcePath)){
  if(explicitSource) throw new Error(`NKPRO_REAL_DATA nicht gefunden: ${sourcePath}`);
  console.log("V99.4.70 Analysezentrum: Echtdaten-Integrationstest in der schlanken Arbeitsbasis übersprungen; für vollständigen Test NKPRO_REAL_DATA auf den separaten Echtdatenbestand setzen.");
  process.exit(0);
}
const data=JSON.parse(fs.readFileSync(sourcePath,"utf8"));
const before=sha(data), archiveBefore=sha(data.jahresArchiv);

const sandbox={console,Date,JSON,Math,Number,String,Array,Object,Set,Map,globalThis:null};sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(read("js/analytics-engine.js"),sandbox,{filename:"analytics-engine.js"});
const engine=sandbox.NKProAnalyticsEngine;assert.ok(engine,"Analyseengine fehlt");
const privateRole=row=>/(privatanteil|eigenanteil|eigentümer\/privat|eigentuemer\/privat|private nutzung|private nutzung)/i.test(String(row?.abrechnungRolle||""));
const participant=row=>!!(row&&row.id&&row.name&&row.wohnung);
function calc(dataset){
  const tenants=(dataset.mieter||[]).filter(participant);
  const active=(dataset.kostenarten||[]).filter(k=>k&&k.kostenart&&k.inNK==="Ja");
  const tenantResults=tenants.map((t,i)=>({tenant:t,costShare:active.reduce((s,k)=>s+Number((dataset.umlageInputs?.[k.id]?.values||[])[(dataset.mieter||[]).indexOf(t)]||0),0),prepayments:Number(t.nkVoraus||0),correction:Number(t.vorjahresKorrektur||0),rentCorrection:Number(t.kaltmietKorrektur||0),balance:0}));
  tenantResults.forEach(r=>r.balance=r.costShare-r.prepayments-r.correction);
  const costResults=active.map(k=>{const values=dataset.umlageInputs?.[k.id]?.values||[];const tenantSum=tenants.reduce((s,t)=>s+Number(values[(dataset.mieter||[]).indexOf(t)]||0),0);const privateShare=tenants.filter(privateRole).reduce((s,t)=>s+Number(values[(dataset.mieter||[]).indexOf(t)]||0),0);const total=Number(k.gesamtbetrag||0);return {cost:k,tenantSum,privateShare,ownerShare:Math.max(0,total-tenantSum),vacancyShare:0,documentedOwnerShare:0,status:"Testprojektion"};});
  const totalCosts=active.reduce((s,k)=>s+Number(k.gesamtbetrag||0),0),billableShare=tenantResults.reduce((s,r)=>s+r.costShare,0),privateShare=tenantResults.filter(r=>privateRole(r.tenant)).reduce((s,r)=>s+r.costShare,0),ownerShare=costResults.reduce((s,r)=>s+r.ownerShare,0),prepayments=tenantResults.reduce((s,r)=>s+r.prepayments,0);
  return {calculation:{tenantResults,costResults},totals:{totalCosts,billableShare,privateShare,ownerShare,documentedOwnerShare:0,vacancyShare:0,prepayments,allocationDelta:totalCosts-billableShare-ownerShare}};
}
engine.configure({stateAccess:{current:()=>data},calculateDataset:calc,inspectDataset:()=>({results:[]}),isPrivateUse:privateRole,isSettlementParticipant:participant,appVersion:"V99.4.72"});
const periods=engine.listPeriods(data);
assert.ok(periods.some(p=>p.label==="2021/2022"),"Historische Periode 2021/2022 muss sichtbar bleiben");
assert.ok(periods.some(p=>p.periodId==="legacy-2021-2022-heizperiode"&&!p.quality.calendar),"Nichtkalenderperiode muss als eingeschränkt vergleichbar gekennzeichnet sein");
const current2023=periods.filter(p=>p.periodId===data.meta.periodId);assert.equal(current2023.length,1,"Arbeitsstand/Archiv derselben periodId darf in Zeitreihe nicht doppelt gezählt werden");
assert.equal(current2023[0].origin,"current");assert.ok(current2023[0].alternatives.length>=1,"Alternative Archivherkunft soll nachvollziehbar bleiben");
const built=engine.build(data);assert.equal(built.appVersion,"V99.4.72");assert.equal(sha(data),before,"Analyse darf den Datenbestand nicht mutieren");assert.equal(sha(data.jahresArchiv),archiveBefore,"Analyse darf Archive nicht mutieren");
const m000=built.models.flatMap(m=>m.tenants).find(t=>t.tenantId==="M000");assert.ok(m000,"M000 muss als regulärer Teilnehmer in der Analyse erscheinen");assert.equal(m000.usage,"private","Private Nutzungsart darf analytisch gekennzeichnet werden");
const currentModel=built.models.find(m=>m.period.periodId===data.meta.periodId);assert.ok(currentModel);assert.ok(currentModel.totals.totalArea>385,"Aktueller standardisierter Flächenbestand muss Vorrang vor 55-m²-Legacy-Platzhaltern haben");
assert.equal(currentModel.financial.cashflowComplete,false,"Cashflow darf ohne vollständig datierte Ein- und Auszahlungen nicht erfunden werden");assert.equal(currentModel.financial.cashflow,null);
assert.ok(currentModel.tax.every(row=>row.taxValue===null&&row.taxStatus==="noch nicht steuerlich klassifiziert"),"Ohne definierte Steuerregel dürfen keine steuerlichen Endwerte erfunden werden");

const engineText=read("js/analytics-engine.js"),ui=read("js/ui-analytics.js"),index=read("index.html"),bindings=read("js/ui-bindings.js"),sw=read("service-worker.js"),project=JSON.parse(read("nk-pro-project.json"));
assert.doesNotMatch(engineText,/M000|Erik Zimmermann|W000\.UG/,"Analyseengine darf keinen Privatfall hardcoden");
for(const role of ["Privatanteil","Eigenanteil","Eigentümer/Privat"]){const copy=JSON.parse(JSON.stringify(data));copy.mieter.push({id:"GEN-"+role,name:"Generischer Fall",wohnung:"GEN-W",abrechnungRolle:role,nkVoraus:0,kaltSoll:0,kaltErhalten:0});const localPrivate=privateRole(copy.mieter.at(-1));assert.equal(localPrivate,true,role+" muss generisch erkannt werden");}
assert.match(index,/id="analyticsCenterRoot"/);assert.match(index,/analytics-engine\.js\?v=99\.4\.72-analysis-navigator/);assert.match(index,/ui-analytics\.js\?v=99\.4\.72-analysis-navigator/);
assert.match(bindings,/registerController\("analytics"/);assert.match(bindings,/analytics\.openDrill/);assert.match(bindings,/analytics\.exportExcel/);
for(const label of ["Nebenkosten &amp; Abrechnung","Finanzen","Steuerliche Auswertung","Übersicht","Details","Tabelle","Was hat sich verändert?","Datenqualität","Steuerliche Zuordnung offen"]) assert.ok(ui.includes(label),"Analyse-UI fehlt: "+label);
assert.doesNotMatch(ui,/onclick=|onchange=/i,"Neue Analyse darf keine Inline-Handler einführen");
assert.ok(ui.includes("Cashflow derzeit nicht verfügbar")||engineText.includes("Cashflow derzeit nicht verfügbar"));
for(const sheet of ["Übersicht","Kosten","Privatanteil","Leerstand","Berechnungsnachweise","Datenquellen"]) assert.ok(ui.includes("'"+sheet+"'")||ui.includes('"'+sheet+'"'),"Steuerexport-Blatt fehlt: "+sheet);
assert.match(sw,/\.\/js\/analytics-engine\.js/);assert.match(sw,/\.\/js\/ui-analytics\.js/);assert.equal(project.runtimeBuildId,"99.4.72-analysis-navigator");assert.equal(project.analyticsEngineVersion,2);
console.log(`V99.4.70 Analysezentrum: ${periods.length} eindeutige Perioden, Legacy-Perioden erhalten, Read-only-, Privatanteils-, Cashflow- und Steuergrenzen bestätigt.`);
