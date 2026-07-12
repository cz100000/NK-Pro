# Globale Kompatibilitätsschicht V99.4.7

## Zweck

Bestehende Inline-Handler, UI-Aktionen, Playwright-Tests und Legacy-Aufrufe verwenden weiterhin bekannte globale Funktionsnamen. AP6 entfernt diese Namen nicht, sondern reduziert sie auf reine Weiterleitungen.

## Regel

Ein Kompatibilitätswrapper darf ausschließlich Argumente an genau eine Modulfunktion weitergeben und deren Ergebnis zurückgeben. Eigene Validierung, Berechnung, Mutation oder Fehlerbehandlung ist im Wrapper unzulässig.

Beispiel:

```js
function buildBriefHtml(...args) {
  return NK_PRO_MODULES.documentRenderer.buildBriefHtml(...args);
}
```

## Registry

`NKProCompatibility.registerModule()` prüft beim Start, dass jede registrierte Zielmethode vorhanden ist. Die Registry wird als unveränderliche Beschreibung in `window.__NKPRO_COMPATIBILITY__` bereitgestellt.

Registrierte Bereiche:

- `billingCalculation`,
- `documentData`,
- `documentRenderer`,
- `exportService`,
- `uiTableTools`.

## Umfang

112 globale Namen sind nach AP6 reine Wrapper. Das vollständige Verzeichnis mit Zielmodul und Zeilennummer steht in `GLOBALE_SCHNITTSTELLEN_INVENTAR.md`.

## Verbleibende globale Bindungen

`state`, UI-Zustände, zahlreiche Render-/Workflowfunktionen und Legacy-Hilfen bleiben vorläufig global. Ihre Entfernung ist nicht Teil von AP6, weil sie eine breite Anpassung von Inline-Handlern, Testhilfen und Arbeitsabläufen erfordern würde.
