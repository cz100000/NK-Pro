"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const sha = value => crypto.createHash("sha256").update(value).digest("hex");

const expected = {
  aside:"9beb233787dc382c5b56a9ae8cdfce03447fa8e3bf8cd8b8843435b14603b427",
  navigationNormalized:"8933ace6f169277e51da33065f2ef478ec1a4310d257f38e2a9629d1cb8f5b8b",
  serviceWorkerLogic:"ea90cc9fcac2eb60a3d1cda6d0cef60de3fb607f185e1c972afaaa4610e2d07c",
  files:{
    "js/billing-context.js":"5027295c32fc214b80b07f3d35b4e06186a911995e35d2cb9787fdc99f23f1e8",
    "js/billing-calculation.js":"2d1a130455e6dc0e2b541f80edeb9c12cfd8ffe9f9b0460f368f35030e7050c2",
    "js/persistence.js":"c22eab211ae2d080ce82b3050f83edf173752e610688050330f0f12547cd6c6b",
    "js/migration.js":"24db7607caca48ce1fb244f8bc0d9f3b4835a5e53c47868f02a673c9e9722828",
    "js/backup-recovery.js":"92b2f1df919acf425be770eb554373a23fc54b792249bbb33e88229475760bc7",
    "js/archive.js":"4f148c7df20d5301f4902fd464b584fd39eaa713da9a6a20820a2dfc1ef9c87e",
    "js/export-service.js":"4954c06643fe10afbaa03f7c89aca36a4e20a3fd0336fccca65e1b615b280b87",
    "js/document-renderer.js":"def7bbc7a6fb53c0937840c89ae920b13f2ec710ef0484fa2b4859fef214edda",
    "js/document-data.js":"b96bc414bdd7604962994cd8598fd2832e4d66523799f3051dfc4877317a9775"
  }
};

const html = read("index.html");
const aside = html.match(/<aside\b[^>]*class="[^"]*app-sidebar[^"]*"[\s\S]*?<\/aside>/);
assert.ok(aside, "Navigation-aside fehlt");
assert.equal(sha(aside[0]), expected.aside, "Navigation-aside wurde verändert");

const navigation = read("js/navigation.js");
const start = navigation.indexOf("  function updateWorkflowNavigationContext() {");
const end = navigation.indexOf("\n\n  function setSidebarCollapsed", start);
assert.ok(start >= 0 && end > start, "Kontextfunktion nicht isolierbar");
const normalizedNavigation = (navigation.slice(0, start) + "<CTX>" + navigation.slice(end))
  .replace(/^      billingPeriodLabel:.*\n/m, "");
assert.equal(sha(normalizedNavigation), expected.navigationNormalized, "geschützte Navigation außerhalb der freigegebenen Kontext-Provider und des Kontext-Renderers wurde verändert");

for (const [file, digest] of Object.entries(expected.files)) {
  assert.equal(sha(read(file)), digest, `${file} wurde verändert`);
}

const worker = read("service-worker.js");
const workerLogic = worker
  .replace(/const CACHE_NAME = "[^"]+";/, 'const CACHE_NAME = "<CACHE>";')
  .replace(/const BUILD_ID = "[^"]+";/, 'const BUILD_ID = "<BUILD>";');
assert.equal(sha(workerLogic), expected.serviceWorkerLogic, "Service-Worker-Funktionslogik wurde verändert");

const css = read("assets/app.css");
const marker = "/* V99.4.34 – AP22F1A: globales Schalenfundament */";
const addition = css.slice(css.indexOf(marker));
assert.ok(addition.startsWith(marker), "AP22F1A-CSS-Abschnitt fehlt");
assert.doesNotMatch(addition, /\.app-sidebar|\.workflow-nav|#briefe\b|@media\s+print|\.letter-|\.print-/i, "neuer Schalenabschnitt greift in geschützte Bereiche ein");

console.log(`AP22F1A protected areas: PASS (${Object.keys(expected.files).length + 3} hash protections)`);
