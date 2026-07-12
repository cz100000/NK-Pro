# NK-Pro – verbindlicher Projektstand

**Stand:** 12. Juli 2026  
**Anwendung:** V99.4.5  
**Versionsname:** Objektstandard und Abrechnungssnapshot  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1, unverändert  
**Objektstandard:** 1  
**Abrechnungssnapshot:** 1  
**Ausgangsversion:** V99.4.4

## 1. Technische Grundlage

NK-Pro ist eine statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript. Es gibt kein React, kein TypeScript und kein Buildsystem. Node.js und Playwright dienen nur der Prüfung.

## 2. Produktive Ladefolge

1. `js/navigation.js`
2. `js/modal-events.js`
3. `js/persistence.js`
4. `js/migration.js`
5. `js/backup-recovery.js`
6. `js/object-standard.js`
7. `js/billing-snapshot.js`
8. `js/archive.js`
9. `js/default-seed.js`
10. `js/app.js`
11. `js/service-worker-register.js`

Die sechs Fach-/Infrastrukturmodule werden als eingefrorene Namensräume geladen. Nur `js/persistence.js` greift direkt auf `localStorage` zu.

## 3. Verbindliche Datenebenen

- schreibbarer aktueller Arbeitsstand,
- Objektstammdaten in `stammdaten`,
- additive Objektprojektion in `objektStandard`,
- globale Zählerhistorie in `waterMeterHistory`,
- begrenzter, unveränderlicher Abrechnungssnapshot,
- Jahresarchiv aus vollständigen oder ausdrücklich gekennzeichneten Legacy-Snapshots,
- vollständige Gesamtsicherung,
- Recovery-Stand,
- Vor-Migrationssicherung,
- Restore-Checkpoint.

## 4. Objektstandard und Snapshot

Objektstandard 1 bildet Objekt, Gebäude, Einheiten, Eigentümer, Partner, Verträge, Kostenarten, Verteilerschlüssel, Vorauszahlungen, Zähler, Verbrauchsstellen, Abrechnungszeiträume und Einstellungen ab. Bestehende Quellfelder bleiben erhalten.

Abrechnungssnapshot 1 besitzt eindeutige ID, Objekt-/Zeitraumbezug, Versionen, Berechnungsgrundlagen, Berechnungsergebnis, strukturierte Validierung, Zählerauswahl, begrenzte Daten, rekursive Unveränderlichkeit und Prüfsumme.

Der Typ `electricity-dummy` ist speicher- und exportfähig, aber mit `abrechnungsrelevant: false` und `billingRole: excluded` vollständig aus der Abrechnung ausgeschlossen.

## 5. Migration und Kompatibilität

- Schemaregistry weiterhin `1→2`, `2→4`, `3→4`, `4→5`.
- Additive Migration `object-standard-v1` bei fehlender oder falscher Objektstandardversion.
- Vor dieser Migration entsteht auch bei Schema 5 eine externe, validierte Vor-Migrationssicherung.
- Historische Archive werden nicht fachlich neu interpretiert.
- Vollständige neue Snapshots werden vor Archivierung und Import per Prüfsumme validiert.
- Bestehende V99.4.4-Daten, Backups, Recovery-Daten und Archive bleiben nutzbar.

## 6. Freigabenachweis

- 12/12 JavaScript-Einheiten syntaktisch fehlerfrei,
- 6/6 Referenzfälle semantisch unverändert,
- 35/36 Playwright-/Chromium-Tests,
- Objektstandardmigration mit Vor-Migrationssicherung,
- strukturierte Blockade ungültiger Snapshots,
- Snapshot-Unveränderlichkeit und Manipulationserkennung,
- Erhalt historischer Facharrays als `legacy-partial`,
- vollständiger Dummy-Ausschluss,
- Restore-, Rollback-, Archiv-, Import-, Export-, PWA- und UI-Regression.

## 7. Verbleibende Grenze

Die additive Objektprojektion ersetzt noch nicht sämtliche historischen UI-Quellarrays. Die physische Trennung dauerhafter Zählerstammdaten von periodischen Messwerten bleibt ein eigenes Folgearbeitspaket.
