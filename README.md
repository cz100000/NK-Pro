# NK-Pro V99.4.12 – Navigationsstruktur und visuelles Grundsystem

NK-Pro ist eine lokale, frameworkfreie HTML/CSS/JavaScript-PWA zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen. V99.4.12 setzt die produktive Navigation entsprechend der verbindlichen Referenz neu auf, ohne Fachlogik oder gespeicherte Daten zu verändern.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.12 |
| Ausgangsversion | V99.4.11 |
| Datenschema | 5, unverändert |
| Datenebenenvertrag | 1, unverändert |
| Objektstandard | 1, unverändert |
| Zählerstandards | 1, unverändert |
| Abrechnungssnapshot | 2; Version 1 weiterhin lesbar |
| UI | 13 Controller, 99 Aktionskennungen |
| Navigation | 4 Gruppen, 16 Ziele, 22 lokale SVG-Icons |
| Technik | statisches HTML, CSS und JavaScript; kein Framework, TypeScript oder Buildsystem |
| PWA-Cache | `nk-pro-v99-4-12` |

## Start

`index.html` direkt in einem modernen Chromium-Browser öffnen. PWA-Installation, Service Worker und Updateverhalten benötigen HTTPS oder einen lokalen Webserver.

## Tests

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

Für reproduzierbare Browserläufe können die Playwright-Projekte einzeln mit `--workers=1` ausgeführt werden. Visuelle AP11-Referenzen entstehen über `AP11_CAPTURE=1` und `npm run test:visual`.

## AP11-Unterlagen

Siehe `AP11_NAVIGATIONSSTRUKTUR_UND_VISUELLES_GRUNDSYSTEM.md` und die dort verlinkten Inventar-, Design-, Barrierefreiheits- und Prüfunterlagen. Die AP10-Dokumente bleiben als historischer und architektonischer Nachweis erhalten.
