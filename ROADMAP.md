# NK-Pro – Roadmap

**Basis:** V99.4.6 vom 12. Juli 2026

## Abgeschlossen

- V99.4.1: kompakte ChatGPT-Arbeitsbasis und Referenzdatenstruktur.
- V99.4.2: verbindliche Datenebenen und Snapshot-Grenzen.
- V99.4.3: Modularisierung von Persistenz, Migration und Archiv.
- V99.4.4: Migrations-, Sicherungs-, Restore- und Rollback-Fundament.
- V99.4.5: Objektstandard 1 und unveränderlicher Abrechnungssnapshot 1.
- V99.4.6: getrennte Zählerstammdaten, Messwerte, Messperioden, zeitabhängige Zuordnungen, Zählerwechsel und Snapshot 2.

## Nächste Arbeitspakete

### AP6 – Native Zähler- und Messwertverwaltung

- Formulare direkt an `zaehlerDaten` anbinden,
- Stammdaten- und Messwerterfassung sichtbar trennen,
- Zählerwechsel, Korrektur, Storno und Schätzung bedienbar machen,
- zentrale Validierungsfehler im bestehenden UI-Konzept darstellen,
- Legacy-Adapter schrittweise auf reine Importkompatibilität reduzieren.

### Danach

- fachliche Kosten- und Verteilungsregeln weiter modularisieren,
- nachvollziehbare Abrechnungsfreigabe und Abschlussworkflow ergänzen,
- Export-/Druckpipeline gegen Snapshot 2 vereinheitlichen,
- technische Schulden im verbleibenden monolithischen `app.js` abbauen.

## Unveränderte Leitplanken

Kein Frameworkwechsel, kein Buildsystem und keine allgemeinen UI-Redesigns ohne eigenes Arbeitspaket. Datenmigrationen bleiben sicherungs-, validierungs- und rollbackpflichtig.
