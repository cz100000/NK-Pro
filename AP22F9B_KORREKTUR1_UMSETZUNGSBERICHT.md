# AP22F9B Korrektur 1 – Umsetzungsbericht

## Tabellenstandard

Der globale Altselektor `.tab:not(#start) table thead th` besitzt durch die ID in `:not(#start)` eine höhere Spezifität als die erste AP22F9B-Regel. Deshalb blieb der dunkelblaue Tabellenkopf sichtbar.

Die Korrektur verwendet nun ausschließlich für die Seite `#einstellungen` einen hinreichend spezifischen Selektor für:

- `#settingsTable`;
- `#kostenMieterUmlageTable`.

Beide Tabellenköpfe verwenden damit dieselben Werte wie die Seite „Vorauszahlungen“:

- Hintergrund `var(--nk-ui-color-surface-muted)`;
- Text `var(--nk-ui-color-text)`;
- Rahmen `var(--nk-ui-color-border)`;
- 12 px Schriftgröße und 700 Schriftgewicht;
- neutrale Groß-/Kleinschreibung.

Die globale Tabellenbibliothek ergänzt Tabellenköpfen automatisch Sortierklassen und Klickhandler. Da für AP22F9B keine neue Sortierfunktion freigegeben wurde, entfernt der lokale Renderer diese Zusätze nach jedem Rendern ausschließlich an den beiden Gesamtkostentabellen.

## Kennzahlenkacheln

Die bisherigen Textzeichen `€`, `≡`, `✓` und `!` wurden durch vier Inline-Linien-SVGs ersetzt:

- Geldbörse für Gesamtkosten;
- Listen-/Kostenarten-Symbol für aktive Kostenarten;
- Kreis mit Haken für vollständig erfasst;
- Kreis mit Ausrufezeichen für offene Hinweise.

Die Symbole besitzen keinen eigenen Hintergrund und keinen Rahmen. Größe, Linienart und Anordnung entsprechen der bereits migrierten Seite „Vorauszahlungen“.

## Fachliche Unverändertheit

Die Kachelwerte werden weiterhin ausschließlich aus den bereits vorhandenen Gesamtsummen, aktiven Kostenarten und `kostenStatus()`-Ergebnissen gespeist. Es wurden keine neuen Felder, Statuswerte, Prüfungen, Berechnungen oder Speicherwerte eingeführt.
