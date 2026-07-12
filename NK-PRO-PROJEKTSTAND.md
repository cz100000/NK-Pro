# NK-Pro – verbindlicher Projektstand

**Stand:** 12. Juli 2026  
**Anwendung:** V99.4.1  
**Versionsname:** ChatGPT-Arbeitsbasis und Testdatenstruktur  
**Datenschema:** 5  
**Ausgangsversion:** V99.4.0

## 1. Technische Grundlage

NK-Pro ist eine statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript. Es gibt kein React, kein TypeScript und kein Buildsystem. Node.js und Playwright dienen nur der Prüfung.

Die jeweils neueste ausdrücklich als verbindlich bezeichnete ZIP ist die alleinige technische Grundlage. Frühere Chats, Erinnerungen und ältere ZIPs dürfen keine technischen Annahmen liefern.

## 2. Verbindlicher Ist-Zustand

- eine Anwendung und ein lokaler Datenbestand,
- Datenschema 5,
- Arbeitsstand im `localStorage` mit Prüfsumme und Recovery-Stand,
- historische Jahresarchive innerhalb des Anwendungszustands,
- Landingpage mit Objektvorbereitung und Nebenkostenabrechnung,
- gruppierte Navigation und sichtbarer Abrechnungskontext,
- sechs logisch unveränderte Referenzfälle.

## 3. Technische Bereinigung V99.4.1

- `js/app.js` enthält nicht mehr den großen SEED; dieser liegt in `js/default-seed.js`.
- Referenzfälle werden aus `testdaten/basis/standardfall.json` und kleinen Patches rekonstruiert.
- `npm run test:fixtures` beweist die semantische Identität aller Referenzfälle über feste SHA-256-Prüfsummen.
- historische Prüfberichte und überholte Entwicklungsdokumente sind aus der aktiven Arbeits-ZIP ausgelagert.
- Fachlogik, Berechnung, Schema, Archive und Austauschformate wurden nicht verändert.

## 4. Offene kritische Themen vor größerer UI-Weiterentwicklung

1. verbindliche Datenebenen und Snapshot-Grenzen definieren,
2. aktuelle Abrechnung, Objektstandard, Historie, Archiv, Sicherung und Recovery eindeutig trennen,
3. rekursive oder unnötig vollständige Archivkopien begrenzen,
4. danach `app.js` schrittweise nach stabilen Datenverträgen modularisieren.

## 5. Nächstes Arbeitspaket

**Verbindliche Datenebenen und Snapshot-Grenzen.**

Das Arbeitspaket beginnt mit einer Bereichsanalyse der Daten-, Persistenz-, Archiv- und Migrationspfade. Vor einer Schema- oder Formatänderung sind Auswirkungen, Alternativen, Migration, Rückweg und Teststrategie zu dokumentieren.

## 6. Aktive Freigabenachweise

- JavaScript-Syntaxprüfung,
- Referenzdaten-Prüfsummen,
- Playwright-Regressionssuite,
- Manifest- und Service-Worker-Prüfung,
- Versions- und SHA-256-Konsistenz.

## 7. Prüfstatus V99.4.1

- Syntax: 6/6 bestanden.
- Referenzdaten: 6/6 semantisch identisch.
- Release- und PWA-Konsistenz: bestanden.
- Playwright-Browserregression: in der Erstellungsumgebung wegen nicht startfähigem Chromium nicht ausführbar; externer vollständiger Lauf vor Produktivfreigabe erforderlich.
