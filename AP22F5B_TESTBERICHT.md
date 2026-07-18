# AP22F5B – Testbericht

## Gesamturteil
**BESTANDEN.** Die technische Migration der Seiten **Zähler** und **Mietverhältnisse** ist für Release **V99.4.40** freigabefähig.

## AP22F5B-Struktur- und Schutzprüfung
- AP22F5B-Strukturtest: **PASS**
- 17 geschützte Produktdateien: **unverändert**
- 77 bestehende Regressionstestdateien: **unverändert**
- insgesamt 94 Schutz-Hashes: **bestanden**
- Zähler-DUMMY ohne produktive Aktionen, Datenmutation oder Speicherung: **bestanden**
- Mietverhältnisse mit zwölf bestehenden Pflegefeldern und unveränderten Schreibwegen: **bestanden**

## Browserprüfung
- Zähler Desktop: fünf Karten, zentrale farbige SVG-Linienicons, Suche und Filter, normaler Dokumentfluss: **PASS**
- Zähler 390 px: kein horizontaler Seitenüberlauf; Tabellen-Scroll intern: **PASS**
- Mietverhältnisse Desktop: Kennzahlen, Suche, Filter, Bearbeitung, Speichern, Archivieren und Reaktivieren: **PASS**
- Mietverhältnisse 390 px: kein horizontaler Seitenüberlauf; Tabellen-Scroll intern: **PASS**
- Mietverhältnisse Nur ansehen: Schreibschutzhinweis sichtbar, alle Schreibaktionen gesperrt, Suche und Filter weiterhin nutzbar und ohne Datenmutation: **PASS**
- weiße Tabelleninnenränder und Hinweise ohne Überlagerung: **PASS**

## Kernregression
- JavaScript-Syntax: **55 Einheiten fehlerfrei**
- Referenzdaten: **6 logische Fälle semantisch unverändert**
- Zählerstandard, Zählerstart und Zählerberechnung: **PASS**
- Architekturregression AP6/AP7/AP8/AP9/AP13/AP21/AP21B2: **PASS**
- AP21C Individuelle Werte: **PASS**
- AP22F4B Wohnungen gegen V99.4.40: **statische und browserbasierte Regression PASS**, einschließlich weißem Tabelleninnenrand, Schreibschutz, 620 px, 390 px und 200-%-Äquivalent
- Release-Inhaltsprüfung: **PASS**

## Historische Tests
Einzelne geschützte AP22F3B-/AP22F4B-Tests enthalten fest codierte frühere Releasekennungen. Diese historischen Dateien bleiben bytegleich geschützt. Ihre fachlichen und visuellen Prüfungen wurden mit ausschließlich auf V99.4.40 angepasster temporärer Versionsannahme erneut ausgeführt und bestanden; die temporären Dateien sind nicht Bestandteil des Releases.

## Verbleibende Risiken
- Die Seite Zähler bleibt absichtlich ein DUMMY mit fiktiven Beispieldaten und ohne Speicherung.
- Die breite Mietverhältnistabelle benötigt aufgrund der zwölf erhaltenen Pflegefelder einen internen horizontalen Scroll. Die Gesamtseite läuft nicht horizontal über.
- Änderungen an Auswahl oder Bedeutung der Kennzahlenkarten sind später möglich, sofern ausschließlich vorhandene Daten verwendet werden; neue Fachregeln benötigen eine gesonderte Planung.
