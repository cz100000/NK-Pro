# NK-Pro – Roadmap

**Basis:** V99.4.7 vom 12. Juli 2026

## Abgeschlossen

- V99.4.1: kompakte ChatGPT-Arbeitsbasis und Referenzdatenstruktur.
- V99.4.2: verbindliche Datenebenen und Snapshot-Grenzen.
- V99.4.3: Modularisierung von Persistenz, Migration und Archiv.
- V99.4.4: Migrations-, Sicherungs-, Restore- und Rollback-Fundament.
- V99.4.5: Objektstandard 1 und unveränderlicher Abrechnungssnapshot.
- V99.4.6: getrennte Zählerstammdaten, Messwerte, Messperioden, Zuordnungen, Wechsel und Snapshot 2.
- V99.4.7: weitere fachliche Modularisierung von Berechnung, Dokumentdaten, Brief-HTML, Export, Tabellenhilfen, UI-Präferenzen, Start und Kompatibilität.

## Nächstes Arbeitspaket

### Native UI-Anbindung an die modularisierten Dienste

- Zähler- und Messwertformulare direkt an die AP5-Fachmodule anbinden,
- UI-Controller schrittweise aus `app.js` ausgliedern,
- globalen Laufzeitkontext durch explizite Kontext- oder Controller-Schnittstellen reduzieren,
- Inline-Handler und verbleibende globale Aufrufe abbauen,
- Dokument- und Exportaktionen direkt gegen definierte View-Modelle ausführen,
- jede weitere Extraktion mit Referenz-, UI- und Kompatibilitätstests absichern.

## Danach

- Stammdaten- und Mietverhältnisverwaltung modularisieren,
- Archiv-/Jahreswechsel-Orchestrierung trennen,
- Qualitäts- und Diagnosefunktionen ausgliedern,
- globale Kompatibilitätsschicht schrittweise verkleinern,
- Bedienbarkeit und Optik auf der stabilisierten Architektur verbessern.
