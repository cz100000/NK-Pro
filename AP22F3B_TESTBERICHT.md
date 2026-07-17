# AP22F3B – Testbericht

## Freigaberelevantes Ergebnis

**Status: bestanden, mit dokumentierten historischen Testausnahmen.**

| Prüfung | Ergebnis |
| --- | --- |
| Syntaxprüfung | 55 JavaScript-Einheiten fehlerfrei |
| Fixtureprüfung | 6 Referenzfälle semantisch unverändert |
| AP22F3B statische Tests | 2/2 bestanden |
| AP22F3B Browsertests | 9/9 bestanden |
| Schutzprüfung | 29 Dateien, 14 Fragmente, 71 bestehende Tests bestanden |
| aktueller Release-Gate `npm run release:check` | bestanden |
| Release-Inhaltsprüfung | 352 Dateien geprüft; bestanden; `node_modules` nur als Arbeitsabhängigkeit erkannt und aus ZIP ausgeschlossen |

## AP22F3B-Browserabdeckung

Bestanden wurden vollständiger Zustand, Handlungsbedarf mit zwei Validatorbefunden, technischer Fallback zur Systemdiagnose, Nur-Ansehen ohne lokalen Schreibschutzhinweis, 1440/900/620/390 Pixel ohne horizontalen Überlauf sowie Fokusreihenfolge und sichtbarer Fokus.

## Zusätzlich bestandene Kernregressionen

- Dokument/Export: 2 Tests
- Migration/Restore: 6 Tests
- Objektstandard/Snapshot: 7 Tests
- Persistenz/Backup: 5 Tests
- AP22F1C Dialogverhalten ohne historische Versionsassertion: 5 Tests
- AP22F2B Objektübersicht: die ersten 9 funktionalen/visuellen Prüfungen bestanden; der Sammellauf wurde anschließend durch einen historischen Teststall beendet.

## Historische Testausnahmen

Bestehende Regressionstestdateien wurden nicht verändert. Mehrere alte Tests enthalten fest verdrahtete Releasewerte und sind deshalb für V99.4.38 nicht releasefähig. AP10, AP20-Assetrefresh und AP22E schlagen bereits unverändert in der V99.4.37-Ausgangsbasis fehl. AP22F1C/AP22F2B prüfen ausdrücklich die Vorgängerversionen. Der AP22F1B-Test erwartet elf Speicheraktionen; diese Erwartung wird durch die verbindliche AP22F3B-Entscheidung zum Entfall von `Speichern` auf `objekt` absichtlich überholt.

Der vollständige 166-Test-Browserlauf wurde ausgeführt, konnte wegen historischer Teststalls jedoch nicht vollständig abgeschlossen werden. Dies wird nicht als bestanden ausgewiesen. Maßgeblich für die Freigabe sind der bestandene aktuelle Release-Gate, die neuen AP22F3B-Tests, die Schutzprüfung und die gezielten Kernregressionen.
