# NK-Pro – Verbindlicher UI-/UX-Designvertrag

**Vertragsstand:** AP22F2B / V99.4.37  
**Technische Produktbasis:** V99.4.37 / AP22F2B  
**Geltung:** alle späteren produktiven UI-Arbeitspakete

## 1. Zweck und Geltungsbereich

Dieser Vertrag ist der oberste verbindliche UI-/UX-Standard für die NK-Pro-App-Oberfläche. Er regelt visuelle Gestaltung, Seitenanatomie, zentrale Komponenten, Zustände, Responsive-Verhalten, Tastaturbedienung, Fokus und Barrierefreiheit. Brief, Druck, PDF und sonstige Dokumentausgaben bleiben eigenständige Systeme mit ihren vorhandenen Regeln.

Jede spätere UI-Umsetzung muss dem freigegebenen UI-/UX-Designvertrag und der zugehörigen Referenzbibliothek entsprechen. Abweichungen, neue Varianten oder kreative Neuinterpretationen sind nur nach konkreter Benennung, Begründung und ausdrücklicher Freigabe des Nutzers zulässig.

## 2. Rangfolge

Bei UI-/UX-Fragen gilt folgende Rangfolge:

1. dieser Designvertrag,
2. `UI_UX_ZIELBILD.md`, `UI_UX_SEITENANATOMIE.md`, `UI_UX_KOMPONENTENREGELN.md` und `UI_UX_ABNAHMEKATALOG.md`,
3. die nicht produktive Referenzbibliothek unter `ui-reference/`,
4. `UI_DESIGN_TOKENS.md`, `UI_KOMPONENTENKATALOG.md`, `UI_ARCHITEKTUR_AKTUELL.md`, `UI_MIGRATIONSMATRIX.md` und `UX_GUIDE.md`,
5. ältere UI-Dokumente nur, soweit sie den vorstehenden Quellen nicht widersprechen.

Fach-, Daten-, Speicher-, Migrations-, Archiv-, Dokument- und Sicherheitsverträge werden durch diesen Designvertrag nicht aufgehoben.

## 3. Verhältnis zum Styleguide-Bild

Das Release enthält die visuelle Referenz `ui-reference/assets/UI_UX_Styleguide_Bild.png`. Verbindlich sind dessen helle Arbeitsflächen, kompakte Informationsdichte, klare Hierarchie, Karten-/Tabellen-/Formularwirkung, semantische Statusfarben, kleine Linienicons, ruhige Radien, feine Rahmen und geringe Schatten.

Die im Styleguide-Bild dargestellte Navigation ist ausdrücklich **nicht** verbindlich. Für Navigation gilt ausschließlich der unveränderte produktive Stand V99.4.32. Die Referenzbibliothek kennzeichnet die Navigation deshalb als geschützte Bestandskomponente.

## 4. Geschützte Navigation

Die Navigation aus V99.4.32 bleibt optisch, strukturell und funktional unverändert. Dazu gehören Breite, Gruppierung, Reihenfolge, aktive Zustände, Klappverhalten, Icons, Fokus, Overlay-Verhalten und Direkteinstiegskompatibilität. Eine Änderung ist nur in einem gesondert freigegebenen Navigationspaket zulässig.

## 5. Verbindliche Grundsätze

- NK-Pro ist eine moderne, ruhige, leichte, klare und seriöse Fachanwendung.
- Zentrale Komponenten ersetzen lokale Einzellösungen.
- Eine Seite besitzt genau einen eindeutigen Haupttitel und genau eine führende Abrechnungskontextanzeige.
- Status werden nie ausschließlich durch Farbe vermittelt.
- Interaktive Elemente besitzen sichtbaren Fokus, verständliche Beschriftung und Tastaturbedienbarkeit.
- Responsive Anpassung bewahrt alle fachlichen Informationen und Bedienmöglichkeiten.
- Produktive Seiten definieren keine eigenen Farben, Abstände, Radien, Schatten, Fokusmuster oder Iconstile.
- Fachlogik und UI bleiben getrennt; UI-Migrationen ändern keine Berechnungen, Datenverträge oder Persistenzpfade.

## 5.1 Globale Schale und Abrechnungskontext nach AP22F1A

Jede sichtbare produktive Ansicht verwendet genau eine zentrale `nk-ui-page-shell`, genau einen zentralen `nk-ui-page-header` und genau einen sichtbaren Haupttitel als `h1`. Der globale App-Kopf enthält keinen konkurrierenden oder versteckten Seitentitel.

Die gelbe Abrechnungskontextleiste zeigt in semantischer Reihenfolge Objekt, vollständigen Abrechnungszeitraum und Status sowie bereits bestehende fachlich zulässige Kontextaktionen. **Eine Modusangabe wird in keinem Zustand dargestellt.** Das gilt insbesondere für Bearbeitung, Nur ansehen, Abschluss, Archiv und Korrektur. Der Nur-ansehen-Zustand wird ausschließlich durch die größere handlungsorientierte Schreibschutz-Notice, eingeschränkte Bedienmöglichkeiten und die dort verbleibende Aktion `Zur Bearbeitung öffnen` vermittelt.

Die zentrale Seitenschale verwendet die Breiten `narrow` (760 px), `default` (1180 px) und `wide` (1440 px). Der Seiteninnenabstand beträgt 32 px, unter 1280 px 24 px und unter 620 px 16 px. Die geschützte Navigationsschwelle von 980 px bleibt unverändert.

## 6. Erlaubte Varianten

Erlaubt sind nur Varianten, die in `UI_UX_KOMPONENTENREGELN.md` und im Komponentenkatalog ausdrücklich aufgeführt sind. Varianten werden nach Aufgabe und Semantik gewählt, nicht nach persönlichem Geschmack oder Seitenname. Eine optisch ähnliche lokale Klasse gilt nicht als freigegebene Variante.

## 7. Nicht geregelte Fälle

Bei einer nicht geregelten Situation darf nicht improvisiert werden. Vor Umsetzung sind vorzulegen:

1. konkreter Anwendungsfall,
2. betroffene Seiten und zentrale Komponente,
3. fachlicher Zweck,
4. bestehende Alternativen,
5. erforderliche neue oder geänderte Variante,
6. Auswirkungen auf Responsive, Tastatur und Barrierefreiheit,
7. Mockup beziehungsweise Referenzansicht,
8. ausdrückliche Nutzerfreigabe.

## 8. Änderungs- und Freigabeverfahren

Eine Änderung des Designvertrags erfordert ein eigenständiges, klar abgegrenztes Arbeitspaket. Das Paket benennt die bisherige Regel, die geplante Änderung, Gründe, betroffene Komponenten und Seiten, Migrationsfolgen, Tests und Rückweg. Erst nach ausdrücklicher Freigabe werden Vertrag, Referenzbibliothek und Tokens synchron geändert.

## 9. Verbot lokaler UI-Einzellösungen

Unzulässig sind insbesondere:

- seitenbezogene Farb-, Radius-, Schatten- oder Abstandswerte,
- neue Button-, Karten-, Hinweis-, Dialog- oder Statusformen außerhalb des Katalogs,
- Emoji oder uneinheitliche Symbolquellen,
- Status ohne Text,
- versteckte Bedienmöglichkeiten nur über Hover,
- zweite Kontextleisten oder doppelte Seitentitel,
- lokale Responsive-Hacks ohne Zuordnung zum zentralen Layoutsystem,
- direkte Daten- oder Persistenzzugriffe aus reinen Präsentationskomponenten.

## 10. Abnahmeverpflichtung

Eine spätere Seite gilt erst als migriert, wenn:

- ihre Bestandsanalyse und Datei-Positivliste freigegeben wurden,
- alle anwendbaren Kriterien aus `UI_UX_ABNAHMEKATALOG.md` erfüllt sind,
- die Darstellung mit der Referenzbibliothek übereinstimmt,
- keine lokale Altvariante im migrierten Bereich verbleibt,
- Funktions-, Tastatur-, Responsive- und Regressionsprüfungen bestanden sind,
- fachliche Informationen und Bedienmöglichkeiten vollständig erhalten oder ausdrücklich zur Entfernung freigegeben wurden.

## 11. Schutz fachlicher Logik und Bedienmöglichkeiten

Visuelle Vereinfachung darf keine Fachinformation, Aktion, Prüfung, Datenquelle oder gespeicherte Bedeutung unbeabsichtigt entfernen. Soll ein Element entfallen oder zusammengeführt werden, sind heutiger Zweck, geplanter Ersatz, Auswirkungen und Nutzerfreigabe zu dokumentieren.

## 12. Verbindlicher Ablauf späterer UI-Arbeitspakete

1. Bestandsanalyse des Seitenbereichs
2. Benennung unnötiger, redundanter oder verwirrender Elemente
3. konkreter Umbauvorschlag
4. Zuordnung zu zentralen Komponenten
5. Mockup oder visuelle Zielansicht
6. vollständige Datei-Positivliste
7. objektive Abnahmekriterien
8. Testkonzept
9. geschützte Bereiche
10. ausdrückliche Nutzerfreigabe
11. erst danach technische Umsetzung

Die Migration erfolgt hybrid: zentrale Komponenten werden vervollständigt; anschließend werden zusammengehörige Seitenbereiche vollständig migriert, lokale Altstile entfernt, visuell und funktional abgeschlossen und erst danach der nächste Bereich begonnen.

## 13. AP22F1B – Seitenkopf- und Aktionsregel

Produktive Seitenköpfe dürfen keinen statischen Speicherzustand behaupten. Eine Speicherinformation wird nur als zeitbezogene Rückmeldung nach einer tatsächlichen Aktion ausgegeben. Lokale Kopf-Metablöcke sind nur zulässig, wenn sie eine eigenständige, nicht bereits global dargestellte und freigegebene Funktion besitzen.

Eine allgemeine Kopfaktion `Speichern` ist nur auf bearbeitbaren Datenseiten zulässig und dort höchstens einmal als führender Speicherweg. Fachseiten für Archiv, Datensicherung oder Export verwenden ausschließlich fachlich benannte Inhaltsaktionen. Die Sichtbarkeits- und Schreibschutzsteuerung der zulässigen Kopfaktionen bleibt zentral.
## 14. AP22F1C – Technische Zustands- und Metadatenregel

Geschlossene native Dialoge dürfen durch zentrale Layoutklassen nicht sichtbar werden. Ein `<dialog>` ohne `open`-Attribut ist in jedem Ziel-Viewport vollständig ausgeblendet; bei geöffnetem Zustand gelten weiterhin die verbindlichen Dialog-, Fokus- und Schließregeln.

Die sichtbare Releaseversion wird aus genau einer zentralen Laufzeitquelle abgeleitet. Statisch unabhängige Versionsangaben in produktiven Navigations- oder Statusbereichen sind unzulässig.

## 13. AP22F2B – Verbindlicher Objektübersichtsstandard

Die Objektübersicht ist ausschließlich die Arbeitsübersicht der Objektvorbereitung. Sie verwendet eine kompakte gemeinsame Objektidentität, einen Gesamtstatus für genau Objektdaten, Wohnungen und Mietverhältnisse, genau eine priorisierte nächste Aktion und genau vier Aufgaben-/Statuskarten. Zähler ist ein nachrangiger, textlich eindeutiger DUMMY und zählt nicht zur Vollständigkeit. Kostenarten, Umlageschlüssel und Abrechnungsprüfungen gehören nicht auf diese Seite.

## 14. AP22F4B – Verbindlicher Standard für führende Stammdatentabellen

Die Seite `wohnungsverwaltung` verwendet den Tabellenstandard der „NK-Pro UI Referenz 1.0“ bei unveränderter weißer Navigation. Suchfeld, bestandsbasierter Statusfilter, kompakte Aktionsspalte und Ergebnissumme bilden eine gemeinsame Tabellenkarte. Tabellenhinweise stehen ausschließlich im normalen Dokumentfluss. Bei schmalen Viewports bleibt die Seitenschale überlauffrei; nur die Tabelle darf innerhalb ihrer eigenen Hülle horizontal verschoben werden. Neue Datenfelder, Prüfregeln, Fachaktionen oder Persistenzwege sind ausgeschlossen.
