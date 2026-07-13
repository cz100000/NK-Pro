# AP12 – Renderer, Dialoge und Seitensteuerung

## Renderer

Es wurden 46 Renderer inventarisiert. Keiner mutiert Fachzustand, persistiert, navigiert oder öffnet einen Dialog als Rendernebeneffekt. Das Einzelinventar steht in `AP12_RENDERER_INVENTAR.json`.

## Dialogzuordnung

| Dialog/Ablauf | Eigentümermodul | Öffner/Schließer | Speicherung/Validierung |
|---|---|---|---|
| Risikobehaftete Datenaktion | app-state-persistence.js | zentraler UI-Aktionspfad | Bestätigung vor Commit/Restore |
| Kostenpreis | ui-master-data.js | Kosten-/Stammdatenaktionen | Validierung und Commit über Aktionspfad |
| Kostenauswahl/-information | ui-costs.js | Kostencontroller | kontrollierte Auswahl/Änderung |
| Abrechnung erstellen/löschen | ui-navigation-pages.js | Navigations-/Abrechnungscontroller | Bestätigung, Validierung, Fachaktion |
| Qualitäts-/Abschlussbericht | ui-quality.js | Qualitätscontroller | reine Prüfung/Anzeige |
| Archivöffnung/-dokument | ui-archive-pages.js | Archivcontroller | Archivaktion bzw. read-only Viewer |
| Brief-/Druckbestätigung | ui-documents.js + browser-io.js | Dokumentcontroller | Preflight, anschließend Browseradapter |
| Releaseaudit | ui-diagnostics.js | Diagnosecontroller | read-only Bericht |


Fokus-, Escape- und Hintergrundverhalten bleiben in der vorhandenen Modal-/Ereignisarchitektur; es wurde keine zweite Dialogarchitektur eingeführt.

## Seiten- und Navigationssteuerung

- Maßgebliche aktive Seite bleibt die vorhandene Navigation über `navigation.switchTab` und `section.tab.active`.
- `ui-navigation-pages.js` steuert Abrechnungskontext und Seitenwechsel; `ui-page-controller.js` erzeugt Seitenköpfe, Übersichten und Seitendarstellung.
- Navigation erzeugt keine Fachmutation und keine Persistenz.
- Die AP11-Struktur bleibt unverändert: vier Gruppen, 16 Ziele, 22 lokale SVG-Icons, deaktivierter Einstellungen-Dummy.
- Zentrale Ereignisdelegation bleibt alleiniger produktiver Ereignispfad; keine Inline-Handler und keine doppelten Listener.
