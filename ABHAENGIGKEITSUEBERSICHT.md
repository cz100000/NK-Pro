# NK-Pro – Abhängigkeitsübersicht V99.4.18

AP14 ergänzt keine externe Laufzeitabhängigkeit. Icons bleiben lokales SVG-Markup, die Schriftfamilien sind Systemschriften und der Zähler-DUMMY nutzt vorhandene Tabellenwerkzeuge.

```text
DOM → ui-events → ui-controller → ui-bindings → Actions/Fachdienste → State/Commit
Navigation → ui-navigation-pages → ui-page-controller → spezialisierte Renderer
Dokumentdaten → Dokumentrenderer → browser-io/export-service
```

Fachmodule greifen nicht auf DOM, Dialoge oder Browser-Speicher zu. `index.html` und `service-worker.js` enthalten dieselbe vollständige App-Shell.
