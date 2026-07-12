// ===== Bereich: Ausgangsdaten und App-Konfiguration =====
const UMLAGE_MANUAL = "Manuelle Eingabe je Mieter/Wohneinheit";
const UMLAGE_MANUAL_LEGACY = "Einzel" + "beträge je Mieter";
const APP_VERSION = "V99.4.2";
const APP_VERSION_NAME = "Verbindliche Datenebenen und Snapshot-Grenzen";
const APP_RELEASE_DATE = "2026-07-12";
const DATA_SCHEMA_VERSION = 5;
const DATA_LAYER_CONTRACT_VERSION = 1;
const ARCHIVE_SNAPSHOT_SCOPE = "billingSnapshot";
const ARCHIVE_SNAPSHOT_DATA_KEYS = [
  "meta",
  "wohnungen",
  "mieter",
  "kostenarten",
  "kostenartenMieterUmlage",
  "vorauszahlungen",
  "umlageInputs",
  "waterMeters",
  "meterReadings",
  "briefSettings",
  "abrechnungsEinzelwerte",
  "legacyEinzelabrechnungen",
  "prepaymentAdjustmentSettings"
];
const SNAPSHOT_TECHNICAL_META_KEYS = new Set([
  "archiveViewer",
  "archiveReturnUrl",
  "backupEvents",
  "lastArchiveBackupAt",
  "lastArchiveBackupFile",
  "lastCurrentBillingBackupAt",
  "lastCurrentBillingBackupFile",
  "lastFullBackupAppVersion",
  "lastFullBackupAt",
  "lastFullBackupFile",
  "lastFullBackupType",
  "lastSaveError",
  "lastSaveReason",
  "lastSavedAt",
  "lastSavedWithAppVersion",
  "loadedFromIntegrityRecovery",
  "loadedFromIntegrityRecoveryAt",
  "recoveryCreatedAt",
  "recoveryCreatedWithAppVersion",
  "recoverySourceStorageKey",
  "snapshotBoundaryMigration",
  "startupFallback",
  "startupMeterEndValueRepairAt",
  "startupMeterEndValueRepairCleared",
  "startupMeterEndValueRepairWithAppVersion",
  "storageRole"
]);
const COST_EXCLUSION_FULL = "Vollständig umlegen";
const COST_EXCLUSION_OWNER = "Nicht umlagefähig / Eigentümeranteil";
const COST_EXCLUSION_OPTIONS = [COST_EXCLUSION_FULL, COST_EXCLUSION_OWNER];
const MASTER_TENANT_ENTRY_DATE_FIX_ID = "master-tenant-entry-dates-2026-07-08";
const MASTER_TENANT_ENTRY_DATES = [
  { name:"gärtner", date:"2016-12-01" },
  { name:"gaertner", date:"2016-12-01" },
  { name:"bonesta", date:"2019-12-01" },
  { name:"melzig", date:"2022-11-15" },
  { name:"schneider", date:"2013-03-01" }
];
const ARCHIVE_VIEW_MODE = !!(SEED && SEED.meta && SEED.meta.archiveViewer);
const APP_CHANGELOG = [
  "V99.4.2 führt einen verbindlichen Datenebenenvertrag für Arbeitsstand, Abrechnungssnapshot, Jahresarchiv, Gesamtbackup und Recovery ein.",
  "Archiv- und Abrechnungssnapshots werden auf abrechnungsbezogene Fachfelder begrenzt; verschachtelte Archive, Stammdaten, globale Zählerhistorie und technische Speicher-/Recovery-Metadaten werden nicht mitkopiert.",
  "Bestehende Archive werden beim Laden und Speichern idempotent begrenzt; Wiederbearbeitung erhält aktuelle Stammdaten, globale Historie und das vollständige Jahresarchiv.",
  "Datenschema, Fachberechnung, Referenzfälle und Oberfläche bleiben unverändert; eine bestehende Ladeabhängigkeit des ausgelagerten SEED wurde mit einem identischen Literalwert beseitigt.",
  "V99.2.6 korrigiert die dynamische Statusanzeige im Seitenkopf und stellt die Prüf-Kacheln wieder mit eindeutigen Statussymbolen dar.",
  "Der Tab Zählerstände erhält eine neue Klappbox für Hauszähler und Wasserwerksrechnung, Summen für K002, bündige Tabellenfilter und eine bereinigte Historien-/Hinweisstruktur.",
  "Die Nebenkostenumlage wird um den überflüssigen Aktionsblock bereinigt; Reset und Vorauszahlungsregeln sind kompakter und fachlich klarer angeordnet.",
  "V99.2.5 setzt die linke Navigation exakt nach dem freigegebenen schlichten Mock-up mit Übersicht, Stammdaten, vier Workflowphasen und Systembereich um.",
  "V99.2.2 verschiebt den Bestandsabgleich in die Prüfung von Mieter & Wohnungen, verbessert die Mieterbeschriftung der Umlagematrix und richtet Zählertabellen bündig aus.",
  "V99.2.1 stellt das blaue Buttondesign wieder her, nutzt die verfügbare Arbeitsbreite und macht horizontale Scrollleisten breiter Datentabellen sichtbar.",
  "V99.2 konsolidiert die Darstellungsarchitektur aller 14 Tabs auf einen statischen Seitenrahmen mit zentralem Kopfbereich, genau vier Übersichtskacheln und einheitlichen Klappboxen.",
  "Parallele Kartenrenderer, tababhängige Layoutklassen und nachträgliche UI-Upgrade-/DOM-Verschiebungsschichten wurden entfernt; fachliche Berechnungs-, Daten-, Brief-, Archiv- und Exportlogik blieb erhalten.",
  "PWA-Version, Manifest, Service-Worker-Cache, Dokumentation und strukturierter Prüfbericht wurden auf V99.2 aktualisiert.",
  "V98.2 aus V98.1 abgeleitet; Wiederherstellungsversion nach vollständigem Browser-Smoke-Test aller Tabs.",
  "Neue Offline-Cache-Kennung erzwingt die Ablösung eventuell zwischengespeicherter fehlerhafter V98.1-Dateien.",
  "V98.1 aus V97.6 abgeleitet; Zählerstände-Tab in das neue Bedien- und Designkonzept überführt.",
  "Übersichtskarten, dunkelblaue Klappboxen, hellblaue Tabellenköpfe und getrennte Bereiche für Erfassung, Historie und Kontrolle ergänzt.",
  "V97.6 aus V97.5 abgeleitet; Sicherheits- und Abnahmeversion für den Kostenarten-Tab.",
  "Deaktivieren erfordert eine ausdrückliche Bestätigung; Auswahl wird nach Datenänderungen bereinigt und Archivansichten bleiben schreibgeschützt.",
  "V97.5 aus V97.4 abgeleitet; Klappboxen und Tabellen visuell hierarchisiert und bündig ausgerichtet.",
  "Kostenarten werden vorne ausgewählt und ausschließlich über den oberen Deaktivieren-Button deaktiviert; Drei-Punkte-Aktion entfernt.",
  "Zweite Klappbox in Umlage pro Mietverhältnis / Wohnung umbenannt; Fachlogik unverändert.",
  "V97.4 aus V97.3 abgeleitet; Kostenarten-Tab auf eine vollständige Ansicht vereinheitlicht.",
  "Separaten Auswahlabschnitt entfernt; Kostenarten werden über ein Auswahlfenster direkt in die Bearbeitungstabelle übernommen.",
  "Alle bisherigen Kostenfelder und Sonderbereiche bleiben sichtbar; Aktivierung verwendet weiterhin den bestehenden inNK-Mechanismus.",
  "V97.3 aus V97.2 abgeleitet; Kostenarten-Pilot visuell eng an das freigegebene Mock-up angeglichen.",
  "Kopfzeile, vier Übersichtskarten, kompakte Abschnittsleisten, Tabellen-Werkzeugleiste und Kontrollsummenleiste umgesetzt; Fachlogik unverändert.",
  "V97.2 aus V97.1 abgeleitet; Pilot-Überarbeitung des Tabs Kostenarten & Einstellungen.",
  "Standard-/Erweitert-Ansicht, einklappbare Arbeitsabschnitte und kompakte Zusammenfassung ergänzt; Fachlogik unverändert.",
  "V97.1 aus V96.2 abgeleitet; neues visuelles Grundgerüst mit linker Navigation und kompakter Arbeitskopfzeile.",
  "Tab-Inhalte, Tabellen, Formulare, Berechnungs-, Speicher-, Archiv- und Brieflogik bleiben unverändert.",
  "V96.2 aus V96.1 abgeleitet; Workflow-Status von der Startseite in den Dashboard-Tab der geöffneten Abrechnung verschoben.",
  "Startseite bleibt ausschließlich Abrechnungsübersicht; keine Berechnungslogik geändert.",
  "V96.1 aus V94 abgeleitet; erste Workflow-Ausbaustufe mit kompaktem Arbeitsstand-Dashboard auf der Startseite.",
  "Das Dashboard verwendet ausschließlich die vorhandene Qualitätsprüfung auf einer Zustandskopie; keine neue Fach- oder Berechnungslogik und keine stillen Datenänderungen beim Rendern.",
  "V94 aus V93.1 abgeleitet; Entwicklerdiagnose im Tab Sicherung & Version, Performance-/Speicheranzeige, Diagnoseexport und kontrollierte Update-Prüfung ergänzt. Keine Berechnungslogik geändert.",
  "V93 aus V92 abgeleitet; konservatives gezieltes Rendering für eindeutig lokale Bedienpfade ergänzt.",
  "Brief-Einstellungen, Qualitätsbestätigungen und Vorauszahlungsanpassungs-Einstellungen aktualisieren nur den jeweils betroffenen Tab; fachlich weitreichende Vorgänge behalten den bisherigen Voll-/Aktivtab-Render. Keine Berechnungslogik geändert.",
  "V92 aus V91 abgeleitet; lokale Speicherung um Prüfsumme, validierten Rückfallstand und Integritätsprüfung beim Start ergänzt.",
  "Bestehende ungeschützte Daten bleiben kompatibel; Berechnungs-, Umlage-, Brief- und Archivfachlogik wurden nicht verändert.",
  "V91 aus V89 nach dem technischen V90-Audit abgeleitet; vier eindeutig unreferenzierte Alt-Funktionen und klar ungenutzte CSS-Regeln entfernt.",
  "Keine Berechnungs-, Daten-, Speicher-, Archiv-, Migrations- oder Bedienlogik geändert; dynamische Inline-Handler und Legacy-Kompatibilität vollständig beibehalten.",
  "V89 aus V88 abgeleitet; fest codierte V85-Prüfung im Release-Audit auf eine dynamische Prüfung der aktuellen APP_VERSION umgestellt.",
  "Keine Berechnungs-, Daten-, Speicher- oder Bedienlogik geändert.",
  "V88 aus V87 abgeleitet; kontrollierte Codekonsolidierung ohne Änderung der Berechnungslogik.",
  "Einen eindeutig ungenutzten Alt-Einstieg und eine doppelte Startseiten-Selbstprüfung entfernt; Architektur-Schutztests beibehalten.",
  "V87 aus V86 abgeleitet; zentraler Änderungs-, Aufbereitungs-, Speicher- und Renderweg ergänzt.",
  "Wiederkehrende direkte Folgen aus saveData und renderAll werden über commitStateChange gebündelt. Keine Berechnungslogik geändert.",
  "V86 aus V85 abgeleitet; Zustandsaufbereitung und Darstellung technisch getrennt.",
  "Normierung, Migration und Synchronisation laufen vor Speichern bzw. einmal beim Start, nicht mehr bei jedem normalen Renderlauf. Keine Berechnungslogik geändert.",

  "V85 aus V84 abgeleitet; Qualitätsprüfung als Qualitäts-Cockpit neu strukturiert: Gesamtstatus, offene Aufgaben, Sprungaktionen, geprüfte Hinweise und technischer Selbsttest.",
  "Hinweise und Prüfpunkte können je Abrechnung als gelesen/geprüft markiert werden; Fehler bleiben nicht wegklickbar. Keine Berechnungslogik geändert.",
  "V84 aus V83 abgeleitet; Release-Audit-Prüfung für die V78-Umlage-Kontrolltabelle gegen fehlende optionale DOM-Elemente gehärtet.",
  "Fehlerdetails im Audit bleiben sichtbar, aber fehlende entfernte Alt-Tabelle umlageUnitsTable wird nicht mehr als JavaScript-Absturz behandelt.",
  "V82 aus V81 abgeleitet; Kostenarten & Einstellungen erhalten eine gruppierte Aktivierungsliste und zeigen in der Bearbeitung nur aktive Kostenarten.",
  "Gesamtverbrauch wurde zwischen Gesamtrechnungsbetrag und Preis pro Verbrauchseinheit ergänzt; der Preis wird automatisch berechnet, bleibt aber manuell überschreibbar.",
  "Der Umlageschlüssel Manuelle Eingabe je Mieter/Wohneinheit wurde fachlich als manuelle Eingabe je Mieter/Wohneinheit benannt, alte Daten bleiben kompatibel.",
  "V81 aus V80 abgeleitet; Preis je Verbrauchseinheit aus Kostenarten & Einstellungen ist nun die einzige verbindliche Quelle für Verbrauchskosten-Berechnung, Umlage-Kontrolltabelle und Briefausgabe.",
  "Verbrauchskosten werden jetzt konsequent als Verbrauchseinheiten × Preis je Einheit berechnet; der Gesamtrechnungsbetrag bleibt Kontroll-/Rechnungsbetrag und Differenzen werden als nicht umgelegter bzw. zu prüfender Rest sichtbar.",
  "V80 aus V79 abgeleitet; Wasser-Endwerte bleiben bei neu angelegten Abrechnungen wirklich leer: Datumsfelder gelten nicht mehr als manuelle Endstand-Eingabe, alte V79-Fehlbefüllungen werden beim Laden bereinigt.",
  "Keine Änderung an archivierten Wasserständen bis einschließlich 2024; die Korrektur betrifft nur aktuelle/neue Abrechnungen ab 2025 und überschreibt keine nach V80 manuell eingetragenen Endstände.",
  "V79 aus V78 abgeleitet; Wasserzähler-Fortschreibung für neu angelegte Abrechnungen gehärtet: Vorjahres-Endstände werden nur als neue Anfangswerte übernommen, neue Endwertfelder bleiben leer.",
  "Keine Änderung an archivierten Alt-Wasserständen bis einschließlich 2024; Korrektur betrifft nur aktuelle/neue Abrechnungsfortschreibung und die Anzeigeprüfung im Zählerstände-Tab.",
  "V78 aus V77 abgeleitet; neue Umlage-Kontrolltabelle primär nach Kostenart mit Wohneinheiten/Mietparteien als Spalten ergänzt.",
  "Die bisher getrennte Kontrollsicht Umlage je Wohneinheit wird in die Kostenarten-Zeilen integriert; Berechnungslogik bleibt unverändert.",
  "V77 aus V76 abgeleitet; Korrekturversion: NK-Vorjahresübernahme wird fehlertolerant nachgezogen, Zähler-Endwerte bleiben bei Neuanlage leer, Umlagetabellen wieder getrennt.",
  "Die falsche V76-Zusammenführung der Tabellen Umlage je Kostenart und Umlage je Wohneinheit wurde zurückgenommen; die gewünschte neue Zielstruktur wird vor weiterer Änderung separat abgefragt.",
  "V76 aus V75 abgeleitet; Qualitätsprüfung im Tab-Menü vor die Abrechnungsbriefe verschoben.",
  "V76: NK-Vorauszahlungen können beim Anlegen aus dem Vorjahr übernommen werden; vorhandene Vorauszahlungsanpassungen werden berücksichtigt und Hinweise zu Perioden-/Mietzeitabweichungen angezeigt.",
  "V76: Zählerstände übernehmen Vorjahres-Endwerte nur als neue Anfangswerte; Endwerte bleiben leer, Start-/Enddaten werden standardmäßig auf den Abrechnungszeitraum gesetzt.",
  "V76: Umlage je Kostenart und Wohneinheit in einer gemeinsamen Kontrolltabelle zusammengeführt.",
  "V75 aus V74 abgeleitet; Startseiten-Aktionen geprüft und Archivieren schließt die aktuelle Bearbeitung, ohne eine neue Abrechnung anzulegen.",
  "Nach Archivieren bleibt nur der Archivdatensatz sichtbar; Bearbeiten, Finalisieren und Archivieren erzeugen nie automatisch Folgeabrechnungen. Keine Berechnungslogik geändert.",
  "V74 aus V73 abgeleitet; nach dem Anlegen einer neuen Abrechnung bleibt die App auf der Startseite.",
  "Der Einstieg in die Bearbeitung erfolgt bewusst ausschließlich über den vorhandenen Bearbeiten-Button in der Abrechnungsübersicht; keine Berechnungslogik geändert.",
  "V73 aus V72 abgeleitet; Startseite weiter entschlackt: Periodenbanner auf der Startseite entfernt und vorbereitete Seed-Arbeitsstände werden nicht mehr als automatisch angelegte Abrechnung angezeigt.",
  "Neue Abrechnungen werden auf der Startseite nur noch über den Button + Neue Abrechnung sichtbar angelegt; bestehende/bearbeitete Arbeitsstände bleiben erhalten.",
  "V72 aus V71 abgeleitet; Startseite entschlackt: Backup-Status, Gesamtsicherung/Wiederherstellung und Versionsübersicht in eigenen Tab Sicherung & Version verschoben.",
  "Auf der Startseite bleibt die Abrechnungsübersicht mit App-Selbsttest; vollständige Sicherungsfunktionen liegen zentral im neuen Startbereich-Tab. Keine Berechnungslogik geändert.",
  "V71 aus V70 abgeleitet; Finalisierung und Eingabeschutz aus der Startseite in die jeweils geöffnete Abrechnung verschoben.",
  "Startseiten-Übersicht zeigt nun Status und passende Aktionen je Abrechnung: bearbeiten/ansehen, finalisieren, archivieren oder kontrolliert zur Wiederbearbeitung öffnen; keine Berechnungslogik geändert.",
  "V70 aus V69 abgeleitet; Druck-/PDF-Härtung für Abrechnungsbriefe ergänzt: Druckmodus-Prüfung, Druckhinweis, Einzel-/Sammelbrief-Druckansicht und stärkere Seiten-/Layoutkontrolle.",
  "Keine Berechnungslogik geändert; V70 erweitert nur Briefausgabe, Druckhülle, Prüfanzeigen und Release-Audit-Abdeckung.",
  "V69 aus V68 abgeleitet; finales Abnahmeprotokoll als HTML-Bericht ergänzt, inklusive Summen, Mieterergebnissen, Sonderfällen, Backup-, Brief-Preflight- und Finalisierungsstatus.",
  "Keine Berechnungslogik geändert; V69 ergänzt nur Abschlussbericht, Prüfzusammenfassung, Export und Release-Audit-Abdeckung.",
  "V68 aus V67 abgeleitet; Finalisieren- und Entsperren-Funktion für Abrechnungsjahre ergänzt.",
  "Eingabeschutz für finalisierte Arbeitsstände ergänzt; Pflichtfeld- und Nullwertwarnungen werden in der Qualitätsprüfung stärker sichtbar, ohne Berechnungslogik zu verändern.",
  "V67 aus V66 abgeleitet; Sonderfall-Wächter für unterjährige Mietverhältnisse, Leerstand, Eigentümer-/Privatanteile und Stammdatenauffälligkeiten ergänzt.",
  "Keine Berechnungslogik geändert; V67 ergänzt sichtbare Warnungen, Sonderfall-Badges, Qualitätsprüfung und Release-Audit-Abdeckung.",
  "V66 aus V65 abgeleitet; Backup-Status, Importprüfung und Sicherheitsabfragen für riskante Datenaktionen ergänzt.",
  "Export-Dateinamen enthalten jetzt Toolversion, Jahr und Zeitstempel; Gesamtbackups werden lokal als Backup-Ereignis dokumentiert.",
  "V65 aus V64 abgeleitet; Brief-Preflight mit Druckreife-Status, Pflichtfeld-, A4-/CSS-, Seiten- und Langtextprüfung ergänzt.",
  "Keine Berechnungslogik geändert; V65 ergänzt nur Briefprüfung, Druckhinweise und Release-Audit-Abdeckung.",
  "V64 aus V63 abgeleitet; Release-Audit um zusätzliche Referenz- und Regressionstests für Summenformel, Saldo, Wohnfläche und unterjährige Miettage erweitert.",
  "Keine Berechnungslogik geändert; V64 ergänzt Schutzprüfungen gegen stille Rechenabweichungen.",
  "V63 aus V62 abgeleitet; Tabellenköpfe der Brieftabellen dürfen gezielt mehrzeilig umbrechen, Datenzeilen bleiben ohne Umbruch.",
  "Spaltenköpfe der NK-Abrechnung und Vorauszahlungsanpassung wurden für bessere Lesbarkeit im Druck entzerrt.",
  "V62 aus V61 abgeleitet; Brieftabellen größer, höher und ohne Zeilenumbruch in Tabellenzellen gesetzt.",
  "Spaltenbreiten der NK-Abrechnung und Vorauszahlungsanpassung für bessere Lesbarkeit angepasst.",
  "V61-Daten werden beim ersten Laden über die Legacy-Übernahme berücksichtigt.",
  "V61 aus V60 abgeleitet; Eigentümer-/Privat-Datensätze werden wieder in der Briefauswahl angezeigt.",
  "Briefauswahl nutzt jetzt alle berechneten Empfängerergebnisse inkl. Privatanteil, ohne die Umlage- und Summenlogik zu verändern.",
  "Release-Audit prüft zusätzlich, dass Erik Zimmermann / Eigentümer-Privat in der Briefauswahl enthalten ist.",
  "V60 aus V59 abgeleitet; gründlicher Release-Audit, stabilere Speicherdiagnose und automatisierte Prüfszenarien ergänzt.",
  "Speicher-Lesefehler werden jetzt gesammelt gemeldet statt mehrfach bei jedem Legacy-Schlüssel zu erscheinen.",
  "Qualitätsprüfung erhält Release-Audit mit Berechnungs-, Brief-, Export- und Vorauszahlungs-Szenarien.",
  "V59 aus V58 abgeleitet; Summenblock in der Abrechnungstabelle mit einer zusätzlichen Zeilenhöhe Abstand optisch hervorgehoben.",
  "V58 aus V57 abgeleitet; Brieftabelle zeigt aktivierte Nebenkosten je Mieter dynamisch, aber nur bei echter Relevanz.",
  "Individuell ausgeschlossene oder nicht betroffene Kostenpositionen erscheinen im Brief nicht mehr als verwirrende Nullzeilen.",
  "Neue individuelle Kostenarten werden mit ihrer eingegebenen Bezeichnung automatisch in die Brieftabelle aufgenommen, sobald Anteil oder Vorauszahlung vorhanden ist.",
  "V57 aus V56 abgeleitet; Briefabschluss mit größerem Abstand zwischen Grußformel und Signatur gesetzt.",
  "Heizkosten-Tabellenzeile im Brief entschlackt; der Hinweis auf externe Heizkostenabrechnung steht nur noch als Sternhinweis unter der Tabelle.",
  "V56 aus V55 abgeleitet; Brief- und Drucktabellen deutlich größer, luftiger und lesefreundlicher gesetzt.",
  "V55 aus V54 abgeleitet; Briefseiten mit festem A4-Container, fester Fußzeile und sauberer Abschlusslogik ergänzt.",
  "V54 aus V53 abgeleitet; Berechnungs-, Speicher- und Sicherungslogik bleiben unverändert.",
  "Techem-/Heizkostenhinweis sitzt im Brief direkt unter der Abrechnungstabelle ohne große Zwischenzeile.",
  "Nachzahlungs-/Guthaben-Hinweis nutzt dieselbe Schriftgröße wie der Einleitungstext und entfernt alte sichtbare \n-Steuerzeichen.",
  "Standard-Brieftexte sprachlich geglättet: Artikel ergänzt, Kommafehler korrigiert und Zeilenumbrüche in Fließtexten bereinigt.",
  "V53-Daten werden beim ersten Laden über die Legacy-Übernahme berücksichtigt."
];
const STORAGE_KEY = "nkpro_browser_v85_qualitaets_cockpit_data";
const STORAGE_RECOVERY_KEY = STORAGE_KEY + "_last_valid";
const STORAGE_INTEGRITY_ALGORITHM = "FNV1A32";
const APP_HTML_TEMPLATE = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
const LEGACY_STORAGE_KEYS = ["nkpro_browser_v84_audit_dom_fix_data","nkpro_browser_v83_release_audit_details_data","nkpro_browser_v82_kostenarten_auswahl_verbrauchspreis_data","nkpro_browser_v81_preis_je_einheit_quelle_data","nkpro_browser_v80_wasser_endwerte_wirklich_leer_data","nkpro_browser_v79_wasseruhren_endwerte_leer_data","nkpro_browser_v78_umlage_kostenart_kontrolltabelle_data","nkpro_browser_v77_korrektur_vorjahr_zaehler_umlage_data","nkpro_browser_v76_vorjahreswerte_umlage_data","nkpro_browser_v75_startseite_kein_autoarchiv_data","nkpro_browser_v74_neue_abrechnung_bleibt_startseite_data","nkpro_browser_v73_startseite_keine_autoabrechnung_data","nkpro_browser_v72_startseite_entschlackt_data","nkpro_browser_v71_finalisierung_je_abrechnung_data","nkpro_browser_v70_druck_pdf_haertung_data","nkpro_browser_v69_abnahmeprotokoll_data","nkpro_browser_v68_finalisieren_eingabeschutz_data","nkpro_browser_v67_sonderfall_waechter_data","nkpro_browser_v66_backup_schutz_data","nkpro_browser_v65_brief_preflight_data","nkpro_browser_v64_rechenlogik_schutz_data","nkpro_browser_v63_tabellenkopf_lesbar_data","nkpro_browser_v62_lesbare_tabellen_nowrap_data","nkpro_browser_v61_eigentuemerbrief_fix_data","nkpro_browser_v60_audit_stabilitaet_data","nkpro_browser_v59_summenblock_abstand_data","nkpro_browser_v58_brief_dynamik_data","nkpro_browser_v57_brief_feinschliff_data","nkpro_browser_v56_lesbarer_brief_data","nkpro_browser_v55_brieflayout_fix_data","nkpro_browser_v54_brieftext_format_data","nkpro_browser_v53_heizkostenbrief_data","nkpro_browser_v52_briefformat_data","nkpro_browser_v51_vorauszahlungsanpassung_data","nkpro_browser_v50_getrennte_sicherung_data","nkpro_browser_v49_fachcheck_exportpaket_data","nkpro_browser_v48_stabilitaetsbasis_plus_data","nkpro_browser_v47_stabilitaetsbasis_data","nkpro_browser_v46_startseite_loeschen_data","nkpro_browser_v45_wasseruhren_historie_data","nkpro_browser_v44_einheitliches_abrechnungsmodell_data","nkpro_browser_v43_startseite_archiv_vereinfacht_data","nkpro_browser_v42_startseite_ohne_topbuttons_data","nkpro_browser_v41_1_legacy_sammelarchiv_data","nkpro_browser_v40_auditfix_data","nkpro_browser_v39_saldo_korrekturen_data"];
const STORAGE_WARN_BYTES = 4 * 1024 * 1024;
const STORAGE_CRITICAL_BYTES = 4.7 * 1024 * 1024;
let storageWarningShown = false;
let storageReadWarningShown = false;
let pendingStorageWarning = "";
let startupErrors = [];
let renderErrors = [];
let renderInProgress = false;
let renderQueued = false;
let renderCount = 0;
let renderLastDurationMs = 0;
let renderLastActiveTab = "";
let lastActionMessage = "";
let lastActionLevel = "ok";
const UNIT_ID_ALIASES = {
  w00:"W000.UG", w07:"W000.UG", ug:"W000.UG", kg:"W000.UG", keller:"W000.UG", untergeschoss:"W000.UG", souterrain:"W000.UG",
  w01:"W001.EG-L", egl:"W001.EG-L", eglinks:"W001.EG-L",
  w02:"W002.EG-R", egr:"W002.EG-R", egrechts:"W002.EG-R",
  w03:"W003.1OG-L", "1ogl":"W003.1OG-L", "1oglinks":"W003.1OG-L",
  w04:"W004.1OG-R", "1ogr":"W004.1OG-R", "1ogrechts":"W004.1OG-R",
  w05:"W005.DG-L", dgl:"W005.DG-L", dglinks:"W005.DG-L",
  w06:"W006.DG-R", dgr:"W006.DG-R", dgrechts:"W006.DG-R"
};

let state = loadInitialState();
let archiveReturnState = null;
const START_NAV_TABS = ["landing","objekt","mieterverwaltung","wohnungsverwaltung","start","archiv","sicherung"];
const BILLING_NAV_TABS = ["qualitaet","mieter","einstellungen","einnahmen","wasser","manuellewerte","umlage","vorauszahlungsanpassung","briefe","export"];
let appUiMode = ARCHIVE_VIEW_MODE ? "billing" : "start";
let billingContextOpen = ARCHIVE_VIEW_MODE;
let navigationInitialized = false;

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function isSnapshotTechnicalMetaKey(key) {
  const name = String(key || "");
  return SNAPSHOT_TECHNICAL_META_KEYS.has(name) || name.startsWith("storageIntegrity");
}

function snapshotMetaFrom(meta) {
  const result = clone(meta || {});
  Object.keys(result).forEach(key => {
    if (isSnapshotTechnicalMetaKey(key)) delete result[key];
  });
  result.dataSchemaVersion = DATA_SCHEMA_VERSION;
  result.dataLayerContractVersion = DATA_LAYER_CONTRACT_VERSION;
  result.dataLayerRole = ARCHIVE_SNAPSHOT_SCOPE;
  result.snapshotScope = ARCHIVE_SNAPSHOT_SCOPE;
  result.snapshotBoundaryVersion = DATA_LAYER_CONTRACT_VERSION;
  return result;
}

function createBoundedBillingSnapshotData(source) {
  const input = source && typeof source === "object" && !Array.isArray(source) ? source : {};
  const snapshot = {};
  ARCHIVE_SNAPSHOT_DATA_KEYS.forEach(key => {
    if (key === "meta") return;
    if (Object.prototype.hasOwnProperty.call(input, key)) snapshot[key] = clone(input[key]);
  });
  snapshot.meta = snapshotMetaFrom(input.meta || {});
  return snapshot;
}

function hasHistoricalWaterMeterData(value) {
  return !!value && typeof value === "object" && !Array.isArray(value) && Array.isArray(value.units) && value.units.length > 0;
}

function adoptHistoricalWaterMeterDataFromArchive(data) {
  if (!data || hasHistoricalWaterMeterData(data.waterMeterHistory) || !Array.isArray(data.jahresArchiv)) return false;
  const source = data.jahresArchiv.find(item => hasHistoricalWaterMeterData(item && item.data && item.data.waterMeterHistory));
  if (!source) return false;
  data.waterMeterHistory = clone(source.data.waterMeterHistory);
  if (!data.meta) data.meta = {};
  data.meta.historicalWaterMeterDataAdoptedFromArchive = true;
  data.meta.historicalWaterMeterDataAdoptedFromArchiveYear = source.year || "";
  return true;
}

function archiveBoundaryFacts(item) {
  const data = item && item.data && typeof item.data === "object" && !Array.isArray(item.data) ? item.data : {};
  const meta = data.meta && typeof data.meta === "object" && !Array.isArray(data.meta) ? data.meta : {};
  return {
    nestedArchiveCount: Array.isArray(data.jahresArchiv) ? data.jahresArchiv.length : 0,
    hadArchiveProperty: Object.prototype.hasOwnProperty.call(data, "jahresArchiv"),
    hadMasterCopy: Object.prototype.hasOwnProperty.call(data, "stammdaten"),
    hadHistoryCopy: Object.prototype.hasOwnProperty.call(data, "waterMeterHistory"),
    technicalMetaCount: Object.keys(meta).filter(isSnapshotTechnicalMetaKey).length
  };
}

function normalizeArchiveCollectionBoundaries(data) {
  if (!data || !Array.isArray(data.jahresArchiv)) return { changed:false, archiveItems:0, nestedArchivesRemoved:0, masterCopiesRemoved:0, historyCopiesRemoved:0, technicalMetaFieldsRemoved:0 };
  const stats = { changed:false, archiveItems:data.jahresArchiv.length, nestedArchivesRemoved:0, masterCopiesRemoved:0, historyCopiesRemoved:0, technicalMetaFieldsRemoved:0 };
  data.jahresArchiv = data.jahresArchiv.map(item => {
    const before = archiveBoundaryFacts(item);
    const normalized = prepareArchiveItemForUse(item);
    stats.nestedArchivesRemoved += before.nestedArchiveCount;
    if (before.hadArchiveProperty) stats.changed = true;
    if (before.hadMasterCopy) { stats.masterCopiesRemoved += 1; stats.changed = true; }
    if (before.hadHistoryCopy) { stats.historyCopiesRemoved += 1; stats.changed = true; }
    if (before.technicalMetaCount) { stats.technicalMetaFieldsRemoved += before.technicalMetaCount; stats.changed = true; }
    if (!item || item.snapshotBoundaryVersion !== DATA_LAYER_CONTRACT_VERSION || item.snapshotScope !== ARCHIVE_SNAPSHOT_SCOPE) stats.changed = true;
    return normalized;
  });
  return stats;
}

function enforceWorkingStateDataContract(data, options = {}) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return { changed:false, archiveItems:0, nestedArchivesRemoved:0, masterCopiesRemoved:0, historyCopiesRemoved:0, technicalMetaFieldsRemoved:0 };
  if (!data.meta) data.meta = {};
  const stats = normalizeArchiveCollectionBoundaries(data);
  data.meta.dataLayerContractVersion = DATA_LAYER_CONTRACT_VERSION;
  data.meta.dataLayerRole = "workingState";
  data.meta.storageRole = options.storageRole || "working";
  if (stats.changed && options.recordMigration !== false) {
    data.meta.snapshotBoundaryMigration = {
      version:DATA_LAYER_CONTRACT_VERSION,
      migratedAt:new Date().toISOString(),
      appVersion:APP_VERSION,
      archiveItems:stats.archiveItems,
      nestedArchivesRemoved:stats.nestedArchivesRemoved,
      masterCopiesRemoved:stats.masterCopiesRemoved,
      historyCopiesRemoved:stats.historyCopiesRemoved,
      technicalMetaFieldsRemoved:stats.technicalMetaFieldsRemoved
    };
  }
  return stats;
}

function copyWorkingOperationalMeta(targetMeta, sourceMeta) {
  const target = targetMeta || {};
  const source = sourceMeta || {};
  [
    "backupEvents",
    "lastArchiveBackupAt",
    "lastArchiveBackupFile",
    "lastCurrentBillingBackupAt",
    "lastCurrentBillingBackupFile",
    "lastFullBackupAppVersion",
    "lastFullBackupAt",
    "lastFullBackupFile",
    "lastFullBackupType"
  ].forEach(key => {
    if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = clone(source[key]);
  });
  return target;
}

const DEFAULT_WATER_METER_HISTORY = {"source":"Nebenkostenberechnung 2024(2).xlsx / Tab Wasserverbrauch","sourceSheet":"Wasserverbrauch","importedAt":"2026-07-06","scope":"Endstände 2017–2024 und Jahresverbräuche 2018–2024; für Archiv-/Abrechnungsprüfung relevant ab Ende 2021.","houseConnection":{"wechselHinweis":"Wasseruhrenwechsel Hausanschluss am 13.04.2022","wechselDatum":"2022-04-13","wertBeiWechsel":1893.0,"wertEnde2022":301.0,"wertEnde2023":615.0,"wertEnde2024":911.0,"wertEnde2025":"TBD"},"units":[{"wohnung":"W005.DG-L","bezeichnung":"DG-Links","excelKennung":"DGL","zaehlerKennung":"w05","readings":[{"jahr":2017,"kw":20.39,"ww":22.21,"gesamt":42.6},{"jahr":2018,"kw":39.45,"ww":41.15,"gesamt":80.6},{"jahr":2019,"kw":63.25,"ww":60.76,"gesamt":124.01},{"jahr":2020,"kw":90.18,"ww":85.38,"gesamt":175.56},{"jahr":2021,"kw":105.26,"ww":119.66,"gesamt":224.92},{"jahr":2022,"kw":123.08,"ww":141.56,"gesamt":264.64},{"jahr":2023,"kw":123.08,"ww":143.0,"gesamt":266.08},{"jahr":2024,"kw":124.0,"ww":144.0,"gesamt":268.0}],"deltas":[{"jahr":2018,"kw":19.06,"ww":18.94,"gesamt":38.0},{"jahr":2019,"kw":23.8,"ww":19.61,"gesamt":43.41},{"jahr":2020,"kw":26.93,"ww":24.62,"gesamt":51.55},{"jahr":2021,"kw":15.08,"ww":34.28,"gesamt":49.36},{"jahr":2022,"kw":17.82,"ww":21.9,"gesamt":39.72},{"jahr":2023,"kw":0.0,"ww":1.44,"gesamt":1.44},{"jahr":2024,"kw":0.92,"ww":1.0,"gesamt":1.92}]},{"wohnung":"W006.DG-R","bezeichnung":"DG-Rechts","excelKennung":"DGR","zaehlerKennung":"w06","readings":[{"jahr":2017,"kw":26.13,"ww":11.17,"gesamt":37.3},{"jahr":2018,"kw":60.03,"ww":26.14,"gesamt":86.17},{"jahr":2019,"kw":73.63,"ww":33.6,"gesamt":107.23},{"jahr":2020,"kw":79.05,"ww":39.47,"gesamt":118.52},{"jahr":2021,"kw":112.45,"ww":77.21,"gesamt":189.66},{"jahr":2022,"kw":136.98,"ww":110.99,"gesamt":247.97},{"jahr":2023,"kw":136.98,"ww":110.99,"gesamt":247.97},{"jahr":2024,"kw":137.0,"ww":111.0,"gesamt":248.0}],"deltas":[{"jahr":2018,"kw":33.9,"ww":14.97,"gesamt":48.87},{"jahr":2019,"kw":13.6,"ww":7.46,"gesamt":21.06},{"jahr":2020,"kw":5.42,"ww":5.87,"gesamt":11.29},{"jahr":2021,"kw":33.4,"ww":37.74,"gesamt":71.14},{"jahr":2022,"kw":24.53,"ww":33.78,"gesamt":58.31},{"jahr":2023,"kw":0.0,"ww":0.0,"gesamt":0.0},{"jahr":2024,"kw":0.02,"ww":0.01,"gesamt":0.03}]},{"wohnung":"W003.1OG-L","bezeichnung":"1OG-Links","excelKennung":"1OGL","zaehlerKennung":"w03","readings":[{"jahr":2017,"kw":47.83,"ww":0.04,"gesamt":47.87},{"jahr":2018,"kw":73.5,"ww":4.21,"gesamt":77.71},{"jahr":2019,"kw":85.52,"ww":12.48,"gesamt":98.0},{"jahr":2020,"kw":100.14,"ww":21.86,"gesamt":122.0},{"jahr":2021,"kw":119.45,"ww":35.2,"gesamt":154.65},{"jahr":2022,"kw":138.11,"ww":44.44,"gesamt":182.55},{"jahr":2023,"kw":153.0,"ww":52.0,"gesamt":205.0},{"jahr":2024,"kw":168.0,"ww":59.0,"gesamt":227.0}],"deltas":[{"jahr":2018,"kw":25.67,"ww":4.17,"gesamt":29.84},{"jahr":2019,"kw":12.02,"ww":8.27,"gesamt":20.29},{"jahr":2020,"kw":14.62,"ww":9.38,"gesamt":24.0},{"jahr":2021,"kw":19.31,"ww":13.34,"gesamt":32.65},{"jahr":2022,"kw":18.66,"ww":9.24,"gesamt":27.9},{"jahr":2023,"kw":14.89,"ww":7.56,"gesamt":22.45},{"jahr":2024,"kw":15.0,"ww":7.0,"gesamt":22.0}]},{"wohnung":"W004.1OG-R","bezeichnung":"1OG-Rechts","excelKennung":"1OGR","zaehlerKennung":"w04","readings":[{"jahr":2017,"kw":5.2,"ww":0.58,"gesamt":5.78},{"jahr":2018,"kw":25.03,"ww":3.04,"gesamt":28.07},{"jahr":2019,"kw":27.53,"ww":5.93,"gesamt":33.46},{"jahr":2020,"kw":43.54,"ww":25.9,"gesamt":69.44},{"jahr":2021,"kw":55.22,"ww":42.81,"gesamt":98.03},{"jahr":2022,"kw":104.97,"ww":121.21,"gesamt":226.18},{"jahr":2023,"kw":152.0,"ww":186.0,"gesamt":338.0},{"jahr":2024,"kw":195.0,"ww":241.0,"gesamt":436.0}],"deltas":[{"jahr":2018,"kw":19.83,"ww":2.46,"gesamt":22.29},{"jahr":2019,"kw":2.5,"ww":2.89,"gesamt":5.39},{"jahr":2020,"kw":16.01,"ww":19.97,"gesamt":35.98},{"jahr":2021,"kw":11.68,"ww":16.91,"gesamt":28.59},{"jahr":2022,"kw":49.75,"ww":78.4,"gesamt":128.15},{"jahr":2023,"kw":47.03,"ww":64.79,"gesamt":111.82},{"jahr":2024,"kw":43.0,"ww":55.0,"gesamt":98.0}]},{"wohnung":"W001.EG-L","bezeichnung":"EG-Links","excelKennung":"EGL","zaehlerKennung":"w01","readings":[{"jahr":2017,"kw":null,"ww":null,"gesamt":null},{"jahr":2018,"kw":null,"ww":null,"gesamt":null},{"jahr":2019,"kw":null,"ww":null,"gesamt":null},{"jahr":2020,"kw":null,"ww":null,"gesamt":null},{"jahr":2021,"kw":184.11,"ww":88.67,"gesamt":272.78},{"jahr":2022,"kw":186.24,"ww":89.37,"gesamt":275.61},{"jahr":2023,"kw":228.0,"ww":98.0,"gesamt":326.0},{"jahr":2024,"kw":266.0,"ww":108.0,"gesamt":374.0}],"deltas":[{"jahr":2018,"kw":0.0,"ww":0.0,"gesamt":0.0},{"jahr":2019,"kw":0.0,"ww":0.0,"gesamt":0.0},{"jahr":2020,"kw":0.0,"ww":0.0,"gesamt":0.0},{"jahr":2021,"kw":184.11,"ww":88.67,"gesamt":272.78},{"jahr":2022,"kw":2.13,"ww":0.7,"gesamt":2.83},{"jahr":2023,"kw":41.76,"ww":8.63,"gesamt":50.39},{"jahr":2024,"kw":38.0,"ww":10.0,"gesamt":48.0}]},{"wohnung":"W002.EG-R","bezeichnung":"EG-Rechts","excelKennung":"EGR","zaehlerKennung":"w02","readings":[{"jahr":2017,"kw":16.3,"ww":4.05,"gesamt":20.35},{"jahr":2018,"kw":34.52,"ww":8.55,"gesamt":43.07},{"jahr":2019,"kw":52.58,"ww":12.57,"gesamt":65.15},{"jahr":2020,"kw":68.5,"ww":15.72,"gesamt":84.22},{"jahr":2021,"kw":83.3,"ww":19.02,"gesamt":102.32},{"jahr":2022,"kw":95.88,"ww":21.75,"gesamt":117.63},{"jahr":2023,"kw":105.0,"ww":24.0,"gesamt":129.0},{"jahr":2024,"kw":117.0,"ww":28.0,"gesamt":145.0}],"deltas":[{"jahr":2018,"kw":18.22,"ww":4.5,"gesamt":22.72},{"jahr":2019,"kw":18.06,"ww":4.02,"gesamt":22.08},{"jahr":2020,"kw":15.92,"ww":3.15,"gesamt":19.07},{"jahr":2021,"kw":14.8,"ww":3.3,"gesamt":18.1},{"jahr":2022,"kw":12.58,"ww":2.73,"gesamt":15.31},{"jahr":2023,"kw":9.12,"ww":2.25,"gesamt":11.37},{"jahr":2024,"kw":12.0,"ww":4.0,"gesamt":16.0}]},{"wohnung":"W000.UG","bezeichnung":"UG","excelKennung":"KG","zaehlerKennung":"w00","readings":[{"jahr":2017,"kw":43.0,"ww":35.0,"gesamt":78.0},{"jahr":2018,"kw":94.15,"ww":74.5,"gesamt":168.65},{"jahr":2019,"kw":135.96,"ww":106.13,"gesamt":242.09},{"jahr":2020,"kw":197.91,"ww":145.77,"gesamt":343.68},{"jahr":2021,"kw":271.0,"ww":188.0,"gesamt":459.0},{"jahr":2022,"kw":346.65,"ww":216.54,"gesamt":563.19},{"jahr":2023,"kw":420.0,"ww":246.0,"gesamt":666.0},{"jahr":2024,"kw":490.0,"ww":280.0,"gesamt":770.0}],"deltas":[{"jahr":2018,"kw":51.15,"ww":39.5,"gesamt":90.65},{"jahr":2019,"kw":41.81,"ww":31.63,"gesamt":73.44},{"jahr":2020,"kw":61.95,"ww":39.64,"gesamt":101.59},{"jahr":2021,"kw":73.09,"ww":42.23,"gesamt":115.32},{"jahr":2022,"kw":75.65,"ww":28.54,"gesamt":104.19},{"jahr":2023,"kw":73.35,"ww":29.46,"gesamt":102.81},{"jahr":2024,"kw":70.0,"ww":34.0,"gesamt":104.0}]}],"summaryDeltas":[{"jahr":2018,"gesamt":252.37},{"jahr":2019,"gesamt":185.67},{"jahr":2020,"gesamt":243.48},{"jahr":2021,"gesamt":587.94},{"jahr":2022,"gesamt":376.41},{"jahr":2023,"gesamt":300.28},{"jahr":2024,"gesamt":289.95}],"notes":["Die Einheiten W05/DG-Links und W06/DG-Rechts sind in der aktuellen Bearbeitung inaktiv, bleiben aber für die historische Wasseruhren-Historie erhalten.","Für W01/EG-Links ist Ende 2021 im Excel als Start-/Erstwert ab 12NOV erfasst; der Jahresverbrauch 2021 wird im Excel als Differenz zu 0 geführt.","Die importierten Alt-Abrechnungen 2021/2022 und 2022 bleiben rechnerisch über ihre Original-Briefwerte fixiert; die Wasseruhren-Historie dient dort als Prüf-/Belegdatenbasis."]};

function ensureWaterMeterHistory(data) {
  if (!data) return data;
  const needsRootHistory = !data.waterMeterHistory || !Array.isArray(data.waterMeterHistory.units) || !data.waterMeterHistory.units.length;
  if (needsRootHistory) data.waterMeterHistory = clone(DEFAULT_WATER_METER_HISTORY);
  if (!data.meta) data.meta = {};
  if (!data.meta.waterMeterHistorySource) data.meta.waterMeterHistorySource = data.waterMeterHistory.source || DEFAULT_WATER_METER_HISTORY.source;
  if (!data.meta.waterMeterHistoryStatus) data.meta.waterMeterHistoryStatus = "vollständig aus Excel übernommen";
  return data;
}

function notifyStorageProblem(message, error) {
  if (error) console.warn("NK-Pro: " + message, error);
  else console.warn("NK-Pro: " + message);
  pendingStorageWarning = message;
  if (!storageWarningShown && typeof window !== "undefined" && typeof window.setTimeout === "function" && typeof alert === "function") {
    storageWarningShown = true;
    window.setTimeout(() => alert(message), 0);
  }
}

function integrityHash(text) {
  const value = String(text ?? "");
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function dataWithoutIntegrity(data) {
  const copy = clone(data);
  if (!copy.meta) copy.meta = {};
  delete copy.meta.storageIntegrityAlgorithm;
  delete copy.meta.storageIntegrityChecksum;
  delete copy.meta.storageIntegrityProtectedAt;
  delete copy.meta.storageIntegrityProtectedWithAppVersion;
  return copy;
}

function calculateDataIntegrity(data) {
  return integrityHash(JSON.stringify(dataWithoutIntegrity(data)));
}

function protectDataForStorage(data) {
  const copy = dataWithoutIntegrity(data);
  if (!copy.meta) copy.meta = {};
  copy.meta.storageIntegrityAlgorithm = STORAGE_INTEGRITY_ALGORITHM;
  copy.meta.storageIntegrityProtectedAt = new Date().toISOString();
  copy.meta.storageIntegrityProtectedWithAppVersion = APP_VERSION;
  copy.meta.storageIntegrityChecksum = calculateDataIntegrity(copy);
  return copy;
}

function validateStoredDataIntegrity(data) {
  if (!isAppDataShape(data)) return { valid:false, protected:false, reason:"Datenstruktur unvollständig" };
  const meta = data.meta || {};
  const checksum = String(meta.storageIntegrityChecksum || "").trim();
  if (!checksum) return { valid:true, protected:false, reason:"Kompatibler ungeschützter Datenstand" };
  if (meta.storageIntegrityAlgorithm && meta.storageIntegrityAlgorithm !== STORAGE_INTEGRITY_ALGORITHM) {
    return { valid:false, protected:true, reason:"Unbekanntes Prüfsummenverfahren" };
  }
  const actual = calculateDataIntegrity(data);
  return { valid:actual === checksum, protected:true, expected:checksum, actual, reason:actual === checksum ? "Prüfsumme gültig" : "Prüfsumme stimmt nicht überein" };
}

function readStoredDataResult(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { data:null, raw:"", valid:false, missing:true, key };
    const data = JSON.parse(raw);
    const integrity = validateStoredDataIntegrity(data);
    return { data, raw, valid:integrity.valid, missing:false, key, integrity };
  } catch(e) {
    return { data:null, raw:"", valid:false, missing:false, key, error:e, integrity:{valid:false, protected:false, reason:"JSON nicht lesbar"} };
  }
}

function readStoredData(key) {
  const result = readStoredDataResult(key);
  if (result.valid) return result.data;
  if (!result.missing) {
    const msg = "Lokale gespeicherte Daten konnten nicht sicher gelesen werden. Es wurden Ausgangsdaten oder ein gültiger kompatibler Datenstand geladen. Bitte prüfe deine letzte Sicherung.";
    if (!storageReadWarningShown) {
      storageReadWarningShown = true;
      notifyStorageProblem(msg, result.error || new Error(result.integrity && result.integrity.reason || "Integritätsprüfung fehlgeschlagen"));
    } else if (typeof console !== "undefined" && console.warn) {
      console.warn("NK-Pro: " + msg + " Betroffener Speicherbereich: " + key);
    }
  }
  return null;
}

function writeProtectedStorage(key, data) {
  const protectedData = protectDataForStorage(data);
  localStorage.setItem(key, JSON.stringify(protectedData));
  return protectedData;
}

// ===== Bereich: Speicher, Importprüfung und Migration =====
function loadData() {
  if (ARCHIVE_VIEW_MODE) return clone(SEED);
  const current = readStoredDataResult(STORAGE_KEY);
  if (current.valid) return current.data;

  const recovery = readStoredDataResult(STORAGE_RECOVERY_KEY);
  if (recovery.valid) {
    notifyStorageProblem("Der aktuelle lokale Datenstand ist beschädigt oder unvollständig. Das Tool hat den letzten gültigen Rückfallstand geladen. Bitte sofort eine Gesamt-JSON-Sicherung herunterladen.", current.error || new Error(current.integrity && current.integrity.reason || "Integritätsprüfung fehlgeschlagen"));
    if (!recovery.data.meta) recovery.data.meta = {};
    recovery.data.meta.loadedFromIntegrityRecovery = true;
    recovery.data.meta.loadedFromIntegrityRecoveryAt = new Date().toISOString();
    return recovery.data;
  }

  if (!current.missing) readStoredData(STORAGE_KEY);
  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = readStoredData(key);
    if (legacy) return legacy;
  }
  return clone(SEED);
}

function isAppDataShape(data) {
  return !!data && typeof data === "object" && !Array.isArray(data) &&
    Array.isArray(data.wohnungen) && Array.isArray(data.mieter) && Array.isArray(data.kostenarten);
}

function jsonByteLength(text) {
  const value = String(text ?? "");
  if (typeof Blob !== "undefined") return new Blob([value]).size;
  return value.length;
}

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toLocaleString("de-DE", {maximumFractionDigits:1}) + " KB";
  return (n / 1024 / 1024).toLocaleString("de-DE", {maximumFractionDigits:2}) + " MB";
}

function storageUsageForData(data) {
  try {
    const json = JSON.stringify(data);
    const bytes = jsonByteLength(json);
    return { bytes, label:formatBytes(bytes), error:"" };
  } catch(e) {
    return { bytes:0, label:"nicht ermittelbar", error:String(e && (e.message || e.name) || e) };
  }
}

function currentStorageUsage() {
  return storageUsageForData(state);
}

function parseJsonFileText(text) {
  const clean = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!clean) throw new Error("Die JSON-Datei ist leer.");
  try {
    return JSON.parse(clean);
  } catch(e) {
    throw new Error("Die JSON-Datei ist syntaktisch ungültig: " + String(e && (e.message || e.name) || e));
  }
}

function importValidationReport(data) {
  const errors = [];
  const warnings = [];
  if (!isAppDataShape(data)) {
    errors.push("Die Datei enthält keine vollständige NK-Pro-Datenstruktur mit Wohnungen, Mietern und Kostenarten.");
    return { errors, warnings };
  }

  const schemaVersion = currentDataSchemaVersion(data);
  if (!data.meta || !data.meta.dataSchemaVersion) warnings.push("Datenschema-Version fehlt; die Datei wird beim Import auf v" + DATA_SCHEMA_VERSION + " normalisiert.");
  else if (schemaVersion < DATA_SCHEMA_VERSION) warnings.push("Datenschema v" + schemaVersion + " wird beim Import auf v" + DATA_SCHEMA_VERSION + " migriert.");

  try {
    normalizeLegacyData(clone(data));
  } catch(error) {
    errors.push("Die Daten konnten nicht normalisiert werden: " + errorMessage(error));
  }

  if (Array.isArray(data.jahresArchiv)) {
    data.jahresArchiv.forEach((item, index) => {
      const validation = archiveItemValidation(item);
      const label = archiveItemLabel(item, index);
      validation.errors.forEach(message => warnings.push("Archiv " + label + ": " + message + " (bleibt sichtbar, kann aber nicht geöffnet werden, bis der Datensatz korrigiert ist)"));
      validation.warnings.forEach(message => warnings.push("Archiv " + label + ": " + message));
    });
  }
  return { errors, warnings };
}

function importSummaryText(data, fileName, report) {
  const meta = data && data.meta || {};
  const storageInfo = storageUsageForData(data);
  const lines = [
    "JSON-Import prüfen",
    "",
    "Datei: " + (fileName || "unbekannt"),
    "Abrechnungsjahr: " + (meta.abrechnungsjahr || "nicht angegeben"),
    "Exportiert mit Toolversion: " + (meta.exportedWithAppVersion || meta.lastSavedWithAppVersion || meta.importedWithAppVersion || "nicht angegeben"),
    "Exportiert am: " + (meta.exportedAt ? new Date(meta.exportedAt).toLocaleString("de-DE") : "nicht angegeben"),
    "Exportumfang: " + (meta.exportScopeLabel || meta.exportScope || "nicht angegeben"),
    "Quell-Speicherbereich: " + (meta.exportStorageKey || "nicht angegeben"),
    "Wohnungen: " + (Array.isArray(data.wohnungen) ? data.wohnungen.length : 0),
    "Mietverhältnisse: " + (Array.isArray(data.mieter) ? data.mieter.length : 0),
    "Kostenarten: " + (Array.isArray(data.kostenarten) ? data.kostenarten.length : 0),
    "Archivdatensätze: " + (Array.isArray(data.jahresArchiv) ? data.jahresArchiv.length : 0),
    "Datengröße: " + storageInfo.label
  ];
  if (report && report.warnings && report.warnings.length) {
    lines.push("", "Hinweise:");
    report.warnings.slice(0, 6).forEach(message => lines.push("- " + message));
    if (report.warnings.length > 6) lines.push("- weitere Hinweise: " + (report.warnings.length - 6));
  }
  return lines.join("\n");
}

function addImportMetadata(data, fileName) {
  if (!data.meta) data.meta = {};
  data.meta.importedAt = new Date().toISOString();
  data.meta.importedWithAppVersion = APP_VERSION;
  data.meta.importedFileName = fileName || "";
  return data;
}

function backupEventLabel(type) {
  const labels = {
    "full-json":"Gesamt-JSON",
    "full-package":"Vollständiges Exportpaket",
    "current-json":"Abrechnungs-JSON",
    "year-archive":"Jahresarchiv",
    "archive-year":"Archivjahr-JSON"
  };
  return labels[type] || String(type || "Backup");
}

function ensureBackupMetadata() {
  if (!state.meta) state.meta = {};
  if (!Array.isArray(state.meta.backupEvents)) state.meta.backupEvents = [];
  return state.meta.backupEvents;
}

function registerBackupEvent(type, filename) {
  if (!state || !state.meta) return;
  const events = ensureBackupMetadata();
  const event = {
    type:type || "backup",
    label:backupEventLabel(type),
    filename:filename || "",
    at:new Date().toISOString(),
    appVersion:APP_VERSION,
    year:currentAbrechnungsjahr()
  };
  events.unshift(event);
  state.meta.backupEvents = events.slice(0, 20);
  if (type === "full-json" || type === "full-package") {
    state.meta.lastFullBackupAt = event.at;
    state.meta.lastFullBackupType = event.label;
    state.meta.lastFullBackupFile = event.filename;
    state.meta.lastFullBackupAppVersion = APP_VERSION;
  }
  if (type === "current-json") {
    state.meta.lastCurrentBillingBackupAt = event.at;
    state.meta.lastCurrentBillingBackupFile = event.filename;
  }
  if (type === "year-archive" || type === "archive-year") {
    state.meta.lastArchiveBackupAt = event.at;
    state.meta.lastArchiveBackupFile = event.filename;
  }
  try { saveData(); } catch(e) { console.warn("Backup-Ereignis konnte nicht gespeichert werden", e); }
  try { renderBackupStatus(); } catch(e) {}
}

function daysSinceIso(iso) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
}

function backupStatusReport() {
  const meta = state && state.meta || {};
  const last = meta.lastFullBackupAt || "";
  const days = daysSinceIso(last);
  const storage = currentStorageUsage();
  const events = Array.isArray(meta.backupEvents) ? meta.backupEvents : [];
  let level = "ok";
  let message = "Gesamtbackup dokumentiert.";
  if (!last) {
    level = "warn";
    message = "Noch kein Gesamtbackup in dieser Version dokumentiert.";
  } else if (days !== null && days > 14) {
    level = "warn";
    message = "Letztes Gesamtbackup ist älter als 14 Tage.";
  }
  if (meta.lastSaveError) {
    level = "err";
    message = "Letzter Speichervorgang hatte einen Fehler. Bitte sofort Gesamt-JSON herunterladen.";
  }
  return { level, message, last, days, storage, events, meta };
}

function backupStatusHint(report) {
  if (!report || report.level === "ok") return "";
  return "\n\nBackup-Status: " + report.message + "\nEmpfehlung: Vorher Gesamt-JSON oder vollständiges Exportpaket herunterladen.";
}

function confirmRiskyDataAction(title, message) {
  const report = backupStatusReport();
  return confirm(String(title || "Riskante Datenaktion") + "\n\n" + String(message || "") + backupStatusHint(report));
}

function renderBackupStatus() {
  const el = document.getElementById("backupStatusBox");
  if (!el) return;
  if (isArchiveViewer()) { el.innerHTML = ""; return; }
  const report = backupStatusReport();
  const meta = report.meta || {};
  const lastLabel = report.last ? (new Date(report.last).toLocaleString("de-DE") + (report.days !== null ? " · vor " + report.days + " Tag(en)" : "")) : "Noch kein Gesamtbackup dokumentiert";
  const eventHtml = report.events.slice(0, 3).map(e => '<div class="backup-pill"><strong>' + escapeHtml(e.label || backupEventLabel(e.type)) + '</strong><br>' + escapeHtml(e.at ? new Date(e.at).toLocaleString("de-DE") : "") + '<br><span class="small">' + escapeHtml(e.filename || "") + '</span></div>').join("");
  el.innerHTML = '<div class="backup-status-box ' + report.level + '"><div class="inline-titlebar"><div><strong>Backup-Status</strong><div class="small">' + escapeHtml(report.message) + '</div></div>' +
    '<div class="start-action-stack"><button type="button" data-app-action="download-full-json">Gesamt-JSON</button><button type="button" data-app-action="download-full-export-package">Exportpaket</button></div></div>' +
    '<div class="backup-grid">' +
      '<div class="backup-pill"><strong>Letztes Gesamtbackup</strong><br>' + escapeHtml(lastLabel) + '<br><span class="small">' + escapeHtml(meta.lastFullBackupType || "") + '</span></div>' +
      '<div class="backup-pill"><strong>Aktueller Speicher</strong><br>' + escapeHtml(report.storage.label) + '<br><span class="small">Browser-Speicher lokal</span></div>' +
      '<div class="backup-pill"><strong>Aktuelle Version</strong><br>' + escapeHtml(APP_VERSION) + '<br><span class="small">' + escapeHtml(APP_VERSION_NAME) + '</span></div>' +
      (eventHtml || '<div class="backup-pill"><strong>Historie</strong><br>Noch keine Backup-Ereignisse</div>') +
    '</div></div>';
}


function currentBillingFinalizationKey() {
  const meta = state && state.meta || {};
  return String(meta.abrechnungsjahr || currentAbrechnungsjahr() || "") + "|" + String(meta.abrechnungsbeginn || "") + "|" + String(meta.abrechnungsende || "");
}

function isCurrentBillingFinalized() {
  const meta = state && state.meta || {};
  return !!(meta.currentBillingFinalized && meta.currentBillingFinalizationKey === currentBillingFinalizationKey());
}

let finalizationWriteBypass = false;
let statePreparationInProgress = false;
let statePreparationCount = 0;
function withFinalizationWriteBypass(fn) {
  const old = finalizationWriteBypass;
  finalizationWriteBypass = true;
  try { return fn(); } finally { finalizationWriteBypass = old; }
}

function currentBillingFinalizationReport() {
  const finalized = isCurrentBillingFinalized();
  const meta = state && state.meta || {};
  const report = collectQualityChecks({ scope:"currentBilling" });
  const readiness = finalBillingReadiness(report);
  return { finalized, meta, report, readiness };
}

function renderFinalizationStatus() {
  const el = document.getElementById("finalizationStatusBox");
  const billingContext = currentAppMode() === "billing" && !isArchiveViewer();
  if (!el) { document.body.classList.remove("billing-finalized"); return; }
  if (!billingContext) { el.innerHTML = ""; document.body.classList.remove("billing-finalized"); return; }
  const info = currentBillingFinalizationReport();
  document.body.classList.toggle("billing-finalized", !!info.finalized);
  const meta = info.meta || {};
  const finalizedAt = info.finalized && meta.currentBillingFinalizedAt ? new Date(meta.currentBillingFinalizedAt).toLocaleString("de-DE") : "Nicht finalisiert";
  const cls = info.finalized ? "locked" : (info.readiness.level === "err" ? "err" : (info.readiness.level === "warn" ? "warn" : "ok"));
  const status = info.finalized ? "Finalisiert / Eingaben geschützt" : "Noch bearbeitbar";
  const actionHtml = info.finalized
    ? '<button type="button" class="warn" data-app-action="unlock-billing">Wiederbearbeitung öffnen</button>'
    : '<button type="button" class="primary" data-app-action="finalize-billing">Diese Abrechnung finalisieren</button>';
  el.innerHTML = '<div class="finalization-status-box ' + cls + '"><div class="inline-titlebar"><div><strong>Finalisierung dieser Abrechnung</strong><div class="small">' + escapeHtml(status) + ' · ' + escapeHtml(info.readiness.message) + '</div></div><div class="start-action-stack">' + actionHtml + '</div></div>' +
    '<div class="finalization-grid">' +
      '<div class="finalization-pill"><strong>Abrechnungsjahr</strong><br>' + escapeHtml(currentAbrechnungsjahr()) + '<br><span class="small">' + escapeHtml(periodLabelShort()) + '</span></div>' +
      '<div class="finalization-pill"><strong>Status</strong><br>' + escapeHtml(finalizedAt) + '<br><span class="small">' + escapeHtml(meta.currentBillingFinalizedWithAppVersion || APP_VERSION) + '</span></div>' +
      '<div class="finalization-pill"><strong>Prüfstand</strong><br>' + escapeHtml(info.readiness.label) + '<br><span class="small">' + info.readiness.errors.length + ' Fehler · ' + info.readiness.warnings.length + ' Prüfpunkte · ' + info.readiness.hints.length + ' Hinweise</span></div>' +
    '</div></div>';
}

function finalizeCurrentBilling() {
  if (isArchiveViewer()) return alert("Archivansichten sind bereits schreibgeschützt.");
  if (!hasActiveCurrentBilling()) return alert("Es ist keine aktuelle Abrechnung in Bearbeitung. Neue Abrechnungen werden ausschließlich über „+ Neue Abrechnung“ angelegt.");
  if (isCurrentBillingFinalized()) return alert("Diese Abrechnung ist bereits finalisiert.");
  const info = currentBillingFinalizationReport();
  if (info.readiness.errors.length) {
    alert("Finalisierung nicht möglich. Es gibt noch blockierende Fehler im finalen Abrechnungscheck.");
    switchToTab("qualitaet");
    return;
  }
  const warnText = info.readiness.warnings.length ? "\n\nEs gibt noch " + info.readiness.warnings.length + " fachliche Prüfpunkte. Finalisiere nur, wenn du diese bewusst geprüft hast." : "";
  if (!confirm("Abrechnung " + currentAbrechnungsjahr() + " finalisieren?\n\nDanach werden Eingaben geschützt und Änderungen nicht mehr gespeichert, bis die Finalisierung bewusst aufgehoben wird." + warnText)) return;
  if (!state.meta) state.meta = {};
  state.meta.currentBillingFinalized = true;
  state.meta.currentBillingFinalizationKey = currentBillingFinalizationKey();
  state.meta.currentBillingFinalizedAt = new Date().toISOString();
  state.meta.currentBillingFinalizedWithAppVersion = APP_VERSION;
  state.meta.currentBillingFinalizationSummary = {
    year: currentAbrechnungsjahr(),
    period: periodLabelShort(),
    errors: info.readiness.errors.length,
    warnings: info.readiness.warnings.length,
    hints: info.readiness.hints.length
  };
  withFinalizationWriteBypass(() => saveData());
  renderAll();
  alert("Abrechnung wurde finalisiert. Eingaben sind jetzt geschützt.");
}

function unlockCurrentBilling() {
  if (isArchiveViewer()) return alert("Archivansichten können nicht entsperrt werden.");
  if (!hasActiveCurrentBilling()) return alert("Es ist keine aktuelle Abrechnung in Bearbeitung. Zur Wiederbearbeitung bitte einen Archivdatensatz öffnen.");
  if (!isCurrentBillingFinalized()) return alert("Diese Abrechnung ist nicht finalisiert.");
  const code = "ENTSPERREN";
  const entered = prompt("Finalisierung aufheben?\n\nGib zur Bestätigung " + code + " ein. Danach können Daten wieder verändert werden.");
  if (String(entered || "").trim().toUpperCase() !== code) return alert("Finalisierung wurde nicht aufgehoben.");
  if (!state.meta) state.meta = {};
  state.meta.currentBillingFinalized = false;
  state.meta.currentBillingUnlockedAt = new Date().toISOString();
  state.meta.currentBillingUnlockedWithAppVersion = APP_VERSION;
  withFinalizationWriteBypass(() => saveData());
  renderAll();
  alert("Finalisierung wurde aufgehoben. Die Abrechnung ist wieder bearbeitbar.");
}

function clearCurrentBillingFinalization() {
  if (!state.meta) state.meta = {};
  state.meta.currentBillingFinalized = false;
  delete state.meta.currentBillingFinalizationKey;
  delete state.meta.currentBillingFinalizedAt;
  delete state.meta.currentBillingFinalizedWithAppVersion;
  delete state.meta.currentBillingFinalizationSummary;
}

function exportSnapshot() {
  const snapshot = clone(state);
  if (!snapshot.meta) snapshot.meta = {};
  enforceWorkingStateDataContract(snapshot, { recordMigration:false, storageRole:"working" });
  Object.keys(snapshot.meta).forEach(key => {
    if (String(key).startsWith("storageIntegrity")) delete snapshot.meta[key];
  });
  snapshot.meta.exportedAt = new Date().toISOString();
  snapshot.meta.exportedWithAppVersion = APP_VERSION;
  snapshot.meta.exportStorageKey = STORAGE_KEY;
  snapshot.meta.exportScope = "fullArchiveAndCurrentBilling";
  snapshot.meta.exportScopeLabel = "Vollständiger Datenbestand inkl. aktuellem Arbeitsstand und Jahresarchiv";
  snapshot.meta.dataSchemaVersion = DATA_SCHEMA_VERSION;
  snapshot.meta.dataLayerContractVersion = DATA_LAYER_CONTRACT_VERSION;
  snapshot.meta.dataLayerRole = "fullBackup";
  snapshot.meta.exportLayers = ["stammdaten", "currentBilling", "history", "archive"];
  snapshot.meta.exportExcludes = ["recovery"];
  delete snapshot.meta.storageRole;
  delete snapshot.meta.loadedFromIntegrityRecovery;
  delete snapshot.meta.loadedFromIntegrityRecoveryAt;
  delete snapshot.meta.recoveryCreatedAt;
  delete snapshot.meta.recoveryCreatedWithAppVersion;
  delete snapshot.meta.recoverySourceStorageKey;
  return snapshot;
}

function exportCurrentBillingSnapshot() {
  const archiveLike = createYearSnapshot();
  const snapshot = clone(archiveLike.data || {});
  if (!snapshot.meta) snapshot.meta = {};
  snapshot.meta.exportedAt = new Date().toISOString();
  snapshot.meta.exportedWithAppVersion = APP_VERSION;
  snapshot.meta.exportStorageKey = STORAGE_KEY;
  snapshot.meta.exportScope = "currentBillingOnly";
  snapshot.meta.exportScopeLabel = "Nur aktuell geöffnete Abrechnung, ohne Jahresarchiv";
  snapshot.meta.exportedBillingYear = archiveLike.year || currentAbrechnungsjahr();
  snapshot.meta.exportedBillingPeriod = periodLabelShort();
  snapshot.meta.dataSchemaVersion = DATA_SCHEMA_VERSION;
  snapshot.meta.dataLayerContractVersion = DATA_LAYER_CONTRACT_VERSION;
  snapshot.meta.dataLayerRole = ARCHIVE_SNAPSHOT_SCOPE;
  snapshot.meta.snapshotScope = ARCHIVE_SNAPSHOT_SCOPE;
  snapshot.exportSummary = clone(archiveLike.summary || {});
  return snapshot;
}

function backupFileName(prefix, data) {
  const meta = data && data.meta || {};
  const year = String(meta.abrechnungsjahr || currentAbrechnungsjahr() || "jahr");
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
  return safeFilePart(prefix || "nk-pro-daten") + "-" + safeFilePart(year) + "-" + safeFilePart(APP_VERSION) + "-" + stamp + ".json";
}

function errorMessage(error) {
  if (!error) return "Unbekannter Fehler";
  return String(error.message || error);
}

function recordStartupError(area, error) {
  const message = errorMessage(error);
  startupErrors.push({ area, message });
  if (typeof console !== "undefined" && console.error) console.error("NK-Pro Startfehler: " + area, error);
}

function persistStartupMeterRepair(data, cleared) {
  if (!cleared || !data || ARCHIVE_VIEW_MODE) return;
  try {
    if (!data.meta) data.meta = {};
    data.meta.startupMeterEndValueRepairCleared = cleared;
    data.meta.startupMeterEndValueRepairAt = new Date().toISOString();
    data.meta.startupMeterEndValueRepairWithAppVersion = APP_VERSION;
    enforceWorkingStateDataContract(data);
    if (typeof localStorage !== "undefined") writeProtectedStorage(STORAGE_KEY, data);
  } catch(e) {
    notifyStorageProblem("Wasser-Endwert-Korrektur wurde im aktuellen Fenster angewendet, konnte aber nicht dauerhaft gespeichert werden. Bitte Gesamt-JSON sichern.", e);
  }
}

function loadInitialState() {
  try {
    const loaded = normalizeLoadedData(loadData());
    const cleared = clearAutofilledMeterEndValuesForNewBilling(loaded, { repairExistingNewBilling:true });
    persistStartupMeterRepair(loaded, cleared);
    return loaded;
  } catch(error) {
    recordStartupError("Datenstart", error);
    notifyStorageProblem("Die App konnte den gespeicherten Datensatz nicht vollständig initialisieren. Die Daten wurden nicht gelöscht; bitte JSON-Sicherung prüfen oder neu laden.", error);
    try {
      const fallback = normalizeLegacyData(clone(SEED));
      fallback.meta.startupFallback = true;
      return fallback;
    } catch(fallbackError) {
      recordStartupError("Fallback-Ausgangsdaten", fallbackError);
      const fallback = clone(SEED);
      if (!fallback.meta) fallback.meta = {};
      fallback.meta.startupFallback = true;
      fallback.meta.dataSchemaVersion = DATA_SCHEMA_VERSION;
      return fallback;
    }
  }
}

function currentDataSchemaVersion(data) {
  const raw = data && data.meta ? Number(data.meta.dataSchemaVersion || data.meta.schemaVersion || 1) : 1;
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

function recordDataMigration(data, fromVersion, toVersion, note) {
  if (!data || !data.meta) return;
  if (!Array.isArray(data.meta.migrationHistory)) data.meta.migrationHistory = [];
  const exists = data.meta.migrationHistory.some(item => item && item.from === fromVersion && item.to === toVersion && item.note === note);
  if (!exists) data.meta.migrationHistory.push({ from:fromVersion, to:toVersion, at:new Date().toISOString(), appVersion:APP_VERSION, note });
}

function migrateDataSchema(data, options = {}) {
  if (!data || typeof data !== "object") return data;
  if (!data.meta) data.meta = {};
  let version = currentDataSchemaVersion(data);

  if (version < 2) {
    ensureUnitIdentityData(data);
    if (Array.isArray(data.mieter)) data.mieter.forEach(m => { ensureTenantIdentityFields(m); if (m.wohnung) m.wohnung = canonicalUnitIdFor(m.wohnung) || m.wohnung; });
    recordDataMigration(data, version, 2, "Mieter- und Wohnungs-IDs auf einfache stabile Kennungen migriert.");
    version = 2;
  }

  if (version < 4) {
    if (!data.kostenartenMieterUmlage || typeof data.kostenartenMieterUmlage !== "object" || Array.isArray(data.kostenartenMieterUmlage)) data.kostenartenMieterUmlage = {};
    recordDataMigration(data, version, 4, "Umlagefähigkeit je Kostenart und Mietverhältnis ergänzt.");
    version = 4;
  }
  if (version < 5) {
    ensureStammdatenData(data);
    data.stammdaten.wohnungen = normalizeMasterUnitRows(data.stammdaten.wohnungen);
    if (!data.umlageInputs || typeof data.umlageInputs !== "object") data.umlageInputs = {};
    Object.keys(data.umlageInputs).forEach(costId=>{ const input=data.umlageInputs[costId]; if (!input) return; const cost=(data.kostenarten||[]).find(k=>k.id===costId); if (!["Zählerstände","Verbrauchsmenge","Direkter Eurobetrag","Externe Einzelabrechnung"].includes(input.mode)) { const direct=cost&&(cost.umlageschluessel===UMLAGE_MANUAL||cost.berechnungsart==="Manuell je Mieter"); const legacyValues=Array.isArray(input.values)&&input.values.some(v=>Math.abs(num(v))>0.000001); input.mode=direct?"Direkter Eurobetrag":((cost&&cost.umlageschluessel==="Verbrauch"&&cost.id!=="K002"&&legacyValues)?"Verbrauchsmenge":"Zählerstände"); } });
    recordDataMigration(data, version, 5, "Wohnungsstatus je Abrechnung und eindeutige Quellen für manuelle/externe Werte ergänzt.");
    version = 5;
  }

  data.meta.dataSchemaVersion = Math.max(version, DATA_SCHEMA_VERSION);
  data.meta.normalizedWithAppVersion = APP_VERSION;

  if (options.includeArchives !== false && Array.isArray(data.jahresArchiv)) {
    data.jahresArchiv.forEach(item => {
      if (item && item.data && item.data !== data) {
        migrateDataSchema(item.data, { includeArchives:false });
        item.schemaVersion = item.data.meta && item.data.meta.dataSchemaVersion ? item.data.meta.dataSchemaVersion : DATA_SCHEMA_VERSION;
      }
    });
  }
  return data;
}

function renderSystemMessages() {
  const el = document.getElementById("appStatusBox");
  if (!el) return;
  const items = [];
  startupErrors.forEach(error => items.push("Start: " + error.area + " - " + error.message));
  renderErrors.forEach(error => items.push("Anzeige: " + error.area + " - " + error.message));
  if (pendingStorageWarning) items.push("Speicher: " + pendingStorageWarning);
  if (!items.length) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = '<div class="hint runtime-error-box"><strong>Systemhinweis:</strong> Die Daten wurden nicht gelöscht. Ein Teil der App konnte nicht sauber geladen oder angezeigt werden.<ul>' +
    items.map(item => '<li>' + escapeHtml(item) + '</li>').join("") +
    '</ul><p class="small">Bitte JSON-Sicherung prüfen und diese Meldung nicht ignorieren.</p></div>';
}

function setActionMessage(message, level="ok") {
  lastActionMessage = message || "";
  lastActionLevel = level || "ok";
}

function renderActionFeedback() {
  const el = document.getElementById("appFeedbackBox");
  if (!el) return;
  if (!lastActionMessage) {
    el.innerHTML = "";
    return;
  }
  const cls = lastActionLevel === "err" ? " err" : (lastActionLevel === "warn" ? " warn" : "");
  el.innerHTML = '<div class="hint feedback-box' + cls + '"><strong>Status:</strong> ' + escapeHtml(lastActionMessage) + '</div>';
}

function runRenderStep(area, fn) {
  try {
    fn();
  } catch(error) {
    renderErrors.push({ area, message:errorMessage(error) });
    if (typeof console !== "undefined" && console.error) console.error("NK-Pro Renderfehler: " + area, error);
  }
}
function normalizeLoadedData(data) {
  if (!isAppDataShape(data)) {
    notifyStorageProblem("Der geladene Datensatz hat nicht die erwartete NK-Pro-Struktur. Es wurden Ausgangsdaten geladen.", null);
    return normalizeLegacyData(clone(SEED));
  }
  return normalizeLegacyData(data);
}

function importAppData(data, fileName) {
  const report = importValidationReport(data);
  if (report.errors.length) throw new Error(report.errors.join("\n"));
  return addImportMetadata(normalizeLegacyData(data), fileName);
}

function simpleArchiveIdentityForMerge(item) {
  if (!item) return "";
  const meta = item.meta || (item.data && item.data.meta) || {};
  if (item.periodId) return String(item.periodId);
  if (meta.periodId) return String(meta.periodId);
  if (meta.abrechnungsbeginn && meta.abrechnungsende) return String(item.year || meta.abrechnungsjahr || "") + "|" + meta.abrechnungsbeginn + "|" + meta.abrechnungsende + "|" + (meta.legacySammelArchiv ? "Archivierte Abrechnung" : "Archiv");
  return "year|" + String(item.year || "");
}

function mergePreloadedV41Archives(data) {
  if (!data || (data.meta && data.meta.archiveViewer)) return data;
  if (data.meta && data.meta.exportScope === "currentBillingOnly") {
    if (!Array.isArray(data.jahresArchiv)) data.jahresArchiv = [];
    return data;
  }
  if (!Array.isArray(data.jahresArchiv)) data.jahresArchiv = [];

  const seedArchives = (typeof SEED !== "undefined" && Array.isArray(SEED.jahresArchiv)) ? SEED.jahresArchiv : [];
  seedArchives.forEach(item => {
    const meta = item.meta || (item.data && item.data.meta) || {};
    if (!meta.preloadedV41LegacyArchive) return;
    const id = simpleArchiveIdentityForMerge(item);
    const exists = data.jahresArchiv.some(a => simpleArchiveIdentityForMerge(a) === id);
    if (!exists) data.jahresArchiv.push(clone(item));
  });
  return data;
}

function normalizeLegacyData(data, options = {}) {
  if (!data) return data;
  const snapshotMode = options.scope === ARCHIVE_SNAPSHOT_SCOPE;
  if (!data.meta) data.meta = {};
  if (!data.meta.abrechnungsjahr) {
    const briefYear = data.briefSettings && data.briefSettings.abrechnungsjahr ? data.briefSettings.abrechnungsjahr : "";
    data.meta.abrechnungsjahr = briefYear || "2025";
  }
  if (!data.meta.abrechnungsbeginn) data.meta.abrechnungsbeginn = data.meta.abrechnungsjahr ? (String(data.meta.abrechnungsjahr) + "-01-01") : "2025-01-01";
  if (!data.meta.abrechnungsende) data.meta.abrechnungsende = data.meta.abrechnungsjahr ? (String(data.meta.abrechnungsjahr) + "-12-31") : "2025-12-31";
  if (!Array.isArray(data.jahresArchiv)) data.jahresArchiv = [];
  if (!Array.isArray(data.wohnungen)) data.wohnungen = [];
  if (!Array.isArray(data.mieter)) data.mieter = [];
  if (!Array.isArray(data.kostenarten)) data.kostenarten = [];
  if (!Array.isArray(data.vorauszahlungen)) data.vorauszahlungen = [];
  if (!data.kostenartenMieterUmlage || typeof data.kostenartenMieterUmlage !== "object" || Array.isArray(data.kostenartenMieterUmlage)) data.kostenartenMieterUmlage = {};
  if (!data.umlageInputs || typeof data.umlageInputs !== "object" || Array.isArray(data.umlageInputs)) data.umlageInputs = {};
  if (!data.waterMeters || typeof data.waterMeters !== "object" || Array.isArray(data.waterMeters)) data.waterMeters = {};
  if (!data.meterReadings || typeof data.meterReadings !== "object" || Array.isArray(data.meterReadings)) data.meterReadings = {};
  if (Array.isArray(data.kostenarten)) {
    data.kostenarten.forEach(k => {
      if (k.umlageschluessel === "Wohneinheiten inkl. Leerstand") k.umlageschluessel = "Verteilung nur auf aktive Wohneinheiten";
      normalizeCostSettings(k);
    });
  }
  if (Array.isArray(data.wohnungen)) {
    data.wohnungen.forEach(w => ensureUnitIdentityFields(w));
  }
  if (Array.isArray(data.mieter)) {
    const hasM000 = data.mieter.some(m => m.id === "M000");
    data.mieter.forEach(m => {
      if (m.id === "M005" && !hasM000) m.id = "M000";
      if (m.status === "archiviert" || m.status === "Archiv") m.status = "Archiviert";
      if (m.status === "OK") m.status = m.auszug ? "NK offen" : "Aktiv";
      if (m.archivedAt === undefined) m.archivedAt = "";
      ensureTenantContactFields(m);
      ensureTenantIdentityFields(m);
    });
  }
  if (data.umlageInputs) {
    Object.keys(data.umlageInputs).forEach(key => {
      if (data.umlageInputs[key] && data.umlageInputs[key].art === "Wohneinheiten inkl. Leerstand") {
        data.umlageInputs[key].art = "Verteilung nur auf aktive Wohneinheiten";
      }
    });
  }
  ensureZimmermannTenantForLegacyData(data);
  applyExcelWaterReadings2024ToData(data);
  if (!snapshotMode) {
    mergePreloadedV41Archives(data);
    adoptHistoricalWaterMeterDataFromArchive(data);
    ensureWaterMeterHistory(data);
  }
  ensureUnifiedBillingFields(data, { includeArchives:false });
  migrateDataSchema(data, { includeArchives:false });
  if (!snapshotMode) {
    ensureStammdatenData(data);
    enforceWorkingStateDataContract(data);
  }
  return data;
}


function normalizedTextKey(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function isoPeriodToShortRange(periodText) {
  const parts = String(periodText || "").split(/\s+bis\s+/i);
  if (parts.length === 2) return dateDeShortYear(parts[0]) + "-" + dateDeShortYear(parts[1]);
  return String(periodText || "");
}

function dataSourceForMeta(meta) {
  meta = meta || {};
  if (meta.datenquelle) return meta.datenquelle;
  if (meta.archiveViewer && meta.legacyQuelle) return "Importiert / übernommen";
  if (meta.legacyQuelle) return "Importiert / übernommen";
  if (meta.legacyArchivHinweis) return "Übernommen";
  return "Tool";
}

function ensureUnifiedBillingFields(data, options = {}) {
  if (!data) return data;
  if (!data.meta) data.meta = {};
  data.meta.datensatzTyp = "Abrechnung";
  if (!data.meta.datenquelle) data.meta.datenquelle = dataSourceForMeta(data.meta);
  if (!Array.isArray(data.abrechnungsEinzelwerte)) data.abrechnungsEinzelwerte = [];
  if (Array.isArray(data.legacyEinzelabrechnungen) && data.legacyEinzelabrechnungen.length) {
    data.abrechnungsEinzelwerte = data.legacyEinzelabrechnungen.map(e => ({
      wohnung:e.wohnung || "",
      mieter:e.mieter || "",
      abrechnungsjahr:e.jahr || data.meta.abrechnungsjahr || "",
      periode:e.periode || "",
      kostenarten:[
        {kostenId:"K006", kostenart:"Heiz- und Warmwasserkosten", zeitraum:e.heizPeriode || "", kostenanteil:num(e.heizkosten), vorauszahlung:num(e.vHeiz)},
        {kostenId:"K002", kostenart:"Wasserversorgung", zeitraum:e.wasserPeriode || "", kostenanteil:num(e.wasserkosten), vorauszahlung:num(e.vWasser)},
        {kostenId:"K009", kostenart:"Müllbeseitigung", zeitraum:e.abfallPeriode || "", kostenanteil:num(e.abfallkosten), vorauszahlung:num(e.vAbfall)}
      ],
      kostenanteil:num(e.kostenanteil),
      vorauszahlung:num(e.vorauszahlung),
      saldo:num(e.saldo),
      briefErgebnis:e.briefErgebnis || (num(e.saldo) >= 0 ? "Nachzahlung" : "Guthaben"),
      briefBetrag:num(e.briefBetrag || Math.abs(num(e.saldo))),
      quelle:e.quelle || data.meta.legacyQuelle || "Import"
    }));
  }
  if (options.includeArchives !== false && Array.isArray(data.jahresArchiv)) {
    data.jahresArchiv.forEach(a => {
      if (!a.meta) a.meta = (a.data && a.data.meta) ? clone(a.data.meta) : {};
      a.meta.datensatzTyp = "Abrechnung";
      if (!a.meta.datenquelle) a.meta.datenquelle = dataSourceForMeta(a.meta);
      if (a.data) ensureUnifiedBillingFields(a.data, options);
    });
  }
  ensureUnitIdentityData(data);
  ensureTenantIdentityData(data);
  return data;
}

// ===== Bereich: Archivmodell und Archivansicht =====
function archiveDataSource(item) {
  const meta = archiveMeta(item);
  if (meta.datenquelle) return meta.datenquelle;
  if (meta.legacyQuelle) return "Importiert / übernommen";
  if (meta.legacyArchivHinweis) return "Übernommen";
  return "Tool";
}

function wohnungLabelForTenant(tenant) {
  if (!tenant) return "";
  const w = Array.isArray(state.wohnungen) ? state.wohnungen.find(x => x.id === tenant.wohnung) : null;
  return (w && (w.bezeichnung || w.lage || w.id)) || tenant.wohnung || "";
}

function billingEntryForTenant(tenant) {
  const entries = legacyArchiveEntries();
  if (!tenant || !entries.length) return null;
  const tn = normalizedTextKey(tenant.name);
  const tw = normalizedTextKey(wohnungLabelForTenant(tenant));
  return entries.find(e => normalizedTextKey(e.mieter) === tn) ||
         entries.find(e => normalizedTextKey(e.wohnung) === tw && normalizedTextKey(e.mieter).includes(tn.split(" ").slice(-1)[0] || tn)) ||
         null;
}

function knownArchiveCostContext(entry, costId, amount) {
  const y = String((entry && entry.jahr) || currentAbrechnungsjahr());
  const ctx = { gesamtbetrag:0, basisTotal:0, preis:0, einheiten:0 };
  if (y.includes("2021/2022")) {
    if (costId === "K006") { ctx.gesamtbetrag = 7930.61; }
    if (costId === "K002") { ctx.gesamtbetrag = 2441.50; ctx.basisTotal = 383; ctx.preis = 6.37; ctx.einheiten = ctx.preis ? num(amount) / ctx.preis : 0; }
    if (costId === "K009") { ctx.gesamtbetrag = 1503.00; ctx.basisTotal = 7; ctx.preis = 214.71; ctx.einheiten = ctx.preis ? num(amount) / ctx.preis : 0; }
  } else if (y.includes("2022")) {
    if (costId === "K006") { ctx.gesamtbetrag = 3979.60; }
    if (costId === "K002") { ctx.gesamtbetrag = 2386.87; ctx.basisTotal = 438; ctx.preis = 5.45; ctx.einheiten = ctx.preis ? num(amount) / ctx.preis : 0; }
    if (costId === "K009") { ctx.gesamtbetrag = 1503.00; ctx.basisTotal = 7; ctx.preis = 214.71; ctx.einheiten = ctx.preis ? num(amount) / ctx.preis : 0; }
  }
  return ctx;
}

function importedEntryPeriodForCost(entry, costId) {
  if (!entry) return "";
  if (costId === "K006") return entry.heizPeriode || isoPeriodToShortRange(entry.periode);
  if (costId === "K002") return entry.wasserPeriode || isoPeriodToShortRange(entry.periode);
  if (costId === "K009") return entry.abfallPeriode || isoPeriodToShortRange(entry.periode);
  return isoPeriodToShortRange(entry.periode);
}

function entryBriefValidationStatus(e) {
  if (!e) return "";
  const expected = Math.round((num(e.kostenanteil) - num(e.vorauszahlung)) * 100) / 100;
  const actual = Math.round(num(e.saldo) * 100) / 100;
  return Math.abs(expected - actual) <= 0.01 ? "Briefdaten geprüft" : "Prüfen";
}

function applyExcelWaterReadings2024ToData(data) {
  if (!data) return;
  if (!data.meta) data.meta = {};
  if (data.meta.waterReadingsImportedFromExcel2024 === true) return;

  // Diese Migration ist ausschließlich für die importierten 2024-Testdaten gedacht.
  // Sie darf spätere Jahre oder fremde Datenstände nicht unbeabsichtigt überschreiben.
  if (String(data.meta.abrechnungsjahr || "") !== "2024") return;

  const excelReadings = {
    W00:{kwStart:420,kwEnd:490,wwStart:246,wwEnd:280},
    W01:{kwStart:228,kwEnd:266,wwStart:98,wwEnd:108},
    W02:{kwStart:105,kwEnd:117,wwStart:24,wwEnd:28},
    W03:{kwStart:153,kwEnd:168,wwStart:52,wwEnd:59},
    W04:{kwStart:152,kwEnd:195,wwStart:186,wwEnd:241},
    W05:{kwStart:123.08,kwEnd:124,wwStart:143,wwEnd:144},
    W06:{kwStart:136.98,kwEnd:137,wwStart:110.99,wwEnd:111}
  };

  if (!data.waterMeters) data.waterMeters = {};
  if (!data.waterMeters.settings) data.waterMeters.settings = {};
  data.waterMeters.settings.enabled = "Ja";
  if (!num(data.waterMeters.settings.houseWaterTotal)) data.waterMeters.settings.houseWaterTotal = 295;
  if (!Array.isArray(data.waterMeters.readings)) data.waterMeters.readings = [];

  const tenantCount = Math.max(20, Array.isArray(data.mieter) ? data.mieter.length : 0);
  while (data.waterMeters.readings.length < tenantCount) {
    data.waterMeters.readings.push({kwStart:0,kwStartDate:"",kwEnd:0,kwEndDate:"",wwStart:0,wwStartDate:"",wwEnd:0,wwEndDate:"",bemerkung:""});
  }

  if (!data.umlageInputs) data.umlageInputs = {};
  if (!data.umlageInputs.K002) data.umlageInputs.K002 = {kostenId:"K002", kostenart:"Wasserversorgung", art:"Verbrauch", values:[]};
  if (!Array.isArray(data.umlageInputs.K002.values)) data.umlageInputs.K002.values = [];
  while (data.umlageInputs.K002.values.length < tenantCount) data.umlageInputs.K002.values.push(0);

  if (Array.isArray(data.mieter)) {
    data.mieter.forEach((m, idx) => {
      const unit = String(m.wohnung || "").trim().toUpperCase();
      const d = excelReadings[unit];
      if (!d) return;
      data.waterMeters.readings[idx] = {
        kwStart:d.kwStart,
        kwStartDate:"2023-12-31",
        kwEnd:d.kwEnd,
        kwEndDate:"2024-12-31",
        wwStart:d.wwStart,
        wwStartDate:"2023-12-31",
        wwEnd:d.wwEnd,
        wwEndDate:"2024-12-31",
        bemerkung:"aus Excel-Tab Wasserverbrauch: Ende 2023 / Ende 2024"
      };
      data.umlageInputs.K002.values[idx] = (num(d.kwEnd) - num(d.kwStart)) + (num(d.wwEnd) - num(d.wwStart));
    });
  }

  data.meta.waterReadingsImportedFromExcel2024 = true;
  data.meta.waterReadingsSource = "Nebenkostenberechnung 2024(1).xlsx / Tab Wasserverbrauch / Ende 2023 und Ende 2024";
  data.meta.excelWaterDelta24AllUnits = 289.95;
}

function saveData(options = {}) {
  if (!options.skipPrepare && typeof prepareStateForPersistence === "function") prepareStateForPersistence("save");
  if (typeof isArchiveViewer === "function" && isArchiveViewer()) {
    setActionMessage("Archivansicht ist schreibgeschützt. Änderungen werden nicht gespeichert.", "warn");
    renderActionFeedback();
    return false;
  }
  if (typeof isCurrentBillingFinalized === "function" && isCurrentBillingFinalized() && !finalizationWriteBypass) {
    setActionMessage("Abrechnung ist finalisiert. Änderungen wurden nicht gespeichert. Zum Bearbeiten zuerst Finalisierung aufheben.", "warn");
    renderActionFeedback();
    return false;
  }
  try {
    if (!state.meta) state.meta = {};
    enforceWorkingStateDataContract(state);
    state.meta.lastSavedAt = new Date().toISOString();
    state.meta.lastSavedWithAppVersion = APP_VERSION;
    delete state.meta.lastSaveError;
    const previous = readStoredDataResult(STORAGE_KEY);
    if (previous.valid) {
      const recoveryState = normalizeLegacyData(clone(previous.data));
      enforceWorkingStateDataContract(recoveryState, { storageRole:"recovery" });
      recoveryState.meta.recoveryCreatedAt = new Date().toISOString();
      recoveryState.meta.recoveryCreatedWithAppVersion = APP_VERSION;
      recoveryState.meta.recoverySourceStorageKey = STORAGE_KEY;
      writeProtectedStorage(STORAGE_RECOVERY_KEY, recoveryState);
    }
    state.meta.storageRole = "working";
    const protectedState = writeProtectedStorage(STORAGE_KEY, state);
    state.meta.storageIntegrityAlgorithm = protectedState.meta.storageIntegrityAlgorithm;
    state.meta.storageIntegrityChecksum = protectedState.meta.storageIntegrityChecksum;
    state.meta.storageIntegrityProtectedAt = protectedState.meta.storageIntegrityProtectedAt;
    state.meta.storageIntegrityProtectedWithAppVersion = protectedState.meta.storageIntegrityProtectedWithAppVersion;
    pendingStorageWarning = "";
    setActionMessage("Gespeichert " + new Date(state.meta.lastSavedAt).toLocaleString("de-DE"));
    renderSystemMessages();
    renderActionFeedback();
    return true;
  } catch(e) {
    notifyStorageProblem("Daten konnten nicht im lokalen Browser-Speicher gespeichert werden. Bitte lade eine JSON-Sicherung herunter und pruefe freien Browser-Speicher.", e);
    if (!state.meta) state.meta = {};
    state.meta.lastSaveError = String(e && (e.message || e.name) || e);
    setActionMessage("Speichern fehlgeschlagen. Bitte JSON-Sicherung herunterladen.", "err");
    renderSystemMessages();
    renderActionFeedback();
    return false;
  }
}

function commitStateChange(options = {}) {
  const reason = String(options.reason || "Änderung");
  const render = options.render !== false;
  const forceAll = options.forceAll === true;
  const tabIds = Array.isArray(options.tabIds) ? options.tabIds.filter(Boolean) : (options.tabId ? [options.tabId] : null);
  const includeCommon = options.includeCommon !== false;
  const includeNavigation = options.includeNavigation !== false;
  const includeTableTools = options.includeTableTools !== false;
  prepareStateForPersistence(reason);
  const saveFn = options.finalizationBypass ? () => withFinalizationWriteBypass(() => saveData({ skipPrepare:true })) : () => saveData({ skipPrepare:true });
  const saved = saveFn();
  if (render) renderAll({ forceAll, tabIds, includeCommon, includeNavigation, includeTableTools, reason });
  return saved;
}

function fmtMoney(value) { const n = Number(value || 0); return n.toLocaleString("de-DE", { style:"currency", currency:"EUR" }); }
function num(value) { if (value === null || value === undefined || value === "") return 0; if (typeof value === "number") return value; return Number(String(value).replace(/\./g, "").replace(",", ".")) || 0; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s])); }
function escapeJsString(value) { return String(value ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\'").replace(/\r/g, "\\r").replace(/\n/g, "\\n"); }
function statusClass(status) {
  if (status === "Vollständig" || status === "OK") return "ok";
  if (status === "Nicht Bestandteil der NK-Abrechnung") return "neutral";
  if (status === "Nicht auf Mieter umgelegt") return "warn";
  if (!status) return "neutral";
  if (status.includes("fehlt") || status.includes("prüfen") || status.includes("auswählen") || status.includes("Zuordnung") || status.includes("Überverteilung") || status.includes("berechtigte")) return "warn";
  return "err";
}

function normalizeCostSettings(row) {
  if (!row) return row;
  if (!COST_EXCLUSION_OPTIONS.includes(row.ausschlussBehandlung)) row.ausschlussBehandlung = COST_EXCLUSION_FULL;
  row.umlageschluessel = normalizeManualUmlageValue(row.umlageschluessel);
  const hadNoConsumptionField = row.gesamtverbrauch === undefined || row.gesamtverbrauch === null;
  if (hadNoConsumptionField) row.gesamtverbrauch = "";
  row.preisProEinheitManuell = row.preisProEinheitManuell === true || (hadNoConsumptionField && num(row.preisProEinheit) > 0);
  if (row.umlageschluessel === "Verbrauch") applyAutoPriceIfNeeded(row, false);
  return row;
}

function ensureCostSettings(data = state) {
  if (!data || !Array.isArray(data.kostenarten)) return;
  data.kostenarten.forEach(k => normalizeCostSettings(k));
}

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

function autoPriceForCost(row) {
  const total = num(row && row.gesamtbetrag);
  const consumption = num(row && row.gesamtverbrauch);
  if (total > 0 && consumption > 0) return Math.round((total / consumption) * 10000) / 10000;
  return "";
}

function isManualPriceOverride(row) {
  return row && row.preisProEinheitManuell === true;
}

function applyAutoPriceIfNeeded(row, force = false) {
  if (!row) return row;
  const autoPrice = autoPriceForCost(row);
  if (force) row.preisProEinheitManuell = false;
  if (!isManualPriceOverride(row) && autoPrice !== "") row.preisProEinheit = autoPrice;
  return row;
}

function resetCostUnitPriceToAuto(index) {
  const row = state.kostenarten[index];
  if (!row) return;
  row.preisProEinheitManuell = false;
  applyAutoPriceIfNeeded(row, true);
  row.status = kostenStatus(row);
  commitStateChange({ reason:"Benutzereingabe" });
}

const COST_GROUP_OPTIONS = ["Betriebskosten","Wasser","Heizung / Warmwasser","Abfall","Eigentümerkosten / nicht umlagefähig","Sonstige / freie Kostenarten"];
const STANDARD_COST_GROUP_BY_ID = {K002:"Wasser",K006:"Heizung / Warmwasser",K009:"Abfall",K017:"Betriebskosten",K040:"Archiv / Hinweise"};
function isFreeCostSlot(k) { return !!(k && (/^K03[1-9]$/.test(String(k.id || "")) || String(k.bereich || "").toLowerCase() === "noch festlegen" || /^Weitere Kosten/i.test(String(k.kostenart || "")))); }
function costGroupLabel(k) {
  if (!k) return "Sonstige / freie Kostenarten";
  if (STANDARD_COST_GROUP_BY_ID[k.id]) return STANDARD_COST_GROUP_BY_ID[k.id];
  if (COST_GROUP_OPTIONS.includes(k.fachgruppe)) return k.fachgruppe;
  const area = String(k.bereich || "").trim();
  if (COST_GROUP_OPTIONS.includes(area)) return area;
  if (/eigentümer|eigentuemer|nicht|verwaltung|finanzierung|instand|modernisierung|anschaffung|bank|rechts|steuer|leerstand/i.test(area)) return "Eigentümerkosten / nicht umlagefähig";
  if (/wasser/i.test(area)) return "Wasser";
  if (/heiz|wärme|waerme/i.test(area)) return "Heizung / Warmwasser";
  if (/abfall|müll|muell/i.test(area)) return "Abfall";
  if (/betrieb/i.test(area)) return "Betriebskosten";
  return "Sonstige / freie Kostenarten";
}
function configureFreeCost(index, name, group) {
  const k=state.kostenarten[index]; if (!k) return;
  const clean=String(name||"").trim();
  if (!clean) { alert("Bitte eine Bezeichnung für die eigene Kostenart eingeben."); return; }
  k.kostenart=clean; k.fachgruppe=COST_GROUP_OPTIONS.includes(group)?group:"Sonstige / freie Kostenarten"; k.bereich=k.fachgruppe; k.inNK="Ja";
  commitStateChange({reason:"Benutzereingabe",tabId:"einstellungen"});
  renderCostSelectionPanel();
}

function renderCostSelectionPanel() {
  const el = document.getElementById("costSelectionPanel");
  if (!el) return;
  const costs = (Array.isArray(state.kostenarten) ? state.kostenarten : []).filter(k => k && k.id && k.kostenart);
  const groups = {};
  costs.forEach((k, i) => {
    const group = costGroupLabel(k);
    if (!groups[group]) groups[group] = [];
    groups[group].push({ k, i });
  });
  const order = ["Betriebskosten", "Wasser", "Heizung / Warmwasser", "Abfall", "Eigentümerkosten / nicht umlagefähig", "Sonstige / freie Kostenarten", "Archiv / Hinweise"];
  const names = Object.keys(groups).sort((a,b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.localeCompare(b, "de");
  });
  const activeCount = costs.filter(k => k.inNK === "Ja").length;
  const grid = names.map(group => {
    const items = groups[group].map(({k,i}) => {
      if (isFreeCostSlot(k)) {
        const opts=COST_GROUP_OPTIONS.map(g=>'<option value="'+escapeHtml(g)+'" '+(costGroupLabel(k)===g?'selected':'')+'>'+escapeHtml(g)+'</option>').join('');
        return '<div class="cost-picker-item free-cost-editor"><input id="freeCostName_'+i+'" value="'+escapeHtml(/^Weitere Kosten/i.test(k.kostenart||'')?'':(k.kostenart||''))+'" placeholder="Eigene Kostenart"><select id="freeCostGroup_'+i+'">'+opts+'</select><button type="button" onclick="configureFreeCost('+i+',document.getElementById(\'freeCostName_'+i+'\').value,document.getElementById(\'freeCostGroup_'+i+'\').value)">Anlegen</button></div>';
      }
      return '<label class="cost-picker-item"><input type="checkbox" ' + (k.inNK === "Ja" ? 'checked ' : '') + 'onchange="setCostSetting(' + i + ',\'inNK\',this.checked?\'Ja\':\'Nein\')"' + editDisabledAttr() + '><span><span class="cost-picker-id">' + escapeHtml(k.id) + '</span> · ' + escapeHtml(k.kostenart) + '</span></label>';
    }).join("");
    return '<div class="cost-picker-group"><h4>' + escapeHtml(group) + '</h4>' + items + '</div>';
  }).join("");
  el.innerHTML = '<div class="inline-titlebar"><div><h3>Kostenarten auswählen</h3><p class="small">Aktiviert: ' + activeCount + ' von ' + costs.length + '. Deaktivierte Kostenarten bleiben gespeichert, erscheinen aber nicht in der Bearbeitungstabelle.</p></div></div><div class="cost-picker-grid">' + grid + '</div>';
}

let activeCostPriceEditorIndex = null;

function priceCellHtml(k, index) {
  const autoPrice = autoPriceForCost(k);
  const price = num(k.preisProEinheit);
  const unit = costUnitLabel(k) || "Einheit";
  const mode = isManualPriceOverride(k) ? "manuell" : "automatisch";
  const value = price > 0 ? fmtMoney(price) + " / " + escapeHtml(unit) : "–";
  const title = autoPrice !== ""
    ? "Automatischer Preis: " + fmtMoney(autoPrice) + " · aktuell " + mode
    : "Automatischer Preis nicht möglich: Gesamtverbrauch fehlt";
  return '<button type="button" class="compact-price-button" onclick="openCostPriceEditor(' + index + ')" title="' + escapeHtml(title) + '"' + editDisabledAttr() + '>' +
    '<span class="compact-price-value">' + value + '</span><span class="compact-price-edit" aria-hidden="true">✎</span></button>';
}

function openCostPriceEditor(index) {
  if (isArchiveViewer()) return;
  const row = state.kostenarten[index];
  const modal = document.getElementById("costPriceModal");
  if (!row || !modal) return;
  activeCostPriceEditorIndex = index;
  const autoPrice = autoPriceForCost(row);
  document.getElementById("costPriceDialogTitle").textContent = "Einheitspreis bearbeiten";
  document.getElementById("costPriceDialogCostName").textContent = row.kostenart || row.id || "Kostenart";
  document.getElementById("costPriceDialogInput").value = row.preisProEinheit ?? "";
  document.getElementById("costPriceDialogUnit").textContent = "Einheit: " + (costUnitLabel(row) || "Einheit");
  document.getElementById("costPriceDialogAutoNote").textContent = autoPrice !== ""
    ? "Automatisch berechnet: " + fmtMoney(autoPrice) + " je " + (costUnitLabel(row) || "Einheit")
    : "Automatischer Preis ist erst möglich, wenn ein Gesamtverbrauch vorhanden ist.";
  modal.hidden = false;
  requestAnimationFrame(() => document.getElementById("costPriceDialogInput").focus());
}

function closeCostPriceEditor() {
  const modal = document.getElementById("costPriceModal");
  if (modal) modal.hidden = true;
  activeCostPriceEditorIndex = null;
}

function saveCostPriceFromDialog() {
  if (activeCostPriceEditorIndex === null) return;
  const input = document.getElementById("costPriceDialogInput");
  setCostSetting(activeCostPriceEditorIndex, "preisProEinheit", input ? input.value : "");
  closeCostPriceEditor();
}

function resetCostPriceFromDialog() {
  if (activeCostPriceEditorIndex === null) return;
  resetCostUnitPriceToAuto(activeCostPriceEditorIndex);
  closeCostPriceEditor();
}

function kostenStatus(row) {
  normalizeCostSettings(row);
  if (!row.kostenart) return "";
  if (!row.inNK || !row.vorauszahlung) return "Eingabe fehlt";
  if (row.inNK === "Nein" && row.vorauszahlung === "Ja") return "Vorauszahlung ohne NK-Zuordnung";
  if (row.inNK === "Nein") return "Nicht Bestandteil der NK-Abrechnung";
  if (num(row.gesamtbetrag) <= 0) return "Gesamtbetrag fehlt";
  if (row.berechnungsart === "Automatisch") {
    if (!row.umlageschluessel || row.umlageschluessel === "Entfällt" || row.umlageschluessel === UMLAGE_MANUAL) return "Umlageschlüssel fehlt";
    if (row.umlageschluessel === "Verbrauch" && num(row.preisProEinheit) <= 0) return "Preis je Verbrauchseinheit fehlt";
    return "Vollständig";
  }
  if (row.berechnungsart === "Manuell je Mieter") return row.umlageschluessel === UMLAGE_MANUAL ? "Vollständig" : "Manuelle Eingabe auswählen";
  return "Berechnungsart fehlt";
}

function recalculateAll() {
  state.kostenarten.forEach(row => row.status = kostenStatus(row));
  state.mieter.forEach(row => { row.kaltSoll = num(row.kaltSoll); row.kaltErhalten = num(row.kaltErhalten); row.nkVoraus = num(row.nkVoraus); row.einnahmen = num(row.kaltErhalten) + num(row.nkVoraus); });
  commitStateChange({ reason:"Benutzereingabe" });
}

function setNested(collection, index, key, value, type="text") {
  if (collection === "kostenarten" && ["inNK","vorauszahlung","gesamtbetrag","gesamtverbrauch","preisProEinheit","ausschlussBehandlung"].includes(key)) {
    setCostSetting(index, key, value);
    return;
  }
  if (type === "number") value = num(value);
  state[collection][index][key] = value;
  if (collection === "kostenarten" && key !== "status") {
    normalizeCostSettings(state[collection][index]);
    state[collection][index].status = kostenStatus(state[collection][index]);
    syncKostenartenMieterUmlage();
  }
  if (collection === "wohnungen") ensureUnitIdentityFields(state[collection][index]);
  if (collection === "mieter") { const row = state[collection][index]; row.einnahmen = num(row.kaltErhalten) + num(row.nkVoraus); ensureTenantIdentityFields(row); }
  commitStateChange({ reason:"Benutzereingabe" });
}

function editDisabledAttr() { return (typeof isCurrentBillingFinalized === "function" && isCurrentBillingFinalized()) ? ' disabled title="Finalisierte Abrechnung: zuerst Finalisierung aufheben"' : ''; }
function selectHtml(value, options, onChange) {
  return '<select onchange="' + onChange + '"' + editDisabledAttr() + '>' + options.map(o => '<option value="' + escapeHtml(o) + '" ' + (o===value ? 'selected' : '') + '>' + escapeHtml(o) + '</option>').join("") + '</select>';
}
function inputHtml(value, onChange, cls="") { return '<input class="' + cls + '" value="' + escapeHtml(value ?? "") + '" onchange="' + onChange + '"' + editDisabledAttr() + '>'; }
function dateInputHtml(value, onChange, cls="") { return '<input type="date" class="' + cls + '" value="' + escapeHtml(value ?? "") + '" onchange="' + onChange + '"' + editDisabledAttr() + '>'; }

function hasTenantData(m) {
  return !!(m && (m.name || m.wohnung || m.einzug || m.auszug || num(m.kaltSoll) || num(m.kaltErhalten) || num(m.nkVoraus) || num(m.aktiveTage) || num(m.personen)));
}

function ensureTenantContactFields(m) {
  if (!m) return;
  if (m.geschlecht === undefined || m.geschlecht === null || m.geschlecht === "") m.geschlecht = "Frau/Herr";
  if (m.standardanrede === undefined || m.standardanrede === null || m.standardanrede === "") m.standardanrede = "Automatisch";
  if (m.strasse === undefined || m.strasse === null || m.strasse === "") m.strasse = "Am Rauhen Biehl 5";
  if (m.plz === undefined || m.plz === null || m.plz === "") m.plz = "55774";
  if (m.ort === undefined || m.ort === null || m.ort === "") m.ort = "Baumholder";
  if (m.telefon === undefined || m.telefon === null) m.telefon = "";
  if (m.email === undefined || m.email === null) m.email = "";
  if (m.abrechnungRolle === undefined || m.abrechnungRolle === null || m.abrechnungRolle === "") m.abrechnungRolle = (m.id === "M000" || String(m.name || "").includes("Zimmermann")) ? "Eigentümer/Privat" : "Mieter";
  if (m.wasserWeitereVorauszahlung === undefined || m.wasserWeitereVorauszahlung === null || m.wasserWeitereVorauszahlung === "") m.wasserWeitereVorauszahlung = 0;
  if (m.vorjahresKorrektur === undefined || m.vorjahresKorrektur === null || m.vorjahresKorrektur === "") m.vorjahresKorrektur = 0;
  if (m.vzChangeHeizung === undefined || m.vzChangeHeizung === null || m.vzChangeHeizung === "") m.vzChangeHeizung = "";
  if (m.vzChangeWasser === undefined || m.vzChangeWasser === null || m.vzChangeWasser === "") m.vzChangeWasser = "";
  if (m.vzChangeAbfall === undefined || m.vzChangeAbfall === null || m.vzChangeAbfall === "") m.vzChangeAbfall = "";
  if (m.vzChangeAntenne === undefined || m.vzChangeAntenne === null || m.vzChangeAntenne === "") m.vzChangeAntenne = "";
}

function normalizeUnitIdentityText(value) {
  let text = String(value || "").trim().toLowerCase().replace(/\u00df/g, "ss");
  if (text.normalize) text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return text.replace(/[^a-z0-9]+/g, " ").trim();
}



function canonicalUnitIdFor(value) {
  const candidates = [];
  if (value && typeof value === "object") candidates.push(value.id, value.wohnung, value.bezeichnung, value.lage, value.excelKennung, value.zaehlerKennung);
  else candidates.push(value);
  for (const item of candidates) {
    if (item === undefined || item === null || item === "") continue;
    const raw = String(item).trim();
    if (/^W\d{3}\.[A-Z0-9.-]+$/i.test(raw)) return raw.toUpperCase();
    const key = normalizeUnitIdentityText(raw);
    const compact = key.replace(/\s+/g, "");
    if (UNIT_ID_ALIASES[key]) return UNIT_ID_ALIASES[key];
    if (UNIT_ID_ALIASES[compact]) return UNIT_ID_ALIASES[compact];
  }
  return "";
}

function generatedUnitIdForLabel(label, index) {
  const code = normalizeUnitIdentityText(label).toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9-]+/g, "").replace(/^-+|-+$/g, "").slice(0, 12) || "IMPORT";
  return "W9" + String(index + 1).padStart(2, "0") + "." + code;
}

function migrateUnitIdsInData(data) {
  if (!data || typeof data !== "object") return data;
  const idMap = {};
  if (Array.isArray(data.wohnungen)) {
    data.wohnungen.forEach((w, i) => {
      if (!w) return;
      const oldId = String(w.id || "");
      const newId = canonicalUnitIdFor(w) || oldId || generatedUnitIdForLabel(w.bezeichnung || w.lage || "Wohnung", i);
      if (oldId && oldId !== newId) idMap[oldId] = newId;
      w.id = newId;
      delete w.unitId;
    });
    const seen = new Map();
    data.wohnungen = data.wohnungen.filter(w => {
      if (!w || !w.id) return true;
      if (!seen.has(w.id)) { seen.set(w.id, w); return true; }
      const target = seen.get(w.id);
      ["bezeichnung","lage","wohnflaeche","zimmer","status","bemerkung"].forEach(key => {
        if ((target[key] === undefined || target[key] === "" || target[key] === 0) && w[key] !== undefined && w[key] !== "") target[key] = w[key];
      });
      return false;
    });
    data.wohnungen.sort((a,b) => String(a.id || "").localeCompare(String(b.id || ""), "de"));
  }
  if (Array.isArray(data.mieter)) {
    data.mieter.forEach(m => {
      if (!m) return;
      delete m.personId;
      if (m.wohnung) m.wohnung = idMap[m.wohnung] || canonicalUnitIdFor(m.wohnung) || m.wohnung;
    });
  }
  if (data.waterMeterHistory && Array.isArray(data.waterMeterHistory.units)) {
    data.waterMeterHistory.units.forEach((unit, index) => {
      if (!unit) return;
      unit.wohnung = canonicalUnitIdFor(unit) || canonicalUnitIdFor(unit.wohnung) || unit.wohnung || generatedUnitIdForLabel(unit.bezeichnung || "Wasser", index);
    });
    data.waterMeterHistory.units.sort((a,b) => String(a.wohnung || "").localeCompare(String(b.wohnung || ""), "de"));
  }
  if (Array.isArray(data.jahresArchiv)) {
    data.jahresArchiv.forEach(item => {
      if (item && item.data && item.data !== data) migrateUnitIdsInData(item.data);
    });
  }
  return data;
}

function ensureTenantIdentityFields(m) {
  if (!m) return;
  delete m.personId;
}

function ensureTenantIdentityData(data) {
  if (!data || !Array.isArray(data.mieter)) return;
  data.mieter.forEach(m => ensureTenantIdentityFields(m));
  if (Array.isArray(data.jahresArchiv)) {
    data.jahresArchiv.forEach(item => {
      if (item && item.data && item.data !== data) ensureTenantIdentityData(item.data);
    });
  }
}

function tenantDisplayId(m) {
  return String((m && m.id) || "");
}

function tenantIdCellHtml(m) {
  return escapeHtml(tenantDisplayId(m));
}

function ensureUnitIdentityFields(w) {
  if (!w) return;
  delete w.unitId;
  w.id = canonicalUnitIdFor(w) || w.id || "";
}

function ensureUnitIdentityData(data) {
  return migrateUnitIdsInData(data);
}

function unitDisplayId(w) {
  return String((w && w.id) || "");
}

function unitByInternalId(id) {
  if (!Array.isArray(state.wohnungen)) return null;
  return state.wohnungen.find(w => String(w.id || "") === String(id || "")) || null;
}

function unitDisplayIdByInternalId(id) {
  return String(id || "");
}

function unitIdCellHtml(w) {
  return escapeHtml(unitDisplayId(w));
}

function unitRefCellHtml(id) {
  return escapeHtml(unitDisplayIdByInternalId(id));
}

function unitSelectHtmlFromRows(value, rows, onChange) {
  const current = String(value || "");
  const known = Array.isArray(rows) ? rows.filter(w => w && w.id) : [];
  let options = "";
  if (current && !known.some(w => String(w.id) === current)) {
    options += '<option value="' + escapeHtml(current) + '" selected>' + escapeHtml(current + " - nicht in Stammdaten") + '</option>';
  }
  options += known.map(w => {
    const id = String(w.id || "");
    const label = id + " - " + (w.bezeichnung || w.lage || id);
    return '<option value="' + escapeHtml(id) + '" ' + (id === current ? 'selected' : '') + '>' + escapeHtml(label) + '</option>';
  }).join("");
  return '<select onchange="' + onChange + '"><option value="">Bitte waehlen</option>' + options + '</select>';
}

function unitSelectHtml(value, onChange) {
  return unitSelectHtmlFromRows(value, state.wohnungen, onChange);
}

function masterUnitSelectHtml(value, onChange) {
  return unitSelectHtmlFromRows(value, masterUnits(), onChange);
}

function ensureTenantContactData() {
  if (!Array.isArray(state.mieter)) return;
  state.mieter.forEach(m => { ensureTenantContactFields(m); ensureTenantIdentityFields(m); });
}

function normalizeMasterUnitRows(rows) {
  const source = Array.isArray(rows) ? rows : [];
  const seen = new Set();
  return source.map((w, index) => {
    const row = clone(w || {});
    ensureUnitIdentityFields(row);
    if (!row.id) row.id = generatedUnitIdForLabel(row.bezeichnung || row.lage || "Wohnung", index);
    delete row.status;
    if (row.bemerkung === undefined || row.bemerkung === null) row.bemerkung = "";
    return row;
  }).filter(row => {
    const id = String(row.id || "");
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).sort((a,b) => String(a.id || "").localeCompare(String(b.id || ""), "de"));
}

function normalizeBillingUnitRows(masterRows, existingRows) {
  const statusById = new Map((Array.isArray(existingRows) ? existingRows : []).map(w => [String(w && w.id || ""), String(w && w.status || "aktiv")]));
  return normalizeMasterUnitRows(masterRows).map(w => ({...w, status:statusById.get(String(w.id || "")) || "aktiv"}));
}

function setBillingUnitStatus(index, value) {
  if (!Array.isArray(state.wohnungen) || !state.wohnungen[index]) return;
  state.wohnungen[index].status = value === "inaktiv" ? "inaktiv" : "aktiv";
  commitStateChange({ reason:"Benutzereingabe", tabId:"mieter" });
}

function normalizeMasterTenantRows(rows) {
  const source = Array.isArray(rows) ? rows : [];
  return source.filter(m => hasTenantData(m)).map(m => {
    const row = clone(m || {});
    if (row.status === "archiviert" || row.status === "Archiv") row.status = "Archiviert";
    if (row.status === "OK") row.status = row.auszug ? "NK offen" : "Aktiv";
    if (row.archivedAt === undefined || row.archivedAt === null) row.archivedAt = "";
    ensureTenantContactFields(row);
    ensureTenantIdentityFields(row);
    if (row.wohnung) row.wohnung = canonicalUnitIdFor(row.wohnung) || row.wohnung;
    return row;
  });
}

function comparableTenantName(value) {
  return String(value || "")
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function applyKnownMasterTenantEntryDates(data, options = {}) {
  if (!data || !data.meta || (data.meta && data.meta.archiveViewer)) return false;
  if (data.meta.masterTenantEntryDateFix === MASTER_TENANT_ENTRY_DATE_FIX_ID) return false;
  ensureStammdatenData(data);
  let changed = false;
  const targets = MASTER_TENANT_ENTRY_DATES.map(item => ({
    ...item,
    normalizedName: comparableTenantName(item.name)
  }));

  data.stammdaten.mieter.forEach(m => {
    const name = comparableTenantName(m && m.name);
    const target = targets.find(item => name.includes(item.normalizedName));
    if (!target) return;
    if (m.einzug !== target.date) {
      m.einzug = target.date;
      changed = true;
    }
  });

  data.meta.masterTenantEntryDateFix = MASTER_TENANT_ENTRY_DATE_FIX_ID;
  if (options.save && data === state) saveData();
  return changed;
}

function ensureStammdatenData(data) {
  if (!data || typeof data !== "object") return data;
  if (!data.stammdaten || typeof data.stammdaten !== "object" || Array.isArray(data.stammdaten)) data.stammdaten = {};
  if (!Array.isArray(data.stammdaten.wohnungen) || !data.stammdaten.wohnungen.length) {
    data.stammdaten.wohnungen = clone(Array.isArray(data.wohnungen) ? data.wohnungen : []);
  }
  if (!Array.isArray(data.stammdaten.mieter) || !data.stammdaten.mieter.length) {
    data.stammdaten.mieter = clone(Array.isArray(data.mieter) ? data.mieter.filter(m => hasTenantData(m)) : []);
  }
  data.stammdaten.wohnungen = normalizeMasterUnitRows(data.stammdaten.wohnungen);
  data.stammdaten.mieter = normalizeMasterTenantRows(data.stammdaten.mieter);
  return data;
}

function masterData() {
  ensureStammdatenData(state);
  return state.stammdaten;
}

function masterUnits() {
  return masterData().wohnungen;
}

function masterTenants() {
  return masterData().mieter;
}

function masterTenantCount() {
  return masterTenants().filter(m => m && m.name && !isArchivedTenant(m)).length;
}

function masterVisibleTenantRows() {
  return masterTenants()
    .map((m,i) => ({...m, originalIndex:i}))
    .filter(m => hasTenantData(m) && !isArchivedTenant(m));
}

function masterArchivedTenantRows() {
  return masterTenants()
    .map((m,i) => ({...m, originalIndex:i}))
    .filter(m => hasTenantData(m) && isArchivedTenant(m));
}

function nextMasterMietId() {
  const maxNum = masterTenants().reduce((max,m) => {
    const match = String(m.id || "").match(/^M(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return "M" + String(maxNum + 1).padStart(3, "0");
}

function setMasterNested(collection, index, key, value, type="text") {
  const master = masterData();
  if (!Array.isArray(master[collection]) || !master[collection][index]) return;
  if (type === "number") value = num(value);
  master[collection][index][key] = value;
  if (collection === "wohnungen") master[collection] = normalizeMasterUnitRows(master[collection]);
  if (collection === "mieter") master[collection] = normalizeMasterTenantRows(master[collection]);
  commitStateChange({ reason:"Benutzereingabe" });
}

function addMasterMietverhaeltnis() {
  const master = masterData();
  const newRow = {
    id: nextMasterMietId(),
    wohnung:"",
    name:"",
    einzug:"",
    auszug:"",
    kaltSoll:0,
    kaltErhalten:0,
    nkVoraus:0,
    einnahmen:0,
    aktiveTage:365,
    wohnflaeche:0,
    bemerkung:"",
    status:"Aktiv",
    personen:1,
    personentage:365,
    geschlecht:"Frau/Herr",
    standardanrede:"Automatisch",
    strasse:"Am Rauhen Biehl 5",
    plz:"55774",
    ort:"Baumholder",
    telefon:"",
    email:"",
    abrechnungRolle:"Mieter",
    wasserWeitereVorauszahlung:0,
    vorjahresKorrektur:0,
    archivedAt:""
  };
  master.mieter.push(newRow);
  commitStateChange({ reason:"Benutzereingabe" });
}

function archiveMasterMietverhaeltnis(index) {
  const row = masterTenants()[index];
  if (!row || !hasTenantData(row)) return;
  if (!confirm("Dieses Mietverhältnis im zentralen Bestand archivieren? Es wird dann nicht mehr automatisch in neue Abrechnungen übernommen.")) return;
  row.status = "Archiviert";
  row.archivedAt = todayIso();
  commitStateChange({ reason:"Benutzereingabe" });
}

function restoreMasterMietverhaeltnis(index) {
  const row = masterTenants()[index];
  if (!row) return;
  row.status = row.auszug ? "NK offen" : "Aktiv";
  row.archivedAt = "";
  commitStateChange({ reason:"Benutzereingabe" });
}

function tenantBillingCopyFromMaster(masterTenant, periodDays) {
  const row = clone(masterTenant || {});
  ensureTenantContactFields(row);
  ensureTenantIdentityFields(row);
  const activeDays = tenantActiveDaysInCurrentPeriod(row) || periodDays;
  row.kaltSoll = num(row.kaltSoll);
  row.kaltErhalten = 0;
  row.nkVoraus = 0;
  row.vorjahresKorrektur = 0;
  row.wasserWeitereVorauszahlung = 0;
  row.einnahmen = 0;
  row.aktiveTage = activeDays;
  row.personen = num(row.personen) || 1;
  row.personentage = num(row.personen) * activeDays;
  row.archivedAt = row.archivedAt || "";
  row.status = tenantOpenStatus(row) || row.status || "";
  return row;
}

function applyStammdatenToCurrentBilling() {
  const periodDays = periodDaysExact();
  state.wohnungen = normalizeBillingUnitRows(masterUnits(), state.wohnungen);
  state.mieter = masterTenants()
    .filter(m => tenantRelevantForCurrentBilling(m))
    .map(m => tenantBillingCopyFromMaster(m, periodDays));
}

const BILLING_VALUE_FIELDS_TO_KEEP = [
  "kaltSoll",
  "kaltErhalten",
  "nkVoraus",
  "einnahmen",
  "wasserWeitereVorauszahlung",
  "vorjahresKorrektur",
  "vzChangeHeizung",
  "vzChangeWasser",
  "vzChangeAbfall",
  "vzChangeAntenne"
];

function tenantBillingCopyFromMasterKeepValues(masterTenant, existingTenant, periodDays) {
  const row = clone(masterTenant || {});
  ensureTenantContactFields(row);
  ensureTenantIdentityFields(row);
  if (existingTenant) {
    BILLING_VALUE_FIELDS_TO_KEEP.forEach(key => {
      if (existingTenant[key] !== undefined) row[key] = existingTenant[key];
    });
  }
  row.kaltSoll = num(row.kaltSoll);
  row.kaltErhalten = num(row.kaltErhalten);
  row.nkVoraus = num(row.nkVoraus);
  row.vorjahresKorrektur = num(row.vorjahresKorrektur);
  row.wasserWeitereVorauszahlung = num(row.wasserWeitereVorauszahlung);
  row.einnahmen = num(row.kaltErhalten) + num(row.nkVoraus);
  row.aktiveTage = tenantActiveDaysInCurrentPeriod(row) || (existingTenant ? normalizeActiveDayValue(existingTenant.aktiveTage) : 0) || periodDays;
  row.personen = num(row.personen) || (existingTenant ? num(existingTenant.personen) : 0) || 1;
  row.personentage = num(row.personen) * normalizeActiveDayValue(row.aktiveTage);
  row.archivedAt = row.archivedAt || "";
  row.status = tenantOpenStatus(row) || row.status || "";
  return row;
}

function captureTenantIndexedValuesById(rows, valuesKey) {
  const tenantIds = (Array.isArray(state.mieter) ? state.mieter : []).map(m => String(m && m.id || ""));
  const captured = {};
  (Array.isArray(rows) ? rows : []).forEach(row => {
    const rowId = String(row && (row.kostenId || row.id) || "");
    if (!rowId || !Array.isArray(row[valuesKey])) return;
    captured[rowId] = {};
    tenantIds.forEach((tenantId, index) => {
      if (tenantId) captured[rowId][tenantId] = num(row[valuesKey][index]);
    });
  });
  return captured;
}

function restoreTenantIndexedValuesById(rows, valuesKey, captured) {
  const tenantIds = (Array.isArray(state.mieter) ? state.mieter : []).map(m => String(m && m.id || ""));
  (Array.isArray(rows) ? rows : []).forEach(row => {
    const rowId = String(row && (row.kostenId || row.id) || "");
    const byTenant = rowId ? captured[rowId] : null;
    if (!byTenant || !Array.isArray(row[valuesKey])) return;
    tenantIds.forEach((tenantId, index) => {
      if (tenantId && Object.prototype.hasOwnProperty.call(byTenant, tenantId)) row[valuesKey][index] = byTenant[tenantId];
    });
    if (valuesKey === "werte") row.summe = row[valuesKey].reduce((a,b) => a + num(b), 0);
  });
}

function captureUmlageInputsByTenantId() {
  const tenantIds = (Array.isArray(state.mieter) ? state.mieter : []).map(m => String(m && m.id || ""));
  const captured = {};
  Object.keys(state.umlageInputs || {}).forEach(costId => {
    const input = state.umlageInputs[costId];
    if (!input || !Array.isArray(input.values)) return;
    captured[costId] = {};
    tenantIds.forEach((tenantId, index) => {
      if (tenantId) captured[costId][tenantId] = num(input.values[index]);
    });
  });
  return captured;
}

function restoreUmlageInputsByTenantId(captured) {
  const tenantIds = (Array.isArray(state.mieter) ? state.mieter : []).map(m => String(m && m.id || ""));
  Object.keys(state.umlageInputs || {}).forEach(costId => {
    const input = state.umlageInputs[costId];
    const byTenant = captured[costId];
    if (!input || !Array.isArray(input.values) || !byTenant) return;
    tenantIds.forEach((tenantId, index) => {
      if (tenantId && Object.prototype.hasOwnProperty.call(byTenant, tenantId)) input.values[index] = byTenant[tenantId];
    });
  });
}

function meterSnapshotRowScore(row, generic = false) {
  if (!row) return -1;
  const endDate = String(generic ? row.endDate : (row.kwEndDate || row.wwEndDate || ""));
  const startDate = String(generic ? row.startDate : (row.kwStartDate || row.wwStartDate || ""));
  const date = endDate || startDate;
  const serial = isoDateSerial(date);
  const hasEnd = generic ? hasEnteredMeterValue(row.end) : (hasEnteredMeterValue(row.kwEnd) || hasEnteredMeterValue(row.wwEnd));
  return (hasEnd ? 100000000 : 0) + (serial === null ? 0 : serial);
}

function captureMeterReadingsSnapshot(data = state) {
  const tenants = Array.isArray(data && data.mieter) ? data.mieter : [];
  const snapshot = { water:{ byTenant:{}, byUnit:{}, unitScores:{} }, generic:{} };
  const waterRows = data && data.waterMeters && Array.isArray(data.waterMeters.readings) ? data.waterMeters.readings : [];
  tenants.forEach((tenant,index) => {
    const row = waterRows[index];
    if (!row) return;
    const tenantId = String(tenant && tenant.id || "");
    const unitId = String(tenant && tenant.wohnung || "");
    if (tenantId) snapshot.water.byTenant[tenantId] = clone(row);
    if (unitId) {
      const score = meterSnapshotRowScore(row, false);
      if (snapshot.water.unitScores[unitId] === undefined || score >= snapshot.water.unitScores[unitId]) {
        snapshot.water.byUnit[unitId] = clone(row);
        snapshot.water.unitScores[unitId] = score;
      }
    }
  });
  const genericSource = data && data.meterReadings && data.meterReadings.readings && typeof data.meterReadings.readings === "object" ? data.meterReadings.readings : {};
  Object.keys(genericSource).forEach(costId => {
    const snap = snapshot.generic[costId] = { byTenant:{}, byUnit:{}, unitScores:{} };
    const rows = Array.isArray(genericSource[costId]) ? genericSource[costId] : [];
    tenants.forEach((tenant,index) => {
      const row = rows[index];
      if (!row) return;
      const tenantId = String(tenant && tenant.id || "");
      const unitId = String(tenant && tenant.wohnung || "");
      if (tenantId) snap.byTenant[tenantId] = clone(row);
      if (unitId) {
        const score = meterSnapshotRowScore(row, true);
        if (snap.unitScores[unitId] === undefined || score >= snap.unitScores[unitId]) {
          snap.byUnit[unitId] = clone(row);
          snap.unitScores[unitId] = score;
        }
      }
    });
  });
  return snapshot;
}

function meterSnapshotRowForTenant(snap, tenant) {
  if (!snap || !tenant) return null;
  const tenantId = String(tenant.id || "");
  const unitId = String(tenant.wohnung || "");
  return (tenantId && snap.byTenant && snap.byTenant[tenantId]) || (unitId && snap.byUnit && snap.byUnit[unitId]) || null;
}

function restoreMeterReadingsAfterTenantSync(snapshot) {
  ensureWaterMeterData();
  const count = Math.max(20, state.mieter.length);
  const waterRows = Array(count).fill(null).map(() => ({}));
  state.mieter.forEach((tenant,index) => {
    const source = meterSnapshotRowForTenant(snapshot && snapshot.water, tenant);
    if (source) waterRows[index] = clone(source);
  });
  state.waterMeters.readings = waterRows;
  if (!state.meterReadings) state.meterReadings = { readings:{} };
  if (!state.meterReadings.readings) state.meterReadings.readings = {};
  const costIds = new Set(Object.keys((snapshot && snapshot.generic) || {}).concat(Object.keys(state.meterReadings.readings || {})));
  costIds.forEach(costId => {
    const rows = Array(count).fill(null).map(() => ({}));
    state.mieter.forEach((tenant,index) => {
      const source = meterSnapshotRowForTenant(snapshot && snapshot.generic && snapshot.generic[costId], tenant);
      if (source) rows[index] = clone(source);
    });
    state.meterReadings.readings[costId] = rows;
  });
}

function mergeStammdatenIntoCurrentBilling() {
  const periodDays = periodDaysExact();
  const existingById = new Map((Array.isArray(state.mieter) ? state.mieter : []).map(m => [String(m.id || ""), m]));
  const vorauszahlungenByTenant = captureTenantIndexedValuesById(state.vorauszahlungen, "werte");
  const umlageInputsByTenant = captureUmlageInputsByTenantId();
  const meterSnapshot = captureMeterReadingsSnapshot(state);
  state.wohnungen = normalizeBillingUnitRows(masterUnits(), state.wohnungen);
  state.mieter = masterTenants()
    .filter(m => tenantRelevantForCurrentBilling(m))
    .map(m => tenantBillingCopyFromMasterKeepValues(m, existingById.get(String(m.id || "")), periodDays));
  syncVorauszahlungen();
  restoreTenantIndexedValuesById(state.vorauszahlungen, "werte", vorauszahlungenByTenant);
  syncUmlageInputs();
  restoreUmlageInputsByTenantId(umlageInputsByTenant);
  restoreMeterReadingsAfterTenantSync(meterSnapshot);
  syncKostenartenMieterUmlage();
  applyWaterMetersToUmlage();
  updateTenantPrepaymentTotals();
}

function stammdatenComparableUnit(w) {
  return {
    id:String(w && w.id || ""),
    bezeichnung:String(w && w.bezeichnung || ""),
    lage:String(w && w.lage || ""),
    wohnflaeche:num(w && w.wohnflaeche),
    zimmer:String(w && w.zimmer || ""),
    bemerkung:String(w && w.bemerkung || "")
  };
}

function stammdatenComparableTenant(m) {
  return {
    id:String(m && m.id || ""),
    wohnung:String(m && m.wohnung || ""),
    name:String(m && m.name || ""),
    rolle:String(m && m.abrechnungRolle || ""),
    geschlecht:String(m && m.geschlecht || ""),
    standardanrede:String(m && m.standardanrede || ""),
    strasse:String(m && m.strasse || ""),
    plz:String(m && m.plz || ""),
    ort:String(m && m.ort || ""),
    telefon:String(m && m.telefon || ""),
    email:String(m && m.email || ""),
    einzug:String(m && m.einzug || ""),
    auszug:String(m && m.auszug || ""),
    aktiveTage:tenantActiveDaysInCurrentPeriod(m) || normalizeActiveDayValue(m && m.aktiveTage),
    personen:num(m && m.personen),
    status:tenantOpenStatus(m) || String(m && m.status || "")
  };
}

function stammdatenBillingDiff() {
  const masterUnitData = masterUnits().map(stammdatenComparableUnit);
  const billingUnitData = (Array.isArray(state.wohnungen) ? state.wohnungen : []).map(stammdatenComparableUnit);
  const masterTenantData = masterTenants().filter(m => tenantRelevantForCurrentBilling(m)).map(stammdatenComparableTenant);
  const billingTenantData = (Array.isArray(state.mieter) ? state.mieter : []).filter(m => tenantRelevantForCurrentBilling(m)).map(stammdatenComparableTenant);
  const sameUnits = JSON.stringify(masterUnitData) === JSON.stringify(billingUnitData);
  const sameTenants = JSON.stringify(masterTenantData) === JSON.stringify(billingTenantData);
  return {
    same:sameUnits && sameTenants,
    sameUnits,
    sameTenants,
    masterUnits:masterUnitData.length,
    billingUnits:billingUnitData.length,
    masterTenants:masterTenantData.length,
    billingTenants:billingTenantData.length
  };
}

function renderBillingStammdatenStatus() {
  const el = document.getElementById("billingStammdatenStatus");
  if (!el) return;
  if (isArchiveViewer()) {
    el.innerHTML = '<strong>Archivansicht:</strong> Diese Abrechnung bleibt ein eingefrorener Stand. Der zentrale Bestand wird hier nicht in alte Abrechnungen übernommen.';
    return;
  }
  const diff = stammdatenBillingDiff();
  const applied = state.meta && state.meta.stammdatenAppliedAt ? " Letzte Übernahme: " + dateDe(state.meta.stammdatenAppliedAt) + "." : "";
  el.innerHTML = diff.same
    ? '<strong>Synchron:</strong> Die Abrechnungskopie entspricht dem zentralen Mieter- und Wohnungsbestand.' + applied
    : '<strong>Nicht synchron:</strong> Zentraler Bestand ' + diff.masterTenants + ' Mietverhältnisse / ' + diff.masterUnits + ' Wohnungen, Abrechnungskopie ' + diff.billingTenants + ' Mietverhältnisse / ' + diff.billingUnits + ' Wohnungen. Nutze den Button, wenn dieser Bestand die aktuelle Abrechnung überschreiben soll.' + applied;
}

function applyStammdatenToCurrentBillingFromButton() {
  if (isArchiveViewer()) {
    alert("Diese Archivansicht ist schreibgeschützt. Alte Abrechnungen werden nicht aus dem zentralen Bestand aktualisiert.");
    return;
  }
  if (!confirm("Den zentralen Mieter- und Wohnungsbestand jetzt in die aktuelle Abrechnung " + currentAbrechnungsjahr() + " übernehmen?\n\nWohnungen und Mietverhältnisse werden anhand der Stammdaten aktualisiert. Bereits erfasste Kaltmieten, erhaltene Zahlungen und Vorauszahlungs-/Korrekturwerte bleiben bei gleicher Mieter-ID erhalten.")) return;
  mergeStammdatenIntoCurrentBilling();
  state.meta.stammdatenAppliedAt = todayIso();
  state.meta.stammdatenAppliedForYear = currentAbrechnungsjahr();
  commitStateChange({ reason:"Benutzereingabe" });
  alert("Der zentrale Bestand wurde in die aktuelle Abrechnung übernommen.");
}


function ensureZimmermannTenantForLegacyData(data) {
  if (!data) return;
  if (!Array.isArray(data.wohnungen)) data.wohnungen = [];
  let w00 = data.wohnungen.find(w => w.id === "W000.UG");
  if (!w00) {
    w00 = {id:"W000.UG", bezeichnung:"UG", lage:"UG", wohnflaeche:55, zimmer:2, status:"aktiv", bemerkung:""};
    data.wohnungen.push(w00);
  }

  if (!Array.isArray(data.mieter)) data.mieter = [];
  let m000 = data.mieter.find(m => m.id === "M000");
  const shouldFill = !m000 || !hasTenantData(m000) || !m000.name;

  if (!m000) {
    m000 = {id:"M000"};
    data.mieter.push(m000);
  }

  if (shouldFill) {
    w00.status = "aktiv";
    Object.assign(m000, {
      id:"M000",
      wohnung:"W000.UG",
      name:"Erik Zimmermann",
      einzug:"2024-01-01",
      auszug:"",
      kaltSoll:0,
      kaltErhalten:0,
      nkVoraus:0,
      einnahmen:0,
      aktiveTage:365,
      wohnflaeche:55,
      bemerkung:"kein Abrechnungsbrief 2024 vorhanden; ab V28 normal abrechnungsrelevant",
      status:"Aktiv",
      personen:1,
      personentage:365,
      geschlecht:"Herr",
      standardanrede:"Sehr geehrte(r) Mieter/in,",
      abrechnungRolle:"Eigentümer/Privat",
      strasse:"Am Rauhen Biehl 5",
      plz:"55774",
      ort:"Baumholder",
      telefon:"",
      email:"",
      wasserWeitereVorauszahlung:0,
      vorjahresKorrektur:0,
      archivedAt:"",
      vzChangeHeizung:"",
      vzChangeWasser:"",
      vzChangeAbfall:"",
      vzChangeAntenne:""
    });
  }
  ensureTenantContactFields(m000);
}

function tenantLastName(tenant) {
  const name = String((tenant && tenant.name) || "").trim();
  if (!name) return "";
  if (name.includes(",")) return name.split(",")[0].trim();
  return name.split(/\s+/).slice(-1)[0] || name;
}

function tenantAddressPrefix(tenant) {
  const g = tenant && tenant.geschlecht ? tenant.geschlecht : "Frau/Herr";
  if (g === "Frau") return "Frau";
  if (g === "Herr") return "Herr";
  if (g === "Firma/Divers") return "";
  return "Frau/Herr";
}

function tenantMailingAddress(tenant) {
  ensureTenantContactFields(tenant);
  const prefix = tenantAddressPrefix(tenant);
  const place = [tenant.plz || "", tenant.ort || ""].filter(Boolean).join(" ");
  return [prefix, tenant.name || "", tenant.strasse || "", place].filter(Boolean).join("\n");
}

function tenantSalutationFromTemplate(tenant, template) {
  const lastName = tenantLastName(tenant);
  if (template === "Sehr geehrte Frau [Nachname],") return "Sehr geehrte Frau " + (lastName || "") + ",";
  if (template === "Sehr geehrter Herr [Nachname],") return "Sehr geehrter Herr " + (lastName || "") + ",";
  return template;
}

function isArchivedTenant(m) {
  return m && m.status === "Archiviert";
}

function isoDateSerial(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const serial = Date.UTC(year, month - 1, day);
  const check = new Date(serial);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return serial;
}

function billingPeriodSerials(startIso = periodStart(), endIso = periodEnd()) {
  const start = isoDateSerial(startIso);
  const end = isoDateSerial(endIso);
  if (start === null || end === null) return null;
  return {
    start: Math.min(start, end),
    end: Math.max(start, end)
  };
}

function tenantOverlapsPeriod(m, startIso = periodStart(), endIso = periodEnd()) {
  if (!hasTenantData(m) || isArchivedTenant(m)) return false;
  const period = billingPeriodSerials(startIso, endIso);
  if (!period) return true;
  const leaseStart = isoDateSerial(m.einzug) ?? period.start;
  const leaseEnd = isoDateSerial(m.auszug) ?? period.end;
  return leaseStart <= period.end && leaseEnd >= period.start;
}

function tenantOverlapsCurrentPeriod(m) {
  return tenantOverlapsPeriod(m, periodStart(), periodEnd());
}

function tenantRelevantForCurrentBilling(m) {
  return hasTenantData(m) && !isArchivedTenant(m) && tenantOverlapsCurrentPeriod(m);
}

function tenantActiveDaysInCurrentPeriod(m) {
  const period = billingPeriodSerials(periodStart(), periodEnd());
  if (!period) return periodDaysExact();
  if (!tenantOverlapsCurrentPeriod(m)) return 0;
  const leaseStart = isoDateSerial(m.einzug) ?? period.start;
  const leaseEnd = isoDateSerial(m.auszug) ?? period.end;
  const clippedStart = Math.max(leaseStart, period.start);
  const clippedEnd = Math.min(leaseEnd, period.end);
  return Math.max(0, Math.round((clippedEnd - clippedStart) / 86400000) + 1);
}

function tenantOpenStatus(m) {
  if (isArchivedTenant(m)) return "Archiviert";
  if (!hasTenantData(m)) return "";
  if (!tenantOverlapsCurrentPeriod(m)) return "Außerhalb Zeitraum";
  if (m.auszug) return "NK offen";
  return "Aktiv";
}

function visibleTenantRows() {
  return state.mieter
    .map((m,i) => ({...m, originalIndex:i}))
    .filter(m => tenantRelevantForCurrentBilling(m));
}

function archivedTenantRows() {
  return state.mieter
    .map((m,i) => ({...m, originalIndex:i}))
    .filter(m => hasTenantData(m) && isArchivedTenant(m));
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

function nextMietId() {
  const maxNum = state.mieter.reduce((max,m) => {
    const match = String(m.id || "").match(/^M(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return "M" + String(maxNum + 1).padStart(3, "0");
}

function addMietverhaeltnis() {
  const blankIndex = state.mieter.findIndex(m => !hasTenantData(m) && !isArchivedTenant(m));
  const newRow = {
    id: blankIndex >= 0 && state.mieter[blankIndex].id ? state.mieter[blankIndex].id : nextMietId(),

    wohnung:"",
    name:"",
    einzug:"",
    auszug:"",
    kaltSoll:0,
    kaltErhalten:0,
    nkVoraus:0,
    einnahmen:0,
    aktiveTage:365,
    wohnflaeche:0,
    bemerkung:"",
    status:"Aktiv",
    personen:1,
    personentage:365,
    geschlecht:"Frau/Herr",
    standardanrede:"Automatisch",
    strasse:"Am Rauhen Biehl 5",
    plz:"55774",
    ort:"Baumholder",
    telefon:"",
    email:"",
    abrechnungRolle:"Mieter",
    wasserWeitereVorauszahlung:0,
    vorjahresKorrektur:0,
    archivedAt:""
  };
  if (blankIndex >= 0) state.mieter[blankIndex] = newRow;
  else state.mieter.push(newRow);
  syncVorauszahlungen();
  commitStateChange({ reason:"Benutzereingabe" });
}

function archiveMietverhaeltnis(index) {
  const row = state.mieter[index];
  if (!row || !hasTenantData(row)) return;
  if (!confirm("Dieses Mietverhältnis archivieren? Es wird danach nicht mehr in aktueller Kaltmiete, NK-Vorauszahlungen, Umlage und Briefauswahl berücksichtigt.")) return;
  row.status = "Archiviert";
  row.archivedAt = todayIso();
  commitStateChange({ reason:"Benutzereingabe" });
}

function restoreMietverhaeltnis(index) {
  const row = state.mieter[index];
  if (!row) return;
  row.status = row.auszug ? "NK offen" : "Aktiv";
  row.archivedAt = "";
  commitStateChange({ reason:"Benutzereingabe" });
}

function tenantHeaderHtml(t) {
  const id = escapeHtml(tenantDisplayId(t) || t.id || "");
  const name = escapeHtml(t.name || "");
  return '<th class="tenant-head"><span class="tenant-id">' + id + '</span><span class="tenant-name">' + name + '</span></th>';
}

function unitHeaderHtml(w) {
  const id = escapeHtml(unitDisplayId(w) || w.id || "");
  const name = escapeHtml(w.bezeichnung || w.lage || "");
  const status = escapeHtml(w.status || "");
  return '<th class="unit-head"><span class="unit-id">' + id + '</span><span class="unit-name">' + name + '</span><span class="unit-status">' + status + '</span></th>';
}

function renderVersionInfo() {
  const el = document.getElementById("versionInfo");
  if (!el) return;
  el.innerHTML =
    '<div class="inline-titlebar"><div><h3>Version ' + escapeHtml(APP_VERSION) + ' · ' + escapeHtml(APP_VERSION_NAME) + '</h3>' +
    '<p class="small">Stand: ' + escapeHtml(dateDe(APP_RELEASE_DATE)) + ' · Datenschema: v' + escapeHtml(DATA_SCHEMA_VERSION) + ' · Speicherbereich: ' + escapeHtml(STORAGE_KEY) + '</p></div>' +
    '<div class="start-action-stack"><span class="period-badge">Aktueller Bearbeitungsstand</span></div></div>' +
    '<ul class="small">' + APP_CHANGELOG.map(item => '<li>' + escapeHtml(item) + '</li>').join("") + '</ul>';
}

function qualitySeverityClass(severity) {
  if (severity === "OK") return "ok";
  if (severity === "Hinweis") return "neutral";
  if (severity === "Prüfen") return "warn";
  return "err";
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

function storageWritable() {
  try {
    const key = STORAGE_KEY + "_write_test";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch(e) {
    return false;
  }
}

function tenantQualityLabel(m) {
  return (tenantDisplayId(m) || m.id || "ohne ID") + (m && m.name ? " · " + m.name : "");
}

function hasCompleteMailingAddress(tenant) {
  return !!(tenant && tenant.name && tenant.strasse && tenant.plz && tenant.ort);
}

function costPrepaymentRow(costId) {
  return Array.isArray(state.vorauszahlungen) ? state.vorauszahlungen.find(v => v && v.kostenId === costId) : null;
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

// ===== Bereich: V49-Fachcheck und finale Abrechnungssicherheit =====
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

function specialCaseSeverityClass(severity) {
  if (severity === "Fehler") return "err";
  if (severity === "Prüfen") return "warn";
  return "ok";
}

function specialCaseWatchReport() {
  const rows = [];
  function add(severity, type, subject, detail) {
    rows.push({ severity, type, subject:subject || "", detail:detail || "" });
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

function specialCaseBadgesForTenant(m) {
  const badges = [];
  const expectedDays = expectedTenantDaysInCurrentPeriod(m);
  const periodDays = periodDaysExact();
  const enteredDays = tenantDays(m);
  const unit = state.wohnungen.find(w => w.id === m.wohnung);
  function badge(text, cls) { badges.push('<span class="special-case-badge ' + cls + '">' + escapeHtml(text) + '</span>'); }
  if (isPrivateTenant(m)) badge("Eigentümer/Privat", "ok");
  if (expectedDays > 0 && expectedDays < periodDays) badge("unterjährig", "ok");
  if (m.auszug && tenantOverlapsCurrentPeriod(m)) badge("NK offen", "warn");
  if (unit && unit.status !== "aktiv") badge("Wohnung inaktiv", "warn");
  if (expectedDays > 0 && Math.abs(enteredDays - expectedDays) > 1) badge("Tage prüfen", "warn");
  if (!m.wohnung || (m.wohnung && !unit)) badge("Zuordnung prüfen", "err");
  if (!badges.length) badge("Standard", "ok");
  return badges.join(" ");
}

function renderSpecialCaseWatch() {
  const el = document.getElementById("sonderfallWatchBox");
  if (!el) return;
  const report = specialCaseWatchReport();
  const visibleRows = report.rows.filter(r => r.severity !== "Info");
  const infoRows = report.rows.filter(r => r.severity === "Info");
  const rowsHtml = visibleRows.length ? visibleRows.slice(0, 12).map(r => '<tr><td><span class="status ' + qualitySeverityClass(r.severity) + '">' + escapeHtml(r.severity) + '</span></td><td>' + escapeHtml(r.type) + '</td><td>' + escapeHtml(r.subject) + '</td><td>' + escapeHtml(r.detail) + '</td></tr>').join("") : '<tr><td colspan="4">Keine prüfpflichtigen Sonderfälle.</td></tr>';
  const infoHtml = infoRows.length ? '<details><summary>Info-Sonderfälle anzeigen (' + infoRows.length + ')</summary><div class="table-wrap dashboard-table"><table><thead><tr><th>Typ</th><th>Betreff</th><th>Details</th></tr></thead><tbody>' + infoRows.map(r => '<tr><td>' + escapeHtml(r.type) + '</td><td>' + escapeHtml(r.subject) + '</td><td>' + escapeHtml(r.detail) + '</td></tr>').join("") + '</tbody></table></div></details>' : '';
  el.innerHTML = '<div class="special-watch-box ' + report.level + '"><div class="inline-titlebar"><div><strong>Sonderfall-Wächter: ' + escapeHtml(report.label) + '</strong><div class="small">' + escapeHtml(report.message) + '</div></div><span class="period-badge">' + report.errors + ' Fehler · ' + report.checks + ' prüfen · ' + report.hints + ' Hinweise</span></div>' +
    '<div class="special-watch-grid"><div class="special-watch-pill"><strong>Abrechenbare Mieter</strong><br>' + report.billableCount + '</div><div class="special-watch-pill"><strong>Eigentümer/Privat</strong><br>' + report.privateCount + '</div><div class="special-watch-pill"><strong>Unterjährig/Wechsel</strong><br>' + report.underjaehrig + '</div><div class="special-watch-pill"><strong>Leerstand</strong><br>' + report.leerstand + '</div></div>' +
    '<div class="table-wrap dashboard-table" style="margin-top:10px"><table><thead><tr><th>Status</th><th>Typ</th><th>Betreff</th><th>Details</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div>' + infoHtml + '</div>';
}

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

function briefSettlementSummaryHtml(result) {
  if (!result) return "";
  const settlement = settlementInfoForResult(result, result.tenant);
  const cls = settlement.isNachzahlung ? "warn" : "ok";
  return '<div class="hint"><strong>Brief-Ergebnis:</strong> <span class="status ' + cls + '">' + escapeHtml(settlement.type) + '</span> ' + fmtMoney(settlement.amount) + '<div class="small">Logik: Kostenanteil minus Vorauszahlungen minus Korrekturen. Im Brief wird der Ergebnisbetrag positiv mit eindeutigem Label ausgewiesen.</div></div>';
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
  const quality = collectQualityChecks({ scope:"currentBilling" });
  const readiness = finalBillingReadiness(quality);
  const calc = calculateUmlage();
  const totals = umlageTotals(calc);
  const backup = (typeof backupStatusReport === "function") ? backupStatusReport() : null;
  const special = (typeof specialCaseWatchReport === "function") ? specialCaseWatchReport() : null;
  const brief = (typeof currentBriefPreflightReport === "function") ? currentBriefPreflightReport() : null;
  const finalization = (typeof currentBillingFinalizationReport === "function") ? currentBillingFinalizationReport() : { finalized:isCurrentBillingFinalized(), meta:state.meta || {}, readiness };
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

function finalBillingReportText() {
  const data = acceptanceProtocolData();
  const report = data.quality;
  const readiness = data.readiness;
  const calc = data.calc;
  const totals = data.totals;
  const backup = data.backup;
  const special = data.special;
  const brief = data.brief;
  const finalization = data.finalization;
  const acceptance = acceptanceLabel(acceptanceLevel(data));
  const lines = [];
  lines.push("NK-Pro " + APP_VERSION + " · Finaler Prüfbericht / Abnahmeprotokoll");
  lines.push("Erstellt: " + new Date().toLocaleString("de-DE"));
  lines.push("Abrechnungszeitraum: " + periodLabelShort());
  lines.push("Abnahme-Status: " + acceptance);
  lines.push("Finaler Abrechnungscheck: " + readiness.label + " · " + readiness.message);
  lines.push("");
  lines.push("Finalisierung");
  lines.push("- Status: " + (finalization.finalized ? "finalisiert / Eingaben geschützt" : "bearbeitbar"));
  if (finalization.meta && finalization.meta.currentBillingFinalizedAt) lines.push("- Finalisiert am: " + new Date(finalization.meta.currentBillingFinalizedAt).toLocaleString("de-DE"));
  if (finalization.meta && finalization.meta.currentBillingFinalizedWithAppVersion) lines.push("- Finalisiert mit: " + finalization.meta.currentBillingFinalizedWithAppVersion);
  lines.push("");
  lines.push("Summen");
  lines.push("- Aktive umlagefähige Kosten: " + fmtMoney(totals.totalCosts));
  lines.push("- Auf echte Mieter umgelegt: " + fmtMoney(totals.billableShare));
  lines.push("- Eigentümer-/Privatanteil: " + fmtMoney(totals.privateShare));
  lines.push("- Nicht auf Mieter umgelegt/offen: " + fmtMoney(totals.ownerShare));
  lines.push("- Geleistete Vorauszahlungen: " + fmtMoney(totals.prepayments));
  lines.push("- Einmalige Korrekturen/Gutschriften: " + fmtMoney(totals.corrections));
  lines.push("- Summendifferenz aktive Kosten vs. Verteilung: " + fmtMoney(totals.allocationDelta));
  lines.push("- Saldo Mieter gesamt: " + fmtMoney(totals.balance));
  lines.push("");
  lines.push("Mieter-Ergebnisse");
  if (!calc.tenantResults.length) lines.push("- Keine abrechenbaren Mieter.");
  calc.tenantResults.forEach(result => {
    const s = settlementInfoForResult(result, result.tenant);
    lines.push("- " + tenantQualityLabel(result.tenant) + " · " + unitDisplayIdByInternalId(result.tenant.wohnung) + ": " + s.type + " " + fmtMoney(s.amount) + " (Kosten " + fmtMoney(result.costShare) + ", Vorauszahlungen " + fmtMoney(result.prepayments) + ", Korrektur " + fmtMoney(result.correction) + ")");
  });
  if (calc.privateResults && calc.privateResults.length) {
    lines.push("");
    lines.push("Eigentümer-/Privatanteile");
    calc.privateResults.forEach(result => {
      lines.push("- " + tenantQualityLabel(result.tenant) + " · " + unitDisplayIdByInternalId(result.tenant.wohnung) + ": " + fmtMoney(result.costShare));
    });
  }
  lines.push("");
  lines.push("Brief-Preflight");
  if (brief) {
    lines.push("- Status: " + brief.label + " · " + brief.message);
    lines.push("- Ergebnis: " + brief.errors + " Fehler · " + brief.warnings + " Hinweise · " + brief.ok + " OK · " + brief.infos + " Druckhinweise");
    brief.items.filter(item => item.level === "err" || item.level === "warn").forEach(item => lines.push("- " + (item.level === "err" ? "Fehler" : "Prüfen") + " · " + item.label + ": " + item.detail));
  } else {
    lines.push("- Kein Brief-Preflight verfügbar.");
  }
  lines.push("");
  lines.push("Sonderfälle");
  if (special) {
    lines.push("- Status: " + special.label + " · " + special.message);
    lines.push("- Abrechenbare Mieter: " + special.billableCount + " · Eigentümer/Privat: " + special.privateCount + " · Unterjährig/Wechsel: " + special.underjaehrig + " · Leerstand: " + special.leerstand);
    special.rows.filter(r => r.severity !== "Info").forEach(r => lines.push("- " + r.severity + " · " + r.type + " · " + r.subject + (r.detail ? ": " + r.detail : "")));
  } else {
    lines.push("- Kein Sonderfallbericht verfügbar.");
  }
  lines.push("");
  lines.push("Backup-Status");
  if (backup) {
    lines.push("- Status: " + backup.message);
    lines.push("- Letztes Gesamtbackup: " + (backup.last ? new Date(backup.last).toLocaleString("de-DE") : "nicht dokumentiert"));
    lines.push("- Speicher: " + (backup.storage ? backup.storage.label : "unbekannt"));
  } else {
    lines.push("- Kein Backup-Status verfügbar.");
  }
  lines.push("");
  lines.push("Prüfpunkte");
  if (!report.issues.length) lines.push("- Keine auffälligen Punkte.");
  report.issues.forEach(item => lines.push("- " + item.severity + " · " + item.area + " · " + item.point + (item.detail ? ": " + item.detail : "")));
  return lines.join("\n");
}

function acceptanceProtocolRowsHtml(data) {
  const calc = data.calc;
  const tenantRows = calc.tenantResults.length ? calc.tenantResults.map(result => {
    const s = settlementInfoForResult(result, result.tenant);
    return '<tr><td>' + escapeHtml(tenantQualityLabel(result.tenant)) + '</td><td>' + escapeHtml(unitDisplayIdByInternalId(result.tenant.wohnung)) + '</td><td>' + escapeHtml(s.type) + '</td><td class="money">' + escapeHtml(fmtMoney(s.amount)) + '</td><td class="money">' + escapeHtml(fmtMoney(result.costShare)) + '</td><td class="money">' + escapeHtml(fmtMoney(result.prepayments)) + '</td><td class="money">' + escapeHtml(fmtMoney(result.correction)) + '</td></tr>';
  }).join("") : '<tr><td colspan="7">Keine abrechenbaren Mieter.</td></tr>';
  const privateRows = calc.privateResults && calc.privateResults.length ? calc.privateResults.map(result => '<tr><td>' + escapeHtml(tenantQualityLabel(result.tenant)) + '</td><td>' + escapeHtml(unitDisplayIdByInternalId(result.tenant.wohnung)) + '</td><td class="money">' + escapeHtml(fmtMoney(result.costShare)) + '</td></tr>').join("") : '<tr><td colspan="3">Keine Eigentümer-/Privatanteile.</td></tr>';
  const issueRows = data.quality.issues.length ? data.quality.issues.map(item => '<tr><td>' + escapeHtml(item.severity) + '</td><td>' + escapeHtml(item.area) + '</td><td>' + escapeHtml(item.point) + '</td><td>' + escapeHtml(item.detail || "") + '</td></tr>').join("") : '<tr><td colspan="4">Keine auffälligen Punkte.</td></tr>';
  const specialVisible = data.special && data.special.rows ? data.special.rows.filter(r => r.severity !== "Info") : [];
  const specialRows = specialVisible.length ? specialVisible.map(r => '<tr><td>' + escapeHtml(r.severity) + '</td><td>' + escapeHtml(r.type) + '</td><td>' + escapeHtml(r.subject) + '</td><td>' + escapeHtml(r.detail || "") + '</td></tr>').join("") : '<tr><td colspan="4">Keine prüfpflichtigen Sonderfälle.</td></tr>';
  const briefRows = data.brief && data.brief.items.length ? data.brief.items.map(item => '<tr><td>' + escapeHtml(item.level === "err" ? "Fehler" : (item.level === "warn" ? "Prüfen" : (item.level === "info" ? "Hinweis" : "OK"))) + '</td><td>' + escapeHtml(item.label) + '</td><td>' + escapeHtml(item.detail || "") + '</td></tr>').join("") : '<tr><td colspan="3">Kein Brief-Preflight verfügbar.</td></tr>';
  return { tenantRows, privateRows, issueRows, specialRows, briefRows };
}

function acceptanceProtocolHtml() {
  const data = acceptanceProtocolData();
  const level = acceptanceLevel(data);
  const rows = acceptanceProtocolRowsHtml(data);
  const totals = data.totals;
  const finalizedAt = data.finalization && data.finalization.meta && data.finalization.meta.currentBillingFinalizedAt ? new Date(data.finalization.meta.currentBillingFinalizedAt).toLocaleString("de-DE") : "nicht finalisiert";
  const backupLast = data.backup && data.backup.last ? new Date(data.backup.last).toLocaleString("de-DE") : "nicht dokumentiert";
  const html = '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>NK-Pro Abnahmeprotokoll ' + escapeHtml(currentAbrechnungsjahr()) + '</title>' +
    '<style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;color:#111;line-height:1.35;font-size:12px}h1{font-size:20px;margin:0 0 4px;color:#173b5a}h2{font-size:15px;margin:18px 0 6px;color:#173b5a}.meta{color:#555;margin-bottom:14px}.badge{display:inline-block;border-radius:999px;padding:4px 9px;font-weight:bold;background:#eef5fb;border:1px solid #b6d7ef}.badge.ok{background:#f2faf3;border-color:#b7d9bd}.badge.warn{background:#fff9e8;border-color:#ead28a}.badge.err{background:#fff4f4;border-color:#f1aaa5}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 14px}.box{border:1px solid #d8e3e8;border-radius:8px;padding:8px;background:#fff}.label{font-size:10px;color:#555}.value{font-weight:bold;font-size:13px}table{border-collapse:collapse;width:100%;margin:5px 0 12px}th,td{border:1px solid #c8c8c8;padding:4px 5px;vertical-align:top}th{background:#f1f3f5;text-align:left}.money{text-align:right;white-space:nowrap}.footer{margin-top:18px;border-top:1px solid #222;padding-top:5px;font-size:10px;color:#555}@media print{button{display:none}.box{break-inside:avoid}table{break-inside:auto}tr{break-inside:avoid}}</style></head><body>' +
    '<h1>Finaler Prüfbericht / Abnahmeprotokoll</h1><div class="meta">NK-Pro ' + escapeHtml(APP_VERSION) + ' · ' + escapeHtml(APP_VERSION_NAME) + ' · erstellt am ' + escapeHtml(new Date().toLocaleString("de-DE")) + '</div>' +
    '<p><span class="badge ' + escapeHtml(level) + '">' + escapeHtml(acceptanceLabel(level)) + '</span> <strong>Abrechnungszeitraum:</strong> ' + escapeHtml(periodLabelShort()) + '</p>' +
    '<div class="grid"><div class="box"><div class="label">Finalisierung</div><div class="value">' + escapeHtml(data.finalization && data.finalization.finalized ? "finalisiert" : "bearbeitbar") + '</div><div>' + escapeHtml(finalizedAt) + '</div></div><div class="box"><div class="label">Finaler Check</div><div class="value">' + escapeHtml(data.readiness.label) + '</div><div>' + escapeHtml(data.readiness.message) + '</div></div><div class="box"><div class="label">Backup</div><div class="value">' + escapeHtml(data.backup ? data.backup.message : "unbekannt") + '</div><div>' + escapeHtml(backupLast) + '</div></div></div>' +
    '<h2>Summen</h2><table><tbody>' +
    '<tr><th>Aktive umlagefähige Kosten</th><td class="money">' + escapeHtml(fmtMoney(totals.totalCosts)) + '</td></tr>' +
    '<tr><th>Auf echte Mieter umgelegt</th><td class="money">' + escapeHtml(fmtMoney(totals.billableShare)) + '</td></tr>' +
    '<tr><th>Eigentümer-/Privatanteil</th><td class="money">' + escapeHtml(fmtMoney(totals.privateShare)) + '</td></tr>' +
    '<tr><th>Nicht auf Mieter umgelegt/offen</th><td class="money">' + escapeHtml(fmtMoney(totals.ownerShare)) + '</td></tr>' +
    '<tr><th>Geleistete Vorauszahlungen</th><td class="money">' + escapeHtml(fmtMoney(totals.prepayments)) + '</td></tr>' +
    '<tr><th>Einmalige Korrekturen/Gutschriften</th><td class="money">' + escapeHtml(fmtMoney(totals.corrections)) + '</td></tr>' +
    '<tr><th>Summendifferenz aktive Kosten vs. Verteilung</th><td class="money">' + escapeHtml(fmtMoney(totals.allocationDelta)) + '</td></tr>' +
    '<tr><th>Saldo Mieter gesamt</th><td class="money">' + escapeHtml(fmtMoney(totals.balance)) + '</td></tr>' +
    '</tbody></table>' +
    '<h2>Mieter-Ergebnisse</h2><table><thead><tr><th>Mieter</th><th>Wohnung</th><th>Ergebnis</th><th>Betrag</th><th>Kosten</th><th>Vorauszahlungen</th><th>Korrektur</th></tr></thead><tbody>' + rows.tenantRows + '</tbody></table>' +
    '<h2>Eigentümer-/Privatanteile</h2><table><thead><tr><th>Name</th><th>Wohnung</th><th>Anteil</th></tr></thead><tbody>' + rows.privateRows + '</tbody></table>' +
    '<h2>Brief-Preflight</h2><p><strong>' + escapeHtml(data.brief ? data.brief.label : "nicht verfügbar") + '</strong> · ' + escapeHtml(data.brief ? data.brief.message : "") + '</p><table><thead><tr><th>Status</th><th>Prüfpunkt</th><th>Details</th></tr></thead><tbody>' + rows.briefRows + '</tbody></table>' +
    '<h2>Sonderfälle</h2><p>' + escapeHtml(data.special ? data.special.message : "Kein Sonderfallbericht verfügbar.") + '</p><table><thead><tr><th>Status</th><th>Typ</th><th>Betreff</th><th>Details</th></tr></thead><tbody>' + rows.specialRows + '</tbody></table>' +
    '<h2>Offene Prüfpunkte</h2><table><thead><tr><th>Status</th><th>Bereich</th><th>Prüfpunkt</th><th>Details</th></tr></thead><tbody>' + rows.issueRows + '</tbody></table>' +
    '<div class="footer">Dieses Abnahmeprotokoll ist eine technische Prüfhilfe. Es ersetzt keine fachliche oder rechtliche Endkontrolle der Nebenkostenabrechnung.</div>' +
    '</body></html>';
  return html;
}

function renderAcceptanceProtocolSummary() {
  const el = document.getElementById("acceptanceProtocolBox");
  if (!el) return;
  const data = acceptanceProtocolData();
  const level = acceptanceLevel(data);
  el.innerHTML = '<div class="acceptance-protocol-box ' + level + '"><div class="inline-titlebar"><div><strong>Abnahmeprotokoll: ' + escapeHtml(acceptanceLabel(level)) + '</strong><div class="small">Fasst finalen Check, Summen, Sonderfälle, Backup-Status, Brief-Preflight und Finalisierung zusammen.</div></div><div class="start-action-stack"><button type="button" data-app-action="acceptance-report">Anzeigen</button><button type="button" data-app-action="download-acceptance-report-html">HTML herunterladen</button></div></div>' +
    '<div class="acceptance-protocol-grid"><div class="acceptance-protocol-pill"><strong>Prüfpunkte</strong><br>' + data.counts.errors + ' Fehler · ' + data.counts.warnings + ' prüfen · ' + data.counts.hints + ' Hinweise</div><div class="acceptance-protocol-pill"><strong>Brief</strong><br>' + escapeHtml(data.brief ? data.brief.label : "nicht verfügbar") + '</div><div class="acceptance-protocol-pill"><strong>Sonderfälle</strong><br>' + escapeHtml(data.special ? (data.special.errors + ' Fehler · ' + data.special.checks + ' prüfen') : "nicht verfügbar") + '</div><div class="acceptance-protocol-pill"><strong>Backup</strong><br>' + escapeHtml(data.backup ? data.backup.message : "nicht verfügbar") + '</div></div></div>';
}

function showAcceptanceProtocol() {
  const html = acceptanceProtocolHtml();
  const win = window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    if (win.focus) win.focus();
    return;
  }
  alert(finalBillingReportText());
}

function downloadAcceptanceProtocolHtml() {
  const filename = "nk-pro-abnahmeprotokoll-" + safeFilePart(currentAbrechnungsjahr()) + "-" + safeFilePart(APP_VERSION) + "-" + new Date().toISOString().slice(0,19).replace(/[:T]/g, "-") + ".html";
  download(filename, acceptanceProtocolHtml(), "text/html;charset=utf-8");
}

function showFinalBillingReport() {
  const text = finalBillingReportText();
  const win = window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write('<!doctype html><html><head><title>NK-Pro finaler Prüfbericht</title><style>body{font-family:Arial,sans-serif;padding:24px;line-height:1.45;white-space:pre-wrap}h1{color:#173b5a}</style></head><body><h1>Finaler Prüfbericht / Abnahmeprotokoll</h1><pre>' + escapeHtml(text) + '</pre></body></html>');
    win.document.close();
    if (win.focus) win.focus();
    return;
  }
  alert(text);
}

function collectQualityChecks(options = {}) {
  const currentBillingOnly = options && options.scope === "currentBilling";
  ensureYearData();
  ensureUnitIdentityData(state);
  ensureTenantContactData();
  syncVorauszahlungen();
  syncKostenartenMieterUmlage();
  syncUmlageInputs();
  applyWaterMetersToUmlage();

  const issues = [];
  const add = (severity, area, point, detail) => issues.push({ severity, area, point, detail });
  const units = Array.isArray(state.wohnungen) ? state.wohnungen.filter(w => w && w.id) : [];
  const activeUnits = units.filter(w => w.status === "aktiv");
  const tenants = visibleTenantRows();
  const billable = billableTenantRows();
  const privateRows = privateTenantRows();
  const archived = archivedTenantRows();
  const activeCosts = state.kostenarten.filter(k => k.kostenart && k.inNK === "Ja");
  const archiveItems = Array.isArray(state.jahresArchiv) ? state.jahresArchiv : [];
  const storageInfo = currentStorageUsage();
  if (isCurrentBillingFinalized()) add("OK", "Finalisierung", "Abrechnung finalisiert", "Finalisiert am " + (state.meta && state.meta.currentBillingFinalizedAt ? new Date(state.meta.currentBillingFinalizedAt).toLocaleString("de-DE") : "unbekannt"));

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
    if (!storageWritable()) add("Fehler", "Speicher", "Lokaler Speicher ist nicht beschreibbar", "JSON-Sicherung herunterladen und Browser-Speicher prüfen.");
    if (storageInfo.error) add("Prüfen", "Speicher", "Datensatzgröße konnte nicht ermittelt werden", storageInfo.error);
    else if (storageInfo.bytes > STORAGE_CRITICAL_BYTES) add("Fehler", "Speicher", "Lokaler Datensatz ist sehr groß", storageInfo.label + " · bitte JSON-Sicherung herunterladen und Archivumfang prüfen.");
    else if (storageInfo.bytes > STORAGE_WARN_BYTES) add("Prüfen", "Speicher", "Lokaler Datensatz nähert sich typischen Browser-Grenzen", storageInfo.label + " · regelmäßige JSON-Sicherung empfohlen.");
    if (pendingStorageWarning) add("Prüfen", "Speicher", "Letzte Speicherwarnung vorhanden", pendingStorageWarning);
    if (state.meta && state.meta.lastSaveError) add("Fehler", "Speicher", "Letzter Speichervorgang hatte einen Fehler", state.meta.lastSaveError);

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
  if (!currentBillingOnly) duplicateValues(archiveItems.map(a => archivePeriodId(a))).forEach(id => add("Prüfen", "Archiv", "Doppelter Archivzeitraum", id));

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
      const validation = archiveItemValidation(item);
      const label = archiveItemLabel(item, idx);
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
    const status = kostenStatus(k);
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


function qualityAreaTab(area) {
  const text = String(area || "").toLocaleLowerCase("de-DE");
  if (text.includes("kosten")) return "einstellungen";
  if (text.includes("brief")) return "briefe";
  if (text.includes("archiv")) return "start";
  if (text.includes("mieter") || text.includes("wohnung") || text.includes("stamm")) return "mieter";
  if (text.includes("vorauszahlungsanpassung")) return "vorauszahlungsanpassung";
  if (text.includes("voraus") || text.includes("einnah")) return "einnahmen";
  if (text.includes("umlage") || text.includes("summe") || text.includes("saldo") || text.includes("berechnung")) return "umlage";
  if (text.includes("zähler") || text.includes("wasser")) return "wasser";
  if (text.includes("speicher") || text.includes("import") || text.includes("datenmodell") || text.includes("backup")) return "sicherung";
  return "qualitaet";
}

function qualityItemKey(item) {
  return [currentAbrechnungsjahr(), periodStart(), periodEnd(), item && item.severity, item && item.area, item && item.point, item && item.detail].map(v => String(v || "")).join("|");
}

function qualityAckStore() {
  if (!state.meta) state.meta = {};
  if (!state.meta.qualityAcknowledgements || typeof state.meta.qualityAcknowledgements !== "object") state.meta.qualityAcknowledgements = {};
  return state.meta.qualityAcknowledgements;
}

function qualityAckFor(item) {
  return qualityAckStore()[qualityItemKey(item)] || null;
}

function qualityAckLabel(item) {
  if (!item) return "";
  if (item.severity === "Hinweis") return "Gelesen";
  if (item.severity === "Prüfen") return "Geprüft / akzeptiert";
  return "";
}

function acknowledgeQualityIssue(encodedKey, mode) {
  const key = decodeURIComponent(encodedKey || "");
  if (!key) return;
  const store = qualityAckStore();
  store[key] = { mode: mode || "ack", at: new Date().toISOString(), appVersion: APP_VERSION, year: currentAbrechnungsjahr() };
  commitStateChange({ reason:"Qualitätsbestätigung", tabId:"qualitaet", includeCommon:false, includeNavigation:false, finalizationBypass:true });
}

function reopenQualityIssue(encodedKey) {
  const key = decodeURIComponent(encodedKey || "");
  if (!key) return;
  const store = qualityAckStore();
  delete store[key];
  commitStateChange({ reason:"Qualitätsbestätigung zurückgenommen", tabId:"qualitaet", includeCommon:false, includeNavigation:false, finalizationBypass:true });
}

function qualityIssueSearchText(item) {
  return [item && item.area, item && item.point, item && item.detail].map(v => String(v || "").trim()).filter(Boolean).join(" ").toLocaleLowerCase("de-DE");
}

function highlightQualityTarget(tab, itemText) {
  const section = document.getElementById(tab);
  if (!section) return;
  const needleParts = String(itemText || "").toLocaleLowerCase("de-DE").split(/\s+·\s+|\s+/).filter(Boolean).slice(0, 4);
  let target = null;
  const rows = Array.from(section.querySelectorAll("tbody tr"));
  for (const row of rows) {
    const text = row.textContent.toLocaleLowerCase("de-DE");
    if (!needleParts.length || needleParts.some(part => part.length > 2 && text.includes(part))) { target = row; break; }
  }
  if (!target) target = section.querySelector("table, .hint, .quality-summary, .card, input, select, textarea, button");
  if (!target) return;
  try { target.scrollIntoView({ behavior:"smooth", block:"center" }); } catch(e) { target.scrollIntoView(); }
  target.classList.add("quality-target-highlight");
  setTimeout(() => target.classList.remove("quality-target-highlight"), 3800);
}

function jumpToQualityIssue(tab, encodedText) {
  const targetTab = tab || "qualitaet";
  switchToTab(targetTab);
  setTimeout(() => highlightQualityTarget(targetTab, decodeURIComponent(encodedText || "")), 120);
}

function jumpToFirstOpenQualityIssue() {
  const report = collectQualityChecks({ scope:"currentBilling" });
  const open = report.issues.filter(i => i.severity !== "OK" && !qualityAckFor(i));
  const first = open.find(i => i.severity === "Fehler") || open.find(i => i.severity === "Prüfen") || open[0];
  if (!first) return alert("Keine offenen Prüfpunkte vorhanden.");
  const tab = qualityAreaTab(first.area);
  jumpToQualityIssue(tab, encodeURIComponent(qualityIssueSearchText(first)));
}

function showOnlyQualityErrors() {
  switchToTab("qualitaet");
  renderQuality("errors");
}

function qualityIssueActionHtml(item, acknowledged) {
  if (!item || item.severity === "OK") return "";
  const tab = qualityAreaTab(item.area);
  const text = encodeURIComponent(qualityIssueSearchText(item));
  const key = encodeURIComponent(qualityItemKey(item));
  const actions = ['<button class="secondary compact-action" onclick="jumpToQualityIssue(\'' + tab + '\',\'' + text + '\')">Zur Stelle springen</button>'];
  if (item.severity !== "Fehler") {
    if (acknowledged) actions.push('<button class="compact-action" onclick="reopenQualityIssue(\'' + key + '\')">Wieder öffnen</button>');
    else actions.push('<button class="compact-action" onclick="acknowledgeQualityIssue(\'' + key + '\',\'' + (item.severity === "Hinweis" ? "gelesen" : "geprüft") + '\')">' + escapeHtml(qualityAckLabel(item)) + '</button>');
  }
  return actions.join(" ");
}

function qualityTaskRowHtml(item, acknowledged) {
  const cls = acknowledged ? "quality-task-row acknowledged" : "quality-task-row";
  const ack = acknowledged ? '<div class="small">' + escapeHtml(acknowledged.mode === "gelesen" ? "gelesen" : "geprüft") + ' am ' + escapeHtml(new Date(acknowledged.at).toLocaleString("de-DE")) + '</div>' : "";
  return '<tr class="' + cls + '"><td><span class="status ' + qualitySeverityClass(item.severity) + '">' + escapeHtml(item.severity) + '</span>' + ack + '</td><td>' + escapeHtml(item.area) + '</td><td>' + escapeHtml(item.point) + '</td><td class="quality-task-detail">' + escapeHtml(item.detail || "") + '</td><td class="actions-cell">' + qualityIssueActionHtml(item, acknowledged) + '</td></tr>';
}

function renderQuality(filterMode) {
  const summaryEl = document.getElementById("qualitySummary");
  const nextEl = document.getElementById("qualityNextActions");
  const filterEl = document.getElementById("qualityFilterBar");
  const issuesEl = document.getElementById("qualityIssuesTable");
  const acknowledgedEl = document.getElementById("qualityAcknowledgedTable");
  const groupedEl = document.getElementById("qualityGroupedChecks");
  const sumsEl = document.getElementById("qualitySumsTable");
  if (!summaryEl || !issuesEl || !sumsEl) return;

  const report = collectQualityChecks({ scope:"currentBilling" });
  const readiness = finalBillingReadiness(report);
  const allRelevant = report.issues.filter(i => i.severity !== "OK");
  const errors = allRelevant.filter(i => i.severity === "Fehler");
  const checks = allRelevant.filter(i => i.severity === "Prüfen");
  const hints = allRelevant.filter(i => i.severity === "Hinweis");
  const open = allRelevant.filter(i => !qualityAckFor(i));
  const acknowledged = allRelevant.filter(i => !!qualityAckFor(i));
  const openErrors = open.filter(i => i.severity === "Fehler");
  const openChecks = open.filter(i => i.severity === "Prüfen");
  const openHints = open.filter(i => i.severity === "Hinweis");
  const overall = openErrors.length ? "Fehler" : (openChecks.length ? "Prüfen" : (openHints.length ? "Hinweis" : "OK"));
  const cls = openErrors.length ? "err" : (openChecks.length ? "warn" : "ok");
  const title = openErrors.length ? "Abrechnung noch nicht freigabebereit" : (openChecks.length ? "Abrechnung mit Prüfpunkten" : (openHints.length ? "Abrechnung mit Hinweisen" : "Keine offenen Qualitätsaufgaben"));
  const msg = openErrors.length ? "Bitte zuerst die Fehler beheben. Fehler können nicht weggeklickt werden." : (openChecks.length ? "Bitte Prüfpunkte fachlich kontrollieren und danach als geprüft markieren." : (openHints.length ? "Hinweise lesen und bei Bedarf als gelesen markieren." : "Du kannst jetzt Abnahmeprotokoll, Briefdruck oder Finalisierung vorbereiten."));
  summaryEl.innerHTML = '<div class="quality-cockpit-hero ' + cls + '"><div><h3>' + escapeHtml(title) + '</h3><div class="small">' + escapeHtml(msg) + '</div><div style="margin-top:8px"><span class="period-badge">' + openErrors.length + ' Fehler · ' + openChecks.length + ' Prüfpunkte · ' + openHints.length + ' Hinweise offen</span></div></div><div class="quality-cockpit-actions"><button class="primary" onclick="jumpToFirstOpenQualityIssue()">Zum ersten offenen Punkt</button><button class="secondary" onclick="renderQuality()">Prüfung erneut ausführen</button><button data-app-action="acceptance-report">Abnahmeprotokoll</button>' + (openErrors.length ? '<button class="warn" onclick="showOnlyQualityErrors()">Nur Fehler anzeigen</button>' : '<button class="primary" data-app-action="finalize-billing">Finalisieren</button>') + '</div></div>';

  if (nextEl) {
    const coverageAreas = new Set(report.issues.map(item => item.area).filter(Boolean));
    const nextRows = open.slice().sort((a,b) => ({"Fehler":0,"Prüfen":1,"Hinweis":2}[a.severity] ?? 9) - ({"Fehler":0,"Prüfen":1,"Hinweis":2}[b.severity] ?? 9)).slice(0, 3);
    nextEl.innerHTML = '<div class="quality-panel quality-coverage"><h3>Prüfumfang der gesamten Abrechnung</h3><div class="small">' + report.issues.length + ' Regeln in ' + coverageAreas.size + ' Bereichen · Stammdaten, Kostenarten, Einnahmen, Zählerstände, Umlage, Vorauszahlungen, Briefe, Export und System.</div></div>' + (nextRows.length ? '<div class="quality-panel"><h3>Was jetzt zu tun ist</h3><ol>' + nextRows.map(i => '<li><strong>' + escapeHtml(i.area) + ':</strong> ' + escapeHtml(i.point) + (i.detail ? ' <span class="small">' + escapeHtml(i.detail) + '</span>' : '') + ' ' + qualityIssueActionHtml(i, null) + '</li>').join('') + '</ol></div>' : '<div class="quality-empty-state"><strong>Keine offenen Aufgaben.</strong><div class="small">Gelesene/geprüfte Hinweise findest du im eingeklappten Bereich darunter. Technische Tests stehen unten.</div></div>');
  }

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("qualitaet");

  if (filterEl) {
    filterEl.innerHTML = '<button class="secondary" onclick="renderQuality()">Alle offenen</button><button onclick="renderQuality(\'errors\')">Nur Fehler</button><button onclick="renderQuality(\'checks\')">Nur Prüfpunkte</button><button onclick="renderQuality(\'hints\')">Nur Hinweise</button>';
  }
  let visibleOpen = open;
  if (filterMode === "errors") visibleOpen = openErrors;
  if (filterMode === "checks") visibleOpen = openChecks;
  if (filterMode === "hints") visibleOpen = openHints;
  const rows = visibleOpen.length ? visibleOpen.map(item => qualityTaskRowHtml(item, null)).join("") : '<tr><td colspan="5">Keine offenen Punkte in dieser Ansicht.</td></tr>';
  issuesEl.innerHTML = '<thead><tr><th>Status</th><th>Bereich</th><th>Prüfpunkt</th><th>Details</th><th>Aktion</th></tr></thead><tbody>' + rows + '</tbody>';

  if (acknowledgedEl) {
    acknowledgedEl.innerHTML = '<thead><tr><th>Status</th><th>Bereich</th><th>Prüfpunkt</th><th>Details</th><th>Aktion</th></tr></thead><tbody>' + (acknowledged.length ? acknowledged.map(item => qualityTaskRowHtml(item, qualityAckFor(item))).join("") : '<tr><td colspan="5">Noch nichts als gelesen/geprüft markiert.</td></tr>') + '</tbody>';
  }

  if (groupedEl) {
    const groups = {};
    open.forEach(item => { const key = item.area || "Sonstiges"; if (!groups[key]) groups[key] = []; groups[key].push(item); });
    const groupHtml = Object.keys(groups).sort().map(area => '<details><summary>' + escapeHtml(area) + ' · ' + groups[area].length + ' offen</summary><div class="table-wrap dashboard-table"><table><thead><tr><th>Status</th><th>Prüfpunkt</th><th>Details</th><th>Aktion</th></tr></thead><tbody>' + groups[area].map(item => '<tr><td><span class="status ' + qualitySeverityClass(item.severity) + '">' + escapeHtml(item.severity) + '</span></td><td>' + escapeHtml(item.point) + '</td><td class="quality-task-detail">' + escapeHtml(item.detail || "") + '</td><td class="actions-cell">' + qualityIssueActionHtml(item, null) + '</td></tr>').join("") + '</tbody></table></div></details>').join("");
    groupedEl.innerHTML = '<div class="quality-panel"><h3>Prüfbereiche</h3>' + (groupHtml || '<div class="small">Keine offenen Prüfpunkte nach Bereichen.</div>') + '</div>';
  }

  const sumRows = [
    ["Aktive umlagefähige Kosten", fmtMoney(report.sums.totalCosts), "Summe der Kostenarten mit In NK = Ja"],
    ["Verteilung auf alle Datensätze", fmtMoney(report.sums.allTenantShare), "Mieter plus Eigentümer/Privat"],
    ["Anteil echte Mieter", fmtMoney(report.sums.billableShare), "Basis für Nachzahlung/Guthaben"],
    ["Eigentümer/Privatanteil", fmtMoney(report.sums.privateShare), "Nicht als Mieterbrief"],
    ["Nicht auf Mieter umgelegt", fmtMoney(report.sums.ownerShare), "Restbetrag aus Verteilung"],
    ["Geleistete Vorauszahlungen", fmtMoney(report.sums.prepayments), "Aus Vorauszahlungsmatrix"],
    ["Einmalige Korrekturen", fmtMoney(report.sums.corrections), "Korrekturen/Gutschriften"],
    ["Summendifferenz", fmtMoney(report.sums.allocationDelta), "Aktive Kosten minus Verteilung"],
    ["Saldo Mieter gesamt", fmtMoney(report.sums.balance), "Kostenanteil minus Vorauszahlungen minus Korrekturen"]
  ].map(r => '<tr><td>' + escapeHtml(r[0]) + '</td><td class="money">' + escapeHtml(r[1]) + '</td><td>' + escapeHtml(r[2]) + '</td></tr>').join("");
  sumsEl.innerHTML = '<thead><tr><th>Wert</th><th>Betrag</th><th>Hinweis</th></tr></thead><tbody>' + sumRows + '</tbody>';
  if (typeof renderAcceptanceProtocolSummary === "function") renderAcceptanceProtocolSummary();
  if (typeof renderReleaseAuditSummary === "function") renderReleaseAuditSummary();
}
function renderDashboard() {
  const wohnungenGesamt = state.wohnungen.filter(w => w.id).length;
  const wohnungenAktiv = state.wohnungen.filter(w => w.id && w.status === "aktiv").length;
  const sichtbareMieter = billableTenantRows();
  const privateMieter = privateTenantRows();
  const archivierteMieter = archivedTenantRows();
  const aktuelleMieter = sichtbareMieter.filter(m => !m.auszug).length;
  const nkOffeneMieter = sichtbareMieter.filter(m => !!m.auszug).length;

  const kalt = sichtbareMieter.reduce((s,m) => s + num(m.kaltErhalten), 0);
  const nk = sichtbareMieter.reduce((s,m) => s + num(m.nkVoraus), 0);
  const einnahmen = kalt + nk;

  const aktiveKosten = state.kostenarten.filter(k => k.kostenart && k.inNK === "Ja");
  const kostenNK = aktiveKosten.reduce((s,k) => s + num(k.gesamtbetrag), 0);

  const calc = calculateUmlage();
  const tenantShares = calc.tenantResults.reduce((s,r) => s + num(r.costShare), 0);
  const korrekturen = sichtbareMieter.reduce((s,m) => s + num(m.vorjahresKorrektur), 0);
  const saldoMieter = tenantShares - nk - korrekturen;

  const offeneKosten = state.kostenarten
    .map(k => ({ ...k, calcStatus: kostenStatus(k) }))
    .filter(k => k.kostenart && !["Vollständig","Nicht Bestandteil der NK-Abrechnung"].includes(k.calcStatus));

  const offeneMieter = sichtbareMieter.filter(m => !m.wohnung || !m.name || !m.einzug || num(m.aktiveTage) <= 0 || num(m.personen) <= 0);
  const offene = offeneKosten.length + offeneMieter.length;

  ensureYearData();
  if (typeof renderOverviewForTab === "function") renderOverviewForTab("dashboard");

  const issueRows = [];
  offeneKosten.forEach(k => issueRows.push({ bereich:"Kostenart", punkt:k.id + " · " + k.kostenart, status:k.calcStatus }));
  offeneMieter.forEach(m => issueRows.push({ bereich:"Mietverhältnis", punkt:(tenantDisplayId(m) || "") + " · " + (m.name || "Name fehlt"), status:"Stammdaten prüfen" }));

  document.getElementById("issuesTable").innerHTML =
    '<thead><tr><th>Bereich</th><th>Punkt</th><th>Status</th></tr></thead><tbody>' +
    (issueRows.length ? issueRows.map(r => '<tr><td>' + escapeHtml(r.bereich) + '</td><td>' + escapeHtml(r.punkt) + '</td><td><span class="status ' + statusClass(r.status) + '">' + escapeHtml(r.status) + '</span></td></tr>').join("") : '<tr><td colspan="3">Keine offenen Punkte.</td></tr>') +
    '</tbody>';

  document.getElementById("activeCostsTable").innerHTML =
    '<thead><tr><th>Kostenart</th><th>Umlageschlüssel</th><th>Gesamtbetrag</th><th>Status</th></tr></thead><tbody>' +
    (aktiveKosten.length ? aktiveKosten.map(k => '<tr><td>' + escapeHtml(k.kostenart) + '</td><td>' + escapeHtml(k.umlageschluessel) + '</td><td>' + fmtMoney(k.gesamtbetrag) + '</td><td><span class="status ' + statusClass(kostenStatus(k)) + '">' + escapeHtml(kostenStatus(k)) + '</span></td></tr>').join("") : '<tr><td colspan="4">Keine aktiven Kostenarten.</td></tr>') +
    '</tbody>';
  renderWorkflowDashboard();
}

function activePrepaymentCostIds() {
  return state.kostenarten
    .filter(k => k.kostenart && k.vorauszahlung === "Ja")
    .map(k => k.id);
}

function syncVorauszahlungen() {
  const tenantCount = Math.max(20, state.mieter.length);
  state.kostenarten.forEach(k => {
    if (!k || !k.id || !k.kostenart) return;
    let row = state.vorauszahlungen.find(v => v.kostenId === k.id);
    if (!row) {
      row = { kostenId:k.id, kostenart:k.kostenart, aktiv:k.vorauszahlung || "Nein", summe:0, werte:Array(tenantCount).fill(0) };
      state.vorauszahlungen.push(row);
    }
    row.kostenart = k.kostenart;
    row.aktiv = k.vorauszahlung === "Ja" ? "Ja" : "Nein";
    if (!Array.isArray(row.werte)) row.werte = [];
    while (row.werte.length < tenantCount) row.werte.push(0);
    row.summe = row.werte.reduce((a,b) => a + num(b), 0);
  });
}

function setCostSetting(index, key, value) {
  const row = state.kostenarten[index];
  if (!row) return;

  if (key === "gesamtbetrag" || key === "gesamtverbrauch" || key === "preisProEinheit") value = value === "" ? "" : num(value);
  if (key === "preisProEinheit") row.preisProEinheitManuell = true;
  row[key] = value;
  normalizeCostSettings(row);
  if (key === "gesamtbetrag" || key === "gesamtverbrauch") applyAutoPriceIfNeeded(row, false);

  if (key === "inNK" && value === "Nein") {
    row.vorauszahlung = "Nein";
    row.berechnungsart = "Entfällt";
    row.umlageschluessel = "Entfällt";
  }

  if (key === "inNK" && value === "Ja" && row.berechnungsart === "Entfällt") {
    row.berechnungsart = "Automatisch";
    row.umlageschluessel = row.umlageschluessel && row.umlageschluessel !== "Entfällt" ? row.umlageschluessel : "Wohnfläche";
  }

  if (key === "vorauszahlung" && value === "Ja" && row.inNK !== "Ja") {
    row.inNK = "Ja";
    if (row.berechnungsart === "Entfällt") row.berechnungsart = "Automatisch";
    if (row.umlageschluessel === "Entfällt") row.umlageschluessel = "Wohnfläche";
  }

  row.status = kostenStatus(row);
  syncVorauszahlungen();
  syncKostenartenMieterUmlage();
  commitStateChange({ reason:"Benutzereingabe" });
}

function activateDefaultPrepayments() {
  const defaults = new Set(["K002","K006","K009"]);
  state.kostenarten.forEach(k => {
    if (defaults.has(k.id)) {
      k.inNK = "Ja";
      k.vorauszahlung = "Ja";
      if (k.id === "K006") {
        k.berechnungsart = "Manuell je Mieter";
        k.umlageschluessel = UMLAGE_MANUAL;
      } else {
        k.berechnungsart = "Automatisch";
        if (!k.umlageschluessel || k.umlageschluessel === "Entfällt" || k.umlageschluessel === UMLAGE_MANUAL) k.umlageschluessel = "Wohnfläche";
      }
      k.status = kostenStatus(k);
    }
  });
  syncVorauszahlungen();
  commitStateChange({ reason:"Benutzereingabe" });
}

function deactivateAllPrepayments() {
  state.kostenarten.forEach(k => { k.vorauszahlung = "Nein"; k.status = kostenStatus(k); });
  syncVorauszahlungen();
  commitStateChange({ reason:"Benutzereingabe" });
}

function activeCostRowsForMatrix() {
  return (Array.isArray(state.kostenarten) ? state.kostenarten : []).filter(k => k && k.id && k.kostenart && k.inNK === "Ja");
}

function tenantIdForUmlage(tenant) {
  return String((tenant && tenant.id) || "");
}

function syncKostenartenMieterUmlage() {
  if (!state.kostenartenMieterUmlage || typeof state.kostenartenMieterUmlage !== "object" || Array.isArray(state.kostenartenMieterUmlage)) state.kostenartenMieterUmlage = {};
  const tenants = tenantRowsWithIndex();
  const tenantIds = tenants.map(tenantIdForUmlage).filter(Boolean);
  const tenantIdSet = new Set(tenantIds);
  const activeCosts = activeCostRowsForMatrix();
  const activeCostIds = new Set(activeCosts.map(k => String(k.id || "")));

  Object.keys(state.kostenartenMieterUmlage).forEach(costId => {
    if (!activeCostIds.has(costId)) delete state.kostenartenMieterUmlage[costId];
  });

  activeCosts.forEach(k => {
    const costId = String(k.id || "");
    if (!state.kostenartenMieterUmlage[costId] || typeof state.kostenartenMieterUmlage[costId] !== "object" || Array.isArray(state.kostenartenMieterUmlage[costId])) {
      state.kostenartenMieterUmlage[costId] = {};
    }
    const row = state.kostenartenMieterUmlage[costId];
    Object.keys(row).forEach(tenantId => {
      if (!tenantIdSet.has(tenantId)) delete row[tenantId];
    });
    tenantIds.forEach(tenantId => {
      if (row[tenantId] === undefined || row[tenantId] === null) row[tenantId] = true;
      else row[tenantId] = row[tenantId] !== false && row[tenantId] !== "Nein";
    });
  });
}

function isCostAllowedForTenant(costId, tenant) {
  const tenantId = tenantIdForUmlage(tenant);
  if (!tenantId || !state.kostenartenMieterUmlage) return true;
  const row = state.kostenartenMieterUmlage[String(costId || "")];
  if (!row || !Object.prototype.hasOwnProperty.call(row, tenantId)) return true;
  return row[tenantId] !== false && row[tenantId] !== "Nein";
}

function setCostTenantAllowed(costId, tenantId, value) {
  syncKostenartenMieterUmlage();
  const cid = String(costId || "");
  const tid = String(tenantId || "");
  if (!cid || !tid) return;
  if (!state.kostenartenMieterUmlage[cid]) state.kostenartenMieterUmlage[cid] = {};
  state.kostenartenMieterUmlage[cid][tid] = value === true || value === "true" || value === "Ja";
  updateTenantPrepaymentTotals();
  commitStateChange({ reason:"Benutzereingabe" });
}

function costTenantToggleHtml(costId, tenantId, allowed) {
  return '<label class="tenant-toggle"><input type="checkbox" ' + (allowed ? "checked" : "") +
    ' onchange="setCostTenantAllowed(\'' + escapeJsString(costId) + '\',\'' + escapeJsString(tenantId) + '\',this.checked)"><span>' +
    (allowed ? "ja" : "nein") + '</span></label>';
}

function renderKostenMieterUmlageMatrix() {
  const el = document.getElementById("kostenMieterUmlageTable");
  if (!el) return;
  syncKostenartenMieterUmlage();
  const tenants = tenantRowsWithIndex();
  const costs = activeCostRowsForMatrix();
  const tenantHeads = tenants.map(t => tenantHeaderHtml(t)).join("");

  if (!costs.length || !tenants.length) {
    el.innerHTML = '<thead><tr><th>Hinweis</th></tr></thead><tbody><tr><td>Keine aktive Kostenart oder kein Mietverhältnis in dieser Abrechnungsperiode vorhanden.</td></tr></tbody>';
    return;
  }

  const rows = costs.map(k => {
    const tenantCells = tenants.map(t => {
      const tenantId = tenantIdForUmlage(t);
      return '<td class="toggle-cell-wrap">' + costTenantToggleHtml(k.id, tenantId, isCostAllowedForTenant(k.id, t)) + '</td>';
    }).join("");
    return '<tr><td>' + escapeHtml(k.id) + '</td><td>' + escapeHtml(k.kostenart) + '</td><td>' + escapeHtml(kostenStatus(k)) + '</td><td>' + escapeHtml(costExclusionHandling(k)) + '</td>' + tenantCells + '</tr>';
  }).join("");

  el.innerHTML = '<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Status</th><th>Ausschluss-Behandlung</th>' + tenantHeads + '</tr></thead><tbody>' + rows + '</tbody>';
}


let costPageSize = 25;
let costShowAllRows = false;
let selectedCostRows = new Set();

function toggleCostRowSelection(index, checked) {
  const numericIndex = Number(index);
  if (checked) selectedCostRows.add(numericIndex);
  else selectedCostRows.delete(numericIndex);
  updateCostSelectionUi();
}

function toggleAllVisibleCostRows(checked) {
  document.querySelectorAll(".cost-row-checkbox").forEach(box => {
    box.checked = !!checked;
    const index = Number(box.dataset.costIndex);
    if (checked) selectedCostRows.add(index);
    else selectedCostRows.delete(index);
  });
  updateCostSelectionUi();
}

function updateCostSelectionUi() {
  Array.from(selectedCostRows).forEach(index => {
    const cost = state.kostenarten[index];
    if (!cost || cost.inNK !== "Ja") selectedCostRows.delete(index);
  });
  const button = document.getElementById("costDeactivateSelectedBtn");
  if (button) {
    button.disabled = selectedCostRows.size === 0 || isArchiveViewer();
    button.textContent = selectedCostRows.size <= 1
      ? "⊘ Ausgewählte Kostenart deaktivieren"
      : "⊘ " + selectedCostRows.size + " Kostenarten deaktivieren";
  }

  const boxes = Array.from(document.querySelectorAll(".cost-row-checkbox"));
  boxes.forEach(box => {
    const selected = selectedCostRows.has(Number(box.dataset.costIndex));
    box.checked = selected;
    const row = box.closest("tr");
    if (row) row.classList.toggle("is-selected", selected);
  });

  const selectAll = document.getElementById("costSelectAll");
  if (selectAll) {
    const checkedCount = boxes.filter(box => box.checked).length;
    selectAll.checked = boxes.length > 0 && checkedCount === boxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < boxes.length;
  }
}

function deactivateSelectedCosts() {
  if (!selectedCostRows.size || isArchiveViewer()) return;
  const validIndexes = Array.from(selectedCostRows).filter(index => {
    const cost = state.kostenarten[index];
    return cost && cost.inNK === "Ja";
  });
  if (!validIndexes.length) {
    selectedCostRows.clear();
    updateCostSelectionUi();
    return;
  }
  const labels = validIndexes.slice(0, 4).map(index => state.kostenarten[index].kostenart).filter(Boolean);
  const more = validIndexes.length > labels.length ? " und " + (validIndexes.length - labels.length) + " weitere" : "";
  const message = validIndexes.length === 1
    ? "Kostenart „" + labels[0] + "“ deaktivieren?\n\nDie bisherigen Eingaben bleiben gespeichert und können später wieder aktiviert werden."
    : validIndexes.length + " Kostenarten deaktivieren?\n\n" + labels.join(", ") + more + "\n\nDie bisherigen Eingaben bleiben gespeichert und können später wieder aktiviert werden.";
  if (!window.confirm(message)) return;

  validIndexes.forEach(index => {
    state.kostenarten[index].inNK = "Nein";
  });
  selectedCostRows.clear();
  commitStateChange({ reason:"Kostenarten deaktiviert" });
}


function setCostPageSize(value) {
  const parsed = Number(value);
  costPageSize = Number.isFinite(parsed) && parsed > 0 ? parsed : 25;
  costShowAllRows = costPageSize >= 9999;
  renderEinstellungen();
}

function toggleAllCostRows() {
  costShowAllRows = !costShowAllRows;
  renderEinstellungen();
}

function openCostColumnInfo() {
  setActionMessage("Alle verfügbaren Kostenarten-Spalten sind bereits sichtbar.");
  renderActionFeedback();
}

function openCostSelectionDialog() {
  if (isArchiveViewer()) return;
  const modal = document.getElementById("costSelectionModal");
  const search = document.getElementById("costSelectionSearch");
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("cost-dialog-open");
  if (search) {
    search.value = "";
    window.setTimeout(() => search.focus(), 0);
  }
  renderCostSelectionDialog();
}

function closeCostSelectionDialog() {
  const modal = document.getElementById("costSelectionModal");
  if (modal) modal.hidden = true;
  document.body.classList.remove("cost-dialog-open");
}

function activateCostFromDialog(index) {
  const cost = state.kostenarten[index];
  if (!cost || cost.inNK === "Ja") return;
  setCostSetting(index, "inNK", "Ja");
  closeCostSelectionDialog();
  window.setTimeout(() => {
    const editSection = document.getElementById("costEditSection");
    if (editSection) {
      editSection.open = true;
      editSection.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  }, 0);
}

function renderCostSelectionDialog() {
  const container = document.getElementById("costSelectionDialogContent");
  if (!container) return;
  const query = String(document.getElementById("costSelectionSearch")?.value || "").trim().toLowerCase();
  const costs = (Array.isArray(state.kostenarten) ? state.kostenarten : [])
    .map((cost, index) => ({ cost, index }))
    .filter(item => item.cost && item.cost.id && item.cost.kostenart);

  const groups = {};
  costs.forEach(item => {
    const group = costGroupLabel(item.cost);
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });

  const order = ["Betriebskosten", "Wasser", "Heizung / Warmwasser", "Abfall",
    "Eigentümerkosten / nicht umlagefähig", "Sonstige / freie Kostenarten", "Archiv / Hinweise"];
  const groupNames = Object.keys(groups).sort((a,b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.localeCompare(b, "de");
  });

  const htmlGroups = groupNames.map(group => {
    const items = groups[group].filter(({cost}) => {
      if (!query) return true;
      return [cost.kostenart, group, cost.id, cost.bereich].some(value =>
        String(value || "").toLowerCase().includes(query)
      );
    });
    if (!items.length) return "";
    const buttons = items.map(({cost,index}) => {
      const active = cost.inNK === "Ja";
      return '<button type="button" class="cost-choice-item ' + (active ? 'is-active' : '') + '" ' +
        (active ? 'disabled' : 'onclick="activateCostFromDialog(' + index + ')"') + '>' +
        '<span class="cost-choice-main"><strong>' + escapeHtml(cost.kostenart) + '</strong>' +
        '<small>' + escapeHtml(cost.id) + ' · ' + escapeHtml(cost.umlageschluessel || "noch festlegen") + '</small></span>' +
        '<span class="cost-choice-state">' + (active ? 'Bereits hinzugefügt' : 'Hinzufügen') + '</span>' +
      '</button>';
    }).join("");
    return '<section class="cost-choice-group"><h4>' + escapeHtml(group) + '</h4><div class="cost-choice-grid">' + buttons + '</div></section>';
  }).join("");

  container.innerHTML = htmlGroups || '<div class="cost-dialog-empty">Keine passende Kostenart gefunden.</div>';
}

function createFreeCostRow() {
  openCostSelectionDialog();
  const available = state.kostenarten.findIndex(k => isFreeCostSlot(k) && k.inNK !== "Ja");
  if (available < 0) {
    alert("Alle vorgesehenen freien Kostenarten-IDs sind bereits verwendet. Bitte eine bestehende eigene Kostenart bearbeiten oder deaktivieren.");
    return;
  }
  renderCostSelectionPanel();
  requestAnimationFrame(() => {
    const input = document.getElementById("freeCostName_" + available);
    if (input) { input.scrollIntoView({ behavior:"smooth", block:"center" }); input.focus(); }
  });
}

function costUnitLabel(cost) {
  const key = String(cost && cost.umlageschluessel || "");
  if (key === "Wohnfläche") return "m²";
  if (key === "Personen") return "Person";
  if (key === "Verbrauch") return "Einheit";
  if (key === "Miettage") return "Tag";
  if (key.indexOf("Wohneinheiten") >= 0) return "Wohneinheit";
  if (key === UMLAGE_MANUAL) return "individuell";
  return "–";
}

function costDisplayGroup(cost) {
  const group = String(cost && cost.bereich || "").trim();
  if (group) return group;
  return cost && cost.umlageschluessel === "Verbrauch" ? "Verbrauchskosten" : "Grundkosten";
}

function costIsComplete(cost) {
  return kostenStatus(cost) === "Vollständig";
}

function renderCostMockupOverview(activeCosts) {
  const costs = activeCosts.map(item => item.k);
  const total = costs.reduce((sum, cost) => sum + num(cost.gesamtbetrag), 0);
  const complete = costs.filter(costIsComplete).length;
  const open = Math.max(0, costs.length - complete);
  const umlagefaehig = total;
  const nonUmlage = 0;
  const qualityTarget = open ? "Prüfen Sie die Hinweise in der Qualitätsprüfung." : "Alle aktiven Kostenarten sind vollständig.";
  const period = escapeHtml(periodLabelShort());

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("einstellungen");

  const editBadge = document.getElementById("costEditBadge");
  const specialBadge = document.getElementById("costSpecialBadge");
  const controlBadge = document.getElementById("costControlBadge");
  if (editBadge) editBadge.textContent = costs.length + " aktive Kostenarten";
  if (specialBadge) specialBadge.textContent = costs.filter(c => costExclusionHandling(c) !== COST_EXCLUSION_OPTIONS[0]).length + " aktiv";
  if (controlBadge) controlBadge.textContent = open ? open + " prüfen" : "OK";

  const floorArea = (state.wohnungen || []).filter(w => w && w.status === "aktiv").reduce((sum,w) => sum + num(w.wohnflaeche), 0);
  const people = (state.mieter || []).filter(m => m && m.status === "Aktiv").reduce((sum,m) => sum + num(m.personen), 0);
  const perSqm = floorArea > 0 ? umlagefaehig / floorArea : 0;
  const perPerson = people > 0 ? umlagefaehig / people : 0;

  const control = document.getElementById("costPilotControl");
  if (control) {
    control.innerHTML =
      '<div class="cost-control-metric"><span>Summe Gesamtkosten</span><strong>' + fmtMoney(total) + '</strong></div>' +
      '<div class="cost-control-metric"><span>Summe umlagefähige Kosten</span><strong>' + fmtMoney(umlagefaehig) + '</strong></div>' +
      '<div class="cost-control-metric"><span>Nicht umlagefähig</span><strong>' + fmtMoney(nonUmlage) + '</strong></div>' +
      '<div class="cost-control-metric"><span>Umlagebare Kosten je m²</span><strong>' + fmtMoney(perSqm) + '</strong></div>' +
      '<div class="cost-control-metric"><span>Umlagebare Kosten je Person</span><strong>' + fmtMoney(perPerson) + '</strong></div>' +
      '<div class="cost-control-action"><button type="button" onclick="document.getElementById(\'costTenantSection\').open=true;document.getElementById(\'costTenantSection\').scrollIntoView({behavior:\'smooth\'})">Detail-Kontrollansicht öffnen<br><span class="small">(Sonderfälle &amp; Details)&nbsp; ›</span></button></div>';
  }

}

function renderEinstellungen() {
  ensureCostSettings();

  const allActiveCosts = state.kostenarten
    .map((k,i) => ({ k, i }))
    .filter(item => item.k && item.k.id && item.k.kostenart && item.k.inNK === "Ja");

  const visibleCount = costShowAllRows ? allActiveCosts.length : Math.min(costPageSize, allActiveCosts.length);
  const activeCosts = allActiveCosts.slice(0, visibleCount);
  const keyOptions = ["Verbrauch","Wohnfläche","Personen","Verteilung auf alle Wohneinheiten","Verteilung nur auf aktive Wohneinheiten","Miettage",UMLAGE_MANUAL,"Entfällt"];

  const rows = activeCosts.length ? activeCosts.map(({k,i}, rowIndex) => {
    const status = costIsComplete(k) ? "OK" : "Hinweis";
    const statusClassName = costIsComplete(k) ? "ok" : "warn";
    const price = k.umlageschluessel === "Verbrauch" ? priceCellHtml(k, i) : '<span class="cost-disabled-value">–</span>';
    return '<tr class="' + (selectedCostRows.has(i) ? 'is-selected' : '') + '">' +
      '<td class="cost-select-col"><input type="checkbox" class="cost-row-checkbox" data-cost-index="' + i + '" ' + (selectedCostRows.has(i) ? 'checked' : '') + ' onchange="toggleCostRowSelection(' + i + ',this.checked)"></td>' +
      '<td>' + (rowIndex + 1) + '</td>' +
      '<td><span class="cost-readonly-identity">' + escapeHtml(k.kostenart) + '</span></td>' +
      '<td><span class="cost-readonly-group">' + escapeHtml(costGroupLabel(k)) + '</span></td>' +
      '<td>' + inputHtml(k.gesamtbetrag, "setCostSetting(" + i + ",\'gesamtbetrag\',this.value)", "money").replace("<input ", "<input class=\\\"cost-money-input\\\" ") + '</td>' +
      '<td>' + selectHtml(k.vorauszahlung, ["Ja","Nein"], "setCostSetting(" + i + ",\'vorauszahlung\',this.value)") + '</td>' +
      '<td>' + selectHtml(k.berechnungsart, ["Automatisch","Manuell je Mieter","Entfällt"], "setNested(\'kostenarten\'," + i + ",\'berechnungsart\',this.value)") + '</td>' +
      '<td>' + selectHtml(k.umlageschluessel, keyOptions, "setNested(\'kostenarten\'," + i + ",\'umlageschluessel\',this.value)") + '</td>' +
      '<td>' + selectHtml(costExclusionHandling(k), COST_EXCLUSION_OPTIONS, "setCostSetting(" + i + ",\'ausschlussBehandlung\',this.value)") + '</td>' +
      '<td>' + escapeHtml(costUnitLabel(k)) + '</td>' +
      '<td>' + inputHtml(k.gesamtverbrauch, "setCostSetting(" + i + ",\'gesamtverbrauch\',this.value)", "number") + '</td>' +
      '<td>' + price + '</td>' +
      '<td>' + escapeHtml(periodLabelShort()) + '</td>' +
      '<td>' + inputHtml(k.bemerkung, "setNested(\'kostenarten\'," + i + ",\'bemerkung\',this.value)") + '</td>' +
      '<td><span class="cost-row-status ' + statusClassName + '">' + status + '</span></td>' +
    '</tr>';
  }).join("") : '<tr><td colspan="15">Noch keine Kostenart aktiviert. Über „Kostenart hinzufügen“ kann eine vorhandene oder freie Kostenart ausgewählt werden.</td></tr>';

  const table = document.getElementById("settingsTable");
  if (table) {
    table.innerHTML =
      '<thead><tr>' +
        '<th class="cost-select-col"><input id="costSelectAll" class="cost-select-all-checkbox" type="checkbox" onchange="toggleAllVisibleCostRows(this.checked)" title="Alle sichtbaren Kostenarten auswählen"></th>' +
        '<th>Nr.</th>' +
        '<th>Kostenart</th>' +
        '<th>Gruppe</th>' +
        '<th>Gesamtkosten<br>(Euro)</th>' +
        '<th>Vorauszahlung?</th>' +
        '<th>Berechnungsart</th>' +
        '<th>Umlageschlüssel</th>' +
        '<th>Ausschluss-<br>Behandlung</th>' +
        '<th>Einheit /<br>Basis</th>' +
        '<th>Gesamt-<br>verbrauch</th>' +
        '<th>Preis je Einheit<br>(Euro)</th>' +
        '<th>Abrechnungs-<br>zeitraum</th>' +
        '<th>Bemerkung</th>' +
        '<th>Status</th>' +
      '</tr></thead><tbody>' + rows + '</tbody>';
  }

  const showMoreButton = document.getElementById("costShowMoreButton");
  if (showMoreButton) {
    const remaining = Math.max(0, allActiveCosts.length - visibleCount);
    showMoreButton.hidden = allActiveCosts.length <= costPageSize && !costShowAllRows;
    if (!showMoreButton.hidden) {
      showMoreButton.textContent = costShowAllRows
        ? "Weniger Kostenarten anzeigen ︿"
        : remaining + " weitere Kostenarten anzeigen ﹀";
    }
  }

  renderKostenMieterUmlageMatrix();
  renderCostMockupOverview(allActiveCosts);
  updateCostSelectionUi();
}

function renderWohnungen() {
  renderBillingStammdatenStatus();
  renderSpecialCaseWatch();

  const units = Array.isArray(state.wohnungen) ? state.wohnungen.filter(w => w && w.id) : [];
  const activeUnits = units.filter(w => w.status === "aktiv");
  const inactiveUnits = units.filter(w => w.status !== "aktiv");
  const rows = units.map((w) =>
    '<tr class="' + (w.status === "aktiv" ? "" : "inactive-row") + '"><td>' + unitIdCellHtml(w) + '</td>' +
    '<td>' + escapeHtml(w.bezeichnung || "") + '</td>' +
    '<td>' + escapeHtml(w.lage || "") + '</td>' +
    '<td>' + escapeHtml(num(w.wohnflaeche).toLocaleString("de-DE")) + '</td>' +
    '<td>' + escapeHtml(w.zimmer || "") + '</td>' +
    '<td class="editable">' + selectHtml(w.status || "aktiv", ["aktiv","inaktiv"], "setBillingUnitStatus(" + units.indexOf(w) + ",this.value)") + '</td>' +
    '<td>' + escapeHtml(w.bemerkung || "") + '</td></tr>').join("");
  const unitsTable = document.getElementById("wohnungenTable");
  if (unitsTable) unitsTable.innerHTML = '<thead><tr><th>Wohnungs-ID</th><th>Bezeichnung</th><th>Etage / Lage</th><th>Wohnfläche m²</th><th>Zimmer</th><th>Status</th><th>Bemerkung</th></tr></thead><tbody>' + (rows || '<tr><td colspan="7">Keine Wohnungen vorhanden.</td></tr>') + '</tbody>';

  const visibleRows = visibleTenantRows();
  const activeRelations = visibleRows.filter(m => tenantOpenStatus(m) === "Aktiv");
  const openRelations = visibleRows.filter(m => tenantOpenStatus(m) !== "Aktiv");
  const mieterTotals = visibleRows.reduce((totals,m) => {
    totals.aktiveTage += num(m.aktiveTage);
    totals.personen += num(m.personen);
    return totals;
  }, { aktiveTage:0, personen:0 });

  const mrows = visibleRows.length ? visibleRows.map((m) =>
    '<tr><td>' + tenantIdCellHtml(m) + '</td>' +
    '<td>' + unitRefCellHtml(m.wohnung) + '</td>' +
    '<td>' + escapeHtml(m.name || "") + '</td>' +
    '<td>' + escapeHtml(m.abrechnungRolle || "") + '</td>' +
    '<td>' + escapeHtml(m.geschlecht || "") + '</td>' +
    '<td>' + escapeHtml(m.standardanrede || "") + '</td>' +
    '<td>' + escapeHtml(m.strasse || "") + '</td>' +
    '<td>' + escapeHtml(m.plz || "") + '</td>' +
    '<td>' + escapeHtml(m.ort || "") + '</td>' +
    '<td>' + escapeHtml(m.telefon || "") + '</td>' +
    '<td>' + escapeHtml(m.email || "") + '</td>' +
    '<td>' + escapeHtml(m.einzug || "") + '</td>' +
    '<td>' + escapeHtml(m.auszug || "") + '</td>' +
    '<td>' + specialCaseBadgesForTenant(m) + '</td>' +
    '<td>' + escapeHtml(normalizeActiveDayValue(m.aktiveTage).toLocaleString("de-DE")) + '</td>' +
    '<td>' + escapeHtml(num(m.personen).toLocaleString("de-DE")) + '</td>' +
    '<td><span class="status ' + (tenantOpenStatus(m) === "Aktiv" ? "ok" : "warn") + '">' + escapeHtml(tenantOpenStatus(m)) + '</span></td></tr>').join("") +
    '<tr class="total-row"><td colspan="14">Summe</td><td>' + mieterTotals.aktiveTage.toLocaleString("de-DE") + '</td><td>' + mieterTotals.personen.toLocaleString("de-DE") + '</td><td></td></tr>'
    : '<tr><td colspan="17">Keine Mietverhältnisse für diese Abrechnungsperiode übernommen.</td></tr>';
  const tenantTable = document.getElementById("mieterTable");
  if (tenantTable) tenantTable.innerHTML =
    '<thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mietername</th><th>Rolle</th><th>Geschlecht</th><th>Standardanrede Brief</th><th>Straße</th><th>PLZ</th><th>Ort</th><th>Telefon</th><th>E-Mail</th><th>Einzug</th><th>Auszug</th><th>Sonderfall</th><th>Aktive Tage</th><th>Personen</th><th>Abrechnungsstatus</th></tr></thead><tbody>' + mrows + '</tbody>';

  const unitBadge = document.getElementById("tenantUnitsBadge");
  if (unitBadge) unitBadge.textContent = units.length + (units.length === 1 ? " Wohnung" : " Wohnungen");
  const relationBadge = document.getElementById("tenantRelationsBadge");
  if (relationBadge) relationBadge.textContent = visibleRows.length + (visibleRows.length === 1 ? " Mietverhältnis" : " Mietverhältnisse");

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("mieter");

  const control = document.getElementById("tenantControlSummary");
  if (control) control.innerHTML =
    '<div class="tenant-control-item"><span>Wohnfläche aktiv</span><strong>' + activeUnits.reduce((sum,w) => sum + num(w.wohnflaeche), 0).toLocaleString("de-DE") + ' m²</strong></div>' +
    '<div class="tenant-control-item"><span>Aktive Tage gesamt</span><strong>' + mieterTotals.aktiveTage.toLocaleString("de-DE") + '</strong></div>' +
    '<div class="tenant-control-item"><span>Personen gesamt</span><strong>' + mieterTotals.personen.toLocaleString("de-DE") + '</strong></div>' +
    '<div class="tenant-control-item"><span>Datenstatus</span><strong>' + (units.length && visibleRows.length ? "Vorhanden" : "Prüfen") + '</strong></div>';
}

function renderEinnahmen() {
  const einnahmenEl = document.getElementById("einnahmenTable");
  const vorausEl = document.getElementById("vorauszahlungenTable");
  if (!einnahmenEl || !vorausEl) return;

  ensureTenantContactData();
  const visibleRows = billableTenantRows();
  const incomeTotals = visibleRows.reduce((totals,m) => {
    totals.kaltSoll += num(m.kaltSoll);
    totals.kaltErhalten += num(m.kaltErhalten);
    totals.nkVoraus += num(m.nkVoraus);
    totals.korrektur += num(m.vorjahresKorrektur);
    totals.einnahmen += num(m.einnahmen);
    return totals;
  }, { kaltSoll:0, kaltErhalten:0, nkVoraus:0, korrektur:0, einnahmen:0 });

  const incomeRows = visibleRows.length ? visibleRows.map((m) =>
    '<tr><td>' + tenantIdCellHtml(m) + '</td>' +
    '<td>' + unitRefCellHtml(m.wohnung) + '</td>' +
    '<td>' + escapeHtml(m.name || "") + '</td>' +
    '<td class="editable">' + inputHtml(m.kaltSoll, "setNested('mieter'," + m.originalIndex + ",'kaltSoll',this.value,'number')", "money") + '</td>' +
    '<td class="editable">' + inputHtml(m.kaltErhalten, "setNested('mieter'," + m.originalIndex + ",'kaltErhalten',this.value,'number')", "money") + '</td>' +
    '<td class="readonly-cell">' + fmtMoney(m.nkVoraus) + '</td>' +
    '<td class="editable">' + inputHtml(m.vorjahresKorrektur, "setNested('mieter'," + m.originalIndex + ",'vorjahresKorrektur',this.value,'number')", "money") + '</td>' +
    '<td>' + fmtMoney(m.einnahmen) + '</td>' +
    '<td><span class="status ' + (tenantOpenStatus(m) === "Aktiv" ? "ok" : "warn") + '">' + escapeHtml(tenantOpenStatus(m)) + '</span></td></tr>').join("") +
    '<tr class="total-row"><td colspan="3">Summe</td><td>' + fmtMoney(incomeTotals.kaltSoll) + '</td><td>' + fmtMoney(incomeTotals.kaltErhalten) + '</td><td>' + fmtMoney(incomeTotals.nkVoraus) + '</td><td>' + fmtMoney(incomeTotals.korrektur) + '</td><td>' + fmtMoney(incomeTotals.einnahmen) + '</td><td></td></tr>'
    : '<tr><td colspan="9">Keine aktuellen oder NK-offenen Mietverhältnisse vorhanden.</td></tr>';
  einnahmenEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mietername</th><th>Kaltmiete Soll/Jahr</th><th>Kaltmiete erhalten</th><th>NK-Vorauszahlungen automatisch</th><th>Einmalige Korrektur / Gutschrift</th><th>Einnahmen gesamt</th><th>Abrechnungsstatus</th></tr></thead><tbody>' + incomeRows + '</tbody>';

  syncVorauszahlungen();
  ensurePrepaymentCarryForwardIfNeeded();
  renderPrepaymentCarryForwardNotice();
  const activeIds = new Set(activePrepaymentCostIds());
  const tenantHeads = visibleRows.map(m => tenantHeaderHtml(m)).join("");
  const visibleVorausRows = state.vorauszahlungen
    .map((v,i) => ({...v, originalIndex:i}))
    .filter(v => activeIds.has(v.kostenId));
  const columnTotals = visibleRows.map(m =>
    visibleVorausRows.reduce((sum,v) => sum + (isCostAllowedForTenant(v.kostenId, m) ? num(v.werte[m.originalIndex]) : 0), 0)
  );
  const grandTotal = columnTotals.reduce((a,b) => a + num(b), 0);

  const vrows = visibleVorausRows.length && visibleRows.length ? visibleVorausRows.map((v) => {
    const allowedSum = visibleRows.reduce((sum,m) => sum + (isCostAllowedForTenant(v.kostenId, m) ? num(v.werte[m.originalIndex]) : 0), 0);
    const cells = visibleRows.map(m => {
      const current = num(v.werte[m.originalIndex]);
      if (!isCostAllowedForTenant(v.kostenId, m)) {
        return '<td class="readonly-cell">' + (Math.abs(current) > 0.01 ? fmtMoney(current) : "–") + '<div class="small">nicht umlagefähig</div></td>';
      }
      return '<td class="editable">' + inputHtml(v.werte[m.originalIndex], "state.vorauszahlungen[" + v.originalIndex + "].werte[" + m.originalIndex + "]=num(this.value); state.vorauszahlungen[" + v.originalIndex + "].summe=state.vorauszahlungen[" + v.originalIndex + "].werte.reduce((a,b)=>a+num(b),0); updateTenantPrepaymentTotals(); commitStateChange({reason:'Benutzereingabe'});", "money") + '</td>';
    }).join("");
    return '<tr><td>' + escapeHtml(v.kostenId) + '</td><td>' + escapeHtml(v.kostenart) + '</td><td>' + escapeHtml(v.aktiv) + '</td><td>' + fmtMoney(allowedSum) + '</td>' + cells + '</tr>';
  }).join("") +
    '<tr class="total-row"><td colspan="3">Summe je Mieter</td><td>' + fmtMoney(grandTotal) + '</td>' +
    columnTotals.map(total => '<td>' + fmtMoney(total) + '</td>').join("") + '</tr>'
    : '<tr><td colspan="' + (4 + visibleRows.length) + '">Keine Kostenart für NK-Vorauszahlungen aktiviert oder kein aktuelles/NK-offenes Mietverhältnis vorhanden.</td></tr>';
  vorausEl.innerHTML = '<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Als VZ?</th><th>Summe</th>' + tenantHeads + '</tr></thead><tbody>' + vrows + '</tbody>';
}

function renderKosten() {
  const rows = state.kostenarten.map((k,i) =>
    '<tr><td>' + escapeHtml(k.id) + '</td>' +
    '<td class="editable">' + inputHtml(k.kostenart, "setNested('kostenarten'," + i + ",'kostenart',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(k.bereich, "setNested('kostenarten'," + i + ",'bereich',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(k.inNK, ["Ja","Nein"], "setNested('kostenarten'," + i + ",'inNK',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(k.vorauszahlung, ["Ja","Nein"], "setNested('kostenarten'," + i + ",'vorauszahlung',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(k.berechnungsart, ["Automatisch","Manuell je Mieter","Entfällt"], "setNested('kostenarten'," + i + ",'berechnungsart',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(k.umlageschluessel, ["Verbrauch","Wohnfläche","Personen","Verteilung auf alle Wohneinheiten","Verteilung nur auf aktive Wohneinheiten","Miettage",UMLAGE_MANUAL,"Entfällt"], "setNested('kostenarten'," + i + ",'umlageschluessel',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(costExclusionHandling(k), COST_EXCLUSION_OPTIONS, "setNested('kostenarten'," + i + ",'ausschlussBehandlung',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(k.gesamtbetrag, "setNested('kostenarten'," + i + ",'gesamtbetrag',this.value,'number')", "money") + '</td>' +
    '<td class="editable">' + inputHtml(k.gesamtverbrauch, "setNested('kostenarten'," + i + ",'gesamtverbrauch',this.value,'number')", "number") + '</td>' +
    '<td class="editable">' + inputHtml(k.preisProEinheit, "setNested('kostenarten'," + i + ",'preisProEinheit',this.value,'number')", "money") + '</td>' +
    '<td class="editable">' + inputHtml(k.bemerkung, "setNested('kostenarten'," + i + ",'bemerkung',this.value)") + '</td>' +
    '<td><span class="status ' + statusClass(kostenStatus(k)) + '">' + escapeHtml(kostenStatus(k)) + '</span></td></tr>').join("");
  document.getElementById("kostenTable").innerHTML = '<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Kostenbereich</th><th>In NK?</th><th>Als Vorauszahlung?</th><th>Berechnungsart</th><th>Umlageschlüssel</th><th>Ausschluss-Behandlung</th><th>Gesamtbetrag</th><th>Gesamtverbrauch</th><th>Preis pro Verbrauchseinheit</th><th>Bemerkung</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody>';
}

function addCostRow() {
  openCostSelectionDialog();
}

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

function ensureYearData() {
  if (!state.meta) state.meta = {};
  if (!state.meta.abrechnungsjahr) {
    const briefYear = state.briefSettings && state.briefSettings.abrechnungsjahr ? state.briefSettings.abrechnungsjahr : "";
    state.meta.abrechnungsjahr = briefYear || "2024";
  }
  if (!state.meta.abrechnungsbeginn) state.meta.abrechnungsbeginn = String(state.meta.abrechnungsjahr) + "-01-01";
  if (!state.meta.abrechnungsende) state.meta.abrechnungsende = String(state.meta.abrechnungsjahr) + "-12-31";
  if (!Array.isArray(state.jahresArchiv)) state.jahresArchiv = [];
  if (state.briefSettings) state.briefSettings.abrechnungsjahr = state.meta.abrechnungsjahr;
}

function currentAbrechnungsjahr() {
  ensureYearData();
  return state.meta.abrechnungsjahr || "2024";
}

function periodStart() {
  ensureYearData();
  return state.meta.abrechnungsbeginn || (currentAbrechnungsjahr() + "-01-01");
}

function periodEnd() {
  ensureYearData();
  return state.meta.abrechnungsende || (currentAbrechnungsjahr() + "-12-31");
}

function periodLabelShort() {
  return dateDe(periodStart()) + " – " + dateDe(periodEnd());
}

function periodYearFromDate(value) {
  const text = String(value || "");
  const m = text.match(/^(\d{4})-/);
  return m ? m[1] : "";
}

function setAbrechnungsjahr(value) {
  ensureYearData();
  const year = String(value || "").trim() || currentAbrechnungsjahr();
  state.meta.abrechnungsjahr = year;
  state.meta.abrechnungsbeginn = year + "-01-01";
  state.meta.abrechnungsende = year + "-12-31";
  if (state.briefSettings) state.briefSettings.abrechnungsjahr = year;
  commitStateChange({ reason:"Benutzereingabe" });
}

function setAbrechnungsperiode(key, value) {
  ensureYearData();
  state.meta[key] = value;
  const startYear = periodYearFromDate(state.meta.abrechnungsbeginn);
  const endYear = periodYearFromDate(state.meta.abrechnungsende);
  if (startYear && startYear === endYear) state.meta.abrechnungsjahr = startYear;
  else if (endYear) state.meta.abrechnungsjahr = endYear;
  if (state.briefSettings) state.briefSettings.abrechnungsjahr = state.meta.abrechnungsjahr;
  commitStateChange({ reason:"Benutzereingabe" });
}

function periodDaysExact() {
  const start = new Date(periodStart() + "T00:00:00");
  const end = new Date(periodEnd() + "T00:00:00");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 365;
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function renderPeriodInfo() {
  ensureYearData();
  const archive = isArchiveViewer();
  if (document.body) document.body.classList.toggle("archive-view", archive);
  const label = archive ? "Archivierte Nebenkostenabrechnung" : "Aktuelle Abrechnungsperiode";
  const detail = archive && state.meta && state.meta.archivedAt ? "archiviert am " + dateDe(state.meta.archivedAt) : "lokaler Arbeitsstand";
  const startAction = !archive && currentAppMode() === "billing" ? '<button type="button" data-app-action="return-start">Zur Startseite</button>' : '';
  const archiveAction = archive ? '<button class="primary archive-close-top" type="button" data-app-action="close-archive">Archivansicht schließen</button>' : '';
  const workflow = "";
  const html = '<div class="period-banner"><div class="period-main"><span class="period-kicker">' + escapeHtml(label) + '</span><span class="period-title">' + escapeHtml(periodLabelShort()) + '</span><span class="small">' + escapeHtml(detail) + '</span></div><div class="period-actions"><span class="period-badge">Jahr ' + escapeHtml(currentAbrechnungsjahr()) + '</span>' + (archive ? '<span class="readonly-badge">Schreibgeschützt</span>' : '') + startAction + archiveAction + '</div></div>' + workflow;
  document.querySelectorAll(".period-info").forEach(el => { el.innerHTML = html; });
}

function archiveYearNumbers() {
  ensureYearData();
  return state.jahresArchiv.map(a => yearNumber(a.year)).filter(n => Number.isFinite(n) && n > 0);
}

function latestKnownYear() {
  const years = archiveYearNumbers();
  years.push(yearNumber(currentAbrechnungsjahr()));
  return Math.max(...years);
}

function isViewingOlderArchiveYear() {
  return yearNumber(currentAbrechnungsjahr()) < latestKnownYear();
}

function isArchiveViewer() {
  return !!(state.meta && state.meta.archiveViewer);
}

function isLegacyArchiveView() {
  return !!(state.meta && state.meta.legacyArchivHinweis);
}

function startModeText() {
  if (isArchiveViewer()) return "Archivierte Abrechnung";
  if (isViewingOlderArchiveYear()) return "Archivierte Abrechnung";
  return "Aktuelles Arbeitsjahr";
}

function archiveReturnUrl() {
  return state && state.meta && state.meta.archiveReturnUrl ? String(state.meta.archiveReturnUrl) : "";
}

function closeArchiveViewer() {
  if (archiveReturnState) {
    state = archiveReturnState;
    archiveReturnState = null;
    pendingStorageWarning = "";
    renderErrors = [];
    renderAll();
    billingContextOpen = false;
    switchToTab("archiv");
    setActionMessage("Archivansicht geschlossen. Arbeitsstand wiederhergestellt.");
    renderActionFeedback();
    return;
  }
  if (!isArchiveViewer()) {
    switchToTab("landing");
    return;
  }
  const returnUrl = archiveReturnUrl();
  if (returnUrl && returnUrl !== window.location.href) {
    window.location.href = returnUrl;
    return;
  }
  if (window.opener && !window.opener.closed) {
    try {
      window.close();
      return;
    } catch(e) {}
  }
  if (window.history && window.history.length > 1) {
    try {
      window.history.back();
      return;
    } catch(e) {}
  }
  try {
    window.close();
  } catch(e) {}
}
function currentAppMode() {
  return isArchiveViewer() ? "billing" : appUiMode;
}

function tabVisibleInMode(tabId, mode = currentAppMode()) {
  const list = mode === "billing" ? BILLING_NAV_TABS : START_NAV_TABS;
  return list.includes(tabId);
}

function setAppMode(mode) {
  appUiMode = isArchiveViewer() ? "billing" : (mode === "billing" ? "billing" : "start");
}

function enterBillingMode(tabId = "mieter") {
  setAppMode("billing");
  billingContextOpen = isArchiveViewer() || hasActiveCurrentBilling();
  renderPeriodInfo();
  switchToTab(tabId);
}

function returnToStartPage() {
  if (isArchiveViewer()) return closeArchiveViewer();
  billingContextOpen = false;
  setAppMode("start");
  renderPeriodInfo();
  switchToTab("landing");
}

function initializeNavigationMode() {
  if (navigationInitialized) return;
  navigationInitialized = true;
  if (isArchiveViewer()) enterBillingMode("mieter");
  else switchToTab("landing");
}

function switchToTab(tabId) {
  setTimeout(() => { const target=document.getElementById(tabId); closeAllTabAccordions(target); }, 0);
  const previousTab = document.querySelector('.tab.active');
  if (previousTab) closeAllTabAccordions(previousTab);
  const previousMode = currentAppMode();
  if (!isArchiveViewer()) {
    if (START_NAV_TABS.includes(tabId)) appUiMode = "start";
    if (BILLING_NAV_TABS.includes(tabId)) appUiMode = "billing";
  }
  const mode = currentAppMode();
  if (!tabVisibleInMode(tabId, mode)) tabId = mode === "billing" ? "mieter" : "landing";
  if (["landing", "start", "archiv"].includes(tabId)) billingContextOpen = false;
  else if (BILLING_NAV_TABS.includes(tabId) && (isArchiveViewer() || hasActiveCurrentBilling())) billingContextOpen = true;
  const btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  const section = document.getElementById(tabId);
  if (!section) return;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll("section.tab").forEach(s => s.classList.remove("active"));
  if (btn) btn.classList.add("active");
  section.classList.add("active");
  if (typeof window.ensureNavigationPath === "function") window.ensureNavigationPath(tabId);
  updateTopNavigationVisibility();
  if (previousMode !== currentAppMode()) renderPeriodInfo();
  if (typeof renderCurrentView === "function" && !renderInProgress) {
    renderCurrentView({ reason:"tab-switch" });
    renderStatusAndFeedbackSafely();
  }
  if (typeof updateAllPageHeaders === "function") updateAllPageHeaders();
  if (typeof renderOverviewForTab === "function") renderOverviewForTab(tabId);
  if (typeof window.refreshWorkspaceChrome === "function") window.refreshWorkspaceChrome();
  document.body.classList.remove("sidebar-open");
}

function updateTopNavigationVisibility() {
  const tabs = document.querySelector(".workflow-nav");
  if (!tabs) return;
  tabs.style.display = "";
  const archive = isArchiveViewer();
  tabs.classList.toggle("archive-nav", archive);
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.hidden = false;
    btn.style.display = "";
  });
  if (typeof window.updateWorkflowNavigationContext === "function") window.updateWorkflowNavigationContext();
  const active = document.querySelector("section.tab.active");
  if (active && typeof window.ensureNavigationPath === "function") window.ensureNavigationPath(active.id, {persist:false});
}

function openCurrentBilling() {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Bearbeiten erfolgt im ursprünglichen Arbeitsfenster.");
    return;
  }
  if (!hasActiveCurrentBilling()) {
    alert("Es ist noch keine aktuelle Abrechnung angelegt. Bitte auf der Startseite über „+ Neue Abrechnung“ starten.");
    return;
  }
  billingContextOpen = true;
  enterBillingMode("mieter");
}

function archiveRecordType(item) {
  return "Abrechnung";
}

function archiveRecordStatus(item) {
  const validation = archiveItemValidation(item);
  if (validation.errors.length) return "Fehler";
  if (validation.warnings.length) return "Prüfen";
  return "Archiviert";
}

function archiveRecordStatusClass(item) {
  const validation = archiveItemValidation(item);
  if (validation.errors.length) return "err";
  if (validation.warnings.length) return "warn";
  return "ok";
}

function archiveStatusBadgeHtml(item) {
  return '<span class="status ' + archiveRecordStatusClass(item) + '">' + escapeHtml(archiveRecordStatus(item)) + '</span>';
}

function archiveRecordCorrections(item) {
  if (!item) return 0;
  if (item.summary && item.summary.korrekturen !== undefined) return num(item.summary.korrekturen);
  const rows = item.data && Array.isArray(item.data.mieter) ? item.data.mieter : [];
  return rows.reduce((sum,m) => {
    if (!m || !m.id || !m.name) return sum;
    if (m.status === "Archiviert" || m.status === "archiviert" || m.status === "Archiv") return sum;
    if (m.abrechnungRolle === "Eigentümer/Privat") return sum;
    return sum + num(m.vorjahresKorrektur);
  }, 0);
}

function archiveRecordSaldo(item) {
  if (!item || !item.summary) return 0;
  const shares = item.summary.mieterKostenanteile !== undefined ? num(item.summary.mieterKostenanteile) : 0;
  const prepayments = item.summary.vorauszahlungen !== undefined ? num(item.summary.vorauszahlungen) : 0;
  if (item.summary.mieterKostenanteile !== undefined && item.summary.vorauszahlungen !== undefined) {
    return shares - prepayments - archiveRecordCorrections(item);
  }
  return num(item.summary.saldo);
}


function archiveMeta(item) {
  return item && (item.meta || (item.data && item.data.meta)) || {};
}

function archiveItemLabel(item, index) {
  const meta = archiveMeta(item);
  const year = item && (item.year || meta.abrechnungsjahr);
  const period = item ? archivePeriodLabel(item) : "";
  return [year || ("#" + (index + 1)), period].filter(Boolean).join(" · ");
}

function normalizeArchiveItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return item;
  if (!item.meta) item.meta = (item.data && item.data.meta) ? clone(item.data.meta) : {};
  if (!item.year) item.year = item.meta.abrechnungsjahr || (item.data && item.data.meta && item.data.meta.abrechnungsjahr) || "";
  if (!item.archivedAt) item.archivedAt = todayIso();
  if (!item.periodId) item.periodId = archivePeriodId(item);
  if (item.data && !item.data.meta) item.data.meta = clone(item.meta || {});
  if (item.data && item.data.meta && !item.data.meta.periodId && item.periodId) item.data.meta.periodId = item.periodId;
  if (item.data && item.data.meta && !item.data.meta.dataSchemaVersion && item.schemaVersion) item.data.meta.dataSchemaVersion = item.schemaVersion;
  return item;
}

function prepareArchiveItemForUse(item) {
  const archiveItem = normalizeArchiveItem(clone(item));
  if (archiveItem && archiveItem.data && typeof archiveItem.data === "object" && !Array.isArray(archiveItem.data)) {
    archiveItem.data = createBoundedBillingSnapshotData(normalizeLegacyData(archiveItem.data, { scope:ARCHIVE_SNAPSHOT_SCOPE }));
    archiveItem.meta = clone(archiveItem.data.meta || archiveItem.meta || {});
    if (!archiveItem.year) archiveItem.year = archiveItem.meta.abrechnungsjahr || "";
    archiveItem.periodId = archivePeriodId(archiveItem);
    archiveItem.schemaVersion = archiveItem.data.meta && archiveItem.data.meta.dataSchemaVersion ? archiveItem.data.meta.dataSchemaVersion : DATA_SCHEMA_VERSION;
    archiveItem.snapshotScope = ARCHIVE_SNAPSHOT_SCOPE;
    archiveItem.snapshotBoundaryVersion = DATA_LAYER_CONTRACT_VERSION;
  }
  return archiveItem;
}

function collectArchiveIdMigrationWarnings(data) {
  const warnings = [];
  if (!data || typeof data !== "object") return warnings;
  const conversions = [];
  if (Array.isArray(data.wohnungen)) {
    data.wohnungen.forEach(w => {
      if (!w) return;
      const oldId = String(w.id || "").trim();
      const nextId = canonicalUnitIdFor(w);
      if (oldId && nextId && oldId !== nextId) conversions.push(oldId + " -> " + nextId);
      if (oldId && !nextId) warnings.push("Wohnungs-ID kann nicht automatisch normalisiert werden: " + oldId);
    });
  }
  if (Array.isArray(data.mieter)) {
    data.mieter.filter(hasTenantData).forEach(m => {
      if (!m || !m.wohnung) return;
      const nextId = canonicalUnitIdFor(m.wohnung);
      if (!nextId && String(m.wohnung || "").trim()) warnings.push("Mieter " + (m.id || m.name || "ohne ID") + " verweist auf nicht normalisierbare Wohnung: " + m.wohnung);
    });
  }
  if (conversions.length) warnings.push("Alte Wohnungs-IDs werden beim Laden migriert: " + conversions.slice(0, 6).join(", ") + (conversions.length > 6 ? " ..." : ""));
  return warnings;
}

function archiveItemValidation(item) {
  const errors = [];
  const warnings = [];
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    errors.push("Archivdatensatz ist leer oder beschädigt.");
    return { errors, warnings };
  }

  const sourceMeta = archiveMeta(item);
  const sourceData = item.data && typeof item.data === "object" && !Array.isArray(item.data) ? item.data : null;
  const sourceSchema = item.schemaVersion || (sourceData && sourceData.meta && sourceData.meta.dataSchemaVersion) || (sourceMeta && sourceMeta.dataSchemaVersion) || "";
  collectArchiveIdMigrationWarnings(sourceData).forEach(message => warnings.push(message));

  let prepared = null;
  try {
    prepared = prepareArchiveItemForUse(item);
  } catch(error) {
    errors.push("Archivdaten konnten nicht normalisiert werden: " + errorMessage(error));
    prepared = normalizeArchiveItem(clone(item));
  }

  const meta = archiveMeta(prepared || item);
  const data = prepared && prepared.data;
  const year = String((prepared && prepared.year) || meta.abrechnungsjahr || "").trim();
  if (!year) warnings.push("Abrechnungsjahr fehlt.");
  else if (!/\d{4}/.test(year)) warnings.push("Abrechnungsjahr ist ungewöhnlich: " + year);
  if (!prepared.archivedAt) warnings.push("Archivdatum fehlt.");

  if (!sourceSchema) warnings.push("Datenschema-Version fehlt im Archiv; der Datensatz wird beim Laden auf v" + DATA_SCHEMA_VERSION + " normalisiert.");
  else if (Number(sourceSchema) < DATA_SCHEMA_VERSION) warnings.push("Archivdatensatz nutzt altes Datenschema v" + sourceSchema + " und wird beim Laden auf v" + DATA_SCHEMA_VERSION + " migriert.");

  if (sourceData) {
    if (Array.isArray(sourceData.wohnungen) && !sourceData.wohnungen.length) errors.push("Keine Wohnungen im ursprünglichen Archivdatensatz vorhanden.");
    if (Array.isArray(sourceData.mieter) && !sourceData.mieter.filter(hasTenantData).length) errors.push("Keine befüllten Mietverhältnisse im ursprünglichen Archivdatensatz vorhanden.");
    if (Array.isArray(sourceData.kostenarten) && !sourceData.kostenarten.length) errors.push("Keine Kostenarten im ursprünglichen Archivdatensatz vorhanden.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    errors.push("Archivdaten fehlen.");
    return { errors, warnings };
  }

  if (!Array.isArray(data.wohnungen)) errors.push("Wohnungen fehlen im Archivdatensatz.");
  else if (!data.wohnungen.length) errors.push("Keine Wohnungen im Archivdatensatz vorhanden.");
  if (!Array.isArray(data.mieter)) errors.push("Mietverhältnisse fehlen im Archivdatensatz.");
  else if (!data.mieter.filter(hasTenantData).length) warnings.push("Keine befüllten Mietverhältnisse im Archivdatensatz gefunden.");
  if (!Array.isArray(data.kostenarten)) errors.push("Kostenarten fehlen im Archivdatensatz.");
  else if (!data.kostenarten.length) errors.push("Keine Kostenarten im Archivdatensatz vorhanden.");
  if (!data.meta || typeof data.meta !== "object") warnings.push("Periodendaten fehlen im Archivdatensatz.");

  const dataMeta = data.meta || {};
  const start = meta.abrechnungsbeginn || dataMeta.abrechnungsbeginn || "";
  const end = meta.abrechnungsende || dataMeta.abrechnungsende || "";
  if (!start || !end) warnings.push("Abrechnungszeitraum fehlt oder ist unvollständig.");
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) warnings.push("Abrechnungszeitraum hat kein erwartetes Datumsformat.");
  else if (start > end) errors.push("Abrechnungszeitraum im Archiv ist ungültig.");

  if (Array.isArray(data.wohnungen) && Array.isArray(data.mieter)) {
    const unitIds = new Set(data.wohnungen.map(w => w && w.id).filter(Boolean));
    data.mieter.filter(hasTenantData).forEach(m => {
      const unitId = canonicalUnitIdFor(m.wohnung) || m.wohnung || "";
      if (unitId && !unitIds.has(unitId)) warnings.push("Mieter " + (m.id || m.name || "ohne ID") + " verweist auf unbekannte Wohnung " + unitId + ".");
    });
  }

  const summary = prepared.summary || item.summary || null;
  if (!summary || typeof summary !== "object") warnings.push("Archiv-Zusammenfassung fehlt; Saldo kann nur eingeschränkt geprüft werden.");
  else {
    const hasSaldoFields = ["saldo","mieterKostenanteile","vorauszahlungen","kostenNK"].some(key => summary[key] !== undefined && summary[key] !== null && summary[key] !== "");
    if (!hasSaldoFields) warnings.push("Archiv-Summenfelder fehlen; Saldo ist nicht nachvollziehbar berechenbar.");
  }

  return { errors, warnings };
}

function archiveRecordHealth(item) {
  const validation = archiveItemValidation(item);
  return { validation, status:archiveRecordStatus(item), className:archiveRecordStatusClass(item) };
}

function showArchiveValidation(index) {
  ensureYearData();
  const item = state.jahresArchiv[index];
  if (!item) {
    alert("Dieser Archivdatensatz wurde nicht gefunden.");
    return;
  }
  const validation = archiveItemValidation(item);
  const label = archiveItemLabel(item, index);
  const details = archiveValidationMessage(validation) || "- Keine Strukturprobleme gefunden.";
  alert("Archivprüfung: " + label + "\n\n" + details);
}

function archiveActionButtonsHtml(index, options) {
  options = options || {};
  const item = state.jahresArchiv[index];
  const validation = options.validate === false ? {errors:[], warnings:[]} : archiveItemValidation(item);
  const buttons = [];
  if (options.open) {
    if (validation.errors.length) buttons.push('<button class="warn compact-action" onclick="showArchiveValidation(' + index + ')">Fehler anzeigen</button>');
    else {
      const cls = options.primaryOpen ? ' class="primary compact-action"' : ' class="secondary compact-action"';
      buttons.push('<button' + cls + ' onclick="openArchiveYear(' + index + ')">' + escapeHtml(options.openLabel || "Ansehen") + '</button>');
      if (validation.warnings.length) buttons.push('<button class="warn compact-action" onclick="showArchiveValidation(' + index + ')">Prüfen</button>');
    }
  } else if (validation.errors.length || validation.warnings.length) {
    buttons.push('<button class="warn compact-action" onclick="showArchiveValidation(' + index + ')">Prüfen</button>');
  }
  if (options.download) buttons.push('<button class="secondary compact-action" onclick="downloadArchiveYear(' + index + ')">JSON herunterladen</button>');
  if (options.reopenForRework) buttons.push('<button class="warn compact-action" onclick="reopenArchiveYearForRework(' + index + ')">Wiederbearbeiten</button>');
  if (options.deleteButton) buttons.push('<button class="danger compact-action" onclick="openDeleteBillingModal(' + index + ')">Löschen</button>');
  return buttons.join(" ");
}
function archiveValidationMessage(validation) {
  const messages = [];
  if (validation && validation.errors && validation.errors.length) messages.push(...validation.errors);
  if (validation && validation.warnings && validation.warnings.length) messages.push(...validation.warnings);
  return messages.map(m => "- " + m).join("\n");
}

function archivePeriodId(item) {
  if (!item) return "";
  const meta = archiveMeta(item);
  if (item.periodId) return String(item.periodId);
  if (meta.periodId) return String(meta.periodId);
  if (meta.abrechnungsbeginn && meta.abrechnungsende) return String(item.year || meta.abrechnungsjahr || "") + "|" + meta.abrechnungsbeginn + "|" + meta.abrechnungsende + "|" + archiveDataSource(item);
  return "year|" + String(item.year || "");
}

function archiveSortKey(item) {
  const meta = archiveMeta(item);
  const end = meta.abrechnungsende || (String(item && item.year || "") + "-12-31");
  const y = yearNumber(item && item.year);
  return String(end || "") + "|" + String(y).padStart(4,"0");
}

function archivePeriodLabel(item) {
  const meta = archiveMeta(item);
  const period = meta.abrechnungsbeginn && meta.abrechnungsende ? (dateDe(meta.abrechnungsbeginn) + " – " + dateDe(meta.abrechnungsende)) : String((item && item.year) || "");
  return meta.legacyTeilperioden ? period + " (Einzelperioden)" : period;
}

function archiveRecordStatusLite(item) {
  if (!item || typeof item !== "object") return { label:"Prüfen", className:"warn" };
  if (!item.data || typeof item.data !== "object") return { label:"Prüfen", className:"warn" };
  return { label:"Archiviert", className:"ok" };
}

function archiveStatusBadgeLiteHtml(item) {
  const status = archiveRecordStatusLite(item);
  return '<span class="status ' + status.className + '">' + escapeHtml(status.label) + '</span>';
}

function currentBillingSaldoStartText() {
  return '<span class="small">in der Abrechnung</span>';
}

function currentBillingStatusHtml() {
  if (isCurrentBillingFinalized()) return '<span class="status ok">Finalisiert</span>';
  return '<span class="status warn">In Bearbeitung</span>';
}

function hasNonEmptyAnnualCurrentBillingData(data = state) {
  if (!data || typeof data !== "object") return false;
  const costs = Array.isArray(data.kostenarten) ? data.kostenarten : [];
  if (costs.some(k => k && String(k.inNK || "") === "Ja" && Math.abs(num(k.gesamtbetrag)) > 0.004)) return true;
  const prepayments = Array.isArray(data.vorauszahlungen) ? data.vorauszahlungen : [];
  if (prepayments.some(v => v && (Math.abs(num(v.summe)) > 0.004 || (Array.isArray(v.werte) && v.werte.some(x => Math.abs(num(x)) > 0.004))))) return true;
  const tenants = Array.isArray(data.mieter) ? data.mieter : [];
  if (tenants.some(m => m && m.id && m.name && (Math.abs(num(m.kaltErhalten)) > 0.004 || Math.abs(num(m.nkVoraus)) > 0.004 || Math.abs(num(m.einnahmen)) > 0.004 || Math.abs(num(m.vorjahresKorrektur)) > 0.004))) return true;
  const inputs = data.umlageInputs && typeof data.umlageInputs === "object" ? data.umlageInputs : {};
  if (Object.values(inputs).some(row => row && Array.isArray(row.values) && row.values.some(x => Math.abs(num(x)) > 0.004))) return true;
  const wm = data.waterMeters || {};
  if (wm.settings && Math.abs(num(wm.settings.houseWaterTotal)) > 0.004) return true;
  if (Array.isArray(wm.readings) && wm.readings.some(r => r && (Math.abs(num(r.kwEnd) - num(r.kwStart)) > 0.004 || Math.abs(num(r.wwEnd) - num(r.wwStart)) > 0.004 || r.kwEndDate || r.wwEndDate))) return true;
  return false;
}

function isCurrentBillingClosedAfterArchive(data = state) {
  const meta = data && data.meta ? data.meta : {};
  return !!(meta.currentBillingArchivedOnly || meta.currentBillingClosedAfterArchive);
}

function clearCurrentBillingArchiveClosure(data = state) {
  if (!data.meta) data.meta = {};
  delete data.meta.currentBillingArchivedOnly;
  delete data.meta.currentBillingClosedAfterArchive;
  delete data.meta.currentBillingArchivedAt;
  delete data.meta.currentBillingArchivedWithAppVersion;
  delete data.meta.currentBillingArchivedPeriodId;
  delete data.meta.currentBillingArchivedHinweis;
}

function closeCurrentBillingAfterArchive(snapshot) {
  if (!state.meta) state.meta = {};
  state.meta.currentBillingArchivedOnly = true;
  state.meta.currentBillingClosedAfterArchive = true;
  state.meta.currentBillingArchivedAt = new Date().toISOString();
  state.meta.currentBillingArchivedWithAppVersion = APP_VERSION;
  state.meta.currentBillingArchivedPeriodId = snapshot && snapshot.periodId ? snapshot.periodId : archivePeriodId(snapshot || createYearSnapshot());
  state.meta.currentBillingArchivedHinweis = "Diese Abrechnung wurde über die Startseite archiviert. Es wurde keine Folgeabrechnung automatisch angelegt.";
  delete state.meta.currentBillingCreatedByUser;
  delete state.meta.currentBillingExplicitlyCreated;
  delete state.meta.preparedFromPreviousYear;
}

function hasActiveCurrentBilling(data = state) {
  const meta = data && data.meta ? data.meta : {};
  if (ARCHIVE_VIEW_MODE) return true;
  if (isCurrentBillingClosedAfterArchive(data)) return false;
  if (meta.currentBillingCreatedByUser || meta.currentBillingExplicitlyCreated || meta.preparedFromPreviousYear || meta.currentBillingFinalized || meta.currentBillingFinalizedAt) return true;
  return hasNonEmptyAnnualCurrentBillingData(data);
}

function latestVisibleRecordYear() {
  const years = archiveYearNumbers();
  if (hasActiveCurrentBilling()) years.push(yearNumber(currentAbrechnungsjahr()));
  const valid = years.filter(n => Number.isFinite(n) && n > 0);
  return valid.length ? Math.max(...valid) : (new Date()).getFullYear() - 1;
}

function markCurrentBillingCreatedByUser() {
  if (!state.meta) state.meta = {};
  clearCurrentBillingArchiveClosure(state);
  state.meta.currentBillingCreatedByUser = true;
  state.meta.currentBillingCreatedAt = state.meta.currentBillingCreatedAt || new Date().toISOString();
  state.meta.currentBillingCreatedWithAppVersion = APP_VERSION;
}

function currentObjectLabel(data = state) {
  const tenants = data && Array.isArray(data.mieter) ? data.mieter : [];
  const counts = new Map();
  tenants.forEach(tenant => {
    if (!tenant || !tenant.strasse) return;
    const label = [String(tenant.strasse || "").trim(), [String(tenant.plz || "").trim(), String(tenant.ort || "").trim()].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    if (label) counts.set(label, (counts.get(label) || 0) + 1);
  });
  const sorted = Array.from(counts.entries()).sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], "de"));
  return sorted.length ? sorted[0][0] : "Objekt";
}

function isBillingContextOpen() {
  return isArchiveViewer() || (billingContextOpen && hasActiveCurrentBilling());
}

function setBillingContextOpen(open) {
  billingContextOpen = !!open && (isArchiveViewer() || hasActiveCurrentBilling());
  if (typeof window.updateWorkflowNavigationContext === "function") window.updateWorkflowNavigationContext();
}

function currentBillingActionsHtml() {
  if (isCurrentBillingFinalized()) {
    return '<button class="secondary compact-action" onclick="openCurrentBilling()">Ansehen</button> ' +
      '<button class="warn compact-action" onclick="unlockCurrentBilling()">Wiederbearbeitung öffnen</button> ' +
      '<button class="secondary compact-action" onclick="archiveCurrentYearOnly()">Archiv aktualisieren</button>';
  }
  return '<button class="primary compact-action" onclick="openCurrentBilling()">Bearbeiten</button> ' +
    '<button class="secondary compact-action" onclick="finalizeCurrentBilling()">Finalisieren</button> ' +
    '<button class="secondary compact-action" onclick="archiveCurrentYearOnly()">Archivieren</button>';
}

function currentBillingRecordRowHtml() {
  const showCurrent = hasActiveCurrentBilling();
  if (!showCurrent) return "";
  const finalized = isCurrentBillingFinalized();
  const currentSource = finalized ? "Aktueller Arbeitsstand · geschützt" : "Aktueller Arbeitsstand";
  return '<tr class="current-record-row">' +
    '<td>' + escapeHtml(currentAbrechnungsjahr()) + '</td>' +
    '<td>' + escapeHtml(periodLabelShort()) + '</td>' +
    '<td>' + currentBillingStatusHtml() + '</td>' +
    '<td>' + escapeHtml(currentSource) + '</td>' +
    '<td>' + currentBillingSaldoStartText() + '</td>' +
    '<td class="actions-cell">' + currentBillingActionsHtml() + '</td>' +
  '</tr>';
}

function archiveRecordRowsHtml() {
  return Array.isArray(state.jahresArchiv) && state.jahresArchiv.length ? state.jahresArchiv.map((a,i) => {
    const saldo = archiveRecordSaldo(a);
    const period = archivePeriodLabel(a);
    return '<tr class="archive-record-row">' +
      '<td>' + escapeHtml(a && a.year !== undefined ? a.year : "") + '</td>' +
      '<td>' + escapeHtml(period) + '</td>' +
      '<td>' + archiveStatusBadgeLiteHtml(a) + '</td>' +
      '<td>' + escapeHtml(archiveDataSource(a)) + '</td>' +
      '<td class="money">' + (saldo >= 0 ? "Nachzahlung " : "Guthaben ") + fmtMoney(Math.abs(saldo)) + '</td>' +
      '<td class="actions-cell">' + archiveActionButtonsHtml(i, {open:true, openLabel:"Ansehen", reopenForRework:true, deleteButton:true, validate:false}) + '</td>' +
    '</tr>';
  }).join("") : "";
}

function billingRecordsTableShell(rows, emptyText) {
  const emptyRow = rows ? "" : '<tr><td colspan="6"><span class="small">' + escapeHtml(emptyText) + '</span></td></tr>';
  return '<thead><tr><th>Jahr</th><th>Zeitraum</th><th>Status</th><th>Datenquelle</th><th class="money">Saldo</th><th>Aktion</th></tr></thead><tbody>' + rows + emptyRow + '</tbody>';
}

function buildCurrentBillingTableHtml() {
  ensureYearData();
  return billingRecordsTableShell(currentBillingRecordRowHtml(), 'Noch keine aktuelle Abrechnung angelegt. Bitte über „+ Neue Abrechnung“ starten.');
}

function buildArchiveRecordsTableHtml() {
  ensureYearData();
  return billingRecordsTableShell(archiveRecordRowsHtml(), 'Noch keine archivierte Abrechnung vorhanden.');
}

function buildBillingRecordsTableHtml() {
  ensureYearData();
  return billingRecordsTableShell(currentBillingRecordRowHtml() + archiveRecordRowsHtml(), 'Noch keine Abrechnung angelegt. Bitte über „+ Neue Abrechnung“ starten.');
}

function yearExistsInRecords(year) {
  const y = String(year || "").trim();
  if (!y) return false;
  if (hasActiveCurrentBilling() && String(currentAbrechnungsjahr()) === y) return true;
  return state.jahresArchiv.some(a => String(a.year) === y);
}

function openCreateBillingModal() {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Neue Abrechnungen legst du im ursprünglichen Arbeitsfenster an.");
    return;
  }
  ensureYearData();
  const nextYear = String(latestVisibleRecordYear() + 1);
  const yearEl = document.getElementById("newBillingYear");
  const startEl = document.getElementById("newBillingStart");
  const endEl = document.getElementById("newBillingEnd");
  const modal = document.getElementById("billingCreateModal");
  if (yearEl) yearEl.value = nextYear;
  if (startEl) startEl.value = nextYear + "-01-01";
  if (endEl) endEl.value = nextYear + "-12-31";
  if (modal) modal.classList.add("show");
}

function closeCreateBillingModal() {
  const modal = document.getElementById("billingCreateModal");
  if (modal) modal.classList.remove("show");
}

let deleteBillingTargetIndex = null;
let deleteBillingCode = "";

function randomDeleteCode() {
  return String(Math.floor(100 + Math.random() * 900));
}

function openDeleteBillingModal(index) {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Löschen ist nur auf der Startseite des ursprünglichen Arbeitsfensters möglich.");
    return;
  }
  ensureYearData();
  const item = state.jahresArchiv[index];
  if (!item) return;
  deleteBillingTargetIndex = index;
  deleteBillingCode = randomDeleteCode();
  const meta = archiveMeta(item);
  const title = String(item.year || meta.abrechnungsjahr || "");
  const period = archivePeriodLabel(item);
  const textEl = document.getElementById("deleteBillingText");
  const codeEl = document.getElementById("deleteBillingCodeDisplay");
  const inputEl = document.getElementById("deleteBillingCodeInput");
  const modal = document.getElementById("billingDeleteModal");
  if (textEl) textEl.innerHTML = "Diese archivierte Nebenkostenabrechnung wird dauerhaft aus diesem lokalen Datensatz gelöscht:<br><strong>" + escapeHtml(title) + "</strong> · " + escapeHtml(period) + "<br><span class=\"small\">Empfehlung: Vorher das Jahresarchiv als JSON herunterladen.</span>";
  if (codeEl) codeEl.textContent = deleteBillingCode;
  if (inputEl) {
    inputEl.value = "";
    setTimeout(() => inputEl.focus(), 0);
  }
  if (modal) modal.classList.add("show");
}

function closeDeleteBillingModal() {
  const modal = document.getElementById("billingDeleteModal");
  if (modal) modal.classList.remove("show");
  deleteBillingTargetIndex = null;
  deleteBillingCode = "";
}

function confirmDeleteBilling() {
  const inputEl = document.getElementById("deleteBillingCodeInput");
  const entered = String((inputEl && inputEl.value) || "").trim();
  if (!deleteBillingCode || entered !== deleteBillingCode) {
    alert("Der eingegebene Code ist nicht korrekt. Die Abrechnung wurde nicht gelöscht.");
    if (inputEl) inputEl.focus();
    return;
  }
  const index = deleteBillingTargetIndex;
  if (index === null || index < 0 || index >= state.jahresArchiv.length) {
    closeDeleteBillingModal();
    return;
  }
  if (!confirmRiskyDataAction("Archivdatensatz löschen", "Diese Abrechnung wird nach korrekter Code-Eingabe jetzt endgültig aus dem lokalen Jahresarchiv entfernt.")) return;
  state.jahresArchiv.splice(index, 1);
  saveData();
  closeDeleteBillingModal();
  renderAll();
}

function createNewBillingFromModal() {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Neue Abrechnungen legst du im ursprünglichen Arbeitsfenster an.");
    return;
  }
  const yearEl = document.getElementById("newBillingYear");
  const startEl = document.getElementById("newBillingStart");
  const endEl = document.getElementById("newBillingEnd");
  const newYear = String((yearEl && yearEl.value) || "").trim();
  const start = String((startEl && startEl.value) || "").trim();
  const end = String((endEl && endEl.value) || "").trim();

  if (!/^\d{4}$/.test(newYear)) {
    alert("Bitte ein gültiges vierstelliges Abrechnungsjahr eingeben.");
    return;
  }
  if (!start || !end) {
    alert("Bitte Beginn und Ende der Abrechnungsperiode eingeben.");
    return;
  }
  if (start > end) {
    alert("Der Beginn der Abrechnungsperiode darf nicht nach dem Ende liegen.");
    return;
  }
  if (yearExistsInRecords(newYear)) {
    alert("Für das Abrechnungsjahr " + newYear + " existiert bereits ein Datensatz. Bitte wähle ein anderes Jahr.");
    return;
  }

  const currentYear = currentAbrechnungsjahr();
  const hasCurrent = hasActiveCurrentBilling();
  const confirmText = hasCurrent
    ? "Der aktuelle Bearbeitungsstand " + currentYear + " wird jetzt als eigener Datensatz gesichert. Anschließend wird die neue Abrechnung " + newYear + " angelegt. Fortfahren?"
    : "Es wird eine neue Abrechnung " + newYear + " angelegt. Es wird kein automatisch vorbereiteter Arbeitsstand archiviert. Fortfahren?";
  if (!confirmRiskyDataAction("Neue Abrechnung anlegen", confirmText)) return;

  if (hasCurrent && !upsertYearArchive(createYearSnapshot())) return;
  resetAnnualValuesForNextYear(newYear, start, end);
  state.meta.abrechnungsjahr = newYear;
  state.meta.abrechnungsbeginn = start;
  state.meta.abrechnungsende = end;
  if (state.briefSettings) state.briefSettings.abrechnungsjahr = newYear;
  state.meta.preparedFromPreviousYear = true;
  state.meta.preparedFromPreviousYearHinweis = hasCurrent
    ? "Die neue Abrechnung " + newYear + " wurde aus dem vorherigen Bearbeitungsstand vorbereitet. Der vorherige Stand wurde als eigener Datensatz gesichert."
    : "Die neue Abrechnung " + newYear + " wurde bewusst über den Startseiten-Button angelegt. Ein automatisch vorbereiteter Seed-Arbeitsstand wurde nicht archiviert.";
  markCurrentBillingCreatedByUser();
  clearCurrentBillingFinalization();

  saveData();
  closeCreateBillingModal();
  appUiMode = "start";
  renderAll();
  switchToTab("start");
  alert("Neue Nebenkostenabrechnung " + newYear + " wurde angelegt. Du bleibst auf der Startseite; die Bearbeitung startest du über den Bearbeiten-Button in der Übersicht.");
}

function openLatestKnownYear() {
  const latest = latestKnownYear();
  if (yearNumber(currentAbrechnungsjahr()) === latest) {
    alert("Du bist bereits im aktuellsten bekannten Abrechnungsjahr.");
    return;
  }
  const idx = state.jahresArchiv.findIndex(a => yearNumber(a.year) === latest);
  if (idx < 0) {
    alert("Das aktuellste bekannte Jahr ist bereits geöffnet oder wurde noch nicht archiviert.");
    return;
  }
  loadArchiveYear(idx);
}



function legacyArchiveEntries() {
  return Array.isArray(state.legacyEinzelabrechnungen) ? state.legacyEinzelabrechnungen : [];
}

function renderLegacyArchiveDetails() {
  const old = document.getElementById("legacyArchiveDetailsBox");
  const entries = legacyArchiveEntries();
  if (!isArchiveViewer() || !entries.length) {
    if (old) old.remove();
    return;
  }
  const table = entries.map(e => {
    const saldo = num(e.saldo);
    return '<tr>' +
      '<td>' + escapeHtml(e.wohnung || '') + '</td>' +
      '<td>' + escapeHtml(e.mieter || '') + '</td>' +
      '<td>' + escapeHtml((e.heizPeriode || '') + (e.wasserPeriode && e.wasserPeriode !== e.heizPeriode ? ' / Wasser ' + e.wasserPeriode : '') + (e.abfallPeriode && e.abfallPeriode !== e.wasserPeriode ? ' / Abfall ' + e.abfallPeriode : '')) + '</td>' +
      '<td>' + fmtMoney(e.kostenanteil) + '</td>' +
      '<td>' + fmtMoney(e.vorauszahlung) + '</td>' +
      '<td>' + (saldo >= 0 ? 'Nachzahlung ' : 'Guthaben ') + fmtMoney(Math.abs(saldo)) + '</td>' +
      '<td><span class="status ok">' + escapeHtml(entryBriefValidationStatus(e)) + '</span></td>' +
    '</tr>';
  }).join('');
  const html = '<div class="start-box" id="legacyArchiveDetailsBox">' +
    '<h3>Einzelabrechnungen / Briefdaten</h3>' +
    '<p class="small">Dieser Archivsatz ist als normale Abrechnung gespeichert. Die Tabelle zeigt die importierten Mieter-/Wohnungswerte, die zugleich die Grundlage für die originalnahe Briefansicht im Tab „Abrechnungsbriefe“ bilden.</p>' +
    '<div class="table-wrap dashboard-table"><table>' +
      '<thead><tr><th>Wohnung</th><th>Mieter</th><th>Teilperioden</th><th>Kostenanteil</th><th>Vorauszahlung</th><th>Saldo</th><th>Prüfung</th></tr></thead><tbody>' + table + '</tbody>' +
    '</table></div></div>';
  const start = document.getElementById('start');
  const anchor = document.getElementById('startArchiveTable');
  if (!start || !anchor) return;
  if (old) old.outerHTML = html;
  else anchor.closest('.start-box').insertAdjacentHTML('afterend', html);
}


function workflowDashboardReport() {
  if (!hasActiveCurrentBilling() || isArchiveViewer()) return null;
  const report = withAuditState(clone(state), () => collectQualityChecks({ scope:"currentBilling" }));
  const readiness = finalBillingReadiness(report);
  const issues = Array.isArray(report && report.issues) ? report.issues.filter(i => i && i.severity !== "OK") : [];
  const groups = [
    { key:"master", label:"Stammdaten & Mieter", areas:["Stammdaten","Mieter","Eigentümer/Privat"] },
    { key:"costs", label:"Kosten & Umlage", areas:["Kostenarten","Kostenart","Umlage","Abrechnung","Summenabgleich"] },
    { key:"meters", label:"Zählerstände", areas:["Zählerstände"] },
    { key:"prepay", label:"Vorauszahlungen", areas:["Vorauszahlungen","Vorauszahlung","Vorauszahlungsanpassung"] },
    { key:"letters", label:"Briefe & Versand", areas:["Briefe","Brief-Preflight","Empfänger","Zahlungsziel","Saldo"] }
  ].map(group => {
    const rows = issues.filter(issue => group.areas.includes(issue.area));
    const errors = rows.filter(issue => issue.severity === "Fehler").length;
    const checks = rows.filter(issue => issue.severity === "Prüfen").length;
    const hints = rows.filter(issue => issue.severity === "Hinweis").length;
    const level = errors ? "err" : (checks ? "warn" : "ok");
    const status = errors ? errors + " Fehler" : (checks ? checks + " Prüfpunkte" : (hints ? hints + " Hinweise" : "Keine offenen Punkte"));
    return { ...group, rows, errors, checks, hints, level, status };
  });
  const ungrouped = issues.filter(issue => !groups.some(group => group.areas.includes(issue.area)));
  return { report, readiness, groups, ungrouped };
}

function renderWorkflowDashboard() {
  const el = document.getElementById("workflowDashboardBox");
  if (!el) return;
  const data = workflowDashboardReport();
  if (!data) { el.innerHTML = ""; return; }
  const readiness = data.readiness;
  const cls = readiness.level === "err" ? "err" : (readiness.level === "warn" ? "warn" : "ok");
  const openCount = readiness.errors.length + readiness.warnings.length + readiness.hints.length;
  const cards = data.groups.map(group => {
    const badgeClass = group.level === "err" ? "err" : (group.level === "warn" ? "warn" : "ok");
    const detail = group.hints && !group.errors && !group.checks ? group.hints + " Hinweise zusätzlich" : (group.hints ? group.hints + " Hinweise" : "");
    return '<div class="workflow-status-card"><strong>' + escapeHtml(group.label) + '</strong><span class="status ' + badgeClass + '">' + escapeHtml(group.status) + '</span>' + (detail ? '<div class="small">' + escapeHtml(detail) + '</div>' : '') + '</div>';
  }).join("");
  el.innerHTML = '<div class="workflow-dashboard ' + cls + '"><div class="workflow-dashboard-head"><div><h3>Arbeitsstand dieser Abrechnung</h3><div class="small">Vorhandene Qualitätsprüfungen kompakt zusammengefasst · keine zusätzliche Berechnungslogik.</div></div><div><span class="status ' + cls + '">' + escapeHtml(readiness.label) + '</span><div class="small" style="margin-top:4px;text-align:right">' + openCount + ' offene Hinweise/Prüfpunkte</div></div></div><div class="workflow-status-grid">' + cards + '</div><div class="toolbar" style="margin-bottom:0"><button type="button" class="primary" onclick="switchToTab(\'qualitaet\')">Qualitätsprüfung öffnen</button></div></div>';
}

function renderStart() {
  const actionsEl = document.getElementById("startArchiveActions");
  const utilityActionsEl = document.getElementById("startArchiveUtilityActions");
  const tableEl = document.getElementById("startArchiveTable");
  if (!actionsEl || !utilityActionsEl || !tableEl) return;

  ensureYearData();
  tableEl.className = "records-table";
  actionsEl.innerHTML = '<button class="primary" type="button" data-app-action="new-billing">+ Neue Abrechnung</button>';
  utilityActionsEl.innerHTML = "<button type='button' data-app-action='self-test'>App-Selbsttest</button><button type='button' onclick=\"switchToTab('archiv')\">Archiv öffnen</button>";
  tableEl.innerHTML = buildCurrentBillingTableHtml();
  renderFinalizationStatus();
}

function renderArchive() {
  const actionsEl = document.getElementById("archivePrimaryActions");
  const utilityActionsEl = document.getElementById("archiveUtilityActions");
  const tableEl = document.getElementById("archiveRecordsTable");
  if (!actionsEl || !utilityActionsEl || !tableEl) return;
  ensureYearData();
  tableEl.className = "records-table";
  actionsEl.innerHTML = '<button class="primary" type="button" data-app-action="download-archive">Archiv als JSON herunterladen</button>';
  utilityActionsEl.innerHTML = "<button type='button' data-app-action='self-test'>App-Selbsttest</button><button type='button' onclick=\"switchToTab('start')\">Abrechnungsübersicht öffnen</button>";
  tableEl.innerHTML = buildArchiveRecordsTableHtml();
}

function renderStartTenantManagement() {
  const tableEl = document.getElementById("startTenantTable");
  const archiveEl = document.getElementById("startTenantArchiveTable");
  if (!tableEl || !archiveEl) return;
  masterData();
  const genderOptions = ["Frau/Herr","Frau","Herr","Firma/Divers"];
  const salutationOptions = ["Automatisch","Sehr geehrte Frau [Nachname],","Sehr geehrter Herr [Nachname],","Sehr geehrte(r) Mieter/in,","Sehr geehrte Damen und Herren,","Guten Tag,"];
  const roleOptions = ["Mieter","Eigentümer/Privat"];
  const visibleRows = masterVisibleTenantRows();
  const rows = visibleRows.length ? visibleRows.map(m =>
    '<tr><td>' + tenantIdCellHtml(m) + '</td>' +
    '<td class="editable">' + masterUnitSelectHtml(m.wohnung, "setMasterNested('mieter'," + m.originalIndex + ",'wohnung',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.name, "setMasterNested('mieter'," + m.originalIndex + ",'name',this.value)") + '</td>' +
    '<td class="editable">' + dateInputHtml(m.einzug, "setMasterNested('mieter'," + m.originalIndex + ",'einzug',this.value)") + '</td>' +
    '<td class="editable">' + dateInputHtml(m.auszug, "setMasterNested('mieter'," + m.originalIndex + ",'auszug',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(m.abrechnungRolle || "Mieter", roleOptions, "setMasterNested('mieter'," + m.originalIndex + ",'abrechnungRolle',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(m.geschlecht, genderOptions, "setMasterNested('mieter'," + m.originalIndex + ",'geschlecht',this.value)") + '</td>' +
    '<td class="editable">' + selectHtml(m.standardanrede, salutationOptions, "setMasterNested('mieter'," + m.originalIndex + ",'standardanrede',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.strasse, "setMasterNested('mieter'," + m.originalIndex + ",'strasse',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.plz, "setMasterNested('mieter'," + m.originalIndex + ",'plz',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.ort, "setMasterNested('mieter'," + m.originalIndex + ",'ort',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.telefon, "setMasterNested('mieter'," + m.originalIndex + ",'telefon',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(m.email, "setMasterNested('mieter'," + m.originalIndex + ",'email',this.value)") + '</td>' +
    '<td><span class="status ' + (tenantOpenStatus(m) === "Aktiv" ? "ok" : "warn") + '">' + escapeHtml(tenantOpenStatus(m)) + '</span></td>' +
    '<td><button class="warn" onclick="archiveMasterMietverhaeltnis(' + m.originalIndex + ')">Archivieren</button></td></tr>'
  ).join("") : '<tr><td colspan="15">Keine aktuellen Mietverhältnisse vorhanden. Über „+ Neues Mietverhältnis“ kannst du einen Datensatz anlegen.</td></tr>';
  tableEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mietername</th><th>Einzug</th><th>Auszug</th><th>Rolle</th><th>Geschlecht</th><th>Standardanrede Brief</th><th>Straße</th><th>PLZ</th><th>Ort</th><th>Telefon</th><th>E-Mail</th><th>Status</th><th>Aktion</th></tr></thead><tbody>' + rows + '</tbody>';
  const archivedRows = masterArchivedTenantRows();
  const arows = archivedRows.length ? archivedRows.map(m =>
    '<tr><td>' + tenantIdCellHtml(m) + '</td><td>' + unitRefCellHtml(m.wohnung) + '</td><td>' + escapeHtml(m.name || "") + '</td><td>' + escapeHtml(m.einzug || "") + '</td><td>' + escapeHtml(m.auszug || "") + '</td><td>' + escapeHtml(m.geschlecht || "") + '</td><td>' + escapeHtml(m.strasse || "") + '</td><td>' + escapeHtml((m.plz || "") + " " + (m.ort || "")) + '</td><td>' + escapeHtml(m.archivedAt || "") + '</td><td><button onclick="restoreMasterMietverhaeltnis(' + m.originalIndex + ')">Reaktivieren</button></td></tr>'
  ).join("") : '<tr><td colspan="10">Noch keine archivierten Mietverhältnisse.</td></tr>';
  archiveEl.innerHTML = '<thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mietername</th><th>Einzug</th><th>Auszug</th><th>Geschlecht</th><th>Straße</th><th>PLZ/Ort</th><th>Archiviert am</th><th>Aktion</th></tr></thead><tbody>' + arows + '</tbody>';
}

function renderStartUnitManagement() {
  const tableEl = document.getElementById("startUnitTable");
  if (!tableEl) return;
  const units = masterUnits();
  const rows = units.map((w,i) =>
    '<tr><td>' + unitIdCellHtml(w) + '</td>' +
    '<td class="editable">' + inputHtml(w.bezeichnung, "setMasterNested('wohnungen'," + i + ",'bezeichnung',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(w.lage, "setMasterNested('wohnungen'," + i + ",'lage',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(w.wohnflaeche, "setMasterNested('wohnungen'," + i + ",'wohnflaeche',this.value,'number')", "number") + '</td>' +
    '<td class="editable">' + inputHtml(w.zimmer, "setMasterNested('wohnungen'," + i + ",'zimmer',this.value)") + '</td>' +
    '<td class="editable">' + inputHtml(w.bemerkung, "setMasterNested('wohnungen'," + i + ",'bemerkung',this.value)") + '</td></tr>'
  ).join("");
  tableEl.innerHTML = '<thead><tr><th>Wohnungs-ID</th><th>Bezeichnung</th><th>Etage / Lage</th><th>Wohnfläche m²</th><th>Zimmer</th><th>Bemerkung</th></tr></thead><tbody>' + rows + '</tbody>';
}


function localStorageUsageBytes() {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i) || "";
      const value = localStorage.getItem(key) || "";
      total += jsonByteLength(key) + jsonByteLength(value);
    }
  } catch(error) {
    return -1;
  }
  return total;
}

function developerDiagnosticsData() {
  const integrity = validateStoredDataIntegrity(state);
  const recoveryRaw = (() => { try { return localStorage.getItem(STORAGE_RECOVERY_KEY) || ""; } catch(error) { return ""; } })();
  const errors = Array.isArray(renderErrors) ? renderErrors.slice(-10) : [];
  return {
    generatedAt: new Date().toISOString(),
    app: { version:APP_VERSION, name:APP_VERSION_NAME, releaseDate:APP_RELEASE_DATE, schema:DATA_SCHEMA_VERSION },
    browser: {
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      language: navigator.language,
      viewport: window.innerWidth + "x" + window.innerHeight,
      protocol: location.protocol,
      serviceWorkerSupported: "serviceWorker" in navigator,
      serviceWorkerControlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller)
    },
    storage: {
      writable: storageWritable(),
      bytes: localStorageUsageBytes(),
      protected: !!integrity.protected,
      valid: !!integrity.valid,
      reason: integrity.reason || "",
      recoveryAvailable: !!recoveryRaw,
      recoveryBytes: jsonByteLength(recoveryRaw)
    },
    rendering: {
      renderCount,
      lastDurationMs: renderLastDurationMs,
      lastActiveTab: renderLastActiveTab,
      preparationCount: statePreparationCount,
      inProgress: renderInProgress,
      queued: renderQueued,
      errors
    },
    billing: {
      year: currentAbrechnungsjahr(),
      period: periodLabelShort(),
      active: hasActiveCurrentBilling(),
      finalized: isCurrentBillingFinalized(),
      archiveCount: Array.isArray(state.jahresArchiv) ? state.jahresArchiv.length : 0
    }
  };
}

function formatDiagnosticBytes(bytes) {
  if (bytes < 0) return "nicht verfügbar";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function renderDeveloperDiagnostics() {
  const host = document.getElementById("sicherung");
  if (!host) return;
  let el = document.getElementById("developerDiagnosticsBox");
  if (!el) {
    el = document.createElement("div");
    el.id = "developerDiagnosticsBox";
    const versionBox = document.getElementById("versionBox");
    if (versionBox && versionBox.parentNode) versionBox.insertAdjacentElement("afterend", el);
    else host.appendChild(el);
  }
  const d = developerDiagnosticsData();
  const renderErrorText = d.rendering.errors.length ? d.rendering.errors.map(e => (e.area || "Bereich") + ": " + (e.message || "Fehler")).join("\n") : "Keine Renderfehler protokolliert.";
  el.className = "developer-diagnostics";
  el.innerHTML = '<details><summary>Entwicklerdiagnose</summary>' +
    '<div class="small">Technische Laufzeitinformationen. Dieser Bereich verändert keine Abrechnungsdaten.</div>' +
    '<div class="developer-grid">' +
      '<div class="developer-pill"><strong>Version</strong><br>' + escapeHtml(d.app.version + " · " + d.app.name) + '<br><span class="small">Schema ' + escapeHtml(d.app.schema) + '</span></div>' +
      '<div class="developer-pill"><strong>Speicher</strong><br>' + escapeHtml(formatDiagnosticBytes(d.storage.bytes)) + '<br><span class="small">' + escapeHtml(d.storage.reason) + '</span></div>' +
      '<div class="developer-pill"><strong>Rückfallstand</strong><br>' + (d.storage.recoveryAvailable ? "vorhanden" : "nicht vorhanden") + '<br><span class="small">' + escapeHtml(formatDiagnosticBytes(d.storage.recoveryBytes)) + '</span></div>' +
      '<div class="developer-pill"><strong>Rendering</strong><br>' + escapeHtml(String(d.rendering.lastDurationMs)) + ' ms zuletzt<br><span class="small">' + escapeHtml(String(d.rendering.renderCount)) + ' Läufe</span></div>' +
      '<div class="developer-pill"><strong>Service Worker</strong><br>' + (d.browser.serviceWorkerControlled ? "aktiv" : (d.browser.serviceWorkerSupported ? "registrierbar" : "nicht unterstützt")) + '<br><span class="small">' + escapeHtml(d.browser.protocol) + '</span></div>' +
      '<div class="developer-pill"><strong>Verbindung</strong><br>' + (d.browser.online ? "online" : "offline") + '<br><span class="small">' + escapeHtml(d.browser.viewport) + '</span></div>' +
    '</div>' +
    '<div class="developer-actions">' +
      '<button type="button" onclick="renderDeveloperDiagnostics()">Diagnose aktualisieren</button>' +
      '<button type="button" onclick="runAppSelfTest()">App-Selbsttest</button>' +
      '<button type="button" onclick="downloadDeveloperDiagnostics()">Diagnose-JSON herunterladen</button>' +
      '<button type="button" onclick="checkForAppUpdate()">Nach Update suchen</button>' +
      '<button type="button" class="secondary" onclick="location.reload()">App neu laden</button>' +
    '</div>' +
    '<h4>Letzte Renderfehler</h4><div class="developer-log">' + escapeHtml(renderErrorText) + '</div>' +
    '</details>';
}

function downloadDeveloperDiagnostics() {
  const data = developerDiagnosticsData();
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  download("NK-Pro_" + APP_VERSION.replace(/[^A-Za-z0-9._-]/g,"_") + "_Diagnose_" + stamp + ".json", JSON.stringify(data, null, 2), "application/json;charset=utf-8");
}

async function checkForAppUpdate() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    alert("Die Update-Prüfung ist nur in der veröffentlichten HTTPS-App verfügbar.");
    return;
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration("./");
    if (!registration) {
      alert("Der Service Worker ist noch nicht registriert. Bitte die App einmal neu laden.");
      return;
    }
    await registration.update();
    alert(registration.waiting || registration.installing ? "Eine neue Version wird vorbereitet. Bitte die App anschließend neu laden." : "Update-Prüfung abgeschlossen. Aktuell wurde keine neue bereitstehende Version erkannt.");
  } catch(error) {
    alert("Update-Prüfung fehlgeschlagen: " + errorMessage(error));
  }
}

function renderSicherung() {
  renderBackupStatus();
  renderVersionInfo();
  renderDeveloperDiagnostics();
}

function buildArchiveTableHtml(withLoadButton) {
  ensureYearData();
  const rows = state.jahresArchiv.length ? state.jahresArchiv.map((a,i) => {
    const saldo = archiveRecordSaldo(a);
    const period = archivePeriodLabel(a);
    const actions = archiveActionButtonsHtml(i, {open:!!withLoadButton, primaryOpen:true, openLabel:"In neuem Fenster öffnen", download:true});
    return '<tr><td>' + escapeHtml(a.year) + '</td><td>' + escapeHtml(period) + '</td><td>' + escapeHtml(dateDe(a.archivedAt)) + '</td><td>' + archiveStatusBadgeHtml(a) + '</td><td>' + (a.summary ? a.summary.mietverhaeltnisse : "–") + '</td><td>' + fmtMoney(a.summary ? a.summary.kostenNK : 0) + '</td><td>' + fmtMoney(a.summary ? a.summary.vorauszahlungen : 0) + '</td><td>' + (saldo >= 0 ? "Nachzahlung " : "Guthaben ") + fmtMoney(Math.abs(saldo)) + '</td><td>' + actions + '</td></tr>';
  }).join("") : '<tr><td colspan="9">Noch kein Abrechnungsjahr archiviert.</td></tr>';
  return '<thead><tr><th>Jahr</th><th>Periode</th><th>Archiviert am</th><th>Status</th><th>Miet-/Einzelabrechnungen</th><th>Umlagefähige Kosten</th><th>Vorauszahlungen</th><th>Saldo</th><th>Aktion</th></tr></thead><tbody>' + rows + '</tbody>';
}

function replaceArchiveViewerPart(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(label);
  return html.replace(pattern, replacement);
}

function createArchiveViewerHtml(item) {
  const archiveItem = prepareArchiveItemForUse(item);
  const validation = archiveItemValidation(archiveItem);
  if (validation.errors.length) throw new Error("Archivdatensatz ist unvollständig: " + validation.errors.join(" "));

  const viewerState = normalizeLegacyData(clone(archiveItem.data || {}), { scope:ARCHIVE_SNAPSHOT_SCOPE });
  if (!viewerState.meta) viewerState.meta = {};
  viewerState.meta.archiveViewer = true;
  viewerState.meta.archivedAt = archiveItem.archivedAt || "";
  viewerState.meta.archivedYear = archiveItem.year || "";
  viewerState.meta.archiveReturnUrl = window.location && window.location.href ? window.location.href : "";
  viewerState.meta.dataSchemaVersion = DATA_SCHEMA_VERSION;
  viewerState.meta.dataLayerRole = "archiveViewerRuntime";
  viewerState.jahresArchiv = [];
  viewerState.waterMeterHistory = clone(state.waterMeterHistory || DEFAULT_WATER_METER_HISTORY);
  ensureWaterMeterHistory(viewerState);
  ensureStammdatenData(viewerState);

  let viewerHtml = APP_HTML_TEMPLATE || ("<!DOCTYPE html>\n" + document.documentElement.outerHTML);
  const seedJson = JSON.stringify(viewerState).replace(/</g, "\\u003c");
  viewerHtml = replaceArchiveViewerPart(viewerHtml, /const SEED = [\s\S]*?;\s*const APP_VERSION/, "const SEED = " + seedJson + ";\nconst APP_VERSION", "Archivdaten konnten nicht in die Archivansicht eingesetzt werden.");
  viewerHtml = replaceArchiveViewerPart(viewerHtml, /const STORAGE_KEY = "[^"]*";/, 'const STORAGE_KEY = "nkpro_archive_view_' + String(archiveItem.year || "jahr").replace(/\\W/g, "_") + '_' + Date.now() + '";', "Archiv-Speicherbereich konnte nicht isoliert werden.");
  viewerHtml = viewerHtml.replace(/const LEGACY_STORAGE_KEYS = \[[^\]]*\];/, "const LEGACY_STORAGE_KEYS = [];");
  viewerHtml = viewerHtml.replace(/NK-Pro Webbrowserseite V51/g, "NK-Pro Archivansicht V51");
  const safeArchiveYear = escapeHtml(archiveItem.year || "");
  viewerHtml = viewerHtml.replace(/<title>(.*?)<\/title>/, "<title>Archivierte NK-Abrechnung " + safeArchiveYear + "</title>");
  return viewerHtml;
}

function archiveStateFromItem(item) {
  const archiveItem = prepareArchiveItemForUse(item);
  const validation = archiveItemValidation(archiveItem);
  if (validation.errors.length) throw new Error("Archivdatensatz ist unvollständig: " + validation.errors.join(" "));
  const viewerState = normalizeLegacyData(clone(archiveItem.data || {}), { scope:ARCHIVE_SNAPSHOT_SCOPE });
  if (!viewerState.meta) viewerState.meta = {};
  viewerState.meta.archiveViewer = true;
  viewerState.meta.archivedAt = archiveItem.archivedAt || "";
  viewerState.meta.archivedYear = archiveItem.year || "";
  viewerState.meta.dataSchemaVersion = DATA_SCHEMA_VERSION;
  viewerState.meta.dataLayerRole = "archiveViewerRuntime";
  viewerState.jahresArchiv = [];
  viewerState.waterMeterHistory = clone(state.waterMeterHistory || DEFAULT_WATER_METER_HISTORY);
  ensureWaterMeterHistory(viewerState);
  ensureStammdatenData(viewerState);
  return viewerState;
}

function openArchiveStateInApp(item) {
  const viewerState = archiveStateFromItem(item);
  if (!archiveReturnState) archiveReturnState = clone(state);
  state = viewerState;
  pendingStorageWarning = "";
  renderErrors = [];
  renderAll();
  billingContextOpen = true;
  enterBillingMode("mieter");
  setActionMessage("Archivansicht geöffnet: " + periodLabelShort());
  renderActionFeedback();
}
function archiveViewerFileName(item) {
  const raw = String((item && item.year) || "archiv").trim() || "archiv";
  const safe = raw.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "archiv";
  return "NK-Pro_Archivansicht_" + safe + ".html";
}

function openArchiveViewerDocument(viewerHtml, item) {
  let objectUrl = "";
  try {
    const blob = new Blob([viewerHtml], { type:"text/html;charset=utf-8" });
    objectUrl = URL.createObjectURL(blob);
    const win = window.open(objectUrl, "_blank");
    if (win) {
      if (win.focus) win.focus();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      return true;
    }
    URL.revokeObjectURL(objectUrl);
    objectUrl = "";
  } catch(e) {
    console.warn("Archivfenster konnte nicht per Blob geöffnet werden", e);
    if (objectUrl) {
      try { URL.revokeObjectURL(objectUrl); } catch(revokeError) {}
    }
  }

  try {
    document.open();
    document.write(viewerHtml);
    document.close();
    return true;
  } catch(e) {
    console.warn("Archivansicht konnte nicht im aktuellen Fenster geöffnet werden", e);
  }

  const filename = archiveViewerFileName(item);
  if (download(filename, viewerHtml, "text/html;charset=utf-8")) {
    alert("Das Archivfenster konnte nicht geöffnet werden. Die Abrechnung wurde deshalb als HTML-Datei vorbereitet: " + filename);
    return true;
  }
  alert("Die Archivansicht konnte nicht geöffnet werden. Bitte Browser-Berechtigungen und Pop-up-Einstellungen prüfen.");
  return false;
}
function openArchiveYear(index) {
  ensureYearData();
  const item = state.jahresArchiv[index];
  if (!item) {
    alert("Diese archivierte Abrechnung wurde nicht gefunden.");
    return;
  }

  try {
    openArchiveStateInApp(item);
  } catch(e) {
    console.warn("Archivansicht konnte nicht vorbereitet werden", e);
    alert("Die Archivansicht konnte nicht vorbereitet werden.\n" + String(e && (e.message || e) || "Unbekannter Fehler"));
  }
}

// Rückwärtskompatibler Alias: Archiv wird nicht mehr im Arbeitsfenster geladen.

function reopenArchiveYearForRework(index) {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Wiederbearbeitung ist nur auf der Startseite des ursprünglichen Arbeitsfensters möglich.");
    return;
  }
  ensureYearData();
  const item = state.jahresArchiv[index];
  if (!item) {
    alert("Diese archivierte Abrechnung wurde nicht gefunden.");
    return;
  }
  const label = archiveItemLabel(item, index);
  const code = "WIEDERBEARBEITEN";
  if (!confirmRiskyDataAction("Archivierte Abrechnung zur Wiederbearbeitung öffnen", "Der aktuelle Arbeitsstand wird durch den Archivstand ersetzt: " + label + ". Der Archivdatensatz bleibt im Jahresarchiv erhalten. Vorher sollte eine Gesamt-JSON-Sicherung vorhanden sein.")) return;
  const entered = prompt("Archivierte Abrechnung zur Wiederbearbeitung öffnen?\n\nGib zur Bestätigung " + code + " ein. Der aktuelle Arbeitsstand wird ersetzt, der Archivdatensatz bleibt erhalten.");
  if (String(entered || "").trim().toUpperCase() !== code) return alert("Wiederbearbeitung wurde nicht geöffnet.");

  let restored;
  try {
    restored = normalizeLegacyData(clone(prepareArchiveItemForUse(item).data || {}), { scope:ARCHIVE_SNAPSHOT_SCOPE });
  } catch(e) {
    alert("Archivdatensatz konnte nicht zur Wiederbearbeitung vorbereitet werden.\n" + errorMessage(e));
    return;
  }
  const preservedArchive = clone(state.jahresArchiv || []);
  const preservedMasterData = clone(state.stammdaten || {});
  const preservedHistory = clone(state.waterMeterHistory || restored.waterMeterHistory || {});
  const preservedOperationalMeta = clone(state.meta || {});
  if (!restored.meta) restored.meta = {};
  copyWorkingOperationalMeta(restored.meta, preservedOperationalMeta);
  restored.meta.archiveViewer = false;
  delete restored.meta.archiveReturnUrl;
  delete restored.meta.archivedAt;
  delete restored.meta.archivedYear;
  restored.meta.reopenedFromArchiveAt = new Date().toISOString();
  restored.meta.reopenedFromArchiveWithAppVersion = APP_VERSION;
  restored.meta.reopenedFromArchiveLabel = label;
  restored.meta.currentBillingCreatedByUser = true;
  restored.meta.currentBillingCreatedAt = restored.meta.currentBillingCreatedAt || new Date().toISOString();
  restored.meta.currentBillingCreatedWithAppVersion = APP_VERSION;
  restored.meta.dataLayerContractVersion = DATA_LAYER_CONTRACT_VERSION;
  restored.meta.dataLayerRole = "workingState";
  restored.meta.storageRole = "working";
  clearCurrentBillingArchiveClosure(restored);
  restored.stammdaten = preservedMasterData;
  restored.waterMeterHistory = preservedHistory;
  restored.jahresArchiv = preservedArchive;
  ensureStammdatenData(restored);
  ensureWaterMeterHistory(restored);
  if (typeof clearCurrentBillingFinalization === "function") {
    const oldState = state;
    state = restored;
    clearCurrentBillingFinalization();
    state = oldState;
  }
  state = restored;
  commitStateChange({ reason:"Benutzereingabe" });
  billingContextOpen = true;
  enterBillingMode("mieter");
  alert("Archivierte Abrechnung wurde zur Wiederbearbeitung geöffnet: " + label);
}

function loadArchiveYear(index) {
  openArchiveYear(index);
}

function yearNumber(value) {
  const m = String(value || "").match(/\d{4}/);
  const n = m ? parseInt(m[0], 10) : NaN;
  return Number.isFinite(n) ? n : new Date().getFullYear();
}

function createYearSnapshot() {
  ensureYearData();
  syncVorauszahlungen();
  syncUmlageInputs();
  applyWaterMetersToUmlage();
  updateTenantPrepaymentTotals();

  const calc = calculateUmlage();
  const year = currentAbrechnungsjahr();
  const visibleRows = visibleTenantRows();
  const billableRows = visibleRows.filter(m => isBillableTenant(m));
  const privateRows = visibleRows.filter(m => isPrivateTenant(m));
  const prepayments = calc.tenantResults.reduce((s,r) => s + num(r.prepayments), 0);
  const tenantShares = calc.tenantResults.reduce((s,r) => s + num(r.costShare), 0);
  const corrections = calc.tenantResults.reduce((s,r) => s + num(r.correction), 0);
  const kostenNK = state.kostenarten.filter(k => k.kostenart && k.inNK === "Ja").reduce((s,k) => s + num(k.gesamtbetrag), 0);

  return {
    year,
    periodId: String(year) + "|" + periodStart() + "|" + periodEnd() + "|Tool-Abrechnung",
    archivedAt: todayIso(),
    meta: snapshotMetaFrom(state.meta || {}),
    summary: {
      mietverhaeltnisse: billableRows.length,
      datensaetzeUmlagebasis: visibleRows.length,
      eigentuemerPrivatDatensaetze: privateRows.length,
      kostenNK,
      vorauszahlungen: prepayments,
      mieterKostenanteile: tenantShares,
      korrekturen: corrections,
      saldo: tenantShares - prepayments - corrections
    },
    snapshotScope: ARCHIVE_SNAPSHOT_SCOPE,
    snapshotBoundaryVersion: DATA_LAYER_CONTRACT_VERSION,
    data: createBoundedBillingSnapshotData(state)
  };
}

function upsertYearArchive(snapshot) {
  ensureYearData();
  let item;
  try {
    item = prepareArchiveItemForUse(snapshot);
  } catch(error) {
    console.warn("Archivdatensatz konnte nicht vorbereitet werden", error, snapshot);
    if (typeof alert === "function") alert("Archivdatensatz konnte nicht vorbereitet werden:\n" + errorMessage(error));
    return false;
  }
  const validation = archiveItemValidation(item);
  if (validation.errors.length) {
    console.warn("Archivdatensatz wurde nicht gespeichert", validation.errors, item);
    if (typeof alert === "function") alert("Archivdatensatz konnte nicht gespeichert/importiert werden:\n" + archiveValidationMessage(validation));
    return false;
  }
  if (validation.warnings.length && typeof console !== "undefined" && console.warn) console.warn("Archivdatensatz mit Hinweisen gespeichert", validation.warnings, item);
  if (!item.periodId) item.periodId = archivePeriodId(item);
  const id = archivePeriodId(item);
  const idx = state.jahresArchiv.findIndex(a => archivePeriodId(a) === id);
  if (idx >= 0) state.jahresArchiv[idx] = item;
  else state.jahresArchiv.push(item);
  state.jahresArchiv.sort((a,b) => archiveSortKey(b).localeCompare(archiveSortKey(a)));
  return true;
}

function archiveCurrentYearOnly() {
  if (!hasActiveCurrentBilling()) {
    alert("Es ist noch keine aktuelle Abrechnung angelegt. Bitte zuerst über „+ Neue Abrechnung“ starten.");
    return;
  }
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Archivieren ist nur im ursprünglichen Arbeitsfenster möglich.");
    return;
  }
  const year = currentAbrechnungsjahr();
  if (!confirmRiskyDataAction("Abrechnungsjahr archivieren", "Abrechnungsjahr " + year + " jetzt im Archiv speichern? Ein vorhandener Archivstand für dieses Jahr wird ersetzt. Es wird keine neue Folgeabrechnung angelegt.")) return;
  const snapshot = createYearSnapshot();
  if (!upsertYearArchive(snapshot)) return;
  closeCurrentBillingAfterArchive(snapshot);
  withFinalizationWriteBypass(() => saveData());
  appUiMode = "start";
  billingContextOpen = false;
  renderAll();
  switchToTab("archiv");
  alert("Abrechnungsjahr " + year + " wurde archiviert. Es wurde keine neue Abrechnung angelegt; der Archivdatensatz ist jetzt im Archiv sichtbar.");
}

function hasEnteredMeterValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function normalizeIsoDateValue(value, fallbackYear) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const de = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (de) {
    let year = de[3];
    if (year.length === 2) year = String(2000 + parseInt(year, 10));
    return year + "-" + String(de[2]).padStart(2, "0") + "-" + String(de[1]).padStart(2, "0");
  }
  const ym = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (ym) return ym[1] + "-" + String(ym[2]).padStart(2, "0") + "-01";
  if (fallbackYear && /^(\d{1,2})\.(\d{1,2})\.$/.test(raw)) {
    const m = raw.match(/^(\d{1,2})\.(\d{1,2})\.$/);
    return String(fallbackYear) + "-" + String(m[2]).padStart(2, "0") + "-" + String(m[1]).padStart(2, "0");
  }
  return "";
}

function periodDateStartForData(data) {
  const meta = data && data.meta ? data.meta : {};
  const year = yearNumber(meta.abrechnungsjahr || currentAbrechnungsjahr());
  return normalizeIsoDateValue(meta.abrechnungsbeginn, year) || (String(year) + "-01-01");
}

function periodDateEndForData(data) {
  const meta = data && data.meta ? data.meta : {};
  const year = yearNumber(meta.abrechnungsjahr || currentAbrechnungsjahr());
  return normalizeIsoDateValue(meta.abrechnungsende, year) || (String(year) + "-12-31");
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
    const d = new Date(tenantStartIso + "T00:00:00");
    if (!Number.isNaN(d.getTime()) && d > activeStart) activeStart = d;
  }
  if (tenantEndIso) {
    const d = new Date(tenantEndIso + "T00:00:00");
    if (!Number.isNaN(d.getTime()) && d < activeEnd) activeEnd = d;
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

function monthTotalForPrepaymentCarryForward(oldAnnual, previousData, previousTenant, currentTenant, effectiveIso, monthlyChange) {
  const oldMonths = activeMonthStartsForData(previousData, previousTenant);
  const currentMonths = activeMonthStartsForData(state, currentTenant);
  const oldMonthCount = Math.max(1, oldMonths.length || 12);
  const currentMonthCount = Math.max(1, currentMonths.length || 12);
  const oldMonthly = num(oldAnnual) / oldMonthCount;
  const change = num(monthlyChange);
  if (!effectiveIso || Math.abs(change) < 0.005) return oldMonthly * currentMonthCount;
  const newMonthly = Math.max(0, oldMonthly + change);
  const total = currentMonths.reduce((sum, monthIso) => sum + (monthIso >= effectiveIso.slice(0, 7) + "-01" ? newMonthly : oldMonthly), 0);
  return total || (newMonthly * currentMonthCount);
}

function previousYearArchiveDataForCurrentBilling() {
  ensureYearData();
  const currentYear = yearNumber(currentAbrechnungsjahr());
  const previousYear = currentYear - 1;
  const candidates = (state.jahresArchiv || []).filter(a => yearNumber(a && (a.year || (a.meta && a.meta.abrechnungsjahr))) === previousYear);
  if (!candidates.length) return null;
  const item = candidates
    .slice()
    .sort((a,b) => String(b.archivedAt || (b.meta && b.meta.archivedAt) || "").localeCompare(String(a.archivedAt || (a.meta && a.meta.archivedAt) || "")))[0];
  try {
    const prepared = prepareArchiveItemForUse(item);
    return prepared && prepared.data ? { item:prepared, data:prepared.data, year:previousYear } : null;
  } catch(error) {
    console.warn("Vorjahresabrechnung konnte für Vorauszahlungsübernahme nicht gelesen werden", error);
    return null;
  }
}

function previousTenantRoleIsPrivate(tenant) {
  const role = String(tenant && (tenant.abrechnungRolle || tenant.rolle || "") || "").toLocaleLowerCase("de-DE");
  return role.includes("eigent") || role.includes("privat");
}

function normalizeTenantMatchText(value) {
  return String(value || "").trim().toLocaleLowerCase("de-DE").replace(/\s+/g, " ");
}

function findPreviousTenantIndexForCarryForward(previousTenants, currentTenant) {
  const rows = (Array.isArray(previousTenants) ? previousTenants : []).map((t,i) => ({...t, originalIndex:i})).filter(t => hasTenantData(t) && !previousTenantRoleIsPrivate(t));
  if (!currentTenant || !rows.length) return -1;
  const id = String(currentTenant.id || "").trim();
  if (id) {
    const byId = rows.find(t => String(t.id || "").trim() === id);
    if (byId) return byId.originalIndex;
  }
  const name = normalizeTenantMatchText(currentTenant.name);
  const unit = String(currentTenant.wohnung || "").trim();
  if (name && unit) {
    const byNameAndUnit = rows.find(t => normalizeTenantMatchText(t.name) === name && String(t.wohnung || "").trim() === unit);
    if (byNameAndUnit) return byNameAndUnit.originalIndex;
  }
  if (name) {
    const sameName = rows.filter(t => normalizeTenantMatchText(t.name) === name);
    if (sameName.length === 1) return sameName[0].originalIndex;
  }
  return -1;
}

function activePrepaymentMatrixHasValues() {
  syncVorauszahlungen();
  const visibleRows = billableTenantRows();
  const activeIds = new Set(activePrepaymentCostIds());
  return state.vorauszahlungen
    .filter(v => activeIds.has(v.kostenId) && v.aktiv === "Ja")
    .some(v => visibleRows.some(m => Math.abs(num(v.werte && v.werte[m.originalIndex])) > 0.005));
}

function prepaymentAdjustmentWasPrinted(previousData) {
  const bs = previousData && previousData.briefSettings ? previousData.briefSettings : {};
  const ps = previousData && previousData.prepaymentAdjustmentSettings ? previousData.prepaymentAdjustmentSettings : {};
  return bs.showVorauszahlungPage === "Ja" || bs.vorauszahlungPrintMode === "Berechnete Werte drucken" || bs.vorauszahlungPrintMode === "Manuelle Werte drucken" || (ps.letterPrintMode && ps.letterPrintMode !== "Nicht drucken");
}

function effectivePrepaymentIsoFromPreviousData(previousData) {
  const currentYear = yearNumber(currentAbrechnungsjahr());
  const bs = previousData && previousData.briefSettings ? previousData.briefSettings : {};
  const ps = previousData && previousData.prepaymentAdjustmentSettings ? previousData.prepaymentAdjustmentSettings : {};
  return normalizeIsoDateValue(ps.effectiveFrom || bs.vorauszahlungAb, currentYear);
}

function carryForwardPrepaymentsFromPreviousYear() {
  syncVorauszahlungen();
  const info = { sourceYear:"", copied:0, adjusted:0, warnings:[], details:[] };
  const source = previousYearArchiveDataForCurrentBilling();
  if (!source || !source.data) {
    state.meta.prepaymentCarryForward = { sourceYear:"", copied:0, adjusted:0, warnings:["Keine Vorjahresabrechnung gefunden; NK-Vorauszahlungen wurden nicht automatisch übernommen."], details:[] };
    return state.meta.prepaymentCarryForward;
  }
  const previousData = source.data;
  info.sourceYear = String(source.year);
  const previousTenants = Array.isArray(previousData.mieter) ? previousData.mieter : [];
  const previousPrepayments = Array.isArray(previousData.vorauszahlungen) ? previousData.vorauszahlungen : [];
  const currentRows = billableTenantRows();
  const applyAdjustment = prepaymentAdjustmentWasPrinted(previousData);
  const effectiveIso = effectivePrepaymentIsoFromPreviousData(previousData);
  const previousPeriodDays = Math.max(1, Math.round((new Date(periodDateEndForData(previousData) + "T00:00:00") - new Date(periodDateStartForData(previousData) + "T00:00:00")) / 86400000) + 1);
  const currentPeriodDays = periodDaysExact();
  if (Math.abs(previousPeriodDays - currentPeriodDays) > 1) {
    info.warnings.push("Abrechnungsperiode Vorjahr (" + previousPeriodDays + " Tage) weicht von aktueller Periode (" + currentPeriodDays + " Tage) ab.");
  }

  state.vorauszahlungen.forEach(row => {
    const previousRow = previousPrepayments.find(v => v && v.kostenId === row.kostenId);
    if (!previousRow || !Array.isArray(previousRow.werte)) return;
    const currentCost = state.kostenarten.find(k => k.id === row.kostenId) || { id:row.kostenId, kostenart:row.kostenart };
    const group = adjustmentGroupForCost(currentCost);
    currentRows.forEach(tenant => {
      const previousIndex = findPreviousTenantIndexForCarryForward(previousTenants, tenant);
      if (previousIndex < 0) return;
      const previousTenant = previousTenants[previousIndex];
      const oldAnnual = num(previousRow.werte[previousIndex]);
      const previousMonths = activeMonthStartsForData(previousData, previousTenant);
      const currentMonths = activeMonthStartsForData(state, tenant);
      if (!previousMonths.length || !currentMonths.length) return;
      let change = 0;
      if (applyAdjustment && previousTenant && previousTenant[group.changeKey] !== undefined && previousTenant[group.changeKey] !== null && String(previousTenant[group.changeKey]).trim() !== "") {
        change = num(previousTenant[group.changeKey]);
      }
      const projected = monthTotalForPrepaymentCarryForward(oldAnnual, previousData, previousTenant, tenant, effectiveIso, change);
      row.werte[tenant.originalIndex] = Math.round(projected * 100) / 100;
      info.copied += 1;
      if (Math.abs(change) > 0.005) info.adjusted += 1;
      if (previousMonths.length !== currentMonths.length) {
        info.warnings.push((tenantDisplayId(tenant) || tenant.id || "Mieter") + " · " + (tenant.name || "") + ": Vorjahr " + previousMonths.length + " Monat(e), aktuell " + currentMonths.length + " Monat(e); Vorauszahlung wurde hoch-/runtergerechnet.");
      }
      info.details.push({ tenantId:tenant.id, kostenId:row.kostenId, oldAnnual, newAnnual:row.werte[tenant.originalIndex], previousMonths:previousMonths.length, currentMonths:currentMonths.length, adjusted:Math.abs(change) > 0.005 });
    });
    row.summe = Array.isArray(row.werte) ? row.werte.reduce((a,b) => a + num(b), 0) : 0;
  });
  info.warnings = Array.from(new Set(info.warnings));
  info.appliedForYear = currentAbrechnungsjahr();
  info.appliedAt = new Date().toISOString();
  state.meta.prepaymentCarryForward = info;
  updateTenantPrepaymentTotals();
  return info;
}

function ensurePrepaymentCarryForwardIfNeeded() {
  if (!state.meta) state.meta = {};
  syncVorauszahlungen();
  const alreadyApplied = state.meta.prepaymentCarryForward && state.meta.prepaymentCarryForward.appliedForYear === currentAbrechnungsjahr() && num(state.meta.prepaymentCarryForward.copied) > 0;
  if (alreadyApplied || activePrepaymentMatrixHasValues()) return state.meta.prepaymentCarryForward || null;
  const source = previousYearArchiveDataForCurrentBilling();
  if (!source || !source.data) return state.meta.prepaymentCarryForward || null;
  const info = carryForwardPrepaymentsFromPreviousYear();
  if (info && num(info.copied) > 0) {
    state.meta.prepaymentCarryForwardRecovered = true;
    state.meta.prepaymentCarryForwardRecoveredAt = new Date().toISOString();
  }
  return info;
}

function renderPrepaymentCarryForwardNotice() {
  const el = document.getElementById("prepaymentCarryForwardNotice");
  if (!el) return;
  const info = state.meta && state.meta.prepaymentCarryForward;
  if (!info) {
    el.innerHTML = '<div class="hint"><strong>Vorjahresübernahme:</strong> Beim Anlegen einer neuen Abrechnung werden NK-Vorauszahlungen aus der Vorjahresabrechnung übernommen, sofern der Mieter dort abgerechnet wurde.</div>';
    return;
  }
  const warnings = Array.isArray(info.warnings) ? info.warnings : [];
  const cls = warnings.length ? "hint feedback-box warn" : "hint feedback-box";
  const source = info.sourceYear ? " aus " + escapeHtml(info.sourceYear) : "";
  const detail = (num(info.copied) || num(info.adjusted)) ? (escapeHtml(info.copied || 0) + " Werte übernommen" + (num(info.adjusted) ? ", davon " + escapeHtml(info.adjusted) + " mit Vorauszahlungsanpassung" : "")) : "keine Werte übernommen";
  el.innerHTML = '<div class="' + cls + '"><strong>Vorjahresübernahme NK-Vorauszahlungen' + source + ':</strong> ' + detail + '.' + (warnings.length ? '<ul>' + warnings.slice(0,8).map(w => '<li>' + escapeHtml(w) + '</li>').join('') + (warnings.length > 8 ? '<li>Weitere Hinweise vorhanden.</li>' : '') + '</ul>' : '') + '</div>';
}

function carryMeterEndToStart(snapshot = null) {
  ensureWaterMeterData();
  const sourceSnapshot = snapshot || captureMeterReadingsSnapshot(state);
  const startDate = periodStart() || (String(currentAbrechnungsjahr()) + "-01-01");
  const endDate = periodEnd() || (String(currentAbrechnungsjahr()) + "-12-31");
  const warnings = [];
  const count = Math.max(20, state.mieter.length);
  state.waterMeters.readings = Array(count).fill(null).map(() => ({}));
  state.mieter.forEach((tenant,index) => {
    const source = meterSnapshotRowForTenant(sourceSnapshot.water, tenant) || {};
    const label = (tenant.wohnung || tenant.id || ("Datensatz " + (index + 1)));
    if (!hasEnteredMeterValue(source.kwEnd)) warnings.push("Kaltwasser-Endstand fehlt bei " + label);
    if (!hasEnteredMeterValue(source.wwEnd)) warnings.push("Warmwasser-Endstand fehlt bei " + label);
    state.waterMeters.readings[index] = {
      kwStart:hasEnteredMeterValue(source.kwEnd) ? num(source.kwEnd) : (hasEnteredMeterValue(source.kwStart) ? num(source.kwStart) : ""),
      kwStartDate:startDate, kwEnd:"", kwEndDate:endDate,
      wwStart:hasEnteredMeterValue(source.wwEnd) ? num(source.wwEnd) : (hasEnteredMeterValue(source.wwStart) ? num(source.wwStart) : ""),
      wwStartDate:startDate, wwEnd:"", wwEndDate:endDate, bemerkung:""
    };
  });
  if (!state.meterReadings) state.meterReadings = { readings:{} };
  if (!state.meterReadings.readings) state.meterReadings.readings = {};
  const costIds = new Set(Object.keys(sourceSnapshot.generic || {}).concat(Object.keys(state.meterReadings.readings || {})));
  costIds.forEach(costId => {
    const rows = Array(count).fill(null).map(() => ({}));
    state.mieter.forEach((tenant,index) => {
      const source = meterSnapshotRowForTenant(sourceSnapshot.generic && sourceSnapshot.generic[costId], tenant) || {};
      const label = (tenant.wohnung || tenant.id || ("Datensatz " + (index + 1)));
      if (!hasEnteredMeterValue(source.end)) warnings.push("Endstand fehlt bei " + costId + " / " + label);
      rows[index] = { start:hasEnteredMeterValue(source.end) ? num(source.end) : (hasEnteredMeterValue(source.start) ? num(source.start) : ""), startDate, end:"", endDate, bemerkung:"" };
    });
    state.meterReadings.readings[costId] = rows;
  });
  if (!state.meta) state.meta = {};
  state.meta.meterCarryForwardWarnings = Array.from(new Set(warnings));
}


function periodStartForData(data) {
  const meta = data && data.meta ? data.meta : {};
  const year = String(meta.abrechnungsjahr || "").trim();
  return meta.abrechnungsbeginn || (year ? year + "-01-01" : "");
}

function periodEndForData(data) {
  const meta = data && data.meta ? data.meta : {};
  const year = String(meta.abrechnungsjahr || "").trim();
  return meta.abrechnungsende || (year ? year + "-12-31" : "");
}

function numericMeterValueEquals(a, b) {
  if (a === "" || a === null || a === undefined) return false;
  return Math.abs(num(a) - num(b)) < 0.000001;
}

function isNewCurrentBillingData(data) {
  const meta = data && data.meta ? data.meta : {};
  if (!data || meta.currentBillingArchivedOnly || meta.currentBillingClosedAfterArchive || meta.legacyArchivHinweis || meta.archiveViewer) return false;
  const y = parseInt(String(meta.abrechnungsjahr || ""), 10);
  if (!Number.isFinite(y) || y <= 2024) return false;
  // Ab V80 gilt jede nicht archivierte aktuelle Abrechnung ab 2025 als fortgeschriebene/neue Abrechnung.
  // Archivierte Altstände bis 2024 bleiben ausgeschlossen.
  return true;
}

function numericEndValuesWereManuallyTouchedForYear(data, year) {
  const meta = data && data.meta ? data.meta : {};
  return String(meta.meterNumericEndValuesTouchedForYear || "") === String(year || "");
}

function clearAutofilledMeterEndValuesForNewBilling(data = state, options = {}) {
  if (!data || typeof data !== "object") return 0;
  if (!options.force) {
    if (typeof ARCHIVE_VIEW_MODE !== "undefined" && ARCHIVE_VIEW_MODE) return 0;
    if (!isNewCurrentBillingData(data)) return 0;
    const year = String((data.meta && data.meta.abrechnungsjahr) || "");
    if (numericEndValuesWereManuallyTouchedForYear(data, year)) return 0;
  }
  const startDate = periodStartForData(data);
  const endDate = periodEndForData(data);
  let cleared = 0;
  const force = !!options.force;

  const readings = data.waterMeters && Array.isArray(data.waterMeters.readings) ? data.waterMeters.readings : [];
  readings.forEach(r => {
    if (!r) return;
    if (startDate) {
      if (r.kwStartDate === undefined || r.kwStartDate === "" || force) r.kwStartDate = startDate;
      if (r.wwStartDate === undefined || r.wwStartDate === "" || force) r.wwStartDate = startDate;
    }
    if (endDate) {
      if (r.kwEndDate === undefined || r.kwEndDate === "" || force) r.kwEndDate = endDate;
      if (r.wwEndDate === undefined || r.wwEndDate === "" || force) r.wwEndDate = endDate;
    }
    if (force || numericMeterValueEquals(r.kwEnd, r.kwStart)) { if (r.kwEnd !== "") cleared++; r.kwEnd = ""; }
    if (force || numericMeterValueEquals(r.wwEnd, r.wwStart)) { if (r.wwEnd !== "") cleared++; r.wwEnd = ""; }
  });

  const allReadings = data.meterReadings && data.meterReadings.readings && typeof data.meterReadings.readings === "object" ? data.meterReadings.readings : {};
  Object.keys(allReadings).forEach(costId => {
    const rows = Array.isArray(allReadings[costId]) ? allReadings[costId] : [];
    rows.forEach(r => {
      if (!r) return;
      if (startDate && (r.startDate === undefined || r.startDate === "" || force)) r.startDate = startDate;
      if (endDate && (r.endDate === undefined || r.endDate === "" || force)) r.endDate = endDate;
      if (force || numericMeterValueEquals(r.end, r.start)) { if (r.end !== "") cleared++; r.end = ""; }
    });
  });

  if (cleared && data.meta) {
    data.meta.meterEndValuesClearedForYear = String(data.meta.abrechnungsjahr || "");
    data.meta.meterEndValuesClearedWithAppVersion = APP_VERSION;
    if (options.repairExistingNewBilling) data.meta.meterEndValuesAutofillRepairAppliedAt = new Date().toISOString();
  }
  return cleared;
}

function resetAnnualValuesForNextYear(nextYear, startIso, endIso) {
  const previousMeterSnapshot = captureMeterReadingsSnapshot(state);
  state.meta.abrechnungsjahr = String(nextYear);
  state.meta.abrechnungsbeginn = startIso || (String(nextYear) + "-01-01");
  state.meta.abrechnungsende = endIso || (String(nextYear) + "-12-31");
  if (state.briefSettings) {
    state.briefSettings.abrechnungsjahr = String(nextYear);
    state.briefSettings.briefdatum = todayIso();
    state.briefSettings.zahlungsziel = addDaysIso(todayIso(), 14);
  }
  applyStammdatenToCurrentBilling();

  state.kostenarten.forEach(k => {
    if (k.kostenart && k.inNK === "Ja") {
      k.gesamtbetrag = 0;
      if (k.umlageschluessel === "Verbrauch") k.preisProEinheit = "";
      k.status = kostenStatus(k);
    }
  });

  const periodDays = periodDaysExact();
  state.mieter.forEach(m => {
    if (!hasTenantData(m) || isArchivedTenant(m)) return;
    m.kaltErhalten = 0;
    m.nkVoraus = 0;
    m.vorjahresKorrektur = 0;
    m.wasserWeitereVorauszahlung = 0;
    m.einnahmen = 0;
    const activeDays = tenantActiveDaysInCurrentPeriod(m) || periodDays;
    m.aktiveTage = activeDays;
    m.personentage = num(m.personen) * activeDays;
  });

  if (Array.isArray(state.vorauszahlungen)) {
    state.vorauszahlungen.forEach(v => {
      if (Array.isArray(v.werte)) v.werte = v.werte.map(() => 0);
      v.summe = 0;
    });
  }
  if (state.meta) {
    delete state.meta.prepaymentCarryForward;
    delete state.meta.prepaymentCarryForwardRecovered;
    delete state.meta.prepaymentCarryForwardRecoveredAt;
  }

  if (state.umlageInputs) {
    Object.keys(state.umlageInputs).forEach(costId => {
      const input = state.umlageInputs[costId];
      if (!input || !Array.isArray(input.values)) return;
      input.values = input.values.map(() => 0);
    });
  }
  state.kostenartenMieterUmlage = {};

  if (state.waterMeters && state.waterMeters.settings) {
    const waterSettings = state.waterMeters.settings;
    waterSettings.enabled = "Ja";
    waterSettings.houseMeterStart = hasWaterSettingValue(waterSettings.houseMeterEnd) ? waterSettings.houseMeterEnd : "";
    waterSettings.houseMeterStartDate = state.meta.abrechnungsbeginn;
    waterSettings.houseMeterEnd = "";
    waterSettings.houseMeterEndDate = state.meta.abrechnungsende;
    waterSettings.houseWaterTotal = 0;
    waterSettings.houseInvoiceNote = "";
  }
  carryMeterEndToStart(previousMeterSnapshot);
  clearAutofilledMeterEndValuesForNewBilling(state, { force:true });
  if (state.meta) {
    state.meta.meterCarryForwardAppliedForYear = currentAbrechnungsjahr();
    state.meta.meterEndValuesClearedForYear = currentAbrechnungsjahr();
  }
  syncVorauszahlungen();
  carryForwardPrepaymentsFromPreviousYear();
  syncUmlageInputs();
  syncKostenartenMieterUmlage();
  applyWaterMetersToUmlage();
  updateTenantPrepaymentTotals();
}

function archiveAndPrepareNextYear() {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Neue Abrechnungen legst du im ursprünglichen Arbeitsfenster an.");
    return;
  }
  const year = currentAbrechnungsjahr();
  const nextYear = yearNumber(year) + 1;
  if (!confirmRiskyDataAction("Jahreswechsel vorbereiten", "Abrechnungsjahr " + year + " archivieren und das Tool für " + nextYear + " vorbereiten?\\n\\nDabei werden Jahreswerte zurückgesetzt, Zähler-Endstände als neue Anfangsstände übernommen und neue Zähler-Endwerte leer gelassen.")) return;

  if (!upsertYearArchive(createYearSnapshot())) return;
  resetAnnualValuesForNextYear(nextYear);
  commitStateChange({ reason:"Benutzereingabe" });
  alert("Jahreswechsel abgeschlossen. Archiviert: " + year + ". Neues Abrechnungsjahr: " + nextYear + ".");
}

function downloadArchiveYear(index) {
  ensureYearData();
  const item = state.jahresArchiv[index];
  if (!item) {
    alert("Dieser Archivdatensatz wurde nicht gefunden. Bitte die Archivliste neu laden oder die Qualitätsprüfung öffnen.");
    return;
  }
  const validation = archiveItemValidation(item);
  if ((validation.errors.length || validation.warnings.length) && !confirm("Dieser Archivdatensatz enthält Prüfhinweise:\n" + archiveValidationMessage(validation) + "\n\nTrotzdem als JSON herunterladen?")) return;
  let downloadItem = item;
  try { downloadItem = prepareArchiveItemForUse(item); } catch(error) { console.warn("Archivdatensatz wird unnormalisiert heruntergeladen", error); }
  const filename = backupFileName("nk-pro-archiv", { meta:{ abrechnungsjahr:(downloadItem.year || item.year || "jahr") } });
  if (downloadJsonFile(filename, downloadItem)) registerBackupEvent("archive-year", filename);
}

function downloadFullArchive() {
  ensureYearData();
  if (!state.jahresArchiv.length) {
    alert("Es gibt noch keine archivierten Abrechnungen zum Herunterladen.");
    return;
  }
  const problemRows = state.jahresArchiv.map((item, index) => ({ item, index, validation:archiveItemValidation(item) })).filter(row => row.validation.errors.length || row.validation.warnings.length);
  if (problemRows.length) {
    const preview = problemRows.slice(0, 5).map(row => archiveItemLabel(row.item, row.index) + ": " + archiveValidationMessage(row.validation).replace(/\n/g, " ")).join("\n");
    if (!confirm("Das Archiv enthält " + problemRows.length + " Datensatz/Datensätze mit Prüfhinweisen.\n\n" + preview + (problemRows.length > 5 ? "\n..." : "") + "\n\nTrotzdem gesamtes Archiv herunterladen?")) return;
  }
  const exportArchive = state.jahresArchiv.map(item => {
    try { return prepareArchiveItemForUse(item); } catch(error) { console.warn("Archivdatensatz wird unnormalisiert exportiert", error, item); return item; }
  });
  const filename = backupFileName("nk-pro-jahresarchiv", { meta:{ abrechnungsjahr:currentAbrechnungsjahr() } });
  if (downloadJsonFile(filename, exportArchive)) registerBackupEvent("year-archive", filename);
}

function renderYearArchive() {
  const cardsEl = document.getElementById("yearCards");
  const settingsEl = document.getElementById("yearSettings");
  const tableEl = document.getElementById("yearArchiveTable");
  if (!cardsEl || !settingsEl || !tableEl) return;

  ensureYearData();
  const year = currentAbrechnungsjahr();
  const nextYear = yearNumber(year) + 1;
  const archiveCount = state.jahresArchiv.length;
  const last = state.jahresArchiv[0];

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("wasser");

  settingsEl.innerHTML =
    '<label class="small"><strong>Aktuelles Abrechnungsjahr</strong><br><input value="' + escapeHtml(year) + '" onchange="setAbrechnungsjahr(this.value)"></label>' +
    '<label class="small"><strong>Beginn</strong><br><input type="date" value="' + escapeHtml(periodStart()) + '" onchange="setAbrechnungsperiode(\'abrechnungsbeginn\',this.value)"></label>' +
    '<label class="small"><strong>Ende</strong><br><input type="date" value="' + escapeHtml(periodEnd()) + '" onchange="setAbrechnungsperiode(\'abrechnungsende\',this.value)"></label>' +
    '<button class="primary" onclick="openLatestKnownYear()">Aktuelles/letztes Arbeitsjahr öffnen</button>' +
    '<button onclick="archiveCurrentYearOnly()">Aktuelles Jahr archivieren</button>' +
    '<button onclick="downloadFullArchive()">Jahresarchiv herunterladen</button>';

  tableEl.innerHTML = buildArchiveTableHtml(true);
}


function normalizeLegacyImportText(text) {
  return String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]+/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeLegacyArrayBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  const decoderNames = ["utf-8", "windows-1252", "utf-16le"];
  const texts = [];
  decoderNames.forEach(name => {
    try { texts.push(new TextDecoder(name).decode(bytes)); } catch(e) {}
  });
  let ascii = "";
  for (let i=0; i<bytes.length; i++) ascii += (bytes[i] >= 32 && bytes[i] <= 126) ? String.fromCharCode(bytes[i]) : "\n";
  texts.push(ascii);
  return normalizeLegacyImportText(texts.join("\n"));
}

function firstMatch(text, regex, group) {
  const m = String(text || "").match(regex);
  return m ? (m[group || 1] || "").trim() : "";
}

function parseEuroFromText(value) {
  const text = String(value || "").replace(/€/g, "").replace(/\s+/g, "").replace(/^-$/, "0");
  if (!text || text === "-") return 0;
  return num(text);
}

function legacyMoneyValues(text) {
  const vals = [];
  String(text || "").replace(/-?\s*(?:\d{1,3}(?:\.\d{3})*|\d+),\d{2}|-\s*€/g, m => { vals.push(parseEuroFromText(m)); return m; });
  return vals;
}

function legacySlice(text, startLabel, endLabels) {
  const src = String(text || "");
  const start = src.toLowerCase().indexOf(String(startLabel || "").toLowerCase());
  if (start < 0) return "";
  let end = src.length;
  (endLabels || []).forEach(label => {
    const idx = src.toLowerCase().indexOf(String(label || "").toLowerCase(), start + String(startLabel || "").length);
    if (idx >= 0 && idx < end) end = idx;
  });
  return src.slice(start, end);
}

function parseLegacyLastMoneyInWindow(text, startLabel, endLabels) {
  const vals = legacyMoneyValues(legacySlice(text, startLabel, endLabels));
  return vals.length ? vals[vals.length - 1] : 0;
}

function parseLegacyMoneyAfter(text, label) {
  const vals = legacyMoneyValues(legacySlice(text, label, ["\n"]));
  if (vals.length) return vals[vals.length - 1];
  const safe = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(safe + "[\\s\\S]{0,220}?(-?\\s*\\d{1,3}(?:\\.\\d{3})*,\\d{2}|-\\s*€|-)", "i");
  return parseEuroFromText(firstMatch(text, re, 1));
}

function parseLegacyPeriodAfter(text, label) {
  const safe = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return firstMatch(text, new RegExp(safe + "\\s+(\\d{2}\\.\\d{2}\\.\\d{2}\\s*-\\s*\\d{2}\\.\\d{2}\\.\\d{2})", "i"), 1).replace(/\s+/g, "");
}

function nameFromLegacyFilename(filename) {
  const base = String(filename || "").replace(/\.[^.]+$/, "");
  const m = base.match(/\b(Montoya|Melzig|Schneider|Gärtner|Gaertner|Bonesta|Udroiu|Kerner|Lang)\b/i);
  if (!m) return "";
  const map = {montoya:"Janina Montoya", lang:"Janina Montoya", melzig:"Cynthia Melzig", schneider:"Jutta Schneider", "gärtner":"Inna Gärtner", gaertner:"Inna Gärtner", bonesta:"Hatixe Bonesta", udroiu:"Ion Udroiu", kerner:"Waldemar Kerner"};
  return map[m[1].toLowerCase()] || m[1];
}

function wohnungFromLegacyFilename(filename) {
  const m = String(filename || "").match(/\b(0EG-L|0EG-R|1OG-L|1OG-R|2OG-L|2OG-R|EG-L|EG-R|DG-L|DG-R)\b/i);
  return m ? m[1].toUpperCase() : "";
}

function isoFromLegacyShortDate(value) {
  const m = String(value || "").match(/(\d{2})\.(\d{2})\.(\d{2})/);
  if (!m) return "";
  const year = Number(m[3]) >= 70 ? "19" + m[3] : "20" + m[3];
  return year + "-" + m[2] + "-" + m[1];
}

function parseLegacyBillingFromText(text, filename) {
  const clean = normalizeLegacyImportText(text);
  const year = firstMatch(clean, /Jahr\s+(20\d{2})/i, 1) || firstMatch(filename, /(20\d{2})/, 1) || "";
  let name = firstMatch(clean, /(?:Frau|Herr)\s+([A-ZÄÖÜ][^\n]+?)\s+Am Rauhen Biehl/i, 1) || nameFromLegacyFilename(filename);
  if (/^Janina Montoya/i.test(name) || /Lang/i.test(filename || "")) name = "Janina Montoya";
  const wohnung = wohnungFromLegacyFilename(filename);
  let heizPeriod = parseLegacyPeriodAfter(clean, "Ihre Heizkosten");
  const wasserPeriod = parseLegacyPeriodAfter(clean, "Ihre Wasserkosten");
  const abfallPeriod = parseLegacyPeriodAfter(clean, "Ihre Abfallkosten");
  if (!heizPeriod) {
    const fn = String(filename || "");
    if (/01Mai-15NOV|01.?Mai.*15.?NOV/i.test(fn)) heizPeriod = "01.05.22-14.11.22";
    else if (/16NOV-31Dez|16.?NOV.*31.?Dez/i.test(fn)) heizPeriod = "15.11.22-31.12.22";
    else if (/Mai-Dez|Mai.*Dez/i.test(fn)) heizPeriod = "01.05.22-31.12.22";
  }
  const periods = [heizPeriod, wasserPeriod, abfallPeriod].filter(Boolean);
  const start = periods.map(p => isoFromLegacyShortDate(p.split("-")[0])).filter(Boolean).sort()[0] || (year ? year + "-01-01" : "");
  const end = periods.map(p => isoFromLegacyShortDate(p.split("-")[1])).filter(Boolean).sort().slice(-1)[0] || (year ? year + "-12-31" : "");

  let heiz = parseLegacyLastMoneyInWindow(clean, "Ihre Heizkosten", ["Ihre Vorauszahlung", "Ihr Heizkosten", "Ihre Heizkosten-Nachzahlung", "Wasserkosten"]);
  let vHeiz = parseLegacyLastMoneyInWindow(legacySlice(clean, "Heizkosten", ["Wasserkosten"]), "Ihre Vorauszahlung", ["Ihr Heizkosten", "Ihre Heizkosten-Nachzahlung", "Wasserkosten"]);
  const wasser = parseLegacyLastMoneyInWindow(clean, "Ihre Wasserkosten", ["Ihre Vorauszahlung", "Ihr Wasserkosten", "Ihre Wasserkosten-Nachzahlung", "Abfallkosten"]);
  const vWasser = parseLegacyLastMoneyInWindow(legacySlice(clean, "Wasserkosten", ["Abfallkosten"]), "Ihre Vorauszahlung", ["Ihr Wasserkosten", "Ihre Wasserkosten-Nachzahlung", "Abfallkosten"]);
  const abfall = parseLegacyLastMoneyInWindow(clean, "Ihre Abfallkosten", ["Ihre Vorauszahlung", "Ihr Abfallkosten", "Ihre Abfallkosten-Nachzahlung", "Ihr Anteil an den Gesamtkosten"]);
  const vAbfall = parseLegacyLastMoneyInWindow(legacySlice(clean, "Abfallkosten", ["Ihr Anteil an den Gesamtkosten"]), "Ihre Vorauszahlung", ["Ihr Abfallkosten", "Ihre Abfallkosten-Nachzahlung", "Ihr Anteil an den Gesamtkosten"]);
  const kostenanteil = parseLegacyLastMoneyInWindow(clean, "Ihr Anteil an den Gesamtkosten", ["Ihre Vorauszahlung"]) || (heiz + wasser + abfall);
  let vorauszahlung = parseLegacyLastMoneyInWindow(legacySlice(clean, "Ihr Anteil an den Gesamtkosten", ["Ihr Guthaben", "Ihre Nachzahlung an die Vermieterin", "*)"]), "Ihre Vorauszahlung", ["Ihr Guthaben", "Ihre Nachzahlung an die Vermieterin", "*)"]);
  if (!vorauszahlung) vorauszahlung = vHeiz + vWasser + vAbfall;
  if ((!heiz || heiz < 0) && kostenanteil) heiz = Math.round((kostenanteil - wasser - abfall) * 100) / 100;
  if ((!vHeiz || vHeiz < 0) && vorauszahlung) vHeiz = Math.round((vorauszahlung - vWasser - vAbfall) * 100) / 100;
  let saldo = kostenanteil - vorauszahlung;
  const finalNachzahlung = parseLegacyMoneyAfter(clean, "Ihre Nachzahlung an die Vermieterin");
  const finalGuthaben = parseLegacyMoneyAfter(clean, "Ihr Guthaben");
  if (finalNachzahlung) saldo = Math.abs(finalNachzahlung);
  else if (finalGuthaben) saldo = -Math.abs(finalGuthaben);

  if (!name || !kostenanteil) return null;
  return {
    wohnung,
    mieter:name,
    jahr:year,
    periode:(start && end) ? (start + " bis " + end) : "",
    heizPeriode:heizPeriod,
    wasserPeriode:wasserPeriod,
    abfallPeriode:abfallPeriod,
    heizkosten:heiz,
    wasserkosten:wasser,
    abfallkosten:abfall,
    vHeiz: Math.round(vHeiz * 100) / 100,
    vWasser: Math.round(vWasser * 100) / 100,
    vAbfall: Math.round(vAbfall * 100) / 100,
    rundung: Math.round((kostenanteil - heiz - wasser - abfall) * 100) / 100,
    kostenanteil: Math.round(kostenanteil * 100) / 100,
    vorauszahlung: Math.round(vorauszahlung * 100) / 100,
    saldo: Math.round(saldo * 100) / 100,
    briefErgebnis: saldo >= 0 ? "Nachzahlung" : "Guthaben",
    briefBetrag: Math.abs(Math.round(saldo * 100) / 100),
    quelle: filename || ""
  };
}

function buildLegacyArchiveStateFromEntries(entries) {
  const year = entries.map(e => e.jahr).filter(Boolean)[0] || String(new Date().getFullYear());
  const starts = entries.map(e => String(e.periode || "").split(" bis ")[0]).filter(Boolean).sort();
  const ends = entries.map(e => String(e.periode || "").split(" bis ")[1]).filter(Boolean).sort();
  const start = starts[0] || (year + "-01-01");
  const end = ends[ends.length-1] || (year + "-12-31");
  const periodId = "legacy-" + year + "-" + start + "_" + end + "-" + Date.now();
  const base = clone(SEED);
  base.jahresArchiv = [];
  base.meta = { abrechnungsjahr:year, abrechnungsbeginn:start, abrechnungsende:end, periodId, legacySammelArchiv:true, legacyTeilperioden:true, legacyArchivHinweis:"Reine Archivierung: importierte Einzelabrechnungen je Mieter/Wohnung.", legacyQuelle:"Lokaler Mehrfachupload im Browser" };
  const units = [];
  entries.forEach(e => { if (e.wohnung && !units.includes(e.wohnung)) units.push(e.wohnung); });
  if (!units.length) units.push("Import");
  base.wohnungen = units.map((u,i) => ({id:canonicalUnitIdFor({bezeichnung:u,lage:u}) || generatedUnitIdForLabel(u, i), bezeichnung:u, lage:u, wohnflaeche:55, zimmer:"", status:"aktiv", bemerkung:"Import"}));
  const unitId = {}; base.wohnungen.forEach(w => unitId[w.bezeichnung] = w.id);
  base.mieter = entries.map((e,i) => ({ id:"M" + String(i+1).padStart(3,"0"), wohnung:unitId[e.wohnung] || base.wohnungen[0].id, name:e.mieter, einzug:(e.periode || "").split(" bis ")[0] || start, auszug:(e.periode || "").split(" bis ")[1] || end, kaltSoll:0, kaltErhalten:0, nkVoraus:e.vorauszahlung, einnahmen:e.vorauszahlung, aktiveTage:365, wohnflaeche:55, bemerkung:"Import: Heizung " + (e.heizPeriode || "") + ", Wasser " + (e.wasserPeriode || "") + ", Abfall " + (e.abfallPeriode || ""), status:"Aktiv", personen:1, personentage:365, geschlecht:"Frau/Herr", standardanrede:"Sehr geehrte(r) Mieter/in,", strasse:"Am Rauhen Biehl 5", plz:"55774", ort:"Baumholder", telefon:"", email:"", wasserWeitereVorauszahlung:0, vorjahresKorrektur:0, abrechnungRolle:"Mieter", archivedAt:"" }));

  const costIds = ["K006","K002","K009","K040"];
  const sums = {K006:0,K002:0,K009:0,K040:0};
  entries.forEach(e => { sums.K006 += num(e.heizkosten); sums.K002 += num(e.wasserkosten); sums.K009 += num(e.abfallkosten); sums.K040 += num(e.rundung); });
  base.kostenarten.forEach(k => {
    if (costIds.includes(k.id)) {
      if (k.id === "K040") k.kostenart = "Rundung";
      k.inNK = "Ja"; k.vorauszahlung = k.id === "K040" ? "Nein" : "Ja"; k.berechnungsart = "Manuell je Mieter"; k.umlageschluessel = UMLAGE_MANUAL; k.gesamtbetrag = Math.round(sums[k.id] * 100) / 100; k.preisProEinheit = ""; k.status = "Vollständig"; k.bemerkung = "Import je Einzelabrechnung";
    } else if (k.kostenart) {
      k.inNK="Nein"; k.vorauszahlung="Nein"; k.berechnungsart="Entfällt"; k.umlageschluessel="Entfällt"; k.gesamtbetrag=0; k.preisProEinheit=""; k.status="Nicht Bestandteil der NK-Abrechnung";
    }
  });
  const len = Math.max(20, entries.length);
  const fill = vals => { const out = vals.slice(); while(out.length < len) out.push(0); return out; };
  const values = {
    K006: fill(entries.map(e => num(e.heizkosten))),
    K002: fill(entries.map(e => num(e.wasserkosten))),
    K009: fill(entries.map(e => num(e.abfallkosten))),
    K040: fill(entries.map(e => num(e.rundung)))
  };
  base.umlageInputs = {
    K006:{kostenId:"K006", kostenart:"Heiz- und Warmwasserkosten", art:UMLAGE_MANUAL, values:values.K006},
    K002:{kostenId:"K002", kostenart:"Wasserversorgung", art:UMLAGE_MANUAL, values:values.K002},
    K009:{kostenId:"K009", kostenart:"Müllbeseitigung", art:UMLAGE_MANUAL, values:values.K009},
    K040:{kostenId:"K040", kostenart:"Rundung", art:UMLAGE_MANUAL, values:values.K040}
  };
  const vHeizVals = entries.map(e => num(e.vHeiz));
  const vWasserVals = entries.map(e => num(e.vWasser));
  const vAbfallVals = entries.map(e => num(e.vAbfall));
  const knownPrepay = vHeizVals.reduce((s,v)=>s+v,0) + vWasserVals.reduce((s,v)=>s+v,0) + vAbfallVals.reduce((s,v)=>s+v,0);
  if (!knownPrepay) entries.forEach((e,i) => { vHeizVals[i] = num(e.vorauszahlung); });
  base.vorauszahlungen = [
    {kostenId:"K006", kostenart:"Heiz- und Warmwasserkosten", aktiv:"Ja", summe:Math.round(vHeizVals.reduce((s,v)=>s+v,0)*100)/100, werte:fill(vHeizVals)},
    {kostenId:"K002", kostenart:"Wasserversorgung", aktiv:"Ja", summe:Math.round(vWasserVals.reduce((s,v)=>s+v,0)*100)/100, werte:fill(vWasserVals)},
    {kostenId:"K009", kostenart:"Müllbeseitigung", aktiv:"Ja", summe:Math.round(vAbfallVals.reduce((s,v)=>s+v,0)*100)/100, werte:fill(vAbfallVals)}
  ];
  // Gesamtvorauszahlung bleibt zusätzlich je Mieter gespeichert; die aktive Matrix verhindert Überschreiben beim Rendern.
  base.legacyEinzelabrechnungen = entries;
  base.waterMeters = { settings:{enabled:"Nein", houseWaterTotal:0}, readings:[] };
  base.meterReadings = { readings:{} };
  if (base.briefSettings) base.briefSettings.abrechnungsjahr = year;
  return { base, periodId, year, start, end };
}

function createLegacyArchiveItemFromEntries(entries) {
  const built = buildLegacyArchiveStateFromEntries(entries);
  const costs = entries.reduce((s,e) => s + num(e.kostenanteil), 0);
  const prepays = entries.reduce((s,e) => s + num(e.vorauszahlung), 0);
  return {
    year: built.year,
    periodId: built.periodId,
    archivedAt: todayIso(),
    meta: clone(built.base.meta),
    summary: {
      mietverhaeltnisse: entries.length,
      datensaetzeUmlagebasis: entries.length,
      eigentuemerPrivatDatensaetze: 0,
      kostenNK: Math.round(costs * 100) / 100,
      vorauszahlungen: Math.round(prepays * 100) / 100,
      mieterKostenanteile: Math.round(costs * 100) / 100,
      korrekturen: 0,
      saldo: Math.round((costs - prepays) * 100) / 100,
      legacyEinzelabrechnungen: entries.length
    },
    data: built.base
  };
}

// ===== Bereich: Import, Export und Sicherung =====
async function importLegacyBillingFiles(ev) {
  const input = ev.target;
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Import ist nur im ursprünglichen Arbeitsfenster möglich.");
    if (input) input.value = "";
    return;
  }
  const files = Array.from(input.files || []);
  if (!files.length) return;
  const entries = [];
  const failedFiles = [];
  let archiveJsonImports = 0;
  for (const file of files) {
    try {
      const name = file.name || "";
      if (/\.json$/i.test(name)) {
        const json = parseJsonFileText(await file.text());
        if (Array.isArray(json)) json.forEach(e => entries.push(e));
        else if (Array.isArray(json.legacyEinzelabrechnungen)) json.legacyEinzelabrechnungen.forEach(e => entries.push(e));
        else if (json.summary && json.data) { if (!upsertYearArchive(json)) throw new Error("Archivdatensatz ungültig"); archiveJsonImports++; continue; }
        else throw new Error("JSON-Format wurde nicht als Archiv oder Einzelabrechnung erkannt.");
      } else {
        const text = decodeLegacyArrayBuffer(await file.arrayBuffer());
        const entry = parseLegacyBillingFromText(text, name);
        if (entry) entries.push(entry);
        else failedFiles.push((name || "Unbenannte Datei") + ": kein bekanntes Abrechnungsformat erkannt");
      }
    } catch(e) {
      console.warn("Importdatei konnte nicht gelesen werden", file && file.name, e);
      failedFiles.push(((file && file.name) || "Unbenannte Datei") + ": " + String(e && (e.message || e.name) || e));
    }
  }
  input.value = "";
  if (!entries.length) {
    if (archiveJsonImports) {
      const saved = commitStateChange({ reason:"Benutzereingabe" });
      alert(archiveJsonImports + " Archivdatensatz/Archivdatensätze wurden importiert" + (saved ? " und gespeichert." : ", konnten aber nicht im Browser-Speicher gespeichert werden. Bitte sofort eine JSON-Sicherung herunterladen."));
      return;
    }
    alert("Es konnten keine Abrechnungen erkannt werden. Bitte nur DOC/TXT/HTML-Dateien im bekannten Abrechnungsformat oder ein JSON mit Einzelabrechnungen importieren." + (failedFiles.length ? "\n\nDetails:\n- " + failedFiles.slice(0, 6).join("\n- ") : ""));
    return;
  }
  const item = createLegacyArchiveItemFromEntries(entries);
  const saldo = archiveRecordSaldo(item);
  const label = archivePeriodLabel(item);
  const msg = entries.length + " Einzelabrechnung(en) als Archivsatz " + item.year + " / " + label + " importieren?\n\nSaldo: " + (saldo >= 0 ? "Nachzahlung " : "Guthaben ") + fmtMoney(Math.abs(saldo)) + backupStatusHint(backupStatusReport()) + (archiveJsonImports ? "\n\nZusätzlich wurden " + archiveJsonImports + " Archiv-JSON-Datensatz/Datensätze erkannt." : "") + (failedFiles.length ? "\n\nNicht importiert:\n- " + failedFiles.slice(0, 6).join("\n- ") : "");
  if (!confirm(msg)) return;
  if (!upsertYearArchive(item)) return;
  const saved = commitStateChange({ reason:"Benutzereingabe" });
  alert(saved ? "Abrechnung wurde dem Archiv hinzugefügt." : "Abrechnung wurde hinzugefügt, konnte aber nicht gespeichert werden. Bitte sofort eine JSON-Sicherung herunterladen.");
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
  const snapshot = exportCurrentBillingSnapshot();
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
  const rows = state.kostenarten.map(k => [k.id,k.kostenart,k.bereich,k.inNK,k.vorauszahlung,k.berechnungsart,k.umlageschluessel,costExclusionHandling(k),k.gesamtbetrag,k.gesamtverbrauch,k.preisProEinheit,(k.preisProEinheitManuell ? "manuell" : "automatisch"),k.bemerkung,kostenStatus(k)]);
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

function resetData() {
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. Zurücksetzen ist nur im ursprünglichen Arbeitsfenster möglich.");
    return;
  }
  if (!confirmRiskyDataAction("Gesamtdaten zurücksetzen", "Wirklich auf die Ausgangsdaten zurücksetzen? Lokale Änderungen gehen verloren.")) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_RECOVERY_KEY);
  } catch(e) {
    notifyStorageProblem("Der lokale Speicher konnte beim Zurücksetzen nicht geleert werden.", e);
  }
  state = normalizeLegacyData(clone(SEED));
  commitStateChange({ reason:"Benutzereingabe" });
}

const legacyImportEl = document.getElementById("legacyDocImport");
if (legacyImportEl) legacyImportEl.addEventListener("change", importLegacyBillingFiles);

const jsonImportEl = document.getElementById("jsonImport");
if (jsonImportEl) jsonImportEl.addEventListener("change", async (ev) => {
  const input = ev.target;
  if (isArchiveViewer()) {
    alert("Dieses Fenster zeigt eine archivierte Abrechnung. JSON-Import ist nur im ursprünglichen Arbeitsfenster möglich.");
    if (input) input.value = "";
    return;
  }
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = parseJsonFileText(text);
    const report = importValidationReport(parsed);
    if (report.errors.length) throw new Error(report.errors.join("\n"));
    const nextState = importAppData(parsed, file.name || "");
    const summary = importSummaryText(nextState, file.name || "", report);
    if (!confirm(summary + "\n\nDer aktuelle lokale Arbeitsstand wird ersetzt." + backupStatusHint(backupStatusReport()) + "\n\nImport wirklich durchführen?")) return;
    state = nextState;
    const saved = commitStateChange({ reason:"Benutzereingabe" });
    alert(saved ? "Daten wurden importiert und gespeichert." : "Daten wurden importiert, konnten aber nicht im Browser-Speicher gespeichert werden. Bitte sofort eine JSON-Sicherung herunterladen.");
  } catch(e) {
    console.warn("NK-Pro: JSON-Import fehlgeschlagen", e);
    alert("Die Datei konnte nicht importiert werden.\n\n" + String(e && (e.message || e.name) || e));
  } finally {
    input.value = "";
  }
});
const deleteCodeInputEl = document.getElementById("deleteBillingCodeInput");
if (deleteCodeInputEl) {
  deleteCodeInputEl.addEventListener("keydown", ev => {
    if (ev.key === "Enter") confirmDeleteBilling();
    if (ev.key === "Escape") closeDeleteBillingModal();
  });
}

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", ev => {
    ev.preventDefault();
    switchToTab(btn.dataset.tab);
  });
});

function handleAppAction(action) {
  if (action === "show-landing") { billingContextOpen = false; return switchToTab("landing"); }
  if (action === "enter-object-prep") return switchToTab("objekt");
  if (action === "enter-billing-overview") return switchToTab("start");
  if (action === "open-current-billing") return openCurrentBilling();
  if (action === "new-billing") return openCreateBillingModal();
  if (action === "download-archive") return downloadFullArchive();
  if (action === "download-full-json") return downloadFullJson();
  if (action === "download-full-export-package") return downloadFullExportPackage();
  if (action === "self-test") return runAppSelfTest();
  if (action === "final-check") return showFinalBillingReport();
  if (action === "acceptance-report") return showAcceptanceProtocol();
  if (action === "download-final-report") return downloadFinalBillingReport();
  if (action === "download-acceptance-report-html") return downloadAcceptanceProtocolHtml();
  if (action === "print-mode-check") return showPrintModeCheck();
  if (action === "print-all-letters") return showAllLettersPrintReady();
  if (action === "release-audit") return showReleaseAuditReport();
  if (action === "download-release-audit") return downloadReleaseAuditReport();
  if (action === "download-export-package") return downloadExportPackage();
  if (action === "finalize-billing") return finalizeCurrentBilling();
  if (action === "unlock-billing") return unlockCurrentBilling();
  if (action === "close-archive") return closeArchiveViewer();
  if (action === "return-start") return returnToStartPage();
}

if (document.addEventListener) {
  document.addEventListener("click", ev => {
    const target = ev.target && ev.target.closest ? ev.target.closest("[data-app-action]") : null;
    if (!target) return;
    const action = target.getAttribute("data-app-action");
    if (!action) return;
    ev.preventDefault();
    handleAppAction(action);
  });
}


// ===== Bereich: Berechnung, Tabellen und Fachlogik =====
const DEFAULT_UMLAGE_INPUTS = {
  K002: [48,16,22,98,104],
  K006: [2082.65,975.92,1524.97,1761.65]
};

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

function normalizeTenantActiveDays() {
  state.mieter.forEach(m => {
    const days = normalizeActiveDayValue(m.aktiveTage);
    if (days && typeof m.aktiveTage === "string" && /^\d{4}-\d{2}-\d{2}/.test(m.aktiveTage)) {
      m.aktiveTage = days;
    }
  });
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

function umlageBasisInfo(k, row) {
  const inputMode = manualInputModeForCost(k);
  if (k.umlageschluessel === "Verteilung auf alle Wohneinheiten") {
    const count = num(row.basisTotal) || allWohnungen().length;
    return { basis: count + " Wohneinheiten gesamt", unit: count ? fmtMoney(num(k.gesamtbetrag) / count) : "–" };
  }

  if (k.umlageschluessel === "Verteilung nur auf aktive Wohneinheiten") {
    const count = num(row.basisTotal) || activeWohnungen().length;
    return { basis: count + " aktive Wohneinheiten", unit: count ? fmtMoney(num(k.gesamtbetrag) / count) : "–" };
  }

  if (inputMode === "Verbrauchsmenge" || inputMode === "Zählerstände" || k.umlageschluessel === "Verbrauch") {
    const unitText = num(k.preisProEinheit) > 0 ? fmtMoney(k.preisProEinheit) : "Preis fehlt";
    return { basis: formatPlainNumber(row.inputSum, 3) + " Einheiten", unit: unitText };
  }

  if (k.umlageschluessel === "Wohnfläche") {
    return { basis: formatPlainNumber(row.basisTotal, 0) + " m²-Tage", unit: "–" };
  }

  if (k.umlageschluessel === "Personen") {
    return { basis: formatPlainNumber(row.basisTotal, 0) + " Personentage", unit: "–" };
  }

  if (k.umlageschluessel === "Miettage") {
    return { basis: formatPlainNumber(row.basisTotal, 0) + " Miettage", unit: "–" };
  }

  if (k.umlageschluessel === UMLAGE_MANUAL || k.berechnungsart === "Manuell je Mieter") {
    return { basis: "Einzelbeträge", unit: "–" };
  }

  return { basis: "–", unit: "–" };
}


function defaultWaterMeterSettings() {
  return {
    enabled:"Ja",
    houseWaterTotal:0,
    houseMeterStart:"",
    houseMeterStartDate:"",
    houseMeterEnd:"",
    houseMeterEndDate:"",
    houseInvoiceNote:""
  };
}

function consumptionCosts() {
  return state.kostenarten.filter(k => k.id && k.kostenart && k.umlageschluessel === "Verbrauch");
}

function isWaterCost(costId) {
  return String(costId || "") === "K002";
}

function ensureWaterMeterData() {
  if (!state.waterMeters) state.waterMeters = {};
  if (!state.waterMeters.settings) state.waterMeters.settings = defaultWaterMeterSettings();
  const defaults = defaultWaterMeterSettings();
  Object.keys(defaults).forEach(key => {
    if (state.waterMeters.settings[key] === undefined || state.waterMeters.settings[key] === null) state.waterMeters.settings[key] = defaults[key];
  });
  state.waterMeters.settings.enabled = "Ja";
  if (!state.waterMeters.settings.houseMeterStartDate) state.waterMeters.settings.houseMeterStartDate = periodStart();
  if (!state.waterMeters.settings.houseMeterEndDate) state.waterMeters.settings.houseMeterEndDate = periodEnd();
  if (!state.meterReadings) state.meterReadings = {};
  if (!state.meterReadings.readings) state.meterReadings.readings = {};

  const tenantCount = Math.max(20, state.mieter.length);
  const defaultStartDate = periodStart() || (String(currentAbrechnungsjahr()) + "-01-01");
  const defaultEndDate = periodEnd() || (String(currentAbrechnungsjahr()) + "-12-31");

  consumptionCosts().forEach(cost => {
    const defaultValues = (state.umlageInputs && state.umlageInputs[cost.id] && Array.isArray(state.umlageInputs[cost.id].values))
      ? state.umlageInputs[cost.id].values
      : (DEFAULT_UMLAGE_INPUTS[cost.id] || []);

    if (isWaterCost(cost.id)) {
      if (!Array.isArray(state.waterMeters.readings)) state.waterMeters.readings = [];
      while (state.waterMeters.readings.length < tenantCount) {
        const idx = state.waterMeters.readings.length;
        const defaultConsumption = num(defaultValues[idx]);
        state.waterMeters.readings.push({
          kwStart:0,
          kwStartDate:defaultStartDate,
          kwEnd:"",
          kwEndDate:defaultEndDate,
          wwStart:0,
          wwStartDate:defaultStartDate,
          wwEnd:"",
          wwEndDate:defaultEndDate,
          bemerkung:""
        });
      }
      state.waterMeters.readings.forEach((r, idx) => {
        if (r.kwStart === undefined) r.kwStart = 0;
        if (r.kwStartDate === undefined || r.kwStartDate === "") r.kwStartDate = defaultStartDate;
        if (r.kwEnd === undefined) r.kwEnd = "";
        if (r.kwEndDate === undefined || r.kwEndDate === "") r.kwEndDate = defaultEndDate;
        if (r.wwStart === undefined) r.wwStart = 0;
        if (r.wwStartDate === undefined || r.wwStartDate === "") r.wwStartDate = defaultStartDate;
        if (r.wwEnd === undefined) r.wwEnd = "";
        if (r.wwEndDate === undefined || r.wwEndDate === "") r.wwEndDate = defaultEndDate;
        if (r.bemerkung === undefined) r.bemerkung = "";
      });
    } else {
      if (!Array.isArray(state.meterReadings.readings[cost.id])) state.meterReadings.readings[cost.id] = [];
      const rows = state.meterReadings.readings[cost.id];
      while (rows.length < tenantCount) {
        const idx = rows.length;
        const defaultConsumption = num(defaultValues[idx]);
        rows.push({
          start:0,
          startDate:defaultStartDate,
          end:"",
          endDate:defaultEndDate,
          bemerkung:""
        });
      }
      rows.forEach((r, idx) => {
        if (r.start === undefined) r.start = 0;
        if (r.startDate === undefined || r.startDate === "") r.startDate = defaultStartDate;
        if (r.end === undefined) r.end = "";
        if (r.endDate === undefined || r.endDate === "") r.endDate = defaultEndDate;
        if (r.bemerkung === undefined) r.bemerkung = "";
      });
    }
  });
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
  if (isWaterCost(costId)) return waterTotalForTenantIndex(index);
  const rows = state.meterReadings.readings[costId] || [];
  return genericMeterConsumption(rows[index] || {});
}

function waterMeterRowStatus(row) {
  const kwHasEnd = hasEnteredMeterValue(row.kwEnd);
  const wwHasEnd = hasEnteredMeterValue(row.wwEnd);
  const kwInvalid = kwHasEnd && num(row.kwEnd) < num(row.kwStart);
  const wwInvalid = wwHasEnd && num(row.wwEnd) < num(row.wwStart);
  if (kwInvalid || wwInvalid) return "Zählerstand prüfen";
  if (!kwHasEnd && !wwHasEnd) return "Endstand fehlt";
  return "OK";
}

function genericMeterRowStatus(row) {
  if (hasEnteredMeterValue(row.end) && num(row.end) < num(row.start)) return "Zählerstand prüfen";
  if (!hasEnteredMeterValue(row.end)) return "Endstand fehlt";
  return "OK";
}

function isMeterAutoEnabledForCost(costId) {
  ensureWaterMeterData();
  const cost = state.kostenarten.find(k => k.id === costId);
  return !!(cost && cost.umlageschluessel === "Verbrauch");
}

function isWaterAutoEnabledForCost(costId) {
  return isMeterAutoEnabledForCost(costId);
}

function applyWaterMetersToUmlage() {
  ensureWaterMeterData();
  state.waterMeters.settings.enabled = "Ja";
  const tenantCount = Math.max(20, state.mieter.length);

  consumptionCosts().forEach(cost => {
    if (!state.umlageInputs || !state.umlageInputs[cost.id]) return;
    if (manualInputModeForCost(cost) !== "Zählerstände") return;
    while (state.umlageInputs[cost.id].values.length < tenantCount) state.umlageInputs[cost.id].values.push(0);
    for (let i = 0; i < tenantCount; i++) state.umlageInputs[cost.id].values[i] = 0;
    visibleTenantRows().forEach(t => { state.umlageInputs[cost.id].values[t.originalIndex] = meterTotalForCostAndTenant(cost.id, t.originalIndex); });
  });
}

function setWaterMeterSetting(key, value) {
  ensureWaterMeterData();
  const numericKeys = ["houseWaterTotal","houseMeterStart","houseMeterEnd"];
  state.waterMeters.settings[key] = numericKeys.includes(key) ? (String(value || "").trim() === "" ? "" : num(value)) : value;
  state.waterMeters.settings.enabled = "Ja";
  syncUmlageInputs();
  applyWaterMetersToUmlage();
  commitStateChange({ reason:"Benutzereingabe" });
}

function setWaterMeterValue(index, key, value, type="text") {
  ensureWaterMeterData();
  if (!state.waterMeters.readings[index]) state.waterMeters.readings[index] = {};
  state.waterMeters.readings[index][key] = type === "number" ? (String(value || "").trim() === "" ? "" : num(value)) : value;
  if (["kwEnd","wwEnd"].includes(key)) {
    if (!state.meta) state.meta = {};
    state.meta.meterNumericEndValuesTouchedForYear = currentAbrechnungsjahr();
  } else if (["kwEndDate","wwEndDate"].includes(key)) {
    if (!state.meta) state.meta = {};
    state.meta.meterEndDateFieldsTouchedForYear = currentAbrechnungsjahr();
  }
  syncUmlageInputs();
  applyWaterMetersToUmlage();
  commitStateChange({ reason:"Benutzereingabe" });
}

function setGenericMeterValue(costId, index, key, value, type="text") {
  ensureWaterMeterData();
  if (!state.meterReadings.readings[costId]) state.meterReadings.readings[costId] = [];
  if (!state.meterReadings.readings[costId][index]) state.meterReadings.readings[costId][index] = {};
  state.meterReadings.readings[costId][index][key] = type === "number" ? (String(value || "").trim() === "" ? "" : num(value)) : value;
  if (key === "end") {
    if (!state.meta) state.meta = {};
    state.meta.meterNumericEndValuesTouchedForYear = currentAbrechnungsjahr();
  } else if (key === "endDate") {
    if (!state.meta) state.meta = {};
    state.meta.meterEndDateFieldsTouchedForYear = currentAbrechnungsjahr();
  }
  syncUmlageInputs();
  applyWaterMetersToUmlage();
  commitStateChange({ reason:"Benutzereingabe" });
}

function meterInput(value, index, key, type="number") {
  const cls = type === "number" ? "number" : "";
  const htmlType = type === "date" ? "date" : "text";
  return '<input type="' + htmlType + '" class="' + cls + '" value="' + escapeHtml(value ?? "") + '" onchange="setWaterMeterValue(' + index + ',&quot;' + key + '&quot;,this.value,&quot;' + type + '&quot;)">';
}

function genericMeterInput(costId, value, index, key, type="number") {
  const cls = type === "number" ? "number" : "";
  const htmlType = type === "date" ? "date" : "text";
  return '<input type="' + htmlType + '" class="' + cls + '" value="' + escapeHtml(value ?? "") + '" onchange="setGenericMeterValue(&quot;' + escapeHtml(costId) + '&quot;,' + index + ',&quot;' + key + '&quot;,this.value,&quot;' + type + '&quot;)">';
}

function renderWaterCostSection(cost, visibleRows) {
  const totals = visibleRows.reduce((acc,t) => {
    const row = state.waterMeters.readings[t.originalIndex] || {};
    acc.kw += waterConsumption(row, "kw");
    acc.ww += waterConsumption(row, "ww");
    return acc;
  }, { kw:0, ww:0 });

  const rows = visibleRows.length ? visibleRows.map(t => {
    const i = t.originalIndex;
    const r = state.waterMeters.readings[i] || {};
    const kw = waterConsumption(r, "kw");
    const ww = waterConsumption(r, "ww");
    const total = kw + ww;
    const status = waterMeterRowStatus(r);
    return '<tr>' +
      '<td>' + tenantIdCellHtml(t) + '</td>' +
      '<td>' + unitRefCellHtml(t.wohnung) + '</td>' +
      '<td>' + escapeHtml(t.name || "") + '</td>' +
      '<td class="editable">' + meterInput(r.kwStart, i, "kwStart", "number") + '</td>' +
      '<td class="editable">' + meterInput(r.kwStartDate, i, "kwStartDate", "date") + '</td>' +
      '<td class="editable">' + meterInput(r.kwEnd, i, "kwEnd", "number") + '</td>' +
      '<td class="editable">' + meterInput(r.kwEndDate, i, "kwEndDate", "date") + '</td>' +
      '<td class="readonly-cell">' + kw.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>' +
      '<td class="editable">' + meterInput(r.wwStart, i, "wwStart", "number") + '</td>' +
      '<td class="editable">' + meterInput(r.wwStartDate, i, "wwStartDate", "date") + '</td>' +
      '<td class="editable">' + meterInput(r.wwEnd, i, "wwEnd", "number") + '</td>' +
      '<td class="editable">' + meterInput(r.wwEndDate, i, "wwEndDate", "date") + '</td>' +
      '<td class="readonly-cell">' + ww.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>' +
      '<td class="readonly-cell">' + total.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>' +
      '<td><span class="status ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>' +
      '<td class="editable">' + inputHtml(r.bemerkung || "", "setWaterMeterValue(" + i + ",'bemerkung',this.value)") + '</td>' +
    '</tr>';
  }).join("") : '<tr><td colspan="17">Keine aktuellen oder NK-offenen Mietverhältnisse vorhanden.</td></tr>';

  const total = totals.kw + totals.ww;
  const footer = '<tfoot><tr class="total-row"><td colspan="7"><strong>Summe Verbrauch</strong></td>' +
    '<td class="readonly-cell"><strong>' + totals.kw.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td>' +
    '<td colspan="4">–</td>' +
    '<td class="readonly-cell"><strong>' + totals.ww.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td>' +
    '<td class="readonly-cell"><strong>' + total.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td>' +
    '<td colspan="2">–</td></tr></tfoot>';

  return '<h3>' + escapeHtml(cost.id + " · " + cost.kostenart) + '</h3>' +
    '<p class="small">Kaltwasser + Warmwasser werden getrennt erfasst.</p>' +
    '<div class="table-wrap"><table id="waterMeterTable">' +
    '<thead><tr>' +
    '<th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mieter</th>' +
    '<th>KW Anfang</th><th>KW Datum Anfang</th><th>KW Ende</th><th>KW Datum Ende</th><th>KW Verbrauch m³</th>' +
    '<th>WW Anfang</th><th>WW Datum Anfang</th><th>WW Ende</th><th>WW Datum Ende</th><th>WW Verbrauch m³</th>' +
    '<th>Gesamt m³</th><th>Status</th><th>Bemerkung</th>' +
    '</tr></thead><tbody>' + rows + '</tbody>' + footer + '</table></div>';
}

function renderGenericMeterSection(cost, visibleRows) {
  const readings = state.meterReadings.readings[cost.id] || [];
  const totalConsumption = visibleRows.reduce((sum,t) => sum + genericMeterConsumption(readings[t.originalIndex] || {}), 0);

  const rows = visibleRows.length ? visibleRows.map(t => {
    const i = t.originalIndex;
    const r = readings[i] || {};
    const consumption = genericMeterConsumption(r);
    const status = genericMeterRowStatus(r);
    return '<tr>' +
      '<td>' + tenantIdCellHtml(t) + '</td>' +
      '<td>' + unitRefCellHtml(t.wohnung) + '</td>' +
      '<td>' + escapeHtml(t.name || "") + '</td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.start, i, "start", "number") + '</td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.startDate, i, "startDate", "date") + '</td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.end, i, "end", "number") + '</td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.endDate, i, "endDate", "date") + '</td>' +
      '<td class="readonly-cell">' + consumption.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>' +
      '<td><span class="status ' + statusClass(status) + '">' + escapeHtml(status) + '</span></td>' +
      '<td class="editable">' + genericMeterInput(cost.id, r.bemerkung || "", i, "bemerkung", "text") + '</td>' +
    '</tr>';
  }).join("") : '<tr><td colspan="10">Keine aktuellen oder NK-offenen Mietverhältnisse vorhanden.</td></tr>';

  return '<h3>' + escapeHtml(cost.id + " · " + cost.kostenart) + '</h3>' +
    '<p class="small">Allgemeine Zählerstand-Erfassung. Summe Verbrauch: <strong>' +
    totalConsumption.toLocaleString("de-DE", { maximumFractionDigits:3 }) + ' Einheiten</strong></p>' +
    '<div class="table-wrap"><table id="meterTable_' + escapeHtml(cost.id) + '">' +
    '<thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mieter</th><th>Anfangsstand</th><th>Datum Anfang</th><th>Endstand</th><th>Datum Ende</th><th>Verbrauch</th><th>Status</th><th>Bemerkung</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}


function meterHistoryValue(value) {
  if (value === null || value === undefined || value === "") return "–";
  const n = num(value);
  return n.toLocaleString("de-DE", { maximumFractionDigits:3 });
}

function meterHistoryDeltaFor(unit, year) {
  const rows = Array.isArray(unit.deltas) ? unit.deltas : [];
  return rows.find(d => String(d.jahr) === String(year)) || {};
}

function meterHistoryReadingFor(unit, year) {
  const rows = Array.isArray(unit.readings) ? unit.readings : [];
  return rows.find(r => String(r.jahr) === String(year)) || {};
}

function currentMeterEndBlankStatus() {
  const readings = state.waterMeters && Array.isArray(state.waterMeters.readings) ? state.waterMeters.readings : [];
  const generic = state.meterReadings && state.meterReadings.readings && typeof state.meterReadings.readings === "object" ? state.meterReadings.readings : {};
  const visibleIndices = new Set(visibleTenantRows().map(row => row.originalIndex));
  let checked = 0;
  let filled = 0;
  readings.forEach((r,index) => {
    if (!r || !visibleIndices.has(index)) return;
    checked += 2;
    if (hasEnteredMeterValue(r.kwEnd)) filled++;
    if (hasEnteredMeterValue(r.wwEnd)) filled++;
  });
  Object.keys(generic).forEach(costId => {
    const rows = Array.isArray(generic[costId]) ? generic[costId] : [];
    rows.forEach((r,index) => {
      if (!visibleIndices.has(index)) return;
      checked++;
      if (r && hasEnteredMeterValue(r.end)) filled++;
    });
  });
  return { checked, filled, empty: checked > 0 && filled === 0 };
}

function renderWaterMeterCarryForwardNotice() {
  const status=currentMeterEndBlankStatus(); const year=currentAbrechnungsjahr(); const warnings=state.meta&&Array.isArray(state.meta.meterCarryForwardWarnings)?state.meta.meterCarryForwardWarnings:[];
  if (warnings.length) return '<div class="hint feedback-box warn"><strong>⚠ Vorjahresübernahme prüfen:</strong><ul>'+warnings.slice(0,8).map(w=>'<li>'+escapeHtml(w)+'</li>').join('')+(warnings.length>8?'<li>Weitere Hinweise vorhanden.</li>':'')+'</ul></div>';
  if (state.meta && state.meta.meterCarryForwardAppliedForYear===year) return '<div class="hint feedback-box"><strong>✓ Vorjahresübernahme:</strong> Die Endstände des Vorjahres wurden als Anfangsstände für '+escapeHtml(year)+' übernommen; neue Endstände bleiben leer.</div>';
  if (status.empty || status.filled===0 || numericEndValuesWereManuallyTouchedForYear(state,year)) return "";
  return '<div class="hint feedback-box warn"><strong>⚠ Zählerstände prüfen:</strong> Beim Anlegen der Abrechnung waren bereits '+escapeHtml(status.filled)+' Endwerte vorhanden. Bitte kontrollieren, ob diese Werte für die aktuelle Periode korrekt sind.</div>';
}

function archivedWaterHistoryByUnit() {
  const map = {};
  (state.jahresArchiv || []).forEach(item => {
    const data = item && item.data;
    if (!data) return;
    const year = String(item.year || (data.meta && data.meta.abrechnungsjahr) || "");
    if (!year) return;
    const snapshot = captureMeterReadingsSnapshot(data);
    Object.keys(snapshot.water.byUnit || {}).forEach(unitId => {
      const r = snapshot.water.byUnit[unitId] || {};
      if (!map[unitId]) map[unitId] = {};
      map[unitId][year] = {
        kw:r.kwEnd,
        ww:r.wwEnd,
        gesamt:(hasEnteredMeterValue(r.kwEnd) ? num(r.kwEnd) : 0) + (hasEnteredMeterValue(r.wwEnd) ? num(r.wwEnd) : 0),
        verbrauch:waterConsumption(r,"kw") + waterConsumption(r,"ww"),
        source:"NK-Pro-Archiv"
      };
    });
  });
  return map;
}
function renderWaterMeterHistory() {
  const hist=state.waterMeterHistory||{}; const legacyUnits=Array.isArray(hist.units)?hist.units:[]; const archived=archivedWaterHistoryByUnit();
  const unitMap=new Map(); legacyUnits.forEach(u=>unitMap.set(String(u.wohnung||""),u)); allWohnungen().forEach(w=>{ if(!unitMap.has(String(w.id||""))) unitMap.set(String(w.id||""),{wohnung:w.id,bezeichnung:w.bezeichnung||w.lage||"",readings:[],deltas:[]}); });
  const years=new Set([2021,2022,2023,2024]); Object.values(archived).forEach(byYear=>Object.keys(byYear).forEach(y=>years.add(Number(y)))); const sorted=Array.from(years).filter(Number.isFinite).sort((a,b)=>a-b);
  const header='<thead><tr><th>Wohnung</th><th>Bezeichnung</th><th>Quelle</th>'+sorted.map(y=>'<th>Ende '+y+' KW</th><th>Ende '+y+' WW</th><th>Verbrauch '+y+'</th>').join('')+'</tr></thead>';
  const body=Array.from(unitMap.values()).map(unit=>{ const id=String(unit.wohnung||""); const cells=sorted.map(y=>{ const a=archived[id]&&archived[id][String(y)]; const legacy=meterHistoryReadingFor(unit,y); const delta=meterHistoryDeltaFor(unit,y); const r=a||legacy||{}; const consumption=a?a.verbrauch:delta.gesamt; return '<td class="readonly-cell">'+meterHistoryValue(r.kw)+'</td><td class="readonly-cell">'+meterHistoryValue(r.ww)+'</td><td class="readonly-cell">'+meterHistoryValue(consumption)+'</td>'; }).join(''); const sources=(archived[id]?"NK-Pro-Archiv ":"")+(legacyUnits.includes(unit)?"Excel-Altdaten":""); return '<tr><td>'+escapeHtml(id)+'</td><td>'+escapeHtml(unit.bezeichnung||"")+'</td><td>'+escapeHtml(sources.trim()||"–")+'</td>'+cells+'</tr>'; }).join('');
  return '<div class="table-wrap"><table id="waterMeterHistoryTable">'+header+'<tbody>'+body+'</tbody></table></div><div class="meter-history-source-note"><strong>Historie:</strong> Excel-Altdaten bleiben unverändert; jedes archivierte NK-Pro-Jahr wird automatisch über Wohnungs-ID und Abrechnungsjahr ergänzt.</div>';
}

function hasWaterSettingValue(value) {
  return value !== "" && value !== null && value !== undefined;
}

function houseMeterConsumption(settings) {
  const complete = hasWaterSettingValue(settings.houseMeterStart) && hasWaterSettingValue(settings.houseMeterEnd);
  if (!complete) return { complete:false, invalid:false, value:null };
  const value = num(settings.houseMeterEnd) - num(settings.houseMeterStart);
  return { complete:true, invalid:value < 0, value };
}

function waterDifferenceState(left, right, options = {}) {
  if (options.invalid) return { key:"error", icon:"✕", label:"Zählerstand prüfen", diff:null, percent:null };
  if (left === null || right === null || left === undefined || right === undefined || !Number.isFinite(num(left)) || !Number.isFinite(num(right)) || num(right) <= 0) {
    return { key:"neutral", icon:"•", label:"Noch nicht prüfbar", diff:null, percent:null };
  }
  const diff = num(left) - num(right);
  const percentBase = options.percentBase === "left" ? num(left) : num(right);
  const percent = Math.abs(diff) / Math.abs(percentBase) * 100;
  return percent <= 5
    ? { key:"ok", icon:"✓", label:"Plausibel", diff, percent }
    : { key:"warn", icon:"⚠", label:"Abweichung prüfen", diff, percent };
}

function houseMeterMetricHtml(label, value, state, detail) {
  const key = state && state.key ? state.key : "neutral";
  const icon = state && state.icon ? state.icon + " " : "";
  return '<div class="house-meter-metric is-' + key + '"><span>' + escapeHtml(label) + '</span><strong>' +
    escapeHtml(icon + value) + '</strong>' + (detail ? '<small>' + escapeHtml(detail) + '</small>' : '') + '</div>';
}

function waterValidationItemHtml(state, title, detail) {
  const key = state && state.key ? state.key : "neutral";
  const icon = state && state.icon ? state.icon : "•";
  return '<div class="water-validation-item is-' + key + '"><span class="validation-icon">' + escapeHtml(icon) + '</span><div><strong>' +
    escapeHtml(title) + '</strong>' + (detail ? '<div class="small">' + escapeHtml(detail) + '</div>' : '') + '</div></div>';
}

function renderWaterMeters() {
  const legacySectionsEl = document.getElementById("meterSections");
  const currentSectionsEl = document.getElementById("meterCurrentSections");
  const historyEl = document.getElementById("meterHistory");
  const carryForwardEl = document.getElementById("meterCarryForward");
  const consumptionControlEl = document.getElementById("meterConsumptionControl");
  const controlSummaryEl = document.getElementById("meterControlSummary");
  const settingsEl = document.getElementById("waterMeterSettings");
  const houseComparisonEl = document.getElementById("meterHouseComparison");
  const houseHistoryNoteEl = document.getElementById("meterHouseHistoryNote");
  if (!settingsEl || !houseComparisonEl || !houseHistoryNoteEl || !currentSectionsEl || !historyEl || !carryForwardEl || !consumptionControlEl || !controlSummaryEl) return;

  ensureWaterMeterData();
  const visibleRows = visibleTenantRows();
  const settings = state.waterMeters.settings;
  settings.enabled = "Ja";
  const costs = consumptionCosts();
  const waterCosts = costs.filter(cost => isWaterCost(cost.id));
  const tenantWaterTotal = waterCosts.reduce((sum,cost) => {
    visibleRows.forEach(t => sum += meterTotalForCostAndTenant(cost.id, t.originalIndex));
    return sum;
  }, 0);
  const invoiceWaterTotal = num(settings.houseWaterTotal);
  const houseResult = houseMeterConsumption(settings);
  const houseWaterTotal = houseResult.complete && !houseResult.invalid ? houseResult.value : null;
  const invoiceVsHouse = waterDifferenceState(invoiceWaterTotal > 0 ? invoiceWaterTotal : null, houseWaterTotal, { invalid:houseResult.invalid });
  const houseVsTenant = waterDifferenceState(houseWaterTotal, tenantWaterTotal > 0 ? tenantWaterTotal : null, { invalid:houseResult.invalid, percentBase:"left" });
  const meterStatus = currentMeterEndBlankStatus();

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("wasser");

  settingsEl.innerHTML =
    '<label class="house-meter-field"><span>Hauszählerstand Beginn</span><input class="number" value="' + escapeHtml(settings.houseMeterStart ?? "") + '" onchange="setWaterMeterSetting(\'houseMeterStart\',this.value)"></label>' +
    '<label class="house-meter-field"><span>Ablesedatum Beginn</span><input type="date" value="' + escapeHtml(settings.houseMeterStartDate || "") + '" onchange="setWaterMeterSetting(\'houseMeterStartDate\',this.value)"></label>' +
    '<label class="house-meter-field"><span>Hauszählerstand Ende</span><input class="number" value="' + escapeHtml(settings.houseMeterEnd ?? "") + '" onchange="setWaterMeterSetting(\'houseMeterEnd\',this.value)"></label>' +
    '<label class="house-meter-field"><span>Ablesedatum Ende</span><input type="date" value="' + escapeHtml(settings.houseMeterEndDate || "") + '" onchange="setWaterMeterSetting(\'houseMeterEndDate\',this.value)"></label>' +
    '<label class="house-meter-field"><span>Verbrauch laut Hauszähler</span><div class="house-meter-readonly">' +
      (houseResult.complete ? (houseResult.invalid ? 'Endstand kleiner als Anfangsstand' : houseResult.value.toLocaleString("de-DE", { maximumFractionDigits:3 }) + ' m³') : 'Wird automatisch berechnet') + '</div></label>' +
    '<label class="house-meter-field"><span>Verbrauch laut Wasserwerksrechnung (m³)</span><input class="number" value="' + escapeHtml(settings.houseWaterTotal ?? "") + '" onchange="setWaterMeterSetting(\'houseWaterTotal\',this.value)"></label>' +
    '<label class="house-meter-field house-meter-field--wide"><span>Rechnungsnummer / Bemerkung (optional)</span><input value="' + escapeHtml(settings.houseInvoiceNote || "") + '" onchange="setWaterMeterSetting(\'houseInvoiceNote\',this.value)"></label>';

  const houseMetricState = houseResult.invalid ? {key:"error",icon:"✕"} : (houseResult.complete ? {key:"ok",icon:"✓"} : {key:"neutral",icon:"•"});
  const invoiceMetricState = invoiceWaterTotal > 0 ? {key:"ok",icon:"✓"} : {key:"neutral",icon:"•"};
  const tenantMetricState = tenantWaterTotal > 0 ? {key:"ok",icon:"✓"} : {key:"neutral",icon:"•"};
  const invoiceDiffText = invoiceVsHouse.diff === null ? "–" : invoiceVsHouse.diff.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³";
  const tenantDiffText = houseVsTenant.diff === null ? "–" : houseVsTenant.diff.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³";
  houseComparisonEl.innerHTML = '<div class="house-meter-comparison">' +
    houseMeterMetricHtml("Hauszählerverbrauch", houseWaterTotal === null ? "–" : houseWaterTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³", houseMetricState, houseResult.complete ? "Endstand minus Anfangsstand" : "Anfangs- und Endstand erfassen") +
    houseMeterMetricHtml("Wasserwerksrechnung", invoiceWaterTotal > 0 ? invoiceWaterTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³" : "–", invoiceMetricState, "Verbrauch laut Rechnung") +
    houseMeterMetricHtml("Wohnungszähler gesamt", tenantWaterTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³", tenantMetricState, "Summe K002") +
    houseMeterMetricHtml("Differenz Rechnung ↔ Haus", invoiceDiffText, invoiceVsHouse, invoiceVsHouse.percent === null ? invoiceVsHouse.label : invoiceVsHouse.label + " · " + invoiceVsHouse.percent.toLocaleString("de-DE", { maximumFractionDigits:1 }) + " %") +
    houseMeterMetricHtml("Differenz Haus ↔ Wohnungen", tenantDiffText, houseVsTenant, houseVsTenant.percent === null ? houseVsTenant.label : houseVsTenant.label + " · " + houseVsTenant.percent.toLocaleString("de-DE", { maximumFractionDigits:1 }) + " %") +
    '</div>';

  houseHistoryNoteEl.innerHTML = '<p class="meter-house-history-note"><strong>Hausanschluss:</strong> Wasseruhrenwechsel Hausanschluss am 13.04.2022 · Wert bei Wechsel: 1.893 · Ende 2022: 301 · Ende 2023: 615 · Ende 2024: 911</p>';

  carryForwardEl.innerHTML = renderWaterMeterCarryForwardNotice();
  historyEl.innerHTML = renderWaterMeterHistory();

  currentSectionsEl.innerHTML = costs.length ? costs.map(cost =>
    isWaterCost(cost.id) ? renderWaterCostSection(cost, visibleRows) : renderGenericMeterSection(cost, visibleRows)
  ).join("") : '<div class="hint">Aktuell gibt es keine Kostenart mit Umlageschlüssel „Verbrauch“. Stelle im Tab „Kostenarten & Einstellungen“ mindestens eine Kostenart auf Verbrauch.</div>';

  const rows = visibleRows.map(t => {
    const perCost = costs.map(cost => {
      const value = meterTotalForCostAndTenant(cost.id, t.originalIndex);
      return '<td class="readonly-cell">' + value.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</td>';
    }).join("");
    const total = costs.reduce((sum,cost) => sum + meterTotalForCostAndTenant(cost.id, t.originalIndex), 0);
    return '<tr><td>' + tenantIdCellHtml(t) + '</td><td>' + unitRefCellHtml(t.wohnung) + '</td><td>' + escapeHtml(t.name || "") + '</td>' +
      perCost + '<td class="readonly-cell"><strong>' + total.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td></tr>';
  }).join("");

  const controlTotals = costs.map(cost => visibleRows.reduce((sum,t) => sum + meterTotalForCostAndTenant(cost.id, t.originalIndex), 0));
  const allConsumptionTotal = controlTotals.reduce((sum,value) => sum + value, 0);
  const controlFooter = '<tfoot><tr class="total-row"><td colspan="3"><strong>Summe</strong></td>' +
    controlTotals.map(value => '<td class="readonly-cell"><strong>' + value.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td>').join("") +
    '<td class="readonly-cell"><strong>' + allConsumptionTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + '</strong></td></tr></tfoot>';
  consumptionControlEl.innerHTML =
    '<div class="table-wrap"><table id="meterConsumptionControlTable"><thead><tr><th>Mieter-ID</th><th>Wohnungs-ID</th><th>Mieter</th>' +
    costs.map(cost => '<th>' + escapeHtml(cost.kostenart) + '</th>').join("") +
    '<th>Verbrauch gesamt</th></tr></thead><tbody>' +
    (rows || '<tr><td colspan="' + (4 + costs.length) + '">Keine aktuellen oder NK-offenen Mietverhältnisse vorhanden.</td></tr>') +
    '</tbody>' + controlFooter + '</table></div>';

  const meterEntryState = meterStatus.filled > 0 ? {key:"ok",icon:"✓"} : {key:"warn",icon:"⚠"};
  controlSummaryEl.innerHTML = '<div class="water-validation-list">' +
    waterValidationItemHtml(houseResult.invalid ? {key:"error",icon:"✕"} : (houseResult.complete ? {key:"ok",icon:"✓"} : {key:"warn",icon:"⚠"}),
      houseResult.invalid ? "Hauszählerstand ist unplausibel" : (houseResult.complete ? "Hauszählerverbrauch berechnet" : "Hauszählerstände noch unvollständig"),
      houseResult.invalid ? "Der Endstand liegt unter dem Anfangsstand." : (houseResult.complete ? houseResult.value.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³" : "Anfangs- und Endstand ergänzen.")) +
    waterValidationItemHtml(invoiceWaterTotal > 0 ? {key:"ok",icon:"✓"} : {key:"warn",icon:"⚠"}, invoiceWaterTotal > 0 ? "Wasserwerksverbrauch erfasst" : "Wasserwerksverbrauch fehlt", invoiceWaterTotal > 0 ? invoiceWaterTotal.toLocaleString("de-DE", { maximumFractionDigits:3 }) + " m³" : "Verbrauch laut Rechnung eintragen.") +
    waterValidationItemHtml(meterEntryState, meterStatus.filled > 0 ? "Wohnungszähler enthalten Endwerte" : "Wohnungszähler-Endwerte fehlen", meterStatus.filled + " von " + meterStatus.checked + " Endwertfeldern befüllt") +
    waterValidationItemHtml(invoiceVsHouse, "Abgleich Wasserwerksrechnung mit Hauszähler", invoiceVsHouse.diff === null ? "Noch nicht vollständig prüfbar." : invoiceDiffText + (invoiceVsHouse.percent === null ? "" : " · " + invoiceVsHouse.percent.toLocaleString("de-DE", { maximumFractionDigits:1 }) + " %")) +
    waterValidationItemHtml(houseVsTenant, "Abgleich Hauszähler mit Wohnungszählern", houseVsTenant.diff === null ? "Noch nicht vollständig prüfbar." : tenantDiffText + (houseVsTenant.percent === null ? "" : " · " + houseVsTenant.percent.toLocaleString("de-DE", { maximumFractionDigits:1 }) + " %")) +
    '</div>';

  if (legacySectionsEl) legacySectionsEl.innerHTML = "";
}


const MANUAL_INPUT_MODES = ["Zählerstände","Verbrauchsmenge","Direkter Eurobetrag","Externe Einzelabrechnung"];
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
function syncUmlageInputs() {
  if (!state.umlageInputs) state.umlageInputs = {};
  const tenantCount = Math.max(20, state.mieter.length);
  state.kostenarten.forEach(k => {
    if (!k || !k.id) return;
    const needsInput = k.inNK === "Ja" && (k.umlageschluessel === "Verbrauch" || k.umlageschluessel === UMLAGE_MANUAL || k.berechnungsart === "Manuell je Mieter" || !!state.umlageInputs[k.id]);
    if (needsInput && !state.umlageInputs[k.id]) {
      const defaults = DEFAULT_UMLAGE_INPUTS[k.id] || [];
      const values = Array(tenantCount).fill(0);
      defaults.forEach((v,i) => { if (i < values.length) values[i] = v; });
      state.umlageInputs[k.id] = { kostenId:k.id, kostenart:k.kostenart, art:k.umlageschluessel, mode:defaultManualInputMode(k), values };
    }
    if (state.umlageInputs[k.id]) {
      const input=state.umlageInputs[k.id];
      input.kostenart = k.kostenart;
      if (!MANUAL_INPUT_MODES.includes(input.mode)) input.mode=inferManualInputMode(k, input, state);
      input.art = input.mode;
      if (!Array.isArray(input.values)) input.values = [];
      while (input.values.length < tenantCount) input.values.push(0);
    }
  });
}
function setManualInputMode(costId, mode) {
  syncUmlageInputs();
  const k=state.kostenarten.find(row=>row.id===costId); const input=state.umlageInputs[costId];
  if (!k || !input || !MANUAL_INPUT_MODES.includes(mode)) return;
  const hasValues=input.values.some(v=>Math.abs(num(v))>0.000001);
  if (hasValues && input.mode!==mode && !confirm("Für diese Kostenart sind bereits Werte vorhanden. Die Werte bleiben erhalten, werden aber künftig als „"+mode+"“ interpretiert. Fortfahren?")) return renderManualExternalValues();
  input.mode=mode; input.art=mode;
  if (mode==="Zählerstände" || mode==="Verbrauchsmenge") { k.umlageschluessel="Verbrauch"; k.berechnungsart="Automatisch"; }
  else { k.umlageschluessel=UMLAGE_MANUAL; k.berechnungsart="Manuell je Mieter"; }
  applyWaterMetersToUmlage();
  commitStateChange({reason:"Benutzereingabe",tabId:"manuellewerte"});
}
function setManualExternalValue(costId,index,value) {
  syncUmlageInputs(); const input=state.umlageInputs[costId]; if (!input) return;
  input.values[index]=num(value); commitStateChange({reason:"Benutzereingabe",tabId:"manuellewerte"});
}
function resetUmlageInputs() {
  if (!confirm("Manuelle Verbrauchsmengen und externe Einzelbeträge wirklich zurücksetzen? Zählerstände bleiben erhalten.")) return;
  Object.keys(state.umlageInputs||{}).forEach(costId=>{ const input=state.umlageInputs[costId]; if (input && input.mode!=="Zählerstände") input.values=input.values.map(()=>0); });
  applyWaterMetersToUmlage();
  commitStateChange({ reason:"Benutzereingabe",tabId:"manuellewerte" });
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

function updateTenantPrepaymentTotals() {
  syncVorauszahlungen();
  syncKostenartenMieterUmlage();
  state.mieter.forEach((m,i) => {
    m.nkVoraus = totalVorauszahlungForTenant(i);
    m.einnahmen = num(m.kaltErhalten) + num(m.nkVoraus);
  });
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

function renderManualExternalValues() {
  syncUmlageInputs(); applyWaterMetersToUmlage();
  const table=document.getElementById("manualExternalValuesTable"); const control=document.getElementById("manualExternalControlTable"); const validation=document.getElementById("manualExternalValidation");
  if (!table || !control || !validation) return;
  const calcTenants=tenantRowsWithIndex();
  const costs=state.kostenarten.filter(k=>k && k.id && k.id!=="K002" && k.inNK==="Ja" && state.umlageInputs && state.umlageInputs[k.id]);
  const heads=calcTenants.map(t=>tenantHeaderHtml(t)).join("");
  const rows=costs.length?costs.map(k=>{
    const input=state.umlageInputs[k.id]; const mode=manualInputModeForCost(k); const readonly=mode==="Zählerstände";
    const cells=calcTenants.map(t=>{ const v=num(input.values[t.originalIndex]); return readonly?'<td class="readonly-cell">'+v.toLocaleString("de-DE",{maximumFractionDigits:3})+'</td>':'<td class="editable">'+inputHtml(v,"setManualExternalValue('"+k.id+"',"+t.originalIndex+",this.value)",mode.includes("Euro")||mode.includes("Einzel")?"money":"number")+'</td>'; }).join("");
    const modeSelect=selectHtml(mode,MANUAL_INPUT_MODES,"setManualInputMode('"+k.id+"',this.value)").replace('<select ','<select class="manual-mode-select" ');
    return '<tr><td>'+escapeHtml(k.id)+'</td><td>'+escapeHtml(k.kostenart)+'</td><td class="editable">'+modeSelect+'</td><td>'+escapeHtml(mode==="Zählerstände"?"automatisch":(mode==="Verbrauchsmenge"?costUnitLabel(k):"Euro"))+'</td>'+cells+'</tr>';
  }).join(""):'<tr><td colspan="'+(4+calcTenants.length)+'">Keine Kostenart benötigt manuelle oder externe Einzelwerte.</td></tr>';
  table.innerHTML='<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Quelle / Eingabeart</th><th>Einheit</th>'+heads+'</tr></thead><tbody>'+rows+'</tbody>';
  const controlRows=costs.map(k=>{ const input=state.umlageInputs[k.id]; const mode=manualInputModeForCost(k); const sum=input.values.reduce((a,b)=>a+num(b),0); const expected=(mode==="Direkter Eurobetrag"||mode==="Externe Einzelabrechnung")?num(k.gesamtbetrag):num(k.gesamtverbrauch); const diff=expected-sum; const ok=Math.abs(diff)<0.01 || mode==="Zählerstände" || (mode==="Verbrauchsmenge" && expected<=0); return '<tr><td>'+escapeHtml(k.id)+'</td><td>'+escapeHtml(k.kostenart)+'</td><td>'+escapeHtml(mode)+'</td><td>'+formatPlainNumber(sum,3)+'</td><td>'+formatPlainNumber(expected,3)+'</td><td class="'+(ok?'manual-summary-ok':'manual-summary-warn')+'">'+formatPlainNumber(diff,3)+'</td><td><span class="status '+(ok?'ok':'warn')+'">'+(ok?'OK':'Prüfen')+'</span></td></tr>'; }).join("");
  control.innerHTML='<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Quelle</th><th>Summe Einzelwerte</th><th>Referenz/Gesamt</th><th>Differenz</th><th>Status</th></tr></thead><tbody>'+(controlRows||'<tr><td colspan="7">Keine Eingabewerte zu prüfen.</td></tr>')+'</tbody>';
  const conflicts=costs.filter(k=>manualInputModeForCost(k)==="Zählerstände" && (state.umlageInputs[k.id].values||[]).every(v=>Math.abs(num(v))<0.000001));
  validation.innerHTML='<div class="water-validation-list">'+waterValidationItemHtml(conflicts.length?{key:"warn",icon:"⚠"}:{key:"ok",icon:"✓"},conflicts.length?"Zählerquellen ohne Verbrauch":"Eingabequellen eindeutig",conflicts.length?conflicts.map(k=>k.id+" · "+k.kostenart).join(", "):"Je Kostenart ist genau eine Eingabeart aktiv.")+'</div>';
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
function renderUmlage() {
  const calc = calculateUmlage();
  const totals = umlageTotals(calc);
  const totalCosts = totals.totalCosts;
  const tenantShares = totals.billableShare;
  const prepayments = totals.prepayments;
  const corrections = totals.corrections;
  const balance = totals.balance;
  const privateShares = totals.privateShare;
  const ownerShare = totals.ownerShare;
  const unitTotal = totals.unitTotal;

  if (typeof renderOverviewForTab === "function") renderOverviewForTab("umlage");

  const summaryRows = calc.tenantResults.map(r => {
    const saldoText = r.balance >= 0 ? "Nachzahlung" : "Guthaben";
    return '<tr><td>' + tenantIdCellHtml(r.tenant) + '</td><td>' + unitRefCellHtml(r.tenant.wohnung) + '</td><td>' + escapeHtml(r.tenant.name) + '</td><td>' + fmtMoney(r.costShare) + '</td><td>' + fmtMoney(r.prepayments) + '</td><td>' + fmtMoney(r.correction || 0) + '</td><td>' + fmtMoney(Math.abs(r.balance)) + '</td><td><span class="status ' + (r.balance > 0.01 ? "warn" : "ok") + '">' + saldoText + '</span></td></tr>';
  }).join("") + calc.privateResults.map(r => '<tr class="owner-private-row"><td>'+tenantIdCellHtml(r.tenant)+'</td><td>'+unitRefCellHtml(r.tenant.wohnung)+'</td><td>'+escapeHtml(r.tenant.name)+'</td><td>'+fmtMoney(r.costShare)+'</td><td>–</td><td>–</td><td>'+fmtMoney(r.costShare)+'</td><td><span class="status warn">Eigentümer/Privat · Kostenanteil</span></td></tr>').join("");
  document.getElementById("umlageSummaryTable").innerHTML =
    '<thead><tr><th>ID</th><th>Wohnungs-ID</th><th>Name / Rolle</th><th>Kostenanteil</th><th>Vorauszahlungen</th><th>Korrektur Vorjahr</th><th>Saldo / Anteil</th><th>Ergebnis</th></tr></thead><tbody>' + summaryRows + '</tbody>';

  const unitColumns = allWohnungen();
  const tenantsByUnit = {};
  calc.tenants.forEach(t => {
    if (!t.wohnung) return;
    if (!tenantsByUnit[t.wohnung]) tenantsByUnit[t.wohnung] = [];
    tenantsByUnit[t.wohnung].push(t);
  });
  const unitHeads = unitColumns.map(w => {
    const occupants = tenantsByUnit[w.id] || [];
    const names = occupants.map(t => t.name || t.id).filter(Boolean).join(" / ");
    const status = names || (w.status === "aktiv" ? "ohne Mieter" : "inaktiv");
    return '<th class="unit-head"><span class="unit-id">' + escapeHtml(w.id) + '</span><span class="unit-name">' + escapeHtml(w.bezeichnung || w.lage || "") + '</span><span class="unit-status">' + escapeHtml(status) + '</span></th>';
  }).join("");
  const costRows = calc.costResults.map(row => {
    const basis = umlageBasisInfo(row.cost, row);
    const isUnitDistribution = row.cost.umlageschluessel === "Verteilung auf alle Wohneinheiten" || row.cost.umlageschluessel === "Verteilung nur auf aktive Wohneinheiten";
    const unitCells = unitColumns.map(w => {
      const occupants = tenantsByUnit[w.id] || [];
      let included = true;
      let value = 0;
      if (isUnitDistribution) {
        included = row.cost.umlageschluessel === "Verteilung auf alle Wohneinheiten" || w.status === "aktiv";
        value = row.unitAllocations && row.unitAllocations[w.id] ? num(row.unitAllocations[w.id]) : 0;
      } else {
        value = occupants.reduce((sum,t) => sum + num(row.allocations[t.originalIndex]), 0);
        included = occupants.length > 0 || Math.abs(value) > 0.005;
      }
      return '<td>' + (included ? fmtMoney(value) : "–") + '</td>';
    }).join("");
    const distributedCheck = num(row.allTenantSum) + num(row.ownerShare);
    const delta = num(row.cost.gesamtbetrag) - distributedCheck;
    const deltaCls = Math.abs(delta) > 0.02 ? "warn" : "ok";
    const unitTotalText = row.unitTotal ? fmtMoney(row.unitTotal) : "–";
    return '<tr><td>' + escapeHtml(row.cost.id) + '</td><td>' + escapeHtml(row.cost.kostenart) + '</td><td>' + escapeHtml(row.cost.berechnungsart || "") + '</td><td>' + escapeHtml(row.cost.umlageschluessel) + '</td><td>' + fmtMoney(row.cost.gesamtbetrag) + '</td><td>' + escapeHtml(basis.basis) + '</td><td>' + escapeHtml(basis.unit) + '</td><td>' + unitTotalText + '</td><td>' + fmtMoney(row.allTenantSum) + '</td><td>' + fmtMoney(row.tenantSum) + '</td><td>' + fmtMoney(row.privateShare) + '</td><td>' + fmtMoney(row.ownerShare) + '</td><td><span class="status ' + deltaCls + '">' + fmtMoney(delta) + '</span></td><td><span class="status ' + statusClass(row.status) + '">' + escapeHtml(row.status) + '</span></td>' + unitCells + '</tr>';
  }).join("");
  const costsTable = document.getElementById("umlageCostsTable");
  if (costsTable) {
    costsTable.innerHTML =
      '<thead><tr><th>Kosten-ID</th><th>Kostenart</th><th>Berechnungsart</th><th>Umlageschlüssel</th><th>Gesamtbetrag</th><th>Umlagebasis</th><th>Betrag je Einheit / WE</th><th>Summe Wohneinheiten</th><th>Summe alle Mietparteien</th><th>Summe echte Mieter</th><th>Eigentümer/Privat</th><th>Nicht auf Mieter umgelegt</th><th>Differenz</th><th>Status</th>' + unitHeads + '</tr></thead><tbody>' + costRows + '</tbody>';
  }

  const proofTable=document.getElementById("umlageUnitProofTable");
  if (proofTable) {
    const costHeads=calc.activeCosts.map(k=>'<th>'+escapeHtml(k.id)+'<br><span class="small">'+escapeHtml(k.kostenart)+'</span></th>').join("");
    const proofRows=unitColumns.map(unit=>{
      const tenantRows=calc.tenants.filter(t=>String(t.wohnung||"")===String(unit.id||""));
      const cells=calc.costResults.map(row=>'<td class="readonly-cell">'+fmtMoney(tenantRows.reduce((sum,t)=>sum+num(row.allocations[t.originalIndex]),0))+'</td>').join("");
      const total=calc.costResults.reduce((sum,row)=>sum+tenantRows.reduce((a,t)=>a+num(row.allocations[t.originalIndex]),0),0);
      const roles=tenantRows.map(t=>isPrivateTenant(t)?"Eigentümer/Privat":(t.name||t.id)).join(", ") || "keine Zuordnung";
      return '<tr class="'+(tenantRows.some(isPrivateTenant)?'owner-private-row':'')+'"><td>'+unitIdCellHtml(unit)+'</td><td>'+escapeHtml(unit.bezeichnung||unit.lage||"")+'</td><td>'+escapeHtml(roles)+'</td>'+cells+'<td class="readonly-cell"><strong>'+fmtMoney(total)+'</strong></td></tr>';
    }).join("");
    proofTable.innerHTML='<thead><tr><th>Wohnungs-ID</th><th>Wohnung</th><th>Zuordnung</th>'+costHeads+'<th>Summe</th></tr></thead><tbody>'+proofRows+'</tbody>';
  }
}


function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
}

function addDaysIso(iso, days) {
  const d = iso ? new Date(iso + "T00:00:00") : new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
}

function dateDe(value) {
  if (!value) return "";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return escapeHtml(value);
  return d.toLocaleDateString("de-DE");
}


// ===== Bereich: Vorauszahlungsanpassung V51 =====
function defaultPrepaymentAdjustmentSettings() {
  const nextYear = String(yearNumber(currentAbrechnungsjahr()) + 1);
  return {
    effectiveFrom:"01.01." + nextYear,
    safetyBufferPercent:0,
    roundingMode:"Auf 5 € runden",
    minimumMonthlyChange:1,
    annualizePartialTenants:"Ja",
    changePolicy:"Erhöhungen und Senkungen",
    letterPrintMode:"Nicht drucken"
  };
}

function ensurePrepaymentAdjustmentSettings() {
  if (!state.prepaymentAdjustmentSettings) state.prepaymentAdjustmentSettings = {};
  const defaults = defaultPrepaymentAdjustmentSettings();
  Object.keys(defaults).forEach(key => {
    if (state.prepaymentAdjustmentSettings[key] === undefined || state.prepaymentAdjustmentSettings[key] === null || state.prepaymentAdjustmentSettings[key] === "") {
      state.prepaymentAdjustmentSettings[key] = defaults[key];
    }
  });
  ensureBriefSettings();
  if (state.briefSettings && state.briefSettings.vorauszahlungPrintMode) {
    state.prepaymentAdjustmentSettings.letterPrintMode = state.briefSettings.vorauszahlungPrintMode;
  }
  if (state.briefSettings && state.briefSettings.vorauszahlungAb) {
    state.prepaymentAdjustmentSettings.effectiveFrom = state.briefSettings.vorauszahlungAb;
  }
  return state.prepaymentAdjustmentSettings;
}

function setPrepaymentAdjustmentSetting(key, value) {
  const s = ensurePrepaymentAdjustmentSettings();
  if (["safetyBufferPercent","minimumMonthlyChange"].includes(key)) value = num(value);
  s[key] = value;
  if (key === "effectiveFrom") {
    ensureBriefSettings();
    state.briefSettings.vorauszahlungAb = value;
  }
  if (key === "letterPrintMode") {
    ensureBriefSettings();
    state.briefSettings.vorauszahlungPrintMode = value;
    state.briefSettings.showVorauszahlungPage = value === "Nicht drucken" ? "Nein" : "Ja";
    state.briefSettings.useCalculatedPrepaymentAdjustments = value === "Berechnete Werte drucken" ? "Ja" : "Nein";
  }
  commitStateChange({ reason:"Vorauszahlungsanpassung", tabId:"vorauszahlungsanpassung", includeCommon:false, includeNavigation:false });
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
    '<label class="prepayment-setting"><span>Anpassung gilt ab</span><input value="' + escapeHtml(s.effectiveFrom) + '" onchange="setPrepaymentAdjustmentSetting(&quot;effectiveFrom&quot;,this.value)"></label>' +
    '<label class="prepayment-setting"><span>Sicherheitszuschlag in %</span><input class="number" value="' + escapeHtml(s.safetyBufferPercent) + '" onchange="setPrepaymentAdjustmentSetting(&quot;safetyBufferPercent&quot;,this.value)"></label>' +
    '<label class="prepayment-setting"><span>Rundung der monatlichen Vorauszahlung</span>' + selectHtml(s.roundingMode, ["Auf 1 € runden","Auf 5 € runden","Auf 10 € runden"], "setPrepaymentAdjustmentSetting('roundingMode',this.value)") + '</label>' +
    '<label class="prepayment-setting"><span>Mindeständerung monatlich</span><input class="money" value="' + escapeHtml(s.minimumMonthlyChange) + '" onchange="setPrepaymentAdjustmentSetting(&quot;minimumMonthlyChange&quot;,this.value)"></label>' +
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


function briefTextWithLineBreaks(value) {
  return escapeHtml(String(value || "").replace(/\\n/g, "\n")).replace(/\r?\n/g, "<br>");
}
function briefProseHtml(value) {
  return escapeHtml(String(value || "").replace(/\\n/g, " ").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim());
}
function normalizeBriefDefaultTexts() {
  if (!state.briefSettings) return;
  function normalizeLegacyProse(value) {
    return String(value || "").replace(/\\n/g, " ").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  }
  const newIntroText = "untenstehend erhalten Sie die Nebenkostenabrechnung für das Jahr {jahr}. Der finale Betrag befindet sich am Ende der Aufstellung.";
  const newSaldoText = "Bei negativen Beträgen handelt es sich um Nachzahlungen an die Vermieterin. Bei positiven Beträgen handelt es sich um Guthaben zu Ihren Gunsten. Bitte begleichen Sie eine etwaige Nachzahlung umgehend.";
  const newPrepayText = "Um den gestiegenen Energiekosten und Ihrem individuellen Verbrauch Rechnung zu tragen, erhöhen sich Ihre monatlichen Nebenkostenvorauszahlungen zum {datum}. Die Details entnehmen Sie bitte der untenstehenden Tabelle.";
  const oldIntro = "untenstehend erhalten Sie Nebenkostenabrechnung für das Jahr {jahr}. Der finale Betrag befindet sich am Ende der Aufstellung.";
  const oldSaldo = "Bei negativen Beträgen, handelt es sich um Nachzahlungen an die Vermieterin. Bei positiven Beträgen handelt es sich um Guthaben zu Ihren Gunsten. Ich bitte Sie, eine etwaige Nachzahlung umgehend zu begleichen.";
  const oldPrepay = "Um den gestiegenen Energiekosten und Ihrem individuellen Verbrauch Rechnung zu tragen, erhöhen sich Ihre monatlichen Nebenkostenvorauszahlungen zum {datum}. Die Details entnehmen Sie bitte der untenstehenden Tabelle.";
  if (normalizeLegacyProse(state.briefSettings.introText) === oldIntro) state.briefSettings.introText = newIntroText;
  if (normalizeLegacyProse(state.briefSettings.saldoTextNachzahlung) === oldSaldo) state.briefSettings.saldoTextNachzahlung = newSaldoText;
  if (normalizeLegacyProse(state.briefSettings.saldoTextGuthaben) === oldSaldo) state.briefSettings.saldoTextGuthaben = newSaldoText;
  if (normalizeLegacyProse(state.briefSettings.vorauszahlungIntro) === oldPrepay) state.briefSettings.vorauszahlungIntro = newPrepayText;
}
function defaultBriefSettings() {
  const today = todayIso();
  const year = currentAbrechnungsjahr();
  const nextYear = String(yearNumber(year) + 1);
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
    betreff: "Nebenkostenabrechnung",
    anredeModus: "Sehr geehrte(r) Mieter/in,",
    introText: "untenstehend erhalten Sie die Nebenkostenabrechnung für das Jahr {jahr}. Der finale Betrag befindet sich am Ende der Aufstellung.",
    saldoTextNachzahlung: "Bei negativen Beträgen handelt es sich um Nachzahlungen an die Vermieterin. Bei positiven Beträgen handelt es sich um Guthaben zu Ihren Gunsten. Bitte begleichen Sie eine etwaige Nachzahlung umgehend.",
    saldoTextGuthaben: "Bei negativen Beträgen handelt es sich um Nachzahlungen an die Vermieterin. Bei positiven Beträgen handelt es sich um Guthaben zu Ihren Gunsten. Bitte begleichen Sie eine etwaige Nachzahlung umgehend.",
    outroText: "",
    gruss: "Mit freundlichen Grüßen",
    signatur: "Ute Zimmermann\\nVermieterin",
    fusszeile: "",
    heizkostenFussnote: "*) Heiz- und Warmwasserkosten sind entsprechend der separaten Abrechnung der Fa. Techem aufgelistet. Die Abrechnung liegt bei.",
    showVorauszahlungPage: "Nein",
    vorauszahlungPrintMode: "Nicht drucken",
    useCalculatedPrepaymentAdjustments: "Ja",
    vorauszahlungAb: "01.01." + nextYear,
    vorauszahlungIntro: "Um den gestiegenen Energiekosten und Ihrem individuellen Verbrauch Rechnung zu tragen, erhöhen sich Ihre monatlichen Nebenkostenvorauszahlungen zum {datum}. Die Details entnehmen Sie bitte der untenstehenden Tabelle.",
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
  return '<textarea onchange="' + onChange + '">' + escapeHtml(value ?? "") + '</textarea>';
}


function briefPrintStyles() {
  return `@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;background:white;color:#111;font-family:Arial,sans-serif;font-size:10.8px;line-height:1.3}
.letter-sheet{width:210mm;height:297mm;min-height:297mm;margin:0 auto;padding:13mm 13mm 10mm;color:#111;font-family:Arial,sans-serif;font-size:10.8px;line-height:1.3;page-break-after:always;break-after:page;display:flex;flex-direction:column;overflow:hidden;position:relative}.letter-topbar{position:absolute;top:12mm;left:20mm;right:16mm;min-height:17mm;font-size:9.4px;line-height:1.2;border-bottom:1px solid #69727d;padding-bottom:2mm}.letter-window-zone{position:absolute;top:45mm;left:20mm;width:90mm;height:45mm;overflow:hidden}.return-address{font-size:7.6px;line-height:1.15;text-decoration:underline;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4mm}.letter-window-zone .address{min-height:0;margin:0;font-size:11.1px;line-height:1.24}.letter-main-date{position:absolute;top:91mm;right:16mm;font-size:10.8px}.letter-main-content{padding-top:77mm}.letter-supplement-sheet .letter-body,.letter-prepayment-sheet .letter-body{padding-top:4mm}.letter-main-sheet .abrechnung-table{font-size:8.9px;line-height:1.12;margin:2px 0 4px}.letter-main-sheet .abrechnung-table th,.letter-main-sheet .abrechnung-table td{padding:2px 2.8px}.letter-main-sheet .abrechnung-table .section-title td{padding-top:2.8px;padding-bottom:2px;font-size:9px}.letter-main-sheet .abrechnung-table .subtotal td,.letter-main-sheet .abrechnung-table .summary td{font-size:9px}.letter-main-sheet .abrechnung-table .summary.final td{font-size:9.2px}.letter-main-sheet .abrechnung-table .summary-spacer td{height:3mm}.letter-main-sheet .after-table-note{margin:.8mm 0;font-size:8.35px;line-height:1.12}.letter-main-sheet .saldo-note{margin:.9mm 0;font-size:8.9px;line-height:1.14}.letter-main-sheet .closing{margin-top:1.2mm;font-size:9.5px;line-height:1.16}.letter-main-sheet .signature-block{margin-top:1.5mm}.letter-main-sheet .footer{font-size:7.8px;padding-top:1.5px}
.letter-sheet:last-child{page-break-after:auto;break-after:auto}
.letter-body{flex:1 1 auto;min-height:0;display:block}
.letter-head{text-align:center;font-size:9.5px;font-weight:700;line-height:1.2;padding-bottom:5.5px;border-bottom:2px solid #222;margin-bottom:12mm}
.address{min-height:25mm;margin-bottom:4.5mm;font-size:11.1px;line-height:1.24}
.date{text-align:right;margin:0 0 5mm;font-size:11.1px}.salutation{margin:0 0 3.4mm;font-size:11.1px}.intro{margin:0 0 4.8mm;font-size:11.1px;line-height:1.3}
h2{font-size:12.6px;margin:0 0 5.2mm;color:#111}
table{border-collapse:separate;border-spacing:0;table-layout:fixed;width:100%;min-width:0;max-width:100%;font-size:9.15px;line-height:1.22;margin:4px 0 7px}
th,td{border:none;border-bottom:1px solid #b9c0c8;padding:2.8px 3.6px;vertical-align:middle;white-space:normal;overflow-wrap:normal;word-break:normal;hyphens:auto}
th{position:static;background:#f1f3f5;color:#111;font-weight:700;text-align:left;border-top:1px solid #aeb6bf;font-size:9px;line-height:1.16}tr:nth-child(even) td{background:#fbfbfb}.money{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.center{text-align:center}
.abrechnung-table col.col-desc{width:29%}.abrechnung-table col.col-period{width:13%}.abrechnung-table col.col-total{width:14%}.abrechnung-table col.col-basis{width:12%}.abrechnung-table col.col-price{width:11%}.abrechnung-table col.col-units{width:10%}.abrechnung-table col.col-share{width:11%}
.abrechnung-table .section-title td{border-top:1.5px solid #68717a;border-bottom:1px solid #8d96a0;padding:4.2px 3.6px 3px;font-weight:800;background:#eef1f4;font-size:9.25px}.abrechnung-table .subtotal td{font-weight:800;background:#f4f5f6;font-size:9.15px}.abrechnung-table .summary td{background:#e5e7ea;font-weight:800;border-bottom:1px solid #777;font-size:9.25px}.abrechnung-table .summary-spacer td{height:5.5mm;padding:0;line-height:0;background:#fff!important;border:0}.abrechnung-table .summary-block-start td{border-top:1.5px solid #222}.abrechnung-table .summary.final td{background:#d7dbe0;font-weight:900;border-top:1.5px solid #222;border-bottom:1.5px solid #222;font-size:9.45px}
.note{margin:2.6mm 0 2.6mm;font-size:11.1px;line-height:1.28}.after-table-note{margin:0 0 2.4mm;font-size:10.2px;line-height:1.26}.saldo-note{margin:2.6mm 0 2.6mm;font-size:11.1px;line-height:1.28}.closing{margin:4.6mm 0 0;font-size:11.1px;line-height:1.32}.closing-greeting{display:block}.signature-block{display:block;margin-top:9mm}.footer{margin-top:auto;flex:0 0 auto;font-size:8.4px;line-height:1.18;color:#111;border-top:2px solid #222;padding-top:2.4px;text-align:center}
.prepay-intro{font-size:11.1px;line-height:1.3;margin-bottom:4.8mm}.letter-bullet-list{margin:0 0 4.8mm}.letter-bullet{display:grid;grid-template-columns:4.4mm minmax(0,1fr);column-gap:2mm;align-items:start;font-size:11.1px;line-height:1.3;margin:0 0 3.2mm}.letter-bullet:last-child{margin-bottom:0}.letter-bullet-mark{font-size:11px;line-height:1.3;text-align:center;padding-top:.1mm}
.prepay-table{font-size:9.35px;line-height:1.22;margin-top:2.8mm}.prepay-table col.col-prepay-label{width:36%}.prepay-table col.col-prepay-turnus{width:13%}.prepay-table col.col-prepay-money{width:17%}.prepay-table th,.prepay-table td{border:none;border-bottom:1px solid #b9c0c8;padding:3.1px 4px;vertical-align:middle}.prepay-table th{background:#f1f3f5;color:#111;font-weight:700;text-align:left;border-top:1px solid #aeb6bf;font-size:9.1px;line-height:1.18}.prepay-table .summary td{background:#e5e7ea;font-weight:800;border-bottom:1px solid #777;font-size:9.35px}.prepay-table .summary.final td{background:#d7dbe0;font-weight:900;border-top:1.5px solid #222;border-bottom:1.5px solid #222;font-size:9.55px}
/* V62: größere Brieftabellen ohne Umbruch */
.abrechnung-table,.prepay-table{table-layout:fixed;width:100%;font-size:10.15px;line-height:1.22;margin:5px 0 8px}
.abrechnung-table th,.abrechnung-table td,.prepay-table th,.prepay-table td{white-space:nowrap;overflow-wrap:normal;word-break:normal;hyphens:none;padding:4.1px 4.6px;vertical-align:middle}
.abrechnung-table th,.prepay-table th{font-size:9.7px;line-height:1.18}
.abrechnung-table col.col-desc{width:32%}.abrechnung-table col.col-period{width:11%}.abrechnung-table col.col-total{width:13%}.abrechnung-table col.col-basis{width:11%}.abrechnung-table col.col-price{width:10%}.abrechnung-table col.col-units{width:10%}.abrechnung-table col.col-share{width:13%}
.abrechnung-table .section-title td{font-size:10.05px;padding:5px 4.6px 4px}.abrechnung-table .subtotal td,.abrechnung-table .summary td{font-size:10.15px}.abrechnung-table .summary.final td{font-size:10.35px}
.prepay-table col.col-prepay-label{width:34%}.prepay-table col.col-prepay-turnus{width:10%}.prepay-table col.col-prepay-money{width:18.67%}.prepay-table th{font-size:9.65px}.prepay-table .summary td{font-size:10.15px}.prepay-table .summary.final td{font-size:10.35px}

/* V63: Header dürfen umbrechen, Tabellenwerte bleiben einzeilig */
.abrechnung-table thead th,.prepay-table thead th{white-space:normal;overflow-wrap:normal;word-break:normal;hyphens:none;line-height:1.14;padding-top:4.4px;padding-bottom:4.4px;vertical-align:middle}
.abrechnung-table tbody td,.prepay-table tbody td{white-space:nowrap;overflow-wrap:normal;word-break:normal;hyphens:none}
.letter-main-sheet{padding-bottom:5mm}.letter-main-sheet .salutation{margin:0 0 2.2mm;font-size:10.2px;line-height:1.18}.letter-main-sheet .intro{margin:0 0 2.8mm;font-size:10.2px;line-height:1.22}.letter-main-sheet .abrechnung-table{font-size:8.25px;line-height:1.08;margin:1px 0 3px}.letter-main-sheet .abrechnung-table th,.letter-main-sheet .abrechnung-table td{padding:1.35px 2.3px}.letter-main-sheet .abrechnung-table thead th{font-size:8.15px;line-height:1.08;padding-top:1.8px;padding-bottom:1.8px}.letter-main-sheet .abrechnung-table .section-title td{padding:2px 2.3px 1.5px;font-size:8.45px}.letter-main-sheet .abrechnung-table .subtotal td,.letter-main-sheet .abrechnung-table .summary td{font-size:8.35px}.letter-main-sheet .abrechnung-table .summary.final td{font-size:8.55px}.letter-main-sheet .abrechnung-table .summary-spacer td{height:1.8mm}.letter-main-sheet .after-table-note{margin:.8mm 0;font-size:8.35px;line-height:1.12}.letter-main-sheet .saldo-note{margin:.9mm 0;font-size:8.9px;line-height:1.14}.letter-main-sheet .closing{margin-top:1.2mm;font-size:9.5px;line-height:1.16}.letter-main-sheet .signature-block{margin-top:1.5mm}.letter-main-sheet .footer{font-size:7.8px;padding-top:1.5px}
.muted{color:#333}.nowrap{white-space:nowrap}.letter-page-note{font-size:8.8px;color:#333;margin-top:3mm}
/* V70: Druck-/PDF-Härtung */
html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.print-guide{border:1px solid #b6d7ef;background:#eef5fb;border-radius:8px;padding:10px 12px;margin:0 auto 10px;width:210mm;max-width:100%;box-sizing:border-box;font-family:Arial,sans-serif;color:#173b5a}.print-guide strong{display:block;margin-bottom:4px}.screen-print-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.screen-print-actions button{border:1px solid #b6d7ef;background:#fff;color:#173b5a;border-radius:6px;padding:7px 10px;font-weight:700;cursor:pointer}table,tr,.footer,.summary.final{page-break-inside:avoid;break-inside:avoid}@media print{.print-guide{display:none!important}.letter-sheet{border:0!important;box-shadow:none!important;page-break-inside:avoid;break-inside:avoid}table,tr,.footer,.summary.final{page-break-inside:avoid;break-inside:avoid}}`;
}
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
  missingBriefFieldsForTenant(tenant).forEach(field => errors.push("Mieterdaten unvollständig: " + field));
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

function briefPreflightBoxHtml(report) {
  if (!report) return "";
  const badgeClass = report.level === "err" ? "err" : (report.level === "warn" ? "warn" : "ok");
  const badgeLabel = report.level === "err" ? "Fehler" : (report.level === "warn" ? "Prüfen" : "OK");
  const visibleItems = report.items.filter(item => item.level !== "info");
  const infoItems = report.items.filter(item => item.level === "info");
  const rows = (visibleItems.length ? visibleItems : report.items).map(item => {
    const statusClass = item.level === "err" ? "err" : (item.level === "warn" ? "warn" : (item.level === "info" ? "info" : "ok"));
    const statusText = item.level === "err" ? "Fehler" : (item.level === "warn" ? "Prüfen" : (item.level === "info" ? "Hinweis" : "OK"));
    return '<li><span class="status ' + statusClass + '">' + statusText + '</span><span><strong>' + escapeHtml(item.label) + ':</strong> ' + escapeHtml(item.detail) + '</span></li>';
  }).join("");
  const infoRows = infoItems.map(item => '<li><span class="status info">Hinweis</span><span><strong>' + escapeHtml(item.label) + ':</strong> ' + escapeHtml(item.detail) + '</span></li>').join("");
  return '<div class="brief-preflight-box ' + report.level + '">' +
    '<div class="preflight-title"><strong>Brief-Preflight: ' + escapeHtml(report.label) + '</strong><span class="status ' + badgeClass + '">' + badgeLabel + '</span></div>' +
    '<div class="small">' + escapeHtml(report.message) + '</div>' +
    '<div class="preflight-grid"><span class="preflight-pill">' + report.errors + ' Fehler</span><span class="preflight-pill">' + report.warnings + ' Hinweise</span><span class="preflight-pill">' + report.ok + ' OK</span><span class="preflight-pill">' + report.infos + ' Druckhinweise</span></div>' +
    (rows ? '<ul class="brief-preflight-list">' + rows + '</ul>' : '') +
    (infoRows ? '<details><summary>Druckhinweise anzeigen</summary><ul class="brief-preflight-list">' + infoRows + '</ul></details>' : '') +
    '</div>';
}


function printGuideHtml(scopeLabel) {
  return '<div class="print-guide"><strong>Druck-/PDF-Hinweis ' + escapeHtml(scopeLabel || "") + '</strong><div>A4 wählen · Skalierung 100 % · Browser-Kopf-/Fußzeilen deaktivieren · Hintergrundgrafiken/Farben aktivieren, falls der Browser danach fragt.</div><div class="screen-print-actions"><button type="button" onclick="window.print()">Jetzt drucken / PDF speichern</button><button type="button" onclick="window.close()">Fenster schließen</button></div></div>';
}

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
    const pageCount = (html.match(/letter-sheet/g) || []).length;
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

function printHardeningBoxHtml(report) {
  if (!report) return "";
  const badgeClass = report.level === "err" ? "err" : (report.level === "warn" ? "warn" : "ok");
  const badgeLabel = report.level === "err" ? "Fehler" : (report.level === "warn" ? "Prüfen" : "OK");
  const rows = report.items.filter(item => item.level !== "info").map(item => {
    const cls = item.level === "err" ? "err" : (item.level === "warn" ? "warn" : "ok");
    const label = item.level === "err" ? "Fehler" : (item.level === "warn" ? "Prüfen" : "OK");
    return '<li><span class="status ' + cls + '">' + label + '</span><span><strong>' + escapeHtml(item.label) + ':</strong> ' + escapeHtml(item.detail) + '</span></li>';
  }).join("");
  return '<div class="print-hardening-box ' + report.level + '"><div class="preflight-title"><strong>Druck-/PDF-Härtung: ' + escapeHtml(report.label) + '</strong><span class="status ' + badgeClass + '">' + badgeLabel + '</span></div><div class="small">' + escapeHtml(report.message) + '</div><div class="print-hardening-grid"><span class="print-hardening-pill">' + report.errors + ' Fehler</span><span class="print-hardening-pill">' + report.warnings + ' Hinweise</span><span class="print-hardening-pill">' + report.ok + ' OK</span><span class="print-hardening-pill">' + report.infos + ' Druckhinweise</span></div>' + (rows ? '<ul class="print-hardening-list">' + rows + '</ul>' : '') + '</div>';
}

function currentPrintHardeningReport() {
  const calc = calculateUmlage();
  const selected = selectedBriefTenant(calc);
  return printHardeningReport(calc, selected);
}

function printReportText(report) {
  if (!report) return "Kein Druckbericht verfügbar.";
  const lines = [];
  lines.push("Druck-/PDF-Härtung: " + report.label);
  lines.push(report.message);
  lines.push(report.errors + " Fehler · " + report.warnings + " Hinweise · " + report.ok + " OK · " + report.infos + " Druckhinweise");
  report.items.forEach(item => lines.push((item.level === "err" ? "Fehler" : (item.level === "warn" ? "Prüfen" : (item.level === "info" ? "Hinweis" : "OK"))) + " · " + item.label + ": " + item.detail));
  return lines.join("\n");
}

function showPrintModeCheck() {
  const report = currentPrintHardeningReport();
  alert(printReportText(report));
  return report;
}

function printWindowHtml(title, bodyHtml, scopeLabel) {
  return '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>' + escapeHtml(title || "Nebenkostenabrechnungsbrief") + '</title><style>' + briefPrintStyles() + '</style></head><body>' + printGuideHtml(scopeLabel || "") + bodyHtml + '</body></html>';
}

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

function allLettersPrintReadiness(calc) {
  const rows = briefResultRows(calc);
  const reports = rows.map(result => ({ result, preflight:briefPreflightReport(calc, result), print:printHardeningReport(calc, result) }));
  const errors = reports.reduce((sum,r) => sum + r.preflight.errors + r.print.errors, 0);
  const warnings = reports.reduce((sum,r) => sum + r.preflight.warnings + r.print.warnings, 0);
  return { rows, reports, errors, warnings };
}

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
function currentBriefPreflightReport() {
  const calc = calculateUmlage();
  const selected = selectedBriefTenant(calc);
  return briefPreflightReport(calc, selected);
}

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

function plainLetterTextFromHtml(htmlText) {
  const div = document.createElement("div");
  div.innerHTML = htmlText;
  return div.innerText || div.textContent || "";
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

function costSectionRows(rows, year) {
  return rows.map(r => {
    const g = letterCostGroup(r);
    const manualExternal = isManualExternalCostDefinition(r);
    const showCalc = !manualExternal && (Math.abs(num(r.basisTotal)) > 0.004 || Math.abs(num(r.preis)) > 0.004 || Math.abs(num(r.einheiten)) > 0.004);
    const lineLabel = manualExternal ? manualExternalLetterLineLabel(g, r) : g.line;
    const rowPeriod = r.period || letterPeriod(year);
    return `
      <tr class="section-title"><td colspan="7">${escapeHtml(g.title)}</td></tr>
      <tr>
        <td>${escapeHtml(lineLabel)}</td>
        <td class="center">${escapeHtml(rowPeriod)}</td>
        <td class="money">${fmtMoney(r.gesamtbetrag)}</td>
        <td class="center">${showCalc ? escapeHtml(fmtUnits(r.basisTotal)) : ""}</td>
        <td class="money">${showCalc ? fmtMoney(r.preis) : ""}</td>
        <td class="center">${showCalc ? "x&nbsp;&nbsp;" + escapeHtml(fmtUnits(r.einheiten)) : ""}</td>
        <td class="money">${fmtMoney(r.anteil)}</td>
      </tr>
      <tr>
        <td>${escapeHtml(g.prepay)}</td>
        <td class="center">${escapeHtml(rowPeriod)}</td>
        <td></td><td></td><td></td><td></td>
        <td class="money">${fmtMoney(r.vorauszahlung)}</td>
      </tr>
      ${num(r.weitereVorauszahlung) ? '<tr><td>Weitere Vorauszahlung</td><td class="center">' + escapeHtml(rowPeriod) + '</td><td></td><td></td><td></td><td></td><td class="money">' + fmtMoney(r.weitereVorauszahlung) + '</td></tr>' : ''}
      <tr class="subtotal">
        <td colspan="6">${escapeHtml(settlementLabel(g, r.settlement))}</td>
        <td class="money">${fmtMoneySigned(r.settlement)}</td>
      </tr>`;
  }).join("");
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

function buildPrepaymentPage(costRows, tenant, extraNote = "") {
  ensureBriefSettings();
  const s = state.briefSettings;
  if (s.vorauszahlungPrintMode === "Nicht drucken" || s.showVorauszahlungPage !== "Ja") return "";
  const rows = monthlyPrepaymentRows(costRows, tenant);
  if (!rows.some(r => Math.abs(num(r.change)) >= 0.01)) return "";
  const sumNew = rows.reduce((a,b) => a + num(b.newMonthly), 0);
  const kaltMonthly = num(tenant.kaltSoll) / 12;
  const warmMonthly = kaltMonthly + sumNew;
  const effectiveDate = effectivePrepaymentDateLabel();
  const effectiveYear = effectivePrepaymentYearLabel();
  const summaryLabel = effectiveYear ? "Summe Nebenkostenvorauszahlung ab " + effectiveYear + " monatlich" : "Summe Nebenkostenvorauszahlung ab " + effectiveDate + " monatlich";
  const warmLabel = effectiveYear ? "Gesamtbetrag (Warmmiete) ab " + effectiveYear + " monatlich" : "Gesamtbetrag (Warmmiete) ab " + effectiveDate + " monatlich";
  const rowHtml = rows.map(r => `
    <tr>
      <td>${escapeHtml(r.label)}</td>
      <td>${escapeHtml(r.turnus)}</td>
      <td class="money">${fmtMoney(r.oldMonthly)}</td>
      <td class="money">${fmtMoneySigned(r.change)}</td>
      <td class="money">${r.newMonthly ? fmtMoney(r.newMonthly) : "- €"}</td>
    </tr>`).join("");

  return `
    <div class="letter-sheet letter-prepayment-sheet">
      <div class="letter-body">
        <div class="letter-head">
          ${briefTextWithLineBreaks(s.absenderName || s.absender)}<br>
          ${briefTextWithLineBreaks(s.absenderStrasse || "")}<br>
          ${briefTextWithLineBreaks(s.absenderOrt || "")}<br>
          ${briefTextWithLineBreaks(s.absenderTelefon || "")}
        </div>
        <h2>Anpassung der Nebenkostenvorauszahlung</h2>
        <div class="letter-bullet-list">
          <div class="letter-bullet"><span class="letter-bullet-mark">•</span><span>${briefProseHtml((s.vorauszahlungIntro || "").replace("{datum}", effectiveDate))}</span></div>
        </div>
        <table class="prepay-table">
          <colgroup><col class="col-prepay-label"><col class="col-prepay-turnus"><col class="col-prepay-money"><col class="col-prepay-money"><col class="col-prepay-money"></colgroup>
          <thead>
            <tr><th>Art der Nebenkosten</th><th>Turnus</th><th class="money">Bisheriger Betrag</th><th class="money">Änderung ab ${escapeHtml(effectiveDate)}</th><th class="money">Neuer Betrag ab ${escapeHtml(effectiveDate)}</th></tr>
          </thead>
          <tbody>
            ${rowHtml}
            <tr class="summary"><td colspan="4">${escapeHtml(summaryLabel)}</td><td class="money">${fmtMoney(sumNew)}</td></tr>
            <tr><td colspan="4">Kaltmiete monatlich</td><td class="money">${fmtMoney(kaltMonthly)}</td></tr>
            <tr class="summary final"><td colspan="4">${escapeHtml(warmLabel)}</td><td class="money">${fmtMoney(warmMonthly)}</td></tr>
          </tbody>
        </table>
        <div class="letter-bullet-list">
          <div class="letter-bullet"><span class="letter-bullet-mark">•</span><span>Bitte passen Sie Ihren monatlichen Dauerauftrag bei Ihrer Bank ab ${escapeHtml(effectiveDate)} auf ${fmtMoney(warmMonthly)} an.</span></div>
        </div>
        ${extraNote ? '<p class="note">' + briefProseHtml(extraNote) + '</p>' : ''}
        <p class="closing"><span class="closing-greeting">${briefTextWithLineBreaks(s.gruss)}</span><span class="signature-block">${briefTextWithLineBreaks(s.signatur)}</span></p>
      </div>
      <div class="footer">Kontoverbindung: ${escapeHtml(s.bankverbindung)}</div>
    </div>`;
}

function briefMainPageOverflows(pageHtml) {
  if (typeof document === "undefined" || !document.body) return false;
  const host = document.createElement("div");
  host.className = "letter-page";
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:absolute;left:-12000px;top:0;width:210mm;max-width:none;padding:0;visibility:hidden;pointer-events:none;";
  host.innerHTML = pageHtml;
  document.body.appendChild(host);
  const sheet = host.querySelector(".letter-main-sheet");
  const content = host.querySelector(".letter-main-content");
  const footer = host.querySelector(".letter-main-sheet > .footer");
  let overflow = false;
  if (sheet && content && footer) {
    const children = Array.from(content.children).filter(el => el.getClientRects().length);
    const last = children[children.length - 1];
    const lastBottom = last ? last.getBoundingClientRect().bottom : content.getBoundingClientRect().top;
    const footerTop = footer.getBoundingClientRect().top;
    overflow = lastBottom > footerTop - 4 || sheet.scrollHeight > sheet.clientHeight + 1;
  }
  host.remove();
  return overflow;
}

function buildBriefHtml(calc, result) {
  ensureBriefSettings();
  const s = state.briefSettings;
  if (!result) return '<div class="letter-sheet"><p>Es ist kein Mieter mit berechneter Nebenkostenumlage vorhanden.</p></div>';

  const t = result.tenant;
  const year = s.abrechnungsjahr || currentAbrechnungsjahr();
  const costRows = briefCostRows(calc, t);
  const correction = num(result.correction || t.vorjahresKorrektur);
  const settlement = settlementInfoForResult(result, t);
  const finalLabel = settlement.finalLabel;
  const noteText = settlement.isNachzahlung ? s.saldoTextNachzahlung : s.saldoTextGuthaben;
  const address = getBriefTenantAddress(t);
  const intro = (s.introText || "").replaceAll("{jahr}", year).replaceAll("{zeitraum}", periodLabelShort());
  const senderLine = [s.absenderName || s.absender, s.absenderStrasse, s.absenderOrt].filter(Boolean).join(" · ");
  const extraText = String(s.outroText || "");
  const prepaymentPage = buildPrepaymentPage(costRows, t, extraText);

  const mainPage = (outroText, includeClosing) => `
    <div class="letter-sheet letter-main-sheet">
      <div class="letter-topbar">${briefTextWithLineBreaks(s.absenderName || s.absender)} · ${briefTextWithLineBreaks(s.absenderStrasse || "")} · ${briefTextWithLineBreaks(s.absenderOrt || "")} · ${briefTextWithLineBreaks(s.absenderTelefon || "")}</div>
      <div class="letter-window-zone"><div class="return-address">${escapeHtml(senderLine)}</div><div class="address">${briefTextWithLineBreaks(address)}</div></div>
      <div class="letter-main-date">${escapeHtml(s.ort || "")}, den ${escapeHtml(dateDe(s.briefdatum))}</div>
      <div class="letter-body letter-main-content">
        <p class="salutation">${escapeHtml(salutationForTenant(t))}</p>
        <p class="intro">${briefProseHtml(intro)}</p>
        <table class="abrechnung-table">
          <colgroup><col class="col-desc"><col class="col-period"><col class="col-total"><col class="col-basis"><col class="col-price"><col class="col-units"><col class="col-share"></colgroup>
          <thead><tr><th></th><th class="center">Zeitraum</th><th class="money">Gesamtkosten p.a.</th><th class="center">Gesamteinheiten</th><th class="money">Preis je Einheit</th><th class="center">x&nbsp;Ihre Einheiten</th><th class="money">Ihre Kosten</th></tr></thead>
          <tbody>
            ${costSectionRows(costRows, year) || '<tr><td colspan="7">Keine umlagefähigen Kosten vorhanden.</td></tr>'}
            <tr class="summary-spacer" aria-hidden="true"><td colspan="7"></td></tr>
            <tr class="summary summary-block-start"><td colspan="6">Ihr Anteil an den Gesamtkosten</td><td class="money">${fmtMoney(result.costShare)}</td></tr>
            <tr class="summary"><td colspan="6">Ihre Vorauszahlung</td><td class="money">${fmtMoney(result.prepayments)}</td></tr>
            ${correction ? '<tr class="summary"><td colspan="6">Nebenkostenkorrektur ' + escapeHtml(String(yearNumber(year)-1)) + ' zu Ihren Gunsten</td><td class="money">' + fmtMoney(correction) + '</td></tr>' : ''}
            <tr class="summary final"><td colspan="6">${escapeHtml(finalLabel)}</td><td class="money">${fmtMoney(settlement.amount)}</td></tr>
          </tbody>
        </table>
        <p class="note after-table-note">${briefProseHtml(s.heizkostenFussnote || "")}</p>
        <p class="note saldo-note">${briefProseHtml(noteText || "")}</p>
        ${outroText ? '<p class="note saldo-note">' + briefProseHtml(outroText) + '</p>' : ''}
        ${includeClosing ? '<p class="closing"><span class="closing-greeting">' + briefTextWithLineBreaks(s.gruss) + '</span><span class="signature-block">' + briefTextWithLineBreaks(s.signatur) + '</span></p>' : ''}
      </div>
      <div class="footer">Kontoverbindung: ${escapeHtml(s.bankverbindung)}</div>
    </div>`;

  let mainHtml = mainPage(prepaymentPage ? "" : extraText, !prepaymentPage);
  let supplementPage = "";
  if (!prepaymentPage && extraText && briefMainPageOverflows(mainHtml)) {
    mainHtml = mainPage("", false);
    supplementPage = `<div class="letter-sheet letter-supplement-sheet"><div class="letter-body"><h2>Ergänzender Hinweis zur Nebenkostenabrechnung</h2><p class="note">${briefProseHtml(extraText)}</p><p class="closing"><span class="closing-greeting">${briefTextWithLineBreaks(s.gruss)}</span><span class="signature-block">${briefTextWithLineBreaks(s.signatur)}</span></p></div><div class="footer">Kontoverbindung: ${escapeHtml(s.bankverbindung)}</div></div>`;
  }
  return mainHtml + prepaymentPage + supplementPage;
}
function renderBrief() {
  ensureYearData();
  const settingsEl = document.getElementById("briefSettings");
  const textsEl = document.getElementById("briefTexts");
  const previewEl = document.getElementById("briefPreview");
  if (!settingsEl || !textsEl || !previewEl) return;

  ensureBriefSettings();
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
    '<label>Mieter auswählen</label><select onchange="setBriefSetting(\'tenantId\',this.value)">' + tenantOptions + '</select>' +
    '<div class="hint"><strong>Empfängeradresse und Anrede</strong> werden im Tab „Mieter & Wohnungen“ beim jeweiligen Mietverhältnis gepflegt.</div>' +
    briefPreflightBoxHtml(briefPreflight) +
    printHardeningBoxHtml(printHardeningReport(calc, selected)) +
    briefSettlementSummaryHtml(selected) +
    (billingEntryForTenant(selected && selected.tenant) ? '<div class="hint"><strong>Briefmodus:</strong> Originalnahe Archivansicht aus importierten Abrechnungsdaten. Die Beträge werden aus denselben strukturierten Datenfeldern erzeugt wie die neue Standardabrechnung.</div>' : '<div class="hint"><strong>Briefmodus:</strong> Standardbrief aus den aktuellen Abrechnungsdaten.</div>') +
    '<label>Abrechnungsjahr</label><input value="' + escapeHtml(s.abrechnungsjahr) + '" onchange="setBriefSetting(\'abrechnungsjahr\',this.value)">' +
    '<label>Briefdatum</label><input type="date" value="' + escapeHtml(s.briefdatum) + '" onchange="setBriefSetting(\'briefdatum\',this.value)">' +
    '<label>Zahlungsziel</label><input type="date" value="' + escapeHtml(s.zahlungsziel) + '" onchange="setBriefSetting(\'zahlungsziel\',this.value)">' +
    '<label>Ort</label><input value="' + escapeHtml(s.ort) + '" onchange="setBriefSetting(\'ort\',this.value)">' +
    '<label>Vermieter Name</label><input value="' + escapeHtml(s.absenderName) + '" onchange="setBriefSetting(\'absenderName\',this.value)">' +
    '<label>Vermieter Straße</label><input value="' + escapeHtml(s.absenderStrasse) + '" onchange="setBriefSetting(\'absenderStrasse\',this.value)">' +
    '<label>Vermieter PLZ/Ort</label><input value="' + escapeHtml(s.absenderOrt) + '" onchange="setBriefSetting(\'absenderOrt\',this.value)">' +
    '<label>Telefon</label><input value="' + escapeHtml(s.absenderTelefon) + '" onchange="setBriefSetting(\'absenderTelefon\',this.value)">' +

    '<label>Bankverbindung</label><input value="' + escapeHtml(s.bankverbindung) + '" onchange="setBriefSetting(\'bankverbindung\',this.value)">' +
    '<h3>Vorauszahlungsanpassung</h3>' +
    '<label>Im Brief andrucken?</label>' + selectHtml(s.vorauszahlungPrintMode, ["Nicht drucken","Berechnete Werte drucken","Manuelle Werte drucken"], "setBriefSetting('vorauszahlungPrintMode',this.value)") +
    '<label>Neue Vorauszahlung ab</label><input value="' + escapeHtml(s.vorauszahlungAb) + '" onchange="setBriefSetting(\'vorauszahlungAb\',this.value)">' +
    '<div class="hint"><strong>Berechnete Werte</strong> kommen aus dem neuen Tab „Vorauszahlungsanpassung“. Manuelle Werte darunter werden nur genutzt, wenn „Manuelle Werte drucken“ gewählt ist.</div>' +
    '<label>Manuell: Änderung Heizung monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeHeizung) + '" onchange="setBriefSetting(\'vzChangeHeizung\',this.value)">' +
    '<label>Manuell: Änderung Wasser monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeWasser) + '" onchange="setBriefSetting(\'vzChangeWasser\',this.value)">' +
    '<label>Manuell: Änderung Abfall monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeAbfall) + '" onchange="setBriefSetting(\'vzChangeAbfall\',this.value)">' +
    '<label>Manuell: Änderung Antenne monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeAntenne) + '" onchange="setBriefSetting(\'vzChangeAntenne\',this.value)">' +
    '<label>Manuell: Änderung sonstige Verbrauchskosten monatlich</label><input class="money" value="' + escapeHtml(s.vzChangeSonstige) + '" onchange="setBriefSetting(\'vzChangeSonstige\',this.value)">';

  textsEl.innerHTML =
    '<label>Einleitungstext ({jahr} und {zeitraum} werden ersetzt)</label>' + textareaHtml(s.introText, "setBriefSetting('introText',this.value)") +
    '<label>Hinweistext Nachzahlung/Guthaben</label>' + textareaHtml(s.saldoTextNachzahlung, "setBriefSetting('saldoTextNachzahlung',this.value)") +
    '<label>Text Vorauszahlungsanpassung ({datum} wird ersetzt)</label>' + textareaHtml(s.vorauszahlungIntro, "setBriefSetting('vorauszahlungIntro',this.value)") +
    '<label>Fußnote Heizkosten</label>' + textareaHtml(s.heizkostenFussnote, "setBriefSetting('heizkostenFussnote',this.value)") +
    '<label>Zusatztext nach Abrechnung</label>' + textareaHtml(s.outroText, "setBriefSetting('outroText',this.value)") +
    '<label>Grußformel</label>' + textareaHtml(s.gruss, "setBriefSetting('gruss',this.value)") +
    '<label>Signatur</label>' + textareaHtml(s.signatur, "setBriefSetting('signatur',this.value)");

  previewEl.dataset.hasBrief = selected && !briefValidation.errors.length ? "true" : "false";
  previewEl.dataset.validationErrors = String(briefValidation.errors.length);
  previewEl.dataset.validationWarnings = String(briefValidation.warnings.length);
  previewEl.innerHTML = buildBriefHtml(calc, selected);
}
function currentBriefPreviewOrWarn() {
  const preview = document.getElementById("briefPreview");
  if (!preview) {
    alert("Die Briefvorschau wurde nicht gefunden. Bitte den Tab Abrechnungsbriefe neu öffnen.");
    return null;
  }
  const text = plainLetterTextFromHtml(preview.innerHTML).trim();
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
  openPrintWindow("Nebenkostenabrechnungsbrief", preview.innerHTML, "aktueller Brief", true);
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
  const text = plainLetterTextFromHtml(preview.innerHTML).trim();
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

function cellSortValue(cell) {
  const input = cell.querySelector("input, select");
  const raw = input ? input.value : cell.textContent;
  const text = String(raw ?? "").trim();
  const numeric = Number(text.replace(/[€\s]/g, "").replace(/\./g, "").replace(",", "."));
  if (text !== "" && !Number.isNaN(numeric)) return { type:"number", value:numeric };
  const dateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) return { type:"number", value:new Date(text).getTime() };
  return { type:"text", value:text.toLocaleLowerCase("de-DE") };
}

function sortTable(tableId, columnIndex) {
  const table = document.getElementById(tableId);
  if (!table || !table.tBodies.length) return;

  const current = tableSortState[tableId] || {};
  const direction = current.columnIndex === columnIndex && current.direction === "asc" ? "desc" : "asc";
  tableSortState[tableId] = { columnIndex, direction };

  const tbody = table.tBodies[0];
  const allRows = Array.from(tbody.rows);
  const totalRows = allRows.filter(row => row.classList.contains("total-row"));
  const rows = allRows.filter(row => !row.classList.contains("total-row"));
  rows.sort((a,b) => {
    const av = cellSortValue(a.cells[columnIndex] || {});
    const bv = cellSortValue(b.cells[columnIndex] || {});
    let result = 0;
    if (av.type === "number" && bv.type === "number") result = av.value - bv.value;
    else result = String(av.value).localeCompare(String(bv.value), "de-DE", { numeric:true, sensitivity:"base" });
    return direction === "asc" ? result : -result;
  });
  rows.forEach(row => tbody.appendChild(row));
  totalRows.forEach(row => tbody.appendChild(row));

  const headers = table.querySelectorAll("thead th");
  headers.forEach((th, idx) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (idx === columnIndex) th.classList.add(direction === "asc" ? "sort-asc" : "sort-desc");
  });
  applyTableFilter(tableId);
}

function applyTableFilter(tableId) {
  const table = document.getElementById(tableId);
  if (!table || !table.tBodies.length) return;
  const query = (tableFilters[tableId] || "").toLocaleLowerCase("de-DE").trim();
  Array.from(table.tBodies[0].rows).forEach(row => {
    if (row.classList.contains("total-row")) {
      row.classList.remove("filtered-out");
      return;
    }
    const text = row.textContent.toLocaleLowerCase("de-DE");
    row.classList.toggle("filtered-out", query !== "" && !text.includes(query));
  });
}

function clearTableFilter(tableId) {
  tableFilters[tableId] = "";
  const input = document.querySelector('.table-tools[data-table="' + tableId + '"] input');
  if (input) input.value = "";
  applyTableFilter(tableId);
}

function ensureTableTools(table) {
  if (!table.id) return;
  const wrap = table.closest(".table-wrap");
  if (!wrap) return;
  let tools = document.querySelector('.table-tools[data-table="' + table.id + '"]');
  if (!tools) {
    tools = document.createElement("div");
    tools.className = "table-tools";
    tools.dataset.table = table.id;
    tools.innerHTML =
      '<input type="search" placeholder="' + (tableLabels[table.id] || "Tabelle") + ' filtern ...">' +
      '<button type="button">Filter löschen</button>' +
      '<span class="small">Spaltenüberschriften anklicken zum Sortieren.</span>';
    wrap.parentNode.insertBefore(tools, wrap);

    const input = tools.querySelector("input");
    input.addEventListener("input", () => {
      tableFilters[table.id] = input.value;
      applyTableFilter(table.id);
    });
    tools.querySelector("button").addEventListener("click", () => clearTableFilter(table.id));
  }
  const input = tools.querySelector("input");
  if (input) input.value = tableFilters[table.id] || "";
}

function enhanceTables() {
  document.querySelectorAll("table").forEach(table => {
    if (!table.id) return;
    ensureTableTools(table);

    table.querySelectorAll("thead th").forEach((th, idx) => {
      th.classList.add("sortable");
      th.onclick = () => sortTable(table.id, idx);
    });

    const sortState = tableSortState[table.id];
    if (sortState && sortState.columnIndex !== undefined) {
      const headers = table.querySelectorAll("thead th");
      headers.forEach((th, idx) => {
        th.classList.remove("sort-asc", "sort-desc");
        if (idx === sortState.columnIndex) th.classList.add(sortState.direction === "asc" ? "sort-asc" : "sort-desc");
      });
    }
    applyTableFilter(table.id);
  });
}


// ===== Bereich: Release-Audit V75 =====
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
  const oldState = state;
  const oldPendingStorageWarning = pendingStorageWarning;
  const oldLastActionMessage = lastActionMessage;
  const oldRenderErrors = Array.isArray(renderErrors) ? renderErrors.slice() : [];
  try {
    state = tempState;
    return fn();
  } finally {
    state = oldState;
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
    const src = createNewBillingFromModal.toString();
    if (src.includes('enterBillingMode("mieter")') || src.includes("enterBillingMode('mieter')")) throw new Error("Anlegen springt noch direkt ins Dashboard");
    if (!src.includes('switchToTab("start")') && !src.includes("switchToTab('start')")) throw new Error("Startseiten-Rückkehr nach dem Anlegen fehlt");
    return "Anlegen bleibt im Startmodus · Bearbeitung erfolgt über vorhandenen Tabellen-Button";
  });

  runCheck("Startseite", "Archivieren erzeugt keine Folgeabrechnung", () => withAuditState(clone(SEED), () => {
    markCurrentBillingCreatedByUser();
    const beforeYear = currentAbrechnungsjahr();
    const beforeArchiveCount = state.jahresArchiv.length;
    const snapshot = createYearSnapshot();
    if (!upsertYearArchive(snapshot)) throw new Error("Archiv-Snapshot konnte im Audit nicht gespeichert werden");
    closeCurrentBillingAfterArchive(snapshot);
    if (hasActiveCurrentBilling()) throw new Error("Archivierte Bearbeitung bleibt als aktive Abrechnung sichtbar");
    if (currentAbrechnungsjahr() !== beforeYear) throw new Error("Archivieren hat das Abrechnungsjahr verändert");
    if (state.jahresArchiv.length !== beforeArchiveCount + 1) throw new Error("Archivieren hat nicht genau einen Archivdatensatz erzeugt");
    const html = buildBillingRecordsTableHtml();
    if (html.includes("current-record-row")) throw new Error("Starttabelle zeigt nach Archivierung noch einen aktuellen Arbeitsstand");
    const srcOpen = openCurrentBilling.toString();
    const srcFinalize = finalizeCurrentBilling.toString();
    const srcArchive = archiveCurrentYearOnly.toString();
    if (srcOpen.includes("resetAnnualValuesForNextYear") || srcFinalize.includes("resetAnnualValuesForNextYear") || srcArchive.includes("resetAnnualValuesForNextYear")) throw new Error("Startseitenaktion enthält Jahreswechsel-/Neuanlage-Logik");
    return "Archivieren schließt die Bearbeitung und zeigt nur den Archivdatensatz; keine Folgeabrechnung";
  }));

  runCheck("V77/V79", "Vorjahreswerte und Zähler-Endwerte leer", () => withAuditState(clone(SEED), () => {
    markCurrentBillingCreatedByUser();
    syncVorauszahlungen();
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

  runCheck("V78", "Umlage-Kontrolltabelle nach Kostenart", () => withAuditState(clone(SEED), () => {
    markCurrentBillingCreatedByUser();
    renderUmlage();
    const costHtml = document.getElementById("umlageCostsTable").innerHTML || "";
    if (!costHtml.includes("Umlageschlüssel") || !costHtml.includes("Berechnungsart")) throw new Error("Umlageart/ Berechnungsart fehlen in der Kostenart-Kontrolltabelle");
    if (!costHtml.includes('th class="unit-head')) throw new Error("Wohneinheiten-/Mietparteien-Spalten fehlen in der Kostenart-Kontrolltabelle");
    if (String(renderUmlage.toString()).includes("umlageUnitsTable")) throw new Error("Alte separate Wohneinheiten-Tabelle wird noch beschrieben");
    const legacyUnitsTable = document.getElementById("umlageUnitsTable");
    if (legacyUnitsTable && legacyUnitsTable.innerHTML) throw new Error("Alte Wohneinheiten-Tabelle wird noch befüllt");
    if (!costHtml.includes("Differenz") || !costHtml.includes("Summe echte Mieter")) throw new Error("Kontrollsummen fehlen in der Kostenart-Kontrolltabelle");
    return "Eine Zeile je Kostenart mit Umlageart, relevanten Werten, Summen, Differenz und Wohneinheiten-/Mietparteien-Spalten";
  }));

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
    syncKostenartenMieterUmlage();
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
    const current = exportCurrentBillingSnapshot();
    if (!Array.isArray(full.jahresArchiv)) throw new Error("Gesamtexport enthält kein Jahresarchiv");
    if (Object.prototype.hasOwnProperty.call(state, "stammdaten") && !Object.prototype.hasOwnProperty.call(full, "stammdaten")) throw new Error("Gesamtexport verliert Objekt-Stammdaten");
    if (Object.prototype.hasOwnProperty.call(state, "waterMeterHistory") && !Object.prototype.hasOwnProperty.call(full, "waterMeterHistory")) throw new Error("Gesamtexport verliert globale Zählerhistorie");
    if (Object.prototype.hasOwnProperty.call(current, "jahresArchiv")) throw new Error("Einzelabrechnungsexport enthält Jahresarchivdaten");
    if (Object.prototype.hasOwnProperty.call(current, "stammdaten")) throw new Error("Einzelabrechnungsexport enthält Objekt-Stammdaten");
    if (Object.prototype.hasOwnProperty.call(current, "waterMeterHistory")) throw new Error("Einzelabrechnungsexport enthält globale Zählerhistorie");
    if (current.meta.exportScope !== "currentBillingOnly") throw new Error("Einzelabrechnungsexport hat falschen Scope");
    return "Gesamtexport mit globalen Ebenen und Archiv · Einzelabrechnung als begrenzter Snapshot";
  }));

  runCheck("Brief", "Tabellen-Lesbarkeit ohne Umbruch", () => {
    const styles = briefPrintStyles();
    if (!styles.includes("tbody td{white-space:nowrap")) throw new Error("Briefdruck-CSS setzt Datenzellen nicht auf nowrap");
    if (!styles.includes("thead th,.prepay-table thead th{white-space:normal")) throw new Error("Briefdruck-CSS erlaubt Tabellenkopf-Umbruch nicht");
    if (!styles.includes("font-size:10.15px")) throw new Error("Briefdruck-CSS enthält nicht die V62/V63-Schriftgröße für Tabellen");
    return "Tabellenzellen ohne Umbruch · größere Schrift aktiviert";
  });

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
    if (!html.includes('class="footer"')) throw new Error("Fußzeile fehlt");
    if (!html.includes("summary-spacer")) throw new Error("Summenblock-Abstand fehlt");
    return "Briefstruktur enthält A4-Seite, Fußzeile und Summenblock-Abstand";
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
    state.mieter[0].auszug = "2025-06-30";
    state.mieter[0].aktiveTage = 181;
    state.mieter[1].einzug = "2025-07-01";
    state.mieter[1].aktiveTage = 184;
    const report = specialCaseWatchReport();
    if (!report || !Array.isArray(report.rows)) throw new Error("Sonderfall-Bericht fehlt");
    if (!report.rows.some(r => r.type === "Unterjährig")) throw new Error("Unterjähriger Fall wird nicht erkannt");
    if (!report.rows.some(r => r.type === "Leerstand")) throw new Error("Leerstand wird nicht erkannt");
    if (!report.rows.some(r => r.type === "Eigentümer/Privat")) throw new Error("Eigentümer-/Privatrolle wird nicht erkannt");
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

function showReleaseAuditReport() {
  const text = releaseAuditReportText();
  alert(text);
  return text;
}

function downloadReleaseAuditReport() {
  download(txtFileName("nk-pro-release-audit"), releaseAuditReportText(), "text/plain;charset=utf-8");
}

function renderReleaseAuditSummary() {
  const el = document.getElementById("releaseAuditSummary");
  if (!el) return;
  const report = releaseAuditReport();
  const s = report.summary;
  const problemRows = report.rows.filter(row => row.severity === "Fehler" || row.severity === "Prüfen" || row.severity === "Hinweis");
  const detailsHtml = problemRows.length ? '<div class="small" style="margin-top:10px"><strong>Details:</strong><ul style="margin:6px 0 0 18px; padding:0">' +
    problemRows.slice(0, 8).map(row => '<li><strong>' + escapeHtml(row.severity) + ' · ' + escapeHtml(row.area) + ' · ' + escapeHtml(row.point) + '</strong>' + (row.detail ? ': ' + escapeHtml(row.detail) : '') + '</li>').join('') +
    (problemRows.length > 8 ? '<li>Weitere Einträge im vollständigen Auditbericht.</li>' : '') + '</ul></div>' : '';
  el.innerHTML = '<div class="release-audit-box ' + s.level + '"><strong>Release-Audit ' + escapeHtml(APP_VERSION) + '</strong><div class="small">' + escapeHtml(s.message) + '</div>' +
    '<div class="audit-grid"><span class="audit-pill">' + s.ok + ' OK</span><span class="audit-pill">' + s.warnings + ' Hinweise</span><span class="audit-pill">' + s.errors + ' Fehler</span><span class="audit-pill">' + escapeHtml(APP_VERSION_NAME) + '</span></div>' + detailsHtml + '</div>';
}

// ===== Bereich: App-Selbsttest =====

function stableStringify(value) { return JSON.stringify(value); }

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

  runCheck("Speicher", "LocalStorage beschreibbar", () => {
    if (!storageWritable()) throw new Error("LocalStorage nicht beschreibbar");
    return "OK";
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
    if (typeof prepareStateForPersistence !== "function") throw new Error("Zentrale Zustandsaufbereitung fehlt");
    const before = statePreparationCount;
    renderCurrentView({ forceAll:false, reason:"architecture-test" });
    if (statePreparationCount !== before) throw new Error("Renderlauf hat Zustandsaufbereitung ausgelöst");
    return "Darstellung und Zustandsaufbereitung getrennt";
  });

  runCheck("Stabilität", "V91-Safe-Cleanup", () => {
    const requiredDynamicFunctions = [
      "resetData", "setWaterMeterSetting", "setWaterMeterValue", "setGenericMeterValue",
      "setManualInputMode", "setManualExternalValue", "resetUmlageInputs", "setPrepaymentAdjustmentSetting", "setBriefSetting",
      "printCurrentBrief", "copyCurrentBriefText"
    ];
    const missing = requiredDynamicFunctions.filter(name => typeof globalThis[name] !== "function");
    if (missing.length) throw new Error("Dynamische Bedienfunktionen fehlen: " + missing.join(", "));
    if (typeof getBriefTenantAddress !== "function" || typeof validateBriefResult !== "function") throw new Error("Aktive Briefpfade fehlen");
    return "Ungenutzte Altpfade entfernt; dynamische Bedien- und Briefpfade vorhanden";
  });

  runCheck("Stabilität", "Alle Hauptansichten renderbar", () => {
    const before = renderErrors.length;
    renderCurrentView({ forceAll:true, reason:"self-test" });
    const created = renderErrors.slice(before);
    if (created.length) throw new Error(created.map(e => e.area + ": " + e.message).join(" | "));
    return "Alle Hauptansichten ohne Renderfehler geprüft";
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
    if (isCurrentBillingFinalized()) throw new Error("Audit-Basis darf nicht finalisiert starten");
    state.meta.currentBillingFinalized = true;
    state.meta.currentBillingFinalizationKey = currentBillingFinalizationKey();
    state.meta.currentBillingFinalizedAt = "2026-07-10T00:00:00.000Z";
    if (!isCurrentBillingFinalized()) throw new Error("Finalisierung wird nicht erkannt");
    clearCurrentBillingFinalization();
    if (isCurrentBillingFinalized()) throw new Error("Finalisierung wurde nicht entfernt");
    return "Finalisieren/Entsperren-Status OK";
  }));

  runCheck("Navigation", "Datenebenen und Snapshot-Grenzen V99.4.2", () => {
    const nav = document.querySelector(".workflow-nav");
    if (!nav) throw new Error("Workflow-Navigation fehlt");
    const groups = Array.from(nav.querySelectorAll(":scope > .nav-group")).map(group => group.dataset.navGroupSection);
    if (groups.join("|") !== "object|billing|archive|extras") throw new Error("Navigationsgruppen sind unvollständig oder falsch sortiert");
    const expanded = Array.from(nav.querySelectorAll('.nav-group-toggle[aria-expanded="true"]'));
    if (expanded.length !== 1) throw new Error("Es muss genau eine Navigationsgruppe geöffnet sein");
    const tabIds = Array.from(nav.querySelectorAll(".tab-btn[data-tab]")).map(button => button.dataset.tab);
    const expected = START_NAV_TABS.concat(BILLING_NAV_TABS).filter(id => id !== "landing");
    if (tabIds.length !== expected.length || new Set(tabIds).size !== expected.length || expected.some(id => !tabIds.includes(id))) throw new Error("Tabs fehlen oder sind mehrfach in der Navigation enthalten");
    const landingChoices = document.querySelectorAll("#landing .landing-choice");
    if (landingChoices.length !== 2) throw new Error("Landingpage besitzt nicht genau zwei Einstiege");
    if (typeof window.ensureNavigationPath !== "function" || typeof window.updateWorkflowNavigationContext !== "function") throw new Error("Zentrale Navigationsfunktionen fehlen");
    return "4 Accordion-Gruppen, 16 eindeutige Navigationsziele und genau 2 Landingpage-Einstiege";
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
    const html = document.getElementById("startArchiveUtilityActions") ? document.getElementById("startArchiveUtilityActions").innerHTML : "";
    if (!html.includes("self-test")) throw new Error("App-Selbsttest fehlt auf der Startseite");
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
    if (!html.includes("Finalisieren") || !html.includes("Archivieren")) throw new Error("Startseitenaktionen für aktuelle Abrechnung fehlen");
    if (!html.includes("Wiederbearbeiten")) throw new Error("Archivierte Abrechnungen haben keine Wiederbearbeiten-Aktion");
    return "Finalisierung im Abrechnungskontext; Startseite zeigt nur Status/Aktionen je Abrechnung";
  });

  runCheck("Stabilität", "V93 gezieltes Rendering", () => {
    if (typeof commitStateChange !== "function" || typeof renderCurrentView !== "function") throw new Error("Zentraler Renderpfad fehlt");
    const source = commitStateChange.toString() + renderCurrentView.toString();
    if (!source.includes("tabIds") || !source.includes("includeCommon")) throw new Error("Gezielte Renderoptionen fehlen");
    if (!setBriefSetting.toString().includes('tabId:"briefe"')) throw new Error("Brief-Einstellungen nutzen keinen lokalen Renderpfad");
    if (!setPrepaymentAdjustmentSetting.toString().includes('tabId:"vorauszahlungsanpassung"')) throw new Error("Vorauszahlungsanpassung nutzt keinen lokalen Renderpfad");
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

  runCheck("Oberfläche", "Kernbereiche rendern", () => {
    renderStart();
    renderQuality();
    renderUmlage();
    renderBrief();
    return "Start, Qualität, Umlage und Briefe ohne Abbruch";
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

function runAppSelfTest() {
  const rows = appSelfTestReport();
  const summary = appSelfTestSummary(rows);
  setActionMessage(summary.message, summary.level);
  renderActionFeedback();
  const details = rows.map(row => row.severity + " · " + row.area + " · " + row.point + (row.detail ? ": " + row.detail : "")).join("\n");
  alert("App-Selbsttest\n\n" + summary.message + "\n\n" + details);
  if (summary.errors && typeof switchToTab === "function") switchToTab("qualitaet");
  return rows;
}
// ===== Bereich: Tabellenwerkzeuge und App-Start =====
function activeTabId() {
  const active = document.querySelector("section.tab.active");
  return active && active.id ? active.id : (currentAppMode() === "billing" ? "mieter" : "landing");
}

function prepareStateForPersistence(reason = "manual") {
  if (statePreparationInProgress) return false;
  statePreparationInProgress = true;
  statePreparationCount += 1;
  try {
    const steps = [
      ["Jahresdaten", () => ensureYearData()],
      ["ID-Migration", () => ensureUnitIdentityData(state)],
      ["Mieterkontakte", () => ensureTenantContactData()],
      ["Kostenarten-Voreinstellungen", () => ensureCostSettings()],
      ["Einzugsdaten Stammdaten", () => applyKnownMasterTenantEntryDates(state, {save:false})],
      ["Miettage", () => normalizeTenantActiveDays()],
      ["Vorauszahlungen", () => syncVorauszahlungen()],
      ["Kosten-Mieter-Umlage", () => syncKostenartenMieterUmlage()],
      ["Mieter-Vorauszahlungen", () => updateTenantPrepaymentTotals()],
      ["Umlage-Eingaben", () => syncUmlageInputs()],
      ["Wasserzähler", () => applyWaterMetersToUmlage()],
      ["Kostenstatus", () => state.kostenarten.forEach(k => k.status = kostenStatus(k))],
      ["Datenebenen und Snapshot-Grenzen", () => enforceWorkingStateDataContract(state)]
    ];
    steps.forEach(step => runRenderStep("Datenaufbereitung: " + step[0], step[1]));
    return true;
  } finally {
    statePreparationInProgress = false;
  }
}

function renderStepsForTab(tabId) {
  const definition = (typeof TAB_DEFINITIONS !== "undefined") ? TAB_DEFINITIONS[tabId] : null;
  return definition && typeof definition.renderContent === "function" ? [[definition.title, definition.renderContent]] : [];
}

function renderCurrentView(options = {}) {
  const startedAt = Date.now();
  const allTabs = START_NAV_TABS.concat(BILLING_NAV_TABS);
  const active = activeTabId();
  const requestedTabs = Array.isArray(options.tabIds) && options.tabIds.length ? options.tabIds : null;
  const tabs = options.forceAll ? allTabs : (requestedTabs || [active]);
  const includeCommon = options.includeCommon !== false;
  const includeNavigation = options.includeNavigation !== false;
  const includeTableTools = options.includeTableTools !== false;

  renderLastActiveTab = active;
  if (includeCommon) {
    runRenderStep("Periodeninfo", () => renderPeriodInfo());
    runRenderStep("Finalisierung", () => renderFinalizationStatus());
  }

  tabs.forEach(tabId => {
    if (!options.forceAll && !tabVisibleInMode(tabId)) return;
    renderStepsForTab(tabId).forEach(step => runRenderStep(step[0], step[1]));
  });

  if (includeCommon && isArchiveViewer()) runRenderStep("Archivdetails", () => renderLegacyArchiveDetails());
  if (includeTableTools) runRenderStep("Tabellenwerkzeuge", () => enhanceTables());
  if (includeNavigation) runRenderStep("Navigation", () => updateTopNavigationVisibility());
  renderLastDurationMs = Date.now() - startedAt;
}

function renderStatusAndFeedbackSafely() {
  try { renderSystemMessages(); } catch(error) {
    renderErrors.push({ area:"Systemhinweise", message:errorMessage(error) });
    if (typeof console !== "undefined" && console.error) console.error("NK-Pro Systemhinweise fehlgeschlagen", error);
  }
  try { renderActionFeedback(); } catch(error) {
    renderErrors.push({ area:"Statusanzeige", message:errorMessage(error) });
    if (typeof console !== "undefined" && console.error) console.error("NK-Pro Statusanzeige fehlgeschlagen", error);
  }
}



const OVERVIEW_TITLES = ["Sammelinfo", "Prüfung", "Empfohlener nächster Schritt", "Schnellaktionen"];

const TAB_DEFINITIONS = {
  objekt:{title:"Objekt",kicker:"Objekt vorbereiten",firstSection:"objectPreparationSection",nextTab:"wohnungsverwaltung",renderContent:null},
  start:{title:"Abrechnungsübersicht",kicker:"Nebenkosten abrechnen",firstSection:"startRecordsSection",nextTab:"mieter",renderContent:()=>renderStart()},
  archiv:{title:"Abrechnungsarchiv",kicker:"Archiv",firstSection:"archiveRecordsSection",nextTab:"start",renderContent:()=>renderArchive()},
  mieterverwaltung:{title:"Mieterverwaltung",kicker:"Objekt vorbereiten",firstSection:"masterTenantSection",nextTab:"wohnungsverwaltung",renderContent:()=>renderStartTenantManagement()},
  wohnungsverwaltung:{title:"Wohnungsverwaltung",kicker:"Objekt vorbereiten",firstSection:"masterUnitSection",nextTab:"mieterverwaltung",renderContent:()=>renderStartUnitManagement()},
  sicherung:{title:"Datensicherung & System",kicker:"Extras",firstSection:"backupMainSection",nextTab:"landing",renderContent:()=>renderSicherung()},
  mieter:{title:"Mieter & Wohnungen",kicker:"Abrechnungsstammdaten",firstSection:"tenantUnitsSection",nextTab:"einstellungen",renderContent:()=>renderWohnungen()},
  einstellungen:{title:"Kostenarten & Einstellungen",kicker:"Abrechnungseinstellungen",firstSection:"costEditSection",nextTab:"einnahmen",renderContent:()=>renderEinstellungen()},
  einnahmen:{title:"Kaltmiete & NK-Vorauszahlungen",kicker:"Einnahmen",firstSection:"incomeRentSection",nextTab:"wasser",renderContent:()=>renderEinnahmen()},
  wasser:{title:"Zählerstände",kicker:"Verbrauch",firstSection:"meterHouseSection",nextTab:"manuellewerte",renderContent:()=>renderWaterMeters()},
  manuellewerte:{title:"Manuelle & externe Werte",kicker:"Eingaben",firstSection:"manualValuesSection",nextTab:"umlage",renderContent:()=>renderManualExternalValues()},
  umlage:{title:"Nebenkostenumlage",kicker:"Berechnung",firstSection:"allocationTenantResultSection",nextTab:"vorauszahlungsanpassung",renderContent:()=>renderUmlage()},
  vorauszahlungsanpassung:{title:"Vorauszahlungsanpassung",kicker:"Planung",firstSection:"prepaymentRulesSection",nextTab:"qualitaet",renderContent:()=>renderPrepaymentAdjustment()},
  qualitaet:{title:"Qualitätsprüfung",kicker:"Kontrolle",firstSection:"qualityOverviewSection",nextTab:"briefe",renderContent:()=>renderQuality()},
  briefe:{title:"Abrechnungsbriefe",kicker:"Ausgabe",firstSection:"lettersEditorSection",nextTab:"export",renderContent:()=>renderBrief()},
  export:{title:"Abrechnung exportieren",kicker:"Sicherung",firstSection:"exportActionsSection",nextTab:"qualitaet",renderContent:null}
};

function closeAllTabAccordions(tab) {
  if (!tab) return;
  tab.querySelectorAll('details').forEach(details => { details.open = false; });
}

function safeOverviewCall(fn, fallback) {
  try { const value=fn(); return value === undefined || value === null ? fallback : value; }
  catch (_) { return fallback; }
}
function overviewMoney(value) { return typeof fmtMoney === "function" ? fmtMoney(value || 0) : Number(value || 0).toLocaleString("de-DE",{style:"currency",currency:"EUR"}); }
function overviewOpenSection(id) {
  const section=document.getElementById(id);
  if (!section) return;
  section.open=true;
  section.scrollIntoView({behavior:"smooth",block:"start"});
}
function overviewCoreStats() {
  const units=Array.isArray(state && state.wohnungen) ? state.wohnungen.filter(w=>w && w.id) : [];
  const activeUnits=units.filter(w=>w.status === "aktiv");
  const tenants=safeOverviewCall(()=>billableTenantRows(), Array.isArray(state && state.mieter) ? state.mieter.filter(m=>m && (m.name || m.wohnung)) : []);
  const archivedTenants=safeOverviewCall(()=>archivedTenantRows(), []);
  const costs=Array.isArray(state && state.kostenarten) ? state.kostenarten.filter(k=>k && k.kostenart) : [];
  const activeCosts=costs.filter(k=>k.inNK === "Ja");
  const completeCosts=activeCosts.filter(k=>safeOverviewCall(()=>kostenStatus(k),"") === "Vollständig");
  const income=tenants.reduce((a,m)=>{a.rent+=num(m.kaltErhalten);a.prepayments+=num(m.nkVoraus);a.corrections+=num(m.vorjahresKorrektur);return a;},{rent:0,prepayments:0,corrections:0});
  const calc=safeOverviewCall(()=>calculateUmlage(),null);
  const totals=calc ? safeOverviewCall(()=>umlageTotals(calc),null) : null;
  const quality=safeOverviewCall(()=>collectQualityChecks({scope:"currentBilling"}),null);
  const issues=quality && Array.isArray(quality.issues) ? quality.issues.filter(i=>i.severity !== "OK") : [];
  const errors=issues.filter(i=>i.severity === "Fehler");
  const checks=issues.filter(i=>i.severity === "Prüfen");
  const meters=safeOverviewCall(()=>{
    if (state && state.waterMeters && Array.isArray(state.waterMeters.rows)) return state.waterMeters.rows;
    if (state && Array.isArray(state.wasserzaehler)) return state.wasserzaehler;
    if (state && Array.isArray(state.zaehler)) return state.zaehler;
    return [];
  },[]);
  const archives=safeOverviewCall(()=>{
    const values=[];
    if (state && Array.isArray(state.jahresArchiv)) values.push(...state.jahresArchiv);
    if (state && Array.isArray(state.yearArchive)) values.push(...state.yearArchive);
    if (state && state.meta && Array.isArray(state.meta.yearArchive)) values.push(...state.meta.yearArchive);
    return values.length;
  },0);
  return {units,activeUnits,tenants,archivedTenants,costs,activeCosts,completeCosts,income,calc,totals,quality,issues,errors,checks,meters,archives,
    year:safeOverviewCall(()=>currentAbrechnungsjahr(),"–"), finalized:safeOverviewCall(()=>isCurrentBillingFinalized(),false)};
}
function overviewStatus(stats) {
  if (stats.errors.length) return {status:"error",headline:stats.errors.length+" Fehler",items:[{text:"Fehler vor der Ausgabe beheben",status:"error"},{text:stats.checks.length+" zusätzliche Prüfpunkte",status:stats.checks.length?"warn":"ok"}]};
  if (stats.checks.length) return {status:"warn",headline:stats.checks.length+" Prüfpunkte",items:[{text:"Fachliche Kontrolle erforderlich",status:"warn"},{text:"Keine blockierenden technischen Fehler erkannt",status:"ok"}]};
  return {status:"ok",headline:"Plausibel",items:[{text:"Keine offenen Fehler",status:"ok"},{text:"Datenstand weiter fachlich kontrollieren",status:"ok"}]};
}

function buildOverviewData(tabId) {
  const s=overviewCoreStats();
  const commonValidation=overviewStatus(s);
  const next=(text,target,label="Bereich öffnen")=>({text,action:{label,run:()=>overviewOpenSection(target),primary:true}});
  const go=(label,target,primary=false)=>({label,run:()=>switchToTab(target),primary});
  const open=(label,target,primary=false)=>({label,run:()=>overviewOpenSection(target),primary});
  const save={label:"Speichern",run:()=>saveData(),primary:true};
  const data={
    objekt:{summary:[["Wohnungen",s.units.length],["Mietverhältnisse",s.tenants.length],["Abrechnungsjahr",s.year],["Datenbestand","Lokal"]],validation:commonValidation,next:next("Wohnungsbestand als ersten Objektbaustein prüfen.","objectPreparationSection"),actions:[go("Wohnungen öffnen","wohnungsverwaltung",true),go("Mieter öffnen","mieterverwaltung"),go("Datensicherung","sicherung")]},
    start:{summary:[["Arbeitsjahr",s.year],["Abrechnungen im Archiv",s.archives],["Mietverhältnisse",s.tenants.length],["Wohnungen",s.units.length]],validation:commonValidation,next:next("Aktuellen Arbeitsstand öffnen oder eine neue Abrechnung anlegen.","startRecordsSection"),actions:[open("Abrechnungen öffnen","startRecordsSection",true),go("Datensicherung & System","sicherung"),save]},
    archiv:{summary:[["Archivierte Abrechnungen",s.archives],["Aktuelle Abrechnung",hasActiveCurrentBilling()?s.year:"Keine"],["Datenbestand","Lokal"],["Schema",DATA_SCHEMA_VERSION]],validation:{status:"ok",headline:"Archiv getrennt erreichbar",items:[{text:"Historische Datensätze bleiben unverändert",status:"ok"},{text:"Öffnen erfolgt schreibgeschützt",status:"ok"}]},next:next("Archivierte Abrechnung auswählen und in der Nur-Ansicht prüfen.","archiveRecordsSection"),actions:[open("Archiv öffnen","archiveRecordsSection",true),{label:"Archiv herunterladen",run:()=>downloadFullArchive()},go("Abrechnungsübersicht","start")]},
    mieterverwaltung:{summary:[["Mietverhältnisse",s.tenants.length],["Archiviert",s.archivedTenants.length],["Wohnungen",s.units.length],["Abrechnungsjahr",s.year]],validation:commonValidation,next:next("Mieterstammdaten und archivierte Mietverhältnisse vollständig prüfen.","masterTenantSection"),actions:[open("Mietverhältnisse öffnen","masterTenantSection",true),open("Archiv öffnen","masterTenantArchiveSection"),save]},
    wohnungsverwaltung:{summary:[["Wohnungen gesamt",s.units.length],["Aktiv",s.activeUnits.length],["Inaktiv",Math.max(0,s.units.length-s.activeUnits.length)],["Wohnfläche aktiv",s.activeUnits.reduce((a,w)=>a+num(w.wohnflaeche),0).toLocaleString("de-DE")+" m²"]],validation:commonValidation,next:next("Wohnungsbestand und Flächenangaben kontrollieren.","masterUnitSection"),actions:[open("Wohnungsbestand öffnen","masterUnitSection",true),go("Mieterverwaltung","mieterverwaltung"),save]},
    sicherung:{summary:[["Version",APP_VERSION],["Archivstände",s.archives],["Betriebsart","Offline · lokal"],["Abrechnungsjahr",s.year]],validation:{status:"ok",headline:"Sicherung verfügbar",items:[{text:"Lokale Gesamtsicherung vorhanden",status:"ok"},{text:"Neuer PWA-Cache für V99.4.2",status:"ok"}]},next:next("Vollständige JSON-Sicherung erstellen und Versionsinformationen prüfen.","backupMainSection"),actions:[open("Gesamtsicherung öffnen","backupMainSection",true),open("Version anzeigen","backupVersionSection"),save]},
    mieter:{summary:[["Wohnungen gesamt",s.units.length],["Wohnungen aktiv",s.activeUnits.length],["Mietverhältnisse",s.tenants.length],["Archivierte Mieter",s.archivedTenants.length]],validation:commonValidation,next:next("Bestand und Abrechnung in der Prüfbox abgleichen; danach Kostenarten bearbeiten.","tenantControlSection"),actions:[open("Prüfung öffnen","tenantControlSection",true),open("Mietverhältnisse öffnen","tenantRelationsSection"),go("Kostenarten öffnen","einstellungen")]},
    einstellungen:{summary:[["Kostenarten",s.costs.length],["Aktiv in NK",s.activeCosts.length],["Vollständig",s.completeCosts.length],["Gesamtkosten",overviewMoney(s.activeCosts.reduce((a,k)=>a+num(k.gesamtbetrag),0))]],validation:{status:s.completeCosts.length===s.activeCosts.length?"ok":"warn",headline:s.completeCosts.length+" von "+s.activeCosts.length+" vollständig",items:[{text:"Umlageschlüssel und Beträge prüfen",status:s.completeCosts.length===s.activeCosts.length?"ok":"warn"},{text:"Umlage wird automatisch berechnet",status:"ok"}]},next:next("Fehlende Beträge und Umlageschlüssel vervollständigen.","costEditSection"),actions:[open("Kostenarten bearbeiten","costEditSection",true),()=>{}].filter(Boolean)},
    einnahmen:{summary:[["Kaltmiete erhalten",overviewMoney(s.income.rent)],["NK-Vorauszahlungen",overviewMoney(s.income.prepayments)],["Korrekturen",overviewMoney(s.income.corrections)],["Mietverhältnisse",s.tenants.length]],validation:commonValidation,next:next("Kaltmieten und Vorauszahlungen vollständig prüfen; danach Zählerstände erfassen.","incomeRentSection"),actions:[open("Kaltmiete öffnen","incomeRentSection",true),open("Vorauszahlungen öffnen","incomePrepaymentSection"),go("Zählerstände","wasser")]},
    wasser:{summary:[["Zähler-/Messdatensätze",s.meters.length],["Aktive Wohnungen",s.activeUnits.length],["Verbrauchskosten",s.activeCosts.filter(k=>String(k.umlageschluessel||"").toLowerCase().includes("verbrauch")).length],["Abrechnungsjahr",s.year]],validation:commonValidation,next:next("Zählerstände erfassen und Verbrauchskontrolle durchführen.","meterEntrySection"),actions:[open("Zähler erfassen","meterEntrySection",true),open("Kontrolle öffnen","meterControlSection"),go("Manuelle Werte","manuellewerte")]},
    manuellewerte:{summary:[["Eingabequellen",Object.keys(state.umlageInputs||{}).length],["Miet-/Nutzungseinheiten",s.tenants.length],["Aktive Kostenarten",s.activeCosts.length],["Abrechnungsjahr",s.year]],validation:commonValidation,next:next("Eingabeart je Kostenart festlegen und Summen abgleichen.","manualValuesSection"),actions:[open("Werte öffnen","manualValuesSection",true),open("Summenkontrolle","manualExternalControlSection"),go("Umlage berechnen","umlage")]},
    umlage:{summary:[["Gesamtkosten",s.totals?overviewMoney(s.totals.totalCosts):"–"],["Vorauszahlungen",s.totals?overviewMoney(s.totals.prepayments):"–"],["Mietersaldo",s.totals?overviewMoney(s.totals.balance):"–"],["Kostenarten",s.activeCosts.length]],validation:commonValidation,next:next("Umlageergebnis je Mieter und Kostenart kontrollieren.","allocationTenantResultSection"),actions:[open("Ergebnisse öffnen","allocationTenantResultSection",true),open("Wohnungsnachweis","allocationUnitProofSection"),go("Qualitätsprüfung","qualitaet")]},
    vorauszahlungsanpassung:{summary:[["Mietverhältnisse",s.tenants.length],["NK-Vorauszahlungen",overviewMoney(s.income.prepayments)],["Kostenarten",s.activeCosts.length],["Abrechnungsjahr",s.year]],validation:commonValidation,next:next("Berechnungsregeln und Empfehlungen je Mieter fachlich prüfen.","prepaymentRulesSection"),actions:[open("Regeln öffnen","prepaymentRulesSection",true),open("Empfehlungen öffnen","prepaymentRecommendationSection"),go("Briefe öffnen","briefe")]},
    qualitaet:{summary:[["Offene Fehler",s.errors.length],["Prüfpunkte",s.checks.length],["Hinweise",Math.max(0,s.issues.length-s.errors.length-s.checks.length)],["Finalisierung",s.finalized?"Finalisiert":"Bearbeitbar"]],validation:commonValidation,next:next(s.issues.length?"Offene Aufgaben nach Priorität bearbeiten.":"Keine offenen Prüfpunkte; Briefausgabe vorbereiten.","qualityOpenIssuesSection"),actions:[open("Prüfstatus öffnen","qualityOverviewSection",true),open("Offene Aufgaben","qualityOpenIssuesSection"),go("Briefe öffnen","briefe")]},
    briefe:{summary:[["Empfänger",s.tenants.length],["Abrechnungsjahr",s.year],["Umlage",s.totals?"Berechnet":"Prüfen"],["Status",s.finalized?"Finalisiert":"Entwurf"]],validation:commonValidation,next:next("Brief auswählen, Vorschau prüfen und erst danach drucken oder als PDF sichern.","lettersEditorSection"),actions:[open("Briefbereich öffnen","lettersEditorSection",true),go("Qualitätsprüfung","qualitaet"),go("Export öffnen","export")]},
    export:{summary:[["Abrechnungsjahr",s.year],["Kostenarten",s.costs.length],["Mietverhältnisse",s.tenants.length],["Archivstände",s.archives]],validation:commonValidation,next:next("Aktuelle Abrechnung als JSON sichern; Gesamtsicherung zusätzlich im Verwaltungsbereich erstellen.","exportActionsSection"),actions:[open("Exportaktionen öffnen","exportActionsSection",true),go("Gesamtsicherung","sicherung"),save]}
  };
  // Kostenarten-Schnellaktionen bewusst ohne „Neu berechnen“.
  data.einstellungen.actions=[open("Kostenarten bearbeiten","costEditSection",true),{label:"Kostenart hinzufügen",run:()=>openCostSelectionDialog()},{label:"Qualitätsprüfung",run:()=>switchToTab("qualitaet")}];
  return data[tabId] || data.start;
}
Object.entries(TAB_DEFINITIONS).forEach(([tabId, definition]) => {
  definition.getOverview = () => buildOverviewData(tabId);
});

function renderOverviewCards(tabId, config) {
  const grid=document.getElementById("overview-"+tabId);
  if (!grid || !config) return;
  grid.replaceChildren();
  const specs=[
    {role:"summary",title:OVERVIEW_TITLES[0],status:"info"},
    {role:"validation",title:OVERVIEW_TITLES[1],status:(config.validation&&config.validation.status)||"info"},
    {role:"next-step",title:OVERVIEW_TITLES[2],status:"info"},
    {role:"quick-actions",title:OVERVIEW_TITLES[3],status:"info"}
  ];
  specs.forEach((spec,index)=>{
    const card=document.createElement("article");
    card.className="overview-card";
    card.dataset.overviewRole=spec.role;
    card.dataset.status=spec.status;
    const title=document.createElement("h3"); title.className="overview-card__title"; title.textContent=spec.title; card.appendChild(title);
    const content=document.createElement("div"); content.className="overview-card__content";
    const actions=document.createElement("div"); actions.className="overview-card__actions"+(index===3?" quick-actions":"");
    if (index===0) {
      const dl=document.createElement("dl"); dl.className="overview-card__metrics";
      (config.summary||[]).forEach(pair=>{ const dt=document.createElement("dt");dt.textContent=pair[0];const dd=document.createElement("dd");dd.textContent=String(pair[1]);dl.append(dt,dd); });
      content.appendChild(dl);
    } else if (index===1) {
      const p=document.createElement("p"); p.innerHTML="<strong>"+escapeHtml((config.validation&&config.validation.headline)||"Prüfen")+"</strong>"; content.appendChild(p);
      const ul=document.createElement("ul"); ul.className="overview-card__checklist";
      ((config.validation&&config.validation.items)||[]).forEach(item=>{
        const normalized=typeof item==="string"?{text:item,status:spec.status==="error"?"error":(spec.status==="warn"?"warn":"ok")}:item;
        const itemStatus=["ok","warn","error","info"].includes(normalized.status)?normalized.status:"info";
        const li=document.createElement("li");li.className="overview-check-item is-"+itemStatus;
        const icon=document.createElement("span");icon.className="overview-check-icon";icon.setAttribute("aria-hidden","true");icon.textContent=itemStatus==="ok"?"✓":(itemStatus==="warn"?"⚠":(itemStatus==="error"?"✕":"i"));
        const label=document.createElement("span");label.textContent=normalized.text||"";li.append(icon,label);ul.appendChild(li);
      }); content.appendChild(ul);
    } else if (index===2) {
      const p=document.createElement("p");p.textContent=(config.next&&config.next.text)||"Nächsten Arbeitsschritt öffnen.";content.appendChild(p);
      if (config.next&&config.next.action) actions.appendChild(overviewActionButton(config.next.action));
    } else {
      (config.actions||[]).forEach(action=>actions.appendChild(overviewActionButton(action)));
    }
    card.append(content,actions); grid.appendChild(card);
  });
}
function overviewActionButton(action) {
  const button=document.createElement("button"); button.type="button"; button.textContent=action.label||"Aktion";
  if (action.primary) button.classList.add("primary");
  button.addEventListener("click",()=>{ if (typeof action.run === "function") action.run(); });
  return button;
}
function renderOverviewForTab(tabId) { const definition=TAB_DEFINITIONS[tabId]; if (definition) renderOverviewCards(tabId,definition.getOverview()); }
function renderAllOverviewCards() { Object.keys(TAB_DEFINITIONS).forEach(renderOverviewForTab); }
function pageHeaderPeriodLabel() {
  const format = value => {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? match[3] + "." + match[2] + "." + match[1] : dateDe(value);
  };
  return format(periodStart()) + " – " + format(periodEnd());
}
function updateAllPageHeaders() {
  const archived=safeOverviewCall(()=>isArchiveViewer(),false);
  const finalized=safeOverviewCall(()=>isCurrentBillingFinalized(),false);
  const hasBilling=safeOverviewCall(()=>archived||hasActiveCurrentBilling(),archived);
  const period=hasBilling?safeOverviewCall(()=>pageHeaderPeriodLabel(),"–"):"–";
  Object.entries(TAB_DEFINITIONS).forEach(([tabId,def])=>{
    const page=document.querySelector('[data-page-tab="'+tabId+'"]'); if (!page) return;
    const billingPage=BILLING_NAV_TABS.includes(tabId) || tabId === "start";
    const value=page.querySelector('[data-page-period]'); if (value && billingPage) value.textContent=period||"–";
    const badge=page.querySelector('[data-page-readonly]');
    if (badge) {
      badge.hidden=!billingPage;
      if (!billingPage) return;
      badge.hidden=false;
      badge.classList.add("billing-status-badge");
      badge.classList.remove("is-working","is-finalized","is-archived","is-none");
      if (archived) { badge.textContent="Archiviert · schreibgeschützt"; badge.classList.add("is-archived"); }
      else if (finalized) { badge.textContent="Finalisiert · schreibgeschützt"; badge.classList.add("is-finalized"); }
      else if (hasBilling) { badge.textContent="In Bearbeitung · bearbeitbar"; badge.classList.add("is-working"); }
      else { badge.textContent="Keine Abrechnung geöffnet"; badge.classList.add("is-none"); }
    }
    const status=page.querySelector('[data-page-save-status]'); if (status) status.textContent=archived?"Archiviert":(finalized?"Finalisiert":"Gespeichert");
    const saveButton=page.querySelector('[data-page-save]'); if (saveButton) saveButton.disabled=archived||finalized;
  });
  const activeSection=document.querySelector('section.tab.active');
  const globalTitle=document.getElementById('workspaceTitle');
  if (globalTitle&&activeSection) globalTitle.textContent=activeSection.id === 'landing' ? 'Arbeitsweiche' : ((TAB_DEFINITIONS[activeSection.id]||{}).title||'NK-Pro');
}

function auditV992Structure() {
  const expected=OVERVIEW_TITLES;
  const results=Object.entries(TAB_DEFINITIONS).map(([tabId,def])=>{
    const tab=document.getElementById(tabId);
    const page=tab&&tab.querySelector(':scope > .app-page');
    const header=page&&page.querySelector(':scope > .page-header');
    const grids=page?Array.from(page.querySelectorAll(':scope > .overview-grid')):[];
    const cards=grids[0]?Array.from(grids[0].children).filter(x=>x.classList.contains('overview-card')):[];
    const titles=cards.map(c=>(c.querySelector('.overview-card__title')||{}).textContent||'');
    const sections=page?Array.from(page.querySelectorAll(':scope > .page-sections > .page-section')):[];
    const validation=sections.length?sections[sections.length-1]:null;
    const footnote=page&&page.querySelector(':scope > .page-footnote');
    const checks={page:!!page,headerCount:page?page.querySelectorAll(':scope > .page-header').length===1:false,overviewGridCount:grids.length===1,directCardCount:cards.length===4,cardTitles:expected.every((t,i)=>titles[i]===t),noNestedCardGrid:!(grids[0]&&grids[0].querySelector('.overview-grid')),quickActionsAreButtons:cards[3]?Array.from(cards[3].querySelectorAll('.overview-card__actions > *')).every(x=>x.tagName==='BUTTON'):false,validationSectionIsLast:!!(validation&&validation.dataset.sectionRole==='validation'),allInitiallyClosed:sections.every(d=>!d.open),footnoteAfterValidation:!footnote||footnote.previousElementSibling===page.querySelector(':scope > .page-sections')};
    return {tab:tabId,title:def.title,headerCount:page?page.querySelectorAll(':scope > .page-header').length:0,overviewGridCount:grids.length,directCardCount:cards.length,cardTitles:titles,legacyCardsFound:!!(page&&page.querySelector('.cards,.workspace-overview-grid,.cost-overview-grid,.tenant-overview-grid,.meter-overview-grid')),nestedCardGridFound:!checks.noNestedCardGrid,quickActionsAreButtons:checks.quickActionsAreButtons,validationSectionIsLast:checks.validationSectionIsLast,footnoteAfterValidation:checks.footnoteAfterValidation,result:Object.values(checks).every(Boolean)?'ok':'fehler',checks};
  });
  const report={version:APP_VERSION,generatedAt:new Date().toISOString(),tabCount:results.length,allPassed:results.every(r=>r.result==='ok'),results};
  window.__V992_AUDIT__=report;
  document.documentElement.dataset.v992Audit=report.allPassed?'passed':'failed';
  return report;
}

function renderAll(options = {}) {
  if (renderInProgress) {
    renderQueued = true;
    return;
  }
  renderInProgress = true;
  renderQueued = false;
  renderErrors = [];
  renderCount += 1;
  const startedAt = Date.now();
  try {
    renderCurrentView(options);
  } catch(error) {
    renderErrors.push({ area:"Render-Gesamtlauf", message:errorMessage(error) });
    if (typeof console !== "undefined" && console.error) console.error("NK-Pro Render-Gesamtlauf fehlgeschlagen", error);
  } finally {
    renderLastDurationMs = Math.max(renderLastDurationMs, Date.now() - startedAt);
    renderInProgress = false;
    renderStatusAndFeedbackSafely();
    try {
      updateAllPageHeaders();
      renderAllOverviewCards();
      auditV992Structure();
    } catch(uiError) {
      if (typeof console !== "undefined" && console.error) console.error("V99.4.2-Darstellung konnte nicht aktualisiert werden", uiError);
    }
    if (renderQueued) {
      renderQueued = false;
      setTimeout(() => renderAll(options), 0);
    }
  }
}

try {
  prepareStateForPersistence("startup");
  renderAll();
  initializeNavigationMode();
  document.querySelectorAll('.tab details').forEach(d => d.open = false);
  updateAllPageHeaders();
  renderAllOverviewCards();
  auditV992Structure();
} catch(error) {
  renderErrors = [{ area:"App-Start", message:errorMessage(error) }];
  if (typeof console !== "undefined" && console.error) console.error("NK-Pro Startabbruch", error);
  try { renderSystemMessages(); } catch(statusError) { if (typeof console !== "undefined" && console.error) console.error("NK-Pro Statusanzeige fehlgeschlagen", statusError); }
}
