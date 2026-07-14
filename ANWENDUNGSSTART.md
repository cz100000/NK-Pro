# Anwendungsstart

NK-Pro V99.4.23 startet nach jedem vollständigen Anwendungsstart und Browser-Neuladen ohne geöffneten Abrechnungskontext.

1. Die Anwendung lädt und validiert den bestehenden Arbeitsstand.
2. Datenschema 5 und Datenebenenvertrag 1 werden geprüft.
3. Transiente UI-Zustände und der aktive AP19-Abrechnungskontext werden zurückgesetzt.
4. Die zentrale Abrechnungsübersicht bleibt erreichbar.
5. Die zehn Abrechnungs-Unterpunkte bleiben sichtbar, sind jedoch bis zu einem ausdrücklichen Bearbeiten- oder Ansehen-Vorgang deaktiviert.
6. Nach dem Öffnen einer Abrechnung erzeugt AP20 die zentralen Prüfergebnisse für Dashboard, Fachseiten, Cockpit, Abschluss und Abnahmeprotokoll.
7. Der zuletzt verwendete gültige Arbeitsschritt bleibt als reine UI-Präferenz pro Abrechnung erhalten, öffnet aber keine Abrechnung automatisch.

Der isoliert exportierte Archiv-Viewer ist ein gesonderter, ausdrücklich erzeugter Ansichtsdatensatz und startet deshalb in seinem schreibgeschützten Viewer-Modus. Prüfbestätigungen sind dort ebenfalls gesperrt.
