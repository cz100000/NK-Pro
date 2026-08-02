# NK-Pro V99.4.68 – Restpunkteliste

## Produktive Restpunkte

Keine bekannten produktiven Restpunkte aus dem Umsetzungsauftrag.

## Umgebungsbedingter Testhinweis

Die schlanke Arbeitsbasis enthält bewusst kein `node_modules`. Daher kann der im historischen `npm test` referenzierte Node-Playwright-Lauf ohne lokale Installation nicht starten. Die konfigurierte Paketquelle lieferte das Paket in dieser Umgebung nicht. Der Browser- und Echtdatenlauf wurde ersatzweise mit vorhandenem Chromium und Python-Playwright vollständig bestanden.

## Bestehende fachliche Hinweise im Echtdatenbestand

Die Validierung meldet weiterhin bereits vorhandene Zählerhinweise zu zeitanteilig geschätzten Wechseln beziehungsweise fehlenden Nutzerzuordnungen einzelner Leerstandsperioden. Sie sind nicht durch V99.4.68 entstanden, werden als Warnungen ausgewiesen und verhindern die fachliche Gültigkeit des geprüften Datenstands nicht.
