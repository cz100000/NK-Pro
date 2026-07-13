# UI-Controller V99.4.13

NK-Pro registriert 13 Controller mit 99 eindeutigen Aktionskennungen. AP12 verändert weder Kennungen noch zentrale Ereignisdelegation. `app.js` registriert die Controller genau einmal; Implementierungen liegen in `ui-bindings.js` und den spezialisierten `ui-*.js`-Modulen.

Dialog-, Seiten-, Tabellen-, Zähler-, Dokument-, Archiv-, Qualitäts- und Kostenvorgänge sind klar zugeordnet. Renderer führen keine Fachmutation aus. Der Einstellungen-Dummy besitzt weiterhin keine Aktionskennung.
