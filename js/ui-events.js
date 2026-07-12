(function(global) {
  "use strict";

  const EVENT_ATTRIBUTES = Object.freeze({
    click:"data-ui-action", change:"data-ui-change", input:"data-ui-input", submit:"data-ui-submit", keydown:"data-ui-keydown"
  });
  const LEGACY_ACTION_MAP = Object.freeze({
    setCostSetting:"cost.setSetting", setNested:"state.setNested", setBillingUnitStatus:"object.setBillingUnitStatus",
    setMasterNested:"object.setMasterNested", setManualInputMode:"billing.setManualInputMode",
    setManualExternalValue:"billing.setManualExternalValue", setPrepaymentValue:"billing.setPrepaymentValue",
    setPrepaymentAdjustmentSetting:"billing.setPrepaymentAdjustmentSetting", setWaterMeterValue:"meter.setWaterValue",
    setGenericMeterValue:"meter.setGenericValue", setWaterMeterSetting:"meter.setWaterSetting", setBriefSetting:"document.setBriefSetting"
  });
  let started = false;
  let rootNode = null;
  let errorHandler = null;
  const listeners = new Map();

  function escapeAttribute(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function attributes(action, args = [], eventType = "click", options = {}) {
    const attribute = EVENT_ATTRIBUTES[eventType] || EVENT_ATTRIBUTES.click;
    const serialized = Array.isArray(args) && args.length ? ' data-ui-args="' + escapeAttribute(JSON.stringify(args)) + '"' : "";
    const key = options.key ? ' data-ui-key="' + escapeAttribute(options.key) + '"' : "";
    const prevent = options.preventDefault ? " data-ui-prevent-default" : "";
    return " " + attribute + '="' + escapeAttribute(action) + '"' + serialized + key + prevent;
  }

  function splitArguments(source) {
    const args = [];
    let current = "", quote = "", escaped = false;
    for (const char of String(source || "")) {
      if (escaped) { current += char; escaped = false; continue; }
      if (char === "\\") { current += char; escaped = true; continue; }
      if (quote) { current += char; if (char === quote) quote = ""; continue; }
      if (char === "'" || char === '"') { quote = char; current += char; continue; }
      if (char === ",") { args.push(current.trim()); current = ""; continue; }
      current += char;
    }
    if (current.trim() || String(source || "").trim()) args.push(current.trim());
    return args;
  }

  function parseLegacyArgument(token) {
    const value = String(token || "").trim();
    if (value === "this.value") return "$value";
    if (value === "this.checked") return "$checked";
    if (value === "this.checked?'Ja':'Nein'" || value === 'this.checked?"Ja":"Nein"') return { checkedValues:["Ja", "Nein"] };
    if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      return value.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    throw new Error("Nicht unterstütztes UI-Argument: " + value);
  }

  function legacyAttributes(expression, eventType = "change") {
    const match = String(expression || "").trim().match(/^([A-Za-z_$][\w$]*)\((.*)\)$/);
    if (!match || !LEGACY_ACTION_MAP[match[1]]) throw new Error("Nicht unterstützte UI-Weiterleitung: " + expression);
    return attributes(LEGACY_ACTION_MAP[match[1]], splitArguments(match[2]).map(parseLegacyArgument), eventType);
  }

  function parseArgs(element) {
    const raw = element && element.getAttribute ? element.getAttribute("data-ui-args") : "";
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("data-ui-args muss ein JSON-Array enthalten.");
    return parsed;
  }

  function resolveArg(value, context) {
    if (value === "$value") return context.value;
    if (value === "$checked") return context.checked;
    if (value === "$files") return context.files;
    if (value === "$key") return context.key;
    if (value && typeof value === "object" && Array.isArray(value.checkedValues)) return context.checked ? value.checkedValues[0] : value.checkedValues[1];
    if (value && typeof value === "object" && value.dataset) return context.element && context.element.dataset ? context.element.dataset[String(value.dataset)] : undefined;
    if (value && typeof value === "object" && value.fromElementId) {
      const source = document.getElementById(String(value.fromElementId));
      return source ? source.value : "";
    }
    return value;
  }

  function reportError(error, context) {
    if (typeof errorHandler === "function") return errorHandler(error, context);
    if (typeof console !== "undefined" && console.error) console.error("NK-Pro UI-Aktion fehlgeschlagen", error, context);
  }

  function matchingElement(event, attribute) {
    const target = event && event.target;
    if (!target || typeof target.closest !== "function") return null;
    const element = target.closest("[" + attribute + "]");
    return element && rootNode && rootNode.contains(element) ? element : null;
  }

  function handle(event) {
    const attribute = EVENT_ATTRIBUTES[event.type];
    if (!attribute) return;
    const element = matchingElement(event, attribute);
    if (!element || element.disabled) return;
    if (element.hasAttribute("data-ui-self-only") && event.target !== element) return;
    const requiredKey = element.getAttribute("data-ui-key");
    if (event.type === "keydown" && requiredKey && event.key !== requiredKey) return;
    const action = element.getAttribute(attribute);
    if (!action) return;
    if (event.type === "click" || event.type === "submit" || element.hasAttribute("data-ui-prevent-default")) event.preventDefault();
    const context = { event, element, value:element.value, checked:!!element.checked, files:element.files || null, key:event.key || "" };
    try {
      const args = parseArgs(element).map(value => resolveArg(value, context));
      global.NKProUiController.dispatch(action, { ...context, args });
    } catch(error) {
      reportError(error, { action, eventType:event.type, element });
    }
  }

  function start(options = {}) {
    if (started) return describe();
    if (!global.NKProUiController) throw new Error("UI-Controller-Modul fehlt.");
    rootNode = options.root || document;
    errorHandler = typeof options.onError === "function" ? options.onError : null;
    Object.keys(EVENT_ATTRIBUTES).forEach(type => {
      const listener = event => handle(event);
      rootNode.addEventListener(type, listener);
      listeners.set(type, listener);
    });
    started = true;
    return describe();
  }

  function describe() {
    return Object.freeze({ started, listenerCount:listeners.size, eventTypes:Object.freeze(Array.from(listeners.keys())), attributes:EVENT_ATTRIBUTES });
  }

  global.NKProUiEvents = Object.freeze({ attributes, legacyAttributes, start, describe });
})(globalThis);
