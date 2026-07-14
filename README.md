# NK-Pro V99.4.21 – Korrekturen, UI-Feinschliff und UX-Bereinigung

NK-Pro ist eine lokale, frameworkfreie HTML/CSS/JavaScript-PWA zur Erstellung, Prüfung, Archivierung und Ausgabe von Nebenkostenabrechnungen. AP18 vereinheitlicht Navigation, Aktionsflächen, Fokuszustände, Markenassets, PWA-Icons und die Bildschirmbedienung der Briefvorschau, ohne Fach- oder Dokumentlogik zu verändern.

## Verbindlicher Stand

| Merkmal | Wert |
|---|---|
| App-Version | V99.4.21 |
| Basis | V99.4.20 / AP17 |
| Versionsname | AP18-Korrekturen, UI-Feinschliff und UX-Bereinigung |
| Datenschema | 5 |
| Datenebenenvertrag | 1 |
| Abrechnungssnapshot | 2 |
| Dokumentlayout | 4 |
| UI-System | 4 |
| Navigation | 5 |
| PWA-Cache | `nk-pro-v99-4-21-ap18` |

## AP18-Kernergebnis

- neues lokales NK-PRO-Logo sowie Favicon-, iOS-, reguläre und maskierbare PWA-Icons,
- dauerhaft sichtbarer und klar gewichteter globaler Start-Eintrag,
- acht zentrale Button-/Interaktionsvarianten mit konsistenten Hover-, Fokus-, Aktiv- und Deaktivzuständen,
- Briefvorschau mit Ganze Seite, Seitenbreite, 40–200 Prozent, 10-Prozent-Schritten und Sitzungsspeicherung,
- Werkzeugleiste der Briefvorschau in Ansicht, Darstellung und Ausgabe gruppiert,
- kompaktere Kontextleiste und Seitenköpfe,
- Responsive-, Dialog-, Tabellen-, Formular- und Fokus-Feinschliff,
- 24 bereinigte CSS-Regeln/Blöcke und zwei ersetzte Inline-Stile,
- unveränderte Daten-, Fach-, Abrechnungs-, Zähler-, Brief-, Druck-, PDF- und Schwarzweißlogik.

## Start und Tests

Die Anwendung kann direkt über `index.html` lokal gestartet werden. Für den reproduzierbaren Testpfad:

```bash
npm ci
npx playwright install chromium
npm run release:check
```

Ein bereits vorhandener Chromium-Browser kann über `CHROMIUM_EXECUTABLE_PATH` verwendet werden. `node_modules`, Testreports, Browserprofile und eingebettete Archive gehören nicht in die Release-ZIP.

## Verbindliche AP18-Dokumente

- `AP18_KORREKTUREN_UI_FEINSCHLIFF_UND_UX_BEREINIGUNG.md`
- `AP18_PRUEFBERICHT.md`
- `AP18_TEST_RESULTS.json`
- `AP18_DATEIAENDERUNGEN.md`
- `AP18_DATEIAENDERUNGEN.json`
- `AP18_RELEASE_CONTENT_POLICY.json`
- `NK-PRO-PROJEKTSTAND.md`
