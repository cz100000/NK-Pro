(function(global) {
  "use strict";

  const controllers = new Map();
  const actions = new Map();

  function registerController(name, definition) {
    const controllerName = String(name || "").trim();
    if (!controllerName) throw new Error("UI-Controller benötigt einen Namen.");
    if (!definition || typeof definition !== "object") throw new Error("UI-Controller benötigt eine Definition.");
    if (controllers.has(controllerName)) throw new Error("UI-Controller ist bereits registriert: " + controllerName);

    const actionEntries = Object.entries(definition.actions || {});
    const actionNames = [];
    actionEntries.forEach(([actionName, handler]) => {
      const normalized = String(actionName || "").trim();
      if (!normalized || typeof handler !== "function") throw new Error("Ungültige UI-Aktion in " + controllerName + ".");
      if (actions.has(normalized)) throw new Error("UI-Aktion ist bereits registriert: " + normalized);
      actions.set(normalized, Object.freeze({ controllerName, handler }));
      actionNames.push(normalized);
    });

    const entry = Object.freeze({
      name:controllerName,
      responsibility:String(definition.responsibility || ""),
      actionNames:Object.freeze(actionNames),
      actionCount:actionNames.length
    });
    controllers.set(controllerName, entry);
    return entry;
  }

  function dispatch(actionName, context = {}) {
    const normalized = String(actionName || "").trim();
    const action = actions.get(normalized);
    if (!action) throw new Error("Unbekannte UI-Aktion: " + normalized);
    return action.handler(Object.freeze({
      action:normalized,
      controller:action.controllerName,
      event:context.event || null,
      element:context.element || null,
      args:Array.isArray(context.args) ? context.args : [],
      value:Object.prototype.hasOwnProperty.call(context, "value") ? context.value : undefined,
      checked:Object.prototype.hasOwnProperty.call(context, "checked") ? context.checked : undefined,
      files:context.files || null,
      key:context.key || ""
    }));
  }

  function hasAction(actionName) {
    return actions.has(String(actionName || "").trim());
  }

  function describe() {
    return Object.freeze(Array.from(controllers.values()));
  }

  global.NKProUiController = Object.freeze({ registerController, dispatch, hasAction, describe });
})(globalThis);
