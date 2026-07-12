# NK-Pro – Technical Debt Register

**Basis:** V99.4.5  
**Stand:** 12. Juli 2026

| ID | Thema | Priorität | Status |
|---|---|---|---|
| TD-001 | Großes `js/app.js` | hoch | reduziert; Infrastruktur und neue Fachgrenzen modularisiert, UI-/Berechnungsorchestrierung bleibt groß |
| TD-002 | Parallele Legacy-Arrays und Objektprojektion | hoch | akzeptiert V99.4.5; aus Kompatibilitätsgründen noch nicht vollständig abgelöst |
| TD-003 | Zählerstammdaten und periodische Werte vermischt | hoch | vorbereitet durch stabile Zähler-IDs; physische Trennung offen |
| TD-004 | Historische Archive nicht vollständig rekonstruierbar | mittel | transparent als `legacy-partial` gekennzeichnet; Originalfachdaten bleiben erhalten |
| TD-005 | FNV1A32 nicht kryptografisch | mittel | für lokale Manipulationserkennung akzeptiert; keine Signatur/Langzeitarchivierung |
| TD-006 | Mehrgebäude-UI fehlt | mittel | Objektstandard unterstützt Gebäude; Ausgangsbestand und Oberfläche bleiben einobjektorientiert |
| TD-007 | Globaler Namensraum | mittel | sechs eingefrorene Modulnamespaces; Kompatibilitätswrapper bestehen |
| TD-008 | Persönliche Produktivdaten in Auslieferungsbestand | hoch | separate Datenschutz-/Verteilungsentscheidung erforderlich |
| TD-009 | CSS-/Druckkomplexität | mittel | unverändert; eigenes Arbeitspaket empfohlen |

## Erreichte Schutzmaßnahmen V99.4.5

- verlustfreier Objektstandard 1,
- Vor-Migrationssicherung auch bei additiver Schema-5-Migration,
- zentrale strukturierte Abrechnungsbereitschaft,
- unveränderliche, eindeutige und prüfsummengeschützte Snapshots,
- vollständiger Ausschluss des Stromzähler-Dummys,
- historische Originaldaten ohne fachliche Neuschreibung,
- automatisierte Release- und Browserregression.
