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
  const app = read("js/app.js");
  const persistence = read("js/persistence.js");
  const migration = read("js/migration.js");
  const backupRecovery = read("js/backup-recovery.js");
  const objectStandard = read("js/object-standard.js");
  const billingSnapshot = read("js/billing-snapshot.js");
  const archive = read("js/archive.js");
  const seed = read("js/default-seed.js");
  const html = read("index.html");
  const workerSource = read("service-worker.js");

  assert(packageJson.version === "99.4.5", "package.json besitzt nicht Version 99.4.5.");
  assert(manifest.version === "99.4.5", "Manifest besitzt nicht Version 99.4.5.");
  assert(project.appVersion === "99.4.5" && project.basedOn === "99.4.4", "Projektversionsmetadaten sind inkonsistent.");
  assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenschema oder Datenebenenvertrag wurde unbeabsichtigt geändert.");
  assert(project.objectStandardVersion === 1 && project.billingSnapshotVersion === 1, "Objektstandard- oder Snapshot-Version fehlt.");
  assert(app.includes('const APP_VERSION = "V99.4.5";'), "APP_VERSION ist inkonsistent.");
  assert(app.includes('const APP_VERSION_NAME = "Objektstandard und Abrechnungssnapshot";'), "APP_VERSION_NAME ist inkonsistent.");
  assert(app.includes("const DATA_SCHEMA_VERSION = 5;") && app.includes("const DATA_LAYER_CONTRACT_VERSION = 1;"), "Laufzeit-Datenvertrag ist inkonsistent.");
  assert(!/^const SEED\s*=/m.test(app) && /^const SEED\s*=/m.test(seed), "SEED-Modulgrenze ist inkonsistent.");

  for (const [name, source, marker] of [
    ["Persistenz", persistence, "global.NKProPersistence = Object.freeze"],
    ["Migration", migration, "global.NKProMigration = Object.freeze"],
    ["Backup/Restore", backupRecovery, "global.NKProBackupRecovery = Object.freeze"],
    ["Objektstandard", objectStandard, "global.NKProObjectStandard = Object.freeze"],
    ["Abrechnungssnapshot", billingSnapshot, "global.NKProBillingSnapshot = Object.freeze"],
    ["Archiv", archive, "global.NKProArchive = Object.freeze"]
  ]) assert(source.includes(marker), `${name}-Modul exportiert keine feste Schnittstelle.`);

  assert(objectStandard.includes('const OBJECT_STANDARD_VERSION = 1;'), "Objektstandard-Version fehlt.");
  assert(objectStandard.includes('const ELECTRICITY_DUMMY_METER_TYPE = "electricity-dummy";'), "Stromzähler-Dummy-Typ fehlt.");
  assert(objectStandard.includes("abrechnungsrelevant = false") && objectStandard.includes('billingRole = "excluded"'), "Stromzähler-Dummy ist nicht eindeutig ausgeschlossen.");
  assert(billingSnapshot.includes('const BILLING_SNAPSHOT_FORMAT = "nk-pro-billing-snapshot";'), "Snapshot-Format fehlt.");
  assert(billingSnapshot.includes("validateBillingReadiness") && billingSnapshot.includes("validateBillingSnapshot") && billingSnapshot.includes("createBillingSnapshot"), "Snapshot-Lebenszyklus ist unvollständig.");
  assert(billingSnapshot.includes("snapshotId") && billingSnapshot.includes("integrity") && billingSnapshot.includes("deepFreeze"), "Snapshot-ID, Integrität oder Unveränderlichkeit fehlt.");
  assert(archive.includes("markLegacySnapshot") && archive.includes("validateBillingSnapshot"), "Archiv behandelt neue und historische Snapshots nicht getrennt.");
  assert(app.includes('migrationId:"object-standard-v1"'), "Vor-Migrationssicherung für Objektstandard fehlt.");
  assert(app.includes('"objektStandard"') && app.includes("validateBillingReadiness(state)"), "Objektstandard ist nicht in Snapshot-Grenze und Erstellung integriert.");

  assert(!/\blocalStorage\b/.test(app), "app.js greift direkt auf localStorage zu.");
  assert(/\blocalStorage\b/.test(persistence), "Persistenzmodul enthält keinen Browser-Speicheradapter.");
  for (const source of [migration, backupRecovery, objectStandard, billingSnapshot, archive]) assert(!/\blocalStorage\b/.test(source), "Fachmodule greifen direkt auf localStorage zu.");
  assert(migration.includes("const MIGRATION_REGISTRY = Object.freeze") && migration.includes("executeMigrationTransaction"), "Migrationsfundament wurde beschädigt.");
  assert(backupRecovery.includes("createBackupEnvelope") && backupRecovery.includes("restoreBackupEnvelope"), "Backup-/Restore-Fundament wurde beschädigt.");

  const expectedScripts = [
    "./js/navigation.js",
    "./js/modal-events.js",
    "./js/persistence.js",
    "./js/migration.js",
    "./js/backup-recovery.js",
    "./js/object-standard.js",
    "./js/billing-snapshot.js",
    "./js/archive.js",
    "./js/default-seed.js",
    "./js/app.js",
    "./js/service-worker-register.js"
  ];
  const actualScripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  assert(JSON.stringify(actualScripts) === JSON.stringify(expectedScripts), `Skriptreihenfolge abweichend: ${JSON.stringify(actualScripts)}`);
  assert(html.includes("<title>NK-Pro V99.4.5 – Objektstandard und Abrechnungssnapshot</title>"), "HTML-Titel ist inkonsistent.");

  assert(workerSource.includes('const CACHE_NAME = "nk-pro-v99-4-5";'), "Service-Worker-Cache ist inkonsistent.");
  for (const resource of expectedScripts.filter(item => !item.includes("navigation") && !item.includes("modal-events"))) {
    assert(workerSource.includes(`"${resource}"`), `App-Shell enthält ${resource} nicht.`);
  }

  const listeners = {};
  const cacheNames = new Set(["nk-pro-v99-4-3", "nk-pro-v99-4-4", "fremder-cache"]);
  const log = { added:[], deleted:[], skipWaiting:0, claimed:0 };
  const cacheApi = { async addAll(items) { log.added.push(...items); }, async put() {} };
  const caches = {
    async open(name) { cacheNames.add(name); return cacheApi; },
    async keys() { return [...cacheNames]; },
    async delete(name) { log.deleted.push(name); return cacheNames.delete(name); },
    async match() { return null; }
  };
  const self = {
    addEventListener(name, handler) { listeners[name] = handler; },
    async skipWaiting() { log.skipWaiting += 1; },
    clients:{ async claim() { log.claimed += 1; } }
  };
  vm.runInNewContext(workerSource, { self, caches, fetch:async () => ({ clone() { return this; } }) });
  let installPromise;
  listeners.install({ waitUntil(promise) { installPromise = promise; } });
  await installPromise;
  let activatePromise;
  listeners.activate({ waitUntil(promise) { activatePromise = promise; } });
  await activatePromise;
  assert(cacheNames.size === 1 && cacheNames.has("nk-pro-v99-4-5"), "Alt-Caches wurden nicht vollständig entfernt.");
  assert(log.skipWaiting === 1 && log.claimed === 1, "Service-Worker-Lebenszyklus ist unvollständig.");

  for (const required of [
    "NK-PRO-PROJEKTSTAND.md",
    "NK-PRO-ARBEITSREGELN.md",
    "DATENEBENEN_UND_SNAPSHOT_GRENZEN.md",
    "MODULARISIERUNG_PERSISTENZ_MIGRATION_ARCHIV.md",
    "MIGRATIONS_SICHERUNGS_RESTORE_ROLLBACK_FUNDAMENT.md",
    "OBJEKTSTANDARD_UND_ABRECHNUNGSSNAPSHOT.md",
    "testdaten/fixture-manifest.json"
  ]) assert(fs.existsSync(path.join(root, required)), `${required} fehlt.`);

  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.5, Objektstandard 1, Snapshot 1, Stromzähler-Dummy-Ausschluss, Datenvertrag, Module, PWA-App-Shell und Migrationsfundament sind konsistent.\n");
}

main().catch(error => {
  process.stderr.write(`FEHLER: ${error.message}\n`);
  process.exit(1);
});
