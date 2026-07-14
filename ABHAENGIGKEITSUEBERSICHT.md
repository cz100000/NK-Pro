# NK-Pro – Abhängigkeitsübersicht V99.4.23

AP20 ergänzt keine externe Produktionsabhängigkeit. Die zentrale Prüfarchitektur folgt dem bestehenden geordneten Skriptmodell.

```text
Fachdaten/Berechnung/Snapshot
        ↓
quality-rules (Registry + einheitliche Ergebnisse)
        ↓
quality-assurance (Kompatibilitätsadapter)
        ├─ ui-quality (Cockpit, Fachseiten, Systemdiagnose)
        ├─ ui-page-controller (Dashboardstatus)
        ├─ billing-workflow (Abschlussbereitschaft)
        └─ document-data (Abnahmeprotokoll)

DOM → ui-events → ui-controller → ui-bindings → Actions/Fachdienste → State/Commit
Dokumentdaten → Dokumentrenderer → browser-io/export-service
```

Bestätigungen werden additiv im bestehenden State gespeichert. `quality-rules.js` greift nicht direkt auf DOM, Browser-Speicher oder Dialoge zu. `index.html` und `service-worker.js` enthalten dieselbe vollständige App-Shell einschließlich der Registry.
