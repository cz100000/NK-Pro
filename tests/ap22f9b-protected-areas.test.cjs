"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const sha=data=>crypto.createHash("sha256").update(data).digest("hex");
const protectedHashes={
  "js/ui-master-data.js":"45516aa16ac4491b8db96d30c42c6c26bf0031b4fee20eae3dadc448aeebe931",
  "js/cost-actions.js":"650acd0da08ba2dedc738592ae83d76a1eb069bed94d8dcf04a1e0ea26f38f01",
  "js/billing-calculation.js":"4052f09a44074af4de2312744a1ac0aebac2905d827029b5e50148e23ee55a2a",
  "js/application-actions.js":"f707a5e41b351b2de16880406fa0bb41d238875e081405e28f4a7691afa23201",
  "js/billing-context.js":"2d292b1608677d659f21f5862db7ab3b8c454e2e6732319680fda401c6334785",
  "js/ui-page-controller.js":"8f044c846a9765812feb941aca73e64ba44ca6ef74a379cae9382afed9d52491",
  "js/persistence.js":"c22eab211ae2d080ce82b3050f83edf173752e610688050330f0f12547cd6c6b",
  "js/migration.js":"24db7607caca48ce1fb244f8bc0d9f3b4835a5e53c47868f02a673c9e9722828",
  "js/backup-recovery.js":"92b2f1df919acf425be770eb554373a23fc54b792249bbb33e88229475760bc7",
  "js/archive.js":"4f148c7df20d5301f4902fd464b584fd39eaa713da9a6a20820a2dfc1ef9c87e",
  "js/document-renderer.js":"b64d75bfaba7d579242160ae0c18a28bd92ee20fd1ec4e56c6fbe191421c2f54",
  "js/quality-rules.js":"bd8c0c8824353d7207089a796fef18c591ac55f657e928293589f30f9519e389",
  "js/navigation.js":"2e9e2c4b0fd8059640c0db073cf47a56364deca484f07dddbc68f7380a49375e"
};
const index=fs.readFileSync(path.join(root,"index.html"));
const indexStart=index.indexOf(Buffer.from('<section class="tab cost-mockup-page'));
const mieterAnchor=index.indexOf(Buffer.from('id="mieter"'),indexStart);
const indexEnd=index.lastIndexOf(Buffer.from('<section class="tab'),mieterAnchor);
assert.ok(indexStart>0&&indexEnd>indexStart,"Gesamtkosten-Seitengrenzen fehlen");
assert.equal(sha(index.subarray(0,indexStart)),"4074635695335e1742eab18619f7716f654f798b3f9ed7a2855b18c738f510d6","index.html vor section#einstellungen verändert");
assert.equal(sha(index.subarray(indexEnd)),"d9d7f2ff1107b92923f87ffed55065a570129405268fe116a888ae310f2944bb","index.html nach section#einstellungen verändert");

for(const [file,expected] of Object.entries(protectedHashes)){
  const target=path.join(root,file);assert.ok(fs.existsSync(target),`Geschützte Datei fehlt: ${file}`);
  assert.equal(sha(fs.readFileSync(target)),expected,`Geschützte Datei verändert: ${file}`);
}
const css=fs.readFileSync(path.join(root,"assets/app.css"));
const marker=css.indexOf(Buffer.from("/* AP22F9B"));assert.ok(marker>0,"AP22F9B CSS-Marker fehlt");
const originalCssSize=322742;
assert.equal(sha(css.subarray(0,originalCssSize)),"406dd38711389a9970aa63f5934df04ea87f95c76f165c34bed1ef5b0e9e5ecd","CSS außerhalb des AP22F9B-Blocks verändert");
assert.match(css.subarray(originalCssSize,marker).toString("utf8"),/^\s*$/,"Vor dem AP22F9B-CSS-Block stehen unerwartete Änderungen");
const costs=fs.readFileSync(path.join(root,"js/ui-costs.js"));
const suffix=costs.indexOf(Buffer.from("function renderWohnungen()"));assert.ok(suffix>0);
assert.equal(sha(costs.subarray(suffix)),"02810afed257364526ca6811233cd90108d8c4cfe91fb85254c2ed254135c5e3","ui-costs.js nach Gesamtkostenbereich verändert");
const bindings=fs.readFileSync(path.join(root,"js/ui-bindings.js"),"utf8");
const normalized=bindings
  .replace(', "cost.setSearch":call(handlers, "setCostSearch")',"")
  .replace(/^\s*"cost.clearSearch":call\(handlers, "clearCostSearch"\),\r?\n/m,"");
assert.equal(sha(Buffer.from(normalized)),"da485e946993286c7031d5bfcfdca075abc869af4a43454038b6a422cb53eb9b","ui-bindings.js außerhalb der zwei freigegebenen Suchbindungen verändert");
console.log(`AP22F9B Schutzbereiche: PASS (${Object.keys(protectedHashes).length} Vollhashes + 5 Teilbereiche)`);
