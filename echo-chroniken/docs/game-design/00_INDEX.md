# Echo-Chroniken – zentraler Projektindex

> **Hier beginnt jeder neue Chat.** Planung im Repo unter `echo-chroniken/docs/game-design/`. Maßgeblich für implementierte Features bleiben der aktuelle Code und die Tests, nicht die geplante Geschichte.

## So geht es in einem neuen Chat weiter

Kopieren: „Öffne Graf-Git-Hub/Pok-mon_Klon, lies echo-chroniken/docs/game-design/CONTINUE_HERE.md sowie 00_INDEX.md, prüfe Git-HEAD und erledige den nächsten TODO-Task. Danach Tests, Changelog und Fortsetzungsdatei aktualisieren.“

## Alle permanenten Arbeitsdateien

| Datei | Inhalt |
| --- | --- |
| [CONTINUE_HERE.md](CONTINUE_HERE.md) | Exakt nächster Schritt und Blocker |
| [PROJECT_BASELINE.md](PROJECT_BASELINE.md) | Istzustand, alte Save-Flags, APK |
| [STORY_BIBLE.md](STORY_BIBLE.md) | Kanon und vollständige Story |
| [CHARACTERS_AND_LORE.md](CHARACTERS_AND_LORE.md) | Charaktere, Zeitleiste und Ton |
| [WORLD_MAP.md](WORLD_MAP.md) | Weltgraph, Map-IDs und Verbindungen |
| [WORLD_GRAPH.json](WORLD_GRAPH.json) | Maschinenlesbarer Weltgraph |
| [ECHO_RAILWAY.md](ECHO_RAILWAY.md) | Bahnstationen, Routen, sichere Rückreise |
| [MONSTER_DISTRIBUTION.md](MONSTER_DISTRIBUTION.md) | Auswertung aller Wesen |
| [MONSTER_DISTRIBUTION.csv](MONSTER_DISTRIBUTION.csv) | 150 Original-IDs, Arten, Entwicklung, Fundort-Vorschlag |
| [QUEST_FLAGS_AND_SAVES.md](QUEST_FLAGS_AND_SAVES.md) | Flags und Save-Migration |
| [QUEST_FLAGS.csv](QUEST_FLAGS.csv) | Maschinenlesbares Flag-Verzeichnis |
| [SYSTEMS_ARCHITECTURE.md](SYSTEMS_ARCHITECTURE.md) | Map- und Encounter-Architektur |
| [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) | Meilensteine und DoD |
| [PRODUCTION_TASKS.csv](PRODUCTION_TASKS.csv) | Tasks mit Abhängigkeiten und Status |
| [ASSET_PIPELINE.md](ASSET_PIPELINE.md) | Tilesets, Sprites, Sounds, QA |
| [TEST_PLAN.md](TEST_PLAN.md) | Regressionen, Android, Screenshots |
| [DECISIONS_AND_RISKS.md](DECISIONS_AND_RISKS.md) | Freigaben, Risiken, offene Entscheidungen |
| [CHANGELOG.md](CHANGELOG.md) | Versioniertes Änderungsprotokoll |
| [MASTER_STORY_ROADMAP.md](MASTER_STORY_ROADMAP.md) | Alle Kapitel in einem einzigen langen Lesedokument |


## Kapiteldateien

| Kapitel | Inhalt | Stand |
| --- | --- | --- |
| [Kapitel 01](CHAPTERS/CH01.md) | Das versiegelte Paket | bereits teilweise implementiert |
| [Kapitel 02](CHAPTERS/CH02.md) | Das Flüstern im Wald | bereits teilweise implementiert |
| [Kapitel 03](CHAPTERS/CH03.md) | Stimmen am Seelen-See | vollständig geplant, nicht programmiert |
| [Kapitel 04](CHAPTERS/CH04.md) | Unter den Wurzeln | erster spielbarer Abschnitt mit zwei Bahnstationen und fünf Karten (v0.19.0) |
| [Kapitel 05](CHAPTERS/CH05.md) | Das Dorf, das niemand verlässt | erster spielbarer Ausbau mit 5 Karten und der zweiten Bahnstrecke (v0.21.0) |
| [Kapitel 06](CHAPTERS/CH06.md) | Glut unter der Asche | spielbarer Erstaufbau v0.22.0 (4 Karten, Schmiede, 2 Bosse) |
| [Kapitel 07](CHAPTERS/CH07.md) | Der Garten der Namen | spielbarer Erstaufbau v0.22.0 (4 Karten, Echo-Spuren) |
| [Kapitel 08](CHAPTERS/CH08.md) | Kronenstadt | spielbarer Erstaufbau v0.22.0 (5 Karten, Archiv, Bahnhof) |
| [Kapitel 09](CHAPTERS/CH09.md) | Frostgrat | spielbarer Erstaufbau mit Phasenlaterne und Vex (v0.23.0) |
| [Kapitel 10](CHAPTERS/CH10.md) | Die Stadt unter der Stadt | spielbarer Erstaufbau mit Zentralring und friedlichem Bossweg (v0.23.0) |
| [Kapitel 11](CHAPTERS/CH11.md) | Das Sternenobservatorium | spielbarer Erstaufbau mit Varek, Sternenkuppel und Echos (v0.23.0) |
| [Kapitel 12](CHAPTERS/CH12.md) | Maternalis | spielbarer Erstaufbau mit Familiengeschichte und Schachtschluessel (v0.24.0) |
| [Kapitel 13](CHAPTERS/CH13.md) | Resonanzschacht | spielbarer Erstaufbau mit Schacht, Vater und Schutzcode (v0.24.0) |
| [Kapitel 14](CHAPTERS/CH14.md) | Niemand gehört für immer | spielbarer Erstaufbau mit Finale, Epilog und Credits (v0.24.0) |
| [Postgame](CHAPTERS/POSTGAME.md) | Postgame: Die freien Linien | vollständig geplant, nicht programmiert |


## Pflichtregeln

1. Vor Codeänderung CONTINUE_HERE und Ist-Code lesen. 2. Keine geplante Map als bestehend ausgeben. 3. Monster-IDs nicht umnummerieren; alte Saves nicht ändern, bevor Migrationstests existieren. 4. Für jedes Feature Spielscreenshot, Tests, neuer Commit. 5. Danach CONTINUE_HERE aktualisieren. 6. APK niemals mit neuer Debug-Signatur veröffentlichen.

## EncounterRegistry seit v0.17

[API, Gewichtungsregeln und Zukunftskarten](ENCOUNTER_REGISTRY.md). Aktuell nur Wurzelheim aktiv; spätere Regionen sind Planung.
