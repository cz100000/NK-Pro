# AP22F11B – Echtdaten-Erhaltungsbericht

## Prüfweg

Der verbindliche Gesamtbestand wurde über den echten Importdialog importiert, gespeichert, neu geladen, auf der Ergebnis-Seite geprüft, exportiert, in einen leeren Browserzustand erneut importiert und nochmals exportiert. Der getestete Ausgabebestand ist `nk-pro-gesamtbestand-2025-V99.4.61-AP22F11B-getestet.json`.

## Fachliche Datenbereiche

| Bereich | Ergebnis | Eingang | Ausgabe |
|---|---|---|---|
| `wohnungen` | identisch | `b9b2435de7a6…` | `b9b2435de7a6…` |
| `mieter` | identisch | `004e65bd6129…` | `004e65bd6129…` |
| `kostenarten` | identisch | `feb1d631c691…` | `feb1d631c691…` |
| `vorauszahlungen` | identisch | `4ec15a3ca778…` | `4ec15a3ca778…` |
| `waterMeters` | identisch | `e32d83678692…` | `e32d83678692…` |
| `meterReadings` | identisch | `a15db386a887…` | `a15db386a887…` |
| `umlageInputs` | identisch | `6c681a025cf8…` | `6c681a025cf8…` |
| `briefSettings` | identisch | `5029ac715366…` | `5029ac715366…` |
| `jahresArchiv` | identisch | `9d67f3690213…` | `9d67f3690213…` |
| `waterMeterHistory` | identisch | `a4a2b5405670…` | `a4a2b5405670…` |
| `kostenartenMieterUmlage` | identisch | `e174a60337a3…` | `e174a60337a3…` |
| `abrechnungsEinzelwerte` | identisch | `4f53cda18c2b…` | `4f53cda18c2b…` |
| `stammdaten` | identisch | `40fb81084c78…` | `40fb81084c78…` |
| `briefAddresses` | identisch | `44136fa355b3…` | `44136fa355b3…` |

Die fachlichen Ursprungsdaten sind identisch geblieben. Erwartete Ergänzungen sind ausschließlich `abrechnungsPruefungen`, Export-/Speichermetadaten und ein bereits von der Anwendung vorgesehener leerer Einstellungsbereich.

## Zählerdomäne

| Struktur | Eingang | Ausgabe | Anzahl gleich |
|---|---:|---:|---|
| `zaehler` | 44 | 44 | ja |
| `messwerte` | 769 | 769 | ja |
| `messperioden` | 10 | 10 | ja |
| `zuordnungen` | 54 | 54 | ja |
| `zaehlerwechsel` | 0 | 0 | ja |

Die Anzahl der Messwerte blieb trotz wiederholter Synchronisierung bei **769**. Es wurden keine weiteren Messwertdubletten erzeugt. Bestehende historische Versionen wurden nicht verändert.

## Bestand und Archive

- 7 Wohnungen, davon 5 aktiv und 2 inaktiv;
- 5 gefüllte Abrechnungsrollen: 4 Mieter und 1 Eigentümer/Privat;
- 41 Kostenarten, davon 3 aktiv;
- 4 Jahresarchive unverändert vorhanden;
- Datenschema 5 und Datenebenenvertrag 1 unverändert;
- Wasserstände, manuelle Heiz-/Warmwasserkosten, Privat- und Leerstandswerte, Vorauszahlungen und Korrekturen blieben erhalten.

## Prüfentscheidungen

Der an den Nutzer übergebene Testexport enthält keine künstlichen Testentscheidungen: `records` und `history` sind leer. Die beiden realen Differenzen bleiben nach dem Reimport offen. Bei erneutem Import entstanden weder zusätzliche Entscheidungen noch Archivdubletten.
