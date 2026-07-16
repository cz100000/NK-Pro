# AP22D – Inventar Dialoge und Inhaltszustände

## Ausgangsstand V99.4.31

### Kontrolliert zu migrierende Dialoge

| Dialog | Ausgangstechnik | AP22D-Regel | Fachfunktion unverändert |
|---|---|---|---|
| Neue Abrechnung anlegen | `div.modal-backdrop` / `div.modal-card` | Standarddialog, Escape und Hintergrundklick zulässig | ja |
| Abrechnung löschen | `div.modal-backdrop` / `div.modal-card` | destruktiver, besonders geschützter Dialog; weder Escape noch Hintergrundklick schließen | ja |
| Einheitspreis bearbeiten | `div.cost-modal-backdrop` / Rollen-Dialog | fachlicher Aktionsdialog, Escape und Hintergrundklick zulässig | ja |
| Kostenart hinzufügen | `div.cost-modal-backdrop` / Rollen-Dialog | breiter Auswahldialog, Escape und Hintergrundklick zulässig | ja |
| Prüfpunktdetails | natives `dialog` | breiter Hinweis-/Aktionsdialog, Escape und Hintergrundklick zulässig | ja |

### Kontrolliert zu migrierende produktive Inhaltszustände

| Stelle | Ausgangsdarstellung | AP22D-Zieltyp |
|---|---|---|
| Kostenartauswahl ohne Suchtreffer | `cost-dialog-empty` | leeres Such-/Filterergebnis |
| Individuelle Werte ohne Treffer | `individual-values-empty` | leeres Such-/Filterergebnis |

### Zentral neu bereitgestellte Zustandstypen

- keine Daten vorhanden
- noch keine Datensätze angelegt
- Such-/Filterergebnis leer
- Ladezustand
- Fehlerzustand
- nicht anwendbar
- deaktiviert / aktuell nicht verfügbar

Diese Typen werden über die zentrale UI-Schnittstelle erzeugt. Weitere produktive Seitenmigrationen erfolgen nicht in AP22D.

## Ausdrücklich nicht migriert

- native `alert`, `confirm` und `prompt` außerhalb der fünf ausgewählten Dialoge
- Tabellen-Leerzeilen, deren Struktur für Tabellen- und Fachregressionen erhalten bleiben muss
- Brief-, Druck-, PDF- und Exportdarstellungen
- Fachlogik, Datenflüsse, Speicherung, Navigation und Prüfregeln
