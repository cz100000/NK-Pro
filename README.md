# NK-Pro V99.4.1

Lokale, frameworkfreie Browseranwendung zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.1 |
| Versionsname | ChatGPT-Arbeitsbasis und Testdatenstruktur |
| Datenschema | 5 – unverändert |
| Ausgangsversion | V99.4.0 |
| Technik | HTML, CSS, JavaScript; kein Framework, kein Buildsystem |
| PWA-Cache | `nk-pro-v99-4-1` |

V99.4.1 ändert keine Fachberechnung, keine Datenfelder, keine Migration und keine Import-/Exportformate. Die Version reduziert ausschließlich den Analyseballast und verbessert die technische Prüfbarkeit.

## Änderungen gegenüber V99.4.0

- großer eingebetteter SEED aus `js/app.js` nach `js/default-seed.js` verschoben,
- sechs vollständige Referenzdatensätze durch eine Basis plus fünf kleine Patches ersetzt,
- semantische Prüfsummen für alle sechs logischen Referenzfälle ergänzt,
- Materialisierungswerkzeug für vollständige Testdateien ergänzt,
- historische Prüfberichte und überholte Arbeitsdokumente aus der aktiven Arbeits-ZIP ausgelagert,
- kompakter Projektstand und verbindliche Arbeitsregeln ergänzt.

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

`npm test` führt alle drei Prüfgruppen aus.

## Projektstruktur

| Pfad | Inhalt |
|---|---|
| `index.html` | statische Anwendungsstruktur |
| `assets/app.css` | Bildschirm-, Responsive- und Druckdarstellung |
| `js/default-seed.js` | unveränderte Ausgangsdaten, getrennt von der Fachlogik |
| `js/app.js` | Fach-, Daten-, Archiv-, Render-, Brief- und Exportlogik |
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
- tatsächlicher Quellcode und automatisierte Tests dieser ZIP

Historische Dokumente wurden nicht gelöscht, sondern in einer separaten Archiv-ZIP bereitgestellt.
