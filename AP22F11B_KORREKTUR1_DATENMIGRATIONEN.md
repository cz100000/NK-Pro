# AP22F11B Korrektur 1 – Datenmigrationen

## Datenschema

Keine Änderung. Das Datenschema bleibt bei Version `5`.

## Fachdatenspeicherung

Die Korrektur führt keine neue Datenmigration ein. Bestehende Prüfentscheidungen und deren Signatur-/Ungültigkeitsmodell aus V99.4.61 werden unverändert weiterverwendet.

## Darstellung

Die Zusammenführung der Tabellen ist ausschließlich eine neue Projektion vorhandener Berechnungs- und Prüfmodelle. Ursprungsdaten, Kostenwerte, Wasserstände, Vorauszahlungen, Archive und Prüfentscheidungen werden dadurch nicht umgeschrieben.

## Import und Export

Der verbindliche V99.4.58-Gesamtbestand wurde in V99.4.62 importiert und anschließend erneut vollständig exportiert. Die App ergänzt lediglich die regulären Export- und Versionsmetadaten des neuen Releases.
