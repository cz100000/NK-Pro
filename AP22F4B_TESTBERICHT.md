# AP22F4B – Testbericht

## Gesamturteil
**BESTANDEN.** Die neuen AP22F4B-Prüfungen sowie die für die geänderte Seite und ihre unmittelbaren Nachbarbereiche maßgeblichen Regressionen sind erfolgreich.

## Erfolgreiche Prüfungen
| Prüfung | Ergebnis | Umfang |
|---|---|---|
| AP22F4B statisch | PASS | Seitenstruktur, Tabellenfelder, bestehende Schreibpfade, UNIT_*-Befunde, Tokenverwendung, weißer Tabelleninnenrand, vollbreite Tabelle, UI-Referenz und Releasekennung |
| Schutzbereiche | PASS | 13 geschützte Gesamtdateien und 74 bestehende Regressionstestdateien |
| AP22F4B Browser | PASS | vollständig, weißer Tabelleninnenrand bei 1648 px, Handlungsbedarf, Nur ansehen, 620 px, 390 px, 200-%-Äquivalent |
| Bearbeiten/Speichern | PASS | alle fünf vorhandenen Feldtypen und bestehender globaler Speicherweg |
| Suche/Statusfilter | PASS | Ergebnisfilterung ohne Mutation des Wohnungsbestands |
| Fokus/Tastatur | PASS | Suchfeld und Zeilenaktion mit sichtbarem Fokus |
| Dokumentfluss | PASS | Handlungsbedarf, Systemfeld und Schreibschutz ohne Überlagerung; automatische Höhe |
| JavaScript-Syntax | PASS | 55 Einheiten |
| Referenzdaten | PASS | 6 Fälle semantisch unverändert |
| Zählerregression | PASS | Zählerstandard, Startregression und Dezimalberechnung |
| Architekturregression | PASS | AP6, AP7, AP8, AP9, AP13, AP21 und AP21B2 |
| AP21C | PASS | Struktur und Kompatibilität |
| Objektdaten AP22F3B | PASS | 9/9 Browserprüfungen |
| Objektübersicht AP22F2B | PASS | Prioritäten, Aktionen, Fokus, Responsive bis 390 px, Zoomäquivalent und Dialogausblendung |
| ZIP-/Inhaltsrichtlinie | PASS | keine generierten Testverzeichnisse und keine installierten Abhängigkeiten im Release |

## AP22F4B-Browserabdeckung
- sieben vorhandene Wohnungen im Standardfall
- Wohnungs-ID rein lesend
- fünf bestehende Pflegefelder veränderbar
- Dezimalkomma bei Wohnfläche wird über den bestehenden Zahlenweg verarbeitet
- globales Speichern aktualisiert den bestehenden lokalen Speicher
- Suche und Statusfilter verändern keine Fachdaten
- Statusfilter verwendet ausschließlich vorhandene wohnungsbezogene Objektstandardbefunde
- Aktionsspalte im Bearbeitungsmodus fokussierbar; im Nur-Ansehen-Modus deaktiviert
- kein Modusfeld in der Kontextleiste
- sichtbarer weißer Tabelleninnenrand und vollbreite Tabelle bei 1440 px und 1648 px
- kein horizontaler Dokumentüberlauf bei 620 px und 390 px
- interner Tabellenüberlauf auf schmalen Ansichten
- mehrzeilige Hinweise und 200-%-Äquivalent ohne Abschneiden oder Überlagerung

## Korrekturregression
Der gemeldete Desktopfall ist durch berechnete Mindestabstände an allen vier Seiten der Tabellenhülle, weiße Hintergrundfarbe, vollständige Nutzung der verfügbaren Inhaltsbreite und den Screenshot `05_desktop_weisser_innenrand.png` abgesichert.

## Historische Testhinweise
Einige unverändert geschützte ältere Tests sind auf die damalige Releaseversion fest verdrahtet. Dazu gehören insbesondere AP22E (`99.4.33`) und der bisherige AP22F3B-Release-Gate (`99.4.38`). Einzelne ältere AP22F1A-Prüfungen erwarten außerdem eine inzwischen planmäßig entfallene Aktion auf der Seite `objekt` oder einen früheren Titel der UI-Referenz. Diese historischen Assertions wurden nicht verändert und nicht als V99.4.39-Release-Gate gewertet.

## Verbleibendes Test-/Betriebsrisiko
Das unverändert belassene npm-Skript `test:release` verweist weiterhin auf den historischen AP22F3B-Release-Test. Ein pauschales `npm test` enthält daher eine erwartete Altversionsabweichung, obwohl die aktuellen AP22F4B-Prüfungen bestanden sind. Die Produktfunktion ist davon nicht betroffen.
