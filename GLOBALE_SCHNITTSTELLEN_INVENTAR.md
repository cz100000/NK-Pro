# Globale Schnittstellen – V99.4.13

## Zulässige Schnittstellen

- eingefrorene `NKPro…`-Modulnamensräume für die statische Classic-Script-Ladefolge,
- ein eingefrorenes `NKProRuntimeDiagnostics` für Start-, UI- und Kompatibilitätsdiagnose,
- 75 ausdrücklich registrierte Übergangswrapper.

## Entfernt

`__V992_AUDIT__`, `__NKPRO_UI_ARCHITECTURE__`, `__NKPRO_STARTUP__` und `__NKPRO_COMPATIBILITY__` wurden entfernt. Es verbleiben keine unkontrollierten direkten `window`-/`globalThis`-Eigenschaftszuweisungen und keine Inline-Handler.
