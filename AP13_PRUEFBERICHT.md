# NK-Pro V99.4.17 – Prüfbericht

## Ergebnis

Die Korrekturpunkte 21 bis 26 sind umgesetzt. Vorschau, PDF und Druck verwenden weiterhin dasselbe AP13-Dokumentmodell.

## Geprüft

- Vorauszahlungsanpassung bei aktivem und deaktiviertem Schalter
- Ein- und Zweiseitenlogik einschließlich „Weiter auf Seite 2“
- Farb- und Schwarzweißmodus in Vorschau und Druckquelle
- Sticky-Vorschau bei breiten Ansichten und Rückfall auf normalen Fluss unter 1100 px
- Startnavigation, aktiver Zustand, Home-Icon und Trennlinie
- Standard-, erweiterte und schwarzweißoptimierte A4-Kontrollausgabe ohne DOM-Überlauf
- Syntax-, Referenzfall-, Zähler-, Architektur-, PWA- und Release-Konsistenzprüfungen

## Testergebnis

- 13 Browserprojekte bestanden
- 60 produktive Browsertests bestanden
- 1 optionaler AP11-Bildaufnahmefall bestimmungsgemäß übersprungen
- 8/8 AP13-Brief- und Bedienfälle bestanden
- 211 Release-Dateien in der Prüfsummenliste
- Standard-PDF: 1 A4-Seite
- Erweiterte PDF: 2 A4-Seiten
- Schwarzweiß-PDF: 2 A4-Seiten

## Einschränkung

Ein realer Ausdruck auf einem physischen Druckermodell war in der automatisierten Prüfumgebung nicht möglich. Druckvorschau und erzeugte PDF-Dateien wurden geprüft.
