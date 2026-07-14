"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const compact = value => String(value || "").replace(/\s+/g, " ").trim();

const html = read("index.html");
const css = read("assets/app.css");
const runtime = read("js/app-runtime-config.js");
const navigation = read("js/navigation.js");
const controller = read("js/ui-page-controller.js");
const metering = read("js/ui-metering.js");
const renderer = read("js/document-renderer.js");
const worker = read("service-worker.js");
const project = JSON.parse(read("nk-pro-project.json"));

assert(html.includes("<title>NK-Pro V99.4.21 – AP18-Korrekturen, UI-Feinschliff und UX-Bereinigung</title>"), "AP14-HTML-Titel fehlt.");
assert(runtime.includes('const APP_VERSION_NAME = "AP18-Korrekturen, UI-Feinschliff und UX-Bereinigung";'), "AP14-Laufzeitname fehlt.");
assert(project.versionName === "AP18-Korrekturen, UI-Feinschliff und UX-Bereinigung", "AP14-Projektname fehlt.");
assert(project.schemaVersion === 5 && project.dataLayerContractVersion === 1, "Datenschema oder Datenebenenvertrag wurde verändert.");
assert(project.navigationDesignSystemVersion === 5 && project.uiVisualSystemVersion === 4 && project.meterInventoryDummyVersion === 1, "AP14-UI-Metadaten fehlen.");

assert(css.includes('--font-ui:"Segoe UI",Arial,sans-serif;'), "Verbindliche Segoe-UI-Schriftfamilie fehlt.");
assert(css.includes("V99.4.17 – AP14: Navigationsbereinigung und visuelles UI-System"), "Zentraler AP14-CSS-Block fehlt.");
assert(css.includes(".letter-page") && css.includes("font-family:Arial, sans-serif"), "Arial-Abgrenzung der Briefdarstellung fehlt.");
assert(renderer.includes('font-family:Arial,"Liberation Sans",sans-serif'), "Arial-Abgrenzung des Dokumentrenderers fehlt.");
assert(css.includes("font-family:Consolas") && css.includes(".technical-log"), "Monospace-Abgrenzung technischer Bereiche fehlt.");
for (const token of ["--app-navy", "--app-blue", "--app-workspace", "--app-border", "--app-focus"]) {
  assert(css.includes(token + ":"), `AP14-Farbsystemtoken ${token} fehlt.`);
}

const groupTabs = [...html.matchAll(/class="tab-btn nav-group-item[^"]*"[^>]*data-tab="([^"]+)"/g)].map(match => match[1]);
const expected = [
  "objektuebersicht", "objekt", "wohnungsverwaltung", "wasser", "mieterverwaltung",
  "start", "mieter", "einnahmen", "einstellungen", "manuellewerte", "verbraeuche",
  "umlage", "qualitaet", "vorauszahlungsanpassung", "briefe", "export", "archiv", "sicherung"
];
assert(JSON.stringify(groupTabs) === JSON.stringify(expected), `AP14-Navigationsreihenfolge ist falsch: ${groupTabs.join(", ")}`);
assert(groupTabs.length === 18 && new Set(groupTabs).size === 18, "AP17 erweitert den AP14-Bestand auf 18 eindeutige fachliche Navigationsziele.");

const waterButton = html.match(/<button class="tab-btn nav-group-item"[^>]*data-tab="wasser"[^>]*>/)?.[0] || "";
const consumptionButton = html.match(/<button class="tab-btn nav-group-item"[^>]*data-tab="verbraeuche"[^>]*>/)?.[0] || "";
assert(waterButton.includes('data-nav-group="object"') && !waterButton.includes("data-requires-billing"), "Zähler ist nicht ausschließlich der Objektvorbereitung zugeordnet.");
assert(consumptionButton.includes('data-nav-group="billing"') && consumptionButton.includes('data-requires-billing="true"'), "Verbräuche erfassen ist nicht korrekt dem Abrechnungsworkflow zugeordnet.");
assert(html.indexOf('data-tab="manuellewerte"') < html.indexOf('data-tab="verbraeuche"') && html.indexOf('data-tab="verbraeuche"') < html.indexOf('data-tab="umlage"'), "Verbräuche erfassen steht nicht direkt nach Manuelle & externe Werte.");
assert(navigation.includes('wasser:"group-object"') && navigation.includes('verbraeuche:"group-billing"'), "Navigationsgruppen-Mapping ist unvollständig.");
assert(runtime.includes('const START_NAV_TABS = ["landing","objektuebersicht","objekt","mieterverwaltung","wohnungsverwaltung","wasser","start","archiv","sicherung"];'), "Zähler fehlt im Start-/Objektmodus.");
assert(runtime.includes('const BILLING_NAV_TABS = ["qualitaet","mieter","einstellungen","einnahmen","manuellewerte","verbraeuche","umlage","vorauszahlungsanpassung","briefe","export"];'), "Verbrauchserfassung fehlt im Abrechnungsmodus.");

const dummyStart = html.indexOf('<section class="tab meter-inventory-page" id="wasser">');
const productiveStart = html.indexOf('<section class="tab meter-pilot-page" id="verbraeuche">');
assert(dummyStart >= 0 && productiveStart > dummyStart, "DUMMY- oder Verbrauchsseite fehlt.");
const dummy = html.slice(dummyStart, productiveStart);
const productive = html.slice(productiveStart, html.indexOf('<section class="tab" id="manuellewerte">', productiveStart));
for (const label of ["DUMMY", "Wasserzähler", "Wärmemengenzähler", "Heizkostenverteiler", "Gaszähler", "Stromzähler", "Zählerinventar-Übersicht"]) {
  assert(dummy.includes(label), `Zählerinventar-DUMMY enthält ${label} nicht.`);
}
for (const id of ["waterMeterSettings", "meterCurrentSections", "meterConsumptionControl", "meterControlSummary"]) {
  assert(!dummy.includes(`id="${id}"`), `Produktiver Verbrauchsbereich ${id} ist im DUMMY dupliziert.`);
  assert(productive.includes(`id="${id}"`), `Produktiver Verbrauchsbereich ${id} fehlt unter Verbräuche erfassen.`);
}
assert(!dummy.includes('data-page-save=""') && !dummy.includes("<input") && !dummy.includes("<select") && !dummy.includes("<textarea"), "Der Zähler-DUMMY besitzt Eingabe- oder Speicherfunktionen.");
assert(controller.includes('wasser:{title:"Zähler"') && controller.includes('renderContent:null'), "DUMMY-Seitendefinition ist nicht zustandsfrei.");
assert(controller.includes('verbraeuche:{title:"Verbräuche erfassen"') && controller.includes('renderContent:()=>renderWaterMeters()'), "Produktive Verbrauchserfassung ist nicht dem neuen Seitenziel zugeordnet.");
assert(metering.includes('renderOverviewForTab("verbraeuche")') && !metering.includes('renderOverviewForTab("wasser")'), "Verbrauchsrenderer aktualisiert noch das alte Seitenziel.");

assert(html.includes('id="workspaceHelpButton"') && html.includes('id="workspaceMenuButton"'), "Hilfe oder Menü fehlt im Kopfbereich.");
assert(html.includes("workspace-action-icon") && html.includes("<span>Hilfe</span>") && html.includes("<span>Menü</span>"), "Icon-/Textdarstellung von Hilfe oder Menü fehlt.");
assert(navigation.includes("initializeWorkspaceHeaderControls") && navigation.includes("closeWorkspaceHeaderPanels"), "Kopfbereichssteuerung ist nicht initialisiert.");
assert(!html.includes('class="workspace-main-tabs"') && !html.includes('role="tablist"'), "Unzulässige neue Hauptbereich-Tab-Leiste erkannt.");

function svgForButton(fragment) {
  const match = fragment.match(/<svg[^>]*class="nav-icon-svg"[^>]*>[\s\S]*?<\/svg>/);
  return compact(match && match[0]);
}
const objectGroup = html.match(/<button[^>]*data-nav-toggle="group-object"[\s\S]*?<\/button>/)?.[0] || "";
const billingGroup = html.match(/<button[^>]*data-nav-toggle="group-billing"[\s\S]*?<\/button>/)?.[0] || "";
const landingObject = html.match(/<button class="landing-choice"[^>]*data-ui-action="navigation\.enterObjectPreparation"[\s\S]*?<\/button>/)?.[0] || "";
const landingBilling = html.match(/<button class="landing-choice"[^>]*data-ui-action="navigation\.enterBillingOverview"[\s\S]*?<\/button>/)?.[0] || "";
assert(svgForButton(objectGroup) && svgForButton(objectGroup) === svgForButton(landingObject), "Objekt-Startkachel verwendet nicht exakt das Navigationsicon.");
assert(svgForButton(billingGroup) && svgForButton(billingGroup) === svgForButton(landingBilling), "Abrechnungs-Startkachel verwendet nicht exakt das Navigationsicon.");

assert(worker.includes('const CACHE_NAME = "nk-pro-v99-4-21-ap18";'), "PWA-Cache ist nicht V99.4.21.");
assert(!/<link[^>]+(?:fontawesome|material-icons|bootstrap-icons)|https?:\/\/[^"']+\.(?:svg|woff2?)/i.test(html), "AP14 führt eine externe Icon- oder Schriftabhängigkeit ein.");
for (const file of ["tests/ap14-ui-navigation.test.cjs", "tests/ap14-ui-navigation.spec.js"]) {
  assert(fs.existsSync(path.join(root, file)), `${file} fehlt.`);
}

process.stdout.write("AP14-Strukturprüfung abgeschlossen: UI-System, 18 Navigationsziele, zustandsfreier Zähler-DUMMY, getrennte Verbrauchserfassung, Kopfaktionen und Iconparität sind konsistent.\n");
