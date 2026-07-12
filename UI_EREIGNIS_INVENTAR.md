# UI-Ereignis- und Inline-Handler-Inventar – V99.4.9

## Ausgang V99.4.7

| Bereich | Inline-Handler |
|---|---:|
| `index.html` | 51 |
| dynamisch erzeugt in `js/app.js` | 79 |
| **Gesamt** | **130** |

Aufteilung: 89 `onclick`, 40 `onchange`, 1 `oninput`, 0 `onsubmit`, 0 `onkeydown`.

Im produktiven JavaScript bestanden 18 programmatische `addEventListener`-Quellstellen: 6 in `app.js`, 5 in `navigation.js`, 2 in `modal-events.js`, 3 in `service-worker-register.js` und 2 in `ui-table-tools.js`.

## Endstand V99.4.9

- Inline-Handler in `index.html`: 0
- Inline-Handler in `app.js`: 0
- veraltete `data-app-action`-Attribute: 0
- eigene DOM-Ereignisregistrierungen in `app.js`: 0
- zentrale delegierte Ereignisarten: 5
- programmatische `addEventListener`-Quellstellen gesamt: 13

`NKProUiEvents` registriert genau einmal die Ereignisse `click`, `change`, `input`, `submit` und `keydown` am Dokument. Wiederholte Startaufrufe erzeugen keine doppelten Listener.

## Verbleibende Listener

| Modul | Quellstellen | Begründung |
|---|---:|---|
| `ui-events.js` | 1 | zentrale Schleife für fünf delegierte Ereignisarten |
| `navigation.js` | 5 | Navigation, Sidebar und DOMContentLoaded; rein UI-bezogen |
| `modal-events.js` | 2 | Backdrop und Escape; delegieren an Controller |
| `ui-table-tools.js` | 2 | gekapselte Filter- und Tabellenhilfen |
| `service-worker-register.js` | 3 | Browser-/Service-Worker-Lebenszyklus |

## Ereignisvertrag

- `data-ui-action`: Klickaktion
- `data-ui-change`: Änderung eines Formularwerts
- `data-ui-input`: unmittelbare Eingabe
- `data-ui-submit`: Formularabsendung
- `data-ui-keydown`: Tastaturaktion, optional mit `data-ui-key`
- `data-ui-args`: JSON-Array mit festen Argumenten oder Platzhaltern wie `$value`, `$checked`, `$files` und `$key`
