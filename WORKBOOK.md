# WORKBOOK – NK-Pro V99.2

Dieses Dokument enthält die verbindlichen technischen Regeln für die weitere Entwicklung von NK-Pro.

## 1. Gemeinsamer Seitenrahmen

Jeder bestehende und zukünftige Tab verwendet direkt im statischen Tab-Container genau diese äußere Reihenfolge:

1. globale weiße Kopfleiste,
2. `header.page-header`,
3. `div.overview-grid`,
4. `div.page-sections` mit statischen `details.page-section`,
5. optional `p.page-footnote` nach allen Klappboxen.

Das gemeinsame Layout darf nicht nachträglich durch Verschieben bereits gerenderter DOM-Elemente hergestellt werden.

## 2. Zentraler Kopfbereich

Jeder Tab besitzt genau einen sichtbaren Haupttitel. Der Kopfbereich nutzt ein echtes dreispaltiges Grid:

- links: Kategorie und Haupttitel,
- Mitte: tatsächlicher Abrechnungszeitraum der geöffneten Abrechnung,
- rechts: Speicher-/Archivstatus und Aktionen.

Der Tab-Kopf ist nicht sticky. Die globale weiße Kopfleiste darf sticky bleiben. Tabbezogene Styles dürfen die globale Kopfleiste nicht ausblenden.

## 3. Zentrales Vier-Kachel-System

Jeder Tab besitzt genau ein `overview-grid` mit exakt vier direkten `overview-card`-Kindern in dieser Reihenfolge:

1. Sammelinfo
2. Prüfung
3. Empfohlener nächster Schritt
4. Schnellaktionen

Nur `renderOverviewCards()` erzeugt diese Kacheln. Fachrenderer liefern Daten, Status, Hinweise, nächsten Schritt und Aktionen, aber kein eigenes Übersichtskarten-HTML.

Die Höhe ist dynamisch. `--overview-card-min-height: 184px` ist nur eine Mindesthöhe. Es gibt keine feste Maximalhöhe und kein `overflow: hidden` für normale Kachelinhalte.

## 4. Zentrale Schnellaktionen und Buttons

Schnellaktionen sind echte Buttons im Container `overview-card__actions quick-actions`. Linklisten, Trennlinien und tabbezogene Sonderstile sind nicht zulässig. Breite, Höhe, Schrift, Rundung und Innenabstände werden zentral definiert.

## 5. Zentrale Tabregistrierung

Alle Tabs werden einmal in `TAB_DEFINITIONS` registriert. Die Definition enthält mindestens:

- Titel,
- Kategorie/Kicker,
- fachlichen Renderer,
- Übersichtsdaten-Provider,
- Standardziel für den nächsten Schritt,
- bei Bedarf Zieltab der Prozesskette.

Ein neuer Tab muss nach Registrierung automatisch den gemeinsamen Kopf, die vier Kacheln, Standardbuttons und die Strukturprüfung erhalten. Neue parallele Header-, Karten- oder Upgrade-Systeme sind nicht zulässig.

## 6. Statische Klappboxstruktur

Fachliche Bereiche stehen statisch als `details.page-section` an ihrer endgültigen Position. Sie beginnen beim erstmaligen Öffnen des Tabs geschlossen. Eine Eingabe oder Teilrendering darf einen vom Nutzer geöffneten Bereich nicht unerwartet schließen.

Die letzte Klappbox jedes Tabs trägt `data-section-role="validation"`. Die Prüfbox wird nicht anhand sichtbarer Wörter erkannt. Ein Tab ohne ausgearbeitete Prüfregeln enthält dennoch eine Prüfbox mit einem klaren Platzhalterhinweis.

Eine fachlich notwendige Fußnote steht nach der Prüfbox, niemals in ihr und niemals als eigene Karte oder Klappbox.

## 7. Tabellen

Tabellenbreiten folgen dem Inhalt. Kurze, numerische, Datums-, Status- und Aktionsspalten bleiben kompakt; Textspalten dürfen wachsen und umbrechen. Zahlen und Währungen sind rechtsbündig. Horizontales Scrollen wird nur bei tatsächlich breiten Datentabellen verwendet.

## 8. Verbotene Architekturpfade

Nicht erneut einführen:

- Laufzeit-DOM-Verschiebungen zur Herstellung der Seitenstruktur,
- parallele Kartenrenderer oder verschachtelte Kartengitter,
- mehrere nachträgliche UI-Upgrade-Schichten,
- tababhängige Body-Klassen zur Steuerung des allgemeinen Seitenlayouts,
- Textsuche zur Erkennung der Prüfbox,
- feste Kartenhöhen mit abgeschnittenem Inhalt,
- Layoutkorrekturen, deren Ergebnis von der Aufrufreihenfolge abhängt.

## 9. Fachlogik schützen

UI-Änderungen dürfen Berechnungs-, Umlage-, Vorauszahlungs-, Salden-, Brief-, Export-, Archiv-, Sicherungs- oder Migrationslogik nicht beiläufig verändern. Bestehende IDs und Eingabefelder bleiben erhalten, soweit fachliche Renderer davon abhängen. Nach strukturellen Änderungen sind Syntax-, Struktur-, Interaktions- und Ergebnisvergleichstests auszuführen.

## 10. Späterer Fachpunkt: Einmalige Korrekturen und Gutschriften

V99.2 setzt diesen Fachpunkt ausdrücklich nicht um. Die bestehende Tabellenspalte bleibt erhalten; die neue Klappbox enthält nur den Platzhalter „Korrektur hierher überführen“.

Später vorgesehen:

- eigenes Datenmodell,
- mehrere Korrekturen pro Mieter,
- Kostenartenzuordnung,
- Belastung oder Gutschrift zugunsten beziehungsweise zulasten des Mieters,
- Anpassung von Berechnung, Briefen und Export.

Diese Erweiterung braucht eine eigene fachliche Spezifikation und Regressionstests.

## 11. Abnahme eines neuen Tabs

Vor Freigabe ist mindestens zu prüfen:

- eine Hauptüberschrift und ein Kopfbereich,
- tatsächlicher Zeitraum sichtbar,
- genau ein Kachelgrid mit vier direkten Kacheln,
- korrekte Titel und Reihenfolge,
- Schnellaktionen ausschließlich als Buttons,
- keine alten oder verschachtelten Karten,
- Klappboxen beim ersten Öffnen geschlossen,
- Prüfbox zuletzt,
- Fußnote gegebenenfalls danach,
- keine Überlagerung oder abgeschnittene Inhalte,
- stabil bei Navigation, programmgesteuertem Wechsel, Teilrendering, Speichern und Laden,
- responsive Darstellung auf großen, mittleren und schmalen Ansichten.
