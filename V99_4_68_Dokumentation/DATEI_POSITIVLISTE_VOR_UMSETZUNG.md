# V99.4.68 – Datei-Positivliste vor Umsetzung

## Produktdateien

| Datei | Grund |
|---|---|
| `js/billing-calculation.js` | Zentrale Teilnehmerentscheidung und einheitlicher Ergebnisweg |
| `js/ui-costs.js` | Privat-/Eigenanteile vollständig editierbar; Status- und Summenanzeige |
| `js/billing-workflow.js` | Snapshot-Kennzahlen und Teilnehmerzählung |
| `js/archive-actions.js` | Korrekturen und Saldo ohne rollenbedingten Ausschluss |
| `js/export-service.js` | Einheitliche Exportzeile statt separatem Privat-Finanzpfad |
| `js/ui-billing-allocation.js` | Keine automatische Vermieterkostenposition „Privatanteil“ |
| `js/billing-review.js` | Privatanteil nicht als Vermieterkostenbasis behandeln |
| `js/cost-reconciliation.js` | Teilnehmeranteile ohne Doppelzählung; Privatnutzung nur Information |
| `js/ui-cost-reconciliation.js` | Fachlich eindeutige Begriffe und Spalten |
| `js/quality-rules.js` | Pflichtprüfungen für alle Teilnehmer; generische Rollenerkennung |
| `js/quality-system-k4.js` | Prüfinventar an neue Fachregel anpassen |
| `js/diagnostics.js` | Alte Ausschlusserwartungen ersetzen |
| `js/ui-individual-values.js` | Tatsächlichen Namen primär anzeigen, Nutzungsart als Badge |
| `js/ui-quality.js` | Kennzahlen und Begriffe auf Teilnehmerlogik umstellen |
| `js/ui-master-data.js` | Hardcodierte M000-/Namenslogik entfernen; Rollen normalisieren |
| `js/app-state-persistence.js` | Generische Rollen-/Teilnehmermigration beim Laden |
| `js/app-runtime-config.js` | Version und Release Notes |
| `js/service-worker-register.js` | Neuer Build-Identifier |
| `service-worker.js` | Neuer Cache-/Build-Identifier |
| `index.html` | Version, Build-Identifier und Seitentexte |
| `js/default-seed.js` | Aktive Stammdatenebenen und M000-Einzugsdatum 01.01.2010 |
| `package.json`, `package-lock.json` | Release-Version |
| `README.md`, `CHANGELOG.md`, `NK-PRO-PROJEKTSTAND.md` | Projektdokumentation und Release Notes |

## Tests

| Datei | Grund |
|---|---|
| `tests/v99468-private-participants.test.cjs` | Neuer generischer A-bis-Z-Domänen-/Quellcode-/Datenmigrationstest |
| `tests/ap22f12-cost-reconciliation.test.cjs` | Fachlich überholte Doppelzählungserwartung aktualisieren |
| `tests/ap22f11b-korrektur4.test.cjs` | Versionsprüfung aktualisieren |
| `tests/ap22f12-integration.test.cjs` | Versions- und Buildprüfung aktualisieren |
| `package.json` | Neues V99.4.68-Testskript in Gesamtlauf integrieren |

## Daten- und Ergebnisartefakte

Der hochgeladene Echtdatenbestand wird separat migriert. Finalisierte Archivstände bleiben unverändert; angepasst werden nur zentraler Stammdatenbestand, Objektstandard und aktuell bearbeitete Abrechnung 2023.
