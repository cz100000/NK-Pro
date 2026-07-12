"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const fail = message => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

async function main() {
  const packageJson = JSON.parse(read("package.json"));
  const manifest = JSON.parse(read("manifest.webmanifest"));
  const project = JSON.parse(read("nk-pro-project.json"));
  const app = read("js/app.js");
  const seed = read("js/default-seed.js");
  const html = read("index.html");
  const workerSource = read("service-worker.js");

  assert(packageJson.version === "99.4.2", "package.json besitzt nicht Version 99.4.2.");
  assert(manifest.version === "99.4.2", "Manifest besitzt nicht Version 99.4.2.");
  assert(project.appVersion === "99.4.2" && project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Projektmetadaten sind inkonsistent.");
  assert(app.includes('const APP_VERSION = "V99.4.2";'), "APP_VERSION ist inkonsistent.");
  assert(app.includes('const APP_VERSION_NAME = "Verbindliche Datenebenen und Snapshot-Grenzen";'), "APP_VERSION_NAME ist inkonsistent.");
  assert(!/^const SEED\s*=/m.test(app), "SEED ist weiterhin in app.js eingebettet.");
  assert(/^const SEED\s*=/m.test(seed), "js/default-seed.js enthält keinen SEED.");
  assert(!/\bUMLAGE_MANUAL\b/.test(seed), "js/default-seed.js besitzt weiterhin eine Ladeabhängigkeit zu app.js.");
  assert(app.includes("const DATA_LAYER_CONTRACT_VERSION = 1;"), "Datenebenenvertrag ist inkonsistent.");
  assert(app.includes('const ARCHIVE_SNAPSHOT_SCOPE = "billingSnapshot";'), "Snapshot-Rolle ist inkonsistent.");
  for (const forbiddenSnapshotKey of ['"jahresArchiv"', '"stammdaten"', '"waterMeterHistory"']) {
    const allowList = app.slice(app.indexOf("const ARCHIVE_SNAPSHOT_DATA_KEYS"), app.indexOf("const SNAPSHOT_TECHNICAL_META_KEYS"));
    assert(!allowList.includes(forbiddenSnapshotKey), `Snapshot-Feldliste enthält verbotenen Schlüssel ${forbiddenSnapshotKey}.`);
  }
  assert(html.includes("<title>NK-Pro V99.4.2 – Datenebenen und Snapshot-Grenzen</title>"), "HTML-Titel ist inkonsistent.");

  const expectedScripts = [
    "./js/navigation.js",
    "./js/modal-events.js",
    "./js/default-seed.js",
    "./js/app.js",
    "./js/service-worker-register.js"
  ];
  const actualScripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  assert(JSON.stringify(actualScripts) === JSON.stringify(expectedScripts), `Skriptreihenfolge abweichend: ${JSON.stringify(actualScripts)}`);

  assert(workerSource.includes('const CACHE_NAME = "nk-pro-v99-4-2";'), "Service-Worker-Cache ist inkonsistent.");
  for (const resource of ["./js/default-seed.js", "./js/app.js", "./manifest.webmanifest"]) {
    assert(workerSource.includes(`"${resource}"`), `App-Shell enthält ${resource} nicht.`);
  }

  const listeners = {};
  const log = { added: [], deleted: [], skipWaiting: 0, claimed: 0 };
  const cacheNames = new Set(["nk-pro-v99-3-0", "nk-pro-v99-4-0", "nk-pro-v99-4-1", "nk-pro-v99-4-2", "fremder-cache"]);
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
    clients: { async claim() { log.claimed += 1; } }
  };
  vm.runInNewContext(workerSource, { self, caches, fetch: async () => ({ clone() { return this; } }) });
  let installPromise;
  listeners.install({ waitUntil(promise) { installPromise = promise; } });
  await installPromise;
  let activatePromise;
  listeners.activate({ waitUntil(promise) { activatePromise = promise; } });
  await activatePromise;
  assert(log.added.includes("./js/default-seed.js"), "SEED-Datei wurde nicht in den App-Shell aufgenommen.");
  assert(cacheNames.size === 1 && cacheNames.has("nk-pro-v99-4-2"), "Alt-Caches wurden nicht vollständig entfernt.");
  assert(log.skipWaiting === 1 && log.claimed === 1, "Service-Worker-Lebenszyklus ist unvollständig.");

  for (const required of ["NK-PRO-PROJEKTSTAND.md", "NK-PRO-ARBEITSREGELN.md", "DATENEBENEN_UND_SNAPSHOT_GRENZEN.md", "testdaten/fixture-manifest.json"]) {
    assert(fs.existsSync(path.join(root, required)), `${required} fehlt.`);
  }
  for (const removed of [
    "testdaten/standardfall.json",
    "testdaten/mieterwechsel.json",
    "testdaten/leerstand.json",
    "testdaten/eigentuemer-m000.json",
    "testdaten/alle-eingabequellen.json",
    "testdaten/altdaten-migration.json"
  ]) {
    assert(!fs.existsSync(path.join(root, removed)), `Redundante Vollkopie vorhanden: ${removed}`);
  }

  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: Version, Datenebenenvertrag, Skriptreihenfolge, PWA-App-Shell, Cachewechsel und Arbeitsstruktur sind konsistent.\n");
}

main().catch(error => {
  process.stderr.write(`FEHLER: ${error.message}\n`);
  process.exit(1);
});
