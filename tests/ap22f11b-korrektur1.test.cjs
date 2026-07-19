const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const html = read('index.html');
const css = read('assets/app.css');
const ui = read('js/ui-billing-allocation.js');
const bindings = read('js/ui-bindings.js');
const pkg = JSON.parse(read('package.json'));
const project = JSON.parse(read('nk-pro-project.json'));

assert.strictEqual(pkg.version, '99.4.62');
assert.strictEqual(project.appVersion, '99.4.62');
assert.strictEqual(project.billingResultPageCorrectionVersion, 1);

assert.match(html, /2\. Kostenkontrolle und Prüfungen/);
assert.match(html, /id="billingLandlordVerifiedSummary"/);
assert.ok(!html.includes('id="billingResultLandlordTable"'), 'separate landlord table removed');
assert.match(html, /3\. Kostenkontrolle – Abgleich Gesamt/);
assert.match(html, /id="billingControlEquation"/);

assert.match(html, /id="billingReviewDetailDialog"/);
assert.match(html, /id="billingReviewDetailBody"/);
assert.ok(!html.includes('id="billingReviewDetail"'), 'inline detail panel removed');
assert.match(bindings, /billingReview\.closeDetail/);
assert.match(ui, /function billingReviewOpenDetail/);
assert.match(ui, /function billingReviewCloseDetail/);
assert.match(ui, /billingReviewDetailDialog/);
assert.match(ui, /Berechneter Wert/);
assert.match(ui, /Kontrollwert/);
assert.match(ui, /Aktueller Prüfstatus/);
assert.match(ui, /Ungültig seit/);

assert.match(ui, /Geprüft und dem Vermieter zugeordnet/);
assert.match(ui, /Sonstige fachlich akzeptierte Differenzen/);
assert.match(ui, /Ungültig gewordene Entscheidungen/);
assert.match(ui, /Vom Vermieter nach Prüfung tatsächlich zu tragen/);
assert.match(ui, /Vorläufiger Betrag – noch nicht alle Differenzen sind geprüft/);
assert.match(ui, /Endgültiger Vermieteranteil nach vollständiger Prüfung/);

assert.match(ui, /billing-result-number/);
assert.match(css, /#umlage \.billing-result-number\{text-align:right/);
assert.match(css, /billing-review-group--landlord/);
assert.match(css, /billing-landlord-summary__equation/);
assert.match(css, /@media\(max-width:840px\)[\s\S]*#umlage \.billing-result-search\{flex:0 0 auto/);
assert.match(css, /billing-review-detail-dialog/);

console.log('AP22F11B Korrektur 1 static checks passed');
