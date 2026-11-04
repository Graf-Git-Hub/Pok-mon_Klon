# Balance-Prüfung vom 04.11.2026

**Status:** reproduzierbare Diagnostik, kein vollständiger natürlicher Spieldurchlauf.

## Spielcode geändert: Seelen-Tränke

Die ursprüngliche Korrektur aus Branch `feature/echo-potion-balance-20261104` wurde in den neuen isolierten Entwicklungszweig übernommen und mit `project/tests/battle-potions.cjs` getestet.

- Trainer-/Bosskampf: `max(36, ceil(0.30 * maxHp))` KP Heilung, begrenzt auf fehlende KP; kostet genau einen Trank und einen Zug.
- Bei vollen KP wird im Kampf kein Trank abgebucht und kein Zug vergeudet.
- Reisemenü: nur bei mindestens einem verletzten Teammitglied wird ein Trank abgebucht, das Team geheilt und der neue Zustand sofort gespeichert.
- Save-Schema bleibt Version 2, App-ID/Monster-IDs unverändert.

## Reproduzierbare echte Engine-Duelle

| Prüfung | Ausgangslage | Ergebnis |
| --- | --- | --- |
| Frühgebiet | 400 Einzelduelle an vier Positionen; frische Starter Lv.3/5, Wilder Lv.2–5; vor/nach Neulingsschutz | 400 Siege, 0 Niederlagen, im Mittel ca. 6,3–7 Züge pro Sieg |
| Kapitel 11, 13, 14 und Postgame | 600 Duelle mit drei Wesen (IDs 3, 114, 98), Levelziel / 5 und 10 Level darunter, 6 Tränke, 50 feste Seeds je Szenario | 600 Siege, 0 Niederlagen, **0 Tränke genutzt**, ca. 6–7 Runden |

Die neuen Tests `project/tests/early-wild-balance.cjs` und `project/tests/late-team-balance.cjs` nutzen die echten Kampffunktionen und schreiben JSON in `docs/visual-audit/battle-balance/`. Die frühen Kämpfe starten jeweils **vollständig geheilt**, die späten Teams nutzen die stärkste verfügbare Schadensattacke und eine einfache Heilregel bei unter 35 % KP. Es ist **keine** Kampagnen-Simulation mit Begegnungsdichte, XP-Fluss, natürlich erworbenen Wesen, Grind, Inventar oder Wegdauer.

**Befund:** Unter diesen Testbedingungen sind die späten Einzelbosse für ein gut besetztes Dreierteam auffallend leicht. Das ist ein Diagnosehinweis, **keine Grundlage für eine blinde Erhöhung der Bossstärke**, da zunächst die echte XP-/Teamstärke während einer vollständigen Reise gemessen werden muss. Die Trank-Wirkung selbst ist mit dediziertem Regressionstest bestätigt.

## Nächste Balance-Arbeit

1. Gleiche Start-Spielstände mit echten Kapitel-1/2-Aktionen und begrenzter Heilung aufbauen, bis Kapitel 14 verkettet testen.
2. Über **ganze Wege und mehrere Kämpfe** gewonnene XP, Evolutionen, HP-Verlust, Potion-Nettoverbrauch, Niederlagen, sichere Wiederbelebungen und Spielerzeit je Kapitel protokollieren.
3. Wenn normale Teams über-/unterfordert sind, Boss-Level/Formel und XP-Kurve gezielt korrigieren, nicht anhand von Lv.55-Quest-QA.
4. Android-Touch und echten Gamepad-/TV-Test separat nachholen. Keine Grafikarbeit in dieser Runde.
