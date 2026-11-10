# Echo-Chroniken | Gesicherter Stand und Arbeitsauftrag für Astra in Work

Stand: 10. November 2026. Diese Datei ergänzt `RPG_KARTENBAU_REGELN_V4.md`; sie ersetzt keine fertigen Spielfunktionen.

## Gesicherter Projektstand

- Repository: https://github.com/Graf-Git-Hub/Pok-mon_Klon
- Arbeitsgrundlage: Branch `feature/echo-gb-rpg-layout-v4-20261109`, PR #54: https://github.com/Graf-Git-Hub/Pok-mon_Klon/pull/54
- Live-Demo: https://graf-git-hub.github.io/Souls/echo-chroniken-gb-rpg-map-v4.html
- Quellcode: `echo-chroniken/project/tools/gb-kit/build_kit.py`, `gb_visual_upgrade.py`, `gb_cc0_assets.py`, `build_preview.py`.
- Original-Assetdaten: `echo-chroniken/project/assets/gb-classic/`; Szenen, Kollision und 4-Farb-Manifest.
- QA: `echo-chroniken/project/tests/gb-classic-kit.cjs`, `gb-map-layout.cjs`, `qa/gb-classic-browser.py`, `gb-rpg-map-browser.py`.
- Bisherige Entscheidungen: exakt vier Graustufen, 16×16 logisches Raster, ursprünglicher Game-Boy-Look als Vorbild, keine kopierten Pokémon-Sprites; 10×9 Felder Handykamera, 16×9 TV-Kamera, Touch und Controller. Die vier Häuser von Wurzelheim, Dorfplatz, Innenräume und Kartenwechsel sind verknüpft.
- Status: eigenständiger Stil-/Spielprototyp; die 60 Storykarten des Hauptspiels und die installierte APK wurden dadurch **noch nicht** umgestellt.
- Nutzerfeedback: Die Kameragröße und das Schwarz-Weiß-Konzept sind gut; Charakter, fehlende Laufanimation, grobe Objektgrafiken und noch zu simple Gebäudesilhouetten brauchen erheblich mehr handwerkliche Pixelkunst. **Keine** Rückkehr zu überladenen, hochauflösenden KI-Gemälden.

## Kopierfertiger Work-Auftrag für Astra

Du arbeitest an meinem Spiel **Echo-Chroniken** und sollst die Grafikqualität im bestehenden Game-Boy-Stil sichtbar verbessern. Bitte arbeite **direkt im GitHub-Projekt** und liefere funktionierende Änderungen, nicht nur Ideen oder KI-Bilder.

Projekt: https://github.com/Graf-Git-Hub/Pok-mon_Klon
Ausgangszweig: `feature/echo-gb-rpg-layout-v4-20261109` (PR #54).
Stiltest: https://graf-git-hub.github.io/Souls/echo-chroniken-gb-rpg-map-v4.html
Lies zuerst die Datei `echo-chroniken/docs/gb-classic/RPG_KARTENBAU_REGELN_V4.md` und die Dateien im `project/tools/gb-kit`. Verwende einen neuen Feature-Branch auf Basis dieses Zweigs; merge nichts ungeprüft nach `main`.

**Visuelles Ziel:** Es soll an Pokémon Rot, Blau und Gelb auf dem originalen Game Boy erinnern, aber eine eindeutig eigene Echo-Chroniken-Welt mit eigenen Gebäuden, Charakteren, Symbolen und Geisterwesen sein. Untersuche echte Screenshots oder Karten alter Game-Boy-RPGs (insbesondere Dörfer, Routen, Häuser, Läden, Heilstationen, Höhlen), analysiere maßstäbliche 8×8- und 16×16-Pixel-Konstruktion, Silhouette, Objektlesbarkeit, Animation und Kartenkomposition. Nutze die Vorbilder als Gestaltungsprinzip, **kopiere keine Originalkarten, Nintendo-Sprites, Pokébälle, Logos, bekannten Figuren oder erkennbare geschützte Motive**. Verwende eigene gepixelte Assets oder eindeutig passend lizenzierte CC0-Assets mit dokumentierter Herkunft. Bewahre Echo-Chronikens eigenen Charakter.

**Was am Prototyp unbedingt erhalten bleiben muss:** Vier Graustufen (Palette aus Manifest), einheitliches Pixelraster, kleine schlichte Orte und Räume, echte begehbare Tilemaps, Kamera folgt Figur, Handyansicht 10×9, TV 16×9, Touchsteuerung, Gamepad- und Tastaturunterstützung, alle funktionierenden Türen, Rückkehr vor dieselbe Haustür, Waldroute und Kollisionen. Das Design soll übersichtlich bleiben, nicht modern oder hochdetailliert werden.

**Konkrete Aufgaben:**
1. Arbeite das zentrale Tileset handwerklich nach: unterscheidbare Baumkronen und Baumstämme, Hecken, Zäune mit passenden Eck-/Endstücken, hohes Gras, Blumen, Felsen, Wasser samt 2–3 Animationsphasen, Dächer, Hauswände, Fenster, Türen, Treppen und Wände. Fang nicht wieder mit riesigen Generatorflächen an. Ergänze neue Kacheln **nur wo unbedingt nötig** für saubere Übergänge, und halte alles modular.
2. Verbessere Innenräume sparsam: ein gutes Regal, eine Theke, ein Tisch, Stuhl, Bett, Kiste, Amboss, Esse, Heilgerät und Teamtausch-Computer dürfen in mehreren Orten identisch vorkommen. Jeder Gegenstand muss auf dem Handy auf Anhieb erkennbar sein. Vermeide übertriebene Schatten und tausende Details.
3. **Spielfigur komplett überarbeiten:** Der aktuelle Charakter sieht aus wie ein unförmiger dunkler Klumpen. Zeichne eine sympathische, originale 16×16-Spielfigur mit erkennbaren Kopf, Frisur/Kappe, Körper, Armen und Beinen, klarer Trennung der vier Graustufen. Vier Blickrichtungen (oben/unten/links/rechts), pro Richtung mindestens Idle + 2 eindeutige Laufphasen; links/rechts darf bei sinnvoller Symmetrie gespiegelt werden. Gib ihr eine richtige Laufanimation (Framewechsel passend zum tatsächlichen Schritt), auch auf Handy und TV, nicht bloß eine versetzte Standgrafik. Die Figur soll **nicht** wie ein offizieller Pokémon-Protagonist aussehen.
4. NPCs im gleichen Maßstab gestalten, mit mindestens zwei eigenständigen Grundsilhouetten. NPCs stehen sichtbar vor Hintergründen und können, wo vorgesehen, eine Idle-Animation haben.
5. Prüfe Vorder-/Hintergrundebenen. Im hohen Gras dürfen Grashalme vor den Beinen der Spielfigur liegen; hinter Bäumen oder Möbeln muss die Figur teilweise verdeckt werden können. Kollision muss zum sichtbaren Objekt passen.
6. Halte Wurzelheim als erste Referenzkarte klein und logisch: vier funktionierende Gebäude, Dorfmitte, freie Eingänge, Zäune, lesbare Route. Nur behutsam bessere Dekoration, keine neuen zufälligen Wege oder funktionslosen Objekte. Verbessere die Schmiede als Innenraum sichtbar, ohne ihr 30 überdimensionierte Möbel zu geben.
7. Teste das Ergebnis **im echten Spielcanvas**, nicht nur als Spritesheet oder Bildgenerierungsbeispiel. Prüfe Handy-Portrait, TV-Breitbild, D-Pad/Stick, Bewegung, alle Richtungen und Animationsframes, Kartengrenzen, Türen, Vordergrundebenen und Kollisionssperren. Prüfe mindestens `gb-classic-kit.cjs`, `gb-map-layout.cjs` und vorhandene Browser-QA, ergänze einen Test für die Laufanimation. Behebe die gefundenen Fehler.
8. Erzeuge echte Browser-Screenshots mit Figur auf der Dorfkarte, **mindestens einen Screenshot während einer Laufanimation**, Schmiede innen und eine TV-Ansicht. Stelle eine eigene neue spielbare GitHub-Pages-Testadresse bereit, ohne die bisherige Demo zu überschreiben. Eröffne einen Draft-Pull-Request mit der Liste der Änderungen, Screenshots, Tests und bekannten offenen Punkten.

**Arbeitsweise:** Entwickle Schritt für Schritt am bestehenden Code. Vergleiche nach jedem wesentlichen Grafikschritt mit den klassischen Vorbildern und einem echten Screenshot. Wenn etwas wie moderne Pixelillustration, ein reines Blockmuster oder ein Pokémon-Klon aussieht, korrigiere es. Behalte die bereits gefundene Balance: schlicht, aber gut lesbar. Arbeite möglichst selbstständig, ohne mich nach jedem Zwischenschritt entscheiden zu lassen. Bezeichne nicht alle 60 Karten als fertig, wenn nur die Musterkarten umgestellt sind.

**Fertig ist diese Aufgabe erst**, wenn ich einen funktionierenden neuen Link mit sichtbarer Laufanimation auf dem Handy öffnen kann, dazu Screenshots, Tests und einen überprüfbaren Draft-PR habe. Bewahre Hauptspiel, APK und Speicherstände unverändert.
