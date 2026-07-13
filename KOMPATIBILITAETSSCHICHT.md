<!-- AP10-CURRENT -->
# Kompatibilitätsschicht V99.4.11

AP10 entfernt 79 implementierungstragende globale Funktionen aus `app.js` und ergänzt **keine** AP10-Weiterleitung. Die bestehenden 112 AP6-Wrapper bleiben unverändert, weil ihre registrierten klassischen Laufzeit- und Regressionstestabhängigkeiten außerhalb des AP10-Umfangs weiterhin bestehen. Neu registrierte Modulobjekte besitzen zwar lesende Kompatibilitätsmetadaten, aber keine Fachlogik-Wrapper in `app.js`.

<!-- AP9-HISTORIC -->
# Kompatibilitätsschicht V99.4.10

AP9 entfernt 28 nicht mehr benötigte Übergangsweiterleitungen und ergänzt keine neuen Wrapper. Die 112 registrierten AP6-Wrapper in `compatibility.js` bleiben wegen konkreter klassischer globaler Aufrufer und Test-/Diagnosepfade bestehen. Verbleibende Wrapper leiten ausschließlich weiter und enthalten keine Fachlogik.

# Globale Kompatibilitätsschicht V99.4.9

## Zweck

Inline-Handler und HTML-Aufrufe auf globale Funktionen wurden in AP7 vollständig entfernt. Die 112 AP6-Wrapper bleiben ausschließlich für interne Legacy-Aufrufe und Regressionstests als reine Weiterleitungen bestehen. Fünf globale Navigationswrapper wurden entfernt und durch `NKProNavigation` ersetzt.

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
