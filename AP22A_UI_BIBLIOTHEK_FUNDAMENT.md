# AP22A – UI-Bibliothek: Inventar, Architektur und Fundament

## Ziel
AP22A führt ein abgegrenztes, wiederverwendbares UI-Fundament ein. Es ersetzt noch keine bestehenden Fachseiten und entfernt keine Altvarianten.

## Architektur
- CSS-Namensraum: `nk-ui-*`
- Design-Tokens: `--nk-ui-*`
- JavaScript-Schnittstelle: `globalThis.NKProUIDesignSystem`
- Fachlogik, Persistenz und Navigation dürfen nicht Bestandteil der UI-Bibliothek werden.
- Komponenten werden in späteren AP22-Paketen kontrolliert migriert.

## Grundkomponenten
Button, Feld, Karte, Accordion, Tabelle, Status, Hinweis, Toolbar, Dialog und Leerzustand.

## Migrationsregel
Eine Altvariante darf erst entfernt werden, wenn alle produktiven Verwendungen inventarisiert, migriert und durch separate Tests abgesichert sind.
