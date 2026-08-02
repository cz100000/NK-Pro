"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadModules(initialState) {
  let state = initialState;
  let counter = 0;
  const context = vm.createContext({
    console,
    Date,
    Math,
    JSON,
    Object,
    Array,
    Number,
    String,
    Boolean,
    Map,
    Set,
    globalThis:null
  });
  context.globalThis = context;
  for (const file of ["js/billing-review.js", "js/cost-reconciliation.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename:file });
  }
  const stateAccess = {
    current:() => state,
    transact:(mutator) => mutator(state)
  };
  const calculation = {
    calculateUmlage:() => ({ costResults:[] }),
    individualValuePageModel:() => ({})
  };
  context.NKProBillingReview.configure({
    stateAccess,
    calculation,
    appVersion:"V99.4.67",
    now:() => `2026-08-02T12:00:${String(counter++).padStart(2,"0")}.000Z`
  });
  context.NKProCostReconciliation.configure({
    stateAccess,
    billingReview:context.NKProBillingReview,
    calculateDataset:(dataset) => ({
      calculation:{
        costResults:(dataset.kostenarten || []).filter(row => row.inNK === "Ja").map(cost => ({
          cost,
          tenantSum:Number(cost.__tenantShare || 0),
          privateShare:Number(cost.__privateShare || 0),
          vacancyShare:Number(cost.__vacancyShare || 0),
          ownerShare:Number(cost.__ownerShare || 0),
          status:"OK"
        }))
      },
      totals:{}
    }),
    appVersion:"V99.4.67",
    now:() => `2026-08-02T12:01:${String(counter++).padStart(2,"0")}.000Z`
  });
  return { context, state:() => state, domain:context.NKProCostReconciliation, review:context.NKProBillingReview };
}

function baseState() {
  return {
    meta:{ abrechnungsjahr:"2025", abrechnungsbeginn:"2025-01-01", abrechnungsende:"2025-12-31" },
    wohnungen:[],
    mieter:[{ id:"M1", nkVoraus:9999 }],
    kostenarten:[{
      id:"K1", kostenart:"Hausbetrieb", inNK:"Ja", gesamtbetrag:1000,
      umlageschluessel:"Wohnfläche", ausschlussBehandlung:"Vollständig umlegen",
      __tenantShare:700, __privateShare:100, __vacancyShare:50
    }],
    jahresArchiv:[]
  };
}

(function neutralMigrationAndNoFictiveValues() {
  const state = baseState();
  const { domain } = loadModules(state);
  const container = domain.ensureData(state);
  assert.equal(container.version, 1);
  assert.deepEqual(Array.from(container.payments), []);
  assert.deepEqual(Array.from(container.allocations), []);
  const model = domain.model(state, { fromYear:2025, toYear:2025 });
  assert.equal(model.income.total, 0, "Soll-Vorauszahlungen dürfen nicht als tatsächliche Einnahme erscheinen");
  assert.equal(model.costs.total, 1000);
  assert.equal(model.difference, 1000);
  assert.equal(model.categories.private.total, 100);
  assert.equal(model.categories.vacancy.total, 50);
  assert.equal(model.control, 850);
})();

(function paymentSignsAndYearReferences() {
  const state = baseState();
  const { domain } = loadModules(state);
  domain.savePayment({ paymentType:"prepayment", amount:"500,00", paymentDate:"2025-02-01", paymentYear:2025, billingYear:2025, tenantId:"M1" });
  domain.savePayment({ paymentType:"additional-payment", amount:"75", paymentDate:"2025-07-12", paymentYear:2025, billingYear:2024, tenantId:"M1" });
  domain.savePayment({ paymentType:"refund", amount:"25", paymentDate:"2025-09-01", paymentYear:2025, billingYear:2024, tenantId:"M1" });
  domain.savePayment({ paymentType:"correction", amount:"-10", paymentDate:"2025-12-31", paymentYear:2025, billingYear:2025 });
  const model = domain.model(state, { fromYear:2025, toYear:2025 });
  assert.equal(model.income.maps.prepayment[2025], 500);
  assert.equal(model.income.maps.additionalPayment[2025], 75);
  assert.equal(model.income.maps.refund[2025], -25);
  assert.equal(model.income.maps.correction[2025], -10);
  assert.equal(model.income.total, 540);
  const priorYearPayment = state.kostenUmlagenAbgleich.payments.find(row => row.paymentType === "additional-payment");
  assert.equal(priorYearPayment.paymentYear, 2025);
  assert.equal(priorYearPayment.billingYear, 2024, "Zahlungs- und Abrechnungsjahr müssen getrennt erhalten bleiben");
})();

(function openDifferenceKeepsWarningWithZeroControl() {
  const state = baseState();
  const { domain } = loadModules(state);
  domain.savePayment({ paymentType:"prepayment", amount:500, paymentYear:2025, billingYear:2025 });
  let model = domain.model(state, { fromYear:2025, toYear:2025 });
  assert.equal(model.difference, 500);
  assert.equal(model.explanation, 150);
  assert.equal(model.control, 350);
  domain.assignRemainingToOpen({ fromYear:2025, toYear:2025, year:2025 });
  model = domain.model(state, { fromYear:2025, toYear:2025 });
  assert.equal(model.control, 0);
  assert.equal(model.open, 350);
  assert.equal(model.statusCode, "open-difference");
  assert.equal(model.status, "Offene Differenz vorhanden");
})();

(function checkedAllocationUsesExistingReviewStoreAndCanBeRevoked() {
  const state = baseState();
  const { domain, review } = loadModules(state);
  const row = domain.saveAllocation({
    category:"accepted-other", year:2025, amount:25, reason:"Fachlich geprüfte Gegenposition",
    allocationKey:"Direkter Betrag", source:"Nachweis 1", evidenceReference:"Beleg A",
    checked:true, updatedBy:"Max Mustermann"
  });
  const decisionId = `KUA-${row.id}`;
  assert.equal(state.abrechnungsPruefungen.records[decisionId].decisionScope, "cost-reconciliation");
  assert.equal(state.abrechnungsPruefungen.records[decisionId].acceptedBy, "Max Mustermann");
  review.reconcile(state, []);
  assert.ok(state.abrechnungsPruefungen.records[decisionId], "Abrechnungsdifferenz-Reconcile darf Analyseentscheidungen nicht löschen");
  domain.removeAllocation(row.id);
  assert.equal(state.abrechnungsPruefungen.records[decisionId], undefined);
})();

(function releaseIsInvalidatedByDataChanges() {
  const state = baseState();
  const { domain } = loadModules(state);
  domain.ensureData(state);
  domain.setRelease({ status:"checked", updatedBy:"Prüfer" });
  assert.equal(state.kostenUmlagenAbgleich.release.status, "checked");
  domain.savePayment({ paymentType:"prepayment", amount:1, paymentYear:2025, billingYear:2025 });
  assert.equal(state.kostenUmlagenAbgleich.release.status, "draft", "Datenänderungen müssen einen alten Prüf-/Freigabestatus zurücknehmen");
})();

(function costOverrideChangesAnalysisWithoutChangingSourceCost() {
  const state = baseState();
  const { domain } = loadModules(state);
  domain.saveCostOverride({ year:2025, costId:"K1", actualTotal:1100, billingAmount:1000, analysisAmount:900, analysisCategory:"other", source:"Steuererklärung", evidenceStatus:"verified" });
  const model = domain.model(state, { fromYear:2025, toYear:2025 });
  assert.equal(model.costs.total, 900);
  assert.equal(model.costs.maps.other[2025], 900);
  assert.equal(state.kostenarten[0].gesamtbetrag, 1000, "Analyserelevanter Betrag darf die produktive Kostenart nicht direkt mutieren");
})();

(function jsonRoundtripKeepsNewData() {
  const state = baseState();
  const first = loadModules(state);
  first.domain.savePayment({ paymentType:"additional-payment", amount:125, paymentDate:"2025-08-01", paymentYear:2025, billingYear:2024, tenantId:"M1", unitId:"W1", source:"Bankimport", origin:"Importiert" });
  first.domain.saveAllocation({ category:"temporal-accrual", year:2025, amount:20, reason:"Zahlungs- und Kostenjahr weichen ab", allocationKey:"Direkter Betrag", checked:true, updatedBy:"Prüfer" });
  const exported = JSON.stringify(state);
  const restored = JSON.parse(exported);
  const second = loadModules(restored);
  second.domain.ensureData(restored);
  assert.equal(restored.kostenUmlagenAbgleich.payments.length, 1);
  assert.equal(restored.kostenUmlagenAbgleich.payments[0].billingYear, 2024);
  assert.equal(restored.kostenUmlagenAbgleich.allocations.length, 1);
  assert.ok(restored.abrechnungsPruefungen.records[restored.kostenUmlagenAbgleich.allocations[0].decisionId]);
})();

console.log("AP22F12 domain tests passed");
