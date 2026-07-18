# NK-Pro V99.4.40 – AP22F5B Korrektur 1

## Releasepaket
`NK-Pro_V99_4_40_AP22F5B_Zaehler_und_Mietverhaeltnisse_Korrektur1.zip`

## Inhalt
- unveränderter Zähler-DUMMY nach NK-Pro UI Referenz 1.0
- kompakte aktive Mietverhältnistabelle
- aufklappbarer Bearbeitungsbereich mit allen zwölf bestehenden Feldern
- gemeinsame Tabellenkarte mit Umschalter `Aktiv / Archiv`
- schreibgeschützte Archivdetails und bestehende Reaktivierungsaktion
- aktualisierte UI-Referenz, vier Screenshots und Korrekturtests
- Schutz-, Positivlisten-, Test- und Abnahmenachweise

## Installation
1. ZIP vollständig in ein neues Verzeichnis entpacken.
2. Den bisherigen V99.4.40-Dateibestand durch den Inhalt dieses Korrekturpakets ersetzen.
3. Dateien in das NK-Pro-Repository übernehmen und GitHub Pages aktualisieren.
4. Browser anschließend mit `Strg + F5` neu laden.
5. In der Navigation muss weiterhin `V99.4.40` erscheinen.

## Lokale Korrekturprüfung
```text
npm ci
npm run test:ap22f5b
```

## Manuelle Sichtprüfung
- aktive Tabelle zeigt kompakte Zeilen ohne dauerhafte Formularfelder
- Bearbeiten öffnet genau einen Detailbereich mit zwölf vorhandenen Pflegefeldern
- Umschalter zeigt Aktiv und Archiv in derselben Tabellenkarte
- Archivdetails sind lesend; Reaktivieren bleibt verfügbar
- Nur-Ansehen-Modus sperrt Schreibaktionen, lässt Details und Filter aber nutzbar
- schmale Ansicht verursacht keinen horizontalen Überlauf der Gesamtseite
