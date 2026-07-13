# NK-Pro – Architektur V99.4.14

## Laufzeit

NK-Pro bleibt eine statische, lokale HTML/CSS/JavaScript-PWA ohne Framework, TypeScript oder Buildsystem. `app.js` ist auf Start, Verdrahtung und zentrale Orchestrierung beschränkt. Zustand, Fachlogik, UI-Controller, Navigation, Browser-I/O, Dokumentdaten und Dokumentdarstellung bleiben modular getrennt.

## AP13-Dokumentarchitektur

- `document-data.js` bereitet ausschließlich fachliche Dokumentdaten und Preflight-Informationen auf.
- `document-renderer.js` erzeugt das vollständige Brief-HTML und das einzige zugehörige Basis-Stylesheet.
- `ui-documents.js` verwaltet Briefeditor, Mieterauswahl, Vorschau und Ganzseitenskalierung.
- `browser-io.js` beziehungsweise `printWindowHtml()` übernimmt das bereits gerenderte Dokument unverändert in den Druck-/PDF-Kontext.

Vorschau und Druck verwenden dieselbe `.nk-letter-document`-Struktur. Eine `.letter-sheet` besitzt immer 210 × 297 mm. Die Bildschirmdarstellung skaliert ausschließlich den Dokumentcontainer; es gibt kein alternatives responsives Briefreflow.

## Seiten- und Inhaltseigentum

Der Renderer entscheidet deterministisch zwischen einer und zwei Seiten. Seite 2 ist ausschließlich von Zusatzhinweis und/oder Vorauszahlungsanpassung abhängig. Fachliche Werte kommen weiterhin aus der bestehenden Abrechnungsberechnung; der Renderer berechnet keine alternative Abrechnung.

## Verbindliche Invarianten

- ein Root-State und zentrale Zustandszugriffe,
- 13 UI-Controller und 99 Aktionskennungen,
- Datenschema 5 und Datenebenenvertrag 1,
- Objektstandard 1 und Abrechnungssnapshot 2,
- alle Zählerstandards 1,
- AP11-Navigation mit vier Gruppen und 16 Zielseiten,
- Offline-App-Shell `nk-pro-v99-4-14`.
