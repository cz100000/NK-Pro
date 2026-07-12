(function(global) {
  "use strict";

  const registry = new Map();

  function registerModule(moduleName, moduleApi, wrapperNames) {
    if (!moduleName || !moduleApi) throw new Error("Kompatibilitätsmodul und Schnittstelle sind erforderlich.");
    const names = Array.isArray(wrapperNames) ? wrapperNames.slice() : Object.keys(moduleApi);
    names.forEach(name => {
      if (typeof moduleApi[name] !== "function") throw new Error("Kompatibilitätsziel fehlt: " + moduleName + "." + name);
    });
    registry.set(String(moduleName), Object.freeze({
      moduleName:String(moduleName),
      wrapperNames:Object.freeze(names),
      wrapperCount:names.length
    }));
    return registry.get(String(moduleName));
  }

  function describe() {
    return Object.freeze(Array.from(registry.values()));
  }

  function has(moduleName, wrapperName) {
    const entry = registry.get(String(moduleName));
    return !!(entry && entry.wrapperNames.includes(String(wrapperName)));
  }

  global.NKProCompatibility = Object.freeze({ registerModule, describe, has });
})(globalThis);
