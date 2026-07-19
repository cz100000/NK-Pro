# AP22F11B Korrektur 2 – Datenmigrationen

## Datenschema

Keine Änderung. Das Datenschema bleibt bei Version `5`.

## Neue optionale Einstellungen

Beim erstmaligen Öffnen der Vorauszahlungsanpassung werden fehlende optionale Einstellungen mit neutralen Standardwerten ergänzt:

- `priceForecastEnabled: "Nein"`
- `generalPriceChangePercent: 0`
- `priceForecastByCost: {}`

Die Preisprognose ist damit für Altbestände zunächst deaktiviert. Ohne bewusste Aktivierung verändert sie kein Berechnungsergebnis.

## Navigationspräferenz

Der Schlüssel für gespeicherte Klappzustände der Navigation wurde auf `nkpro.workflowNavigation.v7` angehoben. Vorhandene Zustände aus v5/v6 werden übernommen; die neuen Gruppen „Analyse“ und „Archiv“ werden bei der Übernahme sichtbar geöffnet. Dies betrifft ausschließlich UI-Präferenzen, nicht den Abrechnungsdatenbestand.

## Fach- und Archivdaten

Es werden keine Wohnungen, Mietverhältnisse, Kostenarten, Vorauszahlungen, Wasserstände, manuellen Werte, Prüfentscheidungen oder Archive migriert beziehungsweise umgeschrieben.
