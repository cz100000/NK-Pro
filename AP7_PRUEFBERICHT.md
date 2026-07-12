# AP7-Prüfbericht – NK-Pro V99.4.8

## Bestandsanalyse

Ausgang war NK-Pro V99.4.7 mit Datenschema 5 und Datenebenenvertrag 1. Die Fachmodule aus AP1 bis AP6 waren vorhanden und wurden nicht ersetzt. `app.js` umfasste 9.030 Zeilen und 536.536 Byte. Die UI war noch über 130 Inline-Handler, sechs Listener in `app.js`, fünf globale Navigationswrapper und direkte HTML-Aufrufe an globale Funktionen gekoppelt.

## Implementierter Endstand

- `app.js`: 9.014 Zeilen, 538.680 Byte
- Inline-Handler: 130 → 0
- Listener-Quellstellen in `app.js`: 6 → 0
- gesamte Listener-Quellstellen: 18 → 13
- UI-Controller: 13
- registrierte UI-Aktionen: 99
- zentrale Ereignisarten: 5
- entfernte globale Navigationswrapper: 5
- Datenschema: unverändert 5
- Datenebenenvertrag: unverändert 1

Die leicht höhere Bytezahl von `app.js` entsteht durch explizite, lesbare Aktionskennungen und Argumentmetadaten. Controllerregister, Ereignisdelegation und Zustandsadapter liegen außerhalb von `app.js`; die Zeilenzahl des Monolithen wurde trotz vollständiger Umstellung reduziert.

## Prüfumfang

- JavaScript-Syntax aller produktiven Einheiten
- semantische Referenz-Fixtures
- AP5-Zählerdomänen-, Migrations-, Messperioden-, Wechsel- und Dummy-Ausschlusstests
- AP6-Architektur- und Berechnungsschutz
- AP7-Controller-, Ereignis-, Zustands- und Modulgrenzentests
- Release-, PWA- und App-Shell-Konsistenz
- Browser-Smoke, Navigation, Formulare und Dialoge
- Referenzabrechnungen
- Objektstandard und Snapshot 1/2
- Persistenz, Backup, Restore, Rollback und Migration
- Dokumentdaten, Brief-HTML, Druck und Export

## Ergebnis

Alle statischen Prüfungen sind erfolgreich: 28 JavaScript-Einheiten, 6 Referenz-Fixtures, AP5-Zählerdomäne, AP6-Architektur, AP7-UI-Architektur und Release-Konsistenz. Die 41 Browserfälle wurden in vollständig abgeschlossenen Testsuite-Gruppen mit 41/41 Erfolgen geprüft. Der kombinierte Playwright-Aufruf wurde in der Bearbeitungsumgebung zusätzlich versucht, blieb dort jedoch nach erfolgreichen Teilgruppen beim Prozessabschluss hängen; dies änderte keine Einzelergebnisse.

Berechnungsergebnisse, Rundungen, Vorauszahlungen, Nachzahlungen/Guthaben, Snapshot-Grenzen, Dokumentwerte, Exporte und Stromzähler-Dummy-Ausschluss sind unverändert.

## Bekannte Grenzen

- Die klassischen Top-Level-Funktionen in `app.js` sind im bisherigen Script-Modell weiterhin global sichtbar.
- Viele Orchestrierungsfunktionen greifen intern noch direkt auf `state` zu.
- Navigation und Tabellenhilfen besitzen weiterhin kleine, begründete UI-eigene Listener.
- Die 112 AP6-Kompatibilitätswrapper bleiben für bestehende Tests und interne Aufrufpfade erhalten.
- AP11-Navigationsdesign, allgemeine UX-Überarbeitung und CSS-Bereinigung wurden bewusst nicht umgesetzt.
