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

  assert(packageJson.name === "nk-pro-v99-4-22" && packageJson.version === "99.4.22", "Paketversion ist inkonsistent.");
  assert(lockJson.name === packageJson.name && lockJson.version === packageJson.version, "Package-Lock-Version ist inkonsistent.");
  assert(lockJson.packages?.[""]?.name === packageJson.name && lockJson.packages?.[""]?.version === packageJson.version, "Package-Lock-Root ist inkonsistent.");
  assert(manifest.version === "99.4.22" && manifest.name.includes("V99.4.22"), "Manifestversion ist inkonsistent.");
  assert(project.appVersion === "99.4.22" && project.displayVersion === "V99.4.22" && project.basedOn === "99.4.21-AP18", "Projektversionsmetadaten sind inkonsistent.");
  assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenverträge wurden unerwartet verändert.");
  assert(project.objectStandardVersion === 1 && project.billingSnapshotVersion === 2, "Objekt-/Snapshotstandard wurde unerwartet verändert.");
  assert(project.documentLayoutVersion === 4 && project.uiVisualSystemVersion === 4 && project.navigationDesignSystemVersion === 5, "AP13-/AP18-Regressionsstand ist inkonsistent.");
  assert(project.releaseHardeningVersion === 1 && project.releaseContentPolicyVersion === 1 && project.transientUiResetVersion === 1, "AP15-Metadaten fehlen.");
  assert(project.pwaCacheName === "nk-pro-v99-4-22-ap19" && project.areaDashboardVersion === 2 && project.globalBillingContextVersion === 2 && project.controlledBillingContextVersion === 1 && project.billingReadOnlyModeVersion === 1 && project.productiveDashboardVersion === 1 && project.statusRuleVersion === 1 && project.navigationSeparatorCleanupVersion === 1 && project.briefPreviewZoomVersion === 1 && project.buttonSystemVersion === 1 && project.brandAssetVersion === 1, "AP19-/PWA-Metadaten sind inkonsistent.");

  assert(runtime.includes('const APP_VERSION = "V99.4.22";'), "Laufzeitversion ist inkonsistent.");
  assert(runtime.includes('const APP_VERSION_NAME = "AP19-Produktive Bereichsübersichten und kontrollierter Abrechnungskontext";'), "Laufzeitname ist inkonsistent.");
  assert(html.includes("<title>NK-Pro V99.4.22 – AP19-Produktive Bereichsübersichten und kontrollierter Abrechnungskontext</title>"), "HTML-Titel ist inkonsistent.");
  assert(html.includes("<strong>V99.4.22</strong>"), "Sichtbare Anwendungsversion ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-22-ap19";'), "Service-Worker-Cache ist inkonsistent.");

  const scripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  assert(scripts.length === 51 && scripts.at(-2) === "./js/app.js" && scripts.at(-1) === "./js/service-worker-register.js", "Produktive Skriptreihenfolge ist inkonsistent.");
  for (const resource of ["./", "./index.html", "./manifest.webmanifest", "./assets/app.css", "./assets/brand/nk-pro-logo.png", "./assets/brand/nk-pro-icon-master.png", "./assets/brand/nk-pro-mark-64.png", "./assets/brand/nk-pro-mark-96.png", "./assets/brand/nk-pro-mark-128.png", ...scripts, "./icons/icon-16.png", "./icons/icon-32.png", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-192.png", "./icons/icon-maskable-512.png"]) {
    assert(worker.includes(`"${resource}"`), `PWA-App-Shell enthält ${resource} nicht.`);
    if (resource.startsWith("./") && resource !== "./") assert(exists(resource.slice(2)), `Produktive Ressource fehlt: ${resource}`);
  }
  assert(worker.includes('key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME'), "Cachebereinigung ist nicht auf NK-Pro begrenzt.");
  assert(worker.includes('requestUrl.origin !== self.location.origin'), "Same-Origin-Cachegrenze fehlt.");
  assert(worker.includes('if (response && response.ok)'), "Fehlerantworten könnten gecacht werden.");
  assert(worker.includes('event.request.mode === "navigate"'), "Offline-Navigationsfallback fehlt.");

  const tabs = [...html.matchAll(/class="tab-btn nav-group-item[^"]*"[^>]*data-tab="([^"]+)"/g)].map(match => match[1]);
  const expectedTabs = ["objektuebersicht","objekt","wohnungsverwaltung","wasser","mieterverwaltung","start","mieter","einnahmen","einstellungen","manuellewerte","verbraeuche","umlage","qualitaet","vorauszahlungsanpassung","briefe","export","archiv","sicherung"];
  assert(JSON.stringify(tabs) === JSON.stringify(expectedTabs), "Navigationsreihenfolge oder Zielbestand ist inkonsistent.");
  assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html), "Inline-Handler sind vorhanden.");
  assert(html.includes('data-tab="wasser"') && html.includes('data-tab="verbraeuche"'), "Zähler-DUMMY oder Verbrauchserfassung fehlt.");
  assert(css.includes('--font-ui:"Segoe UI",Arial,sans-serif;'), "Segoe-UI-Appschrift fehlt.");
  assert(renderer.includes('font-family:Arial,sans-serif') && renderer.includes('.nk-letter-document'), "Arial-/AP13-Dokumentmodell fehlt.");
  assert(documentUi.includes('attachShadow({ mode:"open" })'), "Isolierte Briefvorschau fehlt.");
  assert(documentUi.includes('BRIEF_PREVIEW_MIN_SCALE = 0.4') && documentUi.includes('BRIEF_PREVIEW_MAX_SCALE = 2') && documentUi.includes('previewFitPage') && documentUi.includes('previewFitWidth'), "AP18-Zoomsteuerung fehlt.");
  assert(html.includes('class="sidebar-brand-mark"') && html.includes('data-ui-action="document.previewZoomIn"') && html.includes('id="briefPreviewViewport"'), "AP18-Marke oder Briefwerkzeugleiste fehlt.");
  assert(css.includes('--control-height:38px') && css.includes('.brief-preview-toolbar') && css.includes('.nav-start-link.active'), "AP18-UI-System fehlt.");

  assert(navigationPages.includes("function resetTransientUiState(options = {})"), "Transiente UI-Zustände werden nicht zentral bereinigt.");
  assert(costs.includes("function resetCostUiState()"), "Kostenfilter-/Auswahlzustände werden nicht zurückgesetzt.");
  assert(architecture.totals.stateRootAssignments === 1, "Es existiert nicht genau eine Root-State-Ersetzung.");
  assert(architecture.renderers.length === 47 && architecture.renderers.every(item => !item.mutatesState && !item.persists && !item.navigates && !item.opensDialog), "Rendererinventar besitzt unerwartete Seiteneffekte.");
  assert(appMetrics.lines <= 250 && appMetrics.directStateWriteSites === 0 && appMetrics.globalAssignments === 0, "app.js-Orchestrierungsgrenze ist verletzt.");

  for (const file of [
    "README.md", "ARCHITECTURE.md", "MODULE_UEBERSICHT.md", "UI_ARCHITEKTUR_AKTUELL.md",
    "ABHAENGIGKEITSUEBERSICHT.md", "ANWENDUNGSSTART.md", "GLOBALE_SCHNITTSTELLEN_INVENTAR.md",
    "KOMPATIBILITAETSSCHICHT.md", "ZUSTANDSZUGRIFFE.md", "VERANTWORTLICHKEITSMATRIX.md",
    "ROADMAP.md", "TECH_DEBT.md", "CHANGELOG.md", "TESTING.md", "NK-PRO-PROJEKTSTAND.md",
    "AP15_GESAMTINTEGRATION_RELEASEHAERTUNG_UND_SCHLANKE_ARBEITSBASIS.md", "AP15_PRUEFBERICHT.md",
    "AP15_TEST_RESULTS.json", "AP15_DATEIAENDERUNGEN.md", "AP15_DATEIAENDERUNGEN.json",
    "AP15_ZIP_INHALTSPRUEFUNG.md", "AP15_UEBERGABEREGEL.md", "AP15_RELEASE_CONTENT_POLICY.json",
    "tests/ap15-integration-release.test.cjs", "tests/ap15-integration-release.spec.js", "tools/check-release-contents.cjs",
    "AP17_BEREICHS_DASHBOARDS_NAVIGATIONSLOGIK_UND_UI_BEREINIGUNG.md", "AP17_PRUEFBERICHT.md",
    "AP17_TEST_RESULTS.json", "AP17_DATEIAENDERUNGEN.md", "AP17_DATEIAENDERUNGEN.json",
    "AP17_RELEASE_CONTENT_POLICY.json", "tests/ap17-area-dashboards.test.cjs", "tests/ap17-area-dashboards.spec.js",
    "AP18_KORREKTUREN_UI_FEINSCHLIFF_UND_UX_BEREINIGUNG.md", "AP18_PRUEFBERICHT.md",
    "AP18_TEST_RESULTS.json", "AP18_DATEIAENDERUNGEN.md", "AP18_DATEIAENDERUNGEN.json",
    "AP18_RELEASE_CONTENT_POLICY.json", "tests/ap18-ui-ux-polish.test.cjs", "tests/ap18-ui-ux-polish.spec.js",
    "AP19_PRODUKTIVE_BEREICHSUEBERSICHTEN_UND_KONTROLLIERTER_ABRECHNUNGSKONTEXT.md", "AP19_PRUEFBERICHT.md",
    "AP19_TEST_RESULTS.json", "AP19_DATEIAENDERUNGEN.md", "AP19_DATEIAENDERUNGEN.json",
    "AP19_RELEASE_CONTENT_POLICY.json", "tests/ap19-billing-context-dashboards.test.cjs",
    "tests/ap19-billing-context-dashboards.spec.js", "tools/check-ap19-browser-harness.cjs", "js/billing-context.js"
  ]) assert(exists(file), `${file} fehlt.`);

  const ap15Results = JSON.parse(read("AP15_TEST_RESULTS.json"));
  assert(ap15Results.version === "99.4.18" && ap15Results.status === "passed", "AP15-Testbericht ist nicht bestanden.");
  assert(ap15Results.schema === 5 && ap15Results.dataLayerContract === 1 && ap15Results.documentLayoutVersion === 4, "AP15-Standardbestätigung ist inkonsistent.");
  assert(ap15Results.transientUiStateReset === true && ap15Results.safeCacheCleanup === true && ap15Results.offlineFallbackHardened === true, "AP15-Härtungsbestätigung fehlt.");

  const ap17Results = JSON.parse(read("AP17_TEST_RESULTS.json"));
  assert(ap17Results.version === "99.4.20" && ap17Results.workPackage === "AP17", "AP17-Testbericht ist inkonsistent.");
  assert(ap17Results.schema === 5 && ap17Results.dataLayerContract === 1 && ap17Results.documentLayoutVersion === 4, "AP17-Standardbestätigung ist inkonsistent.");
  assert(ap17Results.newSubstartPages === 2 && ap17Results.realDashboardValues === 15 && ap17Results.dummyDashboardValues === 15, "AP17-Dashboardzählung ist inkonsistent.");
  assert(ap17Results.documentedOpenLogics === 6 && ap17Results.removedOrConvertedCards === 119 && ap17Results.reviewedAndUnifiedBillingIcons === 11, "AP17-Bereinigungszählung ist inkonsistent.");

  const ap18Results = JSON.parse(read("AP18_TEST_RESULTS.json"));
  assert(ap18Results.version === "99.4.21" && ap18Results.workPackage === "AP18" && ap18Results.status === "passed", "AP18-Testbericht ist inkonsistent.");
  assert(ap18Results.schema === 5 && ap18Results.dataLayerContract === 1 && ap18Results.documentLayoutVersion === 4, "AP18-Daten-/Dokumentregression ist inkonsistent.");
  const ap19Results = JSON.parse(read("AP19_TEST_RESULTS.json"));
  assert(ap19Results.version === "99.4.22" && ap19Results.workPackage === "AP19" && ap19Results.status === "passed", "AP19-Testbericht ist inkonsistent.");
  assert(ap19Results.schema === 5 && ap19Results.dataLayerContract === 1 && ap19Results.documentLayoutVersion === 4, "AP19-Daten-/Dokumentregression ist inkonsistent.");
  assert(ap19Results.contextStates === 3 && ap19Results.guardedWriteActions === 52 && ap19Results.contextBoundNavigationItems === 10, "AP19-Kontextzählung ist inkonsistent.");
  assert(ap19Results.productiveDashboardValues === 28 && ap19Results.statusAndCheckRules === 17 && ap19Results.removedHeaderComponents === 10 && ap19Results.navigationSeparatorRules === 2, "AP19-Dashboard-/Bereinigungszählung ist inkonsistent.");
  assert(ap19Results.browserHarnessScenarios === 5 && ap19Results.browserHarnessChecks === 42 && ap19Results.browserFallbackHarness === "passed", "AP19-Browserharness ist inkonsistent.");
  verifyChecksums();
  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.22 mit unveränderten Datenverträgen, kontrolliertem AP19-Abrechnungskontext, produktiven Bereichsübersichten, AP13-Dokumentregression und gehärteter Offline-PWA ist konsistent.\n");
}

try { main(); }
catch (error) { process.stderr.write(`FEHLER: ${error.message}\n`); process.exit(1); }
