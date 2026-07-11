# NK-Pro Architekturgrundsätze

## Leitgedanke

> **Fachlich vollständig, technisch schlicht.**

NK-Pro soll alle für eine korrekte Nebenkostenabrechnung notwendigen Fachfälle abbilden, ohne dieselben Regeln mehrfach oder unnötig verteilt zu implementieren.

## Zielarchitektur

### 1. Datenmodell

Verantwortlich für:

- Abrechnungsjahre und Abrechnungszeiträume
- Wohnungen und Wohneinheiten
- Mieter und Mietverhältnisse
- Kostenarten
- Zählerstände
- Vorauszahlungen
- Archiv- und Versionsmetadaten

Regeln:

- Das Datenmodell enthält Datenstrukturen, Standardwerte, Validierung und notwendige Migrationen.
- Migrationen laufen nur beim Laden oder Import, nicht während eines normalen Renderprozesses.
- Historische Archivdaten werden nicht still verändert.
- Eine Datenstruktur erhält nur eine verbindliche Quelle je fachlichem Wert.

### 2. Berechnungslogik

Verantwortlich für:

- Umlageberechnungen
- Verbrauchsberechnungen
- Vorauszahlungssummen
- Mieter- und Eigentümeranteile
- Salden
- Plausibilitäts- und Qualitätsprüfungen
- Daten für Briefe und Berichte

Regeln:

- Berechnungsfunktionen sollen möglichst reine Funktionen sein.
- Sie lesen Eingabedaten und liefern Ergebnisse zurück.
- Sie verändern nicht nebenbei den globalen Zustand.
- Eine Fachregel wird nur einmal implementiert.
- Dashboard, Qualitätsprüfung, Briefe und Exporte verwenden dieselben Berechnungsergebnisse.
- Keine parallelen Ersatzformeln in der Oberfläche.

### 3. Oberfläche

Verantwortlich für:

- Eingaben
- Navigation
- Tabellen und Statusanzeigen
- Briefe und Druckansichten
- Nutzerhinweise
- Diagnoseanzeigen

Regeln:

- Die Oberfläche nimmt Eingaben entgegen und zeigt Ergebnisse an.
- Sie enthält keine eigenen fachlichen Berechnungsregeln.
- Renderfunktionen verändern keine fachlichen Daten.
- Ein Tabwechsel darf keine stillen Datenänderungen auslösen.
- Änderungen laufen über einen kontrollierten Änderungs- und Speicherweg.
- Bei Unsicherheit wird vollständig gerendert; lokale Renderoptimierung erfolgt nur bei klarer Abhängigkeit.

## Verbindliche Entwicklungsregeln

Jede neue Änderung muss einer Hauptschicht zugeordnet werden:

- Datenmodell
- Berechnungslogik
- Oberfläche
- technische Infrastruktur
- Test und Diagnose

Vor der Umsetzung ist zu prüfen:

1. Wird eine bestehende Fachregel wiederverwendet?
2. Entsteht eine doppelte Berechnung?
3. Verändert eine Berechnungsfunktion den Zustand?
4. Verändert eine Renderfunktion Daten?
5. Welche Ansichten hängen von der Änderung ab?
6. Welche Referenz- und Regressionstests schützen die Änderung?

## Nicht zulässige Muster

- dieselbe Formel in mehreren Tabs
- direkte Fachberechnung in HTML- oder Event-Handlern
- Datenmigration während des Renderns
- stilles Ersetzen ungültiger Eingaben durch fachlich gültige Werte
- direkte Zustandsänderung ohne Validierung und kontrolliertes Speichern
- Entfernen von Legacy- oder Archivpfaden ohne nachgewiesene Unbenutztheit
- große Komplettumbauten ohne kleine, vergleichbare Zwischenversionen

## Refactoring-Grundsätze

- keine komplette Neuentwicklung ohne zwingenden Grund
- kleine, einzeln prüfbare Schritte
- vor und nach jedem Schritt Referenzvergleich
- Berechnungslogik nur mit ausdrücklichem fachlichem Auftrag ändern
- alte Versionen nie überschreiben
- jede Version erhält Syntax-, Struktur- und Smoke-Test
- bei nicht durchführbaren Tests wird dies ausdrücklich dokumentiert

## Architekturstatus

Bereits umgesetzt:

- Rendern und Datenaufbereitung besser getrennt
- zentraler Änderungs- und Speicherweg
- kontrollierte Codebereinigung
- Speicherintegrität und Rückfallstand
- konservatives gezieltes Rendering
- Entwicklerdiagnose

Noch offen:

- vollständige Dokumentation des Datenmodells
- systematische Extraktion reiner Berechnungsfunktionen
- Reduzierung direkter globaler Zustandszugriffe
- schrittweiser Ersatz verbleibender Inline-Event-Handler
- Trennung von Produktivdiagnose und Entwicklungsdiagnose
