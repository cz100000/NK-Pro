# NK-Pro – UI-Architektur V99.4.17


Die Briefvorschau ist weiterhin Teil des Dokument-Controllers, zeigt aber nun ein vollständiges unverändertes A4-Dokument mit rein visueller Ganzseitenskalierung.

```text
DOM-Ereignis → NKProUiEvents → NKProUiController → NKProUiBindings
             → Anwendungsaktion/Fachdienst → Commit → Renderer
```

13 Controller, 99 Aktionskennungen und fünf Ereignistypen bleiben verbindlich. `app.js` registriert Controller und Ereignisdelegation jeweils einmal, enthält aber keine UI-Implementierung. Dialoge und Seitensteuerung sind spezialisierten UI-Modulen zugeordnet. Alle 46 Renderer sind schreib-, persistenz-, navigations- und dialognebenwirkungsfrei.

Die AP11-Navigation bleibt bei einer semantischen Hauptnavigation, vier Gruppen, 16 Zielen und 22 lokalen Icons. Der Einstellungen-Dummy bleibt deaktiviert und aktionslos.
