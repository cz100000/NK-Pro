# AP20 – Korrekturstand 3: erzwungene Asset-Aktualisierung

## Fehlerbild

Im Browser konnte nach dem Austausch der Projektdateien weiterhin eine ältere Zählerlogik aktiv sein. Dadurch stand im Eingabefeld bereits `297,74`, während die Ergebniszelle noch aus dem zuvor falsch gespeicherten Wert `29774` den Verbrauch `29.508` berechnete.

## Ursache

HTML, Service Worker und JavaScript-Assets konnten während eines Updatezyklus aus unterschiedlichen Cachegenerationen stammen. Der mathematische Parser aus Korrekturstand 2 war korrekt, wurde in diesem Laufzeitmix aber nicht ausgeführt.

## Korrektur

- Build-ID `99.4.23-ap20-corr3` für die kritischen Zählerassets.
- Service-Worker-Cache `nk-pro-v99-4-23-ap20-corr3`.
- Registrierung mit `updateViaCache: "none"`.
- explizites `registration.update()`.
- `skipWaiting`, `clients.claim()` und einmaliger Reload nach `controllerchange`.
- Reload-Schleifenschutz über Session Storage.
- unversionierte Offlinepfade bleiben zusätzlich erhalten.

## Fachliche Wirkung

Es erfolgt keine automatische Datenkorrektur. Ein historisch falsch gespeicherter Wert wird erst durch eine bewusste Nutzereingabe ersetzt. Der Referenzfall `266 → 297,74` ergibt live und nach Speicherung `31,74 m³`. Datenschema 5 und Datenebenenvertrag 1 bleiben unverändert.
