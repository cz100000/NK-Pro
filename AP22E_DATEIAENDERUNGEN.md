# AP22E – Dateiänderungen

**Ausgang:** V99.4.32 / AP22D  
**Ziel:** V99.4.33 / AP22E  
**Releaseart:** Designvertrag, Dokumentation und nicht produktive Referenzbibliothek

## Ergebnis

- 0 produktive HTML-, CSS- oder JavaScript-Dateien geändert.
- 0 Dateien entfernt.
- 21 Dateien neu angelegt.
- 13 bestehende Dokumentations-, Paket- oder Testkonfigurationsdateien geändert.
- 58 geschützte Produktdateien sind SHA-256-identisch zur hochgeladenen Ausgangs-ZIP.

## Neue Vertrags- und Nachweisdateien

- `UI_UX_DESIGNVERTRAG.md`
- `UI_UX_ZIELBILD.md`
- `UI_UX_SEITENANATOMIE.md`
- `UI_UX_KOMPONENTENREGELN.md`
- `UI_UX_ABNAHMEKATALOG.md`
- `AP22E_DATEIPOSITIVLISTE.md`
- `AP22E_BESTANDSAUFNAHME.md`
- `AP22E_DATEIAENDERUNGEN.md`
- `AP22E_DATEIAENDERUNGEN.json`
- `AP22E_PRUEFBERICHT.md`
- `AP22E_ABSCHLUSS.md`
- `AP22E_TEST_RESULTS.json`
- `AP22E_RELEASE_CONTENT_POLICY.json`

## Neue Referenzbibliothek

- `ui-reference/index.html`
- `ui-reference/reference.css`
- `ui-reference/reference.js`
- `ui-reference/assets/UI_UX_Styleguide_Bild.svg`
- `ui-reference/assets/UI_UX_Styleguide_Bild.png`
- `ui-reference/assets/navigation-v99-4-32.png`

Die Navigation-Abbildung wurde aus der unveränderten Produktbasis V99.4.32 erzeugt. Das Styleguide-Bild wurde anhand der im Chat sichtbaren und freigegebenen Vorlage als lokale SVG-/PNG-Referenz nachgebildet, weil die Originalbilddatei nicht als Binärdatei im Arbeitsdateisystem bereitstand.

## Neue Tests

- `tests/ap22e-ui-design-contract.test.cjs`
- `tests/ap22e-ui-reference.spec.js`

## Geänderte Bestandsdateien

### Zentrale Dokumentation

- `UI_DESIGN_TOKENS.md`
- `UI_KOMPONENTENKATALOG.md`
- `UI_ARCHITEKTUR_AKTUELL.md`
- `UI_MIGRATIONSMATRIX.md`
- `UX_GUIDE.md`
- `NK-PRO-PROJEKTSTAND.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `RELEASE_NOTES.md`
- `TESTING.md`

### Test- und Releaseintegration

- `playwright.config.cjs` – ausschließlich neues AP22E-Projekt registriert.
- `package.json` – Vertragsrelease V99.4.33 und separate AP22E-Kommandos.
- `package-lock.json` – Paketmetadaten synchronisiert.
- `SHA256SUMS.txt` – nach finaler Abnahme neu erzeugt.

## Geschützte, unveränderte Bereiche

Unverändert blieben insbesondere `index.html`, `assets/app.css`, sämtliche produktiven `js/*.js`, `service-worker.js`, `manifest.webmanifest`, Navigation, Abrechnungskontext, Fachlogik, Datenmodell, Persistenz, Migration, Backup/Restore, Archiv, Snapshots, Briefe, Druck, PDF, Import und Export.
