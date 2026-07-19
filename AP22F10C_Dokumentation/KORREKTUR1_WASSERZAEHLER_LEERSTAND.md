# AP22F10C Korrektur 1 – Wasserzähler bei Vollleerstand

## Fehlerbild

Vollständig leer stehende Wohnungen wurden als Leerstandsfall für externe Einzelkosten angezeigt. Waren sie in den Wohnungsstammdaten als `inaktiv` markiert, erzeugte die Zählernormalisierung jedoch keine Kalt- und Warmwasserzähler.

## Korrektur

Der Wohnungsstatus ist für das Vorhandensein physischer Wasserzähler kein Ausschlusskriterium mehr. Bei vorhandenem Wasserkontext erhält jede Wohnung mit stabiler Wohnungs-ID genau einen Kalt- und einen Warmwasserzähler. Es wird kein künstlicher Mieterdatensatz erzeugt.

## Prüfung

Ein automatisierter Regressionstest weist für eine vollständig leer stehende, als `inaktiv` gekennzeichnete Wohnung genau einen Kalt- und einen Warmwasserzähler nach.
