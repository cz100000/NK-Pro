const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const html = read('index.html');
const css = read('assets/app.css');
const review = read('js/billing-review.js');
const ui = read('js/ui-billing-allocation.js');
const meter = read('js/meter-readings.js');
const sw = read('service-worker.js');
const pkg = JSON.parse(read('package.json'));
const project = JSON.parse(read('nk-pro-project.json'));

assert.strictEqual(pkg.version, '99.4.63', 'package version');
assert.strictEqual(project.appVersion, '99.4.63', 'project app version');
assert.match(html, /V99\.4\.63/);
assert.match(html, /id="umlage"[^>]*data-release="NK-Pro V99\.4\.63"/);
assert.match(html, /src="\.\/js\/billing-review\.js"/);
assert.match(sw, /billing-review\.js/);

[
  'billingResultKpis','umlageSummaryTable','billingReviewTable','billingLandlordVerifiedSummary',
  'billingControlEquation','billingResultOverallStatus','billingReviewAcceptDialog'
].forEach(id => assert.match(html, new RegExp(`id="${id}"`), `missing ${id}`));

['Gesamtkosten','Auf Mieter umgelegt','Vom Vermieter zu tragen','Noch zu klären',
 'Korrigieren','Akzeptieren','Behandlung / Vermieteranteil','Begründung','Prüfentscheidung speichern'
].forEach(text => assert.ok(html.includes(text) || ui.includes(text), `missing label ${text}`));

['Offen','In Korrektur','Akzeptiert','Vermieter trägt','Erledigt durch Korrektur','Akzeptanz ungültig – erneut prüfen']
  .forEach(label => assert.ok(review.includes(label), `missing status ${label}`));

[
  'Vermieter trägt – Privatanteil','Vermieter trägt – Leerstand','Vermieter trägt – nicht umlagefähig',
  'Vermieter trägt – sonstiger Anteil','Akzeptierte Rundungsdifferenz','Sonstige fachlich akzeptierte Differenz'
].forEach(label => assert.ok(review.includes(label), `missing treatment ${label}`));

assert.match(review, /dataSignature/);
assert.match(review, /calculationSignature/);
assert.match(review, /appVersion/);
assert.match(review, /acceptedAt/);
assert.match(review, /originalDifference/);
assert.match(review, /invalidatedAcceptanceAt/);
assert.match(review, /requireCommitSuccess:true/);
assert.match(ui, /targetSelector/);
assert.match(ui, /billing-review-target-flash/);

// Die neue Prüfmechanik darf weder an historischen IDs noch an Kostenartnamen hängen.
for (const forbidden of ['K002','K006','Wasserversorgung','Heiz- und Warmwasserkosten']) {
  assert.ok(!review.includes(forbidden), `billing-review contains forbidden special case ${forbidden}`);
}

assert.match(css, /#umlage[\s\S]*thead th\{background:#f2f5f8/);
assert.match(css, /#umlage \.billing-result-table-wrap\{[^}]*overflow-x:hidden/);
assert.match(css, /@media[^}]*max-width:[^}]*[\s\S]*#umlage \.billing-result-table-wrap\{overflow-x:auto/);
assert.match(ui, /Behandlung \/ Vermieteranteil/);
assert.match(ui, /colspan=\"8\"/);

const eq = meter.match(/function readingEquivalent\(a, b\) \{([\s\S]*?)\n  \}/);
assert.ok(eq, 'readingEquivalent missing');
assert.ok(!eq[1].includes('ableseart'), 'semantically identical readings must not duplicate merely because reading type changed');
assert.ok(eq[1].includes('zaehlerId') && eq[1].includes('ablesedatum') && eq[1].includes('wert'), 'reading identity remains strict on physical value fields');

assert.match(read('js/state-access.js'), /Rollback/);
assert.match(read('js/state-access.js'), /render/);
assert.match(read('js/ui-billing-allocation.js'), /data-review-history="true"/);
assert.match(read('js/ui-billing-allocation.js'), /Nur ansehen/);

console.log('AP22F11B static checks passed');
