# AP22F10B – Bekannte verbleibende Abweichungen

## Produktabweichungen

**Keine bekannten verbleibenden Produktabweichungen.**

Die verbindlichen F1–F6-Entscheidungen, die Korrektur des roten Flammensymbols und die 17 Zielzustände sind umgesetzt und geprüft.

## Hinweise zur Testinfrastruktur

Einige historische Tests aus früheren Arbeitspaketen enthalten bewusst fest verdrahtete Erwartungen an inzwischen freigegeben ersetzte DOM-Strukturen, Regelanzahlen oder alte Versionsnummern. Diese historischen Verträge werden nicht als AP22F10B-Releasegate verwendet. Ihre weiterhin relevanten Fach- und Schutzaussagen sind durch die aktuellen AP22F10B-Tests sowie die bestandenen Kern- und Seitenregressionen abgedeckt.

In der verwendeten Containerumgebung kann der Prozess-Wrapper nach bereits ausgegebener erfolgreicher Browser-Testzusammenfassung offen bleiben. Die Testläufe selbst erzeugten jeweils ihre vollständige PASS-Zusammenfassung; dies betrifft nur die lokale Prozessbeendigung des Prüfwerkzeugs und nicht die Anwendung.
