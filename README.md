# NK-Pro V99.4.5

Lokale, frameworkfreie Browseranwendung zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.5 |
| Versionsname | Objektstandard und Abrechnungssnapshot |
| Datenschema | 5 – unverändert |
| Datenebenenvertrag | 1 – unverändert |
| Objektstandard | 1 |
| Abrechnungssnapshot | 1 |
| Ausgangsversion | V99.4.4 |
| Technik | HTML, CSS, JavaScript; kein Framework, kein Buildsystem |
| PWA-Cache | `nk-pro-v99-4-5` |

V99.4.5 ergänzt die bestehenden Objekt-, Nutzer-, Vertrags-, Kosten-, Zähler- und Abrechnungsdaten um einen verbindlichen additiven Objektstandard. Vor jeder Snapshot-Erstellung wird die Abrechnungsbereitschaft zentral geprüft. Gültige Abrechnungen werden als eindeutig identifizierte, rekursiv eingefrorene und prüfsummengeschützte Snapshots gespeichert. Historische Archive bleiben fachlich unverändert und werden bei unvollständiger Rekonstruierbarkeit als `legacy-partial` gekennzeichnet.

Der Stromzähler-Dummy `electricity-dummy` kann gespeichert, exportiert, gesichert und restauriert werden, ist aber technisch und fachlich vollständig aus allen Abrechnungsberechnungen ausgeschlossen.

Die vollständige Bestandsanalyse und Architekturentscheidung steht in `OBJEKTSTANDARD_UND_ABRECHNUNGSSNAPSHOT.md`.

## Start

`index.html` in einem modernen Chromium-Browser öffnen. Für PWA- und Updatefunktionen über HTTPS oder einen lokalen Webserver bereitstellen.

## Tests

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run test:browser
```

Die Freigabe umfasst 12 JavaScript-Einheiten, 6 semantisch unveränderte Referenzfälle und 36 Playwright-/Chromium-Tests.

## Produktive Module

| Pfad | Verantwortung |
|---|---|
| `js/persistence.js` | Browser-Speicheradapter und Integrität |
| `js/migration.js` | Migrationsregistry, Pfadplanung und Transaktion |
| `js/backup-recovery.js` | Sicherungshüllen, Restore und Checkpoint |
| `js/object-standard.js` | Objektstandard, Zählerstandard und Objektvalidierung |
| `js/billing-snapshot.js` | Abrechnungsbereitschaft, Snapshot und Integrität |
| `js/archive.js` | Snapshot-Grenzen, Archivnormalisierung und Legacy-Kennzeichnung |
| `js/default-seed.js` | Ausgangsdaten |
| `js/app.js` | Zustand, Berechnung, UI und Ablaufsteuerung |

## Verbindliche Unterlagen

- `NK-PRO-PROJEKTSTAND.md`
- `NK-PRO-ARBEITSREGELN.md`
- `DATENEBENEN_UND_SNAPSHOT_GRENZEN.md`
- `MODULARISIERUNG_PERSISTENZ_MIGRATION_ARCHIV.md`
- `MIGRATIONS_SICHERUNGS_RESTORE_ROLLBACK_FUNDAMENT.md`
- `OBJEKTSTANDARD_UND_ABRECHNUNGSSNAPSHOT.md`
- `ARCHITECTURE.md`
- `TESTING.md`
- tatsächlicher Quellcode und automatisierte Tests dieser ZIP
