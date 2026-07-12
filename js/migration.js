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
    const migrationId = String(options.migrationId || ("schema-" + fromVersion + "-to-" + toVersion));
    const exists = data.meta.migrationHistory.some(item => item && item.migrationId === migrationId && item.from === fromVersion && item.to === toVersion);
    if (!exists) {
      data.meta.migrationHistory.push({
        migrationId,
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

  function requireDependency(deps, name) {
    if (!deps || typeof deps[name] !== "function") throw new Error("Migrationsabhängigkeit fehlt: " + name);
    return deps[name];
  }

  function migrate1To2(data, options) {
    const deps = options.dependencies || {};
    requireDependency(deps, "ensureUnitIdentityData")(data);
    if (Array.isArray(data.mieter)) {
      data.mieter.forEach(tenant => {
        requireDependency(deps, "ensureTenantIdentityFields")(tenant);
        if (tenant.wohnung) tenant.wohnung = requireDependency(deps, "canonicalUnitIdFor")(tenant.wohnung) || tenant.wohnung;
      });
    }
    return data;
  }

  function migrateTo4(data) {
    if (!data.kostenartenMieterUmlage || typeof data.kostenartenMieterUmlage !== "object" || Array.isArray(data.kostenartenMieterUmlage)) data.kostenartenMieterUmlage = {};
    return data;
  }

  function migrate4To5(data, options) {
    const deps = options.dependencies || {};
    requireDependency(deps, "ensureStammdatenData")(data);
    data.stammdaten.wohnungen = requireDependency(deps, "normalizeMasterUnitRows")(data.stammdaten.wohnungen);
    if (!data.umlageInputs || typeof data.umlageInputs !== "object") data.umlageInputs = {};
    Object.keys(data.umlageInputs).forEach(costId => {
      const input = data.umlageInputs[costId];
      if (!input) return;
      const cost = (data.kostenarten || []).find(item => item.id === costId);
      if (!["Zählerstände", "Verbrauchsmenge", "Direkter Eurobetrag", "Externe Einzelabrechnung"].includes(input.mode)) {
        const direct = cost && (cost.umlageschluessel === options.manualAllocationKey || cost.berechnungsart === "Manuell je Mieter");
        const legacyValues = Array.isArray(input.values) && input.values.some(value => Math.abs(requireDependency(deps, "num")(value)) > 0.000001);
        input.mode = direct ? "Direkter Eurobetrag" : ((cost && cost.umlageschluessel === "Verbrauch" && cost.id !== "K002" && legacyValues) ? "Verbrauchsmenge" : "Zählerstände");
      }
    });
    return data;
  }

  const MIGRATION_REGISTRY = Object.freeze([
    Object.freeze({
      id:"schema-1-to-2",
      from:1,
      to:2,
      description:"Mieter- und Wohnungs-IDs auf einfache stabile Kennungen migrieren.",
      migrate:migrate1To2
    }),
    Object.freeze({
      id:"schema-2-to-4",
      from:2,
      to:4,
      description:"Umlagefähigkeit je Kostenart und Mietverhältnis ergänzen.",
      migrate:migrateTo4
    }),
    Object.freeze({
      id:"schema-3-to-4",
      from:3,
      to:4,
      description:"Umlagefähigkeit je Kostenart und Mietverhältnis ergänzen.",
      migrate:migrateTo4
    }),
    Object.freeze({
      id:"schema-4-to-5",
      from:4,
      to:5,
      description:"Wohnungsstatus und eindeutige Quellen für manuelle/externe Werte ergänzen.",
      migrate:migrate4To5
    })
  ]);

  function supportedMigrationRegistry() {
    return MIGRATION_REGISTRY.slice();
  }

  function findMigrationPath(fromVersion, targetVersion, registry = MIGRATION_REGISTRY) {
    const from = Number(fromVersion);
    const target = Number(targetVersion);
    if (!Number.isFinite(from) || !Number.isFinite(target) || from < 1 || target < 1) throw new Error("Ungültige Schemaversion für Migrationspfad.");
    if (from === target) return [];
    if (from > target) throw new Error("Downgrade-Pfad von Datenschema " + from + " auf " + target + " wird nicht unterstützt.");
    const queue = [{ version:from, path:[] }];
    const visited = new Set([from]);
    while (queue.length) {
      const current = queue.shift();
      const outgoing = registry.filter(step => Number(step.from) === current.version).sort((a, b) => Number(a.to) - Number(b.to));
      for (const step of outgoing) {
        const nextPath = current.path.concat(step);
        if (Number(step.to) === target) return nextPath;
        if (!visited.has(Number(step.to)) && Number(step.to) <= target) {
          visited.add(Number(step.to));
          queue.push({ version:Number(step.to), path:nextPath });
        }
      }
    }
    throw new Error("Kein unterstützter Migrationspfad von Datenschema " + from + " auf " + target + " vorhanden.");
  }

  function normalizeValidationResult(result, fallbackMessage) {
    if (result === undefined || result === null || result === true) return { valid:true, errors:[], warnings:[] };
    if (result === false) return { valid:false, errors:[fallbackMessage], warnings:[] };
    const errors = Array.isArray(result.errors) ? result.errors.map(String) : [];
    const warnings = Array.isArray(result.warnings) ? result.warnings.map(String) : [];
    return { valid:result.valid !== false && errors.length === 0, errors, warnings };
  }

  function validatePhase(data, options, context) {
    if (typeof options.validateData !== "function") return { valid:true, errors:[], warnings:[] };
    return normalizeValidationResult(options.validateData(data, context), "Datenvalidierung fehlgeschlagen.");
  }

  function collectMigrationCandidates(data, targetSchemaVersion, path = "workingState") {
    const candidates = [];
    if (!data || typeof data !== "object" || Array.isArray(data)) return candidates;
    const version = currentDataSchemaVersion(data);
    if (version !== targetSchemaVersion) candidates.push({ path, version, targetSchemaVersion });
    if (Array.isArray(data.jahresArchiv)) {
      data.jahresArchiv.forEach((item, index) => {
        if (item && item.data && typeof item.data === "object" && !Array.isArray(item.data)) {
          candidates.push(...collectMigrationCandidates(item.data, targetSchemaVersion, path + ".jahresArchiv[" + index + "].data"));
        }
      });
    }
    return candidates;
  }

  function executeMigrationTransaction(data, options = {}) {
    const source = cloneWith(options, data);
    const sourceVersion = currentDataSchemaVersion(source);
    const targetSchemaVersion = Number(options.targetSchemaVersion || 5);
    let backup = null;
    let path = [];
    const warnings = [];
    const archiveMigrations = [];
    try {
      if (!source || typeof source !== "object" || Array.isArray(source)) throw new Error("Migrationsquelle ist keine gültige Datenstruktur.");
      if (sourceVersion > targetSchemaVersion) throw new Error("Datenschema " + sourceVersion + " ist neuer als die unterstützte Zielversion " + targetSchemaVersion + ".");
      path = findMigrationPath(sourceVersion, targetSchemaVersion, options.registry || MIGRATION_REGISTRY);
      const nestedCandidates = options.includeArchives !== false
        ? collectMigrationCandidates(source, targetSchemaVersion).filter(candidate => candidate.path !== "workingState")
        : [];
      const migrationRequired = path.length > 0 || nestedCandidates.length > 0;
      const beforeValidation = validatePhase(source, options, { phase:"beforeMigration", fromVersion:sourceVersion, targetSchemaVersion, path, nestedCandidates });
      warnings.push(...beforeValidation.warnings);
      if (!beforeValidation.valid) throw new Error("Vorprüfung fehlgeschlagen: " + beforeValidation.errors.join(" "));
      if (!migrationRequired) {
        return { status:"not-required", migrated:false, data:source, sourceVersion, targetSchemaVersion, path:[], archiveMigrations:[], warnings, backup:null };
      }

      if (typeof options.beforeMigration === "function") {
        backup = options.beforeMigration(cloneWith(options, source), {
          sourceVersion,
          targetSchemaVersion,
          path:path.map(step => step.id),
          descriptions:path.map(step => step.description),
          nestedCandidates:cloneWith(options, nestedCandidates)
        }) || null;
      }

      const working = cloneWith(options, source);
      if (!working.meta) working.meta = {};
      let version = sourceVersion;
      for (const step of path) {
        if (version !== Number(step.from)) throw new Error("Migrationspfad ist inkonsistent vor " + step.id + ".");
        const stepBefore = validatePhase(working, options, { phase:"beforeStep", step, fromVersion:version, targetSchemaVersion });
        warnings.push(...stepBefore.warnings);
        if (!stepBefore.valid) throw new Error("Vorprüfung für " + step.id + " fehlgeschlagen: " + stepBefore.errors.join(" "));
        step.migrate(working, options);
        version = Number(step.to);
        working.meta.dataSchemaVersion = version;
        recordDataMigration(working, Number(step.from), Number(step.to), step.description, { ...options, migrationId:step.id });
        const stepAfter = validatePhase(working, options, { phase:"afterStep", step, fromVersion:Number(step.from), toVersion:version, targetSchemaVersion });
        warnings.push(...stepAfter.warnings);
        if (!stepAfter.valid) throw new Error("Nachprüfung für " + step.id + " fehlgeschlagen: " + stepAfter.errors.join(" "));
      }
      if (version !== targetSchemaVersion) throw new Error("Migration endete mit Datenschema " + version + " statt " + targetSchemaVersion + ".");
      working.meta.dataSchemaVersion = targetSchemaVersion;
      working.meta.normalizedWithAppVersion = options.appVersion || "";

      if (options.includeArchives !== false && Array.isArray(working.jahresArchiv)) {
        working.jahresArchiv.forEach((item, index) => {
          if (!item || !item.data || item.data === working) return;
          const nested = executeMigrationTransaction(item.data, { ...options, includeArchives:false, beforeMigration:null });
          if (nested.status === "failed") throw new Error("Archivmigration jahresArchiv[" + index + "] fehlgeschlagen: " + String(nested.error && nested.error.message || nested.error));
          item.data = nested.data;
          item.schemaVersion = currentDataSchemaVersion(item.data);
          if (nested.migrated) archiveMigrations.push({ index, sourceVersion:nested.sourceVersion, targetSchemaVersion:nested.targetSchemaVersion, path:nested.path });
          warnings.push(...(nested.warnings || []));
        });
      }

      working.meta.lastMigrationTransaction = {
        status:"completed",
        completedAt:(options.now || (() => new Date().toISOString()))(),
        sourceVersion,
        targetVersion:targetSchemaVersion,
        path:path.map(step => step.id),
        archiveMigrations:archiveMigrations.map(item => ({ index:item.index, sourceVersion:item.sourceVersion, targetSchemaVersion:item.targetSchemaVersion, path:item.path.slice() })),
        backupId:backup && backup.metadata ? backup.metadata.backupId : ""
      };
      const afterValidation = validatePhase(working, options, { phase:"afterMigration", fromVersion:sourceVersion, targetSchemaVersion, path, archiveMigrations });
      warnings.push(...afterValidation.warnings);
      if (!afterValidation.valid) throw new Error("Nachprüfung fehlgeschlagen: " + afterValidation.errors.join(" "));

      return { status:"migrated", migrated:true, data:working, sourceVersion, targetSchemaVersion, path:path.map(step => step.id), archiveMigrations, warnings, backup };
    } catch (error) {
      const failure = {
        status:"failed",
        migrated:false,
        data:source,
        sourceVersion,
        targetSchemaVersion,
        path:path.map ? path.map(step => step.id || step) : [],
        archiveMigrations:[],
        warnings,
        backup,
        error
      };
      if (typeof options.onFailure === "function") {
        try { options.onFailure(failure); } catch (callbackError) {}
      }
      return failure;
    }
  }

  function migrateDataSchema(data, options = {}) {
    const result = executeMigrationTransaction(data, options);
    if (result.status === "failed") throw result.error;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      Object.keys(data).forEach(key => delete data[key]);
      Object.assign(data, cloneWith(options, result.data));
      return data;
    }
    return result.data;
  }

  global.NKProMigration = Object.freeze({
    MIGRATION_REGISTRY,
    currentDataSchemaVersion,
    recordDataMigration,
    simpleArchiveIdentityForMerge,
    mergePreloadedArchives,
    supportedMigrationRegistry,
    findMigrationPath,
    collectMigrationCandidates,
    executeMigrationTransaction,
    migrateDataSchema
  });
})(globalThis);
