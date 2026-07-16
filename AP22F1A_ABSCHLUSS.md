# AP22F1A – Abschluss

AP22F1A ist umgesetzt. Das Release besitzt ein zentrales globales Schalenfundament für 18 sichtbare Ansichten, eindeutige H1-Seitenköpfe und eine responsive Abrechnungskontextleiste ohne Modusangabe. Die Arbeitsweiche ist in die zentrale Schale aufgenommen; ihre Karten und Bedienlogik blieben unverändert.

Die Navigation ist vollständig bytegleich zur Ausgangsbasis. `js/billing-context.js`, Fachlogik, Berechnungen, Datenschema 5, Persistenz, Migration, Backup/Restore, Archiv/Snapshots, Dirty-State, Import/Export, Prüfregeln, Brieflayout, Vorschau, Druck und PDF sind unverändert geschützt.

Die neuen AP22F1A-Tests bestehen vollständig. Historische unveränderte Tests mit fest verdrahteten früheren Versionen, Navigationen, Modusfeldern oder UI-Bibliotheksständen sind im Prüfbericht getrennt als überholte Assertions dokumentiert und wurden nicht verändert.

## Verbleibend für AP22F1B

- statische Angaben `Gespeichert` prüfen und gegebenenfalls entfernen,
- lokale Metablöcke in Seitenköpfen gesondert bewerten,
- globale beziehungsweise doppelte Save-Aktionen einschließlich `manuellewerte` bereinigen,
- bearbeitbare Zeitraumsektion auf `start` gesondert behandeln,
- eine mögliche Verlagerung von `Zur Bearbeitung öffnen` nur nach neuer Freigabe,
- keine Karten-, Tabellen-, Formular-, Dialog- oder Klappboxmigration ohne eigenes Paket.
