(function(global) {
  "use strict";

  // Dateinamen, Serialisierung, Downloads und fachwertneutrale Exportausgabe.
  // app.js behält nur kleine globale Kompatibilitätsweiterleitungen.

  function download(filename, content, type="text/plain") {
    try {
      const blob = new Blob([content], {type});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setActionMessage("Download vorbereitet: " + filename);
      renderActionFeedback();
      return true;
    } catch(e) {
      console.warn("Download konnte nicht erstellt werden", e);
      setActionMessage("Download konnte nicht vorbereitet werden.", "err");
      renderActionFeedback();
      if (typeof alert === "function") alert("Die Datei konnte nicht zum Download vorbereitet werden. Bitte Browser-Speicher und Berechtigungen prüfen.");
      return false;
    }
  }

  function safeFilePart(value) {
    return String(value || "").trim().replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "daten";
  }

  function downloadJsonFile(filename, data) {
    try {
      const content = JSON.stringify(data, null, 2);
      return download(filename, content, "application/json");
    } catch(e) {
      console.warn("JSON-Download konnte nicht erstellt werden", e);
      if (typeof alert === "function") alert("Die JSON-Datei konnte nicht erstellt werden. Bitte Datensatz und Browser-Speicher prüfen.");
      return false;
    }
  }

  function downloadFullJson() {
    const snapshot = exportSnapshot();
    const filename = backupFileName("nk-pro-gesamtbestand", snapshot);
    if (downloadJsonFile(filename, snapshot)) registerBackupEvent("full-json", filename);
  }

  function downloadCurrentBillingJson() {
    const snapshot = global.NKProBillingWorkflow.createSnapshot();
    const filename = backupFileName("nk-pro-abrechnung", snapshot);
    if (downloadJsonFile(filename, snapshot)) registerBackupEvent("current-json", filename);
  }

  function downloadJson() {
    return downloadCurrentBillingJson();
  }

  function csvEscape(value) { const s = String(value ?? ""); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }

  function toCsv(rows) { return rows.map(r => r.map(csvEscape).join(";")).join("\n"); }

  function downloadKostenCsv() {
    const header = ["Kosten-ID","Kostenart","Kostenbereich","In NK","Als Vorauszahlung","Berechnungsart","Umlageschlüssel","Ausschluss-Behandlung","Gesamtbetrag","Gesamtverbrauch","Preis pro Verbrauchseinheit","Preisquelle","Bemerkung","Status"];
    const rows = state.kostenarten.map(k => [k.id,k.kostenart,k.bereich,k.inNK,k.vorauszahlung,k.berechnungsart,k.umlageschluessel,costExclusionHandling(k),k.gesamtbetrag,k.gesamtverbrauch,k.preisProEinheit,(k.preisProEinheitManuell ? "manuell" : "automatisch"),k.bemerkung,global.NKProCostActions.kostenStatus(k)]);
    download("nk-pro-kostenarten.csv", toCsv([header, ...rows]), "text/csv;charset=utf-8");
  }

  function downloadMieterCsv() {
    ensureUnitIdentityData(state);
    ensureTenantContactData();
    const header = ["Mieter-ID","Wohnungs-ID","Mietername","Rolle","Geschlecht","Standardanrede","Straße","PLZ","Ort","Telefon","E-Mail","Einzug","Auszug","Kaltmiete Soll","Kaltmiete erhalten","NK-Voraus","Einmalige Korrektur / Gutschrift","Einnahmen","Aktive Tage","Personen","Status"];
    const rows = state.mieter.map(m => [m.id,m.wohnung,m.name,m.abrechnungRolle,m.geschlecht,m.standardanrede,m.strasse,m.plz,m.ort,m.telefon,m.email,m.einzug,m.auszug,m.kaltSoll,m.kaltErhalten,m.nkVoraus,m.vorjahresKorrektur,m.einnahmen,m.aktiveTage,m.personen,m.status]);
    download("nk-pro-mieter.csv", toCsv([header, ...rows]), "text/csv;charset=utf-8");
  }

  function csvFileName(prefix) {
    return safeFilePart(prefix || "nk-pro-export") + "-" + safeFilePart(currentAbrechnungsjahr()) + "-" + safeFilePart(APP_VERSION) + "-" + new Date().toISOString().slice(0,19).replace(/[:T]/g, "-") + ".csv";
  }

  function txtFileName(prefix) {
    return safeFilePart(prefix || "nk-pro-bericht") + "-" + safeFilePart(currentAbrechnungsjahr()) + "-" + safeFilePart(APP_VERSION) + "-" + new Date().toISOString().slice(0,19).replace(/[:T]/g, "-") + ".txt";
  }

  function downloadUmlageCsv() {
    const calc = calculateUmlage();
    const header = ["Typ","Mieter-ID","Wohnungs-ID","Name","Rolle","Kostenanteil","Vorauszahlungen","Korrektur","Saldo-Typ","Saldo-Betrag"];
    const rows = [];
    calc.tenantResults.forEach(r => {
      const s = settlementInfoForResult(r, r.tenant);
      rows.push(["Mieter", r.tenant.id, r.tenant.wohnung, r.tenant.name, r.tenant.abrechnungRolle || "Mieter", r.costShare, r.prepayments, r.correction, s.type, s.amount]);
    });
    calc.privateResults.forEach(r => {
      rows.push(["Eigentümer/Privat", r.tenant.id, r.tenant.wohnung, r.tenant.name, r.tenant.abrechnungRolle || "Eigentümer/Privat", r.costShare, r.prepayments, r.correction, "Privatanteil", r.costShare]);
    });
    download(csvFileName("nk-pro-umlage"), toCsv([header, ...rows]), "text/csv;charset=utf-8");
  }

  function downloadArchiveIndexCsv() {
    ensureYearData();
    const header = ["Jahr","Periode","Archiviert am","Status","Miet-/Einzelabrechnungen","Umlagefähige Kosten","Vorauszahlungen","Saldo","Perioden-ID"];
    const rows = (state.jahresArchiv || []).map((a, i) => {
      const saldo = archiveRecordSaldo(a);
      const validation = archiveItemValidation(a);
      const status = validation.errors.length ? "Fehler" : (validation.warnings.length ? "Prüfen" : "OK");
      return [a.year, archivePeriodLabel(a), dateDe(a.archivedAt), status, a.summary ? a.summary.mietverhaeltnisse : "", a.summary ? a.summary.kostenNK : "", a.summary ? a.summary.vorauszahlungen : "", saldo, archivePeriodId(a)];
    });
    download(csvFileName("nk-pro-jahresarchiv-index"), toCsv([header, ...rows]), "text/csv;charset=utf-8");
  }

  function downloadFinalBillingReport() {
    download(txtFileName("nk-pro-finaler-abrechnungscheck"), finalBillingReportText(), "text/plain;charset=utf-8");
  }

  function downloadAppHtmlCopy() {
    const htmlText = APP_HTML_TEMPLATE || ("<!DOCTYPE html>\n" + document.documentElement.outerHTML);
    const filename = "NK-Pro_Webbrowserseite_" + APP_VERSION + "_Qualitaets_Cockpit_Offline.html";
    download(filename, htmlText, "text/html;charset=utf-8");
  }

  function downloadExportPackage() {
    if (!confirm("Abrechnungs-Exportpaket herunterladen?\n\nEs werden mehrere Dateien nacheinander erzeugt: App-HTML, JSON nur für diese Abrechnung, Kostenarten-CSV, Mieter-CSV, Umlage-CSV und Prüfbericht-TXT. Das Jahresarchiv wird hier nicht exportiert.")) return;
    downloadAppHtmlCopy();
    downloadCurrentBillingJson();
    downloadKostenCsv();
    downloadMieterCsv();
    downloadUmlageCsv();
    downloadFinalBillingReport();
  }

  function downloadFullExportPackage() {
    if (!confirm("Vollständiges Exportpaket herunterladen?\n\nEs werden mehrere Dateien nacheinander erzeugt: App-HTML, Gesamt-JSON inkl. aktuellem Arbeitsstand und Jahresarchiv, Archiv-Index-CSV, aktuelle Umlage-CSV und aktueller Prüfbericht. Diese Funktion ist die Hauptsicherung über alles hinweg.")) return;
    downloadAppHtmlCopy();
    downloadFullJson();
    downloadArchiveIndexCsv();
    downloadUmlageCsv();
    downloadFinalBillingReport();
    registerBackupEvent("full-package", "Vollständiges Exportpaket " + APP_VERSION + " / " + currentAbrechnungsjahr());
  }

  global.NKProExportService = Object.freeze({
    download,
    safeFilePart,
    downloadJsonFile,
    downloadFullJson,
    downloadCurrentBillingJson,
    downloadJson,
    csvEscape,
    toCsv,
    downloadKostenCsv,
    downloadMieterCsv,
    csvFileName,
    txtFileName,
    downloadUmlageCsv,
    downloadArchiveIndexCsv,
    downloadFinalBillingReport,
    downloadAppHtmlCopy,
    downloadExportPackage,
    downloadFullExportPackage
  });
})(globalThis);
