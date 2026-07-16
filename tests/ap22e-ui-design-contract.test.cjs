"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
const EXPECTED_PROTECTED={
  "assets/app.css": "168bfbc02c3371bf0cf23dfa2ffdae0693bb56505f5f0e66dd64ee7b9030601a",
  "index.html": "1721f4f8549c97ed3f3ed06ffcc1376fc4caaf3d5b0290da0d0f4424a478de42",
  "js/app-bootstrap.js": "fc6122cfb321aeb00e801cc0fd85d097bc42ee5c226c2e5bd0cf9e21b6a8bdf3",
  "js/app-runtime-config.js": "93607dd2fa625b379bca91fc23125e7343990ece2c1d73287f93df3015335f60",
  "js/app-state-persistence.js": "a337f6c2126d4aeb70dcb702523d5c2f9af2561d3d2f275cdc25dd03047868b8",
  "js/app.js": "59f4239499e56486234dd9ee3503f7bc743092f5617a23d632e2db5f3462c0ef",
  "js/application-actions.js": "f707a5e41b351b2de16880406fa0bb41d238875e081405e28f4a7691afa23201",
  "js/archive-actions.js": "9cba490d96abb5dc4f728967eb6f1c78437b924a4bfaf81c9c84f1d43ebda85e",
  "js/archive.js": "4f148c7df20d5301f4902fd464b584fd39eaa713da9a6a20820a2dfc1ef9c87e",
  "js/backup-recovery.js": "92b2f1df919acf425be770eb554373a23fc54b792249bbb33e88229475760bc7",
  "js/billing-calculation.js": "2d1a130455e6dc0e2b541f80edeb9c12cfd8ffe9f9b0460f368f35030e7050c2",
  "js/billing-context.js": "5027295c32fc214b80b07f3d35b4e06186a911995e35d2cb9787fdc99f23f1e8",
  "js/billing-snapshot.js": "65148329226ab031e9bcab3f03d9403cd017ecb2a841a3c0dc2373fec0e12b47",
  "js/billing-workflow.js": "c87062234d0709b2a9c9fd1a391fa45ad34e3be6b0448e18248976abee6cbcf5",
  "js/browser-io.js": "f5857fe949d42a28b4e40fce1e90f420cc80b0cfb1a61e930477234cb2c39086",
  "js/compatibility.js": "1904a38bbc0b88a4777ae897ff63f7fe4ba66fb02aa01bd19325cfe36c0409d6",
  "js/cost-actions.js": "7bc64711742c8654f9c86853618aa2b06ab4e99acf5616be8003f6bcbe922729",
  "js/default-seed.js": "1e62636860c65f7507a017028d8e845dc6b2e90bbe6bf762f7ae27dd755d1439",
  "js/diagnostics.js": "dfc2dd495167f4e0a627fe93f1ea8b34a01db22cd24ca0bc17b520240a3e1c40",
  "js/document-data.js": "b96bc414bdd7604962994cd8598fd2832e4d66523799f3051dfc4877317a9775",
  "js/document-renderer.js": "def7bbc7a6fb53c0937840c89ae920b13f2ec710ef0484fa2b4859fef214edda",
  "js/export-service.js": "4954c06643fe10afbaa03f7c89aca36a4e20a3fd0336fccca65e1b615b280b87",
  "js/master-data-actions.js": "5bcdc4eaadc3875da740d30ae5551c8edcc2429f24f2c7777d149b5227f87c82",
  "js/meter-master.js": "d7da1a6f4458c82343c62b079fb8fcc699215432f2f486f9a46a259007f168a3",
  "js/meter-periods.js": "23b762d65478c6b7c2aa0fe5ce0ac13d03845b3903986eb2a6d0275efa5bc2ea",
  "js/meter-readings.js": "f55538060d23ff4aee6e9b9af7bbfafa38f66a58f8aeec3b4c05e04445b3890f",
  "js/meter-validation.js": "470579509f9376274e4615d1d6c776b6fe42cb6c2c168fb0c447ccb1df486d93",
  "js/migration.js": "24db7607caca48ce1fb244f8bc0d9f3b4835a5e53c47868f02a673c9e9722828",
  "js/modal-events.js": "6e075d6d92597280d03b357a59b1301f745e6b1210c2c408e0251f232188b0f6",
  "js/navigation.js": "5b95d71e281f4d0faa9e4be1b39fbf1986ffcd1dec613f7379980a9dde1a913c",
  "js/object-standard.js": "64f68daf6c5a5100482403637c2b24c64001dbbfabc69e77112ad47b41a89046",
  "js/persistence.js": "c22eab211ae2d080ce82b3050f83edf173752e610688050330f0f12547cd6c6b",
  "js/quality-assurance.js": "8d101554b25ccd7e215c4527f03ebbddee39e87092dd5ba63731de35e97b264b",
  "js/quality-rules.js": "5f03547b5b3c48aaf143b50f1b62e6f87539aaf02cee467c4e634279430012b4",
  "js/runtime-diagnostics.js": "30623cb3a0162e1e4173ba9d2fb68ed08d4d130c99758bde143a0034524200a3",
  "js/service-worker-register.js": "faa2e6fecbe0d43f2229e0cd7f44d629c53ec7f798f1b8a9363b4ebd3a1c970a",
  "js/state-access.js": "4e4cd3e72edac6f611a8c4e7bc05f313c539f898f60ff1843ce36332772e827d",
  "js/ui-archive-pages.js": "f33db7c4eb5b017d6ab56d62a05d6dbea122490e216dae7c49a6b42c57b68c02",
  "js/ui-billing-allocation.js": "e65d79c4f4213b11e1381207f08878be6cb1a5532c812056499076ecba6b1dc1",
  "js/ui-bindings.js": "db165144d9216702f969fcdef81d8192a46d69e0ecf5ef54ba39fb9f736bbac7",
  "js/ui-controller.js": "2eb8f2688aea6916c8d7038ca7429b4f3d7ff1124d802670ffda549b967ae2dc",
  "js/ui-costs.js": "29a257f1fe7fcda0a98682536baf9f9e90d28f767ce847782f04e16cdecce264",
  "js/ui-design-system.js": "a30e1c60b6f68845d70617300127d8f492253035031acd186ee6987c43e48ba8",
  "js/ui-diagnostics.js": "759468aa5e32f0580c3790c9f5f17027ad3f96f786982d020abf2e593c25ed85",
  "js/ui-documents.js": "2fff3638cd1ba89e95cd644931cb5cf114a649c3baad0003653b37f7ad5d0736",
  "js/ui-events.js": "bff3be6e65911b69c3c390b41eba11d7eb386ace67c84f9b915d7ee9e2b3da13",
  "js/ui-individual-values.js": "9f45ed836b03bb25f6a3156c66a2ab9dce0ffe36559d46a8314ee482bba51d59",
  "js/ui-master-data.js": "73a29dfa8cd0fdaeda8c39a9e39a2643e28d6f9ff1bff6f3a4e65cc365677207",
  "js/ui-metering.js": "f1604efe8a88b72fd5f68cf9fea8c0e3b36196796a58d0b0879d8458fdeff9cc",
  "js/ui-navigation-pages.js": "503c0a0673321ffebf36c8877f920b7f90c8f4cd1f307869a0bedb1f31c625e2",
  "js/ui-page-controller.js": "d372f587bda5e2b979437e0c363151a98939d7136e53380b704987dfa3fafbdf",
  "js/ui-preferences.js": "a472ed364ef2013ad8ded86552b4d6a61ead72c01c911bb33cd59886352948b3",
  "js/ui-quality.js": "35f2f122cf509c1479838ba08108c74905020be86e23e880f5c7c8c6432f1955",
  "js/ui-table-actions.js": "068d3b4de734d3a09fdd51b85d52788878ca25945f7fbaa0799c1b691c71db6e",
  "js/ui-table-tools.js": "2bc057d25eba389005fa26b4b51ac7e76ebf09d63136b607870cd6d30f7641b1",
  "js/year-transition-actions.js": "ee4d97ada4ca06895f1ff8485cb0a42902f9daa9a7adb9fbea4c9a9895b250de",
  "manifest.webmanifest": "2e6b1ac4e1c11efa32a46a781dbad5dfde1429a264b300a644186b81a50a1c72",
  "service-worker.js": "98c4ab2b60905b1ad7838604adaccc962832413644c9c51ff9e7f617aacd9236"
};
function read(rel){return fs.readFileSync(path.join(ROOT,rel),"utf8");}
function exists(rel){assert.ok(fs.existsSync(path.join(ROOT,rel)),`Fehlt: ${rel}`);}
function sha(rel){return crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT,rel))).digest("hex");}

function scanReleaseContents(){
  const forbiddenDirectories=new Set(["test-results","playwright-report","coverage",".cache",".playwright"]);
  let count=0;
  function walk(dir,relative=""){
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      const rel=relative?path.posix.join(relative,entry.name):entry.name;
      if(entry.isDirectory()){
        if(entry.name==="node_modules"||entry.name===".git") continue;
        assert.ok(!forbiddenDirectories.has(entry.name),`Generiertes Verzeichnis im Release: ${rel}`);
        walk(path.join(dir,entry.name),rel); continue;
      }
      if(!entry.isFile()) continue;
      count++;
      assert.doesNotMatch(rel,/\.(?:zip|7z|rar|tar|tgz|gz|bak|old|tmp|temp|orig|rej|swp|log|trace)$/i,`Unzulässiges Release-Artefakt: ${rel}`);
    }
  }
  walk(ROOT);
  return count;
}
const requiredDocs=[
  "UI_UX_DESIGNVERTRAG.md","UI_UX_ZIELBILD.md","UI_UX_SEITENANATOMIE.md","UI_UX_KOMPONENTENREGELN.md","UI_UX_ABNAHMEKATALOG.md",
  "UI_DESIGN_TOKENS.md","UI_KOMPONENTENKATALOG.md","UI_ARCHITEKTUR_AKTUELL.md","UI_MIGRATIONSMATRIX.md","UX_GUIDE.md",
  "NK-PRO-PROJEKTSTAND.md","ROADMAP.md","CHANGELOG.md","RELEASE_NOTES.md","TESTING.md",
  "AP22E_DATEIPOSITIVLISTE.md","AP22E_BESTANDSAUFNAHME.md","AP22E_DATEIAENDERUNGEN.md","AP22E_PRUEFBERICHT.md","AP22E_ABSCHLUSS.md"
]
requiredDocs.forEach(exists);

const requiredJson=["AP22E_DATEIAENDERUNGEN.json","AP22E_TEST_RESULTS.json","AP22E_RELEASE_CONTENT_POLICY.json"];
requiredJson.forEach(exists);
for(const rel of requiredJson){const data=JSON.parse(read(rel));assert.equal(data.version,"99.4.33",`Falsche AP22E-Version in ${rel}`);}
const packageData=JSON.parse(read("package.json"));
assert.equal(packageData.version,"99.4.33");
assert.equal(packageData.name,"nk-pro-v99-4-33");
assert.match(read("playwright.config.cjs"),/ap22e-ui-reference/);
const contract=read("UI_UX_DESIGNVERTRAG.md");
assert.match(contract,/Jede spätere UI-Umsetzung muss dem freigegebenen UI-\/UX-Designvertrag/);
assert.match(contract,/Navigation aus V99\.4\.32 bleibt optisch, strukturell und funktional unverändert/);
assert.match(contract,/nicht geregelten? Situation[^\n]*nicht improvisiert/i);
assert.match(contract,/Bestandsanalyse[\s\S]*Mockup[\s\S]*Datei-Positivliste[\s\S]*Nutzerfreigabe/);
const target=read("UI_UX_ZIELBILD.md");
assert.match(target,/Styleguide_Bild\.png/);
assert.match(target,/Navigation ist ausgeschlossen/);
const anatomy=read("UI_UX_SEITENANATOMIE.md");
assert.match(anatomy,/keine zweite Kontextkarte|keine zweite Kontextanzeige/i);
assert.match(anatomy,/Modus: Nur ansehen/);
assert.match(anatomy,/Schreibgeschützt.*Seitenkopf.*entfallen/is);
const rules=read("UI_UX_KOMPONENTENREGELN.md");
for(const label of ["Navigation","Abrechnungskontextleiste","Seitenschale","Seitenkopf","Layoutsysteme","Karten","Klappboxen","Tabellen und Listen","Formulare","Buttons und Aktionsleisten","Hinweise und Status","Dialoge","Inhaltszustände","Typografie","Farben","Abstände","Icons","Fokus und Tastatur","Responsive Verhalten"]){assert.match(rules,new RegExp(label,"i"),`Komponentengruppe fehlt: ${label}`);}
const acceptance=read("UI_UX_ABNAHMEKATALOG.md");
for(const label of ["Hauptseitentitel","Abrechnungskontextanzeige","zentralen Raster","Status werden nicht ausschließlich","Fokus","Schmale Ansicht","lokale CSS-Sonderlösung"]){assert.match(acceptance,new RegExp(label,"i"));}
const refFiles=["ui-reference/index.html","ui-reference/reference.css","ui-reference/reference.js","ui-reference/assets/UI_UX_Styleguide_Bild.svg","ui-reference/assets/UI_UX_Styleguide_Bild.png","ui-reference/assets/navigation-v99-4-32.png"];
refFiles.forEach(exists);
assert.ok(fs.statSync(path.join(ROOT,"ui-reference/assets/UI_UX_Styleguide_Bild.png")).size>100000,"Styleguide-PNG ist nicht vollständig");
assert.ok(fs.statSync(path.join(ROOT,"ui-reference/assets/navigation-v99-4-32.png")).size>20000,"Navigationsreferenz ist nicht vollständig");
const productIndex=read("index.html");
assert.doesNotMatch(productIndex,/ui-reference/i,"Referenzbibliothek darf nicht produktiv verlinkt sein");
const ref=refFiles.filter(f=>/\.(html|css|js)$/.test(f)).map(read).join("\n");
for(const forbidden of [/localStorage/i,/sessionStorage/i,/indexedDB/i,/XMLHttpRequest/i,/\bfetch\s*\(/i,/serviceWorker/i,/data-ui-action/i,/NKProUIDesignSystem/i]){assert.doesNotMatch(ref,forbidden,`Verbotener Zugriff in Referenz: ${forbidden}`);}
for(const group of ["styleguide","navigation","shell","cards","accordions","tables","forms","actions","notices","dialogs","states","responsive"]){assert.match(ref,new RegExp(`data-reference-group=["']${group}["']`),`Referenzgruppe fehlt: ${group}`);}
for(const state of ["no-data","not-created","filtered","loading","error","not-applicable","disabled","unavailable"]){assert.match(ref,new RegExp(`data-state=["']${state}["']`),`Inhaltszustand fehlt: ${state}`);}
assert.doesNotMatch(ref,/[😀-🙏🌀-🫿]/u,"Emoji sind in der Referenzbibliothek nicht zulässig");
for(const sample of ["Objekt","Mieter","Kosten","Verbräuche","Prüfung","Abrechnung","Briefe","Archiv","Musterstraße","fiktiv"]){assert.match(ref,new RegExp(sample,"i"),`Deutsches NK-Pro-Beispiel fehlt: ${sample}`);}
for(const [rel,expected] of Object.entries(EXPECTED_PROTECTED)){assert.equal(sha(rel),expected,`Geschützte Produktdatei verändert: ${rel}`);}
const releaseFileCount=scanReleaseContents();
console.log(`AP22E statisch bestanden: ${requiredDocs.length} Pflichtdokumente, ${requiredJson.length} Nachweis-JSONs, ${refFiles.length} Referenzdateien, ${Object.keys(EXPECTED_PROTECTED).length} geschützte Produktdateien unverändert, ${releaseFileCount} Release-Dateien geprüft.`);
