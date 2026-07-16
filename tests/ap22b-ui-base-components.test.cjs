"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const assert = (value, message) => { if (!value) throw new Error(message); };

const css = read("assets/app.css");
const html = read("index.html");
const source = read("js/ui-design-system.js");

const project = JSON.parse(read("nk-pro-project.json"));
const manifest = JSON.parse(read("manifest.webmanifest"));
const packageJson = JSON.parse(read("package.json"));
const runtime = read("js/app-runtime-config.js");
const serviceWorker = read("service-worker.js");
const serviceWorkerRegister = read("js/service-worker-register.js");
assert(project.appVersion === "99.4.30" && project.runtimeBuildId === "99.4.30-ap22b", "AP22B-Projektversion ist inkonsistent.");
assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenverträge wurden unbeabsichtigt verändert.");
assert(project.uiDesignSystemVersion === 2 && project.uiBaseComponentsMigrationVersion === 1, "AP22B-Migrationsversion fehlt.");
assert(project.nextWorkPackage === "AP22C – UI-Bibliothek: Tabellen und Listen", "Nächstes Arbeitspaket ist nicht AP22C.");
assert(manifest.version === "99.4.30" && packageJson.version === "99.4.30", "Manifest- oder Paketversion ist inkonsistent.");
assert(html.includes('content="99.4.30-ap22b" name="nk-pro-build"') && html.includes("NK-Pro V99.4.30 – AP22B UI-Grundkomponenten"), "HTML-Buildkennung ist inkonsistent.");
assert(html.includes('./assets/app.css?v=99.4.30-ap22b') && html.includes('./js/ui-design-system.js?v=99.4.30-ap22b'), "Geänderte UI-Assets sind nicht versionsgebunden.");
assert(runtime.includes('const APP_VERSION = "V99.4.30";') && runtime.includes('const APP_VERSION_NAME = "AP22B-UI-Bibliothek-Grundkomponenten";'), "Laufzeitversion ist inkonsistent.");
assert(serviceWorker.includes('const CACHE_NAME = "nk-pro-v99-4-30-ap22b";') && serviceWorker.includes('const BUILD_ID = "99.4.30-ap22b";'), "Service-Worker-Version ist inkonsistent.");
assert(serviceWorkerRegister.includes('const BUILD_ID = "99.4.30-ap22b";'), "Service-Worker-Registrierung verwendet eine abweichende Build-ID.");
for (const file of ["AP22B_UI_BIBLIOTHEK_GRUNDKOMPONENTEN.md","AP22B_DATEIPOSITIVLISTE.md","AP22B_DATEIAENDERUNGEN.md","AP22B_DATEIAENDERUNGEN.json","AP22B_PRUEFBERICHT.md","AP22B_TEST_RESULTS.json","AP22B_RELEASE_CONTENT_POLICY.json","AP22B_ABSCHLUSS.md"]) {
  assert(fs.existsSync(path.join(root, file)), `AP22B-Nachweis fehlt: ${file}`);
}

assert(css.includes("AP22B: produktive Migration der Grundkomponenten"), "AP22B-CSS-Migrationsschicht fehlt.");
for (const selector of [".nk-ui-button--primary", ".nk-ui-field--readonly", ".page-section.nk-ui-accordion", ".nk-ui-card--interactive", ".nk-ui-status::before", ".nk-ui-notice--warning"]) {
  assert(css.includes(selector), `AP22B-Komponentenregel fehlt: ${selector}`);
}
assert(html.includes('data-nk-ui-upgrade-root=""'), "Kontrollierter UI-Migrationsbereich fehlt.");
assert((html.match(/class="page-section nk-ui-accordion"/g) || []).length >= 40, "Statische Klappboxen wurden nicht auf die zentrale Accordion-Komponente migriert.");
assert((html.match(/nk-ui-accordion__body/g) || []).length >= 40, "Accordion-Inhaltsbereiche wurden nicht zentral markiert.");
assert((html.match(/page-section__badge nk-ui-status/g) || []).length >= 40, "Klappboxstatus wurden nicht zentral markiert.");

const sandbox = { globalThis:{} };
vm.runInNewContext(source, sandbox, { filename:"ui-design-system.js" });
const api = sandbox.globalThis.NKProUIDesignSystem;
assert(api && api.version === "1.1.0", "UI-Design-System-Version 1.1.0 fehlt.");
assert(api.migration && api.migration.package === "AP22B", "AP22B-Migrationsmetadaten fehlen.");
assert(JSON.stringify(Array.from(api.migration.components)) === JSON.stringify(["button","field","card","accordion","status","notice"]), "AP22B-Komponentenumfang ist nicht abgegrenzt.");
for (const name of ["upgrade", "observe", "disconnect", "init"]) assert(typeof api[name] === "function", `UI-Migrationsschnittstelle fehlt: ${name}`);
assert(api.statusVariant("Vollständig") === "success", "Deutsche Erfolgsstatus werden nicht normalisiert.");
assert(api.statusVariant("In Bearbeitung") === "info", "Bearbeitungsstatus wird nicht normalisiert.");
assert(api.statusVariant("Blockiert") === "danger", "Blockierstatus wird nicht normalisiert.");

console.log("AP22B UI-Grundkomponenten: Strukturprüfung bestanden.");
