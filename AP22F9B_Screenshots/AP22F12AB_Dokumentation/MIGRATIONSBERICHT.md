# AP22F12A/B – Migrations-, Persistenz- und Sicherungsbericht

## 1. Migrationsprinzip

Die Migration ist additiv, idempotent und rückwärtskompatibel. Das Datenschema bleibt 5. Beim Normalisieren eines Arbeitsstands oder Snapshots ruft `app-state-persistence.js` die Funktion `NKProCostReconciliation.ensureData(data)` auf.

## 2. Verhalten bei älteren Datenbeständen

Fehlt `kostenUmlagenAbgleich`, wird ausschließlich ein neutraler leerer Container angelegt:

- keine Zahlungen,
- keine Kostenübersteuerungen,
- keine Differenzzuordnungen,
- Prüfstatus Entwurf,
- keine fiktiven Beträge.

Vorhandene, teilweise ergänzte Container erhalten fehlende Arrays und Standardfelder. Bestehende Daten werden nicht durch Beispielwerte ersetzt.

## 3. Sicherung und Wiederherstellung

Da der Container Bestandteil des zentralen Arbeitszustands ist, wird er in der bestehenden vollständigen JSON-Sicherung gespeichert und über den vorhandenen Wiederherstellungsweg normalisiert. Die AP22F12-Domaintests prüfen einen JSON-Roundtrip einschließlich Zahlungen, Kostenübersteuerungen, Zuordnungen und Prüfstatus.

## 4. Abrechnungssnapshots und Archiv

`kostenUmlagenAbgleich` wurde in die zentrale Positivliste `ARCHIVE_SNAPSHOT_DATA_KEYS` aufgenommen. Damit werden die analyserelevanten Datensätze im begrenzten Abrechnungssnapshot, im Jahresarchiv und beim kontrollierten Öffnen historischer Bestände berücksichtigt. Verschachtelte Archive, Recovery- oder technische Metadaten werden weiterhin durch den vorhandenen Snapshotvertrag ausgeschlossen.

## 5. Prüfentscheidungen

Die bestehenden `abrechnungsPruefungen` bleiben das führende Entscheidungsregister. Die Migration erzeugt keine automatische Akzeptanz. Erst eine ausdrücklich als geprüft gespeicherte Zuordnung erzeugt einen scoped Entscheidungsdatensatz.

## 6. Versions- und PWA-Migration

- App-Version: V99.4.66
- App-Name: AP22F12AB-Kosten-und-Umlagenabgleich
- Service-Worker-Cache: `nk-pro-v99-4-66-ap22f12ab`
- neue Module sind Bestandteil der App-Shell
- Registrierung verwendet den neuen Build-Token

Bestehende Installationen erhalten über den vorhandenen Service-Worker-Aktualisierungsmechanismus die neue App-Shell.

## 7. Rückwärtskompatibilität

- ältere Gesamt-JSON-Sicherungen bleiben importierbar,
- fehlende AP22F12-Felder werden neutral ergänzt,
- Schema 5 wird nicht hochgestuft,
- bestehende Abrechnungs-, Zähler-, Archiv- und Briefdaten werden nicht umstrukturiert,
- vorhandene Prüfentscheidungen anderer Scopes bleiben unberührt.
