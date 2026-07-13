"use strict";

const { test, expect } = require("@playwright/test");
const { attachRuntimeGuards, openFreshApp, loadFixture } = require("./test-helpers.cjs");

async function configureBrief(page, values) {
  await page.evaluate(settings => {
    ensureBriefSettings();
    Object.assign(state.briefSettings, settings);
    renderBrief();
  }, values);
}

test("AP13-Standardbrief nutzt eine gemeinsame DIN-A4-Struktur mit neun Spalten", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "standardfall.json");
  await page.evaluate(() => switchToTab("briefe"));
  await configureBrief(page, {
    outroText: "",
    vorauszahlungPrintMode: "Nicht drucken",
    showVorauszahlungPage: "Nein",
    abschlusstext: "Bei Fragen stehe ich Ihnen selbstverständlich gern zur Verfügung."
  });

  const preview = page.locator("#briefPreview");
  await expect(preview.locator(".nk-letter-document")).toHaveAttribute("data-document-pages", "1");
  await expect(preview.locator("section.letter-sheet")).toHaveCount(1);
  await expect(preview.locator(".abrechnung-table thead th")).toHaveCount(9);
  await expect(preview.locator(".abrechnung-table thead")).toContainText(/Ihre\s*Vorauszahlung/);
  await expect(preview.locator(".abrechnung-table .table-total-row")).toHaveCount(1);
  await expect(preview.locator(".result-strip")).toHaveCount(1);
  await expect(preview.locator(".document-end")).toHaveCount(1);
  await expect(preview.locator(".signature-name")).toHaveCount(1);
  await expect(preview.locator(".letter-footer")).toContainText("Seite 1 von 1");
  await expect(preview.locator(".supplement-section")).toHaveCount(0);

  const layout = await preview.evaluate(node => {
    const sheet = node.querySelector(".letter-sheet");
    const main = node.querySelector(".letter-main-content");
    const footer = node.querySelector(".letter-footer");
    const headerCells = [...node.querySelectorAll(".abrechnung-table thead th")];
    const bodyCells = [...node.querySelectorAll(".abrechnung-table tbody tr:not(.table-total-row) td")];
    const styleText = node.querySelector("style[data-nk-letter-styles]").textContent;
    return {
      sheetRatio: sheet.getBoundingClientRect().width / sheet.getBoundingClientRect().height,
      noVerticalOverflow: main.scrollHeight <= main.clientHeight + 1,
      contentBeforeFooter: main.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1,
      separatorAfterPrice: getComputedStyle(headerCells[4]).borderRightWidth,
      separatorBeforeShare: bodyCells[4] ? getComputedStyle(bodyCells[4]).borderRightWidth : "0px",
      sharedStyle: styleText,
      sheetWidth: getComputedStyle(sheet).width,
      sheetHeight: getComputedStyle(sheet).height,
      paymentFont: getComputedStyle(node.querySelector(".payment-text")).fontSize,
      proseFont: getComputedStyle(node.querySelector(".letter-intro")).fontSize
    };
  });

  expect(layout.sheetRatio).toBeCloseTo(210 / 297, 2);
  expect(layout.noVerticalOverflow).toBe(true);
  expect(layout.contentBeforeFooter).toBe(true);
  expect(parseFloat(layout.separatorAfterPrice)).toBeGreaterThan(0);
  expect(parseFloat(layout.separatorBeforeShare)).toBeGreaterThan(0);
  expect(layout.sharedStyle).toContain("@page{size:A4;margin:0}");
  expect(parseFloat(layout.sheetWidth)).toBeCloseTo(210 * 96 / 25.4, 1);
  expect(parseFloat(layout.sheetHeight)).toBeCloseTo(297 * 96 / 25.4, 1);
  expect(layout.paymentFont).toBe(layout.proseFont);

  const parity = await page.evaluate(() => {
    const preview = document.getElementById("briefPreview");
    const style = preview.querySelector("style[data-nk-letter-styles]").textContent;
    const printHtml = printWindowHtml("Kontrolle", preview.innerHTML, "AP13");
    return {
      sameStyleIncluded: printHtml.includes(style),
      hasPrintGuideSuppression: printHtml.includes("@media print{.print-guide{display:none!important}}"),
      controlsInsideDocument: !!preview.querySelector("button,input,textarea,select")
    };
  });
  expect(parity.sameStyleIncluded).toBe(true);
  expect(parity.hasPrintGuideSuppression).toBe(true);
  expect(parity.controlsInsideDocument).toBe(false);
  runtime.assertClean();
});

test("AP13 erzeugt Seite 2 nur für Zusatzinhalt und setzt den Abschluss genau einmal ans Dokumentende", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "standardfall.json");
  await page.evaluate(() => switchToTab("briefe"));

  await configureBrief(page, {
    outroText: "Dieser zusätzliche fallbezogene Hinweis wird ausschließlich auf der zweiten Seite ausgegeben.",
    vorauszahlungPrintMode: "Nicht drucken",
    showVorauszahlungPage: "Nein"
  });

  const preview = page.locator("#briefPreview");
  await expect(preview.locator(".nk-letter-document")).toHaveAttribute("data-document-pages", "2");
  await expect(preview.locator("section.letter-sheet")).toHaveCount(2);
  await expect(preview.locator(".letter-header")).toHaveCount(2);
  await expect(preview.locator(".letter-info")).toHaveCount(2);
  await expect(preview.locator(".letter-main-sheet .document-end")).toHaveCount(0);
  await expect(preview.locator(".letter-supplement-sheet .document-end")).toHaveCount(1);
  await expect(preview.locator(".signature-name")).toHaveCount(1);
  await expect(preview.locator(".attachment")).toHaveCount(1);
  await expect(preview.locator(".letter-main-sheet .letter-footer")).toContainText("Seite 1 von 2");
  await expect(preview.locator(".letter-supplement-sheet .letter-footer")).toContainText("Seite 2 von 2");
  await expect(preview.locator(".additional-note-box")).toContainText("zusätzliche fallbezogene Hinweis");

  await configureBrief(page, {
    outroText: "",
    vorauszahlungPrintMode: "Nicht drucken",
    showVorauszahlungPage: "Nein"
  });
  await expect(preview.locator("section.letter-sheet")).toHaveCount(1);
  await expect(preview.locator(".nk-letter-document")).toHaveAttribute("data-document-pages", "1");
  runtime.assertClean();
});

test("AP13-Vorauszahlungsanpassung nutzt Seite 2 und dieselbe blaue Tabellenvisualisierung", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "standardfall.json");
  await page.evaluate(() => switchToTab("briefe"));
  await configureBrief(page, {
    outroText: "",
    vorauszahlungPrintMode: "Manuelle Werte drucken",
    showVorauszahlungPage: "Ja",
    vorauszahlungAb: "01.01.2026",
    vzChangeHeizung: 15,
    vzChangeWasser: 5,
    vzChangeAbfall: 2,
    vzChangeAntenne: 0,
    vzChangeSonstige: 0
  });

  const preview = page.locator("#briefPreview");
  await expect(preview.locator(".nk-letter-document")).toHaveAttribute("data-document-pages", "2");
  await expect(preview.locator(".prepayment-section")).toHaveCount(1);
  await expect(preview.locator(".prepay-table thead th")).toHaveCount(7);
  await expect(preview.locator(".prepay-summary")).toHaveCount(1);
  await expect(preview.locator(".prepay-final")).toHaveCount(1);
  await expect(preview.locator(".payment-notice")).toHaveCount(1);
  await expect(preview.locator(".signature-name")).toHaveCount(1);

  const visualLanguage = await preview.evaluate(node => {
    const mainHead = node.querySelector(".abrechnung-table thead th");
    const prepayHead = node.querySelector(".prepay-table thead th");
    const table = node.querySelector(".prepay-table");
    return {
      sameHeaderColor: getComputedStyle(mainHead).backgroundColor === getComputedStyle(prepayHead).backgroundColor,
      tableWidth: table.getBoundingClientRect().width,
      parentWidth: table.parentElement.getBoundingClientRect().width,
      noOverflow: table.scrollWidth <= table.clientWidth + 1
    };
  });
  expect(visualLanguage.sameHeaderColor).toBe(true);
  expect(Math.abs(visualLanguage.tableWidth - visualLanguage.parentWidth)).toBeLessThan(1.5);
  expect(visualLanguage.noOverflow).toBe(true);
  runtime.assertClean();
});

test("AP13 kennzeichnet Nachzahlung und Guthaben mit unveränderter Vorzeichenlogik", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await openFreshApp(page);
  await loadFixture(page, "standardfall.json");

  const result = await page.evaluate(() => {
    ensureBriefSettings();
    Object.assign(state.briefSettings, { outroText:"", vorauszahlungPrintMode:"Nicht drucken", showVorauszahlungPage:"Nein" });
    const calc = calculateUmlage();
    const creditResult = briefResultRows(calc)[0];
    const creditHtml = buildBriefHtml(calc, creditResult);
    const debitCalc = JSON.parse(JSON.stringify(calc));
    const targetCostShare = Number(creditResult.prepayments) + 500;
    const tenantIndex = creditResult.tenant.originalIndex;
    debitCalc.costResults[0].allocations[tenantIndex] = targetCostShare;
    debitCalc.costResults[0].cost.gesamtbetrag = Math.max(Number(debitCalc.costResults[0].cost.gesamtbetrag) || 0, targetCostShare);
    const debitResult = { ...creditResult, costShare: targetCostShare };
    const debitHtml = buildBriefHtml(debitCalc, debitResult);
    const host = document.createElement("div");
    host.innerHTML = creditHtml;
    const creditLabel = host.querySelector(".result-cell--final .result-label").textContent;
    const creditClass = host.querySelector(".result-cell--final").className;
    host.innerHTML = debitHtml;
    const debitLabel = host.querySelector(".result-cell--final .result-label").textContent;
    const debitClass = host.querySelector(".result-cell--final").className;
    const debitPayment = host.querySelector(".payment-text").textContent;
    return { creditLabel, creditClass, debitLabel, debitClass, debitPayment };
  });

  expect(result.creditLabel).toBe("Ihr Guthaben");
  expect(result.creditClass).toContain("is-credit");
  expect(result.debitLabel).toBe("Ihre Nachzahlung an die Vermieterin");
  expect(result.debitClass).toContain("is-due");
  expect(result.debitPayment).toContain("überweisen");
  runtime.assertClean();
});

test("AP13 hält lange Empfängerdaten, Zusatztexte und die skalierte Vorschau innerhalb der DIN-A4-Seiten", async ({ page }) => {
  const runtime = attachRuntimeGuards(page);
  await page.setViewportSize({ width: 760, height: 1000 });
  await openFreshApp(page);
  await loadFixture(page, "alle-eingabequellen.json");
  await page.evaluate(() => switchToTab("briefe"));
  await page.evaluate(() => {
    const tenant = state.mieter[0];
    tenant.name = "Cynthia Alexandra Melzig-Schneider von Baumholder";
    tenant.strasse = "Am Rauhen Biehl 5, Gebäudeteil Süd, Wohnung 12";
    tenant.plz = "55774";
    tenant.ort = "Baumholder";
    tenant.standardanrede = "Automatisch";
    tenant.geschlecht = "Frau";
    ensureBriefSettings();
    Object.assign(state.briefSettings, {
      tenantId: tenant.id,
      outroText: "Dieser zusätzliche Hinweis erläutert einen abweichenden Abrechnungszeitraum und die Zuordnung einzelner Kostenpositionen. Die bereits auf Seite 1 dargestellten Beträge werden dabei nicht wiederholt.\n\nDie beigefügten Unterlagen enthalten die zugehörigen Einzelnachweise. Bitte bewahren Sie diese gemeinsam mit der Abrechnung auf.\n\nFür Rückfragen zu einzelnen Positionen kann die zugrunde liegende Berechnung anhand der gespeicherten Abrechnungsdaten nachvollzogen werden.",
      vorauszahlungPrintMode: "Manuelle Werte drucken",
      showVorauszahlungPage: "Ja",
      vorauszahlungAb: "01.01.2026",
      vzChangeHeizung: 15,
      vzChangeWasser: 5,
      vzChangeAbfall: 2,
      vzChangeAntenne: -2,
      vzChangeSonstige: 0
    });
    renderBrief();
    document.getElementById("lettersEditorSection").open = true;
    applyBriefPreviewScale();
  });

  const metrics = await page.locator("#briefPreview").evaluate(node => {
    const wrap = node.closest(".letter-preview-wrap");
    const sheets = [...node.querySelectorAll(".letter-sheet")];
    const address = node.querySelector(".letter-address-window");
    return {
      pages: sheets.length,
      previewWidth: node.querySelector(".nk-letter-document").getBoundingClientRect().width,
      wrapInnerWidth: wrap.clientWidth - 40,
      ratios: sheets.map(sheet => sheet.getBoundingClientRect().width / sheet.getBoundingClientRect().height),
      overflows: sheets.map(sheet => {
        const content = sheet.querySelector(".letter-main-content,.supplement-content");
        return content.scrollHeight > content.clientHeight + 1;
      }),
      addressOverflow: address.scrollHeight > address.clientHeight + 1,
      salutation: node.querySelector(".letter-salutation").textContent
    };
  });

  expect(metrics.pages).toBe(2);
  expect(metrics.previewWidth).toBeLessThanOrEqual(metrics.wrapInnerWidth + 2);
  expect(metrics.ratios.every(value => Math.abs(value - 210 / 297) < 0.01)).toBe(true);
  expect(metrics.overflows).toEqual([false, false]);
  expect(metrics.addressOverflow).toBe(false);
  expect(metrics.salutation).toContain("Frau");
  runtime.assertClean();
});
