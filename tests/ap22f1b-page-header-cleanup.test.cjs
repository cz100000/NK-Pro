"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

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
const savePages = new Set(["objekt", "mieterverwaltung", "wohnungsverwaltung", "qualitaet", "einstellungen", "mieter", "einnahmen", "manuellewerte", "umlage", "vorauszahlungsanpassung", "briefe"]);
const removedMetaPages = new Set(["objekt", "archiv", "mieterverwaltung", "wohnungsverwaltung", "sicherung", "wasser"]);

function sectionFor(id) {
  const match = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`).exec(html);
  assert.ok(match, `Ansicht fehlt: ${id}`);
  const nextPattern = /<section\b[^>]*\bclass="[^"]*\btab\b[^"]*"[^>]*>/g;
  nextPattern.lastIndex = match.index + match[0].length;
  const next = nextPattern.exec(html);
  return html.slice(match.index, next ? next.index : html.length);
}
function headerFor(id) {
  const section = sectionFor(id);
  if (id === "landing") {
    const end = section.indexOf('<div class="landing-choices">');
    assert.ok(end >= 0, `${id}: Seitenkopf fehlt`);
    return section.slice(0, end);
  }
  const end = section.indexOf("</header>");
  assert.ok(end >= 0, `${id}: Seitenkopf fehlt`);
  return section.slice(0, end + 9);
}
function count(source, pattern) { return (source.match(pattern) || []).length; }

assert.equal(count(html, /data-page-save-status/g), 0, "keine statischen Speicherstatus im Produkt-DOM");
assert.equal(count(html, /data-page-save=""/g), 11, "genau elf zulässige Kopf-Speicheraktionen");

for (const [id, variant, title] of matrix) {
  const section = sectionFor(id);
  const header = headerFor(id);
  assert.equal(count(section, /data-page-shell=/g), 1, `${id}: genau eine Schale`);
  assert.match(section, new RegExp(`data-page-shell="${variant}"`), `${id}: Schalenvariante`);
  assert.equal(count(section, /data-page-header=/g), 1, `${id}: genau ein Seitenkopf`);
  assert.equal(count(section, /<h1\b/g), 1, `${id}: genau ein H1`);
  assert.match(header, new RegExp(`<h1[^>]*page-header__title[^>]*>${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h1>`), `${id}: Titel`);
  assert.doesNotMatch(header, /data-page-save-status|page-header__save-status|>\s*Gespeichert\s*</i, `${id}: kein statischer Speicherstatus`);
  assert.equal(count(header, /data-page-save=""/g), savePages.has(id) ? 1 : 0, `${id}: korrekte Kopf-Speicheraktion`);
  if (removedMetaPages.has(id)) assert.doesNotMatch(header, /page-header__period/, `${id}: lokaler Metablock entfernt`);
}

for (const [id, forbidden] of [
  ["objekt", /<span class="page-header__period-label">Objektbezug<\/span>/],
  ["archiv", /<strong class="page-header__period-value">Historische Abrechnungen<\/strong>/],
  ["mieterverwaltung", /data-page-period/],
  ["wohnungsverwaltung", /data-page-period/],
  ["sicherung", /data-page-period/],
  ["wasser", /<span class="page-header__period-label">Bereichsstatus<\/span>/]
]) assert.doesNotMatch(headerFor(id), forbidden, `${id}: entfernter Metablockinhalt`);

assert.match(sectionFor("start"), /<details[^>]*hidden=""[^>]*id="billingPeriodSection"/);
assert.match(sectionFor("briefe"), /id="lettersEditorSection"/);
assert.doesNotMatch(sectionFor("verbraeuche"), /data-page-shell|data-page-header|<h1\b/, "Kompatibilitätsziel bleibt unsichtbar");

console.log(`AP22F1B page header cleanup: PASS (${matrix.length} visible views, ${savePages.size} save headers)`);
