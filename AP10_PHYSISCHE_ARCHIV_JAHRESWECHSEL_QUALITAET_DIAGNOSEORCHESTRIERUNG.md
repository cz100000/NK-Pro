# NK-Pro V99.4.11 – AP10: Physisch extrahierte Archiv-, Jahreswechsel-, Qualitäts- und Diagnoseorchestrierung

## Ergebnis

AP10 verlagert 79 Implementierungen tatsächlich aus `js/app.js` in vier explizite Module. `app.js` sinkt von 8.287 auf 6.292 Zeilen und von 510.210 auf 382.309 Byte. Produktive Archiv- und Jahreswechselaufrufer verwenden `NKProApplicationActions`; Qualitäts- und Diagnoseprüfungen arbeiten auf isolierten Zustandskopien.

## Module

- `archive-actions.js`: Archivmetadaten, Validierung, Import, Löschen, Archivierung, Nur-Ansicht und Wiederbearbeitung; Fachgrundlage bleibt `archive.js`.
- `year-transition-actions.js`: Neuanlage, Jahreswechsel, Übernahme von Vorauszahlungen und Zähleranfangsständen sowie gezielte Jahreswert-Rücksetzungen.
- `quality-assurance.js`: strukturierte Fehler-, Warnungs- und Hinweiscodes ohne Mutation, Commit, Persistenz, Rendering, Dialog oder Navigation.
- `diagnostics.js`: Release-Audit, Selbsttest und Laufzeitdiagnose; produktiver Zustand und Speicher bleiben unverändert.

## Atomarer Schreibpfad

`UI-Eingabe → Normalisierung → Fachvalidierung → NKProStateAccess.transact() → zentrale Konsistenzaufbereitung → höchstens ein Commit → zentrale Persistenz → genau eine UI-Darstellung`.

Das Modul selbst verwendet `render:false`. Schlägt Mutation oder Validierung fehl, ersetzt `NKProStateAccess.transact()` den vollständigen vorherigen Zustand und führt keinen Commit aus.

## Lesender Prüfpfad

`Anfrage → clone(state) → withIsolatedState() → vorhandene Fachvalidierungen → strukturierte Codes → UI-Darstellung`.

Der AP10-Browsertest vergleicht vor und nach Qualität, Release-Audit und Selbsttest den vollständigen Zustand, den lokalen Speicher und den Renderzähler.

## Unveränderte Grundlagen

Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, alle Zählerstandards 1 und Abrechnungssnapshot 2 bleiben unverändert. Historische Snapshotversion 1 und `legacy-partial` bleiben lesbar. Stromzähler-Dummys bleiben gespeichert und von der Abrechnung ausgeschlossen.
