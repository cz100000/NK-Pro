# NK-Pro V99.4.20 – Bereichs-Dashboards, Navigationslogik und UI-Bereinigung

NK-Pro ist eine lokale, frameworkfreie HTML/CSS/JavaScript-PWA zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen. AP17 ergänzt zwei schlanke Bereichs-Dashboards, eine globale Abrechnungskontextleiste, unabhängig klappbare Navigationsgruppen und bereinigte Bearbeitungsseiten.

## Verbindlicher Stand

| Merkmal | Wert |
|---|---|
| App-Version | V99.4.20 |
| Basis | AP16-Korrekturstand V99.4.19 „Mockupnahe UI“ |
| Versionsname | AP17-Bereichs-Dashboards, Navigationslogik und UI-Bereinigung |
| Datenschema | 5 |
| Datenebenenvertrag | 1 |
| Abrechnungssnapshot | 2 |
| Dokumentlayout | 4 |
| UI-System | 3 |
| Navigation | 4 |
| PWA-Cache | `nk-pro-v99-4-20-ap17` |

## AP17-Kernergebnis

- zwei neue Bereichsübersichten für Objektvorbereitung und Nebenkostenabrechnung,
- 15 reale Dashboardwerte und 15 klar als Vorschau gekennzeichnete DUMMY-Werte,
- globale Kontextleiste statt des bisherigen Sidebar-Informationsblocks,
- vier unabhängig speicherbare Navigationsgruppen mit ARIA- und Tastaturbedienung,
- 119 entfernte oder umgewandelte generische Karten,
- elf fachlich vereinheitlichte lokale SVG-Icons im Abrechnungsbereich,
- kompaktere Inhaltskopfzeilen und responsive Dashboard-/Kontextdarstellung,
- unveränderte Daten-, Abrechnungs-, Zähler-, Brief-, Druck-, PDF- und Schwarzweißlogik.

## Start und Tests

```bash
npm ci
npx playwright install chromium
npm run release:check
```

`node_modules`, Testreports und Browserprofile gehören nicht in die Arbeits-ZIP.

## Verbindliche AP17-Dokumente

- `AP17_BEREICHS_DASHBOARDS_NAVIGATIONSLOGIK_UND_UI_BEREINIGUNG.md`
- `AP17_PRUEFBERICHT.md`
- `AP17_TEST_RESULTS.json`
- `AP17_DATEIAENDERUNGEN.md`
- `AP17_DATEIAENDERUNGEN.json`
- `NK-PRO-PROJEKTSTAND.md`
