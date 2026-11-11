# GB-Erkundungswelt V14

Die Vorschau umfasst 60 Gebiete mit 118 Übergangsrichtungen und 238 Landmarken.
Außenkarten nutzen die ursprünglichen Kartengrößen von 36 × 28 bis 52 × 33 Feldern.
Die kompakten Innenräume messen 12 × 9 Felder.

[Erkundungswelt V14 öffnen](https://graf-git-hub.github.io/Souls/echo-chroniken-welt-v14.html)

An 17 beidseitigen Außenwegen zeigt die Kamera beide Karten. Am Rand läuft die
Figur mit derselben Richtung und laufender Animation in das Nachbargebiet.
Türen, Treppen und Verbindungen ohne passenden Außenrand behalten ihre
bisherige Funktion. Hohes Gras bewegt sich beim Betreten.

Die Vorschau öffnet Übergänge unabhängig von Storyflags. Kämpfe, Quests und
Spielstände gehören zur Hauptspiel-Engine. Die Integration der Grundrisse
in diese Engine steht aus.

## Dateien und Prüfung

- `project/tools/souls-bridge/original-maps.json` liefert Gebiete, Spawns, Verbindungen und Landmarken.
- `project/tools/gb-world/compact_layouts.py` erstellt Layouts und verbindet geeignete Außenränder.
- `project/tools/gb-world/build_world.py` erzeugt die eigenständige HTML-Vorschau und `project/assets/gb-classic/world_maps.json`.
- `project/qa/gb-world-assets.py` prüft alle Karten, Landmarken, Spawns, erreichbaren Ausgänge und reziproken Kartenränder.
- `project/qa/gb-world-browser.py` prüft die Übergänge und Kameragrößen mit Playwright und Chrome. Für ein anderes Chromium kann `CHROMIUM_PATH` gesetzt werden.
