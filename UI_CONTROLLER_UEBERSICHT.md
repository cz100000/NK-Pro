# NK-Pro – UI-Controllerübersicht V99.4.14


Die Zahl der Controller und Aktionen bleibt 13 beziehungsweise 99. AP13 verwendet die vorhandenen Dokumentaktionen und ergänzt keine Parallelsteuerung.

NK-Pro registriert 13 Controller mit 99 eindeutigen Aktionskennungen. AP12 verändert weder Kennungen noch zentrale Ereignisdelegation. `app.js` registriert die Controller genau einmal; Implementierungen liegen in `ui-bindings.js` und den spezialisierten `ui-*.js`-Modulen.

Dialog-, Seiten-, Tabellen-, Zähler-, Dokument-, Archiv-, Qualitäts- und Kostenvorgänge sind klar zugeordnet. Renderer führen keine Fachmutation aus. Der Einstellungen-Dummy besitzt weiterhin keine Aktionskennung.
