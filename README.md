# NK-Pro V99.4.17 – Brieflayout, Druckbild und Vorschaukonsistenz

NK-Pro ist eine lokale, frameworkfreie HTML/CSS/JavaScript-PWA zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen. V99.4.17 setzt AP13 um und vereinheitlicht Bildschirmvorschau, Druck und PDF auf ein gemeinsames DIN-A4-Dokumentmodell.

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| App-Version | V99.4.17 |
| Ausgangsversion | V99.4.13 |
| Versionsname | Brieflayout, Druckbild und Vorschaukonsistenz |
| Datenschema / Datenebenenvertrag | 5 / 1, unverändert |
| Objektstandard / Abrechnungssnapshot | 1 / 2, unverändert |
| Zählerstandards | 1, unverändert |
| Dokumentlayout | AP13-Version 1; gemeinsames HTML/CSS für Vorschau, Druck und PDF |
| Seitenformat | DIN A4, feste 210 × 297 mm |
| Seitenlogik | 1 Seite standardmäßig; Seite 2 nur bei Zusatzhinweis und/oder Vorauszahlungsanpassung |
| Navigation | AP11-Grundsystem mit vier Gruppen und 16 Zielen; Abrechnungsgruppe ohne Untergruppe |
| `app.js` | 225 Zeilen; Start, Verdrahtung und Orchestrierung |
| PWA-Cache | `nk-pro-v99-4-16` |
| Technik | statisches HTML, CSS und JavaScript; kein Framework, TypeScript oder Buildsystem |

## AP13-Kernergebnis

- vollständiges Briefdesign nach den finalen Ein- und Zweiseitenreferenzen,
- neunspaltige Haupttabelle mit Vorauszahlungen und vollständigen Trennlinien,
- kein separater Vorauszahlungs- oder Abrechnungsergebnisblock,
- identischer Kopf und Informationsblock auf Seite 2,
- Gruß-/Unterschriftenblock genau einmal am Dokumentende,
- variable Standardtexte weiterhin bearbeitbar,
- skalierte vollständige A4-Vorschau ohne alternatives Umbruchmodell,
- ein- und zweiseitige Kontroll-PDFs im Projektstamm.

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

Nur AP13 prüfen beziehungsweise Kontrollausgaben neu erzeugen:

```bash
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:ap13
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node tools/generate-ap13-controls.cjs
```

Technische Details: `AP13_BRIEFLAYOUT_DRUCKBILD_VORSCHAUKONSISTENZ.md`. Prüfergebnisse: `AP13_PRUEFBERICHT.md` und `AP13_TEST_RESULTS.json`.
