(function(global) {
  "use strict";

  // AP13: Ein gemeinsames DIN-A4-Dokumentmodell fuer Vorschau, Druck und PDF.
  // Die Dokument-CSS wird zusammen mit dem erzeugten DOM ausgegeben und daher
  // in Vorschau und Druckfenster unveraendert wiederverwendet.

  const AP13_BLUE = "#2F6F9F";
  const AP13_DARK_BLUE = "#234F70";
  const AP13_TEXT = "#233241";
  const AP13_MUTED = "#6F8191";
  const AP13_LINE = "#D5E1E9";
  const AP13_LIGHT = "#F3F7FA";
  const AP13_LIGHT_ALT = "#EAF1F6";
  const AP13_RESULT_RED = "#8B2D2D";
  const AP13_RESULT_RED_BG = "#FBEDED";
  const AP13_RESULT_GREEN = "#2F6B45";
  const AP13_RESULT_GREEN_BG = "#EDF7F0";

  function briefSettlementSummaryHtml(result) {
    if (!result) return "";
    const settlement = settlementInfoForResult(result, result.tenant);
    const cls = settlement.isNachzahlung ? "warn" : "ok";
    return '<div class="hint"><strong>Brief-Ergebnis:</strong> <span class="status ' + cls + '">' + escapeHtml(settlement.type) + '</span> ' + fmtMoney(settlement.amount) + '<div class="small">Logik: Kostenanteil minus Vorauszahlungen minus Korrekturen. Im Brief wird der Ergebnisbetrag positiv mit eindeutigem Label ausgewiesen.</div></div>';
  }

  function briefTextWithLineBreaks(value) {
    return escapeHtml(String(value || "").replace(/\\n/g, "\n")).replace(/\r?\n/g, "<br>");
  }

  function briefProseHtml(value) {
    return escapeHtml(String(value || "").replace(/\\n/g, " ").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim());
  }

  function briefParagraphsHtml(value, className) {
    const text = String(value || "").replace(/\\n/g, "\n").trim();
    if (!text) return "";
    return text.split(/\n\s*\n/).map(paragraph => '<p class="' + escapeHtml(className || "letter-prose") + '">' + briefTextWithLineBreaks(paragraph.trim()) + '</p>').join("");
  }

  function normalizedBankText(value) {
    return String(value || "").replace(/\s*\/\s*/g, " · ").replace(/\s+·\s+/g, " · ").trim();
  }

  function documentStyleText() {
    return `@page{size:A4;margin:0}
*{box-sizing:border-box}
.nk-letter-document{width:210mm;margin:0;padding:0;color:${AP13_TEXT};font-family:Arial,"Liberation Sans",sans-serif;font-size:10pt;line-height:1.28;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.nk-letter-document .letter-sheet{position:relative;width:210mm;height:297mm;min-height:297mm;max-width:none;margin:0 0 6mm;padding:0;overflow:hidden;background:#fff;color:${AP13_TEXT};page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid}
.nk-letter-document .letter-sheet:last-child{margin-bottom:0;page-break-after:auto;break-after:auto}
.nk-letter-document .letter-header{position:absolute;top:7mm;left:19mm;right:19mm;height:11mm;border-bottom:.55mm solid ${AP13_BLUE};padding-bottom:1.4mm;text-align:center}
.nk-letter-document .letter-brand{display:flex;align-items:baseline;justify-content:center;gap:2.2mm;white-space:nowrap;line-height:1}
.nk-letter-document .letter-brand-owner{font-size:11pt;font-weight:700;color:${AP13_DARK_BLUE}}
.nk-letter-document .letter-brand-separator{font-size:9pt;color:${AP13_MUTED}}
.nk-letter-document .letter-brand-role{font-size:9pt;font-weight:400;color:${AP13_MUTED}}
.nk-letter-document .letter-contact{margin-top:1.1mm;color:${AP13_MUTED};font-size:8pt;line-height:1.05;white-space:nowrap}
.nk-letter-document .letter-info{position:absolute;top:22mm;right:19mm;width:74mm;border-collapse:collapse;border-spacing:0;table-layout:fixed;margin:0;font-size:7.5pt;line-height:1.15}
.nk-letter-document .letter-info th,.nk-letter-document .letter-info td{height:5.2mm;border:0;border-bottom:.25mm solid ${AP13_LINE};padding:1.15mm 1.8mm;vertical-align:middle}
.nk-letter-document .letter-info th{width:39mm;background:${AP13_LIGHT};color:#4D5F6E;text-align:left;font-size:7pt;font-weight:700}
.nk-letter-document .letter-info td{text-align:right;color:${AP13_TEXT};font-size:7.5pt;white-space:nowrap}
.nk-letter-document .letter-address-window{position:absolute;top:51mm;left:19mm;width:99mm;height:42mm;overflow:hidden}
.nk-letter-document .letter-return-address{height:5mm;border-bottom:.25mm solid ${AP13_LINE};color:${AP13_MUTED};font-size:7pt;line-height:4.2mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nk-letter-document .letter-address{padding-top:1.7mm;color:${AP13_TEXT};font-size:9pt;line-height:1.22;white-space:normal}
.nk-letter-document .letter-main-content{position:absolute;top:83mm;left:19mm;right:19mm;bottom:20mm;display:flex;min-height:0;flex-direction:column;padding:0}
.nk-letter-document .letter-title{display:block;margin:0 0 12.5mm;color:${AP13_DARK_BLUE};font-size:17pt;line-height:1.05;font-weight:700;letter-spacing:-.15pt}
.nk-letter-document .letter-salutation{margin:0 0 8mm;font-size:10pt;line-height:1.2}
.nk-letter-document .letter-intro{margin:0 0 8mm;font-size:10pt;line-height:1.32}
.nk-letter-document .letter-intro strong{font-weight:700}
.nk-letter-document .result-strip{display:grid;grid-template-columns:repeat(3,1fr);height:18mm;margin:0 0 11mm;border-top:.3mm solid ${AP13_LINE};border-bottom:.3mm solid ${AP13_LINE}}
.nk-letter-document .result-cell{display:flex;align-items:center;justify-content:center;flex-direction:column;min-width:0;background:${AP13_LIGHT};border-right:.25mm solid #fff;text-align:center;padding:2mm}
.nk-letter-document .result-cell:last-child{border-right:0}
.nk-letter-document .result-cell--final.is-due{background:${AP13_RESULT_RED_BG}}
.nk-letter-document .result-cell--final.is-credit{background:${AP13_RESULT_GREEN_BG}}
.nk-letter-document .result-label{color:#4D5F6E;font-size:7pt;line-height:1.12;font-weight:700}
.nk-letter-document .result-value{margin-top:1mm;color:${AP13_DARK_BLUE};font-size:12pt;line-height:1;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
.nk-letter-document .result-cell--middle .result-value{color:${AP13_TEXT}}
.nk-letter-document .result-cell--final.is-due .result-value{color:${AP13_RESULT_RED}}
.nk-letter-document .result-cell--final.is-credit .result-value{color:${AP13_RESULT_GREEN}}
.nk-letter-document .detail-heading,.nk-letter-document .supplement-heading{margin:0;color:${AP13_DARK_BLUE};font-size:10.5pt;line-height:1.15;font-weight:700}
.nk-letter-document .detail-heading{margin-bottom:1.6mm}
.nk-letter-document table{border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%;max-width:100%;margin:0}
.nk-letter-document .abrechnung-table{font-size:6pt;line-height:1.1;margin-bottom:6mm}
.nk-letter-document .abrechnung-table col.col-cost{width:18.5%}
.nk-letter-document .abrechnung-table col.col-total{width:11%}
.nk-letter-document .abrechnung-table col.col-distribution{width:9.5%}
.nk-letter-document .abrechnung-table col.col-total-units{width:10%}
.nk-letter-document .abrechnung-table col.col-price{width:10%}
.nk-letter-document .abrechnung-table col.col-share-units{width:9%}
.nk-letter-document .abrechnung-table col.col-cost-share{width:10%}
.nk-letter-document .abrechnung-table col.col-prepayment{width:10.5%}
.nk-letter-document .abrechnung-table col.col-balance{width:11.5%}
.nk-letter-document .abrechnung-table thead th{height:10.4mm;padding:1.2mm .9mm;background:${AP13_BLUE};color:#fff;border:.25mm solid #fff;border-top:0;font-size:6pt;line-height:1.08;font-weight:700;text-align:center;vertical-align:middle;white-space:normal;overflow-wrap:normal;word-break:normal;hyphens:none}
.nk-letter-document .abrechnung-table thead th:first-child{text-align:left}
.nk-letter-document .abrechnung-table tbody td{height:6.2mm;padding:1mm .9mm;color:${AP13_TEXT};border-right:.25mm solid ${AP13_LINE};border-bottom:.25mm solid ${AP13_LINE};vertical-align:middle;white-space:normal;overflow-wrap:anywhere;word-break:normal;hyphens:auto}
.nk-letter-document .abrechnung-table tbody tr:nth-child(even):not(.table-total-row):not(.table-correction-row) td{background:${AP13_LIGHT}}
.nk-letter-document .abrechnung-table tbody td:last-child{border-right:0}
.nk-letter-document .abrechnung-table .cell-cost{font-weight:700}
.nk-letter-document .money{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap!important}
.nk-letter-document .center{text-align:center}
.nk-letter-document .table-correction-row td{background:#FAFCFD;font-style:italic}
.nk-letter-document .table-total-row td{height:7.8mm;background:#DCEAF3;border-top:.55mm solid ${AP13_BLUE};border-bottom:.3mm solid ${AP13_BLUE};font-size:8pt;font-weight:700}
.nk-letter-document .table-total-row td:first-child{color:${AP13_DARK_BLUE}}
.nk-letter-document .table-total-row .balance-due{color:${AP13_RESULT_RED}}
.nk-letter-document .notice-box{margin:0 0 3.5mm;padding:2.5mm 2.5mm 2.2mm;border-left:.6mm solid ${AP13_BLUE};background:${AP13_LIGHT};color:#4D5F6E;font-size:7pt;line-height:1.2}
.nk-letter-document .notice-title{display:block;margin-bottom:.6mm;color:${AP13_DARK_BLUE};font-size:8pt;font-weight:700}
.nk-letter-document .payment-text{margin:0;font-size:10pt;line-height:1.3;color:${AP13_TEXT}}
.nk-letter-document .document-end{display:grid;grid-template-columns:minmax(0,1fr) minmax(62mm,78mm);gap:8mm;align-items:end;margin-top:auto;padding-top:7mm}
.nk-letter-document .closing-greeting{margin:0 0 14mm;font-size:10pt;line-height:1.2}
.nk-letter-document .signature-name{font-size:9.5pt;font-weight:700;line-height:1.15}
.nk-letter-document .signature-role{color:${AP13_MUTED};font-size:8pt;line-height:1.15}
.nk-letter-document .attachment{text-align:right;color:${AP13_MUTED};font-size:7.5pt;line-height:1.15}
.nk-letter-document .attachment-title{display:block;color:${AP13_DARK_BLUE};font-size:8pt;font-weight:700}
.nk-letter-document .letter-footer{position:absolute;left:19mm;right:19mm;bottom:6mm;height:5.5mm;border-top:.25mm solid ${AP13_LINE};padding-top:2.1mm;color:${AP13_MUTED};font-size:6.5pt;line-height:1;text-align:center;white-space:nowrap}
.nk-letter-document .supplement-content{position:absolute;top:49mm;left:19mm;right:19mm;bottom:20mm;display:flex;min-height:0;flex-direction:column;padding:0}
.nk-letter-document .supplement-lead{width:92mm;min-height:35mm}
.nk-letter-document .supplement-title{display:block;margin:0 0 2mm;color:${AP13_DARK_BLUE};font-size:16pt;line-height:1.05;font-weight:700}
.nk-letter-document .supplement-lead-text{margin:0;color:${AP13_TEXT};font-size:9pt;line-height:1.32}
.nk-letter-document .supplement-sections{display:flex;min-height:0;flex-direction:column;gap:7mm}
.nk-letter-document .supplement-section{break-inside:avoid;page-break-inside:avoid}
.nk-letter-document .supplement-heading{margin-bottom:1.5mm}
.nk-letter-document .additional-note-box{padding:3mm;border-left:.6mm solid ${AP13_BLUE};background:${AP13_LIGHT};color:#4D5F6E;font-size:9pt;line-height:1.35}
.nk-letter-document .additional-note-box p{margin:0 0 2.5mm}
.nk-letter-document .additional-note-box p:last-child{margin-bottom:0}
.nk-letter-document .prepayment-intro{margin:0 0 2.6mm;font-size:9pt;line-height:1.32}
.nk-letter-document .prepay-table{font-size:7.5pt;line-height:1.12}
.nk-letter-document .prepay-table col.col-prepay-label{width:40%}
.nk-letter-document .prepay-table col.col-prepay-turnus{width:11%}
.nk-letter-document .prepay-table col.col-prepay-old{width:13%}
.nk-letter-document .prepay-table col.col-prepay-operator{width:4%}
.nk-letter-document .prepay-table col.col-prepay-change{width:14%}
.nk-letter-document .prepay-table col.col-prepay-equals{width:4%}
.nk-letter-document .prepay-table col.col-prepay-new{width:14%}
.nk-letter-document .prepay-table thead th{height:12mm;padding:1.5mm 1mm;background:${AP13_BLUE};color:#fff;border-right:.25mm solid #fff;border-bottom:.55mm solid ${AP13_DARK_BLUE};font-size:7pt;line-height:1.12;font-weight:700;text-align:center;vertical-align:middle;white-space:normal}
.nk-letter-document .prepay-table thead th:first-child{text-align:left}
.nk-letter-document .prepay-table tbody td{height:7.2mm;padding:1.2mm 1mm;border-right:.25mm solid ${AP13_LINE};border-bottom:.25mm solid ${AP13_LINE};vertical-align:middle}
.nk-letter-document .prepay-table tbody td:last-child{border-right:0}
.nk-letter-document .prepay-table tbody tr:nth-child(even):not(.prepay-summary):not(.prepay-final) td{background:${AP13_LIGHT}}
.nk-letter-document .prepay-table .prepay-summary td{background:#DCEAF3;border-top:.4mm solid ${AP13_BLUE};font-weight:700}
.nk-letter-document .prepay-table .prepay-rent td{background:${AP13_LIGHT_ALT};font-weight:600}
.nk-letter-document .prepay-table .prepay-final td{background:#DCEAF3;border-top:.55mm solid ${AP13_BLUE};border-bottom:.3mm solid ${AP13_BLUE};font-weight:700}
.nk-letter-document .payment-notice{padding:3mm;border-left:.6mm solid ${AP13_BLUE};background:${AP13_LIGHT};color:#4D5F6E;font-size:8pt;line-height:1.25}
.nk-letter-document .payment-notice-title{display:block;margin-bottom:.7mm;color:${AP13_DARK_BLUE};font-size:8pt;font-weight:700}
.nk-letter-document .supplement-closing-text{margin:0 0 8mm;font-size:9pt;line-height:1.3}
.nk-letter-document .supplement-end{margin-top:auto}
.nk-letter-document .supplement-end .document-end{margin-top:0;padding-top:6mm}
.nk-letter-document table,.nk-letter-document tr,.nk-letter-document .document-end,.nk-letter-document .letter-footer{page-break-inside:avoid;break-inside:avoid}
@media print{html,body{width:210mm;margin:0!important;padding:0!important;background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.nk-letter-document{margin:0!important}.nk-letter-document .letter-sheet{margin:0!important;border:0!important;box-shadow:none!important}}
`;
  }

  function briefPrintStyles() {
    // Kompatibilitaetsmarker werden bewusst ohne Leerzeichen beibehalten,
    // weil bestehende Druck-Preflights die feste A4-Definition pruefen.
    return "@page{size:A4;margin:0}\n" +
      ".letter-sheet{width:210mm;height:297mm}\n" +
      ".abrechnung-table tbody td{white-space:nowrap}.abrechnung-table thead th{white-space:normal}\n" +
      "html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}\n" +
      "table,tr,.letter-footer,.table-total-row{page-break-inside:avoid;break-inside:avoid}\n" +
      ".print-guide{border:1px solid #b6d7ef;background:#eef5fb;border-radius:8px;padding:10px 12px;margin:0 auto 10px;width:210mm;max-width:100%;font-family:Arial,sans-serif;color:#173b5a}.print-guide strong{display:block;margin-bottom:4px}.screen-print-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.screen-print-actions button{border:1px solid #b6d7ef;background:#fff;color:#173b5a;border-radius:6px;padding:7px 10px;font-weight:700;cursor:pointer}@media print{.print-guide{display:none!important}}";
  }

  function briefPreflightBoxHtml(report) {
    if (!report) return "";
    const badgeClass = report.level === "err" ? "err" : (report.level === "warn" ? "warn" : "ok");
    const badgeLabel = report.level === "err" ? "Fehler" : (report.level === "warn" ? "Prüfen" : "OK");
    const visibleItems = report.items.filter(item => item.level !== "info");
    const infoItems = report.items.filter(item => item.level === "info");
    const rows = (visibleItems.length ? visibleItems : report.items).map(item => {
      const statusClass = item.level === "err" ? "err" : (item.level === "warn" ? "warn" : (item.level === "info" ? "info" : "ok"));
      const statusText = item.level === "err" ? "Fehler" : (item.level === "warn" ? "Prüfen" : (item.level === "info" ? "Hinweis" : "OK"));
      return '<li><span class="status ' + statusClass + '">' + statusText + '</span><span><strong>' + escapeHtml(item.label) + ':</strong> ' + escapeHtml(item.detail) + '</span></li>';
    }).join("");
    const infoRows = infoItems.map(item => '<li><span class="status info">Hinweis</span><span><strong>' + escapeHtml(item.label) + ':</strong> ' + escapeHtml(item.detail) + '</span></li>').join("");
    return '<div class="brief-preflight-box ' + report.level + '">' +
      '<div class="preflight-title"><strong>Brief-Preflight: ' + escapeHtml(report.label) + '</strong><span class="status ' + badgeClass + '">' + badgeLabel + '</span></div>' +
      '<div class="small">' + escapeHtml(report.message) + '</div>' +
      '<div class="preflight-grid"><span class="preflight-pill">' + report.errors + ' Fehler</span><span class="preflight-pill">' + report.warnings + ' Hinweise</span><span class="preflight-pill">' + report.ok + ' OK</span><span class="preflight-pill">' + report.infos + ' Druckhinweise</span></div>' +
      (rows ? '<ul class="brief-preflight-list">' + rows + '</ul>' : '') +
      (infoRows ? '<details><summary>Druckhinweise anzeigen</summary><ul class="brief-preflight-list">' + infoRows + '</ul></details>' : '') +
      '</div>';
  }

  function printGuideHtml(scopeLabel) {
    return '<div class="print-guide"><strong>Druck-/PDF-Hinweis ' + escapeHtml(scopeLabel || "") + '</strong><div>A4 wählen · Skalierung 100 % · Browser-Kopf-/Fußzeilen deaktivieren · Hintergrundgrafiken/Farben aktivieren.</div><div class="screen-print-actions"><button type="button" onclick="window.print()">Jetzt drucken / PDF speichern</button><button type="button" onclick="window.close()">Fenster schließen</button></div></div>';
  }

  function printHardeningBoxHtml(report) {
    if (!report) return "";
    const badgeClass = report.level === "err" ? "err" : (report.level === "warn" ? "warn" : "ok");
    const badgeLabel = report.level === "err" ? "Fehler" : (report.level === "warn" ? "Prüfen" : "OK");
    const rows = report.items.filter(item => item.level !== "info").map(item => {
      const cls = item.level === "err" ? "err" : (item.level === "warn" ? "warn" : "ok");
      const label = item.level === "err" ? "Fehler" : (item.level === "warn" ? "Prüfen" : "OK");
      return '<li><span class="status ' + cls + '">' + label + '</span><span><strong>' + escapeHtml(item.label) + ':</strong> ' + escapeHtml(item.detail) + '</span></li>';
    }).join("");
    return '<div class="print-hardening-box ' + report.level + '"><div class="preflight-title"><strong>Druck-/PDF-Härtung: ' + escapeHtml(report.label) + '</strong><span class="status ' + badgeClass + '">' + badgeLabel + '</span></div><div class="small">' + escapeHtml(report.message) + '</div><div class="print-hardening-grid"><span class="print-hardening-pill">' + report.errors + ' Fehler</span><span class="print-hardening-pill">' + report.warnings + ' Hinweise</span><span class="print-hardening-pill">' + report.ok + ' OK</span><span class="print-hardening-pill">' + report.infos + ' Druckhinweise</span></div>' + (rows ? '<ul class="print-hardening-list">' + rows + '</ul>' : '') + '</div>';
  }

  function printReportText(report) {
    if (!report) return "Kein Druckbericht verfügbar.";
    const lines = [];
    lines.push("Druck-/PDF-Härtung: " + report.label);
    lines.push(report.message);
    lines.push(report.errors + " Fehler · " + report.warnings + " Hinweise · " + report.ok + " OK · " + report.infos + " Druckhinweise");
    report.items.forEach(item => lines.push((item.level === "err" ? "Fehler" : (item.level === "warn" ? "Prüfen" : (item.level === "info" ? "Hinweis" : "OK"))) + " · " + item.label + ": " + item.detail));
    return lines.join("\n");
  }

  function printWindowHtml(title, bodyHtml, scopeLabel) {
    return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(title || "Nebenkostenabrechnungsbrief") + '</title><style>' + briefPrintStyles() + '</style></head><body class="document-print-window">' + printGuideHtml(scopeLabel || "") + bodyHtml + '</body></html>';
  }

  function briefDate(value) {
    const text = typeof dateDe === "function" ? String(dateDe(value) || "") : String(value || "");
    const match = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!match) return text;
    return match[1].padStart(2, "0") + "." + match[2].padStart(2, "0") + "." + match[3];
  }

  function billingPeriodText() {
    const start = typeof periodStart === "function" ? briefDate(periodStart()) : "";
    const end = typeof periodEnd === "function" ? briefDate(periodEnd()) : "";
    return [start, end].filter(Boolean).join(" – ");
  }

  function briefUnitLabel(tenant) {
    if (tenant && tenant.name) return "Wohnung " + tenant.name;
    const unit = state && Array.isArray(state.wohnungen) && tenant ? state.wohnungen.find(item => item.id === tenant.wohnung) : null;
    return "Wohnung " + String(unit && (unit.bezeichnung || unit.lage) || tenant && tenant.wohnung || "").trim();
  }

  function briefPropertyLabel(tenant) {
    return String(tenant && tenant.strasse || "").trim() || String(state && state.meta && state.meta.objekt || "").trim() || "–";
  }

  function briefHeaderHtml(settings) {
    const contact = [settings.absenderStrasse, settings.absenderOrt, settings.absenderTelefon].filter(Boolean).join(" · ");
    return '<header class="letter-header">' +
      '<div class="letter-brand"><span class="letter-brand-owner">' + briefTextWithLineBreaks(settings.absenderName || settings.absender) + '</span><span class="letter-brand-separator">·</span><span class="letter-brand-role">Vermietung</span></div>' +
      '<div class="letter-contact">' + escapeHtml(contact) + '</div>' +
      '</header>';
  }

  function briefInfoHtml(settings, tenant) {
    return '<table class="letter-info" aria-label="Abrechnungsinformationen"><tbody>' +
      '<tr><th>Abrechnungszeitraum</th><td>' + escapeHtml(billingPeriodText()) + '</td></tr>' +
      '<tr><th>Mietobjekt</th><td>' + escapeHtml(briefPropertyLabel(tenant)) + '</td></tr>' +
      '<tr><th>Einheit</th><td>' + escapeHtml(briefUnitLabel(tenant)) + '</td></tr>' +
      '<tr><th>Datum</th><td>' + escapeHtml(briefDate(settings.briefdatum)) + '</td></tr>' +
      '</tbody></table>';
  }

  function briefFooterHtml(settings, pageNumber, pageCount) {
    return '<footer class="letter-footer">Kontoverbindung: ' + escapeHtml(normalizedBankText(settings.bankverbindung)) + ' &nbsp; · &nbsp; Seite ' + pageNumber + ' von ' + pageCount + '</footer>';
  }

  function tableCostLabel(row) {
    if (row.id === "K006") return "Heiz- & Warmwasserkosten";
    if (row.id === "K002") return "Wasserkosten";
    if (row.id === "K009") return "Abfallkosten";
    if (row.id === "K017") return "Antennenkosten";
    return String(row.kostenart || "Weitere Betriebskosten").replace(/^Ihre\s+/i, "");
  }

  function distributionLabel(row) {
    if (isManualExternalCostDefinition(row)) return row.id === "K006" ? "gem. Techem" : "Einzelabrechnung";
    return String(row.schluessel || row.berechnungsart || "–").replace("Wohneinheiten", "Wohneinheiten");
  }

  function unitSuffix(row) {
    const key = String(row.schluessel || "").toLowerCase();
    if (row.id === "K002" || key.includes("verbrauch")) return "m³";
    if (key.includes("wohn") || row.id === "K009" || row.id === "K017") return "WE";
    if (key.includes("person")) return "Pers.";
    if (key.includes("fläche") || key.includes("flaeche")) return "m²";
    if (key.includes("tag")) return "Tage";
    return "";
  }

  function unitsText(value, suffix) {
    const formatted = fmtUnits(value);
    return formatted ? formatted + (suffix ? " " + suffix : "") : "";
  }

  function priceText(row) {
    if (isManualExternalCostDefinition(row)) return "siehe Anlage";
    const suffix = unitSuffix(row);
    return fmtMoney(row.preis) + (suffix ? " / " + suffix : "");
  }

  function signedMoneyHtml(value) {
    const number = num(value);
    if (Math.abs(number) < 0.005) return fmtMoney(0);
    return (number < 0 ? "&minus;&nbsp;" : "") + fmtMoney(Math.abs(number));
  }

  function prepaymentMoneyHtml(value) {
    const number = num(value);
    if (Math.abs(number) < 0.005) return fmtMoney(0);
    return "&minus;&nbsp;" + fmtMoney(Math.abs(number));
  }

  function costSectionRows(rows) {
    return rows.map(row => {
      const manualExternal = isManualExternalCostDefinition(row);
      const suffix = unitSuffix(row);
      const prepayment = num(row.vorauszahlung) + num(row.weitereVorauszahlung);
      const balance = num(row.anteil) - prepayment;
      return '<tr>' +
        '<td class="cell-cost">' + escapeHtml(tableCostLabel(row)) + '</td>' +
        '<td class="money">' + fmtMoney(row.gesamtbetrag) + '</td>' +
        '<td class="center">' + escapeHtml(distributionLabel(row)) + '</td>' +
        '<td class="center">' + (manualExternal ? "siehe Anlage" : escapeHtml(unitsText(row.basisTotal, suffix))) + '</td>' +
        '<td class="money center">' + (manualExternal ? "siehe Anlage" : escapeHtml(priceText(row))) + '</td>' +
        '<td class="center">' + (manualExternal ? "siehe Anlage" : escapeHtml(unitsText(row.einheiten, suffix))) + '</td>' +
        '<td class="money">' + fmtMoney(row.anteil) + '</td>' +
        '<td class="money">' + prepaymentMoneyHtml(prepayment) + '</td>' +
        '<td class="money">' + signedMoneyHtml(balance) + '</td>' +
        '</tr>';
    }).join("");
  }

  function correctionRowHtml(correction, year) {
    if (Math.abs(num(correction)) < 0.005) return "";
    const previousYear = String(global.NKProArchiveActions.yearNumber(year) - 1);
    return '<tr class="table-correction-row"><td class="cell-cost">Korrektur/Gutschrift ' + escapeHtml(previousYear) + '</td><td colspan="6"></td><td class="money">' + prepaymentMoneyHtml(correction) + '</td><td class="money">' + signedMoneyHtml(-num(correction)) + '</td></tr>';
  }

  function mainTableHtml(costRows, result, correction, settlement, year) {
    const creditTotal = num(result.prepayments) + num(correction);
    const balanceSigned = num(result.costShare) - creditTotal;
    const finalClass = settlement.isNachzahlung ? " balance-due" : "";
    return '<table class="abrechnung-table" aria-label="Abrechnungsübersicht im Detail">' +
      '<colgroup><col class="col-cost"><col class="col-total"><col class="col-distribution"><col class="col-total-units"><col class="col-price"><col class="col-share-units"><col class="col-cost-share"><col class="col-prepayment"><col class="col-balance"></colgroup>' +
      '<thead><tr><th>Kostenart</th><th>Gesamtkosten</th><th>Verteilung</th><th>Gesamt-<br>einheiten</th><th>Preis pro<br>Einheit</th><th>Ihr Anteil</th><th>Ihre Kosten</th><th>Ihre<br>Vorauszahlung</th><th>Ihre<br>Abrechnung</th></tr></thead>' +
      '<tbody>' + (costSectionRows(costRows) || '<tr><td colspan="9">Keine umlagefähigen Kosten vorhanden.</td></tr>') + correctionRowHtml(correction, year) +
      '<tr class="table-total-row"><td colspan="6">Summen</td><td class="money">' + fmtMoney(result.costShare) + '</td><td class="money">' + prepaymentMoneyHtml(creditTotal) + '</td><td class="money' + finalClass + '">' + signedMoneyHtml(balanceSigned) + '</td></tr>' +
      '</tbody></table>';
  }

  function resultStripHtml(result, settlement) {
    const finalLabel = settlement.isBalanced ? "Ausgeglichen" : (settlement.isNachzahlung ? "Ihre Nachzahlung an die Vermieterin" : "Ihr Guthaben");
    return '<div class="result-strip" aria-label="Abrechnungsergebnis">' +
      '<div class="result-cell"><span class="result-label">Ihr Kostenanteil</span><span class="result-value">' + fmtMoney(result.costShare) + '</span></div>' +
      '<div class="result-cell result-cell--middle"><span class="result-label">Geleistete Vorauszahlungen</span><span class="result-value">' + fmtMoney(result.prepayments) + '</span></div>' +
      '<div class="result-cell result-cell--final ' + (settlement.isNachzahlung ? "is-due" : "is-credit") + '"><span class="result-label">' + escapeHtml(finalLabel) + '</span><span class="result-value">' + fmtMoney(settlement.amount) + '</span></div>' +
      '</div>';
  }

  function signatureParts(settings) {
    const raw = String(settings.signatur || "").replace(/\\n/g, "\n").split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    return { name:raw[0] || settings.absenderName || settings.absender || "", role:raw.slice(1).join(" · ") || "Vermieterin" };
  }

  function documentEndHtml(settings, includeClosingText) {
    const signature = signatureParts(settings);
    const closingText = includeClosingText ? String(settings.abschlusstext || "").trim() : "";
    return (closingText ? '<p class="supplement-closing-text">' + briefProseHtml(closingText) + '</p>' : '') +
      '<div class="document-end"><div><p class="closing-greeting">' + briefTextWithLineBreaks(settings.gruss) + '</p><div class="signature-name">' + escapeHtml(signature.name) + '</div><div class="signature-role">' + escapeHtml(signature.role) + '</div></div>' +
      (String(settings.anlagenText || "").trim() ? '<div class="attachment"><span class="attachment-title">Anlage</span>' + briefTextWithLineBreaks(settings.anlagenText) + '</div>' : '<div></div>') + '</div>';
  }

  function replaceDocumentPlaceholders(value, replacements) {
    let text = String(value || "");
    Object.entries(replacements || {}).forEach(([key, replacement]) => {
      text = text.replaceAll("{" + key + "}", String(replacement == null ? "" : replacement));
    });
    return text;
  }

  function prepaymentRowsForDocument(costRows, tenant) {
    const rows = monthlyPrepaymentRows(costRows, tenant);
    return rows.filter(row => row && (Math.abs(num(row.oldMonthly)) >= 0.005 || Math.abs(num(row.change)) >= 0.005 || Math.abs(num(row.newMonthly)) >= 0.005));
  }

  function prepaymentAdjustmentRequired(costRows, tenant) {
    ensureBriefSettings();
    const settings = state.briefSettings || {};
    if (settings.vorauszahlungPrintMode === "Nicht drucken" || settings.showVorauszahlungPage !== "Ja") return false;
    return prepaymentRowsForDocument(costRows, tenant).some(row => Math.abs(num(row.change)) >= 0.01);
  }

  function prepaymentSectionHtml(costRows, tenant) {
    ensureBriefSettings();
    const settings = state.briefSettings;
    const rows = prepaymentRowsForDocument(costRows, tenant);
    if (!rows.some(row => Math.abs(num(row.change)) >= 0.01)) return "";
    const effectiveDate = typeof effectivePrepaymentDateLabel === "function" ? effectivePrepaymentDateLabel() : String(settings.vorauszahlungAb || "");
    const sumNew = rows.reduce((sum, row) => sum + num(row.newMonthly), 0);
    const coldRent = num(tenant && tenant.kaltSoll) / 12;
    const warmRent = coldRent + sumNew;
    const rowHtml = rows.map(row => {
      const change = num(row.change);
      const operator = change > 0.004 ? "+" : (change < -0.004 ? "−" : "±");
      return '<tr><td>' + escapeHtml(row.label) + '</td><td class="center">' + escapeHtml(row.turnus || "monatlich") + '</td><td class="money center">' + fmtMoney(row.oldMonthly) + '</td><td class="center">' + operator + '</td><td class="money center">' + fmtMoney(Math.abs(change)) + '</td><td class="center">=</td><td class="money">' + fmtMoney(row.newMonthly) + '</td></tr>';
    }).join("");
    const intro = replaceDocumentPlaceholders(settings.vorauszahlungIntro, { datum:effectiveDate, betrag:fmtMoney(warmRent) });
    return '<section class="supplement-section prepayment-section"><h2 class="supplement-heading">Anpassung der Nebenkostenvorauszahlung</h2>' +
      (intro ? '<p class="prepayment-intro">' + briefProseHtml(intro) + '</p>' : '') +
      '<table class="prepay-table" aria-label="Anpassung der Nebenkostenvorauszahlung"><colgroup><col class="col-prepay-label"><col class="col-prepay-turnus"><col class="col-prepay-old"><col class="col-prepay-operator"><col class="col-prepay-change"><col class="col-prepay-equals"><col class="col-prepay-new"></colgroup>' +
      '<thead><tr><th>Art der Nebenkosten</th><th>Turnus</th><th>bisheriger<br>Betrag</th><th></th><th>Änderung ab<br>' + escapeHtml(effectiveDate) + '</th><th></th><th>Neuer Betrag ab<br>' + escapeHtml(effectiveDate) + '</th></tr></thead>' +
      '<tbody>' + rowHtml +
      '<tr class="prepay-summary"><td colspan="6">Summe Nebenkostenvorauszahlung ab ' + escapeHtml(effectiveDate) + '</td><td class="money">' + fmtMoney(sumNew) + '</td></tr>' +
      '<tr class="prepay-rent"><td colspan="6">Kaltmiete</td><td class="money">' + fmtMoney(coldRent) + '</td></tr>' +
      '<tr class="prepay-final"><td colspan="6">Gesamtbetrag (Warmmiete) ab ' + escapeHtml(effectiveDate) + '</td><td class="money">' + fmtMoney(warmRent) + '</td></tr>' +
      '</tbody></table></section>' +
      (String(settings.dauerauftragText || "").trim() ? '<div class="payment-notice"><span class="payment-notice-title">Hinweis zur Zahlung</span>' + briefProseHtml(replaceDocumentPlaceholders(settings.dauerauftragText, { datum:effectiveDate, betrag:fmtMoney(warmRent) })) + '</div>' : '');
  }

  function mainPageHtml(settings, tenant, year, costRows, result, correction, settlement, pageCount) {
    const address = getBriefTenantAddress(tenant);
    const senderLine = String(settings.absenderZeile || [settings.absenderName || settings.absender, settings.absenderStrasse, settings.absenderOrt].filter(Boolean).join(" · "));
    const period = billingPeriodText();
    const intro = replaceDocumentPlaceholders(settings.introText, { jahr:year, zeitraum:period, zahlungsziel:briefDate(settings.zahlungsziel) });
    const paymentSource = settlement.isNachzahlung ? settings.saldoTextNachzahlung : settings.saldoTextGuthaben;
    const paymentText = replaceDocumentPlaceholders(paymentSource, { jahr:year, zeitraum:period, zahlungsziel:briefDate(settings.zahlungsziel), betrag:fmtMoney(settlement.amount) });
    return '<section class="letter-sheet letter-main-sheet" data-page="1" data-page-count="' + pageCount + '">' +
      briefHeaderHtml(settings) + briefInfoHtml(settings, tenant) +
      '<div class="letter-address-window"><div class="letter-return-address">' + escapeHtml(senderLine) + '</div><div class="letter-address">' + briefTextWithLineBreaks(address) + '</div></div>' +
      '<main class="letter-main-content"><h1 class="letter-title">Nebenkostenabrechnung ' + escapeHtml(year) + '</h1>' +
      '<p class="letter-salutation">' + escapeHtml(salutationForTenant(tenant)) + '</p>' +
      (intro ? '<p class="letter-intro">' + briefProseHtml(intro) + '</p>' : '') +
      resultStripHtml(result, settlement) +
      '<h2 class="detail-heading">Abrechnungsübersicht im Detail:</h2>' + mainTableHtml(costRows, result, correction, settlement, year) +
      (String(settings.heizkostenFussnote || "").trim() ? '<div class="notice-box"><span class="notice-title">Hinweise</span>' + briefProseHtml(settings.heizkostenFussnote) + '</div>' : '') +
      (paymentText.trim() ? '<p class="payment-text">' + briefProseHtml(paymentText) + '</p>' : '') +
      (pageCount === 1 ? documentEndHtml(settings, false) : '') + '</main>' +
      briefFooterHtml(settings, 1, pageCount) + '</section>';
  }

  function supplementPageHtml(settings, tenant, costRows, additionalText, pageCount) {
    const adjustmentHtml = prepaymentSectionHtml(costRows, tenant);
    const extra = String(additionalText || "").trim();
    const extraSection = extra ? '<section class="supplement-section"><h2 class="supplement-heading">Zusätzliche Erläuterungen zur Abrechnung</h2><div class="additional-note-box">' + briefParagraphsHtml(extra, "letter-prose") + '</div></section>' : '';
    return '<section class="letter-sheet letter-supplement-sheet" data-page="2" data-page-count="' + pageCount + '">' +
      briefHeaderHtml(settings) + briefInfoHtml(settings, tenant) +
      '<main class="supplement-content"><div class="supplement-sections">' + extraSection + adjustmentHtml + '</div>' +
      '<div class="supplement-end">' + (String(settings.abschlusstext || "").trim() ? '<p class="supplement-closing-text">' + briefProseHtml(settings.abschlusstext) + '</p>' : '') + documentEndHtml(settings, false) + '</div></main>' + briefFooterHtml(settings, 2, pageCount) + '</section>';
  }

  function buildPrepaymentPage(costRows, tenant, extraNote = "") {
    ensureBriefSettings();
    if (!prepaymentAdjustmentRequired(costRows, tenant) && !String(extraNote || "").trim()) return "";
    return supplementPageHtml(state.briefSettings, tenant, costRows, extraNote, 2);
  }

  function briefMainPageOverflows(pageHtml) {
    if (typeof document === "undefined" || !document.body) return false;
    const host = document.createElement("div");
    host.style.cssText = "position:absolute;left:-20000px;top:0;width:210mm;visibility:hidden;pointer-events:none;";
    host.innerHTML = '<style>' + documentStyleText() + '</style><div class="nk-letter-document">' + pageHtml + '</div>';
    document.body.appendChild(host);
    const sheet = host.querySelector(".letter-main-sheet");
    const content = host.querySelector(".letter-main-content");
    const footer = host.querySelector(".letter-footer");
    const overflow = !!(sheet && content && footer && (content.scrollHeight > content.clientHeight + 1 || content.getBoundingClientRect().bottom > footer.getBoundingClientRect().top));
    host.remove();
    return overflow;
  }

  function buildBriefHtml(calc, result) {
    ensureBriefSettings();
    const settings = state.briefSettings;
    if (!result || !result.tenant) return '<style data-nk-letter-styles>' + documentStyleText() + '</style><div class="nk-letter-document"><section class="letter-sheet"><p style="padding:20mm">Es ist kein Mieter mit berechneter Nebenkostenumlage vorhanden.</p></section></div>';

    const tenant = result.tenant;
    const year = settings.abrechnungsjahr || currentAbrechnungsjahr();
    const costRows = briefCostRows(calc, tenant);
    const correction = num(result.correction !== undefined ? result.correction : tenant.vorjahresKorrektur);
    const settlement = settlementInfoForResult(result, tenant);
    const additionalText = String(settings.outroText || "").trim();
    const hasSupplement = !!additionalText || prepaymentAdjustmentRequired(costRows, tenant);
    const pageCount = hasSupplement ? 2 : 1;
    const pages = mainPageHtml(settings, tenant, year, costRows, result, correction, settlement, pageCount) +
      (hasSupplement ? supplementPageHtml(settings, tenant, costRows, additionalText, pageCount) : "");
    return '<style data-nk-letter-styles>' + documentStyleText() + '</style><div class="nk-letter-document" data-document-pages="' + pageCount + '">' + pages + '</div>';
  }

  function plainLetterTextFromHtml(htmlText) {
    const div = document.createElement("div");
    div.innerHTML = htmlText;
    div.querySelectorAll("style,script").forEach(node => node.remove());
    return div.innerText || div.textContent || "";
  }

  global.NKProDocumentRenderer = Object.freeze({
    briefSettlementSummaryHtml,
    plainLetterTextFromHtml,
    briefTextWithLineBreaks,
    briefProseHtml,
    briefPrintStyles,
    briefPreflightBoxHtml,
    printGuideHtml,
    printHardeningBoxHtml,
    printReportText,
    printWindowHtml,
    costSectionRows,
    buildPrepaymentPage,
    briefMainPageOverflows,
    buildBriefHtml
  });
})(globalThis);
