# AP22F7B Korrektur 3 – Testbericht

## Ergebnis

Alle für Korrektur 3 vorgesehenen Prüfungen sind bestanden.

## Statische Prüfungen

- 55 JavaScript-Syntaxeinheiten fehlerfrei.
- 6 Referenzdatenfälle semantisch unverändert.
- AP22F7B-Bestandstest bestanden.
- Tabellenkopf-Korrektur 1 bestanden.
- Tabellenbreiten-Korrektur 2 bestanden.
- Korrektur-3-Test für rechten Tabellenrahmen und deutsches Datumsformat bestanden.
- 451 direkt geschützte Dateien unverändert.
- `assets/app.css` außerhalb des freigegebenen Tabellenrahmenblocks normalisiert bytegleich zur Ausgangsbasis.
- `js/ui-costs.js` außerhalb der freigegebenen Darstellungs- und sortierneutralen Datumsfunktionen normalisiert bytegleich zur Ausgangsbasis.
- Vollständiger `release:check` bestanden.

## Browserprüfungen

- 57 Tabellen-/Viewport-Prüfungen über 19 produktive Tabellen bei 1720 px, 620 px und 390 px bestanden.
- Rechter Rahmen an letzter Kopf- und Datenzelle geprüft.
- Rechter oberer Tabellenradius geprüft.
- Keine leere Restfläche nach der letzten Spalte.
- Kein horizontaler Dokumentüberlauf; Tabellenüberlauf bleibt intern.
- Deutsches Mietzeitraumformat `TT.MM.JJJJ – offen` beziehungsweise `TT.MM.JJJJ – TT.MM.JJJJ` geprüft.
- AP22F5B-Browserregression bestanden.
- AP22F6B-Browserregression bestanden.

## Kernregressionen

- Dokument-/CSV-Export: 2/2 bestanden.
- Migration, Restore und Rollback: 6/6 bestanden.
- Persistenz, Backup und Wiederbearbeitung: 5/5 bestanden.
- Brief- und Drucksystem: 8/8 bestanden.

## Browser-Screenshots

Sechs reale Chromium-Screenshots dokumentieren die Abrechnungs-Mietverhältnisse, Wohnungen, Zähler, Objekt-Mietverhältnisse, Abrechnungsübersicht und die 620-px-Ansicht.
