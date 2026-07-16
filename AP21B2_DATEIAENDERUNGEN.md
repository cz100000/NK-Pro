# AP21B2 – Dateiänderungen

## Produktdateien

1. `index.html` – statische Menüduplikation durch neutrales Render-Ziel ersetzt; Versionsangabe aktualisiert.
2. `js/navigation.js` – zentrale Navigationsdefinition, Renderer und lesende Diagnoseschnittstelle ergänzt.
3. `js/diagnostics.js` – Navigationsprüfung auf zentrale Definition umgestellt.
4. `js/app-runtime-config.js` – Laufzeitversion V99.4.27.
5. `service-worker.js` – Cache- und Buildkennung V99.4.27.
6. `manifest.webmanifest` – PWA-Version V99.4.27.
7. `package.json` – Paketversion und separate AP21B2-Testbefehle.
8. `package-lock.json` – Paketmetadaten synchronisiert.
9. `nk-pro-project.json` – Projekt- und Navigationsstrukturversion aktualisiert.

Bestehende Regressionstests wurden nicht verändert.

## Freigegebenes Prüfwerkzeug

- `tools/check-release-consistency.cjs` – Releaseprüfung auf V99.4.27/AP21B2 und die zentrale Navigationsdefinition umgestellt.
