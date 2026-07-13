"use strict";

// AP12: Release-Audit und App-Selbsttest.
// ===== Bereich: Release-Audit V75 =====












function showReleaseAuditReport() {
  const text = NK_PRO_MODULES.diagnostics.releaseAuditReportText();
  alert(text);
  return text;
}

function downloadReleaseAuditReport() {
  download(txtFileName("nk-pro-release-audit"), NK_PRO_MODULES.diagnostics.releaseAuditReportText(), "text/plain;charset=utf-8");
}

function renderReleaseAuditSummary() {
  const el = document.getElementById("releaseAuditSummary");
  if (!el) return;
  const report = NK_PRO_MODULES.diagnostics.releaseAuditReport();
  const s = report.summary;
  const problemRows = report.rows.filter(row => row.severity === "Fehler" || row.severity === "Prüfen" || row.severity === "Hinweis");
  const detailsHtml = problemRows.length ? '<div class="small" style="margin-top:10px"><strong>Details:</strong><ul style="margin:6px 0 0 18px; padding:0">' +
    problemRows.slice(0, 8).map(row => '<li><strong>' + escapeHtml(row.severity) + ' · ' + escapeHtml(row.area) + ' · ' + escapeHtml(row.point) + '</strong>' + (row.detail ? ': ' + escapeHtml(row.detail) : '') + '</li>').join('') +
    (problemRows.length > 8 ? '<li>Weitere Einträge im vollständigen Auditbericht.</li>' : '') + '</ul></div>' : '';
  el.innerHTML = '<div class="release-audit-box ' + s.level + '"><strong>Release-Audit ' + escapeHtml(APP_VERSION) + '</strong><div class="small">' + escapeHtml(s.message) + '</div>' +
    '<div class="audit-grid"><span class="audit-pill">' + s.ok + ' OK</span><span class="audit-pill">' + s.warnings + ' Hinweise</span><span class="audit-pill">' + s.errors + ' Fehler</span><span class="audit-pill">' + escapeHtml(APP_VERSION_NAME) + '</span></div>' + detailsHtml + '</div>';
}

// ===== Bereich: App-Selbsttest =====







function runAppSelfTest() {
  const report = NK_PRO_MODULES.diagnostics.appSelfTestReport();
  const rows = Array.isArray(report && report.rows) ? report.rows : [];
  const summary = report && report.summary ? report.summary : NK_PRO_MODULES.diagnostics.appSelfTestSummary(rows);
  setActionMessage(summary.message, summary.level);
  renderActionFeedback();
  const details = rows.map(row => row.severity + " · " + row.area + " · " + row.point + (row.detail ? ": " + row.detail : "")).join("\n");
  alert("App-Selbsttest\n\n" + summary.message + "\n\n" + details);
  if (summary.errors && typeof switchToTab === "function") switchToTab("qualitaet");
  return report;
}
