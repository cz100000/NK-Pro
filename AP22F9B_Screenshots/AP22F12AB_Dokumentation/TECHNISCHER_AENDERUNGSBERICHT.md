# AP22F12A/B – Technischer Änderungsbericht

**Release:** V99.4.66  
**Stand:** 02.08.2026

## 1. Neue Module

### `js/cost-reconciliation.js`

Neues Fachmodul für:

- neutrale Datenmigration,
- tatsächliche Zahlungsflüsse,
- Kostenübersteuerungen,
- Differenzzuordnungen,
- Einbindung bestehender Prüfentscheidungen,
- Mehrjahresmodell aus aktuellem Bestand und Jahresarchiven,
- getrennte Kontroll- und Statuslogik,
- Prüf-/Freigabestatus.

Das Modul mutiert keine DOM-Struktur und schreibt ausschließlich über `NKProStateAccess.transact()`.

### `js/ui-cost-reconciliation.js`

Neue UI-Schicht für:

- vollständiges Seitenrendering,
- Zeitraumwahl,
- Zahlungs-, Zuordnungs- und Kostenartendialoge,
- Detailtabellen,
- Excel-, Druck/PDF- und Prüfprotokollexport.

## 2. Bestehende Module erweitert

- `index.html`: neue Seite, Ergebnisbereich und drei Dialoge; neue Skripte.
- `assets/app.css`: responsive Seitengitter, Tabellen, Status- und Dialogstile.
- `js/navigation.js`: neuer Analyse-Navigationseintrag.
- `js/ui-page-controller.js`: Seitenregistrierung und Renderweg.
- `js/ui-bindings.js`: zentrale AP22F12-Aktionsbindung.
- `js/app.js`: Fachmodulkonfiguration und Anwendungsaktionsdomäne.
- `js/app-runtime-config.js`: Versionsstand, Modulpflicht und Snapshot-Positivliste.
- `js/app-state-persistence.js`: neutrale Migration bei Arbeitsstand und Snapshot.
- `js/billing-context.js`: Schreibschutz-/Kontextfreigaben für neue Aktionen.
- `js/billing-review.js`: Scope-Trennung der bestehenden Entscheidungslogik.
- `js/quality-system-k4.js`: Regel `NKP-ANALYSE-001` ohne pauschale Abschlussblockade.
- `js/ui-quality-k4.js`: kompakter AP22F12-Status auf „Prüfen und abschließen“.
- `service-worker.js`, `js/service-worker-register.js`, `manifest.webmanifest`: Offline-/Versionsintegration.
- `package.json`, `nk-pro-project.json`: Release- und Testkonfiguration.

## 3. Architekturkonformität

- keine Parallelarchitektur,
- vorhandener Router und Navigation,
- vorhandener zentraler Zustandszugriff,
- vorhandene Persistenz-/Migrationspfade,
- vorhandenes Prüfentscheidungsregister,
- vorhandene zentrale Qualitätsseite,
- lokale browserbasierte Export-/Druckwege,
- keine externe Laufzeitabhängigkeit ergänzt.

## 4. Releaseversion

- sichtbare Version: V99.4.66
- Paketversion: 99.4.66
- Build/Cache: `99.4.66-ap22f12ab`
- Releasedatum: 2026-08-02
