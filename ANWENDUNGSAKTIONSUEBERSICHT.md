# NK-Pro – Anwendungsaktionsübersicht V99.4.10

## Aktionsregister

`NKProApplicationActions` registriert weiterhin die Domänen `application`, `state`, `object`, `cost`, `billing` und `meter`. AP9 ersetzt die Legacy-Ziele der drei Kernbereiche durch direkte Modulfunktionen.

| Domäne | Aktion | Ziel |
|---|---|---|
| object | `addMasterTenancy` | `NKProMasterDataActions.addMasterTenancy` |
| object | `applyMasterDataToBilling` | `NKProMasterDataActions.applyMasterDataToBilling` |
| object | `archiveMasterTenancy` | `NKProMasterDataActions.archiveMasterTenancy` |
| object | `restoreMasterTenancy` | `NKProMasterDataActions.restoreMasterTenancy` |
| object | `setBillingUnitStatus` | `NKProMasterDataActions.setBillingUnitStatus` |
| object | `setMasterNested` | `NKProMasterDataActions.setMasterNested` |
| cost | `configureFree` | `NKProCostActions.configureFree` |
| cost | `setSetting` | `NKProCostActions.setSetting` |
| cost | `activateDefaultPrepayments` | `NKProCostActions.activateDefaultPrepayments` |
| cost | `deactivateAllPrepayments` | `NKProCostActions.deactivateAllPrepayments` |
| cost | `setTenantAllowed` | `NKProCostActions.setTenantAllowed` |
| billing | `finalize` | `NKProBillingWorkflow.finalize` |
| billing | `unlock` | `NKProBillingWorkflow.unlock` |
| billing | `setYear` | `NKProBillingWorkflow.setYear` |
| billing | `setPeriod` | `NKProBillingWorkflow.setPeriod` |
| billing | `resetAllocationInputs` | `NKProBillingWorkflow.resetAllocationInputs` |
| billing | `setManualInputMode` | `NKProBillingWorkflow.setManualInputMode` |
| billing | `setManualExternalValue` | `NKProBillingWorkflow.setManualExternalValue` |
| billing | `setPrepaymentValue` | `NKProBillingWorkflow.setPrepaymentValue` |
| billing | `setPrepaymentAdjustmentSetting` | `NKProBillingWorkflow.setPrepaymentAdjustmentSetting` |

## Modulinterner Workflowdienst

`NKProBillingWorkflow.createSnapshot()` ist eine öffentliche, aber nicht als eigene UI-Aktionskennung registrierte Workflowfunktion. Archiv-, Jahreswechsel-, Export- und Testpfade rufen sie direkt auf. Sie koordiniert Readiness, bestehende Berechnungs- und Normalisierungsmodule und erzeugt den unveränderlichen Snapshot ausschließlich über `NKProBillingSnapshot`; sie führt keinen eigenen Commit, keine Persistenz und kein Rendering aus.

## Ergebnisvertrag

`execute(domain, action, args)` liefert ein eingefrorenes Hüllergebnis mit `ok`, `domain`, `action` und `value`. `value` kann unter anderem enthalten:

- `changed`, `reason`, IDs oder betroffene Felder,
- `requiresConfirmation` und `confirmationMessage`,
- `requiresPrompt` und `promptMessage`,
- `message` und `targetTab`.

Die UI-Bindings präsentieren diese Werte. Das Aktionsregister führt selbst weder DOM-, Speicher-, Berechnungs- noch Renderinglogik aus.

## Direkte UI-Anbindung

Von den 99 UI-Aktionskennungen greifen 20 Kernaktionen direkt über das Aktionsregister auf die drei AP9-Module zu: 6 Objekt-, 5 Kosten- und 9 Billing-Aktionen. Hinzu kommen unverändert Anwendung-, generische State- und Zähleraktionen über bestehende kontrollierte Grenzen.
