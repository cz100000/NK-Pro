# AP22F10B – Release-Prüfsumme

Für das fertige ZIP wird nach Abschluss aller Dateien eine externe SHA-256-Prüfsummendatei erzeugt:

`NK-Pro_V99_4_45_AP22F10B_Individuelle_Werte.zip.sha256`

Diese Sidecar-Datei ist die maßgebliche Prüfsumme des vollständigen ZIP-Containers. Eine Prüfsumme des ZIP kann nicht sinnvoll in denselben ZIP-Container eingebettet werden, weil jede Einbettung den Container und damit seine Prüfsumme verändern würde.

Zusätzlich enthält das Produktrelease `RELEASE_INHALTSMANIFEST_SHA256.txt`. Dieses Manifest prüft die einzelnen enthaltenen Dateien und schließt nur sich selbst aus.
