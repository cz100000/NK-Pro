# AP11 – Responsivität, Tastatur und Barrierefreiheit

## Breitenverhalten

- **ab 1281 px:** feste Navigation mit 316 px Breite.
- **981–1280 px:** feste Navigation mit 286 px Breite.
- **bis 980 px:** Navigation wird als 316-px-Drawer außerhalb des Viewports gehalten und über den vorhandenen Schalter geöffnet; eine Überlagerungsfläche schließt sie wieder.
- Der Inhaltsbereich verwendet `minmax(0, 1fr)`; globale horizontale Verschiebung wird verhindert.

## Höhenverhalten

Kopf, Kontextpanel und Footer bleiben getrennte Flexbereiche. Nur `.workflow-nav` scrollt. Bei höchstens 720 px Höhe werden Zeilen, Zwischenräume und Kopf kompakter, ohne Menüpunkte zu entfernen. Der Footer überlagert die Navigation nicht.

## Zoom und Windows-Skalierung

Die Navigation wurde bei 80, 100, 125 und 150 Prozent Zoomsimulation sowie 1920×1080, 1600×900, 1366×768, 1280×720 und 900×720 geprüft. Text bleibt erreichbar, die definierten Zielgrößen bleiben bedienbar, und es entsteht keine unbeabsichtigte horizontale Gesamtseitenverschiebung.

## Tastatur und Semantik

- Hauptbereich ist ein echtes `<nav aria-label="Hauptnavigation">`.
- Gruppenschalter sind Buttons mit `aria-controls` und synchronem `aria-expanded`.
- Produktname, Menüpunkte und Drawer-Schalter sind in logischer DOM-Reihenfolge erreichbar.
- `Enter`/`Leertaste` funktionieren durch native Button-Semantik.
- Der aktive Zielpunkt erhält `aria-current="page"`; auf der Arbeitsweiche erhält die Wortmarke diesen Zustand.
- Fokus ist mit einem 2-Pixel-Rahmen sichtbar und wird nicht allein farblich vermittelt.
- Icons sind nicht separat fokussierbar und besitzen keine redundanten Screenreader-Namen.

## Deaktivierte Elemente

Abrechnungsabhängige Ziele verwenden das native `disabled`-Attribut und `aria-disabled`. Der allgemeine Einstellungen-Dummy bleibt absichtlich fokussierbar, damit der Statushinweis ohne Maus erreichbar ist. Er trägt keine `data-ui-action`-Kennung und verändert weder Navigation, Fachzustand noch Persistenz.

## Bewegung und Druck

Übergänge sind kurz und funktional. Unter `prefers-reduced-motion: reduce` werden sie deaktiviert. Bestehende Druckregeln werden nicht auf das AP11-Navigationslayout ausgedehnt; AP13 bleibt für Brieflayout und Druckkonsistenz reserviert.
