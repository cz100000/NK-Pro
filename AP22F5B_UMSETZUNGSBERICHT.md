# AP22F5B – Umsetzungsbericht einschließlich Korrektur 1

## Ergebnis
Die technische Migration der Seiten **Zähler** (`wasser`) und **Mietverhältnisse** (`mieterverwaltung`) liegt als Release **V99.4.40 Korrektur 1** vor. Die Zählerseite bleibt ein nicht produktiver DUMMY. Die Mietverhältnisse-Seite wurde nach der Sichtprüfung zusätzlich auf eine kompakte Übersicht mit gemeinsamer Archivansicht korrigiert.

## Zähler-DUMMY
- genau fünf Karten für Wasser, Wärme, HKV, Gas und Strom
- zentrale farbige SVG-Linienicons
- statische DUMMY-Tabelle mit Suche und Zählerartfilter als reine DOM-Filter
- keine produktive Aktion, Speicherung, Datenmutation oder Abrechnungswirkung
- eindeutige DUMMY-Kennzeichnung und interner Tabellen-Scroll

## Mietverhältnisse – Korrektur 1
- vier bestandsbasierte Kennzahlen: Gesamt, Aktiv, Nicht aktiv und Archiviert
- kompakte Haupttabelle mit sechs Spalten statt dauerhaft sichtbarer Formularmatrix
- jeweils höchstens ein aufgeklappter Detailbereich
- alle zwölf vorhandenen Pflegefelder im Detailbereich erhalten: Name, Wohnung, Einzug, Auszug, Straße, PLZ, Ort, Telefon, E-Mail, Rolle, Anrede und Briefanrede
- bestehende Datenpflege weiterhin über `setMasterNested` und die globale Speicheraktion
- gemeinsamer Umschalter `Aktiv / Archiv` in derselben Tabellenkarte
- Archivansicht mit sieben kompakten Spalten, lesendem Detailbereich und bestehender Reaktivierungsaktion
- keine Eingabe- oder Auswahlfelder in Archivzeilen oder Archivdetails
- Suche und Wohnungsfilter in beiden Ansichten; Statusfilter und Neuanlage ausschließlich in der aktiven Ansicht
- vollständiger Nur-Ansehen-Modus: Details bleiben lesbar, alle Eingaben sowie Archivieren, Reaktivieren, Neuanlage und Speichern sind gesperrt
- Hinweise im normalen Dokumentfluss und interner Tabellen-Scroll ohne horizontalen Seitenüberlauf

## Fachliche Abgrenzung
Es wurden keine neuen Datenfelder, Fachregeln, Statuswerte, Berechnungen, Persistenzwege oder Migrationen eingeführt. Navigation, Zählerfachmodule, Objektstandard, Abrechnungssnapshot, Persistenz, Backup/Restore, Qualitätsregeln, Brief, Druck und PDF bleiben unverändert.

## UI-Referenz
Die nicht produktiv eingebundene UI-Referenz zeigt nun die kompakte aktive Übersicht, den aufklappbaren Bearbeitungsbereich sowie die gemeinsame schreibgeschützte Archivansicht.
