# NK-Pro – Teststrategie V99.4.20

## Reproduzierbarer Freigabepfad

```bash
npm ci
npx playwright install chromium
npm run release:check
```

Die Browserprojekte laufen seriell (`workers: 1`, `fullyParallel: false`).

## Prüfebenen

- JavaScript-Syntax und statische Vertragsprüfungen,
- Fixture-, Daten-, Migrations-, Persistenz-, Archiv-, Sicherungs- und Restoreprüfungen,
- Fachtests der Verbrauchs- und Zählerdomäne,
- Architektur- und Zustandszugriffsprüfungen,
- AP13-Brief-/Druck-/PDF-/Schwarzweißregression,
- AP14-/AP16-UI-Regression,
- AP15-Gesamtintegration und PWA-Härtung,
- AP17-Bereichs-Dashboards, Kontextleiste, unabhängige Navigation, Tastatur/Fokus und Responsive-Verhalten,
- Releasekonsistenz, SHA-256-Dateiinventar und ZIP-Inhaltsprüfung.

## AP17-spezifische Tests

`tests/ap17-area-dashboards.test.cjs` prüft Version, Datenverträge, zwei Dashboards, 15 Echtwerte, 15 Vorschauwerte, Kartenbereinigung, globale Kontextleiste, Navigationsspeicher v4, SVG-Chevrons und Iconsystem. `tests/ap17-area-dashboards.spec.js` prüft Bedienfluss, Direkteinstiege, unabhängige Gruppen, Tastaturbedienung, aktiven Pfad, Kontextwechsel und schmale/niedrige Fenster.

Maschinenlesbare Ergebnisse stehen in `AP17_TEST_RESULTS.json`; Einzelheiten in `AP17_PRUEFBERICHT.md`.

Ein bereits installierter Chromium-Browser kann über folgende Laufzeitvariable eingebunden werden:

```bash
CHROMIUM_EXECUTABLE_PATH=<Pfad-zum-Chromium> npm run release:check
```
