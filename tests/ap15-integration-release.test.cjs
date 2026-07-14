"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const project = JSON.parse(read("nk-pro-project.json"));
const packageJson = JSON.parse(read("package.json"));
const navigationPages = read("js/ui-navigation-pages.js");
const costs = read("js/ui-costs.js");
const browserIo = read("js/browser-io.js");
const persistence = read("js/app-state-persistence.js");
const worker = read("service-worker.js");
const config = read("playwright.config.cjs");

assert.equal(project.appVersion, "99.4.23");
assert.equal(project.basedOn, "99.4.22-AP19");
assert.equal(project.schemaVersion, 5);
assert.equal(project.dataLayerContractVersion, 1);
assert.equal(project.billingSnapshotVersion, 2);
assert.equal(project.documentLayoutVersion, 4);
assert.equal(project.pwaCacheName, "nk-pro-v99-4-23-ap20");
assert.equal(project.releaseHardeningVersion, 1);
assert.equal(project.releaseContentPolicyVersion, 1);
assert.equal(project.transientUiResetVersion, 1);

assert.equal(packageJson.name, "nk-pro-v99-4-23");
assert.equal(packageJson.version, "99.4.23");
assert(packageJson.scripts["test:contents"], "ZIP-Inhaltsprüfung fehlt im Paket.");
assert(packageJson.scripts["test:ap15"], "AP15-Testskript fehlt.");
assert(packageJson.scripts["release:check"], "Release-Prüfskript fehlt.");

assert(navigationPages.includes("function resetTransientUiState(options = {})"), "Zentrale Bereinigung transienter UI-Zustände fehlt.");
assert(navigationPages.includes('const contextBoundary = ["landing", "start", "archiv"].includes(tabId);'), "Kontextgrenzen lösen keine UI-Bereinigung aus.");
assert(costs.includes("function resetCostUiState()"), "Kostenfilter-/Auswahlzustand wird nicht zurückgesetzt.");
assert(browserIo.includes('switchToTab("landing")'), "Import/Reset kehrt nicht kontrolliert zur Startseite zurück.");
assert(persistence.includes('resetTransientUiState({ resetPageState:true })'), "Restore/Rollback bereinigt keine transienten Zustände.");

assert(worker.includes('const CACHE_PREFIX = "nk-pro-";'), "NK-Pro-Cachepräfix fehlt.");
assert(worker.includes('key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME'), "Service Worker begrenzt Cachebereinigung nicht auf NK-Pro.");
assert(worker.includes('requestUrl.origin !== self.location.origin'), "Same-Origin-Begrenzung fehlt.");
assert(worker.includes('if (response && response.ok)'), "Nur erfolgreiche Antworten dürfen dynamisch gecacht werden.");
assert(worker.includes('event.request.mode === "navigate"'), "Offline-Navigationsfallback fehlt.");
assert(config.includes("fullyParallel: false") && config.includes("workers: 1"), "Reproduzierbarer serieller Browserlauf fehlt.");

for (const file of [
  "AP15_GESAMTINTEGRATION_RELEASEHAERTUNG_UND_SCHLANKE_ARBEITSBASIS.md",
  "AP15_PRUEFBERICHT.md",
  "AP15_TEST_RESULTS.json",
  "AP15_DATEIAENDERUNGEN.md",
  "AP15_DATEIAENDERUNGEN.json",
  "AP15_ZIP_INHALTSPRUEFUNG.md",
  "AP15_UEBERGABEREGEL.md",
  "tools/check-release-contents.cjs",
  "tests/ap15-integration-release.spec.js"
]) assert(fs.existsSync(path.join(root, file)), `${file} fehlt.`);

const contentCheck = childProcess.execFileSync(process.execPath, [path.join(root, "tools/check-release-contents.cjs"), "--ignore-node-modules", "--json"], { encoding:"utf8" });
const contentReport = JSON.parse(contentCheck);
assert.equal(contentReport.status, "passed", JSON.stringify(contentReport.findings));

process.stdout.write("AP15-Strukturprüfung abgeschlossen: Integrationsgrenzen, transiente UI-Zustände, PWA-Härtung, serielle Reproduzierbarkeit und schlanke Arbeitsbasis sind konsistent.\n");
