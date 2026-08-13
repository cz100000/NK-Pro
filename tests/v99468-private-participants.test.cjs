"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const context = vm.createContext({ console, Date, JSON, Math, Number, String, Array, Object, Set, Map, globalThis:null });
context.globalThis = context;
context.tenantRelevantForCurrentBilling = record => record && record.relevant !== false;
vm.runInContext(read("js/billing-calculation.js"), context, { filename:"billing-calculation.js" });
const billing = context.NKProBillingCalculation;

assert.ok(billing, "Berechnungsmodul fehlt");
for (const [index, role] of ["Privatanteil", "Eigenanteil", "Eigentümer/Privat", "private Nutzung"].entries()) {
  const participant = { id:`PX-${200 + index}`, name:`Testperson ${index}`, wohnung:`WX-${index}`, abrechnungRolle:role };
  assert.equal(billing.isPrivateUse(participant), true, `${role} muss als private Nutzungsart erkannt werden`);
  assert.equal(billing.isSettlementParticipant(participant), true, `${role} muss regulärer Abrechnungsteilnehmer sein`);
  assert.equal(billing.isBillableTenant(participant), true, `${role} darf durch den Kompatibilitätsalias nicht ausgeschlossen werden`);
}
assert.equal(billing.isSettlementParticipant({ id:"EMPTY", name:"", wohnung:"" }), false, "Leerer technischer Platzhalter darf nicht gezählt werden");
assert.equal(billing.isSettlementParticipant({ id:"OUT", name:"Außerhalb", wohnung:"W1", relevant:false }), false, "Zeitlich irrelevanter Datensatz darf nicht teilnehmen");

const calculation = read("js/billing-calculation.js");
assert.match(calculation, /function isSettlementParticipant\(m\)/);
assert.match(calculation, /function isBillableTenant\(m\)\s*\{\s*return isSettlementParticipant\(m\);/s);
assert.doesNotMatch(calculation, /isBillableTenant[\s\S]{0,220}!isPrivateTenant/);
assert.match(calculation, /privateResults\s*=\s*tenantResults\.filter/);
assert.doesNotMatch(calculation, /privateResults\s*=\s*privateTenants\.map/);

const archiveActions = read("js/archive-actions.js");
assert.doesNotMatch(archiveActions, /abrechnungRolle\s*===\s*["']Eigentümer\/Privat["']/);
const exportService = read("js/export-service.js");
assert.doesNotMatch(exportService, /calc\.privateResults\.forEach/);
const allocationUi = read("js/ui-billing-allocation.js");
assert.doesNotMatch(allocationUi, /LANDLORD-PRIVATE/);
assert.doesNotMatch(allocationUi, /term\(["']Privatanteil["']/);
const billingReview = read("js/billing-review.js");
assert.doesNotMatch(billingReview, /landlordBase[^;\n]*privateShare/);
const documents = read("js/document-data.js");
assert.match(documents, /isSettlementParticipant/);
const masterData = read("js/ui-master-data.js");
assert.match(masterData, /normalizeSettlementParticipantsForLegacyData/);
assert.doesNotMatch(masterData, /ensureZimmermannTenantForLegacyData/);
assert.doesNotMatch(masterData, /m\.id\s*===\s*["']M000["']/);
assert.doesNotMatch(masterData, /zimmermann/i);

const nav = read("js/ui-navigation-pages.js");
for (const role of ["Privatanteil", "Eigenanteil", "Eigentümer/Privat"]) assert.ok(nav.includes(role), `Rollenoption fehlt: ${role}`);

const seedText = read("js/default-seed.js");
const seedMatch = seedText.match(/const SEED\s*=\s*([\s\S]*);\s*$/);
assert.ok(seedMatch, "SEED nicht lesbar");
const seed = JSON.parse(seedMatch[1]);
const seedM000 = seed.mieter.find(row => row.id === "M000");
assert.equal(seedM000 && seedM000.einzug, "2010-01-01", "M000 muss im aktiven Objektstandard mit 01.01.2010 hinterlegt sein");

const pkg = JSON.parse(read("package.json"));
const manifest = JSON.parse(read("manifest.webmanifest"));
const project = JSON.parse(read("nk-pro-project.json"));
assert.equal(pkg.version, "99.4.73");
assert.equal(manifest.version, "99.4.73");
assert.equal(manifest.buildId, "99.4.73-confirmed-2025-data");
assert.equal(project.appVersion, "99.4.73");
assert.equal(project.runtimeBuildId, "99.4.73-confirmed-2025-data");

console.log("V99.4.68 Teilnehmerlogik unter V99.4.70 regressionsfrei bestätigt");
