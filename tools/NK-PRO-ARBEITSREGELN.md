# NK-Pro – Arbeitsregeln für ChatGPT

## 1. Quellen

1. Alleinige technische Grundlage ist die im aktuellen Chat hochgeladene und ausdrücklich verbindlich bezeichnete ZIP.
2. Frühere Chats, Erinnerungen, ältere ZIPs und nicht enthaltene Dateien sind keine technische Quelle.
3. Projektstand und Arbeitsregeln erklären den Auftrag, ersetzen aber keine Prüfung des tatsächlichen Codes.

## 2. Begrenzung des Arbeitsumfangs

- Ein Chat bearbeitet genau ein klar abgegrenztes Arbeitspaket.
- Keine fachfremden Nebenänderungen.
- Eine Vollanalyse erfolgt nur bei neuer unbekannter Ausgangsversion, grundlegender Architekturänderung oder vermuteter Beschädigung.
- Im Normalfall werden nur betroffene Dateien, Funktionen, Datenpfade und Tests untersucht.

## 3. Schutzregeln

Vor Änderungen an Datenmodell, Archiv, Migration, Berechnung, Zählern, Kostenarten, Umlageschlüsseln, Sicherung oder Import/Export müssen zuerst dokumentiert werden:

1. Ist-Zustand,
2. konkrete Auswirkungen,
3. mindestens zwei tragfähige Lösungswege,
4. Vor- und Nachteile,
5. Empfehlung,
6. Migration und Rückweg,
7. erforderliche Tests.

Ohne ausdrückliche Freigabe keine Schema- oder Austauschformatänderung.

## 4. Technische Leitplanken

- HTML, CSS und JavaScript bleiben die Produktivtechnik.
- Kein React, kein TypeScript, kein Buildsystem.
- Bestehende Fachfunktionen bevorzugt weiterverwenden.
- Historische Abrechnungen und Datenintegrität haben Vorrang vor Komfort und Optik.
- Große generierte oder datenlastige Dateien nur gezielt öffnen; `js/default-seed.js` ist Datenbasis, nicht primärer Analysegegenstand.
- Referenzfälle ausschließlich über `tests/fixture-loader.cjs` laden.

## 5. Pflichtablauf je Arbeitspaket

1. Version und Ausgangspunkt verifizieren.
2. betroffenen Bereich analysieren.
3. kleinsten tragfähigen Patch umsetzen.
4. gezielte Tests ergänzen.
5. vollständige relevante Tests ausführen.
6. Version, Projektstand, Changelog und SHA-256-Summen aktualisieren.
7. neue ZIP ohne temporäre Dateien erzeugen.

## 6. Chat- und Versionshygiene

- Im aktiven ChatGPT-Projekt liegt nur eine verbindliche Entwicklungs-ZIP.
- Nach einem größeren abgeschlossenen Arbeitspaket beginnt ein neuer Chat.
- Der neue Chat erhält nur die neue ZIP sowie diesen Projektstand und diese Arbeitsregeln.
- Vollständige Quellcodedateien werden nicht unnötig in Chatantworten wiederholt.
- Ergebnisse werden als ZIP, kurze Änderungsübersicht, Testnachweis und Restrisiken geliefert.
