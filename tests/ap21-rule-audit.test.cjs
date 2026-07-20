"use strict";
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const assert=(value,message)=>{if(!value)throw new Error(message);};

function loadRules(){
  const sandbox={
    console,
    visibleTenantRows:()=>[], billableTenantRows:()=>[], privateTenantRows:()=>[],
    periodStart:()=>"", periodEnd:()=>"",
    calculateUmlage:()=>({tenantResults:[]}), umlageTotals:()=>({}), briefResultRows:()=>[],
    NK_PRO_MODULES:{qualityAssurance:{tenantQualityLabel:()=>""}},
    DATA_SCHEMA_VERSION:5, DATA_LAYER_CONTRACT_VERSION:1
  };
  sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read("js/quality-rules.js"),sandbox,{filename:"js/quality-rules.js"});
  return sandbox.NKProQualityRules;
}

function testData(meta){
  return {
    meta:{dataSchemaVersion:5,dataLayerContractVersion:1,...meta},
    wohnungen:[],mieter:[],kostenarten:[],jahresArchiv:[],umlageInputs:{},
    waterMeters:{settings:{},readings:[]},zaehlerDaten:{messperioden:[],zaehler:[]},
    prepaymentAdjustmentSettings:{},briefSettings:{}
  };
}

function fach001(api,meta){
  return api.evaluate(testData(meta),{includeTechnical:false}).results.find(row=>row.ruleId==="NKP-FACH-001");
}

function main(){
  const api=loadRules();
  const rule=api.REGISTRY.find(row=>row.id==="NKP-FACH-001");
  const html=read("index.html");
  const ui=read("js/ui-navigation-pages.js");
  const workflow=read("js/billing-workflow.js");
  const bindings=read("js/ui-bindings.js");
  const context=read("js/billing-context.js");

  assert(rule&&rule.targetTab==="start"&&rule.targetSelector==="#billingPeriodSettings","NKP-FACH-001 besitzt keinen echten Perioden-Direkteinstieg.");
  assert(rule.dataSource.includes("abrechnungsjahr"),"Abrechnungsjahr fehlt in der Regel-Datenquelle.");

  let row=fach001(api,{abrechnungsjahr:"2025",abrechnungsbeginn:"2025-02-30",abrechnungsende:"2025-12-31"});
  assert(row.status==="Kritischer Abrechnungsmangel"&&row.details.includes("kein existierendes Kalenderdatum"),"Unmögliche Kalendertage werden nicht blockiert.");

  row=fach001(api,{abrechnungsjahr:"2025",abrechnungsbeginn:"01.01.2025",abrechnungsende:"2025-12-31"});
  assert(row.status==="Kritischer Abrechnungsmangel"&&row.details.includes("Format YYYY-MM-DD"),"Formatabweichungen werden nicht eindeutig erkannt.");

  row=fach001(api,{abrechnungsjahr:"2025",abrechnungsbeginn:"2025-12-31",abrechnungsende:"2025-01-01"});
  assert(row.status==="Kritischer Abrechnungsmangel"&&row.details.includes("Ende liegt vor dem Beginn"),"Umgekehrte Perioden werden nicht blockiert.");

  row=fach001(api,{abrechnungsjahr:"2024",abrechnungsbeginn:"2025-01-01",abrechnungsende:"2025-12-31"});
  assert(row.status==="Kritischer Abrechnungsmangel"&&row.details.includes("entspricht nicht dem Endjahr 2025"),"Jahresinkonsistenz wird nicht blockiert.");

  row=fach001(api,{abrechnungsjahr:"2025",abrechnungsbeginn:"2025-02-01",abrechnungsende:"2025-02-28"});
  assert(row.status==="Bestanden"&&row.values.durationDays===28,"Gültige Teilperioden werden nicht akzeptiert.");

  row=fach001(api,{abrechnungsjahr:"2025",abrechnungsbeginn:"2024-12-15",abrechnungsende:"2025-01-14"});
  assert(row.status==="Bestanden"&&row.values.durationDays===31,"Gültige jahresübergreifende Perioden werden nicht akzeptiert.");

  assert(html.includes('id="billingPeriodSection"')&&html.includes('id="billingPeriodSettings"'),"Periodenbereich auf der Abrechnungsübersicht fehlt.");
  assert(ui.includes("function renderBillingPeriodSettings()")&&ui.includes('data-ui-action="billing.syncPeriodYear"'),"Periodenbereich oder Jahresabgleich wird nicht gerendert.");
  assert(ui.includes("billingContext.isEditing()")&&ui.includes("Nur ansehen"),"Bearbeitungs- und Ansichtsmodus werden im Periodenbereich nicht unterschieden.");
  assert(workflow.includes("function syncPeriodYear()")&&bindings.includes('"billing.syncPeriodYear"')&&context.includes('"billing.syncPeriodYear"'),"Jahresabgleich ist nicht vollständig verdrahtet oder nicht schreibgeschützt.");

  process.stdout.write("AP21 Regelprüfung 1 bestanden: NKP-FACH-001 prüft echte ISO-Kalenderdaten, Reihenfolge und Endjahr; Teil- und jahresübergreifende Perioden bleiben zulässig.\n");
}
try{main();}catch(error){process.stderr.write("FEHLER: "+error.message+"\n");process.exit(1);}
