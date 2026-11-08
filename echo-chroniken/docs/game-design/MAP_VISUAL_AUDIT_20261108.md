# Echo-Chroniken: vollständiger Karten-Sichtaudit, Korrekturdurchlauf V3

Stand 08.11.2026. Nutzerfeedback: Die bisherigen 60 Maps wirken teils unlogisch, nicht wie absichtlich gestaltete RPG-Spielwelten. **Dieser Pass ist nicht die endgültige Abnahme aller 60 Karten.**

## Tatsächlicher Befund an den echten Spielbildern
Die 4×15-Übersicht wurde am 08.11. aus dem echten Browser-Spielrenderer verglichen. Die Fehler sind systemisch:

- Viele der 57 automatisch aufgeblasenen Karten waren nahezu identische Rechtecke.
- Innenräume: riesige, funktionslose graue Flächen, dünne Wände, kaum erkennbare Raumaufteilung.
- Naturgebiete: zufällig verstreutes Gras und Bäume ohne landschaftliche Logik.
- Späte Gebiete: wechselnde Farbe, aber identische Straßenschleifen und Innenraumpläne.
- Alle sechs Bonuswiesen: fast dieselben Waldstücke und Wege.
- Gebäude sehen in manchen Gebieten wie kleine Blockquadrate ohne Zweck aus.
- Kartenübergänge sind technisch rückwärts erreichbar, aber noch nicht überall optisch nahtlos.

## In V3 am Spielcode umgesetzt
1. Die 57 erweiterten Karten bekommen eine zweite, biombasierte Kartengestaltung. **Nicht nur die angehängten Ränder, auch die ursprünglichen sicheren Böden** werden strukturiert.
2. Wege werden zwischen ursprünglichem Kern, Erweiterungen, Spawn- und Ausgangspunkten gelegt. Mauern, Questobjekte und Wasser bleiben als Hindernisse respektiert.
3. Wald, Wildgras, Felsen, Fluss-/Teichzonen und Stadtplätze bestehen aus größeren zusammenhängenden Formen statt gleichmäßigem Rauschen.
4. Innenbereiche bekommen sechs variierende Raumpläne mit Nebenräumen, Türen und freien Achsen. Stationen, Archive/Bibliotheken, Höhlen und Resonanzbereiche erhalten funktional begründete zusätzliche Formen.
5. Die sechs Postgame-Wiesen erhalten unterschiedliche Geländeformen und feste charakteristische Sonderzonen, einschließlich Lichtung, Wasser- und Steinkreisen.
6. Der echte Spielrenderer zeigt zusammenhängende 16px-Boden- und Wegpaletten und rendert sie **vor** Spielfiguren und Questobjekten. Wände/Wasser bleiben separat.
7. Die ursprünglichen drei kuratierten Karten (Wurzelheim, Nordufer, Nebelhafen) bleiben als sichere Grundlage erhalten. Wurzelheims separate Grafiküberarbeitung liegt in PR #48.
8. Der Screenshot-Exporter wurde an das neuere Vordergrund-/Graslayer-Rendering angepasst und exportiert alle 60 Karten.

## Reale Nachweise
- 60 Karte-Registrierungen; 57 erhalten den neuen Kompositionsdurchlauf.
- 118 Ausgänge, 125 Spawns und 238 Quest-/NPC-Punkte weiterhin erreichbar.
- Kapitel 3 bis Postgame: bisherige Registry-/Storytests erfolgreich.
- Neuer Test `tests/world-design-coherence-v3.cjs`: 57 Layouts, mindestens fünf Biome, sechs Raumlayout-Varianten und sechs unterschiedliche Bonuswiesen geprüft.
- Echte Chrome-Exportbilder aller 60 Karten erneut erstellt, ohne JavaScript-Fehler.
- Die unveränderten Ursprungsbilder wurden bewusst nicht überschrieben. Neuer Preview-Ordner: `docs/map-redesign-v3-preview/`.

## Was noch offen ist und nicht als abgeschlossen gelten darf
- 60 individuelle, manuell artgerichtete und gestaltete Karten mit eindeutigem Zweck statt sechs Wiederholungsvarianten.
- Eigene Möbel/Architektur/Objekt-Sprites für Bahnhöfe, Werkstätten, Archive, Maschinenräume, Städte und Dungeons.
- Visuell nahtlose Übergänge an exakt derselben X/Y-Querschnittsposition, nicht nur reversible Portale.
- Vollständige Spieltests mit normalem Team, Kämpfen, langen Wegen und manuellem Erkunden. Die hier ausgeführten Registrytests ersetzen keine Spielerabnahme.
- Änderungsvorschläge aus dem Spielcode müssen getrennt und sicher in die SOULS-Editor-Karten übernommen werden. Der veröffentlichte V2-Editor zeigt **nicht automatisch** den V3-Spielbranch.

## Nächste Qualitätsschleife
Pro Karte: 1) Screenshot der ganzen Karte, 2) tatsächlichen Laufweg durchspielen, 3) Gebäude-/Raumzweck prüfen, 4) Sackgassen und Portalgeometrie prüfen, 5) Gestaltung der Sichtachsen nachbessern, 6) Screenshot freigeben. Nicht alle 60 mit einem Filter als fertig markieren.
