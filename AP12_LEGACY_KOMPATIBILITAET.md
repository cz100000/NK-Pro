# AP12 – Legacy- und Kompatibilitätsschicht

## Ergebnis

Die pauschale Kompatibilitätsfreigabe wurde durch eine ausdrücklich benannte Registry ersetzt. Von 112 Legacy-Weiterleitungen verbleiben 75; 37 nachweislich unaufgerufene Wrapper wurden entfernt.

## Entfernte Wrapper

`allocateByWohneinheiten`, `allocationDistributionStatus`, `allocationForCost`, `applyTableFilter`, `briefCostSortValue`, `briefLongTextRisks`, `briefMainPageOverflows`, `briefProseHtml`, `briefTextWithLineBreaks`, `buildPrepaymentPage`, `cellSortValue`, `clearTableFilter`, `costFullyRedistributes`, `csvEscape`, `csvFileName`, `downloadAppHtmlCopy`, `downloadArchiveIndexCsv`, `downloadJson`, `eligibleTenantsForCost`, `ensureTableTools`, `finalizeCostAllocationResult`, `isMeterAutoEnabledForCost`, `isWaterAutoEnabledForCost`, `longestTextLineLength`, `periodDaysApprox`, `personDays`, `prepaymentRoundingStep`, `printGuideHtml`, `roundMonthlyPrepayment`, `sortTable`, `tenantAnnualizationFactor`, `tenantArea`, `toCsv`, `unitHasTenantForAllocation`, `unitsForCostAllocation`, `waterTotalForTenantIndex`, `wohnungArea`.

## Begründet verbleibende Wrapper

| Quellmodul | Anzahl | Namen |
|---|---|---|
| `billingCalculation` | 30 | `costExclusionHandling`, `normalizeManualUmlageValue`, `isPrivateTenant`, `isBillableTenant`, `billableTenantRows`, `privateTenantRows`, `prepaymentMatrixSumForCost`, `activePrepaymentCostIds`, `tenantIdForUmlage`, `isCostAllowedForTenant`, `tenantRowsWithIndex`, `normalizeActiveDayValue`, `tenantDays`, `allWohnungen`, `activeWohnungen`, `formatPlainNumber`, `waterConsumption`, `genericMeterConsumption`, `meterTotalForCostAndTenant`, `inferManualInputMode`, `defaultManualInputMode`, `manualInputModeForCost`, `rawVorauszahlungByCostAndTenant`, `vorauszahlungByCostAndTenant`, `totalVorauszahlungForTenant`, `calculateUmlage`, `umlageTotals`, `adjustmentGroupForCost`, `prepaymentAdjustmentData`, `calculatedMonthlyPrepaymentRowsForTenant` |
| `documentData` | 22 | `settlementInfoForResult`, `acceptanceProtocolData`, `acceptanceLevel`, `acceptanceLabel`, `validateBriefResult`, `compactTextLength`, `briefPreflightReport`, `allLettersPrintReadiness`, `currentBriefPreflightReport`, `briefResultRows`, `selectedBriefTenant`, `isBriefCostRowRelevant`, `briefCostRows`, `dateDeShortYear`, `fmtMoneySigned`, `fmtUnits`, `isManualExternalCostDefinition`, `letterCostGroup`, `letterPeriod`, `manualExternalLetterLineLabel`, `monthlyPrepaymentRows`, `settlementLabel` |
| `documentRenderer` | 9 | `briefSettlementSummaryHtml`, `briefPrintStyles`, `briefPreflightBoxHtml`, `printHardeningBoxHtml`, `printReportText`, `printWindowHtml`, `plainLetterTextFromHtml`, `costSectionRows`, `buildBriefHtml` |
| `exportService` | 12 | `download`, `safeFilePart`, `downloadJsonFile`, `downloadFullJson`, `downloadCurrentBillingJson`, `downloadKostenCsv`, `downloadMieterCsv`, `txtFileName`, `downloadUmlageCsv`, `downloadFinalBillingReport`, `downloadExportPackage`, `downloadFullExportPackage` |
| `uiTableTools` | 1 | `enhanceTables` |
| `archiveActions` | 1 | `isViewingOlderArchiveYear` |


Die verbleibenden Namen sind wegen der statischen Classic-Script-Architektur und bestehender interner Aufrufstellen vorübergehend erforderlich. Sie sind zentral sichtbar, testbar und auf konkrete Modul-APIs begrenzt. Neue Wrapper werden nicht automatisch exportiert. Datenmigration, PWA-Ladefolge und alte Datenformate hängen nicht von den entfernten Namen ab.
