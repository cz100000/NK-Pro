# NK-Pro V99.4.3

Lokale, frameworkfreie Browseranwendung zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.3 |
| Versionsname | Modularisierung von Persistenz, Migration und Archiv |
| Datenschema | 5 – unverändert |
| Datenebenenvertrag | 1 – unverändert |
| Ausgangsversion | V99.4.2 |
| Technik | HTML, CSS, JavaScript; kein Framework, kein Buildsystem |
| PWA-Cache | `nk-pro-v99-4-3` |

V99.4.3 trennt die technische Kernlogik für Browser-Persistenz und Integrität, Schemamigration sowie Archiv- und Snapshot-Projektion aus `js/app.js` heraus. Eine kleine Kompatibilitätsschicht erhält die bestehenden globalen Funktionen. Fachberechnung, Oberfläche, Datenschema 5, Datenebenenvertrag 1, Snapshot-Grenzen und Austauschformate bleiben unverändert.

## Änderungen gegenüber V99.4.2

- `js/persistence.js` bündelt Prüfsumme, Integritätsmetadaten und sämtliche direkten `localStorage`-Zugriffe,
- `js/migration.js` kapselt Schemaversionsprüfung, Migrationshistorie, Schema-5-Migration und Altarchivübernahme,
- `js/archive.js` kapselt Snapshot-Projektion, Archivnormalisierung und Durchsetzung des Datenebenenvertrags,
- bestehende globale Aufrufe in `js/app.js` delegieren über eine kleine Kompatibilitätsschicht,
- eindeutige produktive Skriptreihenfolge und vollständiger PWA-App-Shell für alle Module,
- neue statische und browserbasierte Modultests,
- keine optischen oder allgemeinen UI-Änderungen,
- keine Änderung an Datenbeständen, Berechnungslogik, Backups, Recovery oder Import-/Exportformaten.

Analyse, Variantenvergleich, Rückweg und Teststrategie stehen in `MODULARISIERUNG_PERSISTENZ_MIGRATION_ARCHIV.md`. Der unveränderte Datenebenenvertrag steht in `DATENEBENEN_UND_SNAPSHOT_GRENZEN.md`.

## Start

Direkt: `index.html` in einem modernen Browser öffnen. Für PWA und Offline-Cache einen lokalen Webserver verwenden:

```bash
npm ci
node tools/static-server.cjs
```

## Tests

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run test:browser
```

`npm test` führt alle Prüfgruppen aus. Playwright benötigt einen installierten Chromium-Browser oder `CHROMIUM_EXECUTABLE_PATH`.

## Projektstruktur

| Pfad | Inhalt |
|---|---|
| `index.html` | statische Anwendungsstruktur und verbindliche Skriptreihenfolge |
| `assets/app.css` | Bildschirm-, Responsive- und Druckdarstellung |
| `js/persistence.js` | Browser-Speicheradapter und Integritätsschutz |
| `js/migration.js` | Schemamigration und Altarchivübernahme |
| `js/archive.js` | Snapshot-Grenzen, Archivnormalisierung und Datenvertrag |
| `js/default-seed.js` | Ausgangsdaten, getrennt von der Fachlogik |
| `js/app.js` | zentraler Zustand, Fachlogik, UI-Orchestrierung, Briefe und Export; Kompatibilitätsfassaden für die drei Module |
| `js/navigation.js` | Navigation und Arbeitskontext |
| `js/modal-events.js` | globale Modalereignisse |
| `tests/module-boundaries.spec.js` | Lade-, Schnittstellen- und Kompatibilitätsprüfung der Module |
| `testdaten/basis/` | eine vollständige Referenzbasis |
| `testdaten/faelle/` | kleine Abweichungspatches |
| `tests/fixture-loader.cjs` | reproduzierbarer Aufbau der logischen Referenzfälle |

## Für die Weiterentwicklung verbindlich

- `NK-PRO-PROJEKTSTAND.md`
- `NK-PRO-ARBEITSREGELN.md`
- `DATENEBENEN_UND_SNAPSHOT_GRENZEN.md`
- `MODULARISIERUNG_PERSISTENZ_MIGRATION_ARCHIV.md`
- tatsächlicher Quellcode und automatisierte Tests dieser ZIP

Historische Dokumente bleiben als Historiennachweis erhalten, sind aber keine aktuelle technische Grundlage.
