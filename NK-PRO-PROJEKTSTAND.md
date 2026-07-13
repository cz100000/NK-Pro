# NK-Pro – Projektstand V99.4.20

**Versionsname:** AP17-Bereichs-Dashboards, Navigationslogik und UI-Bereinigung  
**Basis:** AP16-Korrekturstand V99.4.19 „Mockupnahe UI“  
**Abschlussbezeichnung:** Änderungen umgesetzt – NK-Pro V99.4.20

## Verbindlicher technischer Stand

- statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript,
- kein React, kein TypeScript, kein Buildsystem,
- Datenschema 5 und Datenebenenvertrag 1 unverändert,
- Objektstandard 1, Abrechnungssnapshot 2 und Dokumentlayout 4 unverändert,
- normales UI mit `"Segoe UI", Arial, sans-serif`,
- Briefvorschau, Druck, PDF und Schwarzweißausgabe weiterhin AP13-isoliert,
- PWA-Cache `nk-pro-v99-4-20-ap17`.

## AP17-Abschluss

Die Arbeitsweiche bleibt unverändert. Hinter „Objekt vorbereiten“ und „Nebenkosten abrechnen“ stehen zwei neue schlanke Substartseiten. Reale Datenpunkte und fiktive Vorschauwerte sind technisch und visuell getrennt. Der frühere Sidebar-Block „Aktive Abrechnung“ wurde durch eine flache globale Kontextleiste ersetzt. Navigationsgruppen lassen sich unabhängig öffnen und schließen; direkte Seitenaufrufe öffnen die zugehörige Gruppe automatisch.

Generische Karten wurden auf Bearbeitungsseiten entfernt. Fachliche Status-, Fortschritts- und Workflowinformationen liegen primär auf den beiden Bereichsübersichten. Klappboxen und Abrechnungsnavigation verwenden einheitliche lokale Inline-SVGs.

## Fachliche Abgrenzung

- `Objekt vorbereiten → Zähler` bleibt ausschließlich ein statischer DUMMY.
- Die 15 als Vorschau markierten Dashboardwerte besitzen noch keine produktive Fachlogik.
- Gebäudekurzcode ARB5 bleibt der verbindliche Einzelobjekt-Kontext.
- Berechnungs-, Abrechnungs-, Verbrauchs-, Daten-, Brief-, Druck-, PDF- und Schwarzweißlogik wurden nicht verändert.
