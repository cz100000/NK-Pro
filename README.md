# NK-Pro V99.2.6 – Zähler-, Status- und Umlageoptimierung

NK-Pro ist eine lokal nutzbare HTML-/JavaScript-Anwendung zur Erstellung von Nebenkostenabrechnungen. Die Anwendung kann direkt im Browser oder als GitHub-Pages-PWA betrieben werden; die Arbeitsdaten bleiben im Browser gespeichert.

## Änderungen in V99.2.6

### Einheitlicher Abrechnungsstatus

Der Status im mittleren Seitenkopf wird jetzt aus dem tatsächlichen Zustand der geöffneten Abrechnung erzeugt:

- **In Bearbeitung · bearbeitbar**
- **Finalisiert · schreibgeschützt**
- **Archiviert · schreibgeschützt**
- **Keine Abrechnung geöffnet**

Der Zeitraum wird zweistellig als `TT.MM.JJJJ – TT.MM.JJJJ` angezeigt. Finalisierte und archivierte Abrechnungen sperren den Speichern-Button.

### Prüfungskacheln

Die zentrale Kachel **Prüfung** verwendet wieder eindeutige Symbole pro Prüfpunkt:

- grüner Haken für bestandene Prüfungen,
- oranges Warndreieck für zu kontrollierende Hinweise,
- rotes Fehlersymbol für blockierende Fehler.

### Zählerstände

Der Tab wurde fachlich neu geordnet:

1. Hauszähler und Wasserwerksrechnung
2. Zählerstände erfassen
3. Verbrauch pro Mietverhältnis / Wohnung
4. Historie und Vorjahresübernahme
5. Prüfung und Plausibilität

Die neue erste Klappbox erfasst Anfangs- und Endstand des Hauszählers, die zugehörigen Ablesedaten, den Verbrauch laut Wasserwerksrechnung und eine optionale Rechnungsnotiz. Hauszählerverbrauch, Rechnungsverbrauch und Summe der Wohnungszähler werden getrennt verglichen. Abweichungen bis einschließlich 5 % gelten als plausibel; größere Abweichungen werden markiert.

Die Verbrauchstabelle **K002 · Wasserversorgung** besitzt eine Summenzeile für Kaltwasser-, Warmwasser- und Gesamtverbrauch. Tabellenfilter und Tabellen verwenden im gesamten Zählertab denselben horizontalen Start- und Endpunkt. Der Quellenhinweis zur Wasseruhren-Historie steht unter der Historientabelle. Der frühere technische Fortschreibungshinweis erscheint nur noch bei unerwartet vorbelegten Endwerten.

Die Übernahme berechneter Zählerverbräuche in Verbrauchskosten ist dauerhaft aktiv. Der bisher sichtbare Ja/Nein-Schalter wurde entfernt.

### Nebenkostenumlage

Die nicht mehr erforderliche Klappbox **Berechnung und Aktionen** wurde entfernt. Die Umlage wird weiterhin bei jeder Darstellung aus dem aktuellen Datenstand berechnet. Die Rücksetzfunktion befindet sich jetzt in **Verbrauchswerte und manuelle Einzelbeträge** und behält ihre Sicherheitsabfrage.

### Neue Vorauszahlungen

Der Block **Berechnungsregeln** verwendet ein kompaktes zweispaltiges Raster. Die doppelte Überschrift wurde entfernt; auf schmalen Bildschirmen werden die Felder weiterhin einspaltig dargestellt. Die Berechnungslogik blieb unverändert.

### Navigation

Das verbindliche Navigations-Mock-up aus V99.2.5 bleibt unverändert: 324 px Breite, dieselben Texte, Symbole, Einzüge, Trennlinien, Phasen und Zustände.

## Start und Veröffentlichung

### Lokal

`index.html` in einem modernen Browser öffnen. Für eine verlässliche PWA-/Service-Worker-Nutzung sollte die Anwendung über einen lokalen Webserver oder HTTPS bereitgestellt werden.

### GitHub Pages

Den Inhalt der ZIP-Datei unverändert in das Veröffentlichungsverzeichnis des GitHub-Repositories kopieren und GitHub Pages für diesen Branch oder Ordner aktivieren. `.nojekyll` verhindert eine unnötige Jekyll-Verarbeitung.

Der Service Worker verwendet den Cache-Namen `nk-pro-v99-2-6`. Beim Aktivieren werden ältere NK-Pro-Caches entfernt.

## Dateien

- `index.html` – vollständige Anwendung
- `service-worker.js` – Offline-Cache und Updatewechsel
- `manifest.webmanifest` – PWA-Metadaten
- `README.md` – Nutzung und Auslieferung
- `CHANGELOG.md` – Änderungen der Version
- `WORKBOOK.md` – verbindliche Architektur- und Fachregeln
- `UI_ARCHITEKTUR_V99_2_6.md` – technische Dokumentation
- `V99_2_6_Pruefbericht.json` – strukturierter Prüfbericht
- `SHA256SUMS.txt` – Prüfsummen der ausgelieferten Dateien

## Prüfung

Für V99.2.6 wurden ausgeführt:

- statische HTML-, ID- und Klappboxstrukturprüfung,
- JavaScript-Syntaxprüfung aller vier Scriptblöcke mit Node.js,
- gezielte Logiktests für Hauszählerverbrauch, 5-%-Plausibilitätsgrenze, Statussymbole, Zeitraumformat und Fortschreibungswarnung,
- Quellcodeprüfungen für automatische Zählerübernahme, K002-Summenzeile, Filterausrichtung, dynamischen Seitenstatus, Umlage-Neuordnung und kompaktes Regelraster,
- ZIP-Integrität und SHA-256-Prüfsummen.

Eine Live-Navigation der lokalen Anwendung in Chromium konnte in der bereitgestellten Ausführungsumgebung wegen einer verwalteten Browserrichtlinie nicht ausgeführt werden. Nach Veröffentlichung sollte deshalb zusätzlich ein kurzer GitHub-Pages-/PWA-Smoke-Test erfolgen. Der Service-Worker-Lebenszyklus wurde nicht als echte Installation Ende-zu-Ende getestet.

## Datenschutz und Sicherung

NK-Pro arbeitet lokal im Browser. Browserdaten können dennoch durch Bereinigung, Profilwechsel oder technische Probleme verloren gehen. Vor wesentlichen Änderungen und regelmäßig während der Abrechnung sollte eine vollständige JSON-Sicherung erstellt und extern aufbewahrt werden.
