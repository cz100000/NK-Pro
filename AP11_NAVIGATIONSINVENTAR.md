# AP11 – Navigationsinventar und Zuordnung

**Ursprüngliche Version:** NK-Pro V99.4.12  
**Korrigierter Stand:** NK-Pro V99.4.13  
**Produktive Navigationsquelle:** genau ein semantisches `<nav class="workflow-nav">` in `index.html`  
**Bestand:** 4 Gruppen, 16 produktive Ziele, 22 lokale SVG-Piktogramme, 1 deaktivierter Footer-Dummy.

## Verbindliche Zielstruktur

### Objekt vorbereiten (`object`)

| Menüpunkt | Zielseite | Aktionskennung | aktive Abrechnung erforderlich | Rang |
|---|---|---|---|---|
| Objekt | `objekt` | `navigation.switchTab` | nein | gleichrangig |
| Wohnungen | `wohnungsverwaltung` | `navigation.switchTab` | nein | gleichrangig |
| Zähler | `wasser` | `navigation.switchTab` | ja | gleichrangig |
| Mieter | `mieterverwaltung` | `navigation.switchTab` | nein | gleichrangig |

### Nebenkosten abrechnen (`billing`)

Innerhalb dieser Gruppe existiert keine Untergruppe und keine Überschrift „Weitere Abrechnungsschritte“. Alle zehn Einträge verwenden dieselbe Navigationsebene und denselben visuellen Rang.

| Reihenfolge | Menüpunkt | Zielseite | Aktionskennung | aktive Abrechnung erforderlich | Rang |
|---:|---|---|---|---|---|
| 1 | Abrechnungsübersicht | `start` | `navigation.switchTab` | nein | gleichrangig |
| 2 | Mieter & Wohnungen | `mieter` | `navigation.switchTab` | ja | gleichrangig |
| 3 | Miete & Vorauszahlungen | `einnahmen` | `navigation.switchTab` | ja | gleichrangig |
| 4 | Kosten erfassen | `einstellungen` | `navigation.switchTab` | ja | gleichrangig |
| 5 | Manuelle & externe Werte | `manuellewerte` | `navigation.switchTab` | ja | gleichrangig |
| 6 | Verteilung | `umlage` | `navigation.switchTab` | ja | gleichrangig |
| 7 | Prüfung | `qualitaet` | `navigation.switchTab` | ja | gleichrangig |
| 8 | Neue Vorauszahlungen | `vorauszahlungsanpassung` | `navigation.switchTab` | ja | gleichrangig |
| 9 | Briefe | `briefe` | `navigation.switchTab` | ja | gleichrangig |
| 10 | Export | `export` | `navigation.switchTab` | ja | gleichrangig |

### Archiv (`archive`)

| Menüpunkt | Zielseite | Aktionskennung | aktive Abrechnung erforderlich | Rang |
|---|---|---|---|---|
| Abrechnungsarchiv | `archiv` | `navigation.switchTab` | nein | gleichrangig |

### Extras (`extras`)

| Menüpunkt | Zielseite | Aktionskennung | aktive Abrechnung erforderlich | Rang |
|---|---|---|---|---|
| Datensicherung & System | `sicherung` | `navigation.switchTab` | nein | gleichrangig |

## Korrektur nach AP12

Die in V99.4.12 eingeführte künstliche Unterteilung in fünf hervorgehobene und fünf ergänzende Abrechnungsschritte wurde entfernt. Die Korrektur ändert ausschließlich Reihenfolge, Klassen und Darstellung der vorhandenen Navigationspunkte. Tab-IDs, Aktionskennungen, Kontextbedingungen und Fachfunktionen bleiben unverändert.

## Erhalt der Aktionen

Alle 16 Menüeinträge verwenden weiterhin die bestehende Aktionskennung `navigation.switchTab`. Die weiteren Navigation-Controlleraktionen sowie die Gesamtzahl von 13 UI-Controllern und 99 eindeutigen Aktionskennungen bleiben unverändert. Es wurde keine zweite Navigationszustandsquelle eingeführt.

## Kontextbedingungen

`data-requires-billing="true"` deaktiviert abrechnungsbezogene Ziele ohne aktive Abrechnung. Das Rendering verändert weder Fachzustand noch Persistenz. Der aktive Zustand folgt ausschließlich dem tatsächlich sichtbaren `section.tab.active` und wird mit `aria-current="page"` gespiegelt.
