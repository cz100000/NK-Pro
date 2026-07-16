# NK-Pro – Verbindliche Seitenanatomie

## Grundreihenfolge

1. geschützte zentrale Navigation
2. globale Kopf- und Werkzeugleiste
3. gelbe Abrechnungskontextleiste, sofern fachlich relevant
4. Seitenschale
5. Seitenkopf
6. optionale Seitenaktionen
7. optionaler Kennzahlen- oder Statusbereich
8. fachlicher Hauptinhalt
9. optionale Nebenbereiche
10. Aktions- oder Abschlussbereich
11. Dialoge und globale Rückmeldungen

## 1. Navigation

**Zweck:** Primäre Bereichs- und Seitennavigation.  
**Position:** links beziehungsweise als bestehendes Overlay bei kleinen Breiten.  
**Regel:** Stand V99.4.32 unverändert. Keine zweite Navigation, keine lokale Seitenleiste mit konkurrierenden Hauptzielen.

## 2. Globale Kopf- und Werkzeugleiste

**Zweck:** Globale Werkzeuge wie Hilfe und Menü.  
**Position:** oberhalb des Arbeitsbereichs, an die bestehende Navigation anschließend.  
**Inhalte:** ausschließlich globale, seitenunabhängige Werkzeuge.  
**Responsive:** Werkzeuge bleiben erreichbar; Beschriftungen dürfen nur bei freigegebenem zugänglichem Iconmodus reduziert werden.

## 3. Gelbe Abrechnungskontextleiste

**Zweck:** einzige führende Anzeige für Objekt, vollständigen Abrechnungszeitraum, Status und bestehende kontextbezogene Aktionen.  
**Reihenfolge:** Titel „Abrechnungskontext“, Objekt, vollständiger Zeitraum, Status; Aktionen rechts.  
**Zustände:** kein geladener Kontext, Bearbeitung, „Nur ansehen“, geschlossen, Archiv und Korrektur.  
**Responsive:** Informationen umbrechen in semantischer Reihenfolge; Aktionen wechseln unter die Informationen.  
**Verbot:** keine Modusangabe, keine zweite Kontextkarte und keine zusätzliche Zeitraum-Klappbox im Seiteninhalt.

Die Kontextleiste zeigt weder „Modus: Bearbeiten“ noch „Modus: Nur ansehen“ noch eine andere Modusangabe. Der Nur-ansehen-Zustand wird durch den größeren handlungsorientierten Schreibschutzhinweis, deaktivierte oder ausgeblendete Bearbeitungsfunktionen und die dort verbleibende Aktion `Zur Bearbeitung öffnen` vermittelt. Eine zusätzliche kleine Kennzeichnung „Schreibgeschützt“ im Seitenkopf bleibt entfallen.

## 4. Seitenschale

**Zweck:** konsistenter äußerer Inhaltsrahmen.  
**Breite:** flüssig mit zentral definiertem Maximum; keine seitenbezogenen Maximalbreiten.  
**Abstand:** Desktop 32 px, unter 1280 px 24 px, unter 620 px 16 px.  
**Struktur:** vertikaler Stapel mit zentralem Bereichsabstand.

## 5. Seitenkopf

**Varianten:** Titel; Titel plus Beschreibung; Titel plus Aktionen; Titel, Beschreibung plus Aktionen.  
**Regeln:** genau ein `h1`; Beschreibung höchstens ein kurzer Absatz; Aktionen nach Wichtigkeit geordnet.  
**Responsive:** Aktionen dürfen umbrechen und auf schmaler Ansicht unter den Text wechseln.

## 6. Seitenaktionen

Primäraktion zuerst, danach sekundäre und zurückhaltende Aktionen. Seltene oder destruktive Aktionen dürfen in eine klar beschriftete Aktionsgruppe wechseln. Keine Aktionsduplikate im Seitenkopf und im ersten Inhaltsblock.

## 7. Kennzahlen- oder Statusbereich

Nur einsetzen, wenn die Werte eine Entscheidung oder Navigation unterstützen. Kennzahlenkarten verwenden ein gemeinsames Raster und höchstens eine hervorgehobene Kennzahl pro Karte. Status besitzen Text plus semantisches Icon oder Punkt.

## 8. Fachlicher Hauptinhalt

Der Hauptinhalt verwendet freigegebene Karten, Klappboxen, Tabellen, Listen oder Formularabschnitte. Jede visuelle Gruppierung muss einer fachlichen Gruppierung entsprechen. Formulare und Tabellen werden nicht allein zur Dekoration in zusätzliche Karten verschachtelt.

## 9. Optionale Nebenbereiche

Nebenbereiche enthalten ergänzende Hilfe, Zusammenfassungen oder Aktionen. Sie dürfen den Hauptablauf nicht unterbrechen. Unter mittlerer Breite stapeln sie nach dem Hauptinhalt.

## 10. Aktions- oder Abschlussbereich

Speichern beziehungsweise Abschluss steht nach dem bearbeiteten Inhalt. Der Bereich verwendet eine zentrale Formularabschlussleiste. Primäre Aktion rechts beziehungsweise in der natürlichen Leserichtung zuletzt; schmale Ansicht stapelt Aktionen ohne Informationsverlust.

## 11. Dialoge und globale Rückmeldungen

Dialoge werden nur für fokussierte Entscheidungen oder geschützte Aktionen verwendet. Globale Rückmeldungen dürfen die Seite nicht dauerhaft verdecken. Dialogsemantik, Fokusfalle, Escape-Regel und Fokusrückgabe folgen dem zentralen AP22D-System.

## Unzulässige Doppelungen

- zweiter Hauptseitentitel,
- zweite Abrechnungskontextanzeige,
- Status im Seitenkopf und identisch unmittelbar darunter,
- dieselbe Aktion gleichzeitig in Kopf, Karte und Abschlussleiste,
- identischer Warnhinweis mehrfach auf derselben Sichtfläche,
- zusätzliche kleine Schreibschutzplakette im Seitenkopf.

Doppelte Titel, redundante Statusangaben und unnötige Informationswiederholungen werden in späteren Migrationspaketen konkret benannt und nur nach Freigabe entfernt oder zusammengeführt.
