# NK-Pro – Projektstand V99.4.18

**Versionsname:** AP15-Gesamtintegration, Releasehärtung und schlanke Arbeitsbasis  
**Basis:** vollständiger Abschlussstand AP14 V99.4.17  
**Abschlussbezeichnung:** Änderungen umgesetzt – NK-Pro V99.4.18

## Verbindlicher technischer Stand

- Statische lokale Browseranwendung und PWA aus HTML, CSS und JavaScript
- kein React, kein TypeScript, kein Buildsystem
- Datenschema 5 und Datenebenenvertrag 1 unverändert
- Objektstandard 1, Abrechnungssnapshot 2 und Dokumentlayout 4 unverändert
- normales UI mit `"Segoe UI", Arial, sans-serif`
- Briefvorschau, Druck und Dokumentausgabe weiterhin in Arial
- PWA-Cache `nk-pro-v99-4-18-ap15`

## AP15-Abschluss

Der reale Bedien- und Abrechnungsablauf wurde zusammenhängend geprüft. Verbliebene transiente Dialog-, Kopfmenü- und Kosten-Auswahlzustände werden an Kontextgrenzen zentral bereinigt. Import, Restore und Rollback führen in einen klaren Startzustand zurück. Der Service Worker löscht nur alte NK-Pro-Caches, beschränkt Laufzeitcaching auf erfolgreiche Same-Origin-Antworten und liefert Navigation offline aus dem App-Shell-Cache.

Die Arbeitsbasis wurde nach Referenz- und Nutzungsprüfung entschlackt. Produktiver Code, Ressourcen, Datenverträge, Migrationen, Import/Export, Restore, aktuelle Tests und verbindliche Dokumentation bleiben enthalten. Historische Nachweise und generierte Kontrollartefakte gehören nicht mehr in die technische Arbeits-ZIP.

## Fachliche Abgrenzung

- `Projekt vorbereiten → Zähler` bleibt ausschließlich ein statischer DUMMY.
- `Nebenkosten abrechnen → Verbräuche erfassen` bleibt die produktive Erfassung.
- AP15 führt keine neue Zählerverwaltung, Berechnungsart oder Hauptnavigation ein.
- Das AP13-Briefsystem und das AP14-UI-System wurden nur regressionsgeprüft.
