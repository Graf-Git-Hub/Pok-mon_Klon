# CONTINUE HERE – exakter nächster Arbeitsschritt

Stand: 01.11.2026. Android v0.16.0 ist dauerhaft signiert, geprüft und veröffentlicht (Build 4272e94). Basiskommit vor dieser Aufgabe: 085f7ab. Aktuellen HEAD bei Beginn neuer Arbeit erneut lesen.

## Abgeschlossen

- M00-02: acht synthetische alte Spielstände und ein defektes JSON als Migrationstests.
- M01-01: MapRegistry mit unveränderter Wurzelheim-Karte (36x28).
- M01-02: additives Save-Schema 2 und lokales einmaliges Originalbackup älterer Spielstände.
- **M01-03:** StoryRegistry mit zehn bestehenden Quest-IDs; die vier Belohnungen von Liora, Piko, Erinnerungshüter und Oma Martha werden über die bisherigen Questflags exakt einmal erteilt. Bereits vorhandene Spielstände erhalten keine zusätzlichen Questfelder. Der Adapter ist in Browser und Offline-HTML eingebunden.

Noch nicht spielbar: Nebelhafen, Echo-Bahn, Kapitel 3–14. Storykonzeption ist weiterhin getrennt vom Code.

## EXAKT NÄCHSTER TASK: M01-04

EncounterRegistry mit mapId und festen Art-IDs. Als erste Karte nur legacy_wurzeldorf registrieren; existierenden fairen Anfangspool und Levelregeln beibehalten. 150 Arten validieren, Wahrscheinlichkeits-Gewichte summieren, unbekannte IDs und Entwicklungsformen in frühen Grasfeldern ausschließen. Neue Tests für sichere Default-Tabelle, Mapwechsel und Wiederholbarkeit. Erst nach M01-04 die realen bidirektionalen Portale (M01-05) und die visuelle Gesamt-QA (M01-06) einbauen, dann Kapitel 3 Nebelhafen.

Unabhängig offen: M00-03, grafische Eins-zu-eins-Prüfung aller 150 Arten (15 ergänzte Rückansichten und 50 generische Namen).

## Neues Chatfenster / Arbeitsregel

Lies erst 00_INDEX.md, IMPLEMENTATION_ROADMAP.md, PRODUCTION_TASKS.csv, QUEST_FLAGS_AND_SAVES.md, SYSTEMS_ARCHITECTURE.md und WORLD_GRAPH.json. Danach aktuellen Gamecode und Git-HEAD prüfen. Alte Questflags, Inventar, Team, Kartenpositionen, Spielersteuerung und Android-Signierung erhalten. Nach jedem Schritt alle Tests, echte Screenshots, CONTINUE_HERE.md und CHANGELOG.md aktualisieren und committen.
