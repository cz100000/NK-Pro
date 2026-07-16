"use strict";
const path=require("node:path");
const {test,expect}=require("@playwright/test");
const {root,attachRuntimeGuards,openFreshApp}=require("./test-helpers.cjs");

const EXPECTED_LABELS=[
  "Objektdaten","Wohnungen","Zähler","Mietverhältnisse",
  "Übersicht","Mietverhältnisse","Vorauszahlungen","Gesamtkosten",
  "Individuelle Werte","Abrechnungsergebnis","Prüfung & Freigabe","Briefe",
  "Archivübersicht"
];

test.describe.configure({mode:"serial"});

async function openEditableBilling(page,tab="manuellewerte"){
  await page.evaluate(target=>{
    state.meta=state.meta||{};
    state.meta.currentBillingCreatedByUser=true;
    state.meta.currentBillingCreatedAt=state.meta.currentBillingCreatedAt||new Date().toISOString();
    renderAll({forceAll:true,reason:"ap21b1-navigation"});
    openCurrentBillingForEdit();
    switchToTab(target);
  },tab);
}

test("AP21B1 rendert die Referenznavigation bei 256 px und erzeugt den Prüfscreenshot",async({page})=>{
  const runtime=attachRuntimeGuards(page);
  await page.setViewportSize({width:1440,height:954});
  await openFreshApp(page);
  await openEditableBilling(page);

  const sidebar=page.locator("#appSidebar");
  await expect(sidebar).toBeVisible();
  const box=await sidebar.boundingBox();
  expect(Math.round(box.width)).toBe(256);
  await expect(page.locator(".workflow-nav > .nav-group")).toHaveCount(3);
  expect((await page.locator(".workflow-nav .nav-item-label").allTextContents()).map(label=>label.trim())).toEqual(EXPECTED_LABELS);
  await expect(page.locator('.workflow-nav .tab-btn.active[data-tab="manuellewerte"]')).toHaveText(/Individuelle Werte/);

  const styles=await page.locator('.workflow-nav .tab-btn.active[data-tab="manuellewerte"]').evaluate(node=>{
    const computed=getComputedStyle(node);
    return {backgroundImage:computed.backgroundImage,borderLeftColor:computed.borderLeftColor,color:computed.color,fontWeight:computed.fontWeight};
  });
  expect(styles.backgroundImage).toContain("linear-gradient");
  expect(Number(styles.fontWeight)).toBeGreaterThanOrEqual(700);

  await sidebar.screenshot({path:path.join(root,"test-results","artifacts","AP21B1_Navigation_Referenz_256px.png")});
  runtime.assertClean();
});

test("AP21B1 erhält unabhängige Klappbereiche sowie schwächeren Hover- und sichtbaren Fokuszustand",async({page})=>{
  const runtime=attachRuntimeGuards(page);
  await openFreshApp(page);
  await openEditableBilling(page);

  const toggles=page.locator(".nav-group-toggle[data-nav-toggle]");
  await expect(toggles).toHaveCount(3);
  for(let index=0;index<3;index+=1) await expect(toggles.nth(index)).toHaveAttribute("aria-expanded","true");

  await toggles.nth(2).click();
  await expect(toggles.nth(2)).toHaveAttribute("aria-expanded","false");
  await expect(page.locator("#nav-group-archive")).toBeHidden();
  await expect(toggles.nth(0)).toHaveAttribute("aria-expanded","true");
  await expect(toggles.nth(1)).toHaveAttribute("aria-expanded","true");
  await toggles.nth(2).click();
  await expect(page.locator("#nav-group-archive")).toBeVisible();

  const inactive=page.locator('.workflow-nav .tab-btn[data-tab="umlage"]');
  await inactive.hover();
  const comparison=await page.evaluate(()=>{
    const active=getComputedStyle(document.querySelector('.workflow-nav .tab-btn.active[data-tab="manuellewerte"]'));
    const hovered=getComputedStyle(document.querySelector('.workflow-nav .tab-btn[data-tab="umlage"]'));
    return {
      activeBackground:active.backgroundImage,
      activeBorder:active.borderTopWidth,
      hoverBackground:hovered.backgroundColor,
      hoverBorder:hovered.borderTopWidth
    };
  });
  expect(comparison.activeBackground).toContain("linear-gradient");
  expect(comparison.hoverBackground).toBe("rgb(246, 249, 253)");
  expect(comparison.activeBorder).toBe("1px");
  expect(comparison.hoverBorder).toBe("0px");

  await toggles.nth(1).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  const focus=await toggles.nth(1).evaluate(node=>{
    const computed=getComputedStyle(node);
    return {active:document.activeElement===node,visible:node.matches(":focus-visible"),outlineStyle:computed.outlineStyle,outlineWidth:computed.outlineWidth};
  });
  expect(focus.active).toBe(true);
  expect(focus.visible).toBe(true);
  expect(focus.outlineStyle).toBe("solid");
  expect(Number.parseFloat(focus.outlineWidth)).toBeGreaterThanOrEqual(2);
  runtime.assertClean();
});

test("Logo und runder Zurück-Button öffnen ausschließlich die Arbeitsweiche",async({page})=>{
  const runtime=attachRuntimeGuards(page);
  await openFreshApp(page);

  await page.locator("#landing .landing-choice").nth(0).click();
  await expect(page.locator("#objektuebersicht")).toHaveClass(/active/);
  await page.locator(".sidebar-brand-home").click();
  await expect(page.locator("#landing")).toHaveClass(/active/);

  await page.locator("#landing .landing-choice").nth(1).click();
  await expect(page.locator("#start")).toHaveClass(/active/);
  await page.locator("#sidebarCollapseTop").click();
  await expect(page.locator("#landing")).toHaveClass(/active/);
  await expect(page.locator('.workflow-nav .tab-btn[data-tab="landing"]')).toHaveCount(0);
  runtime.assertClean();
});

test("Responsive Overlay schließt per Escape und Außenklick",async({page})=>{
  const runtime=attachRuntimeGuards(page);
  await page.setViewportSize({width:800,height:900});
  await openFreshApp(page);

  const toggle=page.locator("#sidebarToggle");
  await toggle.click();
  await expect(page.locator("body")).toHaveClass(/sidebar-open/);
  await expect(page.locator("#appSidebar")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveClass(/sidebar-open/);
  await expect(toggle).toBeFocused();

  await toggle.click();
  await expect(page.locator("body")).toHaveClass(/sidebar-open/);
  await page.mouse.click(700,450);
  await expect(page.locator("body")).not.toHaveClass(/sidebar-open/);
  runtime.assertClean();
});

test("Seitenschlüssel, Direkteinstiege und interne Navigationsdiagnose bleiben kompatibel",async({page})=>{
  const runtime=attachRuntimeGuards(page);
  await openFreshApp(page);
  await openEditableBilling(page,"start");

  for(const tab of ["objektuebersicht","vorauszahlungsanpassung","export","sicherung"]){
    await page.evaluate(id=>switchToTab(id),tab);
    await expect(page.locator(`#${tab}`)).toHaveClass(/active/);
    await expect(page.locator("section.tab.active")).toHaveCount(1);
  }
  await page.evaluate(()=>switchToTab("archiv"));
  await expect(page.locator('#nav-group-archive [data-tab="archiv"]')).toHaveClass(/active/);
  await expect(page.locator('[data-nav-toggle="group-archive"]')).toHaveAttribute("aria-expanded","true");

  const diagnostic=await page.evaluate(()=>{
    const release=window.NKProDiagnostics.releaseAuditReport();
    const self=window.NKProDiagnostics.appSelfTestReport();
    return {
      releaseErrors:release.summary.errors,
      technicalErrors:self.rows.filter(row=>row.severity==="Fehler"&&row.area!=="Qualität").map(row=>({area:row.area,check:row.check,detail:row.detail})),
      renderErrors:JSON.parse(JSON.stringify(renderErrors||[]))
    };
  });
  expect(diagnostic.releaseErrors).toBe(0);
  expect(diagnostic.technicalErrors).toEqual([]);
  expect(diagnostic.renderErrors).toEqual([]);
  runtime.assertClean();
});
