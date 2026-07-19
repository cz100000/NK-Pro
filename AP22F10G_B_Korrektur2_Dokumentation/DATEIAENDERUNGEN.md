# Dateiänderungen AP22F10G-B Korrektur 2

## Produktdateien

- `index.html`: Seitenschale von `default` auf `wide`, Releaseversion V99.4.60
- `assets/app.css`: Desktop-Spaltenlayout ohne Horizontal-Scroll; responsiver interner Scroll unterhalb 980 px
- `js/app-runtime-config.js`: Versions- und Änderungsinformationen
- `js/service-worker-register.js`: Build-ID
- `service-worker.js`: Cache- und Build-ID
- `manifest.webmanifest`: Versions- und Releasebeschreibung
- `nk-pro-project.json`: Release- und Korrekturmetadaten
- `package.json`: Releaseversion und neue Prüfskripte
- `package-lock.json`: Versionsmetadaten

## Prüfdateien

- `tests/ap22f10g-individual-values.test.cjs`
- `tests/ap22f10g-individual-values-browser.test.cjs`
- `tests/ap22f10g-korrektur1.test.cjs`
- `tests/ap22f10g-korrektur1-browser.test.cjs`
- `tests/ap22f10g-korrektur2.test.cjs` neu
- `tests/ap22f10g-korrektur2-browser.test.cjs` neu

## Nicht geändert

- Datenmodell und Datenschema
- Persistenz- und Migrationslogik
- Verbrauchs- und Kostenberechnung
- Eingabewerte des Nutzers
- Vorjahresübernahme und Sonderfallfreigabe
