# AP11 – Vorher-/Nachher-Dokumentation

| Aspekt | V99.4.11 | V99.4.12 |
|---|---|---|
| produktive Navigation | generischer `div.tabs`-Container | genau ein semantisches `<nav>` |
| Kopf | geometrisches Logo + „NK-PRO“, keine Unterzeile | Wortmarke „NK-Pro“ + „Nebenkostenabrechnung“ |
| Icons | nur wenige Steuericons, Gruppen-Chevron als Textzeichen | 22 einheitliche lokale Kontur-SVGs |
| Objektgruppe | Objekt, Wohnungen, Mieter | Objekt, Wohnungen, Zähler, Mieter |
| Abrechnung | 11 gleichrangige Einträge | 10 gleichrangige Einträge in fachlicher Ablaufreihenfolge |
| Bezeichnungen | „Zählerstände“, „Verteilung & Berechnung“, „Qualitätsprüfung“ | „Zähler“, „Verteilung“, „Prüfung“ |
| aktiver Zustand | blaue Vollfläche aus altem Grundstil; semantisch nicht vollständig synchron | helle aktive Fläche, Text/Icons, 4-px-Marker und `aria-current` |
| Footer | nur Einklappschalter | lokaler Status, Version und deaktivierter Einstellungen-Dummy |
| geringe Breite | bestehender Drawer, visuell uneinheitlich | 316-px-Drawer mit Overlay und konsistenten Zuständen |
| Designwerte | verstreute Einzelwerte und überlagerte Navigationsblöcke | zentrale Tokens und ein produktiver AP11-Block |

## Fachliche Kontinuität

Alle 16 bisherigen Zielseiten bleiben erreichbar. Ihre Tab-IDs und die Aktionskennung `navigation.switchTab` wurden beibehalten. Der Umbau ändert keine Kosten-, Zähler-, Vorauszahlungs-, Archiv-, Snapshot-, Migrations-, Backup-, Restore-, Dokument- oder Exportfachlogik.

## Technische Bereinigung

Die alten V99.2.6- und V99.4.0-Navigationsüberschreibungen wurden entfernt. Das vorhandene produktive Markup wurde umgebaut; es gibt keine verborgene zweite Navigation und keine parallele Ereignisregistrierung.
