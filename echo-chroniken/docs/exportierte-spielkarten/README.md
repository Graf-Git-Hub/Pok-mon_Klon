# Echo-Chroniken: Alle 60 echten Spielkarten als Bilder

Dieser Ordner wurde direkt aus dem **wirklichen Spielcode** des Echo-Chroniken-Projekts gerendert, Stand **06.11.2026**. Die Karten sind keine KI-generierten Fantasiebilder. Sie nutzen die Spiel-Map-Registry, originale Tiles und die echten Zeichenfunktionen der Welt.

## Download

- **Echo-Chroniken_ALLE_MAPS_GROSSES_BILD.png**: Alle **60 registrierten Regionen** als **ein großes Übersichtsbild**, 2704 × 8690 Pixel. Jede Karte hat einen eigenen beschrifteten Rahmen. Karten stehen in Registrierungsreihenfolge (nicht in einer künstlich erfundenen Geografie).
- **Echo-Chroniken_ALLE_MAPS_EINZELN.zip**: **60 PNGs**, jede vollständige Karte **ohne Spieler, Begleiter, NPC-Figuren oder HUD**. Auflösung **2×** (Pixel-Art mit Nearest-Neighbor, keine Zwischenfarben).
- **einzelkarten/**: Dasselbe Material einzeln verfügbar, mit stabilen IDs im Dateinamen.
- **map-verzeichnis.json**: Echtes Kartenregister mit Map-IDs, Namen, Größen, Export-Dateien und Quelle.

Die Objekt- und Umweltzeichnung (Häuser, Seen, Bäume, Schienen, Tore und ähnliche statische Landschaftselemente) bleibt enthalten. Interaktive Figuren werden beim Export im Browser unterdrückt. Die Kacheln sind jeweils 16 × 16 Spielpixel.

**Zum Neugestalten:** Jedes Einzelbild kann geöffnet und überarbeitet werden. Das Spiel verwendet derzeit überwiegend *programmatisch erzeugte* Karten, nicht die exportierten PNGs. Das direkte Ändern eines PNGs ändert das laufende Spiel noch nicht; dafür müsste später eine Import-/Tilemap-Anbindung umgesetzt werden. Die Original-Spiel- und Speicherdaten wurden beim Export nicht verändert.

Erstellt mit `echo-chroniken/project/qa/export_clean_maps.py` im isolierten Chrome/Playwright-Browser.
