# AP22F10G-B – Datenmigrationen und Kompatibilität

## Schema

- Datenschema bleibt **Version 5**.
- Es ist keine zwingende globale Datenmigration erforderlich.
- Archiv- und Snapshotgrenzen bleiben unverändert.

## Neue beziehungsweise erweiterte Datenverwendung

### Zählerzuordnung

Verbrauchsbereiche setzen eine eindeutige `kostenId` am Zähler voraus. Diese muss der aktiven Verbrauchskostenart entsprechen. Die reale Testreferenz erfüllt dies für Kalt- und Warmwasserzähler.

Datenbestände ohne passende `kostenId` werden nicht über Kostenartnamen oder K002-Fallbacks erraten. Solche Zähler müssen fachlich in den Stammdaten zugeordnet werden.

### Manuelle Einzelwerte

Fallbezogene Werte werden in der vorhandenen Struktur `umlageInputs[costId].caseValues` geführt. Vorhandene ältere `values`-Arrays bleiben lesbar; neue Eingaben verwenden stabile Abrechnungsfall-Schlüssel.

### Vorjahresübernahme

Neue Audit-Einträge in `meta.individualValuesPriorTransfers` können zusätzlich `costId` enthalten. Das Feld ist optional. Bestehende Einträge ohne `costId` bleiben kompatibel und werden bei der Dublettenprüfung weiterhin erkannt.

## Automatische Datenänderung beim Laden

AP22F10G-B führt keine neue Startmigration und keine automatische Übernahme von Vorjahreskosten aus. Vorjahresendstände werden erst nach Benutzerbestätigung als Anfangsstände übernommen.

## Empfehlung für Fremddatenbestände

Vor Einsatz mit weiteren Objekten ist zu prüfen:

1. aktive Verbrauchskostenart besitzt `umlageschluessel = Verbrauch`,
2. jeder abrechnungsrelevante Zähler besitzt die passende `kostenId`,
3. Zähler besitzt eine stabile ID und eine Einheitzuordnung,
4. manuelle Kostenarten besitzen einen eindeutig manuellen Schlüssel beziehungsweise eine manuelle Berechnungsart.
