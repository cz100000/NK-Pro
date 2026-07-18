"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "assets", "app.css"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

assert.match(css, /AP22F7B Korrektur 2:[\s\S]*vollständigen rechten Tabellenabschluss/);
assert.match(css, /body:not\(\.document-print-window\) \.nk-ui-table-wrap\s*\{[\s\S]*display:grid;[\s\S]*grid-template-columns:minmax\(100%,max-content\);/);
assert.match(css, /body:not\(\.document-print-window\) \.nk-ui-table\s*\{[\s\S]*width:100%;[\s\S]*min-width:0;/);

const tableTags = [...html.matchAll(/<table\b[^>]*class="([^"]*\bnk-ui-table\b[^"]*)"[^>]*>/g)];
assert.equal(tableTags.length, 19, "Alle 19 produktiven Standardtabellen müssen erfasst bleiben.");

const wrapperCount = (html.match(/\bnk-ui-table-wrap\b/g) || []).length;
assert.ok(wrapperCount >= tableTags.length, "Jede produktive Tabelle benötigt einen Standard-Scrollcontainer.");

console.log("AP22F7B Korrektur 2 Tabellenbreite statisch: PASS");
