# AP22F1C – Dateiänderungen

## Produktdateien

| Datei | Änderung |
|---|---|
| `assets/app.css` | Eine spezifische Regel blendet `dialog.nk-ui-dialog:not([open])` aus. |
| `index.html` | Zentrales Versionslabel `[data-app-version]`, aktueller Fallback V99.4.36 sowie Build-/Assetkennungen. |
| `js/ui-page-controller.js` | Zentrale UI-Aktualisierung setzt markierte Versionslabels aus `APP_VERSION`. |
| `js/app-runtime-config.js` | V99.4.36, AP22F1C-Bezeichnung und Changelog-Eintrag. |
| `js/service-worker-register.js` | Build-ID V99.4.36/AP22F1C. |
| `service-worker.js` | Ausschließlich Cache- und Buildkennung aktualisiert. |
| `manifest.webmanifest` | PWA-Version und Beschreibung aktualisiert. |
| `nk-pro-project.json` | Release-, Cache-, Build- und Korrekturmetadaten aktualisiert. |

## Tests und Integration

- `tests/ap22f1c-dialog-version-regression.test.cjs` neu.
- `tests/ap22f1c-dialog-version-regression.spec.js` neu.
- `playwright.config.cjs` um das separate AP22F1C-Projekt ergänzt.
- `package.json` und `package-lock.json` auf V99.4.36 sowie aktuelle Testskripte aktualisiert.

## Referenz und Dokumentation

Aktualisiert beziehungsweise ergänzt wurden ausschließlich die in `AP22F1C_DATEIPOSITIVLISTE.md` benannten Referenz-, Projekt-, Vertrags-, Test-, Änderungs-, Prüf- und Releaseunterlagen sowie `SHA256SUMS.txt`.

Es wurde keine Datei außerhalb der Positivliste verändert.
