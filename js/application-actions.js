(function(global) {
  "use strict";

  const domains = Object.create(null);
  let configured = false;

  function freezeResult(domain, action, value) {
    return Object.freeze({ ok:true, domain, action, value });
  }

  function configure(definition = {}) {
    if (configured) return describe();
    Object.entries(definition).forEach(([domain, actions]) => {
      const normalized = Object.create(null);
      Object.entries(actions || {}).forEach(([name, handler]) => {
        if (typeof handler !== "function") throw new Error("Anwendungsaktion benötigt Handler: " + domain + "." + name);
        normalized[name] = handler;
      });
      domains[domain] = Object.freeze(normalized);
    });
    configured = true;
    return describe();
  }

  function execute(domain, action, args = []) {
    if (global.NKProBillingContext) global.NKProBillingContext.allowApplicationAction(domain, action);
    if (!configured) throw new Error("Anwendungsaktionen wurden noch nicht konfiguriert.");
    const group = domains[String(domain || "")];
    const handler = group && group[String(action || "")];
    if (typeof handler !== "function") throw new Error("Unbekannte Anwendungsaktion: " + domain + "." + action);
    return freezeResult(domain, action, handler(...(Array.isArray(args) ? args : [])));
  }

  function has(domain, action) {
    return !!(domains[String(domain || "")] && typeof domains[String(domain || "")][String(action || "")] === "function");
  }

  function describe() {
    const entries = Object.entries(domains).map(([domain, actions]) => Object.freeze({ domain, actions:Object.freeze(Object.keys(actions)), actionCount:Object.keys(actions).length }));
    return Object.freeze({ configured, domains:Object.freeze(entries), actionCount:entries.reduce((sum, entry) => sum + entry.actionCount, 0) });
  }

  global.NKProApplicationActions = Object.freeze({ configure, execute, has, describe });
})(globalThis);
