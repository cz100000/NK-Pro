"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const moduleFiles = ["js/master-data-actions.js", "js/cost-actions.js", "js/billing-workflow.js"];
for (const file of moduleFiles) {
  const source = read(file);
  assert(source.includes("Object.freeze"), `${file} exportiert keine feste Schnittstelle.`);
  assert(!/\b(document|window|localStorage|sessionStorage|indexedDB)\b/.test(source), `${file} enthält DOM- oder Browser-Speicherzugriffe.`);
  assert(!/\b(alert|confirm|prompt|switchToTab)\s*\(/.test(source), `${file} löst UI-Dialoge oder Navigation aus.`);
}

const app = read("js/app.js");
const baselineInventory = JSON.parse(read("AP9_BASELINE_INVENTORY.json"));
const removedTopLevelFunctions = [
  "finalizeCurrentBilling", "unlockCurrentBilling", "configureFreeCost", "setBillingUnitStatus", "setMasterNested",
  "addMasterMietverhaeltnis", "archiveMasterMietverhaeltnis", "restoreMasterMietverhaeltnis",
  "tenantBillingCopyFromMaster", "tenantBillingCopyFromMasterKeepValues", "captureTenantIndexedValuesById",
  "restoreTenantIndexedValuesById", "captureUmlageInputsByTenantId", "restoreUmlageInputsByTenantId",
  "meterSnapshotRowScore", "restoreMeterReadingsAfterTenantSync", "mergeStammdatenIntoCurrentBilling",
  "stammdatenComparableUnit", "stammdatenComparableTenant", "applyStammdatenToCurrentBillingFromButton",
  "setCostSetting", "activateDefaultPrepayments", "deactivateAllPrepayments", "setCostTenantAllowed",
  "setPrepaymentValue", "setAbrechnungsjahr", "setAbrechnungsperiode", "setManualInputMode",
  "setManualExternalValue", "resetUmlageInputs", "setPrepaymentAdjustmentSetting", "createYearSnapshot"
];
assert.equal(baselineInventory.baseline.topLevelFunctionDeclarations, 655, "AP9-Ausgangsinventar ist inkonsistent.");
assert.deepEqual(baselineInventory.implementationFunctionsMoved, removedTopLevelFunctions, "Extraktionsinventar und AP9-Test weichen voneinander ab.");
assert.equal(baselineInventory.compatibilityWrappersRemoved.length, 28, "Entfernte Übergangsweiterleitungen sind unvollständig inventarisiert.");
for (const name of removedTopLevelFunctions) {
  assert(!new RegExp(`^function\\s+${name}\\s*\\(`, "m").test(app), `Legacy-Implementierung verbleibt in app.js: ${name}`);
}
assert(app.includes("masterDataActions.addMasterTenancy"), "Stammdatenaktionen sind nicht direkt an das Modul angebunden.");
assert(app.includes("costActions.setSetting"), "Kostenaktionen sind nicht direkt an das Modul angebunden.");
assert(app.includes("billingWorkflow.finalize"), "Abrechnungsworkflow ist nicht direkt an das Modul angebunden.");

const uiBindings = read("js/ui-bindings.js");
assert(uiBindings.includes('interactiveAppCall(applicationActions, "object", "applyMasterDataToBilling"'), "Stammdatenbestätigung liegt nicht in der UI-Bindingschicht.");
assert(uiBindings.includes('interactiveAppCall(applicationActions, "billing", "finalize"'), "Finalisierungsdialog liegt nicht in der UI-Bindingschicht.");
assert(uiBindings.includes('appCall(applicationActions, "cost", "setSetting"'), "Kostencontroller umgeht die Anwendungsschicht.");

const html = read("index.html");
const expectedOrder = ["js/application-actions.js", "js/master-data-actions.js", "js/cost-actions.js", "js/billing-workflow.js", "js/ui-controller.js", "js/app.js"];
let lastIndex = -1;
for (const resource of expectedOrder) {
  const index = html.indexOf(resource);
  assert(index > lastIndex, `Skriptreihenfolge ist für ${resource} ungültig.`);
  lastIndex = index;
}
const worker = read("service-worker.js");
for (const resource of moduleFiles) assert(worker.includes(`./${resource}`), `${resource} fehlt in der PWA-App-Shell.`);

const context = { console, structuredClone:global.structuredClone, Date, Set, Map };
context.globalThis = context;
vm.createContext(context);
for (const file of ["js/state-access.js", ...moduleFiles]) vm.runInContext(read(file), context, { filename:file });

let state = { marker:"original" };
let commits = 0;
let renders = 0;
let replacements = 0;
context.NKProStateAccess.configure({
  getState:() => state,
  replaceState:next => { state = next; replacements += 1; return state; },
  commit:() => { commits += 1; },
  render:() => { renders += 1; }
});

const transactionResult = context.NKProStateAccess.transact(current => {
  current.marker = "changed";
  return Object.freeze({ changed:true });
}, { render:false });
assert.equal(transactionResult.changed, true, "Transaktion liefert kein Aktionsergebnis.");
assert.equal(state.marker, "changed", "Transaktion hat den Einzelzustand nicht verändert.");
assert.equal(commits, 1, "Erfolgreiche Transaktion committet nicht genau einmal.");
assert.equal(renders, 0, "Render wurde trotz render:false ausgelöst.");
assert.equal(replacements, 0, "Aktionsergebnis wurde fälschlich als Ersatz-State interpretiert.");

const beforeRollback = JSON.stringify(state);
assert.throws(() => context.NKProStateAccess.transact(current => {
  current.marker = "invalid";
  throw new Error("rollback-test");
}), /rollback-test/);
assert.equal(JSON.stringify(state), beforeRollback, "Rollback stellt den vorherigen Zustand nicht vollständig wieder her.");
assert.equal(commits, 1, "Fehlgeschlagene Transaktion hat einen Commit ausgelöst.");

const clone = value => JSON.parse(JSON.stringify(value));
const num = value => Number(value || 0);
context.NKProMasterDataActions.configure({
  stateAccess:context.NKProStateAccess,
  clone,
  num,
  ensureUnitIdentityFields:unit => unit,
  generatedUnitIdForLabel:(label, index) => `W${String(index + 1).padStart(3, "0")}`,
  hasTenantData:tenant => !!(tenant && (tenant.id || tenant.name)),
  ensureTenantContactFields:tenant => tenant,
  ensureTenantIdentityFields:tenant => tenant,
  canonicalUnitIdFor:value => value,
  isArchivedTenant:tenant => tenant && tenant.status === "Archiviert",
  tenantActiveDaysInCurrentPeriod:tenant => num(tenant && tenant.aktiveTage) || 365,
  tenantOpenStatus:tenant => tenant && tenant.status || "Aktiv",
  normalizeActiveDayValue:value => num(value),
  periodDaysExact:() => 365,
  tenantRelevantForCurrentBilling:tenant => tenant && tenant.status !== "Archiviert",
  syncVorauszahlungen:() => undefined,
  syncUmlageInputs:() => undefined,
  ensureWaterMeterData:() => undefined,
  syncKostenartenMieterUmlage:() => undefined,
  applyWaterMetersToUmlage:() => undefined,
  updateTenantPrepaymentTotals:() => undefined,
  isoDateSerial:() => 0,
  hasEnteredMeterValue:value => value !== "" && value !== null && value !== undefined,
  todayIso:() => "2026-07-13",
  currentYear:() => "2026",
  isArchiveViewer:() => false
});
state = { stammdaten:{ wohnungen:[], mieter:[] }, wohnungen:[], mieter:[], vorauszahlungen:[], umlageInputs:{}, kostenartenMieterUmlage:{}, meta:{} };
commits = 0;
const addResult = context.NKProMasterDataActions.addMasterTenancy();
assert.equal(addResult.changed, true);
assert.equal(state.stammdaten.mieter.length, 1, "Mietverhältnis wurde nicht angelegt.");
assert.equal(state.stammdaten.mieter[0].id, "M001", "Stabile ID-Erzeugung ist nicht erhalten.");
assert.equal(commits, 1, "Stammdatenaktion committet nicht genau einmal.");
const archiveProbe = context.NKProMasterDataActions.archiveMasterTenancy(0);
assert.equal(archiveProbe.requiresConfirmation, true, "Archivierung fordert keine UI-Bestätigung an.");
assert.equal(commits, 1, "Bestätigungsabfrage hat bereits committed.");
context.NKProMasterDataActions.archiveMasterTenancy(0, { confirmed:true });
assert.equal(state.stammdaten.mieter[0].status, "Archiviert");
assert.equal(commits, 2, "Bestätigte Archivierung committet nicht genau einmal.");

context.NKProCostActions.configure({
  stateAccess:context.NKProStateAccess,
  num,
  normalizeManualUmlageValue:value => value,
  tenantRowsWithIndex:() => [],
  tenantIdForUmlage:tenant => tenant && tenant.id,
  activeCostRowsForMatrix:() => [],
  totalVorauszahlungForTenant:() => 0,
  getCostGroupOptions:() => ["Sonstige / freie Kostenarten"],
  costExclusionOptions:["Vollständig umlegen", "Nicht umlagefähig / Eigentümeranteil"],
  costExclusionFull:"Vollständig umlegen",
  umlageManual:"Manuelle Eingabe je Mieter/Wohneinheit"
});
state = {
  kostenarten:[{ id:"K001", kostenart:"Test", gesamtbetrag:10, gesamtverbrauch:2, inNK:"Ja", vorauszahlung:"Nein", berechnungsart:"Automatisch", umlageschluessel:"Wohnfläche" }],
  vorauszahlungen:[], kostenartenMieterUmlage:{}, mieter:[]
};
commits = 0;
const costResult = context.NKProCostActions.setSetting(0, "gesamtbetrag", 20);
assert.equal(costResult.changed, true);
assert.equal(state.kostenarten[0].gesamtbetrag, 20);
assert.equal(commits, 1, "Kostenaktion committet nicht genau einmal.");

context.NKProBillingWorkflow.configure({
  stateAccess:context.NKProStateAccess,
  appVersion:"V99.4.10",
  umlageManual:"Manuelle Eingabe je Mieter/Wohneinheit",
  num,
  currentYear:() => "2026",
  periodLabelShort:() => "01.01.–31.12.2026",
  periodYearFromDate:value => String(value || "").slice(0, 4),
  collectQualityChecks:() => ({}),
  finalBillingReadiness:() => ({ errors:[], warnings:[], hints:[] }),
  isArchiveViewer:() => false,
  hasActiveCurrentBilling:() => true,
  getManualInputModes:() => ["Manuelle Eingabe je Mieter/Wohneinheit"],
  getDefaultUmlageInputs:() => ({}),
  inferManualInputMode:() => "Manuelle Eingabe je Mieter/Wohneinheit",
  defaultManualInputMode:() => "Manuelle Eingabe je Mieter/Wohneinheit",
  applyWaterMetersToUmlage:() => undefined,
  updateTenantPrepaymentTotals:() => undefined,
  defaultBriefSettings:() => ({}),
  ensureYearData:() => undefined,
  syncVorauszahlungen:() => undefined,
  synchronizeMeteringData:() => undefined,
  normalizeObjectStandard:() => undefined,
  calculateUmlage:() => ({ tenantResults:[] }),
  visibleTenantRows:() => [],
  isBillableTenant:() => true,
  isPrivateTenant:() => false,
  validateBillingReadiness:() => ({ valid:true, errors:[], warnings:[] }),
  periodStart:() => "2026-01-01",
  periodEnd:() => "2026-12-31",
  billingSnapshotModuleOptions:options => options,
  snapshotMetaFrom:meta => ({ ...meta }),
  billingSnapshot:{ createBillingSnapshot:(data, options) => Object.freeze({ snapshotFormat:"nk-pro-billing-snapshot", data:clone(data), ...options.envelopeFields }) },
  archiveSnapshotScope:"billingSnapshot",
  dataLayerContractVersion:1,
  dataSchemaVersion:5
});
state = { meta:{ abrechnungsjahr:"2026", abrechnungsbeginn:"2026-01-01", abrechnungsende:"2026-12-31" }, briefSettings:{}, mieter:[], kostenarten:[], umlageInputs:{} };
commits = 0;
const snapshotResult = context.NKProBillingWorkflow.createSnapshot();
assert.equal(snapshotResult.snapshotFormat, "nk-pro-billing-snapshot", "Snapshot wird nicht über den Workflow erzeugt.");
assert.equal(commits, 0, "Snapshot-Erstellung hat unerwartet committed.");
const yearResult = context.NKProBillingWorkflow.setYear("2027");
assert.equal(yearResult.changed, true);
assert.equal(state.meta.abrechnungsbeginn, "2027-01-01");
assert.equal(commits, 1, "Periodenaktion committet nicht genau einmal.");
const finalizeProbe = context.NKProBillingWorkflow.finalize();
assert.equal(finalizeProbe.requiresConfirmation, true, "Finalisierung fordert keine UI-Bestätigung an.");
assert.equal(commits, 1, "Finalisierungsprüfung hat bereits committed.");
const finalizeResult = context.NKProBillingWorkflow.finalize({ confirmed:true });
assert.equal(finalizeResult.changed, true);
assert.equal(state.meta.currentBillingFinalized, true);
assert.equal(commits, 2, "Finalisierung committet nicht genau einmal.");

process.stdout.write(`AP9-Kernorchestrierungsprüfung abgeschlossen: ${removedTopLevelFunctions.length} Implementierungen physisch verschoben, ${baselineInventory.compatibilityWrappersRemoved.length} Übergangsweiterleitungen entfernt, drei DOM-/speicherfreie Module, atomare Einzelcommits und Rollback sind konsistent.\n`);
