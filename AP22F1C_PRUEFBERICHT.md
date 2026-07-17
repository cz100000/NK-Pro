# AP22F1C – Prüfbericht

## Abnahmeergebnis

Die Korrektur ist technisch und browserseitig bestanden:

- AP22F1C-Statik und Schutz: bestanden,
- 15 vollständig geschützte Produktmodule: hashgleich,
- vier funktional geänderte Kernstellen: auf den dokumentierten Minimalpatch normalisiert hashgleich,
- Chromium AP22F1C: 6 von 6 bestanden,
- AP22F1B-Seitenkopfregression: 9 von 9 bestanden,
- AP21B2-Navigation Chromium: 3 von 3 bestanden,
- aktuelles `release:check`: bestanden,
- strikte Release-Inhaltsprüfung: bestanden,
- finale Release-ZIP frisch extrahiert: 334 Prüfsummen, 335 Dateien und 6 von 6 AP22F1C-Chromiumtests bestanden.

## Browserfälle AP22F1C

1. Geschlossener Prüfpunktdialog bei 1440×1000 unsichtbar.
2. Geschlossener Prüfpunktdialog bei 900×620 unsichtbar.
3. Geschlossener Prüfpunktdialog bei 390×844 unsichtbar.
4. Öffnen, Fokusfalle, Escape, Hintergrundschließen und Fokusrückgabe des nativen Prüfpunktdialogs.
5. Nicht-native zentrale Dialoglayer bleiben unverändert bedienbar; der geschützte Löschdialog bleibt gegen Escape gesperrt.
6. Sichtbare Navigationsversion entspricht `APP_VERSION` und wird durch die zentrale UI-Aktualisierung wiederhergestellt.

## Schutzprüfungen

Unverändert bestätigt wurden Navigation und Navigationsdefinition, globale Kontextleiste, Zeitraumsektion, Dialog-Markup, Abrechnungskontext, Schreiben/Dirty-State, Fachlogik, Prüfregeln, Berechnung, Persistenz, Migration, Backup/Restore, Archiv, Export, Dokumentdaten, Dokumentrenderer, Billing-Workflow und App-Orchestrierung. Die Service-Worker-Funktionslogik ist nach Normalisierung der freigegebenen Cache- und Buildkennungen hashgleich.

## Historische Tests

Die unveränderte AP22D-Browsertestdatei bricht weiterhin vor ihren Dialoginteraktionen an der historischen, fest verdrahteten Designsystemversion `1.3.0` ab, während der seit AP22F1A gültige Produktstand `1.4.0` liefert. Diese alte Assertion wurde nicht geändert. Die für AP22F1C betroffenen Dialoginteraktionen werden vollständig durch den neuen separaten Browsertest abgedeckt.

## Bekannte verbleibende Punkte

Innerhalb AP22F1C besteht kein offener Fehler. Weitere produktive UI-Migrationen bleiben einem gesondert geplanten und freigegebenen Arbeitspaket vorbehalten.
