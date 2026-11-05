# Echo-Chroniken: gezieltes Balancing und 100.000 Zufallskämpfe

**Stand:** 05.11.2026, auf Grundlage der verifizierten Hauptversion nach PR #32 (`aac847d`). Separater Worktree `Echo_Random100k_Balance_20261105`.

## Schritt 1: Balancing vor dem großen Zufallstest

Die bereits vorhandene vollständige 150×150-Matrix wurde **vorher** und nach zwei kleinen, kontrollierten Tuningrunden ausgeführt (jeweils 135.000 Engine-Duelle bei Level 10, 20 und 30, mit zwei unabhängigen Seeds). Verändert wurden nur HP/Angriff/Verteidigung der ausgewählten Wesen. Ihre IDs, Namen, Evolutionswege, Elementtypen, Attacken, Save-Schema und Storyregeln bleiben identisch. Miora und Maternalis wurden bewusst nicht verändert. Ein gezielter Regressionstest fixiert die Werte.

| Wesen | Ausgangsquote gleiche Stufe | Finale Quote |
| --- | ---: | ---: |
| Hasengeist II | 20,83 % | **42,80 %** |
| Katzengeist II | 23,86 % | **40,53 %** |
| Katzengeist I | 31,21 % | **37,77 %** |
| Eulengeist II | 30,68 % | **42,42 %** |
| Skelett-Hund III | 27,78 % | **37,04 %** |
| Rosahoppel | 31,91 % | **42,91 %** |
| Rosagrunzer | 30,14 % | **40,07 %** |
| Robbengeist II (gezielte Dämpfung) | 84,85 % | **73,86 %** |

Weiter angepasst: Hasengeist I, Waschbärgeist II, Zombiehase III. Weiterhin ein auffälliger Ausreißer ist Maternalis mit 100 % in diesem Modell; die Figur ist das erzählerisch besondere Endstadium des Starters und wurde nicht ohne separate Designabnahme geschwächt. Beide finalen Matrix-Durchläufe beendeten alle 135.000 Kämpfe ohne Zeitlimitüberschreitung.

## Schritt 2: 100.000 vollständig zufällige Kämpfe (PC Laura)

Der Test `project/tests/combat-100000-random.cjs` zieht **beide Arten unabhängig, gleichverteilt und reproduzierbar per Seed aus allen 150 Wesen**. Anders als die alte 10.000er-Serie wird keine feste Angreiferreihenfolge oder festes Gegner-Schema erzwungen. **Jede Art** wird als Angreifer mindestens 608-mal und als Gegner mindestens 611-mal ausgewählt.

Die Level werden unabhängig aus 5/10/15/20/25/30 gezogen: bei einer Hälfte der Partien zunächst identisch gesetzt, bei der anderen Hälfte unabhängig gezogen (zufällige Gleichstände sind hier ebenfalls möglich). So entstanden **58.415 Duelle mit identischen Levels**, der Rest mit möglichen Level-Unterschieden. Die Angriffsstrategie wird je Duell zufällig zwischen höchstem Rohschaden, bestem Elementtreffer und schwächster offensiver Attacke gezogen. Die Engine benutzt die existierende gegnerische KI sowie aktive Element- und Statusregeln; keine Heiltränke oder echten Spielstände.

| PC-Ergebnis | Wert |
| --- | ---: |
| Duelle | **100.000** |
| Siege des zuerst angreifenden Spielers | **50.191 / 50,19 %** |
| Niederlagen | **49.809** |
| Nicht abgeschlossene Kämpfe nach 75 Zügen | **0** |
| Durchschnittliche Runden | **5,98** |
| Längster Kampf | **14 Runden** |
| Taktik nach Element | **19.681 / 33.126 = 59,41 %** |
| Höchste Rohkraft | **18.859 / 33.641 = 56,06 %** |
| Schwächste Attacke | **11.651 / 33.233 = 35,06 %** |

Unveränderlicher deterministischer PC-Prüffingerabdruck der 100.000 Begegnungs- und Ergebnisfolgen:

`4de8470b3272ec428768b971cd3541503960734a51a4b1dd426e892fab07113a`

Ein ausführlicher Bericht mit Level- und Entwicklungsstufen-Verteilungen, gleichstufigen Ausreißern und allen 150 Art-Ergebnissen liegt in `docs/visual-audit/battle-matrix/duel-100000-random-report.json`.

## Schritt 3: GitHub-Gegenprobe

Das separate GitHub-Actions-Workflow `echo-100000-random.yml` startet **dieselben 100.000 Zufallsduelle** mit demselben Projektstand und Seeds, prüft Siege, Niederlagen, keine Timeouts, den Prüffingerabdruck und den vollständig identischen JSON-Bericht. Es speichert die Ergebnisse außerdem als herunterladbares Build-Artefakt.

## Grenzen und nächste Schritte

Die Simulation trifft keine menschlichen Entscheidungen und enthält keine Heiltränke, Fangstrategien, Sechserteams, Controller-Hardware oder Spielzeitbewertung. Der Spieler handelt im Engine-Modell immer zuerst; die KI wählt ihre eigenen Attacken. Die Siegquoten unterschiedlicher Strategiegruppen stammen aus verschiedenen randomisierten Begegnungen. Sie sind **kein paarweise kontrollierter Beweis einer kausalen Überlegenheit**.

Neu auffällig im randomisierten 100k-Bericht sind Zombiehase I und Waldhirsch I als mögliche schwache Kandidaten. **Vor neuen Änderungen** sollten diese gezielt auf gleichen Leveln und mit kontrolliert identischen Paarungen geprüft werden. Diese Testreihe ändert keine weiteren Werte nachträglich.

Einen Branch nur dann mergen, wenn neuer 100k-Workflow sowie Story, Boss-/Matrix-, Save-, Android-, und Touch-Regressionen grün sind. Original-Worktree mit Userdateien bleibt unangetastet.
