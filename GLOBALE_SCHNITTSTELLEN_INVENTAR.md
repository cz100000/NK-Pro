<!-- AP10-CURRENT -->
# Globale Schnittstellen – Stand V99.4.12

`app.js` enthält 518 Top-Level-Funktionsdeklarationen und 67 Bindungen. 79 AP10-Implementierungen wurden entfernt; `withIsolatedState()` wurde als eine Infrastrukturgrenze ergänzt, sodass die Nettoverringerung 78 Funktionen beträgt. Dynamische Globalzugriffe sinken von 1 auf 0. Neue globale Modulobjekte: `NKProArchiveActions`, `NKProYearTransitionActions`, `NKProQualityAssurance`, `NKProDiagnostics`. AP10 legt keine globalen Fachlogik-Wrapper an.

<!-- AP9-HISTORIC -->
# Globale Schnittstellen – Stand V99.4.10

`app.js` enthält 596 Top-Level-Funktionsdeklarationen, 67 Top-Level-Bindungen, 5 explizite globale Zuweisungen und einen dynamischen globalen Zugriff. AP9 entfernt 60 frühere Top-Level-Funktionen (32 Implementierungen und 28 Weiterleitungen) und ergänzt eine Konfigurationsfunktion. Neu öffentlich geladen werden ausschließlich die eingefrorenen Modulobjekte `NKProMasterDataActions`, `NKProCostActions` und `NKProBillingWorkflow`. Die vollständigen maschinenlesbaren Vorher-/Nachherwerte stehen in `AP9_BASELINE_INVENTORY.json`; die AP9-Funktionen stehen in `AP9_FUNKTIONSINVENTAR.md`.

> Der folgende Abschnitt bleibt als unverändertes Ausgangsinventar von V99.4.9 erhalten. Das vollständige aktuelle Namens-, Positions- und Zustandszugriffsinventar von V99.4.10 steht in `AP9_APP_JS_INVENTORY_AFTER.json`; das entsprechende Ausgangsinventar steht in `AP9_APP_JS_INVENTORY_BEFORE.json`.

# Globale Schnittstellen und Zustände – Inventar V99.4.9

Erzeugt aus dem tatsächlichen Top-Level von `js/app.js`. Klassische Skripte machen Funktionsdeklarationen global erreichbar; `const`/`let` bilden globale lexikalische Bindungen.

## Zusammenfassung

- Top-Level-Funktionen: **654**
- reine Kompatibilitätswrapper auf AP6-Module: **112**
- weiterhin in `app.js` implementierte Funktionen: **542**
- Top-Level-Variablen/Konstanten: **68**
- direkter Browser-Speicherzugriff in `app.js`: **0**
- globale HTML-/Inline-Aufrufe: **0**
- entfernte globale Navigationswrapper: **5**

## Verbleibende Funktionen nach Verantwortungsbereich

| Bereich | Anzahl |
|---|---:|
| Anwendungslogik/sonstig | 242 |
| UI/Rendering/Navigation | 84 |
| Stammdaten/Mietverhältnisse | 47 |
| Querschnitt/Hilfen | 44 |
| Archiv/Jahreswechsel | 40 |
| Persistenz/Migration/Recovery | 37 |
| Zähler/Verbrauch | 19 |
| Abrechnung/Berechnung | 10 |
| Export/Download | 8 |
| Dokument/Brief/Druck | 3 |

## Kompatibilitätswrapper

| Funktion | Zielmodul | Zeile |
|---|---|---:|
| `costExclusionHandling` | `billingCalculation` | 1514 |
| `costFullyRedistributes` | `billingCalculation` | 1516 |
| `normalizeManualUmlageValue` | `billingCalculation` | 1518 |
| `isPrivateTenant` | `billingCalculation` | 2523 |
| `isBillableTenant` | `billingCalculation` | 2525 |
| `billableTenantRows` | `billingCalculation` | 2527 |
| `privateTenantRows` | `billingCalculation` | 2529 |
| `prepaymentMatrixSumForCost` | `billingCalculation` | 2649 |
| `settlementInfoForResult` | `documentData` | 2831 |
| `briefSettlementSummaryHtml` | `documentRenderer` | 2833 |
| `finalBillingReadiness` | `documentData` | 2835 |
| `acceptanceProtocolData` | `documentData` | 2837 |
| `acceptanceLevel` | `documentData` | 2839 |
| `acceptanceLabel` | `documentData` | 2841 |
| `activePrepaymentCostIds` | `billingCalculation` | 3458 |
| `tenantIdForUmlage` | `billingCalculation` | 3540 |
| `isCostAllowedForTenant` | `billingCalculation` | 3570 |
| `download` | `exportService` | 4079 |
| `safeFilePart` | `exportService` | 6288 |
| `downloadJsonFile` | `exportService` | 6290 |
| `downloadFullJson` | `exportService` | 6292 |
| `downloadCurrentBillingJson` | `exportService` | 6294 |
| `downloadJson` | `exportService` | 6296 |
| `csvEscape` | `exportService` | 6297 |
| `toCsv` | `exportService` | 6298 |
| `downloadKostenCsv` | `exportService` | 6299 |
| `downloadMieterCsv` | `exportService` | 6300 |
| `csvFileName` | `exportService` | 6302 |
| `txtFileName` | `exportService` | 6304 |
| `downloadUmlageCsv` | `exportService` | 6306 |
| `downloadArchiveIndexCsv` | `exportService` | 6308 |
| `downloadFinalBillingReport` | `exportService` | 6310 |
| `downloadAppHtmlCopy` | `exportService` | 6312 |
| `downloadExportPackage` | `exportService` | 6314 |
| `downloadFullExportPackage` | `exportService` | 6316 |
| `tenantRowsWithIndex` | `billingCalculation` | 6448 |
| `wohnungArea` | `billingCalculation` | 6450 |
| `tenantArea` | `billingCalculation` | 6452 |
| `normalizeActiveDayValue` | `billingCalculation` | 6454 |
| `tenantDays` | `billingCalculation` | 6465 |
| `personDays` | `billingCalculation` | 6467 |
| `allWohnungen` | `billingCalculation` | 6469 |
| `activeWohnungen` | `billingCalculation` | 6471 |
| `periodDaysApprox` | `billingCalculation` | 6473 |
| `unitHasTenantForAllocation` | `billingCalculation` | 6475 |
| `unitsForCostAllocation` | `billingCalculation` | 6477 |
| `allocateByWohneinheiten` | `billingCalculation` | 6479 |
| `formatPlainNumber` | `billingCalculation` | 6481 |
| `waterConsumption` | `billingCalculation` | 6615 |
| `genericMeterConsumption` | `billingCalculation` | 6617 |
| `waterTotalForTenantIndex` | `billingCalculation` | 6619 |
| `meterTotalForCostAndTenant` | `billingCalculation` | 6621 |
| `isMeterAutoEnabledForCost` | `billingCalculation` | 6639 |
| `isWaterAutoEnabledForCost` | `billingCalculation` | 6641 |
| `inferManualInputMode` | `billingCalculation` | 7016 |
| `defaultManualInputMode` | `billingCalculation` | 7017 |
| `manualInputModeForCost` | `billingCalculation` | 7018 |
| `rawVorauszahlungByCostAndTenant` | `billingCalculation` | 7064 |
| `vorauszahlungByCostAndTenant` | `billingCalculation` | 7066 |
| `totalVorauszahlungForTenant` | `billingCalculation` | 7068 |
| `allocationDistributionStatus` | `billingCalculation` | 7080 |
| `eligibleTenantsForCost` | `billingCalculation` | 7082 |
| `finalizeCostAllocationResult` | `billingCalculation` | 7084 |
| `allocationForCost` | `billingCalculation` | 7086 |
| `calculateUmlage` | `billingCalculation` | 7108 |
| `umlageTotals` | `billingCalculation` | 7110 |
| `prepaymentRoundingStep` | `billingCalculation` | 7262 |
| `roundMonthlyPrepayment` | `billingCalculation` | 7264 |
| `tenantAnnualizationFactor` | `billingCalculation` | 7266 |
| `adjustmentGroupForCost` | `billingCalculation` | 7268 |
| `prepaymentAdjustmentData` | `billingCalculation` | 7270 |
| `calculatedMonthlyPrepaymentRowsForTenant` | `billingCalculation` | 7272 |
| `briefTextWithLineBreaks` | `documentRenderer` | 7335 |
| `briefProseHtml` | `documentRenderer` | 7336 |
| `briefPrintStyles` | `documentRenderer` | 7456 |
| `validateBriefResult` | `documentData` | 7469 |
| `longestTextLineLength` | `documentData` | 7473 |
| `compactTextLength` | `documentData` | 7475 |
| `briefLongTextRisks` | `documentData` | 7477 |
| `briefPreflightReport` | `documentData` | 7479 |
| `briefPreflightBoxHtml` | `documentRenderer` | 7481 |
| `printGuideHtml` | `documentRenderer` | 7484 |
| `printHardeningBoxHtml` | `documentRenderer` | 7525 |
| `printReportText` | `documentRenderer` | 7533 |
| `printWindowHtml` | `documentRenderer` | 7541 |
| `allLettersPrintReadiness` | `documentData` | 7557 |
| `currentBriefPreflightReport` | `documentData` | 7576 |
| `briefResultRows` | `documentData` | 7590 |
| `selectedBriefTenant` | `documentData` | 7592 |
| `plainLetterTextFromHtml` | `documentRenderer` | 7594 |
| `isManualExternalCostDefinition` | `documentData` | 7596 |
| `manualExternalLetterLineLabel` | `documentData` | 7598 |
| `isBriefCostRowRelevant` | `documentData` | 7600 |
| `briefCostSortValue` | `documentData` | 7602 |
| `briefCostRows` | `documentData` | 7604 |
| `dateDeShortYear` | `documentData` | 7606 |
| `letterPeriod` | `documentData` | 7608 |
| `fmtMoneySigned` | `documentData` | 7610 |
| `fmtUnits` | `documentData` | 7612 |
| `letterCostGroup` | `documentData` | 7614 |
| `settlementLabel` | `documentData` | 7616 |
| `costSectionRows` | `documentRenderer` | 7618 |
| `monthlyPrepaymentRows` | `documentData` | 7620 |
| `buildPrepaymentPage` | `documentRenderer` | 7622 |
| `briefMainPageOverflows` | `documentRenderer` | 7624 |
| `buildBriefHtml` | `documentRenderer` | 7626 |
| `cellSortValue` | `uiTableTools` | 7770 |
| `sortTable` | `uiTableTools` | 7772 |
| `applyTableFilter` | `uiTableTools` | 7774 |
| `clearTableFilter` | `uiTableTools` | 7776 |
| `ensureTableTools` | `uiTableTools` | 7778 |
| `enhanceTables` | `uiTableTools` | 7780 |

## Verbleibende globale Funktionen

| Funktion | Zuordnung | Zeile | Entscheidung |
|---|---|---:|---|
| `clone` | Querschnitt/Hilfen | 275 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `persistenceModuleOptions` | Persistenz/Migration/Recovery | 277 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `backupRecoveryModuleOptions` | Persistenz/Migration/Recovery | 287 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `validateMigrationData` | Anwendungslogik/sonstig | 300 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `migrationModuleOptions` | Persistenz/Migration/Recovery | 310 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `meteringModuleOptions` | Zähler/Verbrauch | 329 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `synchronizeMeteringData` | Zähler/Verbrauch | 341 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `validateMeteringData` | Zähler/Verbrauch | 345 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `migrateMeteringData` | Zähler/Verbrauch | 349 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `objectStandardModuleOptions` | Anwendungslogik/sonstig | 353 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `billingSnapshotModuleOptions` | Anwendungslogik/sonstig | 362 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeObjectStandard` | Anwendungslogik/sonstig | 381 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `validateObjectStandard` | Anwendungslogik/sonstig | 385 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `validateBillingReadiness` | Anwendungslogik/sonstig | 389 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `validateBillingSnapshot` | Anwendungslogik/sonstig | 393 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `addElectricityDummyMeter` | Zähler/Verbrauch | 397 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveModuleOptions` | Archiv/Jahreswechsel | 404 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isSnapshotTechnicalMetaKey` | Anwendungslogik/sonstig | 422 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `snapshotMetaFrom` | Anwendungslogik/sonstig | 426 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `createBoundedBillingSnapshotData` | Anwendungslogik/sonstig | 430 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `hasHistoricalWaterMeterData` | Anwendungslogik/sonstig | 434 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `adoptHistoricalWaterMeterDataFromArchive` | Anwendungslogik/sonstig | 438 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveBoundaryFacts` | Archiv/Jahreswechsel | 442 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeArchiveCollectionBoundaries` | Anwendungslogik/sonstig | 446 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `enforceWorkingStateDataContract` | Anwendungslogik/sonstig | 450 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `copyWorkingOperationalMeta` | Anwendungslogik/sonstig | 454 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureWaterMeterHistory` | Zähler/Verbrauch | 460 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `notifyStorageProblem` | Anwendungslogik/sonstig | 470 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `integrityHash` | Anwendungslogik/sonstig | 480 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `dataWithoutIntegrity` | Anwendungslogik/sonstig | 484 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `calculateDataIntegrity` | Abrechnung/Berechnung | 488 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `protectDataForStorage` | Persistenz/Migration/Recovery | 492 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `validateStoredDataIntegrity` | Persistenz/Migration/Recovery | 496 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `readStoredDataResult` | Persistenz/Migration/Recovery | 500 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `readStoredData` | Persistenz/Migration/Recovery | 504 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `writeProtectedStorage` | Persistenz/Migration/Recovery | 519 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `migrationCandidatesForData` | Persistenz/Migration/Recovery | 523 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `migrationPathLabelsForCandidates` | Persistenz/Migration/Recovery | 546 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `createPreMigrationBackup` | Anwendungslogik/sonstig | 558 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensurePreMigrationBackup` | Anwendungslogik/sonstig | 573 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `readPreMigrationBackupResult` | Persistenz/Migration/Recovery | 579 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `readRestoreCheckpointResult` | Persistenz/Migration/Recovery | 583 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `migrationBackupFileName` | Persistenz/Migration/Recovery | 587 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `downloadPreMigrationBackup` | Export/Download | 593 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `createRestoreCheckpoint` | Anwendungslogik/sonstig | 603 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `restorePreMigrationBackup` | Persistenz/Migration/Recovery | 616 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `rollbackLastRestore` | Persistenz/Migration/Recovery | 638 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `loadData` | Persistenz/Migration/Recovery | 657 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isAppDataShape` | Anwendungslogik/sonstig | 679 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `jsonByteLength` | Anwendungslogik/sonstig | 684 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `formatBytes` | Querschnitt/Hilfen | 690 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `storageUsageForData` | Persistenz/Migration/Recovery | 697 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentStorageUsage` | Querschnitt/Hilfen | 707 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `parseJsonFileText` | Anwendungslogik/sonstig | 711 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `importValidationReport` | Persistenz/Migration/Recovery | 721 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `importSummaryText` | Persistenz/Migration/Recovery | 758 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `addImportMetadata` | Anwendungslogik/sonstig | 784 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `backupEventLabel` | Persistenz/Migration/Recovery | 792 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureBackupMetadata` | Anwendungslogik/sonstig | 803 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `registerBackupEvent` | Anwendungslogik/sonstig | 809 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `daysSinceIso` | Anwendungslogik/sonstig | 840 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `backupStatusReport` | Persistenz/Migration/Recovery | 847 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `backupStatusHint` | Persistenz/Migration/Recovery | 871 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `confirmRiskyDataAction` | Anwendungslogik/sonstig | 876 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderBackupStatus` | UI/Rendering/Navigation | 881 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentBillingFinalizationKey` | Querschnitt/Hilfen | 904 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isCurrentBillingFinalized` | Anwendungslogik/sonstig | 909 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `withFinalizationWriteBypass` | Anwendungslogik/sonstig | 917 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentBillingFinalizationReport` | Querschnitt/Hilfen | 923 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderFinalizationStatus` | UI/Rendering/Navigation | 931 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `finalizeCurrentBilling` | Anwendungslogik/sonstig | 953 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `unlockCurrentBilling` | Anwendungslogik/sonstig | 982 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `clearCurrentBillingFinalization` | Anwendungslogik/sonstig | 998 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `exportSnapshot` | Export/Download | 1007 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `exportCurrentBillingSnapshot` | Export/Download | 1033 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `backupFileName` | Persistenz/Migration/Recovery | 1037 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `errorMessage` | Querschnitt/Hilfen | 1044 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `recordStartupError` | Anwendungslogik/sonstig | 1049 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `persistStartupMeterRepair` | Persistenz/Migration/Recovery | 1055 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `loadInitialState` | Persistenz/Migration/Recovery | 1069 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentDataSchemaVersion` | Querschnitt/Hilfen | 1095 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `recordDataMigration` | Anwendungslogik/sonstig | 1099 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `migrateDataSchema` | Anwendungslogik/sonstig | 1103 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderSystemMessages` | UI/Rendering/Navigation | 1107 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setActionMessage` | Anwendungslogik/sonstig | 1123 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderActionFeedback` | UI/Rendering/Navigation | 1128 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `runRenderStep` | Anwendungslogik/sonstig | 1139 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeLoadedData` | Persistenz/Migration/Recovery | 1147 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `importAppData` | Persistenz/Migration/Recovery | 1169 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `simpleArchiveIdentityForMerge` | Anwendungslogik/sonstig | 1175 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `mergePreloadedV41Archives` | Anwendungslogik/sonstig | 1179 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeLegacyData` | Anwendungslogik/sonstig | 1183 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizedTextKey` | Querschnitt/Hilfen | 1249 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isoPeriodToShortRange` | Querschnitt/Hilfen | 1253 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `dataSourceForMeta` | Anwendungslogik/sonstig | 1259 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureUnifiedBillingFields` | Anwendungslogik/sonstig | 1268 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveDataSource` | Archiv/Jahreswechsel | 1307 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `wohnungLabelForTenant` | Stammdaten/Mietverhältnisse | 1315 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `billingEntryForTenant` | Anwendungslogik/sonstig | 1321 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `knownArchiveCostContext` | Anwendungslogik/sonstig | 1331 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `importedEntryPeriodForCost` | Persistenz/Migration/Recovery | 1346 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `entryBriefValidationStatus` | Anwendungslogik/sonstig | 1354 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `applyExcelWaterReadings2024ToData` | Anwendungslogik/sonstig | 1361 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `saveData` | Persistenz/Migration/Recovery | 1421 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `commitStateChange` | Anwendungslogik/sonstig | 1470 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `fmtMoney` | Querschnitt/Hilfen | 1485 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `num` | Querschnitt/Hilfen | 1486 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `escapeHtml` | Querschnitt/Hilfen | 1487 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `escapeJsString` | Querschnitt/Hilfen | 1488 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `statusClass` | Anwendungslogik/sonstig | 1489 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeCostSettings` | Anwendungslogik/sonstig | 1498 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureCostSettings` | Anwendungslogik/sonstig | 1509 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `autoPriceForCost` | Anwendungslogik/sonstig | 1520 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isManualPriceOverride` | Anwendungslogik/sonstig | 1527 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `applyAutoPriceIfNeeded` | Anwendungslogik/sonstig | 1531 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `resetCostUnitPriceToAuto` | Anwendungslogik/sonstig | 1539 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isFreeCostSlot` | Anwendungslogik/sonstig | 1550 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `costGroupLabel` | Abrechnung/Berechnung | 1551 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `configureFreeCost` | Anwendungslogik/sonstig | 1564 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderCostSelectionPanel` | UI/Rendering/Navigation | 1573 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `priceCellHtml` | Anwendungslogik/sonstig | 1605 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openCostPriceEditor` | UI/Rendering/Navigation | 1618 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `closeCostPriceEditor` | UI/Rendering/Navigation | 1636 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `saveCostPriceFromDialog` | Persistenz/Migration/Recovery | 1642 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `resetCostPriceFromDialog` | Anwendungslogik/sonstig | 1649 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `kostenStatus` | Anwendungslogik/sonstig | 1655 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `recalculateAll` | Anwendungslogik/sonstig | 1671 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setNested` | Anwendungslogik/sonstig | 1677 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `editDisabledAttr` | Anwendungslogik/sonstig | 1694 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `selectHtml` | Anwendungslogik/sonstig | 1695 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `inputHtml` | Anwendungslogik/sonstig | 1698 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `dateInputHtml` | Querschnitt/Hilfen | 1699 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `hasTenantData` | Anwendungslogik/sonstig | 1701 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureTenantContactFields` | Stammdaten/Mietverhältnisse | 1705 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeUnitIdentityText` | Anwendungslogik/sonstig | 1723 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `canonicalUnitIdFor` | Anwendungslogik/sonstig | 1731 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `generatedUnitIdForLabel` | Anwendungslogik/sonstig | 1747 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `migrateUnitIdsInData` | Anwendungslogik/sonstig | 1752 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureTenantIdentityFields` | Stammdaten/Mietverhältnisse | 1798 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureTenantIdentityData` | Stammdaten/Mietverhältnisse | 1803 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantDisplayId` | Stammdaten/Mietverhältnisse | 1813 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantIdCellHtml` | Stammdaten/Mietverhältnisse | 1817 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureUnitIdentityFields` | Stammdaten/Mietverhältnisse | 1821 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureUnitIdentityData` | Stammdaten/Mietverhältnisse | 1827 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `unitDisplayId` | Stammdaten/Mietverhältnisse | 1831 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `unitByInternalId` | Stammdaten/Mietverhältnisse | 1835 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `unitDisplayIdByInternalId` | Stammdaten/Mietverhältnisse | 1840 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `unitIdCellHtml` | Stammdaten/Mietverhältnisse | 1844 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `unitRefCellHtml` | Stammdaten/Mietverhältnisse | 1848 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `unitSelectHtmlFromRows` | Stammdaten/Mietverhältnisse | 1852 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `unitSelectHtml` | Stammdaten/Mietverhältnisse | 1867 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `masterUnitSelectHtml` | Stammdaten/Mietverhältnisse | 1871 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureTenantContactData` | Stammdaten/Mietverhältnisse | 1875 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeMasterUnitRows` | Anwendungslogik/sonstig | 1880 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeBillingUnitRows` | Anwendungslogik/sonstig | 1899 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setBillingUnitStatus` | Anwendungslogik/sonstig | 1904 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeMasterTenantRows` | Anwendungslogik/sonstig | 1910 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `comparableTenantName` | Anwendungslogik/sonstig | 1924 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `applyKnownMasterTenantEntryDates` | Anwendungslogik/sonstig | 1933 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureStammdatenData` | Anwendungslogik/sonstig | 1958 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `masterData` | Stammdaten/Mietverhältnisse | 1972 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `masterUnits` | Stammdaten/Mietverhältnisse | 1977 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `masterTenants` | Stammdaten/Mietverhältnisse | 1981 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `masterTenantCount` | Stammdaten/Mietverhältnisse | 1985 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `masterVisibleTenantRows` | Stammdaten/Mietverhältnisse | 1989 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `masterArchivedTenantRows` | Stammdaten/Mietverhältnisse | 1995 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `nextMasterMietId` | Anwendungslogik/sonstig | 2001 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setMasterNested` | Anwendungslogik/sonstig | 2009 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `addMasterMietverhaeltnis` | Anwendungslogik/sonstig | 2019 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveMasterMietverhaeltnis` | Archiv/Jahreswechsel | 2053 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `restoreMasterMietverhaeltnis` | Persistenz/Migration/Recovery | 2062 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantBillingCopyFromMaster` | Stammdaten/Mietverhältnisse | 2070 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `applyStammdatenToCurrentBilling` | Stammdaten/Mietverhältnisse | 2089 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantBillingCopyFromMasterKeepValues` | Stammdaten/Mietverhältnisse | 2110 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `captureTenantIndexedValuesById` | Stammdaten/Mietverhältnisse | 2133 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `restoreTenantIndexedValuesById` | Persistenz/Migration/Recovery | 2147 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `captureUmlageInputsByTenantId` | Stammdaten/Mietverhältnisse | 2160 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `restoreUmlageInputsByTenantId` | Persistenz/Migration/Recovery | 2174 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `meterSnapshotRowScore` | Zähler/Verbrauch | 2186 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `captureMeterReadingsSnapshot` | Stammdaten/Mietverhältnisse | 2196 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `meterSnapshotRowForTenant` | Zähler/Verbrauch | 2236 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `restoreMeterReadingsAfterTenantSync` | Persistenz/Migration/Recovery | 2243 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `mergeStammdatenIntoCurrentBilling` | Anwendungslogik/sonstig | 2265 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `stammdatenComparableUnit` | Anwendungslogik/sonstig | 2285 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `stammdatenComparableTenant` | Anwendungslogik/sonstig | 2296 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `stammdatenBillingDiff` | Anwendungslogik/sonstig | 2317 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderBillingStammdatenStatus` | UI/Rendering/Navigation | 2335 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `applyStammdatenToCurrentBillingFromButton` | Stammdaten/Mietverhältnisse | 2349 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureZimmermannTenantForLegacyData` | Anwendungslogik/sonstig | 2363 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantLastName` | Stammdaten/Mietverhältnisse | 2419 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantAddressPrefix` | Stammdaten/Mietverhältnisse | 2426 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantMailingAddress` | Stammdaten/Mietverhältnisse | 2434 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantSalutationFromTemplate` | Stammdaten/Mietverhältnisse | 2441 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isArchivedTenant` | Anwendungslogik/sonstig | 2448 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isoDateSerial` | Querschnitt/Hilfen | 2452 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `billingPeriodSerials` | Anwendungslogik/sonstig | 2465 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantOverlapsPeriod` | Stammdaten/Mietverhältnisse | 2475 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantOverlapsCurrentPeriod` | Stammdaten/Mietverhältnisse | 2484 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantRelevantForCurrentBilling` | Stammdaten/Mietverhältnisse | 2488 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantActiveDaysInCurrentPeriod` | Stammdaten/Mietverhältnisse | 2492 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantOpenStatus` | Stammdaten/Mietverhältnisse | 2503 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `visibleTenantRows` | Anwendungslogik/sonstig | 2511 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archivedTenantRows` | Archiv/Jahreswechsel | 2517 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `nextMietId` | Anwendungslogik/sonstig | 2531 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `addMietverhaeltnis` | Anwendungslogik/sonstig | 2539 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveMietverhaeltnis` | Archiv/Jahreswechsel | 2576 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `restoreMietverhaeltnis` | Persistenz/Migration/Recovery | 2585 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantHeaderHtml` | Stammdaten/Mietverhältnisse | 2593 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `unitHeaderHtml` | Stammdaten/Mietverhältnisse | 2599 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderVersionInfo` | UI/Rendering/Navigation | 2606 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `qualitySeverityClass` | Anwendungslogik/sonstig | 2616 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `duplicateValues` | Anwendungslogik/sonstig | 2623 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `storageWritable` | Persistenz/Migration/Recovery | 2633 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantQualityLabel` | Stammdaten/Mietverhältnisse | 2637 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `hasCompleteMailingAddress` | Anwendungslogik/sonstig | 2641 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `costPrepaymentRow` | Abrechnung/Berechnung | 2645 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `activeTenantByUnitMap` | Anwendungslogik/sonstig | 2651 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `missingBriefFieldsForTenant` | Anwendungslogik/sonstig | 2661 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantPeriodInterval` | Stammdaten/Mietverhältnisse | 2672 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `intervalDaysInclusive` | Anwendungslogik/sonstig | 2683 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `expectedTenantDaysInCurrentPeriod` | Anwendungslogik/sonstig | 2688 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantIntervalsOverlap` | Stammdaten/Mietverhältnisse | 2692 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantIntervalLabel` | Stammdaten/Mietverhältnisse | 2698 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `billableRowsByUnit` | Anwendungslogik/sonstig | 2704 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tenantRowsHaveOverlappingIntervals` | Stammdaten/Mietverhältnisse | 2715 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `specialCaseSeverityClass` | Anwendungslogik/sonstig | 2725 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `specialCaseWatchReport` | Anwendungslogik/sonstig | 2731 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `specialCaseBadgesForTenant` | Anwendungslogik/sonstig | 2801 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderSpecialCaseWatch` | UI/Rendering/Navigation | 2818 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `finalBillingReportText` | Anwendungslogik/sonstig | 2843 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `acceptanceProtocolRowsHtml` | Anwendungslogik/sonstig | 2923 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `acceptanceProtocolHtml` | Anwendungslogik/sonstig | 2937 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderAcceptanceProtocolSummary` | UI/Rendering/Navigation | 2969 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `showAcceptanceProtocol` | UI/Rendering/Navigation | 2978 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `downloadAcceptanceProtocolHtml` | Export/Download | 2991 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `showFinalBillingReport` | UI/Rendering/Navigation | 2996 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `collectQualityChecks` | Anwendungslogik/sonstig | 3009 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `qualityAreaTab` | Anwendungslogik/sonstig | 3229 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `qualityItemKey` | Anwendungslogik/sonstig | 3243 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `qualityAckStore` | Anwendungslogik/sonstig | 3247 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `qualityAckFor` | Anwendungslogik/sonstig | 3253 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `qualityAckLabel` | Anwendungslogik/sonstig | 3257 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `acknowledgeQualityIssue` | Anwendungslogik/sonstig | 3264 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `reopenQualityIssue` | Anwendungslogik/sonstig | 3272 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `qualityIssueSearchText` | Anwendungslogik/sonstig | 3280 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `highlightQualityTarget` | Anwendungslogik/sonstig | 3284 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `jumpToQualityIssue` | Anwendungslogik/sonstig | 3301 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `jumpToFirstOpenQualityIssue` | Anwendungslogik/sonstig | 3307 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `showOnlyQualityErrors` | UI/Rendering/Navigation | 3316 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `qualityIssueActionHtml` | Anwendungslogik/sonstig | 3321 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `qualityTaskRowHtml` | Anwendungslogik/sonstig | 3334 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderQuality` | UI/Rendering/Navigation | 3340 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderDashboard` | UI/Rendering/Navigation | 3411 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `syncVorauszahlungen` | Anwendungslogik/sonstig | 3460 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setCostSetting` | Anwendungslogik/sonstig | 3477 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `activateDefaultPrepayments` | Anwendungslogik/sonstig | 3510 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `deactivateAllPrepayments` | Anwendungslogik/sonstig | 3530 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `activeCostRowsForMatrix` | Anwendungslogik/sonstig | 3536 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `syncKostenartenMieterUmlage` | Anwendungslogik/sonstig | 3542 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setCostTenantAllowed` | Anwendungslogik/sonstig | 3572 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `costTenantToggleHtml` | Abrechnung/Berechnung | 3583 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderKostenMieterUmlageMatrix` | UI/Rendering/Navigation | 3589 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `toggleCostRowSelection` | Anwendungslogik/sonstig | 3618 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `toggleAllVisibleCostRows` | Anwendungslogik/sonstig | 3625 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `updateCostSelectionUi` | UI/Rendering/Navigation | 3635 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `deactivateSelectedCosts` | Anwendungslogik/sonstig | 3664 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setCostPageSize` | Anwendungslogik/sonstig | 3690 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `toggleAllCostRows` | Anwendungslogik/sonstig | 3697 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openCostColumnInfo` | UI/Rendering/Navigation | 3702 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openCostSelectionDialog` | UI/Rendering/Navigation | 3707 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `closeCostSelectionDialog` | UI/Rendering/Navigation | 3721 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `activateCostFromDialog` | Anwendungslogik/sonstig | 3727 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderCostSelectionDialog` | UI/Rendering/Navigation | 3741 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `createFreeCostRow` | Anwendungslogik/sonstig | 3787 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `costUnitLabel` | Abrechnung/Berechnung | 3801 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `costDisplayGroup` | Abrechnung/Berechnung | 3812 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `costIsComplete` | Abrechnung/Berechnung | 3818 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderCostMockupOverview` | UI/Rendering/Navigation | 3822 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderEinstellungen` | UI/Rendering/Navigation | 3859 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderWohnungen` | UI/Rendering/Navigation | 3931 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderEinnahmen` | UI/Rendering/Navigation | 3997 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderKosten` | UI/Rendering/Navigation | 4057 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `addCostRow` | Anwendungslogik/sonstig | 4075 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureYearData` | Anwendungslogik/sonstig | 4081 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentAbrechnungsjahr` | Querschnitt/Hilfen | 4093 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `periodStart` | Querschnitt/Hilfen | 4098 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `periodEnd` | Querschnitt/Hilfen | 4103 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `periodLabelShort` | Querschnitt/Hilfen | 4108 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `periodYearFromDate` | Querschnitt/Hilfen | 4112 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setAbrechnungsjahr` | Anwendungslogik/sonstig | 4118 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setAbrechnungsperiode` | Anwendungslogik/sonstig | 4128 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `periodDaysExact` | Querschnitt/Hilfen | 4139 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderPeriodInfo` | UI/Rendering/Navigation | 4146 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveYearNumbers` | Archiv/Jahreswechsel | 4159 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `latestKnownYear` | Anwendungslogik/sonstig | 4164 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isViewingOlderArchiveYear` | Anwendungslogik/sonstig | 4170 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isArchiveViewer` | Anwendungslogik/sonstig | 4174 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isLegacyArchiveView` | Anwendungslogik/sonstig | 4178 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `startModeText` | Anwendungslogik/sonstig | 4182 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveReturnUrl` | Archiv/Jahreswechsel | 4188 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `closeArchiveViewer` | UI/Rendering/Navigation | 4192 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentAppMode` | Querschnitt/Hilfen | 4230 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `tabVisibleInMode` | Anwendungslogik/sonstig | 4234 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setAppMode` | Anwendungslogik/sonstig | 4239 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `enterBillingMode` | Anwendungslogik/sonstig | 4243 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `returnToStartPage` | Anwendungslogik/sonstig | 4250 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `initializeNavigationMode` | Anwendungslogik/sonstig | 4258 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `switchToTab` | UI/Rendering/Navigation | 4265 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `updateTopNavigationVisibility` | UI/Rendering/Navigation | 4298 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openCurrentBilling` | UI/Rendering/Navigation | 4313 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveRecordType` | Archiv/Jahreswechsel | 4326 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveRecordStatus` | Archiv/Jahreswechsel | 4330 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveRecordStatusClass` | Archiv/Jahreswechsel | 4337 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveStatusBadgeHtml` | Archiv/Jahreswechsel | 4344 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveRecordCorrections` | Archiv/Jahreswechsel | 4348 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveRecordSaldo` | Archiv/Jahreswechsel | 4360 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveMeta` | Archiv/Jahreswechsel | 4371 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveItemLabel` | Archiv/Jahreswechsel | 4375 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeArchiveItem` | Anwendungslogik/sonstig | 4382 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `prepareArchiveItemForUse` | Archiv/Jahreswechsel | 4386 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `collectArchiveIdMigrationWarnings` | Archiv/Jahreswechsel | 4390 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveItemValidation` | Archiv/Jahreswechsel | 4414 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveRecordHealth` | Archiv/Jahreswechsel | 4496 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `showArchiveValidation` | UI/Rendering/Navigation | 4501 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveActionButtonsHtml` | Archiv/Jahreswechsel | 4514 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveValidationMessage` | Archiv/Jahreswechsel | 4534 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archivePeriodId` | Archiv/Jahreswechsel | 4541 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveSortKey` | Archiv/Jahreswechsel | 4550 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archivePeriodLabel` | Archiv/Jahreswechsel | 4557 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveRecordStatusLite` | Archiv/Jahreswechsel | 4563 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveStatusBadgeLiteHtml` | Archiv/Jahreswechsel | 4569 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentBillingSaldoStartText` | Querschnitt/Hilfen | 4574 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentBillingStatusHtml` | Querschnitt/Hilfen | 4578 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `hasNonEmptyAnnualCurrentBillingData` | Anwendungslogik/sonstig | 4583 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isCurrentBillingClosedAfterArchive` | Anwendungslogik/sonstig | 4599 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `clearCurrentBillingArchiveClosure` | Anwendungslogik/sonstig | 4604 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `closeCurrentBillingAfterArchive` | UI/Rendering/Navigation | 4614 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `hasActiveCurrentBilling` | Anwendungslogik/sonstig | 4627 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `latestVisibleRecordYear` | Anwendungslogik/sonstig | 4635 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `markCurrentBillingCreatedByUser` | Anwendungslogik/sonstig | 4642 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentObjectLabel` | Querschnitt/Hilfen | 4650 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isBillingContextOpen` | Anwendungslogik/sonstig | 4662 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setBillingContextOpen` | Anwendungslogik/sonstig | 4666 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentBillingActionsHtml` | Querschnitt/Hilfen | 4671 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentBillingRecordRowHtml` | Querschnitt/Hilfen | 4682 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveRecordRowsHtml` | Archiv/Jahreswechsel | 4697 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `billingRecordsTableShell` | Anwendungslogik/sonstig | 4712 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `buildCurrentBillingTableHtml` | Anwendungslogik/sonstig | 4717 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `buildArchiveRecordsTableHtml` | Archiv/Jahreswechsel | 4722 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `buildBillingRecordsTableHtml` | Anwendungslogik/sonstig | 4727 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `yearExistsInRecords` | Querschnitt/Hilfen | 4732 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openCreateBillingModal` | UI/Rendering/Navigation | 4739 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `closeCreateBillingModal` | UI/Rendering/Navigation | 4756 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `randomDeleteCode` | Anwendungslogik/sonstig | 4764 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openDeleteBillingModal` | UI/Rendering/Navigation | 4768 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `closeDeleteBillingModal` | UI/Rendering/Navigation | 4794 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `confirmDeleteBilling` | Anwendungslogik/sonstig | 4801 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `createNewBillingFromModal` | Anwendungslogik/sonstig | 4821 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openLatestKnownYear` | UI/Rendering/Navigation | 4878 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `legacyArchiveEntries` | Archiv/Jahreswechsel | 4894 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderLegacyArchiveDetails` | UI/Rendering/Navigation | 4898 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `workflowDashboardReport` | Anwendungslogik/sonstig | 4931 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderWorkflowDashboard` | UI/Rendering/Navigation | 4955 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderStart` | UI/Rendering/Navigation | 4971 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderArchive` | UI/Rendering/Navigation | 4985 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderStartTenantManagement` | UI/Rendering/Navigation | 4997 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderStartUnitManagement` | UI/Rendering/Navigation | 5031 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `localStorageUsageBytes` | Anwendungslogik/sonstig | 5047 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `developerDiagnosticsData` | Anwendungslogik/sonstig | 5051 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `formatDiagnosticBytes` | Querschnitt/Hilfen | 5100 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderDeveloperDiagnostics` | UI/Rendering/Navigation | 5107 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `downloadDeveloperDiagnostics` | Export/Download | 5142 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `checkForAppUpdate` | Anwendungslogik/sonstig | 5148 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderSicherung` | UI/Rendering/Navigation | 5166 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `buildArchiveTableHtml` | Archiv/Jahreswechsel | 5172 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `replaceArchiveViewerPart` | Anwendungslogik/sonstig | 5183 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `createArchiveViewerHtml` | Anwendungslogik/sonstig | 5188 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveStateFromItem` | Archiv/Jahreswechsel | 5217 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openArchiveStateInApp` | UI/Rendering/Navigation | 5235 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveViewerFileName` | Archiv/Jahreswechsel | 5247 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openArchiveViewerDocument` | UI/Rendering/Navigation | 5253 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openArchiveYear` | UI/Rendering/Navigation | 5290 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `reopenArchiveYearForRework` | Archiv/Jahreswechsel | 5308 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `loadArchiveYear` | Archiv/Jahreswechsel | 5370 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `yearNumber` | Querschnitt/Hilfen | 5374 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `createYearSnapshot` | Archiv/Jahreswechsel | 5380 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `upsertYearArchive` | Archiv/Jahreswechsel | 5431 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveCurrentYearOnly` | Archiv/Jahreswechsel | 5457 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `hasEnteredMeterValue` | Anwendungslogik/sonstig | 5479 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeIsoDateValue` | Anwendungslogik/sonstig | 5483 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `periodDateStartForData` | Querschnitt/Hilfen | 5502 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `periodDateEndForData` | Querschnitt/Hilfen | 5508 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `monthStartIso` | Anwendungslogik/sonstig | 5514 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `activeMonthStartsForData` | Anwendungslogik/sonstig | 5518 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `monthTotalForPrepaymentCarryForward` | Anwendungslogik/sonstig | 5549 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `previousYearArchiveDataForCurrentBilling` | Anwendungslogik/sonstig | 5562 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `previousTenantRoleIsPrivate` | Anwendungslogik/sonstig | 5580 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeTenantMatchText` | Anwendungslogik/sonstig | 5585 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `findPreviousTenantIndexForCarryForward` | Anwendungslogik/sonstig | 5589 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `activePrepaymentMatrixHasValues` | Anwendungslogik/sonstig | 5610 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `prepaymentAdjustmentWasPrinted` | Abrechnung/Berechnung | 5619 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `effectivePrepaymentIsoFromPreviousData` | Anwendungslogik/sonstig | 5625 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `carryForwardPrepaymentsFromPreviousYear` | Anwendungslogik/sonstig | 5632 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensurePrepaymentCarryForwardIfNeeded` | Anwendungslogik/sonstig | 5689 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderPrepaymentCarryForwardNotice` | UI/Rendering/Navigation | 5704 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `carryMeterEndToStart` | Zähler/Verbrauch | 5719 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `periodStartForData` | Querschnitt/Hilfen | 5757 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `periodEndForData` | Querschnitt/Hilfen | 5763 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `numericMeterValueEquals` | Querschnitt/Hilfen | 5769 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isNewCurrentBillingData` | Anwendungslogik/sonstig | 5774 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `numericEndValuesWereManuallyTouchedForYear` | Querschnitt/Hilfen | 5784 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `clearAutofilledMeterEndValuesForNewBilling` | Anwendungslogik/sonstig | 5789 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `resetAnnualValuesForNextYear` | Anwendungslogik/sonstig | 5836 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archiveAndPrepareNextYear` | Archiv/Jahreswechsel | 5914 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `downloadArchiveYear` | Export/Download | 5929 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `downloadFullArchive` | Export/Download | 5944 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderYearArchive` | UI/Rendering/Navigation | 5962 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeLegacyImportText` | Anwendungslogik/sonstig | 5988 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `decodeLegacyArrayBuffer` | Anwendungslogik/sonstig | 5998 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `firstMatch` | Anwendungslogik/sonstig | 6011 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `parseEuroFromText` | Anwendungslogik/sonstig | 6016 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `legacyMoneyValues` | Anwendungslogik/sonstig | 6022 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `legacySlice` | Anwendungslogik/sonstig | 6028 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `parseLegacyLastMoneyInWindow` | Anwendungslogik/sonstig | 6040 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `parseLegacyMoneyAfter` | Anwendungslogik/sonstig | 6045 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `parseLegacyPeriodAfter` | Anwendungslogik/sonstig | 6053 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `nameFromLegacyFilename` | Anwendungslogik/sonstig | 6058 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `wohnungFromLegacyFilename` | Stammdaten/Mietverhältnisse | 6066 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isoFromLegacyShortDate` | Querschnitt/Hilfen | 6071 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `parseLegacyBillingFromText` | Anwendungslogik/sonstig | 6078 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `buildLegacyArchiveStateFromEntries` | Anwendungslogik/sonstig | 6139 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `createLegacyArchiveItemFromEntries` | Anwendungslogik/sonstig | 6199 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `importLegacyBillingFiles` | Persistenz/Migration/Recovery | 6224 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `resetData` | Anwendungslogik/sonstig | 6318 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `handleAppAction` | Anwendungslogik/sonstig | 6402 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeTenantActiveDays` | Anwendungslogik/sonstig | 6456 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `umlageBasisInfo` | Abrechnung/Berechnung | 6483 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `defaultWaterMeterSettings` | Anwendungslogik/sonstig | 6520 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `consumptionCosts` | Anwendungslogik/sonstig | 6532 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `isWaterCost` | Anwendungslogik/sonstig | 6536 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureWaterMeterData` | Zähler/Verbrauch | 6540 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `waterMeterRowStatus` | Zähler/Verbrauch | 6623 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `genericMeterRowStatus` | Zähler/Verbrauch | 6633 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `applyWaterMetersToUmlage` | Anwendungslogik/sonstig | 6643 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setWaterMeterSetting` | Anwendungslogik/sonstig | 6658 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setWaterMeterValue` | Anwendungslogik/sonstig | 6668 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setGenericMeterValue` | Anwendungslogik/sonstig | 6684 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `meterInput` | Zähler/Verbrauch | 6701 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `genericMeterInput` | Zähler/Verbrauch | 6707 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderWaterCostSection` | UI/Rendering/Navigation | 6713 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderGenericMeterSection` | UI/Rendering/Navigation | 6767 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `meterHistoryValue` | Zähler/Verbrauch | 6799 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `meterHistoryDeltaFor` | Zähler/Verbrauch | 6805 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `meterHistoryReadingFor` | Zähler/Verbrauch | 6810 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentMeterEndBlankStatus` | Querschnitt/Hilfen | 6815 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderWaterMeterCarryForwardNotice` | UI/Rendering/Navigation | 6838 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `archivedWaterHistoryByUnit` | Archiv/Jahreswechsel | 6846 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderWaterMeterHistory` | UI/Rendering/Navigation | 6868 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `hasWaterSettingValue` | Anwendungslogik/sonstig | 6877 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `houseMeterConsumption` | Anwendungslogik/sonstig | 6881 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `waterDifferenceState` | Zähler/Verbrauch | 6888 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `houseMeterMetricHtml` | Anwendungslogik/sonstig | 6901 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `waterValidationItemHtml` | Zähler/Verbrauch | 6908 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderWaterMeters` | UI/Rendering/Navigation | 6915 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `syncUmlageInputs` | Anwendungslogik/sonstig | 7019 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setManualInputMode` | Anwendungslogik/sonstig | 7041 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setManualExternalValue` | Anwendungslogik/sonstig | 7053 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `resetUmlageInputs` | Anwendungslogik/sonstig | 7057 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `updateTenantPrepaymentTotals` | UI/Rendering/Navigation | 7070 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderManualExternalValues` | UI/Rendering/Navigation | 7088 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderUmlage` | UI/Rendering/Navigation | 7111 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `todayIso` | Querschnitt/Hilfen | 7188 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `addDaysIso` | Querschnitt/Hilfen | 7196 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `dateDe` | Querschnitt/Hilfen | 7205 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `defaultPrepaymentAdjustmentSettings` | Anwendungslogik/sonstig | 7214 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensurePrepaymentAdjustmentSettings` | Anwendungslogik/sonstig | 7227 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setPrepaymentAdjustmentSetting` | Anwendungslogik/sonstig | 7245 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `prepaymentAdjustmentStatusClass` | Abrechnung/Berechnung | 7274 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderPrepaymentAdjustment` | UI/Rendering/Navigation | 7279 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `normalizeBriefDefaultTexts` | Anwendungslogik/sonstig | 7337 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `defaultBriefSettings` | Anwendungslogik/sonstig | 7353 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureBriefSettings` | Anwendungslogik/sonstig | 7392 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `setBriefSetting` | Anwendungslogik/sonstig | 7408 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `ensureBriefAddresses` | Anwendungslogik/sonstig | 7429 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `getBriefTenantAddress` | Anwendungslogik/sonstig | 7434 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `salutationForTenant` | Dokument/Brief/Druck | 7439 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `textareaHtml` | Anwendungslogik/sonstig | 7451 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `effectivePrepaymentDateLabel` | Anwendungslogik/sonstig | 7457 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `effectivePrepaymentYearLabel` | Anwendungslogik/sonstig | 7463 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `printHardeningReport` | Dokument/Brief/Druck | 7486 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentPrintHardeningReport` | Querschnitt/Hilfen | 7527 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `showPrintModeCheck` | UI/Rendering/Navigation | 7535 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `openPrintWindow` | UI/Rendering/Navigation | 7543 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `showAllLettersPrintReady` | UI/Rendering/Navigation | 7559 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `confirmBriefAction` | Anwendungslogik/sonstig | 7578 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderBrief` | UI/Rendering/Navigation | 7627 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `currentBriefPreviewOrWarn` | Querschnitt/Hilfen | 7687 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `printCurrentBrief` | Dokument/Brief/Druck | 7702 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `fallbackCopyText` | Anwendungslogik/sonstig | 7708 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `copyCurrentBriefText` | Anwendungslogik/sonstig | 7725 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `auditApproxEqual` | Anwendungslogik/sonstig | 7784 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `auditBaseState` | Anwendungslogik/sonstig | 7788 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `auditBriefState` | Anwendungslogik/sonstig | 7812 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `withAuditState` | Anwendungslogik/sonstig | 7851 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `releaseAuditReport` | Anwendungslogik/sonstig | 7867 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `releaseAuditReportText` | Anwendungslogik/sonstig | 8296 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `showReleaseAuditReport` | UI/Rendering/Navigation | 8307 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `downloadReleaseAuditReport` | Export/Download | 8313 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderReleaseAuditSummary` | UI/Rendering/Navigation | 8317 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `stableStringify` | Querschnitt/Hilfen | 8332 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `appSelfTestReport` | Anwendungslogik/sonstig | 8334 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `appSelfTestSummary` | Anwendungslogik/sonstig | 8641 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `runAppSelfTest` | Anwendungslogik/sonstig | 8654 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `activeTabId` | Anwendungslogik/sonstig | 8665 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `prepareStateForPersistence` | Anwendungslogik/sonstig | 8670 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderStepsForTab` | UI/Rendering/Navigation | 8698 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderCurrentView` | UI/Rendering/Navigation | 8703 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderStatusAndFeedbackSafely` | UI/Rendering/Navigation | 8730 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `closeAllTabAccordions` | UI/Rendering/Navigation | 8764 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `safeOverviewCall` | Anwendungslogik/sonstig | 8769 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `overviewMoney` | UI/Rendering/Navigation | 8773 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `overviewOpenSection` | UI/Rendering/Navigation | 8774 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `overviewCoreStats` | UI/Rendering/Navigation | 8780 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `overviewStatus` | UI/Rendering/Navigation | 8816 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `overviewStructuredValidation` | UI/Rendering/Navigation | 8821 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `buildOverviewData` | Anwendungslogik/sonstig | 8829 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderOverviewCards` | UI/Rendering/Navigation | 8862 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `overviewActionButton` | UI/Rendering/Navigation | 8903 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderOverviewForTab` | UI/Rendering/Navigation | 8909 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderAllOverviewCards` | UI/Rendering/Navigation | 8910 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `pageHeaderPeriodLabel` | UI/Rendering/Navigation | 8911 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `updateAllPageHeaders` | UI/Rendering/Navigation | 8918 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `auditV992Structure` | UI/Rendering/Navigation | 8947 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |
| `renderAll` | UI/Rendering/Navigation | 8968 | vorläufig erforderlich; weitere Extraktion nur mit eigenem Regressionpaket |

## Globale lexikalische Bindungen

| Name | Deklaration | Zuordnung | Zeile |
|---|---|---|---:|
| `NK_PRO_MODULES` | `const` | Konfiguration/Konstante | 1 |
| `UMLAGE_MANUAL` | `const` | Konfiguration/Konstante | 28 |
| `UMLAGE_MANUAL_LEGACY` | `const` | Konfiguration/Konstante | 29 |
| `APP_VERSION` | `const` | Konfiguration/Konstante | 30 |
| `APP_VERSION_NAME` | `const` | Konfiguration/Konstante | 31 |
| `APP_RELEASE_DATE` | `const` | Konfiguration/Konstante | 32 |
| `DATA_SCHEMA_VERSION` | `const` | Konfiguration/Konstante | 33 |
| `DATA_LAYER_CONTRACT_VERSION` | `const` | Konfiguration/Konstante | 34 |
| `ARCHIVE_SNAPSHOT_SCOPE` | `const` | Konfiguration/Konstante | 35 |
| `ARCHIVE_SNAPSHOT_DATA_KEYS` | `const` | Konfiguration/Konstante | 36 |
| `SNAPSHOT_TECHNICAL_META_KEYS` | `const` | Konfiguration/Konstante | 53 |
| `COST_EXCLUSION_FULL` | `const` | Konfiguration/Konstante | 84 |
| `COST_EXCLUSION_OWNER` | `const` | Konfiguration/Konstante | 85 |
| `COST_EXCLUSION_OPTIONS` | `const` | Konfiguration/Konstante | 86 |
| `MASTER_TENANT_ENTRY_DATE_FIX_ID` | `const` | Konfiguration/Konstante | 87 |
| `MASTER_TENANT_ENTRY_DATES` | `const` | Konfiguration/Konstante | 88 |
| `ARCHIVE_VIEW_MODE` | `const` | Konfiguration/Konstante | 95 |
| `APP_CHANGELOG` | `const` | Konfiguration/Konstante | 96 |
| `STORAGE_KEY` | `const` | veränderlicher Laufzeit-/UI-Zustand | 236 |
| `STORAGE_RECOVERY_KEY` | `const` | veränderlicher Laufzeit-/UI-Zustand | 237 |
| `STORAGE_PRE_MIGRATION_BACKUP_KEY` | `const` | veränderlicher Laufzeit-/UI-Zustand | 238 |
| `STORAGE_RESTORE_CHECKPOINT_KEY` | `const` | veränderlicher Laufzeit-/UI-Zustand | 239 |
| `STORAGE_INTEGRITY_ALGORITHM` | `const` | veränderlicher Laufzeit-/UI-Zustand | 240 |
| `APP_HTML_TEMPLATE` | `const` | Konfiguration/Konstante | 241 |
| `LEGACY_STORAGE_KEYS` | `const` | Konfiguration/Konstante | 242 |
| `STORAGE_WARN_BYTES` | `const` | veränderlicher Laufzeit-/UI-Zustand | 243 |
| `STORAGE_CRITICAL_BYTES` | `const` | veränderlicher Laufzeit-/UI-Zustand | 244 |
| `storageWarningShown` | `let` | veränderlicher Laufzeit-/UI-Zustand | 245 |
| `storageReadWarningShown` | `let` | veränderlicher Laufzeit-/UI-Zustand | 246 |
| `pendingStorageWarning` | `let` | Konfiguration/Konstante | 247 |
| `startupErrors` | `let` | veränderlicher Laufzeit-/UI-Zustand | 248 |
| `renderErrors` | `let` | veränderlicher Laufzeit-/UI-Zustand | 249 |
| `renderInProgress` | `let` | veränderlicher Laufzeit-/UI-Zustand | 250 |
| `renderQueued` | `let` | veränderlicher Laufzeit-/UI-Zustand | 251 |
| `renderCount` | `let` | veränderlicher Laufzeit-/UI-Zustand | 252 |
| `renderLastDurationMs` | `let` | veränderlicher Laufzeit-/UI-Zustand | 253 |
| `renderLastActiveTab` | `let` | veränderlicher Laufzeit-/UI-Zustand | 254 |
| `lastActionMessage` | `let` | veränderlicher Laufzeit-/UI-Zustand | 255 |
| `lastActionLevel` | `let` | veränderlicher Laufzeit-/UI-Zustand | 256 |
| `UNIT_ID_ALIASES` | `const` | Konfiguration/Konstante | 257 |
| `state` | `let` | veränderlicher Laufzeit-/UI-Zustand | 267 |
| `archiveReturnState` | `let` | veränderlicher Laufzeit-/UI-Zustand | 268 |
| `START_NAV_TABS` | `const` | Konfiguration/Konstante | 269 |
| `BILLING_NAV_TABS` | `const` | Konfiguration/Konstante | 270 |
| `appUiMode` | `let` | veränderlicher Laufzeit-/UI-Zustand | 271 |
| `billingContextOpen` | `let` | veränderlicher Laufzeit-/UI-Zustand | 272 |
| `navigationInitialized` | `let` | veränderlicher Laufzeit-/UI-Zustand | 273 |
| `DEFAULT_WATER_METER_HISTORY` | `const` | Konfiguration/Konstante | 458 |
| `finalizationWriteBypass` | `let` | Konfiguration/Konstante | 914 |
| `statePreparationInProgress` | `let` | veränderlicher Laufzeit-/UI-Zustand | 915 |
| `statePreparationCount` | `let` | veränderlicher Laufzeit-/UI-Zustand | 916 |
| `COST_GROUP_OPTIONS` | `const` | Konfiguration/Konstante | 1548 |
| `STANDARD_COST_GROUP_BY_ID` | `const` | Konfiguration/Konstante | 1549 |
| `activeCostPriceEditorIndex` | `let` | Konfiguration/Konstante | 1603 |
| `BILLING_VALUE_FIELDS_TO_KEEP` | `const` | Konfiguration/Konstante | 2097 |
| `costPageSize` | `let` | Konfiguration/Konstante | 3614 |
| `costShowAllRows` | `let` | Konfiguration/Konstante | 3615 |
| `selectedCostRows` | `let` | Konfiguration/Konstante | 3616 |
| `deleteBillingTargetIndex` | `let` | Konfiguration/Konstante | 4761 |
| `deleteBillingCode` | `let` | Konfiguration/Konstante | 4762 |
| `legacyImportEl` | `const` | Konfiguration/Konstante | 6333 |
| `jsonImportEl` | `const` | Konfiguration/Konstante | 6336 |
| `deleteCodeInputEl` | `const` | Konfiguration/Konstante | 6387 |
| `DEFAULT_UMLAGE_INPUTS` | `const` | Konfiguration/Konstante | 6443 |
| `MANUAL_INPUT_MODES` | `const` | Konfiguration/Konstante | 7015 |
| `tableFilters` | `const` | Konfiguration/Konstante | 7743 |
| `tableSortState` | `const` | Konfiguration/Konstante | 7744 |
| `tableLabels` | `const` | Konfiguration/Konstante | 7746 |
| `OVERVIEW_TITLES` | `const` | Konfiguration/Konstante | 8743 |
| `TAB_DEFINITIONS` | `const` | Konfiguration/Konstante | 8745 |
| `STARTUP_RESULT` | `const` | veränderlicher Laufzeit-/UI-Zustand | 9009 |
