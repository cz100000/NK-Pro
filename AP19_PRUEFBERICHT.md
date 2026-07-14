# AP19-Prüfbericht – NK-Pro V99.4.22

## Ausgangsprüfung

Die hochgeladene technische Grundlage wurde als NK-Pro V99.4.21 / AP18 bestätigt. Datenschema 5, Datenebenenvertrag 1, Dokumentlayout 4, PWA-Struktur und bestehende Projektdokumentation waren konsistent. Es wurde keine andere technische Grundlage übernommen.

## Umsetzungsergebnis

- 3 zentrale Kontextzustände: geschlossen, Bearbeiten, Nur ansehen
- 10 kontextgebundene Navigationspunkte
- 52 zentral technisch abgesicherte Schreibaktionen
- 28 produktiv angebundene Dashboardausgaben
- 17 dokumentierte Status- und Prüfregeln
- 10 entfernte redundante Seitenkopfkomponenten
- 2 bereinigende Navigationstrennregeln
- gemeinsame Liste für 1 aktuelle und 4 archivierte Abrechnungen im mitgelieferten Ausgangsdatenbestand

## Funktionsprüfungen

| Bereich | Ergebnis |
|---|---|
| Start und Neuladen ohne offenen Kontext | bestanden |
| Keine automatische Abrechnungsauswahl | bestanden |
| Bearbeiten / Ansehen | bestanden |
| Letzter gültiger Arbeitsschritt und Rückfall | bestanden |
| Neue Abrechnung bleibt geschlossen | bestanden |
| Abgeschlossene Abrechnung erneut bearbeiten | bestanden, vorhandenes Freigabemodell |
| Archiv ansehen / Zur Korrektur öffnen | bestanden, keine Kopie |
| Genau ein aktiver Kontext | bestanden |
| Abrechnung schließen | bestanden |
| Dirty-State-Schutz | bestanden |
| UI-Schreibschutz | bestanden |
| Direkte/programmgesteuerte Schreibsperre | bestanden |
| Strg/Cmd+S im Ansichtsmodus | bestanden |
| Erlaubte Navigation und Ansichten | bestanden |
| Kontextleiste / getrennte Status- und Modusanzeige | bestanden |
| Entfernung redundanter Seitenköpfe | bestanden |
| Produktive Dashboardwerte | bestanden |
| Direkteinstiege ohne Autoauswahl | bestanden |
| Tastaturfokus und 640-px-Ansicht | bestanden |
| Navigationstrennlinien | bestanden |

## Regression

Die statischen und domänenspezifischen Prüfungen AP6 bis AP19, JavaScript-Syntax, Fixtures, Zählerdomäne, Release-Inhalt und Release-Konsistenz werden vor Paketierung vollständig ausgeführt. Datenschema, Datenebenenvertrag und AP13-Dokumentlayout bleiben unverändert.

Die reguläre serverbasierte Playwright-Suite kann in dieser Umgebung keine Loopback-Adresse öffnen (`ERR_BLOCKED_BY_ADMINISTRATOR`). Dies ist eine Host-Richtlinie, kein Anwendungsfehler. Als reale Browserprüfung wird `/usr/bin/chromium` über einen serverlosen Harness mit `page.setContent` verwendet. Ergebnis: **5 Szenarien / 42 Einzelprüfungen bestanden**. Die Druck-/PDF-Ausgabe ist zusätzlich durch unveränderte AP13-Module, statische AP13-Regression und Prüfsummen abgesichert; eine physische Druckerabnahme bleibt eine Zielsystemprüfung.

## Reproduzierbare Prüfung

```text
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:contents
npm run test:ap19:harness
npm run test:release
```

Für ein System ohne Loopback-Sperre zusätzlich:

```text
npm run test:browser
```
