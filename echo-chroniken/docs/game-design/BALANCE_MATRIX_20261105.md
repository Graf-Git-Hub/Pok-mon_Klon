# Echo-Chroniken: 150-gegen-150-Matrix, Boss-Balance und Wiederholung

**Datum:** 05.11.2026. **Basis:** `main` nach Merge PR #26 (`9bb1d94`). **Isolierter Zweig:** `feature/echo-combat-balance-20261105`.

## Methodik: Jeder gegen jeden

- Neue Datei `project/tests/all-species-matrix.cjs` führt **alle 150 × 150 geordneten Paarungen** (inkl. derselben Art gegen sich selbst) durch. Jedes Duell verwendet die echten `createMonsterInstance`, `startTrainerBattle`, gelernten Fähigkeiten, `useSelectedAttack`, Gegenangriff, Typvorteile, Schadensregeln und Abschluss-/Niederlagenlogik.
- **Erste Matrix:** Level 10, 20, 30 × 2 reproduzierbare Zufallsfolgen, insgesamt **135.000 komplette Kämpfe**. Der selbst kontrollierte Kämpfer verwendet jeweils die stärkste bei seinem Level tatsächlich gelernte offensive Attacke. Heiltränke werden nicht verwendet. Jede Art beginnt ausgeruht und bekommt 900 Kampfsituationen als eigene Kampfseite.
- **Bewusste Wiederholung:** `--audit-again` testet nochmals alle 150 × 150 Paarungen auf **anderen Leveln 5, 15, 25 und zwei anderen Zufallsfolgen**. Zusätzlich **135.000 Kämpfe**, also **270.000 vollständige Endstand-Duelle pro unverändertem Balance-Stand**. Keine Begegnung blieb nach 75 Zügen hängen.
- **Einschränkungen:** Das Spiel gibt dem Spieler derzeit grundsätzlich den ersten Zug. Die KI benutzt den tatsächlichen Angriffsalgorithmus; deshalb sind sehr hohe Gewinnquoten für die Angreiferseite möglich, selbst wenn beide Arten einander jeweils besiegen würden. Ein Matrix-Sieg ist nicht mit einer natürlichen Storyquest oder einem wirklichen Duell zwischen menschlichen Spielern gleichzusetzen.
- Entwicklungsstufen sind absichtlich nicht exakt gleich stark. Verglichen wird deshalb neben allen Arten vor allem die Quote **gegen Gegner derselben Entwicklungsstufe**.

## Vorher: Auffälligkeiten

- Miora als Startwesen (**ID 1**) gewann im Basis-Test nur **49,29 %** gegen andere Wesen der ersten Stufe. Seelara (**ID 2**) nur **57,20 %** gegen andere Wesen der zweiten Stufe. Die Endentwicklung Maternalis war bereits extrem stark und wird **nicht** verstärkt.
- Zwei frühe Flammenwesen hatten bei gleichstufigen Gegnern unter verschiedenen Test-Leveln die niedrigsten Siegquoten: Flammenfuchs I (**ID 51**) und Flammenhase I (**ID 121**). Der Katalog besteht derzeit aus **107 FLUT**, 24 SCHATTEN, 10 FLAMME, 5 LICHT, 4 WURZEL. Besonders Flammenwesen treffen überproportional oft auf den für FLUT günstigen Typ. Diese ungleiche Typverteilung wird nicht beiläufig durch eine große, ungetestete Umetikettierung aller Arten geändert.
- Späte Bosskämpfe waren mit zwei fitten Wesen selbst **ohne** Heiltränke in allen 160 günstigen Testfällen erfolgreich; schlecht ausgerüstete Soloteams hatten dagegen Schwierigkeiten. Ein pauschaler Buff für alle wäre unklug.

## Angepasste Werte

| Wesen / Bereich | Vorher | Neu | Begründung |
| --- | --- | --- | --- |
| Miora, erste Stufe | HP 34, ATK 12, DEF 11 | **HP 39, ATK 16, DEF 14** | Starter soll nicht unter den gewöhnlichen Erststufen liegen |
| Seelara, zweite Stufe | HP 54, ATK 19, DEF 18 | **HP 56, ATK 21, DEF 20** | Evolution bleibt wettbewerbsfähig, Endentwicklung unverändert |
| Flammenfuchs I | HP 41, ATK 14, DEF 12 | **HP 45, ATK 16, DEF 14** | Begrenzt die auffällige Unterlegenheit des frühen Flammenwesens |
| Flammenhase I | HP 39, ATK 14, DEF 12 | **HP 44, ATK 16, DEF 14** | Gleicher Grund, keine Verbesserung höherer Stufen |
| Späte Bosse mit **zwei oder mehr kampffähigen Begleitern (je ≥25 % HP)** | HP-Faktor 0,90, Angriff 0,95 | **HP 1,26, Angriff 1,33** | Zwei fitte Wesen haben deutlich mehr HP und Angriffsrunden; Soloteam und frühe Bosse bleiben gleich schwer |

## Ergebnis der letzten beiden 150-gegen-150-Matrizen

| Wesen | Standard Level 10/20/30, nur gleiche Stufe | Zweitprüfung Level 5/15/25, nur gleiche Stufe |
| --- | ---: | ---: |
| Miora | **82,98 %** | **71,10 %** |
| Seelara | **82,20 %** | **85,23 %** |
| Flammenfuchs I | **95,57 %** | **85,11 %** |
| Flammenhase I | **94,33 %** | **82,45 %** |

Die Entwicklung zwischen den Stufen bleibt spürbar; der Starter erhält aber eine faire Chance. Stufen 2–3 gewinnen häufiger gegen frühe Stufen, wie für ein RPG beabsichtigt. Beide Abschlussmatrizen mit **je 135.000 Kämpfen und null Timeouts**. JSON-Befunde unter `docs/visual-audit/battle-matrix/all-species-matrix-report.json` und `repeat-matrix-report.json`.

## Zwölf Boss-Sweep-Varianten

- Je Kandidat **4.800 echte Engine-Kämpfe** (vier Endgegner, 1/2 Wesen, 0/2/6 Heiltränke, fünf Attackentaktiken, 40 RNG-Startwerte). Zwölf Kandidaten untersuchten HP-Multiplikatoren 1,0/1,2/1,4/1,6 und Angriff 1,0/1,2/1,4 auf den alten Endspiel-Faktor; kalibrierte Zusammenfassung: `docs/visual-audit/battle-matrix/boss-sweep-calibration.json`.
- Gewählte Variante relativ zum alten späten Bossprofil **1,4 × HP, 1,4 × Angriff**, nur wenn mindestens zwei Begleiter kampffähig sind. Das entspricht den oben genannten absoluten Faktoren 1,26/1,33.
- Von den **160** 2er-Team-Bossduellen mit optimalen Attacken wurden **vorher 160/160 ohne Heiltränke gewonnen**, danach **87/160 (54,4 %) ohne Tränke**, **160/160 mit 2 Tränken** und **160/160 mit 6 Tränken**. Soloteams mit bester Attacke bleiben **160/160 ohne Tränke**; Zweierteams mit schwächster Attacke und sechs Tränken erreichen **152/160 (95 %)**.
- Ziel: Spannende Kämpfe mit Heilstrategie, **kein** Pflicht-Grind und keine Erhöhung der ersten Kapitel. Regression `project/tests/boss-adaptive-balance.cjs` sperrt die erwarteten Erfolgs-/Risiko-Korridore.

## Wiederholter End-to-End-Test

- Die vollständige natürliche Browser-Testkette wird auf Laura **ab leerem Browser-Speicher** erneut gespielt (Keyboard und Touch), von Oma/Paket über die echten Fang- und Levelregeln bis Kapitel 14 und Postgame. Alle Zwischensaves werden unverändert in den folgenden Browser übernommen; neue Werte dürfen keinen Softlock erzeugen.
- GitHub führt denselben Gesamtweg im bestehenden Workflow `echo-natural-campaign.yml` zusätzlich aus. Neuer Workflow `.github/workflows/echo-balance-matrix.yml` rechnet beide 150-gegen-150-Matrizen und den Boss-Belastungstest unabhängig in der Cloud erneut.
- Die Tests prüfen keine mehrstündige menschliche Spielzeit, keine physischen Android-/TV-/Switch-Controller und nicht alle alternativen Storyentscheidungen. Die **Spieler-zuerst-Regel** und die stark FLUT-lastige Artentabelle sind weitergehende Designpunkte, keine stillschweigend behobenen Bugs.

## Abnahme

Erst **nach grüner GitHub-CI und lokal erfolgreichem natürlichem Gesamtdurchlauf** mergen. Keine Änderung an APK/App-ID/Signatur oder Grafik in diesem Zweig. Original-Worktree des Nutzers unverändert.
