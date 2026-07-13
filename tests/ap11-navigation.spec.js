"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { root, attachRuntimeGuards, openFreshApp } = require("./test-helpers.cjs");

test.describe.configure({ mode: "serial" });

async function createActiveBilling(page, target = "objekt") {
  await page.evaluate(tabId => {
    state.meta = state.meta || {};
    state.meta.currentBillingCreatedByUser = true;
    state.meta.currentBillingCreatedAt = state.meta.currentBillingCreatedAt || new Date().toISOString();
    renderAll({ forceAll:true, reason:"ap11-navigation-test" });
    switchToTab(tabId);
  }, target);
}

test("AP11-Navigation bildet Zielstruktur, Icons und Zustände vollständig ab", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  await expect(page.locator("nav.workflow-nav")).toHaveCount(1);
  await expect(page.locator(".workflow-nav > .nav-group")).toHaveCount(4);
  await expect(page.locator(".workflow-nav .tab-btn[data-tab]")).toHaveCount(19);
  const uniqueTabs = await page.locator(".workflow-nav .tab-btn[data-tab]").evaluateAll(nodes => [...new Set(nodes.map(node => node.dataset.tab))]);
  expect(uniqueTabs).toHaveLength(19);

  const objectLabels = await page.locator('#nav-group-object > .nav-group-item .nav-item-label').allTextContents();
  expect(objectLabels.map(value => value.trim())).toEqual(["Übersicht", "Objektdaten", "Wohnungen", "Zähler", "Mieter"]);
  const billingLabels = await page.locator('#nav-group-billing > .nav-group-item .nav-item-label').allTextContents();
  expect(billingLabels.map(value => value.trim())).toEqual(["Abrechnungsübersicht", "Mieter & Wohnungen", "Miete & Vorauszahlungen", "Kosten erfassen", "Manuelle & externe Werte", "Verbräuche erfassen", "Verteilung", "Prüfung", "Neue Vorauszahlungen", "Briefe", "Export"]);
  await expect(page.locator("#nav-group-billing .nav-subsection")).toHaveCount(0);
  await expect(page.locator("#nav-group-billing .nav-group-item--secondary")).toHaveCount(0);

  const icons = page.locator("#appSidebar .nav-icon-svg");
  expect(await icons.count()).toBeGreaterThanOrEqual(22);
  const iconStyles = await icons.evaluateAll(nodes => nodes.map(node => ({ fill:node.getAttribute("fill"), viewBox:node.getAttribute("viewBox") })));
  expect(iconStyles.every(icon => icon.fill === "none" && icon.viewBox === "0 0 24 24")).toBeTruthy();

  await expect(page.locator(".sidebar-brand-title")).toHaveText("NK-Pro");
  await expect(page.locator(".sidebar-brand-subtitle")).toHaveText("Nebenkostenabrechnung");
  const start = page.locator(".nav-start-link");
  await expect(start).toHaveText(/Start/);
  await expect(start).toHaveAttribute("data-tab", "landing");
  await expect(start).toHaveAttribute("title", "Zur Startseite");
  await expect(start).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".sidebar-brand-home")).not.toHaveAttribute("aria-current", "page");
  const separator = await page.locator(".nav-start-entry").evaluate(node => ({ width:getComputedStyle(node).borderBottomWidth, color:getComputedStyle(node).borderBottomColor }));
  expect(parseFloat(separator.width)).toBeGreaterThan(0);
  expect(separator.color).not.toBe("rgba(0, 0, 0, 0)");
  runtime.assertClean();
});

test("Aktiver Zustand bleibt eindeutig, sichtbar und semantisch korrekt", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await createActiveBilling(page, "einstellungen");

  const active = page.locator(".workflow-nav .tab-btn.active");
  await expect(active).toHaveCount(1);
  await expect(active).toHaveAttribute("data-tab", "einstellungen");
  await expect(active).toHaveAttribute("aria-current", "page");
  await expect(page.locator('[data-nav-toggle="group-billing"]')).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".sidebar-brand-home")).not.toHaveAttribute("aria-current", "page");

  const visual = await active.evaluate(node => {
    const style = getComputedStyle(node);
    const marker = getComputedStyle(node.querySelector(".nav-active-marker"));
    return { background:style.backgroundColor, weight:style.fontWeight, markerWidth:marker.width, markerColor:marker.backgroundColor };
  });
  expect(visual.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(Number.parseInt(visual.weight, 10)).toBeGreaterThanOrEqual(600);
  expect(Number.parseFloat(visual.markerWidth)).toBeGreaterThanOrEqual(4);
  expect(visual.markerColor).not.toBe("rgba(0, 0, 0, 0)");

  await page.evaluate(() => switchToTab("objekt"));
  await expect(page.locator(".workflow-nav .tab-btn.active")).toHaveCount(1);
  await expect(page.locator('[data-tab="objekt"]')).toHaveAttribute("aria-current", "page");
  await expect(page.locator('[data-nav-toggle="group-object"]')).toHaveAttribute("aria-expanded", "true");
  await page.locator(".nav-start-link").click();
  await expect(page.locator("#landing")).toHaveClass(/active/);
  await expect(page.locator(".nav-start-link")).toHaveClass(/active/);
  await expect(page.locator(".nav-start-link")).toHaveAttribute("aria-current", "page");
  runtime.assertClean();
});

test("Einstellungen-Dummy ist sichtbar, fokussierbar und vollständig zustandsneutral", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const settings = page.locator(".sidebar-settings-dummy");
  await expect(settings).toBeVisible();
  await expect(settings).toHaveAttribute("aria-disabled", "true");
  await expect(settings).toHaveAttribute("data-nav-hint", "Noch nicht verfügbar");
  await expect(settings).not.toHaveAttribute("data-ui-action", /.+/);

  const before = await page.evaluate(() => ({
    state:JSON.stringify(state),
    active:document.querySelector("section.tab.active")?.id,
    storage:localStorage.__entries ? JSON.stringify(localStorage.__entries()) : ""
  }));
  await settings.focus();
  const focus = await settings.evaluate(node => {
    const style = getComputedStyle(node);
    const tooltip = getComputedStyle(node, "::after");
    return { outline:style.outlineStyle, content:tooltip.content, opacity:tooltip.opacity };
  });
  expect(focus.outline).not.toBe("none");
  expect(focus.content).toContain("Noch nicht verfügbar");
  expect(Number(focus.opacity)).toBeGreaterThan(0);
  await page.keyboard.press("Enter");
  const after = await page.evaluate(() => ({
    state:JSON.stringify(state),
    active:document.querySelector("section.tab.active")?.id,
    storage:localStorage.__entries ? JSON.stringify(localStorage.__entries()) : ""
  }));
  expect(after).toEqual(before);
  runtime.assertClean();
});

test("Tastatur, geringe Höhe und schmale Fenster bleiben vollständig bedienbar", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await page.setViewportSize({ width:1280, height:720 });
  await openFreshApp(page);
  await createActiveBilling(page, "einstellungen");

  const archiveToggle = page.locator('[data-nav-toggle="group-archive"]');
  await archiveToggle.focus();
  await page.keyboard.press("Enter");
  await expect(archiveToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#nav-group-archive")).toBeVisible();
  const focusStyle = await archiveToggle.evaluate(node => getComputedStyle(node).outlineStyle);
  expect(focusStyle).not.toBe("none");

  await page.evaluate(() => NKProNavigation.setGroupExpanded("group-billing", true));
  const heightMetrics = await page.evaluate(() => {
    const nav = document.querySelector(".workflow-nav");
    const footer = document.querySelector(".sidebar-footer-zone");
    nav.scrollTop = nav.scrollHeight;
    const last = nav.querySelector('#nav-group-billing .nav-group-item:last-child');
    return {
      scrollable:nav.scrollHeight > nav.clientHeight,
      navBottom:nav.getBoundingClientRect().bottom,
      footerTop:footer.getBoundingClientRect().top,
      lastBottom:last.getBoundingClientRect().bottom,
      navTop:nav.getBoundingClientRect().top
    };
  });
  expect(heightMetrics.scrollable).toBeTruthy();
  expect(heightMetrics.navBottom).toBeLessThanOrEqual(heightMetrics.footerTop + 1);
  expect(heightMetrics.lastBottom).toBeLessThanOrEqual(heightMetrics.navBottom + 1);
  expect(heightMetrics.lastBottom).toBeGreaterThan(heightMetrics.navTop);

  await page.setViewportSize({ width:900, height:720 });
  await expect(page.locator("#appSidebar")).not.toBeInViewport();
  await page.locator("#sidebarToggle").click();
  await expect(page.locator("#appSidebar")).toBeInViewport();
  await page.waitForTimeout(260);
  const narrow = await page.evaluate(() => {
    const sidebar = document.querySelector("#appSidebar").getBoundingClientRect();
    return { left:sidebar.left, right:sidebar.right, viewport:innerWidth, bodyWidth:document.documentElement.scrollWidth };
  });
  expect(narrow.left).toBeGreaterThanOrEqual(0);
  expect(narrow.right).toBeLessThanOrEqual(narrow.viewport + 1);
  expect(narrow.bodyWidth).toBeLessThanOrEqual(narrow.viewport + 1);
  runtime.assertClean();
});

test("Navigation bleibt bei definierten Desktopgrößen und Zoomsimulation stabil", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await createActiveBilling(page, "objekt");
  const sizes = [
    { width:1920, height:1080 }, { width:1600, height:900 },
    { width:1366, height:768 }, { width:1280, height:720 }
  ];
  for (const size of sizes) {
    await page.setViewportSize(size);
    const metrics = await page.evaluate(() => {
      const sidebar = document.querySelector("#appSidebar").getBoundingClientRect();
      const panel = document.querySelector(".sidebar-panel").getBoundingClientRect();
      return {
        sidebarWidth:sidebar.width,
        panelLeft:panel.left,
        panelRight:panel.right,
        clipped:[...document.querySelectorAll(".nav-item-label")].some(node => node.scrollWidth > node.clientWidth + 1),
        horizontal:document.documentElement.scrollWidth > innerWidth + 1
      };
    });
    expect(metrics.sidebarWidth).toBeGreaterThanOrEqual(285);
    expect(metrics.sidebarWidth).toBeLessThanOrEqual(317);
    expect(metrics.panelLeft).toBeGreaterThanOrEqual(7);
    expect(metrics.panelRight).toBeLessThanOrEqual(metrics.sidebarWidth - 7 + 1);
    expect(metrics.clipped).toBeFalsy();
    expect(metrics.horizontal).toBeFalsy();
  }
  for (const zoom of [0.8, 1, 1.25, 1.5]) {
    const stable = await page.evaluate(value => {
      document.querySelector("#appSidebar").style.zoom = String(value);
      const labels = [...document.querySelectorAll("#appSidebar .nav-item-label")].filter(node => node.getClientRects().length > 0);
      return {
        clipped:labels.some(node => node.scrollWidth > node.clientWidth + 1),
        finite:labels.length > 0 && labels.every(node => Number.isFinite(node.getBoundingClientRect().width) && node.getBoundingClientRect().width > 0)
      };
    }, zoom);
    expect(stable.clipped).toBeFalsy();
    expect(stable.finite).toBeTruthy();
  }
  await page.evaluate(() => { document.querySelector("#appSidebar").style.zoom = ""; });
  runtime.assertClean();
});

test("Visuelle AP11-Referenzen werden bei angeforderter Erfassung erzeugt", async ({ page }) => {
  test.skip(process.env.AP11_CAPTURE !== "1", "Nur für den dokumentierten visuellen Freigabelauf.");
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await createActiveBilling(page, "objekt");
  const output = path.join(root, "AP11_VISUAL_REFERENCES");
  fs.mkdirSync(output, { recursive:true });
  const captures = [
    [1920,1080,"navigation-1920x1080.png"],
    [1600,900,"navigation-1600x900.png"],
    [1366,768,"navigation-1366x768.png"],
    [1280,720,"navigation-1280x720.png"]
  ];
  for (const [width,height,name] of captures) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => { document.querySelector("#appSidebar").style.zoom = ""; });
    await page.screenshot({ path:path.join(output,name), fullPage:false });
  }
  await page.setViewportSize({ width:900, height:720 });
  await page.locator("#sidebarToggle").click();
  await page.screenshot({ path:path.join(output,"navigation-schmal-900x720.png"), fullPage:false });
  await page.setViewportSize({ width:1366, height:768 });
  await page.evaluate(() => { document.body.classList.remove("sidebar-open"); document.querySelector("#appSidebar").style.zoom = "1.5"; });
  await page.screenshot({ path:path.join(output,"navigation-zoom-150.png"), fullPage:false });
  await page.evaluate(() => { document.querySelector("#appSidebar").style.zoom = ""; });
  runtime.assertClean();
});
