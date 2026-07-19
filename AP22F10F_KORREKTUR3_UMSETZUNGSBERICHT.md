# AP22F10F – Korrektur 3: Altstandsübernahme Wasser

## Fehlerursache

Die Vorjahresendstände waren im realen Gesamtbestand bereits als aktive Anfangsablesungen des Jahres 2025 vorhanden. Die Sammelerfassung las den Anfangsstand jedoch ausschließlich aus `zaehlerDaten.messperioden`. Eine Messperiode wird fachlich erst aus zwei aktiven Messwerten (Anfang und Ende) gebildet. Bei noch leerem Endstand existierte daher keine Messperiode und die Oberfläche zeigte den vorhandenen Anfangsstand fälschlich leer an.

## Korrektur

- `waterMeterRows()` liest Anfangs- und Endablesungen zusätzlich direkt aus aktiven `zaehlerDaten.messwerte` des aktuellen Abrechnungszeitraums.
- Messperioden bleiben die führende Quelle, sobald Anfang und Ende vorhanden sind.
- Eine einzelne Anfangsablesung wird als offener Zählerdatensatz mit sichtbarem Anfangsstand dargestellt.
- Ein vorhandener Endstand ohne neu gerenderte Messperiode kann ebenfalls direkt ausgewertet werden.
- Stornierte, ersetzte, korrigierte und rein dokumentarische Messwerte werden ausgeschlossen.
- Vorperiodenprotokolle werden je Zähler und Quelljahr dedupliziert.
- Nach einer automatischen Übernahme wird der Zählerstandard erneut synchronisiert.

## Reale Regression

Testgrundlage: `nk-pro-gesamtbestand-2025-V99.4.55-2026-07-19-13-20-22.json`.

Geprüfte Anfangsstände:

- UG: KW 490 / WW 280
- EG-Links: KW 266 / WW 108
- EG-Rechts: KW 117 / WW 28
- 1OG-Links: KW 168 / WW 59
- 1OG-Rechts: KW 195 / WW 241

Alle zehn Anfangsstände werden durch die produktive Berechnungsfunktion der Sammelerfassung gelesen. Die bereits vorhandenen UG-Endstände 564 und 297,74 bleiben erhalten; der KW-Verbrauch 74 wird korrekt berechnet.
