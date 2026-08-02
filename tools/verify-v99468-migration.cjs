"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const [sourceFile, migratedFile] = process.argv.slice(2);
if (!sourceFile || !migratedFile) {
  console.error("Aufruf: node tools/verify-v99468-migration.cjs <quelle.json> <migriert.json>");
  process.exit(2);
}
const source = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
const migrated = JSON.parse(fs.readFileSync(migratedFile, "utf8"));
const ids = rows => (Array.isArray(rows) ? rows : []).map(row => row && row.id);

for (const key of ["wohnungen", "mieter", "kostenarten", "vorauszahlungen"]) {
  assert.equal((migrated[key] || []).length, (source[key] || []).length, `${key}: Anzahl verändert`);
  if (["wohnungen", "mieter", "kostenarten"].includes(key)) assert.deepEqual(ids(migrated[key]), ids(source[key]), `${key}: stabile IDs verändert`);
}
assert.deepEqual(migrated.jahresArchiv, source.jahresArchiv, "Finalisierte Jahresarchive wurden verändert");

function requireM000(rows, label) {
  const row = (rows || []).find(item => item && item.id === "M000");
  assert.ok(row, `${label}: M000 fehlt`);
  assert.equal(row.einzug, "2010-01-01", `${label}: Einzugsdatum nicht migriert`);
  return row;
}
requireM000(migrated.mieter, "Aktuelle Abrechnung");
requireM000(migrated.objektStandard && migrated.objektStandard.partner, "Objektstandard");
requireM000(migrated.stammdaten && migrated.stammdaten.mieter, "Zentraler Stammdatenbestand");

const srcClone = structuredClone(source);
const outClone = structuredClone(migrated);
for (const data of [srcClone, outClone]) {
  const current = (data.mieter || []).find(item => item && item.id === "M000"); if (current) current.einzug = "<NORMALIZED>";
  const objectRow = ((data.objektStandard || {}).partner || []).find(item => item && item.id === "M000"); if (objectRow) objectRow.einzug = "<NORMALIZED>";
  const masterRow = ((data.stammdaten || {}).mieter || []).find(item => item && item.id === "M000"); if (masterRow) masterRow.einzug = "<NORMALIZED>";
  if (data.meta) {
    delete data.meta.settlementParticipantMigrationV99468;
    delete data.meta.privateUseParticipantMigration;
    delete data.meta.migratedWithAppVersion;
    if (Array.isArray(data.meta.standardMigrations)) data.meta.standardMigrations = data.meta.standardMigrations.filter(row => row && row.id !== "settlement-participants-v99.4.68");
    if (data.meta.exportedWithAppVersion === "V99.4.68") data.meta.exportedWithAppVersion = source.meta && source.meta.exportedWithAppVersion;
    if (data.meta.exportedAt !== (source.meta && source.meta.exportedAt)) data.meta.exportedAt = source.meta && source.meta.exportedAt;
    if (data.meta.exportScopeLabel && /V99\.4\.68/.test(data.meta.exportScopeLabel)) data.meta.exportScopeLabel = source.meta && source.meta.exportScopeLabel;
  }
}
assert.deepEqual(outClone, srcClone, "Außerhalb der dokumentierten Migration wurden Echtdaten verändert");
console.log("V99.4.68 Datenmigration und Archiverhalt verifiziert");
