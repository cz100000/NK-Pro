"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "ap22f7b-korrektur2-protected-hashes.json"), "utf8"));
const sha = value => crypto.createHash("sha256").update(value).digest("hex");

for (const [relative, expected] of Object.entries(manifest.protectedFiles)) {
  const target = path.join(root, relative);
  assert.ok(fs.existsSync(target), `Geschützte Datei fehlt: ${relative}`);
  const data = fs.readFileSync(target);
  assert.equal(data.length, expected.size, `Größe abweichend: ${relative}`);
  assert.equal(sha(data), expected.sha256, `Hash abweichend: ${relative}`);
}

// Die zentrale CSS-Datei ist nur für den exakt freigegebenen Tabellenbreitenblock geöffnet.
const cssPath = path.join(root, "assets", "app.css");
let normalizedCss = fs.readFileSync(cssPath, "utf8");
normalizedCss = normalizedCss.replace(
  `/* AP22C: produktive Migration von Tabellen, Listen und Tabellenwerkzeugen.\n   AP22F7B Korrektur 2: Der einspaltige Grid-Track erzwingt projektweit den\n   vollständigen rechten Tabellenabschluss und wächst bei breitem Inhalt\n   ausschließlich innerhalb des horizontal scrollbar bleibenden Containers. */`,
  `/* AP22C: produktive Migration von Tabellen, Listen und Tabellenwerkzeugen */`
);
normalizedCss = normalizedCss.replace("  overflow:auto;\n  display:grid;\n  grid-template-columns:minmax(100%,max-content);\n  border:1px solid var(--nk-ui-color-border) !important;", "  overflow:auto;\n  border:1px solid var(--nk-ui-color-border) !important;");
normalizedCss = normalizedCss.replace("  width:100%;\n  min-width:0;\n  border-collapse:separate;", "  width:max-content;\n  min-width:100%;\n  border-collapse:separate;");
assert.equal(
  sha(Buffer.from(normalizedCss, "utf8")),
  "c2d7c1661f13731a53f4a26269015d688e3cad7d08f0e6e702d4877b34aa949f",
  "assets/app.css enthält Änderungen außerhalb des freigegebenen zentralen Tabellenbreitenblocks."
);

console.log(`AP22F7B Korrektur 2 Schutzbereiche: PASS (${Object.keys(manifest.protectedFiles).length} Dateien + CSS-Normalisierung)`);
