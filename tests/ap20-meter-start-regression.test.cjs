"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "js", "quality-rules.js"), "utf8");
const sandbox = {
  console, Date, JSON, Math, Number, String, Array, Object, Set, Map,
  visibleTenantRows:() => [],
  billableTenantRows:() => [],
  privateTenantRows:() => [],
  periodStart:() => "2025-01-01",
  periodEnd:() => "2025-12-31",
  isCostAllowedForTenant:() => true,
  meterTotalForCostAndTenant:() => 0,
  calculateUmlage:() => ({ tenantResults:[] }),
  umlageTotals:() => ({ prepaymentMatrixTotal:0, prepayments:0, allocationDelta:0, totalCosts:0, allTenantShare:0, ownerShare:0 }),
  totalVorauszahlungForTenant:() => 0,
  briefResultRows:() => [],
  briefCostRows:() => [],
  briefLongTextRisks:() => [],
  selectedBriefTenant:() => null,
  fmtMoney:value => String(value),
  formatPlainNumber:value => String(value),
  startupErrors:[],
  renderErrors:[],
  DATA_SCHEMA_VERSION:5,
  DATA_LAYER_CONTRACT_VERSION:1,
  NK_PRO_MODULES:{ qualityAssurance:{ tenantQualityLabel:row => row && (row.name || row.id) || "Mietverhältnis" } },
  navigator:{ serviceWorker:{} },
  document:{ querySelector:() => ({}) },
  globalThis:null
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename:"js/quality-rules.js" });

const data = {
  meta:{ abrechnungsbeginn:"2025-01-01", abrechnungsende:"2025-12-31", abrechnungsjahr:2025, dataSchemaVersion:5, dataLayerContractVersion:1 },
  wohnungen:[], mieter:[], kostenarten:[], jahresArchiv:[], briefSettings:{}, prepaymentAdjustmentSettings:{},
  zaehlerDaten:{
    zaehler:[{ meterId:"Z1", bezeichnung:"Kaltwasser", zaehlernummer:"123", einheit:"m³" }],
    messperioden:[{
      messperiodeId:"P1", zaehlerId:"Z1", beginn:"2025-01-01", ende:"2025-12-31",
      anfangsstand:100, endstand:90, verbrauch:-10, status:"invalid", einheit:"m³", zaehlerueberlauf:false
    }]
  }
};

const report = sandbox.NKProQualityRules.evaluate(data, { includeTechnical:false });
const finding = report.results.find(row => row.ruleId === "NKP-PLAU-005" && !row.passed);
assert.ok(finding, "Die zentrale Regel NKP-PLAU-005 muss die rückläufige Messperiode erkennen.");
assert.equal(finding.status, "Entscheidung erforderlich");
assert.equal(finding.blocking, false);
assert.equal(finding.confirmAllowed, true);
assert.equal(finding.values.meterId, "Z1");
assert.equal(finding.values.start, 100);
assert.equal(finding.values.end, 90);
assert.match(finding.details, /Endstand 90/);
assert.match(finding.details, /Anfangsstand 100/);
assert.match(finding.entityLabel, /Kaltwasser/);

process.stdout.write("AP20-Zählerstartregression bestanden: Datensatz bleibt ladbar und NKP-PLAU-005 zeigt die rückläufige Messperiode als 'Entscheidung erforderlich'.\n");
