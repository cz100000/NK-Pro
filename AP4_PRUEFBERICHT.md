# NK-Pro V99.4.5 – AP4-Prüfbericht

**Prüfdatum:** 12. Juli 2026  
**Gegenstand:** Objektstandard und Abrechnungssnapshot  
**Ausgangsbasis:** NK-Pro V99.4.4

## Ergebnis

| Prüfgruppe | Ergebnis |
|---|---|
| JavaScript-Syntax | 12/12 bestanden |
| kanonische Referenzfälle | 6/6 bestanden |
| Release-Konsistenz | bestanden |
| UI- und Modulgrenzen | 10/10 bestanden |
| Migration, Sicherung, Restore, Rollback | 6/6 bestanden |
| Objektstandard und Snapshot | 8/8 bestanden |
| Persistenz, Archiv und Export/Import | 5/5 bestanden |
| Referenzberechnung und PWA | 7/7 bestanden |
| Browserprüfungen gesamt | 36/36 bestanden |

## Nachgewiesene AP4-Eigenschaften

- V99.4.4-Bestände erhalten Objektstandard 1 ohne Verlust der Quellarrays oder unbekannter Felder.
- Vor der additiven Objektstandardmigration wird eine validierte Vor-Migrationssicherung erzeugt.
- Strukturierte kritische Fehler verhindern die Snapshot-Erstellung.
- Snapshot-ID und Prüfsumme sind eindeutig; die Hülle und ihre Unterobjekte sind eingefroren.
- Spätere Stammdatenänderungen verändern bestehende Snapshots nicht.
- Manipulierte Snapshotinhalte werden durch die Prüfsumme erkannt.
- Historische Archive behalten ihre Facharrays und werden als `legacy-partial` markiert.
- Der Stromzähler-Dummy bleibt in Normalisierung, Snapshot, Sicherung und Restore erhalten.
- Der Stromzähler-Dummy ist weder in der Berechnungsauswahl noch in Abrechnungssummen enthalten.
- Vollständige Snapshots überstehen Sicherung und Restore mit identischer ID und Prüfsumme.
- Bestehende Mieterwechsel-, Leerstands-, Eigentümer-, Eingabequellen- und Altdatenfälle bleiben semantisch stabil.

## Testumgebung

- Node.js 22
- Playwright 1.61.1
- System-Chromium `/usr/bin/chromium`
- statische lokale App ohne Buildsystem
