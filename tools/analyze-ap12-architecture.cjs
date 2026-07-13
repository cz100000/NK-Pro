"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const jsDir = path.join(root, "js");
const files = fs.readdirSync(jsDir)
  .filter(name => name.endsWith(".js") && name !== "app.v99.4.12.baseline.js")
  .sort();

function read(relative) { return fs.readFileSync(path.join(root, relative), "utf8"); }
function lineOf(source, index) { return source.slice(0, index).split(/\r?\n/).length; }
function sha256(source) { return crypto.createHash("sha256").update(source).digest("hex"); }

function functionRanges(source) {
  const ranges = [];
  const regex = /^function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm;
  for (const match of source.matchAll(regex)) {
    let cursor = match.index + match[0].length;
    let depth = 1;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    while (cursor < source.length && depth > 0) {
      const ch = source[cursor];
      const next = source[cursor + 1];
      if (lineComment) { if (ch === "\n") lineComment = false; cursor += 1; continue; }
      if (blockComment) { if (ch === "*" && next === "/") { blockComment = false; cursor += 2; } else cursor += 1; continue; }
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === quote) quote = null;
        cursor += 1;
        continue;
      }
      if (ch === "/" && next === "/") { lineComment = true; cursor += 2; continue; }
      if (ch === "/" && next === "*") { blockComment = true; cursor += 2; continue; }
      if (ch === '"' || ch === "'" || ch === "`") { quote = ch; cursor += 1; continue; }
      if (ch === "{") depth += 1;
      else if (ch === "}") depth -= 1;
      cursor += 1;
    }
    ranges.push({ name:match[1], start:match.index, end:cursor, line:lineOf(source, match.index), body:source.slice(match.index, cursor) });
  }
  return ranges;
}

function ownerFunction(ranges, index) {
  const hit = ranges.filter(range => range.start <= index && index < range.end).sort((a,b) => (a.end-a.start)-(b.end-b.start))[0];
  return hit ? hit.name : "<top-level>";
}

const stateWritePattern = /\bstate(?:\.[A-Za-z_$][\w$]*|\[[^\]\n]+\])+(?:\.[A-Za-z_$][\w$]*|\[[^\]\n]+\])*\s*(?:(?<![=!<>])=(?!=)|\+=|-=|\*=|\/=|\+\+|--)/g;
const stateRootPattern = /(?<![\w.!<>=])state\s*=(?!=)/g;
const mutatingCallPattern = /\bstate(?:\.[A-Za-z_$][\w$]*|\[[^\]\n]+\])*(?:\.[A-Za-z_$][\w$]*|\[[^\]\n]+\])*\.(push|splice|sort|reverse|pop|shift|unshift)\s*\(/g;
const deletePattern = /\bdelete\s+state(?:\.[A-Za-z_$][\w$]*|\[[^\]\n]+\])+/g;
const globalAssignmentPattern = /\b(?:window|globalThis)\.([A-Za-z_$][\w$]*)\s*=(?!=)/g;
const moduleExportPattern = /\bglobal\.([A-Za-z_$][\w$]*)\s*=\s*Object\.freeze/g;
const wrapperPattern = /^function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*return\s+NK_PRO_MODULES\.([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\([^;]*\);\s*\}\s*$/gm;

const report = {
  generatedAt:new Date().toISOString(),
  version:"99.4.13",
  files:{},
  totals:{ files:files.length, bytes:0, lines:0, functions:0, renderers:0, stateWrites:0, stateRootAssignments:0, stateMutatingCalls:0, stateDeletes:0, globalAssignments:0, moduleExports:0, compatibilityWrappers:0 },
  stateWrites:[],
  stateRootAssignments:[],
  stateMutatingCalls:[],
  stateDeletes:[],
  globalAssignments:[],
  moduleExports:[],
  compatibilityWrappers:[],
  renderers:[]
};

for (const file of files) {
  const relative = `js/${file}`;
  const source = read(relative);
  const ranges = functionRanges(source);
  const fileInfo = {
    bytes:Buffer.byteLength(source),
    lines:source.split(/\r?\n/).length,
    sha256:sha256(source),
    functions:ranges.map(range => ({ name:range.name, line:range.line })),
    renderers:ranges.filter(range => /^render/.test(range.name)).map(range => ({ name:range.name, line:range.line }))
  };
  report.files[relative] = fileInfo;
  report.totals.bytes += fileInfo.bytes;
  report.totals.lines += fileInfo.lines;
  report.totals.functions += fileInfo.functions.length;
  report.totals.renderers += fileInfo.renderers.length;

  for (const match of source.matchAll(stateWritePattern)) report.stateWrites.push({ file:relative, line:lineOf(source, match.index), function:ownerFunction(ranges, match.index), expression:match[0].trim() });
  for (const match of source.matchAll(stateRootPattern)) {
    const line = source.slice(source.lastIndexOf("\n", match.index)+1, source.indexOf("\n", match.index) < 0 ? source.length : source.indexOf("\n", match.index)).trim();
    if (/\b(?:const|let|var)\s+state\s*=/.test(line)) continue;
    if (/\.state\s*=/.test(line)) continue;
    report.stateRootAssignments.push({ file:relative, line:lineOf(source, match.index), function:ownerFunction(ranges, match.index), expression:line });
  }
  for (const match of source.matchAll(mutatingCallPattern)) report.stateMutatingCalls.push({ file:relative, line:lineOf(source, match.index), function:ownerFunction(ranges, match.index), method:match[1], expression:match[0].trim() });
  for (const match of source.matchAll(deletePattern)) report.stateDeletes.push({ file:relative, line:lineOf(source, match.index), function:ownerFunction(ranges, match.index), expression:match[0].trim() });
  for (const match of source.matchAll(globalAssignmentPattern)) report.globalAssignments.push({ file:relative, line:lineOf(source, match.index), function:ownerFunction(ranges, match.index), binding:match[1] });
  for (const match of source.matchAll(moduleExportPattern)) report.moduleExports.push({ file:relative, line:lineOf(source, match.index), binding:match[1] });
  for (const match of source.matchAll(wrapperPattern)) report.compatibilityWrappers.push({ file:relative, line:lineOf(source, match.index), wrapper:match[1], module:match[2], target:match[3] });
  for (const range of ranges.filter(item => /^render/.test(item.name))) {
    const mutation = stateWritePattern.test(range.body) || stateRootPattern.test(range.body) || mutatingCallPattern.test(range.body) || deletePattern.test(range.body);
    stateWritePattern.lastIndex = stateRootPattern.lastIndex = mutatingCallPattern.lastIndex = deletePattern.lastIndex = 0;
    report.renderers.push({ file:relative, line:range.line, name:range.name, mutatesState:mutation, persists:/\b(?:saveData|commitStateChange)\s*\(/.test(range.body), navigates:/\bswitchToTab\s*\(/.test(range.body), opensDialog:/\b(?:open|show)[A-Za-z0-9_$]*Dialog\s*\(/.test(range.body) });
  }
}

report.totals.stateWrites = report.stateWrites.length;
report.totals.stateRootAssignments = report.stateRootAssignments.length;
report.totals.stateMutatingCalls = report.stateMutatingCalls.length;
report.totals.stateDeletes = report.stateDeletes.length;
report.totals.globalAssignments = report.globalAssignments.length;
report.totals.moduleExports = report.moduleExports.length;
report.totals.compatibilityWrappers = report.compatibilityWrappers.length;

const html = read("index.html");
report.scriptOrder = [...html.matchAll(/<script\s+defer(?:="")?\s+src="([^"]+)"><\/script>/g)].map(match => match[1]);
report.appShell = [...read("service-worker.js").matchAll(/"(\.\/[^"\n]+)"/g)].map(match => match[1]);

process.stdout.write(JSON.stringify(report, null, 2) + "\n");
