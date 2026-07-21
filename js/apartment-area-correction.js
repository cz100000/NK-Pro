(function(global) {
  "use strict";

  const CORRECTION_ID = "apartment-area-correction-2026-07-21";
  const META_KEY = "apartmentAreaCorrection20260721";
  const AREAS = Object.freeze({
    "W000.UG":65,
    "W001.EG-L":62.5,
    "W002.EG-R":52.5,
    "W003.1OG-L":62.5,
    "W004.1OG-R":52.5,
    "W005.DG-L":52,
    "W006.DG-R":44.5
  });

  function text(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function unitId(row) {
    return text(row && (row.id || row.einheitId || row.abrechnungseinheitId));
  }

  function tenantUnitId(row) {
    return text(row && (row.wohnung || row.einheitId || row.abrechnungseinheitId));
  }

  function knownUnitIds(data) {
    const ids = new Set();
    const collections = [
      data && data.wohnungen,
      data && data.stammdaten && data.stammdaten.wohnungen,
      data && data.objektStandard && data.objektStandard.einheiten
    ];
    collections.forEach(rows => (Array.isArray(rows) ? rows : []).forEach(row => {
      const id = unitId(row);
      if (id) ids.add(id);
    }));
    return ids;
  }

  function matchesTargetObject(data) {
    const ids = knownUnitIds(data);
    return Object.keys(AREAS).every(id => ids.has(id));
  }

  function assignArea(row, id) {
    if (!row || !Object.prototype.hasOwnProperty.call(AREAS, id)) return 0;
    const expected = AREAS[id];
    let changed = 0;
    if (Number(row.wohnflaeche) !== expected) {
      row.wohnflaeche = expected;
      changed += 1;
    }
    if (row.verteilungsgrundlagen && typeof row.verteilungsgrundlagen === "object" && !Array.isArray(row.verteilungsgrundlagen)) {
      if (Number(row.verteilungsgrundlagen.wohnflaeche) !== expected) {
        row.verteilungsgrundlagen.wohnflaeche = expected;
        changed += 1;
      }
    }
    return changed;
  }

  function updateUnitRows(rows) {
    let changed = 0;
    (Array.isArray(rows) ? rows : []).forEach(row => { changed += assignArea(row, unitId(row)); });
    return changed;
  }

  function updateTenantRows(rows) {
    let changed = 0;
    (Array.isArray(rows) ? rows : []).forEach(row => { changed += assignArea(row, tenantUnitId(row)); });
    return changed;
  }

  function apply(data, options = {}) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return Object.freeze({ changed:false, reason:"invalid-data" });
    if (!data.meta || typeof data.meta !== "object" || Array.isArray(data.meta)) data.meta = {};
    if (data.meta[META_KEY] && data.meta[META_KEY].correctionId === CORRECTION_ID) {
      return Object.freeze({ changed:false, alreadyApplied:true, marker:data.meta[META_KEY] });
    }
    if (!matchesTargetObject(data)) return Object.freeze({ changed:false, reason:"different-object" });

    let changedFields = 0;
    changedFields += updateUnitRows(data.wohnungen);
    changedFields += updateTenantRows(data.mieter);
    if (data.stammdaten && typeof data.stammdaten === "object") {
      changedFields += updateUnitRows(data.stammdaten.wohnungen);
      changedFields += updateTenantRows(data.stammdaten.mieter);
    }
    if (data.objektStandard && typeof data.objektStandard === "object") {
      changedFields += updateUnitRows(data.objektStandard.einheiten);
      changedFields += updateTenantRows(data.objektStandard.partner);
      changedFields += updateTenantRows(data.objektStandard.vertraege);
    }

    const now = typeof options.now === "function" ? options.now() : new Date().toISOString();
    data.meta[META_KEY] = {
      correctionId:CORRECTION_ID,
      appliedAt:now,
      appliedWithAppVersion:text(options.appVersion),
      changedFields,
      totalArea:391.5,
      archiveSnapshotsChanged:false,
      pendingPersistence:true
    };
    return Object.freeze({ changed:changedFields > 0, changedFields, marker:data.meta[META_KEY] });
  }

  global.NKProApartmentAreaCorrection = Object.freeze({
    CORRECTION_ID,
    META_KEY,
    AREAS,
    apply,
    matchesTargetObject
  });
})(globalThis);
