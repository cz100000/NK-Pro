# NK-Pro V99.4.4

Lokale, frameworkfreie Browseranwendung zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.4 |
| Versionsname | Migrations-, Sicherungs-, Restore- und Rollback-Fundament |
| Datenschema | 5 – unverändert |
| Datenebenenvertrag | 1 – unverändert |
| Ausgangsversion | V99.4.3 |
| Technik | HTML, CSS, JavaScript; kein Framework, kein Buildsystem |
| PWA-Cache | `nk-pro-v99-4-4` |

V99.4.4 ergänzt die in V99.4.3 getrennten Persistenz-, Migrations- und Archivmodule um ein belastbares Sicherungs- und Restore-Fundament. Migrationen werden über eine zentrale Registry geplant, auf einer Kopie ausgeführt und vor sowie nach jedem Schritt validiert. Vor notwendigen Migrationen wird ein vollständiger, eindeutig identifizierter und prüfsummengeschützter Ausgangsstand erzeugt und im vorhandenen Sicherungsbereich zum externen Download bereitgestellt.

Datenschema 5, Datenebenenvertrag 1, Snapshot-Grenzen, Fachberechnung und allgemeine Oberfläche bleiben unverändert.

## Änderungen gegenüber V99.4.3

- `js/migration.js` besitzt eine eingefrorene Registry für die Pfade `1→2`, `2→4`, `3→4` und `4→5`,
- Migrationen laufen transaktional auf Datenkopien und übernehmen Ergebnisse nur nach vollständiger Validierung,
- `js/backup-recovery.js` erzeugt, prüft, persistiert und restauriert Sicherungshüllen,
- Vor-Migrationssicherungen enthalten eindeutige IDs, unveränderliche Metadaten und drei Prüfsummenebenen,
- der bestehende Sicherungsbereich bietet Download, Restore und Rücknahme des letzten Restore-Vorgangs,
- extern heruntergeladene Sicherungshüllen sind über den vorhandenen JSON-Import validiert wiederherstellbar,
- Restore erzeugt vorher einen getrennten Checkpoint,
- Archiv-JSON-Dateien werden vor der Bestätigung nur gestaged und validiert,
- direkte Browser-Speicherzugriffe bleiben ausschließlich in `js/persistence.js`,
- PWA-App-Shell, Tests, Dokumentation und Versionsangaben wurden auf V99.4.4 aktualisiert.

Die vollständige Analyse und der Rückweg stehen in `MIGRATIONS_SICHERUNGS_RESTORE_ROLLBACK_FUNDAMENT.md`.

## Start

`index.html` in einem modernen Chromium-Browser öffnen. Für PWA- und Updatefunktionen die Dateien über HTTPS oder einen lokalen Webserver bereitstellen.

## Tests

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
npm run test:browser
```

Mit einem vorhandenen System-Chromium:

```bash
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run test:browser
```

Die Freigabeprüfung umfasst 10 JavaScript-Einheiten, 6 semantisch identische Referenzfälle und 28 Playwright-/Chromium-Tests.

## Projektstruktur

| Pfad | Verantwortung |
|---|---|
| `index.html` | statische Oberfläche und definierte Skriptreihenfolge |
| `assets/app.css` | produktive Styles |
| `js/persistence.js` | Browser-Speicheradapter und Integrität |
| `js/migration.js` | Migrationsregistry, Pfadplanung und Transaktion |
| `js/backup-recovery.js` | Sicherungshüllen, Restore und Checkpoint-Grundlage |
| `js/archive.js` | Snapshot-Projektion, Archivnormalisierung und Datenvertrag |
| `js/default-seed.js` | Ausgangsdaten |
| `js/app.js` | Zustand, Fachlogik, UI- und Ablaufsteuerung |
| `tests/` | Browser-, Migrations-, Restore- und Regressionstests |
| `tools/` | Syntax-, Fixture- und Releaseprüfungen |

## Verbindliche Projektunterlagen

- `NK-PRO-PROJEKTSTAND.md`
- `NK-PRO-ARBEITSREGELN.md`
- `DATENEBENEN_UND_SNAPSHOT_GRENZEN.md`
- `MODULARISIERUNG_PERSISTENZ_MIGRATION_ARCHIV.md`
- `MIGRATIONS_SICHERUNGS_RESTORE_ROLLBACK_FUNDAMENT.md`
- `TESTING.md`
- tatsächlicher Quellcode und automatisierte Tests dieser ZIP

Historische Dokumente bleiben als Nachweis erhalten, sind aber keine aktuelle technische Grundlage.
