# AP22F11B – Vergleich gegen die unveränderte V99.4.60-Ausgangsbasis

## Vergleichsgrundlage

Verglichen wurde die finale Arbeitsfassung bytegenau mit der frisch aus dem verbindlichen ZIP extrahierten technischen Basis unter `technical-base`.

## Ergebnis

- Dateien in V99.4.60: **692**
- Dateien in der AP22F11B-Fassung vor Manifesterzeugung: **718**
- unveränderte Dateien: **676**
- geänderte vorhandene Dateien: **16**
- neue Dateien: **26**
- entfernte Dateien: **0**

Die 16 geänderten Bestandsdateien beschränken sich auf die neue Ergebnis-Seite, das neue Prüfmodul und seine Integration, den minimalen Schutz gegen weitere Zähler-Messwertdubletten sowie die erforderlichen Release-/PWA-Metadaten.

## Geänderte Bestandsdateien

- `assets/app.css`
- `index.html`
- `js/app-runtime-config.js`
- `js/app.js`
- `js/billing-context.js`
- `js/meter-readings.js`
- `js/service-worker-register.js`
- `js/state-access.js`
- `js/ui-billing-allocation.js`
- `js/ui-bindings.js`
- `js/ui-page-controller.js`
- `manifest.webmanifest`
- `nk-pro-project.json`
- `package-lock.json`
- `package.json`
- `service-worker.js`

## Neue produktive Datei

- `js/billing-review.js`

## Nicht verändert

Unverändert blieben insbesondere:

- Datenschema 5 und der Datenebenenvertrag;
- die bestehende Berechnungslogik in `js/billing-calculation.js`;
- Kosten-, Vorauszahlungs-, Mietverhältnis-, Archiv-, Brief- und Exportfachlogik;
- die globale Navigation und die gelbe Abrechnungskontextleiste;
- sämtliche historischen Archive und Echtdaten;
- alle übrigen 676 Dateien der Ausgangsbasis.

Es wurden keine Dateien der Ausgangsbasis gelöscht.
