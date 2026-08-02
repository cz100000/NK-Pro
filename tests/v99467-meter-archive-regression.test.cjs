"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Date, JSON, Math, Number, String, Array, Object, Set, Map, globalThis:null });
context.globalThis = context;
for (const file of ["meter-master.js", "meter-readings.js", "meter-periods.js", "meter-validation.js", "object-standard.js", "billing-snapshot.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "js", file), "utf8"), context, { filename:file });
}

const master = context.NKProMeterMaster;
const readings = context.NKProMeterReadings;
const periods = context.NKProMeterPeriods;
const validation = context.NKProMeterValidation;
const objectStandard = context.NKProObjectStandard;
const billingSnapshot = context.NKProBillingSnapshot;
const clone = value => JSON.parse(JSON.stringify(value));
const now = () => "2026-08-02T15:00:00.000Z";
const options = { clone, now, appVersion:"V99.4.67", master, readings, periods };

const units = [
  ["W000.UG", "UG"], ["W001.EG-L", "EG-Links"], ["W002.EG-R", "EG-Rechts"],
  ["W003.1OG-L", "1OG-Links"], ["W004.1OG-R", "1OG-Rechts"],
  ["W005.DG-L", "DG-Links"], ["W006.DG-R", "DG-Rechts"]
];
const actualTenants = units.slice(0, 5).map(([unitId], index) => ({
  id:index === 0 ? "M000" : "M" + String(index).padStart(3, "0"),
  wohnung:unitId,
  name:"Person " + index,
  einzug:"2023-01-01",
  auszug:"",
  status:"Aktiv"
}));
const placeholders = Array.from({ length:15 }, (_, index) => ({
  id:"M" + String(index + 6).padStart(3, "0"), wohnung:"", name:"", einzug:"", auszug:"", status:""
}));
const historyValues = [
  [346.65, 216.54, 420, 246],
  [186.24, 89.37, 228, 98],
  [95.88, 21.75, 105, 24],
  [138.11, 44.44, 153, 52],
  [104.97, 121.21, 152, 186],
  [123.08, 141.56, 123.08, 143],
  [136.98, 110.99, 136.98, 110.99]
];
const waterRows = historyValues.slice(0, 5).map(([kwStart, wwStart, kwEnd, wwEnd]) => ({
  kwStart, kwStartDate:"2022-12-31", kwEnd, kwEndDate:"2023-12-31",
  wwStart, wwStartDate:"2022-12-31", wwEnd, wwEndDate:"2023-12-31"
}));

const oldMeters = [];
// Die fünf vorhandenen Einheiten besitzen bereits stabile, einheitsbezogene IDs.
for (let index = 0; index < 5; index += 1) {
  const unitId = units[index][0];
  oldMeters.push({ meterId:"Z-WASSER-KW-" + unitId, legacySourceKey:"water-cold:" + unitId, meterType:"cold-water", zaehlerTyp:"cold-water", einheit:"m³", einheitId:unitId, nutzerId:actualTenants[index].id, kostenId:"K002", abrechnungsrelevant:true, billingRole:"billing", status:"aktiv" });
  oldMeters.push({ meterId:"Z-WASSER-WW-" + unitId, legacySourceKey:"water-hot:" + unitId, meterType:"hot-water", zaehlerTyp:"hot-water", einheit:"m³", einheitId:unitId, nutzerId:actualTenants[index].id, kostenId:"K002", abrechnungsrelevant:true, billingRole:"billing", status:"aktiv" });
}
// Alte Migrationsartefakte für 15 leere Platzhalterzeilen müssen entfernt werden.
for (let index = 5; index < 20; index += 1) {
  const tenantId = placeholders[index - 5].id;
  oldMeters.push({ meterId:"Z-WASSER-KW-" + index, meterType:"cold-water", zaehlerTyp:"cold-water", einheit:"m³", einheitId:"", nutzerId:tenantId, sourcePath:"waterMeters.readings[" + index + "]", abrechnungsrelevant:true, billingRole:"billing", status:"aktiv" });
  oldMeters.push({ meterId:"Z-WASSER-WW-" + index, meterType:"hot-water", zaehlerTyp:"hot-water", einheit:"m³", einheitId:"", nutzerId:tenantId, sourcePath:"waterMeters.readings[" + index + "]", abrechnungsrelevant:true, billingRole:"billing", status:"aktiv" });
}
// Vier reale DG-Zähler existierten bereits, aber ohne Messwerte/Messperioden.
for (const [unitId] of units.slice(5)) {
  oldMeters.push({ meterId:"Z-WASSER-KW-" + unitId, meterType:"cold-water", zaehlerTyp:"cold-water", einheit:"m³", einheitId:unitId, kostenId:"K002", abrechnungsrelevant:true, billingRole:"billing", status:"aktiv" });
  oldMeters.push({ meterId:"Z-WASSER-WW-" + unitId, meterType:"hot-water", zaehlerTyp:"hot-water", einheit:"m³", einheitId:unitId, kostenId:"K002", abrechnungsrelevant:true, billingRole:"billing", status:"aktiv" });
}
// Ein erst 2024 eingebauter Zähler darf die Prüfung 2023 nicht blockieren.
oldMeters.push({ meterId:"Z-SPAETER", meterType:"cold-water", zaehlerTyp:"cold-water", einheit:"m³", einheitId:"W001.EG-L", kostenId:"K002", einbaudatum:"2024-01-01", abrechnungsrelevant:true, billingRole:"billing", status:"aktiv" });

const data = {
  meta:{ dataSchemaVersion:5, dataLayerContractVersion:1, abrechnungsjahr:"2023", abrechnungsbeginn:"2023-01-01", abrechnungsende:"2023-12-31", objektId:"OBJ-001" },
  wohnungen:units.map(([id, bezeichnung], index) => ({ id, bezeichnung, lage:bezeichnung, status:index < 5 ? "aktiv" : "inaktiv" })),
  mieter:[...actualTenants, ...placeholders],
  kostenarten:[{ id:"K002", kostenart:"Wasserversorgung", inNK:"Ja", umlageschluessel:"Verbrauch", gesamtbetrag:1000 }],
  waterMeters:{ settings:{ enabled:"Ja", houseWaterTotal:315 }, readings:waterRows },
  waterMeterHistory:{
    houseConnection:{ wechselDatum:"2022-04-13", wertBeiWechsel:1893, wertEnde2022:301, wertEnde2023:615, wertEnde2024:911 },
    units:units.map(([wohnung, bezeichnung], index) => ({
      wohnung, bezeichnung,
      readings:[
        { jahr:2022, kw:historyValues[index][0], ww:historyValues[index][1] },
        { jahr:2023, kw:historyValues[index][2], ww:historyValues[index][3] }
      ]
    }))
  },
  zaehlerDaten:{
    version:1, meteringDataVersion:1, meterMasterStandardVersion:1, readingStandardVersion:1, measurementPeriodStandardVersion:1,
    zaehler:oldMeters, messwerte:[], messperioden:[], zuordnungen:[], zaehlerwechsel:[]
  }
};

const migrated = validation.migrateMeteringData(data, options);
assert.notEqual(migrated.status, "failed", migrated.error && migrated.error.message);
const repaired = migrated.data;
const repairMigration = repaired.meta.standardMigrations.find(row => row && row.id === "metering-repair-v99.4.67");
assert.ok(repairMigration, "Die automatische Datenreparatur muss nachvollziehbar protokolliert werden.");
assert.equal(repairMigration.details.orphanPlaceholderMeters, 30);

const billingUnitMeters = repaired.zaehlerDaten.zaehler.filter(row => row.abrechnungsrelevant !== false && ["cold-water", "hot-water"].includes(row.meterType));
assert.equal(billingUnitMeters.filter(row => row.meterId !== "Z-SPAETER").length, 14, "Je Einheit müssen genau zwei echte Wasserzähler erhalten bleiben.");
assert.equal(repaired.zaehlerDaten.zaehler.some(row => /^Z-WASSER-(?:KW|WW)-(?:5|6|7|8|9|1\d)$/.test(row.meterId) && !row.einheitId), false, "Platzhalterzähler ohne Einheit müssen entfernt werden.");
assert.equal(repaired.zaehlerDaten.zaehler.filter(row => row.meterType === "house-water-control").length, 2, "Hausanschlusszähler müssen als nicht abrechnungsrelevante Kontrollzähler erhalten bleiben.");

const dgPeriods = repaired.zaehlerDaten.messperioden.filter(row => /W005\.DG-L|W006\.DG-R/.test(row.zaehlerId));
assert.equal(dgPeriods.length, 4, "Für beide DG-Einheiten müssen Kalt- und Warmwasserperioden aus der Historie entstehen.");
const dgLeftHot = dgPeriods.find(row => row.zaehlerId.includes("WW-W005.DG-L"));
assert.ok(dgLeftHot);
assert.equal(dgLeftHot.anfangsstand, 141.56);
assert.equal(dgLeftHot.endstand, 143);
assert.ok(Math.abs(dgLeftHot.verbrauch - 1.44) < 0.000001);

const readiness = validation.validateMeteringData(repaired, { ...options, billingReadiness:true });
assert.equal(readiness.errors.some(row => row.code === "METER_PERIOD_MISSING"), false, readiness.errors.map(row => row.message).join(" | "));
assert.equal(repaired.zaehlerDaten.messperioden.some(row => row.zaehlerId === "Z-SPAETER"), false, "Zähler außerhalb des Abrechnungsjahres benötigt keine Periode.");
assert.equal(repaired.zaehlerDaten.zuordnungen.some(row => row.zaehlerId === "Z-SPAETER"), false, "Zähler außerhalb des Abrechnungsjahres benötigt keine Zuordnung.");

objectStandard.normalizeObjectStandard(repaired, { clone, now, appVersion:"V99.4.67" });
const snapshotOptions = {
  clone, now, appVersion:"V99.4.67", dataSchemaVersion:5, dataLayerContractVersion:1, objectStandardVersion:1, meteringStandardVersion:1,
  objectStandardModule:objectStandard, meterMasterModule:master, meterReadingsModule:readings, meterPeriodsModule:periods,
  meterValidationModule:validation, createBoundedData:clone
};
const snapshotReadiness = billingSnapshot.validateBillingReadiness(repaired, snapshotOptions);
assert.equal(snapshotReadiness.valid, true, snapshotReadiness.errors.map(row => row.message).join(" | "));
const snapshot = billingSnapshot.createBillingSnapshot(repaired, {
  ...snapshotOptions, validation:snapshotReadiness, calculation:{}, summary:{}, envelopeFields:{ year:"2023", periodId:"2023|2023-01-01|2023-12-31|Test" }
});
assert.equal(snapshot.snapshotStatus, "complete");
assert.equal(snapshot.meterSelection.included.length, 14);
assert.equal(snapshot.meterSelection.excluded.length, 1);

const summarized = billingSnapshot.summarizeValidationErrors([
  { code:"METER_PERIOD_MISSING", message:"Für den abrechnungsrelevanten Zähler fehlt eine gültige Messperiode.", entityId:"Z-A" },
  { code:"METER_PERIOD_MISSING", message:"Für den abrechnungsrelevanten Zähler fehlt eine gültige Messperiode.", entityId:"Z-B" }
]);
assert.equal(summarized.length, 1);
assert.match(summarized[0], /2 Fälle/);
assert.match(summarized[0], /Z-A, Z-B/);

console.log("V99.4.67 Zähler-/Archivregression bestanden: Platzhalter bereinigt, DG-Historie migriert, Zeitbezug geprüft und Snapshot erstellt.");
