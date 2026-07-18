"use strict";
const assert=require("node:assert/strict");const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8"),costs=fs.readFileSync("js/ui-costs.js","utf8"),bindings=fs.readFileSync("js/ui-bindings.js","utf8");
const section=html.slice(html.indexOf('<section class="tab tenant-pilot-page" id="mieter"'),html.indexOf('<section class="tab" id="einnahmen">'));
assert.equal((section.match(/<details/g)||[]).length,0);assert.match(section,/<h1 class="page-header__title">Mietverhältnisse<\/h1>/);assert.match(section,/id="mieterTable"/);assert.match(section,/id="wohnungenTable"/);assert.ok(section.indexOf('id="mieterTable"')<section.indexOf('id="wohnungenTable"'));
assert.match(costs,/object\.setBillingUnitStatus|setBillingUnitStatus/);assert.match(costs,/visibleTenantRows\(\)/);assert.match(costs,/tenantOpenStatus\(m\)/);assert.match(bindings,/registerController\("billingTenant"/);assert.doesNotMatch(section,/Kennzahlen/);
console.log("AP22F7B static: PASS");
