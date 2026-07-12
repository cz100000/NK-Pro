# NK-Pro – Roadmap

**Basis:** V99.4.5 vom 12. Juli 2026  
**Datenschema:** 5  
**Datenebenenvertrag:** 1

## Abgeschlossen

### V99.4.0 – UX-Grundgerüst

Landingpage, gruppierte Navigation und sichtbarer Abrechnungskontext ohne Fachmodelländerung.

### V99.4.2 – Datenebenen und Snapshot-Grenzen

Arbeitsstand, Stammdaten, Historie, Snapshot, Archiv, Backup und Recovery klar abgegrenzt; rekursive Archive verhindert.

### V99.4.3 – Modularisierung

Persistenz, Migration und Archiv in eigenständige Module ausgelagert.

### V99.4.4 – Migration, Sicherung, Restore und Rollback

Zentrale Migrationsregistry, Vor-Migrationssicherung, transaktionale Migration, Sicherungshüllen, Restore-Checkpoint und Rollback.

### V99.4.5 – Objektstandard und Abrechnungssnapshot

- Objektstandard 1 als additive, verlustfreie Projektion,
- zentrale Abrechnungsbereitschaft,
- eindeutiger, unveränderlicher und prüfsummengeschützter Snapshot 1,
- historische Archive als unveränderte `legacy-partial`-Bestände,
- Stromzähler-Dummy mit vollständigem Abrechnungsausschluss,
- Datenschema 5 und Datenebenenvertrag 1 unverändert.

## Nächster technischer Schritt

**Zählerstammdaten und periodische Zählerstände physisch trennen.**

Ziele: dauerhafte Zähler-ID aus Objektstandard 1 nutzen, Messperioden separat führen, Zählerwechsel und Nutzerwechsel eindeutig abbilden, historische Referenzen migrieren und Archive/Restore vollständig testen. Das Sicherungs- und Migrationsfundament V99.4.4 bleibt verbindlich.

## Spätere Schritte

- weitere Zerlegung von Import/Export, Berechnung, Brief/Druck und Rendering,
- CSS- und Druckkonsolidierung,
- datenschutzgerechte Trennung produktiver und veröffentlichbarer Pakete.
