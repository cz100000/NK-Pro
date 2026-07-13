"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const exists = relative => fs.existsSync(path.join(root, relative));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function hash(relative) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
}
function releaseFiles() {
  const result = [];
  const ignored = new Set(["node_modules", "test-results", "playwright-report", ".git"]);
  function walk(dir, prefix = "") {
    for (const entry of fs.readdirSync(dir, { withFileTypes:true })) {
      if (ignored.has(entry.name)) continue;
      const relative = prefix ? path.posix.join(prefix, entry.name) : entry.name;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), relative);
      else if (entry.isFile() && relative !== "SHA256SUMS.txt") result.push(relative);
    }
  }
  walk(root);
  return result.sort();
}
function verifyChecksums() {
  assert(exists("SHA256SUMS.txt"), "SHA256SUMS.txt fehlt.");
  const rows = read("SHA256SUMS.txt").trim().split(/\r?\n/).filter(Boolean);
  const entries = new Map();
  for (const row of rows) {
    const match = row.match(/^([a-f0-9]{64})\s{2}(.+)$/);
    assert(match, `Ungültige Prüfsummenzeile: ${row}`);
    entries.set(match[2], match[1]);
  }
  const files = releaseFiles();
  assert(entries.size === files.length, `Prüfsummenbestand ist unvollständig: ${entries.size} statt ${files.length}.`);
  for (const file of files) {
    assert(entries.has(file), `Prüfsumme fehlt: ${file}`);
    assert(entries.get(file) === hash(file), `Prüfsumme weicht ab: ${file}`);
  }
}

function main() {
  const packageJson = JSON.parse(read("package.json"));
  const lockJson = JSON.parse(read("package-lock.json"));
  const manifest = JSON.parse(read("manifest.webmanifest"));
  const project = JSON.parse(read("nk-pro-project.json"));
  const html = read("index.html");
  const css = read("assets/app.css");
  const runtime = read("js/app-runtime-config.js");
  const worker = read("service-worker.js");
  const navigationPages = read("js/ui-navigation-pages.js");
  const costs = read("js/ui-costs.js");
  const renderer = read("js/document-renderer.js");
  const documentUi = read("js/ui-documents.js");
  const architecture = JSON.parse(childProcess.execFileSync(process.execPath, [path.join(root, "tools/analyze-ap12-architecture.cjs")], { encoding:"utf8" }));
  const appMetrics = JSON.parse(childProcess.execFileSync(process.execPath, [path.join(root, "tools/analyze-app-js.cjs")], { encoding:"utf8" }));

  assert(packageJson.name === "nk-pro-v99-4-19" && packageJson.version === "99.4.19", "Paketversion ist inkonsistent.");
  assert(lockJson.name === packageJson.name && lockJson.version === packageJson.version, "Package-Lock-Version ist inkonsistent.");
  assert(lockJson.packages?.[""]?.name === packageJson.name && lockJson.packages?.[""]?.version === packageJson.version, "Package-Lock-Root ist inkonsistent.");
  assert(manifest.version === "99.4.19" && manifest.name.includes("V99.4.19"), "Manifestversion ist inkonsistent.");
  assert(project.appVersion === "99.4.19" && project.displayVersion === "V99.4.19" && project.basedOn === "99.4.18-AP15", "Projektversionsmetadaten sind inkonsistent.");
  assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenverträge wurden unerwartet verändert.");
  assert(project.objectStandardVersion === 1 && project.billingSnapshotVersion === 2, "Objekt-/Snapshotstandard wurde unerwartet verändert.");
  assert(project.documentLayoutVersion === 4 && project.uiVisualSystemVersion === 2, "AP13-/AP14-Regressionsstand ist inkonsistent.");
  assert(project.releaseHardeningVersion === 1 && project.releaseContentPolicyVersion === 1 && project.transientUiResetVersion === 1, "AP15-Metadaten fehlen.");
  assert(project.pwaCacheName === "nk-pro-v99-4-19-ap16", "PWA-Cachemetadaten sind inkonsistent.");

  assert(runtime.includes('const APP_VERSION = "V99.4.19";'), "Laufzeitversion ist inkonsistent.");
  assert(runtime.includes('const APP_VERSION_NAME = "AP16-Look & Feel, Kachelsystem und visuelle Interaktionsqualität";'), "Laufzeitname ist inkonsistent.");
  assert(html.includes("<title>NK-Pro V99.4.19 – AP16-Look & Feel, Kachelsystem und visuelle Interaktionsqualität</title>"), "HTML-Titel ist inkonsistent.");
  assert(html.includes("<strong>V99.4.19</strong>"), "Sichtbare Anwendungsversion ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-19-ap16";'), "Service-Worker-Cache ist inkonsistent.");

  const scripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  assert(scripts.length === 50 && scripts.at(-2) === "./js/app.js" && scripts.at(-1) === "./js/service-worker-register.js", "Produktive Skriptreihenfolge ist inkonsistent.");
  for (const resource of ["./", "./index.html", "./manifest.webmanifest", "./assets/app.css", ...scripts, "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"]) {
    assert(worker.includes(`"${resource}"`), `PWA-App-Shell enthält ${resource} nicht.`);
    if (resource.startsWith("./") && resource !== "./") assert(exists(resource.slice(2)), `Produktive Ressource fehlt: ${resource}`);
  }
  assert(worker.includes('key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME'), "Cachebereinigung ist nicht auf NK-Pro begrenzt.");
  assert(worker.includes('requestUrl.origin !== self.location.origin'), "Same-Origin-Cachegrenze fehlt.");
  assert(worker.includes('if (response && response.ok)'), "Fehlerantworten könnten gecacht werden.");
  assert(worker.includes('event.request.mode === "navigate"'), "Offline-Navigationsfallback fehlt.");

  const tabs = [...html.matchAll(/class="tab-btn nav-group-item[^"]*"[^>]*data-tab="([^"]+)"/g)].map(match => match[1]);
  const expectedTabs = ["objekt","wohnungsverwaltung","wasser","mieterverwaltung","start","mieter","einnahmen","einstellungen","manuellewerte","verbraeuche","umlage","qualitaet","vorauszahlungsanpassung","briefe","export","archiv","sicherung"];
  assert(JSON.stringify(tabs) === JSON.stringify(expectedTabs), "Navigationsreihenfolge oder Zielbestand ist inkonsistent.");
  assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html), "Inline-Handler sind vorhanden.");
  assert(html.includes('data-tab="wasser"') && html.includes('data-tab="verbraeuche"'), "Zähler-DUMMY oder Verbrauchserfassung fehlt.");
  assert(css.includes('--font-ui:"Segoe UI",Arial,sans-serif;'), "Segoe-UI-Appschrift fehlt.");
  assert(renderer.includes('font-family:Arial,sans-serif') && renderer.includes('.nk-letter-document'), "Arial-/AP13-Dokumentmodell fehlt.");
  assert(documentUi.includes('attachShadow({ mode:"open" })'), "Isolierte Briefvorschau fehlt.");

  assert(navigationPages.includes("function resetTransientUiState(options = {})"), "Transiente UI-Zustände werden nicht zentral bereinigt.");
  assert(costs.includes("function resetCostUiState()"), "Kostenfilter-/Auswahlzustände werden nicht zurückgesetzt.");
  assert(architecture.totals.stateRootAssignments === 1, "Es existiert nicht genau eine Root-State-Ersetzung.");
  assert(architecture.renderers.length === 46 && architecture.renderers.every(item => !item.mutatesState && !item.persists && !item.navigates && !item.opensDialog), "Rendererinventar besitzt unerwartete Seiteneffekte.");
  assert(appMetrics.lines <= 230 && appMetrics.directStateWriteSites === 0 && appMetrics.globalAssignments === 0, "app.js-Orchestrierungsgrenze ist verletzt.");

  for (const file of [
    "README.md", "ARCHITECTURE.md", "MODULE_UEBERSICHT.md", "UI_ARCHITEKTUR_AKTUELL.md",
    "ABHAENGIGKEITSUEBERSICHT.md", "ANWENDUNGSSTART.md", "GLOBALE_SCHNITTSTELLEN_INVENTAR.md",
    "KOMPATIBILITAETSSCHICHT.md", "ZUSTANDSZUGRIFFE.md", "VERANTWORTLICHKEITSMATRIX.md",
    "ROADMAP.md", "TECH_DEBT.md", "CHANGELOG.md", "TESTING.md", "NK-PRO-PROJEKTSTAND.md",
    "AP15_GESAMTINTEGRATION_RELEASEHAERTUNG_UND_SCHLANKE_ARBEITSBASIS.md", "AP15_PRUEFBERICHT.md",
    "AP15_TEST_RESULTS.json", "AP15_DATEIAENDERUNGEN.md", "AP15_DATEIAENDERUNGEN.json",
    "AP15_ZIP_INHALTSPRUEFUNG.md", "AP15_UEBERGABEREGEL.md", "AP15_RELEASE_CONTENT_POLICY.json",
    "tests/ap15-integration-release.test.cjs", "tests/ap15-integration-release.spec.js", "tools/check-release-contents.cjs"
  ]) assert(exists(file), `${file} fehlt.`);

  const ap15Results = JSON.parse(read("AP15_TEST_RESULTS.json"));
  assert(ap15Results.version === "99.4.18" && ap15Results.status === "passed", "AP15-Testbericht ist nicht bestanden.");
  assert(ap15Results.schema === 5 && ap15Results.dataLayerContract === 1 && ap15Results.documentLayoutVersion === 4, "AP15-Standardbestätigung ist inkonsistent.");
  assert(ap15Results.transientUiStateReset === true && ap15Results.safeCacheCleanup === true && ap15Results.offlineFallbackHardened === true, "AP15-Härtungsbestätigung fehlt.");

  verifyChecksums();
  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.19 mit unveränderten Datenverträgen, AP13-/AP14-Regression, gehärtetem Bedienfluss, sicherer PWA-Cachepflege und schlanker Arbeitsbasis ist konsistent.\n");
}

try { main(); }
catch (error) { process.stderr.write(`FEHLER: ${error.message}\n`); process.exit(1); }
