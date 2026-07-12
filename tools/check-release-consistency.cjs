"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function main() {
  const packageJson = JSON.parse(read("package.json"));
  const manifest = JSON.parse(read("manifest.webmanifest"));
  const project = JSON.parse(read("nk-pro-project.json"));
  const moduleNames = [
    "app", "ui-preferences", "navigation", "persistence", "migration", "backup-recovery",
    "meter-master", "meter-readings", "meter-periods", "meter-validation", "object-standard",
    "billing-snapshot", "archive", "billing-calculation", "document-data", "document-renderer",
    "export-service", "ui-table-tools", "app-bootstrap", "compatibility", "default-seed"
  ];
  const sources = Object.fromEntries(moduleNames.map(name => [name, read(`js/${name}.js`)]));
  const html = read("index.html");
  const workerSource = read("service-worker.js");

  assert(packageJson.version === "99.4.7" && packageJson.name === "nk-pro-v99-4-7", "package.json besitzt nicht Version 99.4.7.");
  assert(manifest.version === "99.4.7" && manifest.name.includes("V99.4.7"), "Manifest besitzt nicht Version 99.4.7.");
  assert(project.appVersion === "99.4.7" && project.basedOn === "99.4.6", "Projektversionsmetadaten sind inkonsistent.");
  assert(project.architectureVersion === 1 && project.compatibilityLayerVersion === 1, "Architektur- oder Kompatibilitätsschichtversion fehlt.");
  assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenschema oder Datenebenenvertrag wurde unbeabsichtigt geändert.");
  assert(project.objectStandardVersion === 1 && project.billingSnapshotVersion === 2, "Objektstandard- oder Snapshot-Version ist inkonsistent.");
  for (const key of ["meterMasterStandardVersion", "meterReadingStandardVersion", "meterPeriodStandardVersion", "meterAssignmentStandardVersion", "meterReplacementStandardVersion"]) {
    assert(project[key] === 1, `${key} fehlt oder ist inkonsistent.`);
  }

  assert(sources.app.includes('const APP_VERSION = "V99.4.7";'), "APP_VERSION ist inkonsistent.");
  assert(sources.app.includes('const APP_VERSION_NAME = "Weitere fachliche Modularisierung";'), "APP_VERSION_NAME ist inkonsistent.");
  assert(sources.app.includes("const DATA_SCHEMA_VERSION = 5;") && sources.app.includes("const DATA_LAYER_CONTRACT_VERSION = 1;"), "Laufzeit-Datenvertrag ist inkonsistent.");
  assert(!/^const SEED\s*=/m.test(sources.app) && /^const SEED\s*=/m.test(sources["default-seed"]), "SEED-Modulgrenze ist inkonsistent.");
  assert(sources.app.split(/\r?\n/).length < 9500, "app.js wurde in AP6 nicht wirksam verkleinert.");

  for (const [name, key] of [
    ["UI-Einstellungen", "ui-preferences"], ["Persistenz", "persistence"], ["Migration", "migration"],
    ["Backup/Restore", "backup-recovery"], ["Zählerstammdaten", "meter-master"], ["Messwerte", "meter-readings"],
    ["Messperioden", "meter-periods"], ["Zählervalidierung", "meter-validation"], ["Objektstandard", "object-standard"],
    ["Abrechnungssnapshot", "billing-snapshot"], ["Archiv", "archive"], ["Abrechnungsberechnung", "billing-calculation"],
    ["Dokumentdaten", "document-data"], ["Dokumentrenderer", "document-renderer"], ["Export", "export-service"],
    ["Tabellenhilfen", "ui-table-tools"], ["Anwendungsstart", "app-bootstrap"], ["Kompatibilität", "compatibility"]
  ]) assert(sources[key].includes("Object.freeze"), `${name}-Modul exportiert keine feste Schnittstelle.`);

  assert(!/\bdocument\b|\bwindow\b|\blocalStorage\b|\bindexedDB\b/.test(sources["billing-calculation"]), "Berechnungsmodul enthält UI- oder Speicherzugriffe.");
  assert(!/\bdocument\b|\blocalStorage\b|\bindexedDB\b/.test(sources["document-data"]), "Dokumentdatenmodul enthält DOM- oder Speicherzugriffe.");
  for (const [fn, moduleName] of [
    ["calculateUmlage", "billingCalculation"], ["allocationForCost", "billingCalculation"],
    ["prepaymentAdjustmentData", "billingCalculation"], ["briefCostRows", "documentData"],
    ["buildBriefHtml", "documentRenderer"], ["downloadFullExportPackage", "exportService"],
    ["enhanceTables", "uiTableTools"]
  ]) {
    assert(sources.app.includes(`function ${fn}(...args) { return NK_PRO_MODULES.${moduleName}.${fn}(...args); }`), `Kompatibilitätswrapper ${fn} ist nicht rein.`);
  }

  assert(sources["meter-master"].includes("const METER_MASTER_STANDARD_VERSION = 1;") && sources["meter-master"].includes('const ELECTRICITY_DUMMY_METER_TYPE = "electricity-dummy";'), "Zählerstammdatenstandard oder Dummy-Typ fehlt.");
  assert(sources["meter-readings"].includes("const READING_STANDARD_VERSION = 1;") && sources["meter-readings"].includes("ersetztMesswertId"), "Messwertstandard oder Korrekturbezug fehlt.");
  assert(sources["meter-periods"].includes("const MEASUREMENT_PERIOD_STANDARD_VERSION = 1;") && sources["meter-periods"].includes("registerMeterReplacement") && sources["meter-periods"].includes("consumptionForCostAndTenant"), "Messperioden-, Wechsel- oder Verbrauchslogik fehlt.");
  assert(sources["meter-validation"].includes("const METERING_STANDARD_VERSION = 1;") && sources["meter-validation"].includes("validateMeteringData") && sources["meter-validation"].includes("createSnapshotProjection"), "Zählerstandard-Validierung ist unvollständig.");
  assert(sources["meter-master"].includes("abrechnungsrelevant:false") && sources["meter-master"].includes('billingRole:"excluded"'), "Stromzähler-Dummy ist nicht eindeutig ausgeschlossen.");
  assert(sources["billing-snapshot"].includes("const BILLING_SNAPSHOT_VERSION = 2;") && sources["billing-snapshot"].includes("SUPPORTED_BILLING_SNAPSHOT_VERSIONS = Object.freeze([1, 2])"), "Snapshot-2-Format oder V1-Kompatibilität fehlt.");
  assert(sources.archive.includes("markLegacySnapshot") && sources.archive.includes("validateBillingSnapshot"), "Archiv behandelt neue und historische Snapshots nicht getrennt.");
  assert(sources.app.includes('migrationId:"metering-standard-v1"') && sources.app.includes("migrateMeteringData"), "Vor-Migrationssicherung oder Zählerstandard-Migration fehlt.");
  assert(sources.app.includes('"zaehlerDaten"') && sources.app.includes("validateBillingReadiness(state)"), "Zählerdaten sind nicht in Snapshot-Grenze und Erstellung integriert.");

  const productiveStorageUsers = moduleNames.filter(name => /\blocalStorage\b/.test(sources[name])).sort();
  assert(JSON.stringify(productiveStorageUsers) === JSON.stringify(["persistence", "ui-preferences"]), `Direkte Speicherzugriffe außerhalb der Adapter: ${productiveStorageUsers.join(", ")}`);
  assert(sources.migration.includes("const MIGRATION_REGISTRY = Object.freeze") && sources.migration.includes("executeMigrationTransaction"), "Migrationsfundament wurde beschädigt.");
  assert(sources["backup-recovery"].includes("createBackupEnvelope") && sources["backup-recovery"].includes("restoreBackupEnvelope"), "Backup-/Restore-Fundament wurde beschädigt.");

  const expectedScripts = [
    "./js/ui-preferences.js", "./js/navigation.js", "./js/modal-events.js", "./js/persistence.js", "./js/migration.js",
    "./js/backup-recovery.js", "./js/meter-master.js", "./js/meter-readings.js", "./js/meter-periods.js",
    "./js/meter-validation.js", "./js/object-standard.js", "./js/billing-snapshot.js", "./js/archive.js",
    "./js/billing-calculation.js", "./js/document-data.js", "./js/document-renderer.js", "./js/export-service.js",
    "./js/ui-table-tools.js", "./js/app-bootstrap.js", "./js/compatibility.js", "./js/default-seed.js",
    "./js/app.js", "./js/service-worker-register.js"
  ];
  const actualScripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  assert(JSON.stringify(actualScripts) === JSON.stringify(expectedScripts), `Skriptreihenfolge abweichend: ${JSON.stringify(actualScripts)}`);
  assert(html.includes("<title>NK-Pro V99.4.7 – Weitere fachliche Modularisierung</title>"), "HTML-Titel ist inkonsistent.");

  assert(workerSource.includes('const CACHE_NAME = "nk-pro-v99-4-7";'), "Service-Worker-Cache ist inkonsistent.");
  for (const resource of expectedScripts) assert(workerSource.includes(`"${resource}"`) || resource === "./js/modal-events.js", `App-Shell enthält ${resource} nicht.`);
  const listeners = {};
  const cacheNames = new Set(["nk-pro-v99-4-5", "nk-pro-v99-4-6", "fremder-cache"]);
  const log = { added:[], deleted:[], skipWaiting:0, claimed:0 };
  const cacheApi = { async addAll(items) { log.added.push(...items); }, async put() {} };
  const caches = { async open(name) { cacheNames.add(name); return cacheApi; }, async keys() { return [...cacheNames]; }, async delete(name) { log.deleted.push(name); return cacheNames.delete(name); }, async match() { return null; } };
  const self = { addEventListener(name, handler) { listeners[name] = handler; }, async skipWaiting() { log.skipWaiting += 1; }, clients:{ async claim() { log.claimed += 1; } } };
  vm.runInNewContext(workerSource, { self, caches, fetch:async () => ({ clone() { return this; } }) });
  let installPromise; listeners.install({ waitUntil(promise) { installPromise = promise; } }); await installPromise;
  let activatePromise; listeners.activate({ waitUntil(promise) { activatePromise = promise; } }); await activatePromise;
  assert(cacheNames.size === 1 && cacheNames.has("nk-pro-v99-4-7"), "Alt-Caches wurden nicht vollständig entfernt.");
  assert(log.skipWaiting === 1 && log.claimed === 1, "Service-Worker-Lebenszyklus ist unvollständig.");

  for (const required of [
    "NK-PRO-PROJEKTSTAND.md", "NK-PRO-ARBEITSREGELN.md", "DATENEBENEN_UND_SNAPSHOT_GRENZEN.md",
    "MODULARISIERUNG_PERSISTENZ_MIGRATION_ARCHIV.md", "MIGRATIONS_SICHERUNGS_RESTORE_ROLLBACK_FUNDAMENT.md",
    "OBJEKTSTANDARD_UND_ABRECHNUNGSSNAPSHOT.md", "ZAEHLERSTAMMDATEN_UND_MESSPERIODEN.md", "AP5_PRUEFBERICHT.md",
    "AP6_WEITERE_FACHLICHE_MODULARISIERUNG.md", "AP6_PRUEFBERICHT.md", "MODULE_UEBERSICHT.md",
    "VERANTWORTLICHKEITSMATRIX.md", "ABHAENGIGKEITSUEBERSICHT.md", "KOMPATIBILITAETSSCHICHT.md",
    "ANWENDUNGSSTART.md", "GLOBALE_SCHNITTSTELLEN_INVENTAR.md", "tests/ap6-modularization.test.cjs",
    "testdaten/fixture-manifest.json", "tests/metering-domain.test.cjs"
  ]) assert(fs.existsSync(path.join(root, required)), `${required} fehlt.`);

  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.7, Architektur 1, Datenschema 5, Datenebenenvertrag 1, Zählerstandard 1, Snapshot 2, reine Kompatibilitätswrapper und vollständiger PWA-App-Shell sind konsistent.\n");
}

main().catch(error => { process.stderr.write(`FEHLER: ${error.message}\n`); process.exit(1); });
