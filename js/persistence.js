(function (global) {
  "use strict";

  function cloneWith(options, value) {
    return options && typeof options.clone === "function"
      ? options.clone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function storageFrom(options) {
    if (options && options.storage) return options.storage;
    if (typeof global.localStorage !== "undefined") return global.localStorage;
    throw new Error("Lokaler Browser-Speicher ist nicht verfügbar.");
  }

  function integrityHash(text) {
    const value = String(text ?? "");
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function dataWithoutIntegrity(data, options = {}) {
    const copy = cloneWith(options, data);
    if (!copy.meta) copy.meta = {};
    delete copy.meta.storageIntegrityAlgorithm;
    delete copy.meta.storageIntegrityChecksum;
    delete copy.meta.storageIntegrityProtectedAt;
    delete copy.meta.storageIntegrityProtectedWithAppVersion;
    return copy;
  }

  function calculateDataIntegrity(data, options = {}) {
    return integrityHash(JSON.stringify(dataWithoutIntegrity(data, options)));
  }

  function protectDataForStorage(data, options = {}) {
    const copy = dataWithoutIntegrity(data, options);
    if (!copy.meta) copy.meta = {};
    copy.meta.storageIntegrityAlgorithm = options.integrityAlgorithm || "FNV1A32";
    copy.meta.storageIntegrityProtectedAt = (options.now || (() => new Date().toISOString()))();
    copy.meta.storageIntegrityProtectedWithAppVersion = options.appVersion || "";
    copy.meta.storageIntegrityChecksum = calculateDataIntegrity(copy, options);
    return copy;
  }

  function validateStoredDataIntegrity(data, options = {}) {
    const isAppDataShape = typeof options.isAppDataShape === "function"
      ? options.isAppDataShape
      : value => !!value && typeof value === "object" && !Array.isArray(value);
    if (!isAppDataShape(data)) return { valid:false, protected:false, reason:"Datenstruktur unvollständig" };
    const meta = data.meta || {};
    const checksum = String(meta.storageIntegrityChecksum || "").trim();
    if (!checksum) return { valid:true, protected:false, reason:"Kompatibler ungeschützter Datenstand" };
    const algorithm = options.integrityAlgorithm || "FNV1A32";
    if (meta.storageIntegrityAlgorithm && meta.storageIntegrityAlgorithm !== algorithm) {
      return { valid:false, protected:true, reason:"Unbekanntes Prüfsummenverfahren" };
    }
    const actual = calculateDataIntegrity(data, options);
    return {
      valid:actual === checksum,
      protected:true,
      expected:checksum,
      actual,
      reason:actual === checksum ? "Prüfsumme gültig" : "Prüfsumme stimmt nicht überein"
    };
  }

  function readStoredDataResult(key, options = {}) {
    try {
      const raw = storageFrom(options).getItem(key);
      if (!raw) return { data:null, raw:"", valid:false, missing:true, key };
      const data = JSON.parse(raw);
      const integrity = validateStoredDataIntegrity(data, options);
      return { data, raw, valid:integrity.valid, missing:false, key, integrity };
    } catch (error) {
      return {
        data:null,
        raw:"",
        valid:false,
        missing:false,
        key,
        error,
        integrity:{ valid:false, protected:false, reason:"JSON nicht lesbar" }
      };
    }
  }

  function writeProtectedStorage(key, data, options = {}) {
    const protectedData = protectDataForStorage(data, options);
    storageFrom(options).setItem(key, JSON.stringify(protectedData));
    return protectedData;
  }

  function removeStoredData(keys, options = {}) {
    const storage = storageFrom(options);
    (Array.isArray(keys) ? keys : [keys]).filter(Boolean).forEach(key => storage.removeItem(key));
  }

  function writeRawStorage(key, raw, options = {}) {
    storageFrom(options).setItem(key, String(raw ?? ""));
    return String(raw ?? "");
  }

  function rawStorageValue(key, options = {}) {
    try {
      return storageFrom(options).getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function totalStorageUsageBytes(options = {}) {
    try {
      const storage = storageFrom(options);
      let bytes = 0;
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i) || "";
        const value = storage.getItem(key) || "";
        bytes += (key.length + value.length) * 2;
      }
      return bytes;
    } catch (error) {
      return 0;
    }
  }

  function storageWritable(testKey, options = {}) {
    try {
      const storage = storageFrom(options);
      const key = String(testKey || "nkpro_storage_write_test");
      storage.setItem(key, "1");
      storage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  global.NKProPersistence = Object.freeze({
    integrityHash,
    dataWithoutIntegrity,
    calculateDataIntegrity,
    protectDataForStorage,
    validateStoredDataIntegrity,
    readStoredDataResult,
    writeProtectedStorage,
    removeStoredData,
    writeRawStorage,
    rawStorageValue,
    totalStorageUsageBytes,
    storageWritable
  });
})(globalThis);
