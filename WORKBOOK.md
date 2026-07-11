# NK-Pro – Projekt-Workbook

## Zurückgestellte Architekturmaßnahme

**Status:** später umsetzen – aktuell keine Änderung an V98.7

### Ziel: langfristig stabile und technisch schlichte Oberfläche

Für eine langfristig stabile App soll die derzeitige dynamische Umstrukturierung der Tabs später durch einen festen, klaren Aufbau ersetzt werden.

Geplante Maßnahmen:

1. Klappboxen und Kacheln fest im HTML aufbauen.
2. Bestehende Inhalte direkt in den vorgesehenen Klappboxen und Kacheln platzieren.
3. Keine nachträgliche Verschiebung vieler DOM-Elemente beim Start der App.
4. Pro Tab einen klar abgegrenzten Renderer verwenden.
5. Gemeinsame kleine UI-Komponenten für Seitenkopf, Kacheln, Klappboxen, Tabellen und Statusanzeigen einsetzen, statt einer großen zentralen Umbaufunktion.

### Begründung

- geringeres Risiko von Darstellungs- und Initialisierungsfehlern
- leichter prüfbare Tabs
- klarere Trennung zwischen Daten, Berechnung und Darstellung
- einfachere Wartung und Weiterentwicklung
- bessere Grundlage für Regressionstests
- Einhaltung des Projektgrundsatzes: **„Fachlich vollständig, technisch schlicht.“**

### Umsetzungsvoraussetzung

Vor Beginn dieser Architekturarbeit wird eine stabile Referenzversion festgelegt. Danach werden die Tabs schrittweise umgebaut und jeweils gegen identische Testdaten geprüft. Berechnungs-, Speicher-, Archiv- und Brieflogik dürfen dabei nicht verändert werden.
