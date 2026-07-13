(function (global) {
  "use strict";

  const preferences = global.NKProUiPreferences;
  if (!preferences) throw new Error("NK-Pro UI-Einstellungsspeicher fehlt.");
  const NAV_GROUP_STORAGE_KEY = "nkpro.workflowNavigation.v4";
  const LEGACY_NAV_GROUP_STORAGE_KEY = "nkpro.workflowNavigation.v3";
  const GROUP_KEYS = ["group-object", "group-billing", "group-archive", "group-extras"];
  const BILLING_CONTEXT_TABS = ["mieter","einstellungen","einnahmen","manuellewerte","verbraeuche","umlage","vorauszahlungsanpassung","qualitaet","briefe","export"];
  const TAB_PATHS = {
    objektuebersicht:"group-object", objekt:"group-object", mieterverwaltung:"group-object", wohnungsverwaltung:"group-object", wasser:"group-object",
    start:"group-billing", mieter:"group-billing", einstellungen:"group-billing", einnahmen:"group-billing",
    manuellewerte:"group-billing", verbraeuche:"group-billing", umlage:"group-billing",
    vorauszahlungsanpassung:"group-billing", qualitaet:"group-billing", briefe:"group-billing", export:"group-billing",
    archiv:"group-archive", sicherung:"group-extras"
  };
  let openGroups = loadOpenGroups();
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

  function loadOpenGroups() {
    try {
      const stored = preferences.get(NAV_GROUP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const values = Array.isArray(parsed) ? parsed : Object.keys(parsed || {}).filter(key => parsed[key]);
        return new Set(values.filter(key => GROUP_KEYS.includes(key)));
      }
      const legacy = preferences.get(LEGACY_NAV_GROUP_STORAGE_KEY);
      if (GROUP_KEYS.includes(legacy)) return new Set([legacy]);
    } catch(error) {}
    return new Set(["group-object"]);
  }
  function saveOpenGroups() { preferences.set(NAV_GROUP_STORAGE_KEY, JSON.stringify(GROUP_KEYS.filter(key => openGroups.has(key)))); }
  function applyGroupState() {
    GROUP_KEYS.forEach(function (key) {
      const toggle = document.querySelector('[data-nav-toggle="' + key + '"]');
      const panel = toggle ? document.getElementById(toggle.getAttribute("aria-controls")) : null;
      const expanded = openGroups.has(key);
      if (toggle) toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (panel) panel.hidden = !expanded;
    });
  }
  function setGroupExpanded(key, expanded, persist) {
    if (!GROUP_KEYS.includes(key)) return;
    if (expanded) openGroups.add(key);
    else openGroups.delete(key);
    applyGroupState();
    if (persist !== false) saveOpenGroups();
  }
  function toggleGroup(key, persist) { setGroupExpanded(key, !openGroups.has(key), persist); }
  function setOpenGroup(key, persist) { setGroupExpanded(key, true, persist); }
  function markActiveNavigationBranch(tabId) {
    document.querySelectorAll(".nav-group").forEach(function (node) { node.classList.remove("has-active"); });
    document.querySelectorAll(".tab-btn[data-tab]").forEach(function (node) {
      const current = node.dataset.tab === tabId;
      if (current) node.setAttribute("aria-current", "page");
      else node.removeAttribute("aria-current");
    });
    const home = document.querySelector(".sidebar-brand-home");
    if (home) {
      const landing = tabId === "landing";
      const dedicatedStart = document.querySelector('.nav-start-link[data-tab="landing"]');
      home.classList.toggle("active", landing);
      if (landing && !dedicatedStart) home.setAttribute("aria-current", "page");
      else home.removeAttribute("aria-current");
    }
    const active = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    const group = active ? active.closest(".nav-group") : null;
    if (group) group.classList.add("has-active");
  }
  function ensureNavigationPath(tabId, options) {
    const group = TAB_PATHS[tabId];
    if (group) setGroupExpanded(group, true, false);
    markActiveNavigationBranch(tabId);
    if (!options || options.persist !== false) saveOpenGroups();
  }
  function valueFromProvider(name, fallback) {
    try { return contextProvider[name] ? contextProvider[name]() : fallback; } catch(error) { return fallback; }
  }
  function updateWorkflowNavigationContext() {
    const bar = document.querySelector("[data-global-billing-context]");
    const object = document.querySelector("[data-global-billing-object]");
    const year = document.querySelector("[data-global-billing-year]");
    const status = document.querySelector("[data-global-billing-status]");
    const currentYear = String(valueFromProvider("currentYear", "") || "");
    const objectLabel = valueFromProvider("objectLabel", "Objekt") || "Objekt";
    const archive = !!valueFromProvider("isArchiveViewer", false);
    const available = archive || !!valueFromProvider("hasActiveBilling", true);
    const finalized = !!valueFromProvider("isFinalized", false);
    const contextOpen = !!valueFromProvider("isContextOpen", false);
    const active = document.querySelector("section.tab.active");
    const relevantPage = !!(active && BILLING_CONTEXT_TABS.includes(active.id));
    if (bar) bar.hidden = !(contextOpen && relevantPage);
    if (object) object.textContent = objectLabel;
    if (year) year.textContent = currentYear || "–";
    if (status) {
      status.classList.remove("is-archive", "is-finalized", "is-working");
      if (archive) { status.textContent = "Nur Ansicht"; status.classList.add("is-archive"); }
      else if (finalized) { status.textContent = "Finalisiert"; status.classList.add("is-finalized"); }
      else { status.textContent = "In Bearbeitung"; status.classList.add("is-working"); }
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
  function closeWorkspaceHeaderPanels(exceptId) {
    document.querySelectorAll(".workspace-header-panel").forEach(function (panel) {
      if (panel.id === exceptId) return;
      panel.hidden = true;
      const trigger = document.querySelector('[data-header-panel-target="' + panel.id + '"]');
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }
  function initializeWorkspaceHeaderControls() {
    document.querySelectorAll("[data-header-panel-target]").forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.stopPropagation();
        const panel = document.getElementById(trigger.dataset.headerPanelTarget || "");
        if (!panel) return;
        const willOpen = panel.hidden;
        closeWorkspaceHeaderPanels(willOpen ? panel.id : null);
        panel.hidden = !willOpen;
        trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    });
    document.querySelectorAll(".workspace-header-panel").forEach(function (panel) {
      panel.addEventListener("click", function (event) {
        if (event.target.closest("button[data-ui-action]")) closeWorkspaceHeaderPanels();
      });
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".workspace-action-menu")) closeWorkspaceHeaderPanels();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeWorkspaceHeaderPanels();
    });
  }
  function initializeWorkflowNavigation() {
    if (initialized) return;
    initialized = true;
    applyGroupState();
    document.querySelectorAll(".nav-group-toggle[data-nav-toggle]").forEach(function (toggle) {
      toggle.addEventListener("click", function () { toggleGroup(toggle.dataset.navToggle, true); });
    });
    const active = document.querySelector("section.tab.active");
    if (active) ensureNavigationPath(active.id, {persist:false});
    updateWorkflowNavigationContext();
    initializeSidebarCollapse();
    initializeWorkspaceHeaderControls();
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
    const values = GROUP_KEYS.filter(key => openGroups.has(key));
    return Object.freeze({ initialized, openGroups:values, openGroup:values[0] || null, groupCount:GROUP_KEYS.length, configured:Object.values(contextProvider).some(Boolean) });
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
    setGroupExpanded,
    toggleGroup,
    setSidebarCollapsed,
    describe
  });
})(globalThis);
