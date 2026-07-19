# Abschluss AP22F10G-B Korrektur 2

## Ausgangsbasis

`NK-Pro_V99_4_59_AP22F10G_B_Individuelle_Werte_Korrektur1.zip`

## Verbindliches Ergebnis

`NK-Pro_V99_4_60_AP22F10G_B_Individuelle_Werte_Korrektur2.zip`

## Behobener Fehler

V99.4.59 verwendete für „Individuelle Werte“ irrtümlich die Standard-Seitenschale mit maximal 1.180 px. „Gesamtkosten“ verwendet dagegen die breite Seitenschale mit maximal 1.440 px. Gleichzeitig erzwangen feste Tabellenmindestbreiten auf Desktop unnötigen horizontalen Tabellenlauf.

V99.4.60 verwendet nun dieselbe breite Seitenschale wie „Gesamtkosten“ und verteilt die Tabellenspalten auf Desktop innerhalb der verfügbaren Breite. Erst unterhalb der responsiven Schwelle wird wieder eine Mindestbreite aktiviert und ausschließlich innerhalb der Tabelle horizontal gescrollt.

## Datenbestand

Der reale Gesamtbestand `nk-pro-gesamtbestand-2025-V99.4.58-2026-07-19-16-16-12.json` wurde für die Browserprüfung verwendet. Er wurde nicht in das Release eingebaut und blieb unverändert.

Datenschema: **5**. Keine Migration erforderlich.
