# NK-Pro – Modulübersicht V99.4.17

| Modulgruppe | Dateien / Verantwortung |
|---|---|
| Start/Orchestrierung | `app.js`, `app-bootstrap.js`, `app-runtime-config.js`: Start, Verdrahtung und Moduslisten. |
| Zustand/Persistenz | `state-access.js`, `app-state-persistence.js`, `persistence.js`, `migration.js`, `backup-recovery.js`. |
| UI-Infrastruktur | `ui-events.js`, `ui-controller.js`, `ui-bindings.js`, `navigation.js`, `modal-events.js`, `ui-preferences.js`. |
| Seitensteuerung | `ui-navigation-pages.js`, `ui-page-controller.js`: Start-/Abrechnungsmodus, Seitenziele und Übersichtskarten. |
| Verbrauchsdarstellung | `ui-metering.js`: bestehende produktive Verbrauchserfassung unter `verbraeuche`. |
| Zählerinventar-DUMMY | statisches Markup in `index.html`, ausschließlich Ansicht und Tabellenfilter. |
| Dokumente | `document-data.js`, `document-renderer.js`, `ui-documents.js`: unverändertes AP13-Briefmodell. |
| Export/Browser-I/O | `export-service.js`, `browser-io.js`. |
| Laufzeitdiagnose | `runtime-diagnostics.js`. |
| PWA | `service-worker.js`: App-Shell und Offlinecache `nk-pro-v99-4-17-ap14`. |

AP14 ergänzt kein Fachmodul und keine Abhängigkeit. Die AP12-Modulgrenzen und das AP13-Dokumentmodell bleiben verbindlich.
