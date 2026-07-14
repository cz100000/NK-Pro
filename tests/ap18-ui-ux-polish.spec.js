"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixture } = require("./test-helpers.cjs");

async function openLetterPreview(page) {
  await loadFixture(page, "standardfall.json");
  await page.evaluate(() => {
    switchToTab("briefe");
    renderBrief();
  });
  await page.waitForTimeout(25);
  await page.evaluate(() => {
    const section = document.getElementById("lettersEditorSection");
    if (section) section.open = true;
    requestAnimationFrame(applyBriefPreviewScale);
  });
  await page.waitForFunction(() => {
    const preview = document.getElementById("briefPreview");
    return preview && preview.dataset.previewScale && preview.shadowRoot && preview.shadowRoot.querySelector(".letter-sheet");
  });
}

async function previewMetrics(page) {
  return page.evaluate(() => {
    const preview = document.getElementById("briefPreview");
    const viewport = document.getElementById("briefPreviewViewport");
    const root = preview.shadowRoot || preview;
    const sheet = root.querySelector(".letter-sheet");
    const scale = Number(preview.dataset.previewScale);
    const viewportStyle = getComputedStyle(viewport);
    return {
      mode: preview.dataset.previewMode,
      scale,
      label: document.getElementById("briefZoomValue").textContent.trim(),
      viewportWidth: viewport.clientWidth - parseFloat(viewportStyle.paddingLeft) - parseFloat(viewportStyle.paddingRight),
      viewportHeight: viewport.clientHeight - parseFloat(viewportStyle.paddingTop) - parseFloat(viewportStyle.paddingBottom),
      pageWidth: sheet ? sheet.getBoundingClientRect().width : 0,
      pageHeight: sheet ? sheet.getBoundingClientRect().height : 0,
      scrollWidth: viewport.scrollWidth,
      clientWidth: viewport.clientWidth
    };
  });
}

test("AP18-Marke, globaler Start und Fokuszustände sind vollständig eingebunden", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);

  const mark = page.locator(".sidebar-brand-mark");
  await expect(mark).toBeVisible();
  expect(await mark.evaluate(node => ({ width:node.naturalWidth, height:node.naturalHeight }))).toEqual({ width:96, height:96 });

  const start = page.locator(".nav-start-link");
  await expect(start).toBeVisible();
  await start.focus();
  const focused = await start.evaluate(node => {
    const style = getComputedStyle(node);
    return { outline:style.outlineStyle, width:node.getBoundingClientRect().width, height:node.getBoundingClientRect().height };
  });
  expect(focused.outline).not.toBe("none");
  expect(focused.width).toBeGreaterThan(150);
  expect(focused.height).toBeGreaterThanOrEqual(40);

  await page.evaluate(() => switchToTab("objekt"));
  await start.click();
  await expect(page.locator("#landing")).toHaveClass(/active/);
  await expect(start).toHaveClass(/active/);
  runtime.assertClean();
});

test("Navigationsgruppen bleiben unabhängig klappbar und öffnen aktive Direkteinstiege", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const objectToggle = page.locator('[data-nav-toggle="group-object"]');
  const archiveToggle = page.locator('[data-nav-toggle="group-archive"]');

  await archiveToggle.focus();
  await page.keyboard.press("Enter");
  await expect(archiveToggle).toHaveAttribute("aria-expanded", "true");
  await expect(objectToggle).toHaveAttribute("aria-expanded", "true");

  await objectToggle.click();
  await expect(objectToggle).toHaveAttribute("aria-expanded", "false");
  await expect(archiveToggle).toHaveAttribute("aria-expanded", "true");

  await page.evaluate(() => switchToTab("objekt"));
  await expect(objectToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator('[data-tab="objekt"]')).toHaveClass(/active/);
  runtime.assertClean();
});

test("Briefvorschau startet mit ganzer Seite und unterstützt Zoom, Seitenbreite und Tastatur", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await page.setViewportSize({ width:1440, height:900 });
  await openFreshApp(page);
  await openLetterPreview(page);

  const initial = await previewMetrics(page);
  expect(initial.mode).toBe("page");
  expect(initial.label).toMatch(/^\d+ %$/);
  expect(initial.pageWidth).toBeLessThanOrEqual(initial.viewportWidth + 2);
  expect(initial.pageHeight).toBeLessThanOrEqual(initial.viewportHeight + 2);
  expect(initial.scale).toBeGreaterThanOrEqual(0.4);
  expect(initial.scale).toBeLessThanOrEqual(2);

  const zoomIn = page.locator('[data-ui-action="document.previewZoomIn"]');
  await zoomIn.focus();
  await page.keyboard.press("Enter");
  const custom = await previewMetrics(page);
  expect(custom.mode).toBe("custom");
  expect(custom.scale).toBeGreaterThan(initial.scale);

  await page.getByRole("button", { name:"Seitenbreite" }).click();
  const width = await previewMetrics(page);
  expect(width.mode).toBe("width");
  expect(Math.abs(width.pageWidth - width.viewportWidth)).toBeLessThanOrEqual(5);

  await page.getByRole("button", { name:"Ganze Seite" }).click();
  const pageMode = await previewMetrics(page);
  expect(pageMode.mode).toBe("page");
  expect(pageMode.pageHeight).toBeLessThanOrEqual(pageMode.viewportHeight + 2);
  runtime.assertClean();
});

test("Briefzoom reagiert im Modus Ganze Seite auf Größenänderungen, benutzerdefinierter Zoom bleibt erhalten", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await page.setViewportSize({ width:1440, height:900 });
  await openFreshApp(page);
  await openLetterPreview(page);
  const before = await previewMetrics(page);

  await page.setViewportSize({ width:1180, height:720 });
  await page.waitForTimeout(150);
  const resized = await previewMetrics(page);
  expect(resized.mode).toBe("page");
  expect(Math.abs(resized.scale - before.scale)).toBeGreaterThan(0.01);

  await page.locator('[data-ui-action="document.previewZoomOut"]').click();
  const custom = await previewMetrics(page);
  expect(custom.mode).toBe("custom");
  await page.setViewportSize({ width:1100, height:680 });
  await page.waitForTimeout(150);
  const customResized = await previewMetrics(page);
  expect(customResized.mode).toBe("custom");
  expect(customResized.scale).toBeCloseTo(custom.scale, 4);
  runtime.assertClean();
});

test("Schwarzweißsteuerung bleibt mit Vorschau und Druckquelle synchron", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await openLetterPreview(page);
  const toggle = page.locator("#briefMonochromeToolbar");
  await expect(toggle).not.toBeChecked();
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();
  await expect(page.locator("#briefPreview .nk-letter-document")).toHaveAttribute("data-print-mode", "monochrome");
  expect(await page.evaluate(() => state.briefSettings.schwarzweissOptimiert)).toBe("Ja");
  const parity = await page.evaluate(() => {
    const preview = document.getElementById("briefPreview");
    return {
      source: preview.__nkBriefHtml.includes('data-print-mode="monochrome"'),
      print: printWindowHtml("AP18", preview.__nkBriefHtml, "AP18").includes('data-print-mode="monochrome"')
    };
  });
  expect(parity).toEqual({ source:true, print:true });
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).not.toBeChecked();
  await expect(page.locator("#briefPreview .nk-letter-document")).toHaveAttribute("data-print-mode", "color");
  runtime.assertClean();
});

test("Werkzeuggruppen und Seitenlayout bleiben in schmalen Ansichten vollständig und ohne Gesamtseiten-Scroll", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await page.setViewportSize({ width:1100, height:720 });
  await openFreshApp(page);
  await openLetterPreview(page);
  for (const viewport of [{ width:1100, height:720 }, { width:900, height:700 }, { width:680, height:720 }]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(120);
    const result = await page.evaluate(() => {
      const groups = [...document.querySelectorAll(".brief-toolbar-group")];
      return {
        pageScrollWidth:document.documentElement.scrollWidth,
        pageClientWidth:document.documentElement.clientWidth,
        groups:groups.map(group => ({ visible:group.getBoundingClientRect().width > 0 && group.getBoundingClientRect().height > 0, controls:group.querySelectorAll("button,input").length })),
        viewportVisible:document.getElementById("briefPreviewViewport").getBoundingClientRect().height > 300
      };
    });
    expect(result.pageScrollWidth).toBeLessThanOrEqual(result.pageClientWidth + 1);
    expect(result.groups).toHaveLength(3);
    expect(result.groups.every(group => group.visible && group.controls >= 1)).toBe(true);
    expect(result.viewportVisible).toBe(true);
  }
  runtime.assertClean();
});

test("Manifest- und PWA-Icons sind abrufbar und maskierbare Varianten quadratisch", async ({ page, request }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  const manifest = await page.evaluate(async () => (await fetch("./manifest.webmanifest")).json());
  expect(manifest.version).toBe("99.4.21");
  expect(manifest.icons.some(icon => icon.purpose === "maskable" && icon.sizes === "192x192")).toBe(true);
  expect(manifest.icons.some(icon => icon.purpose === "maskable" && icon.sizes === "512x512")).toBe(true);
  for (const icon of manifest.icons) {
    const response = await request.get(new URL(icon.src, "http://127.0.0.1:4173/").href);
    expect(response.ok(), icon.src).toBe(true);
  }
  runtime.assertClean();
});
