"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const css = read("assets/app.css");
const navigation = read("js/navigation.js");
const designSystem = read("js/ui-design-system.js");

function count(source, pattern) { return (source.match(pattern) || []).length; }
function fragmentBetween(source, start, end) {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `Startmarke fehlt: ${start}`);
  const to = source.indexOf(end, from);
  assert.notEqual(to, -1, `Endmarke fehlt: ${end}`);
  return source.slice(from, to);
}

assert.equal(count(html, /<header class="workspace-header"/g), 1, "genau eine globale Kopf-/Werkzeugleiste");
assert.equal(count(html, /data-global-billing-context=/g), 1, "genau eine produktive Kontextleiste");
const context = fragmentBetween(html, '<section aria-label="Abrechnungskontext"', '</section>');
assert.match(context, /data-global-billing-object/);
assert.match(context, /data-global-billing-period/);
assert.match(context, /data-global-billing-status/);
assert.ok(context.indexOf("data-global-billing-object") < context.indexOf("data-global-billing-period"));
assert.ok(context.indexOf("data-global-billing-period") < context.indexOf("data-global-billing-status"));
assert.doesNotMatch(context, /data-global-billing-(?:year|mode)/i);
assert.doesNotMatch(context, /Modus\s*:/i);
assert.doesNotMatch(context, /<d[lt]\b/i, "Kontextleiste ist keine Definitionsliste");
assert.match(context, /nk-ui-context-bar/);

assert.equal(count(html, /data-page-shell=/g), 18, "18 sichtbare Ansichten besitzen eine Schale");
assert.equal(count(html, /data-page-header=/g), 18, "18 sichtbare Ansichten besitzen einen zentralen Seitenkopf");
assert.equal(count(html, /<h1\b[^>]*class="[^"]*page-header__title/g), 18, "18 sichtbare H1-Seitentitel");
assert.doesNotMatch(fragmentBetween(html, '<header class="workspace-header"', '</header>'), /<h[1-6]\b/i, "globaler Kopf enthält keinen Seitentitel");

for (const token of [
  "--nk-ui-shell-max-narrow:760px",
  "--nk-ui-shell-max-default:1180px",
  "--nk-ui-shell-max-wide:1440px",
  "--nk-ui-shell-inline:32px"
]) assert.ok(css.includes(token), `CSS-Token fehlt: ${token}`);
assert.match(css, /@media \(max-width:1280px\)[\s\S]*--nk-ui-shell-inline:24px/);
assert.match(css, /@media \(max-width:900px\)/);
assert.match(css, /@media \(max-width:620px\)[\s\S]*--nk-ui-shell-inline:16px/);
assert.match(css, /\.nk-ui-page-header[\s\S]*grid-template-columns/);
assert.match(css, /\.global-billing-context\.nk-ui-context-bar/);
assert.doesNotMatch(css, /global-billing-context__mode/);

assert.match(navigation, /billingPeriodLabel/);
assert.doesNotMatch(navigation.slice(navigation.indexOf("function updateWorkflowNavigationContext"), navigation.indexOf("function setSidebarCollapsed")), /global-billing-mode|Modus/);
assert.match(designSystem, /contextBar/);
const referenceHtml = read("ui-reference/index.html");
assert.match(referenceHtml, /AP22F1A/);
assert.doesNotMatch(referenceHtml, /<b>Modus:<\/b>|Modus:\s*(?:Nur ansehen|Bearbeiten|Korrektur)/i);
assert.match(referenceHtml, /Die gelbe Abrechnungskontextleiste zeigt Objekt, vollständigen Zeitraum und Status, jedoch keine Modusangabe/);
const listSelector = designSystem.match(/const LIST_SELECTOR\s*=\s*([^;]+);/);
assert.ok(listSelector, "LIST_SELECTOR fehlt");
assert.doesNotMatch(listSelector[1], /global-billing-context__facts/, "Kontextleiste darf nicht als generische Liste registriert sein");

console.log("AP22F1A global shell static checks: PASS");
