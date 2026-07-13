<!-- AP9-CURRENT -->
# NK-Pro – Projektstand V99.4.10

**Stand:** 13. Juli 2026  
**Versionsname:** Physisch extrahierte Kernorchestrierung

AP9 ist abgeschlossen: 32 Implementierungen wurden physisch in drei Anwendungsmodulen ausgelagert, 28 überflüssige Übergangsweiterleitungen entfernt und `app.js` auf 8.287 Zeilen reduziert. Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandards 1 und Snapshot 2 bleiben unverändert. Nächstes Paket ist AP10 für Archiv-, Jahreswechsel-, Qualitäts- und Diagnoseorchestrierung; AP11 bleibt für Navigation und visuelles Grundsystem reserviert.

# NK-Pro – verbindlicher Projektstand

**Stand:** 12. Juli 2026  
**Anwendung:** V99.4.9  
**Versionsname:** Modularisierte Anwendungsaktionen und fachliche Orchestrierung  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1, unverändert  
**Objektstandard:** 1, unverändert  
**Zähler-/Messstandard:** 1, unverändert  
**Abrechnungssnapshot:** 2; Version 1 kompatibel  
**Architekturversion:** 2  
**Kompatibilitätsschicht:** 2  
**Ausgangsversion:** V99.4.6

**UI-Controllervertrag:** 1  
**UI-Ereignisvertrag:** 1  

## 1. Technische Grundlage

NK-Pro ist eine statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript. Es gibt kein React, kein TypeScript und kein Buildsystem. Node.js und Playwright dienen ausschließlich der Prüfung.

## 2. Produktive Ladefolge

1. `js/ui-preferences.js`
2. `js/navigation.js`
3. `js/modal-events.js`
4. `js/persistence.js`
5. `js/migration.js`
6. `js/backup-recovery.js`
7. `js/meter-master.js`
8. `js/meter-readings.js`
9. `js/meter-periods.js`
10. `js/meter-validation.js`
11. `js/object-standard.js`
12. `js/billing-snapshot.js`
13. `js/archive.js`
14. `js/billing-calculation.js`
15. `js/document-data.js`
16. `js/document-renderer.js`
17. `js/export-service.js`
18. `js/ui-table-tools.js`
19. `js/app-bootstrap.js`
20. `js/compatibility.js`
21. `js/default-seed.js`
22. `js/app.js`
23. `js/service-worker-register.js`

Direkte `localStorage`-Zugriffe sind ausschließlich in `persistence.js` und `ui-preferences.js` zulässig.

## 3. Fachliche Grundlagen

- `billing-calculation.js` ist die zentrale Abrechnungs- und Vorauszahlungsberechnung.
- AP5-Zählermodule bleiben verbindliche Quelle für Zähler, Messwerte, Perioden, Wechsel und Verbrauch.
- `document-data.js` erzeugt fachliche Brief- und Dokumentdaten.
- `document-renderer.js` erzeugt Brief- und Druck-HTML.
- `export-service.js` serialisiert und lädt vorhandene Werte herunter, ohne neu zu berechnen.
- `billing-snapshot.js` bleibt alleinige Snapshot-Hülle und Integritätsprüfung.

## 4. Monolith und Kompatibilität

`app.js` wurde von 10.248 auf 9.030 Zeilen reduziert. 112 bisherige Funktionsnamen bleiben als reine Kompatibilitätswrapper erhalten. 534 implementierte Top-Level-Funktionen und 71 globale lexikalische Bindungen verbleiben und sind vollständig inventarisiert.

## 5. Unveränderte Kompatibilität

V99.4.6-Daten können unverändert geladen werden. Datenschema, Datenebenenvertrag, Storage-Keys, Migrationen, Archive, Backups, Restore-Checkpoints, Snapshots und historische Daten bleiben kompatibel.

## 6. Prüfpflicht

Die Freigabe erfordert Syntax-, Fixture-, Zählerdomänen-, AP6-Architektur-, Release- und Playwright-Prüfungen sowie eine Wiederholung aus einer frisch entpackten finalen ZIP.
