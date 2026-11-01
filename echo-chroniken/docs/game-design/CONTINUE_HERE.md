# CONTINUE HERE – exakter Projektstand und nächster Task

**Stand:** 01.11.2026. **Codeziel:** Android v0.15.0, Release im GitHub-Workflow prüfen. **Letzte Roadmap-Basis vor Codeänderung:** `d2d97e2`; HEAD beim nächsten Chat neu prüfen.

## Abgeschlossene Produktionsaufträge

- **M00-02 DONE:** Acht synthetische Golden-Save-Fixtures plus beschädigter JSON-Testfall. Dies sind **keine privaten Nutzer-Spielstände**.
- **M01-01 DONE:** Karten-Registry `project/src/maps/registry.js`, Adapter `legacy_wurzeldorf` für echte 36×28-Karte. Keine Verschiebung der bestehenden Karte oder NPCs; synthetische bidirektionale Kartenwechsel getestet.
- **M01-02 DONE:** Schema-2-Metadaten `currentMapId`, `safeSpawnId`, `saveSchemaVersion`. Bei Laden eines älteren gültigen Saves wird dessen Originaltext einmal unter `echo_chroniken_tv_save_before_maps_v2` **lokal auf demselben Gerät** gesichert. Bestehendes Team, Inventar, Arenen, Ruinen und Quests bleiben erhalten.
- **Nicht implementiert:** Neue Städte, Bahn, Nebelhafen und Kapitel 3–14. Kein privater Spielstand wurde für Tests ausgelesen oder auf GitHub geladen.

## Exakt nächster Task: M01-03

Baue einen **StoryRegistry/QuestFlag-Adapter**, der zunächst nur vorhandene Questflags von Oma, Liora, Piko, Ruine und Arenen liest und einmalige Rewardtransaktionen sichert. Kein Rewrite dieser bestehenden Quests. Neue Tests für Pflichtvoraussetzungen, Doppelextras und altes Save-Schema. Danach weiter mit **M01-04 EncounterRegistry**, **M01-05 reale Portal-Integration**, **M01-06 visuelle QA**, anschließend Kapitel 3 Nebelhafen.

Offener unabhängiger Task **M00-03:** Original-IDs, Front- und Rückbilder der 150 Wesen paarweise prüfen. 15 Rückansichten sind ergänzte Varianten; 50 Arten tragen Platzhalternamen. Nicht stillschweigend umbenennen.

## Neuer Chat: Lesereihenfolge

1. `00_INDEX.md`, 2. `PROJECT_BASELINE.md`, 3. `PRODUCTION_TASKS.csv` / `IMPLEMENTATION_ROADMAP.md`,
4. `QUEST_FLAGS_AND_SAVES.md` und `SYSTEMS_ARCHITECTURE.md`, 5. `WORLD_MAP.md`,
6. aktuellen Spielcode in `echo-chroniken/project/src/` und die Tests.

## Regeln beim Weiterarbeiten

Keine neue App-ID oder Debug-Signatur. Keine alten Koordinaten und Story-Flags ohne Save-Migration verändern. Vor neuen Karten nachweisbare Rückwege; Codeänderungen erst nach Tests, Screenshots und Dokumentaktualisierung veröffentlichen.

**Nach jedem Task:** `PRODUCTION_TASKS.csv`, `CHANGELOG.md` und diese Datei mit Ergebnissen, Blockern und aktuellem HEAD aktualisieren.
