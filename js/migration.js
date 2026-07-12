(function (global) {
  "use strict";

  function cloneWith(options, value) {
    return options && typeof options.clone === "function"
      ? options.clone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function currentDataSchemaVersion(data) {
    const raw = data && data.meta ? Number(data.meta.dataSchemaVersion || data.meta.schemaVersion || 1) : 1;
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }

  function recordDataMigration(data, fromVersion, toVersion, note, options = {}) {
    if (!data || !data.meta) return;
    if (!Array.isArray(data.meta.migrationHistory)) data.meta.migrationHistory = [];
    const exists = data.meta.migrationHistory.some(item => item && item.from === fromVersion && item.to === toVersion && item.note === note);
    if (!exists) {
      data.meta.migrationHistory.push({
        from:fromVersion,
        to:toVersion,
        at:(options.now || (() => new Date().toISOString()))(),
        appVersion:options.appVersion || "",
        note
      });
    }
  }

  function simpleArchiveIdentityForMerge(item) {
    if (!item) return "";
    const meta = item.meta || (item.data && item.data.meta) || {};
    if (item.periodId) return String(item.periodId);
    if (meta.periodId) return String(meta.periodId);
    if (meta.abrechnungsbeginn && meta.abrechnungsende) {
      return String(item.year || meta.abrechnungsjahr || "") + "|" + meta.abrechnungsbeginn + "|" + meta.abrechnungsende + "|" + (meta.legacySammelArchiv ? "Archivierte Abrechnung" : "Archiv");
    }
    return "year|" + String(item.year || "");
  }

  function mergePreloadedArchives(data, options = {}) {
    if (!data || (data.meta && data.meta.archiveViewer)) return data;
    if (data.meta && data.meta.exportScope === "currentBillingOnly") {
      if (!Array.isArray(data.jahresArchiv)) data.jahresArchiv = [];
      return data;
    }
    if (!Array.isArray(data.jahresArchiv)) data.jahresArchiv = [];
    const seed = options.seed || {};
    const seedArchives = Array.isArray(seed.jahresArchiv) ? seed.jahresArchiv : [];
    seedArchives.forEach(item => {
      const meta = item.meta || (item.data && item.data.meta) || {};
      if (!meta.preloadedV41LegacyArchive) return;
      const id = simpleArchiveIdentityForMerge(item);
      const exists = data.jahresArchiv.some(candidate => simpleArchiveIdentityForMerge(candidate) === id);
      if (!exists) data.jahresArchiv.push(cloneWith(options, item));
    });
    return data;
  }

  function migrateDataSchema(data, options = {}) {
    if (!data || typeof data !== "object") return data;
    if (!data.meta) data.meta = {};
    const deps = options.dependencies || {};
    const targetSchemaVersion = Number(options.targetSchemaVersion || 5);
    let version = currentDataSchemaVersion(data);

    if (version < 2) {
      deps.ensureUnitIdentityData(data);
      if (Array.isArray(data.mieter)) {
        data.mieter.forEach(tenant => {
          deps.ensureTenantIdentityFields(tenant);
          if (tenant.wohnung) tenant.wohnung = deps.canonicalUnitIdFor(tenant.wohnung) || tenant.wohnung;
        });
      }
      recordDataMigration(data, version, 2, "Mieter- und Wohnungs-IDs auf einfache stabile Kennungen migriert.", options);
      version = 2;
    }

    if (version < 4) {
      if (!data.kostenartenMieterUmlage || typeof data.kostenartenMieterUmlage !== "object" || Array.isArray(data.kostenartenMieterUmlage)) data.kostenartenMieterUmlage = {};
      recordDataMigration(data, version, 4, "Umlagefähigkeit je Kostenart und Mietverhältnis ergänzt.", options);
      version = 4;
    }

    if (version < 5) {
      deps.ensureStammdatenData(data);
      data.stammdaten.wohnungen = deps.normalizeMasterUnitRows(data.stammdaten.wohnungen);
      if (!data.umlageInputs || typeof data.umlageInputs !== "object") data.umlageInputs = {};
      Object.keys(data.umlageInputs).forEach(costId => {
        const input = data.umlageInputs[costId];
        if (!input) return;
        const cost = (data.kostenarten || []).find(item => item.id === costId);
        if (!["Zählerstände", "Verbrauchsmenge", "Direkter Eurobetrag", "Externe Einzelabrechnung"].includes(input.mode)) {
          const direct = cost && (cost.umlageschluessel === options.manualAllocationKey || cost.berechnungsart === "Manuell je Mieter");
          const legacyValues = Array.isArray(input.values) && input.values.some(value => Math.abs(deps.num(value)) > 0.000001);
          input.mode = direct ? "Direkter Eurobetrag" : ((cost && cost.umlageschluessel === "Verbrauch" && cost.id !== "K002" && legacyValues) ? "Verbrauchsmenge" : "Zählerstände");
        }
      });
      recordDataMigration(data, version, 5, "Wohnungsstatus je Abrechnung und eindeutige Quellen für manuelle/externe Werte ergänzt.", options);
      version = 5;
    }

    data.meta.dataSchemaVersion = Math.max(version, targetSchemaVersion);
    data.meta.normalizedWithAppVersion = options.appVersion || "";

    if (options.includeArchives !== false && Array.isArray(data.jahresArchiv)) {
      data.jahresArchiv.forEach(item => {
        if (item && item.data && item.data !== data) {
          migrateDataSchema(item.data, { ...options, includeArchives:false });
          item.schemaVersion = item.data.meta && item.data.meta.dataSchemaVersion ? item.data.meta.dataSchemaVersion : targetSchemaVersion;
        }
      });
    }
    return data;
  }

  global.NKProMigration = Object.freeze({
    currentDataSchemaVersion,
    recordDataMigration,
    simpleArchiveIdentityForMerge,
    mergePreloadedArchives,
    migrateDataSchema
  });
})(globalThis);
