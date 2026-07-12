(function (global) {
  "use strict";

  const ASSIGNMENT_STANDARD_VERSION = 1;
  const REPLACEMENT_STANDARD_VERSION = 1;
  const MEASUREMENT_PERIOD_STANDARD_VERSION = 1;

  function cloneWith(options, value) {
    return options && typeof options.clone === "function" ? options.clone(value) : JSON.parse(JSON.stringify(value));
  }

  function text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function timestamp(value, fallback) {
    const parsed = Date.parse(text(value));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function validDate(value) {
    return !!text(value) && Number.isFinite(Date.parse(text(value)));
  }

  function overlaps(aStart, aEnd, bStart, bEnd) {
    return timestamp(aStart, Number.NEGATIVE_INFINITY) <= timestamp(bEnd, Number.POSITIVE_INFINITY) &&
      timestamp(bStart, Number.NEGATIVE_INFINITY) <= timestamp(aEnd, Number.POSITIVE_INFINITY);
  }

  function intersect(startA, endA, startB, endB) {
    const start = Math.max(timestamp(startA, Number.NEGATIVE_INFINITY), timestamp(startB, Number.NEGATIVE_INFINITY));
    const end = Math.min(timestamp(endA, Number.POSITIVE_INFINITY), timestamp(endB, Number.POSITIVE_INFINITY));
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
    return { start:new Date(start).toISOString().slice(0, 10), end:new Date(end).toISOString().slice(0, 10) };
  }

  function durationWeight(start, end) {
    const left = timestamp(start, NaN);
    const right = timestamp(end, NaN);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right < left) return 0;
    return Math.max(1, ((right - left) / 86400000) + 1);
  }

  function normalizeAssignment(input, index, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const row = cloneWith(options, input || {});
    row.zuordnungId = text(row.zuordnungId || row.assignmentId || row.id) || "ZU-" + master.hash(JSON.stringify([row.zaehlerId || row.meterId, row.zuordnungstyp || row.assignmentType, row.gueltigVon || row.validFrom, row.gueltigBis || row.validTo, index])).toUpperCase();
    row.assignmentId = row.zuordnungId;
    row.id = row.zuordnungId;
    row.zaehlerId = text(row.zaehlerId || row.meterId);
    row.meterId = row.zaehlerId;
    row.zuordnungstyp = text(row.zuordnungstyp || row.assignmentType) || "location";
    row.assignmentType = row.zuordnungstyp;
    row.objektId = text(row.objektId);
    row.gebaeudeId = text(row.gebaeudeId);
    row.einheitId = text(row.einheitId || row.unitId);
    row.verbrauchsstelleId = text(row.verbrauchsstelleId || row.consumptionPointId);
    row.nutzerId = text(row.nutzerId || row.partnerId || row.tenantId);
    row.vertragId = text(row.vertragId || row.contractId);
    row.gueltigVon = text(row.gueltigVon || row.validFrom);
    row.gueltigBis = text(row.gueltigBis || row.validTo);
    row.status = text(row.status) || "active";
    row.herkunft = text(row.herkunft || row.source) || "manual";
    row.sourceKey = text(row.sourceKey);
    row.assignmentStandardVersion = ASSIGNMENT_STANDARD_VERSION;
    return row;
  }

  function contractRows(data) {
    const standard = data && data.objektStandard || {};
    if (Array.isArray(standard.vertraege) && standard.vertraege.length) return standard.vertraege;
    return (Array.isArray(data && data.mieter) ? data.mieter : []).filter(Boolean).map((tenant, index) => ({
      vertragId:"V-" + (text(tenant.id) || String(index + 1)),
      partnerId:text(tenant.id),
      einheitId:text(tenant.wohnung),
      beginn:text(tenant.einzug),
      ende:text(tenant.auszug),
      status:text(tenant.status)
    }));
  }

  function synchronizeAssignments(data, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const container = master.ensureMeteringContainer(data, options);
    const billing = master.billingPeriod(data);
    const existing = (container.zuordnungen || []).map((row, index) => normalizeAssignment(row, index, { ...options, master }));
    const explicit = existing.filter(row => row.herkunft !== "generated-location" && row.herkunft !== "generated-contract");
    const generated = [];
    const contracts = contractRows(data);
    (container.zaehler || []).forEach(meter => {
      const activeStart = text(meter.einbaudatum) || billing.start;
      const activeEnd = text(meter.ausbaudatum) || billing.end;
      const meterInterval = intersect(activeStart, activeEnd, billing.start, billing.end) || { start:activeStart || billing.start, end:activeEnd || billing.end };
      generated.push(normalizeAssignment({
        sourceKey:"location:" + meter.meterId + ":" + (meter.einheitId || meter.verbrauchsstelleId || meter.gebaeudeId || meter.objektId),
        zaehlerId:meter.meterId,
        zuordnungstyp:"location",
        objektId:text(meter.objektId),
        gebaeudeId:text(meter.gebaeudeId),
        einheitId:text(meter.einheitId),
        verbrauchsstelleId:text(meter.verbrauchsstelleId),
        gueltigVon:meterInterval.start,
        gueltigBis:meterInterval.end,
        herkunft:"generated-location"
      }, generated.length, { ...options, master }));
      if (!text(meter.einheitId)) return;
      contracts.filter(contract => text(contract && contract.einheitId) === text(meter.einheitId) && overlaps(contract && (contract.beginn || contract.einzug), contract && (contract.ende || contract.auszug), meterInterval.start, meterInterval.end)).forEach(contract => {
        const interval = intersect(contract.beginn || contract.einzug || meterInterval.start, contract.ende || contract.auszug || meterInterval.end, meterInterval.start, meterInterval.end);
        if (!interval) return;
        generated.push(normalizeAssignment({
          sourceKey:"usage:" + meter.meterId + ":" + text(contract.vertragId || contract.id),
          zaehlerId:meter.meterId,
          zuordnungstyp:"usage",
          objektId:text(meter.objektId),
          gebaeudeId:text(meter.gebaeudeId),
          einheitId:text(meter.einheitId),
          verbrauchsstelleId:text(meter.verbrauchsstelleId),
          nutzerId:text(contract.partnerId),
          vertragId:text(contract.vertragId || contract.id),
          gueltigVon:interval.start,
          gueltigBis:interval.end,
          herkunft:"generated-contract"
        }, generated.length, { ...options, master }));
      });
    });
    const byKey = new Map();
    explicit.concat(generated).forEach((row, index) => {
      const normalized = normalizeAssignment(row, index, { ...options, master });
      const key = normalized.sourceKey || normalized.zuordnungId;
      if (!byKey.has(key)) byKey.set(key, normalized);
      else byKey.set(key, Object.assign({}, byKey.get(key), normalized));
    });
    container.zuordnungen = [...byKey.values()];
    container.assignmentStandardVersion = ASSIGNMENT_STANDARD_VERSION;
    return container.zuordnungen;
  }

  function normalizeReplacement(input, index, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const row = cloneWith(options, input || {});
    row.zaehlerwechselId = text(row.zaehlerwechselId || row.replacementId || row.id) || "ZW-" + master.hash(JSON.stringify([row.alterZaehlerId || row.oldMeterId, row.neuerZaehlerId || row.newMeterId, row.wechseldatum || row.replacementDate, index])).toUpperCase();
    row.replacementId = row.zaehlerwechselId;
    row.id = row.zaehlerwechselId;
    row.alterZaehlerId = text(row.alterZaehlerId || row.oldMeterId);
    row.neuerZaehlerId = text(row.neuerZaehlerId || row.newMeterId);
    row.wechseldatum = text(row.wechseldatum || row.replacementDate);
    if (row.ausbauwert !== undefined && row.ausbauwert !== "") row.ausbauwert = Number(row.ausbauwert);
    if (row.einbauwert !== undefined && row.einbauwert !== "") row.einbauwert = Number(row.einbauwert);
    row.ausbauMesswertId = text(row.ausbauMesswertId || row.finalReadingId);
    row.einbauMesswertId = text(row.einbauMesswertId || row.initialReadingId);
    row.status = text(row.status) || "complete";
    row.herkunft = text(row.herkunft || row.source) || "manual";
    row.replacementStandardVersion = REPLACEMENT_STANDARD_VERSION;
    return row;
  }

  function synchronizeReplacements(data, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const container = master.ensureMeteringContainer(data, options);
    const existing = (container.zaehlerwechsel || []).map((row, index) => normalizeReplacement(row, index, { ...options, master }));
    const byPair = new Map();
    existing.forEach(row => byPair.set(row.alterZaehlerId + ">" + row.neuerZaehlerId, row));
    (container.zaehler || []).forEach(oldMeter => {
      const successorId = text(oldMeter.nachfolgerZaehlerId);
      if (!successorId) return;
      const successor = (container.zaehler || []).find(row => row.meterId === successorId);
      const key = oldMeter.meterId + ">" + successorId;
      const source = Object.assign({}, byPair.get(key) || {}, {
        alterZaehlerId:oldMeter.meterId,
        neuerZaehlerId:successorId,
        wechseldatum:text(successor && successor.einbaudatum) || text(oldMeter.ausbaudatum),
        herkunft:(byPair.get(key) && byPair.get(key).herkunft) || "meter-master-link"
      });
      byPair.set(key, normalizeReplacement(source, byPair.size, { ...options, master }));
    });
    container.zaehlerwechsel = [...byPair.values()];
    container.replacementStandardVersion = REPLACEMENT_STANDARD_VERSION;
    return container.zaehlerwechsel;
  }

  function activeReadings(container, readingsModule) {
    return (container.messwerte || []).filter(row => readingsModule.activeReading(row) && Number.isFinite(Number(row.wert)) && validDate(row.ablesedatum));
  }

  function allocatePeriod(period, assignments) {
    const usage = assignments.filter(row => row.assignmentType === "usage" && overlaps(row.gueltigVon, row.gueltigBis, period.beginn, period.ende));
    const relevant = usage.length ? usage : assignments.filter(row => row.assignmentType === "location" && overlaps(row.gueltigVon, row.gueltigBis, period.beginn, period.ende));
    const totalWeight = durationWeight(period.beginn, period.ende);
    const shares = relevant.map(row => {
      const interval = intersect(row.gueltigVon, row.gueltigBis, period.beginn, period.ende);
      const weight = interval ? durationWeight(interval.start, interval.end) : 0;
      return {
        zuordnungId:row.zuordnungId,
        zuordnungstyp:row.assignmentType,
        objektId:row.objektId,
        gebaeudeId:row.gebaeudeId,
        einheitId:row.einheitId,
        nutzerId:row.nutzerId,
        vertragId:row.vertragId,
        beginn:interval && interval.start || "",
        ende:interval && interval.end || "",
        anteil:totalWeight > 0 ? weight / totalWeight : 0,
        verbrauch:totalWeight > 0 ? period.verbrauch * (weight / totalWeight) : 0,
        allocationMethod:usage.length > 1 || (usage.length === 1 && weight < totalWeight) ? "daily-pro-rata" : "direct",
        estimated:usage.length > 1 || (usage.length === 1 && weight < totalWeight)
      };
    });
    return shares;
  }

  function buildMeasurementPeriods(data, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const readingsModule = options.readings || global.NKProMeterReadings;
    const container = master.ensureMeteringContainer(data, options);
    const generated = [];
    const meterById = new Map((container.zaehler || []).map(row => [row.meterId, row]));
    const assignmentsByMeter = new Map();
    (container.zuordnungen || []).forEach(row => {
      if (!assignmentsByMeter.has(row.zaehlerId)) assignmentsByMeter.set(row.zaehlerId, []);
      assignmentsByMeter.get(row.zaehlerId).push(row);
    });
    const groups = new Map();
    activeReadings(container, readingsModule).forEach(reading => {
      if (!groups.has(reading.zaehlerId)) groups.set(reading.zaehlerId, []);
      groups.get(reading.zaehlerId).push(reading);
    });
    groups.forEach((rows, meterId) => {
      const meter = meterById.get(meterId);
      if (!meter) return;
      const signatures = new Set();
      const ordered = rows.slice().sort((a, b) => timestamp(a.messzeitpunkt || a.ablesedatum, 0) - timestamp(b.messzeitpunkt || b.ablesedatum, 0) || text(a.erfasstAm).localeCompare(text(b.erfasstAm))).filter(row => {
        const signature = [row.ablesedatum, Number(row.wert), row.einheit].join("|");
        if (signatures.has(signature)) return false;
        signatures.add(signature);
        return true;
      });
      for (let index = 0; index < ordered.length - 1; index += 1) {
        const start = ordered[index];
        const end = ordered[index + 1];
        const startValue = Number(start.wert);
        const endValue = Number(end.wert);
        const beginDate = text(start.ablesedatum);
        const endDate = text(end.ablesedatum);
        if (!validDate(beginDate) || !validDate(endDate) || timestamp(endDate, 0) < timestamp(beginDate, 0)) continue;
        const sameDate = beginDate === endDate;
        if (sameDate && startValue === endValue) continue;
        let consumption = endValue - startValue;
        let rollover = false;
        if (consumption < 0 && Number.isFinite(Number(meter.ueberlaufwert || meter.rolloverMax))) {
          consumption = Number(meter.ueberlaufwert || meter.rolloverMax) - startValue + endValue;
          rollover = true;
        }
        const period = {
          messperiodeId:"MP-" + master.hash(JSON.stringify([meterId, start.messwertId, end.messwertId])).toUpperCase(),
          measurementPeriodId:"",
          zaehlerId:meterId,
          meterId,
          beginn:beginDate,
          ende:endDate,
          ablesedatum:endDate,
          anfangsMesswertId:start.messwertId,
          endMesswertId:end.messwertId,
          anfangsstand:startValue,
          endstand:endValue,
          verbrauch:consumption,
          einheit:text(end.einheit || start.einheit || meter.einheit),
          status:consumption >= 0 ? "valid" : "invalid",
          geschaetzt:[start, end].some(row => text(row.ableseart).toLowerCase().includes("schätz") || text(row.ableseart).toLowerCase().includes("estimate")),
          korrigiert:[start, end].some(row => !!text(row.ersetztMesswertId)),
          zaehlerueberlauf:rollover,
          abrechnungsrelevant:meter.abrechnungsrelevant !== false && !master.isElectricityDummyMeter(meter),
          ausschlussgrund:meter.abrechnungsrelevant === false || master.isElectricityDummyMeter(meter) ? (text(meter.ausschlussgrund) || "Nicht abrechnungsrelevant") : "",
          source:"derived-reading-sequence",
          measurementPeriodStandardVersion:MEASUREMENT_PERIOD_STANDARD_VERSION
        };
        period.measurementPeriodId = period.messperiodeId;
        period.zuordnungsanteile = allocatePeriod(period, assignmentsByMeter.get(meterId) || []);
        generated.push(period);
      }
    });
    const manual = (container.messperioden || []).filter(row => text(row.source) !== "derived-reading-sequence").map(row => cloneWith(options, row));
    container.messperioden = manual.concat(generated);
    container.measurementPeriodStandardVersion = MEASUREMENT_PERIOD_STANDARD_VERSION;
    return container.messperioden;
  }

  function registerMeterReplacement(data, input, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const container = master.ensureMeteringContainer(data, options);
    const replacement = normalizeReplacement(input, container.zaehlerwechsel.length, { ...options, master });
    const oldMeter = container.zaehler.find(row => row.meterId === replacement.alterZaehlerId);
    const newMeter = container.zaehler.find(row => row.meterId === replacement.neuerZaehlerId);
    if (!oldMeter || !newMeter) throw new Error("Zählerwechsel verweist auf unbekannte Zähler.");
    oldMeter.nachfolgerZaehlerId = newMeter.meterId;
    newMeter.vorgaengerZaehlerId = oldMeter.meterId;
    if (replacement.wechseldatum) {
      oldMeter.ausbaudatum = oldMeter.ausbaudatum || replacement.wechseldatum;
      newMeter.einbaudatum = newMeter.einbaudatum || replacement.wechseldatum;
    }
    const index = container.zaehlerwechsel.findIndex(row => text(row.alterZaehlerId) === oldMeter.meterId && text(row.neuerZaehlerId) === newMeter.meterId);
    if (index >= 0) container.zaehlerwechsel[index] = replacement;
    else container.zaehlerwechsel.push(replacement);
    return replacement;
  }

  function addAssignment(data, input, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const container = master.ensureMeteringContainer(data, options);
    const assignment = normalizeAssignment(Object.assign({}, input, { herkunft:text(input && input.herkunft) || "manual" }), container.zuordnungen.length, { ...options, master });
    const index = container.zuordnungen.findIndex(row => text(row.zuordnungId) === assignment.zuordnungId);
    if (index >= 0) container.zuordnungen[index] = assignment;
    else container.zuordnungen.push(assignment);
    return assignment;
  }

  function consumptionForCostAndTenant(data, costId, tenantId, unitId, options = {}) {
    const master = options.master || global.NKProMeterMaster;
    const container = master.ensureMeteringContainer(data, options);
    const billing = master.billingPeriod(data);
    const meters = (container.zaehler || []).filter(meter => {
      if (master.isElectricityDummyMeter(meter) || meter.abrechnungsrelevant === false || text(meter.billingRole) === "excluded") return false;
      if (text(meter.kostenId)) return text(meter.kostenId) === text(costId);
      return text(costId) === "K002" && ["cold-water", "hot-water"].includes(text(meter.meterType));
    });
    const ids = new Set(meters.map(row => row.meterId));
    let total = 0;
    (container.messperioden || []).filter(period => ids.has(text(period.zaehlerId || period.meterId)) && period.abrechnungsrelevant !== false && period.status === "valid" && overlaps(period.beginn, period.ende, billing.start, billing.end)).forEach(period => {
      const shares = Array.isArray(period.zuordnungsanteile) ? period.zuordnungsanteile : [];
      const tenantShares = tenantId ? shares.filter(row => text(row.nutzerId) === text(tenantId)) : [];
      const unitShares = unitId ? shares.filter(row => text(row.einheitId) === text(unitId)) : [];
      if (tenantShares.length) total += tenantShares.reduce((sum, row) => sum + Number(row.verbrauch || 0), 0);
      else if (unitShares.length) total += unitShares.reduce((sum, row) => sum + Number(row.verbrauch || 0), 0);
      else {
        const meter = meters.find(row => row.meterId === text(period.zaehlerId || period.meterId));
        if (meter && ((!tenantId || text(meter.nutzerId) === text(tenantId)) && (!unitId || text(meter.einheitId) === text(unitId)))) total += Number(period.verbrauch || 0);
      }
    });
    return total;
  }

  global.NKProMeterPeriods = Object.freeze({
    ASSIGNMENT_STANDARD_VERSION,
    REPLACEMENT_STANDARD_VERSION,
    MEASUREMENT_PERIOD_STANDARD_VERSION,
    validDate,
    overlaps,
    intersect,
    normalizeAssignment,
    synchronizeAssignments,
    normalizeReplacement,
    synchronizeReplacements,
    buildMeasurementPeriods,
    registerMeterReplacement,
    addAssignment,
    consumptionForCostAndTenant
  });
})(globalThis);
