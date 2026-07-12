"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { loadFixtureData, root } = require("./fixture-loader.cjs");

const context = vm.createContext({ console, Date, JSON, Math, Number, String, Array, Object, Set, Map, globalThis:null });
context.globalThis = context;
for (const file of ["meter-master.js", "meter-readings.js", "meter-periods.js", "meter-validation.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "js", file), "utf8"), context, { filename:file });
}
const master = context.NKProMeterMaster;
const readings = context.NKProMeterReadings;
const periods = context.NKProMeterPeriods;
const validation = context.NKProMeterValidation;
const fixed = { clone:value => JSON.parse(JSON.stringify(value)), now:() => "2026-07-12T20:00:00.000Z", appVersion:"V99.4.6" };

function plain(value) { return JSON.parse(JSON.stringify(value)); }
function options(extra = {}) { return { ...fixed, master, readings, periods, ...extra }; }
function reading(input, index = 0) { return readings.normalizeReading(input, index, options()); }

// 1. Verlustfreie, idempotente Migration eines echten V99.4.5-Referenzbestands.
const legacy = loadFixtureData("standardfall.json");
legacy.unbekanntesFeld = { marker:"erhalten", nested:[1, 2, 3] };
const first = validation.migrateMeteringData(legacy, options());
assert.equal(first.status, "migrated");
assert.equal(first.validation.valid, true, first.validation.errors.map(row => row.code).join(", "));
assert.equal(first.data.meta.dataSchemaVersion, 5);
assert.deepEqual(plain(first.data.unbekanntesFeld), { marker:"erhalten", nested:[1, 2, 3] });
assert.ok(first.data.zaehlerDaten.zaehler.length > 0);
assert.ok(first.data.zaehlerDaten.messwerte.length > 0);
const idsBefore = first.data.zaehlerDaten.zaehler.map(row => row.meterId);
const second = validation.migrateMeteringData(first.data, options());
assert.equal(second.status, "not-required");
assert.deepEqual(second.data.zaehlerDaten.zaehler.map(row => row.meterId), idsBefore);
assert.equal(second.data.meta.standardMigrations.filter(row => row.id === "metering-standard-v1").length, 1);

// 1a. Nutzerindexierte Null-Platzhalter bei Mieterwechsel bleiben dokumentiert, bilden aber keine falsche Rückwärtsperiode.
const tenantChange = validation.migrateMeteringData(loadFixtureData("mieterwechsel.json"), options());
assert.equal(tenantChange.validation.valid, true, tenantChange.validation.errors.map(row => row.code).join(", "));
assert.ok(tenantChange.data.zaehlerDaten.messwerte.some(row => row.status === "documented-only" && row.plausibilitaetsstatus === "legacy-placeholder"));
assert.equal(tenantChange.data.zaehlerDaten.messperioden.some(row => Number(row.verbrauch) < 0), false);

// 2. Eigenständige Stammdaten, Messwerte, Messperioden und zeitabhängige Zuordnungen.
const data = {
  meta:{ dataSchemaVersion:5, abrechnungsjahr:"2025", abrechnungsbeginn:"2025-01-01", abrechnungsende:"2025-12-31" },
  wohnungen:[{ id:"U1", bezeichnung:"Wohnung 1", status:"aktiv" }],
  mieter:[
    { id:"T1", wohnung:"U1", einzug:"2025-01-01", auszug:"2025-06-30", status:"aktiv" },
    { id:"T2", wohnung:"U1", einzug:"2025-07-01", auszug:"2025-12-31", status:"aktiv" }
  ],
  objektStandard:{
    version:1,
    objekt:{ id:"OBJ-1" },
    gebaeude:[{ id:"GEB-1", objektId:"OBJ-1" }],
    einheiten:[{ einheitId:"U1", gebaeudeId:"GEB-1" }],
    partner:[{ partnerId:"T1" }, { partnerId:"T2" }],
    vertraege:[
      { vertragId:"V1", partnerId:"T1", einheitId:"U1", beginn:"2025-01-01", ende:"2025-06-30" },
      { vertragId:"V2", partnerId:"T2", einheitId:"U1", beginn:"2025-07-01", ende:"2025-12-31" }
    ],
    zaehler:[]
  },
  kostenarten:[{ id:"K100", inNK:"Ja", umlageschluessel:"Verbrauch", gesamtbetrag:100 }]
};
const container = master.ensureMeteringContainer(data, options());
container.zaehler = [master.normalizeMasterRecord({
  meterId:"Z-1", meterType:"heat", bezeichnung:"Wärmezähler", zaehlernummer:"HZ-001", einheit:"kWh",
  status:"active", objektId:"OBJ-1", gebaeudeId:"GEB-1", einheitId:"U1", verbrauchsstelleId:"VS-1",
  kostenId:"K100", abrechnungsrelevant:true, unbekanntesStammfeld:{ keep:true }
}, 0, options())];
container.messwerte = [
  reading({ messwertId:"MW-START", zaehlerId:"Z-1", ablesedatum:"2025-01-01", messzeitraumVon:"2025-01-01", messzeitraumBis:"2025-12-31", wert:1000, einheit:"kWh", ableseart:"Anfangsablesung", herkunft:"manual", erfasstAm:"2025-01-01T10:00:00.000Z" }),
  reading({ messwertId:"MW-END", zaehlerId:"Z-1", ablesedatum:"2025-12-31", messzeitraumVon:"2025-01-01", messzeitraumBis:"2025-12-31", wert:1365, einheit:"kWh", ableseart:"Endablesung", herkunft:"manual", erfasstAm:"2025-12-31T10:00:00.000Z" }, 1)
];
validation.synchronizeMeteringData(data, options());
assert.equal(data.zaehlerDaten.zaehler.length, 1);
assert.equal(data.zaehlerDaten.zaehler[0].unbekanntesStammfeld.keep, true);
assert.equal(data.zaehlerDaten.messwerte.length, 2);
assert.equal(data.zaehlerDaten.messperioden.length, 1);
assert.equal(data.zaehlerDaten.messperioden[0].verbrauch, 365);
const shares = data.zaehlerDaten.messperioden[0].zuordnungsanteile.filter(row => row.zuordnungstyp === "usage");
assert.equal(shares.length, 2);
assert.ok(Math.abs(shares.reduce((sum, row) => sum + row.verbrauch, 0) - 365) < 0.000001);
assert.ok(periods.consumptionForCostAndTenant(data, "K100", "T1", "U1", options()) > 0);
assert.ok(periods.consumptionForCostAndTenant(data, "K100", "T2", "U1", options()) > 0);

// 3. Korrekturen überschreiben historische Messwerte nicht stillschweigend.
const correctionData = plain(data);
const old = correctionData.zaehlerDaten.messwerte.find(row => row.messwertId === "MW-END");
old.status = "replaced";
old.ersetztDurchMesswertId = "MW-END-CORR";
correctionData.zaehlerDaten.messwerte.push(reading({
  messwertId:"MW-END-CORR", zaehlerId:"Z-1", ablesedatum:"2025-12-31", messzeitraumVon:"2025-01-01", messzeitraumBis:"2025-12-31",
  wert:1370, einheit:"kWh", ableseart:"Korrekturablesung", herkunft:"manual", erfasstAm:"2026-01-10T10:00:00.000Z", ersetztMesswertId:"MW-END"
}, 2));
periods.buildMeasurementPeriods(correctionData, options());
assert.ok(correctionData.zaehlerDaten.messwerte.some(row => row.messwertId === "MW-END" && row.status === "replaced"));
assert.equal(correctionData.zaehlerDaten.messperioden[0].verbrauch, 370);
assert.equal(correctionData.zaehlerDaten.messperioden[0].korrigiert, true);

// 4. Rückwärtsstand wird als kritischer Validierungsfehler erkannt.
const reversed = plain(data);
reversed.zaehlerDaten.messwerte.find(row => row.messwertId === "MW-END").wert = 900;
periods.buildMeasurementPeriods(reversed, options());
const reversedValidation = validation.validateMeteringData(reversed, { ...options(), billingReadiness:true });
assert.equal(reversedValidation.valid, false);
assert.ok(reversedValidation.errors.some(row => row.code === "METER_READING_REVERSED"));

// 5. Stromzähler-Dummy bleibt samt Messwert erhalten, erzeugt aber keinen abrechenbaren Verbrauch.
const dummy = master.addElectricityDummyMeter(data, { meterId:"Z-DUMMY", bezeichnung:"Strom Dokumentation", zaehlernummer:"EL-D-1", einheit:"kWh", objektId:"OBJ-1", gebaeudeId:"GEB-1", einheitId:"U1" }, options());
data.zaehlerDaten.messwerte.push(
  reading({ messwertId:"D-START", zaehlerId:dummy.meterId, ablesedatum:"2025-01-01", wert:10, einheit:"kWh", herkunft:"manual" }, 3),
  reading({ messwertId:"D-END", zaehlerId:dummy.meterId, ablesedatum:"2025-12-31", wert:110, einheit:"kWh", herkunft:"manual" }, 4)
);
validation.synchronizeMeteringData(data, options());
const dummyPeriod = data.zaehlerDaten.messperioden.find(row => row.zaehlerId === dummy.meterId);
assert.ok(dummyPeriod);
assert.equal(dummyPeriod.abrechnungsrelevant, false);
assert.equal(master.billingRelevantMeters(data).some(row => row.meterId === dummy.meterId), false);
assert.equal(periods.consumptionForCostAndTenant(data, "K100", "T1", "U1", options()) <= 365, true);
const dummyValidation = validation.validateMeteringData(data, { ...options(), billingReadiness:false });
assert.equal(dummyValidation.errors.some(row => row.code === "ELECTRICITY_DUMMY_NOT_EXCLUDED"), false);

// 6. Zählerwechsel behält beide IDs und setzt Vorgänger/Nachfolger sowie Ein-/Ausbaudatum.
container.zaehler.push(master.normalizeMasterRecord({ meterId:"Z-2", meterType:"heat", zaehlernummer:"HZ-002", einheit:"kWh", objektId:"OBJ-1", gebaeudeId:"GEB-1", einheitId:"U1", kostenId:"K100", abrechnungsrelevant:true }, 2, options()));
const replacement = periods.registerMeterReplacement(data, { alterZaehlerId:"Z-1", neuerZaehlerId:"Z-2", wechseldatum:"2025-07-01", ausbauwert:1181, einbauwert:0 }, options());
assert.ok(replacement.zaehlerwechselId);
assert.equal(data.zaehlerDaten.zaehler.find(row => row.meterId === "Z-1").nachfolgerZaehlerId, "Z-2");
assert.equal(data.zaehlerDaten.zaehler.find(row => row.meterId === "Z-2").vorgaengerZaehlerId, "Z-1");
assert.equal(data.zaehlerDaten.zaehler.find(row => row.meterId === "Z-1").ausbaudatum, "2025-07-01");
assert.equal(data.zaehlerDaten.zaehler.find(row => row.meterId === "Z-2").einbaudatum, "2025-07-01");

// 7. Snapshot-Projektion enthält Standards, Zuordnungen, Wechsel und Ausschlussgründe ohne Quellreferenzen.
const projection = validation.createSnapshotProjection(data, { start:"2025-01-01", end:"2025-12-31" }, options());
assert.equal(projection.meteringStandardVersion, 1);
assert.ok(projection.meters.some(row => row.meterId === "Z-1"));
assert.ok(projection.readings.some(row => row.messwertId === "MW-START"));
assert.ok(projection.measurementPeriods.length > 0);
assert.ok(projection.assignments.length > 0);
assert.ok(projection.replacements.some(row => row.zaehlerwechselId === replacement.zaehlerwechselId));
assert.ok(projection.excludedMeters.some(row => row.meterId === dummy.meterId));
const snapshotCopy = plain(projection);
data.zaehlerDaten.messwerte.find(row => row.messwertId === "MW-END").wert = 9999;
assert.notEqual(snapshotCopy.readings.find(row => row.messwertId === "MW-END").wert, 9999);

process.stdout.write("Zählerstandard-Prüfung abgeschlossen: Migration, stabile IDs, getrennte Messwerte, Messperioden, Korrekturen, Wechsel, zeitabhängige Zuordnungen, Snapshot-Projektion und Dummy-Ausschluss sind konsistent.\n");
