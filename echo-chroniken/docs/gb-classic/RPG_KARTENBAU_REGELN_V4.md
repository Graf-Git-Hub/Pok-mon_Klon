# Echo-Chroniken · Kartenbau-Regeln V4

Stand: 09.11.2026. Diese Regeln korrigieren **die Anordnung der Karten**, nicht den freigegebenen Retro-Grafikstil.

## Nachgemessene Vorbilder

- **Pokémon Rot/Blau, Alabastia**: 20 × 18 Rasterpositionen (16px-Logikfelder), wenige große, leicht identifizierbare Gebäude und ein Weg aus dem Dorf. Die Kamera zeigt 10 × 9 solcher Felder.
- **Marmoria City / Gen-I-Städte**: Baumkanten, Grundstücke, Zäune und Gebäude bilden klar unterscheidbare Viertel. Die Mitte bleibt als Bewegungsraum offen.
- **Innenräume**: wenige wiederkehrende Objekte, die sofort ihren Zweck zeigen: Laden = Regal + Theke, Heilort = Tresen + Heilgerät, Schmiede = Esse + Amboss.
- **Routen**: Eine natürlich lesbare Hauptrichtung mit gelegentlichen Seitentaschen aus Gras, Hindernissen und NPCs; keine rein zufälligen Wegschlangen.

Fachliche Referenzen (nur zum Studium; keine Pokémon-Grafiken kopieren):
- https://www.peterhajas.com/blog/pokemon_rb_map_parsing/
- https://blakecrosley.com/blog/pixel-art-towns-on-iphone
- https://www.nikouusitalo.com/blog/looking-at-pixels-part-2-buildings-in-gen-1-pokemon-cities/
- https://docs.pokemonworkshop.com/tiled/create-your-first-map/

## Unsere verbindlichen Spielregeln

1. **Grafikpalette bleibt unverändert:** vier Graustufen, 16px-Kollision, ein Atlas aus 39 festen wiederverwendbaren Kacheln.
2. **Kamera bleibt unverändert:** 10×9 auf Handy, 16×9 im TV-Modus; die Figur wird nachgeführt.
3. **Jede Karte zuerst als Grundriss zeichnen**, danach mit demselben Tileset füllen. Gebäude und Deko sind dem Laufweg untergeordnet.
4. **Keine erfundenen Stichwege:** Zaunöffnungen liegen dort, wo man vom Hauseingang tatsächlich hinlaufen kann.
5. **Türen besitzen einen konkreten Innenraum-Link**. Keine Berechnung eines Zielhauses nur anhand grober Richtung.
6. **Beim Verlassen eines Hauses** erscheint man auf der tatsächlichen begehbaren Kachel vor genau diesem Eingang.
7. **Offene Außenkartengrenzen** erhalten die Querposition: oben verlassen -> unten der angrenzenden Karte am selben X; unten -> oben entsprechend.
8. **Hindernisse sind visuell eindeutig**: Baum, Busch, Felsen, Wasser, Möbel und Hausfassade blockieren genau dort, wo sie auch aussehen wie Hindernisse.
9. **Wasser und hohes Gras behalten eine klare Textur/Animation**, ohne für den Außenboden künstliche Straßen zu erzwingen.
10. **Karte freigeben erst nach automatischen UND visuellen Prüfungen.**

## Wurzelheim V4 (Spielbare Stilkarten-Demo)

- Größe **20×18**. Nord- und Südausgang offen bei **X=9–10**.
- **Vier Häuser** aus dem gleichen Standardbaukasten: Nordwest Wohnhaus, Nordost Heilstation, Südwest Schmiede, Südost Laden.
- **Dorfmitte** mit einem kleinen Platz, Wegweiser und einem NPC.
- **Zäune mit freien Korridoren** zum jeweiligen Hauseingang; Teich und Gras befinden sich abseits der Hauptwege.
- Gebäudeportale: (4,4) -> Wohnhaus, (14,4) -> Heilstation, (4,11) -> Schmiede, (14,11) -> Laden.
- Alle vier Türen lassen sich vom Startpunkt zu Fuß erreichen. Rückwege führen direkt vor das betreffende Gebäude.
- Angrenzende **Waldroute** 20×18: gemeinsame Ausgänge X=9–10, zentraler freier Korridor, Grasgruppen, ein NPC und ein Hinweis.

## Nachweis und Grenzen

- Automatische Tests: `tests/gb-classic-kit.cjs` und `tests/gb-map-layout.cjs`.
- Echte Chrome-Browsertests: `qa/gb-classic-browser.py` und `qa/gb-rpg-map-browser.py`, inklusive aller vier Hausportale und beider richtungsgleichen Kartenwechsel.
- Screenshot der spielbaren Dorfmitte: `docs/gb-classic/GB_RPG_DORFPLATZ_HANDY.png`.
- **Keine Änderung an Hauptspiel oder APK**. Die sieben Beispielkarten bleiben ein eigener Stil- und Leveldesign-Prototyp. Die 60 Storykarten sind hiermit weder umgebaut noch visuell abgenommen.
