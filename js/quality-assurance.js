(function (global) {
  "use strict";

  let configured = false;
  let d = {};

  function configure(dependencies) {
    d = Object.assign({}, dependencies || {});
    ["stateAccess", "clone", "withIsolatedState", "archiveActions", "documentData"].forEach(name => {
      if (!d[name]) throw new Error("NKProQualityAssurance: Abhängigkeit fehlt: " + name);
    });
    configured = true;
    return api;
  }

  function ensureConfigured() {
    if (!configured) throw new Error("NKProQualityAssurance ist nicht konfiguriert.");
  }

  function stableCode(prefix, area, point) {
    const raw = [prefix, area, point].map(value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "")).filter(Boolean).join("_");
    return raw.slice(0, 120) || String(prefix || "QUALITY");
  }

  function issueRecord(severity, area, point, detail) {
    return { code: stableCode("QUALITY", area, point), severity, area, point, detail: detail || "" };
  }

  function duplicateValues(values) {
    const counts = {};
    values.filter(Boolean).forEach(value => {
      const key = String(value).trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).filter(key => counts[key] > 1);
  }
  
  function tenantQualityLabel(m) {
    return (tenantDisplayId(m) || m.id || "ohne ID") + (m && m.name ? " · " + m.name : "");
  }
  
  function activeTenantByUnitMap() {
    const map = {};
    visibleTenantRows().forEach(t => {
      if (!t.wohnung || !isBillableTenant(t)) return;
      if (!map[t.wohnung]) map[t.wohnung] = [];
      map[t.wohnung].push(t);
    });
    return map;
  }
  
  function missingBriefFieldsForTenant(tenant) {
    const missing = [];
    if (!tenant || !tenant.name) missing.push("Name");
    if (!tenant || !tenant.geschlecht || tenant.geschlecht === "Frau/Herr") missing.push("Geschlecht/Anrede prüfen");
    if (!tenant || !tenant.strasse) missing.push("Straße");
    if (!tenant || !tenant.plz) missing.push("PLZ");
    if (!tenant || !tenant.ort) missing.push("Ort");
    return missing;
  }
  
  function tenantPeriodInterval(m) {
    const period = billingPeriodSerials(periodStart(), periodEnd());
    if (!period || !tenantOverlapsCurrentPeriod(m)) return null;
    const leaseStart = isoDateSerial(m && m.einzug) ?? period.start;
    const leaseEnd = isoDateSerial(m && m.auszug) ?? period.end;
    const start = Math.max(leaseStart, period.start);
    const end = Math.min(leaseEnd, period.end);
    if (start > end) return null;
    return { start, end };
  }
  
  function intervalDaysInclusive(interval) {
    if (!interval) return 0;
    return Math.max(0, Math.round((interval.end - interval.start) / 86400000) + 1);
  }
  
  function expectedTenantDaysInCurrentPeriod(m) {
    return intervalDaysInclusive(tenantPeriodInterval(m));
  }
  
  function tenantIntervalsOverlap(a, b) {
    const ia = tenantPeriodInterval(a);
    const ib = tenantPeriodInterval(b);
    return !!(ia && ib && ia.start <= ib.end && ib.start <= ia.end);
  }
  
  function tenantIntervalLabel(m) {
    const start = m && m.einzug ? m.einzug : periodStart();
    const end = m && m.auszug ? m.auszug : periodEnd();
    return dateDe(start) + " bis " + dateDe(end);
  }
  
  function billableRowsByUnit(rows) {
    const grouped = {};
    (Array.isArray(rows) ? rows : []).forEach(t => {
      const unit = String(t && t.wohnung || "");
      if (!unit) return;
      if (!grouped[unit]) grouped[unit] = [];
      grouped[unit].push(t);
    });
    return grouped;
  }
  
  function tenantRowsHaveOverlappingIntervals(rows) {
    const list = Array.isArray(rows) ? rows : [];
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        if (tenantIntervalsOverlap(list[i], list[j])) return true;
      }
    }
    return false;
  }

  function specialCaseWatchReportOnIsolatedState() {
    const rows = [];
    function add(severity, type, subject, detail) {
      rows.push({ code: stableCode("SPECIAL", type, subject), severity, type, subject:subject || "", detail:detail || "" });
    }
    const units = allWohnungen();
    const activeUnits = activeWohnungen();
    const visible = visibleTenantRows();
    const billable = billableTenantRows();
    const privateRows = privateTenantRows();
    const unitIds = new Set(units.map(w => w.id));
    const activeUnitIds = new Set(activeUnits.map(w => w.id));
    const periodDays = periodDaysExact();
    const tenantMap = activeTenantByUnitMap();
  
    activeUnits.forEach(w => {
      const rowsForUnit = tenantMap[w.id] || [];
      const privateOnUnit = privateRows.filter(t => t.wohnung === w.id);
      if (!rowsForUnit.length && !privateOnUnit.length) add("Hinweis", "Leerstand", unitDisplayId(w), "Aktive Wohnung ohne abrechenbaren Mieter in der aktuellen Periode.");
      if (!rowsForUnit.length && privateOnUnit.length) add("Info", "Eigentümer/Privat", unitDisplayId(w), privateOnUnit.map(tenantQualityLabel).join(", "));
      if (rowsForUnit.length > 1) {
        const detail = rowsForUnit.map(t => tenantQualityLabel(t) + " (" + tenantIntervalLabel(t) + ")").join(", ");
        if (tenantRowsHaveOverlappingIntervals(rowsForUnit)) add("Fehler", "Mieterwechsel", unitDisplayId(w), "Überlappende Mietzeiträume: " + detail);
        else add("Hinweis", "Mieterwechsel", unitDisplayId(w), "Unterjähriger Wechsel erkannt: " + detail);
      }
    });
  
    visible.forEach(m => {
      const label = tenantQualityLabel(m);
      const expectedDays = expectedTenantDaysInCurrentPeriod(m);
      const enteredDays = tenantDays(m);
      if (!m.name) add("Prüfen", "Stammdaten", tenantDisplayId(m) || "ohne ID", "Name fehlt.");
      if (!m.wohnung) add("Prüfen", "Stammdaten", label, "Wohnungszuordnung fehlt.");
      else if (!unitIds.has(m.wohnung)) add("Fehler", "Stammdaten", label, "Wohnung " + m.wohnung + " existiert nicht im Wohnungsbestand.");
      else if (!activeUnitIds.has(m.wohnung) && (isBillableTenant(m) || isPrivateTenant(m))) add("Prüfen", "Stammdaten", label, "Mietverhältnis liegt auf einer inaktiven Wohnung.");
      if (m.einzug && m.auszug && isoDateSerial(m.einzug) !== null && isoDateSerial(m.auszug) !== null && isoDateSerial(m.auszug) < isoDateSerial(m.einzug)) add("Fehler", "Mieterwechsel", label, "Auszugsdatum liegt vor Einzugsdatum.");
      if (expectedDays > 0 && expectedDays < periodDays) add("Hinweis", "Unterjährig", label, expectedDays + " von " + periodDays + " Tagen · " + tenantIntervalLabel(m));
      if (expectedDays > 0 && Math.abs(enteredDays - expectedDays) > 1) add("Prüfen", "Aktive Tage", label, "Eingetragen " + enteredDays + ", erwartet " + expectedDays + " Tage.");
      if (isPrivateTenant(m)) {
        const hasMoney = Math.abs(num(m.nkVoraus)) > 0.01 || Math.abs(num(m.kaltErhalten)) > 0.01 || Math.abs(num(m.vorjahresKorrektur)) > 0.01;
        add(hasMoney ? "Prüfen" : "Info", "Eigentümer/Privat", label, hasMoney ? "Privatdatensatz enthält Zahlungs-/Korrekturwerte." : "Privat-/Eigentümerrolle wird bewusst gesondert geführt.");
      }
    });
  
    const errors = rows.filter(r => r.severity === "Fehler").length;
    const checks = rows.filter(r => r.severity === "Prüfen").length;
    const hints = rows.filter(r => r.severity === "Hinweis").length;
    const infos = rows.filter(r => r.severity === "Info").length;
    const underjaehrig = rows.filter(r => r.type === "Unterjährig" || r.type === "Mieterwechsel").length;
    const leerstand = rows.filter(r => r.type === "Leerstand").length;
    const level = errors ? "err" : (checks ? "warn" : "ok");
    const label = errors ? "Fehler" : (checks ? "Prüfen" : (hints ? "Hinweise" : "OK"));
    const message = errors ? "Sonderfälle enthalten harte Fehler." : (checks ? "Sonderfälle sollten vor Abschluss geprüft werden." : (hints ? "Sonderfälle erkannt, aber ohne harte Auffälligkeit." : "Keine kritischen Sonderfälle erkannt."));
    return {
      rows,
      errors,
      checks,
      hints,
      infos,
      underjaehrig,
      leerstand,
      privateCount: privateRows.length,
      billableCount: billable.length,
      activeUnitCount: activeUnits.length,
      level,
      label,
      message
    };
  }

  function collectQualityChecksOnIsolatedState(options = {}) {
    const currentBillingOnly = options && options.scope === "currentBilling";
    ensureYearData();
    ensureUnitIdentityData(state);
    ensureTenantContactData();
    NK_PRO_MODULES.costActions.syncVorauszahlungen();
    NK_PRO_MODULES.costActions.syncKostenartenMieterUmlage();
    syncUmlageInputs();
    applyWaterMetersToUmlage();
  
    const issues = [];
    const add = (severity, area, point, detail) => issues.push(issueRecord(severity, area, point, detail));
    const units = Array.isArray(state.wohnungen) ? state.wohnungen.filter(w => w && w.id) : [];
    const activeUnits = units.filter(w => w.status === "aktiv");
    const tenants = visibleTenantRows();
    const billable = billableTenantRows();
    const privateRows = privateTenantRows();
    const archived = archivedTenantRows();
    const activeCosts = state.kostenarten.filter(k => k.kostenart && k.inNK === "Ja");
    const archiveItems = Array.isArray(state.jahresArchiv) ? state.jahresArchiv : [];
    const storageInfo = { bytes:0, label:"nicht Teil der Qualitätsprüfung", error:"" };
    if (NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized()) add("OK", "Finalisierung", "Abrechnung finalisiert", "Finalisiert am " + (state.meta && state.meta.currentBillingFinalizedAt ? new Date(state.meta.currentBillingFinalizedAt).toLocaleString("de-DE") : "unbekannt"));
  
    activeCosts.forEach(k => {
      if (num(k.gesamtbetrag) === 0) add("Prüfen", "Kostenarten", "Aktive Kostenart mit Betrag 0", (k.id || "") + " " + (k.kostenart || ""));
    });
    state.vorauszahlungen.filter(v => v && v.aktiv === "Ja").forEach(v => {
      const sum = Array.isArray(v.werte) ? v.werte.reduce((a,b) => a + num(b), 0) : num(v.summe);
      if (Math.abs(sum) < 0.01) add("Prüfen", "Vorauszahlungen", "Aktive Vorauszahlungszeile ohne Werte", (v.kostenId || "") + " " + (v.kostenart || ""));
    });
    tenants.forEach(m => {
      if (hasTenantData(m) && !m.name) add("Prüfen", "Mieter", "Mietverhältnis ohne Namen", m.id || "ohne ID");
      if (hasTenantData(m) && !m.wohnung) add("Prüfen", "Mieter", "Mietverhältnis ohne Wohnung", tenantQualityLabel(m));
    });
  
    if (!currentBillingOnly) {
      if (!Array.isArray(state.jahresArchiv)) add("Fehler", "Archiv", "Jahresarchiv hat ungültige Datenstruktur", "JSON-Sicherung prüfen oder letzten funktionierenden Export importieren.");
  
      const schemaVersion = currentDataSchemaVersion(state);
      if (schemaVersion < DATA_SCHEMA_VERSION) add("Prüfen", "Datenmodell", "Datenschema nicht aktuell", "Aktuell v" + schemaVersion + ", erwartet v" + DATA_SCHEMA_VERSION + ". Daten neu speichern oder JSON-Sicherung exportieren.");
      else add("OK", "Datenmodell", "Datenschema aktuell", "Version " + schemaVersion);
      if (startupErrors.length) add("Fehler", "System", "Startfehler beim Laden", startupErrors.map(e => e.area + ": " + e.message).join("; "));
      if (renderErrors.length) add("Prüfen", "System", "Renderfehler in Teilbereich", renderErrors.map(e => e.area + ": " + e.message).join("; "));
    }
  
    if (!units.length) add("Fehler", "Stammdaten", "Keine Wohnungen vorhanden", "Mindestens eine Wohnung wird benötigt.");
    if (!activeUnits.length) add("Prüfen", "Stammdaten", "Keine aktive Wohnung vorhanden", "Wohnungsstatus prüfen.");
    if (!tenants.length) add("Fehler", "Stammdaten", "Keine Mietverhältnisse vorhanden", "Mindestens ein aktueller Datensatz wird benötigt.");
    if (!billable.length) add("Prüfen", "Abrechnung", "Keine abrechenbaren Mieter vorhanden", "Einzug/Auszug, Abrechnungsperiode und Archivstatus prüfen.");
    if (!activeCosts.length) add("Prüfen", "Kostenarten", "Keine aktive NK-Kostenart vorhanden", "Kostenarten & Einstellungen prüfen.");
  
    activeCosts.forEach(k => {
      const label = (k.id || "") + " · " + (k.kostenart || "");
      if (num(k.gesamtbetrag) <= 0) add("Prüfen", "Kostenarten", "Gesamtbetrag fehlt oder ist 0", label);
      if (k.umlageschluessel === "Verbrauch" && num(k.gesamtbetrag) > 0 && num(k.preisProEinheit) <= 0) {
        add("Prüfen", "Kostenarten", "Preis pro Verbrauchseinheit fehlt", label);
      }
      if ((k.berechnungsart === "Manuell je Mieter" || k.umlageschluessel === UMLAGE_MANUAL) && num(k.gesamtbetrag) > 0) {
        const input = state.umlageInputs && state.umlageInputs[k.id] && Array.isArray(state.umlageInputs[k.id].values) ? state.umlageInputs[k.id].values : [];
        const sumInput = billable.reduce((sum,t) => sum + num(input[t.originalIndex]), 0);
        if (Math.abs(sumInput - num(k.gesamtbetrag)) > 0.02) add("Prüfen", "Umlage", "Manuelle Einzelbeträge stimmen nicht mit Gesamtbetrag überein", label + ": Einzelwerte " + fmtMoney(sumInput) + " vs. Gesamtbetrag " + fmtMoney(k.gesamtbetrag));
      }
    });
  
    const activePrepayCosts = activeCosts.filter(k => k.vorauszahlung === "Ja");
    if (activePrepayCosts.length) {
      billable.forEach(t => {
        const totalPrepay = totalVorauszahlungForTenant(t.originalIndex);
        if (Math.abs(totalPrepay) <= 0.01) add("Hinweis", "Vorauszahlungen", "Mieter ohne NK-Vorauszahlung", tenantQualityLabel(t));
      });
    }
    const adjustmentSettings = ensurePrepaymentAdjustmentSettings();
    if (adjustmentSettings.letterPrintMode === "Nicht drucken") add("Hinweis", "Vorauszahlungsanpassung", "Briefdruck der Vorauszahlungsanpassung ist ausgeschaltet", "Neue Vorauszahlungen werden berechnet, aber nicht automatisch im Brief gedruckt.");
  
    duplicateValues(units.map(w => w.id)).forEach(id => add("Prüfen", "Stammdaten", "Doppelte Wohnungs-ID", id));
    duplicateValues(state.mieter.filter(hasTenantData).map(m => m.id)).forEach(id => add("Prüfen", "Stammdaten", "Doppelte Mieter-ID", id));
    if (!currentBillingOnly) duplicateValues(archiveItems.map(a => d.archiveActions.periodId(a))).forEach(id => add("Prüfen", "Archiv", "Doppelter Archivzeitraum", id));
  
    const tenantMap = activeTenantByUnitMap();
    activeUnits.forEach(w => {
      const rows = tenantMap[w.id] || [];
      if (!rows.length) {
        const privateOnUnit = privateRows.filter(t => t.wohnung === w.id);
        if (privateOnUnit.length) add("Hinweis", "Eigentümer/Privat", "Aktive Wohnung als Privatanteil geführt", unitDisplayId(w) + " · " + privateOnUnit.map(tenantQualityLabel).join(", "));
        else add("Hinweis", "Stammdaten", "Aktive Wohnung ohne abrechenbaren Mieter", unitDisplayId(w) + " · " + (w.bezeichnung || w.lage || ""));
      }
      if (rows.length > 1) {
        if (tenantRowsHaveOverlappingIntervals(rows)) add("Fehler", "Mieterwechsel", "Überlappende Mietzeiträume auf einer Wohnung", unitDisplayId(w) + " · " + rows.map(t => tenantQualityLabel(t) + " (" + tenantIntervalLabel(t) + ")").join(", "));
        else add("Hinweis", "Mieterwechsel", "Unterjähriger Mieterwechsel erkannt", unitDisplayId(w) + " · " + rows.map(t => tenantQualityLabel(t) + " (" + tenantIntervalLabel(t) + ")").join(", "));
      }
    });
  
    privateRows.forEach(m => {
      if (num(m.nkVoraus) || num(m.kaltErhalten) || num(m.vorjahresKorrektur)) add("Hinweis", "Eigentümer/Privat", "Privatdatensatz mit Zahlungswerten", tenantQualityLabel(m));
    });
  
    activeCosts.forEach(k => {
      const allowedRows = billable.filter(t => isCostAllowedForTenant(k.id, t));
      if (!allowedRows.length) add("Prüfen", "Kostenarten", "Keine berechtigten Mieter für Kostenart", (k.id || "") + " · " + (k.kostenart || ""));
      billable.filter(t => !isCostAllowedForTenant(k.id, t)).forEach(t => {
        const rawPrepay = rawVorauszahlungByCostAndTenant(k.id, t.originalIndex);
        if (Math.abs(rawPrepay) > 0.01) {
          add("Prüfen", "Vorauszahlungen", "Vorauszahlung trotz Nein in Umlagefähigkeit", (k.id || "") + " · " + tenantQualityLabel(t) + ": " + fmtMoney(rawPrepay));
        }
      });
    });
  
    activeCosts.filter(k => k.vorauszahlung === "Ja").forEach(k => {
      const matrixSum = prepaymentMatrixSumForCost(k.id, {allowedOnly:true});
      const calcPrepay = billable.reduce((sum,t) => sum + vorauszahlungByCostAndTenant(k.id, t.originalIndex), 0);
      const delta = matrixSum - calcPrepay;
      if (Math.abs(delta) > 0.02) add("Prüfen", "Vorauszahlungen", (k.id || "") + " · " + (k.kostenart || ""), "Matrix " + fmtMoney(matrixSum) + " vs. Mieterwerte " + fmtMoney(calcPrepay));
    });
  
    if (!currentBillingOnly) {
      archiveItems.forEach((item, idx) => {
        const validation = d.archiveActions.validateItem(item);
        const label = d.archiveActions.itemLabel(item, idx);
        validation.errors.forEach(message => add("Fehler", "Archiv", "Archivdatensatz kann nicht geöffnet werden", label + ": " + message));
        validation.warnings.forEach(message => add("Hinweis", "Archiv", "Archivdatensatz ist unvollständig beschriftet", label + ": " + message));
      });
    }
  
    const unitIds = new Set(units.map(w => w.id));
    tenants.forEach(m => {
      if (!m.name) add("Prüfen", "Mieter", "Mietername fehlt", tenantDisplayId(m) || "ohne ID");
      if (!m.wohnung) add("Prüfen", "Mieter", "Wohnungszuordnung fehlt", tenantDisplayId(m) || m.name || "ohne ID");
      else if (!unitIds.has(m.wohnung)) add("Prüfen", "Mieter", "Wohnung existiert nicht in Stammdaten", (tenantDisplayId(m) || "") + " → " + m.wohnung);
      if (!m.einzug) add("Hinweis", "Mieter", "Einzugsdatum fehlt", tenantDisplayId(m) || m.name || "ohne ID");
      if (tenantDays(m) <= 0) add("Prüfen", "Mieter", "Aktive Tage fehlen", tenantDisplayId(m) || m.name || "ohne ID");
      if (num(m.personen) <= 0) add("Prüfen", "Mieter", "Personenzahl fehlt", tenantDisplayId(m) || m.name || "ohne ID");
      if (m.einzug && m.auszug && isoDateSerial(m.auszug) !== null && isoDateSerial(m.einzug) !== null && isoDateSerial(m.auszug) < isoDateSerial(m.einzug)) add("Fehler", "Mieterwechsel", "Auszug liegt vor Einzug", tenantQualityLabel(m));
      const expectedDays = expectedTenantDaysInCurrentPeriod(m);
      const enteredDays = tenantDays(m);
      if (expectedDays > 0 && Math.abs(enteredDays - expectedDays) > 1) add("Prüfen", "Mieterwechsel", "Aktive Tage weichen vom Zeitraum ab", tenantQualityLabel(m) + ": eingetragen " + enteredDays + " Tage, erwartet " + expectedDays + " Tage für " + tenantIntervalLabel(m));
      if (isBillableTenant(m)) {
        const missing = missingBriefFieldsForTenant(m);
        if (missing.length) add("Prüfen", "Briefe", "Briefdaten unvollständig", tenantQualityLabel(m) + ": " + missing.join(", "));
      }
    });
  
    const start = periodStart();
    const end = periodEnd();
    if (!start || !end || start > end) add("Fehler", "Abrechnungsperiode", "Abrechnungszeitraum ist ungültig", start + " bis " + end);
  
    state.kostenarten.forEach(k => {
      const status = NK_PRO_MODULES.costActions.kostenStatus(k);
      if (k.kostenart && !["Vollständig","Nicht Bestandteil der NK-Abrechnung"].includes(status)) {
        add("Prüfen", "Kostenart", (k.id || "") + " · " + k.kostenart, status);
      }
    });
  
    if (state.waterMeters && Array.isArray(state.waterMeters.readings)) {
      state.waterMeters.readings.forEach((r, idx) => {
        if (!r) return;
        if ((hasEnteredMeterValue(r.kwEnd) && num(r.kwEnd) < num(r.kwStart)) || (hasEnteredMeterValue(r.wwEnd) && num(r.wwEnd) < num(r.wwStart))) {
          const tenant = state.mieter[idx] || {};
          add("Prüfen", "Zählerstände", "Endstand kleiner als Anfangsstand", (tenantDisplayId(tenant) || "Mieter " + (idx + 1)) + " · " + (tenant.name || ""));
        }
      });
    }
  
    consumptionCosts().forEach(cost => {
      const visibleConsumption = visibleTenantRows().reduce((sum,t) => sum + meterTotalForCostAndTenant(cost.id, t.originalIndex), 0);
      if (num(cost.gesamtbetrag) > 0 && visibleConsumption <= 0) add("Prüfen", "Zählerstände", "Verbrauchskosten ohne Verbrauchswerte", (cost.id || "") + " · " + (cost.kostenart || ""));
      if (num(cost.gesamtbetrag) > 0) {
        const input = state.umlageInputs && state.umlageInputs[cost.id] && Array.isArray(state.umlageInputs[cost.id].values) ? state.umlageInputs[cost.id].values : [];
        billable.forEach(t => {
          if (isCostAllowedForTenant(cost.id, t) && tenantDays(t) > 0 && num(input[t.originalIndex]) <= 0) add("Hinweis", "Zählerstände", "Kein Verbrauchswert bei abrechenbarem Mieter", (cost.id || "") + " · " + tenantQualityLabel(t));
        });
      }
      if (isWaterCost(cost.id) && state.waterMeters && state.waterMeters.settings && num(state.waterMeters.settings.houseWaterTotal) > 0) {
        const delta = num(state.waterMeters.settings.houseWaterTotal) - visibleConsumption;
        if (Math.abs(delta) > 0.5) add("Hinweis", "Zählerstände", "Hauswasser und Wohnungszähler weichen ab", "Haus " + formatPlainNumber(state.waterMeters.settings.houseWaterTotal, 3) + " · Wohnungen " + formatPlainNumber(visibleConsumption, 3));
      }
    });
  
    const calc = calculateUmlage();
    const totals = umlageTotals(calc);
    const { totalCosts, allTenantShare, billableShare, privateShare, ownerShare, prepayments, corrections, balance, allocationDelta, prepaymentMatrixTotal } = totals;
    if (Math.abs(prepaymentMatrixTotal - prepayments) > 0.02) add("Prüfen", "Vorauszahlungen", "Gesamte Vorauszahlungsmatrix weicht ab", "Matrix " + fmtMoney(prepaymentMatrixTotal) + " vs. Briefe/Mieter " + fmtMoney(prepayments));
  
    calc.costResults.forEach(row => {
      const costLabel = (row.cost.id || "") + " · " + (row.cost.kostenart || "");
      const allocated = num(row.allTenantSum) + num(row.ownerShare);
      const rowDelta = num(row.cost.gesamtbetrag) - allocated;
      if (row.status && !["Vollständig","Nicht aktiv","Gesamtbetrag fehlt"].includes(row.status)) {
        add(row.status === "Überverteilung prüfen" ? "Fehler" : "Prüfen", "Berechnung", costLabel, row.status);
      }
      if (Math.abs(rowDelta) > 0.02) add("Prüfen", "Summenabgleich", costLabel + " · Verteilung weicht ab", fmtMoney(rowDelta));
      if (Math.abs(row.ownerShare) > 0.01) add("Hinweis", "Summenabgleich", costLabel + " · nicht auf Mieter umgelegt", fmtMoney(row.ownerShare));
    });
  
    if (Math.abs(allocationDelta) > 0.02) add("Prüfen", "Summenabgleich", "Aktive Kosten und Verteilung weichen ab", fmtMoney(allocationDelta));
    if (Math.abs(ownerShare) > 0.01) add("Hinweis", "Summenabgleich", "Nicht auf Mieter umgelegter Anteil vorhanden", fmtMoney(ownerShare));
    const briefResults = briefResultRows(calc);
    if (!briefResults.length) add("Prüfen", "Briefe", "Keine Empfänger für Briefauswahl", "Aktive Mietverhältnisse und Eigentümer-/Privatrollen prüfen.");
    else briefResults.forEach(result => {
      const rows = briefCostRows(calc, result.tenant);
      const rowShare = rows.reduce((sum,row) => sum + num(row.anteil), 0);
      if (Math.abs(rowShare - num(result.costShare)) > 0.02) add("Fehler", "Briefe", "Briefkosten weichen von Umlage ab", tenantQualityLabel(result.tenant) + ": " + fmtMoney(rowShare) + " vs. " + fmtMoney(result.costShare));
      if (!rows.length) add("Prüfen", "Briefe", "Keine Kostenzeilen im Brief", tenantQualityLabel(result.tenant));
    });
  
    return {
      issues,
      counts: { units:units.length, activeUnits:activeUnits.length, tenants:tenants.length, billable:billable.length, privateRows:privateRows.length, archived:archived.length, activeCosts:activeCosts.length, archives:archiveItems.length },
      storage: storageInfo,
      scope: currentBillingOnly ? "currentBilling" : "full",
      sums: { totalCosts, allTenantShare, billableShare, privateShare, ownerShare, prepayments, corrections, balance, allocationDelta }
    };
  }

  function readOnlyRun(worker) {
    ensureConfigured();
    const live = d.stateAccess.current();
    const before = JSON.stringify(live);
    const isolated = d.clone(live);
    const result = d.withIsolatedState(isolated, worker);
    const after = JSON.stringify(d.stateAccess.current());
    if (after !== before) throw new Error("Qualitätsprüfung hat den Arbeitszustand verändert.");
    return result;
  }

  function inspect(options) {
    return readOnlyRun(() => collectQualityChecksOnIsolatedState(options || {}));
  }

  function specialCases() {
    return readOnlyRun(() => specialCaseWatchReportOnIsolatedState());
  }

  function finalBillingReadiness(options) {
    ensureConfigured();
    return readOnlyRun(() => d.documentData.finalBillingReadiness(options || {}));
  }

  function describe() {
    return {
      name: "NKProQualityAssurance",
      responsibility: "Seiteneffektfreie Orchestrierung bestehender Qualitäts-, Vollständigkeits- und Abrechnungsbereitschaftsprüfungen",
      mutatesState: false,
      commits: false,
      persists: false,
      renders: false,
      publicActions: ["inspect", "specialCases", "finalBillingReadiness"]
    };
  }

  const api = Object.freeze({ configure, describe, inspect, specialCases, finalBillingReadiness, tenantQualityLabel, expectedTenantDaysInCurrentPeriod, tenantIntervalLabel, tenantRowsHaveOverlappingIntervals, missingBriefFieldsForTenant });
  global.NKProQualityAssurance = api;
})(typeof window !== "undefined" ? window : globalThis);
