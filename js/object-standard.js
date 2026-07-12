(function (global) {
  "use strict";

  const OBJECT_STANDARD_VERSION = 1;
  const OBJECT_STANDARD_ROLE = "billingObject";
  const ELECTRICITY_DUMMY_METER_TYPE = "electricity-dummy";

  function cloneWith(options, value) {
    return options && typeof options.clone === "function"
      ? options.clone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function nowWith(options) {
    return (options && typeof options.now === "function" ? options.now : () => new Date().toISOString())();
  }

  function text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function safeId(value) {
    return text(value).toUpperCase().replace(/Ä/g, "AE").replace(/Ö/g, "OE").replace(/Ü/g, "UE").replace(/ß/g, "SS")
      .replace(/[^A-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function stableId(prefix, value, fallbackIndex) {
    const candidate = safeId(value);
    return candidate || (prefix + "-" + String((fallbackIndex || 0) + 1).padStart(3, "0"));
  }

  function objectIdFor(data, standard) {
    const meta = data && data.meta || {};
    const existing = standard && standard.objekt || {};
    return text(existing.id || existing.objektId || meta.objektId) || "OBJ-001";
  }

  function commonPropertyAddress(tenants) {
    const rows = Array.isArray(tenants) ? tenants.filter(Boolean) : [];
    const counts = new Map();
    rows.forEach(row => {
      const key = [text(row.strasse), text(row.plz), text(row.ort)].join("|");
      if (key.replace(/\|/g, "")) counts.set(key, (counts.get(key) || 0) + 1);
    });
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!best) return { strasse:"", plz:"", ort:"" };
    const parts = best[0].split("|");
    return { strasse:parts[0] || "", plz:parts[1] || "", ort:parts[2] || "" };
  }

  function mergeById(existingRows, sourceRows, idKeys, transform) {
    const existing = Array.isArray(existingRows) ? existingRows : [];
    const lookup = new Map();
    existing.forEach((row, index) => {
      const id = idKeys.map(key => text(row && row[key])).find(Boolean) || "__existing_" + index;
      lookup.set(id, row);
    });
    return (Array.isArray(sourceRows) ? sourceRows : []).map((row, index) => {
      const id = idKeys.map(key => text(row && row[key])).find(Boolean) || "__source_" + index;
      const base = lookup.has(id) ? cloneWith({}, lookup.get(id)) : {};
      const merged = Object.assign(base, cloneWith({}, row || {}));
      return transform ? transform(merged, row || {}, index) : merged;
    });
  }

  function inferUnitType(unit) {
    const explicit = text(unit && (unit.einheitTyp || unit.typ));
    if (explicit) return explicit;
    const label = text(unit && (unit.bezeichnung || unit.lage)).toLowerCase();
    if (label.includes("gewerbe")) return "Gewerbeeinheit";
    if (label.includes("garage") || label.includes("stellplatz")) return "Sonstige Einheit";
    return "Wohnung";
  }

  function distributionKeyId(value) {
    const id = stableId("VS", value, 0);
    return id.startsWith("VS-") ? id : "VS-" + id;
  }

  function isElectricityDummyMeter(meter) {
    const type = text(meter && (meter.meterType || meter.zaehlerTyp || meter.type)).toLowerCase();
    return type === ELECTRICITY_DUMMY_METER_TYPE || type === "stromzähler-dummy" || type === "stromzaehler-dummy";
  }

  function normalizeMeter(meter, index, objectId, buildingId) {
    const row = cloneWith({}, meter || {});
    row.meterId = text(row.meterId || row.zaehlerId || row.id) || stableId("Z", row.zaehlernummer || row.meterNumber || row.bezeichnung, index);
    row.zaehlerId = row.meterId;
    row.meterType = text(row.meterType || row.zaehlerTyp || row.type) || "other";
    row.zaehlerTyp = row.meterType;
    row.bezeichnung = text(row.bezeichnung || row.label || row.meterType);
    row.zaehlernummer = text(row.zaehlernummer || row.meterNumber || row.number);
    row.einheit = text(row.einheit || row.unit);
    row.standortbeschreibung = text(row.standortbeschreibung || row.location);
    row.objektId = text(row.objektId) || objectId;
    row.gebaeudeId = text(row.gebaeudeId) || buildingId;
    row.zuordnungsebene = text(row.zuordnungsebene || row.assignmentLevel) || (row.einheitId ? "Einheit" : "Objekt");
    row.einheitId = text(row.einheitId || row.unitId);
    row.nutzerId = text(row.nutzerId || row.partnerId || row.tenantId);
    row.verbrauchsstelleId = text(row.verbrauchsstelleId || row.consumptionPointId);
    if (!Array.isArray(row.zaehlerstaende)) row.zaehlerstaende = [];
    if (isElectricityDummyMeter(row)) {
      row.meterType = ELECTRICITY_DUMMY_METER_TYPE;
      row.zaehlerTyp = ELECTRICITY_DUMMY_METER_TYPE;
      row.abrechnungsrelevant = false;
      row.billingRole = "excluded";
      row.ausschlussgrund = "Stromzähler-Dummy ist nicht Bestandteil der Nebenkostenabrechnung.";
      if (!row.einheit) row.einheit = "kWh";
    } else {
      row.abrechnungsrelevant = row.abrechnungsrelevant !== false;
      row.billingRole = row.abrechnungsrelevant ? "billing" : "excluded";
    }
    return row;
  }

  function createElectricityDummyMeter(input = {}, options = {}) {
    const objectId = text(options.objectId || input.objektId) || "OBJ-001";
    const buildingId = text(options.buildingId || input.gebaeudeId) || "GEB-001";
    const createdAt = nowWith(options);
    return normalizeMeter({
      ...cloneWith(options, input),
      meterId:text(input.meterId || input.zaehlerId || input.id) || stableId("Z-STROM-DUMMY", input.zaehlernummer || input.bezeichnung || createdAt, 0),
      meterType:ELECTRICITY_DUMMY_METER_TYPE,
      zaehlerTyp:ELECTRICITY_DUMMY_METER_TYPE,
      bezeichnung:text(input.bezeichnung) || "Stromzähler-Dummy",
      zaehlernummer:text(input.zaehlernummer || input.meterNumber),
      einheit:text(input.einheit || input.unit) || "kWh",
      standortbeschreibung:text(input.standortbeschreibung || input.location),
      objektId:objectId,
      gebaeudeId:buildingId,
      einheitId:text(input.einheitId || input.unitId),
      verbrauchsstelleId:text(input.verbrauchsstelleId || input.consumptionPointId),
      zuordnungsebene:text(input.zuordnungsebene || input.assignmentLevel) || (input.einheitId || input.unitId ? "Einheit" : (input.verbrauchsstelleId || input.consumptionPointId ? "Verbrauchsstelle" : "Objekt")),
      abrechnungsrelevant:false,
      billingRole:"excluded",
      createdAt:text(input.createdAt) || createdAt
    }, 0, objectId, buildingId);
  }

  function legacyWaterMeters(data, objectId, buildingId) {
    const tenants = Array.isArray(data && data.mieter) ? data.mieter : [];
    const rows = data && data.waterMeters && Array.isArray(data.waterMeters.readings) ? data.waterMeters.readings : [];
    const result = [];
    rows.forEach((reading, index) => {
      const tenant = tenants[index] || {};
      const unitId = text(tenant.wohnung);
      const tenantId = text(tenant.id);
      const common = {
        objektId:objectId,
        gebaeudeId:buildingId,
        einheitId:unitId,
        nutzerId:tenantId,
        zuordnungsebene:unitId ? "Einheit" : "Objekt",
        abrechnungsrelevant:true,
        billingRole:"billing",
        einheit:"m³",
        sourcePath:"waterMeters.readings[" + index + "]",
        legacyIndex:index
      };
      result.push(normalizeMeter({
        ...common,
        meterId:"Z-WASSER-KW-" + stableId("ROW", tenantId || unitId, index),
        meterType:"cold-water",
        bezeichnung:"Kaltwasser " + (unitId || tenantId || String(index + 1)),
        zaehlerstaende:[
          { rolle:"start", datum:text(reading && reading.kwStartDate), wert:reading && reading.kwStart },
          { rolle:"end", datum:text(reading && reading.kwEndDate), wert:reading && reading.kwEnd }
        ],
        bemerkung:text(reading && reading.bemerkung)
      }, result.length, objectId, buildingId));
      result.push(normalizeMeter({
        ...common,
        meterId:"Z-WASSER-WW-" + stableId("ROW", tenantId || unitId, index),
        meterType:"hot-water",
        bezeichnung:"Warmwasser " + (unitId || tenantId || String(index + 1)),
        zaehlerstaende:[
          { rolle:"start", datum:text(reading && reading.wwStartDate), wert:reading && reading.wwStart },
          { rolle:"end", datum:text(reading && reading.wwEndDate), wert:reading && reading.wwEnd }
        ],
        bemerkung:text(reading && reading.bemerkung)
      }, result.length, objectId, buildingId));
    });
    return result;
  }

  function legacyGenericMeters(data, objectId, buildingId) {
    const tenants = Array.isArray(data && data.mieter) ? data.mieter : [];
    const source = data && data.meterReadings && data.meterReadings.readings && typeof data.meterReadings.readings === "object"
      ? data.meterReadings.readings : {};
    const costs = Array.isArray(data && data.kostenarten) ? data.kostenarten : [];
    const result = [];
    Object.keys(source).sort().forEach(costId => {
      const rows = Array.isArray(source[costId]) ? source[costId] : [];
      const cost = costs.find(item => text(item && item.id) === costId) || {};
      rows.forEach((reading, index) => {
        if (!reading || typeof reading !== "object") return;
        const tenant = tenants[index] || {};
        const unitId = text(tenant.wohnung);
        const tenantId = text(tenant.id);
        const startValue = reading.start !== undefined ? reading.start : reading.startValue;
        const endValue = reading.end !== undefined ? reading.end : reading.endValue;
        result.push(normalizeMeter({
          meterId:"Z-" + stableId("VERBRAUCH", costId + "-" + (tenantId || unitId || index), index),
          meterType:"consumption-" + costId.toLowerCase(),
          bezeichnung:text(cost.kostenart) || ("Verbrauch " + costId),
          objektId:objectId,
          gebaeudeId:buildingId,
          einheitId:unitId,
          nutzerId:tenantId,
          zuordnungsebene:unitId ? "Einheit" : "Objekt",
          abrechnungsrelevant:true,
          billingRole:"billing",
          kostenId:costId,
          einheit:text(reading.einheit || reading.unit),
          sourcePath:"meterReadings.readings." + costId + "[" + index + "]",
          legacyIndex:index,
          zaehlerstaende:[
            { rolle:"start", datum:text(reading.startDate || reading.von), wert:startValue },
            { rolle:"end", datum:text(reading.endDate || reading.bis), wert:endValue }
          ],
          legacyReading:cloneWith({}, reading)
        }, result.length, objectId, buildingId));
      });
    });
    return result;
  }

  function mergeMeters(existingRows, derivedRows, objectId, buildingId) {
    const result = [];
    const indexById = new Map();
    function add(row) {
      const normalized = normalizeMeter(row, result.length, objectId, buildingId);
      const id = normalized.meterId;
      if (indexById.has(id)) {
        const index = indexById.get(id);
        result[index] = normalizeMeter(Object.assign({}, result[index], normalized), index, objectId, buildingId);
      } else {
        indexById.set(id, result.length);
        result.push(normalized);
      }
    }
    (Array.isArray(existingRows) ? existingRows : []).forEach(add);
    (Array.isArray(derivedRows) ? derivedRows : []).forEach(add);
    return result;
  }

  function requiresObjectStandardMigration(data) {
    const standard = data && data.objektStandard;
    return !standard || typeof standard !== "object" || Array.isArray(standard) || Number(standard.version || standard.objectStandardVersion) !== OBJECT_STANDARD_VERSION;
  }

  function normalizeObjectStandard(data, options = {}) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return data;
    if (!data.meta || typeof data.meta !== "object" || Array.isArray(data.meta)) data.meta = {};
    const previous = data.objektStandard && typeof data.objektStandard === "object" && !Array.isArray(data.objektStandard)
      ? cloneWith(options, data.objektStandard) : {};
    const objectId = objectIdFor(data, previous);
    const master = data.stammdaten && typeof data.stammdaten === "object" ? data.stammdaten : {};
    const sourceUnits = Array.isArray(master.wohnungen) && master.wohnungen.length ? master.wohnungen : (Array.isArray(data.wohnungen) ? data.wohnungen : []);
    const rawTenants = Array.isArray(master.mieter) && master.mieter.length ? master.mieter : (Array.isArray(data.mieter) ? data.mieter : []);
    const sourceTenants = rawTenants.filter(row => row && (text(row.name) || text(row.wohnung) || text(row.einzug) || text(row.auszug) || Number(row.kaltSoll) || Number(row.kaltErhalten) || Number(row.nkVoraus) || Number(row.einnahmen)));
    const address = commonPropertyAddress(sourceTenants);
    const existingBuildings = Array.isArray(previous.gebaeude) ? previous.gebaeude : [];
    const buildingId = text(existingBuildings[0] && (existingBuildings[0].id || existingBuildings[0].gebaeudeId)) || "GEB-001";
    const previousObject = previous.objekt && typeof previous.objekt === "object" ? previous.objekt : {};
    const object = Object.assign({}, previousObject, {
      id:objectId,
      objektId:objectId,
      bezeichnung:text(previousObject.bezeichnung || data.meta.objektBezeichnung) || (address.strasse ? "Objekt " + address.strasse : "Objekt"),
      status:text(previousObject.status) || "aktiv",
      rolle:OBJECT_STANDARD_ROLE
    });
    const buildings = existingBuildings.length ? existingBuildings.map((building, index) => Object.assign({}, cloneWith(options, building), {
      id:text(building.id || building.gebaeudeId) || (index === 0 ? buildingId : "GEB-" + String(index + 1).padStart(3, "0")),
      gebaeudeId:text(building.gebaeudeId || building.id) || (index === 0 ? buildingId : "GEB-" + String(index + 1).padStart(3, "0")),
      objektId:objectId,
      bezeichnung:text(building.bezeichnung) || (index === 0 ? "Hauptgebäude" : "Gebäude " + (index + 1)),
      strasse:text(building.strasse) || address.strasse,
      plz:text(building.plz) || address.plz,
      ort:text(building.ort) || address.ort
    })) : [{
      id:buildingId,
      gebaeudeId:buildingId,
      objektId:objectId,
      bezeichnung:"Hauptgebäude",
      strasse:address.strasse,
      plz:address.plz,
      ort:address.ort
    }];

    const units = mergeById(previous.einheiten, sourceUnits, ["einheitId", "id"], (merged, source, index) => {
      const id = text(source.id || merged.einheitId || merged.id) || stableId("EINHEIT", source.bezeichnung || source.lage, index);
      const area = Number(source.wohnflaeche !== undefined ? source.wohnflaeche : merged.wohnflaeche);
      return Object.assign(merged, {
        id,
        einheitId:id,
        abrechnungseinheitId:text(merged.abrechnungseinheitId) || id,
        objektId:objectId,
        gebaeudeId:text(merged.gebaeudeId) || buildingId,
        einheitTyp:inferUnitType(Object.assign({}, merged, source)),
        bezeichnung:text(source.bezeichnung || merged.bezeichnung || source.lage || id),
        status:text(source.status || merged.status) || "aktiv",
        wohnflaeche:Number.isFinite(area) ? area : 0,
        verteilungsgrundlagen:Object.assign({}, merged.verteilungsgrundlagen || {}, { wohnflaeche:Number.isFinite(area) ? area : 0 })
      });
    });

    const partners = mergeById(previous.partner, sourceTenants, ["partnerId", "id"], (merged, source, index) => {
      const id = text(source.id || merged.partnerId || merged.id) || stableId("PARTNER", source.name, index);
      const role = text(source.abrechnungRolle || merged.abrechnungRolle) || "Mieter";
      return Object.assign(merged, {
        id,
        partnerId:id,
        name:text(source.name || merged.name),
        rollen:Array.isArray(merged.rollen) && merged.rollen.length ? merged.rollen.slice() : [role],
        abrechnungRolle:role,
        strasse:text(source.strasse || merged.strasse),
        plz:text(source.plz || merged.plz),
        ort:text(source.ort || merged.ort),
        telefon:text(source.telefon || merged.telefon),
        email:text(source.email || merged.email)
      });
    });

    const partnerById = new Map(partners.map(row => [text(row.partnerId || row.id), row]));
    const previousContracts = Array.isArray(previous.vertraege) ? previous.vertraege : [];
    const contractSources = sourceTenants.map((tenant, index) => ({ ...tenant, legacyTenantId:text(tenant.id), vertragId:"V-" + stableId("VERTRAG", tenant.id || tenant.name || index, index) }));
    const contracts = mergeById(previousContracts, contractSources, ["vertragId", "id"], (merged, source, index) => {
      const partnerId = text(source.legacyTenantId || source.partnerId || merged.partnerId);
      const unitId = text(source.wohnung || merged.einheitId);
      const id = text(source.vertragId || merged.vertragId || merged.id) || "V-" + stableId("VERTRAG", partnerId || (unitId + "-" + index), index);
      const partner = partnerById.get(partnerId) || {};
      return Object.assign(merged, {
        id,
        vertragId:id,
        objektId:objectId,
        einheitId:unitId,
        partnerId,
        vertragspartnerName:text(partner.name || source.name),
        rolle:text(source.abrechnungRolle || merged.rolle || partner.abrechnungRolle) || "Mieter",
        beginn:text(source.einzug || merged.beginn),
        ende:text(source.auszug || merged.ende),
        status:text(source.status || merged.status) || "Aktiv",
        einzug:text(source.einzug || merged.einzug),
        auszug:text(source.auszug || merged.auszug)
      });
    });

    const sourceCosts = Array.isArray(data.kostenarten) ? data.kostenarten : [];
    const costs = mergeById(previous.kostenarten, sourceCosts, ["kostenartId", "id"], (merged, source, index) => {
      const id = text(source.id || merged.kostenartId || merged.id) || stableId("K", source.kostenart, index);
      return Object.assign(merged, {
        id,
        kostenartId:id,
        bezeichnung:text(source.kostenart || merged.bezeichnung),
        verteilerschluesselId:distributionKeyId(source.umlageschluessel || merged.umlageschluessel),
        umlageschluessel:text(source.umlageschluessel || merged.umlageschluessel),
        berechnungsart:text(source.berechnungsart || merged.berechnungsart),
        umlagefaehig:source.inNK === "Ja",
        vorauszahlungRelevant:source.vorauszahlung === "Ja"
      });
    });

    const distributionValues = [];
    costs.forEach(cost => {
      const value = text(cost.umlageschluessel);
      if (value && !distributionValues.includes(value)) distributionValues.push(value);
    });
    const existingDistribution = Array.isArray(previous.verteilerschluessel) ? previous.verteilerschluessel : [];
    const distribution = mergeById(existingDistribution, distributionValues.map(value => ({ id:distributionKeyId(value), bezeichnung:value })), ["verteilerschluesselId", "id"], merged => ({
      ...merged,
      id:text(merged.id || merged.verteilerschluesselId),
      verteilerschluesselId:text(merged.verteilerschluesselId || merged.id),
      bezeichnung:text(merged.bezeichnung),
      typ:text(merged.typ) || "bestehender Umlageschlüssel"
    }));

    const owner = previous.eigentuemer && typeof previous.eigentuemer === "object" ? cloneWith(options, previous.eigentuemer) : {};
    const brief = data.briefSettings && typeof data.briefSettings === "object" ? data.briefSettings : {};
    owner.id = text(owner.id || owner.partnerId) || "PAR-OWNER-001";
    owner.partnerId = owner.id;
    owner.rolle = "Eigentümer/Vermieter";
    owner.name = text(owner.name || brief.absenderName || brief.absender);
    owner.strasse = text(owner.strasse || brief.absenderStrasse);
    owner.ort = text(owner.ort || brief.absenderOrt);
    owner.telefon = text(owner.telefon || brief.absenderTelefon);

    const existingMeters = Array.isArray(previous.zaehler) ? previous.zaehler : (Array.isArray(data.zaehler) ? data.zaehler : []);
    const derivedMeters = legacyWaterMeters(data, objectId, buildingId).concat(legacyGenericMeters(data, objectId, buildingId));
    const meters = mergeMeters(existingMeters, derivedMeters, objectId, buildingId);
    const consumptionPoints = [];
    meters.forEach(meter => {
      const pointId = text(meter.verbrauchsstelleId);
      if (!pointId || consumptionPoints.some(item => item.verbrauchsstelleId === pointId)) return;
      consumptionPoints.push({
        id:pointId,
        verbrauchsstelleId:pointId,
        objektId:objectId,
        gebaeudeId:text(meter.gebaeudeId),
        einheitId:text(meter.einheitId),
        bezeichnung:text(meter.standortbeschreibung || meter.bezeichnung)
      });
    });

    const start = text(data.meta.abrechnungsbeginn || (data.meta.abrechnungsjahr ? data.meta.abrechnungsjahr + "-01-01" : ""));
    const end = text(data.meta.abrechnungsende || (data.meta.abrechnungsjahr ? data.meta.abrechnungsjahr + "-12-31" : ""));
    const periods = Array.isArray(previous.abrechnungszeitraeume) ? previous.abrechnungszeitraeume.slice() : [];
    const periodId = start && end ? "AZ-" + start + "-" + end : "";
    if (periodId && !periods.some(item => text(item.id || item.abrechnungszeitraumId) === periodId)) {
      periods.push({ id:periodId, abrechnungszeitraumId:periodId, objektId:objectId, beginn:start, ende:end, jahr:text(data.meta.abrechnungsjahr), status:"laufend" });
    }

    const standard = Object.assign({}, previous, {
      version:OBJECT_STANDARD_VERSION,
      objectStandardVersion:OBJECT_STANDARD_VERSION,
      role:OBJECT_STANDARD_ROLE,
      objekt:object,
      gebaeude:buildings,
      einheiten:units,
      eigentuemer:owner,
      partner:partners,
      vertraege:contracts,
      kostenarten:costs,
      verteilerschluessel:distribution,
      vorauszahlungen:cloneWith(options, Array.isArray(data.vorauszahlungen) ? data.vorauszahlungen : []),
      zaehler:meters,
      verbrauchsstellen:consumptionPoints,
      abrechnungszeitraeume:periods,
      abrechnungsrelevanteEinstellungen:{
        umlageInputs:cloneWith(options, data.umlageInputs || {}),
        kostenartenMieterUmlage:cloneWith(options, data.kostenartenMieterUmlage || {}),
        prepaymentAdjustmentSettings:cloneWith(options, data.prepaymentAdjustmentSettings || {})
      }
    });
    if (!previous.createdAt) standard.createdAt = nowWith(options);
    standard.updatedWithAppVersion = text(options.appVersion);
    data.objektStandard = standard;
    data.meta.objektId = objectId;
    data.meta.objectStandardVersion = OBJECT_STANDARD_VERSION;
    data.meta.objectStandardRole = OBJECT_STANDARD_ROLE;
    return data;
  }

  function issue(code, severity, path, message, entityId) {
    return { code, severity, path, message, entityId:text(entityId) };
  }

  function validateObjectStandard(input, options = {}) {
    const standard = input && input.objektStandard ? input.objektStandard : input;
    const issues = [];
    if (!standard || typeof standard !== "object" || Array.isArray(standard)) {
      issues.push(issue("OBJECT_STANDARD_MISSING", "error", "objektStandard", "Objektstandard fehlt."));
      return { valid:false, errors:issues.slice(), warnings:[], infos:[], issues };
    }
    if (Number(standard.version || standard.objectStandardVersion) !== OBJECT_STANDARD_VERSION) {
      issues.push(issue("OBJECT_STANDARD_VERSION_UNSUPPORTED", "error", "objektStandard.version", "Objektstandard-Version ist nicht unterstützt."));
    }
    const objectId = text(standard.objekt && (standard.objekt.id || standard.objekt.objektId));
    if (!objectId) issues.push(issue("OBJECT_ID_MISSING", "error", "objektStandard.objekt.id", "Objekt-ID fehlt."));
    const buildings = Array.isArray(standard.gebaeude) ? standard.gebaeude : [];
    const buildingIds = new Set();
    buildings.forEach((row, index) => {
      const id = text(row && (row.id || row.gebaeudeId));
      if (!id) issues.push(issue("BUILDING_ID_MISSING", "error", "objektStandard.gebaeude[" + index + "]", "Gebäude-ID fehlt."));
      else if (buildingIds.has(id)) issues.push(issue("BUILDING_ID_DUPLICATE", "error", "objektStandard.gebaeude[" + index + "]", "Gebäude-ID ist doppelt: " + id, id));
      else buildingIds.add(id);
      if (objectId && text(row && row.objektId) !== objectId) issues.push(issue("BUILDING_OBJECT_MISMATCH", "error", "objektStandard.gebaeude[" + index + "].objektId", "Gebäude ist nicht eindeutig dem Objekt zugeordnet.", id));
    });
    const units = Array.isArray(standard.einheiten) ? standard.einheiten : [];
    const unitIds = new Set();
    units.forEach((row, index) => {
      const id = text(row && (row.einheitId || row.id));
      if (!id) issues.push(issue("UNIT_ID_MISSING", "error", "objektStandard.einheiten[" + index + "]", "Einheiten-ID fehlt."));
      else if (unitIds.has(id)) issues.push(issue("UNIT_ID_DUPLICATE", "error", "objektStandard.einheiten[" + index + "]", "Einheiten-ID ist doppelt: " + id, id));
      else unitIds.add(id);
      if (row && row.gebaeudeId && !buildingIds.has(text(row.gebaeudeId))) issues.push(issue("UNIT_BUILDING_UNKNOWN", "error", "objektStandard.einheiten[" + index + "].gebaeudeId", "Einheit verweist auf ein unbekanntes Gebäude.", id));
    });
    const partners = Array.isArray(standard.partner) ? standard.partner : [];
    const partnerIds = new Set(partners.map(row => text(row && (row.partnerId || row.id))).filter(Boolean));
    const contracts = Array.isArray(standard.vertraege) ? standard.vertraege : [];
    const contractIds = new Set();
    contracts.forEach((row, index) => {
      const id = text(row && (row.vertragId || row.id));
      if (!id) issues.push(issue("CONTRACT_ID_MISSING", "error", "objektStandard.vertraege[" + index + "]", "Vertrags-ID fehlt."));
      else if (contractIds.has(id)) issues.push(issue("CONTRACT_ID_DUPLICATE", "error", "objektStandard.vertraege[" + index + "]", "Vertrags-ID ist doppelt: " + id, id));
      else contractIds.add(id);
      if (row && row.einheitId && !unitIds.has(text(row.einheitId))) issues.push(issue("CONTRACT_UNIT_UNKNOWN", "error", "objektStandard.vertraege[" + index + "].einheitId", "Vertrag verweist auf eine unbekannte Einheit.", id));
      if (row && row.partnerId && !partnerIds.has(text(row.partnerId))) issues.push(issue("CONTRACT_PARTNER_UNKNOWN", "error", "objektStandard.vertraege[" + index + "].partnerId", "Vertrag verweist auf einen unbekannten Partner.", id));
      const start = Date.parse(text(row && (row.beginn || row.einzug)));
      const endText = text(row && (row.ende || row.auszug));
      const end = endText ? Date.parse(endText) : NaN;
      if (endText && Number.isFinite(start) && Number.isFinite(end) && end < start) issues.push(issue("CONTRACT_PERIOD_INVALID", "error", "objektStandard.vertraege[" + index + "]", "Vertragsende liegt vor dem Vertragsbeginn.", id));
    });
    const meters = Array.isArray(standard.zaehler) ? standard.zaehler : [];
    const meterIds = new Set();
    meters.forEach((row, index) => {
      const id = text(row && (row.meterId || row.zaehlerId || row.id));
      if (!id) issues.push(issue("METER_ID_MISSING", "error", "objektStandard.zaehler[" + index + "]", "Zähler-ID fehlt."));
      else if (meterIds.has(id)) issues.push(issue("METER_ID_DUPLICATE", "error", "objektStandard.zaehler[" + index + "]", "Zähler-ID ist doppelt: " + id, id));
      else meterIds.add(id);
      if (row && row.einheitId && !unitIds.has(text(row.einheitId))) issues.push(issue("METER_UNIT_UNKNOWN", "error", "objektStandard.zaehler[" + index + "].einheitId", "Zähler verweist auf eine unbekannte Einheit.", id));
      if (isElectricityDummyMeter(row)) {
        if (row.abrechnungsrelevant !== false || text(row.billingRole) !== "excluded") issues.push(issue("ELECTRICITY_DUMMY_NOT_EXCLUDED", "error", "objektStandard.zaehler[" + index + "]", "Stromzähler-Dummy ist nicht eindeutig aus der Abrechnung ausgeschlossen.", id));
        else issues.push(issue("ELECTRICITY_DUMMY_EXCLUDED", "info", "objektStandard.zaehler[" + index + "]", "Stromzähler-Dummy wird gespeichert, aber nicht abgerechnet.", id));
      }
    });
    const errors = issues.filter(item => item.severity === "error");
    const warnings = issues.filter(item => item.severity === "warning");
    const infos = issues.filter(item => item.severity === "info");
    return { valid:errors.length === 0, errors, warnings, infos, issues };
  }

  function billingRelevantMeters(input) {
    const standard = input && input.objektStandard ? input.objektStandard : input;
    const meters = standard && Array.isArray(standard.zaehler) ? standard.zaehler : [];
    return meters.filter(meter => !isElectricityDummyMeter(meter) && meter.abrechnungsrelevant !== false && text(meter.billingRole) !== "excluded");
  }

  function addElectricityDummyMeter(data, input = {}, options = {}) {
    normalizeObjectStandard(data, options);
    const standard = data.objektStandard;
    const objectId = text(standard.objekt && (standard.objekt.id || standard.objekt.objektId)) || "OBJ-001";
    const buildingId = text(standard.gebaeude && standard.gebaeude[0] && (standard.gebaeude[0].id || standard.gebaeude[0].gebaeudeId)) || "GEB-001";
    const meter = createElectricityDummyMeter(input, { ...options, objectId, buildingId });
    if (!Array.isArray(standard.zaehler)) standard.zaehler = [];
    const existingIndex = standard.zaehler.findIndex(row => text(row && (row.meterId || row.zaehlerId || row.id)) === meter.meterId);
    if (existingIndex >= 0) standard.zaehler[existingIndex] = meter;
    else standard.zaehler.push(meter);
    return meter;
  }

  global.NKProObjectStandard = Object.freeze({
    OBJECT_STANDARD_VERSION,
    OBJECT_STANDARD_ROLE,
    ELECTRICITY_DUMMY_METER_TYPE,
    requiresObjectStandardMigration,
    normalizeObjectStandard,
    validateObjectStandard,
    isElectricityDummyMeter,
    billingRelevantMeters,
    createElectricityDummyMeter,
    addElectricityDummyMeter
  });
})(globalThis);
