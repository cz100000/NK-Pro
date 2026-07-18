# Projektstand V99.4.43 – AP22F8B Vorauszahlungen

Die technische Seite `einnahmen` entspricht dem freigegebenen und korrigierten AP22F8A-Zielbild. Der bisherige Klappboxaufbau ist durch einen flachen Seitenfluss mit drei getrennten Tabellen für NK-Vorauszahlungen, Kaltmiete sowie Korrekturen/Gutschriften ersetzt. Alle Wohnungen und Belegungsfälle bleiben sichtbar. Nicht abrechenbare Fälle sind gekennzeichnet und gesperrt, bleiben aber unverändert außerhalb von Berechnung und Summen. Sämtliche bestehenden Gesamtsummen sind in neutralen Summenzeilen erhalten.

Navigation, Seitenkopf, Abrechnungskontext, Datenschema 5, Fachlogik, Berechnung, Speichern, Persistenz, Migration, Archivierung, Qualitätsregeln sowie Brief- und Drucksystem bleiben unverändert.

# Projektstand V99.4.42 – AP22F7B Korrektur 3

Der projektweite Tabellenabschluss ist umgesetzt: Alle 19 produktiven Standardtabellen füllen auf Desktop ihre jeweilige Tabellenhülle vollständig aus und besitzen rechts einen klaren Abschluss. Auf 620 px und 390 px bleibt horizontaler Überlauf auf die interne Tabellenhülle begrenzt. Die Änderung ist rein darstellungsbezogen; Fach-, Daten-, Speicher-, Migrations-, Archiv-, Berechnungs-, Brief- und Druckwege sind unverändert.

# Projektstand V99.4.42 – AP22F7B Korrektur 1

Die Tabellenköpfe der Seite `mieter` unter `Nebenkosten abrechnen` entsprechen wieder dem verbindlichen Tabellenstandard der zuvor migrierten Seiten. Es gibt eine einheitliche hellgraue Kopfzeile, dunkle Beschriftung, genau ein Sortiersymbol je sortierbarer Spalte und keine zusätzliche Sortierunterzeile. Die Kopfzelle `Details` verwendet dieselbe Gestaltung wie alle übrigen Spalten.

Die eigene AP22F7B-Sortierlogik bleibt vollständig erhalten; die konkurrierende generische Tabellenkopfsortierung wird für diese beiden Tabellen nach dem Rendern entfernt. Navigation, Seitenkopf, Abrechnungskontext, Datenmodell, Datenschema 5, Fach- und Statuslogik, Persistenz, Migration, Archivierung, Berechnung, Qualitätsregeln sowie Brief- und Drucksystem bleiben unverändert.

# Projektstand V99.4.42 – AP22F7B Mietverhältnisse Abrechnung

Die technische Seite `mieter` unter `Nebenkosten abrechnen` entspricht dem freigegebenen Zielbild AP22F7A. Der bisherige Klappboxaufbau wurde durch einen flachen Seitenfluss ersetzt. Ein kompakter Datenstandsblock erläutert die periodengebundene Abrechnungskopie und die ausschließlich bewusste Übernahme des zentralen Bestands. Mietverhältnisse werden in einer 8-spaltigen Tabelle vor den Wohnungen angezeigt; Adresse, Kontakt, Briefanrede und Sonderfälle bleiben vollständig über Lesedetails erreichbar. Die nachgeordnete Wohnungstabelle verwendet sechs Spalten und lässt ausschließlich den vorhandenen periodenspezifischen Status bearbeiten.

Navigation, Seitenkopf, Abrechnungskontext, Datenmodell, Datenschema 5, Snapshot-Grenzen, Fach- und Statuslogik, Speichern, Bestandsübernahme, Persistenz, Migration, Archivierung, Berechnung, Qualitätsregeln sowie Brief- und Drucksystem bleiben unverändert.

# Projektstand V99.4.41 – AP22F6B Korrektur 1

Die nach der Sichtprüfung festgelegten Korrekturen sind umgesetzt: Der Seitenkopf geht ohne leeren Statusbereich in die Abrechnungskarte über, die Zeitraum-Klappbox wurde durch eine klar bezeichnete Dialogaktion ersetzt, und `Objekt vorbereiten` bleibt bei archivierten Ansichten vollständig in der Navigation sichtbar. Die bestehenden Zeitraumfelder, Prüfungen und Schreibaktionen werden ausschließlich über ihre vorhandenen zentralen Wege verwendet.

Produktversion, Datenschema 5, Datenmodell, Fach- und Statuslogik, Persistenz, Migration, Archivierung, Berechnung sowie Brief- und Drucksystem bleiben unverändert.

# Projektstand V99.4.41 – AP22F6B Nebenkostenabrechnung Übersicht

Die Seite `start` („Nebenkosten abrechnen – Übersicht“) entspricht dem freigegebenen Zielbild AP22F6A Korrektur 2. Verbindlich umgesetzt sind die kompakte gemeinsame Tabellenstruktur, Trennung aktueller und archivierter Datensätze, Suche, Bestandsfilter, Ergebniszählung sowie quadratische Symbolbuttons in einer einzigen nicht umbrechenden Aktionsgruppe.

Navigation, globaler Seitenkopf, Abrechnungskontext, Datenmodell, Fach- und Statuslogik, Persistenz, Migration, Archivierung, Berechnung, Qualitätsregeln und Dokumentausgabe bleiben unverändert.

# Projektstand V99.4.40 – AP22F5B Korrektur 1

Die Seite `mieterverwaltung` verwendet eine kompakte aktive Tabelle und eine gemeinsame Archivansicht. Alle zwölf bestehenden Pflegefelder sind weiterhin verfügbar, werden jedoch nur im aufgeklappten Detailbereich angezeigt. Archivdatensätze sind vollständig lesend; die vorhandene Reaktivierung bleibt erhalten. Die Zählerseite bleibt unverändert ein DUMMY.

Navigation, Datenmodell, Fachlogik, Persistenz, Migration, Abrechnung, Qualitätsregeln und Dokumentausgabe sind unverändert. Die Produktversion bleibt V99.4.40.

# Projektstand V99.4.40 – AP22F5B Zähler-DUMMY und Mietverhältnisse

Die produktiven Seiten `wasser` und `mieterverwaltung` sind auf den verbindlichen Designstandard `NK-Pro UI Referenz 1.0` migriert. `wasser` bleibt ausdrücklich ein DUMMY mit statischen Beispieldaten und ohne produktive Aktionen, Speicherung oder Abrechnungswirkung. Die fünf Zählerarten verwenden zentrale, farbige SVG-Linienicons.

`mieterverwaltung` trägt den sichtbaren Titel „Mietverhältnisse“ und verwendet vier bestandsbasierte Kennzahlen, eine kompakte Such-/Filterleiste, eine intern horizontal verschiebbare Tabellenkarte sowie den vorhandenen Archivbereich. Die zwölf bestehenden Pflegefelder und alle bisherigen zentralen Aktionen bleiben erhalten.

Navigation, Fachlogik, Zählerfachmodule, Datenmodell, Persistenz, Migration, Backup/Restore, Snapshot, Qualitätsregeln, Brief, Druck und PDF sind unverändert geschützt. Datenschema 5 und Datenebenenvertrag 1 bleiben bestehen.

# Projektstand V99.4.37 – AP22F2B Technische Migration der Objektübersicht

Die produktive Seite `objektuebersicht` ist nach dem freigegebenen AP22F2A-Plan migriert. Eine kompakte gemeinsame Objektidentität verbindet Objektname und Gebäudekurzcode. Der Gesamtstatus zählt ausschließlich Objektdaten, Wohnungen und Mietverhältnisse; der Zähler-DUMMY bleibt ausgeschlossen. Genau eine nächste Aktion folgt der Priorität Objektdaten, Wohnungen, Mietverhältnisse und anschließend Abrechnungsübersicht.

Die Seite besitzt genau vier Aufgaben-/Statuskarten. Die bereichsfremde Karte „Kostenarten und Schlüssel“, die vier alten Kennzahlenkarten sowie doppelte Einheiten- und Mieteranzeigen sind entfernt. Die Zählerkarte bleibt textlich als `DUMMY` und `Clickdummy ohne Fachlogik` gekennzeichnet.

Navigation, globale Kontextleiste, Seitenkopf, Objektstandard, Datenmodell, Datenquellen, Fachlogik, Persistenz, Migration, Backup/Restore, Archiv, Abrechnung, Kosten, Prüfregeln, Import/Export, Brief, Druck und PDF sind unverändert geschützt. Datenschema 5 und Datenebenenvertrag 1 bleiben bestehen.

# Projektstand V99.4.36 – AP22F1C Dialogausblendung und zentrale Versionsanzeige

AP22F1C ist als eng begrenztes Korrekturpaket abgeschlossen. Geschlossene native Dialoge mit der zentralen Klasse `nk-ui-dialog` werden wieder zuverlässig durch ihren fehlenden `open`-Zustand ausgeblendet und erscheinen nicht mehr als leere Box am Seitenende. Öffnen, Escape, Hintergrundschließen, Fokusfalle und Fokusrückgabe bleiben erhalten.

Die sichtbare Versionsangabe in der linken Navigation wird nicht mehr als unabhängiger historischer Text geführt, sondern über `[data-app-version]` aus der zentralen Laufzeitkonstante `APP_VERSION` gesetzt. Der HTML-Fallback, Laufzeitversion, PWA-Metadaten sowie Cache- und Buildkennungen stehen einheitlich auf V99.4.36.

Navigation, Abrechnungskontext, Zeitraumlogik, Schreibschutz, Fachlogik, Prüfregeln, Datenmodell, Persistenz, Migration, Backup/Restore, Archiv, Export, Berechnung, Brief, Druck und PDF bleiben unverändert. Der nächste produktive UI-Schritt ist weiterhin erst nach gesonderter Bestandsanalyse und Freigabe festzulegen.

# Projektstand V99.4.35 – AP22F1B Seitenkopf- und Redundanzbereinigung

AP22F1B ist technisch abgeschlossen. Alle statischen Speicherstatus in produktiven Seitenköpfen, sechs freigegebene lokale Kopf-Metablöcke sowie die fachfremden allgemeinen Kopf-Speicheraktionen auf Archiv, Datensicherung und Export sind entfernt. Auf „Individuelle Werte“ besteht genau ein führender Speicherweg im Seitenkopf.

Die zentrale Seitenschale aus AP22F1A bleibt erhalten. Navigation, Abrechnungskontext, Zeitraumsektion, Schreibschutz, Fachlogik, Berechnungen, Datenmodell, Persistenz, Migration, Backup/Restore, Archiv, Import/Export, Prüfregeln, Brief, Druck und PDF sind geschützt unverändert. Datenschema 5 und Datenebenenvertrag 1 bleiben bestehen.

Ein nächstes produktives UI-Paket wird erst nach gesonderter Bestandsanalyse, Planung und Freigabe festgelegt. Die geschützte Zeitraumsektion auf `start` ist kein Restpunkt von AP22F1B.

# Projektstand V99.4.34 – AP22F1A Globales Schalenfundament

AP22F1A ist technisch abgeschlossen. Die globale Kopf-/Werkzeugleiste, die gelbe Abrechnungskontextleiste, die äußere Seitenschale und die Seitenköpfe sind zentralisiert. Alle 18 sichtbaren Ansichten besitzen genau eine `nk-ui-page-shell`, einen `nk-ui-page-header` und ein sichtbares `h1`.

Die Abrechnungskontextleiste zeigt ausschließlich Objekt, vollständigen Abrechnungszeitraum, Status und bestehende zulässige Kontextaktionen. Sie enthält weder im Bearbeitungs- noch im Nur-ansehen-, Abschluss-, Archiv- oder Korrekturkontext eine Modusangabe. Der Schreibschutz bleibt durch die bestehende größere Notice, die technische Schreibsperre und `Zur Bearbeitung öffnen` vermittelt.

Navigation, Fachlogik, Berechnungen, Datenmodell, Datenschema 5, Persistenz, Migration, Backup/Restore, Archiv/Snapshots, Dirty-State, Import/Export, Prüfregeln, Brief, Druck und PDF sind geschützt unverändert. Nächster geplanter Schritt ist AP22F1B für die gesondert freizugebende Bereinigung lokaler Metablöcke, statischer Speicherstatus und globaler Save-Aktionen.

# Projektstand V99.4.28 – AP21C

AP21C ist abgeschlossen. Die Seite „Individuelle Werte“ wurde visuell und strukturell konsolidiert; Navigation, Datenlogik und Persistenz blieben unverändert. Nächstes Paket: AP21D.

# Projektstand V99.4.26 / AP21B1

AP21B1 ist abgeschlossen. Die linke Navigation wurde als eigenständiges, klar abgegrenztes Paket umgesetzt. Sichtbar sind drei Hauptbereiche: „Projekt vorbereiten“, „Nebenkosten abrechnen“ und „Archiv“. Die Arbeitsweiche bleibt über Logo und Zurück-Button erreichbar; entfernte sichtbare Arbeitsschritte bleiben über ihre bestehenden Seitenschlüssel und Direkteinstiege kompatibel.

Betroffene Produktdateien: zehn. Nicht betroffen sind Fachlogik, Speicher-/Dirty-State, Persistenz, Migration, Snapshot, Archivfachlogik, Briefe, Druck und Export. Nächster geplanter Stand: AP21B2.

# NK-Pro – Projektstand

## Aktuelle Version

- Version: **V99.4.23**
- Arbeitspaket: **AP20**
- Datenschema: **5**
- Datenebenenvertrag: **1**
- Dokumentlayout: **4**

## Erreichter Stand

AP20 ersetzt verteilte und teilweise redundante Prüfoberflächen durch eine zentrale Regel- und Ergebnisarchitektur. 42 Regeln werden in acht fachlichen Prüfbereichen ausgewertet. Das Cockpit, kontextbezogene Fachseitenhinweise, Abschlussbereitschaft und Abnahmeprotokoll verwenden dieselbe Quelle. Technische Selbsttests und Releasekontrollen sind in der Systemdiagnose getrennt.

Bestätigungen sind einer Abrechnung, Regelinstanz und einem Fingerprint der Eingangsdaten zugeordnet. Relevante Datenänderungen öffnen den Punkt erneut. Blocker sind nicht bestätigbar. Im AP19-Ansichtsmodus bleiben sämtliche Änderungen gesperrt.

## Aktueller Korrekturstand

Korrekturstand 3 verhindert gemischte Browserstände aus altem Service-Worker-Cache und neuen HTML-Dateien. Die kritischen Zählerassets sind versionsgebunden; der Worker aktualisiert sich cachefrei und lädt die App nach Aktivierung einmal neu.

## Unverändert

Berechnungsformeln, Abrechnungsergebnisse, Arbeitsweiche, AP13-Brieflayout, Druck/PDF/Schwarzweiß, Schema und Datenvertrag wurden nicht fachlich verändert. Der Zählerbereich unter Objektvorbereitung bleibt DUMMY.

## Nächster Stand

AP21 ist offen und nicht Bestandteil dieses Releases.

## V99.4.29 – AP22A UI-Bibliothek
AP22A führt den zentralen Namensraum `nk-ui-*`, kanonische `--nk-ui-*`-Design-Tokens, eine JavaScript-Metadaten-Schnittstelle sowie Katalog und Migrationsmatrix ein. Bestehende Fachseiten und Altvarianten bleiben unverändert; die kontrollierte Migration folgt in separaten AP22-Paketen.


## V99.4.32 – AP22D UI-Bibliothek

AP22D ist abgeschlossen. Fünf produktive Dialoge verwenden das zentrale Dialogsystem einschließlich Fokusführung, Fokusfalle, Fokusrückgabe und kontrollierter Schließregeln. Sieben standardisierte Inhaltszustände stehen zentral bereit; zwei geeignete Filter-Leerzustände wurden produktiv migriert.

Zehn Produktdateien liegen innerhalb der Änderungskontrolle. Fachlogik, Berechnungen, Datenmodell, Persistenz, Migration, Backup, Restore, Archiv, Navigation, Abrechnungskontext, Briefe, Druck, PDF, Import, Export und bestehende Prüfregeln blieben unverändert. Nächstes Paket: AP22E – UI-Bibliothek: Seitenschale, Layout und Komponenten-Sonderformen.

## V99.4.33 – AP22E UI-/UX-Designvertrag und Referenzbibliothek

AP22E legt erstmals den vollständigen verbindlichen UI-/UX-Designvertrag fest. Zielbild, Seitenanatomie, Komponentenregeln, Design-Tokens, Abnahmekatalog und eine isolierte browserfähige Referenzbibliothek bilden die Abnahmegrundlage für alle folgenden UI-Pakete.

Die produktive Anwendung bleibt technisch und visuell auf dem unveränderten Laufzeitstand V99.4.32. Alle produktiven HTML-, CSS- und JavaScript-Dateien, Navigation, Fachlogik, Daten, Persistenz, Dokumentausgabe und Service Worker wurden geschützt und per SHA-256 verglichen.

Die Referenzbibliothek wird direkt über `ui-reference/index.html` oder über einen lokalen statischen Server unter `/ui-reference/` geöffnet. Sie verwendet ausschließlich fiktive deutsche NK-Pro-Beispiele.

Nächster Schritt ist kein ungeprüfter Seitenumbau. Für jeden zusammengehörigen Seitenbereich wird zuerst ein Vorschlag mit Bestandsanalyse, Redundanzen, Zielkomponenten, Mockup, Datei-Positivliste, Abnahmekriterien, Tests und Schutzbereichen vorgelegt. Erst nach Nutzerfreigabe erfolgt die technische Migration.


## AP22F7B Korrektur 3

Der zentrale Tabellenstandard verlangt für jede bestehende und künftige `nk-ui-table` einen sichtbaren rechten Rahmen an der letzten Kopf- und Datenzelle sowie standardgerechte rechte Eckradien. Die Tabellen füllen auf Desktop weiterhin die verfügbare Inhaltsbreite; auf schmalen Ansichten scrollt ausschließlich die Tabellenhülle. Mietzeiträume auf „Nebenkosten abrechnen → Mietverhältnisse“ werden sichtbar als `TT.MM.JJJJ` dargestellt, während Sortierung und gespeicherte ISO-Werte unverändert bleiben.

