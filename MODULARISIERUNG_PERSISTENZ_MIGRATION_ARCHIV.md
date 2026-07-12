# NK-Pro – Modularisierung von Persistenz, Migration und Archiv

**Arbeitspaket:** 2  
**Ausgangsversion:** V99.4.2  
**Zielversion:** V99.4.3  
**Datenschema:** 5, unverändert  
**Datenebenenvertrag:** 1, unverändert  
**Stand:** 12. Juli 2026

## 1. Geprüfter Ist-Zustand

Die produktive Anwendung bestand aus getrennten Dateien für Navigation, Modalereignisse, Ausgangsdaten und Service-Worker-Registrierung. Persistenz, Integritätsschutz, Normalisierung, Schemamigration, Snapshot-Projektion und Archivaufbereitung lagen jedoch weiterhin gemeinsam mit UI, Fachberechnung und Export in `js/app.js`.

Betroffen waren insbesondere:

- Prüfsummenbildung, Lesen und Schreiben des Haupt- und Recovery-Speichers,
- direkte Zugriffe auf `localStorage` aus mehreren Bereichen von `app.js`,
- Ermittlung und Ausführung der Schemamigration bis Datenschema 5,
- Übernahme vorbelegter Altarchive,
- Projektion begrenzter Abrechnungssnapshots,
- Normalisierung von Archivhüllen und Durchsetzung des Datenebenenvertrags,
- globale Funktionsnamen, die von Tests, HTML-Ereignissen und bestehendem Anwendungscode verwendet werden.

Die fachlichen Datenwege und die Snapshot-Grenzen aus V99.4.2 waren funktionsfähig und durch 21 Playwright-Tests sowie sechs Referenzfälle geschützt.

## 2. Auswirkungen des monolithischen Zustands

Ohne Dateigrenzen bestanden folgende technische Risiken:

- Änderungen an Speicherintegrität konnten unbeabsichtigt UI- oder Fachcode berühren,
- Migrations- und Archivlogik waren schwer isoliert prüfbar,
- direkte Browser-Speicherzugriffe erschwerten alternative Prüfadapter,
- die notwendige Skriptreihenfolge war nicht als Modulvertrag dokumentiert,
- eine umfassende Bereinigung von `app.js` hätte gleichzeitig zu viele Verantwortlichkeiten verändert.

Nicht betroffen und daher unverändert zu lassen waren Datenschema, Fachberechnung, Datenebenenvertrag, Austauschformate und Oberfläche.

## 3. Bewertete Lösungswege

### Weg A – vollständige Zerlegung von `app.js`

Persistenz, Migration, Archiv, Berechnung, Rendering und UI-Ereignisse würden vollständig in neue Dateien und Services überführt.

**Vorteile**

- weitgehende technische Entkopplung,
- kleinerer verbleibender Anwendungskern,
- langfristig klarere Verantwortlichkeiten.

**Nachteile**

- sehr große Änderung mit hohem Regressionsrisiko,
- zahlreiche globale HTML- und Testaufrufe müssten gleichzeitig umgestellt werden,
- überschreitet das abgegrenzte Arbeitspaket,
- erschwert den Nachweis, dass Fachberechnung und UI unverändert bleiben.

### Weg B – drei stabile Kernmodule mit kleiner Kompatibilitätsschicht

Die wiederverwendbare Kernlogik wird in drei klassische JavaScript-Module ausgelagert. `app.js` behält nur schmale globale Fassaden und die an UI beziehungsweise Fachzustand gebundene Orchestrierung.

**Vorteile**

- klare Dateigrenzen bei kleinem Änderungsumfang,
- bestehende globale Aufrufe bleiben kompatibel,
- keine Änderung von HTML-Ereignisnamen oder Fachberechnung,
- direkte Browser-Speicherzugriffe werden vollständig im Persistenzmodul gebündelt,
- Modul- und Ladegrenzen können statisch und im Browser geprüft werden.

**Nachteile**

- `app.js` bleibt weiterhin groß,
- einige Orchestrierungsfunktionen bleiben wegen ihrer UI- und Fachabhängigkeiten im Anwendungscode,
- der globale Namensraum wird nur kontrolliert reduziert, nicht vollständig beseitigt.

## 4. Empfehlung und Umsetzung

Weg B wurde umgesetzt.

### 4.1 `js/persistence.js`

Verantwortlich für:

- FNV-1a-Prüfsumme,
- Entfernen und Erzeugen von Integritätsmetadaten,
- Integritätsvalidierung,
- geschütztes Lesen und Schreiben eines Speicherstands,
- Entfernen und Rohlesen von Speicherwerten,
- Speichergrößenermittlung und Schreibbarkeitstest.

Nur dieses Modul greift direkt auf `localStorage` zu. Es kennt keine UI, keine Fachberechnung und keine Archivstruktur.

### 4.2 `js/migration.js`

Verantwortlich für:

- Ermittlung der Datenschemaversion,
- idempotente Migrationshistorie,
- Migration bis Datenschema 5,
- Identität und Übernahme vorbelegter Altarchive.

Fachspezifische Hilfsfunktionen werden über eine explizite Abhängigkeitsstruktur übergeben. Das Modul greift weder auf DOM noch auf Browser-Speicher zu.

### 4.3 `js/archive.js`

Verantwortlich für:

- technische Metadatenfilterung,
- begrenzte Snapshot-Projektion,
- einmalige Übernahme globaler Zählerhistorie aus Altarchiven,
- Archivhüllen-Normalisierung,
- idempotente Begrenzung vorhandener Archive,
- Durchsetzung des Datenebenenvertrags im Arbeitsstand,
- Erhalt operativer Backup-Metadaten bei Wiederbearbeitung.

Datenschema 5, Datenebenenvertrag 1 und `billingSnapshot` bleiben unverändert.

### 4.4 Kompatibilitätsschicht in `js/app.js`

Bestehende globale Funktionen wie `protectDataForStorage`, `migrateDataSchema`, `prepareArchiveItemForUse` und `enforceWorkingStateDataContract` bleiben erhalten. Ihre Implementierung delegiert an die drei Module. Dadurch bleiben vorhandener Anwendungscode, HTML-Aufrufe und Browsertests kompatibel.

Die weiterhin in `app.js` verbleibenden Funktionen koordinieren UI-Meldungen, den zentralen Zustand, Fachnormalisierung und Speichervorgänge. Eine allgemeine Komplettbereinigung von `app.js` wurde bewusst nicht vorgenommen.

## 5. Verbindliche Lade- und Ausführungsreihenfolge

Die produktive Reihenfolge in `index.html` lautet:

1. `js/navigation.js`
2. `js/modal-events.js`
3. `js/persistence.js`
4. `js/migration.js`
5. `js/archive.js`
6. `js/default-seed.js`
7. `js/app.js`
8. `js/service-worker-register.js`

`app.js` prüft beim Laden, ob alle drei Kernmodule vorhanden sind, und bricht bei einer unvollständigen Reihenfolge mit einer eindeutigen Fehlermeldung ab. Dieselbe Reihenfolge ist in der Releaseprüfung und im PWA-App-Shell festgeschrieben.

## 6. Migration und Rückweg

Es gibt keine neue Datenmigration und keine Änderung eines Austauschformats. Bestehende Arbeitsstände, Gesamtbackups, Abrechnungsdateien, Archive und Recovery-Daten werden weiterhin mit denselben globalen Funktionen verarbeitet.

Der technische Rückweg besteht in der Rückkehr zur vollständigen V99.4.2-ZIP beziehungsweise zu einer vor der Versionsumstellung erstellten Gesamt-JSON-Sicherung. Da Datenschema 5 und Datenebenenvertrag 1 unverändert bleiben, ist keine Datenrückmigration erforderlich.

Nicht eingeführt wurden ein externes automatisches Vor-Migrationsbackup oder ein allgemeiner mehrstufiger Rollback.

## 7. Prüfungen

Ergänzt wurden:

- statische Prüfung der drei Modulschnittstellen,
- Verbot direkter `localStorage`-Zugriffe in `app.js`, Migration und Archiv,
- feste Skriptreihenfolge in `index.html`,
- vollständiger PWA-App-Shell einschließlich aller Module,
- Browserprüfung der Modulreihenfolge, eingefrorenen Schnittstellen und globalen Kompatibilitätsfunktionen.

Unverändert weitergeführt werden:

- Syntaxprüfung aller produktiven JavaScript-Dateien,
- sechs semantisch unveränderte Referenzfälle,
- Persistenz-, Recovery-, Snapshot-, Archiv-, Export- und Importtests,
- Navigation, Anwendungsselbsttest und Service-Worker-Prüfung.

## 8. Verbleibende Grenzen

- `js/app.js` bleibt der große Orchestrierungs- und Fachcodekern.
- Globale HTML-Ereignisnamen und zahlreiche globale Fachfunktionen bleiben bestehen.
- Ein externes Vor-Migrationsbackup und ein allgemeiner Rollback bleiben vor Datenschema 6 erforderlich.
- Der historische Hauptspeicherschlüssel und die breite Liste alter Speicherschlüssel bleiben unverändert.
