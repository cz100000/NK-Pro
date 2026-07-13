"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function analyze(source, file) {
  const lines = source.split(/\r?\n/);
  const functionMatches = [...source.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)];
  const bindingMatches = [...source.matchAll(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\b/gm)];
  const functionExpressionMatches = [...source.matchAll(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:function\b|(?:\([^\n]*\)|[A-Za-z_$][\w$]*)\s*=>)/gm)];

  const statePath = /\bstate(?:\s*\.\s*[A-Za-z_$][\w$]*|\s*\[[^\]]+\])+/g;
  const statePathSource = String.raw`\bstate(?:\s*\.\s*[A-Za-z_$][\w$]*|\s*\[[^\]]+\])+`;
  const assignment = new RegExp(statePathSource + String.raw`\s*(?:\+\+|--|(?:\+|-|\*|\/|%|\?\?|&&|\|\|)=|(?<![=!<>])=(?!=|>))`);
  const mutator = new RegExp(statePathSource + String.raw`(?:\s*\.\s*[A-Za-z_$][\w$]*)*\s*\.\s*(?:push|pop|shift|unshift|splice|sort|reverse|fill|copyWithin)\s*\(`);
  const deletion = new RegExp(String.raw`\bdelete\s+` + statePathSource);
  const rootAssignment = /\bstate\s*(?<![=!<>])=(?!=|>)/;

  const propertyWriteLines = [];
  const rootWriteLines = [];
  lines.forEach((line, index) => {
    if (assignment.test(line) || mutator.test(line) || deletion.test(line)) propertyWriteLines.push(index + 1);
    if (rootAssignment.test(line)) rootWriteLines.push(index + 1);
  });

  const count = pattern => (source.match(pattern) || []).length;
  return {
    file,
    sha256:crypto.createHash("sha256").update(source).digest("hex"),
    bytes:Buffer.byteLength(source, "utf8"),
    lines:source.endsWith("\n") ? lines.length - 1 : lines.length,
    topLevelFunctionDeclarations:functionMatches.length,
    topLevelFunctionNames:functionMatches.map(match => ({ name:match[1], line:source.slice(0, match.index).split(/\r?\n/).length })),
    topLevelBindings:bindingMatches.length,
    topLevelBindingNames:bindingMatches.map(match => match[1]),
    topLevelFunctionExpressions:functionExpressionMatches.length,
    topLevelFunctionExpressionNames:functionExpressionMatches.map(match => match[1]),
    directStatePathReferences:[...source.matchAll(statePath)].length,
    directStatePropertyWriteSites:propertyWriteLines.length,
    directStateRootReplacementSites:rootWriteLines.length,
    directStateWriteSites:new Set([...propertyWriteLines, ...rootWriteLines]).size,
    directStatePropertyWriteLines:propertyWriteLines,
    directStateRootReplacementLines:rootWriteLines,
    commitCalls:count(/\bcommitStateChange\s*\(/g),
    saveCalls:count(/\bsaveData\s*\(/g),
    renderCalls:count(/\brender[A-Za-z_$][\w$]*\s*\(/g),
    validationCalls:count(/\b(?:validate|validation|finalBillingReadiness|collectQualityChecks)[A-Za-z_$]*\s*\(/g),
    snapshotCalls:count(/\b(?:createYearSnapshot|createSnapshot|createBillingSnapshot|validateBillingSnapshot|createBoundedBillingSnapshotData)\s*\(/g),
    moduleCalls:count(/\bNK_PRO_MODULES\.[A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*\s*\(/g),
    globalAssignments:count(/\b(?:window|globalThis)\.[A-Za-z_$][\w$]*\s*=/g),
    dynamicGlobalAccesses:count(/\b(?:window|globalThis)\s*\[[^\]]+\]/g)
  };
}

const input = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, "..", "js", "app.js");
if (!fs.existsSync(input)) {
  process.stderr.write(`Datei nicht gefunden: ${input}\n`);
  process.exit(1);
}
const source = fs.readFileSync(input, "utf8");
process.stdout.write(JSON.stringify(analyze(source, path.relative(process.cwd(), input) || path.basename(input)), null, 2) + "\n");
