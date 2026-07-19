(function(global) {
  "use strict";

  let deps = null;

  function configure(options = {}) {
    if (deps) return describe();
    const objects = ["stateAccess", "archiveActions", "masterDataActions", "costActions", "billingWorkflow"];
    objects.forEach(name => { if (!options[name]) throw new Error("Jahreswechselabhängigkeit fehlt: " + name); });
    const functions = [
      "num", "todayIso", "nowIso", "addDaysIso", "currentYear", "periodDaysExact", "periodStart", "periodEnd",
      "hasTenantData", "isArchivedTenant", "tenantActiveDaysInCurrentPeriod", "hasWaterSettingValue",
      "ensureWaterMeterData", "applyWaterMetersToUmlage", "billableTenantRows", "activePrepaymentCostIds",
      "adjustmentGroupForCost", "tenantDisplayId", "hasEnteredMeterValue", "isArchiveViewer", "createSnapshot"
    ];
    functions.forEach(name => { if (typeof options[name] !== "function") throw new Error("Jahreswechselabhängigkeit fehlt: " + name); });
    if (!options.appVersion) throw new Error("Jahreswechselabhängigkeit fehlt: appVersion");
    deps = Object.freeze({ ...options });
    return describe();
  }

  function requireDeps() {
    if (!deps) throw new Error("Jahreswechselaktionen wurden noch nicht konfiguriert.");
    return deps;
  }

  function current() { return requireDeps().stateAccess.current(); }
  function yearNumber(value) { return requireDeps().archiveActions.yearNumber(value); }

  function normalizeIsoDateValue(value, fallbackYear) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const german = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
    if (german) {
      let year = german[3];
      if (year.length === 2) year = String(2000 + parseInt(year, 10));
      return year + "-" + String(german[2]).padStart(2, "0") + "-" + String(german[1]).padStart(2, "0");
    }
    const yearMonth = raw.match(/^(\d{4})-(\d{1,2})$/);
    if (yearMonth) return yearMonth[1] + "-" + String(yearMonth[2]).padStart(2, "0") + "-01";
    if (fallbackYear && /^(\d{1,2})\.(\d{1,2})\.$/.test(raw)) {
      const partial = raw.match(/^(\d{1,2})\.(\d{1,2})\.$/);
      return String(fallbackYear) + "-" + String(partial[2]).padStart(2, "0") + "-" + String(partial[1]).padStart(2, "0");
    }
    return "";
  }

  function periodDateStartForData(data) {
    const itemMeta = data && data.meta ? data.meta : {};
    const year = yearNumber(itemMeta.abrechnungsjahr || requireDeps().currentYear());
    return normalizeIsoDateValue(itemMeta.abrechnungsbeginn, year) || (String(year) + "-01-01");
  }

  function periodDateEndForData(data) {
    const itemMeta = data && data.meta ? data.meta : {};
    const year = yearNumber(itemMeta.abrechnungsjahr || requireDeps().currentYear());
    return normalizeIsoDateValue(itemMeta.abrechnungsende, year) || (String(year) + "-12-31");
  }

  function monthStartIso(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-01";
  }

  function activeMonthStartsForData(data, tenant) {
    const startIso = periodDateStartForData(data);
    const endIso = periodDateEndForData(data);
    const periodStartDate = new Date(startIso + "T00:00:00");
    const periodEndDate = new Date(endIso + "T00:00:00");
    if (Number.isNaN(periodStartDate.getTime()) || Number.isNaN(periodEndDate.getTime()) || periodStartDate > periodEndDate) return [];
    let activeStart = new Date(periodStartDate.getTime());
    let activeEnd = new Date(periodEndDate.getTime());
    const tenantStartIso = normalizeIsoDateValue(tenant && tenant.einzug, periodStartDate.getFullYear());
    const tenantEndIso = normalizeIsoDateValue(tenant && tenant.auszug, periodEndDate.getFullYear());
    if (tenantStartIso) {
      const date = new Date(tenantStartIso + "T00:00:00");
      if (!Number.isNaN(date.getTime()) && date > activeStart) activeStart = date;
    }
    if (tenantEndIso) {
      const date = new Date(tenantEndIso + "T00:00:00");
      if (!Number.isNaN(date.getTime()) && date < activeEnd) activeEnd = date;
    }
    if (activeStart > activeEnd) return [];
    const months = [];
    let cursor = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth(), 1);
    const last = new Date(periodEndDate.getFullYear(), periodEndDate.getMonth(), 1);
    while (cursor <= last) {
      const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      if (monthEnd >= activeStart && monthStart <= activeEnd) months.push(monthStartIso(monthStart));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return months;
  }

  function monthTotalForCarryForward(oldAnnual, previousData, previousTenant, currentData, currentTenant, effectiveIso, monthlyChange) {
    const d = requireDeps();
    const oldMonths = activeMonthStartsForData(previousData, previousTenant);
    const currentMonths = activeMonthStartsForData(currentData, currentTenant);
    const oldMonthCount = Math.max(1, oldMonths.length || 12);
    const currentMonthCount = Math.max(1, currentMonths.length || 12);
    const oldMonthly = d.num(oldAnnual) / oldMonthCount;
    const change = d.num(monthlyChange);
    if (!effectiveIso || Math.abs(change) < 0.005) return oldMonthly * currentMonthCount;
    const newMonthly = Math.max(0, oldMonthly + change);
    const effectiveMonth = effectiveIso.slice(0, 7) + "-01";
    const total = currentMonths.reduce((sum, monthIso) => sum + (monthIso >= effectiveMonth ? newMonthly : oldMonthly), 0);
    return total || (newMonthly * currentMonthCount);
  }

  function previousYearArchiveData(data = current()) {
    const d = requireDeps();
    const currentYear = yearNumber(data && data.meta && data.meta.abrechnungsjahr || d.currentYear());
    const previousYear = currentYear - 1;
    const candidates = (Array.isArray(data && data.jahresArchiv) ? data.jahresArchiv : []).filter(item => yearNumber(item && (item.year || (item.meta && item.meta.abrechnungsjahr))) === previousYear);
    if (!candidates.length) return null;
    const item = candidates.slice().sort((a, b) => String(b.archivedAt || (b.meta && b.meta.archivedAt) || "").localeCompare(String(a.archivedAt || (a.meta && a.meta.archivedAt) || "")))[0];
    try {
      const prepared = d.archiveActions.prepareItem(item);
      return prepared && prepared.data ? Object.freeze({ item:prepared, data:prepared.data, year:previousYear }) : null;
    } catch(error) {
      return null;
    }
  }

  function normalizedIdentityText(value) {
    return String(value || "").trim().toLocaleLowerCase("de-DE").replace(/[^a-z0-9äöüß]+/g, "");
  }

  function unitLabel(unit) {
    return String(unit && (unit.bezeichnung || unit.lage || unit.name || unit.id || unit.einheitId) || "");
  }

  // Historische Archive bis einschließlich AP22F10E speichern Wasserwerte teilweise
  // wohnungsweise in waterMeters.readings statt als Zählerstamm/Messperiode.
  function legacyPriorReadingForRow(previousData, currentData, row) {
    const container = previousData && previousData.waterMeters;
    const readings = container && Array.isArray(container.readings) ? container.readings : [];
    if (!readings.length) return null;
    const previousUnits = Array.isArray(previousData.wohnungen) ? previousData.wohnungen : [];
    const currentUnits = Array.isArray(currentData && currentData.wohnungen) ? currentData.wohnungen : [];
    const currentUnit = currentUnits.find(unit => String(unit && (unit.id || unit.einheitId) || "") === String(row.unitId || ""));
    const currentLabel = normalizedIdentityText(unitLabel(currentUnit) || row.caseLabel);
    let index = previousUnits.findIndex(unit => String(unit && (unit.id || unit.einheitId) || "") === String(row.unitId || ""));
    if (index < 0 && currentLabel) {
      const labelMatches = previousUnits.map((unit, i) => ({ unit, i })).filter(item => normalizedIdentityText(unitLabel(item.unit)) === currentLabel);
      if (labelMatches.length === 1) index = labelMatches[0].i;
    }
    if (index < 0 || index >= readings.length) return null;
    const reading = readings[index] || {};
    const hot = String(row.meterType || "") === "hot-water";
    const value = hot ? reading.wwEnd : reading.kwEnd;
    const date = hot ? reading.wwEndDate : reading.kwEndDate;
    if (value === "" || value === null || value === undefined || !Number.isFinite(Number(value))) return null;
    return { endValue:Number(value), endDate:String(date || ""), method:"legacy-unit-type", sourceLabel:unitLabel(previousUnits[index]) };
  }


  // Fallback für Altbestände: Die historische Wasserzählerreihe liegt im
  // Arbeitszustand unter waterMeterHistory und nicht zwingend in einem Jahresarchiv.
  function rootHistoryPriorReadingForRow(data, row, previousYear) {
    const history = data && data.waterMeterHistory;
    const units = history && Array.isArray(history.units) ? history.units : [];
    if (!units.length) return null;
    const currentUnits = Array.isArray(data && data.wohnungen) ? data.wohnungen : [];
    const currentUnit = currentUnits.find(unit => String(unit && (unit.id || unit.einheitId) || "") === String(row.unitId || ""));
    const currentLabel = normalizedIdentityText(unitLabel(currentUnit) || row.caseLabel);
    let matches = units.filter(unit => String(unit && (unit.wohnung || unit.id || unit.einheitId) || "") === String(row.unitId || ""));
    if (!matches.length && currentLabel) matches = units.filter(unit => normalizedIdentityText(unitLabel(unit)) === currentLabel);
    if (matches.length !== 1) return null;
    const readings = Array.isArray(matches[0].readings) ? matches[0].readings : [];
    const reading = readings.find(item => yearNumber(item && item.jahr) === yearNumber(previousYear));
    if (!reading) return null;
    const hot = String(row.meterType || "") === "hot-water";
    const value = hot ? reading.ww : reading.kw;
    if (value === "" || value === null || value === undefined || !Number.isFinite(Number(value))) return null;
    return { endValue:Number(value), endDate:String(previousYear) + "-12-31", method:"root-history-unit-type", sourceLabel:unitLabel(matches[0]) };
  }

  // Sichere Vorbereitung der Vorjahresübernahme. Reihenfolge:
  // 1. stabile Zähler-ID, 2. Zählernummer + Wohnung + Art,
  // 3. historisches wohnungsbezogenes Archivformat + Zählerart.
  function prepareIndividualPriorReadingTransfer(data = current()) {
    const calculation = global.NKProBillingCalculation;
    const currentRows = calculation && typeof calculation.waterMeterRows === "function" ? calculation.waterMeterRows(data) : [];
    const currentYear = yearNumber(data && data.meta && data.meta.abrechnungsjahr || requireDeps().currentYear());
    const previousYear = currentYear - 1;
    const source = previousYearArchiveData(data);
    let previousData = source && source.data ? source.data : null;
    if (previousData) {
      try {
        previousData = JSON.parse(JSON.stringify(source.data));
        if (global.NKProMeterValidation && typeof global.NKProMeterValidation.synchronizeMeteringData === "function") global.NKProMeterValidation.synchronizeMeteringData(previousData);
      } catch (_) { previousData = source.data; }
    }
    const previousRows = previousData && calculation && typeof calculation.waterMeterRows === "function" ? calculation.waterMeterRows(previousData) : [];
    const audit = data && data.meta && Array.isArray(data.meta.individualValuesPriorTransfers) ? data.meta.individualValuesPriorTransfers : [];
    const candidates = currentRows.map(row => {
      const exact = previousRows.filter(previous => previous.meterId === row.meterId);
      const fallback = previousRows.filter(previous => previous.meterNumber === row.meterNumber && previous.unitId === row.unitId && previous.meterType === row.meterType);
      let matches = exact.length ? exact : fallback;
      let previous = matches.length === 1 ? matches[0] : null;
      let matchMethod = exact.length === 1 ? "stable-meter-id" : (fallback.length === 1 ? "meter-number-unit-type" : "");
      if (!previous && !matches.length && previousData) {
        const legacy = legacyPriorReadingForRow(previousData, data, row);
        if (legacy) {
          previous = { endValue:legacy.endValue, endDate:legacy.endDate, unitId:row.unitId, meterType:row.meterType };
          matches = [previous];
          matchMethod = legacy.method;
        }
      }
      if (!previous && !matches.length) {
        const historical = rootHistoryPriorReadingForRow(data, row, previousYear);
        if (historical) {
          previous = { endValue:historical.endValue, endDate:historical.endDate, unitId:row.unitId, meterType:row.meterType };
          matches = [previous];
          matchMethod = historical.method;
        }
      }
      const sourceYear = source && source.year ? source.year : previousYear;
      const hasCurrentStart = row.startValue !== "" && row.startValue !== null && row.startValue !== undefined;
      const alreadyTransferred = hasCurrentStart && audit.some(entry => String(entry && entry.meterId || "") === row.meterId && String(entry && entry.sourceYear || "") === String(sourceYear || ""));
      let status = "ready", reason = matchMethod === "stable-meter-id" ? "Stabile Zähler-ID stimmt mit der Vorperiode überein." : (matchMethod === "meter-number-unit-type" ? "Über Zählernummer, Wohnung und Zählerart eindeutig zugeordnet." : (matchMethod === "root-history-unit-type" ? "Über die gespeicherte Wasserzählerhistorie und Zählerart eindeutig zugeordnet." : "Über historischen Wohnungsdatensatz und Zählerart eindeutig zugeordnet."));
      if (row.replacement) { status = "replacement"; reason = "Zählerwechsel muss separat bestätigt werden."; }
      else if (alreadyTransferred) { status = "already-transferred"; reason = "Die Übernahme wurde für diesen Zähler bereits bestätigt dokumentiert."; }
      else if (!matches.length) { status = "missing-prior-value"; reason = "Kein eindeutiger Vorjahreswert gefunden."; }
      else if (matches.length > 1) { status = "ambiguous"; reason = "Mehrere Vorjahreszähler passen zur aktuellen Identität."; }
      else if (previous && (previous.unitId !== row.unitId || previous.meterType !== row.meterType)) { status = "assignment-changed"; reason = "Zählerart oder Wohnungszuordnung weicht vom Vorjahr ab."; }
      else if (row.startValue !== "" && row.startValue !== null && row.startValue !== undefined) { status = "already-set"; reason = "Ein Anfangsstand ist bereits vorhanden."; }
      const previousEnd = previous && previous.endValue !== "" && previous.endValue !== null && previous.endValue !== undefined ? Number(previous.endValue) : "";
      if (status === "ready" && previousEnd === "") { status = "missing-prior-value"; reason = "Der Vorjahresendstand fehlt."; }
      const eligible = status === "ready";
      return Object.freeze({
        meterId:row.meterId, meterNumber:row.meterNumber, meterType:row.meterType, caseKey:row.caseKey,
        caseLabel:[row.unitId, row.caseLabel].filter(Boolean).join(" · "), currentStart:row.startValue,
        previousEnd, previousDate:previous && previous.endDate || "", sourceYear:String(sourceYear || ""), matchMethod,
        status, eligible, selected:eligible, reason
      });
    });
    return Object.freeze({ sourceYear:String(source && source.year || previousYear || ""), candidates:Object.freeze(candidates) });
  }

  // Eindeutige Vorwerte werden bei der Datenaufbereitung automatisch übernommen.
  // Manuelle Anfangsstände, Zählerwechsel und mehrdeutige Fälle bleiben unangetastet.
  function ensureIndividualPriorReadingTransfer(data = current()) {
    const plan = prepareIndividualPriorReadingTransfer(data);
    const selected = plan.candidates.filter(row => row.eligible);
    if (!selected.length) return Object.freeze({ changed:false, copied:0, sourceYear:plan.sourceYear, candidates:plan.candidates.length });
    const periods = data && data.zaehlerDaten && Array.isArray(data.zaehlerDaten.messperioden) ? data.zaehlerDaten.messperioden : [];
    const periodStart = periodDateStartForData(data);
    const records = [];
    selected.forEach(row => {
      const periodEnd = periodDateEndForData(data);
      const meterPeriods = periods.filter(period => String(period && (period.zaehlerId || period.meterId) || "") === String(row.meterId || "") && (!period.beginn || !period.ende || (String(period.beginn) <= periodEnd && String(period.ende) >= periodStart))).sort((a,b) => String(a.beginn || "").localeCompare(String(b.beginn || "")));
      const target = meterPeriods[0];
      if (!target) return;
      target.anfangsstand = Number(row.previousEnd);
      if (!target.beginn) target.beginn = periodStart;
      records.push({ meterId:String(row.meterId), previousEnd:Number(row.previousEnd), previousDate:String(row.previousDate || ""), caseKey:String(row.caseKey || ""), sourceYear:String(plan.sourceYear || ""), confirmedAt:new Date().toISOString(), confirmation:"Automatisch-eindeutig", method:String(row.matchMethod || "stable-meter-id") });
    });
    if (!records.length) return Object.freeze({ changed:false, copied:0, sourceYear:plan.sourceYear, candidates:plan.candidates.length });
    if (!data.meta) data.meta = {};
    if (!Array.isArray(data.meta.individualValuesPriorTransfers)) data.meta.individualValuesPriorTransfers = [];
    data.meta.individualValuesPriorTransfers.push(...records);
    return Object.freeze({ changed:true, copied:records.length, sourceYear:plan.sourceYear, candidates:plan.candidates.length });
  }

  function recordIndividualPriorReadingTransfer(records, sourceYear) {
    const d = requireDeps();
    const normalized = (Array.isArray(records) ? records : []).filter(row => row && row.meterId).map(row => ({
      meterId:String(row.meterId), previousEnd:d.num(row.previousEnd), previousDate:String(row.previousDate || ""),
      caseKey:String(row.caseKey || ""), sourceYear:String(sourceYear || row.sourceYear || ""),
      confirmedAt:d.nowIso(), confirmation:"Benutzerbestätigt", method:"stable-meter-id"
    }));
    if (!normalized.length) return Object.freeze({ changed:false, recorded:0 });
    return d.stateAccess.transact(data => {
      if (!data.meta) data.meta = {};
      if (!Array.isArray(data.meta.individualValuesPriorTransfers)) data.meta.individualValuesPriorTransfers = [];
      data.meta.individualValuesPriorTransfers.push(...normalized);
      return Object.freeze({ changed:true, recorded:normalized.length });
    }, { reason:"Vorjahresendstände bestätigt übernommen", tabId:"manuellewerte" });
  }

  function previousTenantRoleIsPrivate(tenant) {
    const role = String(tenant && (tenant.abrechnungRolle || tenant.rolle || "") || "").toLocaleLowerCase("de-DE");
    return role.includes("eigent") || role.includes("privat");
  }

  function normalizeTenantMatchText(value) {
    return String(value || "").trim().toLocaleLowerCase("de-DE").replace(/\s+/g, " ");
  }

  function findPreviousTenantIndex(previousTenants, currentTenant) {
    const d = requireDeps();
    const rows = (Array.isArray(previousTenants) ? previousTenants : []).map((tenant, index) => ({ ...tenant, originalIndex:index })).filter(tenant => d.hasTenantData(tenant) && !previousTenantRoleIsPrivate(tenant));
    if (!currentTenant || !rows.length) return -1;
    const id = String(currentTenant.id || "").trim();
    if (id) {
      const byId = rows.find(tenant => String(tenant.id || "").trim() === id);
      if (byId) return byId.originalIndex;
    }
    const name = normalizeTenantMatchText(currentTenant.name);
    const unit = String(currentTenant.wohnung || "").trim();
    if (name && unit) {
      const byNameAndUnit = rows.find(tenant => normalizeTenantMatchText(tenant.name) === name && String(tenant.wohnung || "").trim() === unit);
      if (byNameAndUnit) return byNameAndUnit.originalIndex;
    }
    if (name) {
      const sameName = rows.filter(tenant => normalizeTenantMatchText(tenant.name) === name);
      if (sameName.length === 1) return sameName[0].originalIndex;
    }
    return -1;
  }

  function prepaymentAdjustmentWasPrinted(previousData) {
    const brief = previousData && previousData.briefSettings ? previousData.briefSettings : {};
    const settings = previousData && previousData.prepaymentAdjustmentSettings ? previousData.prepaymentAdjustmentSettings : {};
    return brief.showVorauszahlungPage === "Ja" || brief.vorauszahlungPrintMode === "Berechnete Werte drucken" || brief.vorauszahlungPrintMode === "Manuelle Werte drucken" || (settings.letterPrintMode && settings.letterPrintMode !== "Nicht drucken");
  }

  function effectivePrepaymentIso(previousData, data = current()) {
    const currentYear = yearNumber(data && data.meta && data.meta.abrechnungsjahr || requireDeps().currentYear());
    const brief = previousData && previousData.briefSettings ? previousData.briefSettings : {};
    const settings = previousData && previousData.prepaymentAdjustmentSettings ? previousData.prepaymentAdjustmentSettings : {};
    return normalizeIsoDateValue(settings.effectiveFrom || brief.vorauszahlungAb, currentYear);
  }

  function activePrepaymentMatrixHasValues(data = current()) {
    const d = requireDeps();
    d.costActions.syncVorauszahlungen(data);
    const visibleRows = d.billableTenantRows();
    const activeIds = new Set(d.activePrepaymentCostIds());
    return (Array.isArray(data.vorauszahlungen) ? data.vorauszahlungen : [])
      .filter(row => activeIds.has(row.kostenId) && row.aktiv === "Ja")
      .some(row => visibleRows.some(tenant => Math.abs(d.num(row.werte && row.werte[tenant.originalIndex])) > 0.005));
  }

  function carryForwardPrepayments(data = current()) {
    const d = requireDeps();
    if (!data.meta) data.meta = {};
    d.costActions.syncVorauszahlungen(data);
    const info = { sourceYear:"", copied:0, adjusted:0, warnings:[], details:[] };
    const source = previousYearArchiveData(data);
    if (!source || !source.data) {
      data.meta.prepaymentCarryForward = { sourceYear:"", copied:0, adjusted:0, warnings:["Keine Vorjahresabrechnung gefunden; NK-Vorauszahlungen wurden nicht automatisch übernommen."], details:[] };
      return data.meta.prepaymentCarryForward;
    }
    const previousData = source.data;
    info.sourceYear = String(source.year);
    const previousTenants = Array.isArray(previousData.mieter) ? previousData.mieter : [];
    const previousPrepayments = Array.isArray(previousData.vorauszahlungen) ? previousData.vorauszahlungen : [];
    const currentRows = d.billableTenantRows();
    const applyAdjustment = prepaymentAdjustmentWasPrinted(previousData);
    const effectiveIso = effectivePrepaymentIso(previousData, data);
    const previousPeriodDays = Math.max(1, Math.round((new Date(periodDateEndForData(previousData) + "T00:00:00") - new Date(periodDateStartForData(previousData) + "T00:00:00")) / 86400000) + 1);
    const currentPeriodDays = d.periodDaysExact();
    if (Math.abs(previousPeriodDays - currentPeriodDays) > 1) info.warnings.push("Abrechnungsperiode Vorjahr (" + previousPeriodDays + " Tage) weicht von aktueller Periode (" + currentPeriodDays + " Tage) ab.");

    data.vorauszahlungen.forEach(row => {
      const previousRow = previousPrepayments.find(entry => entry && entry.kostenId === row.kostenId);
      if (!previousRow || !Array.isArray(previousRow.werte)) return;
      const currentCost = (Array.isArray(data.kostenarten) ? data.kostenarten : []).find(cost => cost.id === row.kostenId) || { id:row.kostenId, kostenart:row.kostenart };
      const group = d.adjustmentGroupForCost(currentCost);
      currentRows.forEach(tenant => {
        const previousIndex = findPreviousTenantIndex(previousTenants, tenant);
        if (previousIndex < 0) return;
        const previousTenant = previousTenants[previousIndex];
        const oldAnnual = d.num(previousRow.werte[previousIndex]);
        const previousMonths = activeMonthStartsForData(previousData, previousTenant);
        const currentMonths = activeMonthStartsForData(data, tenant);
        if (!previousMonths.length || !currentMonths.length) return;
        let change = 0;
        if (applyAdjustment && previousTenant && previousTenant[group.changeKey] !== undefined && previousTenant[group.changeKey] !== null && String(previousTenant[group.changeKey]).trim() !== "") change = d.num(previousTenant[group.changeKey]);
        const projected = monthTotalForCarryForward(oldAnnual, previousData, previousTenant, data, tenant, effectiveIso, change);
        row.werte[tenant.originalIndex] = Math.round(projected * 100) / 100;
        info.copied += 1;
        if (Math.abs(change) > 0.005) info.adjusted += 1;
        if (previousMonths.length !== currentMonths.length) info.warnings.push((d.tenantDisplayId(tenant) || tenant.id || "Mieter") + " · " + (tenant.name || "") + ": Vorjahr " + previousMonths.length + " Monat(e), aktuell " + currentMonths.length + " Monat(e); Vorauszahlung wurde hoch-/runtergerechnet.");
        info.details.push({ tenantId:tenant.id, kostenId:row.kostenId, oldAnnual, newAnnual:row.werte[tenant.originalIndex], previousMonths:previousMonths.length, currentMonths:currentMonths.length, adjusted:Math.abs(change) > 0.005 });
      });
      row.summe = Array.isArray(row.werte) ? row.werte.reduce((sum, value) => sum + d.num(value), 0) : 0;
    });
    info.warnings = Array.from(new Set(info.warnings));
    info.appliedForYear = String(data.meta.abrechnungsjahr || d.currentYear());
    info.appliedAt = d.nowIso();
    data.meta.prepaymentCarryForward = info;
    d.costActions.updateTenantPrepaymentTotals(data);
    return info;
  }

  function ensurePrepaymentCarryForward(data = current()) {
    const d = requireDeps();
    if (!data.meta) data.meta = {};
    d.costActions.syncVorauszahlungen(data);
    const year = String(data.meta.abrechnungsjahr || d.currentYear());
    const alreadyApplied = data.meta.prepaymentCarryForward && data.meta.prepaymentCarryForward.appliedForYear === year && d.num(data.meta.prepaymentCarryForward.copied) > 0;
    if (alreadyApplied || activePrepaymentMatrixHasValues(data)) return data.meta.prepaymentCarryForward || null;
    const source = previousYearArchiveData(data);
    if (!source || !source.data) return data.meta.prepaymentCarryForward || null;
    const info = carryForwardPrepayments(data);
    if (info && d.num(info.copied) > 0) {
      data.meta.prepaymentCarryForwardRecovered = true;
      data.meta.prepaymentCarryForwardRecoveredAt = d.nowIso();
    }
    return info;
  }

  function carryMeterEndToStart(data = current(), snapshot = null) {
    const d = requireDeps();
    d.ensureWaterMeterData();
    const startDate = d.periodStart() || (String(data.meta && data.meta.abrechnungsjahr || d.currentYear()) + "-01-01");
    const endDate = d.periodEnd() || (String(data.meta && data.meta.abrechnungsjahr || d.currentYear()) + "-12-31");
    const count = Math.max(20, Array.isArray(data.mieter) ? data.mieter.length : 0);
    if (!data.waterMeters) data.waterMeters = { settings:{}, readings:[] };
    data.waterMeters.readings = Array(count).fill(null).map(() => ({
      kwStart:"", kwStartDate:startDate, kwEnd:"", kwEndDate:endDate,
      wwStart:"", wwStartDate:startDate, wwEnd:"", wwEndDate:endDate, bemerkung:""
    }));
    if (!data.meterReadings) data.meterReadings = { readings:{} };
    if (!data.meterReadings.readings) data.meterReadings.readings = {};
    Object.keys(data.meterReadings.readings).forEach(costId => {
      data.meterReadings.readings[costId] = Array(count).fill(null).map(() => ({ start:"", startDate, end:"", endDate, bemerkung:"" }));
    });
    if (!data.meta) data.meta = {};
    data.meta.meterCarryForwardWarnings = ["Vorjahresendstände wurden nicht automatisch übernommen. Die erstmalige Übernahme muss auf „Individuelle Werte“ bestätigt werden."];
    data.meta.individualValuesPriorTransferPending = true;
    data.meta.individualValuesPriorTransferRequestedForYear = String(data.meta.abrechnungsjahr || d.currentYear());
    return data.meta.meterCarryForwardWarnings;
  }

  function periodStartForData(data) {
    const itemMeta = data && data.meta ? data.meta : {};
    const year = String(itemMeta.abrechnungsjahr || "").trim();
    return itemMeta.abrechnungsbeginn || (year ? year + "-01-01" : "");
  }

  function periodEndForData(data) {
    const itemMeta = data && data.meta ? data.meta : {};
    const year = String(itemMeta.abrechnungsjahr || "").trim();
    return itemMeta.abrechnungsende || (year ? year + "-12-31" : "");
  }

  function numericMeterValueEquals(a, b) {
    const d = requireDeps();
    if (a === "" || a === null || a === undefined) return false;
    return Math.abs(d.num(a) - d.num(b)) < 0.000001;
  }

  function isNewCurrentBillingData(data) {
    const itemMeta = data && data.meta ? data.meta : {};
    if (!data || itemMeta.currentBillingArchivedOnly || itemMeta.currentBillingClosedAfterArchive || itemMeta.legacyArchivHinweis || itemMeta.archiveViewer) return false;
    const year = parseInt(String(itemMeta.abrechnungsjahr || ""), 10);
    return Number.isFinite(year) && year > 2024;
  }

  function numericEndValuesWereManuallyTouchedForYear(data, year) {
    const itemMeta = data && data.meta ? data.meta : {};
    return String(itemMeta.meterNumericEndValuesTouchedForYear || "") === String(year || "");
  }

  function clearAutofilledMeterEndValues(data = current(), options = {}) {
    const d = requireDeps();
    if (!data || typeof data !== "object") return 0;
    if (!options.force) {
      if (data.meta && data.meta.archiveViewer) return 0;
      if (!isNewCurrentBillingData(data)) return 0;
      const year = String((data.meta && data.meta.abrechnungsjahr) || "");
      if (numericEndValuesWereManuallyTouchedForYear(data, year)) return 0;
    }
    const startDate = periodStartForData(data);
    const endDate = periodEndForData(data);
    let cleared = 0;
    const force = !!options.force;
    const readings = data.waterMeters && Array.isArray(data.waterMeters.readings) ? data.waterMeters.readings : [];
    readings.forEach(row => {
      if (!row) return;
      if (startDate) {
        if (row.kwStartDate === undefined || row.kwStartDate === "" || force) row.kwStartDate = startDate;
        if (row.wwStartDate === undefined || row.wwStartDate === "" || force) row.wwStartDate = startDate;
      }
      if (endDate) {
        if (row.kwEndDate === undefined || row.kwEndDate === "" || force) row.kwEndDate = endDate;
        if (row.wwEndDate === undefined || row.wwEndDate === "" || force) row.wwEndDate = endDate;
      }
      if (force || numericMeterValueEquals(row.kwEnd, row.kwStart)) { if (row.kwEnd !== "") cleared += 1; row.kwEnd = ""; }
      if (force || numericMeterValueEquals(row.wwEnd, row.wwStart)) { if (row.wwEnd !== "") cleared += 1; row.wwEnd = ""; }
    });
    const allReadings = data.meterReadings && data.meterReadings.readings && typeof data.meterReadings.readings === "object" ? data.meterReadings.readings : {};
    Object.keys(allReadings).forEach(costId => {
      const rows = Array.isArray(allReadings[costId]) ? allReadings[costId] : [];
      rows.forEach(row => {
        if (!row) return;
        if (startDate && (row.startDate === undefined || row.startDate === "" || force)) row.startDate = startDate;
        if (endDate && (row.endDate === undefined || row.endDate === "" || force)) row.endDate = endDate;
        if (force || numericMeterValueEquals(row.end, row.start)) { if (row.end !== "") cleared += 1; row.end = ""; }
      });
    });
    if (cleared && data.meta) {
      data.meta.meterEndValuesClearedForYear = String(data.meta.abrechnungsjahr || "");
      data.meta.meterEndValuesClearedWithAppVersion = d.appVersion;
      if (options.repairExistingNewBilling) data.meta.meterEndValuesAutofillRepairAppliedAt = d.nowIso();
    }
    return cleared;
  }

  function markCurrentBillingCreatedByUser(data = current()) {
    const d = requireDeps();
    if (!data.meta) data.meta = {};
    d.archiveActions.clearClosure(data);
    data.meta.currentBillingCreatedByUser = true;
    data.meta.currentBillingCreatedAt = data.meta.currentBillingCreatedAt || d.nowIso();
    data.meta.currentBillingCreatedWithAppVersion = d.appVersion;
    return data;
  }

  function resetAnnualValues(data, nextYear, startIso, endIso) {
    const d = requireDeps();
    const previousMeterSnapshot = d.masterDataActions.captureMeterReadingsSnapshot(data);
    if (!data.meta) data.meta = {};
    data.meta.abrechnungsjahr = String(nextYear);
    data.meta.abrechnungsbeginn = startIso || (String(nextYear) + "-01-01");
    data.meta.abrechnungsende = endIso || (String(nextYear) + "-12-31");
    if (data.briefSettings) {
      data.briefSettings.abrechnungsjahr = String(nextYear);
      data.briefSettings.briefdatum = d.todayIso();
      data.briefSettings.zahlungsziel = d.addDaysIso(d.todayIso(), 14);
    }
    d.masterDataActions.applyStammdatenToCurrentBilling(data);
    (Array.isArray(data.kostenarten) ? data.kostenarten : []).forEach(cost => {
      if (cost.kostenart && cost.inNK === "Ja") {
        cost.gesamtbetrag = 0;
        if (cost.umlageschluessel === "Verbrauch") cost.preisProEinheit = "";
        cost.status = d.costActions.kostenStatus(cost);
      }
    });
    const periodDays = d.periodDaysExact();
    (Array.isArray(data.mieter) ? data.mieter : []).forEach(tenant => {
      if (!d.hasTenantData(tenant) || d.isArchivedTenant(tenant)) return;
      tenant.kaltErhalten = 0;
      tenant.nkVoraus = 0;
      tenant.vorjahresKorrektur = 0;
      tenant.kaltmietKorrektur = 0;
      tenant.wasserWeitereVorauszahlung = 0;
      tenant.einnahmen = 0;
      const activeDays = d.tenantActiveDaysInCurrentPeriod(tenant) || periodDays;
      tenant.aktiveTage = activeDays;
      tenant.personentage = d.num(tenant.personen) * activeDays;
    });
    if (Array.isArray(data.vorauszahlungen)) data.vorauszahlungen.forEach(row => { if (Array.isArray(row.werte)) row.werte = row.werte.map(() => 0); row.summe = 0; });
    delete data.meta.prepaymentCarryForward;
    delete data.meta.prepaymentCarryForwardRecovered;
    delete data.meta.prepaymentCarryForwardRecoveredAt;
    if (data.umlageInputs) Object.keys(data.umlageInputs).forEach(costId => { const input = data.umlageInputs[costId]; if (input && Array.isArray(input.values)) input.values = input.values.map(() => 0); });
    data.kostenartenMieterUmlage = {};
    if (data.waterMeters && data.waterMeters.settings) {
      const settings = data.waterMeters.settings;
      settings.enabled = "Ja";
      settings.houseMeterStart = d.hasWaterSettingValue(settings.houseMeterEnd) ? settings.houseMeterEnd : "";
      settings.houseMeterStartDate = data.meta.abrechnungsbeginn;
      settings.houseMeterEnd = "";
      settings.houseMeterEndDate = data.meta.abrechnungsende;
      settings.houseWaterTotal = 0;
      settings.houseInvoiceNote = "";
    }
    carryMeterEndToStart(data, previousMeterSnapshot);
    clearAutofilledMeterEndValues(data, { force:true });
    data.meta.meterCarryForwardAppliedForYear = String(data.meta.abrechnungsjahr || nextYear);
    data.meta.meterEndValuesClearedForYear = String(data.meta.abrechnungsjahr || nextYear);
    d.costActions.syncVorauszahlungen(data);
    carryForwardPrepayments(data);
    d.billingWorkflow.syncUmlageInputs(data);
    d.costActions.syncKostenartenMieterUmlage(data);
    d.applyWaterMetersToUmlage();
    d.costActions.updateTenantPrepaymentTotals(data);
    return data;
  }

  function yearExistsInRecords(data, year) {
    const target = yearNumber(year);
    if (requireDeps().archiveActions.hasActiveCurrentBilling(data) && yearNumber(data && data.meta && data.meta.abrechnungsjahr) === target) return true;
    return (Array.isArray(data && data.jahresArchiv) ? data.jahresArchiv : []).some(item => yearNumber(item && (item.year || (item.meta && item.meta.abrechnungsjahr))) === target);
  }

  function createBilling(newYear, start, end, options = {}) {
    const d = requireDeps();
    const normalizedYear = String(newYear || "").trim();
    const normalizedStart = String(start || "").trim();
    const normalizedEnd = String(end || "").trim();
    if (d.isArchiveViewer()) return Object.freeze({ changed:false, reason:"archive-viewer", message:"Dieses Fenster zeigt eine archivierte Abrechnung. Neue Abrechnungen legst du im ursprünglichen Arbeitsfenster an." });
    if (!/^\d{4}$/.test(normalizedYear)) return Object.freeze({ changed:false, reason:"invalid-year", message:"Bitte ein gültiges vierstelliges Abrechnungsjahr eingeben." });
    if (!normalizedStart || !normalizedEnd) return Object.freeze({ changed:false, reason:"missing-period", message:"Bitte Beginn und Ende der Abrechnungsperiode eingeben." });
    if (normalizedStart > normalizedEnd) return Object.freeze({ changed:false, reason:"invalid-period", message:"Der Beginn der Abrechnungsperiode darf nicht nach dem Ende liegen." });
    const data = current();
    if (yearExistsInRecords(data, normalizedYear)) return Object.freeze({ changed:false, reason:"duplicate-year", message:"Für das Abrechnungsjahr " + normalizedYear + " existiert bereits ein Datensatz. Bitte wähle ein anderes Jahr." });
    const currentYear = String(data && data.meta && data.meta.abrechnungsjahr || d.currentYear());
    const hasCurrent = d.archiveActions.hasActiveCurrentBilling(data);
    if (options.confirmed !== true) {
      return Object.freeze({ changed:false, requiresConfirmation:true, confirmationMessage:hasCurrent
        ? "Der aktuelle Bearbeitungsstand " + currentYear + " wird jetzt als eigener Datensatz gesichert. Anschließend wird die neue Abrechnung " + normalizedYear + " angelegt. Fortfahren?"
        : "Es wird eine neue Abrechnung " + normalizedYear + " angelegt. Es wird kein automatisch vorbereiteter Arbeitsstand archiviert. Fortfahren?" });
    }
    return d.stateAccess.transact(next => {
      if (hasCurrent) {
        const archiveResult = d.archiveActions.upsertInto(next, d.createSnapshot());
        if (!archiveResult.ok) throw new Error(archiveResult.error + (archiveResult.validation ? " " + d.archiveActions.validationMessage(archiveResult.validation) : ""));
      }
      resetAnnualValues(next, normalizedYear, normalizedStart, normalizedEnd);
      next.meta.abrechnungsjahr = normalizedYear;
      next.meta.abrechnungsbeginn = normalizedStart;
      next.meta.abrechnungsende = normalizedEnd;
      if (next.briefSettings) next.briefSettings.abrechnungsjahr = normalizedYear;
      next.meta.preparedFromPreviousYear = true;
      next.meta.preparedFromPreviousYearHinweis = hasCurrent
        ? "Die neue Abrechnung " + normalizedYear + " wurde aus dem vorherigen Bearbeitungsstand vorbereitet. Der vorherige Stand wurde als eigener Datensatz gesichert."
        : "Die neue Abrechnung " + normalizedYear + " wurde bewusst über den Startseiten-Button angelegt. Ein automatisch vorbereiteter Seed-Arbeitsstand wurde nicht archiviert.";
      markCurrentBillingCreatedByUser(next);
      d.billingWorkflow.clearCurrentBillingFinalization(next);
      return Object.freeze({ changed:true, year:normalizedYear, archivedPrevious:hasCurrent, targetTab:"start", message:"Neue Nebenkostenabrechnung " + normalizedYear + " wurde angelegt. Du bleibst auf der Startseite; die Bearbeitung startest du über den Bearbeiten-Button in der Übersicht." });
    }, { reason:"Jahreswechsel", render:false, allowFinalizationWrite:true });
  }

  function prepareNextYear(options = {}) {
    const d = requireDeps();
    if (d.isArchiveViewer()) return Object.freeze({ changed:false, reason:"archive-viewer", message:"Dieses Fenster zeigt eine archivierte Abrechnung. Neue Abrechnungen legst du im ursprünglichen Arbeitsfenster an." });
    const year = String(current().meta && current().meta.abrechnungsjahr || d.currentYear());
    const nextYear = yearNumber(year) + 1;
    if (options.confirmed !== true) return Object.freeze({ changed:false, requiresConfirmation:true, confirmationMessage:"Abrechnungsjahr " + year + " archivieren und das Tool für " + nextYear + " vorbereiten? Dabei werden Jahreswerte zurückgesetzt, Zähler-Endstände als neue Anfangsstände übernommen und neue Zähler-Endwerte leer gelassen." });
    return d.stateAccess.transact(data => {
      const archiveResult = d.archiveActions.upsertInto(data, d.createSnapshot());
      if (!archiveResult.ok) throw new Error(archiveResult.error + (archiveResult.validation ? " " + d.archiveActions.validationMessage(archiveResult.validation) : ""));
      resetAnnualValues(data, nextYear);
      markCurrentBillingCreatedByUser(data);
      d.billingWorkflow.clearCurrentBillingFinalization(data);
      return Object.freeze({ changed:true, archivedYear:year, nextYear:String(nextYear), targetTab:"start", message:"Jahreswechsel abgeschlossen. Archiviert: " + year + ". Neues Abrechnungsjahr: " + nextYear + "." });
    }, { reason:"Jahreswechsel", render:false, allowFinalizationWrite:true });
  }

  function describe() {
    return Object.freeze({
      configured:!!deps,
      actions:Object.freeze(["createBilling", "prepareNextYear"]),
      mutators:Object.freeze(["resetAnnualValues", "carryForwardPrepayments", "carryMeterEndToStart", "clearAutofilledMeterEndValues"]),
      readers:Object.freeze(["previousYearArchiveData", "activeMonthStartsForData", "yearExistsInRecords"])
    });
  }

  global.NKProYearTransitionActions = Object.freeze({
    configure, describe, yearNumber, normalizeIsoDateValue, periodDateStartForData, periodDateEndForData,
    activeMonthStartsForData, monthTotalForCarryForward, previousYearArchiveData, prepareIndividualPriorReadingTransfer, ensureIndividualPriorReadingTransfer, recordIndividualPriorReadingTransfer, findPreviousTenantIndex,
    prepaymentAdjustmentWasPrinted, effectivePrepaymentIso, activePrepaymentMatrixHasValues,
    carryForwardPrepayments, ensurePrepaymentCarryForward, carryMeterEndToStart,
    periodStartForData, periodEndForData, numericMeterValueEquals, isNewCurrentBillingData,
    numericEndValuesWereManuallyTouchedForYear, clearAutofilledMeterEndValues,
    markCurrentBillingCreatedByUser, resetAnnualValues, yearExistsInRecords, createBilling, prepareNextYear
  });
})(globalThis);
