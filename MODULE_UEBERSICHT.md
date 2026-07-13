# NK-Pro – Modulübersicht V99.4.13

| Modulgruppe | Dateien / Verantwortung |
|---|---|
| Start/Orchestrierung | `app.js`, `app-bootstrap.js`, `app-runtime-config.js`: Start, Verdrahtung, deterministische Reihenfolge. |
| Zustand/Persistenz | `state-access.js`, `app-state-persistence.js`, `persistence.js`, `migration.js`, `backup-recovery.js`. |
| UI-Infrastruktur | `ui-events.js`, `ui-controller.js`, `ui-bindings.js`, `navigation.js`, `modal-events.js`, `ui-preferences.js`. |
| Spezialisierte UI | `ui-master-data.js`, `ui-quality.js`, `ui-costs.js`, `ui-navigation-pages.js`, `ui-archive-pages.js`, `ui-metering.js`, `ui-billing-allocation.js`, `ui-documents.js`, `ui-table-actions.js`, `ui-diagnostics.js`, `ui-page-controller.js`. |
| Fach/Workflow | Anwendungs-, Stammdaten-, Kosten-, Abrechnungs-, Archiv-, Jahreswechsel-, Qualitäts- und Diagnosemodule. |
| Dokument/Export | `document-data.js`, `document-renderer.js`, `export-service.js`, `browser-io.js`. |
| Laufzeitdiagnose | `runtime-diagnostics.js`: eine gekapselte, schreibgeschützte Diagnoseschnittstelle. |
| PWA | `service-worker.js`: App-Shell und Offlinecache `nk-pro-v99-4-13`. |

Alle 15 AP12-Neumodule sind in `AP12_RESTENTKOPPLUNG_UND_ZUSTANDSBEREINIGUNG.md` einzeln beschrieben.
