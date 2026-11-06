# Zusammenführung: intelligente Gegner-KI und fünf Taktikstrategien

**Stand:** 06.11.2026. Grundlage: PR #35, #38 (Taktiktests), PR #37 (spielbare intelligente Gegnerentscheidungen).
Arbeit in isoliertem Worktree `Echo_SmartAI_Merge_20261106`. Original-Laptop-Projektverzeichnis und Spielstände bleiben unverändert.

## Was im echten Spiel besser wird

Gegner ab Level 9 wählen im echten Battle-Code (`src/game.js`) ihre Aktion mit `EchoSkillbook.ENEMY_AI.choose` anhand erwarteter Trefferstärke, Elementwirksamkeit, kritischer KP, Überlebenswahrscheinlichkeit und optionalem Statusnutzen. Ein wahrscheinlicher sofortiger K.-o. wird gegenüber unnötiger Heilung bevorzugt. Heilung wird nur einmal pro Gegnerkampf und nur bei sinnvoller Überlebensverbesserung genutzt. Bestehender Brand, Frost/Schock/Verwirrung, Schutz und Regeneration werden berücksichtigt, damit nicht sinnlos doppelt nachgelegt wird. Die Gegner der Level 1–8 spielen absichtlich weiterhin einfacher. Keine Änderung an Art-IDs, Spieler-Saves oder Android-Signatur.

## Reale Simulationsprüfungen

**12.000 identische Startpaarungen, insgesamt 24.000 Engine-Kämpfe:**

| Vergleich | Gegner alte KI | Gegner neue KI |
| --- | ---: | ---: |
| Siege des simulierten Spielers | 7.377 (61,48 %) | 6.995 (58,29 %) |
| Siege gegen frühe Level | 62,50 % | 60,47 % |
| Durchschnittliche Runden | 6,04 | 6,00 |
| Nicht abgeschlossene Kämpfe | 0 | 0 |

Gegen die alte KI war der Spieler in **467** Paaren erfolgreich, gegen die neue nicht. Im Gegenzug gewann er gegen die neue KI **85** Mal, gegen die alte nicht. Das ist ein Unterschied in der Schwierigkeit, aber **kein Nachweis von mehr Spielspaß**.

**Fünf Spielerstrategien gegen die neue Gegner-KI, gleiche 15.000 Startpaarungen, insgesamt 75.000 Kämpfe:**

| Spielerstrategie | Siege | Quote |
| --- | ---: | ---: |
| Höchste Rohkraft | 8.332 | 55,55 % |
| Höchste Elementwirkung | 8.892 | 59,28 % |
| Elementwirkung mit Heilung | 8.871 | 59,14 % |
| Elementwirkung mit Statusbonus | 8.893 | 59,29 % |
| Heilung plus Statusbonus | 8.871 | 59,14 % |

Alle 75.000 Kämpfe wurden beendet. Die Gegner-KI trifft nun bessere Entscheidungen. Auf Spieler-Seite ist die bisherige *simple* Heilheuristik nicht erfolgreich; das ist ein weiterer Entwicklungsansatz, kein Anlass für unkontrollierte Angriffsverstärkungen.

Die eigene Cloud-Regression für 100.000 reproduzierbare zufällige Kämpfe muss weiterhin mit der aktualisierten Golden-Referenz bestehen. Zusätzlich müssen die 150×150-Matrix, gesamte natürliche Geschichte und Android-/Touch-/Save-Tests grün bleiben, bevor der neue Code in `main` übernommen wird.

## Grenzen

Das sind tatsächliche Engine-Aufrufe, kein menschlicher Mehrstunden-Spieltest. Der simulierte Spieler handelt grundsätzlich zuerst und nutzt vorgegebene Attackenstrategien. Unterschiede in der Zufallsverbrauchsfolge nach voneinander abweichenden Aktionen erschweren eindeutige kausale Interpretation. Physische Android- und TV-Steuerung sind nicht in dieser Simulationsreihe enthalten.

Die beiden Dokumentationsstände und der neue vollständige fünf-Strategien-JSON-Bericht wurden bei der Zusammenführung erhalten bzw. aus dem kombinierten Code neu erzeugt.
