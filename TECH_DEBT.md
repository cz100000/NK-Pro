# NK-Pro – Technische Restpunkte V99.4.16


AP13 beseitigt die parallelen Vorschau-/Drucklayouts. Verbleibend ist nur die externe Abhängigkeit von den Einstellungen des konkreten Browser-Druckdialogs beziehungsweise Druckertreibers.

## In AP12 erledigt

- `app.js` von 6.294 auf 225 Zeilen reduziert.
- Root-State-Ersetzungen von zehn auf eine Eigentümerfunktion reduziert.
- direkte Schreibstellen in `app.js` von 96 auf null reduziert.
- neun Render-Vorbereitungsnebenwirkungen entfernt; 46 Renderer sind seiteneffektfrei.
- vier alte Einzel-Globals entfernt.
- 37 ungenutzte Kompatibilitätswrapper entfernt.

## Begründet verbleibend

1. 75 Classic-Script-Kompatibilitätswrapper; zentral registriert und regressiv geprüft.
2. Eingefrorene globale Modulnamensräume, solange kein Buildsystem eingeführt werden darf.
3. Direkte Eigenschaftsmutationen innerhalb dokumentierter Owner-/Aktionsmodule; weitere Reduktion nur fachlich paketweise.
4. Brief-, Druck- und Vorschaugestaltung ist inhaltlich unverändert und bleibt AP13.
5. Vollständige Umstellung auf native ES-Module wäre ein eigenes Architekturpaket und ist nicht Bestandteil der aktuellen Grenzen.
