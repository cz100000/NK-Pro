# NK-Pro – Teststrategie V99.4.17

## Standardlauf

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser -- --workers=4
```

## AP14

```bash
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:ap14
```

AP14 prüft statisch und im Browser:

- 17 fachliche Navigationsziele und die neue Reihenfolge,
- zustandsneutralen Zählerinventar-DUMMY,
- vollständige produktive Verbrauchserfassung unter `verbraeuche`,
- korrekte aktive Navigationszustände,
- identische Startseiten- und Navigationsicons,
- Segoe-UI-Appschrift und unveränderte Arial-Briefdarstellung,
- Hilfe-/Menüfunktionen im bestehenden Kopfbereich,
- keine zusätzliche Hauptbereich-Tab-Leiste,
- kleinere Fenstergrößen, PWA-App-Shell und fehlerfreie Browserkonsole.

AP13-Dokumenttests bleiben Bestandteil des vollständigen Testlaufs. Maschinenlesbare Ergebnisse: `AP14_TEST_RESULTS.json`. Ausführlicher Bericht: `AP14_PRUEFBERICHT.md`.
