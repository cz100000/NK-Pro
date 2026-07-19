# AP22F11B Korrektur 1 – Dateiänderungen

## Produktive Dateien

- `index.html` – zusammengeführte Seitenstruktur, neue Abschnittsnummerierung, Vermietersummenbereich, versioniertes Ergebnis-Asset.
- `assets/app.css` – Zahlen-/Betragsausrichtung, Gruppenlayout, Vermietersumme und responsive Such-/Filterdarstellung.
- `js/ui-billing-allocation.js` – gemeinsame Projektion von Vermieterpositionen und Differenzen, Gruppierung, Filterung, Summenbildung und Detaildialog.
- `js/ui-bindings.js` – eigene Schließen-Aktion für den Prüfdetaildialog.
- `js/app-runtime-config.js` – Version und Änderungsprotokoll.
- `js/service-worker-register.js` – neue Build-ID.
- `service-worker.js` – neue Cache-/Build-ID und versioniertes Ergebnis-Asset.
- `manifest.webmanifest`, `nk-pro-project.json`, `package.json`, `package-lock.json` – Release- und Versionsmetadaten.
- `tools/check-release-contents.cjs` – die Inhaltsprüfung erkennt die inzwischen reguläre AP22F-Release-Dokumentation als zulässigen Bestandteil.

## Tests

- `tests/ap22f11b-billing-result.test.cjs`
- `tests/ap22f11b-billing-result-browser.test.cjs`
- `tests/ap22f11b-korrektur1.test.cjs`
- `tests/ap22f11b-korrektur1-browser.test.cjs`
- `tests/ap20-asset-refresh-regression.test.cjs` – Build-ID wird aus dem Projektmanifest gelesen und prüft nun auch das geänderte Ergebnis-Asset.

## Nachweise

- acht erneuerte AP22F11B-Browser-Screenshots,
- zwei zusätzliche Korrektur-Screenshots,
- aktualisiertes Browser-Prüfergebnis,
- Echtdaten-Verifikation,
- Abschluss-, Umsetzungs-, Test-, Migrations- und Erhaltungsberichte.

Die maschinenlesbare vollständige Liste mit SHA256-Werten befindet sich in `AP22F11B_KORREKTUR1_DATEIAENDERUNGEN.json`.
