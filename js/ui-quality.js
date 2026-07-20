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
  const rows = report.rows.slice(0, 12);
  const rowsHtml = rows.length ? rows.map(r => '<li><span class="billing-special-case__icon" aria-hidden="true">i</span><span><strong>' + escapeHtml(r.type) + ':</strong> ' + escapeHtml(r.subject) + (r.detail ? ' · ' + escapeHtml(r.detail) : '') + '</span><span class="status ' + qualitySeverityClass(r.severity) + '">' + escapeHtml(r.severity) + '</span></li>').join("") : '<li><span class="billing-special-case__icon" aria-hidden="true">✓</span><span>Keine prüfpflichtigen Sonderfälle.</span></li>';
  el.innerHTML = '<aside class="billing-special-case nk-ui-notice nk-ui-notice--info" aria-labelledby="billingSpecialCaseTitle"><div class="billing-special-case__header"><h2 id="billingSpecialCaseTitle">Hinweise zu Sonderfällen</h2><span class="nk-ui-status">' + report.rows.length + ' Hinweise</span></div><p>' + escapeHtml(report.message) + '</p><ul>' + rowsHtml + '</ul></aside>';
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




let qualityCurrentFilter = "open";
let qualityLastReport = null;

function qualityStatusClass(status) {
  if (status === "Kritischer Abrechnungsmangel" || status === "Technischer Fehler") return "err";
  if (status === "Entscheidung erforderlich") return "warn";
  if (status === "Hinweis") return "info";
  if (status === "Nicht anwendbar") return "neutral";
  return "ok";
}

function qualityProcessingLabel(row) {
  return row && row.processingState ? row.processingState : "noch offen";
}

function qualityReport(force = false) {
  if (!qualityLastReport || force) qualityLastReport = NK_PRO_MODULES.qualityAssurance.inspect({ scope:"currentBilling", includeTechnical:true });
  return qualityLastReport;
}

function qualityResultById(instanceId, force = false) {
  const report = qualityReport(force);
  return report.results.find(row => row.instanceId === instanceId) || report.technicalResults.find(row => row.instanceId === instanceId) || null;
}

function qualityEncoded(value) { return encodeURIComponent(String(value || "")); }
function qualityIsReadOnly() { return !!(globalThis.NKProBillingContext && NKProBillingContext.isReadOnly()); }

function qualityActionButton(label, action, args, cls = "") {
  const disabled = qualityIsReadOnly() && ["quality.confirmIssue","quality.markNotApplicable","quality.reopenIssue"].includes(action);
  return '<button type="button" class="compact-action ' + escapeHtml(cls) + '"' + uiActionAttributes(action, args || []) + (disabled ? ' disabled aria-disabled="true" title="Im Ansichtsmodus nicht verfügbar"' : '') + '>' + escapeHtml(label) + '</button>';
}

function qualityItemActions(row) {
  const actions = [qualityActionButton("Details", "quality.openDetail", [qualityEncoded(row.instanceId)], "secondary")];
  if (row.targetTab) actions.push(qualityActionButton("Zur Ursache", "quality.jumpToIssue", [row.targetTab, qualityEncoded(row.instanceId)], "secondary"));
  if (row.confirmation) actions.push(qualityActionButton("Bestätigung zurücknehmen", "quality.reopenIssue", [qualityEncoded(row.instanceId)]));
  else if (!row.blocking && row.confirmAllowed && row.status === "Entscheidung erforderlich") {
    actions.push(qualityActionButton("Als geprüft bestätigen", "quality.confirmIssue", [qualityEncoded(row.instanceId)]));
    if (row.allowNotApplicable) actions.push(qualityActionButton("Nicht anwendbar", "quality.markNotApplicable", [qualityEncoded(row.instanceId)]));
  } else if (!row.blocking && row.confirmAllowed && row.status === "Hinweis") actions.push(qualityActionButton("Als gelesen markieren", "quality.confirmIssue", [qualityEncoded(row.instanceId), "read"]));
  return actions.join(" ");
}

function qualityValueTable(row) {
  const entries = Object.entries(row.values || {});
  const comparisons = Object.entries(row.comparisonValues || {});
  const all = entries.concat(comparisons.map(([key,value]) => ["Vergleich: " + key,value]));
  if (!all.length) return '<p class="small">Keine zusätzlichen Einzelwerte.</p>';
  return '<dl class="quality-value-list">' + all.map(([key,value]) => '<div><dt>' + escapeHtml(key) + '</dt><dd>' + escapeHtml(Array.isArray(value) ? value.join(", ") : String(value == null ? "–" : value)) + '</dd></div>').join("") + '</dl>';
}

function openQualityDetail(encodedId) {
  const row = qualityResultById(decodeURIComponent(encodedId || ""), true);
  if (!row) return alert("Der Prüfpunkt ist nicht mehr vorhanden. Die Prüfung wurde aktualisiert.");
  const dialog = document.getElementById("qualityDetailDialog");
  const title = document.getElementById("qualityDetailTitle");
  const content = document.getElementById("qualityDetailContent");
  const actions = document.getElementById("qualityDetailActions");
  if (!dialog || !content || !title || !actions) return;
  title.textContent = row.title;
  content.innerHTML = '<div class="quality-detail-status"><span class="status ' + qualityStatusClass(row.status) + '">' + escapeHtml(row.status) + '</span><span>' + escapeHtml(qualityProcessingLabel(row)) + '</span></div>' +
    '<dl class="quality-detail-grid"><div><dt>Regel-ID</dt><dd>' + escapeHtml(row.ruleId) + '</dd></div><div><dt>Kategorie</dt><dd>' + escapeHtml(row.category) + '</dd></div><div><dt>Prüfbereich</dt><dd>' + escapeHtml(row.groupLabel) + '</dd></div><div><dt>Betroffene Entität</dt><dd>' + escapeHtml(row.entityLabel) + '</dd></div><div><dt>Datenquelle</dt><dd>' + escapeHtml(row.dataSource) + '</dd></div><div><dt>Auswirkung</dt><dd>' + escapeHtml(row.blocking ? "Verhindert den Abschluss" : "Keine automatische Sperrwirkung") + '</dd></div><div><dt>Ausführungszeitpunkt</dt><dd>' + escapeHtml(row.executionTime) + '</dd></div><div><dt>Regelversion</dt><dd>' + escapeHtml(String(row.ruleVersion)) + '</dd></div></dl>' +
    '<section><h3>Ergebnis</h3><p>' + escapeHtml(row.details || row.resultText || "Kein zusätzlicher Detailtext.") + '</p></section>' +
    '<section><h3>Verwendete Werte</h3>' + qualityValueTable(row) + '</section>' +
    '<section><h3>Handlungsempfehlung</h3><p>' + escapeHtml(row.solution || "Daten prüfen.") + '</p></section>' +
    (row.confirmation ? '<section><h3>Bestätigung</h3><p>' + escapeHtml(row.confirmation.mode === "not-applicable" ? "Als nicht anwendbar bestätigt" : (row.confirmation.mode === "read" ? "Gelesen" : "Geprüft und bestätigt")) + ' am ' + escapeHtml(new Date(row.confirmation.at).toLocaleString("de-DE")) + (row.confirmation.reason ? '<br>Begründung: ' + escapeHtml(row.confirmation.reason) : '') + '</p></section>' : '');
  actions.innerHTML = qualityItemActions(row) + '<button type="submit" class="ui-button ui-button--secondary">Schließen</button>';
  if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
}

function assertQualityWritable() {
  if (globalThis.NKProBillingContext) NKProBillingContext.assertWritable("Prüfbestätigung");
}

function saveQualityConfirmation(encodedId, mode) {
  assertQualityWritable();
  const id = decodeURIComponent(encodedId || "");
  const row = qualityResultById(id, true);
  if (!row) return alert("Der Prüfpunkt ist nicht mehr vorhanden.");
  let reason = "";
  const actualMode = mode || (row.status === "Hinweis" ? "read" : "confirmed");
  if (actualMode === "confirmed") {
    const entered = prompt("Optionale fachliche Begründung für „" + row.title + "“:", "");
    if (entered === null) return;
    reason = entered;
  }
  NKProQualityRules.saveConfirmation(state, row, actualMode, reason);
  commitStateChange({ reason:"Prüfpunkt bestätigt", tabId:"qualitaet", includeCommon:false, includeNavigation:false, finalizationBypass:true });
  qualityLastReport = null;
  renderQuality(qualityCurrentFilter);
}

function markQualityNotApplicable(encodedId) {
  assertQualityWritable();
  const id = decodeURIComponent(encodedId || "");
  const row = qualityResultById(id, true);
  if (!row) return alert("Der Prüfpunkt ist nicht mehr vorhanden.");
  const reason = prompt("Warum ist diese Regel in der konkreten Abrechnung nicht anwendbar?", "");
  if (reason === null) return;
  if (!String(reason).trim()) return alert("Für „Nicht anwendbar“ ist eine Begründung erforderlich.");
  NKProQualityRules.saveConfirmation(state, row, "not-applicable", reason);
  commitStateChange({ reason:"Prüfpunkt als nicht anwendbar bestätigt", tabId:"qualitaet", includeCommon:false, includeNavigation:false, finalizationBypass:true });
  qualityLastReport = null;
  renderQuality(qualityCurrentFilter);
}

function reopenQualityIssue(encodedId) {
  assertQualityWritable();
  const row = qualityResultById(decodeURIComponent(encodedId || ""), true);
  if (!row) return;
  NKProQualityRules.removeConfirmation(state, row);
  commitStateChange({ reason:"Prüfbestätigung zurückgenommen", tabId:"qualitaet", includeCommon:false, includeNavigation:false, finalizationBypass:true });
  qualityLastReport = null;
  renderQuality(qualityCurrentFilter);
}

function acknowledgeQualityIssue(encodedId, mode) { return saveQualityConfirmation(encodedId, mode); }

function highlightQualityTarget(tab, row) {
  const section = document.getElementById(tab);
  if (!section) return;
  let target = row && row.targetSelector ? section.querySelector(row.targetSelector) : null;
  if (!target && row) {
    const tokens = [row.entityId,row.entityLabel,row.title].join(" ").toLocaleLowerCase("de-DE").split(/\s+|·/).filter(token => token.length > 2).slice(0,6);
    target = Array.from(section.querySelectorAll("tbody tr, .card, .page-section, label, input, select, textarea")).find(node => tokens.some(token => node.textContent.toLocaleLowerCase("de-DE").includes(token))) || null;
  }
  if (!target) target = section.querySelector(".page-section, table, input, select, textarea, button");
  if (!target) return;
  const details = target.closest("details");
  if (details) details.open = true;
  try { target.scrollIntoView({ behavior:"smooth", block:"center" }); } catch(error) { target.scrollIntoView(); }
  target.classList.add("quality-target-highlight");
  if (typeof target.focus === "function" && target.matches("input,select,textarea,button,[tabindex]")) target.focus({preventScroll:true});
  setTimeout(() => target.classList.remove("quality-target-highlight"), 3800);
}

function jumpToQualityIssue(tab, encodedId) {
  const row = qualityResultById(decodeURIComponent(encodedId || ""), true);
  const targetTab = tab || row && row.targetTab || "qualitaet";
  switchToTab(targetTab);
  setTimeout(() => highlightQualityTarget(targetTab, row), 120);
}

function jumpToFirstOpenQualityIssue() {
  const report = qualityReport(true);
  const first = report.results.find(row => row.status === "Kritischer Abrechnungsmangel") || report.results.find(row => row.status === "Entscheidung erforderlich") || report.results.find(row => row.status === "Hinweis");
  if (!first) return alert("Keine offenen Prüfpunkte vorhanden.");
  jumpToQualityIssue(first.targetTab, qualityEncoded(first.instanceId));
}

function showOnlyQualityErrors() { switchToTab("qualitaet"); renderQuality("blocked"); }

function qualitySetFilter(mode) { renderQuality(mode || "open"); }

function qualityFilterRows(rows, mode) {
  if (mode === "blocked") return rows.filter(row => row.status === "Kritischer Abrechnungsmangel");
  if (mode === "review") return rows.filter(row => row.status === "Entscheidung erforderlich");
  if (mode === "hints") return rows.filter(row => row.status === "Hinweis");
  if (mode === "done") return rows.filter(row => row.status === "Bestanden" || row.status === "Nicht anwendbar");
  if (mode === "all") return rows;
  return rows.filter(row => ["Kritischer Abrechnungsmangel","Entscheidung erforderlich","Hinweis"].includes(row.status));
}

function qualityResultRowHtml(row) {
  return '<tr class="quality-task-row ' + (row.status === "Bestanden" ? "acknowledged" : "") + '"><td><span class="status ' + qualityStatusClass(row.status) + '">' + escapeHtml(row.status) + '</span><div class="small">' + escapeHtml(qualityProcessingLabel(row)) + '</div></td><td><strong>' + escapeHtml(row.title) + '</strong><div class="small">' + escapeHtml(row.ruleId) + ' · ' + escapeHtml(row.entityLabel) + '</div></td><td class="quality-task-detail">' + escapeHtml(row.details || row.notApplicableReason || "–") + '</td><td class="actions-cell">' + qualityItemActions(row) + '</td></tr>';
}

function qualityGroupHtml(group, filterMode) {
  const rows = qualityFilterRows(group.results, filterMode);
  const counts = group.counts;
  const status = counts.blocked ? "Kritischer Abrechnungsmangel" : (counts.review ? "Entscheidung erforderlich" : (counts.hints ? "Hinweis" : "Bestanden"));
  return '<details class="quality-area-card"' + (rows.length && ["blocked","review","hints"].includes(filterMode) ? ' open' : '') + '><summary><span class="quality-area-card__order">' + group.order + '</span><span class="quality-area-card__title"><strong>' + escapeHtml(group.label) + '</strong><small>' + counts.blocked + ' kritisch · ' + counts.review + ' zu prüfen · ' + counts.hints + ' Hinweise · ' + counts.done + ' erledigt</small></span><span class="status ' + qualityStatusClass(status) + '">' + escapeHtml(status) + '</span></summary><div class="quality-area-card__body">' + (rows.length ? '<div class="table-wrap dashboard-table"><table><thead><tr><th>Status</th><th>Prüfpunkt</th><th>Ergebnis</th><th>Aktion</th></tr></thead><tbody>' + rows.map(qualityResultRowHtml).join("") + '</tbody></table></div>' : '<div class="quality-empty-state">Keine Punkte für den gewählten Filter.</div>') + '</div></details>';
}

function renderQualityStatusCards(report) {
  const el = document.getElementById("qualityStatusCards");
  if (!el) return;
  const cards = [
    ["Kritischer Abrechnungsmangel",report.counts.blocked,"blocked","Verhindert den Abschluss"],
    ["Entscheidung erforderlich",report.counts.review,"review","Fachlich bewerten und bestätigen"],
    ["Hinweise",report.counts.hints,"hints","Sonderfälle und Informationen"],
    ["Bestanden",report.counts.done,"done","Bestanden, behoben oder bestätigt"]
  ];
  el.innerHTML = cards.map(([label,count,filter,hint]) => '<button type="button" class="quality-status-card quality-status-card--' + qualityStatusClass(label === "Hinweise" ? "Hinweis" : label) + (qualityCurrentFilter === filter ? ' is-active' : '') + '"' + uiActionAttributes("quality.setFilter",[filter]) + '><span>' + escapeHtml(label) + '</span><strong>' + count + '</strong><small>' + escapeHtml(hint) + '</small></button>').join("");
}

function renderQualityRegistry() {
  const el = document.getElementById("qualityRuleRegistryTable");
  if (!el) return;
  const rows = NKProQualityRules.REGISTRY.map(rule => '<tr><td><code>' + escapeHtml(rule.id) + '</code></td><td>' + escapeHtml(rule.title) + '</td><td>' + escapeHtml(rule.category) + '</td><td>' + escapeHtml((NKProQualityRules.GROUPS.find(g=>g.id===rule.group)||{}).label||rule.group) + '</td><td>' + escapeHtml(rule.dataSource) + '</td><td>' + escapeHtml(rule.blocking ? "Ja" : "Nein") + '</td><td>' + escapeHtml(rule.confirmAllowed ? "Ja" : "Nein") + '</td><td>' + escapeHtml(rule.targetTab) + '</td></tr>').join("");
  el.innerHTML = '<thead><tr><th>Regel-ID</th><th>Titel</th><th>Kategorie</th><th>Bereich</th><th>Datenquelle</th><th>Blockiert</th><th>Bestätigbar</th><th>Zielseite</th></tr></thead><tbody>' + rows + '</tbody>';
}

function renderQuality(filterMode) {
  qualityCurrentFilter = filterMode || qualityCurrentFilter || "open";
  qualityLastReport = null;
  const report = qualityReport(true);
  const summaryEl = document.getElementById("qualitySummary");
  const filterEl = document.getElementById("qualityFilterBar");
  const groupedEl = document.getElementById("qualityGroupedChecks");
  const acknowledgedEl = document.getElementById("qualityAcknowledgedTable");
  const sumsEl = document.getElementById("qualitySumsTable");
  if (!summaryEl || !groupedEl) return;
  renderQualityStatusCards(report);
  const ready = report.readiness.level === "ok";
  const action = report.counts.blocked ? qualityActionButton("Zum ersten blockierenden Punkt","quality.jumpFirstOpen",[],"primary") : (report.counts.review ? qualityActionButton("Offene Plausibilitäten anzeigen","quality.setFilter",["review"],"primary") : '<button class="primary" data-ui-action="billing.finalize" type="button"' + (qualityIsReadOnly() ? ' disabled aria-disabled="true"' : '') + '>Abrechnung abschließen</button>');
  summaryEl.innerHTML = '<div class="quality-cockpit-hero ' + escapeHtml(report.readiness.level) + '"><div><h3>' + escapeHtml(report.readiness.label) + '</h3><p>' + escapeHtml(report.readiness.message) + '</p><div class="small">' + report.results.length + ' konkrete Ergebnisse aus ' + NKProQualityRules.REGISTRY.filter(r=>r.category!==NKProQualityRules.CATEGORY.TECHNICAL).length + ' zentralen fachlichen Regeln.</div></div><div class="quality-cockpit-actions">' + action + '<button class="secondary" data-ui-action="quality.render" type="button">Erneut prüfen</button><button data-ui-action="billing.showAcceptanceProtocol" type="button">Abnahmeprotokoll</button></div></div>';
  if (filterEl) filterEl.innerHTML = [["open","Offen"],["blocked","Kritischer Abrechnungsmangel"],["review","Entscheidung erforderlich"],["hints","Hinweise"],["done","Erledigt / nicht anwendbar"],["all","Alle"]].map(([key,label])=>'<button type="button" class="' + (qualityCurrentFilter===key?'primary':'secondary') + '"' + uiActionAttributes("quality.setFilter",[key]) + '>' + escapeHtml(label) + '</button>').join("");
  groupedEl.innerHTML = report.groups.map(group => qualityGroupHtml(group, qualityCurrentFilter)).join("");
  if (acknowledgedEl) {
    const completed = report.results.filter(row => (row.confirmation || row.status === "Nicht anwendbar") && !row.passed);
    acknowledgedEl.innerHTML = '<thead><tr><th>Status</th><th>Prüfpunkt</th><th>Nachweis</th><th>Aktion</th></tr></thead><tbody>' + (completed.length ? completed.map(row=>'<tr><td><span class="status ' + qualityStatusClass(row.status) + '">' + escapeHtml(row.status) + '</span></td><td>' + escapeHtml(row.title) + '<div class="small">' + escapeHtml(row.ruleId) + '</div></td><td>' + escapeHtml(qualityProcessingLabel(row)) + (row.confirmation&&row.confirmation.reason?'<div class="small">'+escapeHtml(row.confirmation.reason)+'</div>':'') + '</td><td>' + qualityItemActions(row) + '</td></tr>').join("") : '<tr><td colspan="4">Noch keine bestätigten oder als nicht anwendbar bewerteten Punkte.</td></tr>') + '</tbody>';
  }
  if (sumsEl) {
    let totals={}; try { totals=umlageTotals(calculateUmlage()); } catch(error) { totals={}; }
    const values=[["Aktive umlagefähige Kosten",totals.totalCosts],["Auf Mieter umgelegt",totals.billableShare],["Eigentümer-/Privatanteil",totals.privateShare],["Offener Restanteil",totals.ownerShare],["Vorauszahlungen",totals.prepayments],["Korrekturen",totals.corrections],["Summendifferenz",totals.allocationDelta],["Saldo Mieter gesamt",totals.balance]];
    sumsEl.innerHTML='<thead><tr><th>Wert</th><th>Betrag</th></tr></thead><tbody>'+values.map(([label,value])=>'<tr><td>'+escapeHtml(label)+'</td><td class="money">'+escapeHtml(fmtMoney(value||0))+'</td></tr>').join('')+'</tbody>';
  }
  renderQualityRegistry();
  renderAcceptanceProtocolSummary();
  renderContextualQualitySummaries(report);
  renderSystemDiagnostics(report);
  if (qualityIsReadOnly()) document.querySelectorAll('[data-ui-action="quality.confirmIssue"],[data-ui-action="quality.markNotApplicable"],[data-ui-action="quality.reopenIssue"]').forEach(button => { button.disabled = true; button.setAttribute("aria-disabled", "true"); button.title = "Im Ansichtsmodus nicht verfügbar"; });
  if (typeof renderOverviewForTab === "function") renderOverviewForTab("qualitaet");
}

function contextualRowsForTab(report, tabId) {
  const aliases={mieter:["mieter","mieterverwaltung","wohnungsverwaltung"],einstellungen:["einstellungen"],einnahmen:["einnahmen","vorauszahlungsanpassung"],verbraeuche:["verbraeuche","wasser"],wasser:["verbraeuche","wasser"],umlage:["umlage","manuellewerte"],briefe:["briefe"],export:["briefe","export"],objekt:["wohnungsverwaltung","mieterverwaltung","einstellungen"]};
  const targets=aliases[tabId]||[tabId];
  return report.results.filter(row=>targets.includes(row.targetTab)&&["Kritischer Abrechnungsmangel","Entscheidung erforderlich","Hinweis"].includes(row.status));
}

function renderContextualQualitySummaries(existingReport) {
  const report=existingReport||qualityReport();
  document.querySelectorAll('[data-section-role="validation"]').forEach(section=>{
    const tab=section.closest('section.tab'); if(!tab||tab.id==="qualitaet")return;
    const body=section.querySelector('.page-section__body'); if(!body)return;
    if(tab.id==="einnahmen"&&typeof renderPrepaymentQualitySummary==="function"){renderPrepaymentQualitySummary();return;}
    const rows=contextualRowsForTab(report,tab.id),blocked=rows.filter(r=>r.status==="Kritischer Abrechnungsmangel").length,review=rows.filter(r=>r.status==="Entscheidung erforderlich").length,hints=rows.filter(r=>r.status==="Hinweis").length;
    body.innerHTML='<div class="context-quality-summary '+(blocked?'err':review?'warn':hints?'info':'ok')+'"><div><strong>Auf dieser Seite: '+blocked+' kritisch · '+review+' zu prüfen · '+hints+' Hinweise</strong><p class="small">Die Werte stammen aus der zentralen AP20-Regelregistry.</p></div><button type="button" class="secondary"'+uiActionAttributes("quality.openPageIssues",[tab.id])+'>Details anzeigen</button></div>'+(rows.length?'<ul class="context-quality-list">'+rows.slice(0,4).map(row=>'<li><span class="status '+qualityStatusClass(row.status)+'">'+escapeHtml(row.status)+'</span><button type="button" class="link-button"'+uiActionAttributes("quality.openDetail",[qualityEncoded(row.instanceId)])+'>'+escapeHtml(row.title)+'</button></li>').join('')+'</ul>':'');
  });
}

function openPageQualityIssues(tabId) {
  switchToTab("qualitaet");
  qualityCurrentFilter="all";
  renderQuality("all");
  setTimeout(()=>{const groups=Array.from(document.querySelectorAll('.quality-area-card'));const report=qualityReport();const ids=new Set(contextualRowsForTab(report,tabId).map(r=>r.group));groups.forEach((node,index)=>{const group=report.groups[index];if(group&&ids.has(group.id))node.open=true;});},100);
}

function renderSystemDiagnostics(existingReport) {
  const el=document.getElementById("systemDiagnosticsSummary"); if(!el)return;
  const report=existingReport||qualityReport();
  el.innerHTML='<div class="system-diagnostics-grid">'+report.technicalResults.map(row=>'<article class="system-diagnostic-card"><div><span class="status '+qualityStatusClass(row.status)+'">'+escapeHtml(row.status)+'</span><strong>'+escapeHtml(row.title)+'</strong></div><p>'+escapeHtml(row.details||row.resultText)+'</p><small>'+escapeHtml(row.ruleId)+' · '+escapeHtml(row.dataSource)+'</small></article>').join('')+'</div>';
  if(typeof renderReleaseAuditSummary==="function")renderReleaseAuditSummary();
}

function renderDashboard() {
  const aktiveKosten = (Array.isArray(state.kostenarten) ? state.kostenarten : []).filter(k => k && k.kostenart && k.inNK === "Ja");
  const report = qualityReport(true);
  const issueRows = report.results.filter(row => ["Kritischer Abrechnungsmangel","Entscheidung erforderlich","Hinweis"].includes(row.status));

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("dashboard");

  const issuesTable = document.getElementById("issuesTable");
  if (issuesTable) issuesTable.innerHTML =
    '<thead><tr><th>Bereich</th><th>Prüfpunkt</th><th>Status</th></tr></thead><tbody>' +
    (issueRows.length ? issueRows.slice(0,12).map(row => '<tr><td>' + escapeHtml(row.groupLabel) + '</td><td><button type="button" class="link-button"' + uiActionAttributes("quality.openDetail", [qualityEncoded(row.instanceId)]) + '>' + escapeHtml(row.title) + '</button></td><td><span class="status ' + qualityStatusClass(row.status) + '">' + escapeHtml(row.status) + '</span></td></tr>').join("") : '<tr><td colspan="3">Keine offenen zentralen Prüfpunkte.</td></tr>') +
    '</tbody>';

  const activeCostsTable = document.getElementById("activeCostsTable");
  if (activeCostsTable) activeCostsTable.innerHTML =
    '<thead><tr><th>Kostenart</th><th>Umlageschlüssel</th><th>Gesamtbetrag</th><th>Status</th></tr></thead><tbody>' +
    (aktiveKosten.length ? aktiveKosten.map(k => '<tr><td>' + escapeHtml(k.kostenart) + '</td><td>' + escapeHtml(k.umlageschluessel) + '</td><td>' + fmtMoney(k.gesamtbetrag) + '</td><td><span class="status ' + statusClass(NK_PRO_MODULES.costActions.kostenStatus(k)) + '">' + escapeHtml(NK_PRO_MODULES.costActions.kostenStatus(k)) + '</span></td></tr>').join("") : '<tr><td colspan="4">Keine aktiven Kostenarten.</td></tr>') +
    '</tbody>';
  renderWorkflowDashboard();
}

// AP22F11B Korrektur 3: handlungsorientierte Abschlussprüfung und separates Regelinventar.
let qualityHideHints = true;
let qualityCompletedExpanded = false;

function qualityOpenRows(report) {
  return (report && Array.isArray(report.results) ? report.results : [])
    .filter(row => row.ruleId !== "NKP-FACH-019")
    .filter(row => ["Kritischer Abrechnungsmangel","Entscheidung erforderlich","Hinweis","Technischer Fehler"].includes(row.status));
}

function qualityCompletedRows(report) {
  return (report && Array.isArray(report.results) ? report.results : [])
    .filter(row => row.ruleId !== "NKP-FACH-019")
    .filter(row => ["Bestanden","Nicht anwendbar"].includes(row.status));
}

function qualityTaskActionLabel(row) {
  const tab = String(row && row.targetTab || "");
  if (["manuellewerte","verbraeuche","wasser","mieter","mieterverwaltung","einnahmen","einstellungen"].includes(tab)) return "Zur Eingabe";
  if (tab === "umlage") return "Zum Ergebnis";
  if (tab === "briefe") return "Zu Briefen";
  if (tab === "vorauszahlungsanpassung") return "Zur Anpassung";
  if (tab === "start") return "Zur Übersicht";
  if (tab === "qualitaet" || !tab) return "Details";
  return "Zum Bereich";
}

function qualityTaskActionHtml(row) {
  if (!row || !row.targetTab || row.targetTab === "qualitaet") {
    return qualityActionButton("Details", "quality.openDetail", [qualityEncoded(row.instanceId)], "secondary");
  }
  return qualityActionButton(qualityTaskActionLabel(row), "quality.jumpToIssue", [row.targetTab, qualityEncoded(row.instanceId)], "secondary");
}

function qualityOpenTaskRowHtml(row) {
  return '<tr class="quality-finalization-task-row"><td><span class="quality-area-label">' + escapeHtml(row.groupLabel) + '</span></td>' +
    '<td><button type="button" class="link-button quality-task-title"' + uiActionAttributes("quality.openDetail", [qualityEncoded(row.instanceId)]) + '>' + escapeHtml(row.title) + '</button><div class="small">' + escapeHtml(row.entityLabel || "") + '</div></td>' +
    '<td><span class="status ' + qualityStatusClass(row.status) + '">' + escapeHtml(row.status === "Kritischer Abrechnungsmangel" ? "Fehler" : row.status) + '</span></td>' +
    '<td class="quality-task-detail">' + escapeHtml(row.details || row.resultText || "–") + '</td>' +
    '<td class="actions-cell">' + qualityTaskActionHtml(row) + '</td></tr>';
}

function qualityCompletedRowHtml(row, generatedAt) {
  const at = row.confirmation && row.confirmation.at ? row.confirmation.at : generatedAt;
  let checkedAt = "Automatisch geprüft";
  try { if (at) checkedAt = new Date(at).toLocaleString("de-DE", {dateStyle:"short", timeStyle:"short"}); } catch (_) {}
  const result = row.status === "Nicht anwendbar" ? "Nicht anwendbar" : (row.confirmation ? "Bestätigt" : "Bestanden");
  return '<tr><td>' + escapeHtml(row.groupLabel) + '</td><td><button type="button" class="link-button"' + uiActionAttributes("quality.openDetail", [qualityEncoded(row.instanceId)]) + '>' + escapeHtml(row.title) + '</button></td><td><span class="quality-completed-result"><span aria-hidden="true">✓</span>' + escapeHtml(result) + '</span></td><td>' + escapeHtml(checkedAt) + '</td></tr>';
}

function qualityGroupReady(report, groupId) {
  const group = report && Array.isArray(report.groups) ? report.groups.find(item => item.id === groupId) : null;
  return !!group && !group.counts.blocked && !group.counts.review;
}

function qualityCompletionChecklistItem(ok, label) {
  return '<li class="' + (ok ? "is-done" : "is-open") + '"><span aria-hidden="true">' + (ok ? "✓" : "!") + '</span><span>' + escapeHtml(label) + '</span></li>';
}

function renderQualityCompletionCard(report) {
  const el = document.getElementById("qualityCompletionCard");
  if (!el) return;
  const finalized = !!(NK_PRO_MODULES.billingWorkflow && NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized && NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized());
  const readOnly = qualityIsReadOnly();
  const ready = report.readiness.level === "ok";
  const action = finalized
    ? '<button class="secondary quality-completion-action" data-ui-action="billing.unlock" type="button"' + (isArchiveViewer() ? ' disabled aria-disabled="true"' : '') + '>Zur Bearbeitung öffnen</button>'
    : '<button class="primary quality-completion-action" data-ui-action="billing.finalize" type="button"' + (!ready || readOnly ? ' disabled aria-disabled="true"' : '') + '>Abrechnung abschließen</button>';
  const message = finalized
    ? "Die Abrechnung ist abgeschlossen und gegen unbeabsichtigte Änderungen geschützt."
    : ready
      ? "Alle kritischen Abrechnungsmängel und offenen Plausibilitätsprüfungen sind erledigt. Die Abrechnung kann abgeschlossen werden."
      : "Erst wenn alle kritischen Abrechnungsmängel und offenen Prüfungen erledigt sind, kann die Abrechnung abgeschlossen werden.";
  el.innerHTML = '<header><span class="quality-completion-icon" aria-hidden="true">✓</span><div><p class="quality-completion-eyebrow">Finaler Schritt</p><h2 id="qualityCompletionTitle">Abrechnung abschließen</h2></div></header>' +
    '<p>' + escapeHtml(message) + '</p><ul>' +
    qualityCompletionChecklistItem(!report.counts.blocked, "Alle Pflichtdaten vollständig erfasst") +
    qualityCompletionChecklistItem(!report.counts.review, "Plausibilitätsprüfungen bearbeitet") +
    qualityCompletionChecklistItem(qualityGroupReady(report,"allocation"), "Umlage und Differenzen behandelt") +
    qualityCompletionChecklistItem(qualityGroupReady(report,"letters"), "Briefe können erzeugt werden") +
    '</ul>' + action +
    (finalized ? '<div class="quality-completion-finalized"><strong>Abgeschlossen</strong><span>Schreibschutz aktiv</span></div>' : '');
}

function renderQualityStatusCards(report) {
  const el = document.getElementById("qualityStatusCards");
  if (!el) return;
  const finalized = !!(NK_PRO_MODULES.billingWorkflow && NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized && NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized());
  const statusLabel = finalized ? "Abgeschlossen" : (report.readiness.level === "ok" ? "Bereit zum Abschluss" : "Nicht abgeschlossen");
  const cards = [
    {label:"Kritische Mängel", value:report.counts.blocked, status:"err", hint:report.counts.blocked ? "Abschluss derzeit nicht möglich" : "Keine kritischen Mängel", filter:"blocked", icon:"×"},
    {label:"Offene Prüfungen", value:report.counts.review, status:"warn", hint:report.counts.review ? "Fachliche Prüfung notwendig" : "Keine offenen Prüfungen", filter:"review", icon:"!"},
    {label:"Hinweise", value:report.counts.hints, status:"info", hint:"Zur Kenntnis und Kontrolle", filter:"hints", icon:"i"},
    {label:"Abschlussstatus", value:statusLabel, status:finalized || report.readiness.level === "ok" ? "ok" : "neutral", hint:finalized ? "Abrechnung ist schreibgeschützt" : "Abrechnung kann noch bearbeitet werden", filter:"", icon:"✓"}
  ];
  el.innerHTML = cards.map(card => '<button type="button" class="quality-finalization-kpi is-' + card.status + '"' + (card.filter ? uiActionAttributes("quality.setFilter",[card.filter]) : ' disabled aria-disabled="true"') + '><span class="quality-finalization-kpi__icon" aria-hidden="true">' + escapeHtml(card.icon) + '</span><span class="quality-finalization-kpi__body"><span>' + escapeHtml(card.label) + '</span><strong' + (typeof card.value === "string" ? ' class="is-text"' : '') + '>' + escapeHtml(String(card.value)) + '</strong><small>' + escapeHtml(card.hint) + '</small></span><span class="quality-finalization-kpi__arrow" aria-hidden="true">›</span></button>').join("");
}

function qualitySetFilter(mode) {
  const requested = mode || "open";
  if (requested === "hints") qualityHideHints = false;
  if (requested === "blocked" || requested === "review") qualityHideHints = true;
  renderQuality(requested);
  const table = document.getElementById("qualityOpenTasksTable");
  if (table) table.scrollIntoView({behavior:"smooth",block:"center"});
}

function toggleQualityOpenOnly() {
  qualityHideHints = !qualityHideHints;
  renderQuality(qualityCurrentFilter);
}

function toggleQualityCompleted() {
  qualityCompletedExpanded = !qualityCompletedExpanded;
  renderQuality(qualityCurrentFilter);
}

function renderQuality(filterMode) {
  qualityCurrentFilter = filterMode || qualityCurrentFilter || "open";
  qualityLastReport = null;
  const report = qualityReport(true);
  renderQualityStatusCards(report);

  let openRows = qualityOpenRows(report);
  if (qualityCurrentFilter === "blocked") openRows = openRows.filter(row => row.status === "Kritischer Abrechnungsmangel");
  else if (qualityCurrentFilter === "review") openRows = openRows.filter(row => row.status === "Entscheidung erforderlich");
  else if (qualityCurrentFilter === "hints") openRows = openRows.filter(row => row.status === "Hinweis");
  else if (qualityHideHints) openRows = openRows.filter(row => row.status !== "Hinweis");

  const allOpenCount = qualityOpenRows(report).length;
  const countEl = document.getElementById("qualityOpenTaskCount");
  const openTable = document.getElementById("qualityOpenTasksTable");
  if (countEl) countEl.textContent = "(" + openRows.length + (openRows.length !== allOpenCount ? " von " + allOpenCount : "") + ")";
  if (openTable) openTable.innerHTML = '<thead><tr><th>Bereich</th><th>Prüfpunkt</th><th>Status</th><th>Details</th><th>Aktion</th></tr></thead><tbody>' + (openRows.length ? openRows.map(qualityOpenTaskRowHtml).join("") : '<tr><td colspan="5"><div class="quality-empty-state"><strong>Keine Punkte für diese Ansicht.</strong><span>' + (allOpenCount ? "Weitere Hinweise können über den Schalter eingeblendet werden." : "Alle zentralen Prüfpunkte sind erledigt.") + '</span></div></td></tr>') + '</tbody>';

  const toggle = document.getElementById("qualityOpenOnlyToggle");
  if (toggle) {
    toggle.classList.toggle("is-active", qualityHideHints);
    toggle.setAttribute("aria-pressed", qualityHideHints ? "true" : "false");
    toggle.lastChild.textContent = qualityHideHints ? "Hinweise ausblenden" : "Hinweise einblenden";
  }

  const completed = qualityCompletedRows(report);
  const completedVisible = qualityCompletedExpanded ? completed : completed.slice(0, 6);
  const completedCount = document.getElementById("qualityCompletedCount");
  if (completedCount) completedCount.textContent = "(" + completed.length + ")";
  const completedTable = document.getElementById("qualityAcknowledgedTable");
  if (completedTable) completedTable.innerHTML = '<thead><tr><th>Bereich</th><th>Prüfpunkt</th><th>Ergebnis</th><th>Geprüft am</th></tr></thead><tbody>' + (completedVisible.length ? completedVisible.map(row => qualityCompletedRowHtml(row,report.generatedAt)).join("") : '<tr><td colspan="4">Noch keine erledigten Prüfpunkte.</td></tr>') + '</tbody>';
  const completedToggle = document.getElementById("qualityCompletedToggle");
  if (completedToggle) completedToggle.textContent = qualityCompletedExpanded ? "Erledigte Prüfungen einklappen" : "Alle erledigten Prüfungen anzeigen (" + completed.length + ")";

  renderQualityCompletionCard(report);
  const note = document.getElementById("qualityLastRunNote");
  if (note) {
    let when = "gerade eben";
    try { when = new Date(report.generatedAt).toLocaleString("de-DE"); } catch (_) {}
    note.innerHTML = '<strong>Automatische Abschlussprüfung</strong><span>Die Prüfung wird bei relevanten Änderungen aktualisiert. Letzte Prüfung: ' + escapeHtml(when) + '.</span>';
  }
  if (qualityIsReadOnly()) document.querySelectorAll('[data-ui-action="quality.confirmIssue"],[data-ui-action="quality.markNotApplicable"],[data-ui-action="quality.reopenIssue"]').forEach(button => { button.disabled = true; button.setAttribute("aria-disabled", "true"); button.title = "Im Ansichtsmodus nicht verfügbar"; });
  if (typeof renderOverviewForTab === "function") renderOverviewForTab("qualitaet");
}

function qualityRegistryPriority(status) {
  return ({"Technischer Fehler":6,"Kritischer Abrechnungsmangel":5,"Entscheidung erforderlich":4,"Hinweis":3,"Nicht anwendbar":2,"Bestanden":1})[status] || 0;
}

function qualityRegistryAggregate(rule, report) {
  const results = (report.results || []).concat(report.technicalResults || []).filter(row => row.ruleId === rule.id);
  const worst = results.slice().sort((a,b) => qualityRegistryPriority(b.status) - qualityRegistryPriority(a.status))[0] || null;
  return {rule,results,worst,status:worst ? worst.status : "Nicht ausgeführt"};
}

function renderRuleInventoryKpis(rows) {
  const el = document.getElementById("ruleInventoryKpis");
  if (!el) return;
  const applied = rows.filter(row => row.results.length).length;
  const findings = rows.filter(row => ["Technischer Fehler","Kritischer Abrechnungsmangel","Entscheidung erforderlich","Hinweis"].includes(row.status)).length;
  const notApplicable = rows.filter(row => row.status === "Nicht anwendbar").length;
  const cards = [
    ["Regeln insgesamt",rows.length,"Registry"],
    ["Aktuell angewendet",applied,"Im geöffneten Abrechnungsstand"],
    ["Auffälligkeiten",findings,"Fehler, Prüfungen und Hinweise"],
    ["Nicht anwendbar",notApplicable,"Fachlich dokumentiert"]
  ];
  el.innerHTML = cards.map((card,index) => '<article class="rule-inventory-kpi is-' + ["blue","green","orange","gray"][index] + '"><span>' + escapeHtml(card[0]) + '</span><strong>' + escapeHtml(String(card[1])) + '</strong><small>' + escapeHtml(card[2]) + '</small></article>').join("");
}

function populateRuleInventoryGroups() {
  const select = document.getElementById("ruleInventoryGroupFilter");
  if (!select || select.options.length > 1) return;
  NKProQualityRules.GROUPS.forEach(group => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.label;
    select.appendChild(option);
  });
}

function renderRuleInventory(existingReport) {
  qualityLastReport = null;
  const report = existingReport || qualityReport(true);
  populateRuleInventoryGroups();
  const allRows = NKProQualityRules.REGISTRY.map(rule => qualityRegistryAggregate(rule,report));
  renderRuleInventoryKpis(allRows);
  const search = String((document.getElementById("ruleInventorySearch") || {}).value || "").trim().toLocaleLowerCase("de-DE");
  const group = String((document.getElementById("ruleInventoryGroupFilter") || {}).value || "all");
  const status = String((document.getElementById("ruleInventoryStatusFilter") || {}).value || "all");
  const filtered = allRows.filter(item => {
    if (group !== "all" && item.rule.group !== group) return false;
    if (status !== "all" && item.status !== status) return false;
    if (!search) return true;
    const groupLabel = (NKProQualityRules.GROUPS.find(entry => entry.id === item.rule.group) || {}).label || item.rule.group;
    return [item.rule.id,item.rule.title,item.rule.category,item.rule.dataSource,groupLabel,item.status].join(" ").toLocaleLowerCase("de-DE").includes(search);
  });
  const table = document.getElementById("qualityRuleRegistryTable");
  if (table) table.innerHTML = '<thead><tr><th>Fachliche Regel</th><th>Fachbereich</th><th>Datenquelle</th><th>Aktuelles Ergebnis</th><th>Status</th><th>Details</th></tr></thead><tbody>' + (filtered.length ? filtered.map(item => {
    const groupLabel = (NKProQualityRules.GROUPS.find(entry => entry.id === item.rule.group) || {}).label || item.rule.group;
    const resultText = item.worst ? (item.worst.details || item.worst.resultText || "Ausgeführt") : "Im aktuellen Zustand nicht ausgeführt";
    const detail = item.worst ? '<button type="button" class="ui-button ui-button--icon secondary" aria-label="Regeldetails öffnen"' + uiActionAttributes("quality.openDetail",[qualityEncoded(item.worst.instanceId)]) + '>i</button>' : '<span class="small">–</span>';
    return '<tr><td><strong>' + escapeHtml(item.rule.title) + '</strong><div class="small"><code>' + escapeHtml(item.rule.id) + '</code> · Version ' + escapeHtml(String(item.rule.version)) + '</div></td><td>' + escapeHtml(groupLabel) + '<div class="small">' + escapeHtml(item.rule.category) + '</div></td><td>' + escapeHtml(item.rule.dataSource) + '</td><td class="rule-inventory-result">' + escapeHtml(resultText) + '</td><td><span class="status ' + qualityStatusClass(item.status) + '">' + escapeHtml(item.status) + '</span></td><td class="actions-cell">' + detail + '</td></tr>';
  }).join("") : '<tr><td colspan="6"><div class="quality-empty-state"><strong>Keine passenden Regeln gefunden.</strong><span>Suchbegriff oder Filter anpassen.</span></div></td></tr>') + '</tbody>';
  const count = document.getElementById("ruleInventoryResultCount");
  if (count) count.textContent = filtered.length + " von " + allRows.length + " Regeln";
  if (typeof renderOverviewForTab === "function") renderOverviewForTab("regelinventar");
}

function filterQualityRegistry() { renderRuleInventory(); }
