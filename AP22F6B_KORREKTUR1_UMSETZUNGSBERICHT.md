# AP22F6B Korrektur 1 – Umsetzungsbericht

## Ausgangsbasis

Technische Ausgangsbasis ist das freigegebene Release:

`NK-Pro_V99_4_41_AP22F6B_Nebenkostenabrechnung_Uebersicht.zip`

SHA-256 der unveränderten Ausgangs-ZIP:

`b115e38a023de05d75ae95854da8c284a24f9798ed00bc2b1d4190cc2daca139`

Die Produktversion bleibt **V99.4.41**. Die Build-/Releasebezeichnung wird eindeutig als **AP22F6B Korrektur 1** geführt.

## Umgesetzte Korrekturen

### 1. Seitenabstand und leerer Hinweisbereich

Der leere Status-/Hinweisbereich zwischen Seitenbeschreibung und Abrechnungskarte wird vollständig ausgeblendet, solange weder Status- noch Feedbackinhalt vorhanden ist. Der zuvor sichtbare gelbe Leerstreifen entfällt. Echte Status- und Fehlermeldungen bleiben im normalen Dokumentfluss sichtbar.

### 2. Abrechnungszeitraum

Die Klappbox **„1. Abrechnungszeitraum“** wurde aus der Übersichtsseite entfernt. Bei geöffneter Abrechnung erscheint in der Werkzeugzeile eine klar bezeichnete Aktion:

- **„Abrechnungszeitraum bearbeiten“** im Bearbeitungsmodus;
- **„Abrechnungszeitraum anzeigen“** im schreibgeschützten Ansichtsmodus.

Die Aktion öffnet einen separaten Dialog. Beginn, Ende, Jahresabgleich, Validierung und bestehende Aktionswege werden weiterhin unverändert verwendet. Es wurde keine neue Fachlogik eingeführt. Der Zeitraum bleibt zusätzlich in der globalen Abrechnungskontextleiste sichtbar. Bei **„+ Neue Abrechnung“** bleibt die bestehende Erfassung unverändert.

### 3. Navigation bei archivierten Abrechnungen

Beim Öffnen einer archivierten Abrechnung im Ansichtsmodus bleibt der vollständige Navigationsabschnitt **„Objekt vorbereiten“** sichtbar. Navigationseinträge, Reihenfolge, Ziele und Handler wurden nicht verändert.

## Technische Umsetzung

- `index.html`: Klappbox entfernt, separate Zeitraumaktion und Dialog ergänzt.
- `assets/app.css`: ausschließlich nachgelagerte Korrekturregeln für leere Meldungsbereiche, Zeitraumdialog und Sichtbarkeit des bestehenden Objekt-Navigationsabschnitts ergänzt.
- `js/ui-navigation-pages.js`: reine Dialog-/Darstellungssteuerung ergänzt; bestehende Schreib- und Validierungsaktionen wiederverwendet.
- PWA-Build-/Cachekennung auf `99.4.41-ap22f6b-k1` fortgeschrieben.
- Korrekturtests und reale Browser-Screenshots ergänzt.

## Nicht verändert

Datenmodell und Datenschema 5, Persistenz, Migration, Backup/Restore, Archivierung, Abrechnungsberechnung, Statuslogik, Brief-/Drucksystem, Erstellungsablauf, Navigationseinträge und fachliche Handler bleiben unverändert.
