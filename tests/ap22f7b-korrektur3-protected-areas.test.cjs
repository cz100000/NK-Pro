"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"ap22f7b-korrektur2-protected-hashes.json"),"utf8"));
const sha=value=>crypto.createHash("sha256").update(value).digest("hex");
const allowedFiles=new Set(["js/ui-costs.js","UI_UX_DESIGNVERTRAG.md","UI_UX_KOMPONENTENREGELN.md","UI_KOMPONENTENKATALOG.md","UI_UX_ABNAHMEKATALOG.md","UI_MIGRATIONSMATRIX.md"]);
for(const [relative,expected] of Object.entries(manifest.protectedFiles)){
 if(allowedFiles.has(relative))continue;
 const target=path.join(root,relative);
 assert.ok(fs.existsSync(target),`Geschützte Datei fehlt: ${relative}`);
 const data=fs.readFileSync(target);
 assert.equal(data.length,expected.size,`Größe abweichend: ${relative}`);
 assert.equal(sha(data),expected.sha256,`Hash abweichend: ${relative}`);
}
let css=fs.readFileSync(path.join(root,"assets/app.css"),"utf8");
css=css.replace("\n   AP22F7B Korrektur 3: Die letzte Kopf- und Datenzelle erhält verbindlich\n   den sichtbaren rechten Rahmen; dies gilt automatisch auch für künftige\n   Tabellen, die die zentrale nk-ui-table-Komponente verwenden.","");
css=css.replace(/body:not\(\.document-print-window\) \.nk-ui-table tr > :last-child \{\n  border-right:1px solid var\(--nk-ui-color-border\) !important;\n\}\nbody:not\(\.document-print-window\) \.nk-ui-table thead tr:first-child > th:last-child \{\n  border-top-right-radius:var\(--nk-ui-radius-sm\);\n\}\nbody:not\(\.document-print-window\) \.nk-ui-table tbody tr:last-child > :last-child \{\n  border-bottom-right-radius:var\(--nk-ui-radius-sm\);\n\}\n/,"");
assert.equal(sha(Buffer.from(css,"utf8")),"5daa34402b7e5ebb50296cb27614220fa10ba315608d6b87ce66adcf890a13bb","assets/app.css enthält Änderungen außerhalb des Korrektur-3-Tabellenrahmens.");
let costs=fs.readFileSync(path.join(root,"js/ui-costs.js"),"utf8");
const newTenantValue='const tenantValue=(m,key)=>key==="unit"?billingTenantUnitName(m.wohnung):key==="period"?billingTenantPeriodSortValue(m):key==="status"?tenantOpenStatus(m):key==="people"?num(m.personen):key==="days"?num(m.aktiveTage):m[key];';
const oldTenantValue='const tenantValue=(m,key)=>key==="unit"?billingTenantUnitName(m.wohnung):key==="period"?billingTenantPeriod(m):key==="status"?tenantOpenStatus(m):key==="people"?num(m.personen):key==="days"?num(m.aktiveTage):m[key];';
assert.ok(costs.includes(newTenantValue),"Freigegebene sortierneutrale Zeitraumfunktion fehlt.");
costs=costs.replace(newTenantValue,oldTenantValue);
const newPeriod=`function billingTenantDate(value) {
  const text=billingTenantText(value);
  if (!text) return "offen";
  const match=/^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(text);
  return match ? match[3]+"."+match[2]+"."+match[1] : text;
}
function billingTenantPeriod(m) { return billingTenantDate(m && m.einzug) + " – " + billingTenantDate(m && m.auszug); }
function billingTenantPeriodSortValue(m) { return billingTenantText(m && m.einzug) + "|" + billingTenantText(m && m.auszug); }`;
const oldPeriod='function billingTenantPeriod(m) { return billingTenantText(m.einzug || "offen") + " – " + billingTenantText(m.auszug || "offen"); }';
assert.ok(costs.includes(newPeriod),"Freigegebene deutsche Zeitraumformatierung fehlt.");
costs=costs.replace(newPeriod,oldPeriod);
costs=costs.replace("escapeHtml(billingTenantDate(m.einzug))","escapeHtml(m.einzug || \"offen\")");
costs=costs.replace("escapeHtml(billingTenantDate(m.auszug))","escapeHtml(m.auszug || \"offen\")");
assert.equal(sha(Buffer.from(costs,"utf8")),"e034f079bdc145377497cf114eb005ed9cdd1cb023fec44d93041c59344f8238","js/ui-costs.js enthält Änderungen außerhalb der sichtbaren Datumsformatierung und sortierneutralen Zeitraumfunktion.");
console.log(`AP22F7B Korrektur 3 Schutzbereiche: PASS (${Object.keys(manifest.protectedFiles).length-allowedFiles.size} Dateien + CSS/JS-Normalisierung)`);
