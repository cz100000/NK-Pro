(function (global) {
  "use strict";

  const preferences = global.NKProUiPreferences;
  if (!preferences) throw new Error("NK-Pro UI-Einstellungsspeicher fehlt.");
  const NAV_GROUP_STORAGE_KEY = "nkpro.workflowNavigation.v3";
  const GROUP_KEYS = ["group-object", "group-billing", "group-archive", "group-extras"];
  const TAB_PATHS = {
    objekt:"group-object", mieterverwaltung:"group-object", wohnungsverwaltung:"group-object",
    start:"group-billing", mieter:"group-billing", einstellungen:"group-billing", einnahmen:"group-billing",
    wasser:"group-billing", manuellewerte:"group-billing", umlage:"group-billing",
    vorauszahlungsanpassung:"group-billing", qualitaet:"group-billing", briefe:"group-billing", export:"group-billing",
    archiv:"group-archive", sicherung:"group-extras"
  };
  let openGroup = loadOpenGroup();
  let initialized = false;
  let contextProvider = Object.freeze({});

  function configure(provider = {}) {
    contextProvider = Object.freeze({
      currentYear:typeof provider.currentYear === "function" ? provider.currentYear : null,
      objectLabel:typeof provider.objectLabel === "function" ? provider.objectLabel : null,
      isArchiveViewer:typeof provider.isArchiveViewer === "function" ? provider.isArchiveViewer : null,
      hasActiveBilling:typeof provider.hasActiveBilling === "function" ? provider.hasActiveBilling : null,
      isFinalized:typeof provider.isFinalized === "function" ? provider.isFinalized : null,
      isContextOpen:typeof provider.isContextOpen === "function" ? provider.isContextOpen : null,
      tabTitle:typeof provider.tabTitle === "function" ? provider.tabTitle : null,
      updatePageHeaders:typeof provider.updatePageHeaders === "function" ? provider.updatePageHeaders : null,
      renderOverview:typeof provider.renderOverview === "function" ? provider.renderOverview : null
    });
    return describe();
  }

  function loadOpenGroup() {
    try {
      const stored = preferences.get(NAV_GROUP_STORAGE_KEY);
      return GROUP_KEYS.includes(stored) ? stored : "group-object";
    } catch(error) { return "group-object"; }
  }
  function saveOpenGroup() { preferences.set(NAV_GROUP_STORAGE_KEY, openGroup); }
  function applyGroupState() {
    GROUP_KEYS.forEach(function (key) {
      const toggle = document.querySelector('[data-nav-toggle="' + key + '"]');
      const panel = toggle ? document.getElementById(toggle.getAttribute("aria-controls")) : null;
      const expanded = key === openGroup;
      if (toggle) toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (panel) panel.hidden = !expanded;
    });
  }
  function setOpenGroup(key, persist) {
    if (!GROUP_KEYS.includes(key)) return;
    openGroup = key;
    applyGroupState();
    if (persist !== false) saveOpenGroup();
  }
  function markActiveNavigationBranch(tabId) {
    document.querySelectorAll(".nav-group").forEach(function (node) { node.classList.remove("has-active"); });
    const active = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    const group = active ? active.closest(".nav-group") : null;
    if (group) group.classList.add("has-active");
  }
  function ensureNavigationPath(tabId, options) {
    const group = TAB_PATHS[tabId];
    if (group) setOpenGroup(group, false);
    markActiveNavigationBranch(tabId);
    if (!options || options.persist !== false) saveOpenGroup();
  }
  function valueFromProvider(name, fallback) {
    try { return contextProvider[name] ? contextProvider[name]() : fallback; } catch(error) { return fallback; }
  }
  function updateWorkflowNavigationContext() {
    const panel = document.querySelector("[data-nav-billing-context-panel]");
    const object = document.querySelector("[data-nav-billing-object]");
    const year = document.querySelector("[data-nav-billing-year]");
    const status = document.querySelector("[data-nav-billing-context]");
    const currentYear = String(valueFromProvider("currentYear", "") || "");
    const objectLabel = valueFromProvider("objectLabel", "Objekt") || "Objekt";
    const archive = !!valueFromProvider("isArchiveViewer", false);
    const available = archive || !!valueFromProvider("hasActiveBilling", true);
    const finalized = !!valueFromProvider("isFinalized", false);
    const contextOpen = !!valueFromProvider("isContextOpen", false);
    if (panel) panel.hidden = !contextOpen;
    if (object) object.textContent = objectLabel;
    if (year) year.textContent = currentYear;
    if (status) {
      status.classList.remove("is-archive", "is-finalized");
      if (archive) { status.textContent = "Nur Ansicht"; status.classList.add("is-archive"); }
      else if (finalized) { status.textContent = "Finalisiert"; status.classList.add("is-finalized"); }
      else status.textContent = "Bearbeitung";
    }
    document.querySelectorAll('[data-requires-billing="true"]').forEach(function (button) {
      button.disabled = !available;
      button.setAttribute("aria-disabled", available ? "false" : "true");
    });
  }
  function setSidebarCollapsed(collapsed) {
    const mobile = window.matchMedia && window.matchMedia("(max-width: 980px)").matches;
    if (mobile) { document.body.classList.remove("sidebar-open"); return; }
    document.body.classList.toggle("sidebar-collapsed", !!collapsed);
    preferences.setBoolean("nkpro.sidebarCollapsed.v1", !!collapsed);
  }
  function initializeSidebarCollapse() {
    try {
      if (preferences.getBoolean("nkpro.sidebarCollapsed.v1") && !(window.matchMedia && window.matchMedia("(max-width: 980px)").matches)) document.body.classList.add("sidebar-collapsed");
    } catch(error) {}
    ["sidebarCollapseTop", "sidebarCollapseBottom"].forEach(function (id) {
      const control = document.getElementById(id);
      if (control) control.addEventListener("click", function () { setSidebarCollapsed(true); });
    });
  }
  function initializeWorkflowNavigation() {
    if (initialized) return;
    initialized = true;
    applyGroupState();
    document.querySelectorAll(".nav-group-toggle[data-nav-toggle]").forEach(function (toggle) {
      toggle.addEventListener("click", function () { setOpenGroup(toggle.dataset.navToggle, true); });
    });
    const active = document.querySelector("section.tab.active");
    if (active) ensureNavigationPath(active.id, {persist:false});
    updateWorkflowNavigationContext();
    initializeSidebarCollapse();
    const toggle = document.getElementById("sidebarToggle");
    if (toggle) toggle.addEventListener("click", function () {
      if (document.body.classList.contains("sidebar-collapsed")) {
        document.body.classList.remove("sidebar-collapsed");
        preferences.setBoolean("nkpro.sidebarCollapsed.v1", false);
      } else document.body.classList.toggle("sidebar-open");
    });
    document.addEventListener("click", function (event) {
      if (document.body.classList.contains("sidebar-open") && !event.target.closest("#appSidebar") && !event.target.closest("#sidebarToggle")) document.body.classList.remove("sidebar-open");
    });
  }
  function refreshWorkspaceChrome() {
    const activeSection = document.querySelector("section.tab.active");
    const activeButton = activeSection ? document.querySelector('.tab-btn[data-tab="' + activeSection.id + '"]') : null;
    const title = document.getElementById("workspaceTitle");
    if (title) {
      if (activeSection && activeSection.id === "landing") title.textContent = "Arbeitsweiche";
      else if (activeSection && contextProvider.tabTitle) title.textContent = contextProvider.tabTitle(activeSection.id) || "NK-Pro";
      else title.textContent = activeButton ? activeButton.textContent.trim() : "NK-Pro";
    }
    if (contextProvider.updatePageHeaders) contextProvider.updatePageHeaders();
    if (contextProvider.renderOverview && activeSection) contextProvider.renderOverview(activeSection.id);
    updateWorkflowNavigationContext();
  }
  function describe() {
    return Object.freeze({ initialized, openGroup, groupCount:GROUP_KEYS.length, configured:Object.values(contextProvider).some(Boolean) });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeWorkflowNavigation();
    refreshWorkspaceChrome();
    document.querySelectorAll(".tab details").forEach(function (d) { d.open = false; });
  });

  global.NKProNavigation = Object.freeze({
    configure,
    initializeWorkflowNavigation,
    refreshWorkspaceChrome,
    ensureNavigationPath,
    updateWorkflowNavigationContext,
    applyGroupState,
    setOpenGroup,
    setSidebarCollapsed,
    describe
  });
})(globalThis);
