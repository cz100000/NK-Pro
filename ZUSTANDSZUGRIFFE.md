# NK-Pro – Zustandszugriffe V99.4.15


AP13 ergänzt ausschließlich kompatible Brieftexteinstellungen. Berechnungs- und Root-State-Eigentum bleiben unverändert; der Renderer schreibt nicht in den Anwendungszustand.

`state` ist die einzige fachliche Arbeitswahrheit. Root-Zustandsersetzung erfolgt ausschließlich durch `app-state-persistence.js`; `state-access.js` stellt kontrollierte Lese-, Commit- und Transaktionspfade bereit. `app.js` besitzt null direkte State-Referenzen und null direkte State-Schreibstellen.

Renderer, Navigation und Dialogöffnung verändern keinen Fachzustand. Persistenz erfolgt ausschließlich in den vorgesehenen Persistenzpfaden. Einzelbesitz, Leser und Schreiber stehen in `AP12_ZUSTANDSINVENTAR.md`; alle statisch erkannten Mutationen in `AP12_MUTATIONSINVENTAR.md`.
