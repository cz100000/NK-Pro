"use strict";

const { canonicalSha256, loadFixtureData, manifest } = require("../tests/fixture-loader.cjs");

let failed = 0;
for (const [name, entry] of Object.entries(manifest.fixtures)) {
  try {
    const data = loadFixtureData(name);
    const actual = canonicalSha256(data);
    if (actual !== entry.canonicalSha256) throw new Error(`Prüfsumme ${actual} statt ${entry.canonicalSha256}`);
    process.stdout.write(`OK: ${name} (${entry.operationCount} Patch-Operationen)\n`);
  } catch (error) {
    failed += 1;
    process.stderr.write(`FEHLER: ${name}: ${error.message}\n`);
  }
}
if (failed) process.exit(1);
process.stdout.write(`Referenzdatenprüfung abgeschlossen: ${Object.keys(manifest.fixtures).length} logische Fälle semantisch unverändert.\n`);
