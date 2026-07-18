# AP22F8B – Schutz-Hash-Bericht

## Ergebnis

**Bestanden.**

- 499 vollständig geschützte Dateien: Größe und SHA-256 unverändert
- 9 geschützte Teilbereiche: SHA-256 unverändert
- `index.html`: Präfix und Suffix außerhalb `section#einnahmen` unverändert
- `assets/app.css`: geschützter Präfix von 313.904 Byte unverändert
- `js/ui-costs.js`: Präfix vor dem AP22F8B-UI-Bereich und Suffix ab `renderKosten()` unverändert
- `js/ui-page-controller.js`: alle Konfigurationen außerhalb `einnahmen` unverändert
- `js/ui-bindings.js`: alle Controller außerhalb des vorhandenen `cost`-Controllers unverändert

Navigation, Fachmodule, Datenmodell, Persistenz, Migration, Archivierung, Berechnung, Brief und Druck blieben hashgeschützt unangetastet.
