# AP15 – Dateiänderungen und Bereinigung

## Ausgangsbestand

- Dateien: 223
- entpackte Größe: 4.583.574 Byte
- Ausgangs-ZIP: 1.963.493 Byte

## Entfernte Gruppen

Insgesamt wurden 91 Dateien des Ausgangsbestands entfernt. Entfernt wurden historische AP-Berichte und Inventare, historische Screenshots/Referenzbilder, generierte AP13-Kontroll-PDFs, überholte Übergabe- und Doppeldokumente sowie das nicht mehr benötigte Kontrollausgabe-Erzeugungswerkzeug. Vor der Entfernung wurden produktive HTML-/CSS-/JavaScript-Referenzen, Service-Worker-App-Shell, Tests, Migration/Persistenz und Dokumentverweise geprüft.

## Bewusst erhalten

`AP9_BASELINE_INVENTORY.json` bleibt trotz historischer Bezeichnung enthalten, weil `tests/ap9-core-orchestration.test.cjs` diese Baseline direkt für die aktuelle Architekturregression verwendet. Produktiver Code, PWA-Ressourcen, aktuelle Tests, Datenverträge und aktuelle technische Dokumentation bleiben vollständig enthalten.

## Neu oder wesentlich geändert

- zentrale transiente UI-Bereinigung
- sicherer Rückkehrpfad nach Import, Restore und Rollback
- gehärteter Service Worker und Cachewechsel auf V99.4.18
- serieller, reproduzierbarer Browser-Freigabepfad
- AP15-Integrations- und Service-Worker-Regressionstests
- automatisierte, nicht löschende ZIP-Inhaltsprüfung
- aktuelle AP15-Release- und Übergabedokumentation

Die finalen Größen- und Dateizahlen werden im Abschlussbericht und in `AP15_TEST_RESULTS.json` maschinenlesbar festgehalten.

<!-- FINAL_METRICS:START -->
## Finale Bestandszahlen

- Ausgangsbestand: 223 Dateien. 4.583.574 Byte entpackt. 1.963.493 Byte als ZIP
- Finaler Bestand: 144 Dateien. 2.256.006 Byte entpackt. 532.806 Byte als ZIP
- Entfernte Ausgangsdateien: 91
- Neu hinzugefügte AP15-Dateien: 12
- Netto-Dateireduktion: 79
<!-- FINAL_METRICS:END -->
