# NK-Pro V99.4.41 – AP22F6B Nebenkostenabrechnung Übersicht

## Release
`NK-Pro_V99_4_41_AP22F6B_Nebenkostenabrechnung_Uebersicht.zip`

## Inhalt
Dieses Release migriert ausschließlich **Nebenkosten abrechnen → Übersicht** auf `NK-Pro UI Referenz 1.0`. Die Aktionsspalte verwendet kompakte quadratische Symbolbuttons ohne sichtbare Textbeschriftung und ohne Zeilenumbruch. Fachschema, Statuslogik, Persistenz, Migration, Archivierung, Berechnung sowie Brief-/Drucksystem bleiben unverändert.

## Installation/Start
1. ZIP vollständig in ein neues Verzeichnis entpacken; nicht über eine ältere Arbeitskopie entpacken.
2. Die bisherige lokale NK-Pro-Datensicherung separat aufbewahren.
3. `index.html` über den bisher verwendeten statischen Webserver beziehungsweise das bestehende Deployment öffnen.
4. Bei PWA-/GitHub-Pages-Betrieb sicherstellen, dass `service-worker.js` neu ausgeliefert wird; der Cache heißt `nk-pro-v99-4-41-ap22f6b`.
5. In der zentralen Versionsanzeige muss `V99.4.41` erscheinen.

## Manuelle Browserprüfung
- `Nebenkosten abrechnen → Übersicht` öffnen.
- Prüfen, dass aktuelle und archivierte Abrechnungen in einer kompakten Tabelle erscheinen.
- Suche sowie `Alle`, `Aktuell` und `Archiv` testen.
- Über die Symbolbuttons Bearbeiten, Ansehen, Abschließen/Archivieren und Zur Korrektur öffnen prüfen.
- Mit der Maus über jeden Symbolbutton fahren und vollständige Tooltips kontrollieren.
- Mit Tab durch die Symbolbuttons navigieren und den sichtbaren Fokus prüfen.
- Nur-Ansehen öffnen: große Schreibschutzbox sichtbar, keine Modusangabe in der gelben Kontextleiste.
- Browser auf etwa 620 px und 390 px verengen: Gesamtseite darf nicht horizontal scrollen; nur die Tabelle ist intern scrollbar; die Aktionsbuttons bleiben in einer Zeile.

## Prüfnachweise
- `AP22F6B_UMSETZUNGSBERICHT.md`
- `AP22F6B_TESTBERICHT.md`
- `AP22F6B_ABNAHMEBERICHT.md`
- `AP22F6B_POSITIVLISTENABGLEICH.md`
- `AP22F6B_SCHUTZ_HASH_BERICHT.md`
- `AP22F6B_DATEIAENDERUNGEN.md`
- `AP22F6B_UI_REFERENZ.md`
- `screenshots/AP22F6B/`
- `SHA256SUMS.txt`

## Organisatorischer Hinweis
Einige ältere, geschützte Tests erwarten frühere Versionsnummern, die frühere neunspaltige Übersicht oder die inzwischen verbindlich entfernte Modusangabe. Für V99.4.41 sind die AP22F6B-Prüfungen und der beigefügte Testbericht maßgeblich.
