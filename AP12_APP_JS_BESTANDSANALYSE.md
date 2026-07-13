# AP12 – `app.js`-Bestandsanalyse und Zielverantwortung

## Ausgangsbestand V99.4.12

`app.js` umfasste 6.294 Zeilen, 382.650 Byte, 518 Top-Level-Funktionen und 67 Top-Level-Bindungen. Darin lagen Start, Zustandsinitialisierung, Persistenzkoordination, Stammdaten-, Kosten-, Zähler-, Archiv-, Dokument-, Tabellen-, Diagnose-, Dialog-, Seiten- und Browserabläufe zusammen.

Das vollständige maschinenlesbare Elementinventar mit **585 Elementen** steht in `AP12_FUNKTIONSINVENTAR.json`; die ursprüngliche Detailmessung steht in `AP12_APP_JS_INVENTORY_BEFORE.json`.

## Zielbestand V99.4.13

`app.js` umfasst 225 Zeilen und 15.599 Byte. Es verbleiben genau folgende acht Funktionen:

| Funktion | Begründete Verantwortung |
|---|---|
| `configureCoreOrchestrationModules` | Explizite Verdrahtung der vorhandenen Fach- und Orchestrierungsmodule. |
| `configureStateAccess` | Übergabe des kontrollierten Zustands- und Commitzugriffs. |
| `configureApplicationActions` | Aufbau des zentralen Aktionsregisters. |
| `configureNavigationModule` | Übergabe der notwendigen Lese- und UI-Abhängigkeiten an die Navigation. |
| `registerUiControllers` | Einmalige Registrierung der 13 UI-Controller. |
| `startUiEvents` | Einmaliger Start der zentralen Ereignisdelegation und letzte UI-Fehlergrenze. |
| `updateUiArchitectureAudit` | Zusammenfassung der Laufzeitarchitektur für Diagnosezwecke. |
| `configureCompatibilityRegistry` | Explizite Registrierung der 75 begründet verbleibenden Übergangswrapper. |


Die beiden Top-Level-Bindungen sind die unveränderliche Wrapperliste `COMPATIBILITY_WRAPPERS` und das unveränderlich protokollierte `STARTUP_RESULT`. `app.js` enthält keine direkte Fachzustandsreferenz, keine direkte Fachzustandsmutation, keine Persistenzimplementierung, keinen Renderer, keine Dialogimplementierung und keinen Browseradapter.

## Physische Zuordnung

| Ausgelagerter Bereich | Ziel |
|---|---|
| Gekapselte, schreibgeschützte Laufzeitdiagnose für Start-, UI- und Kompatibilitätsberichte | `js/runtime-diagnostics.js` |
| Laufzeitkonstanten, Modulregister, einziger Arbeitszustandsbezug und Konfigurationswerte | `js/app-runtime-config.js` |
| Zustandserzeugung/-ersetzung, Normalisierung, Commit, Persistenz, Backup-/Restore-UI und Statusdarstellung | `js/app-state-persistence.js` |
| Stammdaten-, Mietverhältnis-, Kontakt- und Preisdialogsteuerung | `js/ui-master-data.js` |
| Qualitätsansichten, Freigabe- und Abschlussberichte sowie Qualitätsfilter | `js/ui-quality.js` |
| Kostenansichten, Kostenauswahl, Kosteninformation und Kostendialoge | `js/ui-costs.js` |
| Seitenwechsel, Abrechnungsauswahl sowie Erstellen-/Löschen-Dialoge | `js/ui-navigation-pages.js` |
| Archivtabellen, Archivöffnung, Wiederbearbeitung und Archivdokumente | `js/ui-archive-pages.js` |
| Dateiauswahl, Druckfenster, Downloads, Blob/URL/FileReader und browsergebundene Ein-/Ausgabe | `js/browser-io.js` |
| Zählerdarstellung, Zählerwerte, Messperioden und kontrollierte Zähleraktionen | `js/ui-metering.js` |
| Umlage-, Vorauszahlungs- und Abrechnungsverteilungsansichten | `js/ui-billing-allocation.js` |
| Briefdaten-UI, Vorschau-, Druck- und Dokumentaktionen; Gestaltung bleibt AP13 vorbehalten | `js/ui-documents.js` |
| Tabellenfilter, Sortierung, Paging und Tabellen-UI | `js/ui-table-actions.js` |
| Diagnose- und Releaseprüfungsdarstellung | `js/ui-diagnostics.js` |
| Seitenrenderer, Seitenköpfe, Übersichten, Accordions und UI-Seitenorchestrierung | `js/ui-page-controller.js` |


Die vollständige Nachmessung steht in `AP12_APP_JS_INVENTORY_AFTER.json`.
