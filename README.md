# NK-Pro V99.4.42 – AP22F7B Korrektur 3

AP22F7B Korrektur 3 vervollständigt den zentralen NK-Pro-Tabellenstandard. Jede produktive Tabelle mit `nk-ui-table` besitzt nun einen sichtbaren rechten Rahmen an der letzten Kopf- und Datenzelle sowie die standardgerechten rechten Eckradien. Die Regel gilt automatisch für bereits migrierte und künftige Tabellen. Auf „Nebenkosten abrechnen → Mietverhältnisse“ werden Mietzeiträume sichtbar im deutschen Format `TT.MM.JJJJ` ausgegeben. Sortierung, Datenwerte, Persistenz und Fachlogik bleiben unverändert.

## Start

Die Anwendung ist eine statische lokale PWA. `index.html` über einen statischen Webserver öffnen. Die sichtbare Version lautet **V99.4.42**; die Cachekennung lautet `99.4.42-ap22f7b-k3`.

## Technische Grenzen

- HTML, CSS und JavaScript ohne Framework oder Buildsystem
- Datenschema 5 unverändert
- lokale Persistenz-, Migrations-, Archiv-, Brief- und Druckwege unverändert
- horizontaler Überlauf ausschließlich innerhalb der jeweiligen Tabellenhülle
