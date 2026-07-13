# NK-Pro – Roadmap

**Basis:** V99.4.10 vom 13. Juli 2026

## Abgeschlossen

- V99.4.1–V99.4.5: Arbeitsbasis, Datenebenen, Persistenz/Migration/Recovery, Objektstandard und Snapshotfundament.
- V99.4.6: Zählerstammdaten, Messwerte, Perioden, Zuordnungen und Wechsel.
- V99.4.7: Berechnung, Dokumentdaten, Rendering, Export, Tabellenhilfen, Start und Kompatibilität modularisiert.
- V99.4.8/V99.4.9: native UI-Anbindung, zentrale Ereignisdelegation, 13 Controller, 99 Aktionen und Anwendungsschicht.
- V99.4.10 / AP9: 32 Kernimplementierungen physisch ausgelagert, 28 Übergangsweiterleitungen entfernt, atomare Anwendungsaktionen und der direkte Snapshotpfad etabliert.

## AP10 – nächstes Arbeitspaket

- allgemeine Archiv- und Jahreswechselorchestrierung physisch aus `app.js` extrahieren,
- Qualitäts- und Diagnoseorchestrierung trennen,
- verbleibende direkte Zustandsmutationen dieser Bereiche über kontrollierte Aktionen führen,
- weitere AP6-Kompatibilitätswrapper nur nach vollständiger Abhängigkeitsprüfung abbauen,
- Referenz-, Restore-, Snapshot-, Dokument-, Export-, Browser- und PWA-Regression fortführen.

## AP11 – verbindlich reserviert

- Navigationsstruktur und visuelles Grundsystem nach dem festgelegten Referenzbild,
- Icons, Farben, Typografie, Hintergründe, Abstände, Gruppenlogik, Zustände und Responsivität,
- keine Vermischung mit AP10-Architekturarbeiten.

## Danach

- verbleibende Renderer-/Dokument-UI-Orchestrierung weiter trennen,
- globale Kompatibilität schrittweise reduzieren,
- Bedienbarkeit und visuelle Konsistenz auf der stabilisierten Architektur ausbauen.
