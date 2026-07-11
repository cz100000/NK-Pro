# NK-Pro V99.2.3 – Aufklappbare Workflow-Navigation

NK-Pro ist eine lokal nutzbare HTML-/JavaScript-Anwendung zur Erstellung von Nebenkostenabrechnungen. Die Anwendung kann direkt im Browser oder als GitHub-Pages-PWA betrieben werden; die Arbeitsdaten bleiben im Browser gespeichert.


## Änderungen in V99.2.3

- Die bisher flache linke Seitenleiste wurde durch eine aufklappbare Workflow-Navigation ersetzt.
- Drei Hauptzweige strukturieren die Anwendung: **Start & Stammdaten**, **Aktuelle Abrechnung [Jahr]** und **System**.
- Die aktuelle Abrechnung ist in vier Phasen gegliedert: Grundlagen, Einnahmen & Verbräuche, Berechnung sowie Prüfung & Ausgabe.
- Der aktive Tab öffnet seinen vollständigen Navigationspfad automatisch – auch bei Schnellaktionen und programmgesteuerten Tabwechseln.
- Manuell geöffnete oder geschlossene Zweige werden lokal im Browser gespeichert.
- Ohne aktive Abrechnung bleiben die Abrechnungspunkte sichtbar, sind aber gesperrt; in der Archivansicht wird ausschließlich der Abrechnungszweig angezeigt.
- Sichtbare Bezeichnungen wurden präzisiert: **Abrechnungsstatus**, **Abrechnung exportieren** und **Datensicherung & System**. Technische Tab-IDs und Fachrenderer bleiben unverändert.

## Änderungen in V99.2.2

- **Mieter & Wohnungen:** Der Bestandsabgleich wurde in die letzte Klappbox „Prüfung und Plausibilität“ verschoben; die ehemalige erste Klappbox entfällt und die verbleibenden Bereiche sind neu nummeriert.
- **Kostenarten & Einstellungen:** In „Umlage pro Mietverhältnis / Wohnung“ sind nur Mieter-ID und Mietername größer und besser lesbar.
- **Kaltmiete & NK-Vorauszahlungen:** Der blaue Einleitungshinweis oberhalb der Kaltmiettabelle wurde entfernt.
- **Zählerstände:** Alle breiten Zählertabellen beginnen nun bündig an derselben horizontalen Position wie die Tabellen im Referenztab „Kaltmiete & NK-Vorauszahlungen“.
- **WORKBOOK:** Die fachliche Überarbeitung der Vorjahresübernahme sowie die Entwicklung einer eigenen Prüfroutine für Kaltmiete und NK-Vorauszahlungen sind verbindlich dokumentiert.

## Änderungen in V99.2.1

- Das blaue Buttondesign der vorherigen Arbeitsoberfläche wurde wiederhergestellt. Primäraktionen erscheinen kräftig blau, Nebenaktionen weiß mit blauer Kontur.
- Die ältere Begrenzung auf 1500 px wurde endgültig überschrieben. Die Arbeitsfläche nutzt auf großen Monitoren die verfügbare Breite bis auf einen schmalen, symmetrischen Rand.
- Breite Datentabellen behalten wieder ihre natürliche Spaltenbreite. Horizontale Scrollleisten werden im Tabellenrahmen sichtbar bereitgestellt.
- Längere dafür vorgesehene Textfelder dürfen weiterhin umbrechen; Zahlen-, Datums-, Status- und Aktionsspalten bleiben kompakt.

## Schwerpunkt der V99.2-Grundarchitektur

V99.2 führt alle 14 vorhandenen Tabs auf eine gemeinsame, statische Darstellungsarchitektur zurück:

- globale weiße Kopfleiste und einheitlicher dreispaltiger Tab-Kopf,
- genau vier direkte Übersichtskacheln je Tab,
- ein zentraler Kachelrenderer und eine zentrale Tabregistrierung,
- standardisierte Schnellaktionsbuttons,
- dynamische Kartenhöhen ohne abgeschnittene Inhalte,
- statische, standardmäßig geschlossene Klappboxen,
- technisch markierte Prüfbox als letzter Abschnitt,
- responsive Darstellung mit 4, 2 oder 1 Kachel pro Zeile.

Parallele Kartenrenderer, tababhängige Layoutschichten und nachträgliche DOM-Umbauten wurden entfernt. Die fachliche Berechnungs-, Umlage-, Vorauszahlungs-, Brief-, Export-, Archiv- und Migrationslogik wurde nicht neu konzipiert.

## Enthaltene Tabs

1. Abrechnungsübersicht
2. Mieterverwaltung
3. Wohnungsverwaltung
4. Datensicherung & System
5. Abrechnungsstatus
6. Mieter & Wohnungen
7. Kostenarten & Einstellungen
8. Kaltmiete & NK-Vorauszahlungen
9. Zählerstände
10. Nebenkostenumlage
11. Vorauszahlungsanpassung
12. Qualitätsprüfung
13. Abrechnungsbriefe
14. Abrechnung exportieren

## Start und Veröffentlichung

### Lokal

`index.html` in einem modernen Browser öffnen. Für eine verlässliche PWA-/Service-Worker-Nutzung sollte die Anwendung über einen lokalen Webserver oder HTTPS bereitgestellt werden.

### GitHub Pages

Den Inhalt der ZIP-Datei unverändert in das Veröffentlichungsverzeichnis des GitHub-Repositories kopieren und GitHub Pages für diesen Branch/Ordner aktivieren. Die Datei `.nojekyll` verhindert eine unnötige Jekyll-Verarbeitung.

Der Service Worker verwendet den neuen Cache-Namen `nk-pro-v99-2-3`. Dadurch werden ältere V99.2.x-Caches beim Aktivieren der neuen Version entfernt.

## Dateien

- `index.html` – vollständige Anwendung
- `service-worker.js` – Offline-Cache und Updatewechsel
- `manifest.webmanifest` – PWA-Metadaten
- `README.md` – Nutzung und Auslieferung
- `CHANGELOG.md` – Änderungen der Version
- `WORKBOOK.md` – verbindliche Architekturregeln
- `UI_ARCHITEKTUR_V99_2_3.md` – technische Konsolidierungsdokumentation
- `V99_2_3_Pruefbericht.json` – strukturierter Prüfbericht
- `SHA256SUMS.txt` – Prüfsummen der ausgelieferten Dateien

## Prüfung

Für V99.2.3 wurden zusätzlich zur bestehenden 14-Tab-Strukturprüfung folgende Navigationsszenarien getestet:

- alle 14 Tabs per programmgesteuertem Wechsel,
- automatisches Öffnen des richtigen Hauptzweigs und der richtigen Workflowphase,
- manuelles Auf- und Zuklappen,
- Speicherung der Baumzustände im lokalen Browser-Speicher,
- Jahres- und Bearbeitungsstatus im Abrechnungszweig,
- mobile Off-Canvas-Navigation bei 800 Pixel Breite,
- JavaScript-Syntax und interner App-Selbsttest,
- Vergleich der geschützten Kernfunktionen mit V99.2.2.

Die normale Navigation zu lokalen HTTP-/Datei-URLs war in der Prüfungsumgebung administrativ blockiert. Deshalb wurde die vollständige tatsächliche `index.html` als isoliertes Chromium-Dokument ausgeführt und gerendert. Der Service-Worker-Lebenszyklus konnte dadurch nicht als echte GitHub-Pages-Installation geprüft werden; Cache-Name, Manifest und Assetliste wurden statisch kontrolliert.

## Datenschutz und Sicherung

NK-Pro arbeitet lokal im Browser. Browserdaten können dennoch durch Bereinigung, Profilwechsel oder technische Probleme verloren gehen. Vor wesentlichen Änderungen und regelmäßig während der Abrechnung sollte eine vollständige JSON-Sicherung erstellt und extern aufbewahrt werden.
