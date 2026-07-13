# AP15 – Gesamtintegration, Releasehärtung und schlanke Arbeitsbasis

## Ziel und Ergebnis

AP15 führt keine neue größere Fachfunktion ein. Der Abschlussstand AP14 V99.4.17 wurde als alleinige technische Basis geprüft und zu NK-Pro V99.4.18 gehärtet.

## Umgesetzte Integrationskorrekturen

1. **Zentrale transiente UI-Bereinigung:** Seiten- und Projektkontextwechsel schließen Dialoge, Kopfmenüs und rein visuelle Kosten-Auswahlzustände. ARIA-Zustände und Body-Klassen werden konsistent zurückgesetzt.
2. **Bereinigter Rückkehrpfad:** Import, Restore und Rollback führen nach erfolgreicher Übernahme zur Startseite und entfernen veraltete UI-Reste des vorherigen Kontexts.
3. **PWA-Cachehärtung:** Nur ältere NK-Pro-Caches werden gelöscht. Fremde Origin-Caches bleiben unangetastet. Nur erfolgreiche Same-Origin-GET-Antworten werden gecacht.
4. **Offlinefallback:** Navigation wird offline aus der App-Shell bedient. Fehlende Nicht-Navigationsressourcen erhalten keine irreführende HTML-Antwort.
5. **Reproduzierbare Browserfreigabe:** Playwright läuft seriell. Der zuvor unter Parallelisierung ressourcenabhängige Gesamtlauf ist damit stabil ausführbar.
6. **Schlanke Arbeitsbasis:** Historische AP-Nachweise und generierte Artefakte wurden erst nach Referenzprüfung entfernt. Das für einen aktuellen Test direkt benötigte `AP9_BASELINE_INVENTORY.json` bleibt erhalten.

## Unveränderte Verträge

- Datenschema 5
- Datenebenenvertrag 1
- Objektstandard 1
- Abrechnungssnapshot 2
- Dokumentlayout 4
- UI-Visualsystem 1
- Zählerseite bleibt DUMMY
- Verbrauchserfassung bleibt produktiv

## Technische Releaseprüfung

`npm run release:check` verbindet Syntax-, Fixture-, Fach-, Architektur-, Inhalts-, Konsistenz- und Browserprüfungen. `tools/check-release-contents.cjs` erkennt unerwünschte Releaseartefakte kontrolliert und löscht keine Dateien.
