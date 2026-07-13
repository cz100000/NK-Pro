# AP10 – Prüfbericht

## Ausgangsprüfung

V99.4.10 wurde mit Syntax-, Fixture-, Zähler-, AP6–AP9-Architektur-, Browser- und PWA-Prüfungen als konsistente Grundlage bestätigt. Die Ausgangsmetriken wurden mit `tools/analyze-app-js.cjs` neu erzeugt und nicht aus der Aufgabenbeschreibung übernommen.

## AP10-spezifische Prüfungen

- 79 alte Funktionsdeklarationen fehlen physisch in `app.js`.
- Vier neue Modul-APIs sind eingefroren und vor `app.js` geladen.
- Archiv-/Jahreswechselmodule enthalten weder DOM-, Dialog-, Navigations- noch Browser-Speicherzugriffe.
- Qualitäts-/Diagnoseläufe verändern Zustand, LocalStorage und Renderzähler nicht.
- Erfolgreiche Archiv-/Jahreswechselaktionen: genau ein Commit, null Modulrenderings.
- Fehlgeschlagener Archivimport und Jahreswechsel: null Commit, vollständiger State- und Speicherrollback.
- Bestehende Archive bleiben nach `periodId` bytegleich; ein neues Vorjahr wird nur ergänzt.
- Stromzähler-Dummy und unbekannte Felder bleiben erhalten.

## Browserumgebung

System-Chromium `/usr/bin/chromium` wird über `CHROMIUM_EXECUTABLE_PATH` verwendet. Alle zehn Playwright-Projekte wurden jeweils mit einem Worker in einem frischen Prozess ausgeführt; damit bestanden 46 von 46 Browserfällen. Ein gemeinsamer Prozess über sämtliche Projekte blieb in dieser Containerumgebung sporadisch beim Projektwechsel beziehungsweise Chromium-Teardown hängen, ohne dass eine Assertion fehlschlug. Dieser kombinierte Lauf wird nicht als erfolgreich ausgewiesen; maßgeblich sind die vollständig bestandenen Einzelprojektläufe.

## Endmetriken

`app.js`: 6.292 Zeilen, 382.309 Byte, 518 Top-Level-Funktionen, 306 direkte Zustandsreferenzen und 96 direkte Schreibstellen.


## Browserergebnisse

| Projekt | Ergebnis |
|---|---:|
| App-Smoke | 9/9 |
| Dokument/Export | 2/2 |
| Migration/Restore | 6/6 |
| Modulgrenzen | 1/1 |
| UI-Controller/Ereignisse | 2/2 |
| Objekt/Snapshot | 9/9 |
| Persistenz/Backup | 5/5 |
| Referenzfälle | 6/6 |
| Service Worker | 1/1 |
| AP10-Orchestrierung | 5/5 |
| **Summe** | **46/46** |


## Prüfung aus frischer Entpackung

Die Kandidaten-ZIP wurde in ein leeres Verzeichnis entpackt und dort mit `npm ci` neu installiert. Anschließend bestanden erneut: 36 Syntaxprüfungen, sechs Referenzfixtures, Zählerstandard, AP6–AP10-Architektur, Release- und Prüfsummenkonsistenz sowie sämtliche 46 Browserfälle in zehn isolierten Playwright-Projektläufen.
