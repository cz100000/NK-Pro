# WORKBOOK – NK-Pro Development Baseline

**Gültig ab:** 12. Juli 2026  
**Technische Ausgangsversion:** V99.3.0  
**Aktuelle Version:** V99.4.0  
**Datenschema:** 5

## Dokumentenhierarchie

Dieses WORKBOOK ist das verbindliche Entscheidungsprotokoll. Bei Widersprüchen gilt folgende Reihenfolge:

1. Schutz historischer und archivierter Daten,
2. Stop-Regel dieses WORKBOOKS,
3. neuere Entscheidungen mit `ADR-NK-####`,
4. `DEVELOPMENT_GUIDE.md`,
5. `ARCHITECTURE.md`, `UX_GUIDE.md`, `TESTING.md`,
6. ältere versionsbezogene Abschnitte dieses Dokuments.

Ältere Abschnitte bleiben als nachvollziehbare Projekthistorie erhalten. Sie begründen keine stillschweigende Abweichung von der Development Baseline.

## Verbindliche Grundsätze

- Eine Anwendung.
- Ein Datenbestand.
- Eine Navigation.
- Historische Abrechnungen besitzen höchste Priorität.
- Objektstandards sind Vorlagen für neue Abrechnungen, keine rückwirkenden Live-Referenzen.
- Bestehende Architektur wird vor Neuentwicklung genutzt, erweitert, vereinfacht oder modularisiert.
- Kein React, kein TypeScript, kein Buildsystem.
- Fachliche Ergebnisse dürfen nicht durch reine UI- oder Strukturarbeiten verändert werden.

## Verbindliche Stop-Regel

Bei möglicher Auswirkung auf Datenmodell, historische Abrechnungen, Migrationen, Rückwärtskompatibilität, Berechnungsergebnisse, Zähler, Kostenarten, Umlageschlüssel, Archivdaten, Sicherungen oder Import-/Exportformate wird die Umsetzung sofort unterbrochen.

Vor Fortsetzung sind zwingend:

1. Ist-Zustand analysieren,
2. Auswirkungen beschreiben,
3. mindestens zwei Lösungswege entwickeln,
4. Vor- und Nachteile bewerten,
5. Empfehlung begründen,
6. Nutzerzustimmung abwarten,
7. Entscheidung als ADR in diesem WORKBOOK festhalten.

## Entscheidungsprotokoll

### ADR-NK-0001 – ZIP als alleinige technische Grundlage

- **Datum:** 2026-07-12
- **Status:** beschlossen
- **Entscheidung:** Ausschließlich der tatsächlich bereitgestellte Quellcode und die enthaltenen Projektdokumente sind technische Grundlage. Frühere Chats und nicht enthaltene Dateien werden nicht vorausgesetzt.
- **Begründung:** Reproduzierbarkeit und Schutz vor falschen Annahmen.
- **Auswirkung:** Jede neue Arbeitsrunde beginnt mit einer vollständigen Bestandsanalyse des aktuellen Pakets.

### ADR-NK-0002 – Development Baseline ohne Funktionsänderung

- **Datum:** 2026-07-12
- **Status:** beschlossen
- **Entscheidung:** Die erste Aufgabe ergänzt ausschließlich Projektdokumentation, Entwicklungsregeln und Prüfnachweise.
- **Begründung:** Vor funktionalen Änderungen wird ein belastbarer, dokumentierter Ausgangspunkt geschaffen.
- **Auswirkung:** App-Version, Datenschema, Runtime-Dateien, Referenzdaten und Tests bleiben unverändert.

### ADR-NK-0003 – App-Version bleibt V99.3.0

- **Datum:** 2026-07-12
- **Status:** beschlossen
- **Entscheidung:** Die Dokumentationsbaseline erzeugt keine neue Funktionsversion und ändert weder Manifest noch Service-Worker-Cache.
- **Begründung:** Keine Laufzeitänderung und kein technischer Grund für einen Cachewechsel.

### ADR-NK-0004 – Verbindliches UX-Zielbild

- **Datum:** 2026-07-12
- **Status:** Phase 1 umgesetzt; datenmodellrelevante Zielteile offen
- **Entscheidung:** Landingpage mit genau zwei Einstiegen; gruppierte Zielnavigation; Bereich „Aktive Abrechnung“ nur bei geöffneter Abrechnung; Statuswerte Bearbeitung, Nur Ansicht und Finalisiert.
- **Begründung:** Orientierung am tatsächlichen Arbeitsablauf.
- **Auswirkung:** Umsetzung erfolgt zuerst als UI-/Navigationsänderung auf Basis vorhandener Tabs und Modussteuerung.

### ADR-NK-0005 – Objektstandard als einmaliger Snapshot

- **Datum:** 2026-07-12
- **Status:** fachlich beschlossen, technische Umsetzung offen
- **Entscheidung:** Neue Abrechnungen übernehmen Objektstandards einmalig. Danach sind sie unabhängig. Änderungen an Standards dürfen bestehende oder archivierte Abrechnungen nicht verändern.
- **Begründung:** Revisionssicherheit historischer Abrechnungen.
- **Auswirkung:** Vor technischer Umsetzung Stop-Regel, Lösungsvergleich und Migrationskonzept erforderlich.

### ADR-NK-0006 – Trennung von Zählerverwaltung und Zählerständen

- **Datum:** 2026-07-12
- **Status:** fachlich beschlossen, technische Umsetzung offen
- **Entscheidung:** Physische Zähler und periodische Messwerte werden getrennt. Jeder Zähler erhält eine dauerhafte Zähler-ID.
- **Begründung:** eindeutige Historie bei Mieter-, Wohnungs- und Zählerwechseln.
- **Auswirkung:** Datenmodell- und Migrationsentscheidung erforderlich; keine stille Einführung.

### ADR-NK-0007 – Migration nur mit Vorabbackup und Wiederherstellung

- **Datum:** 2026-07-12
- **Status:** beschlossen
- **Entscheidung:** Jede zukünftige Migration benötigt eine automatische Sicherung vor der ersten Mutation, eine reproduzierbare Ausführung, vollständige Tests und einen dokumentierten Rückweg.
- **Begründung:** Der aktuelle Rückfallstand allein erfüllt diese Anforderung nicht vollständig.
- **Auswirkung:** Keine neue Schemaversion ohne vorherige Sicherungsarchitektur.

### ADR-NK-0008 – Dokumentation als Release-Bestandteil

- **Datum:** 2026-07-12
- **Status:** beschlossen
- **Entscheidung:** README, CHANGELOG, WORKBOOK, Development Guide, UX Guide, Architecture, Testing, Roadmap, Tech Debt und GitHub Release Template sind verbindlicher Bestandteil jeder künftigen Auslieferung.
- **Begründung:** Entscheidungen, Risiken und Freigaben müssen dauerhaft nachvollziehbar sein.

### ADR-NK-0009 – Phase 1 mit bestehender Architektur umsetzen

- **Datum:** 2026-07-12
- **Status:** beschlossen und umgesetzt in V99.4.0
- **Entscheidung:** Landingpage, neue Navigationsgruppen, Archivübersicht und Abrechnungskontext werden mit den vorhandenen Tabs, Renderfunktionen und Zuständen umgesetzt. Es wird kein neues Datenmodell eingeführt.
- **Begründung:** Das UX-Ziel ist ohne Austausch der funktionierenden Facharchitektur erreichbar.
- **Auswirkung:** Datenschema 5, Berechnung, Migration, Archive und Austauschformate bleiben unverändert.

### ADR-NK-0010 – Noch nicht vorhandene Domänen nicht vortäuschen

- **Datum:** 2026-07-12
- **Status:** beschlossen
- **Entscheidung:** V99.4.0 zeigt einen Objekt-Hub und verweist auf vorhandene Wohnungs- und Mieterfunktionen. Getrennte Objektstandards, Standard-Kostenarten, Standard-Umlageschlüssel und Zählerverwaltung werden erst nach der jeweiligen Datenmodellentscheidung eingeführt.
- **Begründung:** Eine reine UI-Hülle ohne belastbare Snapshot- und Zähleridentität würde falsche fachliche Sicherheit erzeugen.
- **Auswirkung:** Phase 2 und Phase 3 bleiben Stop-Regel-pflichtig.

### ADR-NK-0011 – Abrechnungskontext ohne neues Persistenzfeld

- **Datum:** 2026-07-12
- **Status:** beschlossen und umgesetzt in V99.4.0
- **Entscheidung:** Die Sichtbarkeit des Bereichs „Aktive Abrechnung“ ist ein flüchtiger UI-Zustand. Objekt, Jahr und Status werden ausschließlich aus vorhandenen Daten und vorhandenen Archiv-/Finalisierungszuständen abgeleitet.
- **Begründung:** Der Arbeitskontext darf das Datenschema und historische Abrechnungen nicht verändern.
- **Auswirkung:** Übersicht und Landingpage zeigen keinen Abrechnungskontext. Beim Öffnen einer konkreten Abrechnung werden Bearbeitung, Nur Ansicht oder Finalisiert angezeigt.

### ADR-NK-0012 – Phase-1-Freigabe

- **Datum:** 2026-07-12
- **Status:** beschlossen
- **Entscheidung:** V99.4.0 ist nach 5/5 Syntaxprüfungen, 19/19 Playwright-Tests, sauberer Browserkonsole, unveränderten Referenzfällen sowie erfolgreicher Manifest-/Cacheprüfung freigabefähig.
- **Einschränkung:** Ein echter installierter PWA-/Offline-Neustart über HTTPS oder localhost war durch die Browser-Netzwerkrichtlinie der Ausführungsumgebung blockiert; der Service Worker wurde vollständig simuliert geprüft.

## Freigaberegel

Eine Version ist nur freigegeben, wenn Syntaxprüfung, Browserkonsole, Chromium, Playwright, Referenzfälle, Export, Import, Migration, PWA, Cache, Release Audit und App Self Test erfolgreich sind. Datenmodellrelevante Versionen benötigen zusätzlich Backup- und Rollbacknachweis.

---

# Historische versionsbezogene Regeln und Entscheidungen

# Verbindliche Änderungen V99.3.0

- Abrechnungsstatus dauerhaft entfernt.
- Stammdaten vor Abrechnungsübersicht.
- Qualitätsprüfung als zentrale Gesamtprüfung.
- K002 ausschließlich aus Zählerständen.
- Freigabe nur bei fehlerfreier Syntax, Browserkonsole und Playwright-Regression.

# WORKBOOK – NK-Pro V99.3.0

Dieses Dokument enthält die verbindlichen technischen Regeln für die weitere Entwicklung von NK-Pro.


## Verbindliche Stabilitäts- und Freigaberegeln V99.2.9

- Die fachliche Berechnungslogik und das Datenschema 5 bleiben in V99.2.9 unverändert.
- Die mitgelieferte Testumgebung unter `tests/`, `testdaten/` und `tools/` ist Bestandteil jeder zukünftigen Entwicklungsversion.
- Vor Freigabe jeder neuen Version sind `npm run test:syntax` und `npm run test:browser` auszuführen.
- Jede Browserprüfung erfasst `console.error`, nicht behandelte Seitenfehler und fehlgeschlagene Netzwerkanfragen als blockierende Fehler.
- Referenzfälle dürfen nur bewusst und mit dokumentierter fachlicher Begründung geändert werden.
- Fachliche Umbauten sind gegen den vorherigen Referenzstand zu vergleichen. Unbeabsichtigte Ergebnisänderungen blockieren die Freigabe.
- Der Exportumfang ist beim Reimport zu erhalten: Ein Export `currentBillingOnly` darf keine Jahresarchive aus der Programmbasis ergänzen.
- Fehlgeschlagene Tests dürfen nicht durch Abschwächung oder Entfernung der Prüfung umgangen werden; zuerst ist die Ursache im Programm zu beheben oder die geänderte Fachregel zu dokumentieren.
- `node_modules`, temporäre Testartefakte und lokale Browserprofile gehören nicht in die veröffentlichte ZIP-Datei.


## UI-Feinschliff V99.2.1

- Die Arbeitsfläche darf auf großen Monitoren nicht durch eine alte feste Maximalbreite begrenzt werden.
- Der äußere Seitenabstand bleibt schmal, symmetrisch und über `--page-inline-space` zentral steuerbar.
- Das verbindliche Aktionsdesign ist blau: Primäraktion vollflächig blau, Nebenaktion weiß mit blauer Kontur.
- Breite Datentabellen liegen in einem horizontal scrollbaren Tabellenrahmen.
- Tabellen dürfen nicht allein durch generelles Umbrechen so zusammengestaucht werden, dass der horizontale Überlauf verschwindet.
- Nur ausdrücklich als Langtext gekennzeichnete Zellen brechen um.


## Verbindliche Navigation V99.2.5

Das freigegebene Navigations-Mock-up ist die verbindliche visuelle Referenz. Von Texten, Symbolen, Reihenfolge, Einzügen, Abständen, Trennlinien, Aufklapppfeilen, Dokument-Icons, Statuspunkten, Farben oder Hervorhebungen darf ohne vorherige ausdrückliche Abstimmung nicht abgewichen werden.

Verbindliche sichtbare Struktur:

1. Kopfbereich mit Gebäudelogo, **NK-PRO** und doppeltem Einklapppfeil.
2. Statuszeile **ABRECHNUNG [Jahr]** mit grünem Status **in Bearbeitung**; bei Archiv, Finalisierung oder fehlender Abrechnung darf ausschließlich der Statustext fachlich angepasst werden.
3. **ÜBERSICHT**
   - Abrechnungsübersicht mit Tacho-Icon
   - Abrechnungsstatus mit Prüflisten-Icon
4. **STAMMDATEN**
   - Mieter mit Personen-Icon
   - Wohnungen mit Haus-Icon
5. **ABRECHNUNG**
   - 1 Grundlagen: Mieter & Wohnungen; Kostenarten
   - 2 Einnahmen & Verbräuche: Miete & Vorauszahlungen; Zählerstände; Manuelle & externe Werte
   - 3 Berechnung: Nebenkostenumlage; Neue Vorauszahlungen
   - 4 Prüfung & Ausgabe: Qualitätsprüfung; Abrechnungsbriefe; Export
6. **SYSTEM**
   - Datensicherung mit Datenbank-Icon
7. Abschlusszeile mit Linkspfeil und **Navigation einklappen**.

Verbindliche Gestaltungsregeln:

- feste Desktopbreite der Navigation: **324 px** (10 % schmaler als die freigegebene V99.2.4-Ausführung mit 360 px),

- ruhiger dunkelblauer Verlauf ohne Kartenrahmen, Schattenkarten oder Baumlinien,
- kleine graue Versalüberschriften für die vier Bereiche,
- dezente horizontale Trennlinien zwischen Bereichen und Workflowphasen,
- Aufklapppfeil links und Dokument-Icon rechts in jeder Workflowphase,
- immer genau eine Workflowphase geöffnet,
- Unterpunkte nur in der geöffneten Phase sichtbar,
- aktiver Tab mit hellblauer Fläche, blauem Balken links und blauem Punkt rechts,
- inaktive Workflow-Unterpunkte mit grauem Punkt rechts,
- keine zusätzlichen Statussymbole oder Badges, solange sie nicht ausdrücklich freigegeben sind,
- technische Tab-IDs bleiben stabil und jeder Tab ist genau einmal erreichbar,
- direkte Klicks, Schnellaktionen und programmgesteuerte Tabwechsel öffnen automatisch die passende Phase,
- der zuletzt geöffnete Phasenzustand wird lokal gespeichert,
- verkürzte Texte gelten nur in der Navigation; vollständige Seitentitel bleiben erhalten.

## Praxisanpassungen V99.2.2

- Im Tab **Mieter & Wohnungen** liegt der Bestands- und Abrechnungsabgleich nicht mehr in einer eigenen ersten Klappbox. Die Inhalte und die Übernahmeaktion stehen in **Prüfung und Plausibilität**. Die verbleibenden Klappboxen werden fortlaufend neu nummeriert.
- In **Kostenarten & Einstellungen → Umlage pro Mietverhältnis / Wohnung** werden ausschließlich die Mieter-ID und der Mietername in den Mieter-Spalten größer dargestellt. Andere Spalten bleiben typografisch unverändert.
- Der einleitende blaue Hinweisblock in **Kaltmiete & NK-Vorauszahlungen → Kaltmieteinnahmen** entfällt.
- Tabellen im Tab **Zählerstände** beginnen horizontal an derselben Standardposition wie Tabellen in **Kaltmiete & NK-Vorauszahlungen**. Tabbezogene Vollbreiten-Sonderformatierungen dürfen diesen gemeinsamen Tabellenbeginn nicht mehr aufheben.


## Verbindliche Ergänzungen V99.2.6

### Status und Prüfung

- Der mittlere Seitenkopf zeigt immer den tatsächlichen Zustand der geöffneten Abrechnung. Ein archivierter Status darf niemals allein durch ein CSS-Überschreiben des `hidden`-Attributs sichtbar werden.
- Zulässige Statuswerte sind „In Bearbeitung · bearbeitbar“, „Finalisiert · schreibgeschützt“, „Archiviert · schreibgeschützt“ und „Keine Abrechnung geöffnet“.
- Prüfungskacheln kennzeichnen jeden einzelnen Prüfpunkt semantisch: `ok` mit grünem Haken, `warn` mit orangem Warndreieck und `error` mit rotem Fehlerzeichen. Reine Aufzählungspunkte sind dort nicht zulässig.

### Zählerstände

- Hauszählerverbrauch, Verbrauch laut Wasserwerksrechnung und Summe der Wohnungs-/Unterzähler sind getrennte Größen. Sie dürfen weder automatisch gleichgesetzt noch durch denselben Eingabewert ersetzt werden.
- Die automatische Übernahme berechneter Zählerverbräuche in Kostenarten mit Umlageschlüssel „Verbrauch“ ist verbindlicher Standard und besitzt keinen sichtbaren Abschaltschalter.
- K002 zeigt Summen ausschließlich für Verbrauchsspalten. Anfangs- und Endstände werden nicht summiert.
- Filterleiste und zugehöriger Tabellenrahmen bilden ein gemeinsames Tabellenmodul und beginnen sowie enden horizontal an derselben Position. Diese Regel gilt für jede bestehende und zukünftige Tabelle im Tab.
- Technische Fortschreibungserklärungen bleiben im Normalzustand unsichtbar. Eine Meldung erscheint nur bei einer konkreten Auffälligkeit und nennt deren Umfang.
- Historienquellen und Erläuterungen stehen nach der zugehörigen Tabelle.

### Umlage und Vorauszahlungsanpassung

- Die Umlage wird aus dem aktuellen Datenstand live berechnet. Eine sichtbare Aktion „Umlage neu berechnen“ darf nicht wieder eingeführt werden, solange sie keine eigenständige fachliche Berechnung auslöst.
- Rücksetzfunktionen stehen im fachlich betroffenen Eingabebereich, sind klar bezeichnet und benötigen eine Sicherheitsabfrage.
- Umfangreiche Einstellungsblöcke verwenden auf Desktop ein kompaktes, responsives Raster; doppelte Überschriften innerhalb gleichnamiger Klappboxen sind zu vermeiden.

## Fachlicher Entwicklungsauftrag: Vorjahresübernahme der NK-Vorauszahlungen

Die heutige Meldung zur Vorjahresübernahme, beispielsweise „144 Werte übernommen, davon 19 mit Vorauszahlungsanpassung“, ist fachlich und sprachlich nicht ausreichend nachvollziehbar. Vor einer Überarbeitung der Oberfläche muss geklärt und dokumentiert werden:

- welche konkrete Dateneinheit als „übernommener Wert“ gezählt wird,
- wie Anpassungen innerhalb des Vorjahres in den neuen Anfangswert einfließen,
- ob die bestehende Übernahmelogik für alle Kostenarten und unterjährige Mietverhältnisse fachlich richtig ist,
- welche Ausgangs- und Zielwerte dem Nutzer gezeigt werden müssen,
- wie eine verständliche, prüfbare Meldung ohne missverständliche Gesamtzahl formuliert wird.

Die Logik und die Meldung dürfen erst nach dieser fachlichen Definition geändert werden.

## Fachlicher Entwicklungsauftrag: Prüfung Kaltmiete & NK-Vorauszahlungen

Für die Klappbox **Prüfung und Plausibilität** im Tab **Kaltmiete & NK-Vorauszahlungen** muss eine eigene fachliche Prüfroutine entwickelt werden. Der aktuelle allgemeine Prüfstatus reicht dafür nicht aus. Die spätere Routine soll mindestens untersuchen:

- Vollständigkeit der Kaltmieten und NK-Vorauszahlungen,
- Soll-/Ist-Abweichungen der Kaltmiete,
- fehlende, negative oder offensichtlich unplausible Beträge,
- auffällige Abweichungen zum Vorjahr,
- Besonderheiten bei unterjährigen Mietverhältnissen und Mieterwechseln,
- Widersprüche zwischen aktivierten Kostenarten und erfassten Vorauszahlungen.

Bis zur fachlichen Spezifikation bleibt die bestehende Platzhalteranzeige erhalten. Diese Dokumentation ist kein Auftrag, die Prüflogik ohne abgestimmte Regeln vorzeitig zu implementieren.

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


## Verbindliche Ergänzungen V99.2.7

### Physischer Bestand und Periodenstatus

- `state.stammdaten.wohnungen` enthält ausschließlich physische Stammdaten und keinen Abrechnungsstatus.
- `state.wohnungen[].status` ist ein periodenbezogener Wert der geöffneten Abrechnung.
- Stammdatenabgleich und Migration ordnen Wohnungen über die stabile Wohnungs-ID zu und dürfen einen vorhandenen Periodenstatus nicht überschreiben.
- Beim Jahreswechsel wird der Status des Vorjahres übernommen. Eine neu auftauchende physische Wohnung erhält `aktiv`.
- „Verteilung auf alle Wohneinheiten“ verwendet sämtliche physischen Wohnungen der Abrechnung, auch unbewohnte oder inaktive. „Verteilung nur auf aktive Wohneinheiten“ filtert ausschließlich nach Periodenstatus.

### Kostenidentität und freie Kostenarten

- Kosten-ID, Standardbezeichnung und Fachgruppe einer Standardkostenart sind unveränderliche Identitätsdaten.
- Eigene Kostenarten verwenden ausschließlich bereits vorgesehene freie Kosten-IDs. Eine UI-Aktion darf keine neue fortlaufende ID erzeugen.
- Anzeigenamen freier Kostenarten steuern keine Fachlogik. Berechnung, Briefgruppierung und Zählerverhalten richten sich nach ID, Fachgruppe und Eingabequelle.

### Eigentümer-/Privatrolle

- Eigentümer-/Privatzeilen gehören zur vollständigen Umlagebasis und müssen in Summen- und Kontrollansichten erscheinen.
- Sie werden nicht als Mieterforderung behandelt und erhalten keine Mieterbriefe, Mietwerte oder Vorauszahlungsanpassungen.
- Die Summenidentität lautet: Mieteranteile + Eigentümer-/Privatanteile + offene/nicht zugeordnete Anteile = verteilte Gesamtkosten.

### Eingabequellen

Je Kostenart ist genau eine Quelle aktiv:

1. `Zählerstände` – aus Anfang/Ende berechnete Einheiten,
2. `Verbrauchsmenge` – manuell erfasste Einheiten,
3. `Direkter Eurobetrag` – fertiger Kostenanteil ohne weitere Verteilung,
4. `Externe Einzelabrechnung` – fertige Einzelanteile mit Abgleich zur Gesamtrechnung.

Ein Quellenwechsel mit vorhandenen Werten verlangt eine bewusste Bestätigung. Werte werden nicht stillschweigend gelöscht. Die Berechnung darf dieselben Daten niemals aus zwei Quellen addieren.

### Zählerfortschreibung

- Zählerwerte sind primär über Mieter-ID und ersatzweise über Wohnungs-ID zuzuordnen; die Arrayposition ist keine Identität.
- Bei einem Mieterwechsel bleibt der Vorjahresendstand an der Wohnung und wird zum Anfangsstand des neuen Nutzers.
- Archivierte Zählerstände sind unveränderliche Historienquellen. Excel-Altdaten und NK-Pro-Archivdaten bleiben als unterschiedliche Quellen kenntlich.

### Brieflayout

- Die Anschriftzone besitzt feste A4-Koordinaten für Fensterumschläge und darf nicht durch die Länge des Absenderkopfs verschoben werden.
- Eine Vorauszahlungsseite wird nur erzeugt, wenn die Ausgabe aktiviert ist und sich die monatliche Summe des konkreten Empfängers um mindestens 0,01 Euro ändert.
- Platzmangel wird am gerenderten A4-Blatt gemessen. Eine feste Zeichenzahl ist nicht die alleinige Seitenumbruchregel.
- Grußformel, Signatur und Fußzeile dürfen weder überlappen noch auf eine unbeabsichtigte Leerseite geraten.


## Verbindliche Dateistruktur ab V99.2.9

- `index.html` enthält die semantische Oberfläche, aber keinen produktiven Inline-CSS- oder Inline-JavaScript-Block.
- Produktives CSS liegt unter `assets/`; produktives JavaScript unter `js/`.
- Die Reihenfolge der JavaScript-Dateien ist Bestandteil der technischen Architektur und darf nur mit vollständigem Regressionstest geändert werden.
- Die Anwendung bleibt ohne Framework und ohne Buildschritt direkt ausführbar.
- Fachliche Aufteilung von `js/app.js` erfolgt erst in späteren, einzeln geprüften Schritten.
