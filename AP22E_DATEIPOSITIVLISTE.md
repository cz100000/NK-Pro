# AP22E – Datei-Positivliste vor Umsetzung

**Ausgang:** V99.4.32 / AP22D  
**Ziel:** V99.4.33 / AP22E – UI-/UX-Designvertrag und Referenzbibliothek

## 1. Bestehende Dokumentationsdateien

| Datei | Technische Notwendigkeit |
|---|---|
| `UI_DESIGN_TOKENS.md` | Verbindliche Ziel-Tokens vollständig spezifizieren, ohne produktive CSS-Werte zu ändern. |
| `UI_KOMPONENTENKATALOG.md` | Freigegebene Komponenten, Varianten, Zustände und Migrationsreife konsolidieren. |
| `UI_ARCHITEKTUR_AKTUELL.md` | Rang und Grenzen des Designvertrags sowie Trennung von Referenz- und Produktcode dokumentieren. |
| `UI_MIGRATIONSMATRIX.md` | Produktive Seiten, Zielkomponenten, Redundanzen, Prüf- und Bereinigungsstatus vorbereiten. |
| `UX_GUIDE.md` | Bedien-, Responsive-, Fokus- und Barrierefreiheitsregeln mit dem Vertrag synchronisieren. |
| `NK-PRO-PROJEKTSTAND.md` | AP22E-Ergebnis und Folgeprozess dokumentieren. |
| `ROADMAP.md` | AP22E abschließen und nachfolgende Migrationspakete als Vorschlags-/Freigabeprozess festlegen. |
| `CHANGELOG.md` | Dokumentations-/Referenzrelease V99.4.33 nachweisen. |
| `RELEASE_NOTES.md` | Umfang, Schutzgrenzen, Aufruf und Testergebnis des Releases beschreiben. |
| `TESTING.md` | Neue AP22E-Prüfungen und historische Testkonflikte dokumentieren. |

## 2. Neue Dokumentationsdateien

- `UI_UX_DESIGNVERTRAG.md`
- `UI_UX_ZIELBILD.md`
- `UI_UX_SEITENANATOMIE.md`
- `UI_UX_KOMPONENTENREGELN.md`
- `UI_UX_ABNAHMEKATALOG.md`
- `AP22E_BESTANDSAUFNAHME.md`
- `AP22E_DATEIPOSITIVLISTE.md`
- `AP22E_DATEIAENDERUNGEN.md`
- `AP22E_DATEIAENDERUNGEN.json`
- `AP22E_PRUEFBERICHT.md`
- `AP22E_ABSCHLUSS.md`
- `AP22E_TEST_RESULTS.json`
- `AP22E_RELEASE_CONTENT_POLICY.json`

## 3. Neue Dateien der nicht produktiven Referenzbibliothek

- `ui-reference/index.html`
- `ui-reference/reference.css`
- `ui-reference/reference.js`
- `ui-reference/assets/UI_UX_Styleguide_Bild.svg`
- `ui-reference/assets/UI_UX_Styleguide_Bild.png`
- `ui-reference/assets/navigation-v99-4-32.png`

Die Referenzbibliothek ist isoliert, nicht in der Produktnavigation verlinkt, lädt keine Produktdaten und verwendet weder Persistenz noch Fachlogik.

## 4. Neue separate AP22E-Testdateien

- `tests/ap22e-ui-design-contract.test.cjs`
- `tests/ap22e-ui-reference.spec.js`
- `playwright.config.cjs` – ausschließlich Registrierung des separaten AP22E-Projekts.

Bestehende Regressionstestdateien bleiben unverändert.

## 5. Release- und Integritätsdateien

- `package.json` – Paketmetadaten und separate AP22E-Testkommandos nach bestandener Abnahme.
- `package-lock.json` – Synchronisierung der Paketmetadaten nach bestandener Abnahme.
- `SHA256SUMS.txt` – nach Abschluss vollständig neu erzeugte Integritätsliste.

## 6. Produktive Schutzliste

Nicht geändert werden insbesondere:

- `index.html`
- `assets/app.css`
- sämtliche produktiven Dateien unter `js/`
- `service-worker.js`
- `manifest.webmanifest`
- Navigation und Navigationslogik
- Abrechnungskontextlogik
- Fachlogik, Berechnung, Datenmodell, Persistenz, Migration, Backup, Restore, Archiv und Snapshots
- Brieflayout, Briefvorschau, Druck, PDF, Import und Export

Vor und nach AP22E werden die SHA-256-Werte aller produktiven HTML-, CSS- und JavaScript-Dateien verglichen.
