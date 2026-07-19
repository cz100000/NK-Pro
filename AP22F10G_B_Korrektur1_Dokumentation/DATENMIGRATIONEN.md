# Datenmigrationen AP22F10G-B Korrektur 1

## Ergebnis

Es ist keine zwingende Datenmigration erforderlich.

- Datenschema bleibt Version 5.
- Der V99.4.58-Gesamtbestand kann unmittelbar importiert werden.
- Bestehende Stammdaten, Abrechnungsdaten, Wasserwerte, manuelle Einzelwerte, Historie und Jahresarchive werden unverändert geladen.

## Optionale neue Metainformation

Nur wenn der Nutzer einen übernommenen Anfangsstand im Sonderfalldialog ausdrücklich zur Bearbeitung freigibt, wird optional folgende Sammlung angelegt:

`meta.individualValuesStartOverrides`

Ein Eintrag enthält:

- stabile Zähler-ID,
- Quelljahr der Vorjahresübernahme,
- ursprünglich übernommener Wert,
- Bestätigungszeitpunkt,
- Bestätigungsart,
- optionale Bemerkung.

Diese Erweiterung ist abwärtsverträglich, erzeugt beim Import keine Einträge und verändert den übertragenen Anfangsstand nicht. Erst eine anschließende bewusste Eingabe und Speicherung ändert den Wert.
