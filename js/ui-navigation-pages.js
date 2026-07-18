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
  const contextOpen = NK_PRO_MODULES.billingContext.isOpen();
  const mode = NK_PRO_MODULES.billingContext.modeLabel();
  if (document.body) {
    document.body.classList.toggle("archive-view", archive);
    document.body.classList.toggle("billing-readonly-mode", NK_PRO_MODULES.billingContext.isReadOnly());
  }
  const label = contextOpen ? (archive ? "Archivierte Nebenkostenabrechnung" : "Geöffnete Nebenkostenabrechnung") : "Keine Abrechnung geöffnet";
  const detail = contextOpen ? (archive && state.meta && state.meta.archivedAt ? "archiviert am " + dateDe(state.meta.archivedAt) : mode) : "Öffnen Sie eine Abrechnung über die Übersicht.";
  const actions = contextOpen ? '<button class="secondary" type="button" data-ui-action="billing.closeContext">Abrechnung schließen</button>' : '<button type="button" data-ui-action="navigation.switchTab" data-ui-args="[&quot;start&quot;]">Zur Abrechnungsübersicht</button>';
  const html = '<div class="period-banner"><div class="period-main"><span class="period-kicker">' + escapeHtml(label) + '</span><span class="period-title">' + (contextOpen ? escapeHtml(periodLabelShort()) : "–") + '</span><span class="small">' + escapeHtml(detail) + '</span></div><div class="period-actions"><span class="period-badge">' + (contextOpen ? 'Jahr ' + escapeHtml(currentAbrechnungsjahr()) : 'Kein Arbeitskontext') + '</span>' + actions + '</div></div>';
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
  if (!NK_PRO_MODULES.billingContext.isOpen()) {
    showBillingContextRequired();
    return;
  }
  setAppMode("billing");
  billingContextOpen = true;
  renderPeriodInfo();
  switchToTab(tabId);
}

function returnToStartPage() {
  if (NK_PRO_MODULES.billingContext.isOpen()) return closeBillingContext();
  setAppMode("start");
  renderPeriodInfo();
  switchToTab("landing");
}

function initializeNavigationMode() {
  if (navigationInitialized) return;
  navigationInitialized = true;
  if (isArchiveViewer()) {
    NK_PRO_MODULES.billingContext.open({ recordKey:"archive-viewer:" + currentAbrechnungsjahr(), recordType:"archive", label:periodLabelShort() }, NK_PRO_MODULES.billingContext.MODES.VIEW);
    const target = NK_PRO_MODULES.billingContext.lastStep() || "mieter";
    enterBillingMode(target);
  } else {
    NK_PRO_MODULES.billingContext.close();
    billingContextOpen = false;
    appUiMode = "start";
    switchToTab("landing");
  }
}

function showBillingContextRequired() {
  const message = "Öffnen Sie zuerst eine Abrechnung zur Bearbeitung oder Ansicht.";
  setActionMessage(message, "warn");
  appUiMode = "start";
  billingContextOpen = false;
  const active = document.querySelector("section.tab.active");
  if (!active || active.id !== "start") switchToTab("start");
  renderActionFeedback();
}

function resetTransientUiState(options = {}) {
  if (typeof closeCreateBillingModal === "function") closeCreateBillingModal();
  if (typeof closeDeleteBillingModal === "function") closeDeleteBillingModal();
  if (typeof closeCostSelectionDialog === "function") closeCostSelectionDialog();
  if (typeof closeCostPriceEditor === "function") closeCostPriceEditor();
  document.querySelectorAll(".workspace-header-panel").forEach(panel => { panel.hidden = true; });
  document.querySelectorAll("[data-header-panel-target]").forEach(trigger => trigger.setAttribute("aria-expanded", "false"));
  document.body.classList.remove("cost-dialog-open", "sidebar-open");
  if (options.resetPageState && typeof resetCostUiState === "function") resetCostUiState();
}

function switchToTab(tabId) {
  const legacyTarget = String(tabId || "");
  if (legacyTarget === "verbraeuche") {
    if (globalThis.NKProIndividualValues) globalThis.NKProIndividualValues.requestFocus({ source:"automatic" });
    tabId = "manuellewerte";
  }
  if (BILLING_NAV_TABS.includes(tabId) && !NK_PRO_MODULES.billingContext.isOpen()) {
    const message = "Öffnen Sie zuerst eine Abrechnung zur Bearbeitung oder Ansicht.";
    setActionMessage(message, "warn");
    tabId = "start";
  }
  const contextBoundary = ["landing", "start", "archiv"].includes(tabId);
  resetTransientUiState({ resetPageState:contextBoundary });
  setTimeout(() => {
    const target=document.getElementById(tabId);
    closeAllTabAccordions(target);
    if (tabId === "start") { const records=document.getElementById("startRecordsSection"); if (records) records.open=true; }
    if (tabId === "archiv") { const records=document.getElementById("archiveRecordsSection"); if (records) records.open=true; }
  }, 0);
  const previousTab = document.querySelector('.tab.active');
  if (previousTab) closeAllTabAccordions(previousTab);
  const previousMode = currentAppMode();
  if (!isArchiveViewer()) {
    if (START_NAV_TABS.includes(tabId)) appUiMode = "start";
    if (BILLING_NAV_TABS.includes(tabId)) appUiMode = "billing";
  }
  const mode = currentAppMode();
  if (!tabVisibleInMode(tabId, mode)) tabId = mode === "billing" ? "mieter" : "landing";
  billingContextOpen = NK_PRO_MODULES.billingContext.isOpen();
  if (BILLING_NAV_TABS.includes(tabId) && billingContextOpen) NK_PRO_MODULES.billingContext.rememberStep(tabId);
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
  if (typeof applyBillingContextToDom === "function") applyBillingContextToDom();
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

function currentBillingRecordKey(data = state) {
  const meta = data && data.meta ? data.meta : {};
  return "current:" + String(meta.periodId || meta.abrechnungsjahr || "unknown");
}

function archiveBillingRecordKey(item, index) {
  const meta = NK_PRO_MODULES.archiveActions.meta(item || {});
  return "archive:" + String((item && item.periodId) || meta.periodId || (item && item.year) || meta.abrechnungsjahr || index) + ":" + String((item && item.archivedAt) || "");
}

function validBillingTarget(recordKey) {
  const remembered = NK_PRO_MODULES.billingContext.lastStep(recordKey);
  return NK_PRO_MODULES.billingContext.VALID_STEPS.includes(remembered) ? remembered : "mieter";
}

function unlockFinalizedCurrentForEditing() {
  if (!NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized()) return true;
  let result = NK_PRO_MODULES.billingWorkflow.unlock();
  if (result && result.requiresPrompt) {
    const entered = prompt(result.promptMessage || "Finalisierung aufheben?", "");
    if (entered === null) return false;
    result = NK_PRO_MODULES.billingWorkflow.unlock({ confirmationCode:entered });
  }
  if (result && result.message) alert(result.message);
  return !!(result && result.changed);
}

function prepareBillingContextSwitch() {
  if (!NK_PRO_MODULES.billingContext.isOpen()) return true;
  const message=NK_PRO_MODULES.billingContext.hasUnsavedChanges()
    ? "Es gibt ungespeicherte Änderungen. Aktuelle Abrechnung trotzdem schließen und wechseln?"
    : "Die aktuell geöffnete Abrechnung wird geschlossen. Andere Abrechnung öffnen?";
  if (!confirm(message)) return false;
  NK_PRO_MODULES.billingContext.clearDirty();
  return closeBillingContext();
}

function openCurrentBilling(mode = "edit") {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung.");
    return;
  }
  if (!NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling()) {
    alert("Es ist noch keine aktuelle Abrechnung angelegt. Bitte über „+ Neue Abrechnung“ starten.");
    return;
  }
  const requestedMode = mode === "view" ? NK_PRO_MODULES.billingContext.MODES.VIEW : NK_PRO_MODULES.billingContext.MODES.EDIT;
  const key = currentBillingRecordKey();
  const activeContext=NK_PRO_MODULES.billingContext.snapshot();
  if (activeContext.mode !== NK_PRO_MODULES.billingContext.MODES.CLOSED && activeContext.recordKey !== key && !prepareBillingContextSwitch()) return;
  if (activeContext.recordKey === key && activeContext.mode === NK_PRO_MODULES.billingContext.MODES.EDIT && requestedMode === NK_PRO_MODULES.billingContext.MODES.VIEW && NK_PRO_MODULES.billingContext.hasUnsavedChanges()) {
    if (!confirm("Es gibt ungespeicherte Änderungen. Abrechnung trotzdem nur zur Ansicht öffnen?")) return;
    NK_PRO_MODULES.billingContext.clearDirty();
  }
  if (requestedMode === NK_PRO_MODULES.billingContext.MODES.EDIT && !unlockFinalizedCurrentForEditing()) return;
  NK_PRO_MODULES.billingContext.open({ recordKey:key, recordType:"current", label:periodLabelShort() }, requestedMode);
  document.documentElement.dataset.billingExplicitlyOpened="true";
  billingContextOpen = true;
  enterBillingMode(validBillingTarget(key));
}

function openCurrentBillingForView() { return openCurrentBilling("view"); }
function openCurrentBillingForEdit() { return openCurrentBilling("edit"); }

function switchCurrentBillingToEdit() {
  if (!NK_PRO_MODULES.billingContext.isOpen() || isArchiveViewer()) return;
  if (!unlockFinalizedCurrentForEditing()) return;
  NK_PRO_MODULES.billingContext.switchMode(NK_PRO_MODULES.billingContext.MODES.EDIT);
  renderAll({ forceAll:true, reason:"Bearbeitungsmodus" });
  setActionMessage("Abrechnung ist jetzt zur Bearbeitung geöffnet.");
  renderActionFeedback();
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
  if (options.reopenForRework) buttons.push('<button class="warn compact-action"' + uiActionAttributes("archive.reopenForRework", [index]) + '>Zur Korrektur öffnen</button>');
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

function closeBillingContext() {
  if (!NK_PRO_MODULES.billingContext.isOpen()) { switchToTab("start"); return true; }
  const active = document.querySelector("section.tab.active");
  if (active && BILLING_NAV_TABS.includes(active.id)) NK_PRO_MODULES.billingContext.rememberStep(active.id);
  if (NK_PRO_MODULES.billingContext.hasUnsavedChanges() && !confirm("Es gibt ungespeicherte Änderungen. Abrechnung trotzdem schließen?")) return false;
  if (isArchiveViewer() && archiveReturnState) {
    replaceApplicationState(archiveReturnState);
    archiveReturnState = null;
    pendingStorageWarning = "";
    renderErrors = [];
  }
  NK_PRO_MODULES.billingContext.close();
  delete document.documentElement.dataset.billingExplicitlyOpened;
  billingContextOpen = false;
  appUiMode = "start";
  renderAll({ forceAll:true, reason:"Abrechnung schließen" });
  switchToTab("start");
  setActionMessage("Abrechnung geschlossen. Es ist keine Abrechnung geöffnet.");
  renderActionFeedback();
  return true;
}

function isSearchControl(control) {
  if (!control) return false;
  if (String(control.type || "").toLowerCase() === "search") return true;
  const action=control.getAttribute && (control.getAttribute("data-ui-change") || control.getAttribute("data-ui-input") || "");
  return action === "cost.setPageSize" || !!(control.closest && control.closest(".table-tools"));
}

function restoreContextLockedControl(control) {
  if (!control || control.dataset.billingContextLocked !== "true") return;
  if (control.dataset.billingContextHadDisabled === "true") control.disabled = true; else control.disabled = false;
  if (control.dataset.billingContextHadReadonly === "true") control.readOnly = true; else control.readOnly = false;
  delete control.dataset.billingContextLocked;
  delete control.dataset.billingContextHadDisabled;
  delete control.dataset.billingContextHadReadonly;
  control.removeAttribute("aria-readonly");
  control.removeAttribute("aria-disabled");
}

function lockControlForBillingView(control) {
  if (!control || control.dataset.billingContextLocked === "true" || isSearchControl(control)) return;
  control.dataset.billingContextLocked = "true";
  control.dataset.billingContextHadDisabled = control.disabled ? "true" : "false";
  control.dataset.billingContextHadReadonly = control.readOnly ? "true" : "false";
  const tag = control.tagName.toLowerCase();
  if (tag === "textarea" || (tag === "input" && !["checkbox","radio","file","button","submit","range"].includes(String(control.type || "").toLowerCase()))) {
    control.readOnly = true;
    control.setAttribute("aria-readonly", "true");
  } else {
    control.disabled = true;
    control.setAttribute("aria-disabled", "true");
  }
}

function applyBillingContextToDom() {
  const readOnly = NK_PRO_MODULES.billingContext.isReadOnly();
  const open = NK_PRO_MODULES.billingContext.isOpen();
  document.body.classList.toggle("billing-context-open", open);
  document.body.classList.toggle("billing-readonly-mode", readOnly);
  BILLING_NAV_TABS.forEach(tabId => {
    const page = document.querySelector('[data-page-tab="' + tabId + '"]');
    if (!page) return;
    let notice = page.querySelector('.billing-readonly-notice');
    if (readOnly) {
      if (!notice) {
        notice = document.createElement("div");
        notice.className = "billing-readonly-notice";
        notice.setAttribute("role", "status");
        notice.innerHTML = '<span class="billing-readonly-notice__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span><span><strong>Diese Abrechnung ist schreibgeschützt.</strong><small>Änderungen sind erst nach dem Öffnen zur Bearbeitung möglich.</small></span>' + (!isArchiveViewer() ? '<button type="button" class="secondary" data-ui-action="billing.switchToEdit">Zur Bearbeitung öffnen</button>' : '');
        const header = page.querySelector('.page-header');
        if (header) header.insertAdjacentElement("afterend", notice); else page.prepend(notice);
      }
    } else if (notice) notice.remove();
    page.querySelectorAll('input,select,textarea').forEach(control => readOnly ? lockControlForBillingView(control) : restoreContextLockedControl(control));
    page.querySelectorAll('[data-ui-action]').forEach(control => {
      const action = control.getAttribute('data-ui-action') || "";
      if (!NK_PRO_MODULES.billingContext.isWriteAction(action)) return;
      if (!control.dataset.billingContextOriginalHidden) control.dataset.billingContextOriginalHidden = control.hidden ? "true" : "false";
      control.hidden = readOnly;
      control.setAttribute("aria-hidden", readOnly ? "true" : "false");
      if (!readOnly && control.dataset.billingContextOriginalHidden === "false") control.hidden = false;
    });
  });
}

function openArchiveForCorrection(index) {
  if (NK_PRO_MODULES.billingContext.isOpen() && !closeBillingContext()) return;
  let result = NK_PRO_MODULES.archiveActions.reopenForRework(index);
  if (result && result.requiresConfirmation) {
    const message = "Diese archivierte Abrechnung wird zur Korrektur wieder in einen bearbeitbaren Zustand versetzt. Bestehende Daten bleiben erhalten; es wird keine Kopie angelegt.\n\n" + (result.confirmationMessage || "Fortfahren?");
    if (!confirm(message)) return;
    result = NK_PRO_MODULES.archiveActions.reopenForRework(index, { confirmed:true });
  }
  if (result && result.requiresPrompt) {
    const entered = prompt((result.promptMessage || "Bestätigung eingeben:"), "");
    if (entered === null) return;
    result = NK_PRO_MODULES.archiveActions.reopenForRework(index, { confirmed:true, confirmationCode:entered });
  }
  if (result && result.message) alert(result.message);
  if (result && result.changed) {
    const key = currentBillingRecordKey();
    NK_PRO_MODULES.billingContext.open({ recordKey:key, recordType:"current", label:periodLabelShort() }, NK_PRO_MODULES.billingContext.MODES.EDIT);
    document.documentElement.dataset.billingExplicitlyOpened="true";
    billingContextOpen = true;
    renderAll({ forceAll:true, reason:"Archivkorrektur" });
    enterBillingMode(validBillingTarget(key));
  }
}

function currentObjectShortCode(data = state) {
  const meta = data && data.meta ? data.meta : {};
  const standard = data && data.objektStandard ? data.objektStandard : {};
  const explicit = meta.objektKurzcode || meta.objectShortCode || standard.kurzcode || standard.shortCode || (standard.identifikation && (standard.identifikation.kurzcode || standard.identifikation.shortCode));
  if (String(explicit || "").trim()) return String(explicit).trim().toUpperCase();
  const label = currentObjectLabel(data);
  const street = String(label || "Objekt").split(",")[0].trim();
  const number = (street.match(/\d+[a-zA-Z]?/) || [""])[0];
  const letters = street.replace(/[^A-Za-zÄÖÜäöüß]/g, "").slice(0, 3).toUpperCase().replace(/Ä/g,"AE").replace(/Ö/g,"OE").replace(/Ü/g,"UE").replace(/ß/g,"SS");
  return (letters || "OBJ") + number;
}

function isBillingContextOpen() { return NK_PRO_MODULES.billingContext.isOpen(); }

function setBillingContextOpen(open) {
  if (!open) NK_PRO_MODULES.billingContext.close();
  billingContextOpen = NK_PRO_MODULES.billingContext.isOpen();
  NK_PRO_MODULES.navigation.updateWorkflowNavigationContext();
}

function currentBillingActionsHtml() {
  const finalized = NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized();
  return '<button class="primary compact-action" data-ui-action="billing.openCurrentEdit">Bearbeiten</button> ' +
    '<button class="secondary compact-action" data-ui-action="billing.openCurrentView">Ansehen</button> ' +
    (finalized ? '<button class="secondary compact-action" data-ui-action="archive.currentYear">Archiv aktualisieren</button>' : '<button class="secondary compact-action" data-ui-action="billing.finalize">Abschließen</button> <button class="secondary compact-action" data-ui-action="archive.currentYear">Archivieren</button>');
}
function billingDateTimeLabel(value) {
  if (!value) return "Noch nicht gespeichert";
  const date=new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}) : String(value);
}
function currentBillingLifecycleStatus() {
  if (NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized()) return {label:"Abgeschlossen",className:"ok"};
  const meta=state && state.meta ? state.meta : {};
  const hasAmounts=(Array.isArray(state.kostenarten)?state.kostenarten:[]).some(cost=>cost&&cost.inNK==="Ja"&&num(cost.gesamtbetrag)>0) ||
    (Array.isArray(state.mieter)?state.mieter:[]).some(tenant=>tenant&&num(tenant.nkVoraus)>0);
  if (meta.currentBillingCreatedByUser && !hasAmounts) return {label:"Angelegt",className:"neutral"};
  return {label:"In Bearbeitung",className:"warn"};
}
function currentBillingProgressText() {
  const costs=(Array.isArray(state.kostenarten)?state.kostenarten:[]).filter(cost=>cost&&cost.kostenart&&cost.inNK==="Ja");
  const complete=costs.filter(cost=>typeof dashboardCostStatus==="function"&&dashboardCostStatus(cost)==="Vollständig").length;
  const tenants=safeOverviewCall(()=>billableTenantRows(),[]);
  const units=new Set(tenants.map(tenant=>String(tenant.wohnung||"")).filter(Boolean)).size;
  return complete+' von '+costs.length+' Kostenarten vollständig · '+units+' Einheiten berechenbar';
}
function archiveProgressText(item) {
  const summary=item&&item.summary&&typeof item.summary==="object"?item.summary:{};
  const tenantCount=Number(summary.mietverhaeltnisse||0);
  const source=archiveDataSource(item);
  return (tenantCount?tenantCount+' Mietverhältnisse · ':'')+(source||'Archivdatensatz');
}
function recordObjectLabel(data) { return currentObjectLabel(data||state); }
function recordObjectCode(data) { return currentObjectShortCode(data||state); }
function currentBillingRecordRowHtml() {
  if (!NK_PRO_MODULES.archiveActions.hasActiveCurrentBilling()) return "";
  const status=currentBillingLifecycleStatus();
  const lastEdited=(state.meta&& (state.meta.lastSavedAt||state.meta.currentBillingFinalizedAt||state.meta.currentBillingCreatedAt))||"";
  return '<tr class="current-record-row">' +
    '<td data-label="Objekt">'+escapeHtml(recordObjectLabel(state))+'</td>'+
    '<td data-label="Kurzcode"><span class="record-code">'+escapeHtml(recordObjectCode(state))+'</span></td>'+
    '<td data-label="Jahr">'+escapeHtml(currentAbrechnungsjahr())+'</td>'+
    '<td data-label="Zeitraum">'+escapeHtml(periodLabelShort())+'</td>'+
    '<td data-label="Status"><span class="status '+status.className+'">'+escapeHtml(status.label)+'</span></td>'+
    '<td data-label="Bearbeitungsstand">'+escapeHtml(currentBillingProgressText())+'</td>'+
    '<td data-label="Zuletzt bearbeitet">'+escapeHtml(billingDateTimeLabel(lastEdited))+'</td>'+
    '<td data-label="Saldo" class="money">'+currentBillingSaldoStartText()+'</td>'+
    '<td data-label="Aktionen" class="actions-cell">'+currentBillingActionsHtml()+'</td>'+
  '</tr>';
}
function archiveRecordRowsHtml(options={}) {
  if (!Array.isArray(state.jahresArchiv)||!state.jahresArchiv.length) return "";
  return state.jahresArchiv.map((item,index)=>({item,index,year:NK_PRO_MODULES.archiveActions.yearNumber(item&&item.year)}))
    .sort((a,b)=>b.year-a.year||b.index-a.index)
    .map(({item,index})=>{
      const saldo=NK_PRO_MODULES.archiveActions.recordSaldo(item);
      const data=item&&item.data?item.data:{};
      const lastEdited=(item&&item.archivedAt)||(item&&item.meta&&item.meta.archivedAt)||(data.meta&&data.meta.lastSavedAt)||"";
      return '<tr class="archive-record-row">'+
        '<td data-label="Objekt">'+escapeHtml(recordObjectLabel(data))+'</td>'+
        '<td data-label="Kurzcode"><span class="record-code">'+escapeHtml(recordObjectCode(data))+'</span></td>'+
        '<td data-label="Jahr">'+escapeHtml(item&&item.year!==undefined?item.year:"")+'</td>'+
        '<td data-label="Zeitraum">'+escapeHtml(NK_PRO_MODULES.archiveActions.periodLabel(item))+'</td>'+
        '<td data-label="Status"><span class="status neutral">Archiviert</span></td>'+
        '<td data-label="Bearbeitungsstand">'+escapeHtml(archiveProgressText(item))+'</td>'+
        '<td data-label="Zuletzt bearbeitet">'+escapeHtml(billingDateTimeLabel(lastEdited))+'</td>'+
        '<td data-label="Saldo" class="money">'+(saldo>=0?'Nachzahlung ':'Guthaben ')+fmtMoney(Math.abs(saldo))+'</td>'+
        '<td data-label="Aktionen" class="actions-cell">'+archiveActionButtonsHtml(index,{open:true,openLabel:"Ansehen",reopenForRework:true,deleteButton:!!options.allowDelete,validate:false})+'</td>'+
      '</tr>';
    }).join("");
}
function billingRecordsTableShell(rows, emptyText) {
  const emptyRow=rows?"":'<tr><td colspan="9"><span class="small">'+escapeHtml(emptyText)+'</span></td></tr>';
  return '<thead><tr><th>Objekt</th><th>Kurzcode</th><th>Jahr</th><th>Zeitraum</th><th>Status</th><th>Bearbeitungsstand</th><th>Zuletzt bearbeitet</th><th class="money">Saldo</th><th>Aktionen</th></tr></thead><tbody>'+rows+emptyRow+'</tbody>';
}
function buildCurrentBillingTableHtml() {
  ensureYearData();
  return billingRecordsTableShell(currentBillingRecordRowHtml(),'Noch keine aktuelle Abrechnung angelegt. Bitte über „+ Neue Abrechnung“ starten.');
}
function buildArchiveRecordsTableHtml() {
  ensureYearData();
  return billingRecordsTableShell(archiveRecordRowsHtml({allowDelete:true}),'Noch keine archivierte Abrechnung vorhanden.');
}
function buildBillingRecordsTableHtml() {
  ensureYearData();
  return billingRecordsTableShell(currentBillingRecordRowHtml()+archiveRecordRowsHtml({allowDelete:false}),'Noch keine Abrechnung angelegt. Bitte über „+ Neue Abrechnung“ starten.');
}


function openCreateBillingModal() {
  if (NK_PRO_MODULES.billingContext.isOpen() && !prepareBillingContextSwitch()) return;
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
    NK_PRO_MODULES.billingContext.close();
    appUiMode = "start";
    billingContextOpen = false;
    switchToTab("start");
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

function renderBillingPeriodSettings() {
  const section = document.getElementById("billingPeriodSection");
  const el = document.getElementById("billingPeriodSettings");
  if (!section || !el) return;
  const open = NK_PRO_MODULES.billingContext.isOpen();
  section.hidden = !open;
  if (!open) { el.innerHTML = ""; return; }
  const editable = NK_PRO_MODULES.billingContext.isEditing() && !isArchiveViewer();
  const readOnlyLabel = editable ? "Bearbeitbar" : "Nur ansehen";
  const year = String(currentAbrechnungsjahr() || "");
  const start = String(periodStart() || "");
  const end = String(periodEnd() || "");
  const endYear = periodYearFromDate(end);
  const yearMismatch = !!endYear && year !== endYear;
  const disabled = editable ? "" : " disabled";
  const mismatchAction = yearMismatch && editable
    ? '<button class="secondary" type="button" data-ui-action="billing.syncPeriodYear">Abrechnungsjahr '+escapeHtml(endYear)+' übernehmen</button>'
    : "";
  const statusClass = yearMismatch ? "warn" : "ok";
  const statusText = yearMismatch ? "Abrechnungsjahr und Endjahr weichen ab" : "Abrechnungsjahr entspricht dem Endjahr";
  el.innerHTML = '<div class="start-box billing-period-settings-card">' +
    '<div class="inline-titlebar"><div><h3>Zeitraum der geöffneten Abrechnung</h3><p class="small">Teilperioden und jahresübergreifende Zeiträume sind zulässig. Das Abrechnungsjahr entspricht dem Jahr des Enddatums.</p></div><span class="status '+statusClass+'">'+escapeHtml(readOnlyLabel)+'</span></div>' +
    '<div class="split billing-period-settings-grid">' +
      '<label class="small"><strong>Abrechnungsjahr</strong><br><input value="'+escapeHtml(year)+'" readonly aria-describedby="billingPeriodYearHint"></label>' +
      '<label class="small"><strong>Beginn</strong><br><input type="date" value="'+escapeHtml(start)+'"'+disabled+uiActionAttributes("billing.setPeriod", ["abrechnungsbeginn","$value"], "change")+'></label>' +
      '<label class="small"><strong>Ende</strong><br><input type="date" value="'+escapeHtml(end)+'"'+disabled+uiActionAttributes("billing.setPeriod", ["abrechnungsende","$value"], "change")+'></label>' +
    '</div>' +
    '<div id="billingPeriodYearHint" class="hint"><strong>Prüfstatus:</strong> <span class="status '+statusClass+'">'+escapeHtml(statusText)+'</span>' + (yearMismatch ? ' · Eingetragen: '+escapeHtml(year)+'; Endjahr: '+escapeHtml(endYear)+'.' : '') + '</div>' +
    (mismatchAction ? '<div class="toolbar">'+mismatchAction+'</div>' : '') +
  '</div>';
}

function renderStart() {
  renderBillingPeriodSettings();
  const recordsSection = document.getElementById("startRecordsSection");
  if (recordsSection) recordsSection.open = true;
  const actionsEl = document.getElementById("startArchiveActions");
  const utilityActionsEl = document.getElementById("startArchiveUtilityActions");
  const tableEl = document.getElementById("startArchiveTable");
  if (!actionsEl || !utilityActionsEl || !tableEl) return;

  tableEl.className = "records-table";
  actionsEl.innerHTML = '<button class="primary" type="button" data-ui-action="billing.openCreateModal">+ Neue Abrechnung</button>';
  utilityActionsEl.innerHTML = "<button type='button' data-ui-action='system.runSelfTest'>App-Selbsttest</button><button type='button' data-ui-action='navigation.switchTab' data-ui-args='[&quot;archiv&quot;]'>Archiv öffnen</button>";
  tableEl.innerHTML = buildBillingRecordsTableHtml();
  renderFinalizationStatus();
}

function renderArchive() {
  const recordsSection = document.getElementById("archiveRecordsSection");
  if (recordsSection) recordsSection.open = true;
  const actionsEl = document.getElementById("archivePrimaryActions");
  const utilityActionsEl = document.getElementById("archiveUtilityActions");
  const tableEl = document.getElementById("archiveRecordsTable");
  if (!actionsEl || !utilityActionsEl || !tableEl) return;
  tableEl.className = "records-table";
  actionsEl.innerHTML = '<button class="primary" type="button" data-ui-action="archive.downloadFull">Archiv als JSON herunterladen</button>';
  utilityActionsEl.innerHTML = "<button type='button' data-ui-action='system.runSelfTest'>App-Selbsttest</button><button type='button' data-ui-action='navigation.switchTab' data-ui-args='[&quot;start&quot;]'>Abrechnungsübersicht öffnen</button>";
  tableEl.innerHTML = buildArchiveRecordsTableHtml();
}

function ap22f5ActionIcon(name) {
  const paths = {
    edit:'<path d="m4 20 4.5-1 10-10a2 2 0 0 0-3-3l-10 10L4 20Z"></path><path d="m14 7 3 3"></path>',
    archive:'<path d="M3 6h18M5 6v15h14V6M8 3h8l2 3H6l2-3M9 11h6"></path>',
    restore:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path>'
  };
  return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || paths.edit) + '</svg>';
}

function renderStartTenantManagement() {
  const tableEl = document.getElementById("startTenantTable");
  const archiveEl = document.getElementById("startTenantArchiveTable");
  const searchEl = document.getElementById("tenantManagementSearch");
  const unitFilterEl = document.getElementById("tenantManagementUnitFilter");
  const statusFilterEl = document.getElementById("tenantManagementStatusFilter");
  const resetEl = document.getElementById("tenantManagementReset");
  if (!tableEl || !archiveEl || !searchEl || !unitFilterEl || !statusFilterEl || !resetEl) return;

  NK_PRO_MODULES.masterDataActions.masterData();
  const readOnly = NK_PRO_MODULES.billingContext.isReadOnly();
  const readOnlyControl = html => readOnly
    ? html.replace(/<(input|select)\b/, match => match + ' disabled aria-disabled="true"')
    : html;
  const genderOptions = ["Frau/Herr","Frau","Herr","Firma/Divers"];
  const salutationOptions = ["Automatisch","Sehr geehrte Frau [Nachname],","Sehr geehrter Herr [Nachname],","Sehr geehrte(r) Mieter/in,","Sehr geehrte Damen und Herren,","Guten Tag,"];
  const roleOptions = ["Mieter","Eigentümer/Privat"];
  const visibleRows = NK_PRO_MODULES.masterDataActions.masterVisibleTenantRows();
  const archivedRows = NK_PRO_MODULES.masterDataActions.masterArchivedTenantRows();
  const units = NK_PRO_MODULES.masterDataActions.masterUnits();

  const selectedUnit = unitFilterEl.value || "all";
  unitFilterEl.innerHTML = '<option value="all">Alle Wohnungen</option>' + units.map(unit => {
    const id = String(unit && unit.id || "");
    const label = id + (unit && (unit.bezeichnung || unit.lage) ? " · " + (unit.bezeichnung || unit.lage) : "");
    return '<option value="' + escapeHtml(id) + '">' + escapeHtml(label) + '</option>';
  }).join("");
  unitFilterEl.value = units.some(unit => String(unit && unit.id || "") === selectedUnit) ? selectedUnit : "all";

  const query = String(searchEl.value || "").trim().toLocaleLowerCase("de-DE");
  const unitFilter = unitFilterEl.value || "all";
  const statusFilter = statusFilterEl.value || "all";
  const filteredRows = visibleRows.filter(row => {
    const status = tenantOpenStatus(row);
    const isActive = status === "Aktiv";
    const searchText = [row.id,row.name,row.wohnung,row.einzug,row.auszug,row.abrechnungRolle,row.geschlecht,row.strasse,row.plz,row.ort,row.telefon,row.email,status]
      .map(value => String(value || "").toLocaleLowerCase("de-DE")).join(" ");
    return (!query || searchText.includes(query)) &&
      (unitFilter === "all" || String(row.wohnung || "") === unitFilter) &&
      (statusFilter === "all" || (statusFilter === "active" ? isActive : !isActive));
  });

  const addInputId = (html, id) => html.replace('<input ', '<input id="' + id + '" ');
  const statusBadge = row => {
    const status = tenantOpenStatus(row) || "Ohne Status";
    const tone = status === "Aktiv" ? "ok" : (status === "NK offen" ? "warn" : "info");
    return '<span class="status ' + tone + '">' + escapeHtml(status) + '</span>';
  };
  const rows = filteredRows.length ? filteredRows.map(row => {
    const index = row.originalIndex;
    const nameFieldId = "tenant-name-" + index;
    const nameInput = addInputId(readOnlyControl(inputHtml(row.name, "setMasterNested('mieter'," + index + ",'name',this.value)", "tenant-management-input")), nameFieldId);
    const editAction = readOnly
      ? '<button class="tenant-management-row-action" type="button" disabled aria-disabled="true" aria-label="' + escapeHtml(row.name || tenantDisplayId(row)) + ' im Nur-Ansehen-Modus">' + ap22f5ActionIcon("edit") + '</button>'
      : '<a class="tenant-management-row-action" href="#' + nameFieldId + '" aria-label="' + escapeHtml(row.name || tenantDisplayId(row)) + ' bearbeiten">' + ap22f5ActionIcon("edit") + '</a>';
    const archiveAction = '<button class="tenant-management-row-action tenant-management-row-action--archive" type="button" aria-label="' + escapeHtml(row.name || tenantDisplayId(row)) + ' archivieren"' +
      (readOnly ? ' disabled aria-disabled="true"' : uiActionAttributes("object.archiveMasterTenancy", [index])) + '>' + ap22f5ActionIcon("archive") + '</button>';
    return '<tr data-tenant-row="' + index + '">' +
      '<td class="tenant-management-id-cell">' + tenantIdCellHtml(row) + '</td>' +
      '<td class="editable tenant-management-unit-cell">' + readOnlyControl(masterUnitSelectHtml(row.wohnung, "setMasterNested('mieter'," + index + ",'wohnung',this.value)")) + '</td>' +
      '<td class="editable tenant-management-name-cell">' + nameInput + '</td>' +
      '<td class="editable"><div class="tenant-management-date-fields"><label><span>Von</span>' + readOnlyControl(dateInputHtml(row.einzug, "setMasterNested('mieter'," + index + ",'einzug',this.value)", "tenant-management-input")) + '</label><label><span>Bis</span>' + readOnlyControl(dateInputHtml(row.auszug, "setMasterNested('mieter'," + index + ",'auszug',this.value)", "tenant-management-input")) + '</label></div></td>' +
      '<td class="editable"><div class="tenant-management-address-fields">' + readOnlyControl(inputHtml(row.strasse, "setMasterNested('mieter'," + index + ",'strasse',this.value)", "tenant-management-input tenant-management-input--street")) + '<div>' + readOnlyControl(inputHtml(row.plz, "setMasterNested('mieter'," + index + ",'plz',this.value)", "tenant-management-input tenant-management-input--postal")) + readOnlyControl(inputHtml(row.ort, "setMasterNested('mieter'," + index + ",'ort',this.value)", "tenant-management-input")) + '</div></div></td>' +
      '<td class="editable"><div class="tenant-management-contact-fields">' + readOnlyControl(inputHtml(row.telefon, "setMasterNested('mieter'," + index + ",'telefon',this.value)", "tenant-management-input")) + readOnlyControl(inputHtml(row.email, "setMasterNested('mieter'," + index + ",'email',this.value)", "tenant-management-input")) + '</div></td>' +
      '<td class="editable"><div class="tenant-management-letter-fields">' + readOnlyControl(selectHtml(row.abrechnungRolle || "Mieter", roleOptions, "setMasterNested('mieter'," + index + ",'abrechnungRolle',this.value)")) + readOnlyControl(selectHtml(row.geschlecht, genderOptions, "setMasterNested('mieter'," + index + ",'geschlecht',this.value)")) + readOnlyControl(selectHtml(row.standardanrede, salutationOptions, "setMasterNested('mieter'," + index + ",'standardanrede',this.value)")) + '</div></td>' +
      '<td class="tenant-management-status-cell">' + statusBadge(row) + '</td>' +
      '<td class="tenant-management-action-cell"><div class="tenant-management-actions">' + editAction + archiveAction + '</div></td></tr>';
  }).join("") : '<tr><td class="tenant-management-empty" colspan="9">Keine Mietverhältnisse entsprechen der aktuellen Suche oder Filterung.</td></tr>';

  tableEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Wohnung</th><th>Mietername</th><th>Mietzeitraum</th><th>Adresse</th><th>Kontakt</th><th>Brief &amp; Rolle</th><th>Status</th><th class="tenant-management-action-heading">Aktionen</th></tr></thead><tbody>' + rows + '</tbody>';

  const archiveRowsHtml = archivedRows.length ? archivedRows.map(row =>
    '<tr><td>' + tenantIdCellHtml(row) + '</td><td>' + unitRefCellHtml(row.wohnung) + '</td><td>' + escapeHtml(row.name || "") + '</td><td>' + escapeHtml(row.einzug || "") + '</td><td>' + escapeHtml(row.auszug || "") + '</td><td>' + escapeHtml(row.strasse || "") + '</td><td>' + escapeHtml((row.plz || "") + " " + (row.ort || "")) + '</td><td>' + escapeHtml(row.archivedAt || "") + '</td><td class="tenant-management-action-cell"><button class="tenant-management-row-action" type="button" aria-label="' + escapeHtml(row.name || tenantDisplayId(row)) + ' reaktivieren"' + (readOnly ? ' disabled aria-disabled="true"' : uiActionAttributes("object.restoreMasterTenancy", [row.originalIndex])) + '>' + ap22f5ActionIcon("restore") + '</button></td></tr>'
  ).join("") : '<tr><td colspan="9">Noch keine archivierten Mietverhältnisse.</td></tr>';
  archiveEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Wohnung</th><th>Mietername</th><th>Einzug</th><th>Auszug</th><th>Straße</th><th>PLZ / Ort</th><th>Archiviert am</th><th>Aktion</th></tr></thead><tbody>' + archiveRowsHtml + '</tbody>';

  const activeCount = visibleRows.filter(row => tenantOpenStatus(row) === "Aktiv").length;
  const inactiveCount = visibleRows.length - activeCount;
  const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = String(value); };
  setText('[data-tenant-summary-total]', visibleRows.length + archivedRows.length);
  setText('[data-tenant-summary-active]', activeCount);
  setText('[data-tenant-summary-ended]', inactiveCount);
  setText('[data-tenant-summary-archived]', archivedRows.length);
  setText('[data-tenant-count]', '(' + visibleRows.length + ')');
  setText('[data-tenant-results]', filteredRows.length + ' von ' + visibleRows.length + ' Mietverhältnissen');
  setText('[data-tenant-footer-results]', filteredRows.length + ' von ' + visibleRows.length + ' Mietverhältnissen');
  setText('[data-tenant-archive-count]', archivedRows.length + ' archiviert');
  const overallStatus = document.querySelector('[data-tenant-status]');
  if (overallStatus) {
    overallStatus.textContent = visibleRows.length ? "Bestand vorhanden" : "Kein Bestand";
    overallStatus.classList.toggle("nk-ui-status--success", visibleRows.length > 0);
    overallStatus.classList.toggle("nk-ui-status--warning", visibleRows.length === 0);
  }

  const addButton = document.querySelector('#mieterverwaltung [data-ui-action="object.addMasterTenancy"]');
  if (addButton) {
    addButton.disabled = readOnly;
    addButton.setAttribute("aria-disabled", readOnly ? "true" : "false");
  }
  const editabilityNote = document.querySelector('[data-tenant-editability-note]');
  if (editabilityNote) editabilityNote.textContent = readOnly
    ? "Stammdaten sind im Nur-Ansehen-Modus lesbar, aber nicht veränderbar."
    : "Alle vorhandenen Stammdaten bleiben direkt in der Tabelle bearbeitbar.";
  const readonlyNotice = document.querySelector('[data-tenant-readonly-notice]');
  if (readonlyNotice) {
    readonlyNotice.hidden = !readOnly;
    readonlyNotice.className = readOnly ? "billing-readonly-notice tenant-management-readonly-notice" : "";
    readonlyNotice.setAttribute("role", readOnly ? "status" : "presentation");
    readonlyNotice.innerHTML = readOnly
      ? '<span class="billing-readonly-notice__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span><span><strong>Diese Abrechnung ist schreibgeschützt.</strong><small>Mietverhältnisse können erst nach dem Öffnen zur Bearbeitung geändert werden.</small></span><button type="button" class="secondary" data-ui-action="billing.switchToEdit">Zur Bearbeitung öffnen</button>'
      : "";
  }

  if (searchEl.dataset.tenantFilterBound !== "true") {
    searchEl.dataset.tenantFilterBound = "true";
    searchEl.addEventListener("input", renderStartTenantManagement);
  }
  if (unitFilterEl.dataset.tenantFilterBound !== "true") {
    unitFilterEl.dataset.tenantFilterBound = "true";
    unitFilterEl.addEventListener("change", renderStartTenantManagement);
  }
  if (statusFilterEl.dataset.tenantFilterBound !== "true") {
    statusFilterEl.dataset.tenantFilterBound = "true";
    statusFilterEl.addEventListener("change", renderStartTenantManagement);
  }
  if (resetEl.dataset.tenantFilterBound !== "true") {
    resetEl.dataset.tenantFilterBound = "true";
    resetEl.addEventListener("click", () => {
      searchEl.value = "";
      unitFilterEl.value = "all";
      statusFilterEl.value = "all";
      renderStartTenantManagement();
      searchEl.focus();
    });
  }
}

function renderMeterInventoryDummyPage() {
  const searchEl = document.getElementById("meterInventorySearch");
  const typeFilterEl = document.getElementById("meterInventoryTypeFilter");
  const resetEl = document.getElementById("meterInventoryReset");
  const tableEl = document.getElementById("meterInventoryDummyTable");
  if (!searchEl || !typeFilterEl || !resetEl || !tableEl) return;

  const applyFilters = () => {
    const query = String(searchEl.value || "").trim().toLocaleLowerCase("de-DE");
    const type = typeFilterEl.value || "all";
    const rows = Array.from(tableEl.querySelectorAll("tbody tr[data-meter-row]"));
    let visible = 0;
    rows.forEach(row => {
      const haystack = [row.dataset.meterSearch || "", row.textContent || ""].join(" ").toLocaleLowerCase("de-DE");
      const matches = (!query || haystack.includes(query)) &&
        (type === "all" || row.dataset.meterType === type);
      row.hidden = !matches;
      if (matches) visible += 1;
    });
    const resultText = visible + " von " + rows.length + " Beispielzeilen";
    const result = document.querySelector('[data-meter-inventory-results]');
    const footer = document.querySelector('[data-meter-inventory-footer-results]');
    if (result) result.textContent = resultText;
    if (footer) footer.textContent = resultText;
  };

  if (searchEl.dataset.meterFilterBound !== "true") {
    searchEl.dataset.meterFilterBound = "true";
    searchEl.addEventListener("input", applyFilters);
  }
  if (typeFilterEl.dataset.meterFilterBound !== "true") {
    typeFilterEl.dataset.meterFilterBound = "true";
    typeFilterEl.addEventListener("change", applyFilters);
  }
  if (resetEl.dataset.meterFilterBound !== "true") {
    resetEl.dataset.meterFilterBound = "true";
    resetEl.addEventListener("click", () => {
      searchEl.value = "";
      typeFilterEl.value = "all";
      applyFilters();
      searchEl.focus();
    });
  }
  applyFilters();
}

function renderStartUnitManagement() {
  const tableEl = document.getElementById("startUnitTable");
  if (!tableEl) return;
  const units = NK_PRO_MODULES.masterDataActions.masterUnits();
  const readOnly = NK_PRO_MODULES.billingContext.isReadOnly();
  const validation = (() => {
    try { return validateObjectStandard(state); }
    catch (error) { return { issues:[] }; }
  })();
  const unitIssues = (Array.isArray(validation && validation.issues) ? validation.issues : [])
    .filter(item => String(item && item.code || "").startsWith("UNIT_"));
  const issuesByIndex = new Map();
  unitIssues.forEach(item => {
    const match = String(item && item.path || "").match(/objektStandard\.einheiten\[(\d+)\]/);
    const index = match ? Number(match[1]) : units.findIndex(unit => String(unit && unit.id || unit && unit.einheitId || "") === String(item && item.entityId || ""));
    if (index < 0) return;
    if (!issuesByIndex.has(index)) issuesByIndex.set(index, []);
    issuesByIndex.get(index).push(item);
  });
  const unitInput = (value, expression, cssClass, id) => {
    let html = inputHtml(value, expression, cssClass || "");
    html = html.replace('<input ', '<input id="' + id + '" ');
    html = html.replace('class="', 'class="unit-management-input ');
    if (readOnly) html = html.replace('>', ' readonly aria-readonly="true">');
    return html;
  };
  const actionIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 20 4.5-1 10-10a2 2 0 0 0-3-3l-10 10L4 20Z"></path><path d="m14 7 3 3"></path></svg>';
  const rows = units.map((w,i) => {
    const issues = issuesByIndex.get(i) || [];
    const hasIssue = issues.length > 0;
    const unitLabel = String(w && (w.bezeichnung || w.id || w.einheitId) || "Wohnung " + (i + 1));
    const fieldId = "unit-bezeichnung-" + i;
    const action = readOnly
      ? '<button class="unit-management-row-action" type="button" disabled aria-label="' + escapeHtml(unitLabel) + ' im Nur-Ansehen-Modus"><span class="visually-hidden">Nur ansehen</span>' + actionIcon + '</button>'
      : '<a class="unit-management-row-action" href="#' + fieldId + '" aria-label="' + escapeHtml(unitLabel) + ' bearbeiten">' + actionIcon + '</a>';
    return '<tr data-unit-row="' + i + '" data-unit-issue="' + (hasIssue ? 'true' : 'false') + '"' + (hasIssue ? ' class="unit-management-row--issue"' : '') + '>' +
      '<td class="unit-management-id-cell">' + unitIdCellHtml(w) + (hasIssue ? '<span class="unit-management-issue-marker" title="Prüfbefund vorhanden" aria-label="Prüfbefund vorhanden">!</span>' : '') + '</td>' +
      '<td class="editable">' + unitInput(w.bezeichnung, "setMasterNested('wohnungen'," + i + ",'bezeichnung',this.value)", "", fieldId) + '</td>' +
      '<td class="editable">' + unitInput(w.lage, "setMasterNested('wohnungen'," + i + ",'lage',this.value)", "", "unit-lage-" + i) + '</td>' +
      '<td class="editable">' + unitInput(w.wohnflaeche, "setMasterNested('wohnungen'," + i + ",'wohnflaeche',this.value,'number')", "number", "unit-wohnflaeche-" + i) + '</td>' +
      '<td class="editable">' + unitInput(w.zimmer, "setMasterNested('wohnungen'," + i + ",'zimmer',this.value)", "", "unit-zimmer-" + i) + '</td>' +
      '<td class="editable">' + unitInput(w.bemerkung, "setMasterNested('wohnungen'," + i + ",'bemerkung',this.value)", "", "unit-bemerkung-" + i) + '</td>' +
      '<td class="unit-management-action-cell">' + action + '</td></tr>';
  }).join("");
  tableEl.innerHTML = '<thead><tr><th>Wohnungs-ID</th><th>Bezeichnung</th><th>Etage / Lage</th><th>Wohnfläche m²</th><th>Zimmer</th><th>Bemerkung</th><th class="unit-management-action-heading">Aktion</th></tr></thead><tbody>' + rows + '</tbody>';

  const count = document.querySelector('[data-unit-count]');
  if (count) count.textContent = '(' + units.length + ')';
  const status = document.querySelector('[data-unit-status]');
  if (status) {
    status.textContent = unitIssues.length ? unitIssues.length + (unitIssues.length === 1 ? ' Prüfbefund' : ' Prüfbefunde') : 'Vollständig';
    status.classList.toggle('nk-ui-status--warning', unitIssues.length > 0);
    status.classList.toggle('nk-ui-status--success', unitIssues.length === 0);
  }

  const readonlyNotice = document.querySelector('[data-unit-readonly-notice]');
  if (readonlyNotice) {
    readonlyNotice.hidden = !readOnly;
    readonlyNotice.className = readOnly ? 'billing-readonly-notice unit-management-readonly-notice' : '';
    readonlyNotice.setAttribute('role', readOnly ? 'status' : 'presentation');
    readonlyNotice.innerHTML = readOnly
      ? '<span class="billing-readonly-notice__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span><span><strong>Diese Abrechnung ist schreibgeschützt.</strong><small>Wohnungsstammdaten können erst nach dem Öffnen zur Bearbeitung geändert werden.</small></span><button type="button" class="secondary" data-ui-action="billing.switchToEdit">Zur Bearbeitung öffnen</button>'
      : '';
  }

  const issuesRoot = document.querySelector('[data-unit-issues]');
  if (issuesRoot) {
    issuesRoot.hidden = unitIssues.length === 0;
    issuesRoot.className = unitIssues.length ? 'nk-ui-notice nk-ui-notice--warning unit-management-issues' : '';
    issuesRoot.setAttribute('role', unitIssues.length ? 'status' : 'presentation');
    issuesRoot.innerHTML = unitIssues.length
      ? '<span class="unit-management-note__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.8 20h18.4L12 3Z"></path><path d="M12 9v5M12 17h.01"></path></svg></span><span><strong>Handlungsbedarf in der Wohnungstabelle</strong><small>' + unitIssues.map(item => escapeHtml(item.message || item.code || 'Prüfbefund')).join(' · ') + '</small></span>'
      : '';
  }

  if (globalThis.NKProUiTableTools) {
    NKProUiTableTools.ensureTableTools(tableEl);
    const tools = document.querySelector('.table-tools[data-table="startUnitTable"]');
    if (tools) {
      tools.classList.add('nk-ui-toolbar','unit-management-toolbar');
      const input = tools.querySelector('input[type="search"]');
      const reset = tools.querySelector('button');
      const hint = tools.querySelector('.small');
      if (input) {
        input.placeholder = 'Wohnung suchen …';
        input.setAttribute('aria-label','Wohnungen durchsuchen');
      }
      if (reset) reset.textContent = 'Zurücksetzen';
      if (hint) hint.textContent = 'Suche und bestehende Prüfbefunde filtern.';
      let select = tools.querySelector('[data-unit-status-filter]');
      if (!select) {
        select = document.createElement('select');
        select.dataset.unitStatusFilter = '';
        select.setAttribute('aria-label','Wohnungen nach Prüfstatus filtern');
        select.innerHTML = '<option value="all">Alle Wohnungen</option><option value="issues">Mit Handlungsbedarf</option>';
        if (reset) tools.insertBefore(select, reset); else tools.appendChild(select);
      }
      const updateResults = () => {
        const visible = Array.from(tableEl.tBodies[0] ? tableEl.tBodies[0].rows : []).filter(row => !row.classList.contains('filtered-out') && !row.classList.contains('unit-filtered-out')).length;
        const result = document.querySelector('[data-unit-results]');
        if (result) result.textContent = visible + ' von ' + units.length + (units.length === 1 ? ' Wohnung' : ' Wohnungen');
      };
      const applyUnitFilters = () => {
        const query = String(input && input.value || '').toLocaleLowerCase('de-DE').trim();
        const issuesOnly = select && select.value === 'issues';
        Array.from(tableEl.tBodies[0] ? tableEl.tBodies[0].rows : []).forEach(row => {
          const values = [row.textContent].concat(Array.from(row.querySelectorAll('input,select,textarea')).map(control => control.value)).join(' ').toLocaleLowerCase('de-DE');
          row.classList.toggle('filtered-out', query !== '' && !values.includes(query));
          row.classList.toggle('unit-filtered-out', issuesOnly && row.dataset.unitIssue !== 'true');
        });
        updateResults();
      };
      if (input && input.dataset.unitResultsBound !== 'true') {
        input.dataset.unitResultsBound = 'true';
        input.addEventListener('input', applyUnitFilters);
      }
      if (select && select.dataset.unitFilterBound !== 'true') {
        select.dataset.unitFilterBound = 'true';
        select.addEventListener('change', applyUnitFilters);
      }
      if (reset && reset.dataset.unitResetBound !== 'true') {
        reset.dataset.unitResetBound = 'true';
        reset.addEventListener('click', () => { if (select) select.value = 'all'; setTimeout(applyUnitFilters, 0); });
      }
      applyUnitFilters();
    }
  }
}


