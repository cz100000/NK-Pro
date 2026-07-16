# AP22B – Datei-Positivliste vor Umsetzung

## Geplante Produktdateien (maximal 10)

1. `assets/app.css` – produktive Basiskomponenten und zentrale Layout-/Kompatibilitätsregeln auf die kanonischen `nk-ui-*`-Tokens und Komponenten ausrichten.
2. `index.html` – statische Anwendungsschale und vorhandene Grundkomponenten mit kanonischen `nk-ui-*`-Klassen ergänzen; Releasekennung erst nach bestandener Abnahme aktualisieren.
3. `js/ui-design-system.js` – zentrale, rein darstellungsbezogene Upgrade-Schnittstelle für dynamisch erzeugte Altmarkup-Grundkomponenten ergänzen.
4. `js/app-runtime-config.js` – AP22B-Modul-/Versionsmetadaten und Releasehinweis erst nach bestandener Abnahme aktualisieren.
5. `service-worker.js` – neue UI-Assets und Build-ID erst nach bestandener Abnahme aktualisieren.
6. `js/service-worker-register.js` – Build-ID mit dem tatsächlichen Release synchronisieren und die bereits vorhandene Update-Logik beibehalten.
7. `manifest.webmanifest` – Releaseversion erst nach bestandener Abnahme aktualisieren.
8. `package.json` – neue separate AP22B-Tests und Releasemetadaten ergänzen.
9. `package-lock.json` – Paketversion synchronisieren.
10. `nk-pro-project.json` – AP22B-Projektstand und UI-Migrationsversion erst nach bestandener Abnahme dokumentieren.

## Separate neue Test- und Nachweisdateien

- `tests/ap22b-ui-base-components.test.cjs`
- `tests/ap22b-ui-base-components.spec.js`
- `playwright.config.cjs` (nur Registrierung des neuen separaten Testprojekts)
- `AP22B_UI_BIBLIOTHEK_GRUNDKOMPONENTEN.md`
- `AP22B_PRUEFBERICHT.md`
- `AP22B_DATEIAENDERUNGEN.md`
- `AP22B_ABSCHLUSS.md`
- zugehörige JSON-Nachweise und Release-Summen

Bestehende Regressionstests werden nicht verändert. Dateien außerhalb dieser Liste werden nicht geändert.
