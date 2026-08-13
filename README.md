# NK-Pro V99.4.73 – bestätigte 2025-Echtdaten & externe Abrechnung

V99.4.73 baut auf V99.4.72 auf und übernimmt die bestätigten Abrechnungswerte 2025 dauerhaft: Wohnungswasserstände, Wasserwerksrechnung, Hauswasserzählernummer, Müllgebühren sowie die strukturierte Techem-Jahresabrechnung. Die externe Heizkostenabrechnung ist zugleich als normal manuell pflegbarer Eingabebereich ausgebaut.

- Produktversion: **V99.4.73**
- Build-/Cachekennung: `99.4.73-confirmed-2025-data`
- Datenschema: **5** unverändert
- Migrations-ID: `confirmed-2025-operating-data-v99.4.73`
- Browserprüfung: **18/18**, 0 Runtime-Fehler
- Detailnachweise: `V99.4.73_RELEASE_NOTES.md`, `V99.4.73_UMSETZUNGSBERICHT.md`, `V99.4.73_TESTBERICHT.md`, `V99.4.73_DATENUEBERNAHME_2025.md`

---

# NK-Pro V99.4.71 – Professionelles Immobilien-Analysezentrum

## NK-Pro V99.4.71 – Professionelles Immobilien-Analysezentrum

V99.4.71 baut das Analysezentrum auf einer gemeinsamen read-only Analyseengine mit kennzahlenbezogener Vergleichbarkeit neu auf. Die drei fachlich getrennten Perspektiven **Nebenkosten & Abrechnung**, **Finanzen** und **Steuerliche Auswertung** verwenden dieselben zentral berechneten Werte für Übersicht, Details, Tabelle, Drill-down und Export.

Die Übersicht priorisiert vier Haupt-KPIs, große Entwicklung und unmittelbare Veränderungserklärung. Fehlende Werte bleiben von echten Nullwerten getrennt; unvollständige bzw. fachlich ungeeignete Perioden erzeugen keine irreführenden Änderungsprozente. Wasser/Zähler, Teilnehmer, Wohnungen, Vorauszahlungen/Salden, Leerstand und Eigentümerbelastung sind vertiefbar. Cashflow wird nur bei vollständigen datierten Zahlungsbewegungen berechnet; steuerliche Klassifikation bleibt ohne definierte Regel offen.

- Produktversion: **V99.4.71**
- Build-/Cachekennung: `99.4.71-professional-analysis-center`
- Datenschema: **5** unverändert
- Analyseengine: **2**, `metric-aware-v2`
- Releaseprüfung: `NKPRO_REAL_DATA=/pfad/zum/gesamtbestand.json npm run release:check:v99471`
- Vollständige V99.4.71-Nachweise: `AP_ANALYSE_V99_4_71/`


## NK-Pro V99.4.69 – Kosten- und Umlagenabgleich sowie Archivkonsistenz

V99.4.69 führt die offene visuelle und technische Nacharbeit des freigegebenen Stands V99.4.68 zu Ende. Die Seite **Analyse → Kosten- und Umlagenabgleich** besitzt nun eine klare Karten-, Tabellen-, Kontroll- und Statusstruktur mit responsivem Ergebnisbereich. Kontrolldifferenz und fachlicher Status bleiben getrennt; eine rechnerische Kontrolldifferenz von `0,00 €` kann daher weiterhin gemeinsam mit einem fachlich offenen Status angezeigt werden.

Die Archivaktion ist zustandsabhängig und in sichtbarem Tooltip, `title`, `aria-label`, Bestätigung und Aktion konsistent:

- aktuelle Abrechnung: `Abrechnung ins Archiv verschieben.`
- kontrolliert geöffnete Archivkorrektur: `Archiv aktualisieren.`

Die Snapshot-Prüfsumme wird erst nach vollständiger Bildung der Perioden- und Korrekturmetadaten erzeugt. Dadurch kann ein kontrolliert geöffneter Archivstand sicher aktualisiert werden, ohne seine Periodenidentität zu verlieren. Die Teilnehmerlogik V99.4.68 bleibt unverändert geschützt; Privat- und Eigenanteile sind reguläre Abrechnungsteilnehmer und keine zusätzliche Vermieterkostenkategorie.

- Produktversion: **V99.4.69**
- Build-/Cachekennung: `99.4.69-ui-archive-consistency`
- Datenschema: **5** unverändert
- Datenebenenvertrag: **1** unverändert
- Browserprüfung: Chromium offline bei 1600, 1366, 1024 und 820 Pixeln
- Releaseprüfung: `npm run release:check:v99469`

## NK-Pro V99.4.68 – Systemweite Korrektur Privatanteil und Eigenanteil

V99.4.68 behandelt die Nutzungsarten **Privatanteil**, **Eigenanteil**, **Eigentümer/Privat** und private Nutzung als reguläre Abrechnungsteilnehmer. Die Nutzungsart bleibt eine reine Kennzeichnung und löst keine Ausschlüsse oder abweichende Finanzlogik mehr aus.

Die zentrale Teilnahmeentscheidung lautet `isSettlementParticipant(record)`. `isBillableTenant(record)` besteht nur noch als kompatibler Alias. Alle Teilnehmer laufen durch dieselbe Ergebnis-, Prüf-, Dokument-, Export-, Archiv- und Jahreswechselstruktur. Der aktive Echtdatenfall `M000` / Erik Zimmermann / `W000.UG` besitzt in aktueller Abrechnung, Objektstandard und zentralem Stammdatenbestand das Einzugsdatum `01.01.2010`; finalisierte Archive bleiben unverändert.

- Produktversion: **V99.4.68**
- Build-/Cachekennung: `99.4.68-private-participants`
- Datenschema: **5** unverändert
- Datenebenenvertrag: **1** unverändert
- Vollständige Nachweise: `V99_4_68_Dokumentation/`


Die Abschlussseite unter **Nebenkosten abrechnen → Prüfen und abschließen** zeigt ausschließlich handlungsrelevante offene Punkte, erledigte Prüfungen und den finalen Abschlussstatus. Das vollständige Regelinventar ist rein lesend unter **Analyse → Regelinventar** erreichbar.

Datenschema 5, Regel-IDs, Berechnungen, Persistenz, Archive und Schreibschutz bleiben unverändert. Die Cache- und Buildkennung lautet `99.4.64-ap22f11b-k3`.

## Start

Die Anwendung ist eine statische lokale PWA. `index.html` über einen statischen Webserver öffnen.

---

# NK-Pro V99.4.43 – AP22F8B Vorauszahlungen Korrektur 1

Die Seite **„Nebenkosten abrechnen → Vorauszahlungen“** entspricht dem verbindlichen Standard **NK-Pro UI Referenz 1.0** und enthält vier kompakte Bestands- und Finanzkacheln sowie drei getrennte Tabellen für NK-Vorauszahlungen, Kaltmiete und Korrekturen/Gutschriften.

Alle Wohnungen und Belegungsfälle bleiben sichtbar. Nicht abrechenbare Fälle sind klar gekennzeichnet, nicht editierbar und aus Berechnung sowie Summen ausgeschlossen. NK-Korrekturen und Kaltmietkorrekturen werden getrennt erfasst, summiert und im Brief getrennt ausgewiesen. Kaltmietkorrekturen verändern das Nebenkostenabrechnungsergebnis nicht.

## Start

Die Anwendung ist eine statische lokale PWA. `index.html` über einen statischen Webserver öffnen. Die sichtbare Version lautet **V99.4.43**; die Cachekennung lautet `99.4.43-ap22f8b-k1`.

## Technische Grenzen

- HTML, CSS und JavaScript ohne Framework oder Buildsystem
- Datenschema 5 unverändert
- neue optionale Mietverhältnis-Eigenschaft `kaltmietKorrektur`, bei Altdaten automatisch mit `0` normalisiert
- Navigation, allgemeine Persistenz-, Migrations- und Archivwege unverändert
- horizontaler Überlauf ausschließlich innerhalb der jeweiligen Tabellenhülle
