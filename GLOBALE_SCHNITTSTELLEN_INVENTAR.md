# NK-Pro – Globale Schnittstellen V99.4.18

AP14 führt keine neue unkontrollierte globale Schnittstelle ein. Die neue Kopfsteuerung bleibt innerhalb von `NKProNavigation`; die bestehenden 75 expliziten Übergangswrapper bleiben unverändert.

Zulässig bleiben eingefrorene `NKPro…`-Modulnamensräume und `NKProRuntimeDiagnostics`. Es gibt keine Inline-Handler oder neuen direkten `window`-/`globalThis`-Zuweisungen.
