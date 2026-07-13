# NK-Pro – Modulübersicht V99.4.18

Die modulare Struktur aus AP6 bis AP12 bleibt verbindlich. AP13 stellt das gemeinsame Brief-/Druckmodell bereit, AP14 das visuelle UI-System. AP15 ergänzt keine neue Fachschicht.

## AP15-relevante Verantwortlichkeiten

- `js/ui-navigation-pages.js`: Navigation, Seitenkontext und zentraler Reset transienter UI-Zustände
- `js/ui-costs.js`: ausschließlich kostenbezogene UI-Auswahl-, Such-, Paging- und Dialogzustände
- `js/browser-io.js`: Import/Export sowie dokumentbezogene Browserausgabe
- `js/app-state-persistence.js`: Sicherung, Restore, Rollback und Recovery-Orchestrierung
- `service-worker.js`: App-Shell, Offline-Navigation und versionsgebundene NK-Pro-Cachepflege
- `tools/check-release-contents.cjs`: kontrollierbare Inhaltsprüfung ohne automatische Löschung
- `tools/check-release-consistency.cjs`: Versions-, Ressourcen-, Architektur-, Dokumentations- und Prüfsummenfreigabe

Produktive Modulgrenzen, Datenverträge und globale Kompatibilitätsoberflächen werden durch AP15 nicht erweitert.
