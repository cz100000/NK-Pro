# NK-Pro V99.4.0

Lokale, frameworkfreie Browseranwendung zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen.

## Aktueller Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.0 |
| Versionsname | UX-Grundgerüst und Arbeitskontext |
| Datenschema | 5 – unverändert |
| PWA-Manifest | 99.4.0 |
| Service-Worker-Cache | `nk-pro-v99-4-0` |
| Produktive Technik | HTML, CSS, JavaScript |
| Framework / Buildsystem | keines / keines |
| Browser-Tests | Playwright 1.61.1 + Chromium |

V99.4.0 setzt Phase 1 der Roadmap um. Fachlogik, Berechnung, Datenmodell, Migrationen, Referenzdaten sowie Import- und Exportformate bleiben unverändert.

## Neue Bedienstruktur

Die Anwendung startet auf einer reinen Arbeitsweiche mit genau zwei Einstiegen:

- **Objekt vorbereiten**
- **Nebenkosten abrechnen**

Die Sidebar ist in vier Accordion-Gruppen gegliedert:

1. Objekt vorbereiten
2. Nebenkosten abrechnen
3. Archiv
4. Extras

Es gibt 16 funktionale Navigationsziele plus die Landingpage. Alle bisherigen Funktionen bleiben erreichbar. Der Bereich „Aktive Abrechnung“ wird nur angezeigt, wenn eine konkrete Abrechnung geöffnet ist. Er zeigt Objekt, Jahr und einen der Statuswerte **Bearbeitung**, **Nur Ansicht** oder **Finalisiert**.

Die derzeitige Architektur besitzt noch keine getrennte Objektstandard-Domäne und keine eigenständige Zählerverwaltung. V99.4.0 bildet diese noch nicht vorgetäuscht nach; die datenmodellrelevante Trennung bleibt Phase 2 beziehungsweise Phase 3.

## Anwendung starten

### Direkt lokal

`index.html` in einem modernen Browser öffnen. Die Fachanwendung funktioniert auch über `file:`. Service Worker, Offline-Cache und installierbare PWA benötigen HTTPS oder einen lokalen Webserver.

### Lokaler Testserver

```bash
npm ci
node tools/static-server.cjs
```

Danach: `http://127.0.0.1:4173`

## Datenhaltung und Sicherung

NK-Pro speichert den Arbeitsstand im Browser-`localStorage`.

- Hauptdatenstand mit Prüfsumme,
- vorheriger gültiger Hauptstand als Recovery,
- lesbare Legacy-Speicherkeys,
- Gesamt- und Abrechnungs-JSON als externe Sicherung.

Vor Jahreswechseln, Importen, Migrationen und größeren Änderungen ist eine externe Gesamt-JSON-Sicherung erforderlich. Eine neue Schemaversion darf gemäß `WORKBOOK.md` erst nach Einführung einer automatischen Vor-Migrationssicherung und eines getesteten Wiederherstellungswegs entstehen.

## Projektstruktur

| Pfad | Inhalt |
|---|---|
| `index.html` | Landingpage, Sidebar und statische Anwendungsstruktur |
| `assets/app.css` | Bildschirm-, Responsive- und Druckdarstellung |
| `js/app.js` | Fach-, Daten-, Archiv-, Render-, Brief- und Exportlogik |
| `js/navigation.js` | Accordion-Navigation, Sidebar und Arbeitskontext |
| `js/modal-events.js` | globale Modalereignisse |
| `js/service-worker-register.js` | PWA-Registrierung und Updatehinweis |
| `service-worker.js` | App-Shell und Offline-Cache |
| `manifest.webmanifest` | PWA-Metadaten |
| `tests/` | Playwright- und Regressionstests |
| `testdaten/` | sechs unveränderte Referenzdatensätze |
| `tools/` | Syntaxprüfung und statischer Testserver |

## Tests

```bash
npm ci
npm run test:syntax
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run test:browser
```

Freigabeergebnis V99.4.0:

- JavaScript-Syntax: **5/5 bestanden**,
- Playwright/Chromium: **19/19 bestanden**,
- Browserkonsole und Seitenfehler: **fehlerfrei**,
- Landingpage, Navigation, Accordion, Tastatur und ARIA: **bestanden**,
- Status Bearbeitung / Nur Ansicht / Finalisiert: **bestanden**,
- Persistenz, Recovery und JSON-Rundlauf: **bestanden**,
- Referenzfälle und Schema-5-Migration: **bestanden**,
- Manifest, Service Worker und Cachewechsel: **bestanden**,
- Desktop- und Mobil-Sichtprüfung: **bestanden**.

Ein echter installierter PWA-/Offline-Neustart über HTTPS oder localhost konnte in der Ausführungsumgebung wegen einer Browser-Netzwerkrichtlinie nicht durchgeführt werden. Die dafür relevanten statischen und simulierten Service-Worker-Prüfungen sind grün.

## Verbindliche Projektdokumente

- `DEVELOPMENT_BASELINE.md` – unveränderte Analyse der Ausgangsversion V99.3.0
- `CHANGELOG.md`
- `WORKBOOK.md`
- `DEVELOPMENT_GUIDE.md`
- `UX_GUIDE.md`
- `ARCHITECTURE.md`
- `TESTING.md`
- `ROADMAP.md`
- `TECH_DEBT.md`
- `GITHUB_RELEASE_TEMPLATE.md`
- `UI_ARCHITEKTUR_V99_4_0.md`
- `V99_4_0_GITHUB_RELEASE.md`
- `V99_4_0_Pruefbericht.json`
- `SHA256SUMS.txt`

Historische Abrechnungen besitzen weiterhin Vorrang vor Komfort, Vereinfachung und Neuentwicklung.
