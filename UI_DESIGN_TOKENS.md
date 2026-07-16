# NK-Pro UI-Design-Tokens

## Kanonischer Namensraum
Alle neuen zentralen Tokens beginnen mit `--nk-ui-`.

## Gruppen
- Farbe: `--nk-ui-color-*`
- Abstand: `--nk-ui-space-*`
- Radius: `--nk-ui-radius-*`
- Schatten: `--nk-ui-shadow-*`
- Steuerelementhöhe: `--nk-ui-control-height`
- Übergang: `--nk-ui-transition-fast`

## Regeln
Fachseiten dürfen neue Werte nicht als weitere globale Tokens einführen. Neue Tokens werden nur ergänzt, wenn sie mindestens zwei Komponenten dienen und semantisch statt seitenbezogen benannt sind.

## AP22D – Dialoge und Inhaltszustände

Dialoge und Zustände verwenden ausschließlich die vorhandenen zentralen Farb-, Abstands-, Radius-, Schatten-, Fokus- und Übergangstokens. AP22D führt keine seitenbezogenen Tokens ein. Gefahr-, Fehler-, Lade- und Nicht-verfügbar-Zustände werden aus den bestehenden semantischen Tokens abgeleitet.
