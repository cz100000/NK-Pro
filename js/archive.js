(function (global) {
  "use strict";

  function cloneWith(options, value) {
    return options && typeof options.clone === "function"
      ? options.clone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function isSnapshotTechnicalMetaKey(key, options = {}) {
    const name = String(key || "");
    const technicalKeys = options.technicalMetaKeys || new Set();
    return technicalKeys.has(name) || name.startsWith("storageIntegrity");
  }

  function snapshotMetaFrom(meta, options = {}) {
    const result = cloneWith(options, meta || {});
    Object.keys(result).forEach(key => {
      if (isSnapshotTechnicalMetaKey(key, options)) delete result[key];
    });
    result.dataSchemaVersion = options.dataSchemaVersion;
    result.dataLayerContractVersion = options.dataLayerContractVersion;
    result.dataLayerRole = options.snapshotScope;
    result.snapshotScope = options.snapshotScope;
    result.snapshotBoundaryVersion = options.dataLayerContractVersion;
    return result;
  }

  function createBoundedBillingSnapshotData(source, options = {}) {
    const input = source && typeof source === "object" && !Array.isArray(source) ? source : {};
    const snapshot = {};
    (options.snapshotDataKeys || []).forEach(key => {
      if (key === "meta") return;
      if (Object.prototype.hasOwnProperty.call(input, key)) snapshot[key] = cloneWith(options, input[key]);
    });
    snapshot.meta = snapshotMetaFrom(input.meta || {}, options);
    return snapshot;
  }

  function hasHistoricalWaterMeterData(value) {
    return !!value && typeof value === "object" && !Array.isArray(value) && Array.isArray(value.units) && value.units.length > 0;
  }

  function adoptHistoricalWaterMeterDataFromArchive(data, options = {}) {
    if (!data || hasHistoricalWaterMeterData(data.waterMeterHistory) || !Array.isArray(data.jahresArchiv)) return false;
    const source = data.jahresArchiv.find(item => hasHistoricalWaterMeterData(item && item.data && item.data.waterMeterHistory));
    if (!source) return false;
    data.waterMeterHistory = cloneWith(options, source.data.waterMeterHistory);
    if (!data.meta) data.meta = {};
    data.meta.historicalWaterMeterDataAdoptedFromArchive = true;
    data.meta.historicalWaterMeterDataAdoptedFromArchiveYear = source.year || "";
    return true;
  }

  function archiveBoundaryFacts(item, options = {}) {
    const data = item && item.data && typeof item.data === "object" && !Array.isArray(item.data) ? item.data : {};
    const meta = data.meta && typeof data.meta === "object" && !Array.isArray(data.meta) ? data.meta : {};
    return {
      nestedArchiveCount:Array.isArray(data.jahresArchiv) ? data.jahresArchiv.length : 0,
      hadArchiveProperty:Object.prototype.hasOwnProperty.call(data, "jahresArchiv"),
      hadMasterCopy:Object.prototype.hasOwnProperty.call(data, "stammdaten"),
      hadHistoryCopy:Object.prototype.hasOwnProperty.call(data, "waterMeterHistory"),
      technicalMetaCount:Object.keys(meta).filter(key => isSnapshotTechnicalMetaKey(key, options)).length
    };
  }

  function normalizeArchiveItem(item, options = {}) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;
    if (!item.meta) item.meta = (item.data && item.data.meta) ? cloneWith(options, item.data.meta) : {};
    if (!item.year) item.year = item.meta.abrechnungsjahr || (item.data && item.data.meta && item.data.meta.abrechnungsjahr) || "";
    if (!item.archivedAt) item.archivedAt = options.todayIso();
    if (!item.periodId) item.periodId = options.archivePeriodId(item);
    if (item.data && !item.data.meta) item.data.meta = cloneWith(options, item.meta || {});
    if (item.data && item.data.meta && !item.data.meta.periodId && item.periodId) item.data.meta.periodId = item.periodId;
    if (item.data && item.data.meta && !item.data.meta.dataSchemaVersion && item.schemaVersion) item.data.meta.dataSchemaVersion = item.schemaVersion;
    return item;
  }

  function prepareArchiveItemForUse(item, options = {}) {
    const archiveItem = normalizeArchiveItem(cloneWith(options, item), options);
    if (archiveItem && archiveItem.data && typeof archiveItem.data === "object" && !Array.isArray(archiveItem.data)) {
      const normalizedData = options.normalizeLegacyData(archiveItem.data, { scope:options.snapshotScope });
      archiveItem.data = createBoundedBillingSnapshotData(normalizedData, options);
      archiveItem.meta = cloneWith(options, archiveItem.data.meta || archiveItem.meta || {});
      if (!archiveItem.year) archiveItem.year = archiveItem.meta.abrechnungsjahr || "";
      archiveItem.periodId = options.archivePeriodId(archiveItem);
      archiveItem.schemaVersion = archiveItem.data.meta && archiveItem.data.meta.dataSchemaVersion
        ? archiveItem.data.meta.dataSchemaVersion
        : options.dataSchemaVersion;
      archiveItem.snapshotScope = options.snapshotScope;
      archiveItem.snapshotBoundaryVersion = options.dataLayerContractVersion;
    }
    return archiveItem;
  }

  function normalizeArchiveCollectionBoundaries(data, options = {}) {
    if (!data || !Array.isArray(data.jahresArchiv)) {
      return { changed:false, archiveItems:0, nestedArchivesRemoved:0, masterCopiesRemoved:0, historyCopiesRemoved:0, technicalMetaFieldsRemoved:0 };
    }
    const stats = { changed:false, archiveItems:data.jahresArchiv.length, nestedArchivesRemoved:0, masterCopiesRemoved:0, historyCopiesRemoved:0, technicalMetaFieldsRemoved:0 };
    data.jahresArchiv = data.jahresArchiv.map(item => {
      const before = archiveBoundaryFacts(item, options);
      const normalized = prepareArchiveItemForUse(item, options);
      stats.nestedArchivesRemoved += before.nestedArchiveCount;
      if (before.hadArchiveProperty) stats.changed = true;
      if (before.hadMasterCopy) { stats.masterCopiesRemoved += 1; stats.changed = true; }
      if (before.hadHistoryCopy) { stats.historyCopiesRemoved += 1; stats.changed = true; }
      if (before.technicalMetaCount) { stats.technicalMetaFieldsRemoved += before.technicalMetaCount; stats.changed = true; }
      if (!item || item.snapshotBoundaryVersion !== options.dataLayerContractVersion || item.snapshotScope !== options.snapshotScope) stats.changed = true;
      return normalized;
    });
    return stats;
  }

  function enforceWorkingStateDataContract(data, options = {}) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { changed:false, archiveItems:0, nestedArchivesRemoved:0, masterCopiesRemoved:0, historyCopiesRemoved:0, technicalMetaFieldsRemoved:0 };
    }
    if (!data.meta) data.meta = {};
    const stats = normalizeArchiveCollectionBoundaries(data, options);
    data.meta.dataLayerContractVersion = options.dataLayerContractVersion;
    data.meta.dataLayerRole = "workingState";
    data.meta.storageRole = options.storageRole || "working";
    if (stats.changed && options.recordMigration !== false) {
      data.meta.snapshotBoundaryMigration = {
        version:options.dataLayerContractVersion,
        migratedAt:(options.now || (() => new Date().toISOString()))(),
        appVersion:options.appVersion || "",
        archiveItems:stats.archiveItems,
        nestedArchivesRemoved:stats.nestedArchivesRemoved,
        masterCopiesRemoved:stats.masterCopiesRemoved,
        historyCopiesRemoved:stats.historyCopiesRemoved,
        technicalMetaFieldsRemoved:stats.technicalMetaFieldsRemoved
      };
    }
    return stats;
  }

  function copyWorkingOperationalMeta(targetMeta, sourceMeta, options = {}) {
    const target = targetMeta || {};
    const source = sourceMeta || {};
    [
      "backupEvents",
      "lastArchiveBackupAt",
      "lastArchiveBackupFile",
      "lastCurrentBillingBackupAt",
      "lastCurrentBillingBackupFile",
      "lastFullBackupAppVersion",
      "lastFullBackupAt",
      "lastFullBackupFile",
      "lastFullBackupType"
    ].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = cloneWith(options, source[key]);
    });
    return target;
  }

  global.NKProArchive = Object.freeze({
    isSnapshotTechnicalMetaKey,
    snapshotMetaFrom,
    createBoundedBillingSnapshotData,
    hasHistoricalWaterMeterData,
    adoptHistoricalWaterMeterDataFromArchive,
    archiveBoundaryFacts,
    normalizeArchiveItem,
    prepareArchiveItemForUse,
    normalizeArchiveCollectionBoundaries,
    enforceWorkingStateDataContract,
    copyWorkingOperationalMeta
  });
})(globalThis);
