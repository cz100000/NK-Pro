# NK-Pro – Architektur V99.4.18

## Schichten und Einstieg

`index.html` lädt das zentrale Stylesheet, die produktiven JavaScript-Module in deterministischer Reihenfolge, `js/app.js` als schlanken Anwendungsstart und danach die Service-Worker-Registrierung. Fachzustand, Persistenz, Migration, Archiv, Anwendungsaktionen, UI-Controller und Dokumentdarstellung bleiben modular getrennt.

## Zustands- und Bedienfluss

`js/ui-navigation-pages.js` steuert Seitenwechsel und zentrale Kontextgrenzen. AP15 ergänzt `resetTransientUiState()`. Die Funktion schließt offene Dialoge und Kopfbereichspanels, korrigiert ARIA-Zustände und stößt den fachlich neutralen Kosten-UI-Reset an. `js/ui-costs.js` setzt ausschließlich Such-, Auswahl-, Paging- und Dialogzustände der Kostenoberfläche zurück.

Import, Restore und Rollback verwenden denselben bereinigten Rückkehrpfad zur Startseite. Fachzustände und Datenbestände werden dadurch nicht verworfen.

## Daten und Persistenz

Datenschema 5, Datenebenenvertrag 1, Objektstandard 1 und Abrechnungssnapshot 2 bleiben unverändert. Migration, Sicherung, Restore, Rollback, Recovery, Archivierung und Import/Export behalten ihre vorhandenen Module und Kompatibilitätsgrenzen.

## Dokumentmodell

`document-data.js`, `document-renderer.js`, `ui-documents.js` und `browser-io.js` bilden weiterhin das gemeinsame DIN-A4-Modell. Vorschau, Druck und Dokumentausgabe verwenden dieselbe `.nk-letter-document`-Struktur und Arial. AP15 ändert das AP13-Layout nicht.

## PWA

Der Service Worker verwendet `nk-pro-v99-4-18-ap15`. Die Aktivierung entfernt ausschließlich ältere Caches mit dem Prefix `nk-pro-`. Laufzeitcaching gilt nur für erfolgreiche Same-Origin-GET-Antworten. Navigationsanfragen erhalten offline `index.html`; fehlende sonstige Ressourcen werden nicht fälschlich als HTML beantwortet.

## Releasegrenze

Die technische Arbeits-ZIP enthält produktiven Code, tatsächlich verwendete Ressourcen, aktuelle Tests und aktuelle Dokumentation. Historische Screenshots, Kontrollausgaben, alte AP-Berichte, Browserprofile, installierte Abhängigkeiten und generierte Reports liegen außerhalb dieser Grenze.
