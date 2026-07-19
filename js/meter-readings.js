(function (global) {
  "use strict";

  const READING_STANDARD_VERSION = 1;

  function cloneWith(options, value) {
    return options && typeof options.clone === "function" ? options.clone(value) : JSON.parse(JSON.stringify(value));
  }

  function text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function hasValue(value) {
    return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
  }

  function nowWith(options) {
    return (options && typeof options.now === "function" ? options.now : () => new Date().toISOString())();
  }

  function readingId(source, revision, master) {
    return "MW-" + master.hash(JSON.stringify([
      source.meterId,
      source.sourceKey,
      source.ablesedatum,
      source.wert,
      source.rolle,
      revision || 1
    ])).toUpperCase();
  }

  function normalizeReading(input, index, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const row = cloneWith(options, input || {});
    row.messwertId = text(row.messwertId || row.measurementId || row.id) || readingId(row, index + 1, master);
    row.measurementId = row.messwertId;
    row.id = row.messwertId;
    row.zaehlerId = text(row.zaehlerId || row.meterId);
    row.meterId = row.zaehlerId;
    row.ablesedatum = text(row.ablesedatum || row.readingDate || row.datum);
    row.messzeitpunkt = text(row.messzeitpunkt || row.readingTimestamp);
    row.messzeitraumVon = text(row.messzeitraumVon || row.periodStart || row.von);
    row.messzeitraumBis = text(row.messzeitraumBis || row.periodEnd || row.bis);
    if (row.wert === undefined) row.wert = row.value;
    row.einheit = text(row.einheit || row.unit);
    row.ableseart = text(row.ableseart || row.readingType) || "regulär";
    row.herkunft = text(row.herkunft || row.source) || "unbekannt";
    row.erfasstAm = text(row.erfasstAm || row.capturedAt) || nowWith(options);
    row.status = text(row.status || row.correctionStatus) || "active";
    row.ersetztMesswertId = text(row.ersetztMesswertId || row.replacesReadingId);
    row.plausibilitaetsstatus = text(row.plausibilitaetsstatus || row.plausibilityStatus) || "ungeprüft";
    row.abrechnungszeitraumId = text(row.abrechnungszeitraumId || row.billingPeriodId);
    row.rolle = text(row.rolle || row.role);
    row.sourceKey = text(row.sourceKey);
    row.sourcePath = text(row.sourcePath);
    row.readingStandardVersion = READING_STANDARD_VERSION;
    return row;
  }

  function readingEquivalent(a, b) {
    return text(a.zaehlerId || a.meterId) === text(b.zaehlerId || b.meterId) &&
      text(a.ablesedatum) === text(b.ablesedatum) &&
      text(a.messzeitpunkt) === text(b.messzeitpunkt) &&
      text(a.messzeitraumVon) === text(b.messzeitraumVon) &&
      text(a.messzeitraumBis) === text(b.messzeitraumBis) &&
      Number(a.wert) === Number(b.wert) &&
      text(a.einheit) === text(b.einheit) &&
      text(a.rolle) === text(b.rolle);
  }

  function activeReading(row) {
    const status = text(row && row.status).toLowerCase();
    return status !== "cancelled" && status !== "storniert" && status !== "corrected" && status !== "ersetzt" && status !== "replaced" && status !== "documented-only";
  }


  function currentSourceReading(row) {
    const status = text(row && row.status).toLowerCase();
    return status !== "cancelled" && status !== "storniert" && status !== "corrected" && status !== "ersetzt" && status !== "replaced";
  }

  function markLegacyPlaceholderDuplicates(rows) {
    const groups = new Map();
    rows.filter(row => currentSourceReading(row) && (row.herkunft === "legacy-waterMeters" || row.herkunft === "legacy-meterReadings")).forEach(row => {
      const key = [text(row.zaehlerId), text(row.ablesedatum), text(row.rolle), text(row.einheit)].join("|");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });
    groups.forEach(group => {
      const nonZero = group.filter(row => Number(row.wert) !== 0);
      if (!nonZero.length) return;
      group.filter(row => Number(row.wert) === 0).forEach(row => {
        row.status = "documented-only";
        row.plausibilitaetsstatus = "legacy-placeholder";
        row.ausschlussgrund = "Nullwert aus zusätzlicher nutzerindexierter Legacy-Zeile; physischer Zählerstand derselben Messstelle ist separat erhalten.";
      });
    });
    return rows;
  }

  function periodId(data, master) {
    const period = master.billingPeriod(data);
    return period.start && period.end ? "AZ-" + period.start + "-" + period.end : "AZ-UNBEKANNT";
  }

  function meterByLegacyKey(container, key) {
    return (container.zaehler || []).find(meter => text(meter.legacySourceKey) === key || (Array.isArray(meter.legacySourceKeys) && meter.legacySourceKeys.map(text).includes(key))) || null;
  }

  function actualTenants(data) {
    return (Array.isArray(data && data.mieter) ? data.mieter : []).map((row, index) => ({ row:row || {}, index })).filter(item => !!(text(item.row.id) || text(item.row.wohnung) || text(item.row.name)));
  }

  function legacyReadingSources(data, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const container = master.ensureMeteringContainer(data, options);
    const billingId = periodId(data, master);
    const period = master.billingPeriod(data);
    const result = [];
    const tenants = actualTenants(data);
    const waterRows = data && data.waterMeters && Array.isArray(data.waterMeters.readings) ? data.waterMeters.readings : [];
    tenants.forEach(item => {
      const tenant = item.row;
      const index = item.index;
      const unitId = text(tenant.wohnung);
      const row = waterRows[index];
      if (!row || !unitId) return;
      for (const config of [
        { legacyKey:"water-cold:" + unitId, prefix:"kw", type:"cold-water" },
        { legacyKey:"water-hot:" + unitId, prefix:"ww", type:"hot-water" }
      ]) {
        const meter = meterByLegacyKey(container, config.legacyKey);
        if (!meter) continue;
        for (const role of ["start", "end"]) {
          const suffix = role === "start" ? "Start" : "End";
          const value = row[config.prefix + suffix];
          const date = text(row[config.prefix + suffix + "Date"]);
          if (!hasValue(value)) continue;
          result.push({
            meterId:meter.meterId,
            zaehlerId:meter.meterId,
            sourceKey:["legacy-water", meter.meterId, text(tenant.id) || index, role, billingId].join(":"),
            sourcePath:"waterMeters.readings[" + index + "]." + config.prefix + suffix,
            ablesedatum:date || (role === "start" ? period.start : period.end),
            messzeitraumVon:period.start,
            messzeitraumBis:period.end,
            wert:Number(value),
            einheit:text(meter.einheit) || "m³",
            ableseart:role === "start" ? "Anfangsablesung" : "Endablesung",
            herkunft:"legacy-waterMeters",
            rolle:role,
            abrechnungszeitraumId:billingId,
            plausibilitaetsstatus:"ungeprüft",
            assignmentHint:{ tenantId:text(tenant.id), unitId, legacyIndex:index }
          });
        }
      }
    });

    const generic = data && data.meterReadings && data.meterReadings.readings && typeof data.meterReadings.readings === "object" ? data.meterReadings.readings : {};
    Object.keys(generic).sort().forEach(costId => {
      const rows = Array.isArray(generic[costId]) ? generic[costId] : [];
      tenants.forEach(item => {
        const tenant = item.row;
        const index = item.index;
        const unitId = text(tenant.wohnung);
        const row = rows[index];
        if (!row || !unitId) return;
        const meter = meterByLegacyKey(container, "generic:" + costId + ":" + unitId);
        if (!meter) return;
        for (const role of ["start", "end"]) {
          const value = role === "start" ? (row.start !== undefined ? row.start : row.startValue) : (row.end !== undefined ? row.end : row.endValue);
          const date = text(role === "start" ? (row.startDate || row.von) : (row.endDate || row.bis));
          if (!hasValue(value)) continue;
          result.push({
            meterId:meter.meterId,
            zaehlerId:meter.meterId,
            sourceKey:["legacy-generic", meter.meterId, text(tenant.id) || index, role, billingId].join(":"),
            sourcePath:"meterReadings.readings." + costId + "[" + index + "]." + role,
            ablesedatum:date || (role === "start" ? period.start : period.end),
            messzeitraumVon:period.start,
            messzeitraumBis:period.end,
            wert:Number(value),
            einheit:text(meter.einheit) || "Einheit",
            ableseart:role === "start" ? "Anfangsablesung" : "Endablesung",
            herkunft:"legacy-meterReadings",
            rolle:role,
            abrechnungszeitraumId:billingId,
            plausibilitaetsstatus:"ungeprüft",
            assignmentHint:{ tenantId:text(tenant.id), unitId, legacyIndex:index, costId }
          });
        }
      });
    });
    return result;
  }

  function embeddedReadingSources(data, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const container = master.ensureMeteringContainer(data, options);
    const originalMeters = data && data.objektStandard && Array.isArray(data.objektStandard.zaehler) ? data.objektStandard.zaehler : [];
    const result = [];
    originalMeters.forEach((meter, meterIndex) => {
      const readings = Array.isArray(meter && meter.zaehlerstaende) ? meter.zaehlerstaende : [];
      if (!readings.length) return;
      const legacyId = text(meter.meterId || meter.zaehlerId || meter.id);
      const target = (container.zaehler || []).find(row => row.meterId === legacyId || (row.legacyMeterIds || []).includes(legacyId)) || null;
      if (!target) return;
      readings.forEach((reading, readingIndex) => {
        if (!reading || !hasValue(reading.wert !== undefined ? reading.wert : reading.value)) return;
        result.push({
          meterId:target.meterId,
          zaehlerId:target.meterId,
          sourceKey:["embedded-v99.4.5", legacyId, reading.rolle || readingIndex, reading.datum || ""].join(":"),
          sourcePath:"objektStandard.zaehler[" + meterIndex + "].zaehlerstaende[" + readingIndex + "]",
          ablesedatum:text(reading.datum || reading.ablesedatum),
          wert:Number(reading.wert !== undefined ? reading.wert : reading.value),
          einheit:text(reading.einheit || target.einheit),
          ableseart:text(reading.ableseart) || "Migration V99.4.5",
          herkunft:"objektStandard-v1",
          rolle:text(reading.rolle),
          plausibilitaetsstatus:"ungeprüft"
        });
      });
    });
    return result;
  }

  function synchronizeReadings(data, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const container = master.ensureMeteringContainer(data, options);
    const existing = (container.messwerte || []).map((row, index) => normalizeReading(row, index, { ...options, master }));
    const sources = legacyReadingSources(data, { ...options, master }).concat(embeddedReadingSources(data, { ...options, master }));
    const encountered = new Set();
    sources.forEach(source => {
      encountered.add(source.sourceKey);
      const candidates = existing.filter(row => row.sourceKey === source.sourceKey);
      const active = candidates.filter(currentSourceReading).sort((a, b) => text(b.erfasstAm).localeCompare(text(a.erfasstAm)))[0];
      const normalizedSource = normalizeReading(source, candidates.length, { ...options, master });
      if (active && readingEquivalent(active, normalizedSource)) return;
      if (active) {
        active.status = "corrected";
        active.korrigiertAm = nowWith(options);
        active.plausibilitaetsstatus = "ersetzt";
      }
      const revision = candidates.length + 1;
      normalizedSource.messwertId = readingId(normalizedSource, revision, master);
      normalizedSource.measurementId = normalizedSource.messwertId;
      normalizedSource.id = normalizedSource.messwertId;
      normalizedSource.status = "active";
      normalizedSource.erfasstAm = nowWith(options);
      normalizedSource.ersetztMesswertId = active ? active.messwertId : "";
      if (active) normalizedSource.ableseart = "Korrekturablesung";
      existing.push(normalizedSource);
    });

    const currentPeriodId = periodId(data, master);
    existing.forEach(row => {
      if (!activeReading(row) || !row.sourceKey || encountered.has(row.sourceKey)) return;
      if ((row.herkunft === "legacy-waterMeters" || row.herkunft === "legacy-meterReadings") && text(row.abrechnungszeitraumId) === currentPeriodId) {
        row.status = "cancelled";
        row.storniertAm = nowWith(options);
        row.plausibilitaetsstatus = "storniert";
      }
    });
    markLegacyPlaceholderDuplicates(existing);
    container.messwerte = existing;
    container.readingStandardVersion = READING_STANDARD_VERSION;
    return existing;
  }

  global.NKProMeterReadings = Object.freeze({
    READING_STANDARD_VERSION,
    hasValue,
    activeReading,
    currentSourceReading,
    markLegacyPlaceholderDuplicates,
    normalizeReading,
    readingEquivalent,
    legacyReadingSources,
    embeddedReadingSources,
    synchronizeReadings
  });
})(globalThis);
