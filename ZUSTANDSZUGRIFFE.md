# NK-Pro – Zustandszugriffe V99.4.17

AP14 verändert weder Root-State-Eigentum noch Persistenzpfade. `wasser` enthält ausschließlich statische Beispieldaten; Navigation und Tabellenfilter schreiben nicht in den Fachzustand. `verbraeuche` nutzt unverändert die bestehenden Zähler- und Abrechnungsdaten.

Root-Zustandsersetzung erfolgt ausschließlich durch `app-state-persistence.js`; `app.js` besitzt weiterhin keine direkten State-Zugriffe.
