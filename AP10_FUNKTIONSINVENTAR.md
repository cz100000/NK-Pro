# AP10 – Vollständiges Funktionsinventar

79 Implementierungen wurden aus `js/app.js` entfernt. Jede Zeile verweist auf die physische Zielimplementierung; AP10 hat dafür keine globale Kompatibilitätsweiterleitung angelegt.

| Ausgangsfunktion | Zeile vorher | Kategorie | Ziel | Zielzeile | Zustand/Seiteneffekt | Aufrufer umgestellt |
|---|---:|---|---|---:|---|---|
| `archiveRecordType` | 3670 | Archiv | `js/archive-actions.js::recordType` | 42 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveRecordStatus` | 3674 | Archiv | `js/archive-actions.js::recordStatus` | 214 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveRecordStatusClass` | 3681 | Archiv | `js/archive-actions.js::recordStatusClass` | 221 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveRecordCorrections` | 3692 | Archiv | `js/archive-actions.js::recordCorrections` | 83 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveRecordSaldo` | 3704 | Archiv | `js/archive-actions.js::recordSaldo` | 96 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveMeta` | 3715 | Archiv | `js/archive-actions.js::meta` | 44 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveItemLabel` | 3719 | Archiv | `js/archive-actions.js::itemLabel` | 76 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `normalizeArchiveItem` | 3726 | Archiv | `js/archive-actions.js::normalizeItem` | 34 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `prepareArchiveItemForUse` | 3730 | Archiv | `js/archive-actions.js::prepareItem` | 35 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `collectArchiveIdMigrationWarnings` | 3734 | Archiv | `js/archive-actions.js::collectIdMigrationWarnings` | 107 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveItemValidation` | 3758 | Archiv | `js/archive-actions.js::validateItem` | 132 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveRecordHealth` | 3840 | Archiv | `js/archive-actions.js::recordHealth` | 228 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveValidationMessage` | 3878 | Archiv | `js/archive-actions.js::validationMessage` | 233 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archivePeriodId` | 3885 | Archiv | `js/archive-actions.js::periodId` | 48 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveSortKey` | 3894 | Archiv | `js/archive-actions.js::sortKey` | 60 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archivePeriodLabel` | 3901 | Archiv | `js/archive-actions.js::periodLabel` | 67 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveRecordStatusLite` | 3907 | Archiv | `js/archive-actions.js::recordStatusLite` | 240 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `hasNonEmptyAnnualCurrentBillingData` | 3927 | Archiv | `js/archive-actions.js::hasNonEmptyAnnualData` | 245 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `isCurrentBillingClosedAfterArchive` | 3943 | Archiv | `js/archive-actions.js::isClosedAfterArchive` | 262 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `clearCurrentBillingArchiveClosure` | 3948 | Archiv | `js/archive-actions.js::clearClosure` | 267 | atomare Mutation, 1 Commit max. | js/archive-actions.js intern |
| `closeCurrentBillingAfterArchive` | 3958 | Archiv | `js/archive-actions.js::closeAfterArchive` | 278 | atomare Mutation, 1 Commit max. | js/archive-actions.js intern |
| `hasActiveCurrentBilling` | 3971 | Archiv | `js/archive-actions.js::hasActiveCurrentBilling` | 293 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `archiveStateFromItem` | 4561 | Archiv | `js/archive-actions.js::viewerStateFromItem` | 380 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `yearNumber` | 4718 | Archiv | `js/archive-actions.js::yearNumber` | 36 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `upsertYearArchive` | 4725 | Archiv | `js/archive-actions.js::upsertInto` | 302 | atomare Mutation, 1 Commit max. | js/archive-actions.js intern |
| `archiveCurrentYearOnly` | 4751 | Archiv | `js/archive-actions.js::archiveCurrent` | 322 | atomare Mutation, 1 Commit max. | NKProApplicationActions.archive<br>Archiv-UI/Import/Viewer<br>Dokument- und Exportlesepfade |
| `reopenArchiveYearForRework` | 4652 | Archiv | `js/archive-actions.js::reopenForRework` | 400 | atomare Mutation, 1 Commit max. | NKProApplicationActions.archive<br>Archiv-UI/Import/Viewer<br>Dokument- und Exportlesepfade |
| `buildLegacyArchiveStateFromEntries` | 5433 | Archiv | `js/archive-actions.js::buildLegacyArchiveState` | 452 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `createLegacyArchiveItemFromEntries` | 5493 | Archiv | `js/archive-actions.js::createLegacyArchiveItem` | 509 | lesend/seiteneffektfrei | js/archive-actions.js intern |
| `markCurrentBillingCreatedByUser` | 3986 | Jahreswechsel | `js/year-transition-actions.js::markCurrentBillingCreatedByUser` | 364 | atomare Mutation, 1 Commit max. | js/year-transition-actions.js intern |
| `normalizeIsoDateValue` | 4777 | Jahreswechsel | `js/year-transition-actions.js::normalizeIsoDateValue` | 29 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `periodDateStartForData` | 4796 | Jahreswechsel | `js/year-transition-actions.js::periodDateStartForData` | 48 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `periodDateEndForData` | 4802 | Jahreswechsel | `js/year-transition-actions.js::periodDateEndForData` | 54 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `monthStartIso` | 4808 | Jahreswechsel | `js/year-transition-actions.js::monthStartIso` | 60 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `activeMonthStartsForData` | 4812 | Jahreswechsel | `js/year-transition-actions.js::activeMonthStartsForData` | 64 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `monthTotalForPrepaymentCarryForward` | 4843 | Jahreswechsel | `js/year-transition-actions.js::monthTotalForCarryForward` | 95 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `previousYearArchiveDataForCurrentBilling` | 4856 | Jahreswechsel | `js/year-transition-actions.js::previousYearArchiveData` | 110 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `previousTenantRoleIsPrivate` | 4874 | Jahreswechsel | `js/year-transition-actions.js::previousTenantRoleIsPrivate` | 125 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `normalizeTenantMatchText` | 4879 | Jahreswechsel | `js/year-transition-actions.js::normalizeTenantMatchText` | 130 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `findPreviousTenantIndexForCarryForward` | 4883 | Jahreswechsel | `js/year-transition-actions.js::findPreviousTenantIndex` | 134 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `activePrepaymentMatrixHasValues` | 4904 | Jahreswechsel | `js/year-transition-actions.js::activePrepaymentMatrixHasValues` | 169 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `prepaymentAdjustmentWasPrinted` | 4913 | Jahreswechsel | `js/year-transition-actions.js::prepaymentAdjustmentWasPrinted` | 156 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `effectivePrepaymentIsoFromPreviousData` | 4919 | Jahreswechsel | `js/year-transition-actions.js::effectivePrepaymentIso` | 162 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `carryForwardPrepaymentsFromPreviousYear` | 4926 | Jahreswechsel | `js/year-transition-actions.js::carryForwardPrepayments` | 179 | atomare Mutation, 1 Commit max. | js/year-transition-actions.js intern |
| `ensurePrepaymentCarryForwardIfNeeded` | 4983 | Jahreswechsel | `js/year-transition-actions.js::ensurePrepaymentCarryForward` | 232 | atomare Mutation, 1 Commit max. | js/year-transition-actions.js intern |
| `carryMeterEndToStart` | 5013 | Jahreswechsel | `js/year-transition-actions.js::carryMeterEndToStart` | 249 | atomare Mutation, 1 Commit max. | js/year-transition-actions.js intern |
| `periodStartForData` | 5051 | Jahreswechsel | `js/year-transition-actions.js::periodStartForData` | 289 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `periodEndForData` | 5057 | Jahreswechsel | `js/year-transition-actions.js::periodEndForData` | 295 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `numericMeterValueEquals` | 5063 | Jahreswechsel | `js/year-transition-actions.js::numericMeterValueEquals` | 301 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `isNewCurrentBillingData` | 5068 | Jahreswechsel | `js/year-transition-actions.js::isNewCurrentBillingData` | 307 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `numericEndValuesWereManuallyTouchedForYear` | 5078 | Jahreswechsel | `js/year-transition-actions.js::numericEndValuesWereManuallyTouchedForYear` | 314 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `clearAutofilledMeterEndValuesForNewBilling` | 5083 | Jahreswechsel | `js/year-transition-actions.js::clearAutofilledMeterEndValues` | 319 | atomare Mutation, 1 Commit max. | js/year-transition-actions.js intern |
| `resetAnnualValuesForNextYear` | 5130 | Jahreswechsel | `js/year-transition-actions.js::resetAnnualValues` | 374 | atomare Mutation, 1 Commit max. | js/year-transition-actions.js intern |
| `yearExistsInRecords` | 4076 | Jahreswechsel | `js/year-transition-actions.js::yearExistsInRecords` | 435 | lesend/seiteneffektfrei | js/year-transition-actions.js intern |
| `archiveAndPrepareNextYear` | 5208 | Jahreswechsel | `js/year-transition-actions.js::prepareNextYear` | 479 | atomare Mutation, 1 Commit max. | NKProApplicationActions.yearTransition<br>Startseiten-UI<br>Archiv-/Snapshotkoordination |
| `duplicateValues` | 2091 | Qualität | `js/quality-assurance.js::duplicateValues` | 28 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `tenantQualityLabel` | 2105 | Qualität | `js/quality-assurance.js::tenantQualityLabel` | 38 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `activeTenantByUnitMap` | 2119 | Qualität | `js/quality-assurance.js::activeTenantByUnitMap` | 42 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `missingBriefFieldsForTenant` | 2129 | Qualität | `js/quality-assurance.js::missingBriefFieldsForTenant` | 52 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `tenantPeriodInterval` | 2140 | Qualität | `js/quality-assurance.js::tenantPeriodInterval` | 62 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `intervalDaysInclusive` | 2151 | Qualität | `js/quality-assurance.js::intervalDaysInclusive` | 73 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `expectedTenantDaysInCurrentPeriod` | 2156 | Qualität | `js/quality-assurance.js::expectedTenantDaysInCurrentPeriod` | 78 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `tenantIntervalsOverlap` | 2160 | Qualität | `js/quality-assurance.js::tenantIntervalsOverlap` | 82 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `tenantIntervalLabel` | 2166 | Qualität | `js/quality-assurance.js::tenantIntervalLabel` | 88 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `billableRowsByUnit` | 2172 | Qualität | `js/quality-assurance.js::billableRowsByUnit` | 94 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `tenantRowsHaveOverlappingIntervals` | 2183 | Qualität | `js/quality-assurance.js::tenantRowsHaveOverlappingIntervals` | 105 | lesend/seiteneffektfrei | js/quality-assurance.js intern |
| `specialCaseWatchReport` | 2199 | Qualität | `js/quality-assurance.js::specialCases` | 413 | lesend/seiteneffektfrei | Qualitäts-Cockpit<br>Workflow-Dashboard<br>Dokument-Preflight |
| `collectQualityChecks` | 2477 | Qualität | `js/quality-assurance.js::inspect` | 409 | lesend/seiteneffektfrei | Qualitäts-Cockpit<br>Workflow-Dashboard<br>Dokument-Preflight |
| `finalBillingReadiness` | 2303 | Qualität | `js/quality-assurance.js::finalBillingReadiness` | 417 | lesend/seiteneffektfrei | Qualitäts-Cockpit<br>Workflow-Dashboard<br>Dokument-Preflight |
| `auditApproxEqual` | 6940 | Diagnose | `js/diagnostics.js::auditApproxEqual` | 60 | lesend/seiteneffektfrei | js/diagnostics.js intern |
| `auditBaseState` | 6944 | Diagnose | `js/diagnostics.js::auditBaseState` | 64 | lesend/seiteneffektfrei | js/diagnostics.js intern |
| `auditBriefState` | 6968 | Diagnose | `js/diagnostics.js::auditBriefState` | 88 | lesend/seiteneffektfrei | js/diagnostics.js intern |
| `withAuditState` | 7007 | Diagnose | `js/diagnostics.js::withAuditState` | 127 | lesend/seiteneffektfrei | js/diagnostics.js intern |
| `releaseAuditReport` | 7023 | Diagnose | `js/diagnostics.js::releaseAuditReport` | 143 | lesend/seiteneffektfrei | Release-Audit-UI<br>App-Selbsttest<br>automatisierte Browsertests |
| `releaseAuditReportText` | 7452 | Diagnose | `js/diagnostics.js::releaseAuditReportText` | 569 | lesend/seiteneffektfrei | Release-Audit-UI<br>App-Selbsttest<br>automatisierte Browsertests |
| `appSelfTestReport` | 7490 | Diagnose | `js/diagnostics.js::appSelfTestReport` | 580 | lesend/seiteneffektfrei | Release-Audit-UI<br>App-Selbsttest<br>automatisierte Browsertests |
| `appSelfTestSummary` | 7802 | Diagnose | `js/diagnostics.js::appSelfTestSummary` | 891 | lesend/seiteneffektfrei | Release-Audit-UI<br>App-Selbsttest<br>automatisierte Browsertests |
| `stableStringify` | 7488 | Diagnose | `js/diagnostics.js::stableStringify` | 43 | lesend/seiteneffektfrei | js/diagnostics.js intern |
| `formatDiagnosticBytes` | 4444 | Diagnose | `js/diagnostics.js::formatBytes` | 35 | lesend/seiteneffektfrei | js/diagnostics.js intern |

Das maschinenlesbare Inventar `AP10_FUNKTIONSINVENTAR.json` enthält zusätzlich Eingaben, Rückgaben, gelesene und geschriebene Zustandsbereiche, DOM-/Speicherabhängigkeiten, Fachmodule, Validierung, Persistenz-, Rendering- und Kompatibilitätsentscheidungen.
