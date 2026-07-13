# NK-Pro – Modulübersicht V99.4.12

| Modul/Datei | Verantwortung im aktuellen Stand |
|---|---|
| `index.html` | produktives Markup, genau eine Navigation, lokale SVG-Piktogramme und Fachseiten |
| `assets/app.css` | zentrale Tokens, Navigationsdarstellung, Responsive-/Fokuszustände und bestehende Fachseitenstile |
| `navigation.js` | Gruppenpfad, aktiver UI-Zustand, Drawer/Collapse und Abrechnungskontext; keine Fachmutation |
| `ui-events.js` | zentrale deklarative Ereignisdelegation |
| `ui-controller.js` / `ui-bindings.js` | 13 Controller, 99 Aktionen und UI-Adapter |
| `application-actions.js` | eingefrorenes Register der Anwendungsaktionen |
| `master-data-actions.js` | Stammdatenorchestrierung |
| `cost-actions.js` | Kostenorchestrierung |
| `billing-workflow.js` | laufender Abrechnungsworkflow und Snapshot-Koordination |
| `archive-actions.js` | atomare Archivmutationen |
| `year-transition-actions.js` | Neuanlage und Jahreswechsel |
| `quality-assurance.js` / `diagnostics.js` | seiteneffektfreie Qualitäts- und Systemprüfungen |
| `billing-calculation.js` | zentrale Kosten-, Verbrauchs-, Vorauszahlungs- und Saldenberechnung |
| `meter-*` | Zählerstammdaten, Messwerte, Perioden und Validierung |
| `object-standard.js` / `billing-snapshot.js` | Objektstandard 1 und Snapshot 2 |
| `document-data.js` / `document-renderer.js` | fachliche Dokumentdaten und Ausgabe-HTML |
| `export-service.js` | JSON/CSV/Paketexporte und Downloads |
| `persistence.js` / `migration.js` / `backup-recovery.js` | Speicherung, Migration, Sicherung, Restore und Rollback |
| `app-bootstrap.js` / `compatibility.js` | Startreihenfolge und Legacy-Schnittstellen |
| `app.js` | verbleibende UI-/Legacy-Orchestrierung; AP12-Ziel |
| `service-worker.js` | App-Shell und Offlinecache V99.4.12 |

Die verbindliche Skriptreihenfolge steht in `index.html` und wird durch die Releaseprüfung mit der Service-Worker-App-Shell abgeglichen.
