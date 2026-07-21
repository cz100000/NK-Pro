# NK-Pro V99.4.66 – Wohnflächenkorrektur

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

## Technische Umsetzung

- Die Werte sind im Ausgangsbestand anhand der stabilen Wohnungs-IDs hinterlegt.
- Beim ersten Start mit einem älteren lokalen Arbeitsstand wird die Korrektur einmalig in den zentralen Wohnungsstammdaten, der aktuellen Abrechnungskopie, den zugehörigen Mietverhältnissen und dem Objektstandard synchronisiert.
- Die Korrektur wird danach als erledigt markiert und überschreibt spätere manuelle Änderungen nicht erneut.
- Historische Jahresarchive und Abrechnungssnapshots werden nicht verändert.
- Datenschema 5 und Storage-Key bleiben unverändert.
