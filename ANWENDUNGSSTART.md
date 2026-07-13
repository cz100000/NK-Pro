# NK-Pro – Anwendungsstart V99.4.17

AP14 verändert die deterministische Startreihenfolge nicht. Die Kopfbereichssteuerung wird zusammen mit der vorhandenen Navigation initialisiert; es gibt keinen zusätzlichen Startpfad und keine neue Abhängigkeit.

| Nr. | Startschritt |
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
| 11 | Navigation einschließlich Hilfe/Menü initialisieren |
| 12 | Arbeitsbereiche schließen |
| 13 | Seitenköpfe aktualisieren |
| 14 | Übersichtskarten aktualisieren |
| 15 | Strukturprüfung |
| 16 | UI-Architekturprüfung |

`app-bootstrap.js` protokolliert die Schritte und verhindert Doppelstarts. Der Zustand wird vor zustandsabhängigen Modulen kontrolliert erzeugt. `app.js` bildet nur die letzte Startfehlergrenze.
