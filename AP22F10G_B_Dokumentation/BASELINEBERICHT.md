# AP22F10G-B – Baselinebericht V99.4.52

## Integrität

Die Ausgangs-ZIP `NK-Pro_V99_4_52_AP22F10E_Korrektur1_Loeschen.zip` wurde vollständig entpackt und mit `unzip -t` geprüft. Ergebnis: **keine Fehler im komprimierten Datenbestand**.

Die Planungs-ZIP AP22F10G-A wurde ebenfalls ohne Fehler geprüft.

## Unveränderte Baseline-Tests

Vor Beginn der Umsetzung wurden die vorhandenen Testgruppen auf dem unveränderten Stand V99.4.52 ausgeführt. Folgende Abweichungen waren bereits in der Ausgangsbasis vorhanden:

| Testgruppe | Vorbestehende Abweichung |
|---|---|
| AP22F10B Schutzprüfung | Veralteter Soll-Hash für `js/app-state-persistence.js` |
| Architekturprüfung | Direkte Speicherzugriffe wurden für `app-state-persistence.js`, `persistence.js` und `ui-preferences.js` beanstandet |
| AP22E Inhaltsprüfung | Fest codierte Erwartung Version 99.4.33 statt tatsächlicher 99.4.52 |
| AP20 Assetprüfung | Erwarteter Versionsparameter für `ui-bindings.js` fehlte |
| Inhaltsmanifest SHA256 | 12 vorhandene Dateien stimmten nicht mit dem alten Manifest überein |

Diese Punkte wurden nicht durch AP22F10G-B verursacht. Sie betreffen historische Schutz- beziehungsweise Versionsannahmen der Basis. Für AP22F10G-B wurden deshalb eigenständige statische und reale Browserprüfungen ergänzt. Die produktive Release-Inhaltsprüfung des finalen Stands ist bestanden.

## Nicht verwendete Stände

AP22F10F und V99.4.53 bis V99.4.57 wurden nicht entpackt oder als technische Quelle in den Arbeitsstand übernommen. Die reale V99.4.55-JSON wurde ausschließlich als Nutzdatenreferenz geladen.
