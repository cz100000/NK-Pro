"use strict";
const { test, expect }=require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixture }=require("./test-helpers.cjs");
test.describe.configure({mode:"serial"});
async function openObjectData(page,mutate){
  await openFreshApp(page);await loadFixture(page,"standardfall.json");
  await page.evaluate(source=>{if(source)(0,eval)(`(${source})`)();switchToTab("objekt");renderObjectDataPage();},mutate?mutate.toString():"");
  await expect(page.locator("#objekt")).toHaveClass(/active/);
  await expect(page.locator('[data-object-data-view]')).toBeVisible();
}
async function stateDigest(page){return page.evaluate(()=>JSON.stringify({objektStandard:state.objektStandard,wohnungen:state.wohnungen,mieter:state.mieter,zaehlerDaten:state.zaehlerDaten}));}
test("vollständiger Zustand ist rein lesend und besitzt keine künstliche Primäraktion",async({page})=>{
 const runtime=attachRuntimeGuards(page);await openObjectData(page);
 await expect(page.locator("#objekt h1:visible")).toHaveCount(1);await expect(page.locator("#objekt h2:visible")).toHaveCount(3);
 await expect(page.locator('[data-object-data-identity]')).toContainText("OBJ-001");await expect(page.locator('[data-object-data-identity]')).toContainText("GEB-001");
 await expect(page.locator('[data-object-data-status]')).toContainText("Keine Aktion erforderlich");await expect(page.locator('[data-object-data-primary]')).toHaveCount(0);
 await expect(page.locator('#objekt [data-page-save],#objekt input,#objekt select,#objekt textarea,#objekt [contenteditable="true"]')).toHaveCount(0);
 await expect(page.locator('#objekt [data-object-data-route]')).toHaveCount(4);await expect(page.locator('#objekt')).not.toContainText(/Kostenarten|Umlageschlüssel|Vorauszahlungen|Abrechnungsbereitschaft/);
 runtime.assertClean();
});
test("bestehende Validatorfehler bleiben vollständig und erzeugen genau eine priorisierte Weiterleitung",async({page})=>{
 const runtime=attachRuntimeGuards(page);await openObjectData(page,()=>{state.objektStandard.einheiten[0].gebaeudeId="GEB-UNBEKANNT";state.objektStandard.vertraege[0].einheitId="EINHEIT-UNBEKANNT";});
 await expect(page.locator('[data-object-data-issues] li')).toHaveCount(2);await expect(page.locator('[data-object-data-issues]')).toContainText("UNIT_BUILDING_UNKNOWN");await expect(page.locator('[data-object-data-issues]')).toContainText("CONTRACT_UNIT_UNKNOWN");
 const primary=page.locator('[data-object-data-primary]');await expect(primary).toHaveCount(1);await expect(primary).toHaveAttribute("data-target","wohnungsverwaltung");await expect(primary).toContainText("Wohnungen öffnen");
 const before=await stateDigest(page);await primary.click();await expect(page.locator("#wohnungsverwaltung")).toHaveClass(/active/);expect(await stateDigest(page)).toBe(before);
 runtime.assertClean();
});
test("technische Objektfehler und unbekannte Codes führen zur Systemdiagnose",async({page})=>{
 const runtime=attachRuntimeGuards(page);await openObjectData(page,()=>{state.objektStandard.objekt.id="";state.objektStandard.objekt.objektId="";});
 await expect(page.locator('[data-object-data-primary]')).toHaveAttribute("data-target","sicherung");
 const fallback=await page.evaluate(()=>objectDataIssueRoute("UNKNOWN_TECHNICAL_CODE"));expect(fallback.target).toBe("sicherung");expect(fallback.label).toBe("Systemdiagnose öffnen");runtime.assertClean();
});
test("Nur-Ansehen-Kontext erzeugt keinen redundanten lokalen Schreibschutzhinweis",async({page})=>{
 const runtime=attachRuntimeGuards(page);await openFreshApp(page);await page.evaluate(()=>switchToTab("start"));await page.locator('#startArchiveTable .current-record-row [data-ui-action="billing.openCurrentView"]').click();
 await page.evaluate(()=>switchToTab("objekt"));await expect(page.locator("#objekt")).toHaveClass(/active/);await expect(page.locator('#objekt .billing-readonly-notice,#objekt [data-page-readonly],#objekt [data-ui-action="billing.switchToEdit"]')).toHaveCount(0);
 await expect(page.locator('#objekt [data-page-save],#objekt input,#objekt select,#objekt textarea')).toHaveCount(0);await expect(page.locator('[data-object-data-identity]')).toBeVisible();await expect(page.locator('[data-global-billing-context]')).not.toContainText(/Modus\s*:/i);runtime.assertClean();
});
for(const viewport of [{width:1440,height:1000},{width:900,height:700},{width:620,height:800},{width:390,height:844}])test(`responsive Ansicht ohne horizontalen Überlauf bei ${viewport.width}x${viewport.height}`,async({page})=>{
 const runtime=attachRuntimeGuards(page);await page.setViewportSize(viewport);await openObjectData(page,()=>{state.objektStandard.einheiten[0].gebaeudeId="GEB-UNBEKANNT";});
 const layout=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,body:document.body.scrollWidth,order:[...document.querySelectorAll('#objekt [data-object-data-identity],#objekt [data-object-data-integrity],#objekt [data-object-data-routes]')].map(node=>node.hasAttribute('data-object-data-identity')?'identity':node.hasAttribute('data-object-data-integrity')?'integrity':'routes')}));
 expect(layout.doc).toBeLessThanOrEqual(layout.client);expect(layout.body).toBeLessThanOrEqual(layout.client);expect(layout.order).toEqual(["identity","integrity","routes"]);await expect(page.locator('[data-object-data-primary]')).toBeVisible();runtime.assertClean();
});
test("Fokusreihenfolge enthält nur reale Aktionen und sichtbaren Fokus",async({page})=>{
 const runtime=attachRuntimeGuards(page);await openObjectData(page);
 await expect(page.locator('#objekt [tabindex],#objekt [data-object-data-identity] button,#objekt [data-object-data-integrity] button')).toHaveCount(0);
 const overview=page.locator('[data-object-data-overview]');await overview.focus();await expect(overview).toBeFocused();const focus=await overview.evaluate(node=>({outline:getComputedStyle(node).outlineStyle,shadow:getComputedStyle(node).boxShadow}));expect(focus.outline!=="none"||focus.shadow!=="none").toBe(true);
 for(const target of ["wohnungsverwaltung","mieterverwaltung","wasser","sicherung"]){await page.keyboard.press("Tab");await expect(page.locator(`[data-object-data-route="${target}"]`)).toBeFocused();}
 runtime.assertClean();
});
