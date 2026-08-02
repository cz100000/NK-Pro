# AP22F12A/B – Fachliches Zielmodell und Datenfluss

## 1. Ziel

Der Kosten- und Umlagenabgleich ist eine allgemeine Analysefunktion. Er stellt tatsächliche Umlageeinnahmen und analyserelevante Kosten gegenüber, ordnet die daraus entstehende Differenz Kategorien zu und trennt die rechnerische Vollständigkeit vom fachlichen Prüfstatus.

## 2. Zeitbezüge

Jeder tatsächliche Zahlungsdatensatz führt getrennt:

- Zahlungsart,
- Betrag,
- Zahlungsdatum,
- Zahlungsjahr,
- Abrechnungsjahr,
- Mietverhältnis,
- Wohnung,
- Herkunft,
- Bearbeitungsstatus.

Die Mehrjahresansicht gruppiert Einnahmen nach Zahlungsjahr. Das zugehörige Abrechnungsjahr bleibt im Detaildatensatz erhalten und wird nicht aus dem Zahlungsjahr abgeleitet.

## 3. Einnahmenfluss

1. Tatsächliche Zahlungsflüsse werden ausdrücklich erfasst oder aus fachlich geeigneten Importen übernommen.
2. Nebenkostenvorauszahlung und Nachzahlung wirken positiv.
3. Ausgezahlte Erstattung wird unabhängig von der Eingaberichtung normiert negativ gespeichert.
4. Weitere Korrekturen können als positive oder negative Gegenposition erfasst werden.
5. Das bestehende Vorauszahlungssoll wird nicht automatisch als tatsächliche Einnahme behandelt.

Formel je Jahr:

`Umlageeinnahmen = Vorauszahlungen + Nachzahlungen + Erstattungen + Korrekturen`

Erstattungen enthalten bereits ein negatives Vorzeichen.

## 4. Kostenfluss

1. Ausgangspunkt sind aktive, in NK berücksichtigte Kostenarten.
2. Die bestehende Abrechnungsberechnung liefert Mieter-, Privat- und Leerstandsanteile je Kostenart.
3. Optional können tatsächlicher Gesamtbetrag, in der Abrechnung berücksichtigter Betrag und analyserelevanter Betrag dokumentiert werden.
4. Ohne Übersteuerung ist der vorhandene Gesamtbetrag analyserelevant.
5. Herkunft, Nachweisstatus, Kategorie und Begründung bleiben nachvollziehbar.

## 5. Differenz und Erklärung

`Zu erklärende Differenz = analyserelevante Kosten − tatsächliche Umlageeinnahmen`

Erklärungskategorien:

1. Privatanteil
2. Leerstandsanteil
3. Nicht auf Mieter umgelegte Kosten
4. Zeitliche Abgrenzungen
5. Nicht vereinnahmte Forderungen
6. Akzeptierte sonstige Differenzen
7. Offene Differenz

Automatisch aus der bestehenden Abrechnungsberechnung abgeleitet werden Privat-, Leerstands- und eindeutig als Eigentümeranteil behandelte nicht umgelegte Kosten. Ergänzende oder korrigierende Zuordnungen werden als nachvollziehbare Datensätze erfasst. Es gibt keine automatische Ausgleichsbuchung.

## 6. Kontrollrechnung

`Kontrolldifferenz = zu erklärende Differenz − Summe aller Erklärungskategorien`

- Betrag innerhalb 0,01 Euro: rechnerisch vollständig zugeordnet.
- Betrag außerhalb 0,01 Euro: rechnerisch nicht vollständig zugeordnet.
- Eine offene Differenz kann die Kontrolldifferenz auf 0,00 Euro bringen, bleibt aber fachlich als Warnstatus bestehen.

## 7. Prüfstatus

Die Statusfolge ist getrennt von der Kontrollrechnung:

- Nicht begonnen
- In Bearbeitung
- Rechnerisch vollständig
- Offene Differenz vorhanden
- Prüfentscheidung erforderlich
- Vollständig geprüft
- Für Abschluss freigegeben

Änderungen an Zahlungen, Kostenübersteuerungen oder Zuordnungen setzen eine vorhandene Prüfung/Freigabe wieder auf Entwurf.

## 8. Prüfentscheidungen

Eine als geprüft markierte Differenzzuordnung wird im bestehenden Container `abrechnungsPruefungen.records` gespeichert. Der zusätzliche Scope `cost-reconciliation` trennt diese Datensätze von bisherigen Abrechnungsdifferenzentscheidungen, ohne eine zweite Entscheidungsarchitektur einzuführen. Zurücknehmen oder Löschen der Zuordnung entfernt die zugehörige scoped Prüfentscheidung kontrolliert.

## 9. Datenflussübersicht

`Arbeitsstand/Jahresarchive` → `NKProCostReconciliation.model()` → `Kosten- und Umlagenabgleich UI`  
`Dialogeingabe` → `UI-Aktion` → `NKProCostReconciliation.save…()` → `NKProStateAccess.transact()` → Persistenz/Rendering  
`geprüfte Zuordnung` → bestehendes `abrechnungsPruefungen` → zentrale Qualitätsseite und internes Prüfprotokoll  
`Modell` → SpreadsheetML-Excel / Druckansicht / internes Prüfprotokoll
