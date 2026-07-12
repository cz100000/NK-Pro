# NK-Pro V99.4.6

Lokale, frameworkfreie Browseranwendung zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.6 |
| Versionsname | Zählerstammdaten und Messperioden |
| Datenschema | 5 – unverändert |
| Datenebenenvertrag | 1 – unverändert |
| Objektstandard | 1 – unverändert |
| Zähler-/Messstandard | 1 |
| Abrechnungssnapshot | 2; historische Version 1 weiterhin lesbar |
| Ausgangsversion | V99.4.5 |
| Technik | HTML, CSS, JavaScript; kein Framework, kein Buildsystem |
| PWA-Cache | `nk-pro-v99-4-6` |

V99.4.6 trennt dauerhafte Zählerstammdaten, zeitbezogene Messwerte, daraus abgeleitete Messperioden, zeitabhängige Zuordnungen und Zählerwechsel in `zaehlerDaten`. Bestehende V99.4.5-Daten werden nach Vor-Migrationssicherung idempotent übernommen. Unbekannte Felder und historische Snapshots bleiben erhalten.

Der Stromzähler-Dummy `electricity-dummy` kann vollständig gespeichert, exportiert, gesichert, restauriert und in Snapshots dokumentiert werden. Er ist zentral mit `abrechnungsrelevant=false` und `billingRole=excluded` gekennzeichnet und erzeugt keine abrechenbaren Verbräuche oder Kostenpositionen.

Die fachliche Spezifikation steht in `ZAEHLERSTAMMDATEN_UND_MESSPERIODEN.md`; der Prüfstatus in `AP5_PRUEFBERICHT.md`.

## Start

`index.html` in einem modernen Chromium-Browser öffnen. Für PWA- und Updatefunktionen über HTTPS oder einen lokalen Webserver bereitstellen.

## Tests

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

Freigabestand: 16/16 Syntaxeinheiten, 6/6 Referenz-Fixtures, Zählerdomänen- und Releaseprüfung sowie 37/37 Browsertests bestanden.

## Produktive Module

| Pfad | Verantwortung |
|---|---|
| `js/persistence.js` | Browser-Speicheradapter und Integrität |
| `js/migration.js` | Schemamigrationsregistry, Pfadplanung und Transaktion |
| `js/backup-recovery.js` | Sicherungshüllen, Restore und Checkpoint |
| `js/meter-master.js` | dauerhafte Zählerstammdaten und stabile Zähler-IDs |
| `js/meter-readings.js` | eigenständige Messwerte, Herkunft, Korrektur und Storno |
| `js/meter-periods.js` | Messperioden, zeitabhängige Zuordnungen, Zählerwechsel und Verbrauch |
| `js/meter-validation.js` | zentrale Zähler-/Messwertvalidierung, Migration und Snapshot-Projektion |
| `js/object-standard.js` | Objektstandard und kompatible Zählerprojektion |
| `js/billing-snapshot.js` | Abrechnungsbereitschaft, Snapshot 2 und Integrität |
| `js/archive.js` | Snapshot-Grenzen, Archivnormalisierung und Legacy-Kennzeichnung |
| `js/default-seed.js` | Ausgangsdaten |
| `js/app.js` | Zustand, bestehende Berechnung, UI und Ablaufsteuerung |

## Verbindliche Unterlagen

- `NK-PRO-PROJEKTSTAND.md`
- `NK-PRO-ARBEITSREGELN.md`
- `DATENEBENEN_UND_SNAPSHOT_GRENZEN.md`
- `MIGRATIONS_SICHERUNGS_RESTORE_ROLLBACK_FUNDAMENT.md`
- `OBJEKTSTANDARD_UND_ABRECHNUNGSSNAPSHOT.md`
- `ZAEHLERSTAMMDATEN_UND_MESSPERIODEN.md`
- `ARCHITECTURE.md`
- `TESTING.md`
- tatsächlicher Quellcode und automatisierte Tests dieser ZIP
