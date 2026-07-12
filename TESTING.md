# Test- und Freigabekonzept

**Aktueller Stand:** V99.4.3, Datenschema 5, Datenebenenvertrag 1

## 1. Pflichtprüfungen

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run test:browser
```

`npm test` führt die automatisierten Prüfgruppen in der Paket-Reihenfolge aus. Playwright benötigt einen installierten Chromium-Browser.

## 2. Syntaxprüfung

`tools/check-js-syntax.cjs` liest die produktiven Skripte aus `index.html` und prüft zusätzlich `service-worker.js`. Neun JavaScript-Einheiten gehören zur Prüfung:

- `js/navigation.js`
- `js/modal-events.js`
- `js/persistence.js`
- `js/migration.js`
- `js/archive.js`
- `js/default-seed.js`
- `js/app.js`
- `js/service-worker-register.js`
- `service-worker.js`

## 3. Referenzdaten

Die sechs logischen Referenzfälle bleiben fachlich unverändert und werden speichersparend rekonstruiert:

| Logischer Name | Zweck |
|---|---|
| `standardfall.json` | vollständiger normaler Abrechnungsfall |
| `mieterwechsel.json` | zwei Mietperioden auf einer Wohnung |
| `leerstand.json` | aktive Wohnung ohne Mietverhältnis |
| `eigentuemer-m000.json` | Eigentümer-/Privatanteil |
| `alle-eingabequellen.json` | Zähler, Verbrauch, direkter Betrag, externe Abrechnung |
| `altdaten-migration.json` | kontrollierte Migration von Schema 4 auf 5 |

`npm run test:fixtures` rekonstruiert jeden Fall und vergleicht eine kanonische SHA-256-Prüfsumme. Eine Änderung an Basis oder Patch ist nur bei ausdrücklich beschlossener fachlicher Änderung zulässig.

## 4. Modul- und Releaseprüfungen

`tools/check-release-consistency.cjs` prüft insbesondere:

- Version V99.4.3 in App, Paket, Manifest und Projektmetadaten,
- unverändertes Datenschema 5 und Datenebenenvertrag 1,
- feste Exporte `NKProPersistence`, `NKProMigration` und `NKProArchive`,
- vorhandene globale Kompatibilitätsfassaden in `app.js`,
- keine direkten `localStorage`-Zugriffe außerhalb von `js/persistence.js`,
- exakte produktive Skriptreihenfolge,
- vollständigen PWA-App-Shell und Cachewechsel,
- notwendige Projektdokumente und kompakte Referenzdatenstruktur.

## 5. Browser- und Regressionstests

Die Playwright-Suite umfasst 22 Tests und prüft:

- Start, Landingpage, Navigation, Tastatur und ARIA,
- Arbeitskontext und schreibgeschützte Archivansicht,
- Modulreihenfolge, eingefrorene Modulschnittstellen und globale Kompatibilität,
- Persistenz, Prüfsumme und getrennten Recovery-Stand,
- begrenzte und idempotente Archivsnapshots,
- Entfernung verschachtelter Archive, Stammdatenkopien, globaler Historienkopien und technischer Metadaten,
- Wiederbearbeitung mit Erhalt aktueller Stammdaten, globaler Historie und des vollständigen Archivs,
- Gesamtbackup ohne Recovery und Abrechnungs-JSON ohne Archiv/Stammdaten/Historie,
- JSON-Rundlauf,
- alle sechs Referenzfälle,
- Migration Schema 4 auf 5,
- Manifest, App-Shell und Cachewechsel.

## 6. Release-Matrix

| Bereich | Pflichtnachweis |
|---|---|
| Syntax | 9/9 produktive JavaScript-Einheiten fehlerfrei |
| Referenzdaten | 6/6 kanonische Prüfsummen identisch |
| Module | drei Namespaces vorhanden, vor `app.js` geladen und eingefroren |
| Abhängigkeiten | direkter Browser-Speicherzugriff ausschließlich im Persistenzmodul |
| Start | Anwendung lädt ohne Console- oder Page-Errors |
| Datenvertrag | Arbeitsstand, Snapshot, Archiv, Backup und Recovery erfüllen ihre Grenzen |
| Persistenz | Speichern und Neuladen identisch; Recovery getrennt |
| Import/Export | vorgesehene Rundläufe und Rollen funktionieren |
| Migration | Schema-4-Fall und Altarchive reproduzierbar und idempotent |
| Berechnung | Referenzsummen und Rollen unverändert |
| PWA | Manifest, Modulshell und Cachekennung konsistent |
| Dokumentation | Versionen, Modulvertrag, Datenvertrag und SHA-256-Summen konsistent |

## 7. Zusätzliche Anforderungen vor einer neuen Schemaversion

- automatisches externes Vor-Migrationsbackup,
- unveränderte Originaldatei,
- formalisierte Migrationsregistry,
- idempotente Mehrfachausführung,
- definierter Abbruch bei ungültigem Eingang,
- getestete Wiederherstellung und allgemeiner Rollback,
- Prüfung aktueller Abrechnung und aller Archivjahre,
- dokumentierter Rückweg.
