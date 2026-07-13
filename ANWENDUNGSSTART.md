<!-- AP9-CURRENT -->
# Anwendungsstart V99.4.10

Vor Registrierung der UI-Controller konfiguriert `app.js` zuerst `NKProStateAccess`, danach die drei Kernorchestrierungsmodule und anschließend `NKProApplicationActions`. Die statische Ladefolge in `index.html` und die App-Shell-Reihenfolge im Service Worker enthalten alle neuen Module vor `app.js`.

# Anwendungsstart und Orchestrierung V99.4.9

## Startdienst

`js/app-bootstrap.js` stellt `NKProAppBootstrap.start(steps, options)` bereit. Der Dienst kennt keine Fachmodule und keinen DOM. Er führt ausschließlich benannte Schritte in fester Reihenfolge aus und bricht bei einem Fehler kontrolliert ab.

## Startschritte

| Reihenfolge | Schritt | Verantwortung |
|---:|---|---|
| 1 | Zustandszugriff konfigurieren | bestehenden Einzelzustand an `NKProStateAccess` anbinden |
| 2 | Navigation konfigurieren | Datenprovider und UI-Callbacks für `NKProNavigation` setzen |
| 3 | UI-Controller registrieren | 13 Controller und 99 Aktionen einmalig registrieren |
| 4 | UI-Ereignisse registrieren | fünf delegierte Ereignisarten einmalig aktivieren |
| 5 | Arbeitsstand vorbereiten | Normalisierung und persistenzfähiger Zustand |
| 6 | Erste Darstellung | aktiven Arbeitsbereich rendern |
| 7 | Navigation initialisieren | bestehende Navigationsstruktur aktivieren |
| 8 | Arbeitsbereiche schließen | vorhandene Details-Elemente initial vereinheitlichen |
| 9 | Seitenköpfe aktualisieren | Status und Periodeninformation darstellen |
| 10 | Übersichtskarten aktualisieren | deklarative Schnellaktionen rendern |
| 11 | Strukturprüfung | DOM- und Navigationsstruktur auditieren |
| 12 | UI-Architekturprüfung | Controller-, Ereignis-, Zustands- und Kompatibilitätsstatus veröffentlichen |

`window.__NKPRO_STARTUP__` enthält den vollständigen Startstatus. `window.__NKPRO_UI_ARCHITECTURE__` enthält die schreibgeschützte Laufzeitbeschreibung der UI-Architektur.

## Reihenfolgeregeln

- State-Adapter, Navigation, Controller und Ereignisse werden vor dem ersten Rendern konfiguriert.
- Ereignisregistrierung ist idempotent und erzeugt keine doppelten Listener.
- Fachmodule werden vor `app.js` geladen.
- Bei einem Startfehler wird kein nachfolgender Schritt ausgeführt.
- Die Fehleranzeige verwendet den bestehenden Fallbackpfad.
