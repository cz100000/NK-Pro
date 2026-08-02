# Technischer Änderungsbericht

## Ursache

Die Zählermigration von V99.4.66 behandelte leere Mieterzeilen mit IDs als echte Abrechnungsdatensätze. Dadurch entstanden 30 aktive, abrechnungsrelevante Wasserzähler ohne Wohnung und ohne Messwerte. Gleichzeitig waren historische Werte für zwei inaktive Dachgeschosswohnungen nur in `waterMeterHistory`, nicht aber im operativen Zählermodell vorhanden. Die Snapshot-Prüfung verlangte deshalb für zahlreiche Zähler eine Messperiode.

## Änderungen

### `js/meter-master.js`

- Echte Nutzerzeilen werden anhand fachlicher Inhalte und nicht allein anhand einer ID erkannt.
- Verwaiste Legacy-Platzhalterzähler werden identifiziert und entfernt.
- Für alle realen Wohnungen bleiben zwei Wasserzähler erhalten.
- Hausanschlusszähler werden als Kontrollzähler mit `abrechnungsrelevant=false` modelliert.

### `js/meter-readings.js`

- Fehlende Anfangs- und Endstände werden aus `waterMeterHistory.units` für das konkrete Abrechnungsjahr übernommen.
- Bereits vorhandene operative Werte haben Vorrang; es entstehen keine Dubletten.
- Hausanschlusswerte werden als historische Kontrollmesswerte übernommen.

### `js/meter-periods.js`

- Zuordnungen werden nur für Zähler erzeugt, deren Lebensdauer den Abrechnungszeitraum überlappt.

### `js/meter-validation.js`

- Die Pflicht zur Messperiode gilt nur für im Abrechnungszeitraum aktive und für eine aktive Verbrauchskostenart relevante Zähler.
- Snapshot-Projektionen enthalten nur zeitlich einschlägige Zähler.
- Die Datenreparatur wird nachvollziehbar als Standardmigration protokolliert.

### `js/billing-snapshot.js`

- Zählerauswahl und Ausschlussliste werden zeitbezogen aufgebaut.
- Wiederholte Validierungsfehler werden nach Fehlercode und Meldung gruppiert und mit den betroffenen IDs ausgegeben.

## PWA- und Versionsstand

- Anwendungsversion: `V99.4.67`
- Build-ID: `99.4.67-meter-archive-k1`
- Cache: `nk-pro-v99-4-67-meter-archive-k1`
- Datenschema: unverändert Version 5
