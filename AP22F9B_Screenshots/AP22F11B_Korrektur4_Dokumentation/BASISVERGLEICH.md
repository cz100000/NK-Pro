# Basisvergleich V99.4.64 → V99.4.65

**Stand:** 20.07.2026

- Geänderte Dateien: **23**
- Neue Dateien: **5**
- Entfernte Dateien: **0**
- Datenschema: **5 → 5**
- Keine frühere Produktversion wurde zurückkopiert.
- Die Zählung bezieht sich auf produktive, Konfigurations- und Testdateien. Neu erzeugte K4-Dokumentations- und Screenshotartefakte werden zusätzlich mitgeliefert und sind nicht in den 5 neuen technischen Dateien enthalten.

## Geänderte Dateien

- `assets/app.css`
- `index.html`
- `js/app-runtime-config.js`
- `js/billing-workflow.js`
- `js/document-data.js`
- `js/quality-assurance.js`
- `js/quality-rules.js`
- `js/ui-bindings.js`
- `js/ui-costs.js`
- `js/ui-documents.js`
- `js/ui-page-controller.js`
- `js/ui-quality.js`
- `manifest.webmanifest`
- `nk-pro-project.json`
- `package-lock.json`
- `package.json`
- `service-worker.js`
- `tests/ap10-archive-year-quality-diagnostics.test.cjs`
- `tests/ap20-meter-start-regression.test.cjs`
- `tests/ap21-rule-audit.test.cjs`
- `tests/ap21b2-navigation-centralization.test.cjs`
- `tests/ap6-modularization.test.cjs`
- `tests/ap7-ui-integration.test.cjs`

## Neue Dateien

- `js/quality-system-k4.js`
- `js/ui-quality-k4.js`
- `tests/ap22f11b-korrektur4-browser.test.cjs`
- `tests/ap22f11b-korrektur4-data-roundtrip.test.cjs`
- `tests/ap22f11b-korrektur4.test.cjs`

## Entfernte Dateien

- Keine

## Fachliche Kerndifferenzen

- Neue produktive K4-Projektion und UI für Prüfresultate und Regelinventar.
- Vollständige moderne Statuslogik ohne „Blockierender Fehler“.
- Verbindung der bestehenden Differenzentscheidungen mit der Prüfseite.
- Inventarisierung von 87 produktiven Regeln; automatisierte Testfälle ausgeschlossen.
- Abschlussprüfung, Brieffreigabe und Schreibschutz bleiben an vorhandene Produktlogik gebunden.
