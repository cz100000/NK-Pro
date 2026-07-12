# AP8-Prüfbericht – NK-Pro V99.4.9

## Bestandsanalyse

Ausgangsbasis war V99.4.8 mit 9.014 Zeilen und 654 Top-Level-Funktionen in `app.js`, 13 UI-Controllern und 99 UI-Aktionen. Die statischen Ausgangstests waren vollständig erfolgreich. Die anfängliche Browserausführung war ausschließlich wegen eines fehlenden Playwright-Browserbinaries blockiert.

## Änderungen

- neues Modul `js/application-actions.js`
- UI-Kernaktionen für Objekt, Abrechnung, Zähler, Zustand und Anwendung an diese Schicht angebunden
- `NKProStateAccess.transact()` mit Rollback, optionaler Validierung, einfachem Commit und einfachem Rendering
- Script-Ladefolge und PWA-App-Shell erweitert
- AP8-Architekturtest ergänzt
- Release auf V99.4.9 aktualisiert

## Grenzen

Die 654 vorhandenen Top-Level-Funktionen wurden vollständig inventarisiert. In AP8 wurde keine riskante mechanische Massenauslagerung vorgenommen. Eine neue Konfigurationsfunktion kam hinzu; damit verbleiben 655 Funktionsdeklarationen. Die direkte `state`-Zugriffszahl in `app.js` blieb bei 640 Referenzen beziehungsweise 234 heuristisch erkannten Schreibzugriffen. Die wesentliche Verbesserung ist die neue kontrollierte Eintrittsgrenze aus der UI und der atomare Transaktionspfad.

## Regression

Die Referenzfixtures blieben byteinhaltlich unverändert. Kosten-, Zähler-, Snapshot-, Migrations-, Restore-, Dokument- und Exportfachlogik wurde nicht dupliziert oder fachlich verändert.

## Testergebnis

Erfolgreich: JavaScript-Syntax (29 Einheiten), sechs Referenzfixtures, Zählerdomain, AP6-/AP7-/AP8-Architekturtests und Release-Konsistenz. Die 41 Playwright-Browsertests konnten in der Ausführungsumgebung nicht gestartet werden, weil das Chromium-Binary fehlte und der Download wegen DNS-/Netzwerkfehler `EAI_AGAIN cdn.playwright.dev` nicht möglich war. Es lag kein fachlicher Testfehler vor; diese Grenze ist ausdrücklich offen dokumentiert.
