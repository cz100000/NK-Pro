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
