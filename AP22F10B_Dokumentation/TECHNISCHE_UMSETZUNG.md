# AP22F10B – Technische Umsetzung

## Release

- Produkt: NK-Pro
- Version: **V99.4.45**
- Arbeitspaket: **AP22F10B – Technische Migration „Individuelle Werte“**
- Datum: **19.07.2026**
- Datenschema: **5, unverändert**
- technische Ausgangsbasis: `NK-Pro_V99_4_44_AP22F9B_Gesamtkosten_Korrektur1.zip`
- verbindliche Planung: `AP22F10A_Planungsartefakte_Korrektur1.zip`

## Umgesetztes Zielbild

Die Seite `Nebenkosten abrechnen → Individuelle Werte` wurde innerhalb der freigegebenen Seitengrenze vollständig auf das Zielbild der NK-Pro UI Referenz 1.0 migriert.

Umgesetzt sind:

- exakt vier fachlich abgeleitete Kennzahlenkacheln;
- freistehende Linien-SVG-Symbole;
- rotes NK-Pro-Flammensymbol für Heiz- und Warmwasserkosten;
- neutrale Tabellenköpfe und Summenzeilen ohne unechte Sortierung;
- getrennte Arbeitsbereiche für Wasser sowie externe Einzelkosten;
- getrennte Kalt- und Warmwasserzähler je Abrechnungsfall;
- neutrale Fallsubtotale und Gesamtsummen;
- Abrechnungsfälle für Mieter, Privatanteil und Leerstand;
- Wasserabgleich ausschließlich in `m³` gegen `K002.gesamtverbrauch`;
- Kostenabgleich externer Kosten in Euro gegen den jeweiligen `gesamtbetrag`;
- Bearbeiten- und Nur-Ansehen-Modus mit bestehender großer Schreibschutzhinweisbox;
- 4-spaltiges KPI-Raster auf Desktop und 2×2-Raster bei 620 px und 390 px;
- ausschließlich interner horizontaler Tabellenscroll und vollständiger rechter Tabellenabschluss;
- sichtbarer Tastaturfokus und Dialogfokusführung.

## Fachentscheidungen F1 bis F6

### F1 – Wasserstruktur

`waterMeterRows()` liefert eine Tabellenzeile je physischem Wasserzähler. Kalt- und Warmwasser werden nach stabilem Abrechnungsfall gruppiert. Je Fall wird ein neutrales Subtotal gebildet; die Gesamtsumme umfasst Mieter, Privatanteil und Leerstand.

### F2 – Führende Wasserquelle

Die operative Erfassung schreibt in die kanonischen Zählerdaten unter `zaehlerDaten.messwerte` und `zaehlerDaten.messperioden`. Vorhandene Legacy-Bindungen zu `waterMeters.readings` bleiben über kompatible Adapter synchronisiert. Für Leerstand oder andere Fälle ohne Legacy-Zeile werden keine künstlichen Mieterdatensätze angelegt.

### F3 – Externe individuelle Werte

`umlageInputs.<Kostenart>.caseValues` bildet additive, stabile Fallwerte ab. Zulässige Felder sind Betrag, Verbrauch, Anbieter, Erfassungsdatum und Notiz. Mieter- und Privatwerte werden kompatibel in vorhandene Legacy-Felder projiziert; Leerstand bleibt als eigener fachlicher Fall erhalten.

### F4 – Toleranzen

- Wasserabgleich: `0,01 m³`
- Kostenabgleich: `0,01 €`

Die Toleranzen werden in den zentralen Berechnungs- und Qualitätswegen konsistent verwendet.

### F5 – Vorjahresübernahme

Die Vorjahresübernahme ist zähler-ID-basiert und erfolgt ausschließlich über einen bestätigten Dialog. Eindeutige Kandidaten werden angeboten; fehlende, mehrdeutige oder geänderte Zuordnungen, Zählerwechsel und bereits übernommene Werte werden blockiert oder gesondert gekennzeichnet. Bestätigte Übernahmen werden unter `state.meta.individualValuesPriorTransfers` nachvollziehbar dokumentiert. Eine stille Jahresübernahme wurde entfernt.

### F6 – Wasserprüfung

Der neue Mengenabgleich ist als eigene Qualitätsregel `NKP-PLAU-012` umgesetzt. Die bestehende Hauszählerprüfung `NKP-PLAU-006` bleibt unverändert und fachlich getrennt.

## Kostenartenfilter

Auf der Seite erscheinen nur Kostenarten mit explizitem individuellem Modus:

- `Direkter Eurobetrag`
- `Externe Einzelabrechnung`
- `Verbrauchsmenge`

Der vorherige allgemeine Modus-Fallback wurde entfernt. Automatische Umlageschlüssel wie Müllbeseitigung erscheinen dadurch nicht mehr als individuelle Kostenart.

## Daten- und Schreibwege

- Das UI-Modul führt keine Direktzugriffe auf `localStorage`, `sessionStorage`, IndexedDB oder Persistenzmodule aus.
- Schreibvorgänge laufen über `NKProApplicationActions.execute` und die zentrale Workflow-Schicht.
- Bestehende öffentliche Signaturen und Legacy-Lesepfade bleiben soweit möglich erhalten.
- Migration, Backup, Restore, Rollback, Archivierung, Snapshot, Navigation, Brief und Druck wurden nicht geändert.
