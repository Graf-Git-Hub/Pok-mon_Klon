# CONTINUE HERE – genauer nächster Entwicklungsauftrag

Stand: 01.11.2026. Android v0.17.0 signiert, über GitHub veröffentlicht und auf dem Laptop-Desktop geprüft (Quellcommit 2c8140f). Codebasis vor Aufgabe: 1dd4350. Aktuellen HEAD vor jeder Arbeit neu lesen.

## Bereits erledigt

- M00-02: Acht synthetische Save-Fixtures und ein defekter JSON-Speicherstand geprüft.
- M01-01: Alte 36×28-Wurzelheimkarte über MapRegistry-Adapter registriert, Positionen unverändert.
- M01-02: Save-Schema 2 additiv und einmalige lokale Rohsicherung älterer Spielstände.
- M01-03: QuestRegistry für zehn echte vorhandene Quests, vier Einmal-Belohnungen.
- **M01-04 abgeschlossen:** neue EncounterRegistry in `project/src/encounters/registry.js`, Daten unter `project/data/encounters.js`. Prüft echte Arten-IDs 1 bis 150, Evolutionsstufen und abweichende Gewichte. Nur Wurzelheim ist bisher als Begegnungskarte registriert. Anfänger bleiben bei 25 wilden Basisarten und den bestehenden Schonregeln; die Level-/Kampfberechnung der modularen Fassung ist unverändert. Zukünftige Karten brauchen explizite Tabellen, unbekannte Gebiete bekommen niemals heimlich Wurzelheimer Monster.

## GENAU NÄCHSTE AUFGABE: M01-05

**Echte bidirektionale Kartenübergänge** vorbereiten und ins Spiel integrieren: fromMapId, exitId, toMapId, toSpawnId, returnExitId und notwendige Questflags. Zunächst eine kleine separate Testkarte über einen sicheren Rückweg aus Wurzelheim erreichbar machen. Alte Dorf-/Arenakoordinaten nicht versetzen, existierende Spieler-Positionen und Spielstände unverändert laden. Tests für Zurückreisen, Abbrechen, Controller/Touch und Save/Load. Anschließend M01-06 visuelle Gesamtprüfung und dann Kapitel 3 Nebelhafen.

## Weiter offen

M00-03: 150 Wesen auf passende Front-/Rückansichten prüfen; 15 Rückansichten sind ergänzte Varianten, 50 Arten tragen Platzhalternamen. Story-Kapitel 3 bis 14 und Echo-Bahn sind noch nicht spielbar. Die geplante regionale Monsterverteilung in MONSTER_DISTRIBUTION.csv ist NICHT schon als Wildtabelle implementiert.

## In einem neuen Chat lesen

00_INDEX.md, PRODUCTION_TASKS.csv, ENCOUNTER_REGISTRY.md, SYSTEMS_ARCHITECTURE.md, QUEST_FLAGS_AND_SAVES.md, WORLD_GRAPH.json, CHAPTERS/CH03.md, dann aktuellen Quellcode und Tests.

Nach jedem Auftrag GitHub-Tests, echte Screenshots, PRODUCTION_TASKS.csv, CHANGELOG.md und diese Datei aktualisieren; keine weitere Android-App-ID oder Debug-Signierung verwenden.
