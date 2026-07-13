# AP9 – Physisch extrahierte Kernorchestrierung

**Version:** NK-Pro V99.4.10  
**Basis:** V99.4.9  
**Stand:** 13. Juli 2026

## Ergebnis

AP9 hat die zusammenhängende Kernorchestrierung für Stammdaten, Kosten und den laufenden Abrechnungsworkflow physisch aus `js/app.js` entfernt. Die Implementierungen liegen in drei DOM- und speicherfreien Anwendungsmodulen. `application-actions.js` registriert deren echte Modulfunktionen direkt; die UI-Controller rufen keine ausgelagerten Legacy-Implementierungen mehr auf.

| Kennzahl | V99.4.9 | V99.4.10 | Änderung |
|---|---:|---:|---:|
| Größe `js/app.js` | 539.972 Byte | 510.210 Byte | -29.762 Byte |
| Zeilen `js/app.js` | 9.026 | 8.287 | -739 |
| Top-Level-Funktionsdeklarationen | 655 | 596 | -59 netto |
| Top-Level-Bindungen | 68 | 67 | -1 |
| direkte `state`-Pfadreferenzen | 640 | 503 | -137 |
| direkte Property-Schreibstellen | 233 | 182 | -51 |
| Root-Ersetzungen `state = …` | 13 | 13 | 0 |
| gesamte direkte Schreibstellen | 246 | 195 | -51 |

Insgesamt wurden **32 implementierungstragende Top-Level-Funktionen** verschoben und **28 danach funktionslose Übergangsweiterleitungen** entfernt. Damit wurden 60 frühere Top-Level-Deklarationen beseitigt; mit einer neuen Konfigurationsfunktion verbleiben netto 596 statt 655 Top-Level-Funktionsdeklarationen.

## Neue Modulgrenzen

### `js/master-data-actions.js`

Verantwortet Normalisierung und Orchestrierung von Objekt-, Wohnungs-, Mieter- und Mietverhältnisdaten sowie die kontrollierte Übernahme in den aktuellen Abrechnungsstand. Öffentliche Schreibaktionen:

- `addMasterTenancy`
- `applyMasterDataToBilling`
- `archiveMasterTenancy`
- `restoreMasterTenancy`
- `setBillingUnitStatus`
- `setMasterNested`

Die Übernahme erhält IDs, unbekannte Felder, zeitabhängige Mietverhältnisse, manuelle Abrechnungswerte und Zählerstände. Historische Snapshots werden nicht verändert.

### `js/cost-actions.js`

Verantwortet Kostenarteneinstellungen, freie Kostenarten, Aktivierung/Ausschluss, Vorauszahlungsarten und mieterbezogene Freigaben. Öffentliche Schreibaktionen:

- `configureFree`
- `setSetting`
- `activateDefaultPrepayments`
- `deactivateAllPrepayments`
- `setTenantAllowed`

Das Modul koordiniert Eingaben und Zustand, führt aber keine eigene Kostenverteilung oder Rundungslogik ein. `NKProBillingCalculation` bleibt alleinige Abrechnungsberechnung.

### `js/billing-workflow.js`

Verantwortet Finalisierung, Wiederöffnung, Abrechnungsjahr und -periode, manuelle/externe Umlagewerte, Vorauszahlungen sowie die koordinierte Erstellung des aktuellen Abrechnungssnapshots. Öffentliche Schreibaktionen:

- `finalize`
- `unlock`
- `setYear`
- `setPeriod`
- `resetAllocationInputs`
- `setManualInputMode`
- `setManualExternalValue`
- `setPrepaymentValue`
- `setPrepaymentAdjustmentSetting`

Öffentlicher, nicht schreibender Workflowdienst:

- `createSnapshot`

Finalisierung und Wiederöffnung liefern strukturierte Bestätigungs- oder Promptanforderungen. `createSnapshot()` koordiniert Readiness und die vorhandenen Fachmodule und erzeugt den Snapshot ausschließlich über `NKProBillingSnapshot`; die Funktion führt keinen eigenen Commit, keine Persistenz und kein Rendering aus. Das Modul zeigt keine Dialoge, navigiert nicht und erzeugt kein HTML.

## Physisch verschobene Implementierungen

### Stammdaten (17)

- `setBillingUnitStatus`
- `setMasterNested`
- `addMasterMietverhaeltnis`
- `archiveMasterMietverhaeltnis`
- `restoreMasterMietverhaeltnis`
- `tenantBillingCopyFromMaster`
- `tenantBillingCopyFromMasterKeepValues`
- `captureTenantIndexedValuesById`
- `restoreTenantIndexedValuesById`
- `captureUmlageInputsByTenantId`
- `restoreUmlageInputsByTenantId`
- `meterSnapshotRowScore`
- `restoreMeterReadingsAfterTenantSync`
- `mergeStammdatenIntoCurrentBilling`
- `stammdatenComparableUnit`
- `stammdatenComparableTenant`
- `applyStammdatenToCurrentBillingFromButton`

### Kosten (5)

- `configureFreeCost`
- `setCostSetting`
- `activateDefaultPrepayments`
- `deactivateAllPrepayments`
- `setCostTenantAllowed`

### Abrechnungsworkflow und Snapshot (10)

- `finalizeCurrentBilling`
- `unlockCurrentBilling`
- `setPrepaymentValue`
- `setAbrechnungsjahr`
- `setAbrechnungsperiode`
- `setManualInputMode`
- `setManualExternalValue`
- `resetUmlageInputs`
- `setPrepaymentAdjustmentSetting`
- `createYearSnapshot`

## Zustands- und Commitpfad

```text
UI-Ereignis
→ ui-events.js
→ ui-controller.js / ui-bindings.js
→ application-actions.js
→ zuständiges Anwendungsmodul
→ NKProStateAccess.transact()
→ Fachvalidierung und atomare Mutation
→ genau ein commitStateChange()
→ Persistenz und gezieltes Rendering
→ strukturiertes Aktionsergebnis
→ UI-Präsentation
```

`NKProStateAccess.transact()` ersetzt den gesamten Zustand nur noch mit der ausdrücklichen Option `replaceStateResult:true`. Normale Aktionsresultate werden nicht mehr versehentlich als Zustand interpretiert. Bei Fehlern wird die vollständige Vorherkopie wiederhergestellt; fehlgeschlagene Aktionen committen nicht.

## UI-Grenze

`ui-bindings.js` ist allein für `confirm`, `prompt`, Meldungen und Tabwechsel zuständig. Anwendungsaktionen liefern hierfür lediglich Daten wie `requiresConfirmation`, `confirmationMessage`, `requiresPrompt`, `message` oder `targetTab`. Die 13 UI-Controller und 99 Aktionskennungen bleiben bestehen.

## Erhaltene Fach- und Datenstandards

- Datenschema 5
- Datenebenenvertrag 1
- Objektstandard 1
- Zählerstammdaten-, Messwert-, Messperioden-, Zuordnungs- und Wechselstandard 1
- Abrechnungssnapshot 2
- ein einziger veränderlicher Arbeitszustand
- unveränderliche historische Snapshots und Archive
- Stromzähler-Dummys gespeichert, aber vollständig abrechnungsfremd

## Verbleibende Grenze

Allgemeine Archiv-, Jahreswechsel-, Qualitäts-, Diagnose-, umfangreiche Rendering- und Dokument-UI-Orchestrierung verbleibt in `app.js`. Diese Bereiche sind ausdrücklich für AP10 beziehungsweise spätere Pakete vorgesehen. AP11 bleibt dem verbindlichen Navigationsdesign und visuellen Grundsystem vorbehalten.
