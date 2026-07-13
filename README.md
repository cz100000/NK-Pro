# NK-Pro V99.4.13 – Restentkopplung und globale Zustandsbereinigung

NK-Pro ist eine lokale, frameworkfreie HTML/CSS/JavaScript-PWA zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen. V99.4.13 reduziert `app.js` auf Start und Verdrahtung, ordnet Zustandseigentum eindeutig zu und isoliert UI-, Dialog-, Seiten- und Browserabläufe.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.13 |
| Ausgangsversion | V99.4.12 |
| Datenschema / Datenebenenvertrag | 5 / 1, unverändert |
| Objektstandard / Abrechnungssnapshot | 1 / 2, unverändert |
| Zählerstandards | 1, unverändert |
| UI | 13 Controller, 99 Aktionskennungen, zentrale Ereignisdelegation |
| Navigation | AP11-Grundsystem: 4 Gruppen, 16 Ziele, 22 lokale SVG-Icons; Abrechnungsgruppe ohne Untergruppe korrigiert |
| `app.js` | 225 Zeilen, 15.599 Byte; Start, Verdrahtung und Orchestrierung |
| PWA-Cache | `nk-pro-v99-4-13` |
| Technik | statisches HTML, CSS und JavaScript; kein Framework, TypeScript oder Buildsystem |

## Start und Tests

`index.html` in Chromium öffnen. PWA-Installation und Service Worker benötigen HTTPS oder einen lokalen Webserver.

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser -- --workers=1
```

AP12-Nachweise beginnen mit `AP12_RESTENTKOPPLUNG_UND_ZUSTANDSBEREINIGUNG.md`. AP13 ist für Brieflayout, Druckbild und Vorschaukonsistenz reserviert.
