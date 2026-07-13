<!-- AP10-CURRENT -->
# Verantwortlichkeitsmatrix V99.4.11

| Verantwortung | Primär zuständig | explizite Grenze |
|---|---|---|
| allgemeine Archivorchestrierung | `archive-actions.js` | keine Backup-/Restore-/Snapshotfachregel, kein DOM/Speicher |
| Archivprojektion/Legacy | `archive.js` | fachliche Archivgrundlage |
| Jahreswechsel | `year-transition-actions.js` | keine DOM-/Speicherlogik, keine parallele Berechnung |
| Qualität | `quality-assurance.js` | ausschließlich isoliert lesend |
| Diagnose | `diagnostics.js` | ausschließlich reproduzierbar/lesend |
| Commit/Rollback | `state-access.js` + zentraler App-Adapter | ein Zustand, max. ein Commit |
| Dialoge/Navigation/Ergebnisdarstellung | `ui-bindings.js`/`app.js` UI-Adapter | keine Fachmutation |

<!-- AP9-HISTORIC -->
# Verantwortlichkeitsmatrix V99.4.10

| Verantwortung | Primär zuständig | Abgrenzung |
|---|---|---|
| Stammdatenaktionen | `master-data-actions.js` | keine DOM-/Speicherzugriffe |
| Kostenaktionen | `cost-actions.js` | keine parallele Verteilung/Rundung |
| Abrechnungsworkflow/Snapshotkoordination | `billing-workflow.js` | keine Dokument-/Exportmutation; Snapshot nur über `billing-snapshot.js` |
| Aktionsrouting | `application-actions.js` | keine Legacy-Implementierung |
| Transaktion/Rollback | `state-access.js` | keine Fachlogik |
| Dialoge/Navigation | `ui-bindings.js` | keine Fachmutation |

# Verantwortlichkeitsmatrix V99.4.9

| Verantwortung | Primärmodul | Zulässige Aufrufer | Nicht zulässig |
|---|---|---|---|
| Anwendungsstart | `app-bootstrap.js` + Konfiguration in `app.js` | Anwendung | Fachberechnung im Startcode |
| UI-Ereignisse | `ui-events.js` | DOM | Fachberechnung, Persistenz, Zustandsmutation |
| UI-Controller/Bindings | `ui-controller.js`, `ui-bindings.js` | Ereignisdelegation | DOM in Controllerregistry, parallele Fachlogik |
| Navigation | `navigation.js` | Navigationscontroller | Fachspeicherzugriff |
| Zustandseinstieg | `state-access.js` + Anwendungsaktionen | UI-Controller | zweiter Store, DOM, direkter Browser-Speicher |
| Rendering/UI-Hilfen | `app.js`, `ui-table-tools.js` | Controller und definierte Ergebnisse | eigene Kostenverteilung oder Persistenz |
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
