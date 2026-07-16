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
