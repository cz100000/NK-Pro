"use strict";

// AP12: Zustandsgrenzen, Persistenz, Migration, Sicherung und Importnormalisierung.
function initializeApplicationState() {
  if (state) return state;
  return replaceApplicationState(loadInitialState());
}

function replaceApplicationState(nextState) {
  if (!nextState || typeof nextState !== "object") throw new Error("Anwendungszustand muss ein Objekt sein.");
  state = nextState;
  return state;
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function withIsolatedState(temporaryState, callback) {
  const previousState = state;
  try {
    replaceApplicationState(temporaryState);
    return callback();
  } finally {
    replaceApplicationState(previousState);
  }
}

function persistenceModuleOptions(overrides = {}) {
  return {
    clone,
    appVersion:APP_VERSION,
    integrityAlgorithm:STORAGE_INTEGRITY_ALGORITHM,
    isAppDataShape,
    ...overrides
  };
}

function backupRecoveryModuleOptions(overrides = {}) {
  return {
    clone,
    hash:integrityHash,
    sourceAppVersion:APP_VERSION,
    dataLayerContractVersion:DATA_LAYER_CONTRACT_VERSION,
    schemaVersionOfData:currentDataSchemaVersion,
    persistence:NK_PRO_MODULES.persistence,
    persistenceOptions:persistenceModuleOptions(),
    ...overrides
  };
}

function validateMigrationData(data, context = {}) {
  const errors = [];
  const warnings = [];
  if (!isAppDataShape(data)) errors.push("NK-Pro-Kernstruktur mit Wohnungen, Mietern und Kostenarten fehlt.");
  const version = currentDataSchemaVersion(data);
  if (version > DATA_SCHEMA_VERSION) errors.push("Datenschema " + version + " ist neuer als die unterstützte Version " + DATA_SCHEMA_VERSION + ".");
  if ((context.phase === "afterMigration" || context.phase === "restoreCurrent") && version !== DATA_SCHEMA_VERSION) errors.push("Erwartetes Datenschema " + DATA_SCHEMA_VERSION + " wurde nicht erreicht.");
  return { valid:errors.length === 0, errors, warnings };
}

function migrationModuleOptions(overrides = {}) {
  return {
    clone,
    appVersion:APP_VERSION,
    targetSchemaVersion:DATA_SCHEMA_VERSION,
    manualAllocationKey:UMLAGE_MANUAL,
    validateData:validateMigrationData,
    dependencies:{
      ensureUnitIdentityData,
      ensureTenantIdentityFields,
      canonicalUnitIdFor,
      ensureStammdatenData:NK_PRO_MODULES.masterDataActions.ensureStammdatenData,
      normalizeMasterUnitRows:NK_PRO_MODULES.masterDataActions.normalizeMasterUnitRows,
      num
    },
    ...overrides
  };
}

function meteringModuleOptions(overrides = {}) {
  return {
    clone,
    appVersion:APP_VERSION,
    now:() => new Date().toISOString(),
    master:NK_PRO_MODULES.meterMaster,
    readings:NK_PRO_MODULES.meterReadings,
    periods:NK_PRO_MODULES.meterPeriods,
    ...overrides
  };
}

function synchronizeMeteringData(data = state, options = {}) {
  return NK_PRO_MODULES.meterValidation.synchronizeMeteringData(data, meteringModuleOptions(options));
}

function validateMeteringData(data = state, options = {}) {
  return NK_PRO_MODULES.meterValidation.validateMeteringData(data, meteringModuleOptions(options));
}

function migrateMeteringData(data, options = {}) {
  return NK_PRO_MODULES.meterValidation.migrateMeteringData(data, meteringModuleOptions(options));
}

function objectStandardModuleOptions(overrides = {}) {
  return {
    clone,
    appVersion:APP_VERSION,
    now:() => new Date().toISOString(),
    ...overrides
  };
}

function billingSnapshotModuleOptions(overrides = {}) {
  return {
    clone,
    hash:integrityHash,
    appVersion:APP_VERSION,
    dataSchemaVersion:DATA_SCHEMA_VERSION,
    dataLayerContractVersion:DATA_LAYER_CONTRACT_VERSION,
    objectStandardVersion:NK_PRO_MODULES.objectStandard.OBJECT_STANDARD_VERSION,
    meteringStandardVersion:NK_PRO_MODULES.meterValidation.METERING_STANDARD_VERSION,
    objectStandardModule:NK_PRO_MODULES.objectStandard,
    meterMasterModule:NK_PRO_MODULES.meterMaster,
    meterReadingsModule:NK_PRO_MODULES.meterReadings,
    meterPeriodsModule:NK_PRO_MODULES.meterPeriods,
    meterValidationModule:NK_PRO_MODULES.meterValidation,
    createBoundedData:createBoundedBillingSnapshotData,
    ...overrides
  };
}

function normalizeObjectStandard(data, options = {}) {
  return NK_PRO_MODULES.objectStandard.normalizeObjectStandard(data, objectStandardModuleOptions(options));
}

function validateObjectStandard(data, options = {}) {
  return NK_PRO_MODULES.objectStandard.validateObjectStandard(data, objectStandardModuleOptions(options));
}

function validateBillingReadiness(data = state, options = {}) {
  return NK_PRO_MODULES.billingSnapshot.validateBillingReadiness(data, billingSnapshotModuleOptions(options));
}

function validateBillingSnapshot(snapshot, options = {}) {
  return NK_PRO_MODULES.billingSnapshot.validateBillingSnapshot(snapshot, billingSnapshotModuleOptions(options));
}

function addElectricityDummyMeter(input = {}, data = state) {
  const meter = NK_PRO_MODULES.meterMaster.addElectricityDummyMeter(data, input, meteringModuleOptions());
  synchronizeMeteringData(data);
  normalizeObjectStandard(data);
  return meter;
}

function archiveModuleOptions(overrides = {}) {
  return {
    clone,
    appVersion:APP_VERSION,
    dataSchemaVersion:DATA_SCHEMA_VERSION,
    dataLayerContractVersion:DATA_LAYER_CONTRACT_VERSION,
    snapshotScope:ARCHIVE_SNAPSHOT_SCOPE,
    snapshotDataKeys:ARCHIVE_SNAPSHOT_DATA_KEYS,
    technicalMetaKeys:SNAPSHOT_TECHNICAL_META_KEYS,
    normalizeLegacyData,
    billingSnapshot:NK_PRO_MODULES.billingSnapshot,
    billingSnapshotOptions:billingSnapshotModuleOptions(),
    archivePeriodId:NK_PRO_MODULES.archiveActions.periodId,
    todayIso,
    ...overrides
  };
}

function isSnapshotTechnicalMetaKey(key) {
  return NK_PRO_MODULES.archive.isSnapshotTechnicalMetaKey(key, archiveModuleOptions());
}

function snapshotMetaFrom(meta) {
  return NK_PRO_MODULES.archive.snapshotMetaFrom(meta, archiveModuleOptions());
}

function createBoundedBillingSnapshotData(source) {
  return NK_PRO_MODULES.archive.createBoundedBillingSnapshotData(source, archiveModuleOptions());
}

function hasHistoricalWaterMeterData(value) {
  return NK_PRO_MODULES.archive.hasHistoricalWaterMeterData(value);
}

function adoptHistoricalWaterMeterDataFromArchive(data) {
  return NK_PRO_MODULES.archive.adoptHistoricalWaterMeterDataFromArchive(data, archiveModuleOptions());
}

function archiveBoundaryFacts(item) {
  return NK_PRO_MODULES.archive.archiveBoundaryFacts(item, archiveModuleOptions());
}

function normalizeArchiveCollectionBoundaries(data) {
  return NK_PRO_MODULES.archive.normalizeArchiveCollectionBoundaries(data, archiveModuleOptions());
}

function enforceWorkingStateDataContract(data, options = {}) {
  return NK_PRO_MODULES.archive.enforceWorkingStateDataContract(data, archiveModuleOptions(options));
}

function copyWorkingOperationalMeta(targetMeta, sourceMeta) {
  return NK_PRO_MODULES.archive.copyWorkingOperationalMeta(targetMeta, sourceMeta, archiveModuleOptions());
}

const DEFAULT_WATER_METER_HISTORY = {"source":"Nebenkostenberechnung 2024(2).xlsx / Tab Wasserverbrauch","sourceSheet":"Wasserverbrauch","importedAt":"2026-07-06","scope":"Endstände 2017–2024 und Jahresverbräuche 2018–2024; für Archiv-/Abrechnungsprüfung relevant ab Ende 2021.","houseConnection":{"wechselHinweis":"Wasseruhrenwechsel Hausanschluss am 13.04.2022","wechselDatum":"2022-04-13","wertBeiWechsel":1893.0,"wertEnde2022":301.0,"wertEnde2023":615.0,"wertEnde2024":911.0,"wertEnde2025":"TBD"},"units":[{"wohnung":"W005.DG-L","bezeichnung":"DG-Links","excelKennung":"DGL","zaehlerKennung":"w05","readings":[{"jahr":2017,"kw":20.39,"ww":22.21,"gesamt":42.6},{"jahr":2018,"kw":39.45,"ww":41.15,"gesamt":80.6},{"jahr":2019,"kw":63.25,"ww":60.76,"gesamt":124.01},{"jahr":2020,"kw":90.18,"ww":85.38,"gesamt":175.56},{"jahr":2021,"kw":105.26,"ww":119.66,"gesamt":224.92},{"jahr":2022,"kw":123.08,"ww":141.56,"gesamt":264.64},{"jahr":2023,"kw":123.08,"ww":143.0,"gesamt":266.08},{"jahr":2024,"kw":124.0,"ww":144.0,"gesamt":268.0}],"deltas":[{"jahr":2018,"kw":19.06,"ww":18.94,"gesamt":38.0},{"jahr":2019,"kw":23.8,"ww":19.61,"gesamt":43.41},{"jahr":2020,"kw":26.93,"ww":24.62,"gesamt":51.55},{"jahr":2021,"kw":15.08,"ww":34.28,"gesamt":49.36},{"jahr":2022,"kw":17.82,"ww":21.9,"gesamt":39.72},{"jahr":2023,"kw":0.0,"ww":1.44,"gesamt":1.44},{"jahr":2024,"kw":0.92,"ww":1.0,"gesamt":1.92}]},{"wohnung":"W006.DG-R","bezeichnung":"DG-Rechts","excelKennung":"DGR","zaehlerKennung":"w06","readings":[{"jahr":2017,"kw":26.13,"ww":11.17,"gesamt":37.3},{"jahr":2018,"kw":60.03,"ww":26.14,"gesamt":86.17},{"jahr":2019,"kw":73.63,"ww":33.6,"gesamt":107.23},{"jahr":2020,"kw":79.05,"ww":39.47,"gesamt":118.52},{"jahr":2021,"kw":112.45,"ww":77.21,"gesamt":189.66},{"jahr":2022,"kw":136.98,"ww":110.99,"gesamt":247.97},{"jahr":2023,"kw":136.98,"ww":110.99,"gesamt":247.97},{"jahr":2024,"kw":137.0,"ww":111.0,"gesamt":248.0}],"deltas":[{"jahr":2018,"kw":33.9,"ww":14.97,"gesamt":48.87},{"jahr":2019,"kw":13.6,"ww":7.46,"gesamt":21.06},{"jahr":2020,"kw":5.42,"ww":5.87,"gesamt":11.29},{"jahr":2021,"kw":33.4,"ww":37.74,"gesamt":71.14},{"jahr":2022,"kw":24.53,"ww":33.78,"gesamt":58.31},{"jahr":2023,"kw":0.0,"ww":0.0,"gesamt":0.0},{"jahr":2024,"kw":0.02,"ww":0.01,"gesamt":0.03}]},{"wohnung":"W003.1OG-L","bezeichnung":"1OG-Links","excelKennung":"1OGL","zaehlerKennung":"w03","readings":[{"jahr":2017,"kw":47.83,"ww":0.04,"gesamt":47.87},{"jahr":2018,"kw":73.5,"ww":4.21,"gesamt":77.71},{"jahr":2019,"kw":85.52,"ww":12.48,"gesamt":98.0},{"jahr":2020,"kw":100.14,"ww":21.86,"gesamt":122.0},{"jahr":2021,"kw":119.45,"ww":35.2,"gesamt":154.65},{"jahr":2022,"kw":138.11,"ww":44.44,"gesamt":182.55},{"jahr":2023,"kw":153.0,"ww":52.0,"gesamt":205.0},{"jahr":2024,"kw":168.0,"ww":59.0,"gesamt":227.0}],"deltas":[{"jahr":2018,"kw":25.67,"ww":4.17,"gesamt":29.84},{"jahr":2019,"kw":12.02,"ww":8.27,"gesamt":20.29},{"jahr":2020,"kw":14.62,"ww":9.38,"gesamt":24.0},{"jahr":2021,"kw":19.31,"ww":13.34,"gesamt":32.65},{"jahr":2022,"kw":18.66,"ww":9.24,"gesamt":27.9},{"jahr":2023,"kw":14.89,"ww":7.56,"gesamt":22.45},{"jahr":2024,"kw":15.0,"ww":7.0,"gesamt":22.0}]},{"wohnung":"W004.1OG-R","bezeichnung":"1OG-Rechts","excelKennung":"1OGR","zaehlerKennung":"w04","readings":[{"jahr":2017,"kw":5.2,"ww":0.58,"gesamt":5.78},{"jahr":2018,"kw":25.03,"ww":3.04,"gesamt":28.07},{"jahr":2019,"kw":27.53,"ww":5.93,"gesamt":33.46},{"jahr":2020,"kw":43.54,"ww":25.9,"gesamt":69.44},{"jahr":2021,"kw":55.22,"ww":42.81,"gesamt":98.03},{"jahr":2022,"kw":104.97,"ww":121.21,"gesamt":226.18},{"jahr":2023,"kw":152.0,"ww":186.0,"gesamt":338.0},{"jahr":2024,"kw":195.0,"ww":241.0,"gesamt":436.0}],"deltas":[{"jahr":2018,"kw":19.83,"ww":2.46,"gesamt":22.29},{"jahr":2019,"kw":2.5,"ww":2.89,"gesamt":5.39},{"jahr":2020,"kw":16.01,"ww":19.97,"gesamt":35.98},{"jahr":2021,"kw":11.68,"ww":16.91,"gesamt":28.59},{"jahr":2022,"kw":49.75,"ww":78.4,"gesamt":128.15},{"jahr":2023,"kw":47.03,"ww":64.79,"gesamt":111.82},{"jahr":2024,"kw":43.0,"ww":55.0,"gesamt":98.0}]},{"wohnung":"W001.EG-L","bezeichnung":"EG-Links","excelKennung":"EGL","zaehlerKennung":"w01","readings":[{"jahr":2017,"kw":null,"ww":null,"gesamt":null},{"jahr":2018,"kw":null,"ww":null,"gesamt":null},{"jahr":2019,"kw":null,"ww":null,"gesamt":null},{"jahr":2020,"kw":null,"ww":null,"gesamt":null},{"jahr":2021,"kw":184.11,"ww":88.67,"gesamt":272.78},{"jahr":2022,"kw":186.24,"ww":89.37,"gesamt":275.61},{"jahr":2023,"kw":228.0,"ww":98.0,"gesamt":326.0},{"jahr":2024,"kw":266.0,"ww":108.0,"gesamt":374.0}],"deltas":[{"jahr":2018,"kw":0.0,"ww":0.0,"gesamt":0.0},{"jahr":2019,"kw":0.0,"ww":0.0,"gesamt":0.0},{"jahr":2020,"kw":0.0,"ww":0.0,"gesamt":0.0},{"jahr":2021,"kw":184.11,"ww":88.67,"gesamt":272.78},{"jahr":2022,"kw":2.13,"ww":0.7,"gesamt":2.83},{"jahr":2023,"kw":41.76,"ww":8.63,"gesamt":50.39},{"jahr":2024,"kw":38.0,"ww":10.0,"gesamt":48.0}]},{"wohnung":"W002.EG-R","bezeichnung":"EG-Rechts","excelKennung":"EGR","zaehlerKennung":"w02","readings":[{"jahr":2017,"kw":16.3,"ww":4.05,"gesamt":20.35},{"jahr":2018,"kw":34.52,"ww":8.55,"gesamt":43.07},{"jahr":2019,"kw":52.58,"ww":12.57,"gesamt":65.15},{"jahr":2020,"kw":68.5,"ww":15.72,"gesamt":84.22},{"jahr":2021,"kw":83.3,"ww":19.02,"gesamt":102.32},{"jahr":2022,"kw":95.88,"ww":21.75,"gesamt":117.63},{"jahr":2023,"kw":105.0,"ww":24.0,"gesamt":129.0},{"jahr":2024,"kw":117.0,"ww":28.0,"gesamt":145.0}],"deltas":[{"jahr":2018,"kw":18.22,"ww":4.5,"gesamt":22.72},{"jahr":2019,"kw":18.06,"ww":4.02,"gesamt":22.08},{"jahr":2020,"kw":15.92,"ww":3.15,"gesamt":19.07},{"jahr":2021,"kw":14.8,"ww":3.3,"gesamt":18.1},{"jahr":2022,"kw":12.58,"ww":2.73,"gesamt":15.31},{"jahr":2023,"kw":9.12,"ww":2.25,"gesamt":11.37},{"jahr":2024,"kw":12.0,"ww":4.0,"gesamt":16.0}]},{"wohnung":"W000.UG","bezeichnung":"UG","excelKennung":"KG","zaehlerKennung":"w00","readings":[{"jahr":2017,"kw":43.0,"ww":35.0,"gesamt":78.0},{"jahr":2018,"kw":94.15,"ww":74.5,"gesamt":168.65},{"jahr":2019,"kw":135.96,"ww":106.13,"gesamt":242.09},{"jahr":2020,"kw":197.91,"ww":145.77,"gesamt":343.68},{"jahr":2021,"kw":271.0,"ww":188.0,"gesamt":459.0},{"jahr":2022,"kw":346.65,"ww":216.54,"gesamt":563.19},{"jahr":2023,"kw":420.0,"ww":246.0,"gesamt":666.0},{"jahr":2024,"kw":490.0,"ww":280.0,"gesamt":770.0}],"deltas":[{"jahr":2018,"kw":51.15,"ww":39.5,"gesamt":90.65},{"jahr":2019,"kw":41.81,"ww":31.63,"gesamt":73.44},{"jahr":2020,"kw":61.95,"ww":39.64,"gesamt":101.59},{"jahr":2021,"kw":73.09,"ww":42.23,"gesamt":115.32},{"jahr":2022,"kw":75.65,"ww":28.54,"gesamt":104.19},{"jahr":2023,"kw":73.35,"ww":29.46,"gesamt":102.81},{"jahr":2024,"kw":70.0,"ww":34.0,"gesamt":104.0}]}],"summaryDeltas":[{"jahr":2018,"gesamt":252.37},{"jahr":2019,"gesamt":185.67},{"jahr":2020,"gesamt":243.48},{"jahr":2021,"gesamt":587.94},{"jahr":2022,"gesamt":376.41},{"jahr":2023,"gesamt":300.28},{"jahr":2024,"gesamt":289.95}],"notes":["Die Einheiten W05/DG-Links und W06/DG-Rechts sind in der aktuellen Bearbeitung inaktiv, bleiben aber für die historische Wasseruhren-Historie erhalten.","Für W01/EG-Links ist Ende 2021 im Excel als Start-/Erstwert ab 12NOV erfasst; der Jahresverbrauch 2021 wird im Excel als Differenz zu 0 geführt.","Die importierten Alt-Abrechnungen 2021/2022 und 2022 bleiben rechnerisch über ihre Original-Briefwerte fixiert; die Wasseruhren-Historie dient dort als Prüf-/Belegdatenbasis."]};

function ensureWaterMeterHistory(data) {
  if (!data) return data;
  const needsRootHistory = !data.waterMeterHistory || !Array.isArray(data.waterMeterHistory.units) || !data.waterMeterHistory.units.length;
  if (needsRootHistory) data.waterMeterHistory = clone(DEFAULT_WATER_METER_HISTORY);
  if (!data.meta) data.meta = {};
  if (!data.meta.waterMeterHistorySource) data.meta.waterMeterHistorySource = data.waterMeterHistory.source || DEFAULT_WATER_METER_HISTORY.source;
  if (!data.meta.waterMeterHistoryStatus) data.meta.waterMeterHistoryStatus = "vollständig aus Excel übernommen";
  return data;
}

function notifyStorageProblem(message, error) {
  if (error) console.warn("NK-Pro: " + message, error);
  else console.warn("NK-Pro: " + message);
  pendingStorageWarning = message;
  if (!storageWarningShown && typeof window !== "undefined" && typeof window.setTimeout === "function" && typeof alert === "function") {
    storageWarningShown = true;
    window.setTimeout(() => alert(message), 0);
  }
}

function integrityHash(text) {
  return NK_PRO_MODULES.persistence.integrityHash(text);
}

function dataWithoutIntegrity(data) {
  return NK_PRO_MODULES.persistence.dataWithoutIntegrity(data, persistenceModuleOptions());
}

function calculateDataIntegrity(data) {
  return NK_PRO_MODULES.persistence.calculateDataIntegrity(data, persistenceModuleOptions());
}

function protectDataForStorage(data) {
  return NK_PRO_MODULES.persistence.protectDataForStorage(data, persistenceModuleOptions());
}

function validateStoredDataIntegrity(data) {
  return NK_PRO_MODULES.persistence.validateStoredDataIntegrity(data, persistenceModuleOptions());
}

function readStoredDataResult(key) {
  return NK_PRO_MODULES.persistence.readStoredDataResult(key, persistenceModuleOptions());
}

function readStoredData(key) {
  const result = readStoredDataResult(key);
  if (result.valid) return result.data;
  if (!result.missing) {
    const msg = "Lokale gespeicherte Daten konnten nicht sicher gelesen werden. Es wurden Ausgangsdaten oder ein gültiger kompatibler Datenstand geladen. Bitte prüfe deine letzte Sicherung.";
    if (!storageReadWarningShown) {
      storageReadWarningShown = true;
      notifyStorageProblem(msg, result.error || new Error(result.integrity && result.integrity.reason || "Integritätsprüfung fehlgeschlagen"));
    } else if (typeof console !== "undefined" && console.warn) {
      console.warn("NK-Pro: " + msg + " Betroffener Speicherbereich: " + key);
    }
  }
  return null;
}

function writeProtectedStorage(key, data) {
  return NK_PRO_MODULES.persistence.writeProtectedStorage(key, data, persistenceModuleOptions());
}

function migrationCandidatesForData(data) {
  const candidates = NK_PRO_MODULES.migration.collectMigrationCandidates(data, DATA_SCHEMA_VERSION).filter(candidate => candidate.path === "workingState");
  if (NK_PRO_MODULES.meterValidation.requiresMeteringMigration(data)) {
    candidates.push({
      path:"workingState.zaehlerDaten",
      version:currentDataSchemaVersion(data),
      targetSchemaVersion:DATA_SCHEMA_VERSION,
      migrationId:"metering-standard-v1",
      description:"Zählerstammdaten, Messwerte, Messperioden und Zuordnungen trennen"
    });
  }
  if (NK_PRO_MODULES.objectStandard.requiresObjectStandardMigration(data)) {
    candidates.push({
      path:"workingState.objektStandard",
      version:currentDataSchemaVersion(data),
      targetSchemaVersion:DATA_SCHEMA_VERSION,
      migrationId:"object-standard-v1",
      description:"Objektstandard 1 additiv erzeugen"
    });
  }
  return candidates;
}

function migrationPathLabelsForCandidates(candidates) {
  return (candidates || []).map(candidate => {
    if (candidate.migrationId) return candidate.path + ":" + candidate.migrationId;
    try {
      const path = NK_PRO_MODULES.migration.findMigrationPath(candidate.version, DATA_SCHEMA_VERSION);
      return candidate.path + ":" + path.map(step => step.id).join(">");
    } catch (error) {
      return candidate.path + ":unsupported-" + candidate.version + "-to-" + DATA_SCHEMA_VERSION;
    }
  });
}

function createPreMigrationBackup(data, options = {}) {
  const candidates = options.candidates || migrationCandidatesForData(data);
  if (!candidates.length) return null;
  const envelope = NK_PRO_MODULES.backupRecovery.createBackupEnvelope(data, backupRecoveryModuleOptions({
    backupType:"preMigrationBackup",
    sourceSchemaVersion:currentDataSchemaVersion(data),
    targetSchemaVersion:DATA_SCHEMA_VERSION,
    sourceStorageKey:options.sourceStorageKey || STORAGE_KEY,
    reason:options.reason || "Vor datenverändernder Migration",
    migrationPath:migrationPathLabelsForCandidates(candidates)
  }));
  NK_PRO_MODULES.backupRecovery.persistBackupEnvelope(STORAGE_PRE_MIGRATION_BACKUP_KEY, envelope, backupRecoveryModuleOptions());
  return envelope;
}

function ensurePreMigrationBackup(data, options = {}) {
  const candidates = migrationCandidatesForData(data);
  if (!candidates.length) return null;
  return createPreMigrationBackup(data, { ...options, candidates });
}

function readPreMigrationBackupResult() {
  return NK_PRO_MODULES.backupRecovery.readBackupEnvelopeResult(STORAGE_PRE_MIGRATION_BACKUP_KEY, backupRecoveryModuleOptions());
}

function readRestoreCheckpointResult() {
  return NK_PRO_MODULES.backupRecovery.readBackupEnvelopeResult(STORAGE_RESTORE_CHECKPOINT_KEY, backupRecoveryModuleOptions());
}

function migrationBackupFileName(envelope) {
  const meta = envelope && envelope.metadata || {};
  const stamp = String(meta.createdAt || new Date().toISOString()).slice(0, 19).replace(/[:T]/g, "-");
  return "NK-Pro-Vor-Migrationssicherung-" + safeFilePart(meta.backupId || "backup") + "-" + stamp + ".json";
}

function downloadPreMigrationBackup() {
  const result = readPreMigrationBackupResult();
  if (!result.valid || !result.envelope) return alert("Es ist keine gültige Vor-Migrationssicherung vorhanden.");
  const filename = migrationBackupFileName(result.envelope);
  const text = NK_PRO_MODULES.backupRecovery.serializeBackupEnvelope(result.envelope, backupRecoveryModuleOptions());
  download(filename, text, "application/json;charset=utf-8");
  setActionMessage("Vor-Migrationssicherung heruntergeladen: " + result.envelope.metadata.backupId);
  renderActionFeedback();
}

function createRestoreCheckpoint(reason) {
  const envelope = NK_PRO_MODULES.backupRecovery.createBackupEnvelope(state, backupRecoveryModuleOptions({
    backupType:"restoreCheckpoint",
    sourceSchemaVersion:currentDataSchemaVersion(state),
    targetSchemaVersion:DATA_SCHEMA_VERSION,
    sourceStorageKey:STORAGE_KEY,
    reason:reason || "Checkpoint vor Restore",
    migrationPath:[]
  }));
  NK_PRO_MODULES.backupRecovery.persistBackupEnvelope(STORAGE_RESTORE_CHECKPOINT_KEY, envelope, backupRecoveryModuleOptions());
  return envelope;
}

function restorePreMigrationBackup() {
  if (isArchiveViewer()) return alert("Restore ist in der Archivansicht nicht möglich.");
  const result = readPreMigrationBackupResult();
  if (!result.valid || !result.envelope) return alert("Es ist keine gültige Vor-Migrationssicherung vorhanden.");
  const code = "RESTORE";
  const entered = prompt("Vor-Migrationssicherung wiederherstellen?\n\nDer aktuelle Arbeitsstand wird vorher als Restore-Checkpoint gesichert. Eingabe zur Bestätigung: " + code, "");
  if (String(entered || "").trim().toUpperCase() !== code) return alert("Restore wurde abgebrochen.");
  try {
    const checkpoint = createRestoreCheckpoint("Checkpoint vor Wiederherstellung von " + result.envelope.metadata.backupId);
    const restoredRaw = NK_PRO_MODULES.backupRecovery.restoreBackupEnvelope(result.envelope, backupRecoveryModuleOptions({ validateData:(data) => validateMigrationData(data, { phase:"beforeMigration" }) }));
    replaceApplicationState(normalizeLoadedData(restoredRaw));
    if (typeof resetTransientUiState === "function") resetTransientUiState({ resetPageState:true });
    billingContextOpen = false;
    if (!state.meta) state.meta = {};
    state.meta.restoreCheckpointCreatedAt = checkpoint.metadata.createdAt;
    state.meta.restoreCheckpointBackupId = checkpoint.metadata.backupId;
    const saved = withFinalizationWriteBypass(() => saveData());
    renderAll();
    switchToTab("landing");
    alert(saved ? "Vor-Migrationssicherung wurde validiert, auf den aktuellen Stand migriert und wiederhergestellt." : "Daten wurden wiederhergestellt, konnten aber nicht dauerhaft gespeichert werden.");
  } catch (error) {
    alert("Restore fehlgeschlagen. Der aktuelle Arbeitsstand blieb erhalten.\n\n" + errorMessage(error));
  }
}

function rollbackLastRestore() {
  if (isArchiveViewer()) return alert("Rollback ist in der Archivansicht nicht möglich.");
  const result = readRestoreCheckpointResult();
  if (!result.valid || !result.envelope) return alert("Es ist kein gültiger Restore-Checkpoint vorhanden.");
  const code = "ROLLBACK";
  const entered = prompt("Letzten Restore zurücknehmen?\n\nEingabe zur Bestätigung: " + code, "");
  if (String(entered || "").trim().toUpperCase() !== code) return alert("Rollback wurde abgebrochen.");
  try {
    const restored = NK_PRO_MODULES.backupRecovery.restoreBackupEnvelope(result.envelope, backupRecoveryModuleOptions({ validateData:(data) => validateMigrationData(data, { phase:"restoreCurrent" }) }));
    replaceApplicationState(normalizeLoadedData(restored));
    if (typeof resetTransientUiState === "function") resetTransientUiState({ resetPageState:true });
    billingContextOpen = false;
    const saved = withFinalizationWriteBypass(() => saveData());
    renderAll();
    switchToTab("landing");
    alert(saved ? "Der letzte Restore wurde zurückgenommen." : "Rollback wurde geladen, konnte aber nicht dauerhaft gespeichert werden.");
  } catch (error) {
    alert("Rollback fehlgeschlagen. Der aktuelle Arbeitsstand blieb erhalten.\n\n" + errorMessage(error));
  }
}

// ===== Bereich: Speicher, Importprüfung und Migration =====
function loadData() {
  if (ARCHIVE_VIEW_MODE) return clone(SEED);
  const current = readStoredDataResult(STORAGE_KEY);
  if (current.valid) return current.data;

  const recovery = readStoredDataResult(STORAGE_RECOVERY_KEY);
  if (recovery.valid) {
    notifyStorageProblem("Der aktuelle lokale Datenstand ist beschädigt oder unvollständig. Das Tool hat den letzten gültigen Rückfallstand geladen. Bitte sofort eine Gesamt-JSON-Sicherung herunterladen.", current.error || new Error(current.integrity && current.integrity.reason || "Integritätsprüfung fehlgeschlagen"));
    if (!recovery.data.meta) recovery.data.meta = {};
    recovery.data.meta.loadedFromIntegrityRecovery = true;
    recovery.data.meta.loadedFromIntegrityRecoveryAt = new Date().toISOString();
    return recovery.data;
  }

  if (!current.missing) readStoredData(STORAGE_KEY);
  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = readStoredData(key);
    if (legacy) return legacy;
  }
  return clone(SEED);
}

function isAppDataShape(data) {
  return !!data && typeof data === "object" && !Array.isArray(data) &&
    Array.isArray(data.wohnungen) && Array.isArray(data.mieter) && Array.isArray(data.kostenarten);
}

function jsonByteLength(text) {
  const value = String(text ?? "");
  if (typeof Blob !== "undefined") return new Blob([value]).size;
  return value.length;
}

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toLocaleString("de-DE", {maximumFractionDigits:1}) + " KB";
  return (n / 1024 / 1024).toLocaleString("de-DE", {maximumFractionDigits:2}) + " MB";
}

function storageUsageForData(data) {
  try {
    const json = JSON.stringify(data);
    const bytes = jsonByteLength(json);
    return { bytes, label:formatBytes(bytes), error:"" };
  } catch(e) {
    return { bytes:0, label:"nicht ermittelbar", error:String(e && (e.message || e.name) || e) };
  }
}

function currentStorageUsage() {
  return storageUsageForData(state);
}

function parseJsonFileText(text) {
  const clean = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!clean) throw new Error("Die JSON-Datei ist leer.");
  try {
    return JSON.parse(clean);
  } catch(e) {
    throw new Error("Die JSON-Datei ist syntaktisch ungültig: " + String(e && (e.message || e.name) || e));
  }
}

function importValidationReport(data) {
  const errors = [];
  const warnings = [];
  if (data && data.snapshotFormat === NK_PRO_MODULES.billingSnapshot.BILLING_SNAPSHOT_FORMAT) {
    const snapshotValidation = validateBillingSnapshot(data);
    if (!snapshotValidation.valid) {
      snapshotValidation.errors.forEach(item => errors.push(item.message));
      return { errors, warnings };
    }
    data = data.data;
  }
  if (!isAppDataShape(data)) {
    errors.push("Die Datei enthält keine vollständige NK-Pro-Datenstruktur mit Wohnungen, Mietern und Kostenarten.");
    return { errors, warnings };
  }

  const schemaVersion = currentDataSchemaVersion(data);
  if (!data.meta || !data.meta.dataSchemaVersion) warnings.push("Datenschema-Version fehlt; die Datei wird beim Import auf v" + DATA_SCHEMA_VERSION + " normalisiert.");
  else if (schemaVersion < DATA_SCHEMA_VERSION) warnings.push("Datenschema v" + schemaVersion + " wird beim Import auf v" + DATA_SCHEMA_VERSION + " migriert.");

  try {
    normalizeLegacyData(clone(data));
  } catch(error) {
    errors.push("Die Daten konnten nicht normalisiert werden: " + errorMessage(error));
  }

  if (Array.isArray(data.jahresArchiv)) {
    data.jahresArchiv.forEach((item, index) => {
      const validation = NK_PRO_MODULES.archiveActions.validateItem(item);
      const label = NK_PRO_MODULES.archiveActions.itemLabel(item, index);
      validation.errors.forEach(message => warnings.push("Archiv " + label + ": " + message + " (bleibt sichtbar, kann aber nicht geöffnet werden, bis der Datensatz korrigiert ist)"));
      validation.warnings.forEach(message => warnings.push("Archiv " + label + ": " + message));
    });
  }
  return { errors, warnings };
}

function importSummaryText(data, fileName, report) {
  const meta = data && data.meta || {};
  const storageInfo = storageUsageForData(data);
  const lines = [
    "JSON-Import prüfen",
    "",
    "Datei: " + (fileName || "unbekannt"),
    "Abrechnungsjahr: " + (meta.abrechnungsjahr || "nicht angegeben"),
    "Exportiert mit Toolversion: " + (meta.exportedWithAppVersion || meta.lastSavedWithAppVersion || meta.importedWithAppVersion || "nicht angegeben"),
    "Exportiert am: " + (meta.exportedAt ? new Date(meta.exportedAt).toLocaleString("de-DE") : "nicht angegeben"),
    "Exportumfang: " + (meta.exportScopeLabel || meta.exportScope || "nicht angegeben"),
    "Quell-Speicherbereich: " + (meta.exportStorageKey || "nicht angegeben"),
    "Wohnungen: " + (Array.isArray(data.wohnungen) ? data.wohnungen.length : 0),
    "Mietverhältnisse: " + (Array.isArray(data.mieter) ? data.mieter.length : 0),
    "Kostenarten: " + (Array.isArray(data.kostenarten) ? data.kostenarten.length : 0),
    "Archivdatensätze: " + (Array.isArray(data.jahresArchiv) ? data.jahresArchiv.length : 0),
    "Datengröße: " + storageInfo.label
  ];
  if (report && report.warnings && report.warnings.length) {
    lines.push("", "Hinweise:");
    report.warnings.slice(0, 6).forEach(message => lines.push("- " + message));
    if (report.warnings.length > 6) lines.push("- weitere Hinweise: " + (report.warnings.length - 6));
  }
  return lines.join("\n");
}

function addImportMetadata(data, fileName) {
  if (!data.meta) data.meta = {};
  data.meta.importedAt = new Date().toISOString();
  data.meta.importedWithAppVersion = APP_VERSION;
  data.meta.importedFileName = fileName || "";
  return data;
}

function backupEventLabel(type) {
  const labels = {
    "full-json":"Gesamt-JSON",
    "full-package":"Vollständiges Exportpaket",
    "current-json":"Abrechnungs-JSON",
    "year-archive":"Jahresarchiv",
    "archive-year":"Archivjahr-JSON"
  };
  return labels[type] || String(type || "Backup");
}

function ensureBackupMetadata() {
  if (!state.meta) state.meta = {};
  if (!Array.isArray(state.meta.backupEvents)) state.meta.backupEvents = [];
  return state.meta.backupEvents;
}

function registerBackupEvent(type, filename) {
  if (!state || !state.meta) return;
  const events = ensureBackupMetadata();
  const event = {
    type:type || "backup",
    label:backupEventLabel(type),
    filename:filename || "",
    at:new Date().toISOString(),
    appVersion:APP_VERSION,
    year:currentAbrechnungsjahr()
  };
  events.unshift(event);
  state.meta.backupEvents = events.slice(0, 20);
  if (type === "full-json" || type === "full-package") {
    state.meta.lastFullBackupAt = event.at;
    state.meta.lastFullBackupType = event.label;
    state.meta.lastFullBackupFile = event.filename;
    state.meta.lastFullBackupAppVersion = APP_VERSION;
  }
  if (type === "current-json") {
    state.meta.lastCurrentBillingBackupAt = event.at;
    state.meta.lastCurrentBillingBackupFile = event.filename;
  }
  if (type === "year-archive" || type === "archive-year") {
    state.meta.lastArchiveBackupAt = event.at;
    state.meta.lastArchiveBackupFile = event.filename;
  }
  try { saveData(); } catch(e) { console.warn("Backup-Ereignis konnte nicht gespeichert werden", e); }
  try { renderBackupStatus(); } catch(e) {}
}

function daysSinceIso(iso) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
}

function backupStatusReport() {
  const meta = state && state.meta || {};
  const last = meta.lastFullBackupAt || "";
  const days = daysSinceIso(last);
  const storage = currentStorageUsage();
  const events = Array.isArray(meta.backupEvents) ? meta.backupEvents : [];
  const preMigrationBackup = readPreMigrationBackupResult();
  const restoreCheckpoint = readRestoreCheckpointResult();
  let level = "ok";
  let message = "Gesamtbackup dokumentiert.";
  if (!last) {
    level = "warn";
    message = "Noch kein Gesamtbackup in dieser Version dokumentiert.";
  } else if (days !== null && days > 14) {
    level = "warn";
    message = "Letztes Gesamtbackup ist älter als 14 Tage.";
  }
  if (meta.lastSaveError) {
    level = "err";
    message = "Letzter Speichervorgang hatte einen Fehler. Bitte sofort Gesamt-JSON herunterladen.";
  }
  return { level, message, last, days, storage, events, meta, preMigrationBackup, restoreCheckpoint };
}

function backupStatusHint(report) {
  if (!report || report.level === "ok") return "";
  return "\n\nBackup-Status: " + report.message + "\nEmpfehlung: Vorher Gesamt-JSON oder vollständiges Exportpaket herunterladen.";
}

function confirmRiskyDataAction(title, message) {
  const report = backupStatusReport();
  return confirm(String(title || "Riskante Datenaktion") + "\n\n" + String(message || "") + backupStatusHint(report));
}

function renderBackupStatus() {
  const el = document.getElementById("backupStatusBox");
  if (!el) return;
  if (isArchiveViewer()) { el.innerHTML = ""; return; }
  const report = backupStatusReport();
  const meta = report.meta || {};
  const lastLabel = report.last ? (new Date(report.last).toLocaleString("de-DE") + (report.days !== null ? " · vor " + report.days + " Tag(en)" : "")) : "Noch kein Gesamtbackup dokumentiert";
  const eventHtml = report.events.slice(0, 3).map(e => '<div class="backup-pill"><strong>' + escapeHtml(e.label || backupEventLabel(e.type)) + '</strong><br>' + escapeHtml(e.at ? new Date(e.at).toLocaleString("de-DE") : "") + '<br><span class="small">' + escapeHtml(e.filename || "") + '</span></div>').join("");
  el.innerHTML = '<div class="backup-status-box ' + report.level + '"><div class="inline-titlebar"><div><strong>Backup-Status</strong><div class="small">' + escapeHtml(report.message) + '</div></div>' +
    '<div class="start-action-stack"><button type="button" data-ui-action="export.downloadFullJson">Gesamt-JSON</button><button type="button" data-ui-action="export.downloadFullPackage">Exportpaket</button>' +
      (report.preMigrationBackup && report.preMigrationBackup.valid ? '<button type="button" data-ui-action="recovery.downloadPreMigration">Vor-Migrationssicherung</button>' : '') +
      '</div></div>' +
    '<div class="backup-grid">' +
      '<div class="backup-pill"><strong>Letztes Gesamtbackup</strong><br>' + escapeHtml(lastLabel) + '<br><span class="small">' + escapeHtml(meta.lastFullBackupType || "") + '</span></div>' +
      '<div class="backup-pill"><strong>Aktueller Speicher</strong><br>' + escapeHtml(report.storage.label) + '<br><span class="small">Browser-Speicher lokal</span></div>' +
      '<div class="backup-pill"><strong>Aktuelle Version</strong><br>' + escapeHtml(APP_VERSION) + '<br><span class="small">' + escapeHtml(APP_VERSION_NAME) + '</span></div>' +
      (report.preMigrationBackup && report.preMigrationBackup.valid ? '<div class="backup-pill"><strong>Vor-Migrationssicherung</strong><br>' + escapeHtml(report.preMigrationBackup.envelope.metadata.backupId) + '<br><span class="small"><button type="button" data-ui-action="recovery.restorePreMigration">Wiederherstellen</button></span></div>' : '') +
      (report.restoreCheckpoint && report.restoreCheckpoint.valid ? '<div class="backup-pill"><strong>Restore-Checkpoint</strong><br>' + escapeHtml(report.restoreCheckpoint.envelope.metadata.backupId) + '<br><span class="small"><button type="button" data-ui-action="recovery.rollbackLastRestore">Restore zurücknehmen</button></span></div>' : '') +
      (eventHtml || '<div class="backup-pill"><strong>Historie</strong><br>Noch keine Backup-Ereignisse</div>') +
    '</div></div>';
}


let finalizationWriteBypass = false;
let statePreparationInProgress = false;
let statePreparationCount = 0;
function withFinalizationWriteBypass(fn) {
  const old = finalizationWriteBypass;
  finalizationWriteBypass = true;
  try { return fn(); } finally { finalizationWriteBypass = old; }
}

function renderFinalizationStatus() {
  const el = document.getElementById("finalizationStatusBox");
  const billingContext = currentAppMode() === "billing" && !isArchiveViewer();
  if (!el) { document.body.classList.remove("billing-finalized"); return; }
  if (!billingContext) { el.innerHTML = ""; document.body.classList.remove("billing-finalized"); return; }
  const info = NK_PRO_MODULES.billingWorkflow.currentBillingFinalizationReport();
  document.body.classList.toggle("billing-finalized", !!info.finalized);
  const meta = info.meta || {};
  const finalizedAt = info.finalized && meta.currentBillingFinalizedAt ? new Date(meta.currentBillingFinalizedAt).toLocaleString("de-DE") : "Nicht finalisiert";
  const cls = info.finalized ? "locked" : (info.readiness.level === "err" ? "err" : (info.readiness.level === "warn" ? "warn" : "ok"));
  const status = info.finalized ? "Finalisiert / Eingaben geschützt" : "Noch bearbeitbar";
  const actionHtml = info.finalized
    ? '<button type="button" class="warn" data-ui-action="billing.unlock">Wiederbearbeitung öffnen</button>'
    : '<button type="button" class="primary" data-ui-action="billing.finalize">Diese Abrechnung finalisieren</button>';
  el.innerHTML = '<div class="finalization-status-box ' + cls + '"><div class="inline-titlebar"><div><strong>Finalisierung dieser Abrechnung</strong><div class="small">' + escapeHtml(status) + ' · ' + escapeHtml(info.readiness.message) + '</div></div><div class="start-action-stack">' + actionHtml + '</div></div>' +
    '<div class="finalization-grid">' +
      '<div class="finalization-pill"><strong>Abrechnungsjahr</strong><br>' + escapeHtml(currentAbrechnungsjahr()) + '<br><span class="small">' + escapeHtml(periodLabelShort()) + '</span></div>' +
      '<div class="finalization-pill"><strong>Status</strong><br>' + escapeHtml(finalizedAt) + '<br><span class="small">' + escapeHtml(meta.currentBillingFinalizedWithAppVersion || APP_VERSION) + '</span></div>' +
      '<div class="finalization-pill"><strong>Prüfstand</strong><br>' + escapeHtml(info.readiness.label) + '<br><span class="small">' + info.readiness.errors.length + ' Fehler · ' + info.readiness.warnings.length + ' Prüfpunkte · ' + info.readiness.hints.length + ' Hinweise</span></div>' +
    '</div></div>';
}







function exportSnapshot() {
  const snapshot = clone(state);
  if (!snapshot.meta) snapshot.meta = {};
  enforceWorkingStateDataContract(snapshot, { recordMigration:false, storageRole:"working" });
  Object.keys(snapshot.meta).forEach(key => {
    if (String(key).startsWith("storageIntegrity")) delete snapshot.meta[key];
  });
  snapshot.meta.exportedAt = new Date().toISOString();
  snapshot.meta.exportedWithAppVersion = APP_VERSION;
  snapshot.meta.exportStorageKey = STORAGE_KEY;
  snapshot.meta.exportScope = "fullArchiveAndCurrentBilling";
  snapshot.meta.exportScopeLabel = "Vollständiger Datenbestand inkl. aktuellem Arbeitsstand und Jahresarchiv";
  snapshot.meta.dataSchemaVersion = DATA_SCHEMA_VERSION;
  snapshot.meta.dataLayerContractVersion = DATA_LAYER_CONTRACT_VERSION;
  snapshot.meta.dataLayerRole = "fullBackup";
  snapshot.meta.exportLayers = ["stammdaten", "currentBilling", "history", "archive"];
  snapshot.meta.exportExcludes = ["recovery"];
  delete snapshot.meta.storageRole;
  delete snapshot.meta.loadedFromIntegrityRecovery;
  delete snapshot.meta.loadedFromIntegrityRecoveryAt;
  delete snapshot.meta.recoveryCreatedAt;
  delete snapshot.meta.recoveryCreatedWithAppVersion;
  delete snapshot.meta.recoverySourceStorageKey;
  return snapshot;
}


function backupFileName(prefix, data) {
  const meta = data && data.meta || {};
  const year = String(meta.abrechnungsjahr || currentAbrechnungsjahr() || "jahr");
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
  return safeFilePart(prefix || "nk-pro-daten") + "-" + safeFilePart(year) + "-" + safeFilePart(APP_VERSION) + "-" + stamp + ".json";
}

function errorMessage(error) {
  if (!error) return "Unbekannter Fehler";
  return String(error.message || error);
}

function recordStartupError(area, error) {
  const message = errorMessage(error);
  startupErrors.push({ area, message });
  if (typeof console !== "undefined" && console.error) console.error("NK-Pro Startfehler: " + area, error);
}

function persistStartupMeterRepair(data, cleared) {
  if (!cleared || !data || ARCHIVE_VIEW_MODE) return;
  try {
    if (!data.meta) data.meta = {};
    data.meta.startupMeterEndValueRepairCleared = cleared;
    data.meta.startupMeterEndValueRepairAt = new Date().toISOString();
    data.meta.startupMeterEndValueRepairWithAppVersion = APP_VERSION;
    enforceWorkingStateDataContract(data);
    writeProtectedStorage(STORAGE_KEY, data);
  } catch(e) {
    notifyStorageProblem("Wasser-Endwert-Korrektur wurde im aktuellen Fenster angewendet, konnte aber nicht dauerhaft gespeichert werden. Bitte Gesamt-JSON sichern.", e);
  }
}

function loadInitialState() {
  try {
    const rawLoaded = loadData();
    ensurePreMigrationBackup(rawLoaded, { reason:"Automatische Migration beim Anwendungsstart", sourceStorageKey:STORAGE_KEY });
    const loaded = normalizeLoadedData(rawLoaded);
    const cleared = NK_PRO_MODULES.yearTransitionActions.clearAutofilledMeterEndValues(loaded, { repairExistingNewBilling:true });
    persistStartupMeterRepair(loaded, cleared);
    return loaded;
  } catch(error) {
    recordStartupError("Datenstart", error);
    notifyStorageProblem("Die App konnte den gespeicherten Datensatz nicht vollständig initialisieren. Die Daten wurden nicht gelöscht; bitte JSON-Sicherung prüfen oder neu laden.", error);
    try {
      const fallback = normalizeLegacyData(clone(SEED));
      fallback.meta.startupFallback = true;
      return fallback;
    } catch(fallbackError) {
      recordStartupError("Fallback-Ausgangsdaten", fallbackError);
      const fallback = clone(SEED);
      if (!fallback.meta) fallback.meta = {};
      fallback.meta.startupFallback = true;
      fallback.meta.dataSchemaVersion = DATA_SCHEMA_VERSION;
      return fallback;
    }
  }
}

function currentDataSchemaVersion(data) {
  return NK_PRO_MODULES.migration.currentDataSchemaVersion(data);
}

function recordDataMigration(data, fromVersion, toVersion, note) {
  return NK_PRO_MODULES.migration.recordDataMigration(data, fromVersion, toVersion, note, migrationModuleOptions());
}

function migrateDataSchema(data, options = {}) {
  return NK_PRO_MODULES.migration.migrateDataSchema(data, migrationModuleOptions(options));
}

function renderSystemMessages() {
  const el = document.getElementById("appStatusBox");
  if (!el) return;
  const items = [];
  startupErrors.forEach(error => items.push("Start: " + error.area + " - " + error.message));
  renderErrors.forEach(error => items.push("Anzeige: " + error.area + " - " + error.message));
  if (pendingStorageWarning) items.push("Speicher: " + pendingStorageWarning);
  if (!items.length) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = '<div class="hint runtime-error-box"><strong>Systemhinweis:</strong> Die Daten wurden nicht gelöscht. Ein Teil der App konnte nicht sauber geladen oder angezeigt werden.<ul>' +
    items.map(item => '<li>' + escapeHtml(item) + '</li>').join("") +
    '</ul><p class="small">Bitte JSON-Sicherung prüfen und diese Meldung nicht ignorieren.</p></div>';
}

function setActionMessage(message, level="ok") {
  lastActionMessage = message || "";
  lastActionLevel = level || "ok";
}

function renderActionFeedback() {
  const el = document.getElementById("appFeedbackBox");
  if (!el) return;
  if (!lastActionMessage) {
    el.innerHTML = "";
    return;
  }
  const cls = lastActionLevel === "err" ? " err" : (lastActionLevel === "warn" ? " warn" : "");
  el.innerHTML = '<div class="hint feedback-box' + cls + '"><strong>Status:</strong> ' + escapeHtml(lastActionMessage) + '</div>';
}

function runRenderStep(area, fn) {
  try {
    fn();
  } catch(error) {
    renderErrors.push({ area, message:errorMessage(error) });
    if (typeof console !== "undefined" && console.error) console.error("NK-Pro Renderfehler: " + area, error);
  }
}
function normalizeLoadedData(data) {
  if (data && data.snapshotFormat === NK_PRO_MODULES.billingSnapshot.BILLING_SNAPSHOT_FORMAT) {
    const validation = validateBillingSnapshot(data);
    if (!validation.valid) {
      notifyStorageProblem("Der geladene Abrechnungssnapshot ist ungültig. Es wurden Ausgangsdaten geladen.", new Error(validation.errors.map(item => item.message).join(" ")));
      return normalizeLegacyData(clone(SEED));
    }
    const envelope = data;
    data = clone(envelope.data);
    if (!data.meta) data.meta = {};
    data.meta.importedFromBillingSnapshotId = envelope.snapshotId;
    data.meta.exportScope = envelope.meta && envelope.meta.exportScope || "currentBillingOnly";
    data.meta.exportScopeLabel = envelope.meta && envelope.meta.exportScopeLabel || "Unveränderlicher Abrechnungssnapshot";
    data.meta.snapshotScope = envelope.snapshotScope || ARCHIVE_SNAPSHOT_SCOPE;
  }
  if (!isAppDataShape(data)) {
    notifyStorageProblem("Der geladene Datensatz hat nicht die erwartete NK-Pro-Struktur. Es wurden Ausgangsdaten geladen.", null);
    return normalizeLegacyData(clone(SEED));
  }
  return normalizeLegacyData(data);
}

function importAppData(data, fileName) {
  const report = importValidationReport(data);
  if (report.errors.length) throw new Error(report.errors.join("\n"));
  return addImportMetadata(normalizeLegacyData(clone(data)), fileName);
}

function simpleArchiveIdentityForMerge(item) {
  return NK_PRO_MODULES.migration.simpleArchiveIdentityForMerge(item);
}

function mergePreloadedV41Archives(data) {
  return NK_PRO_MODULES.migration.mergePreloadedArchives(data, { clone, seed:SEED });
}

function normalizeLegacyData(data, options = {}) {
  if (!data) return data;
  const snapshotMode = options.scope === ARCHIVE_SNAPSHOT_SCOPE;
  if (!data.meta) data.meta = {};
  if (!data.meta.abrechnungsjahr) {
    const briefYear = data.briefSettings && data.briefSettings.abrechnungsjahr ? data.briefSettings.abrechnungsjahr : "";
    data.meta.abrechnungsjahr = briefYear || "2025";
  }
  if (!data.meta.abrechnungsbeginn) data.meta.abrechnungsbeginn = data.meta.abrechnungsjahr ? (String(data.meta.abrechnungsjahr) + "-01-01") : "2025-01-01";
  if (!data.meta.abrechnungsende) data.meta.abrechnungsende = data.meta.abrechnungsjahr ? (String(data.meta.abrechnungsjahr) + "-12-31") : "2025-12-31";
  if (!Array.isArray(data.jahresArchiv)) data.jahresArchiv = [];
  if (!Array.isArray(data.wohnungen)) data.wohnungen = [];
  if (!Array.isArray(data.mieter)) data.mieter = [];
  if (!Array.isArray(data.kostenarten)) data.kostenarten = [];
  if (!Array.isArray(data.vorauszahlungen)) data.vorauszahlungen = [];
  if (!data.kostenartenMieterUmlage || typeof data.kostenartenMieterUmlage !== "object" || Array.isArray(data.kostenartenMieterUmlage)) data.kostenartenMieterUmlage = {};
  if (!data.umlageInputs || typeof data.umlageInputs !== "object" || Array.isArray(data.umlageInputs)) data.umlageInputs = {};
  if (!data.waterMeters || typeof data.waterMeters !== "object" || Array.isArray(data.waterMeters)) data.waterMeters = {};
  if (!data.meterReadings || typeof data.meterReadings !== "object" || Array.isArray(data.meterReadings)) data.meterReadings = {};
  if (Array.isArray(data.kostenarten)) {
    data.kostenarten.forEach(k => {
      if (k.umlageschluessel === "Wohneinheiten inkl. Leerstand") k.umlageschluessel = "Verteilung nur auf aktive Wohneinheiten";
      NK_PRO_MODULES.costActions.normalizeCostSettings(k);
    });
  }
  if (Array.isArray(data.wohnungen)) {
    data.wohnungen.forEach(w => ensureUnitIdentityFields(w));
  }
  if (Array.isArray(data.mieter)) {
    const hasM000 = data.mieter.some(m => m.id === "M000");
    data.mieter.forEach(m => {
      if (m.id === "M005" && !hasM000) m.id = "M000";
      if (m.status === "archiviert" || m.status === "Archiv") m.status = "Archiviert";
      if (m.status === "OK") m.status = m.auszug ? "NK offen" : "Aktiv";
      if (m.archivedAt === undefined) m.archivedAt = "";
      ensureTenantContactFields(m);
      ensureTenantIdentityFields(m);
    });
  }
  if (data.umlageInputs) {
    Object.keys(data.umlageInputs).forEach(key => {
      if (data.umlageInputs[key] && data.umlageInputs[key].art === "Wohneinheiten inkl. Leerstand") {
        data.umlageInputs[key].art = "Verteilung nur auf aktive Wohneinheiten";
      }
    });
  }
  ensureZimmermannTenantForLegacyData(data);
  applyExcelWaterReadings2024ToData(data);
  if (!snapshotMode) {
    mergePreloadedV41Archives(data);
    adoptHistoricalWaterMeterDataFromArchive(data);
    ensureWaterMeterHistory(data);
  }
  ensureUnifiedBillingFields(data, { includeArchives:false });
  migrateDataSchema(data, { includeArchives:false });
  if (!snapshotMode) NK_PRO_MODULES.masterDataActions.ensureStammdatenData(data);
  if (!data.objektStandard || typeof data.objektStandard !== "object") normalizeObjectStandard(data, { legacySnapshot:snapshotMode });
  const meteringMigration = migrateMeteringData(data, { legacySnapshot:snapshotMode });
  if (meteringMigration.status === "failed") throw meteringMigration.error;
  NK_PRO_MODULES.meterValidation.replaceData(data, meteringMigration.data, meteringModuleOptions());
  normalizeObjectStandard(data, { legacySnapshot:snapshotMode });
  if (!snapshotMode) enforceWorkingStateDataContract(data);
  return data;
}


function normalizedTextKey(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function isoPeriodToShortRange(periodText) {
  const parts = String(periodText || "").split(/\s+bis\s+/i);
  if (parts.length === 2) return dateDeShortYear(parts[0]) + "-" + dateDeShortYear(parts[1]);
  return String(periodText || "");
}

function dataSourceForMeta(meta) {
  meta = meta || {};
  if (meta.datenquelle) return meta.datenquelle;
  if (meta.archiveViewer && meta.legacyQuelle) return "Importiert / übernommen";
  if (meta.legacyQuelle) return "Importiert / übernommen";
  if (meta.legacyArchivHinweis) return "Übernommen";
  return "Tool";
}

function ensureUnifiedBillingFields(data, options = {}) {
  if (!data) return data;
  if (!data.meta) data.meta = {};
  data.meta.datensatzTyp = "Abrechnung";
  if (!data.meta.datenquelle) data.meta.datenquelle = dataSourceForMeta(data.meta);
  if (!Array.isArray(data.abrechnungsEinzelwerte)) data.abrechnungsEinzelwerte = [];
  if (Array.isArray(data.legacyEinzelabrechnungen) && data.legacyEinzelabrechnungen.length) {
    data.abrechnungsEinzelwerte = data.legacyEinzelabrechnungen.map(e => ({
      wohnung:e.wohnung || "",
      mieter:e.mieter || "",
      abrechnungsjahr:e.jahr || data.meta.abrechnungsjahr || "",
      periode:e.periode || "",
      kostenarten:[
        {kostenId:"K006", kostenart:"Heiz- und Warmwasserkosten", zeitraum:e.heizPeriode || "", kostenanteil:num(e.heizkosten), vorauszahlung:num(e.vHeiz)},
        {kostenId:"K002", kostenart:"Wasserversorgung", zeitraum:e.wasserPeriode || "", kostenanteil:num(e.wasserkosten), vorauszahlung:num(e.vWasser)},
        {kostenId:"K009", kostenart:"Müllbeseitigung", zeitraum:e.abfallPeriode || "", kostenanteil:num(e.abfallkosten), vorauszahlung:num(e.vAbfall)}
      ],
      kostenanteil:num(e.kostenanteil),
      vorauszahlung:num(e.vorauszahlung),
      saldo:num(e.saldo),
      briefErgebnis:e.briefErgebnis || (num(e.saldo) >= 0 ? "Nachzahlung" : "Guthaben"),
      briefBetrag:num(e.briefBetrag || Math.abs(num(e.saldo))),
      quelle:e.quelle || data.meta.legacyQuelle || "Import"
    }));
  }
  if (options.includeArchives !== false && Array.isArray(data.jahresArchiv)) {
    data.jahresArchiv.forEach(a => {
      if (!a.meta) a.meta = (a.data && a.data.meta) ? clone(a.data.meta) : {};
      a.meta.datensatzTyp = "Abrechnung";
      if (!a.meta.datenquelle) a.meta.datenquelle = dataSourceForMeta(a.meta);
      if (a.data) ensureUnifiedBillingFields(a.data, options);
    });
  }
  ensureUnitIdentityData(data);
  ensureTenantIdentityData(data);
  return data;
}

