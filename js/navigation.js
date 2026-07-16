(function (global) {
  "use strict";

  const preferences = global.NKProUiPreferences;
  if (!preferences) throw new Error("NK-Pro UI-Einstellungsspeicher fehlt.");
  const NAV_GROUP_STORAGE_KEY = "nkpro.workflowNavigation.v6";
  const LEGACY_NAV_GROUP_STORAGE_KEYS = ["nkpro.workflowNavigation.v5", "nkpro.workflowNavigation.v3"];
  const NAVIGATION_GROUPS = Object.freeze([
  {
    "key": "object",
    "storageKey": "group-object",
    "panelId": "nav-group-object",
    "label": "Objekt vorbereiten",
    "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" viewbox=\"0 0 24 24\"><path d=\"M3.5 10.5 12 3.5l8.5 7\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><path d=\"M5.5 9.5V21h13V9.5\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><path d=\"M9.5 21v-6h5v6\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path></svg></span>",
    "items": [
      {
        "tab": "objekt",
        "label": "Objektdaten",
        "ariaLabel": "",
        "requiresBilling": false,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewbox=\"0 0 24 24\"><path d=\"M5 21V5l7-2v18M12 8h7v13M8 8h1M8 12h1M8 16h1M15 11h1M15 15h1M3 21h18\"></path></svg></span>"
      },
      {
        "tab": "wohnungsverwaltung",
        "label": "Wohnungen",
        "ariaLabel": "",
        "requiresBilling": false,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" viewbox=\"0 0 24 24\"><path d=\"M4 21V4h7v17\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><path d=\"M13 21V2h7v19\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"7\" x2=\"8\" y1=\"8\" y2=\"8\"></line><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"7\" x2=\"8\" y1=\"12\" y2=\"12\"></line><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"7\" x2=\"8\" y1=\"16\" y2=\"16\"></line><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"16\" x2=\"17\" y1=\"6\" y2=\"6\"></line><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"16\" x2=\"17\" y1=\"10\" y2=\"10\"></line><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"16\" x2=\"17\" y1=\"14\" y2=\"14\"></line><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"3\" x2=\"21\" y1=\"21\" y2=\"21\"></line></svg></span>"
      },
      {
        "tab": "wasser",
        "label": "Zähler",
        "ariaLabel": "",
        "requiresBilling": false,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" viewbox=\"0 0 24 24\"><path d=\"M4 18a8 8 0 1 1 16 0\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><path d=\"M7 18h10\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><path d=\"m12 14 3-4\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"7.5\" x2=\"8.5\" y1=\"10.5\" y2=\"11.5\"></line><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"12\" x2=\"12\" y1=\"8\" y2=\"9\"></line><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"16.5\" x2=\"15.5\" y1=\"10.5\" y2=\"11.5\"></line></svg></span>"
      },
      {
        "tab": "mieterverwaltung",
        "label": "Mietverhältnisse",
        "ariaLabel": "",
        "requiresBilling": false,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" viewbox=\"0 0 24 24\"><circle cx=\"9\" cy=\"8\" r=\"3\" stroke=\"currentColor\" stroke-width=\"1.8\"></circle><path d=\"M3.5 20a5.5 5.5 0 0 1 11 0\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><path d=\"M16 5.5a3 3 0 0 1 0 5.8\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><path d=\"M16.5 14.5a5 5 0 0 1 4 5\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path></svg></span>"
      }
    ]
  },
  {
    "key": "billing",
    "storageKey": "group-billing",
    "panelId": "nav-group-billing",
    "label": "Nebenkosten abrechnen",
    "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" viewbox=\"0 0 24 24\"><path d=\"M6 2.8h8l4 4V21H6z\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><path d=\"M14 2.8v4h4\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"9\" x2=\"15\" y1=\"11\" y2=\"11\"></line><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"9\" x2=\"15\" y1=\"15\" y2=\"15\"></line></svg></span>",
    "items": [
      {
        "tab": "start",
        "label": "Übersicht",
        "ariaLabel": "Übersicht",
        "requiresBilling": false,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewbox=\"0 0 24 24\"><path d=\"M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z\"></path></svg></span>"
      },
      {
        "tab": "mieter",
        "label": "Mietverhältnisse",
        "ariaLabel": "Mietverhältnisse",
        "requiresBilling": true,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewbox=\"0 0 24 24\"><path d=\"M4 21V7h9v14M13 11h7v10M7 11h3M7 15h3M16 14h1M16 17h1M3 21h18\"></path><circle cx=\"8.5\" cy=\"5\" r=\"2.5\"></circle></svg></span>"
      },
      {
        "tab": "einnahmen",
        "label": "Vorauszahlungen",
        "ariaLabel": "Vorauszahlungen",
        "requiresBilling": true,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewbox=\"0 0 24 24\"><path d=\"M4 6.5h14a2 2 0 0 1 2 2V19H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12v3.5M15 11h5v4h-5a2 2 0 0 1 0-4z\"></path></svg></span>"
      },
      {
        "tab": "einstellungen",
        "label": "Gesamtkosten",
        "ariaLabel": "Gesamtkosten",
        "requiresBilling": true,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewbox=\"0 0 24 24\"><path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2M9 7h6M9 11h6M9 15h4\"></path></svg></span>"
      },
      {
        "tab": "manuellewerte",
        "label": "Individuelle Werte",
        "ariaLabel": "Individuelle Werte",
        "requiresBilling": true,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewbox=\"0 0 24 24\"><path d=\"M4 4h10v16H4zM8 8h2M8 12h2M8 16h2M14 12h7M18 9l3 3-3 3\"></path></svg></span>"
      },
      {
        "tab": "umlage",
        "label": "Abrechnungsergebnis",
        "ariaLabel": "Abrechnungsergebnis",
        "requiresBilling": true,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewbox=\"0 0 24 24\"><circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><path d=\"m8.6 10.5 6.8-4M8.6 13.5l6.8 4\"></path></svg></span>"
      },
      {
        "tab": "qualitaet",
        "label": "Prüfung & Freigabe",
        "ariaLabel": "Prüfung & Freigabe",
        "requiresBilling": true,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewbox=\"0 0 24 24\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10M8.5 12l2.2 2.2 4.8-5.4\"></path></svg></span>"
      },
      {
        "tab": "briefe",
        "label": "Briefe",
        "ariaLabel": "Briefe",
        "requiresBilling": true,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\" viewbox=\"0 0 24 24\"><rect height=\"14\" rx=\"2\" width=\"18\" x=\"3\" y=\"5\"></rect><path d=\"m3 7 9 6 9-6\"></path></svg></span>"
      }
    ]
  },
  {
    "key": "archive",
    "storageKey": "group-archive",
    "panelId": "nav-group-archive",
    "label": "Archiv",
    "icon": "",
    "items": [
      {
        "tab": "archiv",
        "label": "Archivübersicht",
        "ariaLabel": "Archivübersicht",
        "requiresBilling": false,
        "icon": "<span aria-hidden=\"true\" class=\"nav-item-icon\"><svg aria-hidden=\"true\" class=\"nav-icon-svg\" fill=\"none\" viewbox=\"0 0 24 24\"><path d=\"M4 7h16v13H4z\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><path d=\"M3 3h18v4H3z\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path><line stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.8\" x1=\"9\" x2=\"15\" y1=\"12\" y2=\"12\"></line></svg></span>"
      }
    ]
  }
].map(function (group) {
    return Object.freeze(Object.assign({}, group, {items:Object.freeze(group.items.map(function (item) { return Object.freeze(item); }))}));
  }));
  const GROUP_KEYS = Object.freeze(NAVIGATION_GROUPS.map(function (group) { return group.storageKey; }));
  const BILLING_CONTEXT_TABS = Object.freeze(["start","mieter","einnahmen","einstellungen","manuellewerte","umlage","qualitaet","vorauszahlungsanpassung","briefe","export","archiv"]);
  const COMPATIBILITY_TAB_PATHS = Object.freeze({
    objektuebersicht:"group-object", verbraeuche:"group-billing", vorauszahlungsanpassung:"group-billing", export:"group-billing", sicherung:"group-billing"
  });
  const TAB_PATHS = Object.freeze(Object.assign({}, COMPATIBILITY_TAB_PATHS, NAVIGATION_GROUPS.reduce(function (paths, group) {
    group.items.forEach(function (item) { paths[item.tab] = group.storageKey; });
    return paths;
  }, {})));
  const NAV_CHEVRON = '<span aria-hidden="true" class="nav-group-chevron"><svg aria-hidden="true" class="nav-chevron-svg" fill="none" viewBox="0 0 24 24"><path d="m9 10 3 3 3-3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg></span>';

  function escapeAttribute(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function renderNavigationMarkup() {
    const root = document.querySelector("[data-navigation-render-root]");
    if (!root) return false;
    root.innerHTML = NAVIGATION_GROUPS.map(function (group) {
      const items = group.items.map(function (item) {
        const ariaLabel = item.ariaLabel ? ' aria-label="' + escapeAttribute(item.ariaLabel) + '"' : "";
        const requiresBilling = item.requiresBilling ? ' data-requires-billing="true"' : "";
        return `<button${ariaLabel} class="tab-btn nav-group-item" data-nav-group="${escapeAttribute(group.key)}"${requiresBilling} data-tab="${escapeAttribute(item.tab)}" data-ui-action="navigation.switchTab" data-ui-args='[{"dataset":"tab"}]' type="button">${item.icon}<span class="nav-item-label">${escapeAttribute(item.label)}</span><span aria-hidden="true" class="nav-active-marker"></span></button>`;
      }).join("");
      return `<section class="nav-group" data-nav-group-section="${escapeAttribute(group.key)}"><button aria-controls="${escapeAttribute(group.panelId)}" aria-expanded="true" class="nav-group-toggle" data-nav-toggle="${escapeAttribute(group.storageKey)}" type="button">${group.icon}<span class="nav-group-label">${escapeAttribute(group.label)}</span>${NAV_CHEVRON}</button><div class="nav-group-children" id="${escapeAttribute(group.panelId)}">${items}</div></section>`;
    }).join("");
    return true;
  }
  let openGroups = loadOpenGroups();
  let initialized = false;
  let contextProvider = Object.freeze({});

  function configure(provider = {}) {
    contextProvider = Object.freeze({
      currentYear:typeof provider.currentYear === "function" ? provider.currentYear : null,
      billingPeriodLabel:typeof provider.billingPeriodLabel === "function" ? provider.billingPeriodLabel : null,
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
      for (const legacyKey of LEGACY_NAV_GROUP_STORAGE_KEYS) {
        const legacy = preferences.get(legacyKey);
        if (!legacy) continue;
        if (legacyKey.endsWith(".v5")) {
          const parsed = JSON.parse(legacy);
          const values = Array.isArray(parsed) ? parsed : Object.keys(parsed || {}).filter(key => parsed[key]);
          return new Set([...values.filter(key => GROUP_KEYS.includes(key)), "group-archive"]);
        }
        if (GROUP_KEYS.includes(legacy)) return new Set([legacy, "group-archive"]);
      }
    } catch(error) {}
    return new Set(GROUP_KEYS);
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
    const code = document.querySelector("[data-global-billing-code]");
    const period = document.querySelector("[data-global-billing-period]");
    const status = document.querySelector("[data-global-billing-status]");
    const closeAction = document.querySelector("[data-global-billing-close]");
    const overviewAction = document.querySelector("[data-global-billing-overview]");
    const billingPeriod = String(valueFromProvider("billingPeriodLabel", "") || "");
    const objectLabel = valueFromProvider("objectLabel", "Objekt") || "Objekt";
    const archive = !!valueFromProvider("isArchiveViewer", false);
    const finalized = !!valueFromProvider("isFinalized", false);
    const contextOpen = !!valueFromProvider("isContextOpen", false);
    const active = document.querySelector("section.tab.active");
    const activeId = active && active.id || "";
    const relevantPage = BILLING_CONTEXT_TABS.includes(activeId);
    if (bar) {
      bar.hidden = !relevantPage;
      bar.classList.toggle("is-empty", !contextOpen);
      bar.classList.toggle("is-readonly", contextOpen && global.NKProBillingContext && global.NKProBillingContext.isReadOnly());
    }
    if (object) object.textContent = contextOpen ? objectLabel : "Keine Abrechnung geöffnet";
    if (code) code.textContent = contextOpen ? (typeof global.currentObjectShortCode === "function" ? global.currentObjectShortCode() : "–") : "–";
    if (period) period.textContent = contextOpen ? (billingPeriod || "–") : "–";
    if (status) {
      status.classList.remove("is-archive", "is-finalized", "is-working", "is-none");
      if (!contextOpen) { status.textContent = "Nicht geöffnet"; status.classList.add("is-none"); }
      else if (archive) { status.textContent = "Archiviert"; status.classList.add("is-archive"); }
      else if (finalized) { status.textContent = "Abgeschlossen"; status.classList.add("is-finalized"); }
      else { status.textContent = "In Bearbeitung"; status.classList.add("is-working"); }
    }
    if (closeAction) closeAction.hidden = !contextOpen;
    if (overviewAction) overviewAction.hidden = contextOpen || activeId === "start";
    document.querySelectorAll('[data-requires-billing="true"]').forEach(function (button) {
      button.disabled = false;
      button.setAttribute("aria-disabled", contextOpen ? "false" : "true");
      button.classList.toggle("is-context-disabled", !contextOpen);
      if (!contextOpen) button.setAttribute("title", "Öffnen Sie zuerst eine Abrechnung zur Bearbeitung oder Ansicht.");
      else button.removeAttribute("title");
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
    const bottomCollapse = document.getElementById("sidebarCollapseBottom");
    if (bottomCollapse) bottomCollapse.addEventListener("click", function () { setSidebarCollapsed(true); });
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
    renderNavigationMarkup();
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
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("sidebar-open")) {
        document.body.classList.remove("sidebar-open");
        if (toggle) toggle.focus();
      }
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
  function navigationDefinition() {
    return NAVIGATION_GROUPS;
  }
  function visibleTabIds() {
    return Object.freeze(NAVIGATION_GROUPS.flatMap(function (group) { return group.items.map(function (item) { return item.tab; }); }));
  }
  function describe() {
    const values = GROUP_KEYS.filter(key => openGroups.has(key));
    return Object.freeze({ initialized, openGroups:values, openGroup:values[0] || null, groupCount:GROUP_KEYS.length, visibleTabCount:visibleTabIds().length, configured:Object.values(contextProvider).some(Boolean) });
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
    navigationDefinition,
    visibleTabIds,
    describe
  });
})(globalThis);
