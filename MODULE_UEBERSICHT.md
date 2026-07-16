# Modulerweiterung V99.4.24 / AP21A

- `js/ui-individual-values.js`: ausschließlich Rendering und UI-Aufbereitung der gemeinsamen Werteseite.
- Fach- und Persistenzzugriffe verbleiben in den bestehenden Domänen- und Aktionsmodulen.

# NK-Pro – Modulübersicht V99.4.23

Die modulare Struktur aus AP6 bis AP19 bleibt verbindlich. AP20 ergänzt eine zentrale Prüfregel- und Ergebnisquelle ohne externe Laufzeitabhängigkeit.

## AP20-relevante Verantwortlichkeiten

- `js/quality-rules.js`: zentrale Registry, Regelauswertung, Statusmodell, Readiness, Bestätigungsfingerprints
- `js/quality-assurance.js`: kompatibler Adapter für bestehende Aufrufer; keine zweite fachliche Prüfberechnung
- `js/ui-quality.js`: Prüfungscockpit, Detaildialog, Fachseitenzusammenfassungen, Direkteinstiege, Systemdiagnose
- `js/billing-workflow.js`: Finalisierung ausschließlich auf Basis der zentralen Readiness
- `js/document-data.js`: Abnahmeprotokoll und Abschlussaussage aus denselben Ergebnissen
- `js/billing-context.js`: technische Schreibsperre für AP20-Bestätigungsaktionen im Ansichtsmodus
- `js/ui-page-controller.js`: Dashboardstatus aus zentralen Prüfgruppen
- `tools/check-ap20-browser-harness.cjs`: serverlose reale Chromium-Kernprüfung

Datenschema, Datenebenenvertrag, Berechnungsmodule, AP13-Dokumentrenderer und produktive Zählergrenzen werden durch AP20 nicht verändert.
