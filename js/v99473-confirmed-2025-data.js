(function(global){
  "use strict";

  const MIGRATION_ID = "confirmed-2025-operating-data-v99.4.73";
  const VERSION = "V99.4.73";
  const PERIOD_START = "2025-01-01";
  const PERIOD_END = "2025-12-31";
  const WATER_READING_DATE = "2025-12-30";

  const WATER_BY_UNIT = Object.freeze({
    "W000.UG": Object.freeze({ cold:564.40, hot:312.42 }),
    "W001.EG-L": Object.freeze({ cold:297.74, hot:119.28 }),
    "W002.EG-R": Object.freeze({ cold:128.06, hot:29.66 }),
    "W003.1OG-L": Object.freeze({ cold:178.34, hot:63.32 }),
    "W004.1OG-R": Object.freeze({ cold:231.28, hot:282.68 }),
    "W005.DG-L": Object.freeze({ cold:123.55, hot:143.58 }),
    "W006.DG-R": Object.freeze({ cold:137.01, hot:110.99 })
  });

  const TECHEM_CASES = Object.freeze({
    "tenant:M001:W001.EG-L:2025-01-01:2025-12-31": Object.freeze({
      amount:2252.81, provider:"Techem Energy Services GmbH", externalUserId:"0002/0-18", providerLocation:"EGL",
      heatingCost:1956.30, heatingBaseCost:387.74, heatingConsumptionCost:1568.56, warmWaterCost:296.51,
      hkvUnits:12151, co2TenantShare:80.41, co2OwnerShare:80.41, externalPrepayment:1221.00
    }),
    "tenant:M002:W002.EG-R:2025-01-01:2025-12-31": Object.freeze({
      amount:962.56, provider:"Techem Energy Services GmbH", externalUserId:"0003/0-19", providerLocation:"EGR",
      heatingCost:713.49, heatingBaseCost:325.70, heatingConsumptionCost:387.79, warmWaterCost:249.07,
      hkvUnits:3004, co2TenantShare:34.53, co2OwnerShare:34.53, externalPrepayment:840.00
    }),
    "tenant:M003:W003.1OG-L:2025-01-01:2025-12-31": Object.freeze({
      amount:1651.00, provider:"Techem Energy Services GmbH", externalUserId:"0004/0-21", providerLocation:"1GL",
      heatingCost:1354.48, heatingBaseCost:387.73, heatingConsumptionCost:966.75, warmWaterCost:296.52,
      hkvUnits:7489, co2TenantShare:59.04, co2OwnerShare:59.04, externalPrepayment:1581.00
    }),
    "tenant:M004:W004.1OG-R:2025-01-01:2025-12-31": Object.freeze({
      amount:1299.72, provider:"Techem Energy Services GmbH", externalUserId:"0005/0-19", providerLocation:"1GR",
      heatingCost:1050.65, heatingBaseCost:325.69, heatingConsumptionCost:724.96, warmWaterCost:249.07,
      hkvUnits:5616, co2TenantShare:46.50, co2OwnerShare:46.50, externalPrepayment:840.00
    }),
    "vacancy:W005.DG-L:2025-01-01:2025-12-31": Object.freeze({
      amount:575.49, provider:"Techem Energy Services GmbH", externalUserId:"0006/0-18", providerLocation:"DGL",
      heatingCost:328.79, heatingBaseCost:322.60, heatingConsumptionCost:6.19, warmWaterCost:246.70,
      hkvUnits:48, co2TenantShare:20.78, co2OwnerShare:20.78, externalPrepayment:0
    }),
    "vacancy:W006.DG-R:2025-01-01:2025-12-31": Object.freeze({
      amount:488.08, provider:"Techem Energy Services GmbH", externalUserId:"0007/0-15", providerLocation:"DGR",
      heatingCost:276.97, heatingBaseCost:276.07, heatingConsumptionCost:0.90, warmWaterCost:211.11,
      hkvUnits:7, co2TenantShare:17.63, co2OwnerShare:17.63, externalPrepayment:0
    }),
    "private:M000:W000.UG:2025-01-01:2025-12-31": Object.freeze({
      amount:2732.43, provider:"Techem Energy Services GmbH", externalUserId:"0008/0-10", providerLocation:"KG",
      heatingCost:2421.68, heatingBaseCost:406.34, heatingConsumptionCost:2015.34, warmWaterCost:310.75,
      hkvUnits:15612, co2TenantShare:97.46, co2OwnerShare:97.46, externalPrepayment:0
    })
  });

  const TECHEM_SUMMARY = Object.freeze({
    provider:"Techem Energy Services GmbH",
    billingUnitNumber:"0102/00488",
    customerNumber:"00501933",
    periodStart:PERIOD_START,
    periodEnd:PERIOD_END,
    statementDate:"2026-07-07",
    totalCost:9965.97,
    heatingCost:8106.24,
    warmWaterCost:1859.73,
    hkvUnits:43957,
    co2Total:712.98,
    co2TenantShare:356.49,
    co2OwnerShare:356.49,
    includedOwnerShare:3.88,
    includedOwnerShareLabel:"Techem-Sammelposition „Für NE 2–7“",
    includedOwnerHkvUnits:30,
    source:"Techem Gesamtabrechnung 2025",
    note:"Die Sammelposition 3,88 € wird vollständig vom Vermieter getragen. Der CO₂-Vermieteranteil 356,49 € liegt außerhalb der zu verteilenden 9.965,97 € und darf nicht erneut auf Teilnehmer umgelegt werden."
  });

  function num(value){ const n=Number(value); return Number.isFinite(n)?n:0; }
  function text(value){ return String(value == null ? "" : value); }
  function ensureArray(value){ return Array.isArray(value)?value:[]; }
  function findCost(data,id){ return ensureArray(data.kostenarten).find(row=>row&&row.id===id)||null; }
  function ensureMeta(data){ if(!data.meta||typeof data.meta!=="object"||Array.isArray(data.meta)) data.meta={}; if(!Array.isArray(data.meta.standardMigrations)) data.meta.standardMigrations=[]; return data.meta; }
  function alreadyApplied(data){ const meta=ensureMeta(data); return meta.standardMigrations.some(item=>item&&item.id===MIGRATION_ID); }
  function isTarget(data){ return !!(data&&typeof data==="object"&&!Array.isArray(data)&&!(data.meta&&data.meta.archiveViewer)&&text(data.meta&&data.meta.abrechnungsjahr)==="2025"); }

  function applyWater(data){
    const cost=findCost(data,"K002");
    if(cost){
      cost.gesamtbetrag=1642.31;
      cost.gesamtverbrauch=275;
      cost.preisProEinheit=Math.round((1642.31/275)*10000)/10000;
      cost.preisProEinheitManuell=false;
      cost.bemerkung="Wasserwerksrechnung 2025: Hauszähler 911 → 1.186 m³, Gesamtverbrauch 275 m³, Gesamtjahresgebühren 1.642,31 €. Wohnungsendstände laut Ableseliste vom 30.12.2025.";
      cost.status="Vollständig";
    }
    if(!data.waterMeters||typeof data.waterMeters!=="object"||Array.isArray(data.waterMeters)) data.waterMeters={};
    if(!data.waterMeters.settings||typeof data.waterMeters.settings!=="object"||Array.isArray(data.waterMeters.settings)) data.waterMeters.settings={};
    Object.assign(data.waterMeters.settings,{
      enabled:"Ja", houseWaterTotal:275, houseMeterNumber:"22-32-74-51",
      houseMeterStart:911, houseMeterStartDate:PERIOD_START,
      houseMeterEnd:1186, houseMeterEndDate:PERIOD_END,
      houseInvoiceNote:"Wasserwerksrechnung 2025 · 1.642,31 € · Hauswasserzähler 22-32-74-51"
    });
    if(!Array.isArray(data.waterMeters.readings)) data.waterMeters.readings=[];
    const tenants=ensureArray(data.mieter);
    while(data.waterMeters.readings.length<Math.max(20,tenants.length)) data.waterMeters.readings.push({kwStart:0,kwStartDate:"",kwEnd:0,kwEndDate:"",wwStart:0,wwStartDate:"",wwEnd:0,wwEndDate:"",bemerkung:""});
    tenants.forEach((tenant,index)=>{
      const unitId=text(tenant&&tenant.wohnung);
      const values=WATER_BY_UNIT[unitId]; if(!values) return;
      const row=data.waterMeters.readings[index]||{};
      row.kwEnd=values.cold; row.kwEndDate=WATER_READING_DATE;
      row.wwEnd=values.hot; row.wwEndDate=WATER_READING_DATE;
      row.bemerkung="Tatsächliche Jahresendablesung 2025 vom 30.12.2025.";
      data.waterMeters.readings[index]=row;
    });
    if(!data.waterMeterHistory||typeof data.waterMeterHistory!=="object"||Array.isArray(data.waterMeterHistory)) data.waterMeterHistory={units:[]};
    if(!Array.isArray(data.waterMeterHistory.units)) data.waterMeterHistory.units=[];
    Object.entries(WATER_BY_UNIT).forEach(([unitId,values])=>{
      let unit=data.waterMeterHistory.units.find(row=>row&&row.wohnung===unitId);
      if(!unit){ unit={wohnung:unitId,bezeichnung:unitId,readings:[],deltas:[]}; data.waterMeterHistory.units.push(unit); }
      if(!Array.isArray(unit.readings)) unit.readings=[];
      const existing=unit.readings.find(row=>Number(row&&row.jahr)===2025);
      const record={jahr:2025,kw:values.cold,ww:values.hot,gesamt:Math.round((values.cold+values.hot)*100)/100,datum:WATER_READING_DATE,quelle:"Wasserablesung 2025"};
      if(existing) Object.assign(existing,record); else unit.readings.push(record);
      unit.readings.sort((a,b)=>num(a&&a.jahr)-num(b&&b.jahr));
    });
    if(!data.waterMeterHistory.houseConnection||typeof data.waterMeterHistory.houseConnection!=="object"||Array.isArray(data.waterMeterHistory.houseConnection)) data.waterMeterHistory.houseConnection={};
    Object.assign(data.waterMeterHistory.houseConnection,{
      zaehlernummer:"22-32-74-51",
      wertAnfang2025:911,
      wertEnde2025:1186,
      verbrauch2025:275,
      jahresgebuehren2025:1642.31,
      quelle2025:"Wasserwerksrechnung 2025"
    });
  }

  function applyWaste(data){
    const cost=findCost(data,"K009"); if(!cost) return;
    cost.gesamtbetrag=1503.00;
    cost.bemerkung="Gebührenbescheid Abfallentsorgung/Müllbeseitigung 2025: 1.503,00 €.";
    cost.status="Vollständig";
  }

  function applyTechem(data){
    const cost=findCost(data,"K006");
    if(cost){
      cost.gesamtbetrag=9965.97;
      cost.bemerkung="Techem Gesamtabrechnung 2025 vom 07.07.2026. Zu verteilende Heiz- und Warmwasserkosten 9.965,97 €. Sammelposition 3,88 € trägt der Vermieter.";
      cost.status="Vollständig";
      cost.berechnungsart="Manuell je Mieter";
      cost.umlageschluessel="Manuelle Eingabe je Mieter/Wohneinheit";
    }
    if(!data.umlageInputs||typeof data.umlageInputs!=="object"||Array.isArray(data.umlageInputs)) data.umlageInputs={};
    let input=data.umlageInputs.K006;
    if(!input||typeof input!=="object"||Array.isArray(input)) input=data.umlageInputs.K006={kostenId:"K006",kostenart:"Heiz- und Warmwasserkosten",values:[],caseValues:{}};
    input.kostenart="Heiz- und Warmwasserkosten";
    input.mode="Externe Einzelabrechnung";
    input.art="Externe Einzelabrechnung";
    if(!Array.isArray(input.values)) input.values=[];
    while(input.values.length<Math.max(20,ensureArray(data.mieter).length)) input.values.push(0);
    if(!input.caseValues||typeof input.caseValues!=="object"||Array.isArray(input.caseValues)) input.caseValues={};
    Object.entries(TECHEM_CASES).forEach(([caseKey,raw])=>{
      const previous=input.caseValues[caseKey]&&typeof input.caseValues[caseKey]==="object"?input.caseValues[caseKey]:{};
      input.caseValues[caseKey]=Object.assign({},previous,raw,{
        value:raw.amount,
        source:"Techem Gesamtabrechnung 2025",
        recordedAt:"2026-07-07",
        updatedAt:"2026-08-13T22:46:00+02:00",
        note:"Techem 2025 · Nutzer " + raw.externalUserId + " · Lage " + raw.providerLocation
      });
    });
    ensureArray(data.mieter).forEach((tenant,index)=>{
      const tenantId=text(tenant&&tenant.id);
      if(!tenantId) return;
      const entry=Object.entries(TECHEM_CASES).find(([key])=>key.startsWith("tenant:"+tenantId+":")||key.startsWith("private:"+tenantId+":"));
      if(entry) input.values[index]=entry[1].amount;
    });
    input.externalBilling=Object.assign({},input.externalBilling||{},TECHEM_SUMMARY);
    input.importSource="Techem Gesamtabrechnung 2025";
    input.importedAt="2026-08-13T22:46:00+02:00";
    input.importFormat="Strukturierte externe Einzelabrechnung mit Techem-Nutzer-, HKV- und CO₂-Nachweisdaten";
    input.importErrors=[];
  }

  function apply(data,options={}){
    if(!isTarget(data)) return {changed:false,reason:"not-2025-working-state"};
    if(alreadyApplied(data)&&options.force!==true) return {changed:false,reason:"already-applied"};
    applyWater(data); applyWaste(data); applyTechem(data);
    const meta=ensureMeta(data);
    if(!meta.standardMigrations.some(item=>item&&item.id===MIGRATION_ID)) meta.standardMigrations.push({
      id:MIGRATION_ID,
      completedAt:options.completedAt||"2026-08-13T22:46:00+02:00",
      appVersion:options.appVersion||VERSION,
      dataSchemaVersion:Number(meta.dataSchemaVersion||5),
      note:"Bestätigte 2025-Echtdaten dauerhaft übernommen: Wohnungs-Wasserendstände, Wasserwerksrechnung, Hauswasserzählernummer, Müllgebühren und strukturierte Techem-Heiz-/Warmwasserkosten einschließlich HKV-/CO₂-Nachweisdaten und 3,88 € Vermieter-Sammelposition."
    });
    meta.confirmed2025Evidence={
      version:1, appliedWithAppVersion:options.appVersion||VERSION,
      water:{invoiceTotal:1642.31,houseStart:911,houseEnd:1186,houseConsumption:275,houseMeterNumber:"22-32-74-51",readingDate:WATER_READING_DATE},
      waste:{invoiceTotal:1503.00},
      techem:{total:9965.97,participantAndVacancyCases:9962.09,includedOwnerShare:3.88,co2OwnerShare:356.49,statementDate:"2026-07-07"}
    };
    return {changed:true,reason:"applied"};
  }

  global.NKProConfirmed2025Data=Object.freeze({
    MIGRATION_ID, WATER_BY_UNIT, TECHEM_CASES, TECHEM_SUMMARY, apply
  });
})(globalThis);
