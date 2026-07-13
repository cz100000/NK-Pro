# NK-Pro – Architektur V99.4.17

## Laufzeit

NK-Pro bleibt eine statische, lokale HTML/CSS/JavaScript-PWA ohne Framework, TypeScript oder Buildsystem. `app.js` ist auf Start, Verdrahtung und zentrale Orchestrierung beschränkt. Zustand, Fachlogik, UI-Controller, Navigation, Browser-I/O und Dokumentdarstellung bleiben modular getrennt.

## AP14-UI- und Navigationsarchitektur

- `navigation.js` besitzt die Gruppenzuordnung und die zustandsfreie Hilfe-/Menüsteuerung.
- `ui-navigation-pages.js` steuert Start- und Abrechnungsmodus.
- `ui-page-controller.js` ordnet `wasser` dem statischen DUMMY und `verbraeuche` dem bestehenden Verbrauchsrenderer zu.
- `ui-metering.js` bleibt Eigentümer der produktiven Verbrauchsdarstellung und verändert keine Fachlogik.
- `assets/app.css` enthält das zentrale App-Farb- und Schriftsystem; Dokument-CSS bleibt separat.

## AP13-Dokumentarchitektur

`document-data.js`, `document-renderer.js`, `ui-documents.js` und `browser-io.js` bilden weiterhin das gemeinsame DIN-A4-Modell. Vorschau, Druck und PDF verwenden dieselbe `.nk-letter-document`-Struktur und Arial. AP14 greift nicht in diese Kette ein.

## Verbindliche Invarianten

- ein Root-State und zentrale Zustandszugriffe,
- 13 UI-Controller und 99 Aktionskennungen,
- Datenschema 5 und Datenebenenvertrag 1,
- Objektstandard 1 und Abrechnungssnapshot 2,
- alle Zählerstandards 1,
- vier Navigationsgruppen und 17 fachliche Zielseiten,
- Zählerinventar-DUMMY ohne Persistenz,
- Offline-App-Shell `nk-pro-v99-4-17-ap14`.
