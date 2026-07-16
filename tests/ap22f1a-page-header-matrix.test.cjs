"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");

const matrix = [
  ["landing", "default", "Was möchten Sie bearbeiten?"],
  ["objektuebersicht", "default", "Objekt vorbereiten – Übersicht"],
  ["objekt", "default", "Objektdaten"],
  ["archiv", "wide", "Abrechnungsarchiv"],
  ["start", "wide", "Nebenkostenabrechnung – Übersicht"],
  ["mieterverwaltung", "wide", "Mieterverwaltung"],
  ["wohnungsverwaltung", "wide", "Wohnungsverwaltung"],
  ["sicherung", "wide", "Datensicherung &amp; System"],
  ["qualitaet", "wide", "Abrechnung prüfen und freigeben"],
  ["einstellungen", "wide", "Gesamtkosten erfassen"],
  ["mieter", "wide", "Mietverhältnisse prüfen und bearbeiten"],
  ["einnahmen", "wide", "Vorauszahlungen erfassen"],
  ["wasser", "default", "Zähler"],
  ["manuellewerte", "wide", "Individuelle Werte und Verbräuche erfassen"],
  ["umlage", "wide", "Ergebnis der Abrechnung"],
  ["vorauszahlungsanpassung", "wide", "Vorauszahlungen für das Folgejahr anpassen"],
  ["briefe", "wide", "Abrechnungsbriefe erstellen"],
  ["export", "wide", "Abrechnung exportieren"]
];

function sectionFor(id) {
  const pattern = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`);
  const match = pattern.exec(html);
  assert.ok(match, `Ansicht fehlt: ${id}`);
  const start = match.index;
  const nextMatch = /<section\b[^>]*\bclass="[^"]*\btab\b[^"]*"[^>]*>/g;
  nextMatch.lastIndex = start + match[0].length;
  const next = nextMatch.exec(html);
  return html.slice(start, next ? next.index : html.length);
}

for (const [id, variant, title] of matrix) {
  const section = sectionFor(id);
  assert.equal((section.match(/data-page-shell=/g) || []).length, 1, `${id}: genau eine Schale`);
  assert.match(section, new RegExp(`data-page-shell="${variant}"`), `${id}: Schalenvariante`);
  assert.equal((section.match(/data-page-header=/g) || []).length, 1, `${id}: genau ein Seitenkopf`);
  assert.equal((section.match(/<h1\b/g) || []).length, 1, `${id}: genau ein H1`);
  assert.match(section, new RegExp(`<h1[^>]*page-header__title[^>]*>${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h1>`), `${id}: Titel`);
  const headerEnd = section.indexOf("</header>");
  const header = section.slice(0, headerEnd + 9);
  assert.doesNotMatch(header, /data-page-readonly|>\s*Schreibgeschützt\s*</i, `${id}: keine kleine Schreibschutzkennzeichnung`);
}

assert.match(sectionFor("objekt"), /data-page-save-status/);
assert.match(sectionFor("objekt"), /data-page-save/);
assert.match(sectionFor("manuellewerte"), /data-page-save-status/);
assert.match(sectionFor("start"), /<details[^>]*hidden=""[^>]*id="billingPeriodSection"/);
assert.match(sectionFor("briefe"), /id="lettersEditorSection"/);
assert.match(sectionFor("export"), /data-ui-action="application\.save"/);

const redirect = sectionFor("verbraeuche");
assert.doesNotMatch(redirect, /data-page-shell|data-page-header|<h1\b/, "verbraeuche bleibt unsichtbares Kompatibilitätsziel");
console.log(`AP22F1A page header matrix: PASS (${matrix.length} visible views)`);
