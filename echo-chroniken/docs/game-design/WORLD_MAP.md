# Welt- und Kartenarchitektur – verbindlicher Planentwurf

> **Alles außer dem bestehenden Dorf/der bestehenden 36×28-Karte ist Planung.** `WORLD_GRAPH.json` dient als maschinenlesbare Soll-Topologie. Keine neuen mapIds sind bereits im Code garantiert.

## Grundregel

Ab Kapitel 3 mehrere feste Maps statt immer größere Erweiterungen der alten Oberwelt. Wurzelheim bleibt sicherer Hub. Jede Map besitzt eigene mapId, spawnPoints, exits, encounterTableId, assetBundle, musicId und requiredFlags. Jede äußere Tür hat eine ausdrückliche Gegenrichtung.

Die heute eingebauten Dorfobjekte, drei Prototyp-Arenen, Seelen-See-Ufer und Flüsterwald liegen teilweise auf derselben 36×28-Karte. Erst eine migrationssichere Overlay-/Map-Registry trennt diese Bereiche später. Vorher **keine** Sprites auf Basis späterer Vorschlagskoordinaten verschieben.

## Welt-Korridor (nur Topologie, nicht maßstabsgetreu)

Wurzelheim ↔ Flüsterwald ↔ Waldruine / Traumtor; Wurzelheim ↔ Seeufer ↔ Nebelhafen ↔ Pumpwerk → Wartungstunnel ↔ Wurzelheim-Untergrund ↔ Moorglas ↔ Stillwasser ↔ Aschenruh/Glutklamm ↔ Lichterhain ↔ Kronenstadt ↔ Frostgrat ↔ Unterstadt ↔ Sternenobservatorium ↔ Resonanzschacht ↔ Resonanzkern.

## Regionsverzeichnis

| Region | Ab Kapitel | Look & Feel / Produktionsanker |
| --- | --- | --- |
| Wurzelheim | 1 | Dorf, Feldrand, Seeufer |
| Flüsterwald | 2 | Pfad, Waldrand, Ruinenhof |
| Nebelhafen | 3 | Hafen, Steg, Pumpwerk |
| Moorglas | 4 | Moor, Schienenweichen, Nebelgräser |
| Stillwasser | 5 | Siedlung, Archivgarten |
| Glutklamm/Aschenruh | 6 | Schmiede, Schlucht, Rußterrassen |
| Lichterhain | 7 | Garten, Namensarchiv |
| Kronenstadt | 8 | Hauptstadtviertel, Resonanzrand |
| Frostgrat | 9 | Eisroute, Station, Höhle |
| Unterstadt | 10 | Untergrund, alte Quartiere |
| Sternenobservatorium | 11 | Sternenpfad, Kuppel |
| Resonanzschacht | 13 | Schacht, Labore, Ankerkammern |
| Resonanzkern | 14 | Zwischenreich, finale Echos |
| Postgame | 15 | Freie Linien, Bonuszonen |


## Geplante Kartenübersicht

| Kapitel | Primäre Karten-IDs |
| --- | --- |
| 01 | `wurzeldorf_outdoor`, `martha_house`, `village_workshop`, `village_herbal`, `seelen_see_edge` |
| 02 | `forest_route`, `forest_ruin`, `dream_gate` |
| 03 | `lake_north_path`, `nebelhafen_town`, `pumpworks_floor1`, `pumpworks_controlroom` |
| 04 | `root_tunnel`, `station_wurzelheim`, `rail_switchyard`, `moorglas_bog`, `station_moorglas` |
| 05 | `moor_to_stillwater`, `stillwasser_town`, `stillwater_archive`, `stillwater_tower` |
| 06 | `ashrail_approach`, `aschenruh_town`, `glut_forge`, `glut_chasm` |
| 07 | `garden_road`, `lichterhain_grove`, `name_library`, `echo_garden` |
| 08 | `capital_outer_gate`, `kronenstadt_upper`, `central_archive`, `station_kronenstadt`, `research_hall` |
| 09 | `frost_approach`, `frost_station`, `ice_caverns`, `station_frost` |
| 10 | `under_city_station`, `under_city_homes`, `resonance_mainring`, `continuum_vault` |
| 11 | `star_ridge`, `observatory_hall`, `observatory_telescope`, `observatory_roof` |
| 12 | `martha_house`, `memory_room`, `old_family_garden` |
| 13 | `shaft_entry`, `shaft_level1`, `shaft_level2`, `shaft_anchors`, `father_chamber` |
| 14 | `core_access`, `memory_reflections`, `resonance_core`, `epilogue_wurzelheim` |
| 15 | `all_existing_regions`, `optional_echo_garden_annex`, `rail_heritage_museum` |


## Festgelegte Übergangs-Tests

- Jeder Walk-/Rail-Übergang ist bidirektional oder besitzt einen ausdrücklich garantierten Alternativweg. Kein Verschluss, solange der Spieler auf der falschen Seite steht.

- Der finale Kern darf nach dem Abspann den Spieler in den Epilog-Hub setzen; vorher bleiben Heilstation und Speichern zugänglich.

- Späte Werkzeuge wie Phasenlaterne öffnen **zusätzliche** markierte Brücken und Geheimnisse, nie den einzigen Rückweg zur Heimat.

- NPCs und Story-Flags werden per stabile ID angesprochen, nicht per absoluter Dorfkoordinate.

- Eine gebuchte Bahnreise erfolgt nur, wenn Zielstation **und** `safeSpawnId` existieren und geladen werden können; sonst Fahrt ablehnen, ohne aktuelle Map zu ändern.

- Alle Übergänge brauchen Kollisionstest, Karte/Markierung, Kamerasichtbarkeit und eine Rückreiseprobe nach Save/Load.

## Umsetzung

M1: bestehendes WorldMap-Objekt unverändert als `legacy_wurzeldorf` registrieren. M2: Save-Schema erweitern. M3: neue Lake-Map und Nebelhafen separat anlegen. M4: Bahnstationen als eigenständige Maps. M5: jede weitere Region anhand derselben Struktur. Tests müssen alte IDs und Questpositionen erhalten.
