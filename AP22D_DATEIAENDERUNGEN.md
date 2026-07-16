# AP22D – Dateiänderungen

## Produktdateien

1. `assets/app.css` – zentrale Dialogschale, Größen, Gefahrvariante, Fokusdarstellung, Responsive-Regeln und sieben Inhaltszustände.
2. `index.html` – fünf produktive Dialoge semantisch zentral markiert, zwei Filter-Leerzustände migriert sowie Build- und Assetversionierung aktualisiert.
3. `js/ui-design-system.js` – Dialog-API, Fokusfalle, Fokusrückgabe, Escape-/Hintergrundregeln, dynamische Migration und Zustands-API.
4. `js/app-runtime-config.js` – V99.4.32, AP22D-Bezeichnung und Laufzeitchangelog.
5. `service-worker.js` – Cache- und Build-ID V99.4.32/AP22D sowie versionsgebundene UI-Assets.
6. `js/service-worker-register.js` – Registrierung auf dieselbe Build-ID synchronisiert.
7. `manifest.webmanifest` – Releaseversion und Beschreibung aktualisiert.
8. `package.json` – separate AP22D-Testkommandos, Release-Gate und Paketversion.
9. `package-lock.json` – Paketname und Version synchronisiert.
10. `nk-pro-project.json` – AP22D-Metadaten, UI-Migrationsstände und Folgepaket AP22E.

## Testinfrastruktur und Nachweise

`playwright.config.cjs` wurde ausschließlich um das separate AP22D-Projekt ergänzt. Neu angelegt wurden `tests/ap22d-ui-dialogs-states.test.cjs`, `tests/ap22d-ui-dialogs-states.spec.js` und die AP22D-Arbeits-, Änderungs-, Prüf-, Release- und Abschlussnachweise. Bestehende Regressionstestdateien wurden nicht verändert.

## Zentrale Dokumentation

Aktualisiert wurden UI-Komponentenkatalog, Design-Tokens, UI-Architektur, Migrationsmatrix, UX-Guide, Projektstand, Roadmap, Changelog und Release Notes.

## Release-Integrität

`SHA256SUMS.txt` wurde nach gesonderter Nutzerfreigabe vollständig neu erzeugt. Die Datei zählt nicht zu den zehn Produktdateien.
