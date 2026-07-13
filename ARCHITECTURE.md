# NK-Pro – Architekturstand V99.4.12

**Datenschema:** 5 · **Datenebenenvertrag:** 1 · **Objektstandard:** 1 · **Zählerstandards:** 1 · **Abrechnungssnapshot:** 2

## Laufzeit

NK-Pro läuft ohne Framework und Buildschritt als lokale HTML/CSS/JavaScript-PWA. Produktive Daten verbleiben im Browser oder in explizit exportierten Dateien.

## Schichten

1. **Markup, Navigation und UI:** `index.html`, `assets/app.css`, `navigation.js`, `ui-events.js`, `ui-controller.js`, `ui-bindings.js`.
2. **Anwendungsaktionen:** `application-actions.js`, `master-data-actions.js`, `cost-actions.js`, `billing-workflow.js`, `archive-actions.js`, `year-transition-actions.js`.
3. **Fach- und Prüfmodule:** Berechnung, Zähler, Objektstandard, Snapshot, Qualität und Diagnose.
4. **Dokument und Export:** `document-data.js`, `document-renderer.js`, `export-service.js`.
5. **Persistenz und Lebenszyklus:** `persistence.js`, `migration.js`, `backup-recovery.js`, `archive.js`.
6. **Start und Kompatibilität:** `app-bootstrap.js`, `compatibility.js`, `app.js`.

## AP11-Navigationsgrenze

```text
Button/data-ui-action → zentrale Ereignisdelegation → navigation.switchTab
                      → bestehender Tabwechsel → sichtbare section.tab.active
                      → navigation.ensureNavigationPath → aria-current + Gruppenpfad
```

`index.html` enthält genau eine produktive semantische Hauptnavigation. `navigation.js` darf ausschließlich UI-Zustände wie geöffnetes Menü, Drawer und aktiven Pfad koordinieren. Es schreibt keine Abrechnungs-, Archiv-, Snapshot-, Kosten- oder Zählerdaten. Nicht fachliche Präferenzen laufen über `ui-preferences.js`; direkte Fachpersistenz bleibt `persistence.js` vorbehalten.

## Ereignisse und Zustand

Die zentrale Ereignisdelegation mit 13 UI-Controllern und 99 Aktionskennungen bleibt bestehen. `app.js` registriert keine DOM-Ereignisse. `state` bleibt der einzige Arbeitszustand; Renderer persistieren nicht.

## AP10-Grenzen

79 Archiv-, Jahreswechsel-, Qualitäts- und Diagnoseimplementierungen bleiben physisch in ihren Modulen. Schreibende Abläufe verwenden atomare Transaktionen; Qualitäts- und Diagnoseprüfungen arbeiten seiteneffektfrei.

## Dokument-/Druckgrenze

AP11 verändert die Dokumentarchitektur nicht. Briefdaten, HTML-Renderer und Drucksteuerung bleiben getrennt; die gestalterische Vereinheitlichung von Vorschau und Druck ist AP13.

## PWA

`service-worker.js` cached die vollständige statische App-Shell unter `nk-pro-v99-4-12`. Die AP11-Icons sind Inline-SVGs und benötigen keine zusätzlichen Netzressourcen.

## Verbleibende Grenze

`app.js` bleibt mit 6.294 Zeilen ein großer Orchestrierungs- und Legacy-Kontext. AP12 adressiert Restentkopplung und globale Zustandsbereinigung.
