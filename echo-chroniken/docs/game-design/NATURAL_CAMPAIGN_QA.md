# Echo-Chroniken: natürlicher Spieltest ab Omas Haus bis Kapitel 5

**Stand:** 04.11.2026. **Werkzeuge:** `project/qa/natural-opening.py` und `project/qa/natural-chapter5.py` (Playwright auf Laura und GitHub).

## Methodik und Abgrenzung

- **Kalter Start:** Der Browser beginnt mit leerem `localStorage`; es werden **keine** Spielstände, Questflags, Monsterlevel, Werte oder Sieg-Callbacks vorgegeben. Die erste Eingabe erfolgt auf dem Titelbildschirm in Omas Haus.
- **Echte Eingaben:** Tastatur beziehungsweise Touch-Tasten steuern Gespräch mit Oma, Paket/Miora, drei Seelenlichter, Wildgras, Seelen-Sphäre, Heiltrank aus dem Menü, optionalen Piko-Boss, Waldruine, die Kapitel-3-Zeugen/Pumpe und den Boss sowie Kapitel-4-Weichen (A-C-B), Zugfahrten, Kurier und Schattenwurzel.
- Das Testprogramm **liest** Kartenkacheln, Portale und Marker für die Wegsuche, es teleportiert die Spielfigur nicht und schreibt nichts in den Speicherstand. Nur die Spiel-Engine speichert.
- Echte Kampfmenüs, Schadens- und XP-Regeln, Capture- und Trainerkämpfe. Optional `--seeded` nutzt reproduzierbare Zufallsfolgen, erzwingt aber keine Fang- oder Sieg-Events und ändert keine Begegnungswahrscheinlichkeit.
- Nach wichtigen Stationen: vollständiger Reload des Browsers, anschließend Kontrolle von Team, Inventar, Story und Fangdaten. Bei Erfolgen wird der Spielstand für die **weitere natürliche Fortsetzung** als `desktop-/touch-chapter4-natural-save.json` in den lokalen Test-Ausgabeordner geschrieben.

## Gesicherte Ergebnisse

**Unseeded, Desktop:** Kapitel 1 bis 4 in einem natürlichen Spielstand bestanden: 551 Laufschritte, 136 Dialogaktionen, 2 Wildkämpfe (1 Fang eines neuen Wesens), 5 echte Trainer-/Boss-Siege, 39 Angriffe, keine Niederlage, 9 Wiederladeprüfungen; Miora Level 9, zweites Wesen Level 7, Inventar zum Kapitel-4-Ende 11 Heiltränke und 31 Sphären.

**Seeded, Desktop und Touch:** Die gleichen Kapitel 1 bis 4 wurden in zwei frischen Spielständen durchgespielt. Desktop: 553 Schritte, 135 Dialogaktionen, 2 Wildkämpfe, 1 Fang, 5 Trainer-/Boss-Siege, 9 Reloads, 0 Niederlagen; Touch: 593 Schritte, 135 Dialogaktionen, 3 Wildkämpfe, 1 Fang, 5 Siege, 9 Reloads, 0 Niederlagen. Unterschiedliche Begegnungen und Fangergebnisse wurden zugelassen.

**Verbesserte Diagnostik:** Die älteren Level-55-Segmenttests haben zwar Storyfunktion bestätigt, aber nicht Ressourcenverbrauch und Nachkämpfe. Hier sinkt die Gesundheit über mehrere Wildbegegnungen; die Steuerung nutzt echte Heiltränke aus dem Reisemenü. Der Testbericht enthält Ressourcensalden und tatsächliche Teamlevel.

## Fortsetzung Kapitel 5, **derselbe natürlich erspielte Spielstand**

- Der zweite Test übernimmt den von der Spiel-Engine geschriebenen Kapitel-4-Save **ohne Änderungen an Team, Leveln, EP, Inventar, Quests oder Kampfwerten**. Der Save wird in einen frischen Browser geladen, dann wird der Zug von Wurzelheim nach Moorglas und der komplette Weg nach Stillwasser mit echten Bedieneingaben abgefahren.
- **Desktop und Touch erfolgreich:** je **310 Schritte**, **27 Interaktionen**, die beiden echten Bosse **Erinnerungsspiegel und Lyra**, je **16 Angriffe**, Archiv/Erinnerungen/Turm und Hin- und Rückfahrten auf der Bahn, mehrere Reloads. Kapitel 5 ist abgeschlossen und `station_stillwasser` erreicht.
- Vor Kapitel 5 begann das Team mit Miora Level 9 und einem in natürlichem Wildfang gewonnenen Begleiter. Am Ende: **Miora Level 11**, zweites Wesen **Level 7 (Desktop) / 8 (Touch)**, jeweils **5 Heiltränke übrig**. Beide Kapitel-5-Durchläufe verbrauchten **8 Tränke**; diese reale Ressourcenbelastung wird für Kapitel 6 wichtig.
- Das Kapitel-5-Testskript speichert die resultierenden unveränderten Spielstände als `desktop-chapter5-natural-save.json` bzw. `touch-chapter5-natural-save.json` zur Fortsetzung in Kapitel 6. Ergebnis- und Screenshot-Artefakte unter `docs/visual-audit/natural-chapter5/`.

## Reproduktion

1. Lokal mit installiertem Playwright und Chrome: `python echo-chroniken/project/qa/natural-opening.py --both --seeded`, **danach** `python echo-chroniken/project/qa/natural-chapter5.py --both`.
2. Ergebnisse: `echo-chroniken/docs/visual-audit/natural-opening/report.json` und `echo-chroniken/docs/visual-audit/natural-chapter5/report.json`; Screenshots und erspielte Save-Dateien liegen nur als lokale Testartefakte beziehungsweise als GitHub-CI-Artefakte, nicht als veränderte Produktions-Spielstände.
3. Die Workflow-Datei `.github/workflows/echo-natural-campaign.yml` prüft dieselbe Route auf GitHub, während Laura parallel andere Szenarien testen kann.

## Was dieser Test **nicht** beweist

- **Keine vollständige 1–14-Kampagne:** Ein natürlicher Spielstand ist bis zum Ende von Kapitel **5** abgesichert; Kapitel **6–14 und Postgame** müssen mit demselben Team/Inventar sukzessive fortgesetzt werden. Die früheren Abschnittstests dort nutzten jeweils starke QA-Teams.
- Kein über Stunden vermessener menschlicher Durchlauf, keine echten Controller-/Android-TV-Gerätetests, kein Nachweis, dass jede optionale Nebenquest mit normalen Ressourcen gelingt.
- **Grafik bleibt bewusst unverändert.**

## Priorität

1. Den natürlich erspielten **Kapitel-5-Spielstand** ohne Anpassungen in Kapitel 6 übernehmen; bei nur 5 übrigen Tränken die Heil- und Bossökonomie untersuchen.
2. Die weitere Route bis Kapitel 14 mit **echten Kämpfen und gespeicherten Fortschritten** fortsetzen; kapitelweise Softlocks und zu starke Gegner beheben und als Regression testen.
3. Bevor weitere Bosswerte hochgesetzt werden, messen, welche Level und Ressourcen ohne künstlich geboostetes Team tatsächlich entstehen.
