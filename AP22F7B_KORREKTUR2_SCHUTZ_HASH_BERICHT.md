# AP22F7B Korrektur 2 – Schutz-Hash-Bericht

## Ausgangsbasis

`NK-Pro_V99_4_42_AP22F7B_Mietverhaeltnisse_Abrechnung_Korrektur1.zip`

## Ergebnis

- Dateien in der Ausgangsbasis: **472**
- byteidentisch gebliebene Ausgangsdateien: **457**
- direkt durch SHA-256 geprüfte geschützte Dateien: **457**
- entfernte Ausgangsdateien: **0**
- `assets/app.css`: vollständige Rücknormalisierung auf den Ausgangshash erfolgreich; dadurch sind ausschließlich der freigegebene Kommentar, der Grid-Track und die zentrale Breitenregel verändert.

## Besonders geschützte Systeme

Byteidentisch geblieben sind insbesondere:

- `index.html` und Navigation;
- Datenmodell und Datenschema;
- Persistenz, Backup und Restore;
- Migration und Rollback;
- Archivierung und Abrechnungssnapshot;
- Abrechnungsberechnung und Qualitätsregeln;
- Brief-, Druck- und Exportsystem;
- sämtliche produktiven JavaScript-Fachmodule.

Ergebnis: **bestanden**.
