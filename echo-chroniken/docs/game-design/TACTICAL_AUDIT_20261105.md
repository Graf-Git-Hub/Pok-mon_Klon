# Echo-Chroniken: gezielter Element-/Status-/Kampfentscheidungs-Audit

**5. November 2026.** Basierend auf dem 20×100.000-PC-Balancing (PR #34), zusätzlich und ohne 100 Millionen Wiederholungen.

## 1. Vollständige Element- und Statusregeln

`project/tests/tactical-elements-and-status.cjs` prüft:
- **144/144** Element-gegen-Element-Paare mit erwarteter Verstärkung/Abschwächung.
- **1.800/1.800** Kombinationen aus 150 Arten und zwölf Angriffsarten, einschließlich 148 doppeltypiger Wesen.
- Alten Saves kompatible Typ-Aliase FLUT → WASSER, WURZEL → NATUR, AETHER → GEIST.
- Alle **12 Zusatzwirkungsregeln** auf Wahrscheinlichkeitsgrenzen, Zielseite, Wirkdauer, Nicht-Stapeln, Schutz nur für nächsten Treffer, max. KP-Regeneration und Brand ohne eigenen K. o.
- **96.000 tatsächliche Auslöseversuche** (je 8.000 pro Effekt). Alle beobachteten Anteile liegen innerhalb von 2 Prozentpunkten der vorgesehenen Chance. Beispiele: Feuerwirbel 29,93 % (Soll 30 %), Blitzstich 25,06 % (Soll 25 %), Kohlenregen 50,54 % (Soll 50 %).

## 2. Paare statt getrennte Zufallsmengen

`project/qa/paired-tactical-duels.cjs` führt **15.000 identische Ausgangspaarungen** auf drei Strategien aus, insgesamt **45.000 echte Engine-Kämpfe**. Gegnerarten, Level und anfänglicher Zufalls-Seed sind für jede Dreiergruppe identisch. Die KI des Gegners bleibt gleich. Die Zufallszahlen der späteren Aktionen können auseinanderlaufen, weil unterschiedliche Entscheidungen unterschiedlich viele Zufallsziehungen auslösen.

| Spielerpolitik | Siege aus 15.000 | Siegquote |
| --- | ---: | ---: |
| Stärkster Rohschaden | 8.720 | 58,13 % |
| Aktueller Elementvorteil + eigener Typbonus | **9.300** | **62,00 %** |
| Elementvorteil, Heilung und Statuseffekte | **9.307** | **62,05 %** |

Bei identischem Anfangskampf: **585-mal** gewann allein die elementbewusste Politik, nur **5-mal** allein die reine Rohstärke. In 8.715 Fällen gewannen beide. Beim Vergleich Element gegen taktisch gewann die Taktik **105-mal allein** und die Elemente **98-mal allein**; **diese winzige Differenz ist kein überzeugender taktischer Vorteil**.

Die Taktikvariante wählte 3.372 Heilaktionen und 10.020 statusbehaftete Attacken, die Elementstrategie 7.219 statusbehaftete Attacken. Diese Zähler geben gewählte Angriffe an, **nicht garantierte Statuseintritte**. Kein Kampf lief in ein Rundenlimit.

## 3. Konsequenzen

**Elemente bringen bereits einen klaren Vorteil** gegenüber bloßem Rohschaden. Heilung und Statuseffekte werden verwendet, ihre aktuelle taktische KI erreicht gegenüber rein elementbewusstem Angriff aber kaum zusätzlichen Nutzen. Deshalb nicht blind mehr Statusattacken oder 100 Millionen Kämpfe hinzufügen. Nächste sinnvolle Arbeiten sind:
1. Heilung in gefährlichen echten Situationen intelligenter bewerten, statt starr nach KP-Schwelle zu handeln.
2. Statusentscheidungen mit künftigem erwarteten Schaden und Gegnerwahl verbinden, nicht nur einen festen kleinen Score-Bonus geben.
3. Teams, Wechsel, Fangen, Bossphasen und Anfängerfehler in Browser-/Touch-Simulationen untersuchen.

**Wichtig:** Die taktische Politik ist zunächst eine **QA-Versuchsstrategie**, keine ungeprüft ins Spiel eingebaute neue Gegner-KI. Dieser PR verändert keine Attackenwerte, Save-Dateien oder APK-Signatur. GitHub-CI muss alle Tests erneut grün melden, bevor Ergebnisse in den Hauptbranch übernommen werden.
