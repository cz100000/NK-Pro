# AP15 – Prüfbericht

## Geprüfter Ausgangsstand

Die hochgeladene Arbeits-ZIP wurde vollständig entpackt und inventarisiert. Bestätigt wurden NK-Pro V99.4.17, AP14 – Navigationsbereinigung und visuelles UI-System, Datenschema 5, Datenebenenvertrag 1 und Cache `nk-pro-v99-4-17-ap14`. Der Ausgangsbestand umfasste 223 Dateien, 4.583.574 Byte entpackt und 1.963.493 Byte als ZIP.

## Bestands- und Referenzprüfung

Geprüft wurden Einstiegspunkte, 50 produktive Skripte, zentrales CSS, Manifest, Service Worker, Icons, Daten-/Migrations-/Persistenzmodule, aktuelle Tests und Dokumentation. Dateien wurden nicht anhand ihres Namens allein entfernt. Produktive Referenzen, dynamische Ladevorgänge, App-Shell, Tests und aktuelle Dokumentverweise wurden berücksichtigt.

## Gefundene und behobene Fehler

1. Offene Dialoge, Kopfmenüs und rein visuelle Kosten-Auswahlzustände konnten bei Kontextwechseln bestehen bleiben. Ein zentraler, fachlich neutraler Reset behebt dies.
2. Import, Restore und Rollback konnten sichtbare UI-Reste des zuvor geöffneten Kontexts belassen. Nach erfolgreicher Datenübernahme wird nun ein bereinigter Startzustand hergestellt.
3. Der Service Worker löschte bei Aktivierung alle fremden Caches derselben Origin. Die Bereinigung ist nun auf Caches mit Prefix `nk-pro-` begrenzt.
4. Laufzeitcaching war nicht ausdrücklich auf erfolgreiche Same-Origin-Antworten begrenzt. Diese Grenzen sind nun verbindlich.
5. Der parallele Browser-Gesamtlauf war in ressourcenbegrenzter Umgebung instabil, obwohl betroffene Tests seriell bestanden. Die Freigabekonfiguration läuft nun vollständig seriell.

## Regression und Fachgrenzen

Datenschema, Datenebenenvertrag, Objektstandard, Snapshots, Migration, Persistenz, Archiv, Sicherung, Restore, Rollback und Recovery bleiben erhalten. Zähler bleibt DUMMY; Verbrauchserfassung bleibt produktiv. Das AP13-Brief-/Druckmodell und das AP14-UI-System wurden nicht neugestaltet.

## PWA und Offline

Cachekennung, Manifest, sichtbare Version und Projektmetadaten wurden auf V99.4.18 vereinheitlicht. App-Shell-Ressourcen, Cacheaktivierung, fremde Cacheerhaltung, Online-/Offlineantworten und Navigationsfallback werden automatisiert geprüft.

## Bereinigung

91 Dateien des Ausgangsbestands wurden nach Nutzungsprüfung entfernt. Entfernte Gruppen: historische AP-Nachweise, Screenshots/visuelle Referenzen, generierte Kontroll-PDFs, überholte Übergabedokumente und ein nicht mehr erforderliches Generatorwerkzeug. `AP9_BASELINE_INVENTORY.json` bleibt als direkte aktuelle Testabhängigkeit erhalten.

## Bekannte Einschränkungen

Die Zählerverwaltung ist weiterhin bewusst nicht fachlich implementiert. Physische Druckergebnisse und die Installation auf konkreten Endgeräten können nur in der jeweiligen Zielumgebung abschließend visuell bestätigt werden; das gemeinsame Dokumentmodell, Druck-CSS und Service-Worker-Verhalten sind automatisiert regressionsgeprüft.

## Freigabestatus

Der Arbeitsbestand hat sämtliche statischen und fachlichen Prüfungen bestanden. Der serielle Browserlauf umfasste 74 Tests: 71 bestanden, 3 optionale Referenz-/Loopbacktests wurden erwartungsgemäß übersprungen, 0 Tests sind fehlgeschlagen. Die drei optionalen Tests erzeugen historische visuelle Referenzen beziehungsweise benötigen einen administrativ freigegebenen Loopback-PWA-Start.

Die reale installierte PWA auf einem konkreten Endgerät und ein physischer Drucker bleiben manuelle Umgebungsprüfungen. Service-Worker-Installation, Aktivierung, App-Shell, Cachewechsel, Erhalt fremder Caches, Onlinecaching und Offlinefallback sind automatisiert bestanden.

Die abschließende Prüfung aus einer frisch entpackten ZIP wird nach Erstellung des Releasekandidaten protokolliert.

<!-- FINAL_METRICS:START -->
## Finale Bestandszahlen

- Ausgangsbestand: 223 Dateien. 4.583.574 Byte entpackt. 1.963.493 Byte als ZIP
- Finaler Bestand: 144 Dateien. 2.256.006 Byte entpackt. 532.806 Byte als ZIP
- Entfernte Ausgangsdateien: 91
- Neu hinzugefügte AP15-Dateien: 12
- Netto-Dateireduktion: 79
<!-- FINAL_METRICS:END -->
