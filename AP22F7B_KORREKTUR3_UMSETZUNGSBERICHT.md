# AP22F7B Korrektur 3 – Umsetzungsbericht

## Ausgangsbasis

`NK-Pro_V99_4_42_AP22F7B_Mietverhaeltnisse_Abrechnung_Korrektur2.zip`

SHA-256 der Ausgangsbasis: `4e089cdc414f4b19b7e036cab63d9d607a00f37ca50dc846adb8f7049b134333`

## Umgesetzte Korrekturen

1. Die zentrale Komponente `nk-ui-table` schließt jede Tabellenzeile an der letzten Zelle mit einem sichtbaren rechten Rahmen ab.
2. Die letzte Kopfzelle erhält den rechten oberen Standardradius; die letzte Zelle der letzten Datenzeile den rechten unteren Standardradius.
3. Die zentrale Regel wirkt auf alle bereits migrierten und künftigen Tabellen, sofern die verbindliche `nk-ui-table`-Komponente verwendet wird.
4. Auf `Nebenkosten abrechnen → Mietverhältnisse` werden Einzug, Auszug und Mietzeitraum sichtbar als `TT.MM.JJJJ` ausgegeben.
5. Die Mietzeitraum-Sortierung verwendet weiterhin die unveränderten ISO-Rohwerte und wird durch die sichtbare Formatierung nicht verändert.

## Unverändert

Navigation, Datenmodell, Datenschema 5, Fachlogik, Berechnungen, Statuslogik, Speicher-, Migrations-, Archivierungs-, Backup-, Brief- und Druckwege.
