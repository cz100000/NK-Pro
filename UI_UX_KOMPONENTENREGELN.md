# NK-Pro – Verbindliche Komponentenregeln

## Allgemeine Regel

Jede Komponente verwendet ausschließlich zentrale Tokens, freigegebene Varianten und semantische Zustände. Lokale visuelle Sonderlösungen sind unzulässig. Fachliche Zustandslogik bleibt in den vorhandenen Fach- und Anwendungsschichten.

## 1. Navigation

- **Zweck:** primäre Orientierung und Wechsel zwischen NK-Pro-Bereichen.
- **Quelle:** produktiver Stand V99.4.32; in AP22E geschützt.
- **Varianten:** Desktop, bestehendes Responsive-Overlay, aktive/inaktive/deaktivierte Ziele, geöffnete/geschlossene Gruppen.
- **Zustände:** Standard, Hover, Fokus, aktiv, deaktiviert.
- **Icons:** bestehende V99.4.32-Linienicons unverändert.
- **Tastatur:** bestehende Reihenfolge, Escape- und Overlay-Verhalten erhalten.
- **Verbot:** Änderung von Struktur, Breite, Gruppierung, Reihenfolge, Icons, Klappverhalten oder Logik ohne gesonderte Freigabe.

## 2. Globale Kopf- und Werkzeugleiste

- Gleichbleibende Höhe, vertikale Zentrierung und klarer Abstand zur Kontextleiste.
- Globale Werkzeuge stehen rechts; seitenspezifische Aktionen gehören in den Seitenkopf.
- Iconaktionen benötigen zugänglichen Namen, Mindestzielgröße und Tooltip nur als Ergänzung.
- Auf schmaler Breite darf Text reduziert werden, sofern zugängliche Beschriftung und Eindeutigkeit erhalten bleiben.

## 3. Gelbe Abrechnungskontextleiste

### Anatomie

1. Bezeichnung „Abrechnungskontext“
2. Objekt
3. vollständiger Abrechnungszeitraum
4. Status
5. kontextabhängiger Aktionsbereich

### Zustände

- **Kein Kontext:** neutrale Information und bestehende zulässige Aktion zum Öffnen oder Wechseln.
- **Bearbeitung:** Objekt, vollständiger Zeitraum, fachlicher Status und bestehende Kontextaktionen.
- **Nur ansehen:** keine Modusangabe; der Zustand wird durch die größere Schreibschutz-Notice und eingeschränkte Bedienmöglichkeiten vermittelt. `Zur Bearbeitung öffnen` verbleibt in der Notice.
- **Geschlossen/Archiv:** Objekt, vollständiger Zeitraum, fachlicher Status und zulässige Folgeaktion.
- **Korrektur:** Objekt, vollständiger Zeitraum und fachlicher Status ohne zusätzliche konkurrierende Plakette oder Modusangabe.

### Gestaltung

Zurückhaltender warmer Gelbton, feiner Rahmen, keine starke Warnoptik. Informationen stehen kompakt in semantischer Reihenfolge. Aktionen sind sekundär oder primär entsprechend der bestehenden Fachlogik. Bei Umbruch bleiben Titel und Werte vor Aktionen.

### Verbot

Keine Fachlogikänderung, keine zweite Kontextanzeige, keinerlei sichtbare oder versteckte Modusangabe in der Kontextleiste und keine zusätzliche kleine „Schreibgeschützt“-Kennzeichnung im Seitenkopf.

## 4. Seitenschale

- **Breiten:** flexibel; `--nk-ui-content-max`, `--nk-ui-content-wide` und `--nk-ui-content-narrow`.
- **Innenabstand:** zentral 32 px, unter 1280 px 24 px und unter 620 px 16 px über semantische Schalentokens.
- **Vertikaler Rhythmus:** `--nk-ui-space-xl` zwischen Hauptbereichen.
- **Verbot:** lokale Seitenränder oder eigene Maximalbreiten.

## 5. Seitenkopf

### Varianten

- `title`
- `title-description`
- `title-actions`
- `title-description-actions`

Titel ist `h1`. Beschreibung ist kurz, sekundär und nicht redundant. Aktionen bilden eine geordnete Gruppe. Auf schmaler Breite stehen Aktionen unter dem Text und dürfen volle Breite einnehmen.

## 6. Layoutsysteme

- **Stack:** vertikale Folge mit `sm`, `md`, `lg`, `xl`.
- **Cluster:** horizontale, umbrechende Gruppe.
- **Einspaltig:** Standard für Formulare und lineare Abläufe.
- **Zweispaltig:** nur für gleichwertige oder klar Haupt-/Nebeninhalt getrennte Bereiche.
- **Dashboardraster:** responsive `auto-fit`-Spalten mit Mindestbreite.
- **Kartenraster:** gleiche Kartenhöhe nur bei vergleichbarem Inhalt.
- **Haupt/Neben:** Hauptbereich mindestens doppelte Breite; unter mittlerer Breite Stapelung.
- **Verbot:** starre Pixelspalten, die bei Zoom oder Übersetzung brechen.

## 7. Karten

### Gemeinsame Anatomie

Optionaler Kopf, Inhalt, optionaler Fuß. Eine Karte verwendet feinen Rahmen, mittleren Radius und höchstens leichten Schatten.

### Varianten

- **Standardkarte:** allgemeine fachliche Gruppierung.
- **Kennzahlenkarte:** Label, Kennzahl, kurze Einordnung.
- **Statuskarte:** Textstatus plus Icon/Punkt und optionale Aktion.
- **Dashboardkarte:** zusammengefasster Einstieg oder Arbeitsstand.
- **Fachliche Inhaltskarte:** längerer strukturierter Inhalt.
- **Interaktive Karte:** vollständig fokussierbare Aktion; Hover und Fokus klar, kein verschachtelter konkurrierender Link.
- **Kompakte Karte:** geringe Innenabstände für Nebeninformationen.
- **Karte mit Aktionen:** Aktionen im Kopf oder Fuß, nicht verstreut.

### Verbot

Keine Karte nur als dekorativer Rahmen, keine mehrfach verschachtelten Karten, keine lokalen Schatten oder Radien, keine Statusfarbe als alleinige Bedeutung.

## 8. Klappboxen

### Varianten

- fachliche Standardklappbox,
- kompakte Klappbox,
- Klappbox mit Status,
- Klappbox mit Warnung/Handlungsbedarf,
- Klappbox mit ergänzender Aktion.

Kopf enthält Titel, optional Status und Chevron. Der gesamte Klappkopf ist tastaturbedienbar. `aria-expanded` und Inhaltsbeziehung sind korrekt. Aktion und Klappschalter dürfen nicht unklar dieselbe Klickfläche teilen. Warnfarbe bleibt semantisch und wird durch Text ergänzt.

## 9. Tabellen und Listen

### Tabellenvarianten

- Datentabelle,
- kompakte Datentabelle,
- Statustabelle,
- Ergebnisliste in Tabellenform,
- Aktionsspalte,
- Tabellenfilter,
- leere Tabelle,
- responsive Darstellung.

Tabellen verwenden `scope="col"`, klare Kopfzeilen, ruhige Linien und ausreichende Zellenabstände. Zahlen sind konsistent ausgerichtet. Aktionsspalten sind klar beschriftet. Tabellenfilter stehen in einer zentralen Toolbar. Leere Tabellen verwenden den zentralen Zustand statt leerer Rahmen.

Auf schmaler Breite bleibt die Tabelle im eigenen Container horizontal scrollbar; eine Karten-/Listenalternative ist nur als ausdrücklich freigegebene Variante zulässig. Die Gesamtseite darf nicht horizontal scrollen. AP22C bleibt technische Grundlage.

### Listen

Freigegeben sind Standard-, einfache, getrennte, Definitions- und Checkliste. Listen werden semantisch statt durch manuelle Zeilenumbrüche strukturiert.

## 10. Formulare

### Feldtypen

Text, Zahl, Auswahl, Datum, Checkbox, Radiogruppe, Pflichtfeld, Hilfetext, Fehler, Warnung, deaktiviert, schreibgeschützt, Feldgruppe und Formularabschnitt.

### Anatomie

Label, Steuerung, optionaler Hilfetext, optionaler Status-/Fehlertext. Pflicht wird textlich oder semantisch markiert. Fehler stehen unmittelbar am Feld und sind mit `aria-describedby` beziehungsweise `aria-invalid` verbunden.

### Zustände

- Standard
- Hover
- Fokus
- ausgefüllt
- fehlerhaft
- Warnung
- deaktiviert
- schreibgeschützt

Deaktiviert bedeutet nicht bedienbar. Schreibgeschützt bleibt lesbar, fokussierbar soweit sinnvoll und wird nicht wie ein Fehler dargestellt. Zahlenfelder verwenden die vorhandene fachliche Eingabe- und Lokalisierungslogik.

## 11. Buttons und Aktionsleisten

### Varianten

- **Primär:** genau die wichtigste Aktion eines Bereichs.
- **Sekundär:** alternative oder ergänzende Aktion.
- **Zurückhaltend/Ghost:** Navigation, Abbrechen oder seltene Nebenaktion.
- **Destruktiv:** Löschen oder irreversible Wirkung; nie als Standardprimärfarbe.
- **Iconaktion:** nur bei eindeutigem, zugänglich benanntem Symbol.
- **Deaktiviert:** visuell und semantisch deaktiviert.

Aktionsgruppen ordnen primär, sekundär und destruktiv nachvollziehbar. Seitenaktionsleisten und Formularabschlussleisten verwenden zentrale Abstände und umbrechen. Keine Aktionsbedeutung nur über Farbe.

## 12. Hinweise und Status

### Hinweise

- Information
- Erfolg
- Warnung
- Fehler
- Schreibschutz
- handlungsorientierter Hinweis
- kompakter Inline-Hinweis

Hinweise enthalten Titel nur bei Mehrwert, klare Aussage und optional genau passende Aktion. Schreibschutztext lautet im Regelfall: „Diese Abrechnung ist schreibgeschützt. Änderungen sind erst nach dem Öffnen zur Bearbeitung möglich.“ mit „Zur Bearbeitung öffnen“, sofern fachlich zulässig.

### Status

Neutral, Information, Erfolg, Warnung, Fehler/Blockade. Statuspunkt oder Icon wird immer zusammen mit Text verwendet.

## 13. Dialoge

### Varianten

Bestätigung, Hinweis, Warnung, fachliche Aktion, destruktive Aktion, besonders geschützter Dialog.

Dialoge besitzen Titel, Inhalt, klaren Aktionsbereich, initialen Fokus, Fokusfalle und Fokusrückgabe. Escape und Hintergrundklick folgen der Sicherheitsstufe. Destruktive oder besonders geschützte Dialoge schließen nicht unbeabsichtigt. AP22D bleibt technische Grundlage.

## 14. Inhaltszustände

- **Keine Daten vorhanden:** Datenquelle leer.
- **Noch keine Datensätze angelegt:** Erstanlage möglich.
- **Filterergebnis leer:** Daten vorhanden, aktuelle Suche ohne Treffer.
- **Laden:** kurzer, nicht blockierender Ladehinweis; längere Vorgänge mit verständlicher Beschreibung.
- **Fehler:** klare Ursache soweit bekannt und sichere nächste Aktion.
- **Nicht anwendbar:** fachlich nicht erforderlich.
- **Deaktiviert:** vorhanden, aber nicht bedienbar.
- **Aktuell nicht verfügbar:** vorübergehend oder technisch nicht erreichbar.

Zustände sind nicht austauschbar. Sie verwenden deutsche NK-Pro-Texte und keine leeren Platzhalterflächen.

## 15. Typografie

| Rolle | Zielwert | Regel |
|---|---:|---|
| Seitentitel | 28 px / 1.2 / 700 | genau einmal je Seite |
| Bereichstitel | 20 px / 1.3 / 700 | Hauptabschnitt |
| Kartentitel | 16 px / 1.35 / 700 | kompakt |
| Kennzahl | 28–32 px / 1.15 / 700 | nur zentrale Zahl |
| Fließtext | 15–16 px / 1.5 / 400 | Standardtext |
| Tabelleninhalt | 14 px / 1.4 | kompakt lesbar |
| Feldlabel | 14 px / 1.35 / 600 | eindeutig |
| Hilfetext | 13 px / 1.4 | sekundär, lesbar |
| Status | 12–13 px / 1.3 / 700 | immer mit Text |
| technische Information | 12–13 px / 1.45 / 400 | bei Bedarf Monospace |

## 16. Farben

Es gelten semantische Rollen: Primäraktion, aktive Auswahl, Erfolg, Warnung, Fehler, destruktiv, Information, Abrechnungskontext, Navigation, Hintergrund, Oberfläche, Rahmen, Text, Sekundärtext, deaktiviert und Fokus. Komponenten verwenden Rollen, keine frei gewählten Farbnamen.

## 17. Abstände

Zulässiges Raster: 4, 8, 12, 16, 24, 32 und 48 px. 6 px bleibt nur als vorhandener kompatibler Mikroabstand im AP22A-Fundament dokumentiert und wird für neue Layoutentscheidungen nicht verwendet. Neue lokale Zwischenwerte sind unzulässig.

## 18. Radien, Rahmen und Schatten

- Eingaben/kompakte Elemente: 6 px
- Buttons/Standardflächen: 8 px
- Karten/Klappboxen: 10–12 px
- Dialoge: 14 px
- Pillenstatus: vollständig rund
- Rahmen: 1 px neutral; 2 px nur Fokus/ausgewählte Spezialzustände
- Schatten: keiner, leicht oder Dialogschatten; keine weiteren Stufen

## 19. Icons

SVG-Linienicons, 16/18/20/24 px, einheitliche Strichstärke 1.75–2 px, `currentColor`. Keine Emoji, Rastergrafik-Symbolmischung oder rein ikonische Zustandsvermittlung. Dekorative Icons sind für Hilfstechnologien verborgen; funktionale Icons besitzen zugängliche Beschriftung.

## 20. Fokus und Tastatur

Sichtbarer 3-px-Fokusring mit Offset, keine Layoutsprünge. Logische DOM- und Fokusreihenfolge. Alle Aktionen, Klappboxen, Filter, Tabellenwerkzeuge und Dialoge sind per Tastatur bedienbar. Dialoge verwenden Fokusfalle und Fokusrückgabe. Kein positives `tabindex`.

## 21. Responsive Verhalten

- **Großer Desktop:** ab 1280 px; volle Seitenschale, mehrspaltige Raster.
- **Mittlere Fensterbreite:** 900–1279 px; reduzierte Spalten, umbrechende Aktionen.
- **Schmale Ansicht:** unter 900 px; Stapelung, kompaktere Seitenränder, Tabellencontainer-Scroll.
- **Sehr schmal:** unter 620 px; einspaltige Formulare und volle Aktionsbreiten.
- **Niedrige Höhe:** unter 700 px; Dialog- und Inhaltsbereiche kontrolliert scrollbar.

Komponenten dürfen keine unbeabsichtigte horizontale Gesamtseiten-Scrollleiste erzeugen.

## AP22F1B – Status- und Aktionsplatzierung

`nk-ui-page-header` zeigt keinen statischen Save-Status. Erfolg und Fehler einer tatsächlichen Speicheraktion werden über die bestehende zeitbezogene Rückmeldung vermittelt. `application.save` darf je sichtbarer Datenseite höchstens einmal als führende Kopfaktion vorkommen. Karten oder Formularabschnitte wiederholen diese allgemeine Aktion nicht. Fachaktionen wie Sichern, Importieren, Exportieren, Drucken, Archivieren oder Zurücksetzen behalten ihre fachliche Benennung und ihren fachlichen Inhaltsort.

## AP22F2B – Aufgaben-/Statuskarten der Objektübersicht

Jede Karte verbindet Icon, eindeutigen Titel, textlichen Status, Kurzbeschreibung und genau einen Navigationsweg. Die Karten verwenden zentrale `nk-ui-card`- und `nk-ui-status`-Varianten. Wohnungs- und Mietverhältnisvollständigkeit erscheinen jeweils nur einmal. Die DUMMY-Karte verwendet zusätzlich einen neutralen Status und den Text „Clickdummy ohne Fachlogik“. Der Gesamtstatus zählt nur drei produktive Karten.
