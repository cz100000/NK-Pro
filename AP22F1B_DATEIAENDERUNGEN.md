# AP22F1B – Tatsächliche Dateiänderungen

## Produktcode

- `index.html`: 14 statische Speicherstatus, sechs lokale Kopf-Metablöcke und die drei Kopf-Speichern-Aktionen auf Archiv, Datensicherung und Export entfernt; V99.4.35-Kennungen gesetzt.
- `js/ui-page-controller.js`: ausschließlich die statische Textaktualisierung des entfernten Speicherstatus entfernt.
- `js/ui-individual-values.js`: ausschließlich der Karten-Speicherbutton aus `manualBody()` entfernt.
- `assets/app.css`: nicht geändert.

## Referenz, Tests und Integration

- `ui-reference/index.html`: AP22F1B-Zielvarianten dokumentiert.
- vier neue AP22F1B-Testdateien ergänzt.
- `playwright.config.cjs`: separates AP22F1B-Projekt registriert.
- `package.json`/`package-lock.json`: V99.4.35, separate Testskripte und aktuelles Releasegate.

## Dokumentation und Release

Die in `AP22F1B_DATEIPOSITIVLISTE.md` benannten Vertrags-, Projekt-, Test-, Release- und Integritätsdateien wurden aktualisiert. `service-worker.js` enthält ausschließlich neue Cache-/Buildkennungen; seine Funktionslogik bleibt normalisiert hashgleich.

Keine Datei außerhalb der Positivliste wurde geändert. Temporäre Testausgaben und installierte Abhängigkeiten sind nicht Bestandteil des Release-ZIPs.
