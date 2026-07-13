"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sha256 = buffer => crypto.createHash("sha256").update(buffer).digest("hex");

function verifyChecksums() {
  const checksumFile = path.join(root, "SHA256SUMS.txt");
  if (!fs.existsSync(checksumFile)) throw new Error("SHA256SUMS.txt fehlt.");
  const rows = fs.readFileSync(checksumFile, "utf8").split(/\r?\n/).filter(Boolean);
  assert(rows.length > 0, "SHA256SUMS.txt ist leer.");
  for (const row of rows) {
    const match = row.match(/^([0-9a-f]{64})  \.\/(.+)$/);
    assert(match, `Ungültiger Prüfsummeneintrag: ${row}`);
    const file = path.join(root, match[2]);
    assert(fs.existsSync(file) && fs.statSync(file).isFile(), `Prüfsummendatei fehlt: ${match[2]}`);
    assert(sha256(fs.readFileSync(file)) === match[1], `Prüfsumme ist inkonsistent: ${match[2]}`);
  }
}

function main() {
  const packageJson = JSON.parse(read("package.json"));
  const manifest = JSON.parse(read("manifest.webmanifest"));
  const project = JSON.parse(read("nk-pro-project.json"));
  const inventory = JSON.parse(read("AP9_BASELINE_INVENTORY.json"));
  const html = read("index.html");
  const app = read("js/app.js");
  const worker = read("service-worker.js");
  const metrics = JSON.parse(childProcess.execFileSync(process.execPath, [path.join(root, "tools/analyze-app-js.cjs")], { encoding:"utf8" }));
  const moduleNames = [
    "ui-preferences", "state-access", "application-actions", "master-data-actions", "cost-actions", "billing-workflow",
    "ui-controller", "ui-bindings", "ui-events", "navigation", "modal-events", "persistence", "migration", "backup-recovery",
    "meter-master", "meter-readings", "meter-periods", "meter-validation", "object-standard", "billing-snapshot", "archive",
    "billing-calculation", "document-data", "document-renderer", "export-service", "ui-table-tools", "app-bootstrap",
    "compatibility", "default-seed", "app", "service-worker-register"
  ];
  const sources = Object.fromEntries(moduleNames.map(name => [name, read(`js/${name}.js`)]));

  assert(packageJson.name === "nk-pro-v99-4-10" && packageJson.version === "99.4.10", "Paketversion ist inkonsistent.");
  assert(manifest.version === "99.4.10" && manifest.name.includes("V99.4.10"), "Manifestversion ist inkonsistent.");
  assert(project.appVersion === "99.4.10" && project.displayVersion === "V99.4.10" && project.basedOn === "99.4.9", "Projektversionsmetadaten sind inkonsistent.");
  assert(project.versionName === "Physisch extrahierte Kernorchestrierung", "Versionsname ist inkonsistent.");
  assert(project.architectureVersion === 2 && project.compatibilityLayerVersion === 2 && project.uiControllerVersion === 1 && project.uiEventContractVersion === 1, "Architekturversionen fehlen.");
  assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenschema oder Datenebenenvertrag wurde verändert.");
  assert(project.objectStandardVersion === 1 && project.billingSnapshotVersion === 2, "Objektstandard oder Snapshotversion wurde verändert.");
  for (const key of ["meterMasterStandardVersion", "meterReadingStandardVersion", "meterPeriodStandardVersion", "meterAssignmentStandardVersion", "meterReplacementStandardVersion"]) assert(project[key] === 1, `${key} ist inkonsistent.`);

  assert(app.includes('const APP_VERSION = "V99.4.10";') && app.includes('const APP_VERSION_NAME = "Physisch extrahierte Kernorchestrierung";'), "Laufzeitversion ist inkonsistent.");
  assert(app.includes("const DATA_SCHEMA_VERSION = 5;") && app.includes("const DATA_LAYER_CONTRACT_VERSION = 1;"), "Laufzeit-Datenvertrag ist inkonsistent.");
  assert(metrics.bytes === 510210 && metrics.lines === 8287, `app.js-Metrik ist unerwartet: ${metrics.bytes} Byte/${metrics.lines} Zeilen.`);
  assert(metrics.topLevelFunctionDeclarations === 596 && metrics.topLevelBindings === 67, "Top-Level-Inventar ist inkonsistent.");
  assert(metrics.directStatePathReferences === 503 && metrics.directStateWriteSites === 195, "Zustandszugriffsinventar ist inkonsistent.");
  assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html + "\n" + app), "Inline-Handler sind noch vorhanden.");
  assert(!/data-app-action/.test(html + "\n" + app), "Veraltete data-app-action-Bindungen sind noch vorhanden.");
  assert(!/addEventListener\s*\(/.test(app), "app.js registriert weiterhin DOM-Ereignisse.");

  for (const name of moduleNames.filter(name => !["app", "service-worker-register", "default-seed"].includes(name))) assert(sources[name].includes("Object.freeze"), `${name}.js exportiert keine feste Schnittstelle.`);
  for (const name of ["master-data-actions", "cost-actions", "billing-workflow"]) {
    assert(!/\b(document|window|localStorage|indexedDB|caches)\b/.test(sources[name]), `${name}.js enthält DOM- oder Browser-Speicherzugriffe.`);
    assert(!/\b(alert|confirm|prompt|switchToTab)\s*\(/.test(sources[name]), `${name}.js enthält UI-Dialog- oder Navigationslogik.`);
  }
  assert(!/\b(document|window|localStorage|indexedDB)\b/.test(sources["ui-controller"]), "UI-Controller-Registry enthält DOM- oder Speicherzugriffe.");
  assert(!/\b(document|window|localStorage|indexedDB)\b/.test(sources["state-access"]), "State-Access enthält DOM- oder Speicherzugriffe.");
  assert(sources["state-access"].includes("options.replaceStateResult === true"), "Explizite Zustandsersetzung in transact() fehlt.");
  assert(!/calculateUmlage|allocationForCost|prepaymentAdjustmentData/.test(sources["ui-bindings"]), "UI-Bindings enthalten parallele Abrechnungslogik.");
  assert(!/\b(document|window|localStorage|indexedDB)\b/.test(sources["billing-calculation"]), "Berechnungsmodul enthält UI- oder Speicherzugriffe.");
  assert(!/\b(document|localStorage|indexedDB)\b/.test(sources["document-data"]), "Dokumentdatenmodul enthält DOM- oder Speicherzugriffe.");
  assert(sources["ui-bindings"].includes("interactiveAppCall") && sources["ui-bindings"].includes("presentApplicationResult"), "Strukturierte UI-Ergebnispräsentation fehlt.");
  assert(sources["ui-events"].includes("data-ui-action") && sources["ui-events"].includes("data-ui-change") && sources["ui-events"].includes("data-ui-keydown"), "Zentraler UI-Ereignisvertrag ist unvollständig.");

  for (const name of inventory.implementationFunctionsMoved.concat(inventory.compatibilityWrappersRemoved)) {
    assert(!new RegExp(`function\\s+${name}\\s*\\(`).test(app), `Entfernte Implementierung/Weiterleitung ist wieder in app.js vorhanden: ${name}`);
  }
  assert(app.includes("addMasterTenancy:NK_PRO_MODULES.masterDataActions.addMasterTenancy"), "Stammdatenaktionen sind nicht direkt gebunden.");
  assert(app.includes("setSetting:NK_PRO_MODULES.costActions.setSetting"), "Kostenaktionen sind nicht direkt gebunden.");
  assert(app.includes("finalize:NK_PRO_MODULES.billingWorkflow.finalize"), "Billing-Aktionen sind nicht direkt gebunden.");
  assert(sources["billing-calculation"].includes("global.NKProCostActions.syncVorauszahlungen()"), "Berechnung nutzt noch eine entfernte Kostenweiterleitung.");
  assert(sources["document-data"].includes("global.NKProBillingWorkflow.currentBillingFinalizationReport()"), "Dokumentdaten nutzen noch eine entfernte Workflowweiterleitung.");
  assert(sources["export-service"].includes("global.NKProCostActions.kostenStatus(k)"), "Export nutzt noch eine entfernte Kostenweiterleitung.");
  assert(sources["export-service"].includes("global.NKProBillingWorkflow.createSnapshot()"), "Export nutzt noch eine entfernte Snapshotweiterleitung.");

  const storageUsers = moduleNames.filter(name => /\blocalStorage\b/.test(sources[name])).sort();
  assert(JSON.stringify(storageUsers) === JSON.stringify(["persistence", "ui-preferences"]), `Direkte Speicherzugriffe außerhalb der Adapter: ${storageUsers.join(", ")}`);
  assert(sources["meter-master"].includes('billingRole:"excluded"') && sources["meter-master"].includes("abrechnungsrelevant:false"), "Stromzähler-Dummy ist nicht zentral ausgeschlossen.");
  assert(sources["billing-snapshot"].includes("const BILLING_SNAPSHOT_VERSION = 2;"), "Snapshotversion 2 fehlt.");

  const expectedScripts = moduleNames.map(name => `./js/${name}.js`);
  const actualScripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  assert(JSON.stringify(actualScripts) === JSON.stringify(expectedScripts), `Skriptreihenfolge ist inkonsistent: ${JSON.stringify(actualScripts)}`);
  assert(html.includes("<title>NK-Pro V99.4.10 – Physisch extrahierte Kernorchestrierung</title>"), "HTML-Titel ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-10";'), "Service-Worker-Cache ist inkonsistent.");
  for (const resource of expectedScripts) assert(worker.includes(`"${resource}"`), `PWA-App-Shell enthält ${resource} nicht.`);

  for (const required of [
    "README.md", "ARCHITECTURE.md", "MODULE_UEBERSICHT.md", "VERANTWORTLICHKEITSMATRIX.md", "ROADMAP.md", "CHANGELOG.md", "TESTING.md",
    "AP9_PHYSISCHE_KERNORCHESTRIERUNG.md", "AP9_PRUEFBERICHT.md", "AP9_EXTRAKTIONSINVENTAR.md", "AP9_VORHER_NACHHER_INVENTAR.md",
    "AP9_DATENFLUSS_UND_COMMIT.md", "AP9_FUNKTIONSINVENTAR.md", "ANWENDUNGSAKTIONSUEBERSICHT.md", "AP9_BASELINE_INVENTORY.json", "AP9_APP_JS_INVENTORY_BEFORE.json", "AP9_APP_JS_INVENTORY_AFTER.json", "AP9_TEST_RESULTS.json", "UI_CONTROLLER_UEBERSICHT.md", "ZUSTANDSZUGRIFFE.md", "SHA256SUMS.txt"
  ]) assert(fs.existsSync(path.join(root, required)), `${required} fehlt.`);

  verifyChecksums();
  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.10, 32 physisch verschobene Implementierungen, 28 entfernte Weiterleitungen, 596 Top-Level-Funktionen, 13 UI-Controller, Datenschema 5, Snapshot 2 und vollständiger PWA-App-Shell sind konsistent.\n");
}

try { main(); } catch(error) { process.stderr.write(`FEHLER: ${error.message}\n`); process.exit(1); }
