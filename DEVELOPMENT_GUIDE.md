# NK-Pro – Entwicklungsleitfaden

**Aktueller Umsetzungsstand:** V99.4.4, Datenschema 5, Datenebenenvertrag 1

## 1. Quellenhierarchie

1. ausdrücklich verbindliche Ausgangs-ZIP,
2. `NK-PRO-PROJEKTSTAND.md`,
3. `NK-PRO-ARBEITSREGELN.md`,
4. tatsächlicher Quellcode, Tests und Referenzdaten dieser ZIP,
5. aktuelle Architektur-, Test-, Roadmap- und Tech-Debt-Dokumente.

Frühere Chats, Erinnerungen und ältere ZIPs sind keine technische Quelle.

## 2. Technische Leitplanken

NK-Pro bleibt eine statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript. Es gibt kein React, kein TypeScript und kein Buildsystem. Node.js und Playwright dienen ausschließlich der Prüfung.

## 3. Änderungsklassen und Stop-Regel

- **A – Dokumentation:** keine Produktivlogik.
- **B – UI ohne Datenwirkung:** Datenverträge und Fachlogik unverändert.
- **C – Fachlogik ohne Schemaänderung:** Fachregressionen und Referenzwerte erforderlich.
- **D – Datenmodell, Migration, Archiv, Sicherung oder Austauschformat:** Ist-Zustand, Auswirkungen, Alternativen, Empfehlung, Migration, Rückweg und Teststrategie vor Umsetzung dokumentieren.

Ohne ausdrückliche Freigabe keine Schema- oder Austauschformatänderung.

## 4. Technischer Ablauf

1. Ausgangs-ZIP unverändert sichern und inventarisieren.
2. Version, Schema und Datenebenenvertrag verifizieren.
3. Baseline-Prüfungen ausführen.
4. kleinsten tragfähigen Patch umsetzen.
5. betroffene Modul- und Browsertests ergänzen.
6. vollständige Pflichtprüfungen ausführen.
7. Projektstand, Changelog, Roadmap und Restrisiken aktualisieren.
8. Abhängigkeiten, Testartefakte und temporäre Dateien entfernen.
9. `SHA256SUMS.txt` und vollständige Versions-ZIP erzeugen.

## 5. Modulgrenzen V99.4.4

- `js/persistence.js` ist die einzige produktive Datei mit direktem `localStorage`-Zugriff.
- `js/migration.js` enthält ausschließlich Registry, Pfadplanung, Validierung und transaktionale Migration.
- `js/backup-recovery.js` enthält Sicherungshüllen, Prüfsummen, Persistenzadapter-Aufrufe und Restore-Validierung; kein direkter DOM- oder Speicherzugriff.
- `js/archive.js` enthält Snapshot- und Archivgrenzen.
- `js/app.js` orchestriert UI, Fachnormalisierung, Backup-Auslösung, Restore und Kompatibilitätsfassaden.
- `index.html`, `service-worker.js` und Releaseprüfung müssen dieselbe Modulreihenfolge enthalten.
- Historische Archivstände werden im normalen Startpfad nicht still auf ein neues Schema umgeschrieben; explizite Archivmigrationen müssen die transaktionale Modulroutine verwenden.

## 6. Migrations- und Restore-Regeln

- Jeder unterstützte Schritt benötigt eine eindeutige Registry-ID.
- Produktivdaten werden nur nach vollständiger Transaktion übernommen.
- Vor einer datenverändernden Migration ist die unveränderte Quelle als Vor-Migrationssicherung zu erzeugen.
- Sicherungshüllen müssen vor Restore vollständig validiert werden.
- Vor jedem Restore ist ein separater Checkpoint zu erzeugen.
- Ein fehlender Pfad, eine ungültige Quelle oder eine fehlgeschlagene Nachprüfung muss den Vorgang ohne Teilübernahme abbrechen.

## 7. Pflichtbefehle

```bash
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:release
CHROMIUM_EXECUTABLE_PATH=/pfad/zu/chromium npm run test:browser
```

## 8. Definition of Done

- Arbeitspaket vollständig und ohne fachfremde Änderungen umgesetzt,
- bestehende Daten und Formate kompatibel,
- relevante Tests vollständig grün,
- Version und PWA-Cache konsistent,
- Dokumentation und Restrisiken aktuell,
- ZIP ohne `node_modules`, Playwright-Berichte, Testartefakte oder temporäre Dateien.
