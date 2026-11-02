# Echo-Bahn – Streckenbuch und Anti-Softlock-Vertrag

> **Stand 01.11.2026: Erste Strecke Wurzelheim-Moorglas seit v0.19.0 als spielbarer Abschnitt implementiert. Die zweite Teilstrecke Moorglas-Stillwasser ist ab v0.21.0 nach Abschluss von Kapitel 5 spielbar. Die dritte Strecke Stillwasser-Kronenstadt ist ab v0.22.0 nach Kapitel 8 spielbar. Vier weitere geplante Linien und die vollstaendige Bahninszenierung sind noch nicht gebaut.** Die Bahn ist zugleich Schnellreise und Welt-Lore. Das erste nutzbare Teilstück kommt mit Kapitel 4.

## Historischer Zweck und Story-Funktion

Die Bahn wurde für Forschung, Versorgung und Krankenhäuser des Resonanznetzes gebaut. Varek zweckentfremdet Übertragungsleitungen als Zwangssignal. Edda und der Spieler schalten die Züge gefahrlos frei und trennen Reiseenergie vom Resonanzzwang. Die Bahn soll sich wie eine alte elektrische Untergrundbahn anfühlen, nicht wie ein modernes U-Bahn-Netz.

## Stationen

| Station | Erstes Kapitel | Freischaltung | Oberirdischer Ausgang |
| --- | --- | --- | --- |
| Wurzelheim | 4 | `rail_wurzelheim` | `wurzeldorf_outdoor` |
| Moorglas | 4 | `rail_moorglas` | `moorglas_bog` |
| Nebelhafen | 4 | `rail_nebelhafen` | `nebelhafen_town` |
| Stillwasser | 5 | `rail_stillwasser` | `stillwasser_town` |
| Aschenruh | 6 | `rail_aschenruh` | `aschenruh_town` |
| Kronenstadt | 8 | `rail_kronenstadt` | `kronenstadt_upper` |
| Frostgrat | 9 | `rail_frost` | `frost_station` |
| Unterstadt | 10 | `rail_undercity` | `under_city_homes` |


## Gleisverbindungen

| Von | Nach | Freischaltung |
| --- | --- | --- |
| `station_wurzelheim` | `station_moorglas` | `chapter04_complete` |
| `station_wurzelheim` | `station_nebelhafen` | `chapter04_complete` |
| `station_moorglas` | `station_stillwasser` | `chapter05_complete` |
| `station_stillwasser` | `station_aschenruh` | `chapter06_complete` |
| `station_aschenruh` | `station_kronenstadt` | `chapter08_complete` |
| `station_kronenstadt` | `station_frost` | `chapter09_complete` |
| `station_kronenstadt` | `under_city_station` | `chapter10_complete` |


## Reiseablauf

1. Am Bahnsteig A drücken oder tippen. 2. Liste **nur bereits freigeschalteter erreichbarer Ziele** anzeigen. 3. Ziel mit D-Pad/Touch markieren, bestätigende Vorschau inklusive kostenloser Rückfahrt. 4. Zielspawn prüfen. 5. Aktuellen Save intern sicher puffern. 6. Fade-out / 2–4 Sekunden wiederverwendbare Zuganimation / leiser Fahrton. 7. Zielkarte laden und safeSpawn setzen. 8. Erst nach Erfolg speichern, andernfalls am Ausgangsbahnhof bleiben.

## Kosten und Zugänglichkeit

Erstfahrt kostenlos, Rückfahrt immer möglich und kostenlos. Vorschlag: alle regulären Fahrten ebenfalls kostenlos, weil Geld-Ökonomie noch nicht implementiert ist. Keine zufälligen Tickets, keine sperrenden Fahrpläne, keine echten Wartezeiten. Optional Zugfahrt per Animation überspringbar.

## Technischer Station-Contract

Daten pro Station: `stationId`, `mapId`, `surfaceExitId`, `platformSpawnId`, `unlockedFlag`, `reachableConnections`, `introSeen`. Freischaltung separat von Standortkenntnis; keine hardcoded Sprite-Koordinate. Die Netzsuche verwendet BFS auf bereits freigeschalteten Kanten und zeigt nur sichere Ziele.

## Verbindliche Tests

- Keine Fahrt zu noch gesperrtem Bahnhof und kein Teleport ins Nichts.

- Kein Softlock auf Bahnsteig nach Niederlage, Absturz oder App-Neustart.

- Altspielstände starten außerhalb neuer Karten an demselben Ort wie zuvor.

- TV-Bedienung vollständig ohne Touch; bei Fahrt-Abbruch bleibt Save unverändert.

- Kapitel-4-Tests: Wurzelheim → Moorglas → Wurzelheim, Pause, Neustart, Rückkehr nach Dorf.

- Nach Kapitel 10: sieben Bahnlinks und acht Stationen, alle reziprok erreichbar (Freischaltung berücksichtigt).
