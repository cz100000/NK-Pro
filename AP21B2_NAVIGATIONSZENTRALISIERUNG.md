# AP21B2 – Navigationszentralisierung

Zielversion: V99.4.27

Die sichtbare linke Navigation wird vollständig aus einer zentralen, unveränderlichen Definition in `js/navigation.js` erzeugt. Gruppen, Reihenfolge, Bezeichnungen, Icons, Abrechnungskontext-Anforderungen und Seitenschlüssel besitzen damit eine einzige Quelle. `index.html` enthält nur noch das semantische Render-Ziel. Die interne Diagnose vergleicht die gerenderte Navigation mit derselben Definition.

Direkteinstiege auf nicht sichtbare Seiten bleiben über die zentrale Kompatibilitätszuordnung erhalten. Gestaltung, Responsive-Verhalten und Bedienung aus AP21B1 bleiben unverändert.
