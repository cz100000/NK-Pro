# AP22F5B Korrektur 1 – Datei-Positivliste

## Zulässige bestehende Produktdateien
- `index.html`
- `assets/app.css`
- `js/ui-navigation-pages.js`
- `ui-reference/index.html`
- `ui-reference/reference.css`

## Zulässige AP22F5B-Prüf- und Abschlussdateien
- `tests/ap22f5b-pages.test.cjs`
- `tests/ap22f5b-pages-browser.test.cjs`
- `AP22F5B_*.md`
- `AP22F5B_*.json`
- `README.md`
- `CHANGELOG.md`
- `RELEASE_NOTES.md`
- `NK-PRO-PROJEKTSTAND.md`
- `SHA256SUMS.txt`

## Zulässige neue Dateien
- `tests/ap22f5b-correction-browser.test.cjs`
- `AP22F5B_Korrektur1_Screenshots/*`
- Korrekturberichte und maschinenlesbare Korrekturartefakte mit Präfix `AP22F5B_KORREKTUR_1_`

## Nicht zulässig
- Änderungen an Navigation und Seitenschlüsseln
- Änderungen an Datenmodell, Fachlogik, Persistenz oder Migration
- Änderungen an Zählerfachmodulen oder Zähler-DUMMY-Verhalten
- neue Mietverhältnisfelder, Statuswerte oder Speicherwege
- Änderungen an Abrechnung, Prüfregeln, Brief, Druck, PDF oder Export
- Änderungen an den 94 mit `AP22F5B_PROTECTED_HASHES.json` geschützten Dateien
