# NK-Pro V99.4.43 – AP22F8B Vorauszahlungen

AP22F8B migriert ausschließlich die Seite **„Nebenkosten abrechnen → Vorauszahlungen“** auf den verbindlichen Standard **NK-Pro UI Referenz 1.0**.

Die Seite verwendet einen flachen Dokumentfluss mit drei getrennten Tabellen für NK-Vorauszahlungen, Kaltmiete sowie Korrekturen/Gutschriften. Alle Wohnungen und Belegungsfälle bleiben sichtbar; Eigentümer-/Privatfälle und Leerstände sind klar gekennzeichnet, nicht editierbar und von Berechnungen sowie Summen ausgeschlossen. Die vorhandenen Gesamtsummen bleiben vollständig erhalten und werden neutral hervorgehoben.

## Start

Die Anwendung ist eine statische lokale PWA. `index.html` über einen statischen Webserver öffnen. Die sichtbare Version lautet **V99.4.43**; die Cachekennung lautet `99.4.43-ap22f8b`.

## Technische Grenzen

- HTML, CSS und JavaScript ohne Framework oder Buildsystem
- Datenschema 5 unverändert
- Navigation, Berechnung, Persistenz, Migration, Archivierung, Brief und Druck unverändert
- horizontaler Überlauf ausschließlich innerhalb der jeweiligen Tabellenhülle
