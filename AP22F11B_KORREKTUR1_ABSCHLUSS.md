# AP22F11B Korrektur 1 – Abschluss

## Release

- Version: `V99.4.62`
- Bezeichnung: `AP22F11B Korrektur 1 – Ergebnis der Abrechnung`
- Technische Basis: `V99.4.61 AP22F11B`
- Datenschema: unverändert `5`

## Umgesetztes Ergebnis

Die freigegebenen Korrekturen der Seite **„Ergebnis der Abrechnung“** sind vollständig umgesetzt:

- responsiver Such- und Statusfilter in „1. Ergebnis je Mietverhältnis“ ohne Überlagerung,
- rechtsbündige Betrags- und Zahlenwerte einschließlich Tabellenköpfen und Summen,
- Zusammenführung der bisherigen Bereiche „Vom Vermieter zu tragende Kosten“ und „Differenzen und Prüfungen“ in **„2. Kostenkontrolle und Prüfungen“**,
- logische Gruppen für offene, bestätigte, akzeptierte, erledigte und ungültige Prüfungen,
- Abschlussbereich **„Vom Vermieter nach Prüfung tatsächlich zu tragen“** mit transparenter Aufschlüsselung,
- offene oder ungültige Prüfungen bleiben aus der bestätigten Vermietersumme ausgeschlossen,
- Prüfentscheidungsdetails ausschließlich im Dialog statt als Feld unter der Tabelle,
- erweiterter Detaildialog mit Berechnungs-, Kontroll-, Status-, Begründungs- und Nachweisdaten,
- der vollständige Bereich **„3. Kostenkontrolle – Abgleich Gesamt“** bleibt erhalten,
- Abrechnungsstatus und nächste Schritte sind als Abschnitt 4 nachgeordnet.

## Abschlussstatus

Die statischen Prüfungen, die Korrektur-Browserprüfung, die vollständige AP22F11B-Browserprüfung mit 14 Prüfgruppen, die Zählerregression und ausgewählte Architekturregressionen wurden bestanden. Es wurden keine Browser-Laufzeitfehler festgestellt.

Der Echtdatenbestand wurde mit `V99.4.62` erneut exportiert. Wohnungen, Mietverhältnisse, Kostenarten-Kernwerte, Vorauszahlungen, Wasserstände, manuelle/externe Umlagewerte und Jahresarchive stimmen mit dem verbindlichen Eingangsbestand überein.
