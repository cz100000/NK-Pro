# NK-Pro – Verantwortlichkeitsmatrix V99.4.23

| Verantwortung | Eigentümer | Nicht zuständig |
|---|---|---|
| Anwendungsstart | `app.js` / `app-bootstrap.js` | Fachlogik, DOM-Renderer |
| Root-State / Commit | `app-state-persistence.js`, `state-access.js` | Regeldefinition, Navigation |
| Abrechnungskontext / Schreibschutz | `billing-context.js` | fachliche Bewertung |
| Zentrale Prüfregeln und Readiness | `quality-rules.js` | DOM, Persistenzaufruf, Dialoge |
| Kompatible Qualitäts-API | `quality-assurance.js` | parallele Ergebnisberechnung |
| Prüfungscockpit / Fachseitenhinweise | `ui-quality.js` | Berechnungsformeln |
| Abschlusssteuerung | `billing-workflow.js` | eigene Prüfregeln |
| Abnahmeprotokoll | `document-data.js` | eigene Freigabelogik |
| Technische Diagnose | `diagnostics.js`, Systemdiagnose-Renderer | fachliche Aufgabenliste |
| Verbrauchserfassung | `ui-metering.js` und Zählermodule | Zählerinventar-DUMMY |
| Zählerinventar-DUMMY | `index.html` und CSS | Speicherung, Berechnung |
| Dokumente | AP13-Dokumentmodule | App-Farbsystem, Prüfregistry |
| Browser-I/O / PWA | `browser-io.js`, `export-service.js`, Service Worker | Fachzustand |
