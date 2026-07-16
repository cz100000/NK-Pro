"use strict";
const {test,expect}=require("@playwright/test");
const {attachRuntimeGuards,openFreshApp}=require("./test-helpers.cjs");

const EXPECTED_TABS=["objekt","wohnungsverwaltung","wasser","mieterverwaltung","start","mieter","einnahmen","einstellungen","manuellewerte","umlage","qualitaet","briefe","archiv"];

test.describe.configure({mode:"serial"});

test("AP21B2 rendert Navigation ausschließlich aus der zentralen Definition",async({page})=>{
  const runtime=attachRuntimeGuards(page);
  await openFreshApp(page);
  const result=await page.evaluate(()=>({
    definition:window.NKProNavigation.navigationDefinition().map(group=>({key:group.key,tabs:group.items.map(item=>item.tab)})),
    apiTabs:window.NKProNavigation.visibleTabIds(),
    domTabs:Array.from(document.querySelectorAll(".workflow-nav .tab-btn[data-tab]"),button=>button.dataset.tab),
    roots:document.querySelectorAll("[data-navigation-render-root]").length
  }));
  expect(result.roots).toBe(1);
  expect(result.definition.map(group=>group.key)).toEqual(["object","billing","archive"]);
  expect(result.apiTabs).toEqual(EXPECTED_TABS);
  expect(result.domTabs).toEqual(EXPECTED_TABS);
  runtime.assertClean();
});

test("AP21B2 erhält dynamische Aktionen, Accordion-Zustand und Direkteinstiege",async({page})=>{
  const runtime=attachRuntimeGuards(page);
  await openFreshApp(page);
  await expect(page.locator('.workflow-nav [data-ui-action="navigation.switchTab"]')).toHaveCount(13);
  await page.locator('[data-tab="objekt"]').click();
  await expect(page.locator("#objekt")).toHaveClass(/active/);
  await page.locator('[data-nav-toggle="group-object"]').click();
  await expect(page.locator("#nav-group-object")).toBeHidden();
  await page.evaluate(()=>switchToTab("objektuebersicht"));
  await expect(page.locator("#objektuebersicht")).toHaveClass(/active/);
  await expect(page.locator('[data-nav-toggle="group-object"]')).toHaveAttribute("aria-expanded","true");
  runtime.assertClean();
});

test("AP21B2-Diagnose vergleicht DOM und zentrale Definition ohne technische Fehler",async({page})=>{
  const runtime=attachRuntimeGuards(page);
  await openFreshApp(page);
  const report=await page.evaluate(()=>window.NKProDiagnostics.appSelfTestReport());
  const technicalErrors=report.rows.filter(row=>row.severity==="Fehler"&&row.area!=="Qualität");
  expect(technicalErrors).toEqual([]);
  runtime.assertClean();
});
