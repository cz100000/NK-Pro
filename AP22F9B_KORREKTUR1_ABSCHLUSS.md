# AP22F9B Korrektur 1 – Abschluss

**Produktversion:** V99.4.44  
**Korrekturstand:** AP22F9B Korrektur 1  
**Datenschema:** 5 (unverändert)  
**PWA-Build-ID:** `99.4.44-ap22f9b-k1`

## Anlass

Die Browser-Sichtprüfung des ersten AP22F9B-Releases ergab zwei Abweichungen vom verbindlichen NK-Pro-Designstandard:

1. Die Tabellenköpfe der Seite „Gesamtkosten“ wurden weiterhin durch einen globalen Altselektor dunkelblau dargestellt und automatisch als sortierbar markiert.
2. Die vier Kennzahlenkacheln verwendeten Textglyphen in hinterlegten Symbolkästen statt der verbindlichen Linien-SVG-Systematik.

## Ergebnis

- Haupttabelle und Umlagetabelle verwenden nun denselben neutralen hellgrauen Tabellenkopfstandard wie die bereits migrierte Seite „Vorauszahlungen“.
- Automatisch ergänzte Sortierklassen und Klickhandler werden ausschließlich für die beiden Gesamtkostentabellen nach dem Rendern entfernt.
- Alle vier Kennzahlenkacheln verwenden echte Linien-SVGs ohne Symbolhintergrund oder Symbolrahmen.
- Statusfarben bleiben auf den vorhandenen Status beschränkt: vollständig = grün, offener Hinweis = orange.
- Fachlogik, Datenmodell, Berechnung, Speicherung, Migration, Archivierung, Brief und Druck sind unverändert.
- Navigation, Seitenkopf und globale Kontextleiste sind unverändert.

## Prüfung

- AP22F9B-Statiktest: bestanden
- AP22F9B-Browsertest: bestanden
- Schutzbereiche: bestanden (13 Vollhashes und 5 Teilbereiche)
- Syntaxprüfung: 55 JavaScript-Einheiten bestanden
- Fixture-Prüfung: 6 Referenzfälle bestanden
- Release-Prüfung: bestanden
- ZIP-Inhaltsprüfung: bestanden

Der bereits vorhandene Ausgangsfehler in `tests/ap20-asset-refresh-regression.test.cjs` bleibt unverändert dokumentiert.
