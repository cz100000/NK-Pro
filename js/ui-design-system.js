(function(global) {
  "use strict";

  const VERSION = "1.1.0";

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
    status: Object.freeze({ className: "nk-ui-status", variants: Object.freeze(["neutral", "info", "success", "warning", "danger"]) }),
    notice: Object.freeze({ className: "nk-ui-notice", variants: Object.freeze(["info", "success", "warning", "danger"]) }),
    toolbar: Object.freeze({ className: "nk-ui-toolbar", variants: Object.freeze(["default", "compact"]) }),
    dialog: Object.freeze({ className: "nk-ui-dialog", variants: Object.freeze(["default", "danger"]) }),
    emptyState: Object.freeze({ className: "nk-ui-empty-state", variants: Object.freeze(["default"]) })
  });

  const MIGRATION = Object.freeze({
    package: "AP22B",
    components: Object.freeze(["button", "field", "card", "accordion", "status", "notice"]),
    scope: "productive-application-content",
    legacyRemoval: false
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

  function upgrade(root) {
    const target = root || (typeof document !== "undefined" ? document : null);
    const result = Object.freeze({
      button: upgradeButtons(target),
      field: upgradeFields(target),
      card: upgradeCards(target),
      accordion: upgradeAccordions(target),
      status: upgradeStatuses(target),
      notice: upgradeNotices(target)
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
