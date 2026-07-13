"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const appMetrics = JSON.parse(childProcess.execFileSync(process.execPath, [path.join(root, "tools/analyze-app-js.cjs")], { encoding:"utf8" }));
const architecture = JSON.parse(childProcess.execFileSync(process.execPath, [path.join(root, "tools/analyze-ap12-architecture.cjs")], { encoding:"utf8" }));
const app = read("js/app.js");
const runtimeConfig = read("js/app-runtime-config.js");
const stateOwner = read("js/app-state-persistence.js");
const runtimeDiagnostics = read("js/runtime-diagnostics.js");
const html = read("index.html");
const worker = read("service-worker.js");

assert(appMetrics.lines < 300 && appMetrics.bytes < 20_000, `app.js ist zu groß: ${appMetrics.lines} Zeilen/${appMetrics.bytes} Byte.`);
assert.deepEqual(appMetrics.topLevelFunctionNames.map(item => item.name), [
  "configureCoreOrchestrationModules", "configureStateAccess", "configureApplicationActions",
  "configureNavigationModule", "registerUiControllers", "startUiEvents",
  "updateUiArchitectureAudit", "configureCompatibilityRegistry"
]);
assert.equal(appMetrics.directStatePathReferences, 0, "app.js liest weiterhin direkt Fachzustand.");
assert.equal(appMetrics.directStateWriteSites, 0, "app.js verändert weiterhin direkt Fachzustand.");
assert.equal(appMetrics.globalAssignments, 0, "app.js erzeugt weiterhin globale Bindungen.");
assert(!/^function\s+(?:render|open|close|download|print|setNested|ensureYearData)\w*\s*\(/m.test(app), "app.js enthält UI-, Dialog-, Browser- oder Fachimplementierung.");
assert(!/\b(?:localStorage|sessionStorage|FileReader|Blob|URL\.createObjectURL|navigator\.serviceWorker)\b/.test(app), "app.js enthält Browseradapter-Implementierung.");

assert(runtimeConfig.includes('let state = null;'), "Zustand wird nicht kontrolliert initialisiert.");
assert(stateOwner.includes("function initializeApplicationState()"), "Kontrollierte Zustandsinitialisierung fehlt.");
assert(stateOwner.includes("function replaceApplicationState(nextState)"), "Zentrale Zustandsersetzung fehlt.");
assert.equal(architecture.totals.stateRootAssignments, 1, "Es existieren mehrere direkte Ersetzungen des Anwendungszustands.");
assert.deepEqual(architecture.stateRootAssignments.map(item => `${item.file}:${item.function}`), ["js/app-state-persistence.js:replaceApplicationState"]);

assert.equal(architecture.renderers.length, 46, "Rendererinventar ist unvollständig.");
assert.equal(architecture.renderers.filter(item => item.mutatesState || item.persists || item.navigates || item.opensDialog).length, 0, "Renderer besitzen fachliche Seiteneffekte.");

const oldGlobals = ["__V992_AUDIT__", "__NKPRO_UI_ARCHITECTURE__", "__NKPRO_STARTUP__", "__NKPRO_COMPATIBILITY__"];
const productSource = Object.keys(architecture.files).map(read).join("\n");
oldGlobals.forEach(name => assert(!productSource.includes(name), `Alte window-Bindung verbleibt: ${name}`));
assert(runtimeDiagnostics.includes("global.NKProRuntimeDiagnostics = Object.freeze"), "Gekapselte Laufzeitdiagnose fehlt.");
assert.equal(architecture.totals.globalAssignments, 0, "Unkontrollierte window/globalThis-Zuweisungen verbleiben.");

const removedWrappers = [
  "allocateByWohneinheiten", "allocationDistributionStatus", "allocationForCost", "applyTableFilter",
  "briefCostSortValue", "briefLongTextRisks", "briefMainPageOverflows", "briefProseHtml",
  "briefTextWithLineBreaks", "buildPrepaymentPage",
  "cellSortValue", "clearTableFilter", "costFullyRedistributes", "csvEscape", "csvFileName",
  "downloadAppHtmlCopy", "downloadArchiveIndexCsv", "downloadJson", "eligibleTenantsForCost",
  "ensureTableTools", "finalizeCostAllocationResult",
  "isMeterAutoEnabledForCost", "isWaterAutoEnabledForCost",
  "longestTextLineLength", "periodDaysApprox",
  "personDays", "prepaymentRoundingStep", "printGuideHtml", "roundMonthlyPrepayment",
  "sortTable", "tenantAnnualizationFactor", "tenantArea", "toCsv", "unitHasTenantForAllocation",
  "unitsForCostAllocation", "waterTotalForTenantIndex", "wohnungArea"
];
const wrapperNames = new Set(architecture.compatibilityWrappers.map(item => item.wrapper));
removedWrappers.forEach(name => assert(!wrapperNames.has(name), `Entfernter Legacy-Wrapper ist noch vorhanden: ${name}`));
assert(app.includes("const COMPATIBILITY_WRAPPERS = Object.freeze"), "Kompatibilitätsumfang ist nicht explizit.");
const compatibilityBlock = app.slice(app.indexOf("const COMPATIBILITY_WRAPPERS"), app.indexOf("function configureCompatibilityRegistry"));
assert.equal([...compatibilityBlock.matchAll(/"([A-Za-z_$][\w$]*)"/g)].length, 75, "Explizite Wrapperliste ist unvollständig.");

const splitModules = [
  "runtime-diagnostics.js", "app-runtime-config.js", "app-state-persistence.js", "ui-master-data.js",
  "ui-quality.js", "ui-costs.js", "ui-navigation-pages.js", "ui-archive-pages.js", "browser-io.js",
  "ui-metering.js", "ui-billing-allocation.js", "ui-documents.js", "ui-table-actions.js",
  "ui-diagnostics.js", "ui-page-controller.js"
];
const scripts = architecture.scriptOrder.map(item => item.replace("./js/", ""));
const appIndex = scripts.indexOf("app.js");
splitModules.forEach(name => {
  assert(scripts.includes(name), `Neues Modul fehlt in index.html: ${name}`);
  assert(scripts.indexOf(name) < appIndex, `Neues Modul wird nicht vor app.js geladen: ${name}`);
  assert(worker.includes(`"./js/${name}"`), `Neues Modul fehlt in der Offline-App-Shell: ${name}`);
});
assert(runtimeConfig.includes('const APP_VERSION = "V99.4.16";'));
assert(runtimeConfig.includes('const APP_VERSION_NAME = "AP13-Layoutkorrekturen und Vorschauangleichung";'));
assert(html.includes("NK-Pro V99.4.16 – AP13-Layoutkorrekturen und Vorschauangleichung"));
assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-16";'));

process.stdout.write(`AP12-Architekturprüfung abgeschlossen: app.js ${appMetrics.lines} Zeilen/${appMetrics.bytes} Byte, 1 Zustandsersetzung, ${architecture.renderers.length} seiteneffektfreie Renderer, 37 entfernte Wrapper und keine alten window-Bindungen.\n`);
