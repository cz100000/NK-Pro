# NK-Pro – Testkonzept V99.4.12

## Statische Prüfungen

- Syntax aller produktiven JavaScriptdateien,
- Fixture-Konsistenz und Materialisierbarkeit,
- Zählerdomänentests,
- AP6–AP11-Architekturgrenzen,
- Versions-, App-Shell-, Dokument- und SHA-256-Konsistenz.

## AP11-Prüfungen

`tests/ap11-navigation.test.cjs` prüft Struktur, eine einzige Navigation, 16 Ziele, 22 Inline-SVGs, Tokens, Einstellungen-Dummy, Ereignis- und Zustandsgrenzen. `tests/ap11-navigation.spec.js` prüft im Browser:

- Referenzstruktur und Iconkonsistenz,
- genau einen aktiven Punkt und `aria-current`,
- zustandsneutralen Einstellungen-Dummy,
- Tastatur, sichtbaren Fokus und Gruppensteuerung,
- geringe Höhe und schmalen Drawer,
- 1920×1080, 1600×900, 1366×768, 1280×720,
- Zoomsimulation 80/100/125/150 Prozent,
- optionale visuelle Referenzscreenshots.

## Vollständiger Lauf

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

Bei instabiler gemeinsamer Playwright-Ausführung werden die elf Projekte in frischen Prozessen mit `--workers=1` ausgeführt. Das ist ein zulässiger Testmodus und wird im Prüfbericht vollständig ausgewiesen.

## Freigabe

Nicht ausgeführte Prüfungen dürfen nicht als bestanden gelten. Ergebnisse, Laufzeiten, Ersatzprüfungen und visuelle Referenzen werden in `AP11_TEST_RESULTS.json` und `AP11_PRUEFBERICHT.md` dokumentiert. Die Releaseprüfung validiert abschließend alle in `SHA256SUMS.txt` aufgeführten Dateien.
