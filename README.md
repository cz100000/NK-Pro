# NK-Pro V99.2.7 – Periodenstatus, Eingabestruktur und Briefoptimierung

NK-Pro ist eine lokal nutzbare HTML-/JavaScript-Anwendung zur Erstellung von Nebenkostenabrechnungen. Sie kann direkt im Browser oder als GitHub-Pages-PWA betrieben werden. Arbeitsdaten bleiben im Browser und sollten regelmäßig als JSON gesichert werden.

## Wichtigste Änderungen

### Wohnungsbestand und Periodenstatus

Der zentrale Wohnungsbestand beschreibt nur noch die tatsächlich vorhandenen Wohnungen. Der Status **aktiv/inaktiv** wird je Abrechnungsperiode im Tab **Mieter & Wohnungen** festgelegt. Beim Jahreswechsel wird der Status aus dem Vorjahr übernommen; neu hinzugefügte Wohnungen starten aktiv. Stammdatenabgleiche überschreiben den Periodenstatus nicht.

Die Umlageschlüssel sind eindeutig getrennt:

- **alle Wohneinheiten** verwendet den vollständigen physischen Bestand,
- **nur aktive Wohneinheiten** verwendet ausschließlich die in der aktuellen Abrechnung aktiven Wohnungen.

### Kostenarten

Kostenart, Kosten-ID und Gruppe sind in der Haupttabelle nicht mehr frei veränderbar. Eigene Kostenarten werden im Auswahlfenster benannt und einer kontrollierten Gruppe zugeordnet. Bestehende freie IDs werden wiederverwendet. Fachlogik stützt sich auf stabile IDs und interne Typen statt auf zufällige Wörter im Anzeigenamen.

### Eigentümer-/Privatanteil M000

M000 bleibt Bestandteil der vollständigen Kosten- und Verbrauchsverteilung und wird in Kontroll- und Ergebnisansichten als **Eigentümer/Privat** ausgewiesen. M000 wird weiterhin nicht als normaler Mieter bei Kaltmiete, Mietervorauszahlungen, Vorauszahlungsanpassung oder Briefausgabe behandelt.

### Neuer Bereich „Manuelle & externe Werte“

Unter **2 Einnahmen & Verbräuche** gibt es einen dritten Tab. Je Kostenart wird genau eine Quelle gewählt:

- Zählerstände,
- manuelle Verbrauchsmenge,
- direkter Eurobetrag,
- externe Einzelabrechnung.

Das Tool blendet nur passende Eingabefelder ein, warnt vor einem Quellenwechsel mit vorhandenen Werten und kontrolliert Summen externer Einzelabrechnungen. Bestehende Werte aus älteren Versionen werden übernommen.

### Berechnung

Der Bereich **3 Berechnung** enthält keine Quelldatenerfassung mehr. Er zeigt Ergebnis je Mieter beziehungsweise Eigentümer, Umlagekontrolle nach Kostenart, Berechnungsnachweis je Wohnung sowie Plausibilitätsprüfungen.

### Zählerstände und Historie

Zählerwerte werden bei Stammdatenabgleich, Mieterreihenfolge und Jahreswechsel über stabile Mieter- und Wohnungs-IDs zugeordnet. Ein Vorjahresendstand wird zum neuen Anfangsstand; der neue Endstand bleibt leer. Die Historie kombiniert die Excel-Altdaten mit abgeschlossenen NK-Pro-Abrechnungen und zeigt die jeweilige Quelle. Fehlende oder auffällige Übernahmen werden gemeldet.

### Abrechnungsbriefe

Das Anschriftfeld ist fest für einen üblichen DIN-5008-Fensterbrief positioniert. Ohne tatsächliche Änderung der NK-Vorauszahlung und ohne überlangen Zusatztext bleibt der Brief möglichst einseitig. Eine Änderung ab 0,01 Euro erzeugt bei aktivierter Ausgabe eine zweite Seite mit der Vorauszahlungsanpassung. Längere Zusatztexte werden anhand des tatsächlichen Platzbedarfs auf ein Zusatzblatt verschoben. Grußformel und Unterschrift stehen immer auf der letzten verwendeten Seite.

## Start und Veröffentlichung

### Lokal

`index.html` in einem modernen Browser öffnen. Service Worker und installierbare PWA funktionieren verlässlich über HTTPS oder einen lokalen Webserver.

### GitHub Pages

Den Inhalt der ZIP-Datei unverändert in das Veröffentlichungsverzeichnis kopieren und GitHub Pages aktivieren. `.nojekyll` verhindert eine Jekyll-Verarbeitung. Der Service Worker verwendet den Cache `nk-pro-v99-2-7` und entfernt ältere NK-Pro-Caches beim Aktivieren.

## Dateien

- `index.html` – vollständige Anwendung
- `service-worker.js` – Offline-Cache
- `manifest.webmanifest` – PWA-Metadaten
- `README.md` – Nutzung und Veröffentlichung
- `CHANGELOG.md` – Versionsverlauf
- `WORKBOOK.md` – verbindliche Fach- und Entwicklungsregeln
- `UI_ARCHITEKTUR_V99_2_7.md` – technische Architektur
- `V99_2_7_Pruefbericht.json` – strukturierter Prüfbericht
- `SHA256SUMS.txt` – Prüfsummen des ZIP-Inhalts

## Prüfung

V99.2.7 wurde mit JavaScript-Syntaxprüfung, Browser-Rendering, Datenmigrationen und 39 gezielten Funktionsprüfungen getestet. Geprüft wurden insbesondere Periodenstatus, 7-gegen-5-Wohnungsbasis, M000, alle vier Eingabequellen, Zählerzuordnung über stabile IDs, Jahreswechsel, Historie, freie Kostenarten, Summenabgleich und ein-/zweiseitige Briefe. Der Release-Audit meldet 28 OK, 0 Fehler und 0 Hinweise. Der App-Selbsttest meldet 30 OK, 0 Fehler und zwei Hinweise zu vorhandenen Arbeits-/Archivdaten.

## Datenschutz und Sicherung

NK-Pro arbeitet lokal im Browser. Browserdaten können durch Bereinigung, Profilwechsel oder Geräteverlust verloren gehen. Vor Migrationen, Jahreswechseln und größeren Bearbeitungsschritten sollte eine vollständige JSON-Sicherung extern gespeichert werden.
