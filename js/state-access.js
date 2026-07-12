(function(global) {
  "use strict";

  let adapter = null;

  function configure(nextAdapter) {
    if (!nextAdapter || typeof nextAdapter.getState !== "function") throw new Error("State-Adapter benötigt getState().");
    if (typeof nextAdapter.replaceState !== "function") throw new Error("State-Adapter benötigt replaceState().");
    adapter = Object.freeze({
      getState:nextAdapter.getState,
      replaceState:nextAdapter.replaceState,
      commit:typeof nextAdapter.commit === "function" ? nextAdapter.commit : null,
      render:typeof nextAdapter.render === "function" ? nextAdapter.render : null
    });
    return describe();
  }

  function requireAdapter() {
    if (!adapter) throw new Error("State-Zugriff wurde noch nicht konfiguriert.");
    return adapter;
  }

  function current() {
    return requireAdapter().getState();
  }

  function select(selector) {
    if (typeof selector !== "function") throw new Error("State-Selektor muss eine Funktion sein.");
    return selector(current());
  }

  function replace(nextState, options = {}) {
    const configured = requireAdapter();
    const result = configured.replaceState(nextState, options);
    if (options.commit !== false && configured.commit) configured.commit(options);
    if (options.render !== false && configured.render) configured.render(options);
    return result;
  }

  function update(mutator, options = {}) {
    if (typeof mutator !== "function") throw new Error("State-Aktion muss eine Funktion sein.");
    const configured = requireAdapter();
    const state = configured.getState();
    const result = mutator(state);
    if (result && result !== state) configured.replaceState(result, options);
    if (options.commit !== false && configured.commit) configured.commit(options);
    if (options.render !== false && configured.render) configured.render(options);
    return result;
  }

  function transact(mutator, options = {}) {
    if (typeof mutator !== "function") throw new Error("State-Transaktion muss eine Funktion sein.");
    const configured = requireAdapter();
    const before = typeof structuredClone === "function" ? structuredClone(configured.getState()) : JSON.parse(JSON.stringify(configured.getState()));
    try {
      const result = mutator(configured.getState());
      if (result && result !== configured.getState()) configured.replaceState(result, Object.assign({}, options, { commit:false, render:false }));
      if (options.validate && typeof options.validate === "function") {
        const report = options.validate(configured.getState());
        if (report === false || (report && report.ok === false)) throw new Error((report && report.message) || "State-Validierung fehlgeschlagen.");
      }
      if (options.commit !== false && configured.commit) configured.commit(options);
      if (options.render !== false && configured.render) configured.render(options);
      return result;
    } catch(error) {
      configured.replaceState(before, Object.assign({}, options, { commit:false, render:false }));
      throw error;
    }
  }

  function describe() {
    return Object.freeze({
      configured:!!adapter,
      hasCommit:!!(adapter && adapter.commit),
      hasRender:!!(adapter && adapter.render)
    });
  }

  global.NKProStateAccess = Object.freeze({ configure, current, select, replace, update, transact, describe });
})(globalThis);
