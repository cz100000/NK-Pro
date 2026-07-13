# AP17 – Bereichs-Dashboards, Navigationslogik und UI-Bereinigung

## Verbindlicher Stand

| Merkmal | Stand |
|---|---|
| Anwendung | NK-Pro V99.4.20 |
| Technische Basis | NK-Pro V99.4.19 – AP16-Korrekturstand „Mockupnahe UI“ |
| Datenschema | 5, unverändert |
| Datenebenenvertrag | 1, unverändert |
| Dokumentlayout | AP13 / Version 4, unverändert |
| Gebäudekurzcode | ARB5 |
| Frameworks/Produktionsabhängigkeiten | keine neuen |

## Neue Bereichs-Dashboards

### Objekt vorbereiten – Übersicht

Die neue Substartseite fasst Objektstandard, Wohnungen, Mietverhältnisse, Objektprüfung und die vier Direkteinstiege Objektdaten, Wohnungen, Mieter sowie Zähler-DUMMY zusammen. NK-Pro arbeitet weiterhin mit genau einem Gebäude.

### Nebenkosten abrechnen – Übersicht

Die neue Substartseite bündelt den aktiven Objekt- und Jahreskontext, reale Abrechnungsdaten, eindeutig gekennzeichnete Vorschauwerte und elf Direkteinstiege des Abrechnungsprozesses.

## Reale Dashboardwerte

| Nr. | Dashboard | Datenpunkt | Quelle |
|---:|---|---|---|
| 1 | Objekt | aktuelles Objekt | vorhandener Projekt-/Objektkontext |
| 2 | Objekt | Gebäudekurzcode ARB5 | verbindlicher Projektkontext |
| 3 | Objekt | Anzahl Wohnungen | vorhandene Wohnungsdatensätze |
| 4 | Objekt | Anzahl Mietverhältnisse | vorhandene abrechnungsrelevante Datensätze |
| 5 | Objekt | Objektstatus | vorhandene Objektstandardprüfung |
| 6 | Objekt | offene/unvollständige Angaben | Fehler- und Hinweisbestand der Objektstandardprüfung |
| 7 | Abrechnung | aktuelles Objekt | vorhandener Projekt-/Objektkontext |
| 8 | Abrechnung | Gebäudekurzcode ARB5 | verbindlicher Projektkontext |
| 9 | Abrechnung | Abrechnungsjahr | aktueller Abrechnungskontext |
| 10 | Abrechnung | Bearbeitungsstatus | vorhandener/finalisierter Abrechnungsstand |
| 11 | Abrechnung | Anzahl Wohnungen | vorhandene Wohnungsdatensätze |
| 12 | Abrechnung | Anzahl Mietverhältnisse | vorhandene abrechnungsrelevante Datensätze |
| 13 | Abrechnung | aktive Kostenarten | vorhandene umlagefähige Kostenarten |
| 14 | Abrechnung | Summe NK-Vorauszahlungen | vorhandene Mieterdaten |
| 15 | Abrechnung | offene Prüfhinweise | vorhandene Qualitätssicherung |

## Fiktive DUMMY-/Vorschauwerte

Alle folgenden Werte sind auf der jeweiligen Seite sichtbar als **Vorschau** gekennzeichnet. Beide Dashboards enthalten zusätzlich einen gut sichtbaren Hinweis, dass die Fachlogik noch zu entwickeln ist.

| Nr. | Dashboard | Vorschauwert |
|---:|---|---|
| 1 | Objekt | Stammdatenvollständigkeit 82 % |
| 2 | Objekt | nächster Vorbereitungsschritt |
| 3 | Abrechnung | Abrechnungsfortschritt 64 % |
| 4 | Abrechnung | nächster Abrechnungsschritt |
| 5–15 | Abrechnung | Status der elf Workflowstufen |

## Noch zu entwickelnde Fachlogiken

| Nr. | Offene Logik | Ziel einer späteren Umsetzung |
|---:|---|---|
| 1 | Stammdatenvollständigkeit | gewichtete, nachvollziehbare Bewertung verpflichtender und optionaler Objekt-/Mietdaten |
| 2 | Abrechnungsfortschritt | belastbare Fortschrittsberechnung aus tatsächlich erfüllten Voraussetzungen |
| 3 | offene Punkte | fachlich priorisierte Zusammenführung von Fehlern, Warnungen und fehlenden Angaben |
| 4 | nächster empfohlener Schritt | regelbasierte Empfehlung unter Berücksichtigung von Abhängigkeiten und Blockaden |
| 5 | Status einzelner Workflowstufen | reproduzierbare Zustandsmaschine für erledigt, offen, Warnung und blockiert |
| 6 | zusammengefasste Qualitätsbewertung | verdichtete, erklärbare Qualitätsaussage ohne Verlust der Einzelhinweise |

## Kachelbereinigung je Seite

Im AP16-Ausgangsstand erzeugte die Laufzeit auf jeder der 17 Arbeitsseiten sieben weitgehend generische Karten. AP17 entfernt diese Raster auf 16 Bearbeitungsseiten vollständig und wandelt die sieben Karten der bisherigen Abrechnungsübersicht in ein fachlich zugeschnittenes Bereichs-Dashboard um.

| Seite | Maßnahme | Anzahl |
|---|---|---:|
| Objektdaten | generische Karten entfernt; direkter Einstieg in Arbeitsbereiche | 7 |
| Wohnungen | generische Karten entfernt; direkter Einstieg in Tabelle/Formular | 7 |
| Zähler-DUMMY | generische Karten entfernt; DUMMY-Arbeitsbereich bleibt unverändert | 7 |
| Mieter/Verträge der Objektvorbereitung | generische Karten entfernt | 7 |
| Mieter & Wohnungen | generische Karten entfernt | 7 |
| Miete & Vorauszahlungen | generische Karten entfernt | 7 |
| Kosten erfassen | generische Karten entfernt | 7 |
| Manuelle & externe Werte | generische Karten entfernt | 7 |
| Verbräuche erfassen | generische Karten entfernt | 7 |
| Verteilung | generische Karten entfernt | 7 |
| Prüfung | generische Karten entfernt | 7 |
| Neue Vorauszahlungen | generische Karten entfernt | 7 |
| Briefe | generische Karten entfernt; AP13-Dokumentbereich unangetastet | 7 |
| Export | generische Karten entfernt | 7 |
| Archiv | generische Karten entfernt | 7 |
| Sicherung | generische Karten entfernt | 7 |
| bisherige Abrechnungsübersicht | sieben generische Karten in fachliches Bereichs-Dashboard umgewandelt | 7 |
| **Gesamt** | **entfernt oder umgewandelt** | **119** |

## Globale Kontextleiste

Der frühere Informationsblock „Aktive Abrechnung“ wurde aus der Sidebar entfernt. Die flache Kontextleiste unter der globalen Kopfleiste zeigt auf relevanten Bearbeitungsseiten Objekt, ARB5, Abrechnungsjahr, Status und die Aktion „Wechseln“. Auf Arbeitsweiche und Bereichsübersicht bleibt sie ausgeblendet.

## Navigationszustände

Alle vier Hauptgruppen können unabhängig geöffnet und geschlossen werden. Der Zustand wird sitzungsübergreifend im lokalen UI-Präferenzspeicher unter `nkpro.workflowNavigation.v4` als Liste offener Gruppen gespeichert. Ein vorhandener v3-Einzelwert wird migriert. Direkte Seitenaufrufe öffnen die zugehörige Gruppe automatisch; die aktive Seite erhält `aria-current="page"`.

## Icon-Zuordnung „Nebenkosten abrechnen“

| Funktion | lokales Linienicon |
|---|---|
| Übersicht | Dashboard |
| Mieter & Wohnungen | Personen/Gebäude |
| Miete & Vorauszahlungen | Geldbörse |
| Kosten erfassen | Beleg |
| Manuelle & externe Werte | Eingabefeld |
| Verbräuche erfassen | Tropfen |
| Verteilung | Verzweigung |
| Prüfung | Schutzschild |
| Neue Vorauszahlungen | Rechner |
| Briefe | Briefumschlag |
| Export | Download |

Alle elf Motive wurden als lokale Inline-SVGs vereinheitlicht. Emojis und externe Iconbibliotheken werden nicht verwendet.

## Bekannte Einschränkungen

Die 15 Vorschauwerte besitzen bewusst noch keine produktive Fachlogik. Der Gebäudekurzcode ARB5 ist derzeit der verbindliche Einzelobjekt-Kontext. Die globale Kontextleiste bietet mit „Wechseln“ den Rücksprung zur Abrechnungsübersicht; eine Mehrgebäude- oder Mehrabrechnungs-Auswahl ist nicht Bestandteil von AP17.

## Reproduzierbare Testanleitung

1. ZIP frisch entpacken.
2. Im Projektverzeichnis `npm ci` ausführen.
3. `npm run test:syntax`, `npm run test:fixtures`, `npm run test:metering`, `npm run test:architecture`, `npm run test:contents` und `npm run test:release` ausführen.
4. Für Browserregressionen `npm run test:browser` ausführen.
5. Manuell die Arbeitsweiche prüfen und beide Bereichsübersichten öffnen.
6. Alle vier Navigationsgruppen unabhängig per Maus und Tastatur öffnen/schließen.
7. Eine aktive Abrechnung öffnen und die Kontextleiste auf relevanten Bearbeitungsseiten prüfen.
8. Breiten von 760 px und 390 px sowie eine Fensterhöhe von etwa 620 px prüfen.
9. Briefvorschau, Druckansicht, Schwarzweißansicht und PDF-Ausgabe gegen AP13 regressiv vergleichen.
10. Anwendung erneut aus einer frisch entpackten finalen ZIP starten und Offline-App-Shell prüfen.
