# Test- und Freigabekonzept

**Aktueller Stand:** V99.4.5, Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Snapshot 1

## 1. Pflichtbefehle

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

## 2. Statische Prüfungen

`test:syntax` prüft 12 JavaScript-Einheiten. `test:fixtures` materialisiert und vergleicht sechs kanonische Fälle. `test:release` prüft Versionen, Modulgrenzen, Objekt-/Snapshotkonstanten, Dummy-Ausschluss, Migrationssicherung, Skriptreihenfolge, PWA-App-Shell und Pflichtdokumente.

## 3. Browserregression

36 Playwright-Tests decken ab:

- Start, Navigation, UI-Struktur und interne Audits,
- Manifest, Service Worker und Modulreihenfolge,
- bestehende Fachberechnung in sechs Referenzfällen,
- Persistenz, Recovery, begrenzte Archive und Export/Import,
- Migrationsregistry, atomaren Abbruch, Vor-Migrationssicherung, Restore und Rollback,
- additive Migration eines V99.4.4-Bestands auf Objektstandard 1,
- verlustfreien Erhalt bestehender und unbekannter Felder,
- Stromzähler-Dummy, Speicherung und vollständigen Abrechnungsausschluss,
- gültige, eindeutige und eingefrorene Snapshots,
- Isolation gegenüber späteren Stammdatenänderungen,
- Blockade kritischer Fehler mit strukturierten Fehlercodes,
- Prüfsummen-Manipulationserkennung,
- unveränderte historische Facharrays mit `legacy-partial`.

## 4. Freigabematrix

| Prüfung | Ergebnis V99.4.5 |
|---|---|
| JavaScript-Syntax | 12/12 bestanden |
| Referenzfälle | 6/6 bestanden |
| Release-Konsistenz | bestanden |
| Playwright/Chromium | 36/36 bestanden |
| Datenschema | 5 unverändert |
| Datenebenenvertrag | 1 unverändert |
| Objektstandard | 1 |
| Snapshotformat | 1 |

## 5. Freigaberegel

Eine neue Version darf nur verpackt werden, wenn alle statischen Prüfungen und sämtliche Browserdateien einzeln fehlerfrei laufen. Nach dem Verpacken wird die ZIP frisch entpackt und aus dieser Kopie erneut geprüft. Änderungen an Schema, Datenebenenvertrag, Objektstandard oder Snapshotformat benötigen dokumentierte Migration, Vor-Migrationssicherung, Rückweg und neue Regressionstests.
