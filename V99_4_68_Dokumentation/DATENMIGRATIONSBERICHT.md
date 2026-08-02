# NK-Pro V99.4.68 – Datenmigrationsbericht

## Quelle und Ziel

- Quelle: `nk-pro-gesamtbestand-2023-V99.4.67-korrigiert-2026-08-02(1).json`
- Ziel: `nk-pro-gesamtbestand-2023-V99.4.68-migriert-2026-08-02-18-30-00.json`
- Quell-SHA-256: `582032d05bfc8217105f4cb12dbf452945b674c9c09ab3a4fa283f8f1aabe389`
- Ziel-SHA-256: `c1f0a90fd96b465b709b9993299190d93a3f250824cefb047c851ec6a515007b`

## Kontrollierte Änderungen

| Datenebene | M000 vorher | M000 nachher |
|---|---:|---:|
| aktuelle Abrechnung 2023 | 01.01.2023 | 01.01.2010 |
| Objektstandard | 01.01.2024 | 01.01.2010 |
| zentraler Stammdatenbestand | 01.01.2024 | 01.01.2010 |

Zusätzlich wurden ausschließlich Migrationsmetadaten für `settlement-participants-v99.4.68` ergänzt und die Exportversion auf V99.4.68 fortgeschrieben.

## Bewusst nicht verändert

- Archiv 2024: M000 bleibt auf dem dort gespeicherten historischen Stand.
- Archiv 2023: M000 bleibt auf dem dort gespeicherten historischen Stand.
- alle weiteren finalisierten Archivstände bleiben vollständig unverändert.
- stabile Teilnehmer-, Wohnungs-, Kostenarten- und Zähler-IDs bleiben unverändert.

## Mengenvergleich

| Struktur | Quelle | Ziel |
|---|---:|---:|
| Wohnungen | 7 | 7 |
| Teilnehmer-/Platzhalterzeilen | 20 | 20 |
| Kostenarten | 42 | 42 |
| Vorauszahlungszeilen | 37 | 37 |
| Jahresarchive | 4 | 4 |

## Archiverhalt

Der kanonische SHA-256 der kompletten Struktur `jahresArchiv` lautet in Quelle und Ziel identisch:

`9d67f36902138d37ebb477b8225da723de437325142673736525999afdb80ecb`

Der automatische Migrationsprüfer bestätigt zusätzlich, dass außerhalb der drei Einzugsdatumsänderungen und dokumentierten Metadaten keine Echtdaten verändert wurden.
