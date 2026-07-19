# AP22F11B Korrektur 3 – Echtdaten-Erhaltungsbericht

## Prüfbestand

Ausgangsbestand:

`nk-pro-gesamtbestand-2025-V99.4.63-AP22F11B-Korrektur2-getestet.json`

Neu exportierter und erneut importierter Bestand:

`nk-pro-gesamtbestand-2025-V99.4.64-AP22F11B-Korrektur3-getestet.json`

## Ergebnis

Die geschützten Geschäftsdaten sind vollständig identisch geblieben:

- Wohnungen
- Mietverhältnisse
- Kostenarten
- Vorauszahlungen und Korrekturen
- Wasserzählerstände
- manuelle und externe Werte
- Umlageeingaben
- Jahresarchive
- Messwert-Historie
- periodenbezogene Einzelwerte

Weitere Kontrollwerte:

- Datenschema: 5
- Messwerte: 769 vor und nach dem Roundtrip
- Jahresarchive: 4 vor und nach dem Roundtrip
- Prüfentscheidungen: keine zusätzlichen Datensätze
- Exportversion: V99.4.64

Die Umsetzung enthält keine Datenmigration. Es wurden ausschließlich UI-, Navigations-, Versions- und Testartefakte geändert.
