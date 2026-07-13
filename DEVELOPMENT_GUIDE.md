# NK-Pro – Entwicklungsleitfaden V99.4.12

## Quellenhierarchie

Maßgeblich sind freigegebene Versions-ZIP, tatsächlicher Quellcode, enthaltene Projektdokumente und automatisierte Tests.

## Unveränderliche Leitplanken

- statisches HTML, CSS und JavaScript ohne Framework oder Buildsystem,
- DOM-Ereignisse über deklarative `data-ui-*`-Aktionen und zentrale Ereignisdelegation,
- Fachpersistenz nur über `persistence.js`, UI-Präferenzen nur über `ui-preferences.js`,
- keine Fachberechnung in UI-, Navigations-, Druck- oder Exportcode duplizieren,
- Schema-, Vertrags- und Standardversionen nur mit eigenem Migrations-/Freigabepaket ändern,
- unbekannte Felder bei Normalisierung und Migration erhalten.

## AP11-Regeln

- Es darf genau eine produktive Hauptnavigation geben.
- Neue Navigationseinträge verwenden vorhandene Controlleraktionen oder erhalten einen ausdrücklich getesteten Vertrag.
- Aktive Navigation wird aus dem sichtbaren Arbeitskontext abgeleitet, nicht aus einem unabhängigen DOM-Flag.
- Icons müssen lokal, einheitlich und für Screenreader nicht redundant sein.
- Farben, Größen und Zustände werden als CSS Custom Properties gepflegt.
- Einstellungen bleibt bis zu einem späteren Paket ein aktionsloser, zugänglich erläuterter Dummy.
- Responsive Änderungen dürfen Fachseiten weder überlagern noch horizontal verschieben.

## Pflichtprüfung

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

## Definition of Done

Quellcode, Navigation, Modulgrenzen, Tests, Dokumentation, Versionen, App-Shell und Prüfsummen sind konsistent. Die finale ZIP wird in ein leeres Verzeichnis entpackt und erneut vollständig geprüft.
