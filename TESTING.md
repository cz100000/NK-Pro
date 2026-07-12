# NK-Pro – Testkonzept

**Aktueller Stand:** V99.4.6, Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandard 1, Snapshot 2

## Prüfstufen

1. **Syntax:** alle produktiven JavaScript-Dateien und Testwerkzeuge.
2. **Referenzfälle:** sechs kanonische Datensätze mit SHA-256-Prüfung.
3. **Zählerdomäne:** Node-basierte Modulprüfung für Migration, stabile IDs, Messwerte, Perioden, Korrekturen, Wechsel, Zuordnungen, Dummy-Ausschluss und Snapshot-Projektion.
4. **Release-Konsistenz:** Versionen, Standards, Modulgrenzen, Ladefolge, PWA-App-Shell, Dokumente und Datenvertrag.
5. **Browserregression:** Start, Navigation, Berechnung, Persistenz, Migration, Restore, Objektstandard, Snapshot, Archiv, Referenzfälle und Service Worker.
6. **Frische Entpackung:** Wiederholung der Prüfungen aus der finalen ZIP.

## Befehle

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
npm test
```

Ist kein Playwright-Browserpaket vorhanden, kann ein installiertes Chromium über `CHROMIUM_EXECUTABLE_PATH` verwendet werden. Ein Browser-Download ist für die Anwendung selbst nicht erforderlich. Für eine vollständig getrennte Ausführung können die sieben Projekte einzeln mit `npx playwright test --project=<Projektname>` gestartet werden.

## Freigabeergebnis V99.4.6

- 16/16 produktive JavaScript-Einheiten syntaktisch fehlerfrei,
- 6/6 kanonische Referenz-Fixtures semantisch unverändert,
- Zählerdomänenprüfung bestanden,
- Release-Konsistenzprüfung bestanden,
- 37/37 Browserregressionen in 7/7 Testprojekten bestanden.

## Zählerbezogene Pflichtfälle

- V99.4.5-Migration und Idempotenz,
- stabile Zähler-IDs nach erneutem Laden und Speichern,
- Erhalt unbekannter Felder,
- mehrere eigenständige Messwerte je Zähler,
- Perioden- und Verbrauchsbildung,
- Rückwärtsstand und fehlende Referenzen,
- Korrektur ohne Überschreiben des Altwerts,
- Nutzer-/Vertragswechsel mit zeitanteiliger Zuordnung,
- Zählerwechsel mit Vorgänger/Nachfolger,
- Dummy-Speicherung ohne Kostenwirkung,
- Snapshot-Isolation und Snapshot-1-Kompatibilität,
- Sicherung, Restore und Rollback.

Die konkreten Ergebnisse der Freigabe stehen in `AP5_PRUEFBERICHT.md`.
