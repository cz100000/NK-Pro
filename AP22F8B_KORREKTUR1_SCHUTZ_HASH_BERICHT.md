# AP22F8B Korrektur 1 – Schutz-Hash-Bericht

## Ausgangsabgleich

- geprüfte Ausgangsbasis: `NK-Pro_V99_4_43_AP22F8B_Vorauszahlungen.zip`
- SHA-256: `78edb9c17e6e7a6195550ee9e4610d59c863d4506af126ceb60be76dc5d148d9`
- Ausgangsdateien: 537

## Ergebnis

- 502 Ausgangsdateien blieben vollständig bytegleich.
- Die neun bisherigen AP22F8B-Teilbereichsprüfungen bestehen weiterhin.
- Der CSS-Bestand vor dem AP22F8B-spezifischen Block blieb bytegleich.
- Änderungen betreffen ausschließlich die kontrolliert erweiterte Korrekturliste, aktualisierte Tests und Release-Dokumentation.
- Keine Datei der Ausgangsbasis fehlt.

Die maschinellen Nachweise liegen in `tests/ap22f8b-korrektur1-protected-areas.test.cjs` und `tests/ap22f8b-korrektur1-protected-hashes.json`.
