(function(global) {
  "use strict";

  // Darstellungsbezogene HTML-Erzeugung für Briefe und Druckdokumente.
  // app.js behält nur kleine globale Kompatibilitätsweiterleitungen.

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

  function briefPrintStyles() {
    return `@page{size:A4;margin:0}
  *{box-sizing:border-box}
  body{margin:0;background:white;color:#111;font-family:Arial,sans-serif;font-size:10.8px;line-height:1.3}
  .letter-sheet{width:210mm;height:297mm;min-height:297mm;margin:0 auto;padding:13mm 13mm 10mm;color:#111;font-family:Arial,sans-serif;font-size:10.8px;line-height:1.3;page-break-after:always;break-after:page;display:flex;flex-direction:column;overflow:hidden;position:relative}.letter-topbar{position:absolute;top:12mm;left:20mm;right:16mm;min-height:17mm;font-size:9.4px;line-height:1.2;border-bottom:1px solid #69727d;padding-bottom:2mm}.letter-window-zone{position:absolute;top:45mm;left:20mm;width:90mm;height:45mm;overflow:hidden}.return-address{font-size:7.6px;line-height:1.15;text-decoration:underline;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4mm}.letter-window-zone .address{min-height:0;margin:0;font-size:11.1px;line-height:1.24}.letter-main-date{position:absolute;top:91mm;right:16mm;font-size:10.8px}.letter-main-content{padding-top:77mm}.letter-supplement-sheet .letter-body,.letter-prepayment-sheet .letter-body{padding-top:4mm}.letter-main-sheet .abrechnung-table{font-size:8.9px;line-height:1.12;margin:2px 0 4px}.letter-main-sheet .abrechnung-table th,.letter-main-sheet .abrechnung-table td{padding:2px 2.8px}.letter-main-sheet .abrechnung-table .section-title td{padding-top:2.8px;padding-bottom:2px;font-size:9px}.letter-main-sheet .abrechnung-table .subtotal td,.letter-main-sheet .abrechnung-table .summary td{font-size:9px}.letter-main-sheet .abrechnung-table .summary.final td{font-size:9.2px}.letter-main-sheet .abrechnung-table .summary-spacer td{height:3mm}.letter-main-sheet .after-table-note{margin:.8mm 0;font-size:8.35px;line-height:1.12}.letter-main-sheet .saldo-note{margin:.9mm 0;font-size:8.9px;line-height:1.14}.letter-main-sheet .closing{margin-top:1.2mm;font-size:9.5px;line-height:1.16}.letter-main-sheet .signature-block{margin-top:1.5mm}.letter-main-sheet .footer{font-size:7.8px;padding-top:1.5px}
  .letter-sheet:last-child{page-break-after:auto;break-after:auto}
  .letter-body{flex:1 1 auto;min-height:0;display:block}
  .letter-head{text-align:center;font-size:9.5px;font-weight:700;line-height:1.2;padding-bottom:5.5px;border-bottom:2px solid #222;margin-bottom:12mm}
  .address{min-height:25mm;margin-bottom:4.5mm;font-size:11.1px;line-height:1.24}
  .date{text-align:right;margin:0 0 5mm;font-size:11.1px}.salutation{margin:0 0 3.4mm;font-size:11.1px}.intro{margin:0 0 4.8mm;font-size:11.1px;line-height:1.3}
  h2{font-size:12.6px;margin:0 0 5.2mm;color:#111}
  table{border-collapse:separate;border-spacing:0;table-layout:fixed;width:100%;min-width:0;max-width:100%;font-size:9.15px;line-height:1.22;margin:4px 0 7px}
  th,td{border:none;border-bottom:1px solid #b9c0c8;padding:2.8px 3.6px;vertical-align:middle;white-space:normal;overflow-wrap:normal;word-break:normal;hyphens:auto}
  th{position:static;background:#f1f3f5;color:#111;font-weight:700;text-align:left;border-top:1px solid #aeb6bf;font-size:9px;line-height:1.16}tr:nth-child(even) td{background:#fbfbfb}.money{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.center{text-align:center}
  .abrechnung-table col.col-desc{width:29%}.abrechnung-table col.col-period{width:13%}.abrechnung-table col.col-total{width:14%}.abrechnung-table col.col-basis{width:12%}.abrechnung-table col.col-price{width:11%}.abrechnung-table col.col-units{width:10%}.abrechnung-table col.col-share{width:11%}
  .abrechnung-table .section-title td{border-top:1.5px solid #68717a;border-bottom:1px solid #8d96a0;padding:4.2px 3.6px 3px;font-weight:800;background:#eef1f4;font-size:9.25px}.abrechnung-table .subtotal td{font-weight:800;background:#f4f5f6;font-size:9.15px}.abrechnung-table .summary td{background:#e5e7ea;font-weight:800;border-bottom:1px solid #777;font-size:9.25px}.abrechnung-table .summary-spacer td{height:5.5mm;padding:0;line-height:0;background:#fff!important;border:0}.abrechnung-table .summary-block-start td{border-top:1.5px solid #222}.abrechnung-table .summary.final td{background:#d7dbe0;font-weight:900;border-top:1.5px solid #222;border-bottom:1.5px solid #222;font-size:9.45px}
  .note{margin:2.6mm 0 2.6mm;font-size:11.1px;line-height:1.28}.after-table-note{margin:0 0 2.4mm;font-size:10.2px;line-height:1.26}.saldo-note{margin:2.6mm 0 2.6mm;font-size:11.1px;line-height:1.28}.closing{margin:4.6mm 0 0;font-size:11.1px;line-height:1.32}.closing-greeting{display:block}.signature-block{display:block;margin-top:9mm}.footer{margin-top:auto;flex:0 0 auto;font-size:8.4px;line-height:1.18;color:#111;border-top:2px solid #222;padding-top:2.4px;text-align:center}
  .prepay-intro{font-size:11.1px;line-height:1.3;margin-bottom:4.8mm}.letter-bullet-list{margin:0 0 4.8mm}.letter-bullet{display:grid;grid-template-columns:4.4mm minmax(0,1fr);column-gap:2mm;align-items:start;font-size:11.1px;line-height:1.3;margin:0 0 3.2mm}.letter-bullet:last-child{margin-bottom:0}.letter-bullet-mark{font-size:11px;line-height:1.3;text-align:center;padding-top:.1mm}
  .prepay-table{font-size:9.35px;line-height:1.22;margin-top:2.8mm}.prepay-table col.col-prepay-label{width:36%}.prepay-table col.col-prepay-turnus{width:13%}.prepay-table col.col-prepay-money{width:17%}.prepay-table th,.prepay-table td{border:none;border-bottom:1px solid #b9c0c8;padding:3.1px 4px;vertical-align:middle}.prepay-table th{background:#f1f3f5;color:#111;font-weight:700;text-align:left;border-top:1px solid #aeb6bf;font-size:9.1px;line-height:1.18}.prepay-table .summary td{background:#e5e7ea;font-weight:800;border-bottom:1px solid #777;font-size:9.35px}.prepay-table .summary.final td{background:#d7dbe0;font-weight:900;border-top:1.5px solid #222;border-bottom:1.5px solid #222;font-size:9.55px}
  /* V62: größere Brieftabellen ohne Umbruch */
  .abrechnung-table,.prepay-table{table-layout:fixed;width:100%;font-size:10.15px;line-height:1.22;margin:5px 0 8px}
  .abrechnung-table th,.abrechnung-table td,.prepay-table th,.prepay-table td{white-space:nowrap;overflow-wrap:normal;word-break:normal;hyphens:none;padding:4.1px 4.6px;vertical-align:middle}
  .abrechnung-table th,.prepay-table th{font-size:9.7px;line-height:1.18}
  .abrechnung-table col.col-desc{width:32%}.abrechnung-table col.col-period{width:11%}.abrechnung-table col.col-total{width:13%}.abrechnung-table col.col-basis{width:11%}.abrechnung-table col.col-price{width:10%}.abrechnung-table col.col-units{width:10%}.abrechnung-table col.col-share{width:13%}
  .abrechnung-table .section-title td{font-size:10.05px;padding:5px 4.6px 4px}.abrechnung-table .subtotal td,.abrechnung-table .summary td{font-size:10.15px}.abrechnung-table .summary.final td{font-size:10.35px}
  .prepay-table col.col-prepay-label{width:34%}.prepay-table col.col-prepay-turnus{width:10%}.prepay-table col.col-prepay-money{width:18.67%}.prepay-table th{font-size:9.65px}.prepay-table .summary td{font-size:10.15px}.prepay-table .summary.final td{font-size:10.35px}
  
  /* V63: Header dürfen umbrechen, Tabellenwerte bleiben einzeilig */
  .abrechnung-table thead th,.prepay-table thead th{white-space:normal;overflow-wrap:normal;word-break:normal;hyphens:none;line-height:1.14;padding-top:4.4px;padding-bottom:4.4px;vertical-align:middle}
  .abrechnung-table tbody td,.prepay-table tbody td{white-space:nowrap;overflow-wrap:normal;word-break:normal;hyphens:none}
  .letter-main-sheet{padding-bottom:5mm}.letter-main-sheet .salutation{margin:0 0 2.2mm;font-size:10.2px;line-height:1.18}.letter-main-sheet .intro{margin:0 0 2.8mm;font-size:10.2px;line-height:1.22}.letter-main-sheet .abrechnung-table{font-size:8.25px;line-height:1.08;margin:1px 0 3px}.letter-main-sheet .abrechnung-table th,.letter-main-sheet .abrechnung-table td{padding:1.35px 2.3px}.letter-main-sheet .abrechnung-table thead th{font-size:8.15px;line-height:1.08;padding-top:1.8px;padding-bottom:1.8px}.letter-main-sheet .abrechnung-table .section-title td{padding:2px 2.3px 1.5px;font-size:8.45px}.letter-main-sheet .abrechnung-table .subtotal td,.letter-main-sheet .abrechnung-table .summary td{font-size:8.35px}.letter-main-sheet .abrechnung-table .summary.final td{font-size:8.55px}.letter-main-sheet .abrechnung-table .summary-spacer td{height:1.8mm}.letter-main-sheet .after-table-note{margin:.8mm 0;font-size:8.35px;line-height:1.12}.letter-main-sheet .saldo-note{margin:.9mm 0;font-size:8.9px;line-height:1.14}.letter-main-sheet .closing{margin-top:1.2mm;font-size:9.5px;line-height:1.16}.letter-main-sheet .signature-block{margin-top:1.5mm}.letter-main-sheet .footer{font-size:7.8px;padding-top:1.5px}
  .muted{color:#333}.nowrap{white-space:nowrap}.letter-page-note{font-size:8.8px;color:#333;margin-top:3mm}
  /* V70: Druck-/PDF-Härtung */
  html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.print-guide{border:1px solid #b6d7ef;background:#eef5fb;border-radius:8px;padding:10px 12px;margin:0 auto 10px;width:210mm;max-width:100%;box-sizing:border-box;font-family:Arial,sans-serif;color:#173b5a}.print-guide strong{display:block;margin-bottom:4px}.screen-print-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.screen-print-actions button{border:1px solid #b6d7ef;background:#fff;color:#173b5a;border-radius:6px;padding:7px 10px;font-weight:700;cursor:pointer}table,tr,.footer,.summary.final{page-break-inside:avoid;break-inside:avoid}@media print{.print-guide{display:none!important}.letter-sheet{border:0!important;box-shadow:none!important;page-break-inside:avoid;break-inside:avoid}table,tr,.footer,.summary.final{page-break-inside:avoid;break-inside:avoid}}`;
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
    return '<div class="print-guide"><strong>Druck-/PDF-Hinweis ' + escapeHtml(scopeLabel || "") + '</strong><div>A4 wählen · Skalierung 100 % · Browser-Kopf-/Fußzeilen deaktivieren · Hintergrundgrafiken/Farben aktivieren, falls der Browser danach fragt.</div><div class="screen-print-actions"><button type="button" onclick="window.print()">Jetzt drucken / PDF speichern</button><button type="button" onclick="window.close()">Fenster schließen</button></div></div>';
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
    return '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>' + escapeHtml(title || "Nebenkostenabrechnungsbrief") + '</title><style>' + briefPrintStyles() + '</style></head><body>' + printGuideHtml(scopeLabel || "") + bodyHtml + '</body></html>';
  }

  function costSectionRows(rows, year) {
    return rows.map(r => {
      const g = letterCostGroup(r);
      const manualExternal = isManualExternalCostDefinition(r);
      const showCalc = !manualExternal && (Math.abs(num(r.basisTotal)) > 0.004 || Math.abs(num(r.preis)) > 0.004 || Math.abs(num(r.einheiten)) > 0.004);
      const lineLabel = manualExternal ? manualExternalLetterLineLabel(g, r) : g.line;
      const rowPeriod = r.period || letterPeriod(year);
      return `
        <tr class="section-title"><td colspan="7">${escapeHtml(g.title)}</td></tr>
        <tr>
          <td>${escapeHtml(lineLabel)}</td>
          <td class="center">${escapeHtml(rowPeriod)}</td>
          <td class="money">${fmtMoney(r.gesamtbetrag)}</td>
          <td class="center">${showCalc ? escapeHtml(fmtUnits(r.basisTotal)) : ""}</td>
          <td class="money">${showCalc ? fmtMoney(r.preis) : ""}</td>
          <td class="center">${showCalc ? "x&nbsp;&nbsp;" + escapeHtml(fmtUnits(r.einheiten)) : ""}</td>
          <td class="money">${fmtMoney(r.anteil)}</td>
        </tr>
        <tr>
          <td>${escapeHtml(g.prepay)}</td>
          <td class="center">${escapeHtml(rowPeriod)}</td>
          <td></td><td></td><td></td><td></td>
          <td class="money">${fmtMoney(r.vorauszahlung)}</td>
        </tr>
        ${num(r.weitereVorauszahlung) ? '<tr><td>Weitere Vorauszahlung</td><td class="center">' + escapeHtml(rowPeriod) + '</td><td></td><td></td><td></td><td></td><td class="money">' + fmtMoney(r.weitereVorauszahlung) + '</td></tr>' : ''}
        <tr class="subtotal">
          <td colspan="6">${escapeHtml(settlementLabel(g, r.settlement))}</td>
          <td class="money">${fmtMoneySigned(r.settlement)}</td>
        </tr>`;
    }).join("");
  }

  function buildPrepaymentPage(costRows, tenant, extraNote = "") {
    ensureBriefSettings();
    const s = state.briefSettings;
    if (s.vorauszahlungPrintMode === "Nicht drucken" || s.showVorauszahlungPage !== "Ja") return "";
    const rows = monthlyPrepaymentRows(costRows, tenant);
    if (!rows.some(r => Math.abs(num(r.change)) >= 0.01)) return "";
    const sumNew = rows.reduce((a,b) => a + num(b.newMonthly), 0);
    const kaltMonthly = num(tenant.kaltSoll) / 12;
    const warmMonthly = kaltMonthly + sumNew;
    const effectiveDate = effectivePrepaymentDateLabel();
    const effectiveYear = effectivePrepaymentYearLabel();
    const summaryLabel = effectiveYear ? "Summe Nebenkostenvorauszahlung ab " + effectiveYear + " monatlich" : "Summe Nebenkostenvorauszahlung ab " + effectiveDate + " monatlich";
    const warmLabel = effectiveYear ? "Gesamtbetrag (Warmmiete) ab " + effectiveYear + " monatlich" : "Gesamtbetrag (Warmmiete) ab " + effectiveDate + " monatlich";
    const rowHtml = rows.map(r => `
      <tr>
        <td>${escapeHtml(r.label)}</td>
        <td>${escapeHtml(r.turnus)}</td>
        <td class="money">${fmtMoney(r.oldMonthly)}</td>
        <td class="money">${fmtMoneySigned(r.change)}</td>
        <td class="money">${r.newMonthly ? fmtMoney(r.newMonthly) : "- €"}</td>
      </tr>`).join("");
  
    return `
      <div class="letter-sheet letter-prepayment-sheet">
        <div class="letter-body">
          <div class="letter-head">
            ${briefTextWithLineBreaks(s.absenderName || s.absender)}<br>
            ${briefTextWithLineBreaks(s.absenderStrasse || "")}<br>
            ${briefTextWithLineBreaks(s.absenderOrt || "")}<br>
            ${briefTextWithLineBreaks(s.absenderTelefon || "")}
          </div>
          <h2>Anpassung der Nebenkostenvorauszahlung</h2>
          <div class="letter-bullet-list">
            <div class="letter-bullet"><span class="letter-bullet-mark">•</span><span>${briefProseHtml((s.vorauszahlungIntro || "").replace("{datum}", effectiveDate))}</span></div>
          </div>
          <table class="prepay-table">
            <colgroup><col class="col-prepay-label"><col class="col-prepay-turnus"><col class="col-prepay-money"><col class="col-prepay-money"><col class="col-prepay-money"></colgroup>
            <thead>
              <tr><th>Art der Nebenkosten</th><th>Turnus</th><th class="money">Bisheriger Betrag</th><th class="money">Änderung ab ${escapeHtml(effectiveDate)}</th><th class="money">Neuer Betrag ab ${escapeHtml(effectiveDate)}</th></tr>
            </thead>
            <tbody>
              ${rowHtml}
              <tr class="summary"><td colspan="4">${escapeHtml(summaryLabel)}</td><td class="money">${fmtMoney(sumNew)}</td></tr>
              <tr><td colspan="4">Kaltmiete monatlich</td><td class="money">${fmtMoney(kaltMonthly)}</td></tr>
              <tr class="summary final"><td colspan="4">${escapeHtml(warmLabel)}</td><td class="money">${fmtMoney(warmMonthly)}</td></tr>
            </tbody>
          </table>
          <div class="letter-bullet-list">
            <div class="letter-bullet"><span class="letter-bullet-mark">•</span><span>Bitte passen Sie Ihren monatlichen Dauerauftrag bei Ihrer Bank ab ${escapeHtml(effectiveDate)} auf ${fmtMoney(warmMonthly)} an.</span></div>
          </div>
          ${extraNote ? '<p class="note">' + briefProseHtml(extraNote) + '</p>' : ''}
          <p class="closing"><span class="closing-greeting">${briefTextWithLineBreaks(s.gruss)}</span><span class="signature-block">${briefTextWithLineBreaks(s.signatur)}</span></p>
        </div>
        <div class="footer">Kontoverbindung: ${escapeHtml(s.bankverbindung)}</div>
      </div>`;
  }

  function briefMainPageOverflows(pageHtml) {
    if (typeof document === "undefined" || !document.body) return false;
    const host = document.createElement("div");
    host.className = "letter-page";
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:absolute;left:-12000px;top:0;width:210mm;max-width:none;padding:0;visibility:hidden;pointer-events:none;";
    host.innerHTML = pageHtml;
    document.body.appendChild(host);
    const sheet = host.querySelector(".letter-main-sheet");
    const content = host.querySelector(".letter-main-content");
    const footer = host.querySelector(".letter-main-sheet > .footer");
    let overflow = false;
    if (sheet && content && footer) {
      const children = Array.from(content.children).filter(el => el.getClientRects().length);
      const last = children[children.length - 1];
      const lastBottom = last ? last.getBoundingClientRect().bottom : content.getBoundingClientRect().top;
      const footerTop = footer.getBoundingClientRect().top;
      overflow = lastBottom > footerTop - 4 || sheet.scrollHeight > sheet.clientHeight + 1;
    }
    host.remove();
    return overflow;
  }

  function buildBriefHtml(calc, result) {
    ensureBriefSettings();
    const s = state.briefSettings;
    if (!result) return '<div class="letter-sheet"><p>Es ist kein Mieter mit berechneter Nebenkostenumlage vorhanden.</p></div>';
  
    const t = result.tenant;
    const year = s.abrechnungsjahr || currentAbrechnungsjahr();
    const costRows = briefCostRows(calc, t);
    const correction = num(result.correction || t.vorjahresKorrektur);
    const settlement = settlementInfoForResult(result, t);
    const finalLabel = settlement.finalLabel;
    const noteText = settlement.isNachzahlung ? s.saldoTextNachzahlung : s.saldoTextGuthaben;
    const address = getBriefTenantAddress(t);
    const intro = (s.introText || "").replaceAll("{jahr}", year).replaceAll("{zeitraum}", periodLabelShort());
    const senderLine = [s.absenderName || s.absender, s.absenderStrasse, s.absenderOrt].filter(Boolean).join(" · ");
    const extraText = String(s.outroText || "");
    const prepaymentPage = buildPrepaymentPage(costRows, t, extraText);
  
    const mainPage = (outroText, includeClosing) => `
      <div class="letter-sheet letter-main-sheet">
        <div class="letter-topbar">${briefTextWithLineBreaks(s.absenderName || s.absender)} · ${briefTextWithLineBreaks(s.absenderStrasse || "")} · ${briefTextWithLineBreaks(s.absenderOrt || "")} · ${briefTextWithLineBreaks(s.absenderTelefon || "")}</div>
        <div class="letter-window-zone"><div class="return-address">${escapeHtml(senderLine)}</div><div class="address">${briefTextWithLineBreaks(address)}</div></div>
        <div class="letter-main-date">${escapeHtml(s.ort || "")}, den ${escapeHtml(dateDe(s.briefdatum))}</div>
        <div class="letter-body letter-main-content">
          <p class="salutation">${escapeHtml(salutationForTenant(t))}</p>
          <p class="intro">${briefProseHtml(intro)}</p>
          <table class="abrechnung-table">
            <colgroup><col class="col-desc"><col class="col-period"><col class="col-total"><col class="col-basis"><col class="col-price"><col class="col-units"><col class="col-share"></colgroup>
            <thead><tr><th></th><th class="center">Zeitraum</th><th class="money">Gesamtkosten p.a.</th><th class="center">Gesamteinheiten</th><th class="money">Preis je Einheit</th><th class="center">x&nbsp;Ihre Einheiten</th><th class="money">Ihre Kosten</th></tr></thead>
            <tbody>
              ${costSectionRows(costRows, year) || '<tr><td colspan="7">Keine umlagefähigen Kosten vorhanden.</td></tr>'}
              <tr class="summary-spacer" aria-hidden="true"><td colspan="7"></td></tr>
              <tr class="summary summary-block-start"><td colspan="6">Ihr Anteil an den Gesamtkosten</td><td class="money">${fmtMoney(result.costShare)}</td></tr>
              <tr class="summary"><td colspan="6">Ihre Vorauszahlung</td><td class="money">${fmtMoney(result.prepayments)}</td></tr>
              ${correction ? '<tr class="summary"><td colspan="6">Nebenkostenkorrektur ' + escapeHtml(String(global.NKProArchiveActions.yearNumber(year)-1)) + ' zu Ihren Gunsten</td><td class="money">' + fmtMoney(correction) + '</td></tr>' : ''}
              <tr class="summary final"><td colspan="6">${escapeHtml(finalLabel)}</td><td class="money">${fmtMoney(settlement.amount)}</td></tr>
            </tbody>
          </table>
          <p class="note after-table-note">${briefProseHtml(s.heizkostenFussnote || "")}</p>
          <p class="note saldo-note">${briefProseHtml(noteText || "")}</p>
          ${outroText ? '<p class="note saldo-note">' + briefProseHtml(outroText) + '</p>' : ''}
          ${includeClosing ? '<p class="closing"><span class="closing-greeting">' + briefTextWithLineBreaks(s.gruss) + '</span><span class="signature-block">' + briefTextWithLineBreaks(s.signatur) + '</span></p>' : ''}
        </div>
        <div class="footer">Kontoverbindung: ${escapeHtml(s.bankverbindung)}</div>
      </div>`;
  
    let mainHtml = mainPage(prepaymentPage ? "" : extraText, !prepaymentPage);
    let supplementPage = "";
    if (!prepaymentPage && extraText && briefMainPageOverflows(mainHtml)) {
      mainHtml = mainPage("", false);
      supplementPage = `<div class="letter-sheet letter-supplement-sheet"><div class="letter-body"><h2>Ergänzender Hinweis zur Nebenkostenabrechnung</h2><p class="note">${briefProseHtml(extraText)}</p><p class="closing"><span class="closing-greeting">${briefTextWithLineBreaks(s.gruss)}</span><span class="signature-block">${briefTextWithLineBreaks(s.signatur)}</span></p></div><div class="footer">Kontoverbindung: ${escapeHtml(s.bankverbindung)}</div></div>`;
    }
    return mainHtml + prepaymentPage + supplementPage;
  }

  function plainLetterTextFromHtml(htmlText) {
    const div = document.createElement("div");
    div.innerHTML = htmlText;
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
