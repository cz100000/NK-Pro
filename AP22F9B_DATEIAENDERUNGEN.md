# AP22F9B – Dateiänderungen

## Geänderte produktive Seitenbereiche

| Datei | Exakter Zweck |
|---|---|
| `index.html` | Ausschließlich `section#einstellungen` einschließlich `costPriceModal` und `costSelectionModal`: vier Kacheln, drei flache Arbeitsbereiche, Suchfeld, Tabellenhüllen und Zustandscontainer. Alle Bereiche davor und danach sind hashgleich. |
| `assets/app.css` | Ausschließlich angehängter, mit `#einstellungen` präfixierter AP22F9B-Stilblock für Kacheln, Tabellen, Toolbar, Fokus und Responsive-Verhalten. Der komplette Ausgangs-CSS-Präfix ist hashgleich. |
| `js/ui-costs.js` | Gesamtkostenrenderer, Kachelanbindung, lokale Suche und lokale Datumsdarstellung. Der nachfolgende Rendererbereich ab `renderWohnungen()` ist hashgleich. |
| `js/ui-bindings.js` | Nur `cost.setSearch` und `cost.clearSearch`; nach Entfernung dieser zwei Zeilen ist die Datei hashgleich zur Ausgangsbasis. |

## Geänderte Releasemetadaten

Diese Dateien wurden nur wegen der ausdrücklichen Releasevorgabe V99.4.44/`99.4.44-ap22f9b` fortgeschrieben:

- `js/app-runtime-config.js`
- `js/service-worker-register.js`
- `service-worker.js`
- `manifest.webmanifest`
- `nk-pro-project.json`
- `package.json`
- `package-lock.json`
- `SHA256SUMS.txt` – im Release vollständig neu erzeugte Inhaltsprüfsummen

`package.json` enthält zusätzlich ausschließlich die neuen AP22F9B-Testskripte und deren Release-Verkettung.

## Neue AP22F9B-Dateien

- `tests/ap22f9b-total-costs.test.cjs`
- `tests/ap22f9b-protected-areas.test.cjs`
- `tests/ap22f9b-total-costs-browser.test.cjs`
- `AP22F9B_SCHUTZ_HASH_BERICHT_VORHER.txt`
- `AP22F9B_SCHUTZ_HASH_BERICHT_NACHHER.txt`
- `AP22F9B_SCHUTZ_HASH_BERICHT.md`
- `AP22F9B_POSITIVLISTENABGLEICH.md`
- `AP22F9B_TESTBERICHT.md`
- `AP22F9B_TEST_RESULTS.json`
- `AP22F9B_BROWSERPRUEFUNG.md`
- `AP22F9B_ABSCHLUSSBERICHT.md`
- `AP22F9B_DATEIAENDERUNGEN.md`
- `AP22F9B_Screenshots/01_desktop_bearbeiten.png`
- `AP22F9B_Screenshots/02_desktop_nur_ansehen.png`
- `AP22F9B_Screenshots/03_dialog_kostenart_hinzufuegen.png`
- `AP22F9B_Screenshots/04_leerzustand.png`
- `AP22F9B_Screenshots/05_hinweiszustand.png`
- `AP22F9B_Screenshots/06_ansicht_620px.png`
- `AP22F9B_Screenshots/07_ansicht_390px.png`
- `AP22F9B_Screenshots_Kontaktbogen.jpg`

## Nicht geändert

Alle sonstigen Produkt-, Fach-, Persistenz-, Migrations-, Backup-/Restore-, Archiv-, Qualitäts-, Brief-, Druck-, Navigations- und bereits migrierten UI-Dateien sind unverändert. Die allgemeinen Dokumente `README.md`, `RELEASE_NOTES.md`, `CHANGELOG.md`, `NK-PRO-PROJEKTSTAND.md` und `UI_MIGRATIONSMATRIX.md` sind ebenfalls hashgleich zur Ausgangsbasis.
