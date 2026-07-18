# AP22F6B Korrektur 1 – Schutz-Hash-Bericht

## Ausgangsbasis

AP22F6B-Release-ZIP SHA-256:

`b115e38a023de05d75ae95854da8c284a24f9798ed00bc2b1d4190cc2daca139`

## Ergebnis

**BESTANDEN.** Der materialisierte Korrektur-Schutztest bestätigt:

- **392** vollständig geschützte vorhandene Dateien bytegleich;
- **24** geschützte Bereiche bytegleich;
- keine vorhandene Datei entfernt;
- Datenmodell und Datenschema 5 unverändert;
- Persistenz, Migration, Backup/Restore und Archivierung unverändert;
- Abrechnungsberechnung, Statuslogik und Prüfregeln unverändert;
- Brief-, Druck- und Exportsystem unverändert;
- Navigationsdefinition, Reihenfolge, Ziele und Handler unverändert.

## Bewusst geänderter Bereich

Der bisher geschützte Renderer `renderBillingPeriodSettings` wurde aufgrund der ausdrücklich freigegebenen Ablösung der Zeitraum-Klappbox durch einen separaten Dialog aus der Bereichshashliste herausgenommen. Seine fachlichen Schreibwege `billing.setPeriod` und `billing.syncPeriodYear` bleiben unverändert gebunden und werden durch die neuen statischen und Browserprüfungen abgesichert.

## Navigationskorrektur

Die Sichtbarkeit des bereits vorhandenen Abschnitts `Objekt vorbereiten` im Archiv-Ansichtsmodus wird über eine neue append-only-CSS-Regel wiederhergestellt. Es erfolgte keine Änderung der Navigationsstruktur oder Navigationslogik.
