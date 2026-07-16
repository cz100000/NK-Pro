# AP22B – Dateiänderungen

## Produktdateien

1. `assets/app.css` – zentrale produktive Regeln für Buttons, Felder, Karten, Klappboxen, Status und Hinweise.
2. `index.html` – kontrollierter Migrationsbereich, statische Accordion-/Statusklassen sowie Build- und Assetversionierung.
3. `js/ui-design-system.js` – zentrale Upgrade-, Beobachtungs- und Statusnormalisierungsschnittstelle.
4. `js/app-runtime-config.js` – V99.4.30, AP22B-Bezeichnung und Laufzeitchangelog.
5. `service-worker.js` – Cache- und Build-ID V99.4.30/AP22B sowie versionsgebundenes CSS.
6. `js/service-worker-register.js` – Registrierung auf dieselbe aktuelle Build-ID synchronisiert.
7. `manifest.webmanifest` – Releaseversion V99.4.30.
8. `package.json` – AP22B-Test- und Releasekommandos sowie Paketversion.
9. `package-lock.json` – Paketversion synchronisiert.
10. `nk-pro-project.json` – AP22B-Projektmetadaten und nächstes Paket AP22C.

## Test- und Nachweisdateien

Neu angelegt wurden separate AP22B-Tests und AP22B-Nachweise. `playwright.config.cjs` wurde ausschließlich um das neue AP22B-Testprojekt ergänzt. Bestehende Regressionstests wurden nicht verändert.
