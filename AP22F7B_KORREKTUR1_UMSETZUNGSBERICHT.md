# AP22F7B Korrektur 1 – Umsetzungsbericht

## Anlass

Nach der Browser-Sichtprüfung wurde festgestellt, dass die Tabellenköpfe auf `Nebenkosten abrechnen → Mietverhältnisse` nicht dem verbindlichen Standard der zuvor migrierten Seiten entsprachen. Allgemeine Buttonregeln gestalteten die eingebetteten Sortierbuttons als weiße Einzelbuttons; zugleich ergänzte die generische Tabellensortierung eine zweite Sortierkennzeichnung.

## Umsetzung

- beide Tabellenköpfe auf die freigegebene hellgraue Standarddarstellung zurückgeführt;
- Sortierbuttons rahmenlos und transparent in die Kopfzellen integriert;
- zusätzliches Pseudoelement der generischen Sortierung unterdrückt;
- generische `sortable`-Klassen und `onclick`-Handler nach dem Rendern ausschließlich für `mieterTable` und `wohnungenTable` entfernt;
- eigene AP22F7B-Sortierlogik, Filter, Suche, Ergebniszählung und Tastaturbedienung unverändert erhalten;
- PWA-Cachekennung auf `99.4.42-ap22f7b-k1` fortgeschrieben.

## Fachliche Auswirkungen

Keine. Datenmodell, Datenschema 5, Snapshot-Grenzen, Fach- und Statuslogik, Persistenz, Migration, Archivierung, Berechnung, Qualitätsregeln, Brief und Druck wurden nicht verändert.
