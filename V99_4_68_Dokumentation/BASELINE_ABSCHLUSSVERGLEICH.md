# NK-Pro V99.4.68 – Baseline- und Abschlussvergleich

| Bereich | Baseline V99.4.67 | Abschluss V99.4.68 |
|---|---|---|
| Teilnahmeentscheidung | Privat-/Eigentümerrolle wird ausgeschlossen | rollenunabhängige `isSettlementParticipant`-Entscheidung |
| Ergebnisstruktur | `tenantResults` und separater Finanzpfad `privateResults` | eine Ergebnisstruktur; private Teilmenge nur informativ |
| Vorauszahlungen/Korrekturen | privat gesperrt oder aus Summen entfernt | vollständig editierbar und summenwirksam |
| Ergebnis | M000 fehlt regulär | M000 regulär mit Kostenanteil, Vorauszahlungen, Korrektur und Saldo |
| Vermieterkosten | Privatanteil automatisch Vermieter trägt | nur echte nicht umlagefähige Kosten/Leerstand getrennt |
| Individuelle Werte | generische Bezeichnung „Privatanteil“ | tatsächlicher Personenname plus Badge |
| Prüfungen | private Fälle teilweise nicht verpflichtend | gleiche Pflichtprüfungen für alle Teilnehmer |
| Dokumente | M000 aus Briefauswahl ausgeschlossen | Einzelbrief, Sammeldruck, Druck/PDF vollständig möglich |
| Export | separate unvollständige Privatzeile | reguläre Abrechnungszeile mit echtem Saldo |
| Archiv | private Korrekturen übersprungen | regulärer Snapshot-/Archivpfad |
| Jahreswechsel | rollenbedingte Ausschlüsse | stabile ID-basierte Übernahme |
| M000 Einzug aktiv | 2023/2024 | 01.01.2010 in drei aktiven Ebenen |
| finalisierte Archive | historische Werte | unverändert erhalten |
| Hardcoding | M000-/Zimmermann-Logiken vorhanden | produktive Sonderlogiken entfernt |
| generischer Gegenfall | nicht abgesichert | P900/Eigenanteil A-bis-Z bestanden |
