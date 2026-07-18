# AP22F8B – Testbericht

## AP22F8B

- statische Struktur- und Metadatenprüfung: bestanden
- Schutzprüfung: 499 Dateien und 9 Teilbereiche bestanden
- Chromium-Browsertest: bestanden
- Standardfall: 7 Fälle insgesamt, 4 abrechenbar, 3 nicht abrechenbar
- drei getrennte Tabellen und drei Summenzeilen: bestanden
- nicht abrechenbare Fälle sichtbar, gesperrt und nicht summiert: bestanden
- Bearbeitung vorhandener Felder: bestanden
- Suche, Statusfilter, Sortierung, Zurücksetzen und Ergebniszählung: bestanden
- Nur-Ansehen-Modus: bestanden
- Leer- und Fehlerzustand: bestanden
- Desktop, 620 px, 390 px und Zoomäquivalent: bestanden
- rechter Tabellenabschluss und kein horizontaler Dokumentüberlauf: bestanden

## Vollständiger Release-Check

- 55 JavaScript-Einheiten syntaxfehlerfrei
- 6 Referenzdatenfälle semantisch unverändert
- Zähler-, Architektur- und AP21C-Prüfungen bestanden
- strenge Release-Inhaltsprüfung bestanden

## Regression

- AP22F7B Mietverhältnisse und Tabellenstandard: bestanden
- AP22F6B Abrechnungsübersicht und Korrektur 1: bestanden
- AP22F5B Zähler und Objekt-Mietverhältnisse: bestanden
- Dokument-/CSV-Export: 2/2 bestanden
- Migration, Restore und Rollback: 6/6 bestanden
- Objektstandard und Snapshot: 9/9 bestanden
- Persistenz, Backup und Wiederbearbeitung: 5/5 bestanden
- Brief und Druck: 8/8 bestanden
- zentrale Navigation: 3/3 bestanden

Ein kombinierter langer Browserlauf wurde durch das Laufzeitlimit der Testumgebung beendet. Die noch ausstehenden Gruppen wurden anschließend einzeln erneut ausgeführt und bestanden. Das historische Werkzeug `tools/check-release-consistency.cjs` ist weiterhin fest auf V99.4.29/AP22A codiert und deshalb kein aktueller Release-Gate; es wurde geschützt unverändert belassen.
