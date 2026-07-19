# AP22F11B – Datenmigrationen

## Datenschema

Das Datenschema bleibt unverändert bei **Version 5**. Es wird keine globale Schema-Migration ausgeführt.

## Additives Prüfentscheidungsmodell

Bei der ersten bewussten Prüfaktion wird im aktuellen Abrechnungsstand additiv `abrechnungsPruefungen` angelegt:

- `version`
- `records`
- `history`
- Aktualisierungsmetadaten

Fehlt der Bereich in älteren Beständen, wird er als leer gelesen. Ursprungsdaten und Archive werden nicht verändert. Die neue Struktur wird im vollständigen JSON-Export mitgeführt.

## Signaturgebundene Entscheidungen

Bestehende Akzeptanzen werden nicht auf andere Datenstände migriert. Sie gelten ausschließlich für den gespeicherten Daten- und Berechnungsstand. Bei Abweichung werden sie ungültig und müssen erneut bestätigt werden.

## Messwertbestand

Es findet keine Bereinigung, Zusammenführung oder Löschung vorhandener Messwertversionen statt. Die Änderung in `js/meter-readings.js` verhindert nur das Anlegen weiterer technisch identischer Versionen.
