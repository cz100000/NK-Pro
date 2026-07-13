# AP12 – Zustandsinventar und Schreibrechte

## Grundsatz

`state` ist die einzige fachliche Arbeitswahrheit. `app-runtime-config.js` hält nur den kontrollierten Laufzeitbezug; `app-state-persistence.js` erzeugt und ersetzt den Root-State. Vollständige Zustandsersetzungen wurden projektweit von 10 auf **eine** Eigentümerfunktion reduziert. UI-Zustände, Navigation, Dialoge und abgeleitete Anzeigen erzeugen keine zweite fachliche Wahrheit.

| Zustand | Besitzer | wesentliche Leser | Schreiber | persistiert | abgeleitet | Maßnahme |
|---|---|---|---|---|---|---|
| `meta` | app-state-persistence.js / fachlich zuständige Aktionen | app-state-persistence.js, diagnostics.js, quality-assurance.js, ui-archive-pages.js, ui-documents.js, ui-master-data.js, ui-metering.js, ui-navigation-pages.js … | app-state-persistence.js, diagnostics.js, ui-documents.js, ui-master-data.js, ui-metering.js, ui-navigation-pages.js, ui-quality.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `stammdaten` | master-data-actions.js |  |  | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `wohnungen` | master-data-actions.js / ui-master-data.js | billing-calculation.js, diagnostics.js, quality-assurance.js, ui-costs.js, ui-master-data.js, ui-page-controller.js, ui-quality.js | diagnostics.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `mieter` | master-data-actions.js / ui-master-data.js | billing-calculation.js, diagnostics.js, export-service.js, quality-assurance.js, ui-costs.js, ui-master-data.js, ui-metering.js, ui-page-controller.js | diagnostics.js, ui-master-data.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `kostenarten` | cost-actions.js / ui-costs.js | billing-calculation.js, diagnostics.js, export-service.js, quality-assurance.js, ui-billing-allocation.js, ui-costs.js, ui-master-data.js, ui-metering.js … | diagnostics.js, ui-costs.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `vorauszahlungen` | cost-actions.js / billing-workflow.js | billing-calculation.js, diagnostics.js, quality-assurance.js, ui-costs.js, ui-master-data.js | diagnostics.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `umlageInputs` | billing-workflow.js / ui-billing-allocation.js | billing-calculation.js, diagnostics.js, document-data.js, quality-assurance.js, ui-billing-allocation.js, ui-metering.js, ui-page-controller.js | diagnostics.js, ui-metering.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `kostenartenMieterUmlage` | cost-actions.js | billing-calculation.js, diagnostics.js | diagnostics.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `waterMeters` | meter-* / ui-metering.js | billing-calculation.js, diagnostics.js, quality-assurance.js, ui-metering.js, ui-page-controller.js | ui-metering.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `meterReadings` | meter-* / ui-metering.js | billing-calculation.js, ui-metering.js | ui-metering.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `briefSettings` | ui-documents.js / document-data.js | document-data.js, document-renderer.js, ui-documents.js, ui-navigation-pages.js | ui-documents.js, ui-navigation-pages.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `briefAddresses` | ui-documents.js | ui-documents.js | ui-documents.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `prepaymentAdjustmentSettings` | billing-workflow.js / ui-documents.js | billing-calculation.js, diagnostics.js, ui-documents.js | diagnostics.js, ui-documents.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `jahresArchiv` | archive-actions.js | diagnostics.js, export-service.js, quality-assurance.js, ui-archive-pages.js, ui-metering.js, ui-navigation-pages.js, ui-page-controller.js | diagnostics.js, ui-navigation-pages.js | ja | nein | Einzelzustand bleibt maßgeblich; Schreibrechte sind dem Owner bzw. kontrollierten Aktionen zugeordnet. |
| `active page / app mode` | navigation.js und ui-page-controller.js | navigation.js, ui-page-controller.js | navigation.js | nein | ja | Sichtbare Seite und aktive Navigation werden aus demselben Navigationszustand abgeleitet. |
| `runtime diagnostics` | runtime-diagnostics.js | Tests/Diagnoseansicht | app.js, ui-diagnostics.js | nein | ja | Vier einzelne window.__…-Bindungen durch ein eingefrorenes Diagnose-Namespace ersetzt. |
| `UI preferences` | ui-preferences.js | ui-preferences.js | ui-preferences.js | ja | nein | Getrennt vom Fachzustand über begrenzten localStorage-Adapter. |


## Schreibregeln

- Root-Ersetzung ausschließlich über `replaceApplicationState(nextState)`.
- Persistenz ausschließlich über die vorhandenen Persistenz- und Commitpfade.
- Fachliche Mutationen nur in Eigentümer-, Aktions- oder ausdrücklich konfigurierten UI-Controllerpfaden.
- Renderer sind schreibfrei.
- Abgeleitete Werte werden in Berechnung, Dokumentdaten oder Renderer erzeugt und nicht als paralleler Fachzustand geführt.

Maschinenlesbare Details: `AP12_ZUSTANDSINVENTAR.json`.
