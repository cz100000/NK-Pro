# AP22F12A/B – Exportfunktionen

## 1. Finanzamtübersicht – Excel

Die Funktion erzeugt lokal eine SpreadsheetML-XML-Arbeitsmappe, die mit Excel 2019 geöffnet und bearbeitet werden kann. Sie enthält keine Makros, externen Verknüpfungen oder produktfremden Beispielwerte.

Enthaltene Bereiche:

1. Einnahmen je gewähltem Jahr und Summe
2. Kosten je gewähltem Jahr und Summe
3. Vergleich
4. Erklärung der Differenz
5. Kontrolldifferenz
6. fachlicher Status und Hinweise auf offene Differenzen

Eurobeträge werden numerisch mit Währungsformat ausgegeben; Texte und Nachweise bleiben bearbeitbar.

## 2. Finanzamtübersicht – Druck/PDF

Die Druckfunktion öffnet eine lokale A4-Druckansicht mit:

- Titel, Objekt-/Zeitraumbezug,
- Einnahmen, Kosten und Vergleich,
- Erklärungstabelle,
- Kontrolldifferenz und fachlichem Status,
- rechtsbündigen Eurobeträgen,
- druckgerechten Seitenumbrüchen.

Die vorhandene Browser-Druckfunktion ermöglicht „Als PDF speichern“ ohne Online-Dienst.

## 3. Internes Prüfprotokoll

Das lokale HTML-Prüfprotokoll enthält zusätzlich:

- Zahlungsdatensätze mit Zahlungs- und Abrechnungsjahr,
- Kostenartenaufschlüsselung,
- Mieter-, Privat-, Leerstands-, Eigentümer- und offene Anteile,
- verwendete Umlageschlüssel,
- Herkunft und Nachweisstatus,
- manuelle Zuordnungen,
- Begründung, Bearbeiter und Prüfstatus.

## 4. Datenbasis

Alle Exporte verwenden dasselbe berechnete AP22F12-Modell wie die sichtbare Seite. Dadurch werden keine gesonderten Exportformeln oder fest programmierten Beispieldaten geführt.
