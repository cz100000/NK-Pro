# AP22F11B Korrektur 1 – Testbericht

## Ergebnis

Alle abschließend ausgeführten Prüfungen wurden bestanden.

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax, 56 Einheiten | bestanden |
| Referenzdaten/Fixures, 6 Fälle | bestanden |
| Zählerstandard und Zählerregression | bestanden |
| AP22F11B statische Prüfung | bestanden |
| AP22F11B Korrektur 1 statische Prüfung | bestanden |
| AP22F11B Korrektur 1 Browserprüfung | bestanden |
| AP22F11B vollständige Browserprüfung, 14 Gruppen | bestanden |
| Ausgewählte Architekturregressionen AP8, AP9, AP13, AP21, AP21B2 | bestanden |
| Browser-Laufzeitfehler | 0 |

## Geprüfte Korrekturen

- Suche und Statusfilter überlagern sich weder auf Desktop noch in schmaler Ansicht.
- Zahlen- und Eurospalten sind rechtsbündig und verwenden tabellarische Ziffern.
- Die Vermieter- und Differenzbereiche sind in einer Tabelle zusammengeführt.
- Gruppenüberschriften und Statusfilter bilden offene, bestätigte, akzeptierte, erledigte und ungültige Fälle ab.
- Die bestätigte Vermietersumme wird unter der Tabelle dargestellt.
- Offene und ungültige Prüfungen werden nicht in die bestätigte Vermietersumme eingerechnet.
- Das Inline-Detailfeld ist entfernt.
- Der Detaildialog zeigt die vollständigen Prüf- und Nachweisdaten.
- Der Gesamtabgleich bleibt als eigener Abschnitt sichtbar.
- Akzeptanz, Persistenz, Ungültigwerden und Nur-Ansehen-Modus aus AP22F11B bleiben funktionsfähig.
- Geänderte Ergebnis-Assets werden über die neue Build-ID geladen.

## Browseransichten

Erneut erzeugt und geprüft wurden:

- Desktop 1440 px
- Desktop 1640 px
- Browserzoom 125 %
- schmale Ansicht
- Akzeptanzdialog
- akzeptierte Differenz
- ungültig gewordene Entscheidung
- Nur-Ansehen-/Archivzustand

Zusätzlich wurden zwei Korrektur-Screenshots der zusammengeführten Ansicht und des erweiterten Detaildialogs erstellt.

## Ausführungshinweis

Ein sequentieller Sammellauf der vollständigen Browserprüfung erreichte das äußere Prozesszeitlimit. Der identische Browser-Test wurde anschließend isoliert erneut ausgeführt und bestand vollständig mit 14 von 14 Prüfgruppen.
