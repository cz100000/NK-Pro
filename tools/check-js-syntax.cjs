"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const files = [];
let match;
while ((match = scriptPattern.exec(html))) {
  const srcMatch = match[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  if (srcMatch) {
    const relative = srcMatch[1].replace(/^\.\//, "");
    files.push({ label: relative, file: path.join(root, relative) });
  } else if (match[2].trim()) {
    process.stderr.write("FEHLER: Produktives Inline-JavaScript in index.html gefunden.\n");
    process.exit(1);
  }
}
files.push({ label: "service-worker.js", file: path.join(root, "service-worker.js") });

for (const entry of files) {
  if (!fs.existsSync(entry.file)) {
    process.stderr.write(`FEHLER: ${entry.label} fehlt.\n`);
    process.exit(1);
  }
  const result = spawnSync(process.execPath, ["--check", entry.file], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(`FEHLER: ${entry.label}\n${result.stderr || result.stdout}\n`);
    process.exit(1);
  }
  process.stdout.write(`OK: ${entry.label}\n`);
}
process.stdout.write(`Syntaxprüfung abgeschlossen: ${files.length} JavaScript-Einheiten fehlerfrei.\n`);
