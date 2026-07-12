# NK-Pro – Roadmap

**Basis:** V99.4.9 vom 12. Juli 2026

## Abgeschlossen

- V99.4.1: kompakte ChatGPT-Arbeitsbasis und Referenzdatenstruktur.
- V99.4.2: verbindliche Datenebenen und Snapshot-Grenzen.
- V99.4.3: Modularisierung von Persistenz, Migration und Archiv.
- V99.4.4: Migrations-, Sicherungs-, Restore- und Rollback-Fundament.
- V99.4.5: Objektstandard 1 und unveränderlicher Abrechnungssnapshot.
- V99.4.6: getrennte Zählerstammdaten, Messwerte, Perioden, Zuordnungen, Wechsel und Snapshot 2.
- V99.4.7: Abrechnungsberechnung, Dokumentdaten, Rendering, Export, Tabellenhilfen, Start und Kompatibilität modularisiert.
- V99.4.9: native UI-Anbindung mit zentraler Ereignisdelegation, 13 Controllern, 99 Aktionen und kontrolliertem Zustandszugriff.

## Nächstes Arbeitspaket – AP8

- Stammdaten-, Kosten- und Workflow-Orchestrierung aus `app.js` weiter trennen,
- interne direkte `state`-Schreibzugriffe schrittweise durch Anwendungsaktionen ersetzen,
- verbleibende klassische Top-Level-Funktionen in explizite Module überführen,
- AP6-Kompatibilitätswrapper nur dort abbauen, wo keine internen oder Testabhängigkeiten mehr bestehen,
- jede Extraktion mit Referenz-, UI-, Restore-, Snapshot- und Exportregression absichern.

## Spätere Arbeitspakete

- Archiv-/Jahreswechsel-Orchestrierung weiter trennen,
- Qualitäts- und Diagnosefunktionen ausgliedern,
- globale Kompatibilitätsschicht schrittweise verkleinern,
- AP11: verbindliches Navigationsdesign, Icons, Farben, Typografie, Abstände und Responsivität umsetzen,
- allgemeine Bedienbarkeit und Optik erst auf der stabilisierten Architektur verbessern.

## Nach V99.4.9

- Die Anwendungsschicht ist als kontrollierte Eintrittsgrenze vorhanden.
- AP9 kann verbleibende Orchestrierungsgruppen schrittweise physisch aus `app.js` extrahieren.
- AP11 bleibt unverändert für Navigationsstruktur und visuelles Grundsystem reserviert.
