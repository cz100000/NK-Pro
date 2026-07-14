# AP20 – Korrekturstand 1: Datenstart bei rückläufigem Zählerstand

## Anlass

Ein vorhandener Datensatz mit einem Zählerendstand unter dem Anfangsstand und ohne dokumentierten Überlauf führte beim Browserneustart zu einem vollständigen Abbruch der Dateninitialisierung. Die Daten blieben zwar im Browser gespeichert, die Anwendung öffnete jedoch den leeren Fallback-Zustand.

## Korrektur

- `METER_READING_REVERSED` bleibt eine fachlich relevante Zählerprüfung, ist aber kein fataler Migrationsfehler mehr.
- Die Zählerstandard-Migration lädt den Datensatz vollständig und liefert die Auffälligkeit als `startupSafeFindings` zurück.
- Echte strukturelle Zählerfehler bleiben weiterhin startblockierend.
- `NKP-PLAU-005` wertet jetzt primär `zaehlerDaten.messperioden` aus und verwendet `waterMeters.readings` nur noch als Legacy-Fallback.
- Die Detaildaten enthalten Zählerkennung, Messperiode, Zeitraum, Anfangsstand, Endstand, Verbrauch und Einheit.
- Der Service-Worker-Cache wurde auf `nk-pro-v99-4-23-ap20-corr1` angehoben, damit Browser die korrigierten JavaScript-Dateien sicher übernehmen.

## Daten- und Versionsvertrag

- Anwendungsversion: V99.4.23
- Datenschema: 5
- Datenebenenvertrag: 1
- Abrechnungs- und Umlageformeln: unverändert
- Bestehende gespeicherte Daten: werden nicht gelöscht oder automatisch fachlich verändert

## Regression

Der Zählerdomänentest enthält nun einen rückläufigen Messwert und bestätigt:

1. Die fachliche Validierung erkennt `METER_READING_REVERSED` weiterhin.
2. `migrateMeteringData()` liefert nicht mehr `failed`.
3. Die auffällige Messperiode bleibt unverändert im geladenen Datensatz erhalten.
4. Die zentrale Prüfregel kann den Punkt anschließend als „Zu prüfen“ darstellen.
