# AP22F5B Korrektur 1 – Testbericht

## Gesamturteil
**BESTANDEN.** Die kompakte Mietverhältnisse-Übersicht und die gemeinsame Archivansicht sind für das Korrekturpaket von Release **V99.4.40** freigabefähig.

## Korrekturspezifische Strukturprüfung
- genau zwei Ansichten im Umschalter `Aktiv / Archiv`: **PASS**
- separate Legacy-Archivtabelle vollständig entfernt: **PASS**
- aktive Kompaktzeilen ohne Eingabe- oder Auswahlfelder: **PASS**
- alle zwölf bestehenden Pflegefelder im aufklappbaren Detailbereich: **PASS**
- Archivansicht und Archivdetail vollständig ohne Eingabe- oder Auswahlfelder: **PASS**
- bestehende Archivierungs- und Reaktivierungsaktionen erhalten: **PASS**
- Nur-Ansehen-Schutz und zentrale Speicherwege erhalten: **PASS**
- 94 Schutz-Hashes aus AP22F5B unverändert: **PASS**

## Browserprüfung
- Zähler-DUMMY: fünf Karten, keine produktive Aktion und keine Zustandsmutation durch Suche/Reset: **PASS**
- aktive Mietverhältnisse: fünf kompakte Zeilen, Detail öffnen/schließen und genau zwölf Pflegefelder: **PASS**
- bestehender Schreibweg: Änderung eines Namens aktualisiert den vorhandenen Stammdatenpfad: **PASS**
- Archivieren, Umschalten in die Archivansicht, lesendes Archivdetail und Reaktivieren: **PASS**
- Statusfilter und Neuanlage im Archiv ausgeblendet: **PASS**
- Nur-Ansehen-Modus: Details aufklappbar, sämtliche Eingaben und schreibenden Aktionen gesperrt: **PASS**
- 390-Pixel-Ansicht ohne horizontalen Überlauf der Gesamtseite: **PASS**
- vier Zielzustands-Screenshots erzeugt: **PASS**

## Kernregression
- JavaScript-Syntax: **55 Einheiten fehlerfrei**
- Referenzdaten: **6 logische Fälle semantisch unverändert**
- Zählerdomäne einschließlich Dummy-Ausschluss: **PASS**
- AP21C Individuelle Werte: **PASS**
- Architekturprüfungen AP6, AP7, AP8 und AP9: **PASS**

## Historische Testgrenzen
Ältere Schutz- und Browsertests einzelner AP22F-Vorgänger enthalten fest codierte Hashes oder frühere Versionskennungen. Sie sind nach späteren freigegebenen Seitenmigrationen nicht als aktuelle Releaseprüfung verwendbar. Maßgeblich für diese Korrektur sind die AP22F5B-Schutzliste und die korrigierten AP22F5B-Tests; ältere Testdateien wurden nicht umgeschrieben.

## Verbleibende Risiken
- Die Zählerseite bleibt absichtlich ein DUMMY.
- Auf sehr schmalen Ansichten benötigt die Tabelle weiterhin internen horizontalen Scroll; die Gesamtseite läuft nicht horizontal über.
- Der aufgeklappte Detailbereich liegt innerhalb der Tabellenhülle. Dies erhält den direkten Zeilenbezug, setzt auf sehr kleinen Displays jedoch horizontales Verschieben innerhalb der Karte voraus.
