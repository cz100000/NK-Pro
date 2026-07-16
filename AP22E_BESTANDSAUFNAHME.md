# AP22E – Bestandsaufnahme V99.4.32

## 1. Verifizierte Arbeitsgrundlage

- Ausgangsrelease: `NK-Pro_V99_4_32_AP22D_UI_Bibliothek_Dialoge_und_Leerzustaende.zip`
- SHA-256 der hochgeladenen ZIP: `0caf0e61c63cfbfbb94f0192401a30e35e579417d6fc3c08b5d4f9f1fdd4f1d0`
- ZIP-Größe: 1.248.581 Byte
- Dateien im Ausgangsrelease: 289
- Produkttechnik: statisches HTML, CSS und JavaScript; kein Framework und kein Buildsystem
- Produktversion: V99.4.32 / AP22D
- Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Abrechnungssnapshot 2

## 2. Gelesene verbindliche Dokumente

Geprüft wurden insbesondere `NK-PRO-ARBEITSREGELN.md`, `NK-PRO-PROJEKTSTAND.md`, `ARCHITECTURE.md`, `DEVELOPMENT_GUIDE.md`, `UI_ARCHITEKTUR_AKTUELL.md`, `UI_DESIGN_TOKENS.md`, `UI_KOMPONENTENKATALOG.md`, `UI_MIGRATIONSMATRIX.md`, `UX_GUIDE.md`, `ROADMAP.md`, `TESTING.md` sowie Abschluss- und Prüfdokumente AP22A bis AP22D.

## 3. Produktiver UI-Bestand

- 14 statische `section.tab`-Seiten im Produkt-HTML; weitere kompatible oder dynamische Ziele werden durch die Seitensteuerung erzeugt beziehungsweise zugeordnet.
- 3 zentrale Navigationsgruppen: Objekt vorbereiten, Nebenkosten abrechnen und Archiv.
- 50 statische Klappboxen (`details`).
- 20 statische Tabellen; weitere Inhalte werden dynamisch erzeugt.
- 5 im Ausgangsstand markierte produktive Dialoge.
- AP22A: Namensraum, Tokens, Metadaten und Migrationsmatrix.
- AP22B: Grundkomponenten für Buttons, Felder, Karten, Klappboxen, Status und Hinweise.
- AP22C: Tabellen, Tabellencontainer, strukturierte Listen und tabellenbezogene Toolbars.
- AP22D: zentrale Dialogsteuerung und sieben Inhaltszustände.

## 4. Festgestellte Lücken vor produktiver Migration

- Es fehlte ein ranghöchster, abschließender Designvertrag.
- Tokens waren technisch vorhanden, aber nicht vollständig als Zielsystem spezifiziert.
- Seitenanatomie, Karten-/Klappboxsonderformen, allgemeine Aktionsleisten, Formulare, Kontextleiste und Responsive-Regeln waren nicht abschließend definiert.
- Die Migrationsmatrix enthielt Komponentengruppen, aber noch keine vollständige Seiten-/Bereichsinventur mit visuellem Prüf- und Legacy-Status.
- Es gab keine separate visuell prüfbare Referenzbibliothek.
- Objektive Abnahmekriterien für eine vollständig migrierte Seite fehlten.

## 5. Geschützte Produktbereiche

AP22E berührt keine produktive HTML-, CSS- oder JavaScript-Datei. Navigation, Abrechnungskontextlogik, Fachlogik, Berechnung, Datenmodell, Persistenz, Migration, Backup/Restore, Archiv/Snapshots, Dirty State, Briefe, Druck, PDF, Import, Export, Prüfregeln, Manifest und Service Worker bleiben unverändert.

## 6. Styleguide-Auswertung

Verbindlich übernommen werden helle Arbeitsflächen, kompakte professionelle Informationsdichte, klare Hierarchie, feine Rahmen, kleine bis mittlere Radien, geringe Schatten, Blau als Aktionsfarbe, semantische Statusfarben, zurückhaltende Typografie und kleine SVG-Linienicons. Die Navigation des Styleguide-Bildes wird ausdrücklich nicht übernommen.

Da das freigegebene Bild im Chat als Bilddarstellung und nicht als separat benannte Rohdatei bereitstand, enthält der Release eine lokal reproduzierte, inhaltlich äquivalente PNG-/SVG-Referenz des freigegebenen Zielbilds. Die Navigation ist darin sichtbar als nicht verbindlich gekennzeichnet.

## 7. Risikobewertung

Das zentrale Risiko von AP22E ist nicht eine Fachregression, sondern ein unbemerktes Berühren produktiver Dateien oder eine widersprüchliche Dokumentation. Deshalb werden alle produktiven HTML-, CSS- und JavaScript-Dateien vor und nach dem Paket über SHA-256 verglichen und die Referenzbibliothek statisch auf Produktdaten-, Persistenz- und Ereigniszugriffe geprüft.
