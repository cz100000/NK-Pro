# NK-Pro – UI-/UX-Abnahmekatalog

Eine Seite ist nur migriert, wenn alle anwendbaren Punkte mit **bestanden**, **nicht anwendbar mit Begründung** oder **ausdrücklich freigegebene Abweichung** dokumentiert sind.

## A. Vertrag und Planung

- [ ] Bestandsanalyse des Seitenbereichs liegt vor.
- [ ] Redundante, unnötige oder verwirrende Elemente sind konkret benannt.
- [ ] Zielkomponenten und Varianten sind vollständig zugeordnet.
- [ ] Mockup beziehungsweise Zielansicht wurde freigegeben.
- [ ] Datei-Positivliste, Testkonzept und geschützte Bereiche wurden freigegeben.
- [ ] Keine ungeregelte neue Variante wurde improvisiert.

## B. Seitenanatomie

- [ ] Zentrale Seitenschale wird verwendet.
- [ ] Jede sichtbare Ansicht besitzt genau eine `nk-ui-page-shell` und genau einen `nk-ui-page-header`.
- [ ] Jede sichtbare Ansicht besitzt genau ein sichtbares `h1`; der globale App-Kopf enthält keinen Seitentitel.
- [ ] Es gibt genau einen Hauptseitentitel.
- [ ] Seitenkopf entspricht einer freigegebenen Variante.
- [ ] Globale und seitenspezifische Aktionen sind getrennt.
- [ ] Es existiert höchstens eine führende Abrechnungskontextanzeige.
- [ ] Die Kontextleiste zeigt Objekt, vollständigen Abrechnungszeitraum und Status in dieser Reihenfolge.
- [ ] Die Kontextleiste enthält in keinem Zustand ein Modusfeld oder einen Modustext.
- [ ] Der Nur-ansehen-Zustand bleibt über die größere Schreibschutz-Notice und eingeschränkte Bedienmöglichkeiten erkennbar.
- [ ] Keine redundante kleine Schreibschutzkennzeichnung steht im Seitenkopf.
- [ ] Haupt-, Neben- und Abschlussbereiche folgen der verbindlichen Reihenfolge.

## C. Komponenten

- [ ] Jede Karte verwendet eine freigegebene Kartenvariante.
- [ ] Jede Klappbox verwendet die zentrale Anatomie und korrekte ARIA-Zustände.
- [ ] Tabellen verwenden zentrale Klassen, Kopfsemantik und eigenen Overflow-Container.
- [ ] Listen verwenden semantisches Markup und eine freigegebene Variante.
- [ ] Formulare besitzen Label, Hilfe-/Fehlerbeziehung und korrekte Zustände.
- [ ] Buttons entsprechen Bedeutung, Hierarchie und freigegebener Variante.
- [ ] Hinweise und Status verwenden Text plus semantische Farbe/Icon.
- [ ] Dialoge entsprechen AP22D einschließlich Fokusfalle und Fokusrückgabe.
- [ ] Inhaltszustände unterscheiden keine Daten, Erstanlage, Filterleerstand, Laden, Fehler, N/A und Nicht-verfügbar korrekt.

## D. Tokens und visuelle Konsistenz

- [ ] Jeder Abstand stammt aus dem zentralen Raster.
- [ ] Farben werden ausschließlich über semantische Rollen gewählt.
- [ ] Typografie entspricht einer zentralen Rolle.
- [ ] Rahmen, Radien und Schatten verwenden freigegebene Stufen.
- [ ] Icons sind einheitliche SVG-Linienicons und ersetzen keine Beschriftung.
- [ ] Keine lokale CSS-Sonderlösung oder Inline-Gestaltung wurde eingeführt.
- [ ] Darstellung entspricht der Referenzbibliothek.

## E. Interaktion und Zustände

- [ ] Hover verursacht keinen Layoutsprung.
- [ ] Fokus ist an jedem interaktiven Element sichtbar.
- [ ] Deaktiviert und schreibgeschützt sind eindeutig unterschieden.
- [ ] Destruktive Aktionen sind klar gekennzeichnet und geschützt.
- [ ] Status werden nicht ausschließlich durch Farbe vermittelt.
- [ ] Fehlermeldungen nennen sichere nächste Schritte.
- [ ] Schreibschutzhinweise sind handlungsorientiert.

## F. Tastatur und Barrierefreiheit

- [ ] Alle Funktionen sind mit Tastatur erreichbar.
- [ ] Fokusreihenfolge entspricht der visuellen und fachlichen Reihenfolge.
- [ ] Kein positives `tabindex` und kein unersetztes `outline: none`.
- [ ] Dialoge halten Fokus und geben ihn zurück.
- [ ] Klappboxen, Menüs und Aktionen melden Zustand und Beschriftung korrekt.
- [ ] Zoom bis 200 % erhält Inhalt und Bedienbarkeit.
- [ ] Status, Fehler und Pflichtfelder sind ohne Farbwahrnehmung verständlich.

## G. Responsive

- [ ] Große Desktopansicht ist vollständig und ruhig strukturiert.
- [ ] Mittlere Breite reduziert Spalten ohne Informationsverlust.
- [ ] Schmale Ansicht stapelt Inhalte und Aktionen sinnvoll.
- [ ] Niedrige Fensterhöhe hält Dialogaktionen erreichbar.
- [ ] Karten, Formulare und Seitenkopfaktionen umbrechen kontrolliert.
- [ ] Kontextleiste behält semantische Reihenfolge.
- [ ] Tabellen scrollen nur im Tabellencontainer oder nutzen eine freigegebene Alternative.
- [ ] Vollbreite Desktoptabellen bleiben durch einen sichtbaren weißen Innenabstand von ihrer Kartenhülle getrennt.
- [ ] Keine unbeabsichtigte horizontale Gesamtseiten-Scrollleiste.

## H. Fach- und Regressionsschutz

- [ ] Fachinformationen und Bedienmöglichkeiten sind vollständig erhalten oder ausdrücklich zur Änderung freigegeben.
- [ ] Berechnungen, Datenmodell, Persistenz und Austauschformate sind unverändert, sofern nicht gesondert freigegeben.
- [ ] Navigation bleibt unverändert, sofern sie nicht Gegenstand eines gesonderten Pakets ist.
- [ ] Brief, Druck, PDF, Import und Export bleiben geschützt.
- [ ] Bestehende Regression und neue Paketprüfungen sind bestanden.
- [ ] Lokale Altstile des vollständig migrierten Bereichs wurden kontrolliert entfernt.

## I. Abschlussstatus

| Status | Bedeutung |
|---|---|
| Nicht begonnen | Noch keine Bestandsanalyse/Freigabe. |
| Geplant | Vorschlag, Mockup und Positivliste vorbereitet. |
| Freigegeben | Nutzerfreigabe zur technischen Umsetzung liegt vor. |
| Technisch migriert | Zielkomponenten umgesetzt; visuelle Prüfung offen. |
| Visuell geprüft | Referenz- und Responsive-Abgleich bestanden. |
| Legacy bereinigt | Lokale Altvarianten im Bereich entfernt. |
| Abgeschlossen | Alle anwendbaren Kriterien und Regression bestanden. |

## AP22F1B – Seitenkopf- und Redundanzabnahme

- [x] In produktiven Seitenköpfen existiert kein `[data-page-save-status]`.
- [x] Auf den sechs freigegebenen Seiten existiert kein `.page-header__period`.
- [x] Exakt elf freigegebene Datenseiten besitzen je einen Kopfbutton `Speichern`.
- [x] `archiv`, `sicherung` und `export` besitzen keinen allgemeinen Kopfbutton `Speichern`.
- [x] `manuellewerte` besitzt genau einen führenden Speicherweg; Reset, Import und Eingaben bleiben erhalten.
- [x] Schreibschutz-Notice, `Zur Bearbeitung öffnen`, Kontextleiste und Zeitraumsektion bleiben unverändert.
- [x] Sechs Ziel-Viewports weisen keinen unbeabsichtigten Dokument-Overflow auf; Fokus und Aktionsstapelung bleiben sichtbar.

## AP22F2B – Objektübersicht

- [x] Objektname und Gebäudekurzcode stehen genau einmal zusammen.
- [x] Genau eine nächste Aktion folgt der freigegebenen Prioritätsregel.
- [x] Genau vier Aufgaben-/Statuskarten sind vorhanden.
- [x] Gesamtstatus zählt genau drei produktive Bereiche; DUMMY ist ausgeschlossen.
- [x] Einheiten- und Mietervervollständigkeit werden nicht doppelt angezeigt.
- [x] Kostenarten, Umlageschlüssel und Abrechnungsstatus erscheinen nicht.
- [x] Sechs Ziel-Viewports, Tastaturreihenfolge, Fokus und 200-%-Zoomäquivalent bestehen.
- [x] Schutz-Hashes, aktuelle Regressionen und frisch extrahierter Release bestehen.

## AP22F4B – Wohnungen

- [x] Weiße Navigation, globale Leisten und Seitenkontext bleiben unverändert.
- [x] Die sechs bestehenden Stammdatenfelder sind vollständig und unverändert vorhanden.
- [x] Wohnungs-ID bleibt lesend; alle anderen Felder verwenden die bestehenden zentralen Schreibwege.
- [x] Suche, bestandsbasierter Statusfilter, Aktionsspalte und Ergebnissumme entsprechen UI Referenz 1.0.
- [x] Ausschließlich bestehende `UNIT_*`-Prüfbefunde werden angezeigt und betroffene Zeilen markiert.
- [x] Der leere Prüfplatzhalter ist entfernt.
- [x] Nur-Ansehen deaktiviert Speichern und Bearbeitung, ohne die Lesbarkeit zu verlieren.
- [x] Hinweise liegen im normalen Dokumentfluss und überlagern keine Inhalte.
- [x] Die Seite verursacht in den Ziel-Viewports keinen horizontalen Dokumentüberlauf; die Tabelle bleibt intern verschiebbar.

## AP22F5B – Zusatzkriterien

- [ ] DUMMY-Seiten sind im Titel, Inhalt und Abschluss eindeutig als nicht produktiv gekennzeichnet.
- [ ] DUMMY-Suche und -Filter verändern weder `state` noch lokalen Speicher.
- [ ] Farbige Zählericons verwenden zentrale semantische Tokens und einheitliche SVG-Linienicons.
- [ ] Eine UI-Migration fügt keine produktive Aktion hinzu, die im Bestand nicht vorhanden war.
- [ ] Bestandskennzahlen nennen nur fachlich vorhandene Zustände und verwenden vorhandene Datenquellen.
- [ ] Breite Stammdatentabellen bleiben in einer eigenen weißen Overflow-Hülle; die Gesamtseite läuft nicht horizontal über.

## AP22F6B – Abnahme Nebenkostenabrechnung Übersicht

- [x] Genau eine kompakte gemeinsame Tabellenstruktur mit getrennten Gruppen für aktuelle und archivierte Abrechnungen.
- [x] Suche, Filter Alle/Aktuell/Archiv und Ergebniszählung arbeiten rein darstellungsbezogen.
- [x] Keine eigenständigen Kennzahlenkarten und kein Drei-Punkte-Menü.
- [x] Alle vorhandenen Aktionen bleiben sichtbar und verwenden unveränderte `data-ui-action`-Handler.
- [x] Aktionsbuttons sind quadratisch, ausschließlich mit SVG-Symbol sichtbar, vollständig per Tooltip und `aria-label` beschriftet und in einer einzigen `nowrap`-Gruppe angeordnet.
- [x] Fokus und deaktivierte Zustände sind sichtbar und eindeutig.
- [x] Schreibschutz wird ausschließlich über die große Notice im normalen Dokumentfluss vermittelt; die Kontextleiste enthält keine Modusangabe.
- [x] Desktop, 620 px, 390 px und 200-Prozent-Zoomäquivalent besitzen keinen horizontalen Dokument-Overflow; bei Bedarf scrollt nur die Tabellenhülle.
- [x] Positivliste, 392 geschützte Dateien und 25 geschützte Bereiche sind abgeglichen.
- [x] Fach-, Status-, Speicher-, Lade-, Migrations-, Archivierungs-, Berechnungs-, Brief- und Drucklogik bleiben unverändert.


## AP22F7B – Abnahme

Mietverhältnisse vor Wohnungen, keine Klappboxen, keine Kennzahlenkarten, vollständige Lesedetails, 8/6 Zielspalten und interne Tabellen-Scrolls umgesetzt und geprüft.

## AP22F7B Korrektur 1 – Abnahme

- [x] Mietverhältnis- und Wohnungstabelle verwenden die einheitliche hellgraue Standard-Kopfzeile.
- [x] Keine weißen Einzelbuttons und keine zusätzliche dunkelblaue Sortierunterzeile.
- [x] `Details` ist identisch zu den übrigen Kopfzellen gestaltet.
- [x] Sortiersymbol erscheint genau einmal je sortierbarer Spalte.
- [x] Sortierung funktioniert auf- und absteigend unverändert.
- [x] Tastaturfokus bleibt sichtbar.
- [x] Desktop und 620 px ohne horizontalen Seitenüberlauf; Tabellen scrollen bei Bedarf intern.

## AP22F7B Korrektur 2 – Zusätzliche Tabellenabnahme

- [ ] Tabelle füllt auf Desktop die vollständige Inhaltsbreite ihres Containers.
- [ ] Nach der letzten Spalte bleibt keine leere weiße Restfläche.
- [ ] Die rechte Tabellenkante ist über Rahmen und Eckradius eindeutig abgeschlossen.
- [ ] Breite Inhalte erzeugen ausschließlich internen horizontalen Tabellen-Scroll.
- [ ] Die Gesamtseite besitzt bei Desktop, 620 px, 390 px und Zoomäquivalent keinen horizontalen Überlauf.
- [ ] Sortierung, Filterung, Eingaben und Fokusdarstellung bleiben durch die Breitenanpassung unverändert.
## AP22F7B Korrektur 3 – Verbindliche Tabellenabnahme

- [x] Jede produktive Standardtabelle besitzt an der letzten Kopf- und Datenzelle einen sichtbaren rechten Rahmen.
- [x] Rechte obere und untere Tabellenradien sind vorhanden.
- [x] Die Regel gilt zentral für alle künftigen Tabellenmigrationen.
- [x] Mietzeiträume auf „Nebenkosten abrechnen → Mietverhältnisse“ erscheinen als `TT.MM.JJJJ`.
- [x] Sortierung und gespeicherte ISO-Datumswerte bleiben unverändert.



## AP22F8B – Abnahme Vorauszahlungen

- [x] Seite verwendet einen flachen Dokumentfluss ohne Klappboxen.
- [x] NK-Vorauszahlungen, Kaltmiete und Korrekturen/Gutschriften stehen in drei getrennten Tabellen.
- [x] Alle Wohnungen, Mietverhältnisse, Eigentümer-/Privatfälle und Leerstände sind sichtbar.
- [x] Nicht abrechenbare Fälle sind eindeutig gekennzeichnet, nicht editierbar und aus Berechnung sowie Summen ausgeschlossen.
- [x] Sämtliche vorhandenen Gesamtsummen bleiben in neutralen Summenzeilen erhalten.
- [x] Tabellenflächen sind weiß beziehungsweise neutral hellgrau; keine flächig gelben Eingabezellen oder grünen Summenzeilen.
- [x] Suche, Filter, Sortierung, Zurücksetzen und Ergebniszählung arbeiten rein darstellungsbezogen.
- [x] Tabellen besitzen rechts den zentralen Abschluss und scrollen auf 620 px und 390 px ausschließlich intern.
- [x] Schreibschutz sperrt Fachdatenfelder, ohne Suche, Filter und Lesbarkeit einzuschränken.
- [x] Datenmodell, Berechnung, Persistenz, Migration, Archivierung, Brief und Druck bleiben unverändert.


## AP22F8B Korrektur 1 – Zusatzabnahme

- [x] Vier kompakte Kacheln zeigen Bestand, NK nach Korrektur, Kaltmieteinnahmen nach Korrektur und getrennte Korrektursummen.
- [x] Alle Fallspalten der NK-Vorauszahlungsmatrix besitzen dieselbe feste Breite.
- [x] NK- und Kaltmietkorrekturen werden je Fall und in den Gesamtsummen getrennt ausgewiesen.
- [x] Nach-Korrektur-Werte, Summen und Kacheln reagieren unmittelbar auf Eingaben.
- [x] Positive Werte bleiben Gutschriften, negative Werte Nachbelastungen.
- [x] Nur NK-Korrekturen beeinflussen den NK-Saldo; Kaltmietkorrekturen werden im Brief getrennt ausgewiesen.
- [x] „Prüfung und Hinweise“ zeigt die bestehenden Vorauszahlungsregeln und die Trennungsprüfung sichtbar an.
- [x] Nicht abrechenbare Fälle bleiben sichtbar, gesperrt und aus allen Summen ausgeschlossen.
