# GB-Erkundungswelt V13

Die Erkundungsfassung enthält alle 60 Gebiets-IDs, 118 Übergänge und 238 Landmarken aus dem bestehenden Weltgraphen. Kompakte Grundrisse verwenden die eigenen GB-Grafiken aus der bisherigen Vorschau.

Spielansicht: https://graf-git-hub.github.io/Souls/echo-chroniken-welt-v13.html

Die Gebiete sind oben auswählbar. Treppen verbinden die im Original definierten Zielgebiete. Die Vorschau öffnet Übergänge unabhängig von Storyflags. Kämpfe, Rätsel und Quests laufen in der Hauptspiel-Engine und sind hier nicht aktiv.

## Dateien

- project/tools/souls-bridge/original-maps.json liefert Gebiets-IDs, Spawns, Verbindungen und Landmarken.
- project/tools/gb-world/compact_layouts.py baut kompakte Grundrisse aus wiederverwendbaren Elementen. Herkunftskoordinaten der Landmarken bleiben dokumentiert.
- project/tools/gb-world/build_biomes.py erzeugt Eis-, Fels- und Fassadenkacheln.
- project/tools/gb-world/build_world.py baut die selbständige Erkundung.
- project/assets/gb-classic/world_maps.json enthält die erzeugten Karten.

## Prüfung

Generator mit Python ausführen. Danach project/qa/gb-world-assets.py und project/qa/gb-world-browser.py ausführen. Browser-QA benötigt Playwright und Chrome.

Die Assetprüfung kontrolliert alle 60 IDs, 238 Landmarken, 118 Portalziele, begehbare Spawns und erreichbare Übergänge. Die Chrome-Prüfung öffnet alle 60 Karten und betritt jeden Übergang über die Bewegungsfunktion. Touch, Handy-/TV-Kamera und JavaScript-Fehler werden mitgeprüft.

Automatische Prüfung aller 60 Gebiete bestanden. Sechs exemplarische Ansichten wurden visuell geprüft. Die menschliche Einzelabnahme jedes Gebiets und die Übertragung der kompakten Grundrisse in die Kampf-/Quest-Engine sind weitere Arbeitsschritte.
