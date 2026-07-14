# NK-Pro – Technische und fachliche Restpunkte V99.4.21

1. Stammdatenvollständigkeit, Abrechnungsfortschritt, offene Punkte, nächster Schritt, Workflowstatus und Qualitätsverdichtung sind weiterhin bewusst nur Vorschauwerte.
2. Das Zählerinventar ist ausschließlich ein statischer Clickdummy; Datenhaltung und Fachlogik benötigen ein eigenes Folgepaket.
3. Der Gebäudekurzcode ARB5 ist ein verbindlicher Einzelobjekt-Kontext; Mehrgebäudelogik existiert nicht.
4. Reale Druckergebnisse hängen vom Browser-Druckdialog und Druckertreiber ab.
5. Classic-Script-Kompatibilitätswrapper und globale Modulnamensräume bleiben begründet bestehen.
6. Eine Umstellung auf native ES-Module oder ein Buildsystem ist nicht Bestandteil von AP18.
7. Ein tatsächlicher PWA-Installations- und Offline-Neustart auf einem Endgerät muss außerhalb administrativ eingeschränkter Testumgebungen ergänzend geprüft werden.
8. Vereinzelte historisch gewachsene CSS-Bereiche bleiben bestehen; AP18 entfernt nur eindeutig ersetzte oder leere Regeln und vermeidet eine riskante Komplettumschreibung.

AP18 führt keine neue technische Produktionsabhängigkeit und keine Datenschemaänderung ein.
