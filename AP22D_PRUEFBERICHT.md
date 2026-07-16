# AP22D – Prüfbericht

## Technische Release-Prüfung

- 55 JavaScript-Einheiten syntaktisch fehlerfrei.
- 6 Referenzfälle semantisch unverändert.
- Zählerstandard, Zählerstart- und Zählerberechnungsregression bestanden.
- 7 aktuelle Architektur-, Modul-, Regel- und Navigationsstrukturprüfungen bestanden.
- AP21C-Struktur- und Kompatibilitätsprüfung bestanden.
- Separater AP22D-Struktur-, Versions-, Dialog- und Zustandsprüfung bestanden.
- Release-Inhaltsprüfung bestanden; installierte Abhängigkeiten und generierte Testartefakte sind vom Release ausgeschlossen.

## AP22D-Browserprüfung

Der separate AP22D-Chromium-Test startet die vollständige Anwendung und prüft:

- zentrale Dialog-API `NKProUIDesignSystem.dialog`,
- Öffnen und Schließen der fünf kontrolliert migrierten produktiven Dialoge,
- initiale Fokusführung, Fokusfalle und Fokusrückgabe,
- Escape- und Hintergrundklick-Regeln,
- vollständige Tastaturbedienung,
- primäre, sekundäre und destruktive Aktionen,
- besonders geschützten Löschdialog ohne unbeabsichtigtes Schließen,
- die sieben zentralen Inhaltszustände `no-data`, `not-created`, `filtered`, `loading`, `error`, `not-applicable` und `unavailable`,
- dynamisch nachgeladene Dialog- und Zustandsinhalte,
- leere Such- und Filterergebnisse,
- responsive Dialogdarstellung,
- ausdrücklichen Ausschluss von Brief-, Druck- und Dokumentbereichen,
- vollständigen Anwendungsstart ohne Konsolen-, Seiten- oder Ladefehler.

Ergebnis: **1 von 1 AP22D-Browsertests bestanden**.

## Vollständige aktuelle Browserregression

Die aktuelle, für V99.4.32 geeignete Regression wurde wegen Begrenzungen der Ausführungsumgebung in getrennten vollständigen Projektläufen ausgeführt. Bestanden sind:

- 2 Dokument-/Exporttests,
- 6 Migrations-/Restoretests,
- 1 Modulgrenzentest,
- 2 UI-Controller-/Ereignistests,
- 5 Persistenz-/Backup-/Archivtests,
- 6 Referenzfalltests,
- 5 AP10-Orchestrierungstests,
- 1 AP12-Orchestrierungstest,
- 8 AP13-Brief-/Drucklayouttests,
- 5 AP19-Abrechnungskontexttests,
- 5 AP20-Prüfsystemtests,
- 3 AP21B2-Navigationszentralisierungstests,
- 1 AP22D-Dialog-/Zustandstest.

Ergebnis: **50 von 50 aktuellen Browsertests bestanden**. Zusätzlich bestanden **9 von 9 Objektstandard-/Snapshottests**.

## Änderungskontrolle

- Produktdateien: 10 und damit innerhalb der verbindlichen Obergrenze.
- Bestehende Regressionstestdateien: unverändert.
- Neue Anforderungen: ausschließlich in separaten AP22D-Tests abgesichert.
- `SHA256SUMS.txt`: nach ausdrücklicher Nutzerfreigabe als zusätzliche Release-Integritätsdatei vollständig neu erzeugt.
- Nicht berührt: Fachlogik, Berechnungen, Datenmodell, Persistenzlogik, Migration, Backup, Restore, Archiv, Navigation, Abrechnungskontext, Briefe, Druck, PDF, Import, Export und bestehende fachliche Prüfregeln.

## Dokumentierter Konflikt im übernommenen Testbestand

Die Forderung, ausnahmslos alle historischen Tests unverändert erfolgreich auszuführen, ist mit dem übernommenen AP22C-Ausgangsstand technisch nicht erfüllbar. Eine Kontrollausführung im unveränderten Ausgangsstand V99.4.31 ergab bereits **14 fehlschlagende statische Altprüfungen**. Diese enthalten fest verdrahtete frühere Versions-, Build-, Asset- oder Navigationsanforderungen, unter anderem V99.4.24 und die Navigation vor AP21B2.

Nach der regulären Versionsanhebung auf V99.4.32 wird zusätzlich der versionsgebundene AP22C-Test erwartungsgemäß historisch; damit sind 15 unveränderte statische Altprüfungen nicht gegen den aktuellen Release ausführbar. Stichproben der älteren Browserprojekte bestätigen denselben Befund: `app-smoke`, `service-worker` und `ap11-navigation` prüfen ausdrücklich frühere Versionen oder die abgelöste Navigationsstruktur. Diese Dateien wurden gemäß Änderungs-Kontrollregel nicht angepasst. Es wurde kein neuer fachlicher oder technischer Regressionsfehler festgestellt.

## Release-Abnahme

- SHA-256-Prüfung des vollständigen Releasebestands bestanden.
- Release-ZIP neu erzeugt und in ein leeres Verzeichnis entpackt.
- Abhängigkeiten aus dem entpackten Stand installiert.
- Vollständiges AP22D-Release-Gate aus dem entpackten Stand bestanden.
- Vollständiger AP22D-Chromium-Anwendungsstart aus dem entpackten Release bestanden.
