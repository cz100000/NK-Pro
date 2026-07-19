'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname,'..','js','ui-individual-values.js'),'utf8');
assert.ok(source.includes('function parseLocalizedNumber(value)'));
assert.ok(source.includes('pendingWater.set(water.dataset.individualWaterEnd, parsed === "" ? "" : parsed)'));
assert.ok(source.includes('function updateWaterLiveSummaries()'));
assert.ok(source.includes('data-individual-water-subtotal-value'));
function parseLocalizedNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') return '';
  if (typeof value === 'number') return Number.isFinite(value) ? value : '';
  let source = String(value).trim().replace(/\s+/g, '');
  const comma = source.lastIndexOf(',');
  const dot = source.lastIndexOf('.');
  if (comma >= 0 && dot >= 0) {
    if (comma > dot) source = source.replace(/\./g, '').replace(',', '.');
    else source = source.replace(/,/g, '');
  } else if (comma >= 0) {
    const parts = source.split(',');
    source = parts.length > 2 ? parts.slice(0,-1).join('') + '.' + parts.at(-1) : source.replace(',', '.');
  } else if (dot >= 0) {
    const parts = source.split('.');
    if (parts.length > 2) source = parts.slice(0,-1).join('') + '.' + parts.at(-1);
  }
  const parsed = Number(source);
  return Number.isFinite(parsed) ? parsed : '';
}
assert.strictEqual(parseLocalizedNumber('297,74'),297.74);
assert.strictEqual(parseLocalizedNumber('297.74'),297.74);
assert.strictEqual(parseLocalizedNumber('1.297,74'),1297.74);
assert.strictEqual(parseLocalizedNumber('1,297.74'),1297.74);
assert.strictEqual(Number((parseLocalizedNumber('312,42')-280).toFixed(2)),32.42);
assert.strictEqual(Number(((parseLocalizedNumber('564')-490)+(parseLocalizedNumber('312,42')-280)).toFixed(2)),106.42);
assert.strictEqual(Number(((parseLocalizedNumber('297,74')-266)+(parseLocalizedNumber('119,28')-108)).toFixed(2)),43.02);
console.log('AP22F10F K4 decimal/live sums regression passed');
