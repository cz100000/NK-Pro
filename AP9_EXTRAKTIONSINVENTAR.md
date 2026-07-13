# AP9 – Extraktionsinventar

**Messquelle:** `tools/analyze-app-js.cjs` und `AP9_BASELINE_INVENTORY.json`  
**Ausgangsdatei:** V99.4.9, SHA-256 `02fe85002d0a341f413200eccc50c6a55a016dce533faaaf443004b13c0599cd`

## Implementierungstragende Funktionen

| Frühere Funktion in `app.js` | Gruppe | Zielmodul | Abschluss |
|---|---|---|---|
| `setBillingUnitStatus` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `setMasterNested` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `addMasterMietverhaeltnis` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `archiveMasterMietverhaeltnis` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `restoreMasterMietverhaeltnis` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `tenantBillingCopyFromMaster` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `tenantBillingCopyFromMasterKeepValues` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `captureTenantIndexedValuesById` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `restoreTenantIndexedValuesById` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `captureUmlageInputsByTenantId` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `restoreUmlageInputsByTenantId` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `meterSnapshotRowScore` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `restoreMeterReadingsAfterTenantSync` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `mergeStammdatenIntoCurrentBilling` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `stammdatenComparableUnit` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `stammdatenComparableTenant` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `applyStammdatenToCurrentBillingFromButton` | Stammdaten | `js/master-data-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `configureFreeCost` | Kosten | `js/cost-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `setCostSetting` | Kosten | `js/cost-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `activateDefaultPrepayments` | Kosten | `js/cost-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `deactivateAllPrepayments` | Kosten | `js/cost-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `setCostTenantAllowed` | Kosten | `js/cost-actions.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `finalizeCurrentBilling` | Abrechnungsworkflow | `js/billing-workflow.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `unlockCurrentBilling` | Abrechnungsworkflow | `js/billing-workflow.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `setPrepaymentValue` | Abrechnungsworkflow | `js/billing-workflow.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `setAbrechnungsjahr` | Abrechnungsworkflow | `js/billing-workflow.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `setAbrechnungsperiode` | Abrechnungsworkflow | `js/billing-workflow.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `setManualInputMode` | Abrechnungsworkflow | `js/billing-workflow.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `setManualExternalValue` | Abrechnungsworkflow | `js/billing-workflow.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `resetUmlageInputs` | Abrechnungsworkflow | `js/billing-workflow.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `setPrepaymentAdjustmentSetting` | Abrechnungsworkflow | `js/billing-workflow.js` | physisch entfernt; produktive Aufrufer umgestellt |
| `createYearSnapshot` | Abrechnungsworkflow/Snapshot | `js/billing-workflow.js` (`createSnapshot`) | physisch entfernt; Archiv-, Jahreswechsel-, Export- und Testaufrufer umgestellt |

## Entfernte Übergangsweiterleitungen

Die folgenden 28 Einzeilenweiterleitungen waren nach Umstellung aller produktiven, dynamischen und testseitigen Aufrufer nicht mehr erforderlich. Sie enthielten keine Fachlogik und wurden vollständig entfernt:

- `applyAutoPriceIfNeeded`
- `applyStammdatenToCurrentBilling`
- `autoPriceForCost`
- `captureMeterReadingsSnapshot`
- `clearCurrentBillingFinalization`
- `currentBillingFinalizationKey`
- `currentBillingFinalizationReport`
- `ensureStammdatenData`
- `isCurrentBillingFinalized`
- `isManualPriceOverride`
- `kostenStatus`
- `masterArchivedTenantRows`
- `masterData`
- `masterTenantCount`
- `masterTenants`
- `masterUnits`
- `masterVisibleTenantRows`
- `meterSnapshotRowForTenant`
- `nextMasterMietId`
- `normalizeBillingUnitRows`
- `normalizeCostSettings`
- `normalizeMasterTenantRows`
- `normalizeMasterUnitRows`
- `stammdatenBillingDiff`
- `syncKostenartenMieterUmlage`
- `syncVorauszahlungen`
- `updateTenantPrepaymentTotals`
- `exportCurrentBillingSnapshot`

## Verbleibende Kompatibilität

Die aus AP6 registrierten 112 Kompatibilitätswrapper in `js/compatibility.js` bleiben bestehen. Sie decken weiterhin konkrete klassische globale Aufrufer und Test-/Diagnosepfade außerhalb des AP9-Umfangs ab. In AP9 wurde kein neuer Kompatibilitätswrapper ergänzt. Die drei neuen Anwendungsmodule werden direkt geladen und direkt in `application-actions.js` registriert.

## Aufruferumstellung

- `configureApplicationActions()` bindet 6 Stammdaten-, 5 Kosten- und 9 Billing-Aktionen direkt an die drei Module.
- `ui-bindings.js` ruft diese Aktionen über `NKProApplicationActions.execute()` auf.
- `billing-calculation.js` verwendet Kosten-Normalisierung und Synchronisation direkt aus `NKProCostActions`.
- `document-data.js` liest den Finalisierungsbericht direkt aus `NKProBillingWorkflow`.
- `export-service.js` liest den Kostenstatus direkt aus `NKProCostActions` und erzeugt aktuelle Abrechnungssnapshots direkt über `NKProBillingWorkflow.createSnapshot()`.
- Tests verwenden die dokumentierten Modul-APIs statt entfernter globaler Namen.

## Ausschlussprüfung

Für jede verschobene Implementierung prüfen automatisierte AP9-Architekturtests:

1. Name/Implementierung ist nicht mehr in `app.js` vorhanden.
2. öffentliche Modulaktion ist vorhanden.
3. neue Module enthalten keine DOM- oder Browser-Speicherzugriffe.
4. produktive Anwendungsaktionsbindungen zeigen direkt auf die Module.
5. kein AP9-Übergangswrapper bleibt zurück.
6. Mutation, Einzelcommit und Rollback sind geprüft.
