# NK-Pro – UI-Migrationsmatrix nach AP22E

**Statusregel:** AP22E inventarisiert und plant. Es entfernt oder migriert keine produktiven Seitenelemente.

| Produktive Seite/Bereich | Vorhandene UI-Elemente | Zielkomponenten | Erkannte Redundanzen/Vereinfachungsvorschlag | Freigabe nötig | Technischer Status | Visueller Prüfstatus | Legacy-Bereinigung | Abschluss |
|---|---|---|---|---|---|---|---|---|
| Globale Navigation | Gruppen, Ziele, aktive/deaktivierte Zustände, Overlay | geschützte Bestandskomponente | keine Änderung; nur dokumentieren | ja, gesondertes Navigationspaket | geschützt V99.4.32 | Bestandsreferenz vorhanden | nicht zulässig in AP22E | geschützt |
| Globale Kopf-/Werkzeugleiste | Titel, Offline-Status, Hilfe, Menü | Kopf-/Werkzeugleiste | Seitentitel im globalen Kopf gegen Seitenkopf auf Doppelung prüfen | ja | Bestand | Referenz vorhanden | offen | geplant |
| Globale Abrechnungskontextleiste | Objekt, Jahr, Status, Modus, Aktionen | Kontextleiste | keine zweite Kontext-/Zeitraumanzeige zulassen; Umbruch vereinheitlichen | ja | Fachlogik produktiv | Referenz vorhanden | offen | geplant |
| Arbeitsweiche/`landing` | zwei große Einstiegskarten | Seitenkopf, interaktive Karten | Informationsdichte und responsive Anordnung prüfen; Funktionen erhalten | ja | Bestand | Zielbild vorhanden | offen | geplant |
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
