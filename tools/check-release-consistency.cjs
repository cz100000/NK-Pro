"use strict";

const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function main() {
  const packageJson = JSON.parse(read("package.json"));
  const manifest = JSON.parse(read("manifest.webmanifest"));
  const project = JSON.parse(read("nk-pro-project.json"));
  const html = read("index.html");
  const app = read("js/app.js");
  const worker = read("service-worker.js");
  const moduleNames = [
    "ui-preferences", "state-access", "application-actions", "ui-controller", "ui-bindings", "ui-events", "navigation", "modal-events",
    "persistence", "migration", "backup-recovery", "meter-master", "meter-readings", "meter-periods", "meter-validation",
    "object-standard", "billing-snapshot", "archive", "billing-calculation", "document-data", "document-renderer",
    "export-service", "ui-table-tools", "app-bootstrap", "compatibility", "default-seed", "app", "service-worker-register"
  ];
  const sources = Object.fromEntries(moduleNames.map(name => [name, read(`js/${name}.js`)]));

  assert(packageJson.name === "nk-pro-v99-4-9" && packageJson.version === "99.4.9", "Paketversion ist inkonsistent.");
  assert(manifest.version === "99.4.9" && manifest.name.includes("V99.4.9"), "Manifestversion ist inkonsistent.");
  assert(project.appVersion === "99.4.9" && project.displayVersion === "V99.4.9" && project.basedOn === "99.4.8", "Projektversionsmetadaten sind inkonsistent.");
  assert(project.versionName === "Modularisierte Anwendungsaktionen und fachliche Orchestrierung", "Versionsname ist inkonsistent.");
  assert(project.architectureVersion === 2 && project.compatibilityLayerVersion === 2 && project.uiControllerVersion === 1 && project.uiEventContractVersion === 1, "AP7-Architekturversionen fehlen.");
  assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenschema oder Datenebenenvertrag wurde verändert.");
  assert(project.objectStandardVersion === 1 && project.billingSnapshotVersion === 2, "Objektstandard oder Snapshotversion wurde verändert.");
  for (const key of ["meterMasterStandardVersion", "meterReadingStandardVersion", "meterPeriodStandardVersion", "meterAssignmentStandardVersion", "meterReplacementStandardVersion"]) assert(project[key] === 1, `${key} ist inkonsistent.`);

  assert(app.includes('const APP_VERSION = "V99.4.9";') && app.includes('const APP_VERSION_NAME = "Modularisierte Anwendungsaktionen und fachliche Orchestrierung";'), "Laufzeitversion ist inkonsistent.");
  assert(app.includes("const DATA_SCHEMA_VERSION = 5;") && app.includes("const DATA_LAYER_CONTRACT_VERSION = 1;"), "Laufzeit-Datenvertrag ist inkonsistent.");
  assert(app.split(/\r?\n/).length < 9100, "app.js überschreitet die AP8-Grenze von 9.100 Zeilen.");
  assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html + "\n" + app), "Inline-Handler sind noch vorhanden.");
  assert(!/data-app-action/.test(html + "\n" + app), "Veraltete data-app-action-Bindungen sind noch vorhanden.");
  assert(!/addEventListener\s*\(/.test(app), "app.js registriert weiterhin DOM-Ereignisse.");

  for (const name of moduleNames.filter(name => !["app", "service-worker-register", "default-seed"].includes(name))) assert(sources[name].includes("Object.freeze"), `${name}.js exportiert keine feste Schnittstelle.`);
  assert(!/\b(document|window|localStorage|indexedDB)\b/.test(sources["ui-controller"]), "UI-Controller-Registry enthält DOM- oder Speicherzugriffe.");
  assert(!/\b(document|window|localStorage|indexedDB)\b/.test(sources["state-access"]), "State-Access enthält DOM- oder Speicherzugriffe.");
  assert(!/calculateUmlage|allocationForCost|prepaymentAdjustmentData/.test(sources["ui-bindings"]), "UI-Bindings enthalten parallele Abrechnungslogik.");
  assert(!/\b(document|window|localStorage|indexedDB)\b/.test(sources["billing-calculation"]), "Berechnungsmodul enthält UI- oder Speicherzugriffe.");
  assert(!/\b(document|localStorage|indexedDB)\b/.test(sources["document-data"]), "Dokumentdatenmodul enthält DOM- oder Speicherzugriffe.");
  assert(sources["ui-events"].includes("data-ui-action") && sources["ui-events"].includes("data-ui-change") && sources["ui-events"].includes("data-ui-keydown"), "Zentraler UI-Ereignisvertrag ist unvollständig.");
  assert(!/window\.(?:refreshWorkspaceChrome|ensureNavigationPath|updateWorkflowNavigationContext|applyNavTreeState|setOpenNavigationGroup)\s*=/.test(sources.navigation), "Entfernte globale Navigationswrapper sind wieder vorhanden.");
  assert(sources["modal-events"].includes('dispatch("cost.closeSelectionDialog"'), "Modalereignisse sind nicht über Controller angebunden.");

  const storageUsers = moduleNames.filter(name => /\blocalStorage\b/.test(sources[name])).sort();
  assert(JSON.stringify(storageUsers) === JSON.stringify(["persistence", "ui-preferences"]), `Direkte Speicherzugriffe außerhalb der Adapter: ${storageUsers.join(", ")}`);
  assert(sources["meter-master"].includes('billingRole:"excluded"') && sources["meter-master"].includes("abrechnungsrelevant:false"), "Stromzähler-Dummy ist nicht zentral ausgeschlossen.");
  assert(sources["billing-snapshot"].includes("const BILLING_SNAPSHOT_VERSION = 2;"), "Snapshotversion 2 fehlt.");

  const expectedScripts = moduleNames.map(name => `./js/${name}.js`);
  const actualScripts = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
  assert(JSON.stringify(actualScripts) === JSON.stringify(expectedScripts), `Skriptreihenfolge ist inkonsistent: ${JSON.stringify(actualScripts)}`);
  assert(html.includes("<title>NK-Pro V99.4.9 – Modularisierte Anwendungsaktionen und fachliche Orchestrierung</title>"), "HTML-Titel ist inkonsistent.");
  assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-9";'), "Service-Worker-Cache ist inkonsistent.");
  for (const resource of expectedScripts) assert(worker.includes(`"${resource}"`), `PWA-App-Shell enthält ${resource} nicht.`);

  for (const required of [
    "README.md", "ARCHITECTURE.md", "MODULE_UEBERSICHT.md", "VERANTWORTLICHKEITSMATRIX.md", "ROADMAP.md", "CHANGELOG.md", "TESTING.md",
    "AP7_NATIVE_UI_ANBINDUNG.md", "AP7_PRUEFBERICHT.md", "UI_CONTROLLER_UEBERSICHT.md", "UI_EREIGNIS_INVENTAR.md", "ZUSTANDSZUGRIFFE.md", "SHA256SUMS.txt"
  ]) assert(fs.existsSync(path.join(root, required)), `${required} fehlt.`);

  process.stdout.write("Release-Konsistenzprüfung abgeschlossen: V99.4.9, Architektur 2, 13 UI-Controller, zentraler Ereignisvertrag, Datenschema 5, Datenebenenvertrag 1 und vollständiger PWA-App-Shell sind konsistent.\n");
}

try { main(); } catch(error) { process.stderr.write(`FEHLER: ${error.message}\n`); process.exit(1); }
