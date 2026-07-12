# Referenzdaten

Die Referenzfälle werden aus genau einer vollständigen Basis und kleinen, nachvollziehbaren Patches aufgebaut.

- `basis/standardfall.json`: unveränderliche gemeinsame Basis
- `faelle/*.patch.json`: ausschließlich die Abweichungen des jeweiligen Falls
- `fixture-manifest.json`: logische Dateinamen, Prüfsummen und Patchzuordnung

Die Tests verwenden weiterhin die logischen Namen `standardfall.json`, `mieterwechsel.json`, `leerstand.json`, `eigentuemer-m000.json`, `alle-eingabequellen.json` und `altdaten-migration.json`.

Prüfung: `npm run test:fixtures`

Materialisierung vollständiger Dateien für eine externe Sichtprüfung: `npm run fixtures:materialize`
