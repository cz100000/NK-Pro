# NK-Pro – Projektstand V99.4.12

## Release

- **Versionsname:** Navigationsstruktur und visuelles Grundsystem
- **Basis:** V99.4.11
- **Datum:** 13.07.2026
- **Technik:** statisches HTML, CSS und JavaScript; PWA; kein Framework, TypeScript oder Buildsystem

## Verbindliche Standards

| Standard | Version |
|---|---:|
| Datenschema | 5 |
| Datenebenenvertrag | 1 |
| Objektstandard | 1 |
| Zählerstamm-/Messwert-/Perioden-/Zuordnungs-/Wechselstandard | jeweils 1 |
| Abrechnungssnapshot | 2; Version 1 kompatibel |
| UI-Controllervertrag | 1 |
| Ereignisvertrag | 1 |
| Navigationsdesignsystem | 1 |

## Architekturkennzahlen

- 13 UI-Controller,
- 99 eindeutige Aktionskennungen,
- 16 produktive Navigationsziele in 4 Gruppen,
- 22 lokale Navigations-SVGs,
- `app.js`: 6.294 Zeilen, 518 Top-Level-Funktionsdeklarationen, 67 Top-Level-Bindungen,
- 79 in AP10 physisch extrahierte Implementierungen bleiben außerhalb von `app.js`,
- direkte Browser-Speicherzugriffe produktiv nur in `persistence.js` und `ui-preferences.js`.

## AP11-Ergebnis

Die produktive Navigation entspricht strukturell und visuell der Referenzrichtung. „Zähler“ steht in der Objektvorbereitung vor „Mieter“; Kosten/Verteilung liegen im Abrechnungsworkflow; allgemeine „Einstellungen“ sind im Footer sichtbar, deaktiviert und mit „Noch nicht verfügbar“ erläutert. Aktive Seite, Gruppenpfad und `aria-current` werden synchron gehalten.

## Folgeschritte

AP12: Restentkopplung und globale Zustandsbereinigung. AP13: Brieflayout, Druckbild und Vorschaukonsistenz.
