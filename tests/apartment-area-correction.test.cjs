const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const expected = Object.freeze({
  'W000.UG':65,
  'W001.EG-L':62.5,
  'W002.EG-R':52.5,
  'W003.1OG-L':62.5,
  'W004.1OG-R':52.5,
  'W005.DG-L':52,
  'W006.DG-R':44.5
});

function readSeed() {
  const source = fs.readFileSync(path.join(root, 'js/default-seed.js'), 'utf8');
  const match = source.match(/const SEED = (\{.*\});\s*$/s);
  assert(match, 'SEED JSON fehlt');
  return JSON.parse(match[1]);
}

const context = { globalThis:{} };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/apartment-area-correction.js'), 'utf8'), context);
const correction = context.NKProApartmentAreaCorrection;
assert(correction && typeof correction.apply === 'function');
assert.deepStrictEqual(JSON.parse(JSON.stringify(correction.AREAS)), expected);

const seed = readSeed();
assert.strictEqual(seed.wohnungen.reduce((sum, row) => sum + Number(row.wohnflaeche || 0), 0), 391.5);
seed.wohnungen.forEach(row => assert.strictEqual(row.wohnflaeche, expected[row.id]));
seed.mieter.filter(row => expected[row.wohnung] !== undefined).forEach(row => assert.strictEqual(row.wohnflaeche, expected[row.wohnung]));

const historicBefore = JSON.stringify(seed.jahresArchiv);
const legacy = JSON.parse(JSON.stringify(seed));
legacy.wohnungen.forEach(row => { row.wohnflaeche = 55; });
legacy.mieter.forEach(row => { if (expected[row.wohnung] !== undefined) row.wohnflaeche = 55; });
legacy.stammdaten = {
  wohnungen:legacy.wohnungen.map(row => ({...row})),
  mieter:legacy.mieter.filter(row => row.wohnung).map(row => ({...row}))
};
legacy.meta = {...legacy.meta};
delete legacy.meta.apartmentAreaCorrection20260721;
const report = correction.apply(legacy, { appVersion:'V99.4.66', now:() => '2026-07-21T17:30:00.000Z' });
assert.strictEqual(report.changed, true);
assert.strictEqual(legacy.wohnungen.reduce((sum, row) => sum + Number(row.wohnflaeche || 0), 0), 391.5);
assert.strictEqual(JSON.stringify(legacy.jahresArchiv), historicBefore, 'Jahresarchive dürfen nicht verändert werden');
assert.strictEqual(legacy.meta.apartmentAreaCorrection20260721.archiveSnapshotsChanged, false);

legacy.wohnungen[0].wohnflaeche = 66;
const second = correction.apply(legacy, { appVersion:'V99.4.66' });
assert.strictEqual(second.alreadyApplied, true);
assert.strictEqual(legacy.wohnungen[0].wohnflaeche, 66, 'Spätere manuelle Änderungen dürfen nicht erneut überschrieben werden');

const correctedFile = path.join(root, 'nk-pro-gesamtbestand-2025-V99.4.66-2026-07-21-Wohnflaechen-korrigiert.json');
assert(fs.existsSync(correctedFile), 'Korrigierter Gesamtbestand fehlt');
const corrected = JSON.parse(fs.readFileSync(correctedFile, 'utf8'));
corrected.wohnungen.forEach(row => assert.strictEqual(row.wohnflaeche, expected[row.id]));
corrected.stammdaten.wohnungen.forEach(row => assert.strictEqual(row.wohnflaeche, expected[row.id]));
corrected.mieter.filter(row => expected[row.wohnung] !== undefined).forEach(row => assert.strictEqual(row.wohnflaeche, expected[row.wohnung]));
assert.strictEqual(corrected.meta.apartmentAreaCorrection20260721.totalArea, 391.5);
assert.strictEqual(corrected.jahresArchiv[0].data.wohnungen[0].wohnflaeche, 55, 'Historischer Snapshot wurde unerwartet verändert');

const persistence = fs.readFileSync(path.join(root, 'js/app-state-persistence.js'), 'utf8');
assert(persistence.includes('NK_PRO_MODULES.apartmentAreaCorrection.apply(data, { appVersion:APP_VERSION })'));
assert(persistence.includes('persistStartupApartmentAreaCorrection(loaded)'));

console.log('Wohnflächenkorrektur V99.4.66 geprüft');
