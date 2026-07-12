(function(global) {
  "use strict";

  function storageFrom(options) {
    if (options && options.storage) return options.storage;
    return typeof global.localStorage !== "undefined" ? global.localStorage : null;
  }

  function get(key, fallback = null, options = {}) {
    try {
      const storage = storageFrom(options);
      if (!storage) return fallback;
      const value = storage.getItem(String(key));
      return value === null ? fallback : value;
    } catch(error) {
      return fallback;
    }
  }

  function set(key, value, options = {}) {
    try {
      const storage = storageFrom(options);
      if (!storage) return false;
      storage.setItem(String(key), String(value));
      return true;
    } catch(error) {
      return false;
    }
  }

  function remove(key, options = {}) {
    try {
      const storage = storageFrom(options);
      if (!storage) return false;
      storage.removeItem(String(key));
      return true;
    } catch(error) {
      return false;
    }
  }

  function getBoolean(key, fallback = false, options = {}) {
    const value = get(key, fallback ? "1" : "0", options);
    return value === "1" || value === "true";
  }

  function setBoolean(key, value, options = {}) {
    return set(key, value ? "1" : "0", options);
  }

  global.NKProUiPreferences = Object.freeze({ get, set, remove, getBoolean, setBoolean });
})(globalThis);
