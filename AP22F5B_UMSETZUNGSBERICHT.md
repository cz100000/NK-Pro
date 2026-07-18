# AP22F5B – Umsetzungsbericht

## Ergebnis
Die technische Migration der Seiten **Zähler** (`wasser`) und **Mietverhältnisse** (`mieterverwaltung`) ist für Release **V99.4.40** abgeschlossen. Grundlage war ausschließlich `NK-Pro_V99_4_39_AP22F4B_Wohnungen_Korrektur1.zip` sowie die im Dialog freigegebenen Zielentscheidungen und Mockups.

## Zähler-DUMMY
- genau fünf kompakte Karten für Wasser, Wärme, HKV, Gas und Strom
- einheitliche SVG-Linienicons mit fünf zentralen semantischen Farbtokens
- statische DUMMY-Tabelle mit sieben Beispielzeilen
- Suche und Zählerartfilter ausschließlich als DOM-Filter
- keine `data-ui-action`, keine Speicheraktion und keine Mutation von `state`
- DUMMY-Kennzeichnung im Seitenkopf, im oberen Hinweis, in der Tabellenkarte und im Abschluss
- weißer Tabelleninnenabstand und interner Tabellen-Scroll

## Mietverhältnisse
- vier Kennzahlenkarten: Gesamt, Aktiv, Nicht aktiv, Archiviert
- Kennzahlen ausschließlich aus `masterVisibleTenantRows()`, `masterArchivedTenantRows()` und `tenantOpenStatus()`
- Suche, Wohnungsfilter und Statusfilter ohne Datenmutation
- alle zwölf vorhandenen Pflegefelder erhalten: Wohnung, Name, Einzug, Auszug, Rolle, Geschlecht, Standardanrede, Straße, PLZ, Ort, Telefon und E-Mail
- vorhandene Neuanlage, globale Speicherung, Archivierung und Reaktivierung erhalten
- bestehender Archivbereich in eine zentrale Klappkarte überführt
- vorhandener Nur-Ansehen-Modus vollständig erhalten: Suche und Filter bleiben nutzbar, während Speichern, Neuanlage, Eingaben sowie Archivieren/Reaktivieren deaktiviert sind
- handlungsorientierter Schreibschutzhinweis im normalen Dokumentfluss
- Tabellen und Hinweise im normalen Dokumentfluss; interner Overflow ohne Seitenüberlauf

## Fachliche Abgrenzung
Es wurden keine neuen Datenfelder, Fachregeln, Statuswerte, Persistenzwege, Migrationen, Zählerstammdaten, Messwerte oder Abrechnungswirkungen eingeführt. Navigation, Zählerfachmodule, Objektstandard, Persistenz, Migration, Backup/Restore, Snapshot und Qualitätsregeln bleiben hashidentisch.

## UI-Referenz
Die nicht produktiv eingebundene Referenz wurde um die Abschnitte `#meters-page` und `#tenancies-page` ergänzt. Sie zeigt die freigegebenen Karten-, Tabellen-, Filter-, Aktions- und Responsive-Muster.
