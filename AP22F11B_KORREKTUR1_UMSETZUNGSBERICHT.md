# AP22F11B Korrektur 1 – Umsetzungsbericht

## 1. Mieterergebnisse

Der Such- und Filterbereich wurde responsiv gehärtet. Auf breiten Ansichten stehen Suche und Statusfilter nebeneinander. Auf schmalen Ansichten werden beide Bedienelemente vollständig und ohne Überlagerung untereinander dargestellt.

Alle Geldbeträge und sonstigen numerischen Kontrollwerte werden in den Ergebnistabellen rechtsbündig mit tabellarischen Ziffern ausgegeben. Dies gilt auch für Spaltenüberschriften und Summenzeilen.

## 2. Zusammengeführte Kostenkontrolle

Die zuvor getrennten Tabellen für Vermieteranteile und Differenzen wurden durch eine gemeinsame Tabelle **„Kostenkontrolle und Prüfungen“** ersetzt. Die Tabelle bildet fachlich getrennte Gruppen innerhalb einer gemeinsamen Kontrollsicht:

- Noch zu prüfen
- Geprüft und dem Vermieter zugeordnet
- Fachlich akzeptiert
- Erledigt durch Korrektur
- Ungültig – erneut prüfen
- Verlauf, sofern eingeblendet

Reguläre Privat-, Leerstands- und nicht umlagefähige Anteile bleiben als Vermieterpositionen erkennbar. Differenzen behalten ihren eigenen Status, ihre Ursache, Kontrollwerte und Aktionen. Offene Differenzen werden nicht als bestätigter Vermieteranteil behandelt.

## 3. Bestätigter Vermieteranteil

Unter der gemeinsamen Tabelle wurde der Abschlussbereich **„Vom Vermieter nach Prüfung tatsächlich zu tragen“** ergänzt. Er zeigt:

- Privatanteil
- Leerstand
- nicht umlagefähige Kosten
- sonstige bestätigte Vermieteranteile
- bestätigte Gesamtsumme

Nur gültige und fachlich bestätigte Positionen fließen in die Summe ein. Bei offenen oder ungültigen Prüfungen wird der Betrag als vorläufig gekennzeichnet; nach vollständiger Prüfung als endgültig.

## 4. Prüfentscheidungsdialog

Das bisherige Inline-Detailfeld unter der Differenztabelle wurde entfernt. Prüfentscheidungen werden ausschließlich im Dialog angezeigt und bearbeitet. Der Dialog enthält je nach Status:

- Prüfbereich und Kostenart
- Ursache und Datenquelle
- berechneten Wert
- Kontrollwert
- Differenz und Einheit
- aktuellen Status
- Behandlung
- Begründung
- Bearbeiter
- Bestätigungs- und Ungültigkeitszeitpunkt
- verwendete App-Version
- stabile Differenzkennung

Der Dialog besitzt eine eigene Schließen-Aktion und bleibt tastaturbedienbar.

## 5. Gesamtabgleich

Der bestehende Abschnitt **„Kostenkontrolle – Abgleich Gesamt“** wurde unverändert als eigener Kontrollblock erhalten und auf Abschnitt 3 umnummeriert. Die Gleichung zeigt weiterhin Gesamtkosten, Mieteranteil, Vermieteranteil, akzeptierte Differenzen, offene Beträge und Abgleichsaldo getrennt.

## 6. Versionierung und Cache

Die App-, Manifest-, Projekt-, Paket- und PWA-Version wurde auf `V99.4.62` angehoben. Die geänderte Ergebnisdarstellung wird mit einer neuen Build-ID und versionierten Asset-URLs ausgeliefert, damit insbesondere bei statischem GitHub-Hosting kein veraltetes JavaScript aus dem Browser- oder Service-Worker-Cache verwendet wird.
