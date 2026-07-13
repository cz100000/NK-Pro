# NK-Pro – Verantwortlichkeitsmatrix V99.4.17

| Verantwortung | Eigentümer | Nicht zuständig |
|---|---|---|
| Anwendungsstart | `app.js` / `app-bootstrap.js` | Fachlogik, DOM-Renderer |
| Root-State / Commit | `app-state-persistence.js`, `state-access.js` | DUMMY, Navigation |
| Navigation und Kopfpanels | `navigation.js`, `ui-navigation-pages.js` | Fachmutation |
| Seitendefinitionen | `ui-page-controller.js` | Persistenz |
| Verbrauchserfassung | `ui-metering.js` und Zählermodule | Zählerinventar-DUMMY |
| Zählerinventar-DUMMY | `index.html` und AP14-CSS | Speicherung, Berechnung |
| Dokumente | AP13-Dokumentmodule | App-Farbsystem |
| Browser-I/O / PWA | `browser-io.js`, `export-service.js`, Service Worker | Fachzustand |
