# NK-Pro V99.4.64 – AP22F11B Korrektur 3

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
