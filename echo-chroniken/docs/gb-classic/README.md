# Echo-Chroniken · Classic Game Boy Style, verbindliche Neuausrichtung

Stand: 09.11.2026. Rückmeldung: zu viele Grafikexperimente, zu viel KI-Dekoration, zu große Innenräume. **Keine weiteren einzelnen KI-Gemälde als Game-Maps verwenden.**

## Tief recherchierte technische Grundlagen

- Game Boy DMG: 8×8-Hintergrundmuster, 2 Bit pro Pixel und exakt vier Farbstufen.
- Figuren und Hindernisse in 16×16-Logikblöcken aufgeteilt, mit 8×8-Untermustern.
- Vorlage Gen I Rot/Blau: Alabastia ≈ 20×18 16px-Rasterpositionen; allgemeines Haus innen ≈ 8×8; Laden ≈ 8×8; Heilstation ≈ 14×8. Das sind **Zielgrößen**, keine gesetzlich geschützten Kartenlayouts.
- Ein Map-Blocksystem, dieselben Fenster, Bücherregale, Hausdächer und Theken in der ganzen Welt. Unaufgeregtes Design ist ein Vorteil.
- Beispiele analysiert: Alabastia, Route 1, Haus und Labors, Pokémon-Laden, Heilcenter, dunkle Wälder. Diese Bilder dienen als Referenz. **Es werden keine Nintendo- oder Game-Freak-Sprites kopiert, ausgeschnitten, leicht abgeändert oder mitgeliefert.**

Quellen:
- https://www.peterhajas.com/blog/pokemon_rb_map_parsing/
- https://8bitworkshop.com/docs/platforms/gameboy/index.html
- https://blakecrosley.com/blog/pixel-art-towns-on-iphone
- https://blakecrosley.com/blog/pixel-art-structures-on-iphone
- https://www.spriters-resource.com/game_boy_gbc/pokemonredblue/ (Ansicht als Studienreferenz, nicht als Asset-Quelle)

Echte alternative frei nutzbare Assets nach Quellenlizenz:
- stealthix, **CC0**: https://opengameart.org/content/4-colour-interior-tileset
- stealthix, **CC0**: https://opengameart.org/content/4-colour-overworld-tileset
- GibbonGL, **CC0**: https://gibbongl.itch.io/modular-game-boy-houses
- Oul Studio, **CC0**: https://oul-studio.itch.io/gameboy-style-top-down-interiors

## Feste Regeln, künftig nicht mehr wechseln

1. **Vier Graustufen:** #f4f4ef, #c7c8c4, #777a7b, #24262b. Eine einzige Palette für die gesamte Basiswelt.
2. **Raster:** 16×16 Rasterpositionen für Spiel und Kollision; echte Grafikobjekte lassen sich aus 8×8 Mustern zusammensetzen.
3. **Kleine Innenräume:** möglichst 8×8 bis 14×9, größere Storyräume nur wenn funktional notwendig.
4. **39 Standardgrafikbausteine:** Häuser, Baum, Busch, Zaun, Gras, Wasser, Regal, Theke, Bett, Computer, Heilgerät, Esse, Amboss, Tisch, Arbeitstisch, Kisten, Figuren.
5. **Ein Standardhaus ist willkommen:** maximal drei Grundrisse und austauschbare Fenster, Dach- und Türdetails.
6. **Begehbarkeit bestimmt den Grundriss:** ein Haus hinter einem Zaun wird nur über den vorgesehenen Weg erreicht; keine zufälligen Schlangenwege.
7. **Außenwelt ohne grafische Boden-Zwangswege:** freie weiße Flächen; Baumreihen, Zäune und Gras definieren die Route.
8. **Innenraum mit Dienst-Erkennung:** Laden = Regal/Theke, Heilort = Tresen/Heilgerät, Teamtausch = Computer, Schmiede = Esse/Amboss.
9. **Wasser unterscheidet sich durch Wellenanimation; hohes Gras durch feste Büschelform.**
10. **Kein verwaschenes Pixelbild:** Nearest Neighbor, keine glatten Schatten, Farbläufe, 3D-Licht oder KI-Gemälde.
11. **Kollision, NPCs, Story und Speicherstände müssen unverändert erreichbar bleiben.** Bei Kartenverkleinerung sind alte Speicherkoordinaten ausdrücklich zu migrieren.
12. **Erst Grafiksystem abnehmen, dann weitere Karten umbauen.** Kein „60 fertig“ nach einem bloßen Palette-Filter.

## Tatsächlich gebaut

- \`project/assets/gb-classic/gb_classic_atlas.png\`: 39 eigene, wiederverwendbare, monochrome 16px-Kacheln, PNG.
- \`project/assets/gb-classic/tile_manifest.json\`: Namen, Palette, Kollision pro Objekt.
- \`project/assets/gb-classic/scene_maps.json\`: sieben echte Tilemaps samt separaten blockierten Feldern.
- \`project/tools/gb-kit/build_kit.py\`: reproduzierbarer Asset-Builder, gleiche Quelle für alle Karten.
- \`project/tools/gb-kit/build_preview.py\`: eigenständiger Pixel-Canvas mit Tastatur- und Touchsteuerung, animiertem Wasser, Türen und Kartenwechsel.
- \`docs/gb-classic/GB_4_FARBTILES_3X.png\`: Kachelsammlung als großes Bild.
- \`docs/gb-classic/ALLE_7_REFERENZKARTEN.png\`: sieben kompakte Musterkarten.
- \`docs/gb-classic/klassik-demo.html\`: mobiler spielbarer Stilvergleich aus denselben Tiles und Kollisionsdaten.
- \`project/tests/gb-classic-kit.cjs\`: prüft stabilen Assetumfang, Größen, Objektidentität, Erreichbarkeit und Türen.
- \`project/qa/gb-classic-browser.py\`: echter Chrome-Browsertest mit Touchbuttons, Tastatur, Screenshot und JS-Fehlerprüfung.

## Status / Sicherer nächster Schritt

**Noch nicht die Hauptspielgrafik.** Der Stiltest bleibt auf einem getrennten Feature-Branch und verändert kein bestehendes Spiel, keine APK und keine Save-Daten. Nach Freigabe dieses Baukastens wird zuerst **eine reale Storykarte** in die Laufzeit integriert, mit unveränderten Questpunkten und echten begehbaren Kollisionen. Danach werden die übrigen Maps umgestellt. Die zuletzt entwickelten großen 45×30 Schmiedebilder dürfen die gemeinsame Grafikpalette nicht verwässern.

Die sieben Beispielkarten sind **keine Behauptung, dass alle 60 Karten schon umgesetzt wären**. Sie testen verbindliche Wiederverwendung und gut lesbare Raumtypen.

## V2 · Kamera und plattformgerechte Bedienung (09.11.2026)

- **Originale Palette bleibt eingefroren:** vier Graustufen und **39** Kacheln.
- **Nur minimale Sprite-Verbesserung:** Spielerfigur klarere Mütze, Rucksack und Füße; Schmiede-Esse und Amboss mit besserer Silhouette. Keine neuen Farben, keine zusätzlichen Objekte.
- **Kamera folgt der Spielfigur:** Canvas zeichnet statt der gesamten Welt nur den tatsächlichen Ausschnitt, geklemmt an den Kartenrändern. Im Innenraum bleibt eine feste Kameragröße mit erkennbar vergrößerten Möbeln.
- **Handy:** standardmäßig 10×9 Felder, komfortables Touch-Steuerkreuz mit gedrückt halten und Aktionstaste A.
- **TV:** standardmäßig 16×9 Felder, Gamepad API für linkes Analogkreuz/Steuerkreuz, A, B und Start; mobile Steuerung in TV-Breitbild ausgeblendet.
- **Auto-Anpassung:** Größe und Orientierung erkannt; optionaler Umschalter Handy / TV für Tests, Vollbild im Browser bei Unterstützung.
- **PC:** Pfeiltasten und WASD, Enter/Z/Aktion, P/Escape/Pause; Nearest-Neighbor-Pixel.
- **Interaktion:** Schilder, Charaktere und Objekte können mit A/Enter untersucht werden. Türen verbinden die Beispielkarten.
- **Tests:** `node tests/gb-classic-kit.cjs`; `python qa/gb-classic-browser.py` mit mobilem Chrome-Viewport und emuliertem TV-Controller, Kameraposition, Pixelgröße, Tastatur- und Touch-Bewegung sowie ohne JS-Fehler.
- **Einschränkung:** Dies bleibt eine **eigenständige Spielgrafik-Vorschau**. Controller wurde im Browser simuliert, nicht an einem echten Smart-TV geprüft. Die endgültige Hauptspiel-Integration ist separat zu erledigen; keine Änderungen an gespeicherten Spielständen oder der APK.

Die Demo befindet sich in `docs/gb-classic/klassik-demo.html`. Die Screenshots `GB_PHONE_REAL_BROWSER.png`, `GB_TV_REAL_BROWSER.png` und `GB_INTERIOR_REAL_BROWSER.png` stammen aus dem aktuellen Browserrenderer.
