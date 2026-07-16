# AP22F1A – Bestätigte Datei-Positivliste

## Produktive Kernänderungen

1. `index.html` – Topbar, Kontextmarkup, 18 Seitenschalen, 18 Seitenköpfe, H1-Semantik, Build-/Assetkennung.
2. `assets/app.css` – zentrale Schalen-, Seitenkopf- und Kontextregeln einschließlich 1280/900/620 px.
3. `js/ui-design-system.js` – Registrierung von Schale, Seitenkopf und Kontextleiste; Ausschluss der Definitionslisten-Kollision.
4. `js/ui-page-controller.js` – zentrale Schalen-/Headerzuordnung und H1-Sicherung.
5. `js/navigation.js` – ausschließlich Kontextdarstellung und Provider für den vollständigen Zeitraum.
6. `js/app.js` – ausschließlich read-only Provider des formatierten Abrechnungszeitraums.

## Nicht produktive Referenz

- `ui-reference/index.html`
- `ui-reference/reference.css`

`ui-reference/reference.js` blieb mangels technischer Notwendigkeit unverändert.

## Neue Tests

- `tests/ap22f1a-global-shell.test.cjs`
- `tests/ap22f1a-page-header-matrix.test.cjs`
- `tests/ap22f1a-protected-areas.test.cjs`
- `tests/ap22f1a-global-shell.spec.js`

## Vertrags- und Projektdokumente

Aktualisiert wurden die freigegebenen Vertrags-, Architektur-, Migrations-, Test-, Projektstands-, Changelog- und Release-Notes-Dateien. Neu hinzugefügt wurden die fünf AP22F1A-Abschlussdokumente.

## Release- und Integritätsdateien

- `package.json`, `package-lock.json`, `nk-pro-project.json`
- Build-/Assetkennung in `index.html`
- `manifest.webmanifest`
- `service-worker.js` ausschließlich Cache-/Buildkennung
- `SHA256SUMS.txt`

## Vor Änderung benannte notwendige Ausnahmen

- `UI_UX_KOMPONENTENREGELN.md` – enthielt eine direkte widersprechende Modusvorgabe und musste für einen widerspruchsfreien Designvertrag angepasst werden.
- `js/app-runtime-config.js` – tatsächliche Laufzeitversion und Releasehinweis.
- `js/service-worker-register.js` – Build-ID muss mit dem Service Worker übereinstimmen.
- `playwright.config.cjs` – ausschließlich Registrierung der neuen AP22F1A-Browserspec.

Keine weitere Datei außerhalb dieser Liste wurde geändert.
