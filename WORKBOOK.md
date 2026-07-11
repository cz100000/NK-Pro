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

## Zurückgestellte Fachfunktion: Einmalige Korrekturen und Gutschriften

Die fachliche Erweiterung für kostenartenbezogene Korrekturen wird bewusst auf eine spätere Ausbaustufe verschoben.

Später vorgesehen:
- eigenes Datenmodell für mehrere Korrekturen je Mieter
- Zuordnung zu einer Nebenkostenart
- Richtung „zugunsten des Mieters“ oder „zulasten des Mieters“
- Begründung und gegebenenfalls Buchungsdatum
- Anpassung von Umlageergebnis, Briefen, Qualitätsprüfung, Export und Archiv
- Migration bestehender Werte aus `vorjahresKorrektur`

Für die nächste rein strukturelle Version gilt:
- keine Änderung der Rechenlogik
- keine Änderung des Datenmodells
- die bisherige Korrekturspalte bleibt fachlich zunächst unverändert
- zusätzlich wird im Tab „Kaltmiete & NK-Vorauszahlungen“ eine eigene, standardmäßig geschlossene Klappbox angelegt
- Inhalt der Klappbox zunächst nur als Platzhalter:

> Korrektur hierher überführen

Die spätere fachliche Umsetzung darf erst nach Definition und Test der vollständigen Rechen-, Brief-, Export- und Migrationslogik erfolgen.

## V98.9 – Zwischenstand der Korrektur-Umsortierung

In V98.9 wird ausschließlich eine neue, standardmäßig geschlossene Klappbox „Einmalige Korrektur / Gutschrift“ mit dem Platzhalter „Korrektur hierher überführen“ angelegt.

Die bestehende Spalte „Einmalige Korrektur / Gutschrift“ verbleibt vorerst unverändert in der Tabelle „Kaltmieteinnahmen“. Datenmodell, Rechenlogik, Briefe und Exporte bleiben unverändert. Die vollständige fachliche Überführung erfolgt erst in einer späteren, separat definierten Ausbaustufe.


## Verbindlicher UI-Referenzstandard ab V99.0

Der Tab „Kaltmiete & NK-Vorauszahlungen“ ist die verbindliche Layoutreferenz für alle Bearbeitungstabs außer Dashboard. Übertragen werden Kopfzeile, prominente mittige Zeitraumdarstellung, Kachelaufbau, Schriftgrößen, Abstände, Buttonpositionierung, Inhaltsbreite und seitliche Außenabstände. Jede künftige Version muss explizit prüfen, ob alle neun Bearbeitungstabs diesen Standard erhalten haben.

## V99.1 – Verbindliche globale Formatgrundregel

Die visuelle Grundregel gilt für Dashboard und alle Abrechnungstabs.

Verbindlich:
- die obere weiße Kopfzeile bleibt auf jeder Seite sichtbar
- identischer Seitenabstand und identische Inhaltsbreite
- einheitlicher Tab-Kopf mit Titel, prominentem Abrechnungszeitraum und Aktionen
- vier gleich hohe Übersichtskacheln, soweit der Tab Übersichtskacheln besitzt
- Kachelhöhe 168 px auf Desktop
- definierter Abstand von 12 px zwischen letztem Textinhalt und Buttonbereich
- Buttons stehen auf derselben Grundlinie
- alte tab-spezifische Regeln dürfen die globale Kopfzeile oder das Standardlayout nicht ausblenden
- Dashboard wird zunächst bewusst nach derselben Regel formatiert; spätere Dashboard-Sonderregeln werden separat definiert

Die Prüfung muss den tatsächlich gerenderten Zustand erfassen, insbesondere Sichtbarkeit der weißen Kopfzeile und gleiche Kachelhöhen.

