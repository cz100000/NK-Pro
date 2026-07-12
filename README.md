# NK-Pro V99.3.0 – Navigation und vollständige Qualitätsprüfung

V99.3.0 baut auf V99.2.9 auf. Der Tab „Abrechnungsstatus“ wurde vollständig entfernt, Stammdaten stehen nun oberhalb der Abrechnungsübersicht, und die Qualitätsprüfung übernimmt Status-, Finalisierungs- und Gesamtprüffunktionen. K002 Wasserversorgung erscheint nicht mehr unter „Manuelle & externe Werte“, sondern wird ausschließlich aus Zählerständen gespeist.

## Freigabe

- Datenschema: 5
- JavaScript-Syntax: 5/5 bestanden
- Chromium-/Playwright-Tests: 15/15 bestanden
- Browserkonsole und Seitenfehler: fehlerfrei
- Berechnungs- und Referenzfälle: bestanden
- Export-/Import-, Persistenz- und PWA-Tests: bestanden


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

Den Inhalt der ZIP-Datei unverändert in das Veröffentlichungsverzeichnis kopieren und GitHub Pages aktivieren. `.nojekyll` verhindert eine Jekyll-Verarbeitung. Der Service Worker verwendet den Cache `nk-pro-v99-2-9` und entfernt ältere NK-Pro-Caches beim Aktivieren.

## Dateien

- `index.html` – vollständige Anwendung
- `service-worker.js` – Offline-Cache
- `manifest.webmanifest` – PWA-Metadaten
- `README.md` – Nutzung und Veröffentlichung
- `CHANGELOG.md` – Versionsverlauf
- `WORKBOOK.md` – verbindliche Fach- und Entwicklungsregeln
- `UI_ARCHITEKTUR_V99_2_8.md` – technische Architektur
- `V99_2_8_Pruefbericht.json` – strukturierter Prüfbericht
- `SHA256SUMS.txt` – Prüfsummen des ZIP-Inhalts
- `package.json` / `package-lock.json` – reproduzierbare Testabhängigkeiten und Befehle
- `playwright.config.cjs` – Chromium-/Playwright-Konfiguration
- `tests/` – automatisierte Browser- und Regressionstests
- `testdaten/` – unveränderliche Referenzfälle
- `tools/` – Syntaxprüfung und lokaler Testserver

## Prüfung

V99.2.9 wird weiterhin mit einer dauerhaft mitgelieferten Playwright-Testumgebung geprüft. Die Freigabe umfasst JavaScript-Syntaxprüfung, Browserkonsole, Seitenfehler, Navigation, lokale Persistenz, Sicherungs-Rundlauf, Migration, interne Audits und Service-Worker-Cache. Die fachliche Berechnungslogik und das Datenschema bleiben gegenüber V99.2.7 unverändert.

## Datenschutz und Sicherung

NK-Pro arbeitet lokal im Browser. Browserdaten können durch Bereinigung, Profilwechsel oder Geräteverlust verloren gehen. Vor Migrationen, Jahreswechseln und größeren Bearbeitungsschritten sollte eine vollständige JSON-Sicherung extern gespeichert werden.


## Strukturierung V99.2.9

Die bisher in `index.html` eingebetteten produktiven Styles und Skripte wurden ohne fachliche Änderung in klar benannte Dateien ausgelagert:

- `assets/app.css` – vollständige Anwendungs- und Druckdarstellung,
- `js/navigation.js` – Navigations- und Arbeitsbereichssteuerung,
- `js/modal-events.js` – globale Modalereignisse,
- `js/app.js` – bestehende Fach-, Daten- und Darstellungslogik,
- `js/service-worker-register.js` – Registrierung und Aktualisierung der PWA.

Die Anwendung bleibt frameworkfrei und benötigt keinen Buildprozess. `index.html` enthält nur noch Struktur und Verweise auf die ausgelagerten Dateien.

## Automatisierte Freigabeprüfung V99.2.9

Die Testumgebung ist nur für Entwicklung und Freigabe erforderlich; die eigentliche Anwendung bleibt weiterhin ohne Installation direkt im Browser nutzbar.

```bash
npm install
npx playwright install chromium
npm test
```

Alternativ kann über die Umgebungsvariable `CHROMIUM_EXECUTABLE_PATH` ein vorhandenes Chromium, Google Chrome oder Microsoft Edge verwendet werden. Eine Version ist nur freigabefähig, wenn Syntaxprüfung und alle Playwright-Tests ohne Fehler abgeschlossen werden. Der HTML-Bericht liegt anschließend unter `test-results/html/`.