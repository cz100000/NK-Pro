"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const sha=value=>crypto.createHash("sha256").update(value).digest("hex");
const protectedHashes={
  "js/app.js":"e702d5bb947c9f137c50b97e3ab894f446ac0fe66a1256bf94c3c16372ce2c53",
  "js/persistence.js":"c22eab211ae2d080ce82b3050f83edf173752e610688050330f0f12547cd6c6b",
  "js/app-state-persistence.js":"a337f6c2126d4aeb70dcb702523d5c2f9af2561d3d2f275cdc25dd03047868b8",
  "js/migration.js":"24db7607caca48ce1fb244f8bc0d9f3b4835a5e53c47868f02a673c9e9722828",
  "js/backup-recovery.js":"92b2f1df919acf425be770eb554373a23fc54b792249bbb33e88229475760bc7",
  "js/archive.js":"4f148c7df20d5301f4902fd464b584fd39eaa713da9a6a20820a2dfc1ef9c87e",
  "js/archive-actions.js":"4ea9bba6c43ec26bfb6ec1b2484b59d2def0a5b40a4025a004e08e9ce88e513b",
  "js/billing-snapshot.js":"65148329226ab031e9bcab3f03d9403cd017ecb2a841a3c0dc2373fec0e12b47",
  "js/document-data.js":"6477059a5ab09ea97f2a69f3d66f364e381f7cb7a28791534a566f2208b134bb",
  "js/document-renderer.js":"b64d75bfaba7d579242160ae0c18a28bd92ee20fd1ec4e56c6fbe191421c2f54",
  "js/navigation.js":"2e9e2c4b0fd8059640c0db073cf47a56364deca484f07dddbc68f7380a49375e",
  "js/billing-context.js":"2d292b1608677d659f21f5862db7ab3b8c454e2e6732319680fda401c6334785"
};
for(const [file,expected] of Object.entries(protectedHashes))assert.equal(sha(fs.readFileSync(path.join(root,file))),expected,`Geschützte Datei verändert: ${file}`);
const index=fs.readFileSync(path.join(root,"index.html"));
const start=index.indexOf(Buffer.from('<section class="tab" id="manuellewerte">'));
const end=index.indexOf(Buffer.from('<section class="tab"'),start+1);
assert.ok(start>0&&end>start,"Zielseitengrenzen fehlen");
assert.equal(sha(index.subarray(0,start)),"8d34152b0265e55dcbc79ef11ead4621bc45bf4adeb45c2beae00548eb347221","index.html vor #manuellewerte verändert");
assert.equal(sha(index.subarray(end)),"530d20fbd54efbf10e32d139ef4e0a3e3d6b9073a529b1eb406603fe285998c5","index.html nach #manuellewerte verändert");
const css=fs.readFileSync(path.join(root,"assets/app.css"));
const marker10=css.indexOf(Buffer.from("/* AP22F10B"));
const marker9=css.indexOf(Buffer.from("/* AP22F9B"),marker10+1);
assert.ok(marker10>0&&marker9>marker10,"CSS-Marker fehlen");
assert.equal(sha(css.subarray(0,marker10)),"8cdd982219d6bdda5b0624688c191f3e269519ae89af30b501fdbeb37350ed27","CSS vor AP22F10B verändert");
assert.equal(sha(css.subarray(marker9)),"e29344a9740b18c7dd2365e5f1eb3fa4c2a6c0f5442ceea093c17f90c92c47cf","Bestehender AP22F9B-CSS-Block verändert");
console.log(`AP22F10B Schutzbereiche: PASS (${Object.keys(protectedHashes).length} Vollhashes + 4 Teilbereiche)`);
