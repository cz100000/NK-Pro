# AP12 – Restentkopplung und globale Zustandsbereinigung

## Ergebnis

NK-Pro V99.4.13 reduziert `js/app.js` von **6.294 Zeilen / 382.650 Byte** auf **225 Zeilen / 15.599 Byte**. Die Datei enthält nur noch Start, Modulverdrahtung, kontrollierte Initialisierung, Anwendungsaktionen, Navigationseinrichtung, Ereignisstart, Architekturprüfung und die ausdrücklich registrierte Übergangskompatibilität.

| Kennzahl | Vor AP12 | Nach AP12 |
|---|---:|---:|
| Top-Level-Funktionen in `app.js` | 518 | 8 |
| Top-Level-Bindungen in `app.js` | 67 | 2 |
| direkte State-Pfadzugriffe in `app.js` | 306 | 0 |
| direkte Schreibstellen in `app.js` | 96 | 0 |
| projektweite Ersetzungen des Root-State | 10 | 1 |
| Renderer mit fachlichem Seiteneffekt | 9 | 0 |
| Legacy-Kompatibilitätswrapper | 112 | 75 |

## Neue Module

| Datei | Begrenzte Verantwortung |
|---|---|
| `js/runtime-diagnostics.js` | Gekapselte, schreibgeschützte Laufzeitdiagnose für Start-, UI- und Kompatibilitätsberichte. |
| `js/app-runtime-config.js` | Laufzeitkonstanten, Modulregister, einziger Arbeitszustandsbezug und Konfigurationswerte. |
| `js/app-state-persistence.js` | Zustandserzeugung/-ersetzung, Normalisierung, Commit, Persistenz, Backup-/Restore-UI und Statusdarstellung. |
| `js/ui-master-data.js` | Stammdaten-, Mietverhältnis-, Kontakt- und Preisdialogsteuerung. |
| `js/ui-quality.js` | Qualitätsansichten, Freigabe- und Abschlussberichte sowie Qualitätsfilter. |
| `js/ui-costs.js` | Kostenansichten, Kostenauswahl, Kosteninformation und Kostendialoge. |
| `js/ui-navigation-pages.js` | Seitenwechsel, Abrechnungsauswahl sowie Erstellen-/Löschen-Dialoge. |
| `js/ui-archive-pages.js` | Archivtabellen, Archivöffnung, Wiederbearbeitung und Archivdokumente. |
| `js/browser-io.js` | Dateiauswahl, Druckfenster, Downloads, Blob/URL/FileReader und browsergebundene Ein-/Ausgabe. |
| `js/ui-metering.js` | Zählerdarstellung, Zählerwerte, Messperioden und kontrollierte Zähleraktionen. |
| `js/ui-billing-allocation.js` | Umlage-, Vorauszahlungs- und Abrechnungsverteilungsansichten. |
| `js/ui-documents.js` | Briefdaten-UI, Vorschau-, Druck- und Dokumentaktionen; Gestaltung bleibt AP13 vorbehalten. |
| `js/ui-table-actions.js` | Tabellenfilter, Sortierung, Paging und Tabellen-UI. |
| `js/ui-diagnostics.js` | Diagnose- und Releaseprüfungsdarstellung. |
| `js/ui-page-controller.js` | Seitenrenderer, Seitenköpfe, Übersichten, Accordions und UI-Seitenorchestrierung. |


## Architekturgrenzen

- `state` bleibt die einzige fachliche Arbeitswahrheit. Seine Erzeugung und vollständige Ersetzung gehören `app-state-persistence.js`.
- Renderer stellen ausschließlich dar; alle 46 inventarisierten Renderer sind ohne Persistenz-, Navigations-, Dialog- oder Fachmutationsnebenwirkung.
- Zentrale Ereignisdelegation bleibt unverändert: 13 Controller, 99 Aktionskennungen und fünf Ereignistypen.
- Browser-I/O ist auf Browser-/UI-Adapter begrenzt; Fachmodule bleiben von DOM, Datei- und Speicher-APIs getrennt.
- Während AP12 blieb die AP11-Navigation unverändert. Anschließend wurde als abgegrenzte Navigationskorrektur nur die künstliche Abrechnungsuntergruppe entfernt; vier Gruppen, 16 Ziele, 22 lokale SVG-Icons und alle Aktionen blieben erhalten.
- Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Zählerstandards 1 und Abrechnungssnapshot 2 bleiben unverändert.

## AP13-Voraussetzung

Die Brief-, Vorschau- und Druckfunktionen liegen nun klar in `document-data.js`, `document-renderer.js`, `ui-documents.js` und `browser-io.js`. AP13 kann deshalb Layout, Druckbild und Vorschaukonsistenz bearbeiten, ohne `app.js` erneut zu belasten.
