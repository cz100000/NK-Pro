"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixture } = require("./test-helpers.cjs");

test("Briefdaten und Brief-HTML stammen aus dem zentralen Abrechnungsergebnis und verändern den Arbeitsstand nicht", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "standardfall.json");

  const result = await page.evaluate(() => {
    const calc = calculateUmlage();
    const billingResult = briefResultRows(calc)[0];
    const before = JSON.stringify(state);
    const htmlViaWrapper = buildBriefHtml(calc, billingResult);
    const htmlViaModule = NKProDocumentRenderer.buildBriefHtml(calc, billingResult);
    const plainText = NKProDocumentRenderer.plainLetterTextFromHtml(htmlViaWrapper);
    const after = JSON.stringify(state);
    return {
      sameState: before === after,
      sameHtml: htmlViaWrapper === htmlViaModule,
      htmlLength: htmlViaWrapper.length,
      plainText,
      tenantName: billingResult.tenant.name,
      year: currentAbrechnungsjahr(),
      resultCount: calc.tenantResults.length
    };
  });

  expect(result.sameState).toBe(true);
  expect(result.sameHtml).toBe(true);
  expect(result.htmlLength).toBeGreaterThan(2_000);
  expect(result.plainText).toContain(result.tenantName);
  expect(result.plainText).toContain(String(result.year));
  expect(result.resultCount).toBeGreaterThan(0);
  runtime.assertClean();
});

test("CSV-Aufbereitung nutzt ausschließlich das übergebene Fachergebnis und bleibt zustandsneutral", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "alle-eingabequellen.json");

  const result = await page.evaluate(() => {
    const calc = calculateUmlage();
    const rows = [
      ["Mieter-ID", "Name", "Kostenanteil", "Vorauszahlungen"],
      ...calc.tenantResults.map(item => [item.tenant.id, item.tenant.name, item.costShare, item.prepayments])
    ];
    const before = JSON.stringify(state);
    const csvViaWrapper = toCsv(rows);
    const csvViaModule = NKProExportService.toCsv(rows);
    const escaped = NKProExportService.csvEscape('Wert; mit "Zitat"');
    const after = JSON.stringify(state);
    return {
      sameState: before === after,
      sameCsv: csvViaWrapper === csvViaModule,
      csv: csvViaModule,
      escaped,
      lineCount: csvViaModule.split("\n").length,
      expectedLineCount: rows.length
    };
  });

  expect(result.sameState).toBe(true);
  expect(result.sameCsv).toBe(true);
  expect(result.csv).toContain("Mieter-ID;Name;Kostenanteil;Vorauszahlungen");
  expect(result.escaped).toBe('"Wert; mit ""Zitat"""');
  expect(result.lineCount).toBe(result.expectedLineCount);
  runtime.assertClean();
});
