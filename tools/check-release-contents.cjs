"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));
const strict = args.has("--strict");
const ignoreNodeModules = args.has("--ignore-node-modules");
const jsonOutput = args.has("--json");
const project = JSON.parse(fs.readFileSync(path.join(root, "nk-pro-project.json"), "utf8"));
const expectedVersion = project.appVersion;
const expectedDisplayVersion = project.displayVersion;
const expectedCache = project.pwaCacheName;

const findings = [];
const warnings = [];
const files = [];
const ignoredDirectories = new Set([".git"]);

function addFinding(type, relative, detail) {
  findings.push({ type, path:relative, detail });
}
function addWarning(type, relative, detail) {
  warnings.push({ type, path:relative, detail });
}
function walk(directory, relative = "") {
  for (const entry of fs.readdirSync(directory, { withFileTypes:true })) {
    const rel = relative ? path.posix.join(relative, entry.name) : entry.name;
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue;
      if (entry.name === "node_modules") {
        (ignoreNodeModules ? addWarning : addFinding)("installed-dependencies", rel, "Installierte Abhängigkeiten gehören nicht in die Arbeits-ZIP.");
        continue;
      }
      if (["test-results", "playwright-report", "coverage", ".cache", ".playwright"].includes(entry.name)) {
        addFinding("generated-output", rel, "Generiertes Test-, Browser- oder Cacheverzeichnis.");
        continue;
      }
      if (/^AP\d+_VISUAL_REFERENCES$/i.test(entry.name)) {
        addFinding("historical-visuals", rel, "Historische visuelle Referenzausgaben.");
        continue;
      }
      walk(path.join(directory, entry.name), rel);
      continue;
    }
    if (!entry.isFile()) continue;
    files.push(rel);
    const lower = entry.name.toLowerCase();
    const stat = fs.statSync(path.join(directory, entry.name));
    if (/\.(zip|7z|rar|tar|tgz|gz)$/i.test(lower)) addFinding("archive", rel, "Archivdatei innerhalb der Arbeitsbasis.");
    if (/\.(bak|old|tmp|temp|orig|rej|swp)$/i.test(lower) || /~$/.test(lower)) addFinding("temporary-backup", rel, "Temporäre oder lokale Sicherungsdatei.");
    if (/\.(log|trace)$/i.test(lower)) addFinding("log", rel, "Log- oder Trace-Datei.");
    if (/Kontrollausgabe.*\.pdf$/i.test(entry.name)) addFinding("generated-control-output", rel, "Generierte Kontrollausgabe.");
    if (stat.size > 5 * 1024 * 1024) addWarning("large-file", rel, `Unerwartet große Datei: ${stat.size} Byte.`);
    if (/^AP\d+_/i.test(entry.name) && !/^AP(?:15|17|18)_/i.test(entry.name) && rel !== "AP9_BASELINE_INVENTORY.json") {
      addFinding("historical-ap-artifact", rel, "Historisches AP-Artefakt außerhalb der freigegebenen Release-Dokumentation.");
    }
  }
}

walk(root);

const textExtensions = new Set([".js", ".cjs", ".json", ".md", ".html", ".css", ".webmanifest", ".txt"]);
for (const rel of files) {
  const ext = path.extname(rel).toLowerCase();
  if (!textExtensions.has(ext)) continue;
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  if (/(?:[A-Za-z]:\\Users\\[^\\\r\n]+|\/Users\/[^/\r\n]+|\/home\/(?!oai\/skills)[^/\r\n]+)\/[^\s"']+/.test(text)) {
    addFinding("absolute-local-path", rel, "Absoluter lokaler Entwicklungspfad gefunden.");
  }
}

function requireText(relative, expected, label) {
  const target = path.join(root, relative);
  if (!fs.existsSync(target)) {
    addFinding("missing-required-file", relative, `${label} fehlt.`);
    return;
  }
  const text = fs.readFileSync(target, "utf8");
  if (!text.includes(expected)) addFinding("version-inconsistency", relative, `${label} enthält nicht ${expected}.`);
}

requireText("index.html", `NK-Pro ${expectedDisplayVersion}`, "HTML-Version");
requireText("js/app-runtime-config.js", `const APP_VERSION = "${expectedDisplayVersion}";`, "Laufzeitversion");
requireText("manifest.webmanifest", `"version": "${expectedVersion}"`, "Manifestversion");
requireText("package.json", `"version": "${expectedVersion}"`, "Paketversion");
requireText("service-worker.js", `const CACHE_NAME = "${expectedCache}";`, "Cachekennung");

const report = {
  version:expectedDisplayVersion,
  scannedFiles:files.length,
  strict,
  ignoredInstalledDependencies:ignoreNodeModules,
  findings,
  warnings,
  status:findings.length ? "failed" : "passed"
};

if (jsonOutput) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
else {
  process.stdout.write(`ZIP-Inhaltsprüfung ${report.status === "passed" ? "bestanden" : "fehlgeschlagen"}: ${files.length} Dateien geprüft.\n`);
  for (const item of findings) process.stdout.write(`FEHLER [${item.type}] ${item.path}: ${item.detail}\n`);
  for (const item of warnings) process.stdout.write(`HINWEIS [${item.type}] ${item.path}: ${item.detail}\n`);
}
if (strict && findings.length) process.exit(1);
