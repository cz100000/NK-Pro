"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const hashes=JSON.parse(fs.readFileSync(path.join(__dirname,"ap22f8b-korrektur1-protected-hashes.json"),"utf8"));
const sha=data=>crypto.createHash("sha256").update(data).digest("hex");
for(const [relative,expected] of Object.entries(hashes)){
  const target=path.join(root,relative);
  assert.ok(fs.existsSync(target),`Geschützte Ausgangsdatei fehlt: ${relative}`);
  assert.equal(sha(fs.readFileSync(target)),expected,`Geschützte Ausgangsdatei verändert: ${relative}`);
}
console.log(`AP22F8B Korrektur 1 Schutzabgleich: PASS (${Object.keys(hashes).length} unveränderte Ausgangsdateien)`);
