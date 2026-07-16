"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const html = read("index.html");
const individual = read("js/ui-individual-values.js");
const archivePages = read("js/ui-navigation-pages.js");

function sectionFor(id) {
  const match = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`).exec(html);
  assert.ok(match, `Ansicht fehlt: ${id}`);
  const nextPattern = /<section\b[^>]*\bclass="[^"]*\btab\b[^"]*"[^>]*>/g;
  nextPattern.lastIndex = match.index + match[0].length;
  const next = nextPattern.exec(html);
  return html.slice(match.index, next ? next.index : html.length);
}
function functionSlice(source, name, nextName) {
  const start = source.indexOf(`function ${name}`);
  assert.ok(start >= 0, `${name} fehlt`);
  const end = nextName ? source.indexOf(`function ${nextName}`, start) : source.length;
  assert.ok(end > start, `${name} nicht abgrenzbar`);
  return source.slice(start, end);
}

const manualBody = functionSlice(individual, "manualBody", "noInputBody");
assert.doesNotMatch(manualBody, /data-ui-action="application\.save"|>Speichern<\/button>/, "Karten-Speichern wurde entfernt");
assert.match(manualBody, /data-individual-reset=/, "Werte zurücksetzen bleibt vorhanden");
assert.match(manualBody, /individual-import-controls/, "Import bleibt vorhanden");
assert.match(manualBody, /valuesTable\(cost,!readonly\)/, "Eingabetabelle bleibt vorhanden");
assert.equal((sectionFor("manuellewerte").match(/data-ui-action="application\.save"/g) || []).length, 1, "manuellewerte besitzt statisch genau einen Kopf-Speicherweg");

for (const id of ["archiv", "sicherung", "export"]) {
  const section = sectionFor(id);
  const header = section.slice(0, section.indexOf("</header>") + 9);
  assert.doesNotMatch(header, /data-ui-action="application\.save"/, `${id}: kein allgemeines Kopf-Speichern`);
}

assert.match(functionSlice(archivePages, "renderArchive", "renderStartTenantManagement"), /archive\.downloadFull/, "Archivaktion bleibt vorhanden");
for (const action of ["export.downloadFullJson", "export.downloadFullPackage", "archive.downloadFull", "application.reset", "system.runSelfTest", "system.showReleaseAudit", "system.downloadReleaseAudit"]) {
  assert.match(sectionFor("sicherung"), new RegExp(action.replace(".", "\\.")), `Sicherungsaktion bleibt: ${action}`);
}
for (const action of ["export.downloadCurrentJson", "export.downloadCostsCsv", "export.downloadTenantsCsv", "export.downloadAllocationCsv", "export.downloadBillingPackage", "export.downloadFinalReport", "system.print"]) {
  assert.match(sectionFor("export"), new RegExp(action.replace(".", "\\.")), `Exportaktion bleibt: ${action}`);
}

assert.equal(sha(read("js/ui-master-data.js")), "73a29dfa8cd0fdaeda8c39a9e39a2643e28d6f9ff1bff6f3a4e65cc365677207", "saveData() und Speicherfeedback bleiben unverändert");
assert.match(read("js/app.js"), /application:\{ save:saveData, reset:resetData \}/, "registrierte Speicheraktion bleibt vorhanden");

console.log("AP22F1B action redundancy: PASS");
