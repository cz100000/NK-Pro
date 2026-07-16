(function(global) {
  "use strict";

  const VERSION = "1.2.0";

  const TOKENS = Object.freeze({
    color: Object.freeze({
      text: "var(--nk-ui-color-text)",
      textMuted: "var(--nk-ui-color-text-muted)",
      accent: "var(--nk-ui-color-accent)",
      accentSoft: "var(--nk-ui-color-accent-soft)",
      surface: "var(--nk-ui-color-surface)",
      surfaceMuted: "var(--nk-ui-color-surface-muted)",
      border: "var(--nk-ui-color-border)",
      success: "var(--nk-ui-color-success)",
      warning: "var(--nk-ui-color-warning)",
      danger: "var(--nk-ui-color-danger)"
    }),
    spacing: Object.freeze(["2xs", "xs", "sm", "md", "lg", "xl", "2xl"]),
    radius: Object.freeze(["sm", "md", "lg", "pill"]),
    shadow: Object.freeze(["sm", "md"])
  });

  const COMPONENTS = Object.freeze({
    button: Object.freeze({ className: "nk-ui-button", variants: Object.freeze(["primary", "secondary", "danger", "ghost", "icon"]) }),
    field: Object.freeze({ className: "nk-ui-field", variants: Object.freeze(["default", "invalid", "disabled", "readonly"]) }),
    card: Object.freeze({ className: "nk-ui-card", variants: Object.freeze(["default", "muted", "interactive"]) }),
    accordion: Object.freeze({ className: "nk-ui-accordion", variants: Object.freeze(["default"]) }),
    table: Object.freeze({ className: "nk-ui-table", variants: Object.freeze(["default", "compact"]) }),
    list: Object.freeze({ className: "nk-ui-list", variants: Object.freeze(["default", "plain", "divided", "definition", "check"]) }),
    status: Object.freeze({ className: "nk-ui-status", variants: Object.freeze(["neutral", "info", "success", "warning", "danger"]) }),
    notice: Object.freeze({ className: "nk-ui-notice", variants: Object.freeze(["info", "success", "warning", "danger"]) }),
    toolbar: Object.freeze({ className: "nk-ui-toolbar", variants: Object.freeze(["default", "compact"]) }),
    dialog: Object.freeze({ className: "nk-ui-dialog", variants: Object.freeze(["default", "danger"]) }),
    emptyState: Object.freeze({ className: "nk-ui-empty-state", variants: Object.freeze(["default"]) })
  });

  const MIGRATION = Object.freeze({
    package: "AP22C",
    components: Object.freeze(["table", "list", "toolbar"]),
    scope: "productive-application-content",
    legacyRemoval: false,
    previousPackages: Object.freeze(["AP22A", "AP22B"])
  });

  const BUTTON_SELECTOR = [
    ".app-main .app-page button",
    ".global-billing-context button",
    ".workspace-header-panel button",
    ".quality-detail-dialog button",
    ".modal-card button",
    ".cost-dialog button",
    ".app-main label.ui-button",
    ".app-main label.file-label",
    ".app-main label.individual-file-label"
  ].join(",");

  const FIELD_SELECTOR = [
    ".app-main .app-page label",
    ".quality-detail-dialog label",
    ".modal-card label",
    ".cost-dialog label"
  ].join(",");

  const CARD_SELECTOR = [
    ".overview-card",
    ".start-box",
    ".meter-inventory-card",
    ".individual-values-summary__metric",
    ".cost-control-metric",
    ".workflow-status-card",
    ".dashboard-value-card",
    ".dashboard-status-panel",
    ".quality-panel",
    ".quality-area-card",
    ".quality-status-card",
    ".system-diagnostic-card",
    ".individual-import-panel",
    ".billing-period-settings-card",
    ".backup-status-box",
    ".finalization-status-box",
    ".brief-preflight-box",
    ".print-hardening-box",
    ".release-audit-box"
  ].join(",");

  const ACCORDION_SELECTOR = ".page-section,.individual-cost-card";

  const STATUS_SELECTOR = [
    ".page-section__badge",
    ".inventory-status",
    ".status",
    ".billing-status-badge",
    ".global-billing-context__status",
    ".global-billing-context__mode",
    ".dummy-badge",
    ".period-badge",
    ".backup-pill",
    ".developer-pill",
    ".preflight-pill",
    ".print-hardening-pill",
    ".audit-pill",
    ".finalization-pill",
    ".special-watch-pill",
    ".acceptance-protocol-pill",
    ".individual-row-status",
    ".individual-cost-status",
    ".workflow-stage__status",
    ".quality-detail-status",
    ".dashboard-value-badge",
    ".special-case-badge"
  ].join(",");

  const NOTICE_SELECTOR = [
    ".hint",
    ".validation-placeholder",
    ".feedback-box",
    ".billing-context-guidance",
    ".manual-source-note",
    ".notice-box",
    ".context-quality-summary",
    ".dummy-status-note",
    ".runtime-error-box"
  ].join(",");

  const TABLE_WRAP_SELECTOR = [
    ".app-main .app-page .table-wrap",
    ".quality-detail-dialog .table-wrap",
    ".modal-card .table-wrap",
    ".cost-dialog .table-wrap"
  ].join(",");

  const TABLE_SELECTOR = [
    ".app-main .app-page table",
    ".quality-detail-dialog table",
    ".modal-card table",
    ".cost-dialog table"
  ].join(",");

  const LIST_SELECTOR = [
    ".global-billing-context__facts",
    ".app-main .app-page .overview-card__checklist",
    ".app-main .app-page .context-quality-list",
    ".app-main .app-page .quality-value-list",
    ".app-main .app-page .quality-detail-grid",
    ".app-main .app-page .cost-metric-list",
    ".app-main .app-page .cost-check-list",
    ".app-main .app-page .brief-preflight-list",
    ".app-main .app-page .print-hardening-list",
    ".app-main .app-page .individual-import-errors ul",
    ".app-main .app-page .individual-no-input dl",
    ".app-main .app-page .feedback-box ul",
    ".app-main .app-page .runtime-error-box ul",
    ".app-main .app-page .small > ul"
  ].join(",");

  const TOOLBAR_SELECTOR = [
    ".app-main .app-page .table-tools",
    ".app-main .app-page .cost-table-toolbar",
    ".app-main .app-page .individual-values-toolbar",
    ".app-main .app-page .quality-filter-bar",
    ".app-main .app-page .start-record-primary-actions",
    ".app-main .app-page .start-record-utility-actions",
    ".app-main .app-page #archivePrimaryActions",
    ".app-main .app-page #archiveUtilityActions"
  ].join(",");

  let observer = null;

  function component(name) {
    return Object.prototype.hasOwnProperty.call(COMPONENTS, name) ? COMPONENTS[name] : null;
  }

  function classNames() {
    return Array.from(arguments).flat().filter(Boolean).join(" ");
  }

  function normalizeStatus(status) {
    return String(status || "")
      .trim()
      .toLowerCase()
      .replace(/[ä]/g, "ae")
      .replace(/[ö]/g, "oe")
      .replace(/[ü]/g, "ue")
      .replace(/[ß]/g, "ss")
      .replace(/[\s_-]+/g, " ");
  }

  function statusVariant(status) {
    const normalized = normalizeStatus(status);
    if (["ok", "passed", "success", "freigegeben", "vollstaendig", "bereit", "abgeschlossen", "aktiv"].includes(normalized)) return "success";
    if (["warning", "warnung", "offen", "unvollstaendig", "pruefen", "kontrolle", "ausstehend"].includes(normalized)) return "warning";
    if (["error", "failed", "danger", "fehler", "fehlerhaft", "blockiert", "ungueltig"].includes(normalized)) return "danger";
    if (["info", "hinweis", "in progress", "in bearbeitung", "bearbeitung", "working", "geoeffnet"].includes(normalized)) return "info";
    return "neutral";
  }

  function candidates(root, selector) {
    const result = [];
    if (!root || !selector) return result;
    if (root.nodeType === 1 && typeof root.matches === "function" && root.matches(selector)) result.push(root);
    if (typeof root.querySelectorAll === "function") result.push(...root.querySelectorAll(selector));
    return result;
  }

  function candidatesWithClosest(root, selector) {
    const result = candidates(root, selector);
    if (root && root.nodeType === 1 && typeof root.closest === "function") {
      const closest = root.closest(selector);
      if (closest && !result.includes(closest)) result.unshift(closest);
    }
    return result;
  }

  function hasAnyClass(element, names) {
    return names.some(name => element.classList.contains(name));
  }

  function addVariant(element, componentName, variant) {
    if (!variant || variant === "neutral" || variant === "default") return;
    element.classList.add("nk-ui-" + componentName + "--" + variant);
  }

  function mark(element, componentName) {
    element.dataset.nkUiComponent = componentName;
  }

  function upgradeButtons(root) {
    let count = 0;
    candidates(root, BUTTON_SELECTOR).forEach(element => {
      if (element.matches(".landing-choice,.dashboard-entry,.workflow-stage,.cost-choice-item,.cost-row-menu,.cost-show-more,[data-nk-ui-skip]")) return;
      element.classList.add("nk-ui-button");
      if (hasAnyClass(element, ["primary", "ui-button--primary", "page-header__save-button", "cost-save-button"])) addVariant(element, "button", "primary");
      else if (hasAnyClass(element, ["danger", "ui-button--danger"])) addVariant(element, "button", "danger");
      else if (hasAnyClass(element, ["ui-button--quiet", "link-button"])) addVariant(element, "button", "ghost");
      else addVariant(element, "button", "secondary");
      if (hasAnyClass(element, ["ui-button--icon", "cost-dialog-close"]) || element.getAttribute("data-icon-only") === "true") addVariant(element, "button", "icon");
      mark(element, "button");
      count += 1;
    });
    return count;
  }

  function upgradeFields(root) {
    let count = 0;
    candidates(root, FIELD_SELECTOR).forEach(element => {
      if (element.matches(".file-label,.ui-button,.individual-file-label,.brief-toolbar-switch,.tenant-toggle,.cost-picker-item,.cost-row-checkbox,.cost-select-all-checkbox,[data-nk-ui-skip]")) return;
      const controls = Array.from(element.querySelectorAll("input,select,textarea"));
      const fieldControls = controls.filter(control => !["checkbox", "radio", "file", "hidden", "button", "submit"].includes(String(control.type || "").toLowerCase()));
      if (!fieldControls.length) return;
      element.classList.add("nk-ui-field");
      const label = Array.from(element.children).find(child => child.tagName === "SPAN" && !child.matches(".hint,.small,.nk-ui-field__hint,.nk-ui-field__error"));
      if (label) label.classList.add("nk-ui-field__label");
      const invalid = fieldControls.some(control => control.getAttribute("aria-invalid") === "true" || control.matches(":invalid"));
      const disabled = fieldControls.every(control => control.disabled);
      const readonly = fieldControls.every(control => control.readOnly || control.getAttribute("aria-readonly") === "true");
      if (invalid) element.classList.add("nk-ui-field--invalid");
      if (disabled) element.classList.add("nk-ui-field--disabled");
      if (readonly) element.classList.add("nk-ui-field--readonly");
      mark(element, "field");
      count += 1;
    });
    return count;
  }

  function upgradeCards(root) {
    let count = 0;
    candidates(root, CARD_SELECTOR).forEach(element => {
      element.classList.add("nk-ui-card");
      if (element.matches(".dashboard-status-panel,.backup-status-box,.finalization-status-box,.brief-preflight-box,.print-hardening-box,.release-audit-box")) addVariant(element, "card", "muted");
      if (element.matches("button,a,[role='button'],.overview-card[data-action],.meter-inventory-card[data-action]")) addVariant(element, "card", "interactive");
      mark(element, "card");
      count += 1;
    });
    return count;
  }

  function upgradeAccordions(root) {
    let count = 0;
    candidates(root, ACCORDION_SELECTOR).forEach(element => {
      element.classList.add("nk-ui-accordion");
      const body = Array.from(element.children).find(child => child.matches(".page-section__body,.individual-cost-card__body"));
      if (body) body.classList.add("nk-ui-accordion__body");
      mark(element, "accordion");
      count += 1;
    });
    return count;
  }

  function variantFromElement(element, fallbackText) {
    const signature = Array.from(element.classList).join(" ") + " " + String(fallbackText || element.textContent || "");
    const normalized = normalizeStatus(signature);
    if (/\b(err|error|danger|fehler|blockiert|invalid|critical)\b/.test(normalized)) return "danger";
    if (/\b(warn|warning|offen|unvollstaendig|pruefen|pending|ausstehend)\b/.test(normalized)) return "warning";
    if (/\b(ok|success|complete|vollstaendig|freigegeben|bereit|abgeschlossen)\b/.test(normalized)) return "success";
    if (/\b(info|hinweis|working|bearbeitung|progress|blue)\b/.test(normalized)) return "info";
    return statusVariant(element.textContent);
  }

  function upgradeStatuses(root) {
    let count = 0;
    candidates(root, STATUS_SELECTOR).forEach(element => {
      element.classList.add("nk-ui-status");
      addVariant(element, "status", variantFromElement(element));
      mark(element, "status");
      count += 1;
    });
    return count;
  }

  function upgradeNotices(root) {
    let count = 0;
    candidates(root, NOTICE_SELECTOR).forEach(element => {
      element.classList.add("nk-ui-notice");
      let variant = variantFromElement(element);
      if (variant === "neutral") variant = "info";
      addVariant(element, "notice", variant);
      mark(element, "notice");
      count += 1;
    });
    return count;
  }

  function tableIsExcluded(table) {
    return !!table.closest(".letter-page,.brief-preview-host,.document-print-window,[data-nk-ui-table-skip]");
  }

  function upgradeTables(root) {
    let count = 0;
    candidatesWithClosest(root, TABLE_WRAP_SELECTOR).forEach(wrapper => {
      if (wrapper.closest(".letter-page,.brief-preview-host,.document-print-window,[data-nk-ui-table-skip]")) return;
      wrapper.classList.add("nk-ui-table-wrap");
      wrapper.dataset.nkUiComponent = "table-wrap";
    });
    candidatesWithClosest(root, TABLE_SELECTOR).forEach(table => {
      if (tableIsExcluded(table)) return;
      table.classList.add("nk-ui-table");
      const wrapper = table.closest(".table-wrap");
      if (wrapper && (wrapper.classList.contains("dashboard-table") || wrapper.classList.contains("cost-mockup-table-wrap"))) {
        addVariant(table, "table", "compact");
      }
      table.querySelectorAll("thead th:not([scope])").forEach(cell => cell.setAttribute("scope", "col"));
      table.querySelectorAll("tbody th:not([scope])").forEach(cell => cell.setAttribute("scope", "row"));
      mark(table, "table");
      count += 1;
    });
    return count;
  }

  function listVariant(element) {
    if (element.tagName === "DL") return "definition";
    if (element.matches(".context-quality-list,.quality-detail-grid")) return "divided";
    if (element.matches(".overview-card__checklist,.cost-check-list,.brief-preflight-list,.print-hardening-list")) return "check";
    if (element.matches(".global-billing-context__facts,.cost-metric-list,.quality-value-list")) return "plain";
    return "default";
  }

  function upgradeLists(root) {
    let count = 0;
    candidates(root, LIST_SELECTOR).forEach(element => {
      if (element.closest(".letter-page,.brief-preview-host,.document-print-window,[data-nk-ui-list-skip]")) return;
      element.classList.add("nk-ui-list");
      addVariant(element, "list", listVariant(element));
      mark(element, "list");
      count += 1;
    });
    return count;
  }

  function upgradeToolbars(root) {
    let count = 0;
    candidates(root, TOOLBAR_SELECTOR).forEach(element => {
      element.classList.add("nk-ui-toolbar");
      if (element.matches(".table-tools,.quality-filter-bar,.start-record-utility-actions,#archiveUtilityActions")) {
        addVariant(element, "toolbar", "compact");
      }
      element.querySelectorAll(":scope > .cost-toolbar-left,:scope > .cost-toolbar-right,:scope > .individual-values-filters").forEach(group => {
        group.classList.add("nk-ui-toolbar__group");
      });
      element.querySelectorAll('input[type="search"]').forEach(input => input.classList.add("nk-ui-toolbar__search"));
      mark(element, "toolbar");
      count += 1;
    });
    return count;
  }

  function upgrade(root) {
    const target = root || (typeof document !== "undefined" ? document : null);
    const result = Object.freeze({
      button: upgradeButtons(target),
      field: upgradeFields(target),
      card: upgradeCards(target),
      accordion: upgradeAccordions(target),
      status: upgradeStatuses(target),
      notice: upgradeNotices(target),
      table: upgradeTables(target),
      list: upgradeLists(target),
      toolbar: upgradeToolbars(target)
    });
    return result;
  }

  function observe(root) {
    if (observer || typeof MutationObserver !== "function" || !root) return observer;
    const target = root.documentElement || root;
    observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node && node.nodeType === 1) upgrade(node);
        });
      });
    });
    observer.observe(target, { childList:true, subtree:true });
    return observer;
  }

  function disconnect() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
  }

  function init() {
    if (typeof document === "undefined") return Object.freeze({ initialized:false });
    const result = upgrade(document);
    observe(document);
    document.documentElement.dataset.nkUiReady = VERSION;
    return Object.freeze({ initialized:true, upgraded:result });
  }

  const api = Object.freeze({
    version: VERSION,
    tokens: TOKENS,
    components: COMPONENTS,
    migration: MIGRATION,
    component,
    classNames,
    statusVariant,
    upgrade,
    observe,
    disconnect,
    init
  });

  global.NKProUIDesignSystem = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
    else init();
  }
})(globalThis);
