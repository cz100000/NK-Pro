# AP22F6B – Schutz-Hash-Bericht

## Ausgangsbasis
Produkt-ZIP SHA-256: `ad73fed915f043c20cb291f19381041a1726e156194de1f5095af267a48fb13e`

Planungspaket Korrektur 2 SHA-256: `e612681f230d507b8bddb8aee77f847c34ecc3d739009e5f49d6190f87624ae9`

## Ergebnis
**BESTANDEN.** Der neue Schutztest bestätigt:
- **392** vollständig geschützte vorhandene Dateien außerhalb der Positivliste bytegleich
- **25** geschützte Bereiche bytegleich
- geschützter CSS-Präfix: **291.694 Byte**, SHA-256 `09f71132f6db4537427f625412a21b6543271a9fc49b43cdec51b37d3774e471`
- Navigation `#appSidebar`, NK-Pro-Seitenkopf, globale Kontextleiste, Erstellen- und Löschdialog unverändert
- Lebenszyklus-, Status-, Korrektur-, Abschluss-, Zeitraum- und Dialogfunktionen in `js/ui-navigation-pages.js` unverändert

## Besonders geschützte Systeme
Navigation, Datenmodell/Datenschema 5, Persistenz, Migration, Backup/Restore, Archivierung, Abrechnungsberechnung, Brief-/Drucksystem, Zähler, Wohnungen, Mietverhältnisse und bestehende Regressionstests wurden nicht fachlich verändert.

## Nachgelagerte Releaseänderungen
Die in der Planung ausdrücklich freigegebenen Release-/Dokumentationsdateien wurden erst nach bestandener technischer und visueller Abnahme fortgeschrieben.
