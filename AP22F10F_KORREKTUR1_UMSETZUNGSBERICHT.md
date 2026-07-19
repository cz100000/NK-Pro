# AP22F10F Korrektur 1 – Vorperiodenübernahme Wasser

## Korrektur
- Eindeutige Vorjahresendstände werden bei der Datenaufbereitung als Anfangsstände übernommen.
- Suchreihenfolge: stabile Zähler-ID; Zählernummer + Wohnung + Zählerart; historisches wohnungsbezogenes Archivformat (`waterMeters.readings`) + Zählerart.
- Historische Kalt- und Warmwasserwerte werden getrennt übernommen.
- Manuelle Anfangsstände, Zählerwechsel, fehlende und mehrdeutige Zuordnungen werden nicht überschrieben.
- Die Übernahmemethode wird in `meta.individualValuesPriorTransfers` dokumentiert.

## Schutz
- Endstände der aktuellen Periode bleiben leer bzw. unverändert.
- Archivstände werden nur gelesen.
- Keine Änderung an Kosten-, Vorauszahlungs-, Brief- oder Drucklogik.
