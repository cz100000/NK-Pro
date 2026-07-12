# UI-Controller-Übersicht – V99.4.8

`NKProUiController` registriert 13 Controller mit insgesamt 99 eindeutigen Aktionen. Die Registry kennt weder DOM noch Persistenz und führt ausschließlich die in `NKProUiBindings` hinterlegten Adapter aus.

| Controller | Aktionen | Verantwortung |
|---|---:|---|
| `application` | 2 | Speichern und Reset über bestehende Anwendungsdienste |
| `navigation` | 6 | Tabwechsel, Arbeitskontext und Öffnen definierter Abschnitte |
| `state` | 1 | kontrollierte generische Änderung im bestehenden Einzelzustand |
| `object` | 6 | Objekt-, Wohnungs- und Mieterstammdaten |
| `cost` | 21 | Kostenerfassung, Auswahl, Detailzuordnung und Preisdialog |
| `billing` | 20 | Abrechnungslebenszyklus, Perioden, manuelle Werte und Vorauszahlungen |
| `quality` | 6 | Prüfinteraktion ohne parallele Berechnung |
| `meter` | 3 | UI-Adapter auf AP5-Zähler-, Messwert- und Messperiodendienste |
| `document` | 5 | Briefdaten, Dokumentrendering, Vorschau und Druck |
| `export` | 9 | direkte Anbindung an `NKProExportService` |
| `archive` | 7 | Archivansicht, Validierung, Download und Wiederbearbeitung |
| `recovery` | 5 | Import, Vor-Migrationssicherung, Restore und Rollback |
| `system` | 8 | Selbsttest, Diagnose, Release-Audit, Reload und Browserdruck |

## Regeln

- Controlleraktionen besitzen eindeutige, fachlich lesbare Namen wie `meter.setWaterValue` oder `export.downloadBillingPackage`.
- Doppelte Aktionsnamen werden beim Start als Fehler abgewiesen.
- Unbekannte Aktionen werden nicht stillschweigend ausgeführt.
- Controller enthalten keine parallele Fachberechnung.
- Fachmodule werden nicht vom DOM abhängig gemacht.
- Exportaktionen greifen direkt auf den bestehenden Exportdienst zu.
- UI-spezifische Navigation und Abschnittsöffnung verbleiben in der UI-Schicht.
