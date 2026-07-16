(function(global) {
  "use strict";

  const VERSION = "1.0.0";

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

  function component(name) {
    return Object.prototype.hasOwnProperty.call(COMPONENTS, name) ? COMPONENTS[name] : null;
  }

  function classNames() {
    return Array.from(arguments).flat().filter(Boolean).join(" ");
  }

  function statusVariant(status) {
    const normalized = String(status || "").trim().toLowerCase();
    if (["ok", "passed", "success", "freigegeben", "vollständig"].includes(normalized)) return "success";
    if (["warning", "warnung", "offen", "unvollständig"].includes(normalized)) return "warning";
    if (["error", "failed", "danger", "fehler", "blockiert"].includes(normalized)) return "danger";
    if (["info", "hinweis", "in-progress", "in_bearbeitung"].includes(normalized)) return "info";
    return "neutral";
  }

  global.NKProUIDesignSystem = Object.freeze({
    version: VERSION,
    tokens: TOKENS,
    components: COMPONENTS,
    component,
    classNames,
    statusVariant
  });
})(globalThis);
