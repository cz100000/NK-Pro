# AP22F1C – Datei-Positivliste

**Ausgangsbasis:** V99.4.35 / AP22F1B  
**Ziel:** V99.4.36 / AP22F1C – Dialogausblendung und zentrale Versionsanzeige

## Produktdateien

| Datei | Zulässige Änderung |
|---|---|
| `assets/app.css` | Geschlossene native `dialog.nk-ui-dialog` trotz zentralem Flex-Layout zuverlässig ausblenden. |
| `index.html` | Navigations-Versionslabel als zentrales Bindungsziel markieren; Fallback-, Titel-, Build- und Assetkennungen aktualisieren. |
| `js/ui-page-controller.js` | Markierte Versionslabels bei der zentralen UI-Aktualisierung ausschließlich aus `APP_VERSION` befüllen. |
| `js/app-runtime-config.js` | Releaseversion, AP-Name, Releasedatum und aktueller Changelog-Eintrag aktualisieren. |
| `js/service-worker-register.js` | Build-ID für die einmalige Aktualisierung des neuen Releases anheben. |
| `service-worker.js` | Ausschließlich Cache- und Buildkennung aktualisieren; Funktionslogik bleibt unverändert. |
| `manifest.webmanifest` | PWA-Anzeigename und Version aktualisieren. |
| `nk-pro-project.json` | Release-, Build- und Cachemetadaten aktualisieren. |

Damit sind acht Produktdateien betroffen. Die Grenze von zehn Produktdateien wird nicht überschritten.

## Test- und Integrationsdateien

- `tests/ap22f1c-dialog-version-regression.test.cjs` – neue statische Regression und Schutzprüfung.
- `tests/ap22f1c-dialog-version-regression.spec.js` – neue Chromium-Regression.
- `playwright.config.cjs` – ausschließlich neues AP22F1C-Testprojekt registrieren.
- `package.json` – AP22F1C-Test- und Releasegate sowie Paketmetadaten ergänzen.
- `package-lock.json` – Paketmetadaten synchronisieren.

Bestehende Regressionstestdateien werden nicht verändert.

## Referenz- und Dokumentationsdateien

- `ui-reference/index.html`
- `NK-PRO-PROJEKTSTAND.md`
- `UI_ARCHITEKTUR_AKTUELL.md`
- `UI_KOMPONENTENKATALOG.md`
- `UI_UX_DESIGNVERTRAG.md`
- `TESTING.md`
- `CHANGELOG.md`
- `RELEASE_NOTES.md`
- `AP22F1C_ENTSCHEIDUNGEN.md`
- `AP22F1C_PRUEFBERICHT.md`
- `AP22F1C_ABSCHLUSS.md`
- `AP22F1C_DATEIAENDERUNGEN.md`
- `SHA256SUMS.txt`

## Geschützte Bereiche

Unverändert bleiben insbesondere Navigation und Navigationsdefinitionen außerhalb des Versionslabels, globale Kontextleiste, Schreibschutz, Zeitraumlogik, Fachlogik, Prüfregeln, Datenmodell, Persistenz, Migration, Backup/Restore, Archiv, Export, Dokumentausgabe, Berechnungen und Service-Worker-Funktionslogik.
