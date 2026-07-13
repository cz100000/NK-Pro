# NK-Pro – UI-Architektur V99.4.12

## Verbindlicher Ablauf

```text
DOM-Ereignis → NKProUiEvents → NKProUiController → NKProUiBindings
             → Anwendungs-/Fachdienst → Ergebnis/State → Renderer → Persistenzadapter
```

13 Controller und 99 eindeutige Aktionskennungen bleiben unverändert. AP11 verwendet für alle 16 produktiven Ziele weiterhin `navigation.switchTab`; neue Fachaktionen wurden nicht eingeführt.

## Navigation

- genau ein `<nav aria-label="Hauptnavigation">`,
- vier `section.nav-group`-Bereiche,
- native Buttons mit `aria-controls`, `aria-expanded` und `aria-current`,
- aktiver Zustand wird aus `section.tab.active` abgeleitet,
- Gruppenöffnung ist eine nicht fachliche UI-Präferenz,
- abrechnungsabhängige Ziele werden ohne aktiven Kontext nativ deaktiviert,
- Einstellungen ist ein fokussierbarer, aktionsloser Status-Dummy.

## Renderer- und Zustandsregeln

Navigation und Renderer verändern keine Fachwerte und lösen keine Persistenz aus. Es existiert keine zweite aktive Zustandsquelle und keine doppelte Ereignisregistrierung. Der Footer-Dummy trägt bewusst keine `data-ui-action`-Kennung.

## Responsive UI

Desktop: 316 px, Notebook: 286 px, schmal: Drawer unter 981 px. Bei geringer Höhe scrollt nur die Navigationsliste. Fokus, Tooltip und aktive Markierung bleiben sichtbar.

Details: `AP11_NAVIGATIONSINVENTAR.md`, `AP11_RESPONSIVE_BARRIEREFREIHEIT.md`, `UI_CONTROLLER_UEBERSICHT.md`.
