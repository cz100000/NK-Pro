# Schlanke Arbeitsbasis V99.4.71

Die schlanke Arbeitsbasis V99.4.71 enthält die vollständige lauffähige Offline-PWA, Laufzeitmodule, Assets, Testdaten/Fixtures, automatisierte statische und fachliche Regressionstests, den dependency-freien Chromium/CDP-Browsertest sowie die aktuelle V99.4.71-Projekt- und Analysedokumentation.

Technische Ausgangsbasis war ausschließlich V99.4.70 Korrektur 2. Datenschema 5 bleibt unverändert. Die Analyseengine arbeitet read-only auf dem bestehenden kanonischen Arbeits-/Archivbestand; es gibt keine zweite Analyse-Datenbank. Produktive Abrechnungs-, Archiv-, Teilnehmer-, Zähler-, Persistenz-, Dokument- und Backup/Restore-Logiken bleiben geschützt.

Für den vollständigen V99.4.71-Echtdatenlauf wird der verbindliche Gesamtbestand extern über `NKPRO_REAL_DATA` angegeben; Echtdaten werden nicht in die schlanke Arbeitsbasis eingebettet. Beispiel: `NKPRO_REAL_DATA=/pfad/zum/gesamtbestand.json npm run release:check:v99471`.

Das separat erzeugte schlanke ZIP lässt die Vorher-/Nachher-Screenshotdateien weg; die vollständigen visuellen Nachweise befinden sich im Dokumentationspaket. Die bestehende historische Ausschlussliste `SLIM_PACKAGE_REMOVED_FILES.txt` bleibt als Herkunftsnachweis der übernommenen schlanken Basis erhalten.
