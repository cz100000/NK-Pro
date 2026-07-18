# NK-Pro – UI-Migrationsmatrix nach AP22F1A

**Statusregel:** AP22F1A migriert ausschließlich globale Kopf-/Werkzeugleiste, Abrechnungskontext, Seitenschale und Seitenköpfe. Inhaltskomponenten bleiben für Folgepakete offen.

| Produktive Seite/Bereich | Vorhandene UI-Elemente | Zielkomponenten | Erkannte Redundanzen/Vereinfachungsvorschlag | Freigabe nötig | Technischer Status | Visueller Prüfstatus | Legacy-Bereinigung | Abschluss |
|---|---|---|---|---|---|---|---|---|
| Globale Navigation | Gruppen, Ziele, aktive/deaktivierte Zustände, Overlay | geschützte Bestandskomponente | keine Änderung; nur dokumentieren | ja, gesondertes Navigationspaket | geschützt V99.4.32 | Bestandsreferenz vorhanden | nicht zulässig in AP22E | geschützt |
| Globale Kopf-/Werkzeugleiste | App-Kennzeichnung, Offline-Status, Hilfe, Menü | Kopf-/Werkzeugleiste | konkurrierender globaler Seitentitel entfernt | freigegeben AP22F1A | zentral migriert | geprüft | abgeschlossen | abgeschlossen AP22F1A |
| Globale Abrechnungskontextleiste | Objekt, vollständiger Zeitraum, Status, bestehende Aktionen; keine Modusangabe | `nk-ui-context-bar` | keine zweite Kontextanzeige; Nur-ansehen über Notice und Schreibsperre | freigegeben AP22F1A | zentral migriert | geprüft | abgeschlossen | abgeschlossen AP22F1A |
| Arbeitsweiche/`landing` | zwei große Einstiegskarten | Seitenschale, Seitenkopf, interaktive Karten | äußere Schale und eindeutiges H1 migriert; Karten unverändert | freigegeben AP22F1A | Schale migriert | geprüft | Inhaltsmigration offen | teilweise AP22F1A |
| Objektübersicht/`objektuebersicht` | Dashboardkarten, Status, nächste Schritte | Seitenschale, Dashboardraster, Status-/Aktionskarten | generische Karten auf fachlichen Mehrwert prüfen | ja | Grundkomponenten vorhanden | offen | offen | nicht begonnen |
| Objektdaten/`objekt` | Seitenkopf, Klappboxen, Hinweise, Toolbar | Seitenkopf, Standard-/Statusklappbox, Hinweis, Aktionsleiste | Perioden-/Speicherinformationen auf Doppelung prüfen | ja | Grundmigration | offen | offen | nicht begonnen |
| Wohnungen/`wohnungsverwaltung` | Formulare, Tabellen, Klappboxen, Hinweise | Formularabschnitt, Datentabelle, Klappbox, Status | lokale Formularabstände und Aktionsduplikate prüfen | ja | Tabellen migriert | offen | offen | nicht begonnen |
| Zähler-DUMMY/`wasser` | Kacheln, Tabellen, Dummyhinweis | Kartenraster, Datentabelle, Hinweis | Dummycharakter klarer und kompakter; keine Fachfunktion ergänzen | ja | Bestand | offen | offen | nicht begonnen |
| Mieterverwaltung/`mieterverwaltung` | Stammdatenformulare, Tabellen, Hinweise | Formularsystem, Tabelle, Status, Abschlussleiste | Zeitraum-/Speicheranzeige und Hinweise auf Wiederholung prüfen | ja | Grundmigration | offen | offen | nicht begonnen |
| Abrechnungsübersicht/`start` | Abrechnungstabelle, Filter, Status-/Arbeitsstand, verborgene Zeitraumsektion | Seitenschale, Kontextleiste, Toolbar, Datentabelle, Statuskarten | verborgene Altsektion inventarisieren; App-Selbsttest aus Fachoberfläche prüfen; Statusdopplungen vermeiden | ja | Tabellen/Grundkomponenten vorhanden | offen | offen | nicht begonnen |
| Abrechnungs-Mietverhältnisse/Kompatibilitätsziel `mieter` | dynamische Tabellen/Formulare | Formular, Tabelle, Hinweis, Schreibschutz | Stammdaten-/Periodeninformationen gegen globale Kontexte prüfen | ja | Bestand | offen | offen | nicht begonnen |
| Vorauszahlungen/`einnahmen` | Tabellen, Eingaben, Klappboxen | Formularfeld, Datentabelle, Klappbox, Abschlussleiste | lokale Eingabegruppen und Aktionsleisten konsolidieren | ja | Tabellen migriert | offen | offen | nicht begonnen |
| Gesamtkosten/Kompatibilitätsziel `einstellungen` | Kostenformulare/-tabellen, Dialoge | Formularabschnitt, Tabelle, Dialog, Hinweise | Begriffskonflikt mit deaktiviertem „Einstellungen“ vermeiden; Aktionsdichte reduzieren | ja | Dialog-/Tabellenbasis | offen | offen | nicht begonnen |
| Individuelle Werte/`manuellewerte` | Filter, Tabellen, Importstatus, Leerzustände | Toolbar, Tabelle, Inhaltszustände, Hinweise | AP21C-Sonderklassen schrittweise auf Zielvarianten abbilden | ja | weitgehend zentral | offen | offen | nicht begonnen |
| Abrechnungsergebnis/`umlage` | mehrere Ergebnistabellen und Klappboxen | Statustabelle, Ergebnisliste, Standardklappbox | wiederholte Kontrolltexte und Tabellenrahmen prüfen | ja | Tabellen migriert | offen | offen | nicht begonnen |
| Prüfung & Freigabe/`qualitaet` | Statuskarten, Filter, Listen, Detaildialoge | Statuskarten, Toolbar, Listen, Dialoge, Hinweise | technische Diagnose klar getrennt halten; Statuswiederholungen prüfen | ja | zentrale Facharchitektur; Dialogbasis | offen | offen | nicht begonnen |
| Vorauszahlungsanpassung/`vorauszahlungsanpassung` | Formulare, Ergebnis-/Detailtabellen, Hinweise | Formularabschnitt, Tabellen, Klappboxen | Seitenkopf-/Abschnittsaktionen und Hinweiswiederholungen prüfen | ja | Tabellen migriert | offen | offen | nicht begonnen |
| Briefe/`briefe` | App-Steuerung plus isolierte Briefvorschau | App-Seitenschale/Toolbar; Dokumentbereich geschützt | nur App-Steuerflächen migrieren; Brief-/Druckdarstellung vollständig ausschließen | ja | Dokumentlayout geschützt | offen | offen nur App-UI | nicht begonnen |
| Export/`export` | Hinweise, Exportaktionen, Prüfung | Hinweise, Aktionsleiste, Status | Speichern-Aktion im Seitenkopf auf fachlichen Nutzen prüfen; Exportlogik schützen | ja | Bestand | offen | offen | nicht begonnen |
| Archiv/`archiv` | Tabellen, primäre/sekundäre Toolbars, Prüfung | Datentabelle, Toolbar, Inhaltszustand | doppelte Toolbars auf klare Aufgabenverteilung prüfen | ja | Tabellen migriert | offen | offen | nicht begonnen |
| Datensicherung & System/`sicherung` | Sicherungsaktionen, Diagnose, Tabellen/Listen | Karten, Aktionsleisten, Tabellen, technische Hinweise | technische und alltägliche Aktionen stärker trennen | ja | Bestand | offen | offen | nicht begonnen |
| Globale Dialoge | native/fachbezogene Modalformen | zentrale Dialogvarianten | Restdialoge einzeln nach Risiko inventarisieren | ja | fünf migriert AP22D | Referenz vorhanden | offen | teilweise |
| Globale Inhaltszustände | uneinheitliche Leer-/Fehlertexte | acht definierte Zustände | lokale Leertexte je Seite zuordnen und ersetzen | ja | sieben zentral AP22D | Referenz vorhanden | offen | teilweise |
| Allgemeine Aktionsleisten | Toolbars, Seitenkopf-/Formularaktionen | Seitenaktions- und Formularabschlussleiste | Aktionsduplikate und Reihenfolge je Seite prüfen | ja | tabellenbezogene Toolbars zentral | Referenz vorhanden | offen | nicht begonnen |

## Verbindlicher Folgeprozess

Jede Zeile wird in einem späteren Paket zuerst als konkreter Vorschlag mit betroffenen Komponenten, Seiten, Datei-Positivliste, Mockup, Abnahmekriterien, Tests und Schutzbereichen vorgelegt. Ein Statuswechsel zu „freigegeben“ erfolgt ausschließlich nach Nutzerfreigabe.

## AP22F1A-Querschnittsstatus

Unabhängig vom weiterhin offenen Inhaltsmigrationsstatus jeder Tabellenzeile sind seit AP22F1A alle 18 sichtbaren Ansichten hinsichtlich äußerer Seitenschale, zentralem Seitenkopf, eindeutiger H1-Semantik und globalem Responsive-Grundlayout migriert. Karten, Tabellen, Formulare, Dialoge, Klappboxen, lokale Metablöcke und Save-Aktionen bleiben in den jeweiligen Zeilen offen.

## AP22F1B-Querschnittsstatus

| Bereich | AP22F1B-Status |
|---|---|
| Alle 18 sichtbaren Ansichten | statische Kopf-Speicherstatus vollständig entfernt |
| `objekt`, `mieterverwaltung`, `wohnungsverwaltung`, `qualitaet`, `einstellungen`, `mieter`, `einnahmen`, `manuellewerte`, `umlage`, `vorauszahlungsanpassung`, `briefe` | genau eine zulässige Kopf-Speicheraktion |
| `archiv`, `sicherung`, `export` | allgemeine Kopf-Speicheraktion entfernt; fachliche Inhaltsaktionen erhalten |
| `objekt`, `archiv`, `mieterverwaltung`, `wohnungsverwaltung`, `sicherung`, `wasser` | lokaler Kopf-Metablock entfernt |
| `manuellewerte` | wiederholte Karten-Speicheraktion entfernt; ein führender Speicherweg |
| `start`/`#billingPeriodSection` | geschützt und ausdrücklich nicht migriert |

Der Inhaltsmigrationsstatus für Karten, Tabellen, Formulare, Dialoge und Klappboxen bleibt durch AP22F1B unverändert.

## AP22F2B – Fortschreibung

| Seite/Bereich | Stand | Migrierte Elemente | Ausdrücklich unverändert |
|---|---|---|---|
| `objektuebersicht` | abgeschlossen V99.4.37 | Objektidentität, Gesamtstatus, nächste Aktion, vier Aufgaben-/Statuskarten, responsive Darstellung | Seitenschale, Seitenkopf, Navigation, Kontextleiste, Datenquellen, Fachlogik, Zielseiten |

Die Objektübersicht gilt damit als vollständig migriert. Andere produktive Seiten erhalten durch AP22F2B keinen neuen Migrationsstatus.

## AP22F4B – Fortschreibung

| Seite/Bereich | Stand | Migrierte Elemente | Ausdrücklich unverändert |
|---|---|---|---|
| `wohnungsverwaltung` | abgeschlossen V99.4.39 | Tabellenkarte mit weißem Innenrand, vollbreiter Desktoptabelle, Suche, bestandsbasierter Statusfilter, Aktionsspalte, Ergebnissumme, UNIT-Prüfhinweise, Nur-Ansehen-Zustand, responsive Tabellenhülle | weiße Navigation, globale Leisten, sechs Datenfelder, zentrale Schreibwege, Objektstandardprüfung, Persistenz und Fachlogik |

Die Wohnungsverwaltung gilt damit als vollständig auf „NK-Pro UI Referenz 1.0“ migriert. Andere produktive Seiten erhalten durch AP22F4B keinen neuen Migrationsstatus.
