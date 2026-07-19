# Dateiänderungen AP22F10G-B Korrektur 1

## Produktiv geänderte Dateien

- `assets/app.css`
  - kompakte Seitenbreite,
  - tatsächlicher Tabelleninnenabstand trotz globaler Altregel,
  - blaue und rote Zählermarker,
  - Darstellung gesperrter Vorjahresanfangsstände,
  - Darstellung der Sonderfallfreigabe,
  - Dialogkopf und Checkboxdarstellung.

- `index.html`
  - Standard-Seitenrahmen statt breitem Rahmen,
  - Erweiterung des Sonderfalldialogs,
  - Release- und Cache-Build-ID V99.4.59.

- `js/ui-individual-values.js`
  - Zählermarker aus Zählerart,
  - Sperrlogik für bestätigte Vorjahresübernahmen,
  - bewusste Sonderfallfreigabe,
  - persistierbare, dublettenfreie Freigabedokumentation.

- `js/billing-calculation.js`
  - Bezeichnungen „Kaltwasserzähler“ und „Warmwasserzähler“.

- `js/app-runtime-config.js`
- `js/service-worker-register.js`
- `service-worker.js`
- `manifest.webmanifest`
- `package.json`
- `package-lock.json`
- `nk-pro-project.json`
  - Versions- und Releasekennungen V99.4.59.

## Testdateien

- `tests/ap22f10g-individual-values.test.cjs`
- `tests/ap22f10g-individual-values-browser.test.cjs`
  - Anpassung an V99.4.59 und an einen inzwischen vollständig befüllten realen Wasserbestand.

- `tests/ap22f10g-korrektur1.test.cjs`
- `tests/ap22f10g-korrektur1-browser.test.cjs`
  - neue Korrekturprüfungen.

## Neue Nachweisverzeichnisse

- `AP22F10G_B_Korrektur1_Dokumentation`
- `AP22F10G_B_Korrektur1_Screenshots`
