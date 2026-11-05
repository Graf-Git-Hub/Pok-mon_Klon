# Echo-Chroniken: Intelligente Gegnerentscheidungen mit geschütztem Einstieg

**Datum:** 05.11.2026. **Basis:** bereits vollständig gemergte PRs #33, #34 und #35 (GitHub main `8077ce6`). Isolierter Worktree `Echo_SmartEnemyAI_20261105`.

## Was tatsächlich verändert wurde

Das reale `enemyCounterAttack()` wählt Angriff und gegebenenfalls Heilung nun über die neue, testbare `EchoSkillbook.ENEMY_AI.choose()`-Logik.

- **Sicherer K. o. hat Vorrang:** Wenn ein Angriff den Spieler voraussichtlich besiegt, wird nicht unnötig geheilt.
- **Überleben statt Zufallsheilung:** Heilung wird höchstens einmal je Gegner eingesetzt und nur, wenn die zu erwartende Wirkung einen weiteren Treffer wahrscheinlich überstehbar macht. Bei vollen KP oder aussichtslosem Kampf wird nicht geheilt. Kein Schaden durch Heilzauber.
- **Typenwirkung bleibt wichtig:** Die KI gewichtet Elementstärke und den Bonus eigener Elemente.
- **Statusvorteile werden bedacht:** Brand, verringerte Angriffskraft, Schutz und Regeneration erhalten begrenzte Boni für ihren zu erwartenden Nutzen; bereits vorhandene Zustände werden nicht blind erneut bewertet.
- **Keine unbesiegbaren Anfänger:** Gegner auf Level 8 oder darunter behalten die bisherige einfache Elementauswahl (bester/zweiter Angriff). Stärkere Gegner verwenden die verbesserte Logik; eine geringe Zufallskomponente verhindert perfekte Vorhersagbarkeit.
- Keine neuen Spielstandfelder, Wesen-IDs, Attackenwerte, Signaturen oder APK-Änderungen.

## Verifizierte PC-Tests

**52/52 bestehende und neue Node-Regressionsprüfungen grün.** Die neue Testdatei `tests/enemy-ai-decisions.cjs` prüft die konkrete Produktionslogik für sinnvolle Heilung, kein Überheilen, K.-o.-Priorität, keinen zweiten Heilzauber, Elementvorteil, Status ohne erneute Anwendung und Einmal-Schutz.

`qa/compare-enemy-ai.cjs` liest die **originale** Hauptversion `8077ce6` per `git show` und lädt sie in eine eigene Game-Engine-VM. Anschließend werden exakt **12.000 Ausgangssituationen** mit alter und neuer KI durchgespielt, mit identischen Gegnerarten, Startleveln und Start-Zufallszuständen. Die Spielerstrategie nutzt bei beiden Varianten die effektivste Angriffsattacke.

| Spieler-Siege | Alte Gegner-KI | Neue Gegner-KI |
| --- | ---: | ---: |
| Insgesamt (12.000 Paarungen) | 7.377 / 61,48 % | **6.995 / 58,29 %** |
| Frühe Level bis 10 | 2.087 / 62,50 % | **2.019 / 60,47 %** |
| Gleiche Entwicklungsstufe und Level | 3.157 / 67,41 % | **2.967 / 63,36 %** |
| Spätere Level | 4.167 / 61,87 % | **3.931 / 58,37 %** |
| Ø Kampfrunden | 6,04 | **6,00** |
| Hängende Kämpfe | 0 | 0 |

Im paarweisen Vergleich gewinnt der Spieler 467-mal nur gegen die alte KI, 85-mal nur gegen die neue; beide Varianten sind in 6.910 Partien erfolgreich und beide in 4.538 erfolglos. Das bestätigt eine anspruchsvollere Gegnerauswahl, aber **keinen Beweis für mehr Spielspaß**.

Die anschließende neue 100.000er-Zufallsprüfung mit allen 150 Wesen beendete sämtliche Kämpfe: **47.840 Siege, 52.160 Niederlagen, 0 Timeouts**, mittlere Kampfdauer 5,93 Runden. Neue SHA-256-Prüfsumme: `dce11c77f5f669bbb689558cfd4482b5f5ed9fe9d2935bb6a4902c629fcfb853`. Der Golden-Fixture-Workflow wurde mit dem neuen echten PC-Ergebnis aktualisiert.

## Grenzen und Freigabe

Das sind echte simulierte Engine-Kämpfe, keine menschlichen Duelle. Der Spieler handelt weiterhin zuerst. Auch bei gleichem Start-Seed divergiert der weitere Zufallsverbrauch, wenn die KI unterschiedlich handelt. Frühe Browser-/Touch-Story bis Kapitel 4 und vollständige GitHub-CI bis Kapitel 14/Postgame sind getrennte Freigabekontrollen. Physische Android-/TV-Geräte wurden hier nicht getestet.

Vor dem Merge: neue Cloud-AI-Tests, vollständige 100k-Parität, 150x150-Matrix, natürliche Kapitel-1-bis-14-Kampagne und Save-/Touch-/Android-Tests grün. Bei zu schweren Storykämpfen muss die Entscheidungshärte oder gezielte Bossregel angepasst werden, statt Werte unkontrolliert hochzudrehen.
