# NK-Pro – Teststrategie V99.4.16

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

## AP13

```bash
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:ap13
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node tools/generate-ap13-controls.cjs
```

AP13 prüft das gemeinsame Dokumentmodell, DIN-A4-Maße, neun Tabellen-spalten, vollständige Linien, Ein-/Zweiseitenlogik, Abschlussblock, Vorauszahlungsanpassung, Nachzahlung/Guthaben, lange Empfängerdaten und skalierte Vorschau. Die erzeugten PDFs werden zusätzlich mit `pdfinfo`, Textextraktion und gerenderten Seitenbildern kontrolliert.

Maschinenlesbare Ergebnisse: `AP13_TEST_RESULTS.json`. Ausführlicher Bericht: `AP13_PRUEFBERICHT.md`.
