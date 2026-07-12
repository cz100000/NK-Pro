(function(global) {
  "use strict";

  // Abrechnungs- und Berechnungsfachlogik ohne DOM-Zugriffe.
  // app.js behält nur kleine globale Kompatibilitätsweiterleitungen.

  function costExclusionHandling(k) {
    normalizeCostSettings(k);
    return k && k.ausschlussBehandlung ? k.ausschlussBehandlung : COST_EXCLUSION_FULL;
  }

  function costFullyRedistributes(k) {
    return costExclusionHandling(k) !== COST_EXCLUSION_OWNER;
  }

  function normalizeManualUmlageValue(value) {
    return value === UMLAGE_MANUAL_LEGACY ? UMLAGE_MANUAL : value;
  }

  function isPrivateTenant(m) {
    if (!tenantRelevantForCurrentBilling(m)) return false;
    const role = String(m && (m.abrechnungRolle || m.rolle || "") || "").toLocaleLowerCase("de-DE");
    return role.includes("eigent") || role.includes("privat");
  }

  function isBillableTenant(m) {
    return tenantRelevantForCurrentBilling(m) && !isPrivateTenant(m);
  }

  function billableTenantRows() {
    return visibleTenantRows().filter(m => isBillableTenant(m));
  }

  function privateTenantRows() {
    return visibleTenantRows().filter(m => isPrivateTenant(m));
  }

  function prepaymentMatrixSumForCost(costId, options = {}) {
    const row = costPrepaymentRow(costId);
    if (!row || !Array.isArray(row.werte)) return 0;
    if (options && options.allowedOnly) {
      return tenantRowsWithIndex()
        .filter(t => isCostAllowedForTenant(costId, t))
        .reduce((sum,t) => sum + num(row.werte[t.originalIndex]), 0);
    }
    return row.werte.reduce((sum,value) => sum + num(value), 0);
  }

  function activePrepaymentCostIds() {
    return state.kostenarten
      .filter(k => k.kostenart && k.vorauszahlung === "Ja")
      .map(k => k.id);
  }

  function tenantIdForUmlage(tenant) {
    return String((tenant && tenant.id) || "");
  }

  function isCostAllowedForTenant(costId, tenant) {
    const tenantId = tenantIdForUmlage(tenant);
    if (!tenantId || !state.kostenartenMieterUmlage) return true;
    const row = state.kostenartenMieterUmlage[String(costId || "")];
    if (!row || !Object.prototype.hasOwnProperty.call(row, tenantId)) return true;
    return row[tenantId] !== false && row[tenantId] !== "Nein";
  }

  function tenantRowsWithIndex() {
    return visibleTenantRows().filter(m => m.id && m.name);
  }

  function wohnungArea(wohnungId) {
    const w = state.wohnungen.find(x => x.id === wohnungId);
    return w ? num(w.wohnflaeche) : 0;
  }

  function tenantArea(m) {
    return num(m.wohnflaeche) || wohnungArea(m.wohnung);
  }

  function normalizeActiveDayValue(value) {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;
  
    const text = String(value).trim();
  
    // Alte Excel-Formatreste: 365 Tage wurden teilweise als 1900-12-30 gespeichert.
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      const d = new Date(text);
      if (!Number.isNaN(d.getTime())) {
        const base = Date.UTC(1899, 11, 30);
        const current = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        const days = Math.round((current - base) / 86400000);
        if (days > 0 && days < 10000) return days;
      }
    }
  
    return num(text);
  }

  function tenantDays(m) {
    return normalizeActiveDayValue(m.aktiveTage) || 0;
  }

  function personDays(m) {
    return num(m.personentage) || (num(m.personen) * tenantDays(m));
  }

  function allWohnungen() {
    return state.wohnungen.filter(w => w.id);
  }

  function activeWohnungen() {
    return state.wohnungen.filter(w => w.id && w.status === "aktiv");
  }

  function periodDaysApprox(tenants) {
    const maxDays = Math.max(0, ...tenants.map(t => tenantDays(t)));
    return maxDays || 365;
  }

  function unitHasTenantForAllocation(unit, tenants) {
    return !!(unit && tenants.some(t => t.wohnung === unit.id && tenantDays(t) > 0));
  }

  function unitsForCostAllocation(units, tenants, cost) {
    // Die Verteilungsbasis folgt dem physischen Wohnungsbestand der Abrechnung.
    // Leerstand oder individuelle Ausschlüsse dürfen den Divisor nicht unbemerkt verkleinern.
    return Array.isArray(units) ? units : [];
  }

  function allocateByWohneinheiten(total, tenants, units) {
    const allocations = {};
    const unitAllocations = {};
    tenants.forEach(t => allocations[t.originalIndex] = 0);
  
    const unitCount = units.length;
    const amountPerUnit = unitCount > 0 ? total / unitCount : 0;
  
    units.forEach(unit => {
      unitAllocations[unit.id] = amountPerUnit;
  
      const unitTenants = tenants.filter(t => t.wohnung === unit.id && tenantDays(t) > 0);
      if (!unitTenants.length) return;
  
      const unitDays = unitTenants.reduce((sum,t) => sum + tenantDays(t), 0);
      unitTenants.forEach(t => {
        const basis = unitDays > 0 ? tenantDays(t) / unitDays : 0;
        allocations[t.originalIndex] += amountPerUnit * basis;
      });
    });
  
    const tenantSum = Object.values(allocations).reduce((a,b) => a + num(b), 0);
    const unitTotal = Object.values(unitAllocations).reduce((a,b) => a + num(b), 0);
    const notAssignedToTenantShare = unitTotal - tenantSum;
    const status = unitCount > 0 ? allocationDistributionStatus(notAssignedToTenantShare) : "Wohneinheiten fehlen";
  
    return {
      allocations,
      unitAllocations,
      unitTotal,
      notAssignedToTenantShare,
      ownerShare:notAssignedToTenantShare,
      basisTotal:unitCount,
      inputSum:0,
      status
    };
  }

  function formatPlainNumber(value, digits=2) {
    return Number(value || 0).toLocaleString("de-DE", { maximumFractionDigits:digits, minimumFractionDigits:0 });
  }

  function waterConsumption(row, prefix) {
    if (!row || !hasEnteredMeterValue(row[prefix + "End"])) return 0;
    const start = num(row[prefix + "Start"]);
    const end = num(row[prefix + "End"]);
    if (end < start) return 0;
    return end - start;
  }

  function genericMeterConsumption(row) {
    if (!row || !hasEnteredMeterValue(row.end)) return 0;
    const start = num(row.start);
    const end = num(row.end);
    if (end < start) return 0;
    return end - start;
  }

  function waterTotalForTenantIndex(index) {
    ensureWaterMeterData();
    const row = state.waterMeters.readings[index] || {};
    return waterConsumption(row, "kw") + waterConsumption(row, "ww");
  }

  function meterTotalForCostAndTenant(costId, index) {
    ensureWaterMeterData();
    const tenant = state.mieter[index] || {};
    if (state.zaehlerDaten && Array.isArray(state.zaehlerDaten.messperioden)) {
      return NK_PRO_MODULES.meterPeriods.consumptionForCostAndTenant(
        state,
        costId,
        tenant.id || "",
        tenant.wohnung || "",
        meteringModuleOptions()
      );
    }
    if (isWaterCost(costId)) return waterTotalForTenantIndex(index);
    const rows = state.meterReadings.readings[costId] || [];
    return genericMeterConsumption(rows[index] || {});
  }

  function isMeterAutoEnabledForCost(costId) {
    ensureWaterMeterData();
    const cost = state.kostenarten.find(k => k.id === costId);
    return !!(cost && cost.umlageschluessel === "Verbrauch");
  }

  function isWaterAutoEnabledForCost(costId) {
    return isMeterAutoEnabledForCost(costId);
  }

  function inferManualInputMode(k, input, data = state) {
    if (k && (k.umlageschluessel === UMLAGE_MANUAL || k.berechnungsart === "Manuell je Mieter")) return "Direkter Eurobetrag";
    if (k && k.umlageschluessel === "Verbrauch") {
      if (String(k.id || "") === "K002") return "Zählerstände";
      const values = input && Array.isArray(input.values) ? input.values : [];
      const hasLegacyValues = values.some(v => Math.abs(num(v)) > 0.000001);
      const genericRows = data && data.meterReadings && data.meterReadings.readings && Array.isArray(data.meterReadings.readings[k.id]) ? data.meterReadings.readings[k.id] : [];
      const hasMeterRows = genericRows.some(r => r && (hasEnteredMeterValue(r.start) || hasEnteredMeterValue(r.end) || r.startDate || r.endDate));
      if (hasLegacyValues && !hasMeterRows) return "Verbrauchsmenge";
    }
    return "Zählerstände";
  }

  function defaultManualInputMode(k) { return inferManualInputMode(k, null, state); }

  function manualInputModeForCost(k) {
    const input=k && state.umlageInputs && state.umlageInputs[k.id];
    return input && MANUAL_INPUT_MODES.includes(input.mode) ? input.mode : inferManualInputMode(k, input, state);
  }

  function rawVorauszahlungByCostAndTenant(costId, tenantOriginalIndex) {
    const row = state.vorauszahlungen.find(v => v.kostenId === costId);
    if (!row || row.aktiv !== "Ja") return 0;
    return num(row.werte[tenantOriginalIndex]);
  }

  function vorauszahlungByCostAndTenant(costId, tenantOriginalIndex) {
    const tenant = state.mieter[tenantOriginalIndex] || {};
    if (!isCostAllowedForTenant(costId, tenant)) return 0;
    return rawVorauszahlungByCostAndTenant(costId, tenantOriginalIndex);
  }

  function totalVorauszahlungForTenant(tenantOriginalIndex) {
    const activeIds = new Set(activePrepaymentCostIds());
    const tenant = state.mieter[tenantOriginalIndex] || {};
    const matrixSum = state.vorauszahlungen
      .filter(v => activeIds.has(v.kostenId) && v.aktiv === "Ja" && isCostAllowedForTenant(v.kostenId, tenant))
      .reduce((sum,v) => sum + num(v.werte[tenantOriginalIndex]), 0);
    return matrixSum + num(tenant.wasserWeitereVorauszahlung);
  }

  function allocationDistributionStatus(restbetrag) {
    const rest = num(restbetrag);
    if (Math.abs(rest) <= 0.01) return "Vollständig";
    if (rest > 0) return "Nicht auf Mieter umgelegt";
    return "Überverteilung prüfen";
  }

  function eligibleTenantsForCost(k, tenants) {
    return (Array.isArray(tenants) ? tenants : []).filter(t => isCostAllowedForTenant(k.id, t));
  }

  function finalizeCostAllocationResult(k, tenants, allocations, ownerShare, basisTotal, inputSum, status, extra = {}) {
    const finalAllocations = allocations || {};
    (Array.isArray(tenants) ? tenants : []).forEach(t => {
      if (finalAllocations[t.originalIndex] === undefined) finalAllocations[t.originalIndex] = 0;
    });
  
    let finalOwnerShare = num(ownerShare);
    if (!costFullyRedistributes(k)) {
      tenants.forEach(t => {
        if (!isCostAllowedForTenant(k.id, t)) {
          finalOwnerShare += num(finalAllocations[t.originalIndex]);
          finalAllocations[t.originalIndex] = 0;
        }
      });
      if (!status || status === "Vollständig" || status === "Nicht auf Mieter umgelegt" || status === "Überverteilung prüfen") {
        status = allocationDistributionStatus(finalOwnerShare);
      }
    }
  
    return Object.assign({
      allocations: finalAllocations,
      ownerShare: finalOwnerShare,
      basisTotal,
      inputSum,
      status
    }, extra || {});
  }

  function allocationForCost(k, tenants) {
    const total = num(k.gesamtbetrag);
    const input = (state.umlageInputs && state.umlageInputs[k.id]) ? state.umlageInputs[k.id].values : [];
    const price = num(k.preisProEinheit);
    const allocations = {};
    let ownerShare = 0;
    let basisTotal = 0;
    let inputSum = 0;
  
    tenants.forEach(t => allocations[t.originalIndex] = 0);
  
    if (!k.kostenart || k.inNK !== "Ja" || total <= 0) {
      return { allocations, ownerShare:0, basisTotal:0, inputSum:0, status: total <= 0 ? "Gesamtbetrag fehlt" : "Nicht aktiv" };
    }
  
    const eligibleTenants = eligibleTenantsForCost(k, tenants);
    if (!eligibleTenants.length) {
      return { allocations, ownerShare:total, basisTotal:0, inputSum:0, status:"Keine berechtigten Mieter" };
    }
    const basisTenants = costFullyRedistributes(k) ? eligibleTenants : tenants;
  
    const inputMode = manualInputModeForCost(k);
    if (inputMode === "Direkter Eurobetrag" || inputMode === "Externe Einzelabrechnung" || k.berechnungsart === "Manuell je Mieter" || k.umlageschluessel === UMLAGE_MANUAL) {
      basisTenants.forEach(t => {
        const amount = num(input[t.originalIndex]);
        allocations[t.originalIndex] = amount;
        inputSum += amount;
      });
      ownerShare = total - inputSum;
      return finalizeCostAllocationResult(k, tenants, allocations, ownerShare, inputSum, inputSum, allocationDistributionStatus(ownerShare));
    }
  
    if (k.umlageschluessel === "Verbrauch") {
      basisTenants.forEach(t => {
        inputSum += num(input[t.originalIndex]);
      });
      basisTenants.forEach(t => {
        const units = num(input[t.originalIndex]);
        const amount = units * price;
        allocations[t.originalIndex] = amount;
      });
      const tenantSum = Object.values(allocations).reduce((a,b) => a + num(b), 0);
      ownerShare = inputSum > 0 ? total - tenantSum : total;
      return finalizeCostAllocationResult(k, tenants, allocations, ownerShare, inputSum, inputSum, allocationDistributionStatus(ownerShare));
    }
  
    if (k.umlageschluessel === "Wohnfläche") {
      const days = periodDaysApprox(basisTenants);
      const activeAreaDays = activeWohnungen().reduce((sum,w) => sum + num(w.wohnflaeche) * days, 0);
      const tenantAreaDays = basisTenants.reduce((sum,t) => sum + tenantArea(t) * tenantDays(t), 0);
      basisTotal = costFullyRedistributes(k) ? tenantAreaDays : (activeAreaDays || tenantAreaDays);
      basisTenants.forEach(t => {
        const basis = tenantArea(t) * tenantDays(t);
        allocations[t.originalIndex] = basisTotal > 0 ? total * basis / basisTotal : 0;
      });
      const tenantSum = Object.values(allocations).reduce((a,b) => a + num(b), 0);
      ownerShare = total - tenantSum;
      return finalizeCostAllocationResult(k, tenants, allocations, ownerShare, basisTotal, 0, basisTotal > 0 ? allocationDistributionStatus(ownerShare) : "Wohnfläche fehlt");
    }
  
    if (k.umlageschluessel === "Personen") {
      basisTotal = basisTenants.reduce((sum,t) => sum + personDays(t), 0);
      basisTenants.forEach(t => {
        const basis = personDays(t);
        allocations[t.originalIndex] = basisTotal > 0 ? total * basis / basisTotal : 0;
      });
      return finalizeCostAllocationResult(k, tenants, allocations, 0, basisTotal, 0, basisTotal > 0 ? "Vollständig" : "Personenzahl fehlt");
    }
  
    if (k.umlageschluessel === "Verteilung auf alle Wohneinheiten") {
      const result = allocateByWohneinheiten(total, basisTenants, unitsForCostAllocation(allWohnungen(), basisTenants, k));
      return finalizeCostAllocationResult(k, tenants, result.allocations, result.ownerShare, result.basisTotal, result.inputSum, result.status, {
        unitAllocations:result.unitAllocations,
        unitTotal:result.unitTotal,
        notAssignedToTenantShare:result.notAssignedToTenantShare
      });
    }
  
    if (k.umlageschluessel === "Verteilung nur auf aktive Wohneinheiten") {
      const result = allocateByWohneinheiten(total, basisTenants, unitsForCostAllocation(activeWohnungen(), basisTenants, k));
      return finalizeCostAllocationResult(k, tenants, result.allocations, result.ownerShare, result.basisTotal, result.inputSum, result.status, {
        unitAllocations:result.unitAllocations,
        unitTotal:result.unitTotal,
        notAssignedToTenantShare:result.notAssignedToTenantShare
      });
    }
  
    if (k.umlageschluessel === "Miettage") {
      basisTotal = basisTenants.reduce((sum,t) => sum + tenantDays(t), 0);
      basisTenants.forEach(t => {
        const basis = tenantDays(t);
        allocations[t.originalIndex] = basisTotal > 0 ? total * basis / basisTotal : 0;
      });
      return finalizeCostAllocationResult(k, tenants, allocations, 0, basisTotal, 0, basisTotal > 0 ? "Vollständig" : "Miettage fehlen");
    }
  
    return { allocations, ownerShare:total, basisTotal:0, inputSum:0, status:"Umlageschlüssel fehlt" };
  }

  function calculateUmlage() {
    syncVorauszahlungen();
    syncKostenartenMieterUmlage();
    syncUmlageInputs();
    applyWaterMetersToUmlage();
  
    const tenants = tenantRowsWithIndex(); // vollständige Umlagebasis inkl. Eigentümer/Privat
    const billableTenants = tenants.filter(t => isBillableTenant(t));
    const privateTenants = tenants.filter(t => isPrivateTenant(t));
    const activeCosts = state.kostenarten.filter(k => k.kostenart && k.inNK === "Ja");
    const costResults = activeCosts.map(k => {
      const result = allocationForCost(k, tenants);
      const tenantSum = billableTenants.reduce((sum,t) => sum + num(result.allocations[t.originalIndex]), 0);
      const privateShare = privateTenants.reduce((sum,t) => sum + num(result.allocations[t.originalIndex]), 0);
      const allTenantSum = tenants.reduce((sum,t) => sum + num(result.allocations[t.originalIndex]), 0);
      const prepaySum = billableTenants.reduce((sum,t) => sum + vorauszahlungByCostAndTenant(k.id, t.originalIndex), 0);
      return { cost:k, ...result, tenantSum, privateShare, allTenantSum, prepaySum, totalAllocated:num(result.unitTotal) || (allTenantSum + num(result.ownerShare)) };
    });
  
    const tenantResults = billableTenants.map(t => {
      const costShare = costResults.reduce((sum,row) => sum + num(row.allocations[t.originalIndex]), 0);
      const prepayments = totalVorauszahlungForTenant(t.originalIndex);
      const correction = num(t.vorjahresKorrektur);
      return {
        tenant:t,
        costShare,
        prepayments,
        correction,
        balance: costShare - prepayments - correction
      };
    });
  
    const privateResults = privateTenants.map(t => {
      const costShare = costResults.reduce((sum,row) => sum + num(row.allocations[t.originalIndex]), 0);
      return {
        tenant:t,
        costShare,
        prepayments: totalVorauszahlungForTenant(t.originalIndex),
        correction: num(t.vorjahresKorrektur),
        balance: costShare - totalVorauszahlungForTenant(t.originalIndex) - num(t.vorjahresKorrektur)
      };
    });
  
    return { tenants, billableTenants, privateTenants, activeCosts, costResults, tenantResults, privateResults };
  }

  function umlageTotals(calc) {
    const totalCosts = calc.costResults.reduce((s,r) => s + num(r.cost.gesamtbetrag), 0);
    const allTenantShare = calc.costResults.reduce((s,r) => s + num(r.allTenantSum), 0);
    const billableShare = calc.tenantResults.reduce((s,r) => s + num(r.costShare), 0);
    const privateShare = calc.privateResults.reduce((s,r) => s + num(r.costShare), 0);
    const ownerShare = calc.costResults.reduce((s,r) => s + num(r.ownerShare), 0);
    const prepayments = calc.tenantResults.reduce((s,r) => s + num(r.prepayments), 0);
    const corrections = calc.tenantResults.reduce((s,r) => s + num(r.correction), 0);
    const unitTotal = calc.costResults.reduce((s,r) => s + num(r.unitTotal), 0);
    const balance = billableShare - prepayments - corrections;
    const allocatedCheck = allTenantShare + ownerShare;
    const allocationDelta = totalCosts - allocatedCheck;
    const prepaymentMatrixTotal = calc.activeCosts.filter(k => k.vorauszahlung === "Ja").reduce((sum,k) => sum + prepaymentMatrixSumForCost(k.id, {allowedOnly:true}), 0);
    return { totalCosts, allTenantShare, billableShare, privateShare, ownerShare, prepayments, corrections, unitTotal, balance, allocatedCheck, allocationDelta, prepaymentMatrixTotal };
  }

  function prepaymentRoundingStep(mode) {
    if (String(mode).includes("10")) return 10;
    if (String(mode).includes("1")) return 1;
    return 5;
  }

  function roundMonthlyPrepayment(value, settings) {
    const n = Math.max(0, num(value));
    const step = prepaymentRoundingStep(settings && settings.roundingMode);
    if (!step || step <= 0) return Math.round(n * 100) / 100;
    return Math.ceil(n / step) * step;
  }

  function tenantAnnualizationFactor(tenant, settings) {
    if (!tenant || !settings || settings.annualizePartialTenants !== "Ja") return 1;
    const activeDays = Math.max(0, tenantDays(tenant) || tenant.aktiveTage || 0);
    const periodDays = periodDaysExact();
    if (!activeDays || activeDays >= periodDays - 1) return 1;
    return Math.min(4, Math.max(1, periodDays / activeDays));
  }

  function adjustmentGroupForCost(cost) {
    const fake = { id:cost && cost.id, kostenart:cost && cost.kostenart };
    const group = letterCostGroup(fake);
    return {
      label:group.prepayLabel || (cost && cost.kostenart) || "Nebenkosten monatlich",
      changeKey:group.changeKey || "vzChangeSonstige"
    };
  }

  function prepaymentAdjustmentData() {
    ensurePrepaymentAdjustmentSettings();
    const settings = state.prepaymentAdjustmentSettings;
    const calc = calculateUmlage();
    const costRows = calc.costResults.filter(row => row && row.cost && row.cost.vorauszahlung === "Ja" && row.cost.id !== "K040");
    const summaries = [];
    const details = [];
  
    calc.tenantResults.forEach(result => {
      const tenant = result.tenant;
      const factor = tenantAnnualizationFactor(tenant, settings);
      let oldMonthlyTotal = 0;
      let recommendedMonthlyTotal = 0;
      const tenantDetails = [];
  
      costRows.forEach(row => {
        if (!isCostAllowedForTenant(row.cost.id, tenant)) return;
        const group = adjustmentGroupForCost(row.cost);
        const costShare = num(row.allocations[tenant.originalIndex]);
        const additionalWaterPrepay = row.cost.id === "K002" ? num(tenant.wasserWeitereVorauszahlung) : 0;
        const oldAnnual = vorauszahlungByCostAndTenant(row.cost.id, tenant.originalIndex) + additionalWaterPrepay;
        const oldMonthly = oldAnnual / 12;
        const annualBasis = costShare * factor;
        const bufferedAnnual = annualBasis * (1 + num(settings.safetyBufferPercent) / 100);
        let recommendedMonthly = roundMonthlyPrepayment(bufferedAnnual / 12, settings);
        if (settings.changePolicy === "Nur Erhöhungen") recommendedMonthly = Math.max(oldMonthly, recommendedMonthly);
        if (settings.changePolicy === "Nur Senkungen") recommendedMonthly = Math.min(oldMonthly, recommendedMonthly);
        let change = recommendedMonthly - oldMonthly;
        if (Math.abs(change) < num(settings.minimumMonthlyChange)) {
          recommendedMonthly = oldMonthly;
          change = 0;
        }
        oldMonthlyTotal += oldMonthly;
        recommendedMonthlyTotal += recommendedMonthly;
        const d = {
          tenant,
          cost:row.cost,
          label:group.label,
          changeKey:group.changeKey,
          costShare,
          annualBasis,
          oldAnnual,
          oldMonthly,
          recommendedMonthly,
          change,
          annualizationFactor:factor
        };
        tenantDetails.push(d);
        details.push(d);
      });
  
      const currentTenantMonthly = num(result.prepayments) / 12;
      const recommendedTenantMonthly = recommendedMonthlyTotal;
      const changeTotal = recommendedTenantMonthly - oldMonthlyTotal;
      const kaltMonthly = num(tenant.kaltSoll) / 12;
      const warmMonthly = kaltMonthly + recommendedTenantMonthly;
      const status = Math.abs(changeTotal) < 0.005 ? "Keine Änderung" : (changeTotal > 0 ? "Erhöhung" : "Senkung");
      summaries.push({
        tenant,
        result,
        currentTenantMonthly,
        oldMonthlyTotal,
        recommendedTenantMonthly,
        changeTotal,
        kaltMonthly,
        warmMonthly,
        status,
        annualizationFactor:factor,
        details:tenantDetails
      });
    });
  
    const totals = {
      oldMonthly: summaries.reduce((s,r) => s + num(r.oldMonthlyTotal), 0),
      recommendedMonthly: summaries.reduce((s,r) => s + num(r.recommendedTenantMonthly), 0),
      changeMonthly: summaries.reduce((s,r) => s + num(r.changeTotal), 0),
      oldAnnual: summaries.reduce((s,r) => s + num(r.oldMonthlyTotal) * 12, 0),
      recommendedAnnual: summaries.reduce((s,r) => s + num(r.recommendedTenantMonthly) * 12, 0)
    };
    return { settings, calc, costRows, summaries, details, totals };
  }

  function calculatedMonthlyPrepaymentRowsForTenant(tenant) {
    const data = prepaymentAdjustmentData();
    const summary = data.summaries.find(row => row.tenant && tenant && row.tenant.id === tenant.id);
    if (!summary) return [];
    return summary.details.map(d => ({
      label:d.label,
      turnus:"monatlich",
      oldMonthly:d.oldMonthly,
      change:d.change,
      newMonthly:d.recommendedMonthly
    }));
  }

  global.NKProBillingCalculation = Object.freeze({
    costExclusionHandling,
    costFullyRedistributes,
    normalizeManualUmlageValue,
    isPrivateTenant,
    isBillableTenant,
    billableTenantRows,
    privateTenantRows,
    prepaymentMatrixSumForCost,
    activePrepaymentCostIds,
    tenantIdForUmlage,
    isCostAllowedForTenant,
    tenantRowsWithIndex,
    wohnungArea,
    tenantArea,
    normalizeActiveDayValue,
    tenantDays,
    personDays,
    allWohnungen,
    activeWohnungen,
    periodDaysApprox,
    unitHasTenantForAllocation,
    unitsForCostAllocation,
    allocateByWohneinheiten,
    formatPlainNumber,
    waterConsumption,
    genericMeterConsumption,
    waterTotalForTenantIndex,
    meterTotalForCostAndTenant,
    isMeterAutoEnabledForCost,
    isWaterAutoEnabledForCost,
    inferManualInputMode,
    defaultManualInputMode,
    manualInputModeForCost,
    rawVorauszahlungByCostAndTenant,
    vorauszahlungByCostAndTenant,
    totalVorauszahlungForTenant,
    allocationDistributionStatus,
    eligibleTenantsForCost,
    finalizeCostAllocationResult,
    allocationForCost,
    calculateUmlage,
    umlageTotals,
    prepaymentRoundingStep,
    roundMonthlyPrepayment,
    tenantAnnualizationFactor,
    adjustmentGroupForCost,
    prepaymentAdjustmentData,
    calculatedMonthlyPrepaymentRowsForTenant
  });
})(globalThis);
