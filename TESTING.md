# Test- und Freigabekonzept

**Aktueller Stand:** V99.4.1, Datenschema 5

## 1. Pflichtprüfungen

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
npm run test:browser
```

`npm test` führt alle Prüfgruppen in dieser Reihenfolge aus.

## 2. Syntaxprüfung

`tools/check-js-syntax.cjs` liest die produktiven Skripte aus `index.html` und prüft zusätzlich `service-worker.js`. Seit V99.4.1 gehören sechs JavaScript-Einheiten zur Prüfung:

- `js/navigation.js`
- `js/modal-events.js`
- `js/default-seed.js`
- `js/app.js`
- `js/service-worker-register.js`
- `service-worker.js`

## 3. Referenzdaten

Die sechs logischen Referenzfälle bleiben fachlich unverändert, werden aber speichersparend rekonstruiert:

| Logischer Name | Zweck |
|---|---|
| `standardfall.json` | vollständiger normaler Abrechnungsfall |
| `mieterwechsel.json` | zwei Mietperioden auf einer Wohnung |
| `leerstand.json` | aktive Wohnung ohne Mietverhältnis |
| `eigentuemer-m000.json` | Eigentümer-/Privatanteil |
| `alle-eingabequellen.json` | Zähler, Verbrauch, direkter Betrag, externe Abrechnung |
| `altdaten-migration.json` | kontrollierte Migration von Schema 4 auf 5 |

Physische Struktur:

- `testdaten/basis/standardfall.json`
- `testdaten/faelle/*.patch.json`
- `testdaten/fixture-manifest.json`
- `tests/fixture-loader.cjs`

`npm run test:fixtures` rekonstruiert jeden Fall und vergleicht eine kanonische SHA-256-Prüfsumme. Eine Änderung an Basis oder Patch ist nur zulässig, wenn die fachliche Änderung beschlossen, der neue Hash dokumentiert und die Regressionstests angepasst wurden.

Vollständige Dateien können bei Bedarf außerhalb der aktiven Arbeitsstruktur erzeugt werden:

```bash
npm run fixtures:materialize
```

## 4. Browser- und Regressionstests

Die Playwright-Suite prüft insbesondere:

- Start, Landingpage und Navigation,
- Arbeitskontext und Archivansicht,
- Persistenz, Prüfsumme und Recovery,
- JSON-Rundlauf,
- Standardfall, Mieterwechsel, Leerstand und M000,
- vier Eingabequellen,
- Migration Schema 4 auf 5,
- Manifest, App-Shell und Cachewechsel.

## 5. Release-Matrix

| Bereich | Pflichtnachweis |
|---|---|
| Syntax | alle produktiven JavaScript-Einheiten fehlerfrei |
| Referenzdaten | alle kanonischen Prüfsummen identisch |
| Start | Anwendung lädt ohne Console- oder Page-Errors |
| Navigation | jeder Eintrag öffnet genau einen Bereich |
| Daten | Speichern und Neuladen identisch |
| Backup | Hauptstand und Rückfallstand gültig |
| Import/Export | vorgesehene Rundläufe funktionieren |
| Migration | Altstand zum Zielstand reproduzierbar |
| Berechnung | Referenzsummen und Rollen unverändert |
| Archiv | schreibgeschützte Ansicht und Rückkehr funktionieren |
| PWA | Manifest, App-Shell und Cachekennung konsistent |
| Dokumentation | Versionen und SHA-256-Summen konsistent |

## 6. Zusätzliche Anforderungen vor einer neuen Schemaversion

- automatische Vor-Migrationssicherung,
- unveränderte Originaldatei,
- idempotente Mehrfachausführung,
- definierter Abbruch bei ungültigem Eingang,
- getestete Wiederherstellung,
- Prüfung aktueller Abrechnung und aller Archivjahre,
- dokumentierter Rückweg.
