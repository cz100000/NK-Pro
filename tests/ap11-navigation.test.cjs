"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const html = read("index.html");
const css = read("assets/app.css");
const navigation = read("js/navigation.js");
const runtimeConfig = read("js/app-runtime-config.js");

assert((html.match(/class="tabs workflow-nav"/g) || []).length === 1, "Es muss genau eine produktive Workflow-Navigation geben.");
assert(/<nav\s+aria-label="Hauptnavigation"\s+class="tabs workflow-nav"/.test(html), "Die Hauptnavigation ist nicht semantisch als nav ausgezeichnet.");
assert(!/\bon(?:click|change|input|submit|keydown)\s*=/i.test(html), "Inline-Ereignishandler sind in der Navigation vorhanden.");

const groups = [...html.matchAll(/<section class="nav-group" data-nav-group-section="([^"]+)">/g)].map(match => match[1]);
assert(JSON.stringify(groups) === JSON.stringify(["object", "billing", "archive", "extras"]), `Navigationsgruppen sind falsch sortiert: ${groups.join(", ")}`);

const tabs = [...html.matchAll(/class="tab-btn nav-group-item[^"]*"[^>]*data-tab="([^"]+)"/g)].map(match => match[1]);
const expectedTabs = [
  "objekt", "wohnungsverwaltung", "wasser", "mieterverwaltung",
  "start", "mieter", "einnahmen", "einstellungen", "manuellewerte",
  "umlage", "qualitaet", "vorauszahlungsanpassung", "briefe", "export",
  "archiv", "sicherung"
];
assert(tabs.length === 16 && new Set(tabs).size === 16, "Die Navigation muss 16 eindeutige Ziele enthalten.");
assert(JSON.stringify(tabs) === JSON.stringify(expectedTabs), `Navigationsreihenfolge ist inkonsistent: ${tabs.join(", ")}`);

const labels = [...html.matchAll(/class="nav-item-label">([^<]+)<\/span>/g)].map(match => match[1].replace(/&amp;/g, "&"));
assert(JSON.stringify(labels.slice(0, 4)) === JSON.stringify(["Objekt", "Wohnungen", "Zähler", "Mieter"]), "Objektgruppe entspricht nicht dem freigegebenen Zielbild.");
assert(JSON.stringify(labels.slice(4, 14)) === JSON.stringify(["Abrechnungsübersicht", "Mieter & Wohnungen", "Miete & Vorauszahlungen", "Kosten erfassen", "Manuelle & externe Werte", "Verteilung", "Prüfung", "Neue Vorauszahlungen", "Briefe", "Export"]), "Abrechnungsnavigation entspricht nicht der freigegebenen Ablaufreihenfolge.");
assert(!html.includes("Weitere Abrechnungsschritte"), "Die entfernte Unterüberschrift ist noch vorhanden.");
assert(!html.includes("nav-group-item--secondary"), "Sekundäre Abrechnungsnavigation ist noch vorhanden.");

const settings = html.match(/<button[^>]*class="sidebar-settings-dummy"[^>]*>/)?.[0] || "";
assert(settings.includes('aria-disabled="true"'), "Einstellungen-Dummy ist nicht als deaktiviert ausgezeichnet.");
assert(settings.includes('data-nav-hint="Noch nicht verfügbar"'), "Hinweis des Einstellungen-Dummys fehlt.");
assert(!settings.includes("data-ui-action"), "Einstellungen-Dummy darf keine UI-Aktion auslösen.");
assert(html.includes('id="settingsUnavailableText">Noch nicht verfügbar</span>'), "Zugängliche Beschreibung des Einstellungen-Dummys fehlt.");

const svgCount = (html.match(/class="nav-icon-svg"/g) || []).length;
assert(svgCount >= 22, `Lokales SVG-Iconsystem ist unvollständig (${svgCount}).`);
assert(!/<link[^>]+(?:fontawesome|material-icons|bootstrap-icons)|https?:\/\/[^"']+\.(?:svg|woff2?)/i.test(html), "Navigation besitzt eine externe Icon- oder Schriftabhängigkeit.");

for (const token of [
  "--sidebar-width", "--sidebar-shell", "--sidebar-surface", "--sidebar-text", "--sidebar-icon",
  "--sidebar-active", "--sidebar-hover", "--sidebar-disabled", "--focus-ring", "--font-ui"
]) assert(css.includes(token + ":"), `Design-Token ${token} fehlt.`);
assert(css.includes("V99.4.12 – AP11: Navigationsstruktur und visuelles Grundsystem"), "AP11-CSS-Struktur ist nicht gekennzeichnet.");
assert(!css.includes("V99.2.6 – freigegebenes Mock-up der linken Navigation"), "Veraltete parallele Navigations-CSS-Struktur ist noch vorhanden.");
assert(css.includes("@media (max-width:980px)"), "Schmale Navigation ist nicht definiert.");
assert(css.includes("@media (max-height:720px)"), "Geringe Fensterhöhe ist nicht behandelt.");
assert(css.includes(".sidebar-settings-dummy:focus-visible::after"), "Tastaturzugänglicher Einstellungen-Hinweis fehlt.");

assert(navigation.includes('wasser:"group-object"'), "Zähler ist nicht der Objektvorbereitung zugeordnet.");
assert(navigation.includes('node.setAttribute("aria-current", "page")'), "Aktive Navigation setzt aria-current nicht.");
assert(navigation.includes('home.classList.toggle("active", landing)'), "Arbeitsweiche besitzt keinen verlässlichen aktiven Zustand.");
assert(!/\b(localStorage|indexedDB|caches)\b/.test(navigation), "Navigationsrenderer greift direkt auf Browser-Speicher zu.");
assert(!/\bstate\s*[.[]/.test(navigation), "Navigationsmodul greift direkt auf Fachzustand zu.");

assert(runtimeConfig.includes('const APP_VERSION = "V99.4.13";'), "Laufzeitversion ist nicht V99.4.13.");
assert(runtimeConfig.includes('const APP_VERSION_NAME = "Restentkopplung und globale Zustandsbereinigung";'), "Versionsname ist inkonsistent.");

process.stdout.write("AP11-Navigationsprüfung abgeschlossen: 4 Gruppen, 16 eindeutige Ziele und 10 gleichrangige Abrechnungsschritte in freigegebener Ablaufreihenfolge sind konsistent.\n");
