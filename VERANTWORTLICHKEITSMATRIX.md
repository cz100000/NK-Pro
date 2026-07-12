# Verantwortlichkeitsmatrix V99.4.7

| Verantwortung | Primärmodul | Zulässige Aufrufer | Nicht zulässig |
|---|---|---|---|
| Anwendungsstart | `app-bootstrap.js` + Konfiguration in `app.js` | Anwendung | Fachberechnung im Startcode |
| UI-Ereignisse/Navigation | `app.js`, `navigation.js` | DOM-Ereignisse | direkter Fachspeicherzugriff |
| Rendering/UI-Hilfen | `app.js`, `ui-table-tools.js` | UI-Controller | eigene Kostenverteilung |
| Abrechnungsberechnung | `billing-calculation.js` | UI, Dokumentdaten, Tests | DOM, Druck, Download, Storage |
| Zähler/Verbrauch | AP5-Zählermodule | Berechnung, Snapshot, Validierung | konkurrierendes Zählermodell |
| Objektstandard | `object-standard.js` | Migration, Snapshot, UI-Validierung | DOM-abhängige Fachlogik |
| Abrechnungssnapshot | `billing-snapshot.js` | Finalisierung, Archiv, Export | nachträgliche Mutation |
| Dokument-/Briefdaten | `document-data.js` | Renderer, UI, Tests | DOM und Download |
| Brief-/Druck-HTML | `document-renderer.js` | UI-Drucksteuerung | abweichende Fachberechnung |
| Export/Download | `export-service.js` | UI-Aktionen | Mutation von `state` |
| Fachvalidierung | bestehende Fachmodule, Qualitätslogik | UI, Snapshot, Tests | ausschließlich DOM-basierte Prüfung |
| Persistenz | `persistence.js` | App-Kompatibilität, Backup/Restore | direkter Zugriff aus Fachmodulen |
| UI-Präferenzen | `ui-preferences.js` | Navigation | Fach- oder Abrechnungsdaten |
| Migration | `migration.js` | Lade-/Importpfad | Teiländerung am Ausgangsdatensatz |
| Archiv | `archive.js` | Jahresabschluss, Anzeige | rekursive Archivkopien |
| Sicherung/Restore/Rollback | `backup-recovery.js` | UI-Orchestrierung | ungeprüfte Datenübernahme |
| Kompatibilität | `compatibility.js` + Einzeiler in `app.js` | Legacy-UI/Tests | parallele Fachlogik |
