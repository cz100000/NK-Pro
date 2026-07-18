# AP22F6B – Testbericht

## Gesamturteil
**BESTANDEN.** Die neuen AP22F6B-Prüfungen und die maßgeblichen Regressionen bestehen.

## Erfolgreiche Prüfungen
| Prüfung | Ergebnis | Umfang |
|---|---|---|
| AP22F6B statisch | PASS | Struktur, Semantik, sieben Spalten, Suche/Filter, Icon-only-Aktionen, Handlerbindung, Datenschema 5, keine neue Abhängigkeit |
| Schutzbereiche | PASS | 392 vollständig geschützte Dateien und 25 Bereichshashes |
| AP22F6B Browser | PASS | Bearbeiten, Ansehen, Abschließen blockiert/Statuslogik, Archivieren, Archiv aktualisieren, Korrektur, Schließen, letzter Arbeitsschritt, Suche/Filter, Fokus, Schreibschutz, Leer-/Fehlerzustände |
| Responsive | PASS | Desktop, 620 px, 390 px und Zoomäquivalent; kein Dokumentüberlauf; nur interne Tabellenhülle scrollt |
| Release-Check | PASS | 55 JS-Einheiten, 6 Fixtures, Architektur, Zähler, AP21C und ZIP-Inhaltsrichtlinie |
| Zähler/Mietverhältnisse | PASS | AP22F5B-Korrektur-1-Browsertest |
| Dokument/CSV und Migration | PASS | 8/8 Browserprüfungen |
| Persistenz/Backup/Wiederbearbeitung und Brief/Druck | PASS | 13/13 Browserprüfungen |
| Objektdaten | PASS | 9/9 Browserprüfungen einschließlich Responsive und Fokus |
| Qualitätscockpit | PASS | 4/4 fachlich relevante Browserprüfungen |

## Browserabdeckung der Zielseite
- geschlossener Kontext und geöffneter Bearbeitungs-/Ansichtskontext
- keine Modusangabe in der Kontextleiste
- große Schreibschutz-Notice ohne Überlagerung
- direkte Sichtbarkeit und Reihenfolge aller statusabhängigen Aktionen
- vollständige Tooltips, `aria-label` und `aria-hidden`-SVGs
- sichtbarer Tastaturfokus
- Suche, Filter, Ergebniszählung und Rücksetzen ohne Mutation der Fachdaten
- finalisierter aktueller Datensatz mit ausschließlich Bearbeiten, Ansehen und Archiv aktualisieren
- aktueller und archivierter Kontext, Korrekturweg und letzter Arbeitsschritt
- Leerzustand, keine Treffer und erzwungener Renderfehler im Dokumentfluss

## Historische Testhinweise
Einige unverändert geschützte ältere Tests enthalten feste Annahmen früherer Releases oder die planmäßig entfallene Modusanzeige. Der AP22F5B-Statiktest erwartet `V99.4.40`; ein AP20-Test erwartet `[data-global-billing-mode]`; ältere AP19/App-Smoke-Tests erwarten die frühere neunspaltige Startseite. Diese Assertions wurden nicht verändert. Die entsprechenden aktuellen Funktionen werden durch die AP22F6B-Testgruppe und die bestandenen Schutz-/Regressionsprüfungen abgedeckt.

## Restpunkte
Keine bekannten funktionalen Restpunkte. Der einzige organisatorische Hinweis sind die genannten historischen Altversions-/Altstrukturassertionen in geschützten Tests.
