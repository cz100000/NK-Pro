# Abhängigkeitsübersicht V99.4.9

## AP7-Hauptrichtung

```text
DOM → ui-events → ui-controller → ui-bindings → app/Fachdienste
                                              ├→ AP5-Zählermodule
                                              ├→ AP6-Berechnung/Dokument/Export
                                              └→ Persistenz/Recovery
```

Rückabhängigkeiten von Fachmodulen auf DOM, Controller oder Renderer sind unzulässig.

## Zulässige Hauptrichtung

```text
DOM / Benutzeraktion
        │
        ▼
app.js / navigation.js / ui-table-tools.js
        │
        ├──────────────► billing-calculation.js
        │                         │
        │                         ├────► AP5-Zählermodule
        │                         └────► bestehende Stammdaten-/Hilfsfunktionen
        │
        ├──────────────► document-data.js
        │                         │
        │                         └────► zentrale Berechnungsergebnisse
        │
        ├──────────────► document-renderer.js
        │                         └────► document-data.js / Berechnungsergebnis
        │
        ├──────────────► export-service.js
        │
        ├──────────────► persistence.js / migration.js / backup-recovery.js / archive.js
        │
        └──────────────► app-bootstrap.js / compatibility.js / ui-preferences.js
```

## Produktive Ladefolge

Die Module werden in `index.html` in folgender Reihenfolge geladen:

1. UI-Präferenzadapter,
2. Navigation und Modalereignisse,
3. Persistenz, Migration, Backup/Restore,
4. Zähler- und Objektmodule,
5. Snapshot und Archiv,
6. Berechnung, Dokumentdaten, Dokumentrenderer, Export und Tabellenhilfen,
7. Bootstrap und Kompatibilitätsregistry,
8. Seed,
9. `app.js`,
10. Service-Worker-Registrierung.

Alle von `app.js` benötigten Schnittstellen sind daher vor dessen Ausführung verfügbar.

## Zirkularität

Die neuen Dateien referenzieren keine Scriptdateien und importieren einander nicht dynamisch. Die Übergangskompatibilität nutzt denselben klassischen globalen Laufzeitkontext. Dadurch gibt es keine zyklische Ladeabhängigkeit; fachliche Restkopplung über globale Bindungen ist als technische Altlast dokumentiert.
