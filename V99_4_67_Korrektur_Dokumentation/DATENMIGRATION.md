# Datenmigration V99.4.67

Die Migration ist rückwärtskompatibel und läuft innerhalb der bestehenden Zählerstandard-Synchronisierung.

## Automatische Schritte

1. Leere Platzhalterzeilen in `mieter` werden nicht als Nutzerfälle interpretiert.
2. Hieraus früher erzeugte Zähler ohne Wohnung werden entfernt.
3. Für jede reale Wohnung werden Kalt- und Warmwasserzähler abgeglichen.
4. Fehlende Messwerte werden ausschließlich aus vorhandenen historischen Belegdaten übernommen.
5. Aus Anfangs- und Endständen werden gültige Messperioden gebildet.
6. Zähler außerhalb des Abrechnungszeitraums bleiben im Stamm erhalten, lösen aber keine periodenbezogene Pflichtprüfung aus.
7. Die Reparatur wird als `metering-repair-v99.4.67` protokolliert.

## Ergebnis am bereitgestellten Datenbestand 2023

| Merkmal | Vorher | Nachher |
|---|---:|---:|
| Zählerstammsätze | 44 | 16 |
| Messwerte | 20 | 32 |
| Messperioden | 10 | 16 |
| Zuordnungen | 52 | 23 |
| abrechnungsrelevante Wohnungszähler | 44 einschließlich Artefakten | 14 reale Zähler |
| nicht abrechnungsrelevante Kontrollzähler | 0 | 2 |
| blockierende Zählerfehler | mehrfach | 0 |

Die 16 Zähler bestehen aus 14 realen Wohnungszählern sowie zwei Hausanschluss-Kontrollzählern. Für den Snapshot 2023 ist nur der im Jahr 2023 aktive Hausanschlusszähler als ausgeschlossener Kontrollzähler enthalten.

## Fachliche Schutzregel

Es werden keine Zählerstände geschätzt oder erfunden. Sind in der Historie keine belegten Werte vorhanden, bleibt der Datensatz offen und muss fachlich bearbeitet werden.
