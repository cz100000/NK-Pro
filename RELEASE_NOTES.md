# Release V99.4.41 – AP22F6B Nebenkostenabrechnung Übersicht

Dieses Release migriert ausschließlich die Seite „Nebenkosten abrechnen – Übersicht“. Die vorhandenen Abrechnungen, Status-, Fortschritts-, Zeitraum- und Saldodarstellungen sowie alle bestehenden Aktionswege bleiben erhalten. Neu ist ausschließlich die freigegebene kompakte Darstellung mit gemeinsamer Tabelle, Suche, Statussegmenten, Ergebniszählung und einer nicht umbrechenden Symbolaktionsgruppe.

Datenmodell und Datenschema 5, Fachlogik, Persistenz, Migration, Archivierung, Abrechnungsberechnung, Navigation sowie Brief- und Drucksystem wurden nicht verändert.

# Release V99.4.40 – AP22F5B Korrektur 1

Die Mietverhältnisse-Seite verwendet nun eine kompakte Übersicht: Zusammenfassungszeilen enthalten keine dauerhaften Eingabe- oder Auswahlfelder. Alle zwölf vorhandenen Pflegefelder erscheinen erst im aufgeklappten Detailbereich. Aktive und archivierte Mietverhältnisse teilen sich eine Tabellenkarte mit dem Umschalter `Aktiv / Archiv`; Archivzeilen und Archivdetails bleiben schreibgeschützt, die bestehende Reaktivierungsaktion bleibt erhalten.

Die Produktversion bleibt V99.4.40. Datenmodell, Fachlogik, Speicherwege, Navigation und Zähler-DUMMY sind unverändert.

# Release V99.4.40 – AP22F5B Zähler-DUMMY und Mietverhältnisse

AP22F5B migriert zwei Seiten gemeinsam auf den verbindlichen Standard `NK-Pro UI Referenz 1.0`. Die Seite „Zähler“ bleibt vollständig ein nicht produktiver DUMMY. Sie zeigt ausschließlich fiktive Beispieldaten, genau fünf Zählerarten und eine rein visuelle Such-/Filterfunktion. Es entstehen keine Zählerstammdaten, Messwerte, Schreibwege oder Abrechnungswirkungen.

Die Seite „Mietverhältnisse“ übernimmt die freigegebene Richtung von Mockup A. Vier Kennzahlenkarten verwenden ausschließlich den vorhandenen Bestand: Gesamt, Aktiv, Nicht aktiv und Archiviert. Suche und Filter mutieren keine Fachdaten. Alle zwölf vorhandenen Pflegefelder sowie Neuanlage, globale Speicherung, Archivierung und Reaktivierung bleiben über die bestehenden zentralen Wege erhalten. Im Nur-Ansehen-Modus sind alle schreibenden Bedienelemente gesperrt; Suche und Filter bleiben ohne Datenmutation nutzbar.

Nicht verändert wurden Navigation, Objektstandard, Zählerfachmodell, Persistenz, Migration, Backup/Restore, Abrechnungssnapshot, Berechnungen, Qualitätsregeln, Brief, Druck und PDF. Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert.

# Release V99.4.37 – AP22F2B Technische Migration der Objektübersicht

Die Seite „Objekt vorbereiten – Übersicht“ ist vollständig auf den freigegebenen UI-/UX-Standard migriert. Objektname und Gebäudekurzcode erscheinen gemeinsam; der Vorbereitungsstatus umfasst genau Objektdaten, Wohnungen und Mietverhältnisse. Eine einzige hervorgehobene Aktion führt abhängig vom vorhandenen Arbeitsstand zuerst zu Objektdaten, dann Wohnungen, dann Mietverhältnissen und bei vollständiger Vorbereitung zur Abrechnungsübersicht.

Die Arbeitsbereiche werden in genau vier kompakten Statuskarten dargestellt. Kostenarten, Umlageschlüssel und Abrechnungsprüfungen wurden aus der Objektübersicht entfernt. Der Zählerbereich bleibt unverändert ein deutlich gekennzeichneter Clickdummy ohne Fachlogik.

Nicht verändert wurden Navigation, gelbe Abrechnungskontextleiste, Seitenkopf, Objektstandard, Datenmodell, Datenquellen, Fach- und Prüfregeln, Persistenz, Migration, Backup/Restore, Archiv, Abrechnung, Kosten, Import/Export, Brief, Druck und PDF.

# Release V99.4.36 – AP22F1C Dialogausblendung und zentrale Versionsanzeige

AP22F1C korrigiert zwei sichtbare Releasefehler aus der bisherigen Produktbasis. Der native Prüfpunkt-Detaildialog bleibt ohne `open`-Attribut nun vollständig unsichtbar und wird nicht mehr durch das zentrale Flex-Layout als leere Box am Seitenende dargestellt. Die vorhandene Dialogbedienung einschließlich Escape, Hintergrundschließen, Fokusführung und Fokusrückgabe bleibt erhalten.

Die Versionsangabe in der linken Navigation wird aus der zentralen Laufzeitkonstante `APP_VERSION` gespeist. Damit kann die sichtbare Version nicht mehr unabhängig von Laufzeit-, PWA- und Buildversion zurückbleiben. Das Release trägt durchgängig V99.4.36 / AP22F1C.

Nicht verändert wurden Navigationseinträge, gelbe Abrechnungskontextleiste, Zeitraum- und Schreibschutzlogik, Fachregeln, Datenmodell, Persistenz, Migration, Backup/Restore, Archiv, Import/Export, Berechnung, Brief, Druck und PDF.

# Release V99.4.35 – AP22F1B Seitenkopf- und Redundanzbereinigung

AP22F1B bereinigt ausschließlich Redundanzen in den bereits zentralisierten Seitenköpfen. Dauerhafte statische Angaben `Gespeichert` entfallen vollständig. Die sechs freigegebenen lokalen Kopf-Metablöcke wurden ohne Ersatz entfernt. Archiv, Datensicherung und Export verwenden keine allgemeine Kopfaktion `Speichern` mehr, sondern ausschließlich ihre vorhandenen fachlich benannten Inhaltsaktionen.

Auf „Individuelle Werte“ ist der Speicherbutton im Seitenkopf der einzige führende Speicherweg; wiederholte Karten-Speicheraktionen sind entfernt. Reset, Import, Eingabefelder, Datenquellen, Summenabgleich, Filter, Zählerfunktionen und Berechnungen bleiben unverändert.

Nicht verändert wurden Navigation, gelbe Abrechnungskontextleiste, Zeitraumsektion, Schreibschutz-Notice und `Zur Bearbeitung öffnen`, Save-/Dirty-State-Semantik, Fachlogik, Datenschema 5, Persistenz, Migration, Backup/Restore, Archiv, Import/Export, Prüfregeln, Brief, Druck und PDF.

# Release V99.4.34 – AP22F1A Globales Schalenfundament

AP22F1A setzt ausschließlich die globale äußere UI-Schale um. Jede der 18 sichtbaren produktiven Ansichten besitzt nun genau eine zentrale Seitenschale, einen zentralen Seitenkopf und einen sichtbaren Haupttitel als `h1`. Die Inhaltsbreiten sind zentral als `narrow` 760 px, `default` 1180 px und `wide` 1440 px definiert; die Seiteninnenabstände betragen 32 px, unter 1280 px 24 px und unter 620 px 16 px.

Die gelbe Abrechnungskontextleiste zeigt in allen Zuständen Objekt, vollständigen Abrechnungszeitraum und Status sowie bereits bestehende zulässige Kontextaktionen. Eine Modusangabe wird nicht mehr dargestellt. Der Nur-ansehen-Zustand bleibt über die größere handlungsorientierte Schreibschutz-Notice, deaktivierte beziehungsweise ausgeblendete Bearbeitungsfunktionen und die dort verbleibende Aktion `Zur Bearbeitung öffnen` eindeutig erkennbar.

Die Navigation ist bytegleich zum Ausgangsstand geschützt. Ebenfalls unverändert blieben Fachlogik, Berechnungen, Datenschema 5, Persistenz, Migration, Backup/Restore, Archiv/Snapshots, Dirty-State, Import/Export, Prüfregeln, Brief, Druck und PDF. Karten, Tabellen, Formulare, Dialoge, Klappboxen, lokale Metablöcke und Save-Aktionen sind nicht Bestandteil dieses Pakets.

# Release V99.4.32 – AP22D Dialoge und Leerzustände

AP22D erweitert die zentrale UI-Bibliothek um ein verbindliches Dialogsystem und sieben standardisierte Inhaltszustände. Migriert wurden die Dialoge zum Anlegen und Löschen einer Abrechnung, zum Bearbeiten eines Einheitspreises, zur Kostenartauswahl und zu Prüfpunktdetails sowie zwei geeignete leere Filterzustände.

Tastaturbedienung, Fokusfalle, Fokusrückgabe, sichtbarer Fokus und dialogbezogene Escape-/Hintergrundregeln sind zentral abgesichert. Der destruktive Löschdialog ist besonders geschützt. Brief-, Druck-, PDF- und Exportbereiche bleiben außerhalb der Migration.

Nicht verändert wurden Fachlogik, Berechnungen, Datenmodell, Persistenz, Migration, Backup, Restore, Archiv, Navigation, Abrechnungskontext, Prüfregeln und Dokumentausgabe.

# Release V99.4.28 – AP21C Individuelle Werte

AP21C konsolidiert ausschließlich die Seite „Individuelle Werte“. Status, Filter und Kostenarten sind als klar erkennbare Arbeitsbereiche strukturiert. Die Filteranzeige nennt die Anzahl der sichtbaren Kostenarten. Bestehende Klappboxen, zentrale Zählerdatenquelle, Datenattribute, Direkteinstiege, Schreibschutz und Speicheraktionen bleiben kompatibel.

Nicht verändert wurden Navigation, Abrechnungskontext, Fachlogik, Berechnungen, Prüfregeln, Persistenz, Migration, Snapshot, Archiv, Briefe, Druck und Export.

# Release V99.4.26 – AP21B1 Navigation

AP21B1 überarbeitet ausschließlich die linke Navigation. Die Desktop-Navigation ist 256 px breit, verwendet den dunkelblauen Kopf und den weißen, oben abgerundeten Navigationskörper der Referenz und besitzt klar getrennte aktive, Hover- und Fokuszustände.

Die sichtbare Struktur besteht aus „Projekt vorbereiten“, „Nebenkosten abrechnen“ und dem eigenständigen Hauptbereich „Archiv“. „Prüfung & Freigabe“ steht unmittelbar vor „Briefe“. Die Arbeitsweiche wird ausschließlich über das NK-PRO-Logo oder den runden Zurück-Button geöffnet. Historische Seitenschlüssel und Direkteinstiege bleiben kompatibel.

Nicht verändert wurden die globale Abrechnungskontextleiste, Dirty-State- und Speicherlogik, Fachregeln, Prüfberechnungen, Persistenz, Migration, Snapshot- und Archivlogik, Briefe, Druck, Export und fachliche Tabellen. Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert.

# Release V99.4.24 – AP21A

Navigation, gemeinsame Seite „Individuelle Werte“, globales UI-Konsistenzpaket und vereinheitlichter Ansichtsmodus. Datenschema 5 und NKP-FACH-001 bleiben unverändert; NKP-FACH-002 ist nicht umgesetzt.

# Release Notes – NK-Pro V99.4.23

## AP20

- vollständiges Inventar von 176 bestehenden Prüfstellen mit Bewertungsmatrix,
- zentrale Registry mit 42 stabilen Regel-IDs,
- vier Kategorien, sechs sichtbare Status und getrennte Bearbeitungszustände,
- produktives Cockpit „Abrechnung prüfen“ mit acht fachlichen Bereichen,
- 15 kontextbezogene Fachseitenbereiche und 36 Regel-Direkteinstiege,
- Fingerprint-gebundene Bestätigungen, Begründungen und Nicht-anwendbar-Entscheidungen,
- automatische Entwertung veralteter Bestätigungen bei relevanten Datenänderungen,
- sechs Vorjahres- und Vergleichsregeln mit dokumentierten, fachartspezifischen Schwellen,
- Abschlussprüfung und Abnahmeprotokoll auf derselben zentralen Ergebnisquelle,
- technische Prüfungen in eigener Systemdiagnose,
- AP19-Ansichtsmodus einschließlich direkter Schreibsperre vollständig erhalten,
- Datenschema 5, Datenebenenvertrag 1, Berechnungsergebnisse und AP13-Ausgabelayout unverändert.

Abschluss: **Änderungen umgesetzt – NK-Pro V99.4.23**
## Korrekturstand 1

Ein rückläufiger Zählerstand ohne dokumentierten Überlauf wird beim Neustart nicht mehr als fataler Speicher- oder Migrationsfehler behandelt. Der Datensatz wird geladen; der Punkt erscheint im zentralen Prüfsystem als „Zu prüfen“.

## Korrekturstand 3

- Kritische Zähler-UI-Assets tragen die Build-Kennung `99.4.23-ap20-corr3`.
- Service-Worker-Registrierung verwendet `updateViaCache: none` und fordert aktiv eine Aktualisierung an.
- Nach dem Wechsel auf den neuen Worker erfolgt genau ein automatischer Reload.
- Ein vorher falsch gespeicherter Wert `29774` wird bei neuer Eingabe `297,74` sofort als `31,74 m³` berechnet und nach Enter als `297.74` gespeichert.
- PWA-Cache: `nk-pro-v99-4-23-ap20-corr3`.

## Korrekturstand 2

- Sofortige Verbrauchsberechnung während der Zählerstandseingabe.
- Sofortige Aktualisierung der Wasser- und Gesamtsummen.
- Enter speichert Zählerwerte zuverlässig.
- Dezimalkomma und Dezimalpunkt werden korrekt akzeptiert.
- Keine zusätzlichen Messwertrevisionen durch die reine Live-Vorschau.
- PWA-Cache: `nk-pro-v99-4-23-ap20-corr2`.

## V99.4.29 – AP22A UI-Bibliothek
AP22A führt den zentralen Namensraum `nk-ui-*`, kanonische `--nk-ui-*`-Design-Tokens, eine JavaScript-Metadaten-Schnittstelle sowie Katalog und Migrationsmatrix ein. Bestehende Fachseiten und Altvarianten bleiben unverändert; die kontrollierte Migration folgt in separaten AP22-Paketen.

# NK-Pro V99.4.33 – AP22E UI-/UX-Designvertrag und Referenzbibliothek

AP22E ist ein Dokumentations-, Design- und Referenzrelease ohne produktive UI-Migration. Der Release definiert verbindlich, wie NK-Pro-Seiten, Komponenten, Zustände, Fokus, Tastaturbedienung und Responsive-Verhalten künftig aussehen und geprüft werden.

## Referenzbibliothek

Öffnen Sie `ui-reference/index.html` direkt im Browser oder starten Sie einen lokalen statischen Server und rufen Sie `/ui-reference/` auf. Die Seite ist nicht in die produktive Navigation eingebunden und verwendet ausschließlich fiktive Beispieldaten.

## Navigation

Die Navigation aus V99.4.32 bleibt vollständig geschützt. Die Navigation des Styleguide-Bildes ist keine Zielvorgabe.

## Produktive Anwendung

Der produktive Laufzeitstand bleibt V99.4.32/AP22D. V99.4.33 bezeichnet den freigegebenen AP22E-Vertrags- und Referenzrelease. Produktdateien sind hash-identisch zum Ausgangsrelease.

## Folgeprozess

Spätere Migrationen benötigen vor Umsetzung einen freigegebenen Bereichsvorschlag einschließlich Mockup und Datei-Positivliste. Nicht geregelte Varianten dürfen nicht improvisiert werden.
