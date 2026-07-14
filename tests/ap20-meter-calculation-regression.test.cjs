"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "js/ui-metering.js"), "utf8");
const bindings = fs.readFileSync(path.join(root, "js/ui-bindings.js"), "utf8");
const context = vm.createContext({
  console,
  globalThis:null,
  NK_PRO_MODULES:{ billingCalculation:{} }
});
context.globalThis = context;
vm.runInContext(source, context, { filename:"js/ui-metering.js" });

assert.equal(context.parseMeterNumberInput("297,24"), 297.24, "Dezimalkomma wird nicht korrekt gelesen.");
assert.equal(context.parseMeterNumberInput("297.24"), 297.24, "Dezimalpunkt wird nicht korrekt gelesen.");
assert.equal(context.parseMeterNumberInput("1.234,56"), 1234.56, "Deutsches Tausender-/Dezimalformat wird nicht korrekt gelesen.");
assert.equal(context.parseMeterNumberInput("1,234.56"), 1234.56, "Internationales Tausender-/Dezimalformat wird nicht korrekt gelesen.");
assert.equal(context.parseMeterNumberInput(""), "", "Leere Zählerwerte müssen leer bleiben.");
assert.ok(Math.abs(context.meterPreviewConsumption("266", "297,24") - 31.24) < 1e-9, "Live-Verbrauch mit Dezimalkomma ist falsch.");
assert.ok(Math.abs(context.meterPreviewConsumption("117", "128.06") - 11.06) < 1e-9, "Live-Verbrauch mit Dezimalpunkt ist falsch.");
assert.equal(context.meterPreviewConsumption("100", "90"), 0, "Rückläufige Zählerstände dürfen keinen positiven Vorschauverbrauch erzeugen.");

for (const token of [
  'meter.previewWaterValue',
  'meter.previewGenericValue',
  'data-water-meter-field',
  'data-meter-result="kw"',
  'data-meter-footer="total"',
  '"keydown", { key:"Enter", preventDefault:true }'
]) assert.ok(source.includes(token) || bindings.includes(token), `Korrekturmerkmal fehlt: ${token}`);

assert.ok(bindings.includes('"meter.previewWaterValue":context => requireHandler(handlers, "updateWaterMeterPreview")(context.element)'), "Live-Wasserzähler-Binding fehlt.");
assert.ok(bindings.includes('"meter.previewGenericValue":context => requireHandler(handlers, "updateGenericMeterPreview")(context.element)'), "Live-Binding für sonstige Zähler fehlt.");

process.stdout.write("AP20-Korrekturregression Zählerberechnung: Dezimalkomma, Dezimalpunkt, Live-Vorschau und Enter-Commit sind statisch abgesichert.\n");
