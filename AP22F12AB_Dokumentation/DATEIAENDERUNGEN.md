# AP22F12A/B – Liste aller geänderten Dateien

**Basis:** V99.4.65  
**Release:** V99.4.66  
**Geänderte/ergänzte Dateien:** 46

| Änderung | Datei | Zweck |
|---|---|---|
| added | `AP22F10C_Dokumentation/DATEIAENDERUNGEN.md` | Releasebezogene Änderung. |
| added | `AP22F10G_B_Dokumentation/DATEIAENDERUNGEN.json` | Releasebezogene Änderung. |
| added | `AP22F10G_B_Dokumentation/DATEIAENDERUNGEN.md` | Releasebezogene Änderung. |
| added | `AP22F10G_B_Korrektur1_Dokumentation/DATEIAENDERUNGEN.json` | Releasebezogene Änderung. |
| added | `AP22F10G_B_Korrektur1_Dokumentation/DATEIAENDERUNGEN.md` | Releasebezogene Änderung. |
| added | `AP22F10G_B_Korrektur2_Dokumentation/DATEIAENDERUNGEN.md` | Releasebezogene Änderung. |
| added | `AP22F12AB_Dokumentation/ABSCHLUSSBERICHT.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/BESTANDSBERICHT.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/DATEIAENDERUNGEN.json` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/DATEIAENDERUNGEN.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/DATENMODELLAENDERUNGEN.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/DOKUMENTENINVENTAR.json` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/DOKUMENTENINVENTAR.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/EXPORTFUNKTIONEN.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/FACHLICHER_UMSETZUNGSBERICHT.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/FACHLICHES_ZIELMODELL_UND_DATENFLUSS.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/MIGRATIONSBERICHT.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/PRUEFREGELN.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/RESTPUNKTE.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/TECHNISCHER_AENDERUNGSBERICHT.md` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/TESTERGEBNISSE.json` | AP22F12A/B-Release-Dokumentation. |
| added | `AP22F12AB_Dokumentation/TEST_UND_REGRESSIONSBERICHT.md` | AP22F12A/B-Release-Dokumentation. |
| modified | `assets/app.css` | Responsive Seiten-, Tabellen-, Status- und Dialogstile für AP22F12. |
| modified | `index.html` | Neue Analyseseite, Statusintegration, Dialoge und Skriptladung. |
| modified | `js/app-runtime-config.js` | Release V99.4.66, Modulpflicht und Snapshot-Positivliste. |
| modified | `js/app-state-persistence.js` | Neutrale Normalisierung/Migration des neuen Containers. |
| modified | `js/app.js` | Konfiguration des Fachmoduls und Anwendungsaktionsdomäne. |
| modified | `js/billing-context.js` | Schreibschutzfreigaben für AP22F12-Aktionen. |
| modified | `js/billing-review.js` | Scope-Trennung bestehender Prüfentscheidungen. |
| added | `js/cost-reconciliation.js` | Neues Fach- und Berechnungsmodul. |
| modified | `js/navigation.js` | Neuer Navigationseintrag im Bereich Analyse. |
| modified | `js/quality-system-k4.js` | Neue Regel NKP-ANALYSE-001 und Abschlusswirkung. |
| modified | `js/service-worker-register.js` | Neuer Build-Token für Cache-Aktualisierung. |
| modified | `js/ui-bindings.js` | Zentrale UI-Aktionen und Controllerbindung. |
| added | `js/ui-cost-reconciliation.js` | Neue produktive UI, Dialoge und Exporte. |
| modified | `js/ui-page-controller.js` | Seitenregistrierung und Renderintegration. |
| modified | `js/ui-quality-k4.js` | Kompakter Status auf Prüfen und abschließen. |
| modified | `manifest.webmanifest` | PWA-Version V99.4.66. |
| modified | `nk-pro-project.json` | Projekt-/Release-Metadaten. |
| modified | `package.json` | Paketversion und AP22F12-Testskripte. |
| modified | `service-worker.js` | Neue App-Shell-Assets und Cache V99.4.66. |
| modified | `tests/ap21b2-navigation-centralization.test.cjs` | Erwartete zentrale Navigationsreihenfolge erweitert. |
| modified | `tests/ap22f11b-korrektur4.test.cjs` | Aktuelle Release-Metadaten bei unveränderten K4-Prüfungen. |
| added | `tests/ap22f12-cost-reconciliation.test.cjs` | Neue Fachlogik-, Migration- und Roundtriptests. |
| added | `tests/ap22f12-integration.test.cjs` | Neue statische Integrations- und Releaseprüfungen. |
| modified | `tests/ap7-ui-integration.test.cjs` | Controller-/Aktionsanzahl für neue UI erweitert. |

Die JSON-Fassung enthält zusätzlich die SHA-256-Werte der Ausgangs- und Release-Dateien. Für die beiden selbstbeschreibenden Änderungslisten wird kein eigener Release-Hash in der Liste geführt.
