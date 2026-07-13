# AP10 – Qualitäts- und Diagnosekonzept

## Qualität

`NKProQualityAssurance.inspect()` koordiniert vorhandene Fachvalidierungen auf einer tiefen Zustandskopie. Ergebnisse besitzen stabile `QUALITY_*`-Codes und die Schweregrade `Fehler`, `Prüfen`, `Hinweis` und `OK`. Die Prüfung korrigiert keine Daten, speichert nicht, rendert nicht und öffnet keine UI.

Zusätzliche lesende APIs: `specialCases()`, `finalBillingReadiness()`, Mieterintervall-, Briefvollständigkeits- und Überschneidungshelfer.

## Diagnose

`NKProDiagnostics` trennt Release-Audit, App-Selbsttest und Laufzeitstatus von produktiven Aktionen. Audits, die Testdaten benötigen, laufen in `withAuditState()` innerhalb einer bereits isolierten Zustandskopie. Der frühere LocalStorage-Schreibtest wurde durch eine lesende Adapterverfügbarkeitsprüfung ersetzt. Diagnose erzeugt weder Archive/Snapshots noch Commit, Persistenz oder Rendering.

## Reproduzierbarkeit

Identische Eingaben liefern dieselben strukturierten Codes. Zeit- oder Dateiangaben werden nur in Berichtstexten verwendet; Fachzustand und Speicher werden vor/nach dem Lauf byteweise als JSON verglichen.
