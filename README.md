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
