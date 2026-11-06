# Echo-Chroniken: gezielte Kampf- und Entscheidungsprüfungen

**Stand:** 06.11.2026, durchgeführt auf PC Laura. Branch `feature/echo-tactical-audit-20261105`, aufbauend auf dem noch getrennten adaptiven Balancing-PR #34.

## Technische Abdeckung

`project/tests/tactical-elements-and-status.cjs` prüft folgende invarianten Regeln:

- Die **144** möglichen Angriffs-/Verteidigerelementpaare des 12er-Systems.
- Alle **1.800** Wesen-/Angriffselement-Kombinationen (150 Wesen × 12 Angriffsarten), darunter **148 Arten mit Doppeltyp**.
- Zahlreiche gemischte Typen mit Elementmultiplikatoren zwischen 0,45 und 2,25; die drei alten Element-Aliase bleiben kompatibel.
- **12 Zustandseffekte** mit Wahrscheinlichkeit an der exakten Schwelle und unmittelbar darunter, Dauer ohne unendliches Stacken und Trennung der beiden Kampfseiten.
- Brand kann niemals allein kampfunfähig machen, Schutz reduziert genau einen Treffer, Schwächung läuft nach zwei Aktionen aus, Heilung überschreitet nicht die maximalen KP.
- Technischer Katalog: 40 neue Fähigkeiten im Elementkatalog und 26 alte Attacken der Kampfengine, gemeinsam 66.

Der Test meldet `TARGETED_TYPE_STATUS_PASS`; diese Szenarien greifen auf die echten Typen-/Statusfunktionen zu.

## Kontrollierte Entscheidungsexperimente

`project/qa/paired-tactical-duels.cjs` benutzt echte Battle-Engine und Gegner-AI, **15.000 festgelegte Paarungen mit identischem Wesen, Gegner, Level und initialem RNG-Seed für jede Strategie**. Davon haben 7.500 Paarungen gleiche Entwicklungsstufen. Fünf Strategien ergeben **75.000 vollständige Kämpfe ohne Timeout**:

| Strategie | Siege / 15.000 | Siegquote | Zusätzliche Heilaktionen |
| --- | ---: | ---: | ---: |
| Höchster Rohschaden | 8.720 | **58,13 %** | 0 |
| Maximaler Elementwirkungswert | 9.300 | **62,00 %** | 0 |
| Elementvorteil + begrenzte Heilung | 9.307 | **62,05 %** | 3.372 |
| Elementvorteil + Statusbonus bei der Attackenwahl | 9.300 | **62,00 %** | 0 |
| Heilung + Statusbonus kombiniert | 9.307 | **62,05 %** | 3.372 |

**Paarweise Vergleichswerte:**
- Element statt Rohschaden: 585 Fälle nur mit Element gewonnen, 5 nur mit Rohschaden gewonnen. Netto +580 Siege über identische Begegnungen.
- Element + Heilung statt nur Element: 105 Fälle nur mit Heilung gewonnen, 98 Fälle nur mit Element gewonnen. Netto +7 Siege, praktisch kaum Differenz.
- Element + Statusbonus statt nur Element: nur 2 Fälle je Richtung. Kein messbarer Nettogewinn.

Das sind tatsächlich gepaarte Startbedingungen. Unterschiedliche Entscheidungen verändern jedoch den späteren RNG-Verbrauch; Endzustände sind nicht vollständig deterministisch gekoppelt. Darum nicht als isolierten Beweis einer kausalen Wirkung oder menschlichen Spielbarkeit verstehen.

## Konsequenz für die Entwicklung

1. **Typvorteile sind wirksam**, sollten im Team-/Attackenmenü klar und ohne unnötige Eingaben auswählbar sein.
2. **Heilung bringt in der aktuellen Heuristik zu wenig**, weil sie oft eine Angriffsaktion kostet. Gezielte Tests mit erwarteter Überlebensdauer / gegnerischem Schadenspotenzial sind sinnvoller als pauschal höhere Heilwerte.
3. Die derzeitigen **Statuswahrscheinlichkeiten und -priorisierung** liefern noch keinen relevanten zusätzlichen Nutzen. Mögliche Maßnahmen: spezielle Strategien für Schutz, verzögerte Effekte und anspruchsvollere Boss-AI gezielt testen; nicht blind alle Attacken verstärken.
4. Die Unterscheidung von FROST/SCHOCK/VERWIRRT ist bisher kosmetisch: Alle drei schwächen Angriffsschaden um 20 %. Wirklich verschiedene Kampfrollen sind ein **separater Design-/Testschritt**.
5. Für Fairness künftig nicht nur die Gesamt-Siegquote messen, sondern **gleiche Entwicklungsstufe, Startreihenfolge, Level und Teamzusammenstellung** kontrollieren.
6. Die 20 Balancing-Runden aus PR #34 bleiben unverändert; dieser Audit-Branch enthält **keine neuen HP-/ATK-/DEF-Anpassungen** und **keine neue APK**.

Rohbericht: `docs/visual-audit/tactical-audit/paired-decisions.json`. Keine persönlichen Daten oder echten Spielstände werden verarbeitet.
