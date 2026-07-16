# AP22C – Dateiänderungen

## Produktdateien

1. `assets/app.css` – zentrale produktive Regeln für Tabellencontainer, Tabellen, Listen und tabellenbezogene Werkzeugleisten.
2. `index.html` – statische Tabellen, Tabellencontainer, Faktenliste und tabellenbezogene Werkzeugleisten zentral markiert; Build- und Assetversionierung aktualisiert.
3. `js/ui-design-system.js` – dynamische Migration, Variantenbestimmung, Dokumentausschluss und semantische Tabellenköpfe ergänzt.
4. `js/app-runtime-config.js` – V99.4.31, AP22C-Bezeichnung und Laufzeitchangelog.
5. `service-worker.js` – Cache- und Build-ID V99.4.31/AP22C sowie versionsgebundene UI-Assets.
6. `js/service-worker-register.js` – Registrierung auf dieselbe aktuelle Build-ID synchronisiert.
7. `manifest.webmanifest` – Releaseversion V99.4.31.
8. `package.json` – AP22C-Test- und Releasekommandos sowie Paketversion.
9. `package-lock.json` – Paketversion synchronisiert.
10. `nk-pro-project.json` – AP22C-Projektmetadaten und nächstes Paket AP22D.

## Test- und Nachweisdateien

Neu angelegt wurden separate AP22C-Tests und AP22C-Nachweise. `playwright.config.cjs` wurde ausschließlich um das neue AP22C-Testprojekt ergänzt. Bestehende Regressionstests wurden nicht verändert.

## Projektdokumentation

`UI_KOMPONENTENKATALOG.md`, `UI_MIGRATIONSMATRIX.md` und `ROADMAP.md` wurden auf den tatsächlich umgesetzten AP22C-Stand aktualisiert.
