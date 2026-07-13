# NK-Pro V99.4.17 – Navigationsbereinigung und visuelles UI-System

NK-Pro ist eine lokale, frameworkfreie HTML/CSS/JavaScript-PWA zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen. AP14 vereinheitlicht die normale Anwendungsoberfläche, trennt Zählerinventar und Verbrauchserfassung fachlich und erhält das AP13-Brief- und Drucksystem unverändert.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.17 |
| Technische Grundlage | Abschlussstand AP13, ebenfalls V99.4.17 |
| Versionsname | AP14-Navigationsbereinigung und visuelles UI-System |
| Datenschema / Datenebenenvertrag | 5 / 1, unverändert |
| Objektstandard / Abrechnungssnapshot | 1 / 2, unverändert |
| Zählerstandards | 1, unverändert |
| Navigation | vier Gruppen, 17 fachliche Ziele und eigener Start-Link |
| App-Typografie | `"Segoe UI", Arial, sans-serif` |
| Brief-/Drucktypografie | Arial; vom App-System getrennt |
| PWA-Cache | `nk-pro-v99-4-17-ap14` |
| Technik | statisches HTML, CSS und JavaScript; kein Framework, TypeScript oder Buildsystem |

## AP14-Kernergebnis

- dunkle Navigation, heller Arbeitsbereich und Blau als appweite Akzentfarbe,
- einheitliche Buttons, Links, Felder, Fokuszustände, Karten, Tabellen und Filterflächen,
- bestehender Kopfbereich mit sichtbaren Funktionen **Hilfe** und **Menü** samt lokalen SVG-Icons,
- `Projekt vorbereiten → Zähler` als deutlich gekennzeichneter, rein statischer Zählerinventar-DUMMY,
- vollständige bisherige Verbrauchserfassung unter `Nebenkosten abrechnen → Verbräuche erfassen`, direkt nach `Manuelle & externe Werte`,
- identische SVG-Motive für Startseitenkacheln und korrespondierende Navigationsgruppen,
- keine neuen Hauptbereich-Tabs, keine neue Persistenz und keine Änderung an Brief, Druck oder PDF.

## Start und Tests

`index.html` in Chromium öffnen. PWA-Installation und Service Worker benötigen HTTPS oder einen lokalen Webserver.

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser -- --workers=4
```

AP14 gezielt prüfen:

```bash
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:ap14
```

Technische Details: `AP14_NAVIGATIONSBEREINIGUNG_UND_VISUELLES_UI_SYSTEM.md`. Prüfergebnisse: `AP14_PRUEFBERICHT.md` und `AP14_TEST_RESULTS.json`.
