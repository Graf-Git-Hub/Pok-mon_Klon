# CONTINUE HERE – exakter Projektstand und nächster Task

**Datum Dokumentation:** 2026-11-01. **Basis-Commit vor dieser Roadmap:** `edfeb6c`. Der tatsächliche Roadmap-Commit steht im Git-Verlauf. **Produktiv:** Kapitel 1/2 teilweise spielbar, Android v0.14.0. **Konzeption:** Kapitel 3–14, Postgame, Bahn und neue Maps fertig ausgearbeitet; NICHT in der APK implementiert.

## Nächste verbindliche Arbeit

**Task M00-02 → M01-01:** Zuerst historische Spielstände als Golden-Save-Fixtures für vor Paket, nach Paket, mitten in Seelenlichtern, nach Ruinenboss, Arena, neues Format und beschädigte Save sichern. Dann eine MapRegistry einführen, die die existierende 36×28-Welt als `legacy_wurzeldorf` unverändert lädt. Neue Felder `currentMapId`/`safeSpawnId` ausschließlich additiv migrieren. **Noch KEINE neue Hafenmap bauen**, bevor die alten 14 Tests plus neue Save-/Map-Tests grün sind.

## Lese-Reihenfolge für neuen Chat

1. `00_INDEX.md`. 2. `PROJECT_BASELINE.md`. 3. `IMPLEMENTATION_ROADMAP.md` Tasks M0/M1. 4. `QUEST_FLAGS_AND_SAVES.md`. 5. `WORLD_MAP.md` und `WORLD_GRAPH.json`. 6. `CHAPTERS/CH03.md`. 7. Aktuelle `project/src/game.js`, `data/species.js` und Tests.

## Blocker und Entscheidungen

Varek/Mira/Kontinuum sind noch nicht ausdrücklich vom Nutzer freigegebene kreative Vorschläge. 50 Platzhalternamen und 15 Rückansichtsvarianten sind noch zu prüfen. Noch kein MapRegistry-/Bahnsystem. Echter vollständiger Geräte- und Spieltest fehlt.

## NICHT tun

Keine separate neue Android-App veröffentlichen; die feste Signatur erhalten. Keine alten Koordinaten/NPCs ohne Save-Migration ändern. Nicht behaupten, alle 14 Kapitel seien schon programmiert. Die fertige Lore nicht bei jedem neuen Chat unbemerkt umschreiben.

## Arbeitsende einer Folge-Session

Task in `PRODUCTION_TASKS.csv` mit Testergebnis/Commit aktualisieren. `CHANGELOG.md` ergänzen. Hier aktuellen Task, offene Blocker und HEAD eintragen. Änderungen nach GitHub pushen. Der nächste Chat bekommt dann wieder diese Datei.
