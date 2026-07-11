# NK-Pro V99.2.4 – Mock-up-genaue Navigation

NK-Pro ist eine lokal nutzbare HTML-/JavaScript-Anwendung zur Erstellung von Nebenkostenabrechnungen. Die Anwendung kann direkt im Browser oder als GitHub-Pages-PWA betrieben werden; die Arbeitsdaten bleiben im Browser gespeichert.

## Änderungen in V99.2.4

Die linke Navigation wurde exakt nach dem freigegebenen schlichten Zielbild neu gestaltet:

- dunkelblaue, ruhige Seitenleiste mit NK-PRO-Logo und doppeltem Einklapppfeil,
- eigene Kopfzeile für Abrechnungsjahr und Bearbeitungsstatus,
- vier klar getrennte Bereiche: **Übersicht**, **Stammdaten**, **Abrechnung** und **System**,
- feste Symbole vor Abrechnungsübersicht, Abrechnungsstatus, Mieter, Wohnungen und Datensicherung,
- vier nummerierte Workflowphasen mit Aufklapppfeil und Dokument-Icon,
- immer genau eine geöffnete Workflowphase,
- aktiver Tab mit hellblauer Fläche, blauem Balken links und blauem Punkt rechts,
- inaktive Unterpunkte mit dezent grauem Punkt,
- schlichte Trennlinien, einheitliche Einzüge und Abstände,
- untere Aktion **Navigation einklappen**,
- sichtbare Kurzbezeichnungen entsprechend dem Zielbild; technische Tab-IDs bleiben unverändert.

Programmgesteuerte Tabwechsel öffnen weiterhin automatisch die passende Workflowphase. Der geöffnete Phasenzustand wird lokal gespeichert. Abrechnungsjahr und Status werden aus der aktuell geöffneten Abrechnung übernommen.

## Änderungen in V99.2.3

- Die zuvor flache Navigation wurde erstmals nach Arbeitsphasen gegliedert.
- V99.2.4 ersetzt deren kartenartige Baumdarstellung durch das verbindliche schlichte Mock-up.

## Schwerpunkt der V99.2-Grundarchitektur

Alle 14 Tabs verwenden weiterhin die gemeinsame statische Darstellungsarchitektur mit globaler Kopfleiste, dreispaltigem Tab-Kopf, genau vier Übersichtskacheln, statischen Klappboxen und abschließender Prüfbox. Die fachliche Berechnungs-, Umlage-, Vorauszahlungs-, Brief-, Export-, Archiv- und Migrationslogik wurde in V99.2.4 nicht verändert.

## Enthaltene Navigationsziele

1. Abrechnungsübersicht
2. Abrechnungsstatus
3. Mieter
4. Wohnungen
5. Mieter & Wohnungen
6. Kostenarten
7. Miete & Vorauszahlungen
8. Zählerstände
9. Nebenkostenumlage
10. Neue Vorauszahlungen
11. Qualitätsprüfung
12. Abrechnungsbriefe
13. Export
14. Datensicherung

Die verkürzten Navigationsbezeichnungen ändern nicht die vollständigen Titel innerhalb der Tabs.

## Start und Veröffentlichung

### Lokal

`index.html` in einem modernen Browser öffnen. Für eine verlässliche PWA-/Service-Worker-Nutzung sollte die Anwendung über einen lokalen Webserver oder HTTPS bereitgestellt werden.

### GitHub Pages

Den Inhalt der ZIP-Datei unverändert in das Veröffentlichungsverzeichnis des GitHub-Repositories kopieren und GitHub Pages für diesen Branch/Ordner aktivieren. Die Datei `.nojekyll` verhindert eine unnötige Jekyll-Verarbeitung.

Der Service Worker verwendet den Cache-Namen `nk-pro-v99-2-4`. Dadurch werden ältere V99.2.x-Caches beim Aktivieren der neuen Version entfernt.

## Dateien

- `index.html` – vollständige Anwendung
- `service-worker.js` – Offline-Cache und Updatewechsel
- `manifest.webmanifest` – PWA-Metadaten
- `README.md` – Nutzung und Auslieferung
- `CHANGELOG.md` – Änderungen der Version
- `WORKBOOK.md` – verbindliche Architekturregeln
- `UI_ARCHITEKTUR_V99_2_4.md` – technische Dokumentation der Navigation
- `V99_2_4_Pruefbericht.json` – strukturierter Prüfbericht
- `SHA256SUMS.txt` – Prüfsummen der ausgelieferten Dateien

## Prüfung

Für V99.2.4 wurden geprüft:

- alle Texte, Bereiche, Symbole, Pfeile, Dokument-Icons, Punkte und Trennlinien des freigegebenen Zielbilds,
- genau eine geöffnete Workflowphase,
- automatische Phasenöffnung bei direkten und programmgesteuerten Tabwechseln,
- Desktop-Einklappen und Wiederöffnen der Navigation,
- mobile Off-Canvas-Navigation,
- JavaScript-Syntax, DOM-Struktur und interner App-Selbsttest,
- alle 14 Tabs und die bestehende Vier-Kachel-/Klappboxarchitektur,
- bytegleicher Vergleich geschützter Kernfunktionen mit V99.2.3,
- ZIP-Integrität und SHA-256-Prüfsummen.

Der Service-Worker-Lebenszyklus wurde nicht als echte GitHub-Pages-Installation Ende-zu-Ende ausgeführt; Cache-Name, Manifest und Assetliste wurden statisch geprüft.

## Datenschutz und Sicherung

NK-Pro arbeitet lokal im Browser. Browserdaten können dennoch durch Bereinigung, Profilwechsel oder technische Probleme verloren gehen. Vor wesentlichen Änderungen und regelmäßig während der Abrechnung sollte eine vollständige JSON-Sicherung erstellt und extern aufbewahrt werden.
