# Prüfbericht – Wohnflächenkorrektur V99.4.66

## Verbindliche Wohnflächen

| Wohnungs-ID | Bezeichnung | Wohnfläche |
|---|---|---:|
| W000.UG | UG | 65,0 m² |
| W001.EG-L | EG-Links | 62,5 m² |
| W002.EG-R | EG-Rechts | 52,5 m² |
| W003.1OG-L | 1OG-Links | 62,5 m² |
| W004.1OG-R | 1OG-Rechts | 52,5 m² |
| W005.DG-L | DG-Links | 52,0 m² |
| W006.DG-R | DG-Rechts | 44,5 m² |
| **Gesamt** |  | **391,5 m²** |

## Umsetzung

- Die produktiven Standarddaten enthalten die korrekten Flächen anstelle der bisherigen 55-m²-Platzhalter.
- Eine einmalige, ID-basierte Bestandskorrektur synchronisiert beim ersten Start vorhandene aktuelle Arbeitsdaten, Wohnungsstammdaten, Mietverhältnisse und den Objektstandard.
- Die Korrektur wird anschließend im bestehenden lokalen Speicher gesichert.
- Spätere manuelle Flächenänderungen werden nicht erneut durch die Korrektur überschrieben.
- Abgeschlossene Jahresarchive werden nicht verändert.
- Ein korrigierter vollständiger Gesamtbestand für den direkten Import liegt dem Release bei.

## Prüfungen

- JavaScript-Syntaxprüfung: bestanden
- Referenzdatenprüfung: bestanden
- Wohnflächen-Modultest einschließlich Archivschutz: bestanden
- Architektur- und Regressionstests: bestanden
- Browserprüfung mit altem 55-m²-Arbeitsstand, automatischer Korrektur, Persistenz und Wohnungsansicht: bestanden
- Export-/Reimport-Rundlauf des korrigierten Gesamtbestands: bestanden
- Release-Inhaltsprüfung: bestanden

## Release

- Version: V99.4.66
- Datenbankschema: unverändert Version 5
- Speicherkennung: unverändert
- Gesamtwohnfläche: 391,5 m²
