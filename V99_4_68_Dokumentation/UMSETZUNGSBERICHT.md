# NK-Pro V99.4.68 – Umsetzungsbericht

**Abschlussstand:** 2026-08-02 18:30:00 +02:00  
**Technische Ausgangsbasis:** NK-Pro V99.4.67 – schlanke Arbeitsbasis  
**Datenbasis:** vollständiger Datenbestand 2023 V99.4.67  
**Zielversion:** V99.4.68 / Build `99.4.68-private-participants`

## 1. Ergebnis

Die systemweite Sonderbehandlung von Privatanteil, Eigenanteil und Eigentümer/Privat wurde aufgehoben. Die Nutzungsart hat keine finanzielle Ausschlusswirkung mehr. Jeder fachlich und zeitlich relevante Datensatz wird über eine gemeinsame Teilnehmerentscheidung, eine gemeinsame Ergebnisliste und dieselben Folgeprozesse verarbeitet.

## 2. Zentrale Zielarchitektur

- `isSettlementParticipant(record)` entscheidet nur anhand vollständiger Teilnehmeridentität und zeitlicher Relevanz.
- `isPrivateUse(record)` erkennt ausschließlich die Nutzungsart für Kennzeichnung und Auswertung.
- `isBillableTenant(record)` ist ein kompatibler Alias auf `isSettlementParticipant(record)`.
- `tenantResults` enthält alle Abrechnungsteilnehmer.
- `privateResults` ist ausschließlich `tenantResults.filter(isPrivateUse)` und kein separater Finanzpfad.
- `privateShare` ist nur eine informative Teilmenge des regulären Teilnehmeranteils.

## 3. Umgestellte Funktionsbereiche

1. Berechnung, Kostenverteilung und regulärer Saldo
2. Vorauszahlungen, NK-Korrekturen, Kaltmietkorrekturen und Einnahmen
3. Individuelle Werte, Wasser, Heiz-/Warmwasserkosten und manuelle Zuordnungen
4. Ergebnis der Abrechnung und Kosten-/Umlagenabgleich
5. Pflichtprüfungen, Abschlussbereitschaft und Diagnostik
6. Einzelbrief, Sammeldruck, Druckvorschau und PDF
7. CSV-, JSON- und Excel-kompatible Ausgaben
8. Snapshot, Archivierung, kontrollierte Wiederöffnung und Jahreswechsel
9. Stammdatenabgleich, Rollennormalisierung, Backup und Restore
10. Kennzahlen, Zähler und Fortschrittsanzeigen

## 4. Entfernte Fehlbehandlungen

- kein Ausschluss wegen `privat`, `eigent`, `Eigenanteil` oder Eigennutzung;
- keine automatische Kategorie „Vermieter trägt – Privatanteil“;
- keine separate finanzielle Exportzeile mit Kostenanteil als falschem Saldo;
- keine rollenbedingte Schreibsperre bei Vorauszahlungen und Korrekturen;
- kein Überspringen bei Briefen, Archivkorrekturen oder Jahreswechsel;
- keine produktive M000-/Zimmermann-Sondererzeugung;
- keine Darstellung des generischen Begriffs „Privatanteil“ anstelle des Personennamens.

## 5. Zusätzliche Dokumentkorrektur

Im Abrechnungsbrief wurde eine bestehende falsche Einheitsbezeichnung korrigiert. Statt `Wohnung <Personenname>` wird die tatsächliche Wohnung beziehungsweise deren Bezeichnung ausgegeben. Für M000 lautet die Einheit im geprüften Brief `Wohnung UG`.

## 6. Echtdatenresultat M000

- Teilnehmer: Erik Zimmermann (`M000`)
- Wohnung: `W000.UG`
- Nutzungsart: Eigentümer/Privat
- Einzug aktiv: `01.01.2010`
- Kostenanteil: 3523.53 EUR
- Vorauszahlungen: 0.00 EUR
- Saldo/Nachzahlung: 3523.53 EUR
- Heiz-/Warmwasserkosten: 2624.58 EUR
- Wasser: 598.35 EUR
- Abfall: 300.60 EUR

## 7. Generischer Gegenbeweis gegen Hardcoding

Der separate Testfall `P900` / „Testperson Eigenanteil“ / Rolle `Eigenanteil` wurde aus demselben fachlichen Datenzusammenhang mit anderer ID und anderem Namen geprüft. Er erhielt einen regulären Kostenanteil von 3523.53 EUR, 240,00 EUR Vorauszahlungen, 25,00 EUR NK-Korrektur, 10,00 EUR Kaltmietkorrektur und einen regulären Saldo von 3258.53 EUR. Brief, Sammeldruck, Vorauszahlungsanpassung, CSV, Snapshot, Wiederöffnung, Jahreswechsel und JSON-Roundtrip sind bestanden.

## 8. Schutzbereiche

- Datenschema 5 unverändert
- Datenebenenvertrag 1 unverändert
- stabile IDs unverändert
- finalisierte Archive unverändert
- keine Demodaten in den migrierten Echtdaten eingeführt
- Zählerreparatur V99.4.67 und vorhandene Wasserwerte erhalten
