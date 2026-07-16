# AP22C – Datei-Positivliste vor Umsetzung

## Geplante Produktdateien (maximal 10)

1. `assets/app.css` – zentrale produktive Tabellen-, Listen- und Tabellenwerkzeug-Komponenten auf Basis der `nk-ui-*`-Tokens ergänzen.
2. `index.html` – vorhandene statische Tabellencontainer und tabellenbezogene Werkzeugleisten mit kanonischen Klassen markieren; Releasekennung erst nach bestandener Abnahme aktualisieren.
3. `js/ui-design-system.js` – zentrale, rein darstellungsbezogene Migration für Tabellen, Listen und Tabellenwerkzeuge ergänzen.
4. `js/app-runtime-config.js` – AP22C-Modul-/Versionsmetadaten und Releasehinweis erst nach bestandener Abnahme aktualisieren.
5. `service-worker.js` – Build-ID und versionsgebundene UI-Assets erst nach bestandener Abnahme aktualisieren.
6. `js/service-worker-register.js` – Build-ID mit dem tatsächlichen Release synchronisieren.
7. `manifest.webmanifest` – Releaseversion erst nach bestandener Abnahme aktualisieren.
8. `package.json` – neue separate AP22C-Tests und Releasemetadaten ergänzen.
9. `package-lock.json` – Paketversion synchronisieren.
10. `nk-pro-project.json` – AP22C-Projektstand, Tabellen-/Listenmigration und Folgepaket dokumentieren.

## Testinfrastruktur und neue Nachweise

- `playwright.config.cjs` – ausschließlich Registrierung des neuen separaten AP22C-Testprojekts.
- `tests/ap22c-ui-tables-lists.test.cjs`
- `tests/ap22c-ui-tables-lists.spec.js`
- `AP22C_UI_BIBLIOTHEK_TABELLEN_UND_LISTEN.md`
- `AP22C_PRUEFBERICHT.md`
- `AP22C_DATEIAENDERUNGEN.md`
- `AP22C_DATEIAENDERUNGEN.json`
- `AP22C_TEST_RESULTS.json`
- `AP22C_RELEASE_CONTENT_POLICY.json`
- `AP22C_ABSCHLUSS.md`

## Bestehende Projektdokumentation

- `UI_KOMPONENTENKATALOG.md` – neue Listenkomponente und AP22C-Status ergänzen.
- `UI_MIGRATIONSMATRIX.md` – Tabellen, Listen und tabellenbezogene Werkzeuge als migriert kennzeichnen.
- `ROADMAP.md` – AP22B/AP22C-Fortschritt und Folgepaket ergänzen.

Bestehende Regressionstests werden nicht verändert. Dateien außerhalb dieser Liste werden nicht geändert.
