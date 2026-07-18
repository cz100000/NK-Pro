# AP22F9B – Schutz-Hash-Bericht

## Vor Änderung

Die 17 in `AP22F9A_SCHUTZ_HASHES.json` geführten Ausgangsdateien wurden vor der Umsetzung gegen die technische Ausgangsbasis geprüft: **17/17 bestanden**. Die Einzelwerte stehen in `AP22F9B_SCHUTZ_HASH_BERICHT_VORHER.txt`.

## Nach Änderung

### Vollständig geschützte Dateien

Folgende 13 Dateien sind byte- und hashgleich zur Ausgangsbasis:

- `js/ui-master-data.js`
- `js/cost-actions.js`
- `js/billing-calculation.js`
- `js/application-actions.js`
- `js/billing-context.js`
- `js/ui-page-controller.js`
- `js/persistence.js`
- `js/migration.js`
- `js/backup-recovery.js`
- `js/archive.js`
- `js/document-renderer.js`
- `js/quality-rules.js`
- `js/navigation.js`

### Teilweise positiv gelistete Dateien

- `index.html`: SHA-256 des gesamten Präfixes vor `section#einstellungen` und des gesamten Suffixes ab der folgenden Seite unverändert.
- `assets/app.css`: SHA-256 des vollständigen Ausgangs-CSS bis Byte 322742 unverändert; nur ein nachgelagerter AP22F9B-Block vorhanden.
- `js/ui-costs.js`: SHA-256 des gesamten Bereichs ab `function renderWohnungen()` unverändert.
- `js/ui-bindings.js`: Nach Entfernung der exakt zwei freigegebenen Suchbindungen hashgleich zur Ausgangsbasis.

Automatisches Ergebnis:

`AP22F9B Schutzbereiche: PASS (13 Vollhashes + 5 Teilbereiche)`

Die vollständigen Vorher-/Nachher-Werte stehen in `AP22F9B_SCHUTZ_HASH_BERICHT_NACHHER.txt`.

## Ergebnis

**Schutz-Hash-Abgleich vollständig bestanden.** Es gibt keine unerwartete Änderung an Fachlogik, Persistenz, Migration, Backup/Restore, Archivierung, Qualitätsregeln, Brief/Druck, Navigation, Seitenkopf oder Kontextleiste.
