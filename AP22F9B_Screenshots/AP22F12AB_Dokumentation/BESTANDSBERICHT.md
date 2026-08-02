# AP22F12A/B – Bestandsbericht

**Ausgangsbasis:** `NK-Pro_V99_4_65_AP22F11B_Korrektur4_Pruef_und_Regelsystem(3).zip`  
**Zielstand:** V99.4.66  
**Prüfdatum:** 02.08.2026

## 1. Integrität und Vollständigkeit

- ZIP-Integritätsprüfung: bestanden; keine Fehler im komprimierten Bestand.
- ZIP-Einträge: 795.
- Entpackte Nutzdaten: 57.655.855 Byte.
- Projekt- und Dokumentdateien wurden vollständig entpackt.
- 422 Dokumentdateien (`.md`, `.json`, `.txt`) wurden vollständig eingelesen und inventarisiert.
- Das vollständige Inventar steht in `DOKUMENTENINVENTAR.json`.

## 2. Technischer Ausgangszustand

NK-Pro ist eine statische, lokal und offline nutzbare Browseranwendung/PWA. Der Einstieg erfolgt über `index.html`; produktive Module werden deterministisch geladen. `app.js` orchestriert die vorhandenen Fach-, Zustands-, Persistenz-, UI-, Prüf-, Dokument- und Exportmodule.

Verbindlich festgestellt wurden:

- Datenschema 5 und Datenebenenvertrag 1,
- zentraler Zustandszugriff über `NKProStateAccess`,
- transaktionale Fachänderungen über Anwendungs-/Fachmodule,
- begrenzte Abrechnungssnapshots und getrennte Gesamt-/Abrechnungssicherungen,
- zentrale Navigation und Seitensteuerung,
- zentrale Prüf- und Regelarchitektur aus AP22F11B Korrektur 4,
- gemeinsame Druck-/Dokumentarchitektur,
- Service-Worker-basierte Offline-App-Shell,
- bestehende Fixture-, Architektur-, Zähler-, Release- und Browserprüfungen.

## 3. Vorhandene fachliche Datenquellen

Vorhanden und für die neue Analyse nutzbar waren insbesondere:

- `kostenarten` mit Gesamtbetrag, Umlageschlüssel und Ausschlussbehandlung,
- die zentrale Abrechnungsberechnung mit Mieter-, Privat- und Leerstandsanteilen,
- `vorauszahlungen` als Abrechnungssoll,
- Wohnungen, Mietverhältnisse und Objektstandard,
- individuelle Werte und Zählerdaten,
- `abrechnungsPruefungen` für bestehende Prüfentscheidungen,
- Jahresarchive und Abrechnungssnapshots,
- Gesamt-JSON-Sicherung, Wiederherstellung und Migration.

Eine belastbare eigenständige Datenhaltung für tatsächliche Zahlungsflüsse mit getrenntem Zahlungs- und Abrechnungsjahr war nicht vorhanden. Deshalb durfte die neue Analyse bestehende Soll-Vorauszahlungen nicht als tatsächliche Einnahmen übernehmen.

## 4. Visuelle und fachliche Referenzen

Das Mock-up wurde als Richtungsreferenz für Informationshierarchie, Dreiteilung des oberen Bereichs, große Erklärungstabelle und seitlichen Ergebnis-/Aktionsbereich verwendet. Es wurde nicht pixelgenau kopiert, sondern in die vorhandene NK-Pro-Seitenschale, Navigation, Tabellen- und Dialoglogik übertragen.

Die Excel-Referenz enthält die fachliche Trennung von Umlageeinnahmen, Kosten, Privatanteil, Leerstandsanteil und nicht umgelegten Kosten. Ihre Werte und Formeln wurden ausschließlich als Referenz beziehungsweise Testgrundlage behandelt und nicht als Produktdaten übernommen.

## 5. Ausgangstests

Die unveränderte Basis bestand die verfügbaren statischen, Syntax-, Fixture-, Zähler-, Architektur- und Release-Inhaltsprüfungen. Eine Browserautomation war in der Ausführungsumgebung nicht möglich, weil das Projektmodul `playwright` nicht installiert war und die interne Paketquelle die benötigte Abhängigkeit nicht bereitstellte. Dies ist eine Einschränkung der Testumgebung; daraus wurde kein positiver Browserbefund abgeleitet.

## 6. Bestandsrisiken und Umsetzungsfolgen

- Soll-Vorauszahlungen und tatsächlicher Zahlungsfluss mussten strikt getrennt werden.
- Prüfentscheidungen durften nicht in einem zweiten Speichercontainer dupliziert werden.
- Die neue Analyse durfte den bestehenden Abrechnungsabschluss nicht pauschal blockieren.
- Ältere Sicherungen mussten ohne erfundene Beträge neutral migriert werden.
- Mehrjahresanalysen mussten aktuelle und archivierte Abrechnungsjahre gemeinsam lesen können.
- Neue schreibende UI-Aktionen mussten über Fachmodul, Zustandszugriff und Schreibschutz laufen.
