# Entwicklungsroadmap – von den 14 Kapiteln zum Abspann

> **Startpunkt: bestehende Android-APK v0.14.0 und bestehende 14 Node-Tests.** Die nachstehenden Aufgaben sind Planung und ausdrücklich keine Behauptung über bereits eingebaute Features.

## Arbeitsregel

Immer nur ein überschaubarer, lauffähiger Schritt, dazu zugehörige Tests, Screenshot und Commit. Story, Welt-Graph und IDs bestimmen die Reihenfolge; keine neue große Map wird gebaut, solange ihre geplanten Nachbarmaps, Portale, Bahneingänge und Rückwege nicht geklärt sind.

## Milestones und Abhängigkeiten

| Milestone | Inhalt | Fertig, wenn |
| --- | --- | --- |
| M0 | Quellcode- und Savegame-Baseline | Snapshot vorhanden, 14 bestehende Tests grün, 150 Art-IDs belegt |
| M1 | Map-/Quest-/Encounter-Registry und Save-Migration | Wurzelheim und bestehende Intro-/Ruinenquests unverändert spielbar |
| M2 | Kapitel 3: Seeufer, Nebelhafen, Pumpwerk | Kompletter Loop Intro→See→Pumpwerk→Rückkehr |
| M3 | Kapitel 4: Echo-Bahn & Moorglas | Sichere Hin-/Rückfahrt und Kapitelabschluss |
| M4 | Kapitel 5–7: Stillwasser, Glut, Lichterhain | Drei neue Regionen, Mechaniken, Backtracking durchgetestet |
| M5 | Kapitel 8–10: Kronenstadt, Frost, Unterstadt | Zentrale Bahn, Varek-Enthüllung, Phasenlaterne |
| M6 | Kapitel 11–14: Observatorium, Familie, Schacht, Finale | Endboss, Epilog, sicherer Weltzustand nach Credits |
| M7 | Postgame, Artenabdeckung, Balance, Android-Regressionsrunde | Vollständiger Hauptdurchlauf und 150er-Lexikon erreichbar |


## Exakte Auftragsliste

| ID | Meilenstein | Auftrag | Abhängig von | Aufwand | Status |
| --- | --- | --- | --- | --- | --- |
| M00-01 | M0 | Audit current 0.14 source, record exact 14 tests | - | S | DONE |
| M00-02 | M0 | Back up old save formats and write migration fixtures | M00-01 | M | TODO |
| M00-03 | M0 | Verify 150 creature IDs, 50 placeholder names and art assignments | M00-01 | M | TODO |
| M01-01 | M1 | Create MapRegistry with legacy 36×28 map adapter | M00-02 | L | TODO |
| M01-02 | M1 | Add future save fields, currentMapId and safeSpawnId | M01-01 | L | TODO |
| M01-03 | M1 | Create StoryRegistry/QuestFlag adapter | M01-02 | M | TODO |
| M01-04 | M1 | Create EncounterRegistry by mapId and species ID | M01-01 | M | TODO |
| M01-05 | M1 | Create bidirectional portal and safe-return tests | M01-01 | M | TODO |
| M01-06 | M1 | Build screenshots/visual audit in runner for maps | M01-01 | M | TODO |
| M02-01 | M2 | Greybox lake route and Nebelhafen town | M01-05 | M | TODO |
| M02-02 | M2 | Design pumpworks floor1 and controlroom puzzle | M02-01 | L | TODO |
| M02-03 | M2 | Implement chapter 3 NPC dialog and audio evidence | M01-03,M02-02 | M | TODO |
| M02-04 | M2 | Place wild encounter table, Kael migration design | M01-04,M02-03 | M | TODO |
| M02-05 | M2 | Chapter 3 visual QA, performance, release gate | M02-04 | M | TODO |
| M03-01 | M3 | Implement RailRegistry and bidirectional station UI | M02-05 | L | TODO |
| M03-02 | M3 | Build underground Wurzelheim and Moorglas station | M03-01 | L | TODO |
| M03-03 | M3 | Chapter 4 story, courier, switchyard and boss | M03-02 | M | TODO |
| M03-04 | M3 | Rail regression on TV gamepad and phone | M03-03 | M | TODO |
| M04-01 | M4 | Chapter 5 Stillwasser and memory-loop investigation | M03-04 | L | TODO |
| M04-02 | M4 | Chapter 6 Aschenruh, Glutklamm and forge | M04-01 | L | TODO |
| M04-03 | M4 | Chapter 7 Lichterhain and Echo-spur system | M04-02 | L | TODO |
| M05-01 | M5 | Chapter 8 Kronenstadt 4 compact districts | M04-03 | XL | TODO |
| M05-02 | M5 | Chapter 9 Frostgrat and phase lantern | M05-01 | L | TODO |
| M05-03 | M5 | Chapter 10 Unterstadt and central ring | M05-02 | L | TODO |
| M06-01 | M6 | Chapter 11 observatory, Varek confrontation | M05-03 | L | TODO |
| M06-02 | M6 | Chapter 12 Elena/Maternalis family scenes | M06-01 | M | IN_PROGRESS |
| M06-03 | M6 | Chapter 13 resonance shaft and father confession | M06-02 | XL | IN_PROGRESS |
| M06-04 | M6 | Chapter 14 final fight, epilogue and credits | M06-03 | XL | IN_PROGRESS |
| M07-01 | M7 | Postgame species accessibility and side content | M06-04 | L | TODO |
| M07-02 | M7 | Rename 50 generic monsters after visual review | M00-03 | L | TODO |
| M07-03 | M7 | Full balance pass with playthrough reports | M07-01 | L | TODO |
| M07-04 | M7 | End-to-end Android phone + TV test and signed release | M07-03 | XL | TODO |
| M07-05 | M7 | Localization and accessibility second pass | M07-04 | M | TODO |


## Aufwandsschätzung

XS = einzelne Daten-/UI-Korrektur, S = kleiner klarer Task, M = mehrere Dateien + Tests, L = komplette Mechanik oder Kapitel-Slice, XL = mehrere Maps/Systeme und QA. Das sind relative Größen, keine ungesicherten Zeitversprechen. Ein Solo-Projekt wird nach jeder produktiven Runde neu priorisiert.

## Definition of Done je Task

Funktion im echten Spiel über Controller und Touch nutzbar; keine alten Speicherstände verloren; alle automatisierten Prüfungen grün; mindestens eine Originalaufnahme pro neuer Karte/Interaktion; keine Platzhalter-Kollisionen; neue Flags dokumentiert; Git-Commit enthält Test und Dokumentänderung.

## Nächster Schritt

**M00-02 → M01-01**: Golden Save Fixtures erzeugen, die aktuelle 36×28-Oberwelt als legacy mapId registrieren, MapRegistry ohne sichtbare Änderungen hinzufügen, Save-Roundtrip prüfen. **Noch keine neue Nebelhafen-Map** bevor M1 grün ist.

Detaillierte Zeilen sind in `PRODUCTION_TASKS.csv`; bei Abschluss Status von TODO auf DONE mit SHA und Testbeleg ändern. Nach jedem Arbeitstag `CONTINUE_HERE.md` aktualisieren.
