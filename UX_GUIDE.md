# NK-Pro – UX Guide

**Ziel:** einfacher, stabiler und nachvollziehbarer Arbeitsablauf  
**Ausgangsversion:** V99.3.0  
**Aktueller Stand:** V99.4.23  
**Status:** Phase-1-Ziel umgesetzt; Datenmodellziele offen

## 1. Leitprinzip

NK-Pro bildet den tatsächlichen Arbeitsablauf ab:

1. Objekt vorbereiten,
2. Abrechnung anlegen oder öffnen,
3. Daten erfassen,
4. verteilen und prüfen,
5. Briefe und Export erzeugen,
6. abgeschlossene Abrechnung archivieren.

Die Oberfläche darf den Nutzer nicht zwischen getrennten Programmen, Datenbeständen oder Navigationssystemen wechseln lassen.

## 2. Landingpage

Die Landingpage besitzt ausschließlich zwei große Einstiege:

- **Objekt vorbereiten**
- **Nebenkosten abrechnen**

Die Landingpage ist nur eine Arbeitsweiche. Sie ersetzt nicht die Navigation. Beide Einstiege führen in dieselbe Anwendung und denselben Datenbestand.

### Akzeptanzkriterien

- genau zwei primäre Einstiegsflächen,
- keine fachliche Eingabemaske auf der Landingpage,
- keine versteckten oder verschwundenen Funktionen,
- jederzeit erreichbare Navigation,
- klare Rückkehrmöglichkeit zur Arbeitsweiche.

## 3. Zielnavigation

```text
▼ Objekt vorbereiten
  Objekt
  Wohnungen
  Zähler
  Mieter

▼ Nebenkosten abrechnen
  Abrechnungsübersicht
  Mieter & Wohnungen
  Miete & Vorauszahlungen
  Kosten erfassen
  Manuelle & externe Werte
  Verteilung
  Abrechnung prüfen
  Neue Vorauszahlungen
  Briefe
  Export

▶ Archiv

▶ Extras
```

### Navigationsregeln

- Accordion-Gruppen sind erwünscht.
- Alle Funktionen bleiben jederzeit erreichbar.
- Innerhalb „Nebenkosten abrechnen“ gibt es keine Untergruppe; alle zehn Einträge sind gleichrangig.
- Nur der zur Aufgabe passende Zweig muss geöffnet sein.
- Der aktive Eintrag ist eindeutig markiert.
- Gruppenstatus wird gespeichert, darf aber nie den fachlichen Zustand verändern.
- Archiv und Extras sind eigenständige Gruppen, keine versteckten Nebenfunktionen.

## 4. Aktive Abrechnung

Der Bereich **Aktive Abrechnung** erscheint ausschließlich, wenn eine Abrechnung tatsächlich geöffnet wurde.

Er zeigt:

- Objekt,
- Abrechnungsjahr,
- Status.

Zulässige Statuswerte:

- Bearbeitung,
- Nur Ansicht,
- Finalisiert.

### Verboten

- Bereich ohne geöffnete Abrechnung,
- Platzhalterjahr,
- leeres Objektfeld,
- Status „keine Abrechnung“ innerhalb eines sichtbaren Abrechnungskontexts,
- Vermischung von Archivansicht und Bearbeitungsstatus.

### Fachliche Zuordnung

| Zustand | Anzeige |
|---|---|
| keine Abrechnung geöffnet | Bereich existiert nicht |
| aktuelle bearbeitbare Abrechnung | Bearbeitung |
| Archiv oder schreibgeschützte Ansicht | Nur Ansicht |
| finalisierte aktuelle Abrechnung | Finalisiert |

## 5. Objekt vorbereiten

### Objekt

Enthält ausschließlich objektweite Standardangaben. Diese Werte dienen als Vorlage für neue Abrechnungen.

### Wohnungen

Verwaltet den dauerhaften physischen Wohnungsbestand. Periodenspezifische Aktivität oder Leerstand gehört in die jeweilige Abrechnung, nicht in eine rückwirkend wirkende Standardänderung.

### Mieter

Verwaltet Stammdaten und Mietverhältnisse. Eine Abrechnung erhält einen Snapshot. Spätere Stammdatenänderungen dürfen den Snapshot nicht still verändern.

### Zählerverwaltung

Enthält ausschließlich:

- Zähler-ID,
- Zählernummer,
- Typ,
- Einheit,
- Zuordnung,
- Einbaudatum,
- Ausbaudatum,
- Status.

Keine periodischen Anfangs- oder Endstände in diesem Bereich.

### Kostenarten und Umlageschlüssel

Standardwerte werden nur für neue Abrechnungen verwendet. Eine bestehende Abrechnung behält ihre übernommenen Definitionen.

## 6. Nebenkosten abrechnen

### Abrechnungsübersicht

Zeigt vorhandene Abrechnungen mit Jahr, Zeitraum, Objekt, Status und sicheren Aktionen. Anlegen, Öffnen, Finalisieren, Archivieren und Wiederbearbeiten müssen klar getrennt sein.

### Kosten erfassen

Erfasst Rechnungs- und Kostenwerte. Standarddefinitionen dürfen angezeigt, aber nicht rückwirkend aus dem Objektstandard überschrieben werden.

### Zählerstände

Enthält ausschließlich periodische Messdaten:

- Anfang,
- Ende,
- Verbrauch,
- Ablesedatum,
- Quelle.

Der Zähler selbst wird über seine dauerhafte Zähler-ID referenziert.

### Manuelle & externe Werte

Zeigt nur Kostenarten, deren fachliche Quelle manuell oder extern ist. Zählerbasierte Kosten werden nicht doppelt erfasst.

### Verteilung & Berechnung

Trennt Eingaben von Ergebnissen. Berechnungsergebnisse müssen nachvollziehbar auf Kostenart, Schlüssel, Basis und Empfänger zurückführbar sein.

### Qualitätsprüfung

Ist die zentrale Freigabestelle. Fehler sind blockierend. Hinweise dürfen als geprüft markiert werden, aber niemals fachlich verschwinden.

### Briefe und Export

Verwenden exakt den geöffneten Abrechnungsstand. Exportumfang und Archivanteil müssen eindeutig beschriftet sein.

## 7. Objektstandard und Snapshot-Prinzip

Beim Anlegen einer Abrechnung werden Standards einmalig kopiert:

- Umlageschlüssel,
- Kostenarten,
- Zähler,
- Briefvorlagen,
- Standardeinstellungen.

Danach besitzt die Abrechnung ihre eigenen Werte. Änderungen am Objektstandard wirken nur auf später neu angelegte Abrechnungen.

Die Oberfläche muss dieses Prinzip sichtbar machen, zum Beispiel durch Hinweise wie:

- „Standard für neue Abrechnungen“
- „Wert dieser Abrechnung“
- „Einmalig übernommen am …“

## 8. Schutz historischer Abrechnungen

- Archivansichten sind klar als schreibgeschützt gekennzeichnet.
- Keine Bearbeitungsbuttons in Nur-Ansicht-Zuständen.
- Keine automatische Stammdatenaktualisierung.
- Keine automatische Neuberechnung aufgrund geänderter Standards.
- Reparatur- oder Migrationshinweise müssen den betroffenen Zeitraum nennen.

## 9. Bedien- und Barrierefreiheitsstandard

- Tastaturbedienbare Navigation und Dialoge,
- sichtbarer Fokus,
- korrekte ARIA-Zustände,
- eindeutige Buttontexte,
- keine alleinige Farbcodierung,
- bestätigungspflichtige riskante Aktionen,
- verständliche Fehlermeldungen mit nächstem Schritt,
- keine horizontal versteckten Pflichtfelder,
- druckbare Briefe ohne UI-Elemente.

## 10. Umsetzungsstand V99.4.5

Umgesetzt sind:

- Landingpage mit genau zwei Einstiegen,
- vier logisch gruppierte Accordion-Bereiche,
- jederzeit erreichbare bestehende Funktionen,
- eigener Objekt-Hub auf Basis vorhandener Funktionen,
- eigenständige Archivübersicht,
- Abrechnungskontext ausschließlich bei geöffneter Abrechnung,
- Status Bearbeitung, Nur Ansicht und Finalisiert,
- Tastatur- und ARIA-Prüfung.

Noch offen und ausdrücklich nicht vorgetäuscht sind:

- eigenständige Zählerverwaltung mit dauerhafter Zähler-ID,
- Objektstandard für Kostenarten, Umlageschlüssel, Zähler, Briefvorlagen und Einstellungen,
- vollständige fachliche Trennung aller zukünftigen Objektstandards von periodischen Abrechnungswerten über die bereits gesicherten Snapshot-Grenzen hinaus.

Der Datenebenenvertrag und die Begrenzung von Abrechnungs- und Archivsnapshots sind seit V99.4.2 umgesetzt. Die verbleibenden Modelländerungen benötigen weiterhin Stop-Regel, Variantenvergleich, Nutzerentscheidung, das in V99.4.4 umgesetzte Vor-Migrationsbackup und den Wiederherstellungsnachweis.


## Ergänzung V99.4.6

Die Bedienoberfläche bleibt visuell unverändert. Fachliche Zählerfehler werden zentral erzeugt und können in einem Folgearbeitspaket in die bestehende Prüf- und Hinweissystematik eingebunden werden.


## Ergänzung V99.4.7

Die sichtbare UI-Struktur und das Design bleiben unverändert. Tabellenfilter und Sortierung liegen technisch in `ui-table-tools.js`; Navigationspräferenzen werden über `ui-preferences.js` gespeichert. Fachliche Berechnung, Dokumentdaten, Brief-HTML und Exporttechnik sind aus dem UI-Controller ausgelagert.


## AP18-Ergänzungen

- „Start“ ist als globaler, dauerhaft sichtbarer Rückweg zur Arbeitsweiche hervorgehoben.
- Aktionsflächen besitzen konsistente Höhen, Zustände und Tastaturfokus ohne Hover-Layoutsprünge.
- Die Briefvorschau startet mit „Ganze Seite“ und trennt Ansicht, Darstellung und Ausgabe.
- Benutzerskalierung verändert ausschließlich die Bildschirmansicht, nie Druck oder PDF.
- Werkzeuggruppen bleiben bei schmalen Fenstern zusammen; vollständige mobile Neuentwicklung ist nicht Teil von AP18.

## Ergänzung V99.4.23 / AP19

Der frühere Abschnitt „Aktive Abrechnung“ wird durch einen verbindlichen kontrollierten Abrechnungskontext präzisiert:

- Nach normalem Start und Browser-Neuladen ist keine Abrechnung geöffnet.
- Die Abrechnungsübersicht ist der einzige verbindliche Einstiegspunkt.
- Bearbeiten und Ansehen sind getrennte, ausdrückliche Aktionen.
- Fachlicher Status und Bedienmodus werden in der gelben Kontextleiste getrennt angezeigt.
- Ohne Kontext sind zehn Abrechnungs-Unterpunkte sichtbar, aber deaktiviert; ein Direkteinstieg darf keine Abrechnung auswählen.
- Im Modus Nur ansehen sind 52 schreibende Aktionen technisch gesperrt. Lesen, Navigation, Suche, Filter, Sortierung, Briefvorschau, Druck, PDF und nicht verändernde Exporte bleiben verfügbar.
- Abrechnung schließen beendet ausschließlich den Arbeitskontext und schützt ungespeicherte Änderungen.
- Archivierte Abrechnungen verwenden Ansehen oder Zur Korrektur öffnen; es wird keine Kopie erzeugt.
- Die beiden Bereichsübersichten zeigen produktive Mengen- und Statusangaben statt AP17-Vorschauwerten.

Die Statusbegriffe lauten vollständig, offen, Warnung, blockiert, in Bearbeitung, abgeschlossen, archiviert, DUMMY und nicht verfügbar. Sie werden nie ausschließlich über Farbe vermittelt.

## 7. AP20 – Prüfen und Freigeben

- Das zentrale Cockpit gliedert Prüfungen in acht fachliche Bereiche.
- Blocker, Plausibilitäten, Hinweise und technische Probleme werden begrifflich und visuell getrennt.
- Fachseiten zeigen nur die dort betroffenen Punkte.
- „Zur Ursache“ führt direkt zur betroffenen Seite und Entität.
- Bestätigt ist nicht gleich behoben. Datenänderungen können eine Bestätigung ungültig machen.
- Im Ansichtsmodus sind sämtliche Prüfentscheidungen gesperrt.
- Technische Selbsttests gehören in die Systemdiagnose, nicht in die fachliche Aufgabenliste.


## AP22D – Dialoge und Inhaltszustände

- Dialoge besitzen einen eindeutigen Titel, optional eine Beschreibung, einen scrollbaren Inhaltsbereich und einen klar getrennten Aktionsbereich.
- Beim Öffnen erhält ein fachlich sinnvolles Element den Fokus; beim Schließen kehrt er zum Auslöser zurück.
- Tab und Umschalt+Tab bleiben im geöffneten Dialog. Escape und Hintergrundklick sind nur zulässig, wenn der Dialog dies ausdrücklich erlaubt.
- Destruktive Aktionen erhalten weder den Anfangsfokus noch eine ungeschützte Standardschließung.
- Inhaltszustände unterscheiden keine Daten, noch nicht angelegt, leere Filterung, Laden, Fehler, nicht anwendbar und nicht verfügbar durch Text, Semantik und Darstellung; Farbe allein genügt nicht.
- Lade- und Fehlerzustände verwenden passende Live- und ARIA-Zustände.
