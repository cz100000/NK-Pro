# AP22F9B – Testbericht

## Bestandstest vor Änderung

- ZIP-Integrität beider Pakete: bestanden.
- Schutz-Hashes der Planung: 17/17 bestanden.
- JavaScript-Syntax und Referenz-Fixtures: bestanden.
- Unveränderte Seite im Browser: 15 Spalten, drei geschlossene Klappbereiche und interner Tabellen-Scroll bestätigt.
- Historischer Gesamttest: Abbruch wie angekündigt in `tests/ap20-asset-refresh-regression.test.cjs` mit `Versionsparameter fehlt für ui-bindings.js.`

## AP22F9B-spezifische Tests

| Test | Ergebnis |
|---|---|
| `tests/ap22f9b-total-costs.test.cjs` | PASS |
| `tests/ap22f9b-protected-areas.test.cjs` | PASS – 13 Vollhashes + 5 Teilbereiche |
| `tests/ap22f9b-total-costs-browser.test.cjs` | PASS |
| JavaScript-Syntaxprüfung, 55 Einheiten | PASS |
| Referenz-Fixtures, 6 Fälle | PASS |
| Release-Inhaltsprüfung | PASS |

Der Browser-Harness prüft reale Bearbeitungs-, Speicher-/Neulade-, Such-, Dialog-, Fokus-, Vorauszahlungs-, Mietverhältnis-, Nur-Ansehen-, Leer-, Hinweis-, 620-px- und 390-px-Abläufe sowie die sieben geforderten Screenshots.

## Fach- und Regressionsprüfungen

Bestanden:

- AP22F8B Vorauszahlungen Browser;
- AP22F8B Korrektur 1 Browser;
- AP22F6B Abrechnungsübersicht und Korrektur 1 Browser;
- AP22F7B Mietverhältnisse Browser;
- AP22F7B Korrektur 1;
- AP22F7B Tabellenbreite: 57 Messungen;
- AP22F7B Tabellenrahmen: 57 Tabellen-/Viewport-Prüfungen;
- Zählerdomäne, Zählerstart- und Zählerberechnungsregression;
- AP6/AP8/AP9/AP13/AP21/AP21B2 Architekturprüfungen;
- AP21C individuelle Werte;
- Persistenz/Backup: 5/5 Browserfälle;
- Migration/Restore und Referenzfälle: 12/12 Browserfälle;
- Dokumentexport: 2/2 Browserfälle;
- AP13 Brieflayout: 8/8 Browserfälle.

## Reproduzierbare historische beziehungsweise veraltete Testannahmen

### Freigegebene Ausgangsabweichung

`tests/ap20-asset-refresh-regression.test.cjs` erwartet weiterhin einen historischen Versionsparameterzustand und bricht mit `Versionsparameter fehlt für ui-bindings.js.` ab. Der Fehler besteht identisch in der unveränderten Ausgangsbasis und wurde nicht durch Eingriffe in geschützte zentrale Dateien umgangen.

### AP20-Qualitätstest

Der statische AP20-Test erwartet eine alte Paketversion. Der Browser-Test besteht 3/5 Fällen und scheitert in zwei veralteten Annahmen:

- erwartet 42 Regeln, während Ausgangsbasis und Release bereits 43 Regeln besitzen;
- erwartet `[data-global-billing-mode]`, obwohl die Modusanzeige gemäß verbindlichem Projektstandard entfernt ist.

Der direkte Vergleich mit der unveränderten Ausgangsbasis ergibt exakt dieselben 3/5 und dieselben Fehler.

### Service-Worker-Test

`tests/service-worker.spec.js` ist auf den Titel „V99.4.24-App-Shell“ und alte Assetnamen fest verdrahtet. Der aktuelle Service Worker verwendet konsistent `99.4.44-ap22f9b` und die aktuelle App-Shell. Der historische Test ist für das Nachfolgerelease nicht aussagekräftig.

### AP19-Kontexttest

Ein historischer Browsertest erwartet ebenfalls die entfernte `[data-global-billing-mode]`-Anzeige. Die verbindliche Anforderung lautet dagegen: keine Modusanzeige in der Kontextleiste; Schreibschutz ausschließlich über die große Hinweisbox.

### Vorrelease-Schutztests AP22F8

Die statischen AP22F8-Schutztests enthalten erwartungsgemäß Vollhashes und Version `99.4.43`. Sie sind nach einer ausdrücklich freigegebenen Seiten- und Releasefortschreibung nicht als Nachfolgerelease-Test verwendbar. Die funktionalen AP22F8-Browserregressionen bestehen.

## Bewertung

Es wurde keine neue Abweichung gegenüber der Ausgangsbasis festgestellt. Alle AP22F9B-bezogenen Tests und die für das Nachfolgerelease geeigneten fachlichen Regressionen sind bestanden.
