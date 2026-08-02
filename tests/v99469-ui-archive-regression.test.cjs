"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const index = read("index.html");
const css = read("assets/app.css");
const core = read("js/cost-reconciliation.js");
const ui = read("js/ui-cost-reconciliation.js");
const overview = read("js/ui-navigation-pages.js");
const archiveSource = read("js/archive-actions.js");
const workflowSource = read("js/billing-workflow.js");
const runtime = read("js/app-runtime-config.js");
const sw = read("service-worker.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const project = JSON.parse(read("nk-pro-project.json"));
const pkg = JSON.parse(read("package.json"));

assert.equal(pkg.version, "99.4.69");
assert.equal(manifest.version, "99.4.69");
assert.equal(manifest.buildId, "99.4.69-ui-archive-consistency");
assert.equal(project.appVersion, "99.4.69");
assert.equal(project.runtimeBuildId, "99.4.69-ui-archive-consistency");
assert.match(runtime, /const APP_VERSION = "V99\.4\.69"/);
assert.match(sw, /99\.4\.69-ui-archive-consistency/);
assert.match(index, /data-release="NK-Pro V99\.4\.69"/);

assert.match(archiveSource, /tooltip:correction \? "Archiv aktualisieren\." : "Abrechnung ins Archiv verschieben\."/);
assert.match(archiveSource, /reopenedFromArchivePeriodId/);
assert.match(archiveSource, /archiveCorrectionTargetSnapshotId/);
assert.match(archiveSource, /function archiveCorrectionTarget\(data = current\(\)\)/);
assert.match(archiveSource, /const snapshot = d\.createSnapshot\(nextDescriptor\.correction \? \{/);
assert.match(archiveSource, /periodId:correctionPeriodId/);
assert.doesNotMatch(archiveSource, /snapshot\.periodId\s*=/, "Vollständige Snapshots dürfen nach der Prüfsummenbildung nicht mutiert werden");
assert.match(workflowSource, /function createSnapshot\(options = \{\}\)/);
assert.match(workflowSource, /const requestedPeriodId = String\(requested\.periodId \|\| defaultPeriodId\)/);
assert.match(workflowSource, /envelopeFields:Object\.assign/);
assert.match(overview, /archiveActionDescriptor/);
assert.match(overview, /archiveAction\.tooltip/);
assert.match(overview, /data-record-kind=/);
assert.match(overview, /archive-correction/);

const context = vm.createContext({ console, Date, JSON, Math, Number, String, Array, Object, Set, Map, globalThis:null });
context.globalThis = context;
vm.runInContext(archiveSource, context, { filename:"archive-actions.js" });
const archive = context.NKProArchiveActions;
assert.ok(archive, "Archivaktionsmodul fehlt");
const currentDescriptor = archive.archiveActionDescriptor({ meta:{ archiveViewer:false } });
assert.equal(currentDescriptor.tooltip, "Abrechnung ins Archiv verschieben.");
assert.equal(currentDescriptor.mode, "current-billing");
const correctionDescriptor = archive.archiveActionDescriptor({ meta:{ archiveViewer:false, reopenedFromArchiveAt:"2026-08-02T10:00:00Z", reopenedFromArchivePeriodId:"2023|2023-01-01|2023-12-31|Übernommen" } });
assert.equal(correctionDescriptor.tooltip, "Archiv aktualisieren.");
assert.equal(correctionDescriptor.mode, "archive-correction");
assert.equal(archive.isArchiveCorrection({ meta:{ archiveViewer:true, reopenedFromArchiveAt:"x" } }), false, "Reine Archivansicht darf keine Archivkorrektur sein");

assert.doesNotMatch(index, /<option\s+value="private"/i, "Privatanteil darf keine separate finanzielle Zuordnungskategorie sein");
assert.doesNotMatch(core, /value:"private"/);
assert.match(core, /privateShare ist nur noch eine Informations-Teilmenge von tenantShare/);
assert.match(core, /const assigned=tenantShare\+vacancyShare\+nonAllocated/);
assert.doesNotMatch(core, /assigned\s*=\s*tenantShare\+privateShare/);
assert.match(ui, /Reguläre Teilnehmeranteile/);
assert.match(ui, /im Teilnehmeranteil enthalten/);
assert.match(ui, /kein Leerstand, keine offene Differenz und keine automatische Vermieterkostenkategorie/);
assert.doesNotMatch(ui, /<th>Privatanteil<\/th>/);

for (const expected of [
  "Kontrollrechnung", "Fachlicher Status", "Offene Prüfentscheidungen", "Detailansicht nach Kostenarten",
  "Tatsächliche Zahlungsflüsse", "Prüfentscheidungen und Zuordnungen", "Finanzamtübersicht – Excel"
]) assert.ok(ui.includes(expected), `UI-Bestandteil fehlt: ${expected}`);
assert.match(ui, /kuaCardHeading\('8\.1'/);
assert.match(ui, /kuaCardHeading\('8\.2'/);
assert.match(css, /\.kua-overview-layout\{display:grid;grid-template-columns:minmax\(0,1fr\) 310px/);
assert.match(css, /@media\(max-width:1180px\).*\.kua-overview-layout\{grid-template-columns:minmax\(0,1fr\)\}/s);
assert.match(css, /\.nk-ui-table-wrap\{[^}]*overflow-x:auto/s);
assert.match(css, /section#kostenumlagenabgleich \.nk-ui-table thead th/);

const calculation = read("js/billing-calculation.js");
assert.match(calculation, /function isSettlementParticipant\(m\)/);
assert.match(calculation, /function isPrivateUse\(m\)/);
assert.doesNotMatch(archiveSource, /M000|Erik Zimmermann|W000\.UG/);
assert.doesNotMatch(ui, /M000|Erik Zimmermann|W000\.UG/);

console.log("V99.4.69 UI-, Archiv- und Teilnehmerregressionstests bestanden");
