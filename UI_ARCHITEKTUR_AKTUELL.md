# NK-Pro – UI-Architektur V99.4.17

```text
DOM-Ereignis → NKProUiEvents → NKProUiController → NKProUiBindings
             → Anwendungsaktion/Fachdienst → Commit → Renderer
```

13 Controller, 99 Aktionskennungen und fünf Ereignistypen bleiben verbindlich. `app.js` registriert Controller und Ereignisdelegation jeweils einmal, enthält aber keine UI-Implementierung. Alle 46 Renderer bleiben schreib-, persistenz-, navigations- und dialognebenwirkungsfrei.

## AP14-UI-System

- App-Schrift: `"Segoe UI", Arial, sans-serif`.
- Technische Protokolle: Monospace.
- Briefvorschau, Druck und PDF: isoliertes AP13-Dokumentmodell mit Arial.
- Zentrale Farbtokens: dunkles Navigationsblau, heller Arbeitsbereich, blaue Aktion/Fokusfarbe, ruhige Grau-/Blautöne für Flächen und Rahmen.
- Semantische Erfolgs-, Warn- und Fehlerfarben bleiben eigenständig.
- Der bestehende Kopfbereich enthält Hilfe und Menü; es gibt keine neue Hauptbereich-Tab-Leiste.

Die Hauptnavigation besitzt weiterhin vier Gruppen und nun 17 fachliche Ziele. `wasser` gehört ausschließlich zum objektbezogenen Zählerinventar-DUMMY. `verbraeuche` gehört ausschließlich zum Abrechnungsworkflow und rendert die bestehende Verbrauchserfassung. Beide Ziele teilen keine produktive Seitenstruktur und keine Speicherung.
