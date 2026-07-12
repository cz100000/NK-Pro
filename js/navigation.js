(function () {
  const NAV_PHASE_STORAGE_KEY = "nkpro.workflowNavigation.v2";
  const PHASE_KEYS = ["phase-grundlagen","phase-einnahmen","phase-berechnung","phase-ausgabe"];
  const TAB_PATHS = {
    mieter:"phase-grundlagen",
    einstellungen:"phase-grundlagen",
    einnahmen:"phase-einnahmen",
    wasser:"phase-einnahmen",
    manuellewerte:"phase-einnahmen",
    umlage:"phase-berechnung",
    vorauszahlungsanpassung:"phase-berechnung",
    qualitaet:"phase-ausgabe",
    briefe:"phase-ausgabe",
    export:"phase-ausgabe"
  };
  let openPhase = loadOpenPhase();

  function loadOpenPhase() {
    try {
      const stored = localStorage.getItem(NAV_PHASE_STORAGE_KEY);
      return PHASE_KEYS.includes(stored) ? stored : "phase-grundlagen";
    } catch(error) {
      return "phase-grundlagen";
    }
  }
  function saveOpenPhase() {
    try { localStorage.setItem(NAV_PHASE_STORAGE_KEY, openPhase); } catch(error) {}
  }
  function applyPhaseState() {
    PHASE_KEYS.forEach(function (key) {
      const toggle = document.querySelector('[data-nav-toggle="' + key + '"]');
      const panel = toggle ? document.getElementById(toggle.getAttribute("aria-controls")) : null;
      const expanded = key === openPhase;
      if (toggle) toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (panel) panel.hidden = !expanded;
    });
  }
  function setOpenPhase(key, persist) {
    if (!PHASE_KEYS.includes(key)) return;
    openPhase = key;
    applyPhaseState();
    if (persist !== false) saveOpenPhase();
  }
  function markActiveNavigationBranch(tabId) {
    document.querySelectorAll(".nav-phase").forEach(function (node) { node.classList.remove("has-active"); });
    const active = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    const phase = active ? active.closest(".nav-phase") : null;
    if (phase) phase.classList.add("has-active");
  }
  function ensureNavigationPath(tabId, options) {
    const phase = TAB_PATHS[tabId];
    if (phase) setOpenPhase(phase, false);
    markActiveNavigationBranch(tabId);
    if (!options || options.persist !== false) saveOpenPhase();
  }
  function updateWorkflowNavigationContext() {
    const year = document.querySelector("[data-nav-billing-year]");
    const status = document.querySelector("[data-nav-billing-context]");
    let currentYear = "–";
    let available = true;
    let archive = false;
    let finalized = false;
    try {
      if (typeof currentAbrechnungsjahr === "function") currentYear = currentAbrechnungsjahr() || "–";
      if (typeof isArchiveViewer === "function") archive = !!isArchiveViewer();
      if (typeof hasActiveCurrentBilling === "function") available = archive || !!hasActiveCurrentBilling();
      if (typeof isCurrentBillingFinalized === "function") finalized = !!isCurrentBillingFinalized();
    } catch(error) {}
    if (year) year.textContent = currentYear;
    if (status) {
      status.classList.remove("is-archive","is-finalized","is-unavailable");
      if (archive) {
        status.textContent = "Archiv";
        status.classList.add("is-archive");
      } else if (finalized) {
        status.textContent = "finalisiert";
        status.classList.add("is-finalized");
      } else if (available) {
        status.textContent = "in Bearbeitung";
      } else {
        status.textContent = "keine Abrechnung";
        status.classList.add("is-unavailable");
      }
    }
    document.querySelectorAll('[data-nav-group="billing"]').forEach(function (button) {
      button.disabled = !available;
      button.setAttribute("aria-disabled", available ? "false" : "true");
    });
  }
  function setSidebarCollapsed(collapsed) {
    const mobile = window.matchMedia && window.matchMedia("(max-width: 980px)").matches;
    if (mobile) {
      document.body.classList.remove("sidebar-open");
      return;
    }
    document.body.classList.toggle("sidebar-collapsed", !!collapsed);
    try { localStorage.setItem("nkpro.sidebarCollapsed.v1", collapsed ? "1" : "0"); } catch(error) {}
  }
  function initializeSidebarCollapse() {
    try {
      if (localStorage.getItem("nkpro.sidebarCollapsed.v1") === "1" && !(window.matchMedia && window.matchMedia("(max-width: 980px)").matches)) {
        document.body.classList.add("sidebar-collapsed");
      }
    } catch(error) {}
    ["sidebarCollapseTop","sidebarCollapseBottom"].forEach(function (id) {
      const control = document.getElementById(id);
      if (control) control.addEventListener("click", function () { setSidebarCollapsed(true); });
    });
  }
  function initializeWorkflowNavigation() {
    applyPhaseState();
    document.querySelectorAll(".nav-phase-toggle[data-nav-toggle]").forEach(function (toggle) {
      toggle.addEventListener("click", function () { setOpenPhase(toggle.dataset.navToggle, true); });
    });
    const active = document.querySelector(".tab-btn.active");
    if (active) ensureNavigationPath(active.dataset.tab, {persist:false});
    updateWorkflowNavigationContext();
    initializeSidebarCollapse();
  }
  function refreshWorkspaceChrome() {
    const activeButton = document.querySelector('.tab-btn.active');
    const title = document.getElementById('workspaceTitle');
    if (title) title.textContent = activeButton ? activeButton.textContent.trim() : 'NK-Pro';
    if (typeof updateAllPageHeaders === 'function') updateAllPageHeaders();
    if (typeof renderOverviewForTab === 'function' && activeButton) renderOverviewForTab(activeButton.dataset.tab);
    updateWorkflowNavigationContext();
  }
  document.addEventListener('DOMContentLoaded', function () {
    initializeWorkflowNavigation();
    refreshWorkspaceChrome();
    document.querySelectorAll('.tab details').forEach(function (d) { d.open = false; });
    const toggle = document.getElementById('sidebarToggle');
    if (toggle) toggle.addEventListener('click', function () {
      if (document.body.classList.contains('sidebar-collapsed')) {
        document.body.classList.remove('sidebar-collapsed');
        try { localStorage.setItem("nkpro.sidebarCollapsed.v1", "0"); } catch(error) {}
      } else {
        document.body.classList.toggle('sidebar-open');
      }
    });
    document.addEventListener('click', function (event) {
      if (document.body.classList.contains('sidebar-open') && !event.target.closest('#appSidebar') && !event.target.closest('#sidebarToggle')) document.body.classList.remove('sidebar-open');
    });
  });
  window.refreshWorkspaceChrome = refreshWorkspaceChrome;
  window.ensureNavigationPath = ensureNavigationPath;
  window.updateWorkflowNavigationContext = updateWorkflowNavigationContext;
  window.applyNavTreeState = applyPhaseState;
  window.setOpenNavigationPhase = setOpenPhase;
})();
