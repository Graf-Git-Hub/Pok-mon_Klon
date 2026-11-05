# Echo-Chroniken: Zwölf Elemente, Doppeltypen, Runenlehre und Kampfauswahl

**Stand 05.11.2026.** Entwicklungszweig `feature/echo-dual-type-system-20261105`. Basis ist die bereits gemergte Balance-Runde PR #27. Alle Änderungen entstehen in einem isolierten Worktree auf Laura, nicht im ursprünglichen Projektordner.

## Nutzerauftrag und visuelle Prüfung

Jedes der 150 Wesen soll nach dem tatsächlichen Motiv seiner Bildkachel eingeteilt werden, nicht nach der bisher fast überall eingetragenen Ersatzkategorie `FLUT`. Der original im Spiel hinterlegte `assets/atlas.js` enthält exakt 150 Bildkacheln im 10×15-Raster. Die Motive wurden gemeinsam mit den eindeutigen Artennamen durchgegangen. Die daraus entstandene **explizite 150er-Zuordnung** steht in `project/data/affinities.js`; die automatisch generierte Tabelle in `TYPE_AND_ATTACK_CATALOG.md` listet jedes einzelne Wesen auf.

Als allgemeine Interface-Referenz wurden Pokémon-Kampf- und Teamwechseloberflächen untersucht: gut sichtbare Typen neben KP, klare Trennung zwischen eigener Gruppe und Gegner und Elementwirksamkeit direkt bei der Attackenwahl. Die UI im Spiel zeichnet selbst einfache rechteckige Retro-Badges, ohne fremde Sprite- oder UI-Assets zu übernehmen.

## Elemente und Vorteile

Die zwölf Elemente: **Normal, Feuer, Wasser, Erde, Natur, Eis, Luft, Blitz, Licht, Schatten, Psycho und Geist**. Für ein Wesen sind ein oder zwei Elemente vorgesehen. Primär- und Sekundärtypen werden nicht von der Bildfarbe allein, sondern von Körper, Flügeln, Pflanzen, Knochen, Flammen, Wasser oder anderen Motivmerkmalen und zusammengehörigen Entwicklungsreihen abgeleitet.

Offensive Typvorteile **×1,50**, Resistenzen **×0,65**. Bei Doppeltypen multiplizieren sich beide, aber die reine Typkomponente wird auf **×0,45 bis ×2,25** begrenzt. Eine Attacke, deren Element zu mindestens einem Typ des Angreifers passt, erhält zusätzlich **×1,18**. Ein völlig neutraler Typ kann so trotz höherer Basiskraft schlechter als eine passende Spezialattacke sein.

Beispiele: Feuer gegen Natur ×1,50; Feuer gegen Erde ×0,65; Wasser gegen Feuer ×1,50. Feuer gegen Erde/Natur ist praktisch neutral, weil sich die beiden Effekte aufheben. Ein Erde/Natur-Wesen kann eine passende **Wasser-Rune** lernen und sich damit gegen Feuergeschöpfe behaupten, ohne den 18%-Eigenbonus eines Wasserwesens zu bekommen.

Es gibt **keine vollständigen Immunitäten**, um Doppeltypen nicht durch extreme Nullschaden-Kombinationen unfair zu machen. Die Gegenseite wählt ebenfalls häufig Attacken, die nach Element, Stärke und Eigenbonus gut treffen. Die Gegner-KI kennt die aktuellen Kampfwerte, nicht den zukünftigen Zug des Spielers.

## Attacken und Vorbereitung

`project/data/skills.js` ergänzt den alten Katalog um **40 neue Attacken**. Jede neue Grundklasse erhält 4–5 eigene Level-Attacken, beispielsweise Feuer/Flamme, Wasser/Flut, Erde/Fels, Eis, Luft, Blitz, Psycho oder Geist. Die existierenden Namen bleiben erhalten, ebenso ihre Stärke, Heilung und Speicherkompatibilität. Die drei alten neutralen bzw. Geisterattacken erhalten nun eine eindeutige moderne Klasse statt des internen Platzhalters `AETHER`.

Neue Stufenangriffe werden für den Primärtyp ab Level **1, 7, 11, 16 und 24** freigeschaltet. Für Sekundärtypen kommen ab Level **8, 18 und 28** zusätzliche Angriffe dazu. Neutrale Starterfähigkeiten bleiben als nützliche Grundausstattung. Bei Entwicklung und Level-Up werden neu gelernte Attacken dem Buch hinzugefügt, sie gehen nicht verloren.

**Nur vier Attacken sind gleichzeitig im Kampf vorbereitet.** Das Attackenbuch enthält aber sämtliche je erlernten Fähigkeiten, beliebig viele über das Levelsystem. Im Spiel außerhalb des Kampfes kann man mit `⚡ Attacken`, A und den Pfeiltasten die vier vorbereiteten Angriffe ändern, ohne andere zu vergessen. Bei mehreren Wesen lässt sich mit ←/→ durch den Trupp schalten.

## Runenlehre statt TM-Kopie

Ein zusätzliches Lernsystem verteilt **zwölf benannte, verbrauchbare Runen** als einmalige Belohnungen für eindeutige Trainer-/Boss-Siege, nach den ersten sechs Siegen und anschließend bei 8, 9, 10, 12, 14 und 16 einzigartigen Siegen. Bereits besiegte Trainer können diese Belohnung nicht unendlich nachproduzieren.

Ein Wesen kann höchstens **zwei zusätzlich erlernte Runenattacken** aufnehmen. Nicht alle Elemente sind für jede Art geeignet: Ein Feuerwesen kann die entsprechenden Feuerkräfte, Geist-/Psycho-Grundlagen und bestimmte passende Fremdelemente lernen. Erde/Natur kann zum Beispiel Quellschwall (Wasser) oder Kohlenregen (Feuer) lernen. Bei Unverträglichkeit, bereits gelernter Attacke oder vollem Runenlimit wird **keine Rune verbraucht**.

Bedienung: Reisetagebuch → **Runenlehre** → Geistermitglied mit ←/→ auswählen, Rune mit ↑/↓ wählen und A zum Lernen. Die neue Attacke erscheint dauerhaft im Buch. Das maximale Runenlimit gilt pro individuellem Wesen, nicht pro Spezies.

## Kampf-UI und Teamwechsel

- Im 320×180-Spielcanvas erscheint ein **Typ-Symbol bzw. ein Duo von Symbolen direkt neben der jeweiligen KP-Leiste**. Die Symbole haben unterschiedliche Piktogramme und Farben, nicht nur Farbcodes.
- Die Attackenauswahl zeigt vier aktive Fähigkeiten mit Artensymbol, Stärke und Hinweis **STARK / SCHWACH / NEUTRAL** mit kombiniertem Schadensfaktor. Damit sieht man vor der Auswahl, ob die Attacke zu den gegnerischen Typen passt.
- Die Kampffunktion **GEIST** öffnet jetzt eine Teamliste mit Artenname, KP, beiden Symbolen und dem maximalen Typfaktor vorbereiteter Attacken. Der tatsächliche Teamwechsel erfolgt über A und verbraucht wie bisher einen Zug. B bricht ohne Zugverlust ab.
- Die Touch-Version kann die Team- und Angriffszeilen direkt anklicken. A/B/Steuerkreuz und Gamepad arbeiten über dieselben Befehle.

## Rückwärtskompatibilität und Testdaten

Bestehende Saves mit `moves` (beliebig vielen alten Attacken) bleiben gültig. Bei Bedarf werden `equippedMoves`, `runeMoves`, `runes` und `runeRewards` vorsichtig ergänzt; andere Questdaten, individuelle Monster-UIDs, Teamlevel, Archiv und Storyfortschritt bleiben erhalten. Das Runenlernen wird sofort gespeichert. Der neue Elementtyp liegt an der unveränderlichen Art-ID, sodass keine umfangreiche Save-Migration nötig ist.

Neue spezifische Prüfungen:

- `project/tests/elemental-types-and-runes.cjs`: sämtliche 150 Arten, zwölf Typen, Mehrfachwirkungen, 40 neue Skills, Kompatibilitäten, Lernlimit, Ausrüstung, Schaden, realer Teamwechsel und Kampfzug-Kosten.
- `project/qa/type-combat-browser.py`: echte Chrome-UI mit Desktop und Touch für Typanzeigen, vier aktive Attacken und Auswahl eines zweiten Wesens.
- `project/qa/rune-learning-browser.py`: verwendet **tatsächlich erspielte Runen aus Kapitel 1–4**; lernt zwei Fremdattacken, überprüft Verbrauch, Attacksammlung und Wiederladen auf Desktop und Touch.
- Die fünf bestehenden natürlichen Story-Playwright-Abschnitte spielen weiterhin den tatsächlichen Weg von Oma/Paket bis Ende und Postgame. Die Matrix `tests/all-species-matrix.cjs` prüft erneut **150×150 geordnete Duelle auf drei Leveln und in zwei Zufallsfolgen**, mit einer zweiten Kontrollmatrix auf anderen Leveln und Zufallsfolgen.

**Offene Prüfgrenzen:** Chrome-Touch ist kein echtes Android-/TV-Gerät. Der vorhandene Atlas ist die Ausgangsbasis, aber nicht jede Fantasieart kann aus ihrem Bild eindeutig einem Element zugeordnet werden; diese Einteilung ist eine begründete Designentscheidung. Exakte Balance über unterschiedliche menschliche Spielweisen bleibt ein weiterer iterativer Prozess. Die zeitliche Spielzeitmessung und Grafiküberarbeitung sind nicht Teil dieses Auftrags.
