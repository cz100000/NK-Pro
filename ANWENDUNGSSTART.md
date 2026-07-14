# Anwendungsstart

NK-Pro V99.4.22 startet nach jedem vollständigen Anwendungsstart und Browser-Neuladen ohne geöffneten Abrechnungskontext.

1. Die Anwendung lädt und validiert den bestehenden Arbeitsstand.
2. Datenschema 5 und Datenebenenvertrag 1 werden geprüft.
3. Transiente UI-Zustände und der aktive Abrechnungskontext werden zurückgesetzt.
4. Die zentrale Abrechnungsübersicht bleibt erreichbar.
5. Die zehn Abrechnungs-Unterpunkte bleiben sichtbar, sind jedoch bis zu einem ausdrücklichen Bearbeiten- oder Ansehen-Vorgang deaktiviert.
6. Der zuletzt verwendete gültige Arbeitsschritt bleibt als reine UI-Präferenz pro Abrechnung erhalten, öffnet aber keine Abrechnung automatisch.

Der isoliert exportierte Archiv-Viewer ist ein gesonderter, ausdrücklich erzeugter Ansichtsdatensatz und startet deshalb in seinem schreibgeschützten Viewer-Modus.
