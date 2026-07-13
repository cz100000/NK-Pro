# NK-Pro – Technischer Schuldenstand V99.4.12

## In AP11 erledigt

- produktive Navigation statt visueller Überlagerung umgebaut,
- alte parallele Navigations-CSS-Blöcke entfernt,
- semantisches `<nav>`, konsistente SVG-Icons und zentrale Tokens eingeführt,
- aktive/deaktivierte Zustände und Tastaturfokus regressiv abgesichert,
- geringe Höhe, Notebookbreite und Drawer konsistent gelöst,
- Einstellungen-Dummy ohne leere Seite oder Fachzustandswirkung umgesetzt.

## Verbleibend

1. `app.js` bleibt mit 6.294 Zeilen, 518 Top-Level-Funktionen, 67 Top-Level-Bindungen und 96 direkten Schreibstellen groß. AP12 muss Restorchestrierung und globale Bindungen abbauen.
2. 112 Legacy-Kompatibilitätswrapper bestehen fort und sind in AP12 kontrolliert zu reduzieren.
3. Formulare, Tabellen und Dialoge verwenden noch ältere Einzelstile; AP11 vereinheitlicht nur die angrenzenden Grundflächen.
4. Briefvorschau und Druckausgabe besitzen eigenständige Altstile und sind ausdrücklich Gegenstand von AP13.
5. Der Footer zeigt bewusst nur lokalen Status; eine echte Benutzer- oder Einstellungsverwaltung existiert nicht.
6. Der Drawer ist Desktop-first und keine vollständige mobile Informationsarchitektur.

## Schutzregeln

Keine Schuldenbereinigung darf Datenschema 5, Vertrag 1, Objektstandard 1, Zählerstandards 1, Snapshot 2 oder Referenzabrechnungen stillschweigend verändern.
