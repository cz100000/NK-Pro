# AP22F12A/B – Fachlicher Umsetzungsbericht

## 1. Neue Analyseseite

Unter „Analyse“ wurde die Seite „Kosten- und Umlagenabgleich“ ergänzt. Sie verwendet die bestehende NK-Pro-Shell und zeigt:

- Einnahmen,
- Ausgaben/Kosten,
- Vergleich,
- Erklärung der Differenz,
- Kontrolldifferenz,
- fachlichen Status,
- Bearbeitungs- und Exportaktionen.

## 2. Einnahmen

Erfasst und ausgewertet werden tatsächliche:

- Nebenkostenvorauszahlungen,
- Nachzahlungen,
- Erstattungen,
- sonstige Korrekturen.

Die Erfassung erzwingt getrennte Zahlungs- und Abrechnungsjahre. Bestehende Soll-Vorauszahlungen werden nicht stillschweigend als Einnahmen verwendet. Fehlen tatsächliche Zahlungsdaten, weist die Seite ausdrücklich darauf hin.

## 3. Kosten

Kosten werden aus den vorhandenen Kostenarten und der bestehenden Abrechnungsberechnung übernommen. Je Kostenart können tatsächlicher Gesamtbetrag, Abrechnungsbetrag, analyserelevanter Betrag, Kategorie, Herkunft und Nachweisstatus dokumentiert werden.

## 4. Erklärung der Differenz

Die Seite führt alle geforderten Erklärungskategorien. Privat-, Leerstands- und eindeutige Eigentümeranteile werden aus der vorhandenen Umlagelogik abgeleitet. Weitere Zuordnungen können mit Jahr, Kostenart, Wohnung/Mietverhältnis, Schlüssel, Begründung, Nachweis, Bearbeiter und Prüfstatus erfasst werden.

Ein rechnerischer Restbetrag wird nicht automatisch umgebucht. Die Aktion „Rest als offene Differenz übernehmen“ ist ausdrücklich, sichtbar und erzeugt eine ungeprüfte offene Zuordnung.

## 5. Kontrollrechnung und Status

Kontrolldifferenz und fachlicher Status sind getrennt. Damit ist insbesondere der zulässige Zustand umgesetzt:

- Kontrolldifferenz: 0,00 Euro
- Status: Offene Differenz vorhanden

Eine negative fachlich korrekte Gegenposition wird nicht automatisch als Fehler rot markiert.

## 6. Prüfentscheidungen

Zuordnungen können als geprüft markiert und wieder zurückgenommen werden. Die Entscheidung wird im vorhandenen NK-Pro-Prüfentscheidungsregister gespeichert. Eine zweite isolierte Logik wurde nicht eingeführt.

## 7. Prüfen und abschließen

Die bestehende Seite zeigt nun einen kompakten Status mit:

- Kontrolldifferenz,
- offener Differenz,
- Zahl offener Prüfentscheidungen,
- direkter Aktion zur Analyseseite.

Die neue zentrale Regel ist informativ/prüfend und blockiert den Abschluss der Betriebskostenabrechnung nicht pauschal.

## 8. Detailansicht je Kostenart

Die Kostenartentabelle weist Gesamtkosten, analyserelevanten Betrag, Mieter-, Privat-, Leerstands-, Eigentümer- und offenen Anteil, Schlüssel, Herkunft, Nachweis und Status aus. Über den Dialog können analyserelevante Werte dokumentiert beziehungsweise korrigiert werden.

## 9. Responsive Umsetzung

- Desktop: drei Oberbereiche nebeneinander; Erklärung und Ergebnisbereich im Hauptgitter.
- mittlere Breite: flexible Umordnung der Oberbereiche und Statusfläche.
- schmale Ansicht: vertikale Stapelung; Tabellen scrollen ausschließlich intern horizontal; Hauptaktionen bleiben erreichbar.

## 10. Keine Produktbeispieldaten

Weder Mock-up-Werte noch Excel-Werte wurden als Standardwerte übernommen. Leere oder ältere Datenbestände zeigen ausschließlich aus dem jeweiligen Bestand abgeleitete Werte beziehungsweise neutrale Leerzustände.
