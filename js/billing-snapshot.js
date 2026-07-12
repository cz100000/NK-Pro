(function (global) {
  "use strict";

  const BILLING_SNAPSHOT_FORMAT = "nk-pro-billing-snapshot";
  const BILLING_SNAPSHOT_VERSION = 1;
  const BILLING_SNAPSHOT_STATUS_COMPLETE = "complete";
  const BILLING_SNAPSHOT_STATUS_LEGACY_PARTIAL = "legacy-partial";

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
    const text = String(value === undefined || value === null ? "" : value);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
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

  function text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function issue(code, severity, path, message, entityId) {
    return { code, severity, path, message, entityId:text(entityId) };
  }

  function resultFromIssues(issues) {
    const errors = issues.filter(item => item.severity === "error");
    const warnings = issues.filter(item => item.severity === "warning");
    const infos = issues.filter(item => item.severity === "info");
    return { valid:errors.length === 0, errors, warnings, infos, issues };
  }

  function validDate(value) {
    return !!text(value) && Number.isFinite(Date.parse(text(value)));
  }

  function dateValue(value, fallback) {
    const parsed = Date.parse(text(value));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function intervalOverlaps(aStart, aEnd, bStart, bEnd) {
    const startA = dateValue(aStart, Number.NEGATIVE_INFINITY);
    const endA = dateValue(aEnd, Number.POSITIVE_INFINITY);
    const startB = dateValue(bStart, Number.NEGATIVE_INFINITY);
    const endB = dateValue(bEnd, Number.POSITIVE_INFINITY);
    return startA <= endB && startB <= endA;
  }

  function uniqueIds(rows, keys, path, codePrefix, issues) {
    const seen = new Set();
    (Array.isArray(rows) ? rows : []).forEach((row, index) => {
      const id = keys.map(key => text(row && row[key])).find(Boolean);
      if (!id) issues.push(issue(codePrefix + "_ID_MISSING", "error", path + "[" + index + "]", "Eindeutige ID fehlt."));
      else if (seen.has(id)) issues.push(issue(codePrefix + "_ID_DUPLICATE", "error", path + "[" + index + "]", "ID ist doppelt: " + id, id));
      else seen.add(id);
    });
    return seen;
  }

  function meterReadingValues(meter) {
    const readings = Array.isArray(meter && meter.zaehlerstaende) ? meter.zaehlerstaende : [];
    const start = readings.find(row => text(row && row.rolle).toLowerCase() === "start") || readings[0] || {};
    const end = readings.find(row => text(row && row.rolle).toLowerCase() === "end") || readings[1] || {};
    return { start, end };
  }

  function validateBillingReadiness(data, options = {}) {
    const issues = [];
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      issues.push(issue("BILLING_DATA_MISSING", "error", "data", "Abrechnungsdaten fehlen."));
      return resultFromIssues(issues);
    }
    const standard = options.objectStandard || data.objektStandard;
    if (options.objectStandardModule && typeof options.objectStandardModule.validateObjectStandard === "function") {
      const objectValidation = options.objectStandardModule.validateObjectStandard(standard || data, options);
      (objectValidation.issues || []).forEach(item => issues.push(cloneWith(options, item)));
    } else if (!standard) {
      issues.push(issue("OBJECT_STANDARD_MISSING", "error", "objektStandard", "Objektstandard fehlt."));
    }

    const meta = data.meta || {};
    const periodStart = text(options.periodStart || meta.abrechnungsbeginn || (meta.abrechnungsjahr ? meta.abrechnungsjahr + "-01-01" : ""));
    const periodEnd = text(options.periodEnd || meta.abrechnungsende || (meta.abrechnungsjahr ? meta.abrechnungsjahr + "-12-31" : ""));
    if (!validDate(periodStart) || !validDate(periodEnd)) issues.push(issue("BILLING_PERIOD_INVALID", "error", "meta.abrechnungsbeginn", "Abrechnungszeitraum ist unvollständig oder ungültig."));
    else if (Date.parse(periodEnd) < Date.parse(periodStart)) issues.push(issue("BILLING_PERIOD_REVERSED", "error", "meta.abrechnungsende", "Abrechnungsende liegt vor dem Abrechnungsbeginn."));

    const units = standard && Array.isArray(standard.einheiten) ? standard.einheiten : [];
    const unitIds = uniqueIds(units, ["einheitId", "id"], "objektStandard.einheiten", "UNIT", issues);
    const contracts = standard && Array.isArray(standard.vertraege) ? standard.vertraege : [];
    const partnerRows = standard && Array.isArray(standard.partner) ? standard.partner : [];
    const partnerIds = uniqueIds(partnerRows, ["partnerId", "id"], "objektStandard.partner", "PARTNER", issues);
    uniqueIds(contracts, ["vertragId", "id"], "objektStandard.vertraege", "CONTRACT", issues);

    const relevantContracts = contracts.filter(row => intervalOverlaps(row && (row.beginn || row.einzug), row && (row.ende || row.auszug), periodStart, periodEnd));
    relevantContracts.forEach((row, index) => {
      const unitId = text(row && row.einheitId);
      const partnerId = text(row && row.partnerId);
      if (!unitId || !unitIds.has(unitId)) issues.push(issue("CONTRACT_UNIT_INVALID", "error", "objektStandard.vertraege[" + index + "].einheitId", "Miet-/Nutzungsverhältnis ist keiner gültigen Einheit zugeordnet.", row && (row.vertragId || row.id)));
      if (!partnerId || !partnerIds.has(partnerId)) issues.push(issue("CONTRACT_PARTNER_INVALID", "error", "objektStandard.vertraege[" + index + "].partnerId", "Miet-/Nutzungsverhältnis ist keinem gültigen Partner zugeordnet.", row && (row.vertragId || row.id)));
      const start = text(row && (row.beginn || row.einzug));
      const end = text(row && (row.ende || row.auszug));
      if (start && !validDate(start)) issues.push(issue("CONTRACT_START_INVALID", "error", "objektStandard.vertraege[" + index + "].beginn", "Vertragsbeginn ist ungültig.", row && (row.vertragId || row.id)));
      if (end && !validDate(end)) issues.push(issue("CONTRACT_END_INVALID", "error", "objektStandard.vertraege[" + index + "].ende", "Vertragsende ist ungültig.", row && (row.vertragId || row.id)));
      if (validDate(start) && validDate(end) && Date.parse(end) < Date.parse(start)) issues.push(issue("CONTRACT_PERIOD_REVERSED", "error", "objektStandard.vertraege[" + index + "]", "Vertragsende liegt vor dem Vertragsbeginn.", row && (row.vertragId || row.id)));
    });

    const byUnit = new Map();
    relevantContracts.forEach(row => {
      const unitId = text(row && row.einheitId);
      if (!unitId) return;
      if (!byUnit.has(unitId)) byUnit.set(unitId, []);
      byUnit.get(unitId).push(row);
    });
    byUnit.forEach((rows, unitId) => {
      for (let left = 0; left < rows.length; left += 1) {
        for (let right = left + 1; right < rows.length; right += 1) {
          const a = rows[left];
          const b = rows[right];
          if (intervalOverlaps(a.beginn || a.einzug, a.ende || a.auszug, b.beginn || b.einzug, b.ende || b.auszug)) {
            issues.push(issue("CONTRACT_OVERLAP", "error", "objektStandard.vertraege", "Zeitabhängige Nutzer-/Vertragszuordnungen überschneiden sich für Einheit " + unitId + ".", unitId));
          }
        }
      }
    });

    units.filter(row => text(row && row.status).toLowerCase() !== "inaktiv").forEach(row => {
      const unitId = text(row && (row.einheitId || row.id));
      if (unitId && !(byUnit.get(unitId) || []).length) issues.push(issue("UNIT_WITHOUT_PERIOD_ASSIGNMENT", "warning", "objektStandard.einheiten", "Aktive Einheit besitzt im Abrechnungszeitraum keine Nutzer-/Vertragszuordnung.", unitId));
    });

    const costs = Array.isArray(data.kostenarten) ? data.kostenarten : [];
    const activeCosts = costs.filter(row => row && row.inNK === "Ja" && Math.abs(Number(row.gesamtbetrag) || 0) > 0.000001);
    activeCosts.forEach((cost, index) => {
      const key = text(cost.umlageschluessel);
      if (!key || key === "Entfällt") issues.push(issue("COST_DISTRIBUTION_KEY_MISSING", "error", "kostenarten[" + index + "].umlageschluessel", "Aktive Kostenart besitzt keinen gültigen Verteilerschlüssel.", cost.id));
      if (key === "Wohnfläche") {
        units.filter(row => text(row && row.status).toLowerCase() !== "inaktiv").forEach(unit => {
          const area = Number(unit && (unit.wohnflaeche !== undefined ? unit.wohnflaeche : unit.verteilungsgrundlagen && unit.verteilungsgrundlagen.wohnflaeche));
          if (!Number.isFinite(area) || area <= 0) issues.push(issue("UNIT_AREA_MISSING", "error", "objektStandard.einheiten", "Wohnfläche als Verteilungsgrundlage fehlt oder ist ungültig.", unit && (unit.einheitId || unit.id)));
        });
      }
    });

    const meters = standard && Array.isArray(standard.zaehler) ? standard.zaehler : [];
    const objectStandardModule = options.objectStandardModule;
    const relevantMeters = objectStandardModule && typeof objectStandardModule.billingRelevantMeters === "function"
      ? objectStandardModule.billingRelevantMeters(standard) : meters.filter(row => row && row.abrechnungsrelevant !== false);
    const excludedMeterIds = [];
    meters.forEach((meter, index) => {
      const meterId = text(meter && (meter.meterId || meter.zaehlerId || meter.id));
      const dummy = objectStandardModule && typeof objectStandardModule.isElectricityDummyMeter === "function"
        ? objectStandardModule.isElectricityDummyMeter(meter) : text(meter && meter.meterType).toLowerCase() === "electricity-dummy";
      if (dummy) {
        excludedMeterIds.push(meterId);
        if (meter.abrechnungsrelevant !== false || text(meter.billingRole) !== "excluded") issues.push(issue("ELECTRICITY_DUMMY_NOT_EXCLUDED", "error", "objektStandard.zaehler[" + index + "]", "Stromzähler-Dummy muss eindeutig nicht abrechnungsrelevant sein.", meterId));
        else issues.push(issue("ELECTRICITY_DUMMY_EXCLUDED", "info", "objektStandard.zaehler[" + index + "]", "Stromzähler-Dummy ist aus der Abrechnung ausgeschlossen.", meterId));
      }
    });

    const consumptionCosts = activeCosts.filter(cost => text(cost.umlageschluessel) === "Verbrauch");
    consumptionCosts.forEach(cost => {
      const costId = text(cost.id);
      const candidateMeters = relevantMeters.filter(meter => {
        if (text(meter.kostenId)) return text(meter.kostenId) === costId;
        return costId === "K002" && ["cold-water", "hot-water"].includes(text(meter.meterType));
      });
      if (!candidateMeters.length) issues.push(issue("CONSUMPTION_METER_MISSING", "error", "objektStandard.zaehler", "Für die Verbrauchskostenart fehlt ein abrechnungsrelevanter Zähler.", costId));
      candidateMeters.forEach(meter => {
        const values = meterReadingValues(meter);
        const start = Number(values.start && values.start.wert);
        const end = Number(values.end && values.end.wert);
        if (!Number.isFinite(start) || !Number.isFinite(end)) issues.push(issue("METER_READING_MISSING", "error", "objektStandard.zaehler", "Erforderlicher Anfangs- oder Endstand fehlt.", meter.meterId || meter.zaehlerId));
        else if (end < start) issues.push(issue("METER_READING_IMPLAUSIBLE", "error", "objektStandard.zaehler", "Zählerendstand liegt unter dem Anfangsstand.", meter.meterId || meter.zaehlerId));
        if (!validDate(values.start && values.start.datum) || !validDate(values.end && values.end.datum)) issues.push(issue("METER_READING_DATE_MISSING", "error", "objektStandard.zaehler", "Datum für Anfangs- oder Endstand fehlt.", meter.meterId || meter.zaehlerId));
      });
    });

    const prepayments = Array.isArray(data.vorauszahlungen) ? data.vorauszahlungen : [];
    activeCosts.filter(cost => cost.vorauszahlung === "Ja").forEach(cost => {
      const row = prepayments.find(item => text(item && item.kostenId) === text(cost.id));
      if (!row) issues.push(issue("PREPAYMENT_ASSIGNMENT_MISSING", "error", "vorauszahlungen", "Vorauszahlungen sind der Kostenart nicht zugeordnet.", cost.id));
      else if (!Array.isArray(row.werte)) issues.push(issue("PREPAYMENT_VALUES_INVALID", "error", "vorauszahlungen", "Vorauszahlungswerte fehlen oder sind ungültig.", cost.id));
      else if (row.werte.length < (Array.isArray(data.mieter) ? data.mieter.length : 0)) issues.push(issue("PREPAYMENT_VALUES_INCOMPLETE", "error", "vorauszahlungen", "Vorauszahlungswerte sind nicht für alle Abrechnungsdatensätze vorhanden.", cost.id));
    });

    const result = resultFromIssues(issues);
    result.period = { start:periodStart, end:periodEnd, year:text(meta.abrechnungsjahr) };
    result.meterSelection = {
      included:relevantMeters.map(meter => text(meter && (meter.meterId || meter.zaehlerId || meter.id))).filter(Boolean),
      excluded:excludedMeterIds.filter(Boolean)
    };
    return result;
  }

  function snapshotPayloadForChecksum(snapshot, options = {}) {
    const copy = cloneWith(options, snapshot || {});
    delete copy.integrity;
    return copy;
  }

  function snapshotId(options, createdAt, objectId, period, checksum) {
    if (options && options.snapshotId) return text(options.snapshotId);
    let nonce = "";
    try {
      if (global.crypto && typeof global.crypto.randomUUID === "function") nonce = global.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    } catch (error) {}
    if (!nonce) nonce = Math.random().toString(36).slice(2, 14);
    const stamp = text(createdAt).replace(/[^0-9]/g, "").slice(0, 14);
    return ["nkpro-snapshot", text(objectId) || "object", text(period && period.start), text(period && period.end), stamp, checksum, nonce].join("-");
  }

  function createBillingSnapshot(data, options = {}) {
    const readiness = options.validation || validateBillingReadiness(data, options);
    if (!readiness.valid) {
      const error = new Error("Abrechnungssnapshot kann wegen kritischer Validierungsfehler nicht erstellt werden: " + readiness.errors.map(item => item.message).join(" "));
      error.validation = readiness;
      throw error;
    }
    const createdAt = nowWith(options);
    const standard = cloneWith(options, options.objectStandard || data.objektStandard || {});
    const objectId = text(standard.objekt && (standard.objekt.id || standard.objekt.objektId));
    const period = cloneWith(options, readiness.period || {});
    const boundedData = typeof options.createBoundedData === "function" ? options.createBoundedData(data) : cloneWith(options, data);
    boundedData.objektStandard = standard;
    const base = {
      snapshotFormat:BILLING_SNAPSHOT_FORMAT,
      snapshotVersion:BILLING_SNAPSHOT_VERSION,
      snapshotStatus:BILLING_SNAPSHOT_STATUS_COMPLETE,
      snapshotCompleteness:"complete",
      immutable:true,
      objectId,
      period,
      createdAt,
      appVersion:text(options.appVersion),
      dataSchemaVersion:Number(options.dataSchemaVersion || data && data.meta && data.meta.dataSchemaVersion || 1),
      dataLayerContractVersion:Number(options.dataLayerContractVersion || data && data.meta && data.meta.dataLayerContractVersion || 1),
      objectStandardVersion:Number(standard.version || standard.objectStandardVersion || options.objectStandardVersion || 1),
      validation:{
        valid:true,
        checkedAt:createdAt,
        errors:[],
        warnings:cloneWith(options, readiness.warnings || []),
        infos:cloneWith(options, readiness.infos || [])
      },
      meterSelection:cloneWith(options, readiness.meterSelection || { included:[], excluded:[] }),
      calculation:cloneWith(options, options.calculation || {}),
      summary:cloneWith(options, options.summary || {}),
      data:boundedData
    };
    if (options.envelopeFields && typeof options.envelopeFields === "object" && !Array.isArray(options.envelopeFields)) {
      Object.assign(base, cloneWith(options, options.envelopeFields));
    }
    const provisionalChecksum = hashWith(options, JSON.stringify(base));
    base.snapshotId = snapshotId(options, createdAt, objectId, period, provisionalChecksum);
    base.integrity = {
      algorithm:text(options.checksumAlgorithm) || "FNV1A32",
      checksum:hashWith(options, JSON.stringify(snapshotPayloadForChecksum(base, options)))
    };
    return deepFreeze(base);
  }

  function validateBillingSnapshot(snapshot, options = {}) {
    const issues = [];
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
      issues.push(issue("SNAPSHOT_MISSING", "error", "snapshot", "Abrechnungssnapshot fehlt."));
      return resultFromIssues(issues);
    }
    if (snapshot.snapshotFormat !== BILLING_SNAPSHOT_FORMAT) issues.push(issue("SNAPSHOT_FORMAT_INVALID", "error", "snapshotFormat", "Snapshot-Format ist ungültig."));
    if (Number(snapshot.snapshotVersion) !== BILLING_SNAPSHOT_VERSION) issues.push(issue("SNAPSHOT_VERSION_INVALID", "error", "snapshotVersion", "Snapshot-Version ist nicht unterstützt."));
    if (snapshot.snapshotStatus !== BILLING_SNAPSHOT_STATUS_COMPLETE) issues.push(issue("SNAPSHOT_NOT_COMPLETE", "error", "snapshotStatus", "Snapshot ist nicht als vollständig gekennzeichnet."));
    if (snapshot.immutable !== true) issues.push(issue("SNAPSHOT_NOT_IMMUTABLE", "error", "immutable", "Snapshot ist nicht als unveränderlich gekennzeichnet."));
    if (!text(snapshot.snapshotId)) issues.push(issue("SNAPSHOT_ID_MISSING", "error", "snapshotId", "Snapshot-ID fehlt."));
    if (!text(snapshot.objectId)) issues.push(issue("SNAPSHOT_OBJECT_ID_MISSING", "error", "objectId", "Objekt-ID im Snapshot fehlt."));
    if (!snapshot.period || !validDate(snapshot.period.start) || !validDate(snapshot.period.end) || Date.parse(snapshot.period.end) < Date.parse(snapshot.period.start)) issues.push(issue("SNAPSHOT_PERIOD_INVALID", "error", "period", "Abrechnungszeitraum im Snapshot ist ungültig."));
    for (const key of ["dataSchemaVersion", "dataLayerContractVersion", "objectStandardVersion"]) {
      if (!Number.isFinite(Number(snapshot[key])) || Number(snapshot[key]) < 1) issues.push(issue("SNAPSHOT_METADATA_INVALID", "error", key, "Snapshot-Metadatum ist ungültig: " + key));
    }
    if (!snapshot.data || typeof snapshot.data !== "object") issues.push(issue("SNAPSHOT_DATA_MISSING", "error", "data", "Snapshot-Daten fehlen."));
    if (!snapshot.data || !snapshot.data.objektStandard) issues.push(issue("SNAPSHOT_OBJECT_STANDARD_MISSING", "error", "data.objektStandard", "Objektstandard fehlt im Snapshot."));
    const included = new Set(snapshot.meterSelection && Array.isArray(snapshot.meterSelection.included) ? snapshot.meterSelection.included.map(text) : []);
    const excluded = snapshot.meterSelection && Array.isArray(snapshot.meterSelection.excluded) ? snapshot.meterSelection.excluded.map(text) : [];
    excluded.forEach(id => { if (included.has(id)) issues.push(issue("SNAPSHOT_EXCLUDED_METER_INCLUDED", "error", "meterSelection", "Nicht abrechnungsrelevanter Zähler ist in der Berechnung enthalten.", id)); });
    if (!snapshot.integrity || !text(snapshot.integrity.checksum)) issues.push(issue("SNAPSHOT_CHECKSUM_MISSING", "error", "integrity", "Snapshot-Prüfsumme fehlt."));
    else {
      const actual = hashWith(options, JSON.stringify(snapshotPayloadForChecksum(snapshot, options)));
      if (actual !== snapshot.integrity.checksum) issues.push(issue("SNAPSHOT_CHECKSUM_INVALID", "error", "integrity.checksum", "Snapshot-Prüfsumme stimmt nicht überein."));
    }
    return resultFromIssues(issues);
  }

  function legacySnapshotId(item, options = {}) {
    const year = text(item && item.year || item && item.meta && item.meta.abrechnungsjahr);
    const periodId = text(item && item.periodId);
    const checksum = hashWith(options, JSON.stringify(item && item.data || {}));
    return ["nkpro-legacy-snapshot", year || "unknown", periodId || "period", checksum].join("-");
  }

  function markLegacySnapshot(item, options = {}) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;
    if (item.snapshotFormat === BILLING_SNAPSHOT_FORMAT && item.snapshotStatus === BILLING_SNAPSHOT_STATUS_COMPLETE) return item;
    const copy = cloneWith(options, item);
    copy.snapshotFormat = BILLING_SNAPSHOT_FORMAT;
    copy.snapshotVersion = BILLING_SNAPSHOT_VERSION;
    copy.snapshotStatus = BILLING_SNAPSHOT_STATUS_LEGACY_PARTIAL;
    copy.snapshotCompleteness = "historical-not-fully-reconstructable";
    copy.immutable = true;
    copy.snapshotId = text(copy.snapshotId) || legacySnapshotId(copy, options);
    copy.objectId = text(copy.objectId || copy.data && copy.data.meta && copy.data.meta.objektId || copy.meta && copy.meta.objektId);
    copy.objectStandardVersion = Number(copy.objectStandardVersion || copy.data && copy.data.meta && copy.data.meta.objectStandardVersion || 0);
    copy.legacySnapshotNotice = "Historischer Abrechnungsstand: vollständige Rekonstruktion des neuen Objektstandards ist nicht garantiert; fachliche Originaldaten bleiben unverändert erhalten.";
    return copy;
  }

  global.NKProBillingSnapshot = Object.freeze({
    BILLING_SNAPSHOT_FORMAT,
    BILLING_SNAPSHOT_VERSION,
    BILLING_SNAPSHOT_STATUS_COMPLETE,
    BILLING_SNAPSHOT_STATUS_LEGACY_PARTIAL,
    validateBillingReadiness,
    createBillingSnapshot,
    validateBillingSnapshot,
    markLegacySnapshot,
    deepFreeze
  });
})(globalThis);
