# AP22E – Prüfbericht

**Version:** V99.4.33  
**Produktive Laufzeitbasis:** V99.4.32 / AP22D, unverändert  
**Datum:** 16. Juli 2026  
**Gesamtstatus:** bestanden, mit dokumentiertem historischen Testkonflikt und dokumentierter Styleguide-Dateigrenze

## 1. Geprüfter Umfang

AP22E wurde als reines Designvertrags-, Dokumentations- und Referenzpaket geprüft. Es erfolgte keine produktive UI-Migration. Geprüft wurden Vertragsvollständigkeit, Widerspruchsfreiheit, Navigationsschutz, Referenzbibliothek, Responsive-Verhalten, Tastatur und Fokus, Schutz produktiver Dateien, bestehende Fach- und Browserregression sowie Release-Inhalt und Integrität.

## 2. Ergebnisübersicht

| Prüfung | Ergebnis |
|---|---|
| JavaScript-Syntax | bestanden, 55 Einheiten |
| Referenz-Fixtures | bestanden, 6 Fälle |
| aktuelle Zählerregression | bestanden, 3 Tests |
| aktuelle Architektur-/Navigationsstruktur | bestanden, 7 Tests |
| AP21C-Kompatibilität | bestanden |
| AP22D-Strukturbaseline | bestanden |
| AP22E-Vertrags-/Schutzprüfung | bestanden |
| AP22E-Chromium | bestanden, 2 Tests |
| vollständige aktuelle AP22D-Browsermatrix | bestanden, 50 Tests |
| geschützte Produktdateien | 58/58 SHA-256-identisch |
| produktive Dateien geändert | keine |
| bestehende Regressionstestdateien geändert | keine |
| Release-Inhalt, Prüfsummen, frische Entpackung | nach finaler Releaseerzeugung bestätigt |

## 3. Vertragsprüfung

Bestätigt wurden:

- alle fünf obersten Vertragsdokumente sind vorhanden,
- der Designvertrag besitzt Vorrang vor älteren UI-Dokumenten,
- das Styleguide-Zielbild ist verbindlich für Arbeitsflächen und Komponenten,
- die im Styleguide gezeigte Navigation ist ausdrücklich ausgeschlossen,
- die Navigation V99.4.32 ist geschützt,
- nicht geregelte Fälle erfordern Benennung und Nutzerfreigabe,
- lokale UI-Einzellösungen sind verboten,
- spätere Migrationen benötigen Bestandsanalyse, Mockup, Positivliste, Abnahmekriterien, Tests und ausdrückliche Freigabe,
- Fachlogik und Bedienmöglichkeiten sind gegen unbeabsichtigten Entfall geschützt.

## 4. Referenzbibliothek

Die nicht produktive Referenzbibliothek unter `ui-reference/` zeigt:

- Styleguide-Zielbild und geschützte Navigation,
- Seitenschale, Kopf- und Werkzeugleiste sowie alle wesentlichen Kontextleistenzustände,
- Seitenköpfe, Karten, Klappboxen, Tabellen, Listen, Filter, Formulare, Buttons und Aktionsleisten,
- Hinweise, Status, Schreibschutz, Dialoge und Inhaltszustände,
- Desktop-, mittlere, schmale und niedrige Ansichten,
- fiktive deutsche NK-Pro-Beispiele.

Statisch und im Browser bestätigt wurden:

- keine Einbindung in produktive Navigation,
- keine Produktdaten-, Persistenz-, Service-Worker- oder Fachlogikzugriffe,
- keine produktiven Ereignisse,
- Dialogfokusfalle, Fokusrückgabe und Schutz des destruktiven Dialogs,
- sichtbare Fokusbeispiele und Tastaturbedienung,
- keine horizontale Gesamtseiten-Scrollleiste bei 1440 × 1000, 1024 × 800, 390 × 844 und 900 × 620,
- Start ohne Konsolen- oder Seitenfehler.

## 5. Visuelle Prüfung

Die Referenzbibliothek wurde als vollständige Desktop- und Schmalansicht in Chromium gerendert und visuell geprüft. Die visuelle Hierarchie, ruhigen Flächen, semantischen Statusfarben, feinen Rahmen, Karten-/Formularwirkung und Responsive-Stapelung entsprechen dem freigegebenen Zielcharakter. Die Navigationsabbildung stammt aus dem unveränderten produktiven V99.4.32-DOM.

Das im Chat sichtbare Styleguide-Bild war nicht als Originalbinärdatei im Arbeitsdateisystem verfügbar. Deshalb enthält der Release eine visuell und inhaltlich getreue lokale SVG-/PNG-Nachbildung. Diese Grenze ist in Bestandsaufnahme, Dateiänderungen und Testergebnissen ausdrücklich dokumentiert.

## 6. Produktiver Schutz

SHA-256-verifiziert unverändert blieben 58 produktive HTML-, CSS-, JavaScript-, Manifest- und Service-Worker-Dateien. Dazu gehören insbesondere:

- `index.html`,
- `assets/app.css`,
- sämtliche produktiven Dateien unter `js/`,
- `manifest.webmanifest`,
- `service-worker.js`.

Damit blieben Navigation, Abrechnungskontext, Fachlogik, Berechnung, Datenmodell, Persistenz, Migration, Backup/Restore, Archiv, Snapshots, Briefe, Druck, PDF, Import und Export unverändert.

## 7. Bestehende Browserregression

Die aktuelle AP22D-Browsermatrix wurde wegen des externen Befehlszeitlimits in deterministischen Projektgruppen ausgeführt. Insgesamt bestanden 50 von 50 Tests. Geprüft wurden unter anderem:

- Dokument- und Exportdaten,
- Migration, Sicherung, Restore und Rollback,
- Modulgrenzen und UI-Ereignisse,
- Persistenz und Snapshots,
- sechs Referenzfälle,
- AP10-/AP12-Orchestrierung,
- AP13-Brief-, Druck- und PDF-Verhalten,
- AP19-Abrechnungskontext und Schreibschutz,
- AP20-Qualitätssystem,
- AP21B2-Navigation,
- AP22D-Dialoge und Inhaltszustände.

## 8. Historischer Testkonflikt

`tests/ap20-asset-refresh-regression.test.cjs` erwartet hart verdrahtet den alten Build `99.4.24-ap21a` und alte Assetparameter. Die hochgeladene, geschützte Ausgangsbasis verwendet korrekt `99.4.32-ap22d`. Der Konflikt besteht somit bereits im Ausgangsstand. Die alte Regressionstestdatei wurde entsprechend der Vorgabe nicht geändert. Die aktuelle Release-Gate-Zählerregression mit drei Tests ist bestanden.

## 9. Geteilte Versionsrolle und Inhaltsprüfung

V99.4.33 ist der Vertrags- und Referenzrelease; die produktive Laufzeit bleibt geschützt auf V99.4.32/AP22D. Der unveränderte generische Inhaltsprüfer des Ausgangsstands erwartet Paket- und Produktversion identisch und ist deshalb für diesen ausdrücklich nicht produktiven Release nicht anwendbar. Die separate AP22E-Prüfung kontrolliert stattdessen 310 Release-Dateien, Paketversion V99.4.33, produktive Buildkennung V99.4.32/AP22D, Ausschluss temporärer Artefakte und 58 Produktdatei-Hashes.

## 10. Abnahme

AP22E erfüllt den freigegebenen Umfang ohne produktive Dateiänderung. Der Designvertrag, die Referenzbibliothek, der Abnahmekatalog und die vorbereitete Migrationsmatrix sind als verbindliche Grundlage für spätere, separat freizugebende UI-Migrationspakete geeignet.
