# AP22F9B Korrektur 1 – Schutz-Hash-Bericht

## Referenz

Ausgangsstand der Korrektur ist das zuvor erzeugte Release `NK-Pro_V99_4_44_AP22F9B_Gesamtkosten.zip` auf Basis der verbindlichen AP22F9A-Korrektur-1-Planung.

## Automatischer Schutztest

`tests/ap22f9b-protected-areas.test.cjs`

**Ergebnis:** PASS

- 13 Vollhashes bestanden
- 5 Teilbereichshashes bestanden

## Geschützt und unverändert

Insbesondere unverändert blieben:

- `js/cost-actions.js`
- `js/billing-calculation.js`
- `js/state-access.js`
- Persistenz-, Migrations-, Backup-/Restore- und Archivmodule
- Qualitätsregeln und Qualitätsauswertung
- Brief- und Druckrenderer
- Navigation und globale Abrechnungskontextlogik
- Datenschema 5

Die Korrektur enthält ausschließlich visuelle, lokale UI- und notwendige PWA-Cache-Metadatenänderungen.
