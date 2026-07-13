# AP13 – Brieflayout, Druckbild und Vorschaukonsistenz

**Version:** V99.4.14  
**Basis:** V99.4.13  
**Datum:** 13. Juli 2026

## Ausgangsbefund

Die Abweichungen zwischen Bildschirmvorschau und Druck hatten drei konkrete technische Ursachen:

1. Vorschau und Druck wurden durch getrennte, historisch gewachsene CSS-Regeln beeinflusst. Mehrere ältere Selektoren veränderten Maße, Abstände und Umbruchverhalten abhängig vom Ausgabekanal.
2. Der vorhandene Briefrenderer erzeugte noch ein älteres Tabellenmodell mit sieben Spalten sowie zusätzliche Vorauszahlungs- und Ergebnisbereiche. Dieses Modell entsprach weder der finalen neunspaltigen Referenztabelle noch der vereinbarten Zusammenführung der Vorauszahlungen in der Haupttabelle.
3. Die zweite Seite wurde teilweise aus gemessenem Überlauf beziehungsweise als eigenständiges Vorauszahlungsblatt abgeleitet. Dadurch war die Seitenzahl nicht ausschließlich an die verbindlichen fachlichen Zusatzinhalte gekoppelt.

## Umsetzungsplan

- einen einzigen Renderer für Vorschau, Druck und PDF verwenden,
- vollständige DIN-A4-Seiten mit physischen Maßeinheiten erzeugen,
- die Ein-/Zweiseitenlogik explizit an Zusatzhinweis und Vorauszahlungsanpassung binden,
- beide Tabellen entsprechend den finalen Referenzen neu strukturieren,
- die vorhandenen variablen Texte vollständig an das neue Dokumentmodell anbinden,
- Vorschau ausschließlich als skalierte vollständige A4-Seite darstellen,
- strukturelle, fachliche, browserbasierte und visuelle Kontrollprüfungen ergänzen.

## Technische Umsetzung

### Gemeinsames Dokumentmodell

`js/document-renderer.js` erzeugt nun das vollständige Briefdokument einschließlich eines eingebetteten gemeinsamen Basis-Stylesheets. Dieses identische HTML wird in der Vorschau angezeigt und von `printWindowHtml()` unverändert in das Druck-/PDF-Fenster übernommen. Der Druckweg besitzt keinen alternativen Briefrenderer und keine abweichende Tabellenstruktur.

Jede Dokumentseite ist eine feste `210 mm × 297 mm` große `.letter-sheet`. `@page { size: A4; margin: 0; }` und physische Maßeinheiten sichern das Druckformat. Die Vorschau verändert nur den Skalierungsfaktor der vollständigen Seite; Schriftgrößen, Spaltenbreiten, Zeilenhöhen und Seitenumbrüche bleiben unverändert.

### Seitenlogik

Seite 2 wird ausschließlich erzeugt, wenn mindestens eine der folgenden Bedingungen erfüllt ist:

- `outroText` enthält einen zusätzlichen Hinweis,
- die tatsächlich auszugebende Vorauszahlungsanpassung enthält mindestens eine Änderung.

Ohne beide Bedingungen wird genau eine Seite erzeugt. Briefkopf und Informationsblock werden auf Seite 2 identisch wiederholt. Gruß, Unterschrift und Anlagenhinweis werden genau einmal am tatsächlichen Dokumentende ausgegeben.

### Seite 1

Umgesetzt wurden:

- Briefkopf „Ute Zimmermann · Vermietung“ mit Kontaktzeile und blauer Trennlinie,
- Informationsblock für Zeitraum, Objekt, Einheit und Datum,
- Anschriftenfenster mit kleiner Rücksendezeile,
- Titel, Anrede und variabler Einleitungstext,
- dreiteilige dynamische Ergebnisleiste,
- neunspaltige Haupttabelle über 100 % des Satzspiegels,
- vollständige innere Tabellenlinien einschließlich der Trennlinie zwischen „Preis pro Einheit“ und „Ihr Anteil“,
- Vorauszahlungen und Abrechnungsergebnis innerhalb der Haupttabelle,
- Hinweisbox und Zahlungstext in regulärer Brieftextgröße,
- Abschlussblock nur im einseitigen Fall,
- dynamische Fußzeile „Seite X von Y“.

Ein separater Vorauszahlungsblock und eine separate Box „Abrechnungsergebnis“ werden nicht mehr erzeugt.

### Seite 2

Die optionale zweite Seite enthält nur tatsächlich benötigte Zusatzblöcke. Die Tabelle zur Vorauszahlungsanpassung nutzt dieselbe blaue Tabellenvisualisierung wie die Haupttabelle, feste kontrollierte Spaltenbreiten, sieben logische Spalten sowie die vereinbarten Summenbereiche. Der Dauerauftragshinweis, optionale Abschlusstext, Gruß-/Unterschriftenblock und Anlagenhinweis stehen am tatsächlichen Dokumentende.

### Variable Standardtexte

Beibehalten beziehungsweise ergänzt angebunden sind:

- Einleitungstext,
- Zahlungstext bei Nachzahlung,
- Zahlungstext bei Guthaben,
- allgemeiner Hinweistext,
- zusätzlicher Hinweistext,
- Text zur Vorauszahlungsanpassung,
- Hinweis zum Dauerauftrag,
- optionaler Abschlusstext,
- Grußformel, Unterschriftenname und Anlagenhinweis.

Leere optionale Texte unterdrücken den jeweiligen Block. Die Bearbeitungsfelder befinden sich außerhalb des Dokument-DOM und werden beim Direktdruck sowie im dedizierten Druckfenster ausgeblendet.

## Unveränderte fachliche Grenzen

AP13 verändert keine Berechnung, Abrechnungswerte, Rundung, Vorzeichenlogik, Stammdaten, Archive, Sicherungen oder fachlichen Datenstrukturen. Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Abrechnungssnapshot 2 und alle Zählerstandards 1 bleiben unverändert.

## Betroffene Kernbereiche

- `js/document-renderer.js`
- `js/document-data.js`
- `js/ui-documents.js`
- `js/diagnostics.js`
- `assets/app.css`
- AP13-Struktur-, Browser- und Kontrollausgabetests
- Versions-, PWA- und Projektdokumentation
