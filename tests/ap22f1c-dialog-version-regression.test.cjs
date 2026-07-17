"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const json = file => JSON.parse(read(file));

const html = read("index.html");
const css = read("assets/app.css");
const controller = read("js/ui-page-controller.js");
const runtime = read("js/app-runtime-config.js");
const worker = read("service-worker.js");
const workerRegister = read("js/service-worker-register.js");

// Fehlerkorrektur: geschlossene native Dialoge dürfen nie am Seitenende gerendert werden.
const closedRule = "body:not(.document-print-window) dialog.nk-ui-dialog:not([open]) { display:none; }";
assert.match(css, new RegExp(closedRule.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "CSS-Regel für geschlossene native Dialoge fehlt");
assert.match(css, /body:not\(\.document-print-window\) \.nk-ui-dialog \{[\s\S]*?display:flex;/, "zentrales Dialoglayout fehlt");
assert.match(html, /<dialog\b(?=[^>]*id="qualityDetailDialog")(?=[^>]*class="[^"]*nk-ui-dialog[^"]*")[^>]*>/, "produktiver Prüfpunktdialog fehlt");
assert.doesNotMatch(html.match(/<dialog\b[^>]*id="qualityDetailDialog"[^>]*>/)?.[0] || "", /\sopen(?:=|\s|>)/, "Prüfpunktdialog darf initial nicht geöffnet sein");

// Fehlerkorrektur: sichtbare Version ist an APP_VERSION gebunden.
assert.equal((html.match(/data-app-version=""/g) || []).length, 1, "genau ein zentrales Versionslabel erwartet");
assert.match(html, /<strong data-app-version="">V99\.4\.36<\/strong>/, "aktueller HTML-Fallback der Navigationsversion fehlt");
assert.match(controller, /document\.querySelectorAll\("\[data-app-version\]"\)\.forEach\(label=>\{ label\.textContent=APP_VERSION; \}\);/, "Versionslabel wird nicht aus APP_VERSION gespeist");
assert.doesNotMatch(html, /<strong>V99\.4\.32<\/strong>/, "veraltete sichtbare Navigationsversion ist noch vorhanden");

// Release-Metadaten müssen konsistent sein.
assert.match(runtime, /const APP_VERSION = "V99\.4\.36";/);
assert.match(runtime, /const APP_VERSION_NAME = "AP22F1C-Dialogausblendung-und-zentrale-Versionsanzeige";/);
assert.match(html, /content="99\.4\.36-ap22f1c" name="nk-pro-build"/);
assert.match(html, /<title>NK-Pro V99\.4\.36 – AP22F1C Dialogausblendung und zentrale Versionsanzeige<\/title>/);
assert.match(worker, /const CACHE_NAME = "nk-pro-v99-4-36-ap22f1c";/);
assert.match(worker, /const BUILD_ID = "99\.4\.36-ap22f1c";/);
assert.match(workerRegister, /const BUILD_ID = "99\.4\.36-ap22f1c";/);
const manifest = json("manifest.webmanifest");
const project = json("nk-pro-project.json");
const pkg = json("package.json");
const lock = json("package-lock.json");
assert.equal(manifest.name, "NK-Pro V99.4.36");
assert.equal(manifest.version, "99.4.36");
assert.equal(project.appVersion, "99.4.36");
assert.equal(project.displayVersion, "V99.4.36");
assert.equal(project.runtimeBuildId, "99.4.36-ap22f1c");
assert.equal(project.pwaCacheName, "nk-pro-v99-4-36-ap22f1c");
assert.equal(project.uiDialogClosedStateFixVersion, 1);
assert.equal(project.centralVersionLabelVersion, 1);
assert.equal(pkg.version, "99.4.36");
assert.equal(lock.version, pkg.version);
assert.equal(lock.packages[""].version, pkg.version);
assert.equal(lock.name, pkg.name);
assert.equal(lock.packages[""].name, pkg.name);

// Vollständig geschützte Produktmodule.
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

// Die vier funktional geänderten Dateien dürfen ausschließlich den dokumentierten Minimalpatch enthalten.
const normalizedHtml = html
  .replaceAll("99.4.36-ap22f1c", "99.4.35-ap22f1b")
  .replace("NK-Pro V99.4.36 – AP22F1C Dialogausblendung und zentrale Versionsanzeige", "NK-Pro V99.4.35 – AP22F1B Seitenkopf- und Redundanzbereinigung")
  .replace('<strong data-app-version="">V99.4.36</strong>', '<strong>V99.4.32</strong>');
assert.equal(sha(normalizedHtml), "2bb9af76a1040b62a0b0a28414a0f21e0bd19936f7a1a4fc0ea04094672670ea", "index.html weicht außerhalb des freigegebenen Versionspatches ab");

const normalizedCss = css.replace(closedRule + "\n", "");
assert.equal(sha(normalizedCss), "a919b4c60864a50684d01242efab5efd5c91b0155fec2f416634ec8529b25d3b", "assets/app.css weicht außerhalb der Dialogregel ab");

const versionBinding = '  document.querySelectorAll("[data-app-version]").forEach(label=>{ label.textContent=APP_VERSION; });\n';
assert.equal(sha(controller.replace(versionBinding, "")), "453812c664383b040d8c86346dbb79939aab7657f0b69b104e2b264d520d41ab", "ui-page-controller weicht außerhalb der Versionsbindung ab");

const currentChangelog = '  "V99.4.36 blendet geschlossene native Dialoge trotz zentralem Flex-Layout zuverlässig aus und speist die sichtbare Navigationsversion aus der zentralen Laufzeitkonstante; Dialoginteraktion, Navigation und Fachlogik bleiben unverändert.",\n';
const normalizedRuntime = runtime
  .replace(currentChangelog, "")
  .replace('const APP_VERSION = "V99.4.36";', 'const APP_VERSION = "V99.4.35";')
  .replace('const APP_VERSION_NAME = "AP22F1C-Dialogausblendung-und-zentrale-Versionsanzeige";', 'const APP_VERSION_NAME = "AP22F1B-Seitenkopf-und-Redundanzbereinigung";');
assert.equal(sha(normalizedRuntime), "3b1abc39aebf9f3bf851a348b7ef567e871ed8fd789829ea2e24daa5600be520", "app-runtime-config weicht außerhalb der Releasemetadaten ab");

const normalizedWorker = worker
  .replaceAll("nk-pro-v99-4-36-ap22f1c", "nk-pro-v99-4-35-ap22f1b")
  .replaceAll("99.4.36-ap22f1c", "99.4.35-ap22f1b");
assert.equal(sha(normalizedWorker), "c6679d8b42285e0da07f8c844cd1bff5aad063ba3a205c26610f9531e81b6195", "Service-Worker-Funktionslogik wurde verändert");
assert.equal(sha(workerRegister.replaceAll("99.4.36-ap22f1c", "99.4.35-ap22f1b")), "e45f5b730f191d4146d9c1c533cf02cc19f113540e1b42c33a06deaf47f6f264", "Service-Worker-Registrierung wurde funktional verändert");

// Besonders geschützte HTML-Bereiche sind bytegleich zum Ausgangsrelease.
function matched(pattern, label) {
  const match = html.match(pattern);
  assert.ok(match, `${label} fehlt`);
  return match[0];
}
assert.equal(sha(matched(/<section aria-label="Abrechnungskontext"[\s\S]*?<\/section>/, "Kontextleiste")), "1f437a7c6354ee0642a57c0cfb7e0344189f6a9342188e70da31e9e462351a51", "Kontextleiste wurde verändert");
assert.equal(sha(matched(/<details[^>]*id="billingPeriodSection"[\s\S]*?<\/details>/, "Zeitraumsektion")), "e28a23124b157ef33293013e0a37d84e00c9edd2df0d727f6716f6c96f2418e0", "Zeitraumsektion wurde verändert");
assert.equal(sha(matched(/<dialog aria-labelledby="qualityDetailTitle"[\s\S]*?<\/dialog>/, "Prüfpunktdialog")), "8b00ab774c8ad9ff7e50e1fc854edc50a7ab38b0a396749163ddf67e4de801d0", "Dialog-Markup wurde verändert");

console.log(`AP22F1C dialog/version regression: PASS (${Object.keys(protectedFiles).length} full files + minimal patch protection)`);
