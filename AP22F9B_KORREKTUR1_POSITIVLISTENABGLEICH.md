# AP22F9B Korrektur 1 – Positivlistenabgleich

## Freigegebene Seitenbereiche

- `index.html`: Änderung ausschließlich innerhalb der Seite `#einstellungen`.
- `assets/app.css`: Änderung ausschließlich in AP22F9B-seitenbezogenen `#einstellungen`-Selektoren.
- `js/ui-costs.js`: Änderung ausschließlich im lokalen UI-Zustand und Renderer der Gesamtkostenseite.
- AP22F9B-Tests, Screenshots und Abschlussdokumente.

## Release-Metadaten

Die PWA-Build-ID wurde für die Korrekturauslieferung in `service-worker.js`, `js/service-worker-register.js`, `manifest.webmanifest` und `nk-pro-project.json` aktualisiert. Es wurden dort keine Fach-, Daten- oder Speicherwege verändert.

## Ergebnis

Der automatisierte AP22F9B-Schutztest wurde bestanden:

- 13 vollständig geschützte Datei-Hashes unverändert
- 5 geschützte Teilbereiche unverändert
- keine Änderung an Datenschema 5
- keine Änderung an Navigation, Seitenkopf oder Kontextleiste
- keine Änderung an Fachlogik, Berechnung, Persistenz, Migration, Archiv, Brief oder Druck
