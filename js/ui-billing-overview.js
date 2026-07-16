(function (global) {
  "use strict";

  const FILTERS = Object.freeze([
    { id:"all", label:"Alle" },
    { id:"working", label:"In Bearbeitung" },
    { id:"completed", label:"Abgeschlossen" },
    { id:"archived", label:"Archiviert" }
  ]);
  const PAGE_SIZES = Object.freeze([5, 10, 20]);
  const STEP_DEFINITIONS = Object.freeze([
    { number:1, label:"Mietverhältnisse", groups:["units-tenancies"], tab:"mieter", completeHint:"Mietverhältnisse fachlich geprüft" },
    { number:2, label:"Vorauszahlungen", groups:["prepayments"], tab:"einnahmen", completeHint:"Vorauszahlungen fachlich geprüft" },
    { number:3, label:"Gesamtkosten", groups:["costs"], tab:"einstellungen", completeHint:"Kostenarten fachlich geprüft" },
    { number:4, label:"Individuelle Werte", groups:["consumption"], extraRules:["NKP-FACH-013"], tab:"manuellewerte", completeHint:"Verbrauchs- und Einzelwerte geprüft" },
    { number:5, label:"Abrechnungsergebnis", groups:["allocation"], tab:"umlage", completeHint:"Umlage und Summen geprüft" },
    { number:6, label:"Prüfung", groups:["completion"], tab:"qualitaet", completeHint:"Zentrale Prüfung ohne offene Pflichtfehler" }
  ]);

  let activeFilter = "all";
  let pageSize = 10;
  let listenersBound = false;

  function html(value) {
    if (typeof global.escapeHtml === "function") return global.escapeHtml(String(value == null ? "" : value));
    return String(value == null ? "" : value).replace(/[&<>\"']/g, function (char) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char];
    });
  }

  function actionAttributes(action, args) {
    const attributes = ' data-ui-action="' + html(action) + '"';
    return attributes + (args ? ' data-ui-args="' + html(JSON.stringify(args)) + '"' : "");
  }

  function formatDate(value) {
    if (!value) return "–";
    const raw = String(value);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(raw + "T00:00:00") : new Date(raw);
    return Number.isFinite(date.getTime()) ? date.toLocaleDateString("de-DE") : raw;
  }

  function formatDateTime(value) {
    if (!value) return "Noch nicht gespeichert";
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? date.toLocaleString("de-DE", { dateStyle:"short", timeStyle:"short" })
      : String(value);
  }

  function periodForData(data, item) {
    if (item && global.NK_PRO_MODULES && NK_PRO_MODULES.archiveActions) {
      try { return NK_PRO_MODULES.archiveActions.periodLabel(item); } catch (error) { /* Fallback below. */ }
    }
    const source = data || {};
    const meta = source.meta || {};
    const year = String(meta.abrechnungsjahr || source.year || "");
    const start = meta.abrechnungsbeginn || (year ? year + "-01-01" : "");
    const end = meta.abrechnungsende || (year ? year + "-12-31" : "");
    if (start && end) return formatDate(start) + " – " + formatDate(end);
    return year || "–";
  }

  function yearForData(data, item) {
    const source = data || {};
    const meta = source.meta || {};
    const raw = (item && (item.year || (item.meta && item.meta.abrechnungsjahr))) || meta.abrechnungsjahr || source.year || "";
    const match = String(raw).match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  }

  function hasCurrentBilling() {
    try { return !!(NK_PRO_MODULES.archiveActions && NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling()); }
    catch (error) { return false; }
  }

  function currentReport() {
    if (!hasCurrentBilling()) return null;
    try { return NK_PRO_MODULES.qualityAssurance.inspect({ scope:"currentBilling", includeTechnical:false }); }
    catch (error) { return null; }
  }

  function reportForArchive(item) {
    const data = item && item.data ? item.data : item;
    try {
      if (NK_PRO_MODULES.qualityRules && typeof NK_PRO_MODULES.qualityRules.evaluate === "function") {
        return NK_PRO_MODULES.qualityRules.evaluate(data, { scope:"archive", includeTechnical:false });
      }
    } catch (error) { /* Archive validation below remains authoritative. */ }
    return null;
  }

  function resultsForStep(report, definition) {
    if (!report || !Array.isArray(report.results)) return [];
    const groups = new Set(definition.groups || []);
    const rules = new Set(definition.extraRules || []);
    return report.results.filter(function (row) {
      return groups.has(row.group) || rules.has(row.ruleId);
    });
  }

  function firstIssue(rows, preferredStatuses) {
    const order = preferredStatuses || ["Blockiert", "Zu prüfen", "Hinweis"];
    for (const status of order) {
      const found = rows.find(function (row) { return row.status === status && !row.passed && !row.automaticNotApplicable; });
      if (found) return found;
    }
    return null;
  }

  function conciseDetail(row, fallback) {
    if (!row) return fallback;
    const details = String(row.details || row.title || fallback || "").trim();
    return details.length > 108 ? details.slice(0, 105).trimEnd() + "…" : details;
  }

  function buildSteps(report) {
    let previousBlocking = false;
    return STEP_DEFINITIONS.map(function (definition) {
      const rows = resultsForStep(report, definition);
      const blocked = rows.filter(function (row) { return row.status === "Blockiert"; });
      const review = rows.filter(function (row) { return row.status === "Zu prüfen"; });
      const hints = rows.filter(function (row) { return row.status === "Hinweis"; });
      const applicable = rows.filter(function (row) { return row.status !== "Nicht anwendbar"; });
      let stateName = "complete";
      let status = "Vollständig";
      let hint = definition.completeHint;
      let available = true;
      let issue = null;

      if (definition.number === 5 && previousBlocking) {
        stateName = "unavailable";
        status = "Noch nicht verfügbar";
        hint = "Vorherige Schritte abschließen";
        available = false;
      } else if (definition.number === 6) {
        const allRows = report && Array.isArray(report.results) ? report.results : [];
        const allBlocked = allRows.filter(function (row) { return row.status === "Blockiert"; });
        const allReview = allRows.filter(function (row) { return row.status === "Zu prüfen"; });
        issue = firstIssue(allRows);
        if (allBlocked.length) {
          stateName = "blocked";
          status = "Blockiert";
          hint = allBlocked.length + (allBlocked.length === 1 ? " Fehler vorhanden" : " Fehler vorhanden");
        } else if (allReview.length) {
          stateName = "open";
          status = "Offen";
          hint = allReview.length + (allReview.length === 1 ? " Prüfpunkt offen" : " Prüfpunkte offen");
        } else {
          hint = hints.length ? hints.length + " Hinweise ohne Blockierwirkung" : definition.completeHint;
        }
      } else if (blocked.length) {
        issue = firstIssue(blocked);
        stateName = "error";
        status = "Fehler";
        hint = conciseDetail(issue, blocked.length + " Pflichtfehler vorhanden");
        previousBlocking = true;
      } else if (review.length) {
        issue = firstIssue(review);
        stateName = "open";
        status = "Offen";
        hint = conciseDetail(issue, review.length + " Prüfpunkte offen");
      } else if (!rows.length || !applicable.length) {
        stateName = "complete";
        status = "Vollständig";
        hint = definition.completeHint;
      } else if (hints.length) {
        issue = firstIssue(hints);
        hint = conciseDetail(issue, hints.length + " Hinweise vorhanden");
      }

      return Object.freeze(Object.assign({}, definition, {
        state:stateName, status, hint, available, issue,
        blockedCount:blocked.length, reviewCount:review.length, hintCount:hints.length
      }));
    });
  }

  function buildAssessment(report) {
    if (!report) return null;
    const steps = buildSteps(report);
    const complete = steps.filter(function (step) { return step.state === "complete"; }).length;
    const open = steps.filter(function (step) { return step.state === "open" || step.state === "unavailable"; }).length;
    const blocked = steps.filter(function (step) { return step.state === "blocked" || step.state === "error"; }).length;
    const hints = report.counts && Number.isFinite(Number(report.counts.hints)) ? Number(report.counts.hints) : 0;
    const next = steps.find(function (step) { return step.state === "error" || step.state === "blocked"; }) ||
      steps.find(function (step) { return step.state === "open"; }) ||
      steps.find(function (step) { return step.state === "unavailable"; }) || steps[steps.length - 1];
    return Object.freeze({ steps:Object.freeze(steps), counts:Object.freeze({ complete, open, blocked, hints }), next, total:steps.length });
  }

  function currentRecord() {
    if (!hasCurrentBilling()) return null;
    const report = currentReport();
    const assessment = buildAssessment(report);
    const meta = state && state.meta ? state.meta : {};
    const finalized = !!(NK_PRO_MODULES.billingWorkflow && NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized());
    return Object.freeze({
      kind:"current", status:finalized ? "completed" : "working", data:state, item:null, index:null,
      year:yearForData(state), period:periodForData(state), assessment,
      changed:meta.lastSavedAt || meta.currentBillingFinalizedAt || meta.currentBillingCreatedAt || meta.updatedAt || ""
    });
  }

  function archiveAssessment(item) {
    const report = reportForArchive(item);
    if (report) return buildAssessment(report);
    let validation = { errors:[], warnings:[] };
    try { validation = NK_PRO_MODULES.archiveActions.validateItem(item); } catch (error) { validation.errors = [error.message]; }
    const firstError = validation.errors[0] || "";
    const complete = firstError ? 0 : STEP_DEFINITIONS.length;
    const steps = STEP_DEFINITIONS.map(function (definition) {
      const error = firstError;
      return Object.freeze(Object.assign({}, definition, {
        state:error ? "error" : "complete", status:error ? "Fehler" : "Vollständig",
        hint:error || definition.completeHint, available:false, issue:null,
        blockedCount:error ? 1 : 0, reviewCount:0, hintCount:validation.warnings.length
      }));
    });
    return Object.freeze({ steps:Object.freeze(steps), counts:Object.freeze({complete,open:0,blocked:firstError ? 1 : 0,hints:validation.warnings.length}), next:steps[0], total:steps.length });
  }

  function archiveRecords() {
    const archive = state && Array.isArray(state.jahresArchiv) ? state.jahresArchiv : [];
    return archive.map(function (item, index) {
      const data = item && item.data ? item.data : {};
      const meta = item && (item.meta || (item.data && item.data.meta)) || {};
      return Object.freeze({
        kind:"archive", status:"archived", item, data, index,
        year:yearForData(data, item), period:periodForData(data, item), assessment:archiveAssessment(item),
        changed:(item && (item.archivedAt || item.updatedAt)) || meta.lastSavedAt || meta.currentBillingFinalizedAt || ""
      });
    });
  }

  function records() {
    const rows = archiveRecords();
    const current = currentRecord();
    if (current) rows.push(current);
    return rows.sort(function (a, b) {
      if (b.year !== a.year) return b.year - a.year;
      if (a.kind !== b.kind) return a.kind === "current" ? -1 : 1;
      return String(b.changed).localeCompare(String(a.changed));
    });
  }

  function statusPresentation(status) {
    if (status === "working") return { label:"In Bearbeitung", className:"is-working" };
    if (status === "completed") return { label:"Abgeschlossen", className:"is-completed" };
    return { label:"Archiviert", className:"is-archived" };
  }

  function recordActionHtml(record) {
    if (record.kind === "current") {
      const primary = record.status === "working"
        ? '<button class="ui-button ui-button--primary ui-button--compact"' + actionAttributes("billing.openCurrentEdit") + '>Bearbeiten</button>'
        : '<button class="ui-button ui-button--secondary ui-button--compact"' + actionAttributes("billing.openCurrentView") + '>Ansehen</button><button class="ui-button ui-button--secondary ui-button--compact"' + actionAttributes("billing.openCurrentEdit") + '>Korrigieren</button>';
      const secondary = record.status === "working"
        ? '<button class="ui-button ui-button--secondary ui-button--compact"' + actionAttributes("billing.openCurrentView") + '>Ansehen</button>'
        : "";
      return primary + secondary + '<button class="ui-button ui-button--icon billing-overview__more" aria-label="Weitere Aktionen zur Abrechnung ' + html(record.year) + '" title="Archiv und weitere Aktionen öffnen"' + actionAttributes("navigation.switchTab", ["archiv"]) + '><span aria-hidden="true">⋮</span></button>';
    }
    return '<button class="ui-button ui-button--secondary ui-button--compact"' + actionAttributes("archive.openYear", [record.index]) + '>Ansehen</button>' +
      '<button class="ui-button ui-button--secondary ui-button--compact"' + actionAttributes("archive.reopenForRework", [record.index]) + '>Korrigieren</button>' +
      '<button class="ui-button ui-button--icon billing-overview__more" aria-label="Weitere Aktionen zur archivierten Abrechnung ' + html(record.year) + '" title="Archiv öffnen"' + actionAttributes("navigation.switchTab", ["archiv"]) + '><span aria-hidden="true">⋮</span></button>';
  }

  function progressHtml(assessment, recordStatus) {
    const total = assessment ? assessment.total : STEP_DEFINITIONS.length;
    const complete = assessment ? assessment.counts.complete : 0;
    const percent = Math.max(0, Math.min(100, Math.round((complete / Math.max(total, 1)) * 100)));
    const className = recordStatus === "completed" ? "is-completed" : (recordStatus === "archived" ? "is-archived" : "is-working");
    return '<div class="billing-record-progress"><span>' + complete + ' von ' + total + ' Schritten</span><span class="billing-progress-track ' + className + '" aria-label="' + percent + ' Prozent abgeschlossen"><span style="width:' + percent + '%"></span></span></div>';
  }

  function recordRowsHtml(allRecords) {
    const shown = allRecords.filter(function (record) { return activeFilter === "all" || record.status === activeFilter; }).slice(0, pageSize);
    if (!shown.length) return '<tr><td class="billing-overview__empty" colspan="5">Für diesen Filter sind keine Abrechnungen vorhanden.</td></tr>';
    return shown.map(function (record) {
      const status = statusPresentation(record.status);
      return '<tr data-billing-record-status="' + html(record.status) + '">' +
        '<td data-label="Zeitraum"><strong class="billing-period-cell">' + html(record.period) + '</strong></td>' +
        '<td data-label="Status"><span class="billing-record-status ' + status.className + '"><span aria-hidden="true" class="billing-record-status__dot"></span>' + html(status.label) + '</span></td>' +
        '<td data-label="Bearbeitungsstand">' + progressHtml(record.assessment, record.status) + '</td>' +
        '<td data-label="Letzte Änderung"><time>' + html(formatDateTime(record.changed)) + '</time></td>' +
        '<td data-label="Aktionen"><div class="billing-record-actions">' + recordActionHtml(record) + '</div></td>' +
      '</tr>';
    }).join("");
  }

  function filterHtml() {
    return FILTERS.map(function (filter) {
      const active = activeFilter === filter.id;
      return '<button class="ui-button ui-button--compact billing-filter' + (active ? ' is-active' : '') + '" data-billing-overview-filter="' + filter.id + '" aria-pressed="' + active + '" type="button">' + filter.label + '</button>';
    }).join("");
  }

  function recordsSectionHtml(allRecords) {
    const matching = allRecords.filter(function (record) { return activeFilter === "all" || record.status === activeFilter; }).length;
    return '<section class="billing-overview-panel billing-overview-panel--records" aria-labelledby="billingRecordsHeading">' +
      '<h3 id="billingRecordsHeading">Abrechnungen</h3>' +
      '<div class="billing-filter-row" role="group" aria-label="Abrechnungen filtern">' + filterHtml() + '</div>' +
      '<div class="table-wrap billing-overview-table-wrap"><table class="billing-overview-table billing-records-table">' +
        '<thead><tr><th>Zeitraum</th><th>Status</th><th>Bearbeitungsstand</th><th>Letzte Änderung</th><th>Aktionen</th></tr></thead>' +
        '<tbody>' + recordRowsHtml(allRecords) + '</tbody>' +
        '<tfoot><tr><td colspan="3">' + matching + (matching === 1 ? ' Abrechnung' : ' Abrechnungen') + '</td><td colspan="2"><label class="billing-page-size">Zeilen pro Seite: <select data-billing-overview-page-size aria-label="Zeilen pro Seite">' + PAGE_SIZES.map(function (size) { return '<option value="' + size + '"' + (size === pageSize ? ' selected' : '') + '>' + size + '</option>'; }).join("") + '</select></label></td></tr></tfoot>' +
      '</table></div>' +
    '</section>';
  }

  function stepIcon(step) {
    if (step.state === "complete") return '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><path d="m8.5 12 2.2 2.2 4.8-5"></path></svg>';
    if (step.state === "error") return '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><path d="M12 7.5v5M12 16.5h.01"></path></svg>';
    if (step.state === "blocked") return '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="7" y="10" width="10" height="8" rx="1.5"></rect><path d="M9 10V8a3 3 0 0 1 6 0v2"></path></svg>';
    return '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle></svg>';
  }

  function stepsRowsHtml(assessment) {
    return assessment.steps.map(function (step) {
      const action = step.available
        ? '<button class="ui-button ui-button--secondary ui-button--compact"' + actionAttributes("navigation.switchTab", [step.tab]) + '>' + (step.tab === "qualitaet" ? "Prüfung öffnen" : "Öffnen") + '</button>'
        : '<span class="billing-step-action-unavailable" aria-label="Nicht verfügbar">–</span>';
      return '<tr data-workflow-step="' + html(step.tab) + '">' +
        '<td data-label="Arbeitsschritt"><strong>' + step.number + '. ' + html(step.label) + '</strong></td>' +
        '<td data-label="Status"><span class="billing-step-status is-' + html(step.state) + '">' + stepIcon(step) + html(step.status) + '</span></td>' +
        '<td data-label="Hinweis">' + html(step.hint) + '</td>' +
        '<td data-label="Aktion">' + action + '</td>' +
      '</tr>';
    }).join("");
  }

  function nextIcon(tab) {
    if (tab === "manuellewerte") return '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3C9.8 6.5 6.5 10.1 6.5 14a5.5 5.5 0 0 0 11 0C17.5 10.1 14.2 6.5 12 3Z"></path><path d="M9.5 15.2a2.8 2.8 0 0 0 2.5 1.6"></path></svg>';
    if (tab === "qualitaet") return '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 19 6v5c0 4.3-2.6 7.5-7 10-4.4-2.5-7-5.7-7-10V6l7-3Z"></path><path d="m9 12 2 2 4-5"></path></svg>';
    return '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M14 7l5 5-5 5"></path></svg>';
  }

  function periodCorrectionRequired(assessment) {
    return !!(assessment && assessment.next && assessment.next.issue && assessment.next.issue.ruleId === "NKP-FACH-001");
  }

  function nextSectionHtml(assessment) {
    const next = assessment.next;
    const needsPeriodCorrection = periodCorrectionRequired(assessment);
    const title = next.state === "complete" && next.tab === "qualitaet"
      ? "Abrechnung prüfen und abschließen"
      : next.label + (next.state === "error" || next.state === "blocked" ? " korrigieren" : " vervollständigen");
    const reason = next.issue ? conciseDetail(next.issue, next.hint) : next.hint;
    const button = needsPeriodCorrection
      ? '<button class="ui-button ui-button--primary billing-next-action" data-billing-overview-period-correction type="button">Zeitraum korrigieren <span aria-hidden="true">→</span></button>'
      : '<button class="ui-button ui-button--primary billing-next-action"' + actionAttributes("navigation.switchTab", [next.tab]) + '>' + html(next.label) + ' öffnen <span aria-hidden="true">→</span></button>';
    return '<div class="billing-next-box" aria-labelledby="billingNextHeading">' +
      '<span class="billing-next-icon">' + nextIcon(next.tab) + '</span>' +
      '<div class="billing-next-copy"><strong id="billingNextHeading">Als Nächstes: ' + html(title) + '</strong><p>' + html(reason) + '</p></div>' +
      button +
    '</div>';
  }

  function periodCorrectionDialogHtml(assessment) {
    if (!periodCorrectionRequired(assessment)) return "";
    const editable = NK_PRO_MODULES.billingContext && NK_PRO_MODULES.billingContext.isEditing && NK_PRO_MODULES.billingContext.isEditing();
    const meta = state && state.meta ? state.meta : {};
    const year = String(meta.abrechnungsjahr || "");
    const start = String(meta.abrechnungsbeginn || "");
    const end = String(meta.abrechnungsende || "");
    const endYearMatch = end.match(/^(\d{4})-/);
    const endYear = endYearMatch ? endYearMatch[1] : "";
    const syncButton = editable && endYear && endYear !== year
      ? '<button class="ui-button ui-button--secondary"' + actionAttributes("billing.syncPeriodYear") + '>Abrechnungsjahr ' + html(endYear) + ' übernehmen</button>'
      : "";
    return '<dialog class="billing-period-correction-dialog" data-billing-period-dialog>' +
      '<form method="dialog" class="billing-period-correction-card">' +
        '<div><p class="page-header__kicker">Gezielte Korrektur</p><h3>Abrechnungszeitraum korrigieren</h3><p>Diese Eingaben werden ausschließlich angezeigt, weil NKP-FACH-001 einen tatsächlichen Korrekturbedarf meldet.</p></div>' +
        '<div class="billing-period-correction-grid">' +
          '<label>Abrechnungsjahr<input value="' + html(year) + '" readonly></label>' +
          '<label>Beginn<input type="date" value="' + html(start) + '"' + (editable ? actionAttributes("billing.setPeriod", ["abrechnungsbeginn", "$value"]).replace(' data-ui-action=', ' data-ui-change=') : ' disabled') + '></label>' +
          '<label>Ende<input type="date" value="' + html(end) + '"' + (editable ? actionAttributes("billing.setPeriod", ["abrechnungsende", "$value"]).replace(' data-ui-action=', ' data-ui-change=') : ' disabled') + '></label>' +
        '</div>' +
        '<div class="billing-period-correction-actions">' + syncButton + '<button class="ui-button ui-button--secondary" value="close">Schließen</button></div>' +
      '</form>' +
    '</dialog>';
  }

  function workSectionHtml(current) {
    if (!current || !current.assessment) return "";
    const assessment = current.assessment;
    const complete = assessment.counts.complete;
    const percent = Math.max(0, Math.min(100, Math.round((complete / Math.max(assessment.total, 1)) * 100)));
    return '<section class="billing-overview-panel billing-overview-panel--work" aria-labelledby="billingWorkHeading">' +
      '<div class="billing-work-heading"><h3 id="billingWorkHeading">Arbeitsstand der geöffneten Abrechnung ' + html(current.year || "") + '</h3>' +
        '<div class="billing-work-counts" aria-label="Statusübersicht">' +
          '<span>Vollständig <b class="is-complete">' + complete + '</b></span>' +
          '<span>Offen <b class="is-open">' + assessment.counts.open + '</b></span>' +
          '<span>Blockiert <b class="is-blocked">' + assessment.counts.blocked + '</b></span>' +
          '<span>Hinweise <b class="is-hint">' + assessment.counts.hints + '</b></span>' +
        '</div>' +
      '</div>' +
      '<div class="billing-work-progress"><span class="billing-work-progress__track"><span style="width:' + percent + '%"></span></span><strong>' + complete + ' von ' + assessment.total + ' Schritten abgeschlossen</strong></div>' +
      '<div class="table-wrap billing-overview-table-wrap"><table class="billing-overview-table billing-work-table"><thead><tr><th>Arbeitsschritt</th><th>Status</th><th>Hinweis</th><th>Aktion</th></tr></thead><tbody>' + stepsRowsHtml(assessment) + '</tbody></table></div>' +
      nextSectionHtml(assessment) + periodCorrectionDialogHtml(assessment) +
    '</section>';
  }

  function render() {
    const root = document.getElementById("billingOverviewRoot");
    if (!root) return false;
    const allRecords = records();
    const current = allRecords.find(function (record) { return record.kind === "current"; }) || null;
    let openedCurrent = null;
    try {
      const context = NK_PRO_MODULES.billingContext.snapshot();
      if (current && NK_PRO_MODULES.billingContext.isOpen() && context.recordType === "current") openedCurrent = current;
    } catch (error) { openedCurrent = null; }
    root.innerHTML = recordsSectionHtml(allRecords) + workSectionHtml(openedCurrent);
    return true;
  }

  function openPeriodDialog(button) {
    const root = button.closest("#billingOverviewRoot") || document;
    const dialog = root.querySelector("[data-billing-period-dialog]");
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    const first = dialog.querySelector("input:not([disabled]),button:not([disabled])");
    if (first) first.focus();
  }

  function bindListeners() {
    if (listenersBound) return;
    listenersBound = true;
    document.addEventListener("click", function (event) {
      const filter = event.target.closest("[data-billing-overview-filter]");
      if (filter) {
        activeFilter = FILTERS.some(function (entry) { return entry.id === filter.dataset.billingOverviewFilter; }) ? filter.dataset.billingOverviewFilter : "all";
        render();
        const next = document.querySelector('[data-billing-overview-filter="' + activeFilter + '"]');
        if (next) next.focus();
        return;
      }
      const importButton = event.target.closest("[data-billing-overview-import]");
      if (importButton) {
        const input = document.getElementById("jsonImport");
        if (input) input.click();
        return;
      }
      const correctionButton = event.target.closest("[data-billing-overview-period-correction]");
      if (correctionButton) openPeriodDialog(correctionButton);
    });
    document.addEventListener("change", function (event) {
      const select = event.target.closest("[data-billing-overview-page-size]");
      if (!select) return;
      const requested = Number(select.value);
      pageSize = PAGE_SIZES.includes(requested) ? requested : 10;
      render();
    });
  }

  function describe() {
    return Object.freeze({
      name:"NKProBillingOverview", version:"1.0.0", workPackage:"AP21B",
      responsibility:"Dynamische Abrechnungsübersicht auf Basis bestehender Abrechnungs-, Archiv- und Qualitätsdaten",
      mutatesState:false, filters:FILTERS.map(function (entry) { return entry.id; }), workflowSteps:STEP_DEFINITIONS.length
    });
  }

  bindListeners();
  global.NKProBillingOverview = Object.freeze({ render, describe, buildAssessment });
})(window);
