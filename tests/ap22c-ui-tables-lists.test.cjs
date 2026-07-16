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

assert(project.appVersion === "99.4.31" && project.runtimeBuildId === "99.4.31-ap22c", "AP22C-Projektversion ist inkonsistent.");
assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenverträge wurden unbeabsichtigt verändert.");
assert(project.uiDesignSystemVersion === 3 && project.uiTablesListsMigrationVersion === 1, "AP22C-Migrationsversion fehlt.");
assert(project.nextWorkPackage === "AP22D – UI-Bibliothek: Dialoge und Leerzustände", "Nächstes Arbeitspaket ist nicht AP22D.");
assert(manifest.version === "99.4.31" && packageJson.version === "99.4.31", "Manifest- oder Paketversion ist inkonsistent.");
assert(html.includes('content="99.4.31-ap22c" name="nk-pro-build"') && html.includes("NK-Pro V99.4.31 – AP22C Tabellen und Listen"), "HTML-Buildkennung ist inkonsistent.");
assert(html.includes('./assets/app.css?v=99.4.31-ap22c') && html.includes('./js/ui-design-system.js?v=99.4.31-ap22c'), "Geänderte UI-Assets sind nicht versionsgebunden.");
assert(runtime.includes('const APP_VERSION = "V99.4.31";') && runtime.includes('const APP_VERSION_NAME = "AP22C-UI-Bibliothek-Tabellen-Listen";'), "Laufzeitversion ist inkonsistent.");
assert(serviceWorker.includes('const CACHE_NAME = "nk-pro-v99-4-31-ap22c";') && serviceWorker.includes('const BUILD_ID = "99.4.31-ap22c";'), "Service-Worker-Version ist inkonsistent.");
assert(serviceWorkerRegister.includes('const BUILD_ID = "99.4.31-ap22c";'), "Service-Worker-Registrierung verwendet eine abweichende Build-ID.");

for (const file of [
  "AP22C_UI_BIBLIOTHEK_TABELLEN_UND_LISTEN.md",
  "AP22C_DATEIPOSITIVLISTE.md",
  "AP22C_DATEIAENDERUNGEN.md",
  "AP22C_DATEIAENDERUNGEN.json",
  "AP22C_PRUEFBERICHT.md",
  "AP22C_TEST_RESULTS.json",
  "AP22C_RELEASE_CONTENT_POLICY.json",
  "AP22C_ABSCHLUSS.md"
]) assert(fs.existsSync(path.join(root, file)), `AP22C-Nachweis fehlt: ${file}`);

assert(css.includes("AP22C: produktive Migration von Tabellen, Listen und Tabellenwerkzeugen"), "AP22C-CSS-Migrationsschicht fehlt.");
for (const selector of [
  ".nk-ui-table-wrap",
  ".nk-ui-table--compact",
  ".nk-ui-list--definition",
  ".nk-ui-list--divided",
  ".nk-ui-toolbar--compact",
  ".nk-ui-toolbar__search"
]) assert(css.includes(selector), `AP22C-Komponentenregel fehlt: ${selector}`);

assert((html.match(/nk-ui-table-wrap/g) || []).length >= 20, "Statische Tabellencontainer wurden nicht zentral markiert.");
assert((html.match(/class="[^"]*nk-ui-table/g) || []).length >= 20, "Statische Tabellen wurden nicht zentral markiert.");
assert((html.match(/nk-ui-toolbar/g) || []).length >= 7, "Tabellenbezogene Werkzeugleisten wurden nicht zentral markiert.");
assert(html.includes("global-billing-context__facts nk-ui-list nk-ui-list--plain"), "Statische Faktenliste wurde nicht zentral markiert.");

const sandbox = { globalThis:{} };
vm.runInNewContext(source, sandbox, { filename:"ui-design-system.js" });
const api = sandbox.globalThis.NKProUIDesignSystem;
assert(api && api.version === "1.2.0", "UI-Design-System-Version 1.2.0 fehlt.");
assert(api.migration && api.migration.package === "AP22C", "AP22C-Migrationsmetadaten fehlen.");
assert(JSON.stringify(Array.from(api.migration.components)) === JSON.stringify(["table","list","toolbar"]), "AP22C-Komponentenumfang ist nicht abgegrenzt.");
assert(api.component("table")?.className === "nk-ui-table", "Tabellenkomponente fehlt.");
assert(api.component("list")?.className === "nk-ui-list", "Listenkomponente fehlt.");
assert(api.component("toolbar")?.className === "nk-ui-toolbar", "Toolbar-Komponente fehlt.");
for (const name of ["upgrade", "observe", "disconnect", "init"]) assert(typeof api[name] === "function", `UI-Migrationsschnittstelle fehlt: ${name}`);
assert(source.includes(".letter-page,.brief-preview-host,.document-print-window"), "Dokument- und Drucktabellen sind nicht ausdrücklich von der App-Tabellenmigration ausgeschlossen.");

console.log("AP22C Tabellen und Listen: Strukturprüfung bestanden.");
