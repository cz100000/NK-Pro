# AP22F5B Korrektur 1 – Schutz-Hash-Bericht

## Schutzgrundlage
`AP22F5B_PROTECTED_HASHES.json` enthält **94** Hashwerte der für AP22F5B geschützten Produkt- und Regressionstestdateien.

## Ergebnis
Der korrigierte statische AP22F5B-Test hat jeden der 94 Einträge erneut gegen den Releasebaum geprüft:

**94 von 94 Schutz-Hashes identisch – BESTANDEN.**

## Unveränderte Schutzbereiche
- Navigation und zentrale Seitenschlüssel
- Persistenz, Migration, Backup und Recovery
- Zählerfachmodule und Zählerdomäne
- Objektstandard und Abrechnungssnapshot
- zentrale Anwendungs- und Stammdatenaktionen
- Qualitätsregeln und Qualitätssicherung
- die vor AP22F5B vorhandenen Regressionstestdateien

## Korrekturabgrenzung
Geändert wurden ausschließlich die freigegebenen Mietverhältnis-UI-Dateien, die AP22F5B-spezifischen Tests, die nicht produktive UI-Referenz, Zielzustands-Screenshots, Abschlussdokumentation und `SHA256SUMS.txt`.
