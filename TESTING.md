# Test- und Freigabekonzept

**Aktueller Stand:** V99.4.4, Datenschema 5, Datenebenenvertrag 1

## 1. Pflichtprüfungen

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run test:browser
```

`npm test` führt Syntax-, Referenzdaten-, Release- und Browserprüfung in dieser Reihenfolge aus.

## 2. Syntaxprüfung

`tools/check-js-syntax.cjs` prüft die produktiven Skripte aus `index.html` sowie `service-worker.js`. Zur Freigabe gehören 10 JavaScript-Einheiten:

- `js/navigation.js`
- `js/modal-events.js`
- `js/persistence.js`
- `js/migration.js`
- `js/backup-recovery.js`
- `js/archive.js`
- `js/default-seed.js`
- `js/app.js`
- `js/service-worker-register.js`
- `service-worker.js`

## 3. Referenzdaten

Sechs logische Referenzfälle werden aus einer vollständigen Basis und kleinen Patches rekonstruiert: Standardfall, Mieterwechsel, Leerstand, Eigentümer M000, alle Eingabequellen und Altdatenmigration. `npm run test:fixtures` vergleicht ihre kanonischen SHA-256-Prüfsummen. Änderungen sind nur bei ausdrücklich beschlossener Fachänderung zulässig.

## 4. Modul- und Releaseprüfung

`tools/check-release-consistency.cjs` prüft insbesondere:

- Version V99.4.4 in App, Paket, Manifest und Projektmetadaten,
- Datenschema 5 und Datenebenenvertrag 1,
- die vier festen Namespaces `NKProPersistence`, `NKProMigration`, `NKProBackupRecovery` und `NKProArchive`,
- zentrale Migrationsregistry und transaktionale Ausführung,
- Backup-, Restore- und Checkpoint-Grundlage,
- direkte `localStorage`-Zugriffe ausschließlich in `js/persistence.js`,
- exakte Skriptreihenfolge, vollständigen PWA-App-Shell und Cachewechsel,
- Pflichtdokumente und kompakte Referenzdatenstruktur.

## 5. Browser- und Regressionstests

Die Playwright-Suite umfasst 28 Tests. Sie prüft:

- Start, Landingpage, Navigation, Tastatur, ARIA und Abrechnungskontext,
- schreibgeschützte Archivansicht und unveränderte Fachzuordnung,
- Modulreihenfolge, eingefrorene Namespaces und Kompatibilitätsfassaden,
- Persistenz, Prüfsumme, Recovery und Snapshot-Grenzen,
- Gesamtbackup, Abrechnungs-JSON, Wiederbearbeitung und JSON-Rundlauf,
- Registrypfade und atomare Migration ohne Teiländerung,
- unveränderliche Sicherungshüllen und Manipulationserkennung,
- automatische Vor-Migrationssicherung beim Start,
- atomare optionale Archivmigration,
- externen Restore über den JSON-Import mit Rollback-Checkpoint,
- alle sechs Referenzfälle,
- Manifest, Service-Worker-App-Shell und Cachewechsel.

## 6. Release-Matrix

| Bereich | Pflichtnachweis |
|---|---|
| Syntax | 10/10 JavaScript-Einheiten fehlerfrei |
| Referenzdaten | 6/6 kanonische Prüfsummen identisch |
| Browser | 28/28 Playwright-/Chromium-Tests bestanden |
| Module | vier Namespaces vorhanden, vor `app.js` geladen und eingefroren |
| Migration | Registry vollständig; Vor-/Nachprüfung; Fehler ohne Teiländerung |
| Sicherung | eindeutige IDs und gültige Nutzdaten-, Metadaten- und Hüllenprüfsummen |
| Restore | interner und externer Restore validiert; Checkpoint und Rollback vorhanden |
| Datenvertrag | Arbeitsstand, Snapshot, Archiv, Gesamtbackup und Recovery erfüllen ihre Grenzen |
| Persistenz | Speichern/Neuladen und Recovery bleiben getrennt und integritätsgeschützt |
| PWA | Manifest, App-Shell und Cachekennung konsistent |
| Dokumentation | Version, Architektur, Roadmap, Restrisiken und SHA-256-Summen aktuell |

## 7. Freigaberegel für spätere Schemaversionen

Jede neue Schemaversion muss einen registrierten Pfad, Vor-Migrationssicherung, Vor-/Nachvalidierung, Abbruchtest, Restore-Test, dokumentierten Rückweg und Kompatibilitätsprüfung aller betroffenen Datenebenen enthalten. Datenschema 6 ist nicht Bestandteil von V99.4.4.
