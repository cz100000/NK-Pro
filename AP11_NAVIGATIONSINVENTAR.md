# AP11 – Navigationsinventar und Zuordnung

**Version:** NK-Pro V99.4.12  
**Produktive Navigationsquelle:** genau ein semantisches `<nav class="workflow-nav">` in `index.html`  
**Bestand:** 4 Gruppen, 16 produktive Ziele, 22 lokale SVG-Piktogramme, 1 deaktivierter Footer-Dummy.

## Zielstruktur

### Objekt vorbereiten (`object`)

| Menüpunkt | Zielseite | Aktionskennung | aktive Abrechnung erforderlich | Rang |
|---|---|---|---|---|
| Objekt | `objekt` | `navigation.switchTab` | nein | primär |
| Wohnungen | `wohnungsverwaltung` | `navigation.switchTab` | nein | primär |
| Zähler | `wasser` | `navigation.switchTab` | ja | primär |
| Mieter | `mieterverwaltung` | `navigation.switchTab` | nein | primär |

### Nebenkosten abrechnen (`billing`)

| Menüpunkt | Zielseite | Aktionskennung | aktive Abrechnung erforderlich | Rang |
|---|---|---|---|---|
| Kosten erfassen | `einstellungen` | `navigation.switchTab` | ja | primär |
| Verteilung | `umlage` | `navigation.switchTab` | ja | primär |
| Prüfung | `qualitaet` | `navigation.switchTab` | ja | primär |
| Briefe | `briefe` | `navigation.switchTab` | ja | primär |
| Export | `export` | `navigation.switchTab` | ja | primär |
| Abrechnungsübersicht | `start` | `navigation.switchTab` | nein | ergänzend |
| Mieter & Wohnungen | `mieter` | `navigation.switchTab` | ja | ergänzend |
| Miete & Vorauszahlungen | `einnahmen` | `navigation.switchTab` | ja | ergänzend |
| Manuelle & externe Werte | `manuellewerte` | `navigation.switchTab` | ja | ergänzend |
| Neue Vorauszahlungen | `vorauszahlungsanpassung` | `navigation.switchTab` | ja | ergänzend |

### Archiv (`archive`)

| Menüpunkt | Zielseite | Aktionskennung | aktive Abrechnung erforderlich | Rang |
|---|---|---|---|---|
| Abrechnungsarchiv | `archiv` | `navigation.switchTab` | nein | primär |

### Extras (`extras`)

| Menüpunkt | Zielseite | Aktionskennung | aktive Abrechnung erforderlich | Rang |
|---|---|---|---|---|
| Datensicherung & System | `sicherung` | `navigation.switchTab` | nein | primär |

## Zuordnung V99.4.11 → V99.4.12

| Bisheriger Menüpunkt | Zielgruppe | Neuer Menüpunkt | Aktion beziehungsweise Seite | Änderung |
|---|---|---|---|---|
| Objekt | Objekt vorbereiten | Objekt | `navigation.switchTab` → `#objekt` | Position/Design vereinheitlicht; Ziel und Aktion unverändert |
| Wohnungen | Objekt vorbereiten | Wohnungen | `navigation.switchTab` → `#wohnungsverwaltung` | Position/Design vereinheitlicht; Ziel und Aktion unverändert |
| Zählerstände | Objekt vorbereiten | Zähler | `navigation.switchTab` → `#wasser` | Gruppe billing → object; Bezeichnung gekürzt: „Zählerstände“ → „Zähler“ |
| Mieter | Objekt vorbereiten | Mieter | `navigation.switchTab` → `#mieterverwaltung` | Position/Design vereinheitlicht; Ziel und Aktion unverändert |
| Kosten erfassen | Nebenkosten abrechnen | Kosten erfassen | `navigation.switchTab` → `#einstellungen` | Position/Design vereinheitlicht; Ziel und Aktion unverändert |
| Verteilung & Berechnung | Nebenkosten abrechnen | Verteilung | `navigation.switchTab` → `#umlage` | Bezeichnung gekürzt: „Verteilung & Berechnung“ → „Verteilung“ |
| Qualitätsprüfung | Nebenkosten abrechnen | Prüfung | `navigation.switchTab` → `#qualitaet` | Bezeichnung gekürzt: „Qualitätsprüfung“ → „Prüfung“ |
| Briefe | Nebenkosten abrechnen | Briefe | `navigation.switchTab` → `#briefe` | Position/Design vereinheitlicht; Ziel und Aktion unverändert |
| Export | Nebenkosten abrechnen | Export | `navigation.switchTab` → `#export` | Position/Design vereinheitlicht; Ziel und Aktion unverändert |
| Abrechnungsübersicht | Nebenkosten abrechnen | Abrechnungsübersicht | `navigation.switchTab` → `#start` | als ergänzender Abrechnungsschritt nach Primärworkflow eingeordnet |
| Mieter & Wohnungen | Nebenkosten abrechnen | Mieter & Wohnungen | `navigation.switchTab` → `#mieter` | als ergänzender Abrechnungsschritt nach Primärworkflow eingeordnet |
| Miete & Vorauszahlungen | Nebenkosten abrechnen | Miete & Vorauszahlungen | `navigation.switchTab` → `#einnahmen` | als ergänzender Abrechnungsschritt nach Primärworkflow eingeordnet |
| Manuelle & externe Werte | Nebenkosten abrechnen | Manuelle & externe Werte | `navigation.switchTab` → `#manuellewerte` | als ergänzender Abrechnungsschritt nach Primärworkflow eingeordnet |
| Neue Vorauszahlungen | Nebenkosten abrechnen | Neue Vorauszahlungen | `navigation.switchTab` → `#vorauszahlungsanpassung` | als ergänzender Abrechnungsschritt nach Primärworkflow eingeordnet |
| Abrechnungsarchiv | Archiv | Abrechnungsarchiv | `navigation.switchTab` → `#archiv` | Position/Design vereinheitlicht; Ziel und Aktion unverändert |
| Datensicherung & System | Extras | Datensicherung & System | `navigation.switchTab` → `#sicherung` | Position/Design vereinheitlicht; Ziel und Aktion unverändert |

## Erhalt der Aktionen

Alle 16 Menüeinträge verwenden weiterhin die bestehende Aktionskennung `navigation.switchTab`. Die sechs weiteren Navigation-Controlleraktionen sowie die Gesamtzahl von 13 UI-Controllern und 99 eindeutigen Aktionskennungen bleiben unverändert. Es wurde keine zweite Navigationszustandsquelle eingeführt.

## Kontextbedingungen

`data-requires-billing="true"` deaktiviert abrechnungsbezogene Ziele ohne aktive Abrechnung. Das Rendering verändert weder Fachzustand noch Persistenz. Der aktive Zustand folgt ausschließlich dem tatsächlich sichtbaren `section.tab.active` und wird mit `aria-current="page"` gespiegelt.
