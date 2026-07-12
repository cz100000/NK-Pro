# Modulübersicht NK-Pro V99.4.9

| Modul | Verantwortung | DOM | Fachspeicher | Öffentliche Schnittstelle |
|---|---|---:|---:|---|
| `ui-preferences.js` | nicht fachliche Navigations-/Darstellungspräferenzen | nein | nein | `get`, `set`, `remove`, Boolean-Hilfen |
| `state-access.js` | kontrollierter Zugriff auf den bestehenden Einzelzustand | nein | nein | `NKProStateAccess` |
| `ui-controller.js` | DOM-freie Controller- und Aktionsregistry | nein | nein | `NKProUiController` |
| `ui-bindings.js` | 99 Aktionsbindungen in 13 Verantwortungsbereichen | nein | nein | `NKProUiBindings` |
| `ui-events.js` | zentrale Ereignisdelegation und Argumentauflösung | ja | nein | `NKProUiEvents` |
| `navigation.js` | Navigationsbaum, Sidebar, Arbeitskontext | ja | nein | `NKProNavigation` |
| `modal-events.js` | Backdrop-/Escape-Ereignisse mit Controllerdispatch | ja | nein | `NKProModalEvents` |
| `persistence.js` | geschütztes Laden/Speichern, Integrität, Storage-Adapter | nein | ja | `NKProPersistence` |
| `migration.js` | Migrationsregistry und atomare Migration | nein | über Adapter | `NKProMigration` |
| `backup-recovery.js` | Sicherungshüllen, Restore, Checkpoint | nein | über Adapter | `NKProBackupRecovery` |
| `meter-master.js` | Zählerstammdaten und Dummy-Ausschluss | nein | nein | `NKProMeterMaster` |
| `meter-readings.js` | Messwerte, Korrektur und Storno | nein | nein | `NKProMeterReadings` |
| `meter-periods.js` | Messperioden, Wechsel, Zuordnung, Verbrauch | nein | nein | `NKProMeterPeriods` |
| `meter-validation.js` | Zählerstandardmigration und Validierung | nein | nein | `NKProMeterValidation` |
| `object-standard.js` | Objektstandardprojektion und Validierung | nein | nein | `NKProObjectStandard` |
| `billing-snapshot.js` | Snapshot-Erzeugung, Integrität und Lesbarkeit | nein | nein | `NKProBillingSnapshot` |
| `archive.js` | begrenzte Archivprojektion und Legacybehandlung | nein | nein | `NKProArchive` |
| `billing-calculation.js` | Kostenverteilung, Verbrauch, Vorauszahlung, Saldo | nein | nein | `NKProBillingCalculation` |
| `document-data.js` | Brief-, Prüf- und Dokument-View-Modelle | nein | nein | `NKProDocumentData` |
| `document-renderer.js` | Brief- und Druck-HTML | ja, nur Klartextkonvertierung | nein | `NKProDocumentRenderer` |
| `export-service.js` | Dateinamen, JSON/CSV, Downloadauslösung | ja, Downloadanker | nein | `NKProExportService` |
| `ui-table-tools.js` | Tabellenfilter, Sortierung, Werkzeuge | ja | nein | `NKProUiTableTools` |
| `app-bootstrap.js` | benannte Startreihenfolge und Fehlerpfad | nein | nein | `NKProAppBootstrap` |
| `compatibility.js` | Registry der Legacy-Weiterleitungen | nein | nein | `NKProCompatibility` |
| `default-seed.js` | unveränderte Ausgangsdaten | nein | nein | globale `SEED`-Bindung |
| `app.js` | UI-Controller, Arbeitsabläufe, verbleibende Legacy-Orchestrierung | ja | nur über Module | globale Kompatibilität und UI-Aktionen |
| `service-worker-register.js` | Service-Worker-Registrierung | Browser-API | nein | keine Fachschnittstelle |
