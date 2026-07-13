# NK-Pro – Projektstand V99.4.17

**Versionsname:** AP14-Navigationsbereinigung und visuelles UI-System  
**Basis:** Abschlussstand AP13 V99.4.17  
**Datum:** 13. Juli 2026

AP14 ist umgesetzt. Die normale Anwendungsoberfläche verwendet zentral `"Segoe UI", Arial, sans-serif`, das dunkle Navigationssystem bleibt visueller Anker und der helle Arbeitsbereich nutzt ein konsistentes Blau-/Grausystem. Briefvorschau, Druck und PDF bleiben vollständig im AP13-Dokumentmodell und weiterhin in Arial.

Die Navigation enthält nun 17 fachliche Ziele. `Projekt vorbereiten → Zähler` ist ein reiner, deutlich gekennzeichneter Zählerinventar-Clickdummy mit statischen Kacheln und Tabellenwerten. Die bestehende produktive Verbrauchserfassung wurde ohne Funktions- oder Datenverlust nach `Nebenkosten abrechnen → Verbräuche erfassen` verschoben und direkt unter `Manuelle & externe Werte` eingeordnet.

Der bestehende Kopfbereich besitzt rechts die Funktionen Hilfe und Menü mit lokalen SVG-Icons und Textbezeichnungen. Die beiden Startseitenkacheln verwenden exakt die SVG-Motive der zugehörigen Navigationsgruppen. Es wurden keine neuen Hauptbereich-Reiter, keine Zählerpersistenz, keine neuen Verbrauchsberechnungen und keine externen Abhängigkeiten eingeführt.

Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Abrechnungssnapshot 2, Zählerstandards 1 und Dokumentlayoutversion 4 bleiben unverändert.

**Bekannte Einschränkung:** Das Zählerinventar ist absichtlich nur ein statischer DUMMY. Reale Geräte- und Druckertests bleiben außerhalb der automatisierten Browserprüfung.
