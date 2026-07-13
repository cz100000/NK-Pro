# NK-Pro – Roadmap ab V99.4.13

## Abgeschlossen

- AP12: Restentkopplung von `app.js` und globale Zustandsbereinigung.

## Nächstes Arbeitspaket

### AP13 – Brieflayout, Druckbild und Vorschaukonsistenz

Ziele: Briefkopf und Typografie, DIN-Positionierung, Seitenränder und -umbrüche, Tabellenlayout sowie visuelle und inhaltliche Übereinstimmung von Bildschirmvorschau, Druckansicht und erzeugter Ausgabe. Die AP12-Modulgrenzen (`document-data`, `document-renderer`, `ui-documents`, `browser-io`) sind verbindliche Ausgangsbasis.

## Historischer Stand

# NK-Pro – Roadmap nach V99.4.12

| Paket | Status | Inhalt |
|---|---|---|
| AP11 | abgeschlossen in V99.4.12 | Navigationsstruktur und visuelles Grundsystem nach Referenzbild; Icons, Tokens, aktive/deaktivierte Zustände, Responsivität, Tastatur und PWA |
| AP12 | als Nächstes | Restentkopplung von `app.js` und globale Zustandsbereinigung; verbleibende Renderer, Dialog-/Seitensteuerung, Legacy-Importe und Kompatibilitätswrapper reduzieren |
| AP13 | reserviert | Brieflayout, Druckbild und Vorschaukonsistenz; Typografie, Ränder, Umbrüche, Tabellen und ein-/zweiseitige Ausgabe |

AP12 darf die in AP11 geschaffene produktive Navigation nicht parallel ersetzen. AP13 darf auf den Design-Tokens aufbauen, muss Brief- und Druckregeln aber eigenständig spezifizieren und testen.
