# AP22C – UI-Bibliothek: Tabellen und Listen

## Ziel

AP22C überführt produktive Anwendungstabellen, strukturierte Listen und unmittelbar tabellenbezogene Werkzeugleisten kontrolliert auf das zentrale `nk-ui-*`-System. Fachlogik, Datenmodell, Berechnungen, Persistenz, Navigation, Archiv, Briefe, Druck und Export bleiben unverändert.

## Migrierte Komponentenfamilien

- Tabellencontainer: `nk-ui-table-wrap`
- Tabellen: `nk-ui-table`, optional `nk-ui-table--compact`
- strukturierte Listen: `nk-ui-list` mit Varianten für einfache, getrennte, definierende und prüfpunktartige Listen
- tabellenbezogene Werkzeugleisten und Filter: `nk-ui-toolbar`, optional `nk-ui-toolbar--compact`

## Technische Umsetzung

`js/ui-design-system.js` stellt mit Version 1.2.0 die zentrale Migration für Tabellen, Listen und tabellenbezogene Werkzeugleisten bereit. Die vorhandene `upgrade(root)`-Schnittstelle und der begrenzte `MutationObserver` erfassen sowohl statisches als auch dynamisch erzeugtes Anwendungsmarkup.

Tabellenköpfe erhalten bei fehlender Angabe automatisch das semantische Attribut `scope="col"`; Zeilenköpfe entsprechend `scope="row"`. Die Änderung betrifft ausschließlich die DOM-Semantik und Darstellung.

## Schutz der Dokumentdarstellung

Tabellen und Listen innerhalb folgender Bereiche werden ausdrücklich nicht migriert:

- `.letter-page`
- `.brief-preview-host`
- `.document-print-window`
- explizit mit `data-nk-ui-table-skip` oder `data-nk-ui-list-skip` markierte Bereiche

Damit bleiben Briefvorschau, Druckfenster und PDF-/Dokumentlayout unverändert.

## Gestaltung

Die produktiven Tabellen verwenden zentrale Farben, Abstände, Rahmen, Radien, Fokusdarstellung und numerische Ausrichtung. Bestehende fachliche Spezialklassen für editierbare Zellen, Summenzeilen, Kostenansichten und Zählerdarstellungen bleiben als kompatible Spezialisierung erhalten.

Listen erhalten eine gemeinsame Grundtypografie; vorhandene fachliche Grid- und Statuslayouts bleiben bestehen. Tabellenbezogene Werkzeugleisten verwenden gemeinsame Abstände, Rahmen und Suchfeldregeln, ohne ihre Aktionen oder Ereignisbehandlung zu verändern.

## Abgrenzung

Nicht verändert wurden:

- Datenschema 5 und Datenebenenvertrag 1
- Sortier- und Filterlogik
- Tabelleninhalte und Berechnungen
- Zähler-, Mieter-, Kosten-, Umlage- und Archivfachlogik
- Navigation und Abrechnungskontext
- Brief-, Druck- und Exportlogik
- bestehende Regressionstests

## Folgeschritt

Nächstes Paket: **AP22D – UI-Bibliothek: Dialoge und Leerzustände**.
