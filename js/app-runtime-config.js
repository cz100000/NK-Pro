"use strict";

// AP12: Konfiguration, Modulregister und anwendungsweite Laufzeitzustände.
const NK_PRO_MODULES = (() => {
  const required = {
    persistence:globalThis.NKProPersistence,
    migration:globalThis.NKProMigration,
    archive:globalThis.NKProArchive,
    backupRecovery:globalThis.NKProBackupRecovery,
    meterMaster:globalThis.NKProMeterMaster,
    meterReadings:globalThis.NKProMeterReadings,
    meterPeriods:globalThis.NKProMeterPeriods,
    meterValidation:globalThis.NKProMeterValidation,
    objectStandard:globalThis.NKProObjectStandard,
    billingSnapshot:globalThis.NKProBillingSnapshot,
    billingCalculation:globalThis.NKProBillingCalculation,
    documentData:globalThis.NKProDocumentData,
    documentRenderer:globalThis.NKProDocumentRenderer,
    exportService:globalThis.NKProExportService,
    uiTableTools:globalThis.NKProUiTableTools,
    uiDesignSystem:globalThis.NKProUIDesignSystem,
    appBootstrap:globalThis.NKProAppBootstrap,
    compatibility:globalThis.NKProCompatibility,
    uiPreferences:globalThis.NKProUiPreferences,
    billingContext:globalThis.NKProBillingContext,
    stateAccess:globalThis.NKProStateAccess,
    applicationActions:globalThis.NKProApplicationActions,
    masterDataActions:globalThis.NKProMasterDataActions,
    costActions:globalThis.NKProCostActions,
    billingWorkflow:globalThis.NKProBillingWorkflow,
    archiveActions:globalThis.NKProArchiveActions,
    yearTransitionActions:globalThis.NKProYearTransitionActions,
    qualityRules:globalThis.NKProQualityRules,
    qualityAssurance:globalThis.NKProQualityAssurance,
    diagnostics:globalThis.NKProDiagnostics,
    uiController:globalThis.NKProUiController,
    uiBindings:globalThis.NKProUiBindings,
    uiEvents:globalThis.NKProUiEvents,
    navigation:globalThis.NKProNavigation,
    modalEvents:globalThis.NKProModalEvents,
    runtimeDiagnostics:globalThis.NKProRuntimeDiagnostics
  };
  const missing = Object.entries(required).filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error("NK-Pro-Modulladereihenfolge unvollständig: " + missing.join(", "));
  return Object.freeze(required);
})();

// ===== Bereich: Ausgangsdaten und App-Konfiguration =====
const UMLAGE_MANUAL = "Manuelle Eingabe je Mieter/Wohneinheit";
const UMLAGE_MANUAL_LEGACY = "Einzel" + "beträge je Mieter";
const APP_VERSION = "V99.4.37";
const APP_VERSION_NAME = "AP22F2B-Objektuebersicht";
const APP_RELEASE_DATE = "2026-07-17";
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
  "prepaymentAdjustmentSettings",
  "objektStandard",
  "zaehlerDaten"
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
  "lastMigrationTransaction",
  "restoreCheckpointCreatedAt",
  "restoreCheckpointBackupId",
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
  "V99.4.37 migriert die Objektübersicht auf eine kompakte Objektidentität, einen Gesamtstatus für Objektdaten, Wohnungen und Mietverhältnisse, genau eine nächste Aktion und vier Aufgaben-/Statuskarten; Kostenarten- und Doppelanzeigen entfallen, der Zähler bleibt eindeutig als DUMMY gekennzeichnet.",
  "V99.4.36 blendet geschlossene native Dialoge trotz zentralem Flex-Layout zuverlässig aus und speist die sichtbare Navigationsversion aus der zentralen Laufzeitkonstante; Dialoginteraktion, Navigation und Fachlogik bleiben unverändert.",
  "V99.4.35 entfernt statische Speicherbehauptungen und lokale Metablöcke aus zentralen Seitenköpfen, reduziert allgemeine Kopf-Speicheraktionen auf fachlich passende Datenseiten und belässt auf Individuelle Werte genau einen führenden Speicherweg; Fachlogik, Persistenz und Dokumentausgabe bleiben unverändert.",
  "V99.4.34 führt das globale Schalenfundament mit zentraler Seitenschale, eindeutigen H1-Seitenköpfen und einer Abrechnungskontextleiste ohne Modusangabe ein; Navigation, Fachlogik und Dokumentausgabe bleiben unverändert.",
  "V99.4.32 vereinheitlicht fünf produktive Dialoge und zentrale Inhaltszustände einschließlich Fokusführung, Fokusfalle, Fokusrückgabe, Escape-/Hintergrundregeln und geschützter destruktiver Aktionen; Fachlogik und Dokumentausgabe bleiben unverändert.",
  "V99.4.31 migriert produktive Tabellen, Listen und tabellenbezogene Werkzeugleisten auf die zentrale nk-ui-Bibliothek; Druck- und Briefdarstellungen bleiben ausdrücklich unverändert.",
  "V99.4.30 migriert Buttons, Formularfelder, Karten, Klappboxen, Status und Hinweise kontrolliert auf die zentrale nk-ui-Bibliothek; dynamisch erzeugte Inhalte werden über eine rein darstellungsbezogene Upgrade-Schnittstelle nachgeführt.",
  "V99.4.23 Korrekturstand 3 erzwingt die Aktualisierung der Zähler-UI-Assets über versionsgebundene URLs und einen cachefreien Service-Worker-Updatepfad; ein neuer Worker wird einmalig aktiviert und die App danach automatisch neu geladen.",
  "Ein zuvor falsch gespeicherter Zählerwert kann durch erneute Eingabe mit Dezimalkomma oder Dezimalpunkt sofort sichtbar und per Enter dauerhaft korrigiert werden.",
  "V99.4.19 führt das freigegebene AP16-Kachelsystem mit lokalen Linien-Icons, fachlichen Akzentfarben, klarerer Seitenhierarchie, geöffneten Primärbereichen und bereinigtem globalen Kopf ein.",
  "Der Service Worker entfernt ausschließlich veraltete NK-Pro-Caches, speichert nur erfolgreiche Same-Origin-Antworten und liefert die App-Shell im Offlinebetrieb ressourcengerecht aus.",
  "V99.4.17 setzt AP14 mit Segoe UI, einem appweiten Blau-/Grausystem, modernisiertem Kopfbereich sowie der fachlichen Trennung von Zählerinventar und Verbrauchserfassung um.",
  "Projekt vorbereiten → Zähler ist ein klar gekennzeichneter, nicht persistenter Clickdummy; die produktive Erfassung liegt vollständig unter Nebenkosten abrechnen → Individuelle Werte.",
  "V99.4.17 beachtet den Schalter für die Vorauszahlungsanpassung verbindlich und kennzeichnet zweiseitige Briefe auf Seite 1 mit einem Fortsetzungshinweis.",
  "Ein gemeinsamer Schwarzweißmodus gilt identisch für Vorschau, PDF und Druck; die Briefvorschau bleibt auf breiten Ansichten beim Scrollen sichtbar.",
  "Die Navigation erhält oberhalb der Objektverwaltung den Hauptpunkt Start mit Home-Icon und dezenter Trennlinie zur Arbeitsnavigation.",
  "V99.4.17 verfeinert AP13 mit grünem Guthabenzustand, optimierten Spaltenbreiten, zentrierten Brief- und Tabelleninhalten sowie korrigierten Guthaben- und Vorauszahlungstexten.",
  "Seite 2 beginnt unterhalb des Informationsblocks, verzichtet auf den technischen Einleitungstext und führt Zahlungshinweis sowie Abschlussabstände konsistent fort.",
  "V99.4.14 setzt AP13 mit einem gemeinsamen DIN-A4-Dokumentmodell für Vorschau, Druckfenster und PDF-Ausgabe um.",
  "Die neunspaltige Haupttabelle enthält Vorauszahlungen und vollständige Trennlinien; Seite 2 entsteht ausschließlich für Zusatzhinweise und/oder eine Vorauszahlungsanpassung.",
  "Briefkopf, Informationsblock, Ergebnisleiste, Hinweis- und Zahlungstext, Abschlussblock, Anlagenhinweis und dynamische Seitenzahlen folgen den finalen AP13-Referenzmustern.",
  "V99.4.13 reduziert app.js auf Start, Verdrahtung und zentrale Orchestrierung und trennt die bisherigen Laufzeitbereiche in klar benannte Zustands-, UI-, Browser- und Seitenmodule.",
  "Ein gekapseltes Laufzeitdiagnosemodul ersetzt vier einzelne window-Testbindungen; Zustandsersetzungen laufen über eine zentrale Eigentümerfunktion und Renderer führen keine vorbereitenden Datenmutationen mehr aus.",
  "V99.4.12 setzt die produktive Navigation nach dem verbindlichen Referenzbild mit lokalen SVG-Icons, Design-Tokens, responsivem Verhalten und barrierearmen Zuständen neu um.",
  "Alle 16 bestehenden Navigationsziele und 99 Aktionskennungen bleiben erhalten; der allgemeine Menüpunkt Einstellungen ist als zugänglicher Dummy mit dem Hinweis Noch nicht verfügbar umgesetzt.",
  "V99.4.11 extrahiert Archiv-, Jahreswechsel-, Qualitäts- und Diagnoseorchestrierung physisch aus app.js in vier verantwortete Module.",
  "Archiv- und Jahreswechselaktionen laufen atomar über NKProStateAccess; Qualitäts- und Diagnoseprüfungen bleiben ohne Commit, Persistenz und Rendering.",
  "V99.4.10 extrahiert Stammdaten-, Kosten- und Abrechnungsorchestrierung physisch aus app.js in drei kontrollierte Anwendungsmodule.",
  "UI-Aktionen rufen die neuen Module direkt auf; Zustandsänderungen laufen atomar über NKProStateAccess und den zentralen Commitpfad.",
  "V99.4.9 bindet die bestehende Oberfläche über zentrale Ereignisdelegation und fachlich benannte UI-Controller an die modularisierten Dienste an.",
  "Alle statischen und dynamisch erzeugten Inline-Handler wurden entfernt; Zähler-, Abrechnungs-, Dokument-, Export-, Persistenz- und Recovery-Aktionen laufen über definierte Controllerpfade.",
  "Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandard 1 und Abrechnungssnapshot 2 bleiben unverändert.",
  "V99.4.7 trennt zentrale Abrechnungsberechnung, Dokumentdaten, Brief-HTML, Exporttechnik, Tabellenhilfen und Startorchestrierung über feste Modulschnittstellen.",
  "app.js wurde von 10.248 auf rund 9.000 Zeilen reduziert; bestehende globale Aufrufe bleiben ausschließlich als dokumentierte Einzeilen-Weiterleitungen erhalten.",
  "Direkte Browser-Speicherzugriffe liegen nur noch in Persistenz und getrennten UI-Einstellungen; Datenschema 5, Datenebenenvertrag 1 und alle Berechnungsergebnisse bleiben unverändert.",
  "V99.4.6 trennt dauerhafte Zählerstammdaten, unveränderlich nachvollziehbare Messwerte, Messperioden, zeitabhängige Zuordnungen und Zählerwechsel in vier Fachmodule.",
  "Verbrauchsberechnung und Abrechnungssnapshot verwenden Zählerstandard 1; Stromzähler-Dummys bleiben vollständig gespeichert und zentral aus allen Abrechnungswerten ausgeschlossen.",
  "Bestehende V99.4.5-Zählerdaten werden nach Vor-Migrationssicherung idempotent und verlustfrei in getrennte Strukturen überführt; Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert.",
  "V99.4.5 führt Objektstandard 1 als additive, verlustfreie Projektion über den bestehenden Wohnungen-, Mieter-, Kostenarten-, Vorauszahlungs- und Zählerbestand ein.",
  "Neue Abrechnungssnapshots besitzen eine eindeutige Snapshot-ID, unveränderliche Metadaten, Objekt- und Periodenbezug, vollständige Berechnungsgrundlagen sowie eine prüfbare Integritätschecksumme.",
  "Eine zentrale Abrechnungsbereitschaftsprüfung verhindert Snapshots bei kritischen Objekt-, Vertrags-, Verteilerschlüssel-, Vorauszahlungs- oder Zählerfehlern.",
  "Stromzähler-Dummys werden im Objekt- und Zählerbestand gespeichert, aber durch Typ, Abrechnungsrelevanz und Snapshot-Zählerauswahl vollständig aus der Abrechnung ausgeschlossen.",
  "V99.4.4 führt eine zentrale Registry für die unterstützten Migrationspfade 1→2, 2→4, 3→4 und 4→5 ein.",
  "Schemaänderungen laufen transaktional auf einer Datenkopie mit Vor- und Nachvalidierung; bei Fehlern bleibt der Ausgangsdatensatz unverändert.",
  "Vor notwendigen Migrationen wird eine eindeutig identifizierte, prüfsummengeschützte Sicherungshülle im getrennten Speicherbereich erzeugt und für externen Download bereitgestellt.",
  "Restore und Rücknahme eines Restore-Vorgangs verwenden validierte Sicherungshüllen und einen getrennten Wiederherstellungs-Checkpoint; Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert.",
  "V99.4.3 gliedert Persistenz und Integrität, Schemamigration sowie Archiv- und Snapshot-Projektion in drei eigenständige JavaScript-Module aus.",
  "Eine kleine Kompatibilitätsschicht in app.js erhält die bestehenden globalen Aufrufe; Datenschema 5, Datenebenenvertrag 1 und alle Austauschformate bleiben unverändert.",
  "Die produktive Skriptreihenfolge und der PWA-App-Shell sichern die Module vor default-seed.js und app.js eindeutig ab; direkte Browser-Speicherzugriffe liegen nur noch im Persistenzmodul.",
  "Fachberechnung, Referenzfälle, Snapshot-Grenzen, Archive, Backups, Recovery und Oberfläche bleiben funktional unverändert.",
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
const STORAGE_PRE_MIGRATION_BACKUP_KEY = STORAGE_KEY + "_pre_migration_backup";
const STORAGE_RESTORE_CHECKPOINT_KEY = STORAGE_KEY + "_restore_checkpoint";
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

let state = null;
let archiveReturnState = null;
const START_NAV_TABS = ["landing","objektuebersicht","objekt","mieterverwaltung","wohnungsverwaltung","wasser","start","archiv","sicherung"];
const BILLING_NAV_TABS = ["mieter","einnahmen","einstellungen","manuellewerte","umlage","qualitaet","vorauszahlungsanpassung","briefe","export"];
let appUiMode = ARCHIVE_VIEW_MODE ? "billing" : "start";
let billingContextOpen = false;
let navigationInitialized = false;

