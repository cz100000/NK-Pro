# Verantwortlichkeitsmatrix V99.4.13

| Verantwortung | Eigentümer | Nicht zuständig |
|---|---|---|
| Anwendungsstart | `app.js` / `app-bootstrap.js` | Fachlogik, DOM-Renderer, Persistenzimplementierung |
| Root-State | `app-state-persistence.js` | Renderer, Navigation |
| Commit/Transaktion | `state-access.js` und konfigurierte Actions | freie UI-Schreibzugriffe |
| Ereignisse | `ui-events.js` / 13 Controller | Inline-Handler, `app.js`-Listener |
| Navigation/Seiten | `navigation.js`, `ui-navigation-pages.js`, `ui-page-controller.js` | Fachmutation |
| Dialoge | jeweiliges spezialisiertes UI-Modul | Renderer-Nebeneffekt |
| Berechnung | `billing-calculation.js` und Zählermodule | UI-/Browserzugriff |
| Dokumente | `document-data.js`, `document-renderer.js`, `ui-documents.js` | Persistenzlogik |
| Browser-I/O | `browser-io.js`, `export-service.js`, Persistenzadapter | Fachmodule |
| PWA | Service Worker und Registermodul | Fachzustand |
