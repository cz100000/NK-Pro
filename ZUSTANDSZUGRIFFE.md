# Zustandszugriffe – V99.4.8

## Verbindlicher Zustand

NK-Pro besitzt weiterhin genau einen veränderlichen Arbeitszustand `state`. AP7 führt keinen zweiten Store, keine Kopie als UI-Zustand und kein Framework-State-Management ein.

## Zugriffsebenen

1. DOM-Ereignisse werden durch `NKProUiEvents` erfasst.
2. `NKProUiController` ordnet die Aktion einem Controller zu.
3. `NKProUiBindings` ruft die bestehende Anwendungsfunktion oder den vorhandenen Fach-/Exportdienst auf.
4. Änderungen werden über den bestehenden Commit- und Persistenzpfad abgeschlossen.
5. Renderer erhalten den aktuellen Zustand oder definierte Berechnungs-/Dokumentergebnisse.

`NKProStateAccess` kapselt die Adapter `current`, `select`, `replace` und `update`. Der Adapter kann den bestehenden Zustand ersetzen und Änderungen über `commitStateChange` abschließen.

## Schreibzugriffe

Direkte Schreibzugriffe aus HTML, Inline-Handlern und den früheren sechs `app.js`-Listenern wurden vollständig entfernt. Bestehende Anwendungsfunktionen ändern intern weiterhin `state`; sie sind nun ausschließlich über benannte Controlleraktionen erreichbar. Eine vollständige Ausgliederung dieser Orchestrierungsfunktionen ist nicht Bestandteil von AP7 und bleibt als technische Altlast dokumentiert.

## Persistenzgrenze

Nur `js/persistence.js` und `js/ui-preferences.js` greifen direkt auf `localStorage` zu. Fachliche UI-Aktionen, Renderer, Controller und Fachmodule besitzen keinen eigenen Speicherweg. UI-Präferenzen bleiben getrennt von Fachdaten.
