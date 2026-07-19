# AP22F11B – Geänderte Dateien

Vergleichsbasis ist die bytegenau extrahierte V99.4.60 unter `technical-base`.

## Produktive und testtechnische Änderungen

| Datei | Art | Zweck |
|---|---|---|
| `assets/app.css` | geändert | Seitenspezifische Layout-, Tabellen-, Kachel-, Status-, Dialog- und Responsive-Stile für das Abrechnungsergebnis. |
| `index.html` | geändert | Neue Seitenstruktur, vier Kennzahlen, Ergebnis-/Vermieter-/Differenzbereiche, Gesamtabgleich und Akzeptanzdialog. |
| `js/app-runtime-config.js` | geändert | V99.4.61, neues Prüfmodul, Datenebenenfeld und Changelog. |
| `js/app.js` | geändert | Konfiguration und Registrierung des Prüfmoduls sowie der neuen Anwendungsaktionen. |
| `js/billing-context.js` | geändert | Freigabe der neuen Prüfaktionen im Abrechnungskontext. |
| `js/billing-review.js` | neu | Neues Fachmodul für generische Differenzerkennung, Status, Akzeptanzen, Signaturen, Historie und Ungültigwerden. |
| `js/meter-readings.js` | geändert | Stoppt weitere technisch identische Messwertversionen bei wiederholter Synchronisierung. |
| `js/service-worker-register.js` | geändert | Build-/Cachefortschreibung auf V99.4.61. |
| `js/state-access.js` | geändert | Commit-Erfolg kann verpflichtend geprüft werden; Transaktionen rollen bei Persistenzfehler zurück und rendern den Rollbackzustand. |
| `js/ui-billing-allocation.js` | geändert | Renderer, Filter, Direkteinstiege, Detail-/Akzeptanzabläufe und schreibgeschützte Ansicht der neuen Ergebnis-Seite. |
| `js/ui-bindings.js` | geändert | Registrierung der neuen UI-Aktionen. |
| `js/ui-page-controller.js` | geändert | Einbindung des neuen Seitenrenderers und Dialogzustands. |
| `manifest.webmanifest` | geändert | PWA-Version und Beschreibung V99.4.61. |
| `nk-pro-project.json` | geändert | Projekt-, Build- und Featuremetadaten V99.4.61. |
| `package-lock.json` | geändert | Paketname und Version V99.4.61. |
| `package.json` | geändert | Paketversion, Releaseprüfung und AP22F11B-Testskripte. |
| `service-worker.js` | geändert | Cachekennung und neues Prüfmodul in der App-Shell. |
| `tests/ap22f11b-billing-result-browser.test.cjs` | neu | Echtdaten-, Browser-, Persistenz-, Fehler-, Ungültigkeits-, Import-/Export- und Layoutprüfung. |
| `tests/ap22f11b-billing-result.test.cjs` | neu | Statische Struktur-, Versions-, Sonderlogik- und Schutzprüfung. |

## Neue Nachweise

- `AP22F11B_VORBEDINGUNGEN_BASELINEBERICHT.md`
- `AP22F11B_UMSETZUNGSBERICHT.md`
- `AP22F11B_BASISVERGLEICH.md`
- `AP22F11B_TESTBERICHT.md`
- `AP22F11B_ECHTDATEN_ERHALTUNGSBERICHT.md`
- `AP22F11B_DATENMIGRATIONEN.md`
- `AP22F11B_RESTPUNKTE.md`
- `AP22F11B_ABSCHLUSS.md`
- `AP22F11B_TEST_RESULTS.json`
- `AP22F11B_DATEIAENDERUNGEN.json`
- `AP22F11B_Dokumentation/`
- `AP22F11B_Screenshots/`
- `nk-pro-gesamtbestand-2025-V99.4.61-AP22F11B-getestet.json`

Es wurden keine produktiven Dateien entfernt.
