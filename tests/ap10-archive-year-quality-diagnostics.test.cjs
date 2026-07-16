"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const app = read("js/app.js");
const runtimeConfig = read("js/app-runtime-config.js");
const html = read("index.html");
const worker = read("service-worker.js");
const archive = read("js/archive-actions.js");
const year = read("js/year-transition-actions.js");
const quality = read("js/quality-assurance.js");
const diagnostics = read("js/diagnostics.js");
const metrics = JSON.parse(childProcess.execFileSync(process.execPath, [path.join(root, "tools/analyze-app-js.cjs")], { encoding:"utf8" }));
const removed = [
  "activeMonthStartsForData","activePrepaymentMatrixHasValues","activeTenantByUnitMap","appSelfTestReport","appSelfTestSummary","archiveAndPrepareNextYear","archiveCurrentYearOnly","archiveItemLabel","archiveItemValidation","archiveMeta","archivePeriodId","archivePeriodLabel","archiveRecordCorrections","archiveRecordHealth","archiveRecordSaldo","archiveRecordStatus","archiveRecordStatusClass","archiveRecordStatusLite","archiveRecordType","archiveSortKey","archiveStateFromItem","archiveValidationMessage","auditApproxEqual","auditBaseState","auditBriefState","billableRowsByUnit","buildLegacyArchiveStateFromEntries","carryForwardPrepaymentsFromPreviousYear","carryMeterEndToStart","clearAutofilledMeterEndValuesForNewBilling","clearCurrentBillingArchiveClosure","closeCurrentBillingAfterArchive","collectArchiveIdMigrationWarnings","collectQualityChecks","createLegacyArchiveItemFromEntries","duplicateValues","effectivePrepaymentIsoFromPreviousData","ensurePrepaymentCarryForwardIfNeeded","expectedTenantDaysInCurrentPeriod","finalBillingReadiness","findPreviousTenantIndexForCarryForward","formatDiagnosticBytes","hasActiveCurrentBilling","hasNonEmptyAnnualCurrentBillingData","intervalDaysInclusive","isCurrentBillingClosedAfterArchive","isNewCurrentBillingData","markCurrentBillingCreatedByUser","missingBriefFieldsForTenant","monthStartIso","monthTotalForPrepaymentCarryForward","normalizeArchiveItem","normalizeIsoDateValue","normalizeTenantMatchText","numericEndValuesWereManuallyTouchedForYear","numericMeterValueEquals","periodDateEndForData","periodDateStartForData","periodEndForData","periodStartForData","prepareArchiveItemForUse","prepaymentAdjustmentWasPrinted","previousTenantRoleIsPrivate","previousYearArchiveDataForCurrentBilling","releaseAuditReport","releaseAuditReportText","reopenArchiveYearForRework","resetAnnualValuesForNextYear","specialCaseWatchReport","stableStringify","tenantIntervalLabel","tenantIntervalsOverlap","tenantPeriodInterval","tenantQualityLabel","tenantRowsHaveOverlappingIntervals","upsertYearArchive","withAuditState","yearExistsInRecords","yearNumber"
];
for (const name of removed) assert(!new RegExp(`^function\\s+${name}\\s*\\(`, "m").test(app), `Implementierung verbleibt in app.js: ${name}`);
assert(metrics.topLevelFunctionDeclarations <= 10, "app.js enthält zu viele Funktionsverantwortlichkeiten");
assert(metrics.topLevelBindings <= 3, "app.js enthält zu viele globale Bindungen");
assert(metrics.bytes < 20000 && metrics.lines < 300, "app.js wurde nicht auf Start und Orchestrierung reduziert");
assert.equal(metrics.directStatePathReferences, 0);
assert.equal(metrics.directStateWriteSites, 0);
assert.equal(metrics.dynamicGlobalAccesses, 0);
for (const [name, source] of [["archive-actions",archive],["year-transition-actions",year],["quality-assurance",quality]]) {
  assert(!/\b(localStorage|indexedDB|caches)\b/.test(source), `${name} enthält Browser-Speicherzugriff`);
  assert(!/\b(alert|confirm|prompt|switchToTab)\s*\(/.test(source), `${name} enthält UI-Dialog oder Navigation`);
  assert(!/\b(saveData|commitStateChange|renderAll|renderCurrentView)\s*\(/.test(source), `${name} enthält Persistenz-/Renderingaufruf`);
}
assert(!/\b(saveData|commitStateChange|renderAll|renderCurrentView)\s*\(/.test(diagnostics), "Diagnose enthält produktive Persistenz oder Rendering");
assert(!/storageWritable\s*\(\s*\)/.test(diagnostics), "Diagnose führt einen Browser-Speicher-Schreibtest aus");
assert(archive.includes("stateAccess.transact") && year.includes("stateAccess.transact"), "Atomare Transaktionen fehlen");
assert(archive.includes('reason:"Archivierung", render:false') && year.includes('reason:"Jahreswechsel", render:false'), "Anwendungsmodule lösen Rendering aus");
assert(quality.includes("withIsolatedState") && diagnostics.includes("withIsolatedState"), "Seiteneffektfreie Zustandskopie fehlt");
for (const binding of [
  "currentYear:NK_PRO_MODULES.archiveActions.archiveCurrent",
  "reopenForRework:NK_PRO_MODULES.archiveActions.reopenForRework",
  "deleteAt:NK_PRO_MODULES.archiveActions.deleteAt",
  "importItems:NK_PRO_MODULES.archiveActions.importItems",
  "createBilling:NK_PRO_MODULES.yearTransitionActions.createBilling",
  "prepareNextYear:NK_PRO_MODULES.yearTransitionActions.prepareNextYear",
  "inspect:NK_PRO_MODULES.qualityAssurance.inspect"
]) assert(app.includes(binding), `Direkte Anwendungsaktionsbindung fehlt: ${binding}`);
const expected = ["archive-actions.js","year-transition-actions.js","quality-assurance.js","diagnostics.js"];
const scripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="\.\/js\/([^"]+)"><\/script>/g)].map(match => match[1].split("?")[0]);
for (const name of expected) {
  assert(scripts.includes(name), `Script fehlt: ${name}`);
  assert(worker.includes(`"./js/${name}"`), `PWA-App-Shell fehlt: ${name}`);
  assert(scripts.indexOf(name) < scripts.indexOf("app.js"), `${name} wird nach app.js geladen`);
}
assert(runtimeConfig.includes('const APP_VERSION = "V99.4.24";'));
assert(runtimeConfig.includes("const DATA_SCHEMA_VERSION = 5;"));
assert(read("nk-pro-project.json").includes('"billingSnapshotVersion": 2'));
process.stdout.write(`AP10-Orchestrierungsprüfung abgeschlossen: ${removed.length} Implementierungen physisch entfernt, app.js ${metrics.lines} Zeilen/${metrics.bytes} Byte, Archiv/Jahreswechsel atomar und Qualitäts-/Diagnosemodule seiteneffektfrei.\n`);
