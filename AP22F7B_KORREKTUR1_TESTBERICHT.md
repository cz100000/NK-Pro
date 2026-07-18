# AP22F7B Korrektur 1 – Testbericht

## Ergebnis

Die Korrektur ist technisch und visuell bestanden.

## Bestandene Prüfungen

- `release:check`: 55 JavaScript-Einheiten, 6 Referenzdatenfälle, AP22F7B-Struktur, 435 geschützte Dateien, 13 geschützte Bereiche, Zählerregressionen, Architektur und Release-Inhaltsprüfung;
- AP22F7B Korrektur-Statiktest;
- AP22F7B Korrektur-Chromiumtest mit Stil-, DOM-, Sortier-, Fokus- und Overflow-Prüfung;
- ursprünglicher AP22F7B-Chromiumtest;
- AP22F6B Übersicht und AP22F6B Korrektur 1;
- AP22F5B Seiten und AP22F5B Korrektur 1;
- 2 Dokument-/CSV-Exporttests;
- 6 Migration-/Restore-/Rollbacktests;
- 5 Persistenz-, Backup- und Wiederbearbeitungstests;
- 8 Brief- und Drucktests;
- 3 zentrale Navigationstests.

## Geprüfte Korrekturmerkmale

- exakt eine Kopfzeile je Tabelle;
- Kopfzellenhintergrund entspricht `--nk-ui-color-surface-muted`;
- Kopfzellentext entspricht `--nk-ui-color-text`;
- Sortierbuttons ohne Hintergrund, Rahmen oder Schatten;
- kein zusätzliches `th::after`-Sortiersymbol;
- keine generischen `sortable`-Klassen oder konkurrierenden `onclick`-Handler;
- Sortierung auf- und absteigend;
- sichtbarer Tastaturfokus;
- kein horizontaler Seitenüberlauf bei Desktop und 620 px.

## Historischer Testhinweis

Der alte `service-worker.spec.js` ist auf die Bezeichnung V99.4.24 und querylose Assetpfade fest verdrahtet. Er bildet den aktuellen Cache-Busting-Vertrag nicht ab und wurde daher nicht als Abnahmekriterium gewertet. Die aktuelle Service-Worker-Syntax, Build-ID, Cachekennung und Release-Inhaltsprüfung sind bestanden.
