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
  const sources = Object.fromEntries([
    "app", "persistence", "migration", "backup-recovery", "meter-master", "meter-readings",
    "meter-periods", "meter-validation", "object-standard", "billing-snapshot", "archive", "default-seed"
  ].map(name => [name, read(`js/${name}.js`)]));
  const html = read("index.html");
  const workerSource = read("service-worker.js");

  assert(packageJson.version === "99.4.6" && packageJson.name === "nk-pro-v99-4-6", "package.json besitzt nicht Version 99.4.6.");
  assert(manifest.version === "99.4.6" && manifest.name.includes("V99.4.6"), "Manifest besitzt nicht Version 99.4.6.");
  assert(project.appVersion === "99.4.6" && project.basedOn === "99.4.5", "Projektversionsmetadaten sind inkonsistent.");
  assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenschema oder Datenebenenvertrag wurde unbeabsichtigt geändert.");
  assert(project.objectStandardVersion === 1 && project.billingSnapshotVersion === 2, "Objektstandard- oder Snapshot-Version ist inkonsistent.");
  for (const key of ["meterMasterStandardVersion", "meterReadingStandardVersion", "meterPeriodStandardVersion", "meterAssignmentStandardVersion", "meterReplacementStandardVersion"]) {
    assert(project[key] === 1, `${key} fehlt oder ist inkonsistent.`);
  }
  assert(sources.app.includes('const APP_VERSION = "V99.4.6";'), "APP_VERSION ist inkonsistent.");
  assert(sources.app.includes('const APP_VERSION_NAME = "Zählerstammdaten und Messperioden";'), "APP_VERSION_NAME ist inkonsistent.");
  assert(sources.app.includes("const DATA_SCHEMA_VERSION = 5;") && sources.app.includes("const DATA_LAYER_CONTRACT_VERSION = 1;"), "Laufzeit-Datenvertrag ist inkonsistent.");
  assert(!/^const SEED\s*=/m.test(sources.app) && /^const SEED\s*=/m.test(sources["default-seed"]), "SEED-Modulgrenze ist inkonsistent.");

  for (const [name, key] of [
    ["Persistenz", "persistence"], ["Migration", "migration"], ["Backup/Restore", "backup-recovery"],
    ["Zählerstammdaten", "meter-master"], ["Messwerte", "meter-readings"], ["Messperioden", "meter-periods"],
    ["Zählervalidierung", "meter-validation"], ["Objektstandard", "object-standard"],
    ["Abrechnungssnapshot", "billing-snapshot"], ["Archiv", "archive"]
  ]) assert(sources[key].includes("Object.freeze"), `${name}-Modul exportiert keine feste Schnittstelle.`);

  assert(sources["meter-master"].includes("const METER_MASTER_STANDARD_VERSION = 1;") && sources["meter-master"].includes('const ELECTRICITY_DUMMY_METER_TYPE = "electricity-dummy";'), "Zählerstammdatenstandard oder Dummy-Typ fehlt.");
  assert(sources["meter-readings"].includes("const READING_STANDARD_VERSION = 1;") && sources["meter-readings"].includes("ersetztMesswertId"), "Messwertstandard oder Korrekturbezug fehlt.");
  assert(sources["meter-periods"].includes("const MEASUREMENT_PERIOD_STANDARD_VERSION = 1;") && sources["meter-periods"].includes("registerMeterReplacement") && sources["meter-periods"].includes("consumptionForCostAndTenant"), "Messperioden-, Wechsel- oder Verbrauchslogik fehlt.");
  assert(sources["meter-validation"].includes("const METERING_STANDARD_VERSION = 1;") && sources["meter-validation"].includes("validateMeteringData") && sources["meter-validation"].includes("createSnapshotProjection"), "Zählerstandard-Validierung ist unvollständig.");
  assert(sources["meter-master"].includes("abrechnungsrelevant:false") && sources["meter-master"].includes('billingRole:"excluded"'), "Stromzähler-Dummy ist nicht eindeutig ausgeschlossen.");
  assert(sources["billing-snapshot"].includes("const BILLING_SNAPSHOT_VERSION = 2;") && sources["billing-snapshot"].includes("SUPPORTED_BILLING_SNAPSHOT_VERSIONS = Object.freeze([1, 2])"), "Snapshot-2-Format oder V1-Kompatibilität fehlt.");
  assert(sources.archive.includes("markLegacySnapshot") && sources.archive.includes("validateBillingSnapshot"), "Archiv behandelt neue und historische Snapshots nicht getrennt.");
  assert(sources.app.includes('migrationId:"metering-standard-v1"') && sources.app.includes("migrateMeteringData"), "Vor-Migrationssicherung oder Zählerstandard-Migration fehlt.");
  assert(sources.app.includes('"zaehlerDaten"') && sources.app.includes("validateBillingReadiness(state)"), "Zählerdaten sind nicht in Snapshot-Grenze und Erstellung integriert.");

  assert(!/\blocalStorage\b/.test(sources.app), "app.js greift direkt auf localStorage zu.");
  assert(/\blocalStorage\b/.test(sources.persistence), "Persistenzmodul enthält keinen Browser-Speicheradapter.");
  for (const key of ["migration", "backup-recovery", "meter-master", "meter-readings", "meter-periods", "meter-validation", "object-standard", "billing-snapshot", "archive"]) {
    assert(!/\blocalStorage\b/.test(sources[key]), `${key} greift direkt auf localStorage zu.`);
  }
  assert(sources.migration.includes("const MIGRATION_REGISTRY = Object.freeze") && sources.migration.includes("executeMigrationTransaction"), "Migrationsfundament wurde beschädigt.");
  assert(sources["backup-recovery"].includes("createBackupEnvelope") && sources["backup-recovery"].includes("restoreBackupEnvelope"), "Backup-/Restore-Fundament wurde beschädigt.");

  const expectedScripts = [
    "./js/navigation.js", "./js/modal-events.js", "./js/persistence.js", "./js/migration.js", "./js/backup-recovery.js",
    "./js/meter-master.js", "./js/meter-readings.js", "./js/meter-periods.js", "./js/meter-validation.js",
    "./js/object-standard.js", "./js/billing-snapshot.js", "./js/archive.js", "./js/default-seed.js", "./js/app.js", "./js/service-worker-register.js"
  ];
  const actualScripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  assert(JSON.stringify(actualScripts) === JSON.stringify(expectedScripts), `Skriptreihenfolge abweichend: ${JSON.stringify(actualScripts)}`);
  assert(html.includes("<title>NK-Pro V99.4.6 – Zählerstammdaten und Messperioden</title>"), "HTML-Titel ist inkonsistent.");

  assert(workerSource.includes('const CACHE_NAME = "nk-pro-v99-4-6";'), "Service-Worker-Cache ist inkonsistent.");
  for (const resource of expectedScripts) assert(workerSource.includes(`"${resource}"`) || ["./js/navigation.js", "./js/modal-events.js"].includes(resource), `App-Shell enthält ${resource} nicht.`);
  const listeners = {};
  const cacheNames = new Set(["nk-pro-v99-4-4", "nk-pro-v99-4-5", "fremder-cache"]);
  const log = { added:[], deleted:[], skipWaiting:0, claimed:0 };
  const cacheApi = { async addAll(items) { log.added.push(...items); }, async put() {} };
  const caches = { async open(name) { cacheNames.add(name); return cacheApi; }, async keys() { return [...cacheNames]; }, async delete(name) { log.deleted.push(name); return cacheNames.delete(name); }, async match() { return null; } };
  const self = { addEventListener(name, handler) { listeners[name] = handler; }, async skipWaiting() { log.skipWaiting += 1; }, clients:{ async claim() { log.claimed += 1; } } };
  vm.runInNewContext(workerSource, { self, caches, fetch:async () => ({ clone() { return this; } }) });
  let installPromise; listeners.install({ waitUntil(promise) { installPromise = promise; } }); await installPromise;
  let activatePromise; listeners.activate({ waitUntil(promise) { activatePromise = promise; } }); await activatePromise;
  assert(cacheNames.size === 1 && cacheNames.has("nk-pro-v99-4-6"), "Alt-Caches wurden nicht vollständig entfernt.");
  assert(log.skipWaiting === 1 && log.claimed === 1, "Service-Worker-Lebenszyklus ist unvollständig.");

  for (const required of [
    "NK-PRO-PROJEKTSTAND.md", "NK-PRO-ARBEITSREGELN.md", "DATENEBENEN_UND_SNAPSHOT_GRENZEN.md",
    "MODULARISIERUNG_PERSISTENZ_MIGRATION_ARCHIV.md", "MIGRATIONS_SICHERUNGS_RESTORE_ROLLBACK_FUNDAMENT.md",
    "OBJEKTSTANDARD_UND_ABRECHNUNGSSNAPSHOT.md", "ZAEHLERSTAMMDATEN_UND_MESSPERIODEN.md", "AP5_PRUEFBERICHT.md",
    "testdaten/fixture-manifest.json", "tests/metering-domain.test.cjs"
  ]) assert(fs.existsSync(path.join(root, required)), `${required} fehlt.`);

  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.6, Zählerstandard 1, Snapshot 2, V1-Kompatibilität, Dummy-Ausschluss, Datenvertrag, Module, PWA-App-Shell und Migrationsfundament sind konsistent.\n");
}

main().catch(error => { process.stderr.write(`FEHLER: ${error.message}\n`); process.exit(1); });
