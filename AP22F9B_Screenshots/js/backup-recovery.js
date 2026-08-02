(function (global) {
  "use strict";

  const BACKUP_FORMAT = "nk-pro-backup-envelope";
  const BACKUP_FORMAT_VERSION = 1;

  function cloneWith(options, value) {
    return options && typeof options.clone === "function"
      ? options.clone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function nowWith(options) {
    return (options && typeof options.now === "function" ? options.now : () => new Date().toISOString())();
  }

  function hashWith(options, value) {
    if (options && typeof options.hash === "function") return options.hash(String(value));
    let hash = 0x811c9dc5;
    const text = String(value ?? "");
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.keys(value).forEach(key => deepFreeze(value[key]));
    return value;
  }

  function backupId(options, createdAt, payloadChecksum) {
    if (options && options.backupId) return String(options.backupId);
    let nonce = "";
    try {
      if (global.crypto && typeof global.crypto.randomUUID === "function") nonce = global.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    } catch (error) {}
    if (!nonce) nonce = Math.random().toString(36).slice(2, 14);
    const stamp = String(createdAt).replace(/[^0-9]/g, "").slice(0, 14);
    return ["nkpro", options && options.backupType || "backup", stamp, payloadChecksum, nonce].join("-");
  }

  function metadataWithoutChecksum(metadata, options = {}) {
    const copy = cloneWith(options, metadata || {});
    delete copy.metadataChecksum;
    return copy;
  }

  function envelopeWithoutChecksum(envelope, options = {}) {
    return {
      format:envelope && envelope.format,
      formatVersion:envelope && envelope.formatVersion,
      metadata:cloneWith(options, envelope && envelope.metadata || {}),
      data:cloneWith(options, envelope && envelope.data)
    };
  }

  function createBackupEnvelope(data, options = {}) {
    const payload = cloneWith(options, data);
    const createdAt = nowWith(options);
    const payloadChecksum = hashWith(options, JSON.stringify(payload));
    const metadata = {
      backupId:backupId(options, createdAt, payloadChecksum),
      backupType:String(options.backupType || "manualBackup"),
      createdAt,
      sourceAppVersion:String(options.sourceAppVersion || ""),
      sourceSchemaVersion:Number(options.sourceSchemaVersion || 1),
      targetSchemaVersion:Number(options.targetSchemaVersion || options.sourceSchemaVersion || 1),
      dataLayerContractVersion:Number(options.dataLayerContractVersion || 1),
      sourceStorageKey:String(options.sourceStorageKey || ""),
      reason:String(options.reason || ""),
      migrationPath:Array.isArray(options.migrationPath) ? options.migrationPath.map(String) : [],
      payloadChecksum,
      checksumAlgorithm:String(options.checksumAlgorithm || "FNV1A32")
    };
    metadata.metadataChecksum = hashWith(options, JSON.stringify(metadataWithoutChecksum(metadata, options)));
    const envelope = {
      format:BACKUP_FORMAT,
      formatVersion:BACKUP_FORMAT_VERSION,
      metadata,
      data:payload
    };
    envelope.envelopeChecksum = hashWith(options, JSON.stringify(envelopeWithoutChecksum(envelope, options)));
    return deepFreeze(envelope);
  }

  function validateBackupEnvelope(envelope, options = {}) {
    const errors = [];
    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) errors.push("Sicherungshülle fehlt oder ist ungültig.");
    if (errors.length) return { valid:false, errors, warnings:[] };
    if (envelope.format !== BACKUP_FORMAT) errors.push("Unbekanntes Sicherungsformat.");
    if (Number(envelope.formatVersion) !== BACKUP_FORMAT_VERSION) errors.push("Nicht unterstützte Sicherungsformat-Version.");
    const metadata = envelope.metadata;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) errors.push("Sicherungsmetadaten fehlen.");
    if (!Object.prototype.hasOwnProperty.call(envelope, "data")) errors.push("Sicherungsdaten fehlen.");
    if (errors.length) return { valid:false, errors, warnings:[] };

    const required = ["backupId", "backupType", "createdAt", "payloadChecksum", "metadataChecksum", "checksumAlgorithm"];
    required.forEach(key => { if (!String(metadata[key] || "").trim()) errors.push("Sicherungsmetadatum fehlt: " + key); });
    if (!Number.isFinite(Date.parse(String(metadata.createdAt || "")))) errors.push("Erstellungszeit der Sicherung ist ungültig.");
    for (const key of ["sourceSchemaVersion", "targetSchemaVersion", "dataLayerContractVersion"]) {
      if (!Number.isFinite(Number(metadata[key])) || Number(metadata[key]) < 1) errors.push("Sicherungsmetadatum ist ungültig: " + key);
    }
    if (!Array.isArray(metadata.migrationPath)) errors.push("Migrationspfad der Sicherung ist ungültig.");
    const expectedAlgorithm = String(options.checksumAlgorithm || "FNV1A32");
    if (metadata.checksumAlgorithm !== expectedAlgorithm) errors.push("Nicht unterstütztes Prüfsummenverfahren: " + metadata.checksumAlgorithm);
    if (typeof options.schemaVersionOfData === "function") {
      const actualSourceSchemaVersion = Number(options.schemaVersionOfData(envelope.data));
      if (Number.isFinite(actualSourceSchemaVersion) && actualSourceSchemaVersion !== Number(metadata.sourceSchemaVersion)) {
        errors.push("Quellschema der Sicherungsmetadaten stimmt nicht mit den Nutzdaten überein.");
      }
    }
    const actualPayloadChecksum = hashWith(options, JSON.stringify(envelope.data));
    const actualMetadataChecksum = hashWith(options, JSON.stringify(metadataWithoutChecksum(metadata, options)));
    const actualEnvelopeChecksum = hashWith(options, JSON.stringify(envelopeWithoutChecksum(envelope, options)));
    if (actualPayloadChecksum !== metadata.payloadChecksum) errors.push("Nutzdaten-Prüfsumme stimmt nicht überein.");
    if (actualMetadataChecksum !== metadata.metadataChecksum) errors.push("Metadaten-Prüfsumme stimmt nicht überein.");
    if (actualEnvelopeChecksum !== envelope.envelopeChecksum) errors.push("Gesamt-Prüfsumme stimmt nicht überein.");
    return {
      valid:errors.length === 0,
      errors,
      warnings:[],
      backupId:metadata.backupId,
      backupType:metadata.backupType,
      payloadChecksum:actualPayloadChecksum,
      metadataChecksum:actualMetadataChecksum,
      envelopeChecksum:actualEnvelopeChecksum
    };
  }

  function serializeBackupEnvelope(envelope, options = {}) {
    const validation = validateBackupEnvelope(envelope, options);
    if (!validation.valid) throw new Error("Sicherung ist ungültig: " + validation.errors.join(" "));
    return JSON.stringify(envelope, null, options.pretty === false ? 0 : 2);
  }

  function persistBackupEnvelope(storageKey, envelope, options = {}) {
    if (!storageKey) throw new Error("Speicherschlüssel für Sicherung fehlt.");
    if (!options.persistence || typeof options.persistence.writeRawStorage !== "function") throw new Error("Persistenzadapter für Sicherung fehlt.");
    const text = serializeBackupEnvelope(envelope, { ...options, pretty:false });
    options.persistence.writeRawStorage(storageKey, text, options.persistenceOptions || {});
    return envelope;
  }

  function readBackupEnvelopeResult(storageKey, options = {}) {
    try {
      if (!options.persistence || typeof options.persistence.rawStorageValue !== "function") throw new Error("Persistenzadapter für Sicherung fehlt.");
      const raw = options.persistence.rawStorageValue(storageKey, options.persistenceOptions || {});
      if (!raw) return { valid:false, missing:true, raw:"", envelope:null, errors:[] };
      const envelope = JSON.parse(raw);
      const validation = validateBackupEnvelope(envelope, options);
      return { valid:validation.valid, missing:false, raw, envelope, validation, errors:validation.errors || [] };
    } catch (error) {
      return { valid:false, missing:false, raw:"", envelope:null, error, errors:[String(error && error.message || error)] };
    }
  }

  function restoreBackupEnvelope(envelope, options = {}) {
    const validation = validateBackupEnvelope(envelope, options);
    if (!validation.valid) throw new Error("Sicherung kann nicht wiederhergestellt werden: " + validation.errors.join(" "));
    const data = cloneWith(options, envelope.data);
    if (typeof options.validateData === "function") {
      const result = options.validateData(data, { phase:"restore", envelope });
      const valid = result === true || (result && result.valid !== false && !(result.errors && result.errors.length));
      if (!valid) {
        const messages = result && result.errors && result.errors.length ? result.errors : ["Datenprüfung fehlgeschlagen."];
        throw new Error("Wiederhergestellte Daten sind ungültig: " + messages.join(" "));
      }
    }
    return data;
  }

  function restoreBackupToStorage(storageKey, envelope, options = {}) {
    if (!options.persistence || typeof options.persistence.writeRawStorage !== "function") throw new Error("Persistenzadapter für Restore fehlt.");
    const data = restoreBackupEnvelope(envelope, options);
    options.persistence.writeRawStorage(storageKey, JSON.stringify(data), options.persistenceOptions || {});
    return data;
  }

  global.NKProBackupRecovery = Object.freeze({
    BACKUP_FORMAT,
    BACKUP_FORMAT_VERSION,
    deepFreeze,
    createBackupEnvelope,
    validateBackupEnvelope,
    serializeBackupEnvelope,
    persistBackupEnvelope,
    readBackupEnvelopeResult,
    restoreBackupEnvelope,
    restoreBackupToStorage
  });
})(globalThis);
