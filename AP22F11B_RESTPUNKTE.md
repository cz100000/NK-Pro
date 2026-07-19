# AP22F11B – Bekannte Restpunkte

## Vorbestehende Architekturtestschuld

`tests/ap6-modularization.test.cjs` beanstandet direkte Speicherzugriffe in `app-state-persistence.js`, `persistence.js` und `ui-preferences.js`. Derselbe Befund tritt unverändert in der V99.4.60-Ausgangsbasis auf. AP22F11B führt keinen neuen direkten Speicherzugriff ein.

## Versionsgebundene Altprüfungen

Einzelne ältere AP22F10G-Korrekturtests erwarten fest V99.4.60 und scheitern deshalb bei der korrekten Versionsfortschreibung auf V99.4.61. Die AP22F11B-spezifischen Statik- und Browsertests sowie die geeigneten Zähler- und Architekturregressionen wurden separat ausgeführt.

## Keine fachlichen Restpunkte

Für die in AP22F11B geforderte Ergebnis-Seite, Differenzprüfung, Persistenz, Ungültigkeitslogik, Datenerhaltung und Browserdarstellung sind keine bekannten offenen fachlichen Punkte verblieben.
