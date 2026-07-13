# NK-Pro – Projektstand V99.4.17

**Versionsname:** Brieflayout, Druckbild und Vorschaukonsistenz  
**Basis:** V99.4.13  
**Datum:** 13. Juli 2026

AP13 ist umgesetzt. Die Nebenkostenabrechnung wird durch einen gemeinsamen Renderer als vollständiges DIN-A4-Dokument erzeugt. Vorschau, Druckfenster und PDF verwenden dasselbe HTML und dasselbe Basis-Stylesheet. Die Vorschau skaliert nur die vollständigen Seiten und erzeugt keine eigenen Umbrüche.

Die Haupttabelle besitzt neun Spalten, enthält die Vorauszahlungen und weist sämtliche inneren Trennlinien aus. Seite 2 entsteht ausschließlich bei zusätzlichem Hinweistext und/oder einer auszugebenden Vorauszahlungsanpassung. Briefkopf und Informationsblock werden dort identisch wiederholt. Gruß, Unterschrift und Anlagenhinweis erscheinen genau einmal am tatsächlichen Dokumentende.

Datenschema 5, Datenebenenvertrag 1, Objektstandard 1, Abrechnungssnapshot 2, Zählerstandards 1, fachliche Berechnungen, Rundungen und Vorzeichenlogik bleiben unverändert. Die AP12-Modulgrenzen und die korrigierte AP11-Navigation bestehen fort.

**Nächster Schritt:** Noch nicht festgelegt; zunächst produktive Sichtprüfung von V99.4.17.
