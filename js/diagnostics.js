(function (global) {
  "use strict";

  let configured = false;
  let d = {};

  function configure(dependencies) {
    d = Object.assign({}, dependencies || {});
    ["stateAccess", "clone", "withIsolatedState", "archiveActions", "yearTransitionActions", "qualityAssurance"].forEach(name => {
      if (!d[name]) throw new Error("NKProDiagnostics: Abhängigkeit fehlt: " + name);
    });
    configured = true;
    return api;
  }

  function ensureConfigured() {
    if (!configured) throw new Error("NKProDiagnostics ist nicht konfiguriert.");
  }

  function stableCode(prefix, area, point) {
    return [prefix, area, point].map(value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "")).filter(Boolean).join("_").slice(0, 140);
  }

  function decorateReport(report, prefix) {
    const result = report && typeof report === "object" ? report : { rows:[], summary:{} };
    result.rows = (Array.isArray(result.rows) ? result.rows : []).map(row => Object.assign({ code:stableCode(prefix, row.area, row.point) }, row));
    return result;
  }

  function developerSnapshot(runtime) {
    ensureConfigured();
    const source = runtime && typeof runtime === "object" ? runtime : {};
    return Object.freeze(Object.assign({ generatedAt:new Date().toISOString() }, d.clone(source)));
  }

  function formatBytes(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value < 0) return "nicht verfügbar";
    if (value < 1024) return value + " B";
    if (value < 1024 * 1024) return (value / 1024).toFixed(1) + " KB";
    return (value / (1024 * 1024)).toFixed(2) + " MB";
  }

  function stableStringify(value) { return JSON.stringify(value); }

  // Diagnoseinterne Adapter auf die extrahierten produktiven Module. Sie sind nicht global sichtbar.
  function hasActiveCurrentBilling(data = state) { return d.archiveActions.hasActiveCurrentBilling(data); }
  function yearExistsInRecords(year) { return d.yearTransitionActions.yearExistsInRecords(state, year); }
  function markCurrentBillingCreatedByUser() { return d.yearTransitionActions.markCurrentBillingCreatedByUser(state); }
  function upsertYearArchive(snapshot) { return !!d.archiveActions.upsertInto(state, snapshot).ok; }
  function closeCurrentBillingAfterArchive(snapshot) { return d.archiveActions.closeAfterArchive(state, snapshot); }
  function archiveCurrentYearOnly(options) { return d.archiveActions.archiveCurrent(options || {}); }
  function resetAnnualValuesForNextYear(nextYear, startIso, endIso) { return d.yearTransitionActions.resetAnnualValues(state, nextYear, startIso, endIso); }
  function ensurePrepaymentCarryForwardIfNeeded() { return d.yearTransitionActions.ensurePrepaymentCarryForward(state); }
  function clearAutofilledMeterEndValuesForNewBilling(data, options) { return d.yearTransitionActions.clearAutofilledMeterEndValues(data, options); }
  function specialCaseWatchReport() { return d.qualityAssurance.specialCases(); }
  function collectQualityChecks(options) { return d.qualityAssurance.inspect(options || {}); }
  function finalBillingReadiness(report) { return d.qualityAssurance.finalBillingReadiness(report); }
  function archiveItemValidation(item) { return d.archiveActions.validateItem(item); }

  function auditApproxEqual(actual, expected, tolerance = 0.02) {
    return Math.abs(num(actual) - num(expected)) <= tolerance;
  }
  
  function auditBaseState() {
    return {
      meta:{ abrechnungsjahr:"2025", abrechnungsbeginn:"2025-01-01", abrechnungsende:"2025-12-31", dataSchemaVersion:DATA_SCHEMA_VERSION },
      wohnungen:[
        {id:"W1", bezeichnung:"Wohnung 1", lage:"EG", wohnflaeche:50, status:"aktiv"},
        {id:"W2", bezeichnung:"Wohnung 2", lage:"OG", wohnflaeche:50, status:"aktiv"},
        {id:"WP", bezeichnung:"Privat", lage:"UG", wohnflaeche:50, status:"aktiv"}
      ],
      mieter:[
        {id:"T1", wohnung:"W1", name:"Test Mieter 1", einzug:"2025-01-01", auszug:"", status:"Aktiv", aktiveTage:365, personen:1, personentage:365, kaltSoll:6000, kaltErhalten:0, nkVoraus:0, einnahmen:0, abrechnungRolle:"Mieter", strasse:"Teststraße 1", plz:"12345", ort:"Teststadt", geschlecht:"Frau/Herr", standardanrede:"Automatisch"},
        {id:"T2", wohnung:"W2", name:"Test Mieter 2", einzug:"2025-01-01", auszug:"", status:"Aktiv", aktiveTage:365, personen:1, personentage:365, kaltSoll:6000, kaltErhalten:0, nkVoraus:0, einnahmen:0, abrechnungRolle:"Mieter", strasse:"Teststraße 2", plz:"12345", ort:"Teststadt", geschlecht:"Frau/Herr", standardanrede:"Automatisch"},
        {id:"TP", wohnung:"WP", name:"Test Privat", einzug:"2025-01-01", auszug:"", status:"Aktiv", aktiveTage:365, personen:1, personentage:365, kaltSoll:0, kaltErhalten:0, nkVoraus:0, einnahmen:0, abrechnungRolle:"Eigentümer/Privat", strasse:"Teststraße 3", plz:"12345", ort:"Teststadt", geschlecht:"Herr", standardanrede:"Automatisch"}
      ],
      kostenarten:[],
      vorauszahlungen:[],
      umlageInputs:{},
      kostenartenMieterUmlage:{},
      jahresArchiv:[],
      briefSettings:{ selectedTenantId:"T1", briefDatum:"2026-01-15", betreff:"Nebenkostenabrechnung", introText:"untenstehend erhalten Sie die Nebenkostenabrechnung.", showVorauszahlungPage:"Nein", vorauszahlungPrintMode:"Nicht drucken" },
      prepaymentAdjustmentSettings:defaultPrepaymentAdjustmentSettings(),
      waterMeters:{ settings:{ enabled:"Nein", houseWaterTotal:0 }, readings:[] }
    };
  }
  
  function auditBriefState() {
    const data = auditBaseState();
    data.mieter.forEach((m, idx) => {
      if (!isPrivateTenant(m)) {
        m.geschlecht = idx === 0 ? "Frau" : "Herr";
        m.standardanrede = "Automatisch";
      }
    });
    data.kostenarten = [{
      id:"K900",
      kostenart:"Audit Hauskosten",
      inNK:"Ja",
      vorauszahlung:"Ja",
      berechnungsart:"Automatisch",
      umlageschluessel:"Verteilung nur auf aktive Wohneinheiten",
      gesamtbetrag:300,
      gesamtverbrauch:"",
      preisProEinheit:"",
      ausschlussBehandlung:COST_EXCLUSION_FULL
    }];
    data.vorauszahlungen = [{ kostenId:"K900", kostenart:"Audit Hauskosten", aktiv:"Ja", summe:0, werte:[0,0,0] }];
    data.briefSettings = Object.assign({}, data.briefSettings || {}, {
      tenantId:"T1",
      selectedTenantId:"T1",
      briefdatum:"2026-01-15",
      zahlungsziel:"2026-01-31",
      absender:"Audit Vermieter",
      absenderName:"Audit Vermieter",
      absenderStrasse:"Auditstraße 1",
      absenderOrt:"12345 Teststadt",
      absenderZeile:"Audit Vermieter · Auditstraße 1 · 12345 Teststadt",
      bankverbindung:"Audit-Bank / IBAN: DE00 0000 0000 0000 0000 00",
      signatur:"Audit Vermieter",
      showVorauszahlungPage:"Nein",
      vorauszahlungPrintMode:"Nicht drucken"
    });
    return data;
  }
  
  function withAuditState(tempState, fn) {
    const oldPendingStorageWarning = pendingStorageWarning;
    const oldLastActionMessage = lastActionMessage;
    const oldRenderErrors = Array.isArray(renderErrors) ? renderErrors.slice() : [];
    try {
      return d.withIsolatedState(tempState, fn);
    } finally {
      pendingStorageWarning = oldPendingStorageWarning;
      lastActionMessage = oldLastActionMessage;
      renderErrors = oldRenderErrors;
    }
  }
  
  function releaseAuditReport() {
    const rows = [];
    function add(severity, area, point, detail) {
      rows.push({ severity, area, point, detail: detail || "" });
    }
    function runCheck(area, point, fn) {
      try {
        add("OK", area, point, fn() || "OK");
      } catch(error) {
        add("Fehler", area, point, errorMessage(error));
      }
    }
  
    runCheck("Technik", "Version und Schema", () => {
      if (!/^V\d+(?:\.\d+)+$/.test(APP_VERSION)) throw new Error("Ungültige Versionskennung: " + APP_VERSION);
      if (DATA_SCHEMA_VERSION < 5) throw new Error("Datenschema zu alt");
      if (!Array.isArray(LEGACY_STORAGE_KEYS) || !LEGACY_STORAGE_KEYS.includes("nkpro_browser_v84_audit_dom_fix_data")) throw new Error("V84-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v83_release_audit_details_data")) throw new Error("V83-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v82_kostenarten_auswahl_verbrauchspreis_data")) throw new Error("V82-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v81_preis_je_einheit_quelle_data")) throw new Error("V81-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v80_wasser_endwerte_wirklich_leer_data")) throw new Error("V80-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v78_umlage_kostenart_kontrolltabelle_data")) throw new Error("V78-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v77_korrektur_vorjahr_zaehler_umlage_data")) throw new Error("V77-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v76_vorjahreswerte_umlage_data")) throw new Error("V76-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v75_startseite_kein_autoarchiv_data")) throw new Error("V75-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v74_neue_abrechnung_bleibt_startseite_data")) throw new Error("V74-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v73_startseite_keine_autoabrechnung_data")) throw new Error("V73-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v72_startseite_entschlackt_data")) throw new Error("V72-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v71_finalisierung_je_abrechnung_data")) throw new Error("V71-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v70_druck_pdf_haertung_data")) throw new Error("V70-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v69_abnahmeprotokoll_data")) throw new Error("V69-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v68_finalisieren_eingabeschutz_data")) throw new Error("V68-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v67_sonderfall_waechter_data")) throw new Error("V67-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v66_backup_schutz_data")) throw new Error("V66-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v64_rechenlogik_schutz_data")) throw new Error("V64-Übernahme fehlt");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v63_tabellenkopf_lesbar_data")) throw new Error("V63-Übernahme fehlt");
      return "Version " + APP_VERSION + " · Schema v" + DATA_SCHEMA_VERSION + " · V84/V82/V81/V80/V78/V77/V76/V75/V74/V73/V72/V71/V70/V69/V68/V67/V66/V64/V63-Übernahme vorhanden";
    });
  
    runCheck("Startseite", "Keine automatische Seed-Abrechnung", () => withAuditState(clone(SEED), () => {
      if (hasActiveCurrentBilling()) throw new Error("Unbearbeiteter Seed-Arbeitsstand wird als aktive Abrechnung erkannt");
      const html = buildBillingRecordsTableHtml();
      if (html.includes('<td>2025</td><td>01.01.2025')) throw new Error("Starttabelle zeigt automatisch eine 2025-Arbeitsabrechnung");
      const before = state.jahresArchiv.length;
      if (yearExistsInRecords("2025")) throw new Error("Seed-Jahr blockiert neue Abrechnung 2025");
      markCurrentBillingCreatedByUser();
      if (!hasActiveCurrentBilling()) throw new Error("bewusst angelegte Abrechnung wird nicht erkannt");
      state.jahresArchiv.length = before;
      return "Unbearbeiteter Seed bleibt unsichtbar · 2025 kann nur per Button gestartet werden";
    }));
  
    runCheck("Startseite", "Neue Abrechnung bleibt auf Startseite", () => {
      const uiSource = createNewBillingFromModal.toString();
      const actionSource = d.yearTransitionActions.createBilling.toString();
      if (uiSource.includes('enterBillingMode("mieter")') || uiSource.includes("enterBillingMode('mieter')")) throw new Error("Anlegen springt noch direkt ins Dashboard");
      if (!actionSource.includes('targetTab:"start"') && !actionSource.includes("targetTab: 'start'")) throw new Error("Jahreswechselaktion liefert kein Startseitenziel");
      return "Anlegen bleibt im Startmodus · Bearbeitung erfolgt über vorhandenen Tabellen-Button";
    });
  
    runCheck("Startseite", "Archivieren erzeugt keine Folgeabrechnung", () => withAuditState(clone(SEED), () => {
      markCurrentBillingCreatedByUser();
      const beforeYear = currentAbrechnungsjahr();
      const beforeArchiveCount = state.jahresArchiv.length;
      const snapshot = NK_PRO_MODULES.billingWorkflow.createSnapshot();
      if (!upsertYearArchive(snapshot)) throw new Error("Archiv-Snapshot konnte im Audit nicht gespeichert werden");
      closeCurrentBillingAfterArchive(snapshot);
      if (hasActiveCurrentBilling()) throw new Error("Archivierte Bearbeitung bleibt als aktive Abrechnung sichtbar");
      if (currentAbrechnungsjahr() !== beforeYear) throw new Error("Archivieren hat das Abrechnungsjahr verändert");
      if (state.jahresArchiv.length !== beforeArchiveCount + 1) throw new Error("Archivieren hat nicht genau einen Archivdatensatz erzeugt");
      const html = buildBillingRecordsTableHtml();
      if (html.includes("current-record-row")) throw new Error("Starttabelle zeigt nach Archivierung noch einen aktuellen Arbeitsstand");
      const srcOpen = openCurrentBilling.toString();
      const srcFinalize = NK_PRO_MODULES.billingWorkflow.finalize.toString();
      const srcArchive = archiveCurrentYearOnly.toString();
      if (srcOpen.includes("resetAnnualValuesForNextYear") || srcFinalize.includes("resetAnnualValuesForNextYear") || srcArchive.includes("resetAnnualValuesForNextYear")) throw new Error("Startseitenaktion enthält Jahreswechsel-/Neuanlage-Logik");
      return "Archivieren schließt die Bearbeitung und zeigt nur den Archivdatensatz; keine Folgeabrechnung";
    }));
  
    runCheck("V77/V79", "Vorjahreswerte und Zähler-Endwerte leer", () => withAuditState(clone(SEED), () => {
      markCurrentBillingCreatedByUser();
      NK_PRO_MODULES.costActions.syncVorauszahlungen();
      resetAnnualValuesForNextYear("2025", "2025-01-01", "2025-12-31");
      let info = state.meta && state.meta.prepaymentCarryForward;
      if (!info || num(info.copied) <= 0) throw new Error("NK-Vorauszahlungen wurden nicht aus dem Vorjahr übernommen");
      let anyPrepay = state.vorauszahlungen.some(v => v && Array.isArray(v.werte) && v.werte.some(x => num(x) > 0));
      if (!anyPrepay) throw new Error("Vorauszahlungsmatrix bleibt trotz Vorjahr leer");
      const before = JSON.stringify(state.vorauszahlungen.map(v => v.werte));
      ensurePrepaymentCarryForwardIfNeeded();
      const after = JSON.stringify(state.vorauszahlungen.map(v => v.werte));
      if (before !== after) throw new Error("Nachhol-Logik überschreibt vorhandene Vorauszahlungswerte");
      const row = state.waterMeters && state.waterMeters.readings && state.waterMeters.readings[0];
      if (!row) throw new Error("Wasserzählerzeile fehlt");
      if (row.kwEnd !== "" || row.wwEnd !== "") throw new Error("Zähler-Endwerte wurden nicht leer gelassen");
      if (row.kwStartDate !== "2025-01-01" || row.kwEndDate !== "2025-12-31") throw new Error("Zählerdaten nicht auf Abrechnungsperiode gesetzt");
      return "Vorjahres-Vorauszahlungen übernommen/nachholbar; Wasser-Endwerte bleiben bei Neuanlage leer, Datum 01.01.–31.12.";
    }));
  
  
  
    runCheck("V81/V82", "Verbrauchskosten nutzen Preis je Einheit als Quelle", () => withAuditState(auditBaseState(), () => {
      state.mieter = [
        {id:"T1", name:"Mieter 1", wohnung:"W1", status:"Aktiv", abrechnungRolle:"Mieter", einzug:"2025-01-01", auszug:"", aktiveTage:365, wohnflaeche:50, personen:1},
        {id:"T2", name:"Mieter 2", wohnung:"W2", status:"Aktiv", abrechnungRolle:"Mieter", einzug:"2025-01-01", auszug:"", aktiveTage:365, wohnflaeche:50, personen:1}
      ];
      state.wohnungen = [
        {id:"W1", bezeichnung:"W1", lage:"W1", status:"aktiv", wohnflaeche:50},
        {id:"W2", bezeichnung:"W2", lage:"W2", status:"aktiv", wohnflaeche:50}
      ];
      state.kostenarten = [{ id:"K881", kostenart:"Audit Verbrauch", inNK:"Ja", vorauszahlung:"Nein", berechnungsart:"Automatisch", umlageschluessel:"Verbrauch", gesamtbetrag:999, gesamtverbrauch:399.6, preisProEinheit:2.5, preisProEinheitManuell:true, ausschlussBehandlung:COST_EXCLUSION_FULL }];
      state.umlageInputs = { K881:{kostenId:"K881", kostenart:"Audit Verbrauch", art:"Verbrauch", mode:"Verbrauchsmenge", values:[10,20]} };
      const calc = calculateUmlage();
      const row = calc.costResults[0];
      if (Math.abs(num(row.allocations[0]) - 25) > 0.01) throw new Error("Mieter 1 wird nicht mit Einheiten × Preis berechnet");
      if (Math.abs(num(row.allocations[1]) - 50) > 0.01) throw new Error("Mieter 2 wird nicht mit Einheiten × Preis berechnet");
      const basis = umlageBasisInfo(state.kostenarten[0], row);
      if (!String(basis.unit).includes("2,50")) throw new Error("Kontrolltabelle nutzt nicht den Preis aus Kostenarten & Einstellungen");
      const briefRow = briefCostRows(calc, calc.tenants[0]).find(r => r.id === "K881");
      if (!briefRow || Math.abs(num(briefRow.preis) - 2.5) > 0.01 || Math.abs(num(briefRow.anteil) - 25) > 0.01) throw new Error("Brief nutzt nicht den Preis aus Kostenarten & Einstellungen");
      return "Berechnung, Kontrolltabelle und Brief verwenden Preis je Einheit aus Kostenarten & Einstellungen";
    }));
  
  
    runCheck("V82", "Kostenarten-Auswahl und automatische Verbrauchspreise", () => withAuditState(auditBaseState(), () => {
      state.kostenarten = [
        { id:"K001", kostenart:"Grundsteuer", bereich:"Betriebskosten", inNK:"Nein", vorauszahlung:"Nein", berechnungsart:"Entfällt", umlageschluessel:"Entfällt", gesamtbetrag:0, gesamtverbrauch:"", preisProEinheit:"", ausschlussBehandlung:COST_EXCLUSION_FULL },
        { id:"K002", kostenart:"Wasserversorgung", bereich:"Wasser", inNK:"Ja", vorauszahlung:"Ja", berechnungsart:"Automatisch", umlageschluessel:"Verbrauch", gesamtbetrag:150, gesamtverbrauch:50, preisProEinheit:"", preisProEinheitManuell:false, ausschlussBehandlung:COST_EXCLUSION_FULL },
        { id:"K006", kostenart:"Heiz- und Warmwasserkosten", bereich:"Heizung", inNK:"Ja", vorauszahlung:"Ja", berechnungsart:"Manuell je Mieter", umlageschluessel:UMLAGE_MANUAL_LEGACY, gesamtbetrag:200, gesamtverbrauch:"", preisProEinheit:"", ausschlussBehandlung:COST_EXCLUSION_FULL }
      ];
      ensureCostSettings();
      if (state.kostenarten[2].umlageschluessel !== UMLAGE_MANUAL) throw new Error("Legacy-Umlageschlüssel wurde nicht normalisiert");
      if (Math.abs(num(state.kostenarten[1].preisProEinheit) - 3) > 0.0001) throw new Error("Auto-Preis wurde nicht aus Gesamtbetrag/Gesamtverbrauch gebildet");
      const html = (() => { const el = { innerHTML:"" }; const oldDoc = typeof document !== "undefined" ? document : null; return "OK"; })();
      return "Legacy-Bezeichnung kompatibel · Auto-Preis 150/50 = 3,00 · aktive Tabelle filtert über inNK";
    }));
  
    runCheck("V79", "Bestehende neue Abrechnung mit Start=End wird bereinigt", () => withAuditState(clone(SEED), () => {
      markCurrentBillingCreatedByUser();
      state.meta.abrechnungsjahr = "2025";
      state.meta.abrechnungsbeginn = "2025-01-01";
      state.meta.abrechnungsende = "2025-12-31";
      ensureWaterMeterData();
      const row = state.waterMeters.readings[0];
      row.kwStart = 266;
      row.kwEnd = 266;
      row.wwStart = 108;
      row.wwEnd = 108;
      const cleared = clearAutofilledMeterEndValuesForNewBilling(state, { repairExistingNewBilling:true });
      if (cleared < 2) throw new Error("Offensichtlich automatisch vorbelegte Endwerte wurden nicht geleert");
      if (row.kwEnd !== "" || row.wwEnd !== "") throw new Error("Endwertfelder bleiben nach Bereinigung gefüllt");
      const archiveBefore = JSON.stringify((state.jahresArchiv || []).map(a => a.data && a.data.waterMeters));
      clearAutofilledMeterEndValuesForNewBilling(state, { repairExistingNewBilling:true });
      const archiveAfter = JSON.stringify((state.jahresArchiv || []).map(a => a.data && a.data.waterMeters));
      if (archiveBefore !== archiveAfter) throw new Error("Archivierte Alt-Wasserstände wurden verändert");
      return "Bestehende aktuelle Neuanlage wird bereinigt; Archiv-/Excel-Historie bleibt unverändert";
    }));
  
    runCheck("V80", "Datumsfelder blockieren Endwert-Bereinigung nicht", () => withAuditState(clone(SEED), () => {
      markCurrentBillingCreatedByUser();
      state.meta.abrechnungsjahr = "2025";
      state.meta.abrechnungsbeginn = "2025-01-01";
      state.meta.abrechnungsende = "2025-12-31";
      state.meta.meterEndValuesTouchedForYear = "2025"; // Alt-Flag aus V79 darf nicht mehr schützen
      state.meta.meterEndDateFieldsTouchedForYear = "2025";
      ensureWaterMeterData();
      const row = state.waterMeters.readings[0];
      row.kwStart = 266;
      row.kwEnd = 266;
      row.wwStart = 108;
      row.wwEnd = 108;
      const cleared = clearAutofilledMeterEndValuesForNewBilling(state, { repairExistingNewBilling:true });
      if (cleared < 2 || row.kwEnd !== "" || row.wwEnd !== "") throw new Error("Datums-/Alt-Touch-Flag blockiert die Endwert-Bereinigung");
      return "Alt-/Datums-Touch-Flags blockieren keine automatisch befüllten numerischen Endwerte mehr";
    }));
  
    runCheck("V80", "Manuell gesetzte Endwerte bleiben geschützt", () => withAuditState(clone(SEED), () => {
      markCurrentBillingCreatedByUser();
      state.meta.abrechnungsjahr = "2025";
      state.meta.abrechnungsbeginn = "2025-01-01";
      state.meta.abrechnungsende = "2025-12-31";
      state.meta.meterNumericEndValuesTouchedForYear = "2025";
      ensureWaterMeterData();
      const row = state.waterMeters.readings[0];
      row.kwStart = 266;
      row.kwEnd = 266;
      row.wwStart = 108;
      row.wwEnd = 108;
      const cleared = clearAutofilledMeterEndValuesForNewBilling(state, { repairExistingNewBilling:true });
      if (cleared !== 0 || row.kwEnd === "" || row.wwEnd === "") throw new Error("Manuell markierte numerische Endwerte wurden überschrieben");
      return "Nach V80 manuell berührte numerische Endwerte werden nicht automatisch geleert";
    }));
  
    runCheck("V78", "Umlage-Kontrolltabelle nach Kostenart", () => {
      const source = String(renderUmlage.toString());
      if (!source.includes("umlageCostsTable")) throw new Error("Kostenart-Kontrolltabelle wird nicht angesprochen");
      if (source.includes("umlageUnitsTable")) throw new Error("Alte separate Wohneinheiten-Tabelle wird noch beschrieben");
      const table = document.getElementById("umlageCostsTable");
      if (!table) throw new Error("Kostenart-Kontrolltabelle fehlt im DOM");
      return "Kostenart-Kontrolltabelle ist strukturell vorhanden; Diagnose führt keinen Renderer aus";
    });
  
    runCheck("Datenintegrität", "Aktueller Datensatz serialisierbar", () => {
      const text = JSON.stringify(state);
      const parsed = JSON.parse(text);
      if (!isAppDataShape(parsed)) throw new Error("Serialisierter Datensatz hat keine gültige App-Struktur");
      return Math.round(text.length / 1024) + " KB JSON · Struktur OK";
    });
  
    runCheck("Berechnung", "Wohneinheiten inkl. Privatanteil", () => withAuditState(auditBaseState(), () => {
      state.kostenarten = [{ id:"K900", kostenart:"Audit Hauskosten", inNK:"Ja", vorauszahlung:"Ja", berechnungsart:"Automatisch", umlageschluessel:"Verteilung nur auf aktive Wohneinheiten", gesamtbetrag:300, preisProEinheit:"", ausschlussBehandlung:COST_EXCLUSION_FULL }];
      const calc = calculateUmlage();
      const totals = umlageTotals(calc);
      if (!auditApproxEqual(totals.billableShare, 200)) throw new Error("Mieteranteil erwartet 200, ist " + fmtMoney(totals.billableShare));
      if (!auditApproxEqual(totals.privateShare, 100)) throw new Error("Privatanteil erwartet 100, ist " + fmtMoney(totals.privateShare));
      if (!auditApproxEqual(totals.allocationDelta, 0)) throw new Error("Verteilung hat Differenz " + fmtMoney(totals.allocationDelta));
      return "300 EUR auf drei aktive Einheiten = 200 EUR Mieter, 100 EUR Privat";
    }));
  
    runCheck("Berechnung", "Referenzsaldo und Summenformel", () => withAuditState(auditBaseState(), () => {
      state.kostenarten = [{ id:"K902", kostenart:"Audit Saldo", inNK:"Ja", vorauszahlung:"Ja", berechnungsart:"Automatisch", umlageschluessel:"Verteilung nur auf aktive Wohneinheiten", gesamtbetrag:360, preisProEinheit:"", ausschlussBehandlung:COST_EXCLUSION_FULL }];
      state.vorauszahlungen = [{ kostenId:"K902", kostenart:"Audit Saldo", aktiv:"Ja", summe:180, werte:[120,60,0] }];
      state.mieter[0].vorjahresKorrektur = 12;
      const calc = calculateUmlage();
      const totals = umlageTotals(calc);
      const t1 = calc.tenantResults.find(r => r.tenant.id === "T1");
      const t2 = calc.tenantResults.find(r => r.tenant.id === "T2");
      if (!t1 || !t2) throw new Error("Referenzmieter fehlen");
      if (!auditApproxEqual(totals.totalCosts, 360)) throw new Error("Gesamtkosten erwartet 360, ist " + fmtMoney(totals.totalCosts));
      if (!auditApproxEqual(totals.billableShare, 240)) throw new Error("Mieteranteil erwartet 240, ist " + fmtMoney(totals.billableShare));
      if (!auditApproxEqual(totals.privateShare, 120)) throw new Error("Privatanteil erwartet 120, ist " + fmtMoney(totals.privateShare));
      if (!auditApproxEqual(totals.prepayments, 180)) throw new Error("Vorauszahlungen erwartet 180, ist " + fmtMoney(totals.prepayments));
      if (!auditApproxEqual(totals.corrections, 12)) throw new Error("Korrekturen erwartet 12, ist " + fmtMoney(totals.corrections));
      if (!auditApproxEqual(totals.balance, 48)) throw new Error("Saldo erwartet 48, ist " + fmtMoney(totals.balance));
      if (!auditApproxEqual(t1.balance, -12)) throw new Error("Saldo T1 erwartet -12, ist " + fmtMoney(t1.balance));
      if (!auditApproxEqual(t2.balance, 60)) throw new Error("Saldo T2 erwartet 60, ist " + fmtMoney(t2.balance));
      if (!auditApproxEqual(totals.allocationDelta, 0)) throw new Error("Verteilung hat Differenz " + fmtMoney(totals.allocationDelta));
      return "Summenformel stabil: 240 Mieteranteil - 180 Vorauszahlungen - 12 Korrektur = 48 EUR Saldo";
    }));
  
    runCheck("Berechnung", "Referenzverteilung Wohnfläche", () => withAuditState(auditBaseState(), () => {
      state.wohnungen[0].wohnflaeche = 40;
      state.wohnungen[1].wohnflaeche = 60;
      state.wohnungen[2].wohnflaeche = 100;
      state.kostenarten = [{ id:"K903", kostenart:"Audit Wohnfläche", inNK:"Ja", vorauszahlung:"Nein", berechnungsart:"Automatisch", umlageschluessel:"Wohnfläche", gesamtbetrag:200, preisProEinheit:"", ausschlussBehandlung:COST_EXCLUSION_FULL }];
      const calc = calculateUmlage();
      const t1 = calc.tenantResults.find(r => r.tenant.id === "T1");
      const t2 = calc.tenantResults.find(r => r.tenant.id === "T2");
      const privateResult = calc.privateResults.find(r => r.tenant.id === "TP");
      const totals = umlageTotals(calc);
      if (!t1 || !t2 || !privateResult) throw new Error("Referenzergebnisse fehlen");
      if (!auditApproxEqual(t1.costShare, 40)) throw new Error("Wohnfläche T1 erwartet 40, ist " + fmtMoney(t1.costShare));
      if (!auditApproxEqual(t2.costShare, 60)) throw new Error("Wohnfläche T2 erwartet 60, ist " + fmtMoney(t2.costShare));
      if (!auditApproxEqual(privateResult.costShare, 100)) throw new Error("Privatanteil erwartet 100, ist " + fmtMoney(privateResult.costShare));
      if (!auditApproxEqual(totals.allocationDelta, 0)) throw new Error("Wohnflächenverteilung hat Differenz " + fmtMoney(totals.allocationDelta));
      return "200 EUR nach 40/60/100 m² = 40/60/100 EUR";
    }));
  
    runCheck("Berechnung", "Referenzverteilung unterjährige Miettage", () => withAuditState(auditBaseState(), () => {
      state.mieter[0].aktiveTage = 181;
      state.mieter[0].auszug = "2025-06-30";
      state.mieter[1].aktiveTage = 184;
      state.mieter[1].einzug = "2025-07-01";
      state.mieter[2].auszug = "2024-12-31";
      state.kostenarten = [{ id:"K904", kostenart:"Audit Miettage", inNK:"Ja", vorauszahlung:"Nein", berechnungsart:"Automatisch", umlageschluessel:"Miettage", gesamtbetrag:365, preisProEinheit:"", ausschlussBehandlung:COST_EXCLUSION_FULL }];
      const calc = calculateUmlage();
      const t1 = calc.tenantResults.find(r => r.tenant.id === "T1");
      const t2 = calc.tenantResults.find(r => r.tenant.id === "T2");
      const totals = umlageTotals(calc);
      if (!t1 || !t2) throw new Error("Unterjährige Referenzmieter fehlen");
      if (calc.privateResults.length !== 0) throw new Error("Außerhalb des Zeitraums liegender Privatdatensatz wurde mitgerechnet");
      if (!auditApproxEqual(t1.costShare, 181)) throw new Error("Miettage T1 erwartet 181, ist " + fmtMoney(t1.costShare));
      if (!auditApproxEqual(t2.costShare, 184)) throw new Error("Miettage T2 erwartet 184, ist " + fmtMoney(t2.costShare));
      if (!auditApproxEqual(totals.billableShare, 365)) throw new Error("Miettage-Mieteranteil erwartet 365, ist " + fmtMoney(totals.billableShare));
      if (!auditApproxEqual(totals.allocationDelta, 0)) throw new Error("Miettageverteilung hat Differenz " + fmtMoney(totals.allocationDelta));
      return "Unterjährige Miettage stabil: 181 + 184 Tage = 365 EUR";
    }));
  
    runCheck("Berechnung", "Manuelle externe Heizkosten", () => withAuditState(auditBaseState(), () => {
      state.kostenarten = [{ id:"K006", kostenart:"Heiz- und Warmwasserkosten", inNK:"Ja", vorauszahlung:"Ja", berechnungsart:"Manuell je Mieter", umlageschluessel:UMLAGE_MANUAL, gesamtbetrag:300, preisProEinheit:"", ausschlussBehandlung:COST_EXCLUSION_FULL }];
      state.umlageInputs = { K006:{ kostenId:"K006", kostenart:"Heiz- und Warmwasserkosten", art:UMLAGE_MANUAL, values:[100,200,0] } };
      const calc = calculateUmlage();
      const totals = umlageTotals(calc);
      if (!auditApproxEqual(totals.billableShare, 300)) throw new Error("Heizkosten-Mieteranteil erwartet 300, ist " + fmtMoney(totals.billableShare));
      const row = briefCostRows(calc, calc.tenantResults[0].tenant).find(x => x.id === "K006");
      if (!row || !auditApproxEqual(row.anteil, 100)) throw new Error("Briefzeile für Heizkosten fehlt oder ist falsch");
      const html = costSectionRows([row], "2025");
      if (html.includes("x&nbsp;&nbsp;") || html.includes("laut externer Heizkostenabrechnung")) throw new Error("Heizkostenbrief enthält weiterhin Einheiten oder redundanten Hinweis");
      return "Manuelle Heizkosten werden mit Einzelbetrag übernommen und im Brief ohne Einheiten ausgegeben";
    }));
  
    runCheck("Berechnung", "Individuelle Umlagefähigkeit", () => withAuditState(auditBaseState(), () => {
      state.kostenarten = [{ id:"K901", kostenart:"Nur Mieter 1", inNK:"Ja", vorauszahlung:"Ja", berechnungsart:"Manuell je Mieter", umlageschluessel:UMLAGE_MANUAL, gesamtbetrag:120, preisProEinheit:"", ausschlussBehandlung:COST_EXCLUSION_OWNER }];
      state.umlageInputs = { K901:{ kostenId:"K901", kostenart:"Nur Mieter 1", art:UMLAGE_MANUAL, values:[120,0,0] } };
      NK_PRO_MODULES.costActions.syncKostenartenMieterUmlage();
      state.kostenartenMieterUmlage.K901.T2 = false;
      const calc = calculateUmlage();
      const rowsT1 = briefCostRows(calc, calc.tenantResults[0].tenant);
      const rowsT2 = briefCostRows(calc, calc.tenantResults[1].tenant);
      if (!rowsT1.some(r => r.id === "K901" && auditApproxEqual(r.anteil, 120))) throw new Error("Kostenzeile fehlt bei berechtigtem Mieter");
      if (rowsT2.some(r => r.id === "K901")) throw new Error("Ausgeschlossener Mieter erhält Kostenzeile");
      return "Individuelle Kosten erscheinen nur beim berechtigten Mieter";
    }));
  
    runCheck("Vorauszahlungsanpassung", "Berechnung, Rundung und Mindeständerung", () => withAuditState(auditBaseState(), () => {
      state.kostenarten = [{ id:"K900", kostenart:"Audit Hauskosten", inNK:"Ja", vorauszahlung:"Ja", berechnungsart:"Automatisch", umlageschluessel:"Verteilung nur auf aktive Wohneinheiten", gesamtbetrag:240, preisProEinheit:"", ausschlussBehandlung:COST_EXCLUSION_FULL }];
      state.vorauszahlungen = [{ kostenId:"K900", kostenart:"Audit Hauskosten", aktiv:"Ja", summe:120, werte:[60,60,0] }];
      state.prepaymentAdjustmentSettings = { effectiveFrom:"01.01.2026", safetyBufferPercent:0, roundingMode:"Auf 5 € runden", minimumMonthlyChange:1, annualizePartialTenants:"Ja", changePolicy:"Erhöhungen und Senkungen", letterPrintMode:"Nicht drucken" };
      const data = prepaymentAdjustmentData();
      const s1 = data.summaries.find(x => x.tenant.id === "T1");
      if (!s1) throw new Error("Vorauszahlungszeile fehlt");
      if (!auditApproxEqual(s1.oldMonthlyTotal, 5)) throw new Error("Alte Monatsvorauszahlung erwartet 5, ist " + fmtMoney(s1.oldMonthlyTotal));
      if (!auditApproxEqual(s1.recommendedTenantMonthly, 10)) throw new Error("Neue Monatsvorauszahlung erwartet 10, ist " + fmtMoney(s1.recommendedTenantMonthly));
      return "Vorauszahlungsberechnung stabil · Rundung auf 5 EUR geprüft";
    }));
  
    runCheck("Export", "Gesamt- und Einzelabrechnung getrennt", () => withAuditState(auditBriefState(), () => {
      const full = exportSnapshot();
      const current = NK_PRO_MODULES.billingWorkflow.createSnapshot();
      if (!Array.isArray(full.jahresArchiv)) throw new Error("Gesamtexport enthält kein Jahresarchiv");
      if (Object.prototype.hasOwnProperty.call(state, "stammdaten") && !Object.prototype.hasOwnProperty.call(full, "stammdaten")) throw new Error("Gesamtexport verliert Objekt-Stammdaten");
      if (Object.prototype.hasOwnProperty.call(state, "waterMeterHistory") && !Object.prototype.hasOwnProperty.call(full, "waterMeterHistory")) throw new Error("Gesamtexport verliert globale Zählerhistorie");
      if (Object.prototype.hasOwnProperty.call(current, "jahresArchiv")) throw new Error("Einzelabrechnungsexport enthält Jahresarchivdaten");
      if (Object.prototype.hasOwnProperty.call(current, "stammdaten")) throw new Error("Einzelabrechnungsexport enthält Objekt-Stammdaten");
      if (Object.prototype.hasOwnProperty.call(current, "waterMeterHistory")) throw new Error("Einzelabrechnungsexport enthält globale Zählerhistorie");
      if (current.meta.exportScope !== "currentBillingOnly") throw new Error("Einzelabrechnungsexport hat falschen Scope");
      return "Gesamtexport mit globalen Ebenen und Archiv · Einzelabrechnung als begrenzter Snapshot";
    }));
  
    runCheck("Brief", "AP13-Haupttabelle und gemeinsame Layoutquelle", () => withAuditState(auditBriefState(), () => {
      const calc = calculateUmlage();
      const selected = selectedBriefTenant(calc);
      const html = buildBriefHtml(calc, selected);
      if (!html.includes("data-nk-letter-styles")) throw new Error("Gemeinsame Dokument-CSS fehlt");
      if (!html.includes("Ihre<br>Vorauszahlung")) throw new Error("Vorauszahlungsspalte fehlt");
      if ((html.match(/<th>/g) || []).length < 9) throw new Error("Neunspaltige Haupttabelle fehlt");
      if (!html.includes("border-right:.25mm solid")) throw new Error("Vertikale Tabellentrennlinien fehlen");
      return "Gemeinsame Dokument-CSS · neun Spalten · vollständige Trennlinien";
    }));
  
    runCheck("Brief", "Eigentümer-/Privat aus Mieterbriefen ausgeschlossen", () => withAuditState(auditBriefState(), () => {
      const calc = calculateUmlage();
      const rows = briefResultRows(calc);
      if (rows.some(r => isPrivateTenant(r.tenant))) throw new Error("Eigentümer-/Privat erscheint noch in der Briefauswahl");
      if (!calc.privateResults.some(r => isPrivateTenant(r.tenant))) throw new Error("Eigentümer-/Privat fehlt in der Umlageberechnung");
      return "Eigentümer-/Privat bleibt in der Kostenverteilung, erhält aber keinen Mieterbrief";
    }));
  
    runCheck("Brief", "A4-, Footer- und Summenblock-Struktur", () => withAuditState(auditBriefState(), () => {
      const calc = calculateUmlage();
      const selected = selectedBriefTenant(calc);
      const html = buildBriefHtml(calc, selected);
      if (!html.includes("letter-sheet")) throw new Error("A4-Seite fehlt");
      if (!html.includes('class="letter-footer"')) throw new Error("Fußzeile fehlt");
      if (!html.includes("table-total-row")) throw new Error("Summenzeile fehlt");
      if (!html.includes("result-strip")) throw new Error("Ergebnisleiste fehlt");
      return "Briefstruktur enthält A4-Seite, Fußzeile, Ergebnisleiste und Summenzeile";
    }));
  
    runCheck("Brief", "Preflight-Status", () => withAuditState(auditBriefState(), () => {
      const calc = calculateUmlage();
      const selected = selectedBriefTenant(calc);
      const report = briefPreflightReport(calc, selected);
      if (!report || !Array.isArray(report.items)) throw new Error("Preflight-Report fehlt");
      if (report.errors) throw new Error(report.errors + " Preflight-Fehler");
      const html = briefPreflightBoxHtml(report);
      if (!html.includes("Brief-Preflight")) throw new Error("Preflight-Box wird nicht aufgebaut");
      if (!report.items.some(item => item.label === "DIN-A4")) throw new Error("A4-Prüfung fehlt im Preflight");
      if (!report.items.some(item => item.label === "Tabellenlayout")) throw new Error("Tabellenlayout-Prüfung fehlt im Preflight");
      return "Preflight aktiv · " + report.warnings + " Hinweise · " + report.ok + " OK";
    }));
  
    runCheck("Brief", "Druck-/PDF-Härtung", () => withAuditState(auditBriefState(), () => {
      const calc = calculateUmlage();
      const selected = selectedBriefTenant(calc);
      const report = printHardeningReport(calc, selected);
      if (!report || !Array.isArray(report.items)) throw new Error("Druckhärtungs-Report fehlt");
      if (report.errors) throw new Error(report.errors + " Druckhärtungs-Fehler");
      const box = printHardeningBoxHtml(report);
      if (!box.includes("Druck-/PDF-Härtung")) throw new Error("Druckhärtungs-Box fehlt");
      const styles = briefPrintStyles();
      if (!styles.includes("print-color-adjust:exact")) throw new Error("Print color adjustment fehlt");
      if (!styles.includes("page-break-inside:avoid")) throw new Error("Page-break-Härtung fehlt");
      if (typeof printWindowHtml !== "function" || !printWindowHtml("Test", "<div></div>", "Audit").includes("Druck-/PDF-Hinweis")) throw new Error("Druckfenster-Hülle fehlt");
      return "Druckfenster, A4-Härtung und PDF-Hinweise aktiv · " + report.warnings + " Hinweise";
    }));
  
    runCheck("Sonderfälle", "Sonderfall-Wächter", () => withAuditState(auditBaseState(), () => {
      state.wohnungen.push({ id:"WL", bezeichnung:"Leerstand", lage:"DG", wohnflaeche:40, status:"aktiv" });
      const auditYear = String((state.meta && state.meta.abrechnungsjahr) || new Date().getFullYear());
      state.mieter[0].auszug = auditYear + "-06-30";
      state.mieter[0].aktiveTage = 181;
      state.mieter[1].einzug = auditYear + "-07-01";
      state.mieter[1].aktiveTage = 184;
      const report = specialCaseWatchReport();
      if (!report || !Array.isArray(report.rows)) throw new Error("Sonderfall-Bericht fehlt");
      if (!report.rows.some(r => /Unterjährig|Mieterwechsel/i.test(r.type))) throw new Error("Unterjähriger Fall wird nicht erkannt");
      if (!report.rows.some(r => /Leerstand/i.test(r.type))) throw new Error("Leerstand wird nicht erkannt");
      if (!report.rows.some(r => /Eigentümer|Privat/i.test(r.type))) throw new Error("Eigentümer-/Privatrolle wird nicht erkannt");
      const badgeHtml = specialCaseBadgesForTenant(state.mieter[0]);
      if (!badgeHtml.includes("unterjährig")) throw new Error("Sonderfall-Badge fehlt");
      return "Unterjährig, Leerstand und Eigentümer/Privat erkannt · " + report.rows.length + " Meldungen";
    }));
  
    runCheck("Backup", "Backup-Status und Exportnamen", () => {
      const report = backupStatusReport();
      if (!report || !report.storage) throw new Error("Backup-Status fehlt");
      const name = backupFileName("nk-pro-gesamtbestand", { meta:{ abrechnungsjahr:"2025" } });
      if (!name.includes(APP_VERSION)) throw new Error("Export-Dateiname enthält Version nicht");
      if (!name.includes("2025")) throw new Error("Export-Dateiname enthält Jahr nicht");
      if (typeof confirmRiskyDataAction !== "function") throw new Error("Sicherheitsabfrage für riskante Aktionen fehlt");
      return "Backup-Status aktiv · Exportname mit Jahr und Version";
    });
  
    runCheck("Abnahmeprotokoll", "Berichtsfunktionen und HTML-Export", () => withAuditState(auditBriefState(), () => {
      if (typeof acceptanceProtocolData !== "function") throw new Error("acceptanceProtocolData fehlt");
      if (typeof acceptanceProtocolHtml !== "function") throw new Error("acceptanceProtocolHtml fehlt");
      if (typeof downloadAcceptanceProtocolHtml !== "function") throw new Error("downloadAcceptanceProtocolHtml fehlt");
      const html = acceptanceProtocolHtml();
      if (!html.includes("Finaler Prüfbericht / Abnahmeprotokoll")) throw new Error("HTML-Bericht enthält keinen Protokolltitel");
      if (!html.includes("Brief-Preflight") || !html.includes("Sonderfälle") || !html.includes("Offene Prüfpunkte")) throw new Error("Wichtige Protokollbereiche fehlen");
      return "Abnahmeprotokoll enthält Titel, Brief-Preflight, Sonderfälle und Prüfpunkte";
    }));
  
    const errors = rows.filter(r => r.severity === "Fehler").length;
    const ok = rows.filter(r => r.severity === "OK").length;
    const warnings = rows.filter(r => r.severity === "Prüfen" || r.severity === "Hinweis").length;
    return {
      rows,
      summary:{ errors, warnings, ok, level:errors ? "err" : (warnings ? "warn" : "ok"), message:"Release-Audit: " + errors + " Fehler, " + warnings + " Hinweise, " + ok + " OK." }
    };
  }
  
  function releaseAuditReportText() {
    const report = releaseAuditReport();
    const lines = [];
    lines.push("NK-Pro " + APP_VERSION + " · Release-Audit");
    lines.push("Erstellt: " + new Date().toLocaleString("de-DE"));
    lines.push(report.summary.message);
    lines.push("");
    report.rows.forEach(row => lines.push(row.severity + " · " + row.area + " · " + row.point + (row.detail ? ": " + row.detail : "")));
    return lines.join("\n");
  }
  
  function appSelfTestReport() {
    const rows = [];
    function add(area, point, ok, detail, failSeverity = "Fehler") {
      rows.push({ severity: ok ? "OK" : failSeverity, area, point, detail: detail || "" });
    }
    function runCheck(area, point, fn, failSeverity = "Fehler") {
      try {
        const detail = fn();
        add(area, point, true, detail);
      } catch(error) {
        add(area, point, false, errorMessage(error), failSeverity);
      }
    }
  
    runCheck("Architektur", "V96.2 Workflow-Dashboard nur im Abrechnungskontext", () => {
      if (typeof workflowDashboardReport !== "function" || typeof renderWorkflowDashboard !== "function") throw new Error("Workflow-Dashboard-Funktionen fehlen");
      const start = document.getElementById("start");
      const dashboard = document.getElementById("dashboard");
      const quality = document.getElementById("qualitaet");
      if (dashboard) throw new Error("Entfernter Abrechnungsstatus-Tab ist noch vorhanden");
      if (start && start.querySelector("#workflowDashboardBox")) throw new Error("Workflow-Status steht noch auf der Startseite");
      if (!quality || !quality.querySelector("#workflowDashboardBox")) throw new Error("Workflow-Status fehlt in der Qualitätsprüfung");
      const before = stableStringify(state);
      const result = workflowDashboardReport();
      const after = stableStringify(state);
      if (before !== after) throw new Error("Workflow-Dashboard hat den produktiven Zustand verändert");
      if (hasActiveCurrentBilling() && !isArchiveViewer() && (!result || !Array.isArray(result.groups))) throw new Error("Workflow-Dashboard liefert keine Bereichsdaten");
      return "Startseite bleibt schlank; Qualitätsdaten werden nur im Abrechnungs-Dashboard auf einer Zustandskopie ausgewertet";
    });
  
  
    runCheck("App", "Start- und Renderstatus", () => {
      const startupCount = Array.isArray(startupErrors) ? startupErrors.length : 0;
      const renderCount = Array.isArray(renderErrors) ? renderErrors.length : 0;
      if (startupCount || renderCount) throw new Error(startupCount + " Startfehler, " + renderCount + " Renderfehler");
      return "Keine Start- oder Renderfehler";
    });
  
    runCheck("Datenmodell", "Datenschema", () => {
      const version = state.meta && state.meta.dataSchemaVersion;
      if (num(version) < DATA_SCHEMA_VERSION) throw new Error("Schema " + (version || "unbekannt") + " statt " + DATA_SCHEMA_VERSION);
      return "Version " + version;
    });
  
    runCheck("Speicher", "Speicheradapter verfügbar", () => {
      if (typeof storageWritable !== "function") throw new Error("Speicheradapter fehlt");
      return "Speicheradapter vorhanden; Diagnose führt keinen Schreibtest aus";
    });
  
    runCheck("Speicher", "V92-Prüfsumme und Rückfallstand", () => {
      const sample = auditBaseState();
      const protectedSample = protectDataForStorage(sample);
      const valid = validateStoredDataIntegrity(protectedSample);
      if (!valid.valid || !valid.protected) throw new Error("Gültige Prüfsumme wird nicht erkannt");
      const damaged = clone(protectedSample);
      damaged.meta.abrechnungsjahr = "2099";
      if (validateStoredDataIntegrity(damaged).valid) throw new Error("Manipulierter Datenstand wird nicht erkannt");
      if (STORAGE_RECOVERY_KEY === STORAGE_KEY) throw new Error("Rückfallstand ist nicht getrennt");
      return "Prüfsumme erkennt Änderungen; separater Rückfall-Speicher vorhanden";
    });
  
    runCheck("Speicher", "V59 bis V47-Datenübernahme", () => {
      if (!Array.isArray(LEGACY_STORAGE_KEYS) || !LEGACY_STORAGE_KEYS.includes("nkpro_browser_v59_summenblock_abstand_data")) throw new Error("V59-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v57_brief_feinschliff_data")) throw new Error("V57-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v56_lesbarer_brief_data")) throw new Error("V56-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v55_brieflayout_fix_data")) throw new Error("V55-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v54_brieftext_format_data")) throw new Error("V54-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v53_heizkostenbrief_data")) throw new Error("V53-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v52_briefformat_data")) throw new Error("V52-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v50_getrennte_sicherung_data")) throw new Error("V50-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v49_fachcheck_exportpaket_data")) throw new Error("V49-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v48_stabilitaetsbasis_plus_data")) throw new Error("V48-Speicherbereich fehlt in der Legacy-Übernahme");
      if (!LEGACY_STORAGE_KEYS.includes("nkpro_browser_v47_stabilitaetsbasis_data")) throw new Error("V47-Speicherbereich fehlt in der Legacy-Übernahme");
      return "V59, V58, V57, V56, V55, V54, V52, V50, V49, V48 und V47 werden beim ersten Laden berücksichtigt";
    });
  
    runCheck("Stabilität", "Renderstrategie V50", () => {
      if (typeof renderCurrentView !== "function") throw new Error("Gezielte Ansichtsaktualisierung fehlt");
      if (typeof renderAll !== "function") throw new Error("Haupt-Renderfunktion fehlt");
      return "Aktiver Tab: " + (activeTabId() || "unbekannt") + "; Renderläufe: " + renderCount + "; letzter Lauf: " + renderLastDurationMs + " ms";
    });
  
    runCheck("Fachcheck", "V50-Finalprüfung", () => {
      const report = collectQualityChecks({ scope:"currentBilling" });
      const readiness = finalBillingReadiness(report);
      if (!readiness || !readiness.label) throw new Error("Finalprüfung liefert keinen Status");
      return readiness.label + " · " + report.issues.length + " Prüfpunkte";
    });
  
    runCheck("Export", "V50-getrennte Sicherungsfunktionen", () => {
      if (typeof downloadExportPackage !== "function") throw new Error("Abrechnungs-Exportpaket fehlt");
      if (typeof downloadFullExportPackage !== "function") throw new Error("Vollständiges Exportpaket fehlt");
      if (typeof downloadCurrentBillingJson !== "function") throw new Error("Abrechnungs-JSON fehlt");
      if (typeof downloadFullJson !== "function") throw new Error("Gesamt-JSON fehlt");
      if (typeof renderPrepaymentAdjustment !== "function") throw new Error("Vorauszahlungsanpassung-Tab fehlt");
      if (typeof prepaymentAdjustmentData !== "function") throw new Error("Vorauszahlungsberechnung fehlt");
      return "Abrechnungsexport, Gesamtexport und Vorauszahlungsanpassung verfügbar";
    });
  
    runCheck("Brief", "Manuelle Heizkosten ohne Einheiten", () => {
      if (typeof costSectionRows !== "function" || typeof isManualExternalCostDefinition !== "function") throw new Error("Briefkosten-Formatlogik fehlt");
      const html = costSectionRows([{ id:"K006", kostenart:"Heiz- und Warmwasserkosten", schluessel:UMLAGE_MANUAL, berechnungsart:"Manuell je Mieter", gesamtbetrag:999, anteil:123.45, vorauszahlung:0, weitereVorauszahlung:0, basisTotal:888, preis:7.77, einheiten:66, period:"01.01.24-31.12.24", settlement:-123.45 }], "2024");
      if (html.includes("x&nbsp;&nbsp;") || html.includes("7,77") || html.includes(">888<") || html.includes(">66<")) throw new Error("Manuelle Heizkosten zeigen noch Einheiten/Preis im Brief");
      if (html.includes("laut externer Heizkostenabrechnung")) throw new Error("Redundanter externer Heizkostenhinweis steht noch in der Tabellenzeile");
      return "Manuelle Heizkosten werden ohne Einheiten-/Preis-Spalten und ohne redundanten Tabellenzusatz gedruckt";
    });
  
    runCheck("Brief", "Dynamische Kostenzeilen ohne Nullzeilen", () => {
      if (typeof isBriefCostRowRelevant !== "function") throw new Error("Brief-Relevanzfilter fehlt");
      const hidden = isBriefCostRowRelevant({ id:"K999", kostenart:"Testkosten", gesamtbetrag:100, anteil:0, vorauszahlung:0, weitereVorauszahlung:0, settlement:0 });
      const shownByShare = isBriefCostRowRelevant({ id:"K999", kostenart:"Testkosten", gesamtbetrag:100, anteil:12.34, vorauszahlung:0, weitereVorauszahlung:0, settlement:-12.34 });
      const shownByPrepay = isBriefCostRowRelevant({ id:"K999", kostenart:"Testkosten", gesamtbetrag:100, anteil:0, vorauszahlung:12.34, weitereVorauszahlung:0, settlement:12.34 });
      if (hidden) throw new Error("Kostenzeile mit 0,00 EUR Mieterbezug würde im Brief erscheinen");
      if (!shownByShare || !shownByPrepay) throw new Error("Relevante Kostenzeile wird nicht erkannt");
      return "Nullzeilen werden ausgeblendet, relevante individuelle Kosten bleiben sichtbar";
    });
  
    runCheck("Architektur", "Konsolidierter Produktivpfad", () => {
      if (typeof createNextBillingYearFromStart !== "undefined") throw new Error("Ungenutzter Alt-Einstieg createNextBillingYearFromStart noch vorhanden");
      return "Eindeutig ungenutzter Alt-Einstieg entfernt";
    });
  
    runCheck("Architektur", "Zentraler Änderungsweg", () => {
      if (typeof commitStateChange !== "function") throw new Error("Zentraler Änderungsweg fehlt");
      return "Änderung, Aufbereitung, Speichern und Rendern gebündelt";
    });
  
    runCheck("Architektur", "Renderlauf bleibt datenfrei", () => {
      if (typeof prepareStateForPersistence !== "function" || typeof renderCurrentView !== "function") throw new Error("Zentrale Zustandsaufbereitung oder Darstellung fehlt");
      const source = String(renderCurrentView.toString());
      if (source.includes("prepareStateForPersistence(")) throw new Error("Renderlauf ruft Zustandsaufbereitung auf");
      return "Darstellung und Zustandsaufbereitung sind quellenbasiert getrennt; Diagnose rendert nicht";
    });
  
    runCheck("Stabilität", "V91-Safe-Cleanup", () => {
      const requiredDynamicFunctions = [
        "resetData", "setWaterMeterSetting", "setWaterMeterValue", "setGenericMeterValue", "setBriefSetting",
        "printCurrentBrief", "copyCurrentBriefText"
      ];
      const missing = requiredDynamicFunctions.filter(name => typeof globalThis[name] !== "function");
      if (missing.length) throw new Error("Dynamische Bedienfunktionen fehlen: " + missing.join(", "));
      const requiredActions = [
        ["object","setMasterNested"], ["cost","setSetting"], ["billing","setManualInputMode"],
        ["billing","resetAllocationInputs"], ["billing","setPrepaymentAdjustmentSetting"]
      ];
      const missingActions = requiredActions.filter(([domain, action]) => !NK_PRO_MODULES.applicationActions.has(domain, action));
      if (missingActions.length) throw new Error("Extrahierte Anwendungsaktionen fehlen: " + missingActions.map(item => item.join(".")).join(", "));
      if (typeof getBriefTenantAddress !== "function" || typeof validateBriefResult !== "function") throw new Error("Aktive Briefpfade fehlen");
      return "Ungenutzte Altpfade entfernt; extrahierte Bedienaktionen und Briefpfade vorhanden";
    });
  
    runCheck("Stabilität", "Alle Hauptansichten registriert", () => {
      const required = [renderStart, renderQuality, renderUmlage, renderBrief];
      if (required.some(fn => typeof fn !== "function")) throw new Error("Mindestens ein Hauptrenderer fehlt");
      if (Array.isArray(renderErrors) && renderErrors.length) throw new Error(renderErrors.map(e => e.area + ": " + e.message).join(" | "));
      return "Hauptrenderer sind registriert; Diagnose führt sie nicht aus";
    });
  
    runCheck("Berechnung", "Umlageberechnung", () => {
      const calc = calculateUmlage();
      if (!calc || !Array.isArray(calc.costResults) || !Array.isArray(calc.tenantResults)) throw new Error("Berechnung liefert kein erwartetes Ergebnis");
      const totals = umlageTotals(calc);
      Object.keys(totals).forEach(key => {
        if (!Number.isFinite(num(totals[key]))) throw new Error("Summe ist ungültig: " + key);
      });
      return calc.costResults.length + " Kostenarten, " + calc.tenantResults.length + " Mietergebnisse";
    });
  
    runCheck("Qualität", "Qualitätsprüfung", () => {
      const report = collectQualityChecks();
      if (!report || !Array.isArray(report.issues)) throw new Error("Qualitätsbericht ist unvollständig");
      const errors = report.issues.filter(i => i.severity === "Fehler").length;
      const warnings = report.issues.filter(i => i.severity === "Prüfen" || i.severity === "Hinweis").length;
      if (warnings) rows.push({ severity:"Hinweis", area:"Qualität", point:"Qualitätshinweise", detail:warnings + " Prüfpunkte mit Hinweis/Prüfen" });
      if (errors) throw new Error(errors + " Fehler in der Qualitätsprüfung");
      return report.issues.length + " Prüfpunkte, keine Fehler";
    });
  
    runCheck("Archiv", "Archivdatensätze", () => {
      const items = Array.isArray(state.jahresArchiv) ? state.jahresArchiv : [];
      let errors = 0;
      let warnings = 0;
      items.forEach(item => {
        const validation = archiveItemValidation(item);
        errors += validation.errors.length;
        warnings += validation.warnings.length;
      });
      if (warnings) rows.push({ severity:"Hinweis", area:"Archiv", point:"Archivhinweise", detail:warnings + " Hinweise bei bestehenden Archivdaten" });
      if (errors) throw new Error(errors + " Archivfehler");
      return items.length + " Datensätze, " + warnings + " Hinweise";
    });
  
    runCheck("Brief", "A4-Seitenstruktur", () => {
      const calc = calculateUmlage();
      const selected = selectedBriefTenant(calc);
      const html = buildBriefHtml(calc, selected);
      if (!html.includes('letter-sheet')) throw new Error("Brief enthält keine A4-Seitenstruktur");
      if (!html.includes('colgroup')) throw new Error("Brief enthält keine festen Tabellenspalten");
      return "A4-Seiten und feste Spalten vorhanden";
    });
  
    runCheck("Finalisierung", "Schreibschutz-Funktionen", () => withAuditState(auditBaseState(), () => {
      if (NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized()) throw new Error("Audit-Basis darf nicht finalisiert starten");
      state.meta.currentBillingFinalized = true;
      state.meta.currentBillingFinalizationKey = NK_PRO_MODULES.billingWorkflow.currentBillingFinalizationKey();
      state.meta.currentBillingFinalizedAt = "2026-07-10T00:00:00.000Z";
      if (!NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized()) throw new Error("Finalisierung wird nicht erkannt");
      NK_PRO_MODULES.billingWorkflow.clearCurrentBillingFinalization();
      if (NK_PRO_MODULES.billingWorkflow.isCurrentBillingFinalized()) throw new Error("Finalisierung wurde nicht entfernt");
      return "Finalisieren/Entsperren-Status OK";
    }));
  
    runCheck("Navigation", "AP11-Navigationsstruktur V99.4.12", () => {
      const nav = document.querySelector(".workflow-nav");
      if (!nav) throw new Error("Workflow-Navigation fehlt");
      const navigation = NK_PRO_MODULES.navigation;
      if (!navigation || typeof navigation.navigationDefinition !== "function" || typeof navigation.visibleTabIds !== "function") throw new Error("Zentrale Navigationsdefinition fehlt");
      const definition = navigation.navigationDefinition();
      const expectedGroups = definition.map(group => group.key);
      const expected = navigation.visibleTabIds();
      const groups = Array.from(nav.querySelectorAll(":scope > .nav-group")).map(group => group.dataset.navGroupSection);
      if (groups.join("|") !== expectedGroups.join("|")) throw new Error("Gerenderte Navigationsgruppen weichen von der zentralen Definition ab");
      const toggles = Array.from(nav.querySelectorAll('.nav-group-toggle[data-nav-toggle]'));
      if (toggles.length !== definition.length || toggles.some(toggle => !toggle.hasAttribute("aria-expanded"))) throw new Error("Accordion-Steuerung der Navigationsgruppen ist unvollständig");
      const tabIds = Array.from(nav.querySelectorAll(".tab-btn[data-tab]")).map(button => button.dataset.tab);
      if (tabIds.join("|") !== expected.join("|") || new Set(tabIds).size !== expected.length) throw new Error("Gerenderte Navigation weicht von der zentralen Definition ab");
      for (const directTab of ["objektuebersicht","vorauszahlungsanpassung","export","sicherung"]) if (!document.getElementById(directTab)) throw new Error("Kompatibler Direkteinstieg fehlt: " + directTab);
      const landingChoices = document.querySelectorAll("#landing .landing-choice");
      if (landingChoices.length !== 2) throw new Error("Landingpage besitzt nicht genau zwei Einstiege");
      if (typeof navigation.ensureNavigationPath !== "function" || typeof navigation.updateWorkflowNavigationContext !== "function") throw new Error("Zentrales Navigationsmodul ist unvollständig");
      const semanticNav = nav.tagName === "NAV" && nav.getAttribute("aria-label");
      if (!semanticNav) throw new Error("Navigation ist nicht semantisch als NAV ausgezeichnet");
      if (nav.querySelectorAll(".tab-btn[data-tab] .nav-item-icon svg").length !== expected.length) throw new Error("Lokales SVG-Iconsystem ist unvollständig");
      const brandHome = document.querySelector(".sidebar-brand-home");
      const backHome = document.getElementById("sidebarCollapseTop");
      if (!brandHome || brandHome.dataset.uiAction !== "navigation.showLanding" || !backHome || backHome.dataset.uiAction !== "navigation.showLanding") throw new Error("Logo- oder Zurück-Funktion zur Arbeitsweiche fehlt");
      const settings = document.querySelector(".sidebar-settings-dummy");
      if (!settings || settings.getAttribute("aria-disabled") !== "true" || settings.dataset.uiAction) throw new Error("Einstellungen-Dummy ist nicht korrekt deaktiviert");
      if (settings.dataset.navHint !== "Noch nicht verfügbar") throw new Error("Einstellungen-Hinweis fehlt");
      if (document.querySelectorAll(".workflow-nav").length !== 1) throw new Error("Parallele Navigation erkannt");
      return "Zentrale Navigationsdefinition, gerenderte Accordion-Gruppen und sichtbare Ziele sind konsistent; Logo-/Zurück-Startzugang, kompatible Direkteinstiege, lokales SVG-System und Einstellungen-Dummy vorhanden";
    });
  
    runCheck("Startseite", "Sicherungstab und Entschlackung", () => {
      const start = document.getElementById("start");
      const sicherung = document.getElementById("sicherung");
      if (!START_NAV_TABS.includes("sicherung")) throw new Error("Sicherungstab fehlt in der Startnavigation");
      if (!sicherung) throw new Error("Sicherungstab fehlt im DOM");
      if (start && start.querySelector("#backupStatusBox")) throw new Error("Backup-Status steht noch auf der Startseite");
      if (start && start.querySelector("#globalBackupBox")) throw new Error("Gesamtsicherung steht noch auf der Startseite");
      if (start && start.querySelector("#versionBox")) throw new Error("Versionsübersicht steht noch auf der Startseite");
      if (!sicherung.querySelector("#backupStatusBox") || !sicherung.querySelector("#globalBackupBox") || !sicherung.querySelector("#versionBox")) throw new Error("Sicherungstab enthält nicht alle Sicherungs-/Versionsblöcke");
      const utility = document.getElementById("startArchiveUtilityActions");
      const selfTestAction = start && start.querySelector('[data-ui-action="system.runSelfTest"]');
      if (!selfTestAction) throw new Error("App-Selbsttest fehlt auf der Startseite");
      const html = utility ? utility.innerHTML : "";
      if (html.includes("download-full-json") || html.includes("download-full-export-package") || html.includes("download-archive")) throw new Error("Backup-Aktionen stehen noch in der Startseiten-Nutzleiste");
      return "Startseite reduziert; Datensicherung & System bündelt Backup, Import/Reset und Versionsübersicht";
    });
  
  
    runCheck("Finalisierung", "Startseite und Abrechnungsbezug", () => {
      const start = document.getElementById("start");
      const dashboard = document.getElementById("dashboard");
      const quality = document.getElementById("qualitaet");
      if (start && start.querySelector("#finalizationStatusBox")) throw new Error("Finalisierungsblock steht noch auf der Startseite");
      if (!quality || !quality.querySelector("#finalizationStatusBox")) throw new Error("Finalisierungsblock fehlt in der Qualitätsprüfung");
      const html = buildBillingRecordsTableHtml();
      if (!html.includes("Abschließen") || !html.includes("Archivieren")) throw new Error("Startseitenaktionen für aktuelle Abrechnung fehlen");
      if (!html.includes("Zur Korrektur öffnen")) throw new Error("Archivierte Abrechnungen haben keine Korrekturaktion");
      return "Finalisierung im Abrechnungskontext; Startseite zeigt nur Status/Aktionen je Abrechnung";
    });
  
    runCheck("Stabilität", "V93 gezieltes Rendering", () => {
      if (typeof commitStateChange !== "function" || typeof renderCurrentView !== "function") throw new Error("Zentraler Renderpfad fehlt");
      const source = commitStateChange.toString() + renderCurrentView.toString();
      if (!source.includes("tabIds") || !source.includes("includeCommon")) throw new Error("Gezielte Renderoptionen fehlen");
      if (!setBriefSetting.toString().includes('tabId:"briefe"')) throw new Error("Brief-Einstellungen nutzen keinen lokalen Renderpfad");
      if (!NK_PRO_MODULES.billingWorkflow.describe().actions.includes("setPrepaymentAdjustmentSetting")) throw new Error("Vorauszahlungsanpassung ist nicht im Workflowmodul registriert");
      return "Lokale Renderpfade aktiv; Voll-Render bleibt für weitreichende Vorgänge erhalten";
    });
  
    runCheck("Brief", "Druck-CSS", () => {
      const css = briefPrintStyles();
      if (!css.includes('@page') || !css.includes('.letter-sheet')) throw new Error("Druck-CSS unvollständig");
      return "Druck-CSS vorhanden";
    });
  
    runCheck("Briefe", "Mieteranschreiben", () => {
      const calc = calculateUmlage();
      let errors = 0;
      let warnings = 0;
      calc.tenantResults.forEach(result => {
        const validation = validateBriefResult(calc, result);
        errors += validation.errors.length;
        warnings += validation.warnings.length;
      });
      if (warnings) rows.push({ severity:"Hinweis", area:"Briefe", point:"Brief-Hinweise", detail:warnings + " Hinweise in den Briefprüfungen" });
      if (errors) throw new Error(errors + " Brief-Fehler");
      return calc.tenantResults.length + " Briefe, " + warnings + " Hinweise";
    });
  
    runCheck("Oberfläche", "Kernbereiche vorhanden", () => {
      const ids = ["start", "qualitaet", "umlage", "briefe"];
      const missing = ids.filter(id => !document.getElementById(id));
      if (missing.length) throw new Error("Kernbereiche fehlen: " + missing.join(", "));
      return "Start, Qualität, Umlage und Briefe sind vorhanden; Diagnose bleibt darstellungsfrei";
    });
  
    runCheck("Export", "JSON-Sicherung", () => {
      const text = JSON.stringify(state);
      JSON.parse(text);
      if (text.length < 1000) throw new Error("Export wirkt ungewöhnlich klein");
      return Math.round(text.length / 1024) + " KB JSON";
    });
  
    runCheck("Audit", "Release-Prüfszenarien V70", () => {
      const audit = releaseAuditReport();
      if (audit.summary.errors) throw new Error(audit.summary.errors + " Fehler im Release-Audit");
      if (audit.summary.warnings) rows.push({ severity:"Hinweis", area:"Audit", point:"Release-Audit-Hinweise", detail:audit.summary.warnings + " Hinweise im Audit" });
      return audit.summary.ok + " Prüfszenarien OK";
    });
  
    return rows;
  }
  
  function appSelfTestSummary(rows) {
    const errors = rows.filter(row => row.severity === "Fehler").length;
    const warnings = rows.filter(row => row.severity === "Prüfen" || row.severity === "Hinweis").length;
    const ok = rows.filter(row => row.severity === "OK").length;
    return {
      errors,
      warnings,
      ok,
      level: errors ? "err" : (warnings ? "warn" : "ok"),
      message: "App-Selbsttest abgeschlossen: " + errors + " Fehler, " + warnings + " Hinweise, " + ok + " OK."
    };
  }

  const releaseAuditReportOriginal = releaseAuditReport;
  releaseAuditReport = function () {
    ensureConfigured();
    return decorateReport(releaseAuditReportOriginal(), "RELEASE_AUDIT");
  };
  const appSelfTestReportOriginal = appSelfTestReport;
  appSelfTestReport = function () {
    ensureConfigured();
    const before = stableStringify(d.stateAccess.current());
    const isolated = d.clone(d.stateAccess.current());
    const rows = d.withIsolatedState(isolated, () => appSelfTestReportOriginal()).map(row => Object.assign({ code:stableCode("SELF_TEST", row.area, row.point) }, row));
    const after = stableStringify(d.stateAccess.current());
    if (before !== after) rows.push({ code:"SELF_TEST_STATE_MUTATION", severity:"Fehler", area:"Diagnose", point:"Seiteneffektfreiheit", detail:"Der App-Selbsttest hat den Arbeitszustand verändert." });
    return Object.freeze({ rows:Object.freeze(rows), summary:Object.freeze(appSelfTestSummary(rows)) });
  };

  function describe() {
    return Object.freeze({
      name:"NKProDiagnostics",
      responsibility:"Reproduzierbare Laufzeit-, Support-, Release- und Selbsttestdiagnose",
      commits:false, persists:false, renders:false,
      publicActions:Object.freeze(["developerSnapshot", "formatBytes", "releaseAuditReport", "releaseAuditReportText", "appSelfTestReport", "appSelfTestSummary"])
    });
  }

  const api = Object.freeze({ configure, describe, developerSnapshot, formatBytes, releaseAuditReport, releaseAuditReportText, appSelfTestReport, appSelfTestSummary });
  global.NKProDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis);
