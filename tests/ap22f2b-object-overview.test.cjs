"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} fehlt`);
  let index = source.indexOf("{", start);
  let depth = 0;
  for (; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${name} ist syntaktisch unvollständig`);
}

const html = read("index.html");
const css = read("assets/app.css");
const controller = read("js/ui-page-controller.js");
const reference = read("ui-reference/index.html");
const model = extractFunction(controller, "objectOverviewModel");
const renderer = extractFunction(controller, "renderObjectDashboard");

assert.equal((html.match(/data-area-dashboard="object"/g) || []).length, 1, "Objektübersicht benötigt genau einen dynamischen Container");
const section = html.match(/<section class="tab" id="objektuebersicht">[\s\S]*?<\/section>/)?.[0] || "";
assert.ok(section.includes("nk-ui-page-shell") && section.includes("nk-ui-page-header"), "Zentrale Seitenschale oder Seitenkopf fehlt");
assert.equal((section.match(/<h1\b/g) || []).length, 1, "Objektübersicht benötigt genau ein h1");

assert.ok(renderer.includes("object-overview-summary") && renderer.includes("object-overview-task-grid"), "Neue Zielkomponenten fehlen");
assert.equal((renderer.match(/task\("(?:object|units|tenancies|meter)"/g) || []).length, 4, "Es müssen genau vier Aufgaben-/Statuskarten gerendert werden");
for (const target of ["objekt", "wohnungsverwaltung", "mieterverwaltung", "wasser"]) {
  assert.ok(renderer.includes(`\"${target}\"`), `Ziel ${target} fehlt`);
}
for (const text of ["Objektdaten", "Wohnungen", "Mietverhältnisse", "Zähler", "DUMMY", "Clickdummy ohne Fachlogik"]) {
  assert.ok(renderer.includes(text), `Text ${text} fehlt`);
}
assert.ok(model.includes('target:"objekt"') && model.includes('target:"wohnungsverwaltung"') && model.includes('target:"mieterverwaltung"') && model.includes('target:"start"'), "Priorisierte nächste Aktionen sind unvollständig");
assert.ok(model.includes("completedCount=[objectComplete,unitsComplete,tenantsComplete]"), "Gesamtstatus zählt nicht exakt drei produktive Bereiche");
assert.ok(!model.includes("meter") && !model.includes("cost"), "Zähler oder Kosten dürfen nicht in die Vollständigkeit eingehen");
assert.ok(!renderer.includes("Kostenarten und Schlüssel"), "Bereichsfremde Kostenartenkarte ist noch vorhanden");
assert.ok(!renderer.includes("Einheiten vollständig") && !renderer.includes("Mieter vollständig"), "Alte doppelte Kennzahlen sind noch vorhanden");
assert.ok(!renderer.includes("stats.rules") && !renderer.includes("qualityIssues"), "Allgemeine Abrechnungsprüfungen steuern weiterhin die Objektübersicht");

for (const pureSource of [model, renderer]) {
  for (const forbidden of ["localStorage", "saveData", "persist", "migration", "archiveActions", "state.", "state["]) {
    assert.ok(!pureSource.includes(forbidden), `Renderer enthält unzulässigen Zugriff: ${forbidden}`);
  }
}

const cssBlock = css.slice(css.indexOf("/* V99.4.37 – AP22F2B"));
assert.ok(cssBlock.includes('[data-area-dashboard="object"]') && cssBlock.includes("object-overview-task-grid"), "AP22F2B-CSS fehlt");
assert.ok(!/#[0-9a-f]{3,8}\b/i.test(cssBlock), "AP22F2B-CSS enthält lokale Farbwerte statt zentraler Tokens");
for (const token of ["--nk-ui-color-border", "--nk-ui-color-text", "--nk-ui-space-lg", "--nk-ui-radius-md"]) {
  assert.ok(cssBlock.includes(token), `Zentraler Token ${token} fehlt`);
}

assert.ok(reference.includes('id="object-overview"'), "Referenzbibliothek enthält die Objektübersicht nicht");
assert.ok(reference.includes("3 produktive Bereiche · 1 DUMMY"), "Referenz zeigt die Bereichsabgrenzung nicht");
assert.ok(!reference.match(/id="object-overview"[\s\S]*?Kostenarten und Schlüssel/), "Referenz enthält die entfernte Kostenartenkarte");


// Übernommene AP22F1C-Korrektur muss im aktuellen Release fortbestehen.
assert.ok(css.includes("body:not(.document-print-window) dialog.nk-ui-dialog:not([open]) { display:none; }"), "AP22F1C-Regel für geschlossene Dialoge fehlt");
assert.ok(html.includes('<strong data-app-version="">V99.4.37</strong>'), "zentrales Versionslabel ist nicht auf dem aktuellen Release");
assert.ok(read("js/app-runtime-config.js").includes('const APP_VERSION = "V99.4.37";'), "zentrale Laufzeitversion ist inkonsistent");
assert.ok(read("js/ui-page-controller.js").includes('document.querySelectorAll("[data-app-version]").forEach(label=>{ label.textContent=APP_VERSION; });'), "zentrale Versionsbindung fehlt");

console.log("AP22F2B object overview static test: PASS");
