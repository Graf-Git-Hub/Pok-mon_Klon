# Echo-Chroniken · Alte Schmiede | Karte 01 von 60

**Neues, tatsächlich spielintegriertes Kartenmotiv für Kapitel 6, `glut_forge`.**

## Design
- Individuell gestaltete 45×30-Kachel-Karte im 16-Pixel-Raster (720×480 px).
- Eigene Esse mit aktivem Feuer, Abzug, metallenen Rohren und Gusstopf.
- Amboss und Kühlbecken, Werkbänke, Waffendisplays, Verkaufsbereich, Werkzeugwand, Erzregal, Kisten und Kristalle.
- Eingang von Aschenruh auf `(1,7)`, Ausgang zum Glutschacht auf `(21,26)` erhalten.
- Acht originale Storyinteraktionen samt alter Koordinaten nicht verlegt.
- Kollisionen bleiben als unabhängiges `EchoMaps`-Tilearray im Code. Keine begehbare bloße Bildcollage.
- Originalbild und Screenshots sind ohne Pokémon-Marken und ohne Pokébälle.

## Tatsächliche Dateien
- `project/tools/create_glut_forge_art.py` erzeugt die Bitmap deterministisch.
- `project/assets/maps/glut_forge_v1.png` ist das verwendete Spielasset.
- `project/src/maps/registry.js` definiert den einzigen hand-authored Raum inklusive Solids.
- `project/src/maps/forge-art.js` lädt das Bild.
- `project/src/game.js` rendert es im echten Canvas-Spiel vor der Zeichnung der Figuren.
- `project/tests/handmade-forge-map.cjs` prüft Kollision, PNG-Größe und Erreichbarkeit.
- `ALTE_SCHMIEDE_ECHTER_SPIEL_SCREENSHOT.png` wurde mit dem vorhandenen Browserexporter **aus dem realen Spielrenderer** aufgenommen, ohne Spielfigur/NPC/HUD.

## Status
Die Karte ist als erster individueller Spielkarten-Prototyp fertig eingebunden und von den Karten-/Storytests geprüft. Visuelle Detailtiefe ist noch kein finaler professioneller Spriteset-Standard. Sie bleibt bis zur visuellen Freigabe auf einem Entwicklungszweig; Hauptspiel und installierte APK bleiben unverändert.
