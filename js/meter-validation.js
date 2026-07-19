(function (global) {
  "use strict";

  const METERING_STANDARD_VERSION = 1;
  const STARTUP_SAFE_VALIDATION_CODES = Object.freeze(new Set([
    "METER_READING_REVERSED",
    "MEASUREMENT_PERIOD_ASSIGNMENT_MISSING",
    "METER_PERIOD_MISSING"
  ]));

  function cloneWith(options, value) {
    return options && typeof options.clone === "function" ? options.clone(value) : JSON.parse(JSON.stringify(value));
  }

  function text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function issue(code, severity, entityType, entityId, path, message, correctionHint) {
    return {
      code,
      severity,
      entity:entityType,
      entityType,
      entityId:text(entityId),
      path:text(path),
      dataPath:text(path),
      message:text(message),
      correctionHint:text(correctionHint)
    };
  }

  function resultFromIssues(issues) {
    const errors = issues.filter(item => item.severity === "error");
    const warnings = issues.filter(item => item.severity === "warning");
    const infos = issues.filter(item => item.severity === "info");
    return { valid:errors.length === 0, errors, warnings, infos, issues };
  }

  function modules(options = {}) {
    return {
      master:options.master || global.NKProMeterMaster,
      readings:options.readings || global.NKProMeterReadings,
      periods:options.periods || global.NKProMeterPeriods
    };
  }

  function requiresMeteringMigration(data) {
    const container = data && data.zaehlerDaten;
    if (!container || typeof container !== "object" || Array.isArray(container)) return true;
    if (Number(container.version || container.meteringDataVersion) !== METERING_STANDARD_VERSION) return true;
    if (!Array.isArray(container.zaehler) || !Array.isArray(container.messwerte) || !Array.isArray(container.messperioden) || !Array.isArray(container.zuordnungen) || !Array.isArray(container.zaehlerwechsel)) return true;
    const embedded = data && data.objektStandard && Array.isArray(data.objektStandard.zaehler) && data.objektStandard.zaehler.some(row => Array.isArray(row && row.zaehlerstaende) && row.zaehlerstaende.length);
    return !!embedded;
  }

  function synchronizeMeteringData(data, options = {}) {
    const deps = modules(options);
    const container = deps.master.ensureMeteringContainer(data, options);
    deps.master.normalizeMeterMasters(data, { ...options, master:deps.master });
    deps.readings.synchronizeReadings(data, { ...options, master:deps.master });
    deps.periods.synchronizeAssignments(data, { ...options, master:deps.master });
    deps.periods.synchronizeReplacements(data, { ...options, master:deps.master });
    deps.periods.buildMeasurementPeriods(data, { ...options, master:deps.master, readings:deps.readings });
    container.version = METERING_STANDARD_VERSION;
    container.meteringStandardVersion = METERING_STANDARD_VERSION;
    container.meterMasterStandardVersion = deps.master.METER_MASTER_STANDARD_VERSION;
    container.readingStandardVersion = deps.readings.READING_STANDARD_VERSION;
    container.measurementPeriodStandardVersion = deps.periods.MEASUREMENT_PERIOD_STANDARD_VERSION;
    container.assignmentStandardVersion = deps.periods.ASSIGNMENT_STANDARD_VERSION;
    container.replacementStandardVersion = deps.periods.REPLACEMENT_STANDARD_VERSION;
    container.updatedAt = (options.now || (() => new Date().toISOString()))();
    container.updatedWithAppVersion = text(options.appVersion);
    if (!data.meta || typeof data.meta !== "object") data.meta = {};
    data.meta.meteringStandardVersion = METERING_STANDARD_VERSION;
    data.meta.meterMasterStandardVersion = deps.master.METER_MASTER_STANDARD_VERSION;
    data.meta.readingStandardVersion = deps.readings.READING_STANDARD_VERSION;
    data.meta.measurementPeriodStandardVersion = deps.periods.MEASUREMENT_PERIOD_STANDARD_VERSION;
    return container;
  }

  function validateMeteringData(data, options = {}) {
    const deps = modules(options);
    const issues = [];
    const container = data && data.zaehlerDaten;
    if (!container || typeof container !== "object" || Array.isArray(container)) {
      issues.push(issue("METERING_DATA_MISSING", "error", "metering", "", "zaehlerDaten", "Getrennte Zählerdaten fehlen.", "Zählerstandard-Migration ausführen."));
      return resultFromIssues(issues);
    }
    if (Number(container.version || container.meteringStandardVersion) !== METERING_STANDARD_VERSION) issues.push(issue("METERING_VERSION_UNSUPPORTED", "error", "metering", "", "zaehlerDaten.version", "Zählerstandard-Version ist nicht unterstützt.", "Daten mit der aktuellen Version migrieren."));
    const meters = Array.isArray(container.zaehler) ? container.zaehler : [];
    const readings = Array.isArray(container.messwerte) ? container.messwerte : [];
    const periods = Array.isArray(container.messperioden) ? container.messperioden : [];
    const assignments = Array.isArray(container.zuordnungen) ? container.zuordnungen : [];
    const replacements = Array.isArray(container.zaehlerwechsel) ? container.zaehlerwechsel : [];
    const meterIds = new Set();
    const meterNumbers = new Map();
    meters.forEach((meter, index) => {
      const id = text(meter && (meter.meterId || meter.zaehlerId || meter.id));
      if (!id) issues.push(issue("METER_ID_MISSING", "error", "meter", "", "zaehlerDaten.zaehler[" + index + "]", "Stabile Zähler-ID fehlt.", "Eine dauerhafte Zähler-ID vergeben."));
      else if (meterIds.has(id)) issues.push(issue("METER_ID_DUPLICATE", "error", "meter", id, "zaehlerDaten.zaehler[" + index + "]", "Zähler-ID ist doppelt.", "Doppelte Stammdatensätze zusammenführen."));
      else meterIds.add(id);
      const number = text(meter && meter.zaehlernummer);
      if (number) {
        if (!meterNumbers.has(number)) meterNumbers.set(number, []);
        meterNumbers.get(number).push(id);
      }
      if (!text(meter && (meter.meterType || meter.zaehlerTyp))) issues.push(issue("METER_TYPE_MISSING", "error", "meter", id, "zaehlerDaten.zaehler[" + index + "].meterType", "Zählertyp fehlt.", "Gültigen Zählertyp angeben."));
      if (meter && meter.abrechnungsrelevant !== false && !text(meter.einheit)) issues.push(issue("METER_UNIT_MISSING", "error", "meter", id, "zaehlerDaten.zaehler[" + index + "].einheit", "Maßeinheit fehlt.", "Maßeinheit des Zählers ergänzen."));
      if (meter && meter.einbaudatum && !deps.periods.validDate(meter.einbaudatum)) issues.push(issue("METER_INSTALL_DATE_INVALID", "error", "meter", id, "zaehlerDaten.zaehler[" + index + "].einbaudatum", "Einbaudatum ist ungültig.", "Einbaudatum als ISO-Datum erfassen."));
      if (meter && meter.ausbaudatum && !deps.periods.validDate(meter.ausbaudatum)) issues.push(issue("METER_REMOVAL_DATE_INVALID", "error", "meter", id, "zaehlerDaten.zaehler[" + index + "].ausbaudatum", "Ausbaudatum ist ungültig.", "Ausbaudatum als ISO-Datum erfassen."));
      if (meter && meter.einbaudatum && meter.ausbaudatum && Date.parse(meter.ausbaudatum) < Date.parse(meter.einbaudatum)) issues.push(issue("METER_LIFETIME_REVERSED", "error", "meter", id, "zaehlerDaten.zaehler[" + index + "]", "Ausbaudatum liegt vor dem Einbaudatum.", "Einbau-/Ausbaudaten korrigieren."));
      if (deps.master.isElectricityDummyMeter(meter)) {
        if (meter.abrechnungsrelevant !== false || text(meter.billingRole) !== "excluded") issues.push(issue("ELECTRICITY_DUMMY_NOT_EXCLUDED", "error", "meter", id, "zaehlerDaten.zaehler[" + index + "]", "Stromzähler-Dummy ist nicht eindeutig von der Abrechnung ausgeschlossen.", "abrechnungsrelevant=false und billingRole=excluded setzen."));
        else issues.push(issue("ELECTRICITY_DUMMY_EXCLUDED", "info", "meter", id, "zaehlerDaten.zaehler[" + index + "]", "Stromzähler-Dummy bleibt gespeichert und ist aus der Abrechnung ausgeschlossen.", ""));
      }
    });
    meterNumbers.forEach((ids, number) => {
      if (ids.length > 1) issues.push(issue("METER_NUMBER_CONFLICT", "error", "meter", ids.join(","), "zaehlerDaten.zaehler", "Zählernummer wird mehrfach verwendet: " + number + ".", "Zählernummern und Zählerwechsel prüfen."));
    });

    const readingIds = new Set();
    const activeSignature = new Set();
    readings.forEach((reading, index) => {
      const id = text(reading && (reading.messwertId || reading.measurementId || reading.id));
      const meterId = text(reading && (reading.zaehlerId || reading.meterId));
      if (!id) issues.push(issue("READING_ID_MISSING", "error", "reading", "", "zaehlerDaten.messwerte[" + index + "]", "Messwert-ID fehlt.", "Eindeutige Messwert-ID vergeben."));
      else if (readingIds.has(id)) issues.push(issue("READING_ID_DUPLICATE", "error", "reading", id, "zaehlerDaten.messwerte[" + index + "]", "Messwert-ID ist doppelt.", "Doppelte Messwerte bereinigen."));
      else readingIds.add(id);
      if (!meterIds.has(meterId)) issues.push(issue("READING_METER_UNKNOWN", "error", "reading", id, "zaehlerDaten.messwerte[" + index + "].zaehlerId", "Messwert verweist auf unbekannten Zähler.", "Zählerreferenz korrigieren."));
      if (!deps.periods.validDate(reading && reading.ablesedatum)) issues.push(issue("READING_DATE_INVALID", "error", "reading", id, "zaehlerDaten.messwerte[" + index + "].ablesedatum", "Ablesedatum fehlt oder ist ungültig.", "Gültiges Ablesedatum ergänzen."));
      if (!Number.isFinite(Number(reading && reading.wert))) issues.push(issue("READING_VALUE_INVALID", "error", "reading", id, "zaehlerDaten.messwerte[" + index + "].wert", "Ablesewert ist ungültig.", "Numerischen Ablesewert erfassen."));
      const meter = meters.find(row => text(row.meterId) === meterId);
      if (meter && text(reading.einheit) && text(meter.einheit) && text(reading.einheit) !== text(meter.einheit)) issues.push(issue("READING_UNIT_MISMATCH", "error", "reading", id, "zaehlerDaten.messwerte[" + index + "].einheit", "Messwert-Maßeinheit stimmt nicht mit dem Zähler überein.", "Maßeinheiten vereinheitlichen."));
      if (deps.readings.activeReading(reading)) {
        const signature = [meterId, text(reading.ablesedatum), Number(reading.wert)].join("|");
        if (activeSignature.has(signature)) issues.push(issue("READING_DUPLICATE_ACTIVE", "warning", "reading", id, "zaehlerDaten.messwerte[" + index + "]", "Identischer aktiver Messwert ist mehrfach vorhanden.", "Duplikat stornieren oder zusammenführen."));
        activeSignature.add(signature);
      }
      if (text(reading.status).toLowerCase() === "corrected" && !readings.some(row => text(row.ersetztMesswertId) === id)) issues.push(issue("READING_CORRECTION_LINK_MISSING", "warning", "reading", id, "zaehlerDaten.messwerte[" + index + "]", "Ersetzter Messwert besitzt keinen nachvollziehbaren Nachfolger.", "Korrekturbezug prüfen."));
    });

    const assignmentIds = new Set();
    assignments.forEach((assignment, index) => {
      const id = text(assignment && (assignment.zuordnungId || assignment.assignmentId || assignment.id));
      const meterId = text(assignment && (assignment.zaehlerId || assignment.meterId));
      if (!id) issues.push(issue("ASSIGNMENT_ID_MISSING", "error", "assignment", "", "zaehlerDaten.zuordnungen[" + index + "]", "Zuordnungs-ID fehlt.", "Eindeutige Zuordnungs-ID vergeben."));
      else if (assignmentIds.has(id)) issues.push(issue("ASSIGNMENT_ID_DUPLICATE", "error", "assignment", id, "zaehlerDaten.zuordnungen[" + index + "]", "Zuordnungs-ID ist doppelt.", "Doppelte Zuordnung bereinigen."));
      else assignmentIds.add(id);
      if (!meterIds.has(meterId)) issues.push(issue("ASSIGNMENT_METER_UNKNOWN", "error", "assignment", id, "zaehlerDaten.zuordnungen[" + index + "].zaehlerId", "Zuordnung verweist auf unbekannten Zähler.", "Zählerreferenz korrigieren."));
      if (!deps.periods.validDate(assignment.gueltigVon) || !deps.periods.validDate(assignment.gueltigBis)) issues.push(issue("ASSIGNMENT_PERIOD_INVALID", "error", "assignment", id, "zaehlerDaten.zuordnungen[" + index + "]", "Zuordnungszeitraum ist ungültig.", "Beginn und Ende als gültige Daten erfassen."));
      else if (Date.parse(assignment.gueltigBis) < Date.parse(assignment.gueltigVon)) issues.push(issue("ASSIGNMENT_PERIOD_REVERSED", "error", "assignment", id, "zaehlerDaten.zuordnungen[" + index + "]", "Zuordnungsende liegt vor dem Beginn.", "Zuordnungszeitraum korrigieren."));
    });
    const assignmentsByMeterAndType = new Map();
    assignments.forEach(row => {
      const key = text(row.zaehlerId) + "|" + text(row.assignmentType || row.zuordnungstyp);
      if (!assignmentsByMeterAndType.has(key)) assignmentsByMeterAndType.set(key, []);
      assignmentsByMeterAndType.get(key).push(row);
    });
    assignmentsByMeterAndType.forEach(rows => {
      for (let left = 0; left < rows.length; left += 1) for (let right = left + 1; right < rows.length; right += 1) {
        if (deps.periods.overlaps(rows[left].gueltigVon, rows[left].gueltigBis, rows[right].gueltigVon, rows[right].gueltigBis)) {
          issues.push(issue("ASSIGNMENT_OVERLAP", "error", "assignment", text(rows[left].zaehlerId), "zaehlerDaten.zuordnungen", "Zeitabhängige Zählerzuordnungen überschneiden sich unzulässig.", "Zuordnungszeiträume trennen."));
        }
      }
    });

    const periodIds = new Set();
    const periodSignature = new Set();
    periods.forEach((period, index) => {
      const id = text(period && (period.messperiodeId || period.measurementPeriodId || period.id));
      const meterId = text(period && (period.zaehlerId || period.meterId));
      if (!id) issues.push(issue("MEASUREMENT_PERIOD_ID_MISSING", "error", "measurementPeriod", "", "zaehlerDaten.messperioden[" + index + "]", "Messperioden-ID fehlt.", "Eindeutige Messperioden-ID vergeben."));
      else if (periodIds.has(id)) issues.push(issue("MEASUREMENT_PERIOD_ID_DUPLICATE", "error", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "]", "Messperioden-ID ist doppelt.", "Doppelte Messperiode bereinigen."));
      else periodIds.add(id);
      if (!meterIds.has(meterId)) issues.push(issue("MEASUREMENT_PERIOD_METER_UNKNOWN", "error", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "].zaehlerId", "Messperiode verweist auf unbekannten Zähler.", "Zählerreferenz korrigieren."));
      if (!deps.periods.validDate(period.beginn) || !deps.periods.validDate(period.ende) || Date.parse(period.ende) < Date.parse(period.beginn)) issues.push(issue("MEASUREMENT_PERIOD_INVALID", "error", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "]", "Messperiode ist zeitlich ungültig.", "Beginn und Ende korrigieren."));
      if (!Number.isFinite(Number(period.anfangsstand)) || !Number.isFinite(Number(period.endstand)) || !Number.isFinite(Number(period.verbrauch))) issues.push(issue("MEASUREMENT_PERIOD_VALUES_INVALID", "error", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "]", "Anfangsstand, Endstand oder Verbrauch ist ungültig.", "Messwertfolge prüfen."));
      if (Number(period.verbrauch) < 0 || text(period.status) === "invalid") issues.push(issue("METER_READING_REVERSED", "error", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "]", "Endstand liegt unter dem Anfangsstand und kein gültiger Überlauf ist dokumentiert.", "Messwerte korrigieren oder Zählerüberlauf dokumentieren."));
      const signature = [meterId, text(period.beginn), text(period.ende), text(period.anfangsMesswertId), text(period.endMesswertId)].join("|");
      if (periodSignature.has(signature)) issues.push(issue("MEASUREMENT_PERIOD_DOUBLE_COUNT", "error", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "]", "Messperiode würde doppelt verbraucht werden.", "Doppelte Periodenbildung entfernen."));
      periodSignature.add(signature);
      const meter = meters.find(row => text(row.meterId) === meterId);
      if (meter && (meter.abrechnungsrelevant === false || deps.master.isElectricityDummyMeter(meter)) && period.abrechnungsrelevant !== false) issues.push(issue("EXCLUDED_METER_PERIOD_BILLABLE", "error", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "]", "Nicht abrechnungsrelevanter Zähler erzeugt einen abrechnungsrelevanten Verbrauch.", "Messperiode aus Abrechnung ausschließen."));
      const shares = Array.isArray(period.zuordnungsanteile) ? period.zuordnungsanteile : [];
      const locationShares = shares.filter(row => text(row.zuordnungstyp) === "location");
      const usageShares = shares.filter(row => text(row.zuordnungstyp) === "usage");
      if (period.abrechnungsrelevant !== false && !shares.length) issues.push(issue("MEASUREMENT_PERIOD_ASSIGNMENT_MISSING", "error", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "].zuordnungsanteile", "Messperiode besitzt keine zeitlich gültige Zuordnung.", "Zählerzuordnung für den Zeitraum ergänzen."));
      if (period.abrechnungsrelevant !== false && !usageShares.length && locationShares.length) issues.push(issue("MEASUREMENT_PERIOD_USER_ASSIGNMENT_GAP", "warning", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "].zuordnungsanteile", "Messperiode ist einer Einheit, aber keinem Nutzer/Vertrag zugeordnet.", "Leerstand dokumentieren oder Nutzungszuordnung ergänzen."));
      if (shares.some(row => row.estimated)) issues.push(issue("MEASUREMENT_PERIOD_ALLOCATION_ESTIMATED", "warning", "measurementPeriod", id, "zaehlerDaten.messperioden[" + index + "].zuordnungsanteile", "Verbrauch wurde wegen eines Wechsels ohne Zwischenablesung zeitanteilig geschätzt.", "Zwischenablesung am Wechseltermin ergänzen."));
    });

    replacements.forEach((replacement, index) => {
      const id = text(replacement && (replacement.zaehlerwechselId || replacement.replacementId || replacement.id));
      const oldId = text(replacement && replacement.alterZaehlerId);
      const newId = text(replacement && replacement.neuerZaehlerId);
      if (!meterIds.has(oldId) || !meterIds.has(newId) || oldId === newId) issues.push(issue("METER_REPLACEMENT_REFERENCE_INVALID", "error", "replacement", id, "zaehlerDaten.zaehlerwechsel[" + index + "]", "Zählerwechsel verweist nicht eindeutig auf alten und neuen Zähler.", "Zählerreferenzen korrigieren."));
      if (!deps.periods.validDate(replacement && replacement.wechseldatum)) issues.push(issue("METER_REPLACEMENT_DATE_INVALID", "error", "replacement", id, "zaehlerDaten.zaehlerwechsel[" + index + "].wechseldatum", "Wechseldatum fehlt oder ist ungültig.", "Wechseldatum ergänzen."));
      const oldMeter = meters.find(row => text(row.meterId) === oldId);
      const newMeter = meters.find(row => text(row.meterId) === newId);
      if (oldMeter && text(oldMeter.nachfolgerZaehlerId) !== newId) issues.push(issue("METER_REPLACEMENT_LINK_INCOMPLETE", "error", "replacement", id, "zaehlerDaten.zaehler", "Nachfolgerbezug des alten Zählers fehlt.", "Vorgänger-/Nachfolgerbeziehung ergänzen."));
      if (newMeter && text(newMeter.vorgaengerZaehlerId) !== oldId) issues.push(issue("METER_REPLACEMENT_LINK_INCOMPLETE", "error", "replacement", id, "zaehlerDaten.zaehler", "Vorgängerbezug des neuen Zählers fehlt.", "Vorgänger-/Nachfolgerbeziehung ergänzen."));
      const hasFinal = Number.isFinite(Number(replacement && replacement.ausbauwert)) || text(replacement && replacement.ausbauMesswertId);
      const hasInitial = Number.isFinite(Number(replacement && replacement.einbauwert)) || text(replacement && replacement.einbauMesswertId);
      if (!hasFinal || !hasInitial) issues.push(issue("METER_REPLACEMENT_READINGS_MISSING", options.billingReadiness === false ? "warning" : "error", "replacement", id, "zaehlerDaten.zaehlerwechsel[" + index + "]", "Ausbau- oder Einbauwert des Zählerwechsels fehlt.", "Wechselstände erfassen oder als Schätzung dokumentieren."));
    });

    if (options.billingReadiness !== false) {
      const billing = deps.master.billingPeriod(data);
      const activeCostIds = new Set((Array.isArray(data && data.kostenarten) ? data.kostenarten : []).filter(cost => cost && cost.inNK === "Ja" && text(cost.umlageschluessel) === "Verbrauch" && Math.abs(Number(cost.gesamtbetrag) || 0) > 0.000001).map(cost => text(cost.id)));
      meters.filter(meter => meter.abrechnungsrelevant !== false && !deps.master.isElectricityDummyMeter(meter) && (activeCostIds.has(text(meter.kostenId)) || (activeCostIds.has("K002") && ["cold-water", "hot-water"].includes(text(meter.meterType))))).forEach(meter => {
        const relevantPeriods = periods.filter(period => text(period.zaehlerId || period.meterId) === meter.meterId && period.abrechnungsrelevant !== false && deps.periods.overlaps(period.beginn, period.ende, billing.start, billing.end));
        if (!relevantPeriods.length) issues.push(issue("METER_PERIOD_MISSING", "error", "meter", meter.meterId, "zaehlerDaten.messperioden", "Für den abrechnungsrelevanten Zähler fehlt eine gültige Messperiode.", "Anfangs- und Endstand für den Abrechnungszeitraum erfassen."));
      });
    }
    return resultFromIssues(issues);
  }

  function migrateMeteringData(data, options = {}) {
    const source = cloneWith(options, data);
    try {
      const working = cloneWith(options, data);
      const required = requiresMeteringMigration(working);
      synchronizeMeteringData(working, options);
      const validation = validateMeteringData(working, { ...options, billingReadiness:false });
      const fatalErrors = validation.errors.filter(item => !STARTUP_SAFE_VALIDATION_CODES.has(item.code));
      const startupSafeFindings = validation.errors.filter(item => STARTUP_SAFE_VALIDATION_CODES.has(item.code));
      if (fatalErrors.length) {
        const uniqueMessages = [...new Set(fatalErrors.map(item => item.message))];
        throw new Error("Zählerstandard-Nachprüfung fehlgeschlagen: " + uniqueMessages.join(" "));
      }
      if (!working.meta || typeof working.meta !== "object") working.meta = {};
      if (required) {
        if (!Array.isArray(working.meta.standardMigrations)) working.meta.standardMigrations = [];
        const exists = working.meta.standardMigrations.some(item => item && item.id === "metering-standard-v1");
        if (!exists) working.meta.standardMigrations.push({
          id:"metering-standard-v1",
          completedAt:(options.now || (() => new Date().toISOString()))(),
          appVersion:text(options.appVersion),
          dataSchemaVersion:Number(working.meta.dataSchemaVersion || 5),
          note:"Zählerstammdaten, Messwerte, Messperioden, Zuordnungen und Zählerwechsel getrennt."
        });
      }
      return { status:required ? "migrated" : "not-required", migrated:required, data:working, validation, startupSafeFindings };
    } catch (error) {
      return { status:"failed", migrated:false, data:source, error };
    }
  }

  function replaceData(target, source, options = {}) {
    if (!target || typeof target !== "object" || Array.isArray(target)) return source;
    Object.keys(target).forEach(key => delete target[key]);
    Object.assign(target, cloneWith(options, source));
    return target;
  }

  function createSnapshotProjection(data, period, options = {}) {
    const deps = modules(options);
    const source = cloneWith(options, data);
    synchronizeMeteringData(source, options);
    const container = source.zaehlerDaten;
    const range = period || deps.master.billingPeriod(source);
    const overlaps = (start, end) => deps.periods.overlaps(start, end, range.start, range.end);
    const meters = cloneWith(options, container.zaehler || []);
    const ids = new Set(meters.map(row => text(row.meterId)));
    const readings = cloneWith(options, (container.messwerte || []).filter(row => ids.has(text(row.zaehlerId)) && (overlaps(row.messzeitraumVon || row.ablesedatum, row.messzeitraumBis || row.ablesedatum) || !text(range.start))));
    const periods = cloneWith(options, (container.messperioden || []).filter(row => overlaps(row.beginn, row.ende)));
    const assignments = cloneWith(options, (container.zuordnungen || []).filter(row => overlaps(row.gueltigVon, row.gueltigBis)));
    const replacements = cloneWith(options, (container.zaehlerwechsel || []).filter(row => !text(row.wechseldatum) || overlaps(row.wechseldatum, row.wechseldatum)));
    const excludedMeters = meters.filter(meter => meter.abrechnungsrelevant === false || deps.master.isElectricityDummyMeter(meter)).map(meter => ({
      meterId:meter.meterId,
      reason:text(meter.ausschlussgrund) || "Nicht abrechnungsrelevant"
    }));
    return {
      meteringStandardVersion:METERING_STANDARD_VERSION,
      meterMasterStandardVersion:container.meterMasterStandardVersion,
      readingStandardVersion:container.readingStandardVersion,
      measurementPeriodStandardVersion:container.measurementPeriodStandardVersion,
      assignmentStandardVersion:container.assignmentStandardVersion,
      replacementStandardVersion:container.replacementStandardVersion,
      meters,
      readings,
      measurementPeriods:periods,
      assignments,
      replacements,
      excludedMeters,
      reconstructionStatus:text(container.reconstructionStatus) || "complete",
      reconstructionNotes:cloneWith(options, container.reconstructionNotes || [])
    };
  }

  global.NKProMeterValidation = Object.freeze({
    METERING_STANDARD_VERSION,
    issue,
    resultFromIssues,
    requiresMeteringMigration,
    synchronizeMeteringData,
    validateMeteringData,
    migrateMeteringData,
    replaceData,
    createSnapshotProjection
  });
})(globalThis);
