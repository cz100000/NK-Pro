"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const exists = relative => fs.existsSync(path.join(root, relative));

const html = read("index.html");
const css = read("assets/app.css");
const ui = read("js/ui-documents.js");
const bindings = read("js/ui-bindings.js");
const worker = read("service-worker.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const project = JSON.parse(read("nk-pro-project.json"));
const packageJson = JSON.parse(read("package.json"));

assert(packageJson.version === "99.4.23" && packageJson.name === "nk-pro-v99-4-23", "AP18-Paketversion ist inkonsistent.");
assert(project.appVersion === "99.4.23" && project.displayVersion === "V99.4.23" && project.basedOn === "99.4.22-AP19", "AP18-Projektmetadaten sind inkonsistent.");
assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenschema oder Datenebenenvertrag wurde verändert.");
assert(project.documentLayoutVersion === 4, "AP13-Dokumentlayout wurde verändert.");
assert(project.uiVisualSystemVersion === 4 && project.navigationDesignSystemVersion === 5, "AP18-UI-/Navigationssystemversion fehlt.");
assert(project.briefPreviewZoomVersion === 1 && project.buttonSystemVersion === 1 && project.brandAssetVersion === 1 && project.responsivePolishVersion === 1, "AP18-Komponentenmetadaten fehlen.");

for (const asset of [
  "assets/brand/nk-pro-logo.png", "assets/brand/nk-pro-icon-master.png",
  "assets/brand/nk-pro-mark-64.png", "assets/brand/nk-pro-mark-96.png", "assets/brand/nk-pro-mark-128.png",
  "icons/icon-16.png", "icons/icon-32.png", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
  "icons/icon-maskable-192.png", "icons/icon-maskable-512.png"
]) assert(exists(asset), `Marken-/PWA-Asset fehlt: ${asset}`);

assert(manifest.version === "99.4.23" && manifest.short_name === "NK-Pro", "AP18-Manifestversion ist inkonsistent.");
const iconPurposes = manifest.icons.map(icon => icon.purpose || "any");
assert(iconPurposes.includes("any") && iconPurposes.includes("maskable"), "Manifest enthält keine getrennten any-/maskable-Icons.");
assert(manifest.icons.some(icon => icon.src.includes("icon-maskable-192.png") && icon.purpose === "maskable"), "Maskierbares 192px-Icon fehlt.");
assert(manifest.icons.some(icon => icon.src.includes("icon-maskable-512.png") && icon.purpose === "maskable"), "Maskierbares 512px-Icon fehlt.");

assert(html.includes('class="sidebar-brand-mark"') && html.includes('src="./assets/brand/nk-pro-mark-96.png"'), "Neues Navigationslogo fehlt.");
assert(html.includes('class="tab-btn nav-start-link"') && html.includes('data-tab="landing"'), "Aufgewerteter globaler Start-Eintrag fehlt.");
assert(html.includes('rel="icon"') && html.includes('rel="apple-touch-icon"'), "Favicon-/iOS-Verweise fehlen.");
for (const action of ["previewZoomOut", "previewZoomIn", "previewFitPage", "previewFitWidth", "refreshBrief"]) {
  assert(html.includes(`document.${action}`) && bindings.includes(`document.${action}`), `Briefaktion ${action} ist nicht vollständig gebunden.`);
}
assert(html.includes('id="briefPreviewViewport"') && html.includes('id="briefPreviewStage"') && html.includes('id="briefZoomValue"'), "AP18-Vorschaucontainer fehlen.");
assert((html.match(/data-toolbar-group=/g) || []).length === 3, "Briefwerkzeugleiste besitzt nicht genau drei Funktionsgruppen.");
assert(html.includes('aria-label="Für Schwarzweißdruck optimieren"') && html.includes('data-ui-change="document.setBriefSetting"'), "Statische Schwarzweißsteuerung fehlt.");

for (const token of ["--control-height:38px", "--control-height-compact:32px", "--control-focus:", "--transition-ui:", "--icon-size-sm:"]) {
  assert(css.includes(token), `Zentrale Designvariable fehlt: ${token}`);
}
for (const selector of [".ui-button--primary", ".ui-button--secondary", ".ui-button--quiet", ".ui-button--danger", ".ui-button--warning", ".ui-button--icon", ".ui-button--compact", ".brief-preview-toolbar", ".brief-preview-viewport", ".nav-start-link.active"]) {
  assert(css.includes(selector), `AP18-Komponentenstil fehlt: ${selector}`);
}
assert(css.includes(":focus-visible") && css.includes("outline:2px solid") && css.includes("box-shadow:var(--control-focus)"), "Sichtbare AP18-Fokuszustände fehlen.");
assert(!css.includes("transform:translateY(-1px)"), "Veralteter Hover-Layoutsprung ist noch vorhanden.");
assert(!css.includes(".brief-print-mode-switch"), "Veralteter dynamischer Briefschalterstil ist noch vorhanden.");
assert(css.includes("@media (max-width:1280px)") && css.includes("@media (max-width:1100px)") && css.includes("@media (max-width:900px)") && css.includes("@media (max-width:680px)"), "AP18-Responsive-Breakpoints fehlen.");
assert(css.includes(".clipboard-fallback-input") && !ui.includes("textarea.style.position") && !ui.includes("textarea.style.left"), "Clipboard-Inline-Stile wurden nicht ersetzt.");

assert(ui.includes('BRIEF_PREVIEW_SESSION_KEY = "nkpro.briefPreview.ap18"'), "Sitzungsspeicher für Briefzoom fehlt.");
assert(ui.includes("BRIEF_PREVIEW_MIN_SCALE = 0.4") && ui.includes("BRIEF_PREVIEW_MAX_SCALE = 2") && ui.includes("BRIEF_PREVIEW_STEP = 0.1"), "Zoomgrenzen oder -schritt sind inkonsistent.");
assert(ui.includes('mode:"page"') && ui.includes('mode:"width"') && ui.includes('mode:"custom"'), "Zoommodi Seite/Breite/Benutzerdefiniert fehlen.");
assert(ui.includes("availableHeight / a4HeightPx") && ui.includes("availableWidth / a4WidthPx"), "Seiten-/Breitenanpassung berücksichtigt den Viewport nicht.");
assert(ui.includes("briefPreviewView.mode !== \"custom\"") && ui.includes("ResizeObserver"), "Automatische Neuberechnung bei Größenänderung fehlt.");

for (const resource of [
  "./assets/brand/nk-pro-logo.png", "./assets/brand/nk-pro-icon-master.png", "./assets/brand/nk-pro-mark-64.png",
  "./assets/brand/nk-pro-mark-96.png", "./assets/brand/nk-pro-mark-128.png", "./icons/icon-16.png", "./icons/icon-32.png",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-192.png", "./icons/icon-maskable-512.png"
]) assert(worker.includes(`"${resource}"`), `PWA-App-Shell enthält ${resource} nicht.`);
assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-23-ap20-corr1"'), "AP18-Cachebezeichnung fehlt.");

process.stdout.write("AP18-Strukturprüfung abgeschlossen: Version, Datenverträge, Markenassets, PWA-Icons, zentrales Aktionssystem, Navigation, Briefzoom, Werkzeuggruppen, Fokuszustände und Responsive-Regeln sind konsistent.\n");
