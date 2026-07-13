(function(global) {
  "use strict";

  // Fachliche Dokument-, Brief-, Prüf- und View-Model-Daten.
  // app.js behält nur kleine globale Kompatibilitätsweiterleitungen.

  function settlementInfoForResult(result, tenant) {
    const correction = num(result && (result.correction !== undefined ? result.correction : (tenant && tenant.vorjahresKorrektur)));
    const signedSaldo = num(result && result.prepayments) + correction - num(result && result.costShare);
    const amount = Math.abs(signedSaldo);
    const isBalanced = amount < 0.005;
    const isNachzahlung = signedSaldo < -0.004;
    const isGuthaben = signedSaldo > 0.004;
    return {
      signedSaldo,
      amount: isBalanced ? 0 : amount,
      type: isBalanced ? "Ausgeglichen" : (isNachzahlung ? "Nachzahlung" : "Guthaben"),
      finalLabel: isBalanced ? "Abrechnungsergebnis ausgeglichen" : (isNachzahlung ? "Ihre Nachzahlung an die Vermieterin" : "Ihr Guthaben"),
      isNachzahlung,
      isGuthaben,
      isBalanced
    };
  }

  function finalBillingReadiness(report) {
    const issues = report && Array.isArray(report.issues) ? report.issues : [];
    const errors = issues.filter(i => i.severity === "Fehler");
    const warnings = issues.filter(i => i.severity === "Prüfen");
    const hints = issues.filter(i => i.severity === "Hinweis");
    let level = "ok";
    let label = "Final prüfbar";
    let message = "Keine blockierenden Fehler gefunden. Hinweise trotzdem vor Versand durchsehen.";
    if (errors.length) {
      level = "err";
      label = "Nicht abrechnungsreif";
      message = "Es gibt blockierende Fehler. Bitte zuerst beheben, dann erneut prüfen.";
    } else if (warnings.length) {
      level = "warn";
      label = "Mit Prüfpunkten";
      message = "Keine technischen Blocker, aber fachliche Prüfpunkte offen. Vor Versand bewusst entscheiden.";
    }
    return { level, label, message, errors, warnings, hints };
  }

  function acceptanceProtocolData() {
    const quality = global.NKProQualityAssurance.inspect({ scope:"currentBilling" });
    const readiness = finalBillingReadiness(quality);
    const calc = calculateUmlage();
    const totals = umlageTotals(calc);
    const backup = (typeof backupStatusReport === "function") ? backupStatusReport() : null;
    const special = global.NKProQualityAssurance ? global.NKProQualityAssurance.specialCases() : null;
    const brief = (typeof currentBriefPreflightReport === "function") ? currentBriefPreflightReport() : null;
    const finalization = global.NKProBillingWorkflow.currentBillingFinalizationReport();
    const issues = Array.isArray(quality.issues) ? quality.issues : [];
    const errors = issues.filter(i => i.severity === "Fehler").length;
    const warnings = issues.filter(i => i.severity === "Prüfen").length;
    const hints = issues.filter(i => i.severity === "Hinweis").length;
    return { quality, readiness, calc, totals, backup, special, brief, finalization, counts:{ errors, warnings, hints } };
  }

  function acceptanceLevel(data) {
    if (!data) return "warn";
    if (data.counts && data.counts.errors) return "err";
    if (data.readiness && data.readiness.level === "err") return "err";
    if (data.brief && data.brief.level === "err") return "err";
    if (data.backup && data.backup.level === "err") return "err";
    if (data.special && data.special.level === "err") return "err";
    if ((data.counts && data.counts.warnings) || (data.readiness && data.readiness.level === "warn") || (data.brief && data.brief.level === "warn") || (data.backup && data.backup.level === "warn") || (data.special && data.special.level === "warn")) return "warn";
    return "ok";
  }

  function acceptanceLabel(level) {
    return level === "err" ? "Nicht abnahmebereit" : (level === "warn" ? "Abnahme mit Prüfpunkten" : "Abnahmebereit");
  }

  function validateBriefResult(calc, result) {
    const errors = [];
    const warnings = [];
    ensureBriefSettings();
    const s = state.briefSettings || {};
    if (!result || !result.tenant) {
      errors.push("Kein Empfänger für einen Brief ausgewählt.");
      return { errors, warnings };
    }
    const tenant = result.tenant;
    global.NKProQualityAssurance.missingBriefFieldsForTenant(tenant).forEach(field => errors.push("Mieterdaten unvollständig: " + field));
    if (!s.briefdatum) errors.push("Briefdatum fehlt.");
    if (!s.ort) warnings.push("Ort im Briefkopf fehlt.");
    if (!s.absenderName) errors.push("Vermietername fehlt.");
    if (!s.absenderStrasse || !s.absenderOrt) warnings.push("Vermieteradresse ist unvollständig.");
    if (!s.bankverbindung) warnings.push("Bankverbindung fehlt.");
    if (!s.introText) warnings.push("Einleitungstext fehlt.");
    if (!s.gruss || !s.signatur) warnings.push("Grußformel oder Signatur fehlt.");
  
    const costRows = briefCostRows(calc, tenant);
    if (!costRows.length) warnings.push("Brief enthält keine Kostenzeilen.");
    const rowShare = costRows.reduce((sum,row) => sum + num(row.anteil), 0);
    if (Math.abs(rowShare - num(result.costShare)) > 0.02) errors.push("Kostenanteile im Brief weichen von der Umlage ab: " + fmtMoney(rowShare) + " vs. " + fmtMoney(result.costShare));
    const rowPrepay = costRows.reduce((sum,row) => sum + num(row.vorauszahlung) + num(row.weitereVorauszahlung), 0);
    if (Math.abs(rowPrepay - num(result.prepayments)) > 0.02) warnings.push("Vorauszahlungen im Brief weichen von der Umlage ab: " + fmtMoney(rowPrepay) + " vs. " + fmtMoney(result.prepayments));
    const signedSaldo = num(result.prepayments) + num(result.correction || tenant.vorjahresKorrektur) - num(result.costShare);
    if (!Number.isFinite(signedSaldo)) errors.push("Briefsaldo ist nicht berechenbar.");
    return { errors, warnings };
  }

  function longestTextLineLength(value) {
    return String(value || "").split(/\r?\n/).reduce((max,line) => Math.max(max, line.trim().length), 0);
  }

  function compactTextLength(value) {
    return String(value || "").replace(/\s+/g, " ").trim().length;
  }

  function briefLongTextRisks(costRows, tenant, settings, includePrepaymentText = false) {
    const risks = [];
    const longCostNames = (Array.isArray(costRows) ? costRows : []).filter(row => compactTextLength(row.kostenart) > 34).map(row => row.kostenart);
    if (longCostNames.length) risks.push("Lange Kostenarten können im Tabellenkörper knapp werden: " + longCostNames.slice(0,3).join(", ") + (longCostNames.length > 3 ? " …" : ""));
    if (compactTextLength(tenant && tenant.name) > 34) risks.push("Empfängername ist lang; Briefkopf im Druck prüfen.");
    const addressLineLength = longestTextLineLength(tenantMailingAddress(tenant));
    if (addressLineLength > 42) risks.push("Empfängeradresse enthält eine lange Zeile (" + addressLineLength + " Zeichen); Fensterbrief/Druckbild prüfen.");
    if (compactTextLength(settings && settings.bankverbindung) > 110) risks.push("Bankverbindung/Fußzeile ist sehr lang; Fußzeile im PDF prüfen.");
    if (longestTextLineLength(settings && settings.introText) > 130) risks.push("Einleitungstext enthält eine sehr lange Zeile; Umbruch im Brief prüfen.");
    if (includePrepaymentText && longestTextLineLength(settings && settings.vorauszahlungIntro) > 130) risks.push("Text zur Vorauszahlungsanpassung enthält eine sehr lange Zeile; Umbruch im Zusatzblatt prüfen.");
    return risks;
  }

  function briefPreflightReport(calc, result) {
    ensureBriefSettings();
    const s = state.briefSettings || {};
    const validation = validateBriefResult(calc, result);
    const items = [];
    function add(level, label, detail) {
      items.push({ level, label, detail: detail || "" });
    }
    validation.errors.forEach(message => add("err", "Fehler", message));
    validation.warnings.forEach(message => add("warn", "Prüfen", message));
  
    if (!result || !result.tenant) {
      add("err", "Empfänger", "Kein Briefempfänger ausgewählt oder berechenbar.");
    } else {
      const tenant = result.tenant;
      const costRows = briefCostRows(calc, tenant);
      const html = buildBriefHtml(calc, result) || "";
      const styles = briefPrintStyles();
      const pageCount = (html.match(/letter-sheet/g) || []).length;
      const prepayEnabled = s.vorauszahlungPrintMode !== "Nicht drucken" && s.showVorauszahlungPage === "Ja";
  
      add("ok", "Empfänger", tenantDisplayId(tenant) + " · " + (tenant.name || "ohne Namen"));
      const settlement = settlementInfoForResult(result, tenant);
      add("ok", "Saldo", settlement.type + " · " + fmtMoney(settlement.amount));
  
      if (costRows.length) add("ok", "Kostenzeilen", costRows.length + " mieterbezogene Zeilen vorhanden.");
  
      if (s.zahlungsziel) add("ok", "Zahlungsziel", dateDe(s.zahlungsziel) || String(s.zahlungsziel));
      else add("warn", "Zahlungsziel", "Kein Zahlungsziel hinterlegt. Wird aktuell nicht prominent gedruckt, sollte aber vor Versand geprüft werden.");
  
      if (html.includes('class="footer"') && s.bankverbindung) add("ok", "Fußzeile", "Kontoverbindung/Fußzeile vorhanden.");
      else add("warn", "Fußzeile", "Fußzeile oder Bankverbindung fehlt.");
  
      if (html.includes("letter-sheet") && styles.includes("@page{size:A4;margin:0") && styles.includes("width:210mm") && styles.includes("height:297mm")) {
        add("ok", "DIN-A4", "Feste A4-Seitenstruktur und Druck-CSS vorhanden.");
      } else {
        add("err", "DIN-A4", "A4-Seitenstruktur oder Druck-CSS unvollständig.");
      }
  
      if (styles.includes("tbody td{white-space:nowrap") && styles.includes("thead th") && styles.includes("white-space:normal")) {
        add("ok", "Tabellenlayout", "Datenzeilen einzeilig, Tabellenköpfe umbruchfähig.");
      } else {
        add("err", "Tabellenlayout", "Tabellen-Umbruchregeln für Druck fehlen oder sind verändert.");
      }
  
      if (pageCount <= 0) add("err", "Seiten", "Keine Briefseite erzeugt.");
      else if (pageCount > 2) add("warn", "Seiten", pageCount + " A4-Seiten erzeugt; Druckbild genau prüfen.");
      else add("ok", "Seiten", pageCount + " A4-Seite" + (pageCount === 1 ? "" : "n") + " erzeugt.");
  
      if (prepayEnabled) {
        const prepayRows = monthlyPrepaymentRows(costRows, tenant);
        if (!s.vorauszahlungAb) add("warn", "Vorauszahlung", "Vorauszahlungsanpassung wird gedruckt, aber das Datum fehlt.");
        if (!prepayRows.length) add("warn", "Vorauszahlung", "Vorauszahlungsanpassung aktiv, aber keine Zeilen vorhanden.");
        else add("ok", "Vorauszahlung", prepayRows.length + " Anpassungszeilen für Zusatzblatt vorhanden.");
      } else {
        add("info", "Vorauszahlung", "Zusatzblatt wird nicht gedruckt.");
      }
  
      briefLongTextRisks(costRows, tenant, s, prepayEnabled).forEach(message => add("warn", "Druckrisiko", message));
      add("info", "Druckhinweis", "Im Browserdruck A4 wählen, Skalierung 100 %, Browser-Kopf-/Fußzeilen aus.");
    }
  
    const errors = items.filter(item => item.level === "err").length;
    const warnings = items.filter(item => item.level === "warn").length;
    const ok = items.filter(item => item.level === "ok").length;
    const infos = items.filter(item => item.level === "info").length;
    return {
      items,
      errors,
      warnings,
      ok,
      infos,
      level: errors ? "err" : (warnings ? "warn" : "ok"),
      label: errors ? "Nicht druckbereit" : (warnings ? "Druck mit Prüfung" : "Druckbereit"),
      message: errors ? "Bitte Fehler vor Druck/PDF beheben." : (warnings ? "Keine blockierenden Fehler, aber Hinweise vor Versand prüfen." : "Der ausgewählte Brief ist formal druckbereit.")
    };
  }

  function allLettersPrintReadiness(calc) {
    const rows = briefResultRows(calc);
    const reports = rows.map(result => ({ result, preflight:briefPreflightReport(calc, result), print:printHardeningReport(calc, result) }));
    const errors = reports.reduce((sum,r) => sum + r.preflight.errors + r.print.errors, 0);
    const warnings = reports.reduce((sum,r) => sum + r.preflight.warnings + r.print.warnings, 0);
    return { rows, reports, errors, warnings };
  }

  function currentBriefPreflightReport() {
    const calc = calculateUmlage();
    const selected = selectedBriefTenant(calc);
    return briefPreflightReport(calc, selected);
  }

  function briefResultRows(calc) {
    if (!calc || !Array.isArray(calc.tenantResults)) return [];
    return calc.tenantResults.filter(r => r && r.tenant && isBillableTenant(r.tenant) && tenantRelevantForCurrentBilling(r.tenant));
  }

  function selectedBriefTenant(calc) {
    ensureBriefSettings();
    const rows = briefResultRows(calc);
    let result = rows.find(r => r.tenant.id === state.briefSettings.tenantId);
    if (!result && rows.length) {
      result = rows[0];
      state.briefSettings.tenantId = result.tenant.id;
    }
    return result;
  }

  function isManualExternalCostDefinition(costOrRow) {
    const id=String(costOrRow&&costOrRow.id||""); const schluessel=String(costOrRow&&(costOrRow.umlageschluessel||costOrRow.schluessel)||""); const berechnungsart=String(costOrRow&&costOrRow.berechnungsart||"");
    const input=state.umlageInputs&&state.umlageInputs[id]; const mode=input&&input.mode;
    return id==="K006" || mode==="Direkter Eurobetrag" || mode==="Externe Einzelabrechnung" || schluessel===UMLAGE_MANUAL || berechnungsart==="Manuell je Mieter";
  }

  function manualExternalLetterLineLabel(group, row) {
    return row && row.id === "K006" ? group.line : group.line + " laut Einzelabrechnung";
  }

  function isBriefCostRowRelevant(row) {
    if (!row) return false;
    const tenantCost = Math.abs(num(row.anteil));
    const tenantPrepay = Math.abs(num(row.vorauszahlung));
    const tenantAdditionalPrepay = Math.abs(num(row.weitereVorauszahlung));
    const tenantSettlement = Math.abs(num(row.settlement));
    // Die Brieftabelle ist eine mieterbezogene Abrechnung.
    // Deshalb zählt nicht, ob eine Kostenart insgesamt einen Betrag hat,
    // sondern ob dieser Mieter daran beteiligt ist oder dafür gezahlt hat.
    return tenantCost > 0.004 || tenantPrepay > 0.004 || tenantAdditionalPrepay > 0.004 || tenantSettlement > 0.004;
  }

  function briefCostSortValue(row) {
    const order={K006:1,K002:2,K009:3,K017:4}; return order[row.id]||99;
  }

  function briefCostRows(calc, tenant) {
    const entry = billingEntryForTenant(tenant);
    return calc.costResults.map(row => {
      if (row.cost && row.cost.id === "K040") return null; // Rundungsdifferenz wird im Gesamtergebnis abgebildet, nicht als eigene Briefzeile.
      const amount = num(row.allocations[tenant.originalIndex]);
      const prepay = vorauszahlungByCostAndTenant(row.cost.id, tenant.originalIndex);
      const additionalPrepay = row.cost.id === "K002" ? num(tenant.wasserWeitereVorauszahlung) : 0;
      const input = (state.umlageInputs && state.umlageInputs[row.cost.id] && Array.isArray(state.umlageInputs[row.cost.id].values))
        ? num(state.umlageInputs[row.cost.id].values[tenant.originalIndex])
        : 0;
      let basis = num(row.inputSum) || num(row.basisTotal);
      let price = row.cost && row.cost.umlageschluessel === "Verbrauch" ? num(row.cost.preisProEinheit) : (basis ? num(row.cost.gesamtbetrag) / basis : num(row.cost.preisProEinheit));
      let tenantUnits = input || (price ? amount / price : 0);
      let gesamtbetrag = num(row.cost.gesamtbetrag);
      let period = letterPeriod(state.briefSettings && state.briefSettings.abrechnungsjahr ? state.briefSettings.abrechnungsjahr : currentAbrechnungsjahr());
      if (entry) {
        const ctx = knownArchiveCostContext(entry, row.cost.id, amount);
        if (ctx.gesamtbetrag) gesamtbetrag = ctx.gesamtbetrag;
        if (row.cost.id === "K006") { basis = 0; price = 0; tenantUnits = 0; }
        else {
          if (ctx.basisTotal) basis = ctx.basisTotal;
          if (row.cost && row.cost.umlageschluessel === "Verbrauch") price = num(row.cost.preisProEinheit);
          else if (ctx.preis) price = ctx.preis;
          if (ctx.einheiten) tenantUnits = ctx.einheiten;
        }
        period = importedEntryPeriodForCost(entry, row.cost.id) || period;
      }
      if (isManualExternalCostDefinition(row.cost)) {
        basis = 0;
        price = 0;
        tenantUnits = 0;
      }
      return {
        id: row.cost.id,
        kostenart: String(row.cost.kostenart || "").replace(/^Legacy-/, ""),
        schluessel: row.cost.umlageschluessel,
        berechnungsart: row.cost.berechnungsart,
        gesamtbetrag,
        anteil: amount,
        vorauszahlung: prepay,
        weitereVorauszahlung: additionalPrepay,
        basisTotal: basis,
        preis: price,
        einheiten: tenantUnits,
        period,
        importedEntry: !!entry,
        settlement: prepay + additionalPrepay - amount
      };
    }).filter(Boolean)
      .filter(isBriefCostRowRelevant)
      .sort((a,b) => briefCostSortValue(a) - briefCostSortValue(b) || String(a.kostenart).localeCompare(String(b.kostenart)));
  }

  function dateDeShortYear(value) {
    if (!value) return "";
    const parts = String(value).split("-");
    if (parts.length >= 3) return Number(parts[2]) + "." + Number(parts[1]) + "." + parts[0].slice(-2);
    return dateDe(value);
  }

  function letterPeriod(year) {
    return dateDeShortYear(periodStart()) + "-" + dateDeShortYear(periodEnd());
  }

  function fmtMoneySigned(value) {
    const n = num(value);
    if (Math.abs(n) < 0.005) return fmtMoney(0);
    return (n < 0 ? "- " : "") + fmtMoney(Math.abs(n));
  }

  function fmtUnits(value) {
    const n = num(value);
    if (Math.abs(n) < 0.005) return "";
    return n.toLocaleString("de-DE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits:3 });
  }

  function letterCostGroup(row) {
    if (row.id === "K006") return { title:"Heiz- und Warmwasserkosten", line:"Ihre Heiz- und Warmwasserkosten", prepay:"Ihre Vorauszahlung", total:"Ihre Heiz- und Warmwasserkosten", changeKey:"vzChangeHeizung", prepayLabel:"Heizkostenvorauszahlung monatlich" };
    if (row.id === "K002") return { title:"Wasserkosten", line:"Ihre Wasserkosten", prepay:"Ihre Vorauszahlung", total:"Ihre Wasserkosten", changeKey:"vzChangeWasser", prepayLabel:"Wasserkostenvorauszahlung monatlich" };
    if (row.id === "K009") return { title:"Abfallkosten", line:"Ihre Abfallkosten", prepay:"Ihre Vorauszahlung", total:"Ihre Abfallkosten", changeKey:"vzChangeAbfall", prepayLabel:"Abfallkostenvorauszahlung monatlich" };
    if (row.id === "K017") return { title:"Antennenkosten", line:"Ihre Antennenkosten", prepay:"Ihre Vorauszahlung", total:"Ihre Antennenkosten", changeKey:"vzChangeAntenne", prepayLabel:"Antennenkostenvorauszahlung monatlich" };
    return { title:"Weitere Betriebskosten", line:"Ihr Kostenanteil", prepay:"Ihre Vorauszahlung", total:"Ihr Kostenanteil", changeKey:"vzChangeSonstige", prepayLabel:"Weitere Nebenkostenvorauszahlung monatlich" };
  }

  function settlementLabel(group, settlement) {
    return settlement < -0.004 ? group.total + "-Nachzahlung an die Vermieterin" : group.total + "-Guthaben";
  }

  function monthlyPrepaymentRows(costRows, tenant) {
    ensureBriefSettings();
    const s = state.briefSettings;
    if (s.vorauszahlungPrintMode === "Berechnete Werte drucken") {
      const calculated = calculatedMonthlyPrepaymentRowsForTenant(tenant);
      if (calculated.length) return calculated;
    }
    const rows = costRows.filter(r => Math.abs(r.vorauszahlung) > 0.004 || ["K002","K006","K009"].includes(r.id)).map(r => {
      const g = letterCostGroup(r);
      const oldMonthly = num(r.vorauszahlung) / 12;
      const change = tenant && tenant[g.changeKey] !== undefined ? num(tenant[g.changeKey]) : num(s[g.changeKey]);
      const newMonthly = Math.max(0, oldMonthly + change);
      return {
        label:g.prepayLabel,
        turnus:"monatlich",
        oldMonthly,
        change,
        newMonthly
      };
    });
    rows.push({
      label:"Antennenkostenvorauszahlung monatlich",
      turnus:"monatlich",
      oldMonthly:10.25,
      change: tenant && tenant.vzChangeAntenne !== undefined ? num(tenant.vzChangeAntenne) : num(s.vzChangeAntenne),
      newMonthly:Math.max(0, 10.25 + (tenant && tenant.vzChangeAntenne !== undefined ? num(tenant.vzChangeAntenne) : num(s.vzChangeAntenne)))
    });
    return rows;
  }

  global.NKProDocumentData = Object.freeze({
    settlementInfoForResult,
    finalBillingReadiness,
    acceptanceProtocolData,
    acceptanceLevel,
    acceptanceLabel,
    validateBriefResult,
    longestTextLineLength,
    compactTextLength,
    briefLongTextRisks,
    briefPreflightReport,
    allLettersPrintReadiness,
    currentBriefPreflightReport,
    briefResultRows,
    selectedBriefTenant,
    isManualExternalCostDefinition,
    manualExternalLetterLineLabel,
    isBriefCostRowRelevant,
    briefCostSortValue,
    briefCostRows,
    dateDeShortYear,
    letterPeriod,
    fmtMoneySigned,
    fmtUnits,
    letterCostGroup,
    settlementLabel,
    monthlyPrepaymentRows
  });
})(globalThis);
