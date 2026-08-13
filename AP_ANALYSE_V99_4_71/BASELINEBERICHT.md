# Baselinebericht – NK-Pro V99.4.70 Korrektur 2

## Ausgangsbasis

- Technische Basis: `NK-Pro_V99.4.70_Schlanke_Arbeitsbasis_Korrektur2_Kontext-Navigation_2026-08-13(1).zip`
- SHA-256 technische Basis: `e188e0b535831c1e35cae777d3c449f4fadba6809836998119e7c378f1dda41c`
- Verbindlicher Echtdatenbestand: `nk-pro-gesamtbestand-2023-V99.4.70-migriert-2026-08-13(1).json`
- SHA-256 Echtdatenbestand: `99cd28ca9a02eea675aa9f71118e25a7e298eda1326fa1920e205cf835cc3c87`
- Datenschema: 5
- Ausgangsversion: V99.4.70 Korrektur 2

## Baseline-Ergebnis

Die Ausgangsbasis ließ sich vollständig entpacken und der ZIP-Integritätstest war erfolgreich. Die vorhandene Architektur ist modular: Berechnungs-, Archiv-, Persistenz-, Zähler-, Qualitäts-, Kostenabgleich- und Analysefunktionen sind getrennt. Der vorhandene V99.4.70-CDP-Browsertest wurde mit dem verbindlichen Echtdatenbestand ausgeführt und bestand.

Die Baseline-Analyse enthielt bereits drei Perspektiven und Mehrjahresdarstellung, zeigte auf der Nebenkostenübersicht aber mehr als vier gleichgewichtete Kennzahlen und verwendete noch eine gröbere Perioden-/Vergleichbarkeitslogik. Vorher-Screenshots liegen unter `screenshots/before/`.

## Echtdaten-Baseline

- Eindeutige Analyseperioden: 2021/2022, 2022, 2023, 2024.
- Historische Sonderperiode 2021/2022 bleibt als nicht eindeutig kalendarische Legacy-Periode erhalten.
- M000 / Erik Zimmermann / W000.UG ist im Echtdatenbestand als `Eigentümer/Privat` vorhanden.
- Zählerstandard: 16 Zähler, 32 Messwerte, 16 Messperioden, 23 Zuordnungen, 0 dokumentierte Zählerwechsel.
- Aktuelle Objektstammdaten enthalten sieben Einheiten mit zusammen 391,5 m².
- Vollständige datierte Zahlungsbewegungen für einen echten Cashflow liegen im Echtdatenbestand nicht vor.
