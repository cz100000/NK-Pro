# NK-Pro V99.4.40 – AP22F5B

## Release
`NK-Pro_V99_4_40_AP22F5B_Zaehler_und_Mietverhaeltnisse.zip`

## Inhalt
- UI-Migration des nicht produktiven Zähler-DUMMYs
- UI-Migration der produktiven Mietverhältnisse
- aktualisierte UI-Referenz
- statische und browserbasierte AP22F5B-Prüfungen
- fünf Zielzustands-Screenshots
- Schutz-, Positivlisten-, Test- und Abnahmenachweise

## Start
1. ZIP vollständig in ein neues Verzeichnis entpacken.
2. Inhalt in das NK-Pro-Repository übernehmen.
3. GitHub Pages beziehungsweise den statischen Server aktualisieren.
4. Browser-Cache mit `Strg + F5` aktualisieren.
5. In der Navigation muss `V99.4.40` erscheinen.

## Prüfung
```text
npm ci
npm run test:ap22f5b
npm run release:check
```

## Manuelle Sichtprüfung
- Zähler: fünf farbige Linienicons, klare DUMMY-Kennzeichnung, Suche/Filter, keine produktiven Aktionen.
- Mietverhältnisse: vier Kennzahlen, Suche/Filter, Bearbeitung/Speichern, Archivieren/Reaktivieren sowie vollständiger Nur-Ansehen-Modus.
- Beide Seiten: weiße Tabelleninnenränder, Hinweise ohne Überlagerung, interner Scroll bei schmaler Ansicht.
