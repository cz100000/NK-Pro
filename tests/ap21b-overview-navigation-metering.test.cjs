"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const html = read("index.html");
const css = read("assets/app.css");
const overview = read("js/ui-billing-overview.js");
const individual = read("js/ui-individual-values.js");
const rules = read("js/quality-rules.js");
const project = JSON.parse(read("nk-pro-project.json"));
const pkg = JSON.parse(read("package.json"));

assert.equal(project.appVersion, "99.4.26");
assert.equal(project.schemaVersion, 5);
assert.equal(project.dataLayerContractVersion, 1);
assert.equal(pkg.version, "99.4.26");
assert.match(html, /name="nk-pro-build" content="99\.4\.26-ap21b"|content="99\.4\.26-ap21b" name="nk-pro-build"/);

assert.doesNotMatch(html, /id="billingPeriodSection"|id="billingPeriodSettings"/);
assert.doesNotMatch(html, />\s*1\.\s*Abrechnungszeitraum\s*</);
assert.match(html, /data-global-billing-context/);
assert.match(html, /data-global-billing-object/);
assert.match(html, /data-global-billing-year/);
assert.match(html, /data-global-billing-status/);
assert.match(html, /data-global-billing-mode/);
assert.match(html, /data-global-billing-close/);

assert.match(html, /id="billingOverviewRoot"/);
assert.match(html, /Nebenkostenabrechnung – Übersicht/);
assert.match(html, /Abrechnungen öffnen, bearbeiten, prüfen oder archivierte Abrechnungen ansehen\./);
assert.match(html, /data-ui-action="billing\.openCreateModal"/);
assert.match(html, /data-billing-overview-import/);
assert.match(html, /ui-billing-overview\.js\?v=99\.4\.26-ap21b/);

const navLabels = [...html.matchAll(/data-nav-group="(?:object|billing)"[^>]*>[\s\S]*?<span class="nav-item-label">([^<]+)<\/span>/g)].map(match => match[1]);
[
  "Objektdaten","Wohnungen","Zähler","Mietverhältnisse","Übersicht","Vorauszahlungen","Gesamtkosten",
  "Individuelle Werte","Abrechnungsergebnis","Prüfung","Vorauszahlungsanpassung","Briefe","Export","Archiv"
].forEach(label => assert(navLabels.includes(label), `Navigationseintrag fehlt: ${label}`));
assert.doesNotMatch(html, /class="[^\"]*nav-start-entry/);
assert.doesNotMatch(html, /data-nav-group="object"[^>]*data-tab="objektuebersicht"/);
assert.match(css, /--sidebar-width:256px/);
assert.match(css, /\.nav-group-item\.nav-archive-entry\s*\{[\s\S]*?border-top:0/);

["all","working","completed","archived"].forEach(filter => assert(overview.includes(`id:"${filter}"`)));
[
  "Mietverhältnisse","Vorauszahlungen","Gesamtkosten","Individuelle Werte","Abrechnungsergebnis","Prüfung",
  "Arbeitsstand der geöffneten Abrechnung","Als Nächstes:","Zeilen pro Seite"
].forEach(text => assert(overview.includes(text), `Übersichtsinhalt fehlt: ${text}`));
assert.match(overview, /qualityAssurance\.inspect/);
assert.match(overview, /qualityRules\.evaluate/);
assert.match(overview, /archiveActions\.validateItem/);
assert.match(overview, /archive\.openYear/);
assert.match(overview, /archive\.reopenForRework/);
assert.match(overview, /billing\.openCurrentEdit/);
assert.match(overview, /billing\.openCurrentView/);
assert.match(overview, /document\.getElementById\("jsonImport"\)/);
assert.doesNotMatch(overview, /Wasserzählerstände vervollständigen/);

assert.match(individual, /heat:'<path/);
assert.match(individual, /satellite:'<path/);
assert.match(individual, /individual-cost-icon--' \+ name/);
assert.match(individual, /document\.addEventListener\("toggle"/);
assert.match(individual, /panel\.closest\("#individualValuesMeterSource"\)/);
assert.match(css, /\.individual-cost-icon--heat[\s\S]*?color:#d53b32/);
assert.match(css, /\.individual-cost-icon--satellite[\s\S]*?color:#315f91/);

const ruleIds = [...rules.matchAll(/rule\("(NKP-[A-Z]+-\d+)"/g)].map(match => match[1]);
assert.equal(ruleIds.length, 42, "Regelanzahl wurde verändert.");
assert.equal(ruleIds.filter(id => id === "NKP-FACH-002").length, 1, "NKP-FACH-002 wurde verändert oder dupliziert.");
assert.match(rules, /rule\("NKP-FACH-001","Abrechnungszeitraum ist gültig"[\s\S]*?targetTab:"start",targetSelector:"\[data-billing-overview-period-correction\]"/);
assert.match(rules, /rule\("NKP-FACH-002","Mindestens eine aktive Wohnung ist vorhanden"/);

const digest = crypto.createHash("sha256").update(rules).digest("hex");
assert.equal(digest.length, 64);
console.log("AP21B-Strukturprüfung bestanden.");
