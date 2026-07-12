# Anwendungsstart und Orchestrierung V99.4.7

## Startdienst

`js/app-bootstrap.js` stellt `NKProAppBootstrap.start(steps, options)` bereit. Der Dienst kennt keine Fachmodule und keinen DOM. Er führt ausschließlich übergebene Schritte der Reihe nach aus.

## Startschritte

| Reihenfolge | Schritt | Verantwortung |
|---:|---|---|
| 1 | Arbeitsstand vorbereiten | Normalisierung und persistenzfähiger Zustand |
| 2 | Erste Darstellung | aktiven Arbeitsbereich rendern |
| 3 | Navigation initialisieren | Modus und sichtbare Navigation setzen |
| 4 | Arbeitsbereiche schließen | konsistenter initialer Klappzustand |
| 5 | Seitenköpfe aktualisieren | Periode und Schreibstatus anzeigen |
| 6 | Übersichtskarten aktualisieren | Status- und Aktionskarten erzeugen |
| 7 | Strukturprüfung | verbindliche Seitenstruktur prüfen |

## Fehlerpfad

Bei einem Fehler:

1. werden bereits abgeschlossene Schritte festgehalten,
2. wird der Startfehler in `renderErrors` eingetragen,
3. wird der Fehler protokolliert,
4. wird als Rückfall die Systemmeldung gerendert,
5. wird ein strukturierter Ergebnisdatensatz zurückgegeben.

Das Ergebnis ist unter `window.__NKPRO_STARTUP__` verfügbar.

## Service Worker

Die Service-Worker-Registrierung bleibt nach `app.js` in `service-worker-register.js`. Der App-Shell enthält alle neuen Produktivmodule und verwendet den Cache `nk-pro-v99-4-7`.
