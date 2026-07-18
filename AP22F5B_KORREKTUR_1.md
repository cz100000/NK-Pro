# AP22F5B – Korrektur 1: kompakte Mietverhältnisse und gemeinsame Archivansicht

## Anlass
Die erste technische Fassung von AP22F5B zeigte alle zwölf Pflegefelder dauerhaft in jeder Tabellenzeile. Dadurch entstanden hohe Formularzeilen, mehrere übereinanderliegende Auswahlfelder und ein schwer erfassbarer horizontaler Arbeitsbereich. Zusätzlich verwendete die Mieterarchivansicht noch ein abweichendes Tabellenmuster.

## Verbindliche Korrektur
- Die Hauptansicht zeigt kompakte Zusammenfassungszeilen mit Mieter, Wohnung, Mietzeitraum, Rolle, Status und Aktionen.
- Eingabe- und Auswahlfelder erscheinen erst nach dem Öffnen genau eines Detailbereichs.
- Alle zwölf vorhandenen Pflegefelder bleiben vollständig erhalten.
- Aktive Mietverhältnisse und Archiv verwenden dieselbe Tabellenkarte mit dem Umschalter `Aktiv / Archiv`.
- Archivdatensätze sind in Tabelle und Detailbereich schreibgeschützt.
- Die vorhandene Reaktivierungsfunktion bleibt erhalten.
- Suche und Wohnungsfilter gelten für beide Ansichten; der Statusfilter und die Neuanlage werden im Archiv ausgeblendet.
- Im Nur-Ansehen-Modus bleiben Suche, Filter und Detailansicht verfügbar, während sämtliche schreibenden Aktionen gesperrt sind.

## Fachliche Abgrenzung
Es wurden keine Datenfelder, Statuswerte, Berechnungen, Fachregeln, Speicherwege oder Migrationen ergänzt. Die vorhandenen zentralen Aktionen für Bearbeitung, Speicherung, Archivierung und Reaktivierung werden weiterverwendet. Die Zähler-DUMMY-Seite, Navigation, Persistenz, Abrechnung, Dokumentausgabe und Qualitätslogik wurden nicht verändert.

## Release
- Produktversion: **V99.4.40**
- Korrekturpaket: `NK-Pro_V99_4_40_AP22F5B_Zaehler_und_Mietverhaeltnisse_Korrektur1.zip`
- Korrekturdatum: **18.07.2026**
