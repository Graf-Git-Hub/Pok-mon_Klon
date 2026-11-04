# Kapitel 11–14, Abspann und Postgame: echte Browser-Eingaben

**Stand:** 04.11.2026. **Skript:** `project/qa/real-chapter11-14.py`.

## Verifizierter Umfang

Ein vorbereiteter Spielstand unmittelbar nach abgeschlossenem Kapitel 10 wurde durch dieselbe Testlogik in **Chrome 157 auf Desktop-Tastatur (1280x800) und Handy-Touch (412x915)** gespielt. Der Test bewegt die Spielfigur ausschließlich mit Tastendrücken / Touch-Tasten. Kartenkacheln dienen nur für die BFS-Wegplanung, **niemals für Teleportation oder Quest-Fortschritts-Manipulation**. Bossgegner werden durch echte Eingaben im Kampfmenü mit realer Schadensberechnung besiegt.

| Messwert | Desktop | Touch | Gesamt |
| --- | ---: | ---: | ---: |
| Gelaufene Schritte | 1473 | 1473 | 2946 |
| Dialoginteraktionen | 88 | 88 | 176 |
| Boss-Siege | 6 | 6 | 12 |
| Tatsächliche Angriffe | 49 | 48 | 97 |
| Speicher-/Neulade-Checkpoints | 10 | 10 | 20 |
| JavaScript-Ausnahmen | 0 | 0 | 0 |

Die sechs Bosskämpfe pro Ansicht sind Varek (Kapitel 11), Schachtwache (13), Varek-Finale (14) sowie drei optionale Postgame-Gartenprüfungen. Alle Quest-/Dialog-Gates der Kapitel 11–14, Kapitelbelohnungen ohne Duplikation, Mutter-Erinnerung, drei Zwangsanker, Schutzcode, drei Erinnerungen, Freigabe, **Abspann und vollständiges Postgame (sechs Wiesen, Museum, drei Prüfungen, Gartenfest)** wurden geprüft. Der Abschlussspielstand enthält `main_story_finished`, `chapter14.credits` und `optional_postgame_completed`. Im Postgame wurden Ruhestationen mit den **normalen Spiel-Eingaben** genutzt.

**Nachweise:** `docs/visual-audit/real-chapter11-14/report.json`, je neun Desktop- und Touch-Screenshots im Cloud-Artefakt `echo-browser-checkpoints` nach erfolgreicher CI. Testaufruf im isolierten Worktree: `python echo-chroniken/project/qa/real-chapter11-14.py`.

## Aussagegrenzen

- Synthetischer Start **nach Kapitel 10** und **absichtlich starker QA-Kämpfer Level 55 mit 480 KP**: überprüft Story/Bedienung, **nicht normales Spieler-Balancing**.
- Wildbegegnungen werden für den festen Story-Test unterdrückt; Kampfzufall und Boss-Schaden bleiben echt.
- Keine nachgewiesene natürliche XP-/Fang-/Ressourcenentwicklung ab Oma/Paket/Kapitel 1 und keine gemessene Gesamtspielzeit. Ein lückenloser Einzelspielstand über alle Kapitel bleibt offen.
- Chrome-Touch-Simulation ersetzt **keinen Test auf Android-Handy oder TV mit Controller**.
- Keine optischen Spieländerungen.

## Separate Balance-Diagnostik

Siehe `BALANCE_PASS_20261104.md`. Neue Heiltrank-Regression `project/tests/battle-potions.cjs` prüft Skalierung, Verbrauch und gespeicherte Teamheilung. `project/tests/early-wild-balance.cjs` und `late-team-balance.cjs` nutzen feste Zufallsseeds und reale Engine-Funktionen; sie ersetzen keine vollständige Spielkampagne.
