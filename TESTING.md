# Teststand V99.4.35 / AP22F1B

Neue separate Prüfungen:

```text
npm run test:ap22f1b:static
npm run test:ap22f1b:browser
npm run release:check
```

Die statischen Tests prüfen die 18-Seiten-Matrix, die elf zulässigen Kopf-Speicheraktionen, die entfernten Status-/Metablöcke, die Aktionsredundanz auf `manuellewerte` und die Schutz-Hashes. Der Chromium-Test prüft sechs Viewports sowie Nur-ansehen, Fokus, Aktionsstapelung und Overflow.

`release:check` verwendet die weiterhin gültigen AP22F1A-Schutzprüfungen und die aktuellen AP22F1B-Tests. Historische Tests mit fest verdrahteten früheren AP-, Versions-, Navigations- oder Modusannahmen bleiben unverändert und sind in `AP22F1B_PRUEFBERICHT.md` dokumentiert.

# AP21C-Prüfstand V99.4.28

Neue separate Tests: `tests/ap21c-individual-values.test.cjs` und `tests/ap21c-individual-values.spec.js`. Bestehende Regressionstests wurden nicht verändert.

# Teststand V99.4.26 / AP21B1

AP21B1 besitzt neue, separate Tests: `tests/ap21b1-navigation.test.cjs` und `tests/ap21b1-navigation.spec.js`. Geprüft werden Reihenfolge und Bezeichnungen, 256-px-Referenzdarstellung, aktive/Hover-/Fokuszustände, unabhängiges Ein- und Ausklappen, Logo- und Zurück-Funktion, Responsive-Overlay, Escape/Außenklick, Seitenschlüssel, Direkteinstiege und interne Navigationsdiagnose.

```text
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:ap21b1
npm run test:contents
npm run test:release
```

Bestehende historische Regressionstestdateien wurden entsprechend der Änderungskontrolle nicht verändert. Tests mit fest eingebauten V99.4.24-/AP21A- oder früheren Navigationsannahmen bleiben als historische Nachweise erhalten; die aktuelle AP21B1-Abnahme erfolgt über die separaten AP21B1-Tests und die weiterhin fachlich relevanten unveränderten Regressionen.

# Testanleitung – NK-Pro V99.4.23

## Automatisierte Prüfungen

```text
npm ci
npm run test:syntax
npm run test:fixtures
npm run test:metering
npm run test:architecture
npm run test:contents
npm run test:ap20:harness
npm run test:release
```

`test:architecture` umfasst AP6 bis AP20. Der AP20-Chromium-Harness prüft fünf reale Browserabläufe mit 48 Einzelprüfungen ohne Netzwerkserver, darunter Cockpit, Detaildialog, Systemdiagnose, Ansichtsmodus, direkte Schreibsperre, Bestätigungsfingerprint und Blockerschutz.

In einer Umgebung ohne Loopback-Sperre zusätzlich:

```text
npm run test:browser
```

## Manuelle Kernabnahme

1. Anwendung neu laden; keine Abrechnung darf automatisch geöffnet sein.
2. Abrechnung ausdrücklich mit Bearbeiten öffnen und „Abrechnung prüfen“ aufrufen.
3. Vier Statuskarten, acht Prüfbereiche, Filter, Aufklappgruppen und Regelübersicht prüfen.
4. Einen Plausibilitätsbefund bestätigen, Begründung prüfen, Bestätigung zurücknehmen.
5. Relevanten Eingangswert ändern und prüfen, dass die alte Bestätigung nicht mehr gilt.
6. Einen Blocker öffnen; Bestätigung darf nicht angeboten oder technisch akzeptiert werden.
7. „Zur Ursache“ auf mehreren Fachseiten prüfen; Ziel soll fokussiert oder hervorgehoben werden.
8. Abrechnung im Ansichtsmodus öffnen; Bestätigen, Nicht anwendbar und Zurücknehmen müssen gesperrt sein.
9. Systemdiagnose unter Datensicherung & System prüfen; technische Meldungen dürfen nicht im fachlichen Cockpit erscheinen.
10. Abschlussaussagen „Nicht abschließbar“, „Fachlich zu prüfen“ und „Abschlussbereit“ gegen die zentralen Ergebnisse prüfen.
11. Desktop, Laptop, schmale Fenster, geringe Höhe, Tablet und sehr schmale Ansicht kontrollieren.
12. Briefvorschau, Schwarzweiß, Druck und PDF gegen AP13 prüfen; Offline-Start nach einmaligem Online-Laden prüfen.

## Umgebungsgrenzen

Die Prüfumbgebung blockiert serverbasierte Loopback-Navigation mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Der serverlose Desktop-Chromium-Harness ist bestanden. Bei isolierter sehr schmaler Viewport-Ausführung beendet diese Hostumgebung den Chromium-Targetprozess. Responsive Regeln sind statisch geprüft; die Narrow-Viewport-Abnahme ist auf einem normalen Zielsystem zu wiederholen.
## AP20-Korrekturstand 1 – Zählerstartregression

```text
npm run test:metering
npm run test:ap20:meter-start-browser
```

Der Browsertest legt vor dem Start einen gespeicherten Datensatz mit rückläufigem Zählerstand in den Local Storage. Erwartet werden ein vollständiger Start ohne Fallback sowie ein zentraler Prüfpunkt `NKP-PLAU-005` mit Status „Zu prüfen“.

## AP20-Korrekturstand 3 – Asset-Aktualisierungsregression

```text
node tests/ap20-asset-refresh-regression.test.cjs
NODE_PATH=<Playwright-Installation>/node_modules node tools/check-ap20-meter-calculation-browser.cjs
```

Der Browserfall startet gezielt mit dem historisch falsch gespeicherten Wert `29774`, gibt anschließend `297,74` ein und prüft Live-Ergebnis `31,74`, Enter-Commit, Persistenz und Neustart. Zusätzlich werden Build-Parameter, Cachekennung, cachefreie Worker-Aktualisierung, einmaliger Reload und Schleifenschutz statisch geprüft.

## AP20-Korrekturstand 2 – Zählerberechnungsregression

Statische Zahlen- und Integrationsprüfung:

```bash
node tests/ap20-meter-calculation-regression.test.cjs
```

Serverloser Chromium-Test:

```bash
node tools/check-ap20-meter-calculation-browser.cjs
```

Geprüft werden Live-Verbrauch und Live-Summe vor dem Fokuswechsel, Enter-Commit, Dezimalkomma, Dezimalpunkt, Local-Storage-Speicherung und korrekte Wiederherstellung nach einem Neustart.

## V99.4.29 – AP22A UI-Bibliothek
AP22A führt den zentralen Namensraum `nk-ui-*`, kanonische `--nk-ui-*`-Design-Tokens, eine JavaScript-Metadaten-Schnittstelle sowie Katalog und Migrationsmatrix ein. Bestehende Fachseiten und Altvarianten bleiben unverändert; die kontrollierte Migration folgt in separaten AP22-Paketen.

# AP22E – Designvertrag und Referenzbibliothek

## Separate statische Prüfung

`node tests/ap22e-ui-design-contract.test.cjs`

Geprüft werden Dokumentvollständigkeit, zentrale Pflichtaussagen, Styleguide- und Navigationsschutz, isolierte Referenzbibliothek, deutsche Beispielinhalte, Komponenten-/Zustandsabdeckung, verbotene Produktdaten- und Persistenzzugriffe sowie SHA-256-Identität der geschützten Produktdateien.

## Separate Browserprüfung

`playwright test --project=ap22e-ui-reference --workers=1`

Geprüft werden Start ohne Konsolenfehler, visuelle Hauptgruppen, Dialogfokus und Fokusrückgabe, Klappbox-Tastaturbedienung, Desktop-/Mittel-/Schmalansicht, geringe Fensterhöhe, fehlende Gesamtseiten-Horizontalscrollleiste und unveränderter produktiver Anwendungsstart.

## Relevante bestehende Regression

Die aktuellen AP22D-Release- und Browserprüfungen bleiben maßgeblich. Historische Tests mit fest verdrahteten älteren Versionen, Build-IDs oder Navigationsständen werden nicht geändert. Solche Konflikte werden getrennt dokumentiert und sind kein Anlass, alte Regressionstestdateien umzuschreiben.

### AP22E-Releaseinhalt und geteilte Versionsrolle

Der produktive Laufzeitstand bleibt absichtlich `99.4.32-ap22d`, während Paket und Vertragsrelease `99.4.33` tragen. Der ältere generische Inhaltsprüfer `tools/check-release-contents.cjs` setzt Paket- und Produktversion zwingend gleich und ist deshalb für AP22E nicht das Release-Gate. Er bleibt unverändert. Die separate AP22E-Prüfung übernimmt Inhaltsausschlüsse, Vertragsversion, Produkt-Hashschutz und Referenzisolation.

# AP22F1A – Globales Schalenfundament

## Neue Releaseprüfungen

```text
npm run test:ap22f1a:static
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:ap22f1a:browser
npm run release:check
```

`test:ap22f1a:static` prüft genau eine Topbar und Kontextleiste, Kontextreihenfolge Objekt/Zeitraum/Status, vollständiges Modusverbot, 18 sichtbare Seitenschalen, 18 Seitenköpfe, 18 H1-Titel, zentrale Breiten und Abstände, Ausschluss der Definitionslisten-Kollision sowie zwölf Hashschutzbereiche.

`test:ap22f1a:browser` umfasst zehn Chromium-Fälle: sechs Ziel-Viewports (1440×1000, 1280×900, 1024×800, 900×620, 620×800, 390×844), die vollständige Seitenkopfmatrix, Bearbeiten/Nur ansehen/Archiv/kein Kontext, vollständigen Zeitraum, Schreibschutz-Notice, mobile Aktionsstapelung, sichtbaren Fokus und die aktualisierte Referenzbibliothek. Es entsteht keine horizontale Gesamtseiten-Scrollleiste.

## Bestandsergebnisse

Bestanden wurden Syntaxprüfung (55 JavaScript-Einheiten), sechs Fixtures, Zählerregression, Architekturprüfung AP6/AP7/AP8/AP9/AP13/AP21/AP21B2, AP21C, AP13 statisch und acht Browserfälle sowie AP21B2 statisch und drei Browserfälle.

Mehrere unveränderte historische Testdateien besitzen fest verdrahtete ältere Release-, Navigations-, Modus- oder UI-Bibliotheksstände. Sie werden gemäß Änderungs-Kontrollregel nicht umgeschrieben. Dokumentierte Konflikte sind insbesondere:

- AP11/AP14 erwarten eine vor AP21B2 gültige Navigation mit früheren Gruppen und 18 Zielen.
- AP19/AP20 erwarten das ausdrücklich aufgehobene Element `[data-global-billing-mode]` und Texte wie „Modus: Nur ansehen“.
- AP21A und ältere Smoke-Tests erwarten V99.4.24 sowie frühere Navigationsbezeichnungen.
- AP22A bis AP22D erwarten jeweils exakt UI-Designsystem 1.0.0 bis 1.3.0 statt des fortgeschriebenen Stands 1.4.0.

Diese Altassertionen sind keine Release-Gates für AP22F1A. Ihre Fach- und Schutzwirkung wird durch die unveränderten fachlichen Tests, die AP21B2-Navigationsregression, die AP13-Dokumentregression und die neuen AP22F1A-Schutztests abgedeckt. Bestehende Testdateien bleiben unverändert.
