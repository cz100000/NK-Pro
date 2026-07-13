# AP12 – Globale Bindungen und Laufzeitschnittstellen

## Entfernt

| Alte Bindung | Maßnahme |
|---|---|
| `window.__V992_AUDIT__` | entfernt; Inhalt in gekapselte Laufzeitdiagnose überführt |
| `window.__NKPRO_UI_ARCHITECTURE__` | entfernt; Inhalt in gekapselte Laufzeitdiagnose überführt |
| `window.__NKPRO_STARTUP__` | entfernt; Inhalt in gekapselte Laufzeitdiagnose überführt |
| `window.__NKPRO_COMPATIBILITY__` | entfernt; Inhalt in gekapselte Laufzeitdiagnose überführt |


## Begründet verbleibend

NK-Pro verwendet ohne Bundler eingefrorene Modul-Namensräume als explizite Classic-Script-Schnittstellen. 31 solcher Modulfreigaben wurden inventarisiert. Sie sind keine frei beschreibbaren Zustandsquellen; die exportierten APIs werden mit `Object.freeze` bereitgestellt.

`NKProRuntimeDiagnostics` bündelt Startstatus, UI-Architekturaudit und Kompatibilitätsbericht in einer einzigen schreibgeschützten Diagnosegrenze. Die statische Analyse findet keine unkontrollierte `window`-/`globalThis`-Eigenschaftszuweisung.

Produktiv notwendig bleiben außerdem die ausdrücklich registrierten Kompatibilitätsnamen für die bestehende Classic-Script-Ladefolge. Neue Inline-Handler oder neue unkontrollierte Globals wurden nicht eingeführt.
