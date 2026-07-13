# NK-Pro – Architekturstand V99.4.13

**Datenschema 5 · Datenebenenvertrag 1 · Objektstandard 1 · Zählerstandards 1 · Abrechnungssnapshot 2**

## Schichten

1. **Start und Verdrahtung:** `app.js`, `app-bootstrap.js`, `app-runtime-config.js`.
2. **UI-Ereignisse und Controller:** `ui-events.js`, `ui-controller.js`, `ui-bindings.js` sowie spezialisierte `ui-*.js`-Module.
3. **Anwendungsaktionen:** `application-actions.js`, Stammdaten-, Kosten-, Abrechnungs-, Archiv- und Jahreswechselaktionen.
4. **Fachmodule:** Berechnung, Zähler, Objektstandard, Snapshot, Qualität und Diagnose.
5. **Dokumente und Browser-I/O:** `document-data.js`, `document-renderer.js`, `ui-documents.js`, `browser-io.js`, `export-service.js`.
6. **Zustand und Persistenz:** `state-access.js`, `app-state-persistence.js`, `persistence.js`, Migration und Backup/Restore.
7. **PWA:** `service-worker.js`, `service-worker-register.js`.

## Verbindliche Grenzen

`app.js` besitzt keine Fach-, Renderer-, Dialog-, Persistenz- oder Browserimplementierung. `state` ist die einzige fachliche Arbeitswahrheit; vollständige Ersetzung erfolgt nur im Zustandseigentümer. Renderer sind seiteneffektfrei. Ereignisse laufen ausschließlich über die zentrale Delegation. Eingefrorene Modulnamensräume bilden die notwendige Classic-Script-Schnittstelle ohne Bundler.

Das AP11-Navigationsgrundsystem bleibt erhalten. Nach AP12 wurde ausschließlich die künstliche Untergruppe innerhalb „Nebenkosten abrechnen“ entfernt und die zehn vorhandenen Punkte gleichrangig geordnet. Briefgestaltung und Druckkonsistenz bleiben AP13.
