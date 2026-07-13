# AP11 – Design-Tokens, Typografie und Größenraster

## Zentrale Tokens

| Bereich | CSS Custom Property | Wert |
|---|---|---|
| Primärfarbe | `--color-primary` | `#0d55c7` |
| Erfolg | `--color-success` | `#167a4b` |
| Warnung | `--color-warning` | `#9a6500` |
| Fehler | `--color-danger` | `#b42318` |
| Fokusrahmen | `--focus-ring` | `#1b6ed1` |
| Navigationsschale | `--sidebar-shell` / `--sidebar-shell-2` | `#031d41` / `#05264f` |
| Navigationsfläche | `--sidebar-surface` | `#fefefe` |
| Navigationstext | `--sidebar-text` | `#071b3d` |
| Sekundärtext | `--sidebar-muted` | `#5d6980` |
| Icons | `--sidebar-icon` | `#071f4a` |
| Trennlinie | `--sidebar-line` | `#e0e5ec` |
| aktive Fläche | `--sidebar-active` | `#e9f2ff` |
| aktiver Text | `--sidebar-active-text` | `#073f9a` |
| Hoverfläche | `--sidebar-hover` | `#f2f6fb` |
| deaktiviert | `--sidebar-disabled` | `#97a0ae` |
| Hauptinhalt | `--workspace-bg` | `#f4f6f9` |
| Oberfläche / Rahmen | `--surface` / `--surface-border` | `#ffffff` / `#d8e0e9` |

## Typografie

- Schriftfolge: `"Segoe UI Variable", "Segoe UI", Arial, Helvetica, sans-serif`; keine externe Schriftdatei.
- Produktname: 30 px, Gewicht 760, Zeilenhöhe 1,0.
- Unterzeile: 13,5 px, Gewicht 560, Zeilenhöhe 1,25.
- Gruppentitel: 14 px, Gewicht 720.
- Navigationseintrag: 14 px, Gewicht 570; aktiv 700.
- Footerstatus: 10,5 bis 12 px, Gewicht 520 bis 650.
- Lange deutsche Bezeichnungen bleiben einzeilig und werden in der 286-Pixel-Variante ohne Abschneiden dargestellt.

## Abstands- und Größenraster

| Element | Festlegung |
|---|---|
| Basisraster | 4 px (`--space-1` bis `--space-6`) |
| Navigation Desktop | 316 px |
| Navigation Notebook | 286 px |
| Kopfbereich | mindestens 87 px |
| weiße Panel-Außenkante | 8 px seitlich/unterhalb des Kopfes |
| Eintragshöhe | mindestens 42 px |
| Iconbox | 24 × 24 px |
| Icon-Text-Abstand | 13 px |
| horizontaler Eintragsabstand | 18 px links, 14 px rechts |
| aktive Seitenmarkierung | 4 px |
| kleine/mittlere/große Radien | 6 / 10 / 14 px |
| minimale Bedienfläche | mindestens 42 px hoch |

## Zustände

- **Inaktiv:** weiße Fläche, Text `#071b3d`, Icon `#071f4a`.
- **Hover:** Hintergrund `#f2f6fb`; keine Positionsverschiebung.
- **Aktiv:** Hintergrund `#e9f2ff`, Text `#073f9a`, Primärfarben-Icon, Gewicht 700, 4-Pixel-Seitenmarker, `aria-current=page`.
- **Fokus:** 2-Pixel-Rahmen `#1b6ed1`, sichtbar innerhalb der Navigation.
- **Kontextbedingt deaktiviert:** `disabled`, `aria-disabled=true`, Farbe `#97a0ae`.
- **Einstellungen-Dummy:** sichtbar, `aria-disabled=true`, absichtlich fokussierbar; Tooltip „Noch nicht verfügbar“ über Hover und Fokus, aber ohne Aktionskennung.
