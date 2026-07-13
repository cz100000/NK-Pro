# AP10 – Archivdatenfluss

## Abgrenzung

`archive-actions.js` koordiniert allgemeine Archive. `archive.js` bleibt Fachgrundlage für Projektion und Legacybehandlung; `backup-recovery.js` bleibt allein für Sicherung/Restore/Rollback; `billing-snapshot.js` bleibt alleinige Snapshotgrundlage; normale Exportdateien und Recovery-Checkpoints sind keine Archive.

## Schreibende Abläufe

- **Archivieren:** vorhandenen Snapshot über `NKProBillingWorkflow.createSnapshot()` erzeugen, über `NKProArchive` vorbereiten/validieren, nach `periodId` atomar einfügen oder ersetzen, Arbeitsstand schließen, ein Commit.
- **Import:** alle Datensätze zuerst im selben Transaktionskontext vorbereiten und validieren; ein Fehler rollt zuvor eingefügte Importteile vollständig zurück.
- **Löschen:** UI bestätigt Risiko und Code; Modul entfernt genau einen zulässigen Archivdatensatz atomar.
- **Wiederbearbeitung:** Archivdaten werden geklont und normalisiert; aktuelles Jahresarchiv, Stammdaten, Zählerhistorie und unbekannte operative Metadaten bleiben erhalten; kein Archivdatensatz wird verändert.

## Lesende Abläufe

Auflisten, Status, Saldo, Gesundheitsprüfung, Nur-Ansicht, Dokument- und Exportzugriffe verändern weder Archiv noch Snapshot. `legacy-partial` und unbekannte optionale Felder bleiben erhalten.
