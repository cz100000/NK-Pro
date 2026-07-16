# AP22D – Datei-Positivliste vor Umsetzung

## Geplante Produktdateien (maximal 10)

1. `assets/app.css` – zentrale Dialogschale, Dialogvarianten, Fokusdarstellung sowie standardisierte Inhaltszustände ergänzen.
2. `index.html` – fünf bestehende produktive Dialoge semantisch und über zentrale `nk-ui-*`-Klassen markieren; zwei geeignete Leer-/Filterzustände zentral kennzeichnen; Releasekennung erst nach bestandener Abnahme aktualisieren.
3. `js/ui-design-system.js` – zentrale Dialogsteuerung mit Fokusfalle, Fokusrückgabe, Escape-/Hintergrundregeln und zentrale Zustandsschnittstelle ergänzen.
4. `js/app-runtime-config.js` – AP22D-Modul-/Versionsmetadaten und Releasehinweis erst nach bestandener Abnahme aktualisieren.
5. `service-worker.js` – Build-ID und versionsgebundene UI-Assets erst nach bestandener Abnahme aktualisieren.
6. `js/service-worker-register.js` – Build-ID mit dem tatsächlichen Release synchronisieren.
7. `manifest.webmanifest` – Releaseversion erst nach bestandener Abnahme aktualisieren.
8. `package.json` – neue separate AP22D-Tests und Releasemetadaten ergänzen.
9. `package-lock.json` – Paketversion synchronisieren.
10. `nk-pro-project.json` – AP22D-Projektstand, Dialog-/Zustandsmigration und Folgepaket dokumentieren.

## Testinfrastruktur und neue Nachweise

- `playwright.config.cjs` – ausschließlich Registrierung des neuen separaten AP22D-Testprojekts.
- `tests/ap22d-ui-dialogs-states.test.cjs`
- `tests/ap22d-ui-dialogs-states.spec.js`
- `AP22D_INVENTAR_DIALOGE_UND_ZUSTAENDE.md`
- `AP22D_UI_BIBLIOTHEK_DIALOGE_UND_LEERZUSTAENDE.md`
- `AP22D_PRUEFBERICHT.md`
- `AP22D_DATEIAENDERUNGEN.md`
- `AP22D_DATEIAENDERUNGEN.json`
- `AP22D_TEST_RESULTS.json`
- `AP22D_RELEASE_CONTENT_POLICY.json`
- `AP22D_ABSCHLUSS.md`

## Bestehende Projektdokumentation

- `UI_KOMPONENTENKATALOG.md`
- `UI_DESIGN_TOKENS.md`
- `UI_ARCHITEKTUR_AKTUELL.md`
- `UI_MIGRATIONSMATRIX.md`
- `UX_GUIDE.md`
- `NK-PRO-PROJEKTSTAND.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `RELEASE_NOTES.md`

Bestehende Regressionstests werden nicht verändert. Dateien außerhalb dieser Liste werden nicht geändert.

## Zusätzlich freigegebene Release-Integritätsdatei

- `SHA256SUMS.txt` – nach ausdrücklicher Nutzerfreigabe vollständig neu erzeugt; keine Produktdatei und keine Erweiterung des fachlichen Umfangs.
