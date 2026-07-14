# NK-Pro – Teststrategie V99.4.21

## Reproduzierbarer Freigabepfad

```bash
npm ci
npx playwright install chromium
npm run release:check
```

Alternativ:

```bash
CHROMIUM_EXECUTABLE_PATH=<Pfad-zum-Chromium> npm run release:check
```

Die Browserprojekte laufen seriell (`workers: 1`, `fullyParallel: false`).

## Prüfebenen

- JavaScript-Syntax und statische Vertragsprüfungen,
- Fixture-, Daten-, Migrations-, Persistenz-, Archiv-, Sicherungs- und Restoreprüfungen,
- Fachtests der Verbrauchs- und Zählerdomäne,
- Architektur-, Aktionsregister- und Zustandszugriffsprüfungen,
- AP13-Brief-/Druck-/PDF-/Schwarzweißregression,
- AP14-/AP17-Navigation und UI-Regression,
- AP18-Marke, Buttonsystem, Start, Fokus, Briefzoom, Werkzeuggruppen und Responsive-Verhalten,
- Manifest-, Icon-, Service-Worker-, Cache- und Offline-Fallback-Prüfung,
- Releasekonsistenz, SHA-256-Dateiinventar und ZIP-Inhaltsprüfung.

## AP18-spezifische Tests

`tests/ap18-ui-ux-polish.test.cjs` prüft Version, Datenverträge, Assets, Manifest, App-Shell, zentrale Designvariablen, Aktionsvarianten, Zoomgrenzen, Resize-Logik und kontrollierte CSS-/Inline-Bereinigung.

`tests/ap18-ui-ux-polish.spec.js` prüft Marke, Start, Navigation, Tastaturfokus, Ganze-Seite-Standard, Plus/Minus, Seitenbreite, Resize, benutzerdefinierten Zoom, Schwarzweißparität, schmale Ansichten sowie Abrufbarkeit aller Manifesticons.

## Ergebnisstand

87 Browserfälle wurden erkannt: 84 bestanden, 3 planmäßig optionale Tests übersprungen, 0 reguläre Fehler. Der erzwungene reale Loopback-PWA-Test ist in der Hostumgebung durch eine Administratorrichtlinie blockiert. Die verpflichtende Service-Worker-Semantik einschließlich Offline-Navigationsfallback ist bestanden.

Maschinenlesbare Ergebnisse stehen in `AP18_TEST_RESULTS.json`; Einzelheiten in `AP18_PRUEFBERICHT.md`.
