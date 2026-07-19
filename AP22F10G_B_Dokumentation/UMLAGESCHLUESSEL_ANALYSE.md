# AP22F10G-B – Analyse der Umlageschlüssel

## Entscheidungsregel

Eine Kostenart erscheint unter „Individuelle Werte“ nur, wenn sie aktiv und abrechnungsrelevant ist und ihre Verteilungsart eine individuelle Erfassung benötigt.

| Kategorie | Erkennungsregel | Darstellung auf „Individuelle Werte“ |
|---|---|---|
| Verbrauch | `umlageschluessel = Verbrauch` | Eigener Verbrauchs-/Zählerbereich |
| Manuell | Umlageschlüssel oder Berechnungsart enthält „manuell“, „individuell“ oder „direkter Eurobetrag“ | Eigener Bereich je regulärem Abrechnungsfall |
| Automatisch | alle übrigen aktiven Schlüssel | Kein Eingabebereich |
| Inaktiv | `inNK != Ja`, fehlende ID/Bezeichnung oder Ausschlussstatus | Kein Eingabebereich |

## In der realen Testreferenz vorhandene Schlüssel

| Kostenart | Aktiv | Umlageschlüssel | Ergebnis |
|---|---:|---|---|
| Wasserversorgung | Ja | Verbrauch | Verbrauchsbereich aus den zugeordneten Kalt- und Warmwasserzählern |
| Heiz- und Warmwasserkosten | Ja | Manuelle Eingabe je Mieter/Wohneinheit | Manueller Kostenartenbereich |
| Müllbeseitigung | Ja | Verteilung nur auf aktive Wohneinheiten | Kein Bereich; automatische Verteilung |
| übrige Kostenarten | Nein beziehungsweise Entfällt | Entfällt | Kein Bereich |

## Automatische Schlüssel

Automatische Schlüssel wie Wohnfläche, Personen, Miettage, Einheiten oder „Verteilung nur auf aktive Wohneinheiten“ benötigen auf dieser Seite keine Einzelwerte. Ihre Berechnungsgrundlagen stammen aus Stammdaten beziehungsweise der vorhandenen Abrechnungslogik.

## Nachweis gegen Sonderlogik

Die produktive Aktivierung enthält keine Abfrage auf `K002` und keine Prüfung auf den Namen „Wasser“. Ein beliebiger Testkostenart-Datensatz mit anderer ID und `umlageschluessel = Verbrauch` erzeugt einen Verbrauchsbereich, sofern passende Zähler über `kostenId` zugeordnet sind.
