# NK-Pro – Tests V99.4.13

## Vollständiger Lauf

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npx playwright test --workers=1
```

Bei Browser-Teardown-Problemen dürfen Projekte in frischen Prozessen ausgeführt werden. Der AP12-Abschlusslauf umfasst Syntax, sechs Referenzfälle, Zählerstandard, Architekturprüfungen AP6–AP12, Releasekonsistenz sowie zwölf Playwright-Projekte. Ergebnisse und Sonderfall des geteilten Snapshot-Laufs stehen in `AP12_PRUEFBERICHT.md` und `AP12_TEST_RESULTS.json`.
