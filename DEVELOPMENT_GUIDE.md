# NK-Pro – Development Guide

**Aktueller Umsetzungsstand:** V99.4.0, Datenschema 5

**Gültig ab:** Development Baseline vom 12. Juli 2026  
**Technische Ausgangsversion:** V99.3.0

## 1. Verbindliche Quellenhierarchie

Für jede Änderung gilt folgende Reihenfolge:

1. tatsächlich bereitgestellte Projektdateien,
2. aktuelle verbindliche Projektdokumente,
3. automatisierte Tests und Referenzdaten,
4. ausdrücklich dokumentierte Nutzerentscheidung im `WORKBOOK.md`.

Frühere Chats, Erinnerungen, nicht enthaltene Dateien und vermutete Zielzustände sind keine technische Quelle.

Bei Widersprüchen gilt:

1. historische Datenintegrität,
2. Stop-Regel,
3. `WORKBOOK.md`,
4. `ARCHITECTURE.md`, `UX_GUIDE.md`, `TESTING.md`,
5. ältere versionsbezogene Dokumentation.

## 2. Entwicklungsprinzipien

NK-Pro bleibt:

- eine Anwendung,
- ein Datenbestand,
- eine Navigation,
- frameworkfrei,
- ohne React,
- ohne TypeScript,
- ohne Buildsystem,
- direkt mit HTML, CSS und JavaScript lauffähig.

Neue Technik ist nur zulässig, wenn sie die Gesamtkomplexität nachweisbar reduziert oder einen klaren langfristigen Nutzen erzeugt. Entwicklungswerkzeuge wie Node.js und Playwright dürfen die Auslieferung nicht in einen Buildprozess zwingen.

## 3. Pflichtanalyse vor jeder Änderung

Vor dem ersten Patch müssen mindestens geprüft und dokumentiert werden:

1. Versionsstand,
2. betroffene Dateien,
3. bestehende Architekturpfade,
4. betroffene Datenfelder,
5. Navigation und Bedienfluss,
6. Migration und Rückwärtskompatibilität,
7. Tests und Referenzfälle,
8. Risiken,
9. einfachste tragfähige Lösung.

Keine Änderung beginnt mit einer Neuentwicklung. Zuerst wird geprüft, ob vorhandene Funktionen genutzt, erweitert, vereinfacht oder modularisiert werden können.

## 4. Verbindliche Stop-Regel

Die Umsetzung wird sofort unterbrochen, sobald eine Änderung möglicherweise Auswirkungen hat auf:

- Datenmodell,
- historische oder archivierte Abrechnungen,
- Migrationen,
- Rückwärtskompatibilität,
- Berechnungsergebnisse,
- Zähler,
- Kostenarten,
- Umlageschlüssel,
- Sicherungen,
- Import- oder Exportformate.

Dann sind vor jeder Umsetzung verpflichtend:

1. Ist-Zustand analysieren,
2. Auswirkungen beschreiben,
3. mindestens zwei Lösungswege entwickeln,
4. Vor- und Nachteile bewerten,
5. Empfehlung begründen,
6. Nutzerzustimmung abwarten,
7. Entscheidung mit Datum und ID im `WORKBOOK.md` dokumentieren.

Ohne dokumentierte Zustimmung keine Umsetzung.

## 5. Änderungsklassen

### Klasse A – Dokumentation

Beispiele:

- Markdown-Dokumente,
- Release Notes,
- Prüfnachweise,
- Roadmap,
- technische Erläuterungen.

Anforderungen:

- keine produktiven Dateien ändern,
- Syntax- und Browsertests dennoch ausführen,
- Runtime-Prüfsummen vergleichen.

### Klasse B – Oberflächenänderung ohne Fach- oder Datenwirkung

Beispiele:

- Navigation umgruppieren,
- Beschriftungen,
- Accordion-Verhalten,
- Landingpage,
- bedingte Sichtbarkeit.

Anforderungen:

- bestehende Funktionen weiterverwenden,
- keine Datenkonvertierung,
- alle Tabs erreichbar halten,
- Browser-, Tastatur-, Responsive- und PWA-Prüfung,
- Referenzfälle unverändert.

### Klasse C – Fachlogik ohne Schemaänderung

Beispiele:

- Berechnungsregel,
- Verteilungslogik,
- Briefinhalt,
- Exportberechnung.

Anforderungen:

- Stop-Regel anwenden,
- Referenzwerte vorab einfrieren,
- mindestens zwei Lösungswege bewerten,
- fachliche Regressionstests ergänzen.

### Klasse D – Datenmodell, Migration oder Format

Beispiele:

- neue Entität,
- neue Zähler-ID,
- Stammdaten-/Abrechnungstrennung,
- Schemaerhöhung,
- Archivstruktur,
- Import-/Exportformat.

Anforderungen:

- Stop-Regel anwenden,
- automatische Vor-Migrationssicherung,
- reproduzierbare Vorwärtsmigration,
- dokumentierter Rückweg,
- Tests von Altstand, Zielstand und Abbruchfall,
- unveränderte Originaldaten nachweisen,
- Schemaversion nur nach Freigabe erhöhen.

## 6. Technischer Änderungsablauf

1. Ausgangs-ZIP unverändert sichern.
2. Projekt vollständig entpacken und Inventar erstellen.
3. Laufzeitdateien hashen.
4. Syntaxprüfung und Playwright-Baseline ausführen.
5. Änderungsklasse bestimmen.
6. Stop-Regel prüfen.
7. kleinsten tragfähigen Patch umsetzen.
8. gezielte Tests ergänzen.
9. vollständige Freigabeprüfung ausführen.
10. Runtime-Prüfsummen und Fachresultate vergleichen.
11. Dokumentation aktualisieren.
12. neue ZIP ohne temporäre Dateien erzeugen.
13. SHA-256-Prüfsummen neu erzeugen.

## 7. JavaScript-Regeln

- Bestehende Fachfunktionen nicht duplizieren.
- Berechnungsfunktionen möglichst deterministisch und ohne DOM-Seiteneffekte halten.
- Datenänderungen über den vorhandenen zentralen Pfad `commitStateChange()` führen, sofern fachlich passend.
- Archivansicht und Finalisierungsschutz niemals umgehen.
- Globale Funktionsnamen nur kontrolliert ändern, da HTML-Inline-Handler und andere Dateien darauf verweisen können.
- Keine stillen Fallbacks einführen, die falsche Ergebnisse als gültig erscheinen lassen.
- Fehler müssen sichtbar, prüfbar und testbar sein.
- Neue IDs müssen stabil, eindeutig und migrationsfähig sein.

## 8. HTML- und Navigationsregeln

- Alle Funktionen bleiben erreichbar.
- Die Landingpage ist Arbeitsweiche, nicht Ersatznavigation.
- Ein Bereich „Aktive Abrechnung“ darf nur bei tatsächlich geöffneter Abrechnung existieren.
- Keine Platzhalter für nicht vorhandenen Kontext.
- Accordion-Gruppen erhalten korrekte `aria-expanded`-, `aria-controls`- und Tastaturzustände.
- Tab-ID und fachliche Funktion dürfen nicht ohne Migrationsplan oder Kompatibilitätsschicht umbenannt werden.

## 9. CSS-Regeln

- Bestehende Variablen und gemeinsame Komponenten zuerst nutzen.
- Neue Regeln möglichst unter einer klaren Bereichsklasse kapseln.
- `!important` nur nach dokumentierter Spezifitätsanalyse.
- Druck-CSS und Fensterbriefpositionen gelten als besonders schützenswert.
- Jede globale Tabellen-, Button-, Input- oder Layoutregel benötigt eine Prüfung aller 14 Tabs und der Druckansicht.
- Keine pauschale Bereinigung historischer CSS-Schichten ohne schrittweise Regressionstests.

## 10. Datenmodellregeln

### Objektstandard

Objektstandards sind Vorlagen. Eine neue Abrechnung übernimmt sie einmalig. Danach arbeitet die Abrechnung unabhängig. Änderungen an Standards dürfen bestehende oder archivierte Abrechnungen nicht verändern.

### Archiv

- Archivdaten sind schreibgeschützt.
- Historische Originalwerte besitzen Vorrang vor Normalisierungskomfort.
- Eine Anzeigeanpassung darf nicht automatisch eine Datenmigration auslösen.
- Reparaturen an Archivdaten benötigen eine explizite Nutzerentscheidung und vorherige Sicherung.

### Zähler

Zählerverwaltung und Zählerstände sind getrennte Domänen:

- Verwaltung: Identität und Lebenszyklus,
- Stände: periodische Messwerte.

Jeder Zähler benötigt künftig eine dauerhafte Zähler-ID. Die Einführung ist eine Klasse-D-Änderung.

## 11. Migrationsstandard

Jede neue Migration benötigt:

- eindeutige Migrations-ID,
- Quell- und Zielversion,
- Vorbedingung,
- automatische Sicherung vor Mutation,
- idempotente Ausführung,
- Protokolleintrag,
- validierbares Ergebnis,
- definierten Abbruchzustand,
- dokumentierten Rollback oder Wiederherstellungsweg,
- Tests für aktuelle Daten, Altdaten, Archive und fehlerhafte Eingaben.

Eine Migration darf niemals nur deshalb erneut laufen, weil ein Metadatenfeld fehlt, wenn dadurch historische Werte verändert werden könnten.

## 12. Dokumentationspflicht

Bei jeder Version werden aktualisiert:

- `README.md`,
- `CHANGELOG.md`,
- `WORKBOOK.md`,
- betroffene Architektur-, UX-, Test-, Roadmap- und Tech-Debt-Dokumente,
- Release Notes und Testergebnis,
- `SHA256SUMS.txt`.

Architekturentscheidungen erhalten eine fortlaufende ID im Format `ADR-NK-####` im `WORKBOOK.md`.

## 13. Definition of Done

Eine Version gilt nur als freigabefähig, wenn:

- Syntaxprüfung erfolgreich,
- Browserkonsole sauber,
- Chromium-/Playwright-Suite vollständig erfolgreich,
- Referenzfälle unverändert oder ausdrücklich freigegeben,
- Import und Export erfolgreich,
- Migration und Wiederherstellung erfolgreich,
- PWA und Cache geprüft,
- Release Audit ohne Fehler,
- App Self Test ohne Fehler,
- Dokumentation vollständig,
- bekannte Einschränkungen benannt,
- ZIP und Prüfsummen erzeugt.
