# NK-Pro – Abhängigkeitsübersicht V99.4.16


AP13 ergänzt keine neue externe Laufzeitabhängigkeit. Der gemeinsame Dokumentrenderer wird von `ui-documents.js` für Vorschau und vom vorhandenen Browser-I/O für Druck/PDF genutzt. Die bisherigen AP12-Abhängigkeitsgrenzen bleiben unverändert.

```text
index.html / DOM
  → ui-events → ui-controller → ui-bindings
  → application-actions → spezialisierte Action-/Workflowmodule
  → state-access → Commit/Persistenz

Fachresultate → Renderer
Dokumentdaten → Dokumentrenderer → browser-io/export-service
```

Abhängigkeiten werden in der Startphase explizit über `configure()` übergeben. Fachmodule greifen nicht auf DOM, Dialoge oder Browser-Speicher zu. `index.html` definiert die deterministische Scriptreihenfolge; `service-worker.js` enthält dieselbe vollständige App-Shell. Versteckte Funktionsaufrufe über 75 Übergangswrapper sind zentral in `app.js` registriert und in `AP12_LEGACY_KOMPATIBILITAET.md` dokumentiert.
