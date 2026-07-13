# NK-Pro – Kompatibilitätsschicht V99.4.14


AP13 erhält die vorhandenen Dokumentweiterleitungen. Die Implementierung liegt im Dokumentrenderer; es wurde kein zweiter Renderer in der Kompatibilitätsschicht ergänzt.

Die Schicht ist explizit statt pauschal. `app.js` registriert genau 75 bekannte Namen aus Berechnung, Dokumentdaten, Dokumentrenderer, Export, Tabellen und Archiv. 37 nicht mehr aufgerufene Weiterleitungen wurden entfernt. Die Registry exportiert keine neuen Modulmethoden automatisch.

Vollständige Namen und Begründung: `AP12_LEGACY_KOMPATIBILITAET.md`. Die Schicht bleibt technische Altlast der no-build Classic-Script-Architektur und soll in späteren, fachlich passenden Paketen weiter reduziert werden.
