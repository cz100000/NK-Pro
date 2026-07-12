# Test- und Freigabekonzept

**Aktueller Stand:** V99.4.2, Datenschema 5, Datenebenenvertrag 1

## 1. Pflichtprüfungen

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
npm run test:browser
```

`npm test` führt die automatisierten Prüfgruppen in der im Paket definierten Reihenfolge aus.

## 2. Syntaxprüfung

`tools/check-js-syntax.cjs` liest die produktiven Skripte aus `index.html` und prüft zusätzlich `service-worker.js`. Sechs JavaScript-Einheiten gehören zur Prüfung:

- `js/navigation.js`
- `js/modal-events.js`
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

- Start, Landingpage, Navigation, Tastatur und ARIA,
- Arbeitskontext und schreibgeschützte Archivansicht,
- Persistenz, Prüfsumme und getrennten Recovery-Stand,
- begrenzte und idempotente Archivsnapshots,
- Entfernung verschachtelter Archive, Stammdatenkopien, globaler Historienkopien und technischer Metadaten,
- Wiederbearbeitung mit Erhalt aktueller Stammdaten, globaler Historie und des vollständigen Archivs,
- Gesamtbackup ohne Recovery und Abrechnungs-JSON ohne Archiv/Stammdaten/Historie,
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
| Datenvertrag | Arbeitsstand, Snapshot, Archiv, Backup und Recovery erfüllen ihre Grenzen |
| Persistenz | Speichern und Neuladen identisch; Recovery getrennt |
| Import/Export | vorgesehene Rundläufe und Rollen funktionieren |
| Migration | Altarchive und Schema-4-Fall reproduzierbar und idempotent |
| Berechnung | Referenzsummen und Rollen unverändert |
| Archiv | begrenzt, schreibgeschützt und wiederbearbeitbar ohne Stammdatenrückschreibung |
| PWA | Manifest, App-Shell und Cachekennung konsistent |
| Dokumentation | Versionen, Vertragsdokument und SHA-256-Summen konsistent |

## 6. Zusätzliche Anforderungen vor einer neuen Schemaversion

- automatisches externes Vor-Migrationsbackup,
- unveränderte Originaldatei,
- idempotente Mehrfachausführung,
- definierter Abbruch bei ungültigem Eingang,
- getestete Wiederherstellung und allgemeiner Rollback,
- Prüfung aktueller Abrechnung und aller Archivjahre,
- dokumentierter Rückweg.
