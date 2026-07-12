# NK-Pro – Technische Schulden

**Basis:** V99.4.6

| ID | Thema | Priorität | Stand |
|---|---|---:|---|
| TD-001 | Umfang und Verantwortungsdichte von `app.js` | hoch | reduziert, aber weiterhin wesentlich |
| TD-002 | Parallele Legacy-Erfassungsfelder und `zaehlerDaten` | hoch | als kompatibler Eingabeadapter akzeptiert; native UI ausstehend |
| TD-003 | Zählerstammdatenfelder im historischen Objektstandard 1 | mittel | Snapshot-kompatibel; operative Quelle ist `zaehlerDaten` |
| TD-004 | Alte Archive ohne vollständig rekonstruierbare Messwertbezüge | mittel | unverändert als `legacy-partial` gekennzeichnet |
| TD-005 | Tagesanteilige Verbrauchsschätzung bei Nutzerwechsel ohne Zwischenablesung | mittel | explizit als `estimated` markiert; fachliche UI-Freigabe ausstehend |
| TD-006 | Browserabhängige lokale Persistenz | mittel | durch Backup-/Recovery-Fundament abgesichert |
| TD-007 | Native CRUD-Tests für künftige Zähler-UI | niedrig | Folgearbeitspaket |

## Erreichte Schutzmaßnahmen V99.4.6

- stabile Zähler- und Messwert-IDs,
- getrennte Fachmodule und zentrale Validierung,
- revisionsfähige Messwerte statt stillschweigender Überschreibung,
- zeitabhängige Zuordnungen und explizite Zählerwechsel,
- Snapshot 2 mit vollständiger Zählerprojektion,
- historischer Snapshot-1-Erhalt,
- transaktionale, idempotente Standardmigration,
- zentraler Ausschluss nicht abrechnungsrelevanter Zähler.
