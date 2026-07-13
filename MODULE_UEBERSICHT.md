# NK-Pro – Modulübersicht V99.4.15

| Modulgruppe | Dateien / Verantwortung |
|---|---|
| Start/Orchestrierung | `app.js`, `app-bootstrap.js`, `app-runtime-config.js`: Start, Verdrahtung, deterministische Reihenfolge. |
| Zustand/Persistenz | `state-access.js`, `app-state-persistence.js`, `persistence.js`, `migration.js`, `backup-recovery.js`. |
| UI-Infrastruktur | `ui-events.js`, `ui-controller.js`, `ui-bindings.js`, `navigation.js`, `modal-events.js`, `ui-preferences.js`. |
| Spezialisierte UI | unter anderem `ui-documents.js` für Briefeditor, Auswahl, Vorschau und AP13-Ganzseitenskalierung. |
| Fach/Workflow | Anwendungs-, Stammdaten-, Kosten-, Abrechnungs-, Archiv-, Jahreswechsel-, Qualitäts- und Diagnosemodule. |
| Dokumentdaten | `document-data.js`: Briefdaten, Prüfwerte und Preflight ohne alternatives Layout. |
| Dokumentdarstellung | `document-renderer.js`: gemeinsames DIN-A4-HTML/CSS, Ein-/Zweiseitenlogik, Tabellen und Abschluss. |
| Export/Browser-I/O | `export-service.js`, `browser-io.js`: Datei-, Zwischenablage-, Druckfenster- und PDF-nahe Browserabläufe. |
| Laufzeitdiagnose | `runtime-diagnostics.js`: gekapselte, schreibgeschützte Diagnoseschnittstelle. |
| PWA | `service-worker.js`: App-Shell und Offlinecache `nk-pro-v99-4-15`. |

Die AP12-Modulgrenzen bleiben verbindlich. AP13 ersetzt keine Fachmodule, sondern vereinheitlicht ausschließlich das Dokumentlayout und seine Ausgabekanäle.
