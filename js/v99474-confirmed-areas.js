"use strict";
(function(global){
  const MIGRATION_ID="confirmed-arb5-apartment-areas-v99.4.74";
  const AREA_BY_UNIT=Object.freeze({
    "W000.UG":65,
    "W001.EG-L":62.5,
    "W002.EG-R":52.5,
    "W003.1OG-L":62.5,
    "W004.1OG-R":52.5,
    "W005.DG-L":52,
    "W006.DG-R":44.5
  });
  const has=Object.prototype.hasOwnProperty;
  function isTarget(data){
    if(!data||typeof data!=="object"||Array.isArray(data))return false;
    const meta=data.meta||{};
    return String(meta.abrechnungsjahr)==="2025" && !meta.archiveViewer && !meta.currentBillingFinalized;
  }
  function replacePlaceholder(rows,key,getId,changes,conflicts){
    if(!Array.isArray(rows))return;
    rows.forEach(row=>{
      if(!row||typeof row!=="object")return;
      const id=getId(row);
      if(!has.call(AREA_BY_UNIT,id))return;
      const desired=AREA_BY_UNIT[id];
      const old=row[key],number=Number(old);
      if(old===undefined||old===null||old===""||!Number.isFinite(number)||number===0||number===55){
        row[key]=desired;
        changes.push({id,from:old===undefined?null:old,to:desired});
      }else if(Math.abs(number-desired)>1e-9){
        conflicts.push({id,value:old,expected:desired}); // Preserve intentional, non-placeholder entries.
      }
    });
  }
  function apply(data){
    if(!isTarget(data))return {changed:false,reason:"not-open-2025-working-state"};
    const meta=data.meta;
    if(!Array.isArray(meta.standardMigrations))meta.standardMigrations=[];
    if(meta.standardMigrations.some(item=>item&&item.id===MIGRATION_ID))return {changed:false,reason:"already-applied"};
    const changes=[],conflicts=[];
    replacePlaceholder(data.wohnungen,"wohnflaeche",row=>String(row.id||""),changes,conflicts);
    replacePlaceholder(data.mieter,"wohnflaeche",row=>String(row.wohnung||""),changes,conflicts);
    if(data.stammdaten&&typeof data.stammdaten==="object"){
      replacePlaceholder(data.stammdaten.wohnungen,"wohnflaeche",row=>String(row.id||row.einheitId||""),changes,conflicts);
      replacePlaceholder(data.stammdaten.mieter,"wohnflaeche",row=>String(row.wohnung||""),changes,conflicts);
    }
    // normalizeObjectStandard() runs after this migration and derives its canonical unit areas from stammdaten.
    meta.standardMigrations.push({id:MIGRATION_ID,completedAt:"2026-11-21",appVersion:"V99.4.74",dataSchemaVersion:Number(meta.dataSchemaVersion||5),note:"ARB5 Wohnflächen gemäß bestätigtem NK-Pro-Raster 21.07.2026 und FinAx 22.09.2026; bestehende 55-m²-Platzhalter ersetzt, manuelle Nicht-Platzhalter geschützt; Archive unverändert."});
    meta.apartmentAreas2025Evidence={source:"FinAx INTERN vom 22SEP2026.xlsx, Abschnitt 5 + bestätigtes NK-Pro-Raster 21.07.2026",totalArea:391.5,privateArea:65,privateShare:65/391.5,techemDifference:"Techem 2025 verwendet für KG 65,5 m² statt 65,0 m² und dadurch 392,0 m². Externe Techem-Heizkostenbeträge werden unverändert übernommen.",reviewConflicts:conflicts};
    return {changed:true,reason:"areas-checked",valuesUpdated:changes.length,conflicts};
  }
  global.NKProConfirmedAreas2025=Object.freeze({MIGRATION_ID,AREA_BY_UNIT,apply});
})(globalThis);
