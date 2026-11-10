# Grafik V5: Recherche und gestalterische Ableitung

10.11.2026. Studienmaterial ist ausschließlich Referenz: keine Nintendo-Pixel,
Karten, Figuren, Symbole oder Logos wurden in dieses Projekt übernommen.

## Was tatsächlich untersucht wurde

Die Original-Tilesets `overworld`, `forest`, `house`, `reds_house`, `pokecenter`
und `cavern` aus den Rekonstruktionen **pret/pokered** und **pret/pokeyellow**
wurden vergrößert visuell verglichen. Zusätzlich wurden Alabastia, Reds Haus,
Vertania-Laden, Vertania-Heilstation und Mondberg aus den originalen Blockdaten
als Studienansichten rekonstruiert und betrachtet. Diese Studienansichten bleiben
außerhalb des Projekts. Die Bewegungs-/Grasprioritätslogik wurde im Quellcode gelesen.

Nachprüfbare Quellen:

- [Red/Blue: Grafik, Blocksets und Maps](https://github.com/pret/pokered), untersuchter Stand `0dbf95cd12f5b1511c62ce69efe283000f780a8f`.
- [Yellow: Grafikbibliothek](https://github.com/pret/pokeyellow/tree/master/gfx/tilesets), Stand `b452f2ab07185075140061c5084ab866d5e4a794`.
- [Bewegung und Graspriorität](https://github.com/pret/pokered/blob/master/engine/overworld/movement.asm).
- [Tileset-Verknüpfungen](https://github.com/pret/pokered/blob/master/gfx/tilesets.asm).
- [Tileset-Animationseigenschaften](https://github.com/pret/pokered/blob/master/data/tilesets/tileset_headers.asm).
- [Städte und Gebäude: visuelle Vergleichssammlung](https://www.nikouusitalo.com/blog/looking-at-pixels-part-2-buildings-in-gen-1-pokemon-cities/).

## Beobachtungen und eigene Entscheidungen

| Bereich | Beobachtung am Referenzmaterial | Umsetzung in Echo |
|---|---|---|
| Maßstab | 8px-Grafikteile, 16px-Bewegungsfelder und größere zusammengesetzte Kartenblöcke sind unterschiedliche Ebenen. | Unser bestehendes 16px-Raster bleibt; kein Wechsel auf 32px-Kollision. |
| Figur | Wenige deutlich unterscheidbare Kopf-/Körperflächen sind wichtiger als Binnenzeichnung. Gespiegelte Seitenansichten sparen Grafikdaten. | Eigene kurze Frisur, helle Jacke/Schal, dunkle getrennte Schuhe. 12 transparente 16×16-Bilder: vier Richtungen mit Stand und zwei Schritten. |
| Bewegung | Ortsbewegung und Bildwechsel sind gekoppelt; die Figur springt nicht einfach als unverändertes Standbild ein Feld weiter. | 150ms pro Schritt, pixelgenaue Zwischenposition, abwechselnde Füße, Standbild nach Ende. Ein gepufferter Richtungswechsel verhindert diagonale Abkürzungen. |
| Dorf/Stadt | Gebäudegruppen und klar erkennbare Freiräume ordnen die Karte; wiederholte Fassaden sind erwünscht. | Vier vorhandene Häuser und Dorfplatz bleiben an ihren Koordinaten. Kleine Türwege, sauberere Fassaden und Dächer; keine neue Zufallsdekoration. |
| Häuser | Dach, Wand, Fenster und Eingang bilden eine gemeinsame Silhouette. | Zusammenpassende 3×2-Feld-Häuser mit eigenen Dachreihen, Fenstersprossen und heller Türschwelle. |
| Natur | Kronen, Stamm und freie Bodenfläche müssen unterscheidbar bleiben. Gras ist optisch dichter als sicherer Laufboden. | Neuer 16×24-Baum statt gestauchtem 16×32-Bild; nur Stammfeld blockiert. Gruppierte Blätter, kompakter Busch, getrennte Grasmaske. |
| Wasser/Übergänge | Wiederholte Wellen brauchen wenige Frames; Rand und Innenfläche haben verschiedene Aufgaben. | Zwei Wasserphasen plus nachbarschaftsabhängige Uferkante, ohne neue logische Kartenfelder. |
| Zäune | Das Hindernis begrenzt Grundstücke, der Eingang bleibt lesbar. | Ein eigener Pfosten mit Verbindungen nur zu tatsächlichen Zaunnachbarn, auch vertikal; Enden ragen nicht durch Toröffnungen. |
| Innenraum | Funktionsgruppen statt Möbelmenge: Wandregal, Tresen, einzelner Mittelpunkt. | Schmiede mit Esse, Amboss, Werkbank, zwei Regalmodulen und einer Kiste. Drei überflüssige Thekenfelder entfallen. |
| Laden/Heilort | Gemeinsame Bauteile werden je nach Funktion anders angeordnet. | Bestehende Regale/Theken/Heilgeräte bleiben wiederverwendbar, keine neuen Innenraum-Grundrisse. |
| Höhle | Wiederholte Felsränder und klare Engstellen sind lesbarer als viele unabhängige Dekosteine. | Als Regel dokumentiert; bewusst keine Höhle oder Storykarte in diesem Auftrag neu gebaut. |
| Vordergrund | Graspriorität kann nur den unteren Figurenteil betreffen. | Separate transparente Halme nach den Figuren; Objekte und Figuren nach Fußpunkt sortiert. Kronen ragen acht Pixel, Möbel vier Pixel über ihre Zelle hinaus. |
| Gelb gegenüber Rot/Blau | Beide Bibliotheken behalten die kompakte modulare Bildsprache trotz Detailvarianten. | Kein Vermischen mehrerer Maßstäbe oder moderner Illustrationstechniken. |

Die rechte Spalte ist unsere eigene Entwurfsentscheidung, keine Behauptung über
identische Technik der Vorbilder. Kamera: unverändert 10×9 auf Handy, 16×9 auf TV.
Die bestehende vierstufige, leicht getönte Graupalette bleibt bytegenau erhalten.

## Herkunft der ausgelieferten Grafiken

Neue Grafik in `gb_actors.py` und `gb_art_v5.py` wurde direkt als native Pixel und
geometrische Pixelpfade verfasst. Die weiteren unveränderten Module stammen aus
dem bestehenden Projekt. Der kleine bestehende Fels verwendet weiterhin den bereits
dokumentierten CC0-Ausschnitt von ArMM1998 (`gb_cc0_assets.py`). Die vormals
importierte Haus-/Baum-/Zaungrafik wird in V5 durch eigene Zeichnungen ersetzt.
Keine Bildgenerierung, Nintendo-Sprite-Extraktion oder KI-Kartenfläche im Spiel.
