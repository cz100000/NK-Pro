# AP22F1B – Bestätigte Datei-Positivliste

## Produktive Dateien

| Datei | Freigabe | Tatsächlicher Stand |
|---|---|---|
| `index.html` | ja | geändert: 14 statische Speicherstatus, sechs lokale Kopf-Metablöcke und drei allgemeine Kopf-Speicheraktionen entfernt; Releasekennung aktualisiert |
| `js/ui-page-controller.js` | ja | geändert: ausschließlich statische Aktualisierung von `[data-page-save-status]` entfernt |
| `js/ui-individual-values.js` | eng begrenzt | geändert: ausschließlich `application.save` aus `manualBody()` entfernt |
| `assets/app.css` | nur bei technischer Notwendigkeit | nicht geändert; nach Entfernung der Elemente war keine CSS-Korrektur erforderlich |

## Referenzbibliothek

| Datei | Tatsächlicher Stand |
|---|---|
| `ui-reference/index.html` | geändert: AP22F1B-Regel und beide Seitenkopfvarianten ergänzt |
| `ui-reference/reference.css` | nicht geändert; keine neue Darstellungsregel erforderlich |

## Neue Tests

- `tests/ap22f1b-page-header-cleanup.test.cjs`
- `tests/ap22f1b-action-redundancy.test.cjs`
- `tests/ap22f1b-protected-areas.test.cjs`
- `tests/ap22f1b-page-header-cleanup.spec.js`

## Testintegration

- `playwright.config.cjs`
- `package.json`
- `package-lock.json`

## Neue AP22F1B-Dokumente

- `AP22F1B_DATEIPOSITIVLISTE.md`
- `AP22F1B_ENTSCHEIDUNGEN.md`
- `AP22F1B_DATEIAENDERUNGEN.md`
- `AP22F1B_ABSCHLUSS.md`
- `AP22F1B_PRUEFBERICHT.md`

## Aktualisierte Vertrags-, Projekt- und Release-Dokumente

- `UI_UX_DESIGNVERTRAG.md`
- `UI_UX_ZIELBILD.md`
- `UI_UX_SEITENANATOMIE.md`
- `UI_UX_KOMPONENTENREGELN.md`
- `UI_UX_ABNAHMEKATALOG.md`
- `UI_KOMPONENTENKATALOG.md`
- `UI_ARCHITEKTUR_AKTUELL.md`
- `UI_MIGRATIONSMATRIX.md`
- `TESTING.md`
- `NK-PRO-PROJEKTSTAND.md`
- `CHANGELOG.md`
- `RELEASE_NOTES.md`

## Reine Release- und Integritätsdateien

- `js/app-runtime-config.js`
- `js/service-worker-register.js`
- `nk-pro-project.json`
- `manifest.webmanifest`
- `service-worker.js`
- `SHA256SUMS.txt`

Es wurde keine Datei außerhalb dieser Positivliste geändert. Bestehende Regressionstestdateien wurden nicht verändert.
