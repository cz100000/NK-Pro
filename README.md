<!-- AP10-CURRENT -->
# NK-Pro V99.4.11 – Physisch extrahierte Archiv-, Jahreswechsel-, Qualitäts- und Diagnoseorchestrierung

V99.4.11 extrahiert 79 Implementierungen physisch aus `js/app.js` in `archive-actions.js`, `year-transition-actions.js`, `quality-assurance.js` und `diagnostics.js`. `app.js` umfasst nun 6.292 Zeilen statt 8.287. Schreibende AP10-Aktionen sind atomar; lesende Prüfungen sind nachgewiesen seiteneffektfrei. Verbindliche Details: `AP10_PHYSISCHE_ARCHIV_JAHRESWECHSEL_QUALITAET_DIAGNOSEORCHESTRIERUNG.md`, `AP10_PRUEFBERICHT.md` und `AP10_FUNKTIONSINVENTAR.md`.

<!-- AP9-HISTORIC -->
# NK-Pro V99.4.10 – Physisch extrahierte Kernorchestrierung

V99.4.10 extrahiert Stammdaten-, Kosten- und laufende Abrechnungsorchestrierung physisch aus `js/app.js` in `master-data-actions.js`, `cost-actions.js` und `billing-workflow.js`. Die Anwendung bleibt eine statische lokale HTML/CSS/JavaScript-PWA ohne Framework oder Buildsystem. Verbindliche Details: `AP9_PHYSISCHE_KERNORCHESTRIERUNG.md`, `AP9_PRUEFBERICHT.md` und `AP9_EXTRAKTIONSINVENTAR.md`.

# NK-Pro V99.4.9

Lokale, frameworkfreie Browseranwendung zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen.

V99.4.9 führt eine zentrale Ereignisdelegation, 13 UI-Controller mit 99 Aktionen und einen kontrollierten Zustandsadapter ein. Sämtliche 130 Inline-Handler wurden entfernt. Die Fachmodule aus AP1 bis AP6, Datenschema 5, Datenebenenvertrag 1 und alle Abrechnungsergebnisse bleiben unverändert.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.9 |
| Versionsname | Modularisierte Anwendungsaktionen und fachliche Orchestrierung |
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
