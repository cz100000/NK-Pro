"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const protectedFiles = {
  "js/navigation.js": "2e9e2c4b0fd8059640c0db073cf47a56364deca484f07dddbc68f7380a49375e",
  "js/billing-context.js": "5027295c32fc214b80b07f3d35b4e06186a911995e35d2cb9787fdc99f23f1e8",
  "js/object-standard.js": "64f68daf6c5a5100482403637c2b24c64001dbbfabc69e77112ad47b41a89046",
  "js/master-data-actions.js": "5bcdc4eaadc3875da740d30ae5551c8edcc2429f24f2c7777d149b5227f87c82",
  "js/ui-master-data.js": "73a29dfa8cd0fdaeda8c39a9e39a2643e28d6f9ff1bff6f3a4e65cc365677207",
  "js/ui-metering.js": "f1604efe8a88b72fd5f68cf9fea8c0e3b36196796a58d0b0879d8458fdeff9cc",
  "js/app-state-persistence.js": "a337f6c2126d4aeb70dcb702523d5c2f9af2561d3d2f275cdc25dd03047868b8",
  "js/persistence.js": "c22eab211ae2d080ce82b3050f83edf173752e610688050330f0f12547cd6c6b",
  "js/migration.js": "24db7607caca48ce1fb244f8bc0d9f3b4835a5e53c47868f02a673c9e9722828",
  "js/backup-recovery.js": "92b2f1df919acf425be770eb554373a23fc54b792249bbb33e88229475760bc7",
  "js/archive-actions.js": "9cba490d96abb5dc4f728967eb6f1c78437b924a4bfaf81c9c84f1d43ebda85e",
  "js/archive.js": "4f148c7df20d5301f4902fd464b584fd39eaa713da9a6a20820a2dfc1ef9c87e",
  "js/billing-calculation.js": "2d1a130455e6dc0e2b541f80edeb9c12cfd8ffe9f9b0460f368f35030e7050c2",
  "js/billing-snapshot.js": "65148329226ab031e9bcab3f03d9403cd017ecb2a841a3c0dc2373fec0e12b47",
  "js/export-service.js": "4954c06643fe10afbaa03f7c89aca36a4e20a3fd0336fccca65e1b615b280b87",
  "js/document-data.js": "b96bc414bdd7604962994cd8598fd2832e4d66523799f3051dfc4877317a9775",
  "js/document-renderer.js": "def7bbc7a6fb53c0937840c89ae920b13f2ec710ef0484fa2b4859fef214edda",
  "js/quality-assurance.js": "8d101554b25ccd7e215c4527f03ebbddee39e87092dd5ba63731de35e97b264b",
  "js/quality-rules.js": "5f03547b5b3c48aaf143b50f1b62e6f87539aaf02cee467c4e634279430012b4",
  "js/ui-quality.js": "35f2f122cf509c1479838ba08108c74905020be86e23e880f5c7c8c6432f1955",
  "js/ui-documents.js": "2fff3638cd1ba89e95cd644931cb5cf114a649c3baad0003653b37f7ad5d0736",
  "js/ui-billing-allocation.js": "e65d79c4f4213b11e1381207f08878be6cb1a5532c812056499076ecba6b1dc1",
  "js/ui-individual-values.js": "f8b7f88a5fb477adffeeeea9afdb354f5011f1bd6c6169cde06781bc960df208"
};
const protectedFragments = {
  "js/ui-page-controller.js::dashboardStats": {
    "sha256": "96a4e22da790bb0b517423942a3f3157b905699bdb0aa76c79c147cf36d74f07",
    "length": 4508
  },
  "js/ui-page-controller.js::renderBillingDashboard": {
    "sha256": "d00c358c9c41f9b1eaaa80e06caafa1cc78c4bad72531fd41e7ad6d011dbc10b",
    "length": 4217
  },
  "js/ui-page-controller.js::updateAllPageHeaders": {
    "sha256": "c662e5bc2b4d581838dd26afb8971a69a0978f7cd041d1f5bb8975ba44e9e70f",
    "length": 1034
  },
  "js/ui-page-controller.js::ensureGlobalPageShellsAndHeaders": {
    "sha256": "e71df38c39b23e61c758993d7eb002a4ad7e546e6dcbe8f3dabcbdc686315d32",
    "length": 1261
  },
  "js/ui-page-controller.js::renderAll": {
    "sha256": "adcc194ed04d58417ea7b8e925fa59527bb6ab4e7f55d1c4d66233a817be494d",
    "length": 1476
  },
  "index.html::section#objekt": {
    "sha256": "ce691dbc8460477ee7abf83ec2fc40da6bc169ee13f78604e2ba0820d864feb0",
    "length": 2999
  },
  "index.html::section#wohnungsverwaltung": {
    "sha256": "ba105946eae439d3ee59c371937b1f22e4c3ec5089e04fe858485ade67044e8b",
    "length": 2393
  },
  "index.html::section#mieterverwaltung": {
    "sha256": "1d141af4b76cf1e9e7e24b571908bf288b60312780688f5dfc4babdca6101779",
    "length": 3464
  },
  "index.html::section#wasser": {
    "sha256": "8e171e0f3493535ce09a9ee53bb8c51fb41d141a17f235e5cea9a82ee45f4b86",
    "length": 4951
  },
  "index.html::section#start": {
    "sha256": "b40b9c94ab51f6fb8a12137d7d1ba1ea48e91a1522d76fabef2be3ab7fb0f4e1",
    "length": 6917
  },
  "index.html::section#archiv": {
    "sha256": "e86e1cce22342de25581bbd1b65096fbd863aa71e66e1b822dff8ed27501d513",
    "length": 2331
  },
  "index.html::global-billing-context": {
    "sha256": "1f437a7c6354ee0642a57c0cfb7e0344189f6a9342188e70da31e9e462351a51",
    "length": 1231
  }
};

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} fehlt`);
  const parameterEnd = source.indexOf(")", start + marker.length);
  assert.notEqual(parameterEnd, -1, `${name} hat keine geschlossene Parameterliste`);
  let index = source.indexOf("{", parameterEnd);
  let depth = 0;
  for (; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${name} ist unvollständig`);
}

function extractSection(source, id) {
  const startMatch = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`, "i").exec(source);
  assert.ok(startMatch, `section#${id} fehlt`);
  const tag = /<\/?section\b[^>]*>/ig;
  tag.lastIndex = startMatch.index + startMatch[0].length;
  let depth = 1;
  let match;
  while ((match = tag.exec(source))) {
    depth += match[0][1] === "/" ? -1 : 1;
    if (depth === 0) return source.slice(startMatch.index, tag.lastIndex);
  }
  throw new Error(`section#${id} ist unvollständig`);
}

for (const [file, expected] of Object.entries(protectedFiles)) {
  assert.equal(sha(read(file)), expected, `${file} wurde außerhalb des freigegebenen Umfangs verändert`);
}

const controller = read("js/ui-page-controller.js");
const html = read("index.html");
for (const [key, expectation] of Object.entries(protectedFragments)) {
  const [file, label] = key.split("::");
  let fragment;
  if (file === "js/ui-page-controller.js") fragment = extractFunction(controller, label);
  else if (label.startsWith("section#")) fragment = extractSection(html, label.slice(8));
  else if (label === "global-billing-context") fragment = html.match(/<section aria-label="Abrechnungskontext"[\s\S]*?<\/section>/)?.[0];
  assert.ok(fragment, `${key} fehlt`);
  assert.equal(fragment.length, expectation.length, `${key} hat eine abweichende Länge`);
  assert.equal(sha(fragment), expectation.sha256, `${key} wurde verändert`);
}

const normalizedIndex = html
  .replaceAll("99.4.37-ap22f2b", "99.4.36-ap22f1c")
  .replaceAll("V99.4.37", "V99.4.36")
  .replace("NK-Pro V99.4.36 – AP22F2B Objektübersicht", "NK-Pro V99.4.36 – AP22F1C Dialogausblendung und zentrale Versionsanzeige");
assert.equal(sha(normalizedIndex), "b2a6a755d326263036dbc1026584236702a1553ab01b2ca853bab5beb25a90c2", "index.html weicht außerhalb der freigegebenen Versionsstellen ab");

const workerRegister = read("js/service-worker-register.js").replaceAll("99.4.37-ap22f2b", "99.4.36-ap22f1c");
assert.equal(sha(workerRegister), "c8a677cf61ce459c247f3fdb86f9970f391a8af52d92fafe244ec5d3d8244605", "Service-Worker-Registrierungslogik wurde verändert");
const worker = read("service-worker.js")
  .replaceAll("nk-pro-v99-4-37-ap22f2b", "nk-pro-v99-4-36-ap22f1c")
  .replaceAll("99.4.37-ap22f2b", "99.4.36-ap22f1c");
assert.equal(sha(worker), "13c3e2aef76a70d901ecdccae14579f1be64756aaebf0a1f5568f73a142c9bb0", "Service-Worker-Funktionslogik wurde verändert");

console.log(`AP22F2B protected areas: PASS (${Object.keys(protectedFiles).length} files, ${Object.keys(protectedFragments).length} fragments)`);
