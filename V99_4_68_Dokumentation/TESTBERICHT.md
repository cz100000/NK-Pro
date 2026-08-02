# NK-Pro V99.4.68 – Testbericht

## 1. Aktive automatisierte Release-Suite

`npm run release:check:v99468` wurde vollständig bestanden. Enthalten waren:

- JavaScript-Syntaxprüfung
- Fixture- und Datenstrukturprüfung
- Zählerdomäne und Zählerregressionen
- Architektur- und Modulgrenzenprüfungen
- AP22F11B Korrektur 4
- AP22F12 Kosten- und Umlagenabgleich
- V99.4.67 Archiv-/Zählerregression
- V99.4.68 Privatanteil-/Eigenanteil-Systemtest
- strenge Release-Inhaltsprüfung

Die Prüfung umfasste 684 Release-Dateien.

## 2. Browser- und Echtdatenprüfung

Ausgeführt mit installiertem Chromium über Python-Playwright, vollständig offline und mit inlined HTML/CSS/JS.

### Testfall A – Echtdaten M000

- Stammdaten, Zeitraum, Wohnung, Person und Rolle: bestanden
- Kostenverteilung und alle aktiven Kostenarten: bestanden
- reguläres Ergebnis und Saldo: bestanden
- individuelle Werte: bestanden
- Vorauszahlungsanpassung: Teilnehmer enthalten
- Briefauswahl, Einzelbrief, Druckansicht und PDF: bestanden
- Sammelbriefmenge: enthalten
- CSV, Mieter-CSV, Gesamt-JSON und Excel-kompatible XML-Ausgabe: bestanden
- Pflichtvalidierung: fachlich gültig; vorhandene Zählerhinweise bleiben Hinweise
- Snapshot, Wiederöffnung und Jahreswechsel: bestanden
- JSON-Roundtrip: bestanden

### Testfall B – generischer Teilnehmer P900

- andere ID und anderer Name als M000
- Rolle `Eigenanteil`
- regulärer Kostenanteil: 3523.53 EUR
- Vorauszahlungen: 240.00 EUR
- NK-Korrektur: 25.00 EUR
- Kaltmietkorrektur: 10.00 EUR
- regulärer Saldo: 3258.53 EUR
- Brief, Sammeldruck, Vorauszahlungsanpassung, CSV, Snapshot, Wiederöffnung, Jahreswechsel und JSON-Roundtrip: bestanden

### Rollenvarianten

- `Privatanteil`: private Nutzungsart + regulärer Teilnehmer
- `Eigenanteil`: private Nutzungsart + regulärer Teilnehmer
- `Eigentümer/Privat`: private Nutzungsart + regulärer Teilnehmer
- zusätzlich statisch: `private Nutzung`

## 3. UI-Sichtprüfung

Screenshots belegen M000 auf:

- Ergebnis der Abrechnung
- Individuelle Werte
- Abrechnungsbrief

Die PDF wurde gerendert und visuell geprüft. Name, Wohnung, Kostenanteil, Vorauszahlungen und Saldo sind vollständig lesbar. JavaScript-Seitenfehler: 0. Konsolenfehler: 0.

## 4. Vorhandener Gesamttest `npm test`

Alle vor dem Browserabschnitt liegenden aktiven Tests bestehen. Der Node-Browsertest kann in der bereitgestellten schlanken Arbeitsbasis nicht gestartet werden, weil `node_modules/playwright` nicht mitgeliefert ist und die konfigurierte Paketquelle das Paket nicht bereitstellte. Der Abbruch lautet ausschließlich `MODULE_NOT_FOUND: playwright`.

Dies ist kein festgestellter Produktfehler. Derselbe Funktionspfad wurde mit dem in der Umgebung vorhandenen Chromium und Python-Playwright vollständig ausgeführt und bestanden. Das vollständige Log liegt unter `Nachweise/final-npm-test.txt`.

## 5. Historische Tests

Einzelne ältere AP-Tests sind absichtlich auf ihre damaligen Versions- und Buildkennungen festgeschrieben. Soweit sie gegen V99.4.68 gestartet wurden, scheiterten sie ausschließlich an alten Versionsassertionen oder derselben fehlenden Node-Playwright-Abhängigkeit. Sie sind historische Freigabenachweise und nicht die aktive V99.4.68-Release-Suite.
