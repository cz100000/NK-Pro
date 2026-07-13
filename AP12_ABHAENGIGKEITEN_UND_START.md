# AP12 – Abhängigkeiten und Startreihenfolge

## Hauptrichtung

```text
DOM → ui-events → ui-controller/ui-bindings → application-actions
    → Fach-/Workflowmodule → state-access → Commit/Persistenz

Renderer ← State/Fachresultat
Dialoge/Seitensteuerung → UI-Controller → Anwendungsaktion
Browserdatei/Druck/Download → browser-io/export-service
```

Fachmodule erhalten Abhängigkeiten explizit über `configure()`. Es wurden keine ES-Module, kein Bundler, kein Framework und kein Dependency-Injection-System eingeführt. Die statische Ladefolge in `index.html` und die Offline-App-Shell in `service-worker.js` enthalten alle 50 JavaScript-Einheiten in deterministischer Reihenfolge.

## Startreihenfolge

| Nr. | Schritt |
|---|---|
| 1 | Kernmodule konfigurieren |
| 2 | Arbeitszustand laden |
| 3 | Zustandszugriff konfigurieren |
| 4 | Anwendungsaktionen konfigurieren |
| 5 | Navigation konfigurieren |
| 6 | UI-Controller registrieren |
| 7 | UI-Ereignisse registrieren |
| 8 | Kompatibilität registrieren |
| 9 | Arbeitsstand vorbereiten |
| 10 | Erste Darstellung |
| 11 | Navigation initialisieren |
| 12 | Arbeitsbereiche schließen |
| 13 | Seitenköpfe aktualisieren |
| 14 | Übersichtskarten aktualisieren |
| 15 | Strukturprüfung |
| 16 | UI-Architekturprüfung |


`app-bootstrap.js` verhindert unkontrollierte Mehrfachinitialisierung und protokolliert jeden Schritt. Controllerregistrierung und Ereignisdelegation erfolgen genau einmal. Die letzte Fehlergrenze in `app.js` zeigt einen Startfehler an, verschluckt aber keine fachlichen Einzelfehler.

## Browsergrenzen

Direkte Browser-Ein-/Ausgabe liegt in `browser-io.js`, `export-service.js`, `persistence.js`, `ui-preferences.js`, `service-worker-register.js` und klar begrenzten UI-Modulen. Archiv-, Jahreswechsel-, Qualitäts- und Berechnungsmodule bleiben ohne direkte Browser-Speicher- oder DOM-Verantwortung.
