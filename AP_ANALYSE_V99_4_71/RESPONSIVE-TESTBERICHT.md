# Responsive-Testbericht – V99.4.71

## Geprüfte Breiten

- Desktop 1440 px: NK-Übersicht, Wasser-Detail, Finanzen, Steuer, Drill-down.
- Tablet 820 px: Tabellenansicht.
- Smartphone 390 × 844 px: NK-Übersicht.

## Überbreite

Tablet: Dokumentbreite 805 px bei Clientbreite 805 px – keine horizontale Seitenscrollleiste.

Smartphone: Dokumentbreite 390 px bei Clientbreite 390 px – keine horizontale Seitenscrollleiste.

Der Desktop-Drill-down ist `position: fixed` rechts. Auf schmalen Viewports wird der Drawer auf 100 % Breite erweitert. Diagramme haben keine erzwungene Mindestbreite mehr und skalieren innerhalb ihres Containers.
