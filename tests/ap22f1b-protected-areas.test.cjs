"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const sha = value => crypto.createHash("sha256").update(value).digest("hex");

const protectedFiles = {
  "js/billing-context.js":"5027295c32fc214b80b07f3d35b4e06186a911995e35d2cb9787fdc99f23f1e8",
  "js/navigation.js":"2e9e2c4b0fd8059640c0db073cf47a56364deca484f07dddbc68f7380a49375e",
  "js/ui-navigation-pages.js":"503c0a0673321ffebf36c8877f920b7f90c8f4cd1f307869a0bedb1f31c625e2",
  "js/app.js":"e702d5bb947c9f137c50b97e3ab894f446ac0fe66a1256bf94c3c16372ce2c53",
  "js/ui-master-data.js":"73a29dfa8cd0fdaeda8c39a9e39a2643e28d6f9ff1bff6f3a4e65cc365677207",
  "js/billing-calculation.js":"2d1a130455e6dc0e2b541f80edeb9c12cfd8ffe9f9b0460f368f35030e7050c2",
  "js/persistence.js":"c22eab211ae2d080ce82b3050f83edf173752e610688050330f0f12547cd6c6b",
  "js/migration.js":"24db7607caca48ce1fb244f8bc0d9f3b4835a5e53c47868f02a673c9e9722828",
  "js/backup-recovery.js":"92b2f1df919acf425be770eb554373a23fc54b792249bbb33e88229475760bc7",
  "js/archive.js":"4f148c7df20d5301f4902fd464b584fd39eaa713da9a6a20820a2dfc1ef9c87e",
  "js/export-service.js":"4954c06643fe10afbaa03f7c89aca36a4e20a3fd0336fccca65e1b615b280b87",
  "js/document-renderer.js":"def7bbc7a6fb53c0937840c89ae920b13f2ec710ef0484fa2b4859fef214edda",
  "js/document-data.js":"b96bc414bdd7604962994cd8598fd2832e4d66523799f3051dfc4877317a9775",
  "js/billing-workflow.js":"c87062234d0709b2a9c9fd1a391fa45ad34e3be6b0448e18248976abee6cbcf5",
  "js/app-state-persistence.js":"a337f6c2126d4aeb70dcb702523d5c2f9af2561d3d2f275cdc25dd03047868b8"
};
for (const [file, digest] of Object.entries(protectedFiles)) assert.equal(sha(read(file)), digest, `${file} wurde verändert`);

const html = read("index.html");
function matched(pattern, label) {
  const match = html.match(pattern);
  assert.ok(match, `${label} fehlt`);
  return match[0];
}
assert.equal(sha(matched(/<aside\b[^>]*class="[^"]*app-sidebar[^"]*"[\s\S]*?<\/aside>/, "Navigation")), "9beb233787dc382c5b56a9ae8cdfce03447fa8e3bf8cd8b8843435b14603b427", "Navigation-aside wurde verändert");
assert.equal(sha(matched(/<section aria-label="Abrechnungskontext"[\s\S]*?<\/section>/, "Kontextleiste")), "1f437a7c6354ee0642a57c0cfb7e0344189f6a9342188e70da31e9e462351a51", "Kontextleiste wurde verändert");
assert.equal(sha(matched(/<details[^>]*id="billingPeriodSection"[\s\S]*?<\/details>/, "Zeitraumsektion")), "e28a23124b157ef33293013e0a37d84e00c9edd2df0d727f6716f6c96f2418e0", "#billingPeriodSection wurde verändert");
const lettersStart = html.indexOf('<div class="page-sections"><details class="page-section nk-ui-accordion" id="lettersEditorSection"');
assert.ok(lettersStart >= 0, "Briefinhalt fehlt");
const lettersContent = html.slice(lettersStart, lettersStart + 4815);
assert.equal(sha(lettersContent), "f321dbe82786051ffeaae2b7a43a9673d5a395723f879c8ceda530c838b1a667", "Brief-/Vorschauinhalt wurde verändert");

assert.equal(sha(read("js/ui-page-controller.js")), "453812c664383b040d8c86346dbb79939aab7657f0b69b104e2b264d520d41ab", "ui-page-controller weicht vom freigegebenen Minimalpatch ab");
assert.equal(sha(read("js/ui-individual-values.js")), "f8b7f88a5fb477adffeeeea9afdb354f5011f1bd6c6169cde06781bc960df208", "ui-individual-values weicht vom freigegebenen Minimalpatch ab");

const workerLogic = read("service-worker.js")
  .replace(/const CACHE_NAME = "[^"]+";/, 'const CACHE_NAME = "<CACHE>";')
  .replace(/const BUILD_ID = "[^"]+";/, 'const BUILD_ID = "<BUILD>";');
assert.equal(sha(workerLogic), "ea90cc9fcac2eb60a3d1cda6d0cef60de3fb607f185e1c972afaaa4610e2d07c", "Service-Worker-Funktionslogik wurde verändert");

const pageController = read("js/ui-page-controller.js");
assert.match(pageController, /saveButton\.hidden=readOnly\|\|!open/);
assert.match(pageController, /saveButton\.disabled=readOnly\|\|!open/);
assert.doesNotMatch(pageController, /data-page-save-status|Keine Abrechnung geöffnet\"\):\"Gespeichert/);
const navigationPages = read("js/ui-navigation-pages.js");
assert.match(navigationPages, /function renderBillingPeriodSettings\(\)/);
assert.match(navigationPages, /function applyBillingContextToDom\(\)/);
assert.match(navigationPages, /billing\.switchToEdit">Zur Bearbeitung öffnen/);

console.log(`AP22F1B protected areas: PASS (${Object.keys(protectedFiles).length} full files + 7 protected/patch areas)`);
