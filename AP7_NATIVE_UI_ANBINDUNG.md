# AP7 – Native UI-Anbindung an modularisierte Fachdienste

## Ergebnis

NK-Pro V99.4.8 bindet die bestehende Oberfläche über einen einheitlichen Ereignisvertrag an klar benannte UI-Controller. Die fachlichen Dienste aus AP1 bis AP6 bleiben die alleinige Grundlage für Persistenz, Migration, Recovery, Zähler, Abrechnung, Dokumente und Export. Das Erscheinungsbild, die Informationsarchitektur und das für AP11 vorgesehene Navigationsdesign wurden nicht verändert.

## Zielarchitektur

```text
DOM-Ereignis
  → NKProUiEvents (zentrale Delegation)
  → NKProUiController (Aktionsregister)
  → NKProUiBindings (Anwendungsadapter)
  → vorhandener Anwendungs-/Fachdienst
  → definiertes Ergebnis bzw. bestehender Einzelzustand
  → Renderer
  → NKProPersistence, sofern gespeichert wird
```

Die Fachmodule kennen kein DOM. `ui-controller.js` enthält weder DOM- noch Speicherzugriffe. `state-access.js` kennt weder DOM noch Browser-Speicher. `app.js` registriert keine eigenen DOM-Ereignisse mehr.

## Neue und überarbeitete Module

- `js/state-access.js`: kontrollierter Zugriff auf den bestehenden Einzelzustand; kein zweiter Store.
- `js/ui-controller.js`: DOM-freie Registry und Dispatch-Schnittstelle für UI-Aktionen.
- `js/ui-bindings.js`: Zuordnung von 99 UI-Aktionen zu 13 Verantwortungsbereichen und vorhandenen Diensten.
- `js/ui-events.js`: zentrale Delegation für `click`, `change`, `input`, `submit` und `keydown`; Argumentauflösung und einheitliche Fehlerweitergabe.
- `js/navigation.js`: eingefrorene Modul-API statt fünf globaler Navigationswrapper.
- `js/modal-events.js`: Dialogereignisse delegieren an `cost.closeSelectionDialog`.

## Umgestellte Aufrufpfade

Alle 51 statischen Inline-Handler in `index.html` und 79 dynamisch erzeugten Inline-Handler in `app.js` wurden entfernt. Die 130 Handler werden durch deklarative Attribute wie `data-ui-action`, `data-ui-change`, `data-ui-input` und `data-ui-keydown` ersetzt. Auch dynamische Übersichtskarten erzeugen nur noch Aktionskennungen und Argumente; sie registrieren keine eigenen Listener.

Die Anzahl programmatischer `addEventListener`-Quellstellen sank von 18 auf 13. Die sechs bisherigen Registrierungen in `app.js` entfallen vollständig. Die verbleibenden Listener gehören ausschließlich zur zentralen Ereignisdelegation, zur Navigation, zu Modalereignissen, zu Tabellenhilfen und zur Service-Worker-Registrierung.

## Zähler und Messwerte

Die Controllergruppe `meter` leitet Eingaben an die vorhandenen AP5-Adapter `setWaterMeterValue`, `setGenericMeterValue` und `setWaterMeterSetting`. Diese synchronisieren weiterhin den Zählerstandard, Messwerte, Messperioden und Umlageeingaben über die bestehenden AP5-Module. Verbrauch wird nicht aus DOM-Zellen berechnet. Stromzähler-Dummys bleiben gespeichert und durch `abrechnungsrelevant:false` sowie `billingRole:"excluded"` vollständig ausgeschlossen.

## Abrechnung, Dokumente und Export

Die Controllergruppen `billing`, `quality`, `document` und `export` verwenden die vorhandenen AP6-Schnittstellen. Die Exportaktionen rufen `NKProExportService` direkt auf. Briefe und Druckansichten verwenden weiterhin `NKProDocumentData`, `NKProDocumentRenderer` und dasselbe zentrale Abrechnungsergebnis aus `NKProBillingCalculation`. Es wurden keine zusätzlichen Rundungs- oder Summenpfade eingeführt.

## Zustand und Persistenz

Es existiert weiterhin genau ein Anwendungszustand `state`. UI-Schreibzugriffe beginnen nun an einer benannten Controlleraktion. `NKProStateAccess` stellt einen kontrollierten Adapter für Lesen, Ersetzen und Commit bereit. Die bestehenden Orchestrierungsfunktionen in `app.js` greifen intern weiterhin teilweise direkt auf `state` zu; dies ist eine dokumentierte Altlast und kein zweiter Zustand.

Direkte Browser-Speicherzugriffe bleiben auf `persistence.js` und `ui-preferences.js` begrenzt. UI-Handler speichern nicht unmittelbar in `localStorage`. Import, Vor-Migrationssicherung, Restore und Rollback laufen über die vorhandenen Recovery- und Persistenzdienste.

## Globale Kompatibilität

Entfernt wurden die fünf globalen Navigationswrapper `refreshWorkspaceChrome`, `ensureNavigationPath`, `updateWorkflowNavigationContext`, `applyNavTreeState` und `setOpenNavigationGroup`. Die Navigation wird ausschließlich über `NKProNavigation` angesprochen. Die 112 dokumentierten AP6-Kompatibilitätswrapper für Berechnung, Dokumente, Export und Tabellenhilfen bleiben als reine Weiterleitungen bestehen. Klassische Top-Level-Funktionen in `app.js` sind wegen des weiterhin verwendeten Script-Modells noch global sichtbar, werden aber nicht mehr aus HTML aufgerufen.

## Unveränderte Verträge

- Datenschema: 5
- Datenebenenvertrag: 1
- Objektstandard: 1
- Zähler-, Messwert-, Messperioden-, Zuordnungs- und Wechselstandard: 1
- Abrechnungssnapshot: 2; Snapshot 1 bleibt lesbar
- Kein Framework, kein Buildsystem, kein React und kein TypeScript
