# AP22F11B Korrektur 2 – Echtdaten-Erhaltungsbericht

## Vergleichsbestände

- Eingang: `nk-pro-gesamtbestand-2025-V99.4.62-AP22F11B-Korrektur1-getestet.json`
- getesteter Ausgang: `nk-pro-gesamtbestand-2025-V99.4.63-AP22F11B-Korrektur2-getestet.json`

## Kanonisch identisch bestätigt

Die fachlichen Inhalte wurden vor Export, nach Export und nach Reimport verglichen. Identisch blieben:

- Wohnungen,
- Mietverhältnisse,
- Kostenarten und Umlagesteuerung,
- Vorauszahlungen,
- Wasserzähler-Anfangs- und Endstände sowie Datumsfelder,
- manuelle und externe Umlagewerte einschließlich Privat- und Leerstandsfällen,
- Wasserhistorie,
- mietverhältnisbezogene Umlagefreigaben,
- Abrechnungseinzelwerte,
- Zählerstammdaten, Messwerte, Messperioden, Zuordnungen und Wechsel,
- sämtliche Jahresarchive.

Bei den Zählerdaten änderten sich ausschließlich die regulären technischen Felder `updatedAt` und `updatedWithAppVersion`.

## Bestandskennzahlen

| Kennzahl | Eingang | Ausgang/Reimport |
|---|---:|---:|
| Wohnungen | 7 | 7 |
| Mietverhältnisse | 5 | 5 |
| Kostenarten | 41 | 41 |
| Wasser-Erfassungszeilen | 20 | 20 |
| Zähler | 44 | 44 |
| Messwerte | 769 | 769 |
| Messperioden | 10 | 10 |
| Jahresarchive | 4 | 4 |
| Prüfentscheidungen | 0 | 0 |

## Ergebnis

Die Echtdatenerhaltung ist bestanden. Es wurden keine zusätzlichen Abrechnungsfälle, Messwerte, Archive oder Prüfentscheidungen erzeugt. Der getestete Export trägt `V99.4.63` und weiterhin Datenschema 5.
