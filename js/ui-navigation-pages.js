"use strict";

// AP12: Perioden-, Navigations-, Abrechnungslisten- und Dialogsteuerung.
function download(...args) { return NK_PRO_MODULES.exportService.download(...args); }

function ensureYearData() {
  if (!state.meta) state.meta = {};
  if (!state.meta.abrechnungsjahr) {
    const briefYear = state.briefSettings && state.briefSettings.abrechnungsjahr ? state.briefSettings.abrechnungsjahr : "";
    state.meta.abrechnungsjahr = briefYear || "2024";
  }
  if (!state.meta.abrechnungsbeginn) state.meta.abrechnungsbeginn = String(state.meta.abrechnungsjahr) + "-01-01";
  if (!state.meta.abrechnungsende) state.meta.abrechnungsende = String(state.meta.abrechnungsjahr) + "-12-31";
  if (!Array.isArray(state.jahresArchiv)) state.jahresArchiv = [];
  if (state.briefSettings) state.briefSettings.abrechnungsjahr = state.meta.abrechnungsjahr;
}

function currentAbrechnungsjahr() {
  return state && state.meta && state.meta.abrechnungsjahr
    ? state.meta.abrechnungsjahr
    : (state && state.briefSettings && state.briefSettings.abrechnungsjahr ? state.briefSettings.abrechnungsjahr : "2024");
}

function periodStart() {
  return state && state.meta && state.meta.abrechnungsbeginn
    ? state.meta.abrechnungsbeginn
    : (currentAbrechnungsjahr() + "-01-01");
}

function periodEnd() {
  return state && state.meta && state.meta.abrechnungsende
    ? state.meta.abrechnungsende
    : (currentAbrechnungsjahr() + "-12-31");
}

function periodLabelShort() {
  return dateDe(periodStart()) + " – " + dateDe(periodEnd());
}

function periodYearFromDate(value) {
  const text = String(value || "");
  const m = text.match(/^(\d{4})-/);
  return m ? m[1] : "";
}







function periodDaysExact() {
  const start = new Date(periodStart() + "T00:00:00");
  const end = new Date(periodEnd() + "T00:00:00");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 365;
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function renderPeriodInfo() {
  const archive = isArchiveViewer();
  if (document.body) document.body.classList.toggle("archive-view", archive);
  const label = archive ? "Archivierte Nebenkostenabrechnung" : "Aktuelle Abrechnungsperiode";
  const detail = archive && state.meta && state.meta.archivedAt ? "archiviert am " + dateDe(state.meta.archivedAt) : "lokaler Arbeitsstand";
  const startAction = !archive && currentAppMode() === "billing" ? '<button type="button" data-ui-action="navigation.returnStart">Zur Startseite</button>' : '';
  const archiveAction = archive ? '<button class="primary archive-close-top" type="button" data-ui-action="archive.closeViewer">Archivansicht schließen</button>' : '';
  const workflow = "";
  const html = '<div class="period-banner"><div class="period-main"><span class="period-kicker">' + escapeHtml(label) + '</span><span class="period-title">' + escapeHtml(periodLabelShort()) + '</span><span class="small">' + escapeHtml(detail) + '</span></div><div class="period-actions"><span class="period-badge">Jahr ' + escapeHtml(currentAbrechnungsjahr()) + '</span>' + (archive ? '<span class="readonly-badge">Schreibgeschützt</span>' : '') + startAction + archiveAction + '</div></div>' + workflow;
  document.querySelectorAll(".period-info").forEach(el => { el.innerHTML = html; });
}

function archiveYearNumbers() {
  const archive = state && Array.isArray(state.jahresArchiv) ? state.jahresArchiv : [];
  return archive.map(a => NK_PRO_MODULES.archiveActions.yearNumber(a.year)).filter(n => Number.isFinite(n) && n > 0);
}

function latestKnownYear() {
  const years = archiveYearNumbers();
  years.push(NK_PRO_MODULES.archiveActions.yearNumber(currentAbrechnungsjahr()));
  return Math.max(...years);
}

function isViewingOlderArchiveYear() {
  return NK_PRO_MODULES.archiveActions.yearNumber(currentAbrechnungsjahr()) < latestKnownYear();
}

function isArchiveViewer() {
  return !!(state.meta && state.meta.archiveViewer);
}

function isLegacyArchiveView() {
  return !!(state.meta && state.meta.legacyArchivHinweis);
}

function startModeText() {
  if (isArchiveViewer()) return "Archivierte Abrechnung";
  if (isViewingOlderArchiveYear()) return "Archivierte Abrechnung";
  return "Aktuelles Arbeitsjahr";
}

function archiveReturnUrl() {
  return state && state.meta && state.meta.archiveReturnUrl ? String(state.meta.archiveReturnUrl) : "";
}

function closeArchiveViewer() {
  if (archiveReturnState) {
    replaceApplicationState(archiveReturnState);
    archiveReturnState = null;
    pendingStorageWarning = "";
    renderErrors = [];
    renderAll();
    billingContextOpen = false;
    switchToTab("archiv");
    setActionMessage("Archivansicht geschlossen. Arbeitsstand wiederhergestellt.");
    renderActionFeedback();
    return;
  }
  if (!isArchiveViewer()) {
    switchToTab("landing");
    return;
  }
  const returnUrl = archiveReturnUrl();
  if (returnUrl && returnUrl !== window.location.href) {
    window.location.href = returnUrl;
    return;
  }
  if (window.opener && !window.opener.closed) {
    try {
      window.close();
      return;
    } catch(e) {}
  }
  if (window.history && window.history.length > 1) {
    try {
      window.history.back();
      return;
    } catch(e) {}
  }
  try {
    window.close();
  } catch(e) {}
}
function currentAppMode() {
  return isArchiveViewer() ? "billing" : appUiMode;
}

function tabVisibleInMode(tabId, mode = currentAppMode()) {
  const list = mode === "billing" ? BILLING_NAV_TABS : START_NAV_TABS;
  return list.includes(tabId);
}

function setAppMode(mode) {
  appUiMode = isArchiveViewer() ? "billing" : (mode === "billing" ? "billing" : "start");
}

function enterBillingMode(tabId = "mieter") {
  setAppMode("billing");
  billingContextOpen = isArchiveViewer() || NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling();
  renderPeriodInfo();
  switchToTab(tabId);
}

function returnToStartPage() {
  if (isArchiveViewer()) return closeArchiveViewer();
  billingContextOpen = false;
  setAppMode("start");
  renderPeriodInfo();
  switchToTab("landing");
}

function initializeNavigationMode() {
  if (navigationInitialized) return;
  navigationInitialized = true;
  if (isArchiveViewer()) enterBillingMode("mieter");
  else switchToTab("landing");
}

function switchToTab(tabId) {
  setTimeout(() => { const target=document.getElementById(tabId); closeAllTabAccordions(target); }, 0);
  const previousTab = document.querySelector('.tab.active');
  if (previousTab) closeAllTabAccordions(previousTab);
  const previousMode = currentAppMode();
  if (!isArchiveViewer()) {
    if (START_NAV_TABS.includes(tabId)) appUiMode = "start";
    if (BILLING_NAV_TABS.includes(tabId)) appUiMode = "billing";
  }
  const mode = currentAppMode();
  if (!tabVisibleInMode(tabId, mode)) tabId = mode === "billing" ? "mieter" : "landing";
  if (["landing", "start", "archiv"].includes(tabId)) billingContextOpen = false;
  else if (BILLING_NAV_TABS.includes(tabId) && (isArchiveViewer() || NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling())) billingContextOpen = true;
  const btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  const section = document.getElementById(tabId);
  if (!section) return;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll("section.tab").forEach(s => s.classList.remove("active"));
  if (btn) btn.classList.add("active");
  section.classList.add("active");
  NK_PRO_MODULES.navigation.ensureNavigationPath(tabId);
  updateTopNavigationVisibility();
  if (previousMode !== currentAppMode()) renderPeriodInfo();
  if (typeof renderCurrentView === "function" && !renderInProgress) {
    renderCurrentView({ reason:"tab-switch" });
    renderStatusAndFeedbackSafely();
  }
  if (typeof updateAllPageHeaders === "function") updateAllPageHeaders();
  if (typeof renderOverviewForTab === "function") renderOverviewForTab(tabId);
  NK_PRO_MODULES.navigation.refreshWorkspaceChrome();
  document.body.classList.remove("sidebar-open");
}

function updateTopNavigationVisibility() {
  const tabs = document.querySelector(".workflow-nav");
  if (!tabs) return;
  tabs.style.display = "";
  const archive = isArchiveViewer();
  tabs.classList.toggle("archive-nav", archive);
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.hidden = false;
    btn.style.display = "";
  });
  NK_PRO_MODULES.navigation.updateWorkflowNavigationContext();
  const active = document.querySelector("section.tab.active");
  if (active) NK_PRO_MODULES.navigation.ensureNavigationPath(active.id, {persist:false});
}

function openCurrentBilling() {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Bearbeiten erfolgt im ursprünglichen Arbeitsfenster.");
    return;
  }
  if (!NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling()) {
    alert("Es ist noch keine aktuelle Abrechnung angelegt. Bitte auf der Startseite über „+ Neue Abrechnung“ starten.");
    return;
  }
  billingContextOpen = true;
  enterBillingMode("mieter");
}







function archiveStatusBadgeHtml(item) {
  return '<span class="status ' + NK_PRO_MODULES.archiveActions.recordStatusClass(item) + '">' + escapeHtml(NK_PRO_MODULES.archiveActions.recordStatus(item)) + '</span>';
}




















function showArchiveValidation(index) {
  ensureYearData();
  const item = state.jahresArchiv[index];
  if (!item) {
    alert("Dieser Archivdatensatz wurde nicht gefunden.");
    return;
  }
  const validation = NK_PRO_MODULES.archiveActions.validateItem(item);
  const label = NK_PRO_MODULES.archiveActions.itemLabel(item, index);
  const details = NK_PRO_MODULES.archiveActions.validationMessage(validation) || "- Keine Strukturprobleme gefunden.";
  alert("Archivprüfung: " + label + "\n\n" + details);
}

function archiveActionButtonsHtml(index, options) {
  options = options || {};
  const item = state.jahresArchiv[index];
  const validation = options.validate === false ? {errors:[], warnings:[]} : NK_PRO_MODULES.archiveActions.validateItem(item);
  const buttons = [];
  if (options.open) {
    if (validation.errors.length) buttons.push('<button class="warn compact-action"' + uiActionAttributes("archive.showValidation", [index]) + '>Fehler anzeigen</button>');
    else {
      const cls = options.primaryOpen ? ' class="primary compact-action"' : ' class="secondary compact-action"';
      buttons.push('<button' + cls + uiActionAttributes("archive.openYear", [index]) + '>' + escapeHtml(options.openLabel || "Ansehen") + '</button>');
      if (validation.warnings.length) buttons.push('<button class="warn compact-action"' + uiActionAttributes("archive.showValidation", [index]) + '>Prüfen</button>');
    }
  } else if (validation.errors.length || validation.warnings.length) {
    buttons.push('<button class="warn compact-action"' + uiActionAttributes("archive.showValidation", [index]) + '>Prüfen</button>');
  }
  if (options.download) buttons.push('<button class="secondary compact-action"' + uiActionAttributes("archive.downloadYear", [index]) + '>JSON herunterladen</button>');
  if (options.reopenForRework) buttons.push('<button class="warn compact-action"' + uiActionAttributes("archive.reopenForRework", [index]) + '>Wiederbearbeiten</button>');
  if (options.deleteButton) buttons.push('<button class="danger compact-action"' + uiActionAttributes("billing.openDeleteModal", [index]) + '>Löschen</button>');
  return buttons.join(" ");
}










function archiveStatusBadgeLiteHtml(item) {
  const status = NK_PRO_MODULES.archiveActions.recordStatusLite(item);
  return '<span class="status ' + status.className + '">' + escapeHtml(status.label) + '</span>';
}

function currentBillingSaldoStartText() {
  return '<span class="small">in der Abrechnung</span>';
}

function currentBillingStatusHtml() {
  if (NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized()) return '<span class="status ok">Finalisiert</span>';
  return '<span class="status warn">In Bearbeitung</span>';
}











function latestVisibleRecordYear() {
  const years = archiveYearNumbers();
  if (NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling()) years.push(NK_PRO_MODULES.archiveActions.yearNumber(currentAbrechnungsjahr()));
  const valid = years.filter(n => Number.isFinite(n) && n > 0);
  return valid.length ? Math.max(...valid) : (new Date()).getFullYear() - 1;
}



function currentObjectLabel(data = state) {
  const tenants = data && Array.isArray(data.mieter) ? data.mieter : [];
  const counts = new Map();
  tenants.forEach(tenant => {
    if (!tenant || !tenant.strasse) return;
    const label = [String(tenant.strasse || "").trim(), [String(tenant.plz || "").trim(), String(tenant.ort || "").trim()].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    if (label) counts.set(label, (counts.get(label) || 0) + 1);
  });
  const sorted = Array.from(counts.entries()).sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], "de"));
  return sorted.length ? sorted[0][0] : "Objekt";
}

function isBillingContextOpen() {
  return isArchiveViewer() || (billingContextOpen && NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling());
}

function setBillingContextOpen(open) {
  billingContextOpen = !!open && (isArchiveViewer() || NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling());
  NK_PRO_MODULES.navigation.updateWorkflowNavigationContext();
}

function currentBillingActionsHtml() {
  if (NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized()) {
    return '<button class="secondary compact-action" data-ui-action="billing.openCurrent">Ansehen</button> ' +
      '<button class="warn compact-action" data-ui-action="billing.unlock">Wiederbearbeitung öffnen</button> ' +
      '<button class="secondary compact-action" data-ui-action="archive.currentYear">Archiv aktualisieren</button>';
  }
  return '<button class="primary compact-action" data-ui-action="billing.openCurrent">Bearbeiten</button> ' +
    '<button class="secondary compact-action" data-ui-action="billing.finalize">Finalisieren</button> ' +
    '<button class="secondary compact-action" data-ui-action="archive.currentYear">Archivieren</button>';
}

function currentBillingRecordRowHtml() {
  const showCurrent = NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling();
  if (!showCurrent) return "";
  const finalized = NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized();
  const currentSource = finalized ? "Aktueller Arbeitsstand · geschützt" : "Aktueller Arbeitsstand";
  return '<tr class="current-record-row">' +
    '<td>' + escapeHtml(currentAbrechnungsjahr()) + '</td>' +
    '<td>' + escapeHtml(periodLabelShort()) + '</td>' +
    '<td>' + currentBillingStatusHtml() + '</td>' +
    '<td>' + escapeHtml(currentSource) + '</td>' +
    '<td>' + currentBillingSaldoStartText() + '</td>' +
    '<td class="actions-cell">' + currentBillingActionsHtml() + '</td>' +
  '</tr>';
}

function archiveRecordRowsHtml() {
  return Array.isArray(state.jahresArchiv) && state.jahresArchiv.length ? state.jahresArchiv.map((a,i) => {
    const saldo = NK_PRO_MODULES.archiveActions.recordSaldo(a);
    const period = NK_PRO_MODULES.archiveActions.periodLabel(a);
    return '<tr class="archive-record-row">' +
      '<td>' + escapeHtml(a && a.year !== undefined ? a.year : "") + '</td>' +
      '<td>' + escapeHtml(period) + '</td>' +
      '<td>' + archiveStatusBadgeLiteHtml(a) + '</td>' +
      '<td>' + escapeHtml(archiveDataSource(a)) + '</td>' +
      '<td class="money">' + (saldo >= 0 ? "Nachzahlung " : "Guthaben ") + fmtMoney(Math.abs(saldo)) + '</td>' +
      '<td class="actions-cell">' + archiveActionButtonsHtml(i, {open:true, openLabel:"Ansehen", reopenForRework:true, deleteButton:true, validate:false}) + '</td>' +
    '</tr>';
  }).join("") : "";
}

function billingRecordsTableShell(rows, emptyText) {
  const emptyRow = rows ? "" : '<tr><td colspan="6"><span class="small">' + escapeHtml(emptyText) + '</span></td></tr>';
  return '<thead><tr><th>Jahr</th><th>Zeitraum</th><th>Status</th><th>Datenquelle</th><th class="money">Saldo</th><th>Aktion</th></tr></thead><tbody>' + rows + emptyRow + '</tbody>';
}

function buildCurrentBillingTableHtml() {
  ensureYearData();
  return billingRecordsTableShell(currentBillingRecordRowHtml(), 'Noch keine aktuelle Abrechnung angelegt. Bitte über „+ Neue Abrechnung“ starten.');
}

function buildArchiveRecordsTableHtml() {
  ensureYearData();
  return billingRecordsTableShell(archiveRecordRowsHtml(), 'Noch keine archivierte Abrechnung vorhanden.');
}

function buildBillingRecordsTableHtml() {
  ensureYearData();
  return billingRecordsTableShell(currentBillingRecordRowHtml() + archiveRecordRowsHtml(), 'Noch keine Abrechnung angelegt. Bitte über „+ Neue Abrechnung“ starten.');
}



function openCreateBillingModal() {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Neue Abrechnungen legst du im ursprünglichen Arbeitsfenster an.");
    return;
  }
  ensureYearData();
  const nextYear = String(latestVisibleRecordYear() + 1);
  const yearEl = document.getElementById("newBillingYear");
  const startEl = document.getElementById("newBillingStart");
  const endEl = document.getElementById("newBillingEnd");
  const modal = document.getElementById("billingCreateModal");
  if (yearEl) yearEl.value = nextYear;
  if (startEl) startEl.value = nextYear + "-01-01";
  if (endEl) endEl.value = nextYear + "-12-31";
  if (modal) modal.classList.add("show");
}

function closeCreateBillingModal() {
  const modal = document.getElementById("billingCreateModal");
  if (modal) modal.classList.remove("show");
}

let deleteBillingTargetIndex = null;
let deleteBillingCode = "";

function randomDeleteCode() {
  return String(Math.floor(100 + Math.random() * 900));
}

function openDeleteBillingModal(index) {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Löschen ist nur auf der Startseite des ursprünglichen Arbeitsfensters möglich.");
    return;
  }
  ensureYearData();
  const item = state.jahresArchiv[index];
  if (!item) return;
  deleteBillingTargetIndex = index;
  deleteBillingCode = randomDeleteCode();
  const meta = NK_PRO_MODULES.archiveActions.meta(item);
  const title = String(item.year || meta.abrechnungsjahr || "");
  const period = NK_PRO_MODULES.archiveActions.periodLabel(item);
  const textEl = document.getElementById("deleteBillingText");
  const codeEl = document.getElementById("deleteBillingCodeDisplay");
  const inputEl = document.getElementById("deleteBillingCodeInput");
  const modal = document.getElementById("billingDeleteModal");
  if (textEl) textEl.innerHTML = "Diese archivierte Nebenkostenabrechnung wird dauerhaft aus diesem lokalen Datensatz gelöscht:<br><strong>" + escapeHtml(title) + "</strong> · " + escapeHtml(period) + "<br><span class=\"small\">Empfehlung: Vorher das Jahresarchiv als JSON herunterladen.</span>";
  if (codeEl) codeEl.textContent = deleteBillingCode;
  if (inputEl) {
    inputEl.value = "";
    setTimeout(() => inputEl.focus(), 0);
  }
  if (modal) modal.classList.add("show");
}

function closeDeleteBillingModal() {
  const modal = document.getElementById("billingDeleteModal");
  if (modal) modal.classList.remove("show");
  deleteBillingTargetIndex = null;
  deleteBillingCode = "";
}

function confirmDeleteBilling() {
  const inputEl = document.getElementById("deleteBillingCodeInput");
  const entered = String((inputEl && inputEl.value) || "").trim();
  if (!deleteBillingCode || entered !== deleteBillingCode) {
    alert("Der eingegebene Code ist nicht korrekt. Die Abrechnung wurde nicht gelöscht.");
    if (inputEl) inputEl.focus();
    return;
  }
  const index = deleteBillingTargetIndex;
  if (index === null || index < 0 || index >= state.jahresArchiv.length) {
    closeDeleteBillingModal();
    return;
  }
  if (!confirmRiskyDataAction("Archivdatensatz löschen", "Diese Abrechnung wird nach korrekter Code-Eingabe jetzt endgültig aus dem lokalen Jahresarchiv entfernt.")) return;
  const execution = NK_PRO_MODULES.applicationActions.execute("archive", "deleteAt", [index, { confirmed:true }]);
  const result = execution.value;
  closeDeleteBillingModal();
  if (result && result.message) alert(result.message);
  if (result && result.changed) switchToTab(result.targetTab || "archiv");
}

function createNewBillingFromModal() {
  const yearEl = document.getElementById("newBillingYear");
  const startEl = document.getElementById("newBillingStart");
  const endEl = document.getElementById("newBillingEnd");
  const args = [String((yearEl && yearEl.value) || "").trim(), String((startEl && startEl.value) || "").trim(), String((endEl && endEl.value) || "").trim()];
  let execution = NK_PRO_MODULES.applicationActions.execute("yearTransition", "createBilling", args);
  let result = execution.value;
  if (result && result.requiresConfirmation) {
    if (!confirmRiskyDataAction("Neue Abrechnung anlegen", result.confirmationMessage || "Neue Abrechnung anlegen?")) return execution;
    execution = NK_PRO_MODULES.applicationActions.execute("yearTransition", "createBilling", args.concat([{ confirmed:true }]));
    result = execution.value;
  }
  if (result && result.message) alert(result.message);
  if (result && result.changed) {
    closeCreateBillingModal();
    appUiMode = "start";
    billingContextOpen = false;
    switchToTab(result.targetTab || "start");
  }
  return execution;
}

function openLatestKnownYear() {
  const latest = latestKnownYear();
  if (NK_PRO_MODULES.archiveActions.yearNumber(currentAbrechnungsjahr()) === latest) {
    alert("Du bist bereits im aktuellsten bekannten Abrechnungsjahr.");
    return;
  }
  const idx = state.jahresArchiv.findIndex(a => NK_PRO_MODULES.archiveActions.yearNumber(a.year) === latest);
  if (idx < 0) {
    alert("Das aktuellste bekannte Jahr ist bereits geöffnet oder wurde noch nicht archiviert.");
    return;
  }
  loadArchiveYear(idx);
}



function legacyArchiveEntries() {
  return Array.isArray(state.legacyEinzelabrechnungen) ? state.legacyEinzelabrechnungen : [];
}

function renderLegacyArchiveDetails() {
  const old = document.getElementById("legacyArchiveDetailsBox");
  const entries = legacyArchiveEntries();
  if (!isArchiveViewer() || !entries.length) {
    if (old) old.remove();
    return;
  }
  const table = entries.map(e => {
    const saldo = num(e.saldo);
    return '<tr>' +
      '<td>' + escapeHtml(e.wohnung || '') + '</td>' +
      '<td>' + escapeHtml(e.mieter || '') + '</td>' +
      '<td>' + escapeHtml((e.heizPeriode || '') + (e.wasserPeriode && e.wasserPeriode !== e.heizPeriode ? ' / Wasser ' + e.wasserPeriode : '') + (e.abfallPeriode && e.abfallPeriode !== e.wasserPeriode ? ' / Abfall ' + e.abfallPeriode : '')) + '</td>' +
      '<td>' + fmtMoney(e.kostenanteil) + '</td>' +
      '<td>' + fmtMoney(e.vorauszahlung) + '</td>' +
      '<td>' + (saldo >= 0 ? 'Nachzahlung ' : 'Guthaben ') + fmtMoney(Math.abs(saldo)) + '</td>' +
      '<td><span class="status ok">' + escapeHtml(entryBriefValidationStatus(e)) + '</span></td>' +
    '</tr>';
  }).join('');
  const html = '<div class="start-box" id="legacyArchiveDetailsBox">' +
    '<h3>Einzelabrechnungen / Briefdaten</h3>' +
    '<p class="small">Dieser Archivsatz ist als normale Abrechnung gespeichert. Die Tabelle zeigt die importierten Mieter-/Wohnungswerte, die zugleich die Grundlage für die originalnahe Briefansicht im Tab „Abrechnungsbriefe“ bilden.</p>' +
    '<div class="table-wrap dashboard-table"><table>' +
      '<thead><tr><th>Wohnung</th><th>Mieter</th><th>Teilperioden</th><th>Kostenanteil</th><th>Vorauszahlung</th><th>Saldo</th><th>Prüfung</th></tr></thead><tbody>' + table + '</tbody>' +
    '</table></div></div>';
  const start = document.getElementById('start');
  const anchor = document.getElementById('startArchiveTable');
  if (!start || !anchor) return;
  if (old) old.outerHTML = html;
  else anchor.closest('.start-box').insertAdjacentHTML('afterend', html);
}


function workflowDashboardReport() {
  if (!NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling() || isArchiveViewer()) return null;
  const report = NK_PRO_MODULES.qualityAssurance.inspect({ scope:"currentBilling" });
  const readiness = NK_PRO_MODULES.qualityAssurance.finalBillingReadiness(report);
  const issues = Array.isArray(report && report.issues) ? report.issues.filter(i => i && i.severity !== "OK") : [];
  const groups = [
    { key:"master", label:"Stammdaten & Mieter", areas:["Stammdaten","Mieter","Eigentümer/Privat"] },
    { key:"costs", label:"Kosten & Umlage", areas:["Kostenarten","Kostenart","Umlage","Abrechnung","Summenabgleich"] },
    { key:"meters", label:"Zählerstände", areas:["Zählerstände"] },
    { key:"prepay", label:"Vorauszahlungen", areas:["Vorauszahlungen","Vorauszahlung","Vorauszahlungsanpassung"] },
    { key:"letters", label:"Briefe & Versand", areas:["Briefe","Brief-Preflight","Empfänger","Zahlungsziel","Saldo"] }
  ].map(group => {
    const rows = issues.filter(issue => group.areas.includes(issue.area));
    const errors = rows.filter(issue => issue.severity === "Fehler").length;
    const checks = rows.filter(issue => issue.severity === "Prüfen").length;
    const hints = rows.filter(issue => issue.severity === "Hinweis").length;
    const level = errors ? "err" : (checks ? "warn" : "ok");
    const status = errors ? errors + " Fehler" : (checks ? checks + " Prüfpunkte" : (hints ? hints + " Hinweise" : "Keine offenen Punkte"));
    return { ...group, rows, errors, checks, hints, level, status };
  });
  const ungrouped = issues.filter(issue => !groups.some(group => group.areas.includes(issue.area)));
  return { report, readiness, groups, ungrouped };
}

function renderWorkflowDashboard() {
  const el = document.getElementById("workflowDashboardBox");
  if (!el) return;
  const data = workflowDashboardReport();
  if (!data) { el.innerHTML = ""; return; }
  const readiness = data.readiness;
  const cls = readiness.level === "err" ? "err" : (readiness.level === "warn" ? "warn" : "ok");
  const openCount = readiness.errors.length + readiness.warnings.length + readiness.hints.length;
  const cards = data.groups.map(group => {
    const badgeClass = group.level === "err" ? "err" : (group.level === "warn" ? "warn" : "ok");
    const detail = group.hints && !group.errors && !group.checks ? group.hints + " Hinweise zusätzlich" : (group.hints ? group.hints + " Hinweise" : "");
    return '<div class="workflow-status-card"><strong>' + escapeHtml(group.label) + '</strong><span class="status ' + badgeClass + '">' + escapeHtml(group.status) + '</span>' + (detail ? '<div class="small">' + escapeHtml(detail) + '</div>' : '') + '</div>';
  }).join("");
  el.innerHTML = '<div class="workflow-dashboard ' + cls + '"><div class="workflow-dashboard-head"><div><h3>Arbeitsstand dieser Abrechnung</h3><div class="small">Vorhandene Qualitätsprüfungen kompakt zusammengefasst · keine zusätzliche Berechnungslogik.</div></div><div><span class="status ' + cls + '">' + escapeHtml(readiness.label) + '</span><div class="small" style="margin-top:4px;text-align:right">' + openCount + ' offene Hinweise/Prüfpunkte</div></div></div><div class="workflow-status-grid">' + cards + '</div><div class="toolbar" style="margin-bottom:0"><button type="button" class="primary" data-ui-action="navigation.switchTab" data-ui-args="[&quot;qualitaet&quot;]">Qualitätsprüfung öffnen</button></div></div>';
}

function renderStart() {
  const actionsEl = document.getElementById("startArchiveActions");
  const utilityActionsEl = document.getElementById("startArchiveUtilityActions");
  const tableEl = document.getElementById("startArchiveTable");
  if (!actionsEl || !utilityActionsEl || !tableEl) return;

  tableEl.className = "records-table";
  actionsEl.innerHTML = '<button class="primary" type="button" data-ui-action="billing.openCreateModal">+ Neue Abrechnung</button>';
  utilityActionsEl.innerHTML = "<button type='button' data-ui-action='system.runSelfTest'>App-Selbsttest</button><button type='button' data-ui-action='navigation.switchTab' data-ui-args='[&quot;archiv&quot;]'>Archiv öffnen</button>";
  tableEl.innerHTML = buildCurrentBillingTableHtml();
  renderFinalizationStatus();
}

function renderArchive() {
  const actionsEl = document.getElementById("archivePrimaryActions");
  const utilityActionsEl = document.getElementById("archiveUtilityActions");
  const tableEl = document.getElementById("archiveRecordsTable");
  if (!actionsEl || !utilityActionsEl || !tableEl) return;
  tableEl.className = "records-table";
  actionsEl.innerHTML = '<button class="primary" type="button" data-ui-action="archive.downloadFull">Archiv als JSON herunterladen</button>';
  utilityActionsEl.innerHTML = "<button type='button' data-ui-action='system.runSelfTest'>App-Selbsttest</button><button type='button' data-ui-action='navigation.switchTab' data-ui-args='[&quot;start&quot;]'>Abrechnungsübersicht öffnen</button>";
  tableEl.innerHTML = buildArchiveRecordsTableHtml();
}

function renderStartTenantManagement() {
  const tableEl = document.getElementById("startTenantTable");
  const archiveEl = document.getElementById("startTenantArchiveTable");
  if (!tableEl || !archiveEl) return;
  NK_PRO_MODULES.masterDataActions.masterData();
  const genderOptions = ["Frau/Herr","Frau","Herr","Firma/Divers"];
  const salutationOptions = ["Automatisch","Sehr geehrte Frau [Nachname],","Sehr geehrter Herr [Nachname],","Sehr geehrte(r) Mieter/in,","Sehr geehrte Damen und Herren,","Guten Tag,"];
  const roleOptions = ["Mieter","Eigentümer/Privat"];
  const visibleRows = NK_PRO_MODULES.masterDataActions.masterVisibleTenantRows();
  const rows = visibleRows.length ? visibleRows.map(m =>
    '<tr><td>' + tenantIdCellHtml(m) + '</td>' +
    '<td class="editable">' + masterUnitSelectHtml(m.wohnung, "setMasterNested('mieter'," + m.originalIndex + ",'wohnung',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.name, "setMasterNested('mieter'," + m.originalIndex + ",'name',this.value)") + '</td>' +
    '<td class="editable">' + dateInputHtml(m.einzug, "setMasterNested('mieter'," + m.originalIndex + ",'einzug',this.value)") + '</td>' +
    '<td class="editable">' + dateInputHtml(m.auszug, "setMasterNested('mieter'," + m.originalIndex + ",'auszug',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(m.abrechnungRolle || "Mieter", roleOptions, "setMasterNested('mieter'," + m.originalIndex + ",'abrechnungRolle',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(m.geschlecht, genderOptions, "setMasterNested('mieter'," + m.originalIndex + ",'geschlecht',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(m.standardanrede, salutationOptions, "setMasterNested('mieter'," + m.originalIndex + ",'standardanrede',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.strasse, "setMasterNested('mieter'," + m.originalIndex + ",'strasse',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.plz, "setMasterNested('mieter'," + m.originalIndex + ",'plz',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.ort, "setMasterNested('mieter'," + m.originalIndex + ",'ort',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.telefon, "setMasterNested('mieter'," + m.originalIndex + ",'telefon',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.email, "setMasterNested('mieter'," + m.originalIndex + ",'email',this.value)") + '</td>' +
    '<td><span class="status ' + (tenantOpenStatus(m) === "Aktiv" ? "ok" : "warn") + '">' + escapeHtml(tenantOpenStatus(m)) + '</span></td>' +
    '<td><button class="warn"' + uiActionAttributes("object.archiveMasterTenancy", [m.originalIndex]) + '>Archivieren</button></td></tr>'
  ).join("") : '<tr><td colspan="15">Keine aktuellen Mietverhältnisse vorhanden. Über „+ Neues Mietverhältnis“ kannst du einen Datensatz anlegen.</td></tr>';
  tableEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mietername</th><th>Einzug</th><th>Auszug</th><th>Rolle</th><th>Geschlecht</th><th>Standardanrede Brief</th><th>Straße</th><th>PLZ</th><th>Ort</th><th>Telefon</th><th>E-Mail</th><th>Status</th><th>Aktion</th></tr></thead><tbody>' + rows + '</tbody>';
  const archivedRows = NK_PRO_MODULES.masterDataActions.masterArchivedTenantRows();
  const arows = archivedRows.length ? archivedRows.map(m =>
    '<tr><td>' + tenantIdCellHtml(m) + '</td><td>' + unitRefCellHtml(m.wohnung) + '</td><td>' + escapeHtml(m.name || "") + '</td><td>' + escapeHtml(m.einzug || "") + '</td><td>' + escapeHtml(m.auszug || "") + '</td><td>' + escapeHtml(m.geschlecht || "") + '</td><td>' + escapeHtml(m.strasse || "") + '</td><td>' + escapeHtml((m.plz || "") + " " + (m.ort || "")) + '</td><td>' + escapeHtml(m.archivedAt || "") + '</td><td><button' + uiActionAttributes("object.restoreMasterTenancy", [m.originalIndex]) + '>Reaktivieren</button></td></tr>'
  ).join("") : '<tr><td colspan="10">Noch keine archivierten Mietverhältnisse.</td></tr>';
  archiveEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mietername</th><th>Einzug</th><th>Auszug</th><th>Geschlecht</th><th>Straße</th><th>PLZ/Ort</th><th>Archiviert am</th><th>Aktion</th></tr></thead><tbody>' + arows + '</tbody>';
}

function renderStartUnitManagement() {
  const tableEl = document.getElementById("startUnitTable");
  if (!tableEl) return;
  const units = NK_PRO_MODULES.masterDataActions.masterUnits();
  const rows = units.map((w,i) =>
    '<tr><td>' + unitIdCellHtml(w) + '</td>' +
    '<td class="editable">' + inputHtml(w.bezeichnung, "setMasterNested('wohnungen'," + i + ",'bezeichnung',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(w.lage, "setMasterNested('wohnungen'," + i + ",'lage',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(w.wohnflaeche, "setMasterNested('wohnungen'," + i + ",'wohnflaeche',this.value,'number')", "number") + '</td>' +
    '<td class="editable">' + inputHtml(w.zimmer, "setMasterNested('wohnungen'," + i + ",'zimmer',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(w.bemerkung, "setMasterNested('wohnungen'," + i + ",'bemerkung',this.value)") + '</td></tr>'
  ).join("");
  tableEl.innerHTML = '<thead><tr><th>Wohnungs-ID</th><th>Bezeichnung</th><th>Etage / Lage</th><th>Wohnfläche m²</th><th>Zimmer</th><th>Bemerkung</th></tr></thead><tbody>' + rows + '</tbody>';
}


