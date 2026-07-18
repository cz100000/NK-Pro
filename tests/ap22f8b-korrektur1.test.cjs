"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html");
const css=read("assets/app.css");
const costs=read("js/ui-costs.js");
const quality=read("js/quality-rules.js");
const qualityUi=read("js/ui-quality.js");
const calc=read("js/billing-calculation.js");
const renderer=read("js/document-renderer.js");
const exportService=read("js/export-service.js");
const master=read("js/ui-master-data.js");
const archive=read("js/archive-actions.js");
const runtime=read("js/app-runtime-config.js");

for(const id of ["prepaymentTileCasesValue","prepaymentTileNkValue","prepaymentTileRentValue","prepaymentTileCorrectionValue"]){
  assert.match(html,new RegExp(`id="${id}"`),`Kachel ${id} fehlt`);
}
assert.equal((html.match(/class="prepayment-summary-card /g)||[]).length,4,"Es müssen genau vier Kacheln vorhanden sein");
assert.match(html,/Kaltmieteinnahmen nach Korrektur/);
assert.match(html,/id="incomeValidationSection"[^>]*data-section-role="validation"|data-section-role="validation"[^>]*id="incomeValidationSection"/);

assert.match(css,/#einnahmen \.prepayment-summary-grid\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
assert.match(css,/#einnahmen \.prepayment-matrix col\.prepayment-case-col\{width:150px\}/);
assert.match(css,/#einnahmen \.prepayment-matrix \.prepayment-case-head,#einnahmen \.prepayment-matrix \.prepayment-case-cell\{width:150px;min-width:150px;max-width:150px\}/);

assert.match(costs,/function prepaymentRentCorrection\(tenant\)/);
assert.match(costs,/function prepaymentNkAfterCorrection\(tenant\)/);
assert.match(costs,/function prepaymentRentAfterCorrection\(tenant\)/);
assert.match(costs,/prepaymentRentAfterCorrection\(tenant\) \{ return num\(tenant && tenant\.kaltErhalten\) - prepaymentRentCorrection\(tenant\); \}/);
assert.match(costs,/NK-Korrektur \/ Gutschrift/);
assert.match(costs,/Kaltmiet-Korrektur \/ Gutschrift/);
assert.match(costs,/id="prepaymentNkCorrectionTotal"/);
assert.match(costs,/id="prepaymentRentCorrectionTotal"/);
assert.match(costs,/prepaymentRefreshFinancialDisplays\(\);/);
assert.match(costs,/renderPrepaymentQualitySummary\(\);/);
assert.match(costs,/prepaymentSetTenantValue/);

assert.match(quality,/NKP-FACH-020/);
assert.match(quality,/mieter\.vorjahresKorrektur und mieter\.kaltmietKorrektur/);
assert.match(qualityUi,/tab\.id==="einnahmen"&&typeof renderPrepaymentQualitySummary/);
assert.match(calc,/rentCorrection/);
assert.match(renderer,/Korrektur\/Gutschrift NK-Vorauszahlung/);
assert.match(renderer,/Kaltmietkorrektur \/ Gutschrift/);
assert.match(renderer,/verändert das Ergebnis der Nebenkostenabrechnung nicht/);
assert.match(exportService,/Kaltmietkorrektur/);
assert.match(master,/kaltmietKorrektur/);
assert.match(archive,/kaltmietKorrektur/);
assert.match(runtime,/AP22F8B-Vorauszahlungen-Korrektur1/);
console.log("AP22F8B Korrektur 1 static: PASS");
