"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname,"..");
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const html = read("index.html");
const ui = read("js/ui-individual-values.js");
const calc = read("js/billing-calculation.js");
const css = read("assets/app.css");
const project = JSON.parse(read("nk-pro-project.json"));

const page = html.slice(html.indexOf('<section class="tab" id="manuellewerte"'),html.indexOf('<section class="tab" id="umlage"'));
assert.match(page,/nk-ui-page-shell--default/);
assert.match(page,/data-page-shell="default"/);
assert.doesNotMatch(page,/nk-ui-page-shell--wide/);
assert.match(page,/data-individual-start-override-panel/);
assert.match(page,/Übernommenen Anfangsstand als Sonderfall zur Bearbeitung freigeben/);

assert.match(calc,/return "Kaltwasserzähler"/);
assert.match(calc,/return "Warmwasserzähler"/);
assert.match(ui,/individual-values-meter-dot/);
assert.match(ui,/is-cold-water/);
assert.match(ui,/is-hot-water/);
assert.match(ui,/priorTransferForMeter/);
assert.match(ui,/individualValuesStartOverrides/);
assert.match(ui,/data-individual-transferred-start/);
assert.match(ui,/authorizeStartOverride/);
assert.match(ui,/Benutzerbestätigter Sonderfall/);
assert.match(ui,/const disabled = isReadOnly\(\) \|\| locked/);

assert.match(css,/#manuellewerte \.individual-values-page\{[^}]*max-width:var\(--nk-ui-shell-max-default,1180px\)/);
assert.match(css,/#manuellewerte \.individual-values-table-wrap\{[^}]*width:calc\(100% - 32px\)[^}]*margin:14px 16px/);
assert.match(css,/individual-values-meter-dot\.is-cold-water\{[^}]*#1976c8/);
assert.match(css,/individual-values-meter-dot\.is-hot-water\{[^}]*#d5282f/);
assert.match(css,/individual-values-input-wrap\.is-transferred[^}]*background:#eef1f4/);
assert.match(css,/individual-values-start-override/);

assert.equal(project.displayVersion,"V99.4.59");
assert.equal(project.individualValuesPageCorrectionVersion,1);
assert.equal(project.individualValuesTransferredStartProtectionVersion,1);
assert.match(read("service-worker.js"),/99\.4\.59-ap22f10g-b-k1/);
console.log("AP22F10G-B Korrektur 1 static checks: PASS");
