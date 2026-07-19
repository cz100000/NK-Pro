# AP22F10D Korrektur 2 – Umsetzungsbericht

## Änderungen
- Stift der aktuellen Abrechnung: `Abrechnung bearbeiten` → `billing.openCurrentEdit`.
- Neues Kalendersymbol: `Abrechnungszeitraum ändern` → `billing.openPeriodEditor`.
- Auge: eindeutige Bezeichnung `Abrechnung ansehen`.
- Archivierte Abrechnung: eigene Aktion `Korrektur der archivierten Abrechnung starten`.
- Speicherfehler werden als Speicher-voll, Zugriff-blockiert, nicht-lesbarer Datensatz oder interner Speicherfehler klassifiziert.
- Wiederholte Browser-Alert-Schleifen wurden entfernt.
- Systemhinweis enthält direkte Aktionen für Gesamt-JSON und Datensicherung.

## Prüfstand
- JavaScript-Syntax: bestanden.
- Referenzdaten/Fixtures: bestanden.
- AP22F10D-Korrektur-2-Statik- und Aktionsverdrahtung: bestanden.
- Browserlauf: in der Ausführungsumgebung nicht abschließbar, weil Chromium während des Starts durch System-/GPU-/Inotify-Beschränkungen beendet wurde. Daher ist dieses Paket als technisch geprüfter Releasekandidat zu behandeln; die Sicht- und Klickprüfung im Zielbrowser bleibt erforderlich.
