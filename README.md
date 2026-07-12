# NK-Pro V99.4.7

Lokale, frameworkfreie Browseranwendung zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.7 |
| Versionsname | Weitere fachliche Modularisierung |
| Datenschema | 5 – unverändert |
| Datenebenenvertrag | 1 – unverändert |
| Objektstandard | 1 – unverändert |
| Zähler-/Messstandard | 1 – unverändert |
| Abrechnungssnapshot | 2; historische Version 1 weiterhin lesbar |
| Ausgangsversion | V99.4.6 |
| Architekturversion | 1 |
| Kompatibilitätsschicht | 1 |
| Technik | HTML, CSS, JavaScript; kein Framework, kein Buildsystem |
| PWA-Cache | `nk-pro-v99-4-7` |

V99.4.7 trennt zentrale Abrechnungsberechnung, fachliche Dokumentdaten, Brief-HTML, Exporttechnik, Tabellenhilfen, UI-Präferenzen und Startorchestrierung aus `app.js`. Der Monolith wurde von 10.248 auf 9.030 Zeilen reduziert. 112 bisherige globale Funktionsnamen bleiben als reine Einzeilen-Weiterleitungen kompatibel.

Datenschema, Datenebenenvertrag, Objektstandard, Zählerstandard, Snapshotformat, Speicherformate und bestehende Berechnungsergebnisse bleiben unverändert. Der Stromzähler-Dummy bleibt vollständig gespeichert und zentral aus allen Abrechnungswerten ausgeschlossen.

## Start

`index.html` in einem modernen Chromium-Browser öffnen. Für PWA- und Updatefunktionen über HTTPS oder einen lokalen Webserver bereitstellen.

## Tests

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

## Neue AP6-Module

| Pfad | Verantwortung |
|---|---|
| `js/billing-calculation.js` | Kostenverteilung, Verbrauch, Vorauszahlungen, Salden und Vorauszahlungsanpassung |
| `js/document-data.js` | fachliche Brief-, Prüf- und Dokumentdaten |
| `js/document-renderer.js` | Brief- und Druck-HTML ohne eigene Fachberechnung |
| `js/export-service.js` | Dateinamen, JSON/CSV und Downloads |
| `js/ui-table-tools.js` | Tabellenfilter, Sortierung und Werkzeuge |
| `js/ui-preferences.js` | nicht fachliche Navigationseinstellungen |
| `js/app-bootstrap.js` | benannter und prüfbarer Anwendungsstart |
| `js/compatibility.js` | Registry der globalen Kompatibilitätswrapper |

Die vollständige Modulübersicht steht in `MODULE_UEBERSICHT.md`.

## Verbindliche AP6-Unterlagen

- `AP6_WEITERE_FACHLICHE_MODULARISIERUNG.md`
- `AP6_PRUEFBERICHT.md`
- `MODULE_UEBERSICHT.md`
- `VERANTWORTLICHKEITSMATRIX.md`
- `ABHAENGIGKEITSUEBERSICHT.md`
- `KOMPATIBILITAETSSCHICHT.md`
- `ANWENDUNGSSTART.md`
- `GLOBALE_SCHNITTSTELLEN_INVENTAR.md`
- `ARCHITECTURE.md`
- `TESTING.md`
