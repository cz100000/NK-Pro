# AP12 – Direkte Zustandsmutationen

## Ergebnis

| Kennzahl | Vor AP12 | Nach AP12 |
|---|---:|---:|
| direkte Schreibstellen in `app.js` | 96 | 0 |
| Root-State-Ersetzungen projektweit | 10 | 1 |
| Renderer mit Seiteneffekt | 9 | 0 |

Die verbleibenden 135 statisch erkannten Mutationsstellen sind nicht pauschal entfernt worden. Sie liegen in dokumentierten Eigentümer-, Persistenz-, Restore-, Diagnose- oder kontrollierten UI-Aktionspfaden.

### Verteilung nach Datei

| Datei | statisch erkannte Stellen |
|---|---|
| `js/diagnostics.js` | 48 |
| `js/ui-metering.js` | 30 |
| `js/ui-documents.js` | 18 |
| `js/app-state-persistence.js` | 15 |
| `js/ui-master-data.js` | 15 |
| `js/ui-navigation-pages.js` | 6 |
| `js/ui-quality.js` | 2 |
| `js/ui-costs.js` | 1 |


### Klassifikation

| Klasse | Anzahl |
|---|---|
| UI-Aktion oder zentrale Vorbereitung; kein Renderer-Seiteneffekt | 72 |
| isolierter Diagnosezustand; produktiver Zustand wird wiederhergestellt | 48 |
| Persistenz-/Restore-Eigentümergrenze | 15 |


Jede Einzelstelle mit Datei, Zeile, Funktion, Ausdruck, Notwendigkeit, Kontrollstatus und Maßnahme steht in `AP12_MUTATIONSINVENTAR.json`.
