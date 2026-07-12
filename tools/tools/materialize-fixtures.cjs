"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { loadFixtureData, manifest, root } = require("../tests/fixture-loader.cjs");

const output = path.resolve(process.argv[2] || path.join(root, "materialisierte-testdaten"));
fs.mkdirSync(output, { recursive: true });
for (const name of Object.keys(manifest.fixtures)) {
  fs.writeFileSync(path.join(output, name), JSON.stringify(loadFixtureData(name), null, 2) + "\n", "utf8");
  process.stdout.write(`Erzeugt: ${path.join(output, name)}\n`);
}
