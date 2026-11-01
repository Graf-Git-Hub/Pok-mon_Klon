# Systemspezifikation und Entwicklungs-Architektur

## Zustandsmodell

Die heutige APK hat ein zentrales `gameState`, eine 36×28-Weltkarte, lokale Speicherung und mehrere Raumzustände. Geplant ist **additive Modularisierung**: `MapRegistry`, `SceneState`, `QuestRegistry`, `EncounterRegistry`, `RailRegistry` und `AssetRegistry`. Vorhandene Prototypfunktionen bleiben als Adapter bestehen, bis Tests und echte Spielstände nachgewiesen migriert sind.

## MapRegistry

Eine Karte: `{mapId, bounds, tiles, collision, interactables, npcs, exits, spawnPoints, environment, encounterTableId, themeId, musicId}`. Ausgang: `{exitId, toMapId, toSpawnId, requiredFlags, returnExitId}`. Keine Koordinatenübernahme aus anderer Map. Autotile/Objektlayer separat. Jede Region hat eine vollständig begehbare Grauform vor Dekorationsarbeit.

## EncounterRegistry

Datensätze aus Art-ID, Wildlevel min/max, Prozentgewicht, Map-/Zonen-ID, Pflicht-Flags und optional Tagesphase. Beim Betreten Auswahlliste validieren und aus einer **gewichteten Tabelle** ziehen. Welt-Balancing: Kapitel 1–2 Level 2–10; Kapitel 3–5 Level 9–24; Kapitel 6–9 Level 23–43; Kapitel 10–14 Level 41–60; Postgame 58–65. Höhere Formen über Evolution/optionale Endgame-Zonen, keine erzwungene Seltenheitsgrinderei.

## Kampfsystem

Keine Pflicht-Abhängigkeit von einem bestimmten seltenen Element; ein Boss muss mit mindestens drei unterschiedlichen typischen Teams gewinnbar sein. Schaden, Tränke, Sphären und Fangschance sichtbar; Angriffe, Status, Reihenfolge und Animation skalierbar. Frühgegner dürfen mit niedrigleveligen Basiswesen nicht 40-mal hintereinander töten. Balancing erst an repräsentativen Simulationsläufen und einem echten Durchlauf kalibrieren.

## Kapitel- und Questengine

Datengetriebene Szenen; Gespräche, Interaktionsobjekte, Rätsel und Boss-Trigger greifen auf gemeinsame Quests und Map-Registry zu. Bekannte Belohnungen mit atomarem `rewardClaimed`. Kein Kapitel-1-Intro durch spätere Kapitel überschreiben.

## Bahn und Schnellreise

Siehe ECHO_RAILWAY.md. Separate Welt-Graphen und Station-IDs; Route nur über freigegebene Kanten; Abbrechen jederzeit. Reisezeit-Animation optional/überspringbar. Kein Reiseticket als Pflichtinventar.

## Audio, Video und Android

Eine verlässlich offline-fähige APK für Handy/Android-TV, keine neuen App-IDs. Canvas 320×180 Basisspiellogik, an großen Displays sauber skaliert. D-Pad/A/B/Start voll unterstützt; Touch-Flächen nicht über Dialogtext legen. Vor neuen Musik-Assets Lizenz klären; Placeholder möglichst eigene kurze Original-Loops oder zulässige freie Sounds, nicht geschützte Game-Tracks kopieren.

## Große Karte ohne Performanceverlust

Map nach Region laden, Offscreen-Layer cullen, Bildatlanten bevorzugen, NPC-Animationen nur in Kameranähe aktualisieren. Jede neue Region separat benchmarken; keine permanenten Fullscreen-Particles über Handy-WebView.

## Spielzeit und Contentbudget

Zielvorschlag: Hauptstory 10–16 Stunden bei später komplettem Content. **Noch nicht gemessen.** Pro Produktionsphase zunächst ein kompletter Vertical Slice mit Übergang, Quest, Trainer, Rückfahrt und Savegame. Erst danach Assets verfeinern. Jede neue größere Mechanik maximal einmal als Pflichtfall einführen und später variieren.
