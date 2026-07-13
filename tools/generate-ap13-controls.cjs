"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const { openFreshApp, loadFixture } = require("../tests/test-helpers.cjs");

const root = path.resolve(__dirname, "..");
const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium";

async function documentHtml(page, settings) {
  return page.evaluate(values => {
    ensureBriefSettings();
    Object.assign(state.briefSettings, values);
    renderBrief();
    const preview = document.getElementById("briefPreview");
    const root = preview.shadowRoot || preview;
    const sourceHtml = String(preview.__nkBriefHtml || "");
    return {
      html: printWindowHtml("Nebenkostenabrechnung", sourceHtml, "AP13-Kontrollausgabe"),
      pages: Number(root.querySelector(".nk-letter-document").dataset.documentPages || 0),
      metrics: [...root.querySelectorAll(".letter-sheet")].map(sheet => {
        const content = sheet.querySelector(".letter-main-content,.supplement-content");
        const footer = sheet.querySelector(".letter-footer");
        return {
          page: Number(sheet.dataset.page || 0),
          contentClientHeight: content ? content.clientHeight : 0,
          contentScrollHeight: content ? content.scrollHeight : 0,
          contentBeforeFooter: !content || !footer || content.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1,
          sheetWidth: sheet.getBoundingClientRect().width,
          sheetHeight: sheet.getBoundingClientRect().height
        };
      })
    };
  }, settings);
}

async function writePdf(browser, fileName, payload) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
  await page.setContent(payload.html, { waitUntil: "load" });
  await page.emulateMedia({ media: "print" });
  const metrics = await page.evaluate(() => [...document.querySelectorAll(".letter-sheet")].map(sheet => {
    const content = sheet.querySelector(".letter-main-content,.supplement-content");
    const footer = sheet.querySelector(".letter-footer");
    const sheetRect = sheet.getBoundingClientRect();
    const contentRect = content?.getBoundingClientRect();
    const footerRect = footer?.getBoundingClientRect();
    return {
      page: Number(sheet.dataset.page || 0),
      contentClientHeight: Math.round(content?.clientHeight || 0),
      contentScrollHeight: Math.round(content?.scrollHeight || 0),
      contentBeforeFooter: !contentRect || !footerRect || contentRect.bottom <= footerRect.top + 1,
      sheetWidth: Math.round(sheetRect.width * 100) / 100,
      sheetHeight: Math.round(sheetRect.height * 100) / 100,
      expectedA4: Math.abs(sheetRect.width - 793.7) < 2 && Math.abs(sheetRect.height - 1122.52) < 2
    };
  }));
  await page.pdf({
    path: path.join(root, fileName),
    printBackground: true,
    preferCSSPageSize: true,
    format: "A4",
    margin: { top: "0", right: "0", bottom: "0", left: "0" }
  });
  await page.close();
  return metrics;
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const app = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await openFreshApp(app);
    await loadFixture(app, "standardfall.json");

    const common = {
      abrechnungsjahr: "2025",
      briefdatum: "2026-07-06",
      zahlungsziel: "2026-07-31",
      abschlusstext: "Bei Fragen stehe ich Ihnen selbstverständlich gern zur Verfügung."
    };
    const standard = await documentHtml(app, {
      ...common,
      outroText: "",
      vorauszahlungPrintMode: "Nicht drucken",
      showVorauszahlungPage: "Nein"
    });
    const extended = await documentHtml(app, {
      ...common,
      outroText: "Ergänzend weisen wir darauf hin, dass die in der Abrechnung angesetzten Heiz- und Warmwasserkosten aus der beigefügten Einzelabrechnung des Messdienstleisters übernommen wurden.",
      vorauszahlungPrintMode: "Manuelle Werte drucken",
      showVorauszahlungPage: "Ja",
      vorauszahlungAb: "01.01.2026",
      vzChangeHeizung: 15,
      vzChangeWasser: 5,
      vzChangeAbfall: 2,
      vzChangeAntenne: -2,
      vzChangeSonstige: 0
    });

    if (standard.pages !== 1) throw new Error(`Standardausgabe hat ${standard.pages} statt 1 Seite.`);
    if (extended.pages !== 2) throw new Error(`Erweiterte Ausgabe hat ${extended.pages} statt 2 Seiten.`);

    standard.metrics = await writePdf(browser, "AP13_Kontrollausgabe_Standard_1_Seite.pdf", standard);
    extended.metrics = await writePdf(browser, "AP13_Kontrollausgabe_Erweitert_2_Seiten.pdf", extended);
    if ([...standard.metrics, ...extended.metrics].some(item => item.contentScrollHeight > item.contentClientHeight + 1 || !item.contentBeforeFooter || !item.expectedA4)) {
      throw new Error("Kontrollausgabe enthält einen Überlauf oder kein vollständiges DIN-A4-Seitenmaß.");
    }
    fs.writeFileSync(path.join(root, "AP13_CONTROL_OUTPUT_METRICS.json"), JSON.stringify({ standard, extended }, (key, value) => key === "html" ? undefined : value, 2) + "\n");
    await app.close();
    console.log("AP13-Kontrollausgaben erzeugt: 1 Seite und 2 Seiten, ohne DOM-Überlauf.");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
