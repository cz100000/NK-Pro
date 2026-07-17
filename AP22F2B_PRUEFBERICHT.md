# AP22F2B – Prüfbericht

## Abnahmeergebnis

Die technische und visuelle Migration ist bestanden:

- AP22F2B-Statik und Komponentenmatrix: bestanden,
- 23 vollständige Datei- und 12 Fragment-Schutzprüfungen: bestanden,
- 15 aktuelle AP22F2B-Chromiumfälle: bestanden,
- sechs Ziel-Viewports und 200-%-Zoomäquivalent: bestanden,
- AP22F1B-Verhalten und 9 Browserfälle: bestanden,
- AP22F1C-Dialogverhalten 5 Browserfälle sowie aktuelle Dialog-/Versionsfälle: bestanden,
- AP21B2 Navigation statisch und 3 Browserfälle: bestanden,
- Syntax, sechs Fixtures, Zähler-, Architektur- und AP21C-Prüfungen: bestanden,
- Dokumentexport, Migration/Restore, Modulgrenzen, UI-Ereignisse, Persistenz/Backup, sechs Referenzfälle, Archiv-/Jahreswechselorchestrierung und AP12-Startfolge: bestanden.

## Visuelle Abnahme

Handlungsbedarf, vollständiger Zustand und 390×844 wurden gegen die freigegebenen AP22F2A-Zielansichten geprüft. Die Seite besitzt eine ruhige kompakte Zusammenfassung, eine sichtbare Primäraktion, vier neutrale Arbeitsbereichskarten, eine nachrangige DUMMY-Karte und keine Doppel- oder Kostenartenanzeigen. Es besteht kein horizontaler Gesamtseiten-Overflow.

## Schutzprüfung

Unverändert bestätigt sind Navigation, Kontextleiste, Objektstandard, Stammdatenaktionen, produktive Zielseiten, Zählerlogik, Datenmodell, Persistenz, Migration, Backup/Restore, Archiv, Berechnung, Snapshot, Export, Dokumentdaten, Dokumentrenderer, Qualitätsregeln und Abrechnungsbereiche. Service-Worker-Funktionslogik und geschützte HTML-Fragmente sind nach Normalisierung ausschließlich der freigegebenen Versionsstellen hashgleich.

## Historische unveränderte Tests

Einige bestehende Testdateien enthalten absichtlich nicht geänderte, release-feste Altassertionen. AP17 erwartet eine frühere Paketversion und ältere Dashboard-/Navigationszustände. AP19 und ein AP20-Fall erwarten die seit AP22F1A verbindlich entfernte Modusangabe. AP22E erwartet die ursprüngliche V99.4.32-Produktbasis und zwölf Referenzgruppen. Diese Altassertionen sind kein AP22F2B-Produktfehler; ihre noch gültigen fachlichen Aussagen werden durch aktuelle Schutz- und Browsertests abgedeckt.

## Bekannte Restpunkte

Innerhalb des freigegebenen AP22F2B-Umfangs besteht kein offener Produktfehler. Weitere Seitenmigrationen benötigen ein eigenes Planungs- und Freigabepaket.
