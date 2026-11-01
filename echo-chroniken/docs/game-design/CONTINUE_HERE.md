# CONTINUE HERE – genau hier am Spiel weiterbauen

Stand: 01.11.2026. Branch main. **Letzter auf GitHub bestätigter Release: v0.17.0** (Commit 2c8140f). Der neue Code fuer v0.18.0 mit spielbarem Kapitel 3 ist lokal auf Laptop Laura getestet; **GitHub-Release erst nach CI bestaetigen**. Vor jeder Arbeit neuen HEAD lesen.

## Erledigt im heutigen Ausbau
- M01-04: Bereits zuvor abgeschlossene EncounterRegistry bleibt in v0.18.0 erhalten.
- M01-05: Sichere bidirektionale Kartenportale mit Spawnpunkten, Sperrflags, Netzwerkvalidierung und tatsaechlicher Bewegung ueber D-Pad/Touch implementiert.
- M02-01: Vier neue begehbare Maps (Nordufer, Nebelhafen, Pumpwerk, Kontrollraum) an Wurzelheim angebunden.
- M02-02: Pumpwerk mit Strompult, Ventilen und Rotor; Zustand im Save gespeichert.
- Erste Kapitel-3-Storymechanik: Sera, drei Zeugen, Pumpenwaechter als Kampf, Tonaufnahme, Wartungsmarke, einmalige Belohnung.
- Eigene gewichtet validierte Basiswesen-Tabellen an Nordufer und Hafen (65/95/109/112) mit sanfter Levelkurve.
- Zusatztile/Sprites fuer Hafen (Haeuser, Steg, Boot, Laternen), Pumpwerk und Kontrollraum.
- Node-Tests fuer 8 reversible Portale, Sperren, alle Interaktionspunkte, Boss-/Loot-Flags, Save-Roundtrip bestanden.
- Echte Headless-Chrome-Renderings aller fuenf Kartenansichten ohne JS-Fehler erzeugt: docs/visual-audit/chapter3_0.png bis chapter3_4.png.
- Alle 18 bisherigen Node-Tests erneut grün. Android-Release v0.18.0 nach CI pruefen.

## NAECHSTE ENTWICKLUNGSAUFGABEN
1. GitHub Actions Android-Build fuer v0.18.0 bestaetigen und direkt installierbare signierte APK abrufen; stabile App-ID de.echochroniken.game.stable und gleiches Schluesselmaterial.
2. M01-06/M02-05: Echte Screenshots durchlaufen, Pfad von Kapitel 2 bis Kapitel 3 mit Controller/Touch testen; Kollision und Speicherstand auf Android-Handy und TV pruefen. Kein echter Hardwaretest behaupten, solange er nicht durchgefuehrt ist.
3. M02-03 ausbauen: bessere Zeugen-Dialoge, Sequenzen, Tonarchiv-Inszenierung, Quest-/Journal-Lesbarkeit und Szenen aus CH03. Das jetzt funktionierende Kapitel ist ein **erster spielbarer Slice**, nicht die vollstaendige filmische Kapitelinszenierung.
4. M02-04: Kael-Alt-Arena nach Migrationsplan sinnvoll in Nebelhafen integrieren, ohne alte Orden/Positionen zu brechen. Begegnungsbalance mit echten Spieldurchlaeufen nachstellen.
5. Kapitel 4 / Echo-Bahn (M03-01 ff.) mit Rueckwegen, Bahnständen und Weltgraph beginnen. Danach Kapitel 5 bis 14.

## Unverrueckbare Regeln
- Kapitel 4–14 und Echo-Bahn sind **noch nicht spielbar**.
- IDs 1–150, Miora 1→2→3 bei Lv 8/15, alte 3 Orden, alle vorhandenen Save-Flags und App-ID beibehalten.
- Echte Featuretests und Screenshots nach jedem Schritt. PRODUCTION_TASKS.csv, CHANGELOG.md, diese Datei und GitHub-Commit gemeinsam aktualisieren.
- Kein ersetztes APK mit wechselnder Debug-Signatur. Alte Saves erhalten.

## In neuem Chat lesen
00_INDEX.md, STORY_BIBLE.md, PRODUCTION_TASKS.csv, CHAPTERS/CH03.md, CHAPTERS/CH04.md,
WORLD_GRAPH.json, src/maps/registry.js, src/maps/chapter3.js, tests/chapter3.cjs,
dann Git-HEAD, GitHub Actions Status und aktuellen Android Build.
