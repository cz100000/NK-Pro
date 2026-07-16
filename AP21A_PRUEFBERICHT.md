# AP21A – Prüfbericht

## Ergebnis

**Freigabestatus: bestanden.**

## Prüfumfang

- JavaScript-Syntax und vollständige produktive Skriptreihenfolge
- Referenzfälle, Zählerdomäne und bestehende Berechnungsregressionen
- Architekturgrenzen, State-Eigentümerschaft, UI-Controller und Ereignisdelegation
- Persistenz, Migration, Backup/Restore, Snapshots, Archiv und Wiederbearbeitung
- Navigation, Seitentitel, Direkteinstiege und alte Seitenschlüssel
- dynamische Klappboxen und alle vier Datenquellenarten der Seite „Individuelle Werte“
- Bearbeitungs-, Ansichts- und Archivmodus einschließlich technischer Schreibsperre
- Brief-, Druck-, S/W- und Skalierungsregressionen
- zentrale AP20-Prüfoberfläche ohne fachliche Änderung der Regeln
- Responsive-Verhalten und PWA-App-Shell

## Browserergebnis

102 Playwright-/Chromium-Szenarien wurden ausgeführt: 99 bestanden, 0 fehlgeschlagen, 3 planmäßig übersprungen. Die drei Übersprünge sind ausschließlich optionale Bildreferenz- beziehungsweise reale Offline-Gerätetests; die zugehörige Service-Worker-Semantik wurde im regulären Testprojekt geprüft.

## Daten- und Fachschutz

- Datenschema 5 und Datenebenenvertrag 1 unverändert.
- Keine Datenmigration erforderlich.
- NKP-FACH-001 unverändert erhalten.
- NKP-FACH-002 nicht umgesetzt.
- Keine weitere fachliche Prüfregel geändert.
