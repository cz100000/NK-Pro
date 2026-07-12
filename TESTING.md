# NK-Pro – Testing

**Ausgangsversion:** V99.3.0  
**Testframework:** Playwright 1.61.1  
**Browser:** Chromium  
**Zeitzone:** Europe/Berlin

## 1. Freigabegrundsatz

Eine Version ist erst freigabefähig, wenn alle blockierenden Prüfungen erfolgreich abgeschlossen sind. Einzelne grüne Tests ersetzen keine vollständige Freigabeprüfung.

Verpflichtend sind:

- Syntaxprüfung,
- Browserkonsole,
- Chromium,
- Playwright,
- Referenzfälle,
- Export,
- Import,
- Migration,
- PWA,
- Cache,
- Release Audit,
- App Self Test.

## 2. Voraussetzungen

```bash
npm ci
```

Entweder Playwright-Chromium installieren:

```bash
npx playwright install chromium
```

oder ein vorhandenes Chromium verwenden:

```bash
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm test
```

Unter Windows kann beispielsweise ein vorhandenes Chrome-, Edge- oder Chromium-Binary über `CHROMIUM_EXECUTABLE_PATH` angegeben werden.

## 3. Testbefehle

```bash
npm run test:syntax
npm run test:browser
npm test
npm run test:report
```

### Bedeutung

| Befehl | Prüfung |
|---|---|
| `npm run test:syntax` | alle produktiven JavaScript-Dateien per `node --check` |
| `npm run test:browser` | gesamte Playwright-Suite |
| `npm test` | Syntax und Browser in Reihenfolge |
| `npm run test:report` | öffnet den vorhandenen HTML-Testbericht |

## 4. Vorhandene Tests

### `tests/app-smoke.spec.js`

- Titel, Version und Schema,
- aktiver Start-Tab,
- internes Struktur-Audit,
- Release Audit,
- App Self Test,
- Renderfehler,
- vollständige Navigation aller 14 Tabs,
- Manifest- und Cacheversion,
- externe CSS-/JS-Dateien,
- keine produktiven Inline-Skripte oder Inline-Styles,
- K002 ausschließlich im Zählerpfad.

### `tests/persistence-backup.spec.js`

- Speichern mit Prüfsumme,
- Reload eines gespeicherten Datenstands,
- Rückfallstand bei beschädigtem Hauptspeicher,
- Export-/Import-Rundlauf nur der aktuellen Abrechnung.

### `tests/reference-cases.spec.js`

- Standardfall,
- unterjähriger Mieterwechsel,
- Leerstand,
- Eigentümer-/Privatrolle M000,
- vier getrennte Eingabequellen,
- Migration von Schema 4 auf Schema 5.

### `tests/service-worker.spec.js`

- Installation der App-Shell,
- `skipWaiting`,
- Client-Übernahme,
- Löschen alter und fremder Caches,
- Erhalt der aktuellen Cachekennung.

## 5. Referenzdaten

| Datei | Zweck |
|---|---|
| `standardfall.json` | vollständiger normaler Abrechnungsfall |
| `mieterwechsel.json` | zwei Mietperioden auf einer Wohnung |
| `leerstand.json` | aktive Wohnung ohne Mietverhältnis |
| `eigentuemer-m000.json` | Eigentümer-/Privatanteil |
| `alle-eingabequellen.json` | Zähler, Verbrauch, direkter Betrag, externe Abrechnung |
| `altdaten-migration.json` | kontrollierte Migration von Schema 4 auf 5 |

Referenzdaten dürfen nur nach dokumentierter fachlicher Entscheidung geändert werden. Eine reine UI-Version darf sie nicht verändern.

## 6. Prüfergebnisse

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Einheiten V99.4.0 | 5 bestanden, 0 fehlgeschlagen |
| Playwright-Tests V99.4.0 | 19 bestanden, 0 fehlgeschlagen |
| Browserkonsole | keine Fehler |
| Page Errors | keine Fehler |
| fehlgeschlagene Requests | keine |
| Release Audit | 28 OK, 0 Warnungen, 0 Fehler |
| Struktur-Audit | bestanden |
| Datenschema | 5 |


### V99.4.0 – 12. Juli 2026

- 5/5 JavaScript-Syntaxeinheiten bestanden,
- 19/19 Playwright-/Chromium-Tests bestanden,
- keine `console.error`, Page Errors oder fehlgeschlagenen App-Requests in der Testhülle,
- interne Release- und Struktur-Audits ohne Fehler,
- sechs unveränderte Referenz-/Migrationsfälle bestanden,
- Desktop 1440 × 1000 und Mobil 390 × 844 visuell kontrolliert,
- Service-Worker-App-Shell und Entfernung alter Caches simuliert bestanden.

Ein echter PWA-Installations- und Offline-Neustart über den lokalen Server war in der Ausführungsumgebung durch `ERR_BLOCKED_BY_ADMINISTRATOR` blockiert. Dies ist als Umgebungsgrenze dokumentiert und kein bestandener End-to-End-Nachweis.

## 7. Release-Matrix

Vor jeder Freigabe wird folgende Matrix protokolliert:

| Bereich | Pflichtnachweis |
|---|---|
| Syntax | Ausgabe `test:syntax` |
| Start | App lädt ohne Fehler |
| Navigation | jeder Eintrag öffnet genau einen Tab |
| Daten | Speichern und Neuladen identisch |
| Backup | Hauptstand und Rückfallstand gültig |
| Import | gültiger Export importierbar |
| Export | alle vorgesehenen Dateien erzeugbar |
| Migration | Altstand → Zielstand reproduzierbar |
| Rollback | Vor-Migrationsstand wiederherstellbar |
| Berechnung | Referenzsummen und Salden |
| Zähler | Anfang, Ende, Verbrauch, Fortschreibung |
| Archiv | öffnen, schließen, schreibgeschützt |
| Briefe | Einzel- und Sammeldruck, A4, Überlauf |
| PWA | Manifest, Installation, Offline-Start |
| Cache | neue Version ersetzt alte App-Shell |
| Datenschutz | keine unbeabsichtigte Veröffentlichung realer Daten |
| Dokumentation | vollständig und versionskonsistent |

## 8. UX-Tests V99.4.0

Folgende Prüfungen sind umgesetzt und Bestandteil der Freigabesuite:

1. Landingpage besitzt genau zwei primäre Einstiege.
2. Alle Zielfunktionen bleiben über die gruppierte Navigation erreichbar.
3. „Aktive Abrechnung“ ist ohne geöffnete Abrechnung vollständig ausgeblendet.
4. Objekt, Jahr und Status werden nur aus einer tatsächlich geöffneten Abrechnung angezeigt.
5. Accordion-Gruppen sind per Tastatur bedienbar und besitzen korrekte ARIA-Zustände.
6. Archiv und Extras bleiben jederzeit erreichbar.
7. Öffnen und Schließen des UI-Kontexts führt keine Datenmigration ein.
8. Bearbeitung, Nur Ansicht und Finalisiert werden eindeutig abgeleitet.

## 9. Neue Tests für Datenmodell und Migration

Vor jeder neuen Schemaversion sind verpflichtend:

- automatische Vor-Migrationssicherung,
- unveränderte Originaldatei,
- idempotente Mehrfachausführung,
- erfolgreicher Abbruch bei ungültigem Eingang,
- Wiederherstellung des Vorzustands,
- aktuelle Abrechnung und jedes Archivjahr,
- alte Exportformate,
- neue Exportformate,
- Zähler-ID-Zuordnung über Mieterwechsel und Zählerwechsel,
- Objektstandard ändert keine bestehende Abrechnung.

## 10. Manuelle Prüfungen

Automatisierung ersetzt nicht vollständig:

- Sichtprüfung in Chromium bei Desktop- und schmaler Breite,
- Browserkonsole mit realem `localStorage`,
- PWA-Installation über HTTPS oder localhost,
- Offline-Neustart,
- Druckvorschau und PDF-Ausgabe,
- tatsächliche Downloadpakete,
- Import einer extern gesicherten Datei,
- Bedienung mit Tastatur.

## 11. Testartefakte

Playwright erzeugt:

- `test-results/playwright-results.json`,
- `test-results/html/`,
- Fehler-Screenshots und Traces unter `test-results/artifacts/`.

Diese Laufzeitartefakte gehören nicht in die Auslieferungs-ZIP, außer sie werden ausdrücklich als Release-Nachweis bereitgestellt.
