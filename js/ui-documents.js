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

function prepaymentPercent(value, signed = false) {
  const n = num(value);
  const prefix = signed && n > 0.0001 ? "+" : "";
  return prefix + n.toLocaleString("de-DE", { minimumFractionDigits:1, maximumFractionDigits:1 }) + " %";
}

function prepaymentSelect(value, options, action, key) {
  return '<select ' + uiActionAttributes(action, [key,"$value"], "change") + '>' + options.map(option => '<option value="' + escapeHtml(option) + '"' + (String(option) === String(value) ? ' selected' : '') + '>' + escapeHtml(option) + '</option>').join('') + '</select>';
}

function renderPrepaymentAdjustment() {
  const settingsEl = document.getElementById("vorauszahlungAdjustSettings");
  const kpisEl = document.getElementById("vorauszahlungAdjustKpis");
  const costTableEl = document.getElementById("vorauszahlungAdjustCostTable");
  const summaryEl = document.getElementById("vorauszahlungAdjustSummaryTable");
  const noteEl = document.getElementById("vorauszahlungAdjustCalculationNote");
  if (!settingsEl || !kpisEl || !costTableEl || !summaryEl) return;

  const data = prepaymentAdjustmentData();
  const s = data.settings;
  const printModeOptions = ["Nicht drucken","Berechnete Werte drucken","Manuelle Werte drucken"];
  const priceEnabled = s.priceForecastEnabled === "Ja";
  const changeClass = Math.abs(data.totals.changeMonthly) < 0.005 ? "is-neutral" : (data.totals.changeMonthly > 0 ? "is-warning" : "is-success");
  const kpiIcon = path => '<span class="prepayment-adjustment-kpi__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg></span>';

  kpisEl.innerHTML =
    '<article class="prepayment-adjustment-kpi">' + kpiIcon('<rect x="4" y="3" width="16" height="18" rx="2"></rect><path d="M8 7h8M8 11h3M13 11h3M8 15h3M13 15h3"></path>') + '<span><small>Aktuelle monatliche Vorauszahlungen</small><strong>' + fmtMoney(data.totals.oldMonthly) + '</strong><em>Summe aller Mietverhältnisse</em></span></article>' +
    '<article class="prepayment-adjustment-kpi is-success">' + kpiIcon('<path d="M4 18 10 12l4 4 6-8"></path><path d="M15 8h5v5"></path>') + '<span><small>Empfohlene monatliche Vorauszahlungen</small><strong>' + fmtMoney(data.totals.recommendedMonthly) + '</strong><em>Nach Basis, Prognose und Regeln</em></span></article>' +
    '<article class="prepayment-adjustment-kpi ' + changeClass + '">' + kpiIcon('<path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5"></path>') + '<span><small>Veränderung monatlich</small><strong>' + fmtMoneySigned(data.totals.changeMonthly) + '</strong><em>' + prepaymentPercent(data.totals.changePercent, true) + ' gegenüber bisher</em></span></article>' +
    '<article class="prepayment-adjustment-kpi is-date">' + kpiIcon('<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>') + '<span><small>Anpassung gilt ab</small><strong>' + escapeHtml(s.effectiveFrom || '–') + '</strong><em>Für den kommenden Abrechnungszeitraum</em></span></article>';

  const forecastRows = data.costs.map(row => {
    const configured = s.priceForecastByCost && s.priceForecastByCost[row.cost.id] && typeof s.priceForecastByCost[row.cost.id] === "object" ? s.priceForecastByCost[row.cost.id] : {};
    const percentValue = configured.percent === undefined || configured.percent === null || configured.percent === "" ? "" : configured.percent;
    const sourceValue = configured.source || "";
    const dateValue = configured.effectiveFrom || s.effectiveFrom || "";
    return '<tr>' +
      '<td><strong>' + escapeHtml(row.cost.kostenart || row.cost.id) + '</strong><small>' + escapeHtml(row.cost.id || '') + '</small></td>' +
      '<td class="numeric"><input class="prepayment-forecast-percent" inputmode="decimal" value="' + escapeHtml(percentValue) + '" placeholder="' + escapeHtml(s.generalPriceChangePercent || 0) + '" ' + uiActionAttributes("billing.setPrepaymentCostForecastSetting", [row.cost.id,"percent","$value"], "change") + ' aria-label="Preisänderung ' + escapeHtml(row.cost.kostenart || row.cost.id) + ' in Prozent"></td>' +
      '<td><input value="' + escapeHtml(dateValue) + '" ' + uiActionAttributes("billing.setPrepaymentCostForecastSetting", [row.cost.id,"effectiveFrom","$value"], "change") + ' aria-label="Gültig ab ' + escapeHtml(row.cost.kostenart || row.cost.id) + '"></td>' +
      '<td><input value="' + escapeHtml(sourceValue) + '" placeholder="z. B. Versorgerinformation" ' + uiActionAttributes("billing.setPrepaymentCostForecastSetting", [row.cost.id,"source","$value"], "change") + ' aria-label="Begründung oder Quelle ' + escapeHtml(row.cost.kostenart || row.cost.id) + '"></td>' +
      '</tr>';
  }).join('') || '<tr><td colspan="4" class="prepayment-adjustment-empty">Keine vorauszahlungsrelevanten Kostenarten vorhanden.</td></tr>';

  settingsEl.innerHTML =
    '<section class="prepayment-rule-card"><header><span>A.</span><div><h3>Basisanpassung</h3><p>Grundlage ist die aktuelle Abrechnung beziehungsweise der individuelle Kostenanteil.</p></div></header><div class="prepayment-rule-fields">' +
      '<label><span>Unterjährige Mietzeiten hochrechnen</span>' + prepaymentSelect(s.annualizePartialTenants, ["Ja","Nein"], "billing.setPrepaymentAdjustmentSetting", "annualizePartialTenants") + '</label>' +
      '<label><span>Sicherheitszuschlag in %</span><input class="number" inputmode="decimal" value="' + escapeHtml(s.safetyBufferPercent) + '" ' + uiActionAttributes("billing.setPrepaymentAdjustmentSetting", ["safetyBufferPercent","$value"], "change") + '></label>' +
      '<label><span>Rundung der monatlichen Vorauszahlung</span>' + prepaymentSelect(s.roundingMode, ["Auf 1 € runden","Auf 5 € runden","Auf 10 € runden"], "billing.setPrepaymentAdjustmentSetting", "roundingMode") + '</label>' +
      '<label><span>Mindeständerung monatlich</span><input class="money" inputmode="decimal" value="' + escapeHtml(s.minimumMonthlyChange) + '" ' + uiActionAttributes("billing.setPrepaymentAdjustmentSetting", ["minimumMonthlyChange","$value"], "change") + '></label>' +
      '<label class="prepayment-rule-field--wide"><span>Änderungslogik</span>' + prepaymentSelect(s.changePolicy, ["Erhöhungen und Senkungen","Nur Erhöhungen","Nur Senkungen"], "billing.setPrepaymentAdjustmentSetting", "changePolicy") + '</label>' +
    '</div></section>' +
    '<section class="prepayment-rule-card prepayment-rule-card--forecast"><header><span>B.</span><div><h3>Preisprognose</h3><p>Erwartete allgemeine Preisänderungen für den kommenden Zeitraum werden getrennt vom Verbrauchseffekt ausgewiesen.</p></div></header><div class="prepayment-forecast-controls">' +
      '<label><span>Preisprognose aktivieren</span>' + prepaymentSelect(s.priceForecastEnabled, ["Nein","Ja"], "billing.setPrepaymentAdjustmentSetting", "priceForecastEnabled") + '</label>' +
      '<label><span>Allgemeine Preisänderung in %</span><input class="number" inputmode="decimal" value="' + escapeHtml(s.generalPriceChangePercent) + '" ' + uiActionAttributes("billing.setPrepaymentAdjustmentSetting", ["generalPriceChangePercent","$value"], "change") + ' ' + (priceEnabled ? '' : 'disabled') + '></label>' +
      '<p class="prepayment-forecast-hint">Ein leerer Kostenartwert übernimmt den allgemeinen Prozentsatz. Ein eingetragener Wert gilt nur für diese Kostenart.</p>' +
    '</div><div class="nk-ui-table-wrap prepayment-forecast-table-wrap"><table class="nk-ui-table nk-ui-table--compact prepayment-forecast-table"><thead><tr><th>Kostenart</th><th class="numeric">Preisänderung in %</th><th>Gültig ab</th><th>Begründung / Quelle</th></tr></thead><tbody>' + forecastRows + '</tbody></table></div></section>' +
    '<section class="prepayment-rule-card"><header><span>C.</span><div><h3>Ausgabe im Brief</h3><p>Steuert ausschließlich die Darstellung der Vorauszahlungsanpassung im Abrechnungsbrief.</p></div></header><div class="prepayment-rule-fields">' +
      '<label><span>Anpassung gilt ab</span><input value="' + escapeHtml(s.effectiveFrom) + '" ' + uiActionAttributes("billing.setPrepaymentAdjustmentSetting", ["effectiveFrom","$value"], "change") + '></label>' +
      '<label class="prepayment-rule-field--wide"><span>Vorauszahlungsanpassung im Brief</span>' + prepaymentSelect(s.letterPrintMode, printModeOptions, "billing.setPrepaymentAdjustmentSetting", "letterPrintMode") + '</label>' +
    '</div></section>';

  if (!priceEnabled) settingsEl.querySelectorAll('.prepayment-rule-card--forecast tbody input').forEach(input => input.disabled = true);

  const costRows = data.costs.map(row => '<tr>' +
    '<td><strong>' + escapeHtml(row.cost.kostenart || row.cost.id) + '</strong><small>' + escapeHtml(row.cost.id || '') + '</small></td>' +
    '<td class="money">' + fmtMoney(row.oldAnnual) + '</td>' +
    '<td class="money">' + fmtMoney(row.basisAnnual) + '</td>' +
    '<td class="numeric">' + prepaymentPercent(row.priceChangePercent, true) + '</td>' +
    '<td class="money">' + fmtMoney(row.priceAdjustedAnnual) + '</td>' +
    '<td class="numeric">' + prepaymentPercent(row.safetyBufferPercent, true) + '</td>' +
    '<td class="money">' + fmtMoney(row.recommendedAnnual) + '</td>' +
    '<td class="numeric">' + prepaymentPercent(row.changePercent, true) + '</td>' +
    '</tr>').join('') || '<tr><td colspan="8" class="prepayment-adjustment-empty">Keine vorauszahlungsrelevanten Kostenarten vorhanden.</td></tr>';

  costTableEl.innerHTML = '<thead><tr><th>Kostenart</th><th class="money">Aktuelle Vorauszahlungen jährlich</th><th class="money">Basis aus aktueller Abrechnung</th><th class="numeric">Preisänderung</th><th class="money">Prognose nach Preisänderung</th><th class="numeric">Sicherheitszuschlag</th><th class="money">Empfohlene Vorauszahlungen jährlich</th><th class="numeric">Anpassung</th></tr></thead><tbody>' + costRows + '</tbody><tfoot><tr><td>Summe</td><td class="money">' + fmtMoney(data.totals.oldAnnual) + '</td><td class="money">' + fmtMoney(data.totals.basisAnnual) + '</td><td class="numeric">–</td><td class="money">' + fmtMoney(data.totals.priceAdjustedMonthly * 12) + '</td><td class="numeric">' + prepaymentPercent(s.safetyBufferPercent, true) + '</td><td class="money">' + fmtMoney(data.totals.recommendedAnnual) + '</td><td class="numeric">' + prepaymentPercent(data.totals.changePercent, true) + '</td></tr></tfoot>';

  const summaryRows = data.summaries.map(row => '<tr>' +
    '<td>' + unitRefCellHtml(row.tenant.wohnung) + '<small>' + escapeHtml(row.tenant.name || '') + '</small></td>' +
    '<td>' + escapeHtml(row.tenant.abrechnungRolle || 'Mieter') + '</td>' +
    '<td class="money">' + fmtMoney(row.oldMonthlyTotal) + '</td>' +
    '<td class="money">' + fmtMoney(row.basisMonthlyTotal) + '</td>' +
    '<td class="numeric">' + prepaymentPercent(row.effectivePriceChangePercent, true) + '</td>' +
    '<td class="money">' + fmtMoney(row.recommendedTenantMonthly) + '</td>' +
    '<td class="money">' + fmtMoneySigned(row.changeTotal) + '</td>' +
    '<td class="numeric">' + prepaymentPercent(row.changePercent, true) + '</td>' +
    '</tr>').join('') || '<tr><td colspan="8" class="prepayment-adjustment-empty">Keine abrechenbaren Mietverhältnisse vorhanden.</td></tr>';

  summaryEl.innerHTML = '<thead><tr><th>Wohnung / Mieter</th><th>Nutzungsart</th><th class="money">Aktuelle Vorauszahlung mtl.</th><th class="money">Basis nach Abrechnung mtl.</th><th class="numeric">Preiseffekt</th><th class="money">Empfohlene Vorauszahlung mtl.</th><th class="money">Veränderung mtl.</th><th class="numeric">Veränderung</th></tr></thead><tbody>' + summaryRows + '</tbody><tfoot><tr><td colspan="2">Summe monatlich</td><td class="money">' + fmtMoney(data.totals.oldMonthly) + '</td><td class="money">' + fmtMoney(data.totals.basisMonthly) + '</td><td class="numeric">–</td><td class="money">' + fmtMoney(data.totals.recommendedMonthly) + '</td><td class="money">' + fmtMoneySigned(data.totals.changeMonthly) + '</td><td class="numeric">' + prepaymentPercent(data.totals.changePercent, true) + '</td></tr></tfoot>';

  if (noteEl) noteEl.innerHTML = '<strong>Berechnungsreihenfolge:</strong> Kostenanteil aus aktueller Abrechnung → gegebenenfalls auf zwölf Monate hochrechnen → Preisprognose anwenden → Sicherheitszuschlag anwenden → Monatsbetrag bilden → Rundungsregel anwenden → Änderungslogik und Mindeständerung prüfen.';
  if (typeof renderOverviewForTab === "function") renderOverviewForTab("vorauszahlungsanpassung");
}


function renderAnalyticsOverview() {
  const kpisEl = document.getElementById("analyticsOverviewKpis");
  const tableEl = document.getElementById("analyticsTenantTable");
  const noteEl = document.getElementById("analyticsOverviewNote");
  if (!kpisEl || !tableEl) return;
  const calc = calculateUmlage();
  const totals = umlageTotals(calc);
  const reviewModel = globalThis.NKProBillingReview && typeof globalThis.NKProBillingReview.currentModel === "function" ? globalThis.NKProBillingReview.currentModel(state) : null;
  const reviewSummary = reviewModel && reviewModel.summary ? reviewModel.summary : {};
  const totalCosts = Number.isFinite(Number(reviewSummary.totalCosts)) ? num(reviewSummary.totalCosts) : totals.totalCosts;
  const tenantShare = Number.isFinite(Number(reviewSummary.tenantShare)) ? num(reviewSummary.tenantShare) : totals.billableShare;
  const landlordShare = Number.isFinite(Number(reviewSummary.landlordTotal)) ? num(reviewSummary.landlordTotal) : totals.ownerShare;
  const tenantBalance = calc.tenantResults.reduce((sum, row) => sum + num(row.balance), 0);
  const kpi = (label, value, note) => '<article class="analytics-kpi"><small>' + escapeHtml(label) + '</small><strong>' + value + '</strong><span>' + escapeHtml(note) + '</span></article>';
  kpisEl.innerHTML =
    kpi("Gesamtkosten", fmtMoney(totalCosts), "Aktive Kostenarten") +
    kpi("Auf Mieter umgelegt", fmtMoney(tenantShare), calc.tenantResults.length + " Mietverhältnisse") +
    kpi("Vom Vermieter zu tragen", fmtMoney(landlordShare), "Privat-, Leerstands- und bestätigte Eigentümeranteile") +
    kpi("Saldo der Mieterabrechnungen", fmtMoneySigned(tenantBalance), tenantBalance >= 0 ? "Nachzahlungen gesamt" : "Guthaben gesamt");
  const rows = calc.tenantResults.map(row => '<tr><td>' + unitRefCellHtml(row.tenant.wohnung) + '<small>' + escapeHtml(row.tenant.name || '') + '</small></td><td class="money">' + fmtMoney(row.costShare) + '</td><td class="money">' + fmtMoney(row.prepayments) + '</td><td class="money">' + fmtMoney(row.correction) + '</td><td class="money">' + fmtMoneySigned(row.balance) + '</td></tr>').join('') || '<tr><td colspan="5" class="prepayment-adjustment-empty">Keine Abrechnungsdaten vorhanden.</td></tr>';
  tableEl.innerHTML = '<thead><tr><th>Wohnung / Mieter</th><th class="money">Kostenanteil</th><th class="money">Vorauszahlungen</th><th class="money">Korrekturen</th><th class="money">Saldo</th></tr></thead><tbody>' + rows + '</tbody>';
  if (noteEl) noteEl.textContent = "Diese erste Auswertungsübersicht ist rein lesend. Weitere Zeitreihen und Kostenentwicklungen können in einem späteren Arbeitsschritt ergänzt werden.";
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
  if (preflight.errors) add("err", "Brief-Preflight", preflight.errors + " kritische Abrechnungsmängel vor Druck/PDF.");
  else if (preflight.warnings) add("warn", "Brief-Preflight", preflight.warnings + " Hinweise vor Versand prüfen.");
  else add("ok", "Brief-Preflight", "Kein kritischer Abrechnungsmangel für den aktuellen Brief.");

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


const BRIEF_PREVIEW_SESSION_KEY = "nkpro.briefPreview.ap18";
const BRIEF_PREVIEW_MIN_SCALE = 0.4;
const BRIEF_PREVIEW_MAX_SCALE = 2;
const BRIEF_PREVIEW_STEP = 0.1;
let briefPreviewView = loadBriefPreviewView();

function loadBriefPreviewView() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(BRIEF_PREVIEW_SESSION_KEY) || "null");
    if (stored && stored.mode === "custom" && Number.isFinite(Number(stored.scale))) {
      return { mode:"custom", scale:Math.min(BRIEF_PREVIEW_MAX_SCALE, Math.max(BRIEF_PREVIEW_MIN_SCALE, Number(stored.scale))) };
    }
    if (stored && stored.mode === "width") return { mode:"width", scale:null };
  } catch (error) {
    // Ungültige sitzungsbezogene Darstellungswerte werden bewusst ignoriert.
  }
  return { mode:"page", scale:null };
}

function saveBriefPreviewView() {
  try {
    sessionStorage.setItem(BRIEF_PREVIEW_SESSION_KEY, JSON.stringify(briefPreviewView));
  } catch (error) {
    // Die Vorschau bleibt auch ohne Sitzungsspeicher vollständig bedienbar.
  }
}

function setBriefPreviewMode(mode, scale = null) {
  if (!["page","width","custom"].includes(mode)) return;
  briefPreviewView = {
    mode,
    scale:mode === "custom" ? Math.min(BRIEF_PREVIEW_MAX_SCALE, Math.max(BRIEF_PREVIEW_MIN_SCALE, Number(scale) || 1)) : null
  };
  saveBriefPreviewView();
  applyBriefPreviewScale();
}

function previewFitPage() { setBriefPreviewMode("page"); }
function previewFitWidth() { setBriefPreviewMode("width"); }
function previewZoomIn() { changeBriefPreviewZoom(BRIEF_PREVIEW_STEP); }
function previewZoomOut() { changeBriefPreviewZoom(-BRIEF_PREVIEW_STEP); }
function refreshBrief() {
  renderBrief();
  requestAnimationFrame(applyBriefPreviewScale);
}
function changeBriefPreviewZoom(delta) {
  const preview = document.getElementById("briefPreview");
  const current = Number(preview && preview.dataset.previewScale) || Number(briefPreviewView.scale) || 1;
  setBriefPreviewMode("custom", Math.round((current + delta) * 10) / 10);
}

function syncBriefPreviewControls(scale, mode) {
  const value = document.getElementById("briefZoomValue");
  if (value) value.textContent = Math.round(scale * 100) + " %";
  document.querySelectorAll('[data-toolbar-group="view"] [data-ui-action]').forEach(button => {
    const action = button.dataset.uiAction;
    const active = (mode === "page" && action === "document.previewFitPage") || (mode === "width" && action === "document.previewFitWidth");
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-pressed", "true");
    else if (action === "document.previewFitPage" || action === "document.previewFitWidth") button.setAttribute("aria-pressed", "false");
  });
  const zoomOut = document.querySelector('[data-ui-action="document.previewZoomOut"]');
  const zoomIn = document.querySelector('[data-ui-action="document.previewZoomIn"]');
  if (zoomOut) zoomOut.disabled = scale <= BRIEF_PREVIEW_MIN_SCALE + 0.001;
  if (zoomIn) zoomIn.disabled = scale >= BRIEF_PREVIEW_MAX_SCALE - 0.001;
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
    '<div class="hint"><strong>Empfängeradresse und Anrede</strong> werden im Tab „Mietverhältnisse“ beim jeweiligen Mietverhältnis gepflegt.</div>' +
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
  const monochromeToggle = document.getElementById("briefMonochromeToolbar");
  if (monochromeToggle) monochromeToggle.checked = s.schwarzweissOptimiert === "Ja";
  requestAnimationFrame(applyBriefPreviewScale);
  if (!previewEl.__nkAp18ResizeObserver && typeof ResizeObserver !== "undefined") {
    previewEl.__nkAp18ResizeObserver = new ResizeObserver(() => {
      if (briefPreviewView.mode !== "custom") applyBriefPreviewScale();
    });
    const viewport = document.getElementById("briefPreviewViewport");
    if (viewport) previewEl.__nkAp18ResizeObserver.observe(viewport);
  }
}

function applyBriefPreviewScale() {
  const preview = document.getElementById("briefPreview");
  const viewport = document.getElementById("briefPreviewViewport");
  const stage = document.getElementById("briefPreviewStage");
  if (!preview || !viewport || !stage) return;
  const root = briefPreviewRoot(preview);
  const documentNode = root && root.querySelector(".nk-letter-document");
  const pageCount = Math.max(1, Number(documentNode && documentNode.dataset.documentPages || 1));
  const pxPerMm = 96 / 25.4;
  const a4WidthPx = 210 * pxPerMm;
  const a4HeightPx = 297 * pxPerMm;
  const pageGapPx = 6 * pxPerMm;
  const viewportStyle = getComputedStyle(viewport);
  const horizontalPadding = parseFloat(viewportStyle.paddingLeft || 0) + parseFloat(viewportStyle.paddingRight || 0);
  const verticalPadding = parseFloat(viewportStyle.paddingTop || 0) + parseFloat(viewportStyle.paddingBottom || 0);
  const availableWidth = Math.max(180, viewport.clientWidth - horizontalPadding - 2);
  const availableHeight = Math.max(240, viewport.clientHeight - verticalPadding - 2);
  let scale;
  if (briefPreviewView.mode === "width") scale = availableWidth / a4WidthPx;
  else if (briefPreviewView.mode === "custom") scale = Number(briefPreviewView.scale) || 1;
  else scale = Math.min(availableWidth / a4WidthPx, availableHeight / a4HeightPx);
  scale = Math.min(BRIEF_PREVIEW_MAX_SCALE, Math.max(BRIEF_PREVIEW_MIN_SCALE, scale));
  const totalHeight = pageCount * a4HeightPx + Math.max(0, pageCount - 1) * pageGapPx;
  preview.style.setProperty("--nk-letter-preview-scale", String(scale));
  preview.style.width = (a4WidthPx * scale) + "px";
  preview.style.height = (totalHeight * scale) + "px";
  preview.dataset.previewScale = String(scale);
  preview.dataset.previewMode = briefPreviewView.mode;
  stage.dataset.pageCount = String(pageCount);
  stage.classList.toggle("is-single-page", pageCount === 1);
  syncBriefPreviewControls(scale, briefPreviewView.mode);
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
  textarea.className = "clipboard-fallback-input";
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

