# Changelog

## V99.4.4 – Migrations-, Sicherungs-, Restore- und Rollback-Fundament – 2026-07-12

- Eingefrorene zentrale Migrationsregistry für `1→2`, `2→4`, `3→4` und `4→5` eingeführt.
- Migrationen auf isolierten Kopien mit Vor-, Schritt- und Nachvalidierung transaktional ausgeführt; fehlgeschlagene Schritte hinterlassen keine Teiländerung.
- `js/backup-recovery.js` für eindeutig identifizierte, prüfsummengeschützte Sicherungshüllen, Validierung und Restore ergänzt.
- Vor erforderlichen Start- und Importmigrationen wird ein unveränderter Ausgangsstand unter einem getrennten Vor-Migrationsschlüssel gesichert.
- Vor-Migrationssicherung kann im bestehenden Sicherungsbereich heruntergeladen und über den vorhandenen JSON-Import wiederhergestellt werden.
- Restore erzeugt vorher einen getrennten Checkpoint; der letzte Restore kann kontrolliert zurückgenommen werden.
- Externe Sicherungshüllen werden vor dem Import vollständig validiert und bei Bedarf über die Registry auf Schema 5 migriert.
- Archiv-JSON-Import prüft und sammelt Datensätze vor der Bestätigung, ohne den Produktivzustand vorzeitig zu verändern.
- App-, Paket-, Manifest-, Dokumentations- und PWA-Cacheversion auf V99.4.4 aktualisiert.
- JavaScript-Syntax 10/10, Referenzfälle 6/6, Releaseprüfung und Playwright/Chromium 28/28 bestanden.
- Datenschema 5, Datenebenenvertrag 1, Snapshot-Grenzen, bestehende Datenformate, Fachberechnung und allgemeine Oberfläche unverändert.

## V99.4.3 – Modularisierung von Persistenz, Migration und Archiv – 2026-07-12

- `js/persistence.js` für Prüfsumme, Integritätsmetadaten, Speicheradapter, Speicherdiagnostik und sämtliche direkten `localStorage`-Zugriffe eingeführt.
- `js/migration.js` für Datenschemaermittlung, idempotente Migrationshistorie, Migration bis Schema 5 und Übernahme vorbelegter Altarchive eingeführt.
- `js/archive.js` für Snapshot-Metafilterung, begrenzte Abrechnungsprojektion, Archivhüllen-Normalisierung und Durchsetzung des Datenebenenvertrags eingeführt.
- Kleine Kompatibilitätsschicht in `js/app.js` erhält die bestehenden globalen Funktionsnamen und delegiert an die neuen Module.
- Direkte Browser-Speicherzugriffe aus `js/app.js` entfernt; UI- und Fachorchestrierung bleibt dort erhalten.
- Verbindliche Skriptreihenfolge in `index.html` und vollständigen Modul-App-Shell im Service Worker abgesichert.
- Releaseprüfung um Modulschnittstellen, Speicherzugriffsgrenzen, Skriptreihenfolge und App-Shell erweitert.
- Browsertest für Modulreihenfolge, eingefrorene Namespaces und globale Kompatibilität ergänzt.
- JavaScript-Syntax 9/9, Referenzfälle 6/6 und Playwright/Chromium 22/22 bestanden.
- Datenschema 5, Datenebenenvertrag 1, Snapshot-Grenzen, Fachberechnung, Oberfläche, Archive, Backups, Recovery und Austauschformate unverändert.
- App-, Paket-, Manifest-, Test- und PWA-Cacheversion auf V99.4.3 aktualisiert.

## V99.4.2 – Verbindliche Datenebenen und Snapshot-Grenzen – 2026-07-12

- Datenebenenvertrag 1 für aktuellen Arbeitsstand, Objektstammdaten, globale Historie, Abrechnungssnapshot, Jahresarchiv, Gesamtbackup und Recovery eingeführt.
- Abrechnungs- und Archivsnapshots auf eine explizite erlaubte Feldmenge begrenzt.
- Verschachtelte `jahresArchiv`-Kopien, `stammdaten`, `waterMeterHistory` und technische Speicher-, Backup-, Recovery- und Viewer-Metadaten aus Snapshots ausgeschlossen.
- Bestehende Archivstände werden beim Laden und vor dem Speichern idempotent normalisiert und begrenzt.
- Fehlende globale Zählerhistorie kann vor der Begrenzung einmalig aus einem vorhandenen Altarchiv in den Arbeitsstand übernommen werden.
- Archivansichten ergänzen Objektstammdaten und globale Historie nur zur Laufzeit.
- Wiederbearbeitung eines Archivstands erhält aktuelle Stammdaten, globale Historie, operative Backup-Metadaten und das vollständige Jahresarchiv.
- Gesamtbackup enthält alle fachlichen Datenebenen, aber keinen Recovery-Stand; Abrechnungs-JSON enthält nur den begrenzten Abrechnungsstand.
- Recovery bleibt als ein separater, integritätsgeschützter vorheriger Arbeitsstand ohne Recovery-Kette erhalten.
- Neue Browserregressionen für Snapshot-Grenzen, idempotente Altarchivmigration, Recovery, Gesamtbackup, Abrechnungs-JSON und Wiederbearbeitung ergänzt.
- Bestehende Startabhängigkeit in `js/default-seed.js` beseitigt: der vor `app.js` geladene SEED verwendet den fachlich identischen Literalwert statt der erst später definierten Konstante.
- App-, Paket-, Manifest-, Test- und PWA-Cacheversion auf V99.4.2 aktualisiert.
- Datenschema 5, Fachberechnung, sechs Referenzfälle und allgemeine Oberfläche unverändert.

## V99.4.1 – ChatGPT-Arbeitsbasis und Testdatenstruktur – 2026-07-12

### Geändert

- großen SEED unverändert aus `js/app.js` nach `js/default-seed.js` ausgelagert,
- sechs vollständige Referenzdatenkopien durch eine Basis und fünf Patches ersetzt,
- semantische SHA-256-Prüfung und Materialisierung der Referenzfälle ergänzt,
- historische Prüfberichte und überholte Arbeitsdokumente aus der aktiven ZIP ausgelagert,
- kompakter Projektstand, Arbeitsregeln und maschinenlesbare Versionsdatei ergänzt,
- App-, Manifest-, Test- und PWA-Cacheversion auf V99.4.1 aktualisiert.

### Unverändert

- Datenschema 5,
- Fachberechnungen und Ergebnislogik,
- Archive und Migrationen,
- Import- und Exportformate,
- sechs logische Referenzfälle.

# CHANGELOG

## V99.4.0 – UX-Grundgerüst und Arbeitskontext – 2026-07-12

- Landingpage als reine Arbeitsweiche mit genau zwei Einstiegen eingeführt.
- Navigation in die Accordion-Gruppen „Objekt vorbereiten“, „Nebenkosten abrechnen“, „Archiv“ und „Extras“ überführt.
- Bestehende Funktionen und Tabs vollständig weiterverwendet; kein Framework und kein Buildsystem ergänzt.
- Eigenen Objekt-Übersichtsbereich und eigenständige Archivübersicht auf Basis vorhandener Logik ergänzt.
- Bereich „Aktive Abrechnung“ so geändert, dass er nur bei tatsächlich geöffneter Abrechnung sichtbar ist.
- Statusanzeige auf Bearbeitung, Nur Ansicht und Finalisiert vereinheitlicht.
- Rückkehr zur Landingpage über die Markenfläche ergänzt.
- Veralteten Aufruf des entfernten Dashboard-Tabs auf den bestehenden Abrechnungs-Einstieg korrigiert.
- Datenschema 5, Fachlogik, Berechnung, Migrationen, Referenzdaten und Import-/Exportformate unverändert.
- PWA-Version und Cache auf V99.4.0 / `nk-pro-v99-4-0` erhöht.
- Navigations-, Landingpage-, Kontext-, Tastatur- und ARIA-Tests ergänzt.
- JavaScript-Syntax 5/5 und Playwright/Chromium 19/19 erfolgreich.
- Desktop- und Mobilansicht visuell kontrolliert; keine Konsolen- oder Seitenfehler.

## Development Baseline – 2026-07-12 (Dokumentation, App bleibt V99.3.0)

- Vollständige Analyse der tatsächlich bereitgestellten ZIP als alleinige technische Grundlage dokumentiert.
- Verbindliche Development Baseline mit Versions-, Struktur-, Architektur-, Datenmodell-, Navigations-, Migrations-, Test- und Risikoanalyse ergänzt.
- `DEVELOPMENT_GUIDE.md`, `UX_GUIDE.md`, `ARCHITECTURE.md`, `TESTING.md`, `ROADMAP.md`, `TECH_DEBT.md` und `GITHUB_RELEASE_TEMPLATE.md` neu erstellt.
- `README.md`, `WORKBOOK.md` und `CHANGELOG.md` auf die neue Dokumentationshierarchie ausgerichtet.
- Verbindliche Stop-Regel und Entscheidungsprotokoll eingeführt.
- Keine produktive Laufzeitdatei, Fachlogik, Berechnung, Navigation, Migration, PWA oder Testdatei verändert.
- JavaScript-Syntaxprüfung 5/5 und Playwright 15/15 erfolgreich ausgeführt.
- Runtime-Prüfsummen vor und nach der Dokumentationsarbeit verglichen; identisch.
- `SHA256SUMS.txt` für das neue Gesamtpaket aktualisiert.

## V99.3.0 – Navigation und vollständige Qualitätsprüfung

- Tab „Abrechnungsstatus“ dauerhaft entfernt; direkte und indirekte Navigationsverweise bereinigt.
- Navigationsblock „Stammdaten“ oberhalb der Abrechnungsübersicht angeordnet.
- Qualitätsprüfung um eine sichtbare Gesamt-Abdeckung der Abrechnung erweitert.
- K002 Wasserversorgung aus „Manuelle & externe Werte“ entfernt; Quelle bleibt ausschließlich „Zählerstände“.
- Berechnungslogik und Datenschema 5 unverändert.
- Vollständige Syntax-, Konsolen- und Playwright-Regression durchgeführt.

# Änderungsprotokoll

## V99.2.9 – Strukturierung und modulare Dateibasis

- Produktives CSS aus `index.html` nach `assets/app.css` ausgelagert.
- Vier produktive JavaScript-Blöcke in klar benannte Dateien unter `js/` ausgelagert.
- `index.html` von rund 974 KB auf rund 79 KB reduziert, ohne Fachlogik zu entfernen.
- Service-Worker-App-Shell um alle neuen CSS- und JavaScript-Dateien ergänzt.
- Syntaxprüfung auf externe JavaScript-Dateien erweitert.
- Strukturtest ergänzt: keine produktiven Inline-Skripte oder Inline-Styles mehr.
- Fachliche Berechnungslogik, Datenschema 5 und Referenzdaten unverändert.
- Vollständige Chromium-/Playwright-Regression bleibt Freigabebedingung.

# Changelog

## V99.2.8 – Stabilitätsfundament und automatisierte Chromium-Tests

### Reproduzierbare Freigabeprüfung

- Dauerhafte Playwright-/Chromium-Testumgebung mit lokalem Testserver ergänzt.
- JavaScript-Syntaxprüfung für alle Inline-Skripte und den Service Worker ergänzt.
- Browserkonsole, Seitenfehler und fehlgeschlagene Netzwerkanfragen als blockierende Prüfkriterien aufgenommen.
- Navigation, statische Seitenarchitektur, interne Audits, lokale Persistenz, Datenintegrität, Sicherungs-Rundlauf, Migration und PWA-Cache automatisiert abgesichert.
- Referenzdatensätze für Standardfall, Mieterwechsel, Leerstand, Eigentümer M000, alle Eingabequellen und Altdatenmigration ergänzt.
- Reimport eines Exports „nur aktuelle Abrechnung“ gegen unbeabsichtigtes Wiederhinzufügen fest eingebetteter Altarchive abgesichert.
- Testbefehle, Chromium-Auswahl und Freigabekriterien in README und WORKBOOK dokumentiert.

### Unveränderte Fachbasis

- Fachliche Berechnungslogik, Datenschema 5, Navigation und Benutzeroberfläche gegenüber V99.2.7 unverändert übernommen.
- PWA-Cache auf `nk-pro-v99-2-8` erhöht.

## V99.2.7 – Periodenstatus, Eingabestruktur und Briefoptimierung

### Wohnungen und Umlagebasis

- Status aus den zentralen Wohnungsstammdaten entfernt und je Abrechnungsperiode editierbar gemacht.
- Statusübernahme beim Jahreswechsel und Erhalt beim Stammdatenabgleich ergänzt.
- Neue physische Wohnungen starten aktiv.
- Umlage auf alle Wohneinheiten an den vollständigen physischen Bestand gebunden; aktive Umlage an den Periodenstatus.
- Rückwärtskompatible Migration bestehender Daten und unveränderte Archive ergänzt.

### Kostenarten und Eigentümeranteil

- Kostenart und Gruppe in der Haupttabelle schreibgeschützt dargestellt.
- Eigene Kostenart im Auswahlfenster mit kontrollierter Gruppe konfigurierbar gemacht; bestehende freie IDs werden wiederverwendet.
- Fachlogik auf stabile Kosten-IDs/interne Typen umgestellt.
- M000 in Verbrauchs-, Umlage-, Kontroll- und Ergebnisansichten als Eigentümer/Privat ergänzt; aus Miete, Vorauszahlungsanpassung und Briefen ausgeschlossen.

### Manuelle und externe Werte

- Neuen Tab `manuellewerte` unter „2 Einnahmen & Verbräuche“ ergänzt.
- Quellenmodi Zählerstände, Verbrauchsmenge, direkter Eurobetrag und externe Einzelabrechnung ergänzt.
- Doppelberechnung durch eindeutige Quelle je Kostenart verhindert.
- Summenabgleich und Warnung bei Quellenwechsel ergänzt.
- Bestehende `umlageInputs` verlustfrei migriert.
- Quelldatenerfassung aus der Nebenkostenumlage entfernt und durch einen Berechnungsnachweis je Wohnung ersetzt.

### Zählerstände und Historie

- Technischen Einleitungssatz entfernt.
- Zählerdaten bei Sortierung, Stammdatenabgleich und Mieterwechsel über stabile Mieter-/Wohnungs-IDs gesichert.
- Vorjahresendstände als neue Anfangsstände übernommen und neue Endstände geleert.
- Historie dynamisch um archivierte NK-Pro-Jahre erweitert und Quellen ausgewiesen.
- Übernahmestatus sowie fehlende oder auffällige Vorjahreswerte sichtbar gemacht.

### Abrechnungsbrief

- Festes Fensterbrief-Anschriftfeld nach üblichem DIN-5008-Raster ergänzt.
- Einseitige Ausgabe ohne tatsächliche NK-Anpassung optimiert.
- Zweite Seite nur bei aktivierter tatsächlicher Vorauszahlungsänderung ab 0,01 Euro oder echtem Platzmangel ergänzt.
- Grußformel und Unterschrift auf die letzte verwendete Seite gelegt.
- Vorschau- und Drucklayout vereinheitlicht und auf Überlappungen geprüft.

### Technik und Prüfung

- Datenbankschema auf 5 erhöht.
- PWA-Cache auf `nk-pro-v99-2-7` erhöht.
- Navigation um den freigegebenen dritten Unterpunkt in Phase 2 ergänzt; bestehendes V99.2.5-Design beibehalten.
- JavaScript-Syntax, Browser-Rendering, Migration, Berechnung und Drucklogik automatisiert geprüft.

## V99.2.6 – Zähler-, Status- und Umlageoptimierung

### Seitenstatus und Prüfung

- Dynamischen Status im Seitenkopf für Bearbeitung, Finalisierung, Archiv und fehlende Abrechnung ergänzt.
- Fehlerhafte dauerhafte Anzeige „Archiviert · schreibgeschützt“ durch verbindliche Hidden-Regel und zentralen Statusrenderer beseitigt.
- Zeitraumdarstellung auf zweistelliges deutsches Datumsformat vereinheitlicht.
- Prüfungskacheln zentral auf grüne Haken, orange Warnungen und rote Fehlerzeichen umgestellt.

### Zählerstände

- Neue erste Klappbox „Hauszähler und Wasserwerksrechnung“ ergänzt.
- Hauszähler-Anfangs-/Endstand, Ablesedaten, Rechnungsverbrauch und Rechnungsnotiz als getrennte Datenfelder ergänzt.
- Automatische Verbrauchs- und Differenzberechnung zwischen Hauszähler, Wasserwerksrechnung und Wohnungszählern ergänzt.
- Plausibilitätsstatus mit 5-%-Grenze ergänzt.
- Historischen Hausanschluss-Hinweis in die neue erste Klappbox verschoben.
- K002-Verbrauchstabelle um Summenzeile für Kaltwasser, Warmwasser und Gesamtverbrauch erweitert.
- Tabellenfilter im gesamten Zählertab bündig zu den Tabellen ausgerichtet.
- Quellenhinweis zur Excel-Wasseruhrenhistorie unter die Historientabelle verschoben.
- Technischen Fortschreibungshinweis im Normalzustand entfernt; konkrete Warnung nur bei unerwartet vorbelegten Endwerten.
- Sichtbaren Automatikschalter entfernt und Zählerübernahme in Verbrauchskosten dauerhaft aktiviert.
- Feld „Hauswasser laut Wasserversorger“ aus der Prüfbox in die neue Hauszählerbox überführt.

### Nebenkostenumlage und Vorauszahlungen

- Überflüssige Klappbox „Berechnung und Aktionen“ und sichtbare Aktion „Umlage neu berechnen“ entfernt.
- Reset-Aktion in „Verbrauchswerte und manuelle Einzelbeträge“ verschoben.
- Verbleibende Umlage-Klappboxen auf 1 bis 4 neu nummeriert.
- Berechnungsregeln der Vorauszahlungsanpassung in ein kompaktes responsives Zweispaltenraster überführt.
- Doppelte Zwischenüberschrift und überlangen Erklärungstext entfernt.

### Technik

- PWA-Metadaten und Cache auf V99.2.6 erhöht.
- Navigation aus V99.2.5 ohne visuelle oder funktionale Abweichung beibehalten.

## V99.2.5 – Navigation 10 % schmaler

- Breite der freigegebenen Sidebar exakt von 360 px auf 324 px reduziert.
- Mobile Maximalbreite entsprechend von 360 px auf 324 px reduziert.
- Keine sonstigen Änderungen an Gestaltung, Texten, Icons, Abständen, Trennlinien, Navigation oder Fachlogik.
- PWA-Cache auf `nk-pro-v99-2-5` erhöht.

## V99.2.4 – Mock-up-genaue Navigation

### Neu und angepasst

- Linke Navigation exakt nach dem freigegebenen schlichten Zielbild umgesetzt.
- Dunkelblaue Seitenleiste mit NK-PRO-Logo, doppeltem Einklapppfeil, Abrechnungsjahr und grünem Bearbeitungsstatus.
- Feste Bereiche Übersicht, Stammdaten, Abrechnung und System ohne Kartenrahmen oder Baumlinien.
- Symbole, Einzüge, Abstände und Trennlinien entsprechend dem Zielbild vereinheitlicht.
- Vier Workflowphasen als Accordion; immer genau eine Phase geöffnet.
- Aktiven Unterpunkt mit hellblauer Fläche, linkem blauen Balken und blauem Statuspunkt dargestellt.
- Inaktive Unterpunkte mit grauem Statuspunkt und Phasen mit Dokument-Icon dargestellt.
- Sichtbare Navigationsbezeichnungen auf die im Zielbild freigegebenen Kurztexte umgestellt.
- Navigation oben und unten einklappbar; Wiederöffnung über den bestehenden Kopfleisten-Schalter.
- PWA-Cache auf `nk-pro-v99-2-4` erhöht.

### Unverändert

- Technische Tab-IDs und vollständige Tab-Titel.
- Datenmodell sowie Berechnungs-, Umlage-, Vorauszahlungs-, Brief-, Archiv-, Export- und Migrationslogik.

## V99.2.3 – Aufklappbare Workflow-Navigation

### Neu und angepasst

- Linke Navigation als aufklappbare Baumstruktur mit drei Hauptbereichen aufgebaut.
- Abrechnungsworkflow in vier nummerierte Phasen gegliedert.
- Abrechnungsjahr und Bearbeitungs-/Archivstatus direkt im Navigationszweig angezeigt.
- Aktiven Navigationspfad bei direkten und programmgesteuerten Tabwechseln automatisch geöffnet.
- Aufklappzustände lokal gespeichert.
- Abrechnungsnavigation ohne aktive Abrechnung gesperrt und in der Archivansicht auf den relevanten Zweig reduziert.
- Sichtbare Titel auf „Abrechnungsstatus“, „Abrechnung exportieren“ und „Datensicherung & System“ präzisiert.
- PWA-Cache auf `nk-pro-v99-2-3` erhöht.

### Unverändert

- Technische Tab-IDs, Datenmodell und fachliche Renderer.
- Berechnungs-, Umlage-, Vorauszahlungs-, Brief-, Archiv-, Export- und Migrationslogik.

## V99.2.2 – Praxisanpassungen aus dem Abnahmelauf

### Angepasst

- Im Tab „Mieter & Wohnungen“ den Bestandsabgleich in „Prüfung und Plausibilität“ verschoben und die separate erste Klappbox entfernt.
- Verbleibende Klappboxen in „Mieter & Wohnungen“ neu nummeriert und zentrale Schnellaktionen auf die neue Struktur umgestellt.
- Mieter-ID und Mietername ausschließlich in der Tabelle „Umlage pro Mietverhältnis / Wohnung“ größer dargestellt.
- Blauen Einleitungshinweis im Bereich „Kaltmieteinnahmen“ vollständig entfernt.
- Tabellen im Tab „Zählerstände“ horizontal bündig zum Referenztab „Kaltmiete & NK-Vorauszahlungen“ ausgerichtet.
- WORKBOOK um die fachliche Überarbeitung der Vorjahresübernahme und die noch zu entwickelnde Prüfroutine für Kaltmiete und NK-Vorauszahlungen ergänzt.
- PWA-Cache auf `nk-pro-v99-2-2` erhöht.

### Unverändert

- Berechnungs-, Umlage-, Vorauszahlungs-, Brief-, Archiv-, Export- und Datenmigrationslogik.
- Bestehende Platzhalter-Klappbox „Einmalige Korrektur / Gutschrift“ und deren späterer Fachauftrag.

## V99.2.1 – UI-Feinschliff nach Praxistest

### Angepasst

- Blaues Buttondesign der vorherigen Arbeitsoberfläche wiederhergestellt.
- Primäraktionen kräftig blau; Nebenaktionen weiß mit blauer Kontur.
- Verbliebene 1500-px-Maximalbreite aufgehoben und seitlichen Außenabstand reduziert.
- Horizontales Scrollen für breite Tabellen sichtbar und dauerhaft im Tabellenrahmen aktiviert.
- Tabellenzellen standardmäßig einzeilig gehalten, damit breite Datentabellen nicht künstlich in die verfügbare Breite gedrückt werden.
- Ausgewiesene Langtextzellen bleiben umbrechbar.
- PWA-Cache auf `nk-pro-v99-2-1` erhöht.

### Unverändert

- Fachliche Berechnungs-, Umlage-, Vorauszahlungs-, Brief-, Archiv- und Exportlogik.
- Zentrale V99.2-Seiten-, Header-, Kachel- und Klappboxarchitektur.

## V99.2 – Konsolidierte Darstellungsarchitektur für alle Tabs

### Neu und vereinheitlicht

- Zentrale Registrierung aller 14 Tabs über `TAB_DEFINITIONS`.
- Einheitlicher statischer Seitenrahmen je Tab mit globaler Kopfleiste, Tab-Kopf, Vier-Kachel-Zeile, Fachabschnitten und abschließender Prüfbox.
- Ein zentraler Renderer für die vier Übersichtskacheln in der Reihenfolge Sammelinfo, Prüfung, Empfohlener nächster Schritt und Schnellaktionen.
- Einheitlicher dreispaltiger Kopfbereich mit tatsächlichem Abrechnungszeitraum und Speicherstatus.
- Standardbuttons für alle Schnellaktionen.
- Dynamische Kartenhöhe mit einer Mindesthöhe von 184 px; keine feste Maximalhöhe und kein Abschneiden normaler Inhalte.
- Responsive Kachelaufteilung: vier Spalten auf großen Ansichten, zwei Spalten bei mittlerer Breite und eine Spalte auf schmalen Ansichten.
- Statische Klappboxstruktur; alle Bereiche beginnen geschlossen, die letzte Box ist technisch als Prüfung gekennzeichnet.
- Eigene Platzhalter-Klappbox „Einmalige Korrektur / Gutschrift“ im Tab Kaltmiete & NK-Vorauszahlungen, ohne Änderung am Datenmodell.
- Dezente MwSt.-Fußnote am Ende des Tabs Kostenarten & Einstellungen.

### Bereinigt

- Parallele tabbezogene Karten- und Aktionssysteme für Dashboard, Kostenarten, Mieter und Zählerstände entfernt.
- Nachträgliche UI-Upgrade-, Headerkorrektur- und DOM-Verschiebungsfunktionen entfernt.
- Tababhängige Body-Klassen als Steuerung des gemeinsamen Seitenlayouts entfernt.
- Doppelte Hauptüberschriften, alte Perioden-/Statuskarten und verschachtelte Übersichtsgitter entfernt.
- Aktive sichtbare V94-Diagnosebezeichnung neutralisiert.

### Erhalten

- Berechnungs- und Umlagelogik
- Vorauszahlungs- und Saldenlogik
- Datenmodell und Migrationen
- Mieter-, Wohnungs-, Kostenarten- und Zählerdaten
- Briefberechnung und Briefinhalte
- Export-, Archiv- und Sicherungslogik
- Bestehende Korrekturwerte und die Tabellenspalte „Einmalige Korrektur / Gutschrift“

### PWA und Versionierung

- Anwendung, Seitentitel und sichtbare Versionsanzeige auf V99.2 gesetzt.
- Manifestname und Kurzname auf V99.2 aktualisiert.
- Service-Worker-Cache auf `nk-pro-v99-2` gesetzt.
- README, CHANGELOG, WORKBOOK, Architekturbericht und Prüfbericht aktualisiert.

### Prüfungen

- JavaScript-Syntaxprüfung erfolgreich.
- Strukturprüfung aller 14 Tabs erfolgreich.
- Chromium-Rendering bei 1440, 1180, 900 und 520 Pixel Breite ohne Seiten- oder Konsolenfehler.
- Interaktionsprüfung für Tabwechsel, Schnellaktion, nächsten Schritt, Eingabe, Neuberechnung und Speichern erfolgreich.
- Vergleich zentraler fachlicher Ergebnisobjekte zwischen V99.1 und V99.2 im mitgelieferten Arbeitsstand ohne Abweichung.

## Frühere Versionen

Die detaillierte frühere Historie bleibt in der Anwendung und im Versionsverlauf des Repositories erhalten. Dieses Changelog beschreibt die ausgelieferte Konsolidierung V99.2.
