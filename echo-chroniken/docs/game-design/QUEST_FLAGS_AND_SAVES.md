# Quest-Flags, Save-Schema und Migrationsvertrag

> **Das folgende Kapitelmodell ist Design, nicht bereits in der APK.** Code-Flags aus dem Ist-Zustand behalten ihren Namen und ihre Bedeutung.

## Altbestand und neue Flags

| Flag | Typ | Standard | Status |
| --- | --- | --- | --- |
| hasStarter | boolean | false | CURRENT_CODE |
| gymDefeated | array | [false, false, false] | CURRENT_CODE |
| ruinsProgress.reported | boolean | false | CURRENT_CODE |
| ruinsProgress.bossWon | boolean | false | CURRENT_CODE |
| routeQuest.guardianWon | boolean | false | CURRENT_CODE |
| routeQuest.rewarded | boolean | false | CURRENT_CODE |
| routeQuest.lights | array | [] | CURRENT_CODE |
| routeQuest.accepted | boolean | false | CURRENT_CODE |
| introStage | integer | 0 | CURRENT_CODE |
| story.ch01.stage | integer | 0 | FUTURE |
| story.ch01.completed | boolean | false | FUTURE |
| story.ch01.rewardClaimed | boolean | false | FUTURE |
| story.ch02.stage | integer | 0 | FUTURE |
| story.ch02.completed | boolean | false | FUTURE |
| story.ch02.rewardClaimed | boolean | false | FUTURE |
| story.ch03.stage | integer | 0 | FUTURE |
| story.ch03.completed | boolean | false | FUTURE |
| story.ch03.rewardClaimed | boolean | false | FUTURE |
| story.ch04.stage | integer | 0 | FUTURE |
| story.ch04.completed | boolean | false | FUTURE |
| story.ch04.rewardClaimed | boolean | false | FUTURE |
| story.ch05.stage | integer | 0 | FUTURE |
| story.ch05.completed | boolean | false | FUTURE |
| story.ch05.rewardClaimed | boolean | false | FUTURE |
| story.ch06.stage | integer | 0 | FUTURE |
| story.ch06.completed | boolean | false | FUTURE |
| story.ch06.rewardClaimed | boolean | false | FUTURE |
| story.ch07.stage | integer | 0 | FUTURE |
| story.ch07.completed | boolean | false | FUTURE |
| story.ch07.rewardClaimed | boolean | false | FUTURE |
| story.ch08.stage | integer | 0 | FUTURE |
| story.ch08.completed | boolean | false | FUTURE |
| story.ch08.rewardClaimed | boolean | false | FUTURE |
| story.ch09.stage | integer | 0 | FUTURE |
| story.ch09.completed | boolean | false | FUTURE |
| story.ch09.rewardClaimed | boolean | false | FUTURE |
| story.ch10.stage | integer | 0 | FUTURE |
| story.ch10.completed | boolean | false | FUTURE |
| story.ch10.rewardClaimed | boolean | false | FUTURE |
| story.ch11.stage | integer | 0 | FUTURE |
| story.ch11.completed | boolean | false | FUTURE |
| story.ch11.rewardClaimed | boolean | false | FUTURE |
| story.ch12.stage | integer | 0 | FUTURE |
| story.ch12.completed | boolean | false | FUTURE |
| story.ch12.rewardClaimed | boolean | false | FUTURE |
| story.ch13.stage | integer | 0 | FUTURE |
| story.ch13.completed | boolean | false | FUTURE |
| story.ch13.rewardClaimed | boolean | false | FUTURE |
| story.ch14.stage | integer | 0 | FUTURE |
| story.ch14.completed | boolean | false | FUTURE |
| story.ch14.rewardClaimed | boolean | false | FUTURE |
| story.ch15.stage | integer | 0 | FUTURE |
| story.ch15.completed | boolean | false | FUTURE |
| story.ch15.rewardClaimed | boolean | false | FUTURE |
| saveSchemaVersion | integer | 2 | FUTURE |
| currentMapId | string | "legacy_wurzeldorf" | FUTURE |
| safeSpawnId | string | "legacy_default" | FUTURE |
| railUnlocked | array | [] | FUTURE |
| railTripsCompleted | array | [] | FUTURE |
| lastSafeHub | string | "wurzeldorf_outdoor" | FUTURE |


## Pflichtmigration in festen Schritten

1. Snapshot des bestehenden `localStorage['echo_chroniken_tv_save']` vor Update lesen, nie löschen. Ein originaler Save bleibt als unveränderte Fallback-Kopie im Speicher, wenn überhaupt eine Migration begonnen wird.

2. Neue Felder **additiv** ergänzen; `gameState.team`, Monster-ID, aktuelles Level, HP, Attackenbuch, Pokédex, `introStage`, `gymDefeated`, `routeQuest`, `ruinsProgress`, Vorräte und Nebenquestflags nicht überschreiben.

3. Bei alten Saves ohne `currentMapId` mapId `legacy_wurzeldorf` vergeben und Koordinaten erhalten. Bei Haus-Szene `scene=HOUSE` zuerst die alte Hausposition sicher wiederherstellen; nicht durch neues Map-Design überschreiben.

4. Pro Kapitel Start und Abschlussflag aus Altzustand nur ableiten, wenn vorhandene, eindeutige Indikatoren vorliegen. Kapitel 2 gilt erst abgeschlossen bei bestätigtem Ruinenabschluss und Auswertung; fehlende Angaben führen **nicht** zu erfundenem Fortschritt.

5. Rail-Schema nur ergänzen; vorhandene Spieler bekommen sichere erste Route, aber keine vorzeitig offenen späten Stationen.

6. Immer atomar speichern. Bei ungültiger mapId auf sicheren Wurzelheim-Spawn zurücksetzen **ohne Team, Items, Kapitel-Flags zurückzusetzen**. Fehler dem Spieler anzeigen.

7. Savegame-Schema per Testmatrix prüfen: vor Paket, nach Miora, mitten in Seelenlichtern, nach Ruinenboss, mitten in Arena, nach Bahnreise, nach Finale, nach Ladefehler.

## Verbotene Fälle

Questabschluss ohne einmalige Belohnungsflag; Fangen in unbekannte Art-ID; Hintergrundmigration beim Rendern; mehrfaches Erteilen der Starterkapsel; Kapitel-12-Dialog setzt Maternalis-Entwicklung voraus; Bahnteleport in nicht existente Map; Rückfahrstrecke ohne Ziel-Spawn.

## Story-Event-Deklaration (Vorschlag)

Jedes Event: id, chapterId, kind, prerequisites[], mapId, triggerId, dialogueId, effects[], once, rollbackPolicy. Storytext, Encounter und Map dürfen keine versteckten harten X/Y-Abfragen mehr ergänzen. Flags und Belohnungstransaktionen aus einem Event-Dispatcher.

## Automatische Teststrategie

Testdateien unter `echo-chroniken/project/tests/` und neue `story-migration.cjs`, `world-map.cjs`, `railway.cjs`, `chapters-completion.cjs`; Details in TEST_PLAN.md. Bei jedem Commit alte 14 Checks mit ausführen.
