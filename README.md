# NK-Pro V99.2.2 – Praxisanpassungen an Tabs und Tabellen

NK-Pro ist eine lokal nutzbare HTML-/JavaScript-Anwendung zur Erstellung von Nebenkostenabrechnungen. Die Anwendung kann direkt im Browser oder als GitHub-Pages-PWA betrieben werden; die Arbeitsdaten bleiben im Browser gespeichert.


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
4. Sicherung & Version
5. Dashboard
6. Mieter & Wohnungen
7. Kostenarten & Einstellungen
8. Kaltmiete & NK-Vorauszahlungen
9. Zählerstände
10. Nebenkostenumlage
11. Vorauszahlungsanpassung
12. Qualitätsprüfung
13. Abrechnungsbriefe
14. Abrechnung sichern/exportieren

## Start und Veröffentlichung

### Lokal

`index.html` in einem modernen Browser öffnen. Für eine verlässliche PWA-/Service-Worker-Nutzung sollte die Anwendung über einen lokalen Webserver oder HTTPS bereitgestellt werden.

### GitHub Pages

Den Inhalt der ZIP-Datei unverändert in das Veröffentlichungsverzeichnis des GitHub-Repositories kopieren und GitHub Pages für diesen Branch/Ordner aktivieren. Die Datei `.nojekyll` verhindert eine unnötige Jekyll-Verarbeitung.

Der Service Worker verwendet den neuen Cache-Namen `nk-pro-v99-2-2`. Dadurch werden ältere V99.2.x-Caches beim Aktivieren der neuen Version entfernt.

## Dateien

- `index.html` – vollständige Anwendung
- `service-worker.js` – Offline-Cache und Updatewechsel
- `manifest.webmanifest` – PWA-Metadaten
- `README.md` – Nutzung und Auslieferung
- `CHANGELOG.md` – Änderungen der Version
- `WORKBOOK.md` – verbindliche Architekturregeln
- `UI_ARCHITEKTUR_V99_2_2.md` – technische Konsolidierungsdokumentation
- `V99_2_2_Pruefbericht.json` – strukturierter Prüfbericht
- `SHA256SUMS.txt` – Prüfsummen der ausgelieferten Dateien

## Prüfung

Die Anwendung wurde statisch, per JavaScript-Syntaxprüfung und in Chromium geprüft. Getestet wurden alle 14 Tabs bei 1440, 1180, 900 und 520 Pixel Breite sowie programmgesteuerte Tabwechsel, Schnellaktion, nächster Schritt, Eingabe, Neuberechnung und Speichern. Ein Vergleich zentraler fachlicher Ergebnisobjekte zwischen V99.1 und der V99.2-Grundarchitektur ergab keine Abweichung im verwendeten mitgelieferten Arbeitsstand.

Die Browserumgebung erlaubte keine normale Navigation zu einer lokalen HTTP-/Datei-URL. Deshalb wurde die tatsächliche vollständige HTML-Datei in einem isolierten Chromium-Dokument geladen und dort ausgeführt und gerendert. Der Service-Worker-Lebenszyklus wurde dadurch nicht als echte GitHub-Pages-Installation ausgeführt; Cache-Name, Assetliste und JavaScript wurden statisch geprüft.

## Datenschutz und Sicherung

NK-Pro arbeitet lokal im Browser. Browserdaten können dennoch durch Bereinigung, Profilwechsel oder technische Probleme verloren gehen. Vor wesentlichen Änderungen und regelmäßig während der Abrechnung sollte eine vollständige JSON-Sicherung erstellt und extern aufbewahrt werden.
