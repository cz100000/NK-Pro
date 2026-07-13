# NK-Pro V99.4.12 – Navigationsstruktur und visuelles Grundsystem

## Zweck

AP11 baut die tatsächlich produktive Seitenleiste anhand der verbindlichen Bildreferenz um. Navigation, Icons, Farben, Typografie, Abstände, Zustände, Responsivität und Barrierefreiheit bilden nun ein gemeinsames, offlinefähiges Grundsystem. Fachlogik und Datenstandards bleiben unverändert.

## Ergebnis

- genau eine produktive, semantische Hauptnavigation,
- 4 Gruppen und 16 weiterhin erreichbare Zielseiten,
- 22 lokale SVG-Icons ohne Netzabhängigkeit,
- konsistenter aktiver, inaktiver, fokussierter und deaktivierter Zustand,
- allgemeiner Einstellungen-Dummy im Footer mit „Noch nicht verfügbar“,
- Desktopbreiten 316/286 px und Drawer unter 981 px,
- kontrolliertes Scrollen bei geringer Höhe,
- zentrale CSS-Tokens für Navigation und angrenzende Grundflächen,
- unveränderte 13 UI-Controller und 99 Aktionskennungen.

## Architekturgrenze

`index.html` enthält ausschließlich semantisches Markup und lokale SVGs. `assets/app.css` definiert Darstellung und responsive Zustände. `js/navigation.js` synchronisiert Gruppenöffnung, aktiven Pfad und nicht fachliche UI-Präferenzen; der aktive Zustand wird aus der tatsächlich sichtbaren Seite abgeleitet. Fachzustand, Berechnung, Persistenz und Rendering bleiben außerhalb der Navigation.

## Verbindliche Detaildokumente

- `AP11_REFERENZBILDANALYSE.md`
- `AP11_NAVIGATIONSINVENTAR.md`
- `AP11_DESIGN_TOKENS.md`
- `AP11_ICONUEBERSICHT.md`
- `AP11_RESPONSIVE_BARRIEREFREIHEIT.md`
- `AP11_VORHER_NACHHER.md`
- `AP11_PRUEFBERICHT.md`
- `AP11_NAVIGATION_INVENTORY.json`
- `AP11_TEST_RESULTS.json`
- `AP11_VISUAL_REFERENCES/`

## Nicht Bestandteil

Briefvorschau, Druckbild und tatsächliche Dokumentgestaltung wurden nicht neu gestaltet. Diese Themen bleiben ausdrücklich AP13 vorbehalten. AP12 ist die Restentkopplung von `app.js` und die globale Zustandsbereinigung.
