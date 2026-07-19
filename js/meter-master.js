(function (global) {
  "use strict";

  const METER_MASTER_STANDARD_VERSION = 1;
  const METERING_DATA_VERSION = 1;
  const ELECTRICITY_DUMMY_METER_TYPE = "electricity-dummy";

  function cloneWith(options, value) {
    return options && typeof options.clone === "function" ? options.clone(value) : JSON.parse(JSON.stringify(value));
  }

  function text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function safeId(value) {
    return text(value).toUpperCase().replace(/Ä/g, "AE").replace(/Ö/g, "OE").replace(/Ü/g, "UE").replace(/ß/g, "SS")
      .replace(/[^A-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function hash(value) {
    let result = 0x811c9dc5;
    const source = String(value === undefined || value === null ? "" : value);
    for (let index = 0; index < source.length; index += 1) {
      result ^= source.charCodeAt(index);
      result = Math.imul(result, 0x01000193);
    }
    return (result >>> 0).toString(16).padStart(8, "0");
  }

  function stableId(prefix, value) {
    const safe = safeId(value);
    return prefix + "-" + (safe || hash(value));
  }

  function isElectricityDummyMeter(meter) {
    const type = text(meter && (meter.meterType || meter.zaehlerTyp || meter.type)).toLowerCase();
    return type === ELECTRICITY_DUMMY_METER_TYPE || type === "stromzähler-dummy" || type === "stromzaehler-dummy";
  }

  function ensureMeteringContainer(data, options = {}) {
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Zählerdaten benötigen einen gültigen NK-Pro-Datensatz.");
    if (!data.zaehlerDaten || typeof data.zaehlerDaten !== "object" || Array.isArray(data.zaehlerDaten)) data.zaehlerDaten = {};
    const container = data.zaehlerDaten;
    container.version = METERING_DATA_VERSION;
    container.meteringDataVersion = METERING_DATA_VERSION;
    container.meterMasterStandardVersion = METER_MASTER_STANDARD_VERSION;
    if (!Array.isArray(container.zaehler)) container.zaehler = [];
    if (!Array.isArray(container.messwerte)) container.messwerte = [];
    if (!Array.isArray(container.messperioden)) container.messperioden = [];
    if (!Array.isArray(container.zuordnungen)) container.zuordnungen = [];
    if (!Array.isArray(container.zaehlerwechsel)) container.zaehlerwechsel = [];
    if (!container.createdAt) container.createdAt = (options.now || (() => new Date().toISOString()))();
    return container;
  }

  function billingPeriod(data) {
    const meta = data && data.meta || {};
    const year = text(meta.abrechnungsjahr);
    return {
      start:text(meta.abrechnungsbeginn) || (year ? year + "-01-01" : ""),
      end:text(meta.abrechnungsende) || (year ? year + "-12-31" : ""),
      year
    };
  }

  function actualTenantRows(data) {
    return (Array.isArray(data && data.mieter) ? data.mieter : []).map((row, index) => ({ row:row || {}, index })).filter(item => {
      const row = item.row;
      return !!(text(row.id) || text(row.wohnung) || text(row.name) || text(row.einzug) || text(row.auszug));
    });
  }

  function canonicalLegacyMeterId(type, unitId, costId, fallback) {
    const unit = safeId(unitId) || ("ROW-" + String(Number(fallback || 0) + 1).padStart(3, "0"));
    if (type === "cold-water") return "Z-WASSER-KW-" + unit;
    if (type === "hot-water") return "Z-WASSER-WW-" + unit;
    return "Z-" + safeId(costId || "VERBRAUCH") + "-" + unit;
  }

  function legacyMeterSources(data) {
    const result = [];
    const standard = data && data.objektStandard || {};
    const objectId = text(standard.objekt && (standard.objekt.id || standard.objekt.objektId)) || text(data && data.meta && data.meta.objektId) || "OBJ-001";
    const buildingId = text(standard.gebaeude && standard.gebaeude[0] && (standard.gebaeude[0].id || standard.gebaeude[0].gebaeudeId)) || "GEB-001";
    const waterRows = data && data.waterMeters && Array.isArray(data.waterMeters.readings) ? data.waterMeters.readings : [];
    const tenants = actualTenantRows(data);
    tenants.forEach(item => {
      const tenant = item.row;
      const index = item.index;
      const unitId = text(tenant.wohnung);
      if (!waterRows[index] || !unitId) return;
      for (const channel of [
        { type:"cold-water", label:"Kaltwasser", key:"water-cold" },
        { type:"hot-water", label:"Warmwasser", key:"water-hot" }
      ]) {
        result.push({
          legacySourceKey:channel.key + ":" + unitId,
          canonicalId:canonicalLegacyMeterId(channel.type, unitId, "K002", index),
          meterType:channel.type,
          zaehlerTyp:channel.type,
          bezeichnung:channel.label + " " + unitId,
          einheit:"m³",
          kostenId:"K002",
          objektId:objectId,
          gebaeudeId:buildingId,
          einheitId:unitId,
          verbrauchsstelleId:"VS-" + safeId(unitId + "-" + channel.key),
          standortbeschreibung:text(tenant.lage || tenant.wohnung),
          abrechnungsrelevant:true,
          billingRole:"billing",
          status:"aktiv",
          sourcePath:"waterMeters.readings",
          legacyBindings:[{ index, tenantId:text(tenant.id), unitId, channel:channel.key }]
        });
      }
    });

    // AP22F10B/F1-F2: Jede aktive Wohnung besitzt einen Kalt- und einen
    // Warmwasserzähler. Für Leerstand werden unit-bezogene Zählerstämme ohne
    // künstlichen Mieterdatensatz und ohne Legacy-Arraybindung ergänzt.
    const costs = Array.isArray(data && data.kostenarten) ? data.kostenarten : [];
    const waterSourceKeys = new Set(result.map(row => text(row.legacySourceKey)));
    const hasWaterContext = waterRows.length > 0 || costs.some(cost => text(cost && cost.id) === "K002");
    // AP22F10C Korrektur 1: Der Wohnungsstatus ist kein Ausschlusskriterium für
    // physische Wasserzähler. Auch eine vollständig leer stehende und deshalb
    // als inaktiv gekennzeichnete Wohnung benötigt Kalt- und Warmwasserzähler.
    const activeUnits = hasWaterContext ? (Array.isArray(data && data.wohnungen) ? data.wohnungen : []).filter(unit => unit && text(unit.id)) : [];
    activeUnits.forEach((unit, unitIndex) => {
      const unitId = text(unit.id);
      for (const channel of [
        { type:"cold-water", label:"Kaltwasser", key:"water-cold" },
        { type:"hot-water", label:"Warmwasser", key:"water-hot" }
      ]) {
        const sourceKey = channel.key + ":" + unitId;
        if (waterSourceKeys.has(sourceKey)) continue;
        waterSourceKeys.add(sourceKey);
        result.push({
          legacySourceKey:sourceKey,
          canonicalId:canonicalLegacyMeterId(channel.type, unitId, "K002", unitIndex),
          meterType:channel.type,
          zaehlerTyp:channel.type,
          bezeichnung:channel.label + " " + unitId,
          einheit:"m³",
          kostenId:"K002",
          objektId:objectId,
          gebaeudeId:buildingId,
          einheitId:unitId,
          verbrauchsstelleId:"VS-" + safeId(unitId + "-" + channel.key),
          standortbeschreibung:text(unit.lage || unit.bezeichnung || unitId),
          abrechnungsrelevant:true,
          billingRole:"billing",
          status:"aktiv",
          sourcePath:"derived-active-unit",
          legacyBindings:[]
        });
      }
    });

    const generic = data && data.meterReadings && data.meterReadings.readings && typeof data.meterReadings.readings === "object" ? data.meterReadings.readings : {};
    Object.keys(generic).sort().forEach(costId => {
      const rows = Array.isArray(generic[costId]) ? generic[costId] : [];
      const cost = costs.find(item => text(item && item.id) === costId) || {};
      tenants.forEach(item => {
        const tenant = item.row;
        const index = item.index;
        const unitId = text(tenant.wohnung);
        if (!rows[index] || !unitId) return;
        result.push({
          legacySourceKey:"generic:" + costId + ":" + unitId,
          canonicalId:canonicalLegacyMeterId("generic", unitId, costId, index),
          meterType:"consumption-" + costId.toLowerCase(),
          zaehlerTyp:"consumption-" + costId.toLowerCase(),
          bezeichnung:text(cost.kostenart) || ("Verbrauch " + costId),
          einheit:text(rows[index] && (rows[index].einheit || rows[index].unit)) || "Einheit",
          kostenId:costId,
          objektId:objectId,
          gebaeudeId:buildingId,
          einheitId:unitId,
          verbrauchsstelleId:"VS-" + safeId(unitId + "-" + costId),
          standortbeschreibung:text(tenant.lage || tenant.wohnung),
          abrechnungsrelevant:true,
          billingRole:"billing",
          status:"aktiv",
          sourcePath:"meterReadings.readings." + costId,
          legacyBindings:[{ index, tenantId:text(tenant.id), unitId, costId }]
        });
      });
    });
    return result;
  }

  function normalizeMasterRecord(input, index, options = {}) {
    const row = cloneWith(options, input || {});
    const oldId = text(row.meterId || row.zaehlerId || row.id);
    const generatedId = text(options.generatedId || row.canonicalId) || stableId("Z", row.legacySourceKey || row.zaehlernummer || row.bezeichnung || index);
    const id = oldId || generatedId;
    row.meterId = id;
    row.zaehlerId = id;
    row.id = id;
    row.meterType = text(row.meterType || row.zaehlerTyp || row.type) || "other";
    row.zaehlerTyp = row.meterType;
    row.bezeichnung = text(row.bezeichnung || row.label || row.meterType);
    row.zaehlernummer = text(row.zaehlernummer || row.meterNumber || row.number);
    row.einheit = text(row.einheit || row.unit) || (isElectricityDummyMeter(row) ? "kWh" : "Einheit");
    row.status = text(row.status) || (row.ausbaudatum ? "ausgebaut" : "aktiv");
    row.einbaudatum = text(row.einbaudatum || row.installationDate || row.einbauDatum);
    row.ausbaudatum = text(row.ausbaudatum || row.removalDate || row.ausbauDatum);
    row.standortbeschreibung = text(row.standortbeschreibung || row.location);
    row.objektId = text(row.objektId);
    row.gebaeudeId = text(row.gebaeudeId);
    row.einheitId = text(row.einheitId || row.unitId);
    row.nutzerId = text(row.nutzerId || row.partnerId || row.tenantId);
    row.verbrauchsstelleId = text(row.verbrauchsstelleId || row.consumptionPointId);
    row.kostenId = text(row.kostenId || row.costId);
    row.vorgaengerZaehlerId = text(row.vorgaengerZaehlerId || row.predecessorMeterId);
    row.nachfolgerZaehlerId = text(row.nachfolgerZaehlerId || row.successorMeterId);
    row.meterMasterStandardVersion = METER_MASTER_STANDARD_VERSION;
    if (isElectricityDummyMeter(row)) {
      row.meterType = ELECTRICITY_DUMMY_METER_TYPE;
      row.zaehlerTyp = ELECTRICITY_DUMMY_METER_TYPE;
      row.abrechnungsrelevant = false;
      row.billingRole = "excluded";
      row.ausschlussgrund = text(row.ausschlussgrund) || "Stromzähler-Dummy ist nicht Bestandteil der Nebenkostenabrechnung.";
      row.einheit = row.einheit || "kWh";
    } else {
      row.abrechnungsrelevant = row.abrechnungsrelevant !== false;
      row.billingRole = row.abrechnungsrelevant ? "billing" : "excluded";
      if (!row.abrechnungsrelevant) row.ausschlussgrund = text(row.ausschlussgrund) || "Zähler ist nicht abrechnungsrelevant.";
    }
    if (Array.isArray(row.zaehlerstaende)) delete row.zaehlerstaende;
    if (Array.isArray(row.measurements)) delete row.measurements;
    delete row.canonicalId;
    return row;
  }

  function mergeBindings(left, right) {
    const result = [];
    const seen = new Set();
    for (const item of (Array.isArray(left) ? left : []).concat(Array.isArray(right) ? right : [])) {
      const key = JSON.stringify([item && item.index, item && item.tenantId, item && item.unitId, item && item.channel, item && item.costId]);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(item);
    }
    return result;
  }

  function normalizeMeterMasters(data, options = {}) {
    const container = ensureMeteringContainer(data, options);
    const stored = Array.isArray(container.zaehler) ? container.zaehler : [];
    const previousStandard = data && data.objektStandard && Array.isArray(data.objektStandard.zaehler) ? data.objektStandard.zaehler : [];
    const rootMeters = Array.isArray(data && data.zaehler) ? data.zaehler : [];
    const existing = stored.concat(previousStandard, rootMeters);
    const byId = new Map();
    const bySource = new Map();
    existing.forEach((meter, index) => {
      if (!meter || typeof meter !== "object") return;
      const normalized = normalizeMasterRecord(meter, index, options);
      const id = normalized.meterId;
      if (!byId.has(id)) byId.set(id, normalized);
      const keys = [];
      if (text(normalized.legacySourceKey)) keys.push(text(normalized.legacySourceKey));
      (Array.isArray(normalized.legacySourceKeys) ? normalized.legacySourceKeys : []).forEach(key => keys.push(text(key)));
      keys.filter(Boolean).forEach(key => { if (!bySource.has(key)) bySource.set(key, normalized); });
    });

    const result = [];
    const usedIds = new Set();
    function pushMeter(meter) {
      let row = normalizeMasterRecord(meter, result.length, options);
      if (usedIds.has(row.meterId)) {
        const index = result.findIndex(item => item.meterId === row.meterId);
        const current = result[index];
        row = normalizeMasterRecord(Object.assign({}, current, row, {
          legacyBindings:mergeBindings(current.legacyBindings, row.legacyBindings),
          legacyMeterIds:Array.from(new Set((current.legacyMeterIds || []).concat(row.legacyMeterIds || [])))
        }), index, options);
        result[index] = row;
      } else {
        usedIds.add(row.meterId);
        result.push(row);
      }
    }

    legacyMeterSources(data).forEach(source => {
      const prior = bySource.get(source.legacySourceKey);
      let base = prior ? cloneWith(options, prior) : {};
      const priorLooksLegacyDerived = !!(base.sourcePath && !text(base.zaehlernummer) && !stored.some(item => text(item && (item.meterId || item.zaehlerId || item.id)) === text(base.meterId)));
      const oldId = text(base.meterId || base.zaehlerId || base.id);
      const canonicalId = source.canonicalId;
      const chosenId = priorLooksLegacyDerived || !oldId ? canonicalId : oldId;
      const legacyMeterIds = Array.from(new Set((base.legacyMeterIds || []).concat(oldId && oldId !== chosenId ? [oldId] : [])));
      base = Object.assign({}, base, source, {
        meterId:chosenId,
        zaehlerId:chosenId,
        id:chosenId,
        legacySourceKeys:Array.from(new Set((base.legacySourceKeys || []).concat(source.legacySourceKey))),
        legacyBindings:mergeBindings(base.legacyBindings, source.legacyBindings),
        legacyMeterIds
      });
      pushMeter(base);
    });

    existing.forEach((meter, index) => {
      if (!meter || typeof meter !== "object") return;
      const sourceKey = text(meter.legacySourceKey);
      if (sourceKey && result.some(row => (row.legacySourceKeys || []).includes(sourceKey))) return;
      const normalized = normalizeMasterRecord(meter, index, options);
      if (!result.some(row => row.meterId === normalized.meterId)) pushMeter(normalized);
    });

    container.zaehler = result;
    container.meterMasterStandardVersion = METER_MASTER_STANDARD_VERSION;
    return result;
  }

  function createElectricityDummyMeter(input = {}, options = {}) {
    const id = text(input.meterId || input.zaehlerId || input.id) || stableId("Z-STROM-DUMMY", input.zaehlernummer || input.bezeichnung || (options.now || (() => new Date().toISOString()))());
    return normalizeMasterRecord(Object.assign({}, cloneWith(options, input), {
      meterId:id,
      zaehlerId:id,
      id,
      meterType:ELECTRICITY_DUMMY_METER_TYPE,
      zaehlerTyp:ELECTRICITY_DUMMY_METER_TYPE,
      bezeichnung:text(input.bezeichnung) || "Stromzähler-Dummy",
      einheit:text(input.einheit || input.unit) || "kWh",
      abrechnungsrelevant:false,
      billingRole:"excluded",
      ausschlussgrund:text(input.ausschlussgrund) || "Stromzähler-Dummy ist nicht Bestandteil der Nebenkostenabrechnung."
    }), 0, options);
  }

  function addElectricityDummyMeter(data, input = {}, options = {}) {
    const container = ensureMeteringContainer(data, options);
    normalizeMeterMasters(data, options);
    const meter = createElectricityDummyMeter(input, options);
    const index = container.zaehler.findIndex(row => text(row && (row.meterId || row.zaehlerId || row.id)) === meter.meterId);
    if (index >= 0) container.zaehler[index] = Object.assign({}, container.zaehler[index], meter);
    else container.zaehler.push(meter);
    return meter;
  }

  function billingRelevantMeters(input) {
    const container = input && input.zaehlerDaten ? input.zaehlerDaten : input;
    const meters = container && Array.isArray(container.zaehler) ? container.zaehler : [];
    return meters.filter(meter => !isElectricityDummyMeter(meter) && meter.abrechnungsrelevant !== false && text(meter.billingRole) !== "excluded");
  }

  global.NKProMeterMaster = Object.freeze({
    METER_MASTER_STANDARD_VERSION,
    METERING_DATA_VERSION,
    ELECTRICITY_DUMMY_METER_TYPE,
    text,
    safeId,
    hash,
    stableId,
    billingPeriod,
    ensureMeteringContainer,
    canonicalLegacyMeterId,
    normalizeMasterRecord,
    normalizeMeterMasters,
    createElectricityDummyMeter,
    addElectricityDummyMeter,
    isElectricityDummyMeter,
    billingRelevantMeters
  });
})(globalThis);
