# NK-Pro – Projektstand V99.4.21

**Versionsname:** AP18-Korrekturen, UI-Feinschliff und UX-Bereinigung  
**Basis:** V99.4.20 / AP17  
**Abschlussbezeichnung:** Änderungen umgesetzt – NK-Pro V99.4.21

## Verbindlicher technischer Stand

- statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript,
- kein React, kein TypeScript, kein Buildsystem,
- Datenschema 5 und Datenebenenvertrag 1 unverändert,
- Objektstandard 1, Abrechnungssnapshot 2 und Dokumentlayout 4 unverändert,
- UI-System 4 und Navigationssystem 5,
- normales UI mit `"Segoe UI", Arial, sans-serif`,
- Briefvorschau, Druck, PDF und Schwarzweißausgabe weiterhin durch AP13-Dokumentlayout 4 isoliert,
- PWA-Cache `nk-pro-v99-4-21-ap18`.

## AP18-Abschluss

NK-PRO verwendet nun ein einheitliches lokales Markenmotiv in Navigation, Favicon und PWA. Der globale Start-Eintrag ist dauerhaft sichtbar. Acht zentrale Aktionsvarianten und 13 explizite Zustandsregelgruppen vereinheitlichen Bedienelemente und Tastaturfokus.

Die Briefvorschau startet mit einer vollständig eingepassten DIN-A4-Seite und bietet Seite, Breite und benutzerdefinierten Zoom. Die Werkzeugleiste ist in Ansicht, Darstellung und Ausgabe gegliedert. Der Zoom beeinflusst ausschließlich die Bildschirmdarstellung.

Kontextleiste, Seitenköpfe, Formulare, Dialoge, Tabellen und Responsive-Regeln wurden konsolidiert. Fachlogik, Arbeitsweiche, AP17-Dashboards, Zähler-DUMMY, Datenschema und AP13-Ausgabe blieben unverändert.

## Fachliche Abgrenzung

Produktive Dashboardwerte, Fortschritt, Empfehlungen, zusätzliche Fachprüfungen, produktive Zählerverwaltung, Mehrgebäude- und Mehrprojektfähigkeit bleiben Folgepaketen vorbehalten.
