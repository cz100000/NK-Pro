# AP22F1C – Verbindliche Entscheidungen

## 1. Geschlossene native Dialoge

Die zentrale Regel `.nk-ui-dialog { display:flex; }` darf den nativen geschlossenen Zustand eines `<dialog>` nicht sichtbar machen. Produktive native Dialoge mit der zentralen Klasse werden deshalb über den Zustand `:not([open])` explizit ausgeblendet. Es wird weder Dialog-Markup noch Öffnungs-/Schließlogik geändert.

## 2. Versionsanzeige in der Navigation

Die sichtbare Versionsangabe in der linken Navigation besitzt ein deklaratives Bindungsziel `[data-app-version]`. Der angezeigte Wert wird bei der bereits bestehenden zentralen UI-Aktualisierung aus `APP_VERSION` gesetzt. Der im HTML vorhandene Text bleibt nur ein startfähiger Fallback und entspricht dem aktuellen Release.

## 3. Schutzumfang

Die Korrektur verändert keine Navigationseinträge, keine Kontextleiste, keine Fach- oder Speicherfunktion und keine Dialoginteraktion. Bestehende Regressionstestdateien bleiben unverändert; AP22F1C erhält separate statische und browserbasierte Tests.
