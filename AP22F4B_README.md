# NK-Pro V99.4.39 – AP22F4B Wohnungen

## Release
`NK-Pro_V99_4_39_AP22F4B_Wohnungen.zip`

## Inhalt
Dieses Release migriert ausschließlich die Seite **Objekt vorbereiten → Wohnungen** auf den verbindlichen Tabellen- und Seitenstandard `NK-Pro UI Referenz 1.0`. Fachschema, Objektstandard, Persistenz, Migration, Backup, Archiv und Abrechnungssnapshot bleiben unverändert.

## Start
1. ZIP vollständig in ein neues Verzeichnis entpacken.
2. `index.html` über den bisher verwendeten statischen Webserver beziehungsweise das bestehende Deployment öffnen.
3. Bei PWA-/GitHub-Pages-Betrieb sicherstellen, dass die neue Service-Worker-Datei ausgeliefert wird; der neue Cache heißt `nk-pro-v99-4-39-ap22f4b`.
4. Im Seitenfuß beziehungsweise in der zentralen Versionsanzeige muss `V99.4.39` erscheinen.

## Manuelle Sichtprüfung
- Seite `Objekt vorbereiten → Wohnungen` öffnen.
- Suche, Filter und Aktionsspalte prüfen.
- Auf einer breiten Desktopansicht prüfen, dass die Tabelle die Kartenbreite nutzt und rundum ein weißer Innenabstand sichtbar bleibt.
- Eine vorhandene Wohnung ändern und über die bestehende globale Speicheraktion speichern.
- Nur-Ansehen-Kontext öffnen und prüfen, dass Eingaben und Speichern deaktiviert sind.
- Schmale Browserbreite prüfen: Die Tabelle scrollt intern, die Gesamtseite nicht horizontal.

## Prüfnachweise
- `AP22F4B_UMSETZUNGSBERICHT.md`
- `AP22F4B_TESTBERICHT.md`
- `AP22F4B_ABNAHMEKATALOG.md`
- `AP22F4B_POSITIVLISTENABGLEICH.md`
- `AP22F4B_SCHUTZ_HASH_BERICHT.md`
- `AP22F4B_DATEIAENDERUNGEN.md`
- `AP22F4B_UI_REFERENZ.md`
- `AP22F4B_KORREKTUR_1.md`
- `SHA256SUMS.txt`

## Bekannter organisatorischer Hinweis
Das historische npm-Skript `test:release` verweist weiterhin auf den geschützten AP22F3B-Test mit der früheren Versionsannahme. Für V99.4.39 sind die separaten AP22F4B-Tests und der beigefügte Testbericht maßgeblich.
