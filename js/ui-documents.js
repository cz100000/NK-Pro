"use strict";

// AP12: Vorauszahlungsanpassung, Briefe, Druck und Zwischenablage.
// ===== Bereich: Vorauszahlungsanpassung V51 =====
function defaultPrepaymentAdjustmentSettings() { return NK_PRO_MODULES.billingWorkflow.defaultPrepaymentAdjustmentSettings(); }


function ensurePrepaymentAdjustmentSettings() { return NK_PRO_MODULES.billingWorkflow.ensurePrepaymentAdjustmentSettings(); }








function adjustmentGroupForCost(...args) { return NK_PRO_MODULES.billingCalculation.adjustmentGroupForCost(...args); }

function prepaymentAdjustmentData(...args) { return NK_PRO_MODULES.billingCalculation.prepaymentAdjustmentData(...args); }
function calculatedMonthlyPrepaymentRowsForTenant(...args) { return NK_PRO_MODULES.billingCalculation.calculatedMonthlyPrepaymentRowsForTenant(...args); }


function prepaymentAdjustmentStatusClass(value) {
  if (Math.abs(num(value)) < 0.005) return "neutral";
  return num(value) > 0 ? "warn" : "ok";
}

function renderPrepaymentAdjustment() {
  const settingsEl = document.getElementById("vorauszahlungAdjustSettings");
  const summaryEl = document.getElementById("vorauszahlungAdjustSummaryTable");
  const detailEl = document.getElementById("vorauszahlungAdjustDetailTable");
  if (!settingsEl || !summaryEl || !detailEl) return;

  const data = prepaymentAdjustmentData();
  const s = data.settings;
  const printModeOptions = ["Nicht drucken","Berechnete Werte drucken","Manuelle Werte drucken"];
  settingsEl.innerHTML =
    '<label class="prepayment-setting"><span>Anpassung gilt ab</span><input value="' + escapeHtml(s.effectiveFrom) + '" ' + uiActionAttributes("billing.setPrepaymentAdjustmentSetting", ["effectiveFrom","$value"], "change") + '></label>' +
    '<label class="prepayment-setting"><span>Sicherheitszuschlag in %</span><input class="number" value="' + escapeHtml(s.safetyBufferPercent) + '" ' + uiActionAttributes("billing.setPrepaymentAdjustmentSetting", ["safetyBufferPercent","$value"], "change") + '></label>' +
    '<label class="prepayment-setting"><span>Rundung der monatlichen Vorauszahlung</span>' + selectHtml(s.roundingMode, ["Auf 1 € runden","Auf 5 € runden","Auf 10 € runden"], "setPrepaymentAdjustmentSetting('roundingMode',this.value)") + '</label>' +
    '<label class="prepayment-setting"><span>Mindeständerung monatlich</span><input class="money" value="' + escapeHtml(s.minimumMonthlyChange) + '" ' + uiActionAttributes("billing.setPrepaymentAdjustmentSetting", ["minimumMonthlyChange","$value"], "change") + '></label>' +
    '<label class="prepayment-setting"><span>Unterjährige Mietzeiten hochrechnen?</span>' + selectHtml(s.annualizePartialTenants, ["Ja","Nein"], "setPrepaymentAdjustmentSetting('annualizePartialTenants',this.value)") + '</label>' +
    '<label class="prepayment-setting"><span>Änderungslogik</span>' + selectHtml(s.changePolicy, ["Erhöhungen und Senkungen","Nur Erhöhungen","Nur Senkungen"], "setPrepaymentAdjustmentSetting('changePolicy',this.value)") + '</label>' +
    '<label class="prepayment-setting prepayment-setting--wide"><span>Vorauszahlungsanpassung im Brief ausgeben?</span>' + selectHtml(s.letterPrintMode, printModeOptions, "setPrepaymentAdjustmentSetting('letterPrintMode',this.value)") + '</label>' +
    '<div class="prepayment-settings-note">„Nicht drucken“ lässt den normalen Abrechnungsbrief unverändert. „Berechnete Werte drucken“ übernimmt die aktuelle Empfehlung.</div>';

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("vorauszahlungsanpassung");

  const summaryRows = data.summaries.map(row => {
    const badgeClass = prepaymentAdjustmentStatusClass(row.changeTotal);
    return '<tr>' +
      '<td>' + tenantIdCellHtml(row.tenant) + '</td>' +
      '<td>' + unitRefCellHtml(row.tenant.wohnung) + '</td>' +
      '<td>' + escapeHtml(row.tenant.name || '') + '</td>' +
      '<td class="money">' + fmtMoney(row.oldMonthlyTotal) + '</td>' +
      '<td class="money">' + fmtMoney(row.recommendedTenantMonthly) + '</td>' +
      '<td class="money">' + fmtMoneySigned(row.changeTotal) + '</td>' +
      '<td class="money">' + fmtMoney(row.kaltMonthly) + '</td>' +
      '<td class="money">' + fmtMoney(row.warmMonthly) + '</td>' +
      '<td><span class="status ' + badgeClass + '">' + escapeHtml(row.status) + '</span></td>' +
      '<td class="center">' + (row.annualizationFactor > 1.01 ? escapeHtml(row.annualizationFactor.toFixed(2).replace('.', ',')) + 'x' : '–') + '</td>' +
      '</tr>';
  }).join('') || '<tr><td colspan="10">Keine abrechenbaren Mieter vorhanden.</td></tr>';

  summaryEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Wohnung</th><th>Name</th><th class="money">Bisher NK mtl.</th><th class="money">Empfohlen NK mtl.</th><th class="money">Änderung mtl.</th><th class="money">Kaltmiete mtl.</th><th class="money">Neue Warmmiete mtl.</th><th>Status</th><th>Hochrechnung</th></tr></thead><tbody>' + summaryRows + '</tbody>';

  const detailRows = data.details.map(d => '<tr>' +
    '<td>' + tenantIdCellHtml(d.tenant) + '</td>' +
    '<td>' + escapeHtml(d.tenant.name || '') + '</td>' +
    '<td>' + escapeHtml(d.cost.id || '') + '</td>' +
    '<td>' + escapeHtml(d.cost.kostenart || '') + '</td>' +
    '<td class="money">' + fmtMoney(d.costShare) + '</td>' +
    '<td class="money">' + fmtMoney(d.annualBasis) + '</td>' +
    '<td class="money">' + fmtMoney(d.oldMonthly) + '</td>' +
    '<td class="money">' + fmtMoney(d.recommendedMonthly) + '</td>' +
    '<td class="money">' + fmtMoneySigned(d.change) + '</td>' +
    '<td>' + escapeHtml(d.label) + '</td>' +
    '</tr>').join('') || '<tr><td colspan="10">Keine Detailwerte vorhanden.</td></tr>';

  detailEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Name</th><th>Kosten-ID</th><th>Kostenart</th><th class="money">Kostenanteil akt. Periode</th><th class="money">Jahresbasis</th><th class="money">Bisher mtl.</th><th class="money">Neu mtl.</th><th class="money">Änderung mtl.</th><th>Briefzeile</th></tr></thead><tbody>' + detailRows + '</tbody>';
}


function normalizeBriefDefaultTexts() {
  if (!state.briefSettings) return;
  function normalizeLegacyProse(value) {
    return String(value || "").replace(/\\n/g, " ").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  }
  const defaults = defaultBriefSettings();
  const legacyIntros = [
    "untenstehend erhalten Sie Nebenkostenabrechnung für das Jahr {jahr}. Der finale Betrag befindet sich am Ende der Aufstellung.",
    "untenstehend erhalten Sie die Nebenkostenabrechnung für das Jahr {jahr}. Der finale Betrag befindet sich am Ende der Aufstellung."
  ];
  const legacySaldoTexts = [
    "Bei negativen Beträgen, handelt es sich um Nachzahlungen an die Vermieterin. Bei positiven Beträgen handelt es sich um Guthaben zu Ihren Gunsten. Ich bitte Sie, eine etwaige Nachzahlung umgehend zu begleichen.",
    "Bei negativen Beträgen handelt es sich um Nachzahlungen an die Vermieterin. Bei positiven Beträgen handelt es sich um Guthaben zu Ihren Gunsten. Bitte begleichen Sie eine etwaige Nachzahlung umgehend.",
    "Ihr Guthaben wird Ihnen bis zum {zahlungsziel} auf das bekannte Konto überwiesen beziehungsweise mit der nächsten Zahlung verrechnet."
  ];
  const legacyPrepayTexts = [
    "Um den gestiegenen Energiekosten und Ihrem individuellen Verbrauch Rechnung zu tragen, erhöhen sich Ihre monatlichen Nebenkostenvorauszahlungen zum {datum}. Die Details entnehmen Sie bitte der untenstehenden Tabelle.",
    "Auf Grundlage der vorliegenden Abrechnung wird Ihre monatliche Betriebskostenvorauszahlung ab dem {datum} wie folgt angepasst:"
  ];
  if (legacyIntros.includes(normalizeLegacyProse(state.briefSettings.introText))) state.briefSettings.introText = defaults.introText;
  if (legacySaldoTexts.includes(normalizeLegacyProse(state.briefSettings.saldoTextNachzahlung))) state.briefSettings.saldoTextNachzahlung = defaults.saldoTextNachzahlung;
  if (legacySaldoTexts.includes(normalizeLegacyProse(state.briefSettings.saldoTextGuthaben))) state.briefSettings.saldoTextGuthaben = defaults.saldoTextGuthaben;
  if (legacyPrepayTexts.includes(normalizeLegacyProse(state.briefSettings.vorauszahlungIntro))) state.briefSettings.vorauszahlungIntro = defaults.vorauszahlungIntro;
  if (normalizeLegacyProse(state.briefSettings.heizkostenFussnote).startsWith("*) Heiz- und Warmwasserkosten")) state.briefSettings.heizkostenFussnote = defaults.heizkostenFussnote;
}
function defaultBriefSettings() {
  const today = todayIso();
  const year = currentAbrechnungsjahr();
  const nextYear = String(NK_PRO_MODULES.archiveActions.yearNumber(year) + 1);
  return {
    tenantId: "",
    abrechnungsjahr: year,
    briefdatum: today,
    zahlungsziel: addDaysIso(today, 14),
    absender: "Ute Zimmermann",
    absenderName: "Ute Zimmermann",
    absenderStrasse: "Albert-Schweitzer-Straße 10",
    absenderOrt: "55774 Baumholder",
    absenderTelefon: "06783 / 4624",
    ort: "Baumholder",
    absenderZeile: "Ute Zimmermann · Albert-Schweitzer-Straße 10 · 55774 Baumholder",
    bankverbindung: "Kreissparkasse Birkenfeld / IBAN: DE32 5625 0030 0021 1302 99 / BIC: BILADE55XXX",
    schwarzweissOptimiert: "Nein",
    betreff: "Nebenkostenabrechnung",
    anredeModus: "Sehr geehrte(r) Mieter/in,",
    introText: "für die oben bezeichnete Wohnung erhalten Sie hiermit Ihre Nebenkostenabrechnung für den Zeitraum {zeitraum}. Die Kostenverteilung und Ihr Anteil sind nachfolgend dargestellt:",
    saldoTextNachzahlung: "Bitte überweisen Sie den Betrag bis zum {zahlungsziel} auf das Ihnen bekannte Konto.",
    saldoTextGuthaben: "Ihr Guthaben wird Ihnen auf das bekannte Konto überwiesen beziehungsweise mit offenen Abrechnungen verrechnet.",
    outroText: "",
    abschlusstext: "Bei Fragen stehe ich Ihnen selbstverständlich gern zur Verfügung.",
    gruss: "Mit freundlichen Grüßen",
    signatur: "Ute Zimmermann\nVermieterin",
    anlagenText: "Heiz- und Warmwasserkostenabrechnung der Fa. Techem",
    fusszeile: "",
    heizkostenFussnote: "Die Heiz- und Warmwasserkosten wurden gemäß der beigefügten Abrechnung des Messdienstleisters (Fa. Techem) übernommen. Diese liegt diesem Schreiben bei.",
    showVorauszahlungPage: "Nein",
    vorauszahlungPrintMode: "Nicht drucken",
    useCalculatedPrepaymentAdjustments: "Ja",
    vorauszahlungAb: "01.01." + nextYear,
    vorauszahlungIntro: "Auf Basis Ihres individuellen Verbrauchs und um Kostensteigerungen zu berücksichtigen, wird Ihre monatliche Nebenkostenvorauszahlung ab dem {datum} wie folgt angepasst:",
    dauerauftragText: "Bitte passen Sie Ihren monatlichen Dauerauftrag ab dem {datum} auf {betrag} an.",
    vzChangeHeizung: 15,
    vzChangeWasser: 0,
    vzChangeAbfall: 7,
    vzChangeAntenne: -10.25,
    vzChangeSonstige: 0
  };
}
function ensureBriefSettings() {
  const defaults = defaultBriefSettings();
  if (!state.briefSettings) state.briefSettings = {};
  Object.keys(defaults).forEach(key => {
    if (state.briefSettings[key] === undefined || state.briefSettings[key] === null) {
      state.briefSettings[key] = defaults[key];
    }
  });
  normalizeBriefDefaultTexts();
  if (!state.briefSettings.vorauszahlungPrintMode) state.briefSettings.vorauszahlungPrintMode = state.briefSettings.showVorauszahlungPage === "Ja" ? "Manuelle Werte drucken" : "Nicht drucken";
  state.briefSettings.useCalculatedPrepaymentAdjustments = state.briefSettings.vorauszahlungPrintMode === "Berechnete Werte drucken" ? "Ja" : "Nein";
  state.briefSettings.showVorauszahlungPage = state.briefSettings.vorauszahlungPrintMode === "Nicht drucken" ? "Nein" : "Ja";
  const tenants = tenantRowsWithIndex();
  if (!state.briefSettings.tenantId && tenants.length) state.briefSettings.tenantId = tenants[0].id;
}

function setBriefSetting(key, value) {
  ensureBriefSettings();
  if (["vzChangeHeizung","vzChangeWasser","vzChangeAbfall","vzChangeAntenne","vzChangeSonstige"].includes(key)) value = num(value);
  state.briefSettings[key] = value;
  if (key === "vorauszahlungPrintMode") {
    state.briefSettings.showVorauszahlungPage = value === "Nicht drucken" ? "Nein" : "Ja";
    state.briefSettings.useCalculatedPrepaymentAdjustments = value === "Berechnete Werte drucken" ? "Ja" : "Nein";
    ensurePrepaymentAdjustmentSettings();
    state.prepaymentAdjustmentSettings.letterPrintMode = value;
  }
  if (key === "vorauszahlungAb") {
    ensurePrepaymentAdjustmentSettings();
    state.prepaymentAdjustmentSettings.effectiveFrom = value;
  }
  if (key === "abrechnungsjahr") {
    if (!state.meta) state.meta = {};
    state.meta.abrechnungsjahr = value;
  }
  commitStateChange({ reason:"Briefeinstellung", tabId:"briefe", includeCommon:false, includeNavigation:false, includeTableTools:false });
}

function ensureBriefAddresses() {
  if (!state.briefAddresses) state.briefAddresses = {};
}


function getBriefTenantAddress(tenant) {
  return tenantMailingAddress(tenant);
}


function salutationForTenant(tenant) {
  ensureTenantContactFields(tenant);
  const template = tenant && tenant.standardanrede ? tenant.standardanrede : "Automatisch";
  if (template && template !== "Automatisch") return tenantSalutationFromTemplate(tenant, template);

  const lastName = tenantLastName(tenant);
  if (tenant && tenant.geschlecht === "Frau") return "Sehr geehrte Frau " + (lastName || "") + ",";
  if (tenant && tenant.geschlecht === "Herr") return "Sehr geehrter Herr " + (lastName || "") + ",";
  if (tenant && tenant.geschlecht === "Firma/Divers") return "Sehr geehrte Damen und Herren,";
  return "Sehr geehrte(r) Mieter/in,";
}

function textareaHtml(value, onChange) {
  return '<textarea' + legacyUiActionAttributes(onChange, "change") + '>' + escapeHtml(value ?? "") + '</textarea>';
}


function briefPrintStyles(...args) { return NK_PRO_MODULES.documentRenderer.briefPrintStyles(...args); }
function effectivePrepaymentDateLabel() {
  ensureBriefSettings();
  const raw = String(state.briefSettings && state.briefSettings.vorauszahlungAb || "").trim();
  return raw || "dem angegebenen Datum";
}

function effectivePrepaymentYearLabel() {
  const label = effectivePrepaymentDateLabel();
  const match = label.match(/(\d{4})\s*$/);
  return match ? match[1] : "";
}

function validateBriefResult(...args) { return NK_PRO_MODULES.documentData.validateBriefResult(...args); }




function compactTextLength(...args) { return NK_PRO_MODULES.documentData.compactTextLength(...args); }


function briefPreflightReport(...args) { return NK_PRO_MODULES.documentData.briefPreflightReport(...args); }

function briefPreflightBoxHtml(...args) { return NK_PRO_MODULES.documentRenderer.briefPreflightBoxHtml(...args); }



function printHardeningReport(calc, result) {
  const items = [];
  function add(level, label, detail) { items.push({ level, label, detail: detail || "" }); }
  const preflight = briefPreflightReport(calc, result);
  if (preflight.errors) add("err", "Brief-Preflight", preflight.errors + " blockierende Fehler vor Druck/PDF.");
  else if (preflight.warnings) add("warn", "Brief-Preflight", preflight.warnings + " Hinweise vor Versand prüfen.");
  else add("ok", "Brief-Preflight", "Kein blockierender Punkt für den aktuellen Brief.");

  const styles = briefPrintStyles();
  if (styles.includes("@page{size:A4;margin:0") && styles.includes("width:210mm") && styles.includes("height:297mm")) add("ok", "A4-Seite", "Feste 210 × 297 mm Druckseite vorhanden.");
  else add("err", "A4-Seite", "A4-Seitendefinition fehlt oder wurde verändert.");
  if (styles.includes("print-color-adjust:exact") && styles.includes("-webkit-print-color-adjust:exact")) add("ok", "Druckfarben", "Farb-/Hintergrundausgabe für PDF-Druck stabilisiert.");
  else add("warn", "Druckfarben", "Browser könnte Hintergründe/Farben im PDF reduzieren.");
  if (styles.includes("page-break-inside:avoid") && styles.includes("break-inside:avoid")) add("ok", "Seitenumbrüche", "Tabellen, Summenzeilen und Fußzeile sind gegen ungewollte Umbrüche gehärtet.");
  else add("warn", "Seitenumbrüche", "Zusätzliche Umbruchhärtung fehlt.");

  if (!result || !result.tenant) {
    add("err", "Empfänger", "Kein Briefempfänger für die Druckprüfung verfügbar.");
  } else {
    const html = buildBriefHtml(calc, result) || "";
    const pageCount = (html.match(/<section class="letter-sheet/g) || []).length;
    const costRows = briefCostRows(calc, result.tenant);
    const maxCostName = costRows.reduce((max,row) => Math.max(max, compactTextLength(row.kostenart)), 0);
    if (pageCount <= 0) add("err", "Seitenanzahl", "Keine A4-Seite erzeugt.");
    else if (pageCount > 2) add("warn", "Seitenanzahl", pageCount + " Seiten erzeugt; PDF optisch prüfen.");
    else add("ok", "Seitenanzahl", pageCount + " Seite" + (pageCount === 1 ? "" : "n") + " erzeugt.");
    if (costRows.length > 12) add("warn", "Tabellenlänge", costRows.length + " Kostenzeilen; Seitenhöhe im PDF prüfen.");
    else add("ok", "Tabellenlänge", costRows.length + " Kostenzeilen im erwarteten Bereich.");
    if (maxCostName > 42) add("warn", "Tabellentext", "Sehr lange Kostenart mit " + maxCostName + " Zeichen; Datenzeile im PDF prüfen.");
    else add("ok", "Tabellentext", "Keine extrem lange Kostenart erkannt.");
  }
  add("info", "Browser-Einstellung", "Beim Drucken A4, 100 %, Browser-Kopf-/Fußzeilen aus und Hintergrundgrafiken/Farben aktivieren.");
  const errors = items.filter(i => i.level === "err").length;
  const warnings = items.filter(i => i.level === "warn").length;
  const ok = items.filter(i => i.level === "ok").length;
  const infos = items.filter(i => i.level === "info").length;
  return { items, errors, warnings, ok, infos, level:errors ? "err" : (warnings ? "warn" : "ok"), label:errors ? "Druck nicht bereit" : (warnings ? "Druck mit Prüfung" : "Druckbereit"), message:errors ? "Druck/PDF erst nach Fehlerbehebung starten." : (warnings ? "Druck möglich, aber Hinweise im PDF kontrollieren." : "Druck-/PDF-Struktur ist formal bereit.") };
}

function printHardeningBoxHtml(...args) { return NK_PRO_MODULES.documentRenderer.printHardeningBoxHtml(...args); }

function currentPrintHardeningReport() {
  const calc = calculateUmlage();
  const selected = selectedBriefTenant(calc);
  return printHardeningReport(calc, selected);
}

function printReportText(...args) { return NK_PRO_MODULES.documentRenderer.printReportText(...args); }

function showPrintModeCheck() {
  const report = currentPrintHardeningReport();
  alert(printReportText(report));
  return report;
}

function printWindowHtml(...args) { return NK_PRO_MODULES.documentRenderer.printWindowHtml(...args); }

function openPrintWindow(title, bodyHtml, scopeLabel, autoPrint) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Das Druckfenster konnte nicht geoeffnet werden. Bitte Pop-ups fuer diese lokale Datei erlauben.");
    return null;
  }
  win.document.open();
  win.document.write(printWindowHtml(title, bodyHtml, scopeLabel));
  win.document.close();
  if (win.focus) win.focus();
  if (autoPrint) setTimeout(() => { try { win.print(); } catch(e) { win.print(); } }, 160);
  return win;
}

function allLettersPrintReadiness(...args) { return NK_PRO_MODULES.documentData.allLettersPrintReadiness(...args); }

function showAllLettersPrintReady() {
  ensureYearData();
  const calc = calculateUmlage();
  const readiness = allLettersPrintReadiness(calc);
  if (!readiness.rows.length) {
    alert("Es sind keine Briefempfänger für eine Sammel-Druckansicht vorhanden.");
    return;
  }
  if (readiness.errors) {
    const lines = readiness.reports.filter(r => r.preflight.errors || r.print.errors).map(r => tenantDisplayId(r.result.tenant) + " · " + (r.result.tenant.name || "ohne Namen") + ": " + (r.preflight.errors + r.print.errors) + " Fehler");
    alert("Sammel-Druckansicht ist noch nicht bereit.\n\n" + lines.join("\n"));
    return;
  }
  if (readiness.warnings && !confirm("Sammel-Druckansicht mit " + readiness.warnings + " Hinweisen öffnen? Bitte jedes PDF optisch prüfen.")) return;
  const html = readiness.rows.map(result => buildBriefHtml(calc, result)).join("\n");
  openPrintWindow("NK-Pro Sammel-Briefdruck", html, "Sammelansicht · " + readiness.rows.length + " Briefe", false);
}
function currentBriefPreflightReport(...args) { return NK_PRO_MODULES.documentData.currentBriefPreflightReport(...args); }

function confirmBriefAction(actionLabel) {
  const report = currentBriefPreflightReport();
  if (!report.errors && !report.warnings) return true;
  const lines = report.items
    .filter(item => item.level === "err" || item.level === "warn")
    .map(item => (item.level === "err" ? "Fehler: " : "Prüfen: ") + item.label + " – " + item.detail);
  if (report.errors) {
    alert(actionLabel + " ist noch nicht bereit.\n\n" + lines.join("\n"));
    return false;
  }
  return confirm(actionLabel + " mit Preflight-Hinweisen fortsetzen?\n\n" + lines.join("\n"));
}
function briefResultRows(...args) { return NK_PRO_MODULES.documentData.briefResultRows(...args); }

function selectedBriefTenant(...args) { return NK_PRO_MODULES.documentData.selectedBriefTenant(...args); }

function plainLetterTextFromHtml(...args) { return NK_PRO_MODULES.documentRenderer.plainLetterTextFromHtml(...args); }



function isBriefCostRowRelevant(...args) { return NK_PRO_MODULES.documentData.isBriefCostRowRelevant(...args); }


function briefCostRows(...args) { return NK_PRO_MODULES.documentData.briefCostRows(...args); }

function dateDeShortYear(...args) { return NK_PRO_MODULES.documentData.dateDeShortYear(...args); }


function fmtMoneySigned(...args) { return NK_PRO_MODULES.documentData.fmtMoneySigned(...args); }
function fmtUnits(...args) { return NK_PRO_MODULES.documentData.fmtUnits(...args); }
function isManualExternalCostDefinition(...args) { return NK_PRO_MODULES.documentData.isManualExternalCostDefinition(...args); }
function letterCostGroup(...args) { return NK_PRO_MODULES.documentData.letterCostGroup(...args); }
function letterPeriod(...args) { return NK_PRO_MODULES.documentData.letterPeriod(...args); }
function manualExternalLetterLineLabel(...args) { return NK_PRO_MODULES.documentData.manualExternalLetterLineLabel(...args); }
function monthlyPrepaymentRows(...args) { return NK_PRO_MODULES.documentData.monthlyPrepaymentRows(...args); }
function settlementLabel(...args) { return NK_PRO_MODULES.documentData.settlementLabel(...args); }




function costSectionRows(...args) { return NK_PRO_MODULES.documentRenderer.costSectionRows(...args); }




function buildBriefHtml(...args) { return NK_PRO_MODULES.documentRenderer.buildBriefHtml(...args); }

function briefPreviewSourceHtml(preview) {
  return String(preview && preview.__nkBriefHtml || "");
}

function briefPreviewRoot(preview) {
  return preview && preview.shadowRoot ? preview.shadowRoot : preview;
}

function mountBriefPreview(preview, html) {
  if (!preview) return;
  preview.__nkBriefHtml = String(html || "");
  preview.replaceChildren();
  const root = preview.shadowRoot || preview.attachShadow({ mode:"open" });
  root.innerHTML = '<div class="nk-letter-preview-canvas">' + preview.__nkBriefHtml + '</div>' +
    '<style data-nk-letter-preview-shell>' +
    ':host{display:block;position:relative;margin:0 auto;overflow:visible;--nk-letter-preview-scale:1}' +
    '.nk-letter-preview-canvas{width:210mm;transform:scale(var(--nk-letter-preview-scale,1));transform-origin:top left}' +
    '.nk-letter-preview-canvas>.nk-letter-document{margin:0}' +
    '.nk-letter-document .letter-sheet{box-shadow:0 16px 40px rgba(16,24,40,.18)}' +
    '</style>';
}

function renderBrief() {
  const settingsEl = document.getElementById("briefSettings");
  const textsEl = document.getElementById("briefTexts");
  const previewEl = document.getElementById("briefPreview");
  if (!settingsEl || !textsEl || !previewEl) return;

  const calc = calculateUmlage();
  const tenants = briefResultRows(calc).map(r => r.tenant);
  const selected = selectedBriefTenant(calc);
  const s = state.briefSettings;
  const briefValidation = validateBriefResult(calc, selected);
  const briefPreflight = briefPreflightReport(calc, selected);

  const tenantOptions = tenants.map(t =>
    '<option value="' + escapeHtml(t.id) + '" ' + (t.id === s.tenantId ? "selected" : "") + '>' + escapeHtml(tenantDisplayId(t) + " · " + t.name + " · " + unitDisplayIdByInternalId(t.wohnung)) + '</option>'
  ).join("");

  settingsEl.innerHTML =
    '<label>Mieter auswählen</label><select ' + uiActionAttributes("document.setBriefSetting", ["tenantId","$value"], "change") + '>' + tenantOptions + '</select>' +
    '<div class="hint"><strong>Empfängeradresse und Anrede</strong> werden im Tab „Mieter & Wohnungen“ beim jeweiligen Mietverhältnis gepflegt.</div>' +
    briefPreflightBoxHtml(briefPreflight) +
    printHardeningBoxHtml(printHardeningReport(calc, selected)) +
    briefSettlementSummaryHtml(selected) +
    (billingEntryForTenant(selected && selected.tenant) ? '<div class="hint"><strong>Briefmodus:</strong> Originalnahe Archivansicht aus importierten Abrechnungsdaten. Die Beträge werden aus denselben strukturierten Datenfeldern erzeugt wie die neue Standardabrechnung.</div>' : '<div class="hint"><strong>Briefmodus:</strong> Standardbrief aus den aktuellen Abrechnungsdaten.</div>') +
    '<label>Abrechnungsjahr</label><input value="' + escapeHtml(s.abrechnungsjahr) + '" ' + uiActionAttributes("document.setBriefSetting", ["abrechnungsjahr","$value"], "change") + '>' +
    '<label>Briefdatum</label><input type="date" value="' + escapeHtml(s.briefdatum) + '" ' + uiActionAttributes("document.setBriefSetting", ["briefdatum","$value"], "change") + '>' +
    '<label>Zahlungsziel</label><input type="date" value="' + escapeHtml(s.zahlungsziel) + '" ' + uiActionAttributes("document.setBriefSetting", ["zahlungsziel","$value"], "change") + '>' +
    '<label>Ort</label><input value="' + escapeHtml(s.ort) + '" ' + uiActionAttributes("document.setBriefSetting", ["ort","$value"], "change") + '>' +
    '<label>Vermieter Name</label><input value="' + escapeHtml(s.absenderName) + '" ' + uiActionAttributes("document.setBriefSetting", ["absenderName","$value"], "change") + '>' +
    '<label>Vermieter Straße</label><input value="' + escapeHtml(s.absenderStrasse) + '" ' + uiActionAttributes("document.setBriefSetting", ["absenderStrasse","$value"], "change") + '>' +
    '<label>Vermieter PLZ/Ort</label><input value="' + escapeHtml(s.absenderOrt) + '" ' + uiActionAttributes("document.setBriefSetting", ["absenderOrt","$value"], "change") + '>' +
    '<label>Telefon</label><input value="' + escapeHtml(s.absenderTelefon) + '" ' + uiActionAttributes("document.setBriefSetting", ["absenderTelefon","$value"], "change") + '>' +

    '<label>Bankverbindung</label><input value="' + escapeHtml(s.bankverbindung) + '" ' + uiActionAttributes("document.setBriefSetting", ["bankverbindung","$value"], "change") + '>' +
    '<label class="brief-print-mode-switch"><span class="brief-print-mode-copy"><strong>Für Schwarzweißdruck optimieren</strong><small>Vorschau, PDF und Ausdruck werden kontrastreich in Graustufen dargestellt.</small></span><input type="checkbox" ' + (s.schwarzweissOptimiert === "Ja" ? 'checked ' : '') + uiActionAttributes("document.setBriefSetting", ["schwarzweissOptimiert",{checkedValues:["Ja","Nein"]}], "change") + ' aria-label="Für Schwarzweißdruck optimieren"><span class="brief-switch-track" aria-hidden="true"><span class="brief-switch-knob"></span></span></label>' +
    '<h3>Vorauszahlungsanpassung</h3>' +
    '<label>Im Brief andrucken?</label>' + selectHtml(s.vorauszahlungPrintMode, ["Nicht drucken","Berechnete Werte drucken","Manuelle Werte drucken"], "setBriefSetting('vorauszahlungPrintMode',this.value)") +
    '<label>Neue Vorauszahlung ab</label><input value="' + escapeHtml(s.vorauszahlungAb) + '" ' + uiActionAttributes("document.setBriefSetting", ["vorauszahlungAb","$value"], "change") + '>' +
    '<div class="hint"><strong>Berechnete Werte</strong> kommen aus dem neuen Tab „Vorauszahlungsanpassung“. Manuelle Werte darunter werden nur genutzt, wenn „Manuelle Werte drucken“ gewählt ist.</div>' +
    '<label>Manuell: Änderung Heizung monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeHeizung) + '" ' + uiActionAttributes("document.setBriefSetting", ["vzChangeHeizung","$value"], "change") + '>' +
    '<label>Manuell: Änderung Wasser monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeWasser) + '" ' + uiActionAttributes("document.setBriefSetting", ["vzChangeWasser","$value"], "change") + '>' +
    '<label>Manuell: Änderung Abfall monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeAbfall) + '" ' + uiActionAttributes("document.setBriefSetting", ["vzChangeAbfall","$value"], "change") + '>' +
    '<label>Manuell: Änderung Antenne monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeAntenne) + '" ' + uiActionAttributes("document.setBriefSetting", ["vzChangeAntenne","$value"], "change") + '>' +
    '<label>Manuell: Änderung sonstige Verbrauchskosten monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeSonstige) + '" ' + uiActionAttributes("document.setBriefSetting", ["vzChangeSonstige","$value"], "change") + '>';

  textsEl.innerHTML =
    '<label>Einleitungstext ({jahr}, {zeitraum}, {zahlungsziel} und {betrag} werden ersetzt)</label>' + textareaHtml(s.introText, "setBriefSetting('introText',this.value)") +
    '<label>Zahlungstext bei Nachzahlung</label>' + textareaHtml(s.saldoTextNachzahlung, "setBriefSetting('saldoTextNachzahlung',this.value)") +
    '<label>Zahlungstext bei Guthaben</label>' + textareaHtml(s.saldoTextGuthaben, "setBriefSetting('saldoTextGuthaben',this.value)") +
    '<label>Allgemeiner Hinweistext unter der Tabelle</label>' + textareaHtml(s.heizkostenFussnote, "setBriefSetting('heizkostenFussnote',this.value)") +
    '<label>Zusätzlicher Hinweistext (erzeugt Seite 2)</label>' + textareaHtml(s.outroText, "setBriefSetting('outroText',this.value)") +
    '<label>Text zur Vorauszahlungsanpassung ({datum} und {betrag} werden ersetzt)</label>' + textareaHtml(s.vorauszahlungIntro, "setBriefSetting('vorauszahlungIntro',this.value)") +
    '<label>Hinweis zum Dauerauftrag</label>' + textareaHtml(s.dauerauftragText, "setBriefSetting('dauerauftragText',this.value)") +
    '<label>Optionaler Abschlusstext vor der Grußformel</label>' + textareaHtml(s.abschlusstext, "setBriefSetting('abschlusstext',this.value)") +
    '<label>Grußformel</label>' + textareaHtml(s.gruss, "setBriefSetting('gruss',this.value)") +
    '<label>Signatur</label>' + textareaHtml(s.signatur, "setBriefSetting('signatur',this.value)") +
    '<label>Anlagenhinweis</label>' + textareaHtml(s.anlagenText, "setBriefSetting('anlagenText',this.value)");

  previewEl.dataset.hasBrief = selected && !briefValidation.errors.length ? "true" : "false";
  previewEl.dataset.validationErrors = String(briefValidation.errors.length);
  previewEl.dataset.validationWarnings = String(briefValidation.warnings.length);
  mountBriefPreview(previewEl, buildBriefHtml(calc, selected));
  requestAnimationFrame(applyBriefPreviewScale);
  if (!previewEl.__nkAp13ResizeObserver && typeof ResizeObserver !== "undefined") {
    previewEl.__nkAp13ResizeObserver = new ResizeObserver(applyBriefPreviewScale);
    const wrap = previewEl.closest(".letter-preview-wrap");
    if (wrap) previewEl.__nkAp13ResizeObserver.observe(wrap);
  }
}

function applyBriefPreviewScale() {
  const preview = document.getElementById("briefPreview");
  const wrap = preview && preview.closest(".letter-preview-wrap");
  if (!preview || !wrap) return;
  const root = briefPreviewRoot(preview);
  const documentNode = root && root.querySelector(".nk-letter-document");
  const pageCount = Math.max(1, Number(documentNode && documentNode.dataset.documentPages || 1));
  const pxPerMm = 96 / 25.4;
  const a4WidthPx = 210 * pxPerMm;
  const a4HeightPx = 297 * pxPerMm;
  const pageGapPx = 6 * pxPerMm;
  const availableWidth = Math.max(180, wrap.clientWidth - 40);
  const scale = Math.min(1, Math.max(0.25, availableWidth / a4WidthPx));
  preview.style.setProperty("--nk-letter-preview-scale", String(scale));
  preview.style.width = (a4WidthPx * scale) + "px";
  preview.style.height = ((pageCount * a4HeightPx + Math.max(0, pageCount - 1) * pageGapPx) * scale) + "px";
}
function currentBriefPreviewOrWarn() {
  const preview = document.getElementById("briefPreview");
  if (!preview) {
    alert("Die Briefvorschau wurde nicht gefunden. Bitte den Tab Abrechnungsbriefe neu öffnen.");
    return null;
  }
  const text = plainLetterTextFromHtml(briefPreviewSourceHtml(preview)).trim();
  if (preview.dataset.hasBrief !== "true" || !text) {
    alert("Es ist kein Brief verfügbar. Bitte prüfe, ob mindestens ein Empfänger vorhanden ist und eine Nebenkostenumlage berechnet werden kann.");
    switchToTab("briefe");
    return null;
  }
  return preview;
}

function printCurrentBrief() {
  const preview = currentBriefPreviewOrWarn();
  if (!preview) return;
  if (!confirmBriefAction("Druck/PDF des Briefs")) return;
  openPrintWindow("Nebenkostenabrechnungsbrief", briefPreviewSourceHtml(preview), "aktueller Brief", true);
}
function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    if (document.execCommand("copy")) alert("Brieftext wurde kopiert.");
    else alert("Brieftext konnte nicht automatisch kopiert werden. Bitte den Text in der Vorschau manuell markieren.");
  } catch(e) {
    alert("Brieftext konnte nicht automatisch kopiert werden. Bitte den Text in der Vorschau manuell markieren.");
  }
  textarea.remove();
}

function copyCurrentBriefText() {
  const preview = currentBriefPreviewOrWarn();
  if (!preview) return;
  if (!confirmBriefAction("Brieftext kopieren")) return;
  const text = plainLetterTextFromHtml(briefPreviewSourceHtml(preview)).trim();
  if (!text) {
    alert("Es ist kein Brieftext zum Kopieren vorhanden.");
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => alert("Brieftext wurde kopiert."))
      .catch(() => fallbackCopyText(text));
  } else {
    fallbackCopyText(text);
  }
}

const tableFilters = {};
const tableSortState = {};

const tableLabels = {
  issuesTable: "Offene Punkte",
  qualityIssuesTable: "Qualitätsprüfung",
  qualitySumsTable: "Summenabgleich",
  activeCostsTable: "Aktive Kostenarten",
  settingsTable: "Kostenarten & Einstellungen",
  kostenMieterUmlageTable: "Umlagefähigkeit je Mietverhältnis",
  wohnungenTable: "Wohnungsstammdaten",
  mieterTable: "Mietverhältnisse",
  mieterArchivTable: "Archivierte Mietverhältnisse",
  einnahmenTable: "Kaltmieteinnahmen",
  vorauszahlungenTable: "NK-Vorauszahlungen",
  startTenantTable: "Mieterverwaltung",
  startTenantArchiveTable: "Archivierte Mietverhältnisse",
  startUnitTable: "Wohnungsverwaltung",
  waterMeterTable: "Zählerstände",
  yearArchiveTable: "Jahresarchiv",
  umlageSummaryTable: "Umlage Ergebnis je Mieter",
  umlageCostsTable: "Umlage-Kontrolle nach Kostenart",
  umlageUnitProofTable: "Berechnungsnachweis je Wohnung",
  manualExternalValuesTable: "Manuelle und externe Werte",
  manualExternalControlTable: "Summen- und Quellenkontrolle"
};

