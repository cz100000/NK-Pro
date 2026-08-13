# Regressionsbericht – V99.4.71

## Bestandene Prüfgruppen

- JavaScript-Syntax: 62 Einheiten fehlerfrei.
- Referenz-Fixtures: 6 Fälle semantisch unverändert.
- Zähler-/Messlogik: Migration, IDs, Messwerte, Messperioden, Zuordnungen, Asset-Refresh bestanden.
- Architektur: Modularisierung, UI-Controller/Aktionsregister, Anwendungsaktionen, Orchestrierung, Archiv-/Jahresdiagnostik, Dokumentlayout, Regelprüfung und zentrale Navigation bestanden.
- AP22F11B Korrektur 4 statisch bestanden.
- AP22F12 Kosten-/Umlagenabgleich statisch und fachlich bestanden.
- V99.4.67 Zähler-/Archivregression bestanden.
- V99.4.68 Teilnehmer-/Privatlogik bestanden.
- V99.4.69 UI-/Archivregression bestanden.
- V99.4.70 Analysezentrum und Korrektur-2-Kontextschutz bestanden.
- V99.4.71 Fach-/UI-Vertragsprüfung bestanden.
- V99.4.71 Chromium/CDP: 33/33 Checks, einschließlich 17-Seiten-Navigationssmoke, bestanden.
- Release-Inhaltsprüfung: 652 Dateien geprüft, bestanden.

## Legacy-Playwright-Hinweis

Die schlanke technische Ausgangsbasis enthält weder `playwright` noch `@playwright/test`. Deshalb können ältere Playwright-Skripte in genau dieser schlanken Umgebung ohne Nachinstallation nicht ausgeführt werden. Es wurden bewusst keine externen Abhängigkeiten nachinstalliert. Für V99.4.71 wurde der bereits projektseitig vorhandene direkte Chromium/CDP-Weg ausgebaut und erfolgreich ausgeführt. Produktive Abrechnungs-, Archiv-, Zähler-, Persistenz- und Dokumentmodule wurden außerhalb der Analyse-/Versionsintegration nicht geändert.
