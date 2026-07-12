# NK-Pro – verbindlicher Projektstand

**Stand:** 12. Juli 2026  
**Anwendung:** V99.4.6  
**Versionsname:** Zählerstammdaten und Messperioden  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1, unverändert  
**Objektstandard:** 1, unverändert  
**Zähler-/Messstandard:** 1  
**Abrechnungssnapshot:** 2; Version 1 kompatibel  
**Ausgangsversion:** V99.4.5

## 1. Technische Grundlage

NK-Pro ist eine statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript. Es gibt kein React, kein TypeScript und kein Buildsystem. Node.js und Playwright dienen nur der Prüfung.

## 2. Produktive Ladefolge

1. `js/navigation.js`
2. `js/modal-events.js`
3. `js/persistence.js`
4. `js/migration.js`
5. `js/backup-recovery.js`
6. `js/meter-master.js`
7. `js/meter-readings.js`
8. `js/meter-periods.js`
9. `js/meter-validation.js`
10. `js/object-standard.js`
11. `js/billing-snapshot.js`
12. `js/archive.js`
13. `js/default-seed.js`
14. `js/app.js`
15. `js/service-worker-register.js`

Nur `js/persistence.js` greift direkt auf `localStorage` zu.

## 3. Verbindliche Datenebenen

- schreibbarer aktueller Arbeitsstand,
- Objektstammdaten in `stammdaten`,
- additive Objektprojektion in `objektStandard`,
- getrennte operative Zählerdaten in `zaehlerDaten`,
- globale historische Wasserzählerdaten in `waterMeterHistory`,
- begrenzter, unveränderlicher Abrechnungssnapshot,
- Jahresarchiv,
- vollständige Gesamtsicherung,
- Recovery-Stand,
- Vor-Migrationssicherung,
- Restore-Checkpoint.

## 4. Zählerstandard 1

Jeder Zähler besitzt eine stabile Zähler-ID. Stammdaten werden nicht je Abrechnungsjahr oder Ableseperiode dupliziert. Messwerte besitzen eigene IDs, Ablesedatum, Messzeitraum, Wert, Einheit, Herkunft, Erfassungszeitpunkt, Status, Plausibilitätsstatus und gegebenenfalls Ersetzungsreferenz.

Messperioden verbinden zwei aktive Messwerte desselben Zählers. Sie speichern Anfangs-/Endstand, Verbrauch, Einheit, Schätz-/Korrekturkennzeichen, Überlaufstatus und zeitanteilige Zuordnungen. Zählerwechsel erhalten eine eigene ID und verknüpfen alten und neuen Zähler ohne Identitätsänderung.

## 5. Snapshot 2

Snapshot 2 enthält die für den Abrechnungszeitraum verwendeten Zählerstammdaten, Messwerte, Messperioden, Zuordnungen, Wechsel und ausgeschlossenen Zähler mit Grund. Er bleibt prüfsummengeschützt und rekursiv unveränderlich. Snapshot 1 bleibt lesbar und unverändert.

## 6. Migration und Kompatibilität

Die Migration `metering-standard-v1` ist additiv, idempotent und transaktional. Vor einer notwendigen Änderung wird das bestehende Sicherungsfundament verwendet. Legacy-Felder bleiben erhalten; unbekannte Felder werden mitgeführt. Datenschema 5 und Datenebenenvertrag 1 ändern sich nicht.

## 7. Stromzähler-Dummy

`electricity-dummy` erhält eine stabile ID, kann Messwerte und Historie speichern und bleibt in Export, Sicherung, Restore und Snapshot enthalten. Er ist zwingend nicht abrechnungsrelevant und wird von zentraler Validierung und Verbrauchsermittlung ausgeschlossen.

## 8. Nächster sinnvoller Schritt

Die UI-Erfassung kann in einem Folgearbeitspaket direkt auf die getrennten Fachmodule umgestellt werden. Bis dahin bleiben die Legacy-Formulare kompatible Eingabeadapter.
