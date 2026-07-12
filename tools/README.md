# NK-Pro V99.4.2

Lokale, frameworkfreie Browseranwendung zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.2 |
| Versionsname | Verbindliche Datenebenen und Snapshot-Grenzen |
| Datenschema | 5 – unverändert |
| Datenebenenvertrag | 1 |
| Ausgangsversion | V99.4.1 |
| Technik | HTML, CSS, JavaScript; kein Framework, kein Buildsystem |
| PWA-Cache | `nk-pro-v99-4-2` |

V99.4.2 trennt aktuelle Arbeitsdaten, Objektstammdaten, globale Historie, Jahresarchive, Gesamtsicherung und Recovery durch verbindliche Datenverträge. Fachberechnung, Referenzdaten und Datenschema bleiben unverändert; es wurden keine optischen oder allgemeinen UI-Änderungen vorgenommen.

## Änderungen gegenüber V99.4.1

- expliziter Datenebenenvertrag für Arbeitsstand, Abrechnungssnapshot, Archiv, Vollbackup und Recovery,
- feste erlaubte Feldmenge für Abrechnungs- und Archivsnapshots,
- keine verschachtelten Jahresarchive, Stammdatenvollkopien, globale Zählerhistorien oder technischen Speicher-/Recovery-Metadaten in Snapshots,
- idempotente Bereinigung vorhandener Archivstände beim Laden und Speichern,
- Wiederbearbeitung eines Archivs erhält aktuelle Objektstammdaten, globale Historie und das vollständige Jahresarchiv,
- Gesamtbackup enthält alle fachlichen Ebenen, aber keinen Recovery-Stand,
- Abrechnungs-JSON enthält nur abrechnungsbezogene Daten,
- bestehende Ladeabhängigkeit in `js/default-seed.js` ohne Datenänderung beseitigt.

Die verbindliche Analyse, Alternativen, Grenzen, Migration und Teststrategie stehen in `DATENEBENEN_UND_SNAPSHOT_GRENZEN.md`.

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
npm run test:browser
```

`npm test` führt alle Prüfgruppen aus.

## Projektstruktur

| Pfad | Inhalt |
|---|---|
| `index.html` | statische Anwendungsstruktur |
| `assets/app.css` | Bildschirm-, Responsive- und Druckdarstellung |
| `js/default-seed.js` | Ausgangsdaten, getrennt von der Fachlogik |
| `js/app.js` | Fach-, Daten-, Persistenz-, Archiv-, Render-, Brief- und Exportlogik |
| `js/navigation.js` | Navigation und Arbeitskontext |
| `js/modal-events.js` | globale Modalereignisse |
| `testdaten/basis/` | eine vollständige Referenzbasis |
| `testdaten/faelle/` | kleine Abweichungspatches |
| `tests/fixture-loader.cjs` | reproduzierbarer Aufbau der logischen Referenzfälle |
| `tools/check-fixtures.cjs` | Prüfsummenprüfung |
| `tools/materialize-fixtures.cjs` | optionale Erzeugung vollständiger Testdateien |

## Für die Weiterentwicklung verbindlich

- `NK-PRO-PROJEKTSTAND.md`
- `NK-PRO-ARBEITSREGELN.md`
- `DATENEBENEN_UND_SNAPSHOT_GRENZEN.md`
- tatsächlicher Quellcode und automatisierte Tests dieser ZIP

Historische Dokumente bleiben als Historiennachweis erhalten, sind aber keine aktuelle technische Grundlage.
