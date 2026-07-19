const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const html = read('index.html');
const css = read('assets/app.css');
const nav = read('js/navigation.js');
const workflow = read('js/billing-workflow.js');
const calculation = read('js/billing-calculation.js');
const ui = read('js/ui-documents.js');
const controller = read('js/ui-page-controller.js');
const pkg = JSON.parse(read('package.json'));
const project = JSON.parse(read('nk-pro-project.json'));

assert.strictEqual(pkg.version, '99.4.63');
assert.strictEqual(project.appVersion, '99.4.63');
assert.strictEqual(project.schemaVersion, 5);
assert.strictEqual(project.prepaymentPriceForecastVersion, 1);
assert.strictEqual(project.analysisNavigationVersion, 1);

assert.match(nav, /"tab": "vorauszahlungsanpassung"[\s\S]*"label": "Vorauszahlungen anpassen"/);
assert.match(nav, /"key": "analysis"[\s\S]*"label": "Analyse"[\s\S]*"tab": "auswertungen"[\s\S]*"label": "Auswertungen"/);
assert.ok(nav.indexOf('"key": "analysis"') < nav.indexOf('"key": "archive"'), 'Analyse steht vor Archiv');
assert.ok(nav.indexOf('"tab": "umlage"') < nav.indexOf('"tab": "vorauszahlungsanpassung"'), 'Vorauszahlungsanpassung nach Abrechnungsergebnis');
assert.ok(nav.indexOf('"tab": "vorauszahlungsanpassung"') < nav.indexOf('"tab": "qualitaet"'), 'Vorauszahlungsanpassung vor Prüfung & Freigabe');

['vorauszahlungAdjustKpis','vorauszahlungAdjustSettings','vorauszahlungAdjustCostTable','vorauszahlungAdjustSummaryTable','vorauszahlungAdjustCalculationNote']
  .forEach(id => assert.match(html, new RegExp(`id="${id}"`), `missing ${id}`));
['Basisanpassung','Preisprognose','Ausgabe im Brief','Anpassung nach Kostenart','Vorauszahlungen je Mietverhältnis']
  .forEach(text => assert.ok(html.includes(text) || ui.includes(text), `missing ${text}`));

assert.match(workflow, /priceForecastEnabled:"Nein"/);
assert.match(workflow, /generalPriceChangePercent:0/);
assert.match(workflow, /priceForecastByCost:\{\}/);
assert.match(workflow, /function setPrepaymentCostForecastSetting/);
assert.match(calculation, /priceAdjustedAnnual/);
assert.match(calculation, /forecastForCost/);
assert.match(calculation, /generalPriceChangePercent/);
assert.match(ui, /Berechnungsreihenfolge/);
assert.match(ui, /Preisprognose aktivieren/);
assert.match(ui, /Begründung \/ Quelle/);
assert.match(ui, /Aktuelle Vorauszahlungen jährlich/);
assert.match(ui, /Basis nach Abrechnung mtl\./);

assert.match(html, /id="auswertungen"/);
assert.match(html, /id="analyticsOverviewKpis"/);
assert.match(html, /id="analyticsTenantTable"/);
assert.match(html, /id="vorauszahlungAdjustCostTable" data-nk-ui-sortable="false"/);
assert.match(html, /id="vorauszahlungAdjustSummaryTable" data-nk-ui-sortable="false"/);
assert.match(html, /id="analyticsTenantTable" data-nk-ui-sortable="false"/);
assert.match(controller, /auswertungen:\{title:"Auswertungen",kicker:"Analyse"/);
assert.match(ui, /function renderAnalyticsOverview/);

assert.match(css, /#vorauszahlungsanpassung #vorauszahlungAdjustCostTable,[\s\S]*#vorauszahlungsanpassung #vorauszahlungAdjustSummaryTable\{width:100%;min-width:100%;table-layout:fixed\}/);
assert.match(css, /body:not\(\.document-print-window\) #vorauszahlungsanpassung table thead th/);
assert.match(css, /#vorauszahlungsanpassung \.money,[\s\S]*text-align:right/);
assert.match(css, /@media\(max-width:900px\)[\s\S]*#vorauszahlungsanpassung #vorauszahlungAdjustCostTable\{min-width:1120px/);

console.log('AP22F11B Korrektur 2 static checks passed');
