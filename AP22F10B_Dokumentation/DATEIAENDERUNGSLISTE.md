# AP22F10B – Dateiänderungsliste

Vergleichsbasis ist die unverändert entpackte technische Ausgangsbasis V99.4.44.

## Geänderte Produktdateien

| Datei | Umfang |
|---|---|
| `index.html` | ausschließlich DOM-Inhalt von `#manuellewerte` sowie lokale Release-Markierung |
| `assets/app.css` | neuer, vollständig auf `#manuellewerte` begrenzter AP22F10B-CSS-Block |
| `js/ui-individual-values.js` | Rendering, Dialoge, Filter, Import, Fokus, Schreibschutz und Status |
| `js/ui-metering.js` | operative Messwert-/Messperiodenadapter und Legacy-Synchronisation |
| `js/billing-calculation.js` | Fallprojektion, Wasserzeilen, Summen und Abgleiche |
| `js/billing-workflow.js` | zentrale Writes, `caseValues`, Import und Reset |
| `js/meter-master.js` | stabile Kalt-/Warmwasserzähler für aktive Fälle ohne künstliche Mieter |
| `js/year-transition-actions.js` | bestätigte zähler-ID-basierte Vorjahresübernahme und Audit |
| `js/quality-rules.js` | neue getrennte Regel `NKP-PLAU-012` |
| `js/app-runtime-config.js` | Releaseversion und Changelog |
| `js/service-worker-register.js` | PWA-Build-ID |
| `service-worker.js` | Cache-/Build-ID |
| `manifest.webmanifest` | Version, Build-ID und Beschreibung |
| `nk-pro-project.json` | Release- und Projektmetadaten |
| `package.json` | Version und AP22F10B-Testskripte |
| `package-lock.json` | konsistente Paketversion |

## Neue Tests

- `tests/ap22f10b-individual-values.test.cjs`
- `tests/ap22f10b-individual-values-browser.test.cjs`
- `tests/ap22f10b-protected-areas.test.cjs`
- `tests/ap22f10b-release.test.cjs`

## Neue Browser-Sichtnachweise

17 PNG-Dateien unter `AP22F10B_Screenshots/`, entsprechend der verbindlichen Liste von Desktop-Bearbeitung bis 390-px-Ansicht.

## Neue Release-Dokumentation

Alle Dateien unter `AP22F10B_Dokumentation/` einschließlich kuratierter erfolgreicher Prüfprotokolle und Inhaltsmanifest.

## Nicht geändert

Keine Änderungen an Persistenz, Migration, Backup/Restore/Rollback, Archiv/Snapshot, Navigation, Abrechnungskontext, Brief-/Dokument-/Drucksystem oder anderen produktiven Seiten außerhalb der explizit freigegebenen Leseschnittstellen.
