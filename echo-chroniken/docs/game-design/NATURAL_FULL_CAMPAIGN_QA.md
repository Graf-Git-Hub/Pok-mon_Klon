# Echo-Chroniken: natürlicher Kampagnentest von Oma bis zum Postgame

**Stand:** 04.11.2026. **Projekt:** `Graf-Git-Hub/Pok-mon_Klon`. **Ziel:** tatsächliche Eingaben und normale Ressourcen anstelle der alten Level-55-QA-Startmannschaft.

## Testverfahren

1. `project/qa/natural-opening.py --both --seeded`: Der Browser beginnt mit **leerem Spielspeicher**. Oma/Paket/Starter Level 5, Waldquest, echtes hohes Gras, wilder Fang mit Seelen-Sphäre, Piko, Ruine, Kapitel 3 und 4. **Keine synthetischen Questflags oder Level.**
2. `project/qa/natural-chapter5.py --both`: Nur den von der Spiel-Engine gespeicherten natürlichen Kapitel-4-Spielstand laden, ohne eine Eigenschaft zu verändern. Alle Rätsel, Zugreisen und Kapitel-5-Bosse über Tastatur/Touch spielen.
3. `project/qa/natural-chapter6-7.py --both`: Den tatsächlichen Kapitel-5-Save laden. Kapitel 6 und 7 mit Schmiede, Rätseln, vier echten Pflichtkämpfen, EP/Entwicklungen, Menüheilungen und Reloads spielen. Wilde Zufallsbegegnungen werden nicht abgeschaltet; falls nötig wird über das echte Kampfmenü geflohen.
4. `project/qa/natural-chapter8-10.py --both`: Den echten Kapitel-7-Save laden. Kronenstadt-Archiv, Frostgrat, Vex und den friedlichen Kapitel-10-Ringhüter durch tatsächliche Eingaben und Storyentscheidung erledigen.
5. `project/qa/natural-chapter11-14.py --both`: Den echten Kapitel-10-Save laden. Alle Pflichtschlüssel, Sternwarte, Familienkapitel, Schachtwache und zweistufiges Varek-Finale, Abspann, sechs Postgame-Gebiete, drei optionale reale Bosskämpfe, Museum und Gartenfest spielen.

**Wichtig:** Ein neuer Browser übernimmt die JSON-Datei aus dem vorherigen Testabschnitt **unverändert** als seinen gespeicherten Spielstand. Das ist ein einziger logischer Spielverlauf je Steuerungsart, nicht ein Level-55- oder Kapitel-Fake. Alle Wege, Dialoge, Tränke und Kämpfe laufen über echte Tastatur- beziehungsweise Touch-Befehle. Nur Kartenkacheln/Marker werden zur Wegplanung gelesen. Die Spiele-Engine setzt selbst sämtliche Quests, EP, Siegesflags, Gegenstände und Saves.

## Tatsächliche Ergebnisse der aufeinanderfolgenden Tests

| Abschnitt | Desktop-Schritte | Touch-Schritte | Reale Pflicht-/optionale Bosskämpfe je Ansicht | Save-/Reload-Prüfungen je Ansicht |
| --- | ---: | ---: | ---: | ---: |
| Oma/Paket und Kapitel 1–4 | 553 | 593 | 5 | 9 |
| Kapitel 5 | 310 | 310 | 2 | 4 |
| Kapitel 6–7 | 591 | 591 | 4 | 4 |
| Kapitel 8–10 | 675 | 675 | 2 | 6 |
| Kapitel 11–14, Finale, Postgame | 1.473 | 1.473 | 6 | 10 |

**Vollständiger lokaler Testbestand (Chrome 157):** Desktop **3.602** und Touch **3.642** echte Laufschritte, **19** reale Trainer-/Boss-Siege einschließlich optionaler Prüfungen und **33** Save-/Reload-Prüfungen je Ansicht. In beiden Fällen wurden Abspann und Postgame abgeschlossen. Keine künstlichen Level, Questflags oder vorgetäuschten Siege. Die 19 Boss-Begegnungen enthalten drei späte Kämpfe mit jeweils **zwei Phasen**. **0 JavaScript-Fehler**. Touch bedeutet Chrome mit 412×915 Pixeln, nicht ein physisches Handy.

### Balancingbeobachtungen

- Nach Kapitel 5 steht das normal erworbene Team bei Miora **Level 11** mit nur **fünf Heiltränken**. Kapitel 6 ist trotzdem mit beiden Bossen spielbar; nach dessen Belohnung sind sieben Tränke vorhanden.
- Kapitel 7 endet bei Miora Level 14. Desktop hat sechs, Touch sieben Heiltränke und ein zweites normal gefangenes Wesen (je nach Capture-RNG ein anderes).
- Kapitel 10 endet bei Level 16 und **elf Heiltränken**. Die friedliche Ringhüter-Lösung wird nicht künstlich erzwungen.
- Auf **beiden Steuerungen** endet die Hauptgeschichte mit Miora Level 20 und 23 Tränken, das Postgame mit Level **22** und **26 Tränken**. Am Schluss: Desktop 79, Touch 77 Seelen-Sphären. Der Überhang deutet auf großzügige Endkapitel-Belohnungen und eher niedrige Schwierigkeit bei optimierter Attackenwahl hin. **Daraus folgt kein Grund für ungetestete pauschale Boss-Buffs.**
- Der Test-Controller wählt bei Kämpfen die stärkste bereits gelernte offensive Attacke; die auf Level 11 gelernte Selbstheilung in Slot 0 würde beim simplen Doppelklick sonst einen falschen Endloskampf erzeugen. Heiltränke und kostenlose Postgame-Heiler werden über die echte Spieloberfläche benutzt.

## Berichte und Reproduktion

Alle Ergebnisse liegen als `report.json` unter `docs/visual-audit/natural-opening/`, `natural-chapter5/`, `natural-chapter6-7/`, `natural-chapter8-10/`, `natural-chapter11-14/`. Je Abschnitt werden tatsächliche erspielte Save-Dateien und Screenshots lokal als **nicht eingecheckte Testartefakte** abgelegt. Auf GitHub lädt `.github/workflows/echo-natural-campaign.yml` die gleichen Testartefakte hoch.

Der neue Workflow führt die fünf Python-Dateien **in exakt dieser Reihenfolge** aus. Ohne vorherige natürliche Spielstände dürfen die späteren Skripte nicht starten. Screenshots und Save-Dateien werden nicht in den Produktions-App-Code übernommen.

## Grenzen vor einer fertigen Spiel-Freigabe

- **Keine verlässliche menschliche Mehrstunden-Spielzeitmessung:** Der Browser steuert Aktionen sehr schnell und kann weder Lesetempo noch Erkundung und Spielspaß abschätzen. 14 Kapitel beweisen nicht automatisch mehrere Stunden.
- Der Test prüft jeweils einen erfolgreichen, effizient gesteuerten Weg, nicht alle anderen Entscheidungen, alle 150 Wesen, optionale Kämpfe und alle möglichen Niederlage-/Wiederholungsfolgen. Ein früher Zwei-Phasen-Niederlagen-Replay ist separat regressionsgeprüft.
- Touch ist ein Chrome-Simulator mit 412×915 Pixeln, **kein physischer Android-TV-/Switch-Controller-Test**. Keine neue APK oder Signatur in diesem PR.
- Keine grafische Überarbeitung. Nicht in Original-Worktree eingreifen: dessen 25 Änderungen gehören dem Nutzer.

## Nächste sinnvolle Entwicklung

1. Reale Lesedauer, Kapitel-/Questlänge, Wiederholungswert und Balancing für Anfänger gegen geübte Spieler messen; die bisher optimierte Taktik könnte für Anfänger schwerer sein.
2. Sinnvolle Spielzeit durch zusätzliche Entscheidungen, Nebenquests oder Bossstrategien erweitern, nicht über künstlich langes Grinden.
3. Echte Android-Handy-/TV-Geräte, Switch-Controller, APK-Upgrades und Speicherstandmigration testen; Grafik erst danach.
