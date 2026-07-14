# AP19 – Produktive Bereichsübersichten und kontrollierter Abrechnungskontext

## Release

- Zielstand: **NK-Pro V99.4.22**
- Grundlage: **NK-Pro V99.4.21 / AP18**
- Datenschema: **5**
- Datenebenenvertrag: **1**
- Dokumentlayout: **4**, unverändert

## Zentraler Abrechnungskontext

AP19 führt einen transienten, zentral verwalteten Arbeitskontext mit genau drei Zuständen ein:

1. **Keine Abrechnung geöffnet** (`closed`)
2. **Bearbeiten** (`edit`)
3. **Nur ansehen** (`view`)

Der aktive Kontext wird nicht persistent gespeichert. Nach vollständigem Start oder Browser-Neuladen ist daher keine Abrechnung geöffnet. Persistiert wird ausschließlich der zuletzt verwendete gültige Arbeitsschritt pro stabiler Abrechnungskennung.

Ohne Kontext bleiben zehn fachliche Unterpunkte sichtbar, aber semantisch und technisch deaktiviert. Ein Aufruf führt nicht zu einer automatischen Auswahl, sondern zum Hinweis „Öffnen Sie zuerst eine Abrechnung zur Bearbeitung oder Ansicht.“ mit dem Direkteinstieg „Zur Abrechnungsübersicht“.

## Öffnen, Ansehen, Korrigieren und Schließen

- **Bearbeiten** öffnet die ausdrücklich gewählte aktuelle oder abgeschlossene Abrechnung im Bearbeitungsmodus.
- **Ansehen** öffnet die ausdrücklich gewählte Abrechnung schreibgeschützt.
- Eine neu angelegte Abrechnung bleibt nach der Erstellung geschlossen und erscheint in der Übersicht.
- Abgeschlossene Abrechnungen verwenden beim erneuten Bearbeiten das bestehende Freigabe-/Statusmodell.
- Archivierte Abrechnungen öffnen standardmäßig über **Ansehen**. **Zur Korrektur öffnen** bestätigt den Vorgang, verwendet den bestehenden Statuscode `KORREKTUR`, bewahrt die Daten und erzeugt keine Kopie.
- **Abrechnung schließen** beendet den Kontext, ändert keinen fachlichen Status, kehrt zur Übersicht zurück und schützt ungespeicherte Änderungen.
- Ein kontrollierter Wechsel ersetzt nie stillschweigend eine geöffnete Abrechnung.

## Schreibgeschützter Ansichtsmodus

Die gelbe Kontextleiste trennt fachlichen Status und Bedienmodus. Im Ansichtsmodus erscheinen Schlosskennzeichnung, „Nur ansehen“, „Abrechnung schließen“ und auf jeder Abrechnungs-Unterseite der Hinweis:

> Schreibgeschützte Ansicht  
> Diese Abrechnung wurde nur zur Ansicht geöffnet. Änderungen sind nicht möglich.

Der Schutz besteht aus drei Ebenen:

1. Schreibende Aktionen werden in der Oberfläche ausgeblendet oder deaktiviert.
2. Ereignisdelegation und Anwendungsmodule prüfen den zentralen Kontext.
3. Direkte/programmgesteuerte Schreibaufrufe lösen `NKPRO_BILLING_READONLY` mit dem verbindlichen Hinweis aus.

52 schreibende Aktionskennungen sind zentral registriert. Zusätzlich sind Eingaben, Dialogaktionen und Strg/Cmd+S im Ansichtsmodus gesperrt. Navigation, Suche, Filter, Sortierung, Detailansichten, Briefvorschau, Druck, PDF und nicht verändernde Exporte bleiben verfügbar.

## Produktive Bereichsübersichten

Die bisherigen AP17-Vorschauwerte wurden entfernt. Beide Übersichten verwenden ausschließlich den aktuellen Projektzustand.

### Objekt vorbereiten – Datenquellen

- `state.meta` und `objektStandard`: Objekt, Kurzcode und Abrechnungszeitraum
- `state.wohnungen`: aktive Einheiten, Pflichtfelder, Flächen und Status
- `state.mieter`: aktive Mietverhältnisse, Zuordnung, Anschrift und Vertragsdaten
- `state.kostenarten`: Kostenarten, Beträge und Verteilerschlüssel
- Verbrauchs- und Zählerdaten: vorhandene abrechnungsrelevante Grundlagen
- zentrale Qualitätsprüfung: Fehler, Warnungen und blockierende Befunde

### Nebenkosten abrechnen – Datenquellen

- aktueller Arbeitsstand und Jahresstatus
- `state.archive`: vorhandene archivierte Abrechnungen
- Kostenarten und vollständige Kostenbeträge
- Verbrauchskosten und vorhandene Verbrauchswerte
- aktive und berechenbare Einheiten
- Qualitätsfehler und Warnungen
- erzeugte Brief-/Dokumentdaten
- fachlicher Abschlussstatus

Die gemeinsame Informationsarchitektur verbindet Statusübersicht, Workflow-Direkteinstiege und die zentrale Abrechnungsliste. Direkteinstiege wählen niemals automatisch eine Abrechnung.

## Status- und Prüfregeln

### Statuskennzeichnungen

1. **Vollständig** – alle zwingenden Daten der Regel sind vorhanden und konsistent.
2. **Offen** – erforderliche Bearbeitung ist noch nicht abgeschlossen, aber kein harter Widerspruch liegt vor.
3. **Warnung** – Verarbeitung ist möglich, empfohlene oder auffällige Angaben erfordern Prüfung.
4. **Blockiert** – eine zwingende Grundlage fehlt oder ein kritischer Qualitätsfehler verhindert den nächsten fachlichen Schritt.
5. **In Bearbeitung** – eine aktuelle Abrechnung ist angelegt und nicht fachlich abgeschlossen.
6. **Abgeschlossen** – der vorhandene Abschluss-/Finalisierungsstatus ist gesetzt.
7. **Archiviert** – die Abrechnung liegt im bestehenden Jahresarchiv.
8. **DUMMY** – ausschließlich der Zählerbereich „Objekt vorbereiten → Zähler“ besitzt weiterhin diesen Status.
9. **Nicht verfügbar** – Datenquelle oder Funktion ist für den konkreten Zustand nicht anwendbar.

Status wird immer zusätzlich durch Text und vorhandene Linienicons gekennzeichnet, nicht ausschließlich durch Farbe.

### Acht produktive Regeln

| Regel | Zwingende Grundlage | Vollständig | Warnung / blockiert |
|---|---|---|---|
| Einheiten | aktive Einheit mit Kennung, Bezeichnung und gültiger Fläche | alle aktiven Einheiten vollständig | fehlende Pflichtangabe blockiert |
| Mietverhältnisse | Name, Einheit, Zeitraum und erforderliche Anschrift | alle relevanten Mietverhältnisse vollständig | unvollständig offen; fehlende Zuordnung blockiert |
| Zeitraum | gültiger Beginn, gültiges Ende, Jahr | Zeitraum vollständig und chronologisch | fehlend oder widersprüchlich blockiert |
| Kosten | aktive Kostenart, Betrag und Verteilerschlüssel | alle aktiven Kostenarten vollständig | fehlender Betrag/Schlüssel blockiert; Auffälligkeit warnt |
| Verbrauch | abrechnungsrelevante Verbrauchskosten mit Datenbasis | alle relevanten Grundlagen vorhanden | fehlender relevanter Wert blockiert |
| Verteilung | gültige Zuordnungen und berechenbare aktive Einheiten | alle aktiven Einheiten berechenbar | nicht berechenbare Einheit blockiert |
| Qualität | zentrale Qualitätsdiagnose | keine Fehler | Warnungen kennzeichnen Prüfbedarf; Fehler blockieren |
| Briefe | erzeugbare/erzeugte Dokumente je relevantem Mietverhältnis | erforderliche Briefe vorhanden | fehlende Dokumente bleiben offen |

Fehlende Daten werden als konkrete Mengenangabe ausgegeben. Widersprüche werden durch die zentrale Qualitätsdiagnose mindestens als Warnung, bei fachlicher Unberechenbarkeit als Blockade behandelt. Archiv-, Eigentümer-/Privat-, inaktive Einheiten und nicht abrechnungsrelevante DUMMY-Zähler werden als Sonderfälle getrennt berücksichtigt.

## UI-, Navigation- und Layoutbereinigung

- zehn redundante Zeitraum-/Statusblöcke wurden aus den Abrechnungsseiten entfernt;
- die gelbe Kontextleiste bleibt die zentrale Informationsquelle;
- zwei gezielte CSS-Trennregeln verhindern doppelte Linien unter Gruppen und Start;
- die Abrechnungsliste wechselt in schmalen Ansichten in eine lesbare Karten-/Zeilendarstellung;
- deaktivierte Navigation bleibt lesbar und erhält `aria-disabled`;
- Fokus, Tabreihenfolge und erlaubte Bedienaktionen bleiben erhalten;
- das AP18-Buttonsystem sowie AP13-Brief-, Druck-, PDF- und Schwarzweißlayout bleiben unverändert.

## Bekannte Einschränkungen

- Der Zählerbereich unter „Objekt vorbereiten“ bleibt ausdrücklich DUMMY.
- Keine Mehrprojekt-/Mehrgebäudefähigkeit und keine parallelen Abrechnungskontexte.
- Keine vollständige mobile Neuentwicklung.
- Der isoliert erzeugte Archiv-Viewer startet aufgrund seines expliziten Viewer-Dokuments im Ansichtsmodus; normale Anwendungsladevorgänge starten immer geschlossen.
- Die serverbasierte Playwright-Ausführung ist in der Prüfumbgebung durch eine Host-Richtlinie für Loopback-Navigation blockiert. Ein realer Chromium-Fallback ohne Netzwerkserver prüft dieselben AP19-Kernabläufe mit fünf Szenarien und 42 Einzelprüfungen.
