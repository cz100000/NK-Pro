"use strict";

// AP12: Qualitätsprüfung, Abnahmeprotokoll und Dashboarddarstellung.
// ===== Bereich: V49-Fachcheck und finale Abrechnungssicherheit =====














function specialCaseSeverityClass(severity) {
  if (severity === "Fehler") return "err";
  if (severity === "Prüfen") return "warn";
  return "ok";
}



function specialCaseBadgesForTenant(m) {
  const badges = [];
  const expectedDays = NK_PRO_MODULES.qualityAssurance.expectedTenantDaysInCurrentPeriod(m);
  const periodDays = periodDaysExact();
  const enteredDays = tenantDays(m);
  const unit = state.wohnungen.find(w => w.id === m.wohnung);
  function badge(text, cls) { badges.push('<span class="special-case-badge ' + cls + '">' + escapeHtml(text) + '</span>'); }
  if (isPrivateTenant(m)) badge("Eigentümer/Privat", "ok");
  if (expectedDays > 0 && expectedDays < periodDays) badge("unterjährig", "ok");
  if (m.auszug && tenantOverlapsCurrentPeriod(m)) badge("NK offen", "warn");
  if (unit && unit.status !== "aktiv") badge("Wohnung inaktiv", "warn");
  if (expectedDays > 0 && Math.abs(enteredDays - expectedDays) > 1) badge("Tage prüfen", "warn");
  if (!m.wohnung || (m.wohnung && !unit)) badge("Zuordnung prüfen", "err");
  if (!badges.length) badge("Standard", "ok");
  return badges.join(" ");
}

function renderSpecialCaseWatch() {
  const el = document.getElementById("sonderfallWatchBox");
  if (!el) return;
  const report = NK_PRO_MODULES.qualityAssurance.specialCases();
  const visibleRows = report.rows.filter(r => r.severity !== "Info");
  const infoRows = report.rows.filter(r => r.severity === "Info");
  const rowsHtml = visibleRows.length ? visibleRows.slice(0, 12).map(r => '<tr><td><span class="status ' + qualitySeverityClass(r.severity) + '">' + escapeHtml(r.severity) + '</span></td><td>' + escapeHtml(r.type) + '</td><td>' + escapeHtml(r.subject) + '</td><td>' + escapeHtml(r.detail) + '</td></tr>').join("") : '<tr><td colspan="4">Keine prüfpflichtigen Sonderfälle.</td></tr>';
  const infoHtml = infoRows.length ? '<details><summary>Info-Sonderfälle anzeigen (' + infoRows.length + ')</summary><div class="table-wrap dashboard-table"><table><thead><tr><th>Typ</th><th>Betreff</th><th>Details</th></tr></thead><tbody>' + infoRows.map(r => '<tr><td>' + escapeHtml(r.type) + '</td><td>' + escapeHtml(r.subject) + '</td><td>' + escapeHtml(r.detail) + '</td></tr>').join("") + '</tbody></table></div></details>' : '';
  el.innerHTML = '<div class="special-watch-box ' + report.level + '"><div class="inline-titlebar"><div><strong>Sonderfall-Wächter: ' + escapeHtml(report.label) + '</strong><div class="small">' + escapeHtml(report.message) + '</div></div><span class="period-badge">' + report.errors + ' Fehler · ' + report.checks + ' prüfen · ' + report.hints + ' Hinweise</span></div>' +
    '<div class="special-watch-grid"><div class="special-watch-pill"><strong>Abrechenbare Mieter</strong><br>' + report.billableCount + '</div><div class="special-watch-pill"><strong>Eigentümer/Privat</strong><br>' + report.privateCount + '</div><div class="special-watch-pill"><strong>Unterjährig/Wechsel</strong><br>' + report.underjaehrig + '</div><div class="special-watch-pill"><strong>Leerstand</strong><br>' + report.leerstand + '</div></div>' +
    '<div class="table-wrap dashboard-table" style="margin-top:10px"><table><thead><tr><th>Status</th><th>Typ</th><th>Betreff</th><th>Details</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div>' + infoHtml + '</div>';
}

function settlementInfoForResult(...args) { return NK_PRO_MODULES.documentData.settlementInfoForResult(...args); }

function briefSettlementSummaryHtml(...args) { return NK_PRO_MODULES.documentRenderer.briefSettlementSummaryHtml(...args); }



function acceptanceProtocolData(...args) { return NK_PRO_MODULES.documentData.acceptanceProtocolData(...args); }

function acceptanceLevel(...args) { return NK_PRO_MODULES.documentData.acceptanceLevel(...args); }

function acceptanceLabel(...args) { return NK_PRO_MODULES.documentData.acceptanceLabel(...args); }

function finalBillingReportText() {
  const data = acceptanceProtocolData();
  const report = data.quality;
  const readiness = data.readiness;
  const calc = data.calc;
  const totals = data.totals;
  const backup = data.backup;
  const special = data.special;
  const brief = data.brief;
  const finalization = data.finalization;
  const acceptance = acceptanceLabel(acceptanceLevel(data));
  const lines = [];
  lines.push("NK-Pro " + APP_VERSION + " · Finaler Prüfbericht / Abnahmeprotokoll");
  lines.push("Erstellt: " + new Date().toLocaleString("de-DE"));
  lines.push("Abrechnungszeitraum: " + periodLabelShort());
  lines.push("Abnahme-Status: " + acceptance);
  lines.push("Finaler Abrechnungscheck: " + readiness.label + " · " + readiness.message);
  lines.push("");
  lines.push("Finalisierung");
  lines.push("- Status: " + (finalization.finalized ? "finalisiert / Eingaben geschützt" : "bearbeitbar"));
  if (finalization.meta && finalization.meta.currentBillingFinalizedAt) lines.push("- Finalisiert am: " + new Date(finalization.meta.currentBillingFinalizedAt).toLocaleString("de-DE"));
  if (finalization.meta && finalization.meta.currentBillingFinalizedWithAppVersion) lines.push("- Finalisiert mit: " + finalization.meta.currentBillingFinalizedWithAppVersion);
  lines.push("");
  lines.push("Summen");
  lines.push("- Aktive umlagefähige Kosten: " + fmtMoney(totals.totalCosts));
  lines.push("- Auf echte Mieter umgelegt: " + fmtMoney(totals.billableShare));
  lines.push("- Eigentümer-/Privatanteil: " + fmtMoney(totals.privateShare));
  lines.push("- Nicht auf Mieter umgelegt/offen: " + fmtMoney(totals.ownerShare));
  lines.push("- Geleistete Vorauszahlungen: " + fmtMoney(totals.prepayments));
  lines.push("- Einmalige Korrekturen/Gutschriften: " + fmtMoney(totals.corrections));
  lines.push("- Summendifferenz aktive Kosten vs. Verteilung: " + fmtMoney(totals.allocationDelta));
  lines.push("- Saldo Mieter gesamt: " + fmtMoney(totals.balance));
  lines.push("");
  lines.push("Mieter-Ergebnisse");
  if (!calc.tenantResults.length) lines.push("- Keine abrechenbaren Mieter.");
  calc.tenantResults.forEach(result => {
    const s = settlementInfoForResult(result, result.tenant);
    lines.push("- " + NK_PRO_MODULES.qualityAssurance.tenantQualityLabel(result.tenant) + " · " + unitDisplayIdByInternalId(result.tenant.wohnung) + ": " + s.type + " " + fmtMoney(s.amount) + " (Kosten " + fmtMoney(result.costShare) + ", Vorauszahlungen " + fmtMoney(result.prepayments) + ", Korrektur " + fmtMoney(result.correction) + ")");
  });
  if (calc.privateResults && calc.privateResults.length) {
    lines.push("");
    lines.push("Eigentümer-/Privatanteile");
    calc.privateResults.forEach(result => {
      lines.push("- " + NK_PRO_MODULES.qualityAssurance.tenantQualityLabel(result.tenant) + " · " + unitDisplayIdByInternalId(result.tenant.wohnung) + ": " + fmtMoney(result.costShare));
    });
  }
  lines.push("");
  lines.push("Brief-Preflight");
  if (brief) {
    lines.push("- Status: " + brief.label + " · " + brief.message);
    lines.push("- Ergebnis: " + brief.errors + " Fehler · " + brief.warnings + " Hinweise · " + brief.ok + " OK · " + brief.infos + " Druckhinweise");
    brief.items.filter(item => item.level === "err" || item.level === "warn").forEach(item => lines.push("- " + (item.level === "err" ? "Fehler" : "Prüfen") + " · " + item.label + ": " + item.detail));
  } else {
    lines.push("- Kein Brief-Preflight verfügbar.");
  }
  lines.push("");
  lines.push("Sonderfälle");
  if (special) {
    lines.push("- Status: " + special.label + " · " + special.message);
    lines.push("- Abrechenbare Mieter: " + special.billableCount + " · Eigentümer/Privat: " + special.privateCount + " · Unterjährig/Wechsel: " + special.underjaehrig + " · Leerstand: " + special.leerstand);
    special.rows.filter(r => r.severity !== "Info").forEach(r => lines.push("- " + r.severity + " · " + r.type + " · " + r.subject + (r.detail ? ": " + r.detail : "")));
  } else {
    lines.push("- Kein Sonderfallbericht verfügbar.");
  }
  lines.push("");
  lines.push("Backup-Status");
  if (backup) {
    lines.push("- Status: " + backup.message);
    lines.push("- Letztes Gesamtbackup: " + (backup.last ? new Date(backup.last).toLocaleString("de-DE") : "nicht dokumentiert"));
    lines.push("- Speicher: " + (backup.storage ? backup.storage.label : "unbekannt"));
  } else {
    lines.push("- Kein Backup-Status verfügbar.");
  }
  lines.push("");
  lines.push("Prüfpunkte");
  if (!report.issues.length) lines.push("- Keine auffälligen Punkte.");
  report.issues.forEach(item => lines.push("- " + item.severity + " · " + item.area + " · " + item.point + (item.detail ? ": " + item.detail : "")));
  return lines.join("\n");
}

function acceptanceProtocolRowsHtml(data) {
  const calc = data.calc;
  const tenantRows = calc.tenantResults.length ? calc.tenantResults.map(result => {
    const s = settlementInfoForResult(result, result.tenant);
    return '<tr><td>' + escapeHtml(NK_PRO_MODULES.qualityAssurance.tenantQualityLabel(result.tenant)) + '</td><td>' + escapeHtml(unitDisplayIdByInternalId(result.tenant.wohnung)) + '</td><td>' + escapeHtml(s.type) + '</td><td class="money">' + escapeHtml(fmtMoney(s.amount)) + '</td><td class="money">' + escapeHtml(fmtMoney(result.costShare)) + '</td><td class="money">' + escapeHtml(fmtMoney(result.prepayments)) + '</td><td class="money">' + escapeHtml(fmtMoney(result.correction)) + '</td></tr>';
  }).join("") : '<tr><td colspan="7">Keine abrechenbaren Mieter.</td></tr>';
  const privateRows = calc.privateResults && calc.privateResults.length ? calc.privateResults.map(result => '<tr><td>' + escapeHtml(NK_PRO_MODULES.qualityAssurance.tenantQualityLabel(result.tenant)) + '</td><td>' + escapeHtml(unitDisplayIdByInternalId(result.tenant.wohnung)) + '</td><td class="money">' + escapeHtml(fmtMoney(result.costShare)) + '</td></tr>').join("") : '<tr><td colspan="3">Keine Eigentümer-/Privatanteile.</td></tr>';
  const issueRows = data.quality.issues.length ? data.quality.issues.map(item => '<tr><td>' + escapeHtml(item.severity) + '</td><td>' + escapeHtml(item.area) + '</td><td>' + escapeHtml(item.point) + '</td><td>' + escapeHtml(item.detail || "") + '</td></tr>').join("") : '<tr><td colspan="4">Keine auffälligen Punkte.</td></tr>';
  const specialVisible = data.special && data.special.rows ? data.special.rows.filter(r => r.severity !== "Info") : [];
  const specialRows = specialVisible.length ? specialVisible.map(r => '<tr><td>' + escapeHtml(r.severity) + '</td><td>' + escapeHtml(r.type) + '</td><td>' + escapeHtml(r.subject) + '</td><td>' + escapeHtml(r.detail || "") + '</td></tr>').join("") : '<tr><td colspan="4">Keine prüfpflichtigen Sonderfälle.</td></tr>';
  const briefRows = data.brief && data.brief.items.length ? data.brief.items.map(item => '<tr><td>' + escapeHtml(item.level === "err" ? "Fehler" : (item.level === "warn" ? "Prüfen" : (item.level === "info" ? "Hinweis" : "OK"))) + '</td><td>' + escapeHtml(item.label) + '</td><td>' + escapeHtml(item.detail || "") + '</td></tr>').join("") : '<tr><td colspan="3">Kein Brief-Preflight verfügbar.</td></tr>';
  return { tenantRows, privateRows, issueRows, specialRows, briefRows };
}

function acceptanceProtocolHtml() {
  const data = acceptanceProtocolData();
  const level = acceptanceLevel(data);
  const rows = acceptanceProtocolRowsHtml(data);
  const totals = data.totals;
  const finalizedAt = data.finalization && data.finalization.meta && data.finalization.meta.currentBillingFinalizedAt ? new Date(data.finalization.meta.currentBillingFinalizedAt).toLocaleString("de-DE") : "nicht finalisiert";
  const backupLast = data.backup && data.backup.last ? new Date(data.backup.last).toLocaleString("de-DE") : "nicht dokumentiert";
  const html = '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>NK-Pro Abnahmeprotokoll ' + escapeHtml(currentAbrechnungsjahr()) + '</title>' +
    '<style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;color:#111;line-height:1.35;font-size:12px}h1{font-size:20px;margin:0 0 4px;color:#173b5a}h2{font-size:15px;margin:18px 0 6px;color:#173b5a}.meta{color:#555;margin-bottom:14px}.badge{display:inline-block;border-radius:999px;padding:4px 9px;font-weight:bold;background:#eef5fb;border:1px solid #b6d7ef}.badge.ok{background:#f2faf3;border-color:#b7d9bd}.badge.warn{background:#fff9e8;border-color:#ead28a}.badge.err{background:#fff4f4;border-color:#f1aaa5}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 14px}.box{border:1px solid #d8e3e8;border-radius:8px;padding:8px;background:#fff}.label{font-size:10px;color:#555}.value{font-weight:bold;font-size:13px}table{border-collapse:collapse;width:100%;margin:5px 0 12px}th,td{border:1px solid #c8c8c8;padding:4px 5px;vertical-align:top}th{background:#f1f3f5;text-align:left}.money{text-align:right;white-space:nowrap}.footer{margin-top:18px;border-top:1px solid #222;padding-top:5px;font-size:10px;color:#555}@media print{button{display:none}.box{break-inside:avoid}table{break-inside:auto}tr{break-inside:avoid}}</style></head><body>' +
    '<h1>Finaler Prüfbericht / Abnahmeprotokoll</h1><div class="meta">NK-Pro ' + escapeHtml(APP_VERSION) + ' · ' + escapeHtml(APP_VERSION_NAME) + ' · erstellt am ' + escapeHtml(new Date().toLocaleString("de-DE")) + '</div>' +
    '<p><span class="badge ' + escapeHtml(level) + '">' + escapeHtml(acceptanceLabel(level)) + '</span> <strong>Abrechnungszeitraum:</strong> ' + escapeHtml(periodLabelShort()) + '</p>' +
    '<div class="grid"><div class="box"><div class="label">Finalisierung</div><div class="value">' + escapeHtml(data.finalization && data.finalization.finalized ? "finalisiert" : "bearbeitbar") + '</div><div>' + escapeHtml(finalizedAt) + '</div></div><div class="box"><div class="label">Finaler Check</div><div class="value">' + escapeHtml(data.readiness.label) + '</div><div>' + escapeHtml(data.readiness.message) + '</div></div><div class="box"><div class="label">Backup</div><div class="value">' + escapeHtml(data.backup ? data.backup.message : "unbekannt") + '</div><div>' + escapeHtml(backupLast) + '</div></div></div>' +
    '<h2>Summen</h2><table><tbody>' +
    '<tr><th>Aktive umlagefähige Kosten</th><td class="money">' + escapeHtml(fmtMoney(totals.totalCosts)) + '</td></tr>' +
    '<tr><th>Auf echte Mieter umgelegt</th><td class="money">' + escapeHtml(fmtMoney(totals.billableShare)) + '</td></tr>' +
    '<tr><th>Eigentümer-/Privatanteil</th><td class="money">' + escapeHtml(fmtMoney(totals.privateShare)) + '</td></tr>' +
    '<tr><th>Nicht auf Mieter umgelegt/offen</th><td class="money">' + escapeHtml(fmtMoney(totals.ownerShare)) + '</td></tr>' +
    '<tr><th>Geleistete Vorauszahlungen</th><td class="money">' + escapeHtml(fmtMoney(totals.prepayments)) + '</td></tr>' +
    '<tr><th>Einmalige Korrekturen/Gutschriften</th><td class="money">' + escapeHtml(fmtMoney(totals.corrections)) + '</td></tr>' +
    '<tr><th>Summendifferenz aktive Kosten vs. Verteilung</th><td class="money">' + escapeHtml(fmtMoney(totals.allocationDelta)) + '</td></tr>' +
    '<tr><th>Saldo Mieter gesamt</th><td class="money">' + escapeHtml(fmtMoney(totals.balance)) + '</td></tr>' +
    '</tbody></table>' +
    '<h2>Mieter-Ergebnisse</h2><table><thead><tr><th>Mieter</th><th>Wohnung</th><th>Ergebnis</th><th>Betrag</th><th>Kosten</th><th>Vorauszahlungen</th><th>Korrektur</th></tr></thead><tbody>' + rows.tenantRows + '</tbody></table>' +
    '<h2>Eigentümer-/Privatanteile</h2><table><thead><tr><th>Name</th><th>Wohnung</th><th>Anteil</th></tr></thead><tbody>' + rows.privateRows + '</tbody></table>' +
    '<h2>Brief-Preflight</h2><p><strong>' + escapeHtml(data.brief ? data.brief.label : "nicht verfügbar") + '</strong> · ' + escapeHtml(data.brief ? data.brief.message : "") + '</p><table><thead><tr><th>Status</th><th>Prüfpunkt</th><th>Details</th></tr></thead><tbody>' + rows.briefRows + '</tbody></table>' +
    '<h2>Sonderfälle</h2><p>' + escapeHtml(data.special ? data.special.message : "Kein Sonderfallbericht verfügbar.") + '</p><table><thead><tr><th>Status</th><th>Typ</th><th>Betreff</th><th>Details</th></tr></thead><tbody>' + rows.specialRows + '</tbody></table>' +
    '<h2>Offene Prüfpunkte</h2><table><thead><tr><th>Status</th><th>Bereich</th><th>Prüfpunkt</th><th>Details</th></tr></thead><tbody>' + rows.issueRows + '</tbody></table>' +
    '<div class="footer">Dieses Abnahmeprotokoll ist eine technische Prüfhilfe. Es ersetzt keine fachliche oder rechtliche Endkontrolle der Nebenkostenabrechnung.</div>' +
    '</body></html>';
  return html;
}

function renderAcceptanceProtocolSummary() {
  const el = document.getElementById("acceptanceProtocolBox");
  if (!el) return;
  const data = acceptanceProtocolData();
  const level = acceptanceLevel(data);
  el.innerHTML = '<div class="acceptance-protocol-box ' + level + '"><div class="inline-titlebar"><div><strong>Abnahmeprotokoll: ' + escapeHtml(acceptanceLabel(level)) + '</strong><div class="small">Fasst finalen Check, Summen, Sonderfälle, Backup-Status, Brief-Preflight und Finalisierung zusammen.</div></div><div class="start-action-stack"><button type="button" data-ui-action="billing.showAcceptanceProtocol">Anzeigen</button><button type="button" data-ui-action="export.downloadAcceptanceHtml">HTML herunterladen</button></div></div>' +
    '<div class="acceptance-protocol-grid"><div class="acceptance-protocol-pill"><strong>Prüfpunkte</strong><br>' + data.counts.errors + ' Fehler · ' + data.counts.warnings + ' prüfen · ' + data.counts.hints + ' Hinweise</div><div class="acceptance-protocol-pill"><strong>Brief</strong><br>' + escapeHtml(data.brief ? data.brief.label : "nicht verfügbar") + '</div><div class="acceptance-protocol-pill"><strong>Sonderfälle</strong><br>' + escapeHtml(data.special ? (data.special.errors + ' Fehler · ' + data.special.checks + ' prüfen') : "nicht verfügbar") + '</div><div class="acceptance-protocol-pill"><strong>Backup</strong><br>' + escapeHtml(data.backup ? data.backup.message : "nicht verfügbar") + '</div></div></div>';
}

function showAcceptanceProtocol() {
  const html = acceptanceProtocolHtml();
  const win = window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    if (win.focus) win.focus();
    return;
  }
  alert(finalBillingReportText());
}

function downloadAcceptanceProtocolHtml() {
  const filename = "nk-pro-abnahmeprotokoll-" + safeFilePart(currentAbrechnungsjahr()) + "-" + safeFilePart(APP_VERSION) + "-" + new Date().toISOString().slice(0,19).replace(/[:T]/g, "-") + ".html";
  download(filename, acceptanceProtocolHtml(), "text/html;charset=utf-8");
}

function showFinalBillingReport() {
  const text = finalBillingReportText();
  const win = window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write('<!doctype html><html><head><title>NK-Pro finaler Prüfbericht</title><style>body{font-family:Arial,sans-serif;padding:24px;line-height:1.45;white-space:pre-wrap}h1{color:#173b5a}</style></head><body><h1>Finaler Prüfbericht / Abnahmeprotokoll</h1><pre>' + escapeHtml(text) + '</pre></body></html>');
    win.document.close();
    if (win.focus) win.focus();
    return;
  }
  alert(text);
}




function qualityAreaTab(area) {
  const text = String(area || "").toLocaleLowerCase("de-DE");
  if (text.includes("kosten")) return "einstellungen";
  if (text.includes("brief")) return "briefe";
  if (text.includes("archiv")) return "start";
  if (text.includes("mieter") || text.includes("wohnung") || text.includes("stamm")) return "mieter";
  if (text.includes("vorauszahlungsanpassung")) return "vorauszahlungsanpassung";
  if (text.includes("voraus") || text.includes("einnah")) return "einnahmen";
  if (text.includes("umlage") || text.includes("summe") || text.includes("saldo") || text.includes("berechnung")) return "umlage";
  if (text.includes("zähler") || text.includes("wasser")) return "wasser";
  if (text.includes("speicher") || text.includes("import") || text.includes("datenmodell") || text.includes("backup")) return "sicherung";
  return "qualitaet";
}

function qualityItemKey(item) {
  return [currentAbrechnungsjahr(), periodStart(), periodEnd(), item && item.severity, item && item.area, item && item.point, item && item.detail].map(v => String(v || "")).join("|");
}

function qualityAckStore(create = false) {
  const existing = state && state.meta && state.meta.qualityAcknowledgements;
  if (existing && typeof existing === "object") return existing;
  if (!create) return Object.freeze({});
  if (!state.meta) state.meta = {};
  state.meta.qualityAcknowledgements = {};
  return state.meta.qualityAcknowledgements;
}

function qualityAckFor(item) {
  return qualityAckStore()[qualityItemKey(item)] || null;
}

function qualityAckLabel(item) {
  if (!item) return "";
  if (item.severity === "Hinweis") return "Gelesen";
  if (item.severity === "Prüfen") return "Geprüft / akzeptiert";
  return "";
}

function acknowledgeQualityIssue(encodedKey, mode) {
  const key = decodeURIComponent(encodedKey || "");
  if (!key) return;
  const store = qualityAckStore(true);
  store[key] = { mode: mode || "ack", at: new Date().toISOString(), appVersion: APP_VERSION, year: currentAbrechnungsjahr() };
  commitStateChange({ reason:"Qualitätsbestätigung", tabId:"qualitaet", includeCommon:false, includeNavigation:false, finalizationBypass:true });
}

function reopenQualityIssue(encodedKey) {
  const key = decodeURIComponent(encodedKey || "");
  if (!key) return;
  const store = qualityAckStore(true);
  delete store[key];
  commitStateChange({ reason:"Qualitätsbestätigung zurückgenommen", tabId:"qualitaet", includeCommon:false, includeNavigation:false, finalizationBypass:true });
}

function qualityIssueSearchText(item) {
  return [item && item.area, item && item.point, item && item.detail].map(v => String(v || "").trim()).filter(Boolean).join(" ").toLocaleLowerCase("de-DE");
}

function highlightQualityTarget(tab, itemText) {
  const section = document.getElementById(tab);
  if (!section) return;
  const needleParts = String(itemText || "").toLocaleLowerCase("de-DE").split(/\s+·\s+|\s+/).filter(Boolean).slice(0, 4);
  let target = null;
  const rows = Array.from(section.querySelectorAll("tbody tr"));
  for (const row of rows) {
    const text = row.textContent.toLocaleLowerCase("de-DE");
    if (!needleParts.length || needleParts.some(part => part.length > 2 && text.includes(part))) { target = row; break; }
  }
  if (!target) target = section.querySelector("table, .hint, .quality-summary, .card, input, select, textarea, button");
  if (!target) return;
  try { target.scrollIntoView({ behavior:"smooth", block:"center" }); } catch(e) { target.scrollIntoView(); }
  target.classList.add("quality-target-highlight");
  setTimeout(() => target.classList.remove("quality-target-highlight"), 3800);
}

function jumpToQualityIssue(tab, encodedText) {
  const targetTab = tab || "qualitaet";
  switchToTab(targetTab);
  setTimeout(() => highlightQualityTarget(targetTab, decodeURIComponent(encodedText || "")), 120);
}

function jumpToFirstOpenQualityIssue() {
  const report = NK_PRO_MODULES.qualityAssurance.inspect({ scope:"currentBilling" });
  const open = report.issues.filter(i => i.severity !== "OK" && !qualityAckFor(i));
  const first = open.find(i => i.severity === "Fehler") || open.find(i => i.severity === "Prüfen") || open[0];
  if (!first) return alert("Keine offenen Prüfpunkte vorhanden.");
  const tab = qualityAreaTab(first.area);
  jumpToQualityIssue(tab, encodeURIComponent(qualityIssueSearchText(first)));
}

function showOnlyQualityErrors() {
  switchToTab("qualitaet");
  renderQuality("errors");
}

function qualityIssueActionHtml(item, acknowledged) {
  if (!item || item.severity === "OK") return "";
  const tab = qualityAreaTab(item.area);
  const text = encodeURIComponent(qualityIssueSearchText(item));
  const key = encodeURIComponent(qualityItemKey(item));
  const actions = ['<button class="secondary compact-action"' + uiActionAttributes("quality.jumpToIssue", [tab,text]) + '>Zur Stelle springen</button>'];
  if (item.severity !== "Fehler") {
    if (acknowledged) actions.push('<button class="compact-action"' + uiActionAttributes("quality.reopenIssue", [key]) + '>Wieder öffnen</button>');
    else actions.push('<button class="compact-action"' + uiActionAttributes("quality.acknowledgeIssue", [key,item.severity === "Hinweis" ? "gelesen" : "geprüft"]) + '>' + escapeHtml(qualityAckLabel(item)) + '</button>');
  }
  return actions.join(" ");
}

function qualityTaskRowHtml(item, acknowledged) {
  const cls = acknowledged ? "quality-task-row acknowledged" : "quality-task-row";
  const ack = acknowledged ? '<div class="small">' + escapeHtml(acknowledged.mode === "gelesen" ? "gelesen" : "geprüft") + ' am ' + escapeHtml(new Date(acknowledged.at).toLocaleString("de-DE")) + '</div>' : "";
  return '<tr class="' + cls + '"><td><span class="status ' + qualitySeverityClass(item.severity) + '">' + escapeHtml(item.severity) + '</span>' + ack + '</td><td>' + escapeHtml(item.area) + '</td><td>' + escapeHtml(item.point) + '</td><td class="quality-task-detail">' + escapeHtml(item.detail || "") + '</td><td class="actions-cell">' + qualityIssueActionHtml(item, acknowledged) + '</td></tr>';
}

function renderQuality(filterMode) {
  const summaryEl = document.getElementById("qualitySummary");
  const nextEl = document.getElementById("qualityNextActions");
  const filterEl = document.getElementById("qualityFilterBar");
  const issuesEl = document.getElementById("qualityIssuesTable");
  const acknowledgedEl = document.getElementById("qualityAcknowledgedTable");
  const groupedEl = document.getElementById("qualityGroupedChecks");
  const sumsEl = document.getElementById("qualitySumsTable");
  if (!summaryEl || !issuesEl || !sumsEl) return;

  const report = NK_PRO_MODULES.qualityAssurance.inspect({ scope:"currentBilling" });
  const readiness = NK_PRO_MODULES.qualityAssurance.finalBillingReadiness(report);
  const allRelevant = report.issues.filter(i => i.severity !== "OK");
  const errors = allRelevant.filter(i => i.severity === "Fehler");
  const checks = allRelevant.filter(i => i.severity === "Prüfen");
  const hints = allRelevant.filter(i => i.severity === "Hinweis");
  const open = allRelevant.filter(i => !qualityAckFor(i));
  const acknowledged = allRelevant.filter(i => !!qualityAckFor(i));
  const openErrors = open.filter(i => i.severity === "Fehler");
  const openChecks = open.filter(i => i.severity === "Prüfen");
  const openHints = open.filter(i => i.severity === "Hinweis");
  const overall = openErrors.length ? "Fehler" : (openChecks.length ? "Prüfen" : (openHints.length ? "Hinweis" : "OK"));
  const cls = openErrors.length ? "err" : (openChecks.length ? "warn" : "ok");
  const title = openErrors.length ? "Abrechnung noch nicht freigabebereit" : (openChecks.length ? "Abrechnung mit Prüfpunkten" : (openHints.length ? "Abrechnung mit Hinweisen" : "Keine offenen Qualitätsaufgaben"));
  const msg = openErrors.length ? "Bitte zuerst die Fehler beheben. Fehler können nicht weggeklickt werden." : (openChecks.length ? "Bitte Prüfpunkte fachlich kontrollieren und danach als geprüft markieren." : (openHints.length ? "Hinweise lesen und bei Bedarf als gelesen markieren." : "Du kannst jetzt Abnahmeprotokoll, Briefdruck oder Finalisierung vorbereiten."));
  summaryEl.innerHTML = '<div class="quality-cockpit-hero ' + cls + '"><div><h3>' + escapeHtml(title) + '</h3><div class="small">' + escapeHtml(msg) + '</div><div style="margin-top:8px"><span class="period-badge">' + openErrors.length + ' Fehler · ' + openChecks.length + ' Prüfpunkte · ' + openHints.length + ' Hinweise offen</span></div></div><div class="quality-cockpit-actions"><button class="primary" data-ui-action="quality.jumpFirstOpen">Zum ersten offenen Punkt</button><button class="secondary" data-ui-action="quality.render">Prüfung erneut ausführen</button><button data-ui-action="billing.showAcceptanceProtocol">Abnahmeprotokoll</button>' + (openErrors.length ? '<button class="warn" data-ui-action="quality.showOnlyErrors">Nur Fehler anzeigen</button>' : '<button class="primary" data-ui-action="billing.finalize">Finalisieren</button>') + '</div></div>';

  if (nextEl) {
    const coverageAreas = new Set(report.issues.map(item => item.area).filter(Boolean));
    const nextRows = open.slice().sort((a,b) => ({"Fehler":0,"Prüfen":1,"Hinweis":2}[a.severity] ?? 9) - ({"Fehler":0,"Prüfen":1,"Hinweis":2}[b.severity] ?? 9)).slice(0, 3);
    nextEl.innerHTML = '<div class="quality-panel quality-coverage"><h3>Prüfumfang der gesamten Abrechnung</h3><div class="small">' + report.issues.length + ' Regeln in ' + coverageAreas.size + ' Bereichen · Stammdaten, Kostenarten, Einnahmen, Zählerstände, Umlage, Vorauszahlungen, Briefe, Export und System.</div></div>' + (nextRows.length ? '<div class="quality-panel"><h3>Was jetzt zu tun ist</h3><ol>' + nextRows.map(i => '<li><strong>' + escapeHtml(i.area) + ':</strong> ' + escapeHtml(i.point) + (i.detail ? ' <span class="small">' + escapeHtml(i.detail) + '</span>' : '') + ' ' + qualityIssueActionHtml(i, null) + '</li>').join('') + '</ol></div>' : '<div class="quality-empty-state"><strong>Keine offenen Aufgaben.</strong><div class="small">Gelesene/geprüfte Hinweise findest du im eingeklappten Bereich darunter. Technische Tests stehen unten.</div></div>');
  }

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("qualitaet");

  if (filterEl) {
    filterEl.innerHTML = '<button class="secondary" data-ui-action="quality.render">Alle offenen</button><button data-ui-action="quality.render" data-ui-args="[&quot;errors&quot;]">Nur Fehler</button><button data-ui-action="quality.render" data-ui-args="[&quot;checks&quot;]">Nur Prüfpunkte</button><button data-ui-action="quality.render" data-ui-args="[&quot;hints&quot;]">Nur Hinweise</button>';
  }
  let visibleOpen = open;
  if (filterMode === "errors") visibleOpen = openErrors;
  if (filterMode === "checks") visibleOpen = openChecks;
  if (filterMode === "hints") visibleOpen = openHints;
  const rows = visibleOpen.length ? visibleOpen.map(item => qualityTaskRowHtml(item, null)).join("") : '<tr><td colspan="5">Keine offenen Punkte in dieser Ansicht.</td></tr>';
  issuesEl.innerHTML = '<thead><tr><th>Status</th><th>Bereich</th><th>Prüfpunkt</th><th>Details</th><th>Aktion</th></tr></thead><tbody>' + rows + '</tbody>';

  if (acknowledgedEl) {
    acknowledgedEl.innerHTML = '<thead><tr><th>Status</th><th>Bereich</th><th>Prüfpunkt</th><th>Details</th><th>Aktion</th></tr></thead><tbody>' + (acknowledged.length ? acknowledged.map(item => qualityTaskRowHtml(item, qualityAckFor(item))).join("") : '<tr><td colspan="5">Noch nichts als gelesen/geprüft markiert.</td></tr>') + '</tbody>';
  }

  if (groupedEl) {
    const groups = {};
    open.forEach(item => { const key = item.area || "Sonstiges"; if (!groups[key]) groups[key] = []; groups[key].push(item); });
    const groupHtml = Object.keys(groups).sort().map(area => '<details><summary>' + escapeHtml(area) + ' · ' + groups[area].length + ' offen</summary><div class="table-wrap dashboard-table"><table><thead><tr><th>Status</th><th>Prüfpunkt</th><th>Details</th><th>Aktion</th></tr></thead><tbody>' + groups[area].map(item => '<tr><td><span class="status ' + qualitySeverityClass(item.severity) + '">' + escapeHtml(item.severity) + '</span></td><td>' + escapeHtml(item.point) + '</td><td class="quality-task-detail">' + escapeHtml(item.detail || "") + '</td><td class="actions-cell">' + qualityIssueActionHtml(item, null) + '</td></tr>').join("") + '</tbody></table></div></details>').join("");
    groupedEl.innerHTML = '<div class="quality-panel"><h3>Prüfbereiche</h3>' + (groupHtml || '<div class="small">Keine offenen Prüfpunkte nach Bereichen.</div>') + '</div>';
  }

  const sumRows = [
    ["Aktive umlagefähige Kosten", fmtMoney(report.sums.totalCosts), "Summe der Kostenarten mit In NK = Ja"],
    ["Verteilung auf alle Datensätze", fmtMoney(report.sums.allTenantShare), "Mieter plus Eigentümer/Privat"],
    ["Anteil echte Mieter", fmtMoney(report.sums.billableShare), "Basis für Nachzahlung/Guthaben"],
    ["Eigentümer/Privatanteil", fmtMoney(report.sums.privateShare), "Nicht als Mieterbrief"],
    ["Nicht auf Mieter umgelegt", fmtMoney(report.sums.ownerShare), "Restbetrag aus Verteilung"],
    ["Geleistete Vorauszahlungen", fmtMoney(report.sums.prepayments), "Aus Vorauszahlungsmatrix"],
    ["Einmalige Korrekturen", fmtMoney(report.sums.corrections), "Korrekturen/Gutschriften"],
    ["Summendifferenz", fmtMoney(report.sums.allocationDelta), "Aktive Kosten minus Verteilung"],
    ["Saldo Mieter gesamt", fmtMoney(report.sums.balance), "Kostenanteil minus Vorauszahlungen minus Korrekturen"]
  ].map(r => '<tr><td>' + escapeHtml(r[0]) + '</td><td class="money">' + escapeHtml(r[1]) + '</td><td>' + escapeHtml(r[2]) + '</td></tr>').join("");
  sumsEl.innerHTML = '<thead><tr><th>Wert</th><th>Betrag</th><th>Hinweis</th></tr></thead><tbody>' + sumRows + '</tbody>';
  if (typeof renderAcceptanceProtocolSummary === "function") renderAcceptanceProtocolSummary();
  if (typeof renderReleaseAuditSummary === "function") renderReleaseAuditSummary();
}
function renderDashboard() {
  const wohnungenGesamt = state.wohnungen.filter(w => w.id).length;
  const wohnungenAktiv = state.wohnungen.filter(w => w.id && w.status === "aktiv").length;
  const sichtbareMieter = billableTenantRows();
  const privateMieter = privateTenantRows();
  const archivierteMieter = archivedTenantRows();
  const aktuelleMieter = sichtbareMieter.filter(m => !m.auszug).length;
  const nkOffeneMieter = sichtbareMieter.filter(m => !!m.auszug).length;

  const kalt = sichtbareMieter.reduce((s,m) => s + num(m.kaltErhalten), 0);
  const nk = sichtbareMieter.reduce((s,m) => s + num(m.nkVoraus), 0);
  const einnahmen = kalt + nk;

  const aktiveKosten = state.kostenarten.filter(k => k.kostenart && k.inNK === "Ja");
  const kostenNK = aktiveKosten.reduce((s,k) => s + num(k.gesamtbetrag), 0);

  const calc = calculateUmlage();
  const tenantShares = calc.tenantResults.reduce((s,r) => s + num(r.costShare), 0);
  const korrekturen = sichtbareMieter.reduce((s,m) => s + num(m.vorjahresKorrektur), 0);
  const saldoMieter = tenantShares - nk - korrekturen;

  const offeneKosten = state.kostenarten
    .map(k => ({ ...k, calcStatus: NK_PRO_MODULES.costActions.kostenStatus(k) }))
    .filter(k => k.kostenart && !["Vollständig","Nicht Bestandteil der NK-Abrechnung"].includes(k.calcStatus));

  const offeneMieter = sichtbareMieter.filter(m => !m.wohnung || !m.name || !m.einzug || num(m.aktiveTage) <= 0 || num(m.personen) <= 0);
  const offene = offeneKosten.length + offeneMieter.length;

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("dashboard");

  const issueRows = [];
  offeneKosten.forEach(k => issueRows.push({ bereich:"Kostenart", punkt:k.id + " · " + k.kostenart, status:k.calcStatus }));
  offeneMieter.forEach(m => issueRows.push({ bereich:"Mietverhältnis", punkt:(tenantDisplayId(m) || "") + " · " + (m.name || "Name fehlt"), status:"Stammdaten prüfen" }));

  document.getElementById("issuesTable").innerHTML =
    '<thead><tr><th>Bereich</th><th>Punkt</th><th>Status</th></tr></thead><tbody>' +
    (issueRows.length ? issueRows.map(r => '<tr><td>' + escapeHtml(r.bereich) + '</td><td>' + escapeHtml(r.punkt) + '</td><td><span class="status ' + statusClass(r.status) + '">' + escapeHtml(r.status) + '</span></td></tr>').join("") : '<tr><td colspan="3">Keine offenen Punkte.</td></tr>') +
    '</tbody>';

  document.getElementById("activeCostsTable").innerHTML =
    '<thead><tr><th>Kostenart</th><th>Umlageschlüssel</th><th>Gesamtbetrag</th><th>Status</th></tr></thead><tbody>' +
    (aktiveKosten.length ? aktiveKosten.map(k => '<tr><td>' + escapeHtml(k.kostenart) + '</td><td>' + escapeHtml(k.umlageschluessel) + '</td><td>' + fmtMoney(k.gesamtbetrag) + '</td><td><span class="status ' + statusClass(NK_PRO_MODULES.costActions.kostenStatus(k)) + '">' + escapeHtml(NK_PRO_MODULES.costActions.kostenStatus(k)) + '</span></td></tr>').join("") : '<tr><td colspan="4">Keine aktiven Kostenarten.</td></tr>') +
    '</tbody>';
  renderWorkflowDashboard();
}

