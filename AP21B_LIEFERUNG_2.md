# AP21B – Lieferung 2: Abrechnungsübersicht

## Umfang

Diese Zwischenlieferung erweitert Lieferung 1 um die dynamische Seite „Nebenkostenabrechnung – Übersicht“ nach der verbindlichen AP21B-Referenz.

Umgesetzt und geprüft sind:

- Seitenkopf mit Titel, Beschreibung, „Neue Abrechnung“ und „Daten importieren“
- Abrechnungsfilter „Alle“, „In Bearbeitung“, „Abgeschlossen“ und „Archiviert“
- dynamische Abrechnungstabelle mit Zeitraum, Status, Bearbeitungsstand, letzter Änderung und zustandsabhängigen Aktionen
- Tabellenfuß mit Ergebnisanzahl und Zeilen-pro-Seite-Auswahl
- nur bei geöffneter Abrechnung sichtbarer Arbeitsstand
- sechs dynamisch bewertete Arbeitsschritte mit Status, Hinweis und Direkteinstieg
- Statuszusammenfassung für vollständig, offen, blockiert und Hinweise
- dynamisch abgeleitete „Als Nächstes“-Box
- gezielter Korrekturdialog bei NKP-FACH-001 ohne Wiederherstellung der entfernten Zeitraum-Klappbox
- keine fest codierten Darstellungswerte für Abrechnungsdaten oder den nächsten Arbeitsschritt

## Technische Prüfung

- AP21B-Strukturprüfung: bestanden
- Chromium-/Playwright-Test „Navigation und dynamische Abrechnungsübersicht“: bestanden
- Referenz-Screenshots wurden bei 1120 × 1350 px erzeugt

## Abgrenzung

Die zwei weiteren AP21B-Browsertests für Zähler-Icons und eine Detailannahme im Schreibschutztest sind noch nicht Bestandteil der Abnahme dieser Lieferung. Sie werden in Lieferung 3 korrigiert und erneut ausgeführt.
