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

assert(project.appVersion === "99.4.32" && project.runtimeBuildId === "99.4.32-ap22d", "AP22D-Projektversion ist inkonsistent.");
assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenverträge wurden unbeabsichtigt verändert.");
assert(project.uiDesignSystemVersion === 4 && project.uiDialogsStatesMigrationVersion === 1, "AP22D-Migrationsversion fehlt.");
assert(project.nextWorkPackage === "AP22E – UI-Bibliothek: Seitenschale, Layout und Komponenten-Sonderformen", "Nächstes Arbeitspaket ist nicht AP22E.");
assert(manifest.version === "99.4.32" && packageJson.version === "99.4.32", "Manifest- oder Paketversion ist inkonsistent.");
assert(html.includes('content="99.4.32-ap22d" name="nk-pro-build"') && html.includes("NK-Pro V99.4.32 – AP22D Dialoge und Leerzustände"), "HTML-Buildkennung ist inkonsistent.");
assert(html.includes('./assets/app.css?v=99.4.32-ap22d') && html.includes('./js/ui-design-system.js?v=99.4.32-ap22d'), "Geänderte UI-Assets sind nicht versionsgebunden.");
assert(runtime.includes('const APP_VERSION = "V99.4.32";') && runtime.includes('const APP_VERSION_NAME = "AP22D-UI-Bibliothek-Dialoge-Leerzustaende";'), "Laufzeitversion ist inkonsistent.");
assert(serviceWorker.includes('const CACHE_NAME = "nk-pro-v99-4-32-ap22d";') && serviceWorker.includes('const BUILD_ID = "99.4.32-ap22d";'), "Service-Worker-Version ist inkonsistent.");
assert(serviceWorkerRegister.includes('const BUILD_ID = "99.4.32-ap22d";'), "Service-Worker-Registrierung verwendet eine abweichende Build-ID.");

for (const file of [
  "AP22D_DATEIPOSITIVLISTE.md", "AP22D_INVENTAR_DIALOGE_UND_ZUSTAENDE.md",
  "AP22D_UI_BIBLIOTHEK_DIALOGE_UND_LEERZUSTAENDE.md", "AP22D_DATEIAENDERUNGEN.md",
  "AP22D_DATEIAENDERUNGEN.json", "AP22D_PRUEFBERICHT.md", "AP22D_TEST_RESULTS.json",
  "AP22D_RELEASE_CONTENT_POLICY.json", "AP22D_ABSCHLUSS.md"
]) assert(fs.existsSync(path.join(root, file)), `AP22D-Nachweis fehlt: ${file}`);

assert(css.includes("V99.4.32 – AP22D: zentrale Dialoge und standardisierte Inhaltszustände"), "AP22D-CSS-Migrationsschicht fehlt.");
for (const selector of [
  ".nk-ui-dialog-layer", ".nk-ui-dialog--compact", ".nk-ui-dialog--wide", ".nk-ui-dialog--danger",
  ".nk-ui-dialog__header", ".nk-ui-dialog__body", ".nk-ui-dialog__footer",
  ".nk-ui-empty-state--no-data", ".nk-ui-empty-state--not-created", ".nk-ui-empty-state--filtered", ".nk-ui-empty-state--loading", ".nk-ui-empty-state--error",
  ".nk-ui-empty-state--not-applicable", ".nk-ui-empty-state--unavailable"
]) assert(css.includes(selector), `AP22D-Komponentenregel fehlt: ${selector}`);

for (const id of ["billingCreateModal", "billingDeleteModal", "costPriceModal", "costSelectionModal", "qualityDetailDialog"]) {
  assert(new RegExp(`id="${id}"`).test(html), `Produktiver Dialog fehlt: ${id}`);
}
assert((html.match(/class="[^"]*nk-ui-dialog/g) || []).length >= 5, "Mindestens fünf produktive Dialoge müssen zentral markiert sein.");
assert(html.includes('data-nk-ui-escape="false" id="billingDeleteModal"') && html.includes('data-nk-ui-backdrop-close="false"'), "Destruktiver Dialog ist nicht besonders geschützt.");
assert(/<input[^>]*data-nk-ui-initial-focus="true"[^>]*id="deleteBillingCodeInput"/.test(html), "Destruktive Aktion erhält unbeabsichtigt den Anfangsfokus.");
assert(html.includes('id="individualValuesEmpty"') && html.includes('data-nk-ui-state="filtered"'), "Produktiver Filter-Leerzustand fehlt.");

const sandbox = { globalThis:{} };
vm.runInNewContext(source, sandbox, { filename:"ui-design-system.js" });
const api = sandbox.globalThis.NKProUIDesignSystem;
assert(api && api.version === "1.3.0", "UI-Design-System-Version 1.3.0 fehlt.");
assert(api.migration && api.migration.package === "AP22D", "AP22D-Migrationsmetadaten fehlen.");
assert(JSON.stringify(Array.from(api.migration.components)) === JSON.stringify(["dialog","emptyState"]), "AP22D-Komponentenumfang ist nicht abgegrenzt.");
assert(api.component("dialog")?.className === "nk-ui-dialog", "Dialogkomponente fehlt.");
assert(api.component("emptyState")?.className === "nk-ui-empty-state", "Zustandskomponente fehlt.");
assert(JSON.stringify(Array.from(api.states.types)) === JSON.stringify(["no-data","not-created","filtered","loading","error","not-applicable","unavailable"]), "Zentrale Zustandstypen sind unvollständig.");
for (const name of ["open", "close", "sync", "active"]) assert(typeof api.dialog[name] === "function", `Dialogschnittstelle fehlt: ${name}`);
for (const name of ["create", "render"]) assert(typeof api.states[name] === "function", `Zustandsschnittstelle fehlt: ${name}`);
assert(source.includes("trapDialogFocus") && source.includes("restoreDialogFocus") && source.includes("data-nk-ui-initial-focus"), "Fokusführung oder Fokusfalle fehlt.");
assert(source.includes(".letter-page,.brief-preview-host,.document-print-window"), "Brief-, Druck- und Exportbereiche sind nicht ausdrücklich ausgeschlossen.");

console.log("AP22D Dialoge und Leerzustände: Strukturprüfung bestanden.");
