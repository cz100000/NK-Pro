(function(global) {
  "use strict";

  const VERSION = "1.3.0";

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
    dialog: Object.freeze({ className: "nk-ui-dialog", variants: Object.freeze(["default", "compact", "wide", "danger"]) }),
    emptyState: Object.freeze({ className: "nk-ui-empty-state", variants: Object.freeze(["no-data", "not-created", "filtered", "loading", "error", "not-applicable", "unavailable"]) })
  });

  const MIGRATION = Object.freeze({
    package: "AP22D",
    components: Object.freeze(["dialog", "emptyState"]),
    scope: "productive-application-content",
    legacyRemoval: false,
    previousPackages: Object.freeze(["AP22A", "AP22B", "AP22C"])
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

  const DIALOG_LAYER_SELECTOR = ".modal-backdrop,.cost-modal-backdrop,dialog.quality-detail-dialog,dialog.nk-ui-dialog";
  const DIALOG_SURFACE_SELECTOR = ".modal-card,.cost-selection-dialog,.cost-price-dialog,.quality-detail-dialog,[role='dialog']";
  const CONTENT_STATE_SELECTOR = ".individual-values-empty,.cost-dialog-empty,[data-nk-ui-state]";
  const DIALOG_EXCLUSION_SELECTOR = ".letter-page,.brief-preview-host,.document-print-window,[data-nk-ui-dialog-skip]";
  const STATE_EXCLUSION_SELECTOR = ".letter-page,.brief-preview-host,.document-print-window,[data-nk-ui-state-skip]";
  const FOCUSABLE_SELECTOR = [
    "a[href]", "button:not([disabled])", "input:not([disabled]):not([type='hidden'])", "select:not([disabled])",
    "textarea:not([disabled])", "[tabindex]:not([tabindex='-1'])", "[contenteditable='true']"
  ].join(",");
  const CONTENT_STATE_TYPES = Object.freeze(["no-data", "not-created", "filtered", "loading", "error", "not-applicable", "unavailable"]);
  const CONTENT_STATE_DEFAULTS = Object.freeze({
    "no-data": Object.freeze({ title:"Keine Daten vorhanden", description:"Für diesen Bereich liegen aktuell keine Daten vor.", icon:"–" }),
    "not-created": Object.freeze({ title:"Noch keine Datensätze angelegt", description:"Sobald ein Datensatz angelegt wurde, erscheint er hier.", icon:"＋" }),
    filtered: Object.freeze({ title:"Keine passenden Ergebnisse", description:"Die aktuelle Suche oder Filterung liefert keine Treffer.", icon:"⌕" }),
    loading: Object.freeze({ title:"Inhalte werden geladen", description:"Bitte warten, bis die Daten vollständig bereitstehen.", icon:"" }),
    error: Object.freeze({ title:"Inhalt konnte nicht geladen werden", description:"Die Daten konnten nicht angezeigt werden. Bitte erneut versuchen.", icon:"!" }),
    "not-applicable": Object.freeze({ title:"Nicht anwendbar", description:"Dieser Inhalt ist für den aktuellen Fall nicht erforderlich.", icon:"–" }),
    unavailable: Object.freeze({ title:"Aktuell nicht verfügbar", description:"Diese Funktion oder dieser Inhalt steht derzeit nicht zur Verfügung.", icon:"×" })
  });

  let observer = null;
  let dialogEventsBound = false;
  let lastFocusedElement = null;
  const activeDialogs = new Map();

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

  function dialogSurface(layer) {
    if (!layer) return null;
    if (layer.tagName === "DIALOG") return layer;
    return layer.querySelector(DIALOG_SURFACE_SELECTOR);
  }

  function dialogLayer(element) {
    if (!element) return null;
    if (element.matches && element.matches(DIALOG_LAYER_SELECTOR)) return element;
    return element.closest ? element.closest(DIALOG_LAYER_SELECTOR) : null;
  }

  function dialogIsExcluded(layer) {
    return !!(layer && layer.closest && layer.closest(DIALOG_EXCLUSION_SELECTOR));
  }

  function dialogIsOpen(layer) {
    if (!layer || dialogIsExcluded(layer)) return false;
    if (layer.tagName === "DIALOG") return layer.hasAttribute("open");
    if (layer.hidden || layer.getAttribute("aria-hidden") === "true") return false;
    if (layer.classList.contains("modal-backdrop")) return layer.classList.contains("show");
    if (layer.classList.contains("cost-modal-backdrop")) return !layer.hidden;
    return false;
  }

  function dialogOption(layer, name, fallback) {
    const surface = dialogSurface(layer);
    const raw = (layer && layer.dataset ? layer.dataset[name] : undefined) || (surface && surface.dataset ? surface.dataset[name] : undefined);
    if (raw == null || raw === "") return fallback;
    return String(raw).toLowerCase() !== "false";
  }

  function visibleFocusableElements(surface) {
    if (!surface) return [];
    return Array.from(surface.querySelectorAll(FOCUSABLE_SELECTOR)).filter(element => {
      if (element.hidden || element.getAttribute("aria-hidden") === "true" || element.getAttribute("aria-disabled") === "true") return false;
      const style = typeof getComputedStyle === "function" ? getComputedStyle(element) : null;
      return !style || (style.display !== "none" && style.visibility !== "hidden");
    });
  }

  function preferredDialogFocus(surface) {
    if (!surface) return null;
    return surface.querySelector("[data-nk-ui-initial-focus]") || visibleFocusableElements(surface)[0] || surface;
  }

  function focusDialog(surface) {
    const target = preferredDialogFocus(surface);
    if (!target || typeof target.focus !== "function") return;
    try { target.focus({ preventScroll:true }); } catch(error) { target.focus(); }
  }

  function restoreDialogFocus(state) {
    const target = state && state.trigger;
    if (!target || !target.isConnected || typeof target.focus !== "function") return;
    global.setTimeout(() => {
      if (topDialogLayer()) return;
      try { target.focus({ preventScroll:true }); } catch(error) { target.focus(); }
    }, 0);
  }

  function activateDialog(layer) {
    if (!layer || activeDialogs.has(layer)) return;
    const surface = dialogSurface(layer);
    if (!surface) return;
    const active = document.activeElement;
    const trigger = active && active !== document.body && !surface.contains(active)
      ? active
      : (lastFocusedElement && lastFocusedElement.isConnected && !surface.contains(lastFocusedElement) ? lastFocusedElement : null);
    activeDialogs.set(layer, Object.freeze({ trigger }));
    layer.dataset.nkUiDialogOpen = "true";
    document.body.classList.add("nk-ui-dialog-open");
    global.setTimeout(() => {
      if (!dialogIsOpen(layer)) return;
      if (!surface.contains(document.activeElement)) focusDialog(surface);
    }, 0);
  }

  function deactivateDialog(layer) {
    if (!layer || !activeDialogs.has(layer)) return;
    const state = activeDialogs.get(layer);
    activeDialogs.delete(layer);
    delete layer.dataset.nkUiDialogOpen;
    if (!topDialogLayer()) document.body.classList.remove("nk-ui-dialog-open");
    restoreDialogFocus(state);
  }

  function allDialogLayers() {
    return typeof document === "undefined" ? [] : Array.from(document.querySelectorAll(DIALOG_LAYER_SELECTOR)).filter(layer => !dialogIsExcluded(layer));
  }

  function topDialogLayer() {
    const open = allDialogLayers().filter(dialogIsOpen);
    return open.length ? open[open.length - 1] : null;
  }

  function syncDialogs() {
    allDialogLayers().forEach(layer => {
      if (dialogIsOpen(layer)) activateDialog(layer);
      else deactivateDialog(layer);
    });
    Array.from(activeDialogs.keys()).forEach(layer => {
      if (!layer.isConnected || !dialogIsOpen(layer)) deactivateDialog(layer);
    });
    return topDialogLayer();
  }

  function dispatchDialogClose(layer, reason, event) {
    const surface = dialogSurface(layer);
    const action = (layer && layer.dataset && layer.dataset.nkUiCloseAction) || (surface && surface.dataset && surface.dataset.nkUiCloseAction) || "";
    if (action && global.NKProUiController && global.NKProUiController.hasAction(action)) {
      global.NKProUiController.dispatch(action, { event:event || null, element:layer, reason:reason || "programmatic" });
      global.setTimeout(syncDialogs, 0);
      return true;
    }
    if (layer && layer.tagName === "DIALOG") {
      if (typeof layer.close === "function" && layer.hasAttribute("open")) layer.close(reason || "cancel");
      else layer.removeAttribute("open");
      syncDialogs();
      return true;
    }
    if (layer) {
      if (layer.classList.contains("modal-backdrop")) layer.classList.remove("show");
      if (layer.classList.contains("cost-modal-backdrop")) layer.hidden = true;
      syncDialogs();
      return true;
    }
    return false;
  }

  function closeDialog(target, options) {
    const layer = dialogLayer(typeof target === "string" ? document.getElementById(target) : target);
    if (!layer) return false;
    const reason = options && options.reason || "programmatic";
    if (reason === "escape" && !dialogOption(layer, "nkUiEscape", true)) return false;
    if (reason === "backdrop" && !dialogOption(layer, "nkUiBackdropClose", false)) return false;
    return dispatchDialogClose(layer, reason, options && options.event);
  }

  function openDialog(target, options) {
    const layer = dialogLayer(typeof target === "string" ? document.getElementById(target) : target);
    if (!layer) return false;
    if (layer.tagName === "DIALOG") {
      if (typeof layer.showModal === "function" && !layer.open) layer.showModal();
      else layer.setAttribute("open", "");
    } else if (layer.classList.contains("modal-backdrop")) layer.classList.add("show");
    else if (layer.classList.contains("cost-modal-backdrop")) layer.hidden = false;
    if (options && options.trigger) lastFocusedElement = options.trigger;
    syncDialogs();
    return true;
  }

  function trapDialogFocus(event, layer) {
    const surface = dialogSurface(layer);
    const focusable = visibleFocusableElements(surface);
    if (!focusable.length) {
      event.preventDefault();
      focusDialog(surface);
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !surface.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !surface.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  function pointOutsideDialog(event, layer) {
    if (!layer || layer.tagName !== "DIALOG" || event.target !== layer) return false;
    const rect = layer.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }

  function bindDialogEvents() {
    if (dialogEventsBound || typeof document === "undefined") return;
    dialogEventsBound = true;
    document.addEventListener("focusin", event => {
      if (!topDialogLayer() && event.target && event.target !== document.body) lastFocusedElement = event.target;
    }, true);
    document.addEventListener("keydown", event => {
      const layer = topDialogLayer();
      if (!layer) return;
      if (event.key === "Tab") {
        trapDialogFocus(event, layer);
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
      closeDialog(layer, { reason:"escape", event });
    }, true);
    document.addEventListener("click", event => {
      const layer = topDialogLayer();
      if (!layer) return;
      const backdropHit = event.target === layer || pointOutsideDialog(event, layer);
      if (!backdropHit) return;
      if (!dialogOption(layer, "nkUiBackdropClose", false)) return;
      event.preventDefault();
      event.stopPropagation();
      closeDialog(layer, { reason:"backdrop", event });
    }, true);
  }

  function upgradeDialogs(root) {
    let count = 0;
    candidatesWithClosest(root, DIALOG_LAYER_SELECTOR).forEach(layer => {
      if (dialogIsExcluded(layer)) return;
      const surface = dialogSurface(layer);
      if (!surface) return;
      if (layer.tagName !== "DIALOG") layer.classList.add("nk-ui-dialog-layer");
      surface.classList.add("nk-ui-dialog");
      const size = (layer.dataset && layer.dataset.nkUiDialogSize) || (surface.dataset && surface.dataset.nkUiDialogSize) || "default";
      if (size !== "default") addVariant(surface, "dialog", size);
      const variant = (layer.dataset && layer.dataset.nkUiDialogVariant) || (surface.dataset && surface.dataset.nkUiDialogVariant) || "default";
      if (variant !== "default") addVariant(surface, "dialog", variant);
      if (surface.tagName !== "DIALOG") {
        if (!surface.hasAttribute("role")) surface.setAttribute("role", "dialog");
        surface.setAttribute("aria-modal", "true");
      }
      if (!surface.hasAttribute("tabindex")) surface.setAttribute("tabindex", "-1");
      surface.querySelectorAll(".cost-dialog-header,.quality-detail-dialog__header,.nk-ui-dialog__header").forEach(element => element.classList.add("nk-ui-dialog__header"));
      surface.querySelectorAll(".cost-dialog-content,.cost-price-dialog-body,.quality-detail-dialog__content,.nk-ui-dialog__body").forEach(element => element.classList.add("nk-ui-dialog__body"));
      surface.querySelectorAll(".modal-actions,.cost-dialog-footer,.quality-detail-dialog__actions,.nk-ui-dialog__footer").forEach(element => element.classList.add("nk-ui-dialog__footer"));
      surface.querySelectorAll("h1,h2,h3").forEach((element, index) => { if (index === 0) element.classList.add("nk-ui-dialog__title"); });
      mark(surface, "dialog");
      count += 1;
    });
    syncDialogs();
    return count;
  }

  function normalizeContentStateType(value) {
    const normalized = String(value || "no-data").trim().toLowerCase();
    return CONTENT_STATE_TYPES.includes(normalized) ? normalized : "no-data";
  }

  function contentStateType(element) {
    if (element.dataset && element.dataset.nkUiState) return normalizeContentStateType(element.dataset.nkUiState);
    if (element.classList.contains("cost-dialog-empty") || element.classList.contains("individual-values-empty")) return "filtered";
    return "no-data";
  }

  function applyContentStateSemantics(element, type) {
    element.classList.add("nk-ui-empty-state", "nk-ui-empty-state--" + type);
    element.dataset.nkUiState = type;
    if (type === "error") element.setAttribute("role", "alert");
    else element.setAttribute("role", "status");
    if (!element.hasAttribute("aria-live")) element.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
    if (type === "loading") element.setAttribute("aria-busy", "true");
    else element.removeAttribute("aria-busy");
    mark(element, "empty-state");
  }

  function upgradeContentStates(root) {
    let count = 0;
    candidatesWithClosest(root, CONTENT_STATE_SELECTOR).forEach(element => {
      if (element.closest(STATE_EXCLUSION_SELECTOR)) return;
      const type = contentStateType(element);
      applyContentStateSemantics(element, type);
      const strong = element.querySelector(":scope > strong");
      const description = element.querySelector(":scope > span,:scope > p");
      if (strong) strong.classList.add("nk-ui-empty-state__title");
      if (description) description.classList.add("nk-ui-empty-state__description");
      if (!strong && !element.querySelector(".nk-ui-empty-state__title")) {
        const original = String(element.textContent || "").trim();
        const defaults = CONTENT_STATE_DEFAULTS[type];
        element.textContent = "";
        const title = document.createElement("strong");
        title.className = "nk-ui-empty-state__title";
        title.textContent = defaults.title;
        const text = document.createElement("p");
        text.className = "nk-ui-empty-state__description";
        text.textContent = original || defaults.description;
        element.append(title, text);
      }
      count += 1;
    });
    return count;
  }

  function createContentState(options) {
    if (typeof document === "undefined") return null;
    const settings = options && typeof options === "object" ? options : {};
    const type = normalizeContentStateType(settings.type);
    const defaults = CONTENT_STATE_DEFAULTS[type];
    const element = document.createElement("div");
    applyContentStateSemantics(element, type);
    const icon = document.createElement("span");
    icon.className = "nk-ui-empty-state__icon" + (type === "loading" ? " nk-ui-empty-state__spinner" : "");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = type === "loading" ? "" : String(settings.icon == null ? defaults.icon : settings.icon);
    const title = document.createElement("strong");
    title.className = "nk-ui-empty-state__title";
    title.textContent = String(settings.title || defaults.title);
    const description = document.createElement("p");
    description.className = "nk-ui-empty-state__description";
    description.textContent = String(settings.description || defaults.description);
    element.append(icon, title, description);
    if (settings.action && settings.action.label) {
      const actions = document.createElement("div");
      actions.className = "nk-ui-empty-state__actions";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nk-ui-button " + (settings.action.variant === "danger" ? "nk-ui-button--danger" : "nk-ui-button--secondary");
      button.textContent = String(settings.action.label);
      if (settings.action.name) button.dataset.uiAction = String(settings.action.name);
      if (Array.isArray(settings.action.args)) button.dataset.uiArgs = JSON.stringify(settings.action.args);
      actions.append(button);
      element.append(actions);
    }
    return element;
  }

  function renderContentState(container, options) {
    const target = typeof container === "string" ? document.getElementById(container) : container;
    if (!target) return null;
    const state = createContentState(options);
    target.replaceChildren(state);
    upgrade(state);
    return state;
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
      toolbar: upgradeToolbars(target),
      dialog: upgradeDialogs(target),
      emptyState: upgradeContentStates(target)
    });
    return result;
  }

  function observe(root) {
    if (observer || typeof MutationObserver !== "function" || !root) return observer;
    const target = root.documentElement || root;
    observer = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === "childList") {
          record.addedNodes.forEach(node => {
            if (node && node.nodeType === 1) upgrade(node);
          });
        }
      });
      syncDialogs();
    });
    observer.observe(target, { childList:true, subtree:true, attributes:true, attributeFilter:["class", "hidden", "open", "aria-hidden"] });
    return observer;
  }

  function disconnect() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
  }

  function init() {
    if (typeof document === "undefined") return Object.freeze({ initialized:false });
    bindDialogEvents();
    const result = upgrade(document);
    observe(document);
    syncDialogs();
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
    dialog: Object.freeze({ open:openDialog, close:closeDialog, sync:syncDialogs, active:topDialogLayer }),
    states: Object.freeze({ types:CONTENT_STATE_TYPES, create:createContentState, render:renderContentState }),
    init
  });

  global.NKProUIDesignSystem = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
    else init();
  }
})(globalThis);
