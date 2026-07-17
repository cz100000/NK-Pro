# AP22F3B – Schutz-Hash-Prüfbericht

## Ausgangsprüfung

- Produkt-ZIP SHA-256: `3c9f3f27c831b7740f0030a53d18d4ac086b919b26edf55d928f6a58b4fe63c5`
- Erwarteter Wert laut AP22F3A: `3c9f3f27c831b7740f0030a53d18d4ac086b919b26edf55d928f6a58b4fe63c5`
- Ergebnis: **bestanden**
- ZIP-Integritätsprüfung beider Eingangsarchive: **bestanden**

## Abschlussprüfung

Der separate Test `tests/ap22f3b-protected-areas.test.cjs` prüft die maschinenlesbaren Baselines des Planungspakets.

| Prüfgruppe | Umfang | Ergebnis |
| --- | ---: | --- |
| vollständig geschützte Produktdateien | 29 | bestanden |
| geschützte Fragmente | 14 | bestanden |
| bestehende Regressionstestdateien | 71 | bestanden |

Navigation, globale Kontextleiste, Objektstandard, Qualitätsregeln, Persistenz, Migration, Backup, Restore, Archiv, Abrechnung, Dokument-/Drucksystem und bestehende Tests blieben innerhalb der festgelegten Schutzgrenzen unverändert.
