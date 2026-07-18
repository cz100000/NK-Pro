# AP22F8B – Umsetzungsbericht

## Ausgangsbasis

`NK-Pro_V99_4_42_AP22F7B_Mietverhaeltnisse_Abrechnung_Korrektur3.zip`

SHA-256 der geprüften Ausgangsbasis: `4f879297d13e6ab480530133f45c9b6c3eb44332b76d7f7ce0064e5363942d4d`

## Umgesetzt

- Seite `einnahmen` auf NK-Pro UI Referenz 1.0 migriert.
- Klappboxen durch einen flachen Dokumentfluss ersetzt.
- Drei getrennte Tabellenbereiche für NK-Vorauszahlungen, Kaltmiete und Korrekturen/Gutschriften eingeführt.
- Alle sieben Wohnungen beziehungsweise Belegungsfälle sichtbar gehalten: vier abrechenbare Mietverhältnisse, ein Eigentümer-/Privatfall und zwei Leerstände im Standardfall.
- Nicht abrechenbare Fälle klar gekennzeichnet, nicht editierbar und weiterhin aus Berechnung und Summen ausgeschlossen.
- Bestehende Gesamtsummen in allen drei Tabellen vollständig erhalten.
- Gelbe Eingabeflächen und grüne Summenflächen durch neutrale Tabellenflächen ersetzt.
- Suche, Statusfilter, Sortierung, Zurücksetzen und Ergebniszählung rein darstellungsbezogen ergänzt.
- Rechter Tabellenabschluss und ausschließlich interner Tabellen-Scroll für schmale Ansichten beibehalten.

## Unverändert

Navigation, globale Kopfzeile, Abrechnungskontextleiste, Datenschema 5, Berechnungen, Datenfelder, Speicherwege, Persistenz, Migration, Archivierung, Qualitätsregeln, Brief und Druck.
